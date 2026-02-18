/* ──────────────────────────────────────────────
   Pip Dashboard v2 — ClusterProgress
   Compact / full progress bar for a content cluster
   ────────────────────────────────────────────── */

import { motion } from 'framer-motion';
import type { PipCluster } from '@/pip/lib/pipMockData';

interface ClusterProgressProps {
  cluster: PipCluster;
  compact?: boolean;
}

export function ClusterProgress({ cluster, compact = false }: ClusterProgressProps) {
  const published = cluster.steps.filter((s) => s.status === 'published').length;
  const total = cluster.steps.length;
  const pct = total > 0 ? (published / total) * 100 : 0;

  if (compact) {
    return (
      <div className="flex flex-1 items-center gap-3">
        <span className="text-sm font-medium text-stone-800 truncate">
          {cluster.name}
        </span>
        <span className="text-xs text-stone-500 whitespace-nowrap">
          {published}/{total}
        </span>
        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-accent-green"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-bold text-stone-900">{cluster.name}</h3>
        <span className="text-sm text-stone-500">
          {published}/{total} published
        </span>
      </div>
      <div className="mt-2 h-3 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-accent-green"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
