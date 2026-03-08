Build the Blitz game as a new page at app/blitz/page.tsx. Two HTML reference files are attached — one showing the full UI across all four screens (topic select, gameplay, end screen, leaderboard), and one showing the live physics arena. Use both as your visual and behavioural reference but implement everything in React using existing site patterns, components, and CSS variables. Do not copy the HTML verbatim.

What Blitz is
Blitz is a rapid-fire game where the player names as many games as possible within a time limit for a chosen topic. Unlike the three daily games it is not date-locked — it can be played any number of times, with any available topic, at any time. It lives under /blitz as its own standalone experience.
It is not a cosy puzzle. It is a sprint. The UI should feel urgent and alive compared to the daily games.

Four screens
The page renders one of four states: select, game, end, leaderboard. No routing — single page, state-driven.

Screen 1 — Topic select
Header: eyebrow "A game by ◆ Idle Hours", large BLITZ title in --ink with a ⚡ in --amber, italic subtitle "Name as many as you can before time runs out."
Topic list: fetched from a topics config (see data structure below). Each topic renders as a card showing name, prompt line, and pool size (e.g. "47 games"). Clicking a card selects it — selected state uses --amber border. Topics are grouped by type (franchise, platform, year, genre) with a section label above each group.
Below the topic list: dynamically calculated milestones (bronze/silver/gold) for the selected topic using getMilestones(). Timer shown as human-readable: "You'll have X:XX — 2 seconds per game, plus 15."
Start button in --amber. Disabled until a topic is selected.

Timer formula
typescriptfunction getTimeLimit(poolSize: number): number {
  return poolSize * 2 + 15
}

function getMilestones(poolSize: number) {
  return {
    bronze: Math.max(3,  Math.floor(poolSize * 0.15)),
    silver: Math.max(6,  Math.floor(poolSize * 0.30)),
    gold:   Math.max(10, Math.floor(poolSize * 0.50)),
  }
}

Screen 2 — Gameplay
HUD — three zones: left (⚡ BLITZ label in --amber, topic name in --ink bold), centre (circular countdown timer ring in --amber, goes --red in final 15 seconds), right (score count large, "correct" label beneath).
Progress bar — thin bar beneath the HUD. Fills amber as score increases proportional to pool size. Three milestone dots on the bar at bronze/silver/gold positions. Dots light up amber when reached.
Physics arena — canvas element filling the remaining space between progress bar and input zone. See physics spec below.
Input zone — pinned to bottom. Text input (amber focus ring), submit button in --amber. Hint row below showing correct count, total guesses, and next milestone target. On Enter or submit: process the guess.
Guess handling:

Correct and not yet guessed → spawn correct pill into arena, increment score, check milestones
Already guessed → shake input, show "Already got it" float, do not spawn
Wrong → shake input, spawn a red wrong-pill that fades after 0.8s, show "Nope" float

Wrong pills should be visually distinct but not permanent — they appear briefly to acknowledge the attempt and disappear.
Milestone toast — when bronze/silver/gold is reached, a pill toast animates down from the top of the arena: "🥉 Bronze unlocked!" etc. Stays for 2 seconds.

Physics spec
The arena is a <canvas> element. All word bubbles are physics bodies — pills (rounded rectangles) drawn via Canvas 2D API. This is not a DOM-based layout.
Constants to use:
typescriptconst GRAVITY  = 0.012   // gentle upward float — moon gravity
const DAMPING  = 0.72    // energy loss on bounce — lose energy fast after collision
const FRICTION = 0.995   // air friction
const PILL_H   = 32      // pill height px
const PILL_PAD_X = 14    // horizontal text padding
Spawn behaviour — new pills spawn at the bottom of the arena (above the input zone), with a modest upward velocity angled slightly randomly. Launch speed: 4 + Math.random() * 2. The pill arcs up and settles under gravity.
Body-body collision — AABB collision detection each frame. When two bodies overlap:

Push apart by overlap / 2 + 1.5 on the axis of least penetration
Transfer impulse with multiplier 0.55
Enforce minimum separation velocity of 0.5 to prevent slow grinding

This makes pills bump each other aside decisively. Under a full arena they jostle and find space rather than stacking or overlapping.
Wall and ceiling/floor collision — standard reflection with DAMPING applied. Pills should not escape the canvas bounds.
Correct pill styling — --white fill, rgba(200,135,58,0.4) stroke, --ink text, subtle amber shadow. These persist for the full game.
Wrong pill styling — red tint fill, red stroke, red text, fades to opacity 0 over 0.8 seconds then removed from bodies array.
In Next.js, the canvas physics loop should live in a useEffect with a ref to the canvas element. The loop should start on game start and be cancelled on unmount or game end.

