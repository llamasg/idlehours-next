# Pip Dashboard v2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete password-protected creative partner dashboard at `/pip` for Beth, the content writer for idlehours.co.uk.

**Architecture:** React SPA with nested routing under `/pip`. Sidebar layout with auth gate. Mock data for development with Sanity query structure ready. Claude API integration for AI features (YES AND, Boost). All code lives in `src/pip/`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Framer Motion, Recharts (new dep), Sanity client (existing), Lucide React icons.

---

## Task 1: Install Dependencies & Create File Structure

**Files:**
- Modify: `package.json` (add recharts)
- Create: `src/pip/` directory structure

**Steps:**

1. Install recharts:
   ```bash
   npm install recharts
   ```

2. Create the directory structure:
   ```
   src/pip/
     PipApp.tsx
     PipLayout.tsx
     auth/
       PipAuthGate.tsx
       usePipAuth.ts
     views/
       PipHome.tsx
       PipIdeas.tsx
       PipClusters.tsx
       PipSeoHelper.tsx
       PipGoals.tsx
       PipContentCreation.tsx
       PipAchievements.tsx
       PipCalendar.tsx
       PipAnalytics.tsx
     components/
       PipSpeech.tsx
       StreakBar.tsx
       XpBar.tsx
       ClusterProgress.tsx
       GoalTracker.tsx
       IdeaCard.tsx
       IdeaDeck.tsx
       YesAndInput.tsx
       BoostPlan.tsx
       PersonaCard.tsx
       AnalyticsChart.tsx
       StatCard.tsx
     hooks/
       usePipData.ts
       useIdeaDeck.ts
       useIdeasRefresh.ts
       useYesAnd.ts
       useBoostPlan.ts
       useStreak.ts
     lib/
       pipClaude.ts
       pipQueries.ts
       pipMockData.ts
   ```

3. Add Pip route to `src/App.tsx`:
   ```tsx
   import PipApp from '@/pip/PipApp';
   // Add inside <Routes>:
   <Route path="/pip/*" element={<PipApp />} />
   ```

4. Verify build passes: `npx tsc --noEmit`

---

## Task 2: Auth Gate + Pip Layout Shell

**Files:**
- Create: `src/pip/auth/PipAuthGate.tsx`
- Create: `src/pip/auth/usePipAuth.ts`
- Create: `src/pip/PipLayout.tsx`
- Create: `src/pip/PipApp.tsx`

### PipAuthGate
- Simple password input page
- Password: `"idlehours2026"` (hardcoded for now)
- On correct password, store `pip_auth = true` in localStorage
- Styled: centred card, dark background, Lora font, Pip greeting
- "Logout" clears localStorage

### usePipAuth
```ts
export function usePipAuth() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('pip_auth') === 'true');
  const login = (password: string) => {
    if (password === 'idlehours2026') {
      localStorage.setItem('pip_auth', 'true');
      setAuthed(true);
      return true;
    }
    return false;
  };
  const logout = () => { localStorage.removeItem('pip_auth'); setAuthed(false); };
  return { authed, login, logout };
}
```

### PipLayout
- Sidebar (280px, dark `bg-brand-dark text-white`) + scrollable main content area (`bg-background`)
- Sidebar contains: Pip avatar/greeting, streak bar, XP bar, nav links
- Nav links: Home, Ideas, Clusters, SEO Helper, Goals, Content, Calendar, Analytics, Achievements
- Mobile: hamburger menu that slides sidebar in from left
- Each nav link routes to `/pip/{section}`

### PipApp
- Wraps everything in `usePipAuth` check
- If not authed → `<PipAuthGate />`
- If authed → `<PipLayout>` with nested `<Routes>`

**Verify:** Navigate to `/pip`, see auth gate. Enter password, see layout shell with sidebar and empty content area.

---

## Task 3: Mock Data + Shared Hooks

**Files:**
- Create: `src/pip/lib/pipMockData.ts`
- Create: `src/pip/lib/pipQueries.ts`
- Create: `src/pip/lib/pipClaude.ts`
- Create: `src/pip/hooks/usePipData.ts`
- Create: `src/pip/hooks/useStreak.ts`
- Create: `src/pip/components/StatCard.tsx`
- Create: `src/pip/components/StreakBar.tsx`
- Create: `src/pip/components/XpBar.tsx`

