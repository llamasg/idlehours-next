// Box Set purple-tier wordplay matchers — claims about the TITLE STRING only,
// verified by string operations against GAMES_DB titles. Zero external facts:
// a matcher may never assert anything a string comparison can't prove.
// (That rules out concepts like "named after their protagonist" — flagged in
// the phase 1b summary.)
//
// Three matcher families:
//   contains-<list>  — title has a whole word from a themed word list
//   hides-<sub>      — a word of the title CONTAINS <sub> but isn't <sub>
//                      itself ("escape" hides "ape")
//   structural       — shape claims: one-word titles, Roman numerals, colons…
//
// The seeder (scripts/seed-box-set-concepts.mjs) runs every candidate against
// the db and only banks those with enough recognisable matches.

import {
  containsWordFromList,
  titleWords,
  registerWordplayMatchers,
} from './predicates.mjs'

// ── Themed word lists ────────────────────────────────────────────────────────

export const WORD_LISTS = {
  colour: ['red', 'blue', 'green', 'black', 'white', 'crimson', 'scarlet', 'grey', 'gray', 'pink', 'purple', 'yellow', 'violet'],
  'number-word': ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'hundred', 'thousand', 'million'],
  animal: ['dog', 'dogs', 'cat', 'cats', 'wolf', 'wolves', 'bear', 'monkey', 'ape', 'bird', 'crow', 'raven', 'fox', 'rabbit', 'frog', 'shark', 'snake', 'spider', 'rat', 'horse', 'donkey', 'lion', 'tiger', 'turtle', 'crab', 'owl', 'goat', 'sheep', 'pig', 'duck', 'goose'],
  'body-part': ['eye', 'eyes', 'hand', 'hands', 'heart', 'hearts', 'head', 'bone', 'bones', 'skull', 'tooth', 'teeth', 'fist', 'fists', 'blood'],
  weather: ['storm', 'storms', 'rain', 'thunder', 'snow', 'wind', 'winds', 'fog', 'mist', 'cloud', 'clouds', 'tempest'],
  celestial: ['sun', 'moon', 'star', 'stars', 'sky', 'skies', 'eclipse', 'comet', 'planet', 'planets', 'galaxy', 'cosmic', 'solar', 'lunar'],
  'time-of-day': ['night', 'nights', 'day', 'days', 'dawn', 'dusk', 'twilight', 'midnight', 'morning'],
  season: ['winter', 'summer', 'autumn', 'spring'],
  element: ['fire', 'water', 'earth', 'air', 'ice', 'frost', 'flame', 'flames', 'inferno', 'ember', 'blaze'],
  'metal-or-gem': ['gold', 'golden', 'silver', 'iron', 'steel', 'diamond', 'emerald', 'ruby', 'crystal', 'chrome', 'copper', 'brass', 'obsidian'],
  royalty: ['king', 'kings', 'queen', 'queens', 'prince', 'princess', 'crown', 'throne', 'empire', 'emperor', 'lord', 'lords', 'royal', 'majesty', 'kingdom', 'kingdoms'],
  death: ['dead', 'death', 'deathly', 'grave', 'tomb', 'doom', 'mortal', 'fatal', 'lethal', 'reaper'],
  war: ['war', 'wars', 'battle', 'battles', 'combat', 'strike', 'assault', 'siege', 'warrior', 'warriors', 'soldier', 'soldiers', 'army', 'warfare', 'battlefield'],
  creature: ['dragon', 'dragons', 'demon', 'demons', 'devil', 'ghost', 'ghosts', 'zombie', 'zombies', 'monster', 'monsters', 'giant', 'giants', 'witch', 'vampire', 'beast', 'beasts', 'ogre', 'troll', 'golem', 'phantom', 'wraith'],
  divine: ['god', 'gods', 'goddess', 'angel', 'angels', 'hell', 'heaven', 'divine', 'holy', 'sacred', 'demon'],
  'water-body': ['sea', 'seas', 'ocean', 'river', 'lake', 'bay', 'island', 'islands', 'isle', 'shore', 'tide', 'tides', 'depths', 'abyss', 'reef'],
  structure: ['castle', 'tower', 'towers', 'city', 'cities', 'town', 'village', 'fortress', 'fort', 'dungeon', 'dungeons', 'temple', 'cave', 'caves', 'house', 'home', 'mansion', 'citadel', 'keep'],
  direction: ['north', 'south', 'east', 'west', 'beyond', 'edge', 'horizon', 'frontier'],
  journey: ['journey', 'road', 'roads', 'path', 'quest', 'odyssey', 'voyage', 'expedition', 'trail', 'trek', 'pilgrimage'],
  profession: ['hunter', 'hunters', 'thief', 'thieves', 'raider', 'raiders', 'assassin', 'commander', 'captain', 'ranger', 'pilot', 'detective', 'doctor', 'engineer', 'mechanic', 'sniper', 'agent', 'spy', 'samurai', 'ninja', 'knight', 'knights', 'pirate', 'pirates', 'wizard', 'monk', 'bard'],
  family: ['brother', 'brothers', 'sister', 'sisters', 'father', 'mother', 'son', 'sons', 'daughter', 'daughters', 'family'],
  emotion: ['rage', 'fury', 'fear', 'hate', 'hatred', 'wrath', 'vengeance', 'revenge', 'sorrow', 'grief', 'joy', 'hope', 'despair'],
  'dark-light': ['dark', 'darkness', 'shadow', 'shadows', 'light', 'lights', 'bright', 'gloom', 'dim'],
  fortune: ['fortune', 'tycoon', 'rich', 'riches', 'treasure', 'loot', 'bounty', 'jackpot'],
  legend: ['legend', 'legends', 'legendary', 'hero', 'heroes', 'myth', 'saga', 'tale', 'tales', 'chronicle', 'chronicles', 'fable', 'epic'],
  world: ['world', 'worlds', 'land', 'lands', 'realm', 'realms', 'earth', 'universe', 'dimension', 'zone'],
  music: ['song', 'songs', 'symphony', 'beat', 'beats', 'band', 'guitar', 'rock', 'dance', 'rhythm', 'melody', 'orchestra', 'opera'],
  food: ['sausage', 'pizza', 'apple', 'grape', 'melon', 'banana', 'cake', 'pie', 'bread', 'cheese', 'sushi', 'burger', 'taco', 'cooking', 'chef', 'kitchen'],
  'sports-gear': ['ball', 'bat', 'club', 'racket', 'puck', 'goal', 'golf', 'tennis', 'soccer', 'football', 'basketball', 'baseball', 'hockey', 'bowling'],
  vehicle: ['car', 'cars', 'truck', 'trucks', 'bike', 'kart', 'train', 'trains', 'plane', 'ship', 'ships', 'boat', 'submarine', 'rocket', 'tank', 'tanks', 'chopper', 'helicopter'],
  time: ['time', 'hour', 'hours', 'clock', 'eternity', 'eternal', 'forever', 'infinity', 'infinite', 'chrono', 'temporal', 'yesterday', 'tomorrow'],
  weapon: ['sword', 'swords', 'blade', 'blades', 'gun', 'guns', 'axe', 'bow', 'arrow', 'arrows', 'hammer', 'spear', 'dagger', 'cannon', 'rifle', 'pistol', 'shield'],
  magic: ['magic', 'magical', 'spell', 'spells', 'wizard', 'wizards', 'sorcery', 'sorcerer', 'arcane', 'enchanted', 'mystic', 'mana'],
  cold: ['ice', 'frost', 'frozen', 'freeze', 'snow', 'glacier', 'arctic', 'chill', 'cold'],
  fire: ['fire', 'flame', 'flames', 'burn', 'burning', 'inferno', 'ember', 'embers', 'blaze', 'scorched', 'pyre'],
  space: ['space', 'star', 'stars', 'galaxy', 'cosmos', 'cosmic', 'orbit', 'nebula', 'asteroid', 'alien', 'aliens', 'mars', 'luna'],
  'us-place': ['vegas', 'york', 'angeles', 'miami', 'chicago', 'texas', 'california', 'alaska', 'hawaii', 'america', 'american'],
  'single-letter': ['x', 'z', 'v'],
  superlative: ['super', 'mega', 'ultra', 'ultimate', 'extreme', 'max', 'hyper', 'turbo', 'grand', 'epic'],
  negation: ['no', 'not', 'never', 'none', 'nothing', 'nowhere'],
  'new-old': ['new', 'old', 'ancient', 'modern', 'final', 'first', 'last'],
}

