'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

// ── Holo badge ranks ────────────────────────────────────────────────────────

const HOLO_RANKS = new Set(['One Shot', 'The Curator', 'Head of Sales'])

export function isHoloRank(rankName: string): boolean {
  return HOLO_RANKS.has(rankName)
}

// ── Spring helper ───────────────────────────────────────────────────────────

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

// ── Holo overlay layers ─────────────────────────────────────────────────────

function HoloOverlay({
  maskUrl,
  mouse,
  fromCenter,
}: {
  maskUrl: string | null
  mouse: { x: number; y: number }
  fromCenter: number
}) {
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
    <>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(110deg, hsl(0,90%,65%) 0%, hsl(40,90%,60%) 8%, hsl(80,85%,55%) 16%, hsl(160,80%,55%) 24%, hsl(210,90%,60%) 32%, hsl(270,85%,60%) 40%, hsl(320,85%,60%) 48%, hsl(0,90%,65%) 56%)`,
          backgroundSize: '400% 400%',
          backgroundPosition: `${10 + mouse.x * 80}% ${10 + mouse.y * 80}%`,
          filter: `brightness(${0.6 + fromCenter * 0.3}) contrast(1.8) saturate(0.9)`,
          mixBlendMode: 'color-dodge',
          opacity: 0.36,
          ...holoMask,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)`,
          mixBlendMode: 'overlay',
          ...holoMask,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(farthest-corner circle at ${mouse.x * 100}% ${mouse.y * 100}%, hsla(0,0%,100%,0.7) 0%, hsla(0,0%,100%,0.4) 15%, hsla(0,0%,0%,0.3) 70%, transparent 100%)`,
          mixBlendMode: 'overlay',
          opacity: 0.39,
          ...holoMask,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(-30deg, hsl(280,80%,60%) 0%, hsl(200,90%,55%) 14%, hsl(130,80%,50%) 28%, hsl(50,90%,60%) 42%, hsl(0,85%,60%) 56%, hsl(280,80%,60%) 70%)`,
          backgroundSize: '300% 300%',
          backgroundPosition: `${25 + (1 - mouse.x) * 50}% ${25 + (1 - mouse.y) * 50}%`,
          filter: `brightness(${0.5 + fromCenter * 0.4}) contrast(2) saturate(0.7)`,
          mixBlendMode: 'color-dodge',
          opacity: 0.23,
          ...holoMask,
        }}
      />
    </>
  )
}

// ── Static holo shimmer (for inline badges, no mouse tracking) ──────────────

export function HoloBadgeWrapper({
  src,
  alt,
  size,
  className = '',
  style,
  onClick,
}: {
  src: string
  alt: string
  size: number
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}) {
  const [maskUrl, setMaskUrl] = useState<string | null>(null)

  useEffect(() => {
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
    img.src = src
  }, [src])

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
      className={`relative ${className}`}
      style={{ width: size, height: size, ...style }}
      onClick={onClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-contain" />
      {/* Subtle animated holo shimmer */}
      <div
        className="absolute inset-0 animate-[holo-shift_4s_ease-in-out_infinite]"
        style={{
          backgroundImage: `repeating-linear-gradient(110deg, hsl(0,90%,65%) 0%, hsl(40,90%,60%) 8%, hsl(80,85%,55%) 16%, hsl(160,80%,55%) 24%, hsl(210,90%,60%) 32%, hsl(270,85%,60%) 40%, hsl(320,85%,60%) 48%, hsl(0,90%,65%) 56%)`,
          backgroundSize: '400% 400%',
          filter: 'brightness(0.7) contrast(1.8) saturate(0.9)',
          mixBlendMode: 'color-dodge',
          opacity: 0.3,
          ...holoMask,
        }}
      />
    </div>
  )
}

// ── Badge Lightbox ──────────────────────────────────────────────────────────

export default function BadgeLightbox({
  src,
  name,
  holo = false,
  onClose,
}: {
  src: string
  name: string
  holo?: boolean
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
    setMouse({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) })
  }, [])

  const tiltX = (mouse.y - 0.5) * -20
  const tiltY = (mouse.x - 0.5) * 20
  const fromCenter = Math.sqrt((mouse.x - 0.5) ** 2 + (mouse.y - 0.5) ** 2) / 0.5

  const [maskUrl, setMaskUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!holo) return
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
    img.src = src
  }, [src, holo])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[60] flex items-center justify-center cursor-pointer"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
    >
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
            src={src}
            alt={name}
            className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]"
          />
          {holo && <HoloOverlay maskUrl={maskUrl} mouse={mouse} fromCenter={fromCenter} />}
        </div>
        <p className="mt-6 text-center font-heading text-lg font-black text-white/90 tracking-wide">
          {name}
        </p>
      </div>
    </div>
  )
}
