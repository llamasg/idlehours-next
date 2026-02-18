/* ──────────────────────────────────────────────
   Pip Dashboard — Analytics View
   Tabbed analytics dashboard: Overview, Content, Audience, Search
   ────────────────────────────────────────────── */

import { useState } from 'react';
import {
  BarChart3,
  Clock,
  Users,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { usePipData } from '@/pip/hooks/usePipData';
import { StatCard } from '@/pip/components/StatCard';
import { PersonaCard } from '@/pip/components/PersonaCard';
import { SessionsLineChart, TrafficDonut } from '@/pip/components/AnalyticsChart';

/* ── Helpers ─────────────────────────────────── */

const TABS = ['Overview', 'Content', 'Audience', 'Search'] as const;
type Tab = (typeof TABS)[number];

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-emerald-600" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-stone-400" />;
}

/* ── Main Component ──────────────────────────── */

export default function PipAnalytics() {
  const { analytics } = usePipData();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  const { overview, topPosts, audience, search } = analytics;

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
      {activeTab === 'Overview' && (
        <OverviewTab overview={overview} topPosts={topPosts} />
      )}
      {activeTab === 'Content' && <ContentTab topPosts={topPosts} />}
      {activeTab === 'Audience' && <AudienceTab audience={audience} overview={overview} />}
      {activeTab === 'Search' && <SearchTab search={search} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Overview Tab
   ═══════════════════════════════════════════════ */

function OverviewTab({
  overview,
  topPosts,
}: {
  overview: ReturnType<typeof usePipData>['analytics']['overview'];
  topPosts: ReturnType<typeof usePipData>['analytics']['topPosts'];
}) {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Sessions (7d)"
          value={overview.sessions7d.toLocaleString()}
          delta={overview.sessionsDelta}
          icon={BarChart3}
        />
        <StatCard
          label="Avg Read Time"
          value={fmtTime(overview.avgReadTime)}
          icon={Clock}
        />
        <StatCard
          label="Return Visitors"
          value={`${overview.returnVisitorPct}%`}
          icon={Users}
        />
        <StatCard
          label="New Visitors"
          value={`${overview.newVisitorPct}%`}
          icon={UserPlus}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-stone-700">8-Week Trend</h3>
          <SessionsLineChart data={overview.weeklyTrend} />
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-stone-700">Traffic Sources</h3>
          <TrafficDonut data={overview.trafficSources} />
        </div>
      </div>

      {/* Top posts table */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-stone-700">Top 5 Posts</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b text-left text-xs uppercase tracking-wide text-stone-400">
                <th className="pb-2 pr-4">Title</th>
                <th className="pb-2 pr-4">Sessions</th>
                <th className="pb-2 pr-4">Avg Time</th>
                <th className="pb-2 pr-4">Bounce Rate</th>
                <th className="pb-2">Trend</th>
              </tr>
            </thead>
            <tbody>
              {topPosts.slice(0, 5).map((post, i) => (
                <tr
                  key={post.title}
                  className={i % 2 === 1 ? 'bg-stone-50' : ''}
                >
                  <td className="py-2 pr-4 font-medium text-stone-800">{post.title}</td>
                  <td className="py-2 pr-4 text-stone-600">{post.sessions}</td>
                  <td className="py-2 pr-4 text-stone-600">{fmtTime(post.readTime)}</td>
                  <td className="py-2 pr-4 text-stone-600">{post.bounceRate}%</td>
                  <td className="py-2">
                    <TrendIcon trend={post.trend} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Content Tab
   ═══════════════════════════════════════════════ */

function ContentTab({
  topPosts,
}: {
  topPosts: ReturnType<typeof usePipData>['analytics']['topPosts'];
}) {
  const closestToPage1 = topPosts.filter((p) => p.position >= 11 && p.position <= 20);

  return (
    <div className="space-y-6">
      {/* Full post performance table */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-stone-700">Post Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b text-left text-xs uppercase tracking-wide text-stone-400">
                <th className="pb-2 pr-4">Title</th>
                <th className="pb-2 pr-4">Sessions</th>
                <th className="pb-2 pr-4">Avg Time</th>
                <th className="pb-2 pr-4">Bounce Rate</th>
                <th className="pb-2 pr-4">Position</th>
                <th className="pb-2">Trend</th>
              </tr>
            </thead>
            <tbody>
              {topPosts.map((post, i) => (
                <tr
                  key={post.title}
                  className={i % 2 === 1 ? 'bg-stone-50' : ''}
                >
                  <td className="py-2 pr-4 font-medium text-stone-800">{post.title}</td>
                  <td className="py-2 pr-4 text-stone-600">{post.sessions}</td>
                  <td className="py-2 pr-4 text-stone-600">{fmtTime(post.readTime)}</td>
                  <td className="py-2 pr-4 text-stone-600">{post.bounceRate}%</td>
                  <td className="py-2 pr-4 text-stone-600">{post.position}</td>
                  <td className="py-2">
                    <TrendIcon trend={post.trend} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Closest to page 1 */}
      {closestToPage1.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-stone-700">Closest to Page 1</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {closestToPage1.map((post) => (
              <div
                key={post.title}
                className="rounded-xl border-l-4 border-l-[#52b788] bg-white p-4 shadow-sm"
              >
                <p className="font-medium text-stone-800">{post.title}</p>
                <p className="mt-1 text-sm text-stone-500">
                  Position: <span className="font-semibold">{post.position}</span>
                </p>
                <p className="mt-1 text-xs text-[#2d6a4f]">
                  Could rank with one more post
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Audience Tab
   ═══════════════════════════════════════════════ */

function AudienceTab({
  audience,
  overview,
}: {
  audience: ReturnType<typeof usePipData>['analytics']['audience'];
  overview: ReturnType<typeof usePipData>['analytics']['overview'];
}) {
  const { topCountries, deviceSplit, personas } = audience;

  return (
    <div className="space-y-6">
      {/* Top countries */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-stone-700">Top Countries</h3>
        <div className="space-y-3">
          {topCountries.slice(0, 5).map((c) => (
            <div key={c.country} className="flex items-center gap-4">
              <span className="w-32 text-sm text-stone-700">{c.country}</span>
              <div className="flex-1">
                <div className="h-3 rounded-full bg-stone-100">
                  <div
                    className="h-3 rounded-full bg-[#52b788]"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
              </div>
              <span className="w-20 text-right text-xs text-stone-500">
                {c.sessions} ({c.pct}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Personas */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-stone-700">Audience Personas</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {personas.map((p) => (
            <PersonaCard key={p.name} persona={p} />
          ))}
        </div>
      </div>

      {/* Device split */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-stone-700">Device Split</h3>
        <div className="space-y-3">
          {(
            [
              { label: 'Mobile', value: deviceSplit.mobile, color: '#c95d0d' },
              { label: 'Desktop', value: deviceSplit.desktop, color: '#52b788' },
              { label: 'Tablet', value: deviceSplit.tablet, color: '#6366f1' },
            ] as const
          ).map((d) => (
            <div key={d.label} className="flex items-center gap-4">
              <span className="w-20 text-sm text-stone-700">{d.label}</span>
              <div className="flex-1">
                <div className="h-4 rounded-full bg-stone-100">
                  <div
                    className="h-4 rounded-full"
                    style={{ width: `${d.value}%`, backgroundColor: d.color }}
                  />
                </div>
              </div>
              <span className="w-12 text-right text-xs text-stone-500">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* New vs Returning */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-stone-700">New vs Returning</h3>
        <div className="flex h-6 overflow-hidden rounded-full">
          <div
            className="bg-[#c95d0d] transition-all"
            style={{ width: `${overview.newVisitorPct}%` }}
          />
          <div
            className="bg-[#52b788] transition-all"
            style={{ width: `${overview.returnVisitorPct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-stone-500">
          <span>New {overview.newVisitorPct}%</span>
          <span>Returning {overview.returnVisitorPct}%</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Search Tab
   ═══════════════════════════════════════════════ */

function SearchTab({
  search,
}: {
  search: ReturnType<typeof usePipData>['analytics']['search'];
}) {
  const { topQueries, quickWins } = search;

  return (
    <div className="space-y-6">
      {/* Top queries table */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-stone-700">Top Queries</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b text-left text-xs uppercase tracking-wide text-stone-400">
                <th className="pb-2 pr-4">Query</th>
                <th className="pb-2 pr-4">Clicks</th>
                <th className="pb-2 pr-4">Impressions</th>
                <th className="pb-2 pr-4">CTR</th>
                <th className="pb-2">Avg Position</th>
              </tr>
            </thead>
            <tbody>
              {topQueries.map((q, i) => (
                <tr
                  key={q.query}
                  className={i % 2 === 1 ? 'bg-stone-50' : ''}
                >
                  <td className="py-2 pr-4 font-medium text-stone-800">{q.query}</td>
                  <td className="py-2 pr-4 text-stone-600">{q.clicks}</td>
                  <td className="py-2 pr-4 text-stone-600">{q.impressions.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-stone-600">{q.ctr}%</td>
                  <td className="py-2 text-stone-600">{q.position}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick wins */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-stone-700">Quick Wins</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {quickWins.map((qw) => (
            <div
              key={qw.query}
              className="rounded-xl border-l-4 border-l-[#c95d0d] bg-orange-50 p-4 shadow-sm"
            >
              <p className="font-medium text-stone-800">{qw.query}</p>
              <div className="mt-2 flex gap-4 text-xs text-stone-500">
                <span>
                  Position: <span className="font-semibold">{qw.position}</span>
                </span>
                <span>
                  Impressions: <span className="font-semibold">{qw.impressions.toLocaleString()}</span>
                </span>
              </div>
              <p className="mt-2 text-sm text-stone-600">{qw.opportunity}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
