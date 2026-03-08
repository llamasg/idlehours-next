'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, use } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import DiscoverMore from '@/components/DiscoverMore'
import Link from 'next/link'
import { GAMES, type GameSenseGame } from '../data/games'
import {
  getGameIndexForDate,
  formatGameNumber,
  formatDisplayDate,
  isPlayableDate,
  isToday,
} from '../lib/dateUtils'
import { calculateRank, getGameAtRank } from '../lib/scoring'
import { loadDayState, saveDayState, type DayState } from '../lib/storage'
import AnimatedScore from '@/components/AnimatedScore'
import GuessInput from '../components/GuessInput'
import GuessList from '../components/GuessList'
import SentenceClue, { type BlankDef, BLANK_COSTS } from '../components/SentenceClue'
import WinModal from '../components/WinModal'
import RulesModal from '../components/RulesModal'
import ProximityCounter from '../components/ProximityCounter'

const GUESS_COST = 20

export default function GameSenseDayPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = use(params)

  const [state, setState] = useState<DayState | null>(null)
  const [showWinModal, setShowWinModal] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [floatingCost, setFloatingCost] = useState<{ key: string; cost: number } | null>(null)
  const [scorePulse, setScorePulse] = useState(false)

  // Hint state
  const [hints, setHints] = useState<{ title: string; rank: number }[]>([])

  // Countdown animation state
  const [pendingGuess, setPendingGuess] = useState<{
    game: GameSenseGame
    proximity: number
  } | null>(null)

  const answer: GameSenseGame = GAMES[getGameIndexForDate(date)]
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
    (game: GameSenseGame) => {
      if (!state || state.won || pendingGuess) return

      const proximity = calculateRank(game, answer)

      // Deduct guess cost immediately
      const newState: DayState = {
        ...state,
        score: Math.max(0, state.score - GUESS_COST),
      }
      setState(newState)
      saveDayState(date, newState)

      // Start the countdown animation
      setPendingGuess({ game, proximity })
    },
    [state, answer, date, pendingGuess],
  )

  const handleCountdownComplete = useCallback(() => {
    if (!pendingGuess || !state) return

    const { game, proximity } = pendingGuess
    const won = proximity === 1
    const newState: DayState = {
      ...state,
      guesses: [...state.guesses, { gameId: game.id, proximity }],
      won,
    }

    setState(newState)
    saveDayState(date, newState)
    setPendingGuess(null)

    if (won) {
      setTimeout(() => setShowWinModal(true), 300)
    }
  }, [pendingGuess, state, date])

  const handleRevealBlank = useCallback(
    (blank: BlankDef) => {
      if (!state || state.won || pendingGuess) return
      if (state.blanksRevealed.includes(blank.key)) return

      const cost = BLANK_COSTS[blank.key] ?? 0
      const newState: DayState = {
        ...state,
        score: Math.max(0, state.score - cost),
        blanksRevealed: [...state.blanksRevealed, blank.key],
      }

      setState(newState)
      saveDayState(date, newState)

      // Trigger floating cost + red flash animation
      setFloatingCost({ key: blank.key, cost })
      setScorePulse(true)
      setTimeout(() => {
        setFloatingCost(null)
        setScorePulse(false)
      }, 1200)
    },
    [state, date, pendingGuess],
  )

  const handleHint = useCallback(() => {
    if (!state || state.won || pendingGuess || state.guesses.length === 0) return

    // Find best (lowest) proximity from guesses
    const bestProximity = Math.min(...state.guesses.map((g) => g.proximity))
    if (bestProximity <= 1) return

    // Each hint halves the distance: first hint = best/2, second = best/4, etc.
    const divisor = Math.pow(2, hints.length + 1)
    const targetRank = Math.max(2, Math.round(bestProximity / divisor))

    // Exclude already-hinted games and guessed games
    const excludeIds = [
      ...state.guesses.map((g) => g.gameId),
      ...hints.map((h) => h.title), // won't match IDs but that's fine
    ]

    const hintGame = getGameAtRank(answer, targetRank, excludeIds)
    if (!hintGame) return

    setHints((prev) => [...prev, { title: hintGame.title, rank: targetRank }])
  }, [state, pendingGuess, hints, answer])

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
  const isAnimating = pendingGuess !== null

  return (
    <>
      <Header />

      <main className="font-game mx-auto max-w-2xl px-4 py-8">
        {/* Game header */}
        <div className="mb-6 text-center">
          <h1 className="text-[clamp(40px,8vw,64px)] font-black uppercase leading-none text-[hsl(var(--game-blue))]">
            Game Sense
          </h1>

          <p className="mt-1.5 text-sm text-muted-foreground">
            Guess the game — higher score is better!
          </p>
          <p className="mt-0.5 font-heading text-xs text-muted-foreground/70">
            {formatGameNumber(date)} &middot; {formatDisplayDate(date)}
          </p>

          {/* Score pill */}
          <div
            className="relative mt-3 inline-flex items-center gap-2 rounded-full border-2 bg-card px-5 py-2 transition-all duration-300"
            style={{
              borderColor: scorePulse
                ? 'hsl(var(--game-red))'
                : 'hsl(var(--game-blue) / 0.2)',
              transform: scorePulse ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <AnimatedScore
              value={state.score}
              className="font-heading text-2xl font-black"
            />
            <span className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
              pts
            </span>
            {/* Floating cost animation */}
            {floatingCost && (
              <span
                key={floatingCost.key}
                className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(var(--game-red))] px-4 py-1 font-heading text-lg font-black text-white shadow-lg"
                style={{ animation: 'float-up 1.2s ease-out forwards' }}
              >
                -{floatingCost.cost}
              </span>
            )}
          </div>
        </div>

        {/* Not playable message */}
        {!playable && (
          <div className="mb-8 rounded-lg border border-border/60 bg-muted/30 px-4 py-6 text-center">
            <p className="text-muted-foreground">
              This game isn&apos;t available yet. Check back on the right day!
            </p>
            <Link
              href="/play/game-sense"
              className="mt-3 inline-block text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Go to today&apos;s game &rarr;
            </Link>
          </div>
        )}

        {/* Sentence clue */}
        {playable && (
          <div className="mb-8">
            <SentenceClue
              answer={answer}
              blanksRevealed={state.blanksRevealed}
              score={state.score}
              onRevealBlank={handleRevealBlank}
              disabled={state.won || isAnimating}
            />
          </div>
        )}

        {/* Proximity countdown animation */}
        {pendingGuess && (
          <div className="mb-6">
            <ProximityCounter
              gameTitle={pendingGuess.game.title}
              targetRank={pendingGuess.proximity}
              onComplete={handleCountdownComplete}
            />
          </div>
        )}

        {/* Guess input — hidden when won, not playable, or animating */}
        {playable && !state.won && !isAnimating && (
          <div className="mb-6">
            <GuessInput
              onGuess={handleGuess}
              guessedIds={guessedIds}
              disabled={false}
              onHelpClick={() => setShowRules(true)}
            />

            {/* Hint button — appears after first guess */}
            {state.guesses.length > 0 && (
              <div className="mt-3 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleHint}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-[hsl(var(--game-blue))] hover:text-[hsl(var(--game-blue))]"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Hint
                </button>

                {/* Revealed hints */}
                {hints.map((hint, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    <span className="font-semibold text-[hsl(var(--game-blue))]">{hint.title}</span>
                    {' '}is closer (rank ~{hint.rank})
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Won inline message — when won and modal closed */}
        {state.won && !showWinModal && !isAnimating && (
          <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-4 text-center">
            <p className="text-sm font-semibold text-green-700">
              You guessed it! &mdash; {answer.title}
            </p>
            <button
              onClick={() => setShowWinModal(true)}
              className="mt-2 text-sm text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
            >
              View results
            </button>
          </div>
        )}

        {/* Guess list */}
        {playable && state.guesses.length > 0 && !isAnimating && (
          <div className="mb-8">
            <GuessList guesses={state.guesses} />
          </div>
        )}

        {/* End-game: nav pills + discover more */}
        {state.won && !showWinModal && !isAnimating && (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
              {!today && (
                <Link
                  href="/play/game-sense"
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                >
                  Play today&apos;s game
                </Link>
              )}
              <Link
                href="/play/game-sense/archive"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              >
                Browse the archive
              </Link>
            </div>
            <div className="mb-8">
              <DiscoverMore currentGame="game-sense" />
            </div>
          </>
        )}

        {/* Nav pills — during gameplay */}
        {!(state.won && !showWinModal && !isAnimating) && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {!today && (
              <Link
                href="/play/game-sense"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              >
                Play today&apos;s game
              </Link>
            )}
            <Link
              href="/play/game-sense/archive"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              Browse the archive
            </Link>
          </div>
        )}
      </main>

      <SiteFooter />

      {/* Rules modal */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {/* Win modal */}
      {showWinModal && state.won && (
        <WinModal
          dateStr={date}
          answer={answer}
          score={state.score}
          guesses={state.guesses}
          blanksRevealedCount={state.blanksRevealed.length}
          onClose={() => setShowWinModal(false)}
        />
      )}
    </>
  )
}
