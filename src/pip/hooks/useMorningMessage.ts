'use client'
/* ──────────────────────────────────────────────
   Pip Dashboard v2 — useMorningMessage
   Generates a daily morning message via Claude.
   Cached in localStorage per calendar day so it
   only costs one API call per day per browser.
   ────────────────────────────────────────────── */

import { useState, useEffect, useRef } from 'react';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

const LS_KEY = 'pip_morning_message';

// Shown on API error — still follows the voice rules
const FALLBACK_MESSAGE =
  "Morning, Beth — you've got words waiting somewhere in today, and writing them will feel better than not writing them. Open the doc.";

interface CachedMessage {
  date: string; // YYYY-MM-DD
  message: string;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadCached(): string | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed: CachedMessage = JSON.parse(raw);
    return parsed.date === todayKey() ? parsed.message : null;
  } catch {
    return null;
  }
}

function saveCache(message: string) {
  try {
    const payload: CachedMessage = { date: todayKey(), message };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  } catch {}
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
}

async function callClaude(ctx: {
  streak: number;
  sessions7d: number;
  totalPosts: number;
}): Promise<string> {
  const timeOfDay = getTimeOfDay();
  const isNewBlog = ctx.totalPosts < 10;

  const prompt = `You are Pip, Beth's creative partner for idlehours.co.uk — a UK cosy games blog.

VOICE RULES — apply to every word:
- Lead with feeling, follow with fact. First sentence makes her feel something before it tells her anything.
- Contractions always: "you're" not "you are", "it's" not "it is". Every time.
- UK English: cosy, colour, favourite, £ not $.
- BANNED: deep dive, amazing, journey, incredible, "great work", "keep it up", "at the end of the day", nostalgia trip, cozy, "well done", "proud of you", "you've got this".
- Sound like a friend who's genuinely excited about this project — not a coach, not a consultant.

Stats:
- Sessions this week: ${ctx.sessions7d}
- Writing streak: ${ctx.streak} days
- Total posts published: ${ctx.totalPosts}

Write Beth's morning message. Strict rules:
- EXACTLY two sentences — not one, not three, TWO.
- First sentence: start with "${timeOfDay}, Beth!" and lead with an observation or feeling, NOT a data announcement.
- Embed ONE data point naturally — woven into a sentence, not listed.
- Final sentence: end with one specific, concrete reason to open the writing app today. Not "keep going". Not a generic pep talk. Something tied to where she actually is right now.
- ${isNewBlog ? `This is a new blog with only ${ctx.totalPosts} post${ctx.totalPosts !== 1 ? 's' : ''}. Be warm about the start — not analytical. At this stage, any writing is the right move.` : ctx.sessions7d > 50 ? `There is real traffic to reference — ${ctx.sessions7d} sessions is something to build on.` : 'Traffic is still building. Focus on the writing, not the numbers.'}

Return ONLY the message — no quotes, no explanation, nothing else.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 120,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
  return text || FALLBACK_MESSAGE;
}

/* ── Hook ──────────────────────────────────────── */

export interface UseMorningMessageReturn {
  message: string;
  isLoading: boolean;
}

export function useMorningMessage({
  streak,
  sessions7d,
  totalPosts,
  isDataLoading,
}: {
  streak: number;
  sessions7d: number;
  totalPosts: number;
  isDataLoading: boolean;
}): UseMorningMessageReturn {
  const [message, setMessage] = useState<string>(() => loadCached() ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const hasGenerated = useRef(false);

  useEffect(() => {
    // Don't generate until Sanity data has loaded (avoid generating with all-zeros)
    if (isDataLoading) return;
    // Only generate once per mount, and only if there's no cached message for today
    if (hasGenerated.current || message) return;

    hasGenerated.current = true;
    setIsLoading(true);

    callClaude({ streak, sessions7d, totalPosts })
      .then((msg) => {
        setMessage(msg);
        saveCache(msg);
      })
      .catch(() => {
        setMessage(FALLBACK_MESSAGE);
      })
      .finally(() => setIsLoading(false));
  }, [isDataLoading]); // re-check when loading state changes

  return { message, isLoading };
}
