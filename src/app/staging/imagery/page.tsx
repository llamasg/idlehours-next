'use client'

import { useState } from 'react'
import Image from 'next/image'

/* ─── Shared helpers ──────────────────────────────────────────────── */

const sectionLabel = 'font-heading text-[9px] font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]'
const annotationStyle = 'mt-3 font-heading text-[12px] font-semibold italic leading-relaxed text-[hsl(var(--game-ink-light))]'
const cardBase = 'rounded-2xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))]'

const stipple: React.CSSProperties = {
  backgroundImage: 'radial-gradient(circle, rgba(26,26,20,0.07) 1px, transparent 1px)',
  backgroundSize: '10px 10px',
}

function SectionHeader({ num, title, annotation }: { num: string; title: string; annotation: string }) {
  return (
    <div className="mb-8">
      <p className={sectionLabel}>{num}</p>
      <h2 className="mt-1 font-heading text-[clamp(22px,3.5vw,32px)] font-black leading-tight tracking-tight text-[hsl(var(--game-ink))]">
        {title}
      </h2>
      <p className={annotationStyle}>{annotation}</p>
    </div>
  )
}

/* ─── 01. Polaroid Snapshots ──────────────────────────────────────── */

function PolaroidSnapshots() {
  const polaroids = [
    { src: '/images/animalcrossing.jpg', caption: 'Island mornings, golden light', rotate: '-2deg' },
    { src: '/images/ashorthike.jpg', caption: 'Summit bound, no rush', rotate: '3deg' },
    { src: '/images/coffeetalk.webp', caption: 'Late-night latte art', rotate: '-1deg' },
    { src: '/images/spiritfarer.jpg', caption: 'Sailing into the sunset', rotate: '2deg' },
  ]

  return (
    <section>
      <SectionHeader
        num="01"
        title="Polaroid Snapshots"
        annotation="Game screenshots styled as scattered polaroid prints. White border, thicker at the bottom for handwritten captions. Paper texture via subtle cream gradient."
      />
      <div className="flex flex-wrap items-start justify-center gap-8">
        {polaroids.map((p, i) => (
          <div
            key={i}
            className="rounded-sm bg-gradient-to-br from-white via-[hsl(var(--game-cream))] to-white p-3 pb-10 shadow-[0_4px_16px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.06)]"
            style={{ transform: `rotate(${p.rotate})`, maxWidth: 200 }}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={p.src}
                alt={p.caption}
                fill
                className="object-cover"
                sizes="200px"
              />
            </div>
            <p className="mt-3 font-heading text-[12px] font-semibold italic text-[hsl(var(--game-ink-mid))]">
              {p.caption}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── 02. Full-Width Break ────────────────────────────────────────── */

function FullWidthBreak() {
  return (
    <section>
      <SectionHeader
        num="02"
        title="Full-Width Break"
        annotation="An atmospheric image spanning the full viewport width. Gradient fades on top and bottom edges blend into the cream background, creating breathing room in long reads."
      />
      <div className="mx-auto max-w-xl">
        <p className="font-heading text-[14px] font-medium leading-relaxed text-[hsl(var(--game-ink-mid))]">
          There is something deeply comforting about games that let you take your time. No countdown, no pressure, just a
          world to exist in. The rain taps against the window of your cabin. A cat purrs on the rug. You water the tomatoes.
        </p>
      </div>

      <div
        className="relative my-8"
        style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-[hsl(var(--game-cream))] to-transparent" />
        <div className="relative h-[280px] w-full overflow-hidden">
          <Image
            src="/images/heroimage.jpg"
            alt="Atmospheric cosy gaming scene"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-[hsl(var(--game-cream))] to-transparent" />
      </div>

      <div className="mx-auto max-w-xl">
        <p className="font-heading text-[14px] font-medium leading-relaxed text-[hsl(var(--game-ink-mid))]">
          These are the games we celebrate at Idle Hours. Not for their mechanics or their graphics, but for the feeling
          they conjure. The slow warmth of a Sunday afternoon. A cup of tea going cold because you forgot it was there.
        </p>
      </div>
    </section>
  )
}

/* ─── 03. Folder / Envelope ───────────────────────────────────────── */

function FolderEnvelope() {
  const [open, setOpen] = useState(false)

  const images = [
    '/images/animalcrossing.jpg',
    '/images/ashorthike.jpg',
    '/images/coffeetalk.webp',
    '/images/spiritfarer.jpg',
    '/images/palia.png',
  ]

  const closedAngles = ['-6deg', '3deg', '-2deg', '5deg', '-3deg']
  const closedOffsets = ['0px, 0px', '8px, -4px', '-6px, 6px', '4px, 2px', '-4px, -2px']
  const fanOffsets = ['-140px, -20px', '-70px, 10px', '0px, -10px', '70px, 20px', '140px, -5px']
  const fanAngles = ['-10deg', '-4deg', '1deg', '6deg', '12deg']

  return (
    <section>
      <SectionHeader
        num="03"
        title="Folder / Envelope"
        annotation="A folder container with images peeking out. Click to fan them out in a scattered arrangement. The closed state hints at content; the open state reveals it."
      />
      <div className="flex justify-center">
        <div className="w-[360px]">
          <div
            className="relative cursor-pointer"
            onClick={() => setOpen(!open)}
          >
            {/* Tab */}
            <div className="relative z-20 ml-4 flex h-7 w-28 items-end rounded-t-lg bg-[hsl(var(--game-cream-dark))]" style={stipple}>
              <span className="px-3 pb-1 font-heading text-[9px] font-black uppercase tracking-[0.2em] text-[hsl(var(--game-ink-mid))]">
                Screenshots
              </span>
            </div>
            {/* Body */}
            <div className="relative -mt-px rounded-lg bg-[hsl(var(--game-cream-dark))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" style={stipple}>
              <div className="relative h-[200px]">
                {images.map((src, i) => (
                  <div
                    key={i}
                    className="absolute h-[130px] w-[100px] overflow-hidden rounded-md shadow-md"
                    style={{
                      transform: `translate(${open ? fanOffsets[i] : closedOffsets[i]}) rotate(${open ? fanAngles[i] : closedAngles[i]})`,
                      left: open ? '50%' : `${15 + i * 12}%`,
                      top: open ? '20px' : `${i * 8}px`,
                      marginLeft: open ? '-50px' : '0',
                      transition: 'all 0.5s cubic-bezier(0.34, 1.5, 0.64, 1)',
                      zIndex: i,
                    }}
                  >
                    <Image
                      src={src}
                      alt={`Screenshot ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-center font-heading text-[11px] font-bold text-[hsl(var(--game-ink-mid))]">
                {open ? 'Click to close' : 'Click to open'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── 04. Image + Type Editorial Pair ─────────────────────────────── */

function EditorialPair() {
  return (
    <section>
      <SectionHeader
        num="04"
        title="Image + Type Editorial Pair"
        annotation="Mueller-Brockmann split. Image and editorial type share the space as equals, neither decorating the other. Clean structural relationship."
      />
      <div className={`${cardBase} grid overflow-hidden md:grid-cols-[45%_1fr]`}>
        <div className="relative min-h-[360px]">
          <Image
            src="/images/genshin.jpg"
            alt="Genshin Impact landscape"
            fill
            className="rounded-l-2xl object-cover"
            sizes="(min-width: 768px) 45vw, 100vw"
          />
        </div>
        <div className="flex flex-col justify-center p-8 md:p-12">
          <p className={sectionLabel}>Review</p>
          <h3 className="mt-2 font-heading text-[24px] font-black leading-tight text-[hsl(var(--game-ink))]">
            The Quiet Architecture of Open Worlds
          </h3>
          <p className="mt-4 font-heading text-[14px] font-normal leading-relaxed text-[hsl(var(--game-ink-mid))]">
            What happens when a game asks nothing of you? When the only
            objective is to exist, gently, in a place that exists gently
            back? The best open worlds are not so much played as inhabited.
            They reward curiosity over conquest.
          </p>
          <blockquote className="mt-6 border-l-2 border-[hsl(var(--game-amber))] pl-4 font-heading text-[13px] font-semibold italic text-[hsl(var(--game-ink-mid))]">
            &ldquo;Speed is the enemy of noticing. These games teach us to pay attention again.&rdquo;
          </blockquote>
          <p className="mt-6 font-heading text-[12px] font-semibold text-[hsl(var(--game-ink-light))]">
            Words by Alfie Marsh
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─── 05. Gallery Strip ───────────────────────────────────────────── */

function GalleryStrip() {
  const images = [
    { src: '/images/animalcrossing.jpg', title: 'Animal Crossing' },
    { src: '/images/ashorthike.jpg', title: 'A Short Hike' },
    { src: '/images/coffeetalk.webp', title: 'Coffee Talk' },
    { src: '/images/genshin.jpg', title: 'Genshin Impact' },
    { src: '/images/palia.png', title: 'Palia' },
    { src: '/images/spiritfarer.jpg', title: 'Spiritfarer' },
    { src: '/images/unpacked.png', title: 'Unpacking' },
    { src: '/images/Stardew valley.png', title: 'Stardew Valley' },
  ]

  return (
    <section>
      <SectionHeader
        num="05"
        title="Gallery Strip"
        annotation="Horizontal scrolling strip of game screenshots with slight overlap. A tactile, physical feeling for browsing imagery. Peek of the next image draws the eye."
      />
      <div className="overflow-x-auto pb-4">
        <div className="flex items-start px-4" style={{ width: 'max-content' }}>
          {images.map((img, i) => (
            <div
              key={i}
              className="w-[280px] flex-shrink-0"
              style={{ marginLeft: i === 0 ? 0 : -16, zIndex: images.length - i }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div style={{ height: 200, width: 280, borderRadius: 12, overflow: 'hidden' }} className="shadow-md">
                <img
                  src={img.src}
                  alt={img.title}
                  style={{ display: 'block', width: 280, height: 200, objectFit: 'cover' }}
                />
              </div>
              <p className="mt-2 pl-1 font-heading text-[11px] font-extrabold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-mid))]">
                {img.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── 06. Image Reveal Mask ───────────────────────────────────────── */

function ImageRevealMask() {
  const masks = [
    {
      label: 'Circle',
      src: '/images/palia.png',
      clip: 'circle(28% at 50% 50%)',
      clipFull: 'circle(70% at 50% 50%)',
    },
    {
      label: 'Diamond',
      src: '/images/Stardew valley.png',
      clip: 'polygon(50% 20%, 80% 50%, 50% 80%, 20% 50%)',
      clipFull: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    },
    {
      label: 'Rounded Rect',
      src: '/images/unpacked.png',
      clip: 'inset(25% 25% 25% 25% round 12px)',
      clipFull: 'inset(0% 0% 0% 0% round 16px)',
    },
  ]

  return (
    <section>
      <SectionHeader
        num="06"
        title="Image Reveal Mask"
        annotation="Images hidden behind geometric clip-path masks. On hover the mask animates to reveal the full image. Circle, diamond, and rounded rectangle."
      />
      <div className="grid gap-8 sm:grid-cols-3">
        {masks.map((m, i) => (
          <div key={i} className="group text-center">
            <p className="mb-3 font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">
              {m.label}
            </p>
            <div
              className="relative mx-auto h-[200px] w-[180px] overflow-hidden"
              style={{
                clipPath: m.clip,
                transition: 'clip-path 400ms cubic-bezier(0.34, 1.5, 0.64, 1)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.clipPath = m.clipFull }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.clipPath = m.clip }}
            >
              <Image
                src={m.src}
                alt={m.label}
                fill
                className="object-cover"
                sizes="180px"
              />
            </div>
            <p className="mt-3 font-heading text-[9px] font-semibold uppercase text-[hsl(var(--game-ink-light))]">
              Hover to reveal
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── 07. Screenshot Comparison ───────────────────────────────────── */

function ScreenshotComparison() {
  const [split, setSplit] = useState(50)

  return (
    <section>
      <SectionHeader
        num="07"
        title="Screenshot Comparison"
        annotation="Before/after style slider with a draggable divider. Drag the amber handle to compare two scenes side by side."
      />
      <div className={`${cardBase} relative mx-auto max-w-xl overflow-hidden`}>
        <div className="relative h-[300px] w-full select-none">
          {/* Right image (full) */}
          <div className="absolute inset-0">
            <Image
              src="/images/cozylamp.webp"
              alt="Cosy lamp scene"
              fill
              className="object-cover"
              sizes="600px"
            />
          </div>
          {/* Left image (clipped) */}
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
          >
            <Image
              src="/images/cozydesksetup.png"
              alt="Cosy desk setup"
              fill
              className="object-cover"
              sizes="600px"
            />
          </div>
          {/* Divider line */}
          <div
            className="absolute inset-y-0 z-10 w-[2px] bg-[hsl(var(--game-ink))]"
            style={{ left: `${split}%`, transform: 'translateX(-1px)' }}
          >
            {/* Handle */}
            <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[hsl(var(--game-amber))] shadow-lg">
              <span className="font-heading text-[11px] font-black text-white select-none">&larr; &rarr;</span>
            </div>
          </div>
          {/* Range input overlay */}
          <input
            type="range"
            min={0}
            max={100}
            value={split}
            onChange={(e) => setSplit(Number(e.target.value))}
            className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
          />
          {/* Labels */}
          <span className="absolute left-3 top-3 z-10 rounded-md bg-[hsl(var(--game-ink))]/60 px-2 py-1 font-heading text-[10px] font-bold uppercase tracking-wide text-white">
            Desk Setup
          </span>
          <span className="absolute right-3 top-3 z-10 rounded-md bg-[hsl(var(--game-ink))]/60 px-2 py-1 font-heading text-[10px] font-bold uppercase tracking-wide text-white">
            Cosy Lamp
          </span>
        </div>
      </div>
    </section>
  )
}

/* ─── 08. Cover Art Grid ──────────────────────────────────────────── */

function CoverArtGrid() {
  const images = [
    '/images/animalcrossing.jpg',
    '/images/ashorthike.jpg',
    '/images/coffeetalk.webp',
    '/images/genshin.jpg',
    '/images/palia.png',
    '/images/spiritfarer.jpg',
    '/images/unpacked.png',
    '/images/Stardew valley.png',
    '/images/cozydesksetup.png',
    '/images/cozylamp.webp',
    '/images/headphones.webp',
    '/images/weightedblanket.webp',
  ]

  return (
    <section>
      <SectionHeader
        num="08"
        title="Cover Art Grid"
        annotation="Dense mosaic of game images used as visual texture. Each cell is desaturated by default; hover to pop to full colour and slight scale. Creates a wallpaper backdrop feel."
      />
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-4">
        {images.map((src, i) => (
          <div
            key={i}
            className="group relative h-[120px] overflow-hidden rounded-lg"
          >
            <Image
              src={src}
              alt={`Cover ${i + 1}`}
              fill
              className="object-cover grayscale-[0.7] transition-all duration-300 group-hover:scale-110 group-hover:grayscale-0"
              sizes="120px"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── 09. Character Showcase ──────────────────────────────────────── */

function CharacterShowcase() {
  const characters = [
    { src: '/images/ship_it_characters/hay billed - season pass.png', name: 'Hay Billed', role: 'Season Pass', rotate: '-2deg' },
    { src: '/images/ship_it_characters/Noel ife - crunch culture.png', name: 'Noel Ife', role: 'Crunch Culture', rotate: '1.5deg' },
    { src: '/images/ship_it_characters/Earl E. Access - early access.png', name: 'Earl E. Access', role: 'Early Access', rotate: '-1deg' },
  ]

  return (
    <section>
      <SectionHeader
        num="09"
        title="Character Showcase"
        annotation="Ship It character illustrations in circular frames with white border rings, like collectible icon stickers. Name and role below each."
      />
      <div className="flex flex-wrap items-start justify-center gap-12">
        {characters.map((c, i) => (
          <div
            key={i}
            className="flex flex-col items-center"
            style={{ transform: `rotate(${c.rotate})` }}
          >
            <div className="relative h-[120px] w-[120px] overflow-hidden rounded-full border-4 border-white shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
              <Image
                src={c.src}
                alt={c.name}
                fill
                className="object-cover"
                sizes="120px"
              />
            </div>
            <p className="mt-3 font-heading text-[11px] font-extrabold uppercase tracking-[0.15em] text-[hsl(var(--game-ink))]">
              {c.name}
            </p>
            <p className="font-heading text-[10px] font-semibold italic text-[hsl(var(--game-ink-light))]">
              {c.role}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── 10. Image as Texture ────────────────────────────────────────── */

function ImageAsTexture() {
  return (
    <section>
      <SectionHeader
        num="10"
        title="Image as Texture"
        annotation="A content card using a game screenshot as a subtle background texture. Low opacity and heavy blur create atmosphere without competing with the content layer."
      />
      <div className={`${cardBase} relative mx-auto max-w-md overflow-hidden p-8`}>
        {/* Background texture image — inline styles to guarantee filter application */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/genshin.jpg"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.15,
            filter: 'blur(30px) saturate(1.5)',
            transform: 'scale(1.15)',
          }}
        />
        {/* Content */}
        <div className="relative z-10">
          <p className={sectionLabel}>Featured</p>
          <h3 className="mt-2 font-heading text-xl font-black text-[hsl(var(--game-ink))]">
            Genshin Impact
          </h3>
          <p className="mt-3 font-heading text-[13px] font-medium leading-relaxed text-[hsl(var(--game-ink-mid))]">
            An open world that rewards wandering. Every hilltop reveals another valley, every valley hides a story.
            The world breathes with quiet intention.
          </p>
          <div className="mt-4 flex gap-2">
            {['Open World', 'Exploration', 'Adventure'].map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-[hsl(var(--game-cream-dark))] px-3 py-1 font-heading text-[10px] font-bold text-[hsl(var(--game-ink-mid))]"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── 11. Stamp Collection ────────────────────────────────────────── */

function StampCollection() {
  const stamps = [
    { src: '/images/animalcrossing.jpg', rotate: '-2deg' },
    { src: '/images/ashorthike.jpg', rotate: '1.5deg' },
    { src: '/images/coffeetalk.webp', rotate: '-1deg' },
    { src: '/images/spiritfarer.jpg', rotate: '2deg' },
    { src: '/images/palia.png', rotate: '-1.5deg' },
    { src: '/images/Stardew valley.png', rotate: '1deg' },
  ]

  const perfBorder: React.CSSProperties = {
    backgroundImage: [
      'radial-gradient(circle, hsl(var(--game-cream)) 3px, transparent 3px)',
      'radial-gradient(circle, hsl(var(--game-cream)) 3px, transparent 3px)',
      'radial-gradient(circle, hsl(var(--game-cream)) 3px, transparent 3px)',
      'radial-gradient(circle, hsl(var(--game-cream)) 3px, transparent 3px)',
    ].join(', '),
    backgroundSize: '10px 6px, 10px 6px, 6px 10px, 6px 10px',
    backgroundPosition: 'top center, bottom center, left center, right center',
    backgroundRepeat: 'repeat-x, repeat-x, repeat-y, repeat-y',
  }

  return (
    <section>
      <SectionHeader
        num="11"
        title="Stamp Collection"
        annotation="Game screenshots presented as collectible postage stamps. Perforated edges via radial-gradient cutouts, inset shadow, and 'IDLE HOURS' watermark text."
      />
      <div className="grid grid-cols-3 gap-5 sm:grid-cols-3">
        {stamps.map((s, i) => (
          <div
            key={i}
            className="flex justify-center"
          >
            <div
              className="relative"
              style={{ transform: `rotate(${s.rotate})`, padding: 5, ...perfBorder }}
            >
              <div className="relative overflow-hidden border border-[hsl(var(--game-ink))]/20 p-1.5 shadow-[inset_0_1px_4px_rgba(0,0,0,0.1)]">
                <div className="relative h-[110px] w-[90px]">
                  <Image
                    src={s.src}
                    alt={`Stamp ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="90px"
                  />
                </div>
                {/* Watermark */}
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap font-heading text-[7px] font-black uppercase tracking-[0.3em] text-white/50">
                  Idle Hours
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── 12. Lightbox Overlay ────────────────────────────────────────── */

function LightboxOverlay() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  const gallery = [
    { src: '/images/animalcrossing.jpg', title: 'Animal Crossing: New Horizons', caption: 'Island life, one day at a time.' },
    { src: '/images/ashorthike.jpg', title: 'A Short Hike', caption: 'Every trail leads somewhere worth going.' },
    { src: '/images/coffeetalk.webp', title: 'Coffee Talk', caption: 'Stories brewed one cup at a time.' },
    { src: '/images/spiritfarer.jpg', title: 'Spiritfarer', caption: 'Learning to say goodbye, gently.' },
    { src: '/images/genshin.jpg', title: 'Genshin Impact', caption: 'A world that rewards wandering.' },
    { src: '/images/palia.png', title: 'Palia', caption: 'Community farming at its cosiest.' },
  ]

  const active = activeIdx !== null ? gallery[activeIdx] : null

  return (
    <section>
      <SectionHeader
        num="12"
        title="Lightbox Overlay"
        annotation="Click any thumbnail to open a full-screen image viewer with caption, title, and keyboard navigation. Escape or click the backdrop to close. Arrow keys to browse."
      />
      {/* Thumbnail grid */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {gallery.map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className="group relative aspect-square overflow-hidden rounded-xl border-[1.5px] border-transparent transition-all hover:border-[hsl(var(--game-amber))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--game-amber))]/40"
            style={{ transition: 'border-color 0.15s ease, transform 0.2s cubic-bezier(0.34,1.5,0.64,1)' }}
          >
            <Image
              src={img.src}
              alt={img.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="120px"
            />
          </button>
        ))}
      </div>

      {/* Lightbox overlay */}
      {active && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[hsl(var(--game-ink))]/90 backdrop-blur-sm"
          onClick={() => setActiveIdx(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setActiveIdx(null)
            if (e.key === 'ArrowRight' && activeIdx !== null) setActiveIdx((activeIdx + 1) % gallery.length)
            if (e.key === 'ArrowLeft' && activeIdx !== null) setActiveIdx((activeIdx - 1 + gallery.length) % gallery.length)
          }}
          tabIndex={0}
          role="dialog"
          ref={(el) => el?.focus()}
        >
          <div
            className="relative mx-4 max-h-[85vh] max-w-3xl overflow-hidden rounded-2xl bg-[hsl(var(--game-white))] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative aspect-[16/10] w-full min-w-[300px] sm:min-w-[500px]">
              <Image
                src={active.src}
                alt={active.title}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 768px, 100vw"
              />
            </div>

            {/* Caption bar */}
            <div className="flex items-start justify-between gap-4 p-5">
              <div>
                <h3 className="font-heading text-[16px] font-black text-[hsl(var(--game-ink))]">
                  {active.title}
                </h3>
                <p className="mt-1 font-heading text-[13px] font-semibold italic text-[hsl(var(--game-ink-mid))]">
                  {active.caption}
                </p>
              </div>
              <span className="flex-shrink-0 rounded-full bg-[hsl(var(--game-cream))] px-3 py-1 font-heading text-[10px] font-bold text-[hsl(var(--game-ink-light))]">
                {(activeIdx ?? 0) + 1} / {gallery.length}
              </span>
            </div>

            {/* Navigation arrows */}
            <button
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[hsl(var(--game-ink))]/60 font-heading text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-[hsl(var(--game-ink))]/80"
              onClick={(e) => { e.stopPropagation(); setActiveIdx(((activeIdx ?? 0) - 1 + gallery.length) % gallery.length) }}
            >
              ←
            </button>
            <button
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[hsl(var(--game-ink))]/60 font-heading text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-[hsl(var(--game-ink))]/80"
              onClick={(e) => { e.stopPropagation(); setActiveIdx(((activeIdx ?? 0) + 1) % gallery.length) }}
            >
              →
            </button>

            {/* Close button */}
            <button
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--game-ink))]/60 font-heading text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-[hsl(var(--game-ink))]/80"
              onClick={() => setActiveIdx(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

/* ─── Page ────────────────────────────────────────────────────────── */

export default function ImageryPage() {
  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        {/* Hero */}
        <p className={sectionLabel}>Page 03 of 06</p>
        <h1 className="mt-2 font-heading text-[clamp(36px,6vw,56px)] font-black leading-[0.95] tracking-tight text-[hsl(var(--game-ink))]">
          Imagery
        </h1>
        <p className="mt-4 max-w-lg font-heading text-[15px] font-semibold italic text-[hsl(var(--game-ink-mid))]">
          How images, illustrations, and visual content integrate with the Idle Hours design system. Polaroids, masks,
          galleries, and textures.
        </p>

        <div className="mt-16 space-y-24">
          <PolaroidSnapshots />
          <FullWidthBreak />
          <FolderEnvelope />
          <EditorialPair />
          <GalleryStrip />
          <ImageRevealMask />
          <ScreenshotComparison />
          <CoverArtGrid />
          <CharacterShowcase />
          <ImageAsTexture />
          <StampCollection />
          <LightboxOverlay />
        </div>

        {/* Footer */}
        <div className="mt-24 border-t border-[hsl(var(--game-ink))]/10 pt-8 text-center">
          <p className="font-heading text-[11px] font-bold text-[hsl(var(--game-ink-light))]">
            Imagery concepts complete. 12 of 12.
          </p>
        </div>
      </div>
    </main>
  )
}
