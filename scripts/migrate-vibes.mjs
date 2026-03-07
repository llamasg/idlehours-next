// scripts/migrate-vibes.mjs
// Rewrites all vibe fields in games-db.ts from atmospheric sentences
// to 3-6 word noun phrases suitable for fill-in-the-blank clues.
// Usage: node scripts/migrate-vibes.mjs
// Requires: ANTHROPIC_API_KEY in .env.local (or NEXT_PUBLIC_ANTHROPIC_API_KEY)

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// ── Load API key ────────────────────────────────────────────────────────────

const envPath = path.resolve(ROOT, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  const match = line.match(/^([A-Z_]+)=(.*)$/)
  if (match) env[match[1]] = match[2].trim()
}

const API_KEY = env.ANTHROPIC_API_KEY || env.NEXT_PUBLIC_ANTHROPIC_API_KEY
if (!API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY must be set in .env.local')
  process.exit(1)
}

// ── Read the database file ──────────────────────────────────────────────────

const dbPath = path.join(ROOT, 'src/data/games-db.ts')
let dbContent = fs.readFileSync(dbPath, 'utf8')

// Extract all vibe entries: find lines matching "    vibe: 'some text',"
const vibeRegex = /^(\s+vibe: )'([^']*(?:\\'[^']*)*)',$/gm
const matches = [...dbContent.matchAll(vibeRegex)]
  .filter(m => m[2] && m[2] !== 'null')

console.log(`Found ${matches.length} vibes to migrate`)

// ── Call Claude in batches ──────────────────────────────────────────────────

const BATCH_SIZE = 50

// We also need the game titles + genres for context
// Extract game entries in order: id, title, genres, vibe
const entryRegex = /id: '([^']+)'[^}]*?title: '([^']*(?:\\'[^']*)*)'[^}]*?genres: \[([^\]]*)\][^}]*?vibe: '([^']*(?:\\'[^']*)*)',/gs
const entries = [...dbContent.matchAll(entryRegex)]
  .filter(m => m[4]) // has a vibe
  .map(m => ({
    id: m[1],
    title: m[2].replace(/\\'/g, "'"),
    genres: m[3] ? m[3].replace(/'/g, '').split(',').map(s => s.trim()).filter(Boolean) : [],
    vibe: m[4].replace(/\\'/g, "'"),
  }))

console.log(`Extracted ${entries.length} entries with vibes`)

async function callClaude(batch) {
  const prompt = batch.map((e, i) =>
    `${i + 1}. "${e.title}" (${e.genres.join(', ')}): "${e.vibe}"`
  ).join('\n')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `You are rewriting game descriptions for a fill-in-the-blank clue game.

Each vibe must become a SHORT NOUN PHRASE of 3-6 words that works grammatically in this sentence:
"A [genre] game about [YOUR PHRASE] released in [year] made for [rating] on [platform]."

Rules:
- Lowercase, no quotes, no period
- Must be a noun phrase (not a sentence, no verbs in present tense unless gerund)
- Should be a FAIR CLUE that helps identify the game without being too obvious
- Avoid using the game's title or direct synonyms
- Be specific and evocative, not generic
- Examples: "tending a pixel farm", "punching trees and building castles", "a woman's desperate flight", "surviving one more night"

For each numbered game below, return ONLY the new phrase on a line starting with the same number and a period.

${prompt}`
      }],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Claude API error ${res.status}: ${text}`)
  }

  const data = await res.json()
  const responseText = data.content[0].text

  // Parse numbered responses
  const results = new Map()
  for (const line of responseText.split('\n')) {
    const match = line.match(/^(\d+)\.\s*(.+)$/)
    if (match) {
      let phrase = match[2].trim()
      // Clean up: remove quotes, periods, leading "about"
      phrase = phrase.replace(/^["']|["']$/g, '').replace(/\.$/, '').trim()
      phrase = phrase.toLowerCase()
      results.set(parseInt(match[1]), phrase)
    }
  }

  return results
}

// Process in batches
const vibeMap = new Map() // id -> new vibe phrase

for (let i = 0; i < entries.length; i += BATCH_SIZE) {
  const batch = entries.slice(i, i + BATCH_SIZE)
  const batchNum = Math.floor(i / BATCH_SIZE) + 1
  const totalBatches = Math.ceil(entries.length / BATCH_SIZE)

  console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} games)...`)

  try {
    const results = await callClaude(batch)

    for (let j = 0; j < batch.length; j++) {
      const newVibe = results.get(j + 1)
      if (newVibe) {
        vibeMap.set(batch[j].id, newVibe)
      } else {
        console.warn(`  Missing result for ${batch[j].title}, keeping original`)
      }
    }

    console.log(`  Got ${results.size}/${batch.length} results`)

    // Rate limit: wait 1s between batches
    if (i + BATCH_SIZE < entries.length) {
      await new Promise(r => setTimeout(r, 1000))
    }
  } catch (err) {
    console.error(`  Batch ${batchNum} failed: ${err.message}`)
    console.error('  Keeping original vibes for this batch')
  }
}

console.log(`\nTotal vibes rewritten: ${vibeMap.size}/${entries.length}`)

// ── Apply rewrites to the database file ─────────────────────────────────────

// We need to replace each vibe line in the file.
// Match patterns like: "    vibe: 'old text here',"
// Only replace if we have a new vibe for the corresponding game.

// Build a sequential replacement: go through the file entry by entry
let currentId = null
let newContent = dbContent.split('\n').map(line => {
  // Track which game entry we're in
  const idMatch = line.match(/^\s+id: '([^']+)'/)
  if (idMatch) currentId = idMatch[1]

  // Replace vibe if we have a rewrite for this game
  const vibeMatch = line.match(/^(\s+vibe: )'[^']*(?:\\'[^']*)*',/)
  if (vibeMatch && currentId && vibeMap.has(currentId)) {
    const newVibe = vibeMap.get(currentId).replace(/'/g, "\\'")
    return `${vibeMatch[1]}'${newVibe}',`
  }

  return line
}).join('\n')

fs.writeFileSync(dbPath, newContent, 'utf8')
console.log(`\nUpdated ${dbPath}`)

// Show some examples
console.log('\nSample rewrites:')
let count = 0
for (const [id, newVibe] of vibeMap) {
  if (count >= 10) break
  const orig = entries.find(e => e.id === id)
  console.log(`  ${orig.title}: "${newVibe}"`)
  count++
}
