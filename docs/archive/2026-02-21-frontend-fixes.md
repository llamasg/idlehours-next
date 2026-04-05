# Frontend Fixes — Blog Layout, Posts Rename, Game Filters, Game Reference Block

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Four targeted UI/UX fixes: restructure blog post header, rename Guides→Posts with new categories, overhaul game library filters, add Game Reference block to blog rich text.

**Architecture:** All changes are frontend-only except Task 4 (Sanity schema for gameReference) and Task 5 (GROQ query expansion). No new routes, no new pages. Task 6 adds one new component file. The Sanity Studio build must be rebuilt and deployed after Task 4.

**Tech Stack:** React + TypeScript + Tailwind, Sanity (schema + GROQ), `@portabletext/react`, `framer-motion`, Vite. Working directory: `d:/websites/IdleHours`. Run `npx tsc --noEmit` after every task to verify TypeScript.

---

## Task 1: Fix blog post header — title below image

**Files:**
- Modify: `src/pages/blogpostpage.tsx`

**What the current code does:**
- `analyzeHeaderBrightness()` function (lines 19–44) draws image to canvas, samples brightness, sets `darkHeaderText` state
- Image is `h-[70vh]` with a `bg-gradient-to-t from-black` overlay
- Title/subtitle/meta are in a content div with `-mt-32 relative z-10` — they visually overlap the gradient at the bottom of the image
- "Back to blog" button is `absolute top-8 left-8` over the image

**What to change:**

Remove entirely:
- The `analyzeHeaderBrightness` function (lines 19–44)
- `darkHeaderText` state + `headerTextClass` + `headerTextStyle` variables
- The gradient overlay `<div>` inside the image container
- The `absolute` back button that sits over the image
- The `-mt-32 relative z-10` on the content div

New layout structure:
```tsx
<article>
  {/* Full-width header image — no overlay, no text */}
  <div className="w-full">
    <img
      src={post.headerImage}
      alt={post.title}
      className="w-full max-h-[70vh] object-cover"
    />
  </div>

  {/* Content column */}
  <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
    {/* Back button — in content column, not over image */}
    <Link
      to="/blog"
      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back to Blog
    </Link>

    {/* Categories */}
    {post.categories && post.categories.length > 0 && (
      <div className="flex gap-2 mb-4 flex-wrap">
        {post.categories.map((cat: string) => (
          <span key={cat} className="bg-accent/20 text-accent px-3 py-1 rounded-full text-xs border border-accent/30">
            {cat}
          </span>
        ))}
      </div>
    )}

    {/* Title */}
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-foreground">
      {post.title}
    </h1>

    {/* Subheader */}
    <p className="text-xl md:text-2xl mb-6 leading-relaxed text-muted-foreground">
      {post.subheader}
    </p>

    {/* Meta */}
    <div className="flex items-center gap-2 text-muted-foreground mb-8 pb-8 border-b border-border text-sm">
      <span>{estimateReadTime(post.body)}</span>
      <span>·</span>
      <span>
        {new Date(post.publishedAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </span>
    </div>

    {/* Affiliate Disclosure */}
    {post.affiliateDisclosureRequired && <DisclosureBanner />}

    {/* Body Content */}
    <div className="prose prose-invert max-w-none">
      <PortableText value={post.body} components={components} />
    </div>

    {/* ... rest of the existing JSX (otherPosts section + bottom back link) unchanged ... */}
  </div>
</article>
```

**Step 1: Apply the layout change**

Open `src/pages/blogpostpage.tsx` and make these changes:

1. Delete the `analyzeHeaderBrightness` function (lines 19–44, the entire function)
2. Remove these lines from `BlogPostPage()`:
   ```tsx
   const [darkHeaderText, setDarkHeaderText] = useState(false)
   const headerTextClass = darkHeaderText ? 'text-stone-900' : 'text-white'
   const headerTextStyle = darkHeaderText ? {} : { textShadow: '0 1px 3px rgba(0,0,0,0.6)' }
   ```
3. In the `useEffect`, remove the brightness analysis call:
   ```tsx
   // DELETE this block:
   if (data?.headerImage) {
     analyzeHeaderBrightness(data.headerImage, setDarkHeaderText)
   }
   ```
