'use client'

import type { Offer } from '../data/offers'

interface EndScreenProps {
  gameName: string
  acceptedOffers: Offer[]
  balance: number
  vision: number
  onPlayAgain: () => void
}

// ── Publisher & Job board data ────────────────────────────────────────────────

const PUBLISHERS = [
  {
    name: 'Devolver Digital',
    url: 'https://devolverdigital.com',
    desc: 'Weird, bold, trusted',
  },
  {
    name: 'Annapurna Interactive',
    url: 'https://annapurnainteractive.com',
    desc: 'Artful, emotional',
  },
  {
    name: 'Raw Fury',
    url: 'https://rawfury.com',
    desc: 'Developer-first',
  },
  {
    name: 'Finji',
    url: 'https://finji.co',
    desc: 'Night in the Woods folk',
  },
  {
    name: 'Fellow Traveller',
    url: 'https://fellowtraveller.games',
    desc: 'Narrative-led games',
  },
  {
    name: 'tinyBuild',
    url: 'https://tinybuild.com',
    desc: 'Indie-friendly',
  },
]

const JOB_BOARDS = [
  { name: 'Games Jobs Direct', url: 'https://gamesjobsdirect.com' },
  { name: 'Hitmarker', url: 'https://hitmarker.net' },
  { name: 'Work With Indies', url: 'https://workwithindies.com' },
]

// ── Verdict helpers ──────────────────────────────────────────────────────────

function getVerdict(score: number) {
  if (score >= 85) return { label: 'Overwhelmingly Positive', colour: 'bg-green-600' }
  if (score >= 70) return { label: 'Mostly Positive', colour: 'bg-lime-600' }
  if (score >= 50) return { label: 'Mixed', colour: 'bg-amber-500' }
  if (score >= 30) return { label: 'Mostly Negative', colour: 'bg-orange-600' }
  return { label: 'Overwhelmingly Negative', colour: 'bg-red-600' }
}

function getVerdictMessage(score: number) {
  if (score >= 85) return 'The players love it. You made something real.'
  if (score >= 70)
    return 'Mostly Positive. The community sees what you were trying to do — mostly.'
  if (score >= 50)
    return 'Mixed. Half the reviews mention the microtransactions. You know which half.'
  if (score >= 30)
    return 'Mostly Negative. "The core game is great but the execs got to it." —Top review'
  return 'Overwhelmingly Negative. The game was great. Once.'
}

// ── Component ────────────────────────────────────────────────────────────────

