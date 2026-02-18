

---

## Change 1: Post Ideas — Tinder Card Mechanic

### What to change
Replace the current 3-column grid of idea cards with a **full Tinder-style swipe interface**. The ideas section should feel like flicking through a deck of cards, not scanning a list. This is the most important interaction in the whole dashboard.

### Layout
- One card visible at a time, centred, large (max-width 520px, min-height 340px)
- Card stack effect: 2-3 cards visible behind the active card, slightly scaled down and offset, suggesting there are more
- Large, readable typography — the title should be at least 20px, the reason text 15px
- The card should breathe — generous padding (32px), good line height

### Card content (same fields as before, just bigger and more prominent)
```
[TYPE BADGE]  e.g. 📋 List · Trending 🔥

Title (large, serif, dark):
"Games to play when you're too tired to make decisions"

Pip's reason (body text, warm, 2–3 sentences):
"Search volume on this one is spiking right now. 
Perfect fit for the anxiety cluster — and honestly, 
it's a post I think only you could write well."

Difficulty dots · [cluster tag]
```

### Action buttons (below the card, large and tappable)
Three buttons in a row, centred:

- **✕ Not for me** — left button, outlined, muted. Bins the card (removes from deck with a leftward slide animation). Saves to `dismissed_ideas` in localStorage so Pip knows not to repeat them.
- **🔖 Save for later** — centre button, outlined, amber. Saves to a "Saved ideas" bank without removing from deck flow.
- **✓ I'll write this** — right button, filled green. This is the CTA. Marks idea as selected, triggers the SEO Helper inline below the card, awards a small XP burst animation.

### Deck mechanics
- Start with 6 cards. When the deck runs low (2 remaining), auto-fetch 3 more silently in the background.
- "Generate more" button always visible below the action buttons: `✨ Fresh ideas` — calls the refresh hook, slides 3 new cards onto the back of the deck with a satisfying animation.
- Card transitions: smooth 300ms slide left (dismiss) or right (save/select). The next card slides up from behind.
- Empty state: when the deck is empty, Pip says "You've seen everything I've got right now — want me to find more?" with a big `✨ Find more ideas` button.

### Saved ideas bank
A collapsible section below the deck: "🔖 Ideas you saved for later (N)". Simple list, each with a "Write this →" button and a remove button. Not prominent — it's a shelf, not a queue.

### Implementation
```jsx
// useIdeaDeck.js
// Manages: deck array, dismissed array, saved array
// Actions: dismiss(id), save(id), select(id), addMore(ideas)
// Persists dismissed IDs to localStorage so Pip doesn't repeat them
// Emits: onDeckLow callback when 2 cards remain (triggers silent refetch)
```

---

## Change 2: "Have your own idea?" — YES AND Partner

### What to change
The current input box that says "Pip will suggest 4–5 post ideas that form a cluster" needs to be completely redesigned in tone and behaviour. It should feel like texting an enthusiastic friend, not submitting a brief to a content agency.

### The YES AND principle
Pip's job here is not to evaluate whether Beth's idea is good. It's to find the angle that makes it work, then propose what else could grow from it. Like an improv partner: accept the premise, build on it, offer something better than what was offered.

**Examples of how Pip should respond:**

Beth types: `"I want to write about Stardew Valley"`
Pip should NOT say: "Great idea! Here are some keywords."
Pip SHOULD say: "Everyone's written the Stardew review — but nobody's written the one about why people return to it after a hard year. Or the one that explains exactly what it scratches that nothing else does. Which angle feels more like you?"

Beth types: `"I want to write about spaghetti"`
Pip should NOT say: "That doesn't fit our niche."
Pip SHOULD say: "Okay, I see where your head's at — comfort, warmth, something that just hits right. What if it's cosy games for when you want that same feeling as a bowl of pasta on a cold night? Or games to play *while* you cook? The food-and-games crossover is genuinely underwritten."

