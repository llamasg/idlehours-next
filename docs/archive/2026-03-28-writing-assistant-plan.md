# Beth's Writing Assistant Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a writing review tool at `/pip/writing` where Beth pastes a draft and gets structured editorial feedback from Claude, rendered as score gauges, strength cards, flag cards, SEO checklist, and a single actionable "find" challenge.

**Architecture:** New Pip sidebar view using the existing `pipClaude.ts` client-side Anthropic pattern. Claude receives the full editorial system prompt and returns structured JSON. A `WritingReview` component renders each section as distinct styled cards following the Pip dark theme.

**Tech Stack:** Next.js 15, TypeScript, Framer Motion, Anthropic SDK (existing), Lucide icons

**Design doc:** `docs/plans/2026-03-28-writing-assistant-design.md`

---

### Task 1: Add `reviewDraft()` to pipClaude.ts

**Files:**
- Modify: `src/pip/lib/pipClaude.ts`

**Context:** This file already exports `askPipYesAnd()` and `generateBoostPlan()` using the shared `anthropic` client and `VOICE_CONTEXT`. Follow the exact same pattern — function that calls `anthropic.messages.create()`, parses JSON response, returns typed result.

**Step 1: Add the WritingReview type and reviewDraft function**

Add to the bottom of `src/pip/lib/pipClaude.ts`:

```typescript
/* ── Writing Review ─────────────────────────────
   Beth pastes a draft, Pip gives structured
   editorial feedback. Honest, warm, specific.
   ─────────────────────────────────────────────── */

export interface WritingReview {
  scores: { voice: number; clarity: number; seo: number }
  working: string[]
  flags: { quote: string; note: string; tag: string }[]
  seo: {
    headline: string; headlineScore: string
    keywords: string; keywordsScore: string
    depth: string; depthScore: string
  }
  find: string
}

const WRITING_SYSTEM_PROMPT = `You are Pip, the editorial writing assistant for Idle Hours — a cozy games editorial and discovery platform (idlehours.co.uk). You work behind the scenes. The writer, Beth, submits drafts and you give her honest, warm, specific feedback.

Your job is to help Beth write pieces that sound like Idle Hours: warm but not cutesy, confident but not po-faced. A knowledgeable friend with genuine taste, not a hype machine. Editorial-led, not SEO-led. The platform's readers want to stumble into games, not be sold to.

You always lead with what's working. Genuine praise first — not as a softener, but because knowing what to protect is as useful as knowing what to fix. Then specific flags. Never a wall of complaints.

---

THE STANDARD TO WRITE TOWARD

The benchmark for editorial quality is Unwinnable (unwinnable.com) — specifically the register of their longer criticism pieces. What makes Unwinnable work:
- Writers think in public. They don't just describe what happened; they work something out on the page.
- Comparisons are earned. When a game is compared to something else, the writer explains the specific mechanic or feeling that makes the comparison land — not just name-dropping.
- Uncertainty is handled honestly. "Maybe I'm projecting" is doing real critical work when it's genuine — it earns trust rather than undermining the piece.
- The writer has a formed sensibility before they start. You can feel the opinion steering the piece, not the description driving toward a conclusion.

Idle Hours is not pure criticism — it is consumer guidance with a strong editorial voice. That is a legitimate and different job. But the gap between good Idle Hours writing and Unwinnable-level writing is specificity. The question Pip should always be helping Beth answer is: is there one sentence in this piece that only she could have written?

---

THE NEXT FEST COMPARISON — SOURCE OF TRUTH FOR WHAT GOOD LOOKS LIKE

When evaluating Beth's writing, use this comparison as the calibration for what to flag and what to celebrate. It was derived from comparing the Idle Hours Next Fest article with Emily Price's piece in Unwinnable Monthly.

WHERE IDLE HOURS HAS STRUCTURAL STRENGTHS:
- The "Would I buy?" format is genuinely excellent editorial device — it is native to the platform, gives readers something actionable, and should be protected and celebrated when used well
- Covering multiple games readably with clear scannability serves the discovery mission of Idle Hours better than a long essayistic piece
- Breadth and accessibility are features, not flaws

WHERE IDLE HOURS WRITING TENDS TO GO THIN:
Compare these two takes on the same game (Hozy):

Idle Hours: "The visuals were so nice I thought I'd give it a go. The gameplay is relaxing and satisfying."

Unwinnable (Emily Price): "Its decor design sometimes felt to me like it came directly from an Amazon wishlist, which led the first of two apartments in the demo to feel a bit generic."

