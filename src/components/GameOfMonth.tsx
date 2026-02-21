import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, ArrowRight, Disc3 } from 'lucide-react'
import type { GameOfMonthSection } from '@/types'

function ocColor(score: number): string {
  if (score >= 90) return 'bg-purple-600 text-white'
  if (score >= 75) return 'bg-rose-500 text-white'
  if (score >= 50) return 'bg-green-600 text-white'
  return 'bg-blue-500 text-white'
}

function DifficultyLabel({ level }: { level: 1 | 2 | 3 }) {
  const labels = { 1: 'Beginner', 2: 'Intermediate', 3: 'Experienced' } as const
  return (
    <div className="flex items-center gap-1" title={labels[level]}>
      {([1, 2, 3] as const).map((i) => (
        <span
          key={i}
          className={`inline-block h-2 w-2 rounded-full ${i <= level ? 'bg-amber-500' : 'bg-muted-foreground/20'}`}
        />
      ))}
      <span className="ml-1 font-heading text-xs text-muted-foreground">{labels[level]}</span>
    </div>
  )
}

function ReplayMeter({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" title={`Replayability: ${value}/5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i
        const half = !filled && value >= i - 0.5
        return (
          <span
            key={i}
            className={`inline-block h-2 w-2 rounded-full ${
              filled ? 'bg-accent-green' : half ? 'bg-accent-green/50' : 'bg-muted-foreground/20'
            }`}
          />
        )
      })}
      <span className="ml-1 font-heading text-xs text-muted-foreground">{value}/5 replay</span>
    </div>
  )
}

interface GameOfMonthProps {
  data: GameOfMonthSection
}

export default function GameOfMonth({ data }: GameOfMonthProps) {
  const game = data.featuredGame
  const gameLink = `/games/${game.slug.current}`

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Section title */}
      {data.title && (
        <div className="mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-primary" />
          <h2 className="font-heading text-lg font-bold text-foreground sm:text-xl">
            {data.title}
          </h2>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden bg-secondary md:aspect-auto md:min-h-[300px]">
            {game.coverImage ? (
              <img
                src={game.coverImage}
                alt={game.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
                <span className="font-heading text-muted-foreground">No image</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <h3 className="font-heading text-2xl font-bold text-foreground">
              {game.title}
            </h3>

            {/* Ratings row */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {game.openCriticScore != null && (
                <span className={`rounded-full px-3 py-1 font-heading text-sm font-bold shadow ${ocColor(game.openCriticScore)}`}>
                  {game.openCriticScore} OpenCritic
                </span>
              )}
              {game.difficulty != null && (
                <DifficultyLabel level={game.difficulty} />
              )}
              {game.replayability != null && (
                <ReplayMeter value={game.replayability} />
              )}
              {game.greatSoundtrack && (
                <div className="flex items-center gap-1" title="Great Soundtrack">
                  <Disc3 size={16} className="text-accent fill-accent/20" strokeWidth={2} />
                  <span className="font-heading text-xs text-muted-foreground">Great Soundtrack</span>
                </div>
              )}
              {game.coop && (
                <span className="rounded-full bg-blue-50 px-3 py-1 font-heading text-xs font-medium text-accent-green">
                  Co-op
                </span>
              )}
            </div>

            {/* Blurb */}
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {data.customBlurb || game.shortDescription}
            </p>

            {/* Platforms */}
            {game.platforms && game.platforms.length > 0 && (
              <p className="mt-3 font-heading text-xs text-muted-foreground">
                Available on {game.platforms.join(', ')}
              </p>
            )}

            {/* CTA */}
            <Link
              to={gameLink}
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-heading text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              {data.buttonLabel || 'Read more'}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
