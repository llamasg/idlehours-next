'use client'

import { useEffect } from 'react'
import { BLANKS } from './SentenceClue'

interface RulesModalProps {
  onClose: () => void
}

export default function RulesModal({ onClose }: RulesModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="mx-4 w-full max-w-md rounded-2xl bg-card p-6 shadow-xl font-game">
        <h2 className="mb-4 text-center text-xl font-black uppercase text-[hsl(var(--game-blue))]">
          How to Play
        </h2>

        <div className="space-y-4 text-sm text-foreground">
          <p>
            <strong>Game Sense</strong> is a daily game where you guess a video
            game from clues. You start with <strong>1,000 points</strong> —
            the goal is to guess correctly while keeping your score as high as
            possible.
          </p>

          <div>
            <p className="mb-2 font-bold text-[hsl(var(--game-ink))]">Guessing</p>
            <p>
              Each guess costs <strong>20 pts</strong>. Type a game title and
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
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-[hsl(var(--game-blue))] py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
