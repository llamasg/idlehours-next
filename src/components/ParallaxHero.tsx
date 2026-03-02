'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Sunrise, Sun, Sunset, Moon } from 'lucide-react'

// --- Time-of-day theming ---
type TimeStageKey = 'morning' | 'midday' | 'twilight' | 'night'

interface SunConfig {
  size: number
  gradient: string
  glow: string
}

interface TimeStage {
  key: TimeStageKey
  label: string
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  /** CSS filter applied to all non-logo SVG layers */
  layerFilter: string
  bottomColor: string
  sun: SunConfig
}

const TIME_STAGES: Record<TimeStageKey, TimeStage> = {
  morning: {
    key: 'morning',
    label: 'Morning',
    Icon: Sunrise,
    // Shift green layers to cool blue-green (pre-dawn)
    layerFilter: 'brightness(0.85) saturate(0.75) hue-rotate(60deg)',
    bottomColor: '#1a1228',
    sun: {
      size: 72,
      gradient: 'radial-gradient(circle, #fff5c8 0%, #ffcc66 60%, #ff9933 100%)',
      glow: '0 0 40px 20px rgba(255,180,60,0.55), 0 0 90px 50px rgba(255,140,30,0.25)',
    },
  },
  midday: {
    key: 'midday',
    label: 'Midday',
    Icon: Sun,
    layerFilter: 'none',
    bottomColor: '#1a2e23',
    sun: {
      size: 54,
      gradient: 'radial-gradient(circle, #ffffff 0%, #e7f2da 55%, #c8e0b0 100%)',
      glow: '0 0 30px 12px rgba(220,240,200,0.5), 0 0 70px 35px rgba(180,220,140,0.2)',
    },
  },
  twilight: {
    key: 'twilight',
    label: 'Twilight',
    Icon: Sunset,
    // hue-rotate(-130deg) shifts green (140°) → orange-red (10°)
    layerFilter: 'brightness(0.7) saturate(2.5) hue-rotate(-130deg)',
    bottomColor: '#1a0a1e',
    sun: {
      size: 80,
      gradient: 'radial-gradient(circle, #ffe0a0 0%, #ff7043 55%, #c62828 100%)',
      glow: '0 0 50px 28px rgba(255,120,50,0.6), 0 0 110px 65px rgba(180,40,20,0.3)',
    },
  },
  night: {
    key: 'night',
    label: 'Night',
    Icon: Moon,
    // hue-rotate(80deg) shifts green (140°) → blue (220°)
    layerFilter: 'brightness(0.25) saturate(0.6) hue-rotate(80deg)',
    bottomColor: '#04060f',
    sun: {
      size: 52,
      gradient: 'radial-gradient(circle, #f0f4ff 0%, #c8d8ff 60%, #8090c0 100%)',
      glow: '0 0 24px 10px rgba(180,200,255,0.45), 0 0 60px 30px rgba(100,130,220,0.18)',
    },
  },
}

const STAGE_ORDER: TimeStageKey[] = ['morning', 'midday', 'twilight', 'night']

function getInitialStage(): TimeStageKey {
  const h = new Date().getHours()
  if (h >= 5 && h < 10) return 'morning'
  if (h >= 10 && h < 17) return 'midday'
  if (h >= 17 && h < 21) return 'twilight'
  return 'night'
}

// --- Sun arc constants ---
// Sun/moon travels on an ellipse centred below the visible area.
// Angles in degrees: 0° = right, 90° = top, 180° = left (standard maths convention).
const STAGE_SUN_ANGLE: Record<TimeStageKey, number> = {
  morning:  135, // low left
  midday:   90,  // high centre
  twilight: 45,  // low right
  night:    115, // upper left (moon)
}
const ARC_CENTER_X = 50   // % across scene
const ARC_CENTER_Y = 115  // % — centre is below bottom edge so the arc is a natural horizon arc
const ARC_RX = 65         // horizontal radius in scene %
const ARC_RY = 95         // vertical radius in scene %

