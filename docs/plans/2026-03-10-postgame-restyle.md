# Post-Game Page Restyle — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restyle the Game Sense post-game screen with choreographed animation sequence, enlarged badge, sentence reveal card with answer title, stipple-background badge shelf with sticker-style badges, and rank hover interactions.

**Architecture:** The page layout stays exactly as it is (sentence → nav → ResultCard → DailyBadgeShelf → DiscoverMore). We add a `postGameStep` state (0–7) to the page component that controls a staggered animation sequence across all post-game elements. Each child component receives an `animate` or `delay` prop and handles its own entrance. New keyframes go in `tailwind.config.js`. The sentence gets wrapped in a white card with a dashed divider and the answer game title + year below.

**Tech Stack:** React, Tailwind CSS, CSS keyframes, Next.js App Router

---

## Task 1: Add New Keyframes to Tailwind Config

**Files:**
- Modify: `tailwind.config.js:9-97` (keyframes + animation objects)

**Step 1: Add new keyframes**

Add these keyframes to the `keyframes` object in `tailwind.config.js`:

```js
'stamp-down': {
  '0%': { transform: 'scale(0.4)', opacity: '0' },
  '40%': { transform: 'scale(1.18)', opacity: '1' },
  '60%': { transform: 'scale(0.94) rotate(-2deg)' },
  '80%': { transform: 'scale(1.05) rotate(1deg)' },
  '100%': { transform: 'scale(1) rotate(0deg)' },
},
'postgame-fade-in': {
  '0%': { opacity: '0', transform: 'translateY(12px)' },
  '100%': { opacity: '1', transform: 'translateY(0)' },
},
'postgame-scale-in': {
  '0%': { opacity: '0', transform: 'scale(0)' },
  '60%': { opacity: '1', transform: 'scale(1.08)' },
  '100%': { opacity: '1', transform: 'scale(1)' },
},
'rank-cascade': {
  '0%': { opacity: '0', transform: 'translateX(-8px)' },
  '100%': { opacity: '1', transform: 'translateX(0)' },
},
'ring-pulse': {
  '0%, 100%': { boxShadow: '0 0 0 0 rgba(74,143,232,0.4)' },
  '50%': { boxShadow: '0 0 0 6px rgba(74,143,232,0)' },
},
```

**Step 2: Add matching animation shorthand entries**

Add to the `animation` object:

```js
'stamp-down': 'stamp-down 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
'postgame-fade-in': 'postgame-fade-in 0.4s cubic-bezier(0.34,1.5,0.64,1) both',
'postgame-scale-in': 'postgame-scale-in 0.45s cubic-bezier(0.34,1.5,0.64,1) both',
'rank-cascade': 'rank-cascade 0.3s cubic-bezier(0.34,1.5,0.64,1) both',
'ring-pulse': 'ring-pulse 1.5s ease-in-out infinite',
```

**Step 3: Verify build**

Run: `npm run build`
Expected: passes (keyframes are just config, no usage yet)

**Step 4: Commit**

```
feat: add post-game animation keyframes to tailwind config
```

---

## Task 2: Add `postGameStep` Sequencer to Page Component

**Files:**
- Modify: `src/app/play/game-sense/[date]/page.tsx`

**Step 1: Add postGameStep state**

After the existing `entranceStep` state (line ~69), add:

```tsx
// Post-game animation sequence: 0=waiting, 1=ResultCard, 2=sentence, 3=nav, 4=header, 5=badges, 6=discover, 7=toast
const [postGameStep, setPostGameStep] = useState(0)
```

**Step 2: Add useEffect to drive the sequence**

Add after the entrance animation useEffect (after line ~117):

```tsx
// Post-game staggered entrance — fires once when transitioning to post-game
const postGameTriggered = useRef(false)
useEffect(() => {
  if (!isPostGame || postGameTriggered.current) return
  postGameTriggered.current = true

  // If loading a completed game from localStorage, skip animations
  if (!hasInteractedRef.current) {
    setPostGameStep(7)
    return
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion) {
    setPostGameStep(7)
    return
  }

  // Staggered sequence
  const t1 = setTimeout(() => setPostGameStep(1), 100)   // ResultCard container
  const t2 = setTimeout(() => setPostGameStep(2), 900)   // Sentence card
  const t3 = setTimeout(() => setPostGameStep(3), 1200)  // Nav buttons
  const t4 = setTimeout(() => setPostGameStep(4), 1500)  // Game header fades
  const t5 = setTimeout(() => setPostGameStep(5), 1700)  // Badge shelf
  const t6 = setTimeout(() => setPostGameStep(6), 2100)  // DiscoverMore
  const t7 = setTimeout(() => setPostGameStep(7), 2500)  // Toast
  return () => { [t1,t2,t3,t4,t5,t6,t7].forEach(clearTimeout) }
}, [isPostGame])
```

