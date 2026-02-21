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
const IMAGE_MAP = {
  'stardew-valley':               'Stardew valley.png',
  'animal-crossing-new-horizons': 'animalcrossing.jpg',
  'unpacking':                    'unpacked.png',
  'spiritfarer':                  'spiritfarer.jpg',
  'a-short-hike':                 'ashorthike.jpg',
  'palia':                        'palia.png',
  'coffee-talk':                  'coffeetalk.webp',
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

    if (game.longDescription) {
      doc.longDescription = game.longDescription
    }

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
  let posts = []
  let products = []
  if (!DRY_RUN) {
    posts = await client.fetch(
      `*[_type == "post"] | order(publishedAt desc) { _id, title }[0...4]`
    )
    products = await client.fetch(
      `*[_type == "product"] | order(order asc) { _id, name }`
    )
    console.log(`  Posts found: ${posts.length}`)
    console.log(`  Products found: ${products.length}`)
  } else {
    console.log('  (DRY RUN — skipping Sanity queries, using empty arrays)')
  }

  // ── Step 4: Create homePage document ──────────────────────────────────
  console.log('\n🏠 Step 4: Creating homePage document...')

  const ref = (id, key) => ({ _type: 'reference', _ref: id, _key: key })

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
