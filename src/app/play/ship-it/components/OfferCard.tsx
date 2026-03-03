'use client'

import type { Offer } from '../data/offers'

interface OfferCardProps {
  offer: Offer
  roundIndex: number
  offerIndex: number
  onAccept: () => void
  onPass: () => void
}

export default function OfferCard({
  offer,
  roundIndex,
  offerIndex,
  onAccept,
  onPass,
}: OfferCardProps) {
  return (
    <div>
      {/* Round label */}
      <p className="mb-3 text-center font-heading text-xs uppercase tracking-wider text-muted-foreground">
        Round {roundIndex + 1} &middot; Offer {offerIndex + 1} of 3
      </p>

      {/* Card */}
      <div className="relative rounded-2xl border border-border/60 bg-card p-6">
        {/* Type badge */}
        <span className="absolute right-5 top-5 font-heading text-[10px] uppercase tracking-wider text-muted-foreground/60">
          {offer.type}
        </span>

        {/* Exec header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 text-2xl">
            {offer.exec.avatar}
          </div>
          <div>
            <p className="font-heading text-base font-bold text-foreground">
              {offer.exec.name}
            </p>
            <p className="font-body text-xs text-muted-foreground">
              {offer.exec.title}
            </p>
          </div>
        </div>

        {/* Pitch */}
        <p className="mt-4 font-body text-sm italic leading-relaxed text-foreground/80">
          {offer.pitch}
        </p>

        {/* Stats row */}
        <div className="mt-4 flex gap-6">
          <div>
            <p className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground">
              Funding
            </p>
            <p
              className={`font-heading text-lg font-bold ${
                offer.fundingVal > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-foreground'
              }`}
            >
              {offer.funding}
            </p>
          </div>
          <div>
            <p className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground">
              Vision hit
            </p>
            <p
              className={`font-heading text-lg font-bold ${
                offer.visionVal > 0
                  ? 'text-red-600 dark:text-red-400'
                  : offer.visionVal < 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-foreground'
              }`}
            >
              {offer.vision}
            </p>
          </div>
        </div>

        {/* Buttons row */}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onPass}
            className="flex-1 rounded-full border-2 border-border/60 py-3 font-heading text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/30"
          >
            &#10005; Pass
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 rounded-full bg-primary py-3 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary/80"
          >
            &#10003; Accept
          </button>
        </div>
      </div>
    </div>
  )
}
