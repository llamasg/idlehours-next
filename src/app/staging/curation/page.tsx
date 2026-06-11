'use client'

// /staging/curation — THROWAWAY internal hand answer-grade pass over the
// catalog. Speed over polish; flat staging build.
//
// Pass 1 (triage): famous-first cards, clustered by franchise (fallback:
//   normalised title-prefix). → yes · ← no · ↑ yes+easy-win · ↓ skip ·
//   SPACE expand cluster · U undo (unlimited). Auto-saves to localStorage.
//   Stopping rule: rolling last-100 verdicts >90% no → offer to auto-default
//   the rest ('auto-no', distinguishable from hand verdicts).
// Pass 2 (refine): yes-pile without the easy-win flag. 1 easy win · 2 solid ·
//   3 fringe · U undo.
// Export: { gameId: { verdict, tier?, clustered? } } → commit as
//   src/data/curation/curation.json (consumed by src/lib/answerPool.ts).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GAMES_DB } from '@/data/games-db'
import { igdbCoverUrl } from '@/lib/imageUtils'

const STORAGE_KEY = 'staging_curation_v1'
// Rolling backup: refreshed every BACKUP_EVERY saves so a corrupted main key
// can never cost a session's work (the power-cut scenario). Hydration falls
// back to it when the main key is missing or unparseable.
const BACKUP_KEY = 'staging_curation_v1_backup'
const BACKUP_EVERY = 25
const CLIFF_WINDOW = 100
const CLIFF_NO_SHARE = 0.9

interface Judgment {
  verdict: 'yes' | 'no' | 'auto-no' | 'skip'
  tier?: 1 | 2 | 3
  easyWin?: boolean
  clustered?: string
}

type Card =
  | { kind: 'cluster'; key: string; label: string; memberIds: string[]; minRank: number }
  | { kind: 'game'; id: string; minRank: number }

const BY_ID = new Map(GAMES_DB.map((g) => [g.id, g]))
const rankOf = (id: string) => BY_ID.get(id)?.popularityRank ?? 999999

// ── Clustering: franchise field, fallback normalised title-prefix ────────────

const EDITION_WORDS =
  /\b(remastered|remake|definitive|deluxe|complete|goty|game of the year|hd|anniversary|special|ultimate|enhanced|edition|collection|trilogy)\b.*$/i

function titlePrefixKey(title: string): string {
  let t = title.split(/[:—-]| - /)[0]
  t = t.replace(EDITION_WORDS, '')
  t = t.replace(/\b([0-9]+|[ivx]+)\s*$/i, '') // trailing numerals
  t = t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  return t
}

