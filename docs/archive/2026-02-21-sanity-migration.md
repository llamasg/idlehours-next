# Sanity Migration + OpenCritic Integration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove all mock data from the Idle Hours frontend, migrate it to real Sanity CMS documents, and add OpenCritic score auto-fetching to the nightly job.

**Architecture:** One-time migration script uploads images and creates game/homePage documents in Sanity. Three frontend pages switch from static imports to live `useEffect` + GROQ queries. A new pip module fetches OpenCritic scores nightly for any game with an `openCriticId`.

**Tech Stack:** `@sanity/client` v7 (root), Node 20+ `--env-file` flag, React `useEffect`/`useState`, existing GROQ query functions in `src/lib/queries.ts`.

---

### Task 1: Remove `ratings` from game schema, add `openCriticId` + `steamAppId`

**Files:**
- Modify: `studio/schemaTypes/game.ts`

**Step 1: Open the file and locate the `ratings` field block**

The `ratings` field is a `defineField` block starting around line 76 that defines an `object` with sub-fields `cozyPercent`, `brainEffort`, `snackSafe`. Find and **delete this entire block** (from `defineField({` to the closing `}),`).

The ratings block looks like:
```ts
defineField({
  name: 'ratings',
  title: 'Idle Hours Ratings',
  type: 'object',
  fields: [
    { name: 'cozyPercent', ... },
    { name: 'brainEffort', ... },
    { name: 'snackSafe', ... },
  ],
}),
```

**Step 2: Add `openCriticId` and `steamAppId` fields**

Add these two fields immediately after the existing `openCriticScore` field (around line 136):

```ts
defineField({
  name: 'openCriticId',
  title: 'OpenCritic ID',
  type: 'string',
  description: 'Integer ID from OpenCritic URL (e.g. "10703" for Stardew Valley). Used by nightly job to auto-fetch score.',
  readOnly: false,
}),
defineField({
  name: 'steamAppId',
  title: 'Steam App ID',
  type: 'string',
  description: 'Steam numeric App ID (e.g. "413150" for Stardew Valley). Used for future price fetching.',
}),
```

**Step 3: Verify**

In Sanity Studio, restart the dev server (`cd studio && npm run dev`). Open a game document. Confirm:
- The "Idle Hours Ratings" section no longer appears
- "OpenCritic ID" and "Steam App ID" fields appear below the OpenCritic Score field

**Step 4: Commit**

```bash
git add studio/schemaTypes/game.ts
git commit -m "feat(schema): remove ratings object, add openCriticId + steamAppId to game"
```

---

### Task 2: Create `pip/opencritic.js`

**Files:**
- Create: `pip/opencritic.js`

**Step 1: Create the file**

```js
/**
 * Pip — OpenCritic Module
 *
 * Fetches OpenCritic scores for games that have an openCriticId set in Sanity.
 * No API key required — OpenCritic is a public API.
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
  return createClient({
    projectId: process.env.SANITY_PROJECT_ID || 'ijj3h2lj',
    dataset: process.env.SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,
  })
}

/**
 * Search OpenCritic for a game by name.
 * Returns array of { id, name } matches.
 */
export async function searchOpenCritic(name) {
  const url = `${OPENCRITIC_BASE}/search?criteria=${encodeURIComponent(name)}`
  const res = await fetch(url)
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
  const res = await fetch(url)
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

  const games = await client.fetch(
    `*[_type == "game" && defined(openCriticId) && openCriticId != ""] { _id, title, openCriticId }`
  )

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
```

**Step 2: Test standalone search**

```bash
node pip/opencritic.js "Stardew Valley"
```

Expected output:
```
🔍 Searching OpenCritic for: "Stardew Valley"
  ID 10703: Stardew Valley
  ...
```

**Step 3: Commit**

```bash
git add pip/opencritic.js
git commit -m "feat(pip): add OpenCritic module with score update + search"
```

---

### Task 3: Wire OpenCritic into `pip/index.js` as Step 0

**Files:**
- Modify: `pip/index.js`

**Step 1: Add import at top**

After the existing imports in `pip/index.js`, add:

```js
import { updateOpenCriticScores } from './opencritic.js'
```

**Step 2: Insert Step 0 inside `run()`**

Find the line `// ── Step 1: Research ──────────────────────────────` and insert above it:

