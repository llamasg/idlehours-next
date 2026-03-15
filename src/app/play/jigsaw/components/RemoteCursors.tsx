'use client'

import { useEffect, useRef } from 'react'
import type { RemotePlayer } from '../hooks/usePresence'

interface RemoteCursorsProps {
  players: RemotePlayer[]
  zoom: number
  /** Override cursor positions (e.g. from pieces_moving broadcast) */
  cursorOverrides?: Map<string, { x: number; y: number }>
}

interface CursorState {
  targetX: number
  targetY: number
  arrowX: number
  arrowY: number
  tagX: number
  tagY: number
  velX: number
  velY: number
  lastMoveTime: number
  isIdle: boolean
  el: HTMLDivElement
  tagEl: HTMLDivElement
  arrowPath: SVGPathElement
  color: string
}

function darkenHex(hex: string, factor = 0.65): string {
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * factor)
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * factor)
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * factor)
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function escapeHtml(str: string): string {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

function createCursorElement(player: RemotePlayer, x: number, y: number): {
  el: HTMLDivElement
  tagEl: HTMLDivElement
  arrowPath: SVGPathElement
} {
  const el = document.createElement('div')
  el.className = 'ih-cursor'
  el.dataset.playerId = player.guestId
  el.style.transform = `translate(${x}px, ${y}px)`

  const dark = darkenHex(player.color)

  el.innerHTML = `
    <svg class="cursor-arrow" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3L20 12L12 14.5L9 21L3 3Z"
        fill="${player.color}"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </svg>
    <div class="cursor-tag" style="background: ${player.color}; box-shadow: 0 3px 0 ${dark};">
      <span class="cursor-name">${escapeHtml(player.name)}</span>
    </div>
  `

  const tagEl = el.querySelector('.cursor-tag') as HTMLDivElement
  const arrowPath = el.querySelector('.cursor-arrow path') as SVGPathElement
  return { el, tagEl, arrowPath }
}

/** Idle threshold — start hovering after 1.5s of no movement */
const IDLE_THRESHOLD = 1500

export default function RemoteCursors({ players, zoom, cursorOverrides }: RemoteCursorsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cursorsRef = useRef<Map<string, CursorState>>(new Map())
  const rafRef = useRef<number>(0)
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom

  // Sync cursor DOM elements with players array
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const currentIds = new Set(players.filter(p => {
      const override = cursorOverrides?.get(p.guestId)
      return override || p.cursor
    }).map(p => p.guestId))

    // Remove cursors for players no longer present / no position
    for (const [id, state] of cursorsRef.current) {
      if (!currentIds.has(id)) {
        state.el.remove()
        cursorsRef.current.delete(id)
      }
    }

    // Create or update cursors
    for (const player of players) {
      const override = cursorOverrides?.get(player.guestId)
      const cursor = override || player.cursor
      if (!cursor) continue

      const existing = cursorsRef.current.get(player.guestId)
      if (existing) {
        // Detect movement
        const moved = Math.abs(cursor.x - existing.targetX) > 0.5 ||
                      Math.abs(cursor.y - existing.targetY) > 0.5
        if (moved) {
          existing.lastMoveTime = Date.now()
          if (existing.isIdle) {
            existing.isIdle = false
            existing.el.classList.remove('ih-cursor-idle')
          }
        }

        // Update target position
        existing.targetX = cursor.x
        existing.targetY = cursor.y

        // Update name if changed
        const nameEl = existing.tagEl.querySelector('.cursor-name')
        if (nameEl && nameEl.textContent !== player.name) {
          nameEl.textContent = player.name
        }
        // Update color if changed
        if (existing.color !== player.color) {
          existing.color = player.color
          existing.arrowPath.setAttribute('fill', player.color)
          const dark = darkenHex(player.color)
          existing.tagEl.style.background = player.color
          existing.tagEl.style.boxShadow = `0 3px 0 ${dark}`
        }
      } else {
        // Create new cursor
        const { el, tagEl, arrowPath } = createCursorElement(player, cursor.x, cursor.y)
        container.appendChild(el)
        cursorsRef.current.set(player.guestId, {
          targetX: cursor.x,
          targetY: cursor.y,
          arrowX: cursor.x,
          arrowY: cursor.y,
          tagX: cursor.x,
          tagY: cursor.y,
          velX: 0,
          velY: 0,
          lastMoveTime: Date.now(),
          isIdle: false,
          el,
          tagEl,
          arrowPath,
          color: player.color,
        })
      }
    }
  }, [players, cursorOverrides])

  // rAF loop — lerp arrows, spring tags, counter-scale for zoom, idle detection
  useEffect(() => {
    const LERP = 0.35
    const STIFFNESS = 0.1
    const DAMPING = 0.72

    function tick() {
      const invZoom = 1 / zoomRef.current
      const now = Date.now()

      for (const cursor of cursorsRef.current.values()) {
        // Lerp arrow toward target
        cursor.arrowX += (cursor.targetX - cursor.arrowX) * LERP
        cursor.arrowY += (cursor.targetY - cursor.arrowY) * LERP

        // Spring tag toward arrow
        const fx = (cursor.arrowX - cursor.tagX) * STIFFNESS
        const fy = (cursor.arrowY - cursor.tagY) * STIFFNESS
        cursor.velX = (cursor.velX + fx) * DAMPING
        cursor.velY = (cursor.velY + fy) * DAMPING
        cursor.tagX += cursor.velX
        cursor.tagY += cursor.velY

        // Write to DOM — counter-scale by 1/zoom so cursor stays constant screen size
        cursor.el.style.transform =
          `translate(${cursor.arrowX}px, ${cursor.arrowY}px) scale(${invZoom})`

        // Tag offset is relative to arrow (already positioned by parent transform)
        cursor.tagEl.style.transform =
          `translate(${cursor.tagX - cursor.arrowX}px, ${cursor.tagY - cursor.arrowY}px)`

        // Idle detection
        if (!cursor.isIdle && (now - cursor.lastMoveTime) > IDLE_THRESHOLD) {
          cursor.isIdle = true
          cursor.el.classList.add('ih-cursor-idle')
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      for (const state of cursorsRef.current.values()) {
        state.el.remove()
      }
      cursorsRef.current.clear()
    }
  }, [])

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 100 }} />
}
