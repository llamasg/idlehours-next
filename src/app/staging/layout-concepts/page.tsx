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
        {/* 01. Daily Game Catalogue */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">01</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Daily Game Catalogue</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            3-column grid with one feature card spanning 2 rows. Cards are white rounded-2xl on cream.
          </p>
          <div className="mt-6 rounded-2xl border border-dashed border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] p-6">
            <div className="grid grid-cols-3 grid-rows-[180px_180px] gap-4">
              {/* Feature card spanning 2 rows */}
              <div className="row-span-2 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="h-3/5 rounded-xl bg-[hsl(var(--game-cream-dark))]" />
                <div className="mt-3 h-3 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/10" />
                <div className="mt-2 h-2 w-1/2 rounded-full bg-[hsl(var(--game-ink))]/5" />
                <div className="mt-4 h-2 w-full rounded-full bg-[hsl(var(--game-ink))]/5" />
                <div className="mt-1.5 h-2 w-4/5 rounded-full bg-[hsl(var(--game-ink))]/5" />
              </div>
              {/* Regular cards */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="h-3/5 rounded-xl bg-[hsl(var(--game-cream-dark))]" />
                  <div className="mt-2 h-2.5 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/10" />
                  <div className="mt-1.5 h-2 w-1/2 rounded-full bg-[hsl(var(--game-ink))]/5" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────── */}
        {/* 02. Sticker Collection Shelf */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">02</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Sticker Collection Shelf</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            14 badge slots in a credenza. Earned badges filled, empty ones dashed. Grouped by week with date labels.
          </p>
          <div className="mt-6 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            {/* Week 1 */}
            <p className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-ink-light))]">Week of 3 Mar</p>
            <div className="mt-3 flex flex-wrap gap-4">
              {[true, true, true, true, true, true, true].map((earned, i) => (
                <div key={`w1-${i}`} className={`flex h-14 w-14 items-center justify-center rounded-full ${earned ? 'border-2 border-[hsl(var(--game-ink))]/20 bg-[hsl(var(--game-white))] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]' : 'border-2 border-dashed border-[hsl(var(--game-ink))]/15'}`}>
                  {earned && <div className="h-6 w-6 rounded-full bg-[hsl(var(--game-cream-dark))]" />}
                </div>
              ))}
            </div>
            {/* Dashed divider */}
            <div className="my-5 border-t border-dashed border-[hsl(var(--game-ink))]/10" />
            {/* Week 2 */}
            <p className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-ink-light))]">Week of 10 Mar</p>
            <div className="mt-3 flex flex-wrap gap-4">
              {[true, true, true, false, false, false, false].map((earned, i) => (
                <div key={`w2-${i}`} className={`flex h-14 w-14 items-center justify-center rounded-full ${earned ? 'border-2 border-[hsl(var(--game-ink))]/20 bg-[hsl(var(--game-white))] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]' : 'border-2 border-dashed border-[hsl(var(--game-ink))]/15'}`}>
                  {earned && <div className="h-6 w-6 rounded-full bg-[hsl(var(--game-cream-dark))]" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────── */}
        {/* 03. Achievement Wall */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">03</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Achievement Wall</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Dense grid of 30+ badge circles with 4 category tabs. Staggered sizing avoids the spreadsheet feel.
          </p>
          <div className="mt-6 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            {/* Category tabs */}
            <div className="flex gap-2">
              {['All', 'Daily', 'Weekly', 'Special'].map((tab, i) => (
                <div key={tab} className={`rounded-md px-3 py-1 font-heading text-[10px] font-bold ${i === 0 ? 'bg-[hsl(var(--game-ink))] text-[hsl(var(--game-cream))]' : 'bg-[hsl(var(--game-cream))] text-[hsl(var(--game-ink-mid))]'}`}>
                  {tab}
                </div>
              ))}
            </div>
            {/* Badge grid with staggered sizes */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              {Array.from({ length: 36 }).map((_, i) => {
                const sizes = ['h-10 w-10', 'h-8 w-8', 'h-12 w-12', 'h-9 w-9', 'h-7 w-7', 'h-11 w-11']
                const size = sizes[i % sizes.length]
                const earned = i < 22
                return (
                  <div key={i} className={`flex-shrink-0 rounded-full ${size} ${earned ? 'border border-[hsl(var(--game-ink))]/15 bg-[hsl(var(--game-cream-dark))]' : 'border border-dashed border-[hsl(var(--game-ink))]/10'}`} />
                )
              })}
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
            Mueller-Brockmann split: tall image zone left, editorial copy right. Large ranking number as typographic element.
          </p>
          <div className="mt-6 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="grid grid-cols-[2fr_3fr] gap-8">
              {/* Image zone */}
              <div className="h-80 rounded-xl bg-[hsl(var(--game-ink))]" />
              {/* Editorial copy */}
              <div className="flex flex-col justify-center">
                <span className="font-heading text-[72px] font-black leading-none text-[hsl(var(--game-ink))]/8">01</span>
                <div className="mt-2 h-4 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/15" />
                <div className="mt-2 h-3 w-1/3 rounded-full bg-[hsl(var(--game-ink))]/8" />
                <div className="mt-6 space-y-2">
                  <div className="h-2.5 w-full rounded-full bg-[hsl(var(--game-ink))]/5" />
                  <div className="h-2.5 w-full rounded-full bg-[hsl(var(--game-ink))]/5" />
                  <div className="h-2.5 w-5/6 rounded-full bg-[hsl(var(--game-ink))]/5" />
                  <div className="h-2.5 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/5" />
                </div>
                <div className="mt-6 flex gap-2">
                  <div className="rounded-full bg-[hsl(var(--game-cream))] px-4 py-1.5">
                    <div className="h-2 w-12 rounded-full bg-[hsl(var(--game-ink))]/10" />
                  </div>
                  <div className="rounded-full bg-[hsl(var(--game-cream))] px-4 py-1.5">
                    <div className="h-2 w-8 rounded-full bg-[hsl(var(--game-ink))]/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────── */}
        {/* 05. Homepage Hero Balance */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">05</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Homepage Hero Balance</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Full homepage layout. Tension between "play today" game cards and "read this" article cards.
          </p>
          <div className="mt-6 rounded-2xl border border-dashed border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] p-6">
            {/* Hero */}
            <div className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-8">
              <div className="h-3 w-20 rounded-full bg-[hsl(var(--game-ink))]/8" />
              <div className="mt-3 h-8 w-2/3 rounded-full bg-[hsl(var(--game-ink))]/12" />
              <div className="mt-2 h-3 w-1/3 rounded-full bg-[hsl(var(--game-ink))]/6" />
            </div>

            {/* Play today + Read this */}
            <div className="mt-4 grid grid-cols-[3fr_2fr] gap-4">
              {/* Games column */}
              <div>
                <div className="mb-3 h-2 w-16 rounded-full bg-[hsl(var(--game-ink))]/8" />
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-3">
                      <div className="aspect-[4/3] rounded-xl bg-[hsl(var(--game-cream-dark))]" />
                      <div className="mt-2 h-2 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/8" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Articles column */}
              <div>
                <div className="mb-3 h-2 w-14 rounded-full bg-[hsl(var(--game-ink))]/8" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-4">
                      <div className="flex gap-3">
                        <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-[hsl(var(--game-cream-dark))]" />
                        <div className="flex-1">
                          <div className="h-2.5 w-full rounded-full bg-[hsl(var(--game-ink))]/10" />
                          <div className="mt-1.5 h-2 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/5" />
                          <div className="mt-1.5 h-2 w-1/2 rounded-full bg-[hsl(var(--game-ink))]/5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────── */}
        {/* 06. Editorial Numbered List */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">06</span>
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
        {/* 07. Blog Image Layouts */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">07</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Blog Image Layouts</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            4 sub-layouts: full-bleed break, side-by-side comparison, captioned figure with margin note, image with pull-quote overlay.
          </p>
          <div className="mt-6 space-y-6">
            {/* A: Full-bleed image break */}
            <div>
              <p className="mb-2 font-heading text-[9px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">A. Full-bleed break</p>
              <div className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-6">
                <div className="space-y-1.5">
                  <div className="h-2 w-full rounded-full bg-[hsl(var(--game-ink))]/5" />
                  <div className="h-2 w-5/6 rounded-full bg-[hsl(var(--game-ink))]/5" />
                </div>
                <div className="-mx-6 my-5 h-48 bg-[hsl(var(--game-cream-dark))]" />
                <div className="space-y-1.5">
                  <div className="h-2 w-full rounded-full bg-[hsl(var(--game-ink))]/5" />
                  <div className="h-2 w-4/5 rounded-full bg-[hsl(var(--game-ink))]/5" />
                </div>
              </div>
            </div>

            {/* B: Side-by-side comparison */}
            <div>
              <p className="mb-2 font-heading text-[9px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">B. Side-by-side comparison</p>
              <div className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="aspect-[4/3] rounded-xl bg-[hsl(var(--game-cream-dark))]" />
                    <div className="mt-2 h-2 w-1/2 rounded-full bg-[hsl(var(--game-ink))]/8" />
                  </div>
                  <div>
                    <div className="aspect-[4/3] rounded-xl bg-[hsl(var(--game-ink))]/80" />
                    <div className="mt-2 h-2 w-1/2 rounded-full bg-[hsl(var(--game-ink))]/8" />
                  </div>
                </div>
              </div>
            </div>

            {/* C: Captioned figure with margin annotation */}
            <div>
              <p className="mb-2 font-heading text-[9px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">C. Captioned figure with margin note</p>
              <div className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-6">
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
            </div>

            {/* D: Image with pull-quote overlay zone */}
            <div>
              <p className="mb-2 font-heading text-[9px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">D. Image with pull-quote overlay</p>
              <div className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-6">
                <div className="relative">
                  <div className="h-56 rounded-xl bg-[hsl(var(--game-cream-dark))]" />
                  <div className="absolute bottom-4 right-4 w-2/5 rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    <div className="h-2.5 w-full rounded-full bg-[hsl(var(--game-ink))]/10" />
                    <div className="mt-1.5 h-2.5 w-4/5 rounded-full bg-[hsl(var(--game-ink))]/10" />
                    <div className="mt-3 h-2 w-1/3 rounded-full bg-[hsl(var(--game-ink))]/6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────── */}
        {/* 08. Toast Notification Stack */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">08</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Toast Notification Stack</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            3 toasts stacked in top-right with positioning and overlap. Different widths for success, error and info.
          </p>
          <div className="mt-6 rounded-2xl border border-dashed border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] p-6">
            <div className="relative h-72 rounded-xl border border-[hsl(var(--game-ink))]/5 bg-[hsl(var(--game-white))]">
              {/* Page content placeholder */}
              <div className="p-6">
                <div className="h-3 w-1/3 rounded-full bg-[hsl(var(--game-ink))]/6" />
                <div className="mt-3 h-2 w-full rounded-full bg-[hsl(var(--game-ink))]/3" />
                <div className="mt-1.5 h-2 w-5/6 rounded-full bg-[hsl(var(--game-ink))]/3" />
              </div>
              {/* Toast stack */}
              <div className="absolute right-4 top-4 flex flex-col gap-2">
                {/* Success toast (narrow) */}
                <div className="w-48 rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-3 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[hsl(var(--game-cream-dark))]" />
                    <div className="h-2 w-16 rounded-full bg-[hsl(var(--game-ink))]/10" />
                  </div>
                </div>
                {/* Error toast (wide) */}
                <div className="w-72 rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-3 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[hsl(var(--game-ink))]" />
                    <div className="h-2 w-32 rounded-full bg-[hsl(var(--game-ink))]/10" />
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-[hsl(var(--game-ink))]/5" />
                </div>
                {/* Info toast (medium) */}
                <div className="w-56 rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-3 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[hsl(var(--game-cream-dark))]" />
                    <div className="h-2 w-20 rounded-full bg-[hsl(var(--game-ink))]/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────── */}
        {/* 09. Two-Pane Dashboard */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">09</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Two-Pane Dashboard</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Narrow ink sidebar with icon placeholders and labels. Right content area with cards in a grid.
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-[hsl(var(--game-ink))]/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="grid grid-cols-[200px_1fr]">
              {/* Sidebar */}
              <div className="bg-[hsl(var(--game-ink))] p-5">
                <div className="h-3 w-16 rounded-full bg-[hsl(var(--game-cream))]/20" />
                <div className="mt-8 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`h-5 w-5 rounded-md ${i === 1 ? 'bg-[hsl(var(--game-cream))]/30' : 'bg-[hsl(var(--game-cream))]/10'}`} />
                      <div className={`h-2 w-16 rounded-full ${i === 1 ? 'bg-[hsl(var(--game-cream))]/40' : 'bg-[hsl(var(--game-cream))]/15'}`} />
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-20">
                  <div className="border-t border-[hsl(var(--game-cream))]/10 pt-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-[hsl(var(--game-cream))]/15" />
                      <div className="h-2 w-12 rounded-full bg-[hsl(var(--game-cream))]/10" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Content */}
              <div className="bg-[hsl(var(--game-cream))] p-6">
                <div className="h-3 w-24 rounded-full bg-[hsl(var(--game-ink))]/8" />
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-4">
                      <div className="aspect-[3/2] rounded-xl bg-[hsl(var(--game-cream-dark))]" />
                      <div className="mt-3 h-2.5 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/10" />
                      <div className="mt-1.5 h-2 w-1/2 rounded-full bg-[hsl(var(--game-ink))]/5" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────── */}
        {/* 10. Card Stack / Deck */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">10</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Card Stack / Deck</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            3 cards in a deck formation with slight offsets and rotations. Peek state and fanned-out state side by side.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-8">
            {/* Peek state */}
            <div className="rounded-2xl border border-dashed border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] p-8">
              <p className="mb-4 font-heading text-[9px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">Peek state</p>
              <div className="relative mx-auto h-56 w-44">
                <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream-dark))]" style={{ transform: 'translate(8px, 8px) rotate(4deg)' }} />
                <div className="absolute inset-0 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream-dark))]" style={{ transform: 'translate(4px, 4px) rotate(2deg)' }} />
                <div className="absolute inset-0 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                  <div className="h-2/3 rounded-xl bg-[hsl(var(--game-cream-dark))]" />
                  <div className="mt-3 h-2.5 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/10" />
                  <div className="mt-1.5 h-2 w-1/2 rounded-full bg-[hsl(var(--game-ink))]/5" />
                </div>
              </div>
            </div>

            {/* Fanned-out state */}
            <div className="rounded-2xl border border-dashed border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] p-8">
              <p className="mb-4 font-heading text-[9px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">Fanned-out state</p>
              <div className="relative mx-auto flex h-56 w-full items-center justify-center">
                <div className="absolute h-48 w-36 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-3 shadow-[0_4px_16px_rgba(0,0,0,0.06)]" style={{ transform: 'translateX(-60px) rotate(-12deg)' }}>
                  <div className="h-2/3 rounded-xl bg-[hsl(var(--game-cream-dark))]" />
                  <div className="mt-2 h-2 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/8" />
                </div>
                <div className="absolute h-48 w-36 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)]" style={{ transform: 'rotate(0deg) translateY(-4px)' }}>
                  <div className="h-2/3 rounded-xl bg-[hsl(var(--game-cream-dark))]" />
                  <div className="mt-2 h-2 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/8" />
                </div>
                <div className="absolute h-48 w-36 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-3 shadow-[0_4px_16px_rgba(0,0,0,0.06)]" style={{ transform: 'translateX(60px) rotate(12deg)' }}>
                  <div className="h-2/3 rounded-xl bg-[hsl(var(--game-cream-dark))]" />
                  <div className="mt-2 h-2 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/8" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────── */}
        {/* 11. Timeline / Activity Feed */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">11</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Timeline / Activity Feed</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Vertical timeline with a line down the left, date nodes, and content blocks branching right. 5 entries across 3 days.
          </p>
          <div className="mt-6 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="relative pl-10">
              {/* Vertical line */}
              <div className="absolute bottom-0 left-4 top-0 w-px bg-[hsl(var(--game-ink))]/10" />

              {/* Day 1 */}
              <div className="relative pb-6">
                <div className="absolute -left-[25px] top-0.5 h-3 w-3 rounded-full border-2 border-[hsl(var(--game-ink))]/30 bg-[hsl(var(--game-white))]" />
                <p className="font-heading text-[9px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">7 Mar</p>
                <div className="mt-2 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] p-4">
                  <div className="h-2.5 w-2/3 rounded-full bg-[hsl(var(--game-ink))]/10" />
                  <div className="mt-2 h-2 w-full rounded-full bg-[hsl(var(--game-ink))]/5" />
                </div>
                <div className="relative mt-3">
                  <div className="absolute -left-[25px] top-3 h-2 w-2 rounded-full bg-[hsl(var(--game-ink))]/15" />
                  <div className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] p-4">
                    <div className="h-2.5 w-1/2 rounded-full bg-[hsl(var(--game-ink))]/10" />
                    <div className="mt-2 h-2 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/5" />
                  </div>
                </div>
              </div>

              {/* Day 2 */}
              <div className="relative pb-6">
                <div className="absolute -left-[25px] top-0.5 h-3 w-3 rounded-full border-2 border-[hsl(var(--game-ink))]/30 bg-[hsl(var(--game-white))]" />
                <p className="font-heading text-[9px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">8 Mar</p>
                <div className="mt-2 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] p-4">
                  <div className="h-2.5 w-3/5 rounded-full bg-[hsl(var(--game-ink))]/10" />
                  <div className="mt-2 h-2 w-5/6 rounded-full bg-[hsl(var(--game-ink))]/5" />
                </div>
              </div>

              {/* Day 3 */}
              <div className="relative">
                <div className="absolute -left-[25px] top-0.5 h-3 w-3 rounded-full border-2 border-[hsl(var(--game-ink))]/30 bg-[hsl(var(--game-white))]" />
                <p className="font-heading text-[9px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">9 Mar</p>
                <div className="mt-2 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] p-4">
                  <div className="h-2.5 w-1/2 rounded-full bg-[hsl(var(--game-ink))]/10" />
                  <div className="mt-2 h-2 w-2/3 rounded-full bg-[hsl(var(--game-ink))]/5" />
                </div>
                <div className="relative mt-3">
                  <div className="absolute -left-[25px] top-3 h-2 w-2 rounded-full bg-[hsl(var(--game-ink))]/15" />
                  <div className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] p-4">
                    <div className="h-2.5 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/10" />
                    <div className="mt-2 h-2 w-full rounded-full bg-[hsl(var(--game-ink))]/5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────── */}
        {/* 12. Comparison Layout */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">12</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Comparison Layout</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Two game cards side by side with aligned stat rows between them. "VS" centred in the header.
          </p>
          <div className="mt-6 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            {/* Header with VS */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="h-3 w-2/3 justify-self-end rounded-full bg-[hsl(var(--game-ink))]/10" />
              <span className="font-heading text-2xl font-black text-[hsl(var(--game-ink))]/15">VS</span>
              <div className="h-3 w-2/3 rounded-full bg-[hsl(var(--game-ink))]/10" />
            </div>

            <div className="mt-5 grid grid-cols-[1fr_auto_1fr] gap-4">
              {/* Left card */}
              <div className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] p-4">
                <div className="aspect-square rounded-xl bg-[hsl(var(--game-cream-dark))]" />
                <div className="mt-3 h-2.5 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/10" />
                <div className="mt-1.5 h-2 w-1/2 rounded-full bg-[hsl(var(--game-ink))]/5" />
              </div>

              {/* Stat rows */}
              <div className="flex flex-col justify-center gap-3 py-4">
                {['Score', 'Time', 'Streak', 'Rank'].map((stat) => (
                  <div key={stat} className="flex flex-col items-center gap-1">
                    <div className="h-px w-12 bg-[hsl(var(--game-ink))]/10" />
                    <span className="font-heading text-[8px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">{stat}</span>
                    <div className="h-px w-12 bg-[hsl(var(--game-ink))]/10" />
                  </div>
                ))}
              </div>

              {/* Right card */}
              <div className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] p-4">
                <div className="aspect-square rounded-xl bg-[hsl(var(--game-cream-dark))]" />
                <div className="mt-3 h-2.5 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/10" />
                <div className="mt-1.5 h-2 w-1/2 rounded-full bg-[hsl(var(--game-ink))]/5" />
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────── */}
        {/* 13. Floating Annotations */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">13</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Floating Annotations</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            A central content card with sticky-note callouts at slight angles, connected by implied spatial relationship.
          </p>
          <div className="mt-6 rounded-2xl border border-dashed border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] p-12">
            <div className="relative mx-auto max-w-md">
              {/* Central card */}
              <div className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                <div className="h-40 rounded-xl bg-[hsl(var(--game-cream-dark))]" />
                <div className="mt-4 h-3 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/10" />
                <div className="mt-2 h-2 w-full rounded-full bg-[hsl(var(--game-ink))]/5" />
                <div className="mt-1.5 h-2 w-5/6 rounded-full bg-[hsl(var(--game-ink))]/5" />
              </div>

              {/* Annotation: top-left */}
              <div className="absolute -left-28 -top-6 w-32 rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]" style={{ transform: 'rotate(-3deg)' }}>
                <div className="h-2 w-full rounded-full bg-[hsl(var(--game-ink))]/10" />
                <div className="mt-1 h-2 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/5" />
              </div>

              {/* Annotation: top-right */}
              <div className="absolute -right-24 top-8 w-28 rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]" style={{ transform: 'rotate(2deg)' }}>
                <div className="h-2 w-full rounded-full bg-[hsl(var(--game-ink))]/10" />
                <div className="mt-1 h-2 w-2/3 rounded-full bg-[hsl(var(--game-ink))]/5" />
              </div>

              {/* Annotation: bottom-left */}
              <div className="absolute -bottom-4 -left-20 w-36 rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]" style={{ transform: 'rotate(-1.5deg)' }}>
                <div className="h-2 w-full rounded-full bg-[hsl(var(--game-ink))]/10" />
                <div className="mt-1 h-2 w-5/6 rounded-full bg-[hsl(var(--game-ink))]/5" />
                <div className="mt-1 h-2 w-1/2 rounded-full bg-[hsl(var(--game-ink))]/5" />
              </div>

              {/* Annotation: bottom-right */}
              <div className="absolute -bottom-8 -right-16 w-30 rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]" style={{ transform: 'rotate(3deg)' }}>
                <div className="h-2 w-full rounded-full bg-[hsl(var(--game-ink))]/10" />
                <div className="mt-1 h-2 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/5" />
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────── */}
        {/* 14. Magazine Spread */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">14</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Magazine Spread</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Full editorial page. Drop-cap letter, 2-column body, pull-quote in the gutter, inline card, footnote bar.
          </p>
          <div className="mt-6 rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            {/* Title area */}
            <div className="h-4 w-1/2 rounded-full bg-[hsl(var(--game-ink))]/12" />
            <div className="mt-2 h-2.5 w-1/4 rounded-full bg-[hsl(var(--game-ink))]/6" />

            {/* 2-column body with drop cap */}
            <div className="mt-6 grid grid-cols-2 gap-8">
              {/* Left column */}
              <div>
                {/* Drop cap */}
                <div className="float-left mr-3 flex h-16 w-14 items-center justify-center rounded-lg bg-[hsl(var(--game-ink))]/8">
                  <span className="font-heading text-3xl font-black text-[hsl(var(--game-ink))]/20">T</span>
                </div>
                <div className="space-y-1.5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={`h-2 rounded-full bg-[hsl(var(--game-ink))]/5 ${i === 7 ? 'w-3/4' : 'w-full'}`} />
                  ))}
                </div>
                {/* Inline card breaking flow */}
                <div className="my-4 rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] p-3">
                  <div className="flex gap-3">
                    <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-[hsl(var(--game-cream-dark))]" />
                    <div className="flex-1">
                      <div className="h-2 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/8" />
                      <div className="mt-1 h-2 w-1/2 rounded-full bg-[hsl(var(--game-ink))]/5" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`b${i}`} className={`h-2 rounded-full bg-[hsl(var(--game-ink))]/5 ${i === 3 ? 'w-2/3' : 'w-full'}`} />
                  ))}
                </div>
              </div>

              {/* Right column with pull-quote */}
              <div>
                <div className="space-y-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`h-2 rounded-full bg-[hsl(var(--game-ink))]/5 ${i === 4 ? 'w-4/5' : 'w-full'}`} />
                  ))}
                </div>
                {/* Pull-quote */}
                <div className="my-5 border-l-[3px] border-[hsl(var(--game-ink))]/15 pl-4 py-2">
                  <div className="h-3 w-full rounded-full bg-[hsl(var(--game-ink))]/10" />
                  <div className="mt-1.5 h-3 w-4/5 rounded-full bg-[hsl(var(--game-ink))]/10" />
                  <div className="mt-2 h-2 w-1/3 rounded-full bg-[hsl(var(--game-ink))]/5" />
                </div>
                <div className="space-y-1.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={`c${i}`} className={`h-2 rounded-full bg-[hsl(var(--game-ink))]/5 ${i === 5 ? 'w-3/5' : 'w-full'}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Footnote bar */}
            <div className="mt-6 border-t border-dashed border-[hsl(var(--game-ink))]/10 pt-4">
              <div className="flex gap-6">
                <div className="h-1.5 w-20 rounded-full bg-[hsl(var(--game-ink))]/5" />
                <div className="h-1.5 w-32 rounded-full bg-[hsl(var(--game-ink))]/5" />
                <div className="h-1.5 w-24 rounded-full bg-[hsl(var(--game-ink))]/5" />
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────── */}
        {/* 15. Mosaic Collage Grid */}
        {/* ──────────────────────────────────────────── */}
        <section className="mt-20 pb-16">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">15</span>
            <h2 className="font-heading text-xl font-black text-[hsl(var(--game-ink))]">Mosaic Collage Grid</h2>
          </div>
          <p className="mt-1 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-light))]">
            Irregular grid with 8 cards of mixed sizes. CSS grid with named areas. Visual rhythm through size contrast.
          </p>
          <div className="mt-6 rounded-2xl border border-dashed border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] p-6">
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridTemplateRows: '180px 140px 180px',
                gridTemplateAreas: `
                  "a a b c"
                  "d e b f"
                  "d g g f"
                `,
              }}
            >
              <div className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]" style={{ gridArea: 'a' }}>
                <div className="h-full rounded-xl bg-[hsl(var(--game-cream-dark))]" />
              </div>
              <div className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]" style={{ gridArea: 'b' }}>
                <div className="h-3/4 rounded-xl bg-[hsl(var(--game-cream-dark))]" />
                <div className="mt-3 h-2.5 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/10" />
                <div className="mt-1.5 h-2 w-1/2 rounded-full bg-[hsl(var(--game-ink))]/5" />
              </div>
              <div className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]" style={{ gridArea: 'c' }}>
                <div className="h-full rounded-xl bg-[hsl(var(--game-cream-dark))]" />
              </div>
              <div className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]" style={{ gridArea: 'd' }}>
                <div className="h-full rounded-xl bg-[hsl(var(--game-ink))]/90" />
              </div>
              <div className="flex items-center justify-center rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]" style={{ gridArea: 'e' }}>
                <div className="text-center">
                  <div className="mx-auto h-3 w-16 rounded-full bg-[hsl(var(--game-ink))]/10" />
                  <div className="mx-auto mt-2 h-2 w-12 rounded-full bg-[hsl(var(--game-ink))]/5" />
                </div>
              </div>
              <div className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]" style={{ gridArea: 'f' }}>
                <div className="h-full rounded-xl bg-[hsl(var(--game-cream-dark))]" />
              </div>
              <div className="rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]" style={{ gridArea: 'g' }}>
                <div className="flex h-full gap-4">
                  <div className="flex-1 rounded-xl bg-[hsl(var(--game-cream-dark))]" />
                  <div className="flex flex-1 flex-col justify-center">
                    <div className="h-3 w-3/4 rounded-full bg-[hsl(var(--game-ink))]/10" />
                    <div className="mt-2 h-2 w-full rounded-full bg-[hsl(var(--game-ink))]/5" />
                    <div className="mt-1.5 h-2 w-5/6 rounded-full bg-[hsl(var(--game-ink))]/5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
