'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
// Footer intentionally omitted — this is a full-viewport immersive page
import { type GameSlug } from '@/lib/ranks'
import { getArchiveForGame, GAME_CONFIGS, type ArchiveEntry } from './lib/archiveAdapter'
import { entrance, useEntranceSteps } from '@/lib/animations'
import GameTabs from './components/GameTabs'
import Rolodex from './components/Rolodex'
import ArchiveCalendar from './components/ArchiveCalendar'
import EntryCard from './components/EntryCard'

// ── Gradient HSL definitions per game ────────────────────────────────────────

interface HSL { h: number; s: number; l: number }

const GAME_GRADIENTS: Record<GameSlug, { start: HSL; end: HSL }> = {
  'game-sense':  { start: { h: 215, s: 63, l: 47 }, end: { h: 224, s: 62, l: 27 } },
  'street-date': { start: { h: 148, s: 65, l: 29 }, end: { h: 148, s: 41, l: 9 } },
  'shelf-price': { start: { h: 246, s: 55, l: 56 }, end: { h: 260, s: 60, l: 16 } },
}

const CALENDAR_BG: Record<GameSlug, string> = {
  'game-sense':  '#132251',
  'street-date': '#081e0f',
  'shelf-price': '#1a1040',
}

function hslStr(c: HSL): string {
  return `hsl(${Math.round(c.h)}, ${Math.round(c.s)}%, ${Math.round(c.l)}%)`
}

function lerpHue(from: number, to: number, t: number): number {
  let diff = to - from
  if (diff > 180) diff -= 360
  if (diff < -180) diff += 360
  return (from + diff * t + 360) % 360
}

function lerpHSL(a: HSL, b: HSL, t: number): HSL {
  return {
    h: lerpHue(a.h, b.h, t),
    s: a.s + (b.s - a.s) * t,
    l: a.l + (b.l - a.l) * t,
  }
}

function buildGradient(start: HSL, end: HSL): string {
  return `linear-gradient(155deg, ${hslStr(start)}, ${hslStr(end)})`
}

// Ease-in-out cubic
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const TRANSITION_DURATION = 1200

