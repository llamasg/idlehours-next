/**
 * Pip — OpenCritic Module
 *
 * Fetches OpenCritic scores for games that have an openCriticId set in Sanity.
 * NOTE: OpenCritic now requires a RapidAPI key (set OPENCRITIC_RAPIDAPI_KEY in .env.local).
 * Without a key the API returns 400/401 and all score fetches will be skipped gracefully.
 * Get a key at: https://rapidapi.com/opencritic-opencritic-default/api/opencritic-api
 *
 * Usage as part of nightly job: imported by pip/index.js
 * Standalone search test: node pip/opencritic.js "Stardew Valley"
 * Standalone update test:  node pip/opencritic.js --update
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()
import { createClient } from '@sanity/client'

const OPENCRITIC_BASE = 'https://api.opencritic.com/api/game'

function getSanityClient() {
  const token = process.env.SANITY_WRITE_TOKEN
  if (!token) {
    console.warn('⚠️  SANITY_WRITE_TOKEN not set — OpenCritic Sanity patches will fail')
  }
  return createClient({
    projectId: process.env.SANITY_PROJECT_ID || 'ijj3h2lj',
    dataset: process.env.SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token,
    useCdn: false,
  })
}

/**
 * Search OpenCritic for a game by name.
 * Returns array of { id, name } matches.
 */
export async function searchOpenCritic(name) {
  const url = `${OPENCRITIC_BASE}/search?criteria=${encodeURIComponent(name)}`
  const apiKey = process.env.OPENCRITIC_RAPIDAPI_KEY
  const headers = apiKey
    ? { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'opencritic-api.p.rapidapi.com' }
    : {}
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`OpenCritic search failed: ${res.status}`)
  const results = await res.json()
  return results.map(r => ({ id: r.id, name: r.name }))
}

/**
 * Fetch a single game's score from OpenCritic by its numeric ID.
 * Returns the topCriticScore (0-100) or null if not yet scored.
 */
async function fetchScore(openCriticId) {
  const url = `${OPENCRITIC_BASE}/${openCriticId}`
  const apiKey = process.env.OPENCRITIC_RAPIDAPI_KEY
  const headers = apiKey
    ? { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'opencritic-api.p.rapidapi.com' }
    : {}
  const res = await fetch(url, { headers })
  if (!res.ok) {
    console.warn(`  ⚠️  OpenCritic fetch failed for ID ${openCriticId}: ${res.status}`)
    return null
  }
  const data = await res.json()
  const score = data.topCriticScore
  if (score == null || score < 0) return null
  return Math.round(score)
}

/**
 * Main export: query Sanity for all games with openCriticId set,
 * fetch their current scores, and patch them back.
 */
export async function updateOpenCriticScores() {
  const client = getSanityClient()

  let games
  try {
    games = await client.fetch(
      `*[_type == "game" && defined(openCriticId) && openCriticId != ""] { _id, title, openCriticId }`
    )
  } catch (err) {
    console.warn('⚠️  OpenCritic: could not reach Sanity —', err.message)
    return
  }

  if (games.length === 0) {
    console.log('🎮 OpenCritic: no games with openCriticId set — skipping')
    return
  }

  console.log(`🎮 OpenCritic: updating ${games.length} game(s)...`)

  let updated = 0
  let skipped = 0

  for (const game of games) {
    const score = await fetchScore(game.openCriticId)

    if (score == null) {
      console.log(`  ⏭️  ${game.title}: no score available`)
      skipped++
    } else {
      await client.patch(game._id).set({ openCriticScore: score }).commit()
      console.log(`  ✅ ${game.title}: ${score}`)
      updated++
    }

    // Polite delay — don't hammer the public API
    await new Promise(r => setTimeout(r, 300))
  }

  console.log(`✅ OpenCritic done: ${updated} updated, ${skipped} skipped`)
}

// ── Standalone test ────────────────────────────────────────────────────────
// node pip/opencritic.js "Stardew Valley"   → search by name
// node pip/opencritic.js --update           → run the update step

if (process.argv[1].endsWith('opencritic.js')) {
  const arg = process.argv[2]

  if (arg === '--update') {
    await updateOpenCriticScores()
  } else if (arg) {
    console.log(`🔍 Searching OpenCritic for: "${arg}"`)
    const results = await searchOpenCritic(arg)
    if (results.length === 0) {
      console.log('No results found.')
    } else {
      results.slice(0, 5).forEach(r => console.log(`  ID ${r.id}: ${r.name}`))
    }
  } else {
    console.log('Usage:')
    console.log('  node pip/opencritic.js "Game Name"   — search for a game ID')
    console.log('  node pip/opencritic.js --update      — update all game scores')
  }
}
