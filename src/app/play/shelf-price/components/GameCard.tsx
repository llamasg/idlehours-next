'use client'

import { useState } from 'react'
import type { ShelfPriceGame } from '../data/games'
import { igdbCoverUrl } from '../../street-date/lib/imageUtils'

interface GameCardProps {
  game: ShelfPriceGame
  hintUsed: boolean
}

export default function GameCard({ game, hintUsed }: GameCardProps) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div className="mx-auto max-w-[240px]">
      {/* Cover art */}
      <div className="aspect-[3/4] overflow-hidden rounded-2xl border-2 border-border/60 bg-card shadow-lg">
        {imgFailed ? (
          <div className="flex h-full w-full items-center justify-center bg-muted/30 p-4">
            <span className="text-center font-heading text-sm font-semibold leading-tight text-muted-foreground">
              {game.title}
            </span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={igdbCoverUrl(game.igdbImageId)}
            alt={game.title}
            className="h-full w-full object-cover"
            onError={() => setImgFailed(true)}
          />
        )}
      </div>

      {/* Title */}
      <p className="mt-3 text-center font-heading text-base font-semibold text-foreground">
        {game.title}
      </p>

      {/* Hint: release year */}
      {hintUsed && (
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Released in {game.year}
        </p>
      )}
    </div>
  )
}
