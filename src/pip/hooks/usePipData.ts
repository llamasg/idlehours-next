/* ──────────────────────────────────────────────
   Pip Dashboard v2 — Central Data Hook
   Fetches live data from the pip-dashboard-singleton Sanity document.
   Falls back to mock data if Pip hasn't run yet.
   ────────────────────────────────────────────── */

import { useState, useEffect } from 'react';
import { createClient } from '@sanity/client';
import {
  mockIdeas,
  mockAnalytics,
  mockAchievements,
  mockGoal,
  mockSeoSuggestions,
  allAchievements,
  checkAchievement,
  type PipIdea,
  type AnalyticsData,
  type PipCluster,
} from '../lib/pipMockData';

// ── XP Calculation ────────────────────────────────────────────────────────

function calculateXP(data: {
  totalPosts: number;
  streak: number;
  sessions7d: number;
  clustersCompleted: number;
}): number {
  let xp = 0;

  // Posts
  xp += data.totalPosts * 100;

  // Streak bonuses (non-cumulative — highest tier only)
  if (data.streak >= 30) xp += 500;
  else if (data.streak >= 7) xp += 150;

  // Traffic milestones (cumulative — earn each tier once)
  if (data.sessions7d >= 1000) xp += 1000;
  else if (data.sessions7d >= 500) xp += 500;
  else if (data.sessions7d >= 100) xp += 200;

  // Completed content clusters
  xp += data.clustersCompleted * 300;

  return xp;
}

// Dedicated pip client — useCdn: false ensures fresh data every time
const pipClient = createClient({
  projectId: 'ijj3h2lj',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
});

function mapAnalytics(raw: any, searchConsole: any): AnalyticsData {
  return {
    overview: {
      sessions7d: raw.sessions7d ?? 0,
      sessionsDelta: raw.sessionsDelta ?? 0,
      // Sanity stores avgSessionDuration; AnalyticsData expects avgReadTime
      avgReadTime: raw.avgSessionDuration ?? 0,
      returnVisitorPct: raw.returnVisitorPct ?? 0,
      newVisitorPct: raw.newVisitorPct ?? 0,
      trafficSources: raw.trafficSources ?? {
        organic: 0, direct: 0, social: 0, referral: 0,
      },
      weeklyTrend: raw.weeklyTrend ?? [],
    },
    topPosts: (raw.topPages ?? []).map((p: any) => ({
      title: p.title ?? '',
      sessions: p.sessions ?? 0,
      readTime: p.avgReadTime ?? 0,
      bounceRate: p.bounceRate ?? 0,
      position: 0,
      trend: 'stable' as const,
    })),
    audience: {
      topCountries: (raw.topCountries ?? []).map((c: any) => ({
        country: c.country ?? '',
        sessions: c.sessions ?? 0,
        pct: c.pct ?? 0,
      })),
      deviceSplit: { mobile: 0, desktop: 0, tablet: 0 },
      personas: [],
    },
    search: {
      topQueries: (searchConsole?.topQueries ?? []).map((q: any) => ({
        query: q.query ?? '',
        clicks: q.clicks ?? 0,
        impressions: q.impressions ?? 0,
        ctr: q.ctr ?? 0,
        position: q.position ?? 0,
      })),
      quickWins: (searchConsole?.quickWins ?? []).map((q: any) => ({
        query: q.query ?? '',
        position: q.position ?? 0,
        impressions: q.impressions ?? 0,
        opportunity: q.opportunity ?? '',
      })),
    },
  };
}

export function usePipData() {
  const [dashboardDoc, setDashboardDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Array<{ _id: string; title: string; publishedAt: string }>>([]);

  // Fetch pip-dashboard-singleton
  useEffect(() => {
    pipClient
      .fetch(`*[_id == "pip-dashboard-singleton"][0]`)
      .then((doc: any) => {
        console.log('[Pip] Fetched dashboard doc:', doc?._id, 'sessions:', doc?.analytics?.sessions7d);
        setDashboardDoc(doc ?? null);
      })
      .catch((e: unknown) => {
        console.warn('[Pip] Could not fetch live data — using mock', e);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Fetch real posts for calendar and achievement calculations
  useEffect(() => {
    pipClient
      .fetch(`*[_type == "post"] | order(publishedAt desc) { _id, title, publishedAt }`)
      .then((docs: any[]) => setPosts(docs ?? []))
      .catch(() => {});
  }, []);

  // ── Ideas ─────────────────────────────────────────────────────────────────
  const ideas: PipIdea[] = dashboardDoc?.ideas?.length
    ? dashboardDoc.ideas.map((idea: any) => ({
        id: idea._key ?? idea.id,
        type: idea.type,
        typeEmoji: idea.typeEmoji,
        title: idea.title,
        reason: idea.reason,
        difficulty: idea.difficulty as 1 | 2 | 3,
        cluster: idea.cluster,
        trending: idea.trending ?? false,
      }))
    : mockIdeas;

  // ── Morning message ───────────────────────────────────────────────────────
  const morningMessage: string = dashboardDoc?.morningMessage ?? '';

  // ── Clusters — no mock data; show empty until Sanity has real clusters ─────
  const clusters: PipCluster[] = [];

  // ── Streak + XP ──────────────────────────────────────────────────────────
  const streak: number = dashboardDoc?.siteStats?.streak ?? 0;
  const sessions7d: number = dashboardDoc?.analytics?.sessions7d ?? 0;
  const clustersCompleted = clusters.filter((c) =>
    c.steps.length > 0 && c.steps.every((s) => s.status === 'published'),
  ).length;

  const xp = calculateXP({
    totalPosts: posts.length,
    streak,
    sessions7d,
    clustersCompleted,
  });

  // ── Analytics ────────────────────────────────────────────────────────────
  const analytics: AnalyticsData = dashboardDoc?.analytics
    ? mapAnalytics(dashboardDoc.analytics, dashboardDoc.searchConsole)
    : mockAnalytics;

  // ── Achievements — calculate from real data when available ────────────────
  const achievements = dashboardDoc
    ? allAchievements.map((ach) => ({
        ...ach,
        earned: checkAchievement(ach.id, {
          totalPosts: posts.length,
          sessions7d: dashboardDoc.analytics?.sessions7d ?? 0,
          streak: dashboardDoc.siteStats?.streak ?? 0,
          returnVisitorPct: dashboardDoc.analytics?.returnVisitorPct ?? 0,
        }),
      }))
    : mockAchievements;

  // ── Goals — use live session count ────────────────────────────────────────
  const goals = {
    title: mockGoal.title,
    current: dashboardDoc?.analytics?.sessions7d ?? mockGoal.current,
    target: mockGoal.target,
    milestones: mockGoal.milestones,
  };

  return {
    ideas,
    morningMessage,
    streak,
    xp,
    analytics,
    isLoading,
    clusters,
    achievements,
    calendar: [], // calendar is derived from `posts` in PipCalendar
    goals,
    seoSuggestions: mockSeoSuggestions,
    posts,
  };
}
