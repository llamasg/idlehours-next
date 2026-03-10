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
@keyframes appealIn {
  0%   { transform: scale(0) rotate(-180deg); opacity: 0; }
  50%  { transform: scale(1.2) rotate(10deg); opacity: 1; }
  70%  { transform: scale(0.9) rotate(-5deg); }
  85%  { transform: scale(1.05) rotate(2deg); }
  100% { transform: scale(1) rotate(0deg); }
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
          {charIndex < text.length && (
            <span style={{ animation: 'cursorBlink 530ms step-end infinite' }} className="ml-0.5 text-[hsl(var(--game-amber))]">|</span>
          )}
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
   10b — APPEAL v2 (Trophy Reveal)
   ───────────────────────────────────────────── */

function AppealV2() {
  const [revealed, setRevealed] = useState(false)

  const handleReveal = () => {
    setRevealed(false)
    requestAnimationFrame(() => setRevealed(true))
  }

  return (
    <Demo number="10b" title="Appeal v2" annotation="Achievement unlocks, badge reveals. Spins in through 360°, overshoots to 120%, wobbles to rest. The spiral entry makes it feel earned.">
      <div className="flex flex-col items-center gap-5 py-8">
        <div
          style={{
            fontSize: 48,
            opacity: revealed ? 1 : 0,
            animation: revealed ? 'appealIn 700ms cubic-bezier(0.34,1.5,0.64,1) forwards' : 'none',
          }}
          onAnimationEnd={() => {}}
        >
          🏆
        </div>
        <button
          onClick={handleReveal}
          className="rounded-lg bg-[hsl(var(--game-amber))] px-5 py-2 font-heading text-xs font-bold text-[hsl(var(--game-white))] transition-opacity hover:opacity-90"
        >
          Reveal trophy
        </button>
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
            Eleven interactive motion demos exploring the Disney 12 Principles of Animation
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
          <Staging />
          <FollowThrough />
          <SlowInSlowOut />
          <SecondaryAction />
          <TimingComparison />
          <Exaggeration />
          <Appeal />
          <AppealV2 />
        </div>

        {/* Section: Interactive Playground */}
        <div className="mb-10 mt-16">
          <h2 className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-ink-light))]">
            Interactive Playground (11 &ndash; 18)
          </h2>
        </div>
        <div className="grid gap-8">
          <InertiaTooltip />
          <ConfettiBurst />
          <TypewriterReveal />
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
