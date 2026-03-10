'use client'

import { useMemo, useRef } from 'react'
import { type ArchiveEntry } from '../lib/archiveAdapter'
import { entrance, useEntranceSteps } from '@/lib/animations'

interface ArchiveCalendarProps {
  entries: ArchiveEntry[]
  selectedIndex: number
  onSelectDate: (idx: number) => void
  launchDate: string
  displayMonth: string
  onMonthChange: (month: string) => void
  animateIn?: boolean
  bgColor?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseYM(ym: string): { year: number; month: number } {
  const [y, m] = ym.split('-').map(Number)
  return { year: y, month: m }
}

function formatYM(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function getTodayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── Internal entrance steps ─────────────────────────────────────────────────
// 1: container wipe-down
// 2: month name slide-up
// 3: day numbers pop (staggered internally via delay)
// 4: stats slide-up
// 5: dots pop (staggered internally via delay)

const CAL_STEP_GAPS = [
  0,    // 1: container wipe
  200,  // 2: month name
  200,  // 3: day numbers
  600,  // 4: stats (after days have popped)
  200,  // 5: dots
]

// ── Component ────────────────────────────────────────────────────────────────

export default function ArchiveCalendar({
  entries,
  selectedIndex,
  onSelectDate,
  launchDate,
  displayMonth,
  onMonthChange,
  animateIn = true,
  bgColor = '#132251',
}: ArchiveCalendarProps) {
  const today = useMemo(() => getTodayStr(), [])
  const calStep = useEntranceSteps(5, CAL_STEP_GAPS, animateIn)
  // Track month navigation direction: 1 = forward, -1 = backward
  const directionRef = useRef<1 | -1>(1)
  const prevMonthRef = useRef(displayMonth)
  // Auto-detect direction when month changes (e.g. from rolodex scroll)
  if (displayMonth !== prevMonthRef.current) {
    if (displayMonth < prevMonthRef.current) directionRef.current = -1
    else directionRef.current = 1
    prevMonthRef.current = displayMonth
  }

  // Build lookup: date → { index, entry }
  const dateMap = useMemo(() => {
    const m = new Map<string, { index: number; entry: ArchiveEntry }>()
    entries.forEach((e, i) => m.set(e.date, { index: i, entry: e }))
    return m
  }, [entries])

  const { year, month } = parseYM(displayMonth)

  // Month bounds
  const launchYM = launchDate.slice(0, 7)
  const todayYM = today.slice(0, 7)
  const canPrev = displayMonth > launchYM
  const canNext = displayMonth < todayYM

  const prevMonth = () => {
    if (!canPrev) return
    directionRef.current = -1
    const d = new Date(year, month - 2, 1)
    onMonthChange(formatYM(d.getFullYear(), d.getMonth() + 1))
  }
  const nextMonth = () => {
    if (!canNext) return
    directionRef.current = 1
    const d = new Date(year, month, 1)
    onMonthChange(formatYM(d.getFullYear(), d.getMonth() + 1))
  }

  // Build calendar grid (Monday-first)
  const cells = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1)
    const daysInMonth = new Date(year, month, 0).getDate()
    let startDow = firstDay.getDay() - 1
    if (startDow < 0) startDow = 6

    const result: (number | null)[] = []
    for (let i = 0; i < startDow; i++) result.push(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(d)
    return result
  }, [year, month])

  // Count actual day cells (non-null) for stagger indexing
  const totalDays = useMemo(() => cells.filter((d) => d !== null).length, [cells])
  // Grid height: rows * 36px (h-9) + (rows-1) * 4px (gap-1)
  const gridRows = Math.ceil(cells.length / 7)
  const gridHeight = gridRows * 36 + (gridRows - 1) * 4
  const isReversed = directionRef.current === -1

  const dayCells = useMemo(() => {
    let dayIndex = 0
    return cells.map((day) => {
      if (day === null) return { day: null, dayIndex: -1 }
      return { day, dayIndex: dayIndex++ }
    })
  }, [cells])

  // Selected entry date
  const selectedDate = entries[selectedIndex]?.date ?? ''

