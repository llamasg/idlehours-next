'use client'

import { useMemo } from 'react'
import { pickDayFlavour } from '@/lib/dayFlavour'
import {
  type GameSlug,
  getLadderForGame,
  getRankForGame,
  getFlavourForGame,
} from '@/lib/ranks'
import { COPY, pickRandom } from '@/components/games/GameEndModal.copy'

// ── Types ───────────────────────────────────────────────────────────────────

interface ResultCardProps {
  game: GameSlug
  score: number
  streak: number
  won: boolean
  puzzleLabel: string    // e.g. "Shelf Price #001 · Tue 3rd Mar"
  onViewResults: () => void
}

// ── Component ───────────────────────────────────────────────────────────────

export default function ResultCard({
  game,
  score,
  streak,
  won,
  puzzleLabel,
  onViewResults,
}: ResultCardProps) {
  // Pick random copy once on mount
  const { heading, subheading, dayFlavour, rankName, rankFlavour } = useMemo(() => {
    const rn = getRankForGame(game, score, streak)
    const flavourMap = getFlavourForGame(game)
    const result = won ? 'win' : 'loss'
    return {
      heading: pickRandom(COPY[result].headings),
      subheading: pickRandom(COPY[result].subheadings),
      dayFlavour: pickDayFlavour(),
      rankName: rn,
      rankFlavour: pickRandom(flavourMap[rn]),
    }
  }, [game, score, streak, won])

  const ladder = getLadderForGame(game)
  const currentRankIndex = ladder.findIndex((t) => t.name === rankName)

  const displayScore = game === 'shelf-price' ? `${streak}/10` : String(score)
  const scoreLabel = game === 'shelf-price' ? 'streak' : 'pts'

  return (
    <div className="mx-auto w-full max-w-[850px] overflow-hidden rounded-[24px] border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] shadow-sm">
      {/* Top accent line — green for win, red for loss */}
      <div className={`h-[4px] w-full ${won ? 'bg-[hsl(var(--game-green))]' : 'bg-[hsl(var(--game-red))]'}`} />

      {/* Top bar */}
      <div className="flex items-center gap-2 border-b border-[hsl(var(--game-ink))]/10 px-8 py-4">
        <div className="flex flex-col gap-px">
          <h3 className="font-heading text-[18px] font-black text-[hsl(var(--game-ink))]">
            {heading}
          </h3>
          <p className="text-[14px] font-semibold text-[hsl(var(--game-ink-mid))]">
            {subheading}
          </p>
        </div>
        <div className="flex-1" />
        <p className="text-[14px] font-semibold italic text-[hsl(var(--game-ink-light))]">
          {dayFlavour}
        </p>
      </div>

      {/* Two-column body */}
      <div className="grid min-h-[250px] grid-cols-1 md:grid-cols-2">
        {/* Left column — badge + rank */}
        <div className="flex flex-col items-center justify-center gap-4 border-b border-[hsl(var(--game-ink))]/10 px-6 py-9 text-center md:border-b-0 md:border-r">
          <div
            className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[hsl(var(--game-blue))] text-[11px] font-bold uppercase tracking-[0.04em] text-white/30 shadow-[0_10px_32px_rgba(74,143,232,0.35)]"
            style={{ animation: 'badge-pulse 1.2s ease-out forwards' }}
          >
            {/* TODO: replace with rank badge illustration */}
            BADGE
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <p className="font-heading text-[11px] font-extrabold uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">
              You earned
            </p>
            <p className="font-heading text-2xl font-black leading-none text-[hsl(var(--game-blue))]">
              {rankName}
            </p>
            <p className="max-w-[250px] text-[13px] font-semibold italic text-[hsl(var(--game-ink-mid))]">
              {rankFlavour}
            </p>
          </div>
        </div>

        {/* Right column — score + ladder */}
        <div className="flex flex-col gap-5 px-6 py-8">
          {/* Score */}
          <div className="flex flex-col gap-0.5">
            <p className="font-heading text-[11px] font-extrabold uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">
              Today&apos;s score
            </p>
            <div className="flex items-baseline">
              <span className="font-heading text-[50px] font-black leading-none tracking-tight text-[hsl(var(--game-blue))]">
                {displayScore}
              </span>
              <span className="ml-2 font-heading text-[16px] font-bold tracking-[0.1em] text-[hsl(var(--game-ink-light))]">
                {scoreLabel}
              </span>
            </div>
          </div>

          {/* Rank ladder */}
          <div className="flex flex-1 flex-col justify-end gap-2">
            <p className="mb-0.5 font-heading text-[11px] font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--game-ink-light))]">
              Rank thresholds
            </p>
            {ladder.map((tier, i) => {
              const isCurrentRank = i === currentRankIndex
              const isAchieved = i < currentRankIndex

              return (
                <div
                  key={tier.name}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 ${
                    isCurrentRank
                      ? 'bg-[hsl(var(--game-blue))]/8 ring-[1.5px] ring-[hsl(var(--game-blue))]/25'
                      : isAchieved
                        ? 'opacity-50'
                        : 'border-[1.5px] border-dashed border-[hsl(var(--game-ink))]/10'
                  }`}
                >
                  <div
                    className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                      isCurrentRank
                        ? 'bg-[hsl(var(--game-blue))]'
                        : isAchieved
                          ? 'bg-[hsl(var(--game-green))]'
                          : 'bg-[hsl(var(--game-cream-dark))]'
                    }`}
                  />
                  <div className="flex-1">
                    <p
                      className={`font-heading text-[13px] font-extrabold ${
                        isCurrentRank
                          ? 'text-[hsl(var(--game-blue))]'
                          : 'text-[hsl(var(--game-ink))]'
                      }`}
                    >
                      {tier.name}
                    </p>
                    <p className="font-heading text-[12px] font-semibold text-[hsl(var(--game-ink-light))]">
                      {tier.label}
                    </p>
                  </div>
                  {isCurrentRank && (
                    <span className="font-heading text-[11px] font-extrabold uppercase tracking-[0.08em] text-[hsl(var(--game-blue))]">
                      You
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[hsl(var(--game-ink))]/10 px-8 py-4">
        <p className="text-[13px] font-semibold text-[hsl(var(--game-ink-light))]">
          {puzzleLabel}
        </p>
        <button
          onClick={onViewResults}
          className="text-[14px] font-bold text-[hsl(var(--game-blue))] underline decoration-[hsl(var(--game-blue))]/30 underline-offset-2 transition-colors hover:decoration-[hsl(var(--game-blue))]"
        >
          View full results &rarr;
        </button>
      </div>
    </div>
  )
}
