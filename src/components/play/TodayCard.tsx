'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { type GameSlug, GAME_COLORS } from '@/lib/ranks'

interface SlotData {
  completed: boolean
  score: number
}

const DAILY_GAMES: { slug: GameSlug; label: string; emoji: string; href: string }[] = [
  { slug: 'game-sense', label: 'Game Sense', emoji: '🎮', href: '/play/game-sense' },
  { slug: 'street-date', label: 'Street Date', emoji: '📅', href: '/play/street-date' },
  { slug: 'shelf-price', label: 'Shelf Price', emoji: '💰', href: '/play/shelf-price' },
]

function getTodayDateStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getSlotData(slug: GameSlug, dateStr: string): SlotData {
  if (typeof window === 'undefined') return { completed: false, score: 0 }
  try {
    switch (slug) {
      case 'shelf-price': {
        const raw = localStorage.getItem(`shelf_price_v2_${dateStr}`)
        if (!raw) return { completed: false, score: 0 }
        const state = JSON.parse(raw)
        if (!state.finished) return { completed: false, score: 0 }
        return { completed: true, score: state.score }
      }
      case 'street-date': {
        const raw = localStorage.getItem(`street_date_${dateStr}`)
        if (!raw) return { completed: false, score: 0 }
        const state = JSON.parse(raw)
        if (!state.finished) return { completed: false, score: 0 }
        return { completed: true, score: state.score }
      }
      case 'game-sense': {
        const raw = localStorage.getItem(`game_sense_${dateStr}`)
        if (!raw) return { completed: false, score: 0 }
        const state = JSON.parse(raw)
        if (!state.won) return { completed: false, score: 0 }
        return { completed: true, score: state.score }
      }
    }
  } catch {
    return { completed: false, score: 0 }
  }
}

export default function TodayCard() {
  const dateStr = useMemo(() => getTodayDateStr(), [])
  const slots = useMemo(
    () => DAILY_GAMES.map((g) => ({ ...g, ...getSlotData(g.slug, dateStr) })),
    [dateStr],
  )
  const completedCount = slots.filter((s) => s.completed).length
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

  const nudge =
    completedCount === 3
      ? 'All done for today. Come back tomorrow!'
      : completedCount === 0
        ? 'Three games waiting for you.'
        : `${3 - completedCount} still to go.`

  return (
    <div className="rounded-[18px] border border-border/60 bg-card p-5 shadow-[0_3px_0_hsl(var(--border)),0_6px_18px_rgba(0,0,0,0.05)]">
      <p className="mb-3.5 font-heading text-[9px] font-extrabold uppercase tracking-[0.22em] text-muted-foreground">
        {today} &nbsp;&middot;&nbsp; <strong className="text-foreground">Today&apos;s games</strong>
      </p>
      <div className="mb-3.5 flex items-start justify-around gap-2">
        {slots.map((slot) => (
          <Link key={slot.slug} href={slot.href} className="group flex flex-col items-center gap-1.5">
            <div
              className={`flex h-[42px] w-[42px] items-center justify-center rounded-full text-base transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6 ${
                slot.completed ? 'shadow-[0_0_0_3px_hsl(var(--background))]' : 'border-2 border-dashed border-border'
              }`}
              style={slot.completed ? { backgroundColor: GAME_COLORS[slot.slug].accent } : undefined}
            >
              {slot.completed ? slot.emoji : ''}
            </div>
            <span className={`text-center font-heading text-[8px] font-extrabold uppercase tracking-[0.08em] leading-tight ${
              slot.completed ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {slot.label}
            </span>
          </Link>
        ))}
      </div>
      <div className="mb-3 h-px bg-border" />
      <p className="font-heading text-[11px] font-semibold italic text-muted-foreground">{nudge}</p>
    </div>
  )
}
