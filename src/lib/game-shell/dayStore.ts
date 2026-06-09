// Generic localStorage-backed per-day state store for the daily games.
// Wraps the existing key patterns verbatim — key prefixes must NEVER change
// (CLAUDE.md: changing keys wipes player progress).

export interface DayStore<T> {
  key(dateStr: string): string
  /** null when running on the server, when nothing is stored, or on parse error. */
  load(dateStr: string): T | null
  save(dateStr: string, state: T): void
}

export function createDayStore<T>(
  keyPrefix: string,
  migrate?: (parsed: T) => T,
): DayStore<T> {
  return {
    key(dateStr) {
      return `${keyPrefix}${dateStr}`
    },
    load(dateStr) {
      if (typeof window === 'undefined') return null
      try {
        const raw = localStorage.getItem(`${keyPrefix}${dateStr}`)
        if (!raw) return null
        const parsed = JSON.parse(raw) as T
        return migrate ? migrate(parsed) : parsed
      } catch {
        return null
      }
    },
    save(dateStr, state) {
      if (typeof window === 'undefined') return
      try {
        localStorage.setItem(`${keyPrefix}${dateStr}`, JSON.stringify(state))
      } catch {
        // Silently ignore storage errors (e.g. quota exceeded)
      }
    },
  }
}