### pipMockData.ts
All mock data for the dashboard. Include:
- `mockIdeas` — 8 idea cards with type, title, reason, difficulty (1-3), cluster, trending boolean
- `mockAnalytics` — exact structure from pip_prompt.md (overview, topPosts, audience, search)
- `mockClusters` — 3 clusters with steps, each step has title, role, status (published/drafted/planned)
- `mockAchievements` — 6 achievement badges
- `mockCalendarEvents` — 8 events across Feb-March 2026
- `mockContentIdeas` — video/reels, pinterest pins, instagram captions (3 each)
- `mockGoals` — current goal with progress
- `mockSeoSuggestions` — 5 title suggestions with KD/volume

### pipClaude.ts
Mock Claude API utility:
```ts
export async function askPipYesAnd(input: string): Promise<{ response: string; angles: string[] }> {
  // Mock response for dev — returns after 1.5s delay to simulate API
  await new Promise(r => setTimeout(r, 1500));
  return {
    response: `That's interesting — "${input}" has real potential...`,
    angles: ["Angle suggestion 1", "Angle suggestion 2", "Angle suggestion 3"]
  };
}

export async function generateBoostPlan(context: BoostContext): Promise<BoostPlan> {
  // Mock response for dev
  await new Promise(r => setTimeout(r, 2000));
  return { /* mock boost plan matching spec structure */ };
}
```

### pipQueries.ts
GROQ query strings ready for Sanity:
```ts
export const PIP_POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) { ... }`;
export const PIP_DASHBOARD_QUERY = `*[_type == "pip_dashboard"][0] { ... }`;
```

### usePipData.ts
Central hook that provides all dashboard data. For now returns mock data. Structure:
```ts
export function usePipData() {
  return {
    ideas: mockIdeas,
    analytics: mockAnalytics,
    clusters: mockClusters,
    achievements: mockAchievements,
    calendar: mockCalendarEvents,
    goals: mockGoals,
    streak: 4,
    xp: 1250,
    level: 3,
    posts: [],
    isLoading: false
  };
}
```

### useStreak.ts
Calculate streak from post publish dates. For now uses mock data.

### StatCard, StreakBar, XpBar
Small reusable components:
- **StatCard**: Label, value, delta (up/down arrow + percentage), icon
- **StreakBar**: Fire icon + "4 day streak" with flame animation, progress to next milestone
- **XpBar**: Level badge + progress bar + "1,250 XP" label

**Verify:** `npx tsc --noEmit` passes.

---

## Task 4: PipHome View

**Files:**
- Create: `src/pip/views/PipHome.tsx`
- Create: `src/pip/components/PipSpeech.tsx`

### PipSpeech
Pip's speech bubble component. Takes `message` string. Styled as a warm speech bubble with a small Pip avatar (use a 🤖 or custom emoji). Subtle slide-in animation via Framer Motion.

### PipHome
The landing/home view of the dashboard. Shows:
1. **Pip morning message** — PipSpeech with a contextual greeting based on time of day and streak
2. **Stat cards row** — 4 StatCards: Sessions this week, Posts published, Current streak, XP
3. **Cluster progress preview** — Compact view of active cluster (name, X/Y posts done, progress bar)
4. **Top 3 ideas preview** — 3 small idea cards with "See all ideas →" link to /pip/ideas
5. **Quick actions** — "Write something new", "Check analytics", "Plan content" buttons

Layout: Single column, generous spacing, warm background.

**Verify:** Navigate to `/pip` after auth, see the home view with all sections populated from mock data.

---

## Task 5: IdeaDeck + IdeaCard (Tinder Mechanic)

**Files:**
- Create: `src/pip/components/IdeaCard.tsx`
- Create: `src/pip/components/IdeaDeck.tsx`
- Create: `src/pip/hooks/useIdeaDeck.ts`
- Create: `src/pip/views/PipIdeas.tsx`

