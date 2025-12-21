'use client';

import React, { useState } from 'react';
import { StorageTab, StorageActionId, MemoryItem, ChatSource, FileItem } from '../types';
import { STORAGE_ACTIONS } from '../actions';
import { Sparkles, ChevronRight, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { runAction } from '@/lib/actions/runner';
import type { ActionRunResult } from '@/lib/actions/types';

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

  const actions = ACTIONS_BY_TAB[itemType] || [];

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
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Verfügbare Aktionen</h4>
        <div className="grid grid-cols-1 gap-2">
          {actions.map((actionId) => {
            const action = STORAGE_ACTIONS[actionId];
            return (
              <button
                key={actionId}
                onClick={() => handleActionClick(actionId)}
                className={clsx(
                  "group flex items-center justify-between p-3 rounded-xl transition-all duration-200 border",
                  activeActionId === actionId
                    ? "bg-green-500 text-white border-transparent shadow-lg scale-[1.02]"
                    : "bg-white/60 text-gray-700 border-white shadow-sm hover:bg-white hover:border-green-500/30 hover:shadow-md"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    activeActionId === actionId ? "bg-white/20" : "bg-gray-100 text-green-600 group-hover:bg-green-50"
                  )}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold">{action.label}</p>
                    <p className={clsx(
                      "text-[10px] truncate w-[160px]",
                      activeActionId === actionId ? "text-white/80" : "text-gray-400"
                    )}>
                      {action.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className={clsx("w-3.5 h-3.5 shrink-0 transition-transform", activeActionId === actionId ? "rotate-90 translate-x-1" : "text-gray-300")} />
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {activeActionId && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="apple-card-strong overflow-hidden bg-white/90 border border-green-500/20 shadow-xl"
          >
            <div className="px-3 py-2 bg-green-500/5 border-b border-green-500/10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-green-600 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                {isGenerating ? 'Generiere...' : 'Vorschau'}
              </div>
              <button 
                onClick={() => setActiveActionId(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-3">
              {isGenerating ? (
                <div className="space-y-2 py-4">
                  <div className="h-3 bg-gray-100 rounded-full w-full animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded-full w-5/6 animate-pulse" />
                </div>
              ) : (
                <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto ak-scrollbar p-2 bg-white/50 rounded-lg">
                  {previewOutput?.previewText}
                </div>
              )}
            </div>

            <div className="px-3 py-2 border-t border-gray-100 flex gap-2 justify-end bg-gray-50/50">
              <button 
                onClick={() => setActiveActionId(null)}
                className="px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
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
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-[11px] font-bold rounded-lg shadow-sm hover:bg-green-600 transition-colors disabled:opacity-50"
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

