'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

/* ─── helpers ─── */
const spring = 'cubic-bezier(0.34,1.5,0.64,1)'

const Label = ({ num, title, annotation }: { num: string; title: string; annotation: string }) => (
  <div className="mb-6">
    <div className="flex items-center gap-3">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--game-amber))] font-heading text-[11px] font-black text-white shadow-[0_2px_6px_rgba(200,135,58,0.4)]" style={{ transform: 'rotate(-2deg)' }}>
        {num}
      </span>
      <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">{title}</h2>
    </div>
    <p className="mt-2 max-w-xl font-heading text-[12px] font-semibold italic leading-relaxed text-[hsl(var(--game-ink-light))]">
      {annotation}
    </p>
  </div>
)

const Section = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <section className={`rounded-2xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-6 shadow-[0_3px_0_hsl(var(--game-cream-dark)),0_6px_20px_rgba(0,0,0,0.06)] sm:p-8 ${className}`}>
    {children}
  </section>
)

const SectionLabel = ({ text }: { text: string }) => (
  <div className="mb-10 mt-2">
    <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">{text}</span>
    <div className="mt-2 h-[1.5px] w-16 rounded-full bg-[hsl(var(--game-amber))]/30" />
  </div>
)

/* ─── stripe gradient ─── */
const stripeGradient = 'linear-gradient(-45deg, rgba(255,255,255,0.12) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.12) 75%, transparent 75%)'

/* ─── 01 B1 Blue Primary ─── */
function B1BluePrimary() {
  return (
    <>
      <Label num="01" title="B1 Blue Primary" annotation="Pill shape, 3D shadow, lifts on hover, presses down on active. The foundational button." />
      <Section>
        <button
          className="relative rounded-full bg-[hsl(var(--game-blue))] px-7 py-3 font-heading text-[14px] font-[800] text-white transition-all duration-200 hover:-translate-y-[2px] active:translate-y-[4px] active:shadow-[0_1px_0_hsl(var(--game-blue-dark))]"
          style={{
            boxShadow: '0 5px 0 hsl(var(--game-blue-dark))',
            transition: `transform 0.2s ${spring}, box-shadow 0.2s ${spring}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 7px 0 hsl(var(--game-blue-dark))'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 5px 0 hsl(var(--game-blue-dark))'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(4px)'
            e.currentTarget.style.boxShadow = '0 1px 0 hsl(var(--game-blue-dark))'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 7px 0 hsl(var(--game-blue-dark))'
          }}
        >
          Play Now
        </button>
      </Section>
    </>
  )
}

/* ─── 02 B2 Amber Stripe ─── */
function B2AmberStripe() {
  return (
    <>
      <Label num="02" title="B2 Amber Stripe" annotation="Animated diagonal stripe overlay via inline-styled pseudo-element. Same 3D press system." />
      <Section>
        <style>{`
          @keyframes stripe-scroll { 0% { background-position: 0 0; } 100% { background-position: 28px 28px; } }
        `}</style>
        <button
          className="relative overflow-hidden rounded-full bg-[hsl(var(--game-amber))] px-7 py-3 font-heading text-[14px] font-[800] text-white"
          style={{
            boxShadow: '0 5px 0 hsl(var(--game-amber-lt))',
            transition: `transform 0.2s ${spring}, box-shadow 0.2s ${spring}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 7px 0 hsl(var(--game-amber-lt))'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 5px 0 hsl(var(--game-amber-lt))'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(4px)'
            e.currentTarget.style.boxShadow = '0 1px 0 hsl(var(--game-amber-lt))'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 7px 0 hsl(var(--game-amber-lt))'
          }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              backgroundImage: stripeGradient,
              backgroundSize: '28px 28px',
              animation: 'stripe-scroll 0.6s linear infinite',
            }}
          />
          <span className="relative z-10">Subscribe</span>
        </button>
      </Section>
    </>
  )
}

