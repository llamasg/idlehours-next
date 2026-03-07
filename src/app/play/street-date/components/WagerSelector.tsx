'use client'

import type { Wager } from '../lib/storage'

interface WagerSelectorProps {
  selected: Wager
  locked: boolean
  onSelect: (wager: Wager) => void
}

const WAGERS: { key: Wager; emoji: string; name: string; desc: string; mult: string }[] = [
  { key: 'low', emoji: '🛡️', name: 'Cautious', desc: 'Play it safe', mult: 'x0.5' },
  { key: 'mid', emoji: '🎯', name: 'Confident', desc: 'Standard bet', mult: 'x1' },
  { key: 'high', emoji: '🔥', name: 'All In', desc: 'Double or nothing', mult: 'x2' },
]

export default function WagerSelector({ selected, locked, onSelect }: WagerSelectorProps) {
  return (
    <div className="mx-auto max-w-md">
      <div className="grid grid-cols-3 gap-3">
        {WAGERS.map((w) => {
          const isSelected = selected === w.key
          const dimmed = locked && !isSelected

          return (
            <button
              key={w.key}
              onClick={() => !locked && onSelect(w.key)}
              disabled={locked && !isSelected}
              className={`
                relative flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 transition-all
                ${isSelected
                  ? 'border-[hsl(var(--game-amber))] bg-[hsl(var(--game-amber))]/5'
                  : 'border-border/60 bg-white hover:border-[hsl(var(--game-amber))]/40'
                }
                ${dimmed ? 'opacity-40' : ''}
                ${locked ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              {/* Check badge when locked and selected */}
              {locked && isSelected && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--game-amber))] text-white text-[10px]">
                  ✓
                </span>
              )}

              <span className="text-2xl">{w.emoji}</span>
              <span className="font-heading text-sm font-bold text-[hsl(var(--game-ink))]">
                {w.name}
              </span>
              <span className="text-[10px] text-muted-foreground">{w.desc}</span>
              <span className={`font-heading text-xs font-bold ${
                isSelected ? 'text-[hsl(var(--game-amber))]' : 'text-muted-foreground'
              }`}>
                {w.mult}
              </span>
            </button>
          )
        })}
      </div>
      {!locked && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Choose your confidence level before guessing. Locks after first guess.
        </p>
      )}
    </div>
  )
}
