import { useState, useEffect } from 'react'

// ── Preset types ─────────────────────────────────────────────────────────────

export type EntrancePreset =
  | 'pop'
  | 'fade'
  | 'move'
  | 'wipe'
  | 'word-pop'
  | 'slide-up'
  | 'rise'
  | 'wipe-right'
  | 'wipe-down'

// ── Easing constants ─────────────────────────────────────────────────────────

const BACK_OUT = 'cubic-bezier(0.34,1.56,0.64,1)'
const EXPO_IN_OUT = 'cubic-bezier(0.87,0,0.13,1)'

// ── Preset definitions ───────────────────────────────────────────────────────

interface PresetDef {
  hidden: React.CSSProperties
  animation: string
  /** Extra styles always applied when animating (e.g. transformOrigin) */
  extra?: React.CSSProperties
}

const PRESETS: Record<EntrancePreset, PresetDef> = {
  // Scale 0 → 120% → 100%
  pop: {
    hidden: { opacity: 0, transform: 'scale(0)' },
    animation: `ih-pop 0.3s ${BACK_OUT} both`,
  },
  // Simple opacity
  fade: {
    hidden: { opacity: 0 },
    animation: 'ih-fade 0.5s ease-in both',
  },
  // Slide from left with opacity
  move: {
    hidden: { opacity: 0, transform: 'translateX(-50px)' },
    animation: `ih-move 0.3s ${BACK_OUT} both`,
  },
  // ScaleX from center (XP bar style)
  wipe: {
    hidden: { transform: 'scaleX(0)' },
    animation: `ih-wipe 0.4s ${EXPO_IN_OUT} both`,
    extra: { transformOrigin: 'center' },
  },
  // Per-word pop with tilt — set --ih-tilt CSS var on element
  'word-pop': {
    hidden: { opacity: 0, transform: 'scale(0)' },
    animation: `ih-word-pop 0.3s ${BACK_OUT} both`,
  },
  // Content strip style — subtle slide up from 30px
  'slide-up': {
    hidden: { opacity: 0, transform: 'translateY(30px)' },
    animation: 'ih-slide-up 0.35s ease both',
  },
  // Gravity drop rise — bigger travel from 80px, springy
  rise: {
    hidden: { opacity: 0, transform: 'translateY(80px)' },
    animation: `ih-rise 0.4s ${BACK_OUT} both`,
  },
  // Clip-path horizontal reveal (left → right)
  'wipe-right': {
    hidden: { clipPath: 'inset(0 100% 0 0)' },
    animation: `ih-wipe-right 0.6s ${EXPO_IN_OUT} both`,
  },
  // Clip-path vertical reveal (top → bottom)
  'wipe-down': {
    hidden: { clipPath: 'inset(0 0 100% 0)' },
    animation: `ih-wipe-down 0.6s ${EXPO_IN_OUT} both`,
  },
}

// ── entrance() — returns inline style for a single element ───────────────────

/**
 * Returns the right CSSProperties for an entrance animation.
 *
 * @param preset  - which animation to use
 * @param active  - false = hidden (waiting), true = animating
 * @param delayMs - optional delay in ms (for staggering items within a step)
 */
export function entrance(
  preset: EntrancePreset,
  active: boolean,
  delayMs?: number,
): React.CSSProperties {
  const def = PRESETS[preset]

  if (!active) return def.hidden

  // Build animation string, inserting delay if provided
  let anim = def.animation
  if (delayMs && delayMs > 0) {
    // Insert delay before "both" — e.g. "ih-pop 0.3s ease both" → "ih-pop 0.3s ease 80ms both"
    anim = anim.replace(' both', ` ${delayMs}ms both`)
  }

  return { animation: anim, ...def.extra }
}

// ── useEntranceSteps() — setTimeout-based step sequencer ─────────────────────

/**
 * Fires a sequence of steps with configurable gaps between each.
 * Returns the current step number (0 = all hidden).
 *
 * @param stepCount - total number of steps (1-indexed, so step 1 is the first visible)
 * @param gaps      - array of ms delays: gaps[0] = delay before step 1, gaps[1] = delay before step 2, etc.
 * @param active    - when true, starts the sequence. When false, resets to 0.
 */
export function useEntranceSteps(
  stepCount: number,
  gaps: number[],
  active: boolean,
): number {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!active) {
      setStep(0)
      return
    }

    const timers: ReturnType<typeof setTimeout>[] = []
    let elapsed = 0

    for (let i = 0; i < stepCount; i++) {
      elapsed += gaps[i] ?? 0
      const target = i + 1
      timers.push(setTimeout(() => setStep(target), elapsed))
    }

    return () => timers.forEach(clearTimeout)
  }, [active, stepCount, gaps])

  return step
}
