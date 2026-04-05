# Idle Hours — UI System: Lessons & Approach for Claude Code

This document is for Claude Code working inside the Idle Hours Next.js project. It captures design principles, animation learnings, and the mental models that came out of a full design session with Alfie. Read this before touching any UI or animation work.

---

## The Design Language in One Sentence

**Familiar to use, surprising to look at.**

Not experimental for its own sake. Not conventional either. Every layout decision should feel like it could only be Idle Hours.

---

## Colour Rules

```
60% — Cream #F0EBE0 + Ink #1A1A14 (base)
30% — White #FDFAF5 (card surfaces)
10% — Blue #4A8FE8 (daily games accent ONLY)
      Amber #C8873A (Blitz ONLY)
```

- Blue is reserved for daily game UI. Do not use it decoratively.
- Amber is reserved for Blitz. Do not use it elsewhere.
- `ink-light` (#6A6A56) is the secondary text colour — not `#8A8A70` (fails AA).
- Do not use `--ink` as a container or background colour.

---

## Typography Rules

- Font: Montserrat. Weights: 400, 600, 700, 800, 900.
- UK English always. No em dashes (use commas or restructure).
- Letter-spacing on caps/eyebrows: 0.25–0.35em.
- Italic weight 600 for secondary/editorial voice (not 400).
- `clamp()` for responsive display sizes.

---

## Shape Grammar

| Element | Border Radius |
|---|---|
| Stat pills | 100px |
| Context chips | 6px |
| Cards | 20px |
| Nav/small UI | 6–8px |

Do not mix pill shapes with chip shapes. Pick one per context and hold it.

---

## Motion Easing

```css
--spring: cubic-bezier(0.34, 1.5, 0.64, 1);
```

Use this for: card hover, button press, sticker pop, any element that should feel physical and alive. Never `ease-in-out` on brand UI.

---

## The Five-Layer Build Approach

Always think in this order. Never skip a layer or mix them:

1. **Block out** — Layout, grid, proportions. No colour, no type. Just rectangles. Is the composition balanced? Does the hierarchy read as blanks?
2. **Type + components** — Place all text, buttons, nav, labels. Refine hierarchies.
3. **Imagery** — Colour, icons, stickers, textures, illustrations.
4. **Microinteractions** — Hover states, loop animations, active states.
5. **Animation** — Page-scale sequences, reveals, transitions.

**Why this matters for animation:** When you reach layer 5, the sequence is already written. You run the layers in reverse. Remove imagery → type → components → blocks. What remains is your start frame. The animation is just a controlled return to the finished state.

---

## Animation: Core Principles

### 1. Work backwards from the finished state

The finished page fully visible = Frame N. Hide everything. Play the unhide in reverse order of visual importance. "Hiding in reverse looks like building."

Never animate forward from zero. Always animate backward from done.

### 2. `style="opacity:0"` in the HTML is the only guarantee

CSS classes and stylesheets can race with rendering. JS `opacity:0` runs after first paint. **Inline styles fire before CSS, before JS, before the first pixel.**

```html
<!-- CORRECT — guaranteed invisible on frame 0 -->
<nav class="nav" style="opacity:0">
<div class="blitz-card" style="opacity:0">

<!-- WRONG — can race and lose -->
<div class="blitz-card" class="hidden">
```

### 3. One `show()` function — everything goes through it

```ts
function show(el: string | Element | Element[], duration = 0.35) {
  const els = typeof el === 'string'
    ? [...document.querySelectorAll(el)]
    : Array.isArray(el) ? el : [el];
  els.forEach(e => {
    (e as HTMLElement).style.transition = `opacity ${duration}s ease`;
    (e as HTMLElement).style.opacity = '1';
  });
}
```

No class toggling. No CSS specificity fights. Direct inline style. Nothing can override it.

### 4. Scale a container, not individual elements

When animating a group, wrap the group. Scale the wrapper. Gaps scale with it — overlap is impossible.

```ts
// Measure where the real elements are
const rects = cards.map(c => c.getBoundingClientRect());
const gap   = rects[1].left - rects[0].right; // real gap from DOM

// Build a container that matches the group's footprint exactly
container.style.width  = (rects[2].right - rects[0].left) + 'px';
container.style.height = rects[0].height + 'px';
container.style.gap    = gap + 'px';

// Center it on screen
container.style.left = (window.innerWidth  - containerW) / 2 + 'px';
container.style.top  = (window.innerHeight - containerH) / 2 + 'px';

// Set initial state BEFORE appending — browser paints this on frame 0
container.style.transform = 'scale(0.2)';
container.style.opacity   = '0';
document.body.appendChild(container);
container.getBoundingClientRect(); // force layout flush
```

### 5. Use `getBoundingClientRect()` — never calculate positions manually

The browser knows where everything is. Ask it.

```ts
const rect = element.getBoundingClientRect();
// rect.left, rect.top, rect.width, rect.height — all exact, all viewport-relative
```

Derive the offset from centered → real position:
```ts
const tx = gridLeft - containerLeft;
const ty = gridTop  - containerTop;
```

### 6. GSAP for multi-segment physics

Use GSAP when an animation has multiple segments each needing a different easing. A CSS `@keyframes` curve can only approximate this. GSAP expresses it exactly:

```ts
import gsap from 'gsap';

gsap.timeline()
  .to(container, { scale: 0.18, duration: 0.10, ease: 'power2.in'  }) // squash/crouch
  .to(container, { scale: 1.40, duration: 0.38, ease: 'power4.out' }) // explosion
  .to(container, { scale: 1.40, duration: 0.14, ease: 'none'       }) // gravity hold at peak
  .to(container, {                                                      // crash + land
      scale: 1.0,
      x: tx, y: ty,
      opacity: 0,
      duration: 0.20,
      ease: 'power3.in',
    });
```

Each `.to()` = one physical thing. `power2.in` = squashing. `power4.out` = explosive release. `none` = weightlessness at peak. `power3.in` = falls fast, no bounce.

### 7. Plain async/await for reveal chains

Sequential reveals need no framework:

```ts
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

await wait(150);
show('.hero-title');
await wait(60);
show('.hero-body');
await wait(150);
show('.badge-shelf');
```

Readable. Debuggable. Sufficient. Framer Motion's `AnimatePresence` is for React component lifecycle — it's the wrong model for a linear cinematic sequence.

### 8. Never apply transforms to elements that contain CSS grids

`scale()` on a grid/flex container creates a new stacking context. Children recalculate their sizes relative to the scaled box and break out of bounds.

```ts
// WRONG — breaks internal grid
element.style.transform = 'scale(0.97)';

// CORRECT — opacity only for grid/flex containers
element.style.opacity = '0';
```

---

## When to Use Which Animation Tool

| Situation | Tool |
|---|---|
| Multi-segment physics (squash/explode/land) | GSAP timeline |
| Sequential page reveals (opacity chain) | async/await + show() |
| React component mount/unmount | Framer Motion AnimatePresence |
| Layout transitions (size/position changes) | Framer Motion layout prop |
| Simple hover states | CSS transition |
| Spring feel on UI elements | CSS `--spring` cubic-bezier |

---

## Component Patterns

### Stickers
```tsx
// Always tilt. Alternate directions. One per card max.
<div className="sticker" style={{ transform: 'rotate(-1.5deg)' }}>Daily</div>
<div className="sticker" style={{ transform: 'rotate(1.5deg)' }}>New</div>
```

### Card internals reveal
Card image zones use `clip-path: inset(100% 0 0 0)` as the hidden state, then transition to `inset(0% 0 0 0)`. Text hierarchy within cards reveals top-to-bottom: type → title → desc → footer, 65–70ms apart.

### Buttons
- Primary: filled ink background, cream text, spring scale on hover
- Stripe: animated diagonal stripe background (the Blitz amber variant)
- Play buttons get a shimmer pass as a final animation flourish

---

## What's Pending (Alfie Produces These)

- Bespoke illustrations for all four game card image zones
- Ship It character illustrations (executive animal characters)
- Animal character badge illustrations (Midjourney: `--chaos 5 --raw --sref 4555087809 --stylize 50 --weird 8`)

Do not generate placeholder AI imagery. Use the structured placeholder divs already in the markup.

---

## File Reference

- `idle-hours-play-v12.html` — Clean /play page with correct animation system. Source of truth for animation approach.
- `idle-hours-ui-kit-v5.html` — UI Kit. Source of truth for design tokens and components.
- `idle-hours-persona.html` — Finn persona. Read before writing any copy.

---

## What Alfie Actually Wants from Claude Code

- Prompts not documentation. When in doubt, write the code.
- Layers in order. Don't add colour before the layout is right.
- No generic AI aesthetics. No Inter, no purple gradients on white, no predictable component patterns.
- UK English in all copy. "Cosy" not "cozy" (except in metadata/SEO).
- No em dashes. Ever.
- When something is broken, say what's broken and why, then fix it. Don't hedge.
