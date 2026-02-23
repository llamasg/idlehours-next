'use client'

import { useEffect, useRef, useState } from 'react'

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

export default function ParallaxPage() {
  const mouseRef = useRef({ x: 0, y: 0 })
  const animatedRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)
  const layerRefs = useRef<(HTMLDivElement | null)[]>([])
  const [logoVisible, setLogoVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLogoVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2),
        y: (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2),
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    const allLayers = [
      ...LAYERS.map((l) => l.multiplier),
      LOGO.multiplier,
      ...FRONT_LAYERS.map((l) => l.multiplier),
    ]

    const animate = () => {
      animatedRef.current.x += (mouseRef.current.x - animatedRef.current.x) * 0.05
      animatedRef.current.y += (mouseRef.current.y - animatedRef.current.y) * 0.05

      const maxMove = 30

      layerRefs.current.forEach((el, i) => {
        if (!el) return
        const mult = allLayers[i]
        const x = animatedRef.current.x * maxMove * mult
        const y = animatedRef.current.y * maxMove * mult * 0.4
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const setRef = (index: number) => (el: HTMLDivElement | null) => {
    layerRefs.current[index] = el
  }

  let layerIndex = 0

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Sky gradient - static */}
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
  )
}
