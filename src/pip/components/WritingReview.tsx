'use client'

import { motion } from 'framer-motion'
import type { WritingReview as ReviewData } from '@/pip/lib/pipClaude'

interface WritingReviewProps {
  review: ReviewData
}

function scoreColor(score: number): string {
  if (score >= 7) return '#4a7a48'
  if (score >= 4) return '#b07530'
  return '#b93a3a'
}

function seoStatusColor(status: string): string {
  if (status === 'Good') return '#4a7a48'
  if (status === 'OK') return '#b07530'
  return '#b93a3a'
}

const TAG_COLORS: Record<string, { bg: string; fg: string }> = {
  Voice: { bg: '#ede9fe', fg: '#6d28d9' },
  Structure: { bg: '#dbeafe', fg: '#1d4ed8' },
  Tone: { bg: '#fef3c7', fg: '#92400e' },
  Tense: { bg: '#fee2e2', fg: '#b91c1c' },
}

const stagger = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' as const },
  }),
}

export function WritingReview({ review }: WritingReviewProps) {
  let idx = 0

  return (
    <div className="space-y-6">
      {/* Score gauges */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        custom={idx++}
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {(['voice', 'clarity', 'seo'] as const).map((key) => {
          const score = review.scores[key]
          const color = scoreColor(score)
          return (
            <div
              key={key}
              className="rounded-xl bg-white p-4 text-center shadow-sm border border-stone-200"
            >
              <div className="text-3xl font-bold" style={{ color }}>
                {score}
              </div>
              <div className="text-xs text-stone-500 uppercase tracking-wider mt-1 capitalize">
                {key}
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${score * 10}%` }}
                  transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* What's working */}
      {review.working.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            What&apos;s working
          </h3>
          {review.working.map((strength, i) => (
            <motion.div
              key={i}
              custom={idx++}
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="rounded-xl bg-emerald-50 border border-emerald-200 p-4"
            >
              <p className="text-sm leading-relaxed text-stone-700">{strength}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Flags */}
      {review.flags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Flags
          </h3>
          {review.flags.map((flag, i) => {
            const tagColor = TAG_COLORS[flag.tag] ?? { bg: '#f3f4f6', fg: '#4b5563' }
            return (
              <motion.div
                key={i}
                custom={idx++}
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="rounded-xl bg-amber-50 border border-amber-200 p-4"
              >
                <p className="text-sm italic text-stone-500 mb-2">&ldquo;{flag.quote}&rdquo;</p>
                <p className="text-sm leading-relaxed text-stone-700">{flag.note}</p>
                <span
                  className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: tagColor.bg, color: tagColor.fg }}
                >
                  {flag.tag}
                </span>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* SEO */}
      <motion.div
        custom={idx++}
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          SEO
        </h3>
        <div className="rounded-xl bg-white border border-stone-200 shadow-sm divide-y divide-stone-100">
          {([
            { label: 'Headline', text: review.seo.headline, status: review.seo.headlineScore },
            { label: 'Keywords', text: review.seo.keywords, status: review.seo.keywordsScore },
            { label: 'Depth', text: review.seo.depth, status: review.seo.depthScore },
          ] as const).map((row) => {
            const statusColor = seoStatusColor(row.status)
            return (
              <div key={row.label} className="flex items-start gap-3 px-4 py-3">
                <span
                  className="shrink-0 mt-0.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${statusColor}18`,
                    color: statusColor,
                  }}
                >
                  {row.status}
                </span>
                <div>
                  <div className="text-xs font-semibold text-stone-500">{row.label}</div>
                  <p className="text-sm text-stone-700 mt-0.5">{row.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* The Find */}
      <motion.div
        custom={idx++}
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="rounded-xl bg-emerald-50 border-[1.5px] border-emerald-300 p-5"
      >
        <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-emerald-700">
          The Find
        </h3>
        <p className="text-sm leading-relaxed text-stone-800">{review.find}</p>
      </motion.div>
    </div>
  )
}
