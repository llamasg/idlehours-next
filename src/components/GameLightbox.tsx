'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameLightbox } from '@/context/GameLightboxContext'
import GameTileCard from '@/components/GameTileCard'
import type { Game } from '@/types'

// ── Helpers (same as current detail page) ─────────────────────────────────

function scoreBgColor(score: number): string {
  if (score >= 90) return '#9333ea'
  if (score >= 75) return '#22c55e'
  if (score >= 50) return '#15803d'
  return '#3b82f6'
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

  // Related games — up to 3, filtered by matching genre, exclude current
  const related: Game[] = game
    ? allGames
        .filter((g) => g._id !== game._id)
        .filter((g) => (g.genre ?? []).some((gen) => (game.genre ?? []).includes(gen)))
        .slice(0, 3)
    : []

  // If not enough genre matches, pad with random games
  if (game && related.length < 3) {
    const ids = new Set([game._id, ...related.map((g) => g._id)])
    for (const g of allGames) {
      if (related.length >= 3) break
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
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8 sm:py-12"
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
            className="relative w-full max-w-7xl rounded-2xl bg-card shadow-2xl outline-none"
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute right-3 top-3 z-20 rounded-full bg-black/40 p-2 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
              aria-label="Close"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Hero card — same layout as the former detail page */}
            <div className="overflow-hidden rounded-t-2xl">
              <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
                {/* Cover image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-secondary lg:aspect-auto lg:min-h-[250px]">
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
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 shadow"
                        style={{ backgroundColor: scoreBgColor(game.openCriticScore) }}
                      >
                        <span
                          className="inline-block shrink-0 bg-white"
                          style={{
                            width: 16, height: 16,
                            WebkitMask: 'url(/images/icons/icon_fire-hot-streak.svg) no-repeat center / contain',
                            mask: 'url(/images/icons/icon_fire-hot-streak.svg) no-repeat center / contain',
                          }}
                        />
                        <span className="font-heading text-sm font-bold text-white" style={{ letterSpacing: '0.05em' }}>
                          {game.openCriticScore}
                        </span>
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
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 font-heading text-xs font-medium text-accent-green">
                        <span
                          className="inline-block shrink-0 bg-current"
                          style={{
                            width: 12, height: 12,
                            WebkitMask: 'url(/images/icons/icon_friend-coop-co-op-together-companion-friendship.svg) no-repeat center / contain',
                            mask: 'url(/images/icons/icon_friend-coop-co-op-together-companion-friendship.svg) no-repeat center / contain',
                          }}
                        />
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
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                        <span
                          className="inline-block shrink-0 bg-current"
                          style={{
                            width: 14, height: 14,
                            WebkitMask: 'url(/images/icons/icon_handheld-console-platform-gameboy-retro.svg) no-repeat center / contain',
                            mask: 'url(/images/icons/icon_handheld-console-platform-gameboy-retro.svg) no-repeat center / contain',
                          }}
                        />
                        <span className="font-heading text-xs font-semibold uppercase tracking-wider">Platforms</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
