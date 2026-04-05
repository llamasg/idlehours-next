# Parallax Logo Frame Animation — Design

**Date:** 2026-02-25
**Page:** `/parallax`
**File:** `src/app/parallax/page.tsx`

## Goal

Replace the static `idle-hours-logo.svg` on the parallax hero with a looping frame-by-frame animation using 10 pre-exported SVG frames. The animation should feel smooth but handmade at ~18fps.

## Frames

10 SVGs in `/public/parallax/logo_animation_Frames/`:

```
logo_anim_Frame___01.svg  →  logo_anim_Frame___10.svg
```

## Approach: `setInterval` + `useState`

### Frame constant

Replace the existing `LOGO` object with a `LOGO_FRAMES` array:

```ts
const LOGO_FRAMES = Array.from({ length: 10 }, (_, i) =>
  `/parallax/logo_animation_Frames/logo_anim_Frame___${String(i + 1).padStart(2, '0')}.svg`
)
```

### State & timer

```ts
const [frameIndex, setFrameIndex] = useState(0)

useEffect(() => {
  const id = setInterval(() => {
    setFrameIndex(prev => (prev + 1) % LOGO_FRAMES.length)
  }, Math.round(1000 / 18)) // ~55ms
  return () => clearInterval(id)
}, [])
```

### Render

All 10 `<img>` tags are always in the DOM (pre-loaded, no flicker). Active frame is `opacity: 1`, others `opacity: 0`. Container keeps identical sizing to the original logo slot.

```tsx
<div
  className="relative w-[min(50vw,500px)]"
  style={{ aspectRatio: '1 / 1' }}  // adjust to actual SVG ratio
>
  {LOGO_FRAMES.map((src, i) => (
    <img
      key={src}
      src={src}
      alt={i === 0 ? 'Idle Hours' : ''}
      draggable={false}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: i === frameIndex ? 1 : 0 }}
    />
  ))}
</div>
```

The existing `logoVisible` fade-in wrapper (translateY + opacity transition) stays untouched — it wraps this new container as before.

## What doesn't change

- Parallax layer refs and mouse tracking
- Scroll-morph logic (`clip-path`, `sceneRef`, nav transitions)
- `LOGO.multiplier` value (3.5) — the layer ref index stays the same
- All other layers, nav, CTAs, content section

## Files touched

| File | Change |
|------|--------|
| `src/app/parallax/page.tsx` | Replace `LOGO` const + logo `<img>` with frames array, `frameIndex` state, interval effect, and stacked `<img>` render |

No new files. No new dependencies.
