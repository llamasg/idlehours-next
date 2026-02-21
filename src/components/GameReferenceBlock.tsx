// src/components/GameReferenceBlock.tsx

import { Link } from 'react-router-dom'
import { Disc3 } from 'lucide-react'

// ── Helpers ──────────────────────────────────────────────────────────────────

function ocColor(score: number): string {
  if (score >= 90) return 'bg-purple-600 text-white'
  if (score >= 75) return 'bg-rose-500 text-white'
  if (score >= 50) return 'bg-green-600 text-white'
  return 'bg-blue-500 text-white'
}

function DifficultyLabel({ level }: { level: 1 | 2 | 3 }) {
  const labels = { 1: 'Beginner', 2: 'Intermediate', 3: 'Experienced' } as const
  const colors = { 1: 'text-green-400', 2: 'text-amber-400', 3: 'text-red-400' } as const
  return (
    <span className={`font-heading text-xs font-semibold ${colors[level]}`}>
      {labels[level]}
    </span>
  )
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
    difficulty?: 1 | 2 | 3
    replayability?: number
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
    <div className="my-8 rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Cover image */}
        <div className="relative shrink-0 sm:w-48">
          {game.coverImage ? (
            <img
              src={game.coverImage}
              alt={game.title}
              className="w-full h-40 sm:h-full object-cover"
            />
          ) : (
            <div className="w-full h-40 sm:h-full bg-secondary flex items-center justify-center">
              <span className="font-heading text-xs text-muted-foreground">No image</span>
            </div>
          )}
          {/* OC badge */}
          {game.openCriticScore != null && (
            <div className={`absolute bottom-2 left-2 rounded-full px-2 py-0.5 font-heading text-xs font-bold shadow ${ocColor(game.openCriticScore)}`}>
              {game.openCriticScore} OC
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 p-5">
          {/* Position + title */}
          <div className="flex items-start gap-3 mb-2">
            {value.position != null && (
              <span className="font-heading text-3xl font-black text-primary/30 leading-none shrink-0">
                {value.position}.
              </span>
            )}
            <Link to={`/games/${game.slug.current}`} className="hover:text-primary transition-colors">
              <h3 className="font-heading text-xl font-bold text-foreground leading-tight">
                {game.title}
              </h3>
            </Link>
          </div>

          {/* Short description */}
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">
            {game.shortDescription}
          </p>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {game.difficulty != null && <DifficultyLabel level={game.difficulty} />}
            {game.replayability != null && (
              <span className="font-heading text-xs text-muted-foreground">
                Replay: {game.replayability}/5
              </span>
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
            <p className="font-heading text-[10px] text-muted-foreground mb-3">
              {game.platforms.join(' · ')}
            </p>
          )}

          {/* Buy links */}
          {game.affiliateLinks && game.affiliateLinks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {game.affiliateLinks.map((link) => (
                <a
                  key={`${link.label}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-border px-3 py-1 font-heading text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
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
