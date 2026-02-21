# Pip — Step 5a: Quick Fixes

## Fix 1: "Fresh ideas" button + save/dismiss persistence

The `useIdeaDeck` hook dismisses and saves cards in state but loses them on refresh.
Dismissed IDs are already persisted to localStorage — the bug is that the Sanity
write isn't happening.

When Beth clicks "I'll write this", save the idea ID to Sanity so it persists:

In `useIdeaDeck.ts`, after the select action, call a function that patches the
pip-dashboard-singleton document to add the idea to a `selectedIdeas` array:

```ts
// In src/pip/lib/pipSanityClient.ts — add this write helper
export async function markIdeaSelected(ideaId: string) {
  // We can't write from the browser without a token
  // Store in localStorage for now, sync to Sanity on next nightly run
  const selected = JSON.parse(localStorage.getItem('pip_selected_ideas') || '[]')
  if (!selected.includes(ideaId)) {
    selected.push(ideaId)
    localStorage.setItem('pip_selected_ideas', JSON.stringify(selected))
  }
}
```

The "Fresh ideas" button calls `refreshDeck()` but if the deck is empty it does
nothing. Fix: when the deck is empty OR when Fresh ideas is clicked, make a live
Claude API call to generate 3 new ideas.

In `PipIdeas.tsx`, wire the Fresh ideas button to call a new `useIdeasRefresh` hook:

```ts
// src/pip/hooks/useIdeasRefresh.ts
import { useState } from 'react'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

export function useIdeasRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  async function fetchFreshIdeas(existingTitles: string[]): Promise<PipIdea[]> {
    setIsRefreshing(true)
    try {
      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `You are Pip, creative partner for idlehours.co.uk — a UK cosy games blog.

Beth has already seen these ideas and wants something different:
${existingTitles.slice(0, 6).join('\n')}

Generate 3 fresh post ideas that are meaningfully different.
Same rules: cosy games niche, UK spelling, KD under 40, warm and specific reasons.

Return ONLY a JSON array:
[{
  "id": "fresh-1",
  "type": "List|Review|Essay|Mood Editorial",
  "typeEmoji": "📋|⭐|✍️|🌙",
  "title": "...",
  "reason": "2 sentences, warm and specific",
  "difficulty": 1,
  "cluster": "Anxiety & Low Energy|Standalone",
  "trending": false
}]`
        }]
      })
      const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
      return JSON.parse(text.replace(/```json|```/g, '').trim())
    } catch (e) {
      console.error('Fresh ideas failed:', e)
      return []
    } finally {
      setIsRefreshing(false)
    }
  }

  return { fetchFreshIdeas, isRefreshing }
}
```

---

## Fix 2: SEO Helper — wire to real Claude

`PipSeoHelper.tsx` is showing mock suggestions. Replace with a real Claude call.

When Beth clicks "Generate titles", call Claude with her description:

```ts
// In PipSeoHelper.tsx
async function generateTitles(description: string) {
  setIsLoading(true)
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `You are Pip, SEO helper for idlehours.co.uk — a UK cosy games blog.

Beth's post idea: "${description}"

Generate 5 SEO-optimised title options. Rules:
- Target keyword difficulty under 40 (new domain)
- UK spelling (cosy not cozy)
- Sound like Beth's voice — warm, specific, human
- Each title should target a slightly different keyword angle
- Flag one as your recommendation

Return ONLY valid JSON:
[{
  "title": "...",
  "difficulty": "Low|Medium|High",
  "volume": 890,
  "isPipRecommended": false
}]`
    }]
  })
  const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
  const titles = JSON.parse(text.replace(/```json|```/g, '').trim())
  setSuggestions(titles)
  setIsLoading(false)
}
```

---

## Fix 3: Goals page blank

The Goals page at `/pip/goals` is blank with no console errors.
This is likely a routing issue — the route isn't registered or the component
is crashing silently.

Check `PipApp.tsx` — make sure the goals route exists:
```tsx
<Route path="goals" element={<PipGoals />} />
```

Also check `PipGoals.tsx` for any undefined variable access that would cause
a silent crash. The most likely culprit is accessing `goals.current` or
`goals.target` when `goals` is undefined. Add a null check:

```tsx
if (!goals) return <div>Loading...</div>
```

---

## Fix 4: Pip's morning message — shorter and context-aware

In `pip/generate.js`, replace the `generateMorningMessage` prompt with this
context-aware version that considers how new the blog is:

