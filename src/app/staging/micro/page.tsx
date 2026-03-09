'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'

/* ─────────────────────────────────────────────
   SHARED DEMO WRAPPER
   ───────────────────────────────────────────── */

function Demo({
  number,
  title,
  annotation,
  children,
}: {
  number: string
  title: string
  annotation: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-6 shadow-sm">
      <p className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">
        {number}
      </p>
      <h2 className="mt-1 font-heading text-xl font-black text-[hsl(var(--game-ink))]">
        {title}
      </h2>
      <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
        {annotation}
      </p>
      <div className="mt-5">{children}</div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   KEYFRAME STYLE BLOCK (injected once)
   ───────────────────────────────────────────── */

const KEYFRAMES = `
@keyframes squashStretch {
  0%   { transform: scaleX(1) scaleY(1); }
  15%  { transform: scaleX(1.2) scaleY(0.7); }
  40%  { transform: scaleX(0.8) scaleY(1.3); }
  60%  { transform: scaleX(1.05) scaleY(0.95); }
  80%  { transform: scaleX(0.98) scaleY(1.02); }
  100% { transform: scaleX(1) scaleY(1); }
}
@keyframes anticipateLaunch {
  0%   { transform: scale(1) translateY(0); opacity:1; }
  12%  { transform: scale(0.92) translateY(4px); opacity:1; }
  30%  { transform: scale(1.05) translateY(0); opacity:1; }
  70%  { transform: scale(0.5) translateY(-200px); opacity:0; }
  71%  { transform: scale(0.5) translateY(200px); opacity:0; }
  100% { transform: scale(1) translateY(0); opacity:1; }
}
@keyframes bobA { 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-3px) } }
@keyframes bobB { 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(3px) } }
@keyframes bobC { 0%,100%{ transform:translateY(-2px) } 50%{ transform:translateY(2px) } }
@keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes particleFade {
  0%   { transform: translate(0,0) scale(1); opacity:1; }
  100% { transform: translate(var(--px),var(--py)) scale(0.3); opacity:0; }
}
@keyframes confettiParticle {
  0%   { transform: translate(0,0) rotate(0deg); opacity:1; }
  100% { transform: translate(var(--cx), var(--cy)) rotate(var(--cr)); opacity:0; }
}
@keyframes stickerArc {
  0%   { transform: translate(-60px, 80px) scale(0) rotate(-20deg); opacity:0; }
  50%  { transform: translate(0px, -30px) scale(1.15) rotate(5deg); opacity:1; }
  100% { transform: translate(40px, -10px) scale(1) rotate(0deg); opacity:1; }
}
@keyframes wobbleLeft {
  0%,100% { transform: rotate(0deg); }
  30%     { transform: rotate(-2deg); }
  70%     { transform: rotate(1deg); }
}
@keyframes wobbleRight {
  0%,100% { transform: rotate(0deg); }
  30%     { transform: rotate(2deg); }
  70%     { transform: rotate(-1deg); }
}
@keyframes wobbleLeftSmall {
  0%,100% { transform: rotate(0deg); }
  30%     { transform: rotate(-1deg); }
  70%     { transform: rotate(0.5deg); }
}
@keyframes wobbleRightSmall {
  0%,100% { transform: rotate(0deg); }
  30%     { transform: rotate(1deg); }
  70%     { transform: rotate(-0.5deg); }
}
`

/* ─────────────────────────────────────────────
   01 — SQUASH & STRETCH
   ───────────────────────────────────────────── */

function SquashStretch() {
  const [active, setActive] = useState(false)
  return (
    <Demo number="01" title="Squash & Stretch" annotation="Click the badge. It squashes on impact, stretches on bounce, then settles.">
      <div className="flex items-center justify-center py-8">
        <button
          onClick={() => { setActive(false); requestAnimationFrame(() => setActive(true)) }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--game-amber))] font-heading text-sm font-black text-[hsl(var(--game-white))] shadow-md transition-shadow hover:shadow-lg"
          style={active ? { animation: 'squashStretch 500ms cubic-bezier(0.34,1.5,0.64,1) forwards' } : undefined}
          onAnimationEnd={() => setActive(false)}
        >
          Click
        </button>
      </div>
    </Demo>
  )
}

/* ─────────────────────────────────────────────
   02 — ANTICIPATION
   ───────────────────────────────────────────── */

