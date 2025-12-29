'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  FileText,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Lock,
  Unlock,
  Settings,
  FileDown,
  UserX,
  UserCheck,
  History,
  Filter,
  Search,
  Calendar,
  Plus,
} from 'lucide-react'

interface Consent {
  id: string
  consent_type: string
  consent_status: 'granted' | 'denied' | 'withdrawn' | 'expired'
  granted_at?: string
  withdrawn_at?: string
  expires_at?: string
  consent_source: string
  legal_basis: string
}

interface DataSubjectRequest {
  id: string
  request_type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection' | 'withdraw_consent'
  requester_email: string
  status: 'pending' | 'verifying' | 'processing' | 'completed' | 'rejected' | 'expired'
  created_at: string
  deadline_at: string
  completed_at?: string
}

interface DataExport {
  id: string
  export_type: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired'
  created_at: string
  expires_at: string
  file_size_bytes?: number
  download_count: number
}

interface PrivacySettings {
  require_explicit_consent: boolean
  require_double_opt_in: boolean
  consent_expires_days?: number
  privacy_policy_url?: string
  privacy_policy_version?: string
  contact_data_retention_days: number
  deleted_data_retention_days: number
}

interface ComplianceCenterProps {
  tenantId: string
}

export function ComplianceCenter({ tenantId }: ComplianceCenterProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'consents' | 'requests' | 'exports' | 'settings'>('overview')
  const [consents, setConsents] = useState<Consent[]>([])
  const [requests, setRequests] = useState<DataSubjectRequest[]>([])
  const [exports, setExports] = useState<DataExport[]>([])
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [tenantId, activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      // TODO: API calls
      // Mock data
      if (activeTab === 'consents') {
        setConsents([
          {
            id: '1',
            consent_type: 'marketing_email',
            consent_status: 'granted',
            granted_at: new Date(Date.now() - 86400000).toISOString(),
            consent_source: 'website_form',
            legal_basis: 'consent',
          },
        ])
      } else if (activeTab === 'requests') {
        setRequests([
          {
            id: '1',
            request_type: 'access',
            requester_email: 'user@example.com',
            status: 'processing',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            deadline_at: new Date(Date.now() + 2592000000).toISOString(),
          },
        ])
      } else if (activeTab === 'exports') {
        setExports([
          {
            id: '1',
            export_type: 'full_profile',
            status: 'completed',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            expires_at: new Date(Date.now() + 518400000).toISOString(),
            file_size_bytes: 45678,
            download_count: 1,
          },
        ])
      } else if (activeTab === 'settings') {
        setPrivacySettings({
          require_explicit_consent: true,
          require_double_opt_in: true,
          consent_expires_days: 365,
          privacy_policy_url: 'https://example.com/privacy',
          privacy_policy_version: '1.2',
          contact_data_retention_days: 2555,
          deleted_data_retention_days: 30,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      access: 'Datenzugriff',
      rectification: 'Berichtigung',
      erasure: 'Löschung',
      portability: 'Datenportabilität',
      restriction: 'Einschränkung',
      objection: 'Widerspruch',
      withdraw_consent: 'Einwilligung widerrufen',
    }
    return labels[type] || type
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      granted: 'green',
      completed: 'green',
      pending: 'yellow',
      processing: 'blue',
      verifying: 'blue',
      withdrawn: 'red',
      rejected: 'red',
      expired: 'gray',
    }
    return colors[status] || 'gray'
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const color = getStatusColor(status)
    const iconConfig = {
      granted: CheckCircle2,
      completed: CheckCircle2,
      pending: Clock,
      processing: History,
      withdrawn: XCircle,
      rejected: XCircle,
    }
    const Icon = iconConfig[status as keyof typeof iconConfig] || AlertTriangle

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${color}-500/10 text-${color}-400 border border-${color}-500/20`}>
        <Icon className="w-3.5 h-3.5" />
        {status === 'granted' ? 'Erteilt' :
         status === 'withdrawn' ? 'Widerrufen' :
         status === 'pending' ? 'Ausstehend' :
         status === 'completed' ? 'Abgeschlossen' :
         status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[var(--ak-semantic-info-soft)] flex items-center justify-center">
              <Shield className="w-6 h-6 text-[var(--ak-semantic-info)]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--ak-color-text-inverted)]">GDPR Compliance Center</h2>
              <p className="text-[var(--ak-color-text-secondary)] mt-1">
                Verwalte Einwilligungen, Datenanfragen und Datenschutzeinstellungen
              </p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-hover)] transition-colors text-sm text-[var(--ak-color-text-secondary)]">
              <Plus className="w-4 h-4" />
              Neue Einwilligung
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-hover)] transition-colors text-sm text-[var(--ak-color-text-secondary)]">
              <FileText className="w-4 h-4" />
              DSR Anfrage
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--ak-semantic-info)] hover:bg-[var(--ak-semantic-info-strong)] text-[var(--ak-color-text-inverted)] font-medium transition-colors text-sm">
              <Download className="w-4 h-4" />
              Datenexport
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--ak-color-border-subtle)]">
        {[
          { id: 'overview', label: 'Übersicht', icon: Eye },
          { id: 'consents', label: 'Einwilligungen', icon: CheckCircle2 },
          { id: 'requests', label: 'Datenanfragen', icon: FileText },
          { id: 'exports', label: 'Datenexporte', icon: Download },
          { id: 'settings', label: 'Einstellungen', icon: Settings },
        ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2
                ${
                  activeTab === id
                    ? 'text-[var(--ak-color-text-inverted)] border-[var(--ak-semantic-info)]'
                    : 'text-[var(--ak-color-text-secondary)] border-transparent hover:text-[var(--ak-color-text-primary)] hover:border-[var(--ak-color-border-subtle)]'
                }
              `}
            >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--ak-color-bg-surface)]/90 rounded-xl p-6 border border-[var(--ak-color-border-subtle)]">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--ak-semantic-success-soft)] flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[var(--ak-semantic-success)]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">12,456</div>
                <div className="text-sm text-[var(--ak-color-text-secondary)]">Aktive Einwilligungen</div>
              </div>
            </div>
            <div className="text-xs text-[var(--ak-color-text-muted)]">
              +234 diese Woche
            </div>
          </div>

          <div className="bg-[var(--ak-color-bg-surface)]/80 rounded-xl p-6 border border-[var(--ak-color-border-subtle)]">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--ak-semantic-warning-soft)] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[var(--ak-semantic-warning)]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">8</div>
                <div className="text-sm text-[var(--ak-color-text-secondary)]">Offene Anfragen</div>
              </div>
            </div>
            <div className="text-xs text-[var(--ak-color-text-muted)]">
              3 fällig in den nächsten 7 Tagen
            </div>
          </div>

          <div className="bg-[var(--ak-color-bg-surface)]/80 rounded-xl p-6 border border-[var(--ak-color-border-subtle)]">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--ak-semantic-info-soft)] flex items-center justify-center">
                  <Download className="w-5 h-5 text-[var(--ak-semantic-info)]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">23</div>
                <div className="text-sm text-[var(--ak-color-text-secondary)]">Datenexporte</div>
              </div>
            </div>
            <div className="text-xs text-[var(--ak-color-text-muted)]">
              5 in den letzten 30 Tagen
            </div>
          </div>

          {/* Recent Activity */}
          <div className="md:col-span-3 bg-[var(--ak-color-bg-surface)]/80 rounded-xl border border-[var(--ak-color-border-subtle)] p-6">
            <h3 className="font-semibold text-[var(--ak-color-text-inverted)] mb-4">Letzte Aktivitäten</h3>
            <div className="space-y-3">
              {[
                { action: 'Einwilligung erteilt', type: 'consent', time: 'vor 2 Stunden', user: 'user@example.com' },
                { action: 'Datenanfrage erstellt', type: 'request', time: 'vor 5 Stunden', user: 'customer@example.com' },
                { action: 'Datenexport abgeschlossen', type: 'export', time: 'vor 1 Tag', user: 'admin' },
                { action: 'Einwilligung widerrufen', type: 'consent', time: 'vor 2 Tagen', user: 'user@example.com' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--ak-color-bg-surface)]/80">
                  <div className="w-8 h-8 rounded-full bg-[var(--ak-semantic-info-soft)] flex items-center justify-center">
                    <History className="w-4 h-4 text-[var(--ak-semantic-info)]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-[var(--ak-color-text-inverted)]">{activity.action}</div>
                    <div className="text-xs text-[var(--ak-color-text-secondary)]">{activity.user} • {activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'consents' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ak-color-text-secondary)]" />
              <input
                type="text"
                placeholder="Nach Kontakt suchen..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-inverted)] placeholder:text-[var(--ak-color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-semantic-info)]/50"
              />
            </div>
            <select className="px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-inverted)] text-sm">
              <option>Alle Typen</option>
              <option>Marketing E-Mail</option>
              <option>Marketing SMS</option>
              <option>Marketing WhatsApp</option>
            </select>
            <select className="px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-inverted)] text-sm">
              <option>Alle Status</option>
              <option>Erteilt</option>
              <option>Widerrufen</option>
              <option>Abgelaufen</option>
            </select>
          </div>

          {/* Consents Table */}
          <div className="bg-[var(--ak-color-bg-surface)]/80 rounded-xl border border-[var(--ak-color-border-subtle)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-[var(--ak-color-text-secondary)] border-b border-[var(--ak-color-border-subtle)]">
                  <th className="px-6 py-3 font-medium">Kontakt</th>
                  <th className="px-6 py-3 font-medium">Typ</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Erteilt am</th>
                  <th className="px-6 py-3 font-medium">Abgelaufen am</th>
                  <th className="px-6 py-3 font-medium text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {consents.map((consent) => (
                  <tr key={consent.id} className="border-b border-white/5 hover:bg-[var(--ak-color-bg-surface)]/80">
                    <td className="px-6 py-4">
                      <div className="text-[var(--ak-color-text-inverted)]">user@example.com</div>
                      <div className="text-sm text-[var(--ak-color-text-secondary)]">+49 123 456789</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-xs bg-[var(--ak-semantic-info-soft)] text-[var(--ak-semantic-info)]">
                        {consent.consent_type.replace('marketing_', '')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={consent.consent_status} />
                    </td>
                    <td className="px-6 py-4 text-[var(--ak-color-text-secondary)] text-sm">
                      {consent.granted_at
                        ? new Date(consent.granted_at).toLocaleDateString('de-DE')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-[var(--ak-color-text-secondary)] text-sm">
                      {consent.expires_at
                        ? new Date(consent.expires_at).toLocaleDateString('de-DE')
                        : 'Nie'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 rounded hover:bg-[var(--ak-color-bg-surface)]/70 text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {consent.consent_status === 'granted' && (
                          <button className="p-1.5 rounded hover:bg-[var(--ak-semantic-danger-soft)] text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-semantic-danger)] transition-colors">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Ausstehend', count: 3, tone: 'warning' },
              { label: 'In Bearbeitung', count: 5, tone: 'info' },
              { label: 'Abgeschlossen', count: 12, tone: 'success' },
              { label: 'Abgelehnt', count: 1, tone: 'danger' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[var(--ak-color-bg-surface)]/80 rounded-lg p-4">
                <div className={`text-2xl font-bold text-[var(--ak-semantic-${stat.tone})]`}>{stat.count}</div>
                <div className="text-sm text-[var(--ak-color-text-secondary)]">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Requests List */}
          <div className="bg-[var(--ak-color-bg-surface)]/80 rounded-xl border border-[var(--ak-color-border-subtle)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-[var(--ak-color-text-secondary)] border-b border-[var(--ak-color-border-subtle)]">
                  <th className="px-6 py-3 font-medium">Anfrage-ID</th>
                  <th className="px-6 py-3 font-medium">Typ</th>
                  <th className="px-6 py-3 font-medium">Anfragender</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Erstellt</th>
                  <th className="px-6 py-3 font-medium">Frist</th>
                  <th className="px-6 py-3 font-medium text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b border-white/5 hover:bg-[var(--ak-color-bg-surface)]/80">
                    <td className="px-6 py-4">
                      <code className="text-xs text-[var(--ak-color-text-secondary)]">{req.id.substring(0, 8)}...</code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-xs bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)]">
                        {getRequestTypeLabel(req.request_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--ak-color-text-inverted)]">{req.requester_email}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 text-[var(--ak-color-text-secondary)] text-sm">
                      {new Date(req.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[var(--ak-color-text-secondary)]" />
                        <span className="text-sm text-[var(--ak-color-text-secondary)]">
                          {new Date(req.deadline_at).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="px-3 py-1.5 rounded-lg bg-[var(--ak-semantic-info-soft)] text-[var(--ak-semantic-info)] hover:bg-[var(--ak-semantic-info)]/30 text-sm">
                          Bearbeiten
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'exports' && (
        <div className="space-y-4">
          <div className="bg-[var(--ak-color-bg-surface)]/80 rounded-xl border border-[var(--ak-color-border-subtle)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-[var(--ak-color-text-secondary)] border-b border-[var(--ak-color-border-subtle)]">
                  <th className="px-6 py-3 font-medium">Export-ID</th>
                  <th className="px-6 py-3 font-medium">Typ</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Größe</th>
                  <th className="px-6 py-3 font-medium">Erstellt</th>
                  <th className="px-6 py-3 font-medium">Läuft ab</th>
                  <th className="px-6 py-3 font-medium text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {exports.map((exp) => (
                  <tr key={exp.id} className="border-b border-white/5 hover:bg-[var(--ak-color-bg-surface)]/80">
                    <td className="px-6 py-4">
                      <code className="text-xs text-[var(--ak-color-text-secondary)]">{exp.id.substring(0, 8)}...</code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-xs bg-[var(--ak-semantic-info-soft)] text-[var(--ak-semantic-info)]">
                        {exp.export_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={exp.status} />
                    </td>
                    <td className="px-6 py-4 text-[var(--ak-color-text-secondary)] text-sm">
                      {exp.file_size_bytes
                        ? `${(exp.file_size_bytes / 1024).toFixed(1)} KB`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-[var(--ak-color-text-secondary)] text-sm">
                      {new Date(exp.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 text-[var(--ak-color-text-secondary)] text-sm">
                      {new Date(exp.expires_at).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {exp.status === 'completed' && (
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)] hover:bg-[var(--ak-semantic-success-soft-dark)] text-sm transition-colors">
                          <Download className="w-4 h-4" />
                          Herunterladen
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && privacySettings && (
        <div className="space-y-6">
          {/* Consent Settings */}
          <div className="bg-[var(--ak-color-bg-surface)]/80 rounded-xl border border-[var(--ak-color-border-subtle)] p-6">
            <h3 className="text-lg font-semibold text-[var(--ak-color-text-inverted)] mb-4">Einwilligungs-Einstellungen</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-[var(--ak-color-text-inverted)]">Explizite Einwilligung erforderlich</div>
                  <div className="text-sm text-[var(--ak-color-text-secondary)]">
                    Kontakte müssen aktiv zustimmen
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.require_explicit_consent}
                    onChange={(e) =>
                      setPrivacySettings({ ...privacySettings, require_explicit_consent: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--ak-color-bg-surface-muted-dark)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--ak-semantic-info)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--ak-color-text-inverted)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--ak-color-text-inverted)] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--ak-semantic-info)]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-[var(--ak-color-text-inverted)]">Double Opt-In</div>
                  <div className="text-sm text-[var(--ak-color-text-secondary)]">
                    Bestätigungs-E-Mail senden
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.require_double_opt_in}
                    onChange={(e) =>
                      setPrivacySettings({ ...privacySettings, require_double_opt_in: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--ak-color-bg-surface-muted-dark)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--ak-semantic-info)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--ak-color-text-inverted)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--ak-color-text-inverted)] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--ak-semantic-info)]"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">
                  Einwilligung läuft ab nach (Tage)
                </label>
                <input
                  type="number"
                  value={privacySettings.consent_expires_days || ''}
                  onChange={(e) =>
                    setPrivacySettings({
                      ...privacySettings,
                      consent_expires_days: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="Nie (leer lassen)"
                  className="w-full px-4 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-inverted)] placeholder:text-[var(--ak-color-text-muted)]"
                />
              </div>
            </div>
          </div>

          {/* Data Retention */}
          <div className="bg-[var(--ak-color-bg-surface)]/80 rounded-xl border border-[var(--ak-color-border-subtle)] p-6">
            <h3 className="text-lg font-semibold text-[var(--ak-color-text-inverted)] mb-4">Datenaufbewahrung</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">
                  Kontaktdaten (Tage)
                </label>
                <input
                  type="number"
                  value={privacySettings.contact_data_retention_days}
                  onChange={(e) =>
                    setPrivacySettings({
                      ...privacySettings,
                      contact_data_retention_days: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-inverted)]"
                />
                <div className="text-xs text-[var(--ak-color-text-muted)] mt-1">
                  Standard: 7 Jahre (2555 Tage)
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">
                  Gelöschte Daten Aufbewahrung (Tage)
                </label>
                <input
                  type="number"
                  value={privacySettings.deleted_data_retention_days}
                  onChange={(e) =>
                    setPrivacySettings({
                      ...privacySettings,
                      deleted_data_retention_days: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-inverted)]"
                />
                <div className="text-xs text-[var(--ak-color-text-muted)] mt-1">
                  Soft-Delete Aufbewahrungszeit vor endgültiger Löschung
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Policy */}
          <div className="bg-[var(--ak-color-bg-surface)]/80 rounded-xl border border-[var(--ak-color-border-subtle)] p-6">
            <h3 className="text-lg font-semibold text-[var(--ak-color-text-inverted)] mb-4">Datenschutzerklärung</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">
                  URL zur Datenschutzerklärung
                </label>
                <input
                  type="url"
                  value={privacySettings.privacy_policy_url || ''}
                  onChange={(e) =>
                    setPrivacySettings({ ...privacySettings, privacy_policy_url: e.target.value })
                  }
                  placeholder="https://example.com/privacy"
                  className="w-full px-4 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-inverted)] placeholder:text-[var(--ak-color-text-muted)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">
                  Version
                </label>
                <input
                  type="text"
                  value={privacySettings.privacy_policy_version || ''}
                  onChange={(e) =>
                    setPrivacySettings({ ...privacySettings, privacy_policy_version: e.target.value })
                  }
                  placeholder="1.0"
                  className="w-full px-4 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/80 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-inverted)] placeholder:text-[var(--ak-color-text-muted)]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="px-6 py-2 rounded-lg bg-[var(--ak-semantic-info)] hover:bg-[var(--ak-semantic-info-strong)] text-[var(--ak-color-text-inverted)] font-medium">
              Einstellungen speichern
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComplianceCenter

