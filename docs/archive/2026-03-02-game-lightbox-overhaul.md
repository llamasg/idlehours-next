# Game Library & Lightbox Overhaul — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace individual game pages with a lightbox overlay system, remove long descriptions from Sanity, add grid/list view toggle.

**Architecture:** React Context provider (`GameLightboxProvider`) wraps the app in `ClientProviders`. It stores the active game and exposes `openLightbox(game)` / `closeLightbox()`. URL is synced via `history.pushState`. A thin `/games/[slug]` server route renders the library page with `initialLightboxSlug` passed as a prop, read in a `useEffect` on mount to avoid hydration mismatch.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Framer Motion, Sanity v5

---

### Task 1: Remove `longDescription` from Sanity schema and generator

**Files:**
- Modify: `studio/schemaTypes/game.ts:44-48`
- Modify: `studio/components/gameGenerator/GameGeneratorInput.tsx:173-175`
- Delete: `studio/components/gameGenerator/description.ts`

**Step 1: Remove `longDescription` field from game schema**

In `studio/schemaTypes/game.ts`, delete lines 44-48:

```ts
    defineField({
      name: 'longDescription',
      title: 'Long Description',
      type: 'blockContent',
    }),
```

**Step 2: Remove description generation from GameGeneratorInput**

In `studio/components/gameGenerator/GameGeneratorInput.tsx`, delete lines 173-175:

```ts
      if (preview.longDescriptionBlocks) {
        patch.longDescription = preview.longDescriptionBlocks
      }
```

Then search the same file for `generateDescription`, `longDescriptionBlocks`, and `description` import. Remove:
- The import of `generateDescription` from `./description`
- The call to `generateDescription()` in the search/preview flow
- The `longDescriptionBlocks` property from the preview state object
- Any preview UI that shows the generated description

**Step 3: Delete `description.ts`**

Delete `studio/components/gameGenerator/description.ts` entirely.

**Step 4: Commit**

```bash
git add studio/schemaTypes/game.ts studio/components/gameGenerator/
git commit -m "refactor(sanity): remove longDescription field and description generator"
```

---

### Task 2: Remove `longDescription` from frontend types and queries

**Files:**
- Modify: `src/types/index.ts:38`
- Modify: `src/lib/queries.ts:407-438`

**Step 1: Remove `longDescription` from Game interface**

In `src/types/index.ts`, delete line 38:

```ts
  longDescription?: any[] // Portable Text blocks
```

**Step 2: Delete `getGame()` function from queries**

In `src/lib/queries.ts`, delete the entire `getGame` function (lines 407-438):

```ts
// Get single game by slug
export async function getGame(slug: string) {
  ...
}
```

**Step 3: Commit**

```bash
git add src/types/index.ts src/lib/queries.ts
git commit -m "refactor: remove longDescription from Game type and delete getGame query"
```

---

### Task 3: Create `GameLightboxContext` provider

**Files:**
- Create: `src/context/GameLightboxContext.tsx`
- Modify: `src/components/ClientProviders.tsx`

**Step 1: Create the context provider**

Create `src/context/GameLightboxContext.tsx`:

