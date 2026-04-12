#!/usr/bin/env node
/**
 * scripts/repair-corrupted-entries.mjs
 *
 * Repairs ~180 games-db.ts entries corrupted by the dedup merge.
 * Identifies corruption via decade-tag mismatch, then:
 *   1. Re-pulls tags, pegi, openCritic from IGDB
 *   2. Applies era-appropriate default pricing
 *   3. Regenerates vibes via Anthropic Claude
 *   4. Writes repaired entries back into games-db.ts
 *
 * Usage: node scripts/repair-corrupted-entries.mjs [--dry-run] [--skip-vibes]
 * Requires: TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, ANTHROPIC_API_KEY in .env.local
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

const GAMES_DB_PATH = path.resolve(ROOT, 'src/data/games-db.ts')
const CHECKPOINT_PATH = path.join(__dirname, '.repair-checkpoint.json')

const DRY_RUN = process.argv.includes('--dry-run')
const SKIP_VIBES = process.argv.includes('--skip-vibes')
const VIBES_ONLY = process.argv.includes('--vibes-only')

// ── Env loading ────────────────────────────────────────────────────────────

function loadEnv() {
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
  return env
}

// ── Twitch OAuth ────────────────────────────────────────────────────────────

async function getTwitchToken(clientId, clientSecret) {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: 'POST' },
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Twitch auth failed (${res.status}): ${text}`)
  }
  const data = await res.json()
  return data.access_token
}

// ── IGDB query helper ───────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function queryIGDB(token, clientId, endpoint, body, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body,
    })

    if (res.ok) {
      const text = await res.text()
      try {
        return JSON.parse(text)
      } catch {
        console.error(`IGDB response not JSON:`, text.slice(0, 500))
        return []
      }
    }

    const status = res.status
    if ((status === 429 || status >= 500) && attempt < retries) {
      const delay = 1000 * Math.pow(2, attempt - 1)
      console.warn(`  IGDB ${endpoint} returned ${status}, retrying in ${delay}ms (attempt ${attempt}/${retries})`)
      await sleep(delay)
      continue
    }

    const text = await res.text()
    throw new Error(`IGDB ${endpoint} query failed (${status}): ${text}`)
  }
}

// ── Parse games-db.ts ───────────────────────────────────────────────────────

function parseGamesDb() {
  const content = fs.readFileSync(GAMES_DB_PATH, 'utf8')

  const exportMatch = content.match(/export\s+const\s+GAMES_DB[^=]*=\s*\[/)
  if (!exportMatch) throw new Error('Cannot find GAMES_DB export in games-db.ts')

  const arrayStart = content.indexOf('[', exportMatch.index)

  const blitzMarker = content.lastIndexOf('\n// ── Blitz utilities')
  let endIdx
  if (blitzMarker !== -1) {
    endIdx = content.lastIndexOf(']', blitzMarker)
  } else {
    const funcMatch = content.lastIndexOf('\nexport function ')
    endIdx = funcMatch !== -1
      ? content.lastIndexOf(']', funcMatch)
      : content.lastIndexOf(']')
  }

  if (arrayStart === -1 || endIdx === -1) throw new Error('Cannot find array bounds in games-db.ts')

  let arrayStr = content.slice(arrayStart, endIdx + 1)
  arrayStr = arrayStr.replace(/\/\/[^\n]*/g, '')
  arrayStr = arrayStr.replace(/\/\*[\s\S]*?\*\//g, '')

  const fn = new Function(`return ${arrayStr}`)
  const games = fn()

  return { games, fullContent: content }
}

// ── Tag inference (from igdb-pull.mjs) ──────────────────────────────────────

