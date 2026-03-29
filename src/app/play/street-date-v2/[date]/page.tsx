'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo, useRef, use } from 'react'
import Header from '@/components/Header'
import AnimatedScore from '@/components/AnimatedScore'
import { generatePuzzle } from '../lib/puzzleGen'
import type { StreetDateGame } from '../../street-date/data/games'
import { GAMES } from '../../street-date/data/games'
import {
  createInitialState,
  loadState,
  saveState,
  calcGuessResults,
  calcScoreAfterGuess,
  calcSlotResult,
  emojiForResult,
  MAX_GUESSES,
  HINT_ONE_COST,
  HINT_ALL_COST,
  type V2DayState,
} from '../lib/gameState'
import { igdbCoverUrl } from '../../street-date/lib/imageUtils'
import GameEndModal from '@/components/games/GameEndModal'
import { COPY, pickRandom, getStreetDateRank, STREET_DATE_FLAVOUR } from '@/components/games/GameEndModal.copy'
import ResultCard from '@/components/games/ResultCard'
import DailyBadgeShelf from '@/components/games/DailyBadgeShelf'
import { entrance, useEntranceSteps } from '@/lib/animations'
import { formatGameNumber, formatDisplayDate } from '../../street-date/lib/dateUtils'
import Link from 'next/link'

const spring = 'cubic-bezier(0.34,1.5,0.64,1)'

// ── Helpers ──────────────────────────────────────────────────────────────────

function gameById(id: string): StreetDateGame | undefined {
  return GAMES.find(g => g.id === id)
}

// ── Component ────────────────────────────────────────────────────────────────

