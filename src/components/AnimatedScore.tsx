'use client'

import { useState, useEffect, useRef } from 'react'

interface AnimatedScoreProps {
  value: number
  className?: string
  /** Duration of the tick animation in ms (default 600) */
  duration?: number
}

/**
 * Animated score display that ticks between values.
 * When the value drops, the number counts down smoothly
 * and briefly flashes red.
 */
export default function AnimatedScore({
  value,
  className = '',
  duration = 600,
}: AnimatedScoreProps) {
  const [display, setDisplay] = useState(value)
  const [isFlashing, setIsFlashing] = useState(false)
  const prevRef = useRef(value)
  const rafRef = useRef(0)

  useEffect(() => {
    const prev = prevRef.current
    prevRef.current = value

    if (prev === value) return

    // Flash red when score drops
    if (value < prev) {
      setIsFlashing(true)
    }

    const start = Date.now()
    const diff = value - prev

    function tick() {
      const elapsed = Date.now() - start
      const progress = Math.min(1, elapsed / duration)
      // Ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress)
      setDisplay(Math.round(prev + diff * eased))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay(value)
        // Clear flash after animation + brief hold
        setTimeout(() => setIsFlashing(false), 200)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  return (
    <span
      className={`tabular-nums transition-colors duration-200 ${className}`}
      style={{
        color: isFlashing ? 'hsl(var(--game-red))' : undefined,
      }}
    >
      {display}
    </span>
  )
}
