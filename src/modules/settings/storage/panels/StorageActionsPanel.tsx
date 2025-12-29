'use client';

import React, { useState } from 'react';
import { StorageTab, StorageActionId, MemoryItem, ChatSource, FileItem } from '../types';
import { STORAGE_ACTIONS } from '../actions';
import { Sparkles, ChevronRight, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { runAction } from '@/lib/actions/runner';
import type { ActionRunResult } from '@/lib/actions/types';
import { listActionsForModule, isExecutableActionId } from '@/lib/actions/registry';

interface StorageActionsPanelProps {
  itemType: StorageTab;
  selectedItem?: MemoryItem | ChatSource | FileItem | null;
  onApplyAction: (result: ActionRunResult) => void;
}

const ACTIONS_BY_TAB: Record<StorageTab, StorageActionId[]> = {
  memories: ['storage.summarize', 'storage.editMemory', 'storage.suggestTags', 'storage.saveAsMemory'],
  chats: ['storage.extractFacts', 'storage.saveAsMemory', 'storage.suggestTags', 'storage.summarize'],
  documents: ['storage.extractFacts', 'storage.summarize', 'storage.saveAsMemory', 'storage.suggestTags'],
}

export const StorageActionsPanel: React.FC<StorageActionsPanelProps> = ({
  itemType,
  selectedItem,
  onApplyAction
}) => {
  const [activeActionId, setActiveActionId] = useState<StorageActionId | null>(null);
  const [previewOutput, setPreviewOutput] = useState<ActionRunResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const executableActions = listActionsForModule('storage').map((a) => a.id as StorageActionId);
  // FAIL-CLOSED: Filtere Fallback-Actions nach executable Status
  const fallbackActions = (ACTIONS_BY_TAB[itemType] || []).filter(id => isExecutableActionId(id));
  const actions = executableActions.length ? executableActions : fallbackActions;

  const handleActionClick = async (id: StorageActionId) => {
    setActiveActionId(id);
    setPreviewOutput(null);
    setIsGenerating(true);

    try {
      const result = await runAction(id, {
        target: { module: 'storage', targetId: itemType, title: itemType },
        moduleContext: { item: selectedItem },
      });
      setPreviewOutput(result);
    } catch (error) {
      console.error('Storage action failed', error);
      setPreviewOutput(null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-300">
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)]">Verfügbare Aktionen</h4>
        <div className="grid grid-cols-1 gap-2">
          {actions.map((actionId) => {
            const action = STORAGE_ACTIONS[actionId];
            return (
              <button
                key={actionId}
                onClick={() => handleActionClick(actionId)}
                className={clsx(
                  "group flex items-center justify-between p-3 rounded-[var(--ak-radius-xl)] transition-all duration-200 border",
                  activeActionId === actionId
                    ? "bg-[var(--ak-semantic-success)] text-[var(--ak-color-text-inverted)] border-transparent shadow-lg scale-[1.02]"
                    : "bg-[var(--ak-color-bg-surface)]/60 text-[var(--ak-color-text-primary)] border-[var(--ak-color-border-subtle)] shadow-sm hover:bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-semantic-success)]/30 hover:shadow-md"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-8 h-8 rounded-[var(--ak-radius-lg)] flex items-center justify-center transition-colors",
                    activeActionId === actionId
                      ? "bg-[var(--ak-color-text-inverted)]/20"
                      : "bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-semantic-success)] group-hover:bg-[var(--ak-semantic-success-soft)]"
                  )}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-[var(--ak-color-text-primary)]">{action.label}</p>
                    <p className={clsx(
                      "text-[10px] truncate w-[160px]",
                      activeActionId === actionId ? "text-[var(--ak-color-text-inverted)]/80" : "text-[var(--ak-color-text-muted)]"
                    )}>
                      {action.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className={clsx(
                  "w-3.5 h-3.5 shrink-0 transition-transform",
                  activeActionId === actionId ? "rotate-90 translate-x-1" : "text-[var(--ak-color-text-muted)]"
                )} />
              </button>
            );
          })}
          {actions.length === 0 && (
            <p className="text-xs text-[var(--ak-color-text-muted)]">Keine Core-Aktionen für Storage verfügbar.</p>
          )}
        </div>
      </div>

      <AnimatePresence>
          {activeActionId && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="overflow-hidden bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] ak-shadow-md rounded-[var(--ak-radius-xl)]"
            >
              <div className="px-3 py-2 bg-[var(--ak-semantic-success-soft)] border-b border-[var(--ak-semantic-success-soft)] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--ak-semantic-success)] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isGenerating ? 'Generiere...' : 'Vorschau'}
                </div>
                <button 
                  onClick={() => setActiveActionId(null)}
                  className="text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-secondary)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-3">
                {isGenerating ? (
                  <div className="space-y-2 py-4">
                    <div className="h-3 bg-[var(--ak-color-bg-surface-muted)] rounded-full w-full animate-pulse" />
                    <div className="h-3 bg-[var(--ak-color-bg-surface-muted)] rounded-full w-5/6 animate-pulse" />
                  </div>
                ) : (
                  <div className="text-xs text-[var(--ak-color-text-primary)] leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto ak-scrollbar p-2 bg-[var(--ak-color-bg-surface-muted)] rounded-[var(--ak-radius-lg)]">
                    {previewOutput?.previewText}
                  </div>
                )}
              </div>

              <div className="px-3 py-2 border-t border-[var(--ak-color-border-subtle)] flex gap-2 justify-end bg-[var(--ak-color-bg-surface-muted)]/50">
                <button 
                  onClick={() => setActiveActionId(null)}
                  className="px-3 py-1.5 text-[11px] font-medium text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)] transition-colors"
                >
                  Verwerfen
                </button>
                <button 
                  disabled={isGenerating}
                  onClick={() => {
                    if (previewOutput) {
                      onApplyAction(previewOutput);
                      setActiveActionId(null);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ak-semantic-success)] text-[var(--ak-color-text-inverted)] text-[11px] font-bold rounded-[var(--ak-radius-lg)] shadow-sm hover:bg-[var(--ak-semantic-success-strong)] transition-colors disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  Übernehmen
                </button>
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

