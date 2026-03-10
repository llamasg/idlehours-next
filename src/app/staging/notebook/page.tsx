'use client'

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
        {/* ─── 04. Recipe Card Style ─── */}
        <section className="py-16">
          <Label num="04" title="Recipe Card Style" annotation="A game 'recipe' card structured like a cooking recipe. Header, ingredients list, numbered method, dashed dividers, dog-ear fold." />
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

        {/* ─── 05. Sticker Tab Collection ─── */}
        <section className="py-16">
          <Label num="05" title="Sticker Tab Collection" annotation="All sticker tab variants in a curated arrangement. Tabs overlapping a card edge, and cascading tabs along the side like file folder tabs." />
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

        {/* ─── 06. Icon Grid on Stipple ─── */}
        <section className="py-16">
          <Label num="06" title="Icon Grid on Stipple" annotation="A sticker sheet: 4x3 grid of icon stickers on a stipple surface. Various sizes, tilts, and colour tints. Feels like something you'd peel from." />
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

        {/* ─── 07. Pinboard with Sticky Notes ─── */}
        <section className="py-16">
          <Label num="07" title="Pinboard with Sticky Notes" annotation="Cork texture background with scattered sticky notes at different rotations. Each note has a coloured pin, label, title, and signature. Folded corner via border trick." />
          <div className="px-8 py-10">
            <div
              className="relative mx-auto w-full max-w-3xl rounded-2xl p-12"
              style={{
                backgroundColor: '#D4B896',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='20' height='20' fill='none'/%3E%3Cline x1='0' y1='20' x2='20' y2='20' stroke='rgba(0,0,0,0.06)' stroke-width='0.5'/%3E%3Cline x1='20' y1='0' x2='20' y2='20' stroke='rgba(0,0,0,0.06)' stroke-width='0.5'/%3E%3C/svg%3E")`,
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15), 0 4px 14px rgba(0,0,0,0.1)',
              }}
            >
              <div className="flex flex-wrap items-start justify-center gap-10">
                {/* Note 1 — default stipple bg */}
                <div className="relative" style={{ transform: 'rotate(-2deg)', width: 220 }}>
                  {/* Pin */}
                  <div className="absolute -top-3 left-1/2 z-30 h-6 w-6 -translate-x-1/2 rounded-full bg-[hsl(var(--game-red))] shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                  <div
                    className="relative overflow-hidden rounded-sm p-5 pt-6"
                    style={{
                      ...stippleStyle,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                      borderRadius: '4px 16px 16px 16px',
                    }}
                  >
                    {/* Folded corner */}
                    <div className="absolute right-0 bottom-0" style={{ width: 0, height: 0, borderRight: '18px solid #D4B896', borderTop: '18px solid transparent' }} />
                    <div className="absolute right-0 bottom-0" style={{ width: 18, height: 18, background: 'rgba(0,0,0,0.06)', clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
                    <NoteLabel>Staff Pick</NoteLabel>
                    <NoteTitle className="mt-1">Hollow Knight</NoteTitle>
                    <NoteBody className="mt-2">A haunting descent into the depths of Hallownest.</NoteBody>
                    <p className="mt-3 font-heading text-[10px] font-bold italic text-[hsl(var(--game-ink-dim))]">— Team IH</p>
                  </div>
                </div>

                {/* Note 2 — yellow tint */}
                <div className="relative" style={{ transform: 'rotate(1.5deg)', width: 220 }}>
                  <div className="absolute -top-3 left-1/2 z-30 h-6 w-6 -translate-x-1/2 rounded-full bg-[hsl(var(--game-blue))] shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                  <div
                    className="relative overflow-hidden rounded-sm p-5 pt-6"
                    style={{
                      backgroundColor: '#FFF9E6',
                      backgroundImage: 'radial-gradient(circle, rgba(26,26,20,0.05) 1px, transparent 1px)',
                      backgroundSize: '10px 10px',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                      borderRadius: '4px 16px 16px 16px',
                    }}
                  >
                    <div className="absolute right-0 bottom-0" style={{ width: 0, height: 0, borderRight: '18px solid #D4B896', borderTop: '18px solid transparent' }} />
                    <div className="absolute right-0 bottom-0" style={{ width: 18, height: 18, background: 'rgba(0,0,0,0.06)', clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
                    <NoteLabel>Now Playing</NoteLabel>
                    <NoteTitle className="mt-1">Celeste</NoteTitle>
                    <NoteBody className="mt-2">Precision platforming with a story that stays with you.</NoteBody>
                    <p className="mt-3 font-heading text-[10px] font-bold italic text-[hsl(var(--game-ink-dim))]">— Alfie</p>
                  </div>
                </div>

                {/* Note 3 — green tint */}
                <div className="relative" style={{ transform: 'rotate(-1deg)', width: 220 }}>
                  <div className="absolute -top-3 left-1/2 z-30 h-6 w-6 -translate-x-1/2 rounded-full bg-[hsl(var(--game-amber))] shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                  <div
                    className="relative overflow-hidden rounded-sm p-5 pt-6"
                    style={{
                      backgroundColor: '#E8F5EC',
                      backgroundImage: 'radial-gradient(circle, rgba(26,26,20,0.05) 1px, transparent 1px)',
                      backgroundSize: '10px 10px',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                      borderRadius: '4px 16px 16px 16px',
                    }}
                  >
                    <div className="absolute right-0 bottom-0" style={{ width: 0, height: 0, borderRight: '18px solid #D4B896', borderTop: '18px solid transparent' }} />
                    <div className="absolute right-0 bottom-0" style={{ width: 18, height: 18, background: 'rgba(0,0,0,0.06)', clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
                    <NoteLabel>Completed</NoteLabel>
                    <NoteTitle className="mt-1">Outer Wilds</NoteTitle>
                    <NoteBody className="mt-2">Every discovery feels earned. A masterpiece of curiosity.</NoteBody>
                    <p className="mt-3 font-heading text-[10px] font-bold italic text-[hsl(var(--game-ink-dim))]">— Guest</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 08. Spiral Notebook ─── */}
        <section className="py-16">
          <Label num="08" title="Spiral Notebook" annotation="Left binding with coil circles, right side ruled paper with blue lines. Title with red underline. Bullet point design notes." />
          <div className="px-8 py-10">
            <div
              className="mx-auto flex w-full max-w-lg overflow-hidden rounded-2xl"
              style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)' }}
            >
              {/* Left binding */}
              <div className="relative flex w-10 flex-shrink-0 flex-col items-center justify-center gap-3 bg-[hsl(var(--game-ink))]" style={{ padding: '24px 0' }}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-5 w-5 rounded-full border-2 border-[hsl(var(--game-cream-dark))] bg-[hsl(var(--game-ink))]" />
                ))}
              </div>
              {/* Right ruled page */}
              <div
                className="flex-1 p-8"
                style={{
                  backgroundColor: '#fff',
                  backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(59,130,246,0.12) 27px, rgba(59,130,246,0.12) 28px)',
                }}
              >
                <h3
                  className="font-heading text-[18px] font-black text-[hsl(var(--game-ink))]"
                  style={{ borderBottom: '2px solid hsl(var(--game-red))', paddingBottom: 4, display: 'inline-block' }}
                >
                  Design Notes
                </h3>
                <div className="mt-5 space-y-3">
                  {[
                    'Everything tilts. Nothing is perfectly straight.',
                    'The cream is never pure white — always warm.',
                    'Stipple texture adds tactile depth to flat surfaces.',
                    'Dog-ear folds signal that content is tangible.',
                    'Sticker tabs feel like real-world organisation.',
                  ].map((note, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 font-heading text-[11px] text-[hsl(var(--game-amber))]">&bull;</span>
                      <p className="font-heading text-[12px] font-semibold leading-relaxed text-[hsl(var(--game-ink-mid))]">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 09. Stipple Stat Card ─── */}
        <section className="py-16">
          <Label num="09" title="Stipple Stat Card" annotation="Three-column stat card with stipple background. Amber eyebrow label, bold stat numbers, and subtle colour accents for streak and points." />
          <div className="px-8 py-10">
            <div
              className="mx-auto w-full max-w-md rounded-2xl p-6"
              style={{
                ...stippleStyle,
                boxShadow: '0 4px 14px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              <p className="font-heading text-[9px] font-black uppercase tracking-[0.22em] text-[hsl(var(--game-amber))]">
                Your stats today
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                {/* Games */}
                <div className="text-center">
                  <span className="block font-heading text-[32px] font-black leading-none text-[hsl(var(--game-ink))]">3</span>
                  <span className="mt-1 block font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-mid))]">Games</span>
                </div>
                {/* Streak */}
                <div className="text-center">
                  <span className="block font-heading text-[32px] font-black leading-none text-[hsl(var(--game-amber))]">7</span>
                  <span className="mt-1 block font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-mid))]">Streak</span>
                </div>
                {/* Points */}
                <div className="text-center">
                  <span className="block font-heading text-[32px] font-black leading-none text-[hsl(var(--game-blue))]">1,240</span>
                  <span className="mt-1 block font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-mid))]">Points</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 10. The Rules Block ─── */}
        <section className="py-16">
          <Label num="10" title="The Rules Block" annotation="Large stipple card with design rules in a two-column grid. Title with red underline. The visual manifesto for Idle Hours aesthetic." />
          <div className="px-8 py-10">
            <div
              className="mx-auto w-full max-w-2xl rounded-2xl p-8"
              style={{
                ...stippleDarkStyle,
                boxShadow: '0 4px 14px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              <h3
                className="font-heading text-[20px] font-black text-[hsl(var(--game-ink))]"
                style={{ borderBottom: '2px solid hsl(var(--game-red))', paddingBottom: 6, display: 'inline-block' }}
              >
                Making It Feel Made
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                {[
                  'Everything tilts. Nothing is straight.',
                  'The cream is never pure white.',
                  'Stripe texture is energy. Use it once per screen, for Blitz.',
                  'Stipple means surface. Cork, paper, cardboard.',
                  'Dog-ears mean the content is a thing you can hold.',
                  'Amber is warmth. Blue is trust. Red is danger or emphasis.',
                  'Body copy is always italic, 600 weight, ink-light.',
                  'Labels are 9px, black weight, uppercase, tracked wide.',
                  'Spring easing for interactions. Ease for scroll.',
                  'UK English always. Contractions mandatory.',
                ].map((rule, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--game-amber))]/10 font-heading text-[9px] font-black text-[hsl(var(--game-amber))]">
                      {i + 1}
                    </span>
                    <p className="font-heading text-[12px] font-semibold leading-relaxed text-[hsl(var(--game-ink-mid))]">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
