import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Pizza } from 'lucide-react'
import GlareHover from '@/components/GlareHover'
import type { Game } from '@/types'

interface GameTileCardProps {
  game: Game
}

function BrainMeter({ level }: { level: 'Low' | 'Medium' | 'High' }) {
  const filled = level === 'Low' ? 1 : level === 'Medium' ? 2 : 3
  return (
    <div className="flex items-center gap-0.5" title={`Brain Effort: ${level}`}>
      {[1, 2, 3].map((i) => (
        <Brain
          key={i}
          size={13}
          className={i <= filled ? 'text-amber-500 fill-amber-500/30' : 'text-muted-foreground/30'}
          strokeWidth={i <= filled ? 2.2 : 1.5}
        />
      ))}
    </div>
  )
}

export default function GameTileCard({ game }: GameTileCardProps) {
  return (
    <Link to={`/games/${game.slug.current}`} className="block snap-start w-[220px] sm:w-[240px] shrink-0">
      <GlareHover
        width="100%"
        height="100%"
        background="hsl(var(--card))"
        borderRadius="1rem"
        borderColor="hsl(var(--border))"
        glareColor="#ED850F"
        glareOpacity={0.15}
        glareAngle={-30}
        glareSize={300}
        transitionDuration={800}
        playOnce={false}
      >
        <motion.article
          whileHover={{ y: -6, scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="group w-full cursor-pointer overflow-hidden"
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

            {/* Cozy % badge */}
            {game.ratings?.cozyPercent != null && (
              <div className="absolute bottom-2 left-2 rounded-full bg-card/90 px-2.5 py-1 font-heading text-xs font-bold text-primary shadow backdrop-blur-sm">
                {game.ratings.cozyPercent}% cozy
              </div>
            )}

            {/* Co-op badge */}
            {game.coop && (
              <div className="absolute right-2 top-2 rounded-full bg-olive px-2 py-0.5 font-heading text-[10px] font-semibold text-white shadow">
                Co-op
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3">
            <h3 className="font-heading text-sm font-semibold leading-snug text-foreground line-clamp-2">
              {game.title}
            </h3>

            {/* Icon ratings row */}
            <div className="mt-2 flex items-center gap-3">
              {game.ratings?.brainEffort && (
                <BrainMeter level={game.ratings.brainEffort} />
              )}
              {game.ratings?.snackSafe && (
                <Pizza size={15} className="text-orange-400 fill-orange-400/20" strokeWidth={2} title="Snack Safe" />
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
            <div className="rounded-xl bg-primary/10 py-1.5 text-center font-heading text-xs font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              View Game
            </div>
          </div>
        </motion.article>
      </GlareHover>
    </Link>
  )
}
