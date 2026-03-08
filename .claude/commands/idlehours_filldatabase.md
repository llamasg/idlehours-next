# Fill Database — Pull & Enrich Games

You are expanding the Idle Hours game database. The user has requested $ARGUMENTS new games. If no quantity was provided, ask the user how many games they want to add.

## Step 1: Pull from IGDB

If the user's arguments include "manifest" or "smart", use manifest mode. Otherwise use blind mode.

**Blind mode** (default):
```bash
cd d:/websites/IdleHours && node scripts/igdb-pull.mjs $ARGUMENTS
```

**Manifest mode** (targeted gap-filling):
```bash
cd d:/websites/IdleHours && node scripts/igdb-pull.mjs $ARGUMENTS --manifest
```

Manifest mode audits the database first, then prioritises underrepresented genres and eras before doing general fills. Run `node scripts/db-manifest.mjs` to see the current audit.

This creates `scripts/.igdb-staging.json` with unenriched game entries (vibe: null, launchPriceUsd: null, pegi: often null).

If the script fails due to missing credentials, tell the user to add `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` to `.env.local`.

## Step 2: Enrich Games

Read `scripts/.igdb-staging.json`. For each game entry, generate ALL of the following:

### Vibe (required — no nulls allowed)
- A 3-6 word lowercase noun phrase
- Must fit naturally in: "A [genre] game about [VIBE] released in [year]"
- Examples: "surviving alien horrors in space", "building medieval kingdoms", "racing through neon cities"
- No articles at the start ("a", "the")
- No proper nouns unless essential (e.g. "exploring hyrule" is fine for Zelda)

### PEGI Rating (required — no nulls allowed)
- IGDB often returns null for this. You MUST fill it in using your knowledge.
- Valid values: 3, 7, 12, 16, 18
- Base it on game content: violence level, language, sexual content, horror elements
- PEGI 3: family-friendly (Mario, Minecraft, Tetris)
- PEGI 7: mild violence, scary scenes (Zelda, Crash Bandicoot)
- PEGI 12: moderate violence, mild language (Fortnite, Assassin's Creed)
- PEGI 16: strong violence, strong language (Call of Duty, Mass Effect)
- PEGI 18: extreme violence, gore, sexual content (GTA, Doom, Witcher 3)
- When uncertain, lean toward the official rating if you know it

### Launch Price USD (required — no nulls allowed)
- The USD launch price of the game when it first released
- Use your knowledge of game pricing history
- Standard AAA prices by era: roughly 50 USD (pre-2005), roughly 60 USD (2005-2022), roughly 70 USD (2023+)
- Indie/smaller titles: typically 10-40 USD
- Free-to-play: 0
- If the game is newer than your knowledge cutoff, use era-appropriate default pricing:
  - AAA 2023+: 69.99
  - AA/indie: 29.99-39.99
- NEVER leave as null. Every game needs a price for Shelf Price to work.

### Tags (trim from IGDB)
- IGDB keywords are very verbose. Trim to max 10 useful tags.
- Always keep the decade tag (e.g. "2010s")
- Remove meta/platform tags (steam, achievements, playstation-trophies, etc.)
- Keep genre, theme, franchise, and gameplay tags

## Step 3: Append to Database

1. Read `src/data/games-db.ts`
2. For each enriched game, format as a TypeScript object matching the existing style:
   - Single-quoted strings
   - 2-space indentation per property
   - Trailing comma after each property and each object
   - Arrays inline for short lists, multiline if long
3. Insert all new entries before the closing `]` of the GAMES_DB array
4. Delete `scripts/.igdb-staging.json`

## Step 4: Validate — Zero Nulls Policy

Run these checks:
1. No duplicate IDs: `grep "id: '" src/data/games-db.ts | sort | uniq -d` should return nothing
2. **No null vibes**: `grep "vibe: null" src/data/games-db.ts` should return nothing
3. **No null PEGI**: `grep "pegi: null" src/data/games-db.ts` should return nothing for NEW entries
4. **No null prices**: `grep "launchPriceUsd: null" src/data/games-db.ts` should return nothing for NEW entries
5. All vibes are 3-6 words
6. All prices are 0-100
7. All PEGI values are 3, 7, 12, 16, or 18
8. All games have at least 3 tags
9. Run `npm run build` to verify the project still builds

If ANY validation fails, fix the entries before reporting.

## Step 5: Report

Print a summary:
- Number of games added
- New database total
- Number with vibes (should be 100%)
- Number with prices (should be 100%)
- Number with PEGI ratings (should be 100%)
- Number with cover art (igdbImageId)
- Any games that needed default pricing (list them)

Do NOT commit — the user will decide when to commit.
