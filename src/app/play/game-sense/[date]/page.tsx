'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo, useRef, use } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import DiscoverMore from '@/components/DiscoverMore'
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
import { formatElapsed } from '@/lib/game-shell/formatElapsed'
import { buildShareText } from '@/lib/game-shell/buildShareText'
import { useMobileThemeColor } from '@/lib/game-shell/useMobileThemeColor'
import { GAME_THEME } from '@/lib/ranks'
import PlayableGuard from '@/components/games/shell/PlayableGuard'
import SplitShareButton from '@/components/games/SplitShareButton'
import PostGameAnalysisCard, { StatPillRow, CardDivider } from '@/components/games/shell/PostGameAnalysisCard'
import GameWorld from '@/components/games/shell/GameWorld'
import GameTitle from '@/components/games/shell/GameTitle'
import ScorePill from '@/components/games/shell/ScorePill'
import GameNavPills, { PostGameNavPills } from '@/components/games/shell/GameNavPills'
import { useGameEntrance } from '@/lib/game-shell/useGameEntrance'
import GuessInput from '../components/GuessInput'
import GuessList from '../components/GuessList'
import SentenceClue, { type BlankDef, BLANK_COSTS } from '../components/SentenceClue'
import BoxArtReveal from '../components/BoxArtReveal'
import { hashDateSeed } from '@/lib/game-shell/seededRng'
import {
  GAME_SENSE_REVEAL_THRESHOLDS,
  GAME_SENSE_LETTER_PATTERN_COST,
  GAME_SENSE_FIRST_LETTER_COST,
  GAME_SENSE_GIVE_UP_MIN_GUESSES,
  GAME_SENSE_GUESS_DECAY,
  GAME_SENSE_SCORE_FLOOR,
} from '@/lib/gameConstants'

import { igdbCoverUrl } from '@/lib/imageUtils'
import RulesModal from '../components/RulesModal'
import ProximityCounter from '../components/ProximityCounter'
import PostGameLeftColumn from '@/components/games/PostGameLeftColumn'
import { entrance, useEntranceSteps } from '@/lib/animations'
import { SPRING_EASING, POSTGAME_GAPS } from '@/lib/gameConstants'