function Anticipation() {
  const [launched, setLaunched] = useState(false)
  return (
    <Demo number="02" title="Anticipation" annotation="The button dips down before launching upward. The wind-up creates expectation.">
      <div className="flex items-center justify-center py-12">
        <button
          onClick={() => { setLaunched(false); requestAnimationFrame(() => setLaunched(true)) }}
          className="rounded-lg bg-[hsl(var(--game-ink))] px-6 py-3 font-heading text-sm font-bold text-[hsl(var(--game-cream))]"
          style={launched ? { animation: 'anticipateLaunch 800ms cubic-bezier(0.34,1.5,0.64,1) forwards' } : undefined}
          onAnimationEnd={() => setLaunched(false)}
        >
          Launch
        </button>
      </div>
    </Demo>
  )
}

/* ─────────────────────────────────────────────
   03 — STAGING
   ───────────────────────────────────────────── */

function Staging() {
  const [hovered, setHovered] = useState(false)
  return (
    <Demo number="03" title="Staging" annotation="Hover the card. Everything else fades; the card lifts into a spotlight.">
      <div className="relative flex items-center justify-center gap-4 py-8">
        {/* Overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl bg-[hsl(var(--game-ink))]/40 transition-opacity duration-300"
          style={{ opacity: hovered ? 1 : 0 }}
        />
        {/* Side elements */}
        <div className="h-16 w-16 rounded-lg bg-[hsl(var(--game-cream-dark))] transition-opacity duration-300" style={{ opacity: hovered ? 0.3 : 1 }} />
        {/* Main card */}
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative z-10 cursor-pointer rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] px-8 py-6 transition-all duration-300"
          style={{
            transform: hovered ? 'translateY(-8px) scale(1.04)' : 'translateY(0) scale(1)',
            boxShadow: hovered ? '0 16px 40px hsl(var(--game-amber) / 0.25)' : '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <p className="font-heading text-sm font-bold text-[hsl(var(--game-ink))]">Hover me</p>
          <p className="mt-1 text-xs text-[hsl(var(--game-ink-mid))]">I demand your attention</p>
        </div>
        {/* Side elements */}
        <div className="h-16 w-16 rounded-lg bg-[hsl(var(--game-cream-dark))] transition-opacity duration-300" style={{ opacity: hovered ? 0.3 : 1 }} />
      </div>
    </Demo>
  )
}

/* ─────────────────────────────────────────────
   04 — FOLLOW THROUGH
   ───────────────────────────────────────────── */

function FollowThrough() {
  const [dismissed, setDismissed] = useState(false)
  const [shadowVisible, setShadowVisible] = useState(true)

  const handleDismiss = () => {
    setDismissed(true)
    setShadowVisible(true)
    setTimeout(() => setShadowVisible(false), 200)
    setTimeout(() => { setDismissed(false); setShadowVisible(true) }, 1200)
  }

  return (
    <Demo number="04" title="Follow Through" annotation="Dismiss the card. The shadow lingers behind before fading — a ghost of where it was.">
      <div className="relative flex items-center justify-center py-8">
        <div className="relative">
          {/* Shadow remnant */}
          {dismissed && (
            <div
              className="absolute inset-0 rounded-xl transition-opacity duration-200"
              style={{
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                opacity: shadowVisible ? 1 : 0,
              }}
            />
          )}
          {/* Card */}
          <div
            className="relative rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] px-6 py-4 transition-all"
            style={{
              transform: dismissed ? 'translateX(300px)' : 'translateX(0)',
              opacity: dismissed ? 0 : 1,
              transitionDuration: '400ms',
              transitionTimingFunction: 'cubic-bezier(0.34,1.5,0.64,1)',
            }}
          >
            <p className="font-heading text-sm font-bold text-[hsl(var(--game-ink))]">Notification</p>
            <p className="mt-1 text-xs text-[hsl(var(--game-ink-mid))]">You earned a new badge!</p>
            <button
              onClick={handleDismiss}
              className="mt-3 rounded bg-[hsl(var(--game-red))]/10 px-3 py-1 font-heading text-[11px] font-bold text-[hsl(var(--game-red))] transition-colors hover:bg-[hsl(var(--game-red))]/20"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </Demo>
  )
}

/* ─────────────────────────────────────────────
   05 — SLOW IN / SLOW OUT
   ───────────────────────────────────────────── */

function SlowInSlowOut() {
  const [count, setCount] = useState(0)
  const [running, setRunning] = useState(false)
  const rafRef = useRef<number>(0)

  const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

  const animate = useCallback(() => {
    const target = 847
    const duration = 2000
    let start: number | null = null
    setRunning(true)

    const step = (ts: number) => {
      if (!start) start = ts
      const elapsed = ts - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeInOutCubic(progress)
      setCount(Math.round(eased * target))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        setRunning(false)
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }, [])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  return (
    <Demo number="05" title="Slow In / Slow Out" annotation="The counter eases gently into motion, accelerates through the middle, and decelerates to land.">
      <div className="flex flex-col items-center gap-4 py-6">
        <span className="font-heading text-6xl font-black tabular-nums text-[hsl(var(--game-ink))]">{count}</span>
        <button
          onClick={() => { setCount(0); animate() }}
          disabled={running}
          className="rounded-lg bg-[hsl(var(--game-amber))] px-5 py-2 font-heading text-xs font-bold text-[hsl(var(--game-white))] transition-opacity disabled:opacity-40"
        >
          {running ? 'Counting...' : 'Start'}
        </button>
      </div>
    </Demo>
  )
}

/* ─────────────────────────────────────────────
   06 — ARCS
   ───────────────────────────────────────────── */

function Arcs() {
  const [placed, setPlaced] = useState(false)

  return (
    <Demo number="06" title="Arcs" annotation="The sticker follows a curved arc into position — natural, never linear.">
      <div className="relative flex items-center justify-center py-10">
        <div className="relative h-32 w-48 rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))]">
          <p className="p-3 font-heading text-xs font-bold text-[hsl(var(--game-ink-mid))]">Game card</p>
          {/* Sticker */}
          <div
            className="absolute right-[-8px] top-[-8px] flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--game-green))] font-heading text-xs font-black text-[hsl(var(--game-white))] shadow-md"
            style={{
              animation: placed ? 'stickerArc 600ms cubic-bezier(0.34,1.5,0.64,1) forwards' : 'none',
              opacity: placed ? undefined : 0,
            }}
            onAnimationEnd={() => {}}
          >
            ★
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          onClick={() => { setPlaced(false); requestAnimationFrame(() => setPlaced(true)) }}
          className="rounded-lg bg-[hsl(var(--game-green))] px-5 py-2 font-heading text-xs font-bold text-[hsl(var(--game-white))]"
        >
          Place sticker
        </button>
      </div>
    </Demo>
  )
}

/* ─────────────────────────────────────────────
   07 — SECONDARY ACTION
   ───────────────────────────────────────────── */

function SecondaryAction() {
  const [stars, setStars] = useState(0)
  const [showStar, setShowStar] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [scoreBump, setScoreBump] = useState(false)

  const earn = () => {
    setShowStar(true)
    setTimeout(() => { setShowParticles(true) }, 250)
    setTimeout(() => { setScoreBump(true); setStars(s => s + 1) }, 450)
    setTimeout(() => { setShowStar(false); setShowParticles(false); setScoreBump(false) }, 1000)
  }

  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2
    return { px: Math.cos(angle) * 40, py: Math.sin(angle) * 40 }
  })

  return (
    <Demo number="07" title="Secondary Action" annotation="Star scales in (primary), particles radiate (secondary), score bumps up (tertiary). Layered motion.">
      <div className="flex flex-col items-center gap-5 py-6">
        <div className="relative flex items-center justify-center">
          {/* Star */}
          <div
            className="text-4xl transition-transform"
            style={{
              transform: showStar ? 'scale(1)' : 'scale(0)',
              transitionDuration: '300ms',
              transitionTimingFunction: 'cubic-bezier(0.34,1.5,0.64,1)',
            }}
          >
            ★
          </div>
          {/* Particles */}
          {showParticles && particles.map((p, i) => (
            <div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-[hsl(var(--game-amber))]"
              style={{
                '--px': `${p.px}px`,
                '--py': `${p.py}px`,
                animation: 'particleFade 500ms ease-out forwards',
              } as React.CSSProperties}
            />
          ))}
        </div>
        {/* Score */}
        <p
          className="font-heading text-3xl font-black tabular-nums text-[hsl(var(--game-ink))] transition-transform"
          style={{
            transform: scoreBump ? 'scale(1.2)' : 'scale(1)',
            transitionDuration: '200ms',
            transitionTimingFunction: 'cubic-bezier(0.34,1.5,0.64,1)',
          }}
        >
          {stars}
        </p>
        <button
          onClick={earn}
          className="rounded-lg bg-[hsl(var(--game-amber))] px-5 py-2 font-heading text-xs font-bold text-[hsl(var(--game-white))]"
        >
          Earn a star
        </button>
      </div>
    </Demo>
  )
}

