/* ──────────────────────────────────────────────
   Pip Dashboard v2 — useSocialContent
   Generates social content ideas via Claude Sonnet.
   Plan persists in localStorage until user refreshes.
   ────────────────────────────────────────────── */

import { useState, useCallback } from 'react';
import Anthropic from '@anthropic-ai/sdk';

// ── Anthropic client ──────────────────────────

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

// ── Types ─────────────────────────────────────

export interface ReelIdea {
  id: string;
  platform: 'tiktok' | 'instagram' | 'both';
  emoji: string;
  hook: string;
  concept: string;
  why: string;
  shotList: string[];
  effort: 1 | 2 | 3;
  mood: string;
}

export interface PinterestIdea {
  id: string;
  pinTitle: string;
  description: string;
  board: string;
  imageBrief: string;
  searchTerms: string[];
  why: string;
}

export interface SocialPlan {
  generatedAt: string;
  reels: ReelIdea[];
  pinterest: PinterestIdea[];
}

export interface BlogContext {
  niche: string;
  topPosts: Array<{ title: string; sessions: number }>;
  topQueries: Array<{ query: string; impressions: number }>;
}

// ── localStorage ──────────────────────────────

const LS_KEY = 'pip_social_plan';

function loadPlan(): SocialPlan | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as SocialPlan) : null;
  } catch {
    return null;
  }
}

function savePlan(plan: SocialPlan) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(plan));
  } catch {}
}

// ── Prompt ────────────────────────────────────

function buildPrompt(ctx: BlogContext): string {
  const postList = ctx.topPosts.length
    ? ctx.topPosts.map((p) => `• ${p.title} (${p.sessions} sessions)`).join('\n')
    : '• No posts yet — this is a new blog';

  const queryList = ctx.topQueries.length
    ? ctx.topQueries.map((q) => `• "${q.query}" (${q.impressions} impressions)`).join('\n')
    : '• No search data yet';

  return `You are Pip, a sharp content strategist for "${ctx.niche}" — a UK cosy games blog covering indie, relaxing, and low-stress games for adults.

Generate a social content plan with evidence-backed ideas. Base every idea on real patterns that actually perform: TikTok/Instagram hooks that drive watch-through, Pinterest's evergreen search behaviour for "cosy games" and "games for anxiety", formats that drive saves and clicks.

Top performing posts:
${postList}

Top Google search queries:
${queryList}

Return ONLY valid JSON in this exact shape — no markdown, no explanation:
{
  "reels": [
    {
      "id": "r1",
      "platform": "both",
      "emoji": "🎮",
      "hook": "opening line shown on screen or spoken",
      "concept": "what the video actually shows in 1-2 sentences",
      "why": "specific evidence-based reason this format works",
      "shotList": ["shot 1 description", "shot 2 description", "shot 3 description"],
      "effort": 2,
      "mood": "Cosy & atmospheric"
    }
  ],
  "pinterest": [
    {
      "id": "p1",
      "pinTitle": "Pin headline under 60 chars",
      "description": "2-3 sentence description optimised for Pinterest search",
      "board": "Cosy Games",
      "imageBrief": "What the image should look like in one sentence",
      "searchTerms": ["search term 1", "search term 2", "search term 3"],
      "why": "why this pin will rank and drive traffic to the blog"
    }
  ]
}

Generate 4 reels (mix of platforms) and 4 Pinterest pins. Make every 'why' field genuinely specific — cite actual platform behaviour, not generic advice. UK spelling throughout.`;
}

// ── Hook ──────────────────────────────────────

export interface UseSocialContentReturn {
  plan: SocialPlan | null;
  isGenerating: boolean;
  error: string | null;
  generate: (ctx: BlogContext) => Promise<void>;
}

export function useSocialContent(): UseSocialContentReturn {
  const [plan, setPlan] = useState<SocialPlan | null>(loadPlan);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (ctx: BlogContext) => {
    setIsGenerating(true);
    setError(null);

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        messages: [{ role: 'user', content: buildPrompt(ctx) }],
      });

      const text = message.content[0].type === 'text' ? message.content[0].text : '';
      console.log('[Pip] Social content raw response:', text);

      // Extract outermost { ... } block — handles text before/after the JSON
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
        throw new Error('No JSON object found in response');
      }
      const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as {
        reels: ReelIdea[];
        pinterest: PinterestIdea[];
      };

      const newPlan: SocialPlan = {
        generatedAt: new Date().toISOString(),
        reels: parsed.reels,
        pinterest: parsed.pinterest,
      };

      savePlan(newPlan);
      setPlan(newPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { plan, isGenerating, error, generate };
}
