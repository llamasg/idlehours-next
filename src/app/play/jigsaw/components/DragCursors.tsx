'use client'

import { CELL_SIZE } from '@/lib/jigsawShapes'

export interface DragIndicator {
  playerId: string
  playerName: string
  playerColor: string
  /** Centre of the dragged cluster (average x,y of all pieces) */
  x: number
  y: number
}

interface DragCursorsProps {
  indicators: DragIndicator[]
  zoom: number
}

export default function DragCursors({ indicators, zoom }: DragCursorsProps) {
  const labelSize = Math.max(9, 11 / zoom)

  return (
    <>
      {indicators.map((ind) => (
        <div
          key={ind.playerId}
          className="absolute pointer-events-none"
          style={{
            left: ind.x + CELL_SIZE / 2,
            top: ind.y - 4 / zoom,
            zIndex: 45,
            transition: 'left 60ms linear, top 60ms linear',
            transform: 'translateX(-50%)',
          }}
        >
          <span
            className="whitespace-nowrap rounded px-1 font-mono font-medium"
            style={{
              fontSize: labelSize,
              background: ind.playerColor,
              color: 'white',
              lineHeight: 1.4,
              opacity: 0.85,
            }}
          >
            {ind.playerName}
          </span>
        </div>
      ))}
    </>
  )
}
