'use client'

import { motion } from 'framer-motion'

import type { GameOfMonthSection } from '@/types'
import { useGameLightbox } from '@/context/GameLightboxContext'

function ocColor(score: number): string {
  if (score >= 90) return 'bg-purple-600 text-white'
  if (score >= 75) return 'bg-rose-500 text-white'
  if (score >= 50) return 'bg-green-600 text-white'
  return 'bg-blue-500 text-white'
}

const DIFF_META: Record<1 | 2 | 3, { label: string; color: string }> = {
  1: { label: 'Easy', color: '#00e116' },
  2: { label: 'Medium', color: '#f3a740' },
  3: { label: 'Hard', color: '#e8134b' },
}

interface GameOfMonthProps {
  data: GameOfMonthSection
}

export default function GameOfMonth({ data }: GameOfMonthProps) {
  const { openLightbox, allGames } = useGameLightbox()
  const game = data.featuredGame
  const fullGame = allGames.find((g) => g.slug.current === game.slug.current)

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
          <span className="inline-block shrink-0 text-primary bg-current" style={{ width: '18px', height: '18px', WebkitMask: 'url(/images/icons/icon_trophy-winner-award-score-achieve.svg) no-repeat center / contain', mask: 'url(/images/icons/icon_trophy-winner-award-score-achieve.svg) no-repeat center / contain' }} />
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
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-heading text-xs font-bold text-white" style={{ backgroundColor: DIFF_META[game.difficulty].color }}>
                  <span
                    className="inline-block shrink-0 bg-white"
                    style={{
                      width: 12, height: 12,
                      WebkitMask: 'url(/images/icons/icon_sword-difficulty-fight-battle-weapon-attack.svg) no-repeat center / contain',
                      mask: 'url(/images/icons/icon_sword-difficulty-fight-battle-weapon-attack.svg) no-repeat center / contain',
                    }}
                  />
                  {DIFF_META[game.difficulty].label}
                </span>
              )}
              {game.greatSoundtrack && (
                <div className="flex items-center gap-1" title="Great Soundtrack">
                  <span className="inline-block shrink-0 text-accent bg-current" style={{ width: '16px', height: '16px', WebkitMask: 'url(/images/icons/icon_music-soundtrack-headphones-sound-audio.svg) no-repeat center / contain', mask: 'url(/images/icons/icon_music-soundtrack-headphones-sound-audio.svg) no-repeat center / contain' }} />
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
            <button
              onClick={() => fullGame && openLightbox(fullGame)}
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-heading text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              {data.buttonLabel || 'Read more'}
              <span className="inline-block shrink-0 bg-current" style={{ width: '14px', height: '14px', WebkitMask: 'url(/images/icons/icon_arrow-next-right.svg) no-repeat center / contain', mask: 'url(/images/icons/icon_arrow-next-right.svg) no-repeat center / contain' }} />
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
