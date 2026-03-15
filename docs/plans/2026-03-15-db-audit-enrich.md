# Database Audit, Dedup & IGDB Enrichment — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deduplicate ~80 slug-collision entries from games-db.ts, re-fetch correct IGDB cover images for all ~4,000 games, assign continuous popularity ranks, and update Street Date to use the full game pool.

**Architecture:** A single Node script (`scripts/enrich-games-db.mjs`) handles dedup + IGDB enrichment with a JSON checkpoint file for resumability. After enrichment, update the Street Date selection logic to cycle through the full pool instead of a fixed 5 games per year.

**Tech Stack:** Node.js ESM script, IGDB API (via Twitch OAuth), games-db.ts (TypeScript data file)

---

### Task 1: Build the Enrichment Script — Dedup Phase

**Files:**
- Create: `scripts/enrich-games-db.mjs`

**Step 1: Create the script with env loading, helpers, and dedup logic**

```js
// scripts/enrich-games-db.mjs
// Deduplicates games-db.ts, enriches all games with correct IGDB covers
// and popularity data. Uses checkpoint file for resumability.
//
// Usage: node scripts/enrich-games-db.mjs
// Requires: TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET in .env.local

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CHECKPOINT_PATH = path.join(__dirname, '.enrich-checkpoint.json')
const GAMES_DB_PATH = path.join(ROOT, 'src/data/games-db.ts')

// ── Load env ────────────────────────────────────────────────────────────────

const envPath = path.resolve(ROOT, '.env.local')
if (!fs.existsSync(envPath)) {
  console.error('ERROR: .env.local not found at', envPath)
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  const match = line.match(/^([A-Z_]+)=(.*)$/)
  if (match) env[match[1]] = match[2].trim()
}

const CLIENT_ID = env.TWITCH_CLIENT_ID
const CLIENT_SECRET = env.TWITCH_CLIENT_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('ERROR: TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be set in .env.local')
  process.exit(1)
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function escapeStr(s) {
  if (s === null) return 'null'
  return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"
}

function formatArray(arr) {
  if (!arr || arr.length === 0) return '[]'
  return '[' + arr.map(s => escapeStr(s)).join(', ') + ']'
}

// ── Parse games-db.ts ───────────────────────────────────────────────────────

function parseGamesDB() {
  const content = fs.readFileSync(GAMES_DB_PATH, 'utf8')
  const exportMatch = content.match(/export\s+const\s+GAMES_DB[^=]*=\s*\[/)
  if (!exportMatch) throw new Error('Cannot find GAMES_DB export')

  const arrayStart = content.indexOf('[', exportMatch.index)
  // Find the matching closing bracket
  let depth = 0
  let endIdx = -1
  for (let i = arrayStart; i < content.length; i++) {
    if (content[i] === '[') depth++
    else if (content[i] === ']') {
      depth--
      if (depth === 0) { endIdx = i; break }
    }
  }
  if (endIdx === -1) throw new Error('Cannot find closing bracket')

  let arrayStr = content.slice(arrayStart, endIdx + 1)
  arrayStr = arrayStr.replace(/\/\/[^\n]*/g, '') // strip comments
  arrayStr = arrayStr.replace(/\/\*[\s\S]*?\*\//g, '') // strip block comments

  const fn = new Function(`return ${arrayStr}`)
  return fn()
}

// ── Dedup logic ─────────────────────────────────────────────────────────────

function richness(g) {
  let score = 0
  if (g.igdbImageId) score += 10
  if (g.launchPriceUsd !== null) score += 5
  if (g.popularityRank !== null) score += 5
  if (g.vibe) score += 3
  if (g.genres?.length) score += 2
  if (g.platforms?.length) score += 2
  if (g.openCritic !== null) score += 1
  if (g.pegi !== null) score += 1
  if (g.tags?.length) score += 1
  return score
}

function dedup(games) {
  // Group by lowercase title + year
  const groups = new Map()
  for (const g of games) {
    const key = `${g.title.toLowerCase().trim()}|||${g.year}`
    const arr = groups.get(key) || []
    arr.push(g)
    groups.set(key, arr)
  }

  const result = []
  let removedCount = 0

  for (const [, entries] of groups) {
    if (entries.length === 1) {
      result.push(entries[0])
      continue
    }

    // Sort by richness descending — winner is first
    entries.sort((a, b) => richness(b) - richness(a))
    const winner = { ...entries[0] }

    // Merge unique fields from losers
    for (let i = 1; i < entries.length; i++) {
      const loser = entries[i]
      if (!winner.igdbImageId && loser.igdbImageId) winner.igdbImageId = loser.igdbImageId
      if (winner.launchPriceUsd === null && loser.launchPriceUsd !== null) winner.launchPriceUsd = loser.launchPriceUsd
      if (winner.popularityRank === null && loser.popularityRank !== null) winner.popularityRank = loser.popularityRank
      if (!winner.vibe && loser.vibe) winner.vibe = loser.vibe
      if (!winner.openCritic && loser.openCritic) winner.openCritic = loser.openCritic
      if (!winner.pegi && loser.pegi) winner.pegi = loser.pegi
      if (winner.genres.length === 0 && loser.genres?.length) winner.genres = loser.genres
      if (winner.platforms.length === 0 && loser.platforms?.length) winner.platforms = loser.platforms
      if (winner.tags.length === 0 && loser.tags?.length) winner.tags = loser.tags
      removedCount++
    }

    result.push(winner)
  }

  console.log(`Dedup: removed ${removedCount} duplicates, ${result.length} games remain`)
  return result
}

// ── Twitch OAuth ────────────────────────────────────────────────────────────

async function getTwitchToken() {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' },
  )
  if (!res.ok) throw new Error(`Twitch auth failed (${res.status}): ${await res.text()}`)
  const data = await res.json()
  return data.access_token
}

// ── IGDB queries ────────────────────────────────────────────────────────────

async function queryIGDB(token, endpoint, body, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
        method: 'POST',
        headers: {
          'Client-ID': CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain',
        },
        body,
      })

      if (res.status === 429 || res.status >= 500) {
        if (attempt < retries) {
          const backoff = 2000 * Math.pow(2, attempt)
          console.warn(`  IGDB ${res.status}, retry ${attempt + 1}/${retries} in ${backoff / 1000}s...`)
          await sleep(backoff)
          continue
        }
      }

      if (!res.ok) {
        const text = await res.text()
        console.warn(`  IGDB ${endpoint} failed (${res.status}): ${text}`)
        return null
      }

      return await res.json()
    } catch (err) {
      if (attempt < retries) {
        await sleep(2000 * Math.pow(2, attempt))
        continue
      }
      console.warn(`  IGDB ${endpoint} network error: ${err.message}`)
      return null
    }
  }
  return null
}

// ── Search IGDB for a game ──────────────────────────────────────────────────

async function searchGame(token, title, year) {
  const startTs = Math.floor(new Date(`${year}-01-01T00:00:00Z`).getTime() / 1000)
  const endTs = Math.floor(new Date(`${year + 1}-01-01T00:00:00Z`).getTime() / 1000)

  // Try exact search first
  const searchQuery = `
    search "${title.replace(/"/g, '\\"')}";
    where first_release_date >= ${startTs}
      & first_release_date < ${endTs}
      & cover != null;
    fields name, cover, total_rating_count;
    limit 5;
  `

  const results = await queryIGDB(token, 'games', searchQuery)
  if (!results || results.length === 0) return null

  // Prefer exact title match (case-insensitive)
  const titleLower = title.toLowerCase()
  const exact = results.find(r => r.name.toLowerCase() === titleLower)
  const best = exact || results[0]

  // Fetch cover
  if (!best.cover) return { igdbImageId: null, igdbRatingCount: best.total_rating_count || 0 }

  const coverResults = await queryIGDB(token, 'covers', `fields image_id; where id = ${best.cover}; limit 1;`)
  await sleep(260)

  const imageId = coverResults?.[0]?.image_id || null

  return {
    igdbImageId: imageId,
    igdbRatingCount: best.total_rating_count || 0,
  }
}

// ── Checkpoint ──────────────────────────────────────────────────────────────

function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_PATH)) {
    return JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf8'))
  }
  return { _meta: { totalProcessed: 0, lastUpdated: null } }
}

function saveCheckpoint(cp) {
  cp._meta.lastUpdated = new Date().toISOString()
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(cp, null, 2), 'utf8')
}

// ── Write games-db.ts ───────────────────────────────────────────────────────

function writeGamesDB(games) {
  function formatEntry(g) {
    const lines = []
    lines.push('  {')
    lines.push(`    id: ${escapeStr(g.id)},`)
    lines.push(`    title: ${escapeStr(g.title)},`)
    lines.push(`    year: ${g.year},`)
    lines.push(`    genres: ${formatArray(g.genres)},`)
    lines.push(`    platforms: ${formatArray(g.platforms)},`)
    lines.push(`    multiplayer: ${g.multiplayer},`)
    lines.push(`    pegi: ${g.pegi === null ? 'null' : g.pegi},`)
    lines.push(`    openCritic: ${g.openCritic === null ? 'null' : g.openCritic},`)
    lines.push(`    vibe: ${escapeStr(g.vibe)},`)
    lines.push(`    tags: ${formatArray(g.tags)},`)
    lines.push(`    igdbImageId: ${escapeStr(g.igdbImageId)},`)
    lines.push(`    launchPriceUsd: ${g.launchPriceUsd === null ? 'null' : g.launchPriceUsd},`)
    lines.push(`    popularityRank: ${g.popularityRank === null ? 'null' : g.popularityRank},`)
    lines.push('  },')
    return lines.join('\n')
  }

  const output = `// src/data/games-db.ts
// Unified Idle Hours game database — single source of truth for all games.
// Generated by scripts/enrich-games-db.mjs — regenerate after adding data sources.

export interface GameEntry {
  id: string
  title: string
  year: number
  genres: string[]
  platforms: string[]
  multiplayer: boolean
  pegi: number | null
  openCritic: number | null
  vibe: string | null
  tags: string[]
  igdbImageId: string | null
  launchPriceUsd: number | null
  popularityRank: number | null
}

// @ts-ignore — array literal exceeds TS union complexity limit at ~1400+ entries
export const GAMES_DB: GameEntry[] = [
${games.map(formatEntry).join('\n')}
]

// ── Blitz utilities ─────────────────────────────────────────────────────────

export function getBlitzPool(tag: string): GameEntry[] {
  return GAMES_DB.filter(g => g.tags.includes(tag))
}

export function getBlitzPoolSize(tag: string): number {
  return getBlitzPool(tag).length
}
`

  fs.writeFileSync(GAMES_DB_PATH, output, 'utf8')
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // Phase 1: Load and dedup
  console.log('=== Phase 1: Deduplication ===\n')
  const rawGames = parseGamesDB()
  console.log(`Loaded ${rawGames.length} games from games-db.ts`)
  const games = dedup(rawGames)

  // Phase 2: IGDB enrichment
  console.log('\n=== Phase 2: IGDB Enrichment ===\n')
  console.log('Authenticating with Twitch...')
  const token = await getTwitchToken()
  console.log('Authenticated.\n')

  const checkpoint = loadCheckpoint()
  const total = games.length
  let processed = checkpoint._meta.totalProcessed
  let enriched = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < games.length; i++) {
    const game = games[i]

    // Skip if already in checkpoint
    if (checkpoint[game.id]) {
      skipped++
      continue
    }

    const result = await searchGame(token, game.title, game.year)
    await sleep(260) // Rate limit: 4 req/sec

    if (result) {
      checkpoint[game.id] = result
      if (result.igdbImageId) {
        game.igdbImageId = result.igdbImageId
        enriched++
      } else {
        failed++
      }
    } else {
      checkpoint[game.id] = { igdbImageId: null, igdbRatingCount: 0 }
      failed++
    }

    processed++
    checkpoint._meta.totalProcessed = processed

    // Save checkpoint every 10 games
    if (processed % 10 === 0) {
      saveCheckpoint(checkpoint)
      const pct = ((processed / total) * 100).toFixed(1)
      console.log(`  [${processed}/${total}] ${pct}% — enriched: ${enriched}, failed: ${failed}, skipped: ${skipped}`)
    }
  }

  // Final checkpoint save
  saveCheckpoint(checkpoint)
  console.log(`\nEnrichment complete: ${enriched} enriched, ${failed} no match, ${skipped} skipped (cached)`)

  // Apply cached results to games that were skipped
  for (const game of games) {
    const cached = checkpoint[game.id]
    if (cached && cached.igdbImageId) {
      game.igdbImageId = cached.igdbImageId
    }
  }

  // Phase 3: Assign popularity ranks per year
  console.log('\n=== Phase 3: Popularity Ranking ===\n')

  const byYear = new Map()
  for (const g of games) {
    const arr = byYear.get(g.year) || []
    arr.push(g)
    byYear.set(g.year, arr)
  }

  for (const [year, yearGames] of byYear) {
    // Sort by IGDB rating count descending (from checkpoint)
    yearGames.sort((a, b) => {
      const aCount = checkpoint[a.id]?.igdbRatingCount || 0
      const bCount = checkpoint[b.id]?.igdbRatingCount || 0
      return bCount - aCount
    })

    // Assign ranks 1-N (1 = most popular)
    for (let i = 0; i < yearGames.length; i++) {
      yearGames[i].popularityRank = i + 1
    }
  }

  const rankedCount = games.filter(g => g.popularityRank !== null).length
  console.log(`Assigned popularity ranks to ${rankedCount} games across ${byYear.size} years`)

  // Phase 4: Write output
  console.log('\n=== Phase 4: Writing games-db.ts ===\n')

  // Sort by year, then by popularityRank within year
  games.sort((a, b) => a.year - b.year || (a.popularityRank || 999) - (b.popularityRank || 999))

  writeGamesDB(games)

  const withImages = games.filter(g => g.igdbImageId).length
  const withPrices = games.filter(g => g.launchPriceUsd !== null).length
  console.log(`Written ${games.length} games to games-db.ts`)
  console.log(`  With images: ${withImages}`)
  console.log(`  With prices: ${withPrices}`)
  console.log(`  With ranks: ${rankedCount}`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
```

**Step 2: Run dedup only (quick sanity check)**

Before running the full enrichment, test that parsing and dedup work:

```bash
# Temporarily add a return after dedup to test just Phase 1
node scripts/enrich-games-db.mjs
```

Expected: `Dedup: removed ~80 duplicates, ~3970 games remain`

**Step 3: Commit the script**

```bash
git add scripts/enrich-games-db.mjs
git commit -m "feat: add enrich-games-db script with dedup + IGDB enrichment"
```

---

### Task 2: Run the Enrichment Script

**Step 1: Run the full script**

```bash
node scripts/enrich-games-db.mjs
```

This will take ~35-60 minutes. Progress is printed every 10 games and checkpointed. If interrupted, re-run and it resumes from the checkpoint.

Expected output at completion:
```
Phase 1: removed ~80 duplicates
Phase 2: ~3000+ enriched, some failures
Phase 3: popularity ranks assigned
Phase 4: games-db.ts written
```

**Step 2: Verify the output**

```bash
# Check game count
grep -c "^  {" src/data/games-db.ts

# Spot-check a known bad image — should now be correct
grep -A2 "super-mario-bros-deluxe" src/data/games-db.ts | grep igdbImageId

# Check no duplicate IDs remain
node -e "
const fs = require('fs');
const c = fs.readFileSync('src/data/games-db.ts','utf8');
const ids = [...c.matchAll(/id: '([^']+)'/g)].map(m=>m[1]);
const dupes = ids.filter((id,i) => ids.indexOf(id) !== i);
console.log('Duplicate IDs:', dupes.length ? dupes : 'none');
"
```

**Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

**Step 4: Commit the enriched database**

```bash
git add src/data/games-db.ts
git commit -m "data: deduplicate games-db and enrich with correct IGDB covers + popularity"
```

---

### Task 3: Update Street Date to Use Full Game Pool

**Files:**
- Modify: `src/app/play/street-date/data/games.ts`
- Modify: `src/app/play/street-date/lib/roundUtils.ts`
- Modify: `src/app/play/street-date/lib/dateUtils.ts`

**Step 1: Update the Street Date game filter**

The filter currently requires `popularityRank !== null`. Since all games now have a rank, the effective filter is just `igdbImageId !== null`.

Update `src/app/play/street-date/data/games.ts`:

```ts
// Street Date — filtered view of the shared Idle Hours game database.

import { GAMES_DB, type GameEntry } from '@/data/games-db'

export type StreetDateGame = GameEntry & {
  igdbImageId: string
  popularityRank: number
}

export const GAMES: StreetDateGame[] = GAMES_DB.filter(
  (g): g is StreetDateGame =>
    g.igdbImageId !== null &&
    g.popularityRank !== null
)
```

No change needed — it already filters correctly. The difference is that after enrichment, ~3,200 games will pass the filter instead of ~179.

**Step 2: Rewrite `roundUtils.ts` for full pool cycling**

