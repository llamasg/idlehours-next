'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'

// ── Badge data ──────────────────────────────────────────────────────────────────

interface Badge {
  rank: number
  name: string
  file: string
  holo?: boolean
}

interface GameGroup {
  game: string
  slug: string
  accent: string
  badges: Badge[]
}

const UNIVERSAL: Badge = {
  rank: 0,
  name: 'Bust',
  file: '/images/badges/00_BUST.png',
}

const GAMES: GameGroup[] = [
  {
    game: 'Game Sense',
    slug: 'game-sense',
    accent: 'hsl(var(--game-blue))',
    badges: [
      { rank: 1, name: 'Skill Issue', file: '/images/badges/Game Sense_01__Skill Issue.png' },
      { rank: 2, name: 'Button Masher', file: '/images/badges/Game Sense_02_Button Masher.png' },
      { rank: 3, name: 'Big Brain', file: '/images/badges/Game Sense_03_Big Brain.png' },
      { rank: 4, name: 'One Shot', file: '/images/badges/Game Sense_04_One Shot.png', holo: true },
    ],
  },
  {
    game: 'Street Date',
    slug: 'street-date',
    accent: 'hsl(var(--game-green))',
    badges: [
      { rank: 1, name: 'Newbie', file: '/images/badges/Street Date_01_Newbie.png' },
      { rank: 2, name: 'Has a Backlog', file: '/images/badges/Street Date_02_Has a Backlog.png' },
      { rank: 3, name: 'Day One', file: '/images/badges/Street Date_03_Day One.png' },
      { rank: 4, name: 'The Curator', file: '/images/badges/Street Date_04_The Curator.png', holo: true },
    ],
  },
  {
    game: 'Shelf Price',
    slug: 'shelf-price',
    accent: '#5B4FCF',
    badges: [
      { rank: 1, name: "Mom's Credit Card", file: '/images/badges/Shelf Price_01_Moms Credit card.png' },
      { rank: 2, name: 'Bargain Hunter', file: '/images/badges/Shelf Price_02_bargain hunter.png' },
      { rank: 3, name: 'Secret Shopper', file: '/images/badges/Shelf Price_03_Secret Shopper.png' },
      { rank: 4, name: 'Head of Sales', file: '/images/badges/Shelf Price_04_head of sales.png', holo: true },
    ],
  },
]

// ── Spring helper ───────────────────────────────────────────────────────────────

function useSpring(target: { x: number; y: number }, stiffness = 0.08, damping = 0.82) {
  const pos = useRef({ x: target.x, y: target.y })
  const vel = useRef({ x: 0, y: 0 })
  const raf = useRef<number>(0)
  const [value, setValue] = useState(target)

  useEffect(() => {
    pos.current = { x: target.x, y: target.y }
    vel.current = { x: 0, y: 0 }
    setValue(target)
  }, []) // reset on mount only

  const update = useCallback(() => {
    const dx = target.x - pos.current.x
    const dy = target.y - pos.current.y
    vel.current.x = vel.current.x * damping + dx * stiffness
    vel.current.y = vel.current.y * damping + dy * stiffness
    pos.current.x += vel.current.x
    pos.current.y += vel.current.y
    setValue({ x: pos.current.x, y: pos.current.y })

    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1 || Math.abs(vel.current.x) > 0.1 || Math.abs(vel.current.y) > 0.1) {
      raf.current = requestAnimationFrame(update)
    }
  }, [target.x, target.y, stiffness, damping])

  useEffect(() => {
    raf.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf.current)
  }, [update])

  return value
}

// ── Lightbox ────────────────────────────────────────────────────────────────────

