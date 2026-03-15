'use client'

import Link from 'next/link'
import StickyNote from '@/components/StickyNote'

export default function JigsawSection() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-border/60 bg-card shadow-[0_3px_0_hsl(var(--border)),0_7px_22px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:-rotate-[0.2deg] hover:shadow-[0_7px_0_hsl(var(--border)),0_20px_42px_rgba(0,0,0,0.1)]">
      <div className="grid grid-cols-1 items-stretch lg:grid-cols-[340px_1fr]">
        <div className="relative flex min-h-[200px] items-center justify-center overflow-hidden bg-[#6B4F1D] lg:min-h-[320px]">
          <div className="flex flex-col items-center gap-2.5 opacity-30 select-none">
            <span className="font-heading text-[9px] font-extrabold uppercase tracking-[0.18em] text-white">
              Jigsaw art here
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-between p-8">
          <div>
            <div className="mb-4 inline-block rounded-[5px] bg-secondary px-2.5 py-1 font-heading text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground shadow-[0_1px_4px_rgba(0,0,0,0.08)]" style={{ transform: 'rotate(-1.2deg)' }}>
              Slow game
            </div>
            <div className="mb-5 flex flex-col gap-2">
              <StickyNote
                title="The kind of game you leave open."
                body="Come back to it between cups of tea."
                rotate={-0.5}
                className="max-w-[260px]"
              />
              <StickyNote
                body="Eventually multiplayer. For now, just you."
                rotate={0.6}
                className="max-w-[200px] text-[10px] opacity-75"
              />
            </div>
            <p className="mb-6 text-sm font-semibold leading-relaxed text-muted-foreground">
              Co-op jigsaw puzzles, built for the kind of person who finds that sort of thing genuinely relaxing. No rush. No competition. Just a picture slowly coming together, one piece at a time.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3.5">
            <Link
              href="/play/jigsaw"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 font-heading text-xs font-extrabold text-background shadow-[0_3px_0_rgba(0,0,0,0.38)] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.38)]"
            >
              Start playing &rarr;
            </Link>
            <span className="text-[11px] font-semibold italic text-muted-foreground/50">
              No timer. No score. No pressure.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
