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
  item: Campaign | null
  onClose: () => void
}

export function GrowthDetailsDrawer({ item, onClose }: GrowthDetailsDrawerProps) {
  if (!item) return null;

  // Original Content View - Verbessertes Design mit Progress Bars
  const OriginalContent = (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-[var(--ak-color-text-primary)] tracking-tight">{item.name}</h3>
          <p className="text-[var(--ak-color-text-secondary)] text-sm">{item.type} • {item.audience}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
          ${item.status === 'active' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}>
          {item.status}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 apple-card-enhanced rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] shadow-sm">
          <p className="text-xs font-semibold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Budget</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-[var(--ak-color-text-primary)]">{item.budget}€</p>
            <p className="text-xs text-green-600 font-medium mb-1">+12%</p>
          </div>
          <div className="w-full bg-[var(--ak-color-bg-surface-muted)] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[var(--ak-color-accent)] h-1.5 rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>
        
        <div className="p-5 apple-card-enhanced rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] shadow-sm">
          <p className="text-xs font-semibold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Conversion</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-[var(--ak-color-text-primary)]">{item.conversion}%</p>
            <p className="text-xs text-green-600 font-medium mb-1">+0.5%</p>
          </div>
          <div className="w-full bg-[var(--ak-color-bg-surface-muted)] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(item.conversion * 10, 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Campaign Details List */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-[var(--ak-color-text-primary)] uppercase tracking-wider">Metriken</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 rounded-lg hover:bg-[var(--ak-color-bg-hover)] transition-colors">
            <span className="text-[var(--ak-color-text-secondary)] text-sm">Impressions</span>
            <span className="font-mono text-sm font-medium">12,450</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg hover:bg-[var(--ak-color-bg-hover)] transition-colors">
            <span className="text-[var(--ak-color-text-secondary)] text-sm">Clicks</span>
            <span className="font-mono text-sm font-medium">843</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg hover:bg-[var(--ak-color-bg-hover)] transition-colors">
            <span className="text-[var(--ak-color-text-secondary)] text-sm">CPC</span>
            <span className="font-mono text-sm font-medium">0.45€</span>
          </div>
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
