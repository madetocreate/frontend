'use client'

import { AIDetailLayout } from '@/components/ui/AIDetailLayout'
import type { AIAction } from '@/components/ui/AIDetailLayout'
import { 
  DocumentTextIcon, 
  LanguageIcon, 
  ListBulletIcon,
  TagIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

// Types (Dummy)
type Document = {
  id: string
  title: string
  type: string
  size: string
  uploadedAt: string
  tags: string[]
  contentPreview: string
}

type DocumentDetailsDrawerProps = {
  document: Document | null
  onClose: () => void
}

export function DocumentDetailsDrawer({ document, onClose }: DocumentDetailsDrawerProps) {
  if (!document) return null;

  // Original Content View
  const OriginalContent = (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--ak-color-bg-surface-muted)]/50 border border-[var(--ak-color-border-subtle)]">
        <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
          <span className="font-bold text-xs uppercase">{document.type}</span>
        </div>
        <div>
          <h3 className="font-bold text-[var(--ak-color-text-primary)]">{document.title}</h3>
          <p className="text-sm text-[var(--ak-color-text-secondary)]">{document.size} • {document.uploadedAt}</p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none text-[var(--ak-color-text-secondary)] bg-[var(--ak-color-bg-surface)] p-6 rounded-xl border border-[var(--ak-color-border-subtle)] font-mono text-xs leading-relaxed">
        {document.contentPreview}
        <br/>... (weiterer Inhalt)
      </div>

      <div className="flex gap-2">
        {document.tags.map(tag => (
          <span key={tag} className="px-2 py-1 text-xs rounded-md bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-muted)]">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );

  // AI Actions
  const aiActions: AIAction[] = [
    { 
      id: 'summarize', 
      label: 'Zusammenfassen', 
      prompt: 'Fasse das Dokument in 3 Punkten zusammen.',
      icon: <ListBulletIcon className="w-4 h-4" />
    },
    { 
      id: 'extract', 
      label: 'Daten extrahieren', 
      prompt: 'Extrahiere Namen, Daten und Beträge.',
      icon: <DocumentTextIcon className="w-4 h-4" />
    },
    { 
      id: 'translate', 
      label: 'Übersetzen', 
      prompt: 'Übersetze ins Englische.',
      icon: <LanguageIcon className="w-4 h-4" />
    },
    { 
      id: 'classify', 
      label: 'Klassifizieren', 
      prompt: 'Schlage Tags und Kategorien vor.',
      icon: <TagIcon className="w-4 h-4" />
    },
    {
      id: 'audit',
      label: 'Compliance Check',
      prompt: 'Prüfe auf DSGVO Probleme.',
      icon: <ShieldCheckIcon className="w-4 h-4" />
    }
  ];

  const handleAction = async (action: AIAction) => {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        if (action.id === 'summarize') {
          resolve(`**Zusammenfassung:**\n\n1. Es handelt sich um einen Dienstleistungsvertrag.\n2. Laufzeit: 12 Monate, Kündigungsfrist 3 Monate.\n3. Monatliche Pauschale: 1.200€ zzgl. MwSt.`);
        } else if (action.id === 'extract') {
          resolve(`**Extrahierte Daten:**\n\n- **Partner:** Acme Corp GmbH\n- **Datum:** 15.11.2023\n- **Betrag:** 14.400€ (Jahreswert)\n- **IBAN:** DE89 ...`);
        } else {
          resolve(`AI Task "${action.label}" wurde ausgeführt.`);
        }
      }, 1500);
    });
  };

  return (
    <AIDetailLayout
      title="Dokumenten Analyse"
      subtitle="Intelligent Document Processing"
      onClose={onClose}
      originalContent={OriginalContent}
      summary="Dies scheint ein Standard-Vertrag zu sein. Die Unterschrift fehlt noch. Enthält sensible Finanzdaten."
      actions={aiActions}
      onActionTriggered={handleAction}
    />
  )
}
