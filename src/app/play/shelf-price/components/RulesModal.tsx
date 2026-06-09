'use client'

import RulesModalShell from '@/components/games/shell/RulesModal'

// Shelf Price rules copy — the modal shell (overlay, heading, button) is shared.

export default function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <RulesModalShell accent="#5B4FCF" onClose={onClose}>
      <p>
        <strong>Shelf Price</strong> is a daily game where you guess which
        of two games cost more at launch. Play through <strong>10 rounds</strong> and
        try to keep your perfect score.
      </p>

      <div>
        <p className="mb-2 font-bold text-[hsl(var(--game-ink))]">Each Round</p>
        <p>
          Two game covers appear side by side. Tap the one you think had the
          higher launch price. After you choose, both prices are revealed.
        </p>
      </div>

      <div>
        <p className="mb-1 font-bold text-[hsl(var(--game-ink))]">Scoring</p>
        <p>
          You start with <strong>1,000 points</strong>. Each wrong answer
          costs <strong>100 pts</strong>. Correct answers cost nothing. Get
          all 10 right to keep your perfect score!
        </p>
      </div>

      <div>
        <p className="mb-1 font-bold text-[hsl(var(--game-ink))]">Tips</p>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Look at the decade badge &mdash; older games were often cheaper</li>
          <li>AAA titles tend to launch at full price</li>
          <li>Indie games are usually priced lower</li>
        </ul>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        New game every day at midnight GMT.
      </p>
    </RulesModalShell>
  )
}
