'use client'

import { useState } from 'react'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { CalendarIcon, PaperAirplaneIcon, PhotoIcon } from '@heroicons/react/24/outline'

type SocialMediaPostEditorProps = {
  campaignId?: string
  onSave?: (post: { id: string }) => void
  onCancel?: () => void
}

const CHANNELS = [
  { id: 'instagram', label: 'Instagram', icon: '📷' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'facebook', label: 'Facebook', icon: '👥' },
  { id: 'twitter', label: 'Twitter', icon: '🐦' },
]

export function SocialMediaPostEditor({ campaignId, onSave, onCancel }: SocialMediaPostEditorProps) {
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['instagram'])
  const [content, setContent] = useState('')
  const [scheduledAt, setScheduledAt] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const handleChannelToggle = (channelId: string) => {
    if (selectedChannels.includes(channelId)) {
      setSelectedChannels(selectedChannels.filter(c => c !== channelId))
    } else {
      setSelectedChannels([...selectedChannels, channelId])
    }
  }

  const handleSave = async () => {
    if (!content.trim()) {
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'Bitte gib einen Inhalt ein' }
        })
      )
      return
    }

    if (selectedChannels.length === 0) {
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'Bitte wähle mindestens einen Kanal aus' }
        })
      )
      return
    }

    try {
      setSaving(true)
      
      // Import authedFetch once outside the map
      const { authedFetch } = await import('@/lib/api/authedFetch')
      
      // Create posts for each selected channel
      const promises = selectedChannels.map((channel) =>
        authedFetch('/api/social-media/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaign_id: campaignId,
            content_type: 'post',
            channel,
            content,
            status: scheduledAt ? 'scheduled' : 'draft',
            scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
          }),
        })
      )

      const results = await Promise.all(promises)
      const successful = results.filter(r => r.ok)

      if (successful.length > 0) {
        window.dispatchEvent(
          new CustomEvent('aklow-notification', {
            detail: { type: 'success', message: `${successful.length} Post(s) erfolgreich erstellt` }
          })
        )
        if (onSave) {
          const data = await successful[0].json()
          onSave(data)
        }
        // Reset form
        setContent('')
        setScheduledAt('')
      } else {
        throw new Error('Fehler beim Erstellen der Posts')
      }
    } catch (err) {
      console.error('Error creating posts:', err)
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'Fehler beim Erstellen der Posts' }
        })
      )
    } finally {
      setSaving(false)
    }
  }

  const characterCount = content.length
  const maxLength = 280 // Twitter limit (most restrictive)

  return (
    <div className="space-y-6 p-6 bg-[var(--ak-color-bg-surface)] rounded-2xl border border-[var(--ak-color-border-subtle)]">
      <div>
        <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)] mb-2">
          Social Media Post erstellen
        </h3>
        <p className="text-sm text-[var(--ak-color-text-secondary)]">
          Erstelle einen Post für einen oder mehrere Kanäle
        </p>
      </div>

      {/* Channel Selection */}
      <div>
        <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">
          Kanäle auswählen
        </label>
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map(channel => (
            <button
              key={channel.id}
              type="button"
              onClick={() => handleChannelToggle(channel.id)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                selectedChannels.includes(channel.id)
                  ? 'border-[var(--ak-color-accent)] bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)]'
                  : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:border-[var(--ak-color-border-strong)]'
              }`}
            >
              <span className="mr-2">{channel.icon}</span>
              {channel.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Editor */}
      <div>
        <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">
          Inhalt
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          maxLength={maxLength}
          className="w-full px-4 py-3 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)] resize-none"
          placeholder="Was möchtest du teilen?"
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 text-xs text-[var(--ak-color-text-muted)]">
            <PhotoIcon className="h-4 w-4" />
            <span>Bild-Upload kommt bald</span>
          </div>
          <span className={`text-xs ${
            characterCount > maxLength * 0.9 
              ? 'text-[var(--ak-semantic-danger)]' 
              : 'text-[var(--ak-color-text-muted)]'
          }`}>
            {characterCount} / {maxLength}
          </span>
        </div>
      </div>

      {/* Scheduling */}
      <div>
        <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-2">
          Veröffentlichung
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="publish-type"
              checked={!scheduledAt}
              onChange={() => setScheduledAt('')}
              className="text-[var(--ak-color-accent)]"
            />
            <span className="text-sm text-[var(--ak-color-text-primary)]">Sofort veröffentlichen</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="publish-type"
              checked={!!scheduledAt}
              onChange={() => {
                if (!scheduledAt) {
                  const now = new Date()
                  now.setMinutes(now.getMinutes() + 30) // Default: 30 minutes from now
                  setScheduledAt(now.toISOString().slice(0, 16))
                }
              }}
              className="text-[var(--ak-color-accent)]"
            />
            <span className="text-sm text-[var(--ak-color-text-primary)]">Planen</span>
          </label>
        </div>
        {scheduledAt && (
          <div className="mt-3">
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--ak-color-border-subtle)]">
        {onCancel && (
          <AkButton variant="ghost" onClick={onCancel} disabled={saving}>
            Abbrechen
          </AkButton>
        )}
        <AkButton
          variant="primary"
          onClick={handleSave}
          disabled={saving || !content.trim() || selectedChannels.length === 0}
          leftIcon={scheduledAt ? <CalendarIcon className="h-4 w-4" /> : <PaperAirplaneIcon className="h-4 w-4" />}
        >
          {saving 
            ? 'Speichere...' 
            : scheduledAt 
              ? 'Planen' 
              : 'Veröffentlichen'}
        </AkButton>
      </div>
    </div>
  )
}

