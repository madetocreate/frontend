'use client';

import React from 'react';
import { 
  ClockIcon
} from '@heroicons/react/24/outline';

export interface ActivityEntry {
  id: string;
  type: string;
  label: string;
  time: string;
}

interface ActivityPanelProps {
  activities: ActivityEntry[];
}

export const ActivityPanel: React.FC<ActivityPanelProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center p-6 opacity-50">
        <ClockIcon className="w-10 h-10 ak-text-muted mb-2" />
        <p className="text-sm font-medium ak-text-secondary">Noch keine Aktivitäten</p>
        <p className="text-[11px] ak-text-muted">Führe eine Aktion aus, um sie hier zu sehen.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-300">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)] mb-2">Aktionsprotokoll</h4>
      <div className="relative pl-4 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-[var(--ak-color-border-hairline)]">
        {activities.map((activity) => (
          <div key={activity.id} className="relative group">
            <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full ak-bg-surface-1 border-2 border-[var(--ak-color-accent)] z-10 group-hover:scale-125 transition-transform" />
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[var(--ak-color-text-primary)]">
                  {activity.label}
                </span>
                <span className="text-[10px] text-[var(--ak-color-text-muted)] tabular-nums">
                  {activity.time}
                </span>
              </div>
              <p className="text-[11px] text-[var(--ak-color-text-secondary)] mt-0.5">
                Output wurde in den entsprechenden Tab übernommen.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