/* ─── 03 B3 Ink Primary ─── */
function B3InkPrimary() {
  return (
    <>
      <Label num="03" title="B3 Ink Primary" annotation="Ink background, cream text, dark shadow system. The serious counterpart to B1." />
      <Section>
        <button
          className="rounded-full bg-[hsl(var(--game-ink))] px-7 py-3 font-heading text-[14px] font-[800] text-[hsl(var(--game-cream))]"
          style={{
            boxShadow: '0 5px 0 rgba(0,0,0,0.5)',
            transition: `transform 0.2s ${spring}, box-shadow 0.2s ${spring}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 7px 0 rgba(0,0,0,0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 5px 0 rgba(0,0,0,0.5)'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(4px)'
            e.currentTarget.style.boxShadow = '0 1px 0 rgba(0,0,0,0.5)'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 7px 0 rgba(0,0,0,0.5)'
          }}
        >
          Read More
        </button>
      </Section>
    </>
  )
}

/* ─── 04 Glass Frost ─── */
function GlassFrost() {
  return (
    <>
      <Label num="04" title="Glass Frost" annotation="Semi-transparent frosted glass with backdrop blur. Floats above any surface." />
      <Section>
        <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--game-blue))]/20 via-[hsl(var(--game-amber))]/10 to-[hsl(var(--game-purple))]/15 p-12">
          <button
            className="rounded-full border border-white/60 px-7 py-3 font-heading text-[14px] font-[800] text-[hsl(var(--game-ink))] backdrop-blur-md"
            style={{
              background: 'rgba(255,255,255,0.6)',
              transition: `all 0.25s ${spring}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.8)'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.6)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Frosted Glass
          </button>
        </div>
      </Section>
    </>
  )
}

/* ─── 05 Glow Pulse ─── */
function GlowPulse() {
  return (
    <>
      <Label num="05" title="Glow Pulse" annotation="Ambient glow at rest, pulsing radiance on hover. Feels alive." />
      <Section>
        <style>{`
          @keyframes glow-pulse {
            0%, 100% { box-shadow: 0 0 12px rgba(74,143,232,0.25), 0 5px 0 hsl(var(--game-blue-dark)); }
            50% { box-shadow: 0 0 28px rgba(74,143,232,0.5), 0 5px 0 hsl(var(--game-blue-dark)); }
          }
          .glow-btn:hover { animation: glow-pulse 1.5s ease-in-out infinite; }
        `}</style>
        <button
          className="glow-btn rounded-full bg-[hsl(var(--game-blue))] px-7 py-3 font-heading text-[14px] font-[800] text-white"
          style={{
            boxShadow: '0 0 12px rgba(74,143,232,0.25), 0 5px 0 hsl(var(--game-blue-dark))',
            transition: `transform 0.2s ${spring}`,
          }}
        >
          Discover
        </button>
      </Section>
    </>
  )
}

/* ─── 06 Expand Reveal ─── */
function ExpandReveal() {
  const [hovered, setHovered] = useState(false)
  return (
    <>
      <Label num="06" title="Expand Reveal" annotation="Starts as a compact icon pill. On hover, expands to reveal the label. Content emerges." />
      <Section>
        <button
          className="flex items-center gap-0 overflow-hidden rounded-full bg-[hsl(var(--game-ink))] py-3 font-heading text-[14px] font-[800] text-[hsl(var(--game-cream))]"
          style={{
            transition: `all 0.35s ${spring}`,
            paddingLeft: hovered ? '20px' : '14px',
            paddingRight: hovered ? '24px' : '14px',
            boxShadow: '0 5px 0 rgba(0,0,0,0.5)',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: `transform 0.35s ${spring}`, transform: hovered ? 'rotate(0deg)' : 'rotate(-45deg)', flexShrink: 0 }}>
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
          <span
            className="whitespace-nowrap"
            style={{
              transition: `max-width 0.35s ${spring}, opacity 0.25s ease, margin 0.35s ${spring}`,
              maxWidth: hovered ? '100px' : '0px',
              opacity: hovered ? 1 : 0,
              marginLeft: hovered ? '8px' : '0px',
              overflow: 'hidden',
              display: 'inline-block',
            }}
          >
            Explore
          </span>
        </button>
      </Section>
    </>
  )
}

/* ─── 07 Magnetic Hover ─── */
function MagneticHover() {
  const btnRef = useRef<HTMLButtonElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2) * 4
    const dy = (e.clientY - cy) / (rect.height / 2) * 4
    setOffset({ x: dx, y: dy })
  }

  return (
    <>
      <Label num="07" title="Magnetic Hover" annotation="Subtly follows your cursor within the button bounds. Snaps back with spring easing." />
      <Section>
        <button
          ref={btnRef}
          className="rounded-full bg-[hsl(var(--game-blue))] px-7 py-3 font-heading text-[14px] font-[800] text-white"
          style={{
            transform: isHovered ? `translate(${offset.x}px, ${offset.y}px)` : 'translate(0, 0)',
            transition: isHovered ? 'transform 0.1s ease-out' : `transform 0.4s ${spring}`,
            boxShadow: '0 5px 0 hsl(var(--game-blue-dark))',
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => { setIsHovered(false); setOffset({ x: 0, y: 0 }) }}
        >
          Magnetic
        </button>
      </Section>
    </>
  )
}

