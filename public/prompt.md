# Idle Hours — Homepage Redesign + Release Calendar
## Prompt for Claude Code

---

## Context & Brief

You are redesigning the homepage of **Idle Hours** (idlehours.co.uk) — a games blog with a very specific philosophy. This is not a generic "cozy games" site. The brand is built around the concept of games that create **the idle hours feeling**: absorbing, forgiving, made by people who love the medium, hard to put down for the right reasons.

**Tech stack:** Vite + React + Tailwind CSS  
**Design approach:** Editorial warmth meets genuine craft. Think magazine-quality illustration aesthetic — NOT a gaming wiki, NOT a generic discovery platform, NOT IGN.  
**Mock data:** Use realistic placeholder content throughout. The site is in early development so mock images, games, posts, and release dates are all fine.

**Brand colours to use throughout:**
- Background / linen: `#f5ede4` (warm parchment)
- Dark / near-black: `#1e1a14`  
- Brand green: `#2d6a4f`
- Accent green: `#52b788`
- Burnt orange: `#c95d0d`
- Teal: `#137034`
- Muted text: `#6b7280`
- Card white: `#ffffff`
- Off-white: `#f9fafb`

---

## Current Problems to Fix

The existing homepage has these specific issues:
1. Hero headline is generic — "Find your next favourite cozy game" could be any competitor
2. No communication of what makes Idle Hours different
3. "Trending games" section shows the same 5 games as every other cosy games site
4. No blog/editorial content visible anywhere
5. The expanded niche (Balatro, Celeste, Cairn — not just "cosy") is invisible
6. Heavy whitespace either side of content column on desktop — feels narrow
7. Gear/shop section appears too high in the page hierarchy before trust is established
8. "cozy" (US spelling) should be "cosy" (UK) throughout

---

## New Homepage Structure

Build the homepage in this exact scroll order:

### 1. NAV (sticky)
- Left: wordmark `idle hours` in lowercase, serif font (use `font-serif` or a warm serif like Playfair Display via Google Fonts)
- Centre: `Game Library` · `Quizzes` · `Guides` · `Cosy Corner` · `About`
- Right: search icon + `🎮 Find a game` CTA button in burnt orange (`#c95d0d`)
- Background: `#f5ede4` with a very subtle bottom border. Goes sticky on scroll with a slight backdrop-blur.

---

### 2. HERO SECTION

**Full-width**, uses a dark illustrated background image (use a CSS gradient that evokes a dark forest/garden — deep teals and near-blacks, with some scattered small glowing dots like fireflies for atmosphere — build this in CSS/Tailwind, no image dependency).

**Layout:** Left-aligned text, right side has decorative atmospheric effect.

**Copy (use exactly this):**
```
Eyebrow pill badge: "🌿 Updated daily"

Headline (large, serif, white):
"For the hours you didn't plan
to spend — and didn't want to end"

Subheading (smaller, soft white/cream):
"Games that are absorbing, forgiving, and made by people who love
the medium. Not just cosy. Just genuinely good."

Two CTAs side by side:
[Browse Games]  (filled, burnt orange #c95d0d)
[Find a game for my mood →]  (ghost/outline, white border)
```

**Below the headline**, add a subtle row of 3 trust/philosophy micro-badges:
```
🕐 Not just "cosy"  ·  🎮 Made with love  ·  🎵 Soundtracks matter
```

---

### 3. PHILOSOPHY STRIP (3 columns)

Warm white background (`#ffffff`), generous padding, full content width.

Three columns, each with a small icon, a bold short heading, and 2 sentences of body copy:

```
Column 1 — icon: 🕐
Heading: "Not just cosy"
Body: "We cover Balatro. We cover Celeste. We cover Cairn. If a game 
gives you idle hours, it belongs here — regardless of aesthetic."

Column 2 — icon: 🛡️  
Heading: "Games that respect you"
Body: "No FOMO mechanics. No pay-to-win. Every game we cover passes 
one test: can you set it down without being punished for it?"

Column 3 — icon: 🎵
Heading: "It's about the feeling"
Body: "The best idle hours feel like the music is still playing after 
you've closed the laptop. We look for that quality in everything."
```

Subtle left border accent in brand green (`#2d6a4f`) on each column.

---

### 4. FOR YOUR MOOD (the key differentiator section)

**Section heading:** `Find your next game by mood`  
**Subheading:** `Not sure what you're in the mood for? Start here.`

**4 large mood tiles** in a 2×2 grid (desktop) or 2×2 wrapping (mobile):

