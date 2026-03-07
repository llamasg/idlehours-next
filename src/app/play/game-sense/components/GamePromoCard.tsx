'use client'

import type { SanityGameCard } from '../lib/useSanityGame'
import { useGameLightbox } from '@/context/GameLightboxContext'

interface GamePromoCardProps {
  game: SanityGameCard
}

export default function GamePromoCard({ game }: GamePromoCardProps) {
  const { openLightbox, allGames } = useGameLightbox()
  const fullGame = allGames.find((g) => g.slug.current === game.slug)
  const firstAffiliateLink = game.affiliateLinks?.[0] ?? null

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/60 bg-muted/30">
      {game.coverImage && (
        <div className="h-[120px] w-full overflow-hidden bg-secondary">
          <img
            src={game.coverImage}
            alt={game.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <h3 className="font-heading text-sm font-semibold text-foreground">
          {game.title}
        </h3>

        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {game.shortDescription}
        </p>

        {game.platforms.length > 0 && (
          <p className="mt-2 font-heading text-[10px] uppercase tracking-wider text-muted-foreground/70">
            {game.platforms.join(' · ')}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => fullGame && openLightbox(fullGame)}
            className="rounded-full bg-primary/10 px-4 py-1.5 font-heading text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            View More
          </button>

          {firstAffiliateLink && (
            <a
              href={firstAffiliateLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 font-heading text-xs font-semibold text-white transition-transform hover:scale-105"
            >
              {firstAffiliateLink.label}
              <span className="inline-block shrink-0 bg-current" style={{ width: '10px', height: '10px', WebkitMask: 'url(/images/icons/icon_click-hover-mouse-tap-cursor.svg) no-repeat center / contain', mask: 'url(/images/icons/icon_click-hover-mouse-tap-cursor.svg) no-repeat center / contain' }} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
