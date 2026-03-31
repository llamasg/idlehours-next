# /jobs Board Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an internal Kanban job board at `/jobs` backed by Supabase, styled with Idle Hours design tokens, seeded with ~40 launch tasks.

**Architecture:** Client-side React board with three columns (website/revenue/marketing), optimistic Supabase mutations, Framer Motion modals. No drag-and-drop — column changes via dropdown. Suppressed from production.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, Supabase (existing client), Framer Motion

**Design doc:** `docs/plans/2026-03-28-jobs-board-design.md`

---

### Task 1: Supabase Schema + CRUD Helpers

**Files:**
- Create: `src/lib/jobs.ts`

**Context:** The Supabase client lives at `src/lib/supabase.ts` and exports `supabase` (nullable — returns `null` if env vars missing). All queries must guard with `if (!supabase) return`.

**Step 1: Create the `jobs` table in Supabase**

Run this SQL in the Supabase dashboard (project `fdoeaoodocaxcapsiiaa`):

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

-- Allow anon reads/writes (internal tool, no RLS needed)
alter table jobs enable row level security;
create policy "Allow all" on jobs for all using (true) with check (true);
```

**Step 2: Write the CRUD helpers**

Create `src/lib/jobs.ts`:

```typescript
import { supabase } from './supabase'

export interface Job {
  id: string
  title: string
  column: 'website' | 'revenue' | 'marketing'
  status: 'active' | 'done'
  priority: 'low' | 'medium' | 'high'
  progress: string | null
  body: string
  created_at: string
  updated_at: string
}

export type JobCreate = Pick<Job, 'title' | 'column'> &
  Partial<Pick<Job, 'priority' | 'progress' | 'body'>>

export type JobUpdate = Partial<
  Pick<Job, 'title' | 'column' | 'status' | 'priority' | 'progress' | 'body'>
>

export async function getJobs(): Promise<Job[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) { console.error('getJobs error:', error); return [] }
  return data as Job[]
}

export async function createJob(job: JobCreate): Promise<Job | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('jobs')
    .insert(job)
    .select()
    .single()
  if (error) { console.error('createJob error:', error); return null }
  return data as Job
}

export async function updateJob(id: string, updates: JobUpdate): Promise<Job | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('jobs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) { console.error('updateJob error:', error); return null }
  return data as Job
}

export async function deleteJob(id: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('jobs').delete().eq('id', id)
  if (error) { console.error('deleteJob error:', error); return false }
  return true
}
```

**Step 3: Commit**

```bash
git add src/lib/jobs.ts
git commit -m "feat(jobs): add Supabase CRUD helpers for jobs table"
```

---

### Task 2: Route + Layout

**Files:**
- Create: `src/app/jobs/layout.tsx`
- Create: `src/app/jobs/page.tsx`
- Create or modify: `public/robots.txt`

**Step 1: Create the layout**

Create `src/app/jobs/layout.tsx`:

```typescript
import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Jobs — Idle Hours', robots: 'noindex, nofollow' }

export default function JobsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="game-container min-h-screen bg-[hsl(var(--game-cream))]">
      {children}
    </div>
  )
}
```

Note: `game-container` class forces light mode even when site is in dark mode (see globals.css).

**Step 2: Create the page with prod guard**

Create `src/app/jobs/page.tsx`:

```typescript
import { notFound } from 'next/navigation'
import JobBoard from '@/components/jobs/JobBoard'

