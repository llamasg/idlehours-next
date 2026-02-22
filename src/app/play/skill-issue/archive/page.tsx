'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import { getArchiveDates, formatGameNumber, formatDisplayDate } from '../lib/dateUtils'
import { loadDayState } from '../lib/storage'

interface ArchiveRow {
  date: string
  gameNumber: string
  displayDate: string
  won: boolean
  played: boolean
  score: number
}

export default function SkillIssueArchivePage() {
  const [rows, setRows] = useState<ArchiveRow[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const dates = getArchiveDates()
    const archiveRows: ArchiveRow[] = dates.map((date) => {
      const state = loadDayState(date)
      const played = state.guesses.length > 0
      return {
        date,
        gameNumber: formatGameNumber(date),
        displayDate: formatDisplayDate(date),
        won: state.won,
        played,
        score: state.score,
      }
    })
    setRows(archiveRows)
    setLoaded(true)
  }, [])

  return (
    <>
      <Header />
      <main className="mx-auto max-w-xl px-4 py-10">
        <Link
          href="/play/skill-issue"
          className="mb-6 inline-block font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          &larr; Back to today
        </Link>

        <h1 className="mb-8 font-heading text-2xl font-bold text-foreground">
          Skill_Issue Archive
        </h1>

        {loaded && rows.length === 0 && (
          <p className="font-body text-sm text-muted-foreground">
            No previous games yet. Come back tomorrow!
          </p>
        )}

        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <div
              key={row.date}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-4 py-3"
            >
              <div className="flex items-center">
                <span className="font-heading text-sm font-bold text-foreground">
                  {row.gameNumber}
                </span>
                <span className="ml-3 font-body text-xs text-muted-foreground">
                  {row.displayDate}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {row.won && (
                  <span className="font-heading text-xs text-green-600">
                    {row.score}
                  </span>
                )}
                {row.played && !row.won && (
                  <span className="font-heading text-xs text-amber-600">
                    In progress
                  </span>
                )}
                <Link
                  href={`/play/skill-issue/${row.date}`}
                  className="rounded-full bg-primary/10 px-4 py-1.5 font-heading text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  {row.played ? 'View' : 'Play'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
