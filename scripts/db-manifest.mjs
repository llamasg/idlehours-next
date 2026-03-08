#!/usr/bin/env node
/**
 * Database manifest — defines target genre/era distribution and audits the
 * current database against it. Used by igdb-pull.mjs in manifest mode.
 *
 * Usage:
 *   node scripts/db-manifest.mjs              — audit current database
 *   node scripts/db-manifest.mjs --gaps-only  — show only underrepresented areas
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// ── Manifest targets ────────────────────────────────────────────────────────

export const MANIFEST = {
  // Genre quotas — based on genres AS THEY APPEAR in games-db.ts
  // These are the normalised genre names from igdb-pull.mjs
  genreTargets: {
    'Adventure':    { min: 300, maxPercent: 20 },
    'RPG':          { min: 250, maxPercent: 18 },
    'Shooter':      { min: 200, maxPercent: 15 },
    'Strategy':     { min: 200, maxPercent: 15 },
    'Action':       { min: 200, maxPercent: 15 },
    'Platform':     { min: 150, maxPercent: 12 },
    'Puzzle':       { min: 120, maxPercent: 10 },
    'Indie':        { min: 200, maxPercent: 15 },
    'Simulator':    { min: 100, maxPercent: 8  },
    'Racing':       { min: 100, maxPercent: 8  },
    'Sport':        { min: 100, maxPercent: 8  },
    'Fighting':     { min: 80,  maxPercent: 6  },
    'Arcade':       { min: 80,  maxPercent: 6  },
    'Music':        { min: 40,  maxPercent: 3  },
  },

  // Era spread targets
  eraTargets: {
    'pre-1990':  { min: 75  },
    '1990-1999': { min: 250 },
    '2000-2009': { min: 400 },
    '2010-2019': { min: 600 },
    '2020-2029': { min: 300 },
  },

  // Tier thresholds — determines IGDB rating_count minimum per database size
  tiers: [
    { maxDbSize: 500,  minRatingCount: 5000, label: 'Tier 1 — Universal canon' },
    { maxDbSize: 2000, minRatingCount: 1000, label: 'Tier 2 — Genre essentials' },
    { maxDbSize: 5000, minRatingCount: 20,   label: 'Tier 3 — Enthusiast depth' },
    { maxDbSize: 10000, minRatingCount: 5,   label: 'Tier 4 — Long tail' },
  ],
}

// ── IGDB genre name → query filter mapping ──────────────────────────────────
// Maps our normalised genre names to IGDB genre IDs for targeted queries
// See: https://api-docs.igdb.com/#genre
export const IGDB_GENRE_IDS = {
  'Adventure':  31, // Adventure
  'RPG':        12, // Role-playing (RPG)
  'Shooter':    5,  // Shooter
  'Strategy':   15, // Strategy
  'Action':     null, // no single IGDB genre — too broad (mapped from hack-n-slash etc.)
  'Platform':   8,  // Platform
  'Puzzle':     9,  // Puzzle
  'Indie':      32, // Indie
  'Simulator':  13, // Simulator
  'Racing':     10, // Racing
  'Sport':      14, // Sport
  'Fighting':   4,  // Fighting
  'Arcade':     33, // Arcade
  'Music':      7,  // Music
}

// ── Era parsing ─────────────────────────────────────────────────────────────

function parseEra(era) {
  if (era === 'pre-1990') return [0, 1989]
  const parts = era.split('-')
  return [parseInt(parts[0]), parseInt(parts[1])]
}

// ── Get current tier ────────────────────────────────────────────────────────

export function getCurrentTier(dbSize) {
  for (const tier of MANIFEST.tiers) {
    if (dbSize < tier.maxDbSize) return tier
  }
  return MANIFEST.tiers[MANIFEST.tiers.length - 1]
}

// ── Audit the database ──────────────────────────────────────────────────────

export function auditDatabase(dbPath) {
  const content = fs.readFileSync(dbPath || path.resolve(ROOT, 'src/data/games-db.ts'), 'utf8')

  // Count total entries
  const idMatches = content.match(/id:\s*'/g) || []
  const totalGames = idMatches.length

  // Count genres
  const genreCounts = {}
  const genreRegex = /genres:\s*\[([^\]]*)\]/g
  let m
  while ((m = genreRegex.exec(content)) !== null) {
    const gs = m[1].match(/'([^']+)'/g)
    if (gs) gs.forEach(g => {
      const k = g.replace(/'/g, '')
      genreCounts[k] = (genreCounts[k] || 0) + 1
    })
  }

  // Count eras
  const eraCounts = {}
  for (const era of Object.keys(MANIFEST.eraTargets)) {
    eraCounts[era] = 0
  }
  const yearRegex = /year:\s*(\d+)/g
  while ((m = yearRegex.exec(content)) !== null) {
    const y = parseInt(m[1])
    if (y < 1990) eraCounts['pre-1990']++
    else if (y <= 1999) eraCounts['1990-1999']++
    else if (y <= 2009) eraCounts['2000-2009']++
    else if (y <= 2019) eraCounts['2010-2019']++
    else eraCounts['2020-2029']++
  }

  return { totalGames, genreCounts, eraCounts }
}

// ── Build priority queries ──────────────────────────────────────────────────

export function buildPriorityQueries(audit, requestedCount) {
  const { totalGames, genreCounts, eraCounts } = audit
  const tier = getCurrentTier(totalGames)
  const queries = []

  // 1. Genre gaps
  for (const [genre, target] of Object.entries(MANIFEST.genreTargets)) {
    const current = genreCounts[genre] || 0
    if (current < target.min) {
      const igdbGenreId = IGDB_GENRE_IDS[genre]
      if (igdbGenreId) {
        queries.push({
          type: 'genre-gap',
          genre,
          igdbGenreId,
          current,
          target: target.min,
          needed: Math.min(target.min - current, 50), // cap per query
          minRatingCount: Math.max(tier.minRatingCount, 10), // lower floor for gap-filling
          priority: current < target.min * 0.5 ? 'critical' : 'high',
        })
      }
    }
  }

  // 2. Era gaps
  for (const [era, target] of Object.entries(MANIFEST.eraTargets)) {
    const current = eraCounts[era] || 0
    if (current < target.min) {
      const [fromYear, toYear] = parseEra(era)
      queries.push({
        type: 'era-gap',
        era,
        fromYear,
        toYear,
        current,
        target: target.min,
        needed: Math.min(target.min - current, 50),
        minRatingCount: Math.max(tier.minRatingCount, 5), // even lower for old games
        priority: current < target.min * 0.5 ? 'critical' : 'high',
      })
    }
  }

  // Sort by priority (critical first) then by how far under target
  queries.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority === 'critical' ? -1 : 1
    const aRatio = a.current / a.target
    const bRatio = b.current / b.target
    return aRatio - bRatio
  })

  // 3. General fill for remaining slots
  const gapTotal = queries.reduce((sum, q) => sum + q.needed, 0)
  const remaining = requestedCount - gapTotal
  if (remaining > 0) {
    queries.push({
      type: 'general-fill',
      needed: remaining,
      minRatingCount: tier.minRatingCount,
      priority: 'normal',
    })
  }

  return { tier, queries }
}

// ── CLI: Audit mode ─────────────────────────────────────────────────────────

function main() {
  const gapsOnly = process.argv.includes('--gaps-only')
  const audit = auditDatabase()
  const { tier, queries } = buildPriorityQueries(audit, 200)

  console.log(`\n=== Database Audit ===`)
  console.log(`Total games: ${audit.totalGames}`)
  console.log(`Current tier: ${tier.label} (rating threshold: ${tier.minRatingCount})`)

  console.log(`\n=== Genre Distribution ===`)
  for (const [genre, target] of Object.entries(MANIFEST.genreTargets)) {
    const current = audit.genreCounts[genre] || 0
    const status = current >= target.min ? '✓' : current < target.min * 0.5 ? '✗✗' : '✗'
    const bar = '█'.repeat(Math.min(Math.round(current / target.min * 20), 20)) +
                '░'.repeat(Math.max(20 - Math.round(current / target.min * 20), 0))
    if (!gapsOnly || current < target.min) {
      console.log(`  ${status} ${genre.padEnd(12)} ${bar} ${current}/${target.min}`)
    }
  }

  console.log(`\n=== Era Distribution ===`)
  for (const [era, target] of Object.entries(MANIFEST.eraTargets)) {
    const current = audit.eraCounts[era] || 0
    const status = current >= target.min ? '✓' : current < target.min * 0.5 ? '✗✗' : '✗'
    const bar = '█'.repeat(Math.min(Math.round(current / target.min * 20), 20)) +
                '░'.repeat(Math.max(20 - Math.round(current / target.min * 20), 0))
    if (!gapsOnly || current < target.min) {
      console.log(`  ${status} ${era.padEnd(12)} ${bar} ${current}/${target.min}`)
    }
  }

  if (queries.length > 0) {
    console.log(`\n=== Priority Queries (next run) ===`)
    for (const q of queries) {
      if (q.type === 'genre-gap') {
        console.log(`  [${q.priority}] Fetch ${q.needed} ${q.genre} games (have ${q.current}/${q.target})`)
      } else if (q.type === 'era-gap') {
        console.log(`  [${q.priority}] Fetch ${q.needed} ${q.era} era games (have ${q.current}/${q.target})`)
      } else {
        console.log(`  [${q.priority}] General fill: ${q.needed} games (rating > ${q.minRatingCount})`)
      }
    }
  } else {
    console.log(`\nAll targets met! Database is well-balanced.`)
  }
}

main()