export default function EndScreen({
  gameName,
  acceptedOffers,
  balance,
  vision,
  onPlayAgain,
}: EndScreenProps) {
  // ── Score calculation ────────────────────────────────────────────────────

  let score = 75
  const breakdownItems: { text: string; impact: string; score: number }[] = []

  // Vision bonus
  if (vision >= 80) {
    score += 15
    breakdownItems.push({
      text: 'Kept your original vision intact',
      impact: 'pos',
      score: 15,
    })
  } else if (vision >= 50) {
    score += 5
    breakdownItems.push({
      text: 'Maintained most of your vision',
      impact: 'pos',
      score: 5,
    })
  } else {
    score -= 10
    breakdownItems.push({
      text: 'Vision compromised heavily',
      impact: 'neg',
      score: -10,
    })
  }

  // Per accepted offer
  acceptedOffers.forEach((o) => {
    score += o.reviewNote.score
    breakdownItems.push({
      text: o.reviewNote.text,
      impact: o.reviewNote.impact,
      score: o.reviewNote.score,
    })
  })

  // Balance bonus
  if (balance >= 300) {
    score += 5
    breakdownItems.push({
      text: 'Financially independent at launch',
      impact: 'pos',
      score: 5,
    })
  } else if (balance <= 0) {
    score -= 10
    breakdownItems.push({
      text: 'Launched on fumes',
      impact: 'neg',
      score: -10,
    })
  }

  score = Math.max(0, Math.min(100, score))

  const verdict = getVerdict(score)
  const verdictMessage = getVerdictMessage(score)

  // ── Degraded title ───────────────────────────────────────────────────────

  const suffixes = acceptedOffers
    .filter((o) => o.titleSuffix)
    .map((o) => o.titleSuffix)
  const degradedTitle =
    suffixes.length > 0
      ? `${gameName}: ${suffixes.join(', ')}`
      : gameName

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {/* 1. Header section */}
      <div className="text-center">
        <p className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
          Your Game Has Launched
        </p>
        <p className="mt-1 font-body text-sm text-muted-foreground/70">
          You started with: &ldquo;{gameName}&rdquo;
        </p>
        <h1 className="mt-1 font-heading text-xl font-bold text-foreground">
          {degradedTitle}
        </h1>
      </div>

      {/* 2. Steam review widget */}
      <div className="mt-6">
        {/* Dark header */}
        <div className="flex items-center justify-between rounded-t-xl bg-[#1b2838] px-5 py-3">
          <span className="font-heading text-[9px] uppercase tracking-widest text-[#c6d4df]">
            Steam User Reviews
          </span>
          <span
            className={`rounded px-3 py-1 font-heading text-[10px] font-medium tracking-wider text-white ${verdict.colour}`}
          >
            {verdict.label}
          </span>
        </div>

        {/* Body */}
        <div className="rounded-b-xl border border-t-0 border-border/60 bg-card p-5">
          {/* Score bar */}
          <div className="flex h-3 gap-0.5 overflow-hidden rounded-full border border-border/60">
            <div
              className="bg-green-500 transition-all duration-1000"
              style={{ width: `${score}%` }}
            />
            <div className="flex-1 bg-red-500" />
          </div>

          {/* Percentages */}
          <div className="mt-1.5 flex justify-between">
            <span className="font-heading text-[10px] text-muted-foreground">
              {score}% positive
            </span>
            <span className="font-heading text-[10px] text-muted-foreground">
              {100 - score}% negative
            </span>
          </div>

          {/* Verdict quote */}
          <div className="mt-3 border-l-[3px] border-primary/40 bg-muted/30 px-4 py-2.5">
            <p className="font-body text-sm italic text-muted-foreground">
              {verdictMessage}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Review breakdown */}
      <div className="mt-6">
        <h3 className="mb-3 border-b border-border/40 pb-2 font-heading text-[10px] uppercase tracking-widest text-muted-foreground">
          What the players said
        </h3>
        <div>
          {breakdownItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-dashed border-border/20 py-1.5"
            >
              <span className="font-heading text-xs text-muted-foreground">
                {item.text}
              </span>
              <span
                className={`ml-3 shrink-0 font-heading text-xs font-bold ${
                  item.impact === 'neg'
                    ? 'text-red-500'
                    : item.impact === 'pos'
                      ? 'text-emerald-500'
                      : 'text-amber-500'
                }`}
              >
                {item.score > 0 ? '+' : ''}
                {item.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Idle Hours message card */}
      <div className="mt-6 rounded-2xl bg-primary p-7">
        <h3 className="font-heading text-lg font-bold text-primary-foreground">
          A note from Idle Hours
        </h3>
        <p className="mt-3 font-body text-sm italic leading-relaxed text-primary-foreground/80">
          The best games you&apos;ve ever played were probably made by a small
          team who cared deeply and had the freedom to follow that care wherever
          it led. That freedom is rare. It requires publishers who trust
          developers, players who buy at full price, and critics who value
          artistry over aggregate scores.
        </p>
        <p className="mt-3 font-body text-sm italic leading-relaxed text-primary-foreground/80">
          The executives in this game are satirical — but only just. Support
          indie developers. Wishlist their games. Buy them on launch day. Tell
          your friends. It makes a real difference.
        </p>
      </div>

      {/* 5. Good publishers grid */}
      <div className="mt-6">
        <h3 className="mb-3 font-heading text-[10px] uppercase tracking-widest text-muted-foreground">
          Publishers who actually get it
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

      {/* 6. Job boards */}
      <div className="mt-6">
        <h3 className="mb-3 font-heading text-[10px] uppercase tracking-widest text-muted-foreground">
          Work in games
        </h3>
        <div className="flex flex-wrap gap-4">
          {JOB_BOARDS.map((board) => (
            <a
              key={board.name}
              href={board.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-heading text-xs text-primary underline underline-offset-2"
            >
              {board.name} &#8599;
            </a>
          ))}
        </div>
      </div>

      {/* 7. Play again */}
      <button
        type="button"
        onClick={onPlayAgain}
        className="mt-6 w-full rounded-full bg-primary py-4 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary/80"
      >
        &#9654; Play again with a new game
      </button>
    </div>
  )
}
