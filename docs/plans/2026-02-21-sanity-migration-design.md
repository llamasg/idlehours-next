# Design: Sanity Migration + OpenCritic Integration
**Date:** 2026-02-21
**Branch:** pokeblog
**Status:** Approved

---

## Goal

Remove all mock data from the Idle Hours frontend and replace it with real Sanity CMS documents. Add OpenCritic score auto-fetching to the nightly job.

---

## 1 — Schema Changes (`cosyblog/schemaTypes/game.ts`)

**Remove** the `ratings` object field entirely (cozyPercent, brainEffort, snackSafe). These were replaced in a previous session with dedicated top-level fields.

**Add two new string fields** (not yet in schema):
- `openCriticId` — the OpenCritic integer game ID, stored as a string. Used by nightly job to fetch scores. Read-only after entry.
- `steamAppId` — Steam App ID as a string. Used for future price fetching. Optional.

All other new fields (openCriticScore, difficulty, replayability, greatSoundtrack, genre, currentPrice, isFree, lastPriceUpdated) are already present from the previous session.

---

## 2 — OpenCritic Nightly Integration (`pip/opencritic.js`)

New module. Called as **Step 0** in `pip/index.js` before the Plausible research step.

### `updateOpenCriticScores()`
1. Query Sanity for `*[_type == "game" && defined(openCriticId)] { _id, title, openCriticId }`
2. For each game: `GET https://api.opencritic.com/api/game/{openCriticId}`
3. Extract `topCriticScore` (round to integer)
4. `client.patch(gameId).set({ openCriticScore: score }).commit()`
5. Sequential with 300ms delay to be polite to OpenCritic API
6. Graceful: skip games where fetch fails; log results

### `searchOpenCritic(name)` (helper/standalone)
- `GET https://api.opencritic.com/api/game/search?criteria={name}`
- Returns array of `{ id, name }` matches
- Standalone test: `node pip/opencritic.js "Stardew Valley"`

---

## 3 — Migration Script (`scripts/migrate-to-sanity.js`)

One-time script. Run from project root: `node scripts/migrate-to-sanity.js`
Dry run: `DRY_RUN=true node scripts/migrate-to-sanity.js`

### Step 1 — Upload game cover images
- For each game that has an image in `public/images/`, upload via `client.assets.upload('image', fs.createReadStream(path))`
- Build a map: `gameName → { _type: 'image', asset: { _type: 'reference', _ref: assetId } }`
- Three games have no matching image (Cozy Grove, Dorfromantik, Potion Craft) — coverImage left undefined

### Step 2 — Create game documents (createOrReplace)
Map each of the 10 mock games to the game schema:
- Use deterministic `_id` based on slug (e.g. `game-stardew-valley`) so re-runs don't duplicate
- Include coverImage ref from Step 1 where available
- `openCriticId: null`, `steamAppId: null` — fill in via Studio
- Strip `ratings` object (no cozyPercent / brainEffort / snackSafe)
- Retain `longDescription` portable text for Stardew Valley

### Step 3 — Create homePage document (createOrReplace)
1. Query Sanity for existing posts (first 4 by publishedAt desc) → IDs for blogFeature
2. Query Sanity for existing products → IDs for productFeature
3. Use game IDs from Step 2 to build carousel section `_ref` arrays
4. `createOrReplace` the `homePage` singleton with full sections array

### Image filename map (game slug → filename)
```
stardew-valley          → Stardew valley.png
animal-crossing-new-horizons → animalcrossing.jpg
unpacking               → unpacked.png
spiritfarer             → spiritfarer.jpg
a-short-hike            → ashorthike.jpg
palia                   → palia.png
coffee-talk             → coffeetalk.webp
cozy-grove              → (missing — skip)
dorfromantik            → (missing — skip)
potion-craft            → (missing — skip)
```

---

## 4 — Frontend Wiring

### `src/pages/homepage.tsx`
- Add `useEffect` + `getHomePage()` (already in queries.ts)
- Replace `const homePage = mockHomePage` with live fetch + useState
- Existing `HomeLoader` covers the loading state
- Graceful fallback: if fetch fails, render nothing (or a simple error message)

### `src/pages/gamespage.tsx`
- Add `useEffect` + `getAllGames()` (already in queries.ts)
- Replace `[...mockGames]` with live `games` state
- Existing filter/sort logic unchanged — just operates on live data
- Show loading skeleton while fetching

### `src/pages/gamedetailpage.tsx`
- Add `useEffect` + `getGame(slug)` (already in queries.ts)
- Related games: `getAllGames()` filtered to exclude current slug
- Remove `mockGames` import

### `src/data/mock-data.ts`
- Delete the file after confirming no other imports remain

---

## Files Changed

| File | Change |
|------|--------|
| `cosyblog/schemaTypes/game.ts` | Remove ratings object, add openCriticId + steamAppId |
| `pip/opencritic.js` | New: OpenCritic fetch module |
| `pip/index.js` | Add Step 0 (updateOpenCriticScores) |
| `scripts/migrate-to-sanity.js` | New: one-time migration script |
| `src/pages/homepage.tsx` | Switch to Sanity via getHomePage() |
| `src/pages/gamespage.tsx` | Switch to Sanity via getAllGames() |
| `src/pages/gamedetailpage.tsx` | Switch to Sanity via getGame() |
| `src/data/mock-data.ts` | Delete |

---

## What to Check After

1. Sanity Studio shows 10 game documents with new fields (no cozy/snack/brainEffort)
2. Cover images display in Studio for the 7 games that have matching files
3. `node scripts/migrate-to-sanity.js` completes without errors
4. Game pages render live data from Sanity
5. Homepage carousels show real game documents
6. Nightly job runs OpenCritic step successfully for games with `openCriticId` set
