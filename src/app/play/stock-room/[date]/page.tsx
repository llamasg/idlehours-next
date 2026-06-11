'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo, useRef, use } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import DiscoverMore from '@/components/DiscoverMore'
import { GAMES_DB, type GameEntry } from '@/data/games-db'

import { generateBoard, gameFitsCell, solveBoard } from '../lib/boardGen'
import { loadDayState, saveDayState, type DayState } from '../lib/storage'
import { computeScore, CHECK_PENALTY, CELL_COUNT } from '../lib/constants'
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
const TITLE_BY_ID = new Map(GAMES_DB.map((g) => [g.id, g.title]))

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
  const [feedback, setFeedback] = useState<string | null>(null)
  const [scorePulse, setScorePulse] = useState(false)
  const [floatingCost, setFloatingCost] = useState<{ key: number; cost: number } | null>(null)
  const [showRules, setShowRules] = useState(false)
  const [giveUpArmed, setGiveUpArmed] = useState(false)
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

  const filledCount = state ? state.board.filter(Boolean).length : 0
  const usedIds = useMemo(
    () => (state ? state.board.filter(Boolean).map((c) => c!.gameId) : []),
    [state],
  )

  const showFeedback = useCallback((text: string) => {
    setFeedback(text)
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    feedbackTimer.current = setTimeout(() => setFeedback(null), 2500)
  }, [])

  const persist = useCallback(
    (next: DayState) => {
      setState(next)
      saveDayState(date, next)
    },
    [date],
  )

  // ── Arrange: every board mutation clears the wrong-marks on touched cells ──

  const mutateBoard = useCallback(
    (current: DayState, changes: { cell: number; value: { gameId: string } | null }[]) => {
      const next = [...current.board]
      const marks = current.lastCheckResult ? [...current.lastCheckResult] : null
      for (const { cell, value } of changes) {
        next[cell] = value
        if (marks) marks[cell] = null
      }
      persist({ ...current, board: next, lastCheckResult: marks })
    },
    [persist],
  )

  const handleCellTap = useCallback(
    (cell: number) => {
      if (!state || state.finished) return
      setGiveUpArmed(false)
      if (activeCell === null || activeCell === cell) {
        // select / deselect
        setActiveCell(activeCell === cell ? null : cell)
        return
      }
      const from = state.board[activeCell]
      if (from) {
        // Street Date grammar: selected filled cell + tap target = move/swap
        mutateBoard(state, [
          { cell: activeCell, value: state.board[cell] },
          { cell, value: from },
        ])
        setActiveCell(null)
      } else {
        // selected cell was empty — just switch the selection
        setActiveCell(cell)
      }
    },
    [state, activeCell, mutateBoard],
  )

  const handlePlace = useCallback(
    (game: GameEntry) => {
      if (!state || state.finished || activeCell === null) return
      // No-reuse: the typeahead already excludes placed games; belt-and-braces.
      if (usedIds.includes(game.id) && state.board[activeCell]?.gameId !== game.id) {
        showFeedback(`${game.title} is already on the board.`)
        return
      }
      mutateBoard(state, [{ cell: activeCell, value: { gameId: game.id } }])
      setActiveCell(null)
    },
    [state, activeCell, usedIds, mutateBoard, showFeedback],
  )

  const handleRemove = useCallback(() => {
    if (!state || state.finished || activeCell === null || !state.board[activeCell]) return
    mutateBoard(state, [{ cell: activeCell, value: null }])
    setActiveCell(null)
  }, [state, activeCell, mutateBoard])

  // ── Check — the ceremony moment ────────────────────────────────────────────

  const handleCheck = useCallback(() => {
    if (!state || state.finished || filledCount < CELL_COUNT) return
    const results = state.board.map((c, cell) => {
      const game = GAMES_DB.find((g) => g.id === c!.gameId)
      return !!game && gameFitsCell(board, cell, game)
    })
    const checks = state.checks + 1
    const wrongCount = results.filter((r) => !r).length

    if (wrongCount === 0) {
      persist({
        ...state,
        checks,
        lastCheckResult: results,
        finished: true,
        won: true,
        score: computeScore(checks),
        rarity: boardRarity(state.board.map((c) => c!.gameId)),
        endedAt: Date.now(),
      })
      setActiveCell(null)
    } else {
      persist({ ...state, checks, lastCheckResult: results })
      setScorePulse(true)
      setFloatingCost({ key: Date.now(), cost: CHECK_PENALTY })
      setTimeout(() => setScorePulse(false), 600)
      setTimeout(() => setFloatingCost(null), 1200)
      showFeedback(`${CELL_COUNT - wrongCount}/9 right — the red shelves need restocking.`)
    }
  }, [state, board, filledCount, persist, showFeedback])

  const handleGiveUp = useCallback(() => {
    if (!state || state.finished) return
    const results = state.board.map((c, cell) => {
      if (!c) return false
      const game = GAMES_DB.find((g) => g.id === c.gameId)
      return !!game && gameFitsCell(board, cell, game)
    })
    const correctIds = state.board
      .map((c, cell) => (c && results[cell] ? c.gameId : null))
      .filter(Boolean) as string[]
    persist({
      ...state,
      lastCheckResult: results,
      finished: true,
      won: false,
      score: 0,
      rarity: boardRarity(correctIds),
      endedAt: Date.now(),
    })
    setActiveCell(null)
    setGiveUpArmed(false)
  }, [state, board, persist])

  // ── Post-game: the player's correct cells + a solution for the rest ───────

  const postGame = useMemo(() => {
    if (!state || !state.finished) return null
    if (state.won) {
      return { displayCells: state.board, solutionIds: null }
    }
    // Give-up: keep only the placements that were right; solve the rest.
    const correctCells = state.board.map((c, cell) =>
      c && state.lastCheckResult?.[cell] === true ? c : null,
    )
    const solved = solveBoard(board, correctCells) ?? solveBoard(board, Array(9).fill(null))
    const solutionIds = solved
      ? solved.map((id, cell) => (correctCells[cell] ? null : id))
      : null
    return { displayCells: correctCells, solutionIds }
  }, [state, board])

  // ── Share text (page-owned) ────────────────────────────────────────────────

  const shareText = useMemo(() => {
    if (!state || !state.finished) return ''
    const verdict = (cell: number) =>
      state.won || (state.board[cell] && state.lastCheckResult?.[cell] === true)
    const rows = [0, 1, 2].map((r) =>
      [0, 1, 2].map((c) => (verdict(r * 3 + c) ? '🟩' : '⬜')).join(''),
    )
    return buildShareText({
      title: 'Stock Room',
      number: formatGameNumber(date),
      score: state.score,
      rows: [
        ...rows,
        `${state.checks} check${state.checks === 1 ? '' : 's'} · Rarity ${state.rarity}/100`,
      ],
      url: 'idlehours.co.uk/play/stock-room',
    })
  }, [state, date])

  if (!state) return null

  const activeFilled = activeCell !== null ? state.board[activeCell] : null

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
                  subtitle={['Arrange', 'the', 'shelves,', 'then', 'check']}
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

            {/* Score + checks + rules */}
            {!isPostGame && (
              <div
                className="mt-3 text-center"
                style={entranceStep < 4 ? { opacity: 0 } : entranceStep < 6 ? { animation: `gs-fade-in 0.5s ${SPRING_EASING} both` } : undefined}
              >
                {/* Displayed score = what the board banks if the NEXT check passes */}
                <ScorePill
                  score={computeScore(state.checks + 1)}
                  pulse={scorePulse}
                  floatingCost={floatingCost}
                  accentClassName="text-[hsl(var(--game-ink))]"
                  unitClassName="text-[hsl(var(--game-ink))]/60"
                />
                <div className="mt-2 flex items-center justify-center gap-3">
                  <span className="font-heading text-xs font-[800] text-white/50">
                    {filledCount}/9 placed · {state.checks} check{state.checks === 1 ? '' : 's'} used
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
                    cells={state.board}
                    activeCell={activeCell}
                    marks={state.lastCheckResult}
                    disabled={state.finished}
                    onSelectCell={handleCellTap}
                  />
                </div>

                {/* Feedback line — inline, no new toast component */}
                <div className="min-h-[20px] text-center">
                  {feedback && (
                    <span className="font-heading text-[13px] font-[800] text-white/80">
                      {feedback}
                    </span>
                  )}
                </div>

                {/* Input + check + give-up */}
                <div
                  className="rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur-sm transition-opacity duration-300"
                  style={{ opacity: entranceStep < 4 ? 0 : 1 }}
                >
                  <p className="mb-2 text-center font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">
                    {activeCell === null
                      ? 'Tap a cell — placements are free until you check'
                      : `${board.rows[Math.floor(activeCell / 3)].label} × ${board.cols[activeCell % 3].label}`}
                  </p>
                  <GameSearchInput
                    onSelect={handlePlace}
                    excludeIds={usedIds}
                    placeholder={activeFilled ? 'Type to replace this game...' : 'Name any game that fits...'}
                    famousFirst
                    disabled={state.finished || activeCell === null}
                    ringClassName="focus-within:ring-[hsl(var(--game-teal))]/30"
                  />
                  {activeFilled && (
                    <p className="mt-2 text-center font-heading text-[11px] font-semibold text-[hsl(var(--game-ink-light))]">
                      {TITLE_BY_ID.get(activeFilled.gameId)} — tap another cell to move or swap, or{' '}
                      <button
                        type="button"
                        onClick={handleRemove}
                        className="font-bold text-[hsl(var(--game-red))] underline underline-offset-2"
                      >
                        take it off the shelf
                      </button>
                    </p>
                  )}

                  {/* CHECK — enabled once all 9 are placed */}
                  <button
                    type="button"
                    disabled={filledCount < CELL_COUNT}
                    onClick={handleCheck}
                    className={`mt-3 w-full rounded-xl py-3 font-heading text-sm font-[900] uppercase tracking-[0.18em] transition-all ${
                      filledCount === CELL_COUNT
                        ? 'bg-[hsl(var(--game-teal))] text-white shadow-[0_5px_0_hsl(var(--game-teal-dark))] active:translate-y-[2px] active:shadow-[0_3px_0_hsl(var(--game-teal-dark))]'
                        : 'cursor-not-allowed bg-[hsl(var(--game-cream-dark))] text-[hsl(var(--game-ink))]/30'
                    }`}
                  >
                    {filledCount === CELL_COUNT
                      ? state.checks === 0 ? 'Check the shelves' : 'Check again'
                      : `Check the shelves (${filledCount}/9 placed)`}
                  </button>

                  <div className="mt-2 text-center">
                    {giveUpArmed ? (
                      <button
                        type="button"
                        onClick={handleGiveUp}
                        className="font-heading text-xs font-bold text-[hsl(var(--game-red))]"
                      >
                        Sure? That&apos;s a Bust — the answers get revealed
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setGiveUpArmed(true)}
                        className="font-heading text-xs font-semibold text-[hsl(var(--game-ink-light))] transition-colors hover:text-[hsl(var(--game-ink))]"
                      >
                        Give up &amp; reveal
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Post-game */}
            {isPostGame && postGame && (
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
                          { label: 'Checks', value: String(state.checks) },
                          { label: 'Filled', value: `${postGame.displayCells.filter(Boolean).length}/9` },
                          { label: 'Rarity', value: `${state.rarity}/100` },
                        ]}
                      />

                      {/* The finished board — solution fills anything missed */}
                      <CardDivider />
                      <div className="p-5 sm:p-6">
                        <div className="rounded-xl bg-[hsl(var(--game-teal))] p-3">
                          <StockGrid
                            board={board}
                            cells={postGame.displayCells}
                            activeCell={null}
                            solutionIds={postGame.solutionIds}
                            disabled
                            onSelectCell={() => {}}
                          />
                        </div>
                        {postGame.solutionIds && (
                          <p className="mt-2 text-center font-heading text-[11px] font-semibold text-[hsl(var(--game-ink-light))]">
                            Italics = an answer that would have worked.
                          </p>
                        )}
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
