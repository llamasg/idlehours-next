'use client'

// Stock Room identity: the 3×3 criteria grid with row/column labels.
// BLOCK-OUT ONLY — existing tokens, no bespoke styling pass.
//
// Cell geometry (v2 amendment): landscape rectangles, fixed uniform height
// (h-[76px], sm h-[84px]) — empty / filled / wrong-marked / solution cells
// are all identical dimensions, zero layout shift.
//
// 360px variant shipped: below sm the left row-label gutter is DROPPED and
// the row label renders inside each cell's top edge (small caps, secondary
// colour) — the gutter squeezed cells to ~70px tap width, in-cell labels
// give them ~109px. From sm up the gutter returns and in-cell labels hide.

import { GAMES_DB } from '@/data/games-db'
import type { Board } from '../lib/boardGen'

const TITLE_BY_ID = new Map(GAMES_DB.map((g) => [g.id, g.title]))

const LABEL_TEXT =
  'font-heading font-[900] uppercase leading-[1.2] tracking-[0.06em] text-white/80'

export default function StockGrid({
  board,
  cells,
  activeCell,
  marks,
  solutionIds,
  disabled,
  onSelectCell,
}: {
  board: Board
  cells: ({ gameId: string } | null)[]
  activeCell: number | null
  /** Last-check verdict per cell; false = marked wrong (red), null = unmarked. */
  marks?: (boolean | null)[] | null
  /** Post-game: solver answers for cells the player didn't get right. */
  solutionIds?: (string | null)[] | null
  disabled: boolean
  onSelectCell: (cell: number) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-[96px_1fr_1fr_1fr]">
      {/* top-left spacer (gutter exists from sm up) + column labels */}
      <div className="hidden sm:block" />
      {board.cols.map((c) => (
        <div
          key={c.id}
          className={`flex items-end justify-center pb-1 text-center text-[8px] sm:text-[10px] ${LABEL_TEXT}`}
        >
          {c.label}
        </div>
      ))}

      {board.rows.map((row, r) => (
        <RowCells
          key={row.id}
          rowLabel={row.label}
          r={r}
          cells={cells}
          activeCell={activeCell}
          marks={marks}
          solutionIds={solutionIds}
          disabled={disabled}
          onSelectCell={onSelectCell}
        />
      ))}
    </div>
  )
}

function RowCells({
  rowLabel,
  r,
  cells,
  activeCell,
  marks,
  solutionIds,
  disabled,
  onSelectCell,
}: {
  rowLabel: string
  r: number
  cells: ({ gameId: string } | null)[]
  activeCell: number | null
  marks?: (boolean | null)[] | null
  solutionIds?: (string | null)[] | null
  disabled: boolean
  onSelectCell: (cell: number) => void
}) {
  return (
    <>
      {/* row-label gutter — sm and up only */}
      <div className={`hidden items-center justify-end pr-1.5 text-right text-[10px] sm:flex ${LABEL_TEXT}`}>
        {rowLabel}
      </div>
      {[0, 1, 2].map((c) => {
        const cell = r * 3 + c
        const filled = cells[cell]
        const solution = !filled && solutionIds ? solutionIds[cell] : null
        const isActive = activeCell === cell
        const isWrong = marks?.[cell] === false

        const frame = solution
          ? 'border-dashed border-white/50 bg-white/15'
          : filled
            ? isWrong
              ? 'cursor-pointer border-[hsl(var(--game-red))] bg-white/95'
              : isActive
                ? 'cursor-pointer border-white bg-white/95 ring-2 ring-white/50'
                : `${disabled ? '' : 'cursor-pointer'} border-[hsl(var(--game-teal))] bg-white/95`
            : isActive
              ? 'cursor-pointer border-white bg-white/20 ring-2 ring-white/40'
              : 'cursor-pointer border-white/20 bg-white/10 hover:border-white/45'

        return (
          <button
            key={cell}
            type="button"
            disabled={disabled}
            onClick={() => onSelectCell(cell)}
            className={`flex h-[76px] w-full flex-col rounded-lg border-2 px-1.5 py-1 transition-all duration-100 sm:h-[84px] sm:px-2 ${frame} ${disabled && !filled && !solution ? 'opacity-60' : ''}`}
          >
            {/* in-cell row label — mobile only (gutter variant from sm up) */}
            <span className={`w-full truncate text-left text-[7px] sm:hidden ${filled ? 'font-heading font-[900] uppercase tracking-[0.06em] leading-[1.2] text-[hsl(var(--game-ink))]/40' : LABEL_TEXT}`}>
              {rowLabel}
            </span>

            <span className="flex w-full flex-1 items-center justify-center">
              {filled ? (
                <span className={`line-clamp-3 break-words text-center font-heading text-[9px] font-[800] leading-[1.2] sm:text-[11px] ${isWrong ? 'text-[hsl(var(--game-red))]' : 'text-[hsl(var(--game-ink))]'}`}>
                  {TITLE_BY_ID.get(filled.gameId) ?? filled.gameId}
                </span>
              ) : solution ? (
                <span className="line-clamp-3 break-words text-center font-heading text-[9px] font-[700] italic leading-[1.2] text-white/85 sm:text-[11px]">
                  {TITLE_BY_ID.get(solution) ?? solution}
                </span>
              ) : (
                <span className="text-xl text-white/40">+</span>
              )}
            </span>
          </button>
        )
      })}
    </>
  )
}
