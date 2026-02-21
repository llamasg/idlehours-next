'use client'
/* ──────────────────────────────────────────────
   Pip Dashboard v2 — PipGoals (The Big Picture)
   ────────────────────────────────────────────── */

import { usePipData } from '@/pip/hooks/usePipData';
import { useBoostPlan } from '../hooks/useBoostPlan';
import { BoostPlanView } from '../components/BoostPlan';
import type { BoostContext } from '../lib/pipMockData';

export default function PipGoals() {
  const { analytics, streak, posts, clusters } = usePipData();
  const sessions = analytics.overview.sessions7d;
  const totalPosts = posts.length;
  const isEarlyDays = totalPosts < 10 || sessions < 100;
  const { plan, isGenerating, generate, clear } = useBoostPlan();

  const boostContext: BoostContext = {
    sessions: analytics.overview.sessions7d,
    sessionsDelta: analytics.overview.sessionsDelta,
    totalPosts,
    activeCluster: clusters[0]?.name ?? 'Getting Started',
    clusterProgress: clusters[0]?.steps.filter((s) => s.status === 'published').length ?? 0,
    clusterTotal: clusters[0]?.steps.length ?? 5,
    streak,
    topPost: analytics.topPosts[0]
      ? { title: analytics.topPosts[0].title, sessions: analytics.topPosts[0].sessions }
      : { title: 'your first post', sessions: 0 },
    quickWin: analytics.search.quickWins[0]
      ? { query: analytics.search.quickWins[0].query, position: analytics.search.quickWins[0].position }
      : { query: 'cosy games', position: 20 },
  };

  return (
    <div>
      {/* Topbar */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2C2C2C]">The Big Picture</h1>
        <p className="text-sm text-[#9B8E82] mt-1">For the days when you wonder if it's working</p>
      </div>

      {/* Pip speech bubble */}
      <div className="flex gap-3 mb-8 bg-white rounded-2xl p-5 shadow-sm border border-[#E8E0D5]">
        <div className="text-2xl flex-shrink-0">🌱</div>
        <p className="text-sm text-[#4A4A4A] leading-relaxed">
          {isEarlyDays ? (
            <>
              This page is for the hard days. The ones where you publish something and it gets 12 views
              and you think "why am I even doing this."{' '}
              <strong>Open this page on those days.</strong> The numbers are real. The trajectory is real.
              It's working — it's just slow at first, and then it isn't.
            </>
          ) : (
            <>
              You're past the hardest part. The foundation is built. Now it's about consistency and
              compound interest — every post you publish makes the ones before it more valuable.
            </>
          )}
        </p>
      </div>

      {/* Goal card */}
      <div className="bg-[#1C1C1E] rounded-2xl p-6 mb-6 text-white">
        <div className="text-xs font-bold text-[#7C9B7A] uppercase tracking-wider mb-2">
          🎯 The mission
        </div>
        <h2 className="text-xl font-bold mb-1">£500/month from a blog about games you love</h2>
        <p className="text-sm text-white/50 mb-6">Realistic target: 10,000 sessions/month + affiliate income.</p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <div className="text-2xl font-bold font-mono">{sessions}</div>
            <div className="text-xs text-white/40 mt-0.5">sessions this week</div>
            <div className="text-xs text-[#7C9B7A] mt-0.5">
              {analytics.overview.sessionsDelta > 0
                ? `↑ ${analytics.overview.sessionsDelta}% growth`
                : 'building'}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono">{totalPosts}</div>
            <div className="text-xs text-white/40 mt-0.5">posts published</div>
            <div className="text-xs text-white/30 mt-0.5">building compound</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono">£0</div>
            <div className="text-xs text-white/40 mt-0.5">estimated monthly</div>
            <div className="text-xs text-white/30 mt-0.5">affiliate goes live at 1k sessions</div>
          </div>
        </div>

        {/* Progress bar with milestones */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>Progress to £500/month</span>
            <span>{sessions < 1000 ? 'phase 1: building traffic' : 'phase 2: monetising'}</span>
          </div>
          <div className="relative h-3 bg-white/10 rounded-full overflow-visible">
            <div
              className="h-full bg-[#7C9B7A] rounded-full transition-all duration-700"
              style={{ width: `${Math.min((sessions / 10000) * 100, 100)}%` }}
            />
            {[
              { label: '1k', pct: 10 },
              { label: '5k', pct: 50 },
              { label: '10k', pct: 100 },
            ].map((m) => (
              <div
                key={m.label}
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2
                  border-white bg-[#1C1C1E] -translate-x-1/2"
                style={{ left: `${m.pct}%` }}
                title={`${m.label} sessions/week`}
              />
            ))}
          </div>
        </div>

        {/* Milestone pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: '100 sessions/wk', reached: sessions >= 100 },
            { label: '500 sessions/wk', reached: sessions >= 500 },
            { label: '1k sessions/wk', reached: sessions >= 1000 },
            { label: 'First affiliate click', reached: false },
            { label: 'First £1 earned', reached: false },
            { label: '£500/month 🎯', reached: false },
          ].map((m) => (
            <span
              key={m.label}
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                m.reached ? 'bg-[#7C9B7A] text-white' : 'bg-white/10 text-white/40'
              }`}
            >
              {m.reached ? '✓ ' : '→ '}
              {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* Two column: growth projection + what's working */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E8E0D5]">
          <h3 className="font-bold text-sm text-[#2C2C2C] mb-4">📈 Growth projection</h3>
          {[
            { label: 'Today', width: Math.min((sessions / 10000) * 100, 8), val: `${sessions}/wk`, color: '#2C2C2C' },
            { label: 'Month 3', width: 22, val: '~2.5k', color: '#7C9B7A' },
            { label: 'Month 6', width: 55, val: '~6k', color: '#E8843A' },
            { label: 'Month 9', width: 85, val: '~10k+ 🎯', color: '#7B6CF6' },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-3 mb-3">
              <div className="text-xs text-[#9B8E82] w-16 flex-shrink-0">{row.label}</div>
              <div className="flex-1 h-2 bg-[#F0EBE3] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${row.width}%`, background: row.color }}
                />
              </div>
              <div className="text-xs font-bold font-mono text-[#2C2C2C] w-14">{row.val}</div>
            </div>
          ))}
          <p className="text-xs text-[#9B8E82] mt-2 leading-relaxed">
            Based on consistent posting. Clusters compound — each completed cluster accelerates the next.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E8E0D5]">
          <h3 className="font-bold text-sm text-[#2C2C2C] mb-4">💚 What's actually working</h3>
          <div className="flex flex-col gap-2">
            {streak >= 3 && (
              <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                <div className="text-xs font-bold text-green-700 mb-1">🔥 {streak}-day streak</div>
                <div className="text-xs text-green-600">
                  Consistency is the only thing that matters right now. You're doing it.
                </div>
              </div>
            )}
            {sessions > 0 && (
              <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                <div className="text-xs font-bold text-green-700 mb-1">👀 Real traffic</div>
                <div className="text-xs text-green-600">
                  {sessions} sessions this week. Real people found your writing.
                </div>
              </div>
            )}
            {totalPosts > 0 && (
              <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                <div className="text-xs font-bold text-green-700 mb-1">
                  📝 {totalPosts} post{totalPosts !== 1 ? 's' : ''} published
                </div>
                <div className="text-xs text-green-600">
                  Each post is a permanent asset. They compound over time.
                </div>
              </div>
            )}
            {totalPosts === 0 && sessions === 0 && (
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                <div className="text-xs font-bold text-amber-700 mb-1">🌱 Day one</div>
                <div className="text-xs text-amber-600">
                  Every blog you've ever read started exactly here. Write the first post.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Boost Plan */}
      <div className="mt-6 bg-[#1C1C1E] rounded-2xl p-6 text-white">
        <div className="mb-2">
          <div className="text-lg font-bold">🚀 Things feeling slow?</div>
          <p className="text-sm text-white/50 mt-1">
            Let Pip analyse your data and build a personalised sprint plan.
          </p>
        </div>

        {!plan && (
          <button
            onClick={() => generate(boostContext)}
            disabled={isGenerating}
            className="mt-4 px-5 py-2.5 bg-[#E8843A] text-white rounded-xl
              font-semibold text-sm hover:bg-[#D4762F] transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Pip is thinking...
              </>
            ) : (
              'Generate my boost plan →'
            )}
          </button>
        )}

        {plan && (
          <div className="mt-4">
            <BoostPlanView plan={plan} onSave={() => {}} />
            <button
              onClick={clear}
              className="mt-3 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Generate a new plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