function inferTags(title, year, genres, keywords) {
  const tags = []
  const t = title.toLowerCase()

  // Decade tag
  const decade = Math.floor(year / 10) * 10
  tags.push(`${decade}s`)

  // Lowercase genre tags
  for (const g of genres) {
    tags.push(g.toLowerCase())
  }

  // IGDB keywords (hyphenated)
  if (keywords) {
    for (const kw of keywords) {
      const name = kw.name || kw
      tags.push(name.toLowerCase().replace(/\s+/g, '-'))
    }
  }

  // Common franchise/series detection
  if (t.includes('mario')) tags.push('mario', 'nintendo', 'platformer')
  else if (t.includes('zelda')) tags.push('zelda', 'nintendo', 'adventure')
  else if (t.includes('pokemon') || t.includes('pokémon')) tags.push('pokemon', 'nintendo', 'rpg')
  else if (t.includes('final fantasy')) tags.push('final fantasy', 'rpg', 'square enix')
  else if (t.includes('call of duty') || t.includes('cod')) tags.push('call of duty', 'fps', 'shooter')
  else if (t.includes('halo')) tags.push('halo', 'fps', 'shooter', 'xbox')
  else if (t.includes('resident evil')) tags.push('resident evil', 'horror', 'survival')
  else if (t.includes('grand theft auto') || t.includes('gta')) tags.push('gta', 'open world', 'rockstar')
  else if (t.includes('metal gear')) tags.push('metal gear', 'stealth', 'action')
  else if (t.includes('sonic')) tags.push('sonic', 'sega', 'platformer')
  else if (t.includes('street fighter') || t.includes('mortal kombat') || t.includes('tekken')) tags.push('fighting')
  else if (t.includes('fifa') || t.includes('nba') || t.includes('madden') || t.includes('nhl')) tags.push('sports')
  else if (t.includes('need for speed') || t.includes('gran turismo') || t.includes('forza')) tags.push('racing')
  else if (t.includes('sim city') || t.includes('simcity') || t.includes('civilization')) tags.push('simulation', 'strategy')
  else if (t.includes('doom') || t.includes('quake') || t.includes('wolfenstein')) tags.push('fps', 'shooter', 'id software')
  else if (t.includes('castlevania') || t.includes('metroid')) tags.push('metroidvania', 'action')
  else if (t.includes('tomb raider')) tags.push('tomb raider', 'adventure', 'action')
  else if (t.includes('assassin')) tags.push('assassins creed', 'open world', 'action')
  else if (t.includes('dark souls') || t.includes('elden ring') || t.includes('bloodborne')) tags.push('soulslike', 'action', 'fromsoft')

  return [...new Set(tags)]
}

// ── PEGI normalisation (from igdb-pull.mjs) ──────────────────────────────────

const PEGI_RATING_MAP = { 1: 3, 2: 7, 3: 12, 4: 16, 5: 18 }
const ESRB_TO_PEGI = { 2: 3, 3: 3, 4: 7, 5: 12, 6: 16, 7: 18 }

function normalisePegi(ageRatings) {
  if (!ageRatings || ageRatings.length === 0) return null
  const pegi = ageRatings.find((r) => r.category === 2)
  if (pegi && PEGI_RATING_MAP[pegi.rating]) return PEGI_RATING_MAP[pegi.rating]
  const esrb = ageRatings.find((r) => r.category === 1)
  if (esrb && ESRB_TO_PEGI[esrb.rating]) return ESRB_TO_PEGI[esrb.rating]
  return null
}

// ── Identify corrupted entries ──────────────────────────────────────────────

function findCorruptedEntries(games) {
  const corrupted = []
  for (const game of games) {
    const expectedDecade = `${Math.floor(game.year / 10) * 10}s`
    const decadeTag = game.tags?.find((t) => /^\d{4}s$/.test(t))
    if (decadeTag && decadeTag !== expectedDecade) {
      corrupted.push(game)
    }
  }
  return corrupted
}

// ── Era-appropriate pricing ─────────────────────────────────────────────────

function getEraPrice(game) {
  const { year, genres, platforms } = game
  const genresLower = genres.map((g) => g.toLowerCase())
  const platsLower = platforms.map((p) => p.toLowerCase())

  // Free-to-play detection
  const freeSignals = ['mmo', 'browser', 'mobile']
  if (genresLower.some((g) => freeSignals.includes(g)) ||
      platsLower.some((p) => ['ios', 'android', 'browser'].includes(p))) {
    // Check if it's a major title that happens to be on mobile too
    const hasPCConsole = platsLower.some((p) =>
      ['pc', 'ps4', 'ps5', 'xbox one', 'xbox', 'switch', 'ps3', 'ps2'].includes(p)
    )
    if (!hasPCConsole) return 0
  }

  // Indie detection — smaller platforms, puzzle/indie genres
  const indieSignals = genresLower.includes('indie') ||
    (platsLower.length === 1 && platsLower.includes('pc')) ||
    genresLower.includes('puzzle')
  const isSmallTitle = indieSignals && !genresLower.includes('rpg') && !genresLower.includes('shooter')

  if (isSmallTitle) {
    if (year < 2005) return 19.99
    if (year < 2015) return 14.99
    return 19.99
  }

  // Handheld titles
  const handhelds = ['game boy', 'gba', 'ds', '3ds', 'psp', 'vita']
  if (platsLower.every((p) => handhelds.includes(p))) {
    if (year < 2005) return 29.99
    return 39.99
  }

  // Standard AAA pricing by era
  if (year < 1995) return 49.99
  if (year < 2005) return 49.99
  if (year < 2023) return 59.99
  return 69.99
}