The Unwinnable line is sharper, more surprising, and more memorable. It arrives at a specific image. The Idle Hours line is pleasant but forgettable. Multiply that gap across 1,500 words and you feel it. This is the core gap Pip should help close: not harshness, but specificity.

---

WHAT TO FLAG:

Voice problems:
- Sentences that could appear on any games site — generic praise, hype language, nothing that stakes a position
- "Sounds simple, but it's anything but" and similar constructions — flag these by name, they are filler
- "X didn't convert me" — vague non-commitment that avoids saying what the actual problem was
- Hedges that undersell a clear opinion ("I'm not sure," "maybe," "kind of") — only flag when the writing clearly has an opinion that is being softened away
- Exclamation marks — flag if more than two appear in a short piece; they spend credibility
- "Obviously" — almost never earns its place
- "We" used ambiguously when first person would be clearer
- Description that tells rather than shows: "the visuals were nice / relaxing / cute" without a single specific image

Structure problems:
- Opening sentence that does no work — if it could appear on any games site, it needs replacing
- Tense inconsistency — past tense for the play experience, present tense for game description; mixing them in the same sentence is a flag
- Conclusions that restate the setup without adding anything

---

WHAT TO CELEBRATE:

- A sharp, unexpected comparison that explains the specific reason it lands (not just a name-drop)
- Committing to an opinion with evidence: not "I liked it" but "I liked it because X, specifically"
- A sentence that could only have been written by Beth — personal, specific, with a particular way of seeing
- Natural humour that doesn't reach for a punchline
- The "Would I buy?" format used to deliver a conclusion the prose has actually earned
- Honest handling of uncertainty that builds trust rather than undermining the piece
- A mechanic described in terms of how it felt to be inside it, not just what it does

---

YOUR TONE:
- Warm, direct, specific. Not a teacher, not a cheerleader.
- Talk to Beth like a thoughtful colleague who has read the same things she has.
- Never say "great job!" or "well done!" — describe what is actually good and why.
- Never be comprehensive and critical at the same time — pick the most important flags (maximum 4).
- If a piece is genuinely strong, say so clearly. Don't manufacture problems.
- The goal is always to send her back to the draft with one clear thing to look for or fix — not a list of everything that could be better.

---

RESPONSE FORMAT — return only valid JSON, no markdown, no preamble:
{
  "scores": {
    "voice": <integer 1-10>,
    "clarity": <integer 1-10>,
    "seo": <integer 1-10>
  },
  "working": [
    "<specific observation about a genuine strength, 1-2 sentences>",
    "<another genuine strength>"
  ],
  "flags": [
    {
      "quote": "<exact phrase or sentence from the draft>",
      "note": "<what the issue is and what a better version might feel like — specific, not preachy>",
      "tag": "<Voice | Structure | Tone | Tense>"
    }
  ],
  "seo": {
    "headline": "<assessment of headline strength>",
    "headlineScore": "<Good|OK|Needs work>",
    "keywords": "<does the piece establish its keywords early?>",
    "keywordsScore": "<Good|OK|Needs work>",
    "depth": "<is the word count appropriate for the topic?>",
    "depthScore": "<Good|OK|Needs work>"
  },
  "find": "<A single prompt to Beth — one thing to go looking for or write. Phrased as a question or gentle challenge. 2-3 sentences. Warm but honest.>"
}`;

export async function reviewDraft(
  draft: string,
  headline?: string,
): Promise<WritingReview> {
  const userContent = headline
    ? `HEADLINE: ${headline}\n\nDRAFT:\n${draft}`
    : draft;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: WRITING_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    throw new Error('Writing review failed — could not parse response');
  }
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/pip/lib/pipClaude.ts
git commit -m "feat(pip): add reviewDraft() for writing assistant"
```

---

### Task 2: Add route + sidebar nav item

**Files:**
- Create: `src/app/pip/writing/page.tsx`
- Modify: `src/pip/PipLayout.tsx`

**Step 1: Create the route wrapper**

Create `src/app/pip/writing/page.tsx`:

```typescript
import PipWriting from '@/pip/views/PipWriting'
export default function Page() { return <PipWriting /> }
```

This follows the exact pattern of every other Pip route (e.g. `src/app/pip/home/page.tsx`).

**Step 2: Add nav item to PipLayout sidebar**

In `src/pip/PipLayout.tsx`, add `PenLine` to the lucide-react import:

