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
    <div className="mx-auto w-full max-w-[340px]">
      {/* 3D perspective wrapper */}
      <div
        className="transition-transform duration-300"
        style={{
          perspective: '800px',
        }}
      >
        <div
          className="relative"
          style={{
            transform: 'rotateY(-5deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Spine strip */}
          <div className="absolute left-0 top-0 h-full w-2.5 rounded-l-2xl bg-emerald-950/80" />

          {/* Box art container */}
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-emerald-800/80 to-emerald-950/90 shadow-xl">
            {/* Game title */}
            <div className="flex h-full flex-col items-center justify-center px-6">
              <p className="font-heading text-xs uppercase tracking-[0.2em] text-white/50">
                An Indie Game
              </p>
              <h2 className="mt-2 text-center font-heading text-3xl font-bold text-white">
                {gameName}
              </h2>
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
                    className={`absolute animate-sticker-slap whitespace-pre-line text-center font-heading text-[10px] font-bold uppercase leading-tight tracking-wider px-2.5 py-1.5 ${stickerColour}`}
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
        </div>
      </div>

      {/* Vision bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground">
            Vision
          </span>
          <span className="font-heading text-sm font-bold text-foreground">
            {vision}%
          </span>
        </div>
        <div
          className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted/50"
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