/* ─────────────────────────────────────────────
   08 — TIMING COMPARISON
   ───────────────────────────────────────────── */

function TimingComparison() {
  const [trigger, setTrigger] = useState(0)

  return (
    <Demo number="08" title="Timing Comparison" annotation="Three identical toasts, three different timings. Snappy feels right; sluggish feels broken; bouncy feels playful.">
      <div className="flex flex-col gap-3 py-4">
        {[
          { label: 'Sluggish', duration: '800ms', easing: 'ease-in', note: '800ms ease-in' },
          { label: 'Snappy', duration: '250ms', easing: 'cubic-bezier(0.34,1.5,0.64,1)', note: '250ms spring' },
          { label: 'Bouncy', duration: '400ms', easing: 'cubic-bezier(0.34,2.0,0.64,1)', note: '400ms exaggerated spring' },
        ].map((t, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-16 font-heading text-[10px] font-bold text-[hsl(var(--game-ink-mid))]">{t.note}</span>
            <div className="relative h-10 flex-1 overflow-hidden rounded-lg bg-[hsl(var(--game-cream))]">
              <div
                className="absolute inset-y-0 left-0 flex items-center rounded-lg bg-[hsl(var(--game-ink))] px-4 font-heading text-xs font-bold text-[hsl(var(--game-cream))]"
                style={{
                  transform: trigger ? 'translateX(0)' : 'translateX(-110%)',
                  transition: trigger ? `transform ${t.duration} ${t.easing}` : 'none',
                  width: '100%',
                }}
              >
                {t.label}
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={() => { setTrigger(0); requestAnimationFrame(() => setTrigger(1)) }}
          className="mt-2 self-center rounded-lg bg-[hsl(var(--game-ink))] px-5 py-2 font-heading text-xs font-bold text-[hsl(var(--game-cream))]"
        >
          Trigger all three
        </button>
      </div>
    </Demo>
  )
}

/* ─────────────────────────────────────────────
   09 — EXAGGERATION
   ───────────────────────────────────────────── */

function Exaggeration() {
  const [attempts, setAttempts] = useState(0)
  const [shaking, setShaking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    const next = attempts + 1
    setAttempts(next)
    setShaking(true)

    const amplitude = next === 1 ? 4 : next === 2 ? 8 : 14
    const el = inputRef.current
    if (!el) return

    let frame = 0
    const keyframes = [
      { transform: `translateX(${amplitude}px)` },
      { transform: `translateX(-${amplitude}px)` },
      { transform: `translateX(${amplitude * 0.6}px)` },
      { transform: `translateX(-${amplitude * 0.6}px)` },
      { transform: `translateX(${amplitude * 0.3}px)` },
      { transform: 'translateX(0)' },
    ]

    const anim = el.animate(keyframes, { duration: 400, easing: 'cubic-bezier(0.34,1.5,0.64,1)' })
    anim.onfinish = () => setShaking(false)
  }

  return (
    <Demo number="09" title="Exaggeration" annotation="Each failed attempt shakes harder. The urgency escalates — ±4px, then ±8px, then ±14px.">
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Wrong answer..."
            className="rounded-lg border border-[hsl(var(--game-red))]/30 bg-[hsl(var(--game-cream))] px-4 py-2 font-heading text-sm text-[hsl(var(--game-ink))] outline-none"
            readOnly
          />
          <button
            onClick={handleSubmit}
            disabled={shaking}
            className="rounded-lg bg-[hsl(var(--game-red))] px-4 py-2 font-heading text-xs font-bold text-[hsl(var(--game-white))] disabled:opacity-50"
          >
            Submit
          </button>
        </div>
        <p className="font-heading text-[11px] text-[hsl(var(--game-ink-light))]">
          Attempt {attempts} — shake intensity: {attempts === 0 ? '—' : attempts === 1 ? '±4px' : attempts === 2 ? '±8px' : '±14px (max)'}
        </p>
        {attempts >= 3 && (
          <button
            onClick={() => setAttempts(0)}
            className="font-heading text-[11px] font-bold text-[hsl(var(--game-amber))] underline"
          >
            Reset
          </button>
        )}
      </div>
    </Demo>
  )
}

/* ─────────────────────────────────────────────
   10 — APPEAL (Idle Animation)
   ───────────────────────────────────────────── */

function Appeal() {
  return (
    <Demo number="10" title="Appeal" annotation="Three cards gently bob at different rhythms. Nothing happens — they just breathe.">
      <div className="flex items-center justify-center gap-4 py-8">
        {[
          { anim: 'bobA 2.4s ease-in-out infinite', colour: '--game-amber' },
          { anim: 'bobB 3.1s ease-in-out infinite', colour: '--game-blue' },
          { anim: 'bobC 2.7s ease-in-out infinite', colour: '--game-green' },
        ].map((c, i) => (
          <div
            key={i}
            className="flex h-20 w-20 items-center justify-center rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))]"
            style={{ animation: c.anim }}
          >
            <div className="h-4 w-4 rounded-full" style={{ background: `hsl(var(${c.colour}))` }} />
          </div>
        ))}
      </div>
    </Demo>
  )
}

/* ─────────────────────────────────────────────
   11 — INERTIA TOOLTIP
   ───────────────────────────────────────────── */

function InertiaTooltip() {
  const containerRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })
  const velRef = useRef({ x: 0, y: 0 })
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const stiffness = 0.08
    const damping = 0.7

    const tick = () => {
      const dx = targetRef.current.x - posRef.current.x
      const dy = targetRef.current.y - posRef.current.y
      velRef.current.x = velRef.current.x * damping + dx * stiffness
      velRef.current.y = velRef.current.y * damping + dy * stiffness
      posRef.current.x += velRef.current.x
      posRef.current.y += velRef.current.y
      setTooltipPos({ x: posRef.current.x, y: posRef.current.y })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const handleMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    targetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    if (!visible) setVisible(true)
  }

  return (
    <Demo number="11" title="Inertia Tooltip" annotation="The tooltip chases your cursor with spring physics. It overshoots when you stop.">
      <div
        ref={containerRef}
        onMouseMove={handleMove}
        onMouseLeave={() => setVisible(false)}
        className="relative h-48 cursor-crosshair overflow-hidden rounded-xl bg-[hsl(var(--game-cream))] border border-[hsl(var(--game-ink))]/10"
      >
        <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-heading text-xs text-[hsl(var(--game-ink-light))]">Move your cursor here</p>
        {visible && (
          <div
            className="pointer-events-none absolute rounded-lg bg-[hsl(var(--game-ink))] px-3 py-1.5 font-heading text-[11px] font-bold text-[hsl(var(--game-cream))] shadow-lg"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: 'translate(-50%, -130%)',
            }}
          >
            You&apos;re here!
          </div>
        )}
      </div>
    </Demo>
  )
}

