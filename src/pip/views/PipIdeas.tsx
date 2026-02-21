'use client'
/* ──────────────────────────────────────────────
   Pip Dashboard v2 — PipIdeas view
   Post ideas page with Tinder-style card deck
   ────────────────────────────────────────────── */

import { useState } from 'react';
import { usePipData } from '../hooks/usePipData';
import { useIdeaDeck } from '../hooks/useIdeaDeck';
import { useIdeasRefresh } from '../hooks/useIdeasRefresh';
import { IdeaDeck } from '../components/IdeaDeck';
import YesAndInput from '../components/YesAndInput';

export default function PipIdeas() {
  const { ideas } = usePipData();
  const deck = useIdeaDeck(ideas);
  const { fetchFreshIdeas, isRefreshing } = useIdeasRefresh();
  const [savedOpen, setSavedOpen] = useState(false);

  async function handleFreshIdeas() {
    const existingTitles = ideas.map((i) => i.title);
    const newIdeas = await fetchFreshIdeas(existingTitles);
    if (newIdeas.length > 0) {
      deck.addIdeas(newIdeas);
    } else {
      deck.refreshDeck();
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-serif text-foreground mb-8">Post Ideas</h1>

      {/* Card deck */}
      <IdeaDeck deck={deck} onFreshIdeas={handleFreshIdeas} isRefreshing={isRefreshing} />

      {/* YES AND input */}
      <YesAndInput />

      {/* Saved ideas section */}
      {deck.saved.length > 0 && (
        <div className="mt-12 bg-muted/40 rounded-xl p-4">
          <button
            type="button"
            onClick={() => setSavedOpen((o) => !o)}
            className="flex items-center gap-2 w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className={`transition-transform ${savedOpen ? 'rotate-90' : ''}`}>▸</span>
            🔖 Ideas you saved for later ({deck.saved.length})
          </button>

          {savedOpen && (
            <ul className="mt-3 space-y-2">
              {deck.saved.map((idea) => (
                <li
                  key={idea.id}
                  className="flex items-center justify-between gap-3 bg-white/70 rounded-lg px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{idea.title}</p>
                    <span className="text-xs text-accent-green">{idea.cluster}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => deck.selectSaved(idea.id)}
                      className="text-xs text-accent-green hover:underline font-medium"
                    >
                      Write this →
                    </button>
                    <button
                      type="button"
                      onClick={() => deck.removeSaved(idea.id)}
                      className="text-muted-foreground hover:text-destructive text-sm transition-colors"
                      aria-label={`Remove "${idea.title}" from saved`}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
