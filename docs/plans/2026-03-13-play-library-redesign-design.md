# Play & Library Page Redesign — Design Document

**Date:** 2026-03-13
**Status:** Approved

---

## Overview

Redesign the `/play` (game hub) and `/games` (game library) pages to present content as curated hubs with editorial personality — handwritten notes, bespoke rankings, high-impact heroes, and friendly Idle Hours touches. Both pages should feel related: same styling, same vibes, not identical but clearly siblings.

## Principles

- Reuse existing components from `/staging` and `src/components/` — don't reinvent the wheel
- Don't follow mockups 1:1 — make them work within the current design system
- Consistency between `/play` and `/games` — same card radii, shadow system, dashed borders, spring easing, font system
- Sanity CMS for curated content — Beth can update without deploys

---

## `/play` Page

### Hero
- **Left column:** Eyebrow "GAMES", headline "Something to play while the kettle boils. *Or longer, if you'd like.*", body copy
- **Right column:** "Today's games" card with 3 daily badge rings (Game Sense / Street Date / Shelf Price). Syncs to localStorage — checks each game's `DayState.won` for today's date. Earned = colored ring with emoji, unearned = dashed empty. Nudge text at bottom

### Section 01 — Daily (3-col grid)
- Section header: numbered eyebrow + title + italic note
- 3 game cards, each with:
  - **Image zone** — colored background placeholder (purple for Game Sense, grey for Street Date, amber for Shelf Price) until illustrations land
  - **Type zone** — game type label with live dot, large title, description, footer with "Play →" button
  - No score display — keep minimal
- **Badge shelf** below grid: adapted `DailyBadgeShelf` with share button and progress text

### Section 02 — Rapid Fire (Blitz)
- Full-width amber card with stripe animation
- Two-column: left = title + description + CTA, right = white panel listing available topics with game counts
- Topics from existing Blitz data

### Section 03 — Narrative (Ship It)
- Two-column card: left = dark purple illustration zone (placeholder), right = sticker label + annotations (StickyNote components) + description + CTA

### Section 04 — More Coming
- Dashed-border card with eyebrow + headline + "Watch this space" tag

---

## `/games` Page

### Tab System
Pill switcher at top of page:
- **Browse** (new curated view) — default active tab
- **Library** (existing filter/grid/list view, unchanged)

Library tab renders the existing `/games` content as-is. Browse tab renders the new curated layout.

### Browse Tab — Content from Sanity

**Featured pick** (hero banner)
- Dark background, 2-col layout
- Left: eyebrow (e.g. "Beth's pick this week") + game title + description + platform/genre tags + CTA
- Right: game cover gradient + Beth's sticky note quote
- Sanity fields: game reference, eyebrow text, Beth's quote

**Curated rows** (repeating)
- Row header with title (e.g. "Good with *someone else*") — no "see all" link
- Horizontal scroll using existing `RowCarousel`
- Cards use `GameTileCard` — "staff pick" boolean triggers stipple popup variant (cover + stats card beside it)
- Optional sticky note at end of scroll row if enabled in Sanity

**Feature banners** (interspersed)
- Dark background bar with headline + subtitle + button
- Button links to a blog post (Sanity reference)

**Pull quotes** (interspersed)
- Amber left-border, sticky note texture, large italic text + author
- Sanity fields: quote text, author name

---

## Sanity Schema: `gameLibrary`

Singleton document with:

```
gameLibrary {
  featuredPick: {
    game: reference -> game
    eyebrow: string           // "Beth's pick this week"
    quote: text               // Beth's sticky note text
  }
  sections: array of:
    - curatedRow {
        title: string
        games: array of {
          game: reference -> game
          isStaffPick: boolean
        }
        note: {
          enabled: boolean
          style: 'simple' | 'recipe' | 'pullQuote'
          content: richText (Portable Text)
          author: string        // for pull quotes
        }
      }
    - featureBanner {
        headline: string
        subtitle: string
        linkedPost: reference -> post
      }
}
```

### Note Styles

Four visual treatments, all using rich text input in Sanity (Beth knows to use bullet/numbered formatting):

1. **Simple note** — header, subheader, body copy. Stipple texture, dog-ear corner, slight rotation
2. **Staff pick** — not a separate note; it's a boolean on a game in a row that changes the card rendering to show the stipple popup with game stats
3. **Recipe note** — sections with bullet points and numbered steps. Beth formats with rich text
4. **Pull quote** — large italic text + author. Amber left border

---

## New Components

| Component | Location | Used on |
|-----------|----------|---------|
| `StickyNote` | `src/components/StickyNote.tsx` | Both pages |
| `PullQuote` | `src/components/PullQuote.tsx` | /games browse |
| `FeaturedBanner` | `src/components/FeaturedBanner.tsx` | /games browse |
| `PlayGameCard` | `src/components/play/PlayGameCard.tsx` | /play |
| `TodayCard` | `src/components/play/TodayCard.tsx` | /play |
| `BlitzSection` | `src/components/play/BlitzSection.tsx` | /play |
| `ShipItSection` | `src/components/play/ShipItSection.tsx` | /play |
| `BrowseView` | `src/components/games/BrowseView.tsx` | /games |

## Files to Modify

| File | Changes |
|------|---------|
| `src/app/play/page.tsx` | Full rewrite — section-based layout with hero |
| `src/app/games/page.tsx` | Wrap existing content in Library tab, add Browse tab + toggle |
| `src/lib/queries.ts` | Add `getGameLibrary()` GROQ query |
| `studio/schemas/` | Add `gameLibrary` document type + section types |

## Existing Components to Reuse

- `RowCarousel` — horizontal scroll rows on /games browse
- `GameTileCard` — game cards in browse rows
- `DailyBadgeShelf` — adapted for /play badge shelf
- `SectionLabel` — section headers (extended with numbering)
- Spring easing, shadow system, border patterns from staging tokens
- `entrance()` + `useEntranceSteps()` from `src/lib/animations.ts`

---

## What's NOT in scope

- Illustrations for game cards (placeholder colored zones for now)
- Dark mode variants (follows existing theme system)
- Mobile-specific layouts (responsive via Tailwind breakpoints as usual)
- Changes to game lightbox system (continues to work as-is)
- Changes to Library tab content (filters, search, grid/list — all unchanged)