```js
// ── Step 0: Update OpenCritic scores ─────────────
try {
  await updateOpenCriticScores()
} catch (err) {
  console.warn('⚠️  OpenCritic update failed (non-fatal):', err.message)
}

console.log('\n' + '─'.repeat(50))
```

**Step 3: Verify (dry run)**

```bash
PIP_DRY_RUN=true node pip/index.js
```

Expected: Step 0 runs (logs "no games with openCriticId set — skipping" since no game docs exist yet), then continues with research and generation steps.

**Step 4: Commit**

```bash
git add pip/index.js
git commit -m "feat(pip): run OpenCritic score update as Step 0 in nightly job"
```

---

### Task 4: Create `scripts/migrate-to-sanity.js`

**Files:**
- Create: `scripts/migrate-to-sanity.js`

This is the most complex task. Read it fully before starting.

**Step 1: Create the file with complete code**

```js
/**
 * One-time migration: upload images + create game documents + create homePage document in Sanity.
 *
 * Run:      node --env-file=.env.local scripts/migrate-to-sanity.js
 * Dry run:  DRY_RUN=true node --env-file=.env.local scripts/migrate-to-sanity.js
 *
 * Uses @sanity/client v7 (from root node_modules).
 * Requires SANITY_WRITE_TOKEN in .env.local.
 *
 * Idempotent: uses createOrReplace with deterministic _id values.
 * Re-running is safe — it will overwrite, not duplicate.
 */

import { createClient } from '@sanity/client'
import { createReadStream, existsSync } from 'fs'
import { resolve } from 'path'

const DRY_RUN = process.env.DRY_RUN === 'true'

if (!process.env.SANITY_WRITE_TOKEN) {
  console.error('❌ SANITY_WRITE_TOKEN not set. Run with: node --env-file=.env.local scripts/migrate-to-sanity.js')
  process.exit(1)
}

const client = createClient({
  projectId: 'ijj3h2lj',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

// ── Image filename map ─────────────────────────────────────────────────────
// Maps game slug → filename in public/images/
const IMAGE_MAP = {
  'stardew-valley':               'Stardew valley.png',
  'animal-crossing-new-horizons': 'animalcrossing.jpg',
  'unpacking':                    'unpacked.png',
  'spiritfarer':                  'spiritfarer.jpg',
  'a-short-hike':                 'ashorthike.jpg',
  'palia':                        'palia.png',
  'coffee-talk':                  'coffeetalk.webp',
  // cozy-grove, dorfromantik, potion-craft: no image file available
  '_hero':                        'heroimage.jpg',
}

function mimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  return 'image/jpeg'
}

async function uploadImage(key) {
  const filename = IMAGE_MAP[key]
  if (!filename) return null

  const filepath = resolve('public/images', filename)
  if (!existsSync(filepath)) {
    console.log(`  ⚠️  Missing file: ${filepath}`)
    return null
  }

  if (DRY_RUN) {
    console.log(`  🌱 Would upload: ${filename}`)
    return { _type: 'image', asset: { _type: 'reference', _ref: `dry-run-${key}` } }
  }

  const asset = await client.assets.upload(
    'image',
    createReadStream(filepath),
    { filename, contentType: mimeType(filename) }
  )
  console.log(`  ✅ Uploaded: ${filename} → ${asset._id}`)
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
}

// ── Game data ──────────────────────────────────────────────────────────────
// Transformed from src/data/mock-data.ts — ratings removed, new fields added.

const GAMES = [
  {
    slug: 'stardew-valley',
    title: 'Stardew Valley',
    shortDescription: "Inherit your grandfather's old farm plot and build the rural life you've always dreamed of.",
    platforms: ['PC', 'Switch', 'PS5', 'Xbox', 'Mobile'],
    tags: ['cozy', 'farming', 'pixel-art', 'multiplayer', 'relaxing'],
    genre: ['farming', 'simulation'],
    coop: true,
    openCriticScore: 89,
    difficulty: 1,
    replayability: 5,
    greatSoundtrack: true,
    affiliateLinks: [
      { label: 'Steam', url: 'https://store.steampowered.com/app/413150/Stardew_Valley/' },
      { label: 'Nintendo eShop', url: 'https://www.nintendo.com/store/products/stardew-valley-switch/' },
    ],
    longDescription: [
      { _type: 'block', _key: 'ld1', style: 'h2', markDefs: [], children: [{ _type: 'span', _key: 'ld1s', text: 'Why Stardew Valley Is the Ultimate Cozy Game', marks: [] }] },
      { _type: 'block', _key: 'ld2', style: 'normal', markDefs: [], children: [{ _type: 'span', _key: 'ld2s', text: "There's a reason Stardew Valley has sold over 30 million copies since its release — it nails the cozy gaming formula like nothing else. You inherit a run-down farm, move to a small town, and slowly build the life you want. There's no rush, no fail state, and no wrong way to play.", marks: [] }] },
      { _type: 'block', _key: 'ld3', style: 'normal', markDefs: [], children: [{ _type: 'span', _key: 'ld3s', text: "What makes it special is the depth hiding beneath that pixel-art surface. The farming is satisfying, the characters feel real, and the seasonal rhythm gives every in-game day a sense of purpose.", marks: [] }] },
      { _type: 'block', _key: 'ld4', style: 'h2', markDefs: [], children: [{ _type: 'span', _key: 'ld4s', text: 'Perfect for Winding Down', marks: [] }] },
      { _type: 'block', _key: 'ld5', style: 'normal', markDefs: [], children: [{ _type: 'span', _key: 'ld5s', text: "The brain effort is Low — you can zone out and plant parsnips while watching a show, or dive into min-maxing your sprinkler layout. The multiplayer update turned Stardew Valley into one of the best co-op cozy games available.", marks: [] }] },
    ],
    featured: true,
    publishedAt: '2024-02-26',
    isFree: false,
  },
  {
    slug: 'animal-crossing-new-horizons',
    title: 'Animal Crossing: New Horizons',
    shortDescription: 'Escape to a deserted island and create your own paradise, one day at a time.',
    platforms: ['Switch'],
    tags: ['cozy', 'decorating', 'social', 'island-life', 'relaxing'],
    genre: ['simulation'],
    coop: false,
    openCriticScore: 91,
    difficulty: 1,
    replayability: 4,
    greatSoundtrack: true,
    affiliateLinks: [{ label: 'Nintendo eShop', url: 'https://www.nintendo.com/store/products/animal-crossing-new-horizons-switch/' }],
    longDescription: null,
    featured: true,
    publishedAt: '2024-03-20',
    isFree: false,
  },
  {
    slug: 'unpacking',
    title: 'Unpacking',
    shortDescription: 'A zen puzzle game about the familiar experience of pulling possessions out of boxes.',
    platforms: ['PC', 'Switch', 'PS5', 'Xbox'],
    tags: ['cozy', 'puzzle', 'narrative', 'short-session', 'relaxing'],
    genre: ['puzzle'],
    coop: false,
    openCriticScore: 90,
    difficulty: 1,
    replayability: 3,
    greatSoundtrack: false,
    affiliateLinks: [{ label: 'Steam', url: 'https://store.steampowered.com/app/1135690/Unpacking/' }],
    longDescription: null,
    featured: false,
    publishedAt: '2024-11-02',
    isFree: false,
  },
  {
    slug: 'spiritfarer',
    title: 'Spiritfarer',
    shortDescription: 'A cozy management game about dying. Build a boat to explore the world, care for spirits, then release them.',
    platforms: ['PC', 'Switch', 'PS5', 'Xbox'],
    tags: ['cozy', 'emotional', 'crafting', 'narrative', 'beautiful'],
    genre: ['adventure', 'simulation'],
    coop: true,
    openCriticScore: 87,
    difficulty: 2,
    replayability: 2,
    greatSoundtrack: true,
    affiliateLinks: [{ label: 'Steam', url: 'https://store.steampowered.com/app/972660/Spiritfarer/' }],
    longDescription: null,
    featured: true,
    publishedAt: '2024-08-18',
    isFree: false,
  },
  {
    slug: 'a-short-hike',
    title: 'A Short Hike',
    shortDescription: 'Hike, climb, and soar through the peaceful Hawk Peak Provincial Park at your own pace.',
    platforms: ['PC', 'Switch'],
    tags: ['cozy', 'short-session', 'exploration', 'nature', 'relaxing'],
    genre: ['adventure'],
    coop: false,
    openCriticScore: 83,
    difficulty: 1,
    replayability: 3,
    greatSoundtrack: true,
    affiliateLinks: [{ label: 'Steam', url: 'https://store.steampowered.com/app/1055540/A_Short_Hike/' }],
    longDescription: null,
    featured: false,
    publishedAt: '2024-07-30',
    isFree: false,
  },
  {
    slug: 'cozy-grove',
    title: 'Cozy Grove',
    shortDescription: 'Camp on a haunted island and bring colour back to the lives of its ghostly bear inhabitants.',
    platforms: ['PC', 'Switch', 'PS5', 'Mobile'],
    tags: ['cozy', 'daily-play', 'crafting', 'wholesome'],
    genre: ['simulation', 'adventure'],
    coop: false,
    openCriticScore: 74,
    difficulty: 1,
    replayability: 3,
    greatSoundtrack: false,
    affiliateLinks: [{ label: 'Steam', url: 'https://store.steampowered.com/app/1099790/Cozy_Grove/' }],
    longDescription: null,
    featured: false,
    publishedAt: '2024-04-15',
    isFree: false,
  },
  {
    slug: 'dorfromantik',
    title: 'Dorfromantik',
    shortDescription: 'A peaceful building strategy and puzzle game where you create beautiful landscapes tile by tile.',
    platforms: ['PC', 'Switch'],
    tags: ['cozy', 'puzzle', 'strategy', 'relaxing', 'travel'],
    genre: ['puzzle', 'strategy'],
    coop: false,
    openCriticScore: 89,
    difficulty: 2,
    replayability: 4,
    greatSoundtrack: false,
    affiliateLinks: [{ label: 'Steam', url: 'https://store.steampowered.com/app/1455840/Dorfromantik/' }],
    longDescription: null,
    featured: false,
    publishedAt: '2024-09-25',
    isFree: false,
  },
  {
    slug: 'potion-craft',
    title: 'Potion Craft',
    shortDescription: "Brew potions by physically interacting with ingredients and an alchemist's map.",
    platforms: ['PC', 'Switch', 'Xbox'],
    tags: ['cozy', 'crafting', 'simulation', 'unique-mechanic'],
    genre: ['simulation'],
    coop: false,
    openCriticScore: 81,
    difficulty: 2,
    replayability: 3,
    greatSoundtrack: false,
    affiliateLinks: [{ label: 'Steam', url: 'https://store.steampowered.com/app/1210320/Potion_Craft_Alchemist_Simulator/' }],
    longDescription: null,
    featured: false,
    publishedAt: '2024-12-14',
    isFree: false,
  },
  {
    slug: 'palia',
    title: 'Palia',
    shortDescription: 'A cozy MMO where you can farm, fish, decorate, and hang out with friends in a vibrant world.',
    platforms: ['PC', 'Switch'],
    tags: ['cozy', 'mmo', 'multiplayer', 'farming', 'social'],
    genre: ['simulation', 'farming'],
    coop: true,
    openCriticScore: 62,
    difficulty: 1,
    replayability: 4,
    greatSoundtrack: false,
    affiliateLinks: [{ label: 'Official Site', url: 'https://palia.com' }],
    longDescription: null,
    featured: false,
    publishedAt: '2024-10-08',
    isFree: true,
  },
  {
    slug: 'coffee-talk',
    title: 'Coffee Talk',
    shortDescription: 'Run a late-night coffee shop and listen to the stories of your fantastical customers.',
    platforms: ['PC', 'Switch', 'PS5', 'Xbox', 'Mobile'],
    tags: ['cozy', 'narrative', 'short-session', 'coffee', 'rainy-day'],
    genre: ['visual novel', 'simulation'],
    coop: false,
    openCriticScore: 85,
    difficulty: 1,
    replayability: 2,
    greatSoundtrack: true,
    affiliateLinks: [{ label: 'Steam', url: 'https://store.steampowered.com/app/1028310/Coffee_Talk/' }],
    longDescription: null,
    featured: false,
    publishedAt: '2024-06-20',
    isFree: false,
  },
]

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🌿 Sanity migration starting... ${DRY_RUN ? '(DRY RUN — no writes)' : '(LIVE)'}`)

  // ── Step 1: Upload images ──────────────────────────────────────────────
  console.log('\n📸 Step 1: Uploading game cover images...')
  const imageRefs = {}
  for (const key of Object.keys(IMAGE_MAP)) {
    imageRefs[key] = await uploadImage(key)
  }

  // ── Step 2: Create game documents ─────────────────────────────────────
  console.log('\n🎮 Step 2: Creating game documents...')
  const gameIds = {}

  for (const game of GAMES) {
    const id = `game-${game.slug}`
    gameIds[game.slug] = id

    const doc = {
      _type: 'game',
      _id: id,
      title: game.title,
      slug: { _type: 'slug', current: game.slug },
      shortDescription: game.shortDescription,
      platforms: game.platforms,
      tags: game.tags,
      genre: game.genre,
      coop: game.coop,
      openCriticScore: game.openCriticScore,
      difficulty: game.difficulty,
      replayability: game.replayability,
      greatSoundtrack: game.greatSoundtrack,
      affiliateLinks: game.affiliateLinks.map((l, i) => ({ ...l, _key: `link-${i}` })),
      featured: game.featured,
      publishedAt: new Date(game.publishedAt).toISOString(),
      isFree: game.isFree,
    }

    // Attach long description if present
    if (game.longDescription) {
      doc.longDescription = game.longDescription
    }

    // Attach cover image if uploaded successfully
    if (imageRefs[game.slug]) {
      doc.coverImage = imageRefs[game.slug]
    }

    if (DRY_RUN) {
      console.log(`  🌱 Would createOrReplace: ${id} (${game.title})`)
    } else {
      await client.createOrReplace(doc)
      console.log(`  ✅ Created: ${game.title}`)
    }
  }

  // ── Step 3: Query existing posts + products ────────────────────────────
  console.log('\n🔍 Step 3: Querying existing Sanity posts and products...')
  const posts = await client.fetch(
    `*[_type == "post"] | order(publishedAt desc) { _id, title }[0...4]`
  )
  const products = await client.fetch(
    `*[_type == "product"] | order(order asc) { _id, name }`
  )
  console.log(`  Posts found: ${posts.length}`)
  console.log(`  Products found: ${products.length}`)

  // ── Step 4: Create homePage document ──────────────────────────────────
  console.log('\n🏠 Step 4: Creating homePage document...')

  // Helper to build a reference with _key for array items
  const ref = (id, key) => ({ _type: 'reference', _ref: id, _key: key })

  // Game IDs for carousels
  const allGameIds = GAMES.slice(0, 6).map(g => ref(gameIds[g.slug], `trending-${g.slug}`))
  const coopGameIds = GAMES.filter(g => g.coop).map(g => ref(gameIds[g.slug], `coop-${g.slug}`))
  const shortSessionIds = GAMES
    .filter(g => g.tags.includes('short-session'))
    .map(g => ref(gameIds[g.slug], `short-${g.slug}`))

  const postRefs = posts.map((p, i) => ref(p._id, `post-${i}`))
  const productRefs = products.slice(0, 6).map((p, i) => ref(p._id, `prod-${i}`))

  const homePageDoc = {
    _type: 'homePage',
    _id: 'homepage-singleton',
    title: 'Idle Hours — Home',
    sections: [
      {
        _type: 'heroSection',
        _key: 'hero-1',
        enabled: true,
        headline: 'Find your next favourite cozy game',
        subheadline: 'Gentle games, honest reviews, and everything you need for a calmer kind of play.',
        heroImage: imageRefs['_hero'] || null,
        primaryButton: { label: 'Browse Games', linkType: 'internal', internalPath: '/games' },
        secondaryButton: { label: 'Find a game for my mood', linkType: 'internal', internalPath: '/quizzes' },
        tags: ['New this week', 'Updated daily'],
      },
      {
        _type: 'carouselRowSection',
        _key: 'row-trending',
        enabled: true,
        rowTitle: 'Trending Cozy Games',
        rowSubtitle: "What everyone's playing right now",
        rowType: 'games',
        sourceType: 'curated',
        curatedGames: allGameIds,
        seeAllLink: { label: 'See all games', linkType: 'internal', internalPath: '/games' },
      },
      {
        _type: 'carouselRowSection',
        _key: 'row-coop',
        enabled: true,
        rowTitle: 'Best for Playing Together',
        rowSubtitle: 'Cozy co-op and multiplayer picks',
        rowType: 'games',
        sourceType: 'curated',
        curatedGames: coopGameIds,
        seeAllLink: { label: 'See all co-op', linkType: 'internal', internalPath: '/games?coop=true' },
      },
      {
        _type: 'carouselRowSection',
        _key: 'row-short',
        enabled: true,
        rowTitle: 'Perfect for Short Sessions',
        rowSubtitle: 'Got 30 minutes? These are for you',
        rowType: 'games',
        sourceType: 'curated',
        curatedGames: shortSessionIds,
      },
      {
        _type: 'quizCtaSection',
        _key: 'quiz-cta',
        enabled: true,
        title: 'Not sure what to play?',
        description: "Take our quick mood quiz and we'll match you with the perfect cozy game for right now.",
        buttonLabel: 'Find my game',
        link: { label: 'Take the quiz', linkType: 'internal', internalPath: '/quizzes' },
        icon: 'sparkles',
      },
      {
        _type: 'gameOfMonthSection',
        _key: 'gotm',
        enabled: true,
        title: 'Game of the Month',
        featuredGame: { _type: 'reference', _ref: gameIds['stardew-valley'] },
        customBlurb: "February belongs to Stardew Valley. With the 1.6 update still going strong, there's never been a better time to return to Pelican Town.",
        buttonLabel: 'Read our deep dive',
      },
      ...(productRefs.length > 0 ? [{
        _type: 'productFeatureSection',
        _key: 'products',
        enabled: true,
        title: 'Build your cozy gaming corner',
        subtitle: 'Hand-picked gear for the perfect setup',
        products: productRefs,
        cta: { label: 'Explore the full setup', linkType: 'internal', internalPath: '/shop' },
      }] : []),
      {
        _type: 'blogFeatureSection',
        _key: 'guides',
        enabled: true,
        title: 'Guides & gentle reads',
        subtitle: 'Tips, reviews, and thoughts on the cozy gaming life',
        sourceType: postRefs.length > 0 ? 'curated' : 'dynamic',
        ...(postRefs.length > 0 ? { curatedPosts: postRefs } : {
          dynamicQuery: { sortBy: 'newest', limit: 4 },
        }),
      },
      {
        _type: 'newsletterSection',
        _key: 'newsletter',
        enabled: true,
        title: 'Stay cozy',
        copy: 'A weekly letter with new game picks, gear drops, and the occasional quiz. No spam, just calm.',
        placeholderText: 'your@email.com',
        buttonLabel: 'Subscribe',
        disclaimer: 'Unsubscribe any time. We respect your inbox.',
      },
    ],
  }

  if (DRY_RUN) {
    console.log('  🌱 Would createOrReplace: homepage-singleton')
    console.log('  Sections:', homePageDoc.sections.map(s => s._type).join(', '))
  } else {
    await client.createOrReplace(homePageDoc)
    console.log('  ✅ Created: homepage-singleton')
  }

  console.log('\n✅ Migration complete!')
  console.log('\nNext steps:')
  console.log('  1. Check Sanity Studio — you should see 10 game documents')
  console.log('  2. Check the homePage document has all sections')
  console.log('  3. Start the React dev server: npm run dev')
  console.log('  4. Visit / and /games — pages should show live data')
}

