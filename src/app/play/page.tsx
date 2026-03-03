'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import { getTodayDateString as getGameSenseToday } from './game-sense/lib/dateUtils'
import { getTodayDateString as getStreetDateToday } from './street-date/lib/dateUtils'

const GAMES = [
  {
    title: 'Game Sense',
    description: 'Guess the game from clues. A new challenge every day.',
    icon: '🎮',
    playTime: '3 min',
    getHref: () => `/play/game-sense/${getGameSenseToday()}`,
    archiveHref: '/play/game-sense/archive',
    color: 'from-violet-500/10 to-violet-500/5',
    accentBorder: 'border-violet-500/20',
    accentText: 'text-violet-600 dark:text-violet-400',
    accentBg: 'bg-violet-600 hover:bg-violet-700',
  },
  {
    title: 'Street Date',
    description: 'Five covers. One year. How close can you get?',
    icon: '📅',
    playTime: '2 min',
    getHref: () => `/play/street-date/${getStreetDateToday()}`,
    archiveHref: '/play/street-date/archive',
    color: 'from-amber-500/10 to-amber-500/5',
    accentBorder: 'border-amber-500/20',
    accentText: 'text-amber-600 dark:text-amber-400',
    accentBg: 'bg-amber-600 hover:bg-amber-700',
  },
]

export default function PlayHubPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-10 text-center">
          <p className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            a game by Idle Hours
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-foreground">
            Daily Games
          </h1>
          <p className="mt-2 font-body text-sm text-muted-foreground">
            New puzzles every day. Pick a game and play.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {GAMES.map((game) => (
            <Link
              key={game.title}
              href={game.getHref()}
              className={`group relative overflow-hidden rounded-2xl border ${game.accentBorder} bg-gradient-to-br ${game.color} p-6 transition-all hover:shadow-lg hover:scale-[1.01]`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{game.icon}</span>
                    <h2 className="font-heading text-xl font-bold text-foreground">
                      {game.title}
                    </h2>
                  </div>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    {game.description}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-full ${game.accentBg} px-4 py-1.5 font-heading text-xs font-semibold text-white transition-colors`}>
                      Play today
                    </span>
                    <span className="font-heading text-[11px] text-muted-foreground/60">
                      {game.playTime}
                    </span>
                  </div>
                </div>
                <svg
                  className="mt-1 h-5 w-5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
