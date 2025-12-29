'use client';

import React, { useState, useEffect } from 'react';
import { getAuditLog, clearAuditLog } from '@/lib/actions/audit';
import type { AuditEntry } from '@/lib/actions/types';
import { InboxIcon, TrashIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export const NotificationActivityTab: React.FC = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  const updateEntries = () => {
    const auditLog = getAuditLog();
    // Neueste zuerst, max 20
    setEntries(auditLog.slice(0, 20));
  };

  useEffect(() => {
    updateEntries();
    const interval = setInterval(updateEntries, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = () => {
    clearAuditLog();
    setEntries([]);
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'inbox':
        return 'bg-[var(--ak-accent-inbox-soft)] text-[var(--ak-accent-inbox)]';
      case 'customers':
      case 'crm':
        return 'bg-[var(--ak-accent-customers-soft)] text-[var(--ak-accent-customers)]';
      case 'documents':
      case 'storage':
        return 'bg-[var(--ak-accent-documents-soft)] text-[var(--ak-accent-documents)]';
      case 'growth':
      case 'reviews':
        return 'bg-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning)]';
      default:
        return 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-text-muted)]';
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center p-8 opacity-40">
        <InboxIcon className="w-12 h-12 ak-text-muted mb-3" />
        <p className="text-sm font-medium ak-text-secondary">
          Keine Aktivitäten
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto ak-scrollbar p-2 space-y-1">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={clsx(
              "group relative flex items-start gap-3 p-4 rounded-2xl transition-all duration-200 border border-transparent",
              "hover:bg-[var(--ak-color-bg-surface)]/60"
            )}
          >
            {/* Module Color Dot */}
            <div className={clsx(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
              getModuleColor(entry.module)
            )}>
              <div className="h-2 w-2 rounded-full bg-current" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-12">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <h4 className="text-sm font-medium ak-text-secondary truncate">
                  {entry.preview || entry.actionId}
                </h4>
                <span className="text-[10px] ak-text-muted tabular-nums whitespace-nowrap">
                  {formatTime(entry.createdAt)}
                </span>
              </div>
              <p className="text-xs ak-text-muted line-clamp-1">
                {entry.module}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Clear Button */}
      <div className="px-4 py-3 border-t border-[var(--ak-color-border-subtle)]">
        <button
          onClick={handleClear}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[var(--ak-text-muted)] hover:text-[var(--ak-semantic-danger)] hover:bg-[var(--ak-semantic-danger-soft)] transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
          Verlauf löschen
        </button>
      </div>
    </div>
  );
};