```tsx
'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Game } from '@/types'
import { getAllGames } from '@/lib/queries'

interface GameLightboxContextValue {
  activeGame: Game | null
  allGames: Game[]
  openLightbox: (game: Game) => void
  closeLightbox: () => void
}

const GameLightboxContext = createContext<GameLightboxContextValue | null>(null)

export function useGameLightbox() {
  const ctx = useContext(GameLightboxContext)
  if (!ctx) throw new Error('useGameLightbox must be used within GameLightboxProvider')
  return ctx
}

export function GameLightboxProvider({ children }: { children: React.ReactNode }) {
  const [activeGame, setActiveGame] = useState<Game | null>(null)
  const [allGames, setAllGames] = useState<Game[]>([])
  const [previousPath, setPreviousPath] = useState<string | null>(null)

  // Load all games once for related-games lookups
  useEffect(() => {
    getAllGames()
      .then((data) => setAllGames(data ?? []))
      .catch(() => {})
  }, [])

  const openLightbox = useCallback((game: Game) => {
    setPreviousPath(window.location.pathname + window.location.search)
    setActiveGame(game)
    history.pushState({ lightbox: true }, '', `/games/${game.slug.current}`)
  }, [])

  const closeLightbox = useCallback(() => {
    setActiveGame(null)
    if (previousPath) {
      history.pushState(null, '', previousPath)
      setPreviousPath(null)
    }
  }, [previousPath])

  // Close lightbox on browser Back
  useEffect(() => {
    function handlePopState() {
      if (activeGame) {
        setActiveGame(null)
        setPreviousPath(null)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [activeGame])

  return (
    <GameLightboxContext.Provider value={{ activeGame, allGames, openLightbox, closeLightbox }}>
      {children}
    </GameLightboxContext.Provider>
  )
}
```

**Step 2: Wrap ClientProviders with the lightbox provider**

In `src/components/ClientProviders.tsx`, add the provider:

```tsx
'use client'

import ClickSpark from './ClickSpark'
import { GameLightboxProvider } from '@/context/GameLightboxContext'
import GameLightbox from '@/components/GameLightbox'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <GameLightboxProvider>
      <ClickSpark
        sparkColor="#c95d0d"
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        {children}
        <GameLightbox />
      </ClickSpark>
    </GameLightboxProvider>
  )
}
```

**Step 3: Commit**

```bash
git add src/context/GameLightboxContext.tsx src/components/ClientProviders.tsx
git commit -m "feat: add GameLightboxProvider context with pushState URL sync"
```

---

### Task 4: Build the `GameLightbox` component

**Files:**
- Create: `src/components/GameLightbox.tsx`

**Step 1: Create the lightbox overlay**

This component is always mounted but only visible when `activeGame !== null`. It reuses the hero card layout from the current detail page (`src/app/games/[slug]/page.tsx` lines 155-279) and adds a related games row.

Create `src/components/GameLightbox.tsx`:

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameLightbox } from '@/context/GameLightboxContext'
import GameTileCard from '@/components/GameTileCard'
import type { Game } from '@/types'

// ── Helpers (same as current detail page) ─────────────────────────────────

function ocColor(score: number): string {
  if (score >= 90) return 'bg-purple-600 text-white'
  if (score >= 75) return 'bg-green-500 text-white'
  if (score >= 50) return 'bg-green-700 text-white'
  return 'bg-blue-500 text-white'
}

function DifficultyLabel({ level }: { level: 1 | 2 | 3 }) {
  const labels = { 1: 'Beginner', 2: 'Intermediate', 3: 'Experienced' } as const
  return (
    <div className="flex items-center gap-1.5" title={labels[level]}>
      {([1, 2, 3] as const).map((i) => (
        <span
          key={i}
          className={`inline-block h-2.5 w-2.5 rounded-full ${i <= level ? 'bg-amber-500' : 'bg-muted-foreground/20'}`}
        />
      ))}
      <span className="ml-1 font-heading text-sm text-muted-foreground">{labels[level]}</span>
    </div>
  )
}

