Here's the prompt:

---

Build the post-game completed state for all three daily games. A reference HTML file is attached showing the intended layout — use it as a visual guide but implement cleanly in React using existing site patterns and CSS variables. Do not copy the HTML verbatim.

---

**The modal unmounting fix**

Before building the new page, fix the existing issue where the game UI disappears before the end modal appears, leaving a blank page behind the overlay.

The game component must never unmount when the result triggers. Keep game state and modal visibility as two separate booleans:

```typescript
const [gameComplete, setGameComplete] = useState(false)
const [modalOpen, setModalOpen] = useState(false)

// When game ends:
setGameComplete(true)
setModalOpen(true)

// When modal closes:
setModalOpen(false)
// gameComplete stays true — game stays in its final state
```

The end modal sits over the game in its completed state — semi-transparent dark backdrop, `backdrop-filter: blur(4px)`, dismissible by clicking the backdrop. The game UI beneath it shows its final state frozen: for Shelf Price the last pair with prices revealed, for Game Sense the fully revealed sentence, for Street Date the final covers strip.

---

**Post-game page**

This is what the player sees after closing the modal. It replaces the current flat completed state. The page layout top to bottom:

```
[Game title + puzzle number + date — existing, keep as-is]
[Result card]
[Today's badges — DailyBadgeShelf component]
[While you're here — existing game cards, keep]
[Browse archive / Play today's game buttons — existing, keep]
```

---

**Result card**

A single card with a top bar, two-column body, and a footer.

Top bar: win heading on the left (e.g. "Let's go champ" / "Didn't miss a beat."), day-of-week flavour line on the right. Both picked randomly on mount, never on re-render. See copy arrays below.

Two-column body:

Left column — badge circle (96px, `border-radius: 50%`, `--blue` background, placeholder text `BADGE`, comment `{/* TODO: replace with rank badge illustration */}`) with a soft pulse animation on mount. Below the badge: a small "You earned" label, the rank name large in `--blue`, and the rank flavour line in italic.

Right column — today's score large at the top. Below it, a rank ladder showing all thresholds for that game. The player's current rank is highlighted. Ranks below it are shown as achieved (muted, green dot). Ranks above it are shown as targets (dashed border, no fill). This is the "here's what you're working towards" element.

Footer: puzzle info on the left (e.g. "Shelf Price #001 · Tue 3rd Mar"), "View full results →" link on the right that reopens the end modal.

---

**Day-of-week flavour lines**

Pick one randomly on mount based on `new Date().getDay()`. Store in `src/lib/dayFlavour.ts`:

```typescript
export const DAY_FLAVOUR: Record<number, string[]> = {
  0: ["Good way to spend a Sunday.", "Sunday well played.", "Before the week starts again. Worth it."],
  1: ["Not bad for a Monday.", "Better start to the week than most.", "Monday redeemed, slightly."],
  2: ["Not bad for a Tuesday.", "Quietly solid. Very Tuesday of you.", "Tuesday energy. Understated but present."],
  3: ["Halfway there.", "Hump day. You cleared it.", "Wednesday and already winning something."],
  4: ["Nearly Friday. This helps.", "Thursday is just Friday's waiting room.", "One more sleep. You've got this."],
  5: ["Going into the weekend with that score.", "Friday well spent.", "Weekend starts here."],
  6: ["Playing games on a Saturday. As it should be.", "No notes. This is what Saturdays are for.", "Ideal Saturday activity, honestly."],
}
```

---

**Rank ladders — per game**

**Shelf Price** (by streak):

| Rank | Threshold |
|---|---|
| Just Another Consumer | 0–3 streak |
| Junior Dev | 4–6 streak |
| Senior Producer | 7–9 streak |
| Industry Insider | 10 streak |

**Street Date** (by score):

| Rank | Threshold |
|---|---|
| New to the Medium | 0–349 |
| Occasional Player | 350–599 |
| Retro Head | 600–799 |
| Time Archivist | 800+ |

**Game Sense** (by score):

| Rank | Threshold |
|---|---|
| Keep Guessing | 0–349 |
| Getting Warmer | 350–599 |
| Well Played | 600–799 |
| Encyclopaedic | 800+ |

Rank flavour lines live in `src/lib/ranks.ts` alongside the rank functions — refer to the existing `GameEndModal.copy.ts` for the flavour copy already defined there.

---

**DailyBadgeShelf component**

Create `src/components/games/DailyBadgeShelf.tsx`. Three slots in a row, one per game (Shelf Price, Street Date, Game Sense), always shown in that order regardless of which game page you're on.

Each slot has the game name as a label above the circle and the rank name below it once earned.

Read completed games from localStorage using the same keys already written by each game's result storage. A slot is filled if today's date matches a stored result.

Filled slot: badge circle in `--blue`, rank name below in `--blue`. If this is the game the player just completed (i.e. the current page's game), trigger the stamp animation on mount — scale bounce from above, two ink rings pulsing outward, score floating up and fading. If the game was completed earlier today (loaded from localStorage on a return visit), show the badge already in place with no animation.

Empty slot: dashed circle border, "Play →" text inside, game name label above. Hovering turns the border `--blue`. Clicking navigates to that game.

The stamp animation and ink rings are defined in the component's CSS — refer to the HTML reference file for the keyframe definitions.

---

**What stays the same**

All existing localStorage result writes. All share button logic. All game card links. The end modal component itself — this prompt only changes when and how it appears, and what's shown on the page beneath and after it.