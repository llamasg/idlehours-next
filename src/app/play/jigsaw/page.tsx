'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import JigsawCanvas from './components/JigsawCanvas'
import {
  type PieceState,
  type Cluster,
  generatePuzzleGrid,
  checkSnap,
  mergeClusters,
  movePiecesInCluster,
  isPuzzleComplete,
  isAtCorrectPosition,
  getClusterPieceIds,
} from '@/lib/jigsawUtils'
import { CELL_SIZE } from '@/lib/jigsawShapes'
import LobbyPanel from './components/LobbyPanel'

// ─── Constants ────────────────────────────────────────────────────────────────

const TARGET_PIECES = 100 // aim for roughly this many pieces
const STORAGE_KEY = 'jigsaw_save'
const PUZZLE_IMAGE_SRC = '/images/jigsaw/jigsaw_image.png'

/**
 * Derive grid dimensions from image aspect ratio targeting ~TARGET_PIECES.
 */
function deriveGrid(imgW: number, imgH: number) {
  const aspect = imgW / imgH
  // rows * cols ≈ TARGET_PIECES, cols/rows ≈ aspect
  // cols = aspect * rows, aspect * rows² ≈ TARGET_PIECES
  const rows = Math.round(Math.sqrt(TARGET_PIECES / aspect))
  const cols = Math.round(rows * aspect)
  return { cols, rows, total: cols * rows }
}

// ─── Toast type ───────────────────────────────────────────────────────────────

interface Toast {
  id: string
  text: string
  icon: string
}

// ─── Save / Load helpers ─────────────────────────────────────────────────────

interface SaveData {
  pieces: PieceState[]
  clusters: Cluster[]
  isComplete: boolean
  cols: number
  rows: number
}

function saveState(pieces: PieceState[], clusters: Cluster[], isComplete: boolean, cols: number, rows: number) {
  try {
    const data: SaveData = { pieces, clusters, isComplete, cols, rows }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage full or unavailable — silently fail
  }
}

