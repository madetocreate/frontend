'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowPathIcon,
  InformationCircleIcon,
  UserIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  DocumentIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge, type AkBadgeTone } from '@/components/ui/AkBadge'
import { WidgetCard } from '@/components/ui/WidgetCard'

type ViewState = 'idle' | 'loading' | 'error' | 'ready'

type CustomerHeader = {
  name: string
  lastContact: string
  updatedAt: string
}

type CustomerProfile = {
  contactName: string
  companyName: string
  email: string
  phone: string
  notes: string
}

type LinkedChannel = {
  id: string
  label: string
  color: 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'discovery'
}

type LinkedChannels = {
  channels: LinkedChannel[]
  lastCheck: string
  status: 'ok' | 'stale' | 'missing'
}

type AdvancedInfo = {
  show: boolean
  internalId: string
  crmId: string
  tags: string[]
  segment: string
  consent: boolean
}

type CustomerDetailsDrawerProps = {
  customerId: string | null
  onClose?: () => void
}

const MOCK_CUSTOMER_DATA: Record<
  string,
  {
    header: CustomerHeader
    profile: CustomerProfile
    linked: LinkedChannels
    advanced: AdvancedInfo
  }
> = {
  'cust-001': {
    header: {
      name: 'Muster GmbH',
      lastContact: 'vor 2 Tagen',
      updatedAt: 'Heute, 09:14',
    },
    profile: {
      contactName: 'Max Mustermann',
      companyName: 'Muster GmbH',
      email: 'max@muster.de',
      phone: '+49 151 123456',
      notes: 'Ist interessiert an Pro-Plan. Nächstes Follow-up: nächste Woche.',
    },
    linked: {
      channels: [
        { id: 'email', label: 'E-Mail', color: 'success' },
        { id: 'insta', label: 'Instagram', color: 'discovery' },
        { id: 'wa', label: 'WhatsApp', color: 'info' },
      ],
      lastCheck: 'Heute, 08:55',
      status: 'ok',
    },
    advanced: {
      show: false,
      internalId: 'AKL-C-001',
      crmId: 'SFDC-900112',
      tags: ['warm', 'b2b', 'saas'],
      segment: 'Mid-Market',
      consent: true,
    },
  },
  'cust-002': {
    header: {
      name: 'Alpha & Co',
      lastContact: 'vor 6 Stunden',
      updatedAt: 'Heute, 12:02',
    },
    profile: {
      contactName: 'Anna Alpha',
      companyName: 'Alpha & Co',
      email: 'anna@alpha.co',
      phone: '+49 171 987654',
      notes: 'Support-Fall offen: Login-Probleme. Bitte priorisieren.',
    },
    linked: {
      channels: [
        { id: 'email', label: 'E-Mail', color: 'success' },
        { id: 'web', label: 'Web', color: 'secondary' },
      ],
      lastCheck: 'Gestern, 18:22',
      status: 'stale',
    },
    advanced: {
      show: false,
      internalId: 'AKL-C-002',
      crmId: 'SFDC-900205',
      tags: ['hot', 'support'],
      segment: 'SMB',
      consent: false,
    },
  },
}

function channelTone(color: LinkedChannel['color']): AkBadgeTone {
  switch (color) {
    case 'success':
      return 'success'
    case 'danger':
      return 'danger'
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    case 'discovery':
      return 'accent'
    default:
      return 'muted'
  }
}

export function CustomerDetailsDrawer({ customerId, onClose }: CustomerDetailsDrawerProps) {
  const [viewState, setViewState] = useState<ViewState>('idle')
  const [header, setHeader] = useState<CustomerHeader | null>(null)
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [linked, setLinked] = useState<LinkedChannels | null>(null)
  const [advanced, setAdvanced] = useState<AdvancedInfo | null>(null)

  const [formData, setFormData] = useState<CustomerProfile | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState(false)

  useEffect(() => {
    if (!customerId) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setViewState('idle')
        setHeader(null)
        setProfile(null)
        setLinked(null)
        setAdvanced(null)
        setFormData(null)
        setDeleteConfirmation(false)
      }, 0)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      setViewState('loading')
      const data = MOCK_CUSTOMER_DATA[customerId]
      if (!data) {
        setViewState('error')
        return
      }
      setHeader(data.header)
      setProfile(data.profile)
      setLinked(data.linked)
      setAdvanced(data.advanced)
      setFormData(data.profile)
      setViewState('ready')
    }, 200)

    return () => clearTimeout(timer)
  }, [customerId])

  const canSave = useMemo(() => {
    if (!profile || !formData) return false
    return JSON.stringify(profile) !== JSON.stringify(formData)
  }, [profile, formData])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return
    setProfile(formData)
    setHeader((h) => (h ? { ...h, updatedAt: 'Gerade eben' } : h))
  }

  const handleFormReset = () => {
    if (!profile) return
    setFormData(profile)
  }

  const handleRelinkCheck = () => {
    if (!linked) return
    setLinked((prev) =>
      prev
        ? {
            ...prev,
            lastCheck: 'Gerade eben',
            status: 'ok',
          }
        : prev,
    )
  }

  const handleDelete = () => {
    console.log('Delete customer:', customerId)
    onClose?.()
  }

  if (viewState === 'idle') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-xs text-center">
          <p className="ak-heading text-sm">Kein Kunde ausgewählt</p>
          <p className="ak-caption mt-1 text-[var(--ak-color-text-secondary)]">
            Wähle links einen Kunden aus, um Details zu sehen.
          </p>
        </div>
      </div>
    )
  }

  if (viewState === 'loading') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2 text-[var(--ak-color-text-secondary)]">
          <ArrowPathIcon className="h-5 w-5 animate-spin" />
          <span className="ak-body">Lade Kundendetails…</span>
        </div>
      </div>
    )
  }

  if (viewState === 'error') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-xs text-center">
          <p className="ak-heading text-sm text-[var(--ak-color-text-danger)]">Kunde nicht gefunden</p>
          <p className="ak-caption mt-1 text-[var(--ak-color-text-secondary)]">
            Bitte wähle einen anderen Kunden aus.
          </p>
        </div>
      </div>
    )
  }

  if (!header || !profile || !linked || !advanced || !formData) return null

  return (
    <div className="flex h-full flex-col gap-4">
      <WidgetCard
        title={header.name}
        subtitle={`Letzter Kontakt: ${header.lastContact} • Aktualisiert: ${header.updatedAt}`}
        actions={
          <AkButton accent="customers" variant="primary" size="sm">
            <span className="inline-flex items-center gap-2">
              <SparklesIcon className="h-4 w-4" />
              Im Chat briefen
            </span>
          </AkButton>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {linked.channels.map((channel) => (
              <AkBadge key={channel.id} tone={channelTone(channel.color)}>
                {channel.label}
              </AkBadge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--ak-color-text-secondary)]">
              <InformationCircleIcon className="h-4 w-4" />
              <span className="ak-caption">
                Verknüpfungen: {linked.status === 'ok' ? 'Aktuell' : linked.status === 'stale' ? 'Veraltet' : 'Fehlt'}
                , letzter Check: {linked.lastCheck}
              </span>
            </div>

            <AkButton variant="secondary" size="sm" onClick={handleRelinkCheck}>
              <span className="inline-flex items-center gap-2">
                <MagnifyingGlassIcon className="h-4 w-4" />
                Verknüpfung prüfen
              </span>
            </AkButton>
          </div>
        </div>
      </WidgetCard>

      <WidgetCard title="Profil" subtitle="Kerninformationen & Notizen">
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="ak-caption text-[var(--ak-color-text-muted)]">Kontakt</label>
              <input
                className="ak-input mt-1 w-full px-3 py-2 text-sm placeholder:text-[var(--ak-color-text-muted)]"
                value={formData.contactName}
                onChange={(e) => setFormData((prev) => (prev ? { ...prev, contactName: e.target.value } : prev))}
              />
            </div>

            <div>
              <label className="ak-caption text-[var(--ak-color-text-muted)]">Unternehmen</label>
              <input
                className="ak-input mt-1 w-full px-3 py-2 text-sm placeholder:text-[var(--ak-color-text-muted)]"
                value={formData.companyName}
                onChange={(e) => setFormData((prev) => (prev ? { ...prev, companyName: e.target.value } : prev))}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="ak-caption text-[var(--ak-color-text-muted)]">E-Mail</label>
                <input
                  type="email"
                  className="ak-input mt-1 w-full px-3 py-2 text-sm placeholder:text-[var(--ak-color-text-muted)]"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => (prev ? { ...prev, email: e.target.value } : prev))}
                />
              </div>

              <div>
                <label className="ak-caption text-[var(--ak-color-text-muted)]">Telefon</label>
                <input
                  className="ak-input mt-1 w-full px-3 py-2 text-sm placeholder:text-[var(--ak-color-text-muted)]"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => (prev ? { ...prev, phone: e.target.value } : prev))}
                />
              </div>
            </div>

            <div>
              <label className="ak-caption text-[var(--ak-color-text-muted)]">Notizen</label>
              <textarea
                rows={4}
                className="ak-input mt-1 w-full px-3 py-2 text-sm placeholder:text-[var(--ak-color-text-muted)]"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => (prev ? { ...prev, notes: e.target.value } : prev))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--ak-color-text-secondary)]">
              <UserIcon className="h-4 w-4" />
              <span className="ak-caption">Änderungen werden lokal gespeichert (Mock).</span>
            </div>

            <div className="flex items-center gap-2">
              <AkButton type="button" variant="secondary" size="sm" onClick={handleFormReset} disabled={!canSave}>
                Abbrechen
              </AkButton>
              <AkButton accent="customers" variant="primary" size="sm" type="submit" disabled={!canSave}>
                Speichern
              </AkButton>
            </div>
          </div>
        </form>
      </WidgetCard>

      <WidgetCard title="Aktionen" subtitle="Schnellzugriff">
        <div className="flex flex-wrap gap-2">
          <AkButton variant="secondary" size="sm" onClick={() => console.log('search')}>
            <span className="inline-flex items-center gap-2">
              <MagnifyingGlassIcon className="h-4 w-4" />
              Suchen
            </span>
          </AkButton>
          <AkButton variant="secondary" size="sm" onClick={() => console.log('docs')}>
            <span className="inline-flex items-center gap-2">
              <DocumentIcon className="h-4 w-4" />
              Dokumente
            </span>
          </AkButton>
          <AkButton variant="secondary" size="sm" onClick={() => console.log('settings')}>
            <span className="inline-flex items-center gap-2">
              <Cog6ToothIcon className="h-4 w-4" />
              Einstellungen
            </span>
          </AkButton>
        </div>
      </WidgetCard>

      <WidgetCard
        title="Erweitert"
        subtitle="IDs, Segment & Datenschutz"
        actions={
          <AkButton
            variant="ghost"
            size="sm"
            pressed={advanced.show}
            onClick={() => setAdvanced((p) => ({ ...p, show: !p.show }))}
          >
            {advanced.show ? 'Ausblenden' : 'Einblenden'}
          </AkButton>
        }
      >
        {advanced.show ? (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-[var(--ak-radius-lg)] border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] p-3">
                <p className="ak-caption text-[var(--ak-color-text-muted)]">Internal ID</p>
                <p className="ak-body">{advanced.internalId}</p>
              </div>
              <div className="rounded-[var(--ak-radius-lg)] border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] p-3">
                <p className="ak-caption text-[var(--ak-color-text-muted)]">CRM ID</p>
                <p className="ak-body">{advanced.crmId}</p>
              </div>
            </div>

            <div className="rounded-[var(--ak-radius-lg)] border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] p-3">
              <p className="ak-caption text-[var(--ak-color-text-muted)]">Segment</p>
              <p className="ak-body">{advanced.segment}</p>
            </div>

            <div className="rounded-[var(--ak-radius-lg)] border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] p-3">
              <p className="ak-caption text-[var(--ak-color-text-muted)]">Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {advanced.tags.map((t) => (
                  <AkBadge key={t} tone="muted">
                    {t}
                  </AkBadge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-[var(--ak-radius-lg)] border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] p-3">
              <div>
                <p className="ak-caption text-[var(--ak-color-text-muted)]">Consent</p>
                <p className="ak-body">{advanced.consent ? 'Vorhanden' : 'Nicht vorhanden'}</p>
              </div>
              <AkButton variant="secondary" size="sm" onClick={() => console.log('export')}>
                Export
              </AkButton>
            </div>

            <div className="flex items-center justify-between rounded-[var(--ak-radius-lg)] border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] p-3">
              <div>
                <p className="ak-caption text-[var(--ak-color-text-muted)]">Kundendaten löschen</p>
                <p className="ak-caption text-[var(--ak-color-text-secondary)]">
                  Dies ist eine Mock-Aktion. In echt: DSGVO-Workflow.
                </p>
              </div>
              {deleteConfirmation ? (
                <div className="flex items-center gap-2">
                  <AkButton variant="secondary" size="sm" onClick={() => setDeleteConfirmation(false)}>
                    Abbrechen
                  </AkButton>
                  <AkButton variant="danger" size="sm" onClick={handleDelete}>
                    Löschen
                  </AkButton>
                </div>
              ) : (
                <AkButton variant="danger" size="sm" onClick={() => setDeleteConfirmation(true)}>
                  Löschen…
                </AkButton>
              )}
            </div>
          </div>
        ) : (
          <p className="ak-caption text-[var(--ak-color-text-secondary)]">
            Erweitert ist ausgeblendet, um den Inspector ruhiger zu halten.
          </p>
        )}
      </WidgetCard>
    </div>
  )
}
