'use client'

/* ─── Data ─── */

const BASE_PALETTE = [
  { name: '--cream', hex: '#F0EBE0', cssVar: '--game-cream' },
  { name: '--cream-dark', hex: '#E4DBCC', cssVar: '--game-cream-dark' },
  { name: '--white', hex: '#FDFAF5', cssVar: '--game-white' },
  { name: '--ink', hex: '#1A1A14', cssVar: '--game-ink' },
  { name: '--ink-light', hex: '#6A6A56', cssVar: '--game-ink-light' },
  { name: '--ink-dim', hex: '#C0B89A', cssVar: '--game-ink-dim' },
]

const ACCENT_PALETTE = [
  { name: '--blue', hex: '#4A8FE8', cssVar: '--game-blue' },
  { name: '--amber', hex: '#C8873A', cssVar: '--game-amber' },
  { name: '--green', hex: '#27A85A', cssVar: '--game-green' },
  { name: '--purple', hex: '#5B4FCF', cssVar: '--game-purple' },
  { name: '--orange', hex: '#E05A1A', cssVar: '--game-orange' },
  { name: '--brown', hex: '#6B4C3A', cssVar: '--game-brown' },
]

const MOTION_TOKENS = [
  {
    name: '--spring',
    value: 'cubic-bezier(0.34, 1.5, 0.64, 1)',
    desc: 'Overshoots and settles. UI state changes, hover lifts, card pops, popup entrances.',
  },
  {
    name: '--ease-out',
    value: 'cubic-bezier(0.22, 1, 0.36, 1)',
    desc: 'Smooth deceleration. Toast slides, drawers, content reveals.',
  },
  {
    name: '--wipe',
    value: 'cubic-bezier(0.77, 0, 0.175, 1)',
    desc: 'Cinematic circle reveals and directional wipes only. Never on UI elements.',
  },
  {
    name: 'GSAP back.out(1.4)',
    value: null,
    desc: 'Popup panel entrances. Pairs with power2.in for dismissal.',
  },
]

const GAME_GRADIENTS = [
  {
    name: 'Game Sense',
    gradient: 'linear-gradient(155deg,#2D6BC4,#1a2a4a)',
    desc: 'Blue world · Daily · Fill in the blank',
    varName: '--gs-gradient',
  },
  {
    name: 'Street Date',
    gradient: 'linear-gradient(155deg,#1A7A40,#0d1f12)',
    desc: 'Green world · Daily · Guess the year',
    varName: '--sd-gradient',
  },
  {
    name: 'Shelf Price',
    gradient: 'linear-gradient(155deg,#5B4FCF,#1a1040)',
    desc: 'Purple world · Daily · Higher or lower',
    varName: '--sp-gradient',
  },
  {
    name: 'Blitz',
    gradient: 'linear-gradient(155deg,#E05A1A,#2a1000)',
    desc: 'Orange world · Ongoing · Timed word association · stripe texture always on',
    varName: '--bz-gradient',
    stripe: true,
  },
  {
    name: 'Ship It',
    gradient: 'linear-gradient(155deg,#3A3A5A,#1a1028)',
    desc: 'Charcoal/navy world · Narrative · No daily reset',
    varName: '--si-gradient',
  },
]

/* ─── Shared components ─── */

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="mb-4 mt-2">
      <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">
        {text}
      </span>
      <div className="mt-2 h-[1.5px] w-16 rounded-full bg-[hsl(var(--game-amber))]/30" />
    </div>
  )
}

function SectionHeading({ title, annotation }: { title: string; annotation: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">{title}</h2>
      <p className="mt-1 max-w-xl font-heading text-[12px] font-semibold italic leading-relaxed text-[hsl(var(--game-ink-light))]">
        {annotation}
      </p>
    </div>
  )
}

/* ─── Keyframes ─── */

const KEYFRAMES = `
@keyframes stripeScroll {
  0%   { background-position: 0 0; }
  100% { background-position: 28px 28px; }
}
`

/* ─── Page ─── */

