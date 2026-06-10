#!/usr/bin/env node
/**
 * Box Set concept-bank seeder.
 *
 * Enumerates concepts per tier, resolves each against GAMES_DB, banks those
 * with enough recognisable matches, and writes
 * src/app/play/box-set/data/concepts.json. Idempotent EXCEPT it preserves
 * usedOn dates for concepts that already exist (re-seeding never un-retires
 * a concept).
 *
 * Usage: node scripts/seed-box-set-concepts.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { loadGamesDb } from './lib/load-games-db.mjs'
import { evaluatePredicate } from '../src/app/play/box-set/lib/predicates.mjs'
import { WORDPLAY_MATCHERS, WORD_LISTS } from '../src/app/play/box-set/lib/wordplayMatchers.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'src/app/play/box-set/data/concepts.json')

/** Popularity threshold: a match only counts as "recognisable" at or under this rank. */
const POP_RANK = 100
/** Yellow/green/blue concepts need this many recognisable matches to bank. */
const MIN_MATCHES = 6
/** Purple (wordplay) concepts bank at 4+; 4–5 flagged as tight. */
const MIN_PURPLE = 4
/** Stored gameIds are the most popular matches, capped. */
const STORE_CAP = 60

// ── Tier definitions ─────────────────────────────────────────────────────────

const GENRE_LABELS = {
  Adventure: 'ADVENTURE GAMES',
  RPG: 'RPGS',
  Shooter: 'SHOOTERS',
  Strategy: 'STRATEGY GAMES',
  Action: 'ACTION GAMES',
  Puzzle: 'PUZZLE GAMES',
  Indie: 'INDIE GAMES',
  Platform: 'PLATFORMERS',
  Simulator: 'SIMULATORS',
  Racing: 'RACING GAMES',
  Arcade: 'ARCADE GAMES',
  Fighting: 'FIGHTING GAMES',
  Sport: 'SPORTS GAMES',
  Survival: 'SURVIVAL GAMES',
  Horror: 'HORROR GAMES',
  Sandbox: 'SANDBOX GAMES',
  Music: 'MUSIC GAMES',
  Roguelike: 'ROGUELIKES',
  Metroidvania: 'METROIDVANIAS',
}

const DECADES = [
  { id: '1980s', label: 'RELEASED IN THE 1980s', range: [1980, 1989] },
  { id: '1990s', label: 'RELEASED IN THE 1990s', range: [1990, 1999] },
  { id: '2000s', label: 'RELEASED IN THE 2000s', range: [2000, 2009] },
  { id: '2010s', label: 'RELEASED IN THE 2010s', range: [2010, 2019] },
  { id: '2020s', label: 'RELEASED IN THE 2020s', range: [2020, 2029] },
]

// Playtest feedback: price-band concepts ("LAUNCHED AT $19.99") are too
// unknown — removed. Family-level exclusives (PlayStation/Xbox) were too
// broad — replaced with retro/niche console presence, which players can
// actually reason about.
const RETRO_PLATFORMS = {
  snes: { label: 'PLAYABLE ON THE SNES', platform: 'SNES' },
  n64: { label: 'PLAYABLE ON THE N64', platform: 'N64' },
  gamecube: { label: 'PLAYABLE ON THE GAMECUBE', platform: 'GameCube' },
  gameboy: { label: 'PLAYABLE ON THE GAME BOY', platform: 'Game Boy' },
  ps1: { label: 'PLAYABLE ON THE PS1', platform: 'PS1' },
  psp: { label: 'PLAYABLE ON THE PSP', platform: 'PSP' },
  ds: { label: 'PLAYABLE ON THE DS', platform: 'DS' },
  wii: { label: 'PLAYABLE ON THE WII', platform: 'Wii' },
  '3ds': { label: 'PLAYABLE ON THE 3DS', platform: '3DS' },
}

