// src/components/GameReferenceBlock.tsx

import Link from 'next/link'
import { Disc3 } from 'lucide-react'

// ── Helpers ──────────────────────────────────────────────────────────────────

function ocColor(score: number): string {
  if (score >= 90) return 'bg-purple-600 text-white'
  if (score >= 75) return 'bg-green-500 text-white'
  if (score >= 50) return 'bg-green-700 text-white'
  return 'bg-blue-500 text-white'
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface GameReferenceValue {
  game?: {
    _id: string
    title: string
    slug: { current: string }
    coverImage?: string
    shortDescription: string
    platforms?: string[]
    genre?: string[]
    coop?: boolean
    openCriticScore?: number
    greatSoundtrack?: boolean
    currentPrice?: number
    isFree?: boolean
    affiliateLinks?: { label: string; url: string }[]
  }
  position?: number
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function GameReferenceBlock({ value }: { value: GameReferenceValue }) {
  const game = value?.game
  if (!game) return null

  return (
    <div className="relative my-8 rounded-2xl border border-border/60 bg-card overflow-hidden">
      {/* Stretched link — makes the whole card clickable */}
      <Link
        href={`/games/${game.slug.current}`}
        className="absolute inset-0 z-0"
        aria-label={`View ${game.title}`}
      />

      <div className="flex flex-col sm:flex-row">
        {/* Cover image */}
        <div className="relative shrink-0 sm:w-64">
          {game.coverImage ? (
            <img
              src={game.coverImage}
              alt={game.title}
              className="w-full h-52 sm:h-full object-cover"
            />
          ) : (
            <div className="w-full h-52 sm:h-full bg-secondary flex items-center justify-center">
              <span className="font-heading text-xs text-muted-foreground">No image</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            {/* Position + title */}
            <div className="flex items-start gap-3 mb-3">
              {value.position != null && (
                <span className="font-heading text-4xl font-black text-primary/25 leading-none shrink-0">
                  {value.position}.
                </span>
              )}
              <h3 className="font-heading text-2xl font-bold text-foreground leading-tight">
                {game.title}
              </h3>
            </div>

            {/* Short description */}
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {game.shortDescription}
            </p>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {game.openCriticScore != null && (
                <div className={`rounded-full px-3 py-1 font-heading text-sm font-bold shadow ${ocColor(game.openCriticScore)}`}>
                  {game.openCriticScore}% OpenCritic
                </div>
              )}
              {game.greatSoundtrack && (
                <span title="Great Soundtrack" className="flex items-center gap-1 font-heading text-xs text-accent">
                  <Disc3 size={12} className="fill-accent/20" />
                  Soundtrack
                </span>
              )}
              {game.coop && (
                <span className="rounded-full bg-accent-green/20 px-2 py-0.5 font-heading text-[10px] font-semibold text-accent-green">
                  Co-op
                </span>
              )}
            </div>

            {/* Platforms */}
            {game.platforms && game.platforms.length > 0 && (
              <p className="font-heading text-xs text-muted-foreground">
                {game.platforms.join(' · ')}
              </p>
            )}
          </div>

          {/* Buy links — z-10 so they sit above the stretched link */}
          {game.affiliateLinks && game.affiliateLinks.length > 0 && (
            <div className="relative z-10 flex flex-wrap gap-2 mt-4">
              {game.affiliateLinks.map((link) => (
                <a
                  key={`${link.label}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-border px-3 py-1.5 font-heading text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
