# Inventory & Dependency Graph

Audit date: 2026-06-09. Tooling: `knip` (default config — no `knip.json` exists), `depcheck`, `madge --circular --extensions ts,tsx src`. Tool output was then manually verified with grep; false positives are corrected below rather than repeated.

## 1. Circular dependencies (madge)

Exactly **one** circular dependency in `src/` (234 files processed):

```
src/app/play/blitz/components/EndScreen.tsx  →  src/app/play/blitz/page.tsx  →  EndScreen.tsx
```

`EndScreen.tsx` imports a type/value back from the page that renders it. Low risk, trivial to break by moving the shared symbol into `src/app/play/blitz/lib/`.

## 2. Unused packages

| Package | Tool | Reality check | Verdict |
|---|---|---|---|
| `gsap` | knip + depcheck | Zero imports in `src/`. CLAUDE.md explicitly reserves it for a future animation layer | **Intentionally parked** — keep or remove deliberately, not silently |
| `sanity` (the studio framework, dep of root `package.json`) | knip + depcheck | The studio lives in `studio/` with its own `package.json`. Root copy duplicates it | **PROBABLE unused at root** — check `npm run build:studio` / `deploy:studio` scripts don't resolve it from root before removing |
| `eslint-plugin-react-refresh` | knip + depcheck | Vite-era ESLint plugin; meaningless under Next.js | Unused — Vite remnant |
| `autoprefixer`, `postcss` | depcheck only | **False positive** — required by Tailwind's PostCSS pipeline (`postcss.config` consumption is invisible to depcheck) | Keep |
| Missing dep: `basic-ftp` | depcheck | Imported by `deploy.js` (stale Hostinger deploy script) — the script can't even run without a manual install | Evidence `deploy.js` is dead |
| Missing dep: `dotenv` | depcheck | Imported by `scripts/seed-jobs.ts` | One-off script, expected |

## 3. knip unused-files list, triaged

knip ran with no config, so it treats `studio/` and `scripts/` as part of the main project. Triage:

**Real findings (dead in the app graph):**

| File | Lines | Note |
|---|---|---|
| `src/components/games/GameEndModal.tsx` | 391 | Orphaned by commit `584970e`. Contains the only `SplitShareButton` and `Confetti` implementations — both now unreachable |
| `src/components/GameOfMonth.tsx` | 115 | No importers |
| `src/components/QuizCta.tsx` | 48 | No importers |
| `src/components/Newsletter.tsx` | 65 | No importers (`NewsletterForm.tsx` is the live one, used by `BlogEngagement.tsx`) |
| `src/components/ProductTileCard.tsx` | 58 | No importers |
| `src/components/RowCarousel.tsx` | 97 | No importers |
| `src/hooks/useSiteSettings.ts` | 33 | No importers; it is the **only** caller of `getSiteSettings()` in `src/lib/queries.ts:407` — both die together |
| `src/app/play/game-sense/lib/useSanityGame.ts` | 55 | Own Sanity client, not imported by the game page |
| `src/app/play/jigsaw/components/DragCursors.tsx` | 47 | No importers (`RemoteCursors.tsx` is the live one) |
| `src/pip/components/GoalTracker.tsx` | 79 | No importers |
| `src/pip/components/StreakBar.tsx` | 35 | No importers |
| `src/pip/components/XpBar.tsx` | 42 | No importers |
| `src/pip/hooks/useStreak.ts` | 47 | No importers |
| `src/pip/lib/pipQueries.ts` | 13 | knip says unused; one audit pass claimed `PIP_DASHBOARD_QUERY` is consumed — verify with grep before deleting |
| `src/App.css` | 37 | **Vite starter stylesheet** — the clearest migration remnant in the repo |
| `deploy.js` | 165 | Hostinger FTP deploy script; depends on uninstalled `basic-ftp` |
| `pip/*.js` (root) | 848 total | Standalone legacy Node app (`generate.js` 201, `research.js` 271, `sanity.js` 174, `opencritic.js` 123, `index.js` 70, `utils.js` 9). Superseded by `src/pip/`. Directory also holds an **untracked** local `.env` and Google service-account JSON (`pip/idle-hours-pip-2dc9d35c4cea.json`) — confirmed not committed, but ensure they stay gitignored if the folder is kept |

**Expected/ignorable (outside the app entry graph by design):**

