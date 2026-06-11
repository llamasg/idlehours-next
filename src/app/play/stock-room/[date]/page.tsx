'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo, useRef, use } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import DiscoverMore from '@/components/DiscoverMore'
import type { GameEntry } from '@/data/games-db'

import { generateBoard, gameFitsCell } from '../lib/boardGen'
import { loadDayState, saveDayState, type DayState } from '../lib/storage'
import { computeScore, MISS_PENALTY, CELL_COUNT } from '../lib/constants'
import { boardRarity } from '../lib/rarity'
import { formatGameNumber, formatDisplayDate, isPlayableDate, isToday } from '../lib/dateUtils'
import RulesModal from '../components/RulesModal'
import StockGrid from '../components/StockGrid'

import { GAME_THEME } from '@/lib/ranks'
import { formatElapsed } from '@/lib/game-shell/formatElapsed'
import { buildShareText } from '@/lib/game-shell/buildShareText'
import { useMobileThemeColor } from '@/lib/game-shell/useMobileThemeColor'
import { useGameEntrance } from '@/lib/game-shell/useGameEntrance'
import GameWorld from '@/components/games/shell/GameWorld'
import GameTitle from '@/components/games/shell/GameTitle'
import ScorePill from '@/components/games/shell/ScorePill'
import PlayableGuard from '@/components/games/shell/PlayableGuard'
import GameSearchInput from '@/components/games/shell/GameSearchInput'
import GameNavPills, { PostGameNavPills } from '@/components/games/shell/GameNavPills'
import PostGameAnalysisCard, { StatPillRow, CardDivider } from '@/components/games/shell/PostGameAnalysisCard'
import PostGameLeftColumn from '@/components/games/PostGameLeftColumn'
import SplitShareButton from '@/components/games/SplitShareButton'
import { entrance, useEntranceSteps } from '@/lib/animations'
import { SPRING_EASING, POSTGAME_GAPS } from '@/lib/gameConstants'

const THEME = GAME_THEME['stock-room']

