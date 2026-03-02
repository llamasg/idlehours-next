'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import type { Game } from '@/types'
import GameTileCard from '@/components/GameTileCard'

interface WhatWerePlayingProps {
  games: Game[]
}

export default function WhatWerePlaying({ games }: WhatWerePlayingProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Drag-to-scroll state
  const isDragging = useRef(false)
  const hasDragged = useRef(false)
  const startX = useRef(0)
  const startScroll = useRef(0)
  const velocity = useRef(0)
  const lastX = useRef(0)
  const lastTime = useRef(0)
  const rafId = useRef(0)

  function checkScroll() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true })
      window.addEventListener('resize', checkScroll)
    }
    return () => {
      el?.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
      cancelAnimationFrame(rafId.current)
    }
  }, [])

  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.75
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  // --- Pointer-based drag-to-scroll with inertia ---
  const activePointerId = useRef<number | null>(null)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = scrollRef.current
    if (!el) return
    isDragging.current = true
    hasDragged.current = false
    activePointerId.current = e.pointerId
    startX.current = e.clientX
    startScroll.current = el.scrollLeft
    lastX.current = e.clientX
    lastTime.current = Date.now()
    velocity.current = 0
    cancelAnimationFrame(rafId.current)
    // Don't capture pointer yet — wait for actual drag so clicks reach children
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return
    const el = scrollRef.current
    if (!el) return
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > 5 && !hasDragged.current) {
      // Crossed drag threshold — now capture pointer and switch cursor
      hasDragged.current = true
      el.style.cursor = 'grabbing'
      if (activePointerId.current != null) {
        el.setPointerCapture(activePointerId.current)
      }
    }
    if (hasDragged.current) {
      el.scrollLeft = startScroll.current - dx
    }

    // Track velocity for inertia
    const now = Date.now()
    const dt = now - lastTime.current
    if (dt > 0) {
      velocity.current = (e.clientX - lastX.current) / dt
    }
    lastX.current = e.clientX
    lastTime.current = now
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return
    isDragging.current = false
    const el = scrollRef.current
    if (!el) return
    el.style.cursor = ''
    if (hasDragged.current && activePointerId.current != null) {
      el.releasePointerCapture(activePointerId.current)
    }
    activePointerId.current = null

    // Apply inertia — decelerate over time with bounce at edges
    let v = velocity.current * 1000 // px/s
    const friction = 0.95
    const minV = 0.5

    function inertiaFrame() {
      if (!el) return
      if (Math.abs(v) < minV) return
      v *= friction
      el.scrollLeft -= v * (1 / 60)

      // Bounce at edges
      if (el.scrollLeft <= 0 && v > 0) {
        v = -v * 0.3
      } else if (el.scrollLeft >= el.scrollWidth - el.clientWidth && v < 0) {
        v = -v * 0.3
      }

      rafId.current = requestAnimationFrame(inertiaFrame)
    }
    rafId.current = requestAnimationFrame(inertiaFrame)
  }, [])

  // Prevent click events on cards after a drag gesture
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault()
      e.stopPropagation()
      hasDragged.current = false
    }
  }, [])

  if (!games || games.length === 0) return null

  return (
    <div>
      {/* Heading row with inline arrows */}
      <div className="mb-6 flex items-center gap-4">
        <span className="shrink-0 font-heading text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
          WHAT WE&apos;RE PLAYING
        </span>
        <div className="h-px flex-1 bg-border/60" />
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
            aria-label="Scroll left"
          >
            <span className="text-sm font-bold leading-none">&lsaquo;</span>
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
            aria-label="Scroll right"
          >
            <span className="text-sm font-bold leading-none">&rsaquo;</span>
          </button>
        </div>
      </div>

      {/* Scrollable, draggable row */}
      <div
        ref={scrollRef}
        className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 cursor-grab select-none touch-pan-x"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
      >
        {games.map((game) => (
          <div key={game._id} className="w-[240px] shrink-0 [&_img]:pointer-events-none [&_img]:select-none">
            <GameTileCard game={game} />
          </div>
        ))}
      </div>
    </div>
  )
}