- `scripts/*` (13 files) — one-off data scripts, documented as not part of the app
- `studio/*` (config, schemas, gameGenerator components) — separate Sanity Studio app with its own entry; knip can't see it. Exception: `studio/schemaTypes/musicTrack.ts` (64 lines) is unused *even within the studio* — defined but never registered in `studio/schemaTypes/index.ts`
- `studio/vite.config.ts`, `studio/eslint.config.mjs` — Sanity Studio's own tooling (Sanity v5 uses Vite internally; **not** a remnant of the site's Vite era)

## 4. knip unused exports (kept files, dead symbols)

47 unused exports + 21 unused exported types. Notable clusters:

- `src/lib/ranks.ts:14-15` — re-exports `getGameSenseRank`, `getStreetDateRank`, `getShelfPriceRank`, `GAME_SENSE_FLAVOUR`, `STREET_DATE_FLAVOUR`, `SHELF_PRICE_FLAVOUR` from `GameEndModal.copy.ts`; nothing consumes the re-exports (consumers import the generic `getRankForGame`/`getFlavourForGame`)
- `src/pip/lib/pipMockData.ts` — 8 unused mock exports (`mockClusters`, `mockCalendarEvents`, `mockVideoIdeas`, `mockPinterestPins`, `mockInstagramCaptions`, `mockBoostPlan`, `mockBoostContext`, `XP_LEVELS`) in a 589-line file
- `src/lib/queries.ts` — `getPostsByCategory` (line 109), `getSiteSettings` (line 407) unused; `getPromoBanner` defined but never exported/called
- Per-game `dateUtils.ts` wrappers each export `EPOCH`, `getDaysSinceEpoch`, `getGameNumber` that nothing imports (the live symbols come from `@/lib/dateUtils`)
- `src/components/ParallaxHero.tsx:198-202` — 5 unused layout constants
- `src/types/index.ts` — 11 unused interfaces (`Product`, `Category`, `HeroSection`, `CarouselRowSection`, `QuizCtaSection`, `GameOfMonthSection`, `ProductFeatureSection`, `BlogFeatureSection`, `NewsletterSection`, `HomepageSection`, `HomePage`) — these describe the Sanity `homePage` modular-section system whose rendering components (`GameOfMonth`, `QuizCta`, `RowCarousel`, `ProductTileCard`) are also dead. The whole modular-homepage layer appears abandoned in favour of the hardcoded `HomepageClient.tsx`

## 5. Route map (every page.tsx / route.ts under src/app)

Inbound = linked from within the app (`href`, `router.push`, `redirect`). Site nav links come from Sanity `siteSettings`, so "zero inbound in code" can still mean "reachable via CMS-driven nav" — flagged where relevant.

| Route | File | Type | Status |
|---|---|---|---|
| `/` | `src/app/page.tsx` | server | LIVE — renders `HomepageClient` |
| `/about` | `src/app/about/page.tsx` | client | LIVE |
| `/contact` | `src/app/contact/page.tsx` | client | LIVE |
| `/blog` | `src/app/blog/page.tsx` | client | LIVE — **but `ParallaxHero.tsx` and footer link to `/posts`, which does not exist (404)** |
| `/blog/[slug]` | `src/app/blog/[slug]/page.tsx` | server | LIVE |
| `/games` | `src/app/games/page.tsx` | client | LIVE — zero hardcoded inbound links; reachable only via CMS nav or direct URL |
| `/games/[slug]` | `src/app/games/[slug]/page.tsx` | server | LIVE — opened via `GameLightboxContext`, not links |
| `/quizzes` | `src/app/quizzes/page.tsx` | server | zero inbound links in code; CMS nav or direct URL only |
| `/jobs` | `src/app/jobs/page.tsx` | server | LIVE internal tool — renders `JobBoard` (which uses `JobColumn`/`JobCard`/`JobModal`/`JobArchive`; an earlier pass wrongly called these orphaned). No inbound links by design |
| `/play` | `src/app/play/page.tsx` | client | LIVE hub |
| `/play/game-sense` (+`street-date`, `shelf-price`) | `page.tsx` each | client | redirect-only → today's `[date]` (3 near-identical forks) |
| `/play/{game}/[date]` ×3 | `[date]/page.tsx` | client | LIVE — the three daily games |
| `/play/{game}/archive` ×3 | `archive/page.tsx` | mixed | game-sense's redirects to `/play/archive?game=game-sense`; others similar |
| `/play/archive` | `src/app/play/archive/page.tsx` | client | LIVE shared archive viewer |
| `/play/blitz`, `/play/jigsaw`, `/play/jigsaw/[code]`, `/play/ship-it` | each `page.tsx` | client | LIVE — linked from /play hub sections |
| `/play/skill-issue`, `/play/skill-issue/archive` | 4-line redirect files | client | DEAD-ish — zero inbound links; kept only for any pre-rename external bookmarks. Site is pre-launch with zero traffic, so nothing external points here |
| `/pip` → `/pip/home` + 8 sibling views | `src/app/pip/*` | server shells | LIVE internal tool |
| `/staging` + 11 sub-pages | `src/app/staging/*` | client | LIVE design playground, intentionally unlinked |
| `/api/featured-content` | `route.ts` | GET | LIVE — consumed by `src/components/DiscoverMore.tsx:41` |
| `/api/igdb` | `route.ts` | POST | LIVE — open CORS proxy (see `audit/foundations.md` §4) |