// Curated concepts — human-researched id lists, verified as membership
// predicates (zero runtime external facts; the truth claim is the reviewed
// list itself). Overlaps between lists are fine: assembly's unambiguity
// check prevents two overlapping concepts sharing a day.
const CURATED = [
  {
    id: 'blue-curated-tga-goty',
    label: 'WON GAME OF THE YEAR AT THE GAME AWARDS',
    note: 'TGA GOTY winners 2014-2024',
    gameIds: ['dragon-age-inquisition', 'the-witcher-3-wild-hunt', 'overwatch', 'the-legend-of-zelda-breath-of-the-wild', 'god-of-war', 'sekiro-shadows-die-twice', 'the-last-of-us-part-ii', 'it-takes-two', 'elden-ring', 'baldurs-gate-3', 'astro-bot'],
  },
  {
    id: 'blue-curated-mmo',
    label: 'FAMOUS MMOS',
    note: 'long-running massively multiplayer online games',
    gameIds: ['world-of-warcraft', 'final-fantasy-xiv', 'guild-wars-2', 'runescape', 'the-elder-scrolls-online', 'black-desert', 'lost-ark', 'star-wars-the-old-republic', 'guild-wars'],
  },
  {
    id: 'blue-curated-esports',
    label: 'ESPORTS MAINSTAYS',
    note: 'staple competitive titles with major pro scenes',
    gameIds: ['counter-strike-global-offensive', 'dota-2', 'league-of-legends', 'rocket-league', 'starcraft-ii-wings-of-liberty', 'valorant', 'overwatch', 'apex-legends', 'super-smash-bros-melee', 'fortnite'],
  },
  {
    id: 'blue-curated-rough-launch',
    label: 'NOTORIOUSLY ROUGH LAUNCHES',
    note: 'famous broken/underwhelming launch states, later fixed or not',
    gameIds: ['cyberpunk-2077', 'no-man-s-sky', 'fallout-76', 'battlefield-2042', 'anthem', 'simcity', 'diablo-iii'],
  },
  {
    id: 'blue-curated-controversial-sequel',
    label: 'SEQUELS THAT SPLIT THE FANBASE',
    note: 'divisive follow-ups (2017 Battlefront II and ME: Andromeda not in db)',
    gameIds: ['the-last-of-us-part-ii', 'duke-nukem-forever', 'dmc-devil-may-cry', 'diablo-iii', 'fallout-76', 'mighty-no-9'],
  },
  {
    id: 'blue-curated-started-as-mods',
    label: 'STARTED LIFE AS A MOD',
    note: 'shipped games that began as mods of other games',
    gameIds: ['counter-strike', 'dota-2', 'dayz', 'team-fortress-2', 'garrys-mod', 'pubg-battlegrounds', 'team-fortress-classic'],
  },
  {
    id: 'blue-curated-battle-royale',
    label: 'BATTLE ROYALE GIANTS',
    note: 'the big last-one-standing games',
    gameIds: ['fortnite', 'pubg-battlegrounds', 'apex-legends', 'fall-guys', 'call-of-duty-warzone', 'tetris-99'],
  },
  {
    id: 'blue-curated-kickstarter',
    label: 'KICKSTARTER SUCCESS STORIES',
    note: 'famously crowdfunded and actually shipped',
    gameIds: ['shovel-knight', 'hollow-knight', 'pillars-of-eternity', 'divinity-original-sin', 'bloodstained-ritual-of-the-night', 'undertale', 'broken-age', 'yooka-laylee', 'wasteland-2', 'darkest-dungeon'],
  },
  {
    id: 'blue-curated-solo-dev',
    label: 'MADE (MOSTLY) BY ONE PERSON',
    note: 'famous solo or near-solo developed games',
    gameIds: ['stardew-valley', 'undertale', 'cave-story', 'papers-please', 'rollercoaster-tycoon', 'minecraft-java-edition', 'braid', 'fez', 'dust-an-elysian-tail', 'axiom-verge', 'banished'],
  },
  {
    id: 'blue-curated-pack-in',
    label: 'CAME FREE WITH THE CONSOLE',
    note: 'famous pack-in titles (Wii Sports, GB Tetris, Genesis Sonic...)',
    gameIds: ['wii-sports', 'tetris', 'super-mario-world', 'astros-playroom', 'wii-play', 'nintendo-land', 'duck-hunt', 'sonic-the-hedgehog'],
  },
  {
    id: 'blue-curated-dev-hell',
    label: 'ESCAPED DEVELOPMENT HELL',
    note: 'famously long/troubled development before finally shipping',
    gameIds: ['duke-nukem-forever', 'the-last-guardian', 'final-fantasy-xv', 'cyberpunk-2077', 'dead-island-2', 'owlboy', 'alan-wake', 'spore'],
  },
  {
    id: 'blue-curated-couch-coop',
    label: 'COUCH CO-OP CLASSICS',
    note: 'best played on one sofa',
    gameIds: ['overcooked', 'it-takes-two', 'castle-crashers', 'gang-beasts', 'moving-out', 'lovers-in-a-dangerous-spacetime', 'towerfall-ascension', 'cuphead', 'a-way-out', 'rayman-legends'],
  },
  {
    id: 'blue-curated-remakes',
    label: 'REMADE FROM THE GROUND UP',
    note: 'full remakes, not remasters',
    gameIds: ['resident-evil-2-remake', 'final-fantasy-vii-remake', 'demons-souls-remake', 'shadow-of-the-colossus-2018', 'mafia-definitive-edition', 'crash-bandicoot-n-sane-trilogy', 'spyro-reignited-trilogy', 'metroid-zero-mission'],
  },
  {
    id: 'blue-curated-banned',
    label: 'BANNED SOMEWHERE IN THE WORLD',
    note: 'banned or refused classification in at least one country',
    gameIds: ['manhunt', 'manhunt-2', 'grand-theft-auto-san-andreas', 'mortal-kombat-ii', 'carmageddon', 'postal-2', 'hatred', 'wolfenstein-3d'],
  },
]

