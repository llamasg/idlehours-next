# Idle Hours — Homepage Redesign Design Document

**Date:** 2026-02-17
**Status:** Approved
**Spec:** `public/prompt.md` + `BRAND_DOCUMENT_v2.pdf`

---

## Approach

Option A: Clean rebuild of homepage. Build all 11 sections as new components. Other pages (game library, game detail, quizzes, shop) keep current layouts but inherit new palette via Tailwind config.

## Architecture

### New Component Structure

```
src/components/homepage/
  NavBar.tsx          — sticky nav with serif wordmark, centre links, CTA
  Hero.tsx            — full-width dark hero with CSS fireflies
  PhilosophyStrip.tsx — 3-column values strip
  MoodTiles.tsx       — 2x2 mood grid linking to /mood/[slug]
  EditorialPicks.tsx  — horizontal scroll "This week's idle hours" cards
  BlogSection.tsx     — 3-column blog cards with gradient thumbnails
  ReleaseCalendar.tsx — 2-panel calendar + game detail sidebar
  MoodQuizBanner.tsx  — full-width dark CTA
  GameOfMonth.tsx     — 2-column feature card
  CosyCorner.tsx      — horizontal scroll product cards
  Footer.tsx          — 3-column dark footer
```

### Homepage Composition

`homepage.tsx` directly composes all 11 sections in order. No SectionRenderer. HomeLoader curtain animation retained.

### Existing Code

- `Header.tsx` and `SiteFooter.tsx` remain for non-homepage pages
- `CdPlayer.tsx` stays mounted globally in App.tsx
- Game library, detail, quizzes, shop pages untouched
- `ClickSpark` stays in App.tsx

## Palette Migration

Replace current HSL CSS variables in `index.css` and update `tailwind.config.js`:

```
linen:        #f5ede4  (background)
brand-dark:   #1e1a14  (foreground/text)
brand-green:  #2d6a4f  (primary brand)
accent-green: #52b788  (accent)
burnt-orange: #c95d0d  (CTA/primary action)
teal:         #137034  (secondary green)
muted:        #6b7280  (muted text)
card:         #ffffff  (card backgrounds)
off-white:    #f9fafb  (subtle bg variation)
```

Map to existing Tailwind tokens (background, foreground, primary, accent, card, muted) so other pages inherit the new colours automatically.

## Font

Keep Lora (already loaded, all weights). No change needed.

## Technical Decisions

1. **Hero fireflies** — CSS `@keyframes` with absolute-positioned dots. No canvas.
2. **Release Calendar** — Pure React state for month nav and day selection. Lavender palette scoped to component. Wishlist in localStorage. Remind-me modal with console.log endpoint.
3. **Animations** — Framer Motion for scroll reveals (viewport `once: true`), hover scale/shadow on tiles and cards.
4. **Responsive** — Mobile-first. Mood tiles 1-col mobile, 2x2 tablet+. Calendar stacks vertically on mobile. Nav hamburger on mobile.
5. **Mock data** — All mock content hardcoded in components per prompt spec. No CMS dependency.
6. **Gradient thumbnails** — Blog cards use CSS gradients from brand palette as image placeholders.

## Sections (scroll order)

1. NavBar (sticky)
2. Hero (full-width, dark, fireflies)
3. Philosophy Strip (3 columns, white bg)
4. For Your Mood (2x2 mood tiles)
5. This Week's Idle Hours (editorial picks, horizontal scroll)
6. From the Blog (3-column grid)
7. Release Calendar (2-panel, lavender accent)
8. Mood Quiz CTA Banner (full-width dark)
9. Game of the Month (2-column feature)
10. Cosy Corner (horizontal scroll products)
11. Footer (3-column dark)

## Quality Checklist

- "cosy" not "cozy" throughout
- Hero communicates Idle Hours philosophy
- Balatro + Celeste visible in editorial picks
- Calendar with working month navigation
- Wishlist persists in localStorage
- Mobile layout works at 375px
- Gradient placeholders (no broken images)
- Blog section visible with mock content
- Philosophy strip is first section after hero
- Mood tiles link to /mood/[slug]
- Footer includes music player reference
