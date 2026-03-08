'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo, use } from 'react'
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
import GameEndModal from '@/components/games/GameEndModal'
import {
  COPY,
  pickRandom,
  getShelfPriceRank,
  SHELF_PRICE_FLAVOUR,
} from '@/components/games/GameEndModal.copy'
import { igdbCoverUrl } from '../../street-date/lib/imageUtils'
import RulesModal from '../components/RulesModal'
import ResultCard from '@/components/games/ResultCard'
import DailyBadgeShelf from '@/components/games/DailyBadgeShelf'

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

  // Modal copy — picked once when modal opens
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const modalCopy = useMemo(() => {
    const score = state?.score ?? 0
    const streak = state?.streak ?? 0
    const shelfWon = score >= 500
    const result = shelfWon ? 'win' : 'loss'
    const rankName = getShelfPriceRank(streak)
    return {
      result: result as 'win' | 'loss',
      heading: pickRandom(COPY[result].headings),
      subheading: pickRandom(COPY[result].subheadings),
      rankName,
      rankFlavour: pickRandom(SHELF_PRICE_FLAVOUR[rankName]),
    }
  }, [showResult])

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
              <p className="mt-1.5 text-sm text-muted-foreground">
                Which cost more at launch?
              </p>
              <p className="mt-0.5 font-heading text-xs text-muted-foreground/70">
                {formatGameNumber(date)} &middot; {formatDisplayDate(date)}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowRules(true)}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/80 text-lg font-bold text-muted-foreground transition-colors hover:border-[hsl(var(--game-blue))] hover:text-[hsl(var(--game-blue))]"
                aria-label="How to play"
              >
                ?
              </button>
              <button
                onClick={handleStart}
              className="rounded-full bg-[hsl(var(--game-blue))] px-8 py-3 text-base font-bold text-white transition-transform hover:scale-105"
            >
              Start Playing
            </button>
            </div>
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
              <p className="mt-1.5 text-sm text-muted-foreground">
                Which cost more at launch?
                <button
                  onClick={() => setShowRules(true)}
                  className="ml-1.5 inline-flex h-5 w-5 translate-y-[1px] items-center justify-center rounded-full border border-border/80 text-[11px] font-bold text-muted-foreground transition-colors hover:border-[hsl(var(--game-blue))] hover:text-[hsl(var(--game-blue))]"
                  aria-label="How to play"
                >
                  ?
                </button>
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

        {/* Finished — post-game page (when modal closed) */}
        {state.finished && !showResult && (
          <>
            <div className="mb-4 text-center">
              <h1 className="text-[clamp(40px,8vw,64px)] font-black uppercase leading-none text-[hsl(var(--game-blue))]">
                Shelf Price
              </h1>
              <p className="mt-1 font-heading text-sm text-muted-foreground">
                {formatGameNumber(date)} &middot; {formatDisplayDate(date)}
              </p>
            </div>

            {/* Nav pills — above showcase */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
              {!today && (
                <Link
                  href="/play/shelf-price"
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                >
                  Play today&apos;s game
                </Link>
              )}
              <Link
                href="/play/shelf-price/archive"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              >
                Browse the archive
              </Link>
            </div>

            <div className="mb-6">
              <ResultCard
                game="shelf-price"
                score={state.score}
                streak={state.streak}
                won={state.won}
                puzzleLabel={`Shelf Price ${formatGameNumber(date)} \u00b7 ${formatDisplayDate(date)}`}
                onViewResults={() => setShowResult(true)}
              />
            </div>

            <div className="mb-8">
              <DailyBadgeShelf currentGame="shelf-price" />
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
              </Link>
            )}
            <Link
              href="/play/shelf-price/archive"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              Browse the archive
            </Link>
          </div>
        )}
      </main>

      <SiteFooter />

      {/* Result overlay */}
      {showResult && state.finished && (
        <GameEndModal
          result={modalCopy.result}
          score={state.score}
          heading={modalCopy.heading}
          subheading={modalCopy.subheading}
          rankName={modalCopy.rankName}
          rankFlavour={modalCopy.rankFlavour}
          stats={[
            { label: 'Score', value: String(state.score) },
            { label: 'Streak', value: String(state.streak) },
            { label: 'Correct', value: `${state.streak}/${TARGET_ROUNDS}` },
          ]}
          heroZone={
            <div className="px-4 pt-5 pb-2">
              <div className="grid grid-cols-5 gap-1.5">
                {pairs.slice(0, TARGET_ROUNDS).map(([left, right], i) => {
                  const correct = roundResults[i]
                  const played = i < state.choices.length
                  return (
                    <div
                      key={i}
                      className={`flex flex-col items-center gap-1 rounded-lg border-2 p-1.5 ${
                        !played
                          ? 'border-transparent opacity-30'
                          : correct
                            ? 'border-[hsl(var(--game-green))]/40'
                            : 'border-[hsl(var(--game-red))]/30'
                      }`}
                    >
                      <div className="flex w-full gap-0.5">
                        <div className="aspect-[3/4] w-1/2 overflow-hidden rounded-sm bg-muted/30">
                          <img src={igdbCoverUrl(left.igdbImageId)} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="aspect-[3/4] w-1/2 overflow-hidden rounded-sm bg-muted/30">
                          <img src={igdbCoverUrl(right.igdbImageId)} alt="" className="h-full w-full object-cover" />
                        </div>
                      </div>
                      {played && (
                        <span className={`text-[10px] font-bold ${correct ? 'text-[hsl(var(--game-green))]' : 'text-[hsl(var(--game-red))]'}`}>
                          {correct ? '\u2713' : '\u2717'}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          }
          pipRow={
            <div className="flex justify-center gap-1.5">
              {roundResults.map((correct, i) => (
                <div
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full ${
                    correct
                      ? 'bg-[hsl(var(--game-green))]'
                      : 'bg-[hsl(var(--game-ink-light))]/30'
                  }`}
                />
              ))}
            </div>
          }
          onShare={async () => {
            const number = formatGameNumber(date)
            const lines = [
              `Shelf Price ${number} \u00b7 ${state.score}/1000`,
              `${state.streak}/${TARGET_ROUNDS} correct${state.score === 1000 ? ' \u00b7 Perfect! \u{1F3C6}' : ''}`,
              'idlehours.co.uk/play/shelf-price',
            ]
            try { await navigator.clipboard.writeText(lines.join('\n')) } catch {}
          }}
          onClose={() => setShowResult(false)}
        />
      )}

      {/* Rules modal */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </>
  )
}