  // Compact mode: find the row containing the selected date
  const selectedDay = selectedDate ? parseInt(selectedDate.split('-')[2]) : 1
  const selectedCellIndex = cells.findIndex((d) => d === selectedDay)
  const selectedRow = selectedCellIndex >= 0 ? Math.floor(selectedCellIndex / 7) : 0
  const compactStart = selectedRow * 7
  const compactEnd = compactStart + 7

  // Stats for this month
  const monthStats = useMemo(() => {
    let wins = 0, losses = 0, best = 0
    entries.forEach((e) => {
      if (e.date.startsWith(displayMonth)) {
        if (e.won) { wins++; if (e.score > best) best = e.score }
        if (e.played && e.finished && !e.won) losses++
      }
    })
    return { wins, losses, best }
  }, [entries, displayMonth])

  // Collect dots for stagger order (left to right through the grid)
  const dotEntries = useMemo(() => {
    let dotIdx = 0
    const result = dayCells.map(({ day }) => {
      if (day === null) return { hasDot: false, dotIndex: -1 }
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const info = dateMap.get(dateStr)
      const isSelected = dateStr === selectedDate
      const hasDot = !!(info && !isSelected && (info.entry.won || (info.entry.played && info.entry.finished) || info.entry.played))
      if (hasDot) return { hasDot: true, dotIndex: dotIdx++ }
      return { hasDot: false, dotIndex: -1 }
    })
    return { entries: result, totalDots: dotIdx }
  }, [dayCells, year, month, dateMap, selectedDate])