Note: `isPostGame` is derived (line ~316) so it changes when modal closes → triggers sequence.

**Step 3: Hide score pill in post-game**

Find the score pill grid (line ~388, the `grid grid-cols-[1fr_auto_1fr]` div). Wrap it:

```tsx
{!isPostGame && (
  <div className="mt-3 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-6">
    {/* ...existing pill contents... */}
  </div>
)}
```

**Step 4: Wire `postGameStep` into post-game JSX**

Replace the `{isPostGame && (...)}` block (lines ~594–644) with animation-aware version. Each element gets:
- `opacity: 0` when its step hasn't been reached
- Animation class when its step fires
- No animation style when `postGameStep >= 7` (done)

```tsx
{isPostGame && (
  <>
    {/* 1. ResultCard — first to animate */}
    <div
      className="mb-6"
      style={
        postGameStep < 1
          ? { opacity: 0 }
          : postGameStep < 7
            ? { animation: 'postgame-fade-in 0.4s cubic-bezier(0.34,1.5,0.64,1) both' }
            : undefined
      }
    >
      <ResultCard
        game="game-sense"
        score={state.score}
        streak={0}
        won={state.won}
        puzzleLabel={`Game Sense ${formatGameNumber(date)} · ${formatDisplayDate(date)}`}
        onViewResults={() => state.won ? setShowWinModal(true) : setShowLossModal(true)}
        animateEntrance={postGameStep >= 1 && postGameStep < 7}
      />
    </div>

    {/* 2. Sentence reveal card */}
    <div
      className="mb-6"
      style={
        postGameStep < 2
          ? { opacity: 0 }
          : postGameStep < 7
            ? { animation: 'postgame-fade-in 0.4s cubic-bezier(0.34,1.5,0.64,1) both' }
            : undefined
      }
    >
      <div className="mx-auto w-full max-w-[850px] overflow-hidden rounded-2xl bg-white/95 shadow-sm">
        <div className="p-5 sm:p-6">
          <SentenceClue
            answer={answer}
            blanksRevealed={state.blanksRevealed}
            score={0}
            onRevealBlank={() => {}}
            disabled={true}
            revealAll
          />
        </div>
        <div className="mx-5 border-t border-dashed border-[hsl(var(--game-ink))]/15 sm:mx-6" />
        <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
          {answer.igdbImageId && (
            <img
              src={igdbCoverUrl(answer.igdbImageId)}
              alt={answer.title}
              className="h-12 w-9 rounded object-cover shadow-sm"
            />
          )}
          <div>
            <p className="font-heading text-[15px] font-black text-[hsl(var(--game-ink))]">
              {answer.title}
            </p>
            <p className="font-heading text-[12px] font-semibold text-[hsl(var(--game-ink-light))]">
              {answer.year}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* 3. Nav pills */}
    <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
      {!today && (
        <Link
          href="/play/game-sense"
          className="inline-flex items-center gap-2 rounded-full border-2 border-[#3D35A0] bg-[#5B4FCF] px-6 py-3 font-heading text-[13px] font-[900] tracking-wide text-white shadow-[0_6px_0_#3D35A0,0_8px_20px_rgba(91,79,207,0.28)] transition-[transform,box-shadow] duration-100 hover:-translate-y-[3px] hover:shadow-[0_9px_0_#3D35A0,0_12px_24px_rgba(91,79,207,0.35)] active:translate-y-[4px] active:shadow-[0_1px_0_#3D35A0]"
          style={
            postGameStep < 3
              ? { opacity: 0, transform: 'scale(0)' }
              : postGameStep < 7
                ? { animation: 'postgame-scale-in 0.45s cubic-bezier(0.34,1.5,0.64,1) both' }
                : undefined
          }
        >
          <img src="/images/icons/icon_Target-aim-practice-games-play.svg" alt="" className="h-5 w-5 brightness-0 invert" />
          Today&apos;s game
        </Link>
      )}
      <Link
        href="/play/game-sense/archive"
        className="inline-flex items-center gap-2 rounded-full border-2 border-[#3D35A0] bg-[#5B4FCF] px-6 py-3 font-heading text-[13px] font-[900] tracking-wide text-white shadow-[0_6px_0_#3D35A0,0_8px_20px_rgba(91,79,207,0.28)] transition-[transform,box-shadow] duration-100 hover:-translate-y-[3px] hover:shadow-[0_9px_0_#3D35A0,0_12px_24px_rgba(91,79,207,0.35)] active:translate-y-[4px] active:shadow-[0_1px_0_#3D35A0]"
        style={
          postGameStep < 3
            ? { opacity: 0, transform: 'scale(0)' }
            : postGameStep < 7
              ? { animation: 'postgame-scale-in 0.45s cubic-bezier(0.34,1.5,0.64,1) 0.15s both' }
              : undefined
        }
      >
        <img src="/images/icons/icon_hourglass-loading-filtering-timer.svg" alt="" className="h-5 w-5 brightness-0 invert" />
        View past games
      </Link>
    </div>

    {/* 5. Badge shelf */}
    <div
      className="mb-8"
      style={
        postGameStep < 5
          ? { opacity: 0 }
          : postGameStep < 7
            ? { animation: 'postgame-fade-in 0.5s cubic-bezier(0.34,1.5,0.64,1) both' }
            : undefined
      }
    >
      <DailyBadgeShelf currentGame="game-sense" animateStamp={postGameStep >= 5 && postGameStep < 7} />
    </div>
  </>
)}
```

