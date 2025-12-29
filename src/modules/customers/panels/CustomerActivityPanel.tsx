'use client';

import React from 'react';
import { Clock } from 'lucide-react';

export interface ActivityEntry {
  id: string;
  label: string;
  time: string;
  type: string;
}

interface CustomerActivityPanelProps {
  activities: ActivityEntry[];
}

export const CustomerActivityPanel: React.FC<CustomerActivityPanelProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center p-6 opacity-50">
        <Clock className="w-10 h-10 text-[var(--ak-color-text-muted)] mb-2" />
        <p className="text-sm font-medium text-[var(--ak-color-text-secondary)]">Noch kein Verlauf</p>
        <p className="text-[11px] text-[var(--ak-color-text-muted)] italic">KI-Aktionen erscheinen nach Ausführung hier.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-300">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)] mb-2">Aktionsprotokoll</h4>
      <div className="relative pl-4 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-[var(--ak-color-border-subtle)]">
        {activities.map((activity) => (
          <div key={activity.id} className="relative group">
            <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--ak-color-bg-surface)] border-2 border-[var(--ak-semantic-success)] z-10 group-hover:scale-125 transition-transform" />
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
                KI-Vorschlag übernommen und der Kundenakte hinzugefügt.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

