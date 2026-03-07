'use client'

import { useState } from 'react'
import type { ShelfPriceGame } from '../data/games'
import { igdbCoverUrl } from '../../street-date/lib/imageUtils'

interface GameCardsProps {
  left: ShelfPriceGame
  right: ShelfPriceGame
  onChoice: (choice: 'left' | 'right') => void
  disabled: boolean
  result: { choice: 'left' | 'right'; correct: boolean } | null
}

export default function GameCards({
  left,
  right,
  onChoice,
  disabled,
  result,
}: GameCardsProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-3 sm:gap-5">
      <Card
        game={left}
        side="left"
        onChoice={() => onChoice('left')}
        disabled={disabled}
        result={result}
      />

      {/* VS divider */}
      <div className="relative z-10 flex items-center justify-center">
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/15" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-3 border-[hsl(var(--game-ink))]/10 bg-white font-heading text-sm font-black text-[hsl(var(--game-ink-mid))] shadow-lg">
          VS
        </div>
      </div>

      <Card
        game={right}
        side="right"
        onChoice={() => onChoice('right')}
        disabled={disabled}
        result={result}
      />
    </div>
  )
}

// ── Card sub-component ──────────────────────────────────────────────────────

interface CardProps {
  game: ShelfPriceGame
  side: 'left' | 'right'
  onChoice: () => void
  disabled: boolean
  result: { choice: 'left' | 'right'; correct: boolean } | null
}

function Card({ game, side, onChoice, disabled, result }: CardProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const isRevealed = result !== null
  const wasChosen = result?.choice === side
  const isCorrectChoice = wasChosen && result?.correct
  const isWrongChoice = wasChosen && !result?.correct
  const isOtherCorrect = !wasChosen && isRevealed && !result?.correct

  const decade = `${Math.floor(game.year / 10) * 10}s`
  const genreLabel = game.genres.slice(0, 2).join(', ')

  // Determine overlay colour
  let overlayClass = 'bg-black/45'
  if (isRevealed) {
    if (isCorrectChoice || isOtherCorrect) {
      overlayClass = 'bg-[hsl(var(--game-green))]/50'
    } else if (isWrongChoice) {
      overlayClass = 'bg-[hsl(var(--game-red))]/50'
    } else {
      overlayClass = 'bg-black/65'
    }
  }

  return (
    <button
      onClick={onChoice}
      disabled={disabled || isRevealed}
      className={`group relative flex flex-col overflow-hidden rounded-2xl transition-all ${
        !disabled && !isRevealed ? 'cursor-pointer hover:shadow-2xl' : ''
      }`}
      style={{ minHeight: 'min(75vh, 640px)' }}
    >
      {/* Background cover image */}
      {imgFailed ? (
        <div className="absolute inset-0 bg-[hsl(var(--game-ink))]" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={igdbCoverUrl(game.igdbImageId)}
          alt={game.title}
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[6s] ${
            !disabled && !isRevealed ? 'scale-[1.04] group-hover:scale-100' : 'scale-[1.04]'
          }`}
          onError={() => setImgFailed(true)}
        />
      )}

      {/* Colour overlay */}
      <div
        className={`absolute inset-0 transition-all duration-500 ${overlayClass} ${
          !disabled && !isRevealed ? 'group-hover:bg-black/30' : ''
        }`}
      />

      {/* Top row — decade pill */}
      <div className="relative z-[2] p-5 sm:p-8">
        <span className="rounded-full bg-black/30 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.25em] text-white/60">
          {decade}
        </span>
      </div>

      {/* Centered result icon */}
      {isRevealed && (isCorrectChoice || isWrongChoice) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div
            className={`flex h-[72px] w-[72px] items-center justify-center rounded-full text-[32px] text-white ${
              isCorrectChoice ? 'bg-[hsl(var(--game-green))]' : 'bg-[hsl(var(--game-red))]'
            }`}
            style={{
              animation: 'reveal-pop 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {isCorrectChoice ? '\u2713' : '\u2717'}
          </div>
        </div>
      )}

      {/* Content area — bottom-left aligned */}
      <div className="relative z-[2] mt-auto flex flex-col items-start p-5 sm:p-8">
        {/* Genre label */}
        <span
          className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-white/50"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
        >
          {genreLabel}
        </span>

        {/* Title */}
        <h3
          className="mt-1 font-heading font-black leading-[1.05] text-white"
          style={{
            fontSize: 'clamp(18px, 2.5vw, 32px)',
            textShadow: '0 2px 12px rgba(0,0,0,0.5)',
          }}
        >
          {game.title}
        </h3>

        {/* Price reveal */}
        {isRevealed && (
          <div
            className="mt-3 flex items-center gap-3"
            style={{ animation: 'reveal-pop 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
          >
            <span
              className="font-heading text-white"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em' }}
            >
              ${game.launchPriceUsd.toFixed(2)}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60 leading-tight">
              launch<br />price
            </span>
          </div>
        )}

        {/* CTA button — left aligned */}
        {!isRevealed && (
          <div className="mt-4">
            <span
              className={`inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-heading text-[11px] font-extrabold uppercase tracking-[0.15em] text-[hsl(var(--game-ink))] shadow-lg transition-all ${
                !disabled
                  ? 'group-hover:-translate-y-0.5 group-hover:bg-[hsl(var(--game-blue))] group-hover:text-white group-hover:shadow-xl'
                  : 'opacity-50'
              }`}
            >
              This one cost more
              <span className="text-sm">&rsaquo;</span>
            </span>
          </div>
        )}
      </div>
    </button>
  )
}
