import type { ReactNode } from 'react'

// The post-game right-column "analysis card" shared by the three daily games.
// The card chrome and puzzle-label header were forked per game with identical
// markup; the content below the header is each game's identity and comes in
// as children. StatPillRow and CardDivider are exported separately because
// the games place them at different points in the card (game-sense puts its
// stat row mid-card, after the answer poster).

export default function PostGameAnalysisCard({
  label,
  subtitle,
  headerClassName = 'px-5 pt-5 sm:px-6 sm:pt-6',
  children,
}: {
  /** e.g. <>Game Sense {formatGameNumber(date)} &middot; {formatDisplayDate(date)}</> */
  label: ReactNode
  /** Optional second header line (Shelf Price's "Your matchups"). */
  subtitle?: string
  /** Header padding variant — game-sense uses the tighter 'px-5 pt-4 sm:px-6'. */
  headerClassName?: string
  children: ReactNode
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white/95 shadow-sm">
      <div className={headerClassName}>
        <p className="font-heading text-[10px] font-extrabold uppercase tracking-[0.24em] text-[hsl(var(--game-ink-light))]">
          {label}
        </p>
        {subtitle && (
          <p className="mt-1 font-heading text-[13px] font-[700] text-[hsl(var(--game-ink))]">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}

export function StatPillRow({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <div className="flex gap-1.5 px-5 py-3 sm:gap-2 sm:px-6 sm:py-4">
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-[hsl(var(--game-cream-dark))] px-1.5 py-1.5 sm:rounded-xl sm:px-2 sm:py-2"
        >
          <span className="font-heading text-[14px] font-black text-[hsl(var(--game-ink))] sm:text-[18px]">
            {value}
          </span>
          <span className="font-heading text-[7px] font-extrabold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-light))] sm:text-[9px] sm:tracking-[0.18em]">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

export function CardDivider() {
  return <div className="mx-5 border-t border-dashed border-[hsl(var(--game-ink))]/15 sm:mx-6" />
}
