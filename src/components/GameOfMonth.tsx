import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, ArrowRight, Brain, Pizza } from 'lucide-react'
import type { GameOfMonthSection } from '@/types'

interface GameOfMonthProps {
  data: GameOfMonthSection
}

function BrainMeter({ level }: { level: 'Low' | 'Medium' | 'High' }) {
  const filled = level === 'Low' ? 1 : level === 'Medium' ? 2 : 3
  return (
    <div className="flex items-center gap-1" title={`Brain Effort: ${level}`}>
      {[1, 2, 3].map((i) => (
        <Brain
          key={i}
          size={16}
          className={i <= filled ? 'text-amber-500 fill-amber-500/30' : 'text-muted-foreground/30'}
          strokeWidth={i <= filled ? 2.2 : 1.5}
        />
      ))}
      <span className="ml-1 font-heading text-xs text-muted-foreground">{level}</span>
    </div>
  )
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

            {/* Cozy badge overlay */}
            {game.ratings?.cozyPercent != null && (
              <div className="absolute bottom-3 left-3 rounded-full bg-card/90 px-3 py-1 font-heading text-sm font-bold text-primary shadow-md backdrop-blur-sm">
                {game.ratings.cozyPercent}% Cozy
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <h3 className="font-heading text-2xl font-bold text-foreground">
              {game.title}
            </h3>

            {/* Rating icons */}
            <div className="mt-3 flex flex-wrap items-center gap-4">
              {game.ratings?.brainEffort && (
                <BrainMeter level={game.ratings.brainEffort} />
              )}
              {game.ratings?.snackSafe && (
                <div className="flex items-center gap-1" title="Snack Safe">
                  <Pizza size={16} className="text-olive fill-olive/20" strokeWidth={2} />
                  <span className="font-heading text-xs text-muted-foreground">Snack Safe</span>
                </div>
              )}
              {game.coop && (
                <span className="rounded-full bg-blue-50 px-3 py-1 font-heading text-xs font-medium text-olive">
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