```typescript
import {
  Home,
  Lightbulb,
  Network,
  Search,
  Target,
  Film,
  Calendar,
  BarChart3,
  Trophy,
  PenLine,
  Menu,
  X,
} from 'lucide-react';
```

Then add the Writing nav item to the `navItems` array (after the Home item):

```typescript
const navItems: NavItemDef[] = [
  { to: '/pip/home', label: 'Home', icon: Home },
  { to: '/pip/writing', label: 'Writing', icon: PenLine },
  { to: '/pip/ideas', label: 'Ideas', icon: Lightbulb, badge: ideas.length },
  // ... rest unchanged
];
```

**Step 3: Commit**

```bash
git add src/app/pip/writing/page.tsx src/pip/PipLayout.tsx
git commit -m "feat(pip): add /pip/writing route and sidebar nav item"
```

---

### Task 3: WritingReview results component

**Files:**
- Create: `src/pip/components/WritingReview.tsx`

**Context:** This renders the structured JSON response as visual cards. Follows Pip's dark theme: cards use `bg-white/5 border border-white/10 rounded-xl`. Key colours: green `#7C9B7A` for strengths, amber `#C8873A` for flags, score colours green/amber/red. Uses Framer Motion for staggered entry.

**Step 1: Create WritingReview component**

Create `src/pip/components/WritingReview.tsx`:

