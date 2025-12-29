'use client';

import React, { useRef } from 'react';
import { InboxItem } from '@/components/InboxDrawerWidget';
import { InboxTabId } from '@/lib/inbox/actions';
import { OriginalView } from './OriginalView';
import { 
  DocumentIcon, 
  SparklesIcon, 
  PencilSquareIcon, 
  ListBulletIcon,
  ClockIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useScrollToTopOnOpen } from '@/hooks/useScrollToTopOnOpen';

interface InboxReadingPaneProps {
  item: InboxItem;
  tabContents: Record<InboxTabId, string>;
  onTabChange: (tabId: InboxTabId) => void;
  activeTab: InboxTabId;
}

export const InboxReadingPane: React.FC<InboxReadingPaneProps> = ({ 
  item, 
  tabContents,
  activeTab,
  onTabChange
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  // Reset scroll when item or tab changes
  useScrollToTopOnOpen({
    isOpen: !!item,
    contentKey: `${item?.id}-${activeTab}`,
    scrollRef: scrollRef as React.RefObject<HTMLElement>,
    headerRef: headerRef as React.RefObject<HTMLElement>,
  })

  const tabs: { id: InboxTabId; label: string; icon: React.ReactNode }[] = [
    { id: 'original', label: 'Original', icon: <DocumentIcon className="w-4 h-4" /> },
    { id: 'summary', label: 'Zusammenfassung', icon: <SparklesIcon className="w-4 h-4" /> },
    { id: 'draft', label: 'Entwurf', icon: <PencilSquareIcon className="w-4 h-4" /> },
    { id: 'tasks', label: 'Aufgaben', icon: <ListBulletIcon className="w-4 h-4" /> },
    { id: 'history', label: 'Verlauf', icon: <ClockIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--ak-color-bg-app)] overflow-hidden animate-in fade-in duration-500">
      {/* Tab Navigation as Chips */}
      <div 
        ref={headerRef}
        className="flex items-center gap-2 px-6 py-4 bg-[var(--ak-color-bg-app)] shrink-0 overflow-x-auto ak-scrollbar-none"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 focus:outline-none shrink-0 border",
              activeTab === tab.id
                ? "bg-[var(--ak-color-accent)] border-[var(--ak-color-accent)] shadow-sm"
                : "ak-surface-1 text-[var(--ak-color-text-secondary)] border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-color-border-strong)] hover:text-[var(--ak-color-text-primary)]"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto ak-scrollbar bg-[var(--ak-color-bg-app)]"
      >
        <div className="max-w-4xl mx-auto px-6 pb-8">
          {activeTab === 'original' ? (
            <OriginalView item={item} />
          ) : (
            <div className={clsx(
              "p-0 transition-all duration-500",
              tabContents[activeTab] ? "opacity-100" : "opacity-100"
            )}>
              {tabContents[activeTab] ? (
                <div className="ak-surface-1 rounded-[var(--ak-radius-lg)] border ak-border-default p-8 ak-elev-1">
                  <div className="prose prose-sm max-w-none text-[var(--ak-color-text-secondary)] animate-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center gap-2 mb-6 text-[var(--ak-color-accent)]">
                      <SparklesIcon className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">KI Generierter Inhalt</span>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {tabContents[activeTab]}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4 rounded-2xl border-2 border-dashed border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)]/30">
                  <div className="w-12 h-12 rounded-2xl ak-bg-surface-muted flex items-center justify-center border ak-border-default">
                    {tabs.find(t => t.id === activeTab)?.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold ak-text-muted">Kein Inhalt vorhanden</p>
                    <p className="text-xs ak-text-secondary mt-1 max-w-[200px]">Nutze die Aktionen im rechten Drawer, um Inhalte zu generieren.</p>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--ak-color-accent)] opacity-60">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Aktion wählen</span>
                    <ChevronDoubleRightIcon className="w-3 h-3 animate-pulse" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

