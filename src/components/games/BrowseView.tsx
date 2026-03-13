'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getGameLibrary } from '@/lib/queries'
import GameTileCard from '@/components/GameTileCard'
import FeaturedBanner from '@/components/FeaturedBanner'
import StickyNote from '@/components/StickyNote'
import PullQuote from '@/components/PullQuote'
import { useGameLightbox } from '@/context/GameLightboxContext'
import type { Game } from '@/types'

// Types matching GROQ response
interface CuratedRowGame {
  isStaffPick: boolean
  game: Game
}

interface CuratedRowSection {
  _key: string
  _type: 'curatedRow'
  title: string
  rowStyle?: 'cards' | 'list'
  games: CuratedRowGame[]
  noteEnabled: boolean
  noteStyle: 'simple' | 'recipe' | 'pullQuote'
  noteContent: any[]
  noteAuthor?: string
}

interface FeatureBannerSection {
  _key: string
  _type: 'featureBanner'
  headline: string
  subtitle?: string
  linkedPost?: { _id: string; title: string; slug: { current: string } }
  buttonLabel?: string
}

type Section = CuratedRowSection | FeatureBannerSection

interface GameLibraryData {
  featuredPick?: {
    game: Game
    eyebrow: string
    quote?: string
  }
  sections?: Section[]
}

// Parse *italic* from row titles
function parseTitle(raw: string): React.ReactNode {
  const parts = raw.split(/\*([^*]+)\*/)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <em key={i} className="font-semibold italic text-muted-foreground">{part}</em>
    ) : (
      part
    )
  )
}

// Draggable scroll row with arrow buttons
// Distinguishes drag from click: if pointer moves >5px it's a drag, otherwise it's a click
function ScrollRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const isDragging = useRef(false)
  const hasMoved = useRef(false)
  const startX = useRef(0)
  const scrollLeftStart = useRef(0)

  const checkScroll = useCallback(() => {
    const el = ref.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      ro.disconnect()
    }
  }, [checkScroll])

  // Prevent native image drag so pointer capture works on images
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const prevent = (e: DragEvent) => e.preventDefault()
    el.addEventListener('dragstart', prevent)
    return () => el.removeEventListener('dragstart', prevent)
  }, [])

  const scroll = (dir: -1 | 1) => {
    ref.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }

  const onPointerDown = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    isDragging.current = true
    hasMoved.current = false
    startX.current = e.clientX
    scrollLeftStart.current = el.scrollLeft
    el.style.cursor = 'grabbing'
    el.style.scrollSnapType = 'none'
    el.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !ref.current) return
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > 5) hasMoved.current = true
    ref.current.scrollLeft = scrollLeftStart.current - dx
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    isDragging.current = false
    const el = ref.current
    if (!el) return
    el.style.cursor = ''
    el.style.scrollSnapType = ''
    el.releasePointerCapture(e.pointerId)
  }

  // Block click events that follow a drag so cards don't open lightbox
  const onClickCapture = (e: React.MouseEvent) => {
    if (hasMoved.current) {
      e.stopPropagation()
      e.preventDefault()
    }
  }

  return (
    <div className="group/row relative">
      {/* Left arrow */}
      <button
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        className={`absolute -left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-card shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95 ${canScrollLeft ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>

      {/* Scrollable track — py-3 gives shadow breathing room */}
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        className="scrollbar-hide -mx-4 flex cursor-grab gap-5 overflow-x-auto px-4 py-3 snap-x snap-mandatory select-none sm:snap-none"
      >
        {children}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        className={`absolute -right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-card shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95 ${canScrollRight ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  )
}

// Difficulty label config
const DIFF_LABEL: Record<number, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }

// Staff pick card — full-height variant matching row tiles
function StaffPickCard({ game }: { game: Game }) {
  const { openLightbox } = useGameLightbox()
  const tags = [...(game.genre ?? []), ...(game.tags ?? [])].slice(0, 2)

  return (
    <div
      className="flex flex-shrink-0 cursor-pointer items-stretch gap-0 snap-start"
      style={{ width: 420 }}
      onClick={() => openLightbox(game)}
    >
      {/* Cover — full row height */}
      <div className="w-[190px] flex-shrink-0 overflow-hidden rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
        {game.coverImage ? (
          <img src={game.coverImage} alt={game.title} className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-xs text-muted-foreground">Cover</div>
        )}
      </div>
      {/* Stipple note — stretches to match */}
      <div
        className="relative ml-3 flex flex-1 flex-col justify-center rounded-xl p-4 shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
        style={{
          backgroundColor: 'hsl(45 33% 93%)',
          backgroundImage: 'radial-gradient(circle, rgba(26,26,20,0.06) 1px, transparent 1px)',
          backgroundSize: '10px 10px',
          transform: 'rotate(0.8deg)',
        }}
      >
        <div
          className="absolute -left-2 top-6 h-0 w-0"
          style={{
            borderStyle: 'solid',
            borderWidth: '7px 8px 7px 0',
            borderColor: 'transparent hsl(45 33% 93%) transparent transparent',
          }}
        />
        <p className="mb-1.5 font-heading text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">Staff pick</p>
        <p className="mb-1 font-heading text-[17px] font-black leading-tight text-foreground">{game.title}</p>
        <p className="text-[12px] font-semibold italic text-muted-foreground">{(game.platforms ?? []).join(' · ')}</p>

        <hr className="my-2 border-dashed border-border" />

        {/* Stats grid */}
        <div className="space-y-1.5">
          {game.openCriticScore != null && (
            <div className="flex justify-between">
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">OpenCritic</span>
              <span className="font-heading text-sm font-black text-foreground">{game.openCriticScore}</span>
            </div>
          )}
          {game.difficulty != null && (
            <div className="flex justify-between">
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Difficulty</span>
              <span className="font-heading text-[12px] font-bold text-foreground">{DIFF_LABEL[game.difficulty] ?? '—'}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((t) => (
              <span key={t} className="rounded-full bg-foreground/8 px-2 py-0.5 font-heading text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Ranked list — numbered rows with score circles + sticky notes on the side
function RankedList({ row }: { row: CuratedRowSection }) {
  const { openLightbox } = useGameLightbox()
  const hasNotes = row.noteEnabled && row.noteContent

  return (
    <div className="flex gap-6">
      {/* List card */}
      <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        {(row.games ?? []).map((entry, i) => {
          if (!entry.game) return null
          const game = entry.game
          return (
            <div
              key={game._id}
              onClick={() => openLightbox(game)}
              className={`group flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-secondary/50 ${i > 0 ? 'border-t border-dashed border-border/50' : ''}`}
            >
              {/* Rank number */}
              <span className="flex-shrink-0 font-heading text-[32px] font-black leading-none text-foreground/15">
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Title + description */}
              <div className="min-w-0 flex-1">
                <p className="font-heading text-[15px] font-black leading-snug text-foreground group-hover:text-primary transition-colors">
                  {game.title}
                </p>
                {game.shortDescription && (
                  <p className="mt-0.5 text-[12px] font-medium italic text-muted-foreground line-clamp-1">
                    {game.shortDescription}
                  </p>
                )}
              </div>

              {/* Score circle */}
              {game.openCriticScore != null && (
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                  <span className="font-heading text-[15px] font-black text-foreground">
                    {game.openCriticScore}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sticky notes column */}
      {hasNotes && (
        <div className="hidden w-[240px] flex-shrink-0 space-y-4 lg:block">
          {row.noteStyle === 'pullQuote' ? (
            <PullQuote
              text={row.noteContent?.[0]?.children?.[0]?.text ?? ''}
              author={row.noteAuthor ?? 'Idle Hours'}
            />
          ) : (
            <StickyNote content={row.noteContent} rotate={1.2} />
          )}
        </div>
      )}
    </div>
  )
}

export default function BrowseView() {
  const [data, setData] = useState<GameLibraryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGameLibrary()
      .then((d: GameLibraryData) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-[300px] animate-pulse rounded-[20px] bg-secondary" />
        <div className="h-[200px] animate-pulse rounded-2xl bg-secondary" />
        <div className="h-[200px] animate-pulse rounded-2xl bg-secondary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card px-6 py-16 text-center">
        <p className="font-heading text-lg font-semibold text-foreground">Browse content coming soon</p>
        <p className="mt-1 text-sm text-muted-foreground">Switch to Library to browse all games.</p>
      </div>
    )
  }

  return (
    <div className="space-y-14">
      {data.featuredPick?.game && (
        <FeaturedBanner
          game={data.featuredPick.game}
          eyebrow={data.featuredPick.eyebrow ?? "This week's pick"}
          quote={data.featuredPick.quote}
        />
      )}

      {(data.sections ?? []).map((section) => {
        if (section._type === 'curatedRow') {
          const row = section as CuratedRowSection
          return (
            <div key={row._key}>
              <h2 className="mb-5 font-heading text-[22px] font-black tracking-tight text-foreground">
                {parseTitle(row.title)}
              </h2>
              {row.rowStyle === 'list' ? (
                <RankedList row={row} />
              ) : (
                <ScrollRow>
                  {(row.games ?? []).map((entry, i) => {
                    if (entry.isStaffPick && entry.game) {
                      return <StaffPickCard key={`pick-${i}`} game={entry.game} />
                    }
                    if (!entry.game) return null
                    return (
                      <div key={entry.game._id} className="w-[260px] flex-shrink-0 snap-start">
                        <GameTileCard game={entry.game} />
                      </div>
                    )
                  })}
                  {row.noteEnabled && row.noteStyle === 'pullQuote' && row.noteContent && (
                    <div className="flex-shrink-0 self-center snap-start" style={{ width: 280 }}>
                      <PullQuote
                        text={row.noteContent?.[0]?.children?.[0]?.text ?? ''}
                        author={row.noteAuthor ?? 'Idle Hours'}
                      />
                    </div>
                  )}
                  {row.noteEnabled && row.noteStyle !== 'pullQuote' && row.noteContent && (
                    <div className="flex-shrink-0 self-center snap-start" style={{ width: 220 }}>
                      <StickyNote content={row.noteContent} rotate={1.5} />
                    </div>
                  )}
                </ScrollRow>
              )}
            </div>
          )
        }

        if (section._type === 'featureBanner') {
          const banner = section as FeatureBannerSection
          return (
            <div
              key={banner._key}
              className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-foreground p-8 sm:flex-row sm:items-center"
            >
              <div>
                <h3 className="font-heading text-2xl font-black tracking-tight text-background">
                  {parseTitle(banner.headline)}
                </h3>
                {banner.subtitle && (
                  <p className="mt-1 text-sm font-semibold italic text-background/45">
                    {banner.subtitle}
                  </p>
                )}
              </div>
              {banner.linkedPost && (
                <a
                  href={`/${banner.linkedPost.slug.current}`}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-white/7 px-5 py-3 font-heading text-sm font-extrabold text-background transition-all hover:border-white/30 hover:bg-white/14"
                >
                  {banner.buttonLabel ?? 'Read more \u2192'}
                </a>
              )}
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
