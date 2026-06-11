'use client'

import RulesModalShell from '@/components/games/shell/RulesModal'

// Stock Room rules copy — the modal shell (overlay, heading, button) is
// shared. NOTE: new copy, flagged for editorial review. The ports-count line
// is REQUIRED (see lib/criteria.ts header) — players will dispute platform
// answers; the rule must be stated where they can see it.

export default function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <RulesModalShell accent="hsl(var(--game-teal))" onClose={onClose}>
      <p>
        <strong>Stock Room</strong> is a daily grid. Nine cells, each with a
        row and a column condition — stock every shelf with a game that fits
        both. Your shelves, your picks.
      </p>

      <div>
        <p className="mb-2 font-bold text-[hsl(var(--game-ink))]">Stocking the shelves</p>
        <p>
          Tap a cell, type a game, place it. Placements are{' '}
          <strong>free</strong> — move them, swap them, take them back off,
          as much as you like. Each game can only appear <strong>once</strong>{' '}
          across the whole board, so spend your big hitters wisely.
        </p>
      </div>

      <div>
        <p className="mb-2 font-bold text-[hsl(var(--game-ink))]">The check</p>
        <p>
          When all nine shelves are stocked, hit{' '}
          <strong>Check the shelves</strong>. Wrong cells get marked in red —
          rearrange and check again. The run ends when a check comes back
          clean.
        </p>
      </div>

      <div>
        <p className="mb-2 font-bold text-[hsl(var(--game-ink))]">Platforms count ports</p>
        <p>
          &ldquo;Playable on&rdquo; means the game was ever officially
          available on that platform — <strong>ports and remasters
          count</strong>. Skyrim is a Switch game here. Yes, really.
        </p>
      </div>

      <div>
        <p className="mb-1 font-bold text-[hsl(var(--game-ink))]">Scoring</p>
        <p>
          Pass on your <strong>first check</strong> for the full{' '}
          <strong>1,000</strong>. Every extra check costs 250, but any board
          you finish is worth at least 250. Giving up is the only Bust.
        </p>
      </div>

      <div>
        <p className="mb-1 font-bold text-[hsl(var(--game-ink))]">Rarity</p>
        <p>
          Your answers also earn a <strong>rarity</strong> score — the
          deeper the cuts, the higher it climbs. Score measures whether you
          filled the board; rarity measures how much style you did it with.
        </p>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Resets daily at midnight GMT. Check back each day for a new grid!
      </p>
    </RulesModalShell>
  )
}
