'use client'

import { useState, useRef, useEffect } from 'react'

/* ─── section label ─── */
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

/* ─── stipple style helper ─── */
const stippleStyle: React.CSSProperties = {
  backgroundColor: '#F5F0E4',
  backgroundImage: 'radial-gradient(circle, rgba(26,26,20,0.07) 1px, transparent 1px)',
  backgroundSize: '10px 10px',
}

const stippleDarkStyle: React.CSSProperties = {
  backgroundColor: '#E8E2D4',
  backgroundImage: 'radial-gradient(circle, rgba(26,26,20,0.09) 1px, transparent 1px)',
  backgroundSize: '10px 10px',
}

/* ─── dog-ear fold component ─── */
const DogEar = ({ size = 20 }: { size?: number }) => (
  <>
    {/* dark triangle (border technique) */}
    <div
      className="absolute left-0 top-0 z-10"
      style={{
        width: 0,
        height: 0,
        borderLeft: `${size}px solid hsl(var(--game-cream-dark))`,
        borderBottom: `${size}px solid transparent`,
      }}
    />
    {/* cream cover triangle (clip-path) */}
    <div
      className="absolute left-0 top-0 z-20 bg-[hsl(var(--game-cream))]"
      style={{
        width: size,
        height: size,
        clipPath: `polygon(0 0, ${size}px 0, 0 ${size}px)`,
      }}
    />
  </>
)

/* ─── icon sticker ─── */
const IconSticker = ({
  icon,
  size = 52,
  tint = 'rgba(245,230,211,0.6)',
  rotation = 4,
  className = '',
  style = {},
}: {
  icon: string
  size?: number
  tint?: string
  rotation?: number
  className?: string
  style?: React.CSSProperties
}) => (
  <div
    className={`flex items-center justify-center rounded-full ${className}`}
    style={{
      width: size,
      height: size,
      backgroundColor: tint,
      boxShadow: '0 0 0 4px white, 0 3px 10px rgba(0,0,0,0.18)',
      transform: `rotate(${rotation}deg)`,
      fontSize: size * 0.45,
      ...style,
    }}
  >
    {icon}
  </div>
)

/* ─── sticker tab ─── */
const StickerTab = ({
  label,
  colour = 'amber',
  rotation = -1.5,
  style = {},
}: {
  label: string
  colour?: 'amber' | 'blue' | 'ink' | 'green' | 'white'
  rotation?: number
  style?: React.CSSProperties
}) => {
  const colourMap: Record<string, { bg: string; text: string; border?: string }> = {
    amber: { bg: 'hsl(var(--game-amber))', text: '#fff' },
    blue: { bg: 'hsl(var(--game-blue))', text: '#fff' },
    ink: { bg: 'hsl(var(--game-ink))', text: 'hsl(var(--game-cream))' },
    green: { bg: 'hsl(var(--game-green))', text: '#fff' },
    white: { bg: '#fff', text: 'hsl(var(--game-ink))', border: '1.5px solid hsl(var(--game-cream-dark))' },
  }
  const c = colourMap[colour]
  return (
    <span
      className="inline-flex font-heading text-[9px] font-black uppercase tracking-[0.22em]"
      style={{
        padding: '5px 10px',
        borderRadius: 6,
        backgroundColor: c.bg,
        color: c.text,
        border: c.border || 'none',
        transform: `rotate(${rotation}deg)`,
        boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
        ...style,
      }}
    >
      {label}
    </span>
  )
}

/* ─── sticky note base ─── */
const StickyNote = ({
  children,
  width = 280,
  rotation = -1,
  dogEar = true,
  dogEarSize = 20,
  className = '',
  style = {},
  noteRef,
}: {
  children: React.ReactNode
  width?: number | string
  rotation?: number
  dogEar?: boolean
  dogEarSize?: number
  className?: string
  style?: React.CSSProperties
  noteRef?: React.RefObject<HTMLDivElement | null>
}) => (
  <div
    ref={noteRef}
    className={`relative overflow-visible ${className}`}
    style={{
      width,
      borderRadius: '4px 16px 16px 16px',
      boxShadow: '0 4px 14px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
      transform: `rotate(${rotation}deg)`,
      ...stippleStyle,
      ...style,
    }}
  >
    {dogEar && <DogEar size={dogEarSize} />}
    {children}
  </div>
)

/* ─── note typography helpers ─── */
const NoteLabel = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`font-heading text-[9px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-amber))] ${className}`}>
    {children}
  </div>
)

const NoteTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`font-heading text-[15px] font-black text-[hsl(var(--game-ink))] ${className}`}>
    {children}
  </div>
)

const NoteBody = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`font-heading text-[12px] font-semibold leading-relaxed text-[hsl(var(--game-ink-mid))] ${className}`}>
    {children}
  </div>
)