```
Tile 1 — "Low energy day"
Colour: soft sage green background
Icon: 🌧️
Sub: "No challenge required. Just vibe."
Tags shown: anxiety-friendly · no-combat · short sessions

Tile 2 — "I want to get absorbed"
Colour: deep teal background, light text
Icon: 🌀
Sub: "One more run. One more day. One more..."
Tags shown: one-more-run · Balatro · roguelikes

Tile 3 — "Play something with me"
Colour: warm amber/orange background
Icon: 🎮
Sub: "Co-op and multiplayer picks."
Tags shown: co-op · couch · online

Tile 4 — "I want a challenge (but kindly)"
Colour: near-dark background, cream text
Icon: ⛰️
Sub: "Celeste. Cairn. Hard games with gentle souls."
Tags shown: meditative-challenge · forgiving · great-soundtrack
```

Each tile is clickable (link to `/mood/[slug]`). Hover state: slight scale up (1.02), soft shadow.

---

### 5. THIS WEEK'S IDLE HOURS (editorial picks)

**Section heading:** `This week's idle hours`  
**Subheading:** `Hand-picked. Editor's note included.`

Horizontal scrolling card row (5 cards, scrollable on mobile, wrapping on desktop for first 5):

Each card contains:
- Game screenshot / placeholder (16:9 ratio, rounded corners)
- Game name (bold)
- Platform tags
- An **editor's note** in italic — this is what makes it different:

```
Mock cards:
1. Balatro
   Editor's note: "Not cosy by any definition. But you will not put it down. Friday night warning."
   Tags: PC · one-more-run · great-soundtrack
   Badge: "🔥 This week's pick"

2. Celeste
   Editor's note: "One of the hardest platformers made. Also one of the most compassionate games ever made. Both are true."
   Tags: PC · Switch · meditative-challenge

3. Stardew Valley
   Editor's note: "The game most people mean when they say they want something cosy. It earns the reputation."
   Tags: PC · Switch · PS5 · Xbox · Mobile · idle-friendly

4. A Short Hike
   Editor's note: "Two hours. Possibly the most complete two hours in games. Play it on a Sunday afternoon."
   Tags: PC · Switch · short-sessions

5. Cairn
   Editor's note: "Climbing but meditative. You can set it down mid-climb. The mountain waits."
   Tags: PC · meditative-challenge · no-combat
```

---

### 6. FROM THE BLOG

**Section heading:** `From the blog`  
**Subheading:** `Essays, lists, and recommendations with an actual point of view.`

3-column grid of blog post cards, each with:
- **Illustrated thumbnail** — use a CSS gradient placeholder styled to look like an editorial illustration (use rich colour combinations from the brand palette — not grey boxes)
- Category pill badge (e.g. `📋 List` / `🎮 Review` / `💭 Essay`)
- Post title (serif, warm dark)
- 1-line excerpt
- Read time

```
Mock posts:
1. Category: 📋 List
   Title: "10 games to get you into platformers (ranked by how forgiving they are)"
   Excerpt: "From A Short Hike to Celeste — every game on this list earns its place."
   Thumbnail gradient: #1e1a14 → #c95d0d (the mountain illustration palette)
   Read time: 8 min read

2. Category: 💭 Essay  
   Title: "What Balatro taught me about why I stopped playing games"
   Excerpt: "It took a poker roguelike to remind me what games are actually for."
   Thumbnail gradient: #2d6a4f → #137034
   Read time: 5 min read

3. Category: 🎮 Review
   Title: "Cairn review: the mountain doesn't punish you for taking a break"
   Excerpt: "Challenging, meditative, and genuinely unlike anything else in its genre."
   Thumbnail gradient: #137034 → #1e1a14
   Read time: 6 min read
```

---

### 7. RELEASE CALENDAR (New Feature — see full spec below)

---

### 8. MOOD QUIZ CTA BANNER

Full-width dark banner (`#1e1a14` background), centred content:

```
Icon: 🎯 (large)
Heading: "Not sure what to play?"
Sub: "Take our quick mood quiz and we'll match you with the perfect game for right now."
CTA button: [🎯 Find my game] in burnt orange
```

Decorative: subtle scattered small dots/stars in the background using CSS.

---

### 9. GAME OF THE MONTH

Two-column feature card (image left, content right) on white background:

```
Badge: 🏆 Game of the Month — February 2026
Image: Stardew Valley screenshot placeholder (left, large)
Tags: 95% Idle · Brain effort: Low · Snack Safe · Co-op
Title: Stardew Valley
Body: "February belongs to Stardew Valley. With the 1.6 update still going strong, 
there's never been a better time to return to Pelican Town."
CTA: [Read our full write-up →] in brand green
```

