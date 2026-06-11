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
        row and a column condition — name <strong>any game</strong> that fits
        both. Your shelves, your picks.
      </p>

      <div>
        <p className="mb-2 font-bold text-[hsl(var(--game-ink))]">Filling the grid</p>
        <p>
          Tap a cell, type a game, submit. A right answer locks the cell. A
          wrong one costs <strong>50 pts</strong> and the cell stays open —
          guess again. Each game can only be used <strong>once</strong>{' '}
          across the whole board.
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
          <strong>111 pts</strong> per filled cell, +1 for the full board
          (a clean sweep is exactly 1,000). Misses cost 50. You can{' '}
          <strong>finish early</strong> any time and bank what you&apos;ve
          filled.
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
