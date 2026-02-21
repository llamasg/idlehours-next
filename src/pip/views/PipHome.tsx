/* ──────────────────────────────────────────────
   Pip Dashboard v2 — PipHome (Landing View)
   ────────────────────────────────────────────── */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Clock, Flame, RefreshCw, Zap } from 'lucide-react';

import { usePipData } from '@/pip/hooks/usePipData';
import { useMorningMessage } from '@/pip/hooks/useMorningMessage';
import { StatCard } from '@/pip/components/StatCard';

/* ── helpers ─────────────────────────────────── */

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
}

function formatReadTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function difficultyDots(level: 1 | 2 | 3) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`Difficulty ${level} of 3`}>
      {[1, 2, 3].map((d) => (
        <span
          key={d}
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            d <= level ? 'bg-stone-600' : 'bg-stone-300'
          }`}
        />
      ))}
    </span>
  );
}

/* ── stagger wrapper ─────────────────────────── */

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' as const },
  }),
};

function Section({
  index,
  children,
  className = '',
}: {
  index: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      custom={index}
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ── main component ──────────────────────────── */

function formatTimeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 min ago';
  return `${mins} mins ago`;
}

export default function PipHome() {
  const { ideas, analytics, clusters, streak, xp, posts, isLoading, isRefreshing, lastRefreshedAt, refetch } = usePipData();
  const timeOfDay = getTimeOfDay();

  const { message: morningMessage, isLoading: messageLoading } = useMorningMessage({
    streak,
    sessions7d: analytics.overview.sessions7d,
    totalPosts: posts.length,
    isDataLoading: isLoading,
  });

  /* Active cluster = first cluster with at least one non-published step */
  const activeCluster = clusters.find((c) =>
    c.steps.some((s) => s.status !== 'published'),
  );

  const publishedCount = activeCluster
    ? activeCluster.steps.filter((s) => s.status === 'published').length
    : 0;
  const totalSteps = activeCluster ? activeCluster.steps.length : 0;
  const progressPct = totalSteps > 0 ? (publishedCount / totalSteps) * 100 : 0;

  /* Top 3 ideas */
  const topIdeas = ideas.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* A — Topbar */}
      <Section index={0}>
        <div className="pb-6 border-b border-[#E8E0D5] mb-6">
          <h1 className="text-2xl font-bold text-[#2C2C2C]">
            Good {timeOfDay}, Beth 🌿
          </h1>
        </div>

        {/* Pip speech bubble */}
        {(morningMessage || messageLoading) && (
          <div className="flex gap-3 bg-white rounded-2xl p-4 shadow-sm border border-[#E8E0D5]">
            <img
              src="/pip-avatar.png"
              className="w-8 h-8 rounded-full flex-shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
              alt="Pip"
            />
            <div className="flex-1">
              <div className="text-xs font-bold text-[#7C9B7A] mb-1">Pip's morning message</div>
              {messageLoading ? (
                <div className="flex items-center gap-1.5 py-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="inline-block h-1.5 w-1.5 rounded-full bg-[#7C9B7A] animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#4A4A4A] leading-relaxed">{morningMessage}</p>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* B — Stat cards */}
      <Section index={1}>
        <div className="flex items-center justify-end gap-2 mb-3">
          {lastRefreshedAt && (
            <span className="text-xs text-stone-400">
              Updated {formatTimeAgo(lastRefreshedAt)}
            </span>
          )}
          <button
            onClick={refetch}
            disabled={isRefreshing}
            title="Refresh data"
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Sessions this week"
            value={analytics.overview.sessions7d.toLocaleString()}
            delta={analytics.overview.sessionsDelta}
            icon={BarChart3}
          />
          <StatCard
            label="Avg read time"
            value={formatReadTime(analytics.overview.avgReadTime)}
            icon={Clock}
          />
          <StatCard
            label="Current streak"
            value={`${streak} days`}
            icon={Flame}
          />
          <StatCard
            label="XP"
            value={xp.toLocaleString()}
            icon={Zap}
          />
        </div>
      </Section>

      {/* C — Active cluster preview */}
      {activeCluster && (
        <Section index={2}>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-stone-900">{activeCluster.name}</h3>
            <p className="mt-1 text-sm text-stone-500">
              {publishedCount}/{totalSteps} published
            </p>

            <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-green transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <Link
              to="/pip/clusters"
              className="mt-4 inline-block text-sm font-medium text-burnt-orange hover:underline"
            >
              Continue working &rarr;
            </Link>
          </div>
        </Section>
      )}

      {/* D — Top ideas preview */}
      <Section index={3}>
        <h3 className="mb-3 text-lg font-bold text-stone-900">Top Ideas</h3>

        <div className="space-y-2">
          {topIdeas.map((idea) => (
            <div
              key={idea.id}
              className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
            >
              <span className="text-lg select-none">{idea.typeEmoji}</span>
              <span className="flex-1 truncate text-sm font-medium text-stone-800">
                {idea.title}
              </span>
              {difficultyDots(idea.difficulty)}
              {idea.trending && (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-burnt-orange">
                  Trending
                </span>
              )}
            </div>
          ))}
        </div>

        <Link
          to="/pip/ideas"
          className="mt-3 inline-block text-sm font-medium text-burnt-orange hover:underline"
        >
          See all ideas &rarr;
        </Link>
      </Section>

      {/* E — Quick actions */}
      <Section index={4}>
        <h3 className="mb-3 text-lg font-bold text-stone-900">Quick Actions</h3>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/pip/ideas"
            className="rounded-lg bg-burnt-orange px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            ✍️ Write something new
          </Link>
          <Link
            to="/pip/analytics"
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 transition-colors"
          >
            📊 Check analytics
          </Link>
          <Link
            to="/pip/calendar"
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 transition-colors"
          >
            📅 Plan content
          </Link>
        </div>
      </Section>
    </div>
  );
}
