'use client'

import { AIDetailLayout } from '@/components/ui/AIDetailLayout'
import type { AIAction } from '@/components/ui/AIDetailLayout'
import { 
  RocketLaunchIcon, 
  ChartBarIcon, 
  AdjustmentsHorizontalIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'

// Types (Dummy)
type Campaign = {
  id: string
  name: string
  status: 'active' | 'draft' | 'paused' | 'completed'
  type: string
  audience: string
  budget: number
  conversion: number
}

type GrowthDetailsDrawerProps = {
  item: Campaign | null // Generic 'item' prop for consistency or specific type
  onClose: () => void
}

export function GrowthDetailsDrawer({ item, onClose }: GrowthDetailsDrawerProps) {
  if (!item) return null;

  // Original Content View
  const OriginalContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[var(--ak-color-text-primary)]">{item.name}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
          ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {item.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 apple-card-enhanced">
          <p className="text-xs text-[var(--ak-color-text-muted)] uppercase mb-1">Typ</p>
          <p className="font-medium">{item.type}</p>
        </div>
        <div className="p-4 apple-card-enhanced">
          <p className="text-xs text-[var(--ak-color-text-muted)] uppercase mb-1">Zielgruppe</p>
          <p className="font-medium">{item.audience}</p>
        </div>
        <div className="p-4 apple-card-enhanced">
          <p className="text-xs text-[var(--ak-color-text-muted)] uppercase mb-1">Budget</p>
          <p className="font-medium">{item.budget}€</p>
        </div>
        <div className="p-4 apple-card-enhanced">
          <p className="text-xs text-[var(--ak-color-text-muted)] uppercase mb-1">Conversion</p>
          <p className="font-medium text-green-600">{item.conversion}%</p>
        </div>
      </div>
    </div>
  );

  // AI Actions
  const aiActions: AIAction[] = [
    { 
      id: 'optimize', 
      label: 'Performance optimieren', 
      prompt: 'Wie kann die Conversion Rate verbessert werden?',
      icon: <RocketLaunchIcon className="w-4 h-4" />
    },
    { 
      id: 'variants', 
      label: 'A/B Varianten', 
      prompt: 'Erstelle 3 Varianten für Betreffzeilen/Ads.',
      icon: <DocumentDuplicateIcon className="w-4 h-4" />
    },
    { 
      id: 'audience', 
      label: 'Zielgruppe verfeinern', 
      prompt: 'Schlage engere Zielgruppen-Segmente vor.',
      icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />
    },
    { 
      id: 'report', 
      label: 'Report erstellen', 
      prompt: 'Erstelle einen Performance-Bericht.',
      icon: <ChartBarIcon className="w-4 h-4" />
    }
  ];

  const handleAction = async (action: AIAction) => {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        if (action.id === 'optimize') {
          resolve(`**Optimierungs-Vorschläge:**\n\n1. **Call-to-Action:** Der Button sollte prominenter sein ("Jetzt starten" statt "Mehr Infos").\n2. **Timing:** Sende E-Mails am Dienstag Morgen (höchste Open Rate).\n3. **Social Proof:** Füge Kundenstimmen hinzu.`);
        } else if (action.id === 'variants') {
          resolve(`**A/B Test Varianten:**\n\nA) "Steigern Sie Ihren Umsatz um 20%" (Benefit-fokussiert)\nB) "Verlieren Sie keine Leads mehr" (Loss-Aversion)\nC) "Das neue Tool für Profis" (Exklusivität)`);
        } else {
          resolve(`Analyse läuft... Ergebnis für ${action.label} wird erstellt.`);
        }
      }, 1500);
    });
  };

  return (
    <AIDetailLayout
      title="Kampagnen Details"
      subtitle="Growth & Marketing"
      onClose={onClose}
      originalContent={OriginalContent}
      summary="Diese Kampagne performt überdurchschnittlich gut (3.2% CR). Das Budget wird effizient genutzt, aber die Klickrate könnte durch bessere Visuals gesteigert werden."
      actions={aiActions}
      onActionTriggered={handleAction}
    />
  )
}