// Blue tier: tag → human label. Only tags listed here are eligible — quality
// over coverage. Tags that resist a clean label are reported, not banked.
const TAG_LABELS = {
  magic: 'GAMES FULL OF MAGIC',
  atmospheric: 'ATMOSPHERE IS THE POINT',
  military: 'MILITARY OPERATIONS',
  crafting: 'GAMES WHERE YOU CRAFT',
  'martial-arts': 'MARTIAL ARTS GAMES',
  medieval: 'SET IN MEDIEVAL TIMES',
  'post-apocalyptic': 'AFTER THE APOCALYPSE',
  'sci-fi': 'SCIENCE FICTION',
  aliens: 'ALIENS INVOLVED',
  stealth: 'GAMES WHERE YOU SNEAK',
  zombies: 'ZOMBIES INVOLVED',
  crime: 'A LIFE OF CRIME',
  robots: 'ROBOTS INVOLVED',
  cyberpunk: 'CYBERPUNK WORLDS',
  ninja: 'NINJA GAMES',
  superhero: 'SUPERHERO GAMES',
  detective: 'GAMES WHERE YOU INVESTIGATE',
  war: 'GAMES SET AT WAR',
  'dark-fantasy': 'DARK FANTASY WORLDS',
  ghosts: 'GHOSTS INVOLVED',
  'pixel-art': 'PIXEL ART GAMES',
  'female-protagonist': 'YOU PLAY AS A WOMAN',
  'multiple-endings': 'MORE THAN ONE ENDING',
  anime: 'ANIME STYLE',
  'open-world': 'OPEN WORLDS',
  'co-op': 'BETTER WITH A FRIEND (CO-OP)',
  'survival-horror': 'SURVIVAL HORROR',
  horror: 'HORROR GAMES',
  'free-to-play': 'FREE TO PLAY',
  jrpg: 'JRPGS',
  metroidvania: 'METROIDVANIAS',
  roguelike: 'ROGUELIKES',
  'side-scrolling': 'SIDE SCROLLERS',
  'turn-based': 'YOU TAKE TURNS',
  fishing: 'GAMES WHERE YOU FISH',
  pirates: 'PIRATES INVOLVED',
  vampires: 'VAMPIRES INVOLVED',
  dinosaurs: 'DINOSAURS INVOLVED',
  fantasy: 'FANTASY WORLDS',
  space: 'SET IN SPACE',
  racing: 'GAMES ABOUT GOING FAST',
  farming: 'GAMES WHERE YOU FARM',
  cooking: 'GAMES WHERE YOU COOK',
  'time-travel': 'TIME TRAVEL INVOLVED',
  dystopian: 'DYSTOPIAN FUTURES',
  mythology: 'BUILT ON MYTHOLOGY',
  samurai: 'SAMURAI GAMES',
  'building': 'GAMES WHERE YOU BUILD',
  underwater: 'SET UNDERWATER',
  'boss-fight': 'BIG BOSS FIGHTS',
  wrestling: 'WRESTLING GAMES',
  skateboarding: 'SKATEBOARDING GAMES',
  snowboarding: 'SNOWBOARDING GAMES',
  cars: 'CARS INVOLVED',
  trains: 'TRAINS INVOLVED',
  cats: 'CATS INVOLVED',
  dogs: 'DOGS INVOLVED',
  dragons: 'DRAGONS INVOLVED',
}

