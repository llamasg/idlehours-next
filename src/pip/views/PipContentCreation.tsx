/* ──────────────────────────────────────────────
   Pip Dashboard — Content Creation View
   Social content plan powered by Claude.
   Ideas persist until user requests a refresh.
   Tabs: Video & Reels | Pinterest
   ────────────────────────────────────────────── */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePipData } from '@/pip/hooks/usePipData';
import {
  useSocialContent,
  type ReelIdea,
  type PinterestIdea,
  type BlogContext,
} from '@/pip/hooks/useSocialContent';

/* ── Constants ────────────────────────────────── */

const TABS = ['📹 Video & Reels', '📌 Pinterest'] as const;
type Tab = (typeof TABS)[number];

const NICHE = 'Idle Hours — cosy & indie games blog';

/* ── Helpers ──────────────────────────────────── */

function effortDots(effort: 1 | 2 | 3): string {
  if (effort === 1) return '●○○ Easy';
  if (effort === 2) return '●●○ Medium';
  return '●●● Worth it';
}

function platformPill(platform: ReelIdea['platform']): { label: string; cls: string } {
  if (platform === 'tiktok')    return { label: 'TikTok first',          cls: 'bg-pink-100 text-pink-700' };
  if (platform === 'instagram') return { label: 'Instagram first',       cls: 'bg-purple-100 text-purple-700' };
  return                               { label: 'TikTok + Instagram',    cls: 'bg-indigo-100 text-indigo-700' };
}

function relativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return 'Generated today';
  if (days === 1) return 'Generated yesterday';
  return `Generated ${days} days ago`;
}

/* ── Empty state ──────────────────────────────── */

function EmptyState({
  onGenerate,
  isGenerating,
}: {
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-5xl">🌱</span>
      <h2 className="mt-4 text-xl font-semibold text-stone-900">No social plan yet</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Pip will analyse your top posts and search data to generate evidence-based ideas
        for Reels and Pinterest — built to actually perform, not just look busy.
      </p>
      <GenerateButton onClick={onGenerate} loading={isGenerating} className="mt-6" />
    </div>
  );
}

/* ── Generate button ──────────────────────────── */

function GenerateButton({
  onClick,
  loading,
  label = 'Find new ideas',
  className = '',
}: {
  onClick: () => void;
  loading: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-full bg-burnt-orange px-5 py-2.5 text-sm font-semibold text-white shadow transition-transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <span className="animate-spin">⏳</span> Pip is thinking…
        </>
      ) : (
        <>✨ {label}</>
      )}
    </button>
  );
}

/* ── Thinking animation ───────────────────────── */

function ThinkingState() {
  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="inline-block h-2.5 w-2.5 rounded-full bg-burnt-orange"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Pip is researching winning strategies…</p>
    </div>
  );
}

/* ── Reel Card ────────────────────────────────── */