**Step 5: Wire post-game animation to header and DiscoverMore**

For the game header (title/subtitle/date, lines ~335–512): wrap in a conditional opacity when `isPostGame`:

After the `entranceStep` style on the title div (~line 338), add a post-game override:

```tsx
style={
  isPostGame
    ? (postGameStep < 4
        ? { opacity: 0 }
        : postGameStep < 7
          ? { opacity: 1, transform: 'translateY(0)', animation: 'postgame-fade-in 0.4s cubic-bezier(0.34,1.5,0.64,1) both' }
          : { opacity: 1, transform: 'translateY(0)' })
    : (entranceStep < 1
        ? { opacity: 0, transform: 'translateY(120px)' }
        : entranceStep < 2
          ? { opacity: 1, transform: 'translateY(120px)' }
          : { opacity: 1, transform: 'translateY(0)' })
}
```

For DiscoverMore (lines ~674–678):

```tsx
{isPostGame && (
  <div
    className="mx-auto max-w-7xl px-4 py-8 lg:px-8"
    style={
      postGameStep < 6
        ? { opacity: 0 }
        : postGameStep < 7
          ? { animation: 'postgame-fade-in 0.5s cubic-bezier(0.34,1.5,0.64,1) both' }
          : undefined
    }
  >
    <DiscoverMore currentGame="game-sense" />
  </div>
)}
```

For the toast (lines ~686–701): add `postGameStep < 7` guard so it only shows at end:

```tsx
{showCompleteToast && postGameStep >= 7 && (
  ...existing toast...
)}
```

**Step 6: Verify build**

Run: `npm run build`
Expected: type error on `animateEntrance` prop (ResultCard doesn't accept it yet) and `animateStamp` prop (DailyBadgeShelf doesn't accept it yet). That's expected — we'll fix in Tasks 3 and 4.

**Step 7: Commit**

```
feat: add post-game animation sequencer and sentence reveal card
```

---

## Task 3: Restyle ResultCard — Enlarged Badge, Rank Hover, Cascade

**Files:**
- Modify: `src/components/games/ResultCard.tsx`

**Step 1: Add `animateEntrance` prop**

Update the interface and destructure:

```tsx
interface ResultCardProps {
  game: GameSlug
  score: number
  streak: number
  won: boolean
  puzzleLabel: string
  onViewResults: () => void
  /** When true, play the internal cascade animation */
  animateEntrance?: boolean
}
```

Destructure with default `false`:

```tsx
export default function ResultCard({
  game, score, streak, won, puzzleLabel, onViewResults,
  animateEntrance = false,
}: ResultCardProps) {
```

