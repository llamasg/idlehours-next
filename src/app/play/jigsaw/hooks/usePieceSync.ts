'use client'

import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { PieceState } from '@/lib/jigsawUtils'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PieceUpdate {
  pieceId: string
  x: number
  y: number
  clusterId: string
  updatedBy: string | null
}

export interface PieceMoveBroadcast {
  type: 'pieces_moving'
  playerId: string
  playerName: string
  playerColor: string
  pieces: Array<{ piece_id: string; x: number; y: number }>
}

interface UsePieceSyncOptions {
  roomCode: string
  guestId: string
  guestName: string
  guestColor: string
  /** Called when DB updates arrive from another player (drag-end / snap). */
  onRemoteUpdates: (updates: PieceUpdate[]) => void
  /** Called when live drag broadcast arrives from another player. */
  onRemoteDragMove: (msg: PieceMoveBroadcast) => void
  /** Set of piece IDs currently being dragged locally — never overwrite these. */
  localDraggingIds: Set<string>
}

export function usePieceSync({
  roomCode,
  guestId,
  guestName,
  guestColor,
  onRemoteUpdates,
  onRemoteDragMove,
  localDraggingIds,
}: UsePieceSyncOptions) {
  const dbChannelRef = useRef<RealtimeChannel | null>(null)
  const broadcastChannelRef = useRef<RealtimeChannel | null>(null)
  const onRemoteUpdatesRef = useRef(onRemoteUpdates)
  onRemoteUpdatesRef.current = onRemoteUpdates
  const onRemoteDragMoveRef = useRef(onRemoteDragMove)
  onRemoteDragMoveRef.current = onRemoteDragMove
  const guestIdRef = useRef(guestId)
  guestIdRef.current = guestId
  const localDraggingIdsRef = useRef(localDraggingIds)
  localDraggingIdsRef.current = localDraggingIds
  const guestNameRef = useRef(guestName)
  guestNameRef.current = guestName
  const guestColorRef = useRef(guestColor)
  guestColorRef.current = guestColor

  // Buffer incoming DB updates and flush as batch
  const bufferRef = useRef<PieceUpdate[]>([])
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Throttle for piece movement broadcast (60ms, separate from cursor 80ms)
  const lastPieceBroadcastRef = useRef(0)

  useEffect(() => {
    if (!supabase || !roomCode || !guestId) return

    // ── Channel 1: DB changes (drag-end / snap positions) ──────────────────
    const dbChannel = supabase
      .channel(`pieces-db:${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jigsaw_pieces',
          filter: `room_code=eq.${roomCode}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>
          // Ignore our own updates
          if (row.updated_by === guestIdRef.current) return
          // Don't overwrite pieces we're currently dragging
          if (localDraggingIdsRef.current.has(row.piece_id as string)) return

          bufferRef.current.push({
            pieceId: row.piece_id as string,
            x: row.x as number,
            y: row.y as number,
            clusterId: row.cluster_id as string,
            updatedBy: row.updated_by as string | null,
          })

          // Flush buffer after 50ms of quiet (batch incoming updates)
          if (flushTimerRef.current) clearTimeout(flushTimerRef.current)
          flushTimerRef.current = setTimeout(() => {
            if (bufferRef.current.length > 0) {
              onRemoteUpdatesRef.current([...bufferRef.current])
              bufferRef.current = []
            }
          }, 50)
        },
      )
      .subscribe()

    dbChannelRef.current = dbChannel

    // ── Channel 2: Broadcast (live drag positions, ephemeral) ──────────────
    const broadcastChannel = supabase
      .channel(`pieces-live:${roomCode}`)
      .on('broadcast', { event: 'pieces_moving' }, ({ payload }) => {
        const msg = payload as PieceMoveBroadcast
        if (msg.playerId === guestIdRef.current) return
        // Filter out any pieces we're currently dragging locally
        const filtered = msg.pieces.filter(
          (p) => !localDraggingIdsRef.current.has(p.piece_id),
        )
        if (filtered.length > 0) {
          onRemoteDragMoveRef.current({ ...msg, pieces: filtered })
        }
      })
      .subscribe()

    broadcastChannelRef.current = broadcastChannel

    return () => {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current)
      dbChannel.unsubscribe()
      broadcastChannel.unsubscribe()
      dbChannelRef.current = null
      broadcastChannelRef.current = null
    }
  }, [roomCode, guestId])

  /**
   * Broadcast live piece positions during drag (throttled 60ms).
   * Ephemeral — no DB write.
   */
  const broadcastPieceMove = useCallback(
    (pieces: PieceState[], pieceIds: string[]) => {
      const now = Date.now()
      if (now - lastPieceBroadcastRef.current < 60) return
      lastPieceBroadcastRef.current = now

      const channel = broadcastChannelRef.current
      if (!channel) return

      const payload: PieceMoveBroadcast = {
        type: 'pieces_moving',
        playerId: guestIdRef.current,
        playerName: guestNameRef.current,
        playerColor: guestColorRef.current,
        pieces: pieceIds
          .map((id) => {
            const p = pieces.find((pc) => pc.id === id)
            if (!p) return null
            return { piece_id: p.id, x: p.x, y: p.y }
          })
          .filter(Boolean) as Array<{ piece_id: string; x: number; y: number }>,
      }

      channel.send({
        type: 'broadcast',
        event: 'pieces_moving',
        payload,
      })
    },
    [],
  )

  /**
   * Write piece positions to Supabase (DB). Call on drag-end or snap.
   * Sends ALL pieceIds in a single batch upsert.
   */
  const writePiecePositions = useCallback(
    async (pieces: PieceState[], pieceIds: string[]) => {
      if (!supabase || !roomCode) return

      const rows = pieceIds
        .map((id) => {
          const p = pieces.find((pc) => pc.id === id)
          if (!p) return null
          return {
            room_code: roomCode,
            piece_id: p.id,
            x: p.x,
            y: p.y,
            cluster_id: p.clusterId,
            shape_id: p.shapeId,
            col: p.col,
            row: p.row,
            updated_by: guestIdRef.current,
            updated_at: new Date().toISOString(),
          }
        })
        .filter(Boolean)

      if (rows.length === 0) return

      const { error } = await supabase
        .from('jigsaw_pieces')
        .upsert(rows, { onConflict: 'room_code,piece_id' })

      if (error) {
        console.error('Failed to write piece positions:', error)
      }
    },
    [roomCode],
  )

  return { writePiecePositions, broadcastPieceMove }
}
