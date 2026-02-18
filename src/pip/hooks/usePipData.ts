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
  mockClusters,
  mockAchievements,
  mockCalendarEvents,
  mockGoal,
  mockSeoSuggestions,
  mockVideoIdeas,
  mockPinterestPins,
  mockInstagramCaptions,
  type PipIdea,
  type AnalyticsData,
} from '../lib/pipMockData';

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

  // ── Streak + XP ──────────────────────────────────────────────────────────
  const streak: number = dashboardDoc?.siteStats?.streak ?? 0;
  const xp: number = 0;
  const level: number = 1;

  // ── Analytics ────────────────────────────────────────────────────────────
  const analytics: AnalyticsData = dashboardDoc?.analytics
    ? mapAnalytics(dashboardDoc.analytics, dashboardDoc.searchConsole)
    : mockAnalytics;

  return {
    ideas,
    morningMessage,
    streak,
    xp,
    level,
    analytics,
    isLoading,
    clusters: mockClusters,
    achievements: mockAchievements,
    calendar: mockCalendarEvents,
    goals: mockGoal,
    seoSuggestions: mockSeoSuggestions,
    videoIdeas: mockVideoIdeas,
    pinterestPins: mockPinterestPins,
    instagramCaptions: mockInstagramCaptions,
    posts: [] as Array<{ _id: string; title: string; publishedAt: string }>,
  };
}