### useIdeaDeck
State management for the card deck:
```ts
interface UseIdeaDeckReturn {
  currentCard: Idea | null;
  deckSize: number;
  dismissed: string[];       // IDs, persisted to localStorage
  saved: Idea[];
  dismiss: (id: string) => void;   // Slide left, add to dismissed
  save: (id: string) => void;      // Slide right-ish, add to saved
  select: (id: string) => void;    // Slide right, mark as selected
  removeSaved: (id: string) => void;
  selectSaved: (id: string) => void;
  refreshDeck: () => void;         // Load more ideas
  isEmpty: boolean;
}
```
- Filters out dismissed IDs from localStorage on init
- When deck hits 2 remaining, triggers `onDeckLow` (for future auto-fetch)
- `refreshDeck` adds 3 more mock ideas to the back of the deck

### IdeaCard
Large card (max-w-[520px], min-h-[340px]):
- Type badge top-left (emoji + category + trending fire if applicable)
- Title: large serif, dark
- Pip's reason: body text, warm, 2-3 sentences
- Bottom row: difficulty dots (●○○ / ●●○ / ●●●) + cluster tag pill
- Card has subtle shadow, rounded-2xl, generous padding (p-8)

### IdeaDeck
The deck visual + action buttons:
- Stack effect: current card on top, 2 cards behind (scaled down, offset 4px and 8px)
- Three action buttons below: ✕ Not for me (muted), 🔖 Save (amber), ✓ I'll write this (green filled)
- Card transitions: Framer Motion `AnimatePresence` with slide-left (dismiss) or slide-right (save/select)
- "✨ Fresh ideas" button below actions
- Empty state: Pip speech "You've seen everything..." with big refresh button

### PipIdeas view
- IdeaDeck component centred
- Below deck: collapsible "🔖 Ideas you saved for later (N)" section
  - Simple list, each with "Write this →" and remove buttons
- Below saved: YesAndInput (built in Task 6)

**Verify:** Navigate to `/pip/ideas`. See card stack. Click dismiss — card slides left, next appears. Click save — card goes to saved bank. Verify localStorage persistence.

---

## Task 6: YesAndInput (YES AND Component)

**Files:**
- Create: `src/pip/components/YesAndInput.tsx`
- Create: `src/pip/hooks/useYesAnd.ts`

### useYesAnd
```ts
export function useYesAnd() {
  const [response, setResponse] = useState<{ response: string; angles: string[] } | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const ask = async (input: string) => {
    setIsThinking(true);
    const result = await askPipYesAnd(input);
    setResponse(result);
    setIsThinking(false);
  };

  return { response, isThinking, ask, clear: () => setResponse(null) };
}
```

### YesAndInput
- Large warm text input — placeholder: "Tell me what's on your mind..."
- No submit button visible — fires on Enter key or debounced 800ms after typing stops
- Below input: Pip "thinking" state (3 animated dots in a speech bubble)
- Response appears as PipSpeech bubble with slide-in
- Below speech: 2-3 angle pill buttons ("Explore this angle →") that Beth can tap
- Tapping an angle could eventually spin into a cluster plan (for now just highlights it)
- The whole thing feels conversational, not form-like

**Verify:** Type in the input, see thinking animation, see Pip response appear with angle pills.

---

## Task 7: PipAnalytics (Full Tabbed Dashboard)

**Files:**
- Create: `src/pip/views/PipAnalytics.tsx`
- Create: `src/pip/components/AnalyticsChart.tsx`
- Create: `src/pip/components/PersonaCard.tsx`

### PipAnalytics
Tab row: Overview · Content · Audience · Search

**Overview tab:**
- 4 StatCards: Sessions (847, +23%), Avg read time (3:48), Return visitors (34%), New visitors (66%)
- Line chart: 8-week sessions trend (use Recharts `<LineChart>`)
- Donut chart: Traffic sources (Recharts `<PieChart>`)
- Top 5 posts table: title, sessions, avg time, trend arrow

**Content tab:**
- Post performance table (all mock posts with sessions, read time, bounce rate, position)
- "Closest to page 1" highlight cards (3 posts on page 2-3 with note)
- Cluster performance: sessions by cluster
- Best performing post type breakdown

**Audience tab:**
- Top 5 countries table with session counts and percentages
- 3 PersonaCard components (from mock data — name, icon, findsVia, readsMost, avgTime, peakHours, need)
- Device split bar (mobile/desktop/tablet)
- New vs returning bar

