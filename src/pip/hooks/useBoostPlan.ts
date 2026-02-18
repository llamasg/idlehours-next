/* ──────────────────────────────────────────────
   Pip Dashboard v2 — Boost Plan Hook
   ────────────────────────────────────────────── */

import { useState, useCallback } from 'react';
import { generateBoostPlan } from '../lib/pipClaude';
import type { BoostPlan, BoostContext } from '../lib/pipMockData';

const STORAGE_KEY = 'pip_boost_plan';

export function useBoostPlan() {
  const [plan, setPlan] = useState<BoostPlan | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(async (context: BoostContext) => {
    setIsGenerating(true);
    try {
      const result = await generateBoostPlan(context);
      setPlan(result);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } catch (e) {
      console.error('Boost plan failed:', e);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clear = useCallback(() => {
    setPlan(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { plan, isGenerating, generate, clear };
}
