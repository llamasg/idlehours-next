'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { type GameSlug, getRankForGame } from '@/lib/ranks'

// ── localStorage helpers ────────────────────────────────────────────────────

interface SlotData {
  completed: boolean
  rankName: string
  score: number
}

const GAMES: { slug: GameSlug; label: string; href: string }[] = [
  { slug: 'shelf-price', label: 'Shelf Price', href: '/play/shelf-price' },
  { slug: 'street-date', label: 'Street Date', href: '/play/street-date' },
  { slug: 'game-sense', label: 'Game Sense', href: '/play/game-sense' },
]

function getTodayDateStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getSlotData(slug: GameSlug, dateStr: string): SlotData {
  if (typeof window === 'undefined') return { completed: false, rankName: '', score: 0 }

  try {
    switch (slug) {
      case 'shelf-price': {
        const raw = localStorage.getItem(`shelf_price_v2_${dateStr}`)
        if (!raw) return { completed: false, rankName: '', score: 0 }
        const state = JSON.parse(raw)
        if (!state.finished) return { completed: false, rankName: '', score: 0 }
        const rankName = getRankForGame('shelf-price', state.score, state.streak)
        return { completed: true, rankName, score: state.score }
      }
      case 'street-date': {
        const raw = localStorage.getItem(`street_date_${dateStr}`)
        if (!raw) return { completed: false, rankName: '', score: 0 }
        const state = JSON.parse(raw)
        if (!state.finished) return { completed: false, rankName: '', score: 0 }
        const rankName = getRankForGame('street-date', state.score, 0)
        return { completed: true, rankName, score: state.score }
      }
      case 'game-sense': {
        const raw = localStorage.getItem(`game_sense_${dateStr}`)
        if (!raw) return { completed: false, rankName: '', score: 0 }
        const state = JSON.parse(raw)
        if (!state.won) return { completed: false, rankName: '', score: 0 }
        const rankName = getRankForGame('game-sense', state.score, 0)
        return { completed: true, rankName, score: state.score }
      }
    }
  } catch {
    return { completed: false, rankName: '', score: 0 }
  }
}

// ── Component ───────────────────────────────────────────────────────────────

interface DailyBadgeShelfProps {
  /** The game the player just completed — triggers stamp animation */
  currentGame: GameSlug
}

export default function DailyBadgeShelf({ currentGame }: DailyBadgeShelfProps) {
  const dateStr = useMemo(() => getTodayDateStr(), [])

  const slots = useMemo(
    () => GAMES.map((g) => ({ ...g, ...getSlotData(g.slug, dateStr) })),
    [dateStr],
  )

  const completedCount = slots.filter((s) => s.completed).length

  return (
    <div className="mx-auto w-full max-w-[850px]">
      {/* Section heading with line */}
      <div className="mb-5 flex items-center gap-3">
        <h3 className="flex-shrink-0 font-heading text-[11px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">
          Today&apos;s badges
        </h3>
        <div className="h-px flex-1 bg-[hsl(var(--game-ink))]/10" />
      </div>

      {/* Badge row */}
      <div className="grid grid-cols-3 gap-6">
        {slots.map((slot) => {
          const justCompleted = slot.slug === currentGame && slot.completed

          if (slot.completed) {
            return (
              <div key={slot.slug} className="flex flex-col items-center gap-3">
                {/* Game label */}
                <span className="font-heading text-[12px] font-extrabold uppercase tracking-[0.16em] text-[hsl(var(--game-ink-light))]">
                  {slot.label}
                </span>

                {/* Badge circle */}
                <div className="relative h-[120px] w-[120px]">
                  <div
                    className={`flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[hsl(var(--game-blue))] text-[10px] font-bold uppercase tracking-[0.04em] text-white/30 shadow-[0_8px_28px_rgba(74,143,232,0.35)] ${
                      justCompleted ? 'animate-stamp-bounce' : ''
                    }`}
                  >
                    {/* TODO: replace with rank badge illustration */}
                    BADGE
                  </div>

                  {/* Ink ring border */}
                  <div className="pointer-events-none absolute -inset-1 rounded-full border-2 border-[hsl(var(--game-blue))]/20" />

                  {/* Ink rings — only on just-completed */}
                  {justCompleted && (
                    <>
                      <div className="absolute inset-0 rounded-full border-2 border-[hsl(var(--game-blue))]/50 animate-[ink-ring_0.6s_ease-out_0.3s_both]" />
                      <div className="absolute inset-0 rounded-full border-2 border-[hsl(var(--game-blue))]/50 animate-[ink-ring_0.7s_ease-out_0.4s_both]" />
                    </>
                  )}

                  {/* Score float — only on just-completed */}
                  {justCompleted && (
                    <div className="absolute inset-x-0 -top-2 flex justify-center animate-[score-float_0.9s_ease-out_0.5s_both]">
                      <span className="whitespace-nowrap font-heading text-[15px] font-black text-[hsl(var(--game-blue))]">
                        +{slot.score} pts
                      </span>
                    </div>
                  )}
                </div>

                {/* Rank name */}
                <span className="min-h-[18px] text-center font-heading text-[13px] font-extrabold leading-tight text-[hsl(var(--game-blue))]">
                  {slot.rankName}
                </span>
              </div>
            )
          }

          // Empty slot — not yet played
          return (
            <Link
              key={slot.slug}
              href={slot.href}
              className="group flex flex-col items-center gap-3"
            >
              {/* Game label */}
              <span className="font-heading text-[12px] font-extrabold uppercase tracking-[0.16em] text-[hsl(var(--game-ink-light))]">
                {slot.label}
              </span>

              {/* Dashed circle */}
              <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full border-[2.5px] border-dashed border-[hsl(var(--game-cream-dark))] transition-colors group-hover:border-[hsl(var(--game-blue))]">
                <span className="font-heading text-[13px] font-bold tracking-[0.08em] text-[hsl(var(--game-ink-light))]/60 transition-colors group-hover:text-[hsl(var(--game-blue))]">
                  Play &rarr;
                </span>
              </div>

              {/* Empty rank placeholder */}
              <span className="min-h-[18px] text-center font-heading text-[13px] font-bold leading-tight text-[hsl(var(--game-ink-light))]">
                &nbsp;
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