// ── Checkpoint management ───────────────────────────────────────────────────

function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_PATH)) {
    return JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf8'))
  }
  return {}
}

function saveCheckpoint(checkpoint) {
  checkpoint._lastUpdated = new Date().toISOString()
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2), 'utf8')
}

// ── Phase 2: Re-pull from IGDB ──────────────────────────────────────────────

const IGDB_FIELDS = 'fields name, first_release_date, keywords.name, age_ratings.rating, age_ratings.category, total_rating;'

async function repullFromIGDB(corruptedGames, env) {
  const CLIENT_ID = env.TWITCH_CLIENT_ID
  const CLIENT_SECRET = env.TWITCH_CLIENT_SECRET

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('ERROR: TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be set in .env.local')
    process.exit(1)
  }

  console.log('\nPhase 2: Re-pulling data from IGDB...')
  console.log('Authenticating with Twitch...')
  const token = await getTwitchToken(CLIENT_ID, CLIENT_SECRET)
  console.log('Authenticated successfully')

  const checkpoint = loadCheckpoint()
  let processed = 0
  let skipped = 0

  for (let i = 0; i < corruptedGames.length; i++) {
    const game = corruptedGames[i]

    // Skip if already in checkpoint
    if (checkpoint[game.id]) {
      skipped++
      continue
    }

    const escapedTitle = game.title.replace(/"/g, '\\"')
    const yearStart = Math.floor(new Date(`${game.year}-01-01T00:00:00Z`).getTime() / 1000)
    const yearEnd = Math.floor(new Date(`${game.year + 1}-01-01T00:00:00Z`).getTime() / 1000)

    const searchQuery = `${IGDB_FIELDS} search "${escapedTitle}"; where first_release_date >= ${yearStart} & first_release_date < ${yearEnd}; limit 5;`

    try {
      const results = await queryIGDB(token, CLIENT_ID, 'games', searchQuery)

      if (!results || results.length === 0) {
        // Try broader search without year filter
        const broadQuery = `${IGDB_FIELDS} search "${escapedTitle}"; limit 5;`
        const broadResults = await queryIGDB(token, CLIENT_ID, 'games', broadQuery)
        await sleep(260)

        if (!broadResults || broadResults.length === 0) {
          console.log(`  [${i + 1}/${corruptedGames.length}] ${game.title} (${game.year}) — no IGDB match`)
          checkpoint[game.id] = { keywords: [], pegi: null, openCritic: null, matched: false }
        } else {
          const exactMatch = broadResults.find(
            (r) => r.name.toLowerCase().trim() === game.title.toLowerCase().trim(),
          )
          const bestMatch = exactMatch || broadResults[0]
          const matchLabel = exactMatch ? 'exact (broad)' : `fuzzy (broad): "${bestMatch.name}"`

          checkpoint[game.id] = {
            keywords: bestMatch.keywords || [],
            pegi: normalisePegi(bestMatch.age_ratings),
            openCritic: bestMatch.total_rating ? Math.round(bestMatch.total_rating) : null,
            matched: true,
            matchName: bestMatch.name,
          }
          console.log(`  [${i + 1}/${corruptedGames.length}] ${game.title} (${game.year}) — ${matchLabel}`)
        }
      } else {
        const exactMatch = results.find(
          (r) => r.name.toLowerCase().trim() === game.title.toLowerCase().trim(),
        )
        const bestMatch = exactMatch || results[0]
        const matchLabel = exactMatch ? 'exact' : `fuzzy: "${bestMatch.name}"`

        checkpoint[game.id] = {
          keywords: bestMatch.keywords || [],
          pegi: normalisePegi(bestMatch.age_ratings),
          openCritic: bestMatch.total_rating ? Math.round(bestMatch.total_rating) : null,
          matched: true,
          matchName: bestMatch.name,
        }
        console.log(`  [${i + 1}/${corruptedGames.length}] ${game.title} (${game.year}) — ${matchLabel}`)
      }
    } catch (err) {
      console.error(`  [${i + 1}/${corruptedGames.length}] ${game.title} (${game.year}) — ERROR: ${err.message}`)
      checkpoint[game.id] = { keywords: [], pegi: null, openCritic: null, matched: false }
    }

    processed++

    // Save checkpoint every 10
    if (processed % 10 === 0) {
      saveCheckpoint(checkpoint)
    }

    // Rate limit
    await sleep(260)
  }

  saveCheckpoint(checkpoint)
  console.log(`  Processed: ${processed}, Skipped (cached): ${skipped}`)

  return checkpoint
}

