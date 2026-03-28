import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, key)

interface JobSeed {
  title: string
  column: 'website' | 'revenue' | 'marketing'
  status: 'active' | 'done'
  priority: 'low' | 'medium' | 'high'
  progress?: string
  body?: string
}

const JOBS: JobSeed[] = [
  // ── WEBSITE column (active) ──────────────────────────────────────────

  {
    title: 'Homepage redesign — implement below-fold',
    column: 'website',
    status: 'active',
    priority: 'high',
    body: "Build the below-fold homepage from the approved HTML artifact. Sections: Play a Game (asymmetric grid, Game Sense featured with sticky note), Latest Posts (featured + secondary cards), pull quote interstitial, Today's Pick + What We're Playing, Newsletter strip.",
  },
  {
    title: 'About page — implement redesign',
    column: 'website',
    status: 'active',
    priority: 'high',
    body: "Build the About page from the approved HTML artifact. Dark hero with CSS desk scene, Story section, What We Do (3 pillars + ratings explainer), Team section (Beth + Alfie with portrait areas + sticky notes), Manifesto closing strip.",
  },
  {
    title: 'Game Sense — mobile keyboard-aware layout',
    column: 'website',
    status: 'active',
    priority: 'high',
    body: "Implement visualViewport keyboard-open/closed state. Three changes in compact state: hint button collapses to icon only (max-width transition), score pill stays visible, guess list collapses to pip count ('2 of 5 guesses used'). Listen on window.visualViewport resize event, toggle .keyboard-open class.",
  },
  {
    title: 'Game Sense — archive page',
    column: 'website',
    status: 'active',
    priority: 'high',
    body: 'Build the Game Sense archive page. Rolodex scroll UI, calendar, selected entry card. Suppress from production with notFound(). Add to robots.txt.',
  },
  {
    title: 'Posts index — editorial hierarchy',
    column: 'website',
    status: 'active',
    priority: 'high',
    body: "The /posts page currently looks like a generic blog index. Needs: featured article treatment at top, mood/vibe-based category filters, Beth's voice present somewhere on the page (short intro line), read times on cards. Match the homepage editorial aesthetic.",
  },
  {
    title: 'Library — ratings on card face',
    column: 'website',
    status: 'active',
    priority: 'medium',
    body: "The Cozy %, Brain Effort, and Snack Safe ratings are the library's biggest differentiator but currently hidden inside individual game pages. They need to be visible on the card face. Implement as small icon+value pills in the card footer row.",
  },
  {
    title: 'Individual game pages — atmospheric treatment',
    column: 'website',
    status: 'active',
    priority: 'medium',
    body: "Each game page should feel like arriving somewhere. The game's colour palette should take over the page. Write-up should be editorially styled, not a form. Ratings should feel considered, not like metadata.",
  },
  {
    title: 'Play hub — Beth annotations on game cards',
    column: 'website',
    status: 'active',
    priority: 'medium',
    body: "Add a one-line sticky note annotation per game card on the Play hub, written by Beth. Should feel like a friend's recommendation, not a subtitle. Match the sticky note treatment from the homepage redesign.",
  },
  {
    title: 'Street Date — core build',
    column: 'website',
    status: 'active',
    priority: 'medium',
    body: 'Daily puzzle game. Player sees five game cover images revealed one by one and has to guess the release year order. Five rounds, 1000pt max. RPG rank system TBD. Share card mechanic — visual with covers. Supabase score storage.',
  },
  {
    title: 'Shelf Price — core build',
    column: 'website',
    status: 'active',
    priority: 'medium',
    body: 'Daily puzzle game. Player is shown a game and has to guess the current price. Five rounds, 1000pt max. RPG rank system TBD. Share card mechanic. Supabase score storage.',
  },
  {
    title: 'Game Sense — RPG rank badges',
    column: 'website',
    status: 'active',
    priority: 'medium',
    body: 'Commission or generate chunky limited-palette character illustrations for five ranks: Skill Issue (goblin, rusty gear), First Playthrough (scrappy adventurer), Knows the Lore (battle-worn warrior), Final Save (paladin, glowing plate), Legendary (radiant, full chaos energy). Use purple/navy/cream palette. Display on score screen and share card.',
  },
  {
    title: 'Share cards — all three games',
    column: 'website',
    status: 'active',
    priority: 'medium',
    body: "Each game needs a designed share card that appears after completing a daily puzzle. Game Sense: Wordle-style grid of correct/wrong attempts. Street Date: visual with cover thumbnails and result. Shelf Price: price reveal result. All cards should be immediately recognisable as Idle Hours assets.",
  },
  {
    title: 'Deals / sales page',
    column: 'website',
    status: 'active',
    priority: 'low',
    body: "Simple /deals page — manually curated 'worth buying right now' list. Beth updates it. Affiliate links to GOG, Humble Bundle, Green Man Gaming. Start with static Sanity content, later automate affiliate feeds.",
  },
  {
    title: 'Gift guide page',
    column: 'website',
    status: 'active',
    priority: 'low',
    body: "Evergreen page: 'Cozy games to give someone who says they don't game.' Angle: giving permission to start, not a ranked list. Target pre-Christmas. High SEO value. Written by Beth.",
  },
  {
    title: 'How to get into cozy gaming — Three.js room experience',
    column: 'website',
    status: 'active',
    priority: 'low',
    body: "Flagship interactive page. Walk through an illustrated cosy room — desk, lamp, bookshelves, TV. Room IS the navigation: click bookshelf = genres, click TV = platform recs, click notepad = Beth's starter picks. Builds toward a tailored shortlist. Three.js with flat-shape illustration style. Scope and build post core pages.",
  },

  // ── REVENUE column (active) ──────────────────────────────────────────

  {
    title: 'GOG affiliate programme — apply',
    column: 'revenue',
    status: 'active',
    priority: 'medium',
    progress: 'Not started',
    body: "Apply to GOG's affiliate programme at gog.com/affiliate. GOG is a DRM-free store with a strong indie catalogue — good fit for Idle Hours audience. Commission rate ~5%. Once approved, generate tracked links for any GOG game mentioned on the site.",
  },
  {
    title: 'Humble Bundle affiliate — apply',
    column: 'revenue',
    status: 'active',
    priority: 'medium',
    progress: 'Not started',
    body: 'Apply at humblebundle.com/affiliates. Humble Bundle has strong cozy/indie presence and bundle deals. Good for the deals page. Commission on bundle purchases.',
  },
  {
    title: 'Green Man Gaming affiliate — apply',
    column: 'revenue',
    status: 'active',
    priority: 'medium',
    progress: 'Not started',
    body: 'Apply at greenmangaming.com/affiliates. GMG runs frequent discounts on new releases. Good complement to the other two stores. Commission ~5%.',
  },
  {
    title: 'itch.io — explore affiliate options',
    column: 'revenue',
    status: 'active',
    priority: 'low',
    progress: 'Not started',
    body: "itch.io doesn't have a traditional affiliate programme but does allow revenue sharing on bundles. Many cozy indie games launch on itch first. Worth exploring direct relationships with developers rather than a platform-level affiliate deal.",
  },
  {
    title: 'Fanatical affiliate — apply',
    column: 'revenue',
    status: 'active',
    priority: 'medium',
    progress: 'Not started',
    body: 'Fanatical (fanatical.com) is a Steam key reseller with regular cozy game bundles. Good deals page candidate. Has an affiliate programme.',
  },
  {
    title: 'Build affiliate link management system',
    column: 'revenue',
    status: 'active',
    priority: 'medium',
    body: "Once multiple affiliate programmes are approved, we need a clean way to manage tracked links in Sanity — so any game in the library can have store links attached (GOG, Steam, Humble, GMG etc) with affiliate params. Should be: game record in Sanity → array of store links → rendered as buy buttons on game page and library card.",
  },
  {
    title: 'Create sponsored review rate card',
    column: 'revenue',
    status: 'active',
    priority: 'medium',
    progress: 'Not started',
    body: "Define what a sponsored review at Idle Hours looks like, what it costs, and what the rules are. Key: editorial independence is non-negotiable — Beth writes the review, the tone is honest, Idle Hours makes the final call on whether to recommend. Rates based on: standard sponsored review, featured placement, newsletter mention add-on. Write a one-page PDF rate card.",
  },
  {
    title: 'Create media kit / pitch deck',
    column: 'revenue',
    status: 'active',
    priority: 'medium',
    progress: 'Not started',
    body: "One-pager (or short deck) that explains what Idle Hours is, who reads it, what makes it different, and what sponsorship options exist. Audience profile: 25–40, predominantly women, lapsed or late-to-gaming, disposable income, trust-first. Include: editorial approach, site traffic, game stats, social following. Keep it warm and confident.",
  },
  {
    title: 'Identify indie studios to approach for sponsored reviews',
    column: 'revenue',
    status: 'active',
    priority: 'medium',
    progress: 'Not started',
    body: "Target: small-to-mid indie studios releasing cozy/chill games in the next 6 months. Good targets are games that would naturally be covered anyway. Find: upcoming cozy releases on Steam, itch, and Nintendo Indie World. Make a list of 20 studios with contact details and projected release dates.",
  },
  {
    title: 'Outreach — first wave of sponsored review pitches',
    column: 'revenue',
    status: 'active',
    priority: 'medium',
    progress: 'Not started',
    body: 'Once rate card and media kit are ready. Send 10 cold outreach emails to indie studios from the target list. Lead with genuine enthusiasm for their game, then mention the platform and the option. Goal: 2–3 responses, 1 booking.',
  },
  {
    title: 'Newsletter sponsorship — single slot per issue',
    column: 'revenue',
    status: 'active',
    priority: 'low',
    body: "Once the newsletter has a list worth selling. One sponsor per issue, clearly labelled, adjacent to editorial content. Warm copy written by Beth in Idle Hours voice. Rate TBD once list size is known.",
  },
  {
    title: 'Game Sense / puzzle games — potential brand partnership',
    column: 'revenue',
    status: 'active',
    priority: 'low',
    body: "Once games have consistent daily player numbers, approach gaming-adjacent brands about being the presenting sponsor of the daily game. 'Game Sense, brought to you by [x].' Premium placement with zero editorial interference. Only worth pursuing once there's a genuine audience.",
  },
  {
    title: 'Deals page — automated affiliate feed',
    column: 'revenue',
    status: 'active',
    priority: 'low',
    body: 'Post-launch. Pull live deals from Humble Bundle, Fanatical, GOG using their APIs or RSS feeds. Filter to cozy/indie only. Beth adds editorial notes to flagged deals. Automates the deals page update cycle without losing curation.',
  },

  // ── MARKETING column (active) ────────────────────────────────────────

  {
    title: 'Set up social accounts — consistent handles',
    column: 'marketing',
    status: 'active',
    priority: 'medium',
    progress: 'Not started',
    body: 'Secure @idlehours or @idlehoursgames on: Instagram, TikTok, Bluesky, Twitter/X. Bluesky is increasingly the home of indie games and games media — prioritise. Post nothing yet — just secure the handles.',
  },
  {
    title: 'Define content pillars for social',
    column: 'marketing',
    status: 'active',
    priority: 'medium',
    body: "What does Idle Hours post? Suggested pillars: 1) Game Sense daily result/reaction, 2) Beth's recommendations, 3) Behind the build, 4) Cozy gaming culture observations, 5) Seasonal/mood posts. Document these as the social content brief.",
  },
  {
    title: 'Game Sense — soft launch strategy',
    column: 'marketing',
    status: 'active',
    priority: 'high',
    body: 'Game Sense is the most viral-ready asset. Before full site launch: share daily results personally on Bluesky and Twitter. Encourage people to try it. The share card does the work — each shared result is an ad. Goal: 50 daily players before site launch.',
  },
  {
    title: 'Newsletter — set up and first issue',
    column: 'marketing',
    status: 'active',
    priority: 'medium',
    body: "Platform: TBD (Resend + custom, or Buttondown, or Beehiiv). First issue: introduce Idle Hours, introduce Beth, introduce Game Sense, link to three recent posts. Tone: 'A little something to read on a slow Sunday.' Collect emails from launch day.",
  },
  {
    title: 'Launch announcement — personal networks',
    column: 'marketing',
    status: 'active',
    priority: 'medium',
    body: "Both Alfie and Beth post personal launch announcements. Not hype — genuine 'we made this thing.' Alfie: dev/tech networks. Beth: gaming/culture networks. Aim for 200 visitors day one from people who already know you.",
  },
  {
    title: 'Keyword research — cozy games long tail',
    column: 'marketing',
    status: 'active',
    priority: 'medium',
    progress: 'Not started',
    body: "Research what Her Cozy Gaming ranks for that Idle Hours should also target. Priority topics: 'cozy games for beginners,' 'games like Stardew Valley,' 'best cozy games [year],' 'cozy games Switch,' 'short games to play when stressed.' Build a list of 30 target keywords mapped to existing or planned content.",
  },
  {
    title: 'SEO audit vs Her Cozy Gaming — post launch',
    column: 'marketing',
    status: 'active',
    priority: 'low',
    progress: 'Parked — post launch',
    body: "Once the site is live and indexed, run a full comparison against hercozygaming.com. What does she rank for that we don't cover? What content topics should we prioritise? Where are her backlinks coming from?",
  },
  {
    title: "Write 'best cozy games for beginners' — cornerstone SEO post",
    column: 'marketing',
    status: 'active',
    priority: 'medium',
    body: "Idle Hours version: more editorial, Beth's voice throughout, games presented as discoveries not a ranked list. Should naturally link to library entries. Target keyword: 'cozy games for beginners.' 1500–2000 words. Include affiliate links.",
  },
  {
    title: "Write 'games like Stardew Valley' — high intent SEO post",
    column: 'marketing',
    status: 'active',
    priority: 'medium',
    body: 'One of the highest-traffic searches in the cozy games niche. Beth explains what she loved about Stardew and finds the games that scratch the same itch. 1200–1500 words. Links to library entries.',
  },
  {
    title: "Write 'cozy games for people who don't play games' — gift guide anchor",
    column: 'marketing',
    status: 'active',
    priority: 'medium',
    body: 'Pre-cursor to the gift guide page. Angle: permission-giving. Target non-gaming readers who are curious. Links to library and eventually to the gift guide page.',
  },
  {
    title: 'Submit to cozy gaming directories and roundups',
    column: 'marketing',
    status: 'active',
    priority: 'low',
    body: "Search for: 'best cozy gaming websites,' 'cozy gaming blogs,' 'indie games discovery sites.' Find any listicles or directories that Her Cozy Gaming appears in but Idle Hours doesn't. Submit or reach out. Slow burn but generates backlinks.",
  },
  {
    title: 'Write press release — Idle Hours launch',
    column: 'marketing',
    status: 'active',
    priority: 'medium',
    progress: 'Not started',
    body: "Angle: 'Two people in Nottingham built a calmer version of gaming culture.' Lead with what makes it different. Target: UK gaming press (Rock Paper Shotgun, Eurogamer, GamesRadar), lifestyle press that covers digital wellness, indie game newsletters.",
  },
  {
    title: 'Press outreach — launch wave',
    column: 'marketing',
    status: 'active',
    priority: 'medium',
    progress: 'Not started',
    body: 'Send to 15 journalists/outlets. Prioritise: RPS, Kotaku UK, Edge, any journalist who has written about cozy gaming. Personal emails not press@ addresses. Include a working link to Game Sense.',
  },
  {
    title: 'Street Date launch — second press wave',
    column: 'marketing',
    status: 'active',
    priority: 'low',
    progress: 'Parked — post Street Date launch',
    body: 'When Street Date launches, use it as the hook for a second press wave. Pitch the games platform angle not a single game.',
  },
  {
    title: 'Bluesky community building',
    column: 'marketing',
    status: 'active',
    priority: 'medium',
    body: 'Bluesky is where indie games discourse has moved. Follow: indie game developers, cozy game creators, games journalists. Engage genuinely. Post Game Sense results. Goal: be a recognised name in the cozy games Bluesky ecosystem before full launch.',
  },
  {
    title: 'Reach out to cozy gaming communities on Reddit',
    column: 'marketing',
    status: 'active',
    priority: 'medium',
    progress: 'Not started',
    body: "r/CozyGamers, r/indiegaming, r/patientgamers. Don't post ads — contribute first. Share Game Sense when ready, share Beth's articles when genuinely relevant. Reddit drives high-intent traffic if it doesn't feel like marketing.",
  },

  // ── DONE items ───────────────────────────────────────────────────────

  {
    title: 'Game Sense archive page — design and prompt complete',
    column: 'website',
    status: 'done',
    priority: 'medium',
  },
  {
    title: 'Homepage below-fold — design complete, awaiting build',
    column: 'website',
    status: 'done',
    priority: 'medium',
  },
  {
    title: 'About page — design complete, awaiting build',
    column: 'website',
    status: 'done',
    priority: 'medium',
  },
  {
    title: 'Game Sense mobile keyboard mockup — design complete',
    column: 'website',
    status: 'done',
    priority: 'medium',
  },
  {
    title: 'RPG rank names confirmed',
    column: 'website',
    status: 'done',
    priority: 'medium',
    body: 'Skill Issue / First Playthrough / Knows the Lore / Final Save / Legendary',
  },
  {
    title: 'Competitor analysis — Her Cozy Gaming and TWIV',
    column: 'marketing',
    status: 'done',
    priority: 'medium',
  },
  {
    title: 'Brand strategy — tone, palette, typography — locked',
    column: 'marketing',
    status: 'done',
    priority: 'medium',
  },
]

async function seed() {
  console.log(`Seeding ${JOBS.length} jobs...`)

  const { data, error } = await supabase.from('jobs').insert(JOBS).select()

  if (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }

  console.log(`Inserted ${data.length} jobs`)
}

seed()
