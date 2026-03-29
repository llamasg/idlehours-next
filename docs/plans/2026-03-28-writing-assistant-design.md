# Beth's Writing Assistant — Design

**Date:** 2026-03-28
**Branch:** main
**Status:** Approved, ready for implementation

---

## Overview

A writing review tool inside Pip (`/pip/writing`) where Beth pastes a draft and gets structured editorial feedback from Claude. Card-based results UI showing scores, strengths, flags, SEO assessment, and a single actionable "find" challenge.

## Architecture

- **Route:** `/pip/writing` — new sidebar nav item in existing Pip dashboard
- **API:** Client-side Claude call via `pipClaude.ts` (`dangerouslyAllowBrowser: true`, `NEXT_PUBLIC_ANTHROPIC_API_KEY`)
- **Model:** `claude-sonnet-4-6` (editorial quality reasoning)
- **System prompt:** Full prompt from `docs/plans/beths writing assistantprompt.md`
- **No persistence** — stateless paste-and-review flow

## Files

```
src/app/pip/writing/page.tsx        — route wrapper
src/pip/views/PipWriting.tsx        — main view (input + results)
src/pip/components/WritingReview.tsx — renders structured JSON feedback
src/pip/lib/pipClaude.ts            — add reviewDraft() function
src/pip/PipLayout.tsx               — add "Writing" nav item
```

## Claude Integration

New function in `pipClaude.ts`:

```typescript
async function reviewDraft(draft: string, headline?: string): Promise<WritingReview>
```

- System message: full editorial prompt from the .md file
- User message: the draft text (with headline if provided)
- Response: JSON parsed into `WritingReview` type
- Model: `claude-sonnet-4-6`, max_tokens: 2000

## Response Type

```typescript
interface WritingReview {
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
```

## UI States

**Input state:**
- Heading + Pip speech bubble intro
- Optional headline text input
- Large textarea for draft
- "Review" button (blue primary, disabled while empty)
- Loading: spinner on button, textarea disabled

**Results state:**
- "Review another" reset button
- Score gauges: Voice / Clarity / SEO (1-10), colour-coded
- What's working: green-tinted cards with strength observations
- Flags: amber-tinted cards with quoted text, note, tag pill (max 4)
- SEO checklist: Headline / Keywords / Depth with status pills
- The Find: accent green callout card — single actionable challenge

## Visual Style

- Follows existing Pip dark theme (`#1a1a2e` bg, `bg-white/5` cards, `border-white/10`)
- Green strengths: `#7C9B7A` (Pip accent)
- Amber flags: `#C8873A`
- Score colours: green 7+ / amber 4-6 / red 1-3
- SEO pills: Good=green, OK=amber, Needs work=red
