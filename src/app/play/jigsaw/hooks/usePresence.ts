'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface RemotePlayer {
  guestId: string
  name: string
  color: string
  cursor: { x: number; y: number } | null
}

interface UsePresenceOptions {
  roomCode: string
  guestId: string
  guestColor: string
  guestName: string
  /** Whether this player has submitted the name popup and actually joined */
  joined: boolean
  onPlayerJoin?: (name: string) => void
  onPlayerLeave?: (name: string) => void
}

export function usePresence({
  roomCode,
  guestId,
  guestColor,
  guestName,
  joined,
  onPlayerJoin,
  onPlayerLeave,
}: UsePresenceOptions) {
  const [players, setPlayers] = useState<RemotePlayer[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)
  const onJoinRef = useRef(onPlayerJoin)
  onJoinRef.current = onPlayerJoin
  const onLeaveRef = useRef(onPlayerLeave)
  onLeaveRef.current = onPlayerLeave

  // Throttled cursor broadcast (separate from piece broadcast)
  const lastCursorBroadcastRef = useRef(0)

  // Debounced leave toasts — wait 4s before showing, cancel if they rejoin
  const pendingLeavesRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Track latest name and joined state for re-tracking
  const guestNameRef = useRef(guestName)
  guestNameRef.current = guestName
  const joinedRef = useRef(joined)
  joinedRef.current = joined

  useEffect(() => {
    if (!supabase || !roomCode || !guestId) return

    const channel = supabase.channel(`presence:${roomCode}`, {
      config: { presence: { key: guestId } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const remotePlayers: RemotePlayer[] = []
        for (const [key, presences] of Object.entries(state)) {
          if (key === guestId) continue
          const latest = (presences as Record<string, unknown>[])[0]
          if (!latest) continue
          // Only show players who have actually joined (submitted name popup)
          if (!latest.joined) continue
          remotePlayers.push({
            guestId: key,
            name: (latest.name as string) || key.replace('guest_', ''),
            color: (latest.color as string) || '#999',
            cursor: latest.cursor as { x: number; y: number } | null,
          })
        }
        setPlayers(remotePlayers)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (key === guestId) return
        const p = (newPresences as Record<string, unknown>[])?.[0]
        // Only toast for players who have actually joined
        if (!p?.joined) return
        const pending = pendingLeavesRef.current.get(key)
        if (pending) {
          clearTimeout(pending)
          pendingLeavesRef.current.delete(key)
        } else {
          const name = (p?.name as string) || key.replace('guest_', '')
          onJoinRef.current?.(name)
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        if (key === guestId) return
        const p = (leftPresences as Record<string, unknown>[])?.[0]
        // Only toast for players who had actually joined
        if (!p?.joined) return
        const name = (p?.name as string) || key.replace('guest_', '')
        const timer = setTimeout(() => {
          pendingLeavesRef.current.delete(key)
          onLeaveRef.current?.(name)
        }, 4000)
        pendingLeavesRef.current.set(key, timer)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            color: guestColor,
            name: guestNameRef.current,
            joined: joinedRef.current,
            cursor: null,
          })
        }
      })

    channelRef.current = channel

    return () => {
      for (const timer of pendingLeavesRef.current.values()) {
        clearTimeout(timer)
      }
      pendingLeavesRef.current.clear()
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [roomCode, guestId, guestColor])

  // Re-track when name, color, or joined state changes
  useEffect(() => {
    const channel = channelRef.current
    if (!channel) return
    channel.track({
      color: guestColor,
      name: guestName,
      joined,
      cursor: null,
    })
  }, [guestName, guestColor, joined])

  /**
   * Broadcast cursor position (throttled to 80ms, independent of piece broadcast).
   */
  const broadcastCursor = useCallback(
    (x: number, y: number) => {
      const now = Date.now()
      if (now - lastCursorBroadcastRef.current < 80) return
      lastCursorBroadcastRef.current = now

      const channel = channelRef.current
      if (!channel) return

      channel.track({
        color: guestColor,
        name: guestNameRef.current,
        joined: joinedRef.current,
        cursor: { x, y },
      })
    },
    [guestColor],
  )

  return { players, broadcastCursor }
}
