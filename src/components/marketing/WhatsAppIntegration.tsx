'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Plus,
  Settings,
  Send,
  Users,
  Clock,
  AlertCircle,
  Phone,
  Shield,
  ChevronRight,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
} from 'lucide-react'

interface WhatsAppAccount {
  id: string
  account_name: string
  phone_number: string
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification'
  verified_at?: string
  opt_in_required: boolean
}

interface WhatsAppContact {
  id: string
  phone_number: string
  opted_in: boolean
  opted_in_at?: string
  status: 'pending' | 'verified' | 'blocked' | 'invalid'
}

interface WhatsAppTemplate {
  id: string
  template_name: string
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
  status: 'pending' | 'approved' | 'rejected' | 'paused'
  body_text: string
  used_count: number
}

interface WhatsAppIntegrationProps {
  tenantId: string
}

export function WhatsAppIntegration({ tenantId }: WhatsAppIntegrationProps) {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([])
  const [contacts, setContacts] = useState<WhatsAppContact[]>([])
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [loading, setLoading] = useState(false)

  const account = accounts.find((a) => a.id === selectedAccount)

  useEffect(() => {
    // Load accounts
    loadAccounts()
  }, [tenantId])

  const loadAccounts = async () => {
    try {
      // TODO: API call
      setAccounts([
        {
          id: 'demo-1',
          account_name: 'Haupt-Account',
          phone_number: '+491234567890',
          status: 'active',
          verified_at: new Date().toISOString(),
          opt_in_required: true,
        },
      ])
      setSelectedAccount('demo-1')
    } catch (error) {
      console.error('Failed to load accounts:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--ak-color-text-primary)]">WhatsApp Business</h2>
          <p className="text-[var(--ak-color-text-secondary)] mt-1">
            Verwalte deine WhatsApp Business Accounts und Kontakte
          </p>
        </div>
        <button
          onClick={() => setShowAddAccount(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--ak-semantic-success)] hover:bg-[var(--ak-semantic-success-strong)] text-[var(--ak-color-text-inverted)] font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Account hinzufügen
        </button>
      </div>

      {/* Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <motion.div
            key={acc.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedAccount(acc.id)}
            className={`
              p-6 rounded-xl border-2 cursor-pointer transition-all
              ${
                selectedAccount === acc.id
                  ? 'border-[var(--ak-semantic-success)] bg-[var(--ak-semantic-success-soft)]'
                  : 'border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] hover:border-[var(--ak-color-accent)]'
              }
            `}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[var(--ak-semantic-success-soft)] flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-[var(--ak-semantic-success)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--ak-color-text-primary)]">{acc.account_name}</h3>
                  <p className="text-sm text-[var(--ak-color-text-secondary)]">{acc.phone_number}</p>
                </div>
              </div>
              {acc.status === 'active' ? (
                <CheckCircle2 className="w-5 h-5 text-[var(--ak-semantic-success)]" />
              ) : (
                <XCircle className="w-5 h-5 text-[var(--ak-color-text-muted)]" />
              )}
            </div>
              <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${
                        acc.status === 'active'
                          ? 'bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)]'
                          : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-muted)]'
                      }
                    `}
                  >
                {acc.status === 'active' ? 'Aktiv' : 'Inaktiv'}
              </span>
                  {acc.verified_at && (
                    <span className="text-[var(--ak-color-text-secondary)] text-xs">
                      Verifiziert
                    </span>
                  )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Account Details */}
      {account && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--ak-color-bg-surface)]/90 rounded-xl border border-[var(--ak-color-border-subtle)] p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[var(--ak-color-text-primary)]">{account.account_name}</h3>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg bg-[var(--ak-color-bg-surface)]/70 hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg bg-[var(--ak-color-bg-surface)]/70 hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] transition-colors">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-[var(--ak-color-border-subtle)] mb-6">
            {['Übersicht', 'Kontakte', 'Templates', 'Nachrichten'].map((tab) => (
              <button
                key={tab}
                className="px-4 py-2 text-sm font-medium text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] border-b-2 border-transparent hover:border-[var(--ak-semantic-success)] transition-colors"
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[var(--ak-color-bg-surface)]/70 rounded-lg p-4">
            <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">1,234</div>
            <div className="text-sm text-[var(--ak-color-text-secondary)]">Kontakte</div>
            </div>
            <div className="bg-[var(--ak-color-bg-surface)]/70 rounded-lg p-4">
            <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">856</div>
            <div className="text-sm text-[var(--ak-color-text-secondary)]">Opt-in</div>
            </div>
            <div className="bg-[var(--ak-color-bg-surface)]/70 rounded-lg p-4">
            <div className="text-2xl font-bold text-[var(--ak-color-text-primary)]">12</div>
            <div className="text-sm text-[var(--ak-color-text-secondary)]">Templates</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center gap-3 p-4 rounded-lg bg-[var(--ak-color-bg-surface)]/70 border border-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-hover)] transition-colors">
              <Users className="w-5 h-5 text-[var(--ak-semantic-success)]" />
              <div className="text-left">
                <div className="font-medium text-[var(--ak-color-text-primary)]">Kontakt hinzufügen</div>
                <div className="text-sm text-[var(--ak-color-text-secondary)]">Neue WhatsApp-Nummer</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--ak-color-text-secondary)] ml-auto" />
            </button>
            <button className="flex items-center gap-3 p-4 rounded-lg bg-[var(--ak-color-bg-surface)]/70 border border-[var(--ak-color-border-subtle)] hover:bg-[var(--ak-color-bg-hover)] transition-colors">
              <Send className="w-5 h-5 text-[var(--ak-semantic-success)]" />
              <div className="text-left">
                <div className="font-medium text-[var(--ak-color-text-primary)]">Nachricht senden</div>
                <div className="text-sm text-[var(--ak-color-text-secondary)]">Direktnachricht</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--ak-color-text-secondary)] ml-auto" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Add Account Modal */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--ak-color-bg-surface)]/90 rounded-xl border border-[var(--ak-color-border-subtle)] p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[var(--ak-color-text-primary)]">WhatsApp Account hinzufügen</h3>
              <button
                onClick={() => setShowAddAccount(false)}
                className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-surface)]/40 text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">
                  Account-Name
                </label>
                  <input
                    type="text"
                    placeholder="z.B. Haupt-Account"
                    className="w-full px-4 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/70 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-semantic-success)]/50"
                  />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">
                  Telefonnummer (E.164)
                </label>
                  <input
                    type="tel"
                    placeholder="+491234567890"
                    className="w-full px-4 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/70 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-semantic-success)]/50"
                  />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">
                  Business Account ID
                </label>
                <input
                  type="text"
                  placeholder="WhatsApp Business API Account ID"
                  className="w-full px-4 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/70 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-semantic-success)]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">
                  API Token
                </label>
                <input
                  type="password"
                  placeholder="WhatsApp API Token"
                  className="w-full px-4 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/70 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-semantic-success)]/50"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="opt-in-required"
                  defaultChecked
                  className="w-4 h-4 rounded bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-semantic-success)] focus:ring-[var(--ak-semantic-success)]"
                />
                <label htmlFor="opt-in-required" className="text-sm text-[var(--ak-color-text-secondary)]">
                  Opt-in erforderlich (empfohlen)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowAddAccount(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/70 hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)] transition-colors"
              >
                  Abbrechen
                </button>
              <button className="flex-1 px-4 py-2 rounded-lg bg-[var(--ak-semantic-success)] hover:bg-[var(--ak-semantic-success-strong)] text-[var(--ak-color-text-inverted)] font-medium transition-colors">
                  Account erstellen
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default WhatsAppIntegration

