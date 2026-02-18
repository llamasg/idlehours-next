/**
 * Pip — Nightly Job Entry Point
 *
 * Runs every night via GitHub Actions.
 * Sequence:
 *   1. Fetch GA4 + Search Console data (research.js)
 *   2. Fetch existing posts from Sanity (sanity.js)
 *   3. Generate ideas + morning message via Claude (generate.js)
 *   4. Write results back to Sanity (sanity.js)
 *
 * Usage: node pip/index.js
 * Dry run: PIP_DRY_RUN=true node pip/index.js
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()
import { fetchResearchData } from './research.js'
import { generateContent } from './generate.js'
import { fetchPosts, writeToDashboard } from './sanity.js'

const DRY_RUN = process.env.PIP_DRY_RUN === 'true'

async function run() {
  const startTime = Date.now()

  console.log('\n🌿 Pip nightly job starting...')
  console.log(`Mode: ${DRY_RUN ? '🌱 DRY RUN (no Sanity writes)' : '🔴 LIVE'}`)
  console.log(`Date: ${new Date().toISOString()}\n`)
  console.log('─'.repeat(50))

  // ── Step 1: Research ──────────────────────────────
  const research = await fetchResearchData()

  console.log('\n' + '─'.repeat(50))

  // ── Step 2: Fetch posts for context ──────────────
  const posts = await fetchPosts()

  console.log('\n' + '─'.repeat(50))

  // ── Step 3: Generate with Claude ─────────────────
  const generated = await generateContent(research, posts)

  console.log('\n' + '─'.repeat(50))

  // ── Step 4: Write to Sanity ───────────────────────
  if (DRY_RUN) {
    console.log('\n🌱 DRY RUN — skipping Sanity write\n')

    if (generated?.morningMessage) {
      console.log('📋 Morning message preview:\n')
      console.log(generated.morningMessage)
    }

    if (generated?.ideas?.length) {
      console.log('\n💡 Ideas preview:\n')
      generated.ideas.forEach((idea, i) => {
        console.log(`${i + 1}. [${idea.type}] ${idea.title}`)
        console.log(`   Cluster: ${idea.cluster} | Difficulty: ${idea.difficulty} | Trending: ${idea.trending}`)
        console.log()
      })
    }
  } else {
    await writeToDashboard({ research, generated, posts })
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log('\n' + '─'.repeat(50))
  console.log(`\n✅ Pip nightly job complete in ${elapsed}s\n`)
}

run().catch(err => {
  console.error('\n❌ Pip job failed:', err.message)
  console.error(err.stack)
  process.exit(1)
})
