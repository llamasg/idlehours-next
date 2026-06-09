'use client'

import { useEffect, type ReactNode } from 'react'

// Shared how-to-play modal shell. The two per-game forks (game-sense,
// shelf-price) were identical apart from copy and accent colour; each game
// now provides its copy as children and its accent as a CSS colour string.

interface RulesModalProps {
  /** CSS colour for the heading and the "Got it" button. */
  accent: string
  onClose: () => void
  children: ReactNode
}

export default function RulesModal({ accent, onClose, children }: RulesModalProps) {
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
        <h2 className="mb-4 text-center text-xl font-black uppercase" style={{ color: accent }}>
          How to Play
        </h2>

        <div className="space-y-4 text-sm text-foreground">{children}</div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-full py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: accent }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}
