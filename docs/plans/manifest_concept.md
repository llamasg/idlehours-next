## Status: Implemented

The manifest-driven pipeline is now live. Two scripts work together:

- **`scripts/db-manifest.mjs`** — Defines genre/era targets, audits the database, builds priority queries
- **`scripts/igdb-pull.mjs --manifest`** — Uses manifest audit to pull games that fill gaps first

### Usage

```bash
# Audit the database — see genre/era distribution and gaps
node scripts/db-manifest.mjs

# Blind pull (original mode — sorted by rating_count)
node scripts/igdb-pull.mjs 200

# Manifest pull (targeted gap-filling first, then general fill)
node scripts/igdb-pull.mjs 200 --manifest

# Via Claude Code skill
/idlehours_filldatabase 200 manifest
```

### How it works

1. Manifest audits current `games-db.ts` against genre/era targets
2. Identifies underrepresented categories (e.g., "Music has 32/40, needs 8 more")
3. Builds IGDB queries with genre/era filters for each gap
4. Fills gaps first, then uses remaining quota for general pulls
5. Rating threshold adapts to database size (Tier 1-4 system)

### Tier system

| Tier | DB Size | Min Rating Count | Description |
|------|---------|-------------------|-------------|
| 1 | 0-500 | 5,000 | Universal canon — games everyone knows |
| 2 | 500-2,000 | 1,000 | Genre essentials — defining games per genre/era |
| 3 | 2,000-5,000 | 20 | Enthusiast depth — cult classics, deep cuts |
| 4 | 5,000+ | 5 | Long tail — obscure, regional, niche |

### Transition note

For the first ~3,500 games, blind IGDB pulls sorted by `rating_count` covered the universal canon and genre essentials well. The database is now in Tier 3 territory where blind pulls return increasingly obscure games. Manifest mode ensures gaps are filled strategically rather than hoping IGDB's sort order covers everything.

The genre/era targets in `db-manifest.mjs` should be reviewed and adjusted as the database grows. Current targets are calibrated for a 5,000-game database.
