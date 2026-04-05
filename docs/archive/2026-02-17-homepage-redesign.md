# Idle Hours Homepage Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the Idle Hours homepage from scratch with 11 editorial sections, a new brand palette, and a release calendar feature.

**Architecture:** Direct composition of 11 section components in `homepage.tsx` (no SectionRenderer). New palette applied via CSS custom properties so other pages inherit automatically. All mock data hardcoded in components.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 3, Framer Motion, Vite 7, Lora font (already loaded)

**Spec file:** `public/prompt.md` (the source of truth for all copy, colours, mock data, and layout)

---

## Task 1: Palette Migration

**Files:**
- Modify: `src/index.css` (lines 8-55 — CSS custom properties)
- Modify: `tailwind.config.js` (lines 24-70 — add new brand colour tokens)
- Modify: `src/App.tsx` (line 25 — update ClickSpark colour)

**Step 1: Update CSS custom properties in `src/index.css`**

Replace the `:root` block with new Idle Hours v2 palette. Convert hex to HSL:
- `#f5ede4` → `30 47% 93%` (linen background)
- `#1e1a14` → `36 20% 10%` (brand-dark foreground)
- `#c95d0d` → `25 89% 42%` (burnt-orange primary)
- `#52b788` → `153 39% 52%` (accent-green)
- `#2d6a4f` → `155 41% 30%` (brand-green)
- `#137034` → `148 72% 26%` (teal)
- `#6b7280` → `220 9% 46%` (muted text)
- `#ffffff` → `0 0% 100%` (card)
- `#f9fafb` → `210 20% 98%` (off-white)

```css
:root {
  --background: 30 47% 93%;
  --foreground: 36 20% 10%;

  --card: 0 0% 100%;
  --card-foreground: 36 20% 10%;

  --popover: 0 0% 100%;
  --popover-foreground: 36 20% 10%;

  --primary: 25 89% 42%;
  --primary-foreground: 0 0% 100%;

  --secondary: 210 20% 98%;
  --secondary-foreground: 36 20% 10%;

  --muted: 30 20% 90%;
  --muted-foreground: 220 9% 46%;

  --accent: 153 39% 52%;
  --accent-foreground: 0 0% 100%;

  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;

  --border: 30 15% 82%;
  --input: 30 15% 82%;
  --ring: 25 89% 42%;

  --radius: 1rem;

  /* Brand tokens */
  --linen: 30 47% 93%;
  --brand-dark: 36 20% 10%;
  --brand-green: 155 41% 30%;
  --accent-green: 153 39% 52%;
  --burnt-orange: 25 89% 42%;
  --teal: 148 72% 26%;
}
```

**Step 2: Add brand tokens to `tailwind.config.js`**

Add after the existing `ember` line in the colors object:
```js
// New Idle Hours v2 brand tokens
linen: 'hsl(var(--linen))',
'brand-dark': 'hsl(var(--brand-dark))',
'brand-green': 'hsl(var(--brand-green))',
'accent-green': 'hsl(var(--accent-green))',
'burnt-orange': 'hsl(var(--burnt-orange))',
teal: 'hsl(var(--teal))',
```

Remove old tokens (plum, peach, olive, ember, warm-cream) from both `index.css` and `tailwind.config.js`.

**Step 3: Update ClickSpark colour**

In `src/App.tsx` line 25, change `sparkColor="#ED850F"` to `sparkColor="#c95d0d"`.

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds. Existing pages render with updated palette.

**Step 5: Commit**

```
feat: migrate to Idle Hours v2 brand palette
```

---

## Task 2: Homepage NavBar

**Files:**
- Create: `src/components/homepage/NavBar.tsx`

**Step 1: Build NavBar component**

Sticky nav with:
- Left: `idle hours` wordmark in lowercase serif
- Centre: `Game Library` · `Quizzes` · `Guides` · `Cosy Corner` · `About` (Links to existing routes: /games, /quizzes, /blog, /shop, /about)
- Right: search icon + `Find a game` CTA button in burnt-orange
- Background: linen `#f5ede4` with subtle bottom border
- Sticky with `backdrop-blur-md` on scroll
- Hamburger menu on mobile with animated slide-down

Use `react-router-dom` Link components. Lucide `Search` and `Menu`/`X` icons.

**Step 2: Commit**

