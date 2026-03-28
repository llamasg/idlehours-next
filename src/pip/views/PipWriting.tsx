'use client'
/* ──────────────────────────────────────────────
   Pip Dashboard v2 — Writing Review
   Beth pastes a draft, Pip gives structured
   editorial feedback.
   ────────────────────────────────────────────── */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { PipSpeech } from '@/pip/components/PipSpeech'
import { WritingReview } from '@/pip/components/WritingReview'
import { reviewDraft } from '@/pip/lib/pipClaude'
import type { WritingReview as ReviewData } from '@/pip/lib/pipClaude'

export default function PipWriting() {
  const [headline, setHeadline] = useState('')
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [review, setReview] = useState<ReviewData | null>(null)

  const handleReview = async () => {
    if (!draft.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result = await reviewDraft(draft.trim(), headline.trim() || undefined)
      setReview(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setReview(null)
    setError(null)
    setHeadline('')
    setDraft('')
  }

  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-stone-900 mb-4">Writing Review</h1>

      {!review ? (
        <>
          <PipSpeech
            message="Paste a draft and I'll take a look. I'll tell you what's working, what to watch, and give you one thing to go looking for."
            className="mb-6"
          />

          {/* Headline (optional) */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
              Headline (optional — helps with SEO scoring)
            </label>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Your article headline…"
              disabled={loading}
              className="w-full rounded-xl bg-white border border-stone-200 px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-400 shadow-sm transition-colors disabled:opacity-50"
            />
          </div>

          {/* Draft textarea */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
              Draft
            </label>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Paste your draft here…"
              rows={14}
              disabled={loading}
              className="w-full resize-y rounded-xl bg-white border border-stone-200 px-4 py-3 text-sm leading-relaxed text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-400 shadow-sm transition-colors disabled:opacity-50"
            />
            <div className="mt-1 text-right text-xs text-stone-400">
              {wordCount > 0 && `${wordCount} words`}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleReview}
            disabled={!draft.trim() || loading}
            className="rounded-full bg-[#7C9B7A] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-[1px] active:translate-y-[1px] disabled:opacity-40 disabled:hover:translate-y-0 flex items-center gap-2"
            style={{ boxShadow: '0 3px 0 #5a7a58' }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Reviewing…' : 'Review'}
          </button>
        </>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={handleReset}
              className="mb-6 rounded-full bg-white border border-stone-200 px-4 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:border-stone-300 shadow-sm transition-colors"
            >
              ← Review another
            </button>

            <WritingReview review={review} />
          </motion.div>
        </>
      )}
    </div>
  )
}
