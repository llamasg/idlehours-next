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
import { calculateRank } from '../lib/scoring'
import { loadDayState, saveDayState, type DayState } from '../lib/storage'
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

          {/* Subtitle + help button */}
          <div className="mt-1.5 flex items-center justify-center gap-2">
            <p className="font-heading text-sm text-muted-foreground">
              {formatGameNumber(date)} &middot; {formatDisplayDate(date)}
            </p>
            <button
              onClick={() => setShowRules(true)}
              className="flex h-5 w-5 items-center justify-center rounded-full border border-border/80 text-[11px] font-bold text-muted-foreground transition-colors hover:border-[hsl(var(--game-blue))] hover:text-[hsl(var(--game-blue))]"
              aria-label="How to play"
            >
              ?
            </button>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Guess the game — higher score is better!
          </p>

          {/* Score pill */}
          <div
            className="relative mt-3 inline-flex items-center gap-2 rounded-full border-2 bg-white px-5 py-2 transition-all duration-300"
            style={{
              borderColor: scorePulse
                ? 'hsl(var(--game-red))'
                : 'hsl(var(--game-blue) / 0.2)',
              transform: scorePulse ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <span
              className="font-heading text-2xl font-black transition-colors duration-300"
              style={{
                color: scorePulse
                  ? 'hsl(var(--game-red))'
                  : 'hsl(var(--game-blue))',
              }}
            >
              {state.score}
            </span>
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
            />
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
                  <span className="text-base">&rsaquo;</span>
                </Link>
              )}
              <Link
                href="/play/game-sense/archive"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              >
                Browse the archive
                <span className="text-base">&rsaquo;</span>
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
                <span className="text-base">&rsaquo;</span>
              </Link>
            )}
            <Link
              href="/play/game-sense/archive"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              Browse the archive
              <span className="text-base">&rsaquo;</span>
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
