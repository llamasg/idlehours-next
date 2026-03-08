import { type GameEntry } from '@/data/games-db'

/** Lowercase, strip punctuation, collapse whitespace */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[''\u2019.,:;!?\-"()&]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Generate fuzzy variants of a normalized string for lenient matching.
 * Handles pluralization differences (souls/soul, demons/demon) etc.
 */
function fuzzyVariants(norm: string): string[] {
  const variants = [norm]
  const words = norm.split(' ')

  // For each word, try adding/removing trailing 's'
  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    const toggled = [...words]
    if (w.endsWith('s') && w.length > 2) {
      toggled[i] = w.slice(0, -1) // demons → demon
      variants.push(toggled.join(' '))
    } else {
      toggled[i] = w + 's' // demon → demons
      variants.push(toggled.join(' '))
    }
  }

  return variants
}

/**
 * Build a map of normalized aliases → game ID for a pool of games.
 * Multiple aliases per game (full title, subtitle, no-"The" variant).
 */
export function buildAliasMap(pool: GameEntry[]): Map<string, string> {
  const map = new Map<string, string>()

  for (const game of pool) {
    const norm = normalize(game.title)
    // Only map if not already claimed by another game (first wins)
    if (!map.has(norm)) map.set(norm, game.id)

    // Subtitle after colon — e.g. "Zelda: Breath of the Wild" → "breath of the wild"
    const colonIdx = game.title.indexOf(':')
    if (colonIdx > 0) {
      const sub = normalize(game.title.slice(colonIdx + 1))
      if (sub.length >= 3 && !map.has(sub)) map.set(sub, game.id)
    }

    // Strip leading "The " — e.g. "The Witcher 3" → "witcher 3"
    if (norm.startsWith('the ')) {
      const noThe = norm.slice(4)
      if (!map.has(noThe)) map.set(noThe, game.id)
    }

    // Roman numeral / Arabic aliases for common patterns
    const romanPairs: [string, string][] = [
      ['ii', '2'], ['iii', '3'], ['iv', '4'], ['v', '5'],
      ['vi', '6'], ['vii', '7'], ['viii', '8'], ['ix', '9'], ['x', '10'],
    ]
    for (const [roman, arabic] of romanPairs) {
      if (norm.endsWith(` ${roman}`)) {
        const alt = norm.slice(0, -roman.length) + arabic
        if (!map.has(alt)) map.set(alt, game.id)
      }
      if (norm.endsWith(` ${arabic}`)) {
        const alt = norm.slice(0, -arabic.length) + roman
        if (!map.has(alt)) map.set(alt, game.id)
      }
    }
  }

  return map
}

export interface GuessResult {
  result: 'correct' | 'duplicate' | 'wrong'
  gameId?: string
  title?: string
}

export function checkGuess(
  input: string,
  aliasMap: Map<string, string>,
  guessedIds: Set<string>,
  pool: GameEntry[],
): GuessResult {
  const norm = normalize(input)
  if (!norm) return { result: 'wrong' }

  // 1. Exact alias match
  let gameId = aliasMap.get(norm)

  // 2. Try fuzzy variants (plural/singular toggling)
  if (!gameId) {
    for (const variant of fuzzyVariants(norm)) {
      gameId = aliasMap.get(variant)
      if (gameId) break
    }
  }

  // 3. Check if input matches any alias with fuzzy variants on the alias side too
  if (!gameId) {
    for (const [alias, id] of aliasMap) {
      // Check if any fuzzy variant of the input matches any fuzzy variant of the alias
      const aliasVariants = fuzzyVariants(alias)
      const inputVariants = fuzzyVariants(norm)
      for (const iv of inputVariants) {
        if (aliasVariants.includes(iv)) {
          gameId = id
          break
        }
      }
      if (gameId) break
    }
  }

  if (!gameId) return { result: 'wrong' }
  if (guessedIds.has(gameId)) return { result: 'duplicate', gameId }

  const game = pool.find((g) => g.id === gameId)
  return { result: 'correct', gameId, title: game?.title }
}
