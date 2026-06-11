# CLAUDE.md — Idle Hours

## How to work in this codebase

Act as a senior developer joining an existing codebase: the answer to
"how do we do X here" is in the code and this document, not in your
defaults. Reuse before build. Precedent before invention.

Use precise literal names for everything (see GLOSSARY). Do not invent
shorthand, nicknames, or metaphors for parts of the system. If a name
has changed, the RENAME LEDGER is authoritative — never resurrect an
old name.

## What this is

Idle Hours is a game discovery engine with an editorial voice at
idlehours.co.uk. It combines Beth's editorial writing with six
interactive daily/session games, a curated game library, and
affiliate-linked recommendations. The site is pre-launch with zero
public traffic — everything is in active development.

## North Star & Product Principles

Before making any decision about features, architecture, or
public-facing copy, read `NORTH-STAR.md` in the repo root.

Read it when:
- Adding or changing any user-facing feature
- Evaluating whether something should be built at all
- Writing or editing any copy that appears on the site
- Making decisions about what games or content to surface

Do not read it for:
- Styling-only changes
- Bug fixes
- Internal tooling

Note: NORTH-STAR.md contains stale rank-ladder names. `src/lib/ranks.ts`
is the only source of truth for ranks (see GLOSSARY).

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 3.4 with custom CSS variables, Framer Motion
- **Animation (reserved):** GSAP installed but intentionally unused —
  reserved for the final animation layer post-build. Do not import it
  without explicit instruction; do not remove it either.
- **CMS:** Sanity v5 (project `ijj3h2lj`, dataset `production`)
- **Database:** Supabase (scores, jobs board, jigsaw sync)
- **Hosting:** Vercel (auto-deploys from `main` branch)
- **Studio:** Sanity Studio deployed separately via `npx sanity deploy`
- **Fonts:** Montserrat only — see Typography section

## Directory map

```
src/
  app/                    — Next.js App Router pages
    page.tsx              — Homepage (renders hardcoded HomepageClient;
                            the Sanity modular-section system is
                            abandoned/paused — see Open decisions)
    about/                — About page
    blog/, blog/[slug]/   — Blog listing + individual posts
    contact/              — Contact form
    games/, games/[slug]/ — Game library + individual game pages
    jobs/                 — Internal Kanban job board (Supabase)
    play/                 — Games hub + all interactive games
      game-sense/         — Daily word puzzle (fill-in-the-blank)
      street-date/        — Daily chronological sorting puzzle (7 games)
      shelf-price/        — Daily price comparison game (higher/lower)
      box-set/            — Daily grouping puzzle (Connections-style;
                            puzzles pre-assembled + committed, see its
                            data/ and scripts/assemble-box-set.mjs)
      blitz/              — Rapid-fire title guessing (timed)
      jigsaw/             — Multiplayer collaborative jigsaw (Supabase)
      ship-it/            — Publishing deal negotiation game
      skill-issue/        — Legacy redirect to game-sense (see Open decisions)
      archive/            — Shared archive viewer for all daily games
    staging/              — Design system playground (11 pages)
    quizzes/              — Quiz listing page
    api/
      featured-content/   — GET: latest posts from Sanity (used by DiscoverMore)
      igdb/               — POST proxy to IGDB (Twitch credentials,
                            server-only; needs CORS allowlist + rate
                            limit before launch — see Known issues)
  components/             — Shared React components
    games/                — ResultCard, DailyBadgeShelf, SplitShareButton,
                            Confetti, BadgeLightbox, PostGameLeftColumn,
                            GameEndModal.copy.ts (rank flavour text —
                            live and load-bearing)
      shell/              — Game shell UI: GameWorld, GameTitle, ScorePill,
                            GameNavPills, RulesModal, PlayableGuard,
                            PostGameAnalysisCard (see Game shell section)
    homepage/             — Homepage section components
    jobs/                 — Job board components
    play/                 — Play hub cards and sections
    ui/                   — Shadcn primitives (button, badge, input)
  lib/                    — Shared utilities
    sanity.ts             — Sanity client config
    supabase.ts           — Supabase client (nullable singleton)
    queries.ts            — All Sanity GROQ queries
    ranks.ts              — Rank ladders + GAME_THEME for the 3 daily
                            games (SOURCE OF TRUTH)
    animations.ts         — 9 entrance animation presets + useEntranceSteps
    game-shell/           — Game shell logic: registry.ts (per-game
                            manifests — THE integration surface),
                            dayStore, completion, gameDates, seededRng,
                            useGameEntrance, useMobileThemeColor,
                            buildShareText, formatElapsed
    jobs.ts               — Supabase CRUD for /jobs board
    dateUtils.ts          — Shared date logic (Europe/London) — the only
                            date module games should import
    (also: dayFlavour.ts, gameConstants.ts, imageUtils.ts,
     jigsawShapes.ts, jigsawUtils.ts, utils.ts)
  data/
    games-db.ts           — ~3,975 games (id, title, year, genres,
                            platforms, igdbImageId, vibe, etc.)
    blitz-topics.ts       — Topic categories for Blitz game
  context/
    GameLightboxContext   — Lightbox overlay for game detail views
  types/
    index.ts              — CMS types (some describe the abandoned
                            modular-homepage system — see Open decisions)
studio/                   — Sanity Studio (separate app, own package.json,
                            own Vite tooling — Sanity v5 uses Vite
                            internally; NOT a remnant of the site's
                            Vite era)
  schemaTypes/            — Schema types (game, post, product, quiz, etc.)
scripts/                  — 13 one-off data scripts (seeding, enrichment,
                            migration, repair). Not part of the app.
docs/plans/               — Design docs and implementation plans (historical)
public/
  fonts/                  — (see Typography — Striker font pending
                            licensing decision)
  images/                 — Site assets, icons, game covers
```

