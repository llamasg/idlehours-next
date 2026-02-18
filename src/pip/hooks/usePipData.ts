/* ──────────────────────────────────────────────
   Pip Dashboard v2 — Central Data Hook
   ────────────────────────────────────────────── */

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
} from '../lib/pipMockData';

/**
 * Central hook that provides every piece of data the Pip dashboard needs.
 * Currently returns mock data; will be wired to Sanity / API later.
 */
export function usePipData() {
  return {
    ideas: mockIdeas,
    analytics: mockAnalytics,
    clusters: mockClusters,
    achievements: mockAchievements,
    calendar: mockCalendarEvents,
    goals: mockGoal,
    seoSuggestions: mockSeoSuggestions,
    videoIdeas: mockVideoIdeas,
    pinterestPins: mockPinterestPins,
    instagramCaptions: mockInstagramCaptions,
    streak: 4,
    xp: 1250,
    level: 3,
    posts: [] as Array<{ _id: string; title: string; publishedAt: string }>,
    isLoading: false,
  };
}
