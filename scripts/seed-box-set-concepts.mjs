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
const STORE_CAP = 40

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

const PRICES = [9.99, 14.99, 19.99, 24.99, 29.99, 34.99, 39.99, 49.99, 59.99, 69.99]

const PLATFORM_FAMILIES = {
  pc: { label: 'NEVER LEFT THE PC', platforms: ['PC', 'Mac', 'Linux'] },
  playstation: { label: 'PLAYSTATION EXCLUSIVES', platforms: ['PlayStation', 'PS1', 'PS2', 'PS3', 'PS4', 'PS5', 'PSP', 'PS Vita'] },
  nintendo: { label: 'NINTENDO EXCLUSIVES', platforms: ['Nintendo', 'Switch', 'Wii', 'Wii U', '3DS', 'DS', 'SNES', 'N64', 'GameCube', 'Game Boy'] },
  xbox: { label: 'XBOX EXCLUSIVES', platforms: ['Xbox', 'Xbox 360', 'Xbox One', 'Xbox Series X'] },
}

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

function bank(concepts, { id, label, tier, type, predicate }, minMatches) {
  const matches = resolve(predicate)
  const popularMatches = matches.filter(popular)
  if (popularMatches.length < minMatches) {
    return { banked: false, popular: popularMatches.length }
  }
  const gameIds = popularMatches
    .sort((a, b) => a.popularityRank - b.popularityRank)
    .slice(0, STORE_CAP)
    .map((g) => g.id)
  concepts.push({ id, label, tier, type, predicate, gameIds, usedOn: null })
  return { banked: true, popular: popularMatches.length }
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

// GREEN — narrow procedural
for (const price of PRICES) {
  const r = bank(concepts, {
    id: `green-price-${String(price).replace('.', '-')}`,
    label: `LAUNCHED AT $${price}`,
    tier: 'green',
    type: 'procedural',
    predicate: { field: 'launchPriceUsd', op: 'eq', value: price },
  }, MIN_MATCHES)
  r.banked ? report.green++ : report.rejected.push(`green-price-${price} (${r.popular})`)
}
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
bank(concepts, {
  id: 'green-opencritic-rough',
  label: 'CRITICS WERE NOT KIND (60 OR BELOW)',
  tier: 'green',
  type: 'procedural',
  predicate: { all: [{ field: 'openCritic', op: 'gte', value: 1 }, { field: 'openCritic', op: 'lte', value: 60 }] },
}, MIN_MATCHES) && report.green++
for (const [famId, fam] of Object.entries(PLATFORM_FAMILIES)) {
  const r = bank(concepts, {
    id: `green-exclusive-${famId}`,
    label: fam.label,
    tier: 'green',
    type: 'procedural',
    predicate: { field: 'platforms', op: 'only', value: fam.platforms },
  }, MIN_MATCHES)
  r.banked ? report.green++ : report.rejected.push(`green-exclusive-${famId} (${r.popular})`)
}
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

// BLUE — thematic via tags
for (const [tag, label] of Object.entries(TAG_LABELS)) {
  const r = bank(concepts, {
    id: `blue-tag-${tag}`,
    label,
    tier: 'blue',
    type: 'tag',
    predicate: { field: 'tags', op: 'includes', value: tag },
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
