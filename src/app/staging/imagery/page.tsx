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
          <EditorialPair />
          <ScreenshotComparison />
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
