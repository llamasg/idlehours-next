'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useMemo, useRef, use } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import DiscoverMore from '@/components/DiscoverMore'
import Link from 'next/link'

import { getPuzzleForDate, type PuzzleGroup } from '../lib/puzzles'
import { loadDayState, saveDayState, type DayState } from '../lib/storage'
import { BASE_SCORE, MISTAKE_PENALTY, MAX_MISTAKES, GROUP_SIZE } from '../lib/constants'
import { formatGameNumber, formatDisplayDate, isPlayableDate, isToday } from '../lib/dateUtils'
import RulesModal from '../components/RulesModal'
import TileGrid, { SolvedGroupBanner, TIER_EMOJI } from '../components/TileGrid'

import { GAME_THEME } from '@/lib/ranks'
import { formatElapsed } from '@/lib/game-shell/formatElapsed'
import { buildShareText } from '@/lib/game-shell/buildShareText'
import { useMobileThemeColor } from '@/lib/game-shell/useMobileThemeColor'
import { useGameEntrance } from '@/lib/game-shell/useGameEntrance'
import GameWorld from '@/components/games/shell/GameWorld'
import GameTitle from '@/components/games/shell/GameTitle'
import ScorePill from '@/components/games/shell/ScorePill'
import PlayableGuard from '@/components/games/shell/PlayableGuard'
import GameNavPills, { PostGameNavPills } from '@/components/games/shell/GameNavPills'
import PostGameAnalysisCard, { StatPillRow, CardDivider } from '@/components/games/shell/PostGameAnalysisCard'
import PostGameLeftColumn from '@/components/games/PostGameLeftColumn'
import SplitShareButton from '@/components/games/SplitShareButton'
import { entrance, useEntranceSteps } from '@/lib/animations'
import { SPRING_EASING, POSTGAME_GAPS } from '@/lib/gameConstants'

const THEME = GAME_THEME['box-set']

