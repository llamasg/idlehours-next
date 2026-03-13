'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import GameTileCard from '@/components/GameTileCard'
import BrowseView from '@/components/games/BrowseView'
import { getAllGames } from '@/lib/queries'
import { useGameLightbox } from '@/context/GameLightboxContext'
import type { Game } from '@/types'

// ── Mask icon helper ─────────────────────────────────────────────────────────
function MaskIcon({ src, size = 16, className = '' }: { src: string; size?: number; className?: string }) {
  return (
    <span
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        width: size,
        height: size,
        WebkitMask: `url(${src}) no-repeat center / contain`,
        mask: `url(${src}) no-repeat center / contain`,
      }}
    />
  )
}

// ── FilterSelect — searchable dropdown ─────────────────────────────────────
interface FilterSelectProps {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
  icon?: string
}

function FilterSelect({ label, value, options, onChange, icon }: FilterSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); setQuery('') }}
        className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 font-heading text-sm text-foreground hover:bg-secondary transition-colors"
      >
        {icon && <MaskIcon src={icon} size={14} className="text-foreground" />}
        <span className="text-muted-foreground">{label}:</span>
        <span className={value === 'All' ? 'text-muted-foreground' : 'text-primary font-semibold'}>{value}</span>
        <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 w-48 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to filter..."
              className="w-full rounded-lg bg-muted/40 px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.map((o) => (
              <button
                key={o}
                onClick={() => { onChange(o); setOpen(false) }}
                className={`w-full px-3 py-2.5 text-left font-heading text-sm transition-colors hover:bg-secondary ${
                  o === value ? 'text-primary font-semibold bg-primary/5' : 'text-foreground'
                }`}
              >
                {o}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted-foreground">No matches</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── SortSelect — custom styled sort dropdown ────────────────────────────────
interface SortOption { label: string; value: string }
interface SortSelectProps {
  value: string
  options: SortOption[]
  onChange: (v: string) => void
}

