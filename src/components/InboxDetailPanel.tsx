'use client'

import type { InboxItem } from '@/components/InboxDrawerWidget'
import { AIDetailLayout } from '@/components/ui/AIDetailLayout'
import type { AIAction } from '@/components/ui/AIDetailLayout'
import { 
  PaperAirplaneIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  PencilIcon,
  TagIcon
} from '@heroicons/react/24/outline'

type InboxDetailPanelProps = {
  item: InboxItem | null
  onClose?: () => void
}

export function InboxDetailPanel({ item, onClose }: InboxDetailPanelProps) {
  if (!item) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--ak-color-bg-app)]">
        <div className="max-w-xs text-center p-8 apple-glass-enhanced rounded-2xl">
          <p className="font-semibold text-[var(--ak-color-text-primary)]">Kein Element ausgewählt</p>
          <p className="text-sm mt-2 text-[var(--ak-color-text-secondary)]">
            Wähle links eine Nachricht aus, um Details und AI-Aktionen zu sehen.
          </p>
        </div>
      </div>
    )
  }

  // Definiere die Original-Content View
  const OriginalContent = (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] uppercase tracking-wide">
          {item.channel}
        </span>
        <span className="text-xs text-[var(--ak-color-text-muted)]">{item.time}</span>
      </div>
      
      <p className="text-[var(--ak-color-text-secondary)] leading-relaxed">
        {item.snippet}
        {/* Placeholder für längeren Text, da 'snippet' oft kurz ist */}
        <br/><br/>
        Hier würde der vollständige Text der Nachricht stehen. Dies ist ein Platzhaltertext, um das Layout zu demonstrieren. Der Benutzer fragt wahrscheinlich nach einem Termin oder hat ein Problem mit einer Bestellung.
      </p>

      <div className="flex items-center gap-4 pt-4 border-t border-[var(--ak-color-border-subtle)] text-sm text-[var(--ak-color-text-secondary)]">
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--ak-color-text-muted)]">Status:</span>
          <span className="font-medium">{item.status || 'Offen'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--ak-color-text-muted)]">Thread:</span>
          <span className="font-mono text-xs">{item.threadId}</span>
        </div>
      </div>
    </div>
  );

  // Definiere AI Actions
  const aiActions = [
    { 
      id: 'reply-friendly', 
      label: 'Freundliche Antwort', 
      prompt: 'Schreibe eine freundliche Antwort auf diese Nachricht.',
      icon: <PaperAirplaneIcon className="w-4 h-4" />
    },
    { 
      id: 'reply-professional', 
      label: 'Formelle Antwort', 
      prompt: 'Verfasse eine professionelle Antwort.',
      icon: <PencilIcon className="w-4 h-4" />
    },
    { 
      id: 'create-task', 
      label: 'Aufgabe erstellen', 
      prompt: 'Erstelle eine Aufgabe basierend auf dieser Nachricht.',
      icon: <CheckCircleIcon className="w-4 h-4" />
    },
    { 
      id: 'schedule', 
      label: 'Termin finden', 
      prompt: 'Schlage 3 Termine vor.',
      icon: <CalendarIcon className="w-4 h-4" />
    },
    { 
      id: 'summarize', 
      label: 'Zusammenfassen', 
      prompt: 'Fasse die wichtigsten Punkte zusammen.',
      icon: <TagIcon className="w-4 h-4" />
    }
  ];

  // Simuliere AI Generierung
  const handleAction = async (action: AIAction) => {
    // Hier würde der echte API Call stehen
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        if (action.id === 'reply-friendly') {
          resolve(`Hallo,\n\nvielen Dank für Ihre Nachricht! Das klingt sehr interessant.\n\nGerne können wir uns dazu austauschen. Haben Sie nächste Woche Zeit?\n\nViele Grüße,\n[Ihr Name]`);
        } else if (action.id === 'create-task') {
          resolve(`Aufgabe erstellt:\n- Titel: Anfrage bearbeiten\n- Priorität: Hoch\n- Fällig: Morgen`);
        } else {
          resolve(`Hier ist der generierte Output für "${action.label}".\n\nDieser Text wurde von der AI generiert und kann hier direkt bearbeitet oder übernommen werden.`);
        }
      }, 1500); // Künstliche Verzögerung
    });
  };

  return (
    <AIDetailLayout
      title={item.title}
      subtitle={item.channel === 'email' ? 'E-Mail Konversation' : 'Nachricht'}
      onClose={onClose || (() => {})}
      originalContent={OriginalContent}
      summary="Diese Nachricht bittet um eine Terminverschiebung für das Projekt-Meeting am Dienstag. Der Kunde wirkt etwas gestresst, aber höflich."
      actions={aiActions}
      onActionTriggered={handleAction}
    />
  )
}