/* ─── 08 Split Action ─── */
function SplitAction() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  return (
    <>
      <Label num="08" title="Split Action" annotation="Primary action + dropdown chevron separated by a divider. Independent hover states." />
      <Section>
        <div className="relative inline-flex">
          <button
            className="rounded-l-full bg-[hsl(var(--game-blue))] py-3 pl-7 pr-5 font-heading text-[14px] font-[800] text-white"
            style={{
              boxShadow: '0 5px 0 hsl(var(--game-blue-dark))',
              transition: `all 0.2s ${spring}`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)' }}
          >
            Share
          </button>
          <div className="w-[1px] self-stretch bg-white/25" style={{ boxShadow: '0 5px 0 hsl(var(--game-blue-dark))' }} />
          <button
            className="rounded-r-full bg-[hsl(var(--game-blue-dark))] py-3 pl-3 pr-4 text-white"
            style={{
              boxShadow: '0 5px 0 hsl(var(--game-blue-dark))',
              transition: `all 0.2s ${spring}`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.15)' }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)' }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transition: `transform 0.2s ${spring}`, transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute left-0 top-full z-10 mt-3 w-40 overflow-hidden rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] py-1 shadow-lg" style={{ animation: `dropdown-in 0.25s ${spring}` }}>
              <style>{`@keyframes dropdown-in { from { opacity:0; transform:translateY(-6px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
              {['Copy Link', 'Twitter', 'Email'].map((o) => (
                <button key={o} className="block w-full px-4 py-2 text-left font-heading text-[13px] font-semibold text-[hsl(var(--game-ink))] hover:bg-[hsl(var(--game-cream))]">{o}</button>
              ))}
            </div>
          )}
        </div>
      </Section>
    </>
  )
}

/* ─── 09 Loading State ─── */
function LoadingState() {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  const handleClick = () => {
    if (state !== 'idle') return
    setState('loading')
    setTimeout(() => setState('done'), 2000)
    setTimeout(() => setState('idle'), 4000)
  }

  return (
    <>
      <Label num="09" title="Loading State" annotation="Click to trigger loading spinner, then resolves to a done state. Full lifecycle button." />
      <Section>
        <style>{`@keyframes spin-loader { to { transform: rotate(360deg); } }`}</style>
        <button
          onClick={handleClick}
          className="relative min-w-[140px] rounded-full px-7 py-3 font-heading text-[14px] font-[800] text-white"
          style={{
            background: state === 'done' ? 'hsl(var(--game-green))' : 'hsl(var(--game-blue))',
            boxShadow: state === 'done' ? '0 5px 0 rgba(0,80,0,0.4)' : '0 5px 0 hsl(var(--game-blue-dark))',
            transition: `all 0.3s ${spring}`,
          }}
        >
          <span style={{ opacity: state === 'idle' ? 1 : 0, transition: 'opacity 0.2s ease' }}>Submit</span>
          {state === 'loading' && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span
                className="inline-block h-5 w-5 rounded-full border-[2.5px] border-white/30 border-t-white"
                style={{ animation: 'spin-loader 0.7s linear infinite' }}
              />
            </span>
          )}
          {state === 'done' && (
            <span className="absolute inset-0 flex items-center justify-center font-heading text-[14px] font-[800]" style={{ animation: `dropdown-in 0.3s ${spring}` }}>
              Done &#10003;
            </span>
          )}
        </button>
      </Section>
    </>
  )
}

/* ─── 10 Confirm Gate ─── */
function ConfirmGate() {
  const [phase, setPhase] = useState<'idle' | 'confirm' | 'done'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleClick = () => {
    if (phase === 'idle') {
      setPhase('confirm')
      timerRef.current = setTimeout(() => setPhase('idle'), 3000)
    } else if (phase === 'confirm') {
      if (timerRef.current) clearTimeout(timerRef.current)
      setPhase('done')
      setTimeout(() => setPhase('idle'), 2500)
    }
  }

  const bg = phase === 'idle' ? 'hsl(var(--game-blue))' : phase === 'confirm' ? 'hsl(var(--game-red))' : 'hsl(var(--game-green))'
  const label = phase === 'idle' ? 'Delete' : phase === 'confirm' ? 'Are you sure?' : 'Confirmed'

  return (
    <>
      <Label num="10" title="Confirm Gate" annotation="Two-step destructive action. First click warns, second confirms. Auto-resets after 3 seconds." />
      <Section>
        <button
          onClick={handleClick}
          className="rounded-full px-7 py-3 font-heading text-[14px] font-[800] text-white"
          style={{
            background: bg,
            boxShadow: `0 5px 0 ${phase === 'idle' ? 'hsl(var(--game-blue-dark))' : phase === 'confirm' ? 'rgba(150,0,0,0.5)' : 'rgba(0,80,0,0.5)'}`,
            transition: `all 0.25s ${spring}`,
          }}
        >
          {label}
        </button>
      </Section>
    </>
  )
}

/* ─── 11 Pill Toggle ─── */
function PillToggle() {
  const [active, setActive] = useState<'daily' | 'blitz'>('daily')
  return (
    <>
      <Label num="11" title="Pill Toggle" annotation="Binary toggle with sliding indicator. Spring-animated slider moves between the two options." />
      <Section>
        <div className="relative inline-flex rounded-full bg-[hsl(var(--game-cream))] p-1" style={{ border: '1.5px solid hsl(var(--game-ink) / 0.1)' }}>
          <div
            className="absolute top-1 bottom-1 rounded-full bg-[hsl(var(--game-ink))]"
            style={{
              width: 'calc(50% - 4px)',
              left: active === 'daily' ? '4px' : 'calc(50%)',
              transition: `left 0.3s ${spring}`,
            }}
          />
          {(['daily', 'blitz'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setActive(opt)}
              className="relative z-10 rounded-full px-6 py-2 font-heading text-[13px] font-[800] capitalize"
              style={{
                color: active === opt ? 'hsl(var(--game-cream))' : 'hsl(var(--game-ink))',
                transition: `color 0.2s ease`,
              }}
            >
              {opt === 'daily' ? 'Daily' : 'Blitz'}
            </button>
          ))}
        </div>
      </Section>
    </>
  )
}

/* ─── 12 Ghost Button ─── */
function GhostButton() {
  return (
    <>
      <Label num="12" title="Ghost Button" annotation="Nearly invisible at rest. Border and text materialise on hover. A hidden control waiting to be found." />
      <Section>
        <button
          className="rounded-full px-7 py-3 font-heading text-[14px] font-[800]"
          style={{
            border: '1.5px solid transparent',
            color: 'transparent',
            transition: 'all 0.4s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'hsl(var(--game-ink))'
            e.currentTarget.style.color = 'hsl(var(--game-ink))'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent'
            e.currentTarget.style.color = 'transparent'
          }}
        >
          Ghost Action
        </button>
        <p className="mt-3 font-heading text-[11px] font-semibold text-[hsl(var(--game-ink-dim))]">Hover here to reveal</p>
      </Section>
    </>
  )
}

/* ─── 13 Stamp Press ─── */
function StampPress() {
  const [stamped, setStamped] = useState(false)
  return (
    <>
      <Label num="13" title="Stamp Press" annotation="Click for a satisfying stamp animation. Scales down then overshoots back. Passport-stamp energy." />
      <Section>
        <style>{`
          @keyframes stamp-press {
            0% { transform: scale(1); }
            30% { transform: scale(0.85); }
            60% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}</style>
        <button
          className="rounded-full bg-[hsl(var(--game-ink))] px-7 py-3 font-heading text-[14px] font-[800] text-[hsl(var(--game-cream))]"
          style={{
            boxShadow: '0 5px 0 rgba(0,0,0,0.5)',
            animation: stamped ? `stamp-press 0.4s ${spring}` : 'none',
          }}
          onClick={() => {
            setStamped(false)
            requestAnimationFrame(() => setStamped(true))
          }}
          onAnimationEnd={() => setStamped(false)}
        >
          Stamp It
        </button>
      </Section>
    </>
  )
}

