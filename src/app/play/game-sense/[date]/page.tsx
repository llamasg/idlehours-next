'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo, useRef, use } from 'react'
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
import GameEndModal from '@/components/games/GameEndModal'
import {
  COPY,
  pickRandom,
  getGameSenseRank,
  GAME_SENSE_FLAVOUR,
} from '@/components/games/GameEndModal.copy'
import { igdbCoverUrl } from '../../street-date/lib/imageUtils'
import RulesModal from '../components/RulesModal'
import ProximityCounter from '../components/ProximityCounter'
import ResultCard from '@/components/games/ResultCard'
import DailyBadgeShelf from '@/components/games/DailyBadgeShelf'
import { entrance, useEntranceSteps } from '@/lib/animations'

const GUESS_COST = 1
const spring = 'cubic-bezier(0.34,1.5,0.64,1)'

export default function GameSenseDayPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = use(params)

  const [state, setState] = useState<DayState | null>(null)
  const [showWinModal, setShowWinModal] = useState(false)
  const [showLossModal, setShowLossModal] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [showCompleteToast, setShowCompleteToast] = useState(false)
  const [floatingCost, setFloatingCost] = useState<{ key: string; cost: number } | null>(null)
  const [scorePulse, setScorePulse] = useState(false)
  // Hint tooltip — spring physics (inertia tooltip)
  const hintBtnRef = useRef<HTMLDivElement>(null)
  const hintTipPosRef = useRef({ x: 0, y: 0 })
  const hintTipTargetRef = useRef({ x: 0, y: 0 })
  const hintTipVelRef = useRef({ x: 0, y: 0 })
  const hintTipRafRef = useRef<number>(0)
  const [hintTipPos, setHintTipPos] = useState({ x: 0, y: 0 })
  const [showHintTooltip, setShowHintTooltip] = useState(false)
  const [hintTipExiting, setHintTipExiting] = useState(false)
  const hintTipExitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [hintJustUsed, setHintJustUsed] = useState(false)
  const [hintPressed, setHintPressed] = useState(false)
  const hintUsedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasInteractedRef = useRef(false)

  // Entrance animation: 0=waiting, 1=title centered, 2=title moves up + box, 3=sentence, 4=input, 5=rest, 6=done
  const [entranceStep, setEntranceStep] = useState(0)
  const [wipeStarted, setWipeStarted] = useState(false)
  // Post-game page-level sequencer — each parent section fires one after the other
  // Steps: 1=ResultCard, 2=Sentence, 3=Nav buttons, 4=Title/date, 5=Badges, 6=DiscoverMore, 7=Toast
  const isGameOver = state ? (state.won || state.score <= 0) : false
  const isModalOpen = showWinModal || showLossModal
  const isPostGameComplete = isGameOver && !isModalOpen
  const pgGaps = useMemo(() => [0, 3500, 400, 300, 300, 400, 500], [])
  const pgStep = useEntranceSteps(7, pgGaps, isPostGameComplete)
  // Pre-compute skip so clip-path renders correctly on first paint (before useEffect)
  const shouldAnimate = state ? !(state.won || state.score <= 0) : true

  const HINT_COST = 250

  // Force blue status bar on mobile only — solid bg-color for iOS safe-area + theme-color meta
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const prevBg = document.body.style.backgroundColor

    function applyMobileBg(mobile: boolean) {
      document.body.style.backgroundColor = mobile ? '#2D6BC4' : prevBg
    }

    applyMobileBg(mq.matches)
    mq.addEventListener('change', (e) => applyMobileBg(e.matches))

    // Theme-color meta for iOS status bar (always set — only iOS uses it)
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.remove())
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    meta.content = '#2D6BC4'
    document.head.appendChild(meta)

    return () => {
      document.body.style.backgroundColor = prevBg
      mq.removeEventListener('change', (e: MediaQueryListEvent) => applyMobileBg(e.matches))
      meta.remove()
      const restore = document.createElement('meta')
      restore.name = 'theme-color'
      restore.content = '#f5f0e8'
      document.head.appendChild(restore)
    }
  }, [])

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

  // Entrance animation sequence — starts immediately on mount
  useEffect(() => {
    if (!state) return
    // Skip animation if game already finished or reduced motion
    const alreadyDone = state.won || state.score <= 0
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (alreadyDone || reducedMotion) {
      setWipeStarted(true)
      setEntranceStep(6)
      return
    }
    // Blue wipe starts immediately (clip-path transition, 700ms)
    requestAnimationFrame(() => requestAnimationFrame(() => setWipeStarted(true)))
    // Sequenced entrance: title centered → title moves up + box → sentence → input → rest
    const t1 = setTimeout(() => setEntranceStep(1), 350)    // title word-pops (wipe ~halfway down)
    const t2 = setTimeout(() => setEntranceStep(2), 1700)   // title moves up, box scales in
    const t3 = setTimeout(() => setEntranceStep(3), 2400)   // sentence mounts
    const t4 = setTimeout(() => setEntranceStep(4), 3100)   // guess input fades in
    const t5 = setTimeout(() => setEntranceStep(5), 3400)   // rest fades in (score, nav)
    const t6 = setTimeout(() => setEntranceStep(6), 3900)   // done — clear animation classes
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!state])

  // Post-game sequencing is now handled by useEntranceSteps (pgStep) above

  // Hint tooltip spring physics
  useEffect(() => {
    if (!showHintTooltip) return
    const stiffness = 0.12
    const damping = 0.7
    const tick = () => {
      const dx = hintTipTargetRef.current.x - hintTipPosRef.current.x
      const dy = hintTipTargetRef.current.y - hintTipPosRef.current.y
      hintTipVelRef.current.x = hintTipVelRef.current.x * damping + dx * stiffness
      hintTipVelRef.current.y = hintTipVelRef.current.y * damping + dy * stiffness
      hintTipPosRef.current.x += hintTipVelRef.current.x
      hintTipPosRef.current.y += hintTipVelRef.current.y
      setHintTipPos({ x: hintTipPosRef.current.x, y: hintTipPosRef.current.y })
      hintTipRafRef.current = requestAnimationFrame(tick)
    }
    hintTipRafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(hintTipRafRef.current)
  }, [showHintTooltip])

  // Watch for score hitting 0 — trigger loss (skip on initial load from saved state)
  useEffect(() => {
    if (!state || state.won || pendingGuess) return
    if (!hasInteractedRef.current) return
    if (state.score <= 0) {
      setTimeout(() => setShowLossModal(true), 300)
    }
  }, [state, pendingGuess])

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
      hasInteractedRef.current = true

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
    }

    setState(newState)
    saveDayState(date, newState)
    setPendingGuess(null)

    if (won) {
      setTimeout(() => setShowWinModal(true), 300)
    }
    // Loss check handled by the useEffect watching state.score
  }, [pendingGuess, state, date])

  const handleRevealBlank = useCallback(
    (blank: BlankDef) => {
      if (!state || gameOver || pendingGuess) return
      if (state.blanksRevealed.includes(blank.key)) return
      hasInteractedRef.current = true

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
    [state, date, pendingGuess, gameOver],
  )

  const handleHint = useCallback(() => {
    if (!state || gameOver || pendingGuess || state.guesses.length === 0) return
    hasInteractedRef.current = true

    // Find best (lowest) proximity from guesses
    const bestProximity = Math.min(...state.guesses.map((g) => g.proximity))
    if (bestProximity <= 1) return

    // "Give up" mode — best proximity is already 2, so the answer is rank 1
    if (bestProximity <= 2) {
      // Forfeit all remaining points and reveal the answer — this is a loss
      const newState: DayState = {
        ...state,
        score: 0,
        guesses: [...state.guesses, { gameId: answer.id, proximity: 1, isHint: true }],
        won: false,
      }
      setState(newState)
      saveDayState(date, newState)
      setTimeout(() => setShowLossModal(true), 300)
      return
    }

    // Each hint halves the distance from the best guess so far
    const hintCount = state.guesses.filter((g) => g.isHint).length
    const divisor = Math.pow(2, hintCount + 1)
    const targetRank = Math.max(2, Math.round(bestProximity / divisor))

    const excludeIds = state.guesses.map((g) => g.gameId)
    const hintGame = getGameAtRank(answer, targetRank, excludeIds)
    if (!hintGame) return

    const hintProximity = calculateRank(hintGame, answer)

    const newState: DayState = {
      ...state,
      score: Math.max(0, state.score - HINT_COST),
      guesses: [...state.guesses, { gameId: hintGame.id, proximity: hintProximity, isHint: true }],
    }
    setState(newState)
    saveDayState(date, newState)

    // Trigger score deduction animation
    setFloatingCost({ key: `hint-${hintCount}`, cost: HINT_COST })
    setScorePulse(true)
    setTimeout(() => {
      setFloatingCost(null)
      setScorePulse(false)
    }, 1200)

    // Flash hint button red with cost text
    setHintJustUsed(true)
    if (hintUsedTimer.current) clearTimeout(hintUsedTimer.current)
    hintUsedTimer.current = setTimeout(() => setHintJustUsed(false), 2000)
  }, [state, pendingGuess, answer, date, gameOver])

  // Modal copy — picked once when modal opens, stable across re-renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const modalCopy = useMemo(() => {
    const score = state?.score ?? 0
    const isLoss = showLossModal && !state?.won
    const rankName = getGameSenseRank(score)
    return {
      heading: pickRandom(isLoss ? COPY.loss.headings : COPY.win.headings),
      subheading: pickRandom(isLoss ? COPY.loss.subheadings : COPY.win.subheadings),
      rankName,
      rankFlavour: pickRandom(GAME_SENSE_FLAVOUR[rankName]),
    }
  }, [showWinModal, showLossModal])

  // Compute share text for modals
  const shareText = useMemo(() => {
    if (!state) return ''
    const number = formatGameNumber(date)
    const emojiRow = state.guesses
      .map((g) => {
        if (g.proximity <= 50) return '\u{1F7E9}'
        if (g.proximity <= 200) return '\u{1F7E8}'
        if (g.proximity <= 500) return '\u{1F7E7}'
        return '\u{1F7E5}'
      })
      .join('')
    const lines = [
      `Game Sense ${number} \u00b7 ${state.score}/1000`,
      emojiRow,
      state.blanksRevealed.length > 0
        ? `${state.guesses.length} guesses \u00b7 ${state.blanksRevealed.length}/5 clues`
        : `${state.guesses.length} guesses`,
      'idlehours.co.uk/play/game-sense',
    ]
    return lines.join('\n')
  }, [state, date])

  // While loading from localStorage — layout handles the visual loading screen
  if (!state) {
    return null
  }

  const guessedIds = state.guesses.map((g) => g.gameId)
  const isAnimating = pendingGuess !== null
  const isPostGame = (state.won || state.score <= 0) && !isAnimating

  return (
    <>
      <Header />

      {/* Flex wrapper — game container grows to fill, no body-bg gap before footer */}
      <div className="flex min-h-screen flex-col">

      {/* Blue game world — full-width gradient, content constrained inside */}
      <div
        className="game-container mx-4 -mt-16 flex flex-1 flex-col rounded-2xl sm:mt-4 sm:rounded-[20px]"
        style={{
          background: 'linear-gradient(to bottom, #2D6BC4, #1a2a4a)',
          clipPath: (!shouldAnimate || wipeStarted) ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)',
          transition: shouldAnimate ? 'clip-path 0.7s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      >
        <main className={`font-game mx-auto flex flex-1 flex-col px-4 pb-8 pt-4 sm:py-8 ${isPostGame ? 'w-full max-w-7xl lg:px-8' : 'max-w-2xl sm:justify-center'}`}>
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
              <h1 className="text-[22px] font-black uppercase leading-none text-white sm:text-[clamp(40px,8vw,64px)]">
                {['Game', 'Sense'].map((word, i) => (
                  <span
                    key={word}
                    className="inline-block"
                    style={
                      entranceStep >= 1
                        ? { animation: `gs-word-pop 0.25s cubic-bezier(0.34,1.56,0.64,1) ${0.1 + i * 0.3}s both` }
                        : { opacity: 0 }
                    }
                  >
                    {word}{i === 0 ? '\u00a0' : ''}
                  </span>
                ))}
              </h1>
              <p className="mt-0.5 text-sm font-bold text-white/70 sm:mt-1.5 sm:text-xl">
                {['Guess', 'the', 'game!'].map((word, i) => (
                  <span
                    key={word}
                    className="inline-block"
                    style={
                      entranceStep >= 1
                        ? { animation: `gs-word-pop 0.2s cubic-bezier(0.34,1.56,0.64,1) ${0.7 + i * 0.3}s both` }
                        : { opacity: 0 }
                    }
                  >
                    {word}{i < 2 ? '\u00a0' : ''}
                  </span>
                ))}
              </p>
              {!isPostGame && (
                <p
                  className="mt-0 font-heading text-[10px] text-white/50 sm:mt-0.5 sm:text-xs"
                  style={
                    entranceStep < 5
                      ? { opacity: 0 }
                      : entranceStep < 6
                        ? { animation: `gs-fade-in 0.5s ${spring} both` }
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
                        ? { animation: `gs-fade-in 0.5s ${spring} both` }
                        : undefined)
              }
            >
              {/* Hint (left) | Score pill (center) | ? (right) — grid keeps score dead center */}
              {!isPostGame && <div className="mt-2 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 sm:mt-3 sm:gap-6">
                {/* Left cell — hint button with inertia tooltip */}
                <div className={`flex ${hintPressed ? 'pr-2' : 'justify-start'}`}>
                  {!gameOver && state.guesses.length > 0 && (() => {
                    const bestProximity = Math.min(...state.guesses.map((g) => g.proximity))
                    const isGiveUp = bestProximity <= 2
                    return (
                      <div
                        ref={hintBtnRef}
                        className={`relative ${hintPressed && !isGiveUp ? 'w-full sm:w-auto' : ''}`}
                        onMouseMove={(e) => {
                          if (isGiveUp) return
                          const rect = hintBtnRef.current?.getBoundingClientRect()
                          if (!rect) return
                          hintTipTargetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
                          if (!showHintTooltip || hintTipExiting) {
                            if (hintTipExitTimer.current) clearTimeout(hintTipExitTimer.current)
                            setHintTipExiting(false)
                            hintTipPosRef.current = { ...hintTipTargetRef.current }
                            hintTipVelRef.current = { x: 0, y: 0 }
                            setShowHintTooltip(true)
                          }
                        }}
                        onMouseLeave={() => {
                          if (showHintTooltip && !hintTipExiting) {
                            setHintTipExiting(true)
                            if (hintTipExitTimer.current) clearTimeout(hintTipExitTimer.current)
                            hintTipExitTimer.current = setTimeout(() => {
                              setShowHintTooltip(false)
                              setHintTipExiting(false)
                            }, 150)
                          }
                        }}
                      >
                        <button
                          type="button"
                          onClick={handleHint}
                          onTouchStart={() => setHintPressed(true)}
                          onTouchEnd={() => setHintPressed(false)}
                          onTouchCancel={() => setHintPressed(false)}
                          className={`inline-flex items-center rounded-full border-2 font-heading text-[13px] font-[900] tracking-wide text-white transition-[transform,box-shadow,background-color,border-color,width,padding] duration-200 ${
                            /* Circle on mobile (expand full-width when pressed), pill on sm+ */
                            hintPressed && !isGiveUp
                              ? 'h-11 w-full justify-between px-4 sm:w-auto sm:justify-center sm:gap-2 sm:px-6 sm:py-3'
                              : 'h-11 w-11 justify-center sm:h-auto sm:w-auto sm:gap-2 sm:px-6 sm:py-3'
                          } ${
                            isGiveUp || hintJustUsed
                              ? 'border-[hsl(7_62%_35%)] bg-[hsl(var(--game-red))] shadow-[0_6px_0_hsl(7_62%_35%),0_8px_20px_rgba(200,50,50,0.28)] hover:-translate-y-[3px] hover:shadow-[0_9px_0_hsl(7_62%_35%),0_12px_24px_rgba(200,50,50,0.35)] active:translate-y-[4px] active:shadow-[0_1px_0_hsl(7_62%_35%)]'
                              : 'border-[#2d6bc4] bg-[hsl(var(--game-blue))] shadow-[0_6px_0_#2d6bc4,0_8px_20px_rgba(45,107,196,0.28)] hover:-translate-y-[3px] hover:shadow-[0_9px_0_#2d6bc4,0_12px_24px_rgba(45,107,196,0.35)] active:translate-y-[4px] active:shadow-[0_1px_0_#2d6bc4]'
                          }`}
                        >
                          {hintJustUsed ? (
                            <span>&minus;{HINT_COST} pts</span>
                          ) : (
                            <>
                              <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              {/* Press-hold on mobile: show cost next to icon */}
                              {hintPressed && !isGiveUp && (
                                <span className="text-[11px] sm:hidden">&minus;{HINT_COST}</span>
                              )}
                              {/* Text label hidden on mobile, visible on sm+ */}
                              <span className="hidden sm:inline">{isGiveUp ? 'Give up' : 'Hint'}</span>
                            </>
                          )}
                        </button>
                        {/* Inertia tooltip — desktop only */}
                        {showHintTooltip && !isGiveUp && (
                          <div
                            className="pointer-events-none absolute z-20 hidden whitespace-nowrap px-3 py-1.5 shadow-lg sm:block"
                            style={{
                              background: 'hsl(var(--game-ink))',
                              left: hintTipPos.x,
                              top: hintTipPos.y,
                              transformOrigin: 'center bottom',
                              animation: hintTipExiting
                                ? 'gs-tip-out 150ms cubic-bezier(0.4, 0, 1, 1) forwards'
                                : 'gs-tip-in 200ms cubic-bezier(0.34, 1.5, 0.64, 1) forwards',
                              translate: '-50% calc(-100% - 14px)',
                            }}
                          >
                            <span className="text-[13px] font-black text-white">
                              &minus;{HINT_COST}{' '}
                              <span className="text-[10px] text-white/65">pts</span>
                            </span>
                            <span
                              className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent"
                              style={{ borderTopColor: 'hsl(var(--game-ink))' }}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
                {/* Center cell — score pill */}
                <div
                  className="relative inline-flex items-center gap-2 rounded-full border-2 border-white/20 bg-white px-5 py-2 transition-all duration-300"
                  style={{
                    borderColor: scorePulse ? 'hsl(var(--game-red))' : 'rgba(255,255,255,0.3)',
                    transform: scorePulse ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  <AnimatedScore
                    value={state.score}
                    className={`font-heading text-2xl font-black transition-colors duration-300 ${scorePulse ? 'text-[hsl(var(--game-red))]' : 'text-[hsl(var(--game-blue))]'}`}
                  />
                  <span className={`font-heading text-xs uppercase tracking-wider transition-colors duration-300 ${scorePulse ? 'text-[hsl(var(--game-red))]/60' : 'text-[hsl(var(--game-blue))]/60'}`}>
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
          {!playable && (
            <div className="mb-8 rounded-lg border border-white/20 bg-white/10 px-4 py-6 text-center backdrop-blur-sm">
              <p className="text-white/70">
                This game isn&apos;t available yet. Check back on the right day!
              </p>
              <Link
                href="/play/game-sense"
                className="mt-3 inline-block text-sm font-semibold text-white transition-colors hover:text-white/80"
              >
                Go to today&apos;s game &rarr;
              </Link>
            </div>
          )}

          {/* Game area — white container for clarity on blue bg */}
          {playable && !gameOver && (
            <div
              className="relative z-10 mb-4 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out sm:mb-8 sm:p-6"
              style={entranceStep < 2 ? { opacity: 0, transform: 'scale(0)' } : entranceStep < 6 ? { animation: 'gs-box-in 0.7s cubic-bezier(0.34,1.5,0.64,1) both' } : undefined}
            >
              {/* Sentence clue — always mounted so box knows its final size */}
              <div
                className="mb-4 transition-opacity duration-300 ease-out sm:mb-6"
                style={{ opacity: entranceStep < 3 ? 0 : 1 }}
              >
                <SentenceClue
                  answer={answer}
                  blanksRevealed={state.blanksRevealed}
                  score={state.score}
                  onRevealBlank={handleRevealBlank}
                  disabled={gameOver || isAnimating}
                  skipEntrance={entranceStep < 3}
                />
              </div>

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

              {/* Guess input — hidden when animating */}
              {!isAnimating && (
                <div
                  className="transition-opacity duration-300 ease-out"
                  style={{ opacity: entranceStep < 4 ? 0 : 1 }}
                >
                  <GuessInput
                    onGuess={handleGuess}
                    guessedIds={guessedIds}
                    disabled={false}
                  />
                </div>
              )}

              {/* Guess list — scrollable container on mobile, grid row transition for smooth height */}
              {!isAnimating && (
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  style={{ gridTemplateRows: state.guesses.length > 0 && entranceStep >= 4 ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    {state.guesses.length > 0 && entranceStep >= 4 && (
                      <div className="mt-4 max-h-[30vh] overflow-y-auto overscroll-contain sm:mt-6 sm:max-h-none sm:overflow-y-visible">
                        <GuessList guesses={state.guesses} entranceDelay={entranceStep < 6 ? 100 : 0} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Won/Lost — post-game page (when modal closed) */}
          {isPostGame && (
            <>
              {/* Nav pills — early so user can navigate away quickly */}
              <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
                {!today && (
                  <div style={entrance('pop', pgStep >= 1, 300)}>
                    <Link href="/play/game-sense" className="bvl-purple">
                      <img src="/images/icons/icon_Target-aim-practice-games-play.svg" alt="" className="h-5 w-5 brightness-0 invert" />
                      Today&apos;s game
                    </Link>
                  </div>
                )}
                <div style={entrance('pop', pgStep >= 1, 450)}>
                  <Link href="/play/game-sense/archive" className="bvl-purple">
                    <img src="/images/icons/icon_hourglass-loading-filtering-timer.svg" alt="" className="h-5 w-5 brightness-0 invert" />
                    View past games
                  </Link>
                </div>
              </div>

              {/* Two-column post-game: left (55%) badges + results, right (45%) analysis */}
              <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[55fr_45fr]">

                {/* ── Left column: badge shelf → gap → ResultCard ── */}
                <div className="order-2 flex flex-col gap-6 lg:order-1">
                  <div
                    className="grid transition-[grid-template-rows] duration-700 ease-out"
                    style={{ gridTemplateRows: pgStep >= 5 ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <DailyBadgeShelf currentGame="game-sense" animateStamp={pgStep >= 5} />
                    </div>
                  </div>

                  <ResultCard
                    game="game-sense"
                    score={state.score}
                    streak={0}
                    won={state.won}
                    puzzleLabel={`Game Sense ${formatGameNumber(date)} \u00b7 ${formatDisplayDate(date)}`}
                    onViewResults={() => {}}
                    animateEntrance={pgStep >= 1}
                  />
                </div>

                {/* ── Right column: single merged analysis card ── */}
                <div className="order-1 lg:order-2" style={entrance('slide-up', pgStep >= 2)}>
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white/95 shadow-sm">

                    {/* Puzzle label */}
                    <div className="px-5 pt-4 sm:px-6">
                      <p className="font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">
                        Game Sense {formatGameNumber(date)} &middot; {formatDisplayDate(date)}
                      </p>
                    </div>

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
                    <div className="mx-5 border-t border-dashed border-[hsl(var(--game-ink))]/15 sm:mx-6" />
                    <div className="flex gap-1.5 px-5 py-3 sm:gap-2 sm:px-6 sm:py-4">
                      {[
                        { label: 'Time', value: (() => {
                          if (!state.startedAt || !state.endedAt) return '—'
                          let secs = Math.round((state.endedAt - state.startedAt) / 1000)
                          if (secs < 60) return `${secs}s`
                          const hrs = Math.floor(secs / 3600)
                          secs %= 3600
                          const mins = Math.floor(secs / 60)
                          const rem = secs % 60
                          if (hrs > 0) return `${hrs}h ${mins}m ${rem}s`
                          return `${mins}m ${rem}s`
                        })() },
                        { label: 'Guesses', value: String(state.guesses.filter(g => !g.isHint).length) },
                        { label: 'Clues', value: `${state.blanksRevealed.length}/5` },
                        { label: 'Hints', value: String(state.guesses.filter(g => g.isHint).length) },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-[hsl(var(--game-cream-dark))] px-1.5 py-1.5 sm:rounded-xl sm:px-2 sm:py-2"
                        >
                          <span className="font-heading text-[14px] font-black text-[hsl(var(--game-ink))] sm:text-[18px]">
                            {value}
                          </span>
                          <span className="font-heading text-[7px] font-extrabold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-light))] sm:text-[9px] sm:tracking-[0.18em]">
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Revealed sentence */}
                    <div className="mx-5 border-t border-dashed border-[hsl(var(--game-ink))]/15 sm:mx-6" />
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
                        <div className="mx-5 border-t border-dashed border-[hsl(var(--game-ink))]/15 sm:mx-6" />
                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6">
                          <p className="mb-3 font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">
                            Your guesses
                          </p>
                          <GuessList guesses={state.guesses} />
                        </div>
                      </>
                    )}
                  </div>
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
              {!today && (
                <Link
                  href="/play/game-sense"
                  className="bvl-purple"
                >
                  <img src="/images/icons/icon_Target-aim-practice-games-play.svg" alt="" className="h-5 w-5 brightness-0 invert" />
                  Today&apos;s game
                </Link>
              )}
              <Link
                href="/play/game-sense/archive"
                className="bvl-purple"
              >
                <img src="/images/icons/icon_hourglass-loading-filtering-timer.svg" alt="" className="h-5 w-5 brightness-0 invert" />
                View past games
              </Link>
            </div>
          )}
        </main>
      </div>

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

      {/* Complete toast */}
      {showCompleteToast && pgStep >= 7 && (
        <div
          className="fixed left-1/2 top-6 z-[200] -translate-x-1/2"
          style={{ animation: 'gs-toast-in 500ms cubic-bezier(0.34, 1.5, 0.64, 1) forwards' }}
        >
          <div className="flex items-center gap-2.5 rounded-full bg-emerald-500 px-5 py-2.5 shadow-lg shadow-emerald-500/30">
            <span className="text-lg">🏆</span>
            <span className="font-heading text-sm font-black text-white">
              Game Sense <span className="opacity-80">✓</span>
            </span>
            <span className="font-heading text-xs font-semibold text-white/80">
              +{state.score} pts earned
            </span>
          </div>
        </div>
      )}

      {/* Win modal */}
      {showWinModal && state.won && (
        <GameEndModal
          result="win"
          score={state.score}
          heading={modalCopy.heading}
          subheading={modalCopy.subheading}
          rankName={modalCopy.rankName}
          rankFlavour={modalCopy.rankFlavour}
          stats={[
            { label: 'Score', value: String(state.score) },
            { label: 'Guesses', value: String(state.guesses.length) },
            { label: 'Clues Revealed', value: `${state.blanksRevealed.length}/5` },
          ]}
          heroZone={
            answer.igdbImageId ? (
              <div className="relative w-full overflow-hidden bg-secondary" style={{ maxHeight: '240px' }}>
                <img src={igdbCoverUrl(answer.igdbImageId)} alt={answer.title} className="w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-heading text-xl font-black text-white drop-shadow-md">
                    {answer.title}
                  </h3>
                  <p className="text-xs font-semibold text-white/70">
                    {answer.year} &middot; {answer.genres.slice(0, 2).join(', ')}
                  </p>
                </div>
              </div>
            ) : null
          }
          shareText={shareText}
          shareUrl="https://idlehours.co.uk/play/game-sense"
          onClose={() => {
            setShowWinModal(false)
            setShowCompleteToast(true)
            setTimeout(() => setShowCompleteToast(false), 3000)
          }}
        />
      )}

      {/* Loss modal */}
      {showLossModal && !state.won && (
        <GameEndModal
          result="loss"
          score={state.score}
          heading={modalCopy.heading}
          subheading={modalCopy.subheading}
          rankName={modalCopy.rankName}
          rankFlavour={modalCopy.rankFlavour}
          stats={[
            { label: 'Score', value: String(state.score) },
            { label: 'Guesses', value: String(state.guesses.length) },
            { label: 'Clues Revealed', value: `${state.blanksRevealed.length}/5` },
          ]}
          heroZone={
            answer.igdbImageId ? (
              <div className="relative w-full overflow-hidden bg-secondary" style={{ maxHeight: '240px' }}>
                <img src={igdbCoverUrl(answer.igdbImageId)} alt={answer.title} className="w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-heading text-xl font-black text-white drop-shadow-md">
                    {answer.title}
                  </h3>
                  <p className="text-xs font-semibold text-white/70">
                    {answer.year} &middot; {answer.genres.slice(0, 2).join(', ')}
                  </p>
                </div>
              </div>
            ) : null
          }
          shareText={shareText}
          shareUrl="https://idlehours.co.uk/play/game-sense"
          onClose={() => setShowLossModal(false)}
        />
      )}
    </>
  )
}
