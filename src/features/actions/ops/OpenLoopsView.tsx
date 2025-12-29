'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ExclamationCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { AkListRow } from '@/components/ui/AkListRow';
import { AkEmptyState } from '@/components/ui/AkEmptyState';
import { fetchJson } from '@/lib/api/fetchJson';
import { loadWorkLog } from '@/lib/worklog/storage';
import type { WorkLogEntry } from '@/lib/worklog/types';
import type { InboxItem } from '@/features/inbox/types';
import { applyInboxFilters } from '@/features/inbox/filtering';

interface OpenLoop {
  id: string;
  title: string;
  type: 'needs_action' | 'unanswered' | 'promised_followup';
  source: string;
  timestamp: Date;
  inboxItemId?: string;
  nextStep?: string;
}

export function OpenLoopsView() {
  const router = useRouter();

  const [workLog, setWorkLog] = useState<WorkLogEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  const { data: inboxData, isLoading: isInboxLoading } = useQuery({
    queryKey: ['inbox', 'all'],
    queryFn: async () => {
      const data = await fetchJson<{ items: InboxItem[] }>('/api/inbox');
      return data;
    },
    staleTime: 30000,
  });

  const inboxItems = inboxData?.items ?? [];

  useEffect(() => {
    setMounted(true);
    setWorkLog(loadWorkLog());
  }, []);

  const openLoops = useMemo(() => {
    const loops: OpenLoop[] = [];

    const needsAction = applyInboxFilters(inboxItems, { status: 'needs_action' });
    needsAction.forEach((item) => {
      loops.push({
        id: `inbox-${item.id}`,
        title: item.title || item.preview || 'Unbenannt',
        type: 'needs_action',
        source: item.source,
        timestamp: item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp),
        inboxItemId: item.id,
        nextStep: 'Inbox öffnen und bearbeiten',
      });
    });

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const unanswered = inboxItems.filter(
      (item) => item.status === 'open' && (item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp)) < yesterday
    );
    unanswered.forEach((item) => {
      loops.push({
        id: `unanswered-${item.id}`,
        title: item.title || item.preview || 'Unbeantwortet',
        type: 'unanswered',
        source: item.source,
        timestamp: item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp),
        inboxItemId: item.id,
        nextStep: 'Nachfrage senden',
      });
    });

    const promisedFollowups = workLog.filter((entry) => {
      const detail = entry.detail?.toLowerCase() || '';
      return (
        detail.includes('follow-up') ||
        detail.includes('nachfrage') ||
        detail.includes('rückmeldung') ||
        entry.title.toLowerCase().includes('versprochen')
      );
    });
    promisedFollowups.forEach((entry) => {
      loops.push({
        id: `followup-${entry.id}`,
        title: entry.title,
        type: 'promised_followup',
        source: entry.channel,
        timestamp: new Date(entry.ts),
        nextStep: 'Follow-up durchführen',
      });
    });

    return loops.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [workLog, inboxItems]);

  if (!mounted || isInboxLoading) {
    return (
      <div className="p-6">
        <div className="text-sm text-[var(--ak-color-text-muted)]">Lade Open Loops…</div>
      </div>
    );
  }

  const handleLoopClick = (loop: OpenLoop) => {
    if (loop.inboxItemId) {
      router.push(`/inbox?id=${loop.inboxItemId}`);
    } else {
      router.push('/inbox');
    }
  };

  if (openLoops.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <AkEmptyState
          icon={<ExclamationCircleIcon />}
          title="Keine offenen Loops"
          description="Alles ist erledigt! 🎉"
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto ak-scrollbar">
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ak-color-text-primary)] mb-1">
            Offene Loops
          </h1>
          <p className="text-sm text-[var(--ak-color-text-muted)]">
            {openLoops.length} offene Punkte, die Aufmerksamkeit benötigen
          </p>
        </div>

        <div className="space-y-2">
          {openLoops.map((loop) => {
            const typeLabels = {
              needs_action: 'Benötigt Aktion',
              unanswered: 'Unbeantwortet',
              promised_followup: 'Versprochenes Follow-up',
            };

            return (
              <AkListRow
                key={loop.id}
                accent="graphite"
                onClick={() => handleLoopClick(loop)}
                leading={
                  <div className="w-10 h-10 rounded-lg bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-[var(--ak-color-text-secondary)]" />
                  </div>
                }
                title={
                  <div>
                    <div className="text-sm font-medium text-[var(--ak-color-text-primary)]">
                      {loop.title}
                    </div>
                    <div className="text-xs text-[var(--ak-color-text-muted)] mt-0.5">
                      {typeLabels[loop.type]} • {loop.source}
                    </div>
                  </div>
                }
                trailing={
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-[var(--ak-color-text-muted)]">
                      {loop.timestamp.toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    {loop.nextStep && (
                      <span className="text-[10px] text-[var(--ak-color-text-muted)] italic">
                        → {loop.nextStep}
                      </span>
                    )}
                  </div>
                }
                className="py-3 shadow-sm border border-[var(--ak-color-border-fine)] rounded-lg mb-2"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
