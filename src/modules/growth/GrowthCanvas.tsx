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
          <h1 className="text-2xl font-bold text-gray-900 capitalize">{mode === 'seo' ? 'SEO' : mode}</h1>
          <p className="text-sm text-gray-500">
            Optimiere dein Wachstum im Bereich {mode}.
          </p>
        </div>

        {/* Campaign Type Selector for Campaigns Mode */}
        {mode === 'campaigns' && (
          <div className="apple-glass-enhanced p-4 rounded-2xl border border-gray-100 flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Kampagnen-Typ</span>
            <div className="flex p-1 bg-gray-100/50 rounded-xl border border-gray-100 shrink-0">
              {(['social', 'newsletter', 'launch'] as CampaignType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => onCampaignTypeChange(type)}
                  className={clsx(
                    "px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                    campaignType === type 
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
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
        <div className="apple-glass-enhanced p-8 rounded-3xl border border-gray-100/50 bg-white/40 min-h-[200px] flex flex-col items-center justify-center text-center space-y-4">
           {result ? (
             <div className="w-full text-left space-y-4 animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-green-600 font-bold text-[10px] uppercase tracking-widest">
                  <span>Ergebnis</span>
                </div>
                <div className="p-4 bg-white/80 rounded-2xl border border-green-500/10 shadow-sm whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {result}
                </div>
             </div>
           ) : (
             <>
               <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 opacity-50">
                 <div className="w-6 h-6 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
               </div>
               <p className="text-sm font-medium text-gray-400">Bereit für Analysen & Aktionen</p>
             </>
           )}
        </div>

        {/* Briefing Textarea (Stub) */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2">Briefing / Notizen (Optional)</label>
          <textarea 
            placeholder="Beschreibe kurz dein Ziel oder füge Kontext hinzu..."
            className="w-full p-4 bg-white/40 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all min-h-[100px] resize-none"
          />
        </div>
      </div>
    </div>
  );
};

