// Seeded RNGs for the daily games. Both algorithms live here ON PURPOSE:
// puzzle generation is deterministic by date (CLAUDE.md rule), so each game
// must keep the exact algorithm it shipped with — Game Sense and Shelf Price
// use mulberry32, Street Date uses this LCG. Do not "upgrade" either; the
// tests in tests/puzzle-snapshots.test.ts pin the outputs.

/** mulberry32 — Game Sense's weighted daily selection, Shelf Price's pair generation. */
export function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** One step of Street Date's LCG (constants 1664525 / 1013904223, 31-bit mask). */
export function lcgNext(seed: number): number {
  return (seed * 1664525 + 1013904223) & 0x7fffffff
}

/** Fisher–Yates shuffle driven by the LCG — Street Date's seededShuffle. */
export function lcgShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr]
  let s = seed
  for (let i = result.length - 1; i > 0; i--) {
    s = lcgNext(s)
    const j = s % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** LCG step returning a 0..1 value plus the next seed — Street Date's seededRandom. */
export function lcgRandom(seed: number): { value: number; next: number } {
  const next = lcgNext(seed)
  return { value: next / 0x7fffffff, next }
}

/** Street Date's date-string hash seed. */
export function hashDateSeed(dateStr: string): number {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) & 0x7fffffff
  }
  return hash || 1
}