4. Replace the entire `<article>` JSX (from `<article>` to `</article>`) with the new layout shown above. Keep the `otherPosts` grid and bottom "Back to all posts" link inside the content column unchanged.

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/pages/blogpostpage.tsx
git commit -m "fix: move blog post title below header image, remove brightness detection"
```

---

## Task 2: Rename Guides → Posts, update filter categories

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/pages/blogpage.tsx`

### Header.tsx

Change the nav link label from `'Guides'` to `'Posts'`:

```tsx
// Line 9 — change:
{ label: 'Guides', href: '/blog' },
// To:
{ label: 'Posts', href: '/blog' },
```

(Route stays `/blog` — no routing changes needed.)

### blogpage.tsx

**Step 1: Update categories array (line 23)**

```tsx
// Change:
const categories = ["All", "Guides", "Opinions", "Care & Display"];
// To:
const categories = ["All", "Lists", "Opinions", "Recommendations"];
```

**Step 2: Update page heading (line 100)**

```tsx
// Change:
<h1 className="mb-4 font-heading text-4xl font-black text-foreground md:text-5xl lg:text-6xl">
  Guides & Gentle Reads
</h1>
// To:
<h1 className="mb-4 font-heading text-4xl font-black text-foreground md:text-5xl lg:text-6xl">
  Posts
</h1>
```

**Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 4: Commit**

```bash
git add src/components/Header.tsx src/pages/blogpage.tsx
git commit -m "fix: rename Guides to Posts in nav and page, update filter categories"
```

---

## Task 3: Game library — dropdown filters and expanded sort

**Files:**
- Modify: `src/pages/gamespage.tsx`

**What to remove:**
- The `platforms` array const at the top
- The `sortOptions` array const at the top
- Platform pill button loop (the `{platforms.map(...)}` block)
- The old sort `<select>` with 3 options
- The `activeFilters` count variable
- The `<Filter>` icon import (if no longer used)

**What to add:**

A `FilterSelect` component (define it locally at the top of the file, above `GamesPage`):

```tsx
// ── FilterSelect — searchable dropdown ───────────────────────────────────────
interface FilterSelectProps {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); setQuery('') }}
        className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-heading text-xs text-foreground hover:bg-secondary transition-colors"
      >
        <span className="text-muted-foreground">{label}:</span>
        <span className={value === 'All' ? 'text-muted-foreground' : 'text-primary font-semibold'}>{value}</span>
        <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 w-44 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to filter..."
              className="w-full rounded-lg bg-muted/40 px-2 py-1 font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((o) => (
              <button
                key={o}
                onClick={() => { onChange(o); setOpen(false) }}
                className={`w-full px-3 py-2 text-left font-heading text-xs transition-colors hover:bg-secondary ${
                  o === value ? 'text-primary font-semibold bg-primary/5' : 'text-foreground'
                }`}
              >
                {o}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">No matches</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```

**New state additions:**

```tsx
const [genre, setGenre] = useState('All')
```

(Keep existing: `search`, `platform`, `sort`, `coopOnly`, `games`, `gamesLoading`)

**Derive genre options from loaded games data:**

```tsx
const genreOptions = useMemo(() => {
  const all = new Set<string>()
  games.forEach((g) => (g.genre ?? []).forEach((gen) => all.add(gen)))
  return ['All', ...Array.from(all).sort()]
}, [games])
```

**Add genre filter to the `filtered` useMemo:**

```tsx
// Add after the co-op filter block:
if (genre !== 'All') {
  result = result.filter((g) => (g.genre ?? []).includes(genre))
}
```

**New sort options and sort logic:**

```tsx
// Replace sortOptions const and sort logic in the filtered useMemo
// Sort values:
// score-desc, score-asc, replay-desc, replay-asc,
// diff-asc (Beginner first), diff-desc (Experienced first),
// price-asc, price-desc, date-desc, date-asc
```

Sort logic in `filtered` useMemo (replace the existing sort block):

