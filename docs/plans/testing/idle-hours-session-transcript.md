# Idle Hours — UI/Animation Session Transcript
## Context for Claude Code

This document summarises a full design + animation session building the `/play` page for Idle Hours (idlehours.co.uk). It is intended to give Claude Code the context, decisions, and hard-won lessons from this session so it can continue work on the component library without repeating mistakes.

---

## Project Overview

**Idle Hours** is a cosy games editorial blog + original browser games. Stack: Next.js App Router, TypeScript, Tailwind, Sanity v5.

**People:** Alfie = owner/designer/developer. Beth = editorial writer. Pip = AI writing assistant.

**Design brief in one sentence:** "Familiar to use, surprising to look at."

---

## UI Kit v5 — Non-Negotiables

The UI kit HTML (`idle-hours-ui-kit-v5.html`) is the source of truth. Key rules:

**Colour system (60/30/10):**
- Cream `#F0EBE0` + Ink `#1A1A14` = 60% base
- Blue `#4A8FE8` = daily games accent ONLY
- Amber `#C8873A` = Blitz ONLY
- `ink-light` = `#6A6A56`
- Do NOT use blue decoratively. Do NOT use ink for backgrounds/containers.

**CSS variables:**
```css
--cream: #F0EBE0; --cream-dark: #E4DBCC; --cream-mid: #EAE3D6;
--white: #FDFAF5; --ink: #1A1A14; --ink-mid: #4A4A3A;
--ink-light: #6A6A56; --ink-dim: #C0B89A; --divider: rgba(26,26,20,0.1);
--blue: #4A8FE8; --blue-dark: #2D6BC4; --blue-light: #EBF2FC;
--amber: #C8873A; --amber-lt: #F5E6D3;
--purple: #5B4FCF; --purple-lt: rgba(91,79,207,0.1);
--spring: cubic-bezier(0.34,1.5,0.64,1);
```

**Shape grammar:**
- Stat pills = `border-radius: 100px`
- Context chips = `border-radius: 6px`
- Do NOT mix these

**Stripe texture:** Reserved for energy/accent moments only (Blitz card). Not on body/cards/decoration.

**Animation easing:** `cubic-bezier(0.34,1.5,0.64,1)` everywhere for spring feel. Never ease-in-out.

**Stickers:** Always tilt. Alternate `-1.5deg` / `+1.5deg`. One per card max.

---

## Brand Voice

UK English always. No em dashes. Contractions mandatory. Second person. Warm + specific. Honest without bleak.

**Banned words:** deep dive, masterpiece, hidden gem, must-play, game-changing, iconic, unique, amazing, journey, casual gamers, cozy (US spelling).

**Target persona: Finn** — 25–35, full-time creative/knowledge worker, games in gaps, degree-educated, allergic to AAA hype, Letterboxd-haver with backlog guilt. Lead with honesty. Be specific. Earn the humour. Respect the time.

---

## The Five Games

- **Game Sense** — Fill-in-blank from description. Ranks: Keep Guessing → Encyclopaedic. Purple world.
- **Street Date** — Guess release year from covers. Ranks: New to the Medium → Time Archivist. Blue/muted.
- **Shelf Price** — Higher/lower. Five rounds. Ranks: Just Another Consumer → Industry Insider. Amber world.
- **Blitz** — Timed word association. Amber accent. Lives at `/play/blitz`. NOT blue.
- **Ship It** — Navigate publishers, launch indie game. Narrative experience. NOT one-play-only.

---

## /play Page — What Was Built

`idle-hours-play-v12.html` is the clean final version. It contains:
1. Sticky nav
2. Hero (title, body, today card)
3. Daily games grid (3 cards: Game Sense, Street Date, Shelf Price)
4. Badge shelf
5. Blitz section
6. Ship It section
7. More coming section
8. Footer

The v12 file uses a clean animation system described below.

---

## Animation System — What Was Learned the Hard Way

### The Core Mental Model

**Work backwards from the finished state. Hiding in reverse looks like building.**

1. Start with the fully visible static page (v7 = the clean reference)
2. Hide everything
3. The animation sequence is just a controlled unhide in reverse order of visual importance
4. The browser has already done all layout work — you're only controlling visibility

### How to Hide Things (Critical)

**`style="opacity:0"` inline in the HTML is the only guarantee.**

CSS classes race with rendering and can lose. JS `opacity:0` runs after first paint. Inline styles fire before CSS, before JS, before the first pixel is drawn.

Every element that must be invisible on frame 0 gets `style="opacity:0"` directly in the HTML:

```html
<nav class="nav" style="opacity:0">
<h1 class="hero-title" style="opacity:0">
<div class="blitz-card" style="opacity:0">
```

### How to Reveal Things

One function. Everything goes through it. No exceptions:

```js
function show(el, duration = 0.35) {
  const els = typeof el === 'string' ? qsa(el) : (Array.isArray(el) ? el : [el]);
  els.forEach(e => {
    e.style.transition = `opacity ${duration}s ease`;
    e.style.opacity = '1';
  });
}
```

Sets `style.opacity` directly — inline style level, nothing can fight it.

### Container vs Individual Elements

**Scale a group container, not individual elements.**

When three cards need to animate together:
- Put them in a flex container
- Scale the container
- Gaps scale with it — overlap is impossible
- Translate is one operation not three

```js
// Measure real card positions
const rects = wraps.map(w => w.getBoundingClientRect());
const gap   = rects[1].left - rects[0].right; // real gap from DOM

// Build container sized to match the grid exactly
container.style.width = (rects[2].right - rects[0].left) + 'px';
container.style.gap   = gap + 'px';
// Center it on screen
container.style.left  = (vpW - containerW) / 2 + 'px';
container.style.top   = (vpH - containerH) / 2 + 'px';
```

