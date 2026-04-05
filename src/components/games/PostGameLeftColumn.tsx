'use client'

import type { GameSlug } from '@/lib/ranks'
import DailyBadgeShelf from './DailyBadgeShelf'
import ResultCard from './ResultCard'

interface PostGameLeftColumnProps {
  game: GameSlug
  score: number
  /** Passed to ResultCard as `streak`. 0 for Game Sense/Street Date, correctCount for Shelf Price. */
  secondaryStat: number
  won: boolean
  puzzleLabel: string
  /** Current post-game entrance step (from useEntranceSteps) */
  pgStep: number
  /** Override wrapper classes (default: grid order for two-column grid layout) */
  className?: string
}

export default function PostGameLeftColumn({
  game,
  score,
  secondaryStat,
  won,
  puzzleLabel,
  pgStep,
  className = 'order-2 flex flex-col gap-6 lg:order-1',
}: PostGameLeftColumnProps) {
  return (
    <div className={className}>
      <div
        className="grid transition-[grid-template-rows] duration-700 ease-out"
        style={{ gridTemplateRows: pgStep >= 5 ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <DailyBadgeShelf currentGame={game} animateStamp={pgStep >= 5} />
        </div>
      </div>

      <ResultCard
        game={game}
        score={score}
        streak={secondaryStat}
        won={won}
        puzzleLabel={puzzleLabel}
        onViewResults={() => {}}
        hideViewResults
        animateEntrance={pgStep >= 1}
      />
    </div>
  )
}