main().catch(err => {
  console.error('\n❌ Migration failed:', err.message)
  console.error(err.stack)
  process.exit(1)
})
```

**Step 2: Dry run to verify logic**

```bash
DRY_RUN=true node --env-file=.env.local scripts/migrate-to-sanity.js
```

Expected output:
```
🌿 Sanity migration starting... (DRY RUN — no writes)

📸 Step 1: Uploading game cover images...
  🌱 Would upload: Stardew valley.png
  🌱 Would upload: animalcrossing.jpg
  ...

🎮 Step 2: Creating game documents...
  🌱 Would createOrReplace: game-stardew-valley (Stardew Valley)
  ...

🔍 Step 3: Querying existing Sanity posts and products...
  Posts found: X
  Products found: X

🏠 Step 4: Creating homePage document...
  🌱 Would createOrReplace: homepage-singleton
  Sections: heroSection, carouselRowSection, ...

✅ Migration complete!
```

**Step 3: Run the live migration**

```bash
node --env-file=.env.local scripts/migrate-to-sanity.js
```

Expected: same output with ✅ instead of 🌱, no errors.

**Step 4: Verify in Sanity Studio**

Open Sanity Studio (`cd studio && npm run dev`). Confirm:
- "Game" document type shows 10 documents
- Stardew Valley has a cover image and longDescription
- The 3 games without images (Cozy Grove, Dorfromantik, Potion Craft) have no cover image — that's expected
- "Homepage" document shows all sections with game references

**Step 5: Commit**

```bash
git add scripts/migrate-to-sanity.js
git commit -m "feat: add one-time Sanity migration script for games and homePage"
```

---

### Task 5: Switch `homepage.tsx` to live Sanity data

**Files:**
- Modify: `src/pages/homepage.tsx`

**Step 1: Replace the file contents**

The current file uses `const homePage = mockHomePage`. Replace with a `useEffect` + `useState` pattern:

```tsx
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import SectionRenderer from '@/components/SectionRenderer'
import HomeLoader from '@/components/HomeLoader'
import { getHomePage } from '@/lib/queries'
import type { HomePage } from '@/types'