```
feat: add homepage NavBar component
```

---

## Task 3: Hero Section

**Files:**
- Create: `src/components/homepage/Hero.tsx`

**Step 1: Build Hero component**

Full-viewport-width dark section with CSS-only atmospheric background:
- Background: CSS gradient from deep teal to near-black with scattered glowing dots (fireflies) using absolute-positioned `div`s with `@keyframes` pulse/float animations
- Left-aligned text:
  - Eyebrow: `"🌿 Updated daily"` pill badge (green bg, white text)
  - Headline (large serif, white): `"For the hours you didn't plan to spend — and didn't want to end"`
  - Subheading (smaller, cream): `"Games that are absorbing, forgiving, and made by people who love the medium. Not just cosy. Just genuinely good."`
  - Two CTAs: `[Browse Games]` (filled burnt-orange, links to /games) + `[Find a game for my mood →]` (ghost outline white, links to /quizzes)
- Below headline: 3 micro-badges row: `🕐 Not just "cosy"` · `🎮 Made with love` · `🎵 Soundtracks matter`
- Framer Motion fade-up animation on mount

Firefly implementation: 12-15 small absolute-positioned circles with randomised positions, sizes (2-4px), and animation delays. Two keyframes: `firefly-float` (gentle y movement) and `firefly-glow` (opacity pulse). Use Tailwind arbitrary values for positioning.

**Step 2: Commit**

```
feat: add Hero section with CSS firefly atmosphere
```

---

## Task 4: Philosophy Strip

**Files:**
- Create: `src/components/homepage/PhilosophyStrip.tsx`

**Step 1: Build PhilosophyStrip component**

White background (`bg-white`), full-width with `max-w-7xl` inner container. 3-column grid (1-col on mobile).

Each column: left border accent in brand-green, icon + bold heading + 2-line body. Content exactly as specified in prompt.md lines 89-104.

Framer Motion staggered fade-in on scroll (viewport `once: true`).

**Step 2: Commit**

```
feat: add PhilosophyStrip section
```

---

## Task 5: Mood Tiles

**Files:**
- Create: `src/components/homepage/MoodTiles.tsx`

**Step 1: Build MoodTiles component**

Section heading: `"Find your next game by mood"` + sub: `"Not sure what you're in the mood for? Start here."`

2×2 grid of large mood tiles (1-col on mobile, 2×2 on sm+). Each tile is a `Link` to `/mood/[slug]`:

| Tile | Slug | BG colour | Icon | Sub | Tags |
|------|------|-----------|------|-----|------|
| Low energy day | low-energy | sage green `#52b788/20` | 🌧️ | "No challenge required. Just vibe." | anxiety-friendly · no-combat · short sessions |
| I want to get absorbed | absorbed | deep teal `#137034` light text | 🌀 | "One more run. One more day. One more..." | one-more-run · Balatro · roguelikes |
| Play something with me | co-op | warm amber `#c95d0d/20` | 🎮 | "Co-op and multiplayer picks." | co-op · couch · online |
| I want a challenge (but kindly) | challenge | near-dark `#1e1a14` cream text | ⛰️ | "Celeste. Cairn. Hard games with gentle souls." | meditative-challenge · forgiving · great-soundtrack |

Hover: `scale(1.02)` + soft shadow via Framer Motion `whileHover`.

**Step 2: Commit**

```
feat: add MoodTiles section
```

---

## Task 6: Editorial Picks ("This Week's Idle Hours")

**Files:**
- Create: `src/components/homepage/EditorialPicks.tsx`

**Step 1: Build EditorialPicks component**

Section heading: `"This week's idle hours"` + sub: `"Hand-picked. Editor's note included."`

Horizontal scroll row on mobile, flex wrap on desktop (max 5 cards). Each card:
- Gradient placeholder image (16:9, rounded)
- Game name (bold)
- Platform tags as small pills
- Editor's note in italic
- Optional badge (e.g. `"🔥 This week's pick"`)

Mock data: Balatro, Celeste, Stardew Valley, A Short Hike, Cairn — with exact editor's notes from prompt.md lines 162-182.

Cards have `hover:translateY(-2px)` via Framer Motion.

**Step 2: Commit**

```
feat: add EditorialPicks section
```

---

## Task 7: Blog Section