function sunAngleToPos(deg: number): { x: number; y: number } {
  const rad = (deg * Math.PI) / 180
  return {
    x: ARC_CENTER_X + ARC_RX * Math.cos(rad),
    y: ARC_CENTER_Y - ARC_RY * Math.sin(rad),
  }
}

// --- Sky gradient colour stops per stage ---
// Each entry is [inner, mid, outer] hex stops for the radial gradient
const STAGE_SKY_COLORS: Record<TimeStageKey, [string, string, string]> = {
  morning:  ['#ffb347', '#d4689c', '#3a2055'],
  midday:   ['#afc28e', '#7a9c78', '#517863'],
  twilight: ['#ff8c42', '#7e1f6b', '#0d0620'],
  night:    ['#1a2a4a', '#0d1525', '#050d1a'],
}

type RgbColor = [number, number, number]

function hexToRgb(hex: string): RgbColor {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

function lerpRgb(a: RgbColor, b: RgbColor, t: number): RgbColor {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

function rgbStr([r, g, b]: RgbColor): string {
  return `rgb(${r},${g},${b})`
}

// --- Layer config ---
interface LayerConfig {
  src: string
  alt: string
  multiplier: number
  /** If present, layer floats gently up/down via CSS translate animation */
  float?: { duration: number; delay: number }
}

// Rendered back-to-front (sky → foreground)
// Note: sun is not in this array — it's rendered as a CSS div at index 0 (SUN_MULTIPLIER)
const BACK_LAYERS: LayerConfig[] = [
  { src: '/parallax/layer_bird 4.svg', alt: '', multiplier: 0.75, float: { duration: 3.0, delay: 0.3 } },
  { src: '/parallax/layer-07-mountains.svg', alt: 'Mountains', multiplier: 1 },
  { src: '/parallax/layer_bird 3.svg', alt: '', multiplier: 1.25, float: { duration: 3.5, delay: 1.4 } },
  { src: '/parallax/layer-06-hills-mid.svg', alt: 'Distant hills', multiplier: 1.5 },
  { src: '/parallax/layer_bird 2.svg', alt: '', multiplier: 1.75, float: { duration: 2.8, delay: 0.7 } },
  { src: '/parallax/layer-05-hills-near.svg', alt: 'Near hills', multiplier: 2 },
  { src: '/parallax/layer_bird 1.svg', alt: '', multiplier: 2.5, float: { duration: 3.2, delay: 0.0 } },
  { src: '/parallax/layer-04-trees-mid.svg', alt: 'Mid trees', multiplier: 3 },
]

const SUN_MULTIPLIER = 0.5

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
  SUN_MULTIPLIER,                           // index 0 — CSS sun/moon div
  ...BACK_LAYERS.map((l) => l.multiplier), // indices 1–8
  LOGO_MULTIPLIER,                          // index 9
  ...FRONT_LAYERS.map((l) => l.multiplier), // indices 10–11
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

// --- Layout constants (exported for use by parent components) ---
export const NAV_HEIGHT = 64
export const CARD_GAP = 24
export const CARD_TOP = NAV_HEIGHT + CARD_GAP
export const CARD_SIDE_PADDING = 32
export const CARD_MAX_WIDTH = 1280
const CARD_BORDER_RADIUS = 16
const CARD_ASPECT_RATIO = 16 / 9
const PARALLAX_OVERREACH = 200

// --- Component ---
interface ParallaxHeroProps {
  contentRef?: React.RefObject<HTMLDivElement | null>
}

export default function ParallaxHero({ contentRef }: ParallaxHeroProps) {
  const mouseRef = useRef({ x: 0, y: 0 })
  const animatedRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)
  const lastDispatchedT = useRef(-1)
  const layerRefs = useRef<(HTMLDivElement | null)[]>([])
  const heroRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const [logoVisible, setLogoVisible] = useState(false)
  const [frameIndex, setFrameIndex] = useState(0)
  const [stage, setStage] = useState<TimeStageKey>(getInitialStage)
  const [clockTime, setClockTime] = useState(() => new Date())

  const skyRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLDivElement>(null)
  const sunAngleRef = useRef(STAGE_SUN_ANGLE[stage])
  const targetAngleRef = useRef(STAGE_SUN_ANGLE[stage])
  const skyRgbRef = useRef<[RgbColor, RgbColor, RgbColor]>(
    STAGE_SKY_COLORS[stage].map(hexToRgb) as [RgbColor, RgbColor, RgbColor]
  )
  const targetSkyRgbRef = useRef<[RgbColor, RgbColor, RgbColor]>(
    STAGE_SKY_COLORS[stage].map(hexToRgb) as [RgbColor, RgbColor, RgbColor]
  )

  useEffect(() => {
    const timer = setTimeout(() => setLogoVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setClockTime(new Date()), 1000)
    return () => clearInterval(id)
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

      // Dispatch scroll progress for Header transparency transition (only when changed)
      if (rawT !== lastDispatchedT.current) {
        lastDispatchedT.current = rawT
        window.dispatchEvent(new CustomEvent('parallax-scroll', { detail: { progress: rawT } }))
      }

      // --- Parallax mouse tracking ---
      if (rawT < 1) {
        animatedRef.current.x +=
          (mouseRef.current.x - animatedRef.current.x) * 0.05
        animatedRef.current.y +=
          (mouseRef.current.y - animatedRef.current.y) * 0.05
      } else {
        // Lerp back to center when frozen so the scene rests neutral
        animatedRef.current.x += (0 - animatedRef.current.x) * 0.05
        animatedRef.current.y += (0 - animatedRef.current.y) * 0.05
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

      // --- Sun arc animation (lerp current angle → target via shortest path) ---
      let angleDelta = targetAngleRef.current - sunAngleRef.current
      while (angleDelta > 180) angleDelta -= 360
      while (angleDelta < -180) angleDelta += 360
      sunAngleRef.current += angleDelta * 0.025
      const sunPos = sunAngleToPos(sunAngleRef.current)
      const sunEl = layerRefs.current[0]
      if (sunEl) {
        sunEl.style.top = `${sunPos.y.toFixed(2)}%`
        sunEl.style.left = `${sunPos.x.toFixed(2)}%`
      }

      // --- Sky gradient focal point tracks sun position (RGB channel lerp) ---
      const skyEl = skyRef.current
      if (skyEl) {
        const rate = 0.025
        skyRgbRef.current = [
          lerpRgb(skyRgbRef.current[0], targetSkyRgbRef.current[0], rate),
          lerpRgb(skyRgbRef.current[1], targetSkyRgbRef.current[1], rate),
          lerpRgb(skyRgbRef.current[2], targetSkyRgbRef.current[2], rate),
        ]
        const [inner, mid, outer] = skyRgbRef.current
        skyEl.style.background = `radial-gradient(ellipse 150% 100% at ${sunPos.x.toFixed(1)}% ${sunPos.y.toFixed(1)}%, ${rgbStr(inner)} 0%, ${rgbStr(mid)} 50%, ${rgbStr(outer)} 100%)`
      }

      // --- Toggle fade — visible only while hero is in full view ---
      const toggleEl = toggleRef.current
      if (toggleEl) {
        const toggleOpacity = rawT < 0.08 ? 1 : rawT < 0.18 ? lerp(1, 0, (rawT - 0.08) / 0.1) : 0
        toggleEl.style.opacity = toggleOpacity.toFixed(3)
        toggleEl.style.pointerEvents = toggleOpacity > 0 ? 'auto' : 'none'
      }

      // --- Hero morph via clip-path + scene scale ---
      const hero = heroRef.current
      if (hero) {
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
          const sceneScale = lerp(1.0, targetScale, t)
          const offsetY = (clipTop - clipBottom) / 2
          scene.style.transform = `translateY(${offsetY}px) scale(${sceneScale})`
        }

        // Pull content up so it sits right below the hero card
        if (contentRef?.current) {
          const gapToClose = vh - CARD_TOP - cardHeight - CARD_GAP
          contentRef.current.style.marginTop = `-${Math.max(gapToClose, 0)}px`
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [contentRef])

  const activeStage = TIME_STAGES[stage]
  const { sun } = activeStage
  const sunInitPos = sunAngleToPos(STAGE_SUN_ANGLE[stage])
  const timeStr = clockTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  const dateStr = clockTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })

  let layerIndex = 0

  return (
    <div>
      {/* Bird float keyframe — uses CSS `translate` property so it composes with
          JS-driven `transform` on the same element without conflict */}
      <style>{`
        @keyframes bird-float {
          0%, 100% { translate: 0 0; }
          50%       { translate: 0 -4px; }
        }
      `}</style>

      {/* Hero wrapper — 200vh gives 100vh of scroll range for the sticky pin */}
      <div style={{ height: '200vh' }}>
      {/* Sticky parallax hero — clip-path morphs from full-bleed to card */}
      <div
        ref={heroRef}
        className="sticky top-0 h-screen overflow-hidden pointer-events-none"
        style={{ clipPath: 'inset(0px 0px 0px 0px round 0px)' }}
      >
        {/* Scene container — extends 200px beyond viewport on each side so layers never reach the edge, transform controlled by JS */}
        <div ref={sceneRef} className="absolute top-0 bottom-0 overflow-hidden" style={{ left: `-${PARALLAX_OVERREACH}px`, right: `-${PARALLAX_OVERREACH}px` }}>
          {/* Sky gradient — background set each rAF frame, focal point tracks sun */}
          <div
            ref={skyRef}
            className="absolute inset-0"
          />

          {/* CSS sun / moon — position driven each rAF frame; appearance transitions via CSS */}
          <div
            ref={setRef(layerIndex++)}
            className="absolute will-change-transform"
            style={{
              top: `${sunInitPos.y.toFixed(2)}%`,
              left: `${sunInitPos.x.toFixed(2)}%`,
              translate: '-50% -50%',
              width: `${sun.size}px`,
              height: `${sun.size}px`,
              borderRadius: '50%',
              background: sun.gradient,
              boxShadow: sun.glow,
              transition: 'width 1.5s ease, height 1.5s ease, background 1.5s ease, box-shadow 1.5s ease',
            }}
          />

          {/* Back layers (sky → trees, birds interleaved) */}
          {BACK_LAYERS.map((layer) => {
            const idx = layerIndex++
            const isBird = !!layer.float
            return (
              <div
                key={layer.src}
                ref={setRef(idx)}
                className="absolute inset-0 will-change-transform"
                style={{
                  ...(layer.float ? {
                    animation: `bird-float ${layer.float.duration}s ease-in-out ${layer.float.delay}s infinite`,
                  } : {}),
                  filter: activeStage.layerFilter,
                  transition: 'filter 1.2s ease',
                }}
              >
                {/* Birds slide down and fade at night — inner wrapper keeps this off the parallax/float transform */}
                {isBird ? (
                  <div
                    className="absolute inset-0"
                    style={{
                      transition: 'transform 1.5s ease, opacity 1.2s ease',
                      transform: stage === 'night' ? 'translateY(60px)' : 'translateY(0)',
                      opacity: stage === 'night' ? 0 : 1,
                    }}
                  >
                    <img
                      src={layer.src}
                      alt={layer.alt}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                ) : (
                  <img
                    src={layer.src}
                    alt={layer.alt}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                )}
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
                  For the games that stayed with you. <br></br>And the ones you haven&apos;t found yet.
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
                style={{
                  filter: activeStage.layerFilter,
                  transition: 'filter 1.2s ease',
                }}
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
              background: `linear-gradient(to bottom, transparent, ${activeStage.bottomColor})`,
              transition: 'background 1.5s ease',
            }}
          />

          {/* Clock + time-of-day toggle — bottom-left, fades out on scroll.
              left offset accounts for the PARALLAX_OVERREACH so it aligns with the viewport edge. */}
          <div
            ref={toggleRef}
            className="absolute flex flex-col items-start gap-3 pointer-events-auto"
            style={{ bottom: '2rem', left: `${PARALLAX_OVERREACH + 32}px`, zIndex: 10 }}
          >
            {/* Clock display */}
            <div style={{ pointerEvents: 'none' }}>
              <div
                className="text-4xl font-bold text-white leading-none"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  textShadow: '0 2px 12px rgba(0,0,0,0.4)',
                }}
              >
                {timeStr}
              </div>
              <div
                className="text-sm text-white/70 mt-1"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  textShadow: '0 1px 6px rgba(0,0,0,0.3)',
                }}
              >
                {dateStr}
              </div>
              <div
                className="text-xs text-white/45 tracking-widest uppercase mt-0.5"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                at idlehours HQ
              </div>
            </div>

            {/* Stage toggle row: glass pill + reset */}
            <div className="flex items-center gap-2">
              {/* Glass pill with 4 stage buttons */}
              <div
                className="flex items-center gap-1 rounded-full px-2 py-1.5"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                }}
              >
                {STAGE_ORDER.map((key) => {
                  const s = TIME_STAGES[key]
                  const isActive = stage === key
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setStage(key)
                        targetAngleRef.current = STAGE_SUN_ANGLE[key]
                        const c = STAGE_SKY_COLORS[key]
                        targetSkyRgbRef.current = [hexToRgb(c[0]), hexToRgb(c[1]), hexToRgb(c[2])]
                      }}
                      title={s.label}
                      className="group flex items-center rounded-full px-3 py-1.5 transition-all duration-300"
                      style={{
                        background: isActive ? 'rgba(255,255,255,0.25)' : 'transparent',
                        color: isActive ? '#ffffff' : 'rgba(255,255,255,0.55)',
                        border: isActive ? '1px solid rgba(255,255,255,0.35)' : '1px solid transparent',
                      }}
                    >
                      <s.Icon size={14} strokeWidth={2.5} />
                      {/* Label: hidden by default, revealed on hover or when active */}
                      <span
                        className={`text-xs font-bold tracking-wider whitespace-nowrap overflow-hidden transition-all duration-200 group-hover:max-w-[80px] group-hover:opacity-100 group-hover:ml-1.5 ${
                          isActive ? 'max-w-[80px] opacity-100 ml-1.5' : 'max-w-0 opacity-0 ml-0'
                        }`}
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        {s.label.toUpperCase()}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Reset button — snaps back to actual time of day */}
              <button
                onClick={() => {
                  const newStage = getInitialStage()
                  setStage(newStage)
                  targetAngleRef.current = STAGE_SUN_ANGLE[newStage]
                  const c = STAGE_SKY_COLORS[newStage]
                  targetSkyRgbRef.current = [hexToRgb(c[0]), hexToRgb(c[1]), hexToRgb(c[2])]
                }}
                title="Reset to current time of day"
                className="flex items-center justify-center rounded-full"
                style={{
                  width: '36px',
                  height: '36px',
                  flexShrink: 0,
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                <span className="inline-block shrink-0 bg-current" style={{ width: '14px', height: '14px', WebkitMask: 'url(/images/icons/icon_refresh-reset-reload-filter-highlow-swap-change.svg) no-repeat center / contain', mask: 'url(/images/icons/icon_refresh-reset-reload-filter-highlow-swap-change.svg) no-repeat center / contain' }} />
              </button>
            </div>
          </div>
        </div>

      </div>
      </div>{/* close hero wrapper */}
    </div>
  )
}