export default function StockRoomDayPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = use(params)

  const board = useMemo(() => generateBoard(date), [date])
  const playable = isPlayableDate(date)
  const today = isToday(date)

  const [state, setState] = useState<DayState | null>(null)
  const [activeCell, setActiveCell] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ kind: 'miss' | 'reuse' | 'no-cell'; text: string } | null>(null)
  const [scorePulse, setScorePulse] = useState(false)
  const [floatingCost, setFloatingCost] = useState<{ key: number; cost: number } | null>(null)
  const [showRules, setShowRules] = useState(false)
  const [finishArmed, setFinishArmed] = useState(false)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { entranceStep, wipeStarted } = useGameEntrance(!!state, state ? state.finished : false)
  const shouldAnimate = state ? !state.finished : true

  useMobileThemeColor(THEME.statusBarHex)

  useEffect(() => {
    const loaded = loadDayState(date)
    if (!loaded.startedAt && !loaded.finished) {
      loaded.startedAt = Date.now()
      saveDayState(date, loaded)
    }
    setState(loaded)
  }, [date])

  const isPostGame = state ? state.finished : false
  const pgGaps = useMemo(() => [...POSTGAME_GAPS], [])
  const pgStep = useEntranceSteps(7, pgGaps, isPostGame)

  const filledCount = state ? state.cells.filter(Boolean).length : 0
  const usedIds = useMemo(
    () => (state ? state.cells.filter(Boolean).map((c) => c!.gameId) : []),
    [state],
  )

  const showFeedback = useCallback((kind: 'miss' | 'reuse' | 'no-cell', text: string) => {
    setFeedback({ kind, text })
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    feedbackTimer.current = setTimeout(() => setFeedback(null), 2500)
  }, [])

  const finish = useCallback(
    (current: DayState) => {
      const filled = current.cells.filter(Boolean).map((c) => c!.gameId)
      const finished: DayState = {
        ...current,
        finished: true,
        won: filled.length === CELL_COUNT,
        score: computeScore(filled.length, current.misses),
        rarity: boardRarity(filled),
        endedAt: Date.now(),
      }
      setState(finished)
      saveDayState(date, finished)
      setActiveCell(null)
      setFinishArmed(false)
    },
    [date],
  )

  const handleSubmit = useCallback(
    (game: GameEntry) => {
      if (!state || state.finished) return
      if (activeCell === null || state.cells[activeCell]) {
        showFeedback('no-cell', 'Pick an open cell first.')
        return
      }
      // NO-REUSE: blocked, message, no penalty
      if (usedIds.includes(game.id)) {
        showFeedback('reuse', `${game.title} is already on the board.`)
        return
      }

      if (gameFitsCell(board, activeCell, game)) {
        const cells = [...state.cells]
        cells[activeCell] = { gameId: game.id }
        const newState: DayState = {
          ...state,
          cells,
          guesses: [...state.guesses, { gameId: game.id, cell: activeCell, ok: true }],
          score: computeScore(cells.filter(Boolean).length, state.misses),
        }
        if (cells.filter(Boolean).length === CELL_COUNT) {
          finish(newState)
        } else {
          setState(newState)
          saveDayState(date, newState)
          setActiveCell(null)
        }
      } else {
        // MISS: −50, cell stays open, unlimited attempts
        const misses = state.misses + 1
        const newState: DayState = {
          ...state,
          misses,
          guesses: [...state.guesses, { gameId: game.id, cell: activeCell, ok: false }],
          score: computeScore(filledCount, misses),
        }
        setState(newState)
        saveDayState(date, newState)
        setScorePulse(true)
        setFloatingCost({ key: Date.now(), cost: MISS_PENALTY })
        setTimeout(() => setScorePulse(false), 600)
        setTimeout(() => setFloatingCost(null), 1200)
        showFeedback('miss', `${game.title} doesn't fit that cell — −${MISS_PENALTY}.`)
      }
    },
    [state, activeCell, usedIds, board, filledCount, date, finish, showFeedback],
  )

  // ── Share text (page-owned) ────────────────────────────────────────────────

  const shareText = useMemo(() => {
    if (!state || !state.finished) return ''
    const rows = [0, 1, 2].map((r) =>
      [0, 1, 2].map((c) => (state.cells[r * 3 + c] ? '🟩' : '⬜')).join(''),
    )
    return buildShareText({
      title: 'Stock Room',
      number: formatGameNumber(date),
      score: state.score,
      rows: [...rows, `Rarity ${state.rarity}/100`],
      url: 'idlehours.co.uk/play/stock-room',
    })
  }, [state, date])

  if (!state) return null

  return (
    <>
      <Header />

      <div className="flex min-h-screen flex-col">
        <GameWorld
          gradient={THEME.worldGradient}
          wipeStarted={wipeStarted}
          shouldAnimate={shouldAnimate}
        >
          <main className={`font-game mx-auto flex w-full flex-1 flex-col px-3 pb-8 pt-4 sm:px-4 sm:py-8 ${isPostGame ? 'max-w-7xl lg:px-8' : 'max-w-2xl'}`}>
            {/* Title */}
            <div
              className="text-center"
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
              <div className="transition-all duration-700 ease-out">
                <GameTitle
                  title={['Stock', 'Room']}
                  subtitle={['Name', 'anything', 'that', 'fits']}
                  animate={entranceStep >= 1 || isPostGame}
                />
                {!isPostGame && (
                  <p
                    className="mt-0 font-heading text-[10px] text-white/50 sm:mt-0.5 sm:text-xs"
                    style={entranceStep < 5 ? { opacity: 0 } : entranceStep < 6 ? { animation: `gs-fade-in 0.5s ${SPRING_EASING} both` } : undefined}
                  >
                    {formatGameNumber(date)} &middot; {formatDisplayDate(date)}
                  </p>
                )}
              </div>
            </div>

            {/* Score + misses + rules */}
            {!isPostGame && (
              <div
                className="mt-3 text-center"
                style={entranceStep < 4 ? { opacity: 0 } : entranceStep < 6 ? { animation: `gs-fade-in 0.5s ${SPRING_EASING} both` } : undefined}
              >
                <ScorePill
                  score={state.score}
                  pulse={scorePulse}
                  floatingCost={floatingCost}
                  accentClassName="text-[hsl(var(--game-ink))]"
                  unitClassName="text-[hsl(var(--game-ink))]/60"
                />
                <div className="mt-2 flex items-center justify-center gap-3">
                  <span className="font-heading text-xs font-[800] text-white/50">
                    {filledCount}/9 filled · {state.misses} miss{state.misses === 1 ? '' : 'es'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRules(true)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-xs font-bold text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                    aria-label="How to play"
                  >
                    ?
                  </button>
                </div>
              </div>
            )}

            {/* Not playable */}
            {!playable && <div className="mt-6"><PlayableGuard todayHref="/play/stock-room" /></div>}

            {/* Gameplay */}
            {playable && !state.finished && (
              <div
                className="mt-5 flex flex-col gap-3"
                style={entranceStep < 2 ? { opacity: 0, transform: 'scale(0)' } : entranceStep < 6 ? { animation: `gs-box-in 0.7s ${SPRING_EASING} both` } : undefined}
              >
                <div style={{ opacity: entranceStep < 3 ? 0 : 1 }} className="transition-opacity duration-300">
                  <StockGrid
                    board={board}
                    cells={state.cells}
                    activeCell={activeCell}
                    disabled={state.finished}
                    onSelectCell={(cell) => {
                      setActiveCell((prev) => (prev === cell ? null : cell))
                      setFeedback(null)
                    }}
                  />
                </div>

                {/* Feedback line — inline, no new toast component */}
                <div className="min-h-[20px] text-center">
                  {feedback && (
                    <span className={`font-heading text-[13px] font-[800] ${feedback.kind === 'miss' ? 'text-[hsl(var(--game-red))]' : 'text-white/80'}`}>
                      {feedback.text}
                    </span>
                  )}
                </div>

                {/* Input + finish-early */}
                <div
                  className="rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur-sm transition-opacity duration-300"
                  style={{ opacity: entranceStep < 4 ? 0 : 1 }}
                >
                  <p className="mb-2 text-center font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">
                    {activeCell === null
                      ? 'Tap a cell, then name a game'
                      : `${board.rows[Math.floor(activeCell / 3)].label} × ${board.cols[activeCell % 3].label}`}
                  </p>
                  <GameSearchInput
                    onSelect={handleSubmit}
                    excludeIds={usedIds}
                    placeholder="Name any game that fits..."
                    famousFirst
                    disabled={state.finished || activeCell === null}
                    ringClassName="focus-within:ring-[hsl(var(--game-teal))]/30"
                  />
                  <div className="mt-2 text-center">
                    {finishArmed ? (
                      <button
                        type="button"
                        onClick={() => finish(state)}
                        className="font-heading text-xs font-bold text-[hsl(var(--game-red))]"
                      >
                        Sure? Bank {state.score} pts with {filledCount}/9 filled
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setFinishArmed(true)}
                        className="font-heading text-xs font-semibold text-[hsl(var(--game-ink-light))] transition-colors hover:text-[hsl(var(--game-ink))]"
                      >
                        Finish early &amp; score
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Post-game */}
            {isPostGame && (
              <>
                <div className="mt-6">
                  <PostGameNavPills
                    slug="stock-room"
                    today={today}
                    pgStep={pgStep}
                    share={
                      <SplitShareButton
                        shareText={shareText}
                        shareUrl="https://idlehours.co.uk/play/stock-room"
                        isWin={state.won}
                        accentColor={THEME.accent}
                      />
                    }
                  />
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[55fr_45fr]">
                  <PostGameLeftColumn
                    game="stock-room"
                    score={state.score}
                    secondaryStat={state.rarity}
                    won={state.won}
                    puzzleLabel={`Stock Room ${formatGameNumber(date)} · ${formatDisplayDate(date)}`}
                    pgStep={pgStep}
                  />

                  <div className="order-1 lg:order-2" style={entrance('slide-up', pgStep >= 2)}>
                    <PostGameAnalysisCard
                      label={<>Stock Room {formatGameNumber(date)} &middot; {formatDisplayDate(date)}</>}
                    >
                      <StatPillRow
                        stats={[
                          { label: 'Time', value: formatElapsed(state.startedAt, state.endedAt) },
                          { label: 'Filled', value: `${filledCount}/9` },
                          { label: 'Misses', value: String(state.misses) },
                          { label: 'Rarity', value: `${state.rarity}/100` },
                        ]}
                      />

                      {/* The filled board */}
                      <CardDivider />
                      <div className="p-5 sm:p-6">
                        <div className="rounded-xl bg-[hsl(var(--game-teal))] p-3">
                          <StockGrid
                            board={board}
                            cells={state.cells}
                            activeCell={null}
                            disabled
                            onSelectCell={() => {}}
                          />
                        </div>
                      </div>
                    </PostGameAnalysisCard>
                  </div>
                </div>
              </>
            )}

            {/* Nav pills — during gameplay */}
            {!isPostGame && (
              <div
                className="mt-6 flex flex-wrap items-center justify-center gap-4"
                style={entranceStep < 5 ? { opacity: 0 } : entranceStep < 6 ? { animation: `gs-fade-in 0.5s ${SPRING_EASING} both` } : undefined}
              >
                <GameNavPills slug="stock-room" today={today} />
              </div>
            )}
          </main>
        </GameWorld>

        {isPostGame && (
          <div
            className="bg-background mx-auto max-w-7xl px-4 py-8 sm:bg-transparent lg:px-8"
            style={entrance('fade', pgStep >= 6)}
          >
            <DiscoverMore currentGame="stock-room" />
          </div>
        )}

        <SiteFooter />
      </div>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </>
  )
}