/* ─── 14 Text Scramble ─── */
function TextScramble() {
  const text = 'Scramble'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*'
  const [display, setDisplay] = useState(text)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const scramble = () => {
    let resolvedCount = 0
    const totalDuration = 400
    const stepTime = totalDuration / text.length

    intervalRef.current = setInterval(() => {
      resolvedCount++
      setDisplay(
        text
          .split('')
          .map((ch, i) => (i < resolvedCount ? ch : chars[Math.floor(Math.random() * chars.length)]))
          .join('')
      )
      if (resolvedCount >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, stepTime)
  }

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setDisplay(text)
  }

  return (
    <>
      <Label num="14" title="Text Scramble" annotation="Characters scramble into random glyphs on hover, then resolve left-to-right. Cyberpunk-cosy." />
      <Section>
        <button
          className="rounded-full bg-[hsl(var(--game-ink))] px-7 py-3 font-heading text-[14px] font-[800] tracking-wider text-[hsl(var(--game-cream))]"
          style={{ boxShadow: '0 5px 0 rgba(0,0,0,0.5)', fontVariantNumeric: 'tabular-nums' }}
          onMouseEnter={scramble}
          onMouseLeave={reset}
        >
          <span className="inline-block min-w-[80px] text-center font-mono">{display}</span>
        </button>
      </Section>
    </>
  )
}

/* ─── 15 Stripe Glow ─── */
function StripeGlow() {
  return (
    <>
      <Label num="15" title="Stripe Glow" annotation="B2 stripe energy combined with an ambient outer glow. Hover intensifies the amber radiance." />
      <Section>
        <style>{`
          @keyframes stripe-scroll-2 { 0% { background-position: 0 0; } 100% { background-position: 28px 28px; } }
          @keyframes amber-glow-pulse {
            0%, 100% { box-shadow: 0 0 14px rgba(200,135,58,0.25), 0 5px 0 hsl(var(--game-amber-lt)); }
            50% { box-shadow: 0 0 28px rgba(200,135,58,0.45), 0 5px 0 hsl(var(--game-amber-lt)); }
          }
          .stripe-glow-btn:hover { animation: amber-glow-pulse 1.4s ease-in-out infinite; }
        `}</style>
        <button
          className="stripe-glow-btn relative overflow-hidden rounded-full bg-[hsl(var(--game-amber))] px-7 py-3 font-heading text-[14px] font-[800] text-white"
          style={{
            boxShadow: '0 0 14px rgba(200,135,58,0.25), 0 5px 0 hsl(var(--game-amber-lt))',
            transition: `transform 0.2s ${spring}`,
          }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              backgroundImage: stripeGradient,
              backgroundSize: '28px 28px',
              animation: 'stripe-scroll-2 0.6s linear infinite',
            }}
          />
          <span className="relative z-10">Upgrade</span>
        </button>
      </Section>
    </>
  )
}

/* ═══════════════════════════════════════════
   OTHER COMPONENTS (16-27)
   ═══════════════════════════════════════════ */

