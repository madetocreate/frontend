'use client';

import React from 'react';
import { GrowthMode, CampaignType } from './types';
import clsx from 'clsx';

interface GrowthCanvasProps {
  mode: GrowthMode;
  campaignType: CampaignType;
  onCampaignTypeChange: (type: CampaignType) => void;
  result: string | null;
}

export const GrowthCanvas: React.FC<GrowthCanvasProps> = ({
  mode,
  campaignType,
  onCampaignTypeChange,
  result
}) => {
  return (
    <div className="flex-1 flex flex-col items-center p-8 space-y-8 animate-in fade-in duration-500">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[var(--ak-color-text-primary)] capitalize">{mode === 'seo' ? 'SEO' : mode}</h1>
          <p className="text-sm text-[var(--ak-color-text-secondary)]">
            Optimiere dein Wachstum im Bereich {mode}.
          </p>
        </div>

        {/* Campaign Type Selector for Campaigns Mode */}
        {mode === 'campaigns' && (
          <div className="ak-bg-glass p-4 rounded-2xl border border-[var(--ak-color-border-fine)] flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-[var(--ak-color-text-muted)] uppercase tracking-widest px-2">Kampagnen-Typ</span>
            <div className="flex p-1 bg-[var(--ak-color-bg-surface-muted)] rounded-xl border border-[var(--ak-color-border-fine)] shrink-0">
              {(['social', 'newsletter', 'launch'] as CampaignType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => onCampaignTypeChange(type)}
                  className={clsx(
                    "px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                    campaignType === type 
                      ? "bg-[var(--ak-color-bg-surface)] text-[var(--ak-semantic-success)] shadow-sm"
                      : "text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-secondary)]"
                  )}
                >
                  {type === 'social' && 'Social'}
                  {type === 'newsletter' && 'Newsletter'}
                  {type === 'launch' && 'Launch/Promo'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Work Area (Stub) */}
        <div className="ak-bg-glass p-8 rounded-3xl border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] min-h-[200px] flex flex-col items-center justify-center text-center space-y-4">
           {result ? (
             <div className="w-full text-left space-y-4 animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-[var(--ak-semantic-success)] font-bold text-[10px] uppercase tracking-widest">
                  <span>Ergebnis</span>
                </div>
                <div className="p-4 bg-[var(--ak-color-bg-surface)] rounded-2xl border border-[var(--ak-semantic-success-soft)] shadow-sm whitespace-pre-wrap text-sm text-[var(--ak-color-text-primary)] leading-relaxed">
                  {result}
                </div>
             </div>
           ) : (
             <>
               <div className="w-12 h-12 rounded-2xl bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center border border-[var(--ak-color-border-fine)] opacity-50">
                 <div className="w-6 h-6 border-2 border-[var(--ak-color-border-subtle)] border-t-[var(--ak-semantic-success)] rounded-full animate-spin" style={{ animationDuration: '3s' }} />
               </div>
               <p className="text-sm font-medium text-[var(--ak-color-text-muted)]">Bereit für Analysen & Aktionen</p>
             </>
           )}
        </div>

        {/* Briefing Textarea (Stub) */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)] px-2">Briefing / Notizen (Optional)</label>
          <textarea 
            placeholder="Beschreibe kurz dein Ziel oder füge Kontext hinzu..."
            className="w-full p-4 bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-fine)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ak-semantic-success-soft)] transition-all min-h-[100px] resize-none"
          />
        </div>
      </div>
    </div>
  );
};

