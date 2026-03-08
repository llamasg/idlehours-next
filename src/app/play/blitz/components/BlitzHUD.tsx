'use client'

interface BlitzHUDProps {
  topicName: string
  timeRemaining: number
  timeLimit: number
  score: number
}

export default function BlitzHUD({ topicName, timeRemaining, timeLimit, score }: BlitzHUDProps) {
  const pct = Math.max(0, timeRemaining / timeLimit)
  const isUrgent = timeRemaining <= 15

  // SVG ring
  const size = 64
  const stroke = 4
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dashoffset = circumference * (1 - pct)

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* Left — label + topic */}
      <div className="min-w-0 flex-1">
        <div className="font-heading text-sm font-black tracking-wide text-[hsl(var(--game-amber))]">
          ⚡ BLITZ
        </div>
        <div className="truncate font-heading text-xs font-bold text-[hsl(var(--game-ink))]">
          {topicName}
        </div>
      </div>

      {/* Centre — countdown ring */}
      <div className="relative flex flex-shrink-0 items-center justify-center">
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-border/30"
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            className={`transition-all duration-1000 linear ${
              isUrgent ? 'text-[hsl(var(--game-red))]' : 'text-[hsl(var(--game-amber))]'
            }`}
            stroke="currentColor"
          />
        </svg>
        <span
          className={`absolute font-heading text-sm font-bold ${
            isUrgent ? 'text-[hsl(var(--game-red))]' : 'text-[hsl(var(--game-ink))]'
          }`}
        >
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Right — score */}
      <div className="flex flex-1 flex-col items-end">
        <div className="font-heading text-3xl font-black text-[hsl(var(--game-ink))]">{score}</div>
        <div className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          correct
        </div>
      </div>
    </div>
  )
}
