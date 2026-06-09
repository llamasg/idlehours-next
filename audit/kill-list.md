# Kill-List (ranked by risk)

Audit date: 2026-06-09. Nothing here has been deleted — flag, don't fix. Line counts from the working tree. "Check before deleting" assumes a clean `npm run build` + grep as the minimum bar for every item.

**Totals: SAFE ≈ 1,303 lines / 14 files. PROBABLE ≈ 1,140 lines / 10 files. RISKY ≈ 600+ lines across shared files. Grand total ≈ 3,000+ lines.**

---

## SAFE — zero references, zero side effects

| File | Lines | Why dead | Check before deleting |
|---|---|---|---|
| `src/components/games/GameEndModal.tsx` | 391 | Zero importers since commit `584970e`. CLAUDE.md rule 10 protects it, but the rule is stale | **Decision first**: `SplitShareButton` (lines 96–229) and `Confetti` (58–92) live only here. If share UI is coming back (it should — no game has any share button now), extract them to standalone files *before* deleting. `GameEndModal.copy.ts` stays — it is alive and load-bearing |
| `src/components/GameOfMonth.tsx` | 115 | Zero importers; part of abandoned modular-homepage system | grep `GameOfMonth` — only self + types |
| `src/components/RowCarousel.tsx` | 97 | Zero importers | grep |
| `src/components/Newsletter.tsx` | 65 | Zero importers (`NewsletterForm.tsx` is the live component) | Don't confuse the two file names |
| `src/components/ProductTileCard.tsx` | 58 | Zero importers | grep |
| `src/components/QuizCta.tsx` | 48 | Zero importers | grep |
| `src/hooks/useSiteSettings.ts` | 33 | Zero importers | Deleting it also orphans `getSiteSettings()` in `queries.ts` (see PROBABLE) |
| `src/app/play/game-sense/lib/useSanityGame.ts` | 55 | Not imported by the game; contains its own Sanity client | grep `useSanityGame` |
| `src/app/play/jigsaw/components/DragCursors.tsx` | 47 | Superseded by `RemoteCursors.tsx` | grep |
| `src/pip/components/GoalTracker.tsx` | 79 | Zero importers | grep |
| `src/pip/components/XpBar.tsx` | 42 | Zero importers | grep |
| `src/pip/components/StreakBar.tsx` | 35 | Zero importers | grep |
| `src/pip/hooks/useStreak.ts` | 47 | Zero importers | grep |
| `src/App.css` | 37 | Vite starter stylesheet, imported by nothing | grep `App.css` |
| **Subtotal** | **~1,249** | | |

