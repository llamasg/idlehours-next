/**
 * Pip — Research Module
 *
 * Fetches data from:
 *   - Plausible Analytics (sessions, top pages, traffic sources, countries)
 *   - Google Search Console (queries, positions, CTR, quick wins)
 *
 * Returns a structured research object that generate.js uses as context.
 *
 * Usage: node pip/research.js  (runs standalone for testing)
 */

import dotenv from 'dotenv'
// Load .env.local first (takes priority), then fall back to .env
dotenv.config({ path: '.env.local' })
dotenv.config()
import { readFileSync } from 'fs'
import { google } from 'googleapis'

// ── SEARCH CONSOLE AUTH ───────────────────────────────────────────────────

function getGoogleAuth() {
  const scopes = [
    'https://www.googleapis.com/auth/webmasters.readonly',
  ]

  // In GitHub Actions, the JSON is passed as an env var string
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    return new google.auth.GoogleAuth({ credentials, scopes })
  }

  // Local dev — explicitly read and parse the JSON file
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const credentials = JSON.parse(readFileSync(keyFile, 'utf8'))
  return new google.auth.GoogleAuth({ credentials, scopes })
}

// ── PLAUSIBLE ─────────────────────────────────────────────────────────────

async function fetchPlausibleData() {
  const apiKey = process.env.PLAUSIBLE_API_KEY
  const siteId = 'idlehours.co.uk'
  const baseUrl = 'https://plausible.io/api/v1/stats'

  if (!apiKey) {
    console.warn('⚠️  PLAUSIBLE_API_KEY not set — skipping Plausible')
    return null
  }

  console.log('📊 Fetching Plausible data...')

  const headers = { Authorization: `Bearer ${apiKey}` }

  try {
    // Previous 7-day window for delta (days 14–8 ago)
    const today = new Date()
    const prevEnd = new Date(today)
    prevEnd.setDate(today.getDate() - 8)
    const prevStart = new Date(today)
    prevStart.setDate(today.getDate() - 14)
    const prevEndStr = prevEnd.toISOString().split('T')[0]
    const prevStartStr = prevStart.toISOString().split('T')[0]

    const [thisWeekResp, prevWeekResp, pagesResp, sourcesResp, countriesResp] = await Promise.all([
      fetch(`${baseUrl}/aggregate?site_id=${siteId}&period=7d&metrics=visitors,pageviews,visit_duration,bounce_rate`, { headers }),
      fetch(`${baseUrl}/aggregate?site_id=${siteId}&period=custom&date=${prevStartStr},${prevEndStr}&metrics=visitors`, { headers }),
      fetch(`${baseUrl}/breakdown?site_id=${siteId}&period=7d&property=event:page&metrics=visitors&limit=10`, { headers }),
      fetch(`${baseUrl}/breakdown?site_id=${siteId}&period=7d&property=visit:source&metrics=visitors&limit=10`, { headers }),
      fetch(`${baseUrl}/breakdown?site_id=${siteId}&period=7d&property=visit:country&metrics=visitors&limit=5`, { headers }),
    ])

    const [thisWeek, prevWeek, pages, sources, countries] = await Promise.all([
      thisWeekResp.json(),
      prevWeekResp.json(),
      pagesResp.json(),
      sourcesResp.json(),
      countriesResp.json(),
    ])

    // Sessions / visitors
    const sessions7d = thisWeek.results?.visitors?.value ?? 0
    const sessions7dPrev = prevWeek.results?.visitors?.value ?? 0
    const sessionsDelta = sessions7dPrev > 0
      ? Math.round(((sessions7d - sessions7dPrev) / sessions7dPrev) * 100)
      : 0
    const avgSessionDuration = thisWeek.results?.visit_duration?.value ?? 0

    // Top pages (filter out /pip, convert path to display title)
    const topPages = (pages.results || [])
      .filter(p => !p.page.includes('/pip'))
      .slice(0, 5)
      .map(p => ({
        title: pathToTitle(p.page),
        path: p.page,
        sessions: p.visitors,
        avgReadTime: 0,
        bounceRate: 0,
      }))

    // Traffic sources — map to organic / direct / social / referral
    const organicSources = ['google', 'bing', 'duckduckgo', 'yahoo', 'yandex', 'baidu', 'ecosia']
    const socialSources = ['twitter', 'facebook', 'instagram', 'pinterest', 'tiktok', 'reddit', 'linkedin', 'threads', 'bluesky', 'mastodon']

    const sourceMap = { organic: 0, direct: 0, social: 0, referral: 0 }
    for (const row of sources.results || []) {
      const src = (row.source || '').toLowerCase()
      const count = row.visitors || 0
      if (!src || src === 'direct / none' || src === 'direct') {
        sourceMap.direct += count
      } else if (organicSources.some(s => src.includes(s))) {
        sourceMap.organic += count
      } else if (socialSources.some(s => src.includes(s))) {
        sourceMap.social += count
      } else {
        sourceMap.referral += count
      }
    }

    const totalSourceSessions = Object.values(sourceMap).reduce((a, b) => a + b, 0)
    const trafficSources = {
      organic: totalSourceSessions > 0 ? Math.round(sourceMap.organic / totalSourceSessions * 100) : 0,
      direct: totalSourceSessions > 0 ? Math.round(sourceMap.direct / totalSourceSessions * 100) : 0,
      social: totalSourceSessions > 0 ? Math.round(sourceMap.social / totalSourceSessions * 100) : 0,
      referral: totalSourceSessions > 0 ? Math.round(sourceMap.referral / totalSourceSessions * 100) : 0,
    }

    // Top countries
    const totalCountryVisitors = (countries.results || []).reduce((s, r) => s + (r.visitors || 0), 0)
    const topCountries = (countries.results || []).map(r => ({
      country: r.country,
      sessions: r.visitors,
      pct: totalCountryVisitors > 0 ? Math.round(r.visitors / totalCountryVisitors * 100) : 0,
    }))

    console.log(`✅ Plausible: ${sessions7d} visitors this week (${sessionsDelta > 0 ? '+' : ''}${sessionsDelta}%)`)

    return {
      sessions7d,
      sessionsDelta,
      avgSessionDuration,
      returnVisitorPct: 0,
      newVisitorPct: 100,
      topPages,
      trafficSources,
      weeklyTrend: [],
      topCountries,
    }

  } catch (error) {
    console.error('❌ Plausible error:', error.message)
    return null
  }
}

