/* ──────────────────────────────────────────────
   Pip Dashboard v2 — PipSeoHelper (SEO Title Generator)
   ────────────────────────────────────────────── */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { usePipData } from '@/pip/hooks/usePipData';
import type { SeoSuggestion } from '@/pip/lib/pipMockData';

/* ── Difficulty colour helpers ───────────────── */

const difficultyPill: Record<SeoSuggestion['difficulty'], string> = {
  Low: 'bg-green-100 text-green-700',
  Medium: 'bg-amber-100 text-amber-700',
  High: 'bg-red-100 text-red-700',
};

const difficultyBorder: Record<SeoSuggestion['difficulty'], string> = {
  Low: 'border-green-500',
  Medium: 'border-amber-500',
  High: 'border-red-500',
};

/* ── Main component ──────────────────────────── */

export default function PipSeoHelper() {
  const { seoSuggestions } = usePipData();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowResults(true);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8 px-4">
      <h1 className="text-2xl font-bold text-stone-900">SEO Helper</h1>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <label
          htmlFor="seo-topic"
          className="block text-sm font-medium text-stone-700"
        >
          What's your post about?
        </label>
        <input
          id="seo-topic"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. cosy games for rainy days"
          className="w-full rounded-xl border-2 border-stone-300 bg-white px-4 py-3 text-lg text-stone-900 placeholder:text-stone-400 focus:border-burnt-orange focus:outline-none transition-colors"
        />
        <button
          type="submit"
          className="rounded-lg bg-burnt-orange px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-90 transition-opacity"
        >
          Generate titles &rarr;
        </button>
      </form>

      {/* Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-3"
          >
            {seoSuggestions.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3, ease: 'easeOut' }}
                className={`rounded-xl border-l-4 bg-white p-4 shadow-sm ${difficultyBorder[s.difficulty]}`}
              >
                <p className="text-lg font-medium text-stone-900">{s.title}</p>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {/* Difficulty pill */}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyPill[s.difficulty]}`}
                  >
                    {s.difficulty}
                  </span>

                  {/* Volume */}
                  <span className="text-sm text-muted-foreground">
                    ~{s.volume.toLocaleString()} searches/mo
                  </span>
                </div>

                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-burnt-orange hover:underline"
                >
                  Use this title &rarr;
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
