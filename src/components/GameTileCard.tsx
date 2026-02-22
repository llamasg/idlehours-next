'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Disc3 } from 'lucide-react'
import type { Game } from '@/types'

// ── OpenCritic badge ──────────────────────────────────────────────────────

function ocColor(score: number): string {
  if (score >= 90) return 'bg-purple-600 text-white'
  if (score >= 75) return 'bg-green-500 text-white'
  if (score >= 50) return 'bg-green-700 text-white'
  return 'bg-blue-500 text-white'
}

function OpenCriticBadge({ score }: { score?: number }) {
  const colorClass = score != null ? ocColor(score) : 'bg-card/90 text-muted-foreground'
  const label = score != null ? `${score}%` : 'No score'
  return (
    <div className={`absolute bottom-2 left-2 rounded-full px-2.5 py-1 font-heading text-xs font-bold shadow backdrop-blur-sm ${colorClass}`}>
      {label}
    </div>
  )
}

// ── Difficulty badge — gradient opacity ───────────────────────────────────

function DifficultyBadge({ level }: { level: 1 | 2 | 3 }) {
  const config = {
    1: { label: 'Easy',   cls: 'bg-orange-500/20 text-orange-500' },
    2: { label: 'Medium', cls: 'bg-orange-500/40 text-orange-500' },
    3: { label: 'Hard',   cls: 'bg-orange-500 text-white' },
  } as const
  const { label, cls } = config[level]
  return (
    <span className={`rounded-full px-2 py-0.5 font-heading text-[10px] font-semibold ${cls}`}>
      {label}
    </span>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────

interface GameTileCardProps {
  game: Game
}

export default function GameTileCard({ game }: GameTileCardProps) {
  return (
    <Link href={`/games/${game.slug.current}`} className="block w-full">
      <motion.article
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="group w-full cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm flex flex-col h-[360px]"
      >
        {/* Image — fixed height */}
        <div className="relative h-[200px] w-full shrink-0 overflow-hidden bg-secondary">
          {game.coverImage ? (
            <img
              src={game.coverImage}
              alt={game.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-heading text-sm text-muted-foreground">
              No image
            </div>
          )}

          {/* OpenCritic badge */}
          <OpenCriticBadge score={game.openCriticScore} />

          {/* Co-op badge */}
          {game.coop && (
            <div className="absolute right-2 top-2 rounded-full bg-accent-green px-2 py-0.5 font-heading text-[10px] font-semibold text-white shadow">
              Co-op
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 overflow-hidden p-4">
          <h3 className="font-heading text-base font-semibold leading-snug text-foreground line-clamp-2">
            {game.title}
          </h3>

          {/* Badges row */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {game.difficulty != null && (
              <DifficultyBadge level={game.difficulty} />
            )}
            {game.greatSoundtrack && (
              <span title="Great Soundtrack">
                <Disc3 size={13} className="text-accent fill-accent/20" strokeWidth={2} />
              </span>
            )}
          </div>

          {/* Platforms */}
          {(game.platforms ?? []).length > 0 && (
            <p className="mt-2 font-heading text-xs text-muted-foreground">
              {(game.platforms ?? []).join(' · ')}
            </p>
          )}
        </div>

        {/* View button */}
        <div className="shrink-0 px-4 pb-4">
          <div className="rounded-xl bg-accent/10 py-2 text-center font-heading text-sm font-semibold text-accent transition-colors group-hover:bg-accent group-hover:text-white">
            View Game
          </div>
        </div>
      </motion.article>
    </Link>
  )
}