export default function JobsPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <JobBoard />
}
```

**Step 3: Create robots.txt**

Create `public/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /pip/
Disallow: /jobs
Disallow: /testing
```

**Step 4: Commit**

```bash
git add src/app/jobs/layout.tsx src/app/jobs/page.tsx public/robots.txt
git commit -m "feat(jobs): add /jobs route with prod guard and robots.txt"
```

---

### Task 3: JobBoard — Main State Container

**Files:**
- Create: `src/components/jobs/JobBoard.tsx`

**Context:** This is the top-level client component. It owns all job state and passes callbacks down. Three columns for active view, flat list for archive view.

**Step 1: Create JobBoard**

Create `src/components/jobs/JobBoard.tsx`:

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { getJobs, createJob, updateJob, deleteJob } from '@/lib/jobs'
import type { Job, JobCreate, JobUpdate } from '@/lib/jobs'
import JobColumn from './JobColumn'
import JobArchive from './JobArchive'
import JobModal from './JobModal'

const COLUMNS = [
  { key: 'website' as const, label: 'Website', description: 'Features, bugs, build tasks' },
  { key: 'revenue' as const, label: 'Revenue', description: 'Affiliate, sponsorship, monetisation' },
  { key: 'marketing' as const, label: 'Marketing', description: 'SEO, social, content, press' },
]

export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showArchive, setShowArchive] = useState(false)
  const [modalJob, setModalJob] = useState<Job | null>(null)       // editing existing
  const [modalColumn, setModalColumn] = useState<Job['column'] | null>(null) // creating new

  useEffect(() => {
    getJobs().then((data) => { setJobs(data); setLoading(false) })
  }, [])

  const activeJobs = jobs.filter((j) => j.status === 'active')
  const doneJobs = jobs.filter((j) => j.status === 'done')

  // --- Mutations (optimistic) ---

  const handleCreate = useCallback(async (data: JobCreate) => {
    const tempId = crypto.randomUUID()
    const optimistic: Job = {
      id: tempId,
      title: data.title,
      column: data.column,
      status: 'active',
      priority: data.priority ?? 'medium',
      progress: data.progress ?? null,
      body: data.body ?? '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setJobs((prev) => [...prev, optimistic])
    const real = await createJob(data)
    if (real) {
      setJobs((prev) => prev.map((j) => (j.id === tempId ? real : j)))
    } else {
      setJobs((prev) => prev.filter((j) => j.id !== tempId))
    }
  }, [])

  const handleUpdate = useCallback(async (id: string, updates: JobUpdate) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)))
    const real = await updateJob(id, updates)
    if (real) {
      setJobs((prev) => prev.map((j) => (j.id === id ? real : j)))
    }
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    const backup = jobs.find((j) => j.id === id)
    setJobs((prev) => prev.filter((j) => j.id !== id))
    const ok = await deleteJob(id)
    if (!ok && backup) {
      setJobs((prev) => [...prev, backup])
    }
  }, [jobs])

  const handleArchive = useCallback((id: string) => handleUpdate(id, { status: 'done' }), [handleUpdate])
  const handleRestore = useCallback((id: string) => handleUpdate(id, { status: 'active' }), [handleUpdate])

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-[11px] font-[900] uppercase tracking-[0.2em] text-[hsl(var(--game-ink))]">
            Jobs
          </h1>
          <p className="mt-1 font-body text-[12px] text-[hsl(var(--game-ink-light))]">
            Idle Hours internal board — not public
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchive(!showArchive)}
            className="rounded-full border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] px-5 py-2 font-heading text-[12px] font-[700] text-[hsl(var(--game-ink))] transition-all duration-200 hover:-translate-y-[1px]"
            style={{ boxShadow: '0 3px 0 hsl(var(--game-cream-dark))' }}
          >
            {showArchive ? '← Board' : 'Archive'}
          </button>
          <button
            onClick={() => setModalColumn('website')}
            className="rounded-full bg-[hsl(var(--game-blue))] px-5 py-2 font-heading text-[12px] font-[800] text-white transition-all duration-200 hover:-translate-y-[2px] active:translate-y-[1px]"
            style={{ boxShadow: '0 4px 0 hsl(var(--game-blue-dark))' }}
          >
            + New Job
          </button>
        </div>
      </div>

      {loading ? (
        <p className="py-20 text-center font-body text-[13px] text-[hsl(var(--game-ink-light))]">Loading…</p>
      ) : showArchive ? (
        <JobArchive jobs={doneJobs} onRestore={handleRestore} onDelete={handleDelete} onOpen={setModalJob} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {COLUMNS.map((col) => (
            <JobColumn
              key={col.key}
              label={col.label}
              description={col.description}
              jobs={activeJobs.filter((j) => j.column === col.key)}
              onOpen={setModalJob}
              onArchive={handleArchive}
              onAdd={() => setModalColumn(col.key)}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      {modalColumn && !modalJob && (
        <JobModal
          mode="create"
          defaultColumn={modalColumn}
          onSave={(data) => { handleCreate(data); setModalColumn(null) }}
          onClose={() => setModalColumn(null)}
        />
      )}

      {/* Edit modal */}
      {modalJob && (
        <JobModal
          mode="edit"
          job={modalJob}
          onSave={(data) => { handleUpdate(modalJob.id, data); setModalJob(null) }}
          onArchive={() => { handleArchive(modalJob.id); setModalJob(null) }}
          onDelete={() => { handleDelete(modalJob.id); setModalJob(null) }}
          onClose={() => setModalJob(null)}
        />
      )}
    </div>
  )
}
```