function BadgeLightbox({
  badge,
  onClose,
}: {
  badge: Badge & { gameAccent: string }
  onClose: () => void
}) {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 })
  const [rawMouse, setRawMouse] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const springPos = useSpring(rawMouse, 0.06, 0.85)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    setRawMouse({ x: e.clientX, y: e.clientY })

    // normalised 0-1 coords for holo effect
    setMouse({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) })
  }, [])

  // badge rotation based on mouse (subtle tilt for "observer" effect)
  const tiltX = (mouse.y - 0.5) * -20
  const tiltY = (mouse.x - 0.5) * 20

  // pointer distance from center for holo brightness
  const fromCenter = Math.sqrt((mouse.x - 0.5) ** 2 + (mouse.y - 0.5) ** 2) / 0.5

  // Generate a mask data URL from the badge image alpha channel
  const [maskUrl, setMaskUrl] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!badge.holo) return
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      setMaskUrl(canvas.toDataURL('image/png'))
    }
    img.src = badge.file
  }, [badge.file, badge.holo])

  const holoMask = maskUrl ? {
    maskImage: `url(${maskUrl})`,
    WebkitMaskImage: `url(${maskUrl})`,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat' as const,
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
  } : { opacity: 0 }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
    >
      {/* Badge — follows mouse with spring */}
      <div
        className="pointer-events-none relative"
        style={{
          transform: `translate(${(springPos.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0)) * 0.06}px, ${(springPos.y - (typeof window !== 'undefined' ? window.innerHeight / 2 : 0)) * 0.06}px) perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transition: 'none',
        }}
      >
        <div className="relative w-[320px] h-[320px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={badge.file}
            alt={badge.name}
            className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]"
          />

          {/* Holo overlay — only for holo badges */}
          {badge.holo && (
            <>
              {/* Rainbow shine layer */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(
                      110deg,
                      hsl(0, 90%, 65%) 0%,
                      hsl(40, 90%, 60%) 8%,
                      hsl(80, 85%, 55%) 16%,
                      hsl(160, 80%, 55%) 24%,
                      hsl(210, 90%, 60%) 32%,
                      hsl(270, 85%, 60%) 40%,
                      hsl(320, 85%, 60%) 48%,
                      hsl(0, 90%, 65%) 56%
                    )
                  `,
                  backgroundSize: '400% 400%',
                  backgroundPosition: `${10 + mouse.x * 80}% ${10 + mouse.y * 80}%`,
                  filter: `brightness(${0.6 + fromCenter * 0.3}) contrast(1.8) saturate(0.9)`,
                  mixBlendMode: 'color-dodge',
                  opacity: 0.36,
                  ...holoMask,
                }}
              />

              {/* Scanline texture */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(
                      0deg,
                      transparent 0px,
                      transparent 1px,
                      rgba(255,255,255,0.03) 1px,
                      rgba(255,255,255,0.03) 2px
                    )
                  `,
                  mixBlendMode: 'overlay',
                  ...holoMask,
                }}
              />

              {/* Radial glare that follows pointer */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    radial-gradient(
                      farthest-corner circle at ${mouse.x * 100}% ${mouse.y * 100}%,
                      hsla(0, 0%, 100%, 0.7) 0%,
                      hsla(0, 0%, 100%, 0.4) 15%,
                      hsla(0, 0%, 0%, 0.3) 70%,
                      transparent 100%
                    )
                  `,
                  mixBlendMode: 'overlay',
                  opacity: 0.39,
                  ...holoMask,
                }}
              />

              {/* Secondary rainbow at different angle for depth */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(
                      -30deg,
                      hsl(280, 80%, 60%) 0%,
                      hsl(200, 90%, 55%) 14%,
                      hsl(130, 80%, 50%) 28%,
                      hsl(50, 90%, 60%) 42%,
                      hsl(0, 85%, 60%) 56%,
                      hsl(280, 80%, 60%) 70%
                    )
                  `,
                  backgroundSize: '300% 300%',
                  backgroundPosition: `${25 + (1 - mouse.x) * 50}% ${25 + (1 - mouse.y) * 50}%`,
                  filter: `brightness(${0.5 + fromCenter * 0.4}) contrast(2) saturate(0.7)`,
                  mixBlendMode: 'color-dodge',
                  opacity: 0.23,
                  ...holoMask,
                }}
              />
            </>
          )}
        </div>

        {/* Badge name */}
        <p className="mt-6 text-center font-heading text-lg font-black text-white/90 tracking-wide">
          {badge.name}
        </p>
      </div>
    </div>
  )
}

// ── Badge card ──────────────────────────────────────────────────────────────────

function BadgeCard({
  badge,
  accent,
  onClick,
}: {
  badge: Badge
  accent: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-3 p-5 transition-transform hover:-translate-y-1"
      style={{ transition: 'transform 0.2s cubic-bezier(0.34,1.5,0.64,1)' }}
    >
      <div className="relative w-[120px] h-[120px] transition-transform duration-200 group-hover:scale-105">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={badge.file}
          alt={badge.name}
          className="absolute inset-0 w-full h-full object-contain"
        />
        {badge.holo && (
          <div className="absolute -top-1 -right-1 rounded-full bg-gradient-to-br from-violet-400 via-cyan-300 to-emerald-400 px-1.5 py-0.5 font-heading text-[8px] font-black uppercase tracking-wider text-white shadow-sm">
            Holo
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="font-heading text-[13px] font-bold text-[hsl(var(--game-ink))]">
          {badge.name}
        </p>
        <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-light))]">
          Rank {badge.rank}
        </p>
      </div>
    </button>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────────

export default function BadgesPage() {
  const [lightbox, setLightbox] = useState<(Badge & { gameAccent: string }) | null>(null)

  return (
    <>
      <main
        className="min-h-screen px-6 py-16"
        style={{
          backgroundColor: '#F5F0E4',
          backgroundImage: 'radial-gradient(circle, rgba(26,26,20,0.07) 1px, transparent 1px)',
          backgroundSize: '10px 10px',
        }}
      >
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <Link
            href="/staging"
            className="font-heading text-[11px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))] hover:text-[hsl(var(--game-ink))] transition-colors"
          >
            &larr; Staging
          </Link>

          <p className="mt-6 font-heading text-[9px] font-black uppercase tracking-[0.35em] text-[hsl(var(--game-amber))]">
            Asset Review
          </p>
          <h1 className="mt-2 font-heading text-[clamp(36px,6vw,56px)] font-black leading-[0.95] tracking-tight text-[hsl(var(--game-ink))]">
            Badge<br />Artwork
          </h1>
          <p className="mt-4 max-w-md font-heading text-[15px] font-semibold italic text-[hsl(var(--game-ink-mid))]">
            All badge artwork for the three daily games. Click any badge to view it in the lightbox.
          </p>

          {/* Universal bust badge */}
          <section className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--game-red))] font-heading text-[11px] font-black text-white shadow-[0_2px_6px_rgba(200,58,58,0.4)]" style={{ transform: 'rotate(-2deg)' }}>
                00
              </span>
              <h2 className="font-heading text-lg font-black text-[hsl(var(--game-ink))]">
                Universal
              </h2>
            </div>
            <p className="mb-4 font-heading text-[12px] font-semibold text-[hsl(var(--game-ink-light))]">
              Shared across all games — awarded for scoring 0 points.
            </p>
            <div className="inline-block">
              <BadgeCard
                badge={UNIVERSAL}
                accent="hsl(var(--game-red))"
                onClick={() => setLightbox({ ...UNIVERSAL, gameAccent: 'hsl(var(--game-red))' })}
              />
            </div>
          </section>

          {/* Per-game sections */}
          {GAMES.map((group, gi) => (
            <section key={group.slug} className="mt-16">
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg font-heading text-[11px] font-black text-white"
                  style={{
                    backgroundColor: group.accent,
                    boxShadow: `0 2px 6px ${group.accent}66`,
                    transform: 'rotate(-2deg)',
                  }}
                >
                  {String(gi + 1).padStart(2, '0')}
                </span>
                <h2 className="font-heading text-lg font-black text-[hsl(var(--game-ink))]">
                  {group.game}
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {group.badges.map((badge) => (
                  <BadgeCard
                    key={badge.name}
                    badge={badge}
                    accent={group.accent}
                    onClick={() => setLightbox({ ...badge, gameAccent: group.accent })}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Lightbox */}
      {lightbox && (
        <BadgeLightbox badge={lightbox} onClose={() => setLightbox(null)} />
      )}
    </>
  )
}
