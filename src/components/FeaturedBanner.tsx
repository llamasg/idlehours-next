'use client'

import Link from 'next/link'
import StickyNote from './StickyNote'
import type { Game } from '@/types'

interface FeaturedBannerProps {
  game: Game
  eyebrow: string
  quote?: string
}

export default function FeaturedBanner({ game, eyebrow, quote }: FeaturedBannerProps) {
  return (
    <div className="overflow-hidden rounded-[20px] bg-foreground">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px]">
        {/* Left: editorial */}
        <div className="flex flex-col justify-center p-8 lg:p-12">
          <p className="mb-4 flex items-center gap-2 font-heading text-[10px] font-extrabold uppercase tracking-[0.3em] text-amber-500">
            <span className="block h-0.5 w-5 bg-amber-500" />
            {eyebrow}
          </p>
          <h2 className="mb-4 font-heading text-4xl font-black leading-[0.92] tracking-tight text-background lg:text-5xl">
            {game.title}
          </h2>
          <p className="mb-6 max-w-[380px] text-[15px] font-semibold italic leading-relaxed text-background/55">
            {game.shortDescription}
          </p>
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {(game.platforms ?? []).length > 0 && (
              <span className="rounded-full border border-background/12 bg-background/8 px-3.5 py-1.5 font-heading text-[10px] font-extrabold uppercase tracking-[0.12em] text-background/55">
                {(game.platforms ?? []).join(' · ')}
              </span>
            )}
            {(game.genre ?? []).length > 0 && (
              <span className="rounded-full border border-background/12 bg-background/8 px-3.5 py-1.5 font-heading text-[10px] font-extrabold uppercase tracking-[0.12em] text-background/55">
                {(game.genre ?? []).join(' · ')}
              </span>
            )}
            {game.openCriticScore != null && (
              <span className="rounded-full border border-amber-500/25 bg-amber-500/15 px-3.5 py-1.5 font-heading text-[10px] font-extrabold uppercase tracking-[0.12em] text-amber-500">
                {game.openCriticScore} OpenCritic
              </span>
            )}
          </div>
          <Link
            href={`/games/${game.slug.current}`}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-600 px-6 py-3 font-heading text-sm font-extrabold text-white shadow-[0_5px_0_#9D6328] transition-all hover:-translate-y-0.5 hover:shadow-[0_7px_0_#9D6328] active:translate-y-1 active:shadow-[0_1px_0_#9D6328]"
          >
            View game →
          </Link>
        </div>

        {/* Right: cover + sticky note */}
        <div className="relative hidden items-end justify-start p-7 lg:flex" style={{ background: 'linear-gradient(155deg, #3d8c3d, #1a3a1a)' }}>
          {game.coverImage && (
            <div className="absolute inset-0">
              <img src={game.coverImage} alt={game.title} className="h-full w-full object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}
          {quote && (
            <StickyNote
              subtitle="Beth says"
              body={`"${quote}"`}
              rotate={-1.5}
              className="relative z-10 max-w-[200px]"
            />
          )}
        </div>
      </div>
    </div>
  )
}
