'use client'

// /staging/recognition-audit — THROWAWAY internal calibration quiz.
// Measures which popularityRank bands real humans actually recognise, to
// sanity-check the Game Sense v2 weekday bands and Box Set thresholds.
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

const SEED = 20260610

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
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [index, setIndex] = useState(0)
  const [copied, setCopied] = useState(false)

  const done = index >= games.length
  const current = games[index]

  const answer = (known: boolean) => {
    if (done) return
    setAnswers((prev) => ({ ...prev, [current.id]: known }))
    setIndex((i) => i + 1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'y' || e.key === 'Y') answer(true)
      if (e.key === 'n' || e.key === 'N') answer(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, done])

  const results = useMemo(() => {
    if (!done) return null
    return BANDS.map((band) => {
      const inBand = games.filter((g) => g.band === band.label)
      const known = inBand.filter((g) => answers[g.id]).length
      return {
        band: band.label,
        known,
        total: inBand.length,
        pct: inBand.length ? Math.round((known / inBand.length) * 100) : 0,
      }
    })
  }, [done, games, answers])

  const jsonBlob = useMemo(() => {
    if (!done) return ''
    return JSON.stringify(
      {
        seed: SEED,
        answers: games.map((g) => ({ ...g, known: !!answers[g.id] })),
      },
      null,
      2,
    )
  }, [done, games, answers])

  return (
    <main className="mx-auto max-w-xl px-4 py-12 font-heading">
      <p className="mb-1 text-[11px] font-[900] uppercase tracking-[0.2em] text-muted-foreground">
        Staging — recognition audit (internal)
      </p>

      {!done && current && (
        <>
          <p className="mb-8 text-sm text-muted-foreground">
            {index + 1} / {games.length} &middot; do you recognise this game? (Y/N)
          </p>
          <div className="rounded-2xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-card p-8 text-center shadow-[0_3px_0_hsl(var(--game-cream-dark)),0_6px_20px_rgba(0,0,0,0.06)]">
            <h1 className="text-2xl font-extrabold">{current.title}</h1>
            <p className="mt-1 text-muted-foreground">{current.year}</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => answer(true)}
              className="rounded-full bg-[hsl(var(--game-green))] py-4 text-lg font-extrabold text-white"
            >
              Know it (Y)
            </button>
            <button
              type="button"
              onClick={() => answer(false)}
              className="rounded-full bg-[hsl(var(--game-red))] py-4 text-lg font-extrabold text-white"
            >
              Never heard of it (N)
            </button>
          </div>
        </>
      )}

      {done && results && (
        <>
          <h1 className="mb-4 text-xl font-extrabold">Results</h1>
          <table className="mb-6 w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-1">Rank band</th>
                <th className="py-1">Known</th>
                <th className="py-1">%</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.band} className="border-b border-border/50">
                  <td className="py-1">{r.band}</td>
                  <td className="py-1">{r.known}/{r.total}</td>
                  <td className="py-1 font-extrabold">{r.pct}%</td>
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
