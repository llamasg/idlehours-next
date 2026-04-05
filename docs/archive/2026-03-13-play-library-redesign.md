# Play & Library Page Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign `/play` as a section-based game hub with daily badge sync, and `/games` with a curated Browse tab powered by a Sanity CMS singleton — both sharing new editorial components (StickyNote, PullQuote, FeaturedBanner).

**Architecture:** Sanity singleton `gameLibrary` stores curated rows, featured pick, feature banners, and notes. `/play` is a client component reading localStorage for badge state. `/games` adds a tab toggle — Browse (new, fetches from Sanity) and Library (existing filter/grid page, unchanged). Shared components live in `src/components/`.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, Sanity CMS (GROQ), Framer Motion, existing animation helpers (`entrance`, `useEntranceSteps`)

**Design doc:** `docs/plans/2026-03-13-play-library-redesign-design.md`

**Reference mockups:**
- `/play`: `docs/plans/testing/idle-hours-play-v7.html`
- `/games` browse: `docs/plans/testing/games-browse-mode.html`

---

## Task 1: Sanity Schema — `gameLibrary` singleton

**Files:**
- Create: `studio/schemaTypes/gameLibrary.ts`
- Modify: `studio/schemaTypes/index.ts`
- Modify: `studio/sanity.config.ts`

**Step 1: Create the schema file**

Create `studio/schemaTypes/gameLibrary.ts`:

```ts
import {defineType, defineField, defineArrayMember} from 'sanity'

export const curatedRowGame = defineType({
  name: 'curatedRowGame',
  title: 'Curated Row Game',
  type: 'object',
  fields: [
    defineField({
      name: 'game',
      title: 'Game',
      type: 'reference',
      to: [{type: 'game'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isStaffPick',
      title: 'Staff Pick',
      description: 'Displays this game with a prominent stipple popup card instead of a standard tile',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'game.title',
      media: 'game.coverImage',
      isStaffPick: 'isStaffPick',
    },
    prepare({title, media, isStaffPick}) {
      return {
        title: title ?? 'No game selected',
        subtitle: isStaffPick ? '⭐ Staff Pick' : undefined,
        media,
      }
    },
  },
})

export const curatedRow = defineType({
  name: 'curatedRow',
  title: 'Curated Row',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Row Title',
      description: 'Supports *italic* with asterisks for styled emphasis',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'games',
      title: 'Games',
      type: 'array',
      of: [defineArrayMember({type: 'curatedRowGame'})],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'noteEnabled',
      title: 'Show Note',
      description: 'Add an editorial note at the end of this row',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'noteStyle',
      title: 'Note Style',
      type: 'string',
      options: {
        list: [
          {title: 'Simple Note', value: 'simple'},
          {title: 'Recipe / How-to', value: 'recipe'},
          {title: 'Pull Quote', value: 'pullQuote'},
        ],
        layout: 'radio',
      },
      hidden: ({parent}) => !parent?.noteEnabled,
      initialValue: 'simple',
    }),
    defineField({
      name: 'noteContent',
      title: 'Note Content',
      description: 'Use headings for note title/subtitle. Use bullets or numbers for recipe steps.',
      type: 'array',
      of: [{type: 'block'}],
      hidden: ({parent}) => !parent?.noteEnabled,
    }),
    defineField({
      name: 'noteAuthor',
      title: 'Note Author',
      description: 'For pull quotes — e.g. "Beth · Idle Hours"',
      type: 'string',
      hidden: ({parent}) => parent?.noteStyle !== 'pullQuote',
    }),
  ],
  preview: {
    select: {title: 'title'},
    prepare({title}) {
      return {title: title ?? 'Untitled Row'}
    },
  },
})

export const featureBanner = defineType({
  name: 'featureBanner',
  title: 'Feature Banner',
  type: 'object',
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'linkedPost',
      title: 'Linked Blog Post',
      description: 'Button links to this post',
      type: 'reference',
      to: [{type: 'post'}],
    }),
    defineField({
      name: 'buttonLabel',
      title: 'Button Label',
      type: 'string',
      initialValue: 'Read more →',
    }),
  ],
  preview: {
    select: {title: 'headline'},
    prepare({title}) {
      return {title: `🏷️ ${title ?? 'Banner'}`}
    },
  },
})

export default defineType({
  name: 'gameLibrary',
  title: 'Game Library',
  type: 'document',
  fields: [
    defineField({
      name: 'featuredPick',
      title: 'Featured Pick',
      description: 'The hero banner at the top of the Browse tab',
      type: 'object',
      fields: [
        defineField({
          name: 'game',
          title: 'Game',
          type: 'reference',
          to: [{type: 'game'}],
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'eyebrow',
          title: 'Eyebrow Text',
          description: 'e.g. "Beth\'s pick this week"',
          type: 'string',
          initialValue: "Beth's pick this week",
        }),
        defineField({
          name: 'quote',
          title: 'Quote / Note',
          description: 'Shown on a sticky note overlaying the game cover',
          type: 'text',
          rows: 3,
        }),
      ],
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      description: 'Drag to reorder. Mix curated rows and feature banners.',
      type: 'array',
      of: [
        defineArrayMember({type: 'curatedRow'}),
        defineArrayMember({type: 'featureBanner'}),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Game Library'}
    },
  },
})
```

**Step 2: Register in schema index**

Modify `studio/schemaTypes/index.ts` — add import and include all 4 exported types:

```ts
import gameLibrary, {curatedRow, curatedRowGame, featureBanner} from './gameLibrary'

// Add to schemaTypes array:
gameLibrary,
curatedRow,
curatedRowGame,
featureBanner,
```

**Step 3: Register as singleton**

Modify `studio/sanity.config.ts`:

1. Add `'gameLibrary'` to the `singletons` Set
2. Add a list item before the divider:

