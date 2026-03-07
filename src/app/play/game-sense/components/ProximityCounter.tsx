'use client'

import { useState, useEffect, useRef } from 'react'
import { GAMES } from '../data/games'

const TOTAL = GAMES.length

interface ProximityCounterProps {
  gameTitle: string
  targetRank: number
  onComplete: () => void
}

/**
 * Pointless-style animated countdown.
 * Two phases:
 *  1. Fast sweep from TOTAL down to ~targetRank+10 using RAF
 *  2. Stepped ticks for the final stretch with increasing delays
 */
export default function ProximityCounter({
  gameTitle,
  targetRank,
  onComplete,
}: ProximityCounterProps) {
  const [displayValue, setDisplayValue] = useState(TOTAL)
  const [phase, setPhase] = useState<'counting' | 'landed' | 'correct'>('counting')
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    let raf = 0

    const isCorrect = targetRank === 1
    // Where the slow phase kicks in
    const slowThreshold = Math.min(targetRank + 12, TOTAL)
    // Fast phase goes from TOTAL down to slowThreshold
    const fastRange = TOTAL - slowThreshold
    const fastDuration = Math.min(2000, 400 + fastRange * 1.5)

    const startTime = Date.now()

    function fastPhase() {
      if (cancelledRef.current) return
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / fastDuration)

      // Aggressive ease-out: power of 5 for extreme deceleration
      const eased = 1 - Math.pow(1 - progress, 5)
      const current = Math.round(TOTAL - eased * fastRange)
      setDisplayValue(current)

      if (progress < 1) {
        raf = requestAnimationFrame(fastPhase)
      } else {
        setDisplayValue(slowThreshold)
        slowPhase(slowThreshold)
      }
    }

    async function slowPhase(from: number) {
      // Step through each number from `from` down to targetRank
      for (let n = from - 1; n >= targetRank; n--) {
        if (cancelledRef.current) return

        // Delay increases as we get closer to target
        const remaining = n - targetRank
        let delay: number
        if (remaining <= 2) {
          delay = isCorrect ? 600 : 350
        } else if (remaining <= 5) {
          delay = isCorrect ? 400 : 200
        } else if (remaining <= 10) {
          delay = isCorrect ? 200 : 120
        } else {
          delay = 60
        }

        await new Promise((r) => setTimeout(r, delay))
        if (cancelledRef.current) return
        setDisplayValue(n)
      }

      if (cancelledRef.current) return

      if (isCorrect) {
        setPhase('correct')
        setTimeout(() => {
          if (!cancelledRef.current) onComplete()
        }, 1500)
      } else {
        setPhase('landed')
        setTimeout(() => {
          if (!cancelledRef.current) onComplete()
        }, 800)
      }
    }

    // Kick off
    if (fastRange <= 0) {
      // Target is very close to TOTAL, skip fast phase
      slowPhase(TOTAL)
    } else {
      raf = requestAnimationFrame(fastPhase)
    }

    return () => {
      cancelledRef.current = true
      cancelAnimationFrame(raf)
    }
  }, [targetRank, onComplete])

  // Color based on current display value
  function getColor(val: number): string {
    if (val <= 1) return 'hsl(var(--game-green))'
    if (val <= 50) return 'hsl(147 61% 41%)'
    if (val <= 200) return 'hsl(var(--game-amber))'
    if (val <= 500) return 'hsl(30 55% 50%)'
    return 'hsl(var(--game-red))'
  }

  // Bar fill: 0% at TOTAL, 100% at 1
  const fillPct = Math.max(0, Math.min(100, ((TOTAL - displayValue) / (TOTAL - 1)) * 100))

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Game title */}
      <p className="mb-3 text-center text-sm font-bold text-[hsl(var(--game-ink))]">
        {gameTitle}
      </p>

      {/* Counter bar */}
      <div
        className="relative overflow-hidden rounded-xl border-2"
        style={{
          borderColor: getColor(displayValue),
          height: '64px',
        }}
      >
        {/* Fill bar — no CSS transition, driven directly by displayValue */}
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: `${fillPct}%`,
            background: getColor(displayValue),
            opacity: 0.18,
          }}
        />

        {/* Number */}
        <div className="relative flex h-full items-center justify-center">
          <span
            className="font-heading text-4xl font-black tabular-nums"
            style={{ color: getColor(displayValue) }}
          >
            {displayValue}
          </span>
        </div>
      </div>

      {/* Status text */}
      <div className="mt-2 text-center" style={{ minHeight: '28px' }}>
        {phase === 'counting' && displayValue > targetRank + 12 && (
          <p className="text-xs font-semibold text-muted-foreground">
            &nbsp;
          </p>
        )}
        {phase === 'counting' && displayValue <= targetRank + 12 && (
          <p className="text-xs font-semibold text-muted-foreground animate-pulse">
            &nbsp;
          </p>
        )}
        {phase === 'landed' && (
          <p className="text-xs font-bold" style={{ color: getColor(targetRank) }}>
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
