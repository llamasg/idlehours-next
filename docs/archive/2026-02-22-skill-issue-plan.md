# Skill Issue Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a daily game guessing game at `/games/Skill_Issue` where players guess a mystery game, get proximity scores, and can spend points on lifeline reveals.

**Architecture:** Fully client-side Next.js App Router pages using localStorage for state. No API routes, no database. Three routes: today redirect, dated game page, archive. Game data is a static TypeScript array of 20 games.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS (existing theme tokens), framer-motion (already in project)

**Design doc:** `docs/plans/2026-02-22-skill-issue-design.md`

---

### Task 1: Game Data + Types

**Files:**
- Create: `src/app/games/Skill_Issue/data/games.ts`

**Step 1: Create the game database file**

```typescript
// src/app/games/Skill_Issue/data/games.ts

export interface SkillIssueGame {
  id: string
  title: string
  year: number
  genres: string[]
  platforms: string[]
  multiplayer: boolean
  pegi: number
  openCritic: number | null
  vibe: string
  tags: string[]
}

export const GAMES: SkillIssueGame[] = [
  {
    id: 'stardew-valley',
    title: 'Stardew Valley',
    year: 2016,
    genres: ['Farming', 'Simulation', 'RPG'],
    platforms: ['PC', 'Switch', 'PS5', 'Xbox', 'Mobile'],
    multiplayer: true,
    pegi: 7,
    openCritic: 89,
    vibe: 'Warm afternoons tending crops while the seasons quietly change around you.',
    tags: ['indie', 'pixel art', 'relaxing', 'crafting', 'romance'],
  },
  {
    id: 'minecraft',
    title: 'Minecraft',
    year: 2011,
    genres: ['Sandbox', 'Survival', 'Adventure'],
    platforms: ['PC', 'Switch', 'PS5', 'Xbox', 'Mobile'],
    multiplayer: true,
    pegi: 7,
    openCritic: 93,
    vibe: 'An endless world of blocks where every hill hides something worth digging into.',
    tags: ['creative', 'building', 'exploration', 'crafting'],
  },
  {
    id: 'celeste',
    title: 'Celeste',
    year: 2018,
    genres: ['Platformer', 'Adventure'],
    platforms: ['PC', 'Switch', 'PS5', 'Xbox'],
    multiplayer: false,
    pegi: 7,
    openCritic: 92,
    vibe: 'A mountain that asks more of you than just climbing.',
    tags: ['indie', 'pixel art', 'difficult', 'story-driven', 'speedrun'],
  },
  {
    id: 'hollow-knight',
    title: 'Hollow Knight',
    year: 2017,
    genres: ['Metroidvania', 'Action', 'Platformer'],
    platforms: ['PC', 'Switch', 'PS5', 'Xbox'],
    multiplayer: false,
    pegi: 7,
    openCritic: 90,
    vibe: 'A vast underground kingdom full of bugs, secrets, and quiet melancholy.',
    tags: ['indie', 'hand-drawn', 'exploration', 'boss fights', 'challenging'],
  },
  {
    id: 'animal-crossing',
    title: 'Animal Crossing: New Horizons',
    year: 2020,
    genres: ['Simulation', 'Social'],
    platforms: ['Switch'],
    multiplayer: true,
    pegi: 3,
    openCritic: 90,
    vibe: 'Your own little island where nothing is urgent and everything can wait until tomorrow.',
    tags: ['relaxing', 'decorating', 'collecting', 'seasonal'],
  },
  {
    id: 'spiritfarer',
    title: 'Spiritfarer',
    year: 2020,
    genres: ['Management', 'Platformer', 'Adventure'],
    platforms: ['PC', 'Switch', 'PS5', 'Xbox'],
    multiplayer: true,
    pegi: 12,
    openCritic: 84,
    vibe: 'A game about saying goodbye that somehow makes it feel okay.',
    tags: ['indie', 'emotional', 'hand-drawn', 'crafting', 'narrative'],
  },
  {
    id: 'a-short-hike',
    title: 'A Short Hike',
    year: 2019,
    genres: ['Adventure', 'Exploration'],
    platforms: ['PC', 'Switch', 'PS5', 'Xbox'],
    multiplayer: false,
    pegi: 3,
    openCritic: 85,
    vibe: 'A breezy afternoon climbing a mountain at your own pace.',
    tags: ['indie', 'short', 'relaxing', 'pixel art', 'wholesome'],
  },
  {
    id: 'unpacking',
    title: 'Unpacking',
    year: 2021,
    genres: ['Puzzle', 'Simulation'],
    platforms: ['PC', 'Switch', 'PS5', 'Xbox', 'Mobile'],
    multiplayer: false,
    pegi: 3,
    openCritic: 80,
    vibe: 'Telling a whole life story through the things someone owns.',
    tags: ['indie', 'relaxing', 'narrative', 'zen', 'short'],
  },
  {
    id: 'hades',
    title: 'Hades',
    year: 2020,
    genres: ['Roguelike', 'Action', 'RPG'],
    platforms: ['PC', 'Switch', 'PS5', 'Xbox'],
    multiplayer: false,
    pegi: 12,
    openCritic: 93,
    vibe: 'Dying over and over has never felt this good or moved a story forward this well.',
    tags: ['indie', 'greek mythology', 'fast-paced', 'narrative', 'replayable'],
  },
  {
    id: 'journey',
    title: 'Journey',
    year: 2012,
    genres: ['Adventure', 'Exploration'],
    platforms: ['PC', 'PS5'],
    multiplayer: true,
    pegi: 7,
    openCritic: 92,
    vibe: 'Two hours of wordless beauty that stays with you for years.',
    tags: ['art game', 'short', 'emotional', 'musical', 'online co-op'],
  },
  {
    id: 'ori-and-the-blind-forest',
    title: 'Ori and the Blind Forest',
    year: 2015,
    genres: ['Metroidvania', 'Platformer'],
    platforms: ['PC', 'Switch', 'Xbox'],
    multiplayer: false,
    pegi: 7,
    openCritic: 88,
    vibe: 'A forest that glows and weeps and asks you to save it one jump at a time.',
    tags: ['indie', 'beautiful', 'emotional', 'hand-painted', 'challenging'],
  },
  {
    id: 'night-in-the-woods',
    title: 'Night in the Woods',
    year: 2017,
    genres: ['Adventure', 'Narrative'],
    platforms: ['PC', 'Switch', 'PS5', 'Xbox'],
    multiplayer: false,
    pegi: 12,
    openCritic: 79,
    vibe: 'Coming home after college to find that home moved on without you.',
    tags: ['indie', 'story-driven', 'atmospheric', 'funny', 'dark'],
  },
  {
    id: 'firewatch',
    title: 'Firewatch',
    year: 2016,
    genres: ['Adventure', 'Narrative'],
    platforms: ['PC', 'Switch', 'PS5', 'Xbox'],
    multiplayer: false,
    pegi: 16,
    openCritic: 76,
    vibe: 'A summer job watching for fires that turns into something you can\'t look away from.',
    tags: ['indie', 'story-driven', 'atmospheric', 'walking sim', 'mystery'],
  },
  {
    id: 'what-remains-of-edith-finch',
    title: 'What Remains of Edith Finch',
    year: 2017,
    genres: ['Adventure', 'Narrative'],
    platforms: ['PC', 'Switch', 'PS5', 'Xbox'],
    multiplayer: false,
    pegi: 16,
    openCritic: 89,
    vibe: 'A house full of locked rooms, each one holding a story you\'re not ready for.',
    tags: ['indie', 'story-driven', 'emotional', 'walking sim', 'short'],
  },
  {
    id: 'disco-elysium',
    title: 'Disco Elysium',
    year: 2019,
    genres: ['RPG', 'Narrative', 'Adventure'],
    platforms: ['PC', 'Switch', 'PS5', 'Xbox'],
    multiplayer: false,
    pegi: 18,
    openCritic: 92,
    vibe: 'A detective game where the biggest mystery is the wreck you\'ve made of yourself.',
    tags: ['indie', 'writing', 'dialogue', 'philosophical', 'dark'],
  },
  {
    id: 'undertale',
    title: 'Undertale',
    year: 2015,
    genres: ['RPG', 'Adventure'],
    platforms: ['PC', 'Switch', 'PS5', 'Xbox'],
    multiplayer: false,
    pegi: 12,
    openCritic: 92,
    vibe: 'A game that remembers what you did, even when you wish it wouldn\'t.',
    tags: ['indie', 'pixel art', 'funny', 'subversive', 'emotional', 'retro'],
  },
  {
    id: 'oxenfree',
    title: 'Oxenfree',
    year: 2016,
    genres: ['Adventure', 'Narrative'],
    platforms: ['PC', 'Switch', 'PS5', 'Xbox', 'Mobile'],
    multiplayer: false,
    pegi: 12,
    openCritic: 78,
    vibe: 'Late-night radio static on an island where the signal is coming from somewhere it shouldn\'t.',
    tags: ['indie', 'story-driven', 'atmospheric', 'horror-lite', 'dialogue'],
  },
  {
    id: 'littlewood',
    title: 'Littlewood',
    year: 2020,
    genres: ['Simulation', 'RPG', 'Farming'],
    platforms: ['PC', 'Switch'],
    multiplayer: false,
    pegi: 3,
    openCritic: 76,
    vibe: 'Rebuilding a town after the adventure is over, one quiet day at a time.',
    tags: ['indie', 'pixel art', 'relaxing', 'town-building', 'crafting'],
  },
  {
    id: 'cozy-grove',
    title: 'Cozy Grove',
    year: 2021,
    genres: ['Simulation', 'Adventure'],
    platforms: ['PC', 'Switch', 'PS5', 'Xbox', 'Mobile'],
    multiplayer: false,
    pegi: 7,
    openCritic: 74,
    vibe: 'A haunted island that just needs someone to care about it for fifteen minutes a day.',
    tags: ['indie', 'hand-drawn', 'relaxing', 'daily-play', 'ghosts'],
  },
  {
    id: 'venba',
    title: 'Venba',
    year: 2023,
    genres: ['Narrative', 'Puzzle'],
    platforms: ['PC', 'Switch', 'PS5', 'Xbox'],
    multiplayer: false,
    pegi: 3,
    openCritic: 73,
    vibe: 'Cooking your mother\'s recipes in a country that doesn\'t know them yet.',
    tags: ['indie', 'short', 'emotional', 'cooking', 'cultural', 'story-driven'],
  },
]
```

