'use client';

import React from 'react';
import { CustomerTabId } from './types';
import clsx from 'clsx';

interface CustomersDrawerTabsProps {
  activeTab: CustomerTabId;
  onTabChange: (id: CustomerTabId) => void;
}

export const CustomersDrawerTabs: React.FC<CustomersDrawerTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs: { id: CustomerTabId; label: string }[] = [
    { id: 'context', label: 'Kontext' },
    { id: 'actions', label: 'Aktionen' },
    { id: 'activity', label: 'Verlauf' },
  ];

  return (
    <div className="flex px-4 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)]/50 backdrop-blur-md">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={clsx(
            "relative px-4 py-3 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none",
            activeTab === tab.id
              ? "text-[var(--ak-semantic-success)]"
              : "text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)]"
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

