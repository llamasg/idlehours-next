'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameLightbox } from '@/context/GameLightboxContext'
import GameTileCard from '@/components/GameTileCard'
import type { Game } from '@/types'

// ── Helpers (same as current detail page) ─────────────────────────────────

function ocColor(score: number): string {
  if (score >= 90) return 'bg-purple-600 text-white'
  if (score >= 75) return 'bg-green-500 text-white'
  if (score >= 50) return 'bg-green-700 text-white'
  return 'bg-blue-500 text-white'
}

function DifficultyLabel({ level }: { level: 1 | 2 | 3 }) {
  const labels = { 1: 'Beginner', 2: 'Intermediate', 3: 'Experienced' } as const
  return (
    <div className="flex items-center gap-1.5" title={labels[level]}>
      {([1, 2, 3] as const).map((i) => (
        <span
          key={i}
          className={`inline-block h-2.5 w-2.5 rounded-full ${i <= level ? 'bg-amber-500' : 'bg-muted-foreground/20'}`}
        />
      ))}
      <span className="ml-1 font-heading text-sm text-muted-foreground">{labels[level]}</span>
    </div>
  )
}

function ReplayMeter({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1" title={`Replayability: ${value}/5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i
        const half = !filled && value >= i - 0.5
        return (
          <span
            key={i}
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              filled ? 'bg-accent-green' : half ? 'bg-accent-green/50' : 'bg-muted-foreground/20'
            }`}
          />
        )
      })}
      <span className="ml-1 font-heading text-sm text-muted-foreground">{value}/5 replay</span>
    </div>
  )
}

// ── GameLightbox ──────────────────────────────────────────────────────────

export default function GameLightbox() {
  const { activeGame: game, allGames, closeLightbox } = useGameLightbox()
  const dialogRef = useRef<HTMLDivElement>(null)

  // Escape key
  useEffect(() => {
    if (!game) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [game, closeLightbox])

  // Lock body scroll when open
  useEffect(() => {
    if (game) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [game])

  // Focus trap — focus the dialog on open
  useEffect(() => {
    if (game && dialogRef.current) {
      dialogRef.current.focus()
    }
  }, [game])

  // Related games — up to 4, filtered by matching genre, exclude current
  const related: Game[] = game
    ? allGames
        .filter((g) => g._id !== game._id)
        .filter((g) => (g.genre ?? []).some((gen) => (game.genre ?? []).includes(gen)))
        .slice(0, 4)
    : []

  // If not enough genre matches, pad with random games
  if (game && related.length < 4) {
    const ids = new Set([game._id, ...related.map((g) => g._id)])
    for (const g of allGames) {
      if (related.length >= 4) break
      if (!ids.has(g._id)) {
        related.push(g)
        ids.add(g._id)
      }
    }
  }

  return (
    <AnimatePresence>
      {game && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-8 sm:py-12"
          onClick={(e) => { if (e.target === e.currentTarget) closeLightbox() }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={game.title}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-[860px] rounded-2xl bg-card shadow-2xl outline-none"
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute right-3 top-3 z-20 rounded-full bg-black/40 p-1.5 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
              aria-label="Close"
            >
              <span
                className="inline-block shrink-0 bg-current"
                style={{
                  width: 16, height: 16,
                  WebkitMask: 'url(/images/icons/icon_sad-cancel-failure-leave-bad-negative.svg) no-repeat center / contain',
                  mask: 'url(/images/icons/icon_sad-cancel-failure-leave-bad-negative.svg) no-repeat center / contain',
                }}
              />
            </button>

            {/* Hero card — same layout as the former detail page */}
            <div className="overflow-hidden rounded-t-2xl">
              <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
                {/* Cover image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-secondary lg:aspect-auto lg:min-h-[300px]">
                  {game.coverImage ? (
                    <img src={game.coverImage} alt={game.title} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
                      <span className="font-heading text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>

                {/* Info panel */}
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <h2 className="font-heading text-2xl font-bold text-foreground lg:text-3xl">
                    {game.title}
                  </h2>

                  {/* Genre row */}
                  {(game.genre ?? []).length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className="inline-block shrink-0 bg-current"
                        style={{
                          width: 14, height: 14, color: '#4199f1',
                          WebkitMask: 'url(/images/icons/icon_tag-genre-filter.svg) no-repeat center / contain',
                          mask: 'url(/images/icons/icon_tag-genre-filter.svg) no-repeat center / contain',
                        }}
                      />
                      <p className="font-heading text-xs font-bold uppercase tracking-widest text-foreground">
                        {(game.genre ?? []).join(' · ')}
                      </p>
                    </div>
                  )}

                  {/* Ratings */}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {game.openCriticScore != null && (
                      <span className={`rounded-full px-3 py-1 font-heading text-sm font-bold shadow ${ocColor(game.openCriticScore)}`}>
                        {game.openCriticScore} OpenCritic
                      </span>
                    )}
                    {game.difficulty != null && <DifficultyLabel level={game.difficulty} />}
                    {game.replayability != null && <ReplayMeter value={game.replayability} />}
                    {game.greatSoundtrack && (
                      <div className="flex items-center gap-1.5" title="Great Soundtrack">
                        <span className="inline-block shrink-0 text-accent bg-current" style={{ width: 16, height: 16, WebkitMask: 'url(/images/icons/icon_music-soundtrack-headphones-sound-audio.svg) no-repeat center / contain', mask: 'url(/images/icons/icon_music-soundtrack-headphones-sound-audio.svg) no-repeat center / contain' }} />
                        <span className="font-heading text-sm text-muted-foreground">Great Soundtrack</span>
                      </div>
                    )}
                    {game.coop && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 font-heading text-xs font-medium text-accent-green">
                        Co-op
                      </span>
                    )}
                  </div>

                  {/* Short description */}
                  <p className="mt-4 leading-relaxed text-muted-foreground">
                    {game.shortDescription}
                  </p>

                  {/* Platforms */}
                  {(game.platforms ?? []).length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Platforms
                      </h3>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {(game.platforms ?? []).map((p: string) => (
                          <span key={p} className="rounded-full border border-border bg-background px-3 py-1 font-heading text-xs text-foreground">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {(game.tags ?? []).length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1.5">
                        {(game.tags ?? []).map((tag: string) => (
                          <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 font-heading text-[11px] text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Affiliate links */}
                  {(game.affiliateLinks ?? []).length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {(game.affiliateLinks ?? []).map((link: { label: string; url: string }) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 font-heading text-sm font-semibold text-white transition-transform hover:scale-105"
                        >
                          {link.label}
                          <span className="inline-block shrink-0 bg-current" style={{ width: 12, height: 12, WebkitMask: 'url(/images/icons/icon_click-hover-mouse-tap-cursor.svg) no-repeat center / contain', mask: 'url(/images/icons/icon_click-hover-mouse-tap-cursor.svg) no-repeat center / contain' }} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Related games */}
            {related.length > 0 && (
              <div className="border-t border-border/40 p-6">
                <h3 className="mb-3 font-heading text-sm font-bold text-foreground">
                  You might also like
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {related.map((g) => (
                    <GameTileCard key={g._id} game={g} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
