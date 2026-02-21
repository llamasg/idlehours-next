# Pip — Step 5c: YES AND, Boost Plan & Live Claude Interactions

## Context

The dashboard is mostly wired up. This step completes the live Claude interactions:
1. YES AND input on the Ideas page
2. Boost Plan button on the Goals page (was accidentally removed — rebuild it)
3. Confirm pipClaude.ts is using real Anthropic SDK (not mock delays)

---

## Fix 1: Confirm pipClaude.ts is real

Check `src/pip/lib/pipClaude.ts`. It should be using the real Anthropic SDK.
If it still has `await new Promise((r) => setTimeout(r, 1500))` anywhere,
replace the entire file with this:

```ts
import Anthropic from '@anthropic-ai/sdk'
import type { BoostPlan, BoostContext } from './pipMockData'

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

/**
 * YES AND — Pip riffs on Beth's content idea.
 * Accepts any premise, finds the interesting angle, offers directions.
 * Never evaluates if the idea is good — finds what makes it work.
 */
export async function askPipYesAnd(
  input: string,
): Promise<{ response: string; angles: string[] }> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `You are Pip, Beth's creative partner for idlehours.co.uk — a UK cosy games blog about games that create the "idle hours feeling": absorbing, forgiving, made with love.

Beth just said: "${input}"

Your job is YES AND. You accept whatever premise she gives you and find the most interesting version of it. 

Rules:
- NEVER say "that doesn't fit our niche" or evaluate whether it's a good idea
- Even if it seems off-topic (spaghetti, cats, a song), find the angle that connects to cosy games
- Be specific, not generic — "the comfort food angle" is better than "this could work well"
- Max 3 sentences total
- Offer 2-3 short angles as options (not directions — options she chooses between)
- UK spelling throughout
- Sound warm and interested, not like a marketing bot

Return ONLY valid JSON, nothing else:
{
  "response": "3 sentence response accepting and building on her idea",
  "angles": ["angle 1 in 4-5 words", "angle 2 in 4-5 words", "angle 3 in 4-5 words"]
}`
    }]
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const cleaned = text.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    return {
      response: text,
      angles: ['The personal angle', 'Make it a list', 'Mood editorial'],
    }
  }
}

/**
 * Boost Plan — generates a personalised sprint plan for Beth.
 * Called when Beth clicks "Generate my boost plan" on the Goals page.
 */
export async function generateBoostPlan(context: BoostContext): Promise<BoostPlan> {
  const isNewBlog = context.totalPosts < 10
  const hasTraffic = context.sessions > 100

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `You are Pip, creative partner for idlehours.co.uk — a UK cosy games blog run by Beth.

Current situation:
- Sessions this week: ${context.sessions} (${context.sessionsDelta > 0 ? '+' : ''}${context.sessionsDelta}% vs last week)
- Total posts published: ${context.totalPosts}
- Active cluster: ${context.activeCluster} (${context.clusterProgress} of ${context.clusterTotal} posts done)
- Writing streak: ${context.streak} days
- Top post: "${context.topPost.title}" with ${context.topPost.sessions} sessions
- Best ranking opportunity: "${context.quickWin.query}" at position ${context.quickWin.position}

${isNewBlog ? `IMPORTANT: This is a very new blog with only ${context.totalPosts} posts. The boost plan should focus on building the foundation — writing consistently, completing the first cluster, not on traffic growth tactics. Be encouraging and realistic about timescales.` : ''}
${!hasTraffic ? 'Traffic is still very low. Focus on content quality and cluster completion rather than distribution tactics.' : ''}

Generate a 4-6 week boost sprint. Rules:
- Be honest — if numbers are low, say so warmly but clearly  
- Be specific to the actual data — reference real posts/keywords
- Max 3 tasks per week period
- Sound like Pip — warm, direct, never a consultant
- UK spelling throughout
- For a new blog: focus on writing more posts, not SEO tactics

Return ONLY valid JSON:
{
  "headline": "sprint name — specific and motivating",
  "target": "one specific measurable thing to achieve in 6 weeks",
  "honestAssessment": "2-3 sentences. What's actually happening. Honest but warm.",
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
  "pipNote": "a personal note from Pip to Beth. Honest. Specific. Something she can hold onto."
}`
    }]
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const cleaned = text.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error('Boost plan generation returned invalid JSON')
  }
}
```

Make sure `VITE_ANTHROPIC_API_KEY` is in the cosyblog root `.env.local`:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

---

## Fix 2: Wire YES AND in PipIdeas.tsx

The `YesAndInput` component exists but may still be calling the mock version.
Check `src/pip/components/YesAndInput.tsx` and `src/pip/hooks/useYesAnd.ts`.

