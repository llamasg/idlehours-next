'use client'

import { useMemo } from 'react'
import { pickDayFlavour } from '@/lib/dayFlavour'
import {
  type GameSlug,
  getLadderForGame,
  getRankForGame,
  getFlavourForGame,
  GAME_COLORS,
} from '@/lib/ranks'
import { COPY, pickRandom } from '@/components/games/GameEndModal.copy'
import { entrance, useEntranceSteps } from '@/lib/animations'

// ── Types ───────────────────────────────────────────────────────────────────

interface ResultCardProps {
  game: GameSlug
  score: number
  streak: number
  won: boolean
  puzzleLabel: string    // e.g. "Shelf Price #001 · Tue 3rd Mar"
  onViewResults: () => void
  /** When true, play cascading entrance animation for each internal element */
  animateEntrance?: boolean
}

// ── Step gaps (ms between each step) ─────────────────────────────────────────

const STEP_GAPS = [
  0,    // 1: container wipe
  200,  // 2: green/red ribbon
  200,  // 3: heading pop
  150,  // 4: subheading fade
  150,  // 5: day flavour fade
  300,  // 6: badge pop
  250,  // 7: "You earned" slide-up
  200,  // 8: rank name word-pop
  200,  // 9: rank flavour slide-up
  300,  // 10: "Today's score" slide-up
  200,  // 11: score number pop
  100,  // 12: "pts" fade
  250,  // 13: "Rank thresholds" move
  150,  // 14: ladder rows (stagger rise)
  400,  // 15: footer move
]

// ── Component ───────────────────────────────────────────────────────────────

