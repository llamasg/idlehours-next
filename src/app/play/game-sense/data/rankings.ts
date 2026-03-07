// Precomputed semantic rankings for Game Sense.
// Re-generate with: OPENAI_API_KEY=sk-... node scripts/generate-rankings.mjs
// When null, the game falls back to a metadata-based distance metric.

export const RANKINGS: Record<string, string[]> | null = null