export default function TokensPage() {
  return (
    <main className="px-6 py-16">
      <style>{KEYFRAMES}</style>
      <div className="mx-auto max-w-5xl">
        {/* Page header */}
        <p className="font-heading text-[9px] font-black uppercase tracking-[0.35em] text-[hsl(var(--game-amber))]">
          01 Tokens
        </p>
        <h1 className="mt-2 font-heading text-[clamp(36px,6vw,56px)] font-black leading-[0.95] tracking-tight text-[hsl(var(--game-ink))]">
          Design<br />Tokens
        </h1>
        <p className="mt-4 max-w-md font-heading text-[15px] font-semibold italic text-[hsl(var(--game-ink-light))]">
          Colour palette, motion curves, and game world gradients. The atomic layer beneath every component.
        </p>

        {/* ─── 1. Base Palette ─── */}
        <div className="mt-14">
          <SectionLabel text="Colour · Base" />
          <SectionHeading
            title="Base Palette"
            annotation="Cream / ink split — 60% cream surfaces, 30% ink text and borders. The page breathes in these six values."
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {BASE_PALETTE.map((c) => {
              const isDark = c.name === '--ink' || c.name === '--ink-light'
              return (
                <div
                  key={c.name}
                  className="overflow-hidden rounded-2xl border-[1.5px] border-[hsl(var(--game-ink))]/10 shadow-[0_3px_0_hsl(var(--game-cream-dark)),0_6px_20px_rgba(0,0,0,0.06)]"
                >
                  <div
                    className="h-24"
                    style={{ background: c.hex }}
                  />
                  <div className="bg-[hsl(var(--game-white))] px-4 py-3">
                    <p className="font-heading text-[13px] font-black text-[hsl(var(--game-ink))]">
                      {c.name}
                    </p>
                    <p className="mt-0.5 font-heading text-[11px] font-semibold text-[hsl(var(--game-ink-light))]">
                      {c.hex}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ─── 2. Accent Palette ─── */}
        <div className="mt-14">
          <SectionLabel text="Colour · Accent" />
          <SectionHeading
            title="Game Accents"
            annotation="The remaining 10%. Each game owns one accent. Never mix accents across games."
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {ACCENT_PALETTE.map((c) => (
              <div
                key={c.name}
                className="overflow-hidden rounded-2xl border-[1.5px] border-[hsl(var(--game-ink))]/10 shadow-[0_3px_0_hsl(var(--game-cream-dark)),0_6px_20px_rgba(0,0,0,0.06)]"
              >
                <div
                  className="h-24"
                  style={{ background: c.hex }}
                />
                <div className="bg-[hsl(var(--game-white))] px-4 py-3">
                  <p className="font-heading text-[13px] font-black text-white"
                    style={{ color: c.hex }}
                  >
                    {c.name}
                  </p>
                  <p className="mt-0.5 font-heading text-[11px] font-semibold text-[hsl(var(--game-ink-light))]">
                    {c.hex}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 3. Motion Tokens ─── */}
        <div className="mt-14">
          <SectionLabel text="Motion" />
          <SectionHeading
            title="Motion Curves"
            annotation="Four curves cover the whole system. Spring for UI, ease-out for content, wipe for cinema, GSAP for panels."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {MOTION_TOKENS.map((m) => (
              <div
                key={m.name}
                className="rounded-2xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-5 shadow-[0_3px_0_hsl(var(--game-cream-dark)),0_6px_20px_rgba(0,0,0,0.06)]"
              >
                <p className="font-heading text-[13px] font-black text-[hsl(var(--game-ink))]">
                  {m.name}
                </p>
                {m.value && (
                  <p className="mt-1 font-heading text-[11px] font-semibold text-[hsl(var(--game-amber))]">
                    {m.value}
                  </p>
                )}
                <p className="mt-2 font-heading text-[12px] font-semibold italic leading-relaxed text-[hsl(var(--game-ink-light))]">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 4. Game World Gradients ─── */}
        <div className="mt-14">
          <SectionLabel text="Game Worlds" />
          <SectionHeading
            title="World Gradients"
            annotation="Each game lives inside a full-bleed gradient. The gradient is the world; everything else floats on top."
          />
          <div className="flex flex-col gap-4">
            {GAME_GRADIENTS.map((g) => (
              <div
                key={g.name}
                className="relative overflow-hidden rounded-2xl shadow-[0_3px_0_hsl(var(--game-cream-dark)),0_6px_20px_rgba(0,0,0,0.06)]"
                style={{ background: g.gradient }}
              >
                {/* Blitz stripe overlay */}
                {g.stripe && (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        'linear-gradient(-45deg, rgba(255,255,255,0.08) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.08) 75%, transparent 75%)',
                      backgroundSize: '28px 28px',
                      animation: 'stripeScroll 1.2s linear infinite',
                    }}
                  />
                )}
                <div className="relative z-10 px-6 py-5">
                  <p className="font-heading text-[20px] font-black text-white">
                    {g.name}
                  </p>
                  <p className="mt-1 font-heading text-[12px] font-semibold text-white/70">
                    {g.desc}
                  </p>
                  <p className="mt-2 font-heading text-[10px] font-semibold text-white/40">
                    {g.varName} · {g.gradient}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 5. Spec Note ─── */}
        <div className="mt-14 rounded-xl border-l-4 border-[hsl(var(--game-amber))] bg-[hsl(var(--game-ink))] px-6 py-5">
          <p className="font-heading text-[13px] font-semibold italic leading-relaxed text-white/90">
            React pattern: Each game page receives a <code className="rounded bg-white/10 px-1.5 py-0.5 text-[12px] not-italic text-[hsl(var(--game-amber))]">gameTheme</code> prop
            from <code className="rounded bg-white/10 px-1.5 py-0.5 text-[12px] not-italic text-[hsl(var(--game-amber))]">lib/gameThemes.ts</code>.
            Apply to the root layout: <code className="rounded bg-white/10 px-1.5 py-0.5 text-[12px] not-italic text-[hsl(var(--game-amber))]">{'style={{ background: theme.gradient }}'}</code>.
            Theme exports: <code className="rounded bg-white/10 px-1.5 py-0.5 text-[12px] not-italic text-[hsl(var(--game-amber))]">gradient, accent, accentDark, worldBg, thumbBg, btnShadow</code>.
            Never hardcode game colours in components.
          </p>
        </div>
      </div>
    </main>
  )
}
