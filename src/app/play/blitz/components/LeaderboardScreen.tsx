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
        <div className="mb-6">
          <p className="font-heading text-xs font-semibold uppercase tracking-wider text-[hsl(var(--game-amber))]">
            ⚡ Blitz · Leaderboard
          </p>
          <h1 className="mt-1 font-heading text-2xl font-black text-[hsl(var(--game-ink))]">
            {topic.name}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{poolSize} games</span>
            <span>·</span>
            <span>All time</span>
          </div>

          {/* Milestone chips */}
          <div className="mt-3 flex gap-2">
            {(['bronze', 'silver', 'gold'] as const).map((medal) => {
              const emoji = medal === 'bronze' ? '🥉' : medal === 'silver' ? '🥈' : '🥇'
              return (
                <span
                  key={medal}
                  className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground"
                >
                  {emoji} {milestones[medal]}
                </span>
              )
            })}
          </div>

          <button
            type="button"
            onClick={onChangeTopic}
            className="mt-3 text-xs font-semibold text-[hsl(var(--game-amber))] hover:underline"
          >
            Change topic →
          </button>
        </div>

        {/* Table */}
        {!supabase ? (
          <div className="rounded-xl border border-border/40 bg-card p-8 text-center text-sm text-muted-foreground">
            Leaderboard not available — Supabase not configured.
          </div>
        ) : loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-border/40 bg-card p-8 text-center text-sm text-muted-foreground">
            No scores yet. Be the first!
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/40">
            {/* Column headers */}
            <div className="grid grid-cols-[40px_1fr_80px_60px] gap-2 border-b border-border/30 bg-muted/30 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
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
                  className={`grid grid-cols-[40px_1fr_80px_60px] gap-2 px-4 py-2.5 text-sm ${
                    isPlayer
                      ? 'border-l-2 border-l-[hsl(var(--game-amber))] bg-[hsl(var(--game-amber))]/5'
                      : i % 2 === 0
                        ? 'bg-card'
                        : 'bg-muted/10'
                  }`}
                >
                  <span className="font-heading text-xs font-bold text-muted-foreground">
                    {medal || i + 1}
                  </span>
                  <span className={`font-semibold ${isPlayer ? 'text-[hsl(var(--game-amber))]' : 'text-[hsl(var(--game-ink))]'}`}>
                    {entry.name}
                    {isPlayer && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-[hsl(var(--game-amber))]/15 px-1.5 py-0.5 text-[9px] font-bold text-[hsl(var(--game-amber))]">
                        You
                      </span>
                    )}
                  </span>
                  <span className="text-right font-heading text-xs font-bold text-[hsl(var(--game-ink))]">
                    {entry.score} / {entry.pool_size}
                  </span>
                  <span className="text-right font-heading text-xs text-muted-foreground">
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