---

### 10. COSY CORNER (gear — bottom of page)

**Section heading:** `Build your cosy gaming corner`  
**Subheading:** `Hand-picked gear for the right atmosphere. Budget options always included.`

Horizontal scrollable product cards (5 items, mock affiliate products):

```
1. Warm Glow Desk Lamp — £34 — Amazon
2. Cloud9 Wrist Rest — £18 — Etsy  
3. Cosy Cat Headphone Stand — £22 — Etsy
4. Quiet Mechanical Keyboard — £72 — Amazon
5. Pixel Art Desk Mat — £29 — Etsy
```

Each card: product image placeholder (warm gradient), name, price, retailer pill, `View on [retailer] →` link.

---

### 11. FOOTER

3-column layout on dark background (`#1e1a14`):

```
Col 1: idle hours wordmark + tagline "Games worth your idle hours."
       + small: "🎵 Music playing: ambient game OSTs"

Col 2: Explore links (Game Library, Guides, Quizzes, Cosy Corner, About)

Col 3: Legal (Privacy, Disclosure, Contact)
       + "Made with 🌿 in the UK"
```

---

## New Feature: Release Calendar Component

Build this as a **separate component** `ReleaseCalendar.jsx` that slots into position 7 in the homepage.

### Visual Design

**Two-panel layout (desktop):**
- Left panel: Calendar grid (purple/lavender colour scheme — this is the one accent that breaks from the main palette deliberately, making it feel like a special feature)
- Right panel: Selected game details sidebar

**Colour scheme for calendar only:**
- Calendar background: `#f3f0ff` (soft lavender)
- Day cells: `#e8e2ff`  
- Today highlight: `#7c3aed` (purple)
- Game release day: thumbnail image fills the cell, with date number overlay
- Selected state: purple border + shadow

### Calendar Behaviour

```
- Displays current month by default
- Prev/Next month navigation arrows
- Days with upcoming game releases show a small game thumbnail in the cell
  (use a coloured circle/dot as placeholder when no image)
- Clicking a day with a release selects it and shows details in the right panel
- Clicking a day with no release deselects
- Month/year shown in header
```

### Right Panel (Game Detail)

When a game is selected:
```
- Game cover image (top, full width of panel)
- Game name (bold, large)
- Release date (formatted: "Fri 15 March 2026")
- Platform(s)
- Developer + Publisher
- Short description (1-2 sentences)
- Two action buttons:
  [💜 Add to Wishlist]  (purple filled)
  [🔔 Remind me]        (ghost/outline)
```

When nothing is selected:
```
Placeholder state: "Select a release date to see details"
with a soft calendar illustration (SVG or emoji-based)
```

### Mock Release Data

Use this mock data for upcoming games (these are real upcoming releases for context):

```javascript
const upcomingReleases = [
  {
    id: 1,
    name: "Paralives",
    date: "2026-05-31",
    platforms: ["PC"],
    developer: "Paralives Studio",
    publisher: "Paralives Studio",
    description: "A life simulation game inspired by The Sims but built with genuine indie care. Build homes, live lives, no microtransactions.",
    color: "#a78bfa",
    idleHoursVerdict: "Passes — life sim with no time pressure and developer transparency"
  },
  {
    id: 2,
    name: "Hades II (Full Release)",
    date: "2026-03-15",
    platforms: ["PC", "PS5", "Xbox"],
    developer: "Supergiant Games",
    publisher: "Supergiant Games",
    description: "The full release of one of the best early access games of 2024. Supergiant doesn't miss.",
    color: "#c95d0d",
    idleHoursVerdict: "Passes the Balatro Test — will absolutely steal your weekend"
  },
  {
    id: 3,
    name: "Hollow Knight: Silksong",
    date: "2026-04-10",
    platforms: ["PC", "Switch", "PS5", "Xbox"],
    developer: "Team Cherry",
    publisher: "Team Cherry",
    description: "Possibly the most anticipated indie game ever made. Play as Hornet in a new kingdom.",
    color: "#2d6a4f",
    idleHoursVerdict: "Pending — Team Cherry earns the benefit of the doubt"
  },
  {
    id: 4,
    name: "Stardew Valley 2.0 Update",
    date: "2026-02-28",
    platforms: ["PC", "Switch", "PS5", "Xbox", "Mobile"],
    developer: "ConcernedApe",
    publisher: "ConcernedApe",
    description: "ConcernedApe continues to support the game years after release. More Pelican Town content.",
    color: "#52b788",
    idleHoursVerdict: "Passes — the gold standard doesn't change"
  },
  {
    id: 5,
    name: "Cozy Grove: Camp Spirit",
    date: "2026-03-22",
    platforms: ["PC", "Switch", "Mobile"],
    developer: "Spry Fox",
    publisher: "Spry Fox",
    description: "A new chapter of the beloved daily ritual game. Ghost bears, cosy crafting, gentle melancholy.",
    color: "#f59e0b",
    idleHoursVerdict: "Passes — idle-friendly by design"
  }
];
```

