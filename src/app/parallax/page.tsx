'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// --- Layer config (unchanged) ---
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

const ALL_MULTIPLIERS = [
  ...LAYERS.map((l) => l.multiplier),
  LOGO.multiplier,
  ...FRONT_LAYERS.map((l) => l.multiplier),
]

// --- Utility functions ---
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

// --- Card target dimensions ---
const NAV_HEIGHT = 56
const CARD_TOP = NAV_HEIGHT + 24
const CARD_SIDE_PADDING = 32
const CARD_MAX_WIDTH = 1280
const CARD_BORDER_RADIUS = 16
const CARD_ASPECT_RATIO = 16 / 9

// --- Frame start values ---
const FRAME_BORDER_START = 25
const FRAME_RADIUS_START = 37

export default function ParallaxPage() {
  const mouseRef = useRef({ x: 0, y: 0 })
  const animatedRef = useRef({ x: 0, y: 0 })
  const frozenRef = useRef(false)
  const rafRef = useRef<number>(0)
  const layerRefs = useRef<(HTMLDivElement | null)[]>([])
  const heroRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const [logoVisible, setLogoVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLogoVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const setRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    layerRefs.current[index] = el
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2),
        y: (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2),
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    const animate = () => {
      const scrollY = window.scrollY
      const rawT = clamp(scrollY / window.innerHeight, 0, 1)
      const t = easeOutCubic(rawT)

      if (rawT < 1) {
        frozenRef.current = false
        animatedRef.current.x += (mouseRef.current.x - animatedRef.current.x) * 0.05
        animatedRef.current.y += (mouseRef.current.y - animatedRef.current.y) * 0.05
      } else if (!frozenRef.current) {
        frozenRef.current = true
      }

      const maxMove = 30
      layerRefs.current.forEach((el, i) => {
        if (!el) return
        const mult = ALL_MULTIPLIERS[i]
        const x = animatedRef.current.x * maxMove * mult
        const y = animatedRef.current.y * maxMove * mult * 0.4
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      })

      const hero = heroRef.current
      const frame = frameRef.current
      const nav = navRef.current
      if (hero && frame && nav) {
        const vw = window.innerWidth
        const vh = window.innerHeight

        const cardWidth = Math.min(CARD_MAX_WIDTH, vw - CARD_SIDE_PADDING * 2)
        const cardLeft = (vw - cardWidth) / 2
        const cardRight = cardLeft
        const cardHeight = cardWidth / CARD_ASPECT_RATIO
        const cardBottom = vh - CARD_TOP - cardHeight

        const top = lerp(0, CARD_TOP, t)
        const left = lerp(0, cardLeft, t)
        const right = lerp(0, cardRight, t)
        const bottom = lerp(0, Math.max(cardBottom, 0), t)

        hero.style.top = `${top}px`
        hero.style.left = `${left}px`
        hero.style.right = `${right}px`
        hero.style.bottom = `${bottom}px`
        hero.style.borderRadius = `${lerp(0, CARD_BORDER_RADIUS, t)}px`

        const borderWidth = lerp(FRAME_BORDER_START, 0, t)
        const borderRadius = lerp(FRAME_RADIUS_START, CARD_BORDER_RADIUS, t)
        frame.style.border = `${borderWidth}px solid black`
        frame.style.borderRadius = `${borderRadius}px`
        frame.style.boxShadow = borderWidth > 0.5 ? '0 0 0 50vmax black' : 'none'

        const navOpacity = clamp(t * 1.5, 0, 0.8)
        nav.style.backgroundColor = `hsl(0 0% 100% / ${navOpacity})`
        nav.style.backdropFilter = t > 0.1 ? `blur(${lerp(0, 12, t)}px)` : 'none'
        nav.style.borderBottomColor = `hsl(0 0% 0% / ${lerp(0, 0.1, t)})`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  let layerIndex = 0

  return (
    <div
      className="min-h-[300vh]"
      style={{ background: 'hsl(30 47% 93%)' }}
    >
      {/* Placeholder nav */}
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 border-b border-transparent"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <span className="text-sm font-semibold tracking-tight text-white mix-blend-difference">
            idle hours
          </span>
          <div className="flex items-center gap-6">
            {['Game Library', 'Quizzes', 'Posts', 'About'].map((label) => (
              <span
                key={label}
                className="hidden text-sm font-medium text-white mix-blend-difference md:block"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </nav>

      {/* Fixed parallax hero — morphs from full-bleed to card */}
      <div
        ref={heroRef}
        className="fixed inset-0 z-10 overflow-hidden bg-black"
      >
        {/* Scene container — scaled up to hide edges */}
        <div className="absolute inset-0 scale-110">
          {/* Sky gradient */}
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

        {/* Black frame overlay */}
        <div
          ref={frameRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: '0 0 0 50vmax black',
            border: '25px solid black',
            borderRadius: '37px',
          }}
        />
      </div>

      {/* Scroll spacer */}
      <div className="h-screen" aria-hidden="true" />

      {/* Placeholder content below hero */}
      <div className="relative z-20 mx-auto max-w-7xl space-y-6 px-4 pb-16 pt-8 lg:px-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl p-8"
            style={{ background: 'hsl(30 30% 88%)', minHeight: '200px' }}
          >
            <div
              className="h-4 w-48 rounded"
              style={{ background: 'hsl(30 20% 78%)' }}
            />
            <div
              className="mt-4 h-3 w-full max-w-md rounded"
              style={{ background: 'hsl(30 20% 82%)' }}
            />
            <div
              className="mt-2 h-3 w-full max-w-sm rounded"
              style={{ background: 'hsl(30 20% 82%)' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
