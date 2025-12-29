'use client'

import { AIDetailLayout } from '@/components/ui/AIDetailLayout'
import type { AIAction } from '@/components/ui/AIDetailLayout'
import { 
  LightBulbIcon, 
  LinkIcon, 
  PencilIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

// Types (lokal oder importieren, falls vorhanden)
type MemoryItem = {
  id: string
  content: string
  type: 'fact' | 'preference' | 'history'
  timestamp: string
  source?: string
  confidence?: number
}

type MemoryDetailPanelProps = {
  item: MemoryItem | null
  onClose?: () => void
}

export function MemoryDetailPanel({ item, onClose }: MemoryDetailPanelProps) {
  if (!item) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--ak-color-bg-app)]">
        <div className="max-w-xs text-center p-8 ak-bg-glass rounded-2xl">
          <p className="font-semibold text-[var(--ak-color-text-primary)]">Keine Erinnerung ausgewählt</p>
          <p className="text-sm mt-2 text-[var(--ak-color-text-secondary)]">
            Wähle einen Eintrag aus dem Memory-Stream, um Details und Verknüpfungen zu sehen.
          </p>
        </div>
      </div>
    )
  }

  // Original Content View
  const OriginalContent = (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide
          ${item.type === 'fact' ? 'bg-[var(--ak-accent-inbox-soft)] text-[var(--ak-accent-inbox)]' : 
            item.type === 'preference' ? 'bg-[var(--ak-accent-documents-soft)] text-[var(--ak-accent-documents)]' : 
            'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)]'}`}>
          {item.type}
        </span>
        <span className="text-xs text-[var(--ak-color-text-muted)]">{item.timestamp}</span>
      </div>
      
      <p className="text-[var(--ak-color-text-primary)] text-lg leading-relaxed font-medium">
        &ldquo;{item.content}&rdquo;
      </p>

      {item.source && (
        <div className="flex items-center gap-2 pt-4 border-t border-[var(--ak-color-border-subtle)] text-sm text-[var(--ak-color-text-secondary)]">
          <span className="text-[var(--ak-color-text-muted)]">Quelle:</span>
          <span>{item.source}</span>
        </div>
      )}
    </div>
  );

  // AI Actions
  const aiActions: AIAction[] = [
    { 
      id: 'expand', 
      label: 'Kontext erweitern', 
      prompt: 'Finde mehr Kontext zu diesem Fakt.',
      icon: <MagnifyingGlassIcon className="w-4 h-4" />
    },
    { 
      id: 'connect', 
      label: 'Verknüpfungen suchen', 
      prompt: 'Mit welchen anderen Erinnerungen hängt das zusammen?',
      icon: <LinkIcon className="w-4 h-4" />
    },
    { 
      id: 'refine', 
      label: 'Präzisieren', 
      prompt: 'Formuliere diesen Fakt präziser.',
      icon: <PencilIcon className="w-4 h-4" />
    },
    { 
      id: 'deduplicate', 
      label: 'Duplikate prüfen', 
      prompt: 'Gibt es ähnliche Einträge?',
      icon: <LightBulbIcon className="w-4 h-4" />
    }
  ];

  const handleAction = async (action: AIAction) => {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        if (action.id === 'connect') {
          resolve(`Gefundene Verknüpfungen:\n\n1. "Kunde bevorzugt veganes Essen" (aus Meeting am 12.10.)\n2. "Hat Allergie gegen Nüsse" (aus E-Mail vom 05.11.)\n\n-> Empfehlung: Im CRM Profil unter "Diät" zusammenfassen.`);
        } else if (action.id === 'expand') {
          resolve(`Kontext-Analyse:\nDieser Fakt wurde während des Onboarding-Calls extrahiert. Er bezieht sich auf die langfristige Strategie des Kunden.`);
        } else {
          resolve(`AI Analyse für "${action.label}" abgeschlossen.\n\nErgebnis:\nDer Eintrag scheint valide und aktuell zu sein.`);
        }
      }, 1200);
    });
  };

  return (
    <AIDetailLayout
      title="Memory Detail"
      subtitle={`ID: ${item.id}`}
      onClose={onClose || (() => {})}
      originalContent={OriginalContent}
      summary="Dieser Fakt ist hochrelevant für zukünftige Marketing-Kampagnen. Er wurde automatisch aus einer E-Mail-Konversation extrahiert."
      actions={aiActions}
      onActionTriggered={handleAction}
    />
  )
}
