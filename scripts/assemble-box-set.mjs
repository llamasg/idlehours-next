#!/usr/bin/env node
/**
 * Box Set puzzle assembly — builds N days of puzzles from the concept bank
 * and commits them as static data. Humans review the batch .md before the
 * dates go live. No runtime generation: what this writes is what ships.
 *
 * Per-puzzle constraints:
 *   UNAMBIGUOUS  — each of the 16 games satisfies EXACTLY its own group's
 *                  predicate (every game checked against all four).
 *   RECOGNISABLE — picks are popularity-biased; difficulty comes from the
 *                  concept, not obscurity.
 *   MISDIRECTION — ≥3 games share a surface attribute (genre/decade) with
 *                  another group WITHOUT satisfying its predicate (soft:
 *                  best-of after max attempts, noted in the review doc).
 *   FRESHNESS    — no game repeated within a 30-day window; concepts retire
 *                  permanently (usedOn written back to concepts.json).
 *
 * Usage: node scripts/assemble-box-set.mjs [--days 35] [--start YYYY-MM-DD]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { loadGamesDb } from './lib/load-games-db.mjs'
import { evaluatePredicate } from '../src/app/play/box-set/lib/predicates.mjs'
import '../src/app/play/box-set/lib/wordplayMatchers.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CONCEPTS_PATH = path.join(ROOT, 'src/app/play/box-set/data/concepts.json')
const PUZZLES_PATH = path.join(ROOT, 'src/app/play/box-set/data/puzzles/puzzles.json')
const REVIEW_DIR = path.join(ROOT, 'src/app/play/box-set/data/reviews')

const REUSE_WINDOW_DAYS = 30
const MAX_DAY_ATTEMPTS = 400
const MIN_MISDIRECTION = 3
const TIERS = ['yellow', 'green', 'blue', 'purple']

// ── Args ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const argVal = (flag, fallback) => {
  const i = args.indexOf(flag)
  return i !== -1 ? args[i + 1] : fallback
}
const DAYS = parseInt(argVal('--days', '35'), 10)

function todayLondon() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const get = (t) => parts.find((p) => p.type === t).value
  return `${get('year')}-${get('month')}-${get('day')}`
}
const START = argVal('--start', todayLondon())

const addDays = (dateStr, n) => {
  const d = new Date(`${dateStr}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

// ── Load state ───────────────────────────────────────────────────────────────

const db = await loadGamesDb()
const byId = new Map(db.map((g) => [g.id, g]))
const bank = JSON.parse(fs.readFileSync(CONCEPTS_PATH, 'utf8'))
const puzzles = fs.existsSync(PUZZLES_PATH)
  ? JSON.parse(fs.readFileSync(PUZZLES_PATH, 'utf8'))
  : {}

// recently-used game ids, date → Set
function recentGameIds(forDate) {
  const out = new Set()
  for (const [date, p] of Object.entries(puzzles)) {
    const diff = (new Date(`${forDate}T00:00:00Z`) - new Date(`${date}T00:00:00Z`)) / 86_400_000
    if (diff > 0 && diff <= REUSE_WINDOW_DAYS) {
      for (const t of p.tiles) out.add(t.id)
    }
  }
  return out
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const rand = () => Math.random()
const pickWeighted = (arr) => arr[Math.floor(Math.pow(rand(), 1.7) * arr.length)]
const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const decade = (g) => Math.floor(g.year / 10) * 10
const isGenreConcept = (c) => JSON.stringify(c.predicate).includes('"genres"')
const isYearConcept = (c) => JSON.stringify(c.predicate).includes('"year"')

/** Games in group A that surface-match group B without satisfying B's predicate. */
function surfaceLinks(groups) {
  const links = [] // { gameId, fromTier, toTier, via }
  for (const a of groups) {
    for (const b of groups) {
      if (a === b) continue
      for (const gid of a.gameIds) {
        const g = byId.get(gid)
        // genre link — only meaningful when B isn't genre-defined
        if (!isGenreConcept(b.concept)) {
          const bGenres = b.gameIds.map((id) => byId.get(id).genres)
          const shared = g.genres.filter((gen) => bGenres.filter((bg) => bg.includes(gen)).length >= 2)
          if (shared.length > 0) {
            links.push({ gameId: gid, fromTier: a.concept.tier, toTier: b.concept.tier, via: `genre:${shared[0]}` })
            continue
          }
        }
        // decade link — only meaningful when B isn't year-defined
        if (!isYearConcept(b.concept)) {
          const bDecades = b.gameIds.map((id) => decade(byId.get(id)))
          if (bDecades.filter((d) => d === decade(g)).length >= 2) {
            links.push({ gameId: gid, fromTier: a.concept.tier, toTier: b.concept.tier, via: `decade:${decade(g)}s` })
          }
        }
      }
    }
  }
  return links
}

