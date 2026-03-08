'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import { getTodayDateString as getGameSenseToday } from './game-sense/lib/dateUtils'
import { getTodayDateString as getStreetDateToday } from './street-date/lib/dateUtils'
import { getTodayDateString as getShelfPriceToday } from './shelf-price/lib/dateUtils'

interface GameCard {
  title: string
  subtitle: string
  icon: string
  playTime: string
  getHref: () => string
  archiveHref?: string
  // Visual
  gradient: string
  iconBg: string
  btnColor: string
}

const GAMES: GameCard[] = [
  {
    title: 'Game Sense',
    subtitle: 'Guess the game from clues',
    icon: '🎮',
    playTime: '3 min',
    getHref: () => `/play/game-sense/${getGameSenseToday()}`,
    archiveHref: '/play/game-sense/archive',
    gradient: 'from-[#4A8FE8]/20 via-[#4A8FE8]/10 to-[#2D6BC4]/5',
    iconBg: 'bg-[#4A8FE8]/15',
    btnColor: 'bg-[#4A8FE8] hover:bg-[#2D6BC4]',
  },
  {
    title: 'Street Date',
    subtitle: 'Five covers. One year. How close?',
    icon: '📅',
    playTime: '2 min',
    getHref: () => `/play/street-date/${getStreetDateToday()}`,
    archiveHref: '/play/street-date/archive',
    gradient: 'from-amber-500/15 via-amber-500/8 to-orange-600/5',
    iconBg: 'bg-amber-500/15',
    btnColor: 'bg-amber-600 hover:bg-amber-700',
  },
  {
    title: 'Shelf Price',
    subtitle: 'Which game cost more at launch?',
    icon: '💰',
    playTime: '2 min',
    getHref: () => `/play/shelf-price/${getShelfPriceToday()}`,
    archiveHref: '/play/shelf-price/archive',
    gradient: 'from-emerald-500/15 via-emerald-500/8 to-teal-600/5',
    iconBg: 'bg-emerald-500/15',
    btnColor: 'bg-emerald-600 hover:bg-emerald-700',
  },
  {
    title: 'Ship It',
    subtitle: 'Navigate publishers. Launch your indie game.',
    icon: '📦',
    playTime: '5 min',
    getHref: () => '/play/ship-it',
    gradient: 'from-rose-500/15 via-rose-500/8 to-pink-600/5',
    iconBg: 'bg-rose-500/15',
    btnColor: 'bg-rose-600 hover:bg-rose-700',
  },
  {
    title: 'Blitz',
    subtitle: 'Name as many games as you can before time runs out.',
    icon: '⚡',
    playTime: 'Play anytime',
    getHref: () => '/play/blitz',
    gradient: 'from-amber-400/20 via-amber-500/10 to-yellow-600/5',
    iconBg: 'bg-amber-500/20',
    btnColor: 'bg-amber-500 hover:bg-amber-600',
  },
]

export default function PlayHubPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-10 text-center">
          <p className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            a game by Idle Hours
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-foreground">
            Play Our Games
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Daily puzzles and more. Pick a game and play.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {GAMES.map((game) => (
            <div
              key={game.title}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${game.gradient} border border-border/40`}
            >
              {/* Background icon — large, faded, positioned right */}
              <div className="pointer-events-none absolute -right-4 -bottom-4 text-[120px] leading-none opacity-[0.08] select-none">
                {game.icon}
              </div>

              {/* Content */}
              <div className="relative flex min-h-[200px] flex-col justify-between p-6">
                {/* Top: icon + title */}
                <div>
                  <div
                    className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl ${game.iconBg} text-2xl`}
                  >
                    {game.icon}
                  </div>
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    {game.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {game.subtitle}
                  </p>
                </div>

                {/* Bottom: buttons + play time */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    href={game.getHref()}
                    className={`inline-flex items-center rounded-full ${game.btnColor} px-5 py-2 font-heading text-xs font-semibold text-white transition-all hover:scale-[1.03]`}
                  >
                    {game.archiveHref ? 'Play today' : 'Play now'}
                  </Link>
                  {game.archiveHref && (
                    <Link
                      href={game.archiveHref}
                      className="inline-flex items-center rounded-full border border-border/60 bg-white/60 px-4 py-2 font-heading text-xs font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                    >
                      Archive
                    </Link>
                  )}
                  <span className="ml-auto font-heading text-[11px] text-muted-foreground/50">
                    {game.playTime}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
