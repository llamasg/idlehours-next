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

    // When submitting, lock in revealed slots based on results
    const newRevealed = { ...state.revealedSlots }
    results.forEach((r, i) => {
      newRevealed[i] = r
    })

    const updatedState: V2DayState = {
      ...state,
      guesses: [...state.guesses, guess],
      score: newScore,
      won,
      finished,
      revealedSlots: finished ? newRevealed : state.revealedSlots,
    }

    // If lost, show correct order in slots
    if (finished && !won) {
      updatedState.slots = [...correctOrder]
      updatedState.pool = []
    }

    persist(updatedState)
    setSelectedChip(null)
    setJustSubmitted(true)
    setTimeout(() => setJustSubmitted(false), 1500)

    if (guessNum > 1) {
      triggerScorePulse(150)
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
          <main className="font-game mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-8 pt-4 sm:py-8">
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
                className="mt-6 flex flex-col gap-5"
                style={
                  entranceStep < 2
                    ? { opacity: 0, transform: 'scale(0)' }
                    : entranceStep < 6
                      ? { animation: `gs-box-in 0.7s ${spring} both` }
                      : undefined
                }
              >
                {/* Hint buttons */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={hintOnePending ? () => setHintOnePending(false) : handleHintOne}
                    disabled={state.hintOneUsed && !hintOnePending}
                    className={`rounded-full border-2 px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                      hintOnePending
                        ? 'border-amber-400 bg-amber-400 text-black'
                        : state.hintOneUsed
                          ? 'cursor-not-allowed border-white/10 text-white/30'
                          : 'border-white/40 text-white hover:border-white hover:bg-white/10'
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
                        : 'border-white/40 text-white hover:border-white hover:bg-white/10'
                    }`}
                  >
                    Reveal all slots −{HINT_ALL_COST}pts
                  </button>
                </div>

                {/* ── Slot grid ── */}
                <div className="flex justify-center">
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 sm:gap-3">
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
                            ? 'border-white/60'
                            : 'border-dashed border-white/30'

                      return (
                        <div
                          key={i}
                          onClick={() => handleSlotTap(i)}
                          onDrop={(e) => handleSlotDrop(e, i)}
                          onDragOver={handleDragOver}
                          className={`relative flex h-[110px] w-[76px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 transition-all duration-200 sm:h-[130px] sm:w-[90px] ${slotBorderColor} ${
                            hintOnePending && chipId ? 'animate-pulse ring-2 ring-amber-400/50' : ''
                          } ${isSelected ? 'ring-2 ring-blue-400/50 shadow-lg shadow-blue-400/20' : ''}`}
                          style={{
                            background: chipId ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                          }}
                        >
                          {/* Slot number */}
                          <span className="absolute left-1.5 top-1 text-[10px] font-bold text-white/40">
                            {String(i + 1).padStart(2, '0')}
                          </span>

                          {game ? (
                            <div
                              draggable
                              onDragStart={(e) => handleDragStart(e, chipId!)}
                              className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing"
                            >
                              <img
                                src={igdbCoverUrl(game.igdbImageId)}
                                alt={game.title}
                                className="h-[56px] w-[42px] rounded-md object-cover shadow-md sm:h-[64px] sm:w-[48px]"
                                loading="lazy"
                              />
                              <span className="max-w-[68px] truncate text-center text-[9px] font-bold leading-tight text-white sm:max-w-[80px] sm:text-[10px]">
                                {game.title}
                              </span>
                              {state.revealedYearIds.includes(chipId!) && (
                                <span className="text-[10px] font-bold text-green-400">
                                  {game.year}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-lg text-white/20">+</span>
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

                {/* ── Guess history ── */}
                {state.guesses.length > 0 && (
                  <div className="space-y-1.5">
                    {state.guesses.map((guess, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm"
                        style={justSubmitted && i === state.guesses.length - 1
                          ? { animation: `gs-fade-in 0.4s ${spring} both` }
                          : undefined
                        }
                      >
                        <span className="text-white/60">
                          Guess {i + 1} — <span className="font-bold text-white">{guess.correctCount}/7</span> correct
                        </span>
                        <span className="font-heading text-xs font-bold text-white/40">
                          {guess.results.map(emojiForResult).join('')}
                        </span>
                      </div>
                    ))}
                    {lastGuess && !state.finished && (
                      <p className="text-center text-sm font-bold text-white/70">
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
                    className="rounded-full border-2 border-white/30 px-6 py-2 text-sm font-bold text-white/70 transition-all hover:border-white/50 hover:text-white"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!allSlotsFilled}
                    className={`rounded-full px-6 py-2 text-sm font-bold transition-all ${
                      allSlotsFilled
                        ? 'bg-white text-[hsl(var(--game-ink))] shadow-lg hover:bg-white/90'
                        : 'cursor-not-allowed bg-white/20 text-white/40'
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
                  className="rounded-2xl bg-white/10 p-3 sm:p-4"
                  data-pool-bg="true"
                >
                  <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-white/40" data-pool-bg="true">
                    {state.pool.length > 0 ? 'Available games' : 'All games placed'}
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
                          className={`flex cursor-grab items-center gap-2 rounded-xl border-2 bg-white/10 px-2 py-1.5 transition-all duration-200 active:cursor-grabbing ${
                            isSelected
                              ? 'border-blue-400 shadow-lg shadow-blue-400/20 -translate-y-1'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                          style={
                            entranceStep >= 3 && entranceStep < 6
                              ? { animation: `gs-fade-in 0.3s ${spring} ${i * 60}ms both` }
                              : undefined
                          }
                        >
                          <img
                            src={igdbCoverUrl(game.igdbImageId)}
                            alt={game.title}
                            className="h-[48px] w-[36px] rounded-md object-cover shadow-sm sm:h-[56px] sm:w-[42px]"
                            loading="lazy"
                          />
                          <div className="flex flex-col">
                            <span className="max-w-[100px] truncate text-[11px] font-bold leading-tight text-white sm:max-w-[120px] sm:text-xs">
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
            )}

            {/* ── Finished state ── */}
            {state.finished && (
              <div className="mt-8 flex flex-col items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl">
                    {state.won ? '🎉' : '😞'}
                  </div>
                  <h2 className="mt-2 text-2xl font-black text-white">
                    {state.won ? 'You got it!' : 'Game over'}
                  </h2>
                  <p className="mt-1 text-lg font-bold text-white/70">
                    {state.won
                      ? `Solved in ${state.guesses.length} ${state.guesses.length === 1 ? 'guess' : 'guesses'}`
                      : 'Better luck next time'}
                  </p>
                </div>

                {/* Final score */}
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3">
                  <span className="font-heading text-3xl font-black text-[hsl(var(--game-ink))]">
                    {state.score}
                  </span>
                  <span className="font-heading text-sm uppercase tracking-wider text-[hsl(var(--game-ink))]/60">
                    pts
                  </span>
                </div>

                {/* Emoji grid */}
                {emojiGrid && (
                  <div className="rounded-xl bg-white/10 px-6 py-4">
                    <pre className="text-center font-mono text-lg leading-relaxed">
                      {emojiGrid}
                    </pre>
                  </div>
                )}

                {/* Correct order */}
                <div className="w-full max-w-lg">
                  <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-white/40">
                    Correct order
                  </p>
                  <div className="flex justify-center">
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 sm:gap-3">
                      {correctOrder.map((id, i) => {
                        const game = gameById(id)
                        if (!game) return null
                        return (
                          <div
                            key={id}
                            className="flex h-[110px] w-[76px] flex-col items-center justify-center rounded-xl border-2 border-green-400/50 bg-white/5 sm:h-[130px] sm:w-[90px]"
                          >
                            <span className="absolute-left-1.5 text-[10px] font-bold text-white/40">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <img
                              src={igdbCoverUrl(game.igdbImageId)}
                              alt={game.title}
                              className="h-[56px] w-[42px] rounded-md object-cover shadow-md sm:h-[64px] sm:w-[48px]"
                              loading="lazy"
                            />
                            <span className="mt-1 max-w-[68px] truncate text-center text-[9px] font-bold leading-tight text-white sm:max-w-[80px] sm:text-[10px]">
                              {game.title}
                            </span>
                            <span className="text-[10px] font-bold text-green-400">
                              {game.year}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}
