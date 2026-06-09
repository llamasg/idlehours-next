# Inventory — Current State

Original audit 2026-06-09; updated same day after the cleanup sequence (`53e9bd6`…`26259fc`, `f584c21`). The original tooling findings (knip/depcheck/madge) have been executed — see `audit/kill-list.md` for the execution status. This file keeps the parts that remain useful as reference: the route map, the schema map, and still-open findings.

## 1. Tooling status

- **knip / depcheck**: all real findings resolved (files deleted, exports removed, deps pruned). Remaining knip noise is expected: `scripts/` (one-off scripts), `studio/` (separate app with its own entry), and the two deliberately kept zero-importer files `src/components/games/SplitShareButton.tsx` + `Confetti.tsx` (extracted from the deleted GameEndModal, awaiting the share-UI return).
- **madge**: one circular dependency remains — `src/app/play/blitz/components/EndScreen.tsx` ↔ `src/app/play/blitz/page.tsx`. Trivial fix: move the shared symbol into `blitz/lib/`.
- **Deliberately kept deps**: `gsap` (owner decision), `autoprefixer`/`postcss` (Tailwind pipeline — depcheck false positives).

## 2. Route map (current)

Site nav links come from hardcoded components (the Sanity `siteSettings` nav was never wired up — see §3).

| Route | File | Type | Notes |
|---|---|---|---|
| `/` | `src/app/page.tsx` | server | renders `HomepageClient` (hardcoded sections; the modular CMS homepage was removed 2026-06, deferred until after core features) |
| `/about`, `/contact` | own page.tsx | client | |
| `/blog`, `/blog/[slug]` | own page.tsx | client/server | **open bug:** `ParallaxHero.tsx` and footer link to `/posts` (404) |
| `/games`, `/games/[slug]` | own page.tsx | client/server | detail opens via `GameLightboxContext`; no hardcoded inbound links to `/games` |
| `/quizzes` | page.tsx | server | no hardcoded inbound links |
| `/jobs` | page.tsx | server | internal Kanban (`JobBoard` + Job* components). **Open:** live in production with no auth gate and no `notFound()` suppression (the original spec required it) |
| `/play` | page.tsx | client | hub |
| `/play/{game-sense,street-date,shelf-price}` | page.tsx ×3 | client | redirect-only → today's `[date]` (3 near-identical forks — game-shell candidates) |
| `/play/{game}/[date]` ×3 | | client | the daily games |
| `/play/{game}/archive` ×3 → `/play/archive` | | | shared archive viewer |
| `/play/blitz`, `/play/jigsaw(+/[code])`, `/play/ship-it` | | client | session games |
| `/play/skill-issue(+/archive)` | 2 files, 8 lines | client | legacy redirects, zero inbound links — delete whenever |
| `/staging` + 11 sub-pages | | client | design playground, intentionally unlinked |
| `/api/featured-content` | route.ts | GET | consumed by `DiscoverMore.tsx` |
| `/api/igdb` | route.ts | POST | **open:** open CORS proxy, no validation/rate limit |

Removed 2026-06: all `/pip/*` routes (see tag `pip-v1-final`).

**Missing routes still referenced (404s):** `/disclosure` (from `DisclosureBanner.tsx`, `SiteFooter.tsx`), `/posts` (from `ParallaxHero.tsx`; should be `/blog`).

## 3. Sanity schema map (current — 12 registered types)

| Schema | Consumed by |
|---|---|
| `post` | `getAllPosts`, `getPost`; `BrowseView.tsx` |
| `game` | `getAllGames`; `/games` |
| `product` | `getAllProducts`, `getFeaturedProducts`, `getProductsByCategory` |
| `quiz` | `getAllQuizzes`, `getQuiz`; `/quizzes`, homepage |
| `homepageConfig` | `getHomepageConfig`; `src/app/page.tsx` |
| `gameLibrary` (+ curatedRow, curatedRowGame, featureBanner) | `getGameLibrary`; `/games` browse view |
| `siteSettings` | **zero consumers** — its only query (`getSiteSettings`) was deleted as dead code. Decide: wire the nav/site-meta to it, or remove the schema in the next schema pass |
| `author`, `category`, `blockContent` | indirect only (referenced inside `post`) |

Removed 2026-06: `pipDashboard`, `homePage` (+ section objects), `promoBanner`, `musicTrack`. Orphaned documents remain in the production dataset (1 pipDashboard, 2 homePage, 1 promoBanner, 2 musicTrack) — invisible in Studio, recoverable. **Studio redeploy still pending** to make the deployed Studio match.

## 4. Still-open findings (tooling can't see these)

- **`TodayCard.tsx:35` reads the dead `street_date_` v1 localStorage key** — Street Date completion never shows on the /play hero card. Live key is `street_date_v3_` (`DailyBadgeShelf.tsx:64` is correct).
- `TodayCard.tsx:18` and `DailyBadgeShelf.tsx:45` compute "today" from machine-local timezone; the games use Europe/London — completion display can disagree around midnight.
- Dead modal state threaded through the three live game pages (residue of the GameEndModal removal) — parked for the game-shell refactor; see `audit/kill-list.md`.
- `public/images/` top-level directories all have code references; individual files not exhaustively verified.
