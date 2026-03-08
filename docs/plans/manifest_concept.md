## Transition Note

For the first ~2,000 games, blind IGDB pulls sorted by `rating_count` are sufficient — the top-rated games on IGDB naturally cover the universal canon. Once core popular titles are covered, transition to manifest-driven pulls with genre/era quotas as described below. The `/idlehours_filldatabase` skill and `scripts/igdb-pull.mjs` are the current pipeline; this manifest is the target architecture for the next phase.

---

The current plan doesn't account for this at all — "pull 200 games sorted by IGDB rating_count" will give you a reasonable spread but it's not strategic. You'll end up with gaps. Probably over-indexed on Western AAA, under-indexed on Japanese games, old PC games, indie darlings that have low rating counts despite being culturally essential.
The scatter approach needs to be baked into the script as a priority queue, not left to IGDB's sorting.
Here's how to think about it. Define tiers upfront:
Tier 1 — 0 to 500 games
  The universal canon. Games everyone has heard of regardless of age or preference.
  Minecraft, Tetris, Mario, GTA, FIFA, Pokémon, Fortnite, Zelda, Halo, Sonic.
  If someone's mum has heard of it, it's Tier 1.

Tier 2 — 500 to 2000 games  
  Genre-literate essentials. Every serious gamer knows these.
  One game per major franchise beyond the flagship entry.
  The defining game of every major genre and era.
  Indie hits with genuine cultural reach — Stardew, Hollow Knight, Celeste, Hades.

Tier 3 — 2000 to 5000 games
  Genre depth. The games enthusiasts know.
  Deep franchise cuts, cult classics, beloved regional hits.
  Games that win GOTY nominations without winning.

Tier 4 — 5000+ games
  Long tail. Obscure, regional, niche, beloved-by-few.
  The games that make a Blitz player feel genuinely rewarded for knowing them.
The genre spread problem
IGDB rating_count skews heavily toward English-language, console, post-2000 games. Left to its own devices your database will be 40% shooter/action and have almost no strategy, simulation, visual novel, or pre-1995 content. You need explicit genre quotas per run.
The solution — a target manifest
Instead of the script deciding what to fetch, you define a manifest that tells the script what gaps to fill. The script's job is to match the manifest, not to freestyle:
typescript// scripts/db-manifest.ts
// Target counts per category — script fills toward these numbers
export const MANIFEST = {
  // Tiers by popularity (IGDB rating_count thresholds)
  tier1: { target: 500,  minRatingCount: 5000  },
  tier2: { target: 2000, minRatingCount: 1000  },
  tier3: { target: 5000, minRatingCount: 100   },
  tier4: { target: 10000, minRatingCount: 0    },

  // Genre quotas — enforced per run
  // Script won't add more than this % of any genre until all genres hit minimum
  genreTargets: {
    'Action':          { min: 200, maxPercent: 20 },
    'Platformer':      { min: 150, maxPercent: 15 },
    'RPG':             { min: 200, maxPercent: 20 },
    'Strategy':        { min: 150, maxPercent: 15 },
    'Simulation':      { min: 100, maxPercent: 10 },
    'Shooter':         { min: 150, maxPercent: 15 },
    'Adventure':       { min: 150, maxPercent: 15 },
    'Horror':          { min: 75,  maxPercent: 8  },
    'Sports':          { min: 100, maxPercent: 10 },
    'Fighting':        { min: 75,  maxPercent: 8  },
    'Puzzle':          { min: 75,  maxPercent: 8  },
    'Visual Novel':    { min: 50,  maxPercent: 5  },
    'JRPG':            { min: 100, maxPercent: 10 },
    'Racing':          { min: 75,  maxPercent: 8  },
    'Indie':           { min: 200, maxPercent: 20 },
  },

  // Era spread — enforced per run
  eraTargets: {
    'pre-1990':  { min: 50  },
    '1990-1999': { min: 150 },
    '2000-2009': { min: 200 },
    '2010-2019': { min: 400 },
    '2020-2026': { min: 200 },
  }
}
How the script knows what to add each run
At the start of every run, the script audits the current database against the manifest and builds a priority fetch list:
typescriptasync function getPriorityFetchList(currentDB: GameEntry[]): Promise<IGDBQuery[]> {
  const queries = []

  // 1. Which genres are under their minimum? Fetch those first.
  for (const [genre, target] of Object.entries(MANIFEST.genreTargets)) {
    const current = currentDB.filter(g => g.genres.includes(genre)).length
    if (current < target.min) {
      queries.push({
        genre,
        needed: target.min - current,
        priority: 'high',
        minRatingCount: getTierThreshold(currentDB.length)
      })
    }
  }

  // 2. Which eras are under minimum?
  for (const [era, target] of Object.entries(MANIFEST.eraTargets)) {
    const [from, to] = parseEra(era)
    const current = currentDB.filter(g => g.year >= from && g.year <= to).length
    if (current < target.min) {
      queries.push({ era, needed: target.min - current, priority: 'high' })
    }
  }

  // 3. Fill remaining slots with general tier-appropriate games
  // sorted by rating_count descending (most popular first)
  const remaining = 200 - queries.reduce((sum, q) => sum + q.needed, 0)
  if (remaining > 0) {
    queries.push({
      general: true,
      needed: remaining,
      minRatingCount: getTierThreshold(currentDB.length),
      excludeIds: currentDB.map(g => g.id)
    })
  }

  return queries
}

function getTierThreshold(dbSize: number): number {
  if (dbSize < 500)  return 5000   // Tier 1 — only well-known games
  if (dbSize < 2000) return 1000   // Tier 2
  if (dbSize < 5000) return 100    // Tier 3
  return 0                          // Tier 4 — anything goes
}
```

So every run is self-aware. At 900 games it knows it's in Tier 2 territory, checks which genres are underrepresented, fetches those first, then fills the remainder with popular games not yet in the database. You never have to think about what to add — the manifest drives it automatically.

**The run log tells you exactly what happened**
```
Run completed — 200 games added
  Gap-filling: 45 Strategy games (was 12, needed 150)
  Gap-filling: 30 Visual Novel games (was 2, needed 50)  
  Gap-filling: 25 pre-1990 era games (was 8, needed 50)
  General tier-2 fill: 100 games (rating_count > 1000)
  
  Database now: 1,100 games
  Tier progress: Tier 2 (target 2,000)
  Genres under minimum: Sports (45/100), Fighting (20/75), Racing (18/75)
  Next run will prioritise: Sports, Fighting, Racing
You run the command, the log tells you the shape of the database, next run automatically picks up where the gaps are. No manual decisions needed.