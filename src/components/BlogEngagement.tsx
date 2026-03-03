import Link from 'next/link'
import NewsletterForm from './NewsletterForm'

const GAMES = [
  { title: 'Game Sense', icon: '\u{1F3AE}', color: 'text-violet-600 dark:text-violet-400' },
  { title: 'Street Date', icon: '\u{1F4C5}', color: 'text-amber-600 dark:text-amber-400' },
  { title: 'Shelf Price', icon: '\u{1F4B0}', color: 'text-emerald-600 dark:text-emerald-400' },
  { title: 'Ship It', icon: '\u{1F4E6}', color: 'text-rose-600 dark:text-rose-400' },
]

export default function BlogEngagement() {
  return (
    <div className="mt-16 space-y-6 border-t border-border/40 pt-10">
      {/* Play our daily games */}
      <Link
        href="/play"
        className="group block rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 to-primary/10 p-6 transition-shadow hover:shadow-md"
      >
        <p className="font-heading text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          While you&apos;re here
        </p>
        <h3 className="mt-1 font-heading text-lg font-bold text-foreground">
          Play our daily games
        </h3>
        <div className="mt-4 flex flex-wrap gap-4">
          {GAMES.map((game) => (
            <div key={game.title} className="flex items-center gap-1.5">
              <span className="text-base">{game.icon}</span>
              <span className={`font-heading text-xs font-semibold ${game.color}`}>
                {game.title}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1 font-heading text-xs font-semibold text-primary transition-colors group-hover:text-primary/80">
          Browse all games
          <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </p>
      </Link>

      {/* Newsletter */}
      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <p className="font-heading text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Stay in the loop
        </p>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Good games. Good reads. Once a week.
        </p>
        <div className="mt-3">
          <NewsletterForm />
        </div>
      </div>
    </div>
  )
}
