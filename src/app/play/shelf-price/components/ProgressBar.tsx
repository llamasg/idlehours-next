'use client'

interface ProgressBarProps {
  current: number
  total: number
  correctCount: number
}

export default function ProgressBar({ current, total, correctCount }: ProgressBarProps) {
  return (
    <div className="mx-auto w-full max-w-md">
      {/* Pips — all same height, no text mixed in */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {Array.from({ length: total }, (_, i) => {
          const done = i < current
          const isCurrent = i === current
          const wasCorrect = i < current && i < correctCount + (current - correctCount)
          // Determine if this specific round was correct
          // correctCount tells us total correct, but not which rounds
          // For visual: done pips are amber (correct) or red (wrong)
          return (
            <div
              key={i}
              className={`h-2.5 flex-1 rounded-full transition-all ${
                done
                  ? 'bg-[hsl(var(--game-blue))]'
                  : isCurrent
                  ? 'animate-[pip-pulse_1.5s_ease-in-out_infinite] bg-[hsl(var(--game-blue))]/40'
                  : 'bg-[hsl(var(--game-ink))]/10'
              }`}
            />
          )
        })}
      </div>
      <p className="mt-2 text-center font-heading text-xs text-muted-foreground">
        {current}/{total}
      </p>
    </div>
  )
}
