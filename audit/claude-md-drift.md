# CLAUDE.md Drift Report

Audit date: 2026-06-09. Method: every factual claim in CLAUDE.md verified against the working tree and `package.json`. Where documentation and code disagree, **code is the source of truth**.

## Verdict key

- **ACCURATE** — claim matches code
- **STALE** — claim was once true (or was aspirational) and no longer matches code
- **MISSING** — codebase reality that CLAUDE.md does not mention at all

---

## 1. Stack claims

| Claim | Current reality | Verdict |
|---|---|---|
| Next.js 16 | `next ^16.1.6` | ACCURATE |
| React 19 | `react ^19.2.0` | ACCURATE |
| TypeScript | `typescript ~5.9.3` | ACCURATE |
| **Tailwind CSS 4** | `tailwindcss ^3.4.19` — **v3, not v4** | **STALE** |
| Framer Motion | `framer-motion ^12.33.0` | ACCURATE |
| GSAP | `gsap ^3.14.2` installed, zero imports in `src/` (knip + grep confirm). CLAUDE.md's own caveat "installed but not yet implemented" is accurate | ACCURATE |
| Sanity v5 | `sanity ^5.8.1`, `@sanity/client ^7.14.1` | ACCURATE |
| Supabase | `@supabase/supabase-js ^2.98.0` | ACCURATE |
| Anthropic SDK | `@anthropic-ai/sdk ^0.76.0` | ACCURATE |
| Hosting: Vercel auto-deploy from `main` | `@vercel/analytics` + `@vercel/speed-insights` in root layout; consistent | ACCURATE — but see `deploy.js` below (stale Hostinger FTP deploy script still tracked) |
| Fonts: Montserrat (headings), DM Mono (body), Lora (serif/editorial), **Garnett Bold (special)** | Montserrat = `.font-heading` ✓. **`.font-body` is Lora, not DM Mono. DM Mono is `.font-mono`.** **Garnett Bold does not exist anywhere** — no @font-face, no `.font-garnett` class. The actual custom font is `public/fonts/Striker PersonalUseOnly.woff` | **STALE** |

## 2. Directory map

All paths listed in the CLAUDE.md directory map exist. The map is incomplete, not wrong:

| Reality not in the map | Detail | Verdict |
|---|---|---|
| `src/app/api/featured-content/route.ts` | GET, fetches latest posts from Sanity, consumed by `src/components/DiscoverMore.tsx` | MISSING |
| `src/app/api/igdb/route.ts` | POST proxy to IGDB using `TWITCH_CLIENT_ID`/`TWITCH_CLIENT_SECRET`; `Access-Control-Allow-Origin: *`, no auth, no validation | MISSING |
| `pip/` (repo root) | Standalone legacy Node app (own `package.json`): `generate.js`, `research.js`, `opencritic.js`, `sanity.js`, `index.js`, `utils.js`. Predecessor of `src/pip/`. Untracked local `.env` and a Google service-account JSON sit in this directory (not committed — verified via `git ls-files`) | MISSING |
| `deploy.js` (repo root) | Hostinger FTP deployment script (`node deploy.js [all\|site\|studio]`) — pre-Vercel era, contradicts the documented Vercel deploy story | MISSING |
| `src/App.css` | Vite starter stylesheet (`#root { max-width: 1280px ... }`), imported by nothing | MISSING |
| `scripts/` | CLAUDE.md names 3 scripts; 13 exist (`db-manifest.mjs`, `enrich-games-db.mjs`, `generate-rankings.mjs`, `generate-shelf-price-data.mjs`, `generate-street-date-data.mjs`, `igdb-pull.mjs`, `merge-games-db.mjs`, `migrate-to-sanity.js`, `migrate-vibes.mjs`, `repair-corrupted-entries.mjs` + the 3 documented) | MISSING |
| `src/lib/` extras | `dateUtils.ts`, `dayFlavour.ts`, `gameConstants.ts`, `imageUtils.ts`, `jigsawShapes.ts`, `jigsawUtils.ts`, `utils.ts` not listed | MISSING |
| **`src/app/parallax/`** | CLAUDE.md says "experimental, redirects to homepage" — **the directory does not exist**. (`src/components/ParallaxHero.tsx` does exist and is the live homepage hero via `HomepageClient.tsx`) | **STALE** |

## 3. Count claims