export default function HomePage() {
  const [homePage, setHomePage] = useState<HomePage | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [animLoading, setAnimLoading] = useState(true)

  useEffect(() => {
    getHomePage()
      .then((data) => setHomePage(data))
      .catch((err) => console.error('[HomePage] Failed to load:', err))
      .finally(() => setDataLoading(false))
  }, [])

  return (
    <>
      {animLoading && <HomeLoader onComplete={() => setAnimLoading(false)} />}

      <div className="min-h-screen bg-background">
        <Header />

        <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 lg:px-8 lg:py-12">
          {dataLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : homePage ? (
            <SectionRenderer sections={homePage.sections} />
          ) : (
            <div className="py-24 text-center text-muted-foreground">
              <p className="font-heading text-lg">Could not load homepage content.</p>
            </div>
          )}
        </main>

        <SiteFooter />
      </div>
    </>
  )
}
```

**Note on the `client` in queries.ts:** `src/lib/sanity.ts` uses `useCdn: true`. After writing migration data, Sanity's CDN may cache for a few seconds. If data doesn't appear immediately, wait ~30s or temporarily set `useCdn: false` in sanity.ts during testing.

**Step 2: Verify**

```bash
npm run dev
```

Open `http://localhost:5173`. After the HomeLoader animation, the page should show:
- Hero section with image
- Trending Games carousel with real game tiles
- Co-op row, Short Sessions row
- Quiz CTA
- Game of the Month (Stardew Valley)
- Products section (if products exist in Sanity)
- Blog section
- Newsletter

