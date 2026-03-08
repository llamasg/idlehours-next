// Pure physics engine — no React, no DOM

export interface Body {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  text: string
  type: 'correct' | 'wrong'
  opacity: number
  spawnTime: number
}

// Constants
export const GRAVITY = 0.012
export const DAMPING = 0.72
export const FRICTION = 0.995
export const PILL_H = 32
export const PILL_PAD_X = 14
const WRONG_FADE_MS = 800
const MIN_SEP_VEL = 0.5
const IMPULSE_MULT = 0.55

export function measureText(text: string, ctx: CanvasRenderingContext2D): number {
  return ctx.measureText(text).width + PILL_PAD_X * 2
}

export function spawnBody(
  text: string,
  type: 'correct' | 'wrong',
  canvasW: number,
  canvasH: number,
  textWidth: number,
): Body {
  const w = Math.max(textWidth, 60)
  const x = Math.random() * (canvasW - w - 20) + 10
  const angle = (Math.random() - 0.5) * 0.8
  const speed = 4 + Math.random() * 2
  return {
    x,
    y: canvasH - PILL_H - 10,
    vx: Math.sin(angle) * speed,
    vy: -Math.abs(Math.cos(angle)) * speed,
    w,
    h: PILL_H,
    text,
    type,
    opacity: 1,
    spawnTime: performance.now(),
  }
}

export function stepPhysics(bodies: Body[], W: number, H: number, now: number): Body[] {
  // Fade and remove dead wrong pills
  const alive: Body[] = []
  for (const b of bodies) {
    if (b.type === 'wrong') {
      const age = now - b.spawnTime
      if (age > WRONG_FADE_MS) continue
      b.opacity = 1 - age / WRONG_FADE_MS
    }
    alive.push(b)
  }

  // Physics step for each body
  for (const b of alive) {
    // Gravity (upward float — moon gravity)
    b.vy += GRAVITY

    // Friction
    b.vx *= FRICTION
    b.vy *= FRICTION

    // Move
    b.x += b.vx
    b.y += b.vy

    // Wall collisions
    if (b.x < 0) {
      b.x = 0
      b.vx = Math.abs(b.vx) * DAMPING
    }
    if (b.x + b.w > W) {
      b.x = W - b.w
      b.vx = -Math.abs(b.vx) * DAMPING
    }

    // Floor / ceiling
    if (b.y < 0) {
      b.y = 0
      b.vy = Math.abs(b.vy) * DAMPING
    }
    if (b.y + b.h > H) {
      b.y = H - b.h
      b.vy = -Math.abs(b.vy) * DAMPING
    }
  }

  // Body-body AABB collision
  for (let i = 0; i < alive.length; i++) {
    for (let j = i + 1; j < alive.length; j++) {
      const a = alive[i]
      const b = alive[j]

      const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
      const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)

      if (overlapX <= 0 || overlapY <= 0) continue

      // Push apart on axis of least penetration
      const pushAmount = 1.5
      if (overlapX < overlapY) {
        const push = overlapX / 2 + pushAmount
        if (a.x < b.x) {
          a.x -= push
          b.x += push
        } else {
          a.x += push
          b.x -= push
        }
        // Impulse transfer
        const dvx = (a.vx - b.vx) * IMPULSE_MULT
        a.vx -= dvx
        b.vx += dvx
        // Min separation velocity
        if (Math.abs(a.vx - b.vx) < MIN_SEP_VEL) {
          const sign = a.x < b.x ? -1 : 1
          a.vx += sign * MIN_SEP_VEL * 0.5
          b.vx -= sign * MIN_SEP_VEL * 0.5
        }
      } else {
        const push = overlapY / 2 + pushAmount
        if (a.y < b.y) {
          a.y -= push
          b.y += push
        } else {
          a.y += push
          b.y -= push
        }
        const dvy = (a.vy - b.vy) * IMPULSE_MULT
        a.vy -= dvy
        b.vy += dvy
        if (Math.abs(a.vy - b.vy) < MIN_SEP_VEL) {
          const sign = a.y < b.y ? -1 : 1
          a.vy += sign * MIN_SEP_VEL * 0.5
          b.vy -= sign * MIN_SEP_VEL * 0.5
        }
      }
    }
  }

  return alive
}