/* ─── 16 Search Bar ─── */
function SearchBar() {
  const [focused, setFocused] = useState(false)
  const [query, setQuery] = useState('')
  const chips = ['Hollow Knight', 'Celeste', 'Hades']

  return (
    <>
      <Label num="16" title="Search Bar" annotation="Expandable rounded input with search icon. Recent search chips below. Focus widens the field." />
      <Section>
        <div className="max-w-md">
          <div
            className="flex items-center gap-3 rounded-full border-[1.5px] bg-[hsl(var(--game-cream))] px-4 py-3"
            style={{
              borderColor: focused ? 'hsl(var(--game-ink))' : 'hsl(var(--game-ink) / 0.1)',
              width: focused ? '100%' : '280px',
              transition: `all 0.3s ${spring}`,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--game-ink-light))" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search games..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="w-full bg-transparent font-heading text-[14px] font-semibold text-[hsl(var(--game-ink))] placeholder:text-[hsl(var(--game-ink-dim))] focus:outline-none"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => setQuery(c)}
                className="rounded-full bg-[hsl(var(--game-cream-dark))] px-3 py-1 font-heading text-[11px] font-bold text-[hsl(var(--game-ink-mid))] hover:bg-[hsl(var(--game-amber))]/20"
                style={{ transition: `all 0.2s ${spring}` }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </Section>
    </>
  )
}

/* ─── 17 Range Slider ─── */
function RangeSlider() {
  const [value, setValue] = useState(65)
  return (
    <>
      <Label num="17" title="Range Slider" annotation="Custom styled range input. Amber fill track with floating value tooltip above the thumb." />
      <Section>
        <div className="max-w-sm">
          <div className="relative pb-2 pt-8">
            {/* Tooltip */}
            <div
              className="absolute top-0 -translate-x-1/2 rounded-lg bg-[hsl(var(--game-ink))] px-2.5 py-1 font-heading text-[12px] font-[800] text-white"
              style={{ left: `${value}%`, transition: `left 0.1s ease` }}
            >
              {value}
              <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[hsl(var(--game-ink))]" />
            </div>
            {/* Track bg */}
            <div className="relative h-2 w-full rounded-full bg-[hsl(var(--game-cream-dark))]">
              <div className="absolute left-0 top-0 h-full rounded-full bg-[hsl(var(--game-amber))]" style={{ width: `${value}%` }} />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="absolute inset-0 top-6 h-2 w-full cursor-pointer opacity-0"
            />
            {/* Thumb visual */}
            <div
              className="absolute top-6 h-5 w-5 -translate-x-1/2 -translate-y-[6px] rounded-full border-2 border-[hsl(var(--game-ink))] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
              style={{ left: `${value}%`, pointerEvents: 'none', transition: 'left 0.1s ease' }}
            />
          </div>
          <div className="mt-2 flex justify-between font-heading text-[11px] font-semibold text-[hsl(var(--game-ink-dim))]">
            <span>0</span><span>50</span><span>100</span>
          </div>
        </div>
      </Section>
    </>
  )
}

/* ─── 18 Streak Calendar ─── */
function StreakCalendar() {
  const days = Array.from({ length: 31 }, (_, i) => {
    const r = Math.random()
    if (i === 8) return 'today' // March 9 = index 8
    if (r > 0.45) return 'played'
    return 'missed'
  })
  const streakCount = days.filter((d) => d === 'played' || d === 'today').length
  // March 2026 starts on Sunday
  const startDay = 0

  return (
    <>
      <Label num="18" title="Streak Calendar" annotation="Month grid showing play streaks. Amber for played, blue ring for today, empty for missed." />
      <Section>
        <div className="w-fit rounded-xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-heading text-[15px] font-[800] text-[hsl(var(--game-ink))]">March 2026</span>
            <span className="rounded-full bg-[hsl(var(--game-amber))]/15 px-3 py-0.5 font-heading text-[11px] font-bold text-[hsl(var(--game-amber))]">{streakCount} day streak</span>
          </div>
          <div className="mb-1 grid grid-cols-7 gap-1.5">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <span key={i} className="flex h-6 w-6 items-center justify-center font-heading text-[9px] font-bold text-[hsl(var(--game-ink-dim))]">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} className="h-6 w-6" />)}
            {days.map((d, i) => (
              <div
                key={i}
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                  background: d === 'played' ? 'hsl(var(--game-amber))' : 'transparent',
                  color: d === 'played' ? 'white' : 'hsl(var(--game-ink-dim))',
                  border: d === 'today' ? '2px solid hsl(var(--game-blue))' : d === 'missed' ? '1.5px solid hsl(var(--game-ink) / 0.08)' : 'none',
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  )
}

/* ─── 19 Heart Button ─── */
function HeartButton() {
  const [liked, setLiked] = useState(false)
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; angle: number }[]>([])
  const idRef = useRef(0)

  const handleClick = () => {
    const newLiked = !liked
    setLiked(newLiked)
    if (newLiked) {
      const newParticles = Array.from({ length: 8 }, () => {
        idRef.current++
        return {
          id: idRef.current,
          x: (Math.random() - 0.5) * 50,
          y: (Math.random() - 0.5) * 50,
          angle: Math.random() * 360,
        }
      })
      setParticles(newParticles)
      setTimeout(() => setParticles([]), 600)
    }
  }

  return (
    <>
      <Label num="19" title="Heart Button" annotation="Click to like. Heart fills with spring animation and particle burst radiates outward." />
      <Section>
        <style>{`
          @keyframes heart-pop { 0% { transform: scale(1); } 40% { transform: scale(1.35); } 100% { transform: scale(1); } }
          @keyframes particle-fly { 0% { opacity: 1; transform: translate(0,0) scale(1); } 100% { opacity: 0; transform: translate(var(--px), var(--py)) scale(0); } }
        `}</style>
        <div className="relative inline-flex">
          <button
            onClick={handleClick}
            className="relative flex h-12 w-12 items-center justify-center rounded-full"
            style={{ animation: liked ? `heart-pop 0.4s ${spring}` : 'none' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill={liked ? 'hsl(var(--game-red))' : 'none'} stroke={liked ? 'hsl(var(--game-red))' : 'hsl(var(--game-ink-light))'} strokeWidth="2" style={{ transition: `all 0.25s ${spring}` }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          {particles.map((p) => (
            <span
              key={p.id}
              className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-[hsl(var(--game-red))]"
              style={{
                '--px': `${p.x}px`,
                '--py': `${p.y}px`,
                animation: 'particle-fly 0.5s ease-out forwards',
              } as React.CSSProperties}
            />
          ))}
        </div>
      </Section>
    </>
  )
}

/* ─── 20 Progress Ring ─── */
function ProgressRing() {
  const [progress, setProgress] = useState(0)
  const targetProgress = 73
  const radius = 52
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const timer = setTimeout(() => setProgress(targetProgress), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <Label num="20" title="Progress Ring" annotation="SVG stroke-dasharray animated ring. Percentage in the centre. Amber stroke on cream track." />
      <Section>
        <div className="relative inline-flex h-[120px] w-[120px] items-center justify-center">
          <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--game-cream-dark))" strokeWidth="10" />
            <circle
              cx="60" cy="60" r={radius} fill="none"
              stroke="hsl(var(--game-amber))"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (progress / 100) * circumference}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <span className="absolute font-heading text-[28px] font-[900] text-[hsl(var(--game-ink))]">{progress}%</span>
        </div>
      </Section>
    </>
  )
}