**Step 2: Enlarge badge to 2.5×**

Change the badge circle (line ~79-85) from `h-[120px] w-[120px]` to `h-[200px] w-[200px]`:

```tsx
<div
  className="flex h-[200px] w-[200px] items-center justify-center rounded-full bg-[hsl(var(--game-blue))] text-[13px] font-bold uppercase tracking-[0.04em] text-white/30 shadow-[0_10px_32px_rgba(74,143,232,0.35)]"
  style={
    animateEntrance
      ? { animation: 'postgame-scale-in 0.5s cubic-bezier(0.34,1.5,0.64,1) 0.2s both' }
      : { animation: 'badge-pulse 1.2s ease-out forwards' }
  }
>
  BADGE
</div>
```

**Step 3: Enlarge rank text**

Change the rank name text (line ~90-92):
- "You earned" label: keep as is
- Rank name: change `text-2xl` → `text-3xl`
- Rank flavour: change `text-[13px]` → `text-[14px]`

Add animation to the rank name group:

```tsx
<div
  className="flex flex-col items-center gap-1.5"
  style={
    animateEntrance
      ? { animation: 'postgame-fade-in 0.4s cubic-bezier(0.34,1.5,0.64,1) 0.4s both' }
      : undefined
  }
>
  <p className="font-heading text-[11px] font-extrabold uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">
    You earned
  </p>
  <p className="font-heading text-3xl font-black leading-none text-[hsl(var(--game-blue))]">
    {rankName}
  </p>
  <p className="max-w-[250px] text-[14px] font-semibold italic text-[hsl(var(--game-ink-mid))]">
    {rankFlavour}
  </p>
</div>
```

**Step 4: Add rank ladder hover states and cascade animation**

Replace each ladder row (lines ~126-165) with hover interaction and cascade:

```tsx
{ladder.map((tier, i) => {
  const isCurrentRank = i === currentRankIndex
  const isAchieved = i < currentRankIndex

  return (
    <div
      key={tier.name}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 transition-all duration-200 ${
        isCurrentRank
          ? 'bg-[hsl(var(--game-blue))]/8 ring-[1.5px] ring-[hsl(var(--game-blue))]/25 animate-ring-pulse'
          : isAchieved
            ? 'opacity-50 hover:opacity-70'
            : 'border-[1.5px] border-dashed border-[hsl(var(--game-ink))]/10 hover:border-[hsl(var(--game-ink))]/20'
      } ${!isCurrentRank ? 'hover:translate-x-1' : ''}`}
      style={
        animateEntrance
          ? { animation: `rank-cascade 0.3s cubic-bezier(0.34,1.5,0.64,1) ${0.5 + i * 0.06}s both` }
          : undefined
      }
    >
      {/* ...existing dot + text + "You" badge (unchanged)... */}
    </div>
  )
})}
```

**Step 5: Animate the score number**

Wrap the score section (lines ~101-113) in an animation div:

```tsx
<div
  className="flex flex-col gap-0.5"
  style={
    animateEntrance
      ? { animation: 'postgame-fade-in 0.35s cubic-bezier(0.34,1.5,0.64,1) 0.45s both' }
      : undefined
  }
>
  {/* ...existing score content unchanged... */}
</div>
```

**Step 6: Verify build**

Run: `npm run build`
Expected: may still fail on `animateStamp` in DailyBadgeShelf (Task 4). ResultCard should be clean.

**Step 7: Commit**

```
feat: ResultCard — 2.5× badge, rank cascade, hover indent, entrance animation
```

---

## Task 4: Restyle DailyBadgeShelf — Stipple Background, Sticker Badges, Stamp-Down

**Files:**
- Modify: `src/components/games/DailyBadgeShelf.tsx`

**Step 1: Add `animateStamp` prop**

```tsx
interface DailyBadgeShelfProps {
  currentGame: GameSlug
  /** When true, play stamp-down animation on earned badge instead of stamp-bounce */
  animateStamp?: boolean
}

