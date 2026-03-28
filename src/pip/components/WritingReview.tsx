'use client'

import { motion } from 'framer-motion'
import type { WritingReview as ReviewData } from '@/pip/lib/pipClaude'

interface WritingReviewProps {
  review: ReviewData
}

function scoreColor(score: number): string {
  if (score >= 7) return '#7C9B7A'
  if (score >= 4) return '#C8873A'
  return '#C0392B'
}

function seoStatusColor(status: string): string {
  if (status === 'Good') return '#7C9B7A'
  if (status === 'OK') return '#C8873A'
  return '#C0392B'
}

const TAG_COLORS: Record<string, string> = {
  Voice: '#8B5CF6',
  Structure: '#3B82F6',
  Tone: '#C8873A',
  Tense: '#EF4444',
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
              className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
            >
              <div className="text-3xl font-bold" style={{ color }}>
                {score}
              </div>
              <div className="text-xs text-white/50 uppercase tracking-wider mt-1 capitalize">
                {key}
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
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
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
            What&apos;s working
          </h3>
          {review.working.map((strength, i) => (
            <motion.div
              key={i}
              custom={idx++}
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="rounded-xl p-4"
              style={{
                backgroundColor: 'rgba(124, 155, 122, 0.1)',
                border: '1px solid rgba(124, 155, 122, 0.25)',
              }}
            >
              <p className="text-sm leading-relaxed text-white/80">{strength}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Flags */}
      {review.flags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
            Flags
          </h3>
          {review.flags.map((flag, i) => (
            <motion.div
              key={i}
              custom={idx++}
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="rounded-xl p-4"
              style={{
                backgroundColor: 'rgba(200, 135, 58, 0.1)',
                border: '1px solid rgba(200, 135, 58, 0.25)',
              }}
            >
              <p className="text-sm italic text-white/50 mb-2">&ldquo;{flag.quote}&rdquo;</p>
              <p className="text-sm leading-relaxed text-white/80">{flag.note}</p>
              <span
                className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${TAG_COLORS[flag.tag] ?? '#666'}22`,
                  color: TAG_COLORS[flag.tag] ?? '#999',
                }}
              >
                {flag.tag}
              </span>
            </motion.div>
          ))}
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
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
          SEO
        </h3>
        <div className="bg-white/5 border border-white/10 rounded-xl divide-y divide-white/5">
          {([
            { label: 'Headline', text: review.seo.headline, status: review.seo.headlineScore },
            { label: 'Keywords', text: review.seo.keywords, status: review.seo.keywordsScore },
            { label: 'Depth', text: review.seo.depth, status: review.seo.depthScore },
          ] as const).map((row) => (
            <div key={row.label} className="flex items-start gap-3 px-4 py-3">
              <span
                className="shrink-0 mt-0.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${seoStatusColor(row.status)}22`,
                  color: seoStatusColor(row.status),
                }}
              >
                {row.status}
              </span>
              <div>
                <div className="text-xs font-semibold text-white/60">{row.label}</div>
                <p className="text-sm text-white/80 mt-0.5">{row.text}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* The Find */}
      <motion.div
        custom={idx++}
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="rounded-xl p-5"
        style={{
          backgroundColor: 'rgba(124, 155, 122, 0.08)',
          border: '1.5px solid rgba(124, 155, 122, 0.3)',
        }}
      >
        <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7C9B7A' }}>
          The Find
        </h3>
        <p className="text-sm leading-relaxed text-white/90">{review.find}</p>
      </motion.div>
    </div>
  )
}