## Live features and pages

### Public pages
- **Homepage** (`/`) — hardcoded HomepageClient with ParallaxHero
- **Blog** (`/blog`, `/blog/[slug]`) — editorial posts with categories,
  search, portable text
- **Game Library** (`/games`) — browsable/filterable game catalog with
  lightbox detail view
- **About** (`/about`) — team and mission
- **Contact** (`/contact`) — contact form
- **Play Hub** (`/play`) — games dashboard with today's badges and
  game cards

### Games (8 active)
- **Game Sense** (`/play/game-sense/[date]`) — daily fill-in-the-blank,
  guess the game from clues
- **Street Date** (`/play/street-date/[date]`) — daily sort 7 games
  chronologically, Wordle-style feedback
- **Shelf Price** (`/play/shelf-price/[date]`) — daily higher/lower
  price comparison, 10 rounds
- **Box Set** (`/play/box-set/[date]`) — daily Connections-style
  grouping puzzle (block-out; playtest pending)
- **Stock Room** (`/play/stock-room/[date]`) — daily 3×3 criteria grid,
  Immaculate-Grid-style (block-out; playtest in progress)
- **Blitz** (`/play/blitz`) — rapid-fire title guessing by topic,
  timed with medals
- **Jigsaw** (`/play/jigsaw`) — collaborative multiplayer puzzle via
  Supabase realtime
- **Ship It** (`/play/ship-it`) — publishing deal negotiation game

### Internal tools
- **Jobs Board** (`/jobs`) — Kanban board for launch tasks
  (Supabase-backed)
- **Staging** (`/staging/*`) — design system playground (tokens,
  components, animations)

## Daily games — mechanics summary

### Game Sense
- Player sees a sentence with blanks: "A [genre] game about [vibe]
  released in [year]..."
- Guess the game title. Proximity scoring (closer = more points)
- 1000pts base, hints cost points, 5 blanks to reveal
- Ranks: Bust → Skill Issue → Button Masher → Big Brain → One Shot
- localStorage: `game_sense_YYYY-MM-DD`

### Street Date (v2 — sorting puzzle)
- 7 games shuffled randomly, arrange oldest→newest
- Submit to get "X/7 correct" count (no per-slot feedback without hints)
- Hints: reveal one slot (−100pts, shows green/amber/red), reveal all
  (−300pts, reusable)
- Hint reveals are tied to game+slot pairs — moving a game loses its
  reveal
- 1000pts base, −150pts per guess after first, 5 guesses max
- Ranks: Bust → Newbie → Has a Backlog → Day One → The Curator
- localStorage: `street_date_v3_YYYY-MM-DD`

### Shelf Price
- 10 rounds of "which game cost more at launch?"
- Two game cards side by side, pick the more expensive one
- 1000pts base, −100pts per wrong answer
- Ranks: Bust → Moms Credit Card → Bargain Hunter → Secret Shopper →
  Head of Sales
- localStorage: `shelf_price_v2_YYYY-MM-DD`

### Box Set (block-out — playtest pending)
- 16 games, four hidden groups of four; select 4 → submit. Correct
  group collapses to a tier-coloured banner; 3-of-4 = "one away",
  still a mistake; 4 mistakes = fail (Bust), remaining groups revealed
- 1000pts base, −250pts per mistake; fail = 0
- Ranks: Bust → Shovelware → Starter Pack → Limited Edition →
  Collector's Edition (holo)
