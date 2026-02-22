'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import GameTileCard from '@/components/GameTileCard'
import { getAllGames } from '@/lib/queries'
import type { Game } from '@/types'

// ── FilterSelect — searchable dropdown ─────────────────────────────────────
interface FilterSelectProps {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
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
              className="w-full rounded-lg bg-muted/40 px-2 py-1.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
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

export default function GamesPage() {
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('All')
  const [genre, setGenre] = useState('All')
  const [sort, setSort] = useState('score-desc')
  const [coopOnly, setCoopOnly] = useState(false)
  const [games, setGames] = useState<Game[]>([])
  const [gamesLoading, setGamesLoading] = useState(true)

  useEffect(() => {
    getAllGames()
      .then((data) => setGames(data ?? []))
      .catch(() => setGames([]))
      .finally(() => setGamesLoading(false))
  }, [])

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
    else if (sort === 'replay-desc') result.sort((a, b) => nullLast(b.replayability, a.replayability, 1))
    else if (sort === 'replay-asc') result.sort((a, b) => nullLast(a.replayability, b.replayability, 1))
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
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Game Library
          </h1>
          <p className="mt-2 max-w-lg text-muted-foreground">
            Browse our curated collection of cozy games. Filter by platform, sort by cosiness, or just scroll and see what catches your eye.
          </p>
        </motion.div>

        {/* Search + Filters */}
        <div className="mb-6 space-y-3">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search games, tags..."
              className="w-full rounded-full border border-border bg-card py-2.5 pl-9 pr-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters + Sort — single row */}
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
              label="Platform"
              value={platform}
              options={['All', 'PC', 'Switch', 'PS5', 'Xbox', 'Mobile']}
              onChange={setPlatform}
            />
            <FilterSelect
              label="Genre"
              value={genre}
              options={genreOptions}
              onChange={setGenre}
            />
            <button
              onClick={() => setCoopOnly(!coopOnly)}
              className={`rounded-full border px-4 py-2 font-heading text-sm font-medium transition-colors ${
                coopOnly
                  ? 'border-accent-green bg-accent-green text-white'
                  : 'border-border bg-card text-muted-foreground hover:bg-secondary'
              }`}
            >
              Co-op only
            </button>
            <SortSelect
              value={sort}
              options={[
                { label: 'Score: High → Low', value: 'score-desc' },
                { label: 'Score: Low → High', value: 'score-asc' },
                { label: 'Replayability: High → Low', value: 'replay-desc' },
                { label: 'Replayability: Low → High', value: 'replay-asc' },
                { label: 'Difficulty: Beginner first', value: 'diff-asc' },
                { label: 'Difficulty: Experienced first', value: 'diff-desc' },
                { label: 'Price: Low → High', value: 'price-asc' },
                { label: 'Price: High → Low', value: 'price-desc' },
                { label: 'Release: Newest', value: 'date-desc' },
                { label: 'Release: Oldest', value: 'date-asc' },
              ]}
              onChange={setSort}
            />
          </div>
        </div>

        {/* Results count */}
        <p className="mb-4 font-heading text-xs text-muted-foreground">
          {filtered.length} game{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Game grid */}
        {gamesLoading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-[360px] animate-pulse rounded-2xl bg-secondary" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {filtered.map((game) => (
              <GameTileCard key={game._id} game={game} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card px-6 py-16 text-center">
            <p className="font-heading text-lg font-semibold text-foreground">No games found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search.</p>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
