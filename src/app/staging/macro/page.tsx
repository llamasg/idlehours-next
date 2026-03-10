'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'

/* ─── reduced motion ─── */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

/* ─── helpers ─── */
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

const Label = ({ num, title, annotation }: { num: string; title: string; annotation: string }) => (
  <div className="mb-6">
    <div className="flex items-center gap-3">
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--game-amber))] font-heading text-[11px] font-black text-white shadow-[0_2px_6px_rgba(200,135,58,0.4)]"
        style={{ transform: 'rotate(-2deg)' }}
      >
        {num}
      </span>
      <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">{title}</h2>
    </div>
    <p className="mt-2 max-w-xl font-heading text-[13px] font-semibold italic leading-relaxed text-[hsl(var(--game-ink-light))]">
      {annotation}
    </p>
  </div>
)

const Stage = ({ children, stageRef }: { children: React.ReactNode; stageRef?: React.RefObject<HTMLDivElement | null> }) => (
  <div
    ref={stageRef}
    className="relative min-h-[400px] w-full overflow-hidden rounded-2xl border-[1.5px] border-[hsl(var(--game-cream-dark))] bg-[hsl(var(--game-cream))]"
    style={{ height: 500 }}
  >
    {children}
  </div>
)

const Controls = ({ onPlay, onReset, state }: { onPlay: () => void; onReset: () => void; state: 'idle' | 'playing' | 'done' }) => (
  <div className="mt-4 flex gap-3">
    <button
      onClick={onPlay}
      disabled={state === 'playing'}
      className="rounded-full bg-[hsl(var(--game-ink))] px-6 py-2 font-heading text-[12px] font-bold text-[hsl(var(--game-cream))] transition-opacity disabled:opacity-40"
    >
      {state === 'done' ? 'Replay' : 'Play'}
    </button>
    <button
      onClick={onReset}
      disabled={state === 'playing'}
      className="rounded-full border-[1.5px] border-[hsl(var(--game-ink))]/20 px-6 py-2 font-heading text-[12px] font-bold text-[hsl(var(--game-ink))] transition-opacity disabled:opacity-40"
    >
      Reset
    </button>
  </div>
)

/* placeholder cards used across demos */
const PlaceholderCard = ({
  label,
  colour = 'var(--game-ink)',
  style,
  className = '',
  cardRef,
}: {
  label: string
  colour?: string
  style?: React.CSSProperties
  className?: string
  cardRef?: React.RefObject<HTMLDivElement | null>
}) => (
  <div
    ref={cardRef}
    className={`flex items-center justify-center rounded-xl bg-[hsl(${colour})]/10 font-heading text-[11px] font-bold uppercase tracking-[0.15em] text-[hsl(${colour})]/60 ${className}`}
    style={{ minHeight: 80, ...style }}
  >
    {label}
  </div>
)