- localStorage: `box_set_YYYY-MM-DD` (prefix frozen)
- Puzzles are NOT generated at runtime: pre-assembled from the concept
  bank (`box-set/data/concepts.json`), human-reviewed, committed as
  `box-set/data/puzzles/puzzles.json`. Refill:
  `node scripts/assemble-box-set.mjs` (tests warn under 14 days of
  buffer). Concept bank seeding: `scripts/seed-box-set-concepts.mjs`.
  Tiers: yellow broad procedural · green narrow procedural · blue
  thematic (tags) · purple title wordplay — zero external facts; every
  claim verifies against GAMES_DB fields or the title string

### Stock Room (block-out — playtest in progress; v2 arrange-then-check)
- 3×3 grid: 3 row criteria × 3 column criteria; name ANY GAMES_DB game
  that fits both axes of a cell. Platforms count ports/remasters (the
  rules copy must keep saying so — players dispute platform answers)
- Arrange-then-check: placements are free and rearrangeable (tap-to-
  move/swap/remove, Street Date grammar); no-reuse — a game appears at
  most once per board. CHECK (at 9/9 placed) marks wrong cells red;
  rearrange and check again. There are NO per-placement penalties
- 1000pts − 250 per extra check, floor 250 for any completed board;
  give-up is the only Bust. Rarity (mean answer obscurity, 0–100,
  population-percentile) is the style stat; time displayed, never scored
- End screen always shows a fully finished board — `solveBoard()` fills
  unfinished cells with valid answers (italic)
- Ranks: Bust → Work Experience → Shelf Stacker → Keyholder →
  Franchise Owner (holo, first-check 1000)
- localStorage: `stock_room_YYYY-MM-DD` (prefix frozen)
- Boards generated at runtime, seeded per date: `lib/criteria.ts`
  (32-criterion catalog) + `lib/boardGen.ts` (variety rules, every cell
  ≥15 answers, full no-reuse assignment verified). Zero external facts —
  every criterion tests GAMES_DB fields

### Post-game flow (all daily games)
- Games render an inline post-game screen (no modal). The old
  GameEndModal was removed in commit 584970e and deleted in the
  June 2026 cleanup.
- `GameEndModal.copy.ts` survives it and is live: it holds rank
  flavour text consumed by ResultCard and the game pages.
- `SplitShareButton` is live again: it sits in every daily game's
  post-game nav row (via `PostGameNavPills`), with per-game share text
  built through `buildShareText`. `Confetti` remains extracted and
  unwired.
- Rank names + thresholds: `src/lib/ranks.ts`. Flavour text:
  `GameEndModal.copy.ts`. Changing ranks means updating BOTH.

## Game shell — the shared structural layer for daily games

Built June 2026. The three daily games share one implementation of
everything structural; a game's own folder contains only its identity
(core interaction, puzzle generation, bespoke visuals).

**Logic** (`src/lib/game-shell/`): `registry.ts` defines a
`DailyGameManifest` per game — slug, label, launchDate,
storageKeyPrefix, dates, theme, store, `toDayResult()` (normalises the
won/finished asymmetry into a `DayResult`), playUrl. Every shared
consumer (archive viewer, DailyBadgeShelf, TodayCard,
`getDailyCompletion`) iterates the registry. The persisted day-state
shapes and their migrations live in the registry; game storage modules
are thin bindings over the registry stores. Also here: `createDayStore`,
`makeGameDates`, `seededRng` (mulberry32 + Street Date's LCG — both on
purpose, outputs pinned by tests/puzzle-snapshots.test.ts),
`useGameEntrance`, `useMobileThemeColor`, `buildShareText`,
`formatElapsed`, `getDailyCompletion`.

**UI** (`src/components/games/shell/`): `GameWorld` (gradient +
circle-wipe), `GameTitle` (word-pop title), `ScorePill` (md/lg),
`GameNavPills`/`PostGameNavPills`, `RulesModal` (shell; copy lives per
game), `PlayableGuard`, `PostGameAnalysisCard` (+ `StatPillRow`,
`CardDivider`). Theming comes from `GAME_THEME` in `src/lib/ranks.ts`
(accent, accentDark, shadow, confetti, worldGradient, statusBarHex) —
divergence between games happens via theme values and children/slots,
NEVER by forking a shell component.

**Share text is the one exception**: pages own their share-text memos
(Shelf Price's emoji row needs the day's pair data, which is game
identity). See the registry header comment before "fixing" this.

**New daily game checklist** (how Memo Board / Crossword ship):
1. Add the slug to `DailyGameSlug` in `src/lib/ranks.ts`; add its rank
   ladder, flavour text (GameEndModal.copy.ts), badges, and GAME_THEME
   entry.
2. Add a `DailyGameManifest` in `src/lib/game-shell/registry.ts`
   (state shape, store with key prefix, toDayResult, launch date).
3. Build the game folder: `src/app/play/<slug>/` with `[date]/page.tsx`
   composing the shell components + the game's identity components,
   `page.tsx` today-redirect, rules copy wrapping the RulesModal shell.
