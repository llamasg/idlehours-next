'use client'

import type { Offer, Sticker } from '../data/offers'
import BoxArt from './BoxArt'
import OfferCard from './OfferCard'
import TransitionCard from './TransitionCard'
import ProgressBar from './ProgressBar'

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
  decisions: ('accept' | 'pass')[]
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
  decisions,
  onAccept,
  onPass,
  onContinue,
}: GameScreenProps) {
  const balanceColour =
    balance < 100
      ? 'text-red-500'
      : balance < 200
        ? 'text-amber-500'
        : 'text-amber-700 dark:text-amber-400'

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Top bar — NYT-style stat pills, large */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        <div className="min-w-[140px] rounded-xl border border-border/40 bg-white px-6 py-4 text-center shadow-sm dark:bg-card sm:min-w-[160px] sm:px-8">
          <p className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Balance
          </p>
          <p className={`font-heading text-3xl font-black ${balanceColour}`}>
            ${balance}
          </p>
        </div>
        <div className="min-w-[140px] rounded-xl border border-border/40 bg-white px-6 py-4 text-center shadow-sm dark:bg-card sm:min-w-[160px] sm:px-8">
          <p className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Daily Costs
          </p>
          <p className="font-heading text-3xl font-black text-amber-600 dark:text-amber-400">
            $100
          </p>
        </div>
        <div className="min-w-[140px] rounded-xl border border-border/40 bg-white px-6 py-4 text-center shadow-sm dark:bg-card sm:min-w-[160px] sm:px-8">
          <p className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Offers
          </p>
          <p className="font-heading text-3xl font-black text-black dark:text-foreground">
            {3 - offerInRound}
          </p>
        </div>
      </div>

      {/* Two-panel layout — wider on desktop */}
      <div className="lg:grid lg:grid-cols-[1fr_1.4fr] lg:gap-10 lg:items-center xl:gap-14">
        {/* Left: Box art */}
        <div className="mb-8 lg:mb-0">
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

      {/* Progress bar */}
      <ProgressBar
        decisions={decisions}
        round={round}
        offerInRound={offerInRound}
        showTransition={showTransition}
      />
    </div>
  )
}
