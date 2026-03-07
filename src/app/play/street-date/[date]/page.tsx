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
import {
  loadDayState,
  saveDayState,
  WAGER_MULT,
  PTS_BY_ATTEMPT,
  type DayState,
  type Wager,
} from '../lib/storage'
import CoverStrip from '../components/CoverStrip'
import YearInput from '../components/YearInput'
import WagerSelector from '../components/WagerSelector'
import WinModal from '../components/WinModal'

const MAX_ATTEMPTS = 5

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

  useEffect(() => {
    const loaded = loadDayState(date)
    setState(loaded)
    setViewingCoverIndex(loaded.currentCoverIndex)
    if (loaded.finished) {
      setShowModal(true)
    }
  }, [date])

  const handleWagerChange = useCallback(
    (wager: Wager) => {
      if (!state || state.wagerLocked) return
      const newState: DayState = { ...state, wager }
      setState(newState)
      saveDayState(date, newState)
    },
    [state, date],
  )

  const handleSubmit = useCallback(
    (yearGuessed: number) => {
      if (!state || state.won || state.finished) return

      const coverIndex = state.currentCoverIndex
      const isCorrect = yearGuessed === answerYear

      const wagerLocked = true
      const guessHistory = [...state.guessHistory, yearGuessed]

      if (isCorrect) {
        const basePts = PTS_BY_ATTEMPT[coverIndex] ?? 200
        const score = Math.round(basePts * WAGER_MULT[state.wager])
        const stars = MAX_ATTEMPTS - coverIndex

        const newState: DayState = {
          ...state,
          attempts: [
            ...state.attempts,
            { coverIndex, yearGuessed, skipped: false },
          ],
          won: true,
          finished: true,
          stars,
          score,
          currentCoverIndex: coverIndex,
          wagerLocked,
          guessHistory,
        }
        setState(newState)
        saveDayState(date, newState)
        setShowModal(true)
      } else {
        const nextIndex = coverIndex + 1
        const finished = nextIndex >= MAX_ATTEMPTS

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
          wagerLocked,
          guessHistory,
        }
        setState(newState)
        saveDayState(date, newState)
        setViewingCoverIndex(finished ? coverIndex : nextIndex)

        if (finished) {
          setTimeout(() => setShowModal(true), 800)
        }
      }
    },
    [state, answerYear, date],
  )

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

  const guessHistoryEntries = state.guessHistory.map((year) => ({
    year,
    direction: year === answerYear
      ? 'correct' as const
      : year < answerYear
      ? 'too-low' as const
      : 'too-high' as const,
  }))

  const revealedCount = state.currentCoverIndex + 1
  const showInput = playable && !state.finished
  const attemptsUsed = state.attempts.filter((a) => !a.skipped).length

  // Current score display: show what you'd get if you guess correctly now
  const currentPotential = PTS_BY_ATTEMPT[state.currentCoverIndex] ?? 200
  const displayScore = state.finished
    ? state.score
    : Math.round(currentPotential * WAGER_MULT[state.wager])

  return (
    <>
      <Header />

      <main className="font-game mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Header — matches Game Sense */}
        <div className="mb-8 text-center">
          <h1 className="text-[clamp(40px,8vw,64px)] font-black uppercase leading-none text-[hsl(var(--game-blue))]">
            Street Date
          </h1>
          <p className="mt-1 font-heading text-sm text-muted-foreground">
            {formatGameNumber(date)} &middot; {formatDisplayDate(date)}
          </p>

          {/* Score pill */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-[hsl(var(--game-blue))]/20 bg-white px-5 py-2">
            <span className="font-heading text-2xl font-black text-[hsl(var(--game-blue))]">
              {displayScore}
            </span>
            <span className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
              pts
            </span>
          </div>
        </div>

        {!playable && (
          <div className="mb-8 rounded-lg border border-border/60 bg-muted/30 px-4 py-6 text-center">
            <p className="text-muted-foreground">
              This game isn&apos;t available yet. Check back on the right day!
            </p>
            <Link
              href="/play/street-date"
              className="mt-3 inline-block text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Go to today&apos;s game &rarr;
            </Link>
          </div>
        )}

        {playable && (
          <CoverStrip
            games={roundGames}
            revealedCount={revealedCount}
            activeIndex={viewingCoverIndex}
            attempts={state.attempts}
            onCoverClick={setViewingCoverIndex}
          />
        )}

        {showInput && (
          <div className="mb-6">
            <WagerSelector
              selected={state.wager}
              locked={state.wagerLocked}
              onSelect={handleWagerChange}
            />
          </div>
        )}

        {showInput && (
          <YearInput
            onSubmit={handleSubmit}
            disabled={false}
            guessHistory={guessHistoryEntries}
            attemptsUsed={attemptsUsed}
            maxAttempts={MAX_ATTEMPTS}
          />
        )}

        {state.finished && !showModal && (
          <>
            <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-4 text-center">
              <p className="text-sm font-semibold text-green-700">
                {state.won
                  ? `You got it \u2014 ${answerYear}!`
                  : `The answer was ${answerYear}`}
              </p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="mt-2 text-sm text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
              >
                View results
              </button>
            </div>

            {/* Nav pills — above discover more */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
              {!today && (
                <Link
                  href="/play/street-date"
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                >
                  Play today&apos;s game
                  <span className="text-base">&rsaquo;</span>
                </Link>
              )}
              <Link
                href="/play/street-date/archive"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              >
                Browse the archive
                <span className="text-base">&rsaquo;</span>
              </Link>
            </div>

            <div className="mb-8">
              <DiscoverMore currentGame="street-date" />
            </div>
          </>
        )}

        {/* Nav pills — during gameplay */}
        {!(state.finished && !showModal) && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {!today && (
              <Link
                href="/play/street-date"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              >
                Play today&apos;s game
                <span className="text-base">&rsaquo;</span>
              </Link>
            )}
            <Link
              href="/play/street-date/archive"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              Browse the archive
              <span className="text-base">&rsaquo;</span>
            </Link>
          </div>
        )}
      </main>

      <SiteFooter />

      {showModal && state.finished && (
        <WinModal
          dateStr={date}
          answerYear={answerYear}
          games={roundGames}
          attempts={state.attempts}
          stars={state.stars}
          score={state.score}
          won={state.won}
          wager={state.wager}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
