'use client'

interface ProgressBarProps {
  current: number
  total: number
  /** Per-round results: true = correct, false = wrong */
  results: boolean[]
}

export default function ProgressBar({ current, total, results }: ProgressBarProps) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="flex items-center gap-1.5 sm:gap-2">
        {Array.from({ length: total }, (_, i) => {
          const done = i < current
          const isCurrent = i === current

          let color: string
          if (done) {
            color = results[i]
              ? 'bg-[hsl(var(--game-green))]'
              : 'bg-[hsl(var(--game-red))]'
          } else if (isCurrent) {
            color = 'animate-[pip-pulse_1.5s_ease-in-out_infinite] bg-[hsl(var(--game-blue))]/40'
          } else {
            color = 'bg-[hsl(var(--game-ink))]/10'
          }

          return (
            <div
              key={i}
              className={`h-2.5 flex-1 rounded-full transition-all ${color}`}
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