function buildDay(date, used30) {
  const available = Object.fromEntries(
    TIERS.map((t) => [t, bank.concepts.filter((c) => c.tier === t && c.usedOn === null)]),
  )
  for (const t of TIERS) {
    if (available[t].length === 0) throw new Error(`Concept bank exhausted for tier ${t} on ${date}`)
  }

  let best = null

  for (let attempt = 0; attempt < MAX_DAY_ATTEMPTS; attempt++) {
    const chosen = TIERS.map((t) => available[t][Math.floor(rand() * available[t].length)])

    // pick 4 games per concept, popularity-biased, respecting freshness
    const taken = new Set()
    const groups = []
    let pickFailed = false
    for (const concept of chosen) {
      const pool = concept.gameIds.filter((id) => !used30.has(id) && !taken.has(id))
      if (pool.length < 4) { pickFailed = true; break }
      const picks = []
      const remaining = [...pool]
      while (picks.length < 4 && remaining.length > 0) {
        const idx = Math.floor(Math.pow(rand(), 1.7) * remaining.length)
        picks.push(remaining.splice(idx, 1)[0])
      }
      if (picks.length < 4) { pickFailed = true; break }
      picks.forEach((id) => taken.add(id))
      groups.push({ concept, gameIds: picks })
    }
    if (pickFailed) continue

    // UNAMBIGUOUS: every game satisfies exactly its own predicate
    let ambiguous = false
    for (const group of groups) {
      for (const gid of group.gameIds) {
        const g = byId.get(gid)
        for (const other of groups) {
          const satisfies = evaluatePredicate(other.concept.predicate, g)
          if (other === group ? !satisfies : satisfies) { ambiguous = true; break }
        }
        if (ambiguous) break
      }
      if (ambiguous) break
    }
    if (ambiguous) continue

    // MISDIRECTION: ≥3 distinct games with a surface link to another group
    const links = surfaceLinks(groups)
    const misdirectionCount = new Set(links.map((l) => l.gameId)).size
    const candidate = { groups, links, misdirectionCount }
    if (!best || misdirectionCount > best.misdirectionCount) best = candidate
    if (misdirectionCount >= MIN_MISDIRECTION) break
  }

  if (!best) throw new Error(`Could not assemble a valid puzzle for ${date}`)
  return best
}

// ── Assemble ─────────────────────────────────────────────────────────────────

const reviewLines = [
  `# Box Set review batch — ${START} (+${DAYS} days)`,
  '',
  'Pre-assembled puzzles for human review. Each game satisfies EXACTLY its',
  'own group predicate (machine-verified, re-verified on every test run).',
  'Review for: label quality, group "feel", misdirection, difficulty spread.',
  '',
]
let built = 0
const tierEmoji = { yellow: '🟨', green: '🟩', blue: '🟦', purple: '🟪' }

for (let i = 0; i < DAYS; i++) {
  const date = addDays(START, i)
  if (puzzles[date]) continue // never overwrite a committed day

  const used30 = recentGameIds(date)
  // also exclude games used in days built earlier in this run (window)
  for (let back = 1; back <= REUSE_WINDOW_DAYS; back++) {
    const prev = puzzles[addDays(date, -back)]
    if (prev) for (const t of prev.tiles) used30.add(t.id)
  }

  const { groups, links, misdirectionCount } = buildDay(date, used30)

  // retire concepts
  for (const { concept } of groups) {
    const banked = bank.concepts.find((c) => c.id === concept.id)
    banked.usedOn = date
  }

  const tiles = shuffle(
    groups.flatMap((grp) =>
      grp.gameIds.map((id) => ({ id, title: byId.get(id).title })),
    ),
  )

  puzzles[date] = {
    date,
    groups: groups.map(({ concept, gameIds }) => ({
      conceptId: concept.id,
      tier: concept.tier,
      label: concept.label,
      gameIds,
    })),
    tiles,
  }
  built++

  reviewLines.push(`## ${date}  (misdirection: ${misdirectionCount} games)`)
  for (const { concept, gameIds } of groups) {
    reviewLines.push(`- ${tierEmoji[concept.tier]} **${concept.label}** \`${concept.id}\``)
    for (const gid of gameIds) {
      const g = byId.get(gid)
      reviewLines.push(`    - ${g.title} (${g.year}, rank ${g.popularityRank})`)
    }
    const swaps = concept.gameIds.filter((id) => !gameIds.includes(id)).slice(0, 4)
    if (swaps.length) {
      reviewLines.push(`    - swap candidates: ${swaps.map((id) => byId.get(id).title).join(' · ')}`)
    }
  }
  if (links.length) {
    reviewLines.push('  - misdirection notes:')
    for (const l of links.slice(0, 8)) {
      reviewLines.push(`    - ${byId.get(l.gameId).title} (${l.fromTier}) reads like ${l.toTier} via ${l.via}`)
    }
  }
  reviewLines.push('')
}

// ── Write ────────────────────────────────────────────────────────────────────

fs.mkdirSync(path.dirname(PUZZLES_PATH), { recursive: true })
fs.mkdirSync(REVIEW_DIR, { recursive: true })

const ordered = Object.fromEntries(Object.entries(puzzles).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(PUZZLES_PATH, JSON.stringify(ordered, null, 2) + '\n')
fs.writeFileSync(CONCEPTS_PATH, JSON.stringify(bank, null, 2) + '\n')
const reviewPath = path.join(REVIEW_DIR, `review-${START}.md`)
fs.writeFileSync(reviewPath, reviewLines.join('\n') + '\n')

const dates = Object.keys(ordered)
console.log(`Built ${built} new puzzles (${dates.length} total committed)`)
console.log(`Coverage: ${dates[0]} → ${dates[dates.length - 1]}`)
console.log(`Review doc: ${path.relative(ROOT, reviewPath)}`)
const remaining = Object.fromEntries(TIERS.map((t) => [t, bank.concepts.filter((c) => c.tier === t && c.usedOn === null).length]))
console.log(`Bank remaining: ${JSON.stringify(remaining)}`)