**Step 3: Commit**

```bash
git add src/pages/homepage.tsx
git commit -m "feat(homepage): switch from mock data to live Sanity via getHomePage()"
```

---

### Task 6: Switch `gamespage.tsx` to live Sanity data

**Files:**
- Modify: `src/pages/gamespage.tsx`

**Step 1: Replace the mock import and static data with a fetch**

In `gamespage.tsx`, find the top of the file. Replace:
```tsx
import { mockGames } from '@/data/mock-data'
```
with:
```tsx
import { getAllGames } from '@/lib/queries'
import type { Game } from '@/types'
```

**Step 2: Add state for games and loading inside `GamesPage()`**

Find `export default function GamesPage() {` and add after the existing state declarations:

```tsx
const [games, setGames] = useState<Game[]>([])
const [gamesLoading, setGamesLoading] = useState(true)

useEffect(() => {
  getAllGames()
    .then((data) => setGames(data ?? []))
    .catch(() => setGames([]))
    .finally(() => setGamesLoading(false))
}, [])
```

**Step 3: Replace `[...mockGames]` with `[...games]`**

Inside the `useMemo`:
```tsx
// Before:
let result = [...mockGames]

// After:
let result = [...games]
```

Update the `useMemo` dependencies to include `games`:
```tsx
}, [search, platform, sort, coopOnly, games])
```

