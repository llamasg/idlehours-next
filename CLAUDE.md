# CLAUDE.md — Idle Hours

## What this is

Idle Hours is a game discovery engine with an editorial voice at idlehours.co.uk. It combines Beth's editorial writing with six interactive daily/session games, a curated game library, and affiliate-linked recommendations. The site is pre-launch with zero public traffic — everything is in active development.

## North Star & Product Principles

Before making any decision about features, architecture, or public-facing copy, read `NORTH-STAR.md` in the repo root.

Read it when:
- Adding or changing any user-facing feature
- Evaluating whether something should be built at all
- Writing or editing any copy that appears on the site
- Making decisions about what games or content to surface

Do not read it for:
- Styling-only changes
- Bug fixes
- Internal tooling

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4 with custom CSS variables, Framer Motion, GSAP
- **CMS:** Sanity v5 (project `ijj3h2lj`, dataset `production`)
- **Database:** Supabase (scores, jobs board, jigsaw sync)
- **AI:** Anthropic SDK (Claude) for Pip dashboard features
- **Hosting:** Vercel (auto-deploys from `main` branch)
- **Studio:** Sanity Studio deployed separately via `npx sanity deploy`
- **Fonts:** Montserrat (headings), DM Mono (body), Lora (serif/editorial), Garnett Bold (special)

## Directory map

```
src/
  app/                    — Next.js App Router pages
    page.tsx              — Homepage (modular sections from Sanity)
    about/                — About page
    blog/, blog/[slug]/   — Blog listing + individual posts
    contact/              — Contact form
    games/, games/[slug]/ — Game library + individual game pages
    jobs/                 — Internal Kanban job board (Supabase)
    play/                 — Games hub + all interactive games
      game-sense/         — Daily word puzzle (fill-in-the-blank)
      street-date/        — Daily chronological sorting puzzle (7 games)
      shelf-price/        — Daily price comparison game (higher/lower)
      blitz/              — Rapid-fire title guessing (timed)
      jigsaw/             — Multiplayer collaborative jigsaw (Supabase)
      ship-it/            — Publishing deal negotiation game
      skill-issue/        — Legacy redirect to game-sense
      archive/            — Shared archive viewer for all daily games
    pip/                  — Pip AI dashboard (password-protected)
    staging/              — Design system playground (11 pages)
    quizzes/              — Quiz listing page
  components/             — Shared React components
    games/                — GameEndModal, ResultCard, DailyBadgeShelf
    homepage/             — Homepage section components
    jobs/                 — Job board components
    play/                 — Play hub cards and sections
    ui/                   — Shadcn primitives (button, badge, input)
  pip/                    — Pip dashboard internals
    views/                — 10 view components (Home, Ideas, Writing, etc.)
    components/           — Pip-specific UI (StatCard, IdeaDeck, etc.)
    hooks/                — Data fetching + AI hooks
    lib/                  — pipClaude.ts (Anthropic), pipQueries.ts
    auth/                 — PipAuthGate + usePipAuth (password: idlehours2026)
  lib/                    — Shared utilities
    sanity.ts             — Sanity client config
    supabase.ts           — Supabase client (nullable)
    queries.ts            — All Sanity GROQ queries
    ranks.ts              — Rank ladders for all 3 daily games
    animations.ts         — 9 entrance animation presets + useEntranceSteps
    jobs.ts               — Supabase CRUD for /jobs board
  data/
    games-db.ts           — ~3,975 games (id, title, year, genres, platforms, igdbImageId, vibe, etc.)
    blitz-topics.ts       — Topic categories for Blitz game
  context/
    GameLightboxContext   — Lightbox overlay for game detail views
  types/
    index.ts              — CMS types (Game, Post, Product, Homepage sections)
studio/                   — Sanity Studio (separate app)
  schemaTypes/            — 15 schema types (game, post, product, quiz, etc.)
scripts/                  — One-off data scripts
  seed-jobs.ts            — Seed Supabase jobs table
  fix-leaky-vibes.mjs    — Re-generate vibe sentences with title leakage
  enrich-missing-games.ts — IGDB enrichment for games-db
docs/plans/               — Design docs and implementation plans (historical)
public/
  fonts/                  — Striker (custom font)
  images/                 — Site assets, icons, game covers
```

## Live features and pages

### Public pages
- **Homepage** (`/`) — modular CMS-driven sections: hero, latest posts, games carousel, newsletter
- **Blog** (`/blog`, `/blog/[slug]`) — editorial posts with categories, search, portable text
- **Game Library** (`/games`) — browsable/filterable game catalog with lightbox detail view
- **About** (`/about`) — team and mission
- **Contact** (`/contact`) — contact form
- **Play Hub** (`/play`) — games dashboard with today's badges and game cards

