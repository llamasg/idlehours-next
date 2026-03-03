'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, use } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import Link from 'next/link'
import {
  getGameForDate,
  formatGameNumber,
  formatDisplayDate,
  isPlayableDate,
  isToday,
} from '../lib/dateUtils'
import { loadDayState, saveDayState, type DayState } from '../lib/storage'
import GameCard from '../components/GameCard'
import PriceInput from '../components/PriceInput'
import StarScore from '../../street-date/components/StarScore'
import WinModal from '../components/WinModal'

export default function ShelfPriceDayPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = use(params)

  const [state, setState] = useState<DayState | null>(null)
  const [showModal, setShowModal] = useState(false)

  const game = getGameForDate(date)
  const playable = isPlayableDate(date)
  const today = isToday(date)

  // Load state from localStorage on mount
  useEffect(() => {
    const loaded = loadDayState(date)
    setState(loaded)
    if (loaded.finished) {
      setShowModal(true)
    }
  }, [date])

  const handleSubmit = useCallback(
    (priceGuessed: number) => {
      if (!state || state.won || state.finished) return

      const guessIndex = state.currentGuessIndex
      const isCorrect = Math.abs(priceGuessed - game.launchPriceUsd) <= 2.0

      if (isCorrect) {
        // Won!
        const baseStars = 5 - guessIndex
        const stars = Math.max(0, baseStars - (state.hintUsed ? 1 : 0))
        const newState: DayState = {
          ...state,
          guesses: [
            ...state.guesses,
            { guessIndex, priceGuessed },
          ],
          won: true,
          finished: true,
          stars,
          score: stars * 100,
          currentGuessIndex: guessIndex,
        }
        setState(newState)
        saveDayState(date, newState)
        setShowModal(true)
      } else {
        // Wrong guess
        const nextIndex = guessIndex + 1
        const finished = nextIndex >= 5

        const newState: DayState = {
          ...state,
          guesses: [
            ...state.guesses,
            { guessIndex, priceGuessed },
          ],
          won: false,
          finished,
          stars: 0,
          score: 0,
          currentGuessIndex: finished ? guessIndex : nextIndex,
        }
        setState(newState)
        saveDayState(date, newState)

        if (finished) {
          setShowModal(true)
        }
      }
    },
    [state, game.launchPriceUsd, date],
  )

  const handleSkip = useCallback(() => {
    if (!state || state.won || state.finished) return

    const guessIndex = state.currentGuessIndex
    const nextIndex = guessIndex + 1
    const finished = nextIndex >= 5

    const newState: DayState = {
      ...state,
      guesses: [
        ...state.guesses,
        { guessIndex, priceGuessed: 0 },
      ],
      won: false,
      finished,
      stars: 0,
      score: 0,
      currentGuessIndex: finished ? guessIndex : nextIndex,
    }

    setState(newState)
    saveDayState(date, newState)

    if (finished) {
      setShowModal(true)
    }
  }, [state, date])

  const handleHint = useCallback(() => {
    if (!state || state.hintUsed || state.finished) return

    const newState: DayState = {
      ...state,
      hintUsed: true,
    }
    setState(newState)
    saveDayState(date, newState)
  }, [state, date])

  // Loading state
  if (!state) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </main>
        <SiteFooter />
      </>
    )
  }

  const showInput = playable && !state.finished

  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Old game banner */}
        {playable && !today && (
          <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-700">
            You&apos;re playing a previous day.{' '}
            <Link
              href="/play/shelf-price"
              className="font-semibold underline underline-offset-2 transition-colors hover:text-amber-900"
            >
              Jump to today &rarr;
            </Link>
          </div>
        )}

        {/* Game header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              a game by
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/icons/icon_Idlehours logo horizontal-wide-mobile header.svg"
              alt="Idle Hours"
              className="h-4 w-auto opacity-40 dark:invert"
              draggable={false}
            />
          </div>
          <h1 className="mt-2 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Shelf Price
          </h1>
          <p className="mt-2 font-body text-base text-muted-foreground sm:text-lg">
            Guess the launch price
          </p>
          <p className="mt-3 font-heading text-sm text-muted-foreground">
            {formatGameNumber(date)} &middot; {formatDisplayDate(date)}
          </p>
        </div>

        {/* Not playable message */}
        {!playable && (
          <div className="mb-8 rounded-lg border border-border/60 bg-muted/30 px-4 py-6 text-center">
            <p className="text-muted-foreground">
              This game isn&apos;t available yet. Check back on the right day!
            </p>
            <Link
              href="/play/shelf-price"
              className="mt-3 inline-block font-heading text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Go to today&apos;s game &rarr;
            </Link>
          </div>
        )}

        {/* Game card */}
        {playable && (
          <div className="mb-8">
            <GameCard game={game} hintUsed={state.hintUsed} />
          </div>
        )}

        {/* Price input — only during active play */}
        {showInput && (
          <PriceInput
            onSubmit={handleSubmit}
            onSkip={handleSkip}
            onHint={handleHint}
            disabled={false}
            guesses={state.guesses}
            actualPrice={game.launchPriceUsd}
            hintUsed={state.hintUsed}
          />
        )}

        {/* Finished inline (when modal closed) */}
        {state.finished && !showModal && (
          <div className="mb-6 text-center">
            <StarScore stars={state.stars} size="lg" />
            <p className="mt-2 font-heading text-sm text-muted-foreground">
              {state.won
                ? `You got it \u2014 $${game.launchPriceUsd.toFixed(2)}!`
                : `The price was $${game.launchPriceUsd.toFixed(2)}`}
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-2 font-heading text-sm text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
            >
              View results
            </button>
          </div>
        )}

        {/* Archive link */}
        <div className="text-center">
          <Link
            href="/play/shelf-price/archive"
            className="font-heading text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Browse the archive &rarr;
          </Link>
        </div>
      </main>

      <SiteFooter />

      {/* Win/end modal */}
      {showModal && state.finished && (
        <WinModal
          dateStr={date}
          actualPrice={game.launchPriceUsd}
          game={game}
          guesses={state.guesses}
          stars={state.stars}
          score={state.score}
          won={state.won}
          hintUsed={state.hintUsed}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
