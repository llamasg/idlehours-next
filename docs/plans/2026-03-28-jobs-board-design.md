# /jobs — Internal Kanban Job Board

**Date:** 2026-03-28
**Branch:** main
**Status:** Approved design, ready for implementation

---

## Overview

Internal-only Kanban board at `/jobs` for tracking remaining launch tasks. Backed by Supabase, styled with Idle Hours design tokens. Suppressed from production via `notFound()`. Throwaway page — deleted before launch.

## Architecture Decisions

- **No drag-and-drop** — column changes via dropdown selector on card and in detail modal. Simpler, works on mobile, adequate for single-user internal tool.
- **No new dependencies** — uses existing Supabase client, Framer Motion, Tailwind + design tokens.
- **Optimistic UI** — local state updated immediately, Supabase confirms async. Single `useState<Job[]>` in JobBoard.
- **No auth** — page suppressed in production entirely.

## Supabase Schema

```sql
create table jobs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  "column" text not null check ("column" in ('website', 'revenue', 'marketing')),
  status text not null default 'active' check (status in ('active', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  progress text default null,
  body text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## File Structure

```
src/app/jobs/
  page.tsx              — prod guard (notFound), renders JobBoard
  layout.tsx            — minimal wrapper, no Header/Footer
src/components/jobs/
  JobBoard.tsx          — 'use client', columns + archive toggle + state
  JobColumn.tsx         — column header, scrollable card list, add button
  JobCard.tsx           — compact card with priority pip, progress, actions
  JobModal.tsx          — create/edit modal with markdown body + preview
  JobArchive.tsx        — flat list of done jobs
src/lib/jobs.ts         — Supabase CRUD helpers
scripts/seed-jobs.ts    — one-time seed from strategy doc
```

## Visual Design

- **Page bg:** `hsl(var(--game-cream))`
- **Cards:** `bg-[hsl(var(--game-white))]`, `border-[1.5px] border-[hsl(var(--game-ink))]/10`, shadow `0_3px_0_hsl(var(--game-cream-dark)),0_6px_20px_rgba(0,0,0,0.06)`, `rounded-xl`
- **Hover:** `-translate-y-[2px]` with spring easing
- **Column headers:** Montserrat 800, uppercase, small
- **Priority pips:** Red `var(--game-red)`, Amber `var(--game-amber)`, Grey `var(--game-ink-dim)`
- **Progress notes:** Italic, `var(--game-ink-light)`, prefixed `↻`
- **Buttons:** Ink primary (save, done), blue pill (new job), ghost (secondary)
- **Modal:** Full-screen overlay, centered panel, Framer Motion fade+scale
- **Typography:** Montserrat headings, DM Mono body/metadata

## Data Flow

1. `JobBoard` mounts → `getJobs()` fetches all rows
2. State: single `Job[]` array, filtered by column/status for rendering
3. Mutations: optimistic update local state → await Supabase → rollback on error
4. No real-time subscriptions (single user)

## Seeding

~40 active jobs + ~7 done items parsed from `idle-hours-strategy.md`. Seed script extracts:
- Title from markdown heading
- Column from `[COLUMN]` tag
- Body from paragraph text
- Progress notes where present
- Priority defaults to medium

## Production Suppression

- `page.tsx`: `if (process.env.NODE_ENV === 'production') notFound()`
- Add `/jobs` to `public/robots.txt` Disallow