```js
export async function generateMorningMessage(research, streak, activeCluster, totalPosts) {
  const isNewBlog = totalPosts < 10
  const hasTraffic = research.ga4?.sessions7d > 50
  const timeOfDay = getTimeOfDay()

  const contextNote = isNewBlog
    ? `IMPORTANT: This blog is brand new with only ${totalPosts} post(s). 
       Pip is in her first weeks on the job. 
       The tone should be warm and encouraging about getting started — 
       NOT analytical or warning about growth problems. 
       At this stage, ANY traffic is great. Focus on momentum and the next post.`
    : hasTraffic
    ? `The blog has ${research.ga4.sessions7d} sessions this week. 
       You can start referencing specific data and growth patterns.`
    : `Traffic is still building. Keep the tone encouraging and focused on content quality.`

  const prompt = `You are Pip, Beth's creative partner for idlehours.co.uk — a UK cosy games blog.

${contextNote}

Current stats:
${research.summary}

Writing streak: ${streak} days
Active cluster: ${activeCluster}
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

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 100,
    messages: [{ role: 'user', content: prompt }]
  })

  return message.content[0].text.trim()
}
```

Also pass `posts.length` to `generateMorningMessage` in `index.js`:
```js
const morningMessage = await generateMorningMessage(
  research, streak, ACTIVE_CLUSTER, posts.length  // ← add this
)
```

---

## Fix 5: Calendar — wire to real post dates

In `PipCalendar.tsx`, replace mock events with real post data from Sanity.

The `usePipData` hook already fetches posts. Pass them to the calendar:

```tsx
// In PipCalendar.tsx
const { posts } = usePipData()

const calendarEvents = posts.map(post => ({
  id: post._id,
  date: post.publishedAt.slice(0, 10),
  title: post.title,
  type: 'published' as const,
}))
```

Show an empty calendar with just the real published dots until planned posts
are added. Remove all mock calendar events.

---

## Fix 6: Achievements — expand to 25 and make some real

Replace the 6 mock achievements with 25, and wire the ones that can be
calculated from real data.

In `pipMockData.ts`, replace `mockAchievements` with this full list:

```ts
export const allAchievements: PipAchievement[] = [
  // Writing milestones
  { id: 'first-post', emoji: '🌱', name: 'First Word', description: 'Published your very first post. The hardest one.', earned: false },
  { id: 'five-posts', emoji: '✋', name: 'High Five', description: 'Five posts published. You have a blog now.', earned: false },
  { id: 'ten-posts', emoji: '🔟', name: 'Double Digits', description: 'Ten posts. This is a real thing.', earned: false },
  { id: 'twenty-five-posts', emoji: '🌿', name: 'Growing', description: 'Twenty-five posts. Google is starting to notice.', earned: false },
  { id: 'fifty-posts', emoji: '🌳', name: 'Forest', description: 'Fifty posts. You built something significant.', earned: false },

  // Streak achievements
  { id: 'streak-3', emoji: '🔥', name: 'On a Roll', description: '3-day writing streak.', earned: false },
  { id: 'streak-7', emoji: '🔥🔥', name: 'Week Warrior', description: '7-day writing streak. A whole week.', earned: false },
  { id: 'streak-30', emoji: '💫', name: 'Monthly', description: '30-day streak. That\'s dedication.', earned: false },

  // Traffic milestones
  { id: 'sessions-100', emoji: '👀', name: 'First 100', description: '100 sessions in a week. Real people, reading your words.', earned: false },
  { id: 'sessions-500', emoji: '📈', name: 'Momentum', description: '500 sessions in a week. Something is working.', earned: false },
  { id: 'sessions-1000', emoji: '🚀', name: 'Four Figures', description: '1,000 sessions in a week. This is a real blog.', earned: false },
  { id: 'sessions-5000', emoji: '🌟', name: 'Destination', description: '5,000 sessions in a week. People come here on purpose.', earned: false },

  // SEO achievements
  { id: 'page-one', emoji: '🎯', name: 'Page One', description: 'A post ranked in the top 10 for a real keyword.', earned: false },
  { id: 'position-one', emoji: '🏆', name: 'Top of the World', description: 'Position 1 for a keyword. You beat everyone.', earned: false },
  { id: 'quick-win', emoji: '⚡', name: 'Quick Win', description: 'Moved a post from page 2 to page 1.', earned: false },

  // Cluster achievements
  { id: 'cluster-started', emoji: '🧩', name: 'The Plan', description: 'Started your first content cluster.', earned: false },
  { id: 'cluster-halfway', emoji: '🏗️', name: 'Halfway There', description: 'Published 3 posts in a single cluster.', earned: false },
  { id: 'cluster-complete', emoji: '🌳', name: 'Full Cluster', description: 'All 5 posts in a cluster published. Compound interest starts now.', earned: false },
  { id: 'two-clusters', emoji: '🌲🌲', name: 'Growing Forest', description: 'Two complete clusters. Topical authority building.', earned: false },

  // Revenue
  { id: 'first-click', emoji: '💰', name: 'First Click', description: 'First affiliate click. Someone trusted you enough to buy.', earned: false },
  { id: 'first-pound', emoji: '£', name: 'First £1', description: 'The blog made money. It\'s real now.', earned: false },
  { id: 'fifty-pounds', emoji: '💵', name: 'Fifty Quid', description: '£50 earned. This is income.', earned: false },
  { id: 'five-hundred', emoji: '🎉', name: 'The Goal', description: '£500/month. You did it.', earned: false },

  // Special
  { id: 'return-visitors', emoji: '💚', name: 'They Came Back', description: '30% return visitor rate. People like it here.', earned: false },
  { id: 'viral', emoji: '🦠', name: 'It Spread', description: 'A post got shared more than 50 times.', earned: false },
]
```

Then in `usePipData.ts`, calculate which achievements are earned from real data:

```ts
function calculateEarnedAchievements(posts: any[], sessions7d: number, streak: number) {
  const totalPosts = posts.length
  const returnRate = dashboardDoc?.analytics?.returnVisitorPct ?? 0

  return allAchievements.map(achievement => ({
    ...achievement,
    earned: checkAchievement(achievement.id, { totalPosts, sessions7d, streak, returnRate })
  }))
}