function ReelCard({ idea }: { idea: ReelIdea }) {
  const [copied, setCopied] = useState(false);
  const pill = platformPill(idea.platform);

  async function handleCopy() {
    const text = `${idea.hook}\n\n${idea.shotList.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-white p-5"
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-3xl">{idea.emoji}</span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${pill.cls}`}>
          {pill.label}
        </span>
        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600">
          {idea.mood}
        </span>
      </div>

      <h3 className="mt-3 text-base font-semibold text-stone-900 leading-snug">
        "{idea.hook}"
      </h3>
      <p className="mt-1 text-sm text-stone-700">{idea.concept}</p>

      {/* Why it'll work */}
      <div className="mt-3 rounded-lg bg-accent-green/10 border border-accent-green/20 px-3 py-2">
        <p className="text-xs font-medium text-accent-green mb-0.5">Why it'll work</p>
        <p className="text-xs text-stone-700 leading-relaxed">{idea.why}</p>
      </div>

      {idea.shotList.length > 0 && (
        <ul className="mt-3 space-y-1">
          {idea.shotList.map((shot, i) => (
            <li key={i} className="flex gap-2 text-sm text-stone-600">
              <span className="text-burnt-orange font-medium">{i + 1}.</span>
              {shot}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{effortDots(idea.effort)}</span>
        <button
          className="text-sm font-medium text-burnt-orange transition-opacity hover:opacity-70"
          onClick={handleCopy}
        >
          {copied ? '✓ Copied' : 'Copy shot list →'}
        </button>
      </div>
    </motion.div>
  );
}

/* ── Pinterest Card ───────────────────────────── */

function PinterestCard({ pin }: { pin: PinterestIdea }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(`${pin.pinTitle}\n\n${pin.description}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-white p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-stone-900">{pin.pinTitle}</h3>
          <span className="mt-1 inline-block rounded-full bg-accent-green/10 px-2 py-0.5 text-xs text-accent-green">
            {pin.board}
          </span>
        </div>
        <span className="text-2xl">📌</span>
      </div>

      <p className="mt-2 text-sm text-stone-700 leading-relaxed">{pin.description}</p>

      {/* Why it'll rank */}
      <div className="mt-3 rounded-lg bg-burnt-orange/5 border border-burnt-orange/15 px-3 py-2">
        <p className="text-xs font-medium text-burnt-orange mb-0.5">Why it'll rank</p>
        <p className="text-xs text-stone-700 leading-relaxed">{pin.why}</p>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        📸 <span className="italic">Image brief:</span> {pin.imageBrief}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {pin.searchTerms.map((term) => (
          <span key={term} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-stone-600">
            {term}
          </span>
        ))}
      </div>

      <button
        className="mt-4 text-sm font-medium text-burnt-orange transition-opacity hover:opacity-70"
        onClick={handleCopy}
      >
        {copied ? '✓ Copied' : 'Copy pin text →'}
      </button>
    </motion.div>
  );
}

/* ── Main Component ───────────────────────────── */

export default function PipContentCreation() {
  const { analytics } = usePipData();
  const { plan, isGenerating, error, generate } = useSocialContent();
  const [activeTab, setActiveTab] = useState<Tab>(TABS[0]);

  const blogContext: BlogContext = {
    niche: NICHE,
    topPosts: analytics.topPosts.slice(0, 5).map((p) => ({
      title: p.title,
      sessions: p.sessions,
    })),
    topQueries: analytics.search.topQueries.slice(0, 5).map((q) => ({
      query: q.query,
      impressions: q.impressions,
    })),
  };

  return (
    <div className="space-y-6">

      {/* ── Header row ──────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex rounded-full bg-muted p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white shadow-sm text-stone-900'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {plan && !isGenerating && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {relativeDate(plan.generatedAt)}
            </span>
            <GenerateButton
              onClick={() => generate(blogContext)}
              loading={isGenerating}
            />
          </div>
        )}
      </div>

      {/* ── Error ───────────────────────────────── */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Something went wrong: {error}. Try again?
        </div>
      )}

      {/* ── Content ─────────────────────────────── */}
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <ThinkingState key="thinking" />
        ) : !plan ? (
          <EmptyState
            key="empty"
            onGenerate={() => generate(blogContext)}
            isGenerating={isGenerating}
          />
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {activeTab === TABS[0] && (
              <>
                <p className="text-sm text-muted-foreground italic">
                  Short-form video built for discovery — each idea is rooted in what's actually working right now.
                </p>
                {plan.reels.map((idea) => (
                  <ReelCard key={idea.id} idea={idea} />
                ))}
              </>
            )}

            {activeTab === TABS[1] && (
              <>
                <p className="text-sm text-muted-foreground italic">
                  Pinterest is a search engine first. These pins are built to rank for terms your audience is already looking for.
                </p>
                {plan.pinterest.map((pin) => (
                  <PinterestCard key={pin.id} pin={pin} />
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
