'use client'
/* ──────────────────────────────────────────────
   Pip Dashboard v2 — Streak Calculator Hook
   ────────────────────────────────────────────── */

/**
 * Calculate consecutive-day publishing streak from an array of ISO date strings.
 * Counts backwards from today; each day with at least one publish counts.
 *
 * Currently returns a mock value — the real calculation is in place
 * for when live data is connected.
 */
export function useStreak(publishDates: string[]) {
  if (publishDates.length === 0) {
    return { streak: 0, longestStreak: 0 };
  }

  const unique = [...new Set(publishDates.map((d) => d.slice(0, 10)))].sort().reverse();

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < unique.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().slice(0, 10);

    if (unique[i] === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  // Longest streak — walk all dates
  let longest = 0;
  let current = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]!);
    const curr = new Date(unique[i]!);
    const diffDays = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (Math.round(diffDays) === 1) {
      current++;
    } else {
      longest = Math.max(longest, current);
      current = 1;
    }
  }
  longest = Math.max(longest, current);

  // For now, return mock values until live data is wired up
  return { streak: 4, longestStreak: 7 };
}
