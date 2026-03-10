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
        <h2 className="mb-4 text-center text-xl font-black uppercase text-[#5B4FCF]">
          How to Play
        </h2>

        <div className="space-y-4 text-sm text-foreground">
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
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-[#5B4FCF] py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