/* ─── 01 Circle Mask Reveal ─── */
function CircleMaskReveal() {
  const reduced = usePrefersReducedMotion()
  const [state, setState] = useState<'idle' | 'playing' | 'done'>('idle')
  const stageRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [showNew, setShowNew] = useState(false)

  const play = useCallback(() => {
    if (state === 'playing' || !stageRef.current || !overlayRef.current) return
    setState('playing')
    setShowNew(false)

    const stage = stageRef.current
    const overlay = overlayRef.current
    const rect = stage.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2

    if (reduced) {
      setShowNew(true)
      setState('done')
      return
    }

    overlay.style.transition = 'none'
    overlay.style.clipPath = `circle(0% at ${cx}px ${cy}px)`
    overlay.style.opacity = '1'
    setShowNew(true)

    requestAnimationFrame(() => {
      overlay.style.transition = 'clip-path 600ms ease-out'
      overlay.style.clipPath = `circle(150% at ${cx}px ${cy}px)`
    })

    setTimeout(() => setState('done'), 650)
  }, [state, reduced])

  const reset = useCallback(() => {
    setShowNew(false)
    if (overlayRef.current) {
      overlayRef.current.style.transition = 'none'
      overlayRef.current.style.clipPath = 'circle(0% at 50% 50%)'
    }
    setState('idle')
  }, [])

  return (
    <>
      <Label num="01" title="Circle Mask Reveal" annotation="Expanding circle clip-path grows from centre, revealing new content beneath the old. 600ms ease-out." />
      <Stage stageRef={stageRef}>
        {/* old page */}
        <div className="absolute inset-0 flex flex-col gap-4 p-8">
          <div className="h-6 w-48 rounded-lg bg-[hsl(var(--game-ink))]/10" />
          <div className="flex flex-1 gap-4">
            {['Alpha', 'Beta', 'Gamma'].map((l) => (
              <div key={l} className="flex flex-1 items-center justify-center rounded-xl bg-[hsl(var(--game-ink))]/8 font-heading text-[11px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-light))]">
                {l}
              </div>
            ))}
          </div>
          <div className="h-4 w-32 rounded bg-[hsl(var(--game-ink))]/6" />
        </div>
        {/* new page (overlay) */}
        <div
          ref={overlayRef}
          className="absolute inset-0 flex flex-col gap-4 p-8"
          style={{
            clipPath: 'circle(0% at 50% 50%)',
            background: 'hsl(var(--game-white))',
            opacity: showNew ? 1 : 0,
          }}
        >
          <div className="h-6 w-56 rounded-lg bg-[hsl(var(--game-amber))]/20" />
          <div className="flex flex-1 gap-4">
            {['Delta', 'Epsilon', 'Zeta'].map((l) => (
              <div key={l} className="flex flex-1 items-center justify-center rounded-xl bg-[hsl(var(--game-amber))]/12 font-heading text-[11px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--game-amber))]">
                {l}
              </div>
            ))}
          </div>
          <div className="h-4 w-40 rounded bg-[hsl(var(--game-amber))]/10" />
        </div>
      </Stage>
      <Controls onPlay={play} onReset={reset} state={state} />
    </>
  )
}

