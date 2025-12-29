'use client';

import { AutomationInsightsPanel } from '@/components/automation';

export default function AutomationsPage() {
  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[var(--ak-color-text-primary)] tracking-tight mb-2">
            KI-Vorschläge & Automatisierung
          </h1>
          <p className="text-[var(--ak-color-text-secondary)]">
            Entdecke intelligente Automatisierungsvorschläge basierend auf deinen Arbeitsmustern.
          </p>
        </div>
        
        <AutomationInsightsPanel />
      </div>
    </div>
  );
}