// ── Curated lists for structural matchers ────────────────────────────────────

const ONE_WORD_VERBS = ['dredge', 'escape', 'rust', 'blink', 'dash', 'leap', 'strike', 'smash', 'jump', 'race', 'hunt', 'control', 'outlast', 'unravel', 'brawl', 'drift', 'raid', 'snipe', 'breathe', 'observe', 'descend', 'ascend', 'stray', 'grow', 'spin', 'turn', 'slay', 'crawl', 'climb', 'fly', 'dig', 'jet', 'punch', 'kick', 'roll', 'rush', 'surge', 'forge', 'haunt', 'prey', 'quake', 'wreck', 'splash', 'boom', 'crash', 'dive', 'glide', 'hollow']

const HIDE_SUBSTRINGS = ['ape', 'rat', 'cat', 'art', 'war', 'ten', 'ace', 'ice', 'ash', 'ear', 'arm', 'eve', 'end', 'red', 'age', 'man', 'den', 'era', 'owl', 'ant', 'elf', 'ore', 'win', 'sun', 'hero', 'king', 'son', 'rid', 'lab', 'ray', 'gun', 'pet', 'hat', 'rim', 'tar', 'net', 'bot']

// ── Structural matchers ──────────────────────────────────────────────────────

const ROMAN_NUMERAL = /(^|\s)(II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI)(\s|$|:)/

