'use client';

import React, { useState } from 'react';
import { Customer, CustomerActionId } from '../types';
import { SparklesIcon, ChevronRight, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { runAction } from '@/lib/actions/runner';
import type { ActionRunResult } from '@/lib/actions/types';
import { listActionsForModule } from '@/lib/actions/registry';

interface CustomerActionsPanelProps {
  customer: Customer;
  onApplyAction: (result: ActionRunResult) => void;
}

export const CustomerActionsPanel: React.FC<CustomerActionsPanelProps> = ({
  customer,
  onApplyAction
}) => {
  const [activeActionId, setActiveActionId] = useState<CustomerActionId | null>(null);
  const [previewOutput, setPreviewOutput] = useState<ActionRunResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);

  const actions = listActionsForModule('customers').sort((a, b) => (a.uiOrder ?? 0) - (b.uiOrder ?? 0));
  const handleActionClick = async (id: CustomerActionId) => {
    setActiveActionId(id);
    setPreviewOutput(null);
    setIsGenerating(true);

    try {
      const result = await runAction(id, {
        target: { module: 'customers', targetId: customer.id, title: customer.name },
        moduleContext: { customer },
      });
      setPreviewOutput(result);
    } catch (error) {
      console.error('Customer action failed', error);
      setPreviewOutput(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const primaryActions = actions;
  const secondaryActions: typeof actions = [];

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-300">
      {/* Primary Actions */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)]">Fokus-Aktionen</h4>
        <div className="grid grid-cols-1 gap-2">
          {primaryActions.map((action) => (
            <ActionTile 
              key={action.id} 
              action={{ label: action.label, description: action.description ?? '' }}
              isActive={activeActionId === action.id}
              onClick={() => handleActionClick(action.id as CustomerActionId)} 
            />
          ))}
          {primaryActions.length === 0 && (
            <p className="text-xs text-[var(--ak-color-text-muted)]">Keine Core-Aktionen für Kunden verfügbar.</p>
          )}
        </div>
      </div>

      {/* Secondary Actions Toggle */}
      <div className="space-y-3">
        <button 
          onClick={() => setShowSecondary(!showSecondary)}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-secondary)] transition-colors"
        >
          <ChevronRight className={clsx("w-3 h-3 transition-transform", showSecondary && "rotate-90")} />
          Weitere Aktionen
        </button>
        
        {showSecondary && (
          <div className="grid grid-cols-1 gap-2 animate-in slide-in-from-top-2 duration-200">
            {secondaryActions.length === 0 && (
              <p className="text-xs text-[var(--ak-color-text-muted)]">Keine weiteren Aktionen verfügbar.</p>
            )}
          </div>
        )}
      </div>

      {/* Preview Card */}
      <AnimatePresence>
        {activeActionId && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="overflow-hidden bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] ak-shadow-md rounded-xl"
          >
            <div className="px-3 py-2 bg-[var(--ak-semantic-success-soft)] border-b border-[var(--ak-semantic-success-soft)] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--ak-semantic-success)] uppercase tracking-wider">
                <SparklesIcon className="w-3.5 h-3.5" />
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
              <p className="text-[10px] text-[var(--ak-color-text-muted)] mb-2 font-medium">Aktion: {actions.find(a => a.id === activeActionId)?.label}</p>
              
              {isGenerating ? (
                <div className="space-y-2 py-4">
                  <div className="h-3 bg-[var(--ak-color-bg-surface-muted)] rounded-full w-full animate-pulse" />
                  <div className="h-3 bg-[var(--ak-color-bg-surface-muted)] rounded-full w-5/6 animate-pulse" />
                  <div className="h-3 bg-[var(--ak-color-bg-surface-muted)] rounded-full w-4/6 animate-pulse" />
                </div>
              ) : (
                <div className="text-xs text-[var(--ak-color-text-primary)] leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto ak-scrollbar p-2 bg-[var(--ak-color-bg-surface-muted)] rounded-lg">
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
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ak-semantic-success)] text-[var(--ak-color-text-inverted)] text-[11px] font-bold rounded-lg shadow-sm hover:opacity-90 transition-colors disabled:opacity-50"
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

const ActionTile = ({ action, isActive, onClick }: { action: { label: string, description: string }, isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={clsx(
      "group flex items-center justify-between p-3 rounded-xl transition-all duration-200 border",
      isActive
        ? "bg-[var(--ak-semantic-success)] text-[var(--ak-color-text-inverted)] border-transparent shadow-lg scale-[1.02]"
        : "bg-[var(--ak-color-bg-surface)]/60 text-[var(--ak-color-text-primary)] border-[var(--ak-color-border-subtle)] shadow-sm hover:bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-semantic-success)]/30 hover:shadow-md"
    )}
  >
    <div className="flex items-center gap-3">
      <div className={clsx(
        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
        isActive ? "bg-[var(--ak-color-text-inverted)]/20" : "bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-semantic-success)] group-hover:bg-[var(--ak-semantic-success-soft)]"
      )}>
        <SparklesIcon className="w-4 h-4" />
      </div>
      <div className="text-left">
        <p className="text-xs font-semibold">{action.label}</p>
        <p className={clsx(
          "text-[10px] truncate w-[160px]",
          isActive ? "text-[var(--ak-color-text-inverted)]/80" : "text-[var(--ak-color-text-muted)]"
        )}>
          {action.description}
        </p>
      </div>
    </div>
    <ChevronRight className={clsx("w-3.5 h-3.5 shrink-0 transition-transform", isActive ? "rotate-90 translate-x-1" : "text-[var(--ak-color-text-muted)]")} />
  </button>
);

