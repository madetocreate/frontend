'use client';

import React, { useState, useMemo } from 'react';
import { StorageTab, MemoryItem, ChatSource, FileItem } from './types';
import { MOCK_MEMORIES, MOCK_CHATS, MOCK_FILES } from './mockData';
import { Search, Filter } from 'lucide-react';
import clsx from 'clsx';
import { ScrollShadows } from '@/components/ui/ScrollShadows';

type ListItem = MemoryItem | ChatSource | FileItem;

interface StorageLeftDrawerProps {
  selectedId: string | null;
  selectedTab: StorageTab;
  onSelect: (id: string, tab: StorageTab) => void;
  onTabChange: (tab: StorageTab) => void;
  isOpen: boolean;
}

export const StorageLeftDrawer: React.FC<StorageLeftDrawerProps> = ({
  selectedId,
  selectedTab,
  onSelect,
  onTabChange,
  isOpen
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo((): ListItem[] => {
    const query = searchQuery.toLowerCase();
    if (selectedTab === 'memories') {
      return MOCK_MEMORIES.filter(m => m.title.toLowerCase().includes(query) || m.summary.toLowerCase().includes(query));
    } else if (selectedTab === 'chats') {
      return MOCK_CHATS.filter(c => c.title.toLowerCase().includes(query) || c.snippet.toLowerCase().includes(query));
    } else {
      return MOCK_FILES.filter(f => f.filename.toLowerCase().includes(query));
    }
  }, [selectedTab, searchQuery]);

  return (
    <div className={clsx(
      "fixed inset-y-0 left-0 lg:relative lg:inset-auto h-full flex flex-col border-r border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-sidebar)]/80 backdrop-blur-xl transition-all duration-300 ease-in-out z-20",
      isOpen ? "w-[320px] translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0 pointer-events-none"
    )}>
      {/* Header / Search */}
      <div className="p-4 space-y-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ak-color-text-muted)] group-focus-within:text-[var(--ak-color-accent)] transition-colors" />
          <input
            type="text"
            placeholder="Speicher durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] rounded-[var(--ak-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent-soft)] transition-all placeholder-[var(--ak-color-text-muted)] text-[var(--ak-color-text-primary)]"
          />
        </div>

        {/* Segmented Control */}
        <div className="flex p-1 bg-[var(--ak-color-bg-surface-muted)] rounded-[var(--ak-radius-md)] border border-[var(--ak-color-border-fine)]">
          {(['memories', 'chats', 'documents'] as StorageTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={clsx(
                "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-[var(--ak-radius-sm)] transition-all",
                selectedTab === tab 
                  ? "bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-accent)] shadow-sm"
                  : "text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-secondary)]"
              )}
            >
              {tab === 'memories' && 'Erinnerung'}
              {tab === 'chats' && 'Chats'}
              {tab === 'documents' && 'Docs'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <ScrollShadows className="flex-1 px-2 pb-4 space-y-1">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center space-y-2 opacity-50">
            <Filter className="w-8 h-8 text-[var(--ak-color-text-muted)] mx-auto" />
            <p className="text-sm font-medium text-[var(--ak-color-text-secondary)]">Keine Einträge gefunden.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id, selectedTab)}
              className={clsx(
                "w-full text-left p-3 rounded-[var(--ak-radius-lg)] transition-all duration-200 group border border-transparent relative",
                selectedId === item.id
                  ? "bg-[var(--ak-color-bg-surface)] border-[var(--ak-color-accent-soft)] shadow-sm"
                  : "hover:bg-[var(--ak-color-bg-surface)]/60"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={clsx(
                  "text-sm font-semibold truncate pr-2",
                  selectedId === item.id ? "text-[var(--ak-color-accent)]" : "text-[var(--ak-color-text-primary)]"
                )}>
                  {'title' in item ? item.title : item.filename}
                </span>
                <span className="text-[10px] text-[var(--ak-color-text-muted)] shrink-0 tabular-nums">
                  {'timestamp' in item ? item.timestamp : item.date}
                </span>
              </div>
              
              <p className="text-[11px] text-[var(--ak-color-text-secondary)] line-clamp-1 mb-2">
                {selectedTab === 'memories' ? (item as MemoryItem).summary : (selectedTab === 'chats' ? (item as ChatSource).snippet : (item as FileItem).size)}
              </p>

              <div className="flex items-center gap-2">
                {selectedTab === 'memories' && (
                  <>
                    <span className={clsx(
                      "px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest",
                      (item as MemoryItem).confidence === 'confirmed' 
                        ? "bg-[var(--ak-color-success-soft)] text-[var(--ak-color-success)]" 
                        : "bg-[var(--ak-color-warning-soft)] text-[var(--ak-color-warning)]"
                    )}>
                      {(item as MemoryItem).confidence}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-[var(--ak-color-bg-surface-muted)] text-[9px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-widest">
                      {(item as MemoryItem).source}
                    </span>
                  </>
                )}
                {selectedTab === 'chats' && (
                  <span className="px-1.5 py-0.5 rounded-md bg-[var(--ak-color-accent-soft)] text-[9px] font-bold text-[var(--ak-color-accent)] uppercase tracking-widest">
                    {(item as ChatSource).channel}
                  </span>
                )}
                {selectedTab === 'documents' && (
                  <span className="px-1.5 py-0.5 rounded-md bg-[var(--ak-color-accent-documents-soft)] text-[9px] font-bold text-[var(--ak-color-accent-documents)] uppercase tracking-widest">
                    {(item as FileItem).type}
                  </span>
                )}
              </div>

              {/* Selection Indicator */}
              {selectedId === item.id && (
                <div className="absolute left-0 top-4 bottom-4 w-1 bg-[var(--ak-color-accent)] rounded-r-full" />
              )}
            </button>
          ))
        )}
      </ScrollShadows>
    </div>
  );
};
