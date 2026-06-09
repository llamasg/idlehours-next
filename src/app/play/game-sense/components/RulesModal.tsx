'use client'

import RulesModalShell from '@/components/games/shell/RulesModal'
import { BLANKS } from './SentenceClue'

// Game Sense rules copy — the modal shell (overlay, heading, button) is shared.

export default function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <RulesModalShell accent="hsl(var(--game-blue))" onClose={onClose}>
      <p>
        <strong>Game Sense</strong> is a daily game where you guess a video
        game from clues. You start with <strong>1,000 points</strong> —
        the goal is to guess correctly while keeping your score as high as
        possible.
      </p>

      <div>
        <p className="mb-2 font-bold text-[hsl(var(--game-ink))]">Guessing</p>
        <p>
          Each guess costs <strong>1 pt</strong>. Type a game title and
          select it. You&apos;ll see how close your guess is — the lower
          the number, the warmer you are.
        </p>
      </div>

      <div>
        <p className="mb-2 font-bold text-[hsl(var(--game-ink))]">Clue Blanks</p>
        <p className="mb-2">
          The sentence has 5 blanks you can reveal for a cost:
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {BLANKS.map((b) => (
            <div
              key={b.key}
              className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5"
            >
              <span className="font-semibold">{b.label}</span>
              <span className="text-xs font-bold text-[hsl(var(--game-red))]">
                &minus;{b.cost} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 font-bold text-[hsl(var(--game-ink))]">Scoring</p>
        <p>
          Start at 1,000. Hints and guesses cost points. The higher your
          final score when you guess correctly, the better!
        </p>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Resets daily at midnight GMT. Check back each day for a new game!
      </p>
    </RulesModalShell>
  )
}
