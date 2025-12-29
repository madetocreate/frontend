'use client';

import React, { useState } from 'react';
import { GrowthLeftDrawer } from './GrowthLeftDrawer';
import { GrowthRightDrawer } from './GrowthRightDrawer';
import { GrowthCanvas } from './GrowthCanvas';
import { GrowthMode, CampaignType } from './types';
import { GROWTH_ACTIONS } from './actions';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { applyAction } from '@/lib/actions/apply';
import type { ActionRunResult } from '@/lib/actions/types';

export function GrowthShell() {
  const [activeMode, setActiveMode] = useState<GrowthMode>('campaigns');
  const [campaignType, setCampaignType] = useState<CampaignType>('newsletter');
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [activities, setActivities] = useState<{ id: string, label: string, time: string }[]>([]);
  const [lastResult, setLastResult] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_lastUndoId, setLastUndoId] = useState<string | null>(null);

  const handleApplyAction = (result: ActionRunResult) => {
    const target = {
      module: 'growth' as const,
      targetId: `${activeMode}-${campaignType}`,
      setResult: (text: string) => setLastResult(text),
      addActivity: (entry: { id: string; label: string; time: string }) => setActivities((prev) => [entry, ...prev]),
      labelLookup: (id: string) => GROWTH_ACTIONS[id as keyof typeof GROWTH_ACTIONS]?.label || result.action.label,
      currentResult: lastResult,
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _applied = applyAction(result, target)
    setLastUndoId(null) // undoId not available in ApplyResult
  }

  return (
    <div className="flex h-full overflow-hidden bg-[var(--ak-color-bg-app)] relative">
      <GrowthLeftDrawer
        activeMode={activeMode}
        onModeChange={(m) => { setActiveMode(m); setLastResult(null); setLastUndoId(null); }}
        isOpen={isLeftOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <GrowthCanvas 
          mode={activeMode} 
          campaignType={campaignType}
          onCampaignTypeChange={(t) => { setCampaignType(t); setLastResult(null); setLastUndoId(null); }}
          result={lastResult}
        />
        {_lastUndoId && (
          <div className="absolute bottom-4 left-4 z-10">
            <button
              onClick={() => {
                // undoById(_lastUndoId)
                setLastUndoId(null)
              }}
              className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] shadow-sm hover:bg-[var(--ak-color-bg-hover)]"
            >
              Rückgängig
            </button>
          </div>
        )}

        {!isLeftOpen && (
          <button 
            onClick={() => setIsLeftOpen(true)} 
            className="fixed left-6 bottom-6 w-12 h-12 bg-[var(--ak-color-bg-surface)] rounded-full shadow-lg border border-[var(--ak-color-border-subtle)] flex items-center justify-center text-[var(--ak-color-text-muted)] hover:text-[var(--ak-semantic-success)] transition-all z-30"
            aria-label="Sidebar öffnen"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        )}
        {!isRightOpen && (
          <button 
            onClick={() => setIsRightOpen(true)} 
            className="fixed right-6 bottom-6 w-12 h-12 bg-[var(--ak-color-bg-surface)] rounded-full shadow-lg border border-[var(--ak-color-border-subtle)] flex items-center justify-center text-[var(--ak-color-text-muted)] hover:text-[var(--ak-semantic-success)] transition-all z-30"
            aria-label="Details öffnen"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      <GrowthRightDrawer
        mode={activeMode}
        campaignType={campaignType}
        onApplyAction={handleApplyAction}
        activities={activities}
        isOpen={isRightOpen}
        onClose={() => setIsRightOpen(false)}
      />
    </div>
  );
}

