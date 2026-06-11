'use client'

// Stock Room identity: the 3×3 criteria grid with row/column labels.
// BLOCK-OUT ONLY — existing tokens, no bespoke styling pass.
// 360px note: label column is 64px with 8px type; the longest catalog
// labels (~27 chars) wrap to 3 lines — tight but readable (reported in
// the phase summary).

import { GAMES_DB } from '@/data/games-db'
import type { Board } from '../lib/boardGen'

const TITLE_BY_ID = new Map(GAMES_DB.map((g) => [g.id, g.title]))

export default function StockGrid({
  board,
  cells,
  activeCell,
  disabled,
  onSelectCell,
}: {
  board: Board
  cells: ({ gameId: string } | null)[]
  activeCell: number | null
  disabled: boolean
  onSelectCell: (cell: number) => void
}) {
  return (
    <div className="grid grid-cols-[64px_1fr_1fr_1fr] gap-1 sm:grid-cols-[96px_1fr_1fr_1fr] sm:gap-1.5">
      {/* top-left spacer + column labels */}
      <div />
      {board.cols.map((c) => (
        <div
          key={c.id}
          className="flex items-end justify-center pb-1 text-center font-heading text-[8px] font-[900] uppercase leading-[1.2] tracking-[0.06em] text-white/80 sm:text-[10px]"
        >
          {c.label}
        </div>
      ))}

      {board.rows.map((row, r) => (
        <RowCells key={row.id} rowLabel={row.label} r={r} cells={cells} activeCell={activeCell} disabled={disabled} onSelectCell={onSelectCell} />
      ))}
    </div>
  )
}

function RowCells({
  rowLabel,
  r,
  cells,
  activeCell,
  disabled,
  onSelectCell,
}: {
  rowLabel: string
  r: number
  cells: ({ gameId: string } | null)[]
  activeCell: number | null
  disabled: boolean
  onSelectCell: (cell: number) => void
}) {
  return (
    <>
      <div className="flex items-center justify-end pr-1.5 text-right font-heading text-[8px] font-[900] uppercase leading-[1.2] tracking-[0.06em] text-white/80 sm:text-[10px]">
        {rowLabel}
      </div>
      {[0, 1, 2].map((c) => {
        const cell = r * 3 + c
        const filled = cells[cell]
        const isActive = activeCell === cell
        return (
          <button
            key={cell}
            type="button"
            disabled={disabled || !!filled}
            onClick={() => onSelectCell(cell)}
            className={`flex aspect-square items-center justify-center rounded-lg border-2 p-1 transition-all duration-100 sm:p-2 ${
              filled
                ? 'border-[hsl(var(--game-teal))] bg-white/95'
                : isActive
                  ? 'cursor-pointer border-white bg-white/20 ring-2 ring-white/40'
                  : 'cursor-pointer border-white/20 bg-white/10 hover:border-white/45'
            } ${disabled && !filled ? 'cursor-default opacity-60' : ''}`}
          >
            {filled ? (
              <span className="line-clamp-3 break-words text-center font-heading text-[9px] font-[800] leading-[1.2] text-[hsl(var(--game-ink))] sm:text-[11px]">
                {TITLE_BY_ID.get(filled.gameId) ?? filled.gameId}
              </span>
            ) : (
              <span className="text-xl text-white/40">+</span>
            )}
          </button>
        )
      })}
    </>
  )
}
