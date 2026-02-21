import { Link } from 'react-router-dom'
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

// ── Difficulty dots ───────────────────────────────────────────────────────

function DifficultyDots({ level }: { level: 1 | 2 | 3 }) {
  const labels = { 1: 'Beginner', 2: 'Intermediate', 3: 'Experienced' } as const
  return (
    <div className="flex items-center gap-0.5" title={labels[level]}>
      {([1, 2, 3] as const).map((i) => (
        <span
          key={i}
          className={`inline-block h-1.5 w-1.5 rounded-full ${i <= level ? 'bg-amber-500' : 'bg-muted-foreground/20'}`}
        />
      ))}
    </div>
  )
}

// ── Replayability dots ────────────────────────────────────────────────────

function ReplayMeter({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" title={`Replayability: ${value}/5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i
        const half = !filled && value >= i - 0.5
        return (
          <span
            key={i}
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              filled ? 'bg-accent-green' : half ? 'bg-accent-green/50' : 'bg-muted-foreground/20'
            }`}
          />
        )
      })}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────

interface GameTileCardProps {
  game: Game
}

export default function GameTileCard({ game }: GameTileCardProps) {
  return (
    <Link to={`/games/${game.slug.current}`} className="block snap-start w-[220px] sm:w-[240px] shrink-0">
      <motion.article
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="group w-full cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
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
        <div className="p-3">
          <h3 className="font-heading text-sm font-semibold leading-snug text-foreground line-clamp-2">
            {game.title}
          </h3>

          {/* Ratings row */}
          <div className="mt-2 flex items-center gap-3">
            {game.difficulty != null && (
              <DifficultyDots level={game.difficulty} />
            )}
            {game.replayability != null && (
              <ReplayMeter value={game.replayability} />
            )}
            {game.greatSoundtrack && (
              <span title="Great Soundtrack">
  <Disc3
    size={13}
    className="text-accent fill-accent/20"
    strokeWidth={2}
  />
</span>
            )}
          </div>

          {/* Platforms */}
          {game.platforms && game.platforms.length > 0 && (
            <p className="mt-2 font-heading text-[10px] text-muted-foreground">
              {game.platforms.join(' · ')}
            </p>
          )}
        </div>

        {/* View button */}
        <div className="px-3 pb-3">
          <div className="rounded-xl bg-accent/10 py-1.5 text-center font-heading text-xs font-semibold text-accent transition-colors group-hover:bg-accent group-hover:text-white">
            View Game
          </div>
        </div>
      </motion.article>
    </Link>
  )
}