**Step 2: Verify the file compiles**

Run: `npx tsc --noEmit src/app/games/Skill_Issue/data/games.ts` or just check no red squiggles.

**Step 3: Commit**

```bash
git add src/app/games/Skill_Issue/data/games.ts
git commit -m "feat(skill-issue): add game database with 20 starter games"
```

---

### Task 2: Date Utilities

**Files:**
- Create: `src/app/games/Skill_Issue/lib/dateUtils.ts`

**Step 1: Create date utilities**

```typescript
// src/app/games/Skill_Issue/lib/dateUtils.ts

import { GAMES } from '../data/games'

const LAUNCH_DATE = '2026-02-22'
const EPOCH = new Date('2026-02-22T00:00:00+00:00')

/** Get today's date string in YYYY-MM-DD format, London timezone. */
export function getTodayDateString(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' })
}

/** Days since the launch epoch for a given date string. */
export function getDaysSinceEpoch(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00+00:00')
  return Math.floor((target.getTime() - EPOCH.getTime()) / (1000 * 60 * 60 * 24))
}

/** Get the game index for a given date. */
export function getGameIndexForDate(dateStr: string): number {
  const days = getDaysSinceEpoch(dateStr)
  return ((days % GAMES.length) + GAMES.length) % GAMES.length
}

/** Get the sequential game number (1-indexed) for display. */
export function getGameNumber(dateStr: string): number {
  return getDaysSinceEpoch(dateStr) + 1
}

/** Format game number with zero-padding: "#001" */
export function formatGameNumber(dateStr: string): string {
  return `#${String(getGameNumber(dateStr)).padStart(3, '0')}`
}

