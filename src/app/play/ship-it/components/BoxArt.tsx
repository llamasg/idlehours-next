'use client'

import type { Sticker } from '../data/offers'

interface BoxArtProps {
  gameName: string
  stickers: Sticker[]
  vision: number
}

export default function BoxArt({ gameName, stickers, vision }: BoxArtProps) {
  const visionColour =
    vision >= 65
      ? 'bg-emerald-500'
      : vision >= 40
        ? 'bg-amber-500'
        : 'bg-red-500'

  return (
    <div className="mx-auto w-full max-w-[220px]">
      {/* Box art container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-emerald-800/80 to-emerald-950/90">
        {/* Game title */}
        <div className="flex h-full flex-col items-center justify-center px-4">
          <h2 className="text-center font-heading text-xl font-bold text-white">
            {gameName}
          </h2>
          <p className="mt-1 text-sm text-white/60">An Indie Game</p>
        </div>

        {/* Sticker layer */}
        <div className="absolute inset-0 pointer-events-none">
          {stickers.map((s, i) => {
            const stickerColour =
              s.type === 'bad'
                ? 'bg-red-500/90 text-white'
                : s.type === 'warning'
                  ? 'bg-amber-500/90 text-white'
                  : 'bg-emerald-500/90 text-white'

            return (
              <div
                key={`sticker-${i}`}
                className={`absolute animate-sticker-slap whitespace-pre-line text-center font-heading text-[9px] font-bold uppercase leading-tight tracking-wider px-2 py-1 ${stickerColour}`}
                style={
                  {
                    top: s.top,
                    left: s.left,
                    right: s.right,
                    bottom: s.bottom,
                    '--rot': s.rot,
                  } as React.CSSProperties
                }
              >
                {s.text}
              </div>
            )
          })}
        </div>
      </div>

      {/* Vision bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs text-muted-foreground">
            Vision
          </span>
          <span className="font-heading text-xs text-muted-foreground">
            {vision}%
          </span>
        </div>
        <div
          className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted/50"
          role="progressbar"
          aria-valuenow={vision}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Vision: ${vision}%`}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${visionColour}`}
            style={{ width: `${Math.max(0, Math.min(100, vision))}%` }}
          />
        </div>
      </div>
    </div>
  )
}