function isAlliterative(title) {
  const words = titleWords(title).filter((w) => /^[a-z]/.test(w))
  if (words.length < 2) return false
  const first = words[0][0]
  return words.every((w) => w[0] === first)
}

function hidesSubstring(sub) {
  return (title) =>
    titleWords(title).some((w) => w !== sub && w.includes(sub) && w.length > sub.length)
}

const STRUCTURAL_MATCHERS = {
  'one-word-title': (title) => titleWords(title).length === 1,
  'exactly-two-words': (title) => titleWords(title).length === 2,
  'five-plus-words': (title) => titleWords(title).length >= 5,
  'title-with-colon': (title) => title.includes(':'),
  'title-without-colon-three-words': (title) => !title.includes(':') && titleWords(title).length === 3,
  'title-with-digit': (title) => /\d/.test(title),
  'no-digits-or-numerals': (title) => !/\d/.test(title) && !ROMAN_NUMERAL.test(title),
  'roman-numeral': (title) => ROMAN_NUMERAL.test(title),
  'starts-with-the': (title) => /^the\s/i.test(title),
  'of-the-title': (title) => /\bof the\b/i.test(title),
  'possessive-title': (title) => /['’]s\b/.test(title),
  'alliterative-title': isAlliterative,
  'one-word-gerund': (title) => {
    const words = titleWords(title)
    return words.length === 1 && words[0].endsWith('ing') && words[0].length > 5
  },
  'title-with-ampersand': (title) => title.includes('&'),
  'title-with-exclamation': (title) => title.includes('!'),
  'one-word-verb': (title) => {
    const words = titleWords(title)
    return words.length === 1 && ONE_WORD_VERBS.includes(words[0])
  },
  'repeated-word-title': (title) => {
    const words = titleWords(title)
    return new Set(words).size < words.length && words.length >= 2
  },
  'starts-and-ends-same-letter': (title) => {
    const words = titleWords(title)
    if (words.length !== 1) return false
    const w = words[0]
    return w.length >= 4 && w[0] === w[w.length - 1]
  },
  'hyphenated-title': (title) => /\w-\w/.test(title),
  'long-single-word': (title) => {
    const words = titleWords(title)
    return words.length === 1 && words[0].length >= 9
  },
}

// ── Registry assembly ────────────────────────────────────────────────────────

/** Name → (title: string) => boolean. Concepts reference these by name. */
export const WORDPLAY_MATCHERS = {
  ...STRUCTURAL_MATCHERS,
}

for (const [listName, words] of Object.entries(WORD_LISTS)) {
  WORDPLAY_MATCHERS[`contains-${listName}`] = containsWordFromList(words)
}

for (const sub of HIDE_SUBSTRINGS) {
  WORDPLAY_MATCHERS[`hides-${sub}`] = hidesSubstring(sub)
}

registerWordplayMatchers(WORDPLAY_MATCHERS)

export { titleWords }
