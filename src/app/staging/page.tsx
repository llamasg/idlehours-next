import Link from 'next/link'

const SECTIONS = [
  { href: '/staging/tokens', num: '01', title: 'Tokens', desc: 'Colour palette, motion curves, game world gradients. The DNA of every component.', status: 'building' },
  { href: '/staging/layout-concepts', num: '02', title: 'Layout', desc: 'Grid lockups, editorial page mocks, ranked lists, pull quotes, article cards.', status: 'building' },
  { href: '/staging/type-components', num: '03', title: 'Type + Components', desc: 'Card concepts, data display, tag innovations, editorial type scale.', status: 'building' },
  { href: '/staging/imagery', num: '04', title: 'Imagery', desc: 'Editorial image-type pairings, screenshot comparisons, lightbox.', status: 'building' },
  { href: '/staging/components', num: '05', title: 'Component Library', desc: 'Bevel buttons, tooltips, toasts, search bars, accordions, charts and more.', status: 'building' },
  { href: '/staging/micro', num: '06', title: 'Microinteractions', desc: 'Animation playground. Disney 12 principles. Tooltips, bursts, wobbles.', status: 'building' },
  { href: '/staging/macro', num: '07', title: 'Macro Animations', desc: 'Page transitions, circle masks, wipes, gravity drops, scroll effects.', status: 'building' },
  { href: '/staging/notebook', num: '08', title: 'Notebook', desc: 'Stipple textures, sticky notes, pinboards, spiral notebooks, icon stamps.', status: 'building' },
  { href: '/staging/game-identities', num: '09', title: 'Game IDs', desc: 'Five game colour worlds. Gradients, accents, and sub-brand identities.', status: 'building' },
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
