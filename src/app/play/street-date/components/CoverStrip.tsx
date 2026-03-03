'use client'

import { useState } from 'react'
import type { StreetDateGame } from '../data/games'
import type { CoverAttempt } from '../lib/storage'
import { igdbCoverUrl } from '../lib/imageUtils'

interface CoverStripProps {
  games: StreetDateGame[]
  revealedCount: number
  activeIndex: number
  attempts: CoverAttempt[]
  onCoverClick: (index: number) => void
}

export default function CoverStrip({
  games,
  revealedCount,
  activeIndex,
  attempts,
  onCoverClick,
}: CoverStripProps) {
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set())

  const handleImageError = (index: number) => {
    setFailedImages((prev) => new Set(prev).add(index))
  }

  // Progress line fill: 0 covers = 0%, 1 = 0%, 2 = 25%, 3 = 50%, 4 = 75%, 5 = 100%
  const fillPercent = revealedCount <= 1 ? 0 : ((revealedCount - 1) / 4) * 100

  return (
    <div className="mb-10">
      {/* Cover strip — constrained so each card ≈ 160-180px wide */}
      <div className="relative mx-auto max-w-4xl grid grid-cols-5 gap-3 sm:gap-5">
        {/* Background progress line — sits behind covers at vertical center of cover cards */}
        <div className="pointer-events-none absolute inset-x-[10%] top-[37.5%] z-0 h-[3px] rounded-full bg-border/40" />

        {/* Filled progress line */}
        <div
          className="pointer-events-none absolute left-[10%] top-[37.5%] z-0 h-[3px] rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${fillPercent * 0.8}%` }}
        />

        {/* Cover frames */}
        {games.map((game, i) => {
          const isRevealed = i < revealedCount
          const isActive = i === activeIndex
          const attempt = attempts.find((a) => a.coverIndex === i)
          const showFallback = failedImages.has(i)

          return (
            <div key={game.id} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                disabled={!isRevealed}
                onClick={() => isRevealed && onCoverClick(i)}
                className={`
                  relative aspect-[3/4] w-full overflow-hidden rounded-xl border-2
                  transition-all duration-300 sm:rounded-2xl
                  ${isRevealed
                    ? 'cursor-pointer border-border/60 bg-card shadow-lg hover:shadow-xl'
                    : 'cursor-default border-border/30 bg-muted/40'
                  }
                  ${isActive && isRevealed ? 'ring-3 ring-primary/50 ring-offset-2 ring-offset-background' : ''}
                `}
              >
                {isRevealed ? (
                  showFallback ? (
                    <div className="flex h-full w-full items-center justify-center bg-muted/30 p-3">
                      <span className="text-center font-heading text-xs font-semibold leading-tight text-muted-foreground sm:text-sm">
                        {game.title}
                      </span>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={igdbCoverUrl(game.igdbImageId)}
                      alt={game.title}
                      className="h-full w-full object-cover"
                      onError={() => handleImageError(i)}
                    />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-heading text-3xl font-bold text-muted-foreground/25 sm:text-5xl">
                      ?
                    </span>
                  </div>
                )}

                {/* Status indicator dot */}
                {attempt && (
                  <div className="absolute right-1.5 top-1.5 sm:right-2.5 sm:top-2.5">
                    <div
                      className={`h-3 w-3 rounded-full border-2 border-white/60 sm:h-4 sm:w-4 ${
                        attempt.skipped
                          ? 'bg-muted-foreground/40'
                          : attempt.yearGuessed === 0
                            ? 'bg-muted-foreground/40'
                            : 'bg-amber-500'
                      }`}
                    />
                  </div>
                )}
              </button>

              {/* Game title below — constrained to card width */}
              <p className="mt-2.5 line-clamp-2 w-full text-center font-heading text-[11px] font-medium leading-snug text-muted-foreground sm:text-sm">
                {isRevealed ? game.title : '\u00A0'}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