**Step 2: Create placeholder components so it compiles**

Create minimal stubs for `JobColumn.tsx`, `JobCard.tsx`, `JobArchive.tsx`, `JobModal.tsx` — just enough to avoid import errors. Each should be `'use client'` and export a default function that renders a placeholder `<div>`.

**Step 3: Verify build**

```bash
npm run build
```

Expected: build passes with no errors.

**Step 4: Commit**

```bash
git add src/components/jobs/
git commit -m "feat(jobs): add JobBoard state container with optimistic mutations"
```

---

### Task 4: JobColumn + JobCard

**Files:**
- Create/replace: `src/components/jobs/JobColumn.tsx`
- Create/replace: `src/components/jobs/JobCard.tsx`

**Step 1: Build JobCard**

Replace `src/components/jobs/JobCard.tsx`:

```typescript
'use client'

import type { Job } from '@/lib/jobs'

const PRIORITY_COLORS: Record<Job['priority'], string> = {
  high: 'bg-[hsl(var(--game-red))]',
  medium: 'bg-[hsl(var(--game-amber))]',
  low: 'bg-[hsl(var(--game-ink-dim))]',
}

interface JobCardProps {
  job: Job
  onOpen: (job: Job) => void
  onArchive: (id: string) => void
}

export default function JobCard({ job, onOpen, onArchive }: JobCardProps) {
  return (
    <div
      className="group relative rounded-xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-4 transition-all duration-200 hover:-translate-y-[2px]"
      style={{
        boxShadow: '0 3px 0 hsl(var(--game-cream-dark)), 0 6px 20px rgba(0,0,0,0.06)',
        transitionTimingFunction: 'cubic-bezier(0.34, 1.5, 0.64, 1)',
      }}
    >
      {/* Priority pip */}
      <span className={`absolute right-3 top-3 h-2.5 w-2.5 rounded-full ${PRIORITY_COLORS[job.priority]}`} />

      <h3
        className="cursor-pointer pr-6 font-heading text-[14px] font-[700] leading-snug text-[hsl(var(--game-ink))]"
        onClick={() => onOpen(job)}
      >
        {job.title}
      </h3>

      {job.progress && (
        <p className="mt-1.5 font-body text-[11px] italic text-[hsl(var(--game-ink-light))]">
          ↻ {job.progress}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => onOpen(job)}
          className="rounded-full bg-[hsl(var(--game-ink))]/5 px-3 py-1 font-heading text-[10px] font-[700] text-[hsl(var(--game-ink-light))] transition-colors hover:bg-[hsl(var(--game-ink))]/10 hover:text-[hsl(var(--game-ink))]"
        >
          Open
        </button>
        <button
          onClick={() => onArchive(job.id)}
          className="rounded-full bg-[hsl(var(--game-green))]/10 px-3 py-1 font-heading text-[10px] font-[700] text-[hsl(var(--game-green))] transition-colors hover:bg-[hsl(var(--game-green))]/20"
        >
          Done ✓
        </button>
      </div>
    </div>
  )
}
```

**Step 2: Build JobColumn**

Replace `src/components/jobs/JobColumn.tsx`:

```typescript
'use client'

import type { Job } from '@/lib/jobs'
import JobCard from './JobCard'

interface JobColumnProps {
  label: string
  description: string
  jobs: Job[]
  onOpen: (job: Job) => void
  onArchive: (id: string) => void
  onAdd: () => void
}

export default function JobColumn({ label, description, jobs, onOpen, onArchive, onAdd }: JobColumnProps) {
  return (
    <div className="flex flex-col">
      {/* Column header */}
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="font-heading text-[11px] font-[900] uppercase tracking-[0.18em] text-[hsl(var(--game-ink))]">
            {label}
          </h2>
          <p className="mt-0.5 font-body text-[10px] text-[hsl(var(--game-ink-light))]">{description}</p>
        </div>
        <span className="rounded-full bg-[hsl(var(--game-ink))]/8 px-2.5 py-0.5 font-heading text-[10px] font-[800] text-[hsl(var(--game-ink-light))]">
          {jobs.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-1 flex-col gap-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onOpen={onOpen} onArchive={onArchive} />
        ))}
      </div>

      {/* Add button */}
      <button
        onClick={onAdd}
        className="mt-4 w-full rounded-xl border-[1.5px] border-dashed border-[hsl(var(--game-ink))]/10 py-3 font-heading text-[11px] font-[700] text-[hsl(var(--game-ink-light))] transition-colors hover:border-[hsl(var(--game-ink))]/25 hover:text-[hsl(var(--game-ink))]"
      >
        + Add
      </button>
    </div>
  )
}
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/components/jobs/JobColumn.tsx src/components/jobs/JobCard.tsx
git commit -m "feat(jobs): add JobColumn and JobCard components"
```

