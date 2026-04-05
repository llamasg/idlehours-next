Refactor the end-of-game modals across all three daily games (Game Sense, Street Date, Shelf Price) into a single shared GameEndModal component. A reference HTML file is attached showing the intended layout and visual style for all four states — use it as your guide but implement it cleanly in React using the existing site patterns, components, and CSS variables. Do not copy the HTML verbatim.

Shared component
Create src/components/games/GameEndModal.tsx:
typescriptinterface GameEndModalProps {
  result: 'win' | 'loss'
  score: number
  rankName: string
  rankFlavour: string
  stats: { label: string; value: string }[]
  heroZone: React.ReactNode
  onShare: () => void
  onClose: () => void
}
```

Layout top to bottom:
```
[heroZone — passed in by each game]
[result heading + subheading — randomly picked on mount]
[score pill]
[rank badge + rank name + flavour line]
[stat row]
[share button — full width primary]
[close — ghost button]
Win state: white background, blue rank name, badge circle in --blue with soft pulse animation on mount, confetti on mount.
Loss state: --cream background, --ink-mid rank name, badge circle in --ink-light, no pulse, no confetti.
Rank badge: 96px circle, border-radius: 50%. Accept an imageSrc prop, show placeholder colour if absent. Comment: {/* TODO: replace with rank badge illustration */}. Flavour line picked randomly on mount, never on re-render.
Typography is Montserrat throughout — refer to the existing site styles for weights and sizing. No other fonts.

Microcopy
Create src/components/games/GameEndModal.copy.ts:
typescriptexport const COPY = {
  win: {
    headings: ["Congrats!", "Let's go champ", "You won!", "Winner winner!", "You did it!"],
    subheadings: ["Clean run.", "Nothing left to guess.", "Done and dusted.", "You knew this one.", "Didn't miss a beat.", "That was tidy."],
  },
  loss: {
    headings: ["So you didn't win...", "Womp womp :(", "Better luck next time", "There's always tomorrow."],
    subheadings: ["That's the lot for today.", "Come back tomorrow — it resets at midnight.", "Not today. Tomorrow's a fresh one.", "That one got away.", "Better luck tomorrow. Genuinely.", "It happens. Tomorrow's a new one.", "Close enough to hurt a little.", "Worth another go tomorrow.", "Today wasn't yours. Tomorrow might be."],
  },
  shelfPriceCorrect: ["Right on the money.", "You got it!", "That's the one.", "There it is.", "Sharp.", "Called it.", "Spot on!", "Nice!", "No doubt."],
  shelfPriceWrong: ["Other way round.", "Not quite — flip it.", "The other one had it.", "Nope. Close though.", "Swapped.", "Yikes.", "Nearly. Not quite.", "That one surprised a lot of people.", "Tricky one, that.", "Brush it off."],
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
shelfPriceCorrect and shelfPriceWrong are used inline during gameplay on each correct/wrong answer event, not inside the modal.
Result heading and subheading are picked once on modal mount and passed in as resolved strings — do not pick inside the shared component itself.

Win/loss conditions — per game
Game Sense — win if player guesses correctly regardless of score. Loss if they exhaust all guesses. Score affects rank only.
Street Date — existing win/loss logic, do not change it. Score affects rank only.
Shelf Price — 500+ points = win, under 500 = loss.

Ranks
Shelf Price — based on streak:
typescriptfunction getShelfPriceRank(streak: number) {
  if (streak === 10) return 'Industry Insider'
  if (streak >= 7)   return 'Senior Producer'
  if (streak >= 4)   return 'Junior Dev'
  return 'Just Another Consumer'
}

const SHELF_PRICE_FLAVOUR = {
  'Industry Insider':        ["You knew exactly what things cost. Suspicious, honestly.", "Clean run. Come back tomorrow.", "Nothing gets past you."],
  'Senior Producer':         ["You've shipped things. It shows.", "A few tricky ones in there. You handled it.", "That's experience talking."],
  'Junior Dev':              ["Solid. A few surprised you.", "You know more than you think.", "Getting there."],
  'Just Another Consumer':   ["The prices on some of these are genuinely criminal.", "Nobody warned you it would be this hard.", "To be fair, most people get this one wrong."],
}
Street Date — based on total score:
typescriptfunction getStreetDateRank(score: number) {
  if (score >= 800) return 'Time Archivist'
  if (score >= 600) return 'Retro Head'
  if (score >= 350) return 'Occasional Player'
  return 'New to the Medium'
}

const STREET_DATE_FLAVOUR = {
  'Time Archivist':    ["Got it on the first clue. That's not guessing.", "The archive is safe in your hands.", "Flawless. Come back tomorrow."],
  'Retro Head':        ["You know your eras. A few clues to get there.", "Good instinct. Took a couple of hints.", "Most of that was muscle memory."],
  'Occasional Player': ["The tricky ones got you. They get everyone.", "Some of those covers were tough. Fair result.", "Not bad. Tomorrow's a fresh one."],
  'New to the Medium': ["These things take time.", "The archive will be here tomorrow.", "Every guess teaches you something."],
}
Game Sense — based on final score:
typescriptfunction getGameSenseRank(score: number) {
  if (score >= 800) return 'Encyclopaedic'
  if (score >= 600) return 'Well Played'
  if (score >= 350) return 'Getting Warmer'
  return 'Keep Guessing'
}

const GAME_SENSE_FLAVOUR = {
  'Encyclopaedic':   ["Barely needed the clues.", "That was almost unfair. Almost.", "You know your games."],
  'Well Played':     ["A few clues, a confident guess. Good game.", "Solid. You got there.", "That's the one."],
  'Getting Warmer':  ["You found it in the end.", "Took a few goes but you got there.", "Not your easiest one."],
  'Keep Guessing':   ["A tough one today.", "Tomorrow's might suit you better.", "It happens. Come back tomorrow."],
}

Hero zones
Game Sense — full-width game cover art, rounded top corners. Game title and year overlaid at the bottom of the image in white. Stats: SCORE · GUESSES · CLUES REVEALED
Street Date — year displayed large and centred at the top with a small "The answer" label beneath it. Below that, the 5 game covers in a horizontal strip ordered obscure to popular. The cover the player guessed on is slightly larger and has a small numbered badge (e.g. "3") showing which clue cracked it. Covers beyond that point shown at reduced opacity since the player never needed them. Stats: SCORE · GUESSED ON · WAGER
Shelf Price — a 10-cell scorecard grid showing all rounds played. Each cell contains the two game covers side by side (small, abbreviated) with a ✓ or ✗ below. Green border for correct rounds, muted red for wrong. Gives the player a visual record of their full session. Stats: SCORE · STREAK · CORRECT
Pip row for Shelf Price only: 10 dots below the stat row, green for correct, muted for wrong, ordered as played.

What stays the same
All share button behaviour and share text format. All localStorage result storage. All game logic. Remove old modal components from each game file once the shared component is wired in.