### Games (6 active)
- **Game Sense** (`/play/game-sense/[date]`) — daily fill-in-the-blank, guess the game from clues
- **Street Date** (`/play/street-date/[date]`) — daily sort 7 games chronologically, Wordle-style feedback
- **Shelf Price** (`/play/shelf-price/[date]`) — daily higher/lower price comparison, 10 rounds
- **Blitz** (`/play/blitz`) — rapid-fire title guessing by topic, timed with medals
- **Jigsaw** (`/play/jigsaw`) — collaborative multiplayer puzzle via Supabase realtime
- **Ship It** (`/play/ship-it`) — publishing deal negotiation game

### Internal tools
- **Pip** (`/pip/*`) — Internal ops tool. GA4 analytics visualisation, SEO cluster planning, grammar checks. Password-protected. Not a public-facing feature — do not reference in any user-facing copy or build features around it.
- **Jobs Board** (`/jobs`) — Kanban board for launch tasks (Supabase-backed)
- **Staging** (`/staging/*`) — design system playground (tokens, components, animations)

## Daily games — mechanics summary

### Game Sense
- Player sees a sentence with blanks: "A [genre] game about [vibe] released in [year]..."
- Guess the game title. Proximity scoring (closer = more points)
- 1000pts base, hints cost points, 5 blanks to reveal
- Ranks: Bust → Keep Guessing → Getting Warmer → Well Played → Encyclopaedic
- localStorage: `game_sense_YYYY-MM-DD`

### Street Date (v2 — sorting puzzle)
- 7 games shuffled randomly, arrange oldest→newest
- Submit to get "X/7 correct" count (no per-slot feedback without hints)
- Hints: reveal one slot (−100pts, shows green/amber/red), reveal all (−300pts, reusable)
- Hint reveals are tied to game+slot pairs — moving a game loses its reveal
- 1000pts base, −150pts per guess after first, 5 guesses max
- Ranks: Bust → New to the Medium → Occasional Player → Retro Head → Time Archivist
- localStorage: `street_date_v3_YYYY-MM-DD`

### Shelf Price
- 10 rounds of "which game cost more at launch?"
- Two game cards side by side, pick the more expensive one
- 1000pts base, −100pts per wrong answer
- Ranks: Bust → Just Another Consumer → Junior Dev → Senior Producer → Industry Insider
- localStorage: `shelf_price_v2_YYYY-MM-DD`

## Design system

### Where tokens live
- **CSS variables:** `src/app/globals.css` — `:root` and `.dark` blocks
- **Tailwind config:** `tailwind.config.js` — extends colors, animations, fonts
- **Game tokens:** prefixed `--game-*` (game-ink, game-cream, game-blue, game-green, game-amber, game-red)
- **Brand tokens:** `--linen`, `--brand-dark`, `--burnt-orange`, `--accent-green`, `--teal`

### Fonts
- `font-heading` = Montserrat (weights 400-900)
- `font-body` = DM Mono (weights 400-500)
- `font-serif` = Lora (weights 400-800)
- `font-garnett` = Garnett Bold (custom @font-face)

### Key conventions
- Card shadow: `shadow-[0_3px_0_hsl(var(--game-cream-dark)),0_6px_20px_rgba(0,0,0,0.06)]`
- Card border: `border-[1.5px] border-[hsl(var(--game-ink))]/10`
- Hover lift: `-translate-y-[2px]` with `cubic-bezier(0.34, 1.5, 0.64, 1)`
- Button 3D: `box-shadow: 0 5px 0 [darker-shade]` with active press
- Bevel button class: `.bvl-purple` (purple with 3D shadow, defined in globals.css)
- Game containers use `game-container` class which forces light mode tokens in dark mode
- Section labels: `font-heading text-[11px] font-[900] uppercase tracking-[0.2em]`

### Animation system
- `entrance(preset, active, delayMs?)` — returns inline CSSProperties
- `useEntranceSteps(stepCount, gaps, active)` — step sequencer for cascading animations
- Presets: pop, fade, move, wipe, word-pop, slide-up, rise, wipe-right, wipe-down
- Game-specific: `gs-box-in`, `gs-word-pop`, `gs-fade-in` (defined in globals.css)

### Pip dashboard theme
- Pip content area is LIGHT themed (cream bg, dark text) — only the sidebar is dark
- Use `text-stone-*` colours, `bg-white`, `border-stone-*` inside pip views
- Accent green: `#7C9B7A`

## Architecture rules

### For common tasks
- **Adding a new page:** Create `src/app/[route]/page.tsx`. Server components by default, add `'use client'` if needed.
- **Modifying a game:** Each game is self-contained under `src/app/play/[game]/`. Read its `page.tsx`, `lib/`, and `data/` files.
- **Adding a Pip view:** Create view in `src/pip/views/`, route in `src/app/pip/[name]/page.tsx`, nav item in `src/pip/PipLayout.tsx`.
- **Changing game scoring/ranks:** Update `src/lib/ranks.ts` AND `src/components/games/GameEndModal.copy.ts`.
- **Modifying the games database:** Edit `src/data/games-db.ts`. Each game has: id, title, year, genres, platforms, igdbImageId, vibe, launchPriceUsd, popularityRank.
- **Adding Sanity content types:** Add schema in `studio/schemaTypes/`, register in `index.ts`, add GROQ query in `src/lib/queries.ts`.

