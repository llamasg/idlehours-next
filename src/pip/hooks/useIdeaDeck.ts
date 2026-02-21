'use client'
/* ──────────────────────────────────────────────
   Pip Dashboard v2 — useIdeaDeck
   Tinder-style card deck logic for post ideas.
   Both dismissed + saved ideas persist via localStorage.
   ────────────────────────────────────────────── */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { PipIdea } from '../lib/pipMockData';
import { markIdeaSelected } from '../lib/pipSanityClient';

const LS_DISMISSED = 'pip_dismissed_ideas';
const LS_SAVED     = 'pip_saved_ideas';

function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function persistToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — fail silently
  }
}

export interface UseIdeaDeckReturn {
  currentCard: PipIdea | null;
  behindCards: PipIdea[];
  deckSize: number;
  dismissed: string[];
  saved: PipIdea[];
  dismiss: (id: string) => void;
  save: (id: string) => void;
  select: (id: string) => void;
  removeSaved: (id: string) => void;
  selectSaved: (id: string) => void;
  addIdeas: (ideas: PipIdea[]) => void;
  refreshDeck: () => void;
  isEmpty: boolean;
  lastAction: 'dismiss' | 'save' | 'select' | null;
}

export function useIdeaDeck(ideas: PipIdea[]): UseIdeaDeckReturn {
  const allIdeasRef = useRef(ideas);
  // eslint-disable-next-line -- ref update during render is intentional (latest closure pattern)
  allIdeasRef.current = ideas;

  const [dismissed, setDismissed] = useState<string[]>(() =>
    getFromStorage<string[]>(LS_DISMISSED, []),
  );

  const [saved, setSaved] = useState<PipIdea[]>(() =>
    getFromStorage<PipIdea[]>(LS_SAVED, []),
  );

  // Exclude both dismissed AND already-saved ideas from the live deck on init
  const [deck, setDeck] = useState<PipIdea[]>(() => {
    const dismissedIds = getFromStorage<string[]>(LS_DISMISSED, []);
    const savedIds = new Set(getFromStorage<PipIdea[]>(LS_SAVED, []).map((i) => i.id));
    return ideas.filter((i) => !dismissedIds.includes(i.id) && !savedIds.has(i.id));
  });

  // When ideas transitions from mock → live Sanity data the IDs change.
  // useState initializers only run once, so we need an effect to reset the deck.
  const ideasKeyRef = useRef(ideas.map((i) => i.id).join(','));
  useEffect(() => {
    const newKey = ideas.map((i) => i.id).join(',');
    if (newKey !== ideasKeyRef.current) {
      ideasKeyRef.current = newKey;
      const d = getFromStorage<string[]>(LS_DISMISSED, []);
      const s = new Set(getFromStorage<PipIdea[]>(LS_SAVED, []).map((i) => i.id));
      setDeck(ideas.filter((i) => !d.includes(i.id) && !s.has(i.id)));
    }
  }, [ideas]);

  const [lastAction, setLastAction] = useState<'dismiss' | 'save' | 'select' | null>(null);
  const cycleIndexRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setLastAction('dismiss');
    setDeck((prev) => prev.filter((c) => c.id !== id));
    setDismissed((prev) => {
      const next = [...prev, id];
      persistToStorage(LS_DISMISSED, next);
      return next;
    });
  }, []);

  const save = useCallback((id: string) => {
    setLastAction('save');
    setDeck((prev) => {
      const card = prev.find((c) => c.id === id);
      if (card) {
        setSaved((s) => {
          const next = [...s, card];
          persistToStorage(LS_SAVED, next);
          return next;
        });
      }
      return prev.filter((c) => c.id !== id);
    });
  }, []);

  const select = useCallback((id: string) => {
    setLastAction('select');
    setDeck((prev) => {
      const card = prev.find((c) => c.id === id);
      if (card) {
        // Push into saved so "I'll write this" survives a page refresh
        setSaved((s) => {
          if (s.some((i) => i.id === id)) return s;
          const next = [...s, card];
          persistToStorage(LS_SAVED, next);
          return next;
        });
      }
      return prev.filter((c) => c.id !== id);
    });
    markIdeaSelected(id);
  }, []);

  const removeSaved = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.filter((c) => c.id !== id);
      persistToStorage(LS_SAVED, next);
      return next;
    });
  }, []);

  const selectSaved = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.filter((c) => c.id !== id);
      persistToStorage(LS_SAVED, next);
      return next;
    });
  }, []);

  const addIdeas = useCallback((newIdeas: PipIdea[]) => {
    setDeck((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const unique = newIdeas.filter((i) => !existingIds.has(i.id));
      return [...unique, ...prev];
    });
  }, []);

  const refreshDeck = useCallback(() => {
    const all = allIdeasRef.current;
    if (all.length === 0) return;

    setDismissed((currentDismissed) => {
      setSaved((currentSaved) => {
        const savedIds = new Set(currentSaved.map((i) => i.id));

        setDeck((currentDeck) => {
          const currentIds = new Set([
            ...currentDeck.map((c) => c.id),
            ...currentDismissed,
            ...savedIds,
          ]);

          const candidates = all.filter((i) => !currentIds.has(i.id));
          let toAdd: PipIdea[] = [];

          if (candidates.length >= 3) {
            toAdd = candidates.slice(0, 3);
          } else {
            let idx = cycleIndexRef.current;
            const nonDismissed = all.filter(
              (i) => !currentDismissed.includes(i.id) && !savedIds.has(i.id),
            );
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

        return currentSaved;
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
    addIdeas,
    refreshDeck,
    isEmpty: deck.length === 0,
    lastAction,
  };
}
