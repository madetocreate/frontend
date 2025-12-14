'use client'

import { useEffect, useMemo, useState } from 'react'
import { AkButton } from '@/components/ui/AkButton'
import { AkChip } from '@/components/ui/AkChip'
import { AkBadge } from '@/components/ui/AkBadge'

type SelectOption = {
  label: string
  value: string
  disabled?: boolean
}

export type InboxDetailsDrawerIds = {
  conversationId?: string
  providerId?: string
  messageId?: string
}

export type InboxDetailsDrawerProps = {
  threadId: string
  channel: string
  sender: string
  dateShort: string
  statusOptions: SelectOption[]
  status: string
  important?: boolean
  assigneeOptions: SelectOption[]
  assignee: string
  tags?: string
  customer?: string
  project?: string
  lastSync?: string
  connectionStatus?: 'OK' | 'Problem' | string
  advancedVisible?: boolean
  ids?: InboxDetailsDrawerIds
  canSpamControls?: boolean
  state?: 'loading' | 'loaded' | 'error'
  onClose?: () => void
}

type Tab = 'overview' | 'emails' | 'attachments'

export function InboxDetailsDrawer({
  threadId,
  channel,
  sender,
  dateShort,
  statusOptions,
  status: statusProp,
  important: importantProp = false,
  assigneeOptions,
  assignee: assigneeProp,
  tags: tagsProp = '',
  customer: customerProp = '',
  project: projectProp = '',
  lastSync = '',
  connectionStatus = 'OK',
  advancedVisible = false,
  ids,
  canSpamControls = false,
  state = 'loaded',
  onClose,
}: InboxDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [status, setStatus] = useState(statusProp)
  const [assignee, setAssignee] = useState(assigneeProp)
  const [tags, setTags] = useState(tagsProp)
  const [customer, setCustomer] = useState(customerProp)
  const [project, setProject] = useState(projectProp)
  const [important, setImportant] = useState(importantProp)
  const [showAdvanced, setShowAdvanced] = useState(advancedVisible)

  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setStatus(statusProp)
      setAssignee(assigneeProp)
      setTags(tagsProp)
      setCustomer(customerProp)
      setProject(projectProp)
      setImportant(importantProp)
      setShowAdvanced(advancedVisible)
      setActiveTab('overview')
    }, 0)
    return () => clearTimeout(timer)
  }, [threadId, statusProp, assigneeProp, tagsProp, customerProp, projectProp, importantProp, advancedVisible])

  const connectionTone = useMemo(() => {
    if (String(connectionStatus).toUpperCase() === 'OK') return 'success'
    return 'warning'
  }, [connectionStatus])

  return (
    <div className="flex flex-col gap-4">
      <div className="ak-section">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="ak-caption uppercase tracking-wide text-[var(--ak-color-text-muted)]">{channel}</p>
            <h3 className="ak-heading text-base">{sender}</h3>
            <p className="ak-caption text-[var(--ak-color-text-secondary)]">{dateShort}</p>
          </div>

          <div className="flex items-center gap-2">
            {important ? <AkBadge tone="accent">wichtig</AkBadge> : <AkBadge tone="muted">normal</AkBadge>}
            <AkButton
              accent="inbox"
              variant="primary"
              size="sm"
              onClick={() => {
                onClose?.()
              }}
            >
              Im Chat öffnen
            </AkButton>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <AkChip
            pressed={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            Übersicht
          </AkChip>
          <AkChip
            pressed={activeTab === 'emails'}
            onClick={() => setActiveTab('emails')}
          >
            E-Mails
          </AkChip>
          <AkChip
            pressed={activeTab === 'attachments'}
            onClick={() => setActiveTab('attachments')}
          >
            Anhänge
          </AkChip>
        </div>
      </div>

      {state === 'loading' ? (
        <div className="ak-section">
          <p className="ak-body">Lade Details…</p>
        </div>
      ) : state === 'error' ? (
        <div className="ak-section">
          <p className="ak-body text-[var(--ak-color-text-danger)]">Details konnten nicht geladen werden.</p>
          <div className="mt-3">
            <AkButton variant="secondary" size="sm" onClick={() => console.log('retry load')}>
              Erneut versuchen
            </AkButton>
          </div>
        </div>
      ) : activeTab === 'overview' ? (
        <>
          <div className="ak-section">
            <p className="ak-section-title">Triage</p>

            <div className="ak-row">
              <span className="ak-row-label">Status</span>
              <select
                className="ak-input h-9 min-w-[180px] px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value} disabled={o.disabled}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="ak-row">
              <span className="ak-row-label">Zuständig</span>
              <select
                className="ak-input h-9 min-w-[180px] px-3 text-sm"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                {assigneeOptions.map((o) => (
                  <option key={o.value} value={o.value} disabled={o.disabled}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="ak-row">
              <span className="ak-row-label">Wichtig</span>
              <AkButton variant="secondary" size="sm" pressed={important} onClick={() => setImportant((v) => !v)}>
                {important ? 'Ja' : 'Nein'}
              </AkButton>
            </div>
          </div>

          <div className="ak-section">
            <p className="ak-section-title">Bezüge</p>

            <div className="ak-row">
              <span className="ak-row-label">Kunde</span>
              <input
                className="ak-input h-9 w-[220px] px-3 text-sm"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Kunde…"
              />
            </div>

            <div className="ak-row">
              <span className="ak-row-label">Projekt</span>
              <input
                className="ak-input h-9 w-[220px] px-3 text-sm"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="Projekt…"
              />
            </div>

            <div className="ak-row">
              <span className="ak-row-label">Tags</span>
              <input
                className="ak-input h-9 w-[220px] px-3 text-sm"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="comma,separated"
              />
            </div>
          </div>

          <div className="ak-section">
            <p className="ak-section-title">System</p>

            <div className="ak-row">
              <span className="ak-row-label">Thread</span>
              <span className="ak-row-value">{threadId}</span>
            </div>

            <div className="ak-row">
              <span className="ak-row-label">Letzter Sync</span>
              <span className="ak-row-value">{lastSync || '—'}</span>
            </div>

            <div className="ak-row">
              <span className="ak-row-label">Verbindung</span>
              <div className="flex items-center gap-2">
                <AkBadge tone={connectionTone}>{connectionStatus}</AkBadge>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="ak-caption text-[var(--ak-color-text-secondary)]">Erweitert</span>
              <AkButton variant="ghost" size="sm" pressed={showAdvanced} onClick={() => setShowAdvanced((v) => !v)}>
                {showAdvanced ? 'Ausblenden' : 'Einblenden'}
              </AkButton>
            </div>

            {showAdvanced ? (
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <div className="ak-row">
                  <span className="ak-row-label">Conversation</span>
                  <span className="ak-row-value">{ids?.conversationId || '—'}</span>
                </div>
                <div className="ak-row">
                  <span className="ak-row-label">Provider</span>
                  <span className="ak-row-value">{ids?.providerId || '—'}</span>
                </div>
                <div className="ak-row">
                  <span className="ak-row-label">Message</span>
                  <span className="ak-row-value">{ids?.messageId || '—'}</span>
                </div>
              </div>
            ) : null}
          </div>

          {canSpamControls ? (
            <div className="ak-section">
              <p className="ak-section-title">Spam</p>
              <div className="flex flex-wrap gap-2">
                <AkButton variant="secondary" size="sm" onClick={() => console.log('mark spam')}>
                  Als Spam markieren
                </AkButton>
                <AkButton variant="ghost" size="sm" onClick={() => console.log('block sender')}>
                  Absender blockieren
                </AkButton>
              </div>
            </div>
          ) : null}
        </>
      ) : activeTab === 'emails' ? (
        <div className="ak-section">
          <p className="ak-section-title">E-Mails</p>
          <div className="flex flex-col gap-3">
            <div className="rounded-[var(--ak-radius-lg)] border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] p-3">
              <p className="ak-body">Betreff: Rückfrage</p>
              <p className="ak-caption mt-1 text-[var(--ak-color-text-secondary)]">Beispiel-Inhalt…</p>
            </div>
            <div className="rounded-[var(--ak-radius-lg)] border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] p-3">
              <p className="ak-body">Betreff: Re: Rückfrage</p>
              <p className="ak-caption mt-1 text-[var(--ak-color-text-secondary)]">Beispiel-Inhalt…</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="ak-section">
          <p className="ak-section-title">Anhänge</p>
          <div className="flex flex-col gap-2">
            <div className="ak-row">
              <span className="ak-row-label">Angebot.pdf</span>
              <AkButton variant="ghost" size="sm" onClick={() => console.log('download')}>
                Download
              </AkButton>
            </div>
            <div className="ak-row">
              <span className="ak-row-label">Screenshot.png</span>
              <AkButton variant="ghost" size="sm" onClick={() => console.log('download')}>
                Download
              </AkButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