### What NOT to read for common tasks
- `scripts/` — one-off data migration scripts, not part of the app
- `docs/plans/` — historical design documents, many are outdated
- `docs/plans/archive/` — archived planning docs, never read unless explicitly asked
- `studio/` — Sanity Studio, only relevant when changing CMS schemas
- `src/app/staging/` — design playground, not production code
- `src/app/parallax/` — experimental, redirects to homepage

### Next.js 15+ patterns
- Dynamic params are Promises: `params: Promise<{ slug: string }>` → `const { slug } = await params`
- Use `export const dynamic = 'force-dynamic'` on pages that use localStorage (prevents SSR prerender)
- Client components: `'use client'` as first line
- Server components: async, fetch data directly, no hooks

## Environment variables

```
# Browser-exposed (NEXT_PUBLIC_)
NEXT_PUBLIC_SANITY_PROJECT_ID=ijj3h2lj
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SUPABASE_URL=https://fdoeaoodocaxcapsiiaa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_ANTHROPIC_API_KEY=...
NEXT_PUBLIC_GA_MEASUREMENT_ID=...

# Server-only
SANITY_TOKEN=...
SANITY_WRITE_TOKEN=...
PLAUSIBLE_API_KEY=...
ANTHROPIC_API_KEY=...
```

## Historical context

This section documents major changes so future sessions understand why things are structured the way they are.

### Feb 2026 — Initial build
- Migrated from Vite/React SPA to Next.js App Router
- Set up Sanity CMS, built blog, game library, homepage
- Created Pip dashboard for Beth with Claude AI integration
- Built Game Sense as the first daily puzzle game

### Feb–Mar 2026 — Game expansion
- Added Street Date (v1: guess the year from cover art) and Shelf Price (higher/lower pricing)
- Built shared post-game system: GameEndModal, ResultCard, DailyBadgeShelf
- Created Blitz (rapid-fire), Jigsaw (multiplayer), Ship It (negotiation)
- Built games-db.ts with ~3,975 games enriched from IGDB
- Created /staging design system with 11 pages of design tokens and components

### Mar 2026 — Game library and play hub redesign
- Replaced individual game pages with lightbox overlay system
- Redesigned /play hub with editorial sections and daily badges
- Added game library browse view with Sanity-backed curated rows

### Mar 2026 — Post-game consistency pass
- Unified all 3 daily games to use same two-column post-game layout
- Standardised share button (SplitShareButton with copy/Twitter/Discord/email)
- All games now score 0-1000pts with matching rank thresholds
- Added "Today's badges" shelf with badge linking across all games

### Mar–Apr 2026 — Shelf Price card overhaul
- Fixed card sizing issues (was driven by artwork, now fixed dimensions)
- Removed "This one cost more" CTA button, full card is clickable
- Added responsive scaling for mobile (always 2-column, never stacks)

### Apr 2026 — Street Date v2 (sorting puzzle)
- Completely rebuilt Street Date from "guess the year" to "sort 7 games chronologically"
- New puzzle generation algorithm with popularity tiers and year clustering
- Hint system with game+slot pair tracking (reveals persist across moves)
- Launch date set to 2026-02-22, localStorage key changed to `street_date_v3_`
- Old v1 code removed entirely

### Apr 2026 — Internal tools
- Built /jobs Kanban board backed by Supabase with hierarchical tags
- Built Beth's writing assistant at /pip/writing with Claude editorial feedback
- Ran vibe sentence audit — fixed 82 games where vibe leaked title words

## Do not change without explicit instruction

1. **Games database structure** (`src/data/games-db.ts`) — the GameEntry interface is consumed by all 6 games. Adding/removing fields affects everything.
2. **localStorage key patterns** — changing keys invalidates all player progress. Current keys are documented above.
3. **Rank thresholds and names** — displayed to players and used in share cards. Changes affect historical consistency.
4. **Sanity schema types** — breaking changes require studio redeployment and content migration.
5. **Puzzle generation algorithms** — deterministic by date. Changing the algorithm changes every puzzle retroactively.
6. **DailyBadgeShelf localStorage lookups** — must match the key patterns used by each game's state storage.
7. **The `game-container` CSS class** — forces light mode tokens inside game areas. Removing it breaks all game styling.
8. **Pip dashboard password** — hardcoded in `src/pip/auth/usePipAuth.ts`.
9. **Environment variable names** — referenced across multiple files and Vercel config.
10. **The shared GameEndModal component** — used by all 3 daily games with discriminated props. Changes must work for all games.

## Performance rules for this session

- Styling-only tasks: read only the component file and tailwind.config.js. Do not open logic files, hooks, or utilities.
- Game-specific tasks: each game is self-contained. Do not scan other game folders for context unless explicitly asked.
- Do not open package.json unless the task involves dependencies.
- Do not read docs/plans/ unless asked to understand historical context.