**Routes referenced but missing (would 404):**
- `/disclosure` — linked from `DisclosureBanner.tsx` and `SiteFooter.tsx`
- `/posts` — linked from `ParallaxHero.tsx` (homepage hero); should be `/blog`

## 6. Sanity schema map

| Schema (studio/schemaTypes) | Consumed by |
|---|---|
| `post` | `getAllPosts`, `getPost`, `getPostsByCategory` (last one unused) in `src/lib/queries.ts`; `BrowseView.tsx` |
| `game` | `getAllGames`; `/games` page |
| `product` | `getAllProducts`, `getFeaturedProducts`, `getProductsByCategory` |
| `quiz` | `getAllQuizzes`, `getQuiz`; `/quizzes`, homepage |
| `siteSettings` | only via `getSiteSettings()` → only caller is dead `useSiteSettings.ts` → **effectively unconsumed in src/** (nav may rely on it via studio content but no live code path reads it) |
| `homepageConfig` | `getHomepageConfig`; `src/app/page.tsx` |
| `homePage` (+ section objects) | `getHomePage` exists in queries.ts — verify a live caller; its rendering components (`GameOfMonth`, `QuizCta`, etc.) are dead, suggesting the modular-section system is abandoned |
| `gameLibrary` (curatedRow, featureBanner) | `getGameLibrary`; `/games` browse view |
| `pipDashboard` | `PIP_DASHBOARD_QUERY` in `src/pip/lib/pipQueries.ts` — knip flags the file unused; verify |
| `author`, `category`, `blockContent` | indirect (referenced inside `post`) — never directly queried |
| `promoBanner` | `getPromoBanner()` in queries.ts is never called — **zero consumers** |
| `musicTrack` | **not even registered in `studio/schemaTypes/index.ts`** — zero consumers anywhere |

## 7. Things tooling can't see (manual findings)

- **`TodayCard.tsx:35` reads localStorage key `street_date_${dateStr}` — the dead v1 key.** The live key is `street_date_v3_` (`DailyBadgeShelf.tsx:64` reads it correctly). Consequence: Street Date completion never shows on the /play hero card. This is a live bug, not just bloat.
- `TodayCard.tsx:18` and `DailyBadgeShelf.tsx:45` compute "today" from machine-local timezone while the games use Europe/London (`@/lib/dateUtils.getTodayDateString`) — completion display can disagree with game state around midnight.
- Dead state threaded through live pages: `showWinModal`/`showLossModal`/`showCompleteToast` (game-sense page — never set true), `showResult` (shelf-price page), three `modalCopy` useMemos and two dead share-text builders — all residue of the GameEndModal removal. See `audit/game-architecture.md` table rows 5 and 17.
- The Vite-era remnant set: `src/App.css`, `deploy.js` (+ its missing `basic-ftp` dep), `eslint-plugin-react-refresh`, root `pip/` app. No `vite.config.*`, `index.html`, or react-router remain in the site itself.
- `tsconfig.tsbuildinfo` is tracked and shows as modified in git status — build artifact that should be gitignored.
- `scripts/.repair-checkpoint.json` (untracked) — leftover checkpoint from the games-db repair run.
- `public/images/` top-level directories all have code references (badges/, game banner/, icons/, jigsaw/, ship_it_characters/) — no orphaned asset *directories*; individual files not exhaustively verified.
