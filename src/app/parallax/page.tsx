'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// --- Layer config ---
interface LayerConfig {
  src: string
  alt: string
  multiplier: number
  /** If present, layer floats gently up/down via CSS translate animation */
  float?: { duration: number; delay: number }
}

// Rendered back-to-front (sky → foreground)
const BACK_LAYERS: LayerConfig[] = [
  { src: '/parallax/layer-08-sun.svg', alt: 'Sun', multiplier: 0.5 },
  { src: '/parallax/layer_bird 4.svg', alt: '', multiplier: 0.75, float: { duration: 3.0, delay: 0.3 } },
  { src: '/parallax/layer-07-mountains.svg', alt: 'Mountains', multiplier: 1 },
  { src: '/parallax/layer_bird 3.svg', alt: '', multiplier: 1.25, float: { duration: 3.5, delay: 1.4 } },
  { src: '/parallax/layer-06-hills-mid.svg', alt: 'Distant hills', multiplier: 1.5 },
  { src: '/parallax/layer_bird 2.svg', alt: '', multiplier: 1.75, float: { duration: 2.8, delay: 0.7 } },
  { src: '/parallax/layer-05-hills-near.svg', alt: 'Near hills', multiplier: 2 },
  { src: '/parallax/layer_bird 1.svg', alt: '', multiplier: 2.5, float: { duration: 3.2, delay: 0.0 } },
  { src: '/parallax/layer-04-trees-mid.svg', alt: 'Mid trees', multiplier: 3 },
]

const LOGO_FRAMES = Array.from({ length: 10 }, (_, i) =>
  `/parallax/logo_animation_Frames/logo_anim_Frame___${String(i + 1).padStart(2, '0')}.svg`
)
const LOGO_MULTIPLIER = 3.5
const LOGO_FPS = 12

const FRONT_LAYERS: LayerConfig[] = [
  { src: '/parallax/layer-03-trees-near.svg', alt: 'Near trees', multiplier: 4 },
  { src: '/parallax/layer-02-foreground.svg', alt: 'Foreground', multiplier: 6 },
]

const ALL_MULTIPLIERS = [
  ...BACK_LAYERS.map((l) => l.multiplier),
  LOGO_MULTIPLIER,
  ...FRONT_LAYERS.map((l) => l.multiplier),
]

