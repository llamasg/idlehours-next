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
  const [modalJob, setModalJob] = useState<Job | null>(null)
  const [modalColumn, setModalColumn] = useState<Job['column'] | null>(null)

  useEffect(() => {
    getJobs().then((data) => { setJobs(data); setLoading(false) })
  }, [])

  const activeJobs = jobs.filter((j) => j.status === 'active')
  const doneJobs = jobs.filter((j) => j.status === 'done')

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
      tag: data.tag ?? null,
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
    const prev = jobs
    setJobs((p) => p.filter((j) => j.id !== id))
    const ok = await deleteJob(id)
    if (!ok) setJobs(prev)
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
            {showArchive ? '\u2190 Board' : 'Archive'}
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
        <p className="py-20 text-center font-body text-[13px] text-[hsl(var(--game-ink-light))]">Loading...</p>
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
