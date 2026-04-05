# Parallax Scroll-Shrink Hero Design

## Overview
Extend the `/parallax` page so the full-viewport parallax hero shrinks into a contained card as the user scrolls, simulating the homepage layout. Scroll-driven CSS transforms with no external libraries.

## Scroll Mechanics
- Scroll range: `0` to `window.innerHeight`
- Progress: `t = clamp(scrollY / innerHeight, 0, 1)` with ease-out curve
- Hero container is `position: fixed`, inset values lerp from full-bleed to card form

## Interpolated Properties (t=0 → t=1)

| Property | Full bleed (t=0) | Card form (t=1) |
|----------|-----------------|-----------------|
| top | 0 | ~80px |
| left/right | 0 | dynamic container padding |
| bottom | 0 | auto (aspect-ratio locked) |
| border-radius | 0px | 16px |
| border (frame) | 25px black | 0px |
| boxShadow | corner fill | none |

## Card Target
- Max width: 1280px centered
- Side padding: 16px mobile / 32px desktop
- Top offset: ~80px (nav + gap)
- Height: aspect-ratio locked ~16:9

## Parallax Freeze
- t < 1: mouse tracking active
- t >= 1: freeze at last position
- Scroll back up: resume tracking

## Nav Bar
- Fixed top, z-50, transparent initially
- Background lerps from transparent to card/80 + backdrop-blur as t increases
- Placeholder content for now

## Below Content
- Spacer div (1x viewport height) for scroll room
- Placeholder grey blocks simulating homepage sections
- Same max-w-7xl container as homepage

## Background
- Page background: `bg-background` (linen) to match homepage
