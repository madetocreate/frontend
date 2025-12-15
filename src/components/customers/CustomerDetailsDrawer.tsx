'use client'

import { AIDetailLayout } from '@/components/ui/AIDetailLayout'
import type { AIAction } from '@/components/ui/AIDetailLayout'
import { 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon,
  PhoneIcon,
  BriefcaseIcon,
  ClockIcon
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

  // Original Content View - Enhanced Design
  const OriginalContent = (
    <div className="space-y-8">
      {/* Profile Header Card */}
      <div className="flex flex-col items-center p-6 bg-gradient-to-b from-[var(--ak-color-bg-surface-muted)]/50 to-[var(--ak-color-bg-surface)] rounded-[var(--ak-radius-xl)] border border-[var(--ak-color-border-subtle)] shadow-sm">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4 ring-4 ring-white dark:ring-[#1e1e1e]">
          {customer.name.charAt(0)}
        </div>
        <h3 className="text-2xl font-bold text-[var(--ak-color-text-primary)] text-center tracking-tight">{customer.name}</h3>
        <p className="text-[var(--ak-color-text-secondary)] font-medium text-center flex items-center gap-1.5 mt-1">
          <BriefcaseIcon className="w-4 h-4" />
          {customer.company}
        </p>
        
        <div className="flex gap-2 mt-4 flex-wrap justify-center">
          {customer.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-secondary)] text-xs font-medium rounded-full border border-[var(--ak-color-border-subtle)] shadow-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 apple-card-enhanced rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]">
          <p className="text-xs font-semibold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Status</p>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              customer.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
              customer.status === 'lead' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' :
              'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
            }`}></span>
            <p className="text-lg font-bold text-[var(--ak-color-text-primary)] capitalize">{customer.status}</p>
          </div>
        </div>
        
        <div className="p-5 apple-card-enhanced rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)]">
          <p className="text-xs font-semibold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">Customer LTV</p>
          <p className="text-lg font-bold text-[var(--ak-color-text-primary)]">
            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(customer.ltv)}
          </p>
        </div>
      </div>

      {/* Contact Info List */}
      <div className="space-y-1 bg-[var(--ak-color-bg-surface-muted)]/30 rounded-[var(--ak-radius-xl)] p-2 border border-[var(--ak-color-border-subtle)]">
        <div className="flex items-center gap-3 p-3 hover:bg-[var(--ak-color-bg-hover)] rounded-[var(--ak-radius-lg)] transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <DocumentTextIcon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[var(--ak-color-text-muted)]">E-Mail</p>
            <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">{customer.email}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 hover:bg-[var(--ak-color-bg-hover)] rounded-[var(--ak-radius-lg)] transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100 transition-colors">
            <PhoneIcon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[var(--ak-color-text-muted)]">Telefon</p>
            <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">{customer.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 hover:bg-[var(--ak-color-bg-hover)] rounded-[var(--ak-radius-lg)] transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
            <ClockIcon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[var(--ak-color-text-muted)]">Letzter Kontakt</p>
            <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">{customer.lastContact}</p>
          </div>
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
      prompt: 'Analysiere das Upsell-Potenzial.',
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
          resolve(`**Betreff: Unser Gespräch / Nächste Schritte**\n\nHallo ${customer.name},\n\nvielen Dank für den Austausch. Basierend auf Ihren Anforderungen an ${customer.tags[0] || 'unsere Lösungen'}, schlage ich vor...\n\nMit freundlichen Grüßen`);
        } else if (action.id === 'prep-call') {
          resolve(`**Call Skript:**\n\n1. **Intro:** Bezug auf letzte E-Mail nehmen.\n2. **Value Prop:** Neue Features für ${customer.company} vorstellen.\n3. **Close:** Demo-Termin vereinbaren.`);
        } else {
          resolve(`AI Analyse für ${action.label} läuft...`);
        }
      }, 1500);
    });
  };

  return (
    <AIDetailLayout
      title="Kunden Profil"
      subtitle="CRM & Sales Intelligence"
      onClose={onClose}
      originalContent={OriginalContent}
      summary="Aktiver Kunde mit hohem Potenzial. Letzter Kontakt vor 2 Tagen war positiv. Interesse an Premium-Features signalisiert."
      actions={aiActions}
      onActionTriggered={handleAction}
    />
  )
}