**Files:**
- Create: `src/components/homepage/BlogSection.tsx`

**Step 1: Build BlogSection component**

Section heading: `"From the blog"` + sub: `"Essays, lists, and recommendations with an actual point of view."`

3-column grid (1-col mobile, 2-col tablet, 3-col desktop). Each card:
- CSS gradient thumbnail (not an image) using brand palette colours specified in prompt
- Category pill badge with emoji
- Title (serif)
- 1-line excerpt
- Read time

Mock data: 3 posts from prompt.md lines 200-217.

Hover: image area scales slightly (overflow-hidden + scale on inner div).

**Step 2: Commit**

```
feat: add BlogSection with gradient thumbnails
```

---

## Task 8: Release Calendar

**Files:**
- Create: `src/components/homepage/ReleaseCalendar.tsx`

This is the most complex component. Build in sub-steps.

**Step 1: Build calendar grid (left panel)**

Two-panel layout (stacks on mobile):
- Left: calendar grid with lavender colour scheme
- Calendar header: month/year + prev/next arrows
- 7-column grid for days (Mon-Sun headers)
- Day cells: `#e8e2ff` background, today highlighted with `#7c3aed`
- Days with releases show a coloured dot using the game's `color` property
- Clicking a release day selects it (purple border + shadow)

State: `currentMonth` (Date), `selectedDate` (string | null)

Month navigation: prev/next buttons change `currentMonth` state.

Mock data: 5 games from prompt.md lines 346-401, stored as a const array in the component.

**Step 2: Build game detail sidebar (right panel)**