  return (
    <div
      className="overflow-hidden rounded-xl p-4"
      style={{
        backgroundColor: bgColor,
        transition: 'background-color 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        ...entrance('wipe-down', calStep >= 1),
      }}
    >
      {/* Month header — full calendar (480px+) */}
      <div
        className="mb-3 hidden items-center justify-between min-[480px]:flex"
        style={entrance('slide-up', calStep >= 2)}
      >
        <button
          onClick={prevMonth}
          disabled={!canPrev}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
        >
          &lsaquo;
        </button>
        <span className="font-heading text-[14px] font-extrabold tracking-wide text-white">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <button
          onClick={nextMonth}
          disabled={!canNext}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
        >
          &rsaquo;
        </button>
      </div>

      {/* ── Full calendar (480px+) ── */}
      <div className="hidden min-[480px]:block">
        {/* Day headers */}
        <div className="mb-1 grid grid-cols-7 gap-1">
          {DAY_HEADERS.map((d, i) => (
            <div
              key={i}
              className="text-center font-heading text-[10px] font-bold uppercase text-white/30"
              style={entrance('fade', calStep >= 2, i * 30)}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div
          className="grid grid-cols-7 gap-1 overflow-hidden"
          style={{ height: gridHeight, transition: 'height 0.3s ease' }}
        >
          {dayCells.map(({ day, dayIndex }, i) => {
            if (day === null) return <div key={`empty-${i}`} />

            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const info = dateMap.get(dateStr)
            const isSelected = dateStr === selectedDate
            const isToday = dateStr === today
            const isFuture = dateStr > today

            let dotColor = ''
            if (info && !isSelected) {
              if (info.entry.won) dotColor = '#27c76a'
              else if (info.entry.played && info.entry.finished) dotColor = '#e85a5a'
              else if (info.entry.played) dotColor = '#5b9fff'
            }

            const { dotIndex } = dotEntries.entries[i]

            return (
              <button
                key={dateStr}
                onClick={() => info && onSelectDate(info.index)}
                disabled={!info || isFuture}
                className={`relative flex h-9 flex-col items-center justify-center rounded-lg font-heading text-[13px] font-bold transition-all duration-150 ${
                  isSelected
                    ? 'scale-[1.15] bg-[#6c63d4] text-white shadow-md'
                    : isToday
                      ? 'bg-[#5b9fff]/15 text-[#5b9fff] ring-1 ring-[#5b9fff]/40'
                      : isFuture
                        ? 'text-white/15'
                        : info
                          ? 'text-white/80 hover:bg-white/8'
                          : 'text-white/25'
                }`}
                style={entrance('pop', calStep >= 3, (isReversed ? totalDays - 1 - dayIndex : dayIndex) * 50)}
              >
                {day}
                {dotColor && (
                  <div
                    className="absolute bottom-1 h-[4px] w-[4px] rounded-full"
                    style={{
                      backgroundColor: dotColor,
                      ...entrance('pop', calStep >= 5, (isReversed ? dotEntries.totalDots - 1 - dotIndex : dotIndex) * 40),
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Compact week strip (<480px only) ── */}
      <div className="min-[480px]:hidden">
        {/* Compact header — arrows shift by week row */}
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => {
              // Jump ~7 entries earlier (older = higher index, entries are newest-first)
              const target = Math.min(selectedIndex + 7, entries.length - 1)
              if (target !== selectedIndex) onSelectDate(target)
            }}
            disabled={selectedIndex >= entries.length - 1}
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
          >
            &lsaquo;
          </button>
          <span className="font-heading text-[14px] font-extrabold tracking-wide text-white">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button
            onClick={() => {
              // Jump ~7 entries later (newer = lower index)
              const target = Math.max(selectedIndex - 7, 0)
              if (target !== selectedIndex) onSelectDate(target)
            }}
            disabled={selectedIndex <= 0}
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
          >
            &rsaquo;
          </button>
        </div>
        <div className="mb-1 grid grid-cols-7 gap-1">
          {DAY_HEADERS.map((d, i) => (
            <div key={i} className="text-center font-heading text-[10px] font-bold uppercase text-white/30">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {dayCells.slice(compactStart, compactEnd).map(({ day, dayIndex }, i) => {
            if (day === null) return <div key={`empty-c-${i}`} />

            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const info = dateMap.get(dateStr)
            const isSelected = dateStr === selectedDate
            const isToday = dateStr === today
            const isFuture = dateStr > today

            let dotColor = ''
            if (info && !isSelected) {
              if (info.entry.won) dotColor = '#27c76a'
              else if (info.entry.played && info.entry.finished) dotColor = '#e85a5a'
              else if (info.entry.played) dotColor = '#5b9fff'
            }

            return (
              <button
                key={dateStr}
                onClick={() => info && onSelectDate(info.index)}
                disabled={!info || isFuture}
                className={`relative flex h-9 flex-col items-center justify-center rounded-lg font-heading text-[13px] font-bold transition-all duration-150 ${
                  isSelected
                    ? 'scale-[1.15] bg-[#6c63d4] text-white shadow-md'
                    : isToday
                      ? 'bg-[#5b9fff]/15 text-[#5b9fff] ring-1 ring-[#5b9fff]/40'
                      : isFuture
                        ? 'text-white/15'
                        : info
                          ? 'text-white/80 hover:bg-white/8'
                          : 'text-white/25'
                }`}
              >
                {day}
                {dotColor && (
                  <div
                    className="absolute bottom-1 h-[4px] w-[4px] rounded-full"
                    style={{ backgroundColor: dotColor }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Stats strip — hidden on mobile */}
      <div
        className="mt-4 hidden justify-between border-t border-white/10 pt-3 min-[480px]:flex"
        style={entrance('slide-up', calStep >= 4)}
      >
        <div className="text-center">
          <div className="font-heading text-[18px] font-black text-[#27c76a]">{monthStats.wins}</div>
          <div className="font-heading text-[9px] font-bold uppercase tracking-widest text-white/40">Wins</div>
        </div>
        <div className="text-center">
          <div className="font-heading text-[18px] font-black text-[#e85a5a]">{monthStats.losses}</div>
          <div className="font-heading text-[9px] font-bold uppercase tracking-widest text-white/40">Lost</div>
        </div>
        <div className="text-center">
          <div className="font-heading text-[18px] font-black text-white">{monthStats.best || '—'}</div>
          <div className="font-heading text-[9px] font-bold uppercase tracking-widest text-white/40">Best</div>
        </div>
      </div>
    </div>
  )
}
