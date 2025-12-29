'use client';

import React from 'react';
import { RecommendationResult } from '@/lib/onboarding/recommendation';
import { CheckCircle2, ArrowRight, RefreshCcw, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getOnboardingRecommendations } from '@/lib/integrations/catalog';

interface ResultScreenProps {
  result: RecommendationResult;
  onRestart: () => void;
  onComplete: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  onRestart,
  onComplete,
}) => {
  const router = useRouter();
  const recommendations = getOnboardingRecommendations().slice(0, 4);

  const handleConnect = (item: any) => {
    if (item.deepLinkTarget) {
      const params = new URLSearchParams(item.deepLinkTarget.query);
      router.push(`${item.deepLinkTarget.route}?${params.toString()}`);
    } else {
      // Fallback
      onComplete();
    }
  };

  return (
    <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto">
      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 bg-[var(--ak-color-accent)]/10 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-[var(--ak-color-accent)]" />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2">Du bist startklar!</h2>
      <p className="text-[var(--ak-color-text-secondary)] mb-8">
        Verbinde deine wichtigsten Tools, um direkt loszulegen.
      </p>

      {/* Recommendations Grid */}
      <div className="space-y-3 mb-8 text-left">
        {recommendations.map((item) => (
          <div 
            key={item.key}
            className="group p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-accent)] hover:shadow-md transition-all cursor-pointer relative"
            onClick={() => handleConnect(item)}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--ak-surface-2)] flex items-center justify-center text-xl shrink-0">
                {item.icon && item.icon.length < 3 ? item.icon : '🔌'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-[var(--ak-color-text-primary)]">{item.name}</h3>
                  {item.availability === 'beta' && (
                    <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-bold uppercase">Beta</span>
                  )}
                  {item.availability === 'coming_soon' && (
                    <span className="px-1.5 py-0.5 rounded-md bg-[var(--ak-surface-3)] text-[var(--ak-text-secondary)] text-[10px] font-bold uppercase">Bald</span>
                  )}
                </div>
                <p className="text-sm text-[var(--ak-color-text-secondary)] line-clamp-1">
                  {item.description}
                </p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-[var(--ak-color-text-muted)] group-hover:text-[var(--ak-color-accent)] transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {result.track === 'custom' && (
        <div className="mb-8 p-3 bg-[var(--ak-semantic-warning-soft)] border border-[var(--ak-semantic-warning-soft)] rounded-xl flex gap-3 text-left">
          <ShieldAlert className="h-5 w-5 text-[var(--ak-semantic-warning)] flex-shrink-0" />
          <p className="text-xs text-[var(--ak-color-text-primary)]">
            Da du mit sensiblen Inhalten arbeitest, empfehlen wir dir die Einrichtung spezifischer Freigabe-Regeln in den Sicherheitseinstellungen.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={onComplete}
          className="w-full h-12 rounded-xl bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] hover:opacity-90 transition-colors flex items-center justify-center gap-2"
        >
          Später verbinden
          <ArrowRight className="h-4 w-4" />
        </button>
        
        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-2 text-sm text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] transition-colors py-2"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Nochmal starten
        </button>
      </div>
    </div>
  );
};
