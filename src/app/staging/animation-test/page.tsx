'use client'

import { useState, useCallback, useMemo } from 'react'
import { entrance, useEntranceSteps, type EntrancePreset } from '@/lib/animations'
import ResultCard from '@/components/games/ResultCard'
import DailyBadgeShelf from '@/components/games/DailyBadgeShelf'

// ── Demo box ─────────────────────────────────────────────────────────────────

function DemoBox({
  preset,
  active,
  delayMs,
  label,
  className = '',
}: {
  preset: EntrancePreset
  active: boolean
  delayMs?: number
  label: string
  className?: string
}) {
  return (
    <div
      className={`flex h-24 items-center justify-center rounded-2xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] px-6 font-heading text-sm font-bold text-[hsl(var(--game-ink))] shadow-sm ${className}`}
      style={entrance(preset, active, delayMs)}
    >
      {label}
    </div>
  )
}

// ── Coloured bar (for wipe demos) ────────────────────────────────────────────

function WipeBar({
  preset,
  active,
  colour = 'var(--game-blue)',
  label,
}: {
  preset: EntrancePreset
  active: boolean
  colour?: string
  label: string
}) {
  return (
    <div
      className="flex h-14 items-center justify-center rounded-2xl font-heading text-[12px] font-bold uppercase tracking-[0.15em] text-white"
      style={{
        background: `hsl(${colour})`,
        ...entrance(preset, active),
      }}
    >
      {label}
    </div>
  )
}

// ── Word pop demo ────────────────────────────────────────────────────────────

const DEMO_WORDS = ['Guess', 'The', 'Game']
const TILTS = [-4, 3, -2]

function WordPopDemo({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {DEMO_WORDS.map((word, i) => (
        <span
          key={word}
          className="inline-block font-heading text-3xl font-black text-[hsl(var(--game-blue))]"
          style={{
            '--ih-tilt': `${TILTS[i]}deg`,
            ...(entrance('word-pop', active, i * 100)),
          } as React.CSSProperties}
        >
          {word}
        </span>
      ))}
    </div>
  )
}

// ── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="mb-4 border-b border-dashed border-[hsl(var(--game-ink))]/10 pb-2">
        <span className="font-heading text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">
          {title}
        </span>
      </div>
      {children}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AnimationTestPage() {
  const [playing, setPlaying] = useState(false)
  const [key, setKey] = useState(0)

  // Stable gaps arrays
  const sequenceGaps = useMemo(() => [0, 300, 300, 300, 300, 300, 300, 300, 300], [])
  const step = useEntranceSteps(9, sequenceGaps, playing)

  const play = useCallback(() => {
    setPlaying(false)
    setKey((k) => k + 1)
    setTimeout(() => setPlaying(true), 50)
  }, [])

  const reset = useCallback(() => {
    setPlaying(false)
    setKey((k) => k + 1)
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Controls */}
      <div className="mb-10 flex items-center gap-4">
        <h1 className="font-heading text-2xl font-black text-[hsl(var(--game-ink))]">
          Entrance Presets
        </h1>
        <button
          onClick={play}
          className="rounded-xl bg-[hsl(var(--game-blue))] px-6 py-2.5 font-heading text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          Play
        </button>
        <button
          onClick={reset}
          className="rounded-xl border-2 border-[hsl(var(--game-ink))]/15 bg-white px-6 py-2.5 font-heading text-sm font-bold text-[hsl(var(--game-ink))] transition-transform hover:scale-105 active:scale-95"
        >
          Reset
        </button>
        <span className="font-heading text-xs font-semibold text-[hsl(var(--game-ink-light))]">
          {playing ? 'Playing...' : 'Ready'}
        </span>
      </div>

      <div key={`presets-${key}`}>
        {/* ── Individual presets ── */}

        <Section title="Pop — scale 0 → 120% → 100%, 0.3s back-out">
          <DemoBox preset="pop" active={playing} label="Pop" />
        </Section>

        <Section title="Fade — opacity 0 → 1, 0.5s ease-in">
          <DemoBox preset="fade" active={playing} label="Fade" />
        </Section>

        <Section title="Move — translateX(-50px) → 0, 0.3s back-out">
          <DemoBox preset="move" active={playing} label="Move" />
        </Section>

        <Section title="Slide Up — translateY(30px) → 0, 0.35s ease (content strip style)">
          <DemoBox preset="slide-up" active={playing} label="Slide Up" />
        </Section>

        <Section title="Rise — translateY(80px) → 0, 0.4s spring (gravity drop style)">
          <DemoBox preset="rise" active={playing} label="Rise" />
        </Section>

        <Section title="Wipe — scaleX 0 → 1 from center, 0.4s expo ease">
          <WipeBar preset="wipe" active={playing} label="Wipe (scaleX)" />
        </Section>

        <Section title="Wipe Right — clip-path left → right, 0.6s expo ease">
          <WipeBar preset="wipe-right" active={playing} label="Wipe Right" />
        </Section>

        <Section title="Wipe Down — clip-path top → bottom, 0.6s expo ease">
          <WipeBar preset="wipe-down" active={playing} colour="var(--game-amber)" label="Wipe Down" />
        </Section>

        <Section title="Word Pop — per-word scale + tilt, 0.3s back-out, 100ms stagger">
          <WordPopDemo active={playing} />
        </Section>

        {/* ── Stagger demos ── */}

        <Section title="Stagger: Slide Up — content strip style cards (120ms apart)">
          <div className="grid grid-cols-3 gap-3">
            {['Card X', 'Card Y', 'Card Z'].map((label, i) => (
              <DemoBox
                key={label}
                preset="slide-up"
                active={playing}
                delayMs={i * 120}
                label={label}
              />
            ))}
          </div>
        </Section>

        <Section title="Stagger: Rise — gravity drop list (100ms apart)">
          <div className="flex flex-col gap-3">
            {['Header', 'Spotlight', 'Review A', 'Review B', 'Review C', 'Links'].map((label, i) => (
              <div
                key={label}
                className="flex h-14 items-center justify-center rounded-xl bg-[hsl(var(--game-green))]/10 font-heading text-[11px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--game-green))]"
                style={entrance('rise', playing, i * 100)}
              >
                {label}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Stagger: Move — rank ladder style (80ms apart)">
          <div className="flex flex-col gap-2">
            {['Master', 'Expert', 'Adept', 'Apprentice', 'Novice'].map((label, i) => (
              <div
                key={label}
                className="flex h-12 items-center rounded-xl border-[1.5px] border-dashed border-[hsl(var(--game-ink))]/10 px-4 font-heading text-[12px] font-bold text-[hsl(var(--game-ink))]"
                style={entrance('move', playing, i * 80)}
              >
                {label}
              </div>
            ))}
          </div>
        </Section>

        {/* ── Sequenced demo (useEntranceSteps) ── */}

        <Section title="Sequenced — useEntranceSteps, 300ms gaps between each">
          <div className="flex flex-col gap-3">
            <DemoBox preset="pop" active={step >= 1} label="Step 1 — pop" />
            <DemoBox preset="fade" active={step >= 2} label="Step 2 — fade" />
            <DemoBox preset="move" active={step >= 3} label="Step 3 — move" />
            <DemoBox preset="slide-up" active={step >= 4} label="Step 4 — slide-up" />
            <DemoBox preset="rise" active={step >= 5} label="Step 5 — rise" />
            <WipeBar preset="wipe" active={step >= 6} label="Step 6 — wipe" />
            <WipeBar preset="wipe-right" active={step >= 7} label="Step 7 — wipe-right" />
            <WipeBar preset="wipe-down" active={step >= 8} colour="var(--game-amber)" label="Step 8 — wipe-down" />
            <div style={entrance('fade', step >= 9)}>
              <WordPopDemo active={step >= 9} />
            </div>
          </div>
        </Section>

        {/* ── Real components ── */}

        <Section title="ResultCard — full 15-step cascade">
          <div key={`rc-${key}`}>
            <ResultCard
              game="game-sense"
              score={75}
              streak={3}
              won={true}
              puzzleLabel="Game Sense #042 · Mon 10th Mar"
              onViewResults={() => {}}
              animateEntrance={playing}
            />
          </div>
        </Section>

        <Section title="DailyBadgeShelf — wipe + staggered badges">
          <div key={`bs-${key}`}>
            <DailyBadgeShelf currentGame="game-sense" animateStamp={playing} />
          </div>
        </Section>
      </div>
    </div>
  )
}