**Step 4: Add loading state to game grid**

Find the game grid section (around the `{filtered.length > 0 ?` block) and add a loading state before it:

```tsx
{gamesLoading ? (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-secondary" />
    ))}
  </div>
) : filtered.length > 0 ? (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
    {filtered.map((game) => (
      <GameTileCard key={game._id} game={game} />
    ))}
  </div>
) : (
  <div className="rounded-2xl border border-border/60 bg-card px-6 py-16 text-center">
    <p className="font-heading text-lg font-semibold text-foreground">No games found</p>
    <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search.</p>
  </div>
)}
```

**Step 5: Verify**

Navigate to `http://localhost:5173/games`. You should see:
- Brief skeleton loading state
- 10 game tiles with real data from Sanity
- Filters and search work correctly
- "Highest Rated" sort shows Stardew Valley near top

**Step 6: Commit**

```bash
git add src/pages/gamespage.tsx
git commit -m "feat(games): switch gamespage from mock data to live Sanity via getAllGames()"
```

---

### Task 7: Switch `gamedetailpage.tsx` to live Sanity data

**Files:**
- Modify: `src/pages/gamedetailpage.tsx`

**Step 1: Replace imports**

Find the top of the file. Replace:
```tsx
import { mockGames } from '@/data/mock-data'
```
with:
```tsx
import { getGame, getAllGames } from '@/lib/queries'
import type { Game } from '@/types'
```

