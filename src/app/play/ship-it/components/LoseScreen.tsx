'use client'

import { PUBLISHERS } from '../data/constants'

interface LoseScreenProps {
  gameName: string
  balance: number
  vision: number
  round: number
  onPlayAgain: () => void
}

const ROUND_NAMES = ['Pitch Round', 'Development', 'Pre-Launch']

const FLAVOUR_TEXTS = [
  '"We had to let everyone go on a Friday afternoon. The Slack channel went quiet at 4pm."',
  '"The game existed in a build folder on three laptops. Those laptops went back to their owners."',
  '"The domain expired six months later. Nobody renewed it."',
]

export default function LoseScreen({
  gameName,
  balance,
  vision,
  round,
  onPlayAgain,
}: LoseScreenProps) {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {/* 1. Header */}
      <div className="rounded-t-2xl bg-[#1A1A14] p-8 text-center dark:bg-[#0a0a0a]">
        <p className="font-heading text-xs uppercase tracking-wider text-red-400">
          Project Cancelled
        </p>
        <p className="mt-2 font-heading text-lg text-white/60">
          &ldquo;{gameName}&rdquo; — cancelled
        </p>
        <p className="mt-1 font-heading text-xl font-bold text-red-400">
          The studio ran out of money.
        </p>
      </div>

      {/* 2. "The lights went out" card */}
      <div className="overflow-hidden rounded-b-2xl border border-border/60">
        {/* Top area */}
        <div className="flex items-center gap-5 bg-[#2a1a1a] px-7 py-5 dark:bg-red-950/30">
          <span className="shrink-0 text-5xl">🕯️</span>
          <div>
            <h2 className="font-heading text-xl font-bold text-red-400">
              The lights went out.
            </h2>
            <p className="mt-1 font-body text-sm italic text-white/70">
              {FLAVOUR_TEXTS[round] ?? FLAVOUR_TEXTS[2]}
            </p>
          </div>
        </div>

        {/* Bottom area: Final accounts */}
        <div className="bg-card px-7 py-5">
          <p className="mb-3 font-heading text-[10px] uppercase tracking-widest text-muted-foreground">
            Final accounts
          </p>
          <div className="flex gap-8">
            <div>
              <p className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground">
                Balance at close
              </p>
              <p className="font-heading text-2xl font-bold text-red-500">
                ${balance}
              </p>
            </div>
            <div>
              <p className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground">
                Vision remaining
              </p>
              <p className="font-heading text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {vision}%
              </p>
            </div>
            <div>
              <p className="font-heading text-[10px] uppercase tracking-wider text-muted-foreground">
                Reached
              </p>
              <p className="font-heading text-2xl font-bold text-foreground">
                {ROUND_NAMES[round] ?? 'Pre-Launch'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Idle Hours message (lose variant) */}
      <div className="mt-6 rounded-2xl bg-primary p-7">
        <h3 className="font-heading text-lg font-bold text-primary-foreground">
          A note from Idle Hours
        </h3>
        <p className="mt-3 font-body text-sm italic leading-relaxed text-primary-foreground/80">
          This happens more than anyone talks about. Studios close quietly.
          Games get cancelled in development. The team disperses, the Steam page
          disappears, and the game that could have been is just — gone.
        </p>
        <p className="mt-3 font-body text-sm italic leading-relaxed text-primary-foreground/80">
          The best thing you can do for the next developer in this position is
          buy their games at full price, leave a review, and tell someone else.
          Every sale is a vote for the next one getting made.
        </p>
      </div>

      {/* 4. Publishers section */}
      <div className="mt-6">
        <h3 className="mb-3 font-heading text-[10px] uppercase tracking-widest text-muted-foreground">
          Publishers who actually keep studios alive
        </h3>
        <div className="grid grid-cols-3 gap-2.5">
          {PUBLISHERS.map((pub) => (
            <a
              key={pub.name}
              href={pub.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-border/60 bg-card p-3 transition-shadow hover:shadow-md"
            >
              <p className="font-heading text-xs font-semibold text-foreground">
                {pub.name}
              </p>
              <p className="mt-0.5 font-heading text-[8px] uppercase tracking-wider text-muted-foreground/60">
                {pub.desc}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* 5. Try again */}
      <button
        type="button"
        onClick={onPlayAgain}
        className="mt-6 w-full rounded-full bg-primary py-4 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary/80"
      >
        &#9654; Try again
      </button>
    </div>
  )
}
