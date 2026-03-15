'use client'

import { useRef, useState, useCallback } from 'react'
import { PIECE_SHAPES, CELL_SIZE } from '@/lib/jigsawShapes'
import type { PieceState, Cluster } from '@/lib/jigsawUtils'

const PUZZLE_IMAGE = '/images/jigsaw/jigsaw_image.png'
const ARTBOARD = 100 // SVG artboard size
const OVERFLOW = (ARTBOARD - CELL_SIZE) / 2 // 15px tab overhang each side

interface JigsawCanvasProps {
  pieces: PieceState[]
  clusters: Cluster[]
  selectedIds: Set<string>
  zoom: number
  pan: { x: number; y: number }
  cols: number
  rows: number
  onPanChange: (pan: { x: number; y: number }) => void
  onZoomChange: (zoom: number, centerX?: number, centerY?: number) => void
  onPiecesMove: (pieceIds: string[], deltaX: number, deltaY: number) => void
  onPieceRelease: (pieceId: string) => void
  onSelectionChange: (ids: Set<string>) => void
  remoteCursors?: React.ReactNode
}

interface SelectRect {
  x: number
  y: number
  w: number
  h: number
}

export default function JigsawCanvas({
  pieces,
  clusters,
  selectedIds,
  zoom,
  pan,
  cols,
  rows,
  onPanChange,
  onZoomChange,
  onPiecesMove,
  onPieceRelease,
  onSelectionChange,
  remoteCursors,
}: JigsawCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectRect, setSelectRect] = useState<SelectRect | null>(null)

  const interactionRef = useRef<{
    mode: 'none' | 'pan' | 'drag' | 'select'
    startX: number
    startY: number
    lastX: number
    lastY: number
    dragPieceId: string | null
  }>({ mode: 'none', startX: 0, startY: 0, lastX: 0, lastY: 0, dragPieceId: null })

  // We need a ref for pieces/clusters/selectedIds so pointer handlers always
  // see the latest values without re-binding.
  const piecesRef = useRef(pieces)
  piecesRef.current = pieces
  const clustersRef = useRef(clusters)
  clustersRef.current = clusters
  const selectedIdsRef = useRef(selectedIds)
  selectedIdsRef.current = selectedIds
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom
  const panRef = useRef(pan)
  panRef.current = pan

  function getCursor() {
    const mode = interactionRef.current.mode
    if (mode === 'pan') return 'grabbing'
    if (mode === 'drag') return 'grabbing'
    if (mode === 'select') return 'crosshair'
    return 'default'
  }

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current
    if (!container) return

    const ix = interactionRef.current
    ix.startX = e.clientX
    ix.startY = e.clientY
    ix.lastX = e.clientX
    ix.lastY = e.clientY

    if (e.button === 2) {
      // Right click: selection rectangle
      ix.mode = 'select'
      const rect = container.getBoundingClientRect()
      setSelectRect({ x: e.clientX - rect.left, y: e.clientY - rect.top, w: 0, h: 0 })
      container.setPointerCapture(e.pointerId)
      return
    }

    if (e.button === 1) {
      // Middle click: pan
      e.preventDefault()
      ix.mode = 'pan'
      container.setPointerCapture(e.pointerId)
      return
    }

    if (e.button === 0) {
      // Left click
      const target = e.target as HTMLElement
      const pieceEl = target.closest('[data-piece-id]') as HTMLElement | null

      if (pieceEl) {
        const pieceId = pieceEl.getAttribute('data-piece-id')!
        const piece = piecesRef.current.find(p => p.id === pieceId)

        // Locked pieces cannot be dragged
        if (piece?.locked) {
          ix.mode = 'pan'
          container.setPointerCapture(e.pointerId)
          return
        }

        ix.mode = 'drag'
        ix.dragPieceId = pieceId

        // If piece not in selection, clear selection and select only this piece
        if (!selectedIdsRef.current.has(pieceId)) {
          if (piece) {
            const clusterPieceIds = piecesRef.current
              .filter(p => p.clusterId === piece.clusterId && !p.locked)
              .map(p => p.id)
            onSelectionChange(new Set(clusterPieceIds))
          } else {
            onSelectionChange(new Set([pieceId]))
          }
        }
      } else {
        ix.mode = 'pan'
      }

      container.setPointerCapture(e.pointerId)
    }
  }, [onSelectionChange])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const ix = interactionRef.current
    if (ix.mode === 'none') return

    const deltaX = e.clientX - ix.lastX
    const deltaY = e.clientY - ix.lastY

    if (ix.mode === 'pan') {
      onPanChange({
        x: panRef.current.x + deltaX,
        y: panRef.current.y + deltaY,
      })
    } else if (ix.mode === 'drag') {
      const worldDeltaX = deltaX / zoomRef.current
      const worldDeltaY = deltaY / zoomRef.current
      const ids = Array.from(selectedIdsRef.current)
      if (ids.length > 0) {
        onPiecesMove(ids, worldDeltaX, worldDeltaY)
      }
    } else if (ix.mode === 'select') {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const startScreenX = ix.startX - rect.left
      const startScreenY = ix.startY - rect.top
      const currentScreenX = e.clientX - rect.left
      const currentScreenY = e.clientY - rect.top
      setSelectRect({
        x: Math.min(startScreenX, currentScreenX),
        y: Math.min(startScreenY, currentScreenY),
        w: Math.abs(currentScreenX - startScreenX),
        h: Math.abs(currentScreenY - startScreenY),
      })
    }

    ix.lastX = e.clientX
    ix.lastY = e.clientY
  }, [onPanChange, onPiecesMove])

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const ix = interactionRef.current
    const container = containerRef.current

    if (ix.mode === 'drag' && ix.dragPieceId) {
      onPieceRelease(ix.dragPieceId)
      // Deselect all after drag ends
      onSelectionChange(new Set())
    }

    if (ix.mode === 'select' && selectRect) {
      // Convert screen rect to world coords
      const worldX = (selectRect.x - panRef.current.x) / zoomRef.current
      const worldY = (selectRect.y - panRef.current.y) / zoomRef.current
      const worldW = selectRect.w / zoomRef.current
      const worldH = selectRect.h / zoomRef.current

      const selected = new Set<string>()
      for (const piece of piecesRef.current) {
        if (piece.locked) continue
        const cx = piece.x + CELL_SIZE / 2
        const cy = piece.y + CELL_SIZE / 2
        if (cx >= worldX && cx <= worldX + worldW && cy >= worldY && cy <= worldY + worldH) {
          selected.add(piece.id)
        }
      }
      onSelectionChange(selected)
      setSelectRect(null)
    }

    ix.mode = 'none'
    ix.dragPieceId = null

    if (container) {
      try {
        container.releasePointerCapture(e.pointerId)
      } catch {
        // Already released
      }
    }
  }, [onPieceRelease, onSelectionChange, selectRect])

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const cursorX = e.clientX - rect.left
    const cursorY = e.clientY - rect.top
    const factor = e.deltaY > 0 ? 0.9 : 1.1
    const currentZoom = zoomRef.current
    const newZoom = Math.max(0.25, Math.min(4, currentZoom * factor))

    const newPanX = cursorX - (cursorX - panRef.current.x) * (newZoom / currentZoom)
    const newPanY = cursorY - (cursorY - panRef.current.y) * (newZoom / currentZoom)

    onZoomChange(newZoom)
    onPanChange({ x: newPanX, y: newPanY })
  }, [onZoomChange, onPanChange])

  const targetW = cols * CELL_SIZE
  const targetH = rows * CELL_SIZE

  return (
    <div className="relative h-full w-full p-4">
      <div
        ref={containerRef}
        className="relative h-full w-full overflow-hidden jigsaw-canvas"
        style={{
          cursor: getCursor(),
          borderRadius: '12px',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onContextMenu={e => e.preventDefault()}
      >
        {/* Selection rectangle */}
        {selectRect && selectRect.w > 0 && selectRect.h > 0 && (
          <div
            className="absolute border border-amber-400/60 bg-amber-400/10 pointer-events-none"
            style={{
              left: selectRect.x,
              top: selectRect.y,
              width: selectRect.w,
              height: selectRect.h,
            }}
          />
        )}

        {/* Transformed world */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            position: 'relative',
          }}
        >
          {/* Target zone outline — centred in the initial viewport */}
          <div
            className="pointer-events-none"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: targetW,
              height: targetH,
              border: '2px dashed rgba(107, 92, 66, 0.25)',
              borderRadius: 4,
              zIndex: 0,
            }}
          />
          {/* Remote cursors overlay */}
          {remoteCursors}

        {pieces.map(piece => {
          const shape = PIECE_SHAPES.find(s => s.id === piece.shapeId)
          if (!shape) return null
          const isSelected = selectedIds.has(piece.id)
          const isLocked = piece.locked

          return (
            <div
              key={piece.id}
              data-piece-id={piece.id}
              className={`absolute ${isLocked ? 'piece-locked' : 'piece-unlocked'}`}
              style={{
                // Offset by OVERFLOW so the 70×70 core aligns with the grid
                left: piece.x - OVERFLOW,
                top: piece.y - OVERFLOW,
                width: ARTBOARD,
                height: ARTBOARD,
                filter: isSelected
                  ? 'drop-shadow(0 0 6px rgba(196, 145, 58, 0.9))'
                  : undefined,
                zIndex: isSelected ? 20 : 2,
                cursor: isLocked ? 'default' : 'grab',
              }}
            >
              {/* Rotate mask to get correct piece shape */}
              <div
                draggable={false}
                style={{
                  width: ARTBOARD + 2,
                  height: ARTBOARD + 2,
                  margin: -1,
                  transform: `rotate(${shape.rotation}deg)`,
                  transformOrigin: 'center center',
                  WebkitMaskImage: `url(${shape.src})`,
                  maskImage: `url(${shape.src})`,
                  WebkitMaskSize: '100% 100%',
                  maskSize: '100% 100%',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  userSelect: 'none',
                  pointerEvents: 'auto',
                }}
              >
                {/* Counter-rotate image so it stays upright */}
                <div
                  style={{
                    width: ARTBOARD + 2,
                    height: ARTBOARD + 2,
                    transform: `rotate(${-shape.rotation}deg)`,
                    transformOrigin: 'center center',
                    backgroundImage: `url(${PUZZLE_IMAGE})`,
                    backgroundSize: `${targetW}px ${targetH}px`,
                    backgroundPosition: `${-(piece.col * CELL_SIZE - OVERFLOW) + 1}px ${-(piece.row * CELL_SIZE - OVERFLOW) + 1}px`,
                  }}
                />
              </div>
            </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}
