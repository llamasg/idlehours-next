'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { ShelfPriceGame } from '../data/games'
import { igdbCoverUrl } from '../../street-date/lib/imageUtils'
import { COPY, pickRandom } from '@/components/games/GameEndModal.copy'

type RevealPhase = 'idle' | 'other-counting' | 'chosen-counting' | 'result'

interface GameCardsProps {
  left: ShelfPriceGame
  right: ShelfPriceGame
  onChoice: (choice: 'left' | 'right') => void
  disabled: boolean
  /** Once set, triggers the phased reveal sequence */
  chosenSide: 'left' | 'right' | null
  correct: boolean | null
  onRevealComplete: () => void
}

/**
 * Animate a price from 0 → target over `duration` ms with ease-out power curve.
 * Returns a cleanup function.
 */
function animatePrice(
  target: number,
  duration: number,
  power: number,
  onTick: (val: number) => void,
  onDone: () => void,
): () => void {
  const start = Date.now()
  let raf = 0

  function tick() {
    const elapsed = Date.now() - start
    const progress = Math.min(1, elapsed / duration)
    const eased = 1 - Math.pow(1 - progress, power)
    onTick(eased * target)

    if (progress < 1) {
      raf = requestAnimationFrame(tick)
    } else {
      onTick(target)
      onDone()
    }
  }

  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}

