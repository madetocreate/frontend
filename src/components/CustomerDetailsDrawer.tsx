'use client'

import { useState, useEffect } from 'react'
import clsx from 'clsx'
import {
  ArrowPathIcon,
  InformationCircleIcon,
  UserIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  DocumentIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

type CustomerStatus = 'loading' | 'ready' | 'empty' | 'error'

type CustomerHeader = {
  name: string
  lastContact: string
}

type CustomerProfile = {
  company: string
  email: string
  phone: string
  website: string
  region: string
  tags: string
  note: string
}

type LinkedChannel = {
  id: string
  label: string
  color: 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'discovery'
}

type CustomerDetailsDrawerProps = {
  customerId: string
  onClose?: () => void
}

const BADGE_COLOR_MAP = {
  secondary: 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)]',
  success: 'border-[var(--ak-color-border-success)] bg-[var(--ak-color-bg-success)] text-[var(--ak-color-text-success)]',
  danger: 'border-[var(--ak-color-border-danger)] bg-[var(--ak-color-bg-danger)] text-[var(--ak-color-text-danger)]',
  warning: 'border-[var(--ak-color-border-warning)] bg-[var(--ak-color-bg-warning)] text-[var(--ak-color-text-warning)]',
  info: 'border-[var(--ak-color-border-info)] bg-[var(--ak-color-bg-info)] text-[var(--ak-color-text-info)]',
  discovery: 'border-[var(--ak-color-border-discovery)] bg-[var(--ak-color-bg-discovery)] text-[var(--ak-color-text-discovery)]',
}

// Mock-Daten
const MOCK_CUSTOMER = {
  status: 'ready' as CustomerStatus,
  customerId: 'cust_123',
  header: {
    name: 'Muster GmbH',
    lastContact: '2025-12-10',
  },
  profile: {
    company: 'Muster GmbH',
    email: 'kontakt@muster.de',
    phone: '+49 30 123456',
    website: 'https://muster.de',
    region: 'Berlin, DE',
    tags: 'B2B, Stammkunde, DACH',
    note: 'Bevorzugt E-Mail. Angebot Q1 senden.',
  },
  linked: {
    channels: [
      { id: 'c_email', label: 'E-Mail', color: 'info' as const },
      { id: 'c_messenger', label: 'Messenger', color: 'discovery' as const },
      { id: 'c_reviews', label: 'Bewertungen', color: 'success' as const },
    ],
  },
  advanced: {
    show: false,
    internalIds: [
      { id: 'i1', key: 'CRM-ID', value: 'crm_8743' },
      { id: 'i2', key: 'ERP-ID', value: 'erp_5521' },
    ],
    duplicateHint: 'Duplikat-Check: 1 potentieller Treffer gefunden.',
  },
  ui: {
    confirmingDelete: false,
  },
}

