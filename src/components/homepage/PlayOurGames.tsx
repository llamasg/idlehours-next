'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { getTodayDateString as getGameSenseToday } from '@/app/play/game-sense/lib/dateUtils'
import { getTodayDateString as getStreetDateToday } from '@/app/play/street-date/lib/dateUtils'
import { getTodayDateString as getShelfPriceToday } from '@/app/play/shelf-price/lib/dateUtils'

const CYCLE_MS = 10_000

const GAMES = [
  {
    title: 'Game Sense',
    subtitle: 'Guess the game from clues. Daily.',
    src: '/videos/skill issue.mp4',
    type: 'video' as const,
    playTime: '3 min',
    getHref: () => `/play/game-sense/${getGameSenseToday()}`,
  },
  {
    title: 'Street Date',
    subtitle: 'Five covers. One year. How close can you get?',
    src: '/videos/box art.gif',
    type: 'gif' as const,
    playTime: '2 min',
    getHref: () => `/play/street-date/${getStreetDateToday()}`,
  },
  {
    title: 'Shelf Price',
    subtitle: 'Guess the launch price. How well do you know your games?',
    src: '/videos/game3.gif',
    type: 'gif' as const,
    playTime: '2 min',
    getHref: () => `/play/shelf-price/${getShelfPriceToday()}`,
  },
]

export default function PlayOurGames() {
  const [active, setActive] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  // Auto-cycle every CYCLE_MS
  useEffect(() => {
    const timer = setTimeout(() => {
      setActive((prev) => (prev + 1) % GAMES.length)
    }, CYCLE_MS)
    return () => clearTimeout(timer)
  }, [active])

  // Play/pause videos on switch
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i === active) {
        v.currentTime = 0
        v.play().catch(() => {})
      } else {
        v.pause()
      }
    })
  }, [active])

  return (
    <>
      {/* Progress bar animation */}
      <style>{`
        @keyframes carousel-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>

      <div className="grid gap-4 sm:grid-cols-3">
        {GAMES.map((game, i) => {
          const isActive = i === active
          return (
            <div key={i}>
              {/* Video card */}
              <div
                className={`relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? 'border-border/60 shadow-lg ring-2 ring-primary/20'
                    : 'border-border/30 opacity-50 hover:opacity-70'
                }`}
                onClick={() => setActive(i)}
              >
                {game.type === 'video' ? (
                  <video
                    ref={(el) => { videoRefs.current[i] = el }}
                    src={game.src}
                    autoPlay={i === 0}
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={game.src}
                    alt={game.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
                {/* Dim overlay for inactive */}
                {!isActive && <div className="absolute inset-0 bg-black/30" />}
              </div>

              {/* Progress bar */}
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border/30">
                {isActive && (
                  <div
                    key={`bar-${active}-${i}`}
                    className="h-full rounded-full bg-[#8B6F47]"
                    style={{ animation: `carousel-fill ${CYCLE_MS}ms linear forwards` }}
                  />
                )}
              </div>

              {/* Title + subtitle + play time */}
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-heading text-base font-bold ${
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {game.title}
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 font-heading text-[10px] font-semibold text-muted-foreground">
                    {game.playTime}
                  </span>
                </div>
                <p className={`mt-0.5 text-xs ${isActive ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                  {game.subtitle}
                </p>
                {isActive && game.getHref() !== '#' && (
                  <Link
                    href={game.getHref()}
                    className="mt-2 inline-flex items-center gap-1 font-heading text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    Play now
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
