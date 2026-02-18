/* ──────────────────────────────────────────────
   Pip Dashboard — Content Creation View
   Three tabs: Video & Reels, Pinterest, Instagram
   ────────────────────────────────────────────── */

import { useState } from 'react';
import { usePipData } from '@/pip/hooks/usePipData';
import type { ContentIdea } from '@/pip/lib/pipMockData';

/* ── Constants ────────────────────────────────── */

const TABS = ['\u{1F4F8} Video & Reels', '\u{1F4CC} Pinterest', '\u{1F4F7} Instagram'] as const;
type Tab = (typeof TABS)[number];

const PINTEREST_SEARCH_TERMS = [
  'cosy games',
  'relaxing switch games',
  'games for anxiety',
  'cottagecore games',
  'gaming aesthetic',
];

const PINTEREST_KEYWORDS = [
  'cosy games for anxiety',
  'relaxing indie games',
  'no fail state games',
  'spiritfarer review',
  'games like stardew valley',
  'short cosy games',
];

/* ── Helpers ──────────────────────────────────── */

function moodPillClasses(mood: string): string {
  const lower = mood.toLowerCase();
  if (lower.includes('atmospheric') || lower.includes('asmr') || lower.includes('gentle'))
    return 'bg-indigo-100 text-indigo-700';
  if (lower.includes('funny') || lower.includes('upbeat') || lower.includes('quick'))
    return 'bg-yellow-100 text-yellow-700';
  return 'bg-orange-100 text-orange-700';
}

function effortLabel(effort: 1 | 2 | 3): { dots: string; label: string } {
  if (effort === 1) return { dots: '●○○', label: 'Easy' };
  if (effort === 2) return { dots: '●●○', label: 'Medium' };
  return { dots: '●●●', label: 'Worth it' };
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

/* ── Video Card ───────────────────────────────── */

function VideoCard({
  idea,
  compact,
}: {
  idea: ContentIdea;
  compact?: boolean;
}) {
  const { dots, label } = effortLabel(idea.effort);

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      {compact && (
        <span className="mb-2 inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          15–30s
        </span>
      )}

      {/* Top row: emoji + mood pill */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{idea.emoji}</span>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${moodPillClasses(idea.mood)}`}
        >
          {idea.mood}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-2 text-lg font-semibold">{idea.title}</h3>

      {/* Why */}
      <p className="mt-1 text-sm italic text-muted-foreground">
        Why it&rsquo;ll do well: {idea.why}
      </p>

      {/* Shot list */}
      {idea.shotList && idea.shotList.length > 0 && (
        <ul className="mt-2 list-disc pl-4 text-sm">
          {idea.shotList.map((shot, i) => (
            <li key={i}>{shot}</li>
          ))}
        </ul>
      )}

      {/* Bottom row */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {dots} {label}
        </span>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-burnt-orange">
            Caption ready &rarr;
          </button>
          <button className="text-sm font-medium text-accent-green">
            Mark as done &check;
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Pinterest Tab ────────────────────────────── */

function PinterestTab() {
  const { pinterestPins } = usePipData();

  return (
    <div className="space-y-8">
      {/* Pin these posts */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Pin these posts</h2>
        {pinterestPins.map((pin) => (
          <div key={pin.id} className="rounded-xl border border-border bg-white p-5">
            <p className="text-sm text-muted-foreground">{pin.postTitle}</p>
            <h3 className="text-lg font-semibold">{pin.pinTitle}</h3>
            <p className="mt-1 text-sm">{pin.description}</p>
            <span className="mt-2 inline-block rounded-full bg-accent-green/10 px-2 py-1 text-xs text-accent-green">
              {pin.board}
            </span>
            <p className="mt-2 text-sm italic text-muted-foreground">
              {"\u{1F4F8}"} Image brief: {pin.imageBrief}
            </p>
            <button
              className="mt-3 text-sm font-medium text-burnt-orange"
              onClick={() => copyToClipboard(`${pin.pinTitle}\n\n${pin.description}`)}
            >
              Copy pin text &rarr;
            </button>
          </div>
        ))}
      </section>

      {/* Pinterest SEO */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Pinterest SEO</h2>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Top Pinterest search terms
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {PINTEREST_SEARCH_TERMS.map((term) => (
              <span key={term} className="rounded-full bg-muted px-3 py-1 text-sm">
                {term}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Your pins are searchable for:
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {PINTEREST_KEYWORDS.map((kw) => (
              <span key={kw} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {kw}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Instagram Tab ────────────────────────────── */

function CaptionCard({
  caption,
}: {
  caption: { id: string; postTitle: string; hookLine: string; fullCaption: string; suggestedTime: string };
}) {
  const [expanded, setExpanded] = useState(false);

  const previewLines = caption.fullCaption.split('\n').slice(0, 2).join('\n');

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <p className="text-sm text-muted-foreground">{caption.postTitle}</p>
      <p className="mt-1 text-base font-medium">{caption.hookLine}</p>

      <div className="mt-2 text-sm whitespace-pre-line">
        {expanded ? caption.fullCaption : previewLines}
      </div>
      <button
        className="mt-1 text-xs font-medium text-burnt-orange"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Hide full caption' : 'Show full caption'}
      </button>

      <p className="mt-2 text-xs text-muted-foreground">
        Best to post: {caption.suggestedTime}
      </p>

      <button
        className="mt-3 text-sm font-medium text-burnt-orange"
        onClick={() => copyToClipboard(caption.fullCaption)}
      >
        Copy caption &rarr;
      </button>
    </div>
  );
}

function InstagramTab() {
  const { instagramCaptions, videoIdeas } = usePipData();

  /* Reuse first 3 video ideas as reel ideas */
  const reelIdeas = videoIdeas.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Caption bank */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Caption bank</h2>
        {instagramCaptions.map((cap) => (
          <CaptionCard key={cap.id} caption={cap} />
        ))}
      </section>

      {/* Reel ideas */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Reel ideas</h2>
        <p className="text-sm italic text-muted-foreground">
          Reels get 3x the reach of static posts right now.
        </p>
        {reelIdeas.map((idea) => (
          <VideoCard key={idea.id} idea={idea} compact />
        ))}
      </section>
    </div>
  );
}

/* ── Main Component ───────────────────────────── */

export default function PipContentCreation() {
  const { videoIdeas } = usePipData();
  const [activeTab, setActiveTab] = useState<Tab>(TABS[0]);

  return (
    <div className="space-y-6">
      {/* ── Tab Bar ───────────────────────────── */}
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

      {/* ── Tab Content ──────────────────────── */}
      {activeTab === '\u{1F4F8} Video & Reels' && (
        <div className="space-y-4">
          {videoIdeas.map((idea) => (
            <VideoCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}

      {activeTab === '\u{1F4CC} Pinterest' && <PinterestTab />}

      {activeTab === '\u{1F4F7} Instagram' && <InstagramTab />}
    </div>
  );
}
