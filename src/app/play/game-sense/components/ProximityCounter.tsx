'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { GAMES } from '../data/games'

const TOTAL = GAMES.length

interface ProximityCounterProps {
  gameTitle: string
  targetRank: number
  onComplete: () => void
}

/**
 * Pointless-style animated countdown.
 * Starts at TOTAL and counts down to targetRank with easing —
 * fast at the top, slowing dramatically as it approaches the target.
 */
export default function ProximityCounter({
  gameTitle,
  targetRank,
  onComplete,
}: ProximityCounterProps) {
  const [displayValue, setDisplayValue] = useState(TOTAL)
  const [phase, setPhase] = useState<'counting' | 'landed' | 'correct'>('counting')
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef(0)

  // Duration scales: correct answer (rank 1) gets a longer, more dramatic countdown
  const isCorrect = targetRank === 1
  const duration = isCorrect ? 4500 : Math.min(3000, 800 + (TOTAL - targetRank) * 2.5)

  const animate = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current
    const progress = Math.min(1, elapsed / duration)

    // Ease-out cubic for smooth deceleration
    const eased = 1 - Math.pow(1 - progress, 3)

    const current = Math.round(TOTAL - eased * (TOTAL - targetRank))
    setDisplayValue(current)

    if (progress < 1) {
      rafRef.current = requestAnimationFrame(animate)
    } else {
      setDisplayValue(targetRank)
      if (isCorrect) {
        setPhase('correct')
        setTimeout(onComplete, 1500)
      } else {
        setPhase('landed')
        setTimeout(onComplete, 800)
      }
    }
  }, [targetRank, duration, isCorrect, onComplete])

  useEffect(() => {
    startTimeRef.current = Date.now()
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [animate])

  // Color transitions as the number drops
  function getColor(val: number): string {
    if (val <= 1) return 'hsl(var(--game-green))'
    if (val <= 50) return 'hsl(147 61% 41%)'
    if (val <= 200) return 'hsl(var(--game-amber))'
    if (val <= 500) return 'hsl(30 55% 50%)'
    return 'hsl(var(--game-red))'
  }

  function getBgColor(val: number): string {
    if (val <= 1) return 'hsl(147 61% 41% / 0.1)'
    if (val <= 50) return 'hsl(147 61% 41% / 0.08)'
    if (val <= 200) return 'hsl(30 55% 50% / 0.08)'
    if (val <= 500) return 'hsl(30 55% 50% / 0.06)'
    return 'hsl(7 62% 47% / 0.06)'
  }

  // Bar fill percentage (inverted — lower rank = more fill)
  const fillPct = Math.max(0, Math.min(100, 100 - ((displayValue / TOTAL) * 100)))

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Game title */}
      <p className="mb-3 text-center text-sm font-bold text-[hsl(var(--game-ink))]">
        {gameTitle}
      </p>

      {/* Counter bar */}
      <div
        className="relative overflow-hidden rounded-xl border-2 transition-colors duration-300"
        style={{
          borderColor: getColor(displayValue),
          background: getBgColor(displayValue),
          height: '64px',
        }}
      >
        {/* Fill bar */}
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-75"
          style={{
            width: `${fillPct}%`,
            background: getColor(displayValue),
            opacity: 0.15,
          }}
        />

        {/* Number */}
        <div className="relative flex h-full items-center justify-center">
          <span
            className="font-heading text-4xl font-black tabular-nums transition-colors duration-150"
            style={{ color: getColor(displayValue) }}
          >
            {phase === 'correct' ? '1' : displayValue}
          </span>
        </div>
      </div>

      {/* Status text */}
      <div className="mt-2 text-center">
        {phase === 'counting' && (
          <p className="text-xs font-semibold text-muted-foreground animate-pulse">
            Calculating proximity...
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