---

### Task 5: JobModal — Create & Edit

**Files:**
- Create/replace: `src/components/jobs/JobModal.tsx`

**Context:** Single modal component handles both create and edit modes. Uses Framer Motion for overlay animation. Textarea for markdown body with a toggle-able preview. Copy-to-clipboard button for the body.

**Step 1: Build JobModal**

Replace `src/components/jobs/JobModal.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Job, JobCreate, JobUpdate } from '@/lib/jobs'

type ModalProps =
  | {
      mode: 'create'
      defaultColumn: Job['column']
      job?: undefined
      onSave: (data: JobCreate) => void
      onArchive?: undefined
      onDelete?: undefined
      onClose: () => void
    }
  | {
      mode: 'edit'
      defaultColumn?: undefined
      job: Job
      onSave: (data: JobUpdate) => void
      onArchive: () => void
      onDelete: () => void
      onClose: () => void
    }

const COLUMNS: { key: Job['column']; label: string }[] = [
  { key: 'website', label: 'Website' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'marketing', label: 'Marketing' },
]

const PRIORITIES: { key: Job['priority']; label: string }[] = [
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
]

export default function JobModal(props: ModalProps) {
  const { mode, onSave, onClose } = props

  const [title, setTitle] = useState(mode === 'edit' ? props.job.title : '')
  const [column, setColumn] = useState<Job['column']>(
    mode === 'edit' ? props.job.column : props.defaultColumn
  )
  const [priority, setPriority] = useState<Job['priority']>(
    mode === 'edit' ? props.job.priority : 'medium'
  )
  const [progress, setProgress] = useState(
    mode === 'edit' ? props.job.progress ?? '' : ''
  )
  const [body, setBody] = useState(mode === 'edit' ? props.job.body : '')
  const [showPreview, setShowPreview] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSave = () => {
    if (!title.trim()) return
    if (mode === 'create') {
      onSave({ title: title.trim(), column, priority, progress: progress || undefined, body })
    } else {
      onSave({ title: title.trim(), column, priority, progress: progress || null, body } as JobUpdate)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(body)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  // Simple markdown→HTML for preview (headings, bold, italic, lists, code blocks)
  const renderMarkdown = (md: string) => {
    let html = md
      .replace(/```([\s\S]*?)```/g, '<pre class="my-2 rounded-lg bg-[hsl(var(--game-ink))]/5 p-3 font-body text-[12px]"><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="rounded bg-[hsl(var(--game-ink))]/5 px-1 py-0.5 text-[12px]">$1</code>')
      .replace(/^### (.+)$/gm, '<h3 class="mt-3 mb-1 font-heading text-[14px] font-[700]">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="mt-4 mb-1 font-heading text-[16px] font-[800]">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="mt-4 mb-2 font-heading text-[18px] font-[900]">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
      .replace(/\n/g, '<br/>')
    return html
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-[3px] p-4 pt-[8vh]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.34, 1.5, 0.64, 1] }}
        className="relative w-full max-w-2xl rounded-2xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] p-6 sm:p-8"
        style={{ boxShadow: '0 3px 0 hsl(var(--game-cream-dark)), 0 20px 60px rgba(0,0,0,0.15)' }}
      >
        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Job title…"
          className="w-full border-none bg-transparent font-heading text-[20px] font-[800] text-[hsl(var(--game-ink))] placeholder:text-[hsl(var(--game-ink-dim))] outline-none"
          autoFocus
        />

        {/* Selectors row */}
        <div className="mt-4 flex flex-wrap gap-3">
          {/* Column */}
          <select
            value={column}
            onChange={(e) => setColumn(e.target.value as Job['column'])}
            className="rounded-full border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] px-4 py-1.5 font-heading text-[11px] font-[700] text-[hsl(var(--game-ink))] outline-none"
          >
            {COLUMNS.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>

          {/* Priority */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Job['priority'])}
            className="rounded-full border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] px-4 py-1.5 font-heading text-[11px] font-[700] text-[hsl(var(--game-ink))] outline-none"
          >
            {PRIORITIES.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Progress */}
        <input
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
          placeholder="Add a status note…"
          className="mt-4 w-full rounded-xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))]/50 px-4 py-2.5 font-body text-[12px] text-[hsl(var(--game-ink))] placeholder:text-[hsl(var(--game-ink-dim))] outline-none"
        />

        {/* Body */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-heading text-[10px] font-[800] uppercase tracking-[0.15em] text-[hsl(var(--game-ink-light))]">
              Body
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="font-heading text-[10px] font-[700] text-[hsl(var(--game-blue))] hover:underline"
              >
                {showPreview ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={handleCopy}
                className="font-heading text-[10px] font-[700] text-[hsl(var(--game-ink-light))] hover:text-[hsl(var(--game-ink))]"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {showPreview ? (
            <div
              className="min-h-[200px] rounded-xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))]/30 p-4 font-body text-[13px] leading-relaxed text-[hsl(var(--game-ink))]"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
            />
          ) : (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Markdown body — this is the brief…"
              rows={10}
              className="w-full resize-y rounded-xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))]/30 p-4 font-body text-[13px] leading-relaxed text-[hsl(var(--game-ink))] placeholder:text-[hsl(var(--game-ink-dim))] outline-none"
            />
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {mode === 'edit' && (
              <>
                <button
                  onClick={() => props.onArchive()}
                  className="rounded-full bg-[hsl(var(--game-green))]/10 px-5 py-2 font-heading text-[11px] font-[700] text-[hsl(var(--game-green))] transition-colors hover:bg-[hsl(var(--game-green))]/20"
                >
                  Move to Done
                </button>
                <button
                  onClick={() => {
                    if (confirmDelete) props.onDelete()
                    else setConfirmDelete(true)
                  }}
                  className="rounded-full bg-[hsl(var(--game-red))]/10 px-5 py-2 font-heading text-[11px] font-[700] text-[hsl(var(--game-red))] transition-colors hover:bg-[hsl(var(--game-red))]/20"
                >
                  {confirmDelete ? 'Confirm Delete' : 'Delete'}
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-full px-5 py-2 font-heading text-[11px] font-[700] text-[hsl(var(--game-ink-light))] transition-colors hover:text-[hsl(var(--game-ink))]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="rounded-full bg-[hsl(var(--game-ink))] px-5 py-2 font-heading text-[11px] font-[800] text-[hsl(var(--game-cream))] transition-all duration-200 hover:-translate-y-[1px] disabled:opacity-40"
              style={{ boxShadow: '0 3px 0 rgba(0,0,0,0.4)' }}
            >
              {mode === 'create' ? 'Create' : 'Save'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/components/jobs/JobModal.tsx
git commit -m "feat(jobs): add JobModal with markdown editor and preview"
```