/* ─── 02 Content Strip Transition ─── */
function ContentStripTransition() {
  const reduced = usePrefersReducedMotion()
  const [state, setState] = useState<'idle' | 'playing' | 'done'>('idle')
  const [phase, setPhase] = useState<'old' | 'transition' | 'new'>('old')
  const oldRefs = useRef<(HTMLDivElement | null)[]>([])
  const newRefs = useRef<(HTMLDivElement | null)[]>([])
  const bgRef = useRef<HTMLDivElement>(null)

  const show = (el: HTMLDivElement | null, delay: number) => {
    if (!el) return
    el.style.transition = `opacity 350ms ease ${delay}ms, transform 350ms ease ${delay}ms`
    el.style.opacity = '1'
    el.style.transform = 'translateY(0)'
  }

  const hide = (el: HTMLDivElement | null, delay: number, direction: 'down' | 'up' = 'down') => {
    if (!el) return
    el.style.transition = `opacity 250ms ease ${delay}ms, transform 300ms ease ${delay}ms`
    el.style.opacity = '0'
    el.style.transform = `translateY(${direction === 'down' ? '30px' : '-30px'})`
  }

  const play = useCallback(async () => {
    if (state === 'playing') return
    setState('playing')
    setPhase('old')

    if (reduced) {
      setPhase('new')
      setState('done')
      return
    }

    // reset old items visible
    oldRefs.current.forEach((el) => {
      if (el) { el.style.transition = 'none'; el.style.opacity = '1'; el.style.transform = 'translateY(0)' }
    })
    newRefs.current.forEach((el) => {
      if (el) { el.style.transition = 'none'; el.style.opacity = '0'; el.style.transform = 'translateY(30px)' }
    })
    if (bgRef.current) { bgRef.current.style.transition = 'none'; bgRef.current.style.opacity = '1' }

    await wait(100)

    // phase 1: hide old
    // text first (heading=0, footer=1), then cards
    hide(oldRefs.current[0], 0)
    hide(oldRefs.current[4], 200)
    hide(oldRefs.current[1], 400, 'down')
    hide(oldRefs.current[2], 700, 'down')
    hide(oldRefs.current[3], 1000, 'down')

    if (bgRef.current) {
      bgRef.current.style.transition = 'opacity 400ms ease 600ms'
      bgRef.current.style.opacity = '0.3'
    }

    await wait(1400)
    setPhase('new')

    // phase 2: show new
    if (bgRef.current) {
      bgRef.current.style.transition = 'opacity 400ms ease'
      bgRef.current.style.opacity = '1'
    }

    await wait(200)
    show(newRefs.current[1], 0)
    show(newRefs.current[2], 300)
    show(newRefs.current[3], 600)
    show(newRefs.current[0], 800)
    show(newRefs.current[4], 1000)

    await wait(1400)
    setState('done')
  }, [state, reduced])

  const reset = useCallback(() => {
    setPhase('old')
    oldRefs.current.forEach((el) => {
      if (el) { el.style.transition = 'none'; el.style.opacity = '1'; el.style.transform = 'translateY(0)' }
    })
    newRefs.current.forEach((el) => {
      if (el) { el.style.transition = 'none'; el.style.opacity = '0'; el.style.transform = 'translateY(30px)' }
    })
    if (bgRef.current) { bgRef.current.style.transition = 'none'; bgRef.current.style.opacity = '1' }
    setState('idle')
  }, [])

  const isNew = phase === 'new' || phase === 'transition'

  return (
    <>
      <Label num="02" title="Content Strip Transition" annotation="Sequential strip teardown with async/await orchestration. Text fades, cards slide, background dims, then rebuilds in reverse." />
      <Stage>
        <div ref={bgRef} className="absolute inset-0 bg-[hsl(var(--game-cream))]" />
        {/* old page layer */}
        <div className={`absolute inset-0 flex flex-col gap-4 p-8 ${isNew ? 'pointer-events-none' : ''}`} style={{ display: isNew ? 'none' : undefined }}>
          <div ref={(el) => { oldRefs.current[0] = el }} className="h-8 w-52 rounded-lg bg-[hsl(var(--game-ink))]/12 flex items-center px-4 font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--game-ink-light))]">
            Old Page Heading
          </div>
          <div className="flex flex-1 gap-4">
            {['Card A', 'Card B', 'Card C'].map((l, i) => (
              <div
                key={l}
                ref={(el) => { oldRefs.current[i + 1] = el }}
                className="flex flex-1 items-center justify-center rounded-xl bg-[hsl(var(--game-ink))]/8 font-heading text-[11px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-light))]"
              >
                {l}
              </div>
            ))}
          </div>
          <div ref={(el) => { oldRefs.current[4] = el }} className="h-5 w-36 rounded bg-[hsl(var(--game-ink))]/6" />
        </div>
        {/* new page layer */}
        <div className={`absolute inset-0 flex flex-col gap-4 p-8 ${!isNew ? 'pointer-events-none' : ''}`} style={{ display: !isNew ? 'none' : undefined }}>
          <div ref={(el) => { newRefs.current[0] = el }} className="h-8 w-56 rounded-lg bg-[hsl(var(--game-blue))]/15 flex items-center px-4 font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--game-blue))]" style={{ opacity: 0, transform: 'translateY(30px)' }}>
            New Page Heading
          </div>
          <div className="flex flex-1 gap-4">
            {['Card X', 'Card Y', 'Card Z'].map((l, i) => (
              <div
                key={l}
                ref={(el) => { newRefs.current[i + 1] = el }}
                className="flex flex-1 items-center justify-center rounded-xl bg-[hsl(var(--game-blue))]/10 font-heading text-[11px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--game-blue))]"
                style={{ opacity: 0, transform: 'translateY(30px)' }}
              >
                {l}
              </div>
            ))}
          </div>
          <div ref={(el) => { newRefs.current[4] = el }} className="h-5 w-40 rounded bg-[hsl(var(--game-blue))]/10" style={{ opacity: 0, transform: 'translateY(30px)' }} />
        </div>
      </Stage>
      <Controls onPlay={play} onReset={reset} state={state} />
    </>
  )
}