export default function StreetDateV2DayPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = use(params)

  const [state, setState] = useState<V2DayState | null>(null)
  const [wipeStarted, setWipeStarted] = useState(false)
  const [entranceStep, setEntranceStep] = useState(0)
  const [selectedChip, setSelectedChip] = useState<string | null>(null)
  const [hintOnePending, setHintOnePending] = useState(false)
  const [scorePulse, setScorePulse] = useState(false)
  const [floatingCost, setFloatingCost] = useState<{ key: number; cost: number } | null>(null)
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [showWinModal, setShowWinModal] = useState(false)
  const [showLossModal, setShowLossModal] = useState(false)

  const wipeTriggered = useRef(false)
  const puzzleRef = useRef<ReturnType<typeof generatePuzzle> | null>(null)

  // Stable puzzle reference
  const puzzle = useMemo(() => {
    if (puzzleRef.current) return puzzleRef.current
    const p = generatePuzzle(date)
    puzzleRef.current = p
    return p
  }, [date])

  const correctOrder = puzzle.games.map(g => g.id)

  // Pre-compute skip for clip-path
  const shouldAnimate = state ? !(state.won || state.finished) : true

  // Force green status bar on mobile
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const prevBg = document.body.style.backgroundColor

    function applyMobileBg(mobile: boolean) {
      document.body.style.backgroundColor = mobile ? '#1A7A40' : prevBg
    }

    applyMobileBg(mq.matches)
    mq.addEventListener('change', (e) => applyMobileBg(e.matches))

    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.remove())
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    meta.content = '#1A7A40'
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

  // Load state
  useEffect(() => {
    const loaded = loadState(date)
    if (loaded) {
      setState(loaded)
    } else {
      const fresh = createInitialState(
        puzzle.games.map(g => g.id),
        puzzle.shuffled.map(g => g.id),
      )
      setState(fresh)
      saveState(date, fresh)
    }

    // Wipe entrance
    if (!wipeTriggered.current) {
      wipeTriggered.current = true
      const existing = loadState(date)
      const alreadyDone = existing ? existing.finished : false
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (alreadyDone || reducedMotion) {
        setWipeStarted(true)
        setEntranceStep(6)
      } else {
        requestAnimationFrame(() => requestAnimationFrame(() => setWipeStarted(true)))
      }
    }
  }, [date, puzzle])

  // Entrance animation sequence
  useEffect(() => {
    if (!state) return
    if (state.finished) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      setEntranceStep(6)
      return
    }
    const t1 = setTimeout(() => setEntranceStep(1), 350)
    const t2 = setTimeout(() => setEntranceStep(2), 1700)
    const t3 = setTimeout(() => setEntranceStep(3), 2400)
    const t4 = setTimeout(() => setEntranceStep(4), 3100)
    const t5 = setTimeout(() => setEntranceStep(5), 3400)
    const t6 = setTimeout(() => setEntranceStep(6), 3900)
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      clearTimeout(t4); clearTimeout(t5); clearTimeout(t6)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!state])

  // ── Interactions ───────────────────────────────────────────────────────────

  const persist = useCallback((s: V2DayState) => {
    setState(s)
    saveState(date, s)
  }, [date])

  // Tap a chip in the pool
  const handlePoolChipTap = useCallback((chipId: string) => {
    if (!state || state.finished) return
    if (hintOnePending) {
      setHintOnePending(false)
      return
    }
    if (selectedChip === chipId) {
      setSelectedChip(null)
    } else {
      setSelectedChip(chipId)
    }
  }, [state, selectedChip, hintOnePending])

  // Tap a slot
  const handleSlotTap = useCallback((slotIndex: number) => {
    if (!state || state.finished) return

    // Hint-one pending mode: reveal this slot
    if (hintOnePending) {
      const chipInSlot = state.slots[slotIndex]
      if (!chipInSlot) {
        setHintOnePending(false)
        return
      }
      const result = calcSlotResult(slotIndex, chipInSlot, correctOrder)
      const newRevealed = { ...state.revealedSlots, [slotIndex]: result }
      const game = gameById(chipInSlot)
      const newRevealedYearIds = game
        ? [...state.revealedYearIds, chipInSlot]
        : state.revealedYearIds
      const newScore = Math.max(0, state.score - HINT_ONE_COST)
      persist({
        ...state,
        revealedSlots: newRevealed,
        revealedYearIds: newRevealedYearIds,
        hintOneUsed: true,
        score: newScore,
      })
      setHintOnePending(false)
      triggerScorePulse(HINT_ONE_COST)
      return
    }

    const chipInSlot = state.slots[slotIndex]

    // If we have a selected chip from pool
    if (selectedChip) {
      const isFromPool = state.pool.includes(selectedChip)
      const isFromSlot = state.slots.includes(selectedChip)

      if (isFromPool) {
        if (chipInSlot) {
          // Swap: pool chip goes in, slot chip goes back to pool
          const newSlots = [...state.slots]
          newSlots[slotIndex] = selectedChip
          const newPool = state.pool.filter(id => id !== selectedChip)
          newPool.push(chipInSlot)
          persist({ ...state, slots: newSlots, pool: newPool })
        } else {
          // Place chip into empty slot
          const newSlots = [...state.slots]
          newSlots[slotIndex] = selectedChip
          const newPool = state.pool.filter(id => id !== selectedChip)
          persist({ ...state, slots: newSlots, pool: newPool })
        }
        setSelectedChip(null)
      } else if (isFromSlot) {
        const fromSlotIndex = state.slots.indexOf(selectedChip)
        if (fromSlotIndex === slotIndex) {
          // Tapped same slot — deselect
          setSelectedChip(null)
          return
        }
        // Swap two slot chips
        const newSlots = [...state.slots]
        newSlots[fromSlotIndex] = chipInSlot
        newSlots[slotIndex] = selectedChip
        persist({ ...state, slots: newSlots })
        setSelectedChip(null)
      }
    } else {
      // No chip selected — select the chip in this slot (if any)
      if (chipInSlot) {
        setSelectedChip(chipInSlot)
      }
    }
  }, [state, selectedChip, hintOnePending, correctOrder, persist])

  // Return selected slot chip back to pool when pool area is tapped
  const handlePoolAreaTap = useCallback(() => {
    if (!state || state.finished || !selectedChip) return
    if (hintOnePending) {
      setHintOnePending(false)
      return
    }
    const slotIndex = state.slots.indexOf(selectedChip)
    if (slotIndex !== -1) {
      const newSlots = [...state.slots]
      newSlots[slotIndex] = null
      const newPool = [...state.pool, selectedChip]
      persist({ ...state, slots: newSlots, pool: newPool })
      setSelectedChip(null)
    } else {
      setSelectedChip(null)
    }
  }, [state, selectedChip, hintOnePending, persist])

  // Submit guess
  const handleSubmit = useCallback(() => {
    if (!state || state.finished) return
    const filledSlots = state.slots.filter(Boolean) as string[]
    if (filledSlots.length < 7) return

    const guessNum = state.guesses.length + 1
    const { correctCount, results } = calcGuessResults(filledSlots, correctOrder)
    const newScore = calcScoreAfterGuess(state.score, guessNum)
    const won = correctCount === 7
    const finished = won || guessNum >= MAX_GUESSES

    const guess = {
      order: filledSlots,
      correctCount,
      results,
      score: newScore,
    }

    const updatedState: V2DayState = {
      ...state,
      guesses: [...state.guesses, guess],
      score: newScore,
      won,
      finished,
      revealedSlots: state.revealedSlots,
    }

    // If lost, show correct order in slots with all revealed
    if (finished && !won) {
      updatedState.slots = [...correctOrder]
      updatedState.pool = []
      const allRevealed: Record<number, 'exact' | 'close' | 'wrong'> = {}
      correctOrder.forEach((_, i) => { allRevealed[i] = 'exact' })
      updatedState.revealedSlots = allRevealed
    }

    persist(updatedState)
    setSelectedChip(null)
    setJustSubmitted(true)
    setTimeout(() => setJustSubmitted(false), 1500)

    if (guessNum > 1) {
      triggerScorePulse(150)
    }

    if (updatedState.won) {
      setTimeout(() => setShowWinModal(true), 300)
    } else if (updatedState.finished) {
      setTimeout(() => setShowLossModal(true), 300)
    }
  }, [state, correctOrder, persist])

  // Clear all slots
  const handleClear = useCallback(() => {
    if (!state || state.finished) return
    const allChips = [...state.pool]
    state.slots.forEach(s => { if (s) allChips.push(s) })
    persist({
      ...state,
      slots: Array(7).fill(null),
      pool: allChips,
      revealedSlots: {},
    })
    setSelectedChip(null)
    setHintOnePending(false)
  }, [state, persist])

  // Hint: reveal one
  const handleHintOne = useCallback(() => {
    if (!state || state.finished || state.hintOneUsed) return
    const hasFilledSlot = state.slots.some(Boolean)
    if (!hasFilledSlot) return
    setHintOnePending(true)
    setSelectedChip(null)
  }, [state])

  // Hint: reveal all
  const handleHintAll = useCallback(() => {
    if (!state || state.finished || state.hintAllUsed) return
    const filledSlots = state.slots.filter(Boolean)
    if (filledSlots.length === 0) return

    const newRevealed = { ...state.revealedSlots }
    const newRevealedYearIds = [...state.revealedYearIds]
    state.slots.forEach((chipId, i) => {
      if (!chipId) return
      newRevealed[i] = calcSlotResult(i, chipId, correctOrder)
      if (!newRevealedYearIds.includes(chipId)) {
        newRevealedYearIds.push(chipId)
      }
    })

    const newScore = Math.max(0, state.score - HINT_ALL_COST)
    persist({
      ...state,
      revealedSlots: newRevealed,
      revealedYearIds: newRevealedYearIds,
      hintAllUsed: true,
      score: newScore,
    })
    setHintOnePending(false)
    triggerScorePulse(HINT_ALL_COST)
  }, [state, correctOrder, persist])

  const triggerScorePulse = useCallback((cost: number) => {
    setScorePulse(true)
    setFloatingCost({ key: Date.now(), cost })
    setTimeout(() => setScorePulse(false), 600)
    setTimeout(() => setFloatingCost(null), 1200)
  }, [])

  // ── Drag & Drop (Desktop) ─────────────────────────────────────────────────

  const handleDragStart = useCallback((e: React.DragEvent, chipId: string) => {
    e.dataTransfer.setData('text/plain', chipId)
    e.dataTransfer.effectAllowed = 'move'
    setSelectedChip(null)
    setHintOnePending(false)
  }, [])

  const handleSlotDrop = useCallback((e: React.DragEvent, slotIndex: number) => {
    e.preventDefault()
    if (!state || state.finished) return
    const chipId = e.dataTransfer.getData('text/plain')
    if (!chipId) return

    const isFromPool = state.pool.includes(chipId)
    const fromSlotIndex = state.slots.indexOf(chipId)
    const chipInSlot = state.slots[slotIndex]

    if (isFromPool) {
      const newSlots = [...state.slots]
      const newPool = state.pool.filter(id => id !== chipId)
      if (chipInSlot) newPool.push(chipInSlot)
      newSlots[slotIndex] = chipId
      persist({ ...state, slots: newSlots, pool: newPool })
    } else if (fromSlotIndex !== -1) {
      const newSlots = [...state.slots]
      newSlots[fromSlotIndex] = chipInSlot
      newSlots[slotIndex] = chipId
      persist({ ...state, slots: newSlots })
    }
  }, [state, persist])

  const handlePoolDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!state || state.finished) return
    const chipId = e.dataTransfer.getData('text/plain')
    if (!chipId) return
    const slotIndex = state.slots.indexOf(chipId)
    if (slotIndex !== -1) {
      const newSlots = [...state.slots]
      newSlots[slotIndex] = null
      const newPool = [...state.pool, chipId]
      persist({ ...state, slots: newSlots, pool: newPool })
    }
  }, [state, persist])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  // ── Emoji grid for finished state ─────────────────────────────────────────

  const emojiGrid = useMemo(() => {
    if (!state || state.guesses.length === 0) return ''
    return state.guesses
      .map(g => g.results.map(emojiForResult).join(''))
      .join('\n')
  }, [state])

  // ── Post-game state ────────────────────────────────────────────────────────

  const isPostGame = state ? state.finished : false
  const isModalOpen = showWinModal || showLossModal
  const isPostGameReady = isPostGame && !isModalOpen
  const pgGaps = useMemo(() => [0, 3500, 400, 300, 300, 400, 500], [])
  const pgStep = useEntranceSteps(7, pgGaps, isPostGameReady)

  const modalCopy = useMemo(() => {
    if (!state) return null
    const score = state.score
    const result = state.won ? 'win' : 'loss'
    const rankName = getStreetDateRank(score)
    const flavours = STREET_DATE_FLAVOUR[rankName] || ['Good game.']
    return {
      result: result as 'win' | 'loss',
      heading: pickRandom(COPY[result].headings),
      subheading: pickRandom(COPY[result].subheadings),
      rankName,
      rankFlavour: pickRandom(flavours),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.won, state?.finished, state?.score])

  const shareText = useMemo(() => {
    if (!state || !state.finished) return ''
    const number = formatGameNumber(date)
    const emojiRows = state.guesses.map(g => g.results.map(emojiForResult).join('')).join('\n')
    return `Street Date ${number} \u00b7 ${state.score}/1000\n${emojiRows}\nidlehours.co.uk/play/street-date-v2`
  }, [state?.finished, state?.guesses, state?.score, date])

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!state) {
    return (
      <>
        <Header />
        <div
          className="game-container mx-0 -mt-16 flex flex-1 flex-col rounded-none sm:mx-4 sm:mt-4 sm:rounded-[20px]"
          style={{ background: 'linear-gradient(155deg, #1A7A40, #0d1f12)' }}
        >
          <p className="p-8 text-center text-white/40">Loading...</p>
        </div>
      </>
    )
  }

  const allSlotsFilled = state.slots.every(Boolean)
  const lastGuess = state.guesses[state.guesses.length - 1] ?? null

  return (
    <>
      <Header />

      <div className="flex min-h-screen flex-col">
        {/* Green game world */}
        <div
          className="game-container mx-0 -mt-16 flex flex-1 flex-col rounded-none sm:mx-4 sm:mt-4 sm:rounded-[20px]"
          style={{
            background: 'linear-gradient(155deg, #1A7A40, #0d1f12)',
            clipPath: (!shouldAnimate || wipeStarted) ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)',
            transition: shouldAnimate ? 'clip-path 0.7s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}
        >
          <main className={`font-game mx-auto flex w-full flex-1 flex-col px-4 pb-8 pt-4 sm:py-8 ${isPostGame ? 'max-w-7xl lg:px-8' : 'max-w-3xl'}`}>
            {/* ── Title ── */}
            <div
              className="text-center"
              style={
                entranceStep < 1
                  ? { opacity: 0, transform: 'translateY(120px)' }
                  : entranceStep < 2
                    ? { opacity: 1, transform: 'translateY(120px)' }
                    : { opacity: 1, transform: 'translateY(0)' }
              }
            >
              <div className="transition-all duration-700 ease-out">
                <h1 className="text-[22px] font-black uppercase leading-none text-white sm:text-[clamp(40px,8vw,64px)]">
                  {['Street', 'Date'].map((word, i) => (
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
                  {['Place', 'all', 'seven', 'in', 'release', 'order'].map((word, i) => (
                    <span
                      key={word}
                      className="inline-block"
                      style={
                        entranceStep >= 1
                          ? { animation: `gs-word-pop 0.2s cubic-bezier(0.34,1.56,0.64,1) ${0.7 + i * 0.15}s both` }
                          : { opacity: 0 }
                      }
                    >
                      {word}{i < 5 ? '\u00a0' : ''}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            {/* ── Score pill + guess pips ── */}
            <div
              className="mt-4 text-center"
              style={
                entranceStep < 5
                  ? { opacity: 0 }
                  : entranceStep < 6
                    ? { animation: `gs-fade-in 0.5s ${spring} both` }
                    : undefined
              }
            >
              {!state.finished && (
                <div
                  className="relative inline-flex items-center gap-2 rounded-full border-2 bg-white px-5 py-2 transition-all duration-300"
                  style={{
                    borderColor: scorePulse ? 'hsl(var(--game-red))' : 'rgba(255,255,255,0.2)',
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
                      key={floatingCost.key}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(var(--game-red))] px-4 py-1 font-heading text-lg font-black text-white shadow-lg"
                      style={{ animation: 'float-up 1.2s ease-out forwards' }}
                    >
                      -{floatingCost.cost}
                    </span>
                  )}
                </div>
              )}

              {/* Guess pips */}
              {!state.finished && (
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  {Array.from({ length: MAX_GUESSES }).map((_, i) => {
                    const used = i < state.guesses.length
                    const current = i === state.guesses.length
                    return (
                      <div
                        key={i}
                        className={`h-2.5 w-2.5 rounded-full border-2 transition-all duration-300 ${
                          used
                            ? 'border-white/40 bg-white/40'
                            : current
                              ? 'border-amber-400 bg-amber-400'
                              : 'border-white/20 bg-transparent'
                        }`}
                      />
                    )
                  })}
                  <span className="ml-1.5 text-xs font-bold text-white/40">
                    {state.guesses.length}/{MAX_GUESSES}
                  </span>
                </div>
              )}
            </div>

            {/* ── Gameplay area ── */}
            {!state.finished && (
              <div
                className="mt-6"
                style={
                  entranceStep < 2
                    ? { opacity: 0, transform: 'scale(0)' }
                    : entranceStep < 6
                      ? { animation: `gs-box-in 0.7s ${spring} both` }
                      : undefined
                }
              >
              {/* Hint buttons — outside the white container */}
              <div className="mb-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={hintOnePending ? () => setHintOnePending(false) : handleHintOne}
                  disabled={state.hintOneUsed && !hintOnePending}
                  className={`rounded-full border-2 px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                    hintOnePending
                      ? 'border-amber-400 bg-amber-400 text-black'
                      : state.hintOneUsed
                        ? 'cursor-not-allowed border-white/10 text-white/30'
                        : 'border-white/30 text-white hover:border-white/60 hover:bg-white/10'
                  }`}
                >
                  {hintOnePending ? 'pick a slot →' : `Reveal one slot −${HINT_ONE_COST}pts`}
                </button>
                <button
                  type="button"
                  onClick={handleHintAll}
                  disabled={state.hintAllUsed}
                  className={`rounded-full border-2 px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                    state.hintAllUsed
                      ? 'cursor-not-allowed border-white/10 text-white/30'
                      : 'border-white/30 text-white hover:border-white/60 hover:bg-white/10'
                  }`}
                >
                  Reveal all slots −{HINT_ALL_COST}pts
                </button>
              </div>

              {/* White container — sizes to fit slots */}
              <div className="mx-auto w-fit rounded-2xl bg-white/95 shadow-sm p-5 sm:p-8">
              <div className="flex flex-col gap-5">

                {/* ── Slot grid — wraps onto 2 lines on small screens ── */}
                <div>
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                    {state.slots.map((chipId, i) => {
                      const game = chipId ? gameById(chipId) : null
                      const revealed = state.revealedSlots[i]
                      const isSelected = chipId !== null && chipId === selectedChip
                      const slotBorderColor = revealed
                        ? revealed === 'exact'
                          ? 'border-green-400'
                          : revealed === 'close'
                            ? 'border-amber-400'
                            : 'border-red-400'
                        : isSelected
                          ? 'border-blue-400'
                          : chipId
                            ? 'border-[hsl(var(--game-cream-dark))]'
                            : 'border-dashed border-[hsl(var(--game-ink))]/15'

                      return (
                        <div
                          key={i}
                          onClick={() => handleSlotTap(i)}
                          onDrop={(e) => handleSlotDrop(e, i)}
                          onDragOver={handleDragOver}
                          className={`relative flex h-[140px] w-[90px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 transition-all duration-200 sm:h-[170px] sm:w-[110px] ${slotBorderColor} ${
                            hintOnePending && chipId ? 'animate-pulse ring-2 ring-amber-400/50' : ''
                          } ${isSelected ? 'ring-2 ring-blue-400/50 shadow-lg shadow-blue-400/20' : ''}`}
                          style={{
                            background: chipId ? 'hsl(var(--game-cream))' : 'rgba(0,0,0,0.02)',
                          }}
                        >
                          {/* Slot number */}
                          <span className="absolute left-1.5 top-1 text-[10px] font-bold text-[hsl(var(--game-ink-dim))]">
                            {String(i + 1).padStart(2, '0')}
                          </span>

                          {game ? (
                            <div
                              draggable
                              onDragStart={(e) => handleDragStart(e, chipId!)}
                              className="flex h-full w-full flex-col cursor-grab active:cursor-grabbing"
                            >
                              <div className="relative flex-1 overflow-hidden rounded-t-[10px]" style={{ aspectRatio: '3/4' }}>
                                <img
                                  src={igdbCoverUrl(game.igdbImageId)}
                                  alt={game.title}
                                  className="absolute inset-0 h-full w-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <div className="flex flex-col items-center justify-center px-1 py-1">
                                <span className="max-w-[80px] truncate text-center text-[9px] font-bold leading-tight text-[hsl(var(--game-ink))] sm:max-w-[100px] sm:text-[10px]">
                                  {game.title}
                                </span>
                                {state.revealedYearIds.includes(chipId!) && (
                                  <span className="text-[10px] font-bold text-green-400">
                                    {game.year}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xl text-[hsl(var(--game-ink-dim))]">+</span>
                              {i === 0 && (
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[hsl(var(--game-ink-dim))]">Oldest</span>
                              )}
                              {i === 6 && (
                                <span className="text-[8px] font-bold uppercase tracking-wider text-[hsl(var(--game-ink-dim))]">Newest</span>
                              )}
                            </div>
                          )}

                          {/* Result indicator after reveal */}
                          {revealed && (
                            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px]"
                              style={{
                                background: revealed === 'exact' ? '#22c55e' : revealed === 'close' ? '#f59e0b' : '#ef4444',
                              }}
                            >
                              {revealed === 'exact' ? '✓' : revealed === 'close' ? '~' : '✗'}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* ── Guess history — visual grid like Wordle ── */}
                {state.guesses.length > 0 && (
                  <div className="space-y-3">
                    {state.guesses.map((guess, gi) => (
                      <div
                        key={gi}
                        className="rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-ink))]/[0.02] p-3"
                        style={justSubmitted && gi === state.guesses.length - 1
                          ? { animation: `gs-fade-in 0.4s ${spring} both` }
                          : undefined
                        }
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-heading text-[10px] font-[700] uppercase tracking-wider text-[hsl(var(--game-ink-dim))]">
                            Guess {gi + 1}
                          </span>
                          <span className="font-heading text-[12px] font-[800] text-[hsl(var(--game-ink))]">
                            {guess.correctCount}/7
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {guess.order.map((chipId, ci) => {
                            const game = gameById(chipId)
                            if (!game) return null
                            const result = guess.results[ci]
                            const borderColor = result === 'exact'
                              ? 'border-green-500'
                              : result === 'close'
                                ? 'border-amber-400'
                                : 'border-red-400'
                            const bgColor = result === 'exact'
                              ? 'bg-green-500/10'
                              : result === 'close'
                                ? 'bg-amber-400/10'
                                : 'bg-red-400/10'
                            return (
                              <div key={ci} className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg border-2 p-0.5 ${borderColor} ${bgColor}`}>
                                <div className="aspect-[3/4] w-full overflow-hidden rounded-md">
                                  <img
                                    src={igdbCoverUrl(game.igdbImageId)}
                                    alt={game.title}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                </div>
                                <span className="line-clamp-1 w-full text-center text-[7px] font-[600] leading-tight text-[hsl(var(--game-ink))] sm:text-[8px]">
                                  {game.title}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                    {lastGuess && !state.finished && (
                      <p className="text-center text-sm font-bold text-[hsl(var(--game-ink-light))]">
                        {lastGuess.correctCount}/7 in the correct position
                      </p>
                    )}
                  </div>
                )}

                {/* ── Action buttons ── */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-full border-2 border-[hsl(var(--game-ink))]/20 px-6 py-2 text-sm font-bold text-[hsl(var(--game-ink-light))] transition-all hover:border-[hsl(var(--game-ink))]/40 hover:text-[hsl(var(--game-ink))]"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!allSlotsFilled}
                    className={`rounded-full px-6 py-2 text-sm font-bold transition-all ${
                      allSlotsFilled
                        ? 'bg-[hsl(var(--game-green))] text-white shadow-[0_3px_0_hsl(147_61%_32%),0_6px_12px_rgba(0,0,0,0.1)] hover:brightness-110'
                        : 'cursor-not-allowed bg-[hsl(var(--game-ink))]/10 text-[hsl(var(--game-ink-dim))]'
                    }`}
                  >
                    Submit order
                  </button>
                </div>

                {/* ── Game pool ── */}
                <div
                  onClick={(e) => {
                    // Only trigger if clicking the pool background, not a chip
                    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.poolBg) {
                      handlePoolAreaTap()
                    }
                  }}
                  onDrop={handlePoolDrop}
                  onDragOver={handleDragOver}
                  className="rounded-2xl border-2 border-dashed border-[hsl(var(--game-ink))]/15 bg-[hsl(var(--game-cream-dark))]/40 p-3 sm:p-4"
                  data-pool-bg="true"
                >
                  <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--game-ink-dim))]" data-pool-bg="true">
                    {state.pool.length > 0 ? 'Drag games into the slots above' : 'All games placed'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2" data-pool-bg="true">
                    {state.pool.map((chipId, i) => {
                      const game = gameById(chipId)
                      if (!game) return null
                      const isSelected = chipId === selectedChip
                      return (
                        <div
                          key={chipId}
                          draggable
                          onDragStart={(e) => handleDragStart(e, chipId)}
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePoolChipTap(chipId)
                          }}
                          className={`flex h-[140px] w-[90px] cursor-grab flex-col overflow-hidden rounded-xl border-2 bg-[hsl(var(--game-white))] transition-all duration-200 active:cursor-grabbing sm:h-[170px] sm:w-[110px] ${
                            isSelected
                              ? 'border-blue-400 shadow-lg shadow-blue-400/20 -translate-y-1'
                              : 'border-[hsl(var(--game-ink))]/10 hover:border-[hsl(var(--game-ink))]/20'
                          }`}
                          style={
                            entranceStep >= 3 && entranceStep < 6
                              ? { animation: `gs-fade-in 0.3s ${spring} ${i * 60}ms both` }
                              : undefined
                          }
                        >
                          <div className="relative flex-1 overflow-hidden rounded-t-[10px]" style={{ aspectRatio: '3/4' }}>
                            <img
                              src={igdbCoverUrl(game.igdbImageId)}
                              alt={game.title}
                              className="absolute inset-0 h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex flex-col items-center justify-center px-1 py-1">
                            <span className="max-w-[80px] truncate text-center text-[9px] font-bold leading-tight text-[hsl(var(--game-ink))] sm:max-w-[100px] sm:text-[10px]">
                              {game.title}
                            </span>
                            {state.revealedYearIds.includes(chipId) && (
                              <span className="text-[10px] font-bold text-green-400">
                                {game.year}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              </div>
              </div>
            )}

            {/* ── Post-game layout ── */}
            {isPostGame && (
              <>
                {/* Nav pills */}
                <div className="mb-6 mt-6 flex flex-wrap items-center justify-center gap-4">
                  <Link href="/play/street-date-v2" className="bvl-purple">
                    Today&apos;s game
                  </Link>
                  <Link href="/play/archive?game=street-date" className="bvl-purple">
                    View past games
                  </Link>
                </div>

                {/* Two-column: left (badges + ResultCard), right (game list) */}
                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[55fr_45fr]">

                  {/* Left: badges + ResultCard */}
                  <div className="order-2 flex flex-col gap-6 lg:order-1">
                    <div
                      className="grid transition-[grid-template-rows] duration-700 ease-out"
                      style={{ gridTemplateRows: pgStep >= 5 ? '1fr' : '0fr' }}
                    >
                      <div className="overflow-hidden">
                        <DailyBadgeShelf currentGame="street-date" animateStamp={pgStep >= 5} />
                      </div>
                    </div>

                    <ResultCard
                      game="street-date"
                      score={state.score}
                      streak={0}
                      won={state.won}
                      puzzleLabel={`Street Date ${formatGameNumber(date)} \u00b7 ${formatDisplayDate(date)}`}
                      onViewResults={() => {}}
                      hideViewResults
                      animateEntrance={pgStep >= 1}
                    />
                  </div>

                  {/* Right: game list (vertical stack of 7 games) */}
                  <div className="order-1 lg:order-2" style={entrance('slide-up', pgStep >= 2)}>
                    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white/95 shadow-sm">
                      <div className="px-5 pt-5 pb-3 sm:px-6 sm:pt-6">
                        <p className="font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">
                          Street Date {formatGameNumber(date)} &middot; {formatDisplayDate(date)}
                        </p>
                        <p className="mt-1 font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">
                          The correct order
                        </p>
                      </div>
                      <div className="flex flex-1 flex-col px-5 pb-5 sm:px-6 sm:pb-6">
                        {correctOrder.map((id, i) => {
                          const game = gameById(id)
                          if (!game) return null
                          return (
                            <div key={id} className="flex flex-1 items-center gap-4 border-b border-[hsl(var(--game-ink))]/8 last:border-b-0 px-4 -mx-4">
                              <span className="w-7 shrink-0 font-heading text-[16px] font-[800] text-[hsl(var(--game-ink-light))]">
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <div className="h-[72px] w-[54px] shrink-0 overflow-hidden rounded-lg bg-muted/30 shadow-sm my-2">
                                <img src={igdbCoverUrl(game.igdbImageId)} alt={game.title} className="h-full w-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-heading text-[15px] font-[700] leading-snug text-[hsl(var(--game-ink))] truncate">{game.title}</p>
                                <p className="mt-0.5 font-heading text-[11px] font-[600] text-[hsl(var(--game-ink-light))]">{game.year}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Win modal */}
      {showWinModal && state?.won && modalCopy && (
        <GameEndModal
          game="street-date"
          result="win"
          score={state.score}
          heading={modalCopy.heading}
          subheading={modalCopy.subheading}
          rankName={modalCopy.rankName}
          rankFlavour={modalCopy.rankFlavour}
          stats={[
            { label: 'Score', value: String(state.score) },
            { label: 'Guesses', value: `${state.guesses.length}/${MAX_GUESSES}` },
            { label: 'Correct', value: '7/7' },
          ]}
          heroZone={null}
          shareText={shareText}
          shareUrl="https://idlehours.co.uk/play/street-date-v2"
          onClose={() => { setShowWinModal(false) }}
        />
      )}

      {/* Loss modal */}
      {showLossModal && state?.finished && !state?.won && modalCopy && (
        <GameEndModal
          game="street-date"
          result="loss"
          score={state.score}
          heading={modalCopy.heading}
          subheading={modalCopy.subheading}
          rankName={modalCopy.rankName}
          rankFlavour={modalCopy.rankFlavour}
          stats={[
            { label: 'Score', value: String(state.score) },
            { label: 'Guesses', value: `${state.guesses.length}/${MAX_GUESSES}` },
            { label: 'Best', value: `${Math.max(...state.guesses.map(g => g.correctCount))}/7` },
          ]}
          heroZone={null}
          shareText={shareText}
          shareUrl="https://idlehours.co.uk/play/street-date-v2"
          onClose={() => { setShowLossModal(false) }}
        />
      )}
    </>
  )
}
