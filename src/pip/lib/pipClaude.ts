/* ──────────────────────────────────────────────
   Pip Dashboard v2 — Mock Claude API
   ────────────────────────────────────────────── */

import type { BoostPlan, BoostContext } from './pipMockData';
import { mockBoostPlan } from './pipMockData';

/**
 * Mock "Yes, And" brainstorm call.
 * Simulates Pip riffing on a content idea with a short delay.
 */
export async function askPipYesAnd(
  input: string,
): Promise<{ response: string; angles: string[] }> {
  await new Promise((r) => setTimeout(r, 1500));
  return {
    response: `That's interesting — there's something in "${input}" that could really work. Nobody's writing about this the way you would. The angle isn't the obvious one — it's the personal one, the one that only makes sense if you've actually felt it.`,
    angles: [
      "The personal angle nobody's tried",
      'Turn it into a mood guide',
      "Make it a 'games that feel like...' list",
    ],
  };
}

/**
 * Mock boost-plan generation.
 * Simulates a longer Claude call that produces a full growth plan.
 */
export async function generateBoostPlan(
  _context: BoostContext,
): Promise<BoostPlan> {
  await new Promise((r) => setTimeout(r, 2000));
  return mockBoostPlan;
}
