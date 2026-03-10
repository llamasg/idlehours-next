export default function LayoutConceptsPage() {
  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-5xl">
        {/* Page header */}
        <p className="font-heading text-[9px] font-black uppercase tracking-[0.35em] text-[hsl(var(--game-amber))]">
          Page 01 of 06
        </p>
        <h1 className="mt-2 font-heading text-[clamp(36px,6vw,56px)] font-black leading-[0.95] tracking-tight text-[hsl(var(--game-ink))]">
          Layout<br />Concepts
        </h1>
        <p className="mt-4 max-w-lg font-heading text-[15px] font-semibold italic text-[hsl(var(--game-ink-mid))]">
          Spatial compositions using blank rectangles. Cream, white and ink only. Every layout should feel like it could only be Idle Hours.
        </p>

        {/* ──────────────────────────────────────────── */}
        {/* 01. Editorial Numbered List */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">01</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Editorial Numbered List</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Large numbers left-aligned, game card and editorial copy to the right. Dashed separators between entries.
          </p>
          <div className="mt-6 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            {['01', '02', '03', '04'].map((num, i) => (
              <div key={num}>
                {i > 0 && <div className="my-5 border-t border-dashed border-[hsl(var(--game-ink))]/10" />}
                <div className="grid grid-cols-[80px_1fr] gap-6">
                  <span className="font-heading text-[48px] font-black leading-none text-[hsl(var(--game-ink))]/8">{num}</span>
                  <div className="flex gap-4">
                    <div className="h-24 w-24 flex-shrink-0 rounded-xl bg-[hsl(var(--game-cream-dark))]" />
                    <div className="flex-1 py-1">
                      <div className="h-3 w-2/3 rounded-full bg-[hsl(var(--game-ink))]/12" />
                      <div className="mt-2 h-2 w-full rounded-full bg-[hsl(var(--game-ink))]/5" />
                      <div className="mt-1.5 h-2 w-5/6 rounded-full bg-[hsl(var(--game-ink))]/5" />
                      <div className="mt-1.5 h-2 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ──────────────────────────────────────────── */}
        {/* 02. Captioned Figure with Margin Note */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">02</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Captioned Figure with Margin Note</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Blog image with caption below and a margin annotation to the right. Useful for editorial asides.
          </p>
          <div className="mt-6 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-6">
            <div className="grid grid-cols-[1fr_160px] gap-6">
              <div>
                <div className="aspect-[16/9] rounded-xl bg-[hsl(var(--game-cream-dark))]" />
                <div className="mt-2 h-2 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/6" />
              </div>
              <div className="flex items-start pt-4">
                <div className="border-l-2 border-[hsl(var(--game-ink))]/10 pl-3">
                  <div className="h-2 w-full rounded-full bg-[hsl(var(--game-ink))]/8" />
                  <div className="mt-1.5 h-2 w-5/6 rounded-full bg-[hsl(var(--game-ink))]/5" />
                  <div className="mt-1.5 h-2 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────── */}
        {/* 03. Image with Pull-Quote Overlay */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20 pb-16">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">03</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Image with Pull-Quote Overlay</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Hero image with a floating pull-quote card overlaid in the bottom-right corner. Adds editorial weight.
          </p>
          <div className="mt-6 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-6">
            <div className="relative">
              <div className="h-56 rounded-xl bg-[hsl(var(--game-cream-dark))]" />
              <div className="absolute bottom-4 right-4 w-2/5 rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                <div className="h-2.5 w-full rounded-full bg-[hsl(var(--game-ink))]/10" />
                <div className="mt-1.5 h-2.5 w-4/5 rounded-full bg-[hsl(var(--game-ink))]/10" />
                <div className="mt-3 h-2 w-1/3 rounded-full bg-[hsl(var(--game-ink))]/6" />
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────── */}
        {/* 04. Featured Game in Listicle */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">04</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Featured Game in Listicle</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Two-column layout with oversized rank number overlapping the headline. Game cover on the right.
          </p>
          <div className="mt-6 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="grid grid-cols-[1fr_200px] gap-8">
              {/* Left column */}
              <div className="relative">
                <span
                  className="font-heading text-[120px] font-black leading-none text-[hsl(var(--game-ink))]"
                  style={{ opacity: 0.06, position: 'absolute', top: '-20px', left: '-8px', zIndex: 0 }}
                >
                  03
                </span>
                <div className="relative z-10">
                  <p className="font-heading text-[9px] font-black uppercase tracking-[0.35em] text-[hsl(var(--game-amber))]">
                    Best cosy games 2024
                  </p>
                  <h3 className="mt-2 font-heading text-[28px] font-black leading-[1.05] tracking-tight text-[hsl(var(--game-ink))]">
                    Venba is the game that made me ring my mum.
                  </h3>
                  <p className="mt-3 font-heading text-[14px] font-semibold italic leading-relaxed text-[hsl(var(--game-ink-mid))]">
                    A short, gorgeous cooking game about a Tamil family in Canada. Every recipe carries the weight of memory,
                    and every meal is an act of love you can feel in your chest.
                  </p>

                  {/* OpenCritic score box */}
                  <div className="mt-5 inline-flex items-center gap-3 rounded-lg border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] px-4 py-2.5">
                    <span className="font-heading text-[28px] font-black leading-none text-[hsl(var(--game-ink))]">87</span>
                    <div>
                      <p className="font-heading text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-ink-mid))]">OpenCritic</p>
                      <p className="font-heading text-[12px] font-bold text-[hsl(var(--game-amber))]">Mighty</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[hsl(var(--game-amber-lt))] px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--game-ink))]">Narrative</span>
                    <span className="rounded-full bg-[hsl(var(--game-cream))] px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--game-ink-mid))]">2-3 hrs</span>
                    <span className="rounded-full bg-[hsl(var(--game-green-lt))] px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--game-ink))]">Steam</span>
                    <span className="rounded-full bg-[hsl(var(--game-blue-light))] px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--game-ink))]">Switch</span>
                  </div>
                </div>
              </div>

              {/* Right column — game cover placeholder */}
              <div className="flex items-start">
                <div className="h-[280px] w-full rounded-xl bg-[hsl(270,40%,30%)]" />
              </div>
            </div>
          </div>
          {/* Spec note */}
          <div className="mt-3 rounded-lg border border-[hsl(var(--game-amber))]/30 bg-[hsl(var(--game-ink))]/90 px-4 py-3">
            <p className="font-heading text-[11px] font-semibold italic text-[hsl(var(--game-amber))]/80">
              Two-column grid (1fr 200px). Oversized dim rank number &ldquo;03&rdquo; positioned absolute behind headline.
              Score box uses OpenCritic-style &ldquo;Mighty&rdquo; label. Tags use coloured pill backgrounds.
            </p>
          </div>
        </section>

        {/* ──────────────────────────────────────────── */}
        {/* 05. Ranked List Treatment */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">05</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Ranked List Treatment</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Numbered ranking with large rank numbers, game titles with descriptions, and score badges. Hover reveals background and amber number.
          </p>
          <div className="mt-6 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            {[
              { rank: '01', title: 'Stardew Valley', desc: 'The farming sim that became a way of life. Endlessly generous, endlessly gentle.', score: 94 },
              { rank: '02', title: 'Hades', desc: 'Roguelike perfection wrapped in myth. Every death teaches you something new.', score: 93 },
              { rank: '03', title: 'Venba', desc: 'A short cooking game about a Tamil family. Every recipe carries the weight of memory.', score: 87 },
              { rank: '04', title: 'A Short Hike', desc: 'A tiny island, a mountain to climb. No rush. The journey is the entire point.', score: 85 },
            ].map((item, i) => (
              <div key={item.rank}>
                {i > 0 && <div className="my-1 border-t border-dashed border-[hsl(var(--game-ink))]/8" />}
                <div className="group grid grid-cols-[68px_1fr_110px] items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-[hsl(var(--game-cream))]/60">
                  <span className="font-heading text-[36px] font-black leading-none text-[hsl(var(--game-ink))]/10 transition-colors group-hover:text-[hsl(var(--game-amber))]">
                    {item.rank}
                  </span>
                  <div>
                    <h4 className="font-heading text-[16px] font-black text-[hsl(var(--game-ink))]">{item.title}</h4>
                    <p className="mt-0.5 font-heading text-[12px] font-semibold text-[hsl(var(--game-ink-mid))]">{item.desc}</p>
                  </div>
                  <div className="flex justify-end">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--game-cream))] font-heading text-[16px] font-black text-[hsl(var(--game-ink))]">
                      {item.score}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Spec note */}
          <div className="mt-3 rounded-lg border border-[hsl(var(--game-amber))]/30 bg-[hsl(var(--game-ink))]/90 px-4 py-3">
            <p className="font-heading text-[11px] font-semibold italic text-[hsl(var(--game-amber))]/80">
              Grid of 3 cols (68px rank, 1fr title+desc, 110px score). On hover: cream background appears, rank number transitions to amber.
              Dashed separators between rows.
            </p>
          </div>
        </section>

        {/* ──────────────────────────────────────────── */}
        {/* 06. Editorial Page Mock */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">06</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Editorial Page Mock</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Full article layout with main content column and sticky sidebar. Includes byline, pull-quote, score block, and related games.
          </p>
          <div className="mt-6 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="grid grid-cols-[1fr_280px] gap-10">
              {/* Main content */}
              <div>
                {/* Kicker */}
                <p className="font-heading text-[9px] font-black uppercase tracking-[0.35em] text-[hsl(var(--game-amber))]">
                  Long Read · Cosy Games
                </p>

                {/* Headline */}
                <h3 className="mt-3 font-heading text-[32px] font-black leading-[1.05] tracking-tight text-[hsl(var(--game-ink))]">
                  Venba is the game that made me ring my mum.
                </h3>

                {/* Standfirst */}
                <p className="mt-3 font-heading text-[15px] font-semibold italic leading-relaxed text-[hsl(var(--game-ink-mid))]">
                  A short Tamil cooking game about memory, migration, and the recipes that hold families together
                  even when everything else falls apart.
                </p>

                {/* Byline */}
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--game-amber))]">
                    <span className="font-heading text-[11px] font-black text-[hsl(var(--game-white))]">B</span>
                  </div>
                  <div>
                    <p className="font-heading text-[12px] font-bold text-[hsl(var(--game-ink))]">Beth</p>
                    <p className="font-heading text-[10px] font-semibold text-[hsl(var(--game-ink-light))]">8 min read · 14 Mar 2024</p>
                  </div>
                </div>

                {/* Body text placeholder */}
                <div className="mt-6 space-y-3">
                  <div className="h-2.5 w-full rounded-full bg-[hsl(var(--game-ink))]/6" />
                  <div className="h-2.5 w-[95%] rounded-full bg-[hsl(var(--game-ink))]/6" />
                  <div className="h-2.5 w-[88%] rounded-full bg-[hsl(var(--game-ink))]/6" />
                  <div className="h-2.5 w-full rounded-full bg-[hsl(var(--game-ink))]/6" />
                  <div className="h-2.5 w-[70%] rounded-full bg-[hsl(var(--game-ink))]/6" />
                </div>

                {/* Pull-quote */}
                <blockquote className="my-8 border-l-4 border-[hsl(var(--game-amber))] pl-5">
                  <p className="font-heading text-[18px] font-black italic leading-snug text-[hsl(var(--game-ink))]">
                    &ldquo;The recipes don&rsquo;t just feed you — they carry every conversation your family never had.&rdquo;
                  </p>
                </blockquote>

                {/* More body text */}
                <div className="space-y-3">
                  <div className="h-2.5 w-full rounded-full bg-[hsl(var(--game-ink))]/6" />
                  <div className="h-2.5 w-[92%] rounded-full bg-[hsl(var(--game-ink))]/6" />
                  <div className="h-2.5 w-[85%] rounded-full bg-[hsl(var(--game-ink))]/6" />
                </div>

                {/* Subheading */}
                <h4 className="mt-8 font-heading text-[18px] font-black text-[hsl(var(--game-ink))]">
                  What the critics say
                </h4>

                {/* OpenCritic score block */}
                <div className="mt-4 inline-flex items-center gap-4 rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] px-5 py-3">
                  <span className="font-heading text-[36px] font-black leading-none text-[hsl(var(--game-ink))]">87</span>
                  <div>
                    <p className="font-heading text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-ink-mid))]">OpenCritic</p>
                    <p className="font-heading text-[13px] font-bold text-[hsl(var(--game-amber))]">Mighty</p>
                  </div>
                </div>
              </div>

              {/* Sidebar — sticky */}
              <div className="sticky top-8 self-start space-y-6">
                {/* Game card */}
                <div className="rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] p-4">
                  <div className="aspect-[3/4] w-full rounded-lg bg-[hsl(270,40%,30%)]" />
                  <h4 className="mt-3 font-heading text-[15px] font-black text-[hsl(var(--game-ink))]">Venba</h4>
                  <p className="mt-1 font-heading text-[20px] font-black text-[hsl(var(--game-ink))]">£9.99</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-[hsl(var(--game-amber-lt))] px-2.5 py-0.5 font-heading text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--game-ink))]">Narrative</span>
                    <span className="rounded-full bg-[hsl(var(--game-cream-dark))] px-2.5 py-0.5 font-heading text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--game-ink-mid))]">2-3 hrs</span>
                    <span className="rounded-full bg-[hsl(var(--game-green-lt))] px-2.5 py-0.5 font-heading text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--game-ink))]">Steam</span>
                    <span className="rounded-full bg-[hsl(var(--game-blue-light))] px-2.5 py-0.5 font-heading text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--game-ink))]">Switch</span>
                  </div>
                </div>

                {/* If you liked this */}
                <div>
                  <h5 className="font-heading text-[10px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-ink-mid))]">If you liked this</h5>
                  <div className="mt-3 space-y-3">
                    {['Unpacking', 'A Short Hike', 'Spiritfarer'].map((game) => (
                      <div key={game} className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-[hsl(var(--game-cream-dark))]" />
                        <span className="font-heading text-[13px] font-bold text-[hsl(var(--game-ink))]">{game}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Spec note */}
          <div className="mt-3 rounded-lg border border-[hsl(var(--game-amber))]/30 bg-[hsl(var(--game-ink))]/90 px-4 py-3">
            <p className="font-heading text-[11px] font-semibold italic text-[hsl(var(--game-amber))]/80">
              Two-column editorial layout (1fr + 280px sidebar). Sidebar is sticky. Includes kicker, headline, standfirst,
              byline with avatar circle, body text placeholders, pull-quote with amber left border, OpenCritic score block,
              game card with cover + price + tags, and &ldquo;If you liked this&rdquo; section with 3 related games.
            </p>
          </div>
        </section>

        {/* ──────────────────────────────────────────── */}
        {/* 07. Pull Quote (Stipple Background) */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">07</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Pull Quote (Stipple Background)</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Pull-quote with stipple dot pattern background, amber left border, and slight negative rotation.
          </p>
          <div className="mt-6 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <blockquote
              className="rounded-xl border-l-4 border-[hsl(var(--game-amber))] px-8 py-7"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(26,26,20,0.07) 1px, transparent 1px)',
                backgroundSize: '10px 10px',
                transform: 'rotate(-0.5deg)',
              }}
            >
              <p className="font-heading text-[22px] font-black italic leading-snug text-[hsl(var(--game-ink))]">
                &ldquo;The farming loop is patient in a way most games refuse to be.&rdquo;
              </p>
              <p className="mt-4 font-heading text-[12px] font-bold tracking-wide text-[hsl(var(--game-ink-mid))]">
                Beth &middot; Idle Hours
              </p>
            </blockquote>
          </div>
          {/* Spec note */}
          <div className="mt-3 rounded-lg border border-[hsl(var(--game-amber))]/30 bg-[hsl(var(--game-ink))]/90 px-4 py-3">
            <p className="font-heading text-[11px] font-semibold italic text-[hsl(var(--game-amber))]/80">
              Stipple dot background via radial-gradient (1px dots at 10px intervals). 4px amber left border.
              Slight negative rotation (-0.5deg) for editorial personality. Attribution below quote.
            </p>
          </div>
        </section>

        {/* ──────────────────────────────────────────── */}
        {/* 08. Full-bleed Type Overlay */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">08</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Full-bleed Type Overlay</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Dark gradient background with text anchored bottom-left. Gradient fade from bottom edge.
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-[hsl(var(--game-ink))]/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div
              className="relative flex min-h-[340px] items-end"
              style={{
                background: 'linear-gradient(135deg, hsl(270, 30%, 18%) 0%, hsl(260, 25%, 12%) 100%)',
              }}
            >
              {/* Bottom gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
                }}
              />
              <div className="relative z-10 p-8 pb-10">
                <p className="font-heading text-[9px] font-black uppercase tracking-[0.35em] text-[hsl(var(--game-amber))]">
                  Curated Collection
                </p>
                <h3 className="mt-2 max-w-lg font-heading text-[clamp(28px,4vw,40px)] font-black leading-[1.05] tracking-tight text-white">
                  The ones worth setting proper time aside for.
                </h3>
                <p className="mt-3 max-w-md font-heading text-[14px] font-semibold text-white/60">
                  Long games that reward patience. The kind you clear your weekend for.
                </p>
              </div>
            </div>
          </div>
          {/* Spec note */}
          <div className="mt-3 rounded-lg border border-[hsl(var(--game-amber))]/30 bg-[hsl(var(--game-ink))]/90 px-4 py-3">
            <p className="font-heading text-[11px] font-semibold italic text-[hsl(var(--game-amber))]/80">
              Dark purple-ish gradient background (135deg, hsl 270). Bottom-to-top gradient overlay for text readability.
              Text anchored bottom-left via flex items-end. Eyebrow + headline + subtitle in white tones.
            </p>
          </div>
        </section>

        {/* ──────────────────────────────────────────── */}
        {/* 09. Stacked Article Card */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20 pb-16">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">09</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Stacked Article Card</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Card with hero image area on top and article details below. Includes live indicator, read time, and feature tag.
          </p>
          <div className="mt-6 max-w-md">
            <div className="overflow-hidden rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              {/* Hero image — 16:9 placeholder */}
              <div className="aspect-[16/9] w-full bg-[hsl(var(--game-cream-dark))]" />

              {/* Body */}
              <div className="p-6">
                {/* Eyebrow with live dot */}
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--game-amber))] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--game-amber))]" />
                  </span>
                  <span className="font-heading text-[9px] font-black uppercase tracking-[0.35em] text-[hsl(var(--game-amber))]">
                    Long read
                  </span>
                </div>

                {/* Title */}
                <h3 className="mt-3 font-heading text-[20px] font-black leading-[1.1] tracking-tight text-[hsl(var(--game-ink))]">
                  The strange peace of games where nothing goes wrong
                </h3>

                {/* Description */}
                <p className="mt-2 font-heading text-[13px] font-semibold italic leading-relaxed text-[hsl(var(--game-ink-mid))]">
                  Why we keep returning to worlds with no enemies, no fail states, and no reason to hurry.
                </p>

                {/* Footer */}
                <div className="mt-5 flex items-center justify-between">
                  <p className="font-heading text-[11px] font-semibold text-[hsl(var(--game-ink-light))]">
                    8 min read &middot; Beth
                  </p>
                  <span className="rounded-full bg-[hsl(var(--game-cream))] px-3 py-1 font-heading text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--game-ink-mid))]">
                    Feature
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Spec note */}
          <div className="mt-3 max-w-md rounded-lg border border-[hsl(var(--game-amber))]/30 bg-[hsl(var(--game-ink))]/90 px-4 py-3">
            <p className="font-heading text-[11px] font-semibold italic text-[hsl(var(--game-amber))]/80">
              Stacked card: 16:9 hero placeholder on top, body below. Live pulsing dot next to &ldquo;Long read&rdquo; eyebrow.
              Title + italic description. Footer with read time, author, and &ldquo;Feature&rdquo; tag pill.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
