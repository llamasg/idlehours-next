'use client'

import { useState, useEffect } from 'react'
import type { GameSenseGame } from '../data/games'

// ── Blank definitions ───────────────────────────────────────────────────────

export interface BlankDef {
  key: string
  label: string
  cost: number
  reveal: (game: GameSenseGame) => string
}

function formatPegi(pegi: number): string {
  if (pegi <= 3) return 'everyone'
  if (pegi <= 7) return 'ages 7 and up'
  if (pegi === 12) return 'ages 12 and up'
  if (pegi === 16) return 'ages 16 and up'
  return '18 year olds'
}

export const BLANKS: BlankDef[] = [
  { key: 'genre', label: 'Genre', cost: 200, reveal: (g) => g.genres.join(', ') },
  { key: 'vibe', label: 'Theme', cost: 150, reveal: (g) => g.vibe },
  { key: 'year', label: 'Release Year', cost: 150, reveal: (g) => String(g.year) },
  { key: 'rating', label: 'Age Rating', cost: 100, reveal: (g) => formatPegi(g.pegi) },
  { key: 'platform', label: 'Platforms', cost: 100, reveal: (g) => g.platforms.join(', ') },
]

export const BLANK_COSTS: Record<string, number> = Object.fromEntries(
  BLANKS.map((b) => [b.key, b.cost]),
)

// ── Sentence segments ───────────────────────────────────────────────────────

type Segment = { type: 'text'; text: string } | { type: 'blank'; index: number }

const SEGMENTS: Segment[] = [
  { type: 'text', text: 'A ' },
  { type: 'blank', index: 0 },
  { type: 'text', text: ' about ' },
  { type: 'blank', index: 1 },
  { type: 'text', text: ' released in ' },
  { type: 'blank', index: 2 },
  { type: 'text', text: ' made for ' },
  { type: 'blank', index: 3 },
  { type: 'text', text: ' on ' },
  { type: 'blank', index: 4 },
  { type: 'text', text: '.' },
]

// ── Component ───────────────────────────────────────────────────────────────

interface SentenceClueProps {
  answer: GameSenseGame
  blanksRevealed: string[]
  score: number
  onRevealBlank: (blank: BlankDef) => void
  disabled: boolean
}

export default function SentenceClue({
  answer,
  blanksRevealed,
  score,
  onRevealBlank,
  disabled,
}: SentenceClueProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="text-center">
      <p
        className="mx-auto max-w-[720px] text-[clamp(18px,3vw,24px)] font-bold leading-[1.9] tracking-[-0.01em]"
        style={{ color: 'hsl(var(--game-ink))' }}
      >
        {SEGMENTS.map((seg, i) => {
          const delay = mounted ? i * 0.12 : 0

          if (seg.type === 'text') {
            return (
              <span
                key={i}
                style={{
                  opacity: mounted ? undefined : 0,
                  animation: mounted
                    ? `sentence-in 0.4s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s both`
                    : 'none',
                }}
              >
                {seg.text}
              </span>
            )
          }

          const blank = BLANKS[seg.index]
          return (
            <span
              key={i}
              style={{
                opacity: mounted ? undefined : 0,
                animation: mounted
                  ? `sentence-in 0.4s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s both`
                  : 'none',
              }}
            >
              <Blank
                blank={blank}
                answer={answer}
                revealed={blanksRevealed.includes(blank.key)}
                score={score}
                disabled={disabled}
                onReveal={onRevealBlank}
              />
            </span>
          )
        })}
      </p>
    </div>
  )
}

// ── Blank sub-component ─────────────────────────────────────────────────────

interface BlankProps {
  blank: BlankDef
  answer: GameSenseGame
  revealed: boolean
  score: number
  disabled: boolean
  onReveal: (blank: BlankDef) => void
}

function Blank({ blank, answer, revealed, score, disabled, onReveal }: BlankProps) {
  const canAfford = score >= blank.cost
  const value = blank.reveal(answer)

  if (revealed || disabled) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-[6px] px-[14px] text-[0.85em] font-bold text-white"
        style={{
          background: 'hsl(var(--game-blue))',
          height: '34px',
          minWidth: '80px',
          animation: 'blank-click 0.45s cubic-bezier(0.22,1.2,0.36,1) both',
          verticalAlign: 'middle',
        }}
      >
        {value}
      </span>
    )
  }

  return (
    <span className="group/blank relative mx-[3px] inline-flex items-center align-middle">
      {/* Tooltip */}
      <span
        className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-20 flex -translate-x-1/2 translate-y-1 flex-col items-center gap-px whitespace-nowrap rounded-lg px-3 py-1.5 opacity-0 shadow-md transition-all duration-150 group-hover/blank:translate-y-0 group-hover/blank:opacity-100"
        style={{ background: 'hsl(var(--game-blue))' }}
      >
        <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/80">
          {blank.label}
        </span>
        <span className="text-[13px] font-black text-white">
          &minus;{blank.cost}{' '}
          <span className="text-[10px] text-white/65">pts</span>
        </span>
        <span
          className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent"
          style={{ borderTopColor: 'hsl(var(--game-blue))' }}
        />
      </span>

      <button
        onClick={() => {
          if (!disabled && canAfford) onReveal(blank)
        }}
        disabled={disabled || !canAfford}
        className="blank-btn inline-flex items-center justify-center rounded-[6px] px-[10px] select-none"
        style={{
          background: disabled || !canAfford
            ? 'hsl(var(--game-ink) / 0.3)'
            : 'hsl(var(--game-ink))',
          color: 'transparent',
          minWidth: '80px',
          height: '34px',
          cursor: disabled || !canAfford ? 'not-allowed' : 'pointer',
          fontSize: '0.85em',
          transition: 'background 0.15s, transform 0.1s',
        }}
        onMouseEnter={(e) => {
          if (!disabled && canAfford) {
            e.currentTarget.style.background = 'hsl(var(--game-blue-dark))'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && canAfford) {
            e.currentTarget.style.background = 'hsl(var(--game-ink))'
            e.currentTarget.style.transform = 'translateY(0)'
          }
        }}
        aria-label={`Reveal ${blank.label} (costs ${blank.cost} points)`}
      >
        {blank.label}
      </button>
    </span>
  )
}
