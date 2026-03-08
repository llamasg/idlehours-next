'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo, use } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import DiscoverMore from '@/components/DiscoverMore'
import Link from 'next/link'
import {
  getYearForDate,
  getGamesForDate,
  formatGameNumber,
  formatDisplayDate,
  isPlayableDate,
  isToday,
} from '../lib/dateUtils'
import {
  loadDayState,
  saveDayState,
  WAGER_MULT,
  PTS_BY_ATTEMPT,
  type DayState,
  type Wager,
} from '../lib/storage'
import AnimatedScore from '@/components/AnimatedScore'
import CoverStrip from '../components/CoverStrip'
import YearInput from '../components/YearInput'
import WagerSelector from '../components/WagerSelector'
import GameEndModal from '@/components/games/GameEndModal'
import {
  COPY,
  pickRandom,
  getStreetDateRank,
  STREET_DATE_FLAVOUR,
} from '@/components/games/GameEndModal.copy'
import { igdbCoverUrl } from '../lib/imageUtils'
import RulesModal from '../components/RulesModal'
import ResultCard from '@/components/games/ResultCard'
import DailyBadgeShelf from '@/components/games/DailyBadgeShelf'

const MAX_ATTEMPTS = 5

export default function StreetDateDayPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = use(params)

  const [state, setState] = useState<DayState | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [viewingCoverIndex, setViewingCoverIndex] = useState(0)
  const [showRules, setShowRules] = useState(false)

  const answerYear = getYearForDate(date)
  const roundGames = getGamesForDate(date)
  const playable = isPlayableDate(date)
  const today = isToday(date)

  useEffect(() => {
    const loaded = loadDayState(date)
    setState(loaded)
    setViewingCoverIndex(loaded.currentCoverIndex)
    if (loaded.finished) {
      setShowModal(true)
    }
  }, [date])

  const handleWagerChange = useCallback(
    (wager: Wager) => {
      if (!state || state.wagerLocked) return
      const newState: DayState = { ...state, wager }
      setState(newState)
      saveDayState(date, newState)
    },
    [state, date],
  )

  const handleSubmit = useCallback(
    (yearGuessed: number) => {
      if (!state || state.won || state.finished) return

      const coverIndex = state.currentCoverIndex
      const isCorrect = yearGuessed === answerYear

      const wagerLocked = true
      const guessHistory = [...state.guessHistory, yearGuessed]

      if (isCorrect) {
        const basePts = PTS_BY_ATTEMPT[coverIndex] ?? 200
        const score = Math.round(basePts * WAGER_MULT[state.wager])
        const stars = MAX_ATTEMPTS - coverIndex

        const newState: DayState = {
          ...state,
          attempts: [
            ...state.attempts,
            { coverIndex, yearGuessed, skipped: false },
          ],
          won: true,
          finished: true,
          stars,
          score,
          currentCoverIndex: coverIndex,
          wagerLocked,
          guessHistory,
        }
        setState(newState)
        saveDayState(date, newState)
        setShowModal(true)
      } else {
        const nextIndex = coverIndex + 1
        const finished = nextIndex >= MAX_ATTEMPTS

        const newState: DayState = {
          ...state,
          attempts: [
            ...state.attempts,
            { coverIndex, yearGuessed, skipped: false },
          ],
          won: false,
          finished,
          stars: 0,
          score: 0,
          currentCoverIndex: finished ? coverIndex : nextIndex,
          wagerLocked,
          guessHistory,
        }
        setState(newState)
        saveDayState(date, newState)
        setViewingCoverIndex(finished ? coverIndex : nextIndex)

        if (finished) {
          setTimeout(() => setShowModal(true), 800)
        }
      }
    },
    [state, answerYear, date],
  )

  // Modal copy — picked once when modal opens
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const modalCopy = useMemo(() => {
    const won = state?.won ?? false
    const score = state?.score ?? 0
    const result = won ? 'win' : 'loss'
    const rankName = getStreetDateRank(score)
    return {
      result: result as 'win' | 'loss',
      heading: pickRandom(COPY[result].headings),
      subheading: pickRandom(COPY[result].subheadings),
      rankName,
      rankFlavour: pickRandom(STREET_DATE_FLAVOUR[rankName]),
    }
  }, [showModal])

  if (!state) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </main>
        <SiteFooter />
      </>
    )
  }

  const guessHistoryEntries = state.guessHistory.map((year) => ({
    year,
    direction: year === answerYear
      ? 'correct' as const
      : year < answerYear
      ? 'too-low' as const
      : 'too-high' as const,
  }))

  const revealedCount = state.currentCoverIndex + 1
  const showInput = playable && !state.finished
  const attemptsUsed = state.attempts.filter((a) => !a.skipped).length

  // Current score display: show what you'd get if you guess correctly now
  const currentPotential = PTS_BY_ATTEMPT[state.currentCoverIndex] ?? 200
  const displayScore = state.finished
    ? state.score
    : Math.round(currentPotential * WAGER_MULT[state.wager])

  return (
    <>
      <Header />

      <main className="font-game mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Header — matches Game Sense */}
        <div className="mb-8 text-center">
          <h1 className="text-[clamp(40px,8vw,64px)] font-black uppercase leading-none text-[hsl(var(--game-blue))]">
            Street Date
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Guess the year
          </p>
          <p className="mt-0.5 font-heading text-xs text-muted-foreground/70">
            {formatGameNumber(date)} &middot; {formatDisplayDate(date)}
          </p>

          {/* Score pill */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-[hsl(var(--game-blue))]/20 bg-card px-5 py-2">
            <AnimatedScore
              value={displayScore}
              className="font-heading text-2xl font-black"
            />
            <span className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
              pts
            </span>
          </div>
        </div>

        {!playable && (
          <div className="mb-8 rounded-lg border border-border/60 bg-muted/30 px-4 py-6 text-center">
            <p className="text-muted-foreground">
              This game isn&apos;t available yet. Check back on the right day!
            </p>
            <Link
              href="/play/street-date"
              className="mt-3 inline-block text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Go to today&apos;s game &rarr;
            </Link>
          </div>
        )}

        {playable && (
          <CoverStrip
            games={roundGames}
            revealedCount={revealedCount}
            activeIndex={viewingCoverIndex}
            attempts={state.attempts}
            onCoverClick={setViewingCoverIndex}
          />
        )}

        {showInput && (
          <div className="mb-6">
            <WagerSelector
              selected={state.wager}
              locked={state.wagerLocked}
              onSelect={handleWagerChange}
            />
          </div>
        )}

        {showInput && (
          <YearInput
            onSubmit={handleSubmit}
            disabled={false}
            guessHistory={guessHistoryEntries}
            attemptsUsed={attemptsUsed}
            maxAttempts={MAX_ATTEMPTS}
            onHelpClick={() => setShowRules(true)}
          />
        )}

        {/* Finished — post-game page (when modal closed) */}
        {state.finished && !showModal && (
          <>
            {/* Nav pills — above showcase */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
              {!today && (
                <Link
                  href="/play/street-date"
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                >
                  Play today&apos;s game
                </Link>
              )}
              <Link
                href="/play/street-date/archive"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              >
                Browse the archive
              </Link>
            </div>

            <div className="mb-6">
              <ResultCard
                game="street-date"
                score={state.score}
                streak={0}
                won={state.won}
                puzzleLabel={`Street Date ${formatGameNumber(date)} \u00b7 ${formatDisplayDate(date)}`}
                onViewResults={() => setShowModal(true)}
              />
            </div>

            <div className="mb-8">
              <DailyBadgeShelf currentGame="street-date" />
            </div>

            <div className="mb-8">
              <DiscoverMore currentGame="street-date" />
            </div>
          </>
        )}

        {/* Nav pills — during gameplay */}
        {!(state.finished && !showModal) && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {!today && (
              <Link
                href="/play/street-date"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              >
                Play today&apos;s game
              </Link>
            )}
            <Link
              href="/play/street-date/archive"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-border/60 px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              Browse the archive
            </Link>
          </div>
        )}
      </main>

      <SiteFooter />

      {showModal && state.finished && (
        <GameEndModal
          result={modalCopy.result}
          score={state.score}
          heading={modalCopy.heading}
          subheading={modalCopy.subheading}
          rankName={modalCopy.rankName}
          rankFlavour={modalCopy.rankFlavour}
          stats={[
            { label: 'Score', value: String(state.score) },
            { label: 'Guessed On', value: `Clue ${state.attempts.length}/${MAX_ATTEMPTS}` },
            { label: 'Wager', value: state.wager === 'high' ? 'All In' : state.wager === 'mid' ? 'Confident' : 'Cautious' },
          ]}
          heroZone={
            <div className="px-6 pt-6 pb-2">
              <p className="text-center font-heading text-xs font-semibold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-light))]">
                The answer
              </p>
              <p className="text-center font-heading text-5xl font-black text-[hsl(var(--game-blue))]">
                {answerYear}
              </p>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {roundGames.map((game, i) => {
                  const wasGuessedOn = state.attempts.length - 1 === i && state.won
                  const neverReached = i > state.currentCoverIndex
                  return (
                    <div key={game.id} className="relative flex flex-col items-center">
                      <div
                        className={`aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted/30 shadow-sm ${
                          wasGuessedOn ? 'ring-2 ring-[hsl(var(--game-blue))] scale-105' : ''
                        } ${neverReached ? 'opacity-40' : ''}`}
                      >
                        <img
                          src={igdbCoverUrl(game.igdbImageId)}
                          alt={game.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {wasGuessedOn && (
                        <span className="absolute -top-2 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--game-blue))] text-[10px] font-bold text-white shadow">
                          {i + 1}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          }
          onShare={async () => {
            const number = formatGameNumber(date)
            const wagerEmoji = state.wager === 'high' ? '\u{1F525}' : state.wager === 'mid' ? '\u{1F3AF}' : '\u{1F6E1}\u{FE0F}'
            const lines = [
              `Street Date ${number} \u00b7 ${state.score}/1000 ${wagerEmoji}`,
              'idlehours.co.uk/play/street-date',
            ]
            try { await navigator.clipboard.writeText(lines.join('\n')) } catch {}
          }}
          onClose={() => setShowModal(false)}
        />
      )}

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </>
  )
}
