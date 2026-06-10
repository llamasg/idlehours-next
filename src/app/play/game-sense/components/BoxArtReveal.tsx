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

type Patch = { paths: string[] }

// ── Placement v2: FIXED outside-in zone sequence ─────────────────────────────
// Cover art carries the answer's logo, so reveal order is information-aware:
// weakest regions (corners) first, title zones (centre-top / centre-bottom)
// last BY CONSTRUCTION — patches 5–6 are the only ones touching them.
// The per-day seed only jitters blob position WITHIN its zone (±5%) and blob
// shape; the zone ORDER never varies. Corner/edge centres stay inset ≥15%
// from the boundary (blunts platform-banner / rating-logo strips on scanned
// covers). A patch may be composed of two blobs (paired corners/edges).
//
// TODO: a future batch job (local OCR/text-detect pass over the ~4k covers)
// will store per-cover title bounding boxes for per-cover exclusions — it
// REFINES this zone heuristic; it never replaces the outside-in ordering.

const ZONE_SEQUENCE: { blobs: { fx: number; fy: number; scale: number }[] }[] = [
  { blobs: [{ fx: 0.20, fy: 0.20, scale: 0.6 }, { fx: 0.80, fy: 0.80, scale: 0.6 }] }, // 1: TL + BR corners, small
  { blobs: [{ fx: 0.80, fy: 0.20, scale: 0.6 }, { fx: 0.20, fy: 0.80, scale: 0.6 }] }, // 2: TR + BL corners, small
  { blobs: [{ fx: 0.16, fy: 0.50, scale: 0.8 }, { fx: 0.84, fy: 0.50, scale: 0.8 }] }, // 3: left + right edge strips, mid-height
  { blobs: [{ fx: 0.50, fy: 0.50, scale: 1.2 }] },                                     // 4: centre blob — the recognition moment
  { blobs: [{ fx: 0.50, fy: 0.30, scale: 1.2 }] },                                     // 5: upper-centre band
  { blobs: [{ fx: 0.50, fy: 0.72, scale: 1.25 }] },                                    // 6: lower-centre band — effectively full
]

const JITTER = 0.05      // ±5% of each dimension, within the zone
const EDGE_INSET = 0.15  // blob centres never closer than 15% to the boundary
const BASE_RADIUS = 0.17 // × min(w,h), scaled per zone

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

function generatePatches(seed: number, w: number, h: number): Patch[] {
  const rng = mulberry32(seed)
  return ZONE_SEQUENCE.slice(0, MAX_PATCHES).map((zone) => ({
    paths: zone.blobs.map(({ fx, fy, scale }) => {
      const cx = clamp(fx + (rng() - 0.5) * 2 * JITTER, EDGE_INSET, 1 - EDGE_INSET) * w
      const cy = clamp(fy + (rng() - 0.5) * 2 * JITTER, EDGE_INSET, 1 - EDGE_INSET) * h
      const r = Math.min(w, h) * BASE_RADIUS * scale * (0.92 + rng() * 0.16)
      return blobPath(cx, cy, r, rng)
    }),
  }))
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
            {patches.map((patch, i) => (
              <g
                key={i}
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  transform: i < revealLevel ? 'scale(1)' : 'scale(0)',
                  transition: `transform 650ms cubic-bezier(0.34, 1.5, 0.64, 1) ${i < revealLevel ? 80 : 0}ms`,
                }}
              >
                {patch.paths.map((d, j) => (
                  <path key={j} d={d} fill="white" />
                ))}
              </g>
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
