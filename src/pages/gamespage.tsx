import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, X } from 'lucide-react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import GameTileCard from '@/components/GameTileCard'
import { mockGames } from '@/data/mock-data'

const platforms = ['All', 'PC', 'Switch', 'PS5', 'Xbox', 'Mobile']
const sortOptions = [
  { label: 'Coziest First', value: 'cozy' },
  { label: 'Newest', value: 'newest' },
  { label: 'A-Z', value: 'alpha' },
]

export default function GamesPage() {
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('All')
  const [sort, setSort] = useState('cozy')
  const [coopOnly, setCoopOnly] = useState(false)

  const filtered = useMemo(() => {
    let result = [...mockGames]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.shortDescription.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    // Platform
    if (platform !== 'All') {
      result = result.filter((g) => g.platforms.includes(platform))
    }

    // Co-op
    if (coopOnly) {
      result = result.filter((g) => g.coop)
    }

    // Sort
    if (sort === 'cozy') {
      result.sort((a, b) => (b.ratings?.cozyPercent ?? 0) - (a.ratings?.cozyPercent ?? 0))
    } else if (sort === 'newest') {
      result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    } else {
      result.sort((a, b) => a.title.localeCompare(b.title))
    }

    return result
  }, [search, platform, sort, coopOnly])

  const activeFilters = (platform !== 'All' ? 1 : 0) + (coopOnly ? 1 : 0)

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
        <div className="mb-6 space-y-4">
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

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter size={14} />
              <span className="font-heading font-medium">Filters{activeFilters > 0 && ` (${activeFilters})`}</span>
            </div>

            {/* Platform pills */}
            <div className="flex flex-wrap gap-1.5">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`rounded-full border px-3 py-1 font-heading text-xs font-medium transition-colors ${
                    platform === p
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Co-op toggle */}
            <button
              onClick={() => setCoopOnly(!coopOnly)}
              className={`rounded-full border px-3 py-1 font-heading text-xs font-medium transition-colors ${
                coopOnly
                  ? 'border-accent-green bg-accent-green text-white'
                  : 'border-border bg-card text-muted-foreground hover:bg-secondary'
              }`}
            >
              Co-op
            </button>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border border-border bg-card px-3 py-1 font-heading text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="mb-4 font-heading text-xs text-muted-foreground">
          {filtered.length} game{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Game grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