export default function GameSenseDayPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = use(params)

  const [state, setState] = useState<DayState | null>(null)
  const [showRules, setShowRules] = useState(false)
  const [floatingCost, setFloatingCost] = useState<{ key: string; cost: number } | null>(null)
  const [scorePulse, setScorePulse] = useState(false)
  // v2 layout state
  const [inputFocused, setInputFocused] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [giveUpArmed, setGiveUpArmed] = useState(false)

  // Entrance animation — step machine shared via useGameEntrance
  const isGameOver = state ? (state.won || state.score <= 0) : false
  const { entranceStep, wipeStarted } = useGameEntrance(!!state, isGameOver)
  // Post-game page-level sequencer — each parent section fires one after the other
  // Steps: 1=ResultCard, 2=Sentence, 3=Nav buttons, 4=Title/date, 5=Badges, 6=DiscoverMore
  const isPostGameComplete = isGameOver
  const pgGaps = useMemo(() => [...POSTGAME_GAPS], [])
  const pgStep = useEntranceSteps(7, pgGaps, isPostGameComplete)
  // Pre-compute skip so clip-path renders correctly on first paint (before useEffect)
  const shouldAnimate = state ? !(state.won || state.score <= 0) : true


  // Force blue status bar on mobile only — solid bg-color for iOS safe-area + theme-color meta
  useMobileThemeColor(GAME_THEME['game-sense'].statusBarHex)

  // Countdown animation state
  const [pendingGuess, setPendingGuess] = useState<{
    game: GameSenseGame
    proximity: number
  } | null>(null)

  const answer: GameSenseGame = GAMES[getGameIndexForDate(date)]
  const playable = isPlayableDate(date)
  const today = isToday(date)

  // Derived: game is over — but NOT while proximity counter is still animating
  const gameOver = state ? (state.won || (state.score <= 0 && !pendingGuess)) : false

  // Load state from localStorage on mount — go straight to post-game screen, no modal
  // Also stamp startedAt if this is a fresh game
  useEffect(() => {
    const loaded = loadDayState(date)
    if (!loaded.startedAt && !loaded.won && loaded.score > 0) {
      loaded.startedAt = Date.now()
      saveDayState(date, loaded)
    }
    setState(loaded)
  }, [date])

  // Stamp endedAt when the game finishes (win or loss)
  useEffect(() => {
    if (!state) return
    if ((state.won || state.score <= 0) && !state.endedAt) {
      const updated = { ...state, endedAt: Date.now() }
      setState(updated)
      saveDayState(date, updated)
    }
  }, [state, date])

  const handleGuess = useCallback(
    (game: GameSenseGame) => {
      if (!state || gameOver || pendingGuess) return

      const proximity = calculateRank(game, answer)

      // v2 economy: first real guess is free; every guess FROM the 2nd costs
      // GAME_SENSE_GUESS_DECAY, floored at GAME_SENSE_SCORE_FLOOR (Bust stays
      // give-up-only). Replaces the legacy flat 1pt guess cost.
      const realGuessNumber = state.guesses.filter((g) => !g.isHint).length + 1
      const decay = realGuessNumber >= 2 ? GAME_SENSE_GUESS_DECAY : 0
      const newState: DayState = {
        ...state,
        score: Math.max(GAME_SENSE_SCORE_FLOOR, state.score - decay),
      }
      setState(newState)
      saveDayState(date, newState)

      // Start the countdown animation
      setPendingGuess({ game, proximity })
    },
    [state, answer, date, pendingGuess, gameOver],
  )

  const handleCountdownComplete = useCallback(() => {
    if (!pendingGuess || !state) return

    const { game, proximity } = pendingGuess
    const won = proximity === 1
    const newState: DayState = {
      ...state,
      guesses: [...state.guesses, { gameId: game.id, proximity }],
      won,
      // Box reveal driver: best NON-HINT proximity only — hint rows must
      // never open the box (points buy facts; skill earns art)
      bestProximity:
        state.bestProximity === undefined
          ? proximity
          : Math.min(state.bestProximity, proximity),
    }

    setState(newState)
    saveDayState(date, newState)
    setPendingGuess(null)

    // Post-game screen shows automatically when game ends
    void won
    // Loss check handled by the useEffect watching state.score
  }, [pendingGuess, state, date])

  const handleRevealBlank = useCallback(
    (blank: BlankDef) => {
      if (!state || gameOver || pendingGuess) return
      if (state.blanksRevealed.includes(blank.key)) return

      const cost = BLANK_COSTS[blank.key] ?? 0
      const newState: DayState = {
        ...state,
        score: Math.max(GAME_SENSE_SCORE_FLOOR, state.score - cost),
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
    [state, date, pendingGuess, gameOver],
  )

  // v2: the midpoint hint is RETIRED. Points buy facts (note blanks + spine
  // hints); skill earns art. Give-up is a standalone control.

  /** Spine hints — paid facts rendered on/near the box spine. */
  const handleSpineHint = useCallback(
    (kind: 'pattern' | 'firstLetter') => {
      if (!state || gameOver || pendingGuess) return
      const cost = kind === 'pattern' ? GAME_SENSE_LETTER_PATTERN_COST : GAME_SENSE_FIRST_LETTER_COST
      const hints = state.spineHints ?? { pattern: false, firstLetter: false }
      // Purchases may not spend into the floor (Bust stays give-up-only)
      if (hints[kind] || state.score - cost < GAME_SENSE_SCORE_FLOOR) return

      const newState: DayState = {
        ...state,
        score: Math.max(GAME_SENSE_SCORE_FLOOR, state.score - cost),
        spineHints: { ...hints, [kind]: true },
      }
      setState(newState)
      saveDayState(date, newState)

      setFloatingCost({ key: `spine-${kind}`, cost })
      setScorePulse(true)
      setTimeout(() => {
        setFloatingCost(null)
        setScorePulse(false)
      }, 1200)
    },
    [state, gameOver, pendingGuess, date],
  )

  /** Standalone give-up — unlocks after GAME_SENSE_GIVE_UP_MIN_GUESSES real
   *  guesses (the stuck player at proximity 1588 is exactly who needs it). */
  const handleGiveUp = useCallback(() => {
    if (!state || gameOver || pendingGuess) return
    const newState: DayState = {
      ...state,
      score: 0,
      won: false,
      guesses: [...state.guesses, { gameId: answer.id, proximity: 1, isHint: true }],
    }
    setState(newState)
    saveDayState(date, newState)
    setGiveUpArmed(false)
  }, [state, gameOver, pendingGuess, answer, date])

  // Share text for the post-game share button
  const shareText = useMemo(() => {
    if (!state) return ''
    const emojiRow = state.guesses
      .map((g) => {
        if (g.proximity <= 50) return '\u{1F7E9}'
        if (g.proximity <= 200) return '\u{1F7E8}'
        if (g.proximity <= 500) return '\u{1F7E7}'
        return '\u{1F7E5}'
      })
      .join('')
    return buildShareText({
      title: 'Game Sense',
      number: formatGameNumber(date),
      score: state.score,
      rows: [
        emojiRow,
        state.blanksRevealed.length > 0
          ? `${state.guesses.length} guesses \u00b7 ${state.blanksRevealed.length}/5 clues`
          : `${state.guesses.length} guesses`,
      ],
      url: 'idlehours.co.uk/play/game-sense',
    })
  }, [state, date])

  // While loading from localStorage — layout handles the visual loading screen
  if (!state) {
    return null
  }

  const guessedIds = state.guesses.map((g) => g.gameId)
  const isAnimating = pendingGuess !== null
  const isPostGame = (state.won || state.score <= 0) && !isAnimating

  // Patches are a step function of best proximity — derived, never stored
  const revealLevel =
    state.bestProximity === undefined
      ? 0
      : GAME_SENSE_REVEAL_THRESHOLDS.filter((t) => state.bestProximity! <= t).length

  return (
    <>
      <Header />

      {/* Flex wrapper — game container grows to fill, no body-bg gap before footer */}
      <div className="flex min-h-screen flex-col">

      {/* Blue game world — full-width gradient, content constrained inside */}
      <GameWorld
        gradient={GAME_THEME['game-sense'].worldGradient}
        wipeStarted={wipeStarted}
        shouldAnimate={shouldAnimate}
        className="game-container mx-4 -mt-16 flex flex-1 flex-col rounded-2xl sm:mt-4 sm:rounded-[20px]"
      >
        <main className={`font-game mx-auto flex flex-1 flex-col px-4 pb-8 pt-4 sm:py-8 ${isPostGame ? 'w-full max-w-7xl lg:px-8' : 'w-full max-w-6xl sm:justify-center lg:px-8'}`}>
          {/* Title bar — normal flow, scrolls with page */}
          <div
            className="text-center"
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
            <div className="transition-all duration-700 ease-out">
              <GameTitle
                title={['Game', 'Sense']}
                subtitle={['Guess', 'the', 'game!']}
                animate={entranceStep >= 1}
              />
              {!isPostGame && (
                <p
                  className="mt-0 font-heading text-[10px] text-white/50 sm:mt-0.5 sm:text-xs"
                  style={
                    entranceStep < 5
                      ? { opacity: 0 }
                      : entranceStep < 6
                        ? { animation: `gs-fade-in 0.5s ${SPRING_EASING} both` }
                        : undefined
                  }
                >
                  {formatGameNumber(date)} &middot; {formatDisplayDate(date)}
                </p>
              )}
            </div>
          </div>

          {/* Score row — scrolls with page, not pinned */}
          <div className="mb-3 text-center sm:mb-6">
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
              {/* Score pill (center) | ? (right) — midpoint hint RETIRED in v2 */}
              {!isPostGame && <div className="mt-2 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 sm:mt-3 sm:gap-6">
                <div />
                {/* Center cell — score pill */}
                <ScorePill
                  score={state.score}
                  pulse={scorePulse}
                  floatingCost={floatingCost}
                  accentClassName="text-[hsl(var(--game-blue))]"
                  unitClassName="text-[hsl(var(--game-blue))]/60"
                />
                {/* Right cell — ? tutorial button */}
                <div className="flex justify-end">
                  {!gameOver && (
                    <button
                      type="button"
                      onClick={() => setShowRules(true)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-sm font-bold text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                      aria-label="How to play"
                    >
                      ?
                    </button>
                  )}
                </div>
              </div>}
            </div>
          </div>


          {/* Not playable message */}
          {!playable && <PlayableGuard todayHref="/play/game-sense" />}

          {/* Game area — v2 three columns: guess log | the customer's note + input | mystery box.
              Mobile stack: box (hero) → note → input → collapsible log. */}
          {playable && !gameOver && (
            <div
              className="relative z-10 mb-4 sm:mb-8"
              style={entranceStep < 2 ? { opacity: 0, transform: 'scale(0)' } : entranceStep < 6 ? { animation: 'gs-box-in 0.7s cubic-bezier(0.34,1.5,0.64,1) both' } : undefined}
            >
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_4fr_3fr] lg:items-start">

                {/* LEFT — guess log (mobile: collapsible, last in stack) */}
                <div
                  className="order-3 transition-opacity duration-300 ease-out lg:order-1"
                  style={{ opacity: entranceStep < 4 ? 0 : 1 }}
                >
                  <button
                    type="button"
                    onClick={() => setLogOpen((o) => !o)}
                    className="mb-2 w-full rounded-full border-2 border-white/25 py-2 text-center font-heading text-[13px] font-[800] text-white/80 lg:hidden"
                  >
                    Your guesses ({state.guesses.length}) {logOpen ? '▴' : '▾'}
                  </button>
                  <div className={`${logOpen ? 'block' : 'hidden'} rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur-sm lg:block lg:max-h-[480px] lg:overflow-y-auto lg:overscroll-contain`}>
                    {state.guesses.length > 0 ? (
                      <GuessList guesses={state.guesses} />
                    ) : (
                      <p className="py-6 text-center text-sm font-semibold text-[hsl(var(--game-ink-light))]">
                        No guesses yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* MIDDLE — the customer's note, input directly below, nothing else */}
                <div className="order-2 flex flex-col gap-4 lg:order-2">
                  <div
                    className="rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur-sm transition-opacity duration-300 ease-out sm:p-6"
                    style={{ opacity: entranceStep < 3 ? 0 : 1 }}
                  >
                    <p className="mb-3 text-center font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">
                      The customer&apos;s note
                    </p>
                    <SentenceClue
                      answer={answer}
                      blanksRevealed={state.blanksRevealed}
                      // Spendable points only: purchases can't dip into the floor
                      score={state.score - GAME_SENSE_SCORE_FLOOR}
                      onRevealBlank={handleRevealBlank}
                      disabled={gameOver || isAnimating}
                      skipEntrance={entranceStep < 3}
                    />
                  </div>

                  {/* Proximity countdown animation */}
                  {pendingGuess && (
                    <div className="rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur-sm">
                      <ProximityCounter
                        gameTitle={pendingGuess.game.title}
                        targetRank={pendingGuess.proximity}
                        onComplete={handleCountdownComplete}
                      />
                    </div>
                  )}

                  {/* Guess input — hidden when animating */}
                  {!isAnimating && (
                    <div
                      className="rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur-sm transition-opacity duration-300 ease-out"
                      style={{ opacity: entranceStep < 4 ? 0 : 1 }}
                      onFocusCapture={() => setInputFocused(true)}
                      onBlurCapture={() => setInputFocused(false)}
                    >
                      <GuessInput
                        onGuess={handleGuess}
                        guessedIds={guessedIds}
                        disabled={false}
                      />
                      {/* Standalone give-up — two-tap arm, unlocks after N real guesses */}
                      {state.guesses.filter((g) => !g.isHint).length >= GAME_SENSE_GIVE_UP_MIN_GUESSES && (
                        <div className="mt-2 text-center">
                          {giveUpArmed ? (
                            <button
                              type="button"
                              onClick={handleGiveUp}
                              className="font-heading text-xs font-bold text-[hsl(var(--game-red))]"
                            >
                              Sure? Reveal the answer and end the day
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setGiveUpArmed(true)}
                              className="font-heading text-xs font-semibold text-[hsl(var(--game-ink-light))] transition-colors hover:text-[hsl(var(--game-ink))]"
                            >
                              Give up?
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* RIGHT — the mystery box on a flat ground + spine hints.
                    Mobile: hero at top; scales down while the input is focused
                    so the reveal state stays visible. */}
                <div
                  className="order-1 transition-opacity duration-300 ease-out lg:order-3"
                  style={{ opacity: entranceStep < 3 ? 0 : 1 }}
                >
                  <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                    <div className={`origin-top transition-transform duration-200 ${inputFocused ? 'max-lg:scale-75' : ''}`}>
                      {answer.igdbImageId && (
                        <BoxArtReveal
                          src={igdbCoverUrl(answer.igdbImageId)}
                          daySeed={hashDateSeed(date)}
                          revealLevel={revealLevel}
                          width={200}
                          height={266}
                        />
                      )}
                    </div>

                    {/* Spine hints — points buy facts; art is never purchasable */}
                    <div className="flex w-full flex-col gap-2">
                      {state.spineHints?.pattern ? (
                        <p className="text-center font-heading text-[15px] font-[800] tracking-[0.2em] text-white">
                          {answer.title.split(/\s+/).map((w) => w.replace(/[A-Za-z0-9]/g, '_').split('').join(' ')).join('   ')}
                          <span className="mt-0.5 block text-[10px] font-semibold tracking-normal text-white/60">
                            {answer.title.split(/\s+/).length} word{answer.title.split(/\s+/).length === 1 ? '' : 's'}
                          </span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSpineHint('pattern')}
                          disabled={state.score - GAME_SENSE_LETTER_PATTERN_COST < GAME_SENSE_SCORE_FLOOR}
                          className="rounded-full border-2 border-white/25 py-1.5 font-heading text-[11px] font-[800] text-white/80 transition-colors hover:border-white/50 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/30"
                        >
                          Letter pattern &minus;{GAME_SENSE_LETTER_PATTERN_COST}
                        </button>
                      )}
                      {state.spineHints?.firstLetter ? (
                        <p className="text-center font-heading text-[13px] font-[800] text-white">
                          Starts with &lsquo;{(answer.title.match(/[A-Za-z0-9]/)?.[0] ?? '?').toUpperCase()}&rsquo;
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSpineHint('firstLetter')}
                          disabled={state.score - GAME_SENSE_FIRST_LETTER_COST < GAME_SENSE_SCORE_FLOOR}
                          className="rounded-full border-2 border-white/25 py-1.5 font-heading text-[11px] font-[800] text-white/80 transition-colors hover:border-white/50 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/30"
                        >
                          First letter &minus;{GAME_SENSE_FIRST_LETTER_COST}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Won/Lost — post-game page (when modal closed) */}
          {isPostGame && (
            <>
              {/* Nav pills — early so user can navigate away quickly */}
              <PostGameNavPills
                slug="game-sense"
                today={today}
                pgStep={pgStep}
                share={
                  <SplitShareButton
                    shareText={shareText}
                    shareUrl="https://idlehours.co.uk/play/game-sense"
                    isWin={state.won}
                    accentColor={GAME_THEME['game-sense'].accent}
                  />
                }
              />

              {/* Two-column post-game: left (55%) badges + results, right (45%) analysis */}
              <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[55fr_45fr]">

                {/* ── Left column: badge shelf + ResultCard ── */}
                <PostGameLeftColumn
                  game="game-sense"
                  score={state.score}
                  secondaryStat={0}
                  won={state.won}
                  puzzleLabel={`Game Sense ${formatGameNumber(date)} \u00b7 ${formatDisplayDate(date)}`}
                  pgStep={pgStep}
                />

                {/* ── Right column: single merged analysis card ── */}
                <div className="order-1 lg:order-2" style={entrance('slide-up', pgStep >= 2)}>
                  <PostGameAnalysisCard
                    label={<>Game Sense {formatGameNumber(date)} &middot; {formatDisplayDate(date)}</>}
                    headerClassName="px-5 pt-4 sm:px-6"
                  >
                    {/* Game answer — prominent poster */}
                    <div className="flex items-center gap-4 px-5 py-4 sm:px-6">
                      {answer.igdbImageId && (
                        <img
                          src={igdbCoverUrl(answer.igdbImageId)}
                          alt={answer.title}
                          className="h-20 w-[60px] rounded-lg object-cover shadow-md"
                        />
                      )}
                      <div>
                        <p className="font-heading text-[20px] font-black text-[hsl(var(--game-ink))]">
                          {answer.title}
                        </p>
                        <p className="font-heading text-[13px] font-semibold text-[hsl(var(--game-ink-light))]">
                          {answer.year}
                        </p>
                      </div>
                    </div>

                    {/* Stats row — all 4 inline */}
                    <CardDivider />
                    <StatPillRow
                      stats={[
                        { label: 'Time', value: formatElapsed(state.startedAt, state.endedAt) },
                        { label: 'Guesses', value: String(state.guesses.filter(g => !g.isHint).length) },
                        { label: 'Clues', value: `${state.blanksRevealed.length}/5` },
                        { label: 'Hints', value: String(state.guesses.filter(g => g.isHint).length) },
                      ]}
                    />

                    {/* Revealed sentence */}
                    <CardDivider />
                    <div className="p-5 sm:p-6">
                      <SentenceClue
                        answer={answer}
                        blanksRevealed={state.blanksRevealed}
                        score={0}
                        onRevealBlank={() => {}}
                        disabled={true}
                        revealAll
                      />
                    </div>

                    {/* Guess history — scrollable if it overflows */}
                    {state.guesses.length > 0 && (
                      <>
                        <CardDivider />
                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6">
                          <p className="mb-3 font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">
                            Your guesses
                          </p>
                          <GuessList guesses={state.guesses} />
                        </div>
                      </>
                    )}
                  </PostGameAnalysisCard>
                </div>
              </div>
            </>
          )}

          {/* Nav pills — during gameplay */}
          {!isPostGame && (
            <div
              className="mt-4 flex flex-wrap items-center justify-center gap-4"
              style={entranceStep < 5 ? { opacity: 0 } : entranceStep < 6 ? { animation: 'gs-fade-in 0.5s cubic-bezier(0.34,1.5,0.64,1) both' } : undefined}
            >
              <GameNavPills slug="game-sense" today={today} />
            </div>
          )}
        </main>
      </GameWorld>

      {/* DiscoverMore — outside the blue area, needs own bg on mobile */}
      {isPostGame && (
        <div
          className="bg-background mx-auto max-w-7xl px-4 py-8 sm:bg-transparent lg:px-8"
          style={entrance('fade', pgStep >= 6)}
        >
          <DiscoverMore currentGame="game-sense" />
        </div>
      )}

      <SiteFooter />
      </div>{/* end flex wrapper */}

      {/* Rules modal */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </>
  )
}
