'use client';

import React, { useState } from 'react';
import { GrowthActionId, GrowthMode, CampaignType, GrowthTabId } from './types';
import { getActionsForMode, GROWTH_ACTIONS } from './actions';
import { SparklesIcon, ChevronRight, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { runAction } from '@/lib/actions/runner';
import type { ActionRunResult } from '@/lib/actions/types';
import { listActionsForModule, isExecutableActionId } from '@/lib/actions/registry';

interface GrowthRightDrawerProps {
  mode: GrowthMode;
  campaignType: CampaignType;
  onApplyAction: (result: ActionRunResult) => void;
  activities: { id: string, label: string, time: string }[];
  isOpen: boolean;
  onClose: () => void;
}

export const GrowthRightDrawer: React.FC<GrowthRightDrawerProps> = ({
  mode,
  campaignType,
  onApplyAction,
  activities,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<GrowthTabId>('actions');
  const [activeActionId, setActiveActionId] = useState<GrowthActionId | null>(null);
  const [previewOutput, setPreviewOutput] = useState<ActionRunResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const coreActions = listActionsForModule('growth').map((a) => a.id as GrowthActionId);
  // FAIL-CLOSED: Filtere Fallback-Actions nach executable Status
  const fallbackActions = (getActionsForMode(mode, campaignType) || []).filter(id => isExecutableActionId(id));
  const actions = coreActions.length ? coreActions : fallbackActions;

  const handleActionClick = async (id: GrowthActionId) => {
    setActiveActionId(id);
    setPreviewOutput(null);
    setIsGenerating(true);
    try {
      const result = await runAction(id, {
        target: { module: 'growth', targetId: `${mode}-${campaignType}`, title: mode },
        moduleContext: { mode, campaignType },
      });
      setPreviewOutput(result);
    } catch (error) {
      console.error('Growth action failed', error);
      setPreviewOutput(null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={clsx(
      "fixed inset-y-0 right-0 lg:relative lg:inset-auto h-full flex flex-col border-l border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)]/80 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-in-out z-20",
      isOpen ? "w-[320px] translate-x-0 opacity-100" : "w-0 translate-x-full opacity-0 pointer-events-none"
    )}>
      <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--ak-color-border-hairline)]">
        <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ak-color-text-muted)]">Wachstums-KI</h2>
        <button onClick={onClose} className="p-1.5 hover:bg-[var(--ak-color-bg-hover)] rounded-full transition-colors"><X className="w-4 h-4 text-[var(--ak-color-text-muted)]" /></button>
      </div>

      <div className="flex px-4 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]">
        {(['context', 'actions', 'activity'] as GrowthTabId[]).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={clsx(
              "relative px-4 py-3 text-[11px] font-bold uppercase tracking-wider transition-all focus:outline-none",
              activeTab === t ? "text-[var(--ak-semantic-success)]" : "text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-secondary)]"
            )}
          >
            {t === 'context' && 'Kontext'}
            {t === 'actions' && 'Aktionen'}
            {t === 'activity' && 'Verlauf'}
            {activeTab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--ak-semantic-success)] rounded-t-full" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto ak-scrollbar">
        {activeTab === 'actions' && (
          <div className="p-4 space-y-6">
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)]">KI Aktionen</h4>
              <div className="grid grid-cols-1 gap-2">
                {actions.map(id => {
                  const action = GROWTH_ACTIONS[id];
                  return (
                    <button
                      key={id}
                      onClick={() => handleActionClick(id)}
                      className={clsx(
                        "group flex items-center justify-between p-3 rounded-xl transition-all border",
                        activeActionId === id
                          ? "bg-[var(--ak-semantic-success)] text-[var(--ak-color-text-inverted)] border-transparent shadow-lg"
                          : "bg-[var(--ak-color-bg-surface)]/60 text-[var(--ak-color-text-primary)] border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-semantic-success)]/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <SparklesIcon className={clsx("w-4 h-4", activeActionId === id ? "text-[var(--ak-color-text-inverted)]" : "text-[var(--ak-semantic-success)]")} />
                        <div className="text-left">
                          <p className="text-xs font-semibold">{action.label}</p>
                          <p className={clsx("text-[10px] truncate w-[160px]", activeActionId === id ? "text-[var(--ak-color-text-inverted)]/70" : "text-[var(--ak-color-text-muted)]")}>{action.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
                {actions.length === 0 && (
                  <p className="text-xs text-[var(--ak-color-text-muted)]">Keine Core-Aktionen für Growth verfügbar.</p>
                )}
              </div>
            </div>

            <AnimatePresence>
              {activeActionId && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] ak-shadow-md overflow-hidden rounded-xl">
                  <div className="px-3 py-2 bg-[var(--ak-semantic-success-soft)] border-b border-[var(--ak-semantic-success-soft)] flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[var(--ak-semantic-success)] uppercase tracking-wider flex items-center gap-1.5"><SparklesIcon className="w-3.5 h-3.5" /> Vorschau</span>
                    <button onClick={() => setActiveActionId(null)}><X className="w-4 h-4 text-[var(--ak-color-text-muted)]" /></button>
                  </div>
                  <div className="p-3">
                    {isGenerating ? <div className="h-20 flex items-center justify-center"><div className="w-6 h-6 border-2 border-[var(--ak-semantic-success)]/20 border-t-[var(--ak-semantic-success)] rounded-full animate-spin" /></div> : <div className="text-xs text-[var(--ak-color-text-primary)] leading-relaxed whitespace-pre-wrap">{previewOutput?.previewText}</div>}
                  </div>
                  <div className="px-3 py-2 bg-[var(--ak-color-bg-surface-muted)]/50 border-t border-[var(--ak-color-border-subtle)] flex gap-2 justify-end">
                    <button onClick={() => setActiveActionId(null)} className="px-3 py-1.5 text-[11px] font-medium text-[var(--ak-color-text-muted)]">Verwerfen</button>
                    <button onClick={() => { if (previewOutput) { onApplyAction(previewOutput); setActiveActionId(null); } }} className="px-3 py-1.5 bg-[var(--ak-semantic-success)] text-[var(--ak-color-text-inverted)] text-[11px] font-bold rounded-lg"><Check className="w-3.5 h-3.5 inline mr-1" /> Übernehmen</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'context' && <div className="p-8 text-center opacity-40"><p className="text-sm font-medium text-[var(--ak-color-text-secondary)]">Kontext wird analysiert...</p></div>}
        {activeTab === 'activity' && (
          <div className="p-4 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)]">Verlauf</h4>
            {activities.length === 0 ? <p className="text-xs text-[var(--ak-color-text-muted)] italic">Noch keine Aktivitäten.</p> : (
              <div className="space-y-4 pl-4 border-l border-[var(--ak-color-border-subtle)]">
                {activities.map(a => (
                  <div key={a.id} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--ak-color-bg-surface)] border-2 border-[var(--ak-semantic-success)]" />
                    <p className="text-xs font-semibold text-[var(--ak-color-text-primary)]">{a.label}</p>
                    <p className="text-[10px] text-[var(--ak-color-text-muted)]">{a.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

