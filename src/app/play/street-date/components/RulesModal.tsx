'use client'

import { useEffect } from 'react'

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
        <h2 className="mb-4 text-center text-xl font-black uppercase text-[hsl(var(--game-green))]">
          How to Play
        </h2>

        <div className="space-y-4 text-sm text-foreground">
          <p>
            <strong>Street Date</strong> is a daily game where you guess the
            release year of a set of video games from their cover art alone.
          </p>

          <div>
            <p className="mb-2 font-bold text-[hsl(var(--game-ink))]">The Covers</p>
            <p>
              You&apos;re shown up to <strong>5 game covers</strong> &mdash; all released
              in the same year. The more covers you need to see before guessing
              correctly, the fewer points you earn.
            </p>
          </div>

          <div>
            <p className="mb-2 font-bold text-[hsl(var(--game-ink))]">Guessing</p>
            <p>
              Type a year and submit. If you&apos;re wrong, you&apos;ll be told
              whether the answer is <strong>higher</strong> or <strong>lower</strong>.
              You get up to <strong>5 attempts</strong> &mdash; one per cover.
            </p>
          </div>

          <div>
            <p className="mb-2 font-bold text-[hsl(var(--game-ink))]">Wager</p>
            <p>
              Before your first guess, choose a confidence level:
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <div className="rounded-md bg-muted/50 px-2 py-1.5 text-center">
                <span className="block text-xs font-bold">Cautious</span>
                <span className="text-[10px] text-muted-foreground">&times;0.5 pts</span>
              </div>
              <div className="rounded-md bg-muted/50 px-2 py-1.5 text-center">
                <span className="block text-xs font-bold">Confident</span>
                <span className="text-[10px] text-muted-foreground">&times;1 pts</span>
              </div>
              <div className="rounded-md bg-muted/50 px-2 py-1.5 text-center">
                <span className="block text-xs font-bold">All In</span>
                <span className="text-[10px] text-muted-foreground">&times;2 pts</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Higher wagers multiply your score but risk getting nothing if wrong.
            </p>
          </div>

          <div>
            <p className="mb-1 font-bold text-[hsl(var(--game-ink))]">Scoring</p>
            <p>
              Points are based on how few covers you needed. Guess on the first
              cover for maximum points, multiplied by your wager. If all 5
              attempts are wrong, you score 0.
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            New game every day at midnight GMT.
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-[hsl(var(--game-green))] py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