/* ─── 04 Slide Stack ─── */
function SlideStack() {
  const reduced = usePrefersReducedMotion()
  const [state, setState] = useState<'idle' | 'playing' | 'done'>('idle')
  const [currentPage, setCurrentPage] = useState(0)

  const pages = [
    { label: 'Page One', colour: 'var(--game-amber)', items: ['Featured', 'Trending', 'New'] },
    { label: 'Page Two', colour: 'var(--game-blue)', items: ['Reviews', 'Guides', 'Lists'] },
    { label: 'Page Three', colour: 'var(--game-green)', items: ['About', 'Contact', 'FAQ'] },
  ]

  const goTo = useCallback((dir: 'next' | 'prev') => {
    if (state === 'playing') return
    setState('playing')
    const next = dir === 'next'
      ? Math.min(currentPage + 1, pages.length - 1)
      : Math.max(currentPage - 1, 0)
    if (next === currentPage) { setState('done'); return }

    if (reduced) {
      setCurrentPage(next)
      setState('done')
      return
    }

    setCurrentPage(next)
    setTimeout(() => setState('done'), 450)
  }, [state, currentPage, pages.length, reduced])

  const reset = useCallback(() => {
    setCurrentPage(0)
    setState('idle')
  }, [])

  return (
    <>
      <Label num="04" title="Slide Stack" annotation="Stacked pages with depth. Current slides left and scales down, next slides in from right. Spring transition with shadow for depth." />
      <Stage>
        <div className="absolute inset-0">
          {pages.map((page, i) => {
            const offset = i - currentPage
            const isActive = offset === 0
            const isPast = offset < 0

            const tx = reduced
              ? (isActive ? 0 : offset * 100)
              : (isActive ? 0 : isPast ? -100 : 100)
            const sc = isActive ? 1 : 0.92
            const op = isActive ? 1 : isPast ? 0.6 : 0

            return (
              <div
                key={i}
                className="absolute inset-0 flex flex-col gap-4 rounded-xl p-8"
                style={{
                  transform: `translateX(${tx}%) scale(${sc})`,
                  opacity: op,
                  transition: reduced ? 'none' : 'transform 400ms cubic-bezier(0.34,1.5,0.64,1), opacity 400ms ease',
                  zIndex: isActive ? 10 : 5,
                  boxShadow: isActive ? '0 8px 30px rgba(0,0,0,0.1)' : '0 4px 15px rgba(0,0,0,0.05)',
                  background: `hsl(${page.colour} / 0.06)`,
                }}
              >
                <h3 className="font-heading text-lg font-black" style={{ color: `hsl(${page.colour})` }}>
                  {page.label}
                </h3>
                <div className="flex flex-1 gap-3">
                  {page.items.map((item) => (
                    <div
                      key={item}
                      className="flex flex-1 items-center justify-center rounded-xl font-heading text-[11px] font-bold uppercase tracking-[0.15em]"
                      style={{
                        background: `hsl(${page.colour} / 0.1)`,
                        color: `hsl(${page.colour} / 0.7)`,
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        {/* nav arrows */}
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-3">
          <button onClick={() => goTo('prev')} disabled={currentPage === 0 || state === 'playing'} className="rounded-full bg-[hsl(var(--game-ink))]/80 px-4 py-1.5 font-heading text-[11px] font-bold text-white disabled:opacity-30">
            Prev
          </button>
          <span className="flex items-center font-heading text-[11px] font-bold text-[hsl(var(--game-ink-light))]">
            {currentPage + 1} / {pages.length}
          </span>
          <button onClick={() => goTo('next')} disabled={currentPage === pages.length - 1 || state === 'playing'} className="rounded-full bg-[hsl(var(--game-ink))]/80 px-4 py-1.5 font-heading text-[11px] font-bold text-white disabled:opacity-30">
            Next
          </button>
        </div>
      </Stage>
      <Controls onPlay={() => goTo('next')} onReset={reset} state={state} />
    </>
  )
}

/* ─── 06 Gravity Drop ─── */
function GravityDrop() {
  const reduced = usePrefersReducedMotion()
  const [state, setState] = useState<'idle' | 'playing' | 'done'>('idle')
  const elRefs = useRef<(HTMLDivElement | null)[]>([])
  const newRefs = useRef<(HTMLDivElement | null)[]>([])
  const [phase, setPhase] = useState<'old' | 'cleared' | 'new'>('old')

  const elements = [
    { label: 'Nav Bar', weight: 0.6 },
    { label: 'Hero Banner', weight: 1.0 },
    { label: 'Card A', weight: 0.8 },
    { label: 'Card B', weight: 0.7 },
    { label: 'Card C', weight: 0.9 },
    { label: 'Footer', weight: 0.5 },
  ]

  const play = useCallback(async () => {
    if (state === 'playing') return
    setState('playing')
    setPhase('old')

    if (reduced) {
      setPhase('new')
      setState('done')
      return
    }

    // reset old elements
    elRefs.current.forEach((el) => {
      if (el) { el.style.transition = 'none'; el.style.transform = 'translateY(0) rotate(0deg)'; el.style.opacity = '1' }
    })
    newRefs.current.forEach((el) => {
      if (el) { el.style.transition = 'none'; el.style.transform = 'translateY(80px)'; el.style.opacity = '0' }
    })

    await wait(100)

    // drop elements: bottom first (reverse index order), heavier = faster (shorter duration)
    const total = elements.length
    elRefs.current.forEach((el, i) => {
      if (!el) return
      const delay = (total - 1 - i) * 80 // bottom first
      const duration = 300 + (1 - elements[i].weight) * 200 // heavier = shorter
      const rotation = (Math.random() - 0.5) * 12
      el.style.transition = `transform ${duration}ms ease-in ${delay}ms, opacity ${duration}ms ease-in ${delay}ms`
      el.style.transform = `translateY(600px) rotate(${rotation}deg)`
      el.style.opacity = '0'
    })

    await wait(1000)
    setPhase('new')

    await wait(100)
    // rise new content from bottom
    newRefs.current.forEach((el, i) => {
      if (!el) return
      const delay = i * 100
      el.style.transition = `transform 400ms cubic-bezier(0.34,1.5,0.64,1) ${delay}ms, opacity 400ms ease ${delay}ms`
      el.style.transform = 'translateY(0)'
      el.style.opacity = '1'
    })

    await wait(800)
    setState('done')
  }, [state, reduced, elements.length])

  const reset = useCallback(() => {
    setPhase('old')
    elRefs.current.forEach((el) => {
      if (el) { el.style.transition = 'none'; el.style.transform = 'translateY(0) rotate(0deg)'; el.style.opacity = '1' }
    })
    setState('idle')
  }, [])

  return (
    <>
      <Label num="06" title="Gravity Drop" annotation="Elements fall with physics-inspired stagger. Bottom elements drop first, heavier ones fall faster. Slight rotation adds natural tumble." />
      <Stage>
        {(phase === 'old' || phase === 'cleared') && (
          <div className="absolute inset-0 flex flex-col gap-3 p-6">
            {elements.map((el, i) => (
              <div
                key={el.label}
                ref={(r) => { elRefs.current[i] = r }}
                className="flex items-center justify-center rounded-xl bg-[hsl(var(--game-ink))]/8 font-heading text-[11px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-light))]"
                style={{ flex: el.weight, minHeight: 40 }}
              >
                {el.label}
              </div>
            ))}
          </div>
        )}
        {phase === 'new' && (
          <div className="absolute inset-0 flex flex-col gap-3 p-6">
            {['Header', 'Spotlight', 'Review A', 'Review B', 'Review C', 'Links'].map((label, i) => (
              <div
                key={label}
                ref={(r) => { newRefs.current[i] = r }}
                className="flex flex-1 items-center justify-center rounded-xl bg-[hsl(var(--game-green))]/10 font-heading text-[11px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--game-green))]"
                style={{ opacity: 0, transform: 'translateY(80px)', minHeight: 40 }}
              >
                {label}
              </div>
            ))}
          </div>
        )}
      </Stage>
      <Controls onPlay={play} onReset={reset} state={state} />
    </>
  )
}


/* ─── 07 Directional Wipes ─── */
function DirectionalWipes() {
  const [hOpen, setHOpen] = useState(false)
  const [vOpen, setVOpen] = useState(false)

  const wipeEasing = 'cubic-bezier(0.77, 0, 0.175, 1)'

  return (
    <>
      <Label num="07" title="Directional Wipes" annotation="Click-to-toggle clip-path wipes. Horizontal slides from left; vertical slides from top. Both use --wipe easing (cubic-bezier(0.77, 0, 0.175, 1)), 0.6s. clip-path: inset() values control reveal direction." />
      <div className="flex flex-col gap-6">
        {/* Horizontal wipe */}
        <div>
          <p className="mb-2 font-heading text-[10px] font-extrabold uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">Horizontal (left → right)</p>
          <div
            className="relative h-48 w-full cursor-pointer overflow-hidden rounded-2xl border-[1.5px] border-[hsl(var(--game-cream-dark))] bg-[hsl(var(--game-cream-mid,var(--game-cream-dark)))]"
            onClick={() => setHOpen(o => !o)}
          >
            <div className="absolute inset-0 flex items-center justify-center font-heading text-[12px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-light))]">
              Click to {hOpen ? 'reverse' : 'reveal'}
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--game-blue))]"
              style={{
                clipPath: hOpen ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
                transition: `clip-path 0.6s ${wipeEasing}`,
              }}
            >
              <span className="font-heading text-[12px] font-bold uppercase tracking-[0.15em] text-white">Revealed</span>
            </div>
          </div>
        </div>

        {/* Vertical wipe */}
        <div>
          <p className="mb-2 font-heading text-[10px] font-extrabold uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">Vertical (top → bottom)</p>
          <div
            className="relative h-48 w-full cursor-pointer overflow-hidden rounded-2xl border-[1.5px] border-[hsl(var(--game-cream-dark))] bg-[hsl(var(--game-cream-mid,var(--game-cream-dark)))]"
            onClick={() => setVOpen(o => !o)}
          >
            <div className="absolute inset-0 flex items-center justify-center font-heading text-[12px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-light))]">
              Click to {vOpen ? 'reverse' : 'reveal'}
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--game-amber))]"
              style={{
                clipPath: vOpen ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
                transition: `clip-path 0.6s ${wipeEasing}`,
              }}
            >
              <span className="font-heading text-[12px] font-bold uppercase tracking-[0.15em] text-white">Revealed</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── 08 Scroll-driven Header Shrink ─── */
function ScrollHeaderShrink() {
  const [shrunk, setShrunk] = useState(false)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setShrunk(e.currentTarget.scrollTop > 20)
  }

  const games = ['Game Sense', 'Street Date', 'Shelf Price', 'Blitz', 'Ship It']

  return (
    <>
      <Label num="08" title="Scroll-driven Header Shrink" annotation="Only change font-size and padding. Use 0.3s ease (not spring) — feels more natural on scroll." />
      <div className="overflow-hidden rounded-2xl border-[1.5px] border-[hsl(var(--game-cream-dark))] bg-[hsl(var(--game-white))]">
        {/* Header */}
        <div
          className="bg-[hsl(var(--game-ink))] text-[hsl(var(--game-cream))]"
          style={{
            fontSize: shrunk ? 14 : 22,
            padding: shrunk ? '8px 16px' : '16px 20px',
            transition: 'font-size 0.3s ease, padding 0.3s ease',
          }}
        >
          <span className="font-heading font-black">Today&apos;s games</span>
        </div>
        {/* Scrollable content */}
        <div
          onScroll={handleScroll}
          className="overflow-y-auto"
          style={{ height: 280 }}
        >
          <div className="flex flex-col gap-3 p-5">
            {games.map((game) => (
              <div
                key={game}
                className="rounded-xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] px-5 py-4"
              >
                <span className="font-heading text-[13px] font-bold text-[hsl(var(--game-ink))]">{game}</span>
                <p className="mt-1 font-heading text-[11px] font-semibold italic text-[hsl(var(--game-ink-light))]">
                  Daily puzzle — tap to play
                </p>
              </div>
            ))}
            {/* Extra spacer content to enable scrolling */}
            <div className="h-40 rounded-xl bg-[hsl(var(--game-cream-dark))]/30" />
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── Page ─── */
export default function MacroAnimationsPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--game-cream))]">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8">
        {/* page header */}
        <div className="mb-4">
          <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">
            Component Library — Page 6 of 6
          </span>
        </div>
        <h1 className="font-heading text-4xl font-black text-[hsl(var(--game-ink))] sm:text-5xl">
          Macro Animations
        </h1>
        <p className="mt-4 max-w-2xl font-heading text-[14px] font-semibold italic leading-relaxed text-[hsl(var(--game-ink-light))]">
          Page-level transitions and system-scale animation sequences. Each demo plays within a contained stage area.
          Click Play to trigger, Reset to restore.
        </p>

        <div className="mt-16 flex flex-col gap-20">
          <section><CircleMaskReveal /></section>
          <section><ContentStripTransition /></section>
          <section><SlideStack /></section>
          <section><GravityDrop /></section>
          <section><DirectionalWipes /></section>
          <section><ScrollHeaderShrink /></section>
        </div>

        <div className="mt-20 border-t border-[hsl(var(--game-ink))]/10 pt-8 text-center">
          <p className="font-heading text-[11px] font-semibold text-[hsl(var(--game-ink-light))]">
            End of component library. All 4 macro animation demos above.
          </p>
        </div>
      </div>
    </div>
  )
}