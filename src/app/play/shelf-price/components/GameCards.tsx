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
    <div className="relative grid grid-cols-2 items-stretch gap-1 overflow-visible sm:gap-5">
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

      {/* VS circle — overlaid between cards */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border-3 border-[hsl(var(--game-ink))]/10 bg-white font-heading text-[10px] font-black text-[hsl(var(--game-ink-mid))] shadow-lg sm:h-12 sm:w-12 sm:text-sm">
          VS
        </div>
      </div>

      {/* Result text — near top so it doesn't overlap tick/cross */}
      {phase === 'result' && (
        <div
          className="absolute inset-x-0 top-[15%] z-20 flex justify-center"
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
    <div className="relative mx-auto w-full max-w-[450px]">
      <button
        onClick={onChoice}
        disabled={disabled}
        className={`group relative w-full overflow-hidden rounded-2xl transition-all ${
          !disabled ? 'cursor-pointer hover:shadow-2xl' : ''
        }`}
        style={{ height: 'clamp(320px, 50vw, 480px)' }}
      >
        {/* Background cover image */}
        <div className="absolute inset-0">
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
          <div
            className={`absolute inset-0 transition-all duration-500 ${overlayClass} ${
              !disabled ? 'group-hover:bg-black/30' : ''
            }`}
          />
        </div>

        {/* Card content — decade at top, everything else pinned to bottom */}
        <div className="relative z-[2] flex h-full flex-col items-start">
          {/* Decade pill — top */}
          <div className="p-3 pb-0 sm:p-8 sm:pb-0">
            <span className="rounded-full bg-black/30 px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.2em] text-white/60 sm:px-2.5 sm:py-1 sm:text-[9px] sm:tracking-[0.25em]">
              {decade}
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom content — genre, title, price — all left-aligned */}
          <div className="w-full bg-gradient-to-t from-black/60 via-black/30 to-transparent px-3 pb-4 pt-10 sm:px-8 sm:pb-8 sm:pt-12">
            <span
              className="block text-left font-heading text-[8px] font-bold uppercase tracking-[0.15em] text-white/50 sm:text-[10px] sm:tracking-[0.2em]"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
            >
              {genreLabel}
            </span>

            <h3
              className="mt-0.5 text-left font-heading text-[clamp(14px,3.5vw,32px)] font-black leading-[1.05] text-white sm:mt-1"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
            >
              {game.title}
            </h3>

            {priceRevealed && (
              <div className="mt-2 flex items-center gap-2 sm:mt-3 sm:gap-3">
                <span
                  className="font-heading text-[clamp(22px,5vw,52px)] font-[800] tabular-nums leading-none text-white"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  {displayPrice}
                </span>
                <span className="text-[7px] font-bold uppercase tracking-[0.15em] text-white/60 leading-tight sm:text-[9px] sm:tracking-[0.2em]">
                  launch<br />price
                </span>
              </div>
            )}
          </div>
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
      </button>

    </div>
  )
}