### Never `getBoundingClientRect()` — Just Let the Browser Tell You

Don't calculate where things should go. Measure where they already are:

```js
const rects = wraps.map(w => w.getBoundingClientRect());
// tx/ty = offset from container's centered position to real grid position
const tx = gridL - containerL;
const ty = gridT  - containerT;
```

### GSAP for Physics Sequences

Multi-segment animations where each segment needs a different easing belong in a GSAP timeline:

```js
gsap.timeline()
  .to(container, { scale: 0.18, duration: 0.10, ease: 'power2.in'  }) // crouch
  .to(container, { scale: 1.40, duration: 0.38, ease: 'power4.out' }) // explosion
  .to(container, { scale: 1.40, duration: 0.14, ease: 'none'       }) // hold at peak
  .to(container, { scale: 1.0, x: tx, y: ty, opacity: 0, duration: 0.20, ease: 'power3.in' }) // crash + land
```

Each `.to()` describes one physical thing happening. CSS `@keyframes` with percentages can only approximate this with one outer curve.

### Plain async/await for Reveal Chains

Sequential reveals don't need a framework:

```js
const wait = ms => new Promise(r => setTimeout(r, ms));

await wait(150);
show('.hero-title');
await wait(60);
show('.hero-body');
```

Readable, debuggable, sufficient.

### NEVER Transform Elements That Contain CSS Grids

`scale()` on a grid/flex container breaks child layout — children recalculate sizes relative to the scaled box and bleed out of bounds.

```css
/* WRONG — breaks grid children */
[data-anim] { transform: scale(0.97); }

/* RIGHT — opacity only for grid/flex containers */
.blitz-card  { opacity: 0; }   /* contains grid */
.shipit-card { opacity: 0; }   /* contains grid */
```

---

## The Five-Layer Build Approach

Alfie works in layers and expects Claude to think this way too:

1. **Block out** — Grid, layout, relation between type/image/elements. Blanks only. Find balanced composition.
2. **Type + components** — Add type, refine hierarchies, place buttons, navigation.
3. **Imagery** — Colour, icons, stickers, extras.
4. **Microinteractions** — Hover, loop animations, active states.
5. **Animation** — Page-scale sequences, transitions, reveal systems.

**The animation layer is easy because:** layers 1–4 are already done. To sequence the reveal you just run the layers in reverse — remove imagery, then type, then components, then blocks. What's left is the start frame.

---

## What Claude Code Should Know About This Codebase

- Alfie uses Claude Code inside VS Code as primary dev workflow
- Prefers outputs as direct Claude Code prompts, not explanatory documentation
- Stack: Next.js App Router, TypeScript, Tailwind, Sanity v5, GSAP, Framer Motion
- Three separate Vercel repos (not branches): hospital site, token site, DApp
- Sanity project ID: yukwfyob, dataset: production (for Optimised Care — separate project)
- For Idle Hours: Sanity Studio deployed at idlehours.sanity.studio

---

## Component Library Brief (Next Task)

Alfie wants a multi-page UI kit HTML document — as in-depth as the existing v5 kit — covering:

**Page 1: Layout**
Grid lockups with Idle Hours character. Use blanks. Cover: daily game catalogue (5+ games), sticker collection across 2 weeks, achievements, featured game in listicle, homepage hierarchy (games + articles), lists, editorial annotations, image layouts, icons/toasts. Plus 5 original layout concepts.

**Page 2: Type + Components**
UI card concepts beyond what exists. Game poster + OpenCritic review, franchise card (e.g. Halo with many games), cluster cards, innovative tags, medals/context chips that feel earned. Type scale for editorial/blog as well as games.

**Page 3: Imagery**
Polaroids, full-width breaks, folder interactions, editorial type+image layouts.

**Page 4: Component Library**
12+ button variations (glows, hovers, scales, glass, pop-ups, text animation). 12+ additional components (chips, pucks, pills, search bars, sliders, calendars, like buttons, graphs, charts).

**Page 5: Microinteractions**
Virtual playground. Tooltips with inertia wobble, star earning animations, brand voice expressed as motion using Disney 12 principles.

**Page 6: Macro Animations**
Page transitions, system-level animation, UI cards morphing into containers, circle-mask reveals, content strip transitions.

---

## Successful UI Elements from v5 (Keep/Extend These)

- B1 primary button
- B2 stripe button  
- C2 results card
- C3 topic row interaction (hover)
- Stamp-down animation
- Stipple dots texture surface
- Icon sticker system
- Icon system on stipple notes
- Sticker tabs (overlapping labels)

---

## Illustration System (Pending — Alfie Produces These)

Animal character badges: circular, anthropomorphic animals with category-relevant props, locked 3-colour palette (purple `#563bd6`, navy `#0e0956`, white). Midjourney params: `--chaos 5 --raw --sref 4555087809 --stylize 50 --weird 8`.

Ship It characters: Hay Billed, Noel Ife, Earl E. Access, Lin Guist, Andi Capp, Arti Fidal, Fran Chives, Anna Lytics, Pony A. Bull, Lily Padd, Nin Ken Don.

---

## Accessibility

WCAG 2.2. Body text min 4.5:1, large text min 3:1.
- `#1A1A14` on `#F0EBE0`: 15.2:1 ✅
- `#6A6A56` on `#F0EBE0`: 4.6:1 ✅
- `#C8873A` on `#F0EBE0`: 2.1:1 ❌ decorative only
