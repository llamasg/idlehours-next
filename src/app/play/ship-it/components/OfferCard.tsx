'use client'

import Image from 'next/image'
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
      {/* Desktop: horizontal layout — character left, content right */}
      {/* Mobile: stacked vertically */}
      <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:gap-6">
        {/* Left: Character portrait + Nametag */}
        <div className="flex flex-shrink-0 flex-col items-center">
          {/* Portrait */}
          <div className="relative h-[160px] w-[160px] overflow-hidden rounded-full lg:h-[180px] lg:w-[180px]">
            <Image
              src={`/images/ship_it_characters/${offer.exec.image}`}
              alt={offer.exec.name}
              fill
              className="object-cover"
              sizes="180px"
            />
          </div>

          {/* Nametag — using nametag.png as background */}
          <div className="relative -mt-6 w-[200px] lg:-mt-8 lg:w-[220px]">
            <Image
              src="/images/ship_it_characters/nametag.png"
              alt=""
              width={440}
              height={200}
              className="w-full"
              aria-hidden="true"
            />
            {/* Text overlay positioned on the white area of the nametag */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
              <p className="font-heading text-sm font-black uppercase tracking-wide text-black lg:text-base">
                {offer.exec.name}
              </p>
              <p className="font-heading text-[10px] font-normal text-black/60 lg:text-[11px]">
                {offer.exec.title}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Offer label, speech bubble, stats, buttons */}
        <div className="w-full min-w-0 flex-1">
          {/* Offer label */}
          <p className="mb-3 font-heading text-sm uppercase tracking-wider text-muted-foreground lg:text-right">
            Offer {offerIndex + 1} of 3
          </p>

          {/* Speech bubble — tail points left toward character on desktop */}
          <div className="relative rounded-2xl border border-border/40 bg-white px-5 py-4 shadow-sm dark:bg-card">
            {/* Tail pointing left (desktop only) */}
            <div className="absolute -left-2.5 top-8 hidden h-5 w-5 rotate-45 border-b border-l border-border/40 bg-white dark:bg-card lg:block" />
            <p className="relative font-heading text-sm font-normal leading-relaxed text-black dark:text-foreground lg:text-base">
              {offer.pitch}
            </p>
          </div>

          {/* Stats pills */}
          <div className="mt-4 flex gap-3">
            <div className="flex-1 rounded-xl border border-border/40 bg-white px-4 py-3 text-center shadow-sm dark:bg-card">
              <p className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground">
                Funding
              </p>
              <p
                className={`font-heading text-xl font-bold ${
                  offer.fundingVal > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-black dark:text-foreground'
                }`}
              >
                {offer.funding}
              </p>
            </div>
            <div className="flex-1 rounded-xl border border-border/40 bg-white px-4 py-3 text-center shadow-sm dark:bg-card">
              <p className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground">
                Vision
              </p>
              <p
                className={`font-heading text-xl font-bold ${
                  offer.visionVal > 0
                    ? 'text-red-600 dark:text-red-400'
                    : offer.visionVal < 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-black dark:text-foreground'
                }`}
              >
                {offer.vision}
              </p>
            </div>
          </div>

          {/* Accept / Pass buttons */}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={onAccept}
              className="flex-1 rounded-full bg-emerald-600 py-3.5 font-heading text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-emerald-700 active:scale-[0.98]"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={onPass}
              className="flex-1 rounded-full bg-amber-700 py-3.5 font-heading text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-amber-800 active:scale-[0.98]"
            >
              Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
