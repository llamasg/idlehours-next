/* ──────────────────────────────────────────────
   Pip Dashboard v2 — XpBar
   Experience / level progress bar
   ────────────────────────────────────────────── */

interface XpBarProps {
  xp: number;
  level: number;
}

const XP_PER_LEVEL = 500;

export function XpBar({ xp, level }: XpBarProps) {
  const xpIntoLevel = xp % XP_PER_LEVEL;
  const pct = (xpIntoLevel / XP_PER_LEVEL) * 100;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-3">
        {/* Level badge */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
          {level}
        </div>

        {/* XP label */}
        <span className="text-sm font-semibold text-stone-800">
          {xp.toLocaleString()} XP
        </span>

        <span className="ml-auto text-xs text-stone-400">
          {XP_PER_LEVEL - xpIntoLevel} to level {level + 1}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
