'use client'

import { useState } from 'react'
import clsx from 'clsx'
import {
  Cog6ToothIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  BellIcon,
} from '@heroicons/react/24/outline'

type NotificationsSettingsDrawerProps = {
  onClose?: () => void
  onSave?: (settings: NotificationSettings) => void
  onCancel?: () => void
}

export type NotificationSettings = {
  channels: {
    email: boolean
    telegram: boolean
    inapp: boolean
  }
  cats: {
    newInbox: boolean
    important: boolean
    routineDone: boolean
    connectionError: boolean
    weeklyDigest: boolean
  }
  options: {
    quietStart: string
    quietEnd: string
    onlyImportant: boolean
  }
  examples: Array<{
    id: string
    icon: string
    text: string
  }>
}

const DEFAULT_SETTINGS: NotificationSettings = {
  channels: {
    email: true,
    telegram: false,
    inapp: true,
  },
  cats: {
    newInbox: true,
    important: true,
    routineDone: true,
    connectionError: true,
    weeklyDigest: true,
  },
  options: {
    quietStart: '',
    quietEnd: '',
    onlyImportant: false,
  },
  examples: [
    { id: 'ex1', icon: 'mobile', text: 'Neue Anfrage → In‑App' },
    { id: 'ex2', icon: 'mail', text: 'Wöchentliche Zusammenfassung → E‑Mail' },
    { id: 'ex3', icon: 'globe', text: 'Verbindungsfehler → Telegram' },
  ],
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  mobile: DevicePhoneMobileIcon,
  mail: EnvelopeIcon,
  globe: BellIcon,
}

export function NotificationsSettingsDrawer({
  onClose,
  onSave,
  onCancel,
}: NotificationsSettingsDrawerProps) {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave?.(settings)
    onClose?.()
  }

  const handleCancel = () => {
    onCancel?.()
    onClose?.()
  }

  const updateChannels = (key: keyof NotificationSettings['channels'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      channels: { ...prev.channels, [key]: value },
    }))
  }

  const updateCats = (key: keyof NotificationSettings['cats'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      cats: { ...prev.cats, [key]: value },
    }))
  }

  const updateOptions = (key: keyof NotificationSettings['options'], value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      options: { ...prev.options, [key]: value },
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
          <Cog6ToothIcon className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex flex-col gap-0">
          <h2 className="ak-heading text-base">Benachrichtigungen</h2>
          <p className="ak-caption text-[var(--ak-color-text-muted)]">
            Wann & wo Aklow dich pingt.
          </p>
        </div>
      </div>

      {/* Kanäle */}
      <div className="flex flex-col gap-2">
        <p className="ak-caption font-semibold text-[var(--ak-color-text-primary)]">Kanäle</p>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.channels.email}
              onChange={(e) => updateChannels('email', e.target.checked)}
              className="h-4 w-4 rounded border-[var(--ak-color-border-subtle)] text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="ak-body text-sm">E‑Mail</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.channels.telegram}
              onChange={(e) => updateChannels('telegram', e.target.checked)}
              className="h-4 w-4 rounded border-[var(--ak-color-border-subtle)] text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="ak-body text-sm">Telegram</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.channels.inapp}
              onChange={(e) => updateChannels('inapp', e.target.checked)}
              className="h-4 w-4 rounded border-[var(--ak-color-border-subtle)] text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="ak-body text-sm">In‑App</span>
          </label>
        </div>
      </div>

      {/* Kategorien */}
      <div className="flex flex-col gap-2">
        <p className="ak-caption font-semibold text-[var(--ak-color-text-primary)]">Kategorien</p>
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.cats.newInbox}
              onChange={(e) => updateCats('newInbox', e.target.checked)}
              className="h-4 w-4 rounded border-[var(--ak-color-border-subtle)] text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="ak-body text-sm">Neue Anfrage</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.cats.important}
              onChange={(e) => updateCats('important', e.target.checked)}
              className="h-4 w-4 rounded border-[var(--ak-color-border-subtle)] text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="ak-body text-sm">Wichtig/Dringend</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.cats.routineDone}
              onChange={(e) => updateCats('routineDone', e.target.checked)}
              className="h-4 w-4 rounded border-[var(--ak-color-border-subtle)] text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="ak-body text-sm">Routine fertig</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.cats.connectionError}
              onChange={(e) => updateCats('connectionError', e.target.checked)}
              className="h-4 w-4 rounded border-[var(--ak-color-border-subtle)] text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="ak-body text-sm">Verbindungsfehler</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.cats.weeklyDigest}
              onChange={(e) => updateCats('weeklyDigest', e.target.checked)}
              className="h-4 w-4 rounded border-[var(--ak-color-border-subtle)] text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="ak-body text-sm">Wöchentliche Zusammenfassung</span>
          </label>
        </div>
      </div>

      {/* Optionen */}
      <div className="flex flex-col gap-2">
        <p className="ak-caption font-semibold text-[var(--ak-color-text-primary)]">Optionen</p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.options.onlyImportant}
            onChange={(e) => updateOptions('onlyImportant', e.target.checked)}
            className="h-4 w-4 rounded border-[var(--ak-color-border-subtle)] text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
          <span className="ak-body text-sm">Nur Wichtiges</span>
        </label>
        <div className="flex items-center gap-2">
          <label className="ak-body text-sm text-[var(--ak-color-text-primary)]">Ruhezeiten</label>
          <input
            type="text"
            placeholder="Start z. B. 22:00"
            value={settings.options.quietStart}
            onChange={(e) => updateOptions('quietStart', e.target.value)}
            pattern="^(?:[01]\d|2[0-3]):[0-5]\d$"
            className="flex-1 rounded-md border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="ak-body text-sm text-[var(--ak-color-text-secondary)]">—</span>
          <input
            type="text"
            placeholder="Ende z. B. 07:00"
            value={settings.options.quietEnd}
            onChange={(e) => updateOptions('quietEnd', e.target.value)}
            pattern="^(?:[01]\d|2[0-3]):[0-5]\d$"
            className="flex-1 rounded-md border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="ak-caption text-xs text-[var(--ak-color-text-muted)]">
          Optional. In Ruhezeiten bleibt Aklow leise.
        </p>
      </div>

      <div className="h-px bg-[var(--ak-color-border-subtle)]" />

      {/* Beispiele */}
      <div className="flex flex-col gap-2 rounded-md bg-[var(--ak-color-bg-surface-muted)] p-3">
        <p className="ak-caption font-semibold text-[var(--ak-color-text-primary)]">Beispiele</p>
        {settings.examples.map((example) => {
          const IconComponent = ICON_MAP[example.icon] || BellIcon
          return (
            <div key={example.id} className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-[var(--ak-color-bg-surface)]">
                <IconComponent className="h-4 w-4 text-[var(--ak-color-text-secondary)]" />
              </div>
              <span className="ak-body text-sm">{example.text}</span>
            </div>
          )
        })}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 rounded-md border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] px-4 py-2 text-sm font-medium text-[var(--ak-color-text-primary)] transition-colors hover:bg-[var(--ak-color-bg-hover)]"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Speichern
        </button>
      </div>
    </form>
  )
}

