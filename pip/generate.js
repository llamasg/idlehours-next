/**
 * Pip — Generation Module
 *
 * Uses Claude API to generate:
 *   - 6 post ideas (based on research data + active cluster)
 *   - Morning message for Beth
 *
 * Model strategy:
 *   - claude-haiku  → ideas (fast, cost-efficient, creative)
 *   - claude-sonnet → morning message (warmer, more contextual)
 *
 * Usage: node pip/generate.js  (runs standalone for testing)
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Map content types to emojis (matches PipIdea.typeEmoji in the dashboard)
const TYPE_EMOJIS = {
  'List': '\u{1F4CB}',
  'Essay': '\u{270D}\u{FE0F}',
  'Review': '\u{2B50}',
  'Mood Editorial': '\u{1F319}',
  'Guide': '\u{1F4D6}',
}

function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning'
  if (hour < 17) return 'Afternoon'
  return 'Evening'
}

// ── IDEAS ─────────────────────────────────────────────────────────────────

async function generateIdeas(research) {
  const { plausible: ga4, searchConsole } = research
  const activeCluster = process.env.PIP_ACTIVE_CLUSTER || 'Cosy Lifestyle'

  // Build a concise context block for the prompt
  const contextLines = [
    'Site: idlehours.co.uk — UK cosy games and mental wellness blog',
    'Author: Beth, UK-based, writes in a warm, honest, non-hustle voice',
  ]

  if (ga4) {
    contextLines.push(`Sessions this week: ${ga4.sessions7d} (${ga4.sessionsDelta > 0 ? '+' : ''}${ga4.sessionsDelta}% vs last week)`)
    contextLines.push(`Return visitors: ${ga4.returnVisitorPct}%`)
    if (ga4.topPages.length > 0) {
      contextLines.push(`Top content by traffic: ${ga4.topPages.map(p => `"${p.title}"`).join(', ')}`)
    }
    const topSource = Object.entries(ga4.trafficSources).sort((a, b) => b[1] - a[1])[0]
    if (topSource) {
      contextLines.push(`Main traffic source: ${topSource[0]} (${topSource[1]}%)`)
    }
  }

  if (searchConsole) {
    if (searchConsole.quickWins.length > 0) {
      contextLines.push(`SEO quick wins (page 2, worth targeting): ${searchConsole.quickWins.map(q => `"${q.query}" pos ${q.position} (${q.impressions} impressions)`).join(', ')}`)
    }
    if (searchConsole.topQueries.length > 0) {
      contextLines.push(`Top search queries bringing clicks: ${searchConsole.topQueries.slice(0, 5).map(q => `"${q.query}"`).join(', ')}`)
    }
  }

  contextLines.push(`Active content cluster (prioritise ideas here): ${activeCluster}`)

  const prompt = `You are Pip, an insightful content strategist for idlehours.co.uk, a cosy gaming and mental wellness blog.

SITE CONTEXT:
${contextLines.join('\n')}

AVAILABLE CLUSTERS:
- Anxiety & Low Energy
- Games Like Stardew Valley
- Cosy Lifestyle
- Standalone

TASK:
Generate exactly 6 post ideas for Beth. Mix types. Aim for 2-3 ideas in the active cluster "${activeCluster}", the rest spread across other clusters.

RULES:
- reason: 2-3 sentences, direct to Beth, warm but not patronising, reference the actual data where relevant
- difficulty: 1 = quick win (list post, 500-800 words), 2 = normal (1000-1500 words), 3 = involved (essay, deep research)
- trending: true only if it directly ties to a current quick win or top-performing topic
- type must be exactly one of: List, Essay, Review, Mood Editorial, Guide

Respond with a JSON array ONLY. No markdown fences, no explanation, just the array.

[
  {
    "type": "List",
    "title": "post title here",
    "reason": "2-3 sentences to Beth explaining why this idea, referencing the data",
    "difficulty": 1,
    "cluster": "Anxiety & Low Energy",
    "trending": true
  }
]`

  console.log('💡 Generating ideas with Claude Haiku...')

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2500,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = response.content[0].text.trim()

  // Strip markdown fences if the model adds them despite the instruction
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()
  const ideas = JSON.parse(cleaned)

  return ideas.map((idea, i) => ({
    id: `idea-${Date.now()}-${i}`,
    type: idea.type,
    typeEmoji: TYPE_EMOJIS[idea.type] || '\u{1F4DD}',
    title: idea.title,
    reason: idea.reason,
    difficulty: Math.max(1, Math.min(3, idea.difficulty)),
    cluster: idea.cluster,
    trending: Boolean(idea.trending),
  }))
}

// ── MORNING MESSAGE ───────────────────────────────────────────────────────

async function generateMorningMessage(research, streak = 0, activeCluster, totalPosts = 0) {
  const { plausible: ga4 } = research
  const cluster = activeCluster || process.env.PIP_ACTIVE_CLUSTER || 'Cosy Lifestyle'
  const timeOfDay = getTimeOfDay()

  const isNewBlog = totalPosts < 10
  const hasTraffic = (ga4?.sessions7d ?? 0) > 50

  const contextNote = isNewBlog
    ? `IMPORTANT: This blog is brand new with only ${totalPosts} post(s). Pip is in her first weeks on the job. The tone should be warm and encouraging about getting started — NOT analytical or warning about growth problems. At this stage, ANY traffic is great. Focus on momentum and the next post.`
    : hasTraffic
    ? `The blog has ${ga4.sessions7d} sessions this week. You can start referencing specific data and growth patterns.`
    : `Traffic is still building. Keep the tone encouraging and focused on content quality.`

  const statsLines = []
  if (ga4) {
    const trend = ga4.sessionsDelta > 0 ? `up ${ga4.sessionsDelta}%` : ga4.sessionsDelta < 0 ? `down ${Math.abs(ga4.sessionsDelta)}%` : 'flat'
    statsLines.push(`Traffic: ${ga4.sessions7d} sessions this week, ${trend} on last week`)
    if (ga4.topPages[0]) {
      statsLines.push(`Top post: "${ga4.topPages[0].title}" (${ga4.topPages[0].sessions} sessions)`)
    }
    statsLines.push(`Return visitors: ${ga4.returnVisitorPct}%`)
  } else {
    statsLines.push('Analytics data not available today')
  }

  const prompt = `You are Pip, Beth's creative partner for idlehours.co.uk — a UK cosy games blog.

${contextNote}

Current stats:
${statsLines.join('\n')}

Writing streak: ${streak} days
Active cluster: ${cluster}
Total posts published: ${totalPosts}

Write a morning message for Beth. Rules:
- Maximum 2 sentences (strictly — not 3, not 4, TWO)
- Start with "${timeOfDay}, Beth!"
- If the blog is new (under 10 posts): be warm and focus on the next post, not analytics
- If there's real traffic: mention ONE specific number that's genuinely interesting
- End with something that makes her want to open her writing app
- Never use phrases like "not a crisis", "signal", "worth sitting with"
- Sound like a friend who's excited about this project, not a consultant
- UK spelling

Return ONLY the message, nothing else.`

  console.log('✉️  Generating morning message with Claude Sonnet...')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 100,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content[0].text.trim()
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────

export async function generateContent(research, posts = []) {
  console.log('\n✨ Generating content with Claude...')

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY not set — skipping generation')
    return null
  }

  const activeCluster = process.env.PIP_ACTIVE_CLUSTER || 'Cosy Lifestyle'
  const totalPosts = posts.length

  try {
    const [ideas, morningMessage] = await Promise.all([
      generateIdeas(research),
      generateMorningMessage(research, 0, activeCluster, totalPosts),
    ])

    console.log(`✅ Generated ${ideas.length} ideas + morning message`)

    return {
      generatedAt: new Date().toISOString(),
      ideas,
      morningMessage,
    }
  } catch (error) {
    console.error('❌ Generation error:', error.message)
    return null
  }
}

// ── STANDALONE TEST ───────────────────────────────────────────────────────
// Run directly to test: node pip/generate.js

if (process.argv[1].endsWith('generate.js')) {
  const { fetchResearchData } = await import('./research.js')
  const { fetchPosts } = await import('./sanity.js')
  const research = await fetchResearchData()
  const posts = await fetchPosts()
  const generated = await generateContent(research, posts)

  if (generated) {
    console.log('\n📋 Morning message:\n')
    console.log(generated.morningMessage)
    console.log('\n💡 Ideas:\n')
    generated.ideas.forEach((idea, i) => {
      console.log(`${i + 1}. [${idea.type}] ${idea.title}`)
      console.log(`   Cluster: ${idea.cluster} | Difficulty: ${idea.difficulty} | Trending: ${idea.trending}`)
      console.log(`   ${idea.reason.substring(0, 120)}...`)
      console.log()
    })
  }
}