// Convert a URL path to a readable title: /posts/my-post → My Post
function pathToTitle(path) {
  const slug = path.split('/').filter(Boolean).pop() || path
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

// ── SEARCH CONSOLE ────────────────────────────────────────────────────────

async function fetchSearchConsoleData() {
  const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL

  if (!siteUrl) {
    console.warn('⚠️  SEARCH_CONSOLE_SITE_URL not set — skipping Search Console')
    return null
  }

  console.log('🔍 Fetching Search Console data...')

  try {
    const auth = getGoogleAuth()
    const searchconsole = google.searchconsole({ version: 'v1', auth })

    // ── Top queries (last 28 days for enough data) ──
    const queriesResponse = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: formatDate(28),
        endDate: formatDate(0),
        dimensions: ['query'],
        rowLimit: 20,
        orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }],
      },
    })

    const topQueries = (queriesResponse.data.rows || []).map(row => ({
      query: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: Math.round(row.ctr * 1000) / 10,
      position: Math.round(row.position * 10) / 10,
    }))

    // ── Quick wins: queries ranking 11-25 (page 2) with decent impressions ──
    const quickWins = topQueries
      .filter(q => q.position >= 11 && q.position <= 25 && q.impressions >= 100)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 5)
      .map(q => ({
        query: q.query,
        position: q.position,
        impressions: q.impressions,
        opportunity: generateOpportunityNote(q),
      }))

    // ── Top pages by clicks ──
    const pagesResponse = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: formatDate(28),
        endDate: formatDate(0),
        dimensions: ['page'],
        rowLimit: 10,
        orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }],
      },
    })

    const topPages = (pagesResponse.data.rows || []).map(row => ({
      page: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      position: Math.round(row.position * 10) / 10,
    }))

    console.log(`✅ Search Console: ${topQueries.length} queries found, ${quickWins.length} quick wins`)

    return {
      topQueries,
      quickWins,
      topPages,
      rankingPosts: topQueries.filter(q => q.position <= 20).length,
      page2Opportunities: quickWins.length,
    }

  } catch (error) {
    console.error('❌ Search Console error:', error.message)
    return null
  }
}

// ── HELPERS ───────────────────────────────────────────────────────────────

function formatDate(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

function generateOpportunityNote(query) {
  if (query.position <= 15) {
    return `Sitting at position ${query.position} — one more internal link or a cluster post could push this into the top 10.`
  }
  if (query.impressions >= 1000) {
    return `High volume (${query.impressions} impressions) at position ${query.position}. A dedicated post targeting this exactly could move quickly.`
  }
  return `Position ${query.position} with ${query.impressions} impressions — worth a targeted post.`
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────

export async function fetchResearchData() {
  console.log('\n🌱 Pip is doing her research...\n')

  const [plausible, searchConsole] = await Promise.all([
    fetchPlausibleData(),
    fetchSearchConsoleData(),
  ])

  const research = {
    fetchedAt: new Date().toISOString(),
    plausible,
    searchConsole,
    summary: buildSummary(plausible, searchConsole),
  }

  return research
}

function buildSummary(plausible, searchConsole) {
  const lines = []

  if (plausible) {
    lines.push(`Traffic this week: ${plausible.sessions7d} visitors (${plausible.sessionsDelta > 0 ? '+' : ''}${plausible.sessionsDelta}% vs last week)`)
    lines.push(`Avg session duration: ${Math.round(plausible.avgSessionDuration)}s`)
    if (plausible.topPages.length > 0) {
      lines.push(`Top post: "${plausible.topPages[0].title}" (${plausible.topPages[0].sessions} visitors)`)
    }
  } else {
    lines.push('Plausible data unavailable')
  }

  if (searchConsole) {
    lines.push(`Posts ranking in top 20: ${searchConsole.rankingPosts}`)
    lines.push(`Page 2 quick wins: ${searchConsole.page2Opportunities}`)
    if (searchConsole.quickWins.length > 0) {
      const best = searchConsole.quickWins[0]
      lines.push(`Best quick win: "${best.query}" at position ${best.position} (${best.impressions} impressions)`)
    }
  } else {
    lines.push('Search Console data unavailable')
  }

  return lines.join('\n')
}

// ── STANDALONE TEST ───────────────────────────────────────────────────────
// Run directly to test: node pip/research.js

if (process.argv[1].endsWith('research.js')) {
  const research = await fetchResearchData()
  console.log('\n📋 Research summary:')
  console.log(research.summary)
  console.log('\n📦 Full data:')
  console.log(JSON.stringify(research, null, 2))
}
