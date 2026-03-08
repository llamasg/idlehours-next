'use client'

import { useState, useCallback } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import GameEndModal from '@/components/games/GameEndModal'
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
  none: ['Time\'s up!', 'Nice try!', 'Better luck next time!'],
}

const MEDAL_FLAVOURS = {
  gold: 'Top-tier knowledge.',
  silver: 'You really know your stuff.',
  bronze: 'A respectable showing.',
  none: 'Every run makes you sharper.',
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function EndScreen({ result, onPlayAgain, onShowLeaderboard }: EndScreenProps) {
  const [showModal, setShowModal] = useState(true)
  const [name, setName] = useState('')
  const [posting, setPosting] = useState(false)

  const { score, pool, topic, medal, timeUsed, guessedIds, guessedTitles } = result
  const poolSize = pool.length

  const medalKey = medal || 'none'
  const heading = pickRandom(MEDAL_HEADINGS[medalKey])
  const rankName = medal
    ? `${medal.charAt(0).toUpperCase()}${medal.slice(1)} Medal`
    : 'No Medal'
  const rankFlavour = MEDAL_FLAVOURS[medalKey]

  const stats = [
    { label: 'CORRECT', value: `${score}/${poolSize}` },
    { label: 'TIME', value: `${timeUsed}s` },
    { label: 'TOPIC', value: topic.name },
  ]

  // Missed games (not guessed)
  const guessedSet = new Set(guessedIds)
  const missed = pool.filter((g) => !guessedSet.has(g.id))
  const showMissedCount = Math.min(15, missed.length)

  const shareText = useCallback(() => {
    const medalEmoji = medal === 'gold' ? '🥇' : medal === 'silver' ? '🥈' : medal === 'bronze' ? '🥉' : ''
    const lines = [
      `BLITZ ⚡ ${topic.name}`,
      `${score}/${poolSize} ${medalEmoji}`,
      `${timeUsed}s · idlehours.co.uk/play/blitz`,
    ]
    try { navigator.clipboard.writeText(lines.join('\n')) } catch {}
  }, [medal, topic.name, score, poolSize, timeUsed])

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

  const heroZone = (
    <div className="flex flex-col items-center gap-2 bg-gradient-to-b from-[hsl(var(--game-amber))]/10 to-transparent px-6 pb-4 pt-8">
      <div className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {topic.name}
      </div>
      <div className="font-heading text-5xl font-black text-[hsl(var(--game-ink))]">
        {score}
        <span className="text-2xl text-muted-foreground">/{poolSize}</span>
      </div>
      {medal && (
        <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--game-amber))]/30 bg-[hsl(var(--game-amber))]/10 px-3 py-1 font-heading text-xs font-bold text-[hsl(var(--game-amber))]">
          {medal === 'gold' ? '🥇' : medal === 'silver' ? '🥈' : '🥉'} {rankName}
        </span>
      )}
    </div>
  )

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10">
        {/* Answer review */}
        <div className="mb-8">
          {guessedTitles.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
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

          {missed.length > 0 && (
            <div>
              <h3 className="mb-2 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Missed ({missed.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {missed.slice(0, showMissedCount).map((g) => (
                  <span
                    key={g.id}
                    className="rounded-full border border-border/40 bg-muted/30 px-3 py-1 text-xs text-muted-foreground"
                  >
                    {g.title}
                  </span>
                ))}
                {missed.length > showMissedCount && (
                  <span className="rounded-full px-3 py-1 text-xs text-muted-foreground">
                    +{missed.length - showMissedCount} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Name entry + leaderboard post */}
        <div className="mb-6 rounded-xl border border-border/60 bg-card p-5">
          <p className="mb-3 text-center font-heading text-sm font-semibold text-[hsl(var(--game-ink))]">
            Post your score to the leaderboard
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 20))}
              placeholder="Your name"
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-[hsl(var(--game-ink))] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--game-amber))]/40"
            />
            <button
              type="button"
              onClick={handlePostScore}
              disabled={!name.trim() || posting}
              className="flex-shrink-0 rounded-lg bg-[hsl(var(--game-ink))] px-5 py-2.5 font-heading text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
            >
              {posting ? 'Posting...' : 'Post Score'}
            </button>
          </div>
          <div className="mt-2 flex justify-center">
            <button
              type="button"
              onClick={() => onShowLeaderboard(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Skip
            </button>
          </div>
        </div>

        {/* Play again */}
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={onPlayAgain}
            className="rounded-full bg-[hsl(var(--game-amber))] px-8 py-3 font-heading text-sm font-bold text-white transition-all hover:scale-[1.03] hover:brightness-110"
          >
            Play Again
          </button>
        </div>
      </main>
      <SiteFooter />

      {showModal && (
        <GameEndModal
          result="win"
          score={score}
          heading={heading}
          subheading={`${topic.name} · ${formatTime(timeUsed)}`}
          rankName={rankName}
          rankFlavour={rankFlavour}
          stats={stats}
          heroZone={heroZone}
          onShare={shareText}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
