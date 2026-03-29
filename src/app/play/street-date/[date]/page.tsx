'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo, useRef, use } from 'react'
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
import { entrance, useEntranceSteps } from '@/lib/animations'

const MAX_ATTEMPTS = 5
const spring = 'cubic-bezier(0.34,1.5,0.64,1)'

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
  const [wipeStarted, setWipeStarted] = useState(false)
  const wipeTriggered = useRef(false)

  // Entrance animation: 0=waiting, 1=title, 2=title moves up + box, 3=content, 4=input, 5=rest, 6=done
  const [entranceStep, setEntranceStep] = useState(0)

  // Post-game sequencer — matches Game Sense structure
  const isPostGameComplete = state ? state.finished : false
  const pgGaps = useMemo(() => [0, 3500, 400, 300, 300, 400, 500], [])
  const pgStep = useEntranceSteps(7, pgGaps, isPostGameComplete && !showModal)
  const shouldAnimate = state ? !state.finished : true

  const answerYear = getYearForDate(date)
  const roundGames = getGamesForDate(date)
  const playable = isPlayableDate(date)
  const today = isToday(date)

  useEffect(() => {
    const loaded = loadDayState(date)
    setState(loaded)
    setViewingCoverIndex(loaded.currentCoverIndex)
  }, [date])

  // Entrance animation sequence
  useEffect(() => {
    if (!state) return
    const alreadyDone = state.finished
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (alreadyDone || reducedMotion) {
      setWipeStarted(true)
      setEntranceStep(6)
      return
    }
    requestAnimationFrame(() => requestAnimationFrame(() => setWipeStarted(true)))
    const t1 = setTimeout(() => setEntranceStep(1), 350)
    const t2 = setTimeout(() => setEntranceStep(2), 1700)
    const t3 = setTimeout(() => setEntranceStep(3), 2400)
    const t4 = setTimeout(() => setEntranceStep(4), 3100)
    const t5 = setTimeout(() => setEntranceStep(5), 3400)
    const t6 = setTimeout(() => setEntranceStep(6), 3900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!state])

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
        <div
          className="game-container mx-auto mt-[15px] flex min-h-[900px] max-w-7xl items-center justify-center"
          style={{
            background: 'linear-gradient(155deg, #1A7A40, #0d1f12)',
            borderRadius: 20,
            boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 12px rgba(0,0,0,0.12)',
          }}
        >
          <p className="text-center text-white/40">Loading...</p>
        </div>
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

  const isPostGame = state.finished && !showModal

  return (
    <>
      <Header />

      {/* Green game world */}
      <div
        className="game-container mx-4 -mt-16 flex flex-1 flex-col rounded-2xl sm:mt-4 sm:rounded-[20px]"
        style={{
          background: 'linear-gradient(155deg, #1A7A40, #0d1f12)',
          borderRadius: 20,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 12px rgba(0,0,0,0.12)',
          clipPath: (!shouldAnimate || wipeStarted) ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)',
          transition: shouldAnimate ? 'clip-path 0.7s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      >
        <main className={`font-game mx-auto flex flex-1 flex-col px-4 py-8 ${isPostGame ? 'w-full lg:px-8' : 'max-w-4xl justify-center'}`}>
          {/* Game header */}
          <div className="mb-6 text-center">
            {/* Title + subtitle — animate like Game Sense */}
            <div
              className="transition-all duration-700 ease-out"
              style={
                isPostGame
                  ? entrance('slide-up', pgStep >= 4)
                  : (entranceStep < 1
                      ? { opacity: 0, transform: 'translateY(120px)' }
                      : entranceStep < 2
                        ? { opacity: 1, transform: 'translateY(120px)' }
                        : { opacity: 1, transform: 'translateY(0)' })
              }
            >
              <h1 className="text-[clamp(40px,8vw,64px)] font-black uppercase leading-none text-white">
                {['Street', 'Date'].map((word, i) => (
                  <span
                    key={word}
                    className="inline-block"
                    style={
                      entranceStep >= 1
                        ? { animation: `gs-word-pop 0.25s cubic-bezier(0.34,1.56,0.64,1) ${0.1 + i * 0.3}s both` }
                        : { opacity: 0 }
                    }
                  >
                    {word}{i === 0 ? '\u00a0' : ''}
                  </span>
                ))}
              </h1>
              <p className="mt-1.5 text-sm text-white/60">
                Guess the year
              </p>
            </div>

            {/* Date + score pill — fade in with rest */}
            <div
              style={
                isPostGame
                  ? entrance('fade', pgStep >= 4)
                  : (entranceStep < 5
                      ? { opacity: 0 }
                      : entranceStep < 6
                        ? { animation: `gs-fade-in 0.5s ${spring} both` }
                        : undefined)
              }
            >
              <p className="mt-0.5 font-heading text-xs text-white/40">
                {formatGameNumber(date)} &middot; {formatDisplayDate(date)}
              </p>

              {/* Score pill — only during gameplay */}
              {!isPostGame && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-white/20 bg-white px-5 py-2">
                  <AnimatedScore
                    value={displayScore}
                    className="font-heading text-2xl font-black"
                  />
                  <span className="font-heading text-xs uppercase tracking-wider text-[hsl(var(--game-ink-light))]">
                    pts
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Not playable message */}
          {!playable && (
            <div className="mb-8 rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-center">
              <p className="text-white/60">
                This game isn&apos;t available yet. Check back on the right day!
              </p>
              <Link
                href="/play/street-date"
                className="mt-3 inline-block text-sm font-semibold text-white transition-colors hover:text-white/80"
              >
                Go to today&apos;s game &rarr;
              </Link>
            </div>
          )}

          {/* Game area — white container for clarity on green bg */}
          {playable && !state.finished && (
            <div
              className="relative z-10 mb-8 rounded-2xl bg-white/95 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out sm:p-6"
              style={entranceStep < 2 ? { opacity: 0, transform: 'scale(0)' } : entranceStep < 6 ? { animation: `gs-box-in 0.7s ${spring} both` } : undefined}
            >
              {/* Cover strip */}
              <div
                className="transition-opacity duration-300 ease-out"
                style={{ opacity: entranceStep < 3 ? 0 : 1 }}
              >
                <CoverStrip
                  games={roundGames}
                  revealedCount={revealedCount}
                  activeIndex={viewingCoverIndex}
                  attempts={state.attempts}
                  onCoverClick={setViewingCoverIndex}
                />
              </div>

              {/* Wager selector */}
              {showInput && (
                <div
                  className="mb-6 transition-opacity duration-300 ease-out"
                  style={{ opacity: entranceStep < 3 ? 0 : 1 }}
                >
                  <WagerSelector
                    selected={state.wager}
                    locked={state.wagerLocked}
                    onSelect={handleWagerChange}
                  />
                </div>
              )}

              {/* Year input */}
              {showInput && (
                <div
                  className="transition-opacity duration-300 ease-out"
                  style={{ opacity: entranceStep < 4 ? 0 : 1 }}
                >
                  <YearInput
                    onSubmit={handleSubmit}
                    disabled={false}
                    guessHistory={guessHistoryEntries}
                    attemptsUsed={attemptsUsed}
                    maxAttempts={MAX_ATTEMPTS}
                    onHelpClick={() => setShowRules(true)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Post-game — matches Game Sense structure */}
          {isPostGame && (
            <>
              {/* Nav pills */}
              <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
                {!today && (
                  <div style={entrance('pop', pgStep >= 1, 300)}>
                    <Link href="/play/street-date" className="bvl-purple">
                      <img src="/images/icons/icon_Target-aim-practice-games-play.svg" alt="" className="h-5 w-5 brightness-0 invert" />
                      Today&apos;s game
                    </Link>
                  </div>
                )}
                <div style={entrance('pop', pgStep >= 1, 450)}>
                  <Link href="/play/archive?game=street-date" className="bvl-purple">
                    <img src="/images/icons/icon_hourglass-loading-filtering-timer.svg" alt="" className="h-5 w-5 brightness-0 invert" />
                    View past games
                  </Link>
                </div>
              </div>

              {/* Two-column post-game: left (55%) badges + results, right (45%) info */}
              <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[55fr_45fr]">

                {/* Left column: badge shelf → ResultCard */}
                <div className="order-2 flex flex-col gap-6 lg:order-1">
                  <div
                    className="grid transition-[grid-template-rows] duration-700 ease-out"
                    style={{ gridTemplateRows: pgStep >= 5 ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <DailyBadgeShelf currentGame="street-date" animateStamp={pgStep >= 5} />
                    </div>
                  </div>

                  <ResultCard
                    game="street-date"
                    score={state.score}
                    streak={0}
                    won={state.won}
                    puzzleLabel={`Street Date ${formatGameNumber(date)} \u00b7 ${formatDisplayDate(date)}`}
                    onViewResults={() => setShowModal(true)}
                    animateEntrance={pgStep >= 1}
                  />
                </div>

                {/* Right column: game info card */}
                <div className="order-1 lg:order-2" style={entrance('slide-up', pgStep >= 2)}>
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white/95 shadow-sm">
                    <div className="p-5 sm:p-6">
                      <p className="text-center font-heading text-xs font-semibold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-light))]">
                        The answer
                      </p>
                      <p className="text-center font-heading text-5xl font-black text-[hsl(var(--game-green))]">
                        {answerYear}
                      </p>
                      <div className="mx-auto mt-4 grid max-w-md grid-cols-5 gap-2">
                        {roundGames.map((game, i) => {
                          const wasGuessedOn = state.attempts.length - 1 === i && state.won
                          const neverReached = i > state.currentCoverIndex
                          return (
                            <div key={game.id} className="relative flex flex-col items-center">
                              <div
                                className={`aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted/30 shadow-sm ${
                                  wasGuessedOn ? 'ring-2 ring-[hsl(var(--game-green))] scale-105' : ''
                                } ${neverReached ? 'opacity-40' : ''}`}
                              >
                                <img
                                  src={igdbCoverUrl(game.igdbImageId)}
                                  alt={game.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              {wasGuessedOn && (
                                <span className="absolute -top-2 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--game-green))] text-[10px] font-bold text-white shadow">
                                  {i + 1}
                                </span>
                              )}
                              <p className="mt-1.5 line-clamp-2 w-full text-center font-heading text-[10px] font-medium leading-snug text-[hsl(var(--game-ink-mid))]">
                                {game.title}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Nav pills — during gameplay */}
          {!isPostGame && (
            <div
              className="mt-4 flex flex-wrap items-center justify-center gap-4"
              style={entranceStep < 5 ? { opacity: 0 } : entranceStep < 6 ? { animation: `gs-fade-in 0.5s ${spring} both` } : undefined}
            >
              {!today && (
                <Link href="/play/street-date" className="bvl-purple">
                  <img src="/images/icons/icon_Target-aim-practice-games-play.svg" alt="" className="h-5 w-5 brightness-0 invert" />
                  Today&apos;s game
                </Link>
              )}
              <Link href="/play/archive?game=street-date" className="bvl-purple">
                <img src="/images/icons/icon_hourglass-loading-filtering-timer.svg" alt="" className="h-5 w-5 brightness-0 invert" />
                View past games
              </Link>
            </div>
          )}
        </main>
      </div>

      {/* DiscoverMore — outside the green area */}
      {isPostGame && (
        <div
          className="mx-auto max-w-7xl px-4 py-8 lg:px-8"
          style={entrance('fade', pgStep >= 6)}
        >
          <DiscoverMore currentGame="street-date" />
        </div>
      )}

      <SiteFooter />

      {showModal && state.finished && (
        <GameEndModal
          game="street-date"
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
              <p className="text-center font-heading text-5xl font-black text-[hsl(var(--game-green))]">
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
                          wasGuessedOn ? 'ring-2 ring-[hsl(var(--game-green))] scale-105' : ''
                        } ${neverReached ? 'opacity-40' : ''}`}
                      >
                        <img
                          src={igdbCoverUrl(game.igdbImageId)}
                          alt={game.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {wasGuessedOn && (
                        <span className="absolute -top-2 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--game-green))] text-[10px] font-bold text-white shadow">
                          {i + 1}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          }
          shareText={(() => {
            const number = formatGameNumber(date)
            const wagerEmoji = state.wager === 'high' ? '\u{1F525}' : state.wager === 'mid' ? '\u{1F3AF}' : '\u{1F6E1}\u{FE0F}'
            return `Street Date ${number} \u00b7 ${state.score}/1000 ${wagerEmoji}\nidlehours.co.uk/play/street-date`
          })()}
          shareUrl="https://idlehours.co.uk/play/street-date"
          onClose={() => setShowModal(false)}
        />
      )}

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </>
  )
}
