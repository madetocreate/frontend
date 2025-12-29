'use client';

import { InboxItem } from './types';
import { InboxItemCard } from './InboxItemCard';
import { getInboxSummary } from './filtering';
import { Virtuoso } from 'react-virtuoso';
import { AkBadge } from '@/components/ui/AkBadge';
import { AkEmptyState } from '@/components/ui/AkEmptyState';
import { AkButton } from '@/components/ui/AkButton';

interface InboxListProps {
  items: InboxItem[];
  onSelectItem: (item: InboxItem) => void;
  onStartTriage?: () => void;
}

export function InboxList({ items, onSelectItem, onStartTriage }: InboxListProps) {
  const summary = getInboxSummary(items);

  return (
    <div className="space-y-4 flex flex-col h-full min-h-0">
      {/* Summary */}
      <div className="flex items-center justify-between shrink-0">
        <div className="text-sm text-[var(--ak-color-text-secondary)] flex items-center gap-2">
          {summary.needsAction > 0 && (
            <>
              <AkBadge tone="warning" size="xs">
                {summary.needsAction} Aktion nötig
              </AkBadge>
            </>
          )}
          {summary.needsAction > 0 && summary.total > 0 && ' · '}
          {summary.total > 0 && <span>{summary.total} insgesamt</span>}
          {summary.total === 0 && <span>Keine Einträge</span>}
        </div>

        {summary.needsAction > 0 && onStartTriage && (
          <AkButton
            variant="primary"
            accent="graphite"
            size="sm"
            onClick={onStartTriage}
          >
            Inbox aufräumen ({summary.needsAction})
          </AkButton>
        )}
      </div>

      {/* Virtualized List */}
      <div className="flex-1 min-h-0 -mx-4 px-4">
        {items.length > 0 ? (
          <Virtuoso
            data={items}
            style={{ height: '100%' }}
            itemContent={(index, item) => (
              <div className="pb-4 px-2 pt-2">
                <div className="max-w-3xl mx-auto">
                   <InboxItemCard item={item} onClick={() => onSelectItem(item)} />
                </div>
              </div>
            )}
            computeItemKey={(index, item) => item.id}
          />
        ) : (
          <AkEmptyState
            title="Keine Ergebnisse"
            description="Passe Filter oder Suche an."
          />
        )}
      </div>
    </div>
  );
}

