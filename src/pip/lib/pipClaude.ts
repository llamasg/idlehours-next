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

/* ── Shared voice rules ──────────────────────────
   Injected into every Claude call. One place to update.
   ─────────────────────────────────────────────── */

const VOICE_CONTEXT = `
VOICE RULES — apply to every word:
- Warm without being soft. Specific without being dry. Honest without being harsh.
- Lead with feeling, follow with fact — the first sentence makes them feel something before it tells them anything.
- Contractions always: "you're" not "you are", "it's" not "it is". Every single time.
- UK English only: cosy, colour, organise, realise, favourite, centre, Autumn, £ not $.
- Vary rhythm deliberately: short sentences. Short again. Longer — earning complexity. Very short. The turn.
- BANNED words (never use): deep dive, masterpiece, hidden gem, must-play, game-changing, iconic, unique, amazing, journey, cozy, incredible, fantastic, wonderful, "great work", "keep it up", "at the end of the day", "I think/feel/believe", "In conclusion", "To sum up", nostalgia trip, casual gamers, "sits with", "signal".
- Never sound like a consultant, a press release, or a listicle. Sound like a friend who thinks carefully and has opinions.
`;

/* ── YES AND ─────────────────────────────────────
   Pip riffs on Beth's idea. Finds the feeling
   underneath it, not just the surface topic.
   ─────────────────────────────────────────────── */

export async function askPipYesAnd(
  input: string,
): Promise<{ response: string; angles: string[] }> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 350,
    messages: [{
      role: 'user',
      content: `You are Pip, Beth's creative partner for idlehours.co.uk — a UK cosy games blog about games that create the "idle hours feeling": absorbing, forgiving, made with love.
${VOICE_CONTEXT}
Beth just said: "${input}"

Your job is YES AND. Accept whatever she gives you and find the most interesting version of it. Even if it sounds off-topic — find the angle that connects to the cosy games feeling.

Rules:
- NEVER say "that doesn't fit" or evaluate the idea. There are no bad ideas, only undiscovered angles.
- Find what the idea is actually about underneath. What feeling does it tap into?
- Be specific, not generic — "the 'brain finally off' feeling" beats "relaxation games".
- Max 3 sentences total.
- The 3 angle pills should make her feel something before she clicks them. Not topic labels — emotional hooks. Like: "Games for when your brain won't stop" or "The one you play in five-minute chunks" or "What Spiritfarer would be if it were set in winter".

Return ONLY valid JSON:
{
  "response": "3 sentences max, YES AND her idea, find the feeling underneath",
  "angles": ["emotional hook angle 1", "emotional hook angle 2", "emotional hook angle 3"]
}`,
    }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return {
      response: text,
      angles: ["Games for when your brain won't stop", 'The five-minute escape', 'Comfort food, but a game'],
    };
  }
}

/* ── Boost Plan ──────────────────────────────────
   Personalised sprint plan built from real data.
   Honest first. Then actionable.
   ─────────────────────────────────────────────── */

export async function generateBoostPlan(context: BoostContext): Promise<BoostPlan> {
  const isNewBlog = context.totalPosts < 10;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `You are Pip, creative partner for idlehours.co.uk — a UK cosy games blog run by Beth.
${VOICE_CONTEXT}
Current situation:
- Sessions this week: ${context.sessions} (${context.sessionsDelta > 0 ? '+' : ''}${context.sessionsDelta}% vs last week)
- Posts published: ${context.totalPosts}
- Active cluster: ${context.activeCluster} — ${context.clusterProgress} of ${context.clusterTotal} posts done
- Writing streak: ${context.streak} days
- Top post: "${context.topPost.title}" with ${context.topPost.sessions} sessions
- Best ranking opportunity: "${context.quickWin.query}" at position ${context.quickWin.position}

${isNewBlog ? `IMPORTANT: This is a new blog with only ${context.totalPosts} posts. The plan should focus on building — writing consistently, finishing the first cluster, not traffic tactics. Early days are about accumulating posts, not analysing them.` : ''}

Generate a 4-6 week boost sprint. Rules:
- Max 3 tasks per week.
- "honestAssessment": say what's actually happening. If traffic is flat, say it's flat. If the numbers are small, name them. Honest isn't harsh — it's specific. No "the foundation is solid", no padding.
- "pipNote": this should sound like the last thing you'd say at the end of a voice note — not a cheerleader sign-off, not a motivational poster. Something specific to Beth's situation that she can hold onto.

Return ONLY valid JSON:
{
  "headline": "sprint name — specific, not generic",
  "target": "one measurable thing to achieve in 6 weeks",
  "honestAssessment": "2-3 sentences. What's actually happening — say the real thing.",
  "weeks": [
    {
      "weekRange": "Weeks 1-2",
      "focus": "one sentence theme",
      "tasks": [
        { "task": "specific action", "why": "why this matters right now", "effort": "low|medium|high" }
      ]
    }
  ],
  "bigBet": "the single highest-leverage thing Beth could do in this sprint",
  "pipNote": "something specific she can hold onto — not a cheerleader, not a closer. The real thing."
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