/* ─────────────────────────────────────────────
   12 — STAR BURST
   ───────────────────────────────────────────── */

function StarBurst() {
  const [earned, setEarned] = useState<boolean[]>([false, false, false, false, false])
  const [bursting, setBursting] = useState(false)

  const clickStar = (idx: number) => {
    if (bursting) return
    const next = [...earned]
    next[idx] = true
    setEarned(next)

    if (next.every(Boolean)) {
      setBursting(true)
      setTimeout(() => { setBursting(false) }, 1200)
    }
  }

  const reset = () => { setEarned([false, false, false, false, false]); setBursting(false) }

  return (
    <Demo number="12" title="Star Burst" annotation="Fill all 5 stars. On the 5th, they burst outward then snap back.">
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="relative flex items-center gap-3">
          {earned.map((on, i) => {
            const angle = (i - 2) * 25
            const burstX = Math.cos(((i * 72) * Math.PI) / 180) * 60
            const burstY = Math.sin(((i * 72) * Math.PI) / 180) * 60
            return (
              <button
                key={i}
                onClick={() => clickStar(i)}
                className="relative text-3xl transition-all"
                style={{
                  color: on ? 'hsl(var(--game-amber))' : 'hsl(var(--game-ink-light))',
                  transform: bursting
                    ? `translate(${burstX}px, ${burstY}px) scale(1.3) rotate(${angle}deg)`
                    : 'translate(0,0) scale(1) rotate(0deg)',
                  transition: bursting
                    ? 'transform 400ms cubic-bezier(0.34,1.5,0.64,1)'
                    : 'transform 600ms cubic-bezier(0.34,1.5,0.64,1), color 200ms',
                }}
              >
                {on ? '★' : '☆'}
              </button>
            )
          })}
        </div>
        <button onClick={reset} className="font-heading text-[11px] font-bold text-[hsl(var(--game-amber))] underline">
          Reset
        </button>
      </div>
    </Demo>
  )
}

