'use client'

import Link from 'next/link'
import { BLITZ_TOPICS } from '@/data/blitz-topics'
import { GAMES_DB } from '@/data/games-db'

export default function BlitzSection() {
  const topicsWithCounts = BLITZ_TOPICS.slice(0, 4).map((topic) => ({
    ...topic,
    count: GAMES_DB.filter(topic.filter).length,
  }))

  return (
    <div className="relative overflow-hidden rounded-[20px] bg-amber-600 shadow-[0_4px_0_#9D6328,0_10px_30px_rgba(200,135,58,0.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_0_#9D6328,0_20px_44px_rgba(200,135,58,0.28)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(-45deg, rgba(255,255,255,0.09) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.09) 75%, transparent 75%)',
          backgroundSize: '28px 28px',
          animation: 'stripeScroll 3s linear infinite',
        }}
      />
      <div className="relative z-10 grid grid-cols-1 items-stretch lg:grid-cols-2">
        <div className="flex flex-col justify-between p-8 lg:p-10">
          <div>
            <p className="mb-3.5 flex items-center gap-2 font-heading text-[9px] font-black uppercase tracking-[0.28em] text-white/85">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Ongoing &middot; Topics added regularly
            </p>
            <h2 className="mb-3 font-heading text-[clamp(52px,6vw,80px)] font-black uppercase leading-[0.85] tracking-tighter text-white">
              Blitz
            </h2>
            <p className="mb-5 max-w-[300px] text-sm font-semibold italic leading-relaxed text-white/60">
              Pick a topic. Name as many games as you can think of before the clock runs out. Then wonder why you forgot Celeste.
            </p>
          </div>
          <Link
            href="/play/blitz"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 font-heading text-sm font-black text-amber-600 shadow-[0_3px_0_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5 hover:shadow-[0_5px_0_rgba(0,0,0,0.1)]"
          >
            Play Blitz &rarr;
          </Link>
        </div>
        <div className="flex flex-col justify-center p-4 lg:pr-8 lg:pl-0 lg:py-7">
          <div className="flex flex-col gap-0 rounded-[14px] bg-card p-4 shadow-[0_2px_12px_rgba(0,0,0,0.12)]">
            <p className="mb-2.5 font-heading text-[8px] font-extrabold uppercase tracking-[0.22em] text-muted-foreground">
              Popular topics
            </p>
            <div className="flex flex-col gap-1.5">
              {topicsWithCounts.map((topic) => (
                <div
                  key={topic.slug}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-[9px] border border-border bg-secondary/50 px-3.5 py-2.5 transition-colors hover:bg-secondary"
                >
                  <span className="font-heading text-xs font-extrabold text-foreground">
                    {topic.icon} {topic.name}
                  </span>
                  <span className="font-heading text-[10px] font-semibold text-muted-foreground">
                    {topic.count} games
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