---

### Task 6: JobArchive

**Files:**
- Create/replace: `src/components/jobs/JobArchive.tsx`

**Step 1: Build JobArchive**

Replace `src/components/jobs/JobArchive.tsx`:

```typescript
'use client'

import type { Job } from '@/lib/jobs'

const COL_LABELS: Record<Job['column'], string> = {
  website: 'Website',
  revenue: 'Revenue',
  marketing: 'Marketing',
}

const COL_COLORS: Record<Job['column'], string> = {
  website: 'bg-[hsl(var(--game-blue))]/10 text-[hsl(var(--game-blue))]',
  revenue: 'bg-[hsl(var(--game-amber))]/10 text-[hsl(var(--game-amber))]',
  marketing: 'bg-[hsl(var(--game-green))]/10 text-[hsl(var(--game-green))]',
}

interface JobArchiveProps {
  jobs: Job[]
  onRestore: (id: string) => void
  onDelete: (id: string) => void
  onOpen: (job: Job) => void
}

export default function JobArchive({ jobs, onRestore, onDelete, onOpen }: JobArchiveProps) {
  if (jobs.length === 0) {
    return (
      <p className="py-20 text-center font-body text-[13px] text-[hsl(var(--game-ink-light))]">
        No archived jobs yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="mb-4 font-heading text-[11px] font-[900] uppercase tracking-[0.18em] text-[hsl(var(--game-ink))]">
        Done ({jobs.length})
      </h2>
      {jobs.map((job) => (
        <div
          key={job.id}
          className="flex items-center gap-4 rounded-xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] px-4 py-3"
          style={{ boxShadow: '0 2px 0 hsl(var(--game-cream-dark))' }}
        >
          <button
            onClick={() => onOpen(job)}
            className="flex-1 text-left font-heading text-[13px] font-[700] text-[hsl(var(--game-ink))] hover:underline"
          >
            {job.title}
          </button>
          <span className={`rounded-full px-2.5 py-0.5 font-heading text-[9px] font-[800] uppercase tracking-wider ${COL_COLORS[job.column]}`}>
            {COL_LABELS[job.column]}
          </span>
          <span className="font-body text-[10px] text-[hsl(var(--game-ink-dim))]">
            {new Date(job.updated_at).toLocaleDateString()}
          </span>
          <button
            onClick={() => onRestore(job.id)}
            className="rounded-full bg-[hsl(var(--game-blue))]/10 px-3 py-1 font-heading text-[10px] font-[700] text-[hsl(var(--game-blue))] hover:bg-[hsl(var(--game-blue))]/20"
          >
            Restore
          </button>
          <button
            onClick={() => onDelete(job.id)}
            className="rounded-full bg-[hsl(var(--game-red))]/10 px-3 py-1 font-heading text-[10px] font-[700] text-[hsl(var(--game-red))] hover:bg-[hsl(var(--game-red))]/20"
          >
            Delete
          </button>
        </div>
      ))}
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
git add src/components/jobs/JobArchive.tsx
git commit -m "feat(jobs): add JobArchive done pile view"
```

