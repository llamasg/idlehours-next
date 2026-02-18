/**
 * Pip — Research Module
 *
 * Fetches data from:
 *   - Google Analytics 4 (sessions, top pages, traffic sources, trends)
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
import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { google } from 'googleapis'

// ── AUTH ─────────────────────────────────────────────────────────────────

function getGoogleAuth() {
  // In GitHub Actions, the JSON is passed as an env var string
  // Locally, we use the file path in GOOGLE_APPLICATION_CREDENTIALS
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    return new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/webmasters.readonly',
      ],
    })
  }

  // Local dev — uses file path
  return new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/webmasters.readonly',
    ],
  })
}

function getAnalyticsClient() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    return new BetaAnalyticsDataClient({ credentials })
  }
  return new BetaAnalyticsDataClient()
}

// ── GA4 ──────────────────────────────────────────────────────────────────

async function fetchGA4Data() {
  const client = getAnalyticsClient()
  const propertyId = process.env.GA4_PROPERTY_ID

  if (!propertyId) {
    console.warn('⚠️  GA4_PROPERTY_ID not set — skipping GA4')
    return null
  }

  console.log('📊 Fetching GA4 data...')

  try {
    // ── Sessions: this week vs last week ──
    const [sessionsResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        { startDate: '7daysAgo', endDate: 'today', name: 'this_week' },
        { startDate: '14daysAgo', endDate: '8daysAgo', name: 'last_week' },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'averageSessionDuration' },
        { name: 'newUsers' },
        { name: 'returningUsers' },
      ],
    })

    const thisWeek = sessionsResponse.rows?.find(r => r.dimensionValues?.[0]?.value === 'this_week')
    const lastWeek = sessionsResponse.rows?.find(r => r.dimensionValues?.[0]?.value === 'last_week')

    const sessions7d = parseInt(thisWeek?.metricValues?.[0]?.value || 0)
    const sessions7dPrev = parseInt(lastWeek?.metricValues?.[0]?.value || 0)
    const sessionsDelta = sessions7dPrev > 0
      ? Math.round(((sessions7d - sessions7dPrev) / sessions7dPrev) * 100)
      : 0
    const avgSessionDuration = parseFloat(thisWeek?.metricValues?.[1]?.value || 0)
    const newUsers = parseInt(thisWeek?.metricValues?.[2]?.value || 0)
    const returningUsers = parseInt(thisWeek?.metricValues?.[3]?.value || 0)
    const totalUsers = newUsers + returningUsers
    const returnVisitorPct = totalUsers > 0 ? Math.round((returningUsers / totalUsers) * 100) : 0

    // ── Top pages ──
    const [pagesResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pageTitle' }, { name: 'pagePath' }],
      metrics: [
        { name: 'sessions' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
      dimensionFilter: {
        notExpression: {
          filter: {
            fieldName: 'pagePath',
            stringFilter: { matchType: 'EXACT', value: '/' },
          },
        },
      },
    })

    const topPages = (pagesResponse.rows || [])
      .filter(row => !row.dimensionValues[1].value.includes('/pip'))
      .slice(0, 5)
      .map(row => ({
        title: row.dimensionValues[0].value,
        path: row.dimensionValues[1].value,
        sessions: parseInt(row.metricValues[0].value),
        avgReadTime: Math.round(parseFloat(row.metricValues[1].value)),
        bounceRate: Math.round(parseFloat(row.metricValues[2].value) * 100),
      }))

    // ── Traffic sources ──
    const [sourcesResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    })

    const sourceMap = {}
    for (const row of sourcesResponse.rows || []) {
      const channel = row.dimensionValues[0].value.toLowerCase()
      const count = parseInt(row.metricValues[0].value)
      if (channel.includes('organic')) sourceMap.organic = (sourceMap.organic || 0) + count
      else if (channel.includes('direct')) sourceMap.direct = (sourceMap.direct || 0) + count
      else if (channel.includes('social')) sourceMap.social = (sourceMap.social || 0) + count
      else sourceMap.referral = (sourceMap.referral || 0) + count
    }

    const totalSessions = Object.values(sourceMap).reduce((a, b) => a + b, 0)
    const trafficSources = {
      organic: totalSessions > 0 ? Math.round((sourceMap.organic || 0) / totalSessions * 100) : 0,
      direct: totalSessions > 0 ? Math.round((sourceMap.direct || 0) / totalSessions * 100) : 0,
      social: totalSessions > 0 ? Math.round((sourceMap.social || 0) / totalSessions * 100) : 0,
      referral: totalSessions > 0 ? Math.round((sourceMap.referral || 0) / totalSessions * 100) : 0,
    }

    // ── 8-week trend ──
    const [trendResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '56daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'week' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ dimension: { dimensionName: 'week' }, desc: false }],
    })

    const weeklyTrend = (trendResponse.rows || [])
      .slice(-8)
      .map(row => parseInt(row.metricValues[0].value))

    // ── Top countries ──
    const [countriesResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 5,
    })

    const totalCountrySessions = (countriesResponse.rows || [])
      .reduce((sum, row) => sum + parseInt(row.metricValues[0].value), 0)

    const topCountries = (countriesResponse.rows || []).map(row => ({
      country: row.dimensionValues[0].value,
      sessions: parseInt(row.metricValues[0].value),
      pct: Math.round(parseInt(row.metricValues[0].value) / totalCountrySessions * 100),
    }))

    console.log(`✅ GA4: ${sessions7d} sessions this week (${sessionsDelta > 0 ? '+' : ''}${sessionsDelta}%)`)

    return {
      sessions7d,
      sessionsDelta,
      avgSessionDuration,
      returnVisitorPct,
      newVisitorPct: 100 - returnVisitorPct,
      topPages,
      trafficSources,
      weeklyTrend,
      topCountries,
    }

  } catch (error) {
    console.error('❌ GA4 error:', error.message)
    return null
  }
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

  const [ga4, searchConsole] = await Promise.all([
    fetchGA4Data(),
    fetchSearchConsoleData(),
  ])

  const research = {
    fetchedAt: new Date().toISOString(),
    ga4,
    searchConsole,
    summary: buildSummary(ga4, searchConsole),
  }

  return research
}

function buildSummary(ga4, searchConsole) {
  const lines = []

  if (ga4) {
    lines.push(`Traffic this week: ${ga4.sessions7d} sessions (${ga4.sessionsDelta > 0 ? '+' : ''}${ga4.sessionsDelta}% vs last week)`)
    lines.push(`Avg session duration: ${Math.round(ga4.avgSessionDuration)}s`)
    lines.push(`Return visitors: ${ga4.returnVisitorPct}%`)
    if (ga4.topPages.length > 0) {
      lines.push(`Top post: "${ga4.topPages[0].title}" (${ga4.topPages[0].sessions} sessions, ${Math.round(ga4.topPages[0].avgReadTime / 60 * 10) / 10} min read time)`)
    }
  } else {
    lines.push('GA4 data unavailable')
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