### Wishlist/Remind Me Feature

**Wishlist button:** On click, toggle state (added/not added). Store in `localStorage` as `idlehours_wishlist`. Show a small toast notification: `"Added to your wishlist 💜"` or `"Removed from wishlist"`.

**Remind me button:** On click, show a simple modal/popover:
```
"We'll remind you when [Game Name] releases."
[Your email]  [Set reminder →]
Form submits to a placeholder endpoint (console.log for now).
Dismiss button: ✕
```

### Section Header (above calendar)

```
Section badge: "📅 Coming Soon"
Heading: "Upcoming games worth your time"
Sub: "Only games that pass the Idle Hours test make it onto this calendar."
```

---

## Technical Notes

### Component Structure

```
src/
  components/
    homepage/
      Hero.jsx
      PhilosophyStrip.jsx
      MoodTiles.jsx
      EditorialPicks.jsx
      BlogSection.jsx
      ReleaseCalendar.jsx
      MoodQuizBanner.jsx
      GameOfMonth.jsx
      CosyCorner.jsx
    shared/
      GameCard.jsx
      BlogCard.jsx
      MoodTile.jsx
  pages/
    Home.jsx  (assembles all sections)
```

### Styling Approach

- Use Tailwind utility classes throughout
- Define brand colours in `tailwind.config.js` as custom colours:
  ```js
  colors: {
    linen: '#f5ede4',
    'brand-dark': '#1e1a14',
    'brand-green': '#2d6a4f',
    'accent-green': '#52b788',
    'burnt-orange': '#c95d0d',
    teal: '#137034',
  }
  ```
- Use `font-serif` for headings (configure Playfair Display or similar via @import in index.css)
- Smooth scroll on anchor links
- Add `transition-all duration-200` to interactive elements

### Animations

- Hero text: fade up on mount (use a simple CSS animation or Framer Motion if available)
- Mood tiles: staggered fade-in on scroll (use Intersection Observer or a simple scroll listener)
- Calendar day hover: scale and shadow transition
- Game cards: subtle translateY(-2px) on hover
- Blog cards: image zoom on hover (overflow hidden + scale on img)
- Music player badge in footer: subtle pulse animation on the music note

### Responsive Behaviour

- Mobile: Stack all sections vertically. Mood tiles go 1-column. Calendar goes full width with the detail panel below.
- Tablet: 2-column mood tiles, 2-column blog posts
- Desktop: Full layout as described above
- Nav: Hamburger menu on mobile

### The Narrow Column Problem

The current site feels narrow because of the fixed max-width container. For this redesign:
- Hero: full viewport width, edge-to-edge
- Philosophy strip: full width, edge-to-edge sections with internal padding
- Content sections: `max-w-7xl` (1280px) centred, with `px-6 md:px-12` padding
- The linen background shows at sides on very wide screens — this is intentional and adds warmth

---

## Quality Bar

Before finishing, check:
- [ ] "cosy" (not "cozy") used throughout
- [ ] Hero communicates the Idle Hours philosophy, not just "game discovery"
- [ ] At least one "unexpected" game (Balatro or Celeste) visible in the editorial picks
- [ ] Calendar shows real upcoming games with working month navigation
- [ ] Wishlist state persists in localStorage
- [ ] Mobile layout works on 375px viewport
- [ ] No broken images — use gradient placeholders everywhere
- [ ] Blog section exists and is visible (even with mock content)
- [ ] Philosophy strip is the first section after the hero
- [ ] Mood tiles link to `/mood/[slug]` even if pages don't exist yet
- [ ] Footer includes the music player reference

---

## What This Should Feel Like

A visitor landing on this page for the first time should immediately understand:
1. This is different from every other cosy games site
2. They cover games that respect your time — not just cute games
3. The site has a genuine editorial point of view
4. It's a blog, not just a database

The overall feeling should be: a warm, considered, slightly literary magazine for people who take their leisure time seriously.