function ReplayMeter({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1" title={`Replayability: ${value}/5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i
        const half = !filled && value >= i - 0.5
        return (
          <span
            key={i}
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              filled ? 'bg-accent-green' : half ? 'bg-accent-green/50' : 'bg-muted-foreground/20'
            }`}
          />
        )
      })}
      <span className="ml-1 font-heading text-sm text-muted-foreground">{value}/5 replay</span>
    </div>
  )
}

// ── GameLightbox ──────────────────────────────────────────────────────────

export default function GameLightbox() {
  const { activeGame: game, allGames, closeLightbox } = useGameLightbox()
  const dialogRef = useRef<HTMLDivElement>(null)

  // Escape key
  useEffect(() => {
    if (!game) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [game, closeLightbox])

  // Lock body scroll when open
  useEffect(() => {
    if (game) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [game])

  // Focus trap — focus the dialog on open
  useEffect(() => {
    if (game && dialogRef.current) {
      dialogRef.current.focus()
    }
  }, [game])

  // Related games — up to 4, filtered by matching genre, exclude current
  const related: Game[] = game
    ? allGames
        .filter((g) => g._id !== game._id)
        .filter((g) => (g.genre ?? []).some((gen) => (game.genre ?? []).includes(gen)))
        .slice(0, 4)
    : []

  // If not enough genre matches, pad with random games
  if (game && related.length < 4) {
    const ids = new Set([game._id, ...related.map((g) => g._id)])
    for (const g of allGames) {
      if (related.length >= 4) break
      if (!ids.has(g._id)) {
        related.push(g)
        ids.add(g._id)
      }
    }
  }

  return (
    <AnimatePresence>
      {game && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-8 sm:py-12"
          onClick={(e) => { if (e.target === e.currentTarget) closeLightbox() }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={game.title}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-[860px] rounded-2xl bg-card shadow-2xl outline-none"
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute right-3 top-3 z-20 rounded-full bg-black/40 p-1.5 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
              aria-label="Close"
            >
              <span
                className="inline-block shrink-0 bg-current"
                style={{
                  width: 16, height: 16,
                  WebkitMask: 'url(/images/icons/icon_sad-cancel-failure-leave-bad-negative.svg) no-repeat center / contain',
                  mask: 'url(/images/icons/icon_sad-cancel-failure-leave-bad-negative.svg) no-repeat center / contain',
                }}
              />
            </button>

            {/* Hero card — same layout as the former detail page */}
            <div className="overflow-hidden rounded-t-2xl">
              <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
                {/* Cover image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-secondary lg:aspect-auto lg:min-h-[300px]">
                  {game.coverImage ? (
                    <img src={game.coverImage} alt={game.title} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
                      <span className="font-heading text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>

                {/* Info panel */}
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <h2 className="font-heading text-2xl font-bold text-foreground lg:text-3xl">
                    {game.title}
                  </h2>

                  {/* Genre row */}
                  {(game.genre ?? []).length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className="inline-block shrink-0 bg-current"
                        style={{
                          width: 14, height: 14, color: '#4199f1',
                          WebkitMask: 'url(/images/icons/icon_tag-genre-filter.svg) no-repeat center / contain',
                          mask: 'url(/images/icons/icon_tag-genre-filter.svg) no-repeat center / contain',
                        }}
                      />
                      <p className="font-heading text-xs font-bold uppercase tracking-widest text-foreground">
                        {(game.genre ?? []).join(' · ')}
                      </p>
                    </div>
                  )}

                  {/* Ratings */}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {game.openCriticScore != null && (
                      <span className={`rounded-full px-3 py-1 font-heading text-sm font-bold shadow ${ocColor(game.openCriticScore)}`}>
                        {game.openCriticScore} OpenCritic
                      </span>
                    )}
                    {game.difficulty != null && <DifficultyLabel level={game.difficulty} />}
                    {game.replayability != null && <ReplayMeter value={game.replayability} />}
                    {game.greatSoundtrack && (
                      <div className="flex items-center gap-1.5" title="Great Soundtrack">
                        <span className="inline-block shrink-0 text-accent bg-current" style={{ width: 16, height: 16, WebkitMask: 'url(/images/icons/icon_music-soundtrack-headphones-sound-audio.svg) no-repeat center / contain', mask: 'url(/images/icons/icon_music-soundtrack-headphones-sound-audio.svg) no-repeat center / contain' }} />
                        <span className="font-heading text-sm text-muted-foreground">Great Soundtrack</span>
                      </div>
                    )}
                    {game.coop && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 font-heading text-xs font-medium text-accent-green">
                        Co-op
                      </span>
                    )}
                  </div>

                  {/* Short description */}
                  <p className="mt-4 leading-relaxed text-muted-foreground">
                    {game.shortDescription}
                  </p>

                  {/* Platforms */}
                  {(game.platforms ?? []).length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Platforms
                      </h3>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {(game.platforms ?? []).map((p: string) => (
                          <span key={p} className="rounded-full border border-border bg-background px-3 py-1 font-heading text-xs text-foreground">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {(game.tags ?? []).length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1.5">
                        {(game.tags ?? []).map((tag: string) => (
                          <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 font-heading text-[11px] text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Affiliate links */}
                  {(game.affiliateLinks ?? []).length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {(game.affiliateLinks ?? []).map((link: { label: string; url: string }) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 font-heading text-sm font-semibold text-white transition-transform hover:scale-105"
                        >
                          {link.label}
                          <span className="inline-block shrink-0 bg-current" style={{ width: 12, height: 12, WebkitMask: 'url(/images/icons/icon_click-hover-mouse-tap-cursor.svg) no-repeat center / contain', mask: 'url(/images/icons/icon_click-hover-mouse-tap-cursor.svg) no-repeat center / contain' }} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Related games */}
            {related.length > 0 && (
              <div className="border-t border-border/40 p-6">
                <h3 className="mb-3 font-heading text-sm font-bold text-foreground">
                  You might also like
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {related.map((g) => (
                    <GameTileCard key={g._id} game={g} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: clean (no errors)

**Step 3: Commit**

```bash
git add src/components/GameLightbox.tsx
git commit -m "feat: add GameLightbox overlay component with hero card and related games"
```

---

### Task 5: Replace all game detail links with lightbox triggers

**Files:**
- Modify: `src/components/GameTileCard.tsx:3,57`
- Modify: `src/components/GameReferenceBlock.tsx:3,45-49`
- Modify: `src/components/GameOfMonth.tsx:4,56,137-143`
- Modify: `src/app/play/skill-issue/components/GamePromoCard.tsx:2,42-47`

**Step 1: GameTileCard — replace Link with onClick**

In `src/components/GameTileCard.tsx`:

Remove `import Link from 'next/link'` (line 3).

Add import: `import { useGameLightbox } from '@/context/GameLightboxContext'`

Inside the component function (after line 54), add:
```tsx
const { openLightbox } = useGameLightbox()
```

Replace line 57:
```tsx
<Link href={`/games/${game.slug.current}`} className="block w-full">
```
With:
```tsx
<div className="block w-full" onClick={() => openLightbox(game)}>
```

Replace the closing `</Link>` (line 144) with `</div>`.

**Step 2: GameReferenceBlock — replace Link with onClick**

In `src/components/GameReferenceBlock.tsx`:

This is a **server component** (no `'use client'`). It uses a stretched `<Link>` overlay (lines 45-49). Since the lightbox requires context (client-side), we need to add `'use client'` and swap the Link.

Add `'use client'` at top of file.

Remove `import Link from 'next/link'` (line 3).

Add import: `import { useGameLightbox } from '@/context/GameLightboxContext'`

Inside the component function (after line 39), add:
```tsx
const { openLightbox } = useGameLightbox()
```

The component's `value.game` type doesn't include all `Game` fields. The lightbox needs a full `Game` object. Since we can't guarantee that here, we'll need to find the game from the context's `allGames` list. Add after the openLightbox line:

```tsx
const { allGames } = useGameLightbox()
const fullGame = allGames.find((g) => g.slug.current === game.slug.current)
```

Replace the stretched Link (lines 45-49):
```tsx
      <Link
        href={`/games/${game.slug.current}`}
        className="absolute inset-0 z-0"
        aria-label={`View ${game.title}`}
      />
```
With:
```tsx
      <button
        onClick={() => fullGame && openLightbox(fullGame)}
        className="absolute inset-0 z-0 cursor-pointer"
        aria-label={`View ${game.title}`}
      />
```

**Step 3: GameOfMonth — replace Link CTA with onClick**

In `src/components/GameOfMonth.tsx`:

Remove `import Link from 'next/link'` (line 4, but keep motion import).

Add import: `import { useGameLightbox } from '@/context/GameLightboxContext'`

Inside the component function, add after line 55:
```tsx
const { openLightbox, allGames } = useGameLightbox()
const fullGame = allGames.find((g) => g.slug.current === game.slug.current)
```

Delete line 56: `const gameLink = `/games/${game.slug.current}``

Replace the CTA Link (lines 137-143):
```tsx
            <Link
              href={gameLink}
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-heading text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              {data.buttonLabel || 'Read more'}
              <span className="inline-block shrink-0 bg-current" style={{ width: '14px', height: '14px', WebkitMask: 'url(/images/icons/icon_arrow-next-right.svg) no-repeat center / contain', mask: 'url(/images/icons/icon_arrow-next-right.svg) no-repeat center / contain' }} />
            </Link>
```
With:
```tsx
            <button
              onClick={() => fullGame && openLightbox(fullGame)}
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-heading text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              {data.buttonLabel || 'Read more'}
              <span className="inline-block shrink-0 bg-current" style={{ width: '14px', height: '14px', WebkitMask: 'url(/images/icons/icon_arrow-next-right.svg) no-repeat center / contain', mask: 'url(/images/icons/icon_arrow-next-right.svg) no-repeat center / contain' }} />
            </button>
```

**Step 4: GamePromoCard (Skill Issue) — replace Link with onClick**

In `src/app/play/skill-issue/components/GamePromoCard.tsx`:

This component receives a `SanityGameCard` (not a full `Game` object). The `SanityGameCard` type has `slug: string` instead of `slug: { current: string }`. We need to find the full game from the context.

Remove `import Link from 'next/link'` (line 2).

Add import: `import { useGameLightbox } from '@/context/GameLightboxContext'`

Inside the component function (after line 12), add:
```tsx
const { openLightbox, allGames } = useGameLightbox()
const fullGame = allGames.find((g) => g.slug.current === game.slug)
```

Replace the "View More" Link (lines 42-47):
```tsx
          <Link
            href={`/games/${game.slug}`}
            className="rounded-full bg-primary/10 px-4 py-1.5 font-heading text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            View More
          </Link>
```
With:
```tsx
          <button
            onClick={() => fullGame && openLightbox(fullGame)}
            className="rounded-full bg-primary/10 px-4 py-1.5 font-heading text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            View More
          </button>
```

**Step 5: Verify no remaining /games/ Links**

Run: `grep -r '"/games/' src/ --include='*.tsx' | grep -v node_modules | grep -v '[slug]'`

Expected: Only the game library page link (`/games` without a slug) should remain (e.g., in `Header.tsx` nav).

**Step 6: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: clean

**Step 7: Commit**

```bash
git add src/components/GameTileCard.tsx src/components/GameReferenceBlock.tsx src/components/GameOfMonth.tsx src/app/play/skill-issue/components/GamePromoCard.tsx
git commit -m "refactor: replace all game detail Links with lightbox triggers"
```

---

### Task 6: Rewrite `/games/[slug]` as a thin server route

**Files:**
- Rewrite: `src/app/games/[slug]/page.tsx`
- Modify: `src/app/games/page.tsx`

**Step 1: Extract the library page as a shared client component**

Currently `src/app/games/page.tsx` is a `'use client'` component named `GamesPage`. We need it to accept an optional `initialLightboxSlug` prop.

In `src/app/games/page.tsx`, change the component signature (line 156):

From:
```tsx
export default function GamesPage() {
```
To:
```tsx
export default function GamesPage({ initialLightboxSlug }: { initialLightboxSlug?: string }) {
```

Add a `useEffect` that opens the lightbox when `initialLightboxSlug` is provided (after the existing `useEffect` that loads games, around line 170):

```tsx
  // Auto-open lightbox if initialLightboxSlug is provided (direct URL visit)
  const { openLightbox } = useGameLightbox()
  const initialSlugHandled = useRef(false)

  useEffect(() => {
    if (initialLightboxSlug && !initialSlugHandled.current && games.length > 0) {
      const match = games.find((g) => g.slug.current === initialLightboxSlug)
      if (match) {
        openLightbox(match)
        initialSlugHandled.current = true
      }
    }
  }, [initialLightboxSlug, games, openLightbox])
```

Add the import at the top:
```tsx
import { useGameLightbox } from '@/context/GameLightboxContext'
```

**Step 2: Rewrite `/games/[slug]/page.tsx` as a thin server route**

Replace the entire contents of `src/app/games/[slug]/page.tsx` with:

```tsx
import type { Metadata } from 'next'
import { getAllGames } from '@/lib/queries'
import GamesPage from '../page'

// ── Metadata ─────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const games = await getAllGames()
  const game = (games ?? []).find((g: any) => g.slug.current === slug)
  if (!game) return {}
  return {
    title: game.title,
    description: game.shortDescription,
    openGraph: {
      title: game.title,
      description: game.shortDescription,
      images: game.coverImage ? [{ url: game.coverImage }] : [],
    },
  }
}

// ── Page ─────────────────────────────────────────────────────────────────
export default async function GameSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <GamesPage initialLightboxSlug={slug} />
}
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```bash
git add src/app/games/page.tsx src/app/games/[slug]/page.tsx
git commit -m "feat: rewrite /games/[slug] as thin server route rendering library with lightbox"
```

---

### Task 7: Score badge refinements

**Files:**
- Modify: `src/components/GameTileCard.tsx`

**Step 1: Update ScoreBadge**

In the `ScoreBadge` component in `src/components/GameTileCard.tsx`:

Change the mask div's filter (line 26) from:
```tsx
filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
```
To:
```tsx
filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
```

Change the score text span (line 31) — shift `left: 24` to `left: 29` and add a dark pill background:
```tsx
      <span
        className="absolute font-heading font-black text-white rounded-full"
        style={{
          fontSize: 11, lineHeight: 1, left: 29, top: '50%', transform: 'translateY(-50%)',
          backgroundColor: 'rgba(0,0,0,0.3)', padding: '2px 4px',
        }}
      >
```

**Step 2: Commit**

```bash
git add src/components/GameTileCard.tsx
git commit -m "style: improve score badge legibility with drop shadow and dark pill"
```

---

### Task 8: Grid/List view toggle

**Files:**
- Modify: `src/app/games/page.tsx`

**Step 1: Add view state with localStorage persistence**

In `src/app/games/page.tsx`, after the existing state declarations (around line 163), add:

```tsx
const [view, setView] = useState<'grid' | 'list'>('grid')

// Restore view preference from localStorage
useEffect(() => {
  const saved = localStorage.getItem('ih-library-view')
  if (saved === 'grid' || saved === 'list') setView(saved)
}, [])

function toggleView(v: 'grid' | 'list') {
  setView(v)
  localStorage.setItem('ih-library-view', v)
}
```

**Step 2: Add toggle buttons to the header**

After the `<h1>Game Library</h1>` block (after line 260), inside the same flex container or nearby, add a toggle:

```tsx
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
            <button
              onClick={() => toggleView('grid')}
              className={`rounded-full p-1.5 transition-colors ${view === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Grid view"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                <rect x="1" y="1" width="6" height="6" rx="1" />
                <rect x="9" y="1" width="6" height="6" rx="1" />
                <rect x="1" y="9" width="6" height="6" rx="1" />
                <rect x="9" y="9" width="6" height="6" rx="1" />
              </svg>
            </button>
            <button
              onClick={() => toggleView('list')}
              className={`rounded-full p-1.5 transition-colors ${view === 'list' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="List view"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                <rect x="1" y="1" width="14" height="3" rx="1" />
                <rect x="1" y="6.5" width="14" height="3" rx="1" />
                <rect x="1" y="12" width="14" height="3" rx="1" />
              </svg>
            </button>
          </div>
```

**Step 3: Conditional grid/list rendering**

Replace the game grid section (lines 340-351) with:

```tsx
        {gamesLoading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-[360px] animate-pulse rounded-2xl bg-secondary" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          view === 'grid' ? (
            <motion.div layout className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((game) => (
                <motion.div key={game._id} layout transition={{ duration: 0.3 }}>
                  <GameTileCard game={game} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div layout className="mx-auto flex max-w-[860px] flex-col gap-5">
              {filtered.map((game) => (
                <motion.div key={game._id} layout transition={{ duration: 0.3 }}>
                  <GameListCard game={game} />
                </motion.div>
              ))}
            </motion.div>
          )
        ) : (
```

**Step 4: Create inline GameListCard component**

Add a `GameListCard` component in the same file (before `GamesPage`). This is the larger detailed card (same layout as the lightbox hero card, minus related games):

```tsx
function GameListCard({ game }: { game: Game }) {
  const { openLightbox } = useGameLightbox()

  return (
    <div
      onClick={() => openLightbox(game)}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="grid gap-0 sm:grid-cols-[1.2fr_1fr]">
        {/* Cover image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-secondary sm:aspect-auto sm:min-h-[220px]">
          {game.coverImage ? (
            <img src={game.coverImage} alt={game.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
              <span className="font-heading text-muted-foreground">No image</span>
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="flex flex-col justify-center p-5 sm:p-6">
          <h3 className="font-heading text-xl font-bold text-foreground">
            {game.title}
          </h3>
          {(game.genre ?? []).length > 0 && (
            <p className="mt-1 font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {(game.genre ?? []).join(' · ')}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {game.openCriticScore != null && (
              <span className={`rounded-full px-2.5 py-0.5 font-heading text-xs font-bold shadow ${game.openCriticScore >= 90 ? 'bg-purple-600 text-white' : game.openCriticScore >= 75 ? 'bg-green-500 text-white' : game.openCriticScore >= 50 ? 'bg-green-700 text-white' : 'bg-blue-500 text-white'}`}>
                {game.openCriticScore} OpenCritic
              </span>
            )}
            {game.coop && (
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-heading text-[10px] font-medium text-accent-green">
                Co-op
              </span>
            )}
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {game.shortDescription}
          </p>
          {(game.platforms ?? []).length > 0 && (
            <p className="mt-2 text-[11px] tracking-wide text-muted-foreground">
              {(game.platforms ?? []).join(' · ')}
            </p>
          )}
          <span className="mt-3 text-[11px] font-heading font-semibold uppercase tracking-wider text-muted-foreground/50 transition-colors group-hover:text-primary">
            View Game
          </span>
        </div>
      </div>
    </div>
  )
}
```

**Step 5: Verify TypeScript compiles and build succeeds**

Run: `npx tsc --noEmit && npm run build`

**Step 6: Commit**

```bash
git add src/app/games/page.tsx
git commit -m "feat: add grid/list view toggle with localStorage persistence"
```

---

### Task 9: Final verification and cleanup

**Files:**
- All modified files

**Step 1: Full grep for stale references**

```bash
# Check no remaining /games/[slug] Links
grep -rn '"/games/' src/ --include='*.tsx' | grep -v node_modules | grep -v '\[slug\]' | grep -v '"/games"'

# Check no remaining longDescription references
grep -rn 'longDescription' src/ --include='*.ts' --include='*.tsx'

# Check no remaining getGame references
grep -rn 'getGame' src/ --include='*.ts' --include='*.tsx'

# Check no remaining PortableText in game pages
grep -rn 'PortableText' src/app/games/ --include='*.tsx'
```

Expected: No matches for any of these.

**Step 2: Full build**

Run: `npm run build`
Expected: Clean build, all pages render.

**Step 3: Commit any cleanup**

```bash
git add -A
git commit -m "chore: final cleanup — remove stale references"
```