Screen 3 — End screen
Reuse the existing GameEndModal component. Do not build a new modal. Pass in:

result: always 'win' for Blitz (there is no loss state — you just get a score)
score: formatted as "X / poolSize" in the hero zone
rankName: bronze / silver / gold / no medal based on milestones
stats: [{ label: 'CORRECT', value: 'X/Y' }, { label: 'TIME USED', value: 'Xs' }, { label: 'TOPIC', value: topicName }]
heroZone: a simple centred block showing the score huge in --ink, topic name above it, rank pill beneath it

Below the modal's standard layout, add a name entry section (outside the shared component): "Post your score to the leaderboard" label, a text input for name, a post button in --ink, and a ghost "Skip" button. This section only appears after the modal — it is not part of the modal itself.
The modal's share button generates a share card in the same format as the daily games.

Screen 4 — Leaderboard
Shown after name entry (or skip). Not a modal — a full-page view within the same screen layout.
Header: amber eyebrow "⚡ Blitz · Leaderboard", topic name as large heading, pool size and "All time" meta, milestone reference chips, "Change topic →" link that returns to select screen.
Column headers: # · Name · Score · Time
Rows sorted by: score descending, then time ascending as tiebreaker. Format: 17 / 47 for score, 1:12 for time.
Top 3 rows get medal emojis instead of position numbers. The player's own row (matched by the name they just entered, stored in sessionStorage) is highlighted with --amber left border and amber name text, with a small "You" pill.
Scores are fetched from and posted to a Supabase table blitz_scores with columns: id, topic_slug, name, score, pool_size, time_seconds, created_at. Use Supabase JS client already configured in the project (or add it if not present).
On post: validate that score ≤ pool size, name is 1–20 characters, topic slug is valid. Reject silently if not. Basic rate limiting: store last submission timestamp in sessionStorage, reject if less than 30 seconds ago.

Topic data structure
Create src/data/blitz-topics.ts:
typescriptexport interface BlitzTopic {
  slug: string
  name: string
  prompt: string
  icon: string
  group: 'franchise' | 'platform' | 'year' | 'genre'
  filter: (game: GameEntry) => boolean
}
Topics are derived live from GAMES_DB using the filter function — answer lists are never hardcoded. Pool size is calculated at runtime as GAMES_DB.filter(topic.filter).length.
Initial topics to define (expand as DB grows):
typescript{ slug: 'mario', name: 'Mario Games', prompt: 'Name any game in the Mario series', icon: '🍄', group: 'franchise', filter: g => g.tags.includes('mario') }
{ slug: 'ps1', name: 'PS1 Era', prompt: 'Games released on PlayStation 1', icon: '🎮', group: 'platform', filter: g => g.platforms.includes('PlayStation') && g.year >= 1994 && g.year <= 2000 }
{ slug: 'fromsoftware', name: 'FromSoftware', prompt: 'Any game by FromSoftware', icon: '⚔️', group: 'franchise', filter: g => g.tags.includes('fromsoftware') }
{ slug: '2011', name: 'Games released in 2011', prompt: 'Any game released that year', icon: '🗓️', group: 'year', filter: g => g.year === 2011 }
{ slug: 'nintendo-64', name: 'Nintendo 64', prompt: 'Games released on the N64', icon: '🕹️', group: 'platform', filter: g => g.platforms.includes('Nintendo 64') }
{ slug: 'open-world', name: 'Open World Games', prompt: 'Games with open world exploration', icon: '🗺️', group: 'genre', filter: g => g.tags.includes('open-world') }
Only expose topics where the live pool size is between 15 and 150. Filter out anything outside that range at render time so players are never shown a topic that's too sparse or too overwhelming.

Navigation and placement
Add Blitz to the Play nav section. On the Play landing page, Blitz should be visually distinct from the three daily games — it is not a daily puzzle. Label it "Play anytime" or use a subtle "Arcade" tag to distinguish it. Do not give it a puzzle number or date.

What to reuse

GameEndModal — end screen, as described above
CSS variables — all colours from existing :root
Montserrat font weights — same as rest of site
src/lib/ranks.ts — not used for Blitz (medal system replaces ranks), but do not conflict
Supabase client — reuse existing instance if present

What not to reuse

Daily game localStorage result storage — Blitz does not write to daily result keys
DailyBadgeShelf — Blitz does not contribute a badge to today's shelf
dateUtils — Blitz is not date-locked