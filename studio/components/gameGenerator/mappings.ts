// studio/components/gameGenerator/mappings.ts

/** Maps IGDB platform name substrings → our platform values */
export const PLATFORM_MAP: Record<string, string> = {
  'Windows': 'PC',
  'Mac': 'PC',
  'Linux': 'PC',
  'Nintendo Switch': 'Switch',
  'PlayStation 5': 'PS5',
  'Xbox Series': 'Xbox',
  'Xbox One': 'Xbox',
  'iOS': 'Mobile',
  'Android': 'Mobile',
}

/** Our valid platform values */
export const VALID_PLATFORMS = ['PC', 'Switch', 'PS5', 'Xbox', 'Mobile'] as const

/** Maps IGDB genre/theme names → our genre tag values */
export const GENRE_MAP: Record<string, string> = {
  'Role-playing (RPG)': 'RPG',
  'Adventure': 'adventure',
  'Simulator': 'simulation',
  'Puzzle': 'puzzle',
  'Platform': 'platformer',
  'Horror': 'horror',
  'Survival': 'survival',
  'Sandbox': 'sandbox',
  'Visual Novel': 'visual novel',
  'Turn-based strategy (TBS)': 'turn-based',
  'Strategy': 'turn-based',
  'Hack and slash/Beat \'em up': 'adventure',
  'Indie': '',  // skip — not a genre tag in our schema
}

/** Our valid genre tag values */
export const VALID_GENRES = [
  'farming', 'survival', 'roguelike', 'turn-based', 'puzzle',
  'platformer', 'adventure', 'RPG', 'simulation', 'sandbox',
  'visual novel', 'horror',
] as const

/** Convert a game title to a URL-safe slug */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/** Map an array of IGDB platform names to our platform list (deduped) */
export function mapPlatforms(igdbPlatformNames: string[]): string[] {
  const result = new Set<string>()
  for (const name of igdbPlatformNames) {
    for (const [key, value] of Object.entries(PLATFORM_MAP)) {
      if (name.includes(key) && value) {
        result.add(value)
      }
    }
  }
  return Array.from(result).filter((p) => (VALID_PLATFORMS as readonly string[]).includes(p))
}

/** Map IGDB genre + theme names to our genre tag list (deduped) */
export function mapGenres(igdbNames: string[]): string[] {
  const result = new Set<string>()
  for (const name of igdbNames) {
    const mapped = GENRE_MAP[name]
    if (mapped && (VALID_GENRES as readonly string[]).includes(mapped)) {
      result.add(mapped)
    }
  }
  return Array.from(result)
}

/** Truncate a string to maxLength, appending "…" if cut */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength - 1) + '…'
}
