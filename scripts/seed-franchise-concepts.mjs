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

const candidates = []
for (const [name, games] of byFranchise) {
  // Yellow member floor: answer tier 1, resolved with full precedence.
  const qualifying = games.filter((g) =>
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

  candidates.push({
    concept: {
      id: `yellow-franchise-${slugify(name)}`,
      label: `${name.toUpperCase()} GAMES`,
      tier: 'yellow',
      type: 'procedural',
      predicate: { field: 'franchise', op: 'eq', value: name },
      gameIds: stored.map((g) => g.id),
      usedOn: null,
    },
    name,
    total: games.length,
    qualifying: qualifying.length,
    titleCarriers,
  })
}

candidates.sort((a, b) => b.qualifying - a.qualifying)

// ── Merge into the bank (idempotent, preserves usedOn) ───────────────────────

const bank = JSON.parse(fs.readFileSync(OUT, 'utf8'))
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
console.log(`Would add: ${added}, refresh existing: ${refreshed}\n`)
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
