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
      <span className={`absolute right-3 top-3 h-2.5 w-2.5 rounded-full ${PRIORITY_COLORS[job.priority]}`} />

      <h3
        className="cursor-pointer pr-6 font-heading text-[14px] font-[700] leading-snug text-[hsl(var(--game-ink))]"
        onClick={() => onOpen(job)}
      >
        {job.title}
      </h3>

      {job.progress && (
        <p className="mt-1.5 font-body text-[11px] italic text-[hsl(var(--game-ink-light))]">
          &#8635; {job.progress}
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
          Done &#10003;
        </button>
      </div>
    </div>
  )
}