```ts
S.listItem()
  .title('Game Library')
  .id('gameLibrary')
  .child(
    S.document()
      .schemaType('gameLibrary')
      .documentId('gameLibrary')
  ),
```

**Step 4: Build and verify Studio**

Run: `cd studio && npm run build`
Expected: Clean build, no schema errors

**Step 5: Commit**

```bash
git add studio/schemaTypes/gameLibrary.ts studio/schemaTypes/index.ts studio/sanity.config.ts
git commit -m "feat: add gameLibrary Sanity schema (singleton with curated rows, banners, featured pick)"
```

---

## Task 2: GROQ Query — `getGameLibrary()`

**Files:**
- Modify: `src/lib/queries.ts`

**Step 1: Add the query**

Add to end of `src/lib/queries.ts`:

```ts
// Get game library browse page (singleton)
export async function getGameLibrary() {
  const library = await client.fetch(`
    *[_type == "gameLibrary"][0] {
      _id,
      featuredPick {
        game-> {
          _id, title, slug, "coverImage": coverImage.asset->url,
          shortDescription, "platforms": coalesce(platforms, []),
          "genre": coalesce(genre, []), coop, openCriticScore,
          difficulty, greatSoundtrack, currentPrice, isFree,
          "affiliateLinks": coalesce(affiliateLinks, [])
        },
        eyebrow,
        quote
      },
      sections[] {
        _key,
        _type,

        // curatedRow
        _type == "curatedRow" => {
          title,
          "games": games[] {
            isStaffPick,
            game-> {
              _id, title, slug, "coverImage": coverImage.asset->url,
              shortDescription, "platforms": coalesce(platforms, []),
              "genre": coalesce(genre, []), coop, openCriticScore,
              difficulty, greatSoundtrack, currentPrice, isFree,
              "affiliateLinks": coalesce(affiliateLinks, []),
              featured, publishedAt
            }
          },
          noteEnabled,
          noteStyle,
          noteContent,
          noteAuthor
        },

        // featureBanner
        _type == "featureBanner" => {
          headline,
          subtitle,
          linkedPost-> { _id, title, slug },
          buttonLabel
        }
      }
    }
  `)
  return library
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Clean build (query won't return data yet, but no type errors)

**Step 3: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat: add getGameLibrary() GROQ query for browse page"
```

---

## Task 3: Shared Component — `StickyNote`

**Files:**
- Create: `src/components/StickyNote.tsx`

**Step 1: Create the component**

The StickyNote component renders editorial notes with the stipple dot texture, dog-ear corner fold, and slight rotation. It accepts Portable Text content or simple string props.

```tsx
'use client'

import type { PortableTextBlock } from '@portabletext/types'
import { PortableText } from '@portabletext/react'

interface StickyNoteProps {
  /** Portable Text content from Sanity */
  content?: PortableTextBlock[]
  /** Simple text fallback (if not using Portable Text) */
  title?: string
  subtitle?: string
  body?: string
  /** Rotation in degrees — default -1 */
  rotate?: number
  className?: string
}

export default function StickyNote({
  content,
  title,
  subtitle,
  body,
  rotate = -1,
  className = '',
}: StickyNoteProps) {
  return (
    <div
      className={`relative flex-shrink-0 rounded-[4px_16px_16px_16px] p-5 shadow-[0_4px_14px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.08)] ${className}`}
      style={{
        backgroundColor: 'hsl(45 33% 93%)',
        backgroundImage: 'radial-gradient(circle, rgba(26,26,20,0.07) 1px, transparent 1px)',
        backgroundSize: '10px 10px',
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {/* Dog-ear fold */}
      <div
        className="absolute top-0 right-0 h-0 w-0"
        style={{
          borderStyle: 'solid',
          borderWidth: '0 18px 18px 0',
          borderColor: 'transparent hsl(42 25% 83%) transparent transparent',
          borderRadius: '0 16px 0 0',
        }}
      />
      <div
        className="absolute top-0 right-0 h-[18px] w-[18px] rounded-[0_16px_0_0]"
        style={{
          background: 'hsl(var(--background))',
          clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
        }}
      />

      {/* Content */}
      {content ? (
        <div className="sticky-note-content font-heading text-sm leading-relaxed text-[hsl(var(--foreground))]/80 [&_h2]:mb-1 [&_h2]:text-[15px] [&_h2]:font-black [&_h2]:text-[hsl(var(--foreground))] [&_h3]:mb-1 [&_h3]:text-[11px] [&_h3]:font-extrabold [&_h3]:uppercase [&_h3]:tracking-[0.2em] [&_h3]:text-[hsl(var(--foreground))]/50 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:marker:font-bold [&_ol]:marker:text-amber-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-amber-600">
          <PortableText value={content} />
        </div>
      ) : (
        <>
          {subtitle && (
            <p className="mb-1 font-heading text-[9px] font-black uppercase tracking-[0.2em] text-foreground/50">
              {subtitle}
            </p>
          )}
          {title && (
            <p className="mb-1.5 font-heading text-[15px] font-black text-foreground">
              {title}
            </p>
          )}
          {body && (
            <p className="font-heading text-[12px] font-semibold leading-relaxed text-foreground/70">
              {body}
            </p>
          )}
        </>
      )}
    </div>
  )
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Clean build

**Step 3: Commit**

```bash
git add src/components/StickyNote.tsx
git commit -m "feat: add StickyNote component with stipple texture and dog-ear fold"
```

---

## Task 4: Shared Component — `PullQuote`

**Files:**
- Create: `src/components/PullQuote.tsx`

**Step 1: Create the component**

```tsx
interface PullQuoteProps {
  text: string
  author: string
  className?: string
}

