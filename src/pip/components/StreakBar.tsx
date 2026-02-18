/* ──────────────────────────────────────────────
   Pip Dashboard v2 — StreakBar
   Publishing streak display with progress bar
   ────────────────────────────────────────────── */

interface StreakBarProps {
  streak: number;
  nextMilestone?: number;
}

export function StreakBar({ streak, nextMilestone = 7 }: StreakBarProps) {
  const pct = Math.min((streak / nextMilestone) * 100, 100);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg" role="img" aria-label="fire">
          🔥
        </span>
        <span className="text-sm font-semibold text-stone-800">
          {streak} day streak
        </span>
        <span className="ml-auto text-xs text-stone-400">
          next: {nextMilestone} days
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-amber-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
