'use client'

// /staging/recognition-audit — THROWAWAY internal calibration quiz (v2).
// Measures which popularityRank bands real humans actually recognise.
// v2 (June 2026, Box Set re-tier): fresh seed, three-way answer —
//   1 Know what it is · 2 Heard of it, couldn't place it · 3 Never heard of it
// Box Set yellow/green knowledge floors recalibrate on the KNOW-WHAT-IT-IS
// rate; the heard-of rate remains the right calibration for Game Sense
// (guessing a title you've heard of is enough there).
// Seeded sample: everyone who runs it sees the same 120 games.
// No persistence, no styling effort — speed over polish.

import { useEffect, useMemo, useState } from 'react'
import { GAMES_DB } from '@/data/games-db'
import { mulberry32 } from '@/lib/game-shell/seededRng'

const BANDS = [
  { label: '1-15', min: 1, max: 15, take: 17 },
  { label: '16-30', min: 16, max: 30, take: 17 },
  { label: '31-45', min: 31, max: 45, take: 17 },
  { label: '46-60', min: 46, max: 60, take: 17 },
  { label: '61-90', min: 61, max: 90, take: 17 },
  { label: '91-130', min: 91, max: 130, take: 17 },
  { label: '131+', min: 131, max: Number.MAX_SAFE_INTEGER, take: 18 },
]

// v2: fresh seed — a NEW stratified sample, not a rerun of the v1 quiz.
const SEED = 20260611

type Answer = 'know' | 'heard' | 'never'

const OPTIONS: { value: Answer; key: string; label: string; bg: string }[] = [
  { value: 'know', key: '1', label: 'Know what it is (1)', bg: 'bg-[hsl(var(--game-green))]' },
  { value: 'heard', key: '2', label: "Heard of it, couldn't place it (2)", bg: 'bg-[hsl(var(--game-amber))]' },
  { value: 'never', key: '3', label: 'Never heard of it (3)', bg: 'bg-[hsl(var(--game-red))]' },
]

interface QuizGame {
  id: string
  title: string
  year: number
  rank: number
  band: string
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildSample(): QuizGame[] {
  const rng = mulberry32(SEED)
  const sample: QuizGame[] = []
  for (const band of BANDS) {
    const pool = GAMES_DB.filter(
      (g) => g.popularityRank !== null && g.popularityRank >= band.min && g.popularityRank <= band.max,
    )
    for (const g of seededShuffle(pool, rng).slice(0, band.take)) {
      sample.push({ id: g.id, title: g.title, year: g.year, rank: g.popularityRank!, band: band.label })
    }
  }
  return seededShuffle(sample, rng)
}

export default function RecognitionAuditPage() {
  const games = useMemo(buildSample, [])
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [index, setIndex] = useState(0)
  const [copied, setCopied] = useState(false)

  const done = index >= games.length
  const current = games[index]

  const answer = (value: Answer) => {
    if (done) return
    setAnswers((prev) => ({ ...prev, [current.id]: value }))
    setIndex((i) => i + 1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const opt = OPTIONS.find((o) => o.key === e.key)
      if (opt) answer(opt.value)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, done])

  const results = useMemo(() => {
    if (!done) return null
    return BANDS.map((band) => {
      const inBand = games.filter((g) => g.band === band.label)
      const count = (v: Answer) => inBand.filter((g) => answers[g.id] === v).length
      const pct = (n: number) => (inBand.length ? Math.round((n / inBand.length) * 100) : 0)
      const know = count('know')
      const heard = count('heard')
      const never = count('never')
      return {
        band: band.label,
        total: inBand.length,
        know,
        heard,
        never,
        knowPct: pct(know),
        // "heard-of" rate = know + heard (could at least place the name)
        heardOfPct: pct(know + heard),
        neverPct: pct(never),
      }
    })
  }, [done, games, answers])

  const jsonBlob = useMemo(() => {
    if (!done) return ''
    return JSON.stringify(
      {
        seed: SEED,
        version: 2,
        answers: games.map((g) => ({ ...g, answer: answers[g.id] ?? null })),
      },
      null,
      2,
    )
  }, [done, games, answers])

  return (
    <main className="mx-auto max-w-xl px-4 py-12 font-heading">
      <p className="mb-1 text-[11px] font-[900] uppercase tracking-[0.2em] text-muted-foreground">
        Staging — recognition audit v2 (internal)
      </p>

      {!done && current && (
        <>
          <p className="mb-8 text-sm text-muted-foreground">
            {index + 1} / {games.length} &middot; how well do you know this game? (1/2/3)
          </p>
          <div className="rounded-2xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-card p-8 text-center shadow-[0_3px_0_hsl(var(--game-cream-dark)),0_6px_20px_rgba(0,0,0,0.06)]">
            <h1 className="text-2xl font-extrabold">{current.title}</h1>
            <p className="mt-1 text-muted-foreground">{current.year}</p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3">
            {OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => answer(o.value)}
                className={`rounded-full py-4 text-lg font-extrabold text-white ${o.bg}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}

      {done && results && (
        <>
          <h1 className="mb-1 text-xl font-extrabold">Results</h1>
          <p className="mb-4 text-xs text-muted-foreground">
            Box Set yellow/green floors calibrate on the <strong>Know</strong>{' '}
            rate. The <strong>Heard-of</strong> rate (know + heard) is the right
            calibration for Game Sense.
          </p>
          <table className="mb-6 w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-1">Rank band</th>
                <th className="py-1">Know</th>
                <th className="py-1">Heard-of</th>
                <th className="py-1">Never</th>
                <th className="py-1">Raw (k/h/n)</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.band} className="border-b border-border/50">
                  <td className="py-1">{r.band}</td>
                  <td className="py-1 font-extrabold">{r.knowPct}%</td>
                  <td className="py-1 font-extrabold">{r.heardOfPct}%</td>
                  <td className="py-1">{r.neverPct}%</td>
                  <td className="py-1 text-muted-foreground">
                    {r.know}/{r.heard}/{r.never} of {r.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(jsonBlob).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              })
            }}
            className="mb-3 rounded-full bg-[hsl(var(--game-ink))] px-6 py-2 text-sm font-bold text-white"
          >
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
          <textarea
            readOnly
            value={jsonBlob}
            className="h-64 w-full rounded-lg border border-border bg-muted/30 p-3 font-mono text-[11px]"
          />
        </>
      )}
    </main>
  )
}
