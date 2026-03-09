'use client'

import { useState } from 'react'

/* ─── helpers ─── */
const Label = ({ num, title, annotation }: { num: string; title: string; annotation: string }) => (
  <div className="mb-6">
    <div className="flex items-center gap-3">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--game-amber))] font-heading text-[11px] font-black text-white shadow-[0_2px_6px_rgba(200,135,58,0.4)]" style={{ transform: 'rotate(-2deg)' }}>
        {num}
      </span>
      <h2 className="font-heading text-[20px] font-black text-[hsl(var(--game-ink))]">{title}</h2>
    </div>
    <p className="mt-2 max-w-xl font-heading text-[13px] font-semibold italic leading-relaxed text-[hsl(var(--game-ink-light))]">
      {annotation}
    </p>
  </div>
)

const Section = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <section className={`rounded-2xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-6 shadow-[0_3px_0_hsl(var(--game-cream-dark)),0_6px_20px_rgba(0,0,0,0.06)] sm:p-8 ${className}`}>
    {children}
  </section>
)

/* ─── 01 Game Poster Card ─── */
function GamePosterCard() {
  return (
    <>
      <Label num="01" title="Game Poster Card" annotation="Cover art dominant with floating score badge. Minimal footer with title, year, and platform chips." />
      <Section>
        <div className="flex flex-wrap gap-6">
          {[
            { title: 'Hollow Knight', year: '2017', score: 90, platforms: ['PC', 'Switch'] },
            { title: 'Celeste', year: '2018', score: 92, platforms: ['PC', 'PS4', 'Switch'] },
            { title: 'Outer Wilds', year: '2019', score: 86, platforms: ['PC', 'Xbox'] },
          ].map((game) => (
            <div key={game.title} className="group relative w-[180px] cursor-pointer" style={{ transition: 'transform 0.25s cubic-bezier(0.34,1.5,0.64,1)' }}>
              {/* Cover art placeholder 3:4 */}
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(var(--game-ink))]/10 to-[hsl(var(--game-ink))]/5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">Cover Art</span>
                </div>
                {/* Floating score badge */}
                <div className="absolute -right-3 -top-3 flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(var(--game-ink))] shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
                  <span className="font-heading text-[14px] font-black text-white">{game.score}</span>
                </div>
              </div>
              {/* Footer */}
              <div className="mt-3 px-1">
                <h3 className="font-heading text-[16px] font-black leading-tight text-[hsl(var(--game-ink))]">{game.title}</h3>
                <p className="mt-0.5 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">{game.year}</p>
                <div className="mt-2 flex gap-1.5">
                  {game.platforms.map((p) => (
                    <span key={p} className="rounded-md bg-[hsl(var(--game-cream))] px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--game-ink-mid))]">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

/* ─── 02 Franchise Collection Card ─── */
function FranchiseCollectionCard() {
  const [expanded, setExpanded] = useState(false)
  const games = ['CE', 'H2', 'H3', 'RC', 'H4', 'H5']

  return (
    <>
      <Label num="02" title="Franchise Collection Card" annotation="Franchise header with count pill, scrollable thumbnail strip, and expandable show-all trigger." />
      <Section>
        <div className="w-full max-w-sm rounded-2xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-[24px] font-black text-[hsl(var(--game-ink))]">Halo</h3>
            <span className="rounded-full bg-[hsl(var(--game-amber))] px-3 py-1 font-heading text-[11px] font-bold text-white">6 Games</span>
          </div>
          {/* Thumbnail strip */}
          <div className={`mt-4 flex gap-2 ${expanded ? 'flex-wrap' : 'overflow-x-auto'}`}>
            {games.map((g) => (
              <div key={g} className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--game-ink))]/8">
                <span className="font-heading text-[10px] font-black text-[hsl(var(--game-ink-mid))]">{g}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 font-heading text-[12px] font-bold text-[hsl(var(--game-amber))] transition-colors hover:text-[hsl(var(--game-ink))]"
          >
            {expanded ? 'Collapse' : 'Show all'}
          </button>
        </div>
      </Section>
    </>
  )
}

/* ─── 03 Vibe Cluster ─── */
function VibeCluster() {
  const vibes = [
    { title: 'Alien: Isolation', year: '2014', x: -140, y: -80 },
    { title: 'Dead Space', year: '2008', x: 130, y: -60 },
    { title: 'Returnal', year: '2021', x: -120, y: 70 },
    { title: 'Prey', year: '2017', x: 150, y: 50 },
    { title: 'Soma', year: '2015', x: 0, y: -110 },
  ]

  return (
    <>
      <Label num="03" title="Vibe Cluster" annotation="Central vibe label with loosely arranged game cards connected by dashed lines. Organic, exploratory feel." />
      <Section>
        <div className="relative mx-auto flex h-[320px] w-full max-w-lg items-center justify-center">
          {/* Centre label */}
          <div className="relative z-10 rounded-full bg-[hsl(var(--game-white))] px-5 py-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
            <span className="font-heading text-[15px] font-semibold italic text-[hsl(var(--game-ink))]">surviving alien horrors</span>
          </div>
          {/* SVG dashed lines */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="-200 -160 400 320">
            {vibes.map((v) => (
              <line key={v.title} x1={0} y1={0} x2={v.x} y2={v.y} stroke="hsl(var(--game-ink-dim))" strokeWidth="1" strokeDasharray="4 4" />
            ))}
          </svg>
          {/* Game cards */}
          {vibes.map((v) => (
            <div
              key={v.title}
              className="absolute z-10 rounded-xl bg-[hsl(var(--game-white))] px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
              style={{
                left: `calc(50% + ${v.x * 0.7}px)`,
                top: `calc(50% + ${v.y * 0.7}px)`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className="block font-heading text-[13px] font-black text-[hsl(var(--game-ink))]">{v.title}</span>
              <span className="font-heading text-[11px] font-semibold italic text-[hsl(var(--game-ink-light))]">{v.year}</span>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

/* ─── 04 Review Snippet Card ─── */
function ReviewSnippetCard() {
  return (
    <>
      <Label num="04" title="Review Snippet Card" annotation="Pull-quote with decorative quotation mark, game reference, and author credit. Amber top stripe accent." />
      <Section>
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-[hsl(var(--game-white))] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          {/* Amber stripe */}
          <div className="h-1 bg-[hsl(var(--game-amber))]" />
          <div className="p-6">
            {/* Decorative quote mark */}
            <span className="block font-heading text-[48px] font-black leading-none text-[hsl(var(--game-amber))]/30">&ldquo;</span>
            <p className="-mt-4 font-heading text-[20px] font-extrabold italic leading-snug text-[hsl(var(--game-ink))]">
              One of the most beautifully haunting experiences in gaming. Every discovery feels earned.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {/* Thumbnail */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--game-ink))]/8">
                <span className="font-heading text-[8px] font-bold text-[hsl(var(--game-ink-light))]">OW</span>
              </div>
              <div>
                <span className="block font-heading text-[13px] font-black text-[hsl(var(--game-ink))]">Outer Wilds</span>
                <span className="font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">By James Chen</span>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}

/* ─── 05 Comparison Card ─── */
function ComparisonCard() {
  return (
    <>
      <Label num="05" title="Comparison Card" annotation="Two games side by side with shared stat rows, bar chart scores, and a dashed VS divider." />
      <Section>
        <div className="w-full max-w-lg overflow-hidden rounded-2xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))]">
          <div className="flex">
            {/* Left game */}
            <div className="flex-1 p-5">
              <div className="mb-3 aspect-square w-full max-w-[100px] rounded-xl bg-[hsl(var(--game-ink))]/6 mx-auto flex items-center justify-center">
                <span className="font-heading text-[10px] font-bold text-[hsl(var(--game-ink-light))]">Cover</span>
              </div>
              <h4 className="text-center font-heading text-[16px] font-black text-[hsl(var(--game-ink))]">Hollow Knight</h4>
              <p className="text-center font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">2017</p>
            </div>

            {/* VS divider */}
            <div className="flex flex-col items-center justify-center border-x border-dashed border-[hsl(var(--game-ink))]/15 px-3">
              <span className="rounded-full bg-[hsl(var(--game-ink))] px-2.5 py-1 font-heading text-[10px] font-black text-white">VS</span>
            </div>

            {/* Right game */}
            <div className="flex-1 p-5">
              <div className="mb-3 aspect-square w-full max-w-[100px] rounded-xl bg-[hsl(var(--game-ink))]/6 mx-auto flex items-center justify-center">
                <span className="font-heading text-[10px] font-bold text-[hsl(var(--game-ink-light))]">Cover</span>
              </div>
              <h4 className="text-center font-heading text-[16px] font-black text-[hsl(var(--game-ink))]">Celeste</h4>
              <p className="text-center font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">2018</p>
            </div>
          </div>

          {/* Shared stats */}
          <div className="border-t border-[hsl(var(--game-ink))]/10 px-5 py-4">
            {/* OpenCritic bars */}
            <div className="mb-3">
              <span className="mb-1.5 block font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">OpenCritic</span>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-2.5 overflow-hidden rounded-full bg-[hsl(var(--game-cream))]">
                    <div className="h-full rounded-full bg-[hsl(var(--game-amber))]" style={{ width: '90%' }} />
                  </div>
                  <span className="mt-0.5 block text-right font-heading text-[11px] font-bold text-[hsl(var(--game-ink-mid))]">90</span>
                </div>
                <div className="flex-1">
                  <div className="h-2.5 overflow-hidden rounded-full bg-[hsl(var(--game-cream))]">
                    <div className="h-full rounded-full bg-[hsl(var(--game-blue))]" style={{ width: '92%' }} />
                  </div>
                  <span className="mt-0.5 block text-right font-heading text-[11px] font-bold text-[hsl(var(--game-ink-mid))]">92</span>
                </div>
              </div>
            </div>
            {/* Genre chips */}
            <div className="flex items-center gap-3">
              <div className="flex flex-1 flex-wrap gap-1">
                <span className="rounded-md bg-[hsl(var(--game-cream))] px-2 py-0.5 font-heading text-[10px] font-bold text-[hsl(var(--game-ink-mid))]">Metroidvania</span>
                <span className="rounded-md bg-[hsl(var(--game-cream))] px-2 py-0.5 font-heading text-[10px] font-bold text-[hsl(var(--game-ink-mid))]">Action</span>
              </div>
              <div className="flex flex-1 flex-wrap justify-end gap-1">
                <span className="rounded-md bg-[hsl(var(--game-cream))] px-2 py-0.5 font-heading text-[10px] font-bold text-[hsl(var(--game-ink-mid))]">Platformer</span>
                <span className="rounded-md bg-[hsl(var(--game-cream))] px-2 py-0.5 font-heading text-[10px] font-bold text-[hsl(var(--game-ink-mid))]">Indie</span>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}

/* ─── 06 Stat Dashboard Card ─── */
function StatDashboardCard() {
  return (
    <>
      <Label num="06" title="Stat Dashboard Card" annotation="Dense data card with big numbers, progress ring, streak count, and medals. Grid layout." />
      <Section>
        <div className="w-full max-w-sm rounded-2xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Games played */}
            <div className="rounded-xl bg-[hsl(var(--game-cream))] p-4">
              <span className="block font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">Games Played</span>
              <span className="mt-1 block font-heading text-[38px] font-black leading-none text-[hsl(var(--game-ink))]">247</span>
            </div>
            {/* Accuracy */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-[hsl(var(--game-cream))] p-4">
              <span className="block font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">Accuracy</span>
              {/* Progress ring placeholder */}
              <div className="relative mt-2 h-16 w-16">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--game-cream-dark))" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--game-amber))" strokeWidth="3" strokeDasharray="94.25" strokeDashoffset="22.6" strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-heading text-[14px] font-black text-[hsl(var(--game-ink))]">76%</span>
              </div>
            </div>
            {/* Streak */}
            <div className="rounded-xl bg-[hsl(var(--game-cream))] p-4">
              <span className="block font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">Current Streak</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl">&#x1F525;</span>
                <span className="font-heading text-[28px] font-black leading-none text-[hsl(var(--game-ink))]">12</span>
              </div>
            </div>
            {/* Medals */}
            <div className="rounded-xl bg-[hsl(var(--game-cream))] p-4">
              <span className="block font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">Medals</span>
              <div className="mt-2 flex gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--game-amber))] shadow-[0_0_8px_rgba(200,135,58,0.4)]">
                  <span className="font-heading text-[10px] font-black text-white">G</span>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--game-ink-light))]">
                  <span className="font-heading text-[10px] font-black text-white">S</span>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--game-amber))]/60">
                  <span className="font-heading text-[10px] font-black text-white">B</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}

/* ─── 07 Article Preview Card ─── */
function ArticlePreviewCard() {
  return (
    <>
      <Label num="07" title="Article Preview Card" annotation="Blog card with category chip, image zone, title, excerpt, and footer metadata. Hover lifts and rotates." />
      <Section>
        <div className="flex flex-wrap gap-6">
          {[
            { category: 'Editorial', title: 'Why Cosy Games Matter More Than Ever', excerpt: 'In a world of competitive shooters, the quiet revolution of gentle play continues to grow.', time: '6 min', date: '12 Feb 2026' },
            { category: 'Review', title: 'Stardew Valley: Five Years Later', excerpt: 'Revisiting the farm sim that defined a generation. Still as warm as a cup of tea.', time: '8 min', date: '03 Jan 2026' },
          ].map((a) => (
            <div
              key={a.title}
              className="group w-full max-w-[280px] cursor-pointer overflow-hidden rounded-2xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] shadow-[0_3px_0_hsl(var(--game-cream-dark)),0_6px_20px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:rotate-[0.5deg] hover:shadow-[0_8px_0_hsl(var(--game-cream-dark)),0_18px_40px_rgba(0,0,0,0.1)]"
              style={{ transition: 'transform 0.3s cubic-bezier(0.34,1.5,0.64,1), box-shadow 0.3s ease' }}
            >
              {/* Category chip */}
              <div className="relative">
                <div className="aspect-video w-full bg-gradient-to-br from-[hsl(var(--game-ink))]/8 to-[hsl(var(--game-ink))]/4 flex items-center justify-center">
                  <span className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--game-ink-dim))]">16:9 Image</span>
                </div>
                <span className="absolute left-3 top-3 rounded-md bg-[hsl(var(--game-amber))] px-2.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_2px_6px_rgba(200,135,58,0.3)]">
                  {a.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-heading text-[18px] font-black leading-tight text-[hsl(var(--game-ink))]">{a.title}</h3>
                <p className="mt-2 font-heading text-[13px] font-semibold italic leading-relaxed text-[hsl(var(--game-ink-light))]">{a.excerpt}</p>
                <div className="mt-3 flex gap-3">
                  <span className="font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-dim))]">{a.time} read</span>
                  <span className="font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-dim))]">{a.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

/* ─── 08 Game of the Week Card ─── */
function GameOfTheWeekCard() {
  return (
    <>
      <Label num="08" title="Game of the Week Card" annotation="Hero-scale card. Full-width, two columns: large image and editorial content with sticker label, stat pills." />
      <Section>
        <div className="w-full overflow-hidden rounded-2xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))]">
          <div className="flex flex-col md:flex-row">
            {/* Left: image */}
            <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[hsl(var(--game-ink))]/10 to-[hsl(var(--game-ink))]/5 md:w-1/2">
              <span className="font-heading text-[12px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--game-ink-dim))]">Hero Image</span>
            </div>
            {/* Right: content */}
            <div className="flex flex-col justify-center p-6 md:w-1/2 md:p-8">
              {/* Sticker */}
              <span
                className="mb-4 inline-block self-start rounded-lg bg-[hsl(var(--game-amber))] px-4 py-1.5 font-heading text-[12px] font-black uppercase tracking-[0.1em] text-white shadow-[0_3px_8px_rgba(200,135,58,0.35)]"
                style={{ transform: 'rotate(-1.5deg)' }}
              >
                Game of the Week
              </span>
              <h3 className="font-heading text-[30px] font-black leading-none text-[hsl(var(--game-ink))]">Outer Wilds</h3>
              <p className="mt-3 font-heading text-[14px] font-semibold italic leading-relaxed text-[hsl(var(--game-ink-light))]">
                A time-loop space mystery that rewards curiosity above all else. Every planet hides something worth finding.
              </p>
              <a className="mt-4 inline-block font-heading text-[13px] font-bold text-[hsl(var(--game-amber))] underline decoration-[hsl(var(--game-amber))]/30 underline-offset-2 transition-colors hover:text-[hsl(var(--game-ink))]" href="#">
                Read more &rarr;
              </a>
              {/* Stat pills */}
              <div className="mt-4 flex flex-wrap gap-2">
                {['86 OpenCritic', '2019', 'Exploration', 'Puzzle'].map((s) => (
                  <span key={s} className="rounded-full bg-[hsl(var(--game-cream))] px-3 py-1 font-heading text-[11px] font-bold text-[hsl(var(--game-ink-mid))]">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}

/* ─── 09 Earned Medal System ─── */
function EarnedMedalSystem() {
  return (
    <>
      <Label num="09" title="Earned Medal System" annotation="Three medal states: locked, earned, and just-earned with pulsing glow. Bronze, Silver, Gold at three sizes." />
      <Section>
        <div className="space-y-8">
          {/* States */}
          <div>
            <h4 className="mb-3 font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">Medal States</h4>
            <div className="flex items-end gap-6">
              {/* Locked */}
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-[hsl(var(--game-ink-dim))]">
                  <span className="font-heading text-[10px] font-bold text-[hsl(var(--game-ink-dim))]">?</span>
                </div>
                <span className="mt-1.5 block font-heading text-[10px] font-bold text-[hsl(var(--game-ink-dim))]">Locked</span>
              </div>
              {/* Earned static */}
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--game-amber))] shadow-[0_0_0_3px_hsl(var(--game-amber-lt)),0_0_12px_rgba(200,135,58,0.3)]">
                  <span className="font-heading text-[14px] font-black text-white">&#9733;</span>
                </div>
                <span className="mt-1.5 block font-heading text-[10px] font-bold text-[hsl(var(--game-ink-mid))]">Earned</span>
              </div>
              {/* Just earned */}
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--game-amber))] animate-pulse shadow-[0_0_0_4px_hsl(var(--game-amber-lt)),0_0_20px_rgba(200,135,58,0.5)]" style={{ animationDuration: '1.5s' }}>
                  <span className="font-heading text-[14px] font-black text-white">&#9733;</span>
                </div>
                <span className="mt-1.5 block font-heading text-[10px] font-bold text-[hsl(var(--game-amber))]">Just earned</span>
              </div>
            </div>
          </div>

          {/* Tiers and sizes */}
          <div>
            <h4 className="mb-3 font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">Tiers &amp; Sizes</h4>
            <div className="flex items-end gap-8">
              {/* Bronze */}
              <div className="text-center">
                {[48, 72, 96].map((size) => (
                  <div key={`b-${size}`} className="mx-auto mb-2 flex items-center justify-center rounded-full bg-[hsl(var(--game-amber))]/60" style={{ width: size, height: size }}>
                    <span className="font-heading font-black text-white" style={{ fontSize: size * 0.28 }}>B</span>
                  </div>
                ))}
                <span className="font-heading text-[10px] font-bold text-[hsl(var(--game-ink-light))]">Bronze</span>
              </div>
              {/* Silver */}
              <div className="text-center">
                {[48, 72, 96].map((size) => (
                  <div key={`s-${size}`} className="mx-auto mb-2 flex items-center justify-center rounded-full bg-[hsl(var(--game-ink-light))]" style={{ width: size, height: size }}>
                    <span className="font-heading font-black text-white" style={{ fontSize: size * 0.28 }}>S</span>
                  </div>
                ))}
                <span className="font-heading text-[10px] font-bold text-[hsl(var(--game-ink-light))]">Silver</span>
              </div>
              {/* Gold */}
              <div className="text-center">
                {[48, 72, 96].map((size) => (
                  <div key={`g-${size}`} className="mx-auto mb-2 flex items-center justify-center rounded-full bg-[hsl(var(--game-amber))] shadow-[0_0_0_3px_hsl(var(--game-amber-lt)),0_0_12px_rgba(200,135,58,0.3)]" style={{ width: size, height: size }}>
                    <span className="font-heading font-black text-white" style={{ fontSize: size * 0.28 }}>G</span>
                  </div>
                ))}
                <span className="font-heading text-[10px] font-bold text-[hsl(var(--game-amber))]">Gold</span>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}

/* ─── 10 Genre Tags with Personality ─── */
function GenreTagsWithPersonality() {
  return (
    <>
      <Label num="10" title="Genre Tags with Personality" annotation="Eight genre chips, each with micro-detail: icons, patterns, or colour shifts while keeping the rounded-md chip shape." />
      <Section>
        <div className="flex flex-wrap gap-3">
          {/* RPG - sword icon */}
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[hsl(var(--game-purple))]/12 px-3 py-1.5 font-heading text-[12px] font-bold text-[hsl(var(--game-purple))]">
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0L9.5 5.5H15L10.5 9L12 15L8 11.5L4 15L5.5 9L1 5.5H6.5L8 0Z" /></svg>
            RPG
          </span>
          {/* Platformer - step pattern */}
          <span className="relative overflow-hidden rounded-md bg-[hsl(var(--game-blue))]/12 px-3 py-1.5 font-heading text-[12px] font-bold text-[hsl(var(--game-blue))]">
            <span className="absolute bottom-0 right-0 h-2 w-4 bg-[hsl(var(--game-blue))]/8" />
            <span className="absolute bottom-2 right-4 h-2 w-4 bg-[hsl(var(--game-blue))]/8" />
            Platformer
          </span>
          {/* Horror - darker bg */}
          <span className="rounded-md bg-[hsl(var(--game-ink))]/12 px-3 py-1.5 font-heading text-[12px] font-bold text-[hsl(var(--game-ink))]">
            Horror
          </span>
          {/* Strategy - grid pattern */}
          <span className="relative overflow-hidden rounded-md bg-[hsl(var(--game-green))]/12 px-3 py-1.5 font-heading text-[12px] font-bold text-[hsl(var(--game-green))]">
            <span className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 5px, currentColor 5px, currentColor 6px), repeating-linear-gradient(90deg, transparent, transparent 5px, currentColor 5px, currentColor 6px)' }} />
            Strategy
          </span>
          {/* Simulation */}
          <span className="rounded-md border border-[hsl(var(--game-amber))]/20 bg-[hsl(var(--game-amber))]/10 px-3 py-1.5 font-heading text-[12px] font-bold text-[hsl(var(--game-amber))]">
            Simulation
          </span>
          {/* Puzzle */}
          <span className="rounded-md bg-[hsl(var(--game-blue-light))]/20 px-3 py-1.5 font-heading text-[12px] font-bold text-[hsl(var(--game-blue))]">
            Puzzle
          </span>
          {/* Adventure */}
          <span className="rounded-md bg-[hsl(var(--game-green))]/8 px-3 py-1.5 font-heading text-[12px] font-bold italic text-[hsl(var(--game-green))]">
            Adventure
          </span>
          {/* Roguelike */}
          <span className="rounded-md bg-[hsl(var(--game-red))]/10 px-3 py-1.5 font-heading text-[12px] font-bold text-[hsl(var(--game-red))]">
            Roguelike
          </span>
        </div>
      </Section>
    </>
  )
}

/* ─── 11 Streak Indicator ─── */
function StreakIndicator() {
  return (
    <>
      <Label num="11" title="Streak Indicator" annotation="Seven-day circle row with progressive intensity. 3-day subtle, 5-day amber glow, 7-day on fire." />
      <Section>
        <div className="space-y-8">
          {/* 3-day streak */}
          <div>
            <div className="flex items-center gap-2">
              {[true, true, true, false, false, false, false].map((filled, i) => (
                <div
                  key={`3-${i}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${filled ? 'bg-[hsl(var(--game-amber))]/30' : 'border-2 border-dashed border-[hsl(var(--game-ink-dim))]'}`}
                >
                  {filled && <span className="font-heading text-[10px] font-black text-[hsl(var(--game-amber))]">&#10003;</span>}
                </div>
              ))}
            </div>
            <p className="mt-2 font-heading text-[13px] font-bold text-[hsl(var(--game-ink-mid))]">3 day streak</p>
          </div>

          {/* 5-day streak */}
          <div>
            <div className="flex items-center gap-2">
              {[true, true, true, true, true, false, false].map((filled, i) => (
                <div
                  key={`5-${i}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${filled ? 'bg-[hsl(var(--game-amber))] shadow-[0_0_8px_rgba(200,135,58,0.3)]' : 'border-2 border-dashed border-[hsl(var(--game-ink-dim))]'}`}
                >
                  {filled && <span className="font-heading text-[10px] font-black text-white">&#10003;</span>}
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-base">&#x1F525;</span>
              <p className="font-heading text-[13px] font-bold text-[hsl(var(--game-amber))]">5 day streak</p>
            </div>
          </div>

          {/* 7-day streak */}
          <div>
            <div className="flex items-center gap-2">
              {[true, true, true, true, true, true, true].map((_, i) => (
                <div
                  key={`7-${i}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--game-amber))] shadow-[0_0_12px_rgba(200,135,58,0.5)]"
                >
                  <span className="font-heading text-[10px] font-black text-white">&#10003;</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-lg">&#x1F525;</span>
              <p className="font-heading text-[14px] font-black text-[hsl(var(--game-amber))]">7 day streak &middot; On fire</p>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}

/* ─── 12 Context Chips Hierarchy ─── */
function ContextChipsHierarchy() {
  return (
    <>
      <Label num="12" title="Context Chips Hierarchy" annotation="Three tiers of chips: Primary (strong), Secondary (outlined), Muted (subtle). Each with example text." />
      <Section>
        <div className="space-y-6">
          {/* Primary */}
          <div>
            <span className="mb-2 block font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">Primary</span>
            <div className="flex flex-wrap gap-2">
              {['Featured', 'New Release', 'Editor\'s Pick'].map((t) => (
                <span key={t} className="rounded-full bg-[hsl(var(--game-amber))] px-4 py-1.5 font-heading text-[12px] font-bold text-white shadow-[0_2px_6px_rgba(200,135,58,0.3)]">{t}</span>
              ))}
            </div>
          </div>
          {/* Secondary */}
          <div>
            <span className="mb-2 block font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">Secondary</span>
            <div className="flex flex-wrap gap-2">
              {['RPG', 'Indie', 'Narrative'].map((t) => (
                <span key={t} className="rounded-full border border-[hsl(var(--game-amber))] bg-[hsl(var(--game-amber-lt))] px-4 py-1.5 font-heading text-[12px] font-bold text-[hsl(var(--game-amber))]">{t}</span>
              ))}
            </div>
          </div>
          {/* Muted */}
          <div>
            <span className="mb-2 block font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">Muted</span>
            <div className="flex flex-wrap gap-2">
              {['2019', 'PC', '8 hours'].map((t) => (
                <span key={t} className="rounded-full border border-[hsl(var(--game-cream-dark))] bg-[hsl(var(--game-cream))] px-4 py-1.5 font-heading text-[12px] font-bold text-[hsl(var(--game-ink-light))]">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}

/* ─── 13 Blog Type Scale ─── */
function BlogTypeScale() {
  return (
    <>
      <Label num="13" title="Blog Type Scale" annotation="Full editorial type hierarchy in context: display headline, subhead, body, caption, pull-quote, footnote." />
      <Section>
        <div className="max-w-2xl">
          {/* Display headline */}
          <h2 className="font-heading text-[clamp(32px,5vw,52px)] font-black leading-[0.95] tracking-tight text-[hsl(var(--game-ink))]">
            The Quiet Joy of Playing Slowly
          </h2>
          {/* Subhead */}
          <h3 className="mt-3 font-heading text-[18px] font-bold leading-snug text-[hsl(var(--game-ink-mid))]">
            Why the best games reward patience over reflexes
          </h3>
          {/* Body */}
          <p className="mt-5 font-heading text-[15px] font-normal leading-[1.7] text-[hsl(var(--game-ink))]">
            There is something profoundly satisfying about a game that does not rush you. Where the world waits, unhurried, for you to notice the way light catches on water, or the way a character fidgets when left idle. These are the games that teach us to look more carefully, to listen more closely, to find beauty in the unheroic.
          </p>
          {/* Caption */}
          <p className="mt-4 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Screenshot from Firewatch (2016), Campo Santo. The watchtower at golden hour.
          </p>
          {/* Pull-quote */}
          <blockquote className="my-6 border-l-4 border-[hsl(var(--game-amber))] pl-5">
            <p className="font-heading text-[22px] font-extrabold italic leading-snug text-[hsl(var(--game-ink))]">
              &ldquo;The best games do not demand your attention. They earn it, quietly.&rdquo;
            </p>
          </blockquote>
          {/* More body */}
          <p className="font-heading text-[15px] font-normal leading-[1.7] text-[hsl(var(--game-ink))]">
            It is no coincidence that the cosy games movement has grown alongside our collective exhaustion. When everything demands urgency, choosing a game that lets you sit and watch the rain becomes a radical act.
          </p>
          {/* Footnote */}
          <p className="mt-6 font-heading text-[11px] font-semibold leading-relaxed text-[hsl(var(--game-ink-light))]">
            * Cosy gaming, sometimes called &ldquo;wholesome gaming,&rdquo; refers broadly to titles that prioritise comfort, creativity, and low-stakes exploration. The term gained mainstream usage around 2020.
          </p>
        </div>
      </Section>
    </>
  )
}

/* ─── 14 Article Drop Cap ─── */
function ArticleDropCap() {
  const paragraphs = [
    { letter: 'A', text: 'cross the frosted peaks of Celeste Mountain, a climber ascends. Not for glory or conquest, but for something harder to name. Madeline climbs because she must, because the mountain is a mirror, and what she finds there is both terrifying and necessary. The game asks nothing of the player except persistence.' },
    { letter: 'T', text: 'here is a particular quality to games that take place in autumn. The light arrives sideways, warm and amber, and everything feels like it is ending beautifully. These are games about harvest, about gathering in, about the satisfaction of a cellar well stocked before winter. They remind us that endings can be gentle.' },
    { letter: 'W', text: 'hen the rain comes in Stardew Valley, you can hear it on the roof of your farmhouse. The crops drink it in. The villagers stay indoors. And you, the player, are given permission to do nothing at all. To sit on the porch and watch the puddles form. This is the gift of the slow game: permission to simply be.' },
  ]

  return (
    <>
      <Label num="14" title="Article Drop Cap" annotation="First letter at 72px/900 spanning three lines. Shown with letters A, T, and W to demonstrate different widths." />
      <Section>
        <div className="max-w-2xl space-y-8">
          {paragraphs.map((p) => (
            <p key={p.letter} className="font-heading text-[15px] font-normal leading-[1.7] text-[hsl(var(--game-ink))]">
              <span className="float-left mr-3 mt-1 font-heading text-[72px] font-black leading-[0.8] text-[hsl(var(--game-ink))]">{p.letter}</span>
              {p.text}
            </p>
          ))}
        </div>
      </Section>
    </>
  )
}

/* ─── 15 Editorial Sidebar Annotations ─── */
function EditorialSidebarAnnotations() {
  return (
    <>
      <Label num="15" title="Editorial Sidebar Annotations" annotation="Two-column layout: body copy left, margin notes right in smaller italic type with dashed connector lines." />
      <Section>
        <div className="relative flex gap-8 max-w-3xl">
          {/* Main body */}
          <div className="w-[60%]">
            <p className="font-heading text-[15px] font-normal leading-[1.7] text-[hsl(var(--game-ink))]">
              The language of game criticism has evolved considerably since the early days of numerical scores. Where once a game was reduced to a percentage, we now have frameworks for discussing feel, atmosphere, and emotional resonance.
            </p>
            <p className="mt-4 font-heading text-[15px] font-normal leading-[1.7] text-[hsl(var(--game-ink))]">
              Consider how we talk about &ldquo;game feel&rdquo; today. The term, popularised by Steve Swink, describes the tactile satisfaction of interacting with a virtual world. It encompasses everything from camera shake to input latency, from animation curves to sound design.
            </p>
            <p className="mt-4 font-heading text-[15px] font-normal leading-[1.7] text-[hsl(var(--game-ink))]">
              This vocabulary matters because it allows us to articulate why certain games feel cosy, why some make us anxious, and why others achieve a dreamlike quality that lingers for days after the credits roll.
            </p>
          </div>

          {/* Margin notes */}
          <div className="relative w-[30%] border-l border-dashed border-[hsl(var(--game-ink))]/15 pl-6">
            <div className="mb-8">
              <p className="font-heading text-[12px] font-semibold italic leading-relaxed text-[hsl(var(--game-ink-light))]">
                Numerical scores remain popular with aggregators like OpenCritic and Metacritic, but many critics now prefer unscored reviews.
              </p>
            </div>
            <div className="mb-8">
              <p className="font-heading text-[12px] font-semibold italic leading-relaxed text-[hsl(var(--game-ink-light))]">
                Steve Swink&rsquo;s &ldquo;Game Feel&rdquo; (2008) remains one of the most cited texts on the subject of tactile game design.
              </p>
            </div>
            <div>
              <p className="font-heading text-[12px] font-semibold italic leading-relaxed text-[hsl(var(--game-ink-light))]">
                See also: &ldquo;A Theory of Fun&rdquo; by Raph Koster, which explores why certain interactive patterns produce pleasure.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}

/* ─── 16 Score Typography ─── */
function ScoreTypography() {
  return (
    <>
      <Label num="16" title="Score Typography" annotation="Big numbers at four scales: inline, callout, hero, and massive. Each with a unit label in smaller weight, in pill containers." />
      <Section>
        <div className="space-y-6">
          <div className="flex flex-wrap items-end gap-6">
            {/* Inline */}
            <div>
              <span className="mb-2 block font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">Inline</span>
              <span className="inline-flex items-baseline gap-1 rounded-full bg-[hsl(var(--game-cream-dark))] px-3 py-1">
                <span className="font-heading text-[15px] font-black text-[hsl(var(--game-ink))]">86</span>
                <span className="font-heading text-[11px] font-semibold text-[hsl(var(--game-ink-light))]">pts</span>
              </span>
            </div>
            {/* Callout */}
            <div>
              <span className="mb-2 block font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">Callout</span>
              <span className="inline-flex items-baseline gap-1.5 rounded-full bg-[hsl(var(--game-cream-dark))] px-4 py-2">
                <span className="font-heading text-[24px] font-black text-[hsl(var(--game-ink))]">92</span>
                <span className="font-heading text-[13px] font-semibold text-[hsl(var(--game-ink-light))]">/100</span>
              </span>
            </div>
            {/* Hero */}
            <div>
              <span className="mb-2 block font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">Hero</span>
              <span className="inline-flex items-baseline gap-2 rounded-full bg-[hsl(var(--game-cream-dark))] px-6 py-3">
                <span className="font-heading text-[48px] font-black leading-none text-[hsl(var(--game-ink))]">76</span>
                <span className="font-heading text-[16px] font-semibold text-[hsl(var(--game-ink-light))]">%</span>
              </span>
            </div>
          </div>
          {/* Massive */}
          <div>
            <span className="mb-2 block font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">Massive</span>
            <span className="inline-flex items-baseline gap-3 rounded-full bg-[hsl(var(--game-cream-dark))] px-8 py-4">
              <span className="font-heading text-[80px] font-black leading-none text-[hsl(var(--game-ink))]">99</span>
              <span className="font-heading text-[22px] font-semibold text-[hsl(var(--game-ink-light))]">pts</span>
            </span>
          </div>
        </div>
      </Section>
    </>
  )
}

/* ─── PAGE ─── */
export default function TypeComponentsPage() {
  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-5xl">
        {/* Page header */}
        <p className="font-heading text-[9px] font-black uppercase tracking-[0.35em] text-[hsl(var(--game-amber))]">
          02 / Experimental
        </p>
        <h1 className="mt-2 font-heading text-[clamp(36px,6vw,56px)] font-black leading-[0.95] tracking-tight text-[hsl(var(--game-ink))]">
          Type +<br />Components
        </h1>
        <p className="mt-4 max-w-lg font-heading text-[15px] font-semibold italic text-[hsl(var(--game-ink-mid))]">
          Card concepts, data display, tag innovations, and editorial type scale. Sixteen specimens across two categories.
        </p>

        {/* Category header: Cards */}
        <div className="mt-16 mb-10">
          <span className="rounded-full bg-[hsl(var(--game-ink))] px-4 py-1.5 font-heading text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-cream))]">
            Card Concepts
          </span>
          <p className="mt-3 font-heading text-[13px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Eight card patterns for games, franchises, reviews, stats, and editorial content.
          </p>
        </div>

        <div className="space-y-16">
          <GamePosterCard />
          <FranchiseCollectionCard />
          <VibeCluster />
          <ReviewSnippetCard />
          <ComparisonCard />
          <StatDashboardCard />
          <ArticlePreviewCard />
          <GameOfTheWeekCard />
        </div>

        {/* Category header: Tags/Chips/Medals */}
        <div className="mt-24 mb-10">
          <span className="rounded-full bg-[hsl(var(--game-ink))] px-4 py-1.5 font-heading text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-cream))]">
            Tag / Chip / Medal Innovations
          </span>
          <p className="mt-3 font-heading text-[13px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Earned medals, genre personality chips, streak indicators, and contextual chip hierarchy.
          </p>
        </div>

        <div className="space-y-16">
          <EarnedMedalSystem />
          <GenreTagsWithPersonality />
          <StreakIndicator />
          <ContextChipsHierarchy />
        </div>

        {/* Category header: Editorial Type */}
        <div className="mt-24 mb-10">
          <span className="rounded-full bg-[hsl(var(--game-ink))] px-4 py-1.5 font-heading text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-cream))]">
            Editorial Type
          </span>
          <p className="mt-3 font-heading text-[13px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Type hierarchy, drop caps, margin annotations, and score display across scales.
          </p>
        </div>

        <div className="space-y-16">
          <BlogTypeScale />
          <ArticleDropCap />
          <EditorialSidebarAnnotations />
          <ScoreTypography />
        </div>

        {/* Footer spacer */}
        <div className="mt-24" />
      </div>
    </main>
  )
}