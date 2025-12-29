'use client';

import React from 'react';
import { NotificationTabId } from './types';
import clsx from 'clsx';

interface NotificationTabsProps {
  activeTab: NotificationTabId;
  onTabChange: (id: NotificationTabId) => void;
}

export const NotificationTabs: React.FC<NotificationTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs: { id: NotificationTabId; label: string }[] = [
    { id: 'new', label: 'Neu' },
    { id: 'done', label: 'Erledigt' },
    { id: 'all', label: 'Alle' },
    { id: 'activity', label: 'Verlauf' },
  ];

  return (
    <div className="flex px-4 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-glass-bg)]/50 backdrop-blur-md">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={clsx(
            "relative px-4 py-3 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none",
            activeTab === tab.id
              ? "text-[var(--ak-semantic-success)]"
              : "text-[var(--ak-text-muted)] hover:text-[var(--ak-text-secondary)]"
          )}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--ak-semantic-success)] rounded-t-full animate-in fade-in slide-in-from-bottom-1" />
          )}
        </button>
      ))}
    </div>
  );
};

