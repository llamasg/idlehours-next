'use client'

import { motion } from 'framer-motion'

import type { Game } from '@/types'
import { useGameLightbox } from '@/context/GameLightboxContext'

// ── ScoreBadge ────────────────────────────────────────────────────────────

function scoreBgColor(score: number): string {
  if (score >= 90) return '#9333ea'
  if (score >= 75) return '#22c55e'
  if (score >= 50) return '#15803d'
  return '#3b82f6'
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <div className="relative" style={{ width: 52, height: 25 }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: scoreBgColor(score),
          WebkitMask: 'url(/images/icons/icon_uicardSCORE-opencritic-rating-score.svg) no-repeat center / contain',
          mask: 'url(/images/icons/icon_uicardSCORE-opencritic-rating-score.svg) no-repeat center / contain',
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
        }}
      />
      <span
        className="absolute font-heading font-black text-white"
        style={{ fontSize: 11, lineHeight: 1, left: 24, top: '50%', transform: 'translateY(-50%)' }}
      >
        {score}
      </span>
    </div>
  )
}

// ── Difficulty label config ───────────────────────────────────────────────

const DIFF_META = {
  1: { label: 'Easy',  bg: 'bg-green-500/25' },
  2: { label: 'Avg',   bg: 'bg-amber-500/25' },
  3: { label: 'Hard',  bg: 'bg-red-500/25' },
} as const

// ── Card ──────────────────────────────────────────────────────────────────

interface GameTileCardProps {
  game: Game
}

export default function GameTileCard({ game }: GameTileCardProps) {
  const { openLightbox } = useGameLightbox()
  const hasBadges = game.difficulty != null || game.coop || game.greatSoundtrack

  return (
    <div className="block w-full" onClick={() => openLightbox(game)}>
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25 }}
        className="group w-full cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm flex flex-col"
      >
        {/* Image */}
        <div className="relative h-[200px] w-full shrink-0 overflow-hidden bg-secondary">
          {game.coverImage ? (
            <img
              src={game.coverImage}
              alt={game.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}

          {/* Score badge — top-left */}
          {game.openCriticScore != null && (
            <div className="absolute top-3 left-3 z-10">
              <ScoreBadge score={game.openCriticScore} />
            </div>
          )}

          {/* Metadata badges — subtle overlay at image bottom */}
          {hasBadges && (
            <div
              className="absolute bottom-0 inset-x-0 z-10 flex items-center gap-1.5 px-3 py-2"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)' }}
            >
              {game.difficulty != null && (() => {
                const d = DIFF_META[game.difficulty]
                return (
                  <span className={`rounded-full ${d.bg} backdrop-blur-sm px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-white/90`}>
                    {d.label}
                  </span>
                )
              })()}
              {game.coop && (
                <span className="rounded-full bg-white/15 backdrop-blur-sm px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-white/90">
                  Co-op
                </span>
              )}
              {game.greatSoundtrack && (
                <span
                  className="relative inline-flex items-center justify-center rounded-full bg-white/15 backdrop-blur-sm px-1.5 py-0.5"
                  title="Great Soundtrack"
                >
                  <span
                    className="inline-block shrink-0 bg-white/80"
                    style={{
                      width: 10,
                      height: 10,
                      WebkitMask: 'url(/images/icons/icon_music-soundtrack-headphones-sound-audio.svg) no-repeat center / contain',
                      mask: 'url(/images/icons/icon_music-soundtrack-headphones-sound-audio.svg) no-repeat center / contain',
                    }}
                  />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Info — serif title, muted platform list */}
        <div className="flex flex-col flex-1 p-4 pb-2">
          <h3 className="font-body text-[15px] font-medium leading-snug text-foreground line-clamp-2">
            {game.title}
          </h3>

          {(game.platforms ?? []).length > 0 && (
            <p className="mt-1 text-[11px] tracking-wide text-muted-foreground">
              {(game.platforms ?? []).join(' · ')}
            </p>
          )}
        </div>

        {/* Quiet text-only action */}
        <div className="mt-auto px-4 pb-3">
          <span className="text-[11px] font-heading font-semibold uppercase tracking-wider text-muted-foreground/50 transition-colors group-hover:text-primary">
            View Game
          </span>
        </div>
      </motion.article>
    </div>
  )
}