`useYesAnd.ts` should look like this — it calls the real `askPipYesAnd`:

```ts
import { useState, useCallback, useRef } from 'react'
import { askPipYesAnd } from '../lib/pipClaude'

export function useYesAnd() {
  const [response, setResponse] = useState<{
    response: string
    angles: string[]
  } | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const ask = useCallback(async (input: string) => {
    if (!input.trim() || input.trim().length < 3) return
    setIsThinking(true)
    setResponse(null)
    try {
      const result = await askPipYesAnd(input)
      setResponse(result)
    } catch (e) {
      console.error('YES AND failed:', e)
      setResponse({
        response: "Something went wrong on my end — try again in a moment.",
        angles: []
      })
    } finally {
      setIsThinking(false)
    }
  }, [])

  // Debounced version — fires 800ms after typing stops
  const askDebounced = useCallback((input: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => ask(input), 800)
  }, [ask])

  const clear = useCallback(() => setResponse(null), [])

  return { response, isThinking, ask, askDebounced, clear }
}
```

The `YesAndInput` component should:
- Show a large warm textarea with placeholder: `"Have your own idea? Tell Pip anything..."`
- Trigger on Enter key OR after 800ms debounce
- Show a loading state while Claude is thinking ("Pip is thinking...")
- Render the response as a speech bubble below
- Show angle pills below the response that Beth can click
- When an angle pill is clicked, it should call `refreshDeck` or navigate to Ideas

```tsx
// YesAndInput.tsx structure
export function YesAndInput() {
  const { response, isThinking, ask, askDebounced, clear } = useYesAnd()
  const [value, setValue] = useState('')

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) ask(value)
    }
  }

  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-[#2C2C2C] mb-2">
        Have your own idea?
      </h3>
      <textarea
        value={value}
        onChange={e => {
          setValue(e.target.value)
          askDebounced(e.target.value)
        }}
        onKeyDown={handleKeyDown}
        placeholder="Tell Pip anything... a game, a feeling, a half-formed thought"
        rows={3}
        className="w-full rounded-xl border border-[#E8E0D5] bg-white px-4 py-3
          text-sm text-[#2C2C2C] placeholder-[#C4B8AC] resize-none
          focus:outline-none focus:ring-2 focus:ring-[#7C9B7A]/30
          focus:border-[#7C9B7A] transition-all"
      />

      {isThinking && (
        <div className="mt-3 flex items-center gap-2 text-sm text-[#9B8E82]">
          <div className="w-2 h-2 rounded-full bg-[#7C9B7A] animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-[#7C9B7A] animate-pulse delay-150" />
          <div className="w-2 h-2 rounded-full bg-[#7C9B7A] animate-pulse delay-300" />
          <span className="ml-1">Pip is thinking...</span>
        </div>
      )}

      {response && (
        <div className="mt-3 bg-white rounded-xl border border-[#E8E0D5] p-4 shadow-sm">
          <div className="flex gap-2 mb-3">
            <span className="text-lg flex-shrink-0">🌱</span>
            <p className="text-sm text-[#4A4A4A] leading-relaxed">{response.response}</p>
          </div>
          {response.angles.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-[#F0EBE3]">
              {response.angles.map((angle, i) => (
                <button
                  key={i}
                  className="text-xs px-3 py-1.5 rounded-full bg-[#F0EBE3]
                    text-[#4A4A4A] hover:bg-[#7C9B7A] hover:text-white
                    transition-colors cursor-pointer"
                  onClick={() => {
                    setValue(angle)
                    ask(angle)
                  }}
                >
                  {angle}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

---

## Fix 3: Rebuild Boost Plan on Goals page

The boost button was removed. Add it back at the bottom of `PipGoals.tsx`,
below the two-column section:

```tsx
// Add to imports
import { useBoostPlan } from '../hooks/useBoostPlan'
import { BoostPlan } from '../components/BoostPlan'

// Add inside PipGoals component
const { plan, isGenerating, generate, clear } = useBoostPlan()

