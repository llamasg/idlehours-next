'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, use } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import DiscoverMore from '@/components/DiscoverMore'
import AnimatedScore from '@/components/AnimatedScore'
import Link from 'next/link'
import {
  getPairsForDate,
  formatGameNumber,
  formatDisplayDate,
  isPlayableDate,
  isToday,
} from '../lib/dateUtils'
import { loadDayState, saveDayState, WRONG_PENALTY, TARGET_ROUNDS, type DayState } from '../lib/storage'
import GameCards from '../components/GameCards'
import ProgressBar from '../components/ProgressBar'
import ResultOverlay from '../components/ResultOverlay'
import RulesModal from '../components/RulesModal'

export default function ShelfPriceDayPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = use(params)

  const [state, setState] = useState<DayState | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [chosenSide, setChosenSide] = useState<'left' | 'right' | null>(null)
  const [choiceCorrect, setChoiceCorrect] = useState<boolean | null>(null)
  const [started, setStarted] = useState(false)
  const [floatingCost, setFloatingCost] = useState(false)
  const [scorePulse, setScorePulse] = useState(false)
  const [showRules, setShowRules] = useState(false)

  const pairs = getPairsForDate(date)
  const playable = isPlayableDate(date)
  const today = isToday(date)

  // Load state
  useEffect(() => {
    const loaded = loadDayState(date)
    setState(loaded)
    if (loaded.choices.length > 0) {
      setStarted(true)
    }
    if (loaded.finished) {
      setShowResult(true)
    }
  }, [date])

  // Compute per-round results from choices + pairs
  const roundResults: boolean[] = state
    ? state.choices.map((choice, i) => {
        if (i >= pairs.length) return false
        const [left, right] = pairs[i]
        const moreExpensiveSide = left.launchPriceUsd >= right.launchPriceUsd ? 'left' : 'right'
        return choice === moreExpensiveSide
      })
    : []

  const handleChoice = useCallback(
    (choice: 'left' | 'right') => {
      if (!state || state.finished || chosenSide !== null) return

      const pairIndex = state.round
      if (pairIndex >= pairs.length) return

      const [left, right] = pairs[pairIndex]
      const moreExpensiveSide = left.launchPriceUsd >= right.launchPriceUsd ? 'left' : 'right'
      const correct = choice === moreExpensiveSide

      // Start the phased reveal
      setChosenSide(choice)
      setChoiceCorrect(correct)
    },
    [state, pairs, chosenSide],
  )

  const handleRevealComplete = useCallback(() => {
    if (!state || chosenSide === null || choiceCorrect === null) return

    const correct = choiceCorrect

    // Trigger score animation for wrong answers
    if (!correct) {
      setScorePulse(true)
      setFloatingCost(true)
      setTimeout(() => {
        setScorePulse(false)
        setFloatingCost(false)
      }, 1200)
    }

    const newStreak = correct ? state.streak + 1 : state.streak
    const newRound = state.round + 1
    const newScore = correct ? state.score : Math.max(0, state.score - WRONG_PENALTY)
    const finished = newRound >= TARGET_ROUNDS
    const won = finished && newScore > 0

    const newState: DayState = {
      score: newScore,
      streak: newStreak,
      round: newRound,
      won,
      finished,
      choices: [...state.choices, chosenSide],
    }

    setState(newState)
    saveDayState(date, newState)
    setChosenSide(null)
    setChoiceCorrect(null)

    if (finished) {
      setTimeout(() => setShowResult(true), 300)
    }
  }, [state, chosenSide, choiceCorrect, date])

  const handleStart = () => {
    setStarted(true)
  }

  // Loading
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

  const currentPairIndex = state.round
  const currentPair = pairs[currentPairIndex] ?? pairs[pairs.length - 1]

  return (
    <>
      <Header />

      <main className="font-game mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Not playable */}
        {!playable && (
          <div className="mb-8 rounded-lg border border-border/60 bg-muted/30 px-4 py-6 text-center">
            <p className="text-muted-foreground">
              This game isn&apos;t available yet. Check back on the right day!
            </p>
            <Link
              href="/play/shelf-price"
              className="mt-3 inline-block text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Go to today&apos;s game &rarr;
            </Link>
          </div>
        )}

        {/* Start screen */}
        {playable && !started && !state.finished && (
          <div className="flex flex-col items-center gap-6 py-12 text-center">
            <div>
              <h1 className="text-[clamp(40px,8vw,64px)] font-black uppercase leading-none text-[hsl(var(--game-blue))]">
                Shelf Price
              </h1>
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
                Which cost more at launch?
              </p>
            </div>

            <button
              onClick={handleStart}
              className="rounded-full bg-[hsl(var(--game-blue))] px-8 py-3 text-base font-bold text-white transition-transform hover:scale-105"
            >
              Start Playing
            </button>
          </div>
        )}

        {/* Active gameplay */}
        {playable && started && !state.finished && (
          <div className="flex flex-col gap-6">
            {/* Header bar */}
            <div className="text-center">
              <h1 className="text-[clamp(40px,8vw,64px)] font-black uppercase leading-none text-[hsl(var(--game-blue))]">
                Shelf Price
              </h1>
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
                Which cost more at launch?
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
                <AnimatedScore
                  value={state.score}
                  className="font-heading text-2xl font-black"
                />
                <span className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
                  pts
                </span>
                {floatingCost && (
                  <span
                    className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(var(--game-red))] px-4 py-1 font-heading text-lg font-black text-white shadow-lg"
                    style={{
                      animation: 'float-up 1.2s ease-out forwards',
                    }}
                  >
                    -{WRONG_PENALTY}
                  </span>
                )}
              </div>
            </div>

            {/* Progress */}
            <ProgressBar current={state.round} total={TARGET_ROUNDS} results={roundResults} />

            {/* Game cards */}
            <GameCards
              left={currentPair[0]}
              right={currentPair[1]}
              onChoice={handleChoice}
              disabled={chosenSide !== null}
              chosenSide={chosenSide}
              correct={choiceCorrect}
              onRevealComplete={handleRevealComplete}
            />
          </div>
        )}

        {/* Finished inline (when overlay closed) */}
        {state.finished && !showResult && (
          <>
            <div className="mb-4 text-center">
              <h1 className="text-[clamp(40px,8vw,64px)] font-black uppercase leading-none text-[hsl(var(--game-blue))]">
                Shelf Price
              </h1>
              <p className="mt-1 font-heading text-sm text-muted-foreground">
                {formatGameNumber(date)} &middot; {formatDisplayDate(date)}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-[hsl(var(--game-blue))]/20 bg-white px-5 py-2">
                <span className="font-heading text-2xl font-black text-[hsl(var(--game-blue))]">
                  {state.score}
                </span>
                <span className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
                  pts
                </span>
              </div>
            </div>

            <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-4 text-center">
              <p className="text-sm font-semibold text-green-700">
                {state.score === 1000 ? 'Perfect score!' : `${state.streak}/${TARGET_ROUNDS} correct`}
              </p>
              <button
                onClick={() => setShowResult(true)}
                className="mt-2 text-sm text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
              >
                View results
              </button>
            </div>

            {/* Nav pills */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
              {!today && (
                <Link
                  href="/play/shelf-price"
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                >
                  Play today&apos;s game
                  <span className="text-base">&rsaquo;</span>
                </Link>
              )}
              <Link
                href="/play/shelf-price/archive"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              >
                Browse the archive
                <span className="text-base">&rsaquo;</span>
              </Link>
            </div>

            <div className="mb-8">
              <DiscoverMore currentGame="shelf-price" />
            </div>
          </>
        )}

        {/* Nav pills — during gameplay / start screen */}
        {!(state.finished && !showResult) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {!today && (
              <Link
                href="/play/shelf-price"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              >
                Play today&apos;s game
                <span className="text-base">&rsaquo;</span>
              </Link>
            )}
            <Link
              href="/play/shelf-price/archive"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              Browse the archive
              <span className="text-base">&rsaquo;</span>
            </Link>
          </div>
        )}
      </main>

      <SiteFooter />

      {/* Result overlay */}
      {showResult && state.finished && (
        <ResultOverlay
          dateStr={date}
          score={state.score}
          streak={state.streak}
          won={state.score === 1000}
          onClose={() => setShowResult(false)}
        />
      )}

      {/* Rules modal */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </>
  )
}