const NoteTag = ({ children }: { children: React.ReactNode }) => (
  <span
    className="inline-block rounded font-heading text-[10px] font-extrabold text-[hsl(var(--game-ink-mid))]"
    style={{ backgroundColor: 'rgba(26,26,20,0.06)', padding: '2px 8px' }}
  >
    {children}
  </span>
)

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */
export default function NotebookPage() {
  const [stackFanned, setStackFanned] = useState(false)
  const [envelopeOpen, setEnvelopeOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[hsl(var(--game-cream))]">
      <div className="mx-auto max-w-5xl px-6 py-20">
        {/* page header */}
        <div className="mb-4">
          <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">
            Page 7 — Component Library
          </span>
        </div>
        <h1 className="font-heading text-4xl font-black text-[hsl(var(--game-ink))]">Notebook Aesthetic</h1>
        <p className="mt-3 max-w-2xl font-heading text-[14px] font-semibold leading-relaxed text-[hsl(var(--game-ink-mid))]">
          Stipple dot textures, sticky notes, icon stickers, dog-ear folds, and the paper/stationery feel that makes Idle Hours distinct.
        </p>

        {/* ─── 01. Classic Sticky Note ─── */}
        <section className="py-16">
          <Label num="01" title="Classic Sticky Note" annotation="The v5 base note with dog-ear fold, stipple texture, -1deg rotation. Shown at compact (200px), standard (280px), and wide (400px)." />
          <div className="flex flex-wrap items-start gap-10 px-8 py-10">
            {/* compact */}
            <StickyNote width={200} rotation={-1} dogEarSize={16}>
              <div className="p-4 pt-6">
                <NoteLabel>Staff Pick</NoteLabel>
                <NoteTitle className="mt-1">Hollow Knight</NoteTitle>
                <NoteBody className="mt-2">A beautifully crafted metroidvania set beneath a ruined kingdom of insects.</NoteBody>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <NoteTag>Metroidvania</NoteTag>
                  <NoteTag>Indie</NoteTag>
                </div>
              </div>
            </StickyNote>

            {/* standard */}
            <StickyNote width={280} rotation={-1}>
              <div className="p-5 pt-7">
                <NoteLabel>Staff Pick</NoteLabel>
                <NoteTitle className="mt-1.5">Hollow Knight</NoteTitle>
                <NoteBody className="mt-2">A beautifully crafted metroidvania set beneath a ruined kingdom of insects and heroes.</NoteBody>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <NoteTag>Metroidvania</NoteTag>
                  <NoteTag>Indie</NoteTag>
                  <NoteTag>Atmospheric</NoteTag>
                </div>
              </div>
            </StickyNote>

            {/* wide */}
            <StickyNote width={400} rotation={-1} dogEarSize={24}>
              <div className="p-6 pt-8">
                <NoteLabel>Staff Pick</NoteLabel>
                <NoteTitle className="mt-1.5">Hollow Knight</NoteTitle>
                <NoteBody className="mt-2">A beautifully crafted metroidvania set beneath a ruined kingdom of insects and heroes. Explore winding caverns, battle tainted creatures, and befriend bizarre bugs, all in a classic, hand-drawn 2D style.</NoteBody>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <NoteTag>Metroidvania</NoteTag>
                  <NoteTag>Indie</NoteTag>
                  <NoteTag>Atmospheric</NoteTag>
                  <NoteTag>2D</NoteTag>
                </div>
              </div>
            </StickyNote>
          </div>
        </section>

        {/* ─── 02. Stipple Note with Icon Stamp ─── */}
        <section className="py-16">
          <Label num="02" title="Stipple Note with Icon Stamp" annotation="Sticky notes with icon stickers poking above the top-right edge. Three variants: trophy on amber, fire on cream, star on blue." />
          <div className="flex flex-wrap items-start gap-10 px-8 py-10">
            {/* trophy on amber */}
            <StickyNote width={260} rotation={-0.5}>
              <IconSticker
                icon="🏆"
                size={52}
                tint="rgba(245,230,211,0.8)"
                rotation={4}
                style={{ position: 'absolute', top: -16, right: -10, zIndex: 30 }}
              />
              <div className="p-5 pt-7">
                <NoteLabel>Top Rated</NoteLabel>
                <NoteTitle className="mt-1">Celeste</NoteTitle>
                <NoteBody className="mt-2">Precision platforming and a deeply personal story about mental health.</NoteBody>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <NoteTag>Platformer</NoteTag>
                  <NoteTag>Narrative</NoteTag>
                </div>
              </div>
            </StickyNote>

            {/* fire on cream */}
            <StickyNote width={260} rotation={1}>
              <IconSticker
                icon="🔥"
                size={52}
                tint="rgba(240,235,224,0.9)"
                rotation={-4}
                style={{ position: 'absolute', top: -16, right: -10, zIndex: 30 }}
              />
              <div className="p-5 pt-7">
                <NoteLabel>Trending</NoteLabel>
                <NoteTitle className="mt-1">Hades</NoteTitle>
                <NoteBody className="mt-2">Defy the god of the dead as you hack and slash your way out of the underworld.</NoteBody>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <NoteTag>Roguelike</NoteTag>
                  <NoteTag>Action</NoteTag>
                </div>
              </div>
            </StickyNote>

            {/* star on blue */}
            <StickyNote width={260} rotation={-1.5}>
              <IconSticker
                icon="⭐"
                size={52}
                tint="rgba(235,242,252,0.9)"
                rotation={8}
                style={{ position: 'absolute', top: -16, right: -10, zIndex: 30 }}
              />
              <div className="p-5 pt-7">
                <NoteLabel>Editor&apos;s Choice</NoteLabel>
                <NoteTitle className="mt-1">Outer Wilds</NoteTitle>
                <NoteBody className="mt-2">An open-world mystery about a solar system trapped in an endless time loop.</NoteBody>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <NoteTag>Exploration</NoteTag>
                  <NoteTag>Mystery</NoteTag>
                </div>
              </div>
            </StickyNote>
          </div>
        </section>

        {/* ─── 03. Stipple Info Popup ─── */}
        <section className="py-16">
          <Label num="03" title="Stipple Info Popup" annotation="A game cover placeholder with a stipple popup floating beside it. The popup has an amber label, title, meta, stats, and a CSS triangle anchor." />
          <div className="flex items-start gap-0 px-8 py-10">
            {/* game cover placeholder */}
            <div
              className="flex h-[220px] w-[160px] flex-shrink-0 items-end rounded-xl bg-[hsl(var(--game-ink))]"
              style={{ boxShadow: '0 6px 20px rgba(0,0,0,0.2)' }}
            >
              <div className="w-full rounded-b-xl bg-[hsl(var(--game-ink))]/80 p-3">
                <div className="font-heading text-[10px] font-bold text-[hsl(var(--game-cream))]">Game Cover</div>
              </div>
            </div>

            {/* popup with triangle anchor */}
            <div className="relative ml-4" style={{ transform: 'rotate(0.8deg)' }}>
              {/* CSS triangle pointing left */}
              <div
                className="absolute -left-2 top-6"
                style={{
                  width: 0,
                  height: 0,
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  borderRight: '8px solid #F5F0E4',
                }}
              />
              <div
                className="w-[280px] rounded-xl p-5"
                style={{
                  ...stippleStyle,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
                }}
              >
                <NoteLabel>Now Playing</NoteLabel>
                <NoteTitle className="mt-1.5">Disco Elysium</NoteTitle>
                <p className="mt-1 font-heading text-[11px] font-semibold italic text-[hsl(var(--game-ink-light))]">
                  RPG &middot; ZA/UM &middot; 2019
                </p>
                <div className="my-3 border-t border-dashed border-[hsl(var(--game-ink))]/10" />
                <div className="space-y-1.5">
                  {[
                    ['Hours played', '42'],
                    ['Completion', '78%'],
                    ['Rating', '9.4 / 10'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between font-heading text-[11px]">
                      <span className="font-semibold text-[hsl(var(--game-ink-mid))]">{k}</span>
                      <span className="font-bold text-[hsl(var(--game-ink))]">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 04. Notebook Page ─── */}
        <section className="py-16">
          <Label num="04" title="Notebook Page" annotation="Full-width stipple surface with ruled lines, a red margin line, torn top-edge, and content sitting naturally on the lines." />
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              ...stippleStyle,
              clipPath: 'polygon(0 12px, 2% 8px, 4% 13px, 6% 6px, 8% 11px, 10% 5px, 12% 10px, 14% 4px, 16% 9px, 18% 3px, 20% 8px, 22% 2px, 24% 7px, 26% 1px, 28% 6px, 30% 0, 32% 5px, 34% 1px, 36% 6px, 38% 2px, 40% 7px, 42% 3px, 44% 8px, 46% 4px, 48% 9px, 50% 5px, 52% 10px, 54% 4px, 56% 9px, 58% 3px, 60% 8px, 62% 2px, 64% 7px, 66% 1px, 68% 6px, 70% 0, 72% 5px, 74% 1px, 76% 6px, 78% 2px, 80% 7px, 82% 3px, 84% 8px, 86% 4px, 88% 9px, 90% 5px, 92% 10px, 94% 6px, 96% 11px, 98% 7px, 100% 12px, 100% 100%, 0 100%)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
            }}
          >
            {/* ruled lines */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(26,26,20,0.08) 27px, rgba(26,26,20,0.08) 28px)',
              }}
            />
            {/* red margin line */}
            <div
              className="absolute bottom-0 top-0"
              style={{ left: 48, width: 2, backgroundColor: 'rgba(220,80,80,0.25)' }}
            />
            {/* content */}
            <div className="relative px-16 py-10" style={{ paddingLeft: 64 }}>
              <div style={{ lineHeight: '28px' }}>
                <div className="font-heading text-[15px] font-black text-[hsl(var(--game-ink))]">
                  Games to finish this month
                </div>
                <div className="mt-0 font-heading text-[12px] font-semibold text-[hsl(var(--game-ink-mid))]">
                  Updated 9 March 2026
                </div>
                <div className="h-[28px]" />
                {[
                  '1. Hollow Knight — just the final boss left',
                  '2. Celeste — chapter 7 onwards',
                  '3. Return of the Obra Dinn — 12 fates remaining',
                  '4. Outer Wilds DLC — barely started',
                  '5. Disco Elysium — replay for alt endings',
                ].map((line, i) => (
                  <div key={i} className="font-heading text-[12px] font-semibold text-[hsl(var(--game-ink-mid))]" style={{ lineHeight: '28px' }}>
                    {line}
                  </div>
                ))}
                <div className="h-[28px]" />
                <div className="font-heading text-[11px] font-semibold italic text-[hsl(var(--game-ink-light))]" style={{ lineHeight: '28px' }}>
                  &quot;Don&apos;t start anything new until you clear this list.&quot;
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 05. Sticky Note Wall ─── */}
        <section className="py-16">
          <Label num="05" title="Sticky Note Wall" annotation="Six sticky notes scattered on a cork-board surface. Varying sizes, rotations, content types, and some with icon stickers." />
          <div
            className="relative overflow-visible rounded-2xl p-12"
            style={{
              ...stippleDarkStyle,
              minHeight: 520,
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            {/* note 1: quote */}
            <StickyNote width={220} rotation={-2} style={{ position: 'absolute', top: 30, left: 40 }}>
              <div className="p-4 pt-6">
                <NoteLabel>Quote</NoteLabel>
                <NoteBody className="mt-2 italic">&quot;Despite everything, it&apos;s still you.&quot;</NoteBody>
                <div className="mt-2 font-heading text-[10px] font-bold text-[hsl(var(--game-ink-light))]">— Undertale</div>
              </div>
            </StickyNote>

            {/* note 2: to-do */}
            <StickyNote width={200} rotation={1.5} style={{ position: 'absolute', top: 20, left: 320 }}>
              <div className="p-4 pt-6">
                <NoteLabel>To Do</NoteLabel>
                <div className="mt-2 space-y-1">
                  {['Finish Celeste B-sides', 'Try Inscryption', 'Update backlog'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-sm border-[1.5px] border-[hsl(var(--game-ink-mid))]" />
                      <NoteBody>{item}</NoteBody>
                    </div>
                  ))}
                </div>
              </div>
            </StickyNote>

            {/* note 3: recommendation with sticker */}
            <StickyNote width={240} rotation={-3} style={{ position: 'absolute', top: 60, right: 60 }}>
              <IconSticker
                icon="⭐"
                size={44}
                tint="rgba(235,242,252,0.9)"
                rotation={6}
                style={{ position: 'absolute', top: -14, right: -8, zIndex: 30 }}
              />
              <div className="p-4 pt-6">
                <NoteLabel>Recommendation</NoteLabel>
                <NoteTitle className="mt-1">Tunic</NoteTitle>
                <NoteBody className="mt-2">A tiny fox explores a vast, mysterious world. Utterly charming.</NoteBody>
              </div>
            </StickyNote>

            {/* note 4: stat */}
            <StickyNote width={180} rotation={2} style={{ position: 'absolute', bottom: 80, left: 60 }}>
              <div className="p-4 pt-6">
                <NoteLabel>Stat</NoteLabel>
                <div className="mt-2 font-heading text-[28px] font-black text-[hsl(var(--game-ink))]">247</div>
                <NoteBody>games in backlog</NoteBody>
              </div>
            </StickyNote>

            {/* note 5: reminder */}
            <StickyNote width={200} rotation={-1} style={{ position: 'absolute', bottom: 60, left: 300 }}>
              <IconSticker
                icon="🔥"
                size={40}
                tint="rgba(245,230,211,0.8)"
                rotation={-5}
                style={{ position: 'absolute', top: -12, right: -6, zIndex: 30 }}
              />
              <div className="p-4 pt-6">
                <NoteLabel>Reminder</NoteLabel>
                <NoteBody className="mt-2">Silksong release date: check daily. Do not miss launch.</NoteBody>
              </div>
            </StickyNote>

            {/* note 6: editorial */}
            <StickyNote width={260} rotation={3} style={{ position: 'absolute', bottom: 40, right: 40 }}>
              <div className="p-4 pt-6">
                <NoteLabel>Editorial</NoteLabel>
                <NoteTitle className="mt-1">On pacing</NoteTitle>
                <NoteBody className="mt-2">The best games know exactly when to let you breathe. Hollow Knight does this perfectly — every boss gauntlet followed by a quiet, gorgeous cavern.</NoteBody>
              </div>
            </StickyNote>
          </div>
        </section>

        {/* ─── 06. Recipe Card Style ─── */}
        <section className="py-16">
          <Label num="06" title="Recipe Card Style" annotation="A game 'recipe' card structured like a cooking recipe. Header, ingredients list, numbered method, dashed dividers, dog-ear fold." />
          <div className="px-8 py-10">
            <StickyNote width={360} rotation={-0.5} dogEarSize={22}>
              <div className="p-6 pt-8">
                <NoteLabel>How to Play</NoteLabel>
                <NoteTitle className="mt-1.5">Dark Souls</NoteTitle>
                <div className="my-3 border-t border-dashed border-[hsl(var(--game-ink))]/10" />
                <div className="font-heading text-[10px] font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--game-ink-mid))]">
                  You&apos;ll need
                </div>
                <div className="mt-1.5 space-y-1">
                  {['Patience (a lot)', '40+ free hours', 'A controller', 'Thick skin', 'Willingness to read wikis'].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 font-heading text-[11px] text-[hsl(var(--game-amber))]">•</span>
                      <NoteBody>{item}</NoteBody>
                    </div>
                  ))}
                </div>
                <div className="my-3 border-t border-dashed border-[hsl(var(--game-ink))]/10" />
                <div className="font-heading text-[10px] font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--game-ink-mid))]">
                  Method
                </div>
                <div className="mt-1.5 space-y-1.5">
                  {[
                    'Create character. Spend 45 minutes on face sliders.',
                    'Die to the tutorial boss. Learn nothing.',
                    'Wander into a graveyard. Die repeatedly.',
                    'Discover you went the wrong way.',
                    'Finally reach the first real bonfire. Weep with relief.',
                    'Become obsessed. Never play another genre again.',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--game-amber))]/10 font-heading text-[9px] font-black text-[hsl(var(--game-amber))]">
                        {i + 1}
                      </span>
                      <NoteBody>{step}</NoteBody>
                    </div>
                  ))}
                </div>
              </div>
            </StickyNote>
          </div>
        </section>

        {/* ─── 07. Sticker Tab Collection ─── */}
        <section className="py-16">
          <Label num="07" title="Sticker Tab Collection" annotation="All sticker tab variants in a curated arrangement. Tabs overlapping a card edge, and cascading tabs along the side like file folder tabs." />
          <div className="space-y-10 px-8 py-10">
            {/* tabs overlapping top of card */}
            <div className="relative">
              <div className="flex gap-3 pl-4" style={{ marginBottom: -8, position: 'relative', zIndex: 10 }}>
                <StickerTab label="New" colour="amber" rotation={-1.5} />
                <StickerTab label="Daily" colour="blue" rotation={0.5} />
                <StickerTab label="Featured" colour="ink" rotation={-2} />
                <StickerTab label="Complete" colour="green" rotation={1} />
                <StickerTab label="Coming Soon" colour="white" rotation={-0.5} />
              </div>
              <div
                className="relative rounded-2xl bg-white p-8"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1.5px solid hsl(var(--game-cream-dark))' }}
              >
                <NoteBody>This is a clean card with sticker tabs poking up from the top edge. The tabs act as category labels, filter buttons, or status indicators.</NoteBody>
              </div>
            </div>

            {/* tabs cascading along right side */}
            <div className="relative ml-8" style={{ width: 360 }}>
              <div
                className="rounded-2xl bg-white p-8"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1.5px solid hsl(var(--game-cream-dark))' }}
              >
                <NoteTitle>File Folder Tabs</NoteTitle>
                <NoteBody className="mt-2">Tabs cascade along the right edge like file folder dividers. Click a tab to switch sections.</NoteBody>
              </div>
              {/* side tabs */}
              <div className="absolute -right-3 top-2 flex flex-col gap-1.5" style={{ transform: 'translateX(100%)' }}>
                {[
                  { label: 'All', colour: 'amber' as const },
                  { label: 'Playing', colour: 'blue' as const },
                  { label: 'Finished', colour: 'green' as const },
                  { label: 'Dropped', colour: 'ink' as const },
                  { label: 'Wishlist', colour: 'white' as const },
                ].map(({ label, colour }, i) => (
                  <StickerTab
                    key={label}
                    label={label}
                    colour={colour}
                    rotation={0}
                    style={{ borderRadius: '0 6px 6px 0' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 08. Icon Grid on Stipple ─── */}
        <section className="py-16">
          <Label num="08" title="Icon Grid on Stipple" annotation="A sticker sheet: 4x3 grid of icon stickers on a stipple surface. Various sizes, tilts, and colour tints. Feels like something you'd peel from." />
          <div className="px-8 py-10">
            <div
              className="mx-auto w-full max-w-lg rounded-2xl p-10"
              style={{
                ...stippleStyle,
                boxShadow: '0 4px 14px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
                border: '1.5px dashed rgba(26,26,20,0.12)',
              }}
            >
              <div className="grid grid-cols-4 gap-y-8 gap-x-6 justify-items-center">
                {[
                  { icon: '🎮', label: 'Games', size: 52, tint: 'rgba(245,230,211,0.8)', rotation: -3 },
                  { icon: '🏆', label: 'Trophies', size: 44, tint: 'rgba(235,242,252,0.9)', rotation: 5 },
                  { icon: '⭐', label: 'Favourites', size: 52, tint: 'rgba(200,135,58,0.15)', rotation: -2 },
                  { icon: '🔥', label: 'Trending', size: 36, tint: 'rgba(245,230,211,0.9)', rotation: 8 },
                  { icon: '📚', label: 'Backlog', size: 44, tint: 'rgba(26,26,20,0.08)', rotation: -4 },
                  { icon: '🎯', label: 'Goals', size: 52, tint: 'rgba(39,168,90,0.12)', rotation: 3 },
                  { icon: '💬', label: 'Reviews', size: 36, tint: 'rgba(235,242,252,0.9)', rotation: -6 },
                  { icon: '🎵', label: 'Soundtracks', size: 44, tint: 'rgba(245,230,211,0.8)', rotation: 2 },
                  { icon: '⏱️', label: 'Time', size: 52, tint: 'rgba(200,135,58,0.12)', rotation: -8 },
                  { icon: '🗺️', label: 'Maps', size: 44, tint: 'rgba(26,26,20,0.06)', rotation: 4 },
                  { icon: '🎨', label: 'Art', size: 36, tint: 'rgba(235,242,252,0.8)', rotation: -3 },
                  { icon: '📊', label: 'Stats', size: 52, tint: 'rgba(39,168,90,0.1)', rotation: 6 },
                ].map(({ icon, label, size, tint, rotation }) => (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <IconSticker icon={icon} size={size} tint={tint} rotation={rotation} />
                    <span className="font-heading text-[9px] font-black uppercase tracking-[0.18em] text-[hsl(var(--game-ink-mid))]">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 09. Pinboard Thread ─── */}
        <section className="py-16">
          <Label num="09" title="Pinboard Thread" annotation="Three sticky notes pinned to a board with coloured pins. Dashed lines connect the pins like red-string conspiracy boards." />
          <div
            className="relative overflow-visible rounded-2xl p-16"
            style={{ ...stippleDarkStyle, minHeight: 360, boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.06)' }}
          >
            {/* SVG thread lines */}
            <svg className="absolute inset-0 z-0" width="100%" height="100%" style={{ overflow: 'visible' }}>
              <line x1="140" y1="38" x2="380" y2="38" stroke="hsl(var(--game-red))" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4" />
              <line x1="380" y1="38" x2="640" y2="38" stroke="hsl(var(--game-red))" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4" />
            </svg>

            <div className="relative flex items-start justify-between gap-8">
              {/* note 1: review snippet */}
              <div className="relative">
                <div className="absolute -top-3 left-1/2 z-30 h-5 w-5 -translate-x-1/2 rounded-full bg-[hsl(var(--game-red))]" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                <StickyNote width={220} rotation={-1.5}>
                  <div className="p-4 pt-6">
                    <NoteLabel>Review</NoteLabel>
                    <NoteTitle className="mt-1">Hades</NoteTitle>
                    <NoteBody className="mt-2">&quot;Every run teaches you something. The roguelike structure keeps it fresh even after 50 attempts.&quot;</NoteBody>
                    <div className="mt-2 font-heading text-[10px] font-bold text-[hsl(var(--game-amber))]">9.2 / 10</div>
                  </div>
                </StickyNote>
              </div>

              {/* note 2: stat card */}
              <div className="relative">
                <div className="absolute -top-3 left-1/2 z-30 h-5 w-5 -translate-x-1/2 rounded-full bg-[hsl(var(--game-blue))]" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                <StickyNote width={200} rotation={2}>
                  <div className="p-4 pt-6">
                    <NoteLabel>Stats</NoteLabel>
                    <div className="mt-2 space-y-1.5">
                      {[['Runs', '142'], ['Clears', '38'], ['Best time', '14:22']].map(([k, v]) => (
                        <div key={k} className="flex justify-between font-heading text-[11px]">
                          <span className="font-semibold text-[hsl(var(--game-ink-mid))]">{k}</span>
                          <span className="font-bold text-[hsl(var(--game-ink))]">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </StickyNote>
              </div>

              {/* note 3: todo checkbox */}
              <div className="relative">
                <div className="absolute -top-3 left-1/2 z-30 h-5 w-5 -translate-x-1/2 rounded-full bg-[hsl(var(--game-green))]" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                <StickyNote width={220} rotation={-0.5}>
                  <div className="p-4 pt-6">
                    <NoteLabel>Checklist</NoteLabel>
                    <div className="mt-2 space-y-1.5">
                      {[
                        { text: 'Beat final boss', done: true },
                        { text: 'Max all weapons', done: false },
                        { text: 'Romance everyone', done: true },
                        { text: 'Find all fish', done: false },
                      ].map(({ text, done }) => (
                        <div key={text} className="flex items-center gap-2">
                          <div
                            className="flex h-3.5 w-3.5 items-center justify-center rounded-sm border-[1.5px]"
                            style={{
                              borderColor: done ? 'hsl(var(--game-green))' : 'hsl(var(--game-ink-mid))',
                              backgroundColor: done ? 'hsl(var(--game-green))' : 'transparent',
                            }}
                          >
                            {done && <span className="text-[8px] text-white">✓</span>}
                          </div>
                          <NoteBody className={done ? 'line-through opacity-50' : ''}>{text}</NoteBody>
                        </div>
                      ))}
                    </div>
                  </div>
                </StickyNote>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 10. Sticky Note Stack ─── */}
        <section className="py-16">
          <Label num="10" title="Sticky Note Stack" annotation="Five notes stacked with slight offset. Click to fan out and reveal all notes. Shows both states." />
          <div className="flex items-start gap-16 px-8 py-10">
            {/* stacked state */}
            <div>
              <div className="mb-3 font-heading text-[10px] font-extrabold uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">Stacked</div>
              <div className="relative" style={{ width: 260, height: 200 }}>
                {[
                  { rotation: 2.5, shade: '#EDE7DA', offset: 16 },
                  { rotation: -1.5, shade: '#EBE5D8', offset: 12 },
                  { rotation: 1, shade: '#E8E2D5', offset: 8 },
                  { rotation: -0.5, shade: '#E5DFD2', offset: 4 },
                  { rotation: -1, shade: '#F5F0E4', offset: 0 },
                ].map(({ rotation, shade, offset }, i) => (
                  <div
                    key={i}
                    className="absolute left-0 top-0"
                    style={{
                      width: 240,
                      borderRadius: '4px 16px 16px 16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                      transform: `rotate(${rotation}deg) translate(${offset}px, ${offset}px)`,
                      backgroundColor: shade,
                      backgroundImage: 'radial-gradient(circle, rgba(26,26,20,0.07) 1px, transparent 1px)',
                      backgroundSize: '10px 10px',
                      zIndex: i,
                    }}
                  >
                    {i === 4 && (
                      <div className="p-4 pt-5">
                        <NoteLabel>Top Note</NoteLabel>
                        <NoteTitle className="mt-1">Visible content</NoteTitle>
                        <NoteBody className="mt-2">Only the top note&apos;s content is fully readable. Peek at the others below.</NoteBody>
                      </div>
                    )}
                    {i < 4 && <div className="p-4" style={{ height: 160 }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* fanned state (interactive) */}
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="font-heading text-[10px] font-extrabold uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">
                  {stackFanned ? 'Fanned' : 'Click to fan'}
                </span>
                <button
                  onClick={() => setStackFanned(!stackFanned)}
                  className="rounded-full bg-[hsl(var(--game-ink))] px-4 py-1.5 font-heading text-[10px] font-bold text-[hsl(var(--game-cream))] transition-opacity hover:opacity-80"
                >
                  {stackFanned ? 'Stack' : 'Fan out'}
                </button>
              </div>
              <div className="relative" style={{ width: stackFanned ? 600 : 260, height: 200, transition: 'width 0.5s cubic-bezier(0.34,1.5,0.64,1)' }}>
                {[
                  { label: 'Quote', title: '"Still you."', rotation: -3 },
                  { label: 'Stat', title: '142 hours', rotation: -1 },
                  { label: 'Pick', title: 'Tunic', rotation: 1 },
                  { label: 'Reminder', title: 'Check sales', rotation: 2 },
                  { label: 'Review', title: '9.4 / 10', rotation: -1 },
                ].map(({ label, title, rotation }, i) => (
                  <div
                    key={i}
                    className="absolute top-0"
                    style={{
                      width: 200,
                      borderRadius: '4px 16px 16px 16px',
                      boxShadow: stackFanned ? '0 4px 14px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.07)',
                      transform: stackFanned
                        ? `rotate(${rotation}deg) translateX(${i * 80}px)`
                        : `rotate(${rotation * 0.3}deg) translate(${i * 4}px, ${i * 4}px)`,
                      transition: 'all 0.5s cubic-bezier(0.34,1.5,0.64,1)',
                      ...stippleStyle,
                      zIndex: stackFanned ? 5 - Math.abs(i - 2) : i,
                    }}
                  >
                    <div className="p-4 pt-5" style={{ opacity: stackFanned ? 1 : (i === 4 ? 1 : 0), transition: 'opacity 0.3s ease' }}>
                      <NoteLabel>{label}</NoteLabel>
                      <NoteTitle className="mt-1">{title}</NoteTitle>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 11. Envelope Reveal ─── */}
        <section className="py-16">
          <Label num="11" title="Envelope Reveal" annotation="A sealed envelope with stipple texture. Click to open: the flap rotates up and a recommendation card slides out. Features a wax seal." />
          <div className="flex justify-center px-8 py-10" style={{ perspective: 800 }}>
            <div
              className="relative cursor-pointer"
              style={{ width: 340, height: 220 }}
              onClick={() => setEnvelopeOpen(!envelopeOpen)}
            >
              {/* envelope body */}
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  ...stippleStyle,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                  border: '1.5px solid rgba(26,26,20,0.08)',
                }}
              />

              {/* content card (slides up when opened) */}
              <div
                className="absolute left-4 right-4 rounded-lg bg-white p-5"
                style={{
                  bottom: envelopeOpen ? 180 : 20,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                  transition: 'bottom 0.6s cubic-bezier(0.34,1.5,0.64,1)',
                  zIndex: envelopeOpen ? 20 : 1,
                  opacity: envelopeOpen ? 1 : 0,
                  transitionProperty: 'bottom, opacity',
                }}
              >
                <NoteLabel>Recommendation</NoteLabel>
                <NoteTitle className="mt-1">Outer Wilds</NoteTitle>
                <NoteBody className="mt-2">You only get to play it once for the first time. Make it count.</NoteBody>
                <div className="mt-3 flex gap-1.5">
                  <NoteTag>Exploration</NoteTag>
                  <NoteTag>Mystery</NoteTag>
                </div>
              </div>

              {/* flap (rotates up) */}
              <div
                className="absolute left-0 right-0 top-0 z-10"
                style={{
                  height: 100,
                  transformOrigin: 'top center',
                  transform: envelopeOpen ? 'rotateX(180deg)' : 'rotateX(0deg)',
                  transition: 'transform 0.5s cubic-bezier(0.34,1.5,0.64,1)',
                  zIndex: envelopeOpen ? 0 : 15,
                }}
              >
                <div
                  className="h-full w-full"
                  style={{
                    ...stippleStyle,
                    clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                    borderRadius: '12px 12px 0 0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                />
              </div>

              {/* wax seal */}
              <div
                className="absolute z-20 flex items-center justify-center rounded-full"
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: 'hsl(var(--game-amber))',
                  left: '50%',
                  top: envelopeOpen ? -10 : 70,
                  transform: 'translateX(-50%)',
                  boxShadow: '0 3px 10px rgba(200,135,58,0.4), inset 0 -2px 4px rgba(0,0,0,0.15)',
                  transition: 'top 0.5s cubic-bezier(0.34,1.5,0.64,1)',
                }}
              >
                {/* seal texture */}
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full font-heading text-[14px] font-black text-white"
                  style={{
                    border: '2px solid rgba(255,255,255,0.25)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  }}
                >
                  IH
                </div>
              </div>

              {/* click hint */}
              {!envelopeOpen && (
                <div className="absolute bottom-4 left-0 right-0 text-center font-heading text-[10px] font-bold text-[hsl(var(--game-ink-light))]">
                  Click to open
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── 12. Mixed Media Board ─── */}
        <section className="py-16">
          <Label num="12" title="Mixed Media Board" annotation="A full-width composition combining sticky notes, icon stickers, sticker tabs, a clean game card, a stipple popup, and dashed connecting lines. Digital/physical contrast." />
          <div
            className="relative overflow-visible rounded-2xl p-10"
            style={{ ...stippleDarkStyle, minHeight: 420, boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.06)' }}
          >
            {/* sticker tab row along top */}
            <div className="mb-8 flex gap-3">
              <StickerTab label="Collection" colour="amber" rotation={-1} />
              <StickerTab label="This Week" colour="blue" rotation={1} />
              <StickerTab label="Pinned" colour="ink" rotation={-2} />
            </div>

            {/* dashed connecting lines */}
            <svg className="pointer-events-none absolute inset-0 z-0" width="100%" height="100%" style={{ overflow: 'visible' }}>
              <line x1="250" y1="170" x2="380" y2="150" stroke="hsl(var(--game-ink-mid))" strokeWidth="1" strokeDasharray="5 4" opacity="0.2" />
              <line x1="590" y1="150" x2="650" y2="170" stroke="hsl(var(--game-ink-mid))" strokeWidth="1" strokeDasharray="5 4" opacity="0.2" />
            </svg>

            <div className="relative flex flex-wrap items-start gap-8">
              {/* sticky note 1 with icon sticker */}
              <StickyNote width={220} rotation={-2} style={{ flexShrink: 0 }}>
                <IconSticker
                  icon="🏆"
                  size={44}
                  tint="rgba(245,230,211,0.8)"
                  rotation={6}
                  style={{ position: 'absolute', top: -14, right: -8, zIndex: 30 }}
                />
                <div className="p-4 pt-6">
                  <NoteLabel>Game of the Year</NoteLabel>
                  <NoteTitle className="mt-1">Elden Ring</NoteTitle>
                  <NoteBody className="mt-2">FromSoftware&apos;s magnum opus. 200 hours and counting.</NoteBody>
                </div>
              </StickyNote>

              {/* clean game card */}
              <div
                className="relative flex-shrink-0 rounded-2xl bg-white p-6"
                style={{
                  width: 240,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1.5px solid hsl(var(--game-cream-dark))',
                }}
              >
                <div
                  className="mb-4 h-[120px] w-full rounded-lg bg-[hsl(var(--game-ink))]"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                />
                <div className="font-heading text-[13px] font-black text-[hsl(var(--game-ink))]">Hollow Knight</div>
                <div className="mt-1 font-heading text-[11px] font-semibold text-[hsl(var(--game-ink-mid))]">
                  Metroidvania &middot; 2017 &middot; 45h
                </div>
                <div className="mt-3 flex gap-1.5">
                  <NoteTag>Playing</NoteTag>
                  <NoteTag>Favourite</NoteTag>
                </div>
              </div>

              {/* stipple popup pointing at the card */}
              <div className="relative flex-shrink-0" style={{ transform: 'rotate(0.5deg)' }}>
                <div
                  className="absolute -left-2 top-8"
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: '7px solid transparent',
                    borderBottom: '7px solid transparent',
                    borderRight: '7px solid #F5F0E4',
                  }}
                />
                <div
                  className="w-[200px] rounded-xl p-4"
                  style={{
                    ...stippleStyle,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                  }}
                >
                  <NoteLabel>Quick Note</NoteLabel>
                  <NoteBody className="mt-1.5">Remember to finish the White Palace before moving on. The platforming is brutal but the lore payoff is worth it.</NoteBody>
                </div>
              </div>
            </div>

            {/* second sticky note, lower */}
            <div className="mt-6 ml-8">
              <StickyNote width={240} rotation={1.5}>
                <div className="p-4 pt-6">
                  <NoteLabel>Up Next</NoteLabel>
                  <NoteTitle className="mt-1">Tunic</NoteTitle>
                  <NoteBody className="mt-2">Heard it has a secret language to decode. Perfect for a rainy weekend.</NoteBody>
                  <div className="mt-3 flex gap-1.5">
                    <NoteTag>Wishlist</NoteTag>
                    <NoteTag>Puzzle</NoteTag>
                  </div>
                </div>
              </StickyNote>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}