function buildClusters(): Card[] {
  const groups = new Map<string, { label: string; ids: string[] }>()
  const loners: string[] = []

  for (const g of GAMES_DB) {
    const key = g.franchise ? `fr:${g.franchise}` : `tp:${titlePrefixKey(g.title)}`
    const label = g.franchise ?? g.title.split(/[:—]/)[0].trim()
    if (!groups.has(key)) groups.set(key, { label, ids: [] })
    groups.get(key)!.ids.push(g.id)
  }

  const cards: Card[] = []
  for (const [key, { label, ids }] of groups) {
    if (ids.length < 2) {
      loners.push(...ids)
      continue
    }
    ids.sort((a, b) => rankOf(a) - rankOf(b))
    cards.push({ kind: 'cluster', key, label, memberIds: ids, minRank: rankOf(ids[0]) })
  }
  for (const id of loners) cards.push({ kind: 'game', id, minRank: rankOf(id) })
  cards.sort((a, b) => a.minRank - b.minRank)
  return cards
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CurationPage() {
  const baseCards = useMemo(buildClusters, [])

  const [judgments, setJudgments] = useState<Record<string, Judgment>>({})
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [hydrated, setHydrated] = useState(false)
  const [tab, setTab] = useState<'pass1' | 'pass2' | 'export'>('pass1')
  const [copied, setCopied] = useState(false)
  // undo history: judgment batches and expansions, interleaved
  const historyRef = useRef<
    ({ type: 'judge'; ids: string[]; prev: (Judgment | undefined)[] } | { type: 'expand'; key: string })[]
  >([])
  // session rate tracking
  const sessionRef = useRef<{ start: number | null; count: number }>({ start: null, count: 0 })
  // rolling verdict window for the stopping rule (card-level yes/no)
  const [recent, setRecent] = useState<('yes' | 'no')[]>([])

  const [saveState, setSaveState] = useState<{ ok: boolean; at: number | null }>({ ok: true, at: null })
  const saveCountRef = useRef(0)

  // hydrate from localStorage — main key first, rolling backup as fallback
  useEffect(() => {
    const tryLoad = (key: string) => {
      try {
        const raw = localStorage.getItem(key)
        if (!raw) return false
        const saved = JSON.parse(raw)
        setJudgments(saved.judgments ?? {})
        setExpanded(new Set(saved.expanded ?? []))
        return true
      } catch {
        return false
      }
    }
    if (!tryLoad(STORAGE_KEY)) tryLoad(BACKUP_KEY)
    setHydrated(true)
  }, [])

  // auto-save every change; refresh the backup every BACKUP_EVERY saves.
  // A failed write is surfaced loudly — silent loss is the worst case.
  useEffect(() => {
    if (!hydrated) return
    try {
      const payload = JSON.stringify({ judgments, expanded: [...expanded] })
      localStorage.setItem(STORAGE_KEY, payload)
      saveCountRef.current++
      if (saveCountRef.current % BACKUP_EVERY === 0) {
        localStorage.setItem(BACKUP_KEY, payload)
      }
      setSaveState({ ok: true, at: Date.now() })
    } catch {
      setSaveState({ ok: false, at: Date.now() })
    }
  }, [judgments, expanded, hydrated])

  // queue with expansions applied
  const cards = useMemo(() => {
    const out: Card[] = []
    for (const c of baseCards) {
      if (c.kind === 'cluster' && expanded.has(c.key)) {
        for (const id of c.memberIds) out.push({ kind: 'game', id, minRank: rankOf(id) })
      } else {
        out.push(c)
      }
    }
    return out
  }, [baseCards, expanded])

  const isCardJudged = useCallback(
    (c: Card) =>
      c.kind === 'game'
        ? judgments[c.id] !== undefined
        : c.memberIds.every((id) => judgments[id] !== undefined),
    [judgments],
  )

  const pass1Index = useMemo(() => cards.findIndex((c) => !isCardJudged(c)), [cards, isCardJudged])
  const pass1Card = pass1Index === -1 ? null : cards[pass1Index]

  // pass 2 queue: hand-yes without easy-win, untierd first, famous-first
  const pass2Queue = useMemo(
    () =>
      GAMES_DB.filter((g) => {
        const j = judgments[g.id]
        return j?.verdict === 'yes' && !j.easyWin && j.tier === undefined
      }).sort((a, b) => (a.popularityRank ?? 999999) - (b.popularityRank ?? 999999)),
    [judgments],
  )
  const pass2Game = pass2Queue[0] ?? null

  // preload next 5 covers
  useEffect(() => {
    const source = tab === 'pass2' ? pass2Queue.slice(1, 6).map((g) => g.igdbImageId) : []
    if (tab === 'pass1' && pass1Index !== -1) {
      for (const c of cards.slice(pass1Index + 1, pass1Index + 6)) {
        const id = c.kind === 'game' ? c.id : c.memberIds[0]
        source.push(BY_ID.get(id)?.igdbImageId ?? null)
      }
    }
    for (const imageId of source) {
      if (imageId) new Image().src = igdbCoverUrl(imageId)
    }
  }, [tab, cards, pass1Index, pass2Queue])

  // ── Actions ────────────────────────────────────────────────────────────────

  const judgeCard = useCallback(
    (card: Card, verdict: 'yes' | 'no' | 'skip', easyWin = false) => {
      const ids = card.kind === 'game' ? [card.id] : card.memberIds
      historyRef.current.push({ type: 'judge', ids, prev: ids.map((id) => judgments[id]) })
      const next = { ...judgments }
      for (const id of ids) {
        next[id] = {
          verdict,
          ...(easyWin ? { easyWin: true, tier: 1 as const } : {}),
          ...(card.kind === 'cluster' ? { clustered: card.key } : {}),
        }
      }
      setJudgments(next)
      if (verdict !== 'skip') {
        if (sessionRef.current.start === null) sessionRef.current.start = Date.now()
        sessionRef.current.count++
        setRecent((r) => [...r.slice(-(CLIFF_WINDOW - 1)), verdict])
      }
    },
    [judgments],
  )

  const setTier = useCallback(
    (gameId: string, tier: 1 | 2 | 3) => {
      historyRef.current.push({ type: 'judge', ids: [gameId], prev: [judgments[gameId]] })
      setJudgments((prev) => ({ ...prev, [gameId]: { ...prev[gameId], tier } }))
      if (sessionRef.current.start === null) sessionRef.current.start = Date.now()
      sessionRef.current.count++
    },
    [judgments],
  )

  const undo = useCallback(() => {
    const last = historyRef.current.pop()
    if (!last) return
    if (last.type === 'expand') {
      setExpanded((prev) => {
        const next = new Set(prev)
        next.delete(last.key)
        return next
      })
      return
    }
    setJudgments((prev) => {
      const next = { ...prev }
      last.ids.forEach((id, i) => {
        const prevJ = last.prev[i]
        if (prevJ === undefined) delete next[id]
        else next[id] = prevJ
      })
      return next
    })
    setRecent((r) => r.slice(0, -1))
  }, [])

  const expandCluster = useCallback((key: string) => {
    historyRef.current.push({ type: 'expand', key })
    setExpanded((prev) => new Set(prev).add(key))
  }, [])

  const autoDefaultRest = useCallback(() => {
    setJudgments((prev) => {
      const next = { ...prev }
      for (const g of GAMES_DB) {
        if (next[g.id] === undefined || next[g.id].verdict === 'skip') {
          next[g.id] = { verdict: 'auto-no' }
        }
      }
      return next
    })
  }, [])

  // ── Keys ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'u' || e.key === 'U') {
        undo()
        return
      }
      if (tab === 'pass1' && pass1Card) {
        if (e.key === 'ArrowRight') judgeCard(pass1Card, 'yes')
        if (e.key === 'ArrowLeft') judgeCard(pass1Card, 'no')
        if (e.key === 'ArrowUp') judgeCard(pass1Card, 'yes', true)
        if (e.key === 'ArrowDown') judgeCard(pass1Card, 'skip')
        if (e.key === ' ' && pass1Card.kind === 'cluster') {
          e.preventDefault()
          expandCluster(pass1Card.key)
        }
        if (e.key.startsWith('Arrow')) e.preventDefault()
      }
      if (tab === 'pass2' && pass2Game) {
        if (e.key === '1') setTier(pass2Game.id, 1)
        if (e.key === '2') setTier(pass2Game.id, 2)
        if (e.key === '3') setTier(pass2Game.id, 3)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tab, pass1Card, pass2Game, judgeCard, setTier, undo, expandCluster])

  // ── Stats ──────────────────────────────────────────────────────────────────

  const judgedGames = useMemo(
    () => Object.values(judgments).filter((j) => j.verdict !== 'skip').length,
    [judgments],
  )
  const remainingCards = useMemo(() => cards.filter((c) => !isCardJudged(c)).length, [cards, isCardJudged])
  const rate = useMemo(() => {
    const s = sessionRef.current
    if (!s.start || s.count < 3) return null
    const mins = (Date.now() - s.start) / 60000
    return mins > 0 ? s.count / mins : null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [judgments])

  const cliff =
    recent.length >= CLIFF_WINDOW &&
    recent.filter((v) => v === 'no').length / recent.length > CLIFF_NO_SHARE

  const exportJson = useMemo(() => {
    const out: Record<string, { verdict: string; tier?: number; clustered?: string }> = {}
    for (const [id, j] of Object.entries(judgments)) {
      if (j.verdict === 'skip') continue
      out[id] = {
        verdict: j.verdict,
        ...(j.verdict === 'yes' && j.tier ? { tier: j.tier } : {}),
        ...(j.clustered ? { clustered: j.clustered } : {}),
      }
    }
    return JSON.stringify(out, null, 2)
  }, [judgments])

  if (!hydrated) return null

  const renderGameCard = (id: string) => {
    const g = BY_ID.get(id)!
    return (
      <div className="rounded-2xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-card p-6 text-center shadow-[0_3px_0_hsl(var(--game-cream-dark)),0_6px_20px_rgba(0,0,0,0.06)]">
        {g.igdbImageId && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={igdbCoverUrl(g.igdbImageId)}
            alt=""
            className="mx-auto mb-4 h-56 rounded-lg object-contain"
          />
        )}
        <h2 className="text-xl font-extrabold">{g.title}</h2>
        <p className="text-sm text-muted-foreground">
          {g.year} &middot; rank {g.popularityRank ?? '—'}
        </p>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10 font-heading">
      <p className="mb-1 text-[11px] font-[900] uppercase tracking-[0.2em] text-muted-foreground">
        Staging — curation (internal)
      </p>

      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        {(['pass1', 'pass2', 'export'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold ${tab === t ? 'bg-[hsl(var(--game-ink))] text-white' : 'bg-muted text-muted-foreground'}`}
          >
            {t === 'pass1' ? 'Pass 1 — triage' : t === 'pass2' ? `Pass 2 — refine (${pass2Queue.length})` : 'Export'}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-[hsl(var(--game-green))] transition-all"
            style={{ width: `${(judgedGames / GAMES_DB.length) * 100}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {judgedGames}/{GAMES_DB.length} games judged
          {rate && ` · ${Math.round(rate)} judgments/min`}
          {rate && remainingCards > 0 && ` · ~${Math.ceil(remainingCards / rate)} min remaining`}
          {saveState.at && saveState.ok && (
            <span className="text-[hsl(var(--game-green))]"> · saved ✓</span>
          )}
        </p>
      </div>

      {/* Save failure — loud, the silent version of this is the worst case */}
      {!saveState.ok && (
        <div className="mb-4 rounded-xl border-2 border-[hsl(var(--game-red))] bg-[hsl(var(--game-red))]/10 p-4">
          <p className="text-sm font-bold text-[hsl(var(--game-red))]">
            SAVE FAILED — progress is NOT being persisted (storage quota or
            private browsing?). Export your work from the Export tab now.
          </p>
        </div>
      )}

      {/* Cliff banner */}
      {tab === 'pass1' && cliff && remainingCards > 0 && (
        <div className="mb-4 rounded-xl border-2 border-[hsl(var(--game-amber))] bg-[hsl(var(--game-amber))]/10 p-4">
          <p className="mb-2 text-sm font-bold">
            Cliff reached — last {CLIFF_WINDOW} verdicts are &gt;90% no.
          </p>
          <button
            type="button"
            onClick={autoDefaultRest}
            className="rounded-full bg-[hsl(var(--game-amber))] px-5 py-2 text-sm font-extrabold text-white"
          >
            Auto-default the remaining {remainingCards} cards to no
          </button>
        </div>
      )}

      {/* Pass 1 */}
      {tab === 'pass1' &&
        (pass1Card ? (
          <>
            {pass1Card.kind === 'game' ? (
              renderGameCard(pass1Card.id)
            ) : (
              <div className="rounded-2xl border-[1.5px] border-[hsl(var(--game-ink))]/10 bg-card p-6 text-center shadow-[0_3px_0_hsl(var(--game-cream-dark)),0_6px_20px_rgba(0,0,0,0.06)]">
                {(() => {
                  const top = BY_ID.get(pass1Card.memberIds[0])!
                  return (
                    top.igdbImageId && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={igdbCoverUrl(top.igdbImageId)} alt="" className="mx-auto mb-4 h-56 rounded-lg object-contain" />
                    )
                  )
                })()}
                <h2 className="text-xl font-extrabold">
                  {pass1Card.label} — {pass1Card.memberIds.length} entries
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-xs text-muted-foreground">
                  {pass1Card.memberIds.slice(0, 6).map((id) => BY_ID.get(id)!.title).join(' · ')}
                  {pass1Card.memberIds.length > 6 && ' · …'}
                </p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  verdict applies to all — SPACE to judge individually
                </p>
              </div>
            )}
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <button type="button" onClick={() => judgeCard(pass1Card, 'yes')} className="rounded-full bg-[hsl(var(--game-green))] py-3 font-extrabold text-white">→ Yes, answer-grade</button>
              <button type="button" onClick={() => judgeCard(pass1Card, 'no')} className="rounded-full bg-[hsl(var(--game-red))] py-3 font-extrabold text-white">← No, too niche</button>
              <button type="button" onClick={() => judgeCard(pass1Card, 'yes', true)} className="rounded-full bg-[hsl(var(--game-blue))] py-3 font-extrabold text-white">↑ Yes + easy win</button>
              <button type="button" onClick={() => judgeCard(pass1Card, 'skip')} className="rounded-full bg-muted py-3 font-extrabold text-muted-foreground">↓ Unsure / skip</button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">U = undo (unlimited)</p>
          </>
        ) : (
          <p className="rounded-xl bg-muted/40 p-6 text-center text-sm">
            Pass 1 complete. Head to Pass 2 to tier the yes pile, or Export.
          </p>
        ))}

      {/* Pass 2 */}
      {tab === 'pass2' &&
        (pass2Game ? (
          <>
            <p className="mb-3 rounded-lg bg-muted/40 px-4 py-2 text-center text-xs font-semibold text-muted-foreground">
              Easy win means &ldquo;I could name its genre and rough era cold.&rdquo;
            </p>
            {renderGameCard(pass2Game.id)}
            <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <button type="button" onClick={() => setTier(pass2Game.id, 1)} className="rounded-full bg-[hsl(var(--game-green))] py-3 font-extrabold text-white">1 Easy win</button>
              <button type="button" onClick={() => setTier(pass2Game.id, 2)} className="rounded-full bg-[hsl(var(--game-blue))] py-3 font-extrabold text-white">2 Solid</button>
              <button type="button" onClick={() => setTier(pass2Game.id, 3)} className="rounded-full bg-[hsl(var(--game-amber))] py-3 font-extrabold text-white">3 Fringe</button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">U = undo · ↑-flagged games already sit in tier 1</p>
          </>
        ) : (
          <p className="rounded-xl bg-muted/40 p-6 text-center text-sm">
            Nothing left to refine — every hand-yes either carries the easy-win flag or a tier.
          </p>
        ))}

      {/* Export */}
      {tab === 'export' && (
        <>
          <p className="mb-3 text-xs text-muted-foreground">
            Commit as <code>src/data/curation/curation.json</code> — consumed by{' '}
            <code>src/lib/answerPool.ts</code> (hand verdict &gt; override file &gt; rank mapping).
          </p>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(exportJson).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              })
            }}
            className="mb-3 rounded-full bg-[hsl(var(--game-ink))] px-6 py-2 text-sm font-bold text-white"
          >
            {copied ? 'Copied!' : 'Export curation JSON'}
          </button>
          <textarea readOnly value={exportJson} className="h-72 w-full rounded-lg border border-border bg-muted/30 p-3 font-mono text-[11px]" />
        </>
      )}
    </main>
  )
}
