'use client'

export const dynamic = 'force-dynamic'

import { useState, useCallback } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import {
  BAD_OFFERS,
  GOOD_OFFERS,
  ROUNDS,
  type Offer,
  type Sticker,
} from './data/offers'
import StartScreen from './components/StartScreen'
import GameScreen from './components/GameScreen'
import EndScreen from './components/EndScreen'
import LoseScreen from './components/LoseScreen'

// ─── Types ────────────────────────────────────────────────────────────────────

type GamePhase = 'start' | 'playing' | 'transition' | 'end' | 'lose'

interface GameState {
  gameName: string
  balance: number
  vision: number
  round: number
  offerInRound: number
  acceptedOffers: Offer[]
  stickers: Sticker[]
  roundQueue: Offer[][]
  decisions: ('accept' | 'pass')[]
  phase: GamePhase
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_STATE: GameState = {
  gameName: '',
  balance: 300,
  vision: 100,
  round: 0,
  offerInRound: 0,
  acceptedOffers: [],
  stickers: [],
  roundQueue: [],
  decisions: [],
  phase: 'start',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildRoundQueue(): Offer[][] {
  const bads = shuffleArray(BAD_OFFERS)
  const goods = shuffleArray(GOOD_OFFERS)

  // Pick 7 bad offers and 2 good offers
  const selectedBads = bads.slice(0, 7)
  const selectedGoods = goods.slice(0, 2)

  // Seed good offers: 1 in round 1 position 3 (index 2), 1 in round 2 position 1 (index 0)
  const r1: Offer[] = [selectedBads[0], selectedBads[1], selectedGoods[0]]
  const r2: Offer[] = [selectedGoods[1], selectedBads[2], selectedBads[3]]
  const r3: Offer[] = [selectedBads[4], selectedBads[5], selectedBads[6]]

  return [r1, r2, r3]
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function ShipItPage() {
  const [state, setState] = useState<GameState>(INITIAL_STATE)

  // ── Start game ──────────────────────────────────────────────────────────────

  const handleStart = useCallback((gameName: string) => {
    const roundQueue = buildRoundQueue()
    setState({
      ...INITIAL_STATE,
      gameName,
      phase: 'playing',
      roundQueue,
    })
  }, [])

  // ── Accept offer ────────────────────────────────────────────────────────────

  const handleAccept = useCallback(() => {
    setState((prev) => {
      const offer = prev.roundQueue[prev.round]?.[prev.offerInRound]
      if (!offer) return prev

      // Apply offer effects
      const newBalance = prev.balance + offer.fundingVal - 100 // burn rate
      const newVision = Math.max(
        0,
        Math.min(100, prev.vision - offer.visionVal),
      )
      const newAccepted = [...prev.acceptedOffers, offer]
      const newStickers = [...prev.stickers, offer.sticker]
      const newDecisions = [...prev.decisions, 'accept' as const]
      const nextOfferInRound = prev.offerInRound + 1

      // Check bankruptcy
      if (newBalance <= 0) {
        return {
          ...prev,
          balance: 0,
          vision: newVision,
          acceptedOffers: newAccepted,
          stickers: newStickers,
          decisions: newDecisions,
          offerInRound: nextOfferInRound,
          phase: 'lose' as GamePhase,
        }
      }

      // Check round boundaries
      if (nextOfferInRound >= 3) {
        if (prev.round < 2) {
          return {
            ...prev,
            balance: newBalance,
            vision: newVision,
            acceptedOffers: newAccepted,
            stickers: newStickers,
            decisions: newDecisions,
            offerInRound: nextOfferInRound,
            phase: 'transition' as GamePhase,
          }
        }
        // Final round complete
        return {
          ...prev,
          balance: newBalance,
          vision: newVision,
          acceptedOffers: newAccepted,
          stickers: newStickers,
          decisions: newDecisions,
          offerInRound: nextOfferInRound,
          phase: 'end' as GamePhase,
        }
      }

      // Continue playing
      return {
        ...prev,
        balance: newBalance,
        vision: newVision,
        acceptedOffers: newAccepted,
        stickers: newStickers,
        decisions: newDecisions,
        offerInRound: nextOfferInRound,
      }
    })
  }, [])

  // ── Pass on offer ───────────────────────────────────────────────────────────

  const handlePass = useCallback(() => {
    setState((prev) => {
      const newBalance = prev.balance - 100 // burn rate only
      const newDecisions = [...prev.decisions, 'pass' as const]
      const nextOfferInRound = prev.offerInRound + 1

      // Check bankruptcy
      if (newBalance <= 0) {
        return {
          ...prev,
          balance: 0,
          decisions: newDecisions,
          offerInRound: nextOfferInRound,
          phase: 'lose' as GamePhase,
        }
      }

      // Check round boundaries
      if (nextOfferInRound >= 3) {
        if (prev.round < 2) {
          return {
            ...prev,
            balance: newBalance,
            decisions: newDecisions,
            offerInRound: nextOfferInRound,
            phase: 'transition' as GamePhase,
          }
        }
        return {
          ...prev,
          balance: newBalance,
          decisions: newDecisions,
          offerInRound: nextOfferInRound,
          phase: 'end' as GamePhase,
        }
      }

      return {
        ...prev,
        balance: newBalance,
        decisions: newDecisions,
        offerInRound: nextOfferInRound,
      }
    })
  }, [])

  // ── Continue to next round ──────────────────────────────────────────────────

  const handleContinue = useCallback(() => {
    setState((prev) => ({
      ...prev,
      round: prev.round + 1,
      offerInRound: 0,
      phase: 'playing' as GamePhase,
    }))
  }, [])

  // ── Play again ──────────────────────────────────────────────────────────────

  const handlePlayAgain = useCallback(() => {
    setState(INITIAL_STATE)
    window.scrollTo(0, 0)
  }, [])

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Header />
      <main className="game-container mx-auto px-4 py-8">
        {state.phase === 'start' && (
          <div className="mx-auto max-w-lg">
            <StartScreen onStart={handleStart} />
          </div>
        )}

        {(state.phase === 'playing' || state.phase === 'transition') && (
          <div className="mx-auto max-w-6xl">
            <GameScreen
              gameName={state.gameName}
              balance={state.balance}
              vision={state.vision}
              round={state.round}
              offerInRound={state.offerInRound}
              stickers={state.stickers}
              decisions={state.decisions}
              currentOffer={
                state.phase === 'playing'
                  ? (state.roundQueue[state.round]?.[state.offerInRound] ??
                    null)
                  : null
              }
              showTransition={state.phase === 'transition'}
              transitionData={ROUNDS[state.round]?.transition ?? null}
              roundName={ROUNDS[state.round]?.name ?? ''}
              onAccept={handleAccept}
              onPass={handlePass}
              onContinue={handleContinue}
            />
          </div>
        )}

        {state.phase === 'end' && (
          <div className="mx-auto max-w-5xl">
            <EndScreen
              gameName={state.gameName}
              acceptedOffers={state.acceptedOffers}
              balance={state.balance}
              vision={state.vision}
              stickers={state.stickers}
              onPlayAgain={handlePlayAgain}
            />
          </div>
        )}

        {state.phase === 'lose' && (
          <div className="mx-auto max-w-lg">
            <LoseScreen
              gameName={state.gameName}
              balance={state.balance}
              vision={state.vision}
              round={state.round}
              onPlayAgain={handlePlayAgain}
            />
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