```tsx
// Sort
const nullLast = (a: number | null | undefined, b: number | null | undefined, dir: 1 | -1) => {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return (a - b) * dir
}

if (sort === 'score-desc') result.sort((a, b) => nullLast(b.openCriticScore, a.openCriticScore, 1))
else if (sort === 'score-asc') result.sort((a, b) => nullLast(a.openCriticScore, b.openCriticScore, 1))
else if (sort === 'replay-desc') result.sort((a, b) => nullLast(b.replayability, a.replayability, 1))
else if (sort === 'replay-asc') result.sort((a, b) => nullLast(a.replayability, b.replayability, 1))
else if (sort === 'diff-asc') result.sort((a, b) => nullLast(a.difficulty, b.difficulty, 1))
else if (sort === 'diff-desc') result.sort((a, b) => nullLast(b.difficulty, a.difficulty, 1))
else if (sort === 'price-asc') {
  result.sort((a, b) => {
    const pa = a.isFree ? 0 : (a.currentPrice ?? Infinity)
    const pb = b.isFree ? 0 : (b.currentPrice ?? Infinity)
    return pa - pb
  })
} else if (sort === 'price-desc') {
  result.sort((a, b) => {
    const pa = a.isFree ? 0 : (a.currentPrice ?? -Infinity)
    const pb = b.isFree ? 0 : (b.currentPrice ?? -Infinity)
    return pb - pa
  })
} else if (sort === 'date-desc') {
  result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
} else if (sort === 'date-asc') {
  result.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
}
```

Change default sort state from `'score'` to `'score-desc'`:
```tsx
const [sort, setSort] = useState('score-desc')
```

**New filter row JSX** (replace the entire "Search + Filters" section):

```tsx
{/* Search + Filters */}
<div className="mb-6 space-y-3">
  {/* Search bar */}
  <div className="relative max-w-md">
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search games, tags..."
      className="w-full rounded-full border border-border bg-card py-2.5 pl-9 pr-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    />
    {search && (
      <button
        onClick={() => setSearch('')}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        <X size={14} />
      </button>
    )}
  </div>

  {/* Filter row */}
  <div className="flex flex-wrap items-center gap-2">
    <FilterSelect
      label="Platform"
      value={platform}
      options={['All', 'PC', 'Switch', 'PS5', 'Xbox', 'Mobile']}
      onChange={setPlatform}
    />
    <FilterSelect
      label="Genre"
      value={genre}
      options={genreOptions}
      onChange={setGenre}
    />

    {/* Co-op toggle */}
    <button
      onClick={() => setCoopOnly(!coopOnly)}
      className={`rounded-full border px-3 py-1.5 font-heading text-xs font-medium transition-colors ${
        coopOnly
          ? 'border-accent-green bg-accent-green text-white'
          : 'border-border bg-card text-muted-foreground hover:bg-secondary'
      }`}
    >
      Co-op only
    </button>
  </div>

  {/* Sort row */}
  <div className="flex items-center gap-2">
    <span className="font-heading text-xs text-muted-foreground">Sort:</span>
    <select
      value={sort}
      onChange={(e) => setSort(e.target.value)}
      className="rounded-full border border-border bg-card px-3 py-1.5 font-heading text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="score-desc">OC Score: High → Low</option>
      <option value="score-asc">OC Score: Low → High</option>
      <option value="replay-desc">Replayability: High → Low</option>
      <option value="replay-asc">Replayability: Low → High</option>
      <option value="diff-asc">Difficulty: Beginner first</option>
      <option value="diff-desc">Difficulty: Experienced first</option>
      <option value="price-asc">Price: Low → High</option>
      <option value="price-desc">Price: High → Low</option>
      <option value="date-desc">Release: Newest</option>
      <option value="date-asc">Release: Oldest</option>
    </select>
  </div>
</div>
```

Also update imports at the top: add `useRef` to the React import line (needed by `FilterSelect`):
```tsx
import { useState, useMemo, useEffect, useRef } from 'react'
```

