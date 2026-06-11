#!/usr/bin/env node
/**
 * Box Set yellow-tier franchise concept seeder (June 2026 re-tier).
 *
 * Groups GAMES_DB by the `franchise` field (IGDB enrichment via
 * scripts/enrich-franchises.mjs) and banks every franchise with enough
 * qualifying members as a yellow concept:
 *   { field: 'franchise', op: 'eq', value: '<name>' }
 *
 * MEMBER GATE — resolves through answerPool precedence (hand verdict >
 * overrides > rank mapping; src/lib/answerPool.core.mjs). Yellow member
 * floor = answer tier 1 (easy win). Unjudged games fall back to the
 * rank-derived audit-band mapping. Re-runnable: re-gates cleanly whenever
 * src/data/curation/curation.json lands or changes.
 *
 * SEQUENCING — enrichment → curation pass → seeding banks for real.
 * Until curation.json contains hand verdicts this script is PREVIEW-ONLY
 * (prints the report, writes nothing). --force-bank overrides.
 *
 * Idempotent: existing concepts keep their usedOn; never un-retires.
 *
 * Usage: node scripts/seed-franchise-concepts.mjs [--dry-run] [--force-bank]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { loadGamesDb } from './lib/load-games-db.mjs'
import { resolveAnswerGrade, meetsTierFloor } from '../src/lib/answerPool.core.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'src/app/play/box-set/data/concepts.json')
const CURATION_PATH = path.join(ROOT, 'src/data/curation/curation.json')
const OVERRIDES_PATH = path.join(ROOT, 'src/data/curation/overrides.json')

const DRY = process.argv.includes('--dry-run')
const FORCE_BANK = process.argv.includes('--force-bank')

/** A franchise banks at this many qualifying (tier-floor) members. */
const MIN_MATCHES = 6
const STORE_CAP = 60

const db = await loadGamesDb()
const readJson = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {})
const curation = readJson(CURATION_PATH)
const overrides = readJson(OVERRIDES_PATH)

const handVerdicts = Object.values(curation).filter((e) => e.verdict !== 'auto-no').length
const previewOnly = handVerdicts === 0 && !FORCE_BANK

// ── Group by franchise, gate members through answerPool ─────────────────────

const byFranchise = new Map()
for (const g of db) {
  if (!g.franchise) continue
  if (!byFranchise.has(g.franchise)) byFranchise.set(g.franchise, [])
  byFranchise.get(g.franchise).push(g)
}

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// ── Owner review decisions (June 2026) — keep the seeder re-run-stable ───────

// IGDB splits Mario across two franchises; both read as "Mario games".
const LABEL_OVERRIDES = {
  'Mario': 'MARIO GAMES',
  'Mario Bros.': 'MARIO GAMES',
}

// Members excluded by hand (enforced in the predicate via notMemberOf, the
// house exclusion pattern — re-runs and the ambiguity check both respect it).
const MEMBER_EXCLUSIONS = {
  'Batman': ['multiversus'], // roster brawler, not a Batman game on sight
}

// Franchises superseded by the curated cross-franchise concepts below —
// never auto-banked, and any previously banked auto concept is removed
// (safe: usedOn null; a used concept would be left retired instead).
const SUPERSEDED_FRANCHISES = new Set(['Warcraft', 'Half-Life', 'Sid Meier', 'Civilization'])

// Cross-franchise curated concepts (blue-curated precedent: human-reviewed
// memberOf lists). memberOf carries the FULL member list — including sub-
// tier-1 games — so the assembler's UNAMBIGUOUS check machine-blocks any
// member from appearing in another group on the same day. The pick pool
// (gameIds) is still gated to the yellow floor.
//   NOTE: non-first-party lookalikes excluded from Valve (Black Mesa,
//   Portal Stories: Mel, Bridge Constructor Portal, the original DotA mod)
//   stay OUTSIDE the predicate — they remain a player-level ambiguity risk
//   the machine can't see; listed in the review output.
const CURATED_MERGES = [
  {
    id: 'yellow-curated-blizzard',
    label: 'BLIZZARD GAMES',
    franchises: ['Warcraft', 'Diablo', 'starcraft'],
    extraIds: ['overwatch', 'heroes-of-the-storm', 'blackthorne', 'the-lost-vikings', 'rock-n-roll-racing'],
    excludeIds: [],
  },
  {
    id: 'yellow-curated-valve',
    label: 'VALVE GAMES',
    franchises: ['Half-Life', 'Portal', 'Counter-Strike', 'Left 4 Dead', 'Dota', 'Team Fortress', 'Day Of Defeat', 'Alien Swarm'],
    extraIds: [],
    excludeIds: ['black-mesa', 'portal-stories-mel', 'bridge-constructor-portal', 'defense-of-the-ancients'],
  },
  {
    id: 'yellow-curated-sid-meier',
    label: 'SID MEIER GAMES', // owner: Sid Meier + Civilization combined pack
    franchises: ['Sid Meier', 'Civilization'],
    extraIds: [],
    excludeIds: [],
  },
]

