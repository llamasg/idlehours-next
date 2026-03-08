'use client'

import { type Milestones } from '../lib/milestones'

interface ProgressBarProps {
  score: number
  poolSize: number
  milestones: Milestones
}

export default function ProgressBar({ score, poolSize, milestones }: ProgressBarProps) {
  const pct = Math.min(100, (score / poolSize) * 100)

  const dots = [
    { key: 'bronze', pos: (milestones.bronze / poolSize) * 100, reached: score >= milestones.bronze },
    { key: 'silver', pos: (milestones.silver / poolSize) * 100, reached: score >= milestones.silver },
    { key: 'gold', pos: (milestones.gold / poolSize) * 100, reached: score >= milestones.gold },
  ]

  return (
    <div className="relative mx-4 h-[3px] rounded-full bg-border/30">
      {/* Fill */}
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-[hsl(var(--game-amber))] transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
      {/* Milestone dots */}
      {dots.map((dot) => (
        <div
          key={dot.key}
          className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors duration-300 ${
            dot.reached
              ? 'border-[hsl(var(--game-amber))] bg-[hsl(var(--game-amber))]'
              : 'border-border/60 bg-background'
          }`}
          style={{ left: `${dot.pos}%` }}
        />
      ))}
    </div>
  )
}
