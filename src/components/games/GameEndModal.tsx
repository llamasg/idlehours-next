'use client'

import { useEffect, useMemo, type ReactNode } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────

interface GameEndModalProps {
  result: 'win' | 'loss'
  score: number
  heading: string
  subheading: string
  rankName: string
  rankFlavour: string
  stats: { label: string; value: string }[]
  heroZone: ReactNode
  /** Optional row of pips (Shelf Price) */
  pipRow?: ReactNode
  onShare: () => void
  onClose: () => void
}

// ── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLOURS = ['#4A8FE8', '#C8873A', '#27A85A', '#F0EBE0', '#2D6BC4']

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        size: 4 + Math.random() * 8,
        colour: CONFETTI_COLOURS[i % CONFETTI_COLOURS.length],
        shape: (i % 2 === 0 ? 'square' : 'circle') as 'square' | 'circle',
      })),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-x-0 -top-10 z-10 h-[300px] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute animate-[confetti-fall_2.5s_ease-in_forwards]"
          style={{
            left: `${p.left}%`,
            top: '-5%',
            width: p.size,
            height: p.size,
            backgroundColor: p.colour,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  )
}

// ── GameEndModal ─────────────────────────────────────────────────────────────

export default function GameEndModal({
  result,
  score,
  heading,
  subheading,
  rankName,
  rankFlavour,
  stats,
  heroZone,
  pipRow,
  onShare,
  onClose,
}: GameEndModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const isWin = result === 'win'

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative mx-4 w-full max-w-[540px]">
        {/* Close button — top right */}
        <button
          onClick={onClose}
          className="absolute -right-2 -top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[hsl(var(--game-ink-mid))] shadow-lg backdrop-blur-sm transition-colors hover:bg-white hover:text-[hsl(var(--game-ink))]"
          aria-label="Close"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Confetti — win only */}
        {isWin && <Confetti />}

        <div
          className={`relative overflow-hidden rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.25),0_4px_16px_rgba(0,0,0,0.1)] ${
            isWin ? 'bg-[hsl(var(--game-white))]' : 'bg-[hsl(var(--game-cream))]'
          }`}
        >
          {/* Hero zone — passed in by each game */}
          {heroZone}

          {/* Modal body */}
          <div className="flex flex-col items-center gap-4 px-6 pb-7 pt-5 text-center">
            {/* Result heading */}
            <div>
              <h2 className="font-heading text-[26px] font-black leading-tight text-[hsl(var(--game-ink))]">
                {heading}
              </h2>
              <p className="mt-1 text-sm font-semibold text-[hsl(var(--game-ink-mid))]">
                {subheading}
              </p>
            </div>

            {/* Score pill */}
            <div
              className={`inline-flex items-baseline gap-1.5 rounded-full border-2 px-5 py-2 ${
                isWin
                  ? 'border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))]'
                  : 'border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream-mid))]'
              }`}
            >
              <span
                className={`font-heading text-[28px] font-black ${
                  isWin ? 'text-[hsl(var(--game-blue))]' : 'text-[hsl(var(--game-ink-mid))]'
                }`}
              >
                {score}
              </span>
              <span className="font-heading text-xs font-semibold tracking-[0.1em] text-[hsl(var(--game-ink-light))]">
                PTS
              </span>
            </div>

            {/* Rank badge block */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-24 w-24 items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-[0.05em] text-white/40 ${
                  isWin
                    ? 'bg-[hsl(var(--game-blue))] shadow-[0_0_32px_rgba(74,143,232,0.3)]'
                    : 'bg-[hsl(var(--game-ink-light))]'
                }`}
                style={isWin ? { animation: 'badge-pulse 1.2s ease-out forwards' } : undefined}
              >
                {/* TODO: replace with rank badge illustration */}
                BADGE
              </div>
              <p
                className={`font-heading text-lg font-black tracking-[0.02em] ${
                  isWin ? 'text-[hsl(var(--game-blue))]' : 'text-[hsl(var(--game-ink-mid))]'
                }`}
              >
                {rankName}
              </p>
              <p className="-mt-1 text-[13px] font-semibold italic text-[hsl(var(--game-ink-mid))]">
                {rankFlavour}
              </p>
            </div>

            {/* Divider */}
            <div className="-mx-6 h-px w-[calc(100%+48px)] bg-[hsl(var(--game-ink))]/10" />

            {/* Stat row */}
            <div className="flex w-full gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`flex flex-1 flex-col items-center gap-px rounded-full py-2 ${
                    isWin ? 'bg-[hsl(var(--game-cream))]' : 'bg-[hsl(var(--game-cream-dark))]'
                  }`}
                >
                  <span className="font-heading text-[15px] font-extrabold text-[hsl(var(--game-ink))]">
                    {stat.value}
                  </span>
                  <span className="font-heading text-[9px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-light))]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Pip row (Shelf Price only) */}
            {pipRow}

            {/* Share button */}
            <button
              onClick={onShare}
              className={`w-full rounded-full py-3.5 font-heading text-[15px] font-extrabold tracking-[0.04em] text-white transition-all hover:-translate-y-0.5 ${
                isWin
                  ? 'bg-[hsl(var(--game-blue))] shadow-[0_4px_16px_rgba(74,143,232,0.35)] hover:shadow-[0_6px_20px_rgba(74,143,232,0.45)]'
                  : 'bg-[hsl(var(--game-ink-mid))]'
              }`}
            >
              Share Result
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