// ── Phase 3: Apply repairs ──────────────────────────────────────────────────

function applyIGDBRepairs(corruptedGames, checkpoint) {
  console.log('\nPhase 3: Applying IGDB repairs + era pricing...')
  const repairs = []

  for (const game of corruptedGames) {
    const cached = checkpoint[game.id]
    if (!cached) continue

    // Rebuild tags from IGDB keywords
    const newTags = inferTags(game.title, game.year, game.genres, cached.keywords || [])

    // Trim to max 10 useful tags (remove meta tags)
    const metaTags = ['steam', 'achievements', 'playstation-trophies', 'xbox-live', 'cloud-saves', 'leaderboards', 'controller-support', 'steam-trading-cards']
    const filteredTags = newTags.filter((t) => !metaTags.includes(t)).slice(0, 10)

    // Use IGDB pegi if available, else keep existing (it might still be valid)
    const newPegi = cached.pegi ?? game.pegi

    // Use IGDB openCritic if available
    const newOpenCritic = cached.openCritic ?? game.openCritic

    // Era-appropriate pricing
    const newPrice = getEraPrice(game)

    repairs.push({
      id: game.id,
      tags: filteredTags,
      pegi: newPegi,
      openCritic: newOpenCritic,
      launchPriceUsd: newPrice,
      // vibe will be filled in Phase 4
      vibe: null,
    })
  }

  console.log(`  Prepared repairs for ${repairs.length} entries`)
  return repairs
}

// ── Phase 4: Regenerate vibes via Claude ─────────────────────────────────────

async function regenerateVibes(repairs, corruptedGames, env) {
  if (SKIP_VIBES) {
    console.log('\nPhase 4: Skipping vibe regeneration (--skip-vibes)')
    return repairs
  }

  const ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY must be set in .env.local')
    process.exit(1)
  }

  console.log('\nPhase 4: Regenerating vibes via Claude...')

  // Build game lookup
  const gameMap = new Map()
  for (const g of corruptedGames) gameMap.set(g.id, g)

  // Batch in groups of 20
  const BATCH_SIZE = 20
  for (let i = 0; i < repairs.length; i += BATCH_SIZE) {
    const batch = repairs.slice(i, i + BATCH_SIZE)

    const gameDescriptions = batch.map((r, idx) => {
      const game = gameMap.get(r.id)
      return `${idx + 1}. ${game.title} (${game.year}, ${game.genres.join('/')}, ${game.platforms.join('/')})`
    }).join('\n')

    const prompt = `Generate a vibe for each game below. A vibe is a 3-6 word lowercase noun phrase that captures the gameplay feel. It must fit naturally in: "A [genre] game about [VIBE] released in [year]".

Rules:
- No articles at the start ("a", "the")
- No proper nouns from the game title (do not mention the game's name or character names from the title)
- Must be evocative and specific to that game's actual gameplay/theme
- Examples: "surviving alien horrors in space", "building medieval kingdoms", "racing through neon cities"

Games:
${gameDescriptions}

Respond with ONLY a JSON array of strings, one vibe per game in the SAME ORDER as listed above. No markdown, no explanation. Example:
["surviving alien horrors in space", "building medieval kingdoms"]`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        console.error(`  Claude API error (${res.status}): ${text}`)
        continue
      }

      const data = await res.json()
      const responseText = data.content[0].text.trim()

      // Parse JSON response — handle potential markdown wrapping
      let vibes
      try {
        const jsonStr = responseText.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
        vibes = JSON.parse(jsonStr)
      } catch (e) {
        console.error(`  Failed to parse Claude response for batch ${i / BATCH_SIZE + 1}:`, responseText.slice(0, 200))
        continue
      }

      // Apply vibes by index (same order as batch)
      let applied = 0
      for (let j = 0; j < Math.min(vibes.length, batch.length); j++) {
        if (typeof vibes[j] === 'string' && vibes[j].trim()) {
          batch[j].vibe = vibes[j].trim()
          applied++
        }
      }

      console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(repairs.length / BATCH_SIZE)}: ${applied} vibes generated`)
    } catch (err) {
      console.error(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} ERROR: ${err.message}`)
    }

    // Rate limit between batches
    await sleep(1000)
  }

  // Check for any missing vibes
  const missing = repairs.filter((r) => !r.vibe)
  if (missing.length > 0) {
    console.warn(`  WARNING: ${missing.length} entries still have null vibes`)
    for (const m of missing) {
      console.warn(`    - ${m.id}`)
    }
  }

  return repairs
}

