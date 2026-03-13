'use client'

import { useState, useEffect } from 'react'
import { getGameLibrary } from '@/lib/queries'
import GameTileCard from '@/components/GameTileCard'
import FeaturedBanner from '@/components/FeaturedBanner'
import StickyNote from '@/components/StickyNote'
import PullQuote from '@/components/PullQuote'
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

// Staff pick card — stipple popup variant
function StaffPickCard({ game }: { game: Game }) {
  return (
    <div className="flex flex-shrink-0 items-start gap-0 snap-start" style={{ width: 320 }}>
      <div className="h-[140px] w-[100px] flex-shrink-0 overflow-hidden rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
        {game.coverImage ? (
          <img src={game.coverImage} alt={game.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-xs text-muted-foreground">Cover</div>
        )}
      </div>
      <div
        className="relative ml-3 flex-1 rounded-xl p-3.5 shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
        style={{
          backgroundColor: 'hsl(45 33% 93%)',
          backgroundImage: 'radial-gradient(circle, rgba(26,26,20,0.06) 1px, transparent 1px)',
          backgroundSize: '10px 10px',
          transform: 'rotate(0.8deg)',
        }}
      >
        <div
          className="absolute -left-2 top-5 h-0 w-0"
          style={{
            borderStyle: 'solid',
            borderWidth: '7px 8px 7px 0',
            borderColor: 'transparent hsl(45 33% 93%) transparent transparent',
          }}
        />
        <p className="mb-1 font-heading text-[9px] font-black uppercase tracking-[0.18em] text-amber-600">Staff pick</p>
        <p className="mb-0.5 font-heading text-[15px] font-black leading-tight text-foreground">{game.title}</p>
        <p className="text-[11px] font-semibold italic text-muted-foreground">{(game.platforms ?? []).join(' · ')}</p>
        {game.openCriticScore != null && (
          <>
            <hr className="my-2 border-dashed border-border" />
            <div className="flex justify-between">
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">OpenCritic</span>
              <span className="font-heading text-sm font-black text-foreground">{game.openCriticScore}</span>
            </div>
          </>
        )}
      </div>
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
              <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:snap-none">
                {(row.games ?? []).map((entry, i) => {
                  if (entry.isStaffPick && entry.game) {
                    return <StaffPickCard key={`pick-${i}`} game={entry.game} />
                  }
                  if (!entry.game) return null
                  return (
                    <div key={entry.game._id} className="w-[220px] flex-shrink-0 snap-start">
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
              </div>
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
