'use client'

import { useState } from 'react'
import type { StreetDateGame } from '../data/games'
import type { CoverAttempt } from '../lib/storage'
import { igdbCoverUrl } from '../lib/imageUtils'

interface ResultsRevealProps {
  answerYear: number
  games: StreetDateGame[]
  attempts: CoverAttempt[]
  stars: number
  hideYear?: boolean
}

export default function ResultsReveal({
  answerYear,
  games,
  hideYear,
}: ResultsRevealProps) {
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set())

  const handleImageError = (index: number) => {
    setFailedImages((prev) => new Set(prev).add(index))
  }

  return (
    <div>
      {/* Answer year — only shown when not in two-column modal */}
      {!hideYear && (
        <p className="text-center font-heading text-4xl font-bold text-primary sm:text-5xl">
          {answerYear}
        </p>
      )}

      {/* 5-game cover strip */}
      <div className={`grid grid-cols-5 gap-3 ${hideYear ? '' : 'mt-6'}`}>
        {games.map((game, i) => {
          const showFallback = failedImages.has(i)

          return (
            <div key={game.id} className="flex flex-col items-center">
              <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted/30 shadow-sm">
                {showFallback ? (
                  <div className="flex h-full w-full items-center justify-center p-2">
                    <span className="text-center font-heading text-[10px] leading-tight text-muted-foreground sm:text-xs">
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
                )}
              </div>
              <p className="mt-2 line-clamp-2 w-full text-center font-heading text-[11px] font-medium leading-snug text-muted-foreground sm:text-xs">
                {game.title}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
