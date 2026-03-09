'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

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

/* ─── 03 Card Morph ─── */
function CardMorph() {
  const reduced = usePrefersReducedMotion()
  const [state, setState] = useState<'idle' | 'playing' | 'done'>('idle')
  const stageRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [morphed, setMorphed] = useState(false)
  const [contentFade, setContentFade] = useState(false)

  const play = useCallback(() => {
    if (state === 'playing' || !stageRef.current || !cardRef.current) return
    setState('playing')

    if (reduced) {
      setMorphed(true)
      setContentFade(true)
      setState('done')
      return
    }

    const stage = stageRef.current
    const card = cardRef.current
    const stageRect = stage.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()

    const offsetX = cardRect.left - stageRect.left
    const offsetY = cardRect.top - stageRect.top

    // set card to fixed position first via transform
    card.style.transition = 'none'
    card.style.position = 'absolute'
    card.style.left = `${offsetX}px`
    card.style.top = `${offsetY}px`
    card.style.width = `${cardRect.width}px`
    card.style.height = `${cardRect.height}px`
    card.style.zIndex = '20'

    requestAnimationFrame(() => {
      card.style.transition = 'all 500ms cubic-bezier(0.34,1.5,0.64,1)'
      card.style.left = '0px'
      card.style.top = '0px'
      card.style.width = `${stageRect.width}px`
      card.style.height = `${stageRect.height}px`
      setMorphed(true)

      setTimeout(() => {
        setContentFade(true)
        setState('done')
      }, 350)
    })
  }, [state, reduced])

  const reset = useCallback(() => {
    setMorphed(false)
    setContentFade(false)
    if (cardRef.current) {
      cardRef.current.style.transition = 'none'
      cardRef.current.style.position = ''
      cardRef.current.style.left = ''
      cardRef.current.style.top = ''
      cardRef.current.style.width = ''
      cardRef.current.style.height = ''
      cardRef.current.style.zIndex = ''
    }
    setState('idle')
  }, [])

  return (
    <>
      <Label num="03" title="Card Morph" annotation="Small card uses getBoundingClientRect to measure, then morphs to fill the container. Content cross-fades during the expansion. 500ms spring easing." />
      <Stage stageRef={stageRef}>
        {/* background grid of faded cards */}
        {!morphed && (
          <div className="absolute inset-0 grid grid-cols-3 gap-4 p-8">
            <div
              ref={cardRef}
              className="flex cursor-pointer items-center justify-center rounded-xl bg-[hsl(var(--game-green))]/15 font-heading text-[11px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--game-green))]"
              style={{ minHeight: 120 }}
            >
              Click to Morph
            </div>
            <PlaceholderCard label="Game B" colour="var(--game-ink)" />
            <PlaceholderCard label="Game C" colour="var(--game-ink)" />
            <PlaceholderCard label="Game D" colour="var(--game-ink)" />
            <PlaceholderCard label="Game E" colour="var(--game-ink)" />
            <PlaceholderCard label="Game F" colour="var(--game-ink)" />
          </div>
        )}
        {/* morphed card (grows to fill) */}
        {morphed && (
          <div
            ref={cardRef}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-[hsl(var(--game-green))]/15 p-8"
            style={{
              zIndex: 20,
            }}
          >
            <div
              style={{
                opacity: contentFade ? 1 : 0,
                transition: 'opacity 300ms ease',
              }}
              className="flex flex-col items-center gap-4"
            >
              <div className="h-40 w-full max-w-sm rounded-xl bg-[hsl(var(--game-green))]/20" />
              <h3 className="font-heading text-lg font-black text-[hsl(var(--game-green))]">Game Detail View</h3>
              <p className="max-w-xs text-center font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
                The card has morphed into a full detail page. Content fades in during the expansion.
              </p>
            </div>
          </div>
        )}
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

/* ─── 05 Zoom Through ─── */
function ZoomThrough() {
  const reduced = usePrefersReducedMotion()
  const [state, setState] = useState<'idle' | 'playing' | 'done'>('idle')
  const cardRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<'card' | 'zooming' | 'landed'>('card')

  const play = useCallback(async () => {
    if (state === 'playing') return
    setState('playing')
    setPhase('card')

    if (reduced) {
      setPhase('landed')
      setState('done')
      return
    }

    await wait(100)
    setPhase('zooming')
    await wait(400)
    setPhase('landed')
    await wait(350)
    setState('done')
  }, [state, reduced])

  const reset = useCallback(() => {
    setPhase('card')
    setState('idle')
  }, [])

  return (
    <>
      <Label num="05" title="Zoom Through" annotation="Camera dives into a card. The card scales from 1 to 8, content dissolves, then new content appears at normal scale. 700ms total." />
      <Stage>
        <div className="absolute inset-0 flex items-center justify-center">
          {/* the card that zooms */}
          <div
            ref={cardRef}
            className="flex flex-col items-center justify-center rounded-xl bg-[hsl(var(--game-amber))]/12 p-6"
            style={{
              width: phase === 'card' ? 200 : '100%',
              height: phase === 'card' ? 140 : '100%',
              transform: phase === 'zooming' ? 'scale(8)' : phase === 'landed' ? 'scale(1)' : 'scale(1)',
              opacity: 1,
              transition: reduced ? 'none' : phase === 'zooming'
                ? 'transform 400ms ease-in, width 400ms ease-in, height 400ms ease-in'
                : phase === 'landed'
                  ? 'transform 300ms ease-out, width 300ms ease-out, height 300ms ease-out'
                  : 'none',
              position: phase === 'card' ? 'relative' : 'absolute',
              inset: phase !== 'card' ? 0 : undefined,
              borderRadius: phase === 'card' ? 12 : 0,
            }}
          >
            {phase === 'card' && (
              <div style={{ transition: 'opacity 200ms ease' }}>
                <div className="mb-2 h-12 w-24 rounded-lg bg-[hsl(var(--game-amber))]/20" />
                <span className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--game-amber))]">
                  Dive In
                </span>
              </div>
            )}
            {phase === 'zooming' && (
              <div style={{ opacity: 0, transition: 'opacity 200ms ease' }} />
            )}
            {phase === 'landed' && (
              <div
                className="flex flex-col items-center gap-4"
                style={{
                  opacity: 1,
                  transition: 'opacity 300ms ease 100ms',
                }}
              >
                <div className="h-32 w-full max-w-xs rounded-xl bg-[hsl(var(--game-amber))]/15" />
                <h3 className="font-heading text-lg font-black text-[hsl(var(--game-amber))]">Inside the Card</h3>
                <p className="max-w-xs text-center font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
                  You have zoomed through into the detail view. The card has become the page.
                </p>
              </div>
            )}
          </div>
        </div>
      </Stage>
      <Controls onPlay={play} onReset={reset} state={state} />
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

/* ─── 07 Iris Wipe ─── */
function IrisWipe() {
  const reduced = usePrefersReducedMotion()
  const [state, setState] = useState<'idle' | 'playing' | 'done'>('idle')
  const irisRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<'old' | 'closed' | 'new'>('old')

  const play = useCallback(async () => {
    if (state === 'playing') return
    setState('playing')
    setPhase('old')

    if (reduced) {
      setPhase('new')
      setState('done')
      return
    }

    const iris = irisRef.current
    if (!iris) return

    // close iris over old content
    iris.style.transition = 'none'
    iris.style.clipPath = 'circle(100% at 50% 50%)'
    iris.style.opacity = '1'
    iris.style.background = 'hsl(var(--game-ink))'

    // actually we layer: old content visible, then black circle shrinks on top
    // Use an overlay that goes from transparent to covering
    await wait(50)
    iris.style.transition = 'clip-path 400ms ease-in'
    iris.style.clipPath = 'circle(0% at 50% 50%)'

    await wait(420)
    // hold at closed
    setPhase('closed')
    await wait(200)

    // switch to new content behind the iris
    setPhase('new')
    await wait(50)

    // open iris to reveal new
    iris.style.transition = 'clip-path 400ms ease-out'
    iris.style.clipPath = 'circle(100% at 50% 50%)'

    await wait(450)
    iris.style.opacity = '0'
    setState('done')
  }, [state, reduced])

  const reset = useCallback(() => {
    setPhase('old')
    if (irisRef.current) {
      irisRef.current.style.transition = 'none'
      irisRef.current.style.clipPath = 'circle(100% at 50% 50%)'
      irisRef.current.style.opacity = '0'
    }
    setState('idle')
  }, [])

  return (
    <>
      <Label num="07" title="Iris Wipe" annotation="Vintage film-style circle wipe. The iris closes on the old content, holds briefly for dramatic pause, then opens on the new. 400ms close, 200ms hold, 400ms open." />
      <Stage>
        {/* old content */}
        {phase === 'old' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
            <div className="h-24 w-full max-w-sm rounded-xl bg-[hsl(var(--game-ink))]/8" />
            <h3 className="font-heading text-lg font-black text-[hsl(var(--game-ink-light))]">Scene One</h3>
            <div className="flex gap-3">
              <div className="h-16 w-24 rounded-lg bg-[hsl(var(--game-ink))]/6" />
              <div className="h-16 w-24 rounded-lg bg-[hsl(var(--game-ink))]/6" />
              <div className="h-16 w-24 rounded-lg bg-[hsl(var(--game-ink))]/6" />
            </div>
          </div>
        )}
        {/* new content */}
        {(phase === 'new' || phase === 'closed') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 bg-[hsl(var(--game-white))]">
            {phase === 'new' && (
              <>
                <div className="h-24 w-full max-w-sm rounded-xl bg-[hsl(var(--game-blue))]/12" />
                <h3 className="font-heading text-lg font-black text-[hsl(var(--game-blue))]">Scene Two</h3>
                <div className="flex gap-3">
                  <div className="h-16 w-24 rounded-lg bg-[hsl(var(--game-blue))]/8" />
                  <div className="h-16 w-24 rounded-lg bg-[hsl(var(--game-blue))]/8" />
                  <div className="h-16 w-24 rounded-lg bg-[hsl(var(--game-blue))]/8" />
                </div>
              </>
            )}
          </div>
        )}
        {/* iris overlay — black circle that shrinks/grows */}
        <div
          ref={irisRef}
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'hsl(var(--game-ink))',
            clipPath: 'circle(100% at 50% 50%)',
            opacity: 0,
            zIndex: 30,
          }}
        />
      </Stage>
      <Controls onPlay={play} onReset={reset} state={state} />
    </>
  )
}

