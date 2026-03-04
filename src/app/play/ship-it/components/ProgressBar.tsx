'use client'

interface ProgressBarProps {
  decisions: ('accept' | 'pass')[]
  round: number
  offerInRound: number
  showTransition: boolean
}

const MILESTONES = [
  { afterSlot: 2, label: 'Alpha' },
  { afterSlot: 5, label: 'Beta' },
  { afterSlot: 8, label: 'Launch' },
]

export default function ProgressBar({
  decisions,
  round,
  offerInRound,
  showTransition,
}: ProgressBarProps) {
  const totalSeen = decisions.length
  const currentIndex = showTransition ? -1 : totalSeen

  const milestoneComplete = [round > 0, round > 1, round >= 2 && totalSeen >= 9]

  const items: React.ReactNode[] = []

  for (let i = 0; i < 9; i++) {
    // Offer dot
    if (i === currentIndex) {
      items.push(
        <div
          key={`dot-${i}`}
          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary sm:h-7 sm:w-7"
        >
          <div className="h-2.5 w-2.5 rounded-full bg-primary sm:h-3 sm:w-3" />
        </div>,
      )
    } else if (i < totalSeen) {
      const color =
        decisions[i] === 'accept' ? 'bg-emerald-500' : 'bg-red-500'
      items.push(
        <div
          key={`dot-${i}`}
          className={`h-3 w-3 rounded-full sm:h-3.5 sm:w-3.5 ${color}`}
        />,
      )
    } else {
      items.push(
        <div
          key={`dot-${i}`}
          className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25 sm:h-3 sm:w-3"
        />,
      )
    }

    // Milestone after this slot — label is absolute-positioned so it doesn't affect vertical centering
    const mIdx = MILESTONES.findIndex((m) => m.afterSlot === i)
    if (mIdx !== -1) {
      const m = MILESTONES[mIdx]
      const complete = milestoneComplete[mIdx]
      items.push(
        <div key={`ms-${mIdx}`} className="relative">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold sm:h-7 sm:w-7 sm:text-xs ${
              complete
                ? 'bg-emerald-500 text-white'
                : 'bg-muted-foreground/15 text-muted-foreground/50'
            }`}
          >
            {complete ? '✓' : '○'}
          </div>
          {/* Label below — positioned absolutely so it doesn't shift vertical alignment */}
          <span className="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap font-heading text-[8px] uppercase tracking-wider text-muted-foreground sm:text-[9px]">
            {m.label}
          </span>
        </div>,
      )
    }
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-3xl rounded-full border border-border/40 bg-white px-6 py-4 pb-7 shadow-sm dark:bg-card sm:px-10">
      <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5">
        {items}
      </div>
    </div>
  )
}
