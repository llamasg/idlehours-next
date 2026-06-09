# Game Architecture — Shared vs Divergent

Audit date: 2026-06-09; updated same day after the cleanup sequence (GameEndModal.tsx deleted with `SplitShareButton`/`Confetti` extracted; knip's dead exports removed — line numbers cited below may have shifted slightly in the touched lib files). The shell proposal in §5 is unaffected and remains the plan of record for the badges/manifest work. Scope: the six games under `src/app/play/` plus the shared components in `src/components/games/` and `src/components/play/`. Classification: **STRUCTURAL** = machinery every game conceptually needs (intro/rules, end screens, share, timers, persistence, streaks, archive); **IDENTITY** = the game itself (core interaction, bespoke visuals, puzzle generation).

## 1. Per-game inventory

### game-sense (~1,872 lines)
| File | Lines | Class |
|---|---|---|
| `[date]/page.tsx` | 873 | MIXED — ~60% structural (entrance sequencer, score pill + floating cost, post-game two-column layout, nav pills, dead share builder, dead toast, theme-color effect), ~40% identity (guess flow, hint logic) |
| `components/GuessInput.tsx` | 294 | IDENTITY (typeahead over games-db) |
| `components/SentenceClue.tsx` | 247 | IDENTITY (blank-reveal sentence) |
| `components/ProximityCounter.tsx` | 212 | IDENTITY |
| `components/RulesModal.tsx` | 90 | STRUCTURAL — fork 1 of 2 |
| `components/GuessList.tsx` | 75 | IDENTITY |
| `lib/dateUtils.ts` | 106 | STRUCTURAL wrapper + identity (weighted seeded daily selection, mulberry32) |
| `lib/scoring.ts` | 105 | IDENTITY |
| `lib/storage.ts` | 70 | STRUCTURAL — localStorage fork 1 of 3 (`game_sense_`) |
| `lib/useSanityGame.ts` | — | DELETED 2026-06 (`c7958f7`) |
| `page.tsx` / `archive/page.tsx` / layouts / data | ~60 | STRUCTURAL (today-redirect fork 1 of 3) |

### street-date (~1,548 lines)
| File | Lines | Class |
|---|---|---|
| `[date]/page.tsx` | 1,185 | MIXED — ~45% structural (same entrance sequencer, score pill, guess pips, post-game two-column, nav pills, dead share builder), ~55% identity (drag-and-drop slots, hint reveal pairs) |
| `lib/puzzleGen.ts` | 172 | IDENTITY (LCG seeded RNG — RNG fork 3 of 3) |
| `lib/gameState.ts` | 100 | STRUCTURAL persistence fork 2 (`street_date_v3_`) + identity scoring |
| `lib/dateUtils.ts` | 43 | STRUCTURAL wrapper fork 2 — 100% boilerplate |
| `lib/imageUtils.ts` | 2 | pure re-export shim of `@/lib/imageUtils` |
| `page.tsx` / archive / layouts / data | ~50 | STRUCTURAL (today-redirect fork 2) |

Notably **absent** from street-date: RulesModal (no rules UI at all), DiscoverMore, playable-date guard (future dates render real puzzles), theme-color parity exists but shelf-price's doesn't — see table rows 2, 14, 16.

### shelf-price (~1,144 lines)
| File | Lines | Class |
|---|---|---|
| `[date]/page.tsx` | 523 | MIXED — ~70% structural |
| `components/GameCards.tsx` | 326 | IDENTITY |
| `components/RulesModal.tsx` | 77 | STRUCTURAL — fork 2 of 2 (~80% identical to game-sense's; copy + hardcoded `#5B4FCF` differ) |
| `lib/dateUtils.ts` | 90 | STRUCTURAL wrapper fork 3 + identity pair-gen (mulberry32 — RNG fork 2) |
| `lib/storage.ts` | 64 | STRUCTURAL persistence fork 3 (`shelf_price_v2_`) |
| `components/ProgressBar.tsx` | 42 | STRUCTURAL |
| `page.tsx` / archive / layouts / data | ~50 | STRUCTURAL (today-redirect fork 3) |

### blitz (~1,538 lines)
Uses **nothing** from `src/components/games/` — fully forked structural layer.
| File | Lines | Class |
|---|---|---|
| `components/EndScreen.tsx` | 347 | STRUCTURAL — hand-rolled clone of `ResultCard` (accent line, heading bar, two-col badge/score, milestone ladder, share button, Supabase score post) |
| `components/LeaderboardScreen.tsx` | 189 | STRUCTURAL |
| `components/TopicSelectScreen.tsx` | 167 | STRUCTURAL (intro) |
| `components/GameplayScreen.tsx` 161, `BlitzInput.tsx` 147, `PhysicsArena.tsx` 156, `lib/physics.ts` 160, `lib/matching.ts` 128 | | IDENTITY |
| `components/BlitzHUD.tsx` 83, `ProgressBar.tsx` 41, `MilestoneToast.tsx` 39, `lib/milestones.ts` 32, `page.tsx` 128 | | STRUCTURAL |

### jigsaw (~3,105 lines)
Mostly IDENTITY (canvas + Supabase realtime: `JigsawCanvas.tsx` 366, `RemoteCursors.tsx` 218, hooks `usePieceSync`/`usePresence`/`useRoom`/`useGuestId` ~635). STRUCTURAL: lobby/intro in `page.tsx` (633), `NamePopup.tsx` 77, `LobbyPanel.tsx` 111, ad-hoc localStorage persistence (own key, `page.tsx:62`), completion toast, copy-room-code clipboard.

### ship-it (~2,034 lines)
| File | Lines | Class |
|---|---|---|
| `components/EndScreen.tsx` | 347 | STRUCTURAL results summary + own share-text builder (fork) |
| `components/LoseScreen.tsx` | 180 | STRUCTURAL + a *second* share builder fork (line ~40) |
| `components/StartScreen.tsx` | 89 | STRUCTURAL — its own comment says it "matches Game Sense / Shelf Price / Street Date" styling, i.e. visually converged, structurally forked |
| `data/offers.ts` 667, `OfferCard.tsx` 132, `GameScreen.tsx` 116, `BoxArt.tsx` 109, others | | IDENTITY |

**Ship-it has no persistence at all** — refresh loses the run.

### archive (shared viewer, ~1,435 lines) — all STRUCTURAL
`page.tsx` 302, `ArchiveCalendar.tsx` 380, `EntryCard.tsx` 267, `Rolodex.tsx` 314, `GameTabs.tsx` 65, `lib/archiveAdapter.ts` 107. The adapter is the only place the three daily games' state shapes are normalised — the closest thing to a game-shell seam that already exists.

## 2. Shared-component usage matrix

| Shared component | game-sense | street-date | shelf-price | blitz | jigsaw | ship-it |
|---|---|---|---|---|---|---|
| `GameEndModal.tsx` | — | — | — | — | — | — (**deleted 2026-06 in `c7958f7`**; `SplitShareButton` + `Confetti` extracted first as standalone files in `src/components/games/`) |
| `GameEndModal.copy.ts` (ranks/flavour/copy) | ✓ | ✓ | ✓ | — (own `MEDAL_HEADINGS`) | — | — |
| `PostGameLeftColumn` → `ResultCard` + `DailyBadgeShelf` | ✓ | ✓ | ✓ | — (own EndScreen clone) | — | — |
| `DiscoverMore` | ✓ | **—** | ✓ | — | — | ✓ |
| `AnimatedScore` | ✓ | ✓ | ✓ | — | — | — |
| `@/lib/gameConstants` (timings) | ✓ | ✓ | ✓ | — | — | — |
| `@/lib/animations` (entrance presets) | ✓ | ✓ | ✓ | — | — | — |
| `@/lib/imageUtils` | ✓ | ✓ (via 2-line shim) | ✓ | — | — | — |

Reading: the three daily games have converged on a real shared layer; **blitz and ship-it re-implement all of it**; jigsaw shares nothing. `GameSlug` in `ranks.ts:46` is `'game-sense' | 'street-date' | 'shelf-price'` — the type system itself excludes the other three games from badges/ranks.

## 3. Near-duplicate similarity table (core deliverable)

| # | Structural job | Games with their own version (files) | Overlap | Unification difficulty |
|---|---|---|---|---|
| 1 | Post-game results screen | Daily trio share `PostGameLeftColumn` but fork the right-hand analysis card: game-sense `[date]/page.tsx:714-804`, street-date `:1027-1173`, shelf-price `:414-478` (stat-pill rows ~95% identical incl. the same time-format IIFE). Blitz `EndScreen.tsx` (347) re-implements `ResultCard` wholesale. Ship-it `EndScreen.tsx` (347) bespoke | trio ~60%; blitz-vs-ResultCard ~75% | **MEDIUM** — extract `PostGameAnalysisCard` (header + stat pills + children slot); blitz needs ResultCard to accept a custom ladder + footer slot |
| 2 | Intro / how-to-play | game-sense `RulesModal.tsx` (90) vs shelf-price `RulesModal.tsx` (77) — identical shell, only copy + accent differ. **Street-date has none.** Blitz `TopicSelectScreen`, ship-it `StartScreen` fill the same slot bespokely | ~80% | **LOW** — one `RulesModal({accent, children})`; street-date gets rules for free |
| 3 | "Next game in Xh" countdown | **Does not exist in any game** — only static "midnight GMT" copy | n/a | **LOW** to add once in a shell — feature gap, not duplication |
| 4 | Streak logic | **No cross-day streak exists anywhere.** `streak` in `ResultCard`/`PostGameLeftColumn`/`archiveAdapter` is shelf-price's within-day `correctCount`, misleadingly named; `getRankForGame` ignores it (`ranks.ts:79`) | n/a | **LOW** to rename; real streaks = new shell feature iterating per-day keys (primitives exist) |
| 5 | Share-text builders | 5 forks, 2 dead: game-sense page:338-358 (**dead**), street-date page:526-531 (**dead**, + emoji grid at `gameState.ts:96`), blitz `EndScreen:55-66` (live), ship-it `EndScreen:134-147` (live), ship-it `LoseScreen:~40` (live). `SplitShareButton` now lives standalone at `src/components/games/SplitShareButton.tsx` (extracted 2026-06, zero importers yet) | ~70% format | **LOW** — `buildShareText({game, number, score, rows})` + wire SplitShareButton in. **No daily game currently has any share UI** |
| 6 | Seeded daily RNG | mulberry32 in game-sense `lib/dateUtils.ts:42-49`; byte-identical mulberry32 again in shelf-price `lib/dateUtils.ts:45-53`; LCG + date-hash in street-date `lib/puzzleGen.ts:22-44` | mulberry32 pair 100% | **MEDIUM** — extraction trivial BUT CLAUDE.md rule 5: output must stay bit-for-bit identical per date; street-date's LCG must remain an LCG |
| 7 | Per-game dateUtils wrappers | 3 wrappers re-exporting `@/lib/dateUtils` bound to a per-game `LAUNCH_DATE`, identical TODO comment ×3; street-date's 43 lines are 100% boilerplate | ~95% wrapper part | **LOW** — `makeGameDates(LAUNCH_DATE)` factory or per-game config object |
| 8 | localStorage day-state (write) | `game-sense/lib/storage.ts` (70), `shelf-price/lib/storage.ts` (64), `street-date/lib/gameState.ts:54-68` — same load/save/SSR-guard/try-catch shape | ~85% | **LOW** — generic `createDayStore<T>(prefix, defaultState, migrate?)`; **keys must not change** (CLAUDE.md rule 2) |
| 9 | localStorage completion (read) | 3 independent readers: `DailyBadgeShelf.tsx:50-83`, `TodayCard.tsx:23-52` (near-identical fork), `archiveAdapter.ts:62-106`. **BUG: `TodayCard.tsx:35` reads dead v1 key `street_date_` → Street Date completion never shows on /play.** Both `getTodayDateStr` copies also use machine-local timezone vs the games' Europe/London | ~90% | **LOW** — single `getDailyCompletion(slug, date)` in `@/lib`; fixes the bug as a side effect |
| 10 | Entrance sequence (wipe + word-pop title + 6-step timeline) | Copy-pasted in all three `[date]/page.tsx`: gs:139-160+376-445, sd:114-163+603-655, sp:70-104+216-273 (~120 lines each; timing constants already centralised in `gameConstants.ts`) | ~90% | **MEDIUM** — extract `useGameEntrance()` + `<GameWorld>` + `<GameTitle>`; mechanical but touches the most fragile animation code |
| 11 | Score pill + floating cost + pulse | gs page:557-582, sd page:668-694, sp page:288-314 | ~85% | **LOW** — `<ScorePill score pulse floatingCost accent>` |
| 12 | Nav pills (Today's game / past games) | 6 copies across the three pages (in-game + post-game variants). Inconsistent: gs routes via `/play/game-sense/archive` redirect hop, sd/sp link `/play/archive?game=` directly; sd's lack icons | ~90% | **LOW** — `<GameNavPills slug isToday>` |
| 13 | Today-redirect pages | 3 near-identical `router.replace` client pages | ~95% | **LOW** — `getTodayDateString` is timezone-fixed, so a server redirect works |
| 14 | Mobile theme-color effect | gs page:85-112 (`#2D6BC4`) and sd page:86-112 (`#1A7A40`) line-for-line identical bar the hex; **shelf-price lacks it** (inconsistent iOS status bar) | ~98% | **LOW** — `useMobileThemeColor(hex)` |
| 15 | `BADGE_IMAGES` map | Verbatim ×2 (was ×3 before the GameEndModal deletion): `DailyBadgeShelf.tsx:11-29`, `ResultCard.tsx:18-36`. Any badge rename = 2 edits | 100% | **LOW** — move to `@/lib/ranks` next to `GAME_COLORS` |
| 16 | "Not playable yet" guard | gs page:602-614, sp page:333-345 (~95% identical); **street-date has none** — future-dated URLs render real puzzles | ~95% | **LOW** |
| 17 | Dead modal-copy memos + dead modal state | gs page:325-335, sd page:510-524, sp page:172-185 + `showWinModal`/`showLossModal`/`showCompleteToast` (gs), `showResult` (sp, still gates `isPostGame`) | ~90% | **LOW** — delete with care (sp's gates live logic) |
| 18 | Toast | game-sense inline trophy toast page:852-867 (dead), blitz `MilestoneToast.tsx`, jigsaw `addToast` | ~40% | **MEDIUM** — different visual languages |
| 19 | Rank/medal ladders | Daily trio unified via `ranks.ts`/`GameEndModal.copy.ts`; blitz `lib/milestones.ts` + EndScreen ladder UI re-implements the concept with medals | ~60% concept | **MEDIUM** — extend `GameSlug` or accept divergence (blitz is session, not daily) |
| 20 | Elapsed-time formatting | Identical IIFE in gs page:748-758 and sd page:1039-1046; shelf-price doesn't track time | 90% | **LOW** — `formatElapsed()` |

## 4. Cross-contamination

**No game imports from another game's directory** — the six game folders are clean of each other. The reaching-in happens from *shared* code into game folders (inverted dependency):

| Importer | Imports from | What |
|---|---|---|
| `src/app/play/archive/lib/archiveAdapter.ts:6-12` | `game-sense/lib/dateUtils`, `game-sense/lib/storage` | dates, formatters, LAUNCH_DATE, loadDayState |
| `archiveAdapter.ts:15-21` | `street-date/lib/dateUtils`, `street-date/lib/gameState` | same |
| `archiveAdapter.ts:24-30` | `shelf-price/lib/dateUtils`, `shelf-price/lib/storage` | same |
| `src/app/play/page.tsx:13-15` | all three games' `lib/dateUtils` | three aliases of the *same* shared `getTodayDateString` — pointless triplication |

Layering smells (not cross-game): `street-date/lib/imageUtils.ts` is a 2-line re-export shim; `src/lib/ranks.ts` imports from `@/components/games/GameEndModal.copy` (lib depending on a components file — inverted).

These breakages are exactly why the shell needs a per-game **manifest** (below): shared code should consume a registration, not reach into game folders.

## 5. Proposed game-shell architecture (proposal only — nothing built)

### 5.1 Shared primitives (one implementation each)

From the table, the shell package (suggested home: `src/components/games/shell/` + `src/lib/game-shell/`):

- `createDayStore<T>(keyPrefix, defaultState, migrate?)` — rows 8 (existing keys unchanged)
- `getDailyCompletion(slug, date)` — row 9 (single read path; fixes the TodayCard bug; uses Europe/London date)
- `makeGameDates(launchDate)` — row 7
- `seededRng` module exposing **both** `mulberry32(seed)` and street-date's LCG, so outputs stay bit-identical — row 6
- `buildShareText(...)` + `SplitShareButton` (already extracted to `src/components/games/SplitShareButton.tsx`, awaiting wiring) — row 5
- `useGameEntrance()`, `<GameWorld>`, `<GameTitle>` — row 10
- `<ScorePill>`, `<GameNavPills>`, `<RulesModal>`, `<PlayableGuard>`, `useMobileThemeColor`, `formatElapsed`, `<NextPuzzleCountdown>` (new) — rows 11, 12, 2, 16, 14, 20, 3
- `PostGameAnalysisCard` (header + stat-pill row + per-game children slot) — row 1
- `BADGE_IMAGES` relocated to `@/lib/ranks` — row 15
- Server-side today-redirect helper — row 13

### 5.2 Identity preserved via theming, never forking

Extend `GAME_COLORS` (`ranks.ts:49-69`) into a full `GAME_THEME` record per game:

```
{ accent, accentDark (3D shadows), worldGradient, statusBarHex, confettiPalette }
```

Today's theming is three mechanisms in tension: token-ish `GAME_COLORS` (but shelf-price's accent is a raw `#5B4FCF` with **no CSS variable** — add `--game-purple`), hardcoded page gradients/status-bar hexes (gs `#2D6BC4`, sd `#1A7A40`, sp `#5B4FCF`), and shared neutrals (`--game-ink/cream/...` + `game-container`, used consistently). The shell consumes `GAME_THEME[slug]`; bespoke visuals (SentenceClue, drag-and-drop board, GameCards) remain per-game components passed into shell slots (`heroZone`-style, as the dead GameEndModal already prototyped with its `heroZone`/`pipRow` props).

### 5.3 The per-game manifest (where badges/streaks/accounts plug in once)

Replace `archiveAdapter`'s reach-into-folders with a registration each game owns:

```
interface DailyGameManifest {
  slug: GameSlug                      // extend the union to all six games
  launchDate: string
  storageKeyPrefix: string            // 'game_sense_' | 'street_date_v3_' | 'shelf_price_v2_'
  loadDayState(date): unknown
  toDayResult(state): { won, finished, score, rank } // normalised — note current asymmetry: gs uses `won`, sd/sp use `finished`
  theme: GameTheme
  shareRows(state): string[]
}
```

Registered manifests give the archive viewer, `DailyBadgeShelf`, `TodayCard`, streak computation, and the future **Supabase badges sync** a single integration surface. Memo Board and Crossword then ship by writing a manifest + identity components and inherit rules modal, end screen, share, archive, badges, streaks, and countdown for free. This is also the seam `audit/foundations.md` identifies for server-side result validation.

### 5.4 Sequencing note

The post-game sequencing contract is already uniform (`pgStep = useEntranceSteps(7, POSTGAME_GAPS, ...)` in all three dailies) and the layout contract nearly so (gs/sd grid vs sp's intentional flex variant via `PostGameLeftColumn.className`). Extraction order that minimises risk: rows marked LOW that don't touch animation (8, 9, 7, 15, 5, 12, 20) → RulesModal + guards (2, 16, 14) → analysis card (1) → entrance hooks (10, 11) → RNG (6, with snapshot tests of puzzle output per date) → blitz/ship-it adoption (1, 19) last.