Beth types: `"games that made me cry"`
Pip should NOT evaluate this.
Pip SHOULD say: "That's a post I'd read immediately. The emotional games space is almost entirely 'games that made me cry' listicles — but you could do it differently. What if it was about the ones you didn't expect to hit you? That's a story, not a list. Want me to find the cluster that lives in?"

### UI Design
- Large, warm text input — placeholder: `"Tell me what's on your mind..."`
- No submit button — response appears as Beth types (debounced 800ms) OR on Enter
- Response appears as a Pip speech bubble directly below the input, with a subtle slide-in animation
- Below the speech bubble: 2–3 quick-action cards ("Yes, explore this angle →") that Beth can tap to immediately spin into a full cluster plan
- The input should feel conversational, not form-like. No labels. No instructions. Just the box and Pip's response.

### The Claude prompt for YES AND responses
This is the most important prompt to get right. Use this structure:

```
You are Pip, Beth's creative partner for idlehours.co.uk — a UK cosy games blog about games that create the "idle hours feeling" (absorbing, forgiving, made with love, respects the player's time).

Beth just typed: "${input}"

Your job is NOT to evaluate her idea. Your job is to find the most interesting version of it and offer 2-3 angles she could take.

Rules:
- Always start by accepting the premise. Find what's interesting in it, even if it seems off-topic.
- Never say "that doesn't fit our niche." Find the angle that does.
- Be specific. "Games that feel like spaghetti" is more interesting than "comfort games."
- Offer angles, not validation. "That's a great idea!" is banned.
- End with a genuine question or a choice between angles — not a form to fill in.
- If the idea is genuinely strong as stated, say so once, specifically, then build on it.
- Max 4 sentences total. Short, warm, punchy.
- UK spelling throughout.

Then suggest 2-3 cluster angles as short pill buttons (3-5 words each).
Return as JSON: { "response": "...", "angles": ["angle 1", "angle 2", "angle 3"] }
```

---

## Change 3: Analytics — Full Dashboard

### What to change
The analytics section should be a proper analytics dashboard, not just a plain-English summary paragraph. It should pull real data from Google Analytics (via the Sanity data that Pip writes nightly) and display it richly.

### Layout
Tab row at the top: `Overview` · `Content` · `Audience` · `Search`

---

**Tab: Overview**
- Stat cards row: Sessions this week, Avg read time, Return visitor %, New visitors
- Sessions trend chart: 8-week line chart (use recharts or a simple SVG — no external chart library required if unavailable)
- Traffic sources donut: Organic / Direct / Social / Referral
- Top 5 posts table: Title, Sessions, Avg time, Shares, Trend arrow

---

**Tab: Content**
- Post performance table: all published posts with sessions, read time, bounce rate, search position
- "Closest to page 1" highlight: 3 posts currently on page 2–3 with a "→ Could rank with one more post" note
- Cluster performance: sessions aggregated by cluster, showing which cluster is driving traffic
- Best performing post type: Reviews vs Lists vs Essays vs Mood — which type performs best for Idle Hours

---

**Tab: Audience**
- **Location map** (simplified): A world map or UK/EU map showing where readers are coming from. Use a CSS-based approach if a proper mapping library isn't available — coloured circles on a simplified SVG map of the world is fine.
- Top 5 countries by session
- **Audience persona cards** — Pip generates these from the data. 3 cards, each representing a reader archetype Pip has inferred from the content that performs best:

```
Persona card example:
┌─────────────────────────────────┐
│ 🌙 "The Late-Night Winder-Downer"│
│                                  │
│ Finds you via: Google searches   │
│ around "relaxing games"          │
│ Reads most: Mood editorial,      │
│ anxiety games content            │
│ Spends: 4+ minutes per post      │
│ Most active: 9pm–midnight        │
│                                  │
│ What they need: Games that help  │
│ them decompress. They have a     │
│ hard time switching off.         │
└─────────────────────────────────┘
```

