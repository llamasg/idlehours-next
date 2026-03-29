// scripts/fix-leaky-vibes.mjs
// Finds games where the vibe sentence contains words from the title (2+ matches)
// and re-generates just those vibes with explicit "avoid these words" instructions.
// Usage: node scripts/fix-leaky-vibes.mjs

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(__dirname, '../src/data/games-db.ts')
const dbContent = fs.readFileSync(dbPath, 'utf8')

const API_KEY = process.env.ANTHROPIC_API_KEY
if (!API_KEY) {
  // Try loading from .env.local
  const envPath = path.resolve(__dirname, '../.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const match = envContent.match(/^ANTHROPIC_API_KEY=(.+)$/m)
    if (match) process.env.ANTHROPIC_API_KEY = match[1].trim()
  }
}
const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey) {
  console.error('Missing ANTHROPIC_API_KEY')
  process.exit(1)
}

const BATCH_SIZE = 20

// ── Stop words — common words that don't constitute "leaking" ─────────────────
const STOP = new Set('the a an of in on at to for and or is it by as be no my up do so if we he me us am vs game games new one two three world super big old age day life time rise out all get set run can just not but you your with from this that will are was has had have been into over than too very each how its own way end far long back side top down high low real full open free good best well more much most only also off now here still even make like take come see want look use find give tell work play call try ask need feel keep let put say turn show part'.split(' '))

function sigWords(text) {
  return new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w)))
}

// ── Extract game entries from the TS file ─────────────────────────────────────
const entryRegex = /id: '([^']+)'[^}]*?title: '([^']*(?:\\'[^']*)*)'[^}]*?genres: \[([^\]]*)\][^}]*?vibe: '([^']*(?:\\'[^']*)*)',/gs
const entries = [...dbContent.matchAll(entryRegex)].map(m => ({
  id: m[1],
  title: m[2].replace(/\\'/g, "'"),
  genres: m[3].replace(/'/g, '').split(',').map(s => s.trim()).filter(Boolean),
  vibe: m[4].replace(/\\'/g, "'"),
})).filter(e => e.vibe)

console.log(`Parsed ${entries.length} games with vibes`)

// ── Find multi-word leakers ───────────────────────────────────────────────────
const leakers = entries.filter(e => {
  const tw = sigWords(e.title)
  const vw = sigWords(e.vibe)
  const shared = [...tw].filter(w => vw.has(w))
  e.shared = shared
  return shared.length >= 2
})

console.log(`Found ${leakers.length} games with 2+ title words in vibe`)
console.log()

// ── Call Claude to re-generate ────────────────────────────────────────────────
async function callClaude(batch) {
  const prompt = batch.map((e, i) => {
    const bannedWords = sigWords(e.title)
    return `${i + 1}. "${e.title}" (${e.genres.join(', ')})\n   Current: "${e.vibe}"\n   BANNED WORDS: ${[...bannedWords].join(', ')}`
  }).join('\n\n')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `You are rewriting game descriptions for a fill-in-the-blank clue game called Game Sense.

Each vibe must be a SHORT NOUN PHRASE of 3-6 words that works grammatically in this sentence:
"A [genre] game about [YOUR PHRASE] released in [year] made for [rating] on [platform]."

Rules:
- Lowercase, no quotes, no period
- Must be a noun phrase (not a sentence, no verbs in present tense unless gerund)
- Should be a FAIR CLUE that helps identify the game without being too obvious
- CRITICAL: Do NOT use ANY of the BANNED WORDS listed for each game. These are words from the game's title that would make the clue too easy.
- Also avoid obvious synonyms of the banned words
- Be specific and evocative, not generic
- Focus on how the game FEELS to play, not what it's called
- Examples of good vibes: "tending a pixel farm", "punching trees and building castles", "a woman's desperate flight", "surviving one more night"

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

  const results = new Map()
  for (const line of responseText.split('\n')) {
    const match = line.match(/^(\d+)\.\s*(.+)$/)
    if (match) {
      let phrase = match[2].trim()
      phrase = phrase.replace(/^["']|["']$/g, '').replace(/\.$/, '').trim()
      phrase = phrase.toLowerCase()
      results.set(parseInt(match[1]), phrase)
    }
  }

  return results
}

// ── Process in batches ────────────────────────────────────────────────────────
const vibeMap = new Map()

for (let i = 0; i < leakers.length; i += BATCH_SIZE) {
  const batch = leakers.slice(i, i + BATCH_SIZE)
  const batchNum = Math.floor(i / BATCH_SIZE) + 1
  const totalBatches = Math.ceil(leakers.length / BATCH_SIZE)

  console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} games)...`)

  try {
    const results = await callClaude(batch)

    for (let j = 0; j < batch.length; j++) {
      const newVibe = results.get(j + 1)
      if (newVibe) {
        // Verify no banned words leaked through
        const banned = sigWords(batch[j].title)
        const newWords = sigWords(newVibe)
        const stillLeaking = [...banned].filter(w => newWords.has(w))
        if (stillLeaking.length > 0) {
          console.warn(`  ⚠ ${batch[j].title}: still leaks [${stillLeaking.join(', ')}] — "${newVibe}" — keeping anyway`)
        }
        vibeMap.set(batch[j].id, newVibe)
      } else {
        console.warn(`  Missing result for ${batch[j].title}, keeping original`)
      }
    }

    console.log(`  Got ${results.size}/${batch.length} results`)

    if (i + BATCH_SIZE < leakers.length) {
      await new Promise(r => setTimeout(r, 1000))
    }
  } catch (err) {
    console.error(`  Batch ${batchNum} failed: ${err.message}`)
    console.error('  Keeping original vibes for this batch')
  }
}

console.log(`\nTotal vibes rewritten: ${vibeMap.size}/${leakers.length}`)

// ── Apply rewrites to the database file ─────────────────────────────────────
let currentId = null
let newContent = dbContent.split('\n').map(line => {
  const idMatch = line.match(/^\s+id: '([^']+)'/)
  if (idMatch) currentId = idMatch[1]

  const vibeMatch = line.match(/^(\s+vibe: )'[^']*(?:\\'[^']*)*',/)
  if (vibeMatch && currentId && vibeMap.has(currentId)) {
    const newVibe = vibeMap.get(currentId).replace(/'/g, "\\'")
    return `${vibeMatch[1]}'${newVibe}',`
  }

  return line
}).join('\n')

fs.writeFileSync(dbPath, newContent, 'utf8')
console.log(`\nUpdated ${dbPath}`)

// Show examples
console.log('\nSample rewrites:')
let count = 0
for (const [id, newVibe] of vibeMap) {
  if (count >= 15) break
  const orig = leakers.find(e => e.id === id)
  if (orig) {
    console.log(`  ${orig.title}:`)
    console.log(`    OLD: "${orig.vibe}"`)
    console.log(`    NEW: "${newVibe}"`)
  }
  count++
}
