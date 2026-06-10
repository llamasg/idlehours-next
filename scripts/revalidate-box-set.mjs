#!/usr/bin/env node
/**
 * Box Set puzzle revalidation — run after editing the concept bank.
 * Checks every committed puzzle against the CURRENT bank + GAMES_DB
 * (same rules as tests/box-set-puzzles.test.ts) and, with --fix, removes
 * invalid dates and un-retires their surviving concepts so
 * assemble-box-set.mjs can rebuild them.
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

const fix = process.argv.includes('--fix')

const db = await loadGamesDb()
const byId = new Map(db.map((g) => [g.id, g]))
const bank = JSON.parse(fs.readFileSync(CONCEPTS_PATH, 'utf8'))
const conceptById = new Map(bank.concepts.map((c) => [c.id, c]))
const puzzles = JSON.parse(fs.readFileSync(PUZZLES_PATH, 'utf8'))

const invalid = []
for (const [date, puzzle] of Object.entries(puzzles)) {
  const problems = []
  for (const group of puzzle.groups) {
    const concept = conceptById.get(group.conceptId)
    if (!concept) {
      problems.push(`concept ${group.conceptId} no longer in bank`)
      continue
    }
    for (const gid of puzzle.groups.flatMap((g) => g.gameIds)) {
      const game = byId.get(gid)
      if (!game) { problems.push(`game ${gid} missing`); continue }
      const satisfies = evaluatePredicate(concept.predicate, game)
      const belongs = group.gameIds.includes(gid)
      if (belongs !== satisfies) {
        problems.push(`${gid} ${belongs ? 'no longer satisfies' : 'now also satisfies'} ${group.conceptId}`)
      }
    }
  }
  if (problems.length) invalid.push({ date, problems })
}

if (invalid.length === 0) {
  console.log(`All ${Object.keys(puzzles).length} committed puzzles still valid.`)
  process.exit(0)
}

for (const { date, problems } of invalid) {
  console.log(`INVALID ${date}:`)
  for (const p of [...new Set(problems)].slice(0, 6)) console.log(`  - ${p}`)
}

if (!fix) {
  console.log('\nRun with --fix to remove invalid dates and un-retire their concepts,')
  console.log('then rebuild each with: node scripts/assemble-box-set.mjs --start <date> --days 1')
  process.exit(1)
}

for (const { date } of invalid) {
  const conceptIds = puzzles[date].groups.map((g) => g.conceptId)
  delete puzzles[date]
  for (const cid of conceptIds) {
    const c = conceptById.get(cid)
    if (c && c.usedOn === date) c.usedOn = null
  }
}
fs.writeFileSync(PUZZLES_PATH, JSON.stringify(puzzles, null, 2) + '\n')
fs.writeFileSync(CONCEPTS_PATH, JSON.stringify(bank, null, 2) + '\n')
console.log(`\nRemoved ${invalid.length} invalid date(s): ${invalid.map((i) => i.date).join(', ')}`)