| Claim | Actual | Verdict |
|---|---|---|
| ~3,975 games in `src/data/games-db.ts` | 3,975 entries | ACCURATE |
| 15 schema types in `studio/schemaTypes/` | 15 files (incl. `index.ts`; note `musicTrack.ts` is defined but **not registered** in `index.ts`) | ACCURATE (with caveat) |
| 10 Pip views in `src/pip/views/` | 10 | ACCURATE |
| 11 staging pages | 11 directories under `src/app/staging/` | ACCURATE |
| 6 active games | 6 (game-sense, street-date, shelf-price, blitz, jigsaw, ship-it) | ACCURATE |

## 4. Game claims

| Claim | Current reality | Verdict |
|---|---|---|
| localStorage keys `game_sense_`, `street_date_v3_`, `shelf_price_v2_` | Match code (`game-sense/lib/storage.ts`, `street-date/lib/gameState.ts`, `shelf-price/lib/storage.ts`) | ACCURATE |
| 1000pts base scoring, all three dailies | `STARTING_SCORE = 1000` / `BASE_SCORE = 1000` confirmed | ACCURATE |
| **Game Sense ranks: Bust → Keep Guessing → Getting Warmer → Well Played → Encyclopaedic** | `src/lib/ranks.ts`: **Bust → Skill Issue → Button Masher → Big Brain → One Shot** | **STALE** |
| **Street Date ranks: Bust → New to the Medium → Occasional Player → Retro Head → Time Archivist** | `src/lib/ranks.ts`: **Bust → Newbie → Has a Backlog → Day One → The Curator** | **STALE** |
| **Shelf Price ranks: Bust → Just Another Consumer → Junior Dev → Senior Producer → Industry Insider** | `src/lib/ranks.ts`: **Bust → Moms Credit Card → Bargain Hunter → Secret Shopper → Head of Sales** | **STALE** |
| `GameEndModal` is shared by all 3 daily games (do-not-change rule 10) | **`GameEndModal.tsx` has zero importers** — orphaned by commit `584970e` ("skip GameEndModal, go straight to post-game screen"). Only `GameEndModal.copy.ts` is still consumed (by `ResultCard` and the game pages). Rule 10 protects a dead component | **STALE** |
| Standardised share button (`SplitShareButton` with copy/Twitter/Discord/email) | `SplitShareButton` lives *inside* the dead `GameEndModal.tsx` (lines 96–229) and is therefore unreachable. **No daily game currently renders any share UI** | **STALE** |
| `skill-issue/` legacy redirect to game-sense | Confirmed (redirect-only pages) | ACCURATE |

Note: `NORTH-STAR.md` lists a *third* set of Game Sense rank names ("Skill Issue → First Playthrough → Knows the Lore → Final Save → Legendary"). Three documents, three different ladders, one implementation. `src/lib/ranks.ts` + `GameEndModal.copy.ts` are the truth.

## 5. Design tokens

| Claim | Current reality | Verdict |
|---|---|---|
| `--game-*` tokens (ink, cream, blue, green, amber, red) | All present in `globals.css`, plus undocumented variants (`--game-blue-dark`, `--game-ink-mid`, etc.) | ACCURATE |
| `--linen`, `--brand-dark`, `--burnt-orange`, `--accent-green`, `--teal` | All present | ACCURATE |
| `.bvl-purple`, `game-container` | Both present and load-bearing | ACCURATE |
| `font-heading`/`font-body`/`font-serif`/`font-garnett` mapping | `font-heading` = Montserrat ✓; **`font-body` = Lora** (doc says DM Mono); **`font-serif` not a defined utility; DM Mono is `font-mono`; `font-garnett` does not exist** | **STALE** |
| Shelf Price purple | The Shelf Price accent `#5B4FCF` is hardcoded (in `ranks.ts` `GAME_COLORS`, `shelf-price/components/RulesModal.tsx`, page gradient) — **no `--game-purple` CSS variable exists**, breaking the "never inline arbitrary colour values" rule the doc itself states | MISSING |

## 6. Animation system

| Claim | Current reality | Verdict |
|---|---|---|
| `entrance()`, `useEntranceSteps()` in `src/lib/animations.ts` | Both exist (lines 88, 117) | ACCURATE |
| 9 presets (pop, fade, move, wipe, word-pop, slide-up, rise, wipe-right, wipe-down) | All 9 exist | ACCURATE |
| `gs-box-in`, `gs-word-pop`, `gs-fade-in` keyframes in globals.css | All exist | ACCURATE |
| GSAP reserved, not yet used | Confirmed — zero gsap imports | ACCURATE |

