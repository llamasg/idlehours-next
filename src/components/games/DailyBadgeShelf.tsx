'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { type DailyGameSlug, GAME_THEME, BADGE_IMAGES } from '@/lib/ranks'
import { getDailyCompletion } from '@/lib/game-shell/completion'
import { DAILY_GAMES } from '@/lib/game-shell/registry'
import { getTodayDateString } from '@/lib/dateUtils'
import { entrance, useEntranceSteps } from '@/lib/animations'
import BadgeLightbox, { isHoloRank, HoloBadgeWrapper } from '@/components/games/BadgeLightbox'

// Derived from the manifest registry — a new daily game appears here with
// zero per-game wiring. (Registry order; previously a hardcoded, reversed
// three-game list.)
const GAMES = DAILY_GAMES.map((m) => ({
  slug: m.slug,
  label: m.label,
  href: `/play/${m.slug}`,
}))

// ── Step gaps ────────────────────────────────────────────────────────────────

const STEP_GAPS = [
  0,    // 1: container wipe
  250,  // 2: "Today's badges" heading fade
  200,  // 3: badge slots (staggered internally — 200ms apart)
  600,  // 4: rank texts fade (after badges have landed)
]

// ── Badge rotations per slot position ────────────────────────────────────────

const BADGE_ROTATIONS = ['-3deg', '2deg', '-1deg', '2.5deg']

// ── Component ───────────────────────────────────────────────────────────────

interface DailyBadgeShelfProps {
  /** The game the player just completed — triggers stamp animation */
  currentGame: DailyGameSlug
  animateStamp?: boolean
}

