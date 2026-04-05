# Daily Schedule Stability

All three daily games (Game Sense, Shelf Price, Street Date) derive their daily assignments from `GAMES.length` and seeded array shuffling. When games are added to the database, the shuffle output changes and past dates point to different games. This breaks saved states in localStorage and makes the archive unreliable.

## Fix: Rolling Pre-computed Schedule

Replace the runtime shuffle with a pre-computed `daily-schedule.ts` file that maps date strings to game IDs explicitly. A build-time script generates assignments for the next 14 days based on the current database, appending new rows daily via a cron job or manual trigger. Once a date's assignment is written, it never changes — even if the database grows. Each game (Game Sense, Shelf Price, Street Date) gets its own schedule section since they use different selection logic (single game, pairs, year+5 games). The script should also back-fill any past dates that already have player data in production analytics, locking them in permanently.

## When to Implement

Before launch or before the database exceeds 2,000 games, whichever comes first.
