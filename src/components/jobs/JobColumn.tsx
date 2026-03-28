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

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onOpen={onOpen} onArchive={onArchive} />
        ))}
      </div>

      <button
        onClick={onAdd}
        className="mt-4 w-full rounded-xl border-[1.5px] border-dashed border-[hsl(var(--game-ink))]/10 py-3 font-heading text-[11px] font-[700] text-[hsl(var(--game-ink-light))] transition-colors hover:border-[hsl(var(--game-ink))]/25 hover:text-[hsl(var(--game-ink))]"
      >
        + Add
      </button>
    </div>
  )
}