function checkAchievement(id: string, data: any): boolean {
  switch(id) {
    case 'first-post': return data.totalPosts >= 1
    case 'five-posts': return data.totalPosts >= 5
    case 'ten-posts': return data.totalPosts >= 10
    case 'twenty-five-posts': return data.totalPosts >= 25
    case 'fifty-posts': return data.totalPosts >= 50
    case 'streak-3': return data.streak >= 3
    case 'streak-7': return data.streak >= 7
    case 'streak-30': return data.streak >= 30
    case 'sessions-100': return data.sessions7d >= 100
    case 'sessions-500': return data.sessions7d >= 500
    case 'sessions-1000': return data.sessions7d >= 1000
    case 'sessions-5000': return data.sessions7d >= 5000
    case 'return-visitors': return data.returnRate >= 30
    default: return false // Revenue + SEO achievements wired when data exists
  }
}
```

---

## Fix 7: XP levels with names

Add named levels to the XP system. In `pipMockData.ts` add:

```ts
export const XP_LEVELS = [
  { level: 1, name: 'Lurker', xpRequired: 0, xpToNext: 500 },
  { level: 2, name: 'Curious Writer', xpRequired: 500, xpToNext: 1000 },
  { level: 3, name: 'Cosy Correspondent', xpRequired: 1500, xpToNext: 1500 },
  { level: 4, name: 'Regular Contributor', xpRequired: 3000, xpToNext: 2000 },
  { level: 5, name: 'Idle Hours Author', xpRequired: 5000, xpToNext: 3000 },
  { level: 6, name: 'Established Voice', xpRequired: 8000, xpToNext: 4000 },
  { level: 7, name: 'Niche Authority', xpRequired: 12000, xpToNext: 5000 },
  { level: 8, name: 'Idle Hours Editor', xpRequired: 17000, xpToNext: 999999 },
]

export function getLevelInfo(xp: number) {
  const current = XP_LEVELS.filter(l => xp >= l.xpRequired).pop() ?? XP_LEVELS[0]
  const next = XP_LEVELS.find(l => l.xpRequired > xp)
  return {
    ...current,
    xpToNextLevel: next ? next.xpRequired - xp : 0,
    progress: next ? ((xp - current.xpRequired) / (next.xpRequired - current.xpRequired)) * 100 : 100,
  }
}
```

Update `XpBar.tsx` to show the level name:
```tsx
const levelInfo = getLevelInfo(xp)
// Show: "Level 3 · Cosy Correspondent" and progress to next
```

Update the sidebar XP section to show level name below the bar.

---

## What to check after this prompt

1. Fresh ideas button generates 3 new cards via Claude
2. SEO Helper generates real titles when you type and click Generate
3. Goals page renders (not blank)
4. Calendar shows only real post dots, no mock events
5. Achievements shows 25 items, some earned based on real data
6. XP bar shows level name (e.g. "Cosy Correspondent")
7. Run `node index.js` again — morning message should be max 2 sentences and warm not analytical