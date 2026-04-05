We are replacing the gameplay mechanic of Street Date

Create a new branch `feature/street-date-v2` and build the new gameplay at `/play/street-date-v2/[date]` so we can test it in parallel before replacing the original.

---

## What changes: the gameplay

The existing format (guess a year, get higher/lower feedback) is replaced with the following:

**Core loop**
- The player is given 7 game cards shuffled in a random order
- They must arrange the cards into chronological release order, oldest (slot 1) to newest (slot 7)
- On submit, the only feedback given is a count: "3 of 7 in the correct position" — no positional breakdown, no per-slot colouring
- 5 guesses maximum
- Moving a card out of a previously hinted slot clears that slot's hint state

**Scoring**
- 1000pts base
- No penalty on guess 1
- −150pts for each guess after the first
- 0pts on fail

**Hints — two tiers**
- Reveal one slot (−100pts, single use): player activates the hint then taps any filled slot to reveal whether it is correct (green), one position away (amber), or wrong (red). The release year appears on that chip permanently for the rest of the game.
- Reveal all slots (−300pts, single use): immediately applies correct/close/wrong colouring to all filled slots and reveals the release year on every chip.
- Hint costs are deducted from current points at time of use
- Hints should visually match the existing correct/close/wrong colour tokens already used in the codebase

**Cards**
- Display the game's cover image (same image source as currently used in Street Date)
- Display the game title
- Do not show the release year unless revealed via a hint
- Support drag-and-drop on desktop and tap-to-select / tap-to-place on mobile — mobile tap pattern is primary
- On first visit (no saved state), play a brief one-time animation showing a card lifting and dropping into a slot to demonstrate the mechanic

**Slots**
- 7 numbered slots in a horizontal row
- Empty slots show a dashed placeholder with the slot number
- When a hint has been applied, the slot border takes the correct/close/wrong colour

**Puzzle data**
- Each daily puzzle is 7 games with a `releaseYear` field — add this field to the existing game/puzzle data structure however it is currently set up (look at how the existing Street Date puzzle data is structured and extend it the same way)
- Each puzzle can optionally include a `theme` string — a one-line editorial note shown below the game title, e.g. "Seven games from the year cozy went mainstream". Display this if present, hide if absent.
- Difficulty distribution per puzzle: 1–2 high-profile games, 2–3 mid-tier, 1–2 obscure — this is a curation guide only, not displayed to the player

**Share card / end state**
- Matches the existing Street Date share card format exactly
- Emoji grid: one row of 7 per guess — 🟩 correct, 🟨 one away, 🟥 more than one away
- Copy: solved in N guesses, or a friendly failure line
- Points earned
- URL: idlehours.co.uk/play/street-date-v2

---

An HTML prototype is attached for behavioural reference — the interaction model, scoring logic, and hint flow are all correct in it. Ignore all its inline styles.