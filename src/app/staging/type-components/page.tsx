'use client'

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

/* ─── Type Scale Reference ─── */
function TypeScaleReference() {
  const tokens = [
    {
      spec: 'display · 64px · 900',
      rendered: 'Idle Hours',
      style: { fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900 } as React.CSSProperties,
      className: 'font-heading text-[hsl(var(--game-ink))]',
    },
    {
      spec: 'h1 · 48px · 900',
      rendered: 'Something to play.',
      style: { fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900 } as React.CSSProperties,
      className: 'font-heading text-[hsl(var(--game-ink))]',
    },
    {
      spec: 'game title · 30px · 900',
      rendered: 'GAME SENSE',
      style: { fontSize: 30, fontWeight: 900, textTransform: 'uppercase' as const } as React.CSSProperties,
      className: 'font-heading text-[hsl(var(--game-ink))]',
    },
    {
      spec: 'h3 · 22px · 800',
      rendered: 'Fresh every morning.',
      style: { fontSize: 22, fontWeight: 800 } as React.CSSProperties,
      className: 'font-heading text-[hsl(var(--game-ink))]',
    },
    {
      spec: 'body · 13px · 600 italic',
      rendered: 'A beautifully crafted experience that lingers long after the credits roll. Every detail feels considered, every moment intentional.',
      style: { fontSize: 13, fontWeight: 600, fontStyle: 'italic' } as React.CSSProperties,
      className: 'font-heading text-[hsl(var(--game-ink-light))]',
    },
    {
      spec: 'label · 9px · 800 caps',
      rendered: 'Daily · Guess the game',
      style: { fontSize: 9, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.24em' } as React.CSSProperties,
      className: 'font-heading text-[hsl(var(--game-ink-dim))]',
    },
    {
      spec: 'mono · 11px',
      rendered: 'cubic-bezier(0.34,1.5,0.64,1)',
      style: { fontSize: 11, fontFamily: 'monospace' } as React.CSSProperties,
      className: 'text-[hsl(var(--game-purple,270_60%_50%))]',
    },
  ]

  return (
    <>
      <Label num="17" title="Type Scale Reference" annotation="UK English always. No em dashes. Contractions mandatory. Body copy always italic 600 weight in ink-light. Game titles ALL CAPS on cards, title-case in articles." />
      <Section>
        {/* Header */}
        <div className="rounded-t-xl bg-[hsl(var(--game-ink))] px-5 py-3 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-6 sm:rounded-t-2xl">
          <span className="font-heading text-[12px] font-bold text-[hsl(var(--game-cream))]">
            Montserrat — Google Fonts CDN
          </span>
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          {tokens.map((token, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 py-4 sm:flex-row sm:items-baseline sm:gap-6"
              style={i < tokens.length - 1 ? { borderBottom: '1px dashed hsl(var(--game-ink) / 0.1)' } : undefined}
            >
              {/* Spec column */}
              <div className="w-full flex-shrink-0 sm:w-48">
                <span className="font-heading text-[11px] text-[hsl(var(--game-ink-dim))]" style={{ fontFamily: 'monospace' }}>
                  {token.spec}
                </span>
              </div>
              {/* Rendered example */}
              <div className="flex-1">
                <span className={token.className} style={token.style}>
                  {token.rendered}
                </span>
              </div>
            </div>
          ))}
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
          Card concepts, medals, and editorial type. Seven specimens across three categories.
        </p>

        {/* Category header: Cards */}
        <div className="mt-16 mb-10">
          <span className="rounded-full bg-[hsl(var(--game-ink))] px-4 py-1.5 font-heading text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-cream))]">
            Card Concepts
          </span>
          <p className="mt-3 font-heading text-[13px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Card patterns for reviews, articles, and editorial content.
          </p>
        </div>

        <div className="space-y-16">
          <ReviewSnippetCard />
          <ArticlePreviewCard />
          <GameOfTheWeekCard />
        </div>

        {/* Category header: Tags/Chips/Medals */}
        <div className="mt-24 mb-10">
          <span className="rounded-full bg-[hsl(var(--game-ink))] px-4 py-1.5 font-heading text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-cream))]">
            Medal System
          </span>
          <p className="mt-3 font-heading text-[13px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Earned medals with locked, earned, and just-earned states across tiers.
          </p>
        </div>

        <div className="space-y-16">
          <EarnedMedalSystem />
        </div>

        {/* Category header: Editorial Type */}
        <div className="mt-24 mb-10">
          <span className="rounded-full bg-[hsl(var(--game-ink))] px-4 py-1.5 font-heading text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-cream))]">
            Editorial Type
          </span>
          <p className="mt-3 font-heading text-[13px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Drop caps, margin annotations, and score display across scales.
          </p>
        </div>

        <div className="space-y-16">
          <ArticleDropCap />
          <EditorialSidebarAnnotations />
          <ScoreTypography />
        </div>

        {/* Category header: Type Scale */}
        <div className="mt-24 mb-10">
          <span className="rounded-full bg-[hsl(var(--game-ink))] px-4 py-1.5 font-heading text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-cream))]">
            Type Scale
          </span>
          <p className="mt-3 font-heading text-[13px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            UK English always. No em dashes. Contractions mandatory. Body copy always italic 600 weight in ink-light. Game titles ALL CAPS on cards, title-case in articles.
          </p>
        </div>

        <div className="space-y-16">
          <TypeScaleReference />
        </div>

        {/* Footer spacer */}
        <div className="mt-24" />
      </div>
    </main>
  )
}