/* ─────────────────────────────────────────────
   13 — CARD FLIP
   ───────────────────────────────────────────── */

function CardFlip() {
  const [flipped, setFlipped] = useState(false)
  return (
    <Demo number="13" title="Card Flip" annotation="Click to flip. 3D perspective rotateY with preserve-3d — front and back are real surfaces.">
      <div className="flex items-center justify-center py-8" style={{ perspective: '800px' }}>
        <div
          onClick={() => setFlipped(f => !f)}
          className="relative h-40 w-56 cursor-pointer"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 500ms cubic-bezier(0.34,1.5,0.64,1)',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] shadow-md"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="font-heading text-lg font-black text-[hsl(var(--game-ink))]">Outer Wilds</p>
            <p className="mt-1 font-heading text-[11px] text-[hsl(var(--game-ink-light))]">Click to reveal</p>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-[hsl(var(--game-amber))]/30 bg-[hsl(var(--game-amber))]/10 shadow-md"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="font-heading text-sm font-bold text-[hsl(var(--game-ink))]">A time-loop space mystery</p>
            <p className="mt-1 font-heading text-[11px] text-[hsl(var(--game-ink-light))]">Click to flip back</p>
          </div>
        </div>
      </div>
    </Demo>
  )
}

/* ─────────────────────────────────────────────
   14 — RUBBER BAND PULL
   ───────────────────────────────────────────── */