/* ─── 21 Star Rating ─── */
function StarRating() {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)

  return (
    <>
      <Label num="21" title="Star Rating" annotation="Five interactive stars. Hover previews the rating, click locks it in. Amber filled, outline empty." />
      <Section>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= (hover || rating)
            return (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="p-0.5"
                style={{ transition: `transform 0.2s ${spring}`, transform: filled ? 'scale(1.15)' : 'scale(1)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill={filled ? 'hsl(var(--game-amber))' : 'none'} stroke={filled ? 'hsl(var(--game-amber))' : 'hsl(var(--game-ink-dim))'} strokeWidth="1.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            )
          })}
        </div>
        {rating > 0 && (
          <p className="mt-2 font-heading text-[12px] font-semibold text-[hsl(var(--game-ink-light))]">
            You rated this {rating} star{rating > 1 ? 's' : ''}
          </p>
        )}
      </Section>
    </>
  )
}

/* ─── 22 Notification Badge ─── */
function NotificationBadge() {
  const counts = [3, 12, '99+']
  return (
    <>
      <Label num="22" title="Notification Badge" annotation="Icon placeholder with a spring-animated red count pill. Demonstrates small, medium, and overflow." />
      <Section>
        <style>{`@keyframes badge-pop { 0% { transform: scale(0) translate(50%,-50%); } 60% { transform: scale(1.2) translate(50%,-50%); } 100% { transform: scale(1) translate(50%,-50%); } }`}</style>
        <div className="flex gap-6">
          {counts.map((count, i) => (
            <div key={i} className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--game-cream-dark))]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--game-ink-mid))" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <span
                className="absolute right-0 top-0 flex h-5 min-w-5 origin-center items-center justify-center rounded-full bg-[hsl(var(--game-red))] px-1.5 font-heading text-[10px] font-[800] text-white"
                style={{ transform: 'translate(50%,-50%)', animation: `badge-pop 0.4s ${spring}`, animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}
              >
                {count}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

/* ─── 23 Accordion ─── */
function Accordion() {
  const [open, setOpen] = useState<number | null>(0)
  const items = [
    { title: 'What is Idle Hours?', content: 'Idle Hours is a cosy games editorial blog dedicated to celebrating the quieter, more thoughtful side of gaming. We cover indie gems, overlooked classics, and the art of slow play.' },
    { title: 'How does scoring work?', content: 'Our scoring system runs from 0 to 100, factoring in atmosphere, narrative depth, replayability, and that ineffable cosy factor. Every score is the result of careful, unhurried play.' },
    { title: 'Can I contribute?', content: 'Absolutely. We welcome guest writers, especially those with a passion for cosy, narrative, or atmospheric games. Get in touch through our contact page to pitch an article.' },
  ]

  return (
    <>
      <Label num="23" title="Accordion" annotation="Expandable sections with rotating chevron. Only one open at a time. Spring-eased height reveal." />
      <Section>
        <div className="max-w-md">
          {items.map((item, i) => (
            <div key={i} className={i < items.length - 1 ? 'border-b border-dashed border-[hsl(var(--game-ink))]/10' : ''}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between py-4"
              >
                <span className="font-heading text-[14px] font-[800] text-[hsl(var(--game-ink))]">{item.title}</span>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--game-ink-mid))" strokeWidth="2.5" strokeLinecap="round"
                  style={{ transition: `transform 0.3s ${spring}`, transform: open === i ? 'rotate(180deg)' : 'rotate(0)' }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div
                className="overflow-hidden"
                style={{
                  maxHeight: open === i ? '200px' : '0px',
                  opacity: open === i ? 1 : 0,
                  transition: `max-height 0.35s ${spring}, opacity 0.25s ease`,
                }}
              >
                <p className="pb-4 font-heading text-[13px] font-semibold leading-relaxed text-[hsl(var(--game-ink-light))]">
                  {item.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

/* ─── 24 Tab Bar ─── */
function TabBar() {
  const tabs = ['Overview', 'Reviews', 'Media', 'Related']
  const [active, setActive] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  const updateIndicator = useCallback((index: number) => {
    const el = tabRefs.current[index]
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
    }
  }, [])

  useEffect(() => {
    updateIndicator(active)
  }, [active, updateIndicator])

  const tabContent = [
    'A brief overview of the game, its setting, and what makes it worth your time.',
    'Collected reviews from staff and community members, scored on our cosy scale.',
    'Screenshots, trailers, and fan art curated from across the community.',
    'Similar games you might enjoy if this one caught your eye.',
  ]

  return (
    <>
      <Label num="24" title="Tab Bar" annotation="Horizontal tabs with a sliding amber underline. Each tab reveals different content below." />
      <Section>
        <div className="max-w-md">
          <div className="relative flex border-b border-[hsl(var(--game-ink))]/10">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                ref={(el) => { tabRefs.current[i] = el }}
                onClick={() => setActive(i)}
                className="px-4 py-3 font-heading text-[13px] font-[800]"
                style={{
                  color: active === i ? 'hsl(var(--game-ink))' : 'hsl(var(--game-ink-light))',
                  transition: 'color 0.2s ease',
                }}
              >
                {tab}
              </button>
            ))}
            <div
              className="absolute bottom-0 h-[2.5px] rounded-full bg-[hsl(var(--game-amber))]"
              style={{
                left: indicator.left,
                width: indicator.width,
                transition: `all 0.3s ${spring}`,
              }}
            />
          </div>
          <div className="mt-4 min-h-[60px]">
            <p className="font-heading text-[13px] font-semibold leading-relaxed text-[hsl(var(--game-ink-light))]" style={{ animation: `dropdown-in 0.25s ${spring}` }} key={active}>
              {tabContent[active]}
            </p>
          </div>
        </div>
      </Section>
    </>
  )
}

/* ─── 25 Tooltip ─── */
function TooltipDemo() {
  const [visible, setVisible] = useState<string | null>(null)

  const Tip = ({ direction, label, tip }: { direction: 'top' | 'right' | 'bottom'; label: string; tip: string }) => {
    const isVisible = visible === label
    const posStyle: React.CSSProperties =
      direction === 'top' ? { bottom: '100%', left: '50%', transform: `translateX(-50%) translateY(-8px) scale(${isVisible ? 1 : 0.8})`, transformOrigin: 'bottom center' }
      : direction === 'right' ? { left: '100%', top: '50%', transform: `translateY(-50%) translateX(8px) scale(${isVisible ? 1 : 0.8})`, transformOrigin: 'left center' }
      : { top: '100%', left: '50%', transform: `translateX(-50%) translateY(8px) scale(${isVisible ? 1 : 0.8})`, transformOrigin: 'top center' }

    const arrowStyle: React.CSSProperties =
      direction === 'top' ? { bottom: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' }
      : direction === 'right' ? { left: '-4px', top: '50%', transform: 'translateY(-50%) rotate(45deg)' }
      : { top: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' }

    return (
      <div className="relative inline-block">
        <button
          className="rounded-lg bg-[hsl(var(--game-cream-dark))] px-4 py-2 font-heading text-[12px] font-bold text-[hsl(var(--game-ink-mid))]"
          onMouseEnter={() => setVisible(label)}
          onMouseLeave={() => setVisible(null)}
        >
          {label}
        </button>
        <div
          className="pointer-events-none absolute z-20 whitespace-nowrap rounded-lg bg-[hsl(var(--game-ink))] px-3 py-1.5 font-heading text-[12px] font-semibold text-[hsl(var(--game-cream))]"
          style={{
            ...posStyle,
            opacity: isVisible ? 1 : 0,
            transition: `all 0.2s ${spring}`,
          }}
        >
          {tip}
          <div className="absolute h-2 w-2 bg-[hsl(var(--game-ink))]" style={arrowStyle} />
        </div>
      </div>
    )
  }

  return (
    <>
      <Label num="25" title="Tooltip" annotation="Hover targets with spring-scaled tooltip in three directions. Arrow pointer and ink background." />
      <Section>
        <div className="flex flex-wrap items-center gap-8 py-6">
          <Tip direction="top" label="Top" tip="Tooltip above" />
          <Tip direction="right" label="Right" tip="Tooltip right" />
          <Tip direction="bottom" label="Bottom" tip="Tooltip below" />
        </div>
      </Section>
    </>
  )
}

/* ─── 26 Custom Select ─── */
function CustomSelect() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('All Genres')
  const options = ['All Genres', 'Adventure', 'Puzzle', 'Platformer', 'Narrative', 'Simulation']
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <>
      <Label num="26" title="Custom Select" annotation="Dropdown with spring animation. Options highlight on hover. Selected option shown in trigger." />
      <Section>
        <div className="relative w-56" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="flex w-full items-center justify-between rounded-xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] px-4 py-3 font-heading text-[13px] font-[700] text-[hsl(var(--game-ink))]"
            style={{ transition: `border-color 0.2s ease` }}
          >
            {selected}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--game-ink-mid))" strokeWidth="2.5" strokeLinecap="round" style={{ transition: `transform 0.25s ${spring}`, transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {open && (
            <div
              className="absolute left-0 top-full z-20 mt-2 w-full overflow-hidden rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] py-1 shadow-lg"
              style={{ animation: `dropdown-in 0.25s ${spring}` }}
            >
              {options.map((o) => (
                <button
                  key={o}
                  onClick={() => { setSelected(o); setOpen(false) }}
                  className="block w-full px-4 py-2 text-left font-heading text-[13px] font-semibold text-[hsl(var(--game-ink))]"
                  style={{
                    background: selected === o ? 'hsl(var(--game-amber) / 0.12)' : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => { if (selected !== o) e.currentTarget.style.background = 'hsl(var(--game-amber) / 0.08)' }}
                  onMouseLeave={(e) => { if (selected !== o) e.currentTarget.style.background = 'transparent' }}
                >
                  {o}
                </button>
              ))}
            </div>
          )}
        </div>
      </Section>
    </>
  )
}

