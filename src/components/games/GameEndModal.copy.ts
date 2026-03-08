export const COPY = {
  win: {
    headings: ['Congrats!', "Let's go champ", 'You won!', 'Winner winner!', 'You did it!'],
    subheadings: [
      'Clean run.',
      'Nothing left to guess.',
      'Done and dusted.',
      'You knew this one.',
      "Didn't miss a beat.",
      'That was tidy.',
    ],
  },
  loss: {
    headings: ["So you didn't win...", 'Womp womp :(', 'Better luck next time', "There's always tomorrow."],
    subheadings: [
      "That's the lot for today.",
      'Come back tomorrow \u2014 it resets at midnight.',
      "Not today. Tomorrow's a fresh one.",
      'That one got away.',
      'Better luck tomorrow. Genuinely.',
      "It happens. Tomorrow's a new one.",
      'Close enough to hurt a little.',
      'Worth another go tomorrow.',
      "Today wasn't yours. Tomorrow might be.",
    ],
  },
  shelfPriceCorrect: [
    'Right on the money.',
    'You got it!',
    "That's the one.",
    'There it is.',
    'Sharp.',
    'Called it.',
    'Spot on!',
    'Nice!',
    'No doubt.',
  ],
  shelfPriceWrong: [
    'Other way round.',
    'Not quite \u2014 flip it.',
    'The other one had it.',
    'Nope. Close though.',
    'Swapped.',
    'Yikes.',
    'Nearly. Not quite.',
    'That one surprised a lot of people.',
    'Tricky one, that.',
    'Brush it off.',
  ],
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Rank systems ────────────────────────────────────────────────────────────

export function getGameSenseRank(score: number) {
  if (score >= 800) return 'Encyclopaedic'
  if (score >= 600) return 'Well Played'
  if (score >= 350) return 'Getting Warmer'
  return 'Keep Guessing'
}

export const GAME_SENSE_FLAVOUR: Record<string, string[]> = {
  'Encyclopaedic': ['Barely needed the clues.', 'That was almost unfair. Almost.', 'You know your games.'],
  'Well Played': ['A few clues, a confident guess. Good game.', 'Solid. You got there.', "That's the one."],
  'Getting Warmer': ['You found it in the end.', 'Took a few goes but you got there.', 'Not your easiest one.'],
  'Keep Guessing': ['A tough one today.', "Tomorrow's might suit you better.", 'It happens. Come back tomorrow.'],
}

export function getStreetDateRank(score: number) {
  if (score >= 800) return 'Time Archivist'
  if (score >= 600) return 'Retro Head'
  if (score >= 350) return 'Occasional Player'
  return 'New to the Medium'
}

export const STREET_DATE_FLAVOUR: Record<string, string[]> = {
  'Time Archivist': ["Got it on the first clue. That's not guessing.", 'The archive is safe in your hands.', 'Flawless. Come back tomorrow.'],
  'Retro Head': ['You know your eras. A few clues to get there.', 'Good instinct. Took a couple of hints.', 'Most of that was muscle memory.'],
  'Occasional Player': ['The tricky ones got you. They get everyone.', 'Some of those covers were tough. Fair result.', "Not bad. Tomorrow's a fresh one."],
  'New to the Medium': ['These things take time.', 'The archive will be here tomorrow.', 'Every guess teaches you something.'],
}

export function getShelfPriceRank(streak: number) {
  if (streak === 10) return 'Industry Insider'
  if (streak >= 7) return 'Senior Producer'
  if (streak >= 4) return 'Junior Dev'
  return 'Just Another Consumer'
}

export const SHELF_PRICE_FLAVOUR: Record<string, string[]> = {
  'Industry Insider': ['You knew exactly what things cost. Suspicious, honestly.', 'Clean run. Come back tomorrow.', 'Nothing gets past you.'],
  'Senior Producer': ["You've shipped things. It shows.", 'A few tricky ones in there. You handled it.', "That's experience talking."],
  'Junior Dev': ['Solid. A few surprised you.', 'You know more than you think.', 'Getting there.'],
  'Just Another Consumer': ['The prices on some of these are genuinely criminal.', "Nobody warned you it would be this hard.", 'To be fair, most people get this one wrong.'],
}
