/* ──────────────────────────────────────────────
   Pip Dashboard v2 — Claude API
   Real Anthropic calls for the /pip interface.
   dangerouslyAllowBrowser is intentional — /pip is
   password-protected and only Beth has access.
   ────────────────────────────────────────────── */

import Anthropic from '@anthropic-ai/sdk';
import type { BoostPlan, BoostContext } from './pipMockData';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function askPipYesAnd(
  input: string,
): Promise<{ response: string; angles: string[] }> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `You are Pip, Beth's creative partner for idlehours.co.uk — a UK cosy games blog.

Beth just said: "${input}"

Your job is to YES AND her idea. Find the most interesting version of it.
Never evaluate whether it's good. Find the angle that makes it work.
Be specific, warm, punchy. Max 3 sentences.
End with 2-3 short angle options (3-5 words each).

Return ONLY valid JSON:
{
  "response": "your response to Beth",
  "angles": ["angle 1", "angle 2", "angle 3"]
}`,
    }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return {
      response: text,
      angles: ['Explore this angle', 'Make it personal', 'Turn it into a list'],
    };
  }
}

export async function generateBoostPlan(context: BoostContext): Promise<BoostPlan> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `You are Pip, creative partner for idlehours.co.uk — a UK cosy games blog.

Current stats:
- Sessions this week: ${context.sessions} (${context.sessionsDelta > 0 ? '+' : ''}${context.sessionsDelta}%)
- Posts published: ${context.totalPosts}
- Active cluster: ${context.activeCluster} (${context.clusterProgress}/${context.clusterTotal} posts done)
- Writing streak: ${context.streak} days
- Top post: "${context.topPost.title}" with ${context.topPost.sessions} sessions
- Best ranking opportunity: "${context.quickWin.query}" at position ${context.quickWin.position}

Generate a 4-6 week boost sprint plan. Be honest, specific, warm.
Max 3 tasks per week. UK spelling.

Return ONLY valid JSON:
{
  "headline": "sprint name",
  "target": "specific measurable goal for week 6",
  "honestAssessment": "2-3 sentences on where things actually stand",
  "weeks": [
    {
      "weekRange": "Weeks 1-2",
      "focus": "theme",
      "tasks": [{"task": "...", "why": "...", "effort": "low|medium|high"}]
    }
  ],
  "bigBet": "single highest-leverage action",
  "pipNote": "personal note from Pip to Beth"
}`,
    }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    throw new Error('Boost plan generation failed');
  }
}
