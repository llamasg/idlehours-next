# PROPOSED REPLACEMENT FOR CLAUDE.md — not applied. Review before adopting.
# Everything below this line is the proposed file content.

---

# CLAUDE.md — Idle Hours

## What this is

Idle Hours (idlehours.co.uk) is a game discovery site with three parts: editorial writing (blog), six interactive games, and a curated game library with affiliate-linked recommendations. Pre-launch, zero public traffic, in active development.

## Product principles

`NORTH-STAR.md` in the repo root is the product-principles document. Read it before: adding or changing any user-facing feature, deciding whether something should be built, writing site copy, or choosing what games/content to surface. Do not read it for styling changes, bug fixes, or internal tooling.

The mission in one sentence: editorial writing earns reader trust, the daily games create a daily visit habit, and affiliate links convert both into revenue.

## Tech stack (verified 2026-06-09)

- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5.9
- **Styling:** Tailwind CSS **3** (3.4.x — not 4) with custom CSS variables; Framer Motion; GSAP is installed but has zero imports (reserved for a future animation pass — remove if that plan is dropped)
- **CMS:** Sanity 5 (project `ijj3h2lj`, dataset `production`); Studio is the separate app in `studio/` with its own package.json, deployed via `npx sanity deploy`
- **Database:** Supabase (`@supabase/supabase-js` only; no `@supabase/ssr`, no server client, no middleware — relevant when adding auth)
- **Hosting:** Vercel, auto-deploys from `main`
- **Fonts:** Montserrat = `font-heading`; Lora = `font-body`; DM Mono = `font-mono`; Striker (`public/fonts/`) is the only custom font file. There is no Garnett font and no `font-serif`/`font-garnett` utility.

## Directory map

```
src/
  app/
    page.tsx                  — homepage (renders src/components/HomepageClient.tsx)
    about/, contact/          — static-ish pages
    blog/, blog/[slug]/       — blog listing + posts (route is /blog; some components still link to the nonexistent /posts — bug)
    games/, games/[slug]/     — game library; detail opens via GameLightboxContext
    quizzes/                  — quiz listing
    jobs/                     — internal Kanban board (Supabase `jobs` table, no auth gate)
    play/                     — games hub + the six games:
      game-sense/             — daily: guess the game from a fill-in-the-blank sentence
      street-date/            — daily: sort 7 games into release order
      shelf-price/            — daily: 10 rounds of which-game-cost-more
      blitz/                  — session: timed rapid-fire title guessing
      jigsaw/                 — session: multiplayer jigsaw (Supabase realtime)
      ship-it/                — session: publishing-deal negotiation
      skill-issue/            — redirect-only remnant of game-sense's old name
      archive/                — shared archive viewer for the three daily games
    staging/                  — design-system playground, 11 pages, intentionally unlinked
    api/
      featured-content/route.ts — GET, latest posts from Sanity (used by DiscoverMore)
      igdb/route.ts             — POST proxy to IGDB using Twitch credentials (open CORS — needs tightening)
  components/                 — shared components (games/, homepage/, jobs/, play/, ui/)
  lib/                        — sanity.ts, supabase.ts, queries.ts, ranks.ts, animations.ts,
                                gameConstants.ts, dateUtils.ts, imageUtils.ts, jobs.ts, utils.ts,
                                dayFlavour.ts, jigsawShapes.ts, jigsawUtils.ts
  data/games-db.ts            — 3,975 games (GameEntry interface)
  data/blitz-topics.ts        — Blitz topic categories
  context/GameLightboxContext — lightbox overlay for game detail views
  types/index.ts              — CMS types
studio/                       — Sanity Studio (separate app)
scripts/                      — 13 one-off data scripts; not part of the app
docs/plans/                   — historical design docs; do not treat as current
public/fonts/, public/images/ — assets (badges/, game banner/, icons/, jigsaw/, ship_it_characters/)
```

## Daily games — mechanics

All three daily games: 1000 points base, deterministic puzzle per date (Europe/London day boundary), state in one localStorage JSON blob per game per day.

