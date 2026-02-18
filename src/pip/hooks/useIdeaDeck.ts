/* ──────────────────────────────────────────────
   Pip Dashboard v2 — useIdeaDeck
   Tinder-style card deck logic for post ideas
   ────────────────────────────────────────────── */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { PipIdea } from '../lib/pipMockData';

const LS_KEY = 'pip_dismissed_ideas';

function getDismissedFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function persistDismissed(ids: string[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

export interface UseIdeaDeckReturn {
  currentCard: PipIdea | null;
  behindCards: PipIdea[]; // next 2 cards for stack effect
  deckSize: number;
  dismissed: string[];
  saved: PipIdea[];
  dismiss: (id: string) => void;
  save: (id: string) => void;
  select: (id: string) => void;
  removeSaved: (id: string) => void;
  selectSaved: (id: string) => void;
  refreshDeck: () => void;
  isEmpty: boolean;
  /** Last action — used by IdeaDeck to decide exit animation direction */
  lastAction: 'dismiss' | 'save' | 'select' | null;
}

export function useIdeaDeck(ideas: PipIdea[]): UseIdeaDeckReturn {
  // Keep a stable ref to the full ideas list for cycling on refresh
  const allIdeasRef = useRef(ideas);
  allIdeasRef.current = ideas;

  const [dismissed, setDismissed] = useState<string[]>(getDismissedFromStorage);
  const [deck, setDeck] = useState<PipIdea[]>(() =>
    ideas.filter((i) => !getDismissedFromStorage().includes(i.id)),
  );

  // When ideas transitions from mock → live Sanity data the IDs change.
  // useState initializers only run once, so we need an effect to reset the deck.
  const ideasKeyRef = useRef(ideas.map((i) => i.id).join(','));
  useEffect(() => {
    const newKey = ideas.map((i) => i.id).join(',');
    if (newKey !== ideasKeyRef.current) {
      ideasKeyRef.current = newKey;
      setDeck(ideas.filter((i) => !getDismissedFromStorage().includes(i.id)));
    }
  }, [ideas]);
  const [saved, setSaved] = useState<PipIdea[]>([]);
  const [lastAction, setLastAction] = useState<'dismiss' | 'save' | 'select' | null>(null);

  // Cycle index for refreshDeck — tracks where we left off
  const cycleIndexRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setLastAction('dismiss');
    setDeck((prev) => prev.filter((c) => c.id !== id));
    setDismissed((prev) => {
      const next = [...prev, id];
      persistDismissed(next);
      return next;
    });
  }, []);

  const save = useCallback((id: string) => {
    setLastAction('save');
    setDeck((prev) => {
      const card = prev.find((c) => c.id === id);
      if (card) setSaved((s) => [...s, card]);
      return prev.filter((c) => c.id !== id);
    });
  }, []);

  const select = useCallback((id: string) => {
    setLastAction('select');
    setDeck((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const removeSaved = useCallback((id: string) => {
    setSaved((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const selectSaved = useCallback((id: string) => {
    setSaved((prev) => prev.filter((c) => c.id !== id));
    // In future this could trigger the SEO helper flow
  }, []);

  const refreshDeck = useCallback(() => {
    const all = allIdeasRef.current;
    if (all.length === 0) return;

    setDismissed((currentDismissed) => {
      setDeck((currentDeck) => {
        const currentIds = new Set([
          ...currentDeck.map((c) => c.id),
          ...currentDismissed,
        ]);

        const candidates = all.filter((i) => !currentIds.has(i.id));
        let toAdd: PipIdea[] = [];

        if (candidates.length >= 3) {
          toAdd = candidates.slice(0, 3);
        } else {
          // Cycle through all ideas, skipping dismissed
          toAdd = [];
          let idx = cycleIndexRef.current;
          const nonDismissed = all.filter((i) => !currentDismissed.includes(i.id));
          if (nonDismissed.length === 0) return currentDeck;

          for (let added = 0; added < 3; added++) {
            const idea = nonDismissed[idx % nonDismissed.length];
            if (!currentIds.has(idea.id)) {
              toAdd.push(idea);
              currentIds.add(idea.id);
            }
            idx++;
          }
          cycleIndexRef.current = idx;

          // If we still got nothing (all in deck already), force-add copies
          if (toAdd.length === 0) {
            idx = cycleIndexRef.current;
            for (let added = 0; added < 3; added++) {
              toAdd.push(nonDismissed[idx % nonDismissed.length]);
              idx++;
            }
            cycleIndexRef.current = idx;
          }
        }

        return [...currentDeck, ...toAdd];
      });

      return currentDismissed;
    });
  }, []);

  const currentCard = deck[0] ?? null;
  const behindCards = deck.slice(1, 3);

  return {
    currentCard,
    behindCards,
    deckSize: deck.length,
    dismissed,
    saved,
    dismiss,
    save,
    select,
    removeSaved,
    selectSaved,
    refreshDeck,
    isEmpty: deck.length === 0,
    lastAction,
  };
}
