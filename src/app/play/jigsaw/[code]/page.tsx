'use client'

export const dynamic = 'force-dynamic'

import { use, useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import JigsawCanvas from '../components/JigsawCanvas'
import RemoteCursors from '../components/RemoteCursors'
import NamePopup from '../components/NamePopup'
import {
  type PieceState,
  type Cluster,
  checkSnap,
  mergeClusters,
  movePiecesInCluster,
  isPuzzleComplete,
  isAtCorrectPosition,
  getClusterPieceIds,
  deriveClusters,
} from '@/lib/jigsawUtils'
import { CELL_SIZE } from '@/lib/jigsawShapes'
import { supabase } from '@/lib/supabase'
import { useGuestId } from '../hooks/useGuestId'
import { useRoom } from '../hooks/useRoom'
import { usePieceSync, type PieceMoveBroadcast } from '../hooks/usePieceSync'
import { usePresence } from '../hooks/usePresence'

// ─── Toast type ───────────────────────────────────────────────────────────────

interface Toast {
  id: string
  text: string
  icon: string
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function JigsawRoomPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = use(params)
  const roomCode = code.toUpperCase()
  const router = useRouter()

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
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)

  // Track which pieces are currently being dragged locally
  const [localDraggingIds, setLocalDraggingIds] = useState<Set<string>>(new Set())
  const localDraggingIdsRef = useRef(localDraggingIds)
  localDraggingIdsRef.current = localDraggingIds

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

  const initialisedRef = useRef(false)

  // Cursor position overrides (from pieces_moving broadcast)
  const [cursorOverrides, setCursorOverrides] = useState<Map<string, { x: number; y: number }>>(new Map())
  const overrideClearTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Cleanup override timers on unmount
  useEffect(() => {
    return () => {
      for (const timer of overrideClearTimers.current.values()) {
        clearTimeout(timer)
      }
    }
  }, [])

  // Name popup state
  const [showNamePopup, setShowNamePopup] = useState(true)

  // ── Guest identity ──────────────────────────────────────────────────────────
  const { guestId, guestColor, guestName, displayName, setGuestName, setGuestColor } = useGuestId()

  // ── Room operations ─────────────────────────────────────────────────────────
  const { joinRoom, loadPieces, markComplete } = useRoom()

  // ── Toast helper ────────────────────────────────────────────────────────────
  const addToast = useCallback((icon: string, text: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`
    setToasts(prev => [...prev, { id, icon, text }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 1500)
  }, [])

  // ── Remote piece updates (DB — drag-end / snap) ───────────────────────────
  const handleRemoteUpdates = useCallback(
    (updates: Array<{ pieceId: string; x: number; y: number; clusterId: string; updatedBy: string | null }>) => {
      setPieces(prev => {
        const next = [...prev]
        for (const u of updates) {
          // Skip pieces we're currently dragging
          if (localDraggingIdsRef.current.has(u.pieceId)) continue
          const idx = next.findIndex(p => p.id === u.pieceId)
          if (idx !== -1) {
            const updated = { ...next[idx], x: u.x, y: u.y, clusterId: u.clusterId }
            updated.locked = isAtCorrectPosition(updated, 0.5)
            next[idx] = updated
          }
        }
        // Rebuild clusters from updated pieces
        const newClusters = deriveClusters(next)
        setClusters(newClusters)

        // Check completion
        if (isPuzzleComplete(next)) {
          setIsComplete(true)
        }

        return next
      })

      // Show toast for remote snap (cluster change implies snap)
      const snapUpdates = updates.filter(u => u.updatedBy)
      if (snapUpdates.length > 0) {
        const who = snapUpdates[0].updatedBy?.replace('guest_', '') || 'Someone'
        addToast('\u{1F9E9}', `${who} placed a piece`)
      }
    },
    [addToast],
  )

  // ── Remote live drag (broadcast — ephemeral, no transition) ───────────────
  const handleRemoteDragMove = useCallback(
    (msg: PieceMoveBroadcast) => {
      setPieces(prev => {
        const next = [...prev]
        for (const mp of msg.pieces) {
          const idx = next.findIndex(p => p.id === mp.piece_id)
          if (idx !== -1) {
            next[idx] = { ...next[idx], x: mp.x, y: mp.y }
          }
        }
        return next
      })

      // Override this player's cursor position to the centre of their dragged pieces
      if (msg.pieces.length > 0) {
        const avgX = msg.pieces.reduce((s, p) => s + p.x, 0) / msg.pieces.length
        const avgY = msg.pieces.reduce((s, p) => s + p.y, 0) / msg.pieces.length
        setCursorOverrides(prev => {
          const next = new Map(prev)
          next.set(msg.playerId, { x: avgX, y: avgY })
          return next
        })

        // Clear override after 300ms of no updates (drag ended, presence cursor resumes)
        const existing = overrideClearTimers.current.get(msg.playerId)
        if (existing) clearTimeout(existing)
        const timer = setTimeout(() => {
          setCursorOverrides(prev => {
            const next = new Map(prev)
            next.delete(msg.playerId)
            return next
          })
          overrideClearTimers.current.delete(msg.playerId)
        }, 300)
        overrideClearTimers.current.set(msg.playerId, timer)
      }
    },
    [],
  )

  // ── Piece sync ──────────────────────────────────────────────────────────────
  const { writePiecePositions, broadcastPieceMove } = usePieceSync({
    roomCode,
    guestId,
    guestName: displayName,
    guestColor,
    onRemoteUpdates: handleRemoteUpdates,
    onRemoteDragMove: handleRemoteDragMove,
    localDraggingIds,
  })

  // ── Presence ────────────────────────────────────────────────────────────────
  const { players, broadcastCursor } = usePresence({
    roomCode,
    guestId,
    guestColor,
    guestName: displayName,
    joined: !showNamePopup,
    onPlayerJoin: (name) => addToast('\u{1F44B}', `${name} joined`),
    onPlayerLeave: (name) => addToast('\u{1F44B}', `${name} left`),
  })

  // ── Initialize: load room + pieces from Supabase ───────────────────────────
  useEffect(() => {
    if (!guestId) return // Wait for guest ID

    async function init() {
      const room = await joinRoom(roomCode)
      if (!room) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setGridSize({ cols: room.cols, rows: room.rows })
      setIsComplete(room.isComplete)

      const result = await loadPieces(roomCode)
      if (result) {
        setPieces(result.pieces)
        setClusters(result.clusters)
        piecesRef.current = result.pieces
        clustersRef.current = result.clusters
      }

      // Centre the target zone
      const targetW = room.cols * CELL_SIZE
      const targetH = room.rows * CELL_SIZE
      const sidebarW = 240
      const canvasW = window.innerWidth - sidebarW - 32
      const canvasH = window.innerHeight - 120 - 32
      setPan({
        x: (canvasW - targetW) / 2,
        y: (canvasH - targetH) / 2,
      })

      initialisedRef.current = true
      setLoading(false)
    }

    init()
  }, [guestId, roomCode, joinRoom, loadPieces])

  // ── Periodic reconciliation (every 15s) ────────────────────────────────────
  useEffect(() => {
    if (!initialisedRef.current || !supabase || !roomCode) return

    const interval = setInterval(async () => {
      if (!supabase) return
      const { data, error } = await supabase
        .from('jigsaw_pieces')
        .select('piece_id, x, y, cluster_id')
        .eq('room_code', roomCode)

      if (error || !data) return

      setPieces(prev => {
        let changed = false
        const next = prev.map(p => {
          // Don't reconcile pieces being dragged
          if (localDraggingIdsRef.current.has(p.id)) return p

          const dbRow = (data as Array<{ piece_id: string; x: number; y: number; cluster_id: string }>)
            .find(r => r.piece_id === p.id)
          if (!dbRow) return p

          const dx = Math.abs(p.x - dbRow.x)
          const dy = Math.abs(p.y - dbRow.y)
          const clusterChanged = p.clusterId !== dbRow.cluster_id

          if (dx > 2 || dy > 2 || clusterChanged) {
            changed = true
            const updated = { ...p, x: dbRow.x, y: dbRow.y, clusterId: dbRow.cluster_id }
            updated.locked = isAtCorrectPosition(updated, 0.5)
            return updated
          }
          return p
        })

        if (changed) {
          const newClusters = deriveClusters(next)
          setClusters(newClusters)
          return next
        }
        return prev
      })
    }, 15000)

    return () => clearInterval(interval)
  }, [roomCode, loading])

  // ── Piece count ─────────────────────────────────────────────────────────────
  const totalPieces = gridSize.cols * gridSize.rows
  const placedCount = pieces.filter(p => p.locked).length

  // ── Zoom controls ───────────────────────────────────────────────────────────
  const handleZoomIn = useCallback(() => {
    setZoom(z => Math.min(4, z * 1.2))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(z => Math.max(0.25, z / 1.2))
  }, [])

  // ── Piece movement (also broadcasts live positions) ─────────────────────────
  const handlePiecesMove = useCallback(
    (pieceIds: string[], deltaX: number, deltaY: number) => {
      setPieces(prev => {
        const movedClusterIds = new Set<string>()
        for (const pid of pieceIds) {
          const p = prev.find(pc => pc.id === pid)
          if (p) movedClusterIds.add(p.clusterId)
        }
        const next = prev.map(p =>
          movedClusterIds.has(p.clusterId) && !p.locked
            ? { ...p, x: p.x + deltaX, y: p.y + deltaY }
            : p,
        )

        // Collect all piece IDs in moved clusters for broadcast
        const allMovedIds = next
          .filter(p => movedClusterIds.has(p.clusterId))
          .map(p => p.id)

        // Broadcast live positions (throttled 60ms inside hook)
        broadcastPieceMove(next, allMovedIds)

        return next
      })
    },
    [broadcastPieceMove],
  )

  // ── Track local dragging state ──────────────────────────────────────────────
  const handleSelectionChange = useCallback((ids: Set<string>) => {
    setSelectedIds(ids)
    setLocalDraggingIds(ids)
  }, [])

  // ── Piece release / snap ────────────────────────────────────────────────────
  const handlePieceRelease = useCallback(
    (pieceId: string) => {
      // Clear local dragging state
      setLocalDraggingIds(new Set())

      let currentPieces = piecesRef.current
      let currentClusters = clustersRef.current
      const piece = currentPieces.find(p => p.id === pieceId)
      if (!piece) return

      const clusterPieceIds = getClusterPieceIds(currentPieces, pieceId)
      let didSnap = false

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
        didSnap = true
        break
      }

      // 2. Check each piece for absolute correct position → lock
      let didLock = false
      const piecesToWrite = new Set<string>()
      currentPieces = currentPieces.map(p => {
        if (p.locked) return p
        if (isAtCorrectPosition(p)) {
          didLock = true
          piecesToWrite.add(p.id)
          return { ...p, x: p.col * CELL_SIZE, y: p.row * CELL_SIZE, locked: true }
        }
        return p
      })

      if (didSnap || didLock) {
        setPieces(currentPieces)
        setClusters(currentClusters)
        piecesRef.current = currentPieces
        clustersRef.current = currentClusters

        if (didLock) {
          addToast('\u{1F9E9}', 'Piece placed')
        }

        // Write affected pieces to Supabase
        const allAffectedIds = new Set([
          ...clusterPieceIds,
          ...piecesToWrite,
        ])
        writePiecePositions(currentPieces, Array.from(allAffectedIds))

        if (isPuzzleComplete(currentPieces)) {
          setIsComplete(true)
          addToast('\u{1F3C6}', 'Puzzle complete!')
          markComplete(roomCode)
        }
        return
      }

      // No snap and no lock — still write moved piece positions to sync drag-end
      writePiecePositions(currentPieces, clusterPieceIds)
    },
    [addToast, writePiecePositions, markComplete, roomCode],
  )

  // ── Canvas pointer move for cursor broadcast ────────────────────────────────
  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const container = e.currentTarget as HTMLElement
      const rect = container.getBoundingClientRect()
      const screenX = e.clientX - rect.left
      const screenY = e.clientY - rect.top
      const worldX = (screenX - pan.x) / zoom
      const worldY = (screenY - pan.y) / zoom
      broadcastCursor(worldX, worldY)
    },
    [pan, zoom, broadcastCursor],
  )

  // ── Preview drag handlers ───────────────────────────────────────────────────
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

  // ── Copy room code ──────────────────────────────────────────────────────────
  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 1500)
    })
  }, [roomCode])

  // ── Name popup handler ────────────────────────────────────────────────────
  const handleNameSubmit = useCallback((name: string, color: string) => {
    if (name) setGuestName(name)
    if (color) setGuestColor(color)
    setShowNamePopup(false)
  }, [setGuestName, setGuestColor])

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 flex items-center justify-center" style={{ background: '#3D2E1A' }}>
          <div className="text-[#D4C5A9] font-heading text-sm uppercase tracking-wider">
            Joining room {roomCode}...
          </div>
        </div>
      </div>
    )
  }

  // ── Not found state ─────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 flex items-center justify-center" style={{ background: '#3D2E1A' }}>
          <div className="text-center">
            <div className="text-4xl mb-3">{'\u{1F50D}'}</div>
            <h2 className="font-heading text-lg font-bold text-[#F5EDE0] mb-2">
              Room not found
            </h2>
            <p className="text-sm text-[#D4C5A9] mb-4">
              No room with code &ldquo;{roomCode}&rdquo; exists.
            </p>
            <Link
              href="/play/jigsaw"
              className="inline-block rounded-full px-6 py-2 text-sm font-medium text-[#3D2E1A] transition-colors"
              style={{ background: '#F5EDE0' }}
            >
              Back to Jigsaw
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const PUZZLE_IMAGE_SRC = '/images/jigsaw/jigsaw_image.png'

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Name entry popup */}
      {showNamePopup && guestId && (
        <NamePopup
          initialName={guestName}
          guestColor={guestColor}
          onSubmit={handleNameSubmit}
        />
      )}
      <Header />

      {/* Jigsaw Header Bar */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{ background: '#3D2E1A', height: 48 }}
      >
        {/* Left: back link */}
        <Link
          href="/play/jigsaw"
          className="flex items-center gap-1.5 text-sm text-[#F5EDE0] hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12L6 8L10 4" />
          </svg>
          Back
        </Link>

        {/* Centre: title + room code */}
        <div className="flex items-center gap-2">
          <span className="font-heading uppercase tracking-wider text-sm font-semibold text-[#F5EDE0]">
            Jigsaw
          </span>
          <span className="font-mono text-xs text-[#D4C5A9] bg-white/10 rounded px-1.5 py-0.5">
            {roomCode}
          </span>
        </div>

        {/* Right: piece count, zoom, preview */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#D4C5A9] font-heading tabular-nums">
            {placedCount}/{totalPieces}
          </span>

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
              <div className="flex flex-col gap-1.5">
                {/* You */}
                <div className="flex items-center gap-2 text-sm text-[#3D2E1A]">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: guestColor }}
                  />
                  {displayName} (you)
                </div>
                {/* Remote players */}
                {players.map(p => (
                  <div key={p.guestId} className="flex items-center gap-2 text-sm text-[#3D2E1A]">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ background: p.color }}
                    />
                    {p.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Room */}
            <div>
              <div className="font-heading text-[10px] uppercase tracking-widest text-[#8B7355] mb-2">
                Room
              </div>
              <button
                onClick={copyCode}
                className="font-mono text-sm text-[#3D2E1A] hover:text-[#C4913A] transition-colors flex items-center gap-1.5"
              >
                {roomCode}
                <span className="text-[10px] text-[#8B7355]">
                  {codeCopied ? 'copied!' : 'click to copy'}
                </span>
              </button>
            </div>

            {/* Leave Room */}
            <div>
              <button
                onClick={() => router.push('/play/jigsaw')}
                className="w-full text-xs font-heading uppercase tracking-wider py-1.5 rounded border border-[#D4C5A9] text-[#6B5C42] hover:bg-[#E8DCC8] transition-colors"
              >
                Leave Room
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
        <div
          className="flex-1 overflow-hidden relative"
          style={{ background: '#3D2E1A' }}
          onPointerMove={handleCanvasPointerMove}
        >
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
            onSelectionChange={handleSelectionChange}
            remoteCursors={
              <RemoteCursors players={players} zoom={zoom} cursorOverrides={cursorOverrides} />
            }
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

          {/* Completion overlay */}
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
                  All {totalPieces} pieces connected. Nice teamwork.
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
