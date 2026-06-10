'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import type { DailyGameSlug } from '@/lib/ranks'
import { entrance } from '@/lib/animations'

// "Today's game" / "View past games" pill pair, previously copied six times
// across the three daily games' in-game and post-game states. Normalisations
// applied when this landed: all archive links go directly to
// /play/archive?game=<slug> (game-sense previously bounced through its own
// /archive redirect page), all pills carry icons (street-date's lacked them),
// and "Today's game" is hidden when already on today's puzzle.

function Pills({ slug, today }: { slug: DailyGameSlug; today: boolean }) {
  return (
    <>
      {!today && (
        <Link href={`/play/${slug}`} className="bvl-purple">
          <img src="/images/icons/icon_Target-aim-practice-games-play.svg" alt="" className="h-5 w-5 brightness-0 invert" />
          Today&apos;s game
        </Link>
      )}
      <Link href={`/play/archive?game=${slug}`} className="bvl-purple">
        <img src="/images/icons/icon_hourglass-loading-filtering-timer.svg" alt="" className="h-5 w-5 brightness-0 invert" />
        View past games
      </Link>
    </>
  )
}

/** Post-game variant: share button + pills, each popping in on pgStep 1. */
export function PostGameNavPills({
  slug,
  today,
  pgStep,
  share,
  className = 'mb-6 flex flex-wrap items-center justify-center gap-4',
}: {
  slug: DailyGameSlug
  today: boolean
  pgStep: number
  share?: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      {share && <div style={entrance('pop', pgStep >= 1, 150)}>{share}</div>}
      {!today && (
        <div style={entrance('pop', pgStep >= 1, 300)}>
          <Link href={`/play/${slug}`} className="bvl-purple">
            <img src="/images/icons/icon_Target-aim-practice-games-play.svg" alt="" className="h-5 w-5 brightness-0 invert" />
            Today&apos;s game
          </Link>
        </div>
      )}
      <div style={entrance('pop', pgStep >= 1, 450)}>
        <Link href={`/play/archive?game=${slug}`} className="bvl-purple">
          <img src="/images/icons/icon_hourglass-loading-filtering-timer.svg" alt="" className="h-5 w-5 brightness-0 invert" />
          View past games
        </Link>
      </div>
    </div>
  )
}

/** In-game variant: plain pill pair — the caller's wrapper owns entrance styling. */
export default function GameNavPills({ slug, today }: { slug: DailyGameSlug; today: boolean }) {
  return <Pills slug={slug} today={today} />
}
