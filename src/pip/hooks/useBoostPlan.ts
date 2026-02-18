/* ──────────────────────────────────────────────
   Pip Dashboard v2 — Boost Plan Hook
   ────────────────────────────────────────────── */

import { useState, useCallback } from 'react';
import { generateBoostPlan } from '../lib/pipClaude';
import type { BoostPlan, BoostContext } from '../lib/pipMockData';

export function useBoostPlan() {
  const [plan, setPlan] = useState<BoostPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(async (context: BoostContext) => {
    setIsGenerating(true);
    try {
      const result = await generateBoostPlan(context);
      setPlan(result);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clear = useCallback(() => setPlan(null), []);

  const save = useCallback(() => {
    if (plan) localStorage.setItem('pip_boost_plan', JSON.stringify(plan));
  }, [plan]);

  return { plan, isGenerating, generate, clear, save };
}
