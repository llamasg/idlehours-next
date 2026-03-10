'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { type GameSlug } from '@/lib/ranks'
import { type ArchiveEntry } from '../lib/archiveAdapter'
import { entrance } from '@/lib/animations'

// ── Helpers ──────────────────────────────────────────────────────────────────

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function shortDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d} ${SHORT_MONTHS[parseInt(m) - 1]} ${y.slice(2)}`
}

// ── Constants ────────────────────────────────────────────────────────────────

const ITEM_HEIGHT = 64
const CONTAINER_HEIGHT = 620
const CENTER_OFFSET = Math.floor(CONTAINER_HEIGHT / 2 - ITEM_HEIGHT / 2)
const BOUNCE_DISTANCE = 90    // px overshoot at edges
const BOUNCE_SPRING = 0.15    // lerp factor for normal scroll
const BOUNCE_RETURN = 0.03    // lerp factor for bounce return (lower = slower/softer ~0.8s)

// How many items around center get the stagger-rise entrance
const VISIBLE_RANGE = 6

// ── Props ────────────────────────────────────────────────────────────────────

interface RolodexProps {
  entries: ArchiveEntry[]
  selectedIndex: number
  onSelect: (idx: number) => void
  gameSlug: GameSlug
  animateIn?: boolean
}

// ── Taper style based on distance from active item ───────────────────────────

function taperStyle(distance: number): React.CSSProperties {
  const abs = Math.abs(distance)
  if (abs === 0) return { opacity: 1, transform: 'scale(1)' }
  if (abs === 1) return { opacity: 0.7, transform: 'scale(0.92)' }
  if (abs <= 3) return { opacity: 0.25, transform: `scale(${0.88 - abs * 0.02})` }
  return { opacity: 0.1, transform: 'scale(0.82)' }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Rolodex({ entries, selectedIndex, onSelect, gameSlug, animateIn = true }: RolodexProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const scrollTargetRef = useRef(selectedIndex)
  const currentOffsetRef = useRef(selectedIndex * ITEM_HEIGHT)
  const rafRef = useRef<number>(0)
  const bounceRef = useRef(0)
  const isBouncing = useRef(false)
  const [hasEntered, setHasEntered] = useState(false)

  // Mark entrance done after animation completes
  useEffect(() => {
    if (animateIn && !hasEntered) {
      const timer = setTimeout(() => setHasEntered(true), VISIBLE_RANGE * 80 + 400)
      return () => clearTimeout(timer)
    }
  }, [animateIn, hasEntered])

  // Apply transform to list
  const applyTransform = useCallback(() => {
    if (listRef.current) {
      const y = CENTER_OFFSET - currentOffsetRef.current + bounceRef.current
      listRef.current.style.transform = `translateY(${y}px)`
    }
  }, [])

  // Smooth scroll animation
  const animate = useCallback(() => {
    const target = scrollTargetRef.current * ITEM_HEIGHT
    const current = currentOffsetRef.current
    const diff = target - current

    if (isBouncing.current) {
      bounceRef.current *= (1 - BOUNCE_RETURN)
      if (Math.abs(bounceRef.current) < 0.5) {
        bounceRef.current = 0
        isBouncing.current = false
      }
    }

    if (Math.abs(diff) < 0.5 && !isBouncing.current) {
      currentOffsetRef.current = target
      applyTransform()
      return
    }

    if (Math.abs(diff) >= 0.5) {
      currentOffsetRef.current += diff * BOUNCE_SPRING
    }

    applyTransform()
    rafRef.current = requestAnimationFrame(animate)
  }, [applyTransform])

  const startAnimate = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animate)
  }, [animate])

  useEffect(() => {
    scrollTargetRef.current = selectedIndex
    startAnimate()
    return () => cancelAnimationFrame(rafRef.current)
  }, [selectedIndex, startAnimate])

  const triggerBounce = useCallback((direction: 1 | -1) => {
    if (isBouncing.current) return
    bounceRef.current = BOUNCE_DISTANCE * direction
    isBouncing.current = true
    startAnimate()
  }, [startAnimate])

  // Scroll wheel handler
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handler = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const direction = e.deltaY > 0 ? 1 : -1
      const next = selectedIndex + direction

      if (next < 0) {
        triggerBounce(1)
        return
      }
      if (next >= entries.length) {
        triggerBounce(-1)
        return
      }
      onSelect(next)
    }

    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [entries.length, selectedIndex, onSelect, triggerBounce])

  // Keyboard handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const dir = e.key === 'ArrowDown' ? 1 : -1
        const next = selectedIndex + dir

        if (next < 0) { triggerBounce(1); return }
        if (next >= entries.length) { triggerBounce(-1); return }
        onSelect(next)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [entries.length, selectedIndex, onSelect, triggerBounce])

  return (
    <div>
      {/* Scroll container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{ height: CONTAINER_HEIGHT }}
      >
        {/* Center highlight band — fades in after rolodex items */}
        <div
          className="pointer-events-none absolute left-0 right-0 z-[5]"
          style={{
            top: CENTER_OFFSET - 4,
            height: ITEM_HEIGHT + 8,
            background: 'rgba(255,255,255,0.04)',
            borderTop: '1px solid rgba(74,143,232,0.3)',
            borderBottom: '1px solid rgba(74,143,232,0.3)',
            ...entrance('fade', hasEntered),
          }}
        />

        {/* Scrollable list */}
        <div
          ref={listRef}
          className="will-change-transform"
          style={{
            transition: 'none',
            transform: `translateY(${CENTER_OFFSET - selectedIndex * ITEM_HEIGHT}px)`,
          }}
        >
          {entries.map((entry, idx) => {
            const distance = idx - selectedIndex
            const isActive = idx === selectedIndex
            const style = taperStyle(distance)

            // Stagger entrance: items near center rise in with delay
            const absDistance = Math.abs(distance)
            const isInVisibleRange = absDistance <= VISIBLE_RANGE
            const staggerDelay = isInVisibleRange ? absDistance * 80 : 0
            const shouldAnimate = !hasEntered && isInVisibleRange

            // During entrance: outer div handles rise animation,
            // inner button always has taper styles so there's no jerk
            return (
              <div
                key={entry.date}
                style={{
                  height: ITEM_HEIGHT,
                  ...(hasEntered
                    ? {} // no entrance wrapper needed
                    : shouldAnimate
                      ? entrance('rise', animateIn, staggerDelay)
                      : { opacity: 0 }),
                }}
              >
              <button
                onClick={() => onSelect(idx)}
                className={`flex w-full items-center gap-2 px-2 text-left sm:gap-4 sm:px-4 ${
                  isActive ? 'cursor-default' : 'cursor-pointer'
                }`}
                style={{
                  height: ITEM_HEIGHT,
                  ...style,
                  transition: 'opacity 0.3s, transform 0.3s cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                {/* Number */}
                <span
                  className={`mr-1 flex-shrink-0 text-right font-heading font-black lg:mr-3 ${
                    isActive
                      ? 'text-[14px] text-white sm:text-[18px] lg:text-[26px]'
                      : 'text-[11px] text-white/50 sm:text-[14px] lg:text-[18px]'
                  }`}
                  style={{ transition: 'font-size 0.3s, color 0.3s' }}
                >
                  {entry.gameNumber}
                </span>

                {/* Blue accent line for active */}
                <div
                  className="w-[3px] self-stretch rounded-full transition-colors duration-200"
                  style={{
                    backgroundColor: isActive ? '#4a8fe8' : 'transparent',
                  }}
                />

                {/* Date — full at lg, condensed below */}
                <div className="min-w-0 flex-1">
                  <div
                    className={`whitespace-nowrap font-heading font-bold ${
                      isActive ? 'text-[13px] text-white sm:text-[15px] lg:text-[17px]' : 'text-[11px] text-white/60 sm:text-[13px] lg:text-[15px]'
                    }`}
                  >
                    <span className="hidden lg:inline">{entry.displayDate}</span>
                    <span className="lg:hidden">{shortDate(entry.date)}</span>
                  </div>
                </div>

                {/* Score pill + View button */}
                <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2.5">
                  {entry.won && (
                    <span
                      className="inline-flex items-baseline gap-0.5 rounded-full px-2 py-1 font-heading sm:px-3"
                      style={{ backgroundColor: 'rgba(39,199,106,0.12)' }}
                    >
                      <span className="text-[14px] font-black text-[#27c76a] sm:text-[16px]">
                        {entry.scoreDisplay.replace(/\s*pts$/, '')}
                      </span>
                      {entry.scoreDisplay.endsWith('pts') && (
                        <span className="text-[11px] font-semibold text-[#27c76a]/60">pts</span>
                      )}
                    </span>
                  )}
                  {entry.played && entry.finished && !entry.won && (
                    <span
                      className="inline-flex rounded-full px-3 py-1 font-heading text-[14px] font-bold text-[#e85a5a]"
                      style={{ backgroundColor: 'rgba(232,90,90,0.12)' }}
                    >
                      Lost
                    </span>
                  )}
                  {entry.played && !entry.finished && (
                    <span className="font-heading text-[13px] font-semibold text-white/30">
                      ...
                    </span>
                  )}
                  {!entry.played && (
                    <span className="font-heading text-[12px] font-semibold text-white/20">
                      —
                    </span>
                  )}

                </div>
              </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Keyboard hint */}
      <div
        className="mt-3 text-center font-heading text-[11px] font-semibold text-white/25"
        style={entrance('fade', animateIn, VISIBLE_RANGE * 80 + 200)}
      >
        &uarr; &darr; or scroll to navigate
      </div>
    </div>
  )
}
