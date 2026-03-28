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