Remove `Filter` from the lucide import (it's no longer used):
```tsx
import { Search, X } from 'lucide-react'
```

**Step 1: Implement all of the above**

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/pages/gamespage.tsx
git commit -m "feat: replace platform pills with searchable dropdowns and expand sort options in game library"
```

---

## Task 4: Add gameReference block to Sanity post schema

**Files:**
- Modify: `studio/schemaTypes/post.ts`

Add a new block to the `body` array, after the `productCallout` block (before the closing `]` of the `of` array):

```ts
// Game Reference
{
  type: 'object',
  name: 'gameReference',
  title: 'Game Reference',
  fields: [
    {
      name: 'game',
      type: 'reference',
      to: [{type: 'game'}],
      title: 'Game',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'position',
      type: 'number',
      title: 'Position (optional)',
      description: 'Position number e.g. 1 = #1 in a top list',
      validation: (Rule: any) => Rule.integer().min(1),
    },
  ],
  preview: {
    select: {
      gameName: 'game.title',
      position: 'position',
    },
    prepare({gameName, position}: {gameName?: string; position?: number}) {
      return {
        title: position ? `#${position} — ${gameName || 'Select game'}` : (gameName || 'Select game'),
        subtitle: 'Game Reference',
      }
    },
  },
},
```

**Step 1: Add the block to post.ts**

**Step 2: Build the studio locally to verify no schema errors**

```bash
cd studio && npm run build 2>&1 | tail -5
```
Expected: build succeeds, `fix-paths.js` runs cleanly

**Step 3: Commit**

```bash
git add studio/schemaTypes/post.ts studio/dist
git commit -m "feat: add gameReference block type to blog post body schema"
```

> **Note for deployment:** After this task, the updated `studio/dist/` is committed. The user must run `node deploy.js studio` and enter the FTP password to push the new studio build live.

---

## Task 5: Expand getPost GROQ to resolve gameReference

**Files:**
- Modify: `src/lib/queries.ts`

In the `getPost` function, the `body[]` projection already expands `productCallout`. Add a parallel expansion for `gameReference`:

```ts
// In getPost, inside body[]{...} projection, add after the inlineImage block:
_type == "gameReference" => {
  ...,
  game-> {
    _id,
    title,
    slug,
    "coverImage": coverImage.asset->url,
    shortDescription,
    platforms,
    genre,
    coop,
    openCriticScore,
    difficulty,
    replayability,
    greatSoundtrack,
    currentPrice,
    isFree,
    affiliateLinks
  }
},
```

The full `body[]` projection in `getPost` will look like:

```ts
body[]{
  ...,
  _type == "productCallout" => {
    ...,
    product-> {
      _id,
      name,
      slug,
      "image": image.asset->url,
      shortBlurb,
      etsyUrl,
      badge,
      priceNote
    }
  },
  _type == "inlineImage" => {
    ...,
    "asset": asset->
  },
  _type == "gameReference" => {
    ...,
    game-> {
      _id,
      title,
      slug,
      "coverImage": coverImage.asset->url,
      shortDescription,
      platforms,
      genre,
      coop,
      openCriticScore,
      difficulty,
      replayability,
      greatSoundtrack,
      currentPrice,
      isFree,
      affiliateLinks
    }
  }
},
```

**Step 1: Apply the edit**

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat: expand getPost GROQ to resolve gameReference game document"
```

---

## Task 6: GameReferenceBlock component + wire into blogpostpage

**Files:**
- Create: `src/components/GameReferenceBlock.tsx`
- Modify: `src/pages/blogpostpage.tsx`

### GameReferenceBlock.tsx