function useGradientTransition(gameSlug: GameSlug): string {
  const target = GAME_GRADIENTS[gameSlug]
  const currentRef = useRef({ start: { ...target.start }, end: { ...target.end } })
  const [gradient, setGradient] = useState(buildGradient(target.start, target.end))
  const rafRef = useRef(0)
  const prevSlugRef = useRef(gameSlug)

  useEffect(() => {
    if (gameSlug === prevSlugRef.current) return
    prevSlugRef.current = gameSlug

    const from = { start: { ...currentRef.current.start }, end: { ...currentRef.current.end } }
    const to = GAME_GRADIENTS[gameSlug]
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const rawT = Math.min(elapsed / TRANSITION_DURATION, 1)
      const t = easeInOut(rawT)

      const s = lerpHSL(from.start, to.start, t)
      const e = lerpHSL(from.end, to.end, t)

      currentRef.current = { start: s, end: e }
      setGradient(buildGradient(s, e))

      if (rawT < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [gameSlug])

  return gradient
}

// ── Step gaps for entrance sequence ──────────────────────────────────────────
// 1: "The Archive" title       — fade
// 2: subtitle                  — fade
// 3: "DAILY GAMES" eyebrow    — pop
// 4: tabs                      — slide-up
// 5: calendar                  — triggers internal sequence
// 6: rolodex                   — stagger rise

const STEP_GAPS = [
  0,    // 1
  300,  // 2
  200,  // 3
  200,  // 4
  300,  // 5
  400,  // 6
]

// ── Inner client component (needs searchParams) ─────────────────────────────

function ArchiveInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const gameParam = searchParams.get('game') as GameSlug | null
  const [activeGame, setActiveGame] = useState<GameSlug>(gameParam || 'game-sense')
  const [entries, setEntries] = useState<ArchiveEntry[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [displayMonth, setDisplayMonth] = useState('')
  const [loaded, setLoaded] = useState(false)

  const step = useEntranceSteps(6, STEP_GAPS, true)
  const [showCard, setShowCard] = useState(false)

  // Show entry card only after all entrance animations are done
  // Step 6 fires at ~1400ms, rolodex entrance takes ~880ms
  useEffect(() => {
    if (step >= 6 && !showCard) {
      const timer = setTimeout(() => setShowCard(true), 6 * 80 + 500)
      return () => clearTimeout(timer)
    }
  }, [step, showCard])

  // Load entries when game changes
  useEffect(() => {
    const data = getArchiveForGame(activeGame)
    setEntries(data)
    setSelectedIndex(0)
    // Default display month = most recent entry's month
    if (data.length > 0) {
      setDisplayMonth(data[0].date.slice(0, 7))
    }
    setLoaded(true)
  }, [activeGame])

  const handleTabSelect = useCallback((slug: GameSlug) => {
    setActiveGame(slug)
    setLoaded(false)
    router.replace(`/play/archive?game=${slug}`, { scroll: false })
  }, [router])

  const handleSelectIndex = useCallback((idx: number) => {
    setSelectedIndex(idx)
    // Auto-flip calendar when rolodex crosses month boundary
    const entry = entries[idx]
    if (entry) {
      const entryMonth = entry.date.slice(0, 7)
      setDisplayMonth((prev) => prev !== entryMonth ? entryMonth : prev)
    }
  }, [entries])

  const activeConfig = GAME_CONFIGS.find((c) => c.slug === activeGame)!
  const selectedEntry = entries[selectedIndex] ?? null
  const bgGradient = useGradientTransition(activeGame)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main
        className="game-container relative m-4 flex-1 overflow-hidden rounded-2xl"
        style={{
          background: bgGradient,
          minHeight: 'calc(100vh - 64px - 48px)',
        }}
      >
        {/* Stipple noise overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '6px 6px',
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-8 py-10">
            {/* Header text */}
            <div className="mb-12">
              {/* Eyebrow */}
              <div
                className="mb-3 flex items-center gap-3"
                style={entrance('pop', step >= 3)}
              >
                <div className="h-[2px] w-5 rounded-full bg-amber-400" />
                <span className="font-heading text-[11px] font-extrabold uppercase tracking-[0.24em] text-white">
                  Daily Games
                </span>
              </div>

              {/* Title */}
              <h1
                className="font-heading text-[42px] font-black leading-none tracking-[-2px] text-white"
                style={entrance('fade', step >= 1)}
              >
                The Archive
              </h1>
              <p
                className="mt-2 font-heading text-[15px] italic text-white/45"
                style={entrance('fade', step >= 2)}
              >
                Every puzzle, every score. Scroll to explore or pick a date.
              </p>
            </div>

            {/* Tabs + Browse Games button */}
            <div className="mb-6 flex items-center justify-between" style={entrance('slide-up', step >= 4)}>
              <GameTabs activeGame={activeGame} onSelect={handleTabSelect} />
              <Link
                href="/play"
                className="bvl-blue !px-4 !py-2 !text-[12px] !font-semibold !tracking-normal"
                style={entrance('fade', step >= 4)}
              >
                Browse Games
              </Link>
            </div>

            {/* Two-column grid — 2-col from md up */}
            <div className="grid gap-6 md:grid-cols-[1fr_300px] lg:gap-8 lg:grid-cols-[1fr_340px]">
              {/* Rolodex — second on mobile, first on md+ */}
              <div className="order-2 md:order-1">
                {loaded && entries.length > 0 ? (
                  <Rolodex
                    entries={entries}
                    selectedIndex={selectedIndex}
                    onSelect={handleSelectIndex}
                    gameSlug={activeGame}
                    animateIn={step >= 6}
                  />
                ) : loaded ? (
                  <div className="flex h-[620px] items-center justify-center">
                    <p className="font-heading text-sm text-white/40">
                      No previous games yet. Come back tomorrow!
                    </p>
                  </div>
                ) : (
                  <div className="flex h-[620px] items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
                  </div>
                )}
              </div>

              {/* Sidebar — first on mobile (calendar+card row), second on md+ (stacked) */}
              <div className="order-1 md:order-2 md:sticky md:top-[80px] md:self-start">
                {loaded && entries.length > 0 && (
                  <div className="grid grid-cols-1 min-[480px]:grid-cols-[1fr_1fr] gap-4 md:grid-cols-1 md:gap-6">
                    <ArchiveCalendar
                      entries={entries}
                      selectedIndex={selectedIndex}
                      onSelectDate={handleSelectIndex}
                      launchDate={activeConfig.launchDate}
                      displayMonth={displayMonth}
                      onMonthChange={setDisplayMonth}
                      animateIn={step >= 5}
                      bgColor={CALENDAR_BG[activeGame]}
                    />
                    {showCard && selectedEntry && (
                      <EntryCard
                        entry={selectedEntry}
                        gameSlug={activeGame}
                        gameLabel={activeConfig.label}
                        playUrl={activeConfig.playUrl(selectedEntry.date)}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
        </div>
      </main>
    </div>
  )
}

// ── Page wrapper with Suspense for useSearchParams ───────────────────────────

export default function ArchivePage() {
  return (
    <Suspense fallback={null}>
      <ArchiveInner />
    </Suspense>
  )
}
