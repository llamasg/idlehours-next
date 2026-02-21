'use client'
/* ──────────────────────────────────────────────
   Pip Dashboard v2 — PipSeoHelper (SEO Title Generator)
   ────────────────────────────────────────────── */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Anthropic from '@anthropic-ai/sdk';
import type { SeoSuggestion } from '@/pip/lib/pipMockData';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

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
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SeoSuggestion[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setShowResults(false);

    try {
      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [
          {
            role: 'user',
            content: `You are Pip, SEO helper for idlehours.co.uk — a UK cosy games blog.

Beth's post idea: "${query}"

Generate 5 SEO-optimised title options. Rules:
- Target keyword difficulty under 40 (new domain)
- UK spelling (cosy not cozy)
- Sound like Beth's voice — warm, specific, human
- Each title should target a slightly different keyword angle
- Flag one as your recommendation with isPipRecommended: true

Return ONLY a valid JSON array (no markdown fences, no other text):
[{
  "id": "seo-1",
  "title": "...",
  "difficulty": "Low",
  "volume": 890,
  "isPipRecommended": false
}]`,
          },
        ],
      });

      const text = message.content[0].type === 'text' ? message.content[0].text : '[]';
      const results = JSON.parse(
        text.replace(/```json|```/g, '').trim(),
      ) as SeoSuggestion[];

      setSuggestions(results);
      setShowResults(true);
    } catch (e) {
      console.error('[Pip] SEO generation failed:', e);
      setError('Could not generate titles — please try again.');
    } finally {
      setIsLoading(false);
    }
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
          disabled={isLoading || !query.trim()}
          className="rounded-lg bg-burnt-orange px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? '⏳ Generating...' : 'Generate titles →'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

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
            {suggestions.map((s, i) => (
              <motion.div
                key={s.id ?? i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3, ease: 'easeOut' }}
                className={`rounded-xl border-l-4 bg-white p-4 shadow-sm ${difficultyBorder[s.difficulty]}`}
              >
                <div className="flex items-start gap-2">
                  <p className="text-lg font-medium text-stone-900 flex-1">{s.title}</p>
                  {(s as SeoSuggestion & { isPipRecommended?: boolean }).isPipRecommended && (
                    <span className="shrink-0 rounded-full bg-burnt-orange/10 px-2 py-0.5 text-xs font-semibold text-burnt-orange">
                      Pip's pick
                    </span>
                  )}
                </div>

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
