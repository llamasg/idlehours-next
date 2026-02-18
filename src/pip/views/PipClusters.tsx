/* ──────────────────────────────────────────────
   Pip Dashboard v2 — PipClusters (Cluster Tracker)
   ────────────────────────────────────────────── */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

import { usePipData } from '@/pip/hooks/usePipData';
import { ClusterProgress } from '@/pip/components/ClusterProgress';

/* ── Status icon helper ──────────────────────── */

function statusIcon(status: 'published' | 'drafted' | 'planned') {
  switch (status) {
    case 'published':
      return <span className="text-accent-green">&#x2705;</span>;
    case 'drafted':
      return <span className="text-amber-500">&#x1F4DD;</span>;
    case 'planned':
      return <span className="text-muted-foreground">&#x1F4CB;</span>;
  }
}

/* ── Role badge helper ───────────────────────── */

const roleBadgeClasses: Record<string, string> = {
  Pillar: 'bg-burnt-orange/10 text-burnt-orange',
  Supporting: 'bg-blue-100 text-blue-700',
  'Mood Editorial': 'bg-purple-100 text-purple-700',
  Standalone: 'bg-muted text-muted-foreground',
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        roleBadgeClasses[role] ?? 'bg-muted text-muted-foreground'
      }`}
    >
      {role}
    </span>
  );
}

/* ── Main component ──────────────────────────── */

export default function PipClusters() {
  const { clusters } = usePipData();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8 px-4">
      <h1 className="text-2xl font-bold text-stone-900">Content Clusters</h1>

      {/* Info note */}
      <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
        Add the cluster fields to your post in Sanity and it'll update here
        automatically. Takes 5 seconds.
      </div>

      {/* Cluster cards */}
      <div className="space-y-3">
        {clusters.map((cluster) => {
          const isExpanded = expandedId === cluster.id;

          return (
            <div
              key={cluster.id}
              className="rounded-xl bg-white shadow-sm overflow-hidden"
            >
              {/* Collapsed header — always visible */}
              <button
                type="button"
                onClick={() => toggle(cluster.id)}
                className="flex w-full items-center gap-3 p-4 text-left hover:bg-stone-50 transition-colors"
              >
                <ClusterProgress cluster={cluster} compact />
                <motion.span
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="h-4 w-4 text-stone-400" />
                </motion.span>
              </button>

              {/* Expanded body */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-stone-100 px-4 pb-4 pt-3 space-y-4">
                      {/* Full progress bar */}
                      <ClusterProgress cluster={cluster} />

                      {/* Step list */}
                      <ul className="space-y-2">
                        {cluster.steps.map((step, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-3 text-sm"
                          >
                            <span className="text-base leading-none">
                              {statusIcon(step.status)}
                            </span>
                            <span className="flex-1 text-stone-800">
                              {step.title}
                            </span>
                            <RoleBadge role={step.role} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
