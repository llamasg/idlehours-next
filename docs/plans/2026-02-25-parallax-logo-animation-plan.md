# Parallax Logo Frame Animation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the static logo `<img>` on `/parallax` with a looping 10-frame flipbook animation at ~18fps using pre-exported SVG files.

**Architecture:** A `LOGO_FRAMES` array holds paths to all 10 SVGs. A `useState` tracks the active frame index, advanced by a `setInterval` at 55ms (~18fps). All 10 `<img>` tags are always in the DOM for instant frame switching — only `opacity` changes, no layout thrash or network re-fetch.

**Tech Stack:** React `useState`, `useEffect`, `setInterval` — no new dependencies.

---

### Task 1: Replace the LOGO constant and add frame state

**Files:**
- Modify: `src/app/parallax/page.tsx`

**Context:**
Lines 14–18 in `page.tsx` currently define:
```ts
const LOGO = {
  src: '/parallax/idle-hours-logo.svg',
  alt: 'Idle Hours',
  multiplier: 3.5,
}
```
The `multiplier` value (3.5) is used in `ALL_MULTIPLIERS` at line 27. We must preserve it.

**Step 1: Replace the LOGO constant**

Remove lines 14–18 and replace with:

```ts
const LOGO_FRAMES = Array.from({ length: 10 }, (_, i) =>
  `/parallax/logo_animation_Frames/logo_anim_Frame___${String(i + 1).padStart(2, '0')}.svg`
)
const LOGO_MULTIPLIER = 3.5
```

**Step 2: Fix ALL_MULTIPLIERS to use the new constant**

Line 27 currently reads:
```ts
  LOGO.multiplier,
```
Change to:
```ts
  LOGO_MULTIPLIER,
```

**Step 3: Add frameIndex state inside ParallaxPage**

Inside the `ParallaxPage` component function body, after the existing `const [logoVisible, setLogoVisible] = useState(false)` line (currently line 72), add:

```ts
const [frameIndex, setFrameIndex] = useState(0)
```

**Step 4: Add the interval effect**

After the `logoVisible` effect (currently lines 74–77), add a new `useEffect`:

```ts
useEffect(() => {
  const id = setInterval(() => {
    setFrameIndex((prev) => (prev + 1) % LOGO_FRAMES.length)
  }, Math.round(1000 / 18))
  return () => clearInterval(id)
}, [])
```

**Step 5: Verify no TypeScript errors**

```bash
cd d:/websites/IdleHours && npx tsc --noEmit
```
Expected: no errors.

---

### Task 2: Replace the logo `<img>` with the stacked frame render

**Files:**
- Modify: `src/app/parallax/page.tsx`

**Context:**
Lines 303–308 currently render:
```tsx
<img
  src={LOGO.src}
  alt={LOGO.alt}
  className="w-[min(50vw,500px)]"
  draggable={false}
/>
```

**Step 1: Replace the single `<img>` with a stacked frame container**

Replace those 7 lines with:

```tsx
<div className="relative w-[min(50vw,500px)]" style={{ aspectRatio: '463 / 408' }}>
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

> **Note on aspect ratio:** `463 / 408` is an estimate based on the logo being wider than tall. If the frames render with clipping or letterboxing, inspect one SVG's `viewBox` attribute — the ratio is `width / height` of the viewBox — and update accordingly. Since the SVGs are very large files, check just the first line of `logo_anim_Frame___01.svg` for the viewBox: `grep -m1 "viewBox" public/parallax/logo_animation_Frames/logo_anim_Frame___01.svg`

**Step 2: Verify TypeScript**

```bash
cd d:/websites/IdleHours && npx tsc --noEmit
```
Expected: no errors.

---

### Task 3: Build and visual check

**Step 1: Run the build**

```bash
cd d:/websites/IdleHours && npm run build
```
Expected: clean build, no errors or warnings about the parallax page.

**Step 2: Start dev server and verify visually**

```bash
cd d:/websites/IdleHours && npm run dev
```

Navigate to `http://localhost:3000/parallax` and verify:
- Logo animates in a loop immediately on load
- Animation feels smooth (~18fps, not jerky)
- The existing fade-in (translateY slide-up on load) still works
- Mouse parallax tracking still works on all layers
- Scroll-to-card morph still works

If the aspect ratio looks wrong (logo squished or letterboxed), run:
```bash
grep -m1 "viewBox" "d:/websites/IdleHours/public/parallax/logo_animation_Frames/logo_anim_Frame___01.svg"
```
Extract the width/height from the viewBox and update `aspectRatio` in step 2 of Task 2.

---

### Task 4: Commit and push

**Step 1: Stage and commit**

```bash
cd d:/websites/IdleHours
git add src/app/parallax/page.tsx
git commit -m "feat(parallax): animate logo with 10-frame flipbook at 18fps"
```

**Step 2: Push dev and merge to main**

```bash
git push origin dev
git checkout main
git merge dev
git push origin main
git checkout dev
```