/** Format date for display: "Sun 22nd Feb 2026" */
export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00+00:00')
  const day = date.getDate()
  const suffix =
    day === 1 || day === 21 || day === 31
      ? 'st'
      : day === 2 || day === 22
        ? 'nd'
        : day === 3 || day === 23
          ? 'rd'
          : 'th'
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' })
  const month = date.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })
  const year = date.getUTCFullYear()
  return `${weekday} ${day}${suffix} ${month} ${year}`
}

/** Check whether a date string is today or in the past (playable). */
export function isPlayableDate(dateStr: string): boolean {
  const today = getTodayDateString()
  return dateStr <= today && dateStr >= LAUNCH_DATE
}

/** Check whether a date string is today. */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayDateString()
}

/** Get all playable dates from launch to yesterday (for archive). */
export function getArchiveDates(): string[] {
  const today = getTodayDateString()
  const dates: string[] = []
  const cursor = new Date(LAUNCH_DATE + 'T12:00:00+00:00')
  const todayDate = new Date(today + 'T12:00:00+00:00')

  while (cursor < todayDate) {
    dates.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return dates.reverse() // newest first
}
```

**Step 2: Commit**

```bash
git add src/app/games/Skill_Issue/lib/dateUtils.ts
git commit -m "feat(skill-issue): add date utilities (seed, formatting, archive)"
```

---

### Task 3: Proximity Scoring

**Files:**
- Create: `src/app/games/Skill_Issue/lib/scoring.ts`

**Step 1: Create scoring module**

```typescript
// src/app/games/Skill_Issue/lib/scoring.ts

import type { SkillIssueGame } from '../data/games'

/** Jaccard distance: 1 - (intersection / union). Returns 0-1. */
function jaccardDistance(a: string[], b: string[]): number {
  const setA = new Set(a)
  const setB = new Set(b)
  const intersection = [...setA].filter((x) => setB.has(x)).length
  const union = new Set([...setA, ...setB]).size
  if (union === 0) return 0
  return 1 - intersection / union
}

/** PEGI ratings in order. Distance is the step count between them. */
const PEGI_ORDER = [3, 7, 12, 16, 18]
function pegiDistance(a: number, b: number): number {
  const idxA = PEGI_ORDER.indexOf(a)
  const idxB = PEGI_ORDER.indexOf(b)
  if (idxA === -1 || idxB === -1) return 1
  return Math.abs(idxA - idxB) / (PEGI_ORDER.length - 1)
}

/**
 * Calculate proximity between a guessed game and the answer.
 * Returns 1–1000 where 1 = correct, 1000 = maximally far.
 */
export function calculateProximity(
  guess: SkillIssueGame,
  answer: SkillIssueGame,
): number {
  if (guess.id === answer.id) return 1

  // Genre overlap: up to 300
  const genreScore = jaccardDistance(guess.genres, answer.genres) * 300

  // Year difference: up to 200 (1 point per year, capped)
  const yearScore = Math.min(Math.abs(guess.year - answer.year), 200)

  // Platform overlap: up to 150
  const platformScore = jaccardDistance(guess.platforms, answer.platforms) * 150

  // Multiplayer match: 0 or 100
  const multiplayerScore = guess.multiplayer === answer.multiplayer ? 0 : 100

  // PEGI match: up to 150
  const pegiScore = pegiDistance(guess.pegi, answer.pegi) * 150

  // OpenCritic difference: up to 100 (null treated as 50)
  const guessOC = guess.openCritic ?? 50
  const answerOC = answer.openCritic ?? 50
  const ocScore = (Math.min(Math.abs(guessOC - answerOC), 100) / 100) * 100

  const total = genreScore + yearScore + platformScore + multiplayerScore + pegiScore + ocScore

  // Clamp to 2–1000 (1 is reserved for exact match)
  return Math.max(2, Math.min(1000, Math.round(total)))
}
```

**Step 2: Commit**

```bash
git add src/app/games/Skill_Issue/lib/scoring.ts
git commit -m "feat(skill-issue): add proximity scoring with weighted attributes"
```

---

### Task 4: localStorage Storage Helpers

**Files:**
- Create: `src/app/games/Skill_Issue/lib/storage.ts`

**Step 1: Create storage module**

```typescript
// src/app/games/Skill_Issue/lib/storage.ts

export interface GuessRecord {
  gameId: string
  proximity: number
}

export interface DayState {
  guesses: GuessRecord[]
  won: boolean
  score: number
  lifelinesUsed: string[]
  lifelinesRevealed: Record<string, string | number | boolean | string[]>
}

const STARTING_SCORE = 1000

function storageKey(dateStr: string): string {
  return `skill_issue_${dateStr}`
}

export function loadDayState(dateStr: string): DayState {
  if (typeof window === 'undefined') {
    return { guesses: [], won: false, score: STARTING_SCORE, lifelinesUsed: [], lifelinesRevealed: {} }
  }
  try {
    const raw = localStorage.getItem(storageKey(dateStr))
    if (raw) return JSON.parse(raw)
  } catch {
    // corrupted data — start fresh
  }
  return { guesses: [], won: false, score: STARTING_SCORE, lifelinesUsed: [], lifelinesRevealed: {} }
}

export function saveDayState(dateStr: string, state: DayState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(storageKey(dateStr), JSON.stringify(state))
}
```

**Step 2: Commit**

```bash
git add src/app/games/Skill_Issue/lib/storage.ts
git commit -m "feat(skill-issue): add localStorage helpers for game state"
```

---

### Task 5: GuessInput Component (Autocomplete)

**Files:**
- Create: `src/app/games/Skill_Issue/components/GuessInput.tsx`

**Step 1: Create autocomplete input**

```tsx
// src/app/games/Skill_Issue/components/GuessInput.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { GAMES, type SkillIssueGame } from '../data/games'

interface GuessInputProps {
  onGuess: (game: SkillIssueGame) => void
  guessedIds: string[]
  disabled: boolean
}

export default function GuessInput({ onGuess, guessedIds, disabled }: GuessInputProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = query.length >= 2
    ? GAMES.filter(
        (g) =>
          g.title.toLowerCase().includes(query.toLowerCase()) &&
          !guessedIds.includes(g.id),
      )
    : []

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setHighlightIndex(0)
  }, [query])

  function selectGame(game: SkillIssueGame) {
    onGuess(game)
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      selectGame(filtered[highlightIndex])
    }
  }

  return (
    <div ref={ref} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => query.length >= 2 && setOpen(true)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Type a game title..."
        className="w-full rounded-lg border border-border bg-background px-4 py-3 font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
          {filtered.map((game, i) => (
            <li
              key={game.id}
              onMouseDown={() => selectGame(game)}
              onMouseEnter={() => setHighlightIndex(i)}
              className={`cursor-pointer px-4 py-2 font-body text-sm ${
                i === highlightIndex ? 'bg-primary/10 text-foreground' : 'text-muted-foreground'
              }`}
            >
              {game.title}
              <span className="ml-2 text-xs text-muted-foreground/50">({game.year})</span>
            </li>
          ))}
        </ul>
      )}
      {open && query.length >= 2 && filtered.length === 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
          <p className="font-body text-sm text-muted-foreground">No matching games found</p>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/games/Skill_Issue/components/GuessInput.tsx
git commit -m "feat(skill-issue): add autocomplete guess input component"
```

---

### Task 6: GuessList Component

**Files:**
- Create: `src/app/games/Skill_Issue/components/GuessList.tsx`

**Step 1: Create guess list**

```tsx
// src/app/games/Skill_Issue/components/GuessList.tsx
'use client'

import type { GuessRecord } from '../lib/storage'
import { GAMES } from '../data/games'

interface GuessListProps {
  guesses: GuessRecord[]
  answerYear: number | null // only shown if year lifeline used
}

function proximityColor(score: number): string {
  if (score <= 100) return 'bg-green-500/15 text-green-700 border-green-500/30'
  if (score <= 300) return 'bg-amber-500/15 text-amber-700 border-amber-500/30'
  if (score <= 600) return 'bg-orange-500/15 text-orange-700 border-orange-500/30'
  return 'bg-red-500/10 text-red-400 border-red-500/20'
}

export default function GuessList({ guesses, answerYear }: GuessListProps) {
  if (guesses.length === 0) return null

  const sorted = [...guesses].sort((a, b) => a.proximity - b.proximity)

  return (
    <div className="space-y-2">
      {sorted.map((guess, i) => {
        const game = GAMES.find((g) => g.id === guess.gameId)
        const title = game?.title ?? guess.gameId
        const year = game?.year

        let yearArrow: string | null = null
        if (answerYear != null && year != null && guess.proximity !== 1) {
          if (answerYear > year) yearArrow = '▲'
          else if (answerYear < year) yearArrow = '▼'
        }

        return (
          <div
            key={guess.gameId}
            className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-4 py-3"
          >
            <span className="font-heading text-sm text-foreground">{title}</span>
            <div className="flex items-center gap-2">
              {yearArrow && (
                <span className="font-heading text-xs text-muted-foreground" title={yearArrow === '▲' ? 'Answer is newer' : 'Answer is older'}>
                  {yearArrow}
                </span>
              )}
              <span className={`rounded-full border px-3 py-1 font-heading text-xs font-bold ${proximityColor(guess.proximity)}`}>
                {guess.proximity === 1 ? '✓' : guess.proximity}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/games/Skill_Issue/components/GuessList.tsx
git commit -m "feat(skill-issue): add colour-coded guess list component"
```

---

### Task 7: LifelinePanel Component

**Files:**
- Create: `src/app/games/Skill_Issue/components/LifelinePanel.tsx`

**Step 1: Create lifeline panel**

```tsx
// src/app/games/Skill_Issue/components/LifelinePanel.tsx
'use client'

import type { SkillIssueGame } from '../data/games'

export interface Lifeline {
  key: string
  label: string
  cost: number
  reveal: (game: SkillIssueGame) => string | number | boolean | string[]
  format: (value: any) => string
}

export const LIFELINES: Lifeline[] = [
  {
    key: 'genre',
    label: 'Genre Tags',
    cost: 300,
    reveal: (g) => g.genres,
    format: (v: string[]) => v.join(', '),
  },
  {
    key: 'vibe',
    label: 'Vibe Hint',
    cost: 250,
    reveal: (g) => g.vibe,
    format: (v: string) => `"${v}"`,
  },
  {
    key: 'firstLetter',
    label: 'First Letter',
    cost: 200,
    reveal: (g) => g.title[0],
    format: (v: string) => `Starts with "${v}"`,
  },
  {
    key: 'year',
    label: 'Release Year',
    cost: 150,
    reveal: (g) => g.year,
    format: (v: number) => String(v),
  },
  {
    key: 'openCritic',
    label: 'OpenCritic',
    cost: 150,
    reveal: (g) => g.openCritic ?? 'Not rated',
    format: (v: number | string) => (typeof v === 'number' ? `${v}/100` : String(v)),
  },
  {
    key: 'platforms',
    label: 'Platforms',
    cost: 100,
    reveal: (g) => g.platforms,
    format: (v: string[]) => v.join(', '),
  },
  {
    key: 'pegi',
    label: 'Age Rating',
    cost: 75,
    reveal: (g) => g.pegi,
    format: (v: number) => `PEGI ${v}`,
  },
  {
    key: 'multiplayer',
    label: 'Multiplayer',
    cost: 50,
    reveal: (g) => g.multiplayer,
    format: (v: boolean) => (v ? 'Yes' : 'No'),
  },
]

interface LifelinePanelProps {
  answer: SkillIssueGame
  lifelinesUsed: string[]
  lifelinesRevealed: Record<string, any>
  score: number
  onUseLifeline: (lifeline: Lifeline, value: any) => void
  disabled: boolean
}

export default function LifelinePanel({
  answer,
  lifelinesUsed,
  lifelinesRevealed,
  score,
  onUseLifeline,
  disabled,
}: LifelinePanelProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Lifelines
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {LIFELINES.map((ll) => {
          const used = lifelinesUsed.includes(ll.key)
          const revealed = lifelinesRevealed[ll.key]
          const canAfford = score >= ll.cost

          return (
            <button
              key={ll.key}
              onClick={() => {
                if (!used && canAfford && !disabled) {
                  const value = ll.reveal(answer)
                  onUseLifeline(ll, value)
                }
              }}
              disabled={used || !canAfford || disabled}
              className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                used
                  ? 'border-border/40 bg-card'
                  : canAfford
                    ? 'border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5'
                    : 'border-border/30 bg-muted/30 opacity-50'
              }`}
            >
              <div className="font-heading text-xs font-medium text-foreground">
                {ll.label}
              </div>
              {used && revealed != null ? (
                <div className="mt-1 font-body text-xs text-primary">
                  {ll.format(revealed)}
                </div>
              ) : (
                <div className="mt-1 font-body text-xs text-muted-foreground">
                  {ll.cost} pts
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/games/Skill_Issue/components/LifelinePanel.tsx
git commit -m "feat(skill-issue): add lifeline panel with reveal mechanics"
```

---

### Task 8: WinModal + ShareCard Components

**Files:**
- Create: `src/app/games/Skill_Issue/components/ShareCard.tsx`
- Create: `src/app/games/Skill_Issue/components/WinModal.tsx`

**Step 1: Create share text builder**

```tsx
// src/app/games/Skill_Issue/components/ShareCard.tsx
'use client'

import { useState } from 'react'
import type { GuessRecord } from '../lib/storage'
import { formatGameNumber } from '../lib/dateUtils'

interface ShareCardProps {
  dateStr: string
  gameTitle: string
  score: number
  guesses: GuessRecord[]
  lifelinesUsedCount: number
}

function proximityEmoji(score: number): string {
  if (score <= 100) return '🟩'
  if (score <= 300) return '🟨'
  if (score <= 600) return '🟧'
  return '🟥'
}

export default function ShareCard({ dateStr, gameTitle, score, guesses, lifelinesUsedCount }: ShareCardProps) {
  const [copied, setCopied] = useState(false)

  function handleShare() {
    const number = formatGameNumber(dateStr)
    const squares = guesses.map((g) => proximityEmoji(g.proximity)).join('')
    const lines = [
      `Skill_Issue ${number}`,
      `Score: ${score} | Guesses: ${guesses.length}`,
      squares,
      lifelinesUsedCount > 0 ? `Lifelines: ${lifelinesUsedCount}` : null,
      'idlehours.co.uk/games/Skill_Issue',
      '',
      gameTitle,
    ].filter((l) => l != null)

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleShare}
      className="rounded-full bg-primary px-6 py-2.5 font-heading text-sm font-semibold text-white transition-transform hover:scale-105"
    >
      {copied ? 'Copied!' : 'Share Result'}
    </button>
  )
}
```

**Step 2: Create win modal with confetti**

```tsx
// src/app/games/Skill_Issue/components/WinModal.tsx
'use client'

import { useEffect, useState } from 'react'
import ShareCard from './ShareCard'
import type { GuessRecord } from '../lib/storage'

interface WinModalProps {
  dateStr: string
  gameTitle: string
  score: number
  guesses: GuessRecord[]
  lifelinesUsedCount: number
  onClose: () => void
}

function Confetti() {
  const [pieces, setPieces] = useState<{ id: number; left: number; delay: number; color: string; size: number }[]>([])

  useEffect(() => {
    const colors = ['#c95d0d', '#2e8b57', '#e5a44d', '#d94f4f', '#5b8dd9', '#9b59b6']
    setPieces(
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 6,
      })),
    )
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute animate-[confetti-fall_2.5s_ease-in_forwards]"
          style={{
            left: `${p.left}%`,
            top: -20,
            animationDelay: `${p.delay}s`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  )
}

export default function WinModal({ dateStr, gameTitle, score, guesses, lifelinesUsedCount, onClose }: WinModalProps) {
  return (
    <>
      <Confetti />
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
        <div
          className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground">You got it!</h2>
            <p className="mt-2 font-heading text-lg text-primary">{gameTitle}</p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="font-heading text-2xl font-bold text-foreground">{score}</div>
                <div className="font-body text-xs text-muted-foreground">Score</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="font-heading text-2xl font-bold text-foreground">{guesses.length}</div>
                <div className="font-body text-xs text-muted-foreground">Guesses</div>
              </div>
            </div>

            {lifelinesUsedCount > 0 && (
              <p className="mt-3 font-body text-sm text-muted-foreground">
                Lifelines used: {lifelinesUsedCount}
              </p>
            )}

            <div className="mt-6 flex justify-center gap-3">
              <ShareCard
                dateStr={dateStr}
                gameTitle={gameTitle}
                score={score}
                guesses={guesses}
                lifelinesUsedCount={lifelinesUsedCount}
              />
              <button
                onClick={onClose}
                className="rounded-full border border-border px-6 py-2.5 font-heading text-sm text-muted-foreground transition-colors hover:bg-muted/50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/games/Skill_Issue/components/ShareCard.tsx src/app/games/Skill_Issue/components/WinModal.tsx
git commit -m "feat(skill-issue): add win modal with confetti and share card"
```

---

### Task 9: Main Game Page (`[date]/page.tsx`)

**Files:**
- Create: `src/app/games/Skill_Issue/[date]/page.tsx`

**Step 1: Create the main game page**

This is the core page that wires everything together. It:
- Reads the date param, loads the answer game from the seed
- Manages game state (guesses, score, lifelines) via the storage helpers
- Renders: header info, old-game banner, lifeline panel, guess input, guess list, win modal

```tsx
// src/app/games/Skill_Issue/[date]/page.tsx
'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, use } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import Link from 'next/link'
import { GAMES, type SkillIssueGame } from '../data/games'
import { getGameIndexForDate, formatGameNumber, formatDisplayDate, isPlayableDate, isToday } from '../lib/dateUtils'
import { calculateProximity } from '../lib/scoring'
import { loadDayState, saveDayState, type DayState } from '../lib/storage'
import GuessInput from '../components/GuessInput'
import GuessList from '../components/GuessList'
import LifelinePanel, { type Lifeline } from '../components/LifelinePanel'
import WinModal from '../components/WinModal'

const GUESS_COST = 20

export default function SkillIssueDatePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = use(params)

  const [state, setState] = useState<DayState | null>(null)
  const [showWinModal, setShowWinModal] = useState(false)

  const gameIndex = getGameIndexForDate(date)
  const answer = GAMES[gameIndex]
  const playable = isPlayableDate(date)
  const today = isToday(date)

  // Load state from localStorage on mount
  useEffect(() => {
    const loaded = loadDayState(date)
    setState(loaded)
    if (loaded.won) setShowWinModal(true)
  }, [date])

  const save = useCallback(
    (newState: DayState) => {
      setState(newState)
      saveDayState(date, newState)
    },
    [date],
  )

  function handleGuess(game: SkillIssueGame) {
    if (!state || state.won) return
    const proximity = calculateProximity(game, answer)
    const newGuesses = [...state.guesses, { gameId: game.id, proximity }]
    const won = proximity === 1
    const newScore = Math.max(0, state.score - GUESS_COST)

    const newState: DayState = {
      ...state,
      guesses: newGuesses,
      won,
      score: won ? newScore : newScore,
    }
    save(newState)
    if (won) setShowWinModal(true)
  }

  function handleUseLifeline(lifeline: Lifeline, value: any) {
    if (!state || state.won) return
    const newState: DayState = {
      ...state,
      score: Math.max(0, state.score - lifeline.cost),
      lifelinesUsed: [...state.lifelinesUsed, lifeline.key],
      lifelinesRevealed: { ...state.lifelinesRevealed, [lifeline.key]: value },
    }
    save(newState)
  }

  if (!state) return null // loading from localStorage

  const yearLifelineUsed = state.lifelinesUsed.includes('year')

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-8 lg:py-12">
        {/* Old game banner */}
        {playable && !today && (
          <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center">
            <p className="font-body text-sm text-amber-700">
              You&apos;re playing a previous day.{' '}
              <Link href="/games/Skill_Issue" className="font-semibold underline">
                Jump to today &rarr;
              </Link>
            </p>
          </div>
        )}

        {/* Game header */}
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Skill_Issue {formatGameNumber(date)}
          </h1>
          <p className="mt-1 font-body text-muted-foreground">{formatDisplayDate(date)}</p>
          <div className="mt-3 inline-block rounded-full bg-card border border-border/60 px-4 py-1.5">
            <span className="font-heading text-sm font-bold text-foreground">{state.score}</span>
            <span className="ml-1 font-body text-xs text-muted-foreground">pts remaining</span>
          </div>
        </div>

        {!playable ? (
          <div className="rounded-lg border border-border/60 bg-card p-8 text-center">
            <p className="font-heading text-lg text-muted-foreground">
              This game isn&apos;t available yet.
            </p>
            <Link
              href="/games/Skill_Issue"
              className="mt-4 inline-block font-heading text-sm text-primary underline"
            >
              Play today&apos;s game
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Lifelines */}
            <LifelinePanel
              answer={answer}
              lifelinesUsed={state.lifelinesUsed}
              lifelinesRevealed={state.lifelinesRevealed}
              score={state.score}
              onUseLifeline={handleUseLifeline}
              disabled={state.won}
            />

            {/* Guess input */}
            {!state.won && (
              <GuessInput
                onGuess={handleGuess}
                guessedIds={state.guesses.map((g) => g.gameId)}
                disabled={state.won}
              />
            )}

            {/* Won inline message (when modal closed) */}
            {state.won && !showWinModal && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-center">
                <p className="font-heading text-sm text-green-700">
                  You guessed <strong>{answer.title}</strong> with a score of{' '}
                  <strong>{state.score}</strong>!
                </p>
                <button
                  onClick={() => setShowWinModal(true)}
                  className="mt-2 font-heading text-xs text-primary underline"
                >
                  View results
                </button>
              </div>
            )}

            {/* Guess list */}
            <GuessList
              guesses={state.guesses}
              answerYear={yearLifelineUsed ? answer.year : null}
            />

            {/* Archive link */}
            <div className="pt-4 text-center">
              <Link
                href="/games/Skill_Issue/archive"
                className="font-heading text-xs text-muted-foreground underline hover:text-foreground"
              >
                Previous games
              </Link>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />

      {/* Win modal */}
      {showWinModal && state.won && (
        <WinModal
          dateStr={date}
          gameTitle={answer.title}
          score={state.score}
          guesses={state.guesses}
          lifelinesUsedCount={state.lifelinesUsed.length}
          onClose={() => setShowWinModal(false)}
        />
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/games/Skill_Issue/\[date\]/page.tsx
git commit -m "feat(skill-issue): add main game page with full gameplay loop"
```

---

### Task 10: Today Redirect Page + Archive Page

**Files:**
- Create: `src/app/games/Skill_Issue/page.tsx`
- Create: `src/app/games/Skill_Issue/archive/page.tsx`

**Step 1: Create today redirect**

```tsx
// src/app/games/Skill_Issue/page.tsx
'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getTodayDateString } from './lib/dateUtils'

export default function SkillIssueTodayPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/games/Skill_Issue/${getTodayDateString()}`)
  }, [router])

  return null
}
```

**Step 2: Create archive page**

```tsx
// src/app/games/Skill_Issue/archive/page.tsx
'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import { getArchiveDates, formatGameNumber, formatDisplayDate } from '../lib/dateUtils'
import { loadDayState } from '../lib/storage'

interface ArchiveRow {
  date: string
  number: string
  displayDate: string
  score: number | null
  played: boolean
}

export default function SkillIssueArchivePage() {
  const [rows, setRows] = useState<ArchiveRow[]>([])

  useEffect(() => {
    const dates = getArchiveDates()
    setRows(
      dates.map((d) => {
        const state = loadDayState(d)
        return {
          date: d,
          number: formatGameNumber(d),
          displayDate: formatDisplayDate(d),
          score: state.won ? state.score : null,
          played: state.guesses.length > 0,
        }
      }),
    )
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-8 lg:py-12">
        <div className="mb-2">
          <Link
            href="/games/Skill_Issue"
            className="font-heading text-xs text-muted-foreground underline hover:text-foreground"
          >
            &larr; Back to today
          </Link>
        </div>

        <h1 className="mb-6 font-heading text-3xl font-bold text-foreground">
          Skill_Issue Archive
        </h1>

        {rows.length === 0 ? (
          <p className="font-body text-muted-foreground">
            No previous games yet. Come back tomorrow!
          </p>
        ) : (
          <div className="space-y-2">
            {rows.map((row) => (
              <div
                key={row.date}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-4 py-3"
              >
                <div>
                  <span className="font-heading text-sm font-bold text-foreground">
                    Skill_Issue {row.number}
                  </span>
                  <span className="ml-3 font-body text-xs text-muted-foreground">
                    {row.displayDate}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {row.score != null && (
                    <span className="font-heading text-xs text-green-600">{row.score} pts</span>
                  )}
                  {row.played && row.score == null && (
                    <span className="font-heading text-xs text-amber-600">In progress</span>
                  )}
                  <Link
                    href={`/games/Skill_Issue/${row.date}`}
                    className="rounded-full bg-primary/10 px-4 py-1.5 font-heading text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    {row.played ? 'View' : 'Play'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/games/Skill_Issue/page.tsx src/app/games/Skill_Issue/archive/page.tsx
git commit -m "feat(skill-issue): add today redirect and archive pages"
```

---

### Task 11: Confetti CSS Keyframe + Build Verification

**Files:**
- Modify: `tailwind.config.js` (add confetti keyframe)

**Step 1: Add confetti animation to Tailwind config**

In `tailwind.config.js`, add to `theme.extend.keyframes`:

```javascript
'confetti-fall': {
  '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
  '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
},
```

And to `theme.extend.animation`:

```javascript
'confetti-fall': 'confetti-fall 2.5s ease-in forwards',
```

**Step 2: Run the full build**

Run: `npm run build`

Expected: Build passes with all Skill_Issue routes appearing in the output:
- `/games/Skill_Issue` (Dynamic)
- `/games/Skill_Issue/[date]` (Dynamic)
- `/games/Skill_Issue/archive` (Dynamic)

Fix any TypeScript or build errors that appear.

**Step 3: Manual smoke test**

Run: `npm run dev`

Test:
1. Navigate to `http://localhost:3000/games/Skill_Issue` — should redirect to today's date
2. Type "Stardew" in the input — autocomplete should appear
3. Select a game — proximity score should display
4. Click a lifeline — should reveal info and deduct points
5. Navigate to archive — should show empty or today only

**Step 4: Commit**

```bash
git add tailwind.config.js
git commit -m "feat(skill-issue): add confetti keyframe animation"
```

---

### Task 12: Final Commit + Merge

**Step 1: Run build one final time**

Run: `npm run build`

Verify clean build with no errors.

**Step 2: Push and merge**

```bash
git push origin dev
git checkout main
git merge dev
git push origin main
git checkout dev
```
