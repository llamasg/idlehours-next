'use client'

import Link from 'next/link'
import type { Game } from '@/types'
import { useGameLightbox } from '@/context/GameLightboxContext'

const DIFF_LABEL: Record<number, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }

interface TodaysPickProps {
  game: Game | null
}

export default function TodaysPick({ game }: TodaysPickProps) {
  const { openLightbox } = useGameLightbox()

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Game pick card — 2/3 width */}
      <div
        className="group relative lg:col-span-2 cursor-pointer"
        onClick={() => game && openLightbox(game)}
      >
        <div className="relative h-full min-h-[450px] overflow-hidden rounded-2xl border border-border/60">
          {/* Blurred cover art background */}
          {game?.coverImage && (
            <img
              src={game.coverImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover scale-110 blur-sm"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
          <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-8">
            <span className="inline-block w-fit rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-widest text-white/80">
              Today&apos;s Pick
            </span>
            <h3 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              {game?.title ?? 'Check back soon'}
            </h3>
            {game?.shortDescription && (
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/70 line-clamp-2">
                {game.shortDescription}
              </p>
            )}

            {/* Metadata tags */}
            {game && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {game.openCriticScore != null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 backdrop-blur-sm px-2.5 py-1 font-heading text-[11px] font-bold text-white">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    {game.openCriticScore}
                  </span>
                )}
                {game.difficulty != null && (
                  <span className="rounded-full bg-white/15 backdrop-blur-sm px-2.5 py-1 font-heading text-[11px] font-bold text-white">
                    {DIFF_LABEL[game.difficulty] ?? 'Medium'}
                  </span>
                )}
                {game.coop && (
                  <span className="rounded-full bg-white/15 backdrop-blur-sm px-2.5 py-1 font-heading text-[11px] font-bold text-white">
                    Co-op
                  </span>
                )}
                {(game.genre ?? []).slice(0, 3).map((g) => (
                  <span key={g} className="rounded-full bg-white/10 backdrop-blur-sm px-2.5 py-1 font-heading text-[11px] text-white/80">
                    {g}
                  </span>
                ))}
                {(game.platforms ?? []).slice(0, 4).map((p) => (
                  <span key={p} className="rounded-full bg-white/10 backdrop-blur-sm px-2.5 py-1 font-heading text-[11px] text-white/60">
                    {p}
                  </span>
                ))}
              </div>
            )}

            <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 font-heading text-sm font-bold text-brand-dark transition-transform group-hover:scale-105">
              View Game
              <span className="text-xs">&#8594;</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quiz CTA card — 1/3 width */}
      <Link href="/quizzes" className="group">
        <div className="flex h-full min-h-[450px] flex-col items-center justify-center text-center rounded-2xl bg-foreground p-6 sm:p-8 transition-transform group-hover:scale-[1.02]">
          <span className="text-3xl">🎯</span>
          <h3 className="mt-3 text-xl font-bold text-background sm:text-2xl">
            Not sure what to play?
          </h3>
          <p className="mt-2 text-sm text-background/60">
            Take our quiz and find your next favourite game in under a minute.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-background/20 px-5 py-2.5 font-heading text-sm font-bold text-background transition-colors group-hover:bg-background/10">
            Find My Game
            <span className="text-xs">&#8594;</span>
          </span>
        </div>
      </Link>
    </div>
  )
}
