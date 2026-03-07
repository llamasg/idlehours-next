#!/usr/bin/env node
/**
 * Generate semantic rankings for Game Sense.
 *
 * For each game, builds a text description from its metadata, generates an
 * embedding via OpenAI's text-embedding-3-small, then computes pairwise cosine
 * similarity to produce a full ranking matrix.
 *
 * Output: src/app/play/game-sense/data/rankings.ts
 *   - RANKINGS: Record<string, string[]>
 *   - For each game ID, an array of all other game IDs sorted most→least similar
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/generate-rankings.mjs
 *
 * The script batches embedding requests (max 2048 per batch for OpenAI) and
 * uses 256-dimension embeddings to keep the output file manageable.
 */

import fs from 'fs'
import path from 'path'

const API_KEY = process.env.OPENAI_API_KEY
if (!API_KEY) {
  console.error('Missing OPENAI_API_KEY environment variable')
  process.exit(1)
}

// ── Load games ────────────────────────────────────────────────────────────────

// We need to read the TS source and extract game data.
// Since this is an ESM script, we'll parse the exported array from games-db.ts.
// Simplest: use a dynamic import trick with tsx, or just regex-extract.
// For robustness, let's eval the array portion.

const dbPath = path.resolve('src/data/games-db.ts')
const dbSource = fs.readFileSync(dbPath, 'utf8')

// Extract the array content between GAMES_DB: GameEntry[] = [ ... ]
const arrayMatch = dbSource.match(/export const GAMES_DB:\s*GameEntry\[\]\s*=\s*(\[[\s\S]*\])/)
if (!arrayMatch) {
  console.error('Could not extract GAMES_DB array from games-db.ts')
  process.exit(1)
}

// Convert TS-style object literals to valid JSON-ish JS we can eval
let arrayStr = arrayMatch[1]
// Replace single quotes with double quotes for JSON compat
// But be careful with apostrophes in titles — handle escaped quotes
arrayStr = arrayStr
  .replace(/'/g, '"')  // all single → double
  .replace(/(\w)"(\w)/g, "$1\\'$2")  // fix apostrophes like "don"t" → "don\'t" — actually this is tricky

// Safer: use Function constructor to eval as JS
const games = new Function(`return ${arrayMatch[1]}`)()

// Filter to Game Sense eligible games (has vibe, genres, platforms, pegi)
const gsGames = games.filter(
  (g) => g.vibe && g.genres && g.genres.length > 0 && g.platforms && g.platforms.length > 0 && g.pegi !== null
)

console.log(`Found ${gsGames.length} Game Sense eligible games out of ${games.length} total`)

// ── Build descriptions ────────────────────────────────────────────────────────

function buildDescription(game) {
  const parts = [
    game.title,
    `(${game.year})`,
    game.genres.join(', '),
    game.vibe,
    game.platforms.join(', '),
  ]
  if (game.tags && game.tags.length > 0) {
    parts.push(game.tags.join(', '))
  }
  return parts.join('. ')
}

const descriptions = gsGames.map((g) => buildDescription(g))

// ── Generate embeddings ───────────────────────────────────────────────────────

const BATCH_SIZE = 500  // OpenAI allows up to 2048 inputs per request
const DIMENSIONS = 256  // Truncate for smaller file size

async function getEmbeddings(texts) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: texts,
      dimensions: DIMENSIONS,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  // Sort by index to maintain order
  return data.data.sort((a, b) => a.index - b.index).map((d) => d.embedding)
}

console.log(`Generating embeddings in batches of ${BATCH_SIZE}...`)

const allEmbeddings = []
for (let i = 0; i < descriptions.length; i += BATCH_SIZE) {
  const batch = descriptions.slice(i, i + BATCH_SIZE)
  const batchNum = Math.floor(i / BATCH_SIZE) + 1
  const totalBatches = Math.ceil(descriptions.length / BATCH_SIZE)
  console.log(`  Batch ${batchNum}/${totalBatches} (${batch.length} games)...`)

  const embeddings = await getEmbeddings(batch)
  allEmbeddings.push(...embeddings)
}

console.log(`Got ${allEmbeddings.length} embeddings`)

// ── Compute cosine similarities and rank ──────────────────────────────────────

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}

console.log('Computing pairwise similarities and ranking...')

// For each game, rank all other games by similarity
const rankings = {}

for (let i = 0; i < gsGames.length; i++) {
  const answerId = gsGames[i].id
  const answerEmb = allEmbeddings[i]

  // Compute similarity to all other games
  const sims = []
  for (let j = 0; j < gsGames.length; j++) {
    if (i === j) continue
    sims.push({
      id: gsGames[j].id,
      sim: cosineSimilarity(answerEmb, allEmbeddings[j]),
    })
  }

  // Sort by similarity descending (most similar first)
  sims.sort((a, b) => b.sim - a.sim)

  // Store just the ordered IDs
  rankings[answerId] = sims.map((s) => s.id)

  if ((i + 1) % 100 === 0) {
    console.log(`  Ranked ${i + 1}/${gsGames.length}`)
  }
}

console.log('Rankings computed')

// ── Write output ──────────────────────────────────────────────────────────────

const outPath = path.resolve('src/app/play/game-sense/data/rankings.ts')

// Build the TS file
let output = '// Auto-generated by scripts/generate-rankings.mjs\n'
output += '// Do not edit manually — re-run the script to regenerate.\n\n'
output += '/**\n'
output += ' * For each game ID, an array of all other game IDs sorted from\n'
output += ' * most similar to least similar (based on semantic embeddings).\n'
output += ' * To get the rank of a guess: rankings[answerId].indexOf(guessId) + 2\n'
output += ' * (rank 1 = exact match, rank 2 = most similar, etc.)\n'
output += ' */\n'
output += 'export const RANKINGS: Record<string, string[]> = '
output += JSON.stringify(rankings, null, 0)  // compact, no pretty-printing
output += '\n'

fs.writeFileSync(outPath, output)

const sizeMB = (Buffer.byteLength(output) / 1024 / 1024).toFixed(2)
console.log(`\nWritten to ${outPath} (${sizeMB} MB)`)
console.log('Done!')
