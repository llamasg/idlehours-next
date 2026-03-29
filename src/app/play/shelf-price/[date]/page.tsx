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
import { entrance, useEntranceSteps } from '@/lib/animations'

const spring = 'cubic-bezier(0.34,1.5,0.64,1)'

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
  const pgGaps = useMemo(() => [0, 3500, 400, 300, 300, 400, 500], [])
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
    const t1 = setTimeout(() => setEntranceStep(1), 350)    // title word-pops
    const t2 = setTimeout(() => setEntranceStep(2), 1700)   // title moves up, gameplay scales in
    const t3 = setTimeout(() => setEntranceStep(3), 2400)   // game cards visible
    const t4 = setTimeout(() => setEntranceStep(4), 3100)   // score + progress visible
    const t5 = setTimeout(() => setEntranceStep(5), 3400)   // rest fades in
    const t6 = setTimeout(() => setEntranceStep(6), 3900)   // done
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
        className="game-container mx-4 -mt-16 flex flex-1 flex-col rounded-2xl sm:mt-4 sm:rounded-[20px]"
        style={{
          background: 'linear-gradient(155deg, #5B4FCF, #1a1040)',
          borderRadius: 20,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 12px rgba(0,0,0,0.12)',
          clipPath: (!shouldAnimate || wipeStarted) ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)',
          transition: shouldAnimate ? 'clip-path 0.7s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      >
      <main className={`font-game mx-auto flex flex-1 flex-col px-4 py-8 ${isPostGame ? 'w-full lg:px-8' : 'max-w-5xl justify-center'}`}>
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
          <h1 className="text-[clamp(40px,8vw,64px)] font-black uppercase leading-none text-white">
            {['Shelf', 'Price'].map((word, i) => (
              <span
                key={word}
                className="inline-block"
                style={
                  entranceStep >= 1 || isPostGame
                    ? { animation: `gs-word-pop 0.2s ${spring} ${0.1 + i * 0.25}s both` }
                    : { opacity: 0 }
                }
              >
                {word}{i < 1 ? '\u00a0' : ''}
              </span>
            ))}
          </h1>
          <p className="mt-1.5 text-sm text-white/70">
            {['Which', 'cost', 'more', 'at', 'launch?'].map((word, i) => (
              <span
                key={word}
                className="inline-block"
                style={
                  entranceStep >= 1 || isPostGame
                    ? { animation: `gs-word-pop 0.2s ${spring} ${0.7 + i * 0.15}s both` }
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
                      ? { animation: `gs-fade-in 0.5s ${spring} both` }
                      : undefined)
            }
          >
            <p className="mt-0.5 font-heading text-xs text-white/50">
              {formatGameNumber(date)} &middot; {formatDisplayDate(date)}
            </p>

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
                  className="font-heading text-2xl font-black"
                />
                <span className="font-heading text-xs uppercase tracking-wider text-[hsl(var(--game-ink-light))]">
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
            style={entranceStep < 2 ? { opacity: 0, transform: 'scale(0)' } : entranceStep < 6 ? { animation: `gs-box-in 0.7s ${spring} both` } : undefined}
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

            {/* Badges — slides open when pgStep >= 5 */}
            <div
              className="grid transition-[grid-template-rows] duration-700 ease-out"
              style={{ gridTemplateRows: pgStep >= 5 ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="mb-6">
                  <DailyBadgeShelf currentGame="shelf-price" animateStamp={pgStep >= 5} />
                </div>
              </div>
            </div>

            {/* ResultCard — internal 15-step cascade */}
            <div className="mb-6">
              <ResultCard
                game="shelf-price"
                score={state.score}
                streak={state.streak}
                won={state.won}
                puzzleLabel={`Shelf Price ${formatGameNumber(date)} \u00b7 ${formatDisplayDate(date)}`}
                onViewResults={() => setShowResult(true)}
                animateEntrance={pgStep >= 1}
              />
            </div>

            {/* Game info — round results in white card */}
            <div className="mb-6" style={entrance('slide-up', pgStep >= 2)}>
              <div className="mx-auto w-full max-w-[850px] overflow-hidden rounded-2xl bg-white/95 shadow-sm">
                <div className="p-5 sm:p-6">
                  <p className="mb-3 text-center font-heading text-xs font-semibold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-light))]">
                    Your matchups
                  </p>
                  <div className="grid grid-cols-5 gap-2">
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
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <div className="aspect-[3/4] w-1/2 overflow-hidden rounded-sm bg-muted/30">
                              <img src={igdbCoverUrl(left.igdbImageId)} alt={left.title} className="h-full w-full object-cover" />
                            </div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <div className="aspect-[3/4] w-1/2 overflow-hidden rounded-sm bg-muted/30">
                              <img src={igdbCoverUrl(right.igdbImageId)} alt={right.title} className="h-full w-full object-cover" />
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
              </div>
            </div>

          </>
        )}

        {/* Nav pills — during gameplay */}
        {!isPostGame && (
          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
            style={entranceStep < 5 ? { opacity: 0 } : entranceStep < 6 ? { animation: `gs-fade-in 0.5s ${spring} both` } : undefined}
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

      {/* Result overlay */}
      {showResult && state.finished && (
        <GameEndModal
          game="shelf-price"
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
