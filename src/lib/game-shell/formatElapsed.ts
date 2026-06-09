// Elapsed-time display for post-game stat pills — replaces the IIFE that was
// duplicated in the game-sense and street-date pages.

export function formatElapsed(startedAt?: number | null, endedAt?: number | null): string {
  if (!startedAt || !endedAt) return '—'
  let secs = Math.round((endedAt - startedAt) / 1000)
  if (secs < 60) return `${secs}s`
  const hrs = Math.floor(secs / 3600)
  secs %= 3600
  const mins = Math.floor(secs / 60)
  const rem = secs % 60
  if (hrs > 0) return `${hrs}h ${mins}m ${rem}s`
  return `${mins}m ${rem}s`
}
