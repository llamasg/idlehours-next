'use client'

import type { Offer, Sticker } from '../data/offers'
import BoxArt from './BoxArt'
import OfferCard from './OfferCard'
import TransitionCard from './TransitionCard'

interface GameScreenProps {
  gameName: string
  balance: number
  vision: number
  round: number
  offerInRound: number
  stickers: Sticker[]
  currentOffer: Offer | null
  showTransition: boolean
  transitionData: { title: string; text: string } | null
  roundName: string
  onAccept: () => void
  onPass: () => void
  onContinue: () => void
}

export default function GameScreen({
  gameName,
  balance,
  vision,
  round,
  offerInRound,
  stickers,
  currentOffer,
  showTransition,
  transitionData,
  roundName,
  onAccept,
  onPass,
  onContinue,
}: GameScreenProps) {
  const balanceColour =
    balance < 100
      ? 'text-red-500'
      : balance < 200
        ? 'text-amber-500'
        : 'text-foreground'

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3">
        <span className="font-heading text-sm font-bold text-foreground">
          &#9670; Ship It
        </span>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground">
              Balance
            </p>
            <p className={`font-heading text-sm font-bold ${balanceColour}`}>
              ${balance}
            </p>
          </div>
          <div className="text-right">
            <p className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground">
              Burn / day
            </p>
            <p className="font-heading text-sm font-bold text-amber-500">
              $100
            </p>
          </div>
          <div className="text-right">
            <p className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground">
              Offers today
            </p>
            <p className="font-heading text-sm font-bold text-foreground">
              {3 - offerInRound}
            </p>
          </div>
        </div>
      </div>

      {/* Stage dots */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${
              i < round
                ? 'bg-primary'
                : i === round
                  ? 'bg-primary ring-2 ring-primary/30'
                  : 'bg-muted/50'
            }`}
          />
        ))}
        <span className="ml-2 font-heading text-xs text-muted-foreground">
          {roundName}
        </span>
      </div>

      {/* Two-panel layout */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
        {/* Left: Box art */}
        <div className="mb-6 lg:mb-0">
          <BoxArt gameName={gameName} stickers={stickers} vision={vision} />
        </div>

        {/* Right: Offer or Transition */}
        <div>
          {showTransition && transitionData ? (
            <TransitionCard
              roundName={roundName}
              title={transitionData.title}
              text={transitionData.text}
              onContinue={onContinue}
            />
          ) : currentOffer ? (
            <OfferCard
              offer={currentOffer}
              roundIndex={round}
              offerIndex={offerInRound}
              onAccept={onAccept}
              onPass={onPass}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