export default function DailyBadgeShelf({ currentGame, animateStamp = false }: DailyBadgeShelfProps) {
  const [lightbox, setLightbox] = useState<{ src: string; name: string; holo: boolean } | null>(null)
  const dateStr = useMemo(() => getTodayDateString(), [])

  const slots = useMemo(
    () => GAMES.map((g) => ({ ...g, ...getDailyCompletion(g.slug, dateStr) })),
    [dateStr],
  )

  const step = useEntranceSteps(4, STEP_GAPS, animateStamp)

  // Nudge loop for uncompleted badges — fires 2s after entrance, then every 10s
  const [nudgeKey, setNudgeKey] = useState(0)
  const uncompletedIndices = useMemo(
    () => slots.map((s, i) => (!s.completed ? i : -1)).filter((i) => i >= 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slots.map((s) => s.completed).join()],
  )

  useEffect(() => {
    if (step < 4 || uncompletedIndices.length === 0) return
    // First nudge 2s after entrance completes
    const firstTimer = setTimeout(() => {
      setNudgeKey((k) => k + 1)
    }, 2000)
    // Then every 10s
    const interval = setInterval(() => {
      setNudgeKey((k) => k + 1)
    }, 12000) // 2000 initial + 10000 repeat = first at 2s, then 12s, 22s...
    return () => { clearTimeout(firstTimer); clearInterval(interval) }
  }, [step, uncompletedIndices.length])

  return (
    <div
      className="mx-auto w-full max-w-[850px] overflow-hidden rounded-2xl px-6 py-6"
      style={{
        ...entrance('wipe', step >= 1),
        // Stipple dot notebook background — only visible once wipe reveals
        background: `
          radial-gradient(circle, rgba(26,26,20,0.07) 1px, transparent 1px),
          hsl(var(--game-cream-dark) / 0.35)
        `,
        backgroundSize: '10px 10px, 100% 100%',
        backgroundColor: 'hsl(48 30% 92%)',
      }}
    >
      {/* Section heading with line */}
      <div className="mb-5 flex items-center gap-3">
        <h3
          className="flex-shrink-0 font-heading text-[11px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink))]"
          style={entrance('fade', step >= 2)}
        >
          Today&apos;s badges
        </h3>
        <div
          className="h-px flex-1 bg-[hsl(var(--game-ink))]/10"
          style={entrance('fade', step >= 2)}
        />
        <Link
          href="/play"
          className="flex-shrink-0 font-heading text-[10px] font-bold text-[hsl(var(--game-ink-light))] transition-colors hover:text-[hsl(var(--game-ink))]"
          style={entrance('fade', step >= 2)}
        >
          Try our other daily games &rarr;
        </Link>
      </div>

      {/* Badge row */}
      <div className={`grid gap-6 ${slots.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
        {slots.map((slot, slotIndex) => {
          const justCompleted = slot.slug === currentGame && slot.completed
          // Stagger badges 200ms apart within step 3
          const badgeDelay = slotIndex * 200

          if (slot.completed) {
            return (
              <div key={slot.slug} className="group flex flex-col items-center gap-3">
                {/* Game label */}
                <span
                  className="font-heading text-[12px] font-extrabold uppercase tracking-[0.16em] text-[hsl(var(--game-ink))]"
                  style={entrance('fade', step >= 3, badgeDelay + 150)}
                >
                  {slot.label}
                </span>

                {/* Badge circle — hover on wrapper since inner has entrance animation */}
                <div
                  className="relative h-[120px] w-[120px] cursor-pointer transition-transform duration-200 group-hover:scale-[1.07] group-hover:rotate-[3deg]"
                  onClick={() => BADGE_IMAGES[slot.rankName] && setLightbox({ src: BADGE_IMAGES[slot.rankName], name: slot.rankName, holo: isHoloRank(slot.rankName) })}
                >
                  {BADGE_IMAGES[slot.rankName] ? (
                    isHoloRank(slot.rankName) ? (
                      <HoloBadgeWrapper
                        src={BADGE_IMAGES[slot.rankName]}
                        alt={slot.rankName}
                        size={120}
                        style={{
                          transform: justCompleted ? undefined : `rotate(${BADGE_ROTATIONS[slotIndex]})`,
                          ...entrance('pop', step >= 3, badgeDelay),
                        }}
                      />
                    ) : (
                    <div
                      className="flex h-[120px] w-[120px] items-center justify-center"
                      style={{
                        transform: justCompleted ? undefined : `rotate(${BADGE_ROTATIONS[slotIndex]})`,
                        ...entrance('pop', step >= 3, badgeDelay),
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={BADGE_IMAGES[slot.rankName]} alt={slot.rankName} className="h-full w-full object-contain" />
                    </div>
                    )
                  ) : (
                    <div
                      className="badge-shimmer flex h-[120px] w-[120px] items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-[0.04em] text-white/30"
                      style={{
                        backgroundColor: GAME_THEME[slot.slug].accent,
                        boxShadow: `0 0 0 4px white, 0 4px 12px ${GAME_THEME[slot.slug].shadow}`,
                        transform: justCompleted ? undefined : `rotate(${BADGE_ROTATIONS[slotIndex]})`,
                        ...entrance('pop', step >= 3, badgeDelay),
                      }}
                    >
                      BADGE
                    </div>
                  )}

                  {/* Ink rings — only on just-completed */}
                  {justCompleted && step >= 3 && (
                    <>
                      <div className="absolute inset-0 rounded-full border-2 animate-[ink-ring_0.6s_ease-out_0.3s_both]" style={{ borderColor: `color-mix(in srgb, ${GAME_THEME[slot.slug].accent} 50%, transparent)` }} />
                      <div className="absolute inset-0 rounded-full border-2 animate-[ink-ring_0.7s_ease-out_0.4s_both]" style={{ borderColor: `color-mix(in srgb, ${GAME_THEME[slot.slug].accent} 50%, transparent)` }} />
                    </>
                  )}

                  {/* Score float — only on just-completed */}
                  {justCompleted && step >= 3 && (
                    <div className="absolute inset-x-0 -top-2 flex justify-center animate-[score-float_0.9s_ease-out_0.5s_both]">
                      <span className="whitespace-nowrap font-heading text-[15px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                        +{slot.score} pts
                      </span>
                    </div>
                  )}
                </div>

                {/* Rank name */}
                <span
                  className="min-h-[18px] text-center font-heading text-[13px] font-extrabold leading-tight text-[hsl(var(--game-ink))]"
                  style={entrance('fade', step >= 4, slotIndex * 150)}
                >
                  {slot.rankName}
                </span>
              </div>
            )
          }

          // Empty slot — not yet played
          return (
            <Link
              key={slot.slug}
              href={slot.href}
              prefetch={false}
              className="group flex flex-col items-center gap-3 cursor-pointer"
              onClick={(e) => { e.stopPropagation() }}
            >
              {/* Game label */}
              <span
                className="font-heading text-[12px] font-extrabold uppercase tracking-[0.16em] text-[hsl(var(--game-ink))]"
                style={entrance('fade', step >= 3, badgeDelay + 150)}
              >
                {slot.label}
              </span>

              {/* Empty slot circle — matches UI kit empty shelf slot */}
              <div className="flex h-[120px] w-[120px] items-center justify-center">
                <div
                  key={`empty-${slot.slug}-${nudgeKey}`}
                  className="flex h-[96px] w-[96px] flex-col items-center justify-center gap-1 rounded-full border-2 border-dashed border-[hsl(var(--game-ink))]/20 bg-transparent transition-all duration-200 group-hover:scale-[1.07] group-hover:rotate-[3deg] group-hover:border-solid group-hover:border-[hsl(var(--game-ink))]/40"
                  style={
                    step < 3
                      ? entrance('fade', false, badgeDelay)
                      : nudgeKey > 0
                        ? { animation: `ih-nudge 0.3s cubic-bezier(0.34,1.56,0.64,1) ${uncompletedIndices.indexOf(slotIndex) * 150}ms both` }
                        : entrance('fade', true, badgeDelay)
                  }
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[hsl(var(--game-ink))]/25 transition-colors group-hover:text-[hsl(var(--game-ink))]/50">
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="font-heading text-[10px] font-bold text-[hsl(var(--game-ink))]/40 transition-colors group-hover:text-[hsl(var(--game-ink))]/60">
                    Play
                  </span>
                </div>
              </div>

              {/* Empty rank label */}
              <span className="min-h-[18px] text-center font-heading text-[11px] font-semibold text-[hsl(var(--game-ink))]/30">
                Not played
              </span>
            </Link>
          )
        })}
      </div>
      {lightbox && (
        <BadgeLightbox src={lightbox.src} name={lightbox.name} holo={lightbox.holo} onClose={() => setLightbox(null)} />
      )}
    </div>
  )
}
