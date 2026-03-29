'use client'

import Link from 'next/link'

interface PlayGameCardProps {
  title: string
  subtitle: string
  description: string
  href: string
  imageBg: string
  btnClass: string
  stickerClass?: string
}

export default function PlayGameCard({
  title,
  subtitle,
  description,
  href,
  imageBg,
  btnClass,
  stickerClass = 'bg-blue-500 text-white',
}: PlayGameCardProps) {
  return (
    <Link href={href} className="relative block pt-2.5">
      <div
        className={`absolute top-0 left-3.5 z-10 rounded-[5px] px-2.5 py-1 font-heading text-[8px] font-black uppercase tracking-[0.2em] shadow-[0_2px_5px_rgba(0,0,0,0.14)] ${stickerClass}`}
        style={{ transform: 'rotate(-1.5deg)' }}
      >
        Daily
      </div>
      <div className="group flex cursor-pointer flex-col overflow-hidden rounded-[18px] border border-border/60 bg-card shadow-[0_3px_0_hsl(var(--border)),0_6px_18px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:-rotate-[0.3deg] hover:shadow-[0_8px_0_hsl(var(--border)),0_20px_40px_rgba(0,0,0,0.1)]">
        <div className={`flex h-[200px] items-center justify-center ${imageBg}`}>
          <div className="flex flex-col items-center gap-2 opacity-30 select-none">
            <span className="font-heading text-[9px] font-extrabold uppercase tracking-[0.18em]">
              Illustration here
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col border-t border-border/60 p-5">
          <p className="mb-1.5 flex items-center gap-2 font-heading text-[9px] font-black uppercase tracking-[0.26em] text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
            {subtitle}
          </p>
          <h3 className="mb-2 font-heading text-[clamp(24px,2.6vw,30px)] font-black uppercase leading-[0.92] tracking-tight text-foreground">
            {title}
          </h3>
          <p className="mb-3.5 flex-1 text-[11px] font-semibold italic leading-relaxed text-muted-foreground">
            {description}
          </p>
          <div className="border-t border-dashed border-border pt-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-heading text-[11px] font-extrabold text-white shadow-[0_3px_0_rgba(0,0,0,0.2)] transition-all group-hover:-translate-y-0.5 ${btnClass}`}
            >
              Play &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
