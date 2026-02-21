'use client'
/* ──────────────────────────────────────────────
   Pip Dashboard v2 — IdeaDeck
   Tinder-style swipeable card stack for post ideas
   ────────────────────────────────────────────── */

import { AnimatePresence, motion } from 'framer-motion';
import { IdeaCard } from './IdeaCard';
import type { UseIdeaDeckReturn } from '../hooks/useIdeaDeck';

interface IdeaDeckProps {
  deck: UseIdeaDeckReturn;
  onFreshIdeas?: () => void;
  isRefreshing?: boolean;
}

/* ── Exit animation variants keyed on last action ── */
const exitVariants = {
  dismiss: { x: -300, opacity: 0, rotate: -5, transition: { duration: 0.3 } },
  save: { x: 100, y: -50, opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
  select: { x: 300, opacity: 0, rotate: 5, transition: { duration: 0.3 } },
} as const;

export function IdeaDeck({ deck, onFreshIdeas, isRefreshing }: IdeaDeckProps) {
  const {
    currentCard,
    behindCards,
    dismiss,
    save,
    select,
    refreshDeck,
    isEmpty,
    lastAction,
  } = deck;

  const handleFresh = onFreshIdeas ?? refreshDeck;

  /* ── Empty state ── */
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground text-lg mb-6 max-w-md">
          You've seen everything I've got right now — want me to find more?
        </p>
        <button
          type="button"
          onClick={handleFresh}
          disabled={isRefreshing}
          className="bg-burnt-orange text-white rounded-full px-8 py-3 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isRefreshing ? '⏳ Getting ideas...' : '✨ Find more ideas'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* ── Card stack ── */}
      <div className="relative max-w-[520px] w-full mx-auto" style={{ minHeight: 360 }}>
        {/* Behind card 2 */}
        {behindCards[1] && (
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ transform: 'scale(0.94) translateY(8px)', opacity: 0.3 }}
          >
            <IdeaCard idea={behindCards[1]} />
          </div>
        )}

        {/* Behind card 1 */}
        {behindCards[0] && (
          <div
            className="absolute inset-0 z-20 pointer-events-none"
            style={{ transform: 'scale(0.97) translateY(4px)', opacity: 0.6 }}
          >
            <IdeaCard idea={behindCards[0]} />
          </div>
        )}

        {/* Current card */}
        <AnimatePresence mode="popLayout">
          {currentCard && (
            <motion.div
              key={currentCard.id}
              className="relative z-30"
              initial={{ x: 0, y: 20, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              exit={lastAction ? exitVariants[lastAction] : exitVariants.dismiss}
              transition={{ duration: 0.3 }}
            >
              <IdeaCard idea={currentCard} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Action buttons ── */}
      {currentCard && (
        <div className="flex justify-center gap-4 mt-6 flex-wrap">
          <button
            type="button"
            onClick={() => dismiss(currentCard.id)}
            className="border-2 border-muted text-muted-foreground rounded-full px-6 py-3 hover:bg-muted transition-colors"
          >
            ✕ Not for me
          </button>
          <button
            type="button"
            onClick={() => save(currentCard.id)}
            className="border-2 border-amber-400 text-amber-600 rounded-full px-6 py-3 hover:bg-amber-50 transition-colors"
          >
            🔖 Save for later
          </button>
          <button
            type="button"
            onClick={() => select(currentCard.id)}
            className="bg-accent-green text-white rounded-full px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
          >
            ✓ I'll write this
          </button>
        </div>
      )}

      {/* ── Fresh ideas link ── */}
      <button
        type="button"
        onClick={handleFresh}
        disabled={isRefreshing}
        className="mt-4 text-burnt-orange hover:underline text-sm font-medium transition-colors disabled:opacity-50"
      >
        {isRefreshing ? '⏳ Getting ideas...' : '✨ Fresh ideas'}
      </button>
    </div>
  );
}
