'use client'

import AnimatedScore from '@/components/AnimatedScore'

// The in-game score pill + red pulse + floating "-N" cost badge, forked
// near-identically across the three daily games. Two sizes: 'md' is the
// game-sense/shelf-price pill, 'lg' is street-date's larger arcade variant.

export interface FloatingCost {
  key: string | number
  cost: number
}

export default function ScorePill({
  score,
  pulse,
  floatingCost,
  size = 'md',
  accentClassName,
  unitClassName,
  baseBorderColor = 'rgba(255,255,255,0.3)',
  className = '',
}: {
  score: number
  pulse: boolean
  floatingCost: FloatingCost | null
  size?: 'md' | 'lg'
  /** Score text colour class when not pulsing, e.g. 'text-[hsl(var(--game-blue))]' */
  accentClassName: string
  /** Unit ("pts") colour class when not pulsing, e.g. 'text-[hsl(var(--game-blue))]/60' */
  unitClassName: string
  baseBorderColor?: string
  className?: string
}) {
  const floating = floatingCost && (
    <span
      key={floatingCost.key}
      className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(var(--game-red))] px-4 py-1 font-heading text-lg font-black text-white shadow-lg"
      style={{ animation: 'float-up 1.2s ease-out forwards' }}
    >
      -{floatingCost.cost}
    </span>
  )

  if (size === 'lg') {
    return (
      <div className={`relative inline-block ${className}`}>
        <div
          className="relative inline-flex items-baseline gap-1 rounded-2xl border-2 bg-white px-8 py-3 transition-all duration-300"
          style={{
            borderColor: pulse ? 'hsl(var(--game-red))' : baseBorderColor,
            transform: pulse ? 'scale(1.08)' : 'scale(1)',
          }}
        >
          <AnimatedScore
            value={score}
            className={`font-heading text-4xl font-black tracking-tight transition-colors duration-300 ${pulse ? 'text-[hsl(var(--game-red))]' : accentClassName}`}
          />
          <span className={`font-heading text-sm font-[800] uppercase tracking-wider transition-colors duration-300 ${pulse ? 'text-[hsl(var(--game-red))]/60' : unitClassName}`}>
            pts
          </span>
        </div>
        {floating}
      </div>
    )
  }

  return (
    <div
      className={`relative inline-flex items-center gap-2 rounded-full border-2 bg-white px-5 py-2 transition-all duration-300 ${className}`}
      style={{
        borderColor: pulse ? 'hsl(var(--game-red))' : baseBorderColor,
        transform: pulse ? 'scale(1.1)' : 'scale(1)',
      }}
    >
      <AnimatedScore
        value={score}
        className={`font-heading text-2xl font-black transition-colors duration-300 ${pulse ? 'text-[hsl(var(--game-red))]' : accentClassName}`}
      />
      <span className={`font-heading text-xs uppercase tracking-wider transition-colors duration-300 ${pulse ? 'text-[hsl(var(--game-red))]/60' : unitClassName}`}>
        pts
      </span>
      {floating}
    </div>
  )
}