Persona cards are generated by Pip nightly using Claude and stored in `pip_dashboard.audiencePersonas`. They update when the data changes significantly.

- Device split: Mobile / Desktop / Tablet (simple bar)
- New vs returning (simple bar)

---

**Tab: Search**
- Top 10 search queries driving traffic (query, clicks, impressions, CTR, avg position)
- "Quick wins" highlight: queries where the site ranks 11–20 (page 2) with high impressions — these are the easiest ranking opportunities
- Position trend for top 3 keywords over 8 weeks (line chart)
- Keyword opportunities Pip has identified (from nightly research, stored in pip_dashboard)

---

### Data source
All analytics data is pre-written by Pip's nightly job into `pip_dashboard.analytics` in Sanity. The dashboard reads it from there — no direct GA4 calls from the browser. For the initial build, use rich mock data that makes the charts look real and informative.

```js
// Mock data structure for development
const mockAnalytics = {
  overview: {
    sessions7d: 847,
    sessionsDelta: 23,
    avgReadTime: 228, // seconds
    returnVisitorPct: 34,
    newVisitorPct: 66,
    trafficSources: { organic: 58, direct: 22, social: 14, referral: 6 },
    weeklyTrend: [312, 398, 445, 502, 589, 634, 710, 847], // 8 weeks
  },
  topPosts: [
    { title: 'Spiritfarer review', sessions: 312, readTime: 252, bounceRate: 28, position: 14, trend: 'up' },
    { title: '10 games for when your brain won\'t stop', sessions: 289, readTime: 216, bounceRate: 31, position: 18, trend: 'up' },
    { title: 'A Short Hike review', sessions: 146, readTime: 186, bounceRate: 35, position: 22, trend: 'stable' },
  ],
  audience: {
    topCountries: [
      { country: 'United Kingdom', sessions: 423, pct: 50 },
      { country: 'United States', sessions: 212, pct: 25 },
      { country: 'Australia', sessions: 85, pct: 10 },
      { country: 'Canada', sessions: 68, pct: 8 },
      { country: 'Germany', sessions: 59, pct: 7 },
    ],
    deviceSplit: { mobile: 54, desktop: 38, tablet: 8 },
    personas: [
      {
        name: 'The Late-Night Winder-Downer',
        icon: '🌙',
        findsVia: 'Google searches for relaxing/anxiety games',
        readsmost: 'Mood editorial, anxiety games content',
        avgTime: '4+ minutes',
        peakHours: '9pm–midnight',
        need: 'Games that help them decompress after a hard day.'
      },
      {
        name: 'The Returning Gamer',
        icon: '🎮',
        findsVia: 'Searches for games like Stardew Valley',
        readsMost: 'Detailed reviews, "games like X" lists',
        avgTime: '3 minutes',
        peakHours: 'Weekend mornings',
        need: 'Permission to get back into gaming after years away.'
      },
      {
        name: 'The Anxious Discoverer',
        icon: '🌿',
        findsVia: 'Pinterest, mental health + gaming searches',
        readsMost: 'Mood editorial, anxiety-friendly tag',
        avgTime: '5+ minutes',
        peakHours: 'Sundays, late afternoon',
        need: 'Games that genuinely won\'t stress them out.'
      }
    ]
  },
  search: {
    topQueries: [
      { query: 'games for anxiety', clicks: 89, impressions: 1240, ctr: 7.2, position: 14.3 },
      { query: 'cosy games no fail state', clicks: 67, impressions: 890, ctr: 7.5, position: 11.8 },
      { query: 'spiritfarer review', clicks: 54, impressions: 430, ctr: 12.6, position: 8.2 },
      { query: 'games like stardew valley pc', clicks: 41, impressions: 2100, ctr: 2.0, position: 19.4 },
      { query: 'short hike game review', clicks: 38, impressions: 310, ctr: 12.3, position: 9.1 },
    ],
    quickWins: [
      { query: 'cosy games for anxiety', position: 14, impressions: 1240, opportunity: 'One internal link from the pillar could push this into top 10' },
      { query: 'games like stardew valley pc', position: 19, impressions: 2100, opportunity: 'High volume — this is Cluster 2. One strong post would move the needle.' },
    ]
  }
}
```

