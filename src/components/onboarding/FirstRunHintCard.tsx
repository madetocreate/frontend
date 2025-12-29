'use client';

import { useState, useEffect } from 'react';
import { WidgetCard } from '@/components/ui/WidgetCard';
import { AkButton } from '@/components/ui/AkButton';
import { X } from 'lucide-react';

const STORAGE_KEY = 'aklow:firstRunHint:dismissed';

export function FirstRunHintCard() {
  const [isDismissed, setIsDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    setIsDismissed(dismissed === '1');
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setIsDismissed(true);
  };

  if (isDismissed === null || isDismissed) {
    return null;
  }

  return (
    <WidgetCard
      title="Schneller Start"
      status="info"
      className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500"
      padding="none"
      actions={
        <button 
          onClick={handleDismiss}
          className="p-1 rounded-md hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-muted)] transition-colors"
          aria-label="Schließen"
        >
          <X className="w-4 h-4" />
        </button>
      }
    >
      <div className="p-4 sm:p-5">
        <ul className="space-y-2 text-sm text-[var(--ak-color-text-secondary)]">
          <li className="flex gap-2">
            <span className="text-[var(--ak-color-accent)] font-bold shrink-0">•</span>
            <span>Links findest du deine Module <span className="hidden sm:inline">(Posteingang, Kunden, Dokumente …)</span>.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--ak-color-accent)] font-bold shrink-0">•</span>
            <span>Klick das aktive Icon nochmal, um die Seitenleiste zu öffnen.</span>
          </li>
          <li className="hidden sm:flex gap-2">
            <span className="text-[var(--ak-color-accent)] font-bold shrink-0">•</span>
            <span>Workflows startest du im Chat über den Composer.</span>
          </li>
        </ul>
        
        <div className="pt-3 flex justify-end">
          <AkButton 
            size="sm" 
            variant="ghost" 
            accent="graphite"
            onClick={handleDismiss}
            className="h-8 py-0 px-3 text-xs"
          >
            Verstanden
          </AkButton>
        </div>
      </div>
    </WidgetCard>
  );
}

