// Box Set predicate evaluation — plain JS (.mjs) ON PURPOSE: this single
// implementation is imported both by the Next.js runtime (TS, via allowJs)
// and by scripts/assemble-box-set.mjs / seed scripts in Node. Concepts are
// serialisable specs; nothing here calls out anywhere — every claim a puzzle
// makes is verifiable against GAMES_DB fields or the title string alone.
//
// Predicate spec grammar:
//   { all: [spec, ...] }                              — conjunction
//   { field, op: 'includes', value }                  — array field contains value
//   { field, op: 'eq' | 'gte' | 'lte', value }        — scalar comparison
//   { field, op: 'between', value: [min, max] }       — inclusive range
//   { field: 'platforms', op: 'only', value: [...] }  — every platform within set
//   { field: 'id', op: 'memberOf', value: [...] }     — curated id list (human-
//                                                       reviewed; the predicate
//                                                       verifies membership only)
//   { op: 'wordplay', matcher: '<name>' }             — named title-string matcher

// ── Wordplay helpers ─────────────────────────────────────────────────────────

/** Words of a title, lowercased, punctuation stripped. */
export function titleWords(title) {
  return title
    .toLowerCase()
    .replace(/[''’.,:;!?\-–—"()&®™]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

/** True if any whole word of the title is in the list. */
export function containsWordFromList(list) {
  const set = new Set(list.map((w) => w.toLowerCase()))
  return (title) => titleWords(title).some((w) => set.has(w))
}

/** True if the title matches the regex (case-insensitive unless flags given). */
export function titleRegex(pattern, flags = 'i') {
  const re = new RegExp(pattern, flags)
  return (title) => re.test(title)
}

/** True if the title is exactly one word (after punctuation stripping). */
export function isOneWord(title) {
  return titleWords(title).length === 1
}

// The named matcher registry is populated in wordplayMatchers.mjs (seeded in
// phase 1b) and injected here to avoid a circular import.
let WORDPLAY_MATCHERS = {}
export function registerWordplayMatchers(matchers) {
  WORDPLAY_MATCHERS = matchers
}
export function getWordplayMatcher(name) {
  return WORDPLAY_MATCHERS[name]
}

// ── Evaluation ───────────────────────────────────────────────────────────────

export function evaluatePredicate(spec, game) {
  if (!spec) return false

  if (Array.isArray(spec.all)) {
    return spec.all.every((s) => evaluatePredicate(s, game))
  }

  if (spec.op === 'wordplay') {
    const matcher = WORDPLAY_MATCHERS[spec.matcher]
    if (!matcher) throw new Error(`Unknown wordplay matcher: ${spec.matcher}`)
    return matcher(game.title)
  }

  const value = game[spec.field]

  switch (spec.op) {
    case 'includes':
      return Array.isArray(value) && value.includes(spec.value)
    case 'eq':
      return value === spec.value
    case 'gte':
      return typeof value === 'number' && value >= spec.value
    case 'lte':
      return typeof value === 'number' && value <= spec.value
    case 'between':
      return (
        typeof value === 'number' &&
        value >= spec.value[0] &&
        value <= spec.value[1]
      )
    case 'only':
      return (
        Array.isArray(value) &&
        value.length > 0 &&
        value.every((v) => spec.value.includes(v))
      )
    case 'memberOf':
      return Array.isArray(spec.value) && spec.value.includes(game.id)
    case 'notMemberOf':
      // Human-review exclusions: technically-matching games that make a
      // group feel cheap (e.g. DLC Quest matching the pirates tag).
      return Array.isArray(spec.value) && !spec.value.includes(game.id)
    default:
      throw new Error(`Unknown predicate op: ${spec.op}`)
  }
}

/** All games in db matching the concept's predicate. */
export function resolveConcept(concept, db) {
  return db.filter((g) => evaluatePredicate(concept.predicate, g)).map((g) => g.id)
}
