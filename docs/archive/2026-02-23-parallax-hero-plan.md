# Parallax Hero Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a full-viewport parallax hero scene at `/parallax` with mouse-tracked SVG layers and a logo entrance animation.

**Architecture:** Single `'use client'` page component using `useRef` for mouse tracking, `requestAnimationFrame` for smooth lerped movement, and CSS transitions for the logo entrance. All SVG layers are `<img>` tags positioned absolutely in a full-viewport container.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, pure CSS/JS parallax (no libraries)

---

### Task 1: Move SVG assets to /public/parallax/

**Files:**
- Move: `public/images/layer-02-foreground.svg` → `public/parallax/layer-02-foreground.svg`
- Move: `public/images/layer-03-trees-near.svg` → `public/parallax/layer-03-trees-near.svg`
- Move: `public/images/layer-04-trees-mid.svg` → `public/parallax/layer-04-trees-mid.svg`
- Move: `public/images/layer-05-hills-near.svg` → `public/parallax/layer-05-hills-near.svg`
- Move: `public/images/layer-06-hills-mid.svg` → `public/parallax/layer-06-hills-mid.svg`
- Move: `public/images/layer-07-mountains.svg` → `public/parallax/layer-07-mountains.svg`
- Move: `public/images/layer-08-sun.svg` → `public/parallax/layer-08-sun.svg`
- Move: `public/images/idle hours_logo-02.svg` → `public/parallax/idle-hours-logo.svg`

**Step 1: Create directory and move files**

```bash
mkdir -p public/parallax
mv "public/images/layer-02-foreground.svg" public/parallax/
mv "public/images/layer-03-trees-near.svg" public/parallax/
mv "public/images/layer-04-trees-mid.svg" public/parallax/
mv "public/images/layer-05-hills-near.svg" public/parallax/
mv "public/images/layer-06-hills-mid.svg" public/parallax/
mv "public/images/layer-07-mountains.svg" public/parallax/
mv "public/images/layer-08-sun.svg" public/parallax/
cp "public/images/idle hours_logo-02.svg" "public/parallax/idle-hours-logo.svg"
```

Note: The logo is copied (not moved) since it may be used elsewhere. The space in the filename is replaced with a hyphen for cleaner path references.

**Step 2: Verify files exist**

```bash
ls public/parallax/
```

Expected: All 8 SVG files listed.

**Step 3: Check if any existing code references the moved layer files**

Search for `layer-02`, `layer-03`, etc. in `src/`. If any references exist, update them to point to `/parallax/` instead of `/images/`. The logo at `public/images/idle hours_logo-02.svg` is preserved since it may be referenced elsewhere.

**Step 4: Commit**

```bash
git add public/parallax/ public/images/layer-*.svg
git commit -m "chore: move parallax SVG layers to /public/parallax/"
```

---

### Task 2: Create the parallax page component

**Files:**
- Create: `src/app/parallax/page.tsx`

**Step 1: Create the page file**

Create `src/app/parallax/page.tsx` with the full implementation:

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'

const LAYERS = [
  { src: '/parallax/layer-08-sun.svg', alt: 'Sun', multiplier: 0.5 },
  { src: '/parallax/layer-07-mountains.svg', alt: 'Mountains', multiplier: 1 },
  { src: '/parallax/layer-06-hills-mid.svg', alt: 'Distant hills', multiplier: 1.5 },
  { src: '/parallax/layer-05-hills-near.svg', alt: 'Near hills', multiplier: 2 },
  { src: '/parallax/layer-04-trees-mid.svg', alt: 'Mid trees', multiplier: 3 },
]

const LOGO = { src: '/parallax/idle-hours-logo.svg', alt: 'Idle Hours', multiplier: 3.5 }

const FRONT_LAYERS = [
  { src: '/parallax/layer-03-trees-near.svg', alt: 'Near trees', multiplier: 4 },
  { src: '/parallax/layer-02-foreground.svg', alt: 'Foreground', multiplier: 6 },
]

export default function ParallaxPage() {
  const mouseRef = useRef({ x: 0, y: 0 })
  const animatedRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)
  const layerRefs = useRef<(HTMLDivElement | null)[]>([])
  const [logoVisible, setLogoVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLogoVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2),
        y: (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2),
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    const allLayers = [
      ...LAYERS.map((l) => l.multiplier),
      LOGO.multiplier,
      ...FRONT_LAYERS.map((l) => l.multiplier),
    ]

    const animate = () => {
      animatedRef.current.x += (mouseRef.current.x - animatedRef.current.x) * 0.05
      animatedRef.current.y += (mouseRef.current.y - animatedRef.current.y) * 0.05

      const maxMove = 30

      layerRefs.current.forEach((el, i) => {
        if (!el) return
        const mult = allLayers[i]
        const x = animatedRef.current.x * maxMove * mult
        const y = animatedRef.current.y * maxMove * mult * 0.4
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const setRef = (index: number) => (el: HTMLDivElement | null) => {
    layerRefs.current[index] = el
  }

  let layerIndex = 0

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Sky gradient - static */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 60% at 65% 60%, #afc28e 0%, #517863 83.5%)',
        }}
      />

      {/* Back layers */}
      {LAYERS.map((layer) => {
        const idx = layerIndex++
        return (
          <div key={layer.src} ref={setRef(idx)} className="absolute inset-0 will-change-transform">
            <img
              src={layer.src}
              alt={layer.alt}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        )
      })}

      {/* Logo */}
      <div ref={setRef(layerIndex++)} className="absolute inset-0 will-change-transform">
        <div className="flex items-center justify-center w-full h-full">
          <img
            src={LOGO.src}
            alt={LOGO.alt}
            className="w-[min(50vw,500px)]"
            draggable={false}
            style={{
              transform: logoVisible ? 'translateY(0)' : 'translateY(40px)',
              opacity: logoVisible ? 1 : 0,
              transition: 'transform 0.8s ease-out 0.3s, opacity 0.8s ease-out 0.3s',
            }}
          />
        </div>
      </div>

      {/* Front layers */}
      {FRONT_LAYERS.map((layer) => {
        const idx = layerIndex++
        return (
          <div key={layer.src} ref={setRef(idx)} className="absolute inset-0 will-change-transform">
            <img
              src={layer.src}
              alt={layer.alt}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        )
      })}

      {/* Bottom gradient overlay */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, #1a2e23)',
        }}
      />
    </div>
  )
}
```

**Step 2: Verify the dev server loads the page**

```bash
# Start dev server if not running, then visit http://localhost:3000/parallax
npm run dev
```

Expected: The parallax scene renders with all layers visible, mouse tracking works, logo animates in.

**Step 3: Commit**

```bash
git add src/app/parallax/page.tsx
git commit -m "feat: add parallax hero page with mouse-tracked SVG layers"
```

---

### Task 3: Build verification

**Step 1: Run the production build**

```bash
npm run build
```

Expected: Build completes with no errors.

**Step 2: Commit any fixes if needed**

If the build surfaces issues, fix and commit.
