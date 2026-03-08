'use client'

import { useState, useCallback, useMemo } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import { supabase } from '@/lib/supabase'
import { type GameResult } from '../page'
import { getMilestones, formatTime } from '../lib/milestones'

interface EndScreenProps {
  result: GameResult
  onPlayAgain: () => void
  onShowLeaderboard: (name: string | null) => void
}

const MEDAL_HEADINGS = {
  gold: ['Champion!', 'You crushed it!', 'Absolute legend!'],
  silver: ['Impressive!', 'Silver streak!', 'Well played!'],
  bronze: ['Not bad!', 'Bronze earner!', 'Solid run!'],
  none: ['Time\'s up!', 'Nice try!', 'Keep at it!'],
}

const MEDAL_SUBHEADINGS = {
  gold: 'Top-tier knowledge. You owned that topic.',
  silver: 'You really know your stuff.',
  bronze: 'A respectable showing.',
  none: 'Every run makes you sharper.',
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function EndScreen({ result, onPlayAgain, onShowLeaderboard }: EndScreenProps) {
  const [name, setName] = useState('')
  const [posting, setPosting] = useState(false)
  const [showAllMissed, setShowAllMissed] = useState(false)
  const [copied, setCopied] = useState(false)

  const { score, pool, topic, medal, timeUsed, guessedIds, guessedTitles } = result
  const poolSize = pool.length
  const milestones = getMilestones(poolSize)

  const medalKey = medal || 'none'
  const heading = useMemo(() => pickRandom(MEDAL_HEADINGS[medalKey]), [medalKey])
  const subheading = MEDAL_SUBHEADINGS[medalKey]
  const medalEmoji = medal === 'gold' ? '🥇' : medal === 'silver' ? '🥈' : medal === 'bronze' ? '🥉' : null
  const medalLabel = medal ? `${medal.charAt(0).toUpperCase()}${medal.slice(1)} Medal` : null

  // Missed games
  const guessedSet = new Set(guessedIds)
  const missed = pool.filter((g) => !guessedSet.has(g.id))
  const showMissedCount = 12

  const shareText = useCallback(() => {
    const lines = [
      `BLITZ ⚡ ${topic.name}`,
      `${score}/${poolSize} ${medalEmoji || ''}`.trim(),
      `${timeUsed}s · idlehours.co.uk/play/blitz`,
    ]
    try {
      navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }, [medalEmoji, topic.name, score, poolSize, timeUsed])

  const handlePostScore = useCallback(async () => {
    const trimmed = name.trim()
    if (!trimmed || trimmed.length > 20 || score > poolSize) return
    if (!supabase) {
      onShowLeaderboard(trimmed)
      return
    }

    // Rate limiting
    try {
      const lastPost = sessionStorage.getItem('blitz_last_post')
      if (lastPost && Date.now() - parseInt(lastPost) < 30000) return
    } catch {}

    setPosting(true)
    try {
      await supabase.from('blitz_scores').insert({
        topic_slug: topic.slug,
        name: trimmed,
        score,
        pool_size: poolSize,
        time_seconds: timeUsed,
      })
      sessionStorage.setItem('blitz_last_post', Date.now().toString())
    } catch {}
    setPosting(false)
    onShowLeaderboard(trimmed)
  }, [name, score, poolSize, topic.slug, timeUsed, onShowLeaderboard])

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[850px] px-4 py-10">
        {/* ── Result Card ── */}
        <div className="overflow-hidden rounded-[24px] border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] shadow-sm">
          {/* Accent line */}
          <div className={`h-[4px] w-full ${medal ? 'bg-[hsl(var(--game-amber))]' : 'bg-[hsl(var(--game-ink-light))]'}`} />

          {/* Top bar — heading */}
          <div className="flex items-center gap-2 border-b border-[hsl(var(--game-ink))]/10 px-8 py-4">
            <div className="flex flex-col gap-px">
              <h2 className="font-heading text-[18px] font-black text-[hsl(var(--game-ink))]">
                {heading}
              </h2>
              <p className="text-[14px] font-semibold text-[hsl(var(--game-ink-mid))]">
                {subheading}
              </p>
            </div>
            <div className="flex-1" />
            <p className="font-heading text-[13px] font-semibold italic text-[hsl(var(--game-ink-light))]">
              {topic.name}
            </p>
          </div>

          {/* Two-column body */}
          <div className="grid min-h-[250px] grid-cols-1 md:grid-cols-2">
            {/* Left — medal + rank */}
            <div className="flex flex-col items-center justify-center gap-4 border-b border-[hsl(var(--game-ink))]/10 px-6 py-9 text-center md:border-b-0 md:border-r">
              {medalEmoji ? (
                <div
                  className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[hsl(var(--game-amber))] text-5xl shadow-[0_10px_32px_rgba(200,135,58,0.35)]"
                  style={{ animation: 'badge-pulse 1.2s ease-out forwards' }}
                >
                  {medalEmoji}
                </div>
              ) : (
                <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[hsl(var(--game-ink-light))] text-[11px] font-bold uppercase tracking-[0.04em] text-white/30">
                  —
                </div>
              )}
              <div className="flex flex-col items-center gap-1.5">
                <p className="font-heading text-[11px] font-extrabold uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">
                  {medal ? 'You earned' : 'No medal'}
                </p>
                {medalLabel && (
                  <p className="font-heading text-2xl font-black leading-none text-[hsl(var(--game-amber))]">
                    {medalLabel}
                  </p>
                )}
              </div>
            </div>

            {/* Right — score + milestones */}
            <div className="flex flex-col gap-5 px-6 py-8">
              {/* Big score */}
              <div className="flex flex-col gap-0.5">
                <p className="font-heading text-[11px] font-extrabold uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">
                  Games named
                </p>
                <div className="flex items-baseline">
                  <span className="font-heading text-[50px] font-black leading-none tracking-tight text-[hsl(var(--game-amber))]">
                    {score}
                  </span>
                  <span className="ml-2 font-heading text-[20px] font-bold text-[hsl(var(--game-ink-light))]">
                    / {poolSize}
                  </span>
                </div>
                <p className="mt-1 font-heading text-[13px] font-semibold italic text-[hsl(var(--game-ink-mid))]">
                  {topic.prompt}
                </p>
              </div>

              {/* Stats row */}
              <div className="flex gap-3">
                <div className="flex flex-1 flex-col items-center gap-px rounded-xl bg-[hsl(var(--game-cream))] py-2.5">
                  <span className="font-heading text-[15px] font-extrabold text-[hsl(var(--game-ink))]">
                    {formatTime(timeUsed)}
                  </span>
                  <span className="font-heading text-[9px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-light))]">
                    Time
                  </span>
                </div>
                <div className="flex flex-1 flex-col items-center gap-px rounded-xl bg-[hsl(var(--game-cream))] py-2.5">
                  <span className="font-heading text-[15px] font-extrabold text-[hsl(var(--game-ink))]">
                    {Math.round((score / poolSize) * 100)}%
                  </span>
                  <span className="font-heading text-[9px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-light))]">
                    Accuracy
                  </span>
                </div>
              </div>

              {/* Milestone ladder */}
              <div className="flex flex-1 flex-col justify-end gap-2">
                <p className="mb-0.5 font-heading text-[11px] font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--game-ink-light))]">
                  Milestones
                </p>
                {(['bronze', 'silver', 'gold'] as const).map((tier) => {
                  const threshold = milestones[tier]
                  const reached = score >= threshold
                  const isCurrent = medal === tier
                  const emoji = tier === 'bronze' ? '🥉' : tier === 'silver' ? '🥈' : '🥇'
                  return (
                    <div
                      key={tier}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 ${
                        isCurrent
                          ? 'bg-[hsl(var(--game-amber))]/8 ring-[1.5px] ring-[hsl(var(--game-amber))]/25'
                          : reached
                            ? 'opacity-50'
                            : 'border-[1.5px] border-dashed border-[hsl(var(--game-ink))]/10'
                      }`}
                    >
                      <div
                        className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                          isCurrent
                            ? 'bg-[hsl(var(--game-amber))]'
                            : reached
                              ? 'bg-[hsl(var(--game-green))]'
                              : 'bg-[hsl(var(--game-cream-dark))]'
                        }`}
                      />
                      <div className="flex-1">
                        <p className={`font-heading text-[13px] font-extrabold capitalize ${
                          isCurrent ? 'text-[hsl(var(--game-amber))]' : 'text-[hsl(var(--game-ink))]'
                        }`}>
                          {emoji} {tier}
                        </p>
                      </div>
                      <span className="font-heading text-[12px] font-semibold text-[hsl(var(--game-ink-light))]">
                        {threshold} games
                      </span>
                      {isCurrent && (
                        <span className="font-heading text-[11px] font-extrabold uppercase tracking-[0.08em] text-[hsl(var(--game-amber))]">
                          You
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer — name entry + actions */}
          <div className="border-t border-[hsl(var(--game-ink))]/10 px-8 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <p className="flex-shrink-0 font-heading text-[13px] font-bold text-[hsl(var(--game-ink))]">
                Claim your score
              </p>
              <div className="flex min-w-0 flex-1 gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 20))}
                  placeholder="Your name"
                  className="min-w-0 flex-1 rounded-lg border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))] px-3 py-2 font-heading text-sm text-[hsl(var(--game-ink))] placeholder:text-[hsl(var(--game-ink-light))]/50 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--game-amber))]/40"
                />
                <button
                  type="button"
                  onClick={handlePostScore}
                  disabled={!name.trim() || posting}
                  className="flex-shrink-0 rounded-lg bg-[hsl(var(--game-ink))] px-5 py-2 font-heading text-[13px] font-bold text-white transition-all hover:brightness-125 disabled:opacity-40"
                >
                  {posting ? 'Posting...' : 'Post Score'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => onShowLeaderboard(null)}
                className="text-[12px] font-semibold text-[hsl(var(--game-ink-light))] hover:text-[hsl(var(--game-ink))]"
              >
                Skip
              </button>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onPlayAgain}
            className="rounded-full bg-[hsl(var(--game-amber))] px-8 py-3 font-heading text-sm font-bold text-white shadow-[0_4px_16px_rgba(200,135,58,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(200,135,58,0.4)]"
          >
            Play Again
          </button>
          <button
            type="button"
            onClick={shareText}
            className="rounded-full border-2 border-[hsl(var(--game-ink))]/10 px-6 py-2.5 font-heading text-sm font-bold text-[hsl(var(--game-ink))] transition-colors hover:border-[hsl(var(--game-ink))]/20"
          >
            {copied ? 'Copied!' : 'Share Result'}
          </button>
        </div>

        {/* ── Answer Review ── */}
        <div className="mt-8 space-y-5">
          {/* You got */}
          {guessedTitles.length > 0 && (
            <div>
              <h3 className="mb-2 font-heading text-[11px] font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--game-ink-light))]">
                You got ({guessedTitles.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {guessedTitles.map((title) => (
                  <span
                    key={title}
                    className="rounded-full border border-[hsl(var(--game-amber))]/30 bg-[hsl(var(--game-amber))]/5 px-3 py-1 text-xs font-semibold text-[hsl(var(--game-ink))]"
                  >
                    {title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missed */}
          {missed.length > 0 && (
            <div>
              <h3 className="mb-2 font-heading text-[11px] font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--game-ink-light))]">
                Missed ({missed.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(showAllMissed ? missed : missed.slice(0, showMissedCount)).map((g) => (
                  <span
                    key={g.id}
                    className="rounded-full border border-[hsl(var(--game-ink))]/8 bg-[hsl(var(--game-ink))]/3 px-3 py-1 text-xs text-[hsl(var(--game-ink-mid))]"
                  >
                    {g.title}
                  </span>
                ))}
                {!showAllMissed && missed.length > showMissedCount && (
                  <button
                    type="button"
                    onClick={() => setShowAllMissed(true)}
                    className="rounded-full border border-[hsl(var(--game-ink))]/10 px-3 py-1 text-xs font-semibold text-[hsl(var(--game-ink-mid))] transition-colors hover:border-[hsl(var(--game-ink))]/20 hover:text-[hsl(var(--game-ink))]"
                  >
                    +{missed.length - showMissedCount} more
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