// Known tags deliberately NOT banked (resist clean labels or duplicate other
// tiers) — reported in the summary.
const TAG_REJECTS = ['adventure', 'rpg', 'shooter', 'strategy', 'indie', 'platform', 'puzzle', 'action', 'classic', 'simulator', 'arcade', 'fighting', 'sport', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s', 'bloody', 'licensed-game', 'story-rich', 'story-driven', 'cinematic', 'dark', 'minigames', 'competitive', 'online', 'multiplayer', 'narrative', 'retro', 'exploration', 'action-adventure', 'nintendo', 'pokemon', 'management', 'tactical', 'fps', 'death', 'modern-warfare', 'vehicular-combat', 'helicopter', 'brawler', 'multiple-protagonists']

// Purple tier: matcher name → label. Every entry must exist in
// WORDPLAY_MATCHERS; the seeder fails loudly if not.
const PURPLE_LABELS = {
  'one-word-title': 'ONE-WORD TITLES',
  'exactly-two-words': 'EXACTLY TWO WORDS',
  'five-plus-words': 'TITLES OF FIVE WORDS OR MORE',
  'title-with-colon': 'TITLES WITH A COLON',
  'title-with-digit': 'TITLES CONTAINING A NUMBER',
  'roman-numeral': 'ROMAN NUMERALS',
  'starts-with-the': "TITLES STARTING WITH 'THE'",
  'of-the-title': "TITLES CONTAINING 'OF THE'",
  'possessive-title': 'SOMEBODY OWNS THIS GAME (POSSESSIVE TITLES)',
  'alliterative-title': 'ALLITERATIVE TITLES',
  'one-word-gerund': 'ONE WORD, ENDS IN -ING',
  'title-with-ampersand': 'TITLES WITH AN AMPERSAND',
  'title-with-exclamation': 'TITLES WITH AN EXCLAMATION MARK',
  'one-word-verb': 'ONE-WORD TITLES THAT ARE VERBS',
  'repeated-word-title': 'TITLES THAT REPEAT A WORD',
  'starts-and-ends-same-letter': 'START AND END WITH THE SAME LETTER',
  'hyphenated-title': 'HYPHENATED TITLES',
  'long-single-word': 'ONE LONG WORD (9+ LETTERS)',
}

const LIST_LABELS = {
  colour: 'TITLES CONTAINING A COLOUR',
  'number-word': 'TITLES SPELLING OUT A NUMBER',
  animal: 'TITLES CONTAINING AN ANIMAL',
  'body-part': 'TITLES CONTAINING A BODY PART',
  weather: 'TITLES CONTAINING WEATHER',
  celestial: 'TITLES IN THE SKY (CELESTIAL WORDS)',
  'time-of-day': 'TITLES CONTAINING A TIME OF DAY',
  season: 'TITLES CONTAINING A SEASON',
  element: 'TITLES CONTAINING AN ELEMENT',
  'metal-or-gem': 'TITLES CONTAINING A METAL OR GEM',
  royalty: 'TITLES FIT FOR ROYALTY',
  death: 'TITLES ABOUT DEATH',
  war: 'TITLES READY FOR WAR',
  creature: 'TITLES CONTAINING A MONSTER',
  divine: 'HEAVENLY (OR HELLISH) TITLES',
  'water-body': 'TITLES CONTAINING A BODY OF WATER',
  structure: 'TITLES CONTAINING A BUILDING',
  direction: 'TITLES POINTING SOMEWHERE',
  journey: 'TITLES ABOUT A JOURNEY',
  profession: 'TITLES CONTAINING A JOB',
  family: 'TITLES CONTAINING FAMILY MEMBERS',
  emotion: 'TITLES WITH STRONG FEELINGS',
  'dark-light': 'TITLES OF DARKNESS AND LIGHT',
  fortune: 'TITLES ABOUT GETTING RICH',
  legend: 'TITLES OF LEGEND',
  world: 'TITLES CONTAINING A WORLD',
  music: 'MUSICAL TITLES',
  food: 'TITLES CONTAINING FOOD',
  'sports-gear': 'TITLES CONTAINING SPORTS WORDS',
  vehicle: 'TITLES CONTAINING A VEHICLE',
  time: 'TITLES ABOUT TIME',
  weapon: 'TITLES CONTAINING A WEAPON',
  magic: 'MAGICAL TITLES',
  cold: 'COLD TITLES',
  fire: 'TITLES ON FIRE',
  space: 'TITLES IN SPACE',
  'us-place': 'TITLES CONTAINING AN AMERICAN PLACE',
  'single-letter': 'TITLES WITH A SINGLE-LETTER WORD',
  superlative: 'OVERSELLING IT (SUPER/MEGA/ULTRA…)',
  negation: 'TITLES SAYING NO',
  'new-old': 'TITLES ABOUT NEW AND OLD',
}

// ── Seeding ──────────────────────────────────────────────────────────────────

const db = await loadGamesDb()
const popular = (g) => g.popularityRank !== null && g.popularityRank <= POP_RANK

function resolve(predicate) {
  return db.filter((g) => evaluatePredicate(predicate, g))
}

function bank(concepts, { id, label, tier, type, predicate, note }, minMatches, opts = {}) {
  const matches = resolve(predicate)
  // Curated lists are recognisable by human judgment — skip the rank filter.
  const eligible = opts.skipPopularity ? matches : matches.filter(popular)
  if (eligible.length < minMatches) {
    return { banked: false, popular: eligible.length }
  }
  const gameIds = eligible
    .sort((a, b) => a.popularityRank - b.popularityRank)
    .slice(0, STORE_CAP)
    .map((g) => g.id)
  const concept = { id, label, tier, type, predicate, gameIds, usedOn: null }
  if (note) concept.note = note
  concepts.push(concept)
  return { banked: true, popular: eligible.length }
}

const concepts = []
const report = { yellow: 0, green: 0, blue: 0, purple: 0, purpleTight: [], rejected: [] }

// YELLOW — broad procedural: genres + decades
for (const [genre, label] of Object.entries(GENRE_LABELS)) {
  const r = bank(concepts, {
    id: `yellow-genre-${genre.toLowerCase()}`,
    label,
    tier: 'yellow',
    type: 'procedural',
    predicate: { field: 'genres', op: 'includes', value: genre },
  }, MIN_MATCHES)
  r.banked ? report.yellow++ : report.rejected.push(`yellow-genre-${genre} (${r.popular})`)
}
for (const d of DECADES) {
  const r = bank(concepts, {
    id: `yellow-decade-${d.id}`,
    label: d.label,
    tier: 'yellow',
    type: 'procedural',
    predicate: { field: 'year', op: 'between', value: d.range },
  }, MIN_MATCHES)
  r.banked ? report.yellow++ : report.rejected.push(`yellow-decade-${d.id} (${r.popular})`)
}

// YELLOW — genre × decade combos ("1990s PLATFORMERS") to give the yellow
// tier enough depth for one retirement per day
for (const [genre, glabel] of Object.entries(GENRE_LABELS)) {
  for (const d of DECADES) {
    const r = bank(concepts, {
      id: `yellow-${genre.toLowerCase()}-${d.id}`,
      label: `${d.id} ${glabel}`,
      tier: 'yellow',
      type: 'procedural',
      predicate: { all: [
        { field: 'genres', op: 'includes', value: genre },
        { field: 'year', op: 'between', value: d.range },
      ] },
    }, MIN_MATCHES)
    if (r.banked) report.yellow++
  }
}

// YELLOW — arcade-era classics (playtest suggestion: Pac-Man/Tetris energy)
bank(concepts, {
  id: 'yellow-arcade-era',
  label: 'STARTED IN THE ARCADES',
  tier: 'yellow',
  type: 'procedural',
  predicate: { all: [
    { field: 'genres', op: 'includes', value: 'Arcade' },
    { field: 'year', op: 'lte', value: 1995 },
  ] },
}, MIN_MATCHES) && report.yellow++

// GREEN — narrow procedural
bank(concepts, {
  id: 'green-price-free',
  label: 'FREE AT LAUNCH',
  tier: 'green',
  type: 'procedural',
  predicate: { field: 'launchPriceUsd', op: 'eq', value: 0 },
}, MIN_MATCHES) && report.green++
for (const pegi of [3, 7, 18]) {
  const r = bank(concepts, {
    id: `green-pegi-${pegi}`,
    label: pegi === 18 ? 'STRICTLY FOR ADULTS (PEGI 18)' : `RATED PEGI ${pegi}`,
    tier: 'green',
    type: 'procedural',
    predicate: { field: 'pegi', op: 'eq', value: pegi },
  }, MIN_MATCHES)
  r.banked ? report.green++ : report.rejected.push(`green-pegi-${pegi} (${r.popular})`)
}
bank(concepts, {
  id: 'green-opencritic-90s',
  label: 'CRITICS SCORED THESE 90+',
  tier: 'green',
  type: 'procedural',
  predicate: { field: 'openCritic', op: 'gte', value: 90 },
}, MIN_MATCHES) && report.green++
// Playtest feedback: critic-reception concepts only work for games people
// remember the discourse around — modern era only, and never pre-2012.
bank(concepts, {
  id: 'green-critics-panned-modern',
  label: 'MODERN GAMES THE CRITICS PANNED',
  tier: 'green',
  type: 'procedural',
  predicate: { all: [
    { field: 'openCritic', op: 'gte', value: 1 },
    { field: 'openCritic', op: 'lte', value: 60 },
    { field: 'year', op: 'gte', value: 2012 },
  ] },
}, MIN_MATCHES) && report.green++
for (const [consoleId, c] of Object.entries(RETRO_PLATFORMS)) {
  const r = bank(concepts, {
    id: `green-console-${consoleId}`,
    label: c.label,
    tier: 'green',
    type: 'procedural',
    predicate: { field: 'platforms', op: 'includes', value: c.platform },
  }, MIN_MATCHES)
  r.banked ? report.green++ : report.rejected.push(`green-console-${consoleId} (${r.popular})`)
}
// Console-specific narrow window (playtest: modern consoles only work with
// a tight filter)
bank(concepts, {
  id: 'green-ps5-early',
  label: 'EARLY PS5 GAMES (2020-21)',
  tier: 'green',
  type: 'procedural',
  predicate: { all: [
    { field: 'platforms', op: 'includes', value: 'PS5' },
    { field: 'year', op: 'between', value: [2020, 2021] },
  ] },
}, MIN_MATCHES) && report.green++
// Single release years with enough popular games
for (let year = 1988; year <= 2025; year++) {
  const r = bank(concepts, {
    id: `green-year-${year}`,
    label: `RELEASED IN ${year}`,
    tier: 'green',
    type: 'procedural',
    predicate: { field: 'year', op: 'eq', value: year },
  }, 8)
  if (r.banked) report.green++
}

// BLUE — curated, human-researched lists (membership predicates)
for (const c of CURATED) {
  const r = bank(concepts, {
    id: c.id,
    label: c.label,
    tier: 'blue',
    type: 'curated',
    note: c.note,
    predicate: { field: 'id', op: 'memberOf', value: c.gameIds },
  }, MIN_PURPLE, { skipPopularity: true })
  r.banked ? report.blue++ : report.rejected.push(`${c.id} (${r.popular})`)
}

// BLUE — thematic via tags. TAG_EXCLUDES holds human-review exclusions:
// games that technically carry the tag but make the group feel cheap.
const TAG_EXCLUDES = {
  pirates: ['dlc-quest'], // playtest: "a bit of everything" game, stinker pick
}
for (const [tag, label] of Object.entries(TAG_LABELS)) {
  const excludes = TAG_EXCLUDES[tag]
  const tagClause = { field: 'tags', op: 'includes', value: tag }
  const r = bank(concepts, {
    id: `blue-tag-${tag}`,
    label,
    tier: 'blue',
    type: 'tag',
    predicate: excludes
      ? { all: [tagClause, { field: 'id', op: 'notMemberOf', value: excludes }] }
      : tagClause,
  }, MIN_MATCHES)
  r.banked ? report.blue++ : report.rejected.push(`blue-tag-${tag} (${r.popular})`)
}

// PURPLE — wordplay
const purpleCandidates = []
for (const [name, label] of Object.entries(PURPLE_LABELS)) purpleCandidates.push({ name, label })
for (const [list, label] of Object.entries(LIST_LABELS)) purpleCandidates.push({ name: `contains-${list}`, label })
for (const name of Object.keys(WORDPLAY_MATCHERS)) {
  if (name.startsWith('hides-')) {
    const sub = name.slice(6)
    purpleCandidates.push({ name, label: `TITLES HIDING '${sub.toUpperCase()}'` })
  }
}

for (const cand of purpleCandidates) {
  if (!WORDPLAY_MATCHERS[cand.name]) throw new Error(`No matcher for candidate ${cand.name}`)
  const r = bank(concepts, {
    id: `purple-${cand.name}`,
    label: cand.label,
    tier: 'purple',
    type: 'wordplay',
    predicate: { op: 'wordplay', matcher: cand.name },
  }, MIN_PURPLE)
  if (r.banked) {
    report.purple++
    if (r.popular < 6) report.purpleTight.push(`${cand.name} (${r.popular})`)
  } else {
    report.rejected.push(`purple-${cand.name} (${r.popular})`)
  }
}

// ── Preserve usedOn from any existing bank, then write ───────────────────────

let previousUsed = new Map()
if (fs.existsSync(OUT)) {
  const prev = JSON.parse(fs.readFileSync(OUT, 'utf8'))
  previousUsed = new Map(prev.concepts.filter((c) => c.usedOn).map((c) => [c.id, c.usedOn]))
}
for (const c of concepts) {
  if (previousUsed.has(c.id)) c.usedOn = previousUsed.get(c.id)
}

fs.writeFileSync(OUT, JSON.stringify({ concepts }, null, 2) + '\n')

console.log(`Banked ${concepts.length} concepts → ${path.relative(ROOT, OUT)}`)
console.log(`  yellow: ${report.yellow}  green: ${report.green}  blue: ${report.blue}  purple: ${report.purple}`)
console.log(`  purple candidates tested: ${purpleCandidates.length}`)
console.log(`  purple banked tight (4-5 popular matches): ${report.purpleTight.length}`)
if (report.purpleTight.length) console.log('    ' + report.purpleTight.join(', '))
console.log(`  rejected (${report.rejected.length}): ${report.rejected.join(', ')}`)
console.log(`  tag rejects (resist clean labels, by design): ${TAG_REJECTS.length}`)
