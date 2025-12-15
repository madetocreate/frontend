'use client'

import { AIDetailLayout } from '@/components/ui/AIDetailLayout'
import type { AIAction } from '@/components/ui/AIDetailLayout'
import { 
  DocumentTextIcon, 
  LanguageIcon, 
  ListBulletIcon,
  TagIcon,
  ShieldCheckIcon,
  CloudArrowDownIcon,
  ShareIcon
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
  author?: string
  status?: 'processed' | 'pending' | 'error'
}

type DocumentDetailsDrawerProps = {
  document: Document | null
  onClose: () => void
}

export function DocumentDetailsDrawer({ document, onClose }: DocumentDetailsDrawerProps) {
  if (!document) return null;

  // Original Content View - Completely Restyled
  const OriginalContent = (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center p-8 bg-[var(--ak-color-bg-surface-muted)]/30 rounded-[var(--ak-radius-xl)] border border-[var(--ak-color-border-subtle)] border-dashed">
        <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 border border-[var(--ak-color-border-subtle)]">
          <span className="text-2xl font-bold text-[var(--ak-color-accent)] uppercase tracking-tight">{document.type}</span>
        </div>
        <h3 className="text-xl font-bold text-center text-[var(--ak-color-text-primary)] px-4 leading-tight">{document.title}</h3>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-secondary)] shadow-sm">
            {document.size}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-secondary)] shadow-sm">
            {document.uploadedAt}
          </span>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        <div>
          <p className="text-xs font-semibold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-1.5">Status</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-[var(--ak-color-text-primary)]">Processed</span>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-1.5">Autor</p>
          <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">{document.author || 'System'}</p>
        </div>
        
        {/* Tags */}
        <div className="col-span-2">
          <p className="text-xs font-semibold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {document.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer">
                <TagIcon className="w-3 h-3" />
                {tag}
              </span>
            ))}
            <button className="px-2.5 py-1 text-xs font-medium rounded-md border border-dashed border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-secondary)] hover:border-[var(--ak-color-accent)] hover:text-[var(--ak-color-accent)] transition-colors">
              + Tag
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-[var(--ak-color-text-primary)] uppercase tracking-wider">Vorschau</h4>
          <div className="flex gap-2">
            <button className="p-1.5 text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] rounded-md transition-colors" title="Download">
              <CloudArrowDownIcon className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] rounded-md transition-colors" title="Teilen">
              <ShareIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--ak-color-bg-surface)] opacity-80 pointer-events-none rounded-[var(--ak-radius-lg)]"></div>
          <div className="bg-[var(--ak-color-bg-surface-muted)]/30 p-5 rounded-[var(--ak-radius-lg)] border border-[var(--ak-color-border-subtle)] font-mono text-xs leading-relaxed text-[var(--ak-color-text-secondary)] overflow-hidden max-h-[200px]">
            {document.contentPreview}
            <br/>...
            <div className="mt-4 opacity-50">
              [Seite 2]
              <br/>
              §4. Haftung und Gewährleistung
              <br/>
              4.1 Die Parteien vereinbaren...
            </div>
          </div>
          <button className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-[var(--ak-color-bg-surface)] shadow-[var(--ak-shadow-md)] rounded-full text-xs font-medium border border-[var(--ak-color-border-subtle)] hover:scale-105 transition-transform z-10">
            Vollständig anzeigen
          </button>
        </div>
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
