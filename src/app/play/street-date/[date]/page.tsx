'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, use } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import DiscoverMore from '@/components/DiscoverMore'
import Link from 'next/link'
import {
  getYearForDate,
  getGamesForDate,
  formatGameNumber,
  formatDisplayDate,
  isPlayableDate,
  isToday,
} from '../lib/dateUtils'
import { loadDayState, saveDayState, type DayState } from '../lib/storage'
import CoverStrip from '../components/CoverStrip'
import YearInput from '../components/YearInput'
import StarScore from '../components/StarScore'
import WinModal from '../components/WinModal'

export default function StreetDateDayPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = use(params)

  const [state, setState] = useState<DayState | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [viewingCoverIndex, setViewingCoverIndex] = useState(0)

  const answerYear = getYearForDate(date)
  const roundGames = getGamesForDate(date)
  const playable = isPlayableDate(date)
  const today = isToday(date)

  // Load state from localStorage on mount
  useEffect(() => {
    const loaded = loadDayState(date)
    setState(loaded)
    setViewingCoverIndex(loaded.currentCoverIndex)
    if (loaded.finished) {
      setShowModal(true)
    }
  }, [date])

  const handleSubmit = useCallback(
    (yearGuessed: number) => {
      if (!state || state.won || state.finished) return

      const coverIndex = state.currentCoverIndex
      const diff = yearGuessed - answerYear
      const isCorrect = yearGuessed === answerYear

      if (isCorrect) {
        // Won!
        const stars = 5 - coverIndex
        const newState: DayState = {
          ...state,
          attempts: [
            ...state.attempts,
            { coverIndex, yearGuessed, skipped: false },
          ],
          won: true,
          finished: true,
          stars,
          score: stars * 100,
          currentCoverIndex: coverIndex,
        }
        setState(newState)
        saveDayState(date, newState)
        setShowModal(true)
      } else {
        // Wrong guess
        const nextIndex = coverIndex + 1
        const finished = nextIndex >= 5

        const newState: DayState = {
          ...state,
          attempts: [
            ...state.attempts,
            { coverIndex, yearGuessed, skipped: false },
          ],
          won: false,
          finished,
          stars: 0,
          score: 0,
          currentCoverIndex: finished ? coverIndex : nextIndex,
        }
        setState(newState)
        saveDayState(date, newState)
        setViewingCoverIndex(finished ? coverIndex : nextIndex)

        if (finished) {
          setShowModal(true)
        }
      }
    },
    [state, answerYear, date],
  )

  const handleSkip = useCallback(() => {
    if (!state || state.won || state.finished) return

    const coverIndex = state.currentCoverIndex
    const nextIndex = coverIndex + 1
    const finished = nextIndex >= 5

    const newState: DayState = {
      ...state,
      attempts: [
        ...state.attempts,
        { coverIndex, yearGuessed: 0, skipped: true },
      ],
      won: false,
      finished,
      stars: 0,
      score: 0,
      currentCoverIndex: finished ? coverIndex : nextIndex,
    }

    setState(newState)
    saveDayState(date, newState)
    setViewingCoverIndex(finished ? coverIndex : nextIndex)

    if (finished) {
      setShowModal(true)
    }
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

  const revealedCount = state.currentCoverIndex + 1
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
              href="/play/street-date"
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
            Street Date
          </h1>
          <p className="mt-2 font-body text-base text-muted-foreground sm:text-lg">
            Five covers. One year. How close can you get?
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
              href="/play/street-date"
              className="mt-3 inline-block font-heading text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Go to today&apos;s game &rarr;
            </Link>
          </div>
        )}

        {/* Cover strip */}
        {playable && (
          <CoverStrip
            games={roundGames}
            revealedCount={revealedCount}
            activeIndex={viewingCoverIndex}
            attempts={state.attempts}
            onCoverClick={setViewingCoverIndex}
          />
        )}

        {/* Year input + guess history — only during active play */}
        {showInput && (
          <YearInput
            onSubmit={handleSubmit}
            onSkip={handleSkip}
            disabled={false}
            attempts={state.attempts}
            answerYear={answerYear}
          />
        )}

        {/* Finished inline (when modal closed) */}
        {state.finished && !showModal && (
          <div className="mb-6 text-center">
            <StarScore stars={state.stars} size="lg" />
            <p className="mt-2 font-heading text-sm text-muted-foreground">
              {state.won
                ? `You got it \u2014 ${answerYear}!`
                : `The answer was ${answerYear}`}
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

        {/* Discover more — after game ends */}
        {state.finished && !showModal && (
          <div className="mb-8">
            <DiscoverMore currentGame="street-date" />
          </div>
        )}

        {/* Archive link */}
        <div className="text-center">
          <Link
            href="/play/street-date/archive"
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
          answerYear={answerYear}
          games={roundGames}
          attempts={state.attempts}
          stars={state.stars}
          score={state.score}
          won={state.won}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
