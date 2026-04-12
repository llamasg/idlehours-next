'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo, useRef, use } from 'react'
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

import {
  COPY,
  pickRandom,
  getShelfPriceRank,
  SHELF_PRICE_FLAVOUR,
} from '@/components/games/GameEndModal.copy'
import { igdbCoverUrl } from '@/lib/imageUtils'
import RulesModal from '../components/RulesModal'
import PostGameLeftColumn from '@/components/games/PostGameLeftColumn'
import { entrance, useEntranceSteps } from '@/lib/animations'
import { SPRING_EASING, ENTRANCE_TIMINGS, POSTGAME_GAPS } from '@/lib/gameConstants'

const WIN_THRESHOLD = 500

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
  const [floatingCost, setFloatingCost] = useState(false)
  const [scorePulse, setScorePulse] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [wipeStarted, setWipeStarted] = useState(false)
  const wipeTriggered = useRef(false)

  // Entrance animation: 0=waiting, 1=title word-pops, 2=title moves up + gameplay scales in, 3=cards visible, 4=score/progress visible, 5=rest, 6=done
  const [entranceStep, setEntranceStep] = useState(0)

  // Post-game page-level sequencer (matches Game Sense)
  // Steps: 1=ResultCard, 2=Game info, 3=Nav buttons, 4=Title/date, 5=Badges, 6=DiscoverMore
  const isPostGameComplete = state ? state.finished : false
  const pgGaps = useMemo(() => [...POSTGAME_GAPS], [])
  const pgStep = useEntranceSteps(7, pgGaps, isPostGameComplete && !showResult)

  const pairs = getPairsForDate(date)
  const playable = isPlayableDate(date)
  const today = isToday(date)

  // Pre-compute — skip animation if game already finished
  const shouldAnimate = state ? !state.finished : true

  // Load state — no start screen, go straight to gameplay
  useEffect(() => {
    const loaded = loadDayState(date)
    setState(loaded)
    // Trigger purple world wipe entrance
    if (!wipeTriggered.current) {
      wipeTriggered.current = true
      const alreadyDone = loaded.finished
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (alreadyDone || reducedMotion) {
        setWipeStarted(true)
        setEntranceStep(6)
      } else {
        requestAnimationFrame(() => requestAnimationFrame(() => setWipeStarted(true)))
      }
    }
  }, [date])

  // Entrance animation sequence — matches Game Sense timing
  useEffect(() => {
    if (!state) return
    if (state.finished) return // already handled above
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      setEntranceStep(6)
      return
    }
    const t1 = setTimeout(() => setEntranceStep(1), ENTRANCE_TIMINGS[0])    // title word-pops
    const t2 = setTimeout(() => setEntranceStep(2), ENTRANCE_TIMINGS[1])   // title moves up, gameplay scales in
    const t3 = setTimeout(() => setEntranceStep(3), ENTRANCE_TIMINGS[2])   // game cards visible
    const t4 = setTimeout(() => setEntranceStep(4), ENTRANCE_TIMINGS[3])   // score + progress visible
    const t5 = setTimeout(() => setEntranceStep(5), ENTRANCE_TIMINGS[4])   // rest fades in
    const t6 = setTimeout(() => setEntranceStep(6), ENTRANCE_TIMINGS[5])   // done
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!state])

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

      setChosenSide(choice)
      setChoiceCorrect(correct)
    },
    [state, pairs, chosenSide],
  )

  const handleRevealComplete = useCallback(() => {
    if (!state || chosenSide === null || choiceCorrect === null) return

    const correct = choiceCorrect

    if (!correct) {
      setScorePulse(true)
      setFloatingCost(true)
      setTimeout(() => {
        setScorePulse(false)
        setFloatingCost(false)
      }, 1200)
    }

    const newStreak = correct ? state.correctCount + 1 : state.correctCount
    const newRound = state.round + 1
    const newScore = correct ? state.score : Math.max(0, state.score - WRONG_PENALTY)
    const finished = newRound >= TARGET_ROUNDS
    const won = finished && newScore > 0

    const newState: DayState = {
      score: newScore,
      correctCount: newStreak,
      round: newRound,
      won,
      finished,
      choices: [...state.choices, chosenSide],
    }

    setState(newState)
    saveDayState(date, newState)
    setChosenSide(null)
    setChoiceCorrect(null)

    // Post-game screen shows automatically via isPostGame
  }, [state, chosenSide, choiceCorrect, date])

  // Modal copy — picked once when modal opens
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const modalCopy = useMemo(() => {
    const score = state?.score ?? 0
    const streak = state?.correctCount ?? 0
    const shelfWon = score >= WIN_THRESHOLD
    const result = shelfWon ? 'win' : 'loss'
    const rankName = getShelfPriceRank(score)
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
        <div
          className="game-container mx-auto mt-[15px] flex min-h-[900px] max-w-7xl items-center justify-center"
          style={{
            background: 'linear-gradient(155deg, #5B4FCF, #1a1040)',
            borderRadius: 20,
            boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 12px rgba(0,0,0,0.12)',
          }}
        >
          <p className="text-center text-white/40">Loading...</p>
        </div>
        <SiteFooter />
      </>
    )
  }

  const currentPairIndex = state.round
  const currentPair = pairs[currentPairIndex] ?? pairs[pairs.length - 1]
  const isPostGame = state.finished && !showResult

  return (
    <>
      <Header />

      {/* Purple game world */}
      <div
        className="game-container mx-0 -mt-16 flex flex-1 flex-col rounded-none sm:mx-4 sm:mt-4 sm:rounded-[20px]"
        style={{
          background: 'linear-gradient(155deg, #5B4FCF, #1a1040)',
          borderRadius: 20,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 12px rgba(0,0,0,0.12)',
          clipPath: (!shouldAnimate || wipeStarted) ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)',
          transition: shouldAnimate ? 'clip-path 0.7s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      >
      <main className={`font-game mx-auto flex flex-1 flex-col px-4 py-8 ${isPostGame ? 'w-full max-w-7xl lg:px-8' : 'max-w-5xl justify-center'}`}>
        {/* Title — always visible, starts centered then slides up */}
        <div
          className="mb-4 text-center"
        >
          <div
            className="transition-all duration-700 ease-out"
            style={
              isPostGame
                ? entrance('slide-up', pgStep >= 4)
                : (entranceStep < 1
                    ? { opacity: 0, transform: 'translateY(120px)' }
                    : entranceStep < 2
                      ? { opacity: 1, transform: 'translateY(120px)' }
                      : { opacity: 1, transform: 'translateY(0)' })
            }
          >
          <h1 className="text-[22px] font-black uppercase leading-none text-white sm:text-[clamp(40px,8vw,64px)]">
            {['Shelf', 'Price'].map((word, i) => (
              <span
                key={word}
                className="inline-block"
                style={
                  entranceStep >= 1 || isPostGame
                    ? { animation: `gs-word-pop 0.2s ${SPRING_EASING} ${0.1 + i * 0.25}s both` }
                    : { opacity: 0 }
                }
              >
                {word}{i < 1 ? '\u00a0' : ''}
              </span>
            ))}
          </h1>
          <p className="mt-0.5 text-sm font-bold text-white/70 sm:mt-1.5 sm:text-xl">
            {['Which', 'cost', 'more', 'at', 'launch?'].map((word, i) => (
              <span
                key={word}
                className="inline-block"
                style={
                  entranceStep >= 1 || isPostGame
                    ? { animation: `gs-word-pop 0.2s ${SPRING_EASING} ${0.7 + i * 0.15}s both` }
                    : { opacity: 0 }
                }
              >
                {word}{i < 4 ? '\u00a0' : ''}
              </span>
            ))}
          </p>
          </div>

          {/* Date + score — fade in with rest */}
          <div
            style={
              isPostGame
                ? entrance('fade', pgStep >= 4)
                : (entranceStep < 5
                    ? { opacity: 0 }
                    : entranceStep < 6
                      ? { animation: `gs-fade-in 0.5s ${SPRING_EASING} both` }
                      : undefined)
            }
          >
            {/* Score pill — only during gameplay */}
            {!isPostGame && !state.finished && (
              <div
                className="relative mt-3 inline-flex items-center gap-2 rounded-full border-2 bg-white px-5 py-2 transition-all duration-300"
                style={{
                  borderColor: scorePulse
                    ? 'hsl(var(--game-red))'
                    : 'rgba(255,255,255,0.2)',
                  transform: scorePulse ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <AnimatedScore
                  value={state.score}
                  className={`font-heading text-2xl font-black transition-colors duration-300 ${scorePulse ? 'text-[hsl(var(--game-red))]' : 'text-[hsl(var(--game-ink))]'}`}
                />
                <span className={`font-heading text-xs uppercase tracking-wider transition-colors duration-300 ${scorePulse ? 'text-[hsl(var(--game-red))]/60' : 'text-[hsl(var(--game-ink))]/60'}`}>
                  pts
                </span>
                {floatingCost && (
                  <span
                    className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(var(--game-red))] px-4 py-1 font-heading text-lg font-black text-white shadow-lg"
                    style={{ animation: 'float-up 1.2s ease-out forwards' }}
                  >
                    -{WRONG_PENALTY}
                  </span>
                )}
              </div>
            )}

            {/* Help button — during gameplay */}
            {!isPostGame && !state.finished && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowRules(true)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-xs font-bold text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label="How to play"
                >
                  ?
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Not playable */}
        {!playable && (
          <div className="mb-8 rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-center">
            <p className="text-white/60">
              This game isn&apos;t available yet. Check back on the right day!
            </p>
            <Link
              href="/play/shelf-price"
              className="mt-3 inline-block text-sm font-semibold text-white transition-colors hover:text-white/80"
            >
              Go to today&apos;s game &rarr;
            </Link>
          </div>
        )}

        {/* Active gameplay — no white container needed, game cards have their own overlays */}
        {playable && !state.finished && (
          <div
            className="flex flex-col gap-6"
            style={entranceStep < 2 ? { opacity: 0, transform: 'scale(0)' } : entranceStep < 6 ? { animation: `gs-box-in 0.7s ${SPRING_EASING} both` } : undefined}
          >
            {/* Progress */}
            <div
              className="transition-opacity duration-300 ease-out"
              style={{ opacity: entranceStep < 4 ? 0 : 1 }}
            >
              <ProgressBar current={state.round} total={TARGET_ROUNDS} results={roundResults} />
            </div>

            {/* Game cards */}
            <div
              className="transition-opacity duration-300 ease-out"
              style={{ opacity: entranceStep < 3 ? 0 : 1 }}
            >
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
          </div>
        )}

        {/* Post-game page (when modal closed) — matches Game Sense layout */}
        {isPostGame && (
          <>
            {/* Nav pills — early so user can navigate away quickly */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
              {!today && (
                <div style={entrance('pop', pgStep >= 1, 300)}>
                  <Link href="/play/shelf-price" className="bvl-purple">
                    <img src="/images/icons/icon_Target-aim-practice-games-play.svg" alt="" className="h-5 w-5 brightness-0 invert" />
                    Today&apos;s game
                  </Link>
                </div>
              )}
              <div style={entrance('pop', pgStep >= 1, 450)}>
                <Link href="/play/archive?game=shelf-price" className="bvl-purple">
                  <img src="/images/icons/icon_hourglass-loading-filtering-timer.svg" alt="" className="h-5 w-5 brightness-0 invert" />
                  View past games
                </Link>
              </div>
            </div>

            {/* Two-column post-game: left determines height, right scrolls within it */}
            <div className="relative mb-6 flex flex-col gap-6 lg:flex-row">

              {/* ── Left column: badge shelf + ResultCard (determines container height) ── */}
              <PostGameLeftColumn
                game="shelf-price"
                score={state.score}
                secondaryStat={state.correctCount}
                won={state.won}
                puzzleLabel={`Shelf Price ${formatGameNumber(date)} \u00b7 ${formatDisplayDate(date)}`}
                pgStep={pgStep}
                className="flex flex-col gap-6 lg:w-[55%] lg:shrink-0"
              />

              {/* ── Right column: matchups — absolutely positioned on lg, scrolls within left col height ── */}
              <div
                className="lg:absolute lg:top-0 lg:bottom-0 lg:right-0 lg:w-[calc(45%-1.5rem)]"
                style={entrance('slide-up', pgStep >= 2)}
              >
                <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white/95 shadow-sm">
                  <div className="shrink-0 px-5 pt-5 sm:px-6 sm:pt-6">
                    <p className="font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">
                      Shelf Price {formatGameNumber(date)} &middot; {formatDisplayDate(date)}
                    </p>
                    <p className="mt-1 font-heading text-[13px] font-[700] text-[hsl(var(--game-ink))]">
                      Your matchups
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-slim px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
                    <div className="flex flex-col gap-3">
                      {pairs.slice(0, TARGET_ROUNDS).map(([left, right], i) => {
                        const correct = roundResults[i]
                        const played = i < state.choices.length
                        return (
                          <div
                            key={i}
                            className={`rounded-xl border-2 p-3 ${
                              !played
                                ? 'border-transparent opacity-30'
                                : correct
                                  ? 'border-[hsl(var(--game-green))]/40 bg-[hsl(var(--game-green))]/5'
                                  : 'border-[hsl(var(--game-red))]/30 bg-[hsl(var(--game-red))]/5'
                            }`}
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <span className="font-heading text-[10px] font-[800] text-[hsl(var(--game-ink-light))]">
                                Round {i + 1}
                              </span>
                              {played && (
                                <span className={`font-heading text-[10px] font-[800] ${correct ? 'text-[hsl(var(--game-green))]' : 'text-[hsl(var(--game-red))]'}`}>
                                  {correct ? '✓ Correct' : '✗ Wrong'}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-4">
                              {[left, right].map((game, gi) => (
                                <div key={gi} className="flex flex-1 items-center gap-3">
                                  <div className="h-24 w-[68px] shrink-0 overflow-hidden rounded-lg bg-muted/30 shadow-sm">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={igdbCoverUrl(game.igdbImageId)} alt={game.title} className="h-full w-full object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="line-clamp-3 font-heading text-[12px] font-[700] leading-snug text-[hsl(var(--game-ink))]">
                                      {game.title}
                                    </p>
                                    <p className="mt-0.5 font-heading text-[16px] font-[800] text-[hsl(var(--game-ink))]">
                                      ${game.launchPriceUsd}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </>
        )}

        {/* Nav pills — during gameplay */}
        {!isPostGame && (
          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
            style={entranceStep < 5 ? { opacity: 0 } : entranceStep < 6 ? { animation: `gs-fade-in 0.5s ${SPRING_EASING} both` } : undefined}
          >
            {!today && (
              <Link href="/play/shelf-price" className="bvl-purple">
                <img src="/images/icons/icon_Target-aim-practice-games-play.svg" alt="" className="h-5 w-5 brightness-0 invert" />
                Today&apos;s game
              </Link>
            )}
            <Link href="/play/archive?game=shelf-price" className="bvl-purple">
              <img src="/images/icons/icon_hourglass-loading-filtering-timer.svg" alt="" className="h-5 w-5 brightness-0 invert" />
              View past games
            </Link>
          </div>
        )}
      </main>
      </div>

      {/* DiscoverMore — OUTSIDE the purple area */}
      {isPostGame && (
        <div
          className="mx-auto max-w-7xl px-4 py-8 lg:px-8"
          style={entrance('fade', pgStep >= 6)}
        >
          <DiscoverMore currentGame="shelf-price" />
        </div>
      )}

      <SiteFooter />

      {/* GameEndModal removed — post-game screen shows directly */}

      {/* Rules modal */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </>
  )
}
