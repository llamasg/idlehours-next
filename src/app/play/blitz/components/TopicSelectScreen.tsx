'use client'

import { useMemo } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import { type BlitzTopic } from '@/data/blitz-topics'
import { type GameEntry } from '@/data/games-db'
import { getMilestones, getTimeLimit, formatTime } from '../lib/milestones'

interface TopicWithPool {
  topic: BlitzTopic
  pool: GameEntry[]
  poolSize: number
}

interface TopicSelectScreenProps {
  topics: TopicWithPool[]
  selectedTopic: BlitzTopic | null
  onSelectTopic: (topic: BlitzTopic) => void
  onStart: () => void
}

const GROUP_LABELS: Record<string, string> = {
  franchise: 'Franchise',
  platform: 'Platform',
  year: 'Year',
  genre: 'Genre',
}

const GROUP_ORDER = ['franchise', 'platform', 'year', 'genre']

export default function TopicSelectScreen({
  topics,
  selectedTopic,
  onSelectTopic,
  onStart,
}: TopicSelectScreenProps) {
  const grouped = useMemo(() => {
    const groups: Record<string, TopicWithPool[]> = {}
    for (const t of topics) {
      const g = t.topic.group
      if (!groups[g]) groups[g] = []
      groups[g].push(t)
    }
    return GROUP_ORDER.filter((g) => groups[g]?.length).map((g) => ({
      key: g,
      label: GROUP_LABELS[g] || g,
      topics: groups[g],
    }))
  }, [topics])

  const selectedData = useMemo(() => {
    if (!selectedTopic) return null
    const entry = topics.find((t) => t.topic.slug === selectedTopic.slug)
    if (!entry) return null
    const milestones = getMilestones(entry.poolSize)
    const timeLimit = getTimeLimit(entry.poolSize)
    return { ...entry, milestones, timeLimit }
  }, [selectedTopic, topics])

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            A game by ◆ Idle Hours
          </p>
          <h1 className="mt-2 font-heading text-5xl font-black tracking-tight text-[hsl(var(--game-ink))]">
            BLI
            <span className="text-[hsl(var(--game-amber))]">⚡</span>
            TZ
          </h1>
          <p className="mt-2 font-heading text-sm italic text-muted-foreground">
            Name as many as you can before time runs out.
          </p>
        </div>

        {/* Topic groups */}
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.key}>
              <h2 className="mb-2 font-heading text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {group.topics.map(({ topic, poolSize }) => {
                  const isSelected = selectedTopic?.slug === topic.slug
                  return (
                    <button
                      key={topic.slug}
                      type="button"
                      onClick={() => onSelectTopic(topic)}
                      className={`group relative rounded-xl border-2 px-4 py-3 text-left transition-all ${
                        isSelected
                          ? 'border-[hsl(var(--game-amber))] bg-[hsl(var(--game-amber))]/5'
                          : 'border-border/40 bg-card hover:border-border'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{topic.icon}</span>
                        <div className="min-w-0">
                          <div className="font-heading text-sm font-bold text-[hsl(var(--game-ink))]">
                            {topic.name}
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {poolSize} games
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Selected topic details + start */}
        {selectedData && (
          <div className="mt-8 rounded-xl border border-border/60 bg-card p-5">
            <p className="mb-3 text-center font-heading text-sm text-muted-foreground">
              {selectedData.topic.prompt}
            </p>

            {/* Milestones */}
            <div className="mb-4 flex justify-center gap-3">
              {(['bronze', 'silver', 'gold'] as const).map((medal) => {
                const emoji = medal === 'bronze' ? '🥉' : medal === 'silver' ? '🥈' : '🥇'
                return (
                  <span
                    key={medal}
                    className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background px-3 py-1 font-heading text-xs font-semibold text-muted-foreground"
                  >
                    {emoji} {selectedData.milestones[medal]}
                  </span>
                )
              })}
            </div>

            {/* Timer preview */}
            <p className="mb-4 text-center text-xs text-muted-foreground">
              You&apos;ll have{' '}
              <span className="font-bold text-[hsl(var(--game-ink))]">
                {formatTime(selectedData.timeLimit)}
              </span>{' '}
              — 2 seconds per game, plus 15.
            </p>

            {/* Start button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={onStart}
                className="rounded-full bg-[hsl(var(--game-amber))] px-8 py-3 font-heading text-sm font-bold text-white transition-all hover:scale-[1.03] hover:brightness-110"
              >
                Start
              </button>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
