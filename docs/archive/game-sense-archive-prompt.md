# Claude Code Prompt — Game Sense Archive Page

Build the Game Sense archive page at `app/play/game-sense/archive/page.tsx`.

---

## What this page is

A browse page for all past Game Sense puzzles. The user can scroll through every puzzle chronologically, see their score for each one, and jump to any date via a calendar. It replaces the current plain list at `/play/game-sense/archive`.

---

## Layout

Two-column grid: `grid-template-columns: 1fr 340px`

**Left column — Rolodex list**
**Right column — Calendar (sticky) + Selected entry card beneath it**

---

## Left column: Rolodex scroll

A fixed-height container (`height: 620px`, `overflow: hidden`) containing a vertically scrollable list of archive entries. The active item is always centred in the container. Items above and below taper off in size and opacity — like a physical drum or rolodex.

### Visual states per item (CSS classes)

```
.active   — centred item. Larger number (#016 at 36px), white date at 16px, 
            game name visible, View button visible (purple with shadow)
.near     — 1 away. opacity 0.7, number 28px
.far      — 2–3 away. opacity 0.25
.very-far — 4+ away. opacity 0.1
```

The list has top and bottom fade masks (linear-gradient to the page background colour) so items disappear into the background rather than hard-clipping.

A subtle highlight band sits at the vertical midpoint — `background: rgba(255,255,255,0.04)` with `border-top` and `border-bottom` at `rgba(74,143,232,0.3)` — to make the active zone legible.

### Each archive row — 3-col grid: `56px 1fr auto`

```
[#016]   [Mon 9th Mar 2026         ]   [260  View →]
          [Spiritfarer — italic dim ]
```

- Number: `#016` style, right-aligned, large in active state
- Date: primary text. Game name revealed below it only in active state (max-height transition)
- Score: green if > 0, red if lost (`score === -1`), dimmed if not played (`score === 0`)
- View button: hidden on inactive items, shown on active item, links to `/play/game-sense/[id]`

### Interaction

```
Scroll wheel    → move active index by 1
Click any item  → jump to that item
Drag (mouse + touch) → free-scroll, snap to nearest on release
Arrow keys ↑↓   → move active index
```

Transition on list position: `transform 0.4s cubic-bezier(0.22,1,0.36,1)`

Below the list, show a small keyboard hint: `↑ ↓ or scroll to navigate`

---

## Right column: Calendar

Sticky at `top: 80px`. Uses the existing game's blue world colour tokens.

```
┌──────────────────────────┐
│  ‹   March 2026   ›      │
├──────────────────────────┤
│  M  T  W  T  F  S  S    │
│  ...day grid...          │
├──────────────────────────┤
│  11 Wins  3 Lost  960 Best│
└──────────────────────────┘
```

### Day grid behaviour

- **has-game days**: brighter text, dot below the number
  - dot is green (`#27c76a`) if won (score > 0)
  - dot is red (`#e85a5a`) if lost (score === -1)
  - dot is blue (`#5b9fff`) if played but unscored
- **active day**: purple background (`#6c63d4`), scaled up slightly (`scale(1.15)`), no dot
- **today**: blue-tinted background, blue-bright text, blue border
- **future days**: dimmed, not clickable
- **empty cells**: transparent, fill the grid before the 1st of the month (Monday-first week)

Clicking a day jumps the rolodex to that entry. Scrolling the rolodex past a month boundary flips the calendar to that month automatically.

Month navigation buttons `‹` `›` flip between months without changing the active rolodex item.

### Stats strip

Three stats below the grid, calculated from the current calendar month's entries: wins count, losses count, best score.

---

## Right column: Selected entry card

Below the calendar. Updates live as the active rolodex item changes.

```
[4px colour stripe — blue if won, red if lost, purple if not played]
GAME SENSE                     ← eyebrow
Mon 9th Mar 2026               ← large date
#016                           ← small number
- - - - - - - - - - - - - - -  ← dashed divider
Spiritfarer                    ← game name
Adventure · PC · 2020          ← italic meta
- - - - - - - - - - - - - - -
260                Getting Warmer
Points scored

[View results →]               ← full-width purple button
```

The card has a white/cream background (`rgba(255,255,255,0.96)`) against the blue page background so it reads as a physical card. Dashed internal dividers.

---

## Data shape

Each archive entry:

```ts
type ArchiveEntry = {
  id: number           // puzzle number, e.g. 16
  date: string         // formatted, e.g. 'Mon 9th Mar 2026'
  dateObj: Date        // for calendar matching
  score: number        // points scored. 0 = not played, -1 = lost, >0 = won
  game: string         // answer game title
  meta: string         // e.g. 'Puzzle · PC · 2016'
  rank: string         // rank threshold label, e.g. 'Getting Warmer'
}
```

Fetch from your existing Sanity query for Game Sense results, or pass as props from the page's `generateStaticParams` / server component. The archive entries should be sorted newest-first (index 0 = most recent).

---

## Visual design tokens (Game Sense blue world)

```css
--blue:          #4a8fe8
--blue-bright:   #5b9fff
--blue-light:    rgba(74,143,232,0.15)
--blue-border:   rgba(74,143,232,0.3)
--purple:        #6c63d4
--purple-deep:   #4a42a0
--green:         #27c76a
--red:           #e85a5a
--dim:           rgba(255,255,255,0.45)
--dimmer:        rgba(255,255,255,0.22)
--faint:         rgba(255,255,255,0.08)
--spring:        cubic-bezier(0.34,1.5,0.64,1)
--ease-out:      cubic-bezier(0.22,1,0.36,1)
```

Page background: layered radial gradients on deep blue (`#1a3a8a` → `#1e4db8` → `#1a2d6e`), matching the existing Game Sense game pages. Stipple noise overlay via SVG filter at low opacity.

Font: Montserrat throughout (already loaded globally). All weights 700–900.

---

## Page header

```
— GAME SENSE —
The Archive
Every puzzle, every score. Scroll to explore or pick a date.
```

Eyebrow in `--blue-bright` with a 20px amber line before it. Title at 42px/900/tracking -2px. Subtitle italic/dim.

---

## Component split

```
app/play/game-sense/archive/
  page.tsx              ← server component, fetches entries, passes to client
  ArchiveClient.tsx     ← 'use client', owns all scroll/calendar state
  Rolodex.tsx           ← the scrollable list + fade masks
  RolodexItem.tsx       ← single row, takes item + distanceFromActive
  Calendar.tsx          ← month grid + stats strip
  SelectedCard.tsx      ← the white card below the calendar
```

Keep all animation state (activeIdx, currentOffset, isDragging) in `ArchiveClient`. Pass `activeIdx` and `onSelect(idx)` down as props. Do not use a global store for this — it's local page state.

---

## Existing patterns to match

- The back button and "Play today's game" CTA in the nav match the pattern already used on `/play/game-sense`
- The purple physical-press button (`box-shadow: 0 4px 0 var(--purple-deep)`, `translateY(-2px)` on hover, `translateY(3px)` on active) is used throughout Game Sense — use the same
- Score colours (green/red) match the existing result screen

---

## What NOT to build

- No search or filter — the calendar is the navigation
- No pagination — all entries load at once (the list will grow slowly, one per day)
- No authentication check — scores are stored client-side/cookie and passed in as props
