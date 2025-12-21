'use client';

import React from 'react';
import { RecommendationResult } from '@/lib/onboarding/recommendation';
import { CheckCircle2, ArrowRight, RefreshCcw, ShieldAlert } from 'lucide-react';

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
  return (
    <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 bg-[var(--apple-green)]/10 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-[var(--apple-green)]" />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2">{result.title}</h2>
      <p className="text-[var(--apple-text-secondary)] mb-8">
        Basierend auf deinen Antworten empfehlen wir dir den Start mit:
      </p>

      <div className="apple-glass-enhanced rounded-2xl p-6 mb-8 text-left border border-[var(--apple-green)]/20">
        <h3 className="text-lg font-semibold text-[var(--apple-green)] mb-1">
          {result.recommendedApplication}
        </h3>
        <p className="text-sm text-[var(--apple-text-secondary)] mb-4">
          Diese Anwendung hilft dir am schnellsten dabei, deine Ziele zu erreichen.
        </p>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider">
            Nächste Schritte
          </p>
          {result.nextSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-5 w-5 bg-[var(--apple-green)]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-[var(--apple-green)]">{i + 1}</span>
              </div>
              <span className="text-sm">{step}</span>
            </div>
          ))}
        </div>

        {result.track === 'custom' && (
          <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Da du mit sehr sensiblen Inhalten arbeitest, empfehlen wir dir die Einrichtung spezifischer Freigabe-Regeln in den Sicherheitseinstellungen.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onComplete}
          className="w-full h-12 apple-button-primary flex items-center justify-center gap-2"
        >
          Zum Dashboard
          <ArrowRight className="h-4 w-4" />
        </button>
        
        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-2 text-sm text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] transition-colors py-2"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Nochmal starten
        </button>
      </div>
    </div>
  );
};

