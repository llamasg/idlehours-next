# Foundations Check — Supabase Auth (magic links), badges + RLS, Stripe cosmetics

Audit date: 2026-06-09; updated same day after the cleanup sequence (Pip fully removed in `45d5d22` — that resolved the client-exposed Anthropic key and the fake-password pattern). Verdict: **the foundations do not yet support auth, RLS, or payments — but nothing is architecturally irreversible.** Three prerequisites should land before the badges table (see §6).

## 1. Current Supabase setup

`src/lib/supabase.ts` (7 lines): a single browser client via `createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)`, exported as a **nullable singleton** (`supabase: SupabaseClient | null`). Every consumer null-guards.

- **No server-side Supabase client exists.** No service-role key referenced in `src/`. `@supabase/ssr` / auth-helpers are **not installed** — only `@supabase/supabase-js ^2.98.0`.
- **No `middleware.ts` exists** anywhere in the project.
- All Supabase usage is in client components/hooks: jigsaw realtime (`src/app/play/jigsaw/hooks/useRoom.ts`, `usePieceSync.ts`, `usePresence.ts`, `[code]/page.tsx`), blitz scores (`EndScreen.tsx`, `LeaderboardScreen.tsx`), jobs board (`src/lib/jobs.ts`).

Tables referenced in code (every `.from()` call):

| Table | Where | Operations from the browser |
|---|---|---|
| `jobs` | `src/lib/jobs.ts:26,36,47,58` | select, insert, update, **delete** — `/jobs` has no auth gate; any visitor can mutate |
| `jigsaw_rooms` | `useRoom.ts:73,115,176` | insert, select, update |
| `jigsaw_pieces` | `useRoom.ts:96,142`, `usePieceSync.ts:206`, `[code]/page.tsx:270` | bulk insert, select, update |
| `blitz_scores` | `EndScreen.tsx:84` (insert), `LeaderboardScreen.tsx:44` (select) | public leaderboard writes; only "rate limit" is a 30s sessionStorage cooldown (client-side, bypassable) |

All writes use the anon key, which means RLS on these four tables is currently disabled or wide open. **Enabling a strict-RLS `badges` table next to an anonymous-writable `jobs` table is an inconsistent security posture — all four tables' policies need deciding at the same time.**

## 2. Where auth state would live

