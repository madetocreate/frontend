'use client'

import { useState } from 'react'
import clsx from 'clsx'
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

type InboxDetailsDrawerProps = {
  threadId: string
  channel: 'email' | 'messenger' | 'review' | 'support'
  sender: string
  dateShort: string
  statusOptions?: Array<{ label: string; value: string; disabled?: boolean; description?: string }>
  status?: string
  important?: boolean
  assigneeOptions?: Array<{ label: string; value: string; disabled?: boolean; description?: string }>
  assignee?: string
  tags?: string
  customer?: string
  project?: string
  lastSync?: string
  connectionStatus?: 'OK' | 'Problem'
  advancedVisible?: boolean
  ids?: {
    conversationId: string
    providerId: string
    messageId: string
  }
  canSpamControls?: boolean
  state?: 'loading' | 'loaded' | 'error' | 'notFound'
  onClose?: () => void
}

type InboxDetailsState = 'loading' | 'loaded' | 'error' | 'notFound'

export function InboxDetailsDrawer({
  threadId,
  channel,
  sender,
  dateShort,
  statusOptions: propStatusOptions,
  status: propStatus,
  important: propImportant,
  assigneeOptions: propAssigneeOptions,
  assignee: propAssignee,
  tags: propTags,
  customer: propCustomer,
  project: propProject,
  lastSync: propLastSync,
  connectionStatus: propConnectionStatus,
  advancedVisible: propAdvancedVisible,
  ids: propIds,
  canSpamControls: propCanSpamControls,
  state: propState,
  onClose,
}: InboxDetailsDrawerProps) {
  const [state, setState] = useState<InboxDetailsState>(propState || 'loaded')
  const [status, setStatus] = useState(propStatus || 'open')
  const [important, setImportant] = useState(propImportant ?? false)
  const [assignee, setAssignee] = useState(propAssignee || '')
  const [tags, setTags] = useState(propTags || 'onboarding, follow-up')
  const [customer, setCustomer] = useState(propCustomer || 'Acme GmbH')
  const [project, setProject] = useState(propProject || '')
  const [lastSync, setLastSync] = useState(propLastSync || '13:22 Uhr')
  const [connectionStatus, setConnectionStatus] = useState<'OK' | 'Problem'>(propConnectionStatus || 'OK')
  const [advancedVisible, setAdvancedVisible] = useState(propAdvancedVisible ?? false)
  const [canSpamControls, setCanSpamControls] = useState(propCanSpamControls ?? true)

  const statusOptions = propStatusOptions || [
    { label: 'Offen', value: 'open' },
    { label: 'In Arbeit', value: 'in_progress' },
    { label: 'Erledigt', value: 'done' },
  ]

  const assigneeOptions = propAssigneeOptions || [
    { label: 'Unzugewiesen', value: '' },
    { label: 'Anna', value: 'anna' },
    { label: 'Ben', value: 'ben' },
    { label: 'Du', value: 'me' },
  ]

  const ids = propIds || {
    conversationId: 'conv_987654',
    providerId: 'gmail',
    messageId: '174a-ef23-9912',
  }

  const channelLabel = {
    email: 'E‑Mail',
    messenger: 'Messenger',
    review: 'Bewertung',
    support: 'Support',
  }[channel]

  const titleLabel = {
    email: 'E‑Mail – Details',
    messenger: 'Nachricht – Details',
    review: 'Bewertung – Details',
    support: 'Anfrage – Details',
  }[channel]

  if (state === 'loading') {
    return (
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex flex-col gap-4" style={{ paddingTop: 'var(--ak-space-2)', paddingBottom: 'var(--ak-space-2)' }}>
          <h3 className="ak-heading text-[var(--ak-font-size-sm)]">Details werden geladen…</h3>
          <div className="h-14 ak-surface-2 rounded-md" />
          <div className="h-10 ak-surface-2 rounded-md" />
          <div className="h-10 ak-surface-2 rounded-md" />
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="flex h-full flex-col gap-3 p-4">
        <div className="flex flex-col gap-3" style={{ paddingTop: 'var(--ak-space-2)', paddingBottom: 'var(--ak-space-2)' }}>
          <h3 className="ak-heading text-[var(--ak-font-size-sm)]">Ups, da ging etwas schief.</h3>
          <p className="ak-body text-[var(--ak-text-secondary)]">Bitte versuche es erneut.</p>
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setState('loading')}
              className="ak-button-sm inline-flex items-center justify-center ak-border-default ak-surface-1 font-medium text-[var(--ak-text-primary)] transition-colors hover:ak-surface-2-hover"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'notFound') {
    return (
      <div className="flex h-full flex-col gap-3 p-4">
        <div className="flex flex-col gap-3" style={{ paddingTop: 'var(--ak-space-2)', paddingBottom: 'var(--ak-space-2)' }}>
          <h3 className="ak-heading text-[var(--ak-font-size-sm)]">Thread nicht gefunden</h3>
          <p className="ak-body text-[var(--ak-text-secondary)]">Dieser Eintrag ist nicht mehr verfügbar.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-5" style={{ padding: 'var(--ak-space-4)' }}>
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="ak-heading text-[var(--ak-font-size-sm)]">{titleLabel}</h3>
          <button
            type="button"
            className="ak-button-sm inline-flex items-center justify-center gap-1.5 ak-border-default ak-surface-1 font-medium text-[var(--ak-text-primary)] transition-colors hover:ak-surface-2-hover"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            Im Chat anzeigen
          </button>
        </div>
        <p className="ak-body text-[var(--ak-font-size-sm)] text-[var(--ak-text-secondary)]">
          {sender} • {dateShort}
        </p>
      </div>

      <div className="h-px ak-border-hairline" />

      {/* Übersicht */}
      <div className="flex flex-col gap-3">
        <h4 className="ak-caption">Übersicht</h4>
        <div className="flex items-center justify-between">
          <span className="ak-body text-[var(--ak-font-size-sm)] text-[var(--ak-text-secondary)]">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="ak-button-sm ak-border-default ak-surface-1 rounded-md px-3 py-1.5 text-[var(--ak-font-size-sm)]"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={important}
              onChange={(e) => setImportant(e.target.checked)}
              className="rounded border-[var(--ak-border-default)]"
            />
            <span className="ak-body text-[var(--ak-font-size-sm)]">Wichtig</span>
          </label>
          <div className="flex-1" />
        </div>
        <div className="flex items-center justify-between">
          <span className="ak-body text-[var(--ak-font-size-sm)] text-[var(--ak-text-secondary)]">Zugewiesen an</span>
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="ak-button-sm ak-border-default ak-surface-1 rounded-md px-3 py-1.5 text-[var(--ak-font-size-sm)]"
          >
            {assigneeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="ak-body text-[var(--ak-font-size-sm)] text-[var(--ak-text-secondary)]">Tags</span>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="klein, komma-getrennt"
            className="ak-button-sm ak-border-default ak-surface-1 rounded-md px-3 py-1.5 text-[var(--ak-font-size-sm)] flex-1 max-w-[200px]"
          />
        </div>
      </div>

      <div className="h-px ak-border-hairline" />

      {/* Verknüpfen */}
      <div className="flex flex-col gap-3">
        <h4 className="ak-caption">Verknüpfen</h4>
        <div className="flex items-center justify-between">
          <span className="ak-body text-[var(--ak-font-size-sm)] text-[var(--ak-text-secondary)]">Kunde</span>
          <input
            type="text"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="Suchen…"
            className="ak-button-sm ak-border-default ak-surface-1 rounded-md px-3 py-1.5 text-[var(--ak-font-size-sm)] flex-1 max-w-[200px]"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="ak-body text-[var(--ak-font-size-sm)] text-[var(--ak-text-secondary)]">Projekt/Deal</span>
          <input
            type="text"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="Optional"
            className="ak-button-sm ak-border-default ak-surface-1 rounded-md px-3 py-1.5 text-[var(--ak-font-size-sm)] flex-1 max-w-[200px]"
          />
        </div>
        <div className="flex items-center justify-end">
          <button
            type="button"
            className="ak-button-sm inline-flex items-center justify-center ak-border-default ak-surface-1 font-medium text-[var(--ak-text-primary)] transition-colors hover:ak-surface-2-hover"
          >
            Neuen Kunden anlegen
          </button>
        </div>
      </div>

      <div className="h-px ak-border-hairline" />

      {/* Quelle & Sync */}
      <div className="flex flex-col gap-3">
        <h4 className="ak-caption">Quelle & Sync</h4>
        <div className="flex items-center justify-between">
          <span className="ak-body text-[var(--ak-font-size-sm)] text-[var(--ak-text-secondary)]">Kanal</span>
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[var(--ak-font-size-xs)] font-medium" style={{ borderColor: 'var(--ak-semantic-info)', backgroundColor: 'var(--ak-semantic-info-soft)', color: 'var(--ak-semantic-info)' }}>
            {channelLabel}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="ak-body text-[var(--ak-font-size-sm)] text-[var(--ak-text-secondary)]">Zuletzt synchronisiert</span>
          <span className="ak-body text-[var(--ak-font-size-sm)]">{lastSync}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="ak-body text-[var(--ak-font-size-sm)] text-[var(--ak-text-secondary)]">Verbindung</span>
          <span
            className={clsx(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-[var(--ak-font-size-xs)] font-medium',
              connectionStatus === 'OK'
                ? 'border-[var(--ak-semantic-success)] bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)]'
                : 'border-[var(--ak-semantic-danger)] bg-[var(--ak-semantic-danger-soft)] text-[var(--ak-semantic-danger)]'
            )}
          >
            {connectionStatus}
          </span>
        </div>
        <div className="flex items-center justify-end">
          <button
            type="button"
            className="ak-button-sm inline-flex items-center justify-center ak-border-default ak-surface-1 font-medium text-[var(--ak-text-primary)] transition-colors hover:ak-surface-2-hover"
          >
            Verbindung testen
          </button>
        </div>
      </div>

      <div className="h-px ak-border-hairline" />

      {/* Erweitert */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h4 className="ak-caption">Erweitert</h4>
          <button
            type="button"
            onClick={() => setAdvancedVisible(!advancedVisible)}
            className="ak-button-sm inline-flex items-center justify-center ak-border-default ak-surface-1 font-medium text-[var(--ak-text-primary)] transition-colors hover:ak-surface-2-hover"
          >
            {advancedVisible ? 'Einklappen' : 'Ausklappen'}
          </button>
        </div>
        {advancedVisible && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h5 className="ak-caption text-[var(--ak-text-secondary)]">IDs</h5>
              <div className="flex items-center justify-between">
                <span className="ak-body text-[var(--ak-font-size-sm)] text-[var(--ak-text-secondary)]">conversationId</span>
                <span className="ak-body text-[var(--ak-font-size-sm)]">{ids.conversationId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="ak-body text-[var(--ak-font-size-sm)] text-[var(--ak-text-secondary)]">providerId</span>
                <span className="ak-body text-[var(--ak-font-size-sm)]">{ids.providerId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="ak-body text-[var(--ak-font-size-sm)] text-[var(--ak-text-secondary)]">messageId</span>
                <span className="ak-body text-[var(--ak-font-size-sm)]">{ids.messageId}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h5 className="ak-caption text-[var(--ak-text-secondary)]">Rohdaten / Header</h5>
              {channel === 'email' && (
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    className="ak-button-sm inline-flex items-center justify-center ak-border-default ak-surface-1 font-medium text-[var(--ak-text-primary)] transition-colors hover:ak-surface-2-hover"
                  >
                    Original anzeigen
                  </button>
                </div>
              )}
              <p className="ak-body text-[var(--ak-font-size-sm)] text-[var(--ak-text-muted)]">
                Für Fehlersuche / Zustellung
              </p>
            </div>
            {canSpamControls && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="ak-button-sm inline-flex items-center justify-center ak-border-default ak-surface-1 font-medium transition-colors hover:ak-surface-2-hover"
                  style={{ color: 'var(--ak-semantic-danger)', borderColor: 'var(--ak-semantic-danger)' }}
                >
                  Absender blockieren
                </button>
                <button
                  type="button"
                  className="ak-button-sm inline-flex items-center justify-center ak-border-default ak-surface-1 font-medium transition-colors hover:ak-surface-2-hover"
                  style={{ color: 'var(--ak-semantic-success)', borderColor: 'var(--ak-semantic-success)' }}
                >
                  Erlauben (Whitelist)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-px ak-border-hairline" />

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className="ak-button-sm inline-flex items-center justify-center ak-border-default ak-surface-1 font-medium text-[var(--ak-text-primary)] transition-colors hover:ak-surface-2-hover"
        >
          Archivieren
        </button>
        <button
          type="button"
          className="ak-button-sm inline-flex items-center justify-center ak-border-default ak-surface-1 font-medium text-[var(--ak-text-primary)] transition-colors hover:ak-surface-2-hover"
        >
          Export
        </button>
      </div>
    </div>
  )
}

