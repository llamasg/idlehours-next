/**
 * Pip — Sanity Module
 *
 * Reads and writes to Sanity CMS.
 *
 * Reads:  post documents (to check cluster progress, streak, total posts)
 * Writes: pip_dashboard singleton (morning message, ideas, analytics snapshot)
 *
 * Existing Sanity project: ijj3h2lj (production dataset)
 * See src/lib/sanity.ts in the React frontend for the read-only client.
 * This module uses a write token for mutations.
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()
import { createClient } from '@sanity/client'

// ── CLIENT ────────────────────────────────────────────────────────────────

function getSanityClient() {
  const projectId = process.env.SANITY_PROJECT_ID || 'ijj3h2lj'
  const dataset = process.env.SANITY_DATASET || 'production'
  const token = process.env.SANITY_WRITE_TOKEN

  if (!token) {
    console.warn('⚠️  SANITY_WRITE_TOKEN not set — Sanity writes will fail')
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    token,
    useCdn: false,
  })
}

// ── READ ──────────────────────────────────────────────────────────────────

/**
 * Fetch published posts from Sanity to calculate streak, cluster progress, etc.
 * Returns an empty array if the query fails (job continues without it).
 */
export async function fetchPosts() {
  const client = getSanityClient()

  try {
    const posts = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc) {
        _id, title, slug, publishedAt,
        "clusterName": clusterName,
        "clusterRole": clusterRole,
        "moodTags": moodTags,
        "excerpt": coalesce(excerpt, subheader)
      }
    `)
    console.log(`📚 Fetched ${posts.length} posts from Sanity`)
    return posts
  } catch (error) {
    console.warn('⚠️  Could not fetch posts from Sanity:', error.message)
    return []
  }
}

/**
 * Calculate the current publishing streak (consecutive weeks with at least one post).
 */
function calculateStreak(posts) {
  if (!posts.length) return 0

  let streak = 0
  const now = new Date()
  let weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of current week

  for (let i = 0; i < 52; i++) {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const hasPost = posts.some(p => {
      const d = new Date(p.publishedAt)
      return d >= weekStart && d < weekEnd
    })

    if (!hasPost && i > 0) break // Gap found — streak ends
    if (hasPost) streak++

    weekStart.setDate(weekStart.getDate() - 7) // Go back one week
  }

  return streak
}

// ── WRITE ─────────────────────────────────────────────────────────────────

/**
 * Write the nightly results to the pip_dashboard singleton in Sanity.
 * Uses createOrReplace so it's always up-to-date with a single document.
 */
export async function writeToDashboard({ research, generated, posts = [] }) {
  const client = getSanityClient()

  console.log('\n📝 Writing to Sanity...')

  const streak = calculateStreak(posts)

  // Flatten analytics for Sanity (all primitives — no nested _key issues)
  const analyticsDoc = research.plausible ? {
    sessions7d: research.plausible.sessions7d,
    sessionsDelta: research.plausible.sessionsDelta,
    avgSessionDuration: Math.round(research.plausible.avgSessionDuration),
    returnVisitorPct: research.plausible.returnVisitorPct,
    newVisitorPct: research.plausible.newVisitorPct,
    trafficSources: research.plausible.trafficSources,
    weeklyTrend: research.plausible.weeklyTrend,
    topPages: research.plausible.topPages.map(p => ({
      _key: p.path.replace(/\//g, '_').replace(/^_/, '') || 'home',
      title: p.title,
      path: p.path,
      sessions: p.sessions,
      avgReadTime: p.avgReadTime,
      bounceRate: p.bounceRate,
    })),
    topCountries: research.plausible.topCountries.map(c => ({
      _key: c.country.toLowerCase().replace(/\s/g, '_'),
      country: c.country,
      sessions: c.sessions,
      pct: c.pct,
    })),
  } : null

  const searchDoc = research.searchConsole ? {
    rankingPosts: research.searchConsole.rankingPosts,
    page2Opportunities: research.searchConsole.page2Opportunities,
    topQueries: research.searchConsole.topQueries.slice(0, 10).map((q, i) => ({
      _key: `q${i}`,
      query: q.query,
      clicks: q.clicks,
      impressions: q.impressions,
      ctr: q.ctr,
      position: q.position,
    })),
    quickWins: research.searchConsole.quickWins.map((q, i) => ({
      _key: `w${i}`,
      query: q.query,
      position: q.position,
      impressions: q.impressions,
      opportunity: q.opportunity,
    })),
  } : null

  const ideasDocs = generated?.ideas
    ? generated.ideas.map((idea, i) => ({
        _key: idea.id || `idea-${i}`,
        type: idea.type,
        typeEmoji: idea.typeEmoji,
        title: idea.title,
        reason: idea.reason,
        difficulty: idea.difficulty,
        cluster: idea.cluster,
        trending: idea.trending,
      }))
    : []

  const doc = {
    _type: 'pip_dashboard',
    _id: 'pip-dashboard-singleton',
    generatedAt: generated?.generatedAt || new Date().toISOString(),
    morningMessage: generated?.morningMessage || null,
    ideas: ideasDocs,
    analytics: analyticsDoc,
    searchConsole: searchDoc,
    siteStats: {
      totalPosts: posts.length,
      streak,
      lastUpdated: new Date().toISOString(),
    },
  }

  await client.createOrReplace(doc)
  console.log('✅ Sanity updated: pip-dashboard-singleton')
  console.log(`   ${ideasDocs.length} ideas written`)
  console.log(`   Analytics: ${analyticsDoc ? 'yes' : 'no data'}`)
  console.log(`   Search Console: ${searchDoc ? 'yes' : 'no data'}`)
  console.log(`   Posts found: ${posts.length}, streak: ${streak} weeks`)
}

// ── STANDALONE TEST ───────────────────────────────────────────────────────
// Run directly to test the Sanity connection: node pip/sanity.js

if (process.argv[1].endsWith('sanity.js')) {
  console.log('\n🧪 Testing Sanity connection...')
  const posts = await fetchPosts()
  console.log(`\n📊 Post count: ${posts.length}`)
  if (posts.length > 0) {
    console.log('Most recent post:', posts[0].title, '—', posts[0].publishedAt)
  }
  console.log('\n✅ Sanity read test complete')
}