When a day with a release is selected:
- Game cover placeholder (gradient using game's `color`)
- Game name, formatted release date, platforms, developer/publisher
- Short description
- Idle Hours verdict line
- Two buttons: `[💜 Add to Wishlist]` (purple filled) + `[🔔 Remind me]` (ghost outline)

When nothing selected:
- Placeholder: `"Select a release date to see details"` with calendar emoji

**Step 3: Implement wishlist (localStorage)**

On wishlist button click:
- Toggle game ID in `localStorage` key `idlehours_wishlist` (JSON array)
- Button text toggles: "Add to Wishlist" / "On your Wishlist ✓"
- Show inline toast notification for 2 seconds: `"Added to your wishlist 💜"` or `"Removed from wishlist"`

**Step 4: Implement remind-me modal**

On remind button click:
- Show a small popover/modal with email input + `[Set reminder →]` button
- On submit: `console.log('Reminder set for', gameName, email)`
- Dismiss with ✕ button or clicking outside

**Step 5: Add section header**

Above the calendar:
- Badge: `"📅 Coming Soon"`
- Heading: `"Upcoming games worth your time"`
- Sub: `"Only games that pass the Idle Hours test make it onto this calendar."`

**Step 6: Commit**

```
feat: add ReleaseCalendar with wishlist and reminders
```

---

## Task 9: Mood Quiz CTA Banner

**Files:**
- Create: `src/components/homepage/MoodQuizBanner.tsx`

**Step 1: Build MoodQuizBanner component**

Full-width dark banner (`bg-brand-dark`), centred content:
- 🎯 icon (large)
- Heading: `"Not sure what to play?"`
- Sub: `"Take our quick mood quiz and we'll match you with the perfect game for right now."`
- CTA: `[🎯 Find my game]` burnt-orange filled button, links to /quizzes
- Background: subtle scattered dots using CSS (similar technique to Hero fireflies but smaller/dimmer)

**Step 2: Commit**

```
feat: add MoodQuizBanner CTA section
```

---

## Task 10: Game of the Month

**Files:**
- Create: `src/components/homepage/GameOfMonth.tsx`

**Step 1: Build GameOfMonth component**

Two-column layout (stacks on mobile): image left, content right. White background.

- Badge: `"🏆 Game of the Month — February 2026"`
- Image: gradient placeholder for Stardew Valley (use accent-green tones)
- Tags: `95% Idle` · `Brain effort: Low` · `Snack Safe` · `Co-op`
- Title: `Stardew Valley`
- Body: exact copy from prompt.md line 249-251
- CTA: `[Read our full write-up →]` in brand-green, links to `/games/stardew-valley`

**Step 2: Commit**

```
feat: add GameOfMonth feature section
```

---

## Task 11: Cosy Corner (Gear)

**Files:**
- Create: `src/components/homepage/CosyCorner.tsx`

**Step 1: Build CosyCorner component**

Section heading: `"Build your cosy gaming corner"` + sub: `"Hand-picked gear for the right atmosphere. Budget options always included."`

Horizontal scroll row of 5 product cards. Each card:
- Gradient placeholder image (warm tones)
- Product name
- Price
- Retailer pill badge
- `View on [retailer] →` link (href="#" as placeholder)

Mock data: 5 products from prompt.md lines 264-269.

`scrollbar-hide` utility class (already defined in index.css).

**Step 2: Commit**

```
feat: add CosyCorner gear section
```

---

## Task 12: Footer

**Files:**
- Create: `src/components/homepage/Footer.tsx`

**Step 1: Build Footer component**

Dark background (`bg-brand-dark`), 3-column layout (stacks on mobile), cream/white text:

- Col 1: `idle hours` wordmark + tagline `"Games worth your idle hours."` + `"🎵 Music playing: ambient game OSTs"`
- Col 2: Explore links (Game Library, Guides, Quizzes, Cosy Corner, About) — use react-router-dom Links
- Col 3: Legal links (Privacy, Disclosure, Contact) + `"Made with 🌿 in the UK"`

**Step 2: Commit**

```
feat: add homepage Footer
```

---

## Task 13: Assemble Homepage

**Files:**
- Modify: `src/pages/homepage.tsx` (replace entire contents)

**Step 1: Rewrite homepage.tsx**

Import all 11 homepage components and compose them in order:

```tsx
import { useState } from 'react'
import HomeLoader from '@/components/HomeLoader'
import NavBar from '@/components/homepage/NavBar'
import Hero from '@/components/homepage/Hero'
import PhilosophyStrip from '@/components/homepage/PhilosophyStrip'
import MoodTiles from '@/components/homepage/MoodTiles'
import EditorialPicks from '@/components/homepage/EditorialPicks'
import BlogSection from '@/components/homepage/BlogSection'
import ReleaseCalendar from '@/components/homepage/ReleaseCalendar'
import MoodQuizBanner from '@/components/homepage/MoodQuizBanner'
import GameOfMonth from '@/components/homepage/GameOfMonth'
import CosyCorner from '@/components/homepage/CosyCorner'
import Footer from '@/components/homepage/Footer'

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  return (
    <>
      {loading && <HomeLoader onComplete={() => setLoading(false)} />}
      <div className="min-h-screen bg-background">
        <NavBar />
        <Hero />
        <PhilosophyStrip />
        <MoodTiles />
        <EditorialPicks />
        <BlogSection />
        <ReleaseCalendar />
        <MoodQuizBanner />
        <GameOfMonth />
        <CosyCorner />
        <Footer />
      </div>
    </>
  )
}
```

**Step 2: Verify build + dev server**

Run: `npm run build`
Expected: Clean build, no TS errors.

Run: `npm run dev`
Expected: Homepage renders all 11 sections in order. Other pages still work.

**Step 3: Commit**

```
feat: assemble new homepage with all 11 sections
```

---

## Task 14: Quality Checklist + Final Polish

**Files:**
- Various homepage components (minor fixes only)

**Step 1: Run through quality checklist from prompt.md**

- [ ] "cosy" (not "cozy") used throughout all components
- [ ] Hero communicates Idle Hours philosophy
- [ ] Balatro + Celeste visible in editorial picks
- [ ] Calendar shows real upcoming games with working month navigation
- [ ] Wishlist state persists in localStorage
- [ ] Mobile layout works on 375px viewport
- [ ] No broken images — gradient placeholders everywhere
- [ ] Blog section visible with mock content
- [ ] Philosophy strip is first section after hero
- [ ] Mood tiles link to `/mood/[slug]`
- [ ] Footer includes music player reference

**Step 2: Fix any issues found**

**Step 3: Final commit**

```
feat: homepage redesign quality pass and polish
```

---

## Execution Notes

- **Total components to build:** 11 new + 1 rewrite (homepage.tsx) + palette migration
- **No tests specified** — this is a frontend UI build with mock data, no business logic to unit test
- **Build verification** after palette migration (Task 1) and after final assembly (Task 13)
- **Other pages** should still work after palette migration — verify at Task 1 Step 4