function RubberBandPull() {
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startY = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true)
    startY.current = e.clientY
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const raw = e.clientY - startY.current
    // Rubber band: logarithmic resistance
    const clamped = Math.max(raw, 0)
    const resisted = Math.sign(clamped) * Math.log(1 + Math.abs(clamped) * 0.5) * 20
    setDragY(resisted)
  }

  const handlePointerUp = () => {
    setDragging(false)
    setDragY(0)
  }

  return (
    <Demo number="14" title="Rubber Band Pull" annotation="Drag the card downward. Spring tension resists your pull. Release and it overshoots back.">
      <div className="flex items-center justify-center py-10">
        <div
          ref={cardRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="cursor-grab select-none rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] px-8 py-5 shadow-md active:cursor-grabbing"
          style={{
            transform: `translateY(${dragY}px)`,
            transition: dragging ? 'none' : 'transform 600ms cubic-bezier(0.34,1.5,0.64,1)',
          }}
        >
          <p className="font-heading text-sm font-bold text-[hsl(var(--game-ink))]">Drag me down</p>
          <p className="mt-1 text-[11px] text-[hsl(var(--game-ink-light))]">↓ Pull</p>
        </div>
      </div>
    </Demo>
  )
}

/* ─────────────────────────────────────────────
   15 — SCROLL PROGRESS
   ───────────────────────────────────────────── */

function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const pct = el.scrollTop / (el.scrollHeight - el.clientHeight)
    setProgress(Math.min(Math.max(pct, 0), 1))
  }

  return (
    <Demo number="15" title="Scroll Progress" annotation="Scroll the container. The amber bar tracks your progress with spring-delayed smoothness.">
      <div className="relative overflow-hidden rounded-xl border border-[hsl(var(--game-ink))]/10">
        {/* Progress bar */}
        <div className="sticky top-0 z-10 h-1 bg-[hsl(var(--game-cream-dark))]">
          <div
            className="h-full bg-[hsl(var(--game-amber))]"
            style={{
              width: `${progress * 100}%`,
              transition: 'width 300ms cubic-bezier(0.34,1.5,0.64,1)',
            }}
          />
        </div>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-[200px] overflow-y-auto bg-[hsl(var(--game-white))] p-5"
        >
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i} className="mb-3 font-heading text-xs text-[hsl(var(--game-ink-mid))]">
              {i + 1}. Every game tells a story worth savouring — and every quiet hour spent exploring one is time well invested in wonder.
            </p>
          ))}
        </div>
      </div>
    </Demo>
  )
}

/* ─────────────────────────────────────────────
   16 — HOVER MAGNET FIELD
   ───────────────────────────────────────────── */

function HoverMagnetField() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [offsets, setOffsets] = useState([
    { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 },
  ])
  const elemRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleMove = (e: React.MouseEvent) => {
    const newOffsets = elemRefs.current.map((el) => {
      if (!el) return { x: 0, y: 0 }
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const maxDist = 150
      if (dist > maxDist || dist < 1) return { x: 0, y: 0 }
      const strength = (1 - dist / maxDist) * 6
      return { x: (dx / dist) * strength, y: (dy / dist) * strength }
    })
    setOffsets(newOffsets)
  }

  const handleLeave = () => {
    setOffsets([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }])
  }

  const colours = ['--game-amber', '--game-blue', '--game-green', '--game-red']

  return (
    <Demo number="16" title="Hover Magnet Field" annotation="Move your cursor near the elements. They are magnetically attracted toward you.">
      <div
        ref={containerRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="grid grid-cols-2 gap-6 py-6 px-8"
      >
        {colours.map((c, i) => (
          <div
            key={i}
            ref={(el) => { elemRefs.current[i] = el }}
            className="flex h-16 items-center justify-center rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))]"
            style={{
              transform: `translate(${offsets[i].x}px, ${offsets[i].y}px)`,
              transition: 'transform 200ms cubic-bezier(0.34,1.5,0.64,1)',
            }}
          >
            <div className="h-4 w-4 rounded-full" style={{ background: `hsl(var(${c}))` }} />
          </div>
        ))}
      </div>
    </Demo>
  )
}