// --- Nav links ---
const NAV_LINKS = [
  { label: 'POSTS', icon: '/images/IH_ICON_PENCIL.svg' },
  { label: 'PLAY', icon: '/images/IH_ICON_GAME.svg' },
  { label: 'LIBRARY', icon: '/images/IH_ICON_READ.svg' },
  { label: 'ABOUT', icon: '/images/IH_ICON_HAND.svg' },
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

// --- Layout constants ---
const NAV_HEIGHT = 64
const CARD_GAP = 24
const CARD_TOP = NAV_HEIGHT + CARD_GAP
const CARD_SIDE_PADDING = 32
const CARD_MAX_WIDTH = 1280
const CARD_BORDER_RADIUS = 16
const CARD_ASPECT_RATIO = 16 / 9

export default function ParallaxPage() {
  const mouseRef = useRef({ x: 0, y: 0 })
  const animatedRef = useRef({ x: 0, y: 0 })
  const frozenRef = useRef(false)
  const rafRef = useRef<number>(0)
  const layerRefs = useRef<(HTMLDivElement | null)[]>([])
  const heroRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const navIconsRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [logoVisible, setLogoVisible] = useState(false)
  const [frameIndex, setFrameIndex] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setLogoVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % LOGO_FRAMES.length)
    }, Math.round(1000 / LOGO_FPS))
    return () => clearInterval(id)
  }, [])

  const setRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      layerRefs.current[index] = el
    },
    []
  )

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

      // --- Parallax mouse tracking ---
      if (rawT < 1) {
        frozenRef.current = false
        animatedRef.current.x +=
          (mouseRef.current.x - animatedRef.current.x) * 0.05
        animatedRef.current.y +=
          (mouseRef.current.y - animatedRef.current.y) * 0.05
      } else {
        // Lerp back to center when frozen so the scene rests neutral
        animatedRef.current.x += (0 - animatedRef.current.x) * 0.05
        animatedRef.current.y += (0 - animatedRef.current.y) * 0.05
        frozenRef.current = true
      }

      // --- Parallax layer transforms (fade out with scroll) ---
      const maxMove = 30
      const parallaxFade = 1 - t
      layerRefs.current.forEach((el, i) => {
        if (!el) return
        const mult = ALL_MULTIPLIERS[i]
        const x = animatedRef.current.x * maxMove * mult * parallaxFade
        const y = animatedRef.current.y * maxMove * mult * 0.4 * parallaxFade
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      })

      // --- Hero morph via clip-path + scene scale ---
      const hero = heroRef.current
      const nav = navRef.current
      const navIcons = navIconsRef.current
      if (hero && nav) {
        const vw = window.innerWidth
        const vh = window.innerHeight

        // Card uses fixed 16:9 ratio to show the full scene
        const cardWidth = Math.min(CARD_MAX_WIDTH, vw - CARD_SIDE_PADDING * 2)
        const cardLeft = (vw - cardWidth) / 2
        const cardHeight = cardWidth / CARD_ASPECT_RATIO
        const cardBottom = vh - CARD_TOP - cardHeight
        // Scene must cover the card in both dimensions (like object-fit: cover)
        const targetScale = Math.max(cardWidth / vw, cardHeight / vh)

        // clip-path: inset(top right bottom left round radius)
        const clipTop = lerp(0, CARD_TOP, t)
        const clipRight = lerp(0, cardLeft, t)
        const clipBottom = lerp(0, Math.max(cardBottom, 0), t)
        const clipLeft = lerp(0, cardLeft, t)
        const clipRadius = lerp(0, CARD_BORDER_RADIUS, t)

        hero.style.clipPath = `inset(${clipTop}px ${clipRight}px ${clipBottom}px ${clipLeft}px round ${clipRadius}px)`

        // Scale scene from 1.1 (overscale for parallax edges) down to targetScale
        // so the entire viewport fits inside the card. Translate to keep center aligned.
        const scene = sceneRef.current
        if (scene) {
          const sceneScale = lerp(1.1, targetScale, t)
          const offsetY = (clipTop - clipBottom) / 2
          scene.style.transform = `translateY(${offsetY}px) scale(${sceneScale})`
        }

        // Nav: transparent → opaque, icons white → dark
        const navBgOpacity = clamp(t * 1.5, 0, 0.8)
        nav.style.backgroundColor = `hsl(30 47% 93% / ${navBgOpacity})`
        nav.style.backdropFilter =
          t > 0.1 ? `blur(${lerp(0, 12, t)}px)` : 'none'
        nav.style.borderBottomColor = `hsl(0 0% 0% / ${lerp(0, 0.08, t)})`

        // Icon/text color: white (invert 1) → dark (invert 0)
        if (navIcons) {
          const invertVal = lerp(1, 0, t)
          navIcons.style.filter = `brightness(0) invert(${invertVal})`
        }

        // Pull content up so it sits right below the hero card
        const content = contentRef.current
        if (content) {
          const gapToClose = vh - CARD_TOP - cardHeight - CARD_GAP
          content.style.marginTop = `-${Math.max(gapToClose, 0)}px`
        }
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
    <div style={{ background: 'hsl(30 47% 93%)' }}>
      {/* Google Fonts: Montserrat */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap"
        rel="stylesheet"
      />

      {/* Bird float keyframe — uses CSS `translate` property so it composes with
          JS-driven `transform` on the same element without conflict */}
      <style>{`
        @keyframes bird-float {
          0%, 100% { translate: 0 0; }
          50%       { translate: 0 -4px; }
        }
      `}</style>

      {/* Nav */}
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 border-b border-transparent"
      >
        <div
          ref={navIconsRef}
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8"
          style={{ filter: 'brightness(0) invert(1)' }}
        >
          {/* Logo icon */}
          <img
            src="/images/IH_ICON_LOGO.svg"
            alt="Idle Hours"
            className="h-8 w-auto"
            draggable={false}
          />

          {/* Nav links */}
          <div className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                className="hidden items-center gap-2 md:flex"
                href="#"
              >
                <img
                  src={link.icon}
                  alt=""
                  className="h-5 w-5"
                  draggable={false}
                />
                <span
                  className="text-sm font-bold"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    letterSpacing: '0.1em',
                  }}
                >
                  {link.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero wrapper — 200vh gives 100vh of scroll range for the sticky pin */}
      <div style={{ height: '200vh' }}>
      {/* Sticky parallax hero — clip-path morphs from full-bleed to card */}
      <div
        ref={heroRef}
        className="sticky top-0 h-screen overflow-hidden pointer-events-none"
        style={{ clipPath: 'inset(0px 0px 0px 0px round 0px)' }}
      >
        {/* Scene container — scaled up to hide edges, transform controlled by JS */}
        <div ref={sceneRef} className="absolute inset-0" style={{ transform: 'scale(1.1)' }}>
          {/* Sky gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 100% 60% at 65% 60%, #afc28e 0%, #517863 83.5%)',
            }}
          />

          {/* Back layers (sky → trees, birds interleaved) */}
          {BACK_LAYERS.map((layer) => {
            const idx = layerIndex++
            return (
              <div
                key={layer.src}
                ref={setRef(idx)}
                className="absolute inset-0 will-change-transform"
                style={layer.float ? {
                  animation: `bird-float ${layer.float.duration}s ease-in-out ${layer.float.delay}s infinite`,
                } : undefined}
              >
                <img
                  src={layer.src}
                  alt={layer.alt}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            )
          })}

          {/* Logo + subheader + CTAs */}
          <div
            ref={setRef(layerIndex++)}
            className="absolute inset-0 will-change-transform"
          >
            <div className="flex items-center justify-center w-full h-full">
              <div
                className="flex flex-col items-center gap-5"
                style={{
                  transform: logoVisible ? 'translateY(0)' : 'translateY(40px)',
                  opacity: logoVisible ? 1 : 0,
                  transition:
                    'transform 0.8s ease-out 0.3s, opacity 0.8s ease-out 0.3s',
                }}
              >
                <div
                  role="img"
                  aria-label="Idle Hours"
                  className="relative w-[min(50vw,500px)]"
                  style={{ aspectRatio: '1812.4 / 946.84' }}
                >
                  {LOGO_FRAMES.map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      draggable={false}
                      className="absolute inset-0 w-full h-full"
                      style={{ opacity: i === frameIndex ? 1 : 0 }}
                      fetchPriority={i === 0 ? 'high' : 'auto'}
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  ))}
                </div>
                <p
                  className="text-white/70 text-base tracking-widest"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  BOARD GAMES, CARD GAMES &amp; MORE
                </p>
                <div className="flex gap-3 mt-1 pointer-events-auto">
                  <a
                    href="/posts"
                    className="px-5 py-2.5 bg-white/15 backdrop-blur-sm rounded-full text-white text-sm font-bold tracking-wider hover:bg-white/30 hover:scale-105 active:scale-95 transition-all duration-200"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    READ THE BLOG
                  </a>
                  <a
                    href="/play/skill-issue"
                    className="px-5 py-2.5 bg-white/15 backdrop-blur-sm rounded-full text-white text-sm font-bold tracking-wider hover:bg-white/30 hover:scale-105 active:scale-95 transition-all duration-200"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    PLAY A GAME
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Front layers (near trees → foreground) */}
          {FRONT_LAYERS.map((layer) => {
            const idx = layerIndex++
            return (
              <div
                key={layer.src}
                ref={setRef(idx)}
                className="absolute inset-0 will-change-transform"
              >
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

      </div>
      </div>{/* close hero wrapper */}

      {/* Content — negative margin pulls it up to sit right below the hero card */}
      <div
        ref={contentRef}
        className="relative z-20"
        style={{ background: 'hsl(30 47% 93%)' }}
      >
      <div
        className="mx-auto max-w-7xl space-y-6 px-4 pb-16 pt-8 lg:px-8"
      >
        {Array.from({ length: 30 }, (_, i) => i + 1).map((i) => (
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
    </div>
  )
}