const candidates = []
for (const [name, games] of byFranchise) {
  if (SUPERSEDED_FRANCHISES.has(name)) continue

  const excluded = new Set(MEMBER_EXCLUSIONS[name] ?? [])
  const members = games.filter((g) => !excluded.has(g.id))

  // Yellow member floor: answer tier 1, resolved with full precedence.
  const qualifying = members.filter((g) =>
    meetsTierFloor(resolveAnswerGrade(g.id, g.popularityRank, curation, overrides), 'yellow'),
  )
  if (qualifying.length < MIN_MATCHES) continue

  // Sight-obviousness signal for the reviewer: members whose title carries
  // the franchise name (IGDB membership is occasionally broader — Donkey
  // Kong sits in the 'Mario' franchise).
  const nameRe = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  const titleCarriers = qualifying.filter((g) => nameRe.test(g.title)).length

  const stored = [...qualifying]
    .sort((a, b) => (a.popularityRank ?? 9999) - (b.popularityRank ?? 9999))
    .slice(0, STORE_CAP)

  const basePredicate = { field: 'franchise', op: 'eq', value: name }
  candidates.push({
    concept: {
      id: `yellow-franchise-${slugify(name)}`,
      label: LABEL_OVERRIDES[name] ?? `${name.toUpperCase()} GAMES`,
      tier: 'yellow',
      type: 'procedural',
      predicate: excluded.size
        ? { all: [basePredicate, { field: 'id', op: 'notMemberOf', value: [...excluded] }] }
        : basePredicate,
      gameIds: stored.map((g) => g.id),
      usedOn: null,
    },
    name,
    total: members.length,
    qualifying: qualifying.length,
    titleCarriers,
  })
}

// Curated cross-franchise concepts
for (const merge of CURATED_MERGES) {
  const excluded = new Set(merge.excludeIds)
  const memberMap = new Map()
  for (const fr of merge.franchises) {
    for (const g of byFranchise.get(fr) ?? []) {
      if (!excluded.has(g.id)) memberMap.set(g.id, g)
    }
  }
  for (const id of merge.extraIds) {
    const g = db.find((x) => x.id === id)
    if (g) memberMap.set(id, g)
  }
  const members = [...memberMap.values()]
  const qualifying = members.filter((g) =>
    meetsTierFloor(resolveAnswerGrade(g.id, g.popularityRank, curation, overrides), 'yellow'),
  )
  if (qualifying.length < MIN_MATCHES) {
    console.warn(`SKIPPED curated merge ${merge.id}: only ${qualifying.length} qualifying members`)
    continue
  }
  const stored = [...qualifying]
    .sort((a, b) => (a.popularityRank ?? 9999) - (b.popularityRank ?? 9999))
    .slice(0, STORE_CAP)

  candidates.push({
    concept: {
      id: merge.id,
      label: merge.label,
      tier: 'yellow',
      type: 'curated',
      // FULL member list — ambiguity safety, not just the pick pool.
      predicate: { field: 'id', op: 'memberOf', value: members.map((g) => g.id).sort() },
      gameIds: stored.map((g) => g.id),
      usedOn: null,
    },
    name: merge.label,
    total: members.length,
    qualifying: qualifying.length,
    titleCarriers: qualifying.length, // curated: membership is the claim
  })
}

candidates.sort((a, b) => b.qualifying - a.qualifying)

// ── Merge into the bank (idempotent, preserves usedOn) ───────────────────────

const bank = JSON.parse(fs.readFileSync(OUT, 'utf8'))

// Drop auto concepts superseded by curated merges: delete if never used
// (usedOn null), retire otherwise — committed puzzles keep their history.
let removed = 0
for (const fr of SUPERSEDED_FRANCHISES) {
  const id = `yellow-franchise-${slugify(fr)}`
  const idx = bank.concepts.findIndex((c) => c.id === id)
  if (idx === -1) continue
  if (bank.concepts[idx].usedOn === null) {
    bank.concepts.splice(idx, 1)
  } else {
    bank.concepts[idx].usedOn = bank.concepts[idx].usedOn // keep date; spent either way
  }
  removed++
}

const existing = new Map(bank.concepts.map((c) => [c.id, c]))
let added = 0
let refreshed = 0

for (const { concept } of candidates) {
  const prior = existing.get(concept.id)
  if (prior) {
    prior.label = concept.label
    prior.predicate = concept.predicate
    prior.gameIds = concept.gameIds
    refreshed++
  } else {
    bank.concepts.push(concept)
    added++
  }
}

// ── Report (the human-review surface) ────────────────────────────────────────

console.log(
  `Member gate: answerPool precedence, yellow floor = tier 1. ` +
    `Hand verdicts in curation.json: ${handVerdicts}` +
    (previewOnly ? '  → PREVIEW-ONLY (no curation pass yet)' : ''),
)
console.log(`Franchises with ≥${MIN_MATCHES} qualifying members: ${candidates.length}`)
console.log(`Would add: ${added}, refresh existing: ${refreshed}, superseded removed: ${removed}\n`)
console.log('REVIEW LIST (carriers = members whose title contains the')
console.log('franchise name; low carrier ratios need a look):')
for (const c of candidates) {
  const ratio = `${c.titleCarriers}/${c.qualifying}`
  const flag = c.titleCarriers / c.qualifying < 0.7 ? '  ⚠ REVIEW' : ''
  console.log(`  ${c.name}: ${c.qualifying} qualifying (${c.total} total), carriers ${ratio}${flag}`)
}

const availableYellow = bank.concepts.filter((c) => c.tier === 'yellow' && c.usedOn === null).length
console.log(`\nYellow available after seeding: ${availableYellow}`)

if (DRY || previewOnly) {
  console.log(previewOnly && !DRY
    ? '\nPREVIEW-ONLY: run the /staging/curation pass first; banking requires hand verdicts (--force-bank to override).'
    : '\n--dry-run: nothing written')
} else {
  fs.writeFileSync(OUT, JSON.stringify(bank, null, 2) + '\n')
  console.log('Written ' + path.relative(ROOT, OUT))
}
