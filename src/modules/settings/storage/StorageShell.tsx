'use client';

import React, { useState, useEffect } from 'react';
import { StorageLeftDrawer } from './StorageLeftDrawer';
import { StorageRightDrawer } from './StorageRightDrawer';
import { StorageTab, HistoryEntry } from './types';
import { MOCK_MEMORIES, MOCK_CHATS, MOCK_FILES } from './mockData';
import { STORAGE_ACTIONS } from './actions';
import { ServerIcon, ChevronLeftIcon, ChevronRightIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { applyAction } from '@/lib/actions/apply';
import type { ActionRunResult, ActionId } from '@/lib/actions/types';

export function StorageShell() {
  const [selectedTab, setSelectedTab] = useState<StorageTab>('memories');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [activities, setActivities] = useState<HistoryEntry[]>([]);
  const [lastResult, setLastResult] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_lastUndoId, setLastUndoId] = useState<string | null>(null);

  const selectedItem = React.useMemo(() => {
    if (!selectedId) return null;
    if (selectedTab === 'memories') return MOCK_MEMORIES.find(m => m.id === selectedId) || null;
    if (selectedTab === 'chats') return MOCK_CHATS.find(c => c.id === selectedId) || null;
    return MOCK_FILES.find(f => f.id === selectedId) || null;
  }, [selectedId, selectedTab]);

  const handleApplyAction = (result: ActionRunResult) => {
    const target = {
      module: 'storage' as const,
      targetId: selectedId || undefined,
      setResult: (text: string) => setLastResult(text),
      addActivity: (entry: unknown) => setActivities((prev) => [entry as HistoryEntry, ...prev]),
      labelLookup: (id: ActionId) => STORAGE_ACTIONS[id as keyof typeof STORAGE_ACTIONS]?.label || result.action.label,
      currentResult: lastResult,
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _applied = applyAction(result, target)
    setLastUndoId(null) // undoId not available in ApplyResult
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSelectedId(null);
    setLastResult(null);
    setLastUndoId(null);
  }, [selectedTab]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div className="flex h-full overflow-hidden bg-[var(--ak-color-bg-app)] relative">
      {/* Left Drawer */}
      <StorageLeftDrawer
        selectedId={selectedId}
        selectedTab={selectedTab}
        onSelect={(id) => { setSelectedId(id); setLastResult(null); setLastUndoId(null); }}
        onTabChange={setSelectedTab}
        isOpen={isLeftOpen}
      />

      {/* Center: Chat / Action Result Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
          {!selectedItem ? (
            <div className="max-w-sm space-y-4 opacity-40 animate-in fade-in duration-700">
              <ServerIcon className="w-16 h-16 mx-auto text-[var(--ak-color-text-muted)]" />
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-[var(--ak-color-text-primary)]">Speicher-Verwaltung</h2>
                <p className="text-sm text-[var(--ak-color-text-secondary)] leading-relaxed">
                  Wähle eine Erinnerung, einen Chat oder ein Dokument aus, um die Details zu prüfen oder KI-Aktionen auszuführen.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {lastResult ? (
                <div className="ak-glass p-8 rounded-3xl border border-[var(--ak-color-border-subtle)] text-left space-y-4 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[var(--ak-semantic-success)]" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-[var(--ak-semantic-success)] font-bold text-[10px] uppercase tracking-widest">
                      <InformationCircleIcon className="w-4 h-4" />
                      <span>Ergebnis der Aktion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {_lastUndoId && (
                        <button
                          onClick={() => {
                            // undoById(_lastUndoId)
                            setLastUndoId(null)
                          }}
                          className="text-[11px] font-semibold text-[var(--ak-semantic-success)] hover:text-[var(--ak-color-success-strong)] transition-colors"
                        >
                          Rückgängig
                        </button>
                      )}
                      <button onClick={() => setLastResult(null)} className="text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-secondary)] transition-colors text-xs font-medium">Ausblenden</button>
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-lg text-[var(--ak-color-text-primary)] leading-relaxed whitespace-pre-wrap">{lastResult}</p>
                  </div>
                </div>
              ) : (
                <div className="p-12 border-2 border-dashed border-[var(--ak-color-border-subtle)] rounded-[var(--ak-radius-3xl)] opacity-30">
                  <p className="text-[var(--ak-color-text-muted)] font-medium">Bereit für KI-Verwaltung</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Toggles */}
        {!isLeftOpen && (
          <button onClick={() => setIsLeftOpen(true)} className="fixed left-6 bottom-6 w-12 h-12 bg-[var(--ak-color-bg-surface)] rounded-full shadow-lg border border-[var(--ak-color-border-subtle)] flex items-center justify-center text-[var(--ak-color-text-muted)] hover:text-[var(--ak-semantic-success)] transition-all z-30">
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        )}
        {!isRightOpen && selectedItem && (
          <button onClick={() => setIsRightOpen(true)} className="fixed right-6 bottom-6 w-12 h-12 bg-[var(--ak-color-bg-surface)] rounded-full shadow-lg border border-[var(--ak-color-border-subtle)] flex items-center justify-center text-[var(--ak-color-text-muted)] hover:text-[var(--ak-semantic-success)] transition-all z-30">
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Right Drawer */}
      <StorageRightDrawer
        selectedItem={selectedItem}
        selectedTab={selectedTab}
        onApplyAction={handleApplyAction}
        activities={activities}
        isOpen={isRightOpen}
        onClose={() => setIsRightOpen(false)}
      />
    </div>
  );
}