Replace `src/app/play/street-date/lib/roundUtils.ts`:

```ts
// src/app/play/street-date/lib/roundUtils.ts
// Street Date — round-level helpers (full pool cycling)

import { GAMES, type StreetDateGame } from '../data/games'

/**
 * Deterministic seeded shuffle using a simple LCG PRNG.
 * Same seed always produces same order.
 */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr]
  let s = seed
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    const j = s % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Return 5 games for a given year and cycle number.
 *
 * Games are sorted into difficulty tiers by popularityRank, then
 * 5 are picked at spread-out indices offset by the cycle number.
 * This ensures each cycle through the 36-year rotation shows
 * different games.
 *
 * @param year - The answer year
 * @param cycle - How many times we've looped through all years (0-indexed)
 */
export function getGamesForYear(year: number, cycle: number = 0): StreetDateGame[] {
  const yearGames = GAMES
    .filter(g => g.year === year)
    .sort((a, b) => a.popularityRank - b.popularityRank)

  if (yearGames.length === 0) return []
  if (yearGames.length <= 5) return yearGames

  // Shuffle deterministically per year so tiers aren't always the same order
  const shuffled = seededShuffle(yearGames, year * 7919 + cycle * 104729)

  // Pick 5 at spread-out positions
  const step = shuffled.length / 5
  const picked: StreetDateGame[] = []
  for (let i = 0; i < 5; i++) {
    const idx = Math.floor(i * step) % shuffled.length
    picked.push(shuffled[idx])
  }

  // Sort picked by popularityRank (obscure first, iconic last) for reveal order
  return picked.sort((a, b) => b.popularityRank - a.popularityRank)
}
```

**Step 3: Update `dateUtils.ts` to pass cycle number**

In `src/app/play/street-date/lib/dateUtils.ts`, update `getGamesForDate`:

```ts
/**
 * The 5 StreetDateGame entries for this date's puzzle.
 * Uses the cycle number to pick different games each time
 * a year repeats in the 36-day rotation.
 */
export function getGamesForDate(dateStr: string): StreetDateGame[] {
  const days = getDaysSinceEpoch(dateStr)
  const cycle = Math.floor(days / VALID_YEARS.length)
  return getGamesForYear(getYearForDate(dateStr), cycle)
}
```

**Step 4: TypeScript check + build**

```bash
npx tsc --noEmit
npm run build
```

**Step 5: Commit**

```bash
git add src/app/play/street-date/lib/roundUtils.ts src/app/play/street-date/lib/dateUtils.ts
git commit -m "feat: Street Date uses full game pool with cycle-based selection"
```

---

### Task 4: Verify and Push

**Step 1: Run a full build**

```bash
npm run build
```

**Step 2: Spot-check Street Date selection**

```bash
npx tsx -e "
import { getGamesForDate } from './src/app/play/street-date/lib/dateUtils'
const w = (s) => process.stderr.write(s + '\n')
// Check first two cycles of year 1990 (day 0 and day 36)
w('Day 0 (cycle 0):')
for (const g of getGamesForDate('2026-03-02')) w('  ' + g.title)
w('Day 36 (cycle 1):')
for (const g of getGamesForDate('2026-04-07')) w('  ' + g.title)
w('Day 72 (cycle 2):')
for (const g of getGamesForDate('2026-05-13')) w('  ' + g.title)
"
```

Expected: Three different sets of 5 games, all from year 1990.

**Step 3: Push**

```bash
git push origin main
```