function SortSelect({ value, options, onChange }: SortSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const current = options.find((o) => o.value === value)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 font-heading text-sm text-foreground hover:bg-secondary transition-colors"
      >
        <MaskIcon src="/images/icons/icon_refresh-reset-reload-filter-highlow-swap-change.svg" size={14} className="text-foreground" />
        <span className="text-muted-foreground">Sort:</span>
        <span className="text-primary font-semibold">{current?.label ?? value}</span>
        <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 w-60 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {options.map((o) => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false) }}
                className={`w-full px-3 py-2.5 text-left font-heading text-sm transition-colors hover:bg-secondary ${
                  o.value === value ? 'text-primary font-semibold bg-primary/5' : 'text-foreground'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── GameListCard — horizontal list-view card ────────────────────────────────
function GameListCard({ game }: { game: Game }) {
  const { openLightbox } = useGameLightbox()

  return (
    <div
      onClick={() => openLightbox(game)}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="grid gap-0 sm:grid-cols-[1.2fr_1fr]">
        {/* Cover image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-secondary sm:aspect-auto sm:min-h-[220px]">
          {game.coverImage ? (
            <img src={game.coverImage} alt={game.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
              <span className="font-heading text-muted-foreground">No image</span>
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="flex flex-col justify-center p-5 sm:p-6">
          <h3 className="font-heading text-xl font-bold text-foreground">
            {game.title}
          </h3>
          {/* Genre row with tag icon */}
          {(game.genre ?? []).length > 0 && (
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className="inline-block shrink-0 bg-current"
                style={{
                  width: 12, height: 12, color: '#4199f1',
                  WebkitMask: 'url(/images/icons/icon_tag-genre-filter.svg) no-repeat center / contain',
                  mask: 'url(/images/icons/icon_tag-genre-filter.svg) no-repeat center / contain',
                }}
              />
              <p className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {(game.genre ?? []).join(' · ')}
              </p>
            </div>
          )}
          {/* Badges row */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {game.openCriticScore != null && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 shadow"
                style={{ backgroundColor: game.openCriticScore >= 90 ? '#9333ea' : game.openCriticScore >= 75 ? '#22c55e' : game.openCriticScore >= 50 ? '#15803d' : '#3b82f6' }}
              >
                <span
                  className="inline-block shrink-0 bg-white"
                  style={{
                    width: 12, height: 12,
                    WebkitMask: 'url(/images/icons/icon_fire-hot-streak.svg) no-repeat center / contain',
                    mask: 'url(/images/icons/icon_fire-hot-streak.svg) no-repeat center / contain',
                  }}
                />
                <span className="font-heading text-xs font-bold text-white" style={{ letterSpacing: '0.05em' }}>
                  {game.openCriticScore}
                </span>
              </span>
            )}
            {game.difficulty != null && (() => {
              const labels = { 1: 'Easy', 2: 'Medium', 3: 'Hard' } as const
              const colors = { 1: 'bg-green-500/20 text-green-700', 2: 'bg-amber-500/20 text-amber-700', 3: 'bg-red-500/20 text-red-700' } as const
              return (
                <span className={`rounded-full px-2.5 py-0.5 font-heading text-[10px] font-semibold uppercase tracking-wider ${colors[game.difficulty]}`}>
                  {labels[game.difficulty]}
                </span>
              )
            })()}
            {game.coop && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 font-heading text-[10px] font-medium text-accent-green">
                <span
                  className="inline-block shrink-0 bg-current"
                  style={{
                    width: 10, height: 10,
                    WebkitMask: 'url(/images/icons/icon_friend-coop-co-op-together-companion-friendship.svg) no-repeat center / contain',
                    mask: 'url(/images/icons/icon_friend-coop-co-op-together-companion-friendship.svg) no-repeat center / contain',
                  }}
                />
                Co-op
              </span>
            )}
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {game.shortDescription}
          </p>
          {/* Platforms with icon */}
          {(game.platforms ?? []).length > 0 && (
            <div className="mt-2 flex items-center gap-1 text-muted-foreground">
              <span
                className="inline-block shrink-0 bg-current"
                style={{
                  width: 11, height: 11,
                  WebkitMask: 'url(/images/icons/icon_handheld-console-platform-gameboy-retro.svg) no-repeat center / contain',
                  mask: 'url(/images/icons/icon_handheld-console-platform-gameboy-retro.svg) no-repeat center / contain',
                }}
              />
              <span className="text-[11px] tracking-wide">{(game.platforms ?? []).join(' · ')}</span>
            </div>
          )}
          <span className="mt-3 text-[11px] font-heading font-semibold uppercase tracking-wider text-muted-foreground/50 transition-colors group-hover:text-primary">
            View Game
          </span>
        </div>
      </div>
    </div>
  )
}

export default function GamesPage({ initialLightboxSlug }: { initialLightboxSlug?: string }) {
  const [tab, setTab] = useState<'browse' | 'library'>('browse')
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('All')
  const [genre, setGenre] = useState('All')
  const [sort, setSort] = useState('score-desc')
  const [coopOnly, setCoopOnly] = useState(false)
  const [games, setGames] = useState<Game[]>([])
  const [gamesLoading, setGamesLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  // Restore view preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ih-library-view')
    if (saved === 'grid' || saved === 'list') setView(saved)
  }, [])

  function toggleView(v: 'grid' | 'list') {
    setView(v)
    localStorage.setItem('ih-library-view', v)
  }

  useEffect(() => {
    getAllGames()
      .then((data) => setGames(data ?? []))
      .catch(() => setGames([]))
      .finally(() => setGamesLoading(false))
  }, [])

  // Auto-open lightbox if initialLightboxSlug is provided (direct URL visit)
  const { openLightbox } = useGameLightbox()
  const initialSlugHandled = useRef(false)

  useEffect(() => {
    if (initialLightboxSlug && !initialSlugHandled.current && games.length > 0) {
      const match = games.find((g) => g.slug.current === initialLightboxSlug)
      if (match) {
        openLightbox(match)
        initialSlugHandled.current = true
      }
    }
  }, [initialLightboxSlug, games, openLightbox])

  const genreOptions = useMemo(() => {
    const all = new Set<string>()
    games.forEach((g) => (g.genre ?? []).forEach((gen) => all.add(gen)))
    return ['All', ...Array.from(all).sort()]
  }, [games])

  const filtered = useMemo(() => {
    let result = [...games]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.shortDescription.toLowerCase().includes(q) ||
          (g.tags ?? []).some((t) => t.toLowerCase().includes(q))
      )
    }

    // Platform
    if (platform !== 'All') {
      result = result.filter((g) => (g.platforms ?? []).includes(platform))
    }

    // Genre
    if (genre !== 'All') {
      result = result.filter((g) => (g.genre ?? []).includes(genre))
    }

    // Co-op
    if (coopOnly) {
      result = result.filter((g) => g.coop)
    }

    // Sort
    const nullLast = (a: number | null | undefined, b: number | null | undefined, dir: 1 | -1) => {
      if (a == null && b == null) return 0
      if (a == null) return 1
      if (b == null) return -1
      return (a - b) * dir
    }

    if (sort === 'score-desc') result.sort((a, b) => nullLast(b.openCriticScore, a.openCriticScore, 1))
    else if (sort === 'score-asc') result.sort((a, b) => nullLast(a.openCriticScore, b.openCriticScore, 1))
    else if (sort === 'diff-asc') result.sort((a, b) => nullLast(a.difficulty, b.difficulty, 1))
    else if (sort === 'diff-desc') result.sort((a, b) => nullLast(b.difficulty, a.difficulty, 1))
    else if (sort === 'price-asc') {
      result.sort((a, b) => {
        const pa = a.isFree ? 0 : (a.currentPrice ?? Infinity)
        const pb = b.isFree ? 0 : (b.currentPrice ?? Infinity)
        return pa - pb
      })
    } else if (sort === 'price-desc') {
      result.sort((a, b) => {
        const pa = a.isFree ? 0 : (a.currentPrice ?? -Infinity)
        const pb = b.isFree ? 0 : (b.currentPrice ?? -Infinity)
        return pb - pa
      })
    } else if (sort === 'date-desc') {
      result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    } else if (sort === 'date-asc') {
      result.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
    }

    return result
  }, [search, platform, genre, sort, coopOnly, games])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="relative" style={{ width: 36, height: 36 }}>
              <MaskIcon src="/images/icons/icon_Star-rating-highlight-feature-headericon-backgroundicon.svg" size={36} className="text-electric-blue absolute inset-0" />
              <span
                className="absolute inline-block shrink-0 bg-foreground"
                style={{
                  width: 16, height: 16,
                  top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  WebkitMask: 'url(/images/icons/icon_controller-gaming-ps5-xbox-joystick.svg) no-repeat center / contain',
                  mask: 'url(/images/icons/icon_controller-gaming-ps5-xbox-joystick.svg) no-repeat center / contain',
                }}
              />
            </div>
            <h1 className="font-heading text-3xl font-black uppercase tracking-widest text-foreground sm:text-4xl">
              Game Library
            </h1>
          </div>
          <p className="max-w-lg text-muted-foreground">
            Browse our curated collection of cozy games. Filter by platform, sort by cosiness, or just scroll and see what catches your eye.
          </p>
        </motion.div>

        {/* Tab toggle */}
        <div className="mb-8 inline-flex rounded-full border border-border bg-card p-1 gap-0.5">
          <button
            onClick={() => setTab('browse')}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-heading text-xs font-extrabold transition-all ${
              tab === 'browse'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            📖 Browse
          </button>
          <button
            onClick={() => setTab('library')}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-heading text-xs font-extrabold transition-all ${
              tab === 'library'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            ⊞ Library
          </button>
        </div>

        {tab === 'browse' && <BrowseView />}

        {tab === 'library' && (<>
        {/* Search + Filters */}
        <div className="mb-6 space-y-3">
          {/* Search bar */}
          <div className="relative max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 inline-block shrink-0 text-foreground bg-current" style={{ width: '16px', height: '16px', WebkitMask: 'url(/images/icons/icon_search-lookup-find.svg) no-repeat center / contain', mask: 'url(/images/icons/icon_search-lookup-find.svg) no-repeat center / contain' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search games, tags..."
              className="w-full rounded-full border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <span className="inline-block shrink-0 bg-current" style={{ width: '14px', height: '14px', WebkitMask: 'url(/images/icons/icon_sad-cancel-failure-leave-bad-negative.svg) no-repeat center / contain', mask: 'url(/images/icons/icon_sad-cancel-failure-leave-bad-negative.svg) no-repeat center / contain' }} />
              </button>
            )}
          </div>

          {/* Filters + Sort + View toggle — single row */}
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
              label="Platform"
              value={platform}
              options={['All', 'PC', 'Nintendo', 'PlayStation', 'Xbox', 'Mobile']}
              onChange={setPlatform}
              icon="/images/icons/icon_handheld-console-platform-gameboy-retro.svg"
            />
            <FilterSelect
              label="Genre"
              value={genre}
              options={genreOptions}
              onChange={setGenre}
              icon="/images/icons/icon_tag-genre-filter.svg"
            />
            <button
              onClick={() => setCoopOnly(!coopOnly)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 font-heading text-sm font-medium transition-colors ${
                coopOnly
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-card text-muted-foreground hover:bg-secondary'
              }`}
            >
              <MaskIcon src="/images/icons/icon_friend-coop-co-op-together-companion-friendship.svg" size={14} />
              Co-op only
            </button>
            <SortSelect
              value={sort}
              options={[
                { label: 'Score: High → Low', value: 'score-desc' },
                { label: 'Score: Low → High', value: 'score-asc' },
                { label: 'Difficulty: Beginner first', value: 'diff-asc' },
                { label: 'Difficulty: Experienced first', value: 'diff-desc' },
                { label: 'Price: Low → High', value: 'price-asc' },
                { label: 'Price: High → Low', value: 'price-desc' },
                { label: 'Release: Newest', value: 'date-desc' },
                { label: 'Release: Oldest', value: 'date-asc' },
              ]}
              onChange={setSort}
            />
            {/* View toggle — right-aligned */}
            <div className="ml-auto flex items-center gap-1 rounded-full border border-border bg-card p-1">
              <span className="pl-2 font-heading text-xs text-muted-foreground">View</span>
              <button
                onClick={() => toggleView('grid')}
                className={`rounded-full p-1.5 transition-colors ${view === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label="Grid view"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                  <rect x="1" y="1" width="6" height="6" rx="1" />
                  <rect x="9" y="1" width="6" height="6" rx="1" />
                  <rect x="1" y="9" width="6" height="6" rx="1" />
                  <rect x="9" y="9" width="6" height="6" rx="1" />
                </svg>
              </button>
              <button
                onClick={() => toggleView('list')}
                className={`rounded-full p-1.5 transition-colors ${view === 'list' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label="List view"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                  <rect x="1" y="1" width="14" height="3" rx="1" />
                  <rect x="1" y="6.5" width="14" height="3" rx="1" />
                  <rect x="1" y="12" width="14" height="3" rx="1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="mb-4 font-heading text-xs text-muted-foreground">
          {filtered.length} game{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Game grid / list */}
        {gamesLoading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-[360px] animate-pulse rounded-2xl bg-secondary" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          view === 'grid' ? (
            <motion.div layout className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((game) => (
                <motion.div key={game._id} layout transition={{ duration: 0.3 }}>
                  <GameTileCard game={game} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div layout className="mx-auto flex max-w-[860px] flex-col gap-5">
              {filtered.map((game) => (
                <motion.div key={game._id} layout transition={{ duration: 0.3 }}>
                  <GameListCard game={game} />
                </motion.div>
              ))}
            </motion.div>
          )
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card px-6 py-16 text-center">
            <p className="font-heading text-lg font-semibold text-foreground">No games found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search.</p>
          </div>
        )}
        </>)}
      </main>

      <SiteFooter />
    </div>
  )
}
