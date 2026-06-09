'use client'

import RulesModalShell from '@/components/games/shell/RulesModal'

// Street Date rules copy — the modal shell (overlay, heading, button) is shared.
// NOTE: Street Date previously had no rules UI; this copy is new — flagged for
// editorial review.

export default function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <RulesModalShell accent="hsl(var(--game-green))" onClose={onClose}>
      <p>
        <strong>Street Date</strong> is a daily game where you arrange seven
        games in release order, oldest to newest. You start with{' '}
        <strong>1,000 points</strong> and have <strong>5 guesses</strong> to
        get the shelf right.
      </p>

      <div>
        <p className="mb-2 font-bold text-[hsl(var(--game-ink))]">Ordering</p>
        <p>
          Drag games from the pool into the slots — or tap a game, then tap a
          slot. When all seven are placed, hit <strong>Submit order</strong>.
          You&apos;ll be told how many are in exactly the right spot, but not
          which ones.
        </p>
      </div>

      <div>
        <p className="mb-2 font-bold text-[hsl(var(--game-ink))]">Hints</p>
        <p>
          <strong>Reveal one slot</strong> (&minus;100 pts) shows whether one
          placed game is spot on, one place out, or wrong.{' '}
          <strong>Reveal all slots</strong> (&minus;300 pts) does the same for
          the whole shelf. A reveal belongs to that game in that slot — move
          the game and the reveal is gone.
        </p>
      </div>

      <div>
        <p className="mb-1 font-bold text-[hsl(var(--game-ink))]">Scoring</p>
        <p>
          Your first guess is free. Every guess after that costs{' '}
          <strong>150 pts</strong>. Run out of guesses and it&apos;s a bust —
          nail the order to bank whatever&apos;s left.
        </p>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Resets daily at midnight GMT. Check back each day for a new game!
      </p>
    </RulesModalShell>
  )
}
