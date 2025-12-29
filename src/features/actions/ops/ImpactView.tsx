'use client';

import { useMemo, useState, useEffect } from 'react';
import { ChartBarIcon, CheckCircleIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { loadWorkLog } from '@/lib/worklog/storage';
import type { WorkLogEntry } from '@/lib/worklog/types';
import { AkEmptyState } from '@/components/ui/AkEmptyState';

interface ImpactStats {
  answered: number;
  archived: number;
  actionsExecuted: number;
  timeSaved: number; // minutes (V1 heuristic)
}

export function ImpactView() {
  const [workLog, setWorkLog] = useState<WorkLogEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWorkLog(loadWorkLog());
  }, []);

  // Derive impact from WorkLog
  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const thisWeek = workLog.filter((entry) => new Date(entry.ts) >= weekAgo);

    let answered = 0;
    let archived = 0;
    let actionsExecuted = 0;
    let timeSaved = 0;

    thisWeek.forEach((entry) => {
      // Count by type
      if (entry.type === 'ingress') {
        // Ingress items that were processed
        answered += 1;
        timeSaved += 5; // 5 min per item (heuristic)
      } else if (entry.type === 'executed') {
        actionsExecuted += 1;
        // Time saved based on action type (heuristic)
        const actionId = entry.ref?.id || '';
        if (actionId.includes('draft') || actionId.includes('reply')) {
          timeSaved += 10; // 10 min for draft/reply
        } else if (actionId.includes('summarize')) {
          timeSaved += 15; // 15 min for summarization
        } else {
          timeSaved += 5; // 5 min default
        }
      }

      // Check if archived (from detail or title)
      const detail = entry.detail?.toLowerCase() || '';
      const title = entry.title.toLowerCase();
      if (detail.includes('archiv') || title.includes('archiv')) {
        archived += 1;
      }
    });

    return {
      answered,
      archived,
      actionsExecuted,
      timeSaved,
    };
  }, [workLog]);

  const hoursSaved = Math.floor(stats.timeSaved / 60);
  const minutesSaved = stats.timeSaved % 60;

  return (
    <div className="h-full overflow-y-auto ak-scrollbar">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ak-color-text-primary)] mb-1">
            Impact Ledger
          </h1>
          <p className="text-sm text-[var(--ak-color-text-muted)]">
            Diese Woche: Was wurde erledigt?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Answered */}
          <div className="rounded-xl border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircleIcon className="w-6 h-6 text-[var(--ak-semantic-success)]" />
              <h3 className="text-sm font-medium text-[var(--ak-color-text-secondary)]">
                Beantwortet
              </h3>
            </div>
            <p className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">
              {stats.answered}
            </p>
          </div>

          {/* Archived */}
          <div className="rounded-xl border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] p-6">
            <div className="flex items-center gap-3 mb-2">
              <ArchiveBoxIcon className="w-6 h-6 text-[var(--ak-color-text-secondary)]" />
              <h3 className="text-sm font-medium text-[var(--ak-color-text-secondary)]">
                Archiviert
              </h3>
            </div>
            <p className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">
              {stats.archived}
            </p>
          </div>

          {/* Actions Executed */}
          <div className="rounded-xl border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] p-6">
            <div className="flex items-center gap-3 mb-2">
              <ChartBarIcon className="w-6 h-6 text-[var(--ak-color-text-secondary)]" />
              <h3 className="text-sm font-medium text-[var(--ak-color-text-secondary)]">
                Actions ausgeführt
              </h3>
            </div>
            <p className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">
              {stats.actionsExecuted}
            </p>
          </div>

          {/* Time Saved */}
          <div className="rounded-xl border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] p-6">
            <div className="flex items-center gap-3 mb-2">
              <ChartBarIcon className="w-6 h-6 text-[var(--ak-semantic-success)]" />
              <h3 className="text-sm font-medium text-[var(--ak-color-text-secondary)]">
                Zeit gespart
              </h3>
            </div>
            <p className="text-3xl font-semibold text-[var(--ak-color-text-primary)]">
              {hoursSaved > 0 ? `${hoursSaved}h ` : ''}
              {minutesSaved > 0 ? `${minutesSaved}min` : hoursSaved === 0 ? '< 1min' : ''}
            </p>
          </div>
        </div>

        {/* Note */}
        <div className="text-xs text-[var(--ak-color-text-muted)] italic">
          * Zeitangaben basieren auf Heuristiken und dienen als Schätzung
        </div>
      </div>
    </div>
  );
}