export default function PullQuote({ text, author, className = '' }: PullQuoteProps) {
  return (
    <div
      className={`relative rounded-[0_14px_14px_0] border-l-4 border-amber-600 p-6 shadow-[0_4px_16px_rgba(0,0,0,0.08)] ${className}`}
      style={{
        backgroundColor: 'hsl(45 33% 93%)',
        backgroundImage: 'radial-gradient(circle, rgba(26,26,20,0.07) 1px, transparent 1px)',
        backgroundSize: '10px 10px',
        transform: 'rotate(-0.5deg)',
      }}
    >
      <p className="mb-3 font-heading text-lg font-bold italic leading-relaxed text-foreground sm:text-xl">
        &ldquo;{text}&rdquo;
      </p>
      <p className="font-heading text-xs font-extrabold uppercase tracking-[0.12em] text-amber-600">
        {author}
      </p>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/PullQuote.tsx
git commit -m "feat: add PullQuote component with amber border and stipple texture"
```

---

## Task 5: Shared Component — `FeaturedBanner`

**Files:**
- Create: `src/components/FeaturedBanner.tsx`

**Step 1: Create the component**

This is the dark hero banner for the browse tab's featured pick. Two-column: editorial left, game cover + Beth's sticky note right.

```tsx
'use client'

import Link from 'next/link'
import StickyNote from './StickyNote'
import type { Game } from '@/types'

interface FeaturedBannerProps {
  game: Game
  eyebrow: string
  quote?: string
}

export default function FeaturedBanner({ game, eyebrow, quote }: FeaturedBannerProps) {
  // Generate a gradient from the game's genre or fallback
  const coverGradient = 'linear-gradient(155deg, #3d8c3d, #1a3a1a)'

  return (
    <div className="overflow-hidden rounded-[20px] bg-foreground">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px]">
        {/* Left: editorial */}
        <div className="flex flex-col justify-center p-8 lg:p-12">
          <p className="mb-4 flex items-center gap-2 font-heading text-[10px] font-extrabold uppercase tracking-[0.3em] text-amber-500">
            <span className="block h-0.5 w-5 bg-amber-500" />
            {eyebrow}
          </p>
          <h2 className="mb-4 font-heading text-4xl font-black leading-[0.92] tracking-tight text-white lg:text-5xl">
            {game.title}
          </h2>
          <p className="mb-6 max-w-[380px] text-[15px] font-semibold italic leading-relaxed text-white/55">
            {game.shortDescription}
          </p>
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {(game.platforms ?? []).length > 0 && (
              <span className="rounded-full border border-white/12 bg-white/8 px-3.5 py-1.5 font-heading text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/55">
                {(game.platforms ?? []).join(' · ')}
              </span>
            )}
            {(game.genre ?? []).length > 0 && (
              <span className="rounded-full border border-white/12 bg-white/8 px-3.5 py-1.5 font-heading text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/55">
                {(game.genre ?? []).join(' · ')}
              </span>
            )}
            {game.openCriticScore != null && (
              <span className="rounded-full border border-amber-500/25 bg-amber-500/15 px-3.5 py-1.5 font-heading text-[10px] font-extrabold uppercase tracking-[0.12em] text-amber-500">
                {game.openCriticScore} OpenCritic
              </span>
            )}
          </div>
          <Link
            href={`/games/${game.slug.current}`}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-600 px-6 py-3 font-heading text-sm font-extrabold text-white shadow-[0_5px_0_#9D6328] transition-all hover:-translate-y-0.5 hover:shadow-[0_7px_0_#9D6328] active:translate-y-1 active:shadow-[0_1px_0_#9D6328]"
          >
            View game →
          </Link>
        </div>

        {/* Right: cover + sticky note */}
        <div
          className="relative hidden items-end justify-start p-7 lg:flex"
          style={{ background: coverGradient }}
        >
          {/* Cover image */}
          {game.coverImage && (
            <div className="absolute inset-0">
              <img
                src={game.coverImage}
                alt={game.title}
                className="h-full w-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}
          {/* Beth's note */}
          {quote && (
            <StickyNote
              subtitle="Beth says"
              body={`"${quote}"`}
              rotate={-1.5}
              className="relative z-10 max-w-[200px]"
            />
          )}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Clean build

**Step 3: Commit**

```bash
git add src/components/FeaturedBanner.tsx
git commit -m "feat: add FeaturedBanner component for browse page hero"
```

---

## Task 6: `/play` Page — Full Rewrite

**Files:**
- Rewrite: `src/app/play/page.tsx`
- Create: `src/components/play/TodayCard.tsx`
- Create: `src/components/play/PlayGameCard.tsx`
- Create: `src/components/play/BlitzSection.tsx`
- Create: `src/components/play/ShipItSection.tsx`

This is the largest task. Build each component, then assemble the page.

### Step 1: Create `TodayCard` component

File: `src/components/play/TodayCard.tsx`

The "Today's games" card in the hero. Shows 3 badge rings synced to localStorage. Reuses the same `getSlotData` logic from `DailyBadgeShelf.tsx`.

```tsx
'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { type GameSlug, getRankForGame, GAME_COLORS } from '@/lib/ranks'

// ── Types ────────────────────────────────────────────────────────────────────

interface SlotData {
  completed: boolean
  rankName: string
  score: number
}

const DAILY_GAMES: { slug: GameSlug; label: string; emoji: string; href: string }[] = [
  { slug: 'game-sense', label: 'Game Sense', emoji: '🎮', href: '/play/game-sense' },
  { slug: 'street-date', label: 'Street Date', emoji: '📅', href: '/play/street-date' },
  { slug: 'shelf-price', label: 'Shelf Price', emoji: '💰', href: '/play/shelf-price' },
]

function getTodayDateStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getSlotData(slug: GameSlug, dateStr: string): SlotData {
  if (typeof window === 'undefined') return { completed: false, rankName: '', score: 0 }
  try {
    switch (slug) {
      case 'shelf-price': {
        const raw = localStorage.getItem(`shelf_price_v2_${dateStr}`)
        if (!raw) return { completed: false, rankName: '', score: 0 }
        const state = JSON.parse(raw)
        if (!state.finished) return { completed: false, rankName: '', score: 0 }
        return { completed: true, rankName: getRankForGame('shelf-price', state.score, state.streak), score: state.score }
      }
      case 'street-date': {
        const raw = localStorage.getItem(`street_date_${dateStr}`)
        if (!raw) return { completed: false, rankName: '', score: 0 }
        const state = JSON.parse(raw)
        if (!state.finished) return { completed: false, rankName: '', score: 0 }
        return { completed: true, rankName: getRankForGame('street-date', state.score, 0), score: state.score }
      }
      case 'game-sense': {
        const raw = localStorage.getItem(`game_sense_${dateStr}`)
        if (!raw) return { completed: false, rankName: '', score: 0 }
        const state = JSON.parse(raw)
        if (!state.won) return { completed: false, rankName: '', score: 0 }
        return { completed: true, rankName: getRankForGame('game-sense', state.score, 0), score: state.score }
      }
    }
  } catch {
    return { completed: false, rankName: '', score: 0 }
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function TodayCard() {
  const dateStr = useMemo(() => getTodayDateStr(), [])
  const slots = useMemo(
    () => DAILY_GAMES.map((g) => ({ ...g, ...getSlotData(g.slug, dateStr) })),
    [dateStr],
  )

  const completedCount = slots.filter((s) => s.completed).length
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

  // Nudge text
  const nudge =
    completedCount === 3
      ? 'All done for today. Come back tomorrow!'
      : completedCount === 0
        ? 'Three games waiting for you.'
        : `${3 - completedCount} still to go.`

  return (
    <div className="rounded-[18px] border border-border/60 bg-card p-5 shadow-[0_3px_0_hsl(var(--border)),0_6px_18px_rgba(0,0,0,0.05)]">
      <p className="mb-3.5 font-heading text-[9px] font-extrabold uppercase tracking-[0.22em] text-muted-foreground">
        {today} &nbsp;·&nbsp; <strong className="text-foreground">Today&apos;s games</strong>
      </p>

      {/* Badge row */}
      <div className="mb-3.5 flex items-start justify-around gap-2">
        {slots.map((slot) => (
          <Link
            key={slot.slug}
            href={slot.href}
            className="group flex flex-col items-center gap-1.5"
          >
            <div
              className={`flex h-[42px] w-[42px] items-center justify-center rounded-full text-base transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6 ${
                slot.completed
                  ? 'shadow-[0_0_0_3px_hsl(var(--background))]'
                  : 'border-2 border-dashed border-border'
              }`}
              style={
                slot.completed
                  ? { backgroundColor: GAME_COLORS[slot.slug].accent }
                  : undefined
              }
            >
              {slot.completed ? slot.emoji : ''}
            </div>
            <span className={`text-center font-heading text-[8px] font-extrabold uppercase tracking-[0.08em] leading-tight ${
              slot.completed ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {slot.label}
            </span>
          </Link>
        ))}
      </div>

      <div className="mb-3 h-px bg-border" />
      <p className="font-heading text-[11px] font-semibold italic text-muted-foreground">
        {nudge}
      </p>
    </div>
  )
}
```

### Step 2: Create `PlayGameCard` component

File: `src/components/play/PlayGameCard.tsx`

Image-led card for the 3 daily games. Image zone (colored placeholder) + type zone below.

```tsx
'use client'

import Link from 'next/link'

interface PlayGameCardProps {
  title: string
  subtitle: string
  description: string
  href: string
  /** Color class for the image zone placeholder */
  imageBg: string
  /** Button color class */
  btnClass: string
  /** "Daily" sticker style */
  stickerClass?: string
}

export default function PlayGameCard({
  title,
  subtitle,
  description,
  href,
  imageBg,
  btnClass,
  stickerClass = 'bg-blue-500 text-white',
}: PlayGameCardProps) {
  return (
    <div className="relative pt-2.5">
      {/* Sticker */}
      <div
        className={`absolute top-0 left-3.5 z-10 rounded-[5px] px-2.5 py-1 font-heading text-[8px] font-black uppercase tracking-[0.2em] shadow-[0_2px_5px_rgba(0,0,0,0.14)] ${stickerClass}`}
        style={{ transform: 'rotate(-1.5deg)' }}
      >
        Daily
      </div>

      {/* Card */}
      <div className="group flex cursor-pointer flex-col overflow-hidden rounded-[18px] border border-border/60 bg-card shadow-[0_3px_0_hsl(var(--border)),0_6px_18px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:-rotate-[0.3deg] hover:shadow-[0_8px_0_hsl(var(--border)),0_20px_40px_rgba(0,0,0,0.1)]">
        {/* Image zone — placeholder */}
        <div className={`flex h-[200px] items-center justify-center ${imageBg}`}>
          <div className="flex flex-col items-center gap-2 opacity-30 select-none">
            <span className="font-heading text-[9px] font-extrabold uppercase tracking-[0.18em]">
              Illustration here
            </span>
          </div>
        </div>

        {/* Type zone */}
        <div className="flex flex-1 flex-col border-t border-border/60 p-5">
          <p className="mb-1.5 flex items-center gap-2 font-heading text-[9px] font-black uppercase tracking-[0.26em] text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
            {subtitle}
          </p>
          <h3 className="mb-2 font-heading text-[clamp(24px,2.6vw,30px)] font-black uppercase leading-[0.92] tracking-tight text-foreground">
            {title}
          </h3>
          <p className="mb-3.5 flex-1 text-[11px] font-semibold italic leading-relaxed text-muted-foreground">
            {description}
          </p>
          <div className="border-t border-dashed border-border pt-3">
            <Link
              href={href}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-heading text-[11px] font-extrabold text-white shadow-[0_3px_0_rgba(0,0,0,0.2)] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.2)] ${btnClass}`}
            >
              Play →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Step 3: Create `BlitzSection` component

File: `src/components/play/BlitzSection.tsx`

Amber stripe card with topic list.

```tsx
'use client'

import Link from 'next/link'
import { BLITZ_TOPICS } from '@/data/blitz-topics'
import { GAMES_DB } from '@/data/games-db'

export default function BlitzSection() {
  // Get first 4 topics with pool sizes
  const topicsWithCounts = BLITZ_TOPICS.slice(0, 4).map((topic) => ({
    ...topic,
    count: GAMES_DB.filter(topic.filter).length,
  }))

  return (
    <div className="relative overflow-hidden rounded-[20px] bg-amber-600 shadow-[0_4px_0_#9D6328,0_10px_30px_rgba(200,135,58,0.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_0_#9D6328,0_20px_44px_rgba(200,135,58,0.28)]">
      {/* Stripe overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(-45deg, rgba(255,255,255,0.09) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.09) 75%, transparent 75%)',
          backgroundSize: '28px 28px',
          animation: 'stripeScroll 3s linear infinite',
        }}
      />

      <div className="relative z-10 grid grid-cols-1 items-stretch lg:grid-cols-2">
        {/* Left: title + CTA */}
        <div className="flex flex-col justify-between p-8 lg:p-10">
          <div>
            <p className="mb-3.5 flex items-center gap-2 font-heading text-[9px] font-black uppercase tracking-[0.28em] text-white/85">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Ongoing · Topics added regularly
            </p>
            <h2 className="mb-3 font-heading text-[clamp(52px,6vw,80px)] font-black uppercase leading-[0.85] tracking-tighter text-white">
              Blitz
            </h2>
            <p className="mb-5 max-w-[300px] text-sm font-semibold italic leading-relaxed text-white/60">
              Pick a topic. Name as many games as you can think of before the clock runs out. Then wonder why you forgot Celeste.
            </p>
          </div>
          <Link
            href="/play/blitz"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 font-heading text-sm font-black text-amber-600 shadow-[0_3px_0_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5 hover:shadow-[0_5px_0_rgba(0,0,0,0.1)]"
          >
            Play Blitz →
          </Link>
        </div>

        {/* Right: topics panel */}
        <div className="flex flex-col justify-center p-4 lg:pr-8 lg:pl-0 lg:py-7">
          <div className="flex flex-col gap-0 rounded-[14px] bg-card p-4 shadow-[0_2px_12px_rgba(0,0,0,0.12)]">
            <p className="mb-2.5 font-heading text-[8px] font-extrabold uppercase tracking-[0.22em] text-muted-foreground">
              Popular topics
            </p>
            <div className="flex flex-col gap-1.5">
              {topicsWithCounts.map((topic) => (
                <div
                  key={topic.slug}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-[9px] border border-border bg-secondary/50 px-3.5 py-2.5 transition-colors hover:bg-secondary"
                >
                  <span className="font-heading text-xs font-extrabold text-foreground">
                    {topic.icon} {topic.name}
                  </span>
                  <span className="font-heading text-[10px] font-semibold text-muted-foreground">
                    {topic.count} games
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

Add the stripe animation to `src/app/globals.css` if not already present:

```css
@keyframes stripeScroll {
  0%   { background-position: 0 0; }
  100% { background-position: 28px 28px; }
}
```

### Step 4: Create `ShipItSection` component

File: `src/components/play/ShipItSection.tsx`

```tsx
'use client'

import Link from 'next/link'
import StickyNote from '@/components/StickyNote'

export default function ShipItSection() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-border/60 bg-card shadow-[0_3px_0_hsl(var(--border)),0_7px_22px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:-rotate-[0.2deg] hover:shadow-[0_7px_0_hsl(var(--border)),0_20px_42px_rgba(0,0,0,0.1)]">
      <div className="grid grid-cols-1 items-stretch lg:grid-cols-[340px_1fr]">
        {/* Image zone — dark purple placeholder */}
        <div className="relative flex min-h-[200px] items-center justify-center overflow-hidden bg-[#2E2A5A] lg:min-h-[320px]">
          <div className="flex flex-col items-center gap-2.5 opacity-30 select-none">
            <span className="font-heading text-[9px] font-extrabold uppercase tracking-[0.18em] text-white">
              Characters here
            </span>
          </div>
        </div>

        {/* Type zone */}
        <div className="flex flex-col justify-between p-8">
          <div>
            <div className="mb-4 inline-block rounded-[5px] bg-secondary px-2.5 py-1 font-heading text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground shadow-[0_1px_4px_rgba(0,0,0,0.08)]" style={{ transform: 'rotate(-1.2deg)' }}>
              Narrative experience
            </div>
            <div className="mb-5 flex flex-col gap-2">
              <StickyNote
                title="Set the phone down for this one."
                body="It earns it."
                rotate={-0.5}
                className="max-w-[260px]"
              />
              <StickyNote
                body="Loosely based on true events."
                rotate={0.6}
                className="max-w-[200px] text-[10px] opacity-75"
              />
            </div>
            <p className="mb-6 text-sm font-semibold leading-relaxed text-muted-foreground">
              You&apos;re trying to get your game made. There are investors, there are budgets, there are people who want to change things. It&apos;s based on how the industry actually works right now, which is to say: a bit grim, occasionally funny, weirdly absorbing.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3.5">
            <Link
              href="/play/ship-it"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 font-heading text-xs font-extrabold text-background shadow-[0_3px_0_rgba(0,0,0,0.38)] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.38)]"
            >
              Start playing →
            </Link>
            <span className="text-[11px] font-semibold italic text-muted-foreground/50">
              Best played in one sitting, we think.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Step 5: Rewrite `/play` page

File: `src/app/play/page.tsx`

Assemble all sections. Numbered section headers, hero with TodayCard, daily game grid, badge shelf, Blitz, Ship It, more coming.

```tsx
'use client'

export const dynamic = 'force-dynamic'

import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import TodayCard from '@/components/play/TodayCard'
import PlayGameCard from '@/components/play/PlayGameCard'
import BlitzSection from '@/components/play/BlitzSection'
import ShipItSection from '@/components/play/ShipItSection'
import DailyBadgeShelf from '@/components/games/DailyBadgeShelf'
import { getTodayDateString as getGameSenseToday } from './game-sense/lib/dateUtils'
import { getTodayDateString as getStreetDateToday } from './street-date/lib/dateUtils'
import { getTodayDateString as getShelfPriceToday } from './shelf-price/lib/dateUtils'

// ── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  number,
  title,
  note,
}: {
  number: string
  title: React.ReactNode
  note?: string
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b-2 border-dashed border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-1.5 font-heading text-[9px] font-extrabold uppercase tracking-[0.28em] text-muted-foreground">
          {number}
        </p>
        <h2 className="font-heading text-xl font-extrabold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      {note && (
        <p className="max-w-[220px] text-right text-xs font-semibold italic leading-relaxed text-muted-foreground">
          {note}
        </p>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PlayHubPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-10">
        {/* ── Hero ── */}
        <header className="grid grid-cols-1 items-end gap-10 border-b border-dashed border-border py-12 sm:py-16 lg:grid-cols-[1fr_300px]">
          <div>
            <p className="mb-4 flex items-center gap-2.5 font-heading text-[10px] font-extrabold uppercase tracking-[0.3em] text-amber-600">
              <span className="block h-[1.5px] w-[18px] bg-amber-600" />
              Games
            </p>
            <h1 className="mb-3.5 font-heading text-[clamp(32px,4vw,50px)] font-bold leading-[1.15] tracking-tight text-foreground">
              Something to play<br />
              while the kettle boils.<br />
              <em className="font-semibold italic text-muted-foreground">Or longer, if you&apos;d like.</em>
            </h1>
            <p className="max-w-[440px] text-sm font-semibold italic leading-relaxed text-muted-foreground">
              Daily games that reset with the morning. A rapid-fire mode that never quite ends.
              And one that&apos;s worth setting proper time aside for.
            </p>
          </div>
          <TodayCard />
        </header>

        {/* ── Section 01: Daily ── */}
        <section className="pt-14">
          <SectionHeader
            number="01 — Daily"
            title={<>Fresh every morning. <em className="font-semibold italic text-muted-foreground">Gone by midnight.</em></>}
            note="One badge per game. Play them all and you've had a proper idle hour."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <PlayGameCard
              title="Game Sense"
              subtitle="Guess the game"
              description="We describe it. You name it. The gap between "I know this one" and actually knowing it is where the game lives."
              href={`/play/game-sense/${getGameSenseToday()}`}
              imageBg="bg-[#EEEAF8]"
              btnClass="bg-blue-500"
            />
            <PlayGameCard
              title="Street Date"
              subtitle="Guess the year"
              description="Match a game to its release year from the box art alone. Some you'll know instantly. Some will humble you."
              href={`/play/street-date/${getStreetDateToday()}`}
              imageBg="bg-[#EAEBF0]"
              btnClass="bg-blue-500"
            />
            <PlayGameCard
              title="Shelf Price"
              subtitle="Guess the price"
              description="Higher or lower. Five rounds. Turns out your instinct about what games cost is either better or worse than you'd expect."
              href={`/play/shelf-price/${getShelfPriceToday()}`}
              imageBg="bg-amber-100"
              btnClass="bg-amber-600"
              stickerClass="bg-amber-600 text-white"
            />
          </div>

          {/* Badge shelf — passing first game as default, no stamp animation on hub */}
          <div className="mt-4">
            <DailyBadgeShelf currentGame="game-sense" animateStamp={false} />
          </div>
        </section>

        {/* ── Section 02: Blitz ── */}
        <section className="pt-14">
          <SectionHeader
            number="02 — Rapid Fire"
            title={<>How many can you <em className="font-semibold italic text-muted-foreground">actually</em> name?</>}
            note="New topics added as the library grows. No daily reset on this one."
          />
          <BlitzSection />
        </section>

        {/* ── Section 03: Ship It ── */}
        <section className="pt-14">
          <SectionHeader
            number="03 — Narrative"
            title={<>A game about making <em className="font-semibold italic text-muted-foreground">a game.</em></>}
            note="Different from the others. Set some time aside. It's worth it."
          />
          <ShipItSection />
        </section>

        {/* ── Section 04: More Coming ── */}
        <section className="pt-14">
          <SectionHeader
            number="04"
            title={<>There&apos;s <em className="font-semibold italic text-muted-foreground">more coming.</em></>}
          />
          <div className="flex flex-col items-start justify-between gap-6 rounded-[18px] border-2 border-dashed border-border bg-secondary/30 p-8 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 font-heading text-[9px] font-extrabold uppercase tracking-[0.26em] text-muted-foreground">
                In the works
              </p>
              <p className="text-xl font-bold tracking-tight text-foreground">
                A new game is quietly taking shape.<br />
                <em className="font-semibold italic text-muted-foreground">We&apos;ll say more when there&apos;s something to say.</em>
              </p>
            </div>
            <span className="whitespace-nowrap rounded-full border border-amber-500/30 bg-amber-100 px-4 py-2 font-heading text-[10px] font-black uppercase tracking-[0.12em] text-amber-600">
              Watch this space
            </span>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
```

### Step 6: Verify build

Run: `npm run build`
Expected: Clean build

### Step 7: Commit

```bash
git add src/components/play/ src/app/play/page.tsx src/app/globals.css
git commit -m "feat: rewrite /play page with section-based layout, hero, badge sync, Blitz & Ship It sections"
```

---

## Task 7: `/games` Page — Browse Tab + Tab Toggle

**Files:**
- Create: `src/components/games/BrowseView.tsx`
- Modify: `src/app/games/page.tsx`

### Step 1: Create `BrowseView` component

File: `src/components/games/BrowseView.tsx`

Fetches from `getGameLibrary()` and renders the curated browse layout: featured pick, curated rows (via `RowCarousel` + `GameTileCard`), feature banners, sticky notes, pull quotes.

```tsx
'use client'

import { useState, useEffect } from 'react'
import { getGameLibrary } from '@/lib/queries'
import RowCarousel from '@/components/RowCarousel'
import GameTileCard from '@/components/GameTileCard'
import FeaturedBanner from '@/components/FeaturedBanner'
import StickyNote from '@/components/StickyNote'
import PullQuote from '@/components/PullQuote'
import type { Game } from '@/types'

// ── Types matching GROQ response ─────────────────────────────────────────────

interface CuratedRowGame {
  isStaffPick: boolean
  game: Game
}

interface CuratedRowSection {
  _key: string
  _type: 'curatedRow'
  title: string
  games: CuratedRowGame[]
  noteEnabled: boolean
  noteStyle: 'simple' | 'recipe' | 'pullQuote'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  noteContent: any[]
  noteAuthor?: string
}

interface FeatureBannerSection {
  _key: string
  _type: 'featureBanner'
  headline: string
  subtitle?: string
  linkedPost?: { _id: string; title: string; slug: { current: string } }
  buttonLabel?: string
}

type Section = CuratedRowSection | FeatureBannerSection

interface GameLibraryData {
  featuredPick?: {
    game: Game
    eyebrow: string
    quote?: string
  }
  sections?: Section[]
}

// ── Helper: parse *italic* from row titles ───────────────────────────────────

function parseTitle(raw: string): React.ReactNode {
  const parts = raw.split(/\*([^*]+)\*/)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <em key={i} className="font-semibold italic text-muted-foreground">{part}</em>
    ) : (
      part
    )
  )
}

// ── StaffPickCard — stipple popup variant ────────────────────────────────────

function StaffPickCard({ game }: { game: Game }) {
  return (
    <div className="flex flex-shrink-0 items-start gap-0 scroll-snap-align-start w-[320px] pt-2">
      {/* Cover */}
      <div className="h-[140px] w-[100px] flex-shrink-0 overflow-hidden rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
        {game.coverImage ? (
          <img src={game.coverImage} alt={game.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-xs text-muted-foreground">
            Cover
          </div>
        )}
      </div>
      {/* Stipple popup */}
      <div
        className="relative ml-3 flex-1 rounded-xl p-3.5 shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
        style={{
          backgroundColor: 'hsl(45 33% 93%)',
          backgroundImage: 'radial-gradient(circle, rgba(26,26,20,0.06) 1px, transparent 1px)',
          backgroundSize: '10px 10px',
          transform: 'rotate(0.8deg)',
        }}
      >
        {/* Arrow pointing left */}
        <div
          className="absolute -left-2 top-5 h-0 w-0"
          style={{
            borderStyle: 'solid',
            borderWidth: '7px 8px 7px 0',
            borderColor: 'transparent hsl(45 33% 93%) transparent transparent',
          }}
        />
        <p className="mb-1 font-heading text-[9px] font-black uppercase tracking-[0.18em] text-amber-600">
          Staff pick
        </p>
        <p className="mb-0.5 font-heading text-[15px] font-black text-foreground leading-tight">
          {game.title}
        </p>
        <p className="text-[11px] font-semibold italic text-muted-foreground">
          {(game.platforms ?? []).join(' · ')}
        </p>
        {game.openCriticScore != null && (
          <>
            <hr className="my-2 border-dashed border-border" />
            <div className="flex justify-between">
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">OpenCritic</span>
              <span className="font-heading text-sm font-black text-foreground">{game.openCriticScore}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export default function BrowseView() {
  const [data, setData] = useState<GameLibraryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGameLibrary()
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-[300px] animate-pulse rounded-[20px] bg-secondary" />
        <div className="h-[200px] animate-pulse rounded-2xl bg-secondary" />
        <div className="h-[200px] animate-pulse rounded-2xl bg-secondary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card px-6 py-16 text-center">
        <p className="font-heading text-lg font-semibold text-foreground">Browse content coming soon</p>
        <p className="mt-1 text-sm text-muted-foreground">Switch to Library to browse all games.</p>
      </div>
    )
  }

  return (
    <div className="space-y-14">
      {/* Featured pick */}
      {data.featuredPick?.game && (
        <FeaturedBanner
          game={data.featuredPick.game}
          eyebrow={data.featuredPick.eyebrow ?? "This week's pick"}
          quote={data.featuredPick.quote}
        />
      )}

      {/* Sections */}
      {(data.sections ?? []).map((section) => {
        if (section._type === 'curatedRow') {
          const row = section as CuratedRowSection
          return (
            <div key={row._key}>
              <RowCarousel title="">
                {/* We skip RowCarousel's built-in title and render our own */}
              </RowCarousel>
              {/* Custom row header */}
              <h2 className="mb-5 font-heading text-[22px] font-black tracking-tight text-foreground">
                {parseTitle(row.title)}
              </h2>
              <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:snap-none">
                {(row.games ?? []).map((entry, i) => {
                  if (entry.isStaffPick && entry.game) {
                    return <StaffPickCard key={`pick-${i}`} game={entry.game} />
                  }
                  if (!entry.game) return null
                  return (
                    <div key={entry.game._id} className="w-[220px] flex-shrink-0 snap-start">
                      <GameTileCard game={entry.game} />
                    </div>
                  )
                })}
                {/* Optional note at end of row */}
                {row.noteEnabled && row.noteStyle === 'pullQuote' && row.noteContent && (
                  <div className="flex-shrink-0 self-center snap-start" style={{ width: 280 }}>
                    <PullQuote
                      text={row.noteContent?.[0]?.children?.[0]?.text ?? ''}
                      author={row.noteAuthor ?? 'Idle Hours'}
                    />
                  </div>
                )}
                {row.noteEnabled && row.noteStyle !== 'pullQuote' && row.noteContent && (
                  <div className="flex-shrink-0 self-center snap-start" style={{ width: 220 }}>
                    <StickyNote content={row.noteContent} rotate={1.5} />
                  </div>
                )}
              </div>
            </div>
          )
        }

        if (section._type === 'featureBanner') {
          const banner = section as FeatureBannerSection
          return (
            <div
              key={banner._key}
              className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-foreground p-8 sm:flex-row sm:items-center"
            >
              <div>
                <h3 className="font-heading text-2xl font-black tracking-tight text-background">
                  {parseTitle(banner.headline)}
                </h3>
                {banner.subtitle && (
                  <p className="mt-1 text-sm font-semibold italic text-background/45">
                    {banner.subtitle}
                  </p>
                )}
              </div>
              {banner.linkedPost && (
                <a
                  href={`/${banner.linkedPost.slug.current}`}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-white/7 px-5 py-3 font-heading text-sm font-extrabold text-background transition-all hover:border-white/30 hover:bg-white/14"
                >
                  {banner.buttonLabel ?? 'Read more →'}
                </a>
              )}
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
```

### Step 2: Add tab toggle to `/games` page

Modify `src/app/games/page.tsx`. The key changes:

1. Add a `tab` state (`'browse' | 'library'`) defaulting to `'browse'`
2. Wrap existing content in a conditional: only render when `tab === 'library'`
3. Render `<BrowseView />` when `tab === 'browse'`
4. Add a pill tab toggle in the header area

The existing page exports `GamesPage` as default. We need to:
- Add `import BrowseView from '@/components/games/BrowseView'`
- Add a `tab` state
- Add the tab toggle UI after the hero heading
- Conditionally render browse vs library content

**Important:** Keep all existing library code intact — just wrap it in `{tab === 'library' && (...)}`. The filters, search, sort, view toggle, and game grid should only show when Library tab is active.

The tab toggle UI (placed after the hero `<motion.div>`):

```tsx
{/* Tab toggle */}
<div className="mb-8 inline-flex rounded-full border border-border bg-card p-1 gap-0.5">
  <button
    onClick={() => setTab('browse')}
    className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-heading text-xs font-extrabold transition-all ${
      tab === 'browse'
        ? 'bg-foreground text-background'
        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    }`}
  >
    📖 Browse
  </button>
  <button
    onClick={() => setTab('library')}
    className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-heading text-xs font-extrabold transition-all ${
      tab === 'library'
        ? 'bg-foreground text-background'
        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    }`}
  >
    ⊞ Library
  </button>
</div>

{tab === 'browse' ? (
  <BrowseView />
) : (
  <>
    {/* ... existing search, filters, grid/list content ... */}
  </>
)}
```

### Step 3: Verify build

Run: `npm run build`
Expected: Clean build

### Step 4: Commit

```bash
git add src/components/games/BrowseView.tsx src/app/games/page.tsx
git commit -m "feat: add Browse tab to /games page with curated rows from Sanity"
```

---

## Task 8: Deploy Sanity Studio + Seed Data

**Step 1: Deploy studio**

```bash
cd studio && npx sanity deploy
```

**Step 2: Create test data in Sanity Studio**

Open Sanity Studio, navigate to Game Library singleton. Create:
- Featured pick: choose a game, set eyebrow text and Beth's quote
- 2-3 curated rows with games and at least one sticky note
- 1 feature banner linking to a blog post

**Step 3: Verify on localhost**

Run: `npm run dev`
Navigate to `/play` — verify all 4 sections render, badge sync works
Navigate to `/games` — verify Browse tab shows curated content, Library tab shows existing grid

---

## Task 9: Final Build + Push

**Step 1: Full build**

Run: `npm run build`
Expected: Clean build, no errors

**Step 2: Visual check**

- Desktop: both pages render correctly, consistent styling
- Mobile (375px viewport): responsive layout, no horizontal overflow
- Tab toggle works, badge rings sync

**Step 3: Commit any remaining tweaks**

```bash
git add -A
git commit -m "fix: final polish for play & games page redesign"
```

**Step 4: Push**

```bash
git push origin main
```

---

## File Summary

| Action | Path |
|--------|------|
| Create | `studio/schemaTypes/gameLibrary.ts` |
| Modify | `studio/schemaTypes/index.ts` |
| Modify | `studio/sanity.config.ts` |
| Modify | `src/lib/queries.ts` |
| Create | `src/components/StickyNote.tsx` |
| Create | `src/components/PullQuote.tsx` |
| Create | `src/components/FeaturedBanner.tsx` |
| Create | `src/components/play/TodayCard.tsx` |
| Create | `src/components/play/PlayGameCard.tsx` |
| Create | `src/components/play/BlitzSection.tsx` |
| Create | `src/components/play/ShipItSection.tsx` |
| Rewrite | `src/app/play/page.tsx` |
| Create | `src/components/games/BrowseView.tsx` |
| Modify | `src/app/games/page.tsx` |
| Modify | `src/app/globals.css` (if stripeScroll keyframe missing) |
