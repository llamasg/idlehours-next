'use client'

import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'
import { type Body, spawnBody, stepPhysics, measureText, PILL_H } from '../lib/physics'

export interface PhysicsArenaHandle {
  spawnPill: (text: string, type: 'correct' | 'wrong') => void
}

const MAX_BODIES = 60

const PhysicsArena = forwardRef<PhysicsArenaHandle>(function PhysicsArena(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bodiesRef = useRef<Body[]>([])
  const rafRef = useRef<number>(0)
  const runningRef = useRef(true)

  // Expose spawnPill to parent
  useImperativeHandle(ref, () => ({
    spawnPill(text: string, type: 'correct' | 'wrong') {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.font = '600 13px Montserrat, sans-serif'
      const w = measureText(text, ctx)
      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr
      const H = canvas.height / dpr
      const body = spawnBody(text, type, W, H, w)
      bodiesRef.current.push(body)

      // Cap for performance
      if (bodiesRef.current.length > MAX_BODIES) {
        // Remove oldest correct pills first
        const idx = bodiesRef.current.findIndex((b) => b.type === 'correct')
        if (idx >= 0) bodiesRef.current.splice(idx, 1)
      }
    },
  }))

  const drawPill = useCallback(
    (ctx: CanvasRenderingContext2D, body: Body) => {
      const { x, y, w, h, text, type, opacity } = body
      const r = h / 2

      ctx.save()
      ctx.globalAlpha = opacity

      // Get CSS variable values
      const styles = getComputedStyle(canvasRef.current!)
      const ink = styles.getPropertyValue('--game-ink').trim()

      ctx.beginPath()
      ctx.roundRect(x, y, w, h, r)

      if (type === 'correct') {
        const white = styles.getPropertyValue('--game-white').trim()
        ctx.fillStyle = white ? `hsl(${white})` : '#ffffff'
        ctx.fill()
        ctx.strokeStyle = 'rgba(200,135,58,0.5)'
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Subtle amber shadow
        ctx.shadowColor = 'rgba(200,135,58,0.18)'
        ctx.shadowBlur = 8
        ctx.shadowOffsetY = 2
      } else {
        ctx.fillStyle = 'rgba(220,60,60,0.12)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(220,60,60,0.4)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Text
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.font = '600 13px Montserrat, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle =
        type === 'correct'
          ? ink
            ? `hsl(${ink})`
            : '#1a1a1a'
          : 'rgba(220,60,60,0.8)'
      ctx.fillText(text, x + w / 2, y + h / 2, w - 8)

      ctx.restore()
    },
    [],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    runningRef.current = true

    // Handle resize
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    // Animation loop
    const loop = () => {
      if (!runningRef.current) return

      const dpr = window.devicePixelRatio || 1
      const W = canvas.width / dpr
      const H = canvas.height / dpr

      ctx.clearRect(0, 0, W, H)

      bodiesRef.current = stepPhysics(bodiesRef.current, W, H, performance.now())

      for (const body of bodiesRef.current) {
        drawPill(ctx, body)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      runningRef.current = false
      cancelAnimationFrame(rafRef.current)
      observer.disconnect()
    }
  }, [drawPill])

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ display: 'block' }}
    />
  )
})

export default PhysicsArena
