Idle Hours — Homepage Layout Build
Context
We have an existing parallax hero page and a separate homepage. The task is to migrate the parallax hero into the homepage as the primary hero, remove all dummy/skeleton content from the parallax file, and build out the full homepage content layout beneath it. The parallax hero file should be retired after migration — all its functionality lives in the homepage going forward.

Step 1 — Migrate the parallax hero
Take everything from i and bring it into the homepage component:

The sticky scroll mechanic (full screen → postcard zoom-out)
The cursor parallax layer system with all SVG layers
The time-of-day palette system (morning / midday / twilight / night) with the toggle UI bottom-left
The time/location stamp ("21:18 · Mon 2 Mar · At Idle Hours HQ")
The nav behaviour (transparent over hero, solid on scroll)
Remove all skeleton/dummy block content that was below the hero in the parallax file — everything below the postcard state gets replaced by the new homepage sections below

The hero content (logo, subhead, two CTAs) stays as-is inside the full-screen state. The postcard state shows just the landscape scene with no text overlay — clean thumbnail of the forest, no repeated branding.

Step 2 — Homepage content sections
All sections sit below the postcard hero in a single scrollable page. Max content width 1200px, centred, consistent horizontal padding.

Section 1 — Play Our Games
Label: PLAY A GAME in small uppercase mono, with a horizontal rule extending to the right.
A horizontally draggable carousel showing exactly 3 cards visible at full width simultaneously — each card takes up roughly one third of the content width. Cards are image-only (no text rendered by the component — the title treatment is baked into the image itself). Aspect ratio approximately 4:3. Rounded corners consistent with site card style. Subtle drag affordance on first load ("drag to explore" hint that fades after interaction). On mobile, snaps to each card.
Games to show: Skill Issue, the box art guessing game, placeholder slot for upcoming game. Each card links to its respective game page.

Section 2 — Latest Posts
Label: LATEST POSTS
Mixed editorial grid layout — not a uniform grid. First row: one wide card (spanning 2 columns) plus two standard cards beside it. Subsequent rows: standard 3 or 4 column grid. The wide card signals editorial hierarchy — this post matters more — without requiring any special configuration.
Each post card shows: cover image, category label in small uppercase, post title in serif font, author name, read time. No excerpt needed. Clicking navigates to the post.

Section 3 — Today's Pick + Quiz
A 3-column row. No section label needed — the content is self-explanatory.
Columns 1–2 (two thirds width): Today's Game
A large featured card for the current daily Skill Issue challenge. Shows the game's cover art as background, "Today's Challenge" label top-left, the Skill Issue logo/title treatment centred, a short one-line hook ("Can you guess today's game in 6 clues?"), and a prominent play button. If the user has already played today, show their result instead ("You got it in 3. Come back tomorrow.") using localStorage to detect completion state.
Column 3 (one third width): Mood Quiz CTA
A tall card matching the height of the today's game card. Solid colour background using one of the brand palette colours (forest green or amber). Headline: "Not sure what to play?" in serif. Subhead: "Answer five questions. Get a game that fits your mood." Single CTA button: "Find My Game". Links to the quiz page.

Section 4 — What We're Playing
Label: WHAT WE'RE PLAYING
A horizontally scrollable strip of game UI cards — 4 cards visible at once on desktop, hinting at a 5th. Uses the compact GameTileCard component. Each card shows cover image, score badge, title, platform list. Clicking any card triggers the lightbox. This list is editorially curated — pulled from a manually ordered collection in Sanity, not algorithmic.

Section 5 — Newsletter
Full-width section, generous vertical padding. Not a generic signup block — give it personality.
Headline in large serif: "Good games. Good reads. Once a week."
Subhead in small mono: "No noise. No aggregation. Just things worth your time."
Email input field + submit button inline. Input styled to match the site — no default browser styling.
Below the input, a single reassurance line: "We send one email a week. Unsubscribe any time."
Background: a slightly darker tint of the cream base colour to distinguish it from surrounding sections without being visually loud.

Section 6 — Long Read
Label: LONG READ
A single full-width editorial feature card. Large image taking up left half, content on the right: category label, headline in large serif (3–4 lines), opening paragraph (first 2–3 sentences visible), author name, estimated read time, and a quiet "Read More" text link. This slot is manually curated in Sanity — a single pinned "featured long read" field on the homepage singleton document.
This section signals depth. Give it more vertical breathing room than other sections.

Section 7 — Footer
Three column layout:
Left: Idle Hours logo mark + one-sentence about blurb. "A cozy games blog for people who play games to feel something."
Centre: Nav links (Posts, Play, Library, About, Newsletter) stacked vertically in small mono.
Right: Repeat newsletter signup — just the input and button, no headline. For people who scrolled all the way down without signing up mid-page.
Below the three columns: a full-width rule, then a single line: © Idle Hours · idlehours.co.uk · Made with too much free time — left aligned, small mono, muted colour.

General notes

Remove all <div class="card-skeleton"> and placeholder content from the migrated parallax file
Section labels should all use the same style: small uppercase DM Mono, muted colour, with a horizontal rule extending to fill remaining width — consistent across every section
Maintain the existing colour palette: cream base, forest green, amber, dusty rose, near-black
All game cards that link to individual games should trigger the lightbox, not navigate to a page
Smooth scroll behaviour throughout
The time-of-day system should affect only the hero — content sections below always render in the standard cream/light palette regardless of time