function loadState(expectedCols: number, expectedRows: number): SaveData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as SaveData
    // Validate it matches our current grid dimensions
    if (data.cols !== expectedCols || data.rows !== expectedRows) return null
    if (data.pieces?.length !== expectedCols * expectedRows) return null
    return data
  } catch {
    return null
  }
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function JigsawPage() {
  const [pieces, setPieces] = useState<PieceState[]>([])
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [gridSize, setGridSize] = useState({ cols: 0, rows: 0 })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [previewPinned, setPreviewPinned] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [showLobby, setShowLobby] = useState(false)

  // Refs for latest state in callbacks
  const piecesRef = useRef(pieces)
  piecesRef.current = pieces
  const clustersRef = useRef(clusters)
  clustersRef.current = clusters
  const gridRef = useRef(gridSize)
  gridRef.current = gridSize

  // Preview drag state
  const previewRef = useRef<HTMLDivElement>(null)
  const previewDragRef = useRef<{
    dragging: boolean
    startX: number
    startY: number
    startPosX: number
    startPosY: number
  }>({ dragging: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0 })
  const [previewPos, setPreviewPos] = useState({ x: 16, y: 16 })
  const [previewSize, setPreviewSize] = useState({ w: 240, h: 180 })

  // Track whether we've initialised (to avoid saving empty state)
  const initialisedRef = useRef(false)

  // ── Initialize puzzle (load image → derive grid → restore or generate) ──

  useEffect(() => {
    const img = new Image()
    img.src = PUZZLE_IMAGE_SRC
    img.onload = () => {
      const { cols, rows } = deriveGrid(img.naturalWidth, img.naturalHeight)
      setGridSize({ cols, rows })

      const saved = loadState(cols, rows)
      if (saved) {
        setPieces(saved.pieces)
        setClusters(saved.clusters)
        setIsComplete(saved.isComplete)
      } else {
        const { pieces: p, clusters: c } = generatePuzzleGrid(cols, rows)
        setPieces(p)
        setClusters(c)
      }

      // Centre the target zone in the canvas viewport
      const targetW = cols * CELL_SIZE
      const targetH = rows * CELL_SIZE
      const sidebarW = 240
      const canvasW = window.innerWidth - sidebarW - 32
      const canvasH = window.innerHeight - 120 - 32
      setPan({
        x: (canvasW - targetW) / 2,
        y: (canvasH - targetH) / 2,
      })
      initialisedRef.current = true
    }
  }, [])

  // ── Persist state to localStorage on changes ───────────────────────────

  useEffect(() => {
    if (!initialisedRef.current || pieces.length === 0) return
    saveState(pieces, clusters, isComplete, gridSize.cols, gridSize.rows)
  }, [pieces, clusters, isComplete, gridSize])

  // ── Toast helper ──────────────────────────────────────────────────────────

  const addToast = useCallback((icon: string, text: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`
    setToasts(prev => [...prev, { id, icon, text }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 1500)
  }, [])

  // ── Piece count (placed = pieces in clusters with size > 1) ───────────────

  const totalPieces = gridSize.cols * gridSize.rows

  const placedCount = pieces.filter(p => p.locked).length

  // ── Zoom controls ─────────────────────────────────────────────────────────

  const handleZoomIn = useCallback(() => {
    setZoom(z => Math.min(4, z * 1.2))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(z => Math.max(0.25, z / 1.2))
  }, [])

  // ── Piece movement ────────────────────────────────────────────────────────

  const handlePiecesMove = useCallback(
    (pieceIds: string[], deltaX: number, deltaY: number) => {
      setPieces(prev => {
        // Collect all cluster IDs for moved pieces so entire clusters move
        const movedClusterIds = new Set<string>()
        for (const pid of pieceIds) {
          const p = prev.find(pc => pc.id === pid)
          if (p) movedClusterIds.add(p.clusterId)
        }
        return prev.map(p =>
          movedClusterIds.has(p.clusterId) && !p.locked
            ? { ...p, x: p.x + deltaX, y: p.y + deltaY }
            : p,
        )
      })
    },
    [],
  )

  // ── Piece release / snap ──────────────────────────────────────────────────

  const handlePieceRelease = useCallback(
    (pieceId: string) => {
      let currentPieces = piecesRef.current
      let currentClusters = clustersRef.current
      const piece = currentPieces.find(p => p.id === pieceId)
      if (!piece) return

      const clusterPieceIds = getClusterPieceIds(currentPieces, pieceId)

      // 1. Try neighbour-based clustering (for convenience — keeps groups together)
      for (const cpId of clusterPieceIds) {
        const cp = currentPieces.find(p => p.id === cpId)
        if (!cp) continue

        const snap = checkSnap(cp, currentPieces, gridRef.current.cols, gridRef.current.rows)
        if (!snap) continue

        const targetPiece = currentPieces.find(p => p.id === snap.targetPieceId)
        if (!targetPiece || targetPiece.clusterId === cp.clusterId) continue

        const deltaX = snap.snapX - cp.x
        const deltaY = snap.snapY - cp.y

        currentPieces = movePiecesInCluster(currentPieces, cp.clusterId, deltaX, deltaY)
        const result = mergeClusters(currentClusters, currentPieces, cpId, snap.targetPieceId)
        currentPieces = result.pieces
        currentClusters = result.clusters
        break
      }

      // 2. Check each piece for absolute correct position → lock
      let didLock = false
      currentPieces = currentPieces.map(p => {
        if (p.locked) return p
        if (isAtCorrectPosition(p)) {
          didLock = true
          return { ...p, x: p.col * CELL_SIZE, y: p.row * CELL_SIZE, locked: true }
        }
        return p
      })

      setPieces(currentPieces)
      setClusters(currentClusters)
      piecesRef.current = currentPieces
      clustersRef.current = currentClusters

      if (didLock) {
        addToast('\u{1F9E9}', 'Piece placed')
      }

      if (isPuzzleComplete(currentPieces)) {
        setIsComplete(true)
        addToast('\u{1F3C6}', 'Puzzle complete!')
      }
    },
    [addToast],
  )

  // ── Preview drag handlers ─────────────────────────────────────────────────

  const handlePreviewPointerDown = useCallback((e: React.PointerEvent) => {
    previewDragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: previewPos.x,
      startPosY: previewPos.y,
    }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [previewPos])

  const handlePreviewPointerMove = useCallback((e: React.PointerEvent) => {
    if (!previewDragRef.current.dragging) return
    const ref = previewDragRef.current
    setPreviewPos({
      x: ref.startPosX + (e.clientX - ref.startX),
      y: ref.startPosY + (e.clientY - ref.startY),
    })
  }, [])

  const handlePreviewPointerUp = useCallback((e: React.PointerEvent) => {
    previewDragRef.current.dragging = false
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      // Already released
    }
  }, [])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />

      {/* Jigsaw Header Bar */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{ background: '#3D2E1A', height: 48 }}
      >
        {/* Left: back link */}
        <Link
          href="/play"
          className="flex items-center gap-1.5 text-sm text-[#F5EDE0] hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12L6 8L10 4" />
          </svg>
          Back
        </Link>

        {/* Centre: title */}
        <span className="font-heading uppercase tracking-wider text-sm font-semibold text-[#F5EDE0]">
          Jigsaw
        </span>

        {/* Right: piece count, zoom, preview */}
        <div className="flex items-center gap-3">
          {/* Piece count */}
          <span className="text-xs text-[#D4C5A9] font-heading tabular-nums">
            {placedCount}/{totalPieces}
          </span>

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              className="w-6 h-6 flex items-center justify-center rounded text-[#F5EDE0] hover:bg-white/10 transition-colors text-sm font-bold"
              aria-label="Zoom out"
            >
              &minus;
            </button>
            <span className="text-xs text-[#D4C5A9] tabular-nums w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="w-6 h-6 flex items-center justify-center rounded text-[#F5EDE0] hover:bg-white/10 transition-colors text-sm font-bold"
              aria-label="Zoom in"
            >
              +
            </button>
          </div>

          {/* Preview toggle */}
          <button
            onClick={() => setShowPreview(v => !v)}
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
              showPreview || previewPinned
                ? 'bg-amber-600/40 text-white'
                : 'text-[#D4C5A9] hover:bg-white/10'
            }`}
            aria-label="Toggle preview"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
              <circle cx="8" cy="8" r="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main area: sidebar + canvas */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar toggle tab */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          className="absolute top-3 z-20 w-5 h-10 flex items-center justify-center rounded-r transition-all"
          style={{
            left: sidebarOpen ? 240 : 0,
            background: '#E8DCC8',
            borderLeft: '1px solid rgba(0,0,0,0.1)',
          }}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="#6B5C42"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: sidebarOpen ? 'rotate(180deg)' : undefined }}
          >
            <path d="M3 1L7 5L3 9" />
          </svg>
        </button>

        {/* Collapsible Sidebar */}
        <div
          className="shrink-0 overflow-hidden border-r border-border/60 flex flex-col transition-all duration-200"
          style={{
            width: sidebarOpen ? 240 : 0,
            background: '#F5EDE0',
          }}
        >
          <div className="w-[240px] p-4 flex flex-col gap-5 h-full">
            {/* Progress */}
            <div>
              <div className="font-heading text-[10px] uppercase tracking-widest text-[#8B7355] mb-2">
                Progress
              </div>
              <div className="w-full h-2 rounded-full bg-[#D4C5A9]/50 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${totalPieces ? (placedCount / totalPieces) * 100 : 0}%`,
                    background: '#C4913A',
                  }}
                />
              </div>
              <div className="text-xs text-[#6B5C42] mt-1.5">
                {placedCount} / {totalPieces} pieces
              </div>
            </div>

            {/* Players */}
            <div>
              <div className="font-heading text-[10px] uppercase tracking-widest text-[#8B7355] mb-2">
                Players
              </div>
              <div className="flex items-center gap-2 text-sm text-[#3D2E1A]">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                You
              </div>
            </div>

            {/* Room */}
            <div>
              <div className="font-heading text-[10px] uppercase tracking-widest text-[#8B7355] mb-2">
                Room
              </div>
              <div className="font-mono text-sm text-[#3D2E1A]">PINE</div>
            </div>

            {/* New Puzzle */}
            <div>
              <button
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEY)
                  const { pieces: p, clusters: c } = generatePuzzleGrid(gridSize.cols, gridSize.rows)
                  setPieces(p)
                  setClusters(c)
                  setIsComplete(false)
                  setSelectedIds(new Set())
                  addToast('\u{2728}', 'New puzzle')
                }}
                className="w-full text-xs font-heading uppercase tracking-wider py-1.5 rounded border border-[#D4C5A9] text-[#6B5C42] hover:bg-[#E8DCC8] transition-colors"
              >
                New Puzzle
              </button>
            </div>

            {/* Multiplayer */}
            <div>
              <button
                onClick={() => setShowLobby(true)}
                className="w-full text-xs font-heading uppercase tracking-wider py-1.5 rounded text-[#F5EDE0] hover:opacity-90 transition-colors"
                style={{ background: '#6B5C42' }}
              >
                Multiplayer
              </button>
            </div>

            {/* Controls hints */}
            <div className="mt-auto text-[10px] text-[#8B7355] leading-relaxed">
              <div>Left click &mdash; drag piece</div>
              <div>Left click canvas &mdash; pan</div>
              <div>Middle click &mdash; pan</div>
              <div>Right click drag &mdash; select</div>
              <div>Scroll &mdash; zoom</div>
            </div>
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 overflow-hidden relative" style={{ background: '#3D2E1A' }}>
          <JigsawCanvas
            pieces={pieces}
            clusters={clusters}
            selectedIds={selectedIds}
            zoom={zoom}
            pan={pan}
            cols={gridSize.cols}
            rows={gridSize.rows}
            onPanChange={setPan}
            onZoomChange={setZoom}
            onPiecesMove={handlePiecesMove}
            onPieceRelease={handlePieceRelease}
            onSelectionChange={setSelectedIds}
          />

          {/* Toasts */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none">
            {toasts.map(toast => (
              <div
                key={toast.id}
                className="rounded-full px-4 py-1.5 text-sm font-medium shadow-lg pointer-events-none whitespace-nowrap"
                style={{
                  background: '#3D2E1A',
                  color: '#F5EDE0',
                  animation: 'gs-toast-in 0.25s ease-out',
                }}
              >
                {toast.icon} {toast.text}
              </div>
            ))}
          </div>

          {/* Reference Image Popup */}
          {(showPreview || previewPinned) && (
            <div
              ref={previewRef}
              className="absolute z-20 rounded-lg shadow-xl overflow-hidden"
              style={{
                left: previewPos.x,
                top: previewPos.y,
                width: previewSize.w,
                height: previewSize.h,
                minWidth: 200,
                minHeight: 150,
                maxWidth: 600,
                maxHeight: 450,
                resize: 'both',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Title bar */}
              <div
                className="flex items-center justify-between px-3 py-1.5 cursor-move select-none shrink-0"
                style={{ background: '#3D2E1A' }}
                onPointerDown={handlePreviewPointerDown}
                onPointerMove={handlePreviewPointerMove}
                onPointerUp={handlePreviewPointerUp}
              >
                <span className="font-heading text-[10px] uppercase tracking-widest text-[#D4C5A9]">
                  Preview
                </span>
                <div className="flex items-center gap-1">
                  {/* Pin button */}
                  <button
                    onClick={() => setPreviewPinned(v => !v)}
                    className={`w-5 h-5 flex items-center justify-center rounded text-xs transition-colors ${
                      previewPinned ? 'text-amber-400' : 'text-[#8B7355] hover:text-[#D4C5A9]'
                    }`}
                    aria-label={previewPinned ? 'Unpin preview' : 'Pin preview'}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill={previewPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2">
                      <path d="M7.5 1.5L10.5 4.5L8 7L9 10.5L6 7.5L3 10.5L4 7L1.5 4.5L4.5 1.5L7.5 1.5Z" />
                    </svg>
                  </button>
                  {/* Close button */}
                  <button
                    onClick={() => {
                      setShowPreview(false)
                      if (!previewPinned) setPreviewPinned(false)
                    }}
                    className="w-5 h-5 flex items-center justify-center rounded text-[#8B7355] hover:text-[#D4C5A9] transition-colors"
                    aria-label="Close preview"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M2 2L8 8M8 2L2 8" />
                    </svg>
                  </button>
                </div>
              </div>
              {/* Body — actual puzzle image */}
              <div className="flex-1 overflow-hidden" style={{ background: '#E8DCC8' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PUZZLE_IMAGE_SRC}
                  alt="Puzzle reference"
                  className="w-full h-full"
                  style={{ objectFit: 'contain' }}
                  draggable={false}
                />
              </div>
            </div>
          )}

          {/* Multiplayer lobby modal */}
          {showLobby && <LobbyPanel onClose={() => setShowLobby(false)} />}

          {/* Completion overlay — dismissable */}
          {isComplete && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40">
              <div
                className="rounded-2xl p-8 text-center shadow-2xl"
                style={{ background: '#F5EDE0', maxWidth: 360 }}
              >
                <div className="text-4xl mb-3">{'\u{1F3C6}'}</div>
                <h2 className="font-heading text-xl font-bold text-[#3D2E1A] mb-2">
                  Puzzle Complete!
                </h2>
                <p className="text-sm text-[#6B5C42] mb-5">
                  All {totalPieces} pieces connected. Nice work.
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/play"
                    className="inline-block rounded-full px-6 py-2 text-sm font-medium text-[#F5EDE0] transition-colors"
                    style={{ background: '#3D2E1A' }}
                  >
                    Back to Play
                  </Link>
                  <button
                    onClick={() => setIsComplete(false)}
                    className="text-xs text-[#8B7355] hover:text-[#3D2E1A] transition-colors"
                  >
                    Keep looking
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