There is currently no auth of any kind. (Pip's hardcoded localStorage password — the only prior "auth" pattern — was removed with Pip in `45d5d22`. Auth is greenfield.)

Natural integration points given current structure:

- **Provider mount point:** `src/components/ClientProviders.tsx` (the single client wrapper used by `src/app/layout.tsx:33`). Current stack: `ThemeProvider` (next-themes) → `GameLightboxProvider` → `ClickSpark` → children. An `AuthProvider`/`SupabaseSessionProvider` slots in here — this is the one place all pages share.
- **Session refresh:** a new root `middleware.ts` (required by the `@supabase/ssr` magic-link flow for cookie/token refresh). Greenfield — nothing conflicts, nothing exists.
- **Server-side session:** the root layout is a server component and could read the session once cookie-based clients exist.
- **For the Pip rebuild** (planned post-auth): gate it with a Supabase session (e.g. an `is_admin` claim), never a client-side password check; all Claude calls go through server routes with the key server-side only.

## 3. Client-exposed secrets

**RESOLVED in code, pending ops.** The five `'use client'` files that instantiated the Anthropic SDK with `dangerouslyAllowBrowser: true` were deleted with Pip (`45d5d22`). Still pending (owner): delete `NEXT_PUBLIC_ANTHROPIC_API_KEY` from `.env.local` + Vercel, and **rotate the key** — it shipped in prior deployed bundles, and the same key is still inlined into the deployed Sanity Studio bundle via `studio/sanity.cli.ts` (`VITE_ANTHROPIC_API_KEY` in `studio/.env`/`.env.local`, used by the Studio gameGenerator; never git-committed, verified, but deployed Studio JS is publicly fetchable).

Other env var findings:

| Var | Status |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` | Normal and expected client exposure |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` / `DATASET` | Normal |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | In .env.local and CLAUDE.md, referenced nowhere in `src/` |
| `SANITY_TOKEN` | Referenced in `src/lib/sanity.ts:9`. Only imported by server code today, so it does **not** leak — but the single shared client mixes a token with `useCdn: true` and is one careless client-component import away from a build error or confusion. Recommend a `sanity.server.ts` split or `import 'server-only'` guard |
| `SANITY_WRITE_TOKEN`, `PLAUSIBLE_API_KEY`, server `ANTHROPIC_API_KEY` | In .env.local, referenced nowhere in `src/` |
| `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` | Server-only, used correctly in `/api/igdb` |
| `pip/.env`, `pip/idle-hours-pip-2dc9d35c4cea.json` (Google service-account key) | Local files in the legacy root `pip/` app — **not tracked by git** (verified), but sitting in the repo directory. Keep gitignored; rotate the GCP key if there's any doubt it was ever committed or shared |

## 4. API routes

The entire API surface is two handlers:

| Route | Method | Validation | Auth | Issues |
|---|---|---|---|---|
| `src/app/api/igdb/route.ts` | POST | **None** — forwards raw `req.text()` to `api.igdb.com/v4/games` | None | `Access-Control-Allow-Origin: *` — any website can burn the Twitch/IGDB quota through this proxy. No rate limiting |
| `src/app/api/featured-content/route.ts` | GET | n/a (no input) | None needed | Fine as-is (read-only Sanity fetch, `revalidate = 3600`) |

There is **no input-validation library in the project** (no zod), no auth-check pattern, no rate limiting anywhere. Meanwhile the de-facto "API pattern" being copied is `blitz_scores`' direct client-side insert (`EndScreen.tsx:84`) — which must not become the template for badges or paid cosmetics.

Once user data exists, needed from scratch: validated server routes (or RPCs) for badge grants and score submission; Stripe checkout-session creation + webhook handler (webhooks *require* a server route with signature verification); tightened `/api/igdb` (CORS allowlist, rate limit).

## 5. Game state that badges would sync

All daily-game completion state is client-authored localStorage, one JSON blob per game per day:

| Game | Writer | Key | Shape |
|---|---|---|---|
| Game Sense | `game-sense/lib/storage.ts` (`saveDayState`, line 62) | `game_sense_YYYY-MM-DD` | `{ guesses: {gameId, proximity, isHint?}[], won, score, blanksRevealed[], startedAt?, endedAt? }` |
| Street Date | `street-date/lib/gameState.ts` (`saveState`, line 65) | `street_date_v3_YYYY-MM-DD` | `{ gameIds, shuffledIds, slots, pool, guesses[], score, won, finished, hintOneUsed, hintAllUsed, revealedPairs, revealedYearIds, startedAt, endedAt }` |
| Shelf Price | `shelf-price/lib/storage.ts` (`saveDayState`, line 56) | `shelf_price_v2_YYYY-MM-DD` | `{ score, correctCount, round, won, finished, choices[] }` |

Readers that duplicate key knowledge and must stay in lockstep: `DailyBadgeShelf.tsx:56,64,72`, `TodayCard.tsx:28,42` (with the live v1-key bug at line 35), `archive/lib/archiveAdapter.ts:62-106`. No cross-day streak storage exists for any game (Pip's `useStreak.ts` is unrelated and dead). Blitz is the only game that touches Supabase for scores; jigsaw syncs board state, not scores; ship-it persists nothing.

**Trust consequence:** scores are computed in browser JS from `src/data/games-db.ts`, which ships the answers (years, prices) to the client by design. A badges table fed from localStorage is trivially forgeable. Because puzzles are deterministic by date, **server-side re-validation of a submitted result against the day's puzzle is feasible** — but no server representation of puzzles exists yet. Decide early: validated badges (server re-check) vs cosmetic-trust badges (accept forgeability until money is attached — once Stripe cosmetics exist, forgeable progression starts to matter).

## 6. Friction list and prerequisites

Ordered; the first three are prerequisites that should land **before** the badges table. (The fourth original prerequisite — removing Pip's client-side Anthropic calls — was completed by the Pip removal `45d5d22`; only the key rotation + env var deletion remain, see §3.)

1. **Install `@supabase/ssr`; create cookie-based browser/server client pair + root `middleware.ts`.** Touches every current supabase importer (§1), but the nullable singleton centralises the change. Decide what to do with the `| null` pattern — fine for optional features, wrong for auth, which needs hard guarantees; expect a required-client/optional-client split.
2. **Define the RLS posture for all four existing tables** (`jobs`, `jigsaw_rooms`, `jigsaw_pieces`, `blitz_scores`) at the same time as `badges` — especially `jobs`, currently anonymous-writable from a public route (and live in production with no `notFound()` suppression).
3. **Establish one validated server-route pattern** (zod or equivalent + session check + rate limit) that badge writes and later Stripe webhooks share. `/api/igdb`'s open CORS proxy is the current hygiene example to fix, not follow.
4. The games are fully client-side (`force-dynamic`) with answers shipped to the client — fine for gameplay, but server-side puzzle validation (§5) is the only path to honest badges.
5. localStorage-to-account migration has no abstraction point: three storage modules with three shapes plus three raw readers. The per-game manifest proposed in `audit/game-architecture.md` §5.3 is the right seam — build it before, or as part of, the badge sync.
6. Sanity client mixes read+token in one module (`src/lib/sanity.ts:9`) — split server-only before more server code is written.
