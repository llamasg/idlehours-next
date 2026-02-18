/* ──────────────────────────────────────────────
   Pip Dashboard v2 — useIdeasRefresh
   Calls Claude Haiku to generate 3 fresh post ideas
   when the user asks for something different.
   ────────────────────────────────────────────── */

import { useState } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import type { PipIdea } from '../lib/pipMockData';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

export function useIdeasRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function fetchFreshIdeas(existingTitles: string[]): Promise<PipIdea[]> {
    setIsRefreshing(true);
    try {
      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        messages: [
          {
            role: 'user',
            content: `You are Pip, creative partner for idlehours.co.uk — a UK cosy games blog.

Beth has already seen these ideas and wants something different:
${existingTitles.slice(0, 6).join('\n')}

Generate 3 fresh post ideas that are meaningfully different.
Same rules: cosy games niche, UK spelling, KD under 40, warm and specific reasons.

Return ONLY a JSON array (no markdown fences, no extra text):
[{
  "id": "fresh-1",
  "type": "List",
  "typeEmoji": "📋",
  "title": "...",
  "reason": "2 sentences, warm and specific",
  "difficulty": 1,
  "cluster": "Anxiety & Low Energy",
  "trending": false
}]`,
          },
        ],
      });

      const text = message.content[0].type === 'text' ? message.content[0].text : '[]';
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim()) as PipIdea[];

      // Ensure unique IDs so they don't collide with existing deck cards
      return parsed.map((idea, i) => ({
        ...idea,
        id: `fresh-${Date.now()}-${i}`,
      }));
    } catch (e) {
      console.error('[Pip] Fresh ideas failed:', e);
      return [];
    } finally {
      setIsRefreshing(false);
    }
  }

  return { fetchFreshIdeas, isRefreshing };
}
