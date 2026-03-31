# Build /jobs — Idle Hours Internal Job Board

## Context

Idle Hours is a cozy games editorial and discovery platform (idlehours.co.uk). Stack: Next.js App Router, TypeScript, Tailwind CSS, Supabase, Sanity v5, GSAP, Framer Motion. This is an internal admin page — not public-facing. Suppress from production using `if (process.env.NODE_ENV === 'production') { notFound() }` and add `/jobs` to `robots.txt` Disallow.
---

## What to build

A Kanban-style job board at `/jobs` backed by Supabase. Three columns plus a Done archive. Each job is a card with a full markdown body — effectively a Claude Code prompt or brief that can be opened, copied and actioned.

---

## Supabase schema

Create a table called `jobs` with the following columns:

```sql
create table jobs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  column text not null check (column in ('website', 'revenue', 'marketing')),
  status text not null default 'active' check (status in ('active', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  progress text default null,
  body text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

`column` = which board column (website / revenue / marketing)
`status` = active (on the board) or done (in the archive)
`priority` = low / medium / high — shown as a coloured pip on the card
`progress` = freetext status note e.g. "Email sent, awaiting reply" — nullable
`body` = full markdown content — the brief/prompt for that job

---

## Page layout

### Header
- Page title: **Jobs** — small, caps, Montserrat 800
- Subtitle: "Idle Hours internal board — not public"
- Top right: **+ New Job** button (opens create modal)
- Top right: **Archive** toggle button — switches between board view and done pile

### Board view (default)
Three equal columns side by side:
- **Website** — features, bugs, build tasks
- **Revenue** — affiliate outreach, pitch decks, monetisation
- **Marketing** — SEO, social, content, blog

Each column has:
- Column header with name and job count badge
- Scrollable list of job cards
- **+ Add** button at the bottom of each column

### Job card (compact)
Each card shows:
- Title (bold, 14px)
- Priority pip — red (high) / amber (medium) / grey (low) — top right corner
- Progress note if set — italic, muted, small — e.g. "↻ Email sent, awaiting reply"
- Two action buttons: **Open** (opens detail modal) and **Done ✓** (moves to archive)
- Subtle hover state — lift shadow

### Job detail modal
Opens when clicking Open on a card. Full screen overlay. Contains:
- Title (editable inline on click)
- Column selector (website / revenue / marketing)
- Priority selector (low / medium / high)
- Progress field — single line text, placeholder "Add a status note…" — e.g. "Waiting on response from GOG affiliate team"
- Body — full markdown editor (use a simple textarea, render preview below it with basic markdown parsing — bold, italic, headings, lists, code blocks)
- **Copy body** button — copies the raw markdown to clipboard (so it can be pasted into Claude Code)
- **Save** button
- **Move to Done** button (red, bottom of modal)
- **Delete** button (destructive, requires confirm)

### Archive / Done pile
Toggled via the Archive button in the header. Shows all jobs with `status = 'done'` in a simple list (not columns). Each item shows title, original column tag, date completed. Two actions: **Restore** (moves back to active in its original column) and **Delete permanently**.

---

## Interactions

- Drag and drop between columns to change `column` value (use @dnd-kit/core — install if not present)
- Clicking **Done ✓** on a card sets `status = 'done'` and removes it from the board with a brief fade-out animation
- Clicking **Restore** in the archive sets `status = 'active'` and returns it to its column
- All changes persist to Supabase immediately (optimistic UI update, then confirm from DB)
- New job modal: title required, column required, body optional — can always be added later
- Mobile: columns stack vertically, drag and drop degrades gracefully to a column selector dropdown on the card

---

## Create / Edit modal fields

```
Title *
Column * (select: Website / Revenue / Marketing)
Priority (select: High / Medium / Low — default Medium)
Progress note (text, optional)
Body (textarea — markdown, optional)
```

---

## Supabase client

Use the existing Supabase client already configured in the project. All reads/writes go through the `jobs` table. No auth needed — this page is suppressed from production entirely.

---

## File structure

```
app/
  jobs/
    page.tsx           — main board page
    layout.tsx         — optional, suppress from prod here
components/
  jobs/
    JobBoard.tsx       — three column board
    JobCard.tsx        — individual card
    JobModal.tsx       — create/edit modal
    JobArchive.tsx     — done pile view
    JobColumn.tsx      — single column with header and add button
lib/
  jobs.ts              — Supabase CRUD helpers (getJobs, createJob, updateJob, deleteJob, archiveJob, restoreJob)
```

---

## Production suppression

In `app/jobs/page.tsx`:

```tsx
import { notFound } from 'next/navigation'

if (process.env.NODE_ENV === 'production') {
  notFound()
}
```

Add to `public/robots.txt`:
```
Disallow: /jobs
```

---

## Notes

- No authentication required — suppressed from prod entirely
- Keep the UI clean and fast — this is a tool Alfie uses daily
- The body/markdown field is the most important part of each job — it's the brief that gets copied into Claude Code. Make it easy to read and easy to copy.
- Progress notes are for tracking async things like "waiting on email reply" or "PR open, needs review" — they should be very visible on the card face
- Do not over-design — cream background, clean type, functional. Matches site tokens but utility-first.