export default function BoxSetDayPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = use(params)

  const puzzle = useMemo(() => getPuzzleForDate(date), [date])
  const playable = isPlayableDate(date)
  const today = isToday(date)

  const [state, setState] = useState<DayState | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [tileOrder, setTileOrder] = useState<string[]>([])
  const [feedback, setFeedback] = useState<'one-away' | 'duplicate' | null>(null)
  const [scorePulse, setScorePulse] = useState(false)
  const [floatingCost, setFloatingCost] = useState<{ key: number; cost: number } | null>(null)
  const [showRules, setShowRules] = useState(false)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Entrance animation — step machine shared via useGameEntrance
  const { entranceStep, wipeStarted } = useGameEntrance(
    !!state,
    state ? state.finished : false,
  )
  const shouldAnimate = state ? !state.finished : true

  useMobileThemeColor(THEME.statusBarHex)

  // Load state + stamp startedAt (only when a puzzle exists for this date)
  useEffect(() => {
    if (!puzzle) {
      setState(loadDayState(date))
      return
    }
    const loaded = loadDayState(date)
    if (!loaded.startedAt && !loaded.finished) {
      loaded.startedAt = Date.now()
      saveDayState(date, loaded)
    }
    setState(loaded)
    setTileOrder(puzzle.tiles.map((t) => t.id))
  }, [date, puzzle])

  // ── Derived ────────────────────────────────────────────────────────────────

  const groupByConceptId = useMemo(
    () => new Map((puzzle?.groups ?? []).map((g) => [g.conceptId, g])),
    [puzzle],
  )
  const groupOfTile = useMemo(() => {
    const map = new Map<string, PuzzleGroup>()
    for (const g of puzzle?.groups ?? []) for (const id of g.gameIds) map.set(id, g)
    return map
  }, [puzzle])
  const titleOf = useMemo(
    () => new Map((puzzle?.tiles ?? []).map((t) => [t.id, t.title])),
    [puzzle],
  )

  const solvedGroups = (state?.groupsSolved ?? [])
    .map((cid) => groupByConceptId.get(cid))
    .filter((g): g is PuzzleGroup => !!g)
  const solvedTileIds = new Set(solvedGroups.flatMap((g) => g.gameIds))
  const remainingTiles = tileOrder
    .filter((id) => !solvedTileIds.has(id))
    .map((id) => ({ id, title: titleOf.get(id) ?? id }))

  const isPostGame = state ? state.finished : false
  const pgGaps = useMemo(() => [...POSTGAME_GAPS], [])
  const pgStep = useEntranceSteps(7, pgGaps, isPostGame)

  // ── Interactions ───────────────────────────────────────────────────────────

  const showFeedback = useCallback((kind: 'one-away' | 'duplicate') => {
    setFeedback(kind)
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    feedbackTimer.current = setTimeout(() => setFeedback(null), 2500)
  }, [])

  const handleToggle = useCallback(
    (id: string) => {
      if (!state || state.finished) return
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((s) => s !== id) : prev.length < GROUP_SIZE ? [...prev, id] : prev,
      )
    },
    [state],
  )

  const handleShuffle = useCallback(() => {
    setTileOrder((prev) => {
      const a = [...prev]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    })
  }, [])

  const handleSubmit = useCallback(() => {
    if (!state || state.finished || !puzzle || selected.length !== GROUP_SIZE) return

    // duplicate guess — no penalty, just feedback
    const key = [...selected].sort().join('|')
    if (state.guesses.some((g) => [...g].sort().join('|') === key)) {
      showFeedback('duplicate')
      return
    }

    const counts = new Map<string, number>()
    for (const id of selected) {
      const g = groupOfTile.get(id)
      if (g) counts.set(g.conceptId, (counts.get(g.conceptId) ?? 0) + 1)
    }
    const [topConcept, topCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]

    if (topCount === GROUP_SIZE) {
      const groupsSolved = [...state.groupsSolved, topConcept]
      const won = groupsSolved.length === puzzle.groups.length
      const newState: DayState = {
        ...state,
        groupsSolved,
        guesses: [...state.guesses, selected],
        won,
        finished: won,
        score: BASE_SCORE - MISTAKE_PENALTY * state.mistakes,
        endedAt: won ? Date.now() : state.endedAt,
      }
      setState(newState)
      saveDayState(date, newState)
      setSelected([])
      return
    }

    // mistake
    const mistakes = state.mistakes + 1
    const failed = mistakes >= MAX_MISTAKES
    const newState: DayState = {
      ...state,
      guesses: [...state.guesses, selected],
      mistakes,
      finished: failed,
      won: false,
      score: failed ? 0 : BASE_SCORE - MISTAKE_PENALTY * mistakes,
      endedAt: failed ? Date.now() : state.endedAt,
    }
    setState(newState)
    saveDayState(date, newState)
    setScorePulse(true)
    setFloatingCost({ key: Date.now(), cost: MISTAKE_PENALTY })
    setTimeout(() => setScorePulse(false), 600)
    setTimeout(() => setFloatingCost(null), 1200)
    if (topCount === GROUP_SIZE - 1) showFeedback('one-away')
    if (failed) setSelected([])
  }, [state, puzzle, selected, groupOfTile, date, showFeedback])

  // ── Share text (page-owned, like the other dailies) ───────────────────────

  const shareText = useMemo(() => {
    if (!state || !state.finished) return ''
    return buildShareText({
      title: 'Box Set',
      number: formatGameNumber(date),
      score: state.score,
      rows: state.guesses.map((guess) =>
        guess.map((id) => TIER_EMOJI[groupOfTile.get(id)?.tier ?? 'yellow']).join(''),
      ),
      url: 'idlehours.co.uk/play/box-set',
    })
  }, [state, date, groupOfTile])

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!state) return null

  // Groups shown as banners: solved in solve order; on finish, the rest reveal
  const revealedGroups = state.finished
    ? [...solvedGroups, ...(puzzle?.groups ?? []).filter((g) => !state.groupsSolved.includes(g.conceptId))]
    : solvedGroups

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
                  title={['Box', 'Set']}
                  subtitle={['Four', 'hidden', 'connections']}
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

            {/* Score + mistakes + rules */}
            {!isPostGame && puzzle && (
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
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="font-heading text-xs font-[800] text-white/50">Mistakes</span>
                  {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-3 w-3 rounded-full border-2 transition-all duration-300 ${
                        i < state.mistakes ? 'border-[hsl(var(--game-red))] bg-[hsl(var(--game-red))]' : 'border-white/25 bg-white/60'
                      }`}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowRules(true)}
                    className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-xs font-bold text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                    aria-label="How to play"
                  >
                    ?
                  </button>
                </div>
              </div>
            )}

            {/* Not playable (future date) */}
            {!playable && <div className="mt-6"><PlayableGuard todayHref="/play/box-set" /></div>}

            {/* Playable but no committed puzzle — distinct from the future-date guard */}
            {playable && !puzzle && (
              <div className="mt-6 rounded-lg border border-white/20 bg-white/10 px-4 py-6 text-center backdrop-blur-sm">
                <p className="text-white/70">
                  No puzzle for this date yet &mdash; the shelf is being restocked.
                </p>
                <Link
                  href="/play/box-set"
                  className="mt-3 inline-block text-sm font-semibold text-white transition-colors hover:text-white/80"
                >
                  Go to today&apos;s game &rarr;
                </Link>
              </div>
            )}

            {/* Gameplay */}
            {playable && puzzle && !state.finished && (
              <div
                className="mt-5 flex flex-col gap-3"
                style={entranceStep < 2 ? { opacity: 0, transform: 'scale(0)' } : entranceStep < 6 ? { animation: `gs-box-in 0.7s ${SPRING_EASING} both` } : undefined}
              >
                {/* Solved group banners */}
                {revealedGroups.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {revealedGroups.map((g) => (
                      <SolvedGroupBanner key={g.conceptId} group={g} titles={g.gameIds.map((id) => titleOf.get(id) ?? id)} />
                    ))}
                  </div>
                )}

                <div style={{ opacity: entranceStep < 3 ? 0 : 1 }} className="transition-opacity duration-300">
                  <TileGrid
                    tiles={remainingTiles}
                    selected={selected}
                    disabled={state.finished}
                    onToggle={handleToggle}
                  />
                </div>

                {/* One-away / duplicate feedback — inline, no new toast component */}
                <div className="min-h-[20px] text-center">
                  {feedback === 'one-away' && (
                    <span className="font-heading text-[13px] font-[800] text-amber-300">One away…</span>
                  )}
                  {feedback === 'duplicate' && (
                    <span className="font-heading text-[13px] font-[800] text-white/70">Already tried that one.</span>
                  )}
                </div>

                {/* Controls */}
                <div
                  className="flex items-center justify-center gap-3"
                  style={{ opacity: entranceStep < 4 ? 0 : 1 }}
                >
                  <button
                    type="button"
                    onClick={handleShuffle}
                    className="rounded-full border-2 border-white/25 px-5 py-2 text-sm font-bold text-white/80 transition-all hover:border-white/50 hover:text-white"
                  >
                    Shuffle
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected([])}
                    disabled={selected.length === 0}
                    className={`rounded-full border-2 px-5 py-2 text-sm font-bold transition-all ${
                      selected.length === 0
                        ? 'cursor-not-allowed border-white/10 text-white/30'
                        : 'border-white/25 text-white/80 hover:border-white/50 hover:text-white'
                    }`}
                  >
                    Deselect all
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={selected.length !== GROUP_SIZE}
                    className={`rounded-full px-6 py-2 text-sm font-bold transition-all ${
                      selected.length === GROUP_SIZE
                        ? 'bg-[hsl(var(--game-amber))] text-white shadow-[0_3px_0_#8a5a26,0_6px_12px_rgba(0,0,0,0.1)] hover:brightness-110'
                        : 'cursor-not-allowed bg-white/10 text-white/30'
                    }`}
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}

            {/* Post-game */}
            {isPostGame && puzzle && (
              <>
                <div className="mt-6">
                  <PostGameNavPills
                    slug="box-set"
                    today={today}
                    pgStep={pgStep}
                    share={
                      <SplitShareButton
                        shareText={shareText}
                        shareUrl="https://idlehours.co.uk/play/box-set"
                        isWin={state.won}
                        accentColor={THEME.accent}
                      />
                    }
                  />
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[55fr_45fr]">
                  <PostGameLeftColumn
                    game="box-set"
                    score={state.score}
                    secondaryStat={state.mistakes}
                    won={state.won}
                    puzzleLabel={`Box Set ${formatGameNumber(date)} · ${formatDisplayDate(date)}`}
                    pgStep={pgStep}
                  />

                  <div className="order-1 lg:order-2" style={entrance('slide-up', pgStep >= 2)}>
                    <PostGameAnalysisCard
                      label={<>Box Set {formatGameNumber(date)} &middot; {formatDisplayDate(date)}</>}
                    >
                      <StatPillRow
                        stats={[
                          { label: 'Time', value: formatElapsed(state.startedAt, state.endedAt) },
                          { label: 'Mistakes', value: `${state.mistakes}/${MAX_MISTAKES}` },
                          { label: 'Guesses', value: String(state.guesses.length) },
                          { label: 'Solved', value: `${state.groupsSolved.length}/4` },
                        ]}
                      />

                      {/* Groups in solve order (then unsolved) */}
                      <CardDivider />
                      <div className="flex flex-col gap-2 p-5 sm:p-6">
                        {revealedGroups.map((g) => (
                          <SolvedGroupBanner key={g.conceptId} group={g} titles={g.gameIds.map((id) => titleOf.get(id) ?? id)} />
                        ))}
                      </div>

                      {/* Guess history as emoji rows */}
                      {state.guesses.length > 0 && (
                        <>
                          <CardDivider />
                          <div className="p-5 sm:p-6">
                            <p className="mb-3 font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">
                              Your guesses
                            </p>
                            <div className="flex flex-col gap-1">
                              {state.guesses.map((guess, i) => (
                                <p key={i} className="text-[16px] leading-tight">
                                  {guess.map((id) => TIER_EMOJI[groupOfTile.get(id)?.tier ?? 'yellow']).join('')}
                                </p>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
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
                <GameNavPills slug="box-set" today={today} />
              </div>
            )}
          </main>
        </GameWorld>

        {/* DiscoverMore — outside the game world */}
        {isPostGame && (
          <div
            className="bg-background mx-auto max-w-7xl px-4 py-8 sm:bg-transparent lg:px-8"
            style={entrance('fade', pgStep >= 6)}
          >
            <DiscoverMore currentGame="box-set" />
          </div>
        )}

        <SiteFooter />
      </div>

      {/* Rules modal */}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </>
  )
}
