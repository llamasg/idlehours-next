/* ──────────────────────────────────────────────
   Pip Dashboard v2 — IdeaCard
   Large card showing a single post idea
   ────────────────────────────────────────────── */

import type { PipIdea } from '../lib/pipMockData';

interface IdeaCardProps {
  idea: PipIdea;
  className?: string;
}

const MAX_DOTS = 3;

export function IdeaCard({ idea, className = '' }: IdeaCardProps) {
  const difficultyLabel =
    idea.difficulty === 1 ? 'Easy' : idea.difficulty === 2 ? 'Medium' : 'Hard';

  return (
    <div
      className={`max-w-[520px] min-h-[340px] w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col ${className}`}
    >
      {/* Top: type + trending badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="bg-muted rounded-full px-3 py-1 text-sm text-muted-foreground">
          {idea.typeEmoji} {idea.type}
        </span>
        {idea.trending && (
          <span className="bg-orange-100 text-burnt-orange rounded-full px-3 py-1 text-sm font-medium">
            🔥 Trending
          </span>
        )}
      </div>

      {/* Title */}
      <h2 className="text-xl md:text-2xl font-semibold leading-snug mt-4 font-serif text-foreground">
        {idea.title}
      </h2>

      {/* Reason */}
      <p className="text-muted-foreground mt-3 leading-relaxed text-[15px] flex-1">
        {idea.reason}
      </p>

      {/* Bottom: difficulty + cluster */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex gap-0.5" aria-label={`Difficulty: ${difficultyLabel}`}>
            {Array.from({ length: MAX_DOTS }, (_, i) => (
              <span key={i} className={i < idea.difficulty ? 'text-foreground' : 'text-muted'}>
                {i < idea.difficulty ? '●' : '○'}
              </span>
            ))}
          </span>
          <span>{difficultyLabel}</span>
        </div>

        <span className="bg-accent-green/10 text-accent-green rounded-full px-3 py-1 text-xs font-medium">
          {idea.cluster}
        </span>
      </div>
    </div>
  );
}