Also SAFE (non-`src`): `tsconfig.tsbuildinfo` (untrack + gitignore, don't "delete"), `scripts/.repair-checkpoint.json` (untracked leftover).

## PROBABLE — unused but entangled with config, scripts, or unverified dynamic paths

| File | Lines | Why believed dead | What to verify |
|---|---|---|---|
| `pip/` (root dir, tracked files) | 848 | Standalone pre-Next.js Pip Node app; superseded by `src/pip/`. Own package.json | Confirm nothing (cron, Beth's local workflow, Sanity content generation) still runs `node pip/index.js`. The untracked `.env` + Google service-account JSON in this dir must not be committed if folder is reorganised — and the GCP key should be rotated if it ever leaves the machine |
| `deploy.js` | 165 | Hostinger FTP deploy; deploys are Vercel; its `basic-ftp` dep isn't even installed | Confirm Hostinger hosting is fully decommissioned (the script contains a hardcoded host IP) |
| `src/pip/lib/pipQueries.ts` | 13 | knip: unused file. One audit pass claimed `PIP_DASHBOARD_QUERY` is consumed by pip views | `grep -r "pipQueries\|PIP_DASHBOARD_QUERY" src/` — whichever way it falls, 13 lines |
| `src/pip/lib/pipMockData.ts` (partial) | ~300 of 589 | 8 exports unused (`mockClusters`, `mockCalendarEvents`, `mockVideoIdeas`, `mockPinterestPins`, `mockInstagramCaptions`, `mockBoostPlan`, `mockBoostContext`, `XP_LEVELS`) | File itself is partly live — trim exports, don't delete the file |
| `getSiteSettings`, `getPostsByCategory`, `getPromoBanner`, `searchPosts` in `src/lib/queries.ts` | ~80 | No callers (getSiteSettings's only caller is dead `useSiteSettings.ts`) | If `siteSettings` nav is meant to be CMS-driven, the *feature* is unfinished rather than dead — product decision needed |
| Unused re-exports in `src/lib/ranks.ts:14-15` | 2 | Nothing imports the per-game rank re-exports | Pure deletion |
| Per-game dead exports (`EPOCH`, `getDaysSinceEpoch`, `getGameNumber` in each game's `dateUtils.ts`; blitz physics constants; ship-it `ALL_OFFERS`, etc.) | ~40 | knip unused-exports list | Keep the files, delete the symbols |
| `src/types/index.ts` modular-homepage interfaces (11 types) | ~100 | Their rendering components are dead; describes the abandoned `homePage` section system | Decide the fate of the `homePage` Sanity schema first (see RISKY) |
| Root `package.json`: `sanity`, `eslint-plugin-react-refresh`; decide `gsap` | n/a | knip + depcheck agree | `sanity`: confirm `build:studio`/`deploy:studio` scripts resolve from `studio/package.json` not root. `gsap`: CLAUDE.md reserves it deliberately — keep only if the final-animation-layer plan is still real |
| `src/app/play/skill-issue/` (2 redirect files) | 8 | Zero inbound links; site is pre-launch with zero external traffic, so the legacy redirect protects nobody | Confirm no marketing material / printed URLs ever used /play/skill-issue |
| **Subtotal** | **~1,140 in-repo lines** | | |

## RISKY — looks dead but has runtime, SEO, or Sanity implications

| Item | Lines | Why it looks dead | Why it's risky / what to check |
|---|---|---|---|
| `studio/schemaTypes/musicTrack.ts` | 64 | Not registered in `schemaTypes/index.ts`, zero queries | If any `musicTrack` documents were ever created in the production dataset, the schema's absence orphans them invisibly. Check: `sanity documents query '*[_type == "musicTrack"]'` before deciding. Deleting the file is then safe |
| `homePage` schema + `getHomePage()` + section objects | ~200 (schema + query + types) | The components that render its sections are dead; `src/app/page.tsx` uses `homepageConfig` instead | **Sanity data risk**: production dataset may contain a populated `homePage` document Beth edits. Removing the schema breaks Studio editing for it. Decide: is the modular homepage abandoned or paused? Schema deletions require studio redeploy (CLAUDE.md rule 4) |
| `promoBanner` schema + `getPromoBanner()` | ~60 | Query never called | Same Sanity-content concern, smaller. Check dataset for documents |
| Dead UI state in live game pages (game-sense `showWinModal`/`showLossModal`/`showCompleteToast` + toast JSX + share-text memo; street-date `shareText` memo + emoji-grid builders; shelf-price `showResult` + `modalCopy` memos ×3) | ~150 across 3 files | Residue of the GameEndModal removal; values never set true / never rendered | These live inside the three most fragile files in the repo (the game pages with the entrance-animation sequences). **shelf-price's `showResult` still gates `isPostGame`** — deletion is a refactor of live logic, not a file removal. Do it with the game-shell work, not as cleanup |
| `/play/{game}` redirect-only pages ×3 + `/play/game-sense/archive` redirect hop | ~50 | Each is a client-side `router.replace` page | Not dead — load-bearing UX. Listed only because they're consolidation candidates (one server-side redirect pattern), and naive deletion breaks the games' entry URLs. **Do not delete** |
| `ParallaxHero.tsx` unused constants + `/posts` link | 5 + 1 | knip flags constants; `/posts` 404s | The component is the live homepage hero. Fix the link to `/blog` (or create the route); don't touch the component during cleanup |
| `eslint.config.*` review | n/a | knip flags studio eslint config | Studio's own tooling — leave the `studio/` directory entirely alone except `musicTrack.ts` |

## Recommended deletion order

1. **Bookkeeping first (no code):** gitignore + untrack `tsconfig.tsbuildinfo`; delete `scripts/.repair-checkpoint.json`; verify `pip/.env` and `pip/idle-hours-pip-2dc9d35c4cea.json` stay untracked.
2. **SAFE tier in one commit** (~1,250 lines) — build must pass before/after; extract `SplitShareButton` + `Confetti` from `GameEndModal.tsx` first if share UI is wanted back (it is currently absent from every game).
3. **PROBABLE tier, one item per commit**, each with its verification step done (root `pip/`, `deploy.js`, queries.ts dead functions, dead exports, package.json deps).
4. **RISKY tier only with product decisions:** Sanity dataset checks for `musicTrack`/`homePage`/`promoBanner`; dead-state removal folded into the game-shell refactor (`audit/game-architecture.md`).
5. **Fix-not-delete items** alongside: `TodayCard.tsx:35` v1 key bug, `/posts` → `/blog` links, missing `/disclosure` route.
