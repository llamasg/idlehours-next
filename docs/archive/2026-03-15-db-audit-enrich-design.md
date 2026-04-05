# Database Audit, Dedup & IGDB Enrichment

**Date:** 2026-03-15
**Status:** Approved

## Problem

1. **73 duplicate game entries** caused by apostrophe slug collisions between Game Sense (`yoshis-story`) and IGDB scripts (`yoshi-s-story`). Players can match the wrong entry in Game Sense / Blitz.
2. **Wrong cover art** on many games — IGDB image IDs were assigned by popularity index, not by exact title match. e.g. "Super Mario Bros. Deluxe" shows Trancelation's cover.
3. **Street Date repeats after 36 days** — only 179 pre-selected games are used, despite 3,200+ games with covers in the database.
4. **849 games have no cover image** — limits the pool for visual game modes.

## Solution

A single incremental script (`scripts/enrich-games-db.mjs`) that:

### Phase 1: Deduplication (no API)

- Group entries by `title.toLowerCase().trim()` + same `year`
- For each group, pick the winner with the most non-null fields
- Merge unique fields from losers into the winner
- Delete losers
- Different-year same-title entries (e.g. Resident Evil 1996 vs 2014) are left alone

### Phase 2: IGDB Enrichment (with checkpoint)

- For each game, search IGDB by exact title + year
- Fetch the correct cover `image_id` for the matched game
- Store `igdbRatingCount` (total_rating_count) for popularity ranking
- Write progress to `scripts/.enrich-checkpoint.json` after each game
- Can resume from checkpoint if interrupted
- 260ms sleep between requests (under IGDB 4/sec limit)
- If no IGDB match found, store null in checkpoint (don't retry)

### Phase 3: Popularity Ranking

- After all games processed, sort games within each year by `igdbRatingCount` desc
- Assign `popularityRank` 1–N per year (1 = most popular)
- This continuous rank replaces the old 1–5 system

### Phase 4: Write Output

- Write deduplicated, enriched `games-db.ts`
- Remove the separate `street-date/data/games.ts` and `shelf-price/data/games.ts` generated files (they now filter from the unified DB)

## Street Date: Full Pool Selection

Update `roundUtils.ts` to use the full game pool:

- `getGamesForDate(dateStr)` computes `cycleNumber = Math.floor(dayOffset / 36)`
- Gets all games for the year with `igdbImageId !== null`, sorted by `popularityRank`
- Picks 5 games at spread-out difficulty tiers, offset by `cycleNumber`
- Wraps around when a year's pool is exhausted

Result: 540+ unique daily puzzles before any repeat.

## Checkpoint File Structure

```json
{
  "skyrim": { "igdbImageId": "co1wyy", "igdbRatingCount": 4521 },
  "the-plan": { "igdbImageId": null, "igdbRatingCount": 0 },
  "_meta": { "totalProcessed": 150, "lastUpdated": "2026-03-15T..." }
}
```

## Files Changed

- `scripts/enrich-games-db.mjs` — new enrichment script
- `src/data/games-db.ts` — deduplicated + enriched
- `src/app/play/street-date/data/games.ts` — now filters from unified DB (like Shelf Price)
- `src/app/play/street-date/lib/roundUtils.ts` — full pool selection logic
- `src/app/play/shelf-price/data/games.ts` — already filters from unified DB (no change)