| Game | localStorage key | Mechanic | Rank ladder (exact, from src/lib/ranks.ts) |
|---|---|---|---|
| Game Sense | `game_sense_YYYY-MM-DD` | Guess the title from a sentence with blanks; hints cost points; proximity scoring | Bust → Skill Issue → Button Masher → Big Brain → One Shot |
| Street Date | `street_date_v3_YYYY-MM-DD` | Sort 7 games oldest→newest; 5 guesses; −150/guess after first; hints −100/−300 | Bust → Newbie → Has a Backlog → Day One → The Curator |
| Shelf Price | `shelf_price_v2_YYYY-MM-DD` | 10 rounds higher/lower on launch price; −100 per wrong answer | Bust → Moms Credit Card → Bargain Hunter → Secret Shopper → Head of Sales |

Rank thresholds and names live in `src/lib/ranks.ts` and `src/components/games/GameEndModal.copy.ts` — change both together or neither. These names are displayed to players; do not change without explicit instruction.

## Post-game system (current, after the GameEndModal removal)

There is no end-of-game modal. On completion the page transitions in place to a two-column post-game layout:

- Left column: `src/components/games/PostGameLeftColumn.tsx` → `ResultCard.tsx` (rank, badge, score) + `DailyBadgeShelf.tsx` (today's three badges)
- Right column: a per-game analysis card built inside each game's `[date]/page.tsx`
- Sequencing: `useEntranceSteps(7, POSTGAME_GAPS, ...)` from `src/lib/animations.ts` / `src/lib/gameConstants.ts`
- `GameEndModal.tsx` is orphaned dead code (zero importers); `GameEndModal.copy.ts` is alive (rank copy + flavour text). The share button (`SplitShareButton`) only exists inside the dead file — **no game currently has share UI**.

## Design system

Check before writing any UI code: `src/components/ui/` (primitives), `src/components/` (shared), `src/app/staging/` (documented tokens/components/patterns). Compose existing components; do not create a new component if an existing one can be extended. New components must use the CSS variables in `src/app/globals.css` and existing Tailwind token classes, not arbitrary values.

- **Tokens:** `src/app/globals.css` `:root` and `.dark`. Game tokens are prefixed `--game-*` (ink, cream, white, blue, green, amber, red, plus -dark/-mid/-light variants). Brand tokens: `--linen`, `--brand-dark`, `--burnt-orange`, `--accent-green`, `--teal`. Known gap: Shelf Price's purple `#5B4FCF` is hardcoded in several files and has no CSS variable.
- **Card shadow:** `shadow-[0_3px_0_hsl(var(--game-cream-dark)),0_6px_20px_rgba(0,0,0,0.06)]`
- **Card border:** `border-[1.5px] border-[hsl(var(--game-ink))]/10`
- **Hover lift:** `-translate-y-[2px]` with `cubic-bezier(0.34, 1.5, 0.64, 1)`
- **3D button:** `box-shadow: 0 5px 0 [darker-shade]`; `.bvl-purple` class in globals.css
- **`game-container` class:** forces light-mode tokens inside game areas even in dark mode. Removing it breaks all game styling.
- **Section labels:** `font-heading text-[11px] font-[900] uppercase tracking-[0.2em]`

## Animation rules

Mental model: build the page fully visible and correct, set the parts that must be hidden on first paint to `opacity: 0` via inline style (inline style is the only way to guarantee invisibility on frame 0 — classes can race first paint), then reveal in a controlled order.

1. **Container before children.** Animate the wrapping container first, then stagger children in (50–80ms offsets). Never animate a group of siblings without a parent container move first.
2. **Page-level entrance ordering:** reveal the focal element first, then surrounding elements in groups by increasing distance from it, 130–170ms between groups.
3. **Stagger values:** elements within a card 65ms; cards within a row 45–50ms; page sections 130–150ms.
4. One `show()` path for all reveals (set `style.transition` + `style.opacity` directly via JS); plain async/await for reveal chains.
5. Scale the wrapping container, not individual children. Never put transforms on elements containing CSS grids — opacity only for those.
6. Measure positions with `getBoundingClientRect()`; never hardcode.
7. Multi-segment physical animations (distinct easing per segment) are what GSAP is reserved for; it is not yet used anywhere.
8. Easings: spring/pop `cubic-bezier(0.34,1.5,0.64,1)`; smooth `cubic-bezier(0.4,0,0.2,1)`; carve/wipe `cubic-bezier(0.77,0,0.18,1)`; impact `ease-in`.
9. Existing utilities — use before writing new animation code: `entrance(preset, active, delayMs?)` and `useEntranceSteps(stepCount, gaps, active)` in `src/lib/animations.ts`; presets pop, fade, move, wipe, word-pop, slide-up, rise, wipe-right, wipe-down; keyframes `gs-box-in`, `gs-word-pop`, `gs-fade-in` in globals.css; timing constants in `src/lib/gameConstants.ts`.

## Architecture rules

- **New page:** `src/app/[route]/page.tsx`. Server component by default; `'use client'` first line if needed. Dynamic params are Promises: `const { slug } = await params`. Pages using localStorage need `export const dynamic = 'force-dynamic'`.
- **Modify a game:** each game is self-contained under `src/app/play/[game]/`. Do not scan other game folders unless asked.
- **Game scoring/ranks:** update `src/lib/ranks.ts` AND `src/components/games/GameEndModal.copy.ts` together.
- **Games database:** `src/data/games-db.ts`; fields: id, title, year, genres, platforms, igdbImageId, vibe, launchPriceUsd, popularityRank.
- **Sanity content type:** schema in `studio/schemaTypes/`, register in `studio/schemaTypes/index.ts`, GROQ query in `src/lib/queries.ts`.

## Environment variables (.env.local)

Browser-exposed: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (unused in code), `NEXT_PUBLIC_GA_MEASUREMENT_ID` (unused in code).

Server-only: `SANITY_TOKEN` (used in `src/lib/sanity.ts`), `SANITY_WRITE_TOKEN` (scripts/ only), `ANTHROPIC_API_KEY` (scripts/ only), `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` (used by /api/igdb).

Dead since the Pip removal (delete from .env.local and Vercel): `NEXT_PUBLIC_ANTHROPIC_API_KEY`, `GA4_PROPERTY_ID`, `PLAUSIBLE_API_KEY`.

## Known problems (do not "fix" silently; tracked in audit/)

1. `src/components/play/TodayCard.tsx:35` reads the dead `street_date_` v1 key — Street Date completion never shows on /play.
2. Links to `/posts` (`ParallaxHero.tsx`) and `/disclosure` (`DisclosureBanner.tsx`, `SiteFooter.tsx`) point at routes that don't exist.
3. `/api/igdb` is an open CORS proxy with no validation or rate limit.
4. The `jobs` table accepts anonymous insert/update/delete from any browser.
5. `studio/.env` + `studio/.env.local` hold a live Anthropic key that `studio/sanity.cli.ts` inlines into the deployed Studio bundle (`VITE_ANTHROPIC_API_KEY`, used by the gameGenerator). Rotate and move server-side.

## Do not change without explicit instruction

1. `GameEntry` interface in `src/data/games-db.ts` (consumed by all six games)
2. localStorage key patterns (`game_sense_`, `street_date_v3_`, `shelf_price_v2_`) — changes wipe player progress
3. Rank threshold values and rank names (player-visible, in share/badge artwork)
4. Sanity schema types (breaking changes need studio redeploy + content migration)
5. Puzzle generation algorithms — deterministic by date; any change rewrites every historical puzzle. Street Date uses an LCG, Game Sense and Shelf Price use mulberry32; outputs must remain bit-identical if refactored
6. The localStorage read paths in `DailyBadgeShelf.tsx`, `TodayCard.tsx`, `archive/lib/archiveAdapter.ts` — must match the write-side keys
7. The `game-container` CSS class
8. Environment variable names
9. `GameEndModal.copy.ts` (the copy file — alive). `GameEndModal.tsx` (the component — dead) is NOT protected; see audit/kill-list.md

## GLOSSARY — canonical names, one per concept, use everywhere

| Canonical name | Means exactly | Do not call it |
|---|---|---|
| **daily games** | Game Sense, Street Date, Shelf Price — one deterministic puzzle per date | "dailies", "puzzle games" |
| **session games** | Blitz, Jigsaw, Ship It — playable any time, no date binding | "the arcade", "arcade games" |
| **games database** | `src/data/games-db.ts`, the 3,975-entry `GameEntry[]` | "the catalog", "the library" (that's the /games page) |
| **game library** | the `/games` browse page backed by Sanity + games database | |
| **post-game screen** | the in-page two-column layout after finishing a daily game (`PostGameLeftColumn` + per-game analysis card) | "end modal", "GameEndModal" (dead component) |
| **rank ladder** | the 5 named tiers per daily game in `src/lib/ranks.ts` | "medals" (Blitz-only concept) |
| **badge** | the per-rank artwork shown in `ResultCard`/`DailyBadgeShelf` (`public/images/badges/`) | |
| **day state** | the one localStorage JSON blob per game per date | "save", "progress" |
| **puzzle date** | the YYYY-MM-DD string keying a daily puzzle, Europe/London boundary | |
| **archive viewer** | `src/app/play/archive/` — shared past-puzzle browser for the daily games | |
| **play hub** | the `/play` page | "games dashboard" |
| **staging** | `src/app/staging/` design playground, not production | |
| **entrance** | the reveal animation system (`src/lib/animations.ts`) | "shockwave", "epicentre", "rings" |
| **radial entrance ordering** | revealing the focal element first, then groups by increasing distance | "the shockwave principle" |
| **product principles** | `NORTH-STAR.md` | (filename stays; concept name is literal) |

## RENAME LEDGER — dead names; never resurrect

| Old name | Current name | Notes |
|---|---|---|
| Skill Issue (the game) | Game Sense | `/play/skill-issue/*` remains as redirect-only files; "Skill Issue" survives only as a Game Sense rank name |
| Street Date v1 (guess-the-year) | Street Date (sorting puzzle) | v1 code deleted Apr 2026; v1 key `street_date_` is dead (one buggy read remains in TodayCard.tsx) |
| `street_date_` / `shelf_price_` storage keys | `street_date_v3_` / `shelf_price_v2_` | |
| GameEndModal (as the post-game UI) | post-game screen | Modal skipped since commit 584970e; component file is dead code |
| Game Sense ranks "Keep Guessing / Getting Warmer / Well Played / Encyclopaedic" (docs only) | Skill Issue / Button Masher / Big Brain / One Shot | The doc names never shipped |
| Street Date ranks "New to the Medium / Occasional Player / Retro Head / Time Archivist" (docs only) | Newbie / Has a Backlog / Day One / The Curator | |
| Shelf Price ranks "Just Another Consumer / Junior Dev / Senior Producer / Industry Insider" (docs only) | Moms Credit Card / Bargain Hunter / Secret Shopper / Head of Sales | |
| `/posts` route | `/blog` | Two components still link to /posts — bug |
| Hostinger FTP deploy (`deploy.js`) | Vercel auto-deploy from `main` | Script deleted 2026-06 |
| `homePage` / `promoBanner` / `musicTrack` Sanity schemas | — removed 2026-06 | The modular CMS homepage is deferred until after core features; the homepage is hardcoded in `HomepageClient.tsx`. Orphaned documents remain in the dataset (2 homePage, 1 promoBanner, 2 musicTrack), recoverable. Do not resurrect the section types in `src/types/index.ts` from old code |
| **Pip (internal ops dashboard)** | — removed 2026-06, tag `pip-v1-final` | Covered `src/pip/`, `src/app/pip/`, the legacy root `pip/` Node backend, the `pip_dashboard` Sanity schema, and the pip-nightly GitHub Actions workflow. Rebuild planned post-auth with real session gating. The `pip-pulse` Tailwind keyframe survives — it belongs to shelf-price's ProgressBar, not Pip |
| Tailwind 4 (claimed) | Tailwind 3.4 (installed) | Never upgraded; doc claim only |
| Garnett Bold font (claimed) | not used; Striker is the only custom font | Never shipped |
| Vite/React SPA | Next.js App Router | Migration complete; remnants: `src/App.css`, `deploy.js`, `eslint-plugin-react-refresh` |

## Performance rules for sessions

- Styling-only tasks: read only the component file and tailwind.config.js.
- Game-specific tasks: stay inside that game's folder.
- Do not read `scripts/`, `docs/plans/`, `studio/`, or `src/app/staging/` unless the task requires them.
- Do not open package.json unless the task involves dependencies.