export function CustomerDetailsDrawer({ customerId, onClose }: CustomerDetailsDrawerProps) {
  const [status, setStatus] = useState<CustomerStatus>('loading')
  const [header, setHeader] = useState<CustomerHeader | null>(null)
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [linked, setLinked] = useState<{ channels: LinkedChannel[] } | null>(null)
  const [advanced, setAdvanced] = useState(MOCK_CUSTOMER.advanced)
  const [ui, setUi] = useState(MOCK_CUSTOMER.ui)
  const [formData, setFormData] = useState<CustomerProfile | null>(null)

  useEffect(() => {
    // Simuliere Laden
    const timer = setTimeout(() => {
      setStatus('ready')
      setHeader(MOCK_CUSTOMER.header)
      setProfile(MOCK_CUSTOMER.profile)
      setFormData(MOCK_CUSTOMER.profile)
      setLinked(MOCK_CUSTOMER.linked)
    }, 500)

    return () => clearTimeout(timer)
  }, [customerId])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Update customer
    console.log('Update customer:', formData)
  }

  const handleFormReset = () => {
    if (profile) {
      setFormData(profile)
    }
  }

  const handleReload = () => {
    setStatus('loading')
    setTimeout(() => {
      setStatus('ready')
    }, 500)
  }

  const handleDelete = () => {
    // TODO: Delete customer
    console.log('Delete customer:', customerId)
    if (onClose) {
      onClose()
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-[var(--ak-color-text-secondary)]" />
        <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">Lade Kundendaten...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
        <InformationCircleIcon className="h-8 w-8 text-[var(--ak-color-text-danger)]" />
        <h3 className="ak-heading text-sm text-[var(--ak-color-text-danger)]">Fehler beim Laden</h3>
        <button
          type="button"
          onClick={handleReload}
          className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-4 py-2 text-sm font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
        >
          Erneut laden
        </button>
      </div>
    )
  }

  if (status === 'empty') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
        <UserIcon className="h-8 w-8 text-[var(--ak-color-text-secondary)]" />
        <h3 className="ak-heading text-sm">Kein Kunde gefunden</h3>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--ak-color-accent)] bg-[var(--ak-color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--ak-color-accent)]/90"
        >
          <SparklesIcon className="h-4 w-4" />
          Im Chat anlegen
        </button>
      </div>
    )
  }

  if (!header || !profile || !linked) {
    return null
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Header mit Close Button */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="ak-heading text-base">{header.name}</h2>
          <p className="ak-caption text-[var(--ak-color-text-secondary)]">
            Letzter Kontakt: {header.lastContact}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded text-[var(--ak-color-text-secondary)] transition-colors hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]"
          aria-label="Schließen"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Briefen Button */}
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--ak-color-accent)] bg-[var(--ak-color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--ak-color-accent)]/90"
        >
          <SparklesIcon className="h-4 w-4" />
          Im Chat briefen
        </button>
      </div>

      <div className="h-px bg-[var(--ak-color-border-subtle)]" />

      {/* Profil Formular */}
      <form onSubmit={handleFormSubmit}>
        <div className="flex flex-col gap-3">
          <p className="ak-caption text-[var(--ak-color-text-secondary)]">Profil</p>
          
          <input
            type="text"
            name="profile.company"
            value={formData?.company || ''}
            onChange={(e) => setFormData((prev) => prev ? { ...prev, company: e.target.value } : null)}
            placeholder="Firma"
            className="w-full rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-4 py-2 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)]"
          />
          
          <input
            type="email"
            name="profile.email"
            value={formData?.email || ''}
            onChange={(e) => setFormData((prev) => prev ? { ...prev, email: e.target.value } : null)}
            placeholder="E-Mail"
            className="w-full rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-4 py-2 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)]"
          />
          
          <input
            type="tel"
            name="profile.phone"
            value={formData?.phone || ''}
            onChange={(e) => setFormData((prev) => prev ? { ...prev, phone: e.target.value } : null)}
            placeholder="Telefon"
            className="w-full rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-4 py-2 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)]"
          />
          
          <input
            type="url"
            name="profile.website"
            value={formData?.website || ''}
            onChange={(e) => setFormData((prev) => prev ? { ...prev, website: e.target.value } : null)}
            placeholder="Website"
            className="w-full rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-4 py-2 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)]"
          />
          
          <input
            type="text"
            name="profile.region"
            value={formData?.region || ''}
            onChange={(e) => setFormData((prev) => prev ? { ...prev, region: e.target.value } : null)}
            placeholder="Standort/Region"
            className="w-full rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-4 py-2 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)]"
          />
          
          <input
            type="text"
            name="profile.tags"
            value={formData?.tags || ''}
            onChange={(e) => setFormData((prev) => prev ? { ...prev, tags: e.target.value } : null)}
            placeholder="Tags (Komma-getrennt)"
            className="w-full rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-4 py-2 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)]"
          />
          
          <textarea
            name="profile.note"
            value={formData?.note || ''}
            onChange={(e) => setFormData((prev) => prev ? { ...prev, note: e.target.value } : null)}
            rows={3}
            placeholder="Notiz"
            className="w-full rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-4 py-2 text-sm text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:border-[var(--ak-color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--ak-color-accent)] resize-none"
          />
          
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleFormReset}
              className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-4 py-2 text-sm font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-accent)] bg-[var(--ak-color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--ak-color-accent)]/90"
            >
              Speichern
            </button>
          </div>
        </div>
      </form>

      <div className="h-px bg-[var(--ak-color-border-subtle)]" />

      {/* Verknüpft */}
      <div className="flex flex-col gap-2">
        <p className="ak-caption text-[var(--ak-color-text-secondary)]">Verknüpft</p>
        <div className="flex flex-wrap items-center gap-2">
          {linked.channels.map((channel) => (
            <span
              key={channel.id}
              className={clsx(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                BADGE_COLOR_MAP[channel.color]
              )}
            >
              {channel.label}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-end">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
            Verknüpfung prüfen
          </button>
        </div>
      </div>

      <div className="h-px bg-[var(--ak-color-border-subtle)]" />

      {/* Datenschutz */}
      <div className="flex flex-col gap-2">
        <p className="ak-caption text-[var(--ak-color-text-secondary)]">Datenschutz</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
          >
            <DocumentIcon className="h-4 w-4" />
            Kundendaten exportieren
          </button>
          {!ui.confirmingDelete ? (
            <button
              type="button"
              onClick={() => setUi((prev) => ({ ...prev, confirmingDelete: true }))}
              className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-border-danger)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-danger)] transition-colors hover:bg-[var(--ak-color-bg-danger)]/10"
            >
              Kundendaten löschen
            </button>
          ) : null}
        </div>
        {ui.confirmingDelete && (
          <div className="flex items-center gap-2 rounded-lg border border-[var(--ak-color-border-danger)] bg-[var(--ak-color-bg-danger)]/10 p-3">
            <InformationCircleIcon className="h-4 w-4 text-[var(--ak-color-text-danger)]" />
            <p className="ak-body flex-1 text-sm text-[var(--ak-color-text-danger)]">
              Sicher löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <button
              type="button"
              onClick={() => setUi((prev) => ({ ...prev, confirmingDelete: false }))}
              className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center justify-center rounded-lg border border-[var(--ak-color-border-danger)] bg-[var(--ak-color-bg-danger)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--ak-color-bg-danger)]/90"
            >
              Jetzt löschen
            </button>
          </div>
        )}
      </div>

      <div className="h-px bg-[var(--ak-color-border-subtle)]" />

      {/* Erweitert */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="ak-heading text-sm">Erweitert</h3>
          <button
            type="button"
            onClick={() => setAdvanced((prev) => ({ ...prev, show: !prev.show }))}
            className="inline-flex items-center justify-center rounded text-xs font-medium text-[var(--ak-color-text-secondary)] transition-colors hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]"
          >
            {advanced.show ? 'Weniger' : 'Mehr'}
          </button>
        </div>
        {advanced.show && (
          <div className="rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-elevated-secondary)] p-3">
            <div className="flex flex-col gap-2">
              {advanced.internalIds.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <p className="ak-caption text-[var(--ak-color-text-secondary)]">{item.key}</p>
                  <p className="ak-body text-sm text-[var(--ak-color-text-primary)]">{item.value}</p>
                </div>
              ))}
              {advanced.duplicateHint && (
                <p className="ak-body text-sm text-[var(--ak-color-text-secondary)]">
                  {advanced.duplicateHint}
                </p>
              )}
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
                >
                  <Cog6ToothIcon className="h-4 w-4" />
                  Duplikate zusammenführen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