**Search tab:**
- Top 10 queries table (query, clicks, impressions, CTR, position)
- "Quick wins" highlight cards (page 2 queries with high impressions)
- Keyword opportunity notes from Pip

### AnalyticsChart
Wrapper around Recharts with consistent styling:
- Line chart variant (for trends)
- Pie/donut variant (for splits)
- Uses brand colours: burnt-orange for primary line, accent-green for secondary

### PersonaCard
Card matching spec design:
- Icon + persona name header
- "Finds you via:", "Reads most:", "Spends:", "Most active:", "What they need:" fields
- Warm card styling with subtle border

**Verify:** Navigate to `/pip/analytics`. Click through all 4 tabs. See charts render with mock data. See persona cards on Audience tab.

---

## Task 8: PipClusters + PipSeoHelper

**Files:**
- Create: `src/pip/views/PipClusters.tsx`
- Create: `src/pip/components/ClusterProgress.tsx`
- Create: `src/pip/views/PipSeoHelper.tsx`

### PipClusters
- List of 3 mock clusters (e.g. "Anxiety & Low Energy", "Games Like Stardew Valley", "Cosy Lifestyle")
- Each cluster is an expandable card showing:
  - Cluster name + overall progress (X/Y posts)
  - Progress bar
  - Step list: each step shows title, role (Pillar/Supporting/Mood/Standalone), status icon (✅ published, 📝 drafted, 📋 planned)
  - Note: "Add cluster fields to your post in Sanity and it'll update here automatically."

### ClusterProgress
Reusable compact cluster progress component (used in PipHome too):
- Cluster name, X/Y label, progress bar with brand-green fill

### PipSeoHelper
- Title input: "What's your post about?"
- On submit, shows 5 SEO title suggestions (from mock data)
- Each suggestion shows: title text, estimated keyword difficulty (Low/Med/High pill), monthly search volume
- "Use this title →" button on each
- Powered by mock data now, Claude API ready

**Verify:** See cluster progress. See SEO suggestions render from mock data.

---

## Task 9: PipGoals + Boost Button

**Files:**
- Create: `src/pip/views/PipGoals.tsx`
- Create: `src/pip/components/GoalTracker.tsx`
- Create: `src/pip/components/BoostPlan.tsx`
- Create: `src/pip/hooks/useBoostPlan.ts`

### GoalTracker
- Current goal card (dark bg): "Reach 1,500 sessions/week"
- Progress bar with current value
- Milestone pills below: 500 ✅, 1000 🔜, 1500, 2000

### useBoostPlan
```ts
export function useBoostPlan() {
  const [plan, setPlan] = useState<BoostPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = async (context: BoostContext) => {
    setIsGenerating(true);
    const result = await generateBoostPlan(context);
    setPlan(result);
    setIsGenerating(false);
  };

  return { plan, isGenerating, generate, clear: () => setPlan(null) };
}
```

### BoostPlan component
Renders the generated plan inline (not modal):
- Headline + target
- "Pip's honest take" section
- Week-by-week tasks (each with task, why, effort indicator)
- "The Big Bet" highlight
- "Pip's note" personal message
- "Save this plan" button (saves to localStorage for now)
- Smooth expand animation with Framer Motion

### PipGoals view
- GoalTracker at top
- Boost card below: dark bg, rocket emoji, "Things feeling slow?" copy
- "Generate my boost plan →" orange button
- When clicked: Pip thinking animation → plan renders inline below
- Achievements preview (mini badges) with "See all →" link

**Verify:** See goal tracker. Click boost button, see thinking state, see plan render with all sections.

---

## Task 10: PipContentCreation

**Files:**
- Create: `src/pip/views/PipContentCreation.tsx`

### PipContentCreation
Three tabs: 📸 Video & Reels · 📌 Pinterest · 📷 Instagram

**Video & Reels tab:**
- Cards for each content idea:
  - Big emoji + mood label (Atmospheric 🌙 / Funny 😂 / Cosy ✨)
  - Title, "Why it'll do well" (1 sentence), shot list (max 4 items)
  - Effort dots (●○○ / ●●○ / ●●●)
  - "Caption ready →" and "Mark as done ✓" buttons

**Pinterest tab:**
- "Pin these posts" section: for each of 5 mock posts:
  - Post title, Pip's suggested pin title, pin description, board suggestion, image brief
  - "Copy pin text →" button (copies to clipboard)