export default function ResultCard({
  game,
  score,
  streak,
  won,
  puzzleLabel,
  onViewResults,
  animateEntrance = false,
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
  const colors = GAME_COLORS[game]

  const displayScore = game === 'shelf-price' ? `${streak}/10` : String(score)
  const scoreLabel = game === 'shelf-price' ? 'streak' : 'pts'

  const step = useEntranceSteps(15, STEP_GAPS, animateEntrance)

  // Split rank name into words for word-pop
  const rankWords = rankName.split(' ')

  return (
    <div
      className="mx-auto w-full max-w-[850px] overflow-hidden rounded-[24px] border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] shadow-sm"
      style={entrance('wipe', step >= 1)}
    >
      {/* Top accent line — green for win, red for loss */}
      <div
        className={`h-[4px] w-full ${won ? 'bg-[hsl(var(--game-green))]' : 'bg-[hsl(var(--game-red))]'}`}
        style={entrance('wipe', step >= 2)}
      />

      {/* Top bar */}
      <div className="flex items-center gap-2 border-b border-[hsl(var(--game-ink))]/10 px-8 py-4">
        <div className="flex flex-col gap-px">
          <h3
            className="font-heading text-[18px] font-black text-[hsl(var(--game-ink))]"
            style={entrance('pop', step >= 3)}
          >
            {heading}
          </h3>
          <p
            className="text-[14px] font-semibold text-[hsl(var(--game-ink-mid))]"
            style={entrance('fade', step >= 4)}
          >
            {subheading}
          </p>
        </div>
        <div className="flex-1" />
        <p
          className="text-[14px] font-semibold italic text-[hsl(var(--game-ink-light))]"
          style={entrance('fade', step >= 5)}
        >
          {dayFlavour}
        </p>
      </div>

      {/* Two-column body */}
      <div className="grid min-h-[250px] grid-cols-1 md:grid-cols-2">
        {/* Left column — badge + rank */}
        <div className="flex flex-col items-center justify-center gap-4 border-b border-[hsl(var(--game-ink))]/10 px-6 py-9 text-center md:border-b-0 md:border-r">
          <div className="transition-transform duration-200 hover:scale-[1.07] hover:rotate-[3deg]">
            <div
              className="badge-shimmer flex h-[200px] w-[200px] items-center justify-center rounded-full text-[11px] font-bold uppercase tracking-[0.04em] text-white/30"
              style={{
                backgroundColor: colors.accent,
                boxShadow: `0 10px 32px ${colors.shadow}`,
                ...entrance('pop', step >= 6),
              }}
            >
              {/* TODO: replace with rank badge illustration */}
              BADGE
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <p
              className="font-heading text-[11px] font-extrabold uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]"
              style={entrance('slide-up', step >= 7)}
            >
              You earned
            </p>
            <p className="font-heading text-3xl font-black leading-none" style={{ color: colors.accent }}>
              {rankWords.map((word, i) => (
                <span
                  key={i}
                  className="inline-block"
                  style={{
                    '--ih-tilt': `${i % 2 === 0 ? -3 : 3}deg`,
                    ...entrance('word-pop', step >= 8, i * 100),
                    ...(i > 0 ? { marginLeft: '0.25em' } : {}),
                  } as React.CSSProperties}
                >
                  {word}
                </span>
              ))}
            </p>
            <p
              className="max-w-[250px] text-[14px] font-semibold italic text-[hsl(var(--game-ink-mid))]"
              style={entrance('slide-up', step >= 9)}
            >
              {rankFlavour}
            </p>
          </div>
        </div>

        {/* Right column — score + ladder */}
        <div className="flex flex-col gap-5 px-6 py-8">
          {/* Score */}
          <div className="flex flex-col gap-0.5">
            <p
              className="font-heading text-[11px] font-extrabold uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]"
              style={entrance('slide-up', step >= 10)}
            >
              Today&apos;s score
            </p>
            <div className="flex items-baseline">
              <span
                className="font-heading text-[50px] font-black leading-none tracking-tight"
                style={{ color: colors.accent, ...entrance('pop', step >= 11) }}
              >
                {displayScore}
              </span>
              <span
                className="ml-2 font-heading text-[16px] font-bold tracking-[0.1em] text-[hsl(var(--game-ink-light))]"
                style={entrance('fade', step >= 12)}
              >
                {scoreLabel}
              </span>
            </div>
          </div>

          {/* Rank ladder */}
          <div className="flex flex-1 flex-col justify-end gap-2">
            <p
              className="mb-0.5 font-heading text-[11px] font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--game-ink-light))]"
              style={entrance('move', step >= 13)}
            >
              Rank thresholds
            </p>
            {ladder.map((tier, i) => {
              const isCurrentRank = i === currentRankIndex
              const isAchieved = i < currentRankIndex

              return (
                <div
                  key={tier.name}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 transition-all duration-200 ${
                    isCurrentRank
                      ? 'animate-ring-pulse'
                      : isAchieved
                        ? 'opacity-50 hover:opacity-70 hover:translate-x-1'
                        : 'border-[1.5px] border-dashed border-[hsl(var(--game-ink))]/10 hover:border-[hsl(var(--game-ink))]/20 hover:translate-x-1'
                  }`}
                  style={{
                    ...(isCurrentRank ? {
                      backgroundColor: `color-mix(in srgb, ${colors.accent} 8%, transparent)`,
                      boxShadow: `0 0 0 1.5px color-mix(in srgb, ${colors.accent} 25%, transparent)`,
                    } : {}),
                    ...entrance('rise', step >= 14, i * 100),
                  }}
                >
                  <div
                    className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                      isAchieved
                        ? 'bg-[hsl(var(--game-green))]'
                        : !isCurrentRank
                          ? 'bg-[hsl(var(--game-cream-dark))]'
                          : ''
                    }`}
                    style={isCurrentRank ? { backgroundColor: colors.accent } : undefined}
                  />
                  <div className="flex-1">
                    <p
                      className={`font-heading text-[13px] font-extrabold ${
                        isCurrentRank
                          ? ''
                          : 'text-[hsl(var(--game-ink))]'
                      }`}
                      style={isCurrentRank ? { color: colors.accent } : undefined}
                    >
                      {tier.name}
                    </p>
                    <p className="font-heading text-[12px] font-semibold text-[hsl(var(--game-ink-light))]">
                      {tier.label}
                    </p>
                  </div>
                  {isCurrentRank && (
                    <span className="font-heading text-[11px] font-extrabold uppercase tracking-[0.08em]" style={{ color: colors.accent }}>
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
        <p
          className="text-[13px] font-semibold text-[hsl(var(--game-ink-light))]"
          style={entrance('move', step >= 15)}
        >
          {puzzleLabel}
        </p>
        <button
          onClick={onViewResults}
          className="text-[14px] font-bold underline underline-offset-2 transition-colors"
          style={{ color: colors.accent, textDecorationColor: `color-mix(in srgb, ${colors.accent} 30%, transparent)`, ...entrance('move', step >= 15, 150) }}
        >
          View full results &rarr;
        </button>
      </div>
    </div>
  )
}