/* ─── 08 Scatter & Gather ─── */
function ScatterGather() {
  const reduced = usePrefersReducedMotion()
  const [state, setState] = useState<'idle' | 'playing' | 'done'>('idle')
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [layout, setLayout] = useState<'3x2' | '2x3'>('3x2')

  const cards = ['A', 'B', 'C', 'D', 'E', 'F']

  const play = useCallback(async () => {
    if (state === 'playing') return
    setState('playing')
    setLayout('3x2')

    if (reduced) {
      setLayout('2x3')
      setState('done')
      return
    }

    // reset positions
    cardRefs.current.forEach((el) => {
      if (el) { el.style.transition = 'none'; el.style.transform = 'translate(0, 0) rotate(0deg)' }
    })

    await wait(100)

    // scatter to random positions
    cardRefs.current.forEach((el) => {
      if (!el) return
      const rx = (Math.random() - 0.5) * 400
      const ry = (Math.random() - 0.5) * 300
      const rr = (Math.random() - 0.5) * 60
      el.style.transition = 'transform 500ms cubic-bezier(0.34,1.5,0.64,1)'
      el.style.transform = `translate(${rx}px, ${ry}px) rotate(${rr}deg)`
    })

    await wait(800)

    // gather back to origin
    cardRefs.current.forEach((el) => {
      if (!el) return
      el.style.transition = 'transform 500ms cubic-bezier(0.34,1.5,0.64,1)'
      el.style.transform = 'translate(0, 0) rotate(0deg)'
    })

    await wait(300)
    setLayout('2x3')

    await wait(300)
    setState('done')
  }, [state, reduced])

  const reset = useCallback(() => {
    setLayout('3x2')
    cardRefs.current.forEach((el) => {
      if (el) { el.style.transition = 'none'; el.style.transform = 'translate(0, 0) rotate(0deg)' }
    })
    setState('idle')
  }, [])

  return (
    <>
      <Label num="08" title="Scatter & Gather" annotation="Six cards scatter to random positions and rotations, hold briefly, then gather into a rearranged grid layout. Two-phase spring animation." />
      <Stage>
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div
            className={`grid gap-4 ${layout === '3x2' ? 'grid-cols-3' : 'grid-cols-2'}`}
            style={{
              transition: reduced ? 'none' : 'all 400ms cubic-bezier(0.34,1.5,0.64,1)',
              width: layout === '3x2' ? '100%' : '66%',
            }}
          >
            {cards.map((label, i) => (
              <div
                key={label}
                ref={(el) => { cardRefs.current[i] = el }}
                className="flex h-[100px] items-center justify-center rounded-xl bg-[hsl(var(--game-amber))]/12 font-heading text-[14px] font-black text-[hsl(var(--game-amber))]"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </Stage>
      <Controls onPlay={play} onReset={reset} state={state} />
    </>
  )
}

/* ─── 09 Fold Away ─── */
function FoldAway() {
  const reduced = usePrefersReducedMotion()
  const [state, setState] = useState<'idle' | 'playing' | 'done'>('idle')
  const oldRef = useRef<HTMLDivElement>(null)
  const newRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<'old' | 'folding' | 'unfolding' | 'new'>('old')

  const play = useCallback(async () => {
    if (state === 'playing') return
    setState('playing')
    setPhase('old')

    if (reduced) {
      setPhase('new')
      setState('done')
      return
    }

    const old = oldRef.current
    const nw = newRef.current

    if (old) {
      old.style.transition = 'none'
      old.style.transform = 'perspective(800px) rotateX(0deg)'
      old.style.opacity = '1'
    }
    if (nw) {
      nw.style.transition = 'none'
      nw.style.transform = 'perspective(800px) rotateX(90deg)'
      nw.style.opacity = '0'
    }

    await wait(100)
    setPhase('folding')

    // fold old upward
    if (old) {
      old.style.transition = 'transform 500ms ease-in, opacity 500ms ease-in'
      old.style.transform = 'perspective(800px) rotateX(-90deg)'
      old.style.opacity = '0'
    }

    await wait(550)
    setPhase('unfolding')

    // unfold new downward
    if (nw) {
      nw.style.transition = 'transform 500ms cubic-bezier(0.34,1.5,0.64,1), opacity 400ms ease'
      nw.style.transform = 'perspective(800px) rotateX(0deg)'
      nw.style.opacity = '1'
    }

    await wait(550)
    setPhase('new')
    setState('done')
  }, [state, reduced])

  const reset = useCallback(() => {
    setPhase('old')
    if (oldRef.current) {
      oldRef.current.style.transition = 'none'
      oldRef.current.style.transform = 'perspective(800px) rotateX(0deg)'
      oldRef.current.style.opacity = '1'
    }
    if (newRef.current) {
      newRef.current.style.transition = 'none'
      newRef.current.style.transform = 'perspective(800px) rotateX(90deg)'
      newRef.current.style.opacity = '0'
    }
    setState('idle')
  }, [])

  return (
    <>
      <Label num="09" title="Fold Away" annotation="Content folds like paper using CSS perspective and rotateX. Old content folds upward from bottom edge, new content unfolds downward from top. 500ms each." />
      <Stage>
        {/* old content */}
        <div
          ref={oldRef}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8"
          style={{
            transformOrigin: 'top center',
            transform: 'perspective(800px) rotateX(0deg)',
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="h-24 w-full max-w-md rounded-xl bg-[hsl(var(--game-ink))]/8" />
          <h3 className="font-heading text-lg font-black text-[hsl(var(--game-ink))]">Original Content</h3>
          <div className="flex gap-3">
            {['Part A', 'Part B', 'Part C'].map((l) => (
              <div key={l} className="flex h-16 w-24 items-center justify-center rounded-lg bg-[hsl(var(--game-ink))]/6 font-heading text-[10px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--game-ink-light))]">
                {l}
              </div>
            ))}
          </div>
        </div>
        {/* new content */}
        <div
          ref={newRef}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 bg-[hsl(var(--game-white))]"
          style={{
            transformOrigin: 'top center',
            transform: 'perspective(800px) rotateX(90deg)',
            opacity: 0,
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="h-24 w-full max-w-md rounded-xl bg-[hsl(var(--game-green))]/12" />
          <h3 className="font-heading text-lg font-black text-[hsl(var(--game-green))]">Unfolded Content</h3>
          <div className="flex gap-3">
            {['New A', 'New B', 'New C'].map((l) => (
              <div key={l} className="flex h-16 w-24 items-center justify-center rounded-lg bg-[hsl(var(--game-green))]/8 font-heading text-[10px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--game-green))]">
                {l}
              </div>
            ))}
          </div>
        </div>
      </Stage>
      <Controls onPlay={play} onReset={reset} state={state} />
    </>
  )
}

/* ─── 10 Hero Sequence ─── */
function HeroSequence() {
  const reduced = usePrefersReducedMotion()
  const [state, setState] = useState<'idle' | 'playing' | 'done'>('idle')
  const seedRefs = useRef<(HTMLDivElement | null)[]>([])
  const navRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLDivElement | null)[]>([])
  const [showContent, setShowContent] = useState(false)

  const seedColours = ['var(--game-amber)', 'var(--game-blue)', 'var(--game-green)']

  const play = useCallback(async () => {
    if (state === 'playing') return
    setState('playing')
    setShowContent(false)

    if (reduced) {
      setShowContent(true)
      setState('done')
      return
    }

    // reset everything
    seedRefs.current.forEach((el) => {
      if (el) { el.style.transition = 'none'; el.style.opacity = '0'; el.style.transform = 'scale(0.2) translate(0,0)' }
    })
    ;[navRef, headingRef, cardsRef, footerRef].forEach((ref) => {
      if (ref.current) { ref.current.style.transition = 'none'; ref.current.style.opacity = '0'; ref.current.style.transform = 'scale(0.95)' }
    })
    buttonRefs.current.forEach((el) => {
      if (el) { el.style.backgroundPosition = '-200% 0' }
    })

    await wait(200)

    // (a) container starts empty — already empty

    // (b) 3 seed dots fade in at centre, staggered 70ms
    for (let i = 0; i < 3; i++) {
      const el = seedRefs.current[i]
      if (el) {
        el.style.transition = `opacity 200ms ease ${i * 70}ms, transform 200ms ease ${i * 70}ms`
        el.style.opacity = '1'
        el.style.transform = 'scale(1) translate(0, 0)'
      }
    }
    await wait(400)

    // (c) seeds pulse twice
    for (let pulse = 0; pulse < 2; pulse++) {
      seedRefs.current.forEach((el) => {
        if (el) {
          el.style.transition = 'transform 100ms ease-out'
          el.style.transform = 'scale(1.15) translate(0, 0)'
        }
      })
      await wait(100)
      seedRefs.current.forEach((el) => {
        if (el) {
          el.style.transition = 'transform 100ms ease-in'
          el.style.transform = 'scale(0.9) translate(0, 0)'
        }
      })
      await wait(100)
    }
    // settle
    seedRefs.current.forEach((el) => {
      if (el) {
        el.style.transition = 'transform 100ms ease'
        el.style.transform = 'scale(1) translate(0, 0)'
      }
    })
    await wait(150)

    // (d) seeds explode outward then settle
    const positions = [
      { x: -120, y: -80 },
      { x: 0, y: -100 },
      { x: 120, y: -80 },
    ]
    // fast explode
    seedRefs.current.forEach((el, i) => {
      if (el) {
        el.style.transition = 'transform 200ms ease-out'
        el.style.transform = `scale(1.4) translate(${positions[i].x}px, ${positions[i].y}px)`
      }
    })
    await wait(220)
    // settle
    seedRefs.current.forEach((el, i) => {
      if (el) {
        el.style.transition = 'transform 300ms cubic-bezier(0.34,1.5,0.64,1)'
        el.style.transform = `scale(1) translate(${positions[i].x}px, ${positions[i].y}px)`
      }
    })
    await wait(350)

    // (e) shockwave: reveal content in waves
    setShowContent(true)
    await wait(50)

    const waveElements = [navRef, headingRef, cardsRef, footerRef]
    for (let i = 0; i < waveElements.length; i++) {
      const el = waveElements[i].current
      if (el) {
        el.style.transition = `opacity 300ms ease ${i * 100}ms, transform 300ms cubic-bezier(0.34,1.5,0.64,1) ${i * 100}ms`
        el.style.opacity = '1'
        el.style.transform = 'scale(1)'
      }
    }
    await wait(700)

    // (f) shimmer pass across buttons
    buttonRefs.current.forEach((el, i) => {
      if (el) {
        el.style.transition = `background-position 600ms ease ${i * 150}ms`
        el.style.backgroundPosition = '200% 0'
      }
    })

    await wait(900)
    setState('done')
  }, [state, reduced])

  const reset = useCallback(() => {
    setShowContent(false)
    seedRefs.current.forEach((el) => {
      if (el) { el.style.transition = 'none'; el.style.opacity = '0'; el.style.transform = 'scale(0.2) translate(0,0)' }
    })
    ;[navRef, headingRef, cardsRef, footerRef].forEach((ref) => {
      if (ref.current) { ref.current.style.transition = 'none'; ref.current.style.opacity = '0'; ref.current.style.transform = 'scale(0.95)' }
    })
    setState('idle')
  }, [])

  return (
    <>
      <Label num="10" title="Hero Sequence" annotation="Full entrance choreography. Seed dots appear, pulse, explode outward, triggering a shockwave that reveals content in radiating waves. Finishes with a shimmer flourish. ~3s total." />
      <Stage>
        {/* seed dots */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 20 }}>
          <div className="relative">
            {seedColours.map((colour, i) => (
              <div
                key={i}
                ref={(el) => { seedRefs.current[i] = el }}
                className="absolute rounded-full"
                style={{
                  width: 16,
                  height: 16,
                  background: `hsl(${colour})`,
                  boxShadow: `0 0 12px hsl(${colour} / 0.4)`,
                  left: (i - 1) * 24 - 8,
                  top: -8,
                  opacity: 0,
                  transform: 'scale(0.2) translate(0, 0)',
                }}
              />
            ))}
          </div>
        </div>

        {/* content layers */}
        {showContent && (
          <div className="absolute inset-0 flex flex-col gap-3 p-6" style={{ zIndex: 10 }}>
            {/* nav */}
            <div
              ref={navRef}
              className="flex items-center justify-between rounded-lg bg-[hsl(var(--game-ink))]/6 px-4 py-2"
              style={{ opacity: 0, transform: 'scale(0.95)' }}
            >
              <div className="h-3 w-16 rounded bg-[hsl(var(--game-ink))]/15" />
              <div className="flex gap-2">
                {['Link', 'Link', 'Link'].map((l, i) => (
                  <div key={i} className="h-3 w-10 rounded bg-[hsl(var(--game-ink))]/10" />
                ))}
              </div>
            </div>

            {/* heading */}
            <div
              ref={headingRef}
              className="flex flex-col items-center gap-2 py-4"
              style={{ opacity: 0, transform: 'scale(0.95)' }}
            >
              <h3 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Welcome to Idle Hours</h3>
              <p className="font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
                Your cosy corner of gaming
              </p>
            </div>

            {/* cards */}
            <div
              ref={cardsRef}
              className="flex flex-1 gap-3"
              style={{ opacity: 0, transform: 'scale(0.95)' }}
            >
              {seedColours.map((colour, i) => (
                <div key={i} className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl" style={{ background: `hsl(${colour} / 0.1)` }}>
                  <div className="h-12 w-12 rounded-lg" style={{ background: `hsl(${colour} / 0.2)` }} />
                  <span className="font-heading text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: `hsl(${colour})` }}>
                    {['Reviews', 'Guides', 'Lists'][i]}
                  </span>
                  {/* shimmer button */}
                  <div
                    ref={(el) => { buttonRefs.current[i] = el }}
                    className="mt-1 rounded-full px-4 py-1 font-heading text-[9px] font-bold uppercase tracking-[0.1em] text-white"
                    style={{
                      background: `linear-gradient(110deg, hsl(${colour}) 0%, hsl(${colour}) 40%, hsl(${colour} / 0.6) 50%, hsl(${colour}) 60%, hsl(${colour}) 100%)`,
                      backgroundSize: '200% 100%',
                      backgroundPosition: '-200% 0',
                    }}
                  >
                    Explore
                  </div>
                </div>
              ))}
            </div>

            {/* footer */}
            <div
              ref={footerRef}
              className="flex items-center justify-center rounded-lg bg-[hsl(var(--game-ink))]/4 py-2"
              style={{ opacity: 0, transform: 'scale(0.95)' }}
            >
              <div className="h-3 w-32 rounded bg-[hsl(var(--game-ink))]/8" />
            </div>
          </div>
        )}
      </Stage>
      <Controls onPlay={play} onReset={reset} state={state} />
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
          <section><CardMorph /></section>
          <section><SlideStack /></section>
          <section><ZoomThrough /></section>
          <section><GravityDrop /></section>
          <section><IrisWipe /></section>
          <section><ScatterGather /></section>
          <section><FoldAway /></section>
          <section><HeroSequence /></section>
        </div>

        <div className="mt-20 border-t border-[hsl(var(--game-ink))]/10 pt-8 text-center">
          <p className="font-heading text-[11px] font-semibold text-[hsl(var(--game-ink-light))]">
            End of component library. All 10 macro animation demos above.
          </p>
        </div>
      </div>
    </div>
  )
}