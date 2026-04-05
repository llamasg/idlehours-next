# Game Library & Lightbox Overhaul — Design

## Summary

Replace individual game pages (`/games/[slug]`) with a lightbox overlay system. The detailed UI card becomes the lightbox content. Remove long descriptions from Sanity. Add grid/list view toggle to the game library.

## Architecture: React Context + Portal

A `GameLightboxProvider` context wraps the app inside `ClientProviders`. Any component calls `openLightbox(game)` to show the overlay. URL is synced via `history.pushState` — no full-page navigation.

### GameLightboxProvider (`src/context/GameLightboxContext.tsx`)

Client component. State:

- `activeGame: Game | null`
- `previousPath: string | null` — captured on open, restored on close
- `allGames: Game[]` — loaded once on mount via `getAllGames()`, used for related games

API exposed via context:

- `openLightbox(game: Game)` — sets activeGame, pushes `/games/${slug}` to history
- `closeLightbox()` — clears activeGame, pushes previousPath to history

Registers a `popstate` listener on mount so browser Back closes the lightbox.

### GameLightbox (`src/components/GameLightbox.tsx`)

Rendered inside the provider. Always mounted, only visible when `activeGame !== null`.

- Dark backdrop: `bg-black/70`, click-to-dismiss
- Centered card: `max-w-[860px]`, vertically scrollable if taller than viewport
- Close button: top-right corner (cancel icon)
- Escape key dismisses
- Accessibility: `aria-modal="true"`, `role="dialog"`, focus trap
- Body scroll lock when open

Content (the hero card from the current detail page):

- Cover image (left column on desktop, full-width on mobile)
- Info panel: title, genre row (tag icon + bullet-separated genres), OpenCritic score badge, difficulty/co-op/soundtrack badges, replayability, short description, platforms, affiliate links
- Below hero card: "Related games" row — 4 GameTileCards filtered by matching genre, excluding the current game. Sourced from the provider's cached `allGames`.

### Direct URL visits (`/games/[slug]`)

Keep a thin server component at `/games/[slug]/page.tsx`. It fetches all games, finds the match, and renders the shared library page with an `initialLightboxSlug` prop.

```
/games/[slug]/page.tsx (server)
  → const games = await getAllGames()
  → const match = games.find(g => g.slug.current === slug)
  → return <GamesLibraryPage games={games} initialLightboxSlug={slug} />
```

**Hydration safety:** `GamesLibraryPage` reads `initialLightboxSlug` inside a `useEffect` (not during render). The server renders the library page without the lightbox open. The client opens it on mount. This avoids hydration mismatch since the server has no lightbox state.

**URL sharing works:** Someone copies a lightbox URL → pastes in new tab → `/games/[slug]` server route renders the library page → client mounts → `useEffect` reads the prop → lightbox opens over the library.

Extract `GamesLibraryPage` as a shared client component used by both `/games/page.tsx` and `/games/[slug]/page.tsx`.

Remove `generateStaticParams()` AND `dynamicParams = false` (if present) from the `[slug]` route. Without removing `dynamicParams`, Next.js will 404 on slugs not in the static set rather than falling through to server render.

## Sanity schema changes

### Remove from game schema (`studio/schemaTypes/game.ts`)

- Delete the `longDescription` field definition (blockContent type)

### Remove from game generator (`studio/components/gameGenerator/`)

- Delete `description.ts` entirely (Claude-powered long description generation)
- In `GameGeneratorInput.tsx`: remove the `generateDescription()` call, the `longDescriptionBlocks` variable, and the `longDescription` patch

### Remove from GROQ queries (`src/lib/queries.ts`)

- Delete `getGame(slug)` function entirely — no longer needed
- Verify `getAllGames()` does not fetch `longDescription` (confirmed: it doesn't)

### Remove from types (`src/types/index.ts`)

- Delete `longDescription?: any[]` from the `Game` interface

## Link replacement — all game detail navigation becomes lightbox triggers

| Component | File | Current | New |
|-----------|------|---------|-----|
| GameTileCard | `src/components/GameTileCard.tsx` | `<Link href="/games/slug">` | `onClick → openLightbox(game)` |
| GameReferenceBlock | `src/components/GameReferenceBlock.tsx` | `<Link href="/games/slug">` | `onClick → openLightbox(game)` |
| GameOfMonth | `src/components/GameOfMonth.tsx` | `<Link href="/games/slug">` | `onClick → openLightbox(game)` |
| GamePromoCard | `src/app/play/skill-issue/components/GamePromoCard.tsx` | `<Link href="/games/slug">` | `onClick → openLightbox(game)` |

**Note on GamePromoCard:** This lives under `/play/` not `/components/`. Easy to miss during implementation — flag explicitly. The Skill Issue win modal shows this card when the guessed game matches a database entry.

All components already receive a full `Game` object, so `openLightbox(game)` requires no additional data fetching.

## Score badge refinements (GameTileCard)

- Drop shadow: `filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4))`
- Score text shifted 5px right: `left: 24 → left: 29`
- Dark pill behind score text: semi-transparent background (`bg-black/30 rounded-full px-1`) ensuring legibility on any cover image colour

## Grid/List view toggle

Added to the game library page header, beside the filter controls.

**Grid view** (default): 4-column responsive grid of compact `GameTileCard` cards. Current layout.

**List view**: single column, `max-w-[860px]` centered. Each item uses the larger detailed card layout (same content as the lightbox hero card — image + full info panel side by side). Clicking any card or "View Game" triggers the lightbox.

Preference persisted in `localStorage` key `ih-library-view` (`'grid' | 'list'`).

Smooth layout transition via Framer Motion `layout` prop + `AnimatePresence`.

## Cleanup checklist

- Remove PortableText imports and `portableTextComponents` config from the detail page code
- Remove `blockContent` references from game-related frontend code
- Grep codebase for any remaining `<Link href="/games/` and replace with lightbox calls
- `next.config.ts`: no game route rewrites exist (confirmed)
- No sitemap generator exists (confirmed)
- Remove `generateStaticParams` and `dynamicParams` exports from `[slug]` route