---

### Task 7: Seed Script

**Files:**
- Create: `scripts/seed-jobs.ts`

**Context:** Parse the strategy document (`idle-hours-strategy.md` provided by user) and insert all ~40 active jobs + ~7 done items into Supabase. Run once with `npx tsx scripts/seed-jobs.ts`.

**Step 1: Write the seed script**

Create `scripts/seed-jobs.ts` that:
1. Imports the Supabase client directly (using `@supabase/supabase-js` with env vars from dotenv)
2. Defines all jobs as an array of objects — hardcoded from the strategy doc rather than parsing markdown (more reliable)
3. Each job has: `title`, `column`, `status`, `priority`, `progress` (if any), `body`
4. Inserts in one batch via `.insert()`
5. Reports count of inserted rows

The jobs array should contain every item from the strategy document's three columns plus the done archive items. Extract the body text from each entry (the paragraph under the heading). Extract progress notes where the doc has "Progress: ..." lines.

**Priority mapping:**
- Default: `medium`
- Core build items (homepage, about, game sense mobile, game sense archive, posts index): `high`
- Future/speculative items (Three.js room, automated feeds): `low`
- Revenue outreach that hasn't started: `medium`
- Marketing pre-launch items: `medium`

**Step 2: Run the seed**

```bash
npx tsx scripts/seed-jobs.ts
```

Expected: "Inserted X jobs" with no errors.

**Step 3: Verify in browser**

Visit `http://localhost:3000/jobs` — should see all seeded jobs distributed across three columns.

**Step 4: Commit**

```bash
git add scripts/seed-jobs.ts
git commit -m "feat(jobs): add seed script with all launch tasks from strategy doc"
```

---

### Task 8: Build Verification + Final Polish

**Step 1: Full build check**

```bash
npm run build
```

Expected: clean build, no errors.

**Step 2: Manual smoke test**

Visit `/jobs` and verify:
- Three columns render with correct jobs
- Cards show title, priority pip, progress notes
- "Open" opens edit modal with all fields populated
- "Done ✓" moves card to archive
- Archive toggle shows done pile
- Restore returns job to board
- "+ New Job" creates job with correct column
- "+ Add" on column creates job pre-set to that column
- Copy button copies markdown body to clipboard
- Markdown preview renders headings, bold, lists, code blocks
- Delete requires two clicks (confirm)
- Escape closes modal

**Step 3: Commit any fixes from smoke test**

```bash
git add -A
git commit -m "fix(jobs): polish from smoke test"
```
