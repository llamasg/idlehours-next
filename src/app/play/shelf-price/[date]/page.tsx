'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo, use } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import DiscoverMore from '@/components/DiscoverMore'
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

import { igdbCoverUrl } from '@/lib/imageUtils'
import RulesModal from '../components/RulesModal'
import PostGameLeftColumn from '@/components/games/PostGameLeftColumn'
import PlayableGuard from '@/components/games/shell/PlayableGuard'
import SplitShareButton from '@/components/games/SplitShareButton'
import PostGameAnalysisCard from '@/components/games/shell/PostGameAnalysisCard'
import GameWorld from '@/components/games/shell/GameWorld'
import GameTitle from '@/components/games/shell/GameTitle'
import ScorePill from '@/components/games/shell/ScorePill'
import GameNavPills, { PostGameNavPills } from '@/components/games/shell/GameNavPills'
import { useGameEntrance } from '@/lib/game-shell/useGameEntrance'
import { buildShareText } from '@/lib/game-shell/buildShareText'
import { useMobileThemeColor } from '@/lib/game-shell/useMobileThemeColor'
import { GAME_THEME } from '@/lib/ranks'
import { entrance, useEntranceSteps } from '@/lib/animations'
import { SPRING_EASING, POSTGAME_GAPS } from '@/lib/gameConstants'

export default function ShelfPriceDayPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = use(params)

  const [state, setState] = useState<DayState | null>(null)
  const [chosenSide, setChosenSide] = useState<'left' | 'right' | null>(null)
  const [choiceCorrect, setChoiceCorrect] = useState<boolean | null>(null)
  const [floatingCost, setFloatingCost] = useState(false)
  const [scorePulse, setScorePulse] = useState(false)
  const [showRules, setShowRules] = useState(false)

  // Entrance animation — step machine shared via useGameEntrance
  const { entranceStep, wipeStarted } = useGameEntrance(!!state, state ? state.finished : false)

  // Post-game page-level sequencer (matches Game Sense)
  // Steps: 1=ResultCard, 2=Game info, 3=Nav buttons, 4=Title/date, 5=Badges, 6=DiscoverMore
  const isPostGameComplete = state ? state.finished : false
  const pgGaps = useMemo(() => [...POSTGAME_GAPS], [])
  const pgStep = useEntranceSteps(7, pgGaps, isPostGameComplete)

  const pairs = getPairsForDate(date)
  const playable = isPlayableDate(date)
  const today = isToday(date)

  // Purple status bar on mobile (game-sense and street-date already do this)
  useMobileThemeColor(GAME_THEME['shelf-price'].statusBarHex)

  // Pre-compute — skip animation if game already finished
  const shouldAnimate = state ? !state.finished : true

  // Load state — no start screen, go straight to gameplay
  useEffect(() => {
    const loaded = loadDayState(date)
    setState(loaded)
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

  // Share text for the post-game share button
  const shareText = useMemo(() => {
    if (!state || !state.finished) return ''
    const emojiRow = state.choices
      .map((choice, i) => {
        if (i >= pairs.length) return ''
        const [left, right] = pairs[i]
        const moreExpensiveSide = left.launchPriceUsd >= right.launchPriceUsd ? 'left' : 'right'
        return choice === moreExpensiveSide ? '\u{1F7E9}' : '\u{1F7E5}'
      })
      .join('')
    return buildShareText({
      title: 'Shelf Price',
      number: formatGameNumber(date),
      score: state.score,
      rows: [emojiRow],
      url: 'idlehours.co.uk/play/shelf-price',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, date])

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
  const isPostGame = state.finished

  return (
    <>
      <Header />

      {/* Purple game world */}
      <GameWorld
        gradient={GAME_THEME['shelf-price'].worldGradient}
        wipeStarted={wipeStarted}
        shouldAnimate={shouldAnimate}
        style={{
          borderRadius: 20,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 12px rgba(0,0,0,0.12)',
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
          <GameTitle
            title={['Shelf', 'Price']}
            subtitle={['Which', 'cost', 'more', 'at', 'launch?']}
            animate={entranceStep >= 1 || isPostGame}
            titleDuration={0.2}
            titleStagger={0.25}
            subtitleStagger={0.15}
            easing={SPRING_EASING}
          />
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
              <ScorePill
                score={state.score}
                pulse={scorePulse}
                floatingCost={floatingCost ? { key: 'wrong', cost: WRONG_PENALTY } : null}
                accentClassName="text-[hsl(var(--game-ink))]"
                unitClassName="text-[hsl(var(--game-ink))]/60"
                baseBorderColor="rgba(255,255,255,0.2)"
                className="mt-3"
              />
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
        {!playable && <PlayableGuard todayHref="/play/shelf-price" />}

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
            <PostGameNavPills
              slug="shelf-price"
              today={today}
              pgStep={pgStep}
              share={
                <SplitShareButton
                  shareText={shareText}
                  shareUrl="https://idlehours.co.uk/play/shelf-price"
                  isWin={state.won}
                  accentColor={GAME_THEME['shelf-price'].accent}
                />
              }
            />

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
                <PostGameAnalysisCard
                  label={<>Shelf Price {formatGameNumber(date)} &middot; {formatDisplayDate(date)}</>}
                  subtitle="Your matchups"
                  headerClassName="shrink-0 px-5 pt-5 sm:px-6 sm:pt-6"
                >
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
                </PostGameAnalysisCard>
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
            <GameNavPills slug="shelf-price" today={today} />
          </div>
        )}
      </main>
      </GameWorld>

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