**Step 2: Replace the entire component body**

Find `export default function GameDetailPage() {` and replace the function with this version that uses `useEffect`:

```tsx
export default function GameDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [game, setGame] = useState<Game | null>(null)
  const [related, setRelated] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)

    Promise.all([
      getGame(slug),
      getAllGames(),
    ]).then(([gameData, allGames]) => {
      setGame(gameData ?? null)
      // Related: up to 4 other games, shuffle slightly by sorting randomly
      const others = (allGames ?? []).filter((g: Game) => g.slug.current !== slug)
      setRelated(others.slice(0, 4))
    }).catch(() => {
      setGame(null)
    }).finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (!game) {
    // Keep the existing 404 block from the current file unchanged
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-16 text-center lg:px-8">
          <p className="font-heading text-xl font-semibold text-foreground">Game not found</p>
          <Link to="/games" className="mt-4 inline-block text-primary underline">Back to games</Link>
        </main>
        <SiteFooter />
      </div>
    )
  }

  // All the existing JSX below the `if (!game)` check can remain completely unchanged.
  // ...existing render JSX stays here...
```

**Step 3: Remove the `const related` line**

The current file has something like:
```tsx
const related = mockGames
  .filter((g) => g.slug.current !== slug)
  .slice(0, 4)
```