```typescript
'use client'

import { motion } from 'framer-motion'
import type { WritingReview as ReviewData } from '@/pip/lib/pipClaude'

interface WritingReviewProps {
  review: ReviewData
}

function scoreColor(score: number): string {
  if (score >= 7) return '#7C9B7A'
  if (score >= 4) return '#C8873A'
  return '#C0392B'
}

function seoStatusColor(status: string): string {
  if (status === 'Good') return '#7C9B7A'
  if (status === 'OK') return '#C8873A'
  return '#C0392B'
}

const TAG_COLORS: Record<string, string> = {
  Voice: '#8B5CF6',
  Structure: '#3B82F6',
  Tone: '#C8873A',
  Tense: '#EF4444',
}

const stagger = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' },
  }),
}

export function WritingReview({ review }: WritingReviewProps) {
  let idx = 0

  return (
    <div className="space-y-6">
      {/* ── Score gauges ── */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        custom={idx++}
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {(['voice', 'clarity', 'seo'] as const).map((key) => {
          const score = review.scores[key]
          const color = scoreColor(score)
          return (
            <div
              key={key}
              className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
            >
              <div
                className="text-3xl font-bold"
                style={{ color }}
              >
                {score}
              </div>
              <div className="text-xs text-white/50 uppercase tracking-wider mt-1 capitalize">
                {key}
              </div>
              {/* Bar */}
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${score * 10}%` }}
                  transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* ── What's working ── */}
      {review.working.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
            What's working
          </h3>
          {review.working.map((strength, i) => (
            <motion.div
              key={i}
              custom={idx++}
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="rounded-xl p-4"
              style={{
                backgroundColor: 'rgba(124, 155, 122, 0.1)',
                border: '1px solid rgba(124, 155, 122, 0.25)',
              }}
            >
              <p className="text-sm leading-relaxed text-white/80">{strength}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Flags ── */}
      {review.flags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
            Flags
          </h3>
          {review.flags.map((flag, i) => (
            <motion.div
              key={i}
              custom={idx++}
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="rounded-xl p-4"
              style={{
                backgroundColor: 'rgba(200, 135, 58, 0.1)',
                border: '1px solid rgba(200, 135, 58, 0.25)',
              }}
            >
              <p className="text-sm italic text-white/50 mb-2">"{flag.quote}"</p>
              <p className="text-sm leading-relaxed text-white/80">{flag.note}</p>
              <span
                className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${TAG_COLORS[flag.tag] ?? '#666'}22`,
                  color: TAG_COLORS[flag.tag] ?? '#999',
                }}
              >
                {flag.tag}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── SEO ── */}
      <motion.div
        custom={idx++}
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
          SEO
        </h3>
        <div className="bg-white/5 border border-white/10 rounded-xl divide-y divide-white/5">
          {([
            { label: 'Headline', text: review.seo.headline, status: review.seo.headlineScore },
            { label: 'Keywords', text: review.seo.keywords, status: review.seo.keywordsScore },
            { label: 'Depth', text: review.seo.depth, status: review.seo.depthScore },
          ] as const).map((row) => (
            <div key={row.label} className="flex items-start gap-3 px-4 py-3">
              <span
                className="shrink-0 mt-0.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${seoStatusColor(row.status)}22`,
                  color: seoStatusColor(row.status),
                }}
              >
                {row.status}
              </span>
              <div>
                <div className="text-xs font-semibold text-white/60">{row.label}</div>
                <p className="text-sm text-white/80 mt-0.5">{row.text}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── The Find ── */}
      <motion.div
        custom={idx++}
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="rounded-xl p-5"
        style={{
          backgroundColor: 'rgba(124, 155, 122, 0.08)',
          border: '1.5px solid rgba(124, 155, 122, 0.3)',
        }}
      >
        <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7C9B7A' }}>
          The Find
        </h3>
        <p className="text-sm leading-relaxed text-white/90">{review.find}</p>
      </motion.div>
    </div>
  )
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/pip/components/WritingReview.tsx
git commit -m "feat(pip): add WritingReview results component"
```

---

### Task 4: PipWriting view — input + results

**Files:**
- Create: `src/pip/views/PipWriting.tsx`

**Context:** Main view component. Two states: input (textarea + button) and results (WritingReview component). Uses `PipSpeech` for the intro bubble (existing component at `src/pip/components/PipSpeech.tsx`). Calls `reviewDraft()` from `pipClaude.ts`. Dark Pip theme — all other views use white text on dark bg.

**Step 1: Create PipWriting view**

Create `src/pip/views/PipWriting.tsx`:

```typescript
'use client'
/* ──────────────────────────────────────────────
   Pip Dashboard v2 — Writing Review
   Beth pastes a draft, Pip gives structured
   editorial feedback.
   ────────────────────────────────────────────── */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { PipSpeech } from '@/pip/components/PipSpeech'
import { WritingReview } from '@/pip/components/WritingReview'
import { reviewDraft } from '@/pip/lib/pipClaude'
import type { WritingReview as ReviewData } from '@/pip/lib/pipClaude'

export default function PipWriting() {
  const [headline, setHeadline] = useState('')
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [review, setReview] = useState<ReviewData | null>(null)

  const handleReview = async () => {
    if (!draft.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result = await reviewDraft(draft.trim(), headline.trim() || undefined)
      setReview(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setReview(null)
    setError(null)
    setHeadline('')
    setDraft('')
  }

  // Word count
  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-white mb-4">Writing Review</h1>

      {!review ? (
        <>
          <PipSpeech
            message="Paste a draft and I'll take a look. I'll tell you what's working, what to watch, and give you one thing to go looking for."
            className="mb-6"
          />

          {/* Headline (optional) */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">
              Headline (optional — helps with SEO scoring)
            </label>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Your article headline…"
              disabled={loading}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/25 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Draft textarea */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">
              Draft
            </label>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Paste your draft here…"
              rows={14}
              disabled={loading}
              className="w-full resize-y rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm leading-relaxed text-white placeholder:text-white/30 outline-none focus:border-white/25 transition-colors disabled:opacity-50"
            />
            <div className="mt-1 text-right text-xs text-white/30">
              {wordCount > 0 && `${wordCount} words`}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleReview}
            disabled={!draft.trim() || loading}
            className="rounded-full bg-[#7C9B7A] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-[1px] active:translate-y-[1px] disabled:opacity-40 disabled:hover:translate-y-0 flex items-center gap-2"
            style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.2)' }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Reviewing…' : 'Review'}
          </button>
        </>
      ) : (
        <>
          {/* Results */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={handleReset}
              className="mb-6 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              ← Review another
            </button>

            <WritingReview review={review} />
          </motion.div>
        </>
      )}
    </div>
  )
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/pip/views/PipWriting.tsx
git commit -m "feat(pip): add PipWriting view with input and results states"
```

---

### Task 5: Build verification

**Step 1: Full build check**

```bash
npm run build
```

Expected: clean build, `/pip/writing` appears in the route list.

**Step 2: Manual smoke test**

Visit `http://localhost:3000/pip/writing` and verify:
- "Writing" appears in the Pip sidebar with pen icon
- PipSpeech intro bubble renders
- Headline input and draft textarea visible
- Word count updates as you type
- Button disabled when draft empty
- Paste a short test draft and click "Review"
- Loading spinner shows
- Results render: three score gauges, working cards (green), flag cards (amber), SEO checklist, The Find callout
- "Review another" button resets to input state

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix(pip): polish writing assistant from smoke test"
```
