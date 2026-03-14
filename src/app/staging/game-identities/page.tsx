'use client';

const games = [
  {
    name: 'Game Sense',
    tagline: 'Daily \u00b7 Fill in the blank',
    description: 'Blue world. Deep navy to mid-blue. Clinical but warm.',
    gradient: 'linear-gradient(155deg, #2D6BC4, #1a2a4a)',
    accent: '#4A8FE8',
    footer:
      'Input fields: blue border. Correct answers pulse blue. Score counter on navy panel.',
  },
  {
    name: 'Street Date',
    tagline: 'Daily \u00b7 Guess the year',
    description: 'Green world. Dark forest to mid-green. Archival, editorial.',
    gradient: 'linear-gradient(155deg, #1A7A40, #0d1f12)',
    accent: '#27A85A',
    footer: 'Cover art thumbnails desaturated. Year display in green.',
  },
  {
    name: 'Shelf Price',
    tagline: 'Daily \u00b7 Higher or lower',
    description:
      'Purple world. Deep indigo to mid-purple. Slightly retail, slightly luxury.',
    gradient: 'linear-gradient(155deg, #5B4FCF, #1a1040)',
    accent: '#5B4FCF',
    footer: 'Price tag UI elements. Higher/lower buttons in purple bevel.',
  },
  {
    name: 'Blitz',
    tagline: 'Ongoing \u00b7 Timed word association',
    description:
      'Orange world. Near-black to hot orange. Stripe texture always-on.',
    gradient: 'linear-gradient(155deg, #E05A1A, #2a1000)',
    accent: '#E05A1A',
    footer:
      'Timer arc in orange. Countdown pulse accelerates. Answers stack as orange chips.',
    hasStripes: true,
  },
  {
    name: 'Ship It',
    tagline: 'Narrative \u00b7 No daily reset',
    description: 'Charcoal/navy world. Corporate boardroom after hours.',
    gradient: 'linear-gradient(155deg, #2A2A3E, #1a1028)',
    accent: '#5A5A8A',
    footer: 'No reset \u2014 progress persists across sessions via Sanity.',
    fullWidth: true,
  },
] as const;

function AccentChip({ color }: { color: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-xs font-bold tracking-wide text-white/80">
      <span
        className="inline-block h-3 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      {color}
    </span>
  );
}

function GradientChip({ gradient }: { gradient: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-xs font-bold tracking-wide text-white/60">
      <span
        className="inline-block h-3 w-8 rounded-full"
        style={{ background: gradient }}
      />
      gradient
    </span>
  );
}

function GameCard({
  game,
}: {
  game: (typeof games)[number];
}) {
  const isShipIt = 'fullWidth' in game && game.fullWidth;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${isShipIt ? 'col-span-full' : ''}`}
      style={{
        boxShadow:
          '0 6px 0 rgba(0,0,0,0.2), 0 12px 32px rgba(0,0,0,0.15)',
      }}
    >
      {/* Gradient background */}
      <div
        className="relative min-h-[280px]"
        style={{ background: game.gradient }}
      >
        {/* Stripe overlay for Blitz */}
        {'hasStripes' in game && game.hasStripes && (
          <div
            className="pointer-events-none absolute inset-0 animate-pulse opacity-[0.08]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.4) 10px, rgba(255,255,255,0.4) 12px)',
            }}
          />
        )}

        {/* Card content */}
        <div className={`relative z-10 flex h-full flex-col p-8 ${isShipIt ? 'min-h-[320px]' : 'min-h-[280px]'}`}>
          {/* Tagline */}
          <span className="font-heading mb-3 text-xs font-bold uppercase tracking-widest text-white/50">
            {game.tagline}
          </span>

          {/* Title */}
          <h3
            className="font-heading mb-3 font-black text-white"
            style={{ fontSize: '38px', lineHeight: 1.1 }}
          >
            {game.name}
          </h3>

          {/* Description */}
          <p className="font-heading mb-5 max-w-md text-sm leading-relaxed text-white/70">
            {game.description}
          </p>

          {/* Ship It: two-column internal layout */}
          {isShipIt ? (
            <div className="mt-auto grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                {/* Chips */}
                <div className="flex flex-wrap gap-2">
                  <AccentChip color={game.accent} />
                  <GradientChip gradient={game.gradient} />
                </div>
              </div>
              <div className="rounded-xl bg-black/20 p-6">
                <p
                  className="font-heading mb-5 text-sm italic leading-relaxed text-white/60"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  The studio head slides a contract across the mahogany desk.
                  The numbers are good&mdash;better than good. But the clause on
                  page twelve would change everything.
                </p>
                <div className="flex gap-3">
                  <button
                    className="font-heading rounded-lg px-5 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-80"
                    style={{ backgroundColor: game.accent }}
                  >
                    Take the deal
                  </button>
                  <button className="font-heading rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-bold text-white/70 transition-opacity hover:opacity-80">
                    Walk away
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Standard cards: chips at bottom */
            <div className="mt-auto flex flex-wrap gap-2">
              <AccentChip color={game.accent} />
              <GradientChip gradient={game.gradient} />
            </div>
          )}
        </div>
      </div>

      {/* Footer bar */}
      <div className="bg-black/40 px-8 py-4">
        <p className="font-heading text-xs leading-relaxed text-white/50">
          {game.footer}
        </p>
      </div>
    </div>
  );
}

export default function GameIdentitiesPage() {
  return (
    <div className="font-heading mx-auto max-w-5xl px-6 py-16">
      {/* Section header */}
      <div className="mb-12">
        <span className="font-heading mb-2 inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
          09 &mdash; Identity System
        </span>
        <h1 className="font-heading mt-3 text-4xl font-black text-white">
          Game Colour Identities
        </h1>
        <p className="font-heading mt-3 max-w-2xl text-sm leading-relaxed text-white/50">
          Each game owns a colour world. The gradient, accent, and texture
          define its entire UI surface &mdash; cards, inputs, buttons, and
          feedback states all inherit from these roots.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {games.map((game) => (
          <GameCard key={game.name} game={game} />
        ))}
      </div>
    </div>
  );
}