/* ─────────────────────────────────────────────
   17 — CONFETTI BURST
   ───────────────────────────────────────────── */

function ConfettiBurst() {
  const [particles, setParticles] = useState<{ id: number; cx: number; cy: number; cr: number; color: string }[]>([])
  const counter = useRef(0)

  const burst = () => {
    const colours = [
      'hsl(var(--game-amber))',
      'hsl(var(--game-blue))',
      'hsl(var(--game-green))',
      'hsl(var(--game-cream-dark))',
    ]
    const newParticles = Array.from({ length: 30 }, () => {
      const angle = Math.random() * Math.PI * 2
      const dist = 60 + Math.random() * 120
      return {
        id: counter.current++,
        cx: Math.cos(angle) * dist,
        cy: Math.sin(angle) * dist - Math.random() * 80,
        cr: (Math.random() - 0.5) * 720,
        color: colours[Math.floor(Math.random() * colours.length)],
      }
    })
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 1000)
  }

  return (
    <Demo number="17" title="Confetti Burst" annotation="Press celebrate. 30 particles burst outward with gravity arcs and spin.">
      <div className="flex items-center justify-center py-10">
        <div className="relative">
          <button
            onClick={burst}
            className="relative z-10 rounded-lg bg-[hsl(var(--game-amber))] px-6 py-3 font-heading text-sm font-bold text-[hsl(var(--game-white))] shadow-md transition-transform hover:scale-105"
          >
            Celebrate!
          </button>
          {particles.map((p) => (
            <div
              key={p.id}
              className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 rounded-sm"
              style={{
                '--cx': `${p.cx}px`,
                '--cy': `${p.cy}px`,
                '--cr': `${p.cr}deg`,
                background: p.color,
                animation: 'confettiParticle 800ms cubic-bezier(0.25,0.46,0.45,0.94) forwards',
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    </Demo>
  )
}

/* ─────────────────────────────────────────────
   18 — TYPEWRITER REVEAL
   ───────────────────────────────────────────── */

function TypewriterReveal() {
  const text = 'Every game tells a story worth your quiet hours.'
  const [charIndex, setCharIndex] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => {
    setCharIndex(0)
    setRunning(true)
    let i = 0
    intervalRef.current = setInterval(() => {
      i++
      setCharIndex(i)
      if (i >= text.length) {
        clearInterval(intervalRef.current!)
        setRunning(false)
      }
    }, 40)
  }, [text.length])

  useEffect(() => {
    start()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Demo number="18" title="Typewriter Reveal" annotation="Characters appear one by one at 40ms intervals. A blinking cursor trails behind.">
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="min-h-[3em] max-w-sm text-center font-heading text-lg font-bold text-[hsl(var(--game-ink))]">
          {text.slice(0, charIndex)}
          <span style={{ animation: 'cursorBlink 530ms step-end infinite' }} className="ml-0.5 text-[hsl(var(--game-amber))]">|</span>
        </p>
        <button
          onClick={start}
          disabled={running}
          className="rounded-lg bg-[hsl(var(--game-ink))] px-4 py-2 font-heading text-xs font-bold text-[hsl(var(--game-cream))] disabled:opacity-40"
        >
          Replay
        </button>
      </div>
    </Demo>
  )
}

/* ─────────────────────────────────────────────
   19 — ELASTIC BOUNDARY
   ───────────────────────────────────────────── */

function ElasticBoundary() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [overscroll, setOverscroll] = useState(0)
  const [isSettling, setIsSettling] = useState(false)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return

    const atTop = el.scrollTop <= 0
    const atBottom = el.scrollTop >= el.scrollHeight - el.clientHeight - 1

    if (!atTop && !atBottom) {
      if (overscroll !== 0) {
        setIsSettling(true)
        setOverscroll(0)
      }
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    const el = scrollRef.current
    if (!el) return

    const atTop = el.scrollTop <= 0 && e.deltaY < 0
    const atBottom = el.scrollTop >= el.scrollHeight - el.clientHeight - 1 && e.deltaY > 0

    if (atTop || atBottom) {
      const dir = atTop ? 1 : -1
      const raw = Math.abs(e.deltaY) * 0.15
      const resisted = dir * Math.min(raw, 30)
      setOverscroll(resisted)
      setIsSettling(false)

      setTimeout(() => {
        setIsSettling(true)
        setOverscroll(0)
      }, 100)
    }
  }

  return (
    <Demo number="19" title="Elastic Boundary" annotation="Scroll past the edges. The content stretches elastically then springs back.">
      <div className="overflow-hidden rounded-xl border border-[hsl(var(--game-ink))]/10">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onWheel={handleWheel}
          className="h-[180px] overflow-y-auto bg-[hsl(var(--game-white))]"
          style={{ overscrollBehavior: 'none' }}
        >
          <div
            style={{
              transform: `translateY(${overscroll}px)`,
              transition: isSettling ? 'transform 500ms cubic-bezier(0.34,1.5,0.64,1)' : 'none',
            }}
            className="p-4"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <p key={i} className="mb-2 font-heading text-xs text-[hsl(var(--game-ink-mid))]">
                Line {i + 1} — scroll to the edges and feel the elastic bounce at the boundary.
              </p>
            ))}
          </div>
        </div>
      </div>
    </Demo>
  )
}

