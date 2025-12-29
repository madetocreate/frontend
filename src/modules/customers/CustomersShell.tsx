'use client';

import React, { useState } from 'react';
import { CustomersLeftDrawer } from './CustomersLeftDrawer';
import { CustomersRightDrawer } from './CustomersRightDrawer';
import { Customer } from './types';
import { ActivityEntry } from './panels/CustomerActivityPanel';
import { CUSTOMER_ACTIONS } from './actions';
import { AkEmptyState } from '@/components/ui/AkEmptyState';
import { UserGroupIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { applyAction } from '@/lib/actions/apply';
import type { ActionRunResult, ActionId } from '@/lib/actions/types';

export function CustomersShell() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [lastResult, setResult] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_lastUndoId, setLastUndoId] = useState<string | null>(null);

  const handleApplyAction = (result: ActionRunResult) => {
    const target = {
      module: 'customers' as const,
      targetId: selectedCustomer?.id,
      setResult: (text: string) => setResult(text),
      addActivity: (entry: unknown) => setActivities((prev) => [entry as ActivityEntry, ...prev]),
      labelLookup: (id: ActionId) => CUSTOMER_ACTIONS.find((a) => a.id === id)?.label || result.action.label,
      currentResult: lastResult,
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _applyResult = applyAction(result, target)
    setLastUndoId(null) // undoId not available in ApplyResult
  };

  return (
    <div className="flex h-full overflow-hidden bg-[var(--ak-color-bg-app)] relative">
      {/* Left Drawer: List */}
      <CustomersLeftDrawer
        selectedCustomerId={selectedCustomer?.id || null}
        onSelectCustomer={(c) => {
          setSelectedCustomer(c);
          setResult(null); // Reset result when switching customer
          setActivities([]); // Reset activities for mock demo
          setLastUndoId(null);
        }}
        isOpen={isLeftOpen}
      />

      {/* Middle: Chat (Placeholder/Active Area) */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Context Pill */}
        {selectedCustomer && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--ak-color-bg-surface)] backdrop-blur-md border border-[var(--ak-semantic-success-soft)] rounded-full shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[var(--ak-semantic-success)] animate-pulse" />
              <span className="text-[11px] font-bold text-[var(--ak-color-text-primary)]">Kunde: {selectedCustomer.name}</span>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
          {!selectedCustomer ? (
            <AkEmptyState
              title="Kunden-Bereich"
              description="Wähle einen Kunden aus der Liste aus, um die KI-gestützte Kundenakte und Aktionen zu nutzen."
              icon={<UserGroupIcon />}
              className="opacity-60"
            />
          ) : (
            <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Result Area */}
              {lastResult ? (
                <div className="ak-glass p-8 rounded-3xl border border-[var(--ak-color-border-subtle)] text-left space-y-4 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[var(--ak-semantic-success)]" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-[var(--ak-semantic-success)] font-bold text-[10px] uppercase tracking-widest">
                      <span>Letztes Ergebnis</span>
                    </div>
                    <button 
                      onClick={() => setResult(null)}
                      className="text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-secondary)] transition-colors"
                    >
                      Verwerfen
                    </button>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-lg text-[var(--ak-color-text-primary)] leading-relaxed whitespace-pre-wrap">
                      {lastResult}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-12 border-2 border-dashed border-[var(--ak-color-border-subtle)] rounded-[var(--ak-radius-3xl)] opacity-30">
                  <p className="text-[var(--ak-color-text-muted)] font-medium">Bereit für KI-Aktionen</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Toggle Buttons for Drawers (when closed or small screen) */}
        {!isLeftOpen && (
          <button 
            onClick={() => setIsLeftOpen(true)}
            className="fixed left-6 bottom-6 w-12 h-12 bg-[var(--ak-color-bg-surface)] rounded-full shadow-lg border border-[var(--ak-color-border-subtle)] flex items-center justify-center text-[var(--ak-color-text-muted)] hover:text-[var(--ak-semantic-success)] transition-all z-30"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        )}
        {!isRightOpen && selectedCustomer && (
          <button 
            onClick={() => setIsRightOpen(true)}
            className="fixed right-6 bottom-6 w-12 h-12 bg-[var(--ak-color-bg-surface)] rounded-full shadow-lg border border-[var(--ak-color-border-subtle)] flex items-center justify-center text-[var(--ak-color-text-muted)] hover:text-[var(--ak-semantic-success)] transition-all z-30"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Right Drawer: KI Panel */}
      <CustomersRightDrawer
        customer={selectedCustomer}
        onApplyAction={handleApplyAction}
        activities={activities}
        isOpen={isRightOpen}
        onClose={() => setIsRightOpen(false)}
      />
    </div>
  );
}