Delete this line — `related` is now set via state in the `useEffect` above.

**Step 4: Verify**

Navigate to `http://localhost:5173/games/stardew-valley`. You should see:
- Brief loading spinner
- Stardew Valley detail page with real data
- Related games section showing other real games
- Cover image displayed correctly

**Step 5: Commit**

```bash
git add src/pages/gamedetailpage.tsx
git commit -m "feat(games): switch gamedetailpage from mock data to live Sanity via getGame()"
```

---

### Task 8: Delete `src/data/mock-data.ts`

**Files:**
- Delete: `src/data/mock-data.ts`

**Step 1: Confirm nothing imports it**

```bash
grep -r "mock-data" src/
```

Expected output: empty (no matches). If any matches remain, fix those files first before deleting.

**Step 2: Delete the file**

```bash
rm src/data/mock-data.ts
```

**Step 3: Confirm build still passes**

```bash
npm run build
```

Expected: successful TypeScript compilation with no errors.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: delete mock-data.ts — all pages now use live Sanity data"
```

---

## Summary of all commits

| Task | Commit message |
|------|---------------|
| 1 | `feat(schema): remove ratings object, add openCriticId + steamAppId to game` |
| 2 | `feat(pip): add OpenCritic module with score update + search` |
| 3 | `feat(pip): run OpenCritic score update as Step 0 in nightly job` |
| 4 | `feat: add one-time Sanity migration script for games and homePage` |
| 5 | `feat(homepage): switch from mock data to live Sanity via getHomePage()` |
| 6 | `feat(games): switch gamespage from mock data to live Sanity via getAllGames()` |
| 7 | `feat(games): switch gamedetailpage from mock data to live Sanity via getGame()` |
| 8 | `chore: delete mock-data.ts — all pages now use live Sanity data` |

## What to check after all tasks

1. Sanity Studio shows 10 game documents with OpenCritic scores, no Ratings field
2. `node pip/opencritic.js "Stardew Valley"` returns ID + name
3. `node --env-file=.env.local scripts/migrate-to-sanity.js` completes without errors
4. Homepage shows live game carousels
5. `/games` page shows all 10 games with filters working
6. `/games/stardew-valley` loads with full detail and related games
7. `npm run build` succeeds with no TypeScript errors
