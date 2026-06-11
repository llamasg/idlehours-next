#!/usr/bin/env node
/**
 * Box Set concept-bank re-tier (June 2026 playtest: avg 1/4 groups solved).
 *
 * New tier semantics — title-visibility, not data-source:
 *   YELLOW — franchise groups + sight-obvious themes (casual, on sight)
 *   GREEN  — clear genre/theme groups, vague knowledge only
 *   BLUE   — wordplay (relocated from purple; most accessible, knowledge-free)
 *   PURPLE — compound/attribute concepts WITH a cultural angle only
 *   retired — usedOn: 'retired' (flagged, never deleted); bare release-year
 *             groups, bare decades, PEGI 3/7 (attribute, no cultural angle)
 *
 * Concept ids keep their old tier prefixes (committed puzzles reference ids;
 * the `tier` field is authoritative, the prefix is historical).
 * Committed puzzles keep the tiers they shipped with — this affects future
 * assembly only.
 *
 * Usage: node scripts/retier-box-set.mjs [--dry-run]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CONCEPTS_PATH = path.join(ROOT, 'src/app/play/box-set/data/concepts.json')
const DRY = process.argv.includes('--dry-run')

// ── Mapping ──────────────────────────────────────────────────────────────────

// Sight-obvious tag themes: the TITLES broadcast membership (WWE 2K…, Tony
// Hawk's…, Cooking Mama/Overcooked, Batman/Spider-Man).
const TO_YELLOW = new Set([
  'blue-tag-superhero',
  'blue-tag-wrestling',
  'blue-tag-skateboarding',
  'blue-tag-cooking',
])

// Cultural-knowledge curated concepts + attribute concepts with a cultural
// angle (console generations, launch windows, notoriety, acclaim, F2P).
const TO_PURPLE = new Set([
  // curated, knowledge-heavy
  'blue-curated-banned',
  'blue-curated-controversial-sequel',
  'blue-curated-dev-hell',
  'blue-curated-kickstarter',
  'blue-curated-pack-in',
  'blue-curated-remakes',
  'blue-curated-rough-launch',
  'blue-curated-solo-dev',
  'blue-curated-started-as-mods',
  'blue-curated-tga-goty',
  // attribute + cultural angle
  'blue-tag-multiple-endings',
  'blue-tag-atmospheric',
  'blue-tag-boss-fight',
  'blue-tag-free-to-play',
  'green-console-3ds',
  'green-console-ds',
  'green-console-gameboy',
  'green-console-gamecube',
  'green-console-n64',
  'green-console-ps1',
  'green-console-psp',
  'green-console-snes',
  'green-console-wii',
  'green-ps5-early',
  'green-critics-panned-modern',
  'green-opencritic-90s',
  'green-pegi-18',
  'green-price-free',
])

// Curated concepts solvable with vague knowledge → green.
const CURATED_TO_GREEN = new Set([
  'blue-curated-battle-royale',
  'blue-curated-mmo',
  'blue-curated-esports',
  'blue-curated-couch-coop',
])

// Hard-without-aha: bare calendar facts + PEGI bands with no cultural angle.
const RETIRE = new Set(['green-pegi-3', 'green-pegi-7'])
const RETIRE_PATTERNS = [/^green-year-/, /^yellow-decade-/]

function newTier(c) {
  if (RETIRE.has(c.id) || RETIRE_PATTERNS.some((re) => re.test(c.id))) return 'retired'
  if (TO_YELLOW.has(c.id)) return 'yellow'
  if (TO_PURPLE.has(c.id)) return 'purple'
  if (CURATED_TO_GREEN.has(c.id)) return 'green'
  if (c.type === 'wordplay') return 'blue' // all old purple
  if (c.id.startsWith('yellow-')) return 'green' // genre, genre×decade, arcade-era
  if (c.id.startsWith('blue-tag-')) return 'green' // clear themes, vague knowledge
  return null // unmapped — fail loudly
}

// ── Apply ────────────────────────────────────────────────────────────────────

const bank = JSON.parse(fs.readFileSync(CONCEPTS_PATH, 'utf8'))
const moves = {}
const unmapped = []

for (const c of bank.concepts) {
  const next = newTier(c)
  if (next === null) {
    unmapped.push(c.id)
    continue
  }
  const key = `${c.tier} → ${next}`
  moves[key] = (moves[key] ?? 0) + 1
  if (next === 'retired') {
    if (c.usedOn === null) c.usedOn = 'retired'
    // already-used concepts are spent either way; keep their date
  } else {
    c.tier = next
  }
}

if (unmapped.length) {
  console.error('UNMAPPED concepts (no rule matched, nothing written):')
  unmapped.forEach((id) => console.error('  ' + id))
  process.exit(1)
}

// ── Report ───────────────────────────────────────────────────────────────────

console.log('Moves:')
Object.entries(moves)
  .sort()
  .forEach(([k, n]) => console.log(`  ${k}: ${n}`))

const tiers = ['yellow', 'green', 'blue', 'purple']
console.log('\nPer-tier counts (total / unused & available):')
for (const t of tiers) {
  const all = bank.concepts.filter((c) => c.tier === t)
  const avail = all.filter((c) => c.usedOn === null)
  const thin = avail.length < 14 ? '  ⚠ THIN (under 14 days of buffer)' : ''
  console.log(`  ${t}: ${all.length} total, ${avail.length} available${thin}`)
}
const retired = bank.concepts.filter((c) => c.usedOn === 'retired').length
console.log(`  retired: ${retired}`)

if (!DRY) {
  fs.writeFileSync(CONCEPTS_PATH, JSON.stringify(bank, null, 2) + '\n')
  console.log('\nWritten ' + path.relative(ROOT, CONCEPTS_PATH))
} else {
  console.log('\n--dry-run: nothing written')
}
