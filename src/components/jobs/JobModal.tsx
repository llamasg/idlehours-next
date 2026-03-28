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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

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

  const renderMarkdown = (md: string) => {
    return md
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
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Job title..."
          className="w-full border-none bg-transparent font-heading text-[20px] font-[800] text-[hsl(var(--game-ink))] placeholder:text-[hsl(var(--game-ink-dim))] outline-none"
          autoFocus
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <select
            value={column}
            onChange={(e) => setColumn(e.target.value as Job['column'])}
            className="rounded-full border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] px-4 py-1.5 font-heading text-[11px] font-[700] text-[hsl(var(--game-ink))] outline-none"
          >
            {COLUMNS.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>

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

        <input
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
          placeholder="Add a status note..."
          className="mt-4 w-full rounded-xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))]/50 px-4 py-2.5 font-body text-[12px] text-[hsl(var(--game-ink))] placeholder:text-[hsl(var(--game-ink-dim))] outline-none"
        />

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
              placeholder="Markdown body — this is the brief..."
              rows={10}
              className="w-full resize-y rounded-xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))]/30 p-4 font-body text-[13px] leading-relaxed text-[hsl(var(--game-ink))] placeholder:text-[hsl(var(--game-ink-dim))] outline-none"
            />
          )}
        </div>

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