/* ─────────────────────────────────────────────
   20 — WOBBLE SHELF
   ───────────────────────────────────────────── */

function WobbleShelf() {
  const [clickedIdx, setClickedIdx] = useState<number | null>(null)
  const [wobbleKey, setWobbleKey] = useState(0)

  const handleClick = (idx: number) => {
    setClickedIdx(idx)
    setWobbleKey(k => k + 1)
    setTimeout(() => setClickedIdx(null), 600)
  }

  const items = ['A', 'B', 'C', 'D', 'E']

  const getAnim = (idx: number) => {
    if (clickedIdx === null) return undefined
    if (idx === clickedIdx) return undefined // handled by scale transform
    const dist = Math.abs(idx - clickedIdx)
    if (dist === 1) {
      const dir = idx < clickedIdx ? 'Left' : 'Right'
      return `wobble${dir} 400ms cubic-bezier(0.34,1.5,0.64,1) 50ms`
    }
    if (dist === 2) {
      const dir = idx < clickedIdx ? 'LeftSmall' : 'RightSmall'
      return `wobble${dir} 400ms cubic-bezier(0.34,1.5,0.64,1) 100ms`
    }
    return undefined
  }

  return (
    <Demo number="20" title="Wobble Shelf" annotation="Click an item. It bounces; its neighbours wobble outward like a ripple on a shelf.">
      <div className="flex items-center justify-center gap-3 py-8">
        {items.map((label, i) => (
          <button
            key={`${i}-${wobbleKey}`}
            onClick={() => handleClick(i)}
            className="flex h-16 w-16 items-center justify-center rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] font-heading text-sm font-black text-[hsl(var(--game-ink))]"
            style={{
              transform: clickedIdx === i ? 'scale(1.15)' : 'scale(1)',
              transition: clickedIdx === i ? 'transform 300ms cubic-bezier(0.34,1.5,0.64,1)' : 'transform 300ms ease-out',
              animation: getAnim(i),
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </Demo>
  )
}

/* ─────────────────────────────────────────────
   PAGE COMPONENT
   ───────────────────────────────────────────── */

export default function MicroPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Header */}
        <header className="mb-12">
          <p className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">
            05 / Micro
          </p>
          <h1 className="mt-2 font-heading text-4xl font-black text-[hsl(var(--game-ink))]">
            Microinteraction Playground
          </h1>
          <p className="mt-3 max-w-2xl font-heading text-sm leading-relaxed text-[hsl(var(--game-ink-mid))]">
            Twenty interactive motion demos exploring the Disney 12 Principles of Animation
            and interactive UI physics. Every element is live — click, hover, drag.
          </p>
        </header>

        {/* Section: Disney 12 Principles */}
        <div className="mb-10">
          <h2 className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-ink-light))]">
            Disney 12 Principles (01 &ndash; 10)
          </h2>
        </div>
        <div className="grid gap-8">
          <SquashStretch />
          <Anticipation />
          <Staging />
          <FollowThrough />
          <SlowInSlowOut />
          <Arcs />
          <SecondaryAction />
          <TimingComparison />
          <Exaggeration />
          <Appeal />
        </div>

        {/* Section: Interactive Playground */}
        <div className="mb-10 mt-16">
          <h2 className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-ink-light))]">
            Interactive Playground (11 &ndash; 20)
          </h2>
        </div>
        <div className="grid gap-8">
          <InertiaTooltip />
          <StarBurst />
          <CardFlip />
          <RubberBandPull />
          <ScrollProgress />
          <HoverMagnetField />
          <ConfettiBurst />
          <TypewriterReveal />
          <ElasticBoundary />
          <WobbleShelf />
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-[hsl(var(--game-ink))]/10 pt-8 pb-12 text-center">
          <p className="font-heading text-[11px] text-[hsl(var(--game-ink-light))]">
            Idle Hours — Microinteraction Laboratory
          </p>
        </footer>
      </div>
    </>
  )
}
