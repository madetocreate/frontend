'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { StorageTab, RightDrawerTab, HistoryEntry } from './types';
import { StorageContextPanel } from './panels/StorageContextPanel';
import { StorageActionsPanel } from './panels/StorageActionsPanel';
import { StorageActivityPanel } from './panels/StorageActivityPanel';
import { X } from 'lucide-react';
import type { ActionRunResult } from '@/lib/actions/types';

import type { MemoryItem, ChatSource, FileItem } from './types';

interface StorageRightDrawerProps {
  selectedItem: MemoryItem | ChatSource | FileItem | null;
  selectedTab: StorageTab;
  onApplyAction: (result: ActionRunResult) => void;
  activities: HistoryEntry[];
  isOpen: boolean;
  onClose: () => void;
}

export const StorageRightDrawer: React.FC<StorageRightDrawerProps> = ({
  selectedItem,
  selectedTab,
  onApplyAction,
  activities,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<RightDrawerTab>('context');

  if (!selectedItem) return null;

  const tabs: { id: RightDrawerTab; label: string }[] = [
    { id: 'context', label: 'Kontext' },
    { id: 'actions', label: 'Aktionen' },
    { id: 'history', label: 'Verlauf' },
  ];

  return (
    <div className={clsx(
      "fixed inset-y-0 right-0 lg:relative lg:inset-auto h-full flex flex-col border-l border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)]/80 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-in-out z-20",
      isOpen ? "w-[320px] translate-x-0 opacity-100" : "w-0 translate-x-full opacity-0 pointer-events-none"
    )}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--ak-color-border-hairline)]">
        <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ak-color-text-muted)]">KI-Speicher</h2>
        <button onClick={onClose} className="p-1.5 hover:bg-[var(--ak-color-bg-hover)] rounded-full transition-colors group">
          <X className="w-4 h-4 text-[var(--ak-color-text-muted)] group-hover:text-[var(--ak-color-text-primary)]" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-4 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]/50 backdrop-blur-md">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "relative px-4 py-3 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none",
              activeTab === tab.id ? "text-[var(--ak-color-accent)]" : "text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)]"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--ak-color-accent)] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto ak-scrollbar">
        {activeTab === 'context' && (
          <StorageContextPanel item={selectedItem} tab={selectedTab} />
        )}
        {activeTab === 'actions' && (
          <StorageActionsPanel itemType={selectedTab} selectedItem={selectedItem} onApplyAction={onApplyAction} />
        )}
        {activeTab === 'history' && (
          <StorageActivityPanel activities={activities} />
        )}
      </div>
    </div>
  );
};

