# Kill-List — Execution Status

Original audit: 2026-06-09. Cleanup executed same day across commits `53e9bd6`…`26259fc` (plus docs cleanup `f584c21`). Pre-Pip-deletion state is preserved at tag `pip-v1-final`. This file now tracks only what remains.

## Executed (summary)

- **SAFE tier** — all 14 files deleted (`c7958f7` + Pip-owned ones in `45d5d22`). `SplitShareButton` and `Confetti` were extracted to standalone files in `src/components/games/` before `GameEndModal.tsx` was deleted.
- **PROBABLE tier** — done: root `pip/` app, `deploy.js`, dead `queries.ts` functions, knip's dead exports, root deps (`sanity`, `eslint-plugin-react-refresh`, plus Pip-orphaned `@anthropic-ai/sdk`, `recharts`, `jsonrepair`, `date-fns`).
- **RISKY tier** — Sanity decisions made and executed (`26259fc`): `homePage` schema + `getHomePage()` + 11 `types/index.ts` interfaces removed (modular homepage deferred until after core features); `promoBanner` and `musicTrack` schemas removed. Orphaned documents remain in the dataset (2 homePage, 1 promoBanner, 2 musicTrack) — invisible in Studio, recoverable.
- **Pip** — removed entirely (`45d5d22`): `src/pip/`, `src/app/pip/`, legacy root `pip/` backend, `pipDashboard` schema, `.github/workflows/pip-nightly.yml` (the nightly scheduler), `public/pip_prompt5*.md`. Rebuild planned post-auth.
- **Docs** — `docs/archive/` (54 files) and 2 stale plans deleted (`f584c21`); `daily-schedule-stability.md` moved to `docs/plans/` (matching the TODO references in the three games' `dateUtils.ts`).
- **Deliberate keeps:** `gsap` (owner decision — handy for animation), `pip-pulse` Tailwind keyframe (belongs to shelf-price ProgressBar), `autoprefixer`/`postcss` (Tailwind pipeline), shadcn variant exports in `src/components/ui/`.

## Still open — code

| Item | Size | Blocked on |
|---|---|---|
| Dead modal state in the three game pages (game-sense `showWinModal`/`showLossModal`/`showCompleteToast` + toast JSX + share memo; street-date `shareText` memo + emoji-grid builders; shelf-price `showResult` + 3 `modalCopy` memos) | ~150 lines | Game-shell refactor — shelf-price's `showResult` still gates `isPostGame`, so this is live-logic surgery, not file deletion |
| `/play/skill-issue/` redirect pages | 8 lines | Nothing — delete whenever (site is pre-launch; no external traffic to protect) |
| `siteSettings` Sanity schema | n/a | Now has zero consumers in src/ (its only query was deleted as dead). Decide: wire the nav to it, or remove it with the next schema pass |
| Quick-fixes commit: `TodayCard.tsx:35` v1 key bug; `/posts` → `/blog` links; missing `/disclosure` route; `/jobs` prod suppression (`notFound()` in production — specced in the original jobs prompt, never implemented) | small | Nothing — ready to do as one commit |
| Blitz circular dep (`EndScreen.tsx` ↔ `page.tsx`) | trivial | Nothing — move the shared symbol into `blitz/lib/` |

## Still open — manual ops (owner only)

1. Rotate the Anthropic key — it is inlined into the deployed Studio bundle via `studio/sanity.cli.ts` (`VITE_ANTHROPIC_API_KEY` in `studio/.env`/`.env.local`; never git-committed, verified).
2. Delete dead env vars from `.env.local` + Vercel: `NEXT_PUBLIC_ANTHROPIC_API_KEY`, `GA4_PROPERTY_ID`, `PLAUSIBLE_API_KEY`.
3. Delete the pip-nightly GitHub repo secrets (8 of them).
4. Redeploy Studio (`npx sanity deploy` from `studio/`) — one redeploy covers the `pipDashboard` + `homePage`/`promoBanner`/`musicTrack` removals.
5. Archive/delete the untracked credentials left in `pip/` on disk (`.env`, Google service-account JSON); rotate the GCP key if in doubt.
6. Push `main` (commits are local only until pushed).
