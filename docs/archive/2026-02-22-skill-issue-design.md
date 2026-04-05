# Skill Issue — Daily Game Guessing Game

## Overview

A daily game guessing game at `/games/Skill_Issue`, modelled on Contexto but for video games. One mystery game per day. Players guess game titles and receive proximity scores. Lifelines reveal facts about the mystery game at a points cost.

## URL Structure

| Route | Purpose |
|---|---|
| `/games/Skill_Issue` | Client redirect to today's dated URL |
| `/games/Skill_Issue/[date]` | Main game page for a specific day |
| `/games/Skill_Issue/archive` | List of all past days with scores |

## File Structure

All under `src/app/games/Skill_Issue/`:

```
page.tsx                      — redirect to today
[date]/page.tsx               — main game UI
archive/page.tsx              — archive list
data/games.ts                 — 20-game array + Game interface
lib/scoring.ts                — calculateProximity()
lib/dateUtils.ts              — seed, game number, date formatting
lib/storage.ts                — localStorage read/write helpers
components/GuessInput.tsx     — autocomplete search input
components/GuessList.tsx      — sorted guess rows
components/LifelinePanel.tsx  — lifeline buttons grid
components/WinModal.tsx       — celebration + stats
components/ShareCard.tsx      — share text builder
```

## Tech Notes

- Next.js App Router, TypeScript, Tailwind CSS
- All pages `'use client'` with `export const dynamic = 'force-dynamic'`
- No external dependencies, no API routes, no database writes
- All state in localStorage
- Uses existing Header and SiteFooter components
- Existing theme tokens: `bg-background`, `text-foreground`, `font-heading`, `bg-card`, `border-border`, etc.

## Daily Reset

Games reset at midnight London UK time (Europe/London timezone). Daily seed:

```
const seed = getDaysSinceEpoch() % GAMES.length
```

Game number is sequential from launch date 2026-02-22. Display: "Skill_Issue #001" + formatted date "Sun 22nd Feb 2026".

## Data Structure

```typescript
interface Game {
  id: string           // slug e.g. "stardew-valley"
  title: string
  year: number
  genres: string[]     // e.g. ["Farming", "Simulation", "RPG"]
  platforms: string[]  // ["PC", "Switch", "PS5", "Xbox", "Mobile"]
  multiplayer: boolean
  pegi: number         // 3, 7, 12, 16, 18
  openCritic: number | null
  vibe: string         // one atmospheric sentence
  tags: string[]       // extra searchable terms
}
```

Starter data: Stardew Valley, Minecraft, Celeste, Hollow Knight, Animal Crossing, Spiritfarer, A Short Hike, Unpacking, Hades, Journey, Ori and the Blind Forest, Night in the Woods, Firewatch, What Remains of Edith Finch, Disco Elysium, Undertale, Oxenfree, Littlewood, Cozy Grove, Venba.

## Points Economy

Players start with 1000 points. Points only go down.

**Guesses**: Each guess costs **20 points**.

**Lifelines** (reveal actual attributes of the mystery game):

| Lifeline | Reveals | Cost |
|---|---|---|
| Genre Tags | The mystery game's genres | 300 pts |
| Vibe Hint | Atmospheric sentence | 250 pts |
| First Letter | First letter of the title | 200 pts |
| Release Year | The exact year | 150 pts |
| OpenCritic Score | Score or "Not rated" | 150 pts |
| Platforms | Which platforms | 100 pts |
| Age Rating | PEGI rating | 75 pts |
| Multiplayer | Yes/No | 50 pts |

## Proximity Scoring

`calculateProximity(guessedGame, answerGame)` returns 1–1000 (lower = closer).

Weighted attributes (sum to 1000 max distance):
- Genre overlap: 300 (Jaccard distance)
- Year difference: 200 (1pt per year, capped 200)
- Platform overlap: 150 (Jaccard distance)
- Multiplayer match: 100 (0 same, 100 different)
- PEGI match: 150 (scaled by step distance)
- OpenCritic diff: 100 (scaled, null treated as 50)

Result clamped 1–1000. Score of 1 = correct answer.

## Guess Input (Autocomplete)

As the player types (min 2 chars), dropdown shows matching games from database filtered by title substring (case-insensitive). Selecting a game submits the guess. Unknown titles not allowed — autocomplete-only submission.

## Guess Display

Each guess row shows:
- Game title
- Proximity score (1–1000) with colour-coded badge:
  - 1–100: green (very close)
  - 101–300: amber (warm)
  - 301–600: orange (lukewarm)
  - 601–1000: red/grey (cold)
- Year direction arrow if year lifeline used (▲ newer, ▼ older)
- List sorted by proximity ascending (closest at top)

## Win State

On correct guess: overlay modal with CSS confetti animation (falling coloured squares, pure CSS keyframes). Shows:
- Final score (remaining points)
- Number of guesses
- Lifelines used
- Share button (copies to clipboard):

```
Skill_Issue #001
Score: 847 | Guesses: 4
🟩🟩🟨🟥
Lifelines: 2
idlehours.co.uk/games/Skill_Issue

[Game Title]
```

Share text omits game title above the fold; title after blank line spoiler gap.

## Archive

`/games/Skill_Issue/archive` shows all days from launch (2026-02-22) to yesterday. Each row: game number, date, "Play" button, and player's score if played (from localStorage).

## Old Game Banner

When viewing a previous day's game, show banner: "You're playing a previous day. Jump to today →" with link to `/games/Skill_Issue`.

## State Persistence (localStorage)

```
Key: skill_issue_2026-02-22
Value: {
  guesses: [{ gameId: string, proximity: number }],
  won: boolean,
  score: number,
  lifelinesUsed: string[],
  lifelinesRevealed: { [lifeline: string]: string | number | boolean | string[] }
}
```