- "Pinterest SEO" section: top 5 Pinterest search terms, searchable keywords list

**Instagram tab:**
- "Caption bank": ready-to-post captions with hook line, full caption, hashtags, suggested time, "Copy caption →"
- "Reel ideas": short-form video ideas framed for Reels format

All data from pipMockData.

**Verify:** Click through all 3 tabs. See content cards. Test copy-to-clipboard.

---

## Task 11: PipCalendar + PipAchievements

**Files:**
- Create: `src/pip/views/PipCalendar.tsx`
- Create: `src/pip/views/PipAchievements.tsx`

### PipCalendar
- Monthly calendar grid (February 2026)
- Events shown as coloured dots/pills on their dates
- Event types: "Published" (green), "Planned" (amber), "Social" (blue)
- Click a date to see event details in a side panel or tooltip
- Nav arrows to go between months
- Mock events from pipMockData

### PipAchievements
- Grid of achievement badges (3 columns)
- Each badge: emoji icon, name, description, earned/locked state
- Earned badges are full colour, locked are greyed with "?" overlay
- 6 mock achievements: "First Post", "Cluster Complete", "Week Streak", "100 Sessions", "SEO Win", "Social Butterfly"
- Fun confetti or sparkle on earned badges

**Verify:** See calendar with events on dates. See achievements grid with mix of earned/locked.

---

## Task 12: Wire Up Sidebar + Polish Layout

**Files:**
- Modify: `src/pip/PipLayout.tsx` (finalize sidebar with real data)
- Modify: `src/pip/PipApp.tsx` (finalize all routes)

### Sidebar finalization
- Pip greeting: "Hey Beth 👋" with contextual sub-message based on time
- StreakBar with real streak from usePipData
- XpBar with real XP/level from usePipData
- Nav items with active state (highlight current route)
- Each nav item: icon (Lucide) + label
- Mobile: hamburger toggle, slide-in overlay with backdrop blur
- Logout button at bottom

### Route finalization
All nested routes under `/pip`:
```
/pip           → PipHome
/pip/ideas     → PipIdeas
/pip/clusters  → PipClusters
/pip/seo       → PipSeoHelper
/pip/goals     → PipGoals
/pip/content   → PipContentCreation
/pip/calendar  → PipCalendar
/pip/analytics → PipAnalytics
/pip/achievements → PipAchievements
```

**Verify:** Navigate between all views via sidebar. Check active states. Test mobile hamburger menu.

---

## Task 13: Polish — Animations, Loading States, Mobile

**Files:** Multiple existing pip files

### Animations
- Page transitions: fade + slight slide-up on route change (wrap Routes in AnimatePresence)
- Card hover effects: subtle lift on idea cards, stat cards
- Pip "thinking" state: 3 bouncing dots animation for Claude API calls
- Achievement unlock: sparkle burst animation

### Loading states
- Skeleton loaders for stat cards and charts while data loads
- Pip thinking bubble for API calls (YES AND, Boost)

### Mobile responsive
- Sidebar collapses to hamburger on < 768px
- IdeaDeck cards resize to full-width on mobile
- Analytics tabs become scrollable horizontally
- Calendar simplifies to list view on small screens
- Stat cards stack vertically on mobile

**Verify:** Test on mobile viewport (375px). All views usable. No horizontal overflow.

---

## Task 14: Build Verification & Type Check

**Steps:**
1. `npx tsc --noEmit` — zero errors
2. `npx vite build` — production build passes
3. Manual smoke test: navigate all 9 views, test idea deck interactions, test YES AND, test boost button
4. Verify no console errors

---

## Build Order Summary

1. Dependencies + file structure + route
2. Auth gate + layout shell
3. Mock data + shared hooks + small components
4. PipHome view
5. IdeaDeck + IdeaCard (Tinder mechanic)
6. YesAndInput (YES AND)
7. PipAnalytics (tabbed dashboard with charts)
8. PipClusters + PipSeoHelper
9. PipGoals + Boost button
10. PipContentCreation (3-tab creative studio)
11. PipCalendar + PipAchievements
12. Wire up sidebar + polish layout
13. Animations, loading states, mobile
14. Final build verification
