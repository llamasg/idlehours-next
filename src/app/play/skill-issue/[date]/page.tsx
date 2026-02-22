'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, use } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import Link from 'next/link'
import { GAMES, type SkillIssueGame } from '../data/games'
import {
  getGameIndexForDate,
  formatGameNumber,
  formatDisplayDate,
  isPlayableDate,
  isToday,
} from '../lib/dateUtils'
import { calculateProximity } from '../lib/scoring'
import { loadDayState, saveDayState, type DayState } from '../lib/storage'
import GuessInput from '../components/GuessInput'
import GuessList from '../components/GuessList'
import LifelinePanel, { type Lifeline } from '../components/LifelinePanel'
import WinModal from '../components/WinModal'

const GUESS_COST = 20

export default function SkillIssueDayPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = use(params)

  const [state, setState] = useState<DayState | null>(null)
  const [showWinModal, setShowWinModal] = useState(false)

  const answer: SkillIssueGame = GAMES[getGameIndexForDate(date)]
  const playable = isPlayableDate(date)
  const today = isToday(date)

  // Load state from localStorage on mount
  useEffect(() => {
    const loaded = loadDayState(date)
    setState(loaded)
    if (loaded.won) {
      setShowWinModal(true)
    }
  }, [date])

  const handleGuess = useCallback(
    (game: SkillIssueGame) => {
      if (!state || state.won) return

      const proximity = calculateProximity(game, answer)
      const won = proximity === 1
      const newState: DayState = {
        ...state,
        guesses: [...state.guesses, { gameId: game.id, proximity }],
        score: Math.max(0, state.score - GUESS_COST),
        won,
      }

      setState(newState)
      saveDayState(date, newState)

      if (won) {
        setShowWinModal(true)
      }
    },
    [state, answer, date],
  )

  const handleUseLifeline = useCallback(
    (lifeline: Lifeline, value: string | number | boolean | string[]) => {
      if (!state || state.won) return

      const newState: DayState = {
        ...state,
        score: Math.max(0, state.score - lifeline.cost),
        lifelinesUsed: [...state.lifelinesUsed, lifeline.key],
        lifelinesRevealed: {
          ...state.lifelinesRevealed,
          [lifeline.key]: value,
        },
      }

      setState(newState)
      saveDayState(date, newState)
    },
    [state, date],
  )

  // While loading from localStorage
  if (!state) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-12">
          <p className="text-center text-muted-foreground">Loading...</p>
        </main>
        <SiteFooter />
      </>
    )
  }

  const guessedIds = state.guesses.map((g) => g.gameId)
  const answerYear = state.lifelinesUsed.includes('year')
    ? answer.year
    : null

  return (
    <>
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Old game banner */}
        {playable && !today && (
          <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-700">
            You&apos;re playing a previous day.{' '}
            <Link
              href="/play/skill-issue"
              className="font-semibold underline underline-offset-2 transition-colors hover:text-amber-900"
            >
              Jump to today &rarr;
            </Link>
          </div>
        )}

        {/* Game header */}
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Skill_Issue {formatGameNumber(date)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDisplayDate(date)}
          </p>
          <div className="mt-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 font-heading text-sm font-semibold text-primary">
            {state.score} pts remaining
          </div>
        </div>

        {/* Not playable message */}
        {!playable && (
          <div className="mb-8 rounded-lg border border-border/60 bg-muted/30 px-4 py-6 text-center">
            <p className="text-muted-foreground">
              This game isn&apos;t available yet. Check back on the right day!
            </p>
            <Link
              href="/play/skill-issue"
              className="mt-3 inline-block font-heading text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Go to today&apos;s game &rarr;
            </Link>
          </div>
        )}

        {/* Lifeline panel */}
        {playable && (
          <div className="mb-6">
            <LifelinePanel
              answer={answer}
              lifelinesUsed={state.lifelinesUsed}
              lifelinesRevealed={state.lifelinesRevealed}
              score={state.score}
              onUseLifeline={handleUseLifeline}
              disabled={state.won}
            />
          </div>
        )}

        {/* Guess input — hidden when won or not playable */}
        {playable && !state.won && (
          <div className="mb-6">
            <GuessInput
              onGuess={handleGuess}
              guessedIds={guessedIds}
              disabled={false}
            />
          </div>
        )}

        {/* Won inline message — when won and modal closed */}
        {state.won && !showWinModal && (
          <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-4 text-center">
            <p className="font-heading text-sm font-semibold text-green-700">
              You guessed it! &mdash; {answer.title}
            </p>
            <button
              onClick={() => setShowWinModal(true)}
              className="mt-2 font-heading text-sm text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
            >
              View results
            </button>
          </div>
        )}

        {/* Guess list */}
        {playable && state.guesses.length > 0 && (
          <div className="mb-8">
            <GuessList guesses={state.guesses} answerYear={answerYear} />
          </div>
        )}

        {/* Archive link */}
        <div className="text-center">
          <Link
            href="/play/skill-issue/archive"
            className="font-heading text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Browse the archive &rarr;
          </Link>
        </div>
      </main>

      <SiteFooter />

      {/* Win modal */}
      {showWinModal && state.won && (
        <WinModal
          dateStr={date}
          gameTitle={answer.title}
          gameSlug={answer.id}
          score={state.score}
          guesses={state.guesses}
          lifelinesUsedCount={state.lifelinesUsed.length}
          onClose={() => setShowWinModal(false)}
        />
      )}
    </>
  )
}
