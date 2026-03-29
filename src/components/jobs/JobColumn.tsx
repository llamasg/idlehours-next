'use client'

import { useState, useMemo } from 'react'
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
  const [filterPath, setFilterPath] = useState<string[]>([])

  // Build unique segments at current filter depth
  const chipOptions = useMemo(() => {
    const prefix = filterPath.join('/')
    const segments = new Set<string>()

    for (const job of jobs) {
      if (!job.tag) continue
      const parts = job.tag.split('/')

      // Must match current filter path
      const matches = filterPath.every((seg, i) => parts[i]?.toLowerCase() === seg.toLowerCase())
      if (!matches) continue

      // Grab the next segment if it exists
      const next = parts[filterPath.length]
      if (next) segments.add(next)
    }

    return Array.from(segments).sort()
  }, [jobs, filterPath])

  // Filter jobs by current path
  const filteredJobs = useMemo(() => {
    if (filterPath.length === 0) return jobs
    const prefix = filterPath.join('/').toLowerCase()
    return jobs.filter((j) => j.tag?.toLowerCase().startsWith(prefix))
  }, [jobs, filterPath])

  const handleChipClick = (seg: string) => {
    setFilterPath((prev) => [...prev, seg])
  }

  const handleBreadcrumbClick = (depth: number) => {
    setFilterPath((prev) => prev.slice(0, depth))
  }

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
          {filteredJobs.length}
        </span>
      </div>

      {/* Tag filter chips */}
      {(chipOptions.length > 0 || filterPath.length > 0) && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {/* Breadcrumb path — click to go back */}
          {filterPath.length > 0 && (
            <button
              onClick={() => handleBreadcrumbClick(0)}
              className="rounded-full bg-[hsl(var(--game-blue))]/10 px-2.5 py-1 font-heading text-[9px] font-[700] text-[hsl(var(--game-blue))] transition-colors hover:bg-[hsl(var(--game-blue))]/20"
            >
              All
            </button>
          )}
          {filterPath.map((seg, i) => (
            <button
              key={i}
              onClick={() => handleBreadcrumbClick(i + 1)}
              className="flex items-center gap-1 rounded-full bg-[hsl(var(--game-blue))] px-2.5 py-1 font-heading text-[9px] font-[700] text-white"
            >
              {i > 0 && <span className="text-white/50">/</span>}
              {seg}
            </button>
          ))}

          {/* Next-level chips */}
          {chipOptions.map((seg) => (
            <button
              key={seg}
              onClick={() => handleChipClick(seg)}
              className="rounded-full border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] px-2.5 py-1 font-heading text-[9px] font-[700] text-[hsl(var(--game-ink-light))] transition-colors hover:border-[hsl(var(--game-ink))]/25 hover:text-[hsl(var(--game-ink))]"
            >
              {seg}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
        {filteredJobs.map((job) => (
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
