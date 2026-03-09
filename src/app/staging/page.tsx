import Link from 'next/link'

const SECTIONS = [
  { href: '/staging/layout-concepts', num: '01', title: 'Layout', desc: 'Grid lockups, spatial compositions, page architectures. Blanks only, no colour.', status: 'building' },
  { href: '/staging/type-components', num: '02', title: 'Type + Components', desc: 'Card concepts, data display, tag innovations, editorial type scale.', status: 'building' },
  { href: '/staging/imagery', num: '03', title: 'Imagery', desc: 'Polaroids, full-bleed breaks, folders, editorial image-type pairings.', status: 'building' },
  { href: '/staging/components', num: '04', title: 'Component Library', desc: '15+ button variations, search bars, sliders, calendars, charts and more.', status: 'building' },
  { href: '/staging/micro', num: '05', title: 'Microinteractions', desc: 'Animation playground. Disney 12 principles. Tooltips, bursts, wobbles.', status: 'building' },
  { href: '/staging/macro', num: '06', title: 'Macro Animations', desc: 'Page transitions, circle masks, card morphs, gravity drops, iris wipes.', status: 'building' },
]

export default function StagingOverview() {
  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        {/* Hero */}
        <p className="font-heading text-[9px] font-black uppercase tracking-[0.35em] text-[hsl(var(--game-amber))]">
          Experimental
        </p>
        <h1 className="mt-2 font-heading text-[clamp(36px,6vw,56px)] font-black leading-[0.95] tracking-tight text-[hsl(var(--game-ink))]">
          Component<br />Library
        </h1>
        <p className="mt-4 max-w-md font-heading text-[15px] font-semibold italic text-[hsl(var(--game-ink-mid))]">
          Idle Hours design system experiments. Nothing here is final, everything is a concept to pick from.
        </p>

        {/* Section grid */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group relative overflow-hidden rounded-2xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-5 shadow-[0_3px_0_hsl(var(--game-cream-dark)),0_6px_20px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_0_hsl(var(--game-cream-dark)),0_18px_40px_rgba(0,0,0,0.1)]"
              style={{ transition: 'transform 0.2s cubic-bezier(0.34,1.5,0.64,1), box-shadow 0.2s ease' }}
            >
              <div className="flex items-start justify-between">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--game-amber))] font-heading text-[11px] font-black text-white shadow-[0_2px_6px_rgba(200,135,58,0.4)]" style={{ transform: 'rotate(-2deg)' }}>
                  {s.num}
                </span>
                <span className="rounded-full bg-[hsl(var(--game-cream))] px-2 py-0.5 font-heading text-[9px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-light))]">
                  {s.status}
                </span>
              </div>
              <h2 className="mt-3 font-heading text-lg font-black text-[hsl(var(--game-ink))]">
                {s.title}
              </h2>
              <p className="mt-1 font-heading text-[12px] font-semibold leading-relaxed text-[hsl(var(--game-ink-light))]">
                {s.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