export default function DailyBadgeShelf({ currentGame, animateStamp = false }: DailyBadgeShelfProps) {
```

**Step 2: Add stipple notebook background**

Wrap the entire component content in a stipple container. Replace the outer `<div className="mx-auto w-full max-w-[850px]">` with:

```tsx
<div className="mx-auto w-full max-w-[850px] rounded-2xl px-6 py-6"
  style={{
    background: `
      radial-gradient(circle, rgba(26,26,20,0.07) 1px, transparent 1px),
      hsl(var(--game-cream-dark) / 0.15)
    `,
    backgroundSize: '10px 10px, 100% 100%',
  }}
>
```

**Step 3: Restyle earned badges as stickers**

In the completed badge circle (lines ~102-110), replace the styling:

```tsx
<div
  className={`flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[hsl(var(--game-blue))] text-[10px] font-bold uppercase tracking-[0.04em] text-white/30 ${
    justCompleted
      ? (animateStamp ? 'animate-stamp-down' : 'animate-stamp-bounce')
      : ''
  }`}
  style={{
    boxShadow: '0 0 0 4px white, 0 4px 12px rgba(0,0,0,0.15)',
    transform: slot.slug === 'shelf-price' ? 'rotate(-3deg)'
      : slot.slug === 'street-date' ? 'rotate(2deg)'
      : 'rotate(-1deg)',
  }}
>
  BADGE
</div>
```

Remove the separate ink ring border div (line ~113):
```tsx
{/* REMOVE: <div className="pointer-events-none absolute -inset-1 rounded-full border-2 border-[hsl(var(--game-blue))]/20" /> */}
```

The `box-shadow: 0 0 0 4px white` replaces it with a white halo sticker effect.

**Step 4: Restyle empty slots at 70% size**

Replace the empty slot circle (lines ~153-158):

```tsx
<div className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[hsl(var(--game-cream-dark))]/40 transition-colors group-hover:bg-[hsl(var(--game-cream-dark))]/60">
  <span className="font-heading text-[12px] font-bold tracking-[0.08em] text-[hsl(var(--game-ink-light))]/50 transition-colors group-hover:text-[hsl(var(--game-blue))]">
    Play &rarr;
  </span>
</div>
```

This changes from 120px dashed circle → 84px (70%) solid cream-dark filled circle.

**Step 5: Verify build**

Run: `npm run build`
Expected: PASS — all new props are wired.

**Step 6: Commit**

```
feat: DailyBadgeShelf — stipple bg, sticker badges, stamp-down animation
```

---

## Task 5: Final Integration and Build Verification

**Files:**
- All modified files from Tasks 1–4

**Step 1: Full build check**

Run: `npm run build`
Expected: clean build, no TypeScript errors

**Step 2: Manual verification checklist**

Navigate to a completed Game Sense game and verify:
1. ResultCard animates in first — container fades, then badge scales, rank name fades, score fades, ladder rows cascade
2. Sentence reveal card appears second — white card, blanks revealed, dashed divider, answer title + year below, cover thumbnail if available
3. Nav buttons scale in third — spring scale from 0, staggered 150ms
4. Game header (title/date) fades in fourth
5. Badge shelf appears fifth — stipple background visible, earned badges have white halo + tilt, stamp-down on just-completed
6. DiscoverMore fades in sixth
7. Toast appears last
8. Returning to completed game (no interaction) — all elements visible immediately, no animation
9. Rank ladder rows respond to hover with translateX indent
10. Current rank row has pulsing ring border
11. Score pill hidden during post-game
12. Empty badge slots are 84px cream-dark filled circles

**Step 3: Reduced motion check**

Enable `prefers-reduced-motion: reduce` in browser dev tools.
Expected: all post-game elements appear instantly, no animations.

**Step 4: Commit**

```
feat: complete post-game restyle with choreographed animations
```

---

## Summary of Changes

| File | What Changed |
|------|-------------|
| `tailwind.config.js` | 5 new keyframes: stamp-down, postgame-fade-in, postgame-scale-in, rank-cascade, ring-pulse |
| `page.tsx` | `postGameStep` sequencer, score pill hidden post-game, sentence wrapped in reveal card with answer title, animation styles on all post-game elements |
| `ResultCard.tsx` | `animateEntrance` prop, 200px badge (2.5×), larger rank text, hover indent on ladder rows, pulse on current rank, cascade animation |
| `DailyBadgeShelf.tsx` | `animateStamp` prop, stipple dot background, sticker-style badges (white halo, tilt, drop shadow), 70% empty slots, stamp-down animation |