// ── Phase 5: Write back to games-db.ts ──────────────────────────────────────

function escapeString(str) {
  if (str == null) return null
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function writeRepairs(repairs, allGames, skipFieldRepairs = false) {
  console.log('\nPhase 5: Writing repairs to games-db.ts...')

  if (!skipFieldRepairs) {
    // Build repair lookup
    const repairMap = new Map()
    for (const r of repairs) repairMap.set(r.id, r)

    // Apply repairs to game objects
    let applied = 0
    for (const game of allGames) {
      const repair = repairMap.get(game.id)
      if (!repair) continue

      game.tags = repair.tags
      game.pegi = repair.pegi
      game.openCritic = repair.openCritic
      game.launchPriceUsd = repair.launchPriceUsd
      if (repair.vibe) {
        game.vibe = repair.vibe
      }
      applied++
    }

    console.log(`  Applied ${applied} repairs`)
  }

  // Re-sort by year then popularityRank
  allGames.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    const rankA = a.popularityRank ?? 9999
    const rankB = b.popularityRank ?? 9999
    return rankA - rankB
  })

  // Write full file
  const header = `// src/data/games-db.ts
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
`

  function formatGame(game) {
    const lines = []
    lines.push(`  {`)
    lines.push(`    id: '${escapeString(game.id)}',`)
    lines.push(`    title: '${escapeString(game.title)}',`)
    lines.push(`    year: ${game.year},`)
    lines.push(`    genres: [${game.genres.map((g) => `'${escapeString(g)}'`).join(', ')}],`)
    lines.push(`    platforms: [${game.platforms.map((p) => `'${escapeString(p)}'`).join(', ')}],`)
    lines.push(`    multiplayer: ${game.multiplayer},`)
    lines.push(`    pegi: ${game.pegi === null || game.pegi === undefined ? 'null' : game.pegi},`)
    lines.push(`    openCritic: ${game.openCritic === null || game.openCritic === undefined ? 'null' : game.openCritic},`)
    lines.push(`    vibe: ${game.vibe == null ? 'null' : `'${escapeString(game.vibe)}'`},`)
    lines.push(`    tags: [${game.tags.map((t) => `'${escapeString(t)}'`).join(', ')}],`)
    lines.push(`    igdbImageId: ${game.igdbImageId == null ? 'null' : `'${escapeString(game.igdbImageId)}'`},`)
    lines.push(`    launchPriceUsd: ${game.launchPriceUsd === null || game.launchPriceUsd === undefined ? 'null' : game.launchPriceUsd},`)
    lines.push(`    popularityRank: ${game.popularityRank === null || game.popularityRank === undefined ? 'null' : game.popularityRank},`)
    lines.push(`  },`)
    return lines.join('\n')
  }

  const blitzSection = `
// ── Blitz utilities ─────────────────────────────────────────────────────────

export function getBlitzPool(tag: string): GameEntry[] {
  return GAMES_DB.filter(g => g.tags.includes(tag))
}

export function getBlitzPoolSize(tag: string): number {
  return getBlitzPool(tag).length
}
`

  const entries = allGames.map((g) => formatGame(g)).join('\n')
  const output = header + entries + '\n]\n' + blitzSection

  if (DRY_RUN) {
    console.log('  [DRY RUN] Would write to', GAMES_DB_PATH)
    console.log(`  [DRY RUN] Output size: ${output.length} characters`)
  } else {
    fs.writeFileSync(GAMES_DB_PATH, output, 'utf8')
    console.log(`  Written ${allGames.length} games to src/data/games-db.ts`)
  }
}

// ── Leaky vibe check ────────────────────────────────────────────────────────