4. Add snapshot tests for its puzzle generation in tests/.
Rules modal, playable guard, score pill, nav pills, post-game layout,
archive integration, badge shelf, and today-card completion are
inherited — do not rebuild them.

NOT yet adopted by Blitz / Jigsaw / Ship It — their structural layers
are still forked (a later, separate job; see audit/game-architecture.md
table rows 1, 18, 19).

## Component rules — read before writing any UI code

Before creating any new component, check in this order:
1. The component manifest below
2. `src/components/ui/` — base primitives (button, badge, input, etc.)
3. `src/components/` — shared site components
4. `src/app/staging/` — the full design system with 11 pages of
   documented components, tokens, and patterns

**The rule:** Compose existing components. Do not create a new
component if an existing one can be extended or composed. If genuinely
nothing fits, state in one sentence why before building.

### Component manifest

Keep in sync: adding a component = adding a manifest row in the same
commit. `/staging` remains the visual reference for tokens + patterns.

| Component | Path (under src/components/) | Notes |
|---|---|---|
| Button, Badge, Input, Separator | ui/ | shadcn primitives — the building blocks |
| Header / SiteFooter | Header.tsx, SiteFooter.tsx | global chrome |
| ClientProviders | ClientProviders.tsx | provider stack (theme, lightbox) — auth provider slots in here |
| HomepageClient + homepage/* | HomepageClient.tsx, homepage/ | hardcoded homepage: ParallaxHero, PlayOurGames, LatestPosts, TodaysPick, WhatWerePlaying, LongRead, HomepageNewsletter, HomepageFooter |
| GameLightbox | GameLightbox.tsx | game detail overlay (GameLightboxContext) |
| GameTileCard, FeaturedBanner, BrowseView | (root), games/BrowseView.tsx | game library surfaces |
| DiscoverMore | DiscoverMore.tsx | post-game "you might like" row (uses /api/featured-content) |
| AnimatedScore | AnimatedScore.tsx | odometer-style score counter |
| AffiliateCTA, ProductCallout, DisclosureBanner, PullQuote, StickyNote, SectionLabel, GameReferenceBlock | (root) | editorial/blog blocks |
| BlogEngagement, NewsletterForm, ContactForm | (root) | forms + blog footer |
| ResultCard | games/ResultCard.tsx | post-game left card: rank, badge, ladder |
| DailyBadgeShelf | games/DailyBadgeShelf.tsx | today's three badges (reads manifest registry) |
| PostGameLeftColumn | games/PostGameLeftColumn.tsx | badge shelf + ResultCard column |
| BadgeLightbox | games/BadgeLightbox.tsx | badge zoom + holo effects (isHoloRank, HoloBadgeWrapper) |
| SplitShareButton | games/SplitShareButton.tsx | copy/Twitter/Discord/email share split button |
| Confetti | games/Confetti.tsx | win confetti (currently unwired) |
| GameWorld | games/shell/GameWorld.tsx | game-world gradient + circle-wipe container |
| GameTitle | games/shell/GameTitle.tsx | word-pop title/subtitle (timing knobs per game) |
| ScorePill | games/shell/ScorePill.tsx | in-game score + pulse + floating cost (md/lg) |
| GameNavPills / PostGameNavPills | games/shell/GameNavPills.tsx | Today's game / past games pills (+share slot) |
| RulesModal (shell) | games/shell/RulesModal.tsx | how-to-play shell; copy lives per game |
| PlayableGuard | games/shell/PlayableGuard.tsx | future-date guard |
| PostGameAnalysisCard (+StatPillRow, CardDivider) | games/shell/PostGameAnalysisCard.tsx | post-game right column card |
| GameSearchInput | games/shell/GameSearchInput.tsx | games-db typeahead (fuzzy match, ghost completion); per-game flavour via props — consumed by Game Sense (via GuessInput binding) and Stock Room |
| TodayCard, PlayGameCard, BlitzSection, ShipItSection, JigsawSection | play/ | /play hub cards + sections |
| JobBoard (+JobColumn, JobCard, JobModal, JobArchive) | jobs/ | internal Kanban |

If a new component is genuinely needed:
- It must be styled using existing CSS variables from globals.css
- It must use existing Tailwind token classes, not arbitrary values
- It must follow the conventions in staging/ (shadows, borders,
  hover states, animation presets)
- Primitives from src/components/ui/ should be the building blocks,
  not replaced

**Examples of correct thinking:**
- Need a button with a dropdown arrow? Use the existing Button
  component and add a ChevronDown icon from lucide-react
- Need a new card variant? Use the existing card shadow and border
  tokens, not new arbitrary shadow values
- Need a new input style? Extend the existing Input primitive

**Never:**
- Write inline arbitrary Tailwind values for colours that exist
  as CSS variables
- Create a new button component when the existing one can be composed
- Import a new icon library when lucide-react is already installed

Rationale: prototype phase — bones in fast, lean surface area; and
shared primitives across 6+ games are what make the site cohesive.
A new one-off component is a future audit finding.

## Design system

### Where tokens live
- **CSS variables:** `src/app/globals.css` — `:root` and `.dark` blocks
- **Tailwind config:** `tailwind.config.js` — extends colors,
  animations, fonts
- **Game tokens:** prefixed `--game-*` (game-ink, game-cream,
  game-blue, game-green, game-amber, game-red; darker variants exist —
  check globals.css)
- **Brand tokens:** `--linen`, `--brand-dark`, `--burnt-orange`,
  `--accent-green`, `--teal`

## Typography — single typeface system

Montserrat is the ONLY typeface on the site. Hierarchy comes from
weight and size, never from typeface changes.
- font-heading: Montserrat 700–800
- font-body: Montserrat 400–500
- UI/labels: Montserrat 500–600, tracked slightly wide at small sizes
- Score/numeric displays: add `font-variant-numeric: tabular-nums`
- Lora, DM Mono, and "Garnett" are REMOVED. If you see a reference to
  any of them, it is stale — flag it, do not use it.
- `public/fonts/Striker PersonalUseOnly.woff` is pending a licensing
  decision — do not use it in new work (see Open decisions).
- All colour values come from CSS variables in globals.css. Never
  inline a hex value. (`--game-purple` now exists and GAME_THEME uses
  it; remaining inline #5B4FCF in shelf-price's RulesModal copy/hint
  buttons sweeps with the font-consolidation pass.)

### Key conventions
- Card shadow: `shadow-[0_3px_0_hsl(var(--game-cream-dark)),0_6px_20px_rgba(0,0,0,0.06)]`
- Card border: `border-[1.5px] border-[hsl(var(--game-ink))]/10`
- Hover lift: `-translate-y-[2px]` with `cubic-bezier(0.34, 1.5, 0.64, 1)`
- Button 3D: `box-shadow: 0 5px 0 [darker-shade]` with active press
- Bevel button class: `.bvl-purple` (purple with 3D shadow, defined
  in globals.css)
- Game containers use `game-container` class which forces light mode
  tokens in dark mode
- Section labels: `font-heading text-[11px] font-[900] uppercase
  tracking-[0.2em]`

## Animation system — philosophy and rules

The Idle Hours animation approach was developed building the /play
page intro. These principles apply globally — from a small component
entering the viewport to a full page load sequence.

### The core mental model

**Work backwards from the finished state.**
Start with the page fully visible and correct. Then hide everything.
The animation sequence is a controlled unhide — building the page is
running the hide sequence in reverse. Never think about what appears;
think about what was already there waiting to be revealed.

### Container before children — always

When animating a group of elements, wrap them in a container and
animate the container first. Children stagger in after.

- Animate the container: fade in, slide up, scale
- Then stagger children in one by one with small offsets (50–80ms)
- This applies at every scale — a card group, a nav, a game board,
  a full page section

Never animate a group of siblings independently without a parent
container move first. It reads as chaos. Container first, children
follow.

### Radial entrance ordering (page-level sequences)

(Glossary term: "shockwave" — same thing.)
For full page entrances, animate outward from the most important
element in distance-ordered groups:

- Group 0: The focal element and its internal content
- Group 1: Immediate surrounding elements
- Group 2: Adjacent sections
- Group 3+: Everything else radiating outward

Elements further from the focal element enter later. The page builds
from the centre of gravity out.

### Stagger values

- Siblings within a card: 65ms apart (type → title → desc → footer)
- Cards within a row: 45–50ms apart
- Sections within a page: 130–150ms apart
- Radial groups: 130–170ms apart

### Technical rules

1. **inline style="opacity:0" in the HTML is the only guarantee.**
   CSS classes and stylesheets can race with rendering on first
   paint and lose. Anything that must be invisible on frame 0
   must be set as an inline style before the DOM is painted.

2. **One show() function for all reveals.**
   Sets style.transition and style.opacity = '1' directly via JS.
   No class toggling, no CSS specificity fights. Everything goes
   through the same path.

3. **Scale the container, not individual children.**
   When scaling a group (e.g. three cards), wrap in a single
   container and scale it. Gaps scale with it. Overlap is
   impossible. One transform operation not three.

4. **getBoundingClientRect() not guesswork.**
   Measure actual DOM positions. Derive offsets and translations
   from real measurements. Never hardcode positions.

5. **GSAP for physics-like multi-segment sequences.**
   Animations with multiple physical segments each needing
   different easing (squash → explode → hold → crash) belong
   in a GSAP timeline. One .to() per physical segment with
   correct easing per segment. CSS @keyframes can only
   approximate this with one outer curve.
   NOTE: GSAP is installed but not yet implemented — reserved
   for the final animation layer post-build.

6. **Plain async/await for reveal chains.**
   Sequential opacity reveals don't need a framework.
   wait() + show() is readable, debuggable, sufficient.

7. **Never use transforms on elements that contain CSS grids.**
   scale() on a grid/flex container breaks child layout.
   Use opacity only for those elements.

### Easing reference

- Spring/pop entrance: `cubic-bezier(0.34, 1.5, 0.64, 1)`
- Smooth entrance: `cubic-bezier(0.4, 0, 0.2, 1)`
- Carve/wipe: `cubic-bezier(0.77, 0, 0.18, 1)`
- Hard stop (impact): `ease-in`

### Existing animation utilities

- `entrance(preset, active, delayMs?)` — inline CSSProperties
- `useEntranceSteps(stepCount, gaps, active)` — cascading stagger
- Presets: pop, fade, move, wipe, word-pop, slide-up, rise,
  wipe-right, wipe-down
- Game CSS: `gs-box-in`, `gs-word-pop`, `gs-fade-in` (globals.css)

Use these before writing new animation code.

## Architecture rules

### For common tasks
- **Adding a new page:** Create `src/app/[route]/page.tsx`. Server
  components by default, add `'use client'` if needed.
- **Modifying a game:** Each game is self-contained under
  `src/app/play/[game]/`. Read its `page.tsx`, `lib/`, and `data/`
  files.
- **Changing game scoring/ranks:** Update `src/lib/ranks.ts` AND
  `src/components/games/GameEndModal.copy.ts`.
- **Anything reading daily-game completion/archive state:** go through
  the manifest registry (`src/lib/game-shell/registry.ts`) or
  `getDailyCompletion` — never read game localStorage keys directly.
  No file outside `src/app/play/<game>/` may import from a game folder
  (grep-enforced invariant since the game-shell work).
- **Modifying the games database:** Edit `src/data/games-db.ts`. Each
  game has: id, title, year, genres, platforms, igdbImageId, vibe,
  launchPriceUsd, popularityRank.
- **Adding Sanity content types:** Add schema in `studio/schemaTypes/`,
  register in `index.ts`, add GROQ query in `src/lib/queries.ts`.
- **Date logic:** Always import from `@/lib/dateUtils`
  (Europe/London). Never compute "today" from machine-local time —
  this caused the TodayCard timezone bug.

### What NOT to read for common tasks
- `scripts/` — one-off data migration scripts, not part of the app
- `docs/plans/` — historical design documents, many are outdated
- `docs/plans/archive/` — archived planning docs, never read unless
  explicitly asked
- `studio/` — Sanity Studio, only relevant when changing CMS schemas
- `src/app/staging/` — design playground, not production code (but
  its component patterns ARE canonical — see Component rules)

### Next.js patterns (15+)
- Dynamic params are Promises: `params: Promise<{ slug: string }>` →
  `const { slug } = await params`
- Use `export const dynamic = 'force-dynamic'` on pages that use
  localStorage (prevents SSR prerender)
- Client components: `'use client'` as first line
- Server components: async, fetch data directly, no hooks

## Environment variables

Located in `.env.local`. Names only — never commit values.

```
# Browser-exposed (NEXT_PUBLIC_)
NEXT_PUBLIC_SANITY_PROJECT_ID=ijj3h2lj
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Server-only
SANITY_TOKEN=...           # read token, used by src/lib/sanity.ts
SANITY_WRITE_TOKEN=...     # currently unreferenced in src/
TWITCH_CLIENT_ID=...       # /api/igdb proxy
TWITCH_CLIENT_SECRET=...   # /api/igdb proxy
```

Removed June 2026 (Pip gut + cleanup): NEXT_PUBLIC_ANTHROPIC_API_KEY,
ANTHROPIC_API_KEY, GA4_PROPERTY_ID. Unreferenced and pending removal
decision: PLAUSIBLE_API_KEY, NEXT_PUBLIC_GA_MEASUREMENT_ID,
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY. Do not add NEXT_PUBLIC_
prefixed secrets of any kind — anything NEXT_PUBLIC_ ships in the
public bundle.

## GLOSSARY — canonical names

One name per concept. Use these exact terms.

- **Daily games** — Game Sense, Street Date, Shelf Price
  (deterministic-by-date, one puzzle per day)
- **Session games** — Blitz, Jigsaw, Ship It (playable any time)
- **Rank ladder** — the 5-step result tiers per daily game, defined
  ONLY in `src/lib/ranks.ts`
- **Flavour text** — per-rank copy in `GameEndModal.copy.ts`
- **Post-game screen** — the inline results view shown after a daily
  game ends (there is no modal)
- **Game shell** — the shared structural layer for the daily games:
  `src/lib/game-shell/` (logic) + `src/components/games/shell/` (UI).
  See the Game shell section.
- **Manifest** — a game's `DailyGameManifest` entry in
  `src/lib/game-shell/registry.ts`; the only integration surface
  between shared code and a game
- **Day state** — the one localStorage JSON blob per game per date
  (shapes defined in the registry)
- **Day result** — the normalised `DayResult` a manifest's
  `toDayResult()` produces (played/completed/finished/won/score/rank)
- **Shockwave / radial entrance ordering** — the page-entrance
  pattern: focal element first, then groups in increasing distance
- **The Idle Hours Test** — coverage criteria in NORTH-STAR.md
- **Staging** — `/staging`, the canonical design-system showcase

## RENAME LEDGER — old name → current name

Never use the left column. If you encounter it in code or docs,
flag it as stale.

- Skill Issue (the game) → Game Sense (renamed; redirect pages remain
  at /play/skill-issue pending removal decision)
- Street Date v1 ("guess the year") → Street Date v2 (sorting puzzle);
  localStorage `street_date_` → `street_date_v3_`
- Game Sense ranks "Keep Guessing / Getting Warmer / Well Played /
  Encyclopaedic" → "Skill Issue / Button Masher / Big Brain / One Shot"
- Street Date ranks "New to the Medium / Occasional Player / Retro
  Head / Time Archivist" → "Newbie / Has a Backlog / Day One /
  The Curator"
- Shelf Price ranks "Just Another Consumer / Junior Dev / Senior
  Producer / Industry Insider" → "Moms Credit Card / Bargain Hunter /
  Secret Shopper / Head of Sales"
- DM Mono / Lora / "Garnett" → Montserrat (single-typeface system,
  June 2026)
- GameEndModal (shared post-game modal) → removed; replaced by inline
  post-game screens. Copy file GameEndModal.copy.ts is LIVE.
- Pip (internal ops dashboard at /pip) → REMOVED June 2026, tag
  `pip-v1-final`; rebuild planned post-auth with real session gating.
  Do not recreate Pip routes, imports, or env vars.
- Hostinger FTP deploy (deploy.js) → Vercel auto-deploy from `main`
- GAME_COLORS → GAME_THEME (June 2026, game shell: extended with
  accentDark, worldGradient, statusBarHex)
- GameSlug (when meaning the three daily games) → DailyGameSlug;
  GameSlug now means all six games
- Per-game dateUtils wrapper modules → `makeGameDates(launchDate)`
  from `src/lib/game-shell/gameDates` (the per-game files remain as
  thin bindings)
- /play/game-sense/archive as a link target → /play/archive?game=
  game-sense (the redirect page remains; nav pills link directly)
- ClickSpark (global click-particle effect) → REMOVED June 2026: its
  document-level click interception broke single clicks site-wide
  (buttons needed double clicks). Do not reintroduce a global click
  wrapper; any future spark effect must be opt-in per element.
- GuessInput (game-sense typeahead, as an identity component) →
  GameSearchInput in games/shell/ (June 2026, promoted when Stock Room
  became its second consumer). game-sense/components/GuessInput.tsx
  remains as a thin binding — game pages keep importing it.

## Known issues (do not "discover" these — they are known)

- `ParallaxHero.tsx` and footer link to `/posts` (404) — should be
  `/blog`
- `/disclosure` is linked from DisclosureBanner and SiteFooter but
  the route does not exist
- `/api/igdb` has open CORS and no rate limiting — must be fixed
  before launch
- Supabase tables (`jobs`, `jigsaw_rooms`, `jigsaw_pieces`,
  `blitz_scores`) have no effective RLS — posture to be defined
  alongside the badges table (see audit/foundations.md)

## Open decisions (do not resolve these unilaterally)

- Modular-homepage system (homePage schema, section components,
  types): abandoned or paused? Sanity dataset check needed before
  schema removal.
- `promoBanner` and `musicTrack` schemas: dataset check, then delete.
- `/play/skill-issue` redirect pages: keep or remove (pre-launch,
  zero external traffic).
- Striker font: license properly or delete before launch.
- PLAUSIBLE_API_KEY / GA_MEASUREMENT_ID: pick the analytics stack,
  remove the other.

## Historical context

This section documents major changes so future sessions understand
why things are structured the way they are.

### Feb 2026 — Initial build
- Migrated from Vite/React SPA to Next.js App Router
- Set up Sanity CMS, built blog, game library, homepage
- Built Game Sense as the first daily puzzle game

### Feb–Mar 2026 — Game expansion
- Added Street Date (v1: guess the year from cover art) and Shelf
  Price (higher/lower pricing)
- Built shared post-game system (GameEndModal — since removed),
  ResultCard, DailyBadgeShelf
- Created Blitz (rapid-fire), Jigsaw (multiplayer), Ship It
  (negotiation)
- Built games-db.ts with ~3,975 games enriched from IGDB
- Created /staging design system with 11 pages of design tokens and
  components

### Mar 2026 — Game library and play hub redesign
- Replaced individual game pages with lightbox overlay system
- Redesigned /play hub with editorial sections and daily badges
- Added game library browse view with Sanity-backed curated rows

### Mar 2026 — Post-game consistency pass
- Unified all 3 daily games to use the same two-column post-game
  layout
- All games now score 0–1000pts with matching rank thresholds
- Added "Today's badges" shelf with badge linking across all games

### Mar–Apr 2026 — Shelf Price card overhaul
- Fixed card sizing issues (was driven by artwork, now fixed
  dimensions)
- Removed "This one cost more" CTA button, full card is clickable
- Added responsive scaling for mobile (always 2-column, never stacks)

### Apr 2026 — Street Date v2 (sorting puzzle)
- Completely rebuilt Street Date from "guess the year" to "sort 7
  games chronologically"
- New puzzle generation algorithm with popularity tiers and year
  clustering
- Hint system with game+slot pair tracking (reveals persist across
  moves)
- Launch date set to 2026-02-22, localStorage key changed to
  `street_date_v3_`
- Old v1 code removed entirely

### Apr 2026 — Internal tools
- Built /jobs Kanban board backed by Supabase with hierarchical tags
- Ran vibe sentence audit — fixed 82 games where vibe leaked title
  words

### May 2026 — Post-game modal removal
- Commit 584970e: daily games skip GameEndModal, go straight to the
  inline post-game screen. Share UI went dormant with it (planned to
  return via the game shell).

### June 2026 — Audit and cleanup
- Full codebase audit (reports in audit/)
- Pip removed entirely (tag `pip-v1-final`); rebuild planned
  post-auth. Anthropic key + GCP service account rotated.
- Root pip/ legacy app, deploy.js (Hostinger era), Vite remnants
  deleted; ~4,000+ lines of dead code removed
- Font system consolidated to Montserrat only
- SplitShareButton + Confetti extracted from GameEndModal before its
  deletion
- This CLAUDE.md rewritten from the drift report; GLOSSARY and
  RENAME LEDGER added

### June 2026 — Game shell extraction
- Snapshot tests pin puzzle generation per date (tests/
  puzzle-snapshots.test.ts — the refactor contract; vitest added)
- The triplicated structural layer of the three daily games extracted
  into src/lib/game-shell/ + src/components/games/shell/ (phases 1–6,
  one commit each; puzzle output byte-identical throughout)
- Per-game manifest registry created; archiveAdapter, DailyBadgeShelf,
  TodayCard, /play, and PlayOurGames rewired through it — no shared
  code imports from game folders any more
- Share UI returned to all three daily games (SplitShareButton in the
  post-game nav row); Street Date gained its missing rules modal
  (copy pending editorial review) and playable-date guard; Shelf Price
  gained the missing mobile status-bar treatment
- Fixed: TodayCard v1-key bug + machine-local timezone bug
- GAME_COLORS → GAME_THEME; --game-purple token added

## Do not change without explicit instruction

1. **Games database structure** (`src/data/games-db.ts`) — the
   GameEntry interface is consumed by all 6 games. Adding/removing
   fields affects everything.
2. **localStorage key patterns** — changing keys invalidates all
   player progress. Current keys are documented above.
3. **Rank thresholds and names** — displayed to players. Source of
   truth is `src/lib/ranks.ts` + flavour in `GameEndModal.copy.ts`.
4. **Sanity schema types** — breaking changes require studio
   redeployment and content migration.
5. **Puzzle generation algorithms** — deterministic by date. Changing
   the algorithm changes every puzzle retroactively.
6. **The manifest registry** (`src/lib/game-shell/registry.ts`) — key
   prefixes and day-state shapes are the localStorage contract; all
   shared completion/archive reads flow through it.
7. **The `game-container` CSS class** — forces light mode tokens
   inside game areas. Removing it breaks all game styling.
8. **Environment variable names** — referenced across multiple files
   and Vercel config.

## Performance rules for this session

- Styling-only tasks: read only the component file and
  tailwind.config.js. Do not open logic files, hooks, or utilities.
- Game-specific tasks: each game is self-contained. Do not scan other
  game folders for context unless explicitly asked.
- Do not open package.json unless the task involves dependencies.
- Do not read docs/plans/ unless asked to understand historical
  context.
- Renames: any rename of a component, concept, key, or route MUST add
  a RENAME LEDGER row in the same commit.
- New components: MUST add a component manifest row in the same commit.