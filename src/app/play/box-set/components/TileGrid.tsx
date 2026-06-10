'use client'

// Box Set identity: the 4×4 tile grid + solved-group banner rows.
// BLOCK-OUT ONLY — existing tokens, no bespoke styling pass yet.

import type { ConceptTier } from '../lib/conceptBank'
import type { PuzzleGroup, PuzzleTile } from '../lib/puzzles'

/** Tier colours reuse the existing --game-* tokens (block-out mapping). */
export const TIER_COLOURS: Record<ConceptTier, string> = {
  yellow: 'hsl(var(--game-amber))',
  green: 'hsl(var(--game-green))',
  blue: 'hsl(var(--game-blue))',
  purple: 'hsl(var(--game-purple))',
}

export const TIER_EMOJI: Record<ConceptTier, string> = {
  yellow: '🟨',
  green: '🟩',
  blue: '🟦',
  purple: '🟪',
}

// Length-clamped font size for the title-length problem: two lines,
// smaller type as titles grow. Long outliers still clamp to 3 lines.
function titleSizeClass(title: string): string {
  if (title.length > 30) return 'text-[7px] leading-[1.15] sm:text-[10px]'
  if (title.length > 18) return 'text-[8px] leading-[1.2] sm:text-[11px]'
  return 'text-[10px] leading-tight sm:text-[12px]'
}

export function SolvedGroupBanner({ group, titles }: { group: PuzzleGroup; titles: string[] }) {
  return (
    <div
      className="rounded-xl px-3 py-2 text-center"
      style={{ backgroundColor: TIER_COLOURS[group.tier] }}
    >
      <p className="font-heading text-[11px] font-[900] uppercase tracking-[0.08em] text-white">
        {group.label}
      </p>
      <p className="font-heading text-[10px] font-semibold text-white/85 sm:text-[11px]">
        {titles.join(' · ')}
      </p>
    </div>
  )
}

export default function TileGrid({
  tiles,
  selected,
  disabled,
  onToggle,
}: {
  tiles: PuzzleTile[]
  selected: string[]
  disabled: boolean
  onToggle: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
      {tiles.map((tile) => {
        const isSelected = selected.includes(tile.id)
        return (
          <button
            key={tile.id}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(tile.id)}
            className={`flex h-[72px] items-center justify-center rounded-lg border-2 px-1 transition-all duration-100 sm:h-[88px] sm:px-2 ${
              isSelected
                ? 'border-[hsl(var(--game-ink))] bg-[hsl(var(--game-ink))] text-white'
                : 'border-[hsl(var(--game-ink))]/10 bg-white/95 text-[hsl(var(--game-ink))] hover:border-[hsl(var(--game-ink))]/30'
            } ${disabled ? 'cursor-default opacity-60' : 'cursor-pointer active:scale-95'}`}
          >
            <span
              className={`line-clamp-3 break-words text-center font-heading font-[800] uppercase ${titleSizeClass(tile.title)}`}
            >
              {tile.title}
            </span>
          </button>
        )
      })}
    </div>
  )
}