function checkLeakyVibes(repairs, corruptedGames) {
  console.log('\nPhase 6: Checking for leaky vibes...')
  const gameMap = new Map()
  for (const g of corruptedGames) gameMap.set(g.id, g)

  const STOP_WORDS = new Set(['the', 'a', 'an', 'of', 'in', 'to', 'and', 'or', 'for', 'is', 'it', 'at', 'on', 'by', 'vs', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'])
  let leaks = 0

  for (const r of repairs) {
    if (!r.vibe) continue
    const game = gameMap.get(r.id)
    if (!game) continue

    const titleWords = game.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w))
    const vibeWords = r.vibe.toLowerCase().split(/\s+/)

    const leaked = titleWords.filter((tw) => vibeWords.some((vw) => vw.includes(tw)))
    if (leaked.length >= 2) {
      console.warn(`  LEAK: "${game.title}" → vibe "${r.vibe}" (leaked: ${leaked.join(', ')})`)
      leaks++
    }
  }

  if (leaks === 0) {
    console.log('  No leaky vibes found!')
  } else {
    console.warn(`  ${leaks} leaky vibes detected — may need manual review`)
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== repair-corrupted-entries.mjs ===\n')
  if (DRY_RUN) console.log('  [DRY RUN MODE — no files will be written]\n')

  const { games: allGames } = parseGamesDb()
  console.log(`  Parsed ${allGames.length} entries`)

  const env = loadEnv()

  // --vibes-only mode: use checkpoint to identify entries, skip IGDB, only regenerate vibes
  if (VIBES_ONLY) {
    console.log('\n  [VIBES-ONLY MODE — re-generating vibes for checkpoint entries]\n')

    const checkpoint = loadCheckpoint()
    const corruptedIds = new Set(Object.keys(checkpoint).filter((k) => k !== '_lastUpdated'))
    const corrupted = allGames.filter((g) => corruptedIds.has(g.id))
    console.log(`  Found ${corrupted.length} entries from checkpoint`)

    // Build repair objects (vibes only — keep existing tags/pegi/price)
    const repairs = corrupted.map((g) => ({
      id: g.id,
      tags: g.tags,
      pegi: g.pegi,
      openCritic: g.openCritic,
      launchPriceUsd: g.launchPriceUsd,
      vibe: null,
    }))

    await regenerateVibes(repairs, corrupted, env)
    checkLeakyVibes(repairs, corrupted)

    // Only write vibes — don't touch other fields
    console.log('\nWriting vibes to games-db.ts...')
    const repairMap = new Map()
    for (const r of repairs) if (r.vibe) repairMap.set(r.id, r)

    let applied = 0
    for (const game of allGames) {
      const repair = repairMap.get(game.id)
      if (repair) {
        game.vibe = repair.vibe
        applied++
      }
    }
    console.log(`  Applied ${applied} new vibes`)

    writeRepairs([], allGames, true)

    console.log('\n=== Summary ===')
    console.log(`  Vibes regenerated: ${repairs.filter((r) => r.vibe).length}/${repairs.length}`)
    return
  }

  // Normal mode: detect by decade mismatch
  console.log('Phase 1: Identifying corrupted entries...')

  const corrupted = findCorruptedEntries(allGames)
  console.log(`  Found ${corrupted.length} corrupted entries (decade tag mismatch)`)

  if (corrupted.length === 0) {
    console.log('\nNo corrupted entries found. Exiting.')
    return
  }

  // Print sample
  console.log('\n  Sample corrupted entries:')
  for (const g of corrupted.slice(0, 5)) {
    const decadeTag = g.tags?.find((t) => /^\d{4}s$/.test(t))
    console.log(`    ${g.title} (${g.year}) — tagged ${decadeTag}, vibe: "${g.vibe}"`)
  }

  // Phase 2: Re-pull from IGDB
  const checkpoint = await repullFromIGDB(corrupted, env)

  // Phase 3: Apply repairs
  const repairs = applyIGDBRepairs(corrupted, checkpoint)

  // Phase 4: Regenerate vibes
  await regenerateVibes(repairs, corrupted, env)

  // Phase 5: Leaky vibe check
  checkLeakyVibes(repairs, corrupted)

  // Phase 6: Write back
  writeRepairs(repairs, allGames)

  // Summary
  console.log('\n=== Summary ===')
  console.log(`  Entries repaired: ${repairs.length}`)
  console.log(`  With new vibes: ${repairs.filter((r) => r.vibe).length}`)
  console.log(`  With IGDB pegi: ${repairs.filter((r) => r.pegi != null).length}`)
  console.log(`  With IGDB openCritic: ${repairs.filter((r) => r.openCritic != null).length}`)
  console.log(`  With era pricing: ${repairs.length}`)

  if (!DRY_RUN) {
    console.log('\n  Repairs written to src/data/games-db.ts')
    console.log('  Run `npm run build` to verify the project still builds')
  }
}

main().catch((err) => {
  console.error('\nFatal error:', err)
  process.exit(1)
})