/* ─── 27 Mini Bar Chart ─── */
function MiniBarChart() {
  const data = [
    { day: 'Mon', value: 45 },
    { day: 'Tue', value: 72 },
    { day: 'Wed', value: 30 },
    { day: 'Thu', value: 88 },
    { day: 'Fri', value: 60 },
    { day: 'Sat', value: 95 },
    { day: 'Sun', value: 55 },
  ]
  const max = Math.max(...data.map((d) => d.value))
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <>
      <Label num="27" title="Mini Bar Chart" annotation="Seven-day play time chart. Amber bars with hover values. Proportional heights in a compact container." />
      <Section>
        <div className="inline-flex flex-col rounded-xl bg-[hsl(var(--game-cream-dark))] p-5">
          <div className="mb-1 font-heading text-[11px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-dim))]">Play Time This Week</div>
          <div className="flex items-end gap-3" style={{ height: '100px' }}>
            {data.map((d, i) => {
              const h = (d.value / max) * 80
              return (
                <div key={d.day} className="relative flex flex-col items-center">
                  {hoveredIdx === i && (
                    <div className="absolute -top-6 rounded-md bg-[hsl(var(--game-ink))] px-1.5 py-0.5 font-heading text-[10px] font-bold text-white" style={{ animation: `dropdown-in 0.2s ${spring}` }}>
                      {d.value}m
                    </div>
                  )}
                  <div
                    className="w-6 cursor-pointer rounded-t-md bg-[hsl(var(--game-amber))]"
                    style={{
                      height: `${h}px`,
                      transition: `all 0.3s ${spring}`,
                      opacity: hoveredIdx === null || hoveredIdx === i ? 1 : 0.4,
                      transform: hoveredIdx === i ? 'scaleY(1.05)' : 'scaleY(1)',
                      transformOrigin: 'bottom',
                    }}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                </div>
              )
            })}
          </div>
          <div className="mt-2 flex gap-3">
            {data.map((d) => (
              <span key={d.day} className="w-6 text-center font-heading text-[10px] font-bold text-[hsl(var(--game-ink-dim))]">{d.day}</span>
            ))}
          </div>
        </div>
      </Section>
    </>
  )
}

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */

export default function ComponentsPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--game-cream))]">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-16">
          <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">Component Library / Page 4 of 6</span>
          <h1 className="mt-3 font-heading text-[36px] font-[900] leading-[1.1] text-[hsl(var(--game-ink))] sm:text-[44px]">
            Interactive Components
          </h1>
          <p className="mt-4 max-w-lg font-heading text-[15px] font-semibold italic leading-relaxed text-[hsl(var(--game-ink-light))]">
            Buttons, controls, and interactive elements. Everything here responds to your touch.
          </p>
        </div>

        {/* ═══ BUTTONS ═══ */}
        <SectionLabel text="Buttons" />
        <div className="space-y-10">
          <B1BluePrimary />
          <B2AmberStripe />
          <B3InkPrimary />
          <GlassFrost />
          <GlowPulse />
          <ExpandReveal />
          <MagneticHover />
          <SplitAction />
          <LoadingState />
          <ConfirmGate />
          <PillToggle />
          <GhostButton />
          <StampPress />
          <TextScramble />
          <StripeGlow />
        </div>

        {/* ═══ OTHER COMPONENTS ═══ */}
        <div className="mt-20" />
        <SectionLabel text="Other Components" />
        <div className="space-y-10">
          <SearchBar />
          <RangeSlider />
          <StreakCalendar />
          <HeartButton />
          <ProgressRing />
          <StarRating />
          <NotificationBadge />
          <Accordion />
          <TabBar />
          <TooltipDemo />
          <CustomSelect />
          <MiniBarChart />
        </div>

        {/* Footer */}
        <div className="mt-20 border-t border-dashed border-[hsl(var(--game-ink))]/10 pt-8 text-center">
          <span className="font-heading text-[11px] font-bold text-[hsl(var(--game-ink-dim))]">Page 4 of 6 &middot; Interactive Components &middot; Idle Hours Component Library</span>
        </div>
      </div>
    </div>
  )
}
