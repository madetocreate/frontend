'use client'

import { useState, useEffect } from 'react'
import {
  BoltIcon,
  SignalIcon,
  MicrophoneIcon,
  DocumentIcon,
  FaceSmileIcon,
  UserGroupIcon,
  BellIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import {
  appleCardStyle,
  appleSectionTitle,
  appleSubTitle,
  appleGroupedList,
  appleListItem,
  appleButtonStyle,
  appleInputStyle,
  appleAnimationFadeInUp
} from '@/lib/appleDesign'

interface TelegramConfig {
  autoReplyEnabled: boolean
  autoReplyMode: 'suggest_only' | 'auto_reply'
  groupsEnabled: boolean
  streamingEnabled: boolean
  ttsEnabled: boolean
  attachmentsEnabled: boolean
  reactionsEnabled: boolean
  notificationsEnabled: boolean
  welcomeMessage: string
  businessHoursEnabled: boolean
  businessHoursStart: string
  businessHoursEnd: string
}

export function TelegramConfiguration() {
  const [config, setConfig] = useState<TelegramConfig>({
    autoReplyEnabled: false,
    autoReplyMode: 'suggest_only',
    groupsEnabled: false,
    streamingEnabled: false,
    ttsEnabled: false,
    attachmentsEnabled: false,
    reactionsEnabled: false,
    notificationsEnabled: true,
    welcomeMessage: '',
    businessHoursEnabled: false,
    businessHoursStart: '09:00',
    businessHoursEnd: '17:00',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
      const response = await fetch(`${backendUrl}/integrations/telegram/config`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setConfig(data.config || config)
      }
    } catch (error) {
      console.error('Failed to load Telegram config:', error)
    }
    setLoading(false)
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
      const response = await fetch(`${backendUrl}/integrations/telegram/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ config }),
      })

      if (response.ok) {
        alert('✅ Konfiguration gespeichert!')
      } else {
        alert('❌ Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Failed to save Telegram config:', error)
      alert('❌ Fehler beim Speichern: ' + (error instanceof Error ? error.message : 'Unknown'))
    }
    setSaving(false)
  }

  const updateConfig = (key: keyof TelegramConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const ToggleItem = ({ 
    label, 
    description, 
    icon: Icon, 
    checked, 
    onChange 
  }: { 
    label: string, 
    description: string, 
    icon: any, 
    checked: boolean, 
    onChange: (checked: boolean) => void 
  }) => (
    <div className={appleListItem}>
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">{label}</p>
          <p className="text-xs text-[var(--ak-color-text-secondary)]">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-[var(--ak-color-bg-surface-muted)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--ak-color-bg-surface)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--ak-color-bg-surface)] after:border-[var(--ak-color-border-subtle)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--ak-color-accent)] transition-colors duration-200"></div>
      </label>
    </div>
  )

  return (
    <div className={`space-y-8 ${appleAnimationFadeInUp}`}>
      {/* Header */}
      <div>
        <h2 className={appleSectionTitle}>
          Bot-Konfiguration
        </h2>
        <p className={`${appleSubTitle} mt-1`}>
          Passen Sie das Verhalten Ihres Telegram-Bots an
        </p>
      </div>

      <div className="space-y-6">
        {/* Automatisierung */}
        <section>
          <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)] mb-3 px-1">
            Automatisierung
          </h3>
          <div className={appleGroupedList}>
            <ToggleItem
              label="Automatische Antworten"
              description="Bot antwortet automatisch auf Nachrichten"
              icon={BoltIcon}
              checked={config.autoReplyEnabled}
              onChange={(checked) => updateConfig('autoReplyEnabled', checked)}
            />

            {/* Auto-Reply Mode */}
            {config.autoReplyEnabled && (
              <div className={appleListItem}>
                <div className="flex items-center gap-4 pl-12">
                  <div>
                    <p className="text-sm font-medium text-[var(--ak-color-text-primary)]">Antwort-Modus</p>
                    <p className="text-xs text-[var(--ak-color-text-secondary)]">Vorschläge oder automatisch senden</p>
                  </div>
                </div>
                <select
                  value={config.autoReplyMode}
                  onChange={(e) => updateConfig('autoReplyMode', e.target.value as 'suggest_only' | 'auto_reply')}
                  className="bg-transparent text-sm font-medium text-[var(--ak-color-text-primary)] focus:outline-none cursor-pointer text-right pr-2"
                >
                  <option value="suggest_only">Vorschläge</option>
                  <option value="auto_reply">Automatisch</option>
                </select>
              </div>
            )}

            <ToggleItem
              label="In Gruppen antworten"
              description="Auch in Gruppenchats aktiv sein"
              icon={UserGroupIcon}
              checked={config.groupsEnabled}
              onChange={(checked) => updateConfig('groupsEnabled', checked)}
            />
          </div>
        </section>

        {/* Features */}
        <section>
          <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)] mb-3 px-1">
            Funktionen
          </h3>
          <div className={appleGroupedList}>
            <ToggleItem
              label="Streaming Antworten"
              description="Antworten werden progressiv aktualisiert"
              icon={SignalIcon}
              checked={config.streamingEnabled}
              onChange={(checked) => updateConfig('streamingEnabled', checked)}
            />
            <ToggleItem
              label="Sprachnachrichten"
              description="Voice Messages transkribieren und TTS"
              icon={MicrophoneIcon}
              checked={config.ttsEnabled}
              onChange={(checked) => updateConfig('ttsEnabled', checked)}
            />
            <ToggleItem
              label="Anhänge verarbeiten"
              description="Fotos und Dokumente hochladen"
              icon={DocumentIcon}
              checked={config.attachmentsEnabled}
              onChange={(checked) => updateConfig('attachmentsEnabled', checked)}
            />
            <ToggleItem
              label="Reaction Buttons"
              description="Like/Dislike Buttons für Feedback"
              icon={FaceSmileIcon}
              checked={config.reactionsEnabled}
              onChange={(checked) => updateConfig('reactionsEnabled', checked)}
            />
          </div>
        </section>

        {/* Settings */}
        <section>
          <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)] mb-3 px-1">
            Einstellungen
          </h3>
          <div className={appleGroupedList}>
            <ToggleItem
              label="Benachrichtigungen"
              description="Email bei neuen Nachrichten"
              icon={BellIcon}
              checked={config.notificationsEnabled}
              onChange={(checked) => updateConfig('notificationsEnabled', checked)}
            />
            <ToggleItem
              label="Geschäftszeiten"
              description="Bot antwortet nur zu bestimmten Zeiten"
              icon={ClockIcon}
              checked={config.businessHoursEnabled}
              onChange={(checked) => updateConfig('businessHoursEnabled', checked)}
            />
            
            {config.businessHoursEnabled && (
              <div className={`${appleListItem} bg-[var(--ak-surface-1)]/40`}>
                <div className="w-full flex items-center gap-4 pl-12 pr-2">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-[var(--ak-color-text-secondary)] mb-1 block">
                      Von
                    </label>
                    <input
                      type="time"
                      value={config.businessHoursStart}
                      onChange={(e) => updateConfig('businessHoursStart', e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-[var(--ak-color-text-primary)] focus:outline-none"
                    />
                  </div>
                  <div className="flex-1 text-right">
                    <label className="text-xs font-medium text-[var(--ak-color-text-secondary)] mb-1 block">
                      Bis
                    </label>
                    <input
                      type="time"
                      value={config.businessHoursEnd}
                      onChange={(e) => updateConfig('businessHoursEnd', e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-[var(--ak-color-text-primary)] focus:outline-none text-right"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Welcome Message */}
        <section>
          <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)] mb-3 px-1">
            Willkommensnachricht
          </h3>
          <div className={`${appleCardStyle} p-4`}>
            <textarea
              value={config.welcomeMessage}
              onChange={(e) => updateConfig('welcomeMessage', e.target.value)}
              placeholder="Hallo! Willkommen in unserem Support-Chat. Wie kann ich Ihnen helfen?"
              rows={4}
              className={`${appleInputStyle} resize-none border-none bg-transparent focus:ring-0 px-0 py-0`}
            />
          </div>
        </section>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={() => void saveConfig()}
          disabled={saving}
          className={appleButtonStyle.primary}
        >
          {saving ? 'Speichert...' : 'Konfiguration speichern'}
        </button>
      </div>
    </div>
  )
}