```tsx
// src/components/GameReferenceBlock.tsx

import { Link } from 'react-router-dom'
import { Disc3 } from 'lucide-react'

// ── Helpers (mirrors gamedetailpage.tsx) ─────────────────────────────────────

function ocColor(score: number): string {
  if (score >= 90) return 'bg-purple-600 text-white'
  if (score >= 75) return 'bg-rose-500 text-white'
  if (score >= 50) return 'bg-green-600 text-white'
  return 'bg-blue-500 text-white'
}

function DifficultyLabel({ level }: { level: 1 | 2 | 3 }) {
  const labels = { 1: 'Beginner', 2: 'Intermediate', 3: 'Experienced' } as const
  const colors = { 1: 'text-green-400', 2: 'text-amber-400', 3: 'text-red-400' } as const
  return (
    <span className={`font-heading text-xs font-semibold ${colors[level]}`}>
      {labels[level]}
    </span>
  )
}

// ── GameReferenceBlock ────────────────────────────────────────────────────────

interface GameReferenceValue {
  game?: {
    _id: string
    title: string
    slug: { current: string }
    coverImage?: string
    shortDescription: string
    platforms?: string[]
    genre?: string[]
    coop?: boolean
    openCriticScore?: number
    difficulty?: 1 | 2 | 3
    replayability?: number
    greatSoundtrack?: boolean
    currentPrice?: number
    isFree?: boolean
    affiliateLinks?: { label: string; url: string }[]
  }
  position?: number
}

export default function GameReferenceBlock({ value }: { value: GameReferenceValue }) {
  const game = value?.game
  if (!game) return null

  return (
    <div className="my-8 rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="flex gap-0 flex-col sm:flex-row">
        {/* Cover image */}
        <div className="relative shrink-0 sm:w-48">
          {game.coverImage ? (
            <img
              src={game.coverImage}
              alt={game.title}
              className="w-full h-40 sm:h-full object-cover"
            />
          ) : (
            <div className="w-full h-40 sm:h-full bg-secondary flex items-center justify-center">
              <span className="font-heading text-xs text-muted-foreground">No image</span>
            </div>
          )}
          {/* OC badge */}
          {game.openCriticScore != null && (
            <div className={`absolute bottom-2 left-2 rounded-full px-2 py-0.5 font-heading text-xs font-bold shadow ${ocColor(game.openCriticScore)}`}>
              {game.openCriticScore} OC
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 p-5">
          {/* Position + title */}
          <div className="flex items-start gap-3 mb-2">
            {value.position != null && (
              <span className="font-heading text-3xl font-black text-primary/30 leading-none shrink-0">
                {value.position}.
              </span>
            )}
            <Link to={`/games/${game.slug.current}`} className="hover:text-primary transition-colors">
              <h3 className="font-heading text-xl font-bold text-foreground leading-tight">
                {game.title}
              </h3>
            </Link>
          </div>

          {/* Short description */}
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">
            {game.shortDescription}
          </p>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {game.difficulty != null && <DifficultyLabel level={game.difficulty} />}
            {game.replayability != null && (
              <span className="font-heading text-xs text-muted-foreground">
                Replay: {game.replayability}/5
              </span>
            )}
            {game.greatSoundtrack && (
              <span title="Great Soundtrack" className="flex items-center gap-1 font-heading text-xs text-accent">
                <Disc3 size={12} className="fill-accent/20" />
                Soundtrack
              </span>
            )}
            {game.coop && (
              <span className="rounded-full bg-accent-green/20 px-2 py-0.5 font-heading text-[10px] font-semibold text-accent-green">
                Co-op
              </span>
            )}
          </div>

          {/* Platforms */}
          {game.platforms && game.platforms.length > 0 && (
            <p className="font-heading text-[10px] text-muted-foreground mb-3">
              {game.platforms.join(' · ')}
            </p>
          )}

          {/* Buy links */}
          {game.affiliateLinks && game.affiliateLinks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {game.affiliateLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-border px-3 py-1 font-heading text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

### blogpostpage.tsx — register the renderer

Add import at the top:
```tsx
import GameReferenceBlock from '@/components/GameReferenceBlock'
```

Add `gameReference` to the `components.types` object:
```tsx
gameReference: ({ value }: any) => <GameReferenceBlock value={value} />,
```

**Step 1: Create `src/components/GameReferenceBlock.tsx`**

**Step 2: Add import + register renderer in blogpostpage.tsx**

**Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 4: Commit**

```bash
git add src/components/GameReferenceBlock.tsx src/pages/blogpostpage.tsx
git commit -m "feat: add GameReferenceBlock component and register in blog post portable text renderer"
```

---

## Task 7: Build site + studio, then deploy both

**Files:**
- Run commands only

**Step 1: Build everything**

```bash
npm run build:all
```

Expected: TypeScript compiles, Vite bundles, Sanity Studio builds with path fix applied

**Step 2: Deploy**

```bash
node deploy.js all
```

When prompted for FTP password, enter it. This uploads both `dist/` (site) and `studio/dist/` (studio) to Hostinger.

Expected output: upload complete for both site and studio targets.

**Step 3: Verify**

Check these at `https://idlehours.co.uk`:
1. Blog post page shows title below image, not overlaid
2. "Back to Blog" is in the content column, not floating over the image
3. Nav shows "Posts" not "Guides"
4. Posts page filter pills read: All / Lists / Opinions / Recommendations
5. Game library has Platform dropdown, Genre dropdown, Co-op toggle, expanded Sort select
6. Sanity Studio at `/studio` — open a blog post body, verify "Game Reference" appears in the block insert menu
7. Add a Game Reference block, pick a game — the card shows in the editor preview
