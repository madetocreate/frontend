'use client'

import { AIDetailLayout } from '@/components/ui/AIDetailLayout'
import type { AIAction } from '@/components/ui/AIDetailLayout'
import { 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'

// Types (Dummy)
type Customer = {
  id: string
  name: string
  company: string
  email: string
  phone: string
  status: 'active' | 'lead' | 'churned'
  tags: string[]
  lastContact: string
  ltv: number
}

type CustomerDetailsDrawerProps = {
  customer: Customer | null
  onClose: () => void
}

export function CustomerDetailsDrawer({ customer, onClose }: CustomerDetailsDrawerProps) {
  if (!customer) return null;

  // Original Content View
  const OriginalContent = (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {customer.name.charAt(0)}
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--ak-color-text-primary)]">{customer.name}</h3>
          <p className="text-[var(--ak-color-text-secondary)]">{customer.company}</p>
          <div className="flex gap-2 mt-2">
            {customer.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] text-xs rounded-full border border-[var(--ak-color-border-subtle)]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[var(--ak-color-bg-surface-muted)]/50 border border-[var(--ak-color-border-subtle)]">
          <p className="text-xs text-[var(--ak-color-text-muted)] uppercase">Status</p>
          <p className="text-lg font-semibold text-[var(--ak-color-text-primary)] mt-1 capitalize">{customer.status}</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--ak-color-bg-surface-muted)]/50 border border-[var(--ak-color-border-subtle)]">
          <p className="text-xs text-[var(--ak-color-text-muted)] uppercase">LTV</p>
          <p className="text-lg font-semibold text-[var(--ak-color-text-primary)] mt-1">
            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(customer.ltv)}
          </p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <DocumentTextIcon className="w-4 h-4" />
          </div>
          <span className="text-[var(--ak-color-text-primary)]">{customer.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
            <PhoneIcon className="w-4 h-4" />
          </div>
          <span className="text-[var(--ak-color-text-primary)]">{customer.phone}</span>
        </div>
      </div>
    </div>
  );

  // AI Actions
  const aiActions: AIAction[] = [
    { 
      id: 'draft-mail', 
      label: 'E-Mail schreiben', 
      prompt: 'Entwerfe eine E-Mail an diesen Kunden.',
      icon: <DocumentTextIcon className="w-4 h-4" />
    },
    { 
      id: 'prep-call', 
      label: 'Call vorbereiten', 
      prompt: 'Erstelle ein Skript für den nächsten Anruf.',
      icon: <PhoneIcon className="w-4 h-4" />
    },
    { 
      id: 'analyze', 
      label: 'Potenzial analysieren', 
      prompt: 'Analysiere das Upselling-Potenzial.',
      icon: <CurrencyDollarIcon className="w-4 h-4" />
    },
    { 
      id: 'history', 
      label: 'Historie zusammenfassen', 
      prompt: 'Fasse die letzten Interaktionen zusammen.',
      icon: <ChatBubbleLeftRightIcon className="w-4 h-4" />
    }
  ];

  const handleAction = async (action: AIAction) => {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        if (action.id === 'draft-mail') {
          resolve(`Betreff: Status Update & Next Steps\n\nHallo ${customer.name},\n\nich wollte mich kurz erkundigen, wie zufrieden Sie mit der aktuellen Lösung sind.\n\nHätten Sie nächste Woche Zeit für ein kurzes Feedback-Gespräch?\n\nBeste Grüße`);
        } else if (action.id === 'analyze') {
          resolve(`**Upselling Potenzial: Hoch**\n\nDer Kunde nutzt aktuell Plan Basic, hat aber >20 User. Ein Upgrade auf Pro würde Sinn machen.\n\nEmpfehlung: Features "Advanced Reporting" pitchen.`);
        } else {
          resolve(`AI Output für "${action.label}" wird generiert...`);
        }
      }, 1500);
    });
  };

  return (
    <AIDetailLayout
      title="Kundenprofil"
      subtitle="CRM Übersicht"
      onClose={onClose}
      originalContent={OriginalContent}
      summary={`Langjähriger Kunde (Active) mit hohem LTV. Letzter Kontakt vor ${customer.lastContact}. Zeigt Interesse an neuen Features.`}
      actions={aiActions}
      onActionTriggered={handleAction}
    />
  )
}
