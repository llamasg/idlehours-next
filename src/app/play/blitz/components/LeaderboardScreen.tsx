'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import { supabase } from '@/lib/supabase'
import { type BlitzTopic } from '@/data/blitz-topics'
import { getMilestones, formatTime } from '../lib/milestones'

interface LeaderboardEntry {
  id: string
  name: string
  score: number
  pool_size: number
  time_seconds: number
  created_at: string
}

interface LeaderboardScreenProps {
  topic: BlitzTopic
  poolSize: number
  playerName: string | null
  onChangeTopic: () => void
}

export default function LeaderboardScreen({
  topic,
  poolSize,
  playerName,
  onChangeTopic,
}: LeaderboardScreenProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const milestones = getMilestones(poolSize)

  const fetchEntries = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    try {
      const { data } = await supabase
        .from('blitz_scores')
        .select('*')
        .eq('topic_slug', topic.slug)
        .order('score', { ascending: false })
        .order('time_seconds', { ascending: true })
        .limit(50)

      if (data) setEntries(data)
    } catch {
      // Silently fail
    }
    setLoading(false)
  }, [topic.slug])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const getMedalEmoji = (pos: number) => {
    if (pos === 0) return '🥇'
    if (pos === 1) return '🥈'
    if (pos === 2) return '🥉'
    return null
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="font-heading text-[13px] font-extrabold uppercase tracking-[0.2em] text-[hsl(var(--game-amber))]">
            ⚡ Blitz · Leaderboard
          </p>
          <h1 className="mt-2 font-heading text-[48px] leading-tight font-black text-[hsl(var(--game-ink))]">
            {topic.name}
          </h1>
          <div className="mt-2 flex items-center gap-3 text-[13px] text-[hsl(var(--game-ink-mid))]">
            <span>{poolSize} games</span>
            <span>·</span>
            <span>All time</span>
          </div>

          {/* Milestone chips */}
          <div className="mt-4 flex gap-2">
            {(['bronze', 'silver', 'gold'] as const).map((medal) => {
              const emoji = medal === 'bronze' ? '🥉' : medal === 'silver' ? '🥈' : '🥇'
              return (
                <span
                  key={medal}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background px-3 py-1 text-[13px] font-semibold text-[hsl(var(--game-ink-mid))]"
                >
                  {emoji} {milestones[medal]}
                </span>
              )
            })}
          </div>

          <button
            type="button"
            onClick={onChangeTopic}
            className="mt-4 text-[14px] font-heading font-bold text-[hsl(var(--game-amber))] hover:underline"
          >
            Change topic →
          </button>
        </div>

        {/* Table */}
        {!supabase ? (
          <div className="rounded-2xl bg-[hsl(var(--game-white))] p-8 text-center text-[14px] text-[hsl(var(--game-ink-mid))] shadow-[0_4px_24px_rgba(0,0,0,0.10)]">
            Leaderboard not available — Supabase not configured.
          </div>
        ) : loading ? (
          <div className="py-12 text-center text-[14px] text-[hsl(var(--game-ink-mid))]">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl bg-[hsl(var(--game-white))] p-8 text-center text-[14px] text-[hsl(var(--game-ink-mid))] shadow-[0_4px_24px_rgba(0,0,0,0.10)]">
            No scores yet. Be the first!
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-[hsl(var(--game-white))] shadow-[0_4px_24px_rgba(0,0,0,0.10)]">
            {/* Column headers */}
            <div className="grid grid-cols-[48px_1fr_90px_70px] gap-2 border-b border-border/30 px-5 py-3 text-[11px] font-heading font-extrabold uppercase tracking-[0.2em] text-[hsl(var(--game-ink-light))]">
              <span>#</span>
              <span>Name</span>
              <span className="text-right">Score</span>
              <span className="text-right">Time</span>
            </div>

            {/* Rows */}
            {entries.map((entry, i) => {
              const isPlayer = playerName && entry.name.toLowerCase() === playerName.toLowerCase()
              const medal = getMedalEmoji(i)
              return (
                <div
                  key={entry.id}
                  className={`grid grid-cols-[48px_1fr_90px_70px] items-center gap-2 px-5 py-3 text-[15px] ${
                    isPlayer
                      ? 'border-l-[3px] border-l-[hsl(var(--game-amber))] bg-[hsl(var(--game-white))]'
                      : i % 2 === 0
                        ? 'bg-[hsl(var(--game-white))]'
                        : 'bg-[hsl(var(--game-cream))]'
                  }`}
                >
                  <span className="flex items-center justify-center">
                    {medal ? (
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-base ${
                          i === 0
                            ? 'bg-[hsl(var(--game-amber))]/20'
                            : i === 1
                              ? 'bg-gray-200'
                              : 'bg-orange-100'
                        }`}
                      >
                        {medal}
                      </span>
                    ) : (
                      <span className="font-heading text-[14px] font-bold text-[hsl(var(--game-ink-light))]">
                        {i + 1}
                      </span>
                    )}
                  </span>
                  <span className={`font-heading font-semibold ${isPlayer ? 'font-extrabold text-[hsl(var(--game-amber))]' : 'text-[hsl(var(--game-ink))]'}`}>
                    {entry.name}
                    {isPlayer && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-[hsl(var(--game-amber))]/15 px-2 py-0.5 text-[11px] font-heading font-extrabold tracking-wide text-[hsl(var(--game-amber))]">
                        You
                      </span>
                    )}
                  </span>
                  <span className="text-right font-heading text-[18px] font-extrabold text-[hsl(var(--game-ink))]">
                    {entry.score} / {entry.pool_size}
                  </span>
                  <span className="text-right font-heading text-[14px] font-medium text-[hsl(var(--game-ink-mid))]">
                    {formatTime(entry.time_seconds)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