## 7. Environment variables

CLAUDE.md lists 10; `.env.local` contains 14 (names only):

| In .env.local, not in CLAUDE.md | Used by |
|---|---|
| `GA4_PROPERTY_ID` | Pip analytics |
| `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` | `src/app/api/igdb/route.ts` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | not referenced in `src/` |

`PLAUSIBLE_API_KEY` is listed in CLAUDE.md but referenced nowhere in `src/`. `NEXT_PUBLIC_GA_MEASUREMENT_ID` is listed but also referenced nowhere in `src/`. Verdict: **STALE**.

## 8. Pip

| Claim | Reality | Verdict |
|---|---|---|
| Password `idlehours2026` in `src/pip/auth/usePipAuth.ts` | Confirmed (line 5) | ACCURATE |
| `/pip` redirects to `/pip/home` | Confirmed | ACCURATE |

## 9. Mission / brand narrative (Phase 0, step 2.5)

**The core mission as currently documented (NORTH-STAR.md, repo root, the only authoritative brand document):**

> Idle Hours is a game discovery engine with an editorial voice. The north star is the feeling of "those extra hours you didn't plan to spend — and didn't want to end." Three interlocking parts: (1) editorial writing (Beth's reviews/features) earns trust; (2) the daily/session games drive a daily visit habit; (3) affiliate links (GOG, Humble Bundle, Green Man Gaming, Fanatical) convert that trust and habit into revenue (target £2,000–£3,000/month, later sponsored reviews and a deals page). Coverage is selected by the "Idle Hours Test" (can be set down without punishment, rewards presence over performance, evident craft, respects player time, genuinely hard to put down) — explicitly **not** a "cosy games site" and not genre-bound.

**Brand-doc inventory:** only two documents carry brand/mission content — `NORTH-STAR.md` and `CLAUDE.md`'s one-paragraph summary. No separate brand-voice/tone-of-voice docs exist in the repo. `docs/plans/` is historical implementation planning, not brand material.

**Drift found:** the two documents agree on the mission itself. Concrete drift is in details:
1. Rank names differ across NORTH-STAR.md, CLAUDE.md, and code (code wins — see §4).
2. CLAUDE.md's summary adds "curated game library" and "pre-launch with zero public traffic" framing not in NORTH-STAR.md — fine, but if the brand narrative has changed since NORTH-STAR.md was written (revenue targets, persona list, the "not cosy" positioning, tone-of-voice banned words), **NORTH-STAR.md is the single file to update** — nothing else in the repo duplicates it except the one CLAUDE.md paragraph.

## 10. Metaphors / non-literal names in CLAUDE.md (flagged per ground rules)

| Term | Where | Suggested literal replacement |
|---|---|---|
| "North Star" | section heading + NORTH-STAR.md filename | "Product principles" (filename is established; keep but define in glossary) |
| "shockwave principle", "epicentre", "rings" | Animation system section | "radial entrance ordering": focal element first, then elements in increasing-distance groups |
| "The arcade" | games carousel naming | "session games" (Blitz, Jigsaw, Ship It) vs "daily games" (Game Sense, Street Date, Shelf Price) |
| "Pip" | internal tool name | Established product name — keep, but always define as "the internal ops dashboard at /pip" |
| "hiding in reverse looks like building" | Animation section | Keep the technique description, drop the aphorism |

## Summary

| Category | Verdict |
|---|---|
| Stack | STALE (Tailwind version, fonts) |
| Directory map | INCOMPLETE (api routes, root pip/, deploy.js, scripts, lib extras; parallax claim stale) |
| Counts | ACCURATE |
| Game mechanics | ACCURATE for keys/scoring; **STALE for all three rank ladders and the entire share/GameEndModal story** |
| Design tokens | MOSTLY ACCURATE (font mapping stale, missing purple token) |
| Animation | ACCURATE |
| Env vars | STALE (5 undocumented, 2 documented-but-unused) |
| Pip | ACCURATE |
| Mission | CONSISTENT across docs; rank details drifted; NORTH-STAR.md is the single place to apply any narrative change |

Proposed replacement: see `audit/claude-md-proposed.md`.
