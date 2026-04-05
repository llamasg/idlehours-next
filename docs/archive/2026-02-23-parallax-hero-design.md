# Parallax Hero Page Design

## Overview
Full-viewport parallax hero scene at `/parallax` with layered SVG files tracked to mouse movement.

## Layer Stack (back to front)

| # | Layer | Source | Parallax Multiplier |
|---|-------|--------|-------------------|
| 0 | Sky | CSS radial gradient | 0 (static) |
| 1 | Sun | `layer-08-sun.svg` | 0.5 |
| 2 | Mountains | `layer-07-mountains.svg` | 1 |
| 3 | Hills mid | `layer-06-hills-mid.svg` | 1.5 |
| 4 | Hills near | `layer-05-hills-near.svg` | 2 |
| 5 | Trees mid | `layer-04-trees-mid.svg` | 3 |
| 6 | Logo | `idle hours_logo-02.svg` | 3.5 |
| 7 | Trees near | `layer-03-trees-near.svg` | 4 |
| 8 | Foreground | `layer-02-foreground.svg` | 6 |
| 9 | Bottom gradient | CSS `transparent → #1a2e23` | 0 (static) |

## Sky Gradient
`radial-gradient(ellipse 100% 60% at 65% 60%, #afc28e 0%, #517863 83.5%)`

## Parallax Engine
- Mouse position tracked via `useRef`, normalized to center of screen
- `requestAnimationFrame` loop with lerp factor 0.05
- Each layer: `translate3d(x * mult, y * mult * 0.4, 0)`
- Y movement at 40% of X movement

## Logo Entrance Animation
- Starts at `translateY(40px) opacity: 0`
- Transitions to `translateY(0) opacity: 1`
- CSS transition: `0.8s ease-out` with `0.3s` delay
- Triggered by state toggle on mount via `useEffect`

## File Structure
- SVGs moved from `/public/images/` to `/public/parallax/`
- Page component: `src/app/parallax/page.tsx`