// Build context from real data
const boostContext: BoostContext = {
  sessions: analytics.overview.sessions7d,
  sessionsDelta: analytics.overview.sessionsDelta,
  totalPosts: posts.length,
  activeCluster: 'Anxiety & Low Energy', // TODO: derive from clusters
  clusterProgress: clusters[0]?.steps.filter(s => s.status === 'published').length ?? 0,
  clusterTotal: clusters[0]?.steps.length ?? 5,
  streak,
  topPost: analytics.topPosts[0]
    ? { title: analytics.topPosts[0].title, sessions: analytics.topPosts[0].sessions }
    : { title: 'your first post', sessions: 0 },
  quickWin: analytics.search.quickWins[0]
    ? { query: analytics.search.quickWins[0].query, position: analytics.search.quickWins[0].position }
    : { query: 'cosy games', position: 20 },
}
```

Add this card below the two-column section in the JSX:

```tsx
{/* Boost Plan section */}
<div className="mt-6 bg-[#1C1C1E] rounded-2xl p-6 text-white">
  <div className="flex items-start justify-between mb-2">
    <div>
      <div className="text-lg font-bold">🚀 Things feeling slow?</div>
      <p className="text-sm text-white/50 mt-1">
        Let Pip analyse your data and build a personalised sprint plan.
      </p>
    </div>
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
          <div className="w-4 h-4 border-2 border-white/30 border-t-white
            rounded-full animate-spin" />
          Pip is thinking...
        </>
      ) : (
        'Generate my boost plan →'
      )}
    </button>
  )}

  {plan && (
    <div className="mt-4">
      <BoostPlan plan={plan} />
      <button
        onClick={clear}
        className="mt-3 text-xs text-white/30 hover:text-white/60 transition-colors"
      >
        Generate a new plan
      </button>
    </div>
  )}
</div>
```

Check `src/pip/components/BoostPlan.tsx` exists and renders the plan correctly.
If it's missing or broken, here's a minimal version:

```tsx
import type { BoostPlan as BoostPlanType } from '../lib/pipMockData'

export function BoostPlan({ plan }: { plan: BoostPlanType }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-bold">{plan.headline}</div>
        <div className="text-sm text-white/50 mt-1">🎯 {plan.target}</div>
      </div>

      <div className="bg-white/5 rounded-xl p-4">
        <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
          Honest assessment
        </div>
        <p className="text-sm text-white/70 leading-relaxed">{plan.honestAssessment}</p>
      </div>

      {plan.weeks.map((week, i) => (
        <div key={i} className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-sm">{week.weekRange}</div>
            <div className="text-xs text-white/40">{week.focus}</div>
          </div>
          <div className="space-y-2">
            {week.tasks.map((task, j) => (
              <div key={j} className="flex gap-3">
                <div className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 h-fit mt-0.5
                  ${task.effort === 'low' ? 'bg-green-900/50 text-green-400' : ''}
                  ${task.effort === 'medium' ? 'bg-amber-900/50 text-amber-400' : ''}
                  ${task.effort === 'high' ? 'bg-red-900/50 text-red-400' : ''}
                `}>
                  {task.effort}
                </div>
                <div>
                  <div className="text-sm font-medium">{task.task}</div>
                  <div className="text-xs text-white/40 mt-0.5">{task.why}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-[#7C9B7A]/20 rounded-xl p-4 border border-[#7C9B7A]/30">
        <div className="text-xs font-bold text-[#7C9B7A] uppercase tracking-wider mb-2">
          Big bet
        </div>
        <p className="text-sm text-white/80">{plan.bigBet}</p>
      </div>

      <div className="bg-white/5 rounded-xl p-4 italic">
        <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
          From Pip
        </div>
        <p className="text-sm text-white/60 leading-relaxed">"{plan.pipNote}"</p>
      </div>
    </div>
  )
}
```

---

## Fix 4: useBoostPlan.ts — save to localStorage

Check `src/pip/hooks/useBoostPlan.ts`. The save function should persist
to localStorage so the plan survives a page refresh:

```ts
import { useState, useCallback, useEffect } from 'react'
import { generateBoostPlan } from '../lib/pipClaude'
import type { BoostPlan, BoostContext } from '../lib/pipMockData'

const STORAGE_KEY = 'pip_boost_plan'

export function useBoostPlan() {
  const [plan, setPlan] = useState<BoostPlan | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const generate = useCallback(async (context: BoostContext) => {
    setIsGenerating(true)
    try {
      const result = await generateBoostPlan(context)
      setPlan(result)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result))
    } catch (e) {
      console.error('Boost plan failed:', e)
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const clear = useCallback(() => {
    setPlan(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { plan, isGenerating, generate, clear }
}
```

---

## Verify

After this step:

1. **YES AND** — type something in the ideas page input, press Enter or wait 800ms.
   Pip should respond with a speech bubble and 2-3 angle pills within a few seconds.

2. **YES AND angles** — clicking an angle pill should feed it back into the input
   and trigger another response.

3. **Boost plan** — go to Goals page, scroll to bottom, click "Generate my boost plan".
   Should show a loading spinner, then render the full plan after ~10-15 seconds.
   Refreshing the page should show the same plan (saved to localStorage).

4. **"Generate a new plan"** link below the plan should clear it and show the button again.

5. No mock delays anywhere in `pipClaude.ts` — all calls hit the real Anthropic API.