---

## Change 4: Sanity Sync

### What to change
The dashboard should fully sync with the Sanity `post` document type. Pip reads all published posts to:
- Track cluster progress (which posts are published in each cluster)
- Show Beth's real post history in the content calendar
- Power the analytics "content" tab
- Update streak calculation from real publish dates

### Implementation

```js
// In pipQueries.js — add to the main GROQ query
export const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  clusterName,
  clusterRole,
  moodTags,
  excerpt,
  "wordCount": length(pt::text(body))
}`
```

### Cluster auto-detection
If a post has `clusterName` and `clusterRole` fields populated, Pip automatically marks the corresponding cluster step as published. Beth doesn't need to manually update the cluster tracker — it reads from real post data.

```js
// In usePipData.js
// Match posts to cluster steps by clusterName + clusterRole
// Return enriched cluster data with real publish status
```

### Streak from real data
The streak should be calculated from real `publishedAt` dates, not manually entered. Count consecutive calendar days with at least one published post.

### What Beth needs to fill in on every post in Sanity Studio
For the sync to work, Beth needs to select two fields when writing a post:
- `clusterName` (dropdown: "Anxiety & Low Energy" / "Games Like Stardew Valley" / etc.)
- `clusterRole` (dropdown: "Pillar" / "Supporting" / "Mood Editorial" / "Standalone")

Add a clear note in the dashboard explaining this: "Add the cluster fields to your post in Sanity and it'll update here automatically. Takes 5 seconds."

---

## Change 5: IRL Content → Content Creation

### What to change
Rename the "IRL Content" section to **"Content Creation"** and expand it to cover all non-blog content types. The section should feel like a creative studio, not a to-do list. Nothing in here should feel like a chore.

### New section structure
Three tabs: `📸 Video & Reels` · `📌 Pinterest` · `📷 Instagram`

---

**Tab: Video & Reels**
Keep the existing IRL filming briefs but rename and reframe. Each idea card should lead with the *feeling* of the content, not the task:

```
Card format:
[Big emoji] [Mood label e.g. "Atmospheric 🌙" / "Funny 😂" / "Cosy ✨"]
Title: "Late-night gaming session timelapse"
Why it'll do well: (1 sentence, specific)
What to film: (shot list, max 4 items, brief)
Effort: ●○○ Easy  / ●●○ Medium / ●●● Worth it
[Caption ready →]  [Mark as done ✓]
```

---

**Tab: Pinterest**
Pinterest is a search engine. Pip treats it as one. This tab should feel like a Pinterest strategy desk.

```
Section: "Pin these posts"
For each of Beth's last 5 published posts:
- Post title
- Pip's suggested pin title (keyword-optimised, different from blog title)
- Pin description (ready to copy)
- Board suggestion (e.g. "Cosy Games / Relaxing Games / Gaming For Anxiety")
- Image brief for Alfie (what the pin graphic should look like — Pip writes this)
- [Copy pin text →]

Section: "Pinterest SEO"
- Top 5 Pinterest search terms in the cosy gaming niche (updated weekly by Pip)
- "Your pins are searchable for:" — list of keywords Pip has identified from pin titles already created
```

---

**Tab: Instagram**
```
Section: "Caption bank"
Ready-to-post captions for each recent post.
Each caption shows:
- Hook line (the first line that shows before "more")
- Full caption with hashtags
- Suggested posting time (Pip recommends based on general engagement data)
- [Copy caption →]

Section: "Reel ideas"
Same as Video tab but specifically framed for Instagram Reels format.
Short (15–30 second) ideas. Pip notes: "Reels get 3x the reach of static posts right now."
```

---

## Change 6: The Boost Button

### Where it lives
In the **Big Picture** section, below the goal tracker and above the milestone pills. It should be prominent — a card of its own with clear framing.

### Design
```
Card (dark background, matches the goal card aesthetic):

🚀 Things feeling slow?

"Sometimes the blog needs a focused sprint — 4-6 weeks of 
targeted effort to really move the needle. Pip will build 
you a personalised growth plan based on where you are right now."

[Generate my boost plan →]  ← Big, orange, animated on hover
```

### What the Boost plan generates
When Beth clicks the button, Pip makes a Claude API call with a carefully constructed prompt. The result should be a proper plan document rendered inline in the dashboard — not a chat message, a structured plan.

**The Boost prompt (use this exactly):**
```
You are Pip, creative partner for idlehours.co.uk — a UK cosy games blog run by Beth, who writes all the content.

Current situation:
- Weekly sessions: ${weeklyStats.sessions}
- Sessions trend: ${weeklyStats.sessionsDelta > 0 ? '+' : ''}${weeklyStats.sessionsDelta}% week-on-week
- Posts published total: ${totalPosts}
- Active cluster: ${activeCluster}
- Cluster progress: ${clusterProgress} posts published of ${clusterTotal}
- Current streak: ${streak} days
- Top performing post: ${topPost.title} (${topPost.sessions} sessions)
- Closest to ranking: ${quickWin.query} at position ${quickWin.position}

Beth wants to do a 4–6 week boost sprint to meaningfully grow traffic and start earning. Generate a focused, achievable plan.

The plan must:
1. Be honest — if the numbers are genuinely low, say so warmly but don't sugar-coat. Beth can handle the truth.
2. Be specific to the actual data — reference real posts, real keywords, real cluster gaps.
3. Prioritise ruthlessly — 3 things done well beats 10 things done badly. Maximum 3 priorities per week.
4. Include both content (what to write) and distribution (how to get it seen).
5. Have a clear measurable target for the end of the sprint.
6. Sound like Pip — warm, direct, specific. Not like a marketing consultant.

Return as structured JSON:
{
  "headline": "The sprint name — catchy, specific, motivating",
  "target": "What success looks like in 6 weeks — one specific, measurable thing",
  "honestAssessment": "2-3 sentences. What's actually happening with the numbers right now. Honest but not harsh.",
  "weeks": [
    {
      "weekRange": "Weeks 1–2",
      "focus": "One-sentence theme",
      "tasks": [
        { "task": "...", "why": "...", "effort": "low|medium|high" }
      ]
    }
  ],
  "bigBet": "The single highest-leverage thing Beth could do in this sprint that Pip wouldn't normally suggest",
  "pipNote": "A personal note from Pip to Beth. Honest. Specific. Something she can hold onto on the hard days."
}
```

### Rendering the boost plan
Render it as a beautiful inline card — not a modal, not a new page. It expands below the button with a smooth animation:

```
┌─────────────────────────────────────────────────┐
│ 🚀 "The Cluster Completion Sprint"               │
│                                                  │
│ Target: Finish Cluster 1 and hit 1,500           │
│ sessions/week by Week 6                          │
│                                                  │
│ Pip's honest take:                               │
│ "The foundation is solid — your read time is     │
│  good, which means the people finding you are    │
│  staying. The problem is volume, not quality.    │
│  Two more cluster posts and a Pinterest push     │
│  could change this quickly."                    │
│                                                  │
│ Weeks 1-2: Complete the cluster ──────────────── │
│ ● Finish "Games with no fail states" post        │
│   Why: Completes Cluster 1, all posts start      │
│   reinforcing each other. Effort: medium         │
│ ● Internal link audit across all 5 posts         │
│   Why: Free SEO win. 30 minutes. Effort: low     │
│                                                  │
│ [etc for weeks 3-4, 5-6]                        │
│                                                  │
│ The Big Bet: Pinterest boards ────────────────── │
│ "Your anxiety content has real Pinterest         │
│  potential. One focused afternoon setting up     │
│  3 boards and pinning your top 5 posts could    │
│  be your fastest traffic source right now."     │
│                                                  │
│ Pip's note: ──────────────────────────────────── │
│ "You're closer than the numbers suggest..."      │
└─────────────────────────────────────────────────┘
```

Provide a "Save this plan" button that writes it to `pip_config.boostPlan` in Sanity so it persists across sessions.

---

## What Stays the Same

Everything not mentioned above stays exactly as designed in the original mockup:
- Sidebar: streak bar, XP bar, Pip greeting, nav items
- Auth gate (password + localStorage)
- Home view (morning message, stat cards, cluster progress, top ideas preview)
- SEO Helper (title generator with KD and volume)
- Cluster tracker (step-by-step progress)
- Content calendar (monthly view)
- Achievements section
- The Big Picture goal tracker (add the Boost button to it, don't replace anything)

---

## Component Structure (updated)

```
src/pip/
  PipApp.jsx
  PipLayout.jsx
  auth/
    PipAuthGate.jsx
    usePipAuth.js
  views/
    PipHome.jsx
    PipIdeas.jsx          ← Full rewrite — Tinder mechanic
    PipClusters.jsx
    PipSeoHelper.jsx
    PipGoals.jsx          ← Add Boost button
    PipContentCreation.jsx ← Replaces PipSocial.jsx
    PipAchievements.jsx
    PipCalendar.jsx
    PipAnalytics.jsx      ← Full rewrite — tabbed dashboard
  components/
    PipSpeech.jsx
    StreakBar.jsx
    XpBar.jsx
    ClusterProgress.jsx
    GoalTracker.jsx
    IdeaCard.jsx          ← Rewrite for Tinder format
    IdeaDeck.jsx          ← New — manages the deck/stack
    YesAndInput.jsx       ← New — the YES AND input component
    BoostPlan.jsx         ← New — renders boost sprint plan
    PersonaCard.jsx       ← New — audience persona cards
    AnalyticsChart.jsx    ← New — reusable chart component
    StatCard.jsx
  hooks/
    usePipData.js         ← Add Sanity post sync
    useIdeaDeck.js        ← New — deck state management
    useIdeasRefresh.js
    useYesAnd.js          ← New — YES AND Claude call
    useBoostPlan.js       ← New — Boost sprint generation
    useStreak.js          ← Update to use real post dates
  lib/
    pipSanityClient.js
    pipClaude.js
    pipQueries.js         ← Add POSTS_QUERY
```

---

## Key UX Principles to Maintain Throughout

1. **Nothing in this dashboard should feel like a chore.** If an interaction feels like admin, redesign it.

2. **Pip is warm but never hollow.** "Great work!" is banned. "Your Spiritfarer post has a 4-minute read time — people are actually reading it" is allowed.

3. **Speed matters.** The dashboard loads from pre-computed Sanity data. The only live API calls are: idea refresh, YES AND response, Boost plan generation. These should all have good loading states — Pip "thinking" animations, not blank spinners.

4. **Beth's voice is sacred.** The SEO Helper offers options, not instructions. The YES AND input finds angles, not corrections. Pip never tells Beth what to write — only what could make it findable, and what else could grow from it.

5. **Mobile-friendly.** The Tinder card mechanic especially needs to feel good on a phone. Beth might open this on the sofa, not at a desk.

---

## Build Order

1. IdeaDeck + IdeaCard (Tinder mechanic) — most impactful change, do this first
2. YesAndInput (YES AND component) — second most impactful
3. PipAnalytics full rewrite (tabbed, with charts and personas)
4. PipContentCreation (replaces PipSocial)
5. BoostPlan + useBoostPlan hook (Boost button in Goals)
6. Sanity post sync (usePipData update + pipQueries update)
7. Polish: animations, loading states, mobile responsiveness