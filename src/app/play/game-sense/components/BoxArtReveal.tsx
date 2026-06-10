'use client'

import { useMemo } from 'react'
import { mulberry32 } from '@/lib/game-shell/seededRng'
import { GAME_SENSE_MAX_PATCHES as MAX_PATCHES } from '@/lib/gameConstants'

// ---------------------------------------------------------------
// BoxArtReveal — organic patch reveal over cover art.
// Patches are seeded per day (same for every player) and unlock
// by revealLevel (driven by best-guess proximity thresholds in
// GAME_SENSE_REVEAL_THRESHOLDS, gameConstants.ts).
// Organic look = irregular blob paths + feTurbulence displacement
// so no edge ever reads as clean vector geometry.
// Art is NEVER purchasable — revealLevel derives from best
// proximity only; no point cost may feed into it.
// ---------------------------------------------------------------

type Props = {
  src: string          // cover art URL (IGDB image)
  daySeed: number      // deterministic per puzzle date
  revealLevel: number  // 0..GAME_SENSE_MAX_PATCHES
  width?: number
  height?: number
}

// Irregular closed blob: ring of points with jittered radius,
// smoothed with Catmull-Rom → cubic beziers so it's lumpy, not polygonal.
function blobPath(
  cx: number, cy: number, r: number, rng: () => number,
  points = 9, irregularity = 0.45,
): string {
  const pts: [number, number][] = []
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2 + rng() * 0.35
    const radius = r * (1 - irregularity / 2 + rng() * irregularity)
    pts.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius])
  }
  const get = (i: number) => pts[(i + points) % points]
  let d = `M ${get(0)[0]} ${get(0)[1]} `
  for (let i = 0; i < points; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2)
    const c1: [number, number] = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2: [number, number] = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]} `
  }
  return d + 'Z'
}

type Patch = { d: string; cx: number; cy: number }

// Patch placement: jittered grid cells so patches spread across the
// art (sampling sky/character/terrain) instead of clustering.
function generatePatches(seed: number, w: number, h: number): Patch[] {
  const rng = mulberry32(seed)
  const cells: [number, number][] = [
    [0.25, 0.22], [0.75, 0.22],
    [0.5, 0.5],
    [0.25, 0.78], [0.75, 0.78],
    [0.5, 0.85],
  ]
  // shuffle so the unlock ORDER varies per day too
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[cells[i], cells[j]] = [cells[j], cells[i]]
  }
  return cells.slice(0, MAX_PATCHES).map(([fx, fy]) => {
    const cx = fx * w + (rng() - 0.5) * w * 0.18
    const cy = fy * h + (rng() - 0.5) * h * 0.18
    const r = Math.min(w, h) * (0.13 + rng() * 0.09)
    return { d: blobPath(cx, cy, r, rng), cx, cy }
  })
}

export default function BoxArtReveal({
  src, daySeed, revealLevel, width = 300, height = 400,
}: Props) {
  const patches = useMemo(
    () => generatePatches(daySeed, width, height),
    [daySeed, width, height],
  )
  const maskId = `reveal-mask-${daySeed}`
  const roughId = `rough-edge-${daySeed}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Mystery game cover, partially revealed"
    >
      <defs>
        {/* THE organic-edge trick: noise-displace the mask shapes so
            every blob edge becomes ragged torn paper, never vector. */}
        <filter id={roughId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.045"
            numOctaves="3"
            seed={daySeed % 100}
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="16" />
        </filter>

        <mask id={maskId} maskUnits="userSpaceOnUse">
          <rect width={width} height={height} fill="black" />
          <g filter={`url(#${roughId})`}>
            {patches.map((p, i) => (
              <path
                key={i}
                d={p.d}
                fill="white"
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  transform: i < revealLevel ? 'scale(1)' : 'scale(0)',
                  transition: `transform 650ms cubic-bezier(0.34, 1.5, 0.64, 1) ${i < revealLevel ? 80 : 0}ms`,
                }}
              />
            ))}
          </g>
        </mask>
      </defs>

      {/* Wrap/placeholder layer — in the painted version this is the
          brown-paper texture; flat token fill for block-out. */}
      <rect width={width} height={height} rx={8} fill="hsl(var(--game-cream-dark))" />

      {/* The art, only visible through the torn patches */}
      <image
        href={src}
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid slice"
        mask={`url(#${maskId})`}
      />
    </svg>
  )
}
