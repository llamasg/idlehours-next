'use client'

import { useState, useEffect, useRef } from 'react'
import { GAMES } from '../data/games'

const TOTAL = GAMES.length
const DURATION = 3500 // fixed 3.5s for every reveal

interface ProximityCounterProps {
  gameTitle: string
  targetRank: number
  onComplete: () => void
}

/**
 * Pointless-style animated countdown. Always takes 3.5s.
 *
 * Easing adapts to the range:
 * - Large range (900 numbers): power-6 ease-out, zooms through bulk,
 *   crawls through last ~20, near-frozen for last 3
 * - Small range (30 numbers): power-2, much more linear feel
 *
 * The last few numbers always get dramatic pauses via stepped ticks.
 */
export default function ProximityCounter({
  gameTitle,
  targetRank,
  onComplete,
}: ProximityCounterProps) {
  const [displayValue, setDisplayValue] = useState(TOTAL)
  const [phase, setPhase] = useState<'counting' | 'stepped' | 'landed' | 'correct'>('counting')
  const cancelledRef = useRef(false)

  // Stable ref for onComplete — prevents animation restart when parent re-renders
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    cancelledRef.current = false
    let raf = 0

    const isCorrect = targetRank === 1
    const range = TOTAL - targetRank

    // How many numbers to handle in the stepped (tick-by-tick) final phase
    const steppedCount = isCorrect ? 10 : Math.min(8, Math.max(3, Math.round(range * 0.03)))
    const steppedTarget = targetRank + steppedCount
    const rafRange = TOTAL - steppedTarget

    // RAF phase gets ~65% of total time, stepped phase gets ~35%
    const rafDuration = DURATION * 0.65
    const steppedBudget = DURATION * 0.35

    // Easing power adapts: more numbers = more aggressive curve
    // Small range (< 50): power ~2 (nearly linear)
    // Large range (> 500): power ~6 (extreme end-weight)
    const power = Math.max(2, Math.min(6, 1.5 + (range / 150)))

    const startTime = Date.now()

    function rafPhase() {
      if (cancelledRef.current) return
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / rafDuration)

      // Adaptive ease-out
      const eased = 1 - Math.pow(1 - progress, power)
      const current = Math.round(TOTAL - eased * rafRange)
      setDisplayValue(Math.max(current, steppedTarget))

      if (progress < 1) {
        raf = requestAnimationFrame(rafPhase)
      } else {
        setDisplayValue(steppedTarget)
        setPhase('stepped')
        steppedPhase()
      }
    }

    async function steppedPhase() {
      // Distribute steppedBudget across steppedCount ticks
      // Weight: later ticks (closer to target) get exponentially more time
      const weights: number[] = []
      for (let i = 0; i < steppedCount; i++) {
        // i=0 is furthest from target, i=steppedCount-1 is last tick
        const w = Math.pow(1.8, i)
        weights.push(w)
      }
      const totalWeight = weights.reduce((a, b) => a + b, 0)

      for (let i = 0; i < steppedCount; i++) {
        if (cancelledRef.current) return
        const delay = (weights[i] / totalWeight) * steppedBudget
        await new Promise((r) => setTimeout(r, delay))
        if (cancelledRef.current) return
        setDisplayValue(steppedTarget - 1 - i)
      }

      if (cancelledRef.current) return

      if (isCorrect) {
        setPhase('correct')
        setTimeout(() => {
          if (!cancelledRef.current) onCompleteRef.current()
        }, 1500)
      } else {
        setPhase('landed')
        setTimeout(() => {
          if (!cancelledRef.current) onCompleteRef.current()
        }, 800)
      }
    }

    // Edge case: range is tiny, skip RAF phase
    if (rafRange <= 0) {
      setPhase('stepped')
      steppedPhase()
    } else {
      raf = requestAnimationFrame(rafPhase)
    }

    return () => {
      cancelledRef.current = true
      cancelAnimationFrame(raf)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRank])

  // Color + shadow color based on current display value
  function getColor(val: number): string {
    if (val <= 1) return 'hsl(147 61% 41%)'
    if (val <= 50) return 'hsl(147 61% 41%)'
    if (val <= 200) return 'hsl(var(--game-amber))'
    if (val <= 500) return 'hsl(30 55% 50%)'
    return 'hsl(var(--game-red))'
  }

  function getShadowColor(val: number): string {
    if (val <= 1) return 'hsl(147 61% 30%)'
    if (val <= 50) return 'hsl(147 61% 30%)'
    if (val <= 200) return 'hsl(40 55% 35%)'
    if (val <= 500) return 'hsl(20 55% 35%)'
    return 'hsl(7 62% 35%)'
  }

  // Bar fill: 0% at TOTAL, 100% at 1
  const fillPct = Math.max(0, Math.min(100, ((TOTAL - displayValue) / (TOTAL - 1)) * 100))
  const color = getColor(displayValue)
  const shadow = getShadowColor(displayValue)

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Game title */}
      <p className="mb-3 text-center text-sm font-bold text-[hsl(var(--game-ink))]">
        {gameTitle}
      </p>

      {/* Counter bar — bevel meter style */}
      <div
        className="relative overflow-hidden rounded-full border-[3px]"
        style={{
          borderColor: shadow,
          height: '64px',
          boxShadow: `0 6px 0 ${shadow}, 0 8px 20px rgba(0,0,0,0.15)`,
          background: 'hsl(var(--game-cream))',
        }}
      >
        {/* Fill bar — driven directly by displayValue, no CSS transition */}
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${fillPct}%`,
            background: color,
            opacity: 0.2,
          }}
        />

        {/* Number */}
        <div className="relative flex h-full items-center justify-center">
          <span
            className="font-heading text-4xl font-black tabular-nums"
            style={{ color }}
          >
            {displayValue}
          </span>
        </div>
      </div>

      {/* Status text */}
      <div className="mt-4 text-center" style={{ minHeight: '28px' }}>
        {(phase === 'counting' || phase === 'stepped') && (
          <p className="text-xs font-semibold text-muted-foreground">
            &nbsp;
          </p>
        )}
        {phase === 'landed' && (
          <p className="text-xs font-bold" style={{ color }}>
            {targetRank <= 50 ? 'Very close!' : targetRank <= 200 ? 'Getting warm' : targetRank <= 500 ? 'In the right area' : 'Keep trying'}
          </p>
        )}
        {phase === 'correct' && (
          <p
            className="text-lg font-black uppercase text-[hsl(var(--game-green))]"
            style={{ animation: 'sentence-in 0.5s cubic-bezier(0.22,1.2,0.36,1) both' }}
          >
            You got it!
          </p>
        )}
      </div>
    </div>
  )
}
