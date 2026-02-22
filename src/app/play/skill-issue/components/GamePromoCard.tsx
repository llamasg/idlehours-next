'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { SanityGameCard } from '../lib/useSanityGame'

interface GamePromoCardProps {
  game: SanityGameCard
}

export default function GamePromoCard({ game }: GamePromoCardProps) {
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

        <p className="mt-1 line-clamp-2 font-body text-xs text-muted-foreground">
          {game.shortDescription}
        </p>

        {game.platforms.length > 0 && (
          <p className="mt-2 font-heading text-[10px] uppercase tracking-wider text-muted-foreground/70">
            {game.platforms.join(' · ')}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <Link
            href={`/games/${game.slug}`}
            className="rounded-full bg-primary/10 px-4 py-1.5 font-heading text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            View More
          </Link>

          {firstAffiliateLink && (
            <a
              href={firstAffiliateLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 font-heading text-xs font-semibold text-white transition-transform hover:scale-105"
            >
              {firstAffiliateLink.label}
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