export default function GameCards({
  left,
  right,
  onChoice,
  disabled,
  chosenSide,
  correct,
  onRevealComplete,
}: GameCardsProps) {
  const [phase, setPhase] = useState<RevealPhase>('idle')
  const [leftPrice, setLeftPrice] = useState<number | null>(null)
  const [rightPrice, setRightPrice] = useState<number | null>(null)
  const [resultText, setResultText] = useState('')
  const cleanupRef = useRef<(() => void) | null>(null)

  const otherSide = chosenSide === 'left' ? 'right' : 'left'

  // Start reveal sequence when chosenSide is set
  useEffect(() => {
    if (chosenSide === null) return

    const otherGame = chosenSide === 'left' ? right : left
    const chosenGame = chosenSide === 'left' ? left : right
    const setOtherPrice = chosenSide === 'left' ? setRightPrice : setLeftPrice
    const setChosenPrice = chosenSide === 'left' ? setLeftPrice : setRightPrice

    // Phase 1: Count up the OTHER card (1s, moderate easing)
    setPhase('other-counting')
    cleanupRef.current = animatePrice(
      otherGame.launchPriceUsd,
      1000,
      3,
      (val) => setOtherPrice(val),
      () => {
        // Brief pause, then Phase 2: Count up CHOSEN card (1.5s, dramatic easing)
        const t = setTimeout(() => {
          setPhase('chosen-counting')
          cleanupRef.current = animatePrice(
            chosenGame.launchPriceUsd,
            1500,
            5,
            (val) => setChosenPrice(val),
            () => {
              // Phase 3: Show result
              const t2 = setTimeout(() => {
                setPhase('result')
                setResultText(pickRandom(correct ? COPY.shelfPriceCorrect : COPY.shelfPriceWrong))
                // Hold for 1.5s then notify parent
                const t3 = setTimeout(() => {
                  onRevealComplete()
                }, 1500)
                cleanupRef.current = () => clearTimeout(t3)
              }, 200)
              cleanupRef.current = () => clearTimeout(t2)
            },
          )
        }, 300)
        cleanupRef.current = () => clearTimeout(t)
      },
    )

    return () => {
      cleanupRef.current?.()
    }
  }, [chosenSide]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset when cards change (new round)
  useEffect(() => {
    if (chosenSide === null) {
      setPhase('idle')
      setLeftPrice(null)
      setRightPrice(null)
    }
  }, [chosenSide])

  return (
    <div className="relative grid grid-cols-1 items-stretch gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-5">
      <Card
        game={left}
        side="left"
        onChoice={() => onChoice('left')}
        disabled={disabled || phase !== 'idle'}
        animatedPrice={leftPrice}
        showResultIcon={phase === 'result'}
        isChosen={chosenSide === 'left'}
        isCorrect={chosenSide === 'left' ? (correct ?? false) : !(correct ?? true)}
        isCounting={
          (phase === 'other-counting' && chosenSide !== 'left') ||
          (phase === 'chosen-counting' && chosenSide === 'left')
        }
      />

      {/* VS divider — horizontal on mobile, vertical on desktop */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Vertical line (desktop) */}
        <div className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-white/15 md:block" />
        {/* Horizontal line (mobile) */}
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border/30 md:hidden" />
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-3 border-[hsl(var(--game-ink))]/10 bg-white font-heading text-xs font-black text-[hsl(var(--game-ink-mid))] shadow-lg md:h-12 md:w-12 md:text-sm">
          VS
        </div>
      </div>

      <Card
        game={right}
        side="right"
        onChoice={() => onChoice('right')}
        disabled={disabled || phase !== 'idle'}
        animatedPrice={rightPrice}
        showResultIcon={phase === 'result'}
        isChosen={chosenSide === 'right'}
        isCorrect={chosenSide === 'right' ? (correct ?? false) : !(correct ?? true)}
        isCounting={
          (phase === 'other-counting' && chosenSide !== 'right') ||
          (phase === 'chosen-counting' && chosenSide === 'right')
        }
      />

      {/* Center result text */}
      {phase === 'result' && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center"
          style={{ animation: 'result-flash 0.4s cubic-bezier(0.22,1.2,0.36,1) both' }}
        >
          <div
            className={`rounded-xl px-6 py-3 font-heading text-lg font-black text-white shadow-2xl sm:text-2xl ${
              correct ? 'bg-[hsl(var(--game-green))]' : 'bg-[hsl(var(--game-red))]'
            }`}
          >
            {resultText}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Card sub-component ──────────────────────────────────────────────────────

interface CardProps {
  game: ShelfPriceGame
  side: 'left' | 'right'
  onChoice: () => void
  disabled: boolean
  animatedPrice: number | null
  showResultIcon: boolean
  isChosen: boolean
  isCorrect: boolean
  isCounting: boolean
}

function Card({
  game,
  side,
  onChoice,
  disabled,
  animatedPrice,
  showResultIcon,
  isChosen,
  isCorrect,
  isCounting,
}: CardProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const priceRevealed = animatedPrice !== null

  const decade = `${Math.floor(game.year / 10) * 10}s`
  const genreLabel = game.genres.slice(0, 2).join(', ')

  // Overlay colour
  let overlayClass = 'bg-black/45'
  if (showResultIcon) {
    if (isCorrect) {
      overlayClass = 'bg-[hsl(var(--game-green))]/50'
    } else if (isChosen && !isCorrect) {
      overlayClass = 'bg-[hsl(var(--game-red))]/50'
    } else {
      overlayClass = 'bg-black/65'
    }
  }

  const displayPrice = animatedPrice !== null ? `$${animatedPrice.toFixed(2)}` : null

  return (
    <button
      onClick={onChoice}
      disabled={disabled}
      className={`group relative flex min-h-[min(35vh,280px)] flex-col overflow-hidden rounded-2xl transition-all md:min-h-[min(75vh,640px)] ${
        !disabled ? 'cursor-pointer hover:shadow-2xl' : ''
      }`}
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
            !disabled ? 'scale-[1.04] group-hover:scale-100' : 'scale-[1.04]'
          }`}
          onError={() => setImgFailed(true)}
        />
      )}

      {/* Colour overlay */}
      <div
        className={`absolute inset-0 transition-all duration-500 ${overlayClass} ${
          !disabled ? 'group-hover:bg-black/30' : ''
        }`}
      />

      {/* Top row — decade pill */}
      <div className="relative z-[2] p-5 sm:p-8">
        <span className="rounded-full bg-black/30 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.25em] text-white/60">
          {decade}
        </span>
      </div>

      {/* Result icon */}
      {showResultIcon && isChosen && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div
            className={`flex h-[72px] w-[72px] items-center justify-center rounded-full text-[32px] text-white ${
              isCorrect ? 'bg-[hsl(var(--game-green))]' : 'bg-[hsl(var(--game-red))]'
            }`}
            style={{ animation: 'reveal-pop 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
          >
            {isCorrect ? '\u2713' : '\u2717'}
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

        {/* Price — shows during counting and after */}
        {priceRevealed && (
          <div
            className="mt-3 flex items-center gap-3"
          >
            <span
              className="font-heading tabular-nums text-white"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em' }}
            >
              {displayPrice}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60 leading-tight">
              launch<br />price
            </span>
          </div>
        )}

        {/* CTA button — only in idle phase */}
        {!priceRevealed && (
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
