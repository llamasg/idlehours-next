'use client'

import type { SkillIssueGame } from '../data/games'

export interface Lifeline {
  key: string
  label: string
  cost: number
  reveal: (game: SkillIssueGame) => string | number | boolean | string[]
  format: (value: any) => string
}

export const LIFELINES: Lifeline[] = [
  {
    key: 'genre',
    label: 'Genre Tags',
    cost: 300,
    reveal: (g) => g.genres,
    format: (v: string[]) => v.join(', '),
  },
  {
    key: 'vibe',
    label: 'Vibe Hint',
    cost: 250,
    reveal: (g) => g.vibe,
    format: (v: string) => `"${v}"`,
  },
  {
    key: 'firstLetter',
    label: 'First Letter',
    cost: 200,
    reveal: (g) => g.title[0],
    format: (v: string) => `Starts with "${v}"`,
  },
  {
    key: 'year',
    label: 'Release Year',
    cost: 150,
    reveal: (g) => g.year,
    format: (v: number) => String(v),
  },
  {
    key: 'openCritic',
    label: 'OpenCritic',
    cost: 150,
    reveal: (g) => g.openCritic ?? 'Not rated',
    format: (v: number | string) => (typeof v === 'number' ? `${v}/100` : String(v)),
  },
  {
    key: 'platforms',
    label: 'Platforms',
    cost: 100,
    reveal: (g) => g.platforms,
    format: (v: string[]) => v.join(', '),
  },
  {
    key: 'pegi',
    label: 'Age Rating',
    cost: 75,
    reveal: (g) => g.pegi,
    format: (v: number) => `PEGI ${v}`,
  },
  {
    key: 'multiplayer',
    label: 'Multiplayer',
    cost: 50,
    reveal: (g) => g.multiplayer,
    format: (v: boolean) => (v ? 'Yes' : 'No'),
  },
]

interface LifelinePanelProps {
  answer: SkillIssueGame
  lifelinesUsed: string[]
  lifelinesRevealed: Record<string, any>
  score: number
  onUseLifeline: (lifeline: Lifeline, value: any) => void
  disabled: boolean
}

export default function LifelinePanel({
  answer,
  lifelinesUsed,
  lifelinesRevealed,
  score,
  onUseLifeline,
  disabled,
}: LifelinePanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Lifelines
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {LIFELINES.map((lifeline) => {
          const used = lifelinesUsed.includes(lifeline.key)
          const canAfford = score >= lifeline.cost
          const isDisabled = disabled || used || !canAfford

          if (used) {
            const revealedValue = lifelinesRevealed[lifeline.key]
            return (
              <button
                key={lifeline.key}
                disabled
                className="rounded-lg border border-border/40 bg-card px-3 py-2 text-left transition-colors"
              >
                <span className="block font-heading text-xs text-muted-foreground">
                  {lifeline.label}
                </span>
                <span className="block text-sm text-primary">
                  {lifeline.format(revealedValue)}
                </span>
              </button>
            )
          }

          if (!canAfford || disabled) {
            return (
              <button
                key={lifeline.key}
                disabled
                className="rounded-lg border border-border/30 bg-muted/30 px-3 py-2 text-left opacity-50 transition-colors"
              >
                <span className="block font-heading text-xs text-muted-foreground">
                  {lifeline.label}
                </span>
                <span className="block text-xs text-muted-foreground">
                  -{lifeline.cost} pts
                </span>
              </button>
            )
          }

          return (
            <button
              key={lifeline.key}
              onClick={() => onUseLifeline(lifeline, lifeline.reveal(answer))}
              disabled={isDisabled}
              className="rounded-lg border border-border/60 bg-card px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <span className="block font-heading text-xs text-muted-foreground">
                {lifeline.label}
              </span>
              <span className="block text-xs text-muted-foreground">
                -{lifeline.cost} pts
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
