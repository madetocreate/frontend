'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PhoneIcon, GlobeAltIcon, StarIcon, ChatBubbleLeftRightIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import { AkListRow } from '@/components/ui/AkListRow';
import { AkButton } from '@/components/ui/AkButton';
import { AkBadge } from '@/components/ui/AkBadge';
import { loadWorkLog } from '@/lib/worklog/storage';
import type { WorkLogEntry } from '@/lib/worklog/types';
import type { InboxItem } from '@/features/inbox/types';
import { applyInboxFilters } from '@/features/inbox/filtering';
import { loadIntegrationStatuses } from '@/lib/integrations/storage';
import type { IntegrationStatus } from '@/lib/integrations/types';
import { fetchJson } from '@/lib/api/fetchJson';

interface AssistantCard {
  id: 'website' | 'phone' | 'reviews' | 'telegram' | 'marketing';
  label: string;
  icon: typeof PhoneIcon;
  source: 'website' | 'phone' | 'reviews' | 'telegram' | 'marketing';
}

const ASSISTANTS: AssistantCard[] = [
  {
    id: 'website',
    label: 'Website-Bot',
    icon: GlobeAltIcon,
    source: 'website',
  },
  {
    id: 'phone',
    label: 'Telefon-Bot',
    icon: PhoneIcon,
    source: 'phone',
  },
  {
    id: 'telegram',
    label: 'Telegram-Bot',
    icon: ChatBubbleLeftRightIcon,
    source: 'telegram',
  },
  {
    id: 'reviews',
    label: 'Review-Bot',
    icon: StarIcon,
    source: 'reviews',
  },
  {
    id: 'marketing',
    label: 'Marketing-Bot',
    icon: MegaphoneIcon,
    source: 'marketing',
  },
];

export function AssistantsHub() {
  const router = useRouter();
  
  const [workLog, setWorkLog] = useState<WorkLogEntry[]>([]);
  const [integrationStatuses, setIntegrationStatuses] = useState<Record<string, IntegrationStatus>>({});
  const [mounted, setMounted] = useState(false);

  // Fetch real inbox items to get counts
  const { data: inboxData } = useQuery({
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
    setIntegrationStatuses(loadIntegrationStatuses());
  }, []);

  const assistantData = useMemo(() => {
    return ASSISTANTS.map((assistant) => {
      const status = (integrationStatuses[assistant.id as keyof typeof integrationStatuses] as any)?.status || 'paused';
      const isActive = status === 'active' || status === 'connected';

      const filtered = applyInboxFilters(inboxItems, {
        src: [assistant.source],
        status: 'needs_action',
      });
      const needsActionCount = filtered.length;

      const lastActivity = workLog
        .filter((entry) => entry.channel === assistant.source)
        .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())[0];

      const miniLog = workLog
        .filter((entry) => entry.channel === assistant.source)
        .slice(0, 5);

      return {
        ...assistant,
        isActive,
        needsActionCount,
        lastActivity,
        miniLog,
      };
    });
  }, [workLog, inboxItems, integrationStatuses]);

  const handleFeedClick = (source: string) => {
    router.push(`/inbox?src=${source}&status=needs_action`);
  };

  const handleSettingsClick = (assistantId: string) => {
    router.push(`/actions?cat=setup&integration=${assistantId}`);
  };

  const handleToggleActive = (assistantId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    const statuses = loadIntegrationStatuses();
    (statuses as any)[assistantId] = {
      ...(statuses as any)[assistantId],
      status: newStatus,
    };
    // Note: In real app use a mutation here
    window.location.reload();
  };

  if (!mounted) {
    return <div className="p-6 text-sm text-[var(--ak-color-text-muted)]">Lade Assistenten…</div>;
  }

  return (
    <div className="h-full overflow-y-auto ak-scrollbar">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ak-color-text-primary)] mb-1">
            Assistenten
          </h1>
          <p className="text-sm text-[var(--ak-color-text-muted)]">
            Übersicht über alle aktiven Bots und Assistenten
          </p>
        </div>

        <div className="space-y-4">
          {assistantData.map((assistant) => {
            const Icon = assistant.icon;
            return (
              <div
                key={assistant.id}
                className="rounded-xl border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] p-6 space-y-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[var(--ak-color-text-secondary)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
                          {assistant.label}
                        </h2>
                        <AkBadge
                          tone={assistant.isActive ? 'success' : 'neutral'}
                          size="xs"
                        >
                          {assistant.isActive ? 'Aktiv' : 'Pausiert'}
                        </AkBadge>
                      </div>
                      {assistant.lastActivity && (
                        <p className="text-xs text-[var(--ak-color-text-muted)] mt-1">
                          Letzte Aktivität:{' '}
                          {new Date(assistant.lastActivity.ts).toLocaleDateString('de-DE', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <AkButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(assistant.id, assistant.isActive ? 'active' : 'paused')}
                  >
                    {assistant.isActive ? 'Pausieren' : 'Aktivieren'}
                  </AkButton>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--ak-color-text-secondary)]">Offen:</span>
                    <AkBadge tone={assistant.needsActionCount > 0 ? 'warning' : 'neutral'} size="xs">
                      {assistant.needsActionCount}
                    </AkBadge>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[var(--ak-color-border-fine)]">
                  <AkButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedClick(assistant.source)}
                  >
                    Feed ansehen
                  </AkButton>
                  <AkButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSettingsClick(assistant.id)}
                  >
                    Einstellungen
                  </AkButton>
                </div>

                {assistant.miniLog.length > 0 && (
                  <div className="pt-2 border-t border-[var(--ak-color-border-fine)]">
                    <p className="text-xs font-medium text-[var(--ak-color-text-secondary)] mb-2">
                      Letzte Aktivitäten
                    </p>
                    <div className="space-y-1">
                      {assistant.miniLog.map((entry) => (
                        <div
                          key={entry.id}
                          className="text-xs text-[var(--ak-color-text-muted)] flex items-center gap-2"
                        >
                          <span className="w-1 h-1 rounded-full bg-[var(--ak-color-text-muted)]" />
                          <span className="truncate">{entry.title}</span>
                          <span className="text-[10px] opacity-60 ml-auto">
                            {new Date(entry.ts).toLocaleTimeString('de-DE', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
