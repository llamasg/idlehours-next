'use client'

import RulesModalShell from '@/components/games/shell/RulesModal'

// Box Set rules copy — the modal shell (overlay, heading, button) is shared.
// NOTE: new copy, flagged for editorial review.

export default function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <RulesModalShell accent="hsl(var(--game-amber))" onClose={onClose}>
      <p>
        <strong>Box Set</strong> is a daily game of hidden connections.
        Sixteen games on the shelf, four groups of four — find what links
        them.
      </p>

      <div>
        <p className="mb-2 font-bold text-[hsl(var(--game-ink))]">Playing</p>
        <p>
          Tap four games you think belong together, then{' '}
          <strong>Submit</strong>. Get a group right and it locks in. Three
          out of four? You&apos;ll be told you were one away — but it still
          counts as a mistake.
        </p>
      </div>

      <div>
        <p className="mb-2 font-bold text-[hsl(var(--game-ink))]">The groups</p>
        <p>
          One group is broad, one is specific, one takes gamer knowledge —
          and one is hiding in the titles themselves. Every game fits
          exactly one group.
        </p>
      </div>

      <div>
        <p className="mb-1 font-bold text-[hsl(var(--game-ink))]">Scoring</p>
        <p>
          You start with <strong>1,000 points</strong>. Each mistake costs{' '}
          <strong>250 pts</strong>. Four mistakes and the shelf collapses —
          that&apos;s a bust.
        </p>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Resets daily at midnight GMT. Check back each day for a new game!
      </p>
    </RulesModalShell>
  )
}
