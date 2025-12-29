'use client';

import { useState } from 'react';
import { AkButton } from '@/components/ui/AkButton';
import {
  CalendarIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  SparklesIcon,
  FireIcon,
  UserCircleIcon,
  ArrowPathRoundedSquareIcon,
} from '@heroicons/react/24/outline';
import { startRun, type ActionRunEvent } from '@/lib/actionRuns/client';
import { 
  appleCardStyle, 
  appleSectionTitle, 
  appleInputStyle, 
  appleButtonStyle,
  appleAnimationFadeInUp
} from '@/lib/appleDesign';

const CHANNELS = [
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0A66C2', bgColor: 'bg-[#0A66C2]/10', borderColor: 'border-[#0A66C2]/30' },
  { id: 'twitter', label: 'Twitter', icon: '🐦', color: '#1DA1F2', bgColor: 'bg-[#1DA1F2]/10', borderColor: 'border-[#1DA1F2]/30' },
  { id: 'instagram', label: 'Instagram', icon: '📷', color: '#E4405F', bgColor: 'bg-[#E4405F]/10', borderColor: 'border-[#E4405F]/30' },
  { id: 'facebook', label: 'Facebook', icon: '👥', color: '#1877F2', bgColor: 'bg-[#1877F2]/10', borderColor: 'border-[#1877F2]/30' },
];

const CHARACTER_LIMITS = {
  linkedin: 3000,
  twitter: 280,
  instagram: 2200,
  facebook: 63206,
};

function toLocalDateTimeInputValue(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function ContentCreator() {
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['linkedin']);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'scheduled'>('draft');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [checkingVirality, setCheckingVirality] = useState(false);
  const [learningStyle, setLearningStyle] = useState(false);
  const [recycling, setRecycling] = useState(false);

  const handleChannelToggle = (channelId: string) => {
    if (selectedChannels.includes(channelId)) {
      setSelectedChannels(selectedChannels.filter((c) => c !== channelId));
    } else {
      setSelectedChannels([...selectedChannels, channelId]);
    }
  };

  const getMaxLength = () => {
    if (selectedChannels.length === 0) return 0;
    const limits = selectedChannels.map((ch) => CHARACTER_LIMITS[ch as keyof typeof CHARACTER_LIMITS]);
    return Math.min(...limits);
  };

  const handleSave = async (saveStatus: 'draft' | 'scheduled') => {
    if (!content.trim()) {
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'Bitte gib Content ein' },
        })
      );
      return;
    }

    if (selectedChannels.length === 0) {
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'Bitte wähle mindestens einen Kanal' },
        })
      );
      return;
    }

    if (saveStatus === 'scheduled' && !scheduledAt) {
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'Bitte wähle einen Zeitpunkt' },
        })
      );
      return;
    }

    try {
      setSaving(true);

      // Import authedFetch once outside the map
      const { authedFetch } = await import('@/lib/api/authedFetch');

      // Create content for each channel
      const promises = selectedChannels.map((channel) =>
        authedFetch('/api/marketing/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            title,
            channel,
            content_type: 'post',
            status: saveStatus,
            scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
          }),
        })
      );

      const results = await Promise.all(promises);
      const successful = results.filter((r) => r.ok);

      if (successful.length > 0) {
        window.dispatchEvent(
          new CustomEvent('aklow-notification', {
            detail: {
              type: 'success',
              message: `${successful.length} Post(s) erfolgreich ${saveStatus === 'draft' ? 'gespeichert' : 'geplant'}`,
            },
          })
        );
        // Reset form
        setContent('');
        setTitle('');
        setScheduledAt('');
      } else {
        throw new Error('Alle Requests fehlgeschlagen');
      }
    } catch (err) {
      console.error('Error creating posts:', err);
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'Fehler beim Erstellen der Posts' },
        })
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!title && !content) {
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'Bitte gib ein Thema oder Stichpunkte ein' },
        })
      );
      return;
    }

    try {
      setGenerating(true);
      const res = await startRun({
        actionId: 'marketing.generate_content',
        context: {
          module: 'marketing',
          moduleContext: {
            topic: title,
            description: content,
            channel: selectedChannels.join(', '),
          },
        },
      });

      if (res.status === 'completed' && res.result) {
        const aiContent = res.result.response || res.result.draft || (typeof res.result === 'string' ? res.result : '');
        if (aiContent) {
          setContent(aiContent as string);
          window.dispatchEvent(
            new CustomEvent('aklow-notification', {
              detail: { type: 'success', message: 'Content erfolgreich generiert' },
            })
          );
        }
      }
    } catch (error) {
      console.error('AI Generation failed:', error);
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'KI-Generierung fehlgeschlagen' },
        })
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!content && !title) {
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'Bitte gib ein Thema oder Content für das Bild ein' },
        })
      );
      return;
    }

    try {
      setGeneratingImage(true);
      const res = await startRun({
        actionId: 'marketing.generate_image',
        context: {
          module: 'marketing',
          moduleContext: {
            prompt: `Professional marketing image for: ${title || content}. High quality, clean composition.`,
            description: content,
          },
        },
      });

      if (res.status === 'completed' && res.result) {
        window.dispatchEvent(
          new CustomEvent('aklow-notification', {
            detail: { type: 'success', message: 'Bild erfolgreich generiert und in Mediathek gespeichert' },
          })
        );
      }
    } catch (error) {
      console.error('Image Generation failed:', error);
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'KI-Bildgenerierung fehlgeschlagen' },
        })
      );
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleCheckVirality = async () => {
    if (!content) {
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'Bitte erstelle zuerst einen Entwurf' },
        })
      );
      return;
    }

    try {
      setCheckingVirality(true);
      const res = await startRun({
        actionId: 'marketing.check_virality',
        context: {
          module: 'marketing',
          moduleContext: {
            content: content,
          },
        },
      });

      if (res.status === 'completed' && res.result) {
        // Ergebnis anzeigen (in einer echten App: Modal oder Sidebar)
        const resultData = res.result as any;
        const summary = resultData.summary || (typeof res.result === 'string' ? res.result : '');
        window.dispatchEvent(
          new CustomEvent('aklow-notification', {
            detail: { type: 'success', message: `Viralitäts-Check: ${summary.slice(0, 100)}...` },
          })
        );
      }
    } finally {
      setCheckingVirality(false);
    }
  };

  const handleLearnStyle = async () => {
    if (!content) {
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'Bitte gib Text als Beispiel ein' },
        })
      );
      return;
    }

    try {
      setLearningStyle(true);
      const res = await startRun({
        actionId: 'marketing.clone_style',
        context: {
          module: 'marketing',
          moduleContext: {
            samples: [content],
          },
        },
      });

      if (res.status === 'completed') {
        window.dispatchEvent(
          new CustomEvent('aklow-notification', {
            detail: { type: 'success', message: 'Stil erfolgreich gelernt!' },
          })
        );
      }
    } finally {
      setLearningStyle(false);
    }
  };

  const handleRecycleContent = async () => {
    if (!content) {
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'Bitte gib Text zum Recyceln ein' },
        })
      );
      return;
    }

    try {
      setRecycling(true);
      const res = await startRun({
        actionId: 'marketing.repurpose_content',
        context: {
          module: 'marketing',
          moduleContext: {
            content: content,
          },
        },
      });

      if (res.status === 'completed' && res.result) {
        const recycled = res.result.draft || (typeof res.result === 'string' ? res.result : '');
        // Append repurposed content
        setContent((prev) => prev + '\n\n--- RECYCLED ---\n\n' + recycled);
        window.dispatchEvent(
          new CustomEvent('aklow-notification', {
            detail: { type: 'success', message: 'Content erfolgreich recycelt!' },
          })
        );
      }
    } finally {
      setRecycling(false);
    }
  };

  const maxLength = getMaxLength();
  const characterCount = content.length;
  const isOverLimit = characterCount > maxLength;

  return (
    <div className={`max-w-4xl mx-auto space-y-8 ${appleAnimationFadeInUp}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={appleSectionTitle}>
          Neuer Post erstellen
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => void handleCheckVirality()}
            disabled={checkingVirality || !content}
            className={`${appleButtonStyle.secondary} flex items-center gap-2`}
          >
            <FireIcon className="h-4 w-4" />
            {checkingVirality ? 'Prüfe...' : 'Viralitäts-Check'}
          </button>
          <button
            onClick={() => void handleLearnStyle()}
            disabled={learningStyle || !content}
            className={`${appleButtonStyle.secondary} flex items-center gap-2`}
          >
            <UserCircleIcon className="h-4 w-4" />
            {learningStyle ? 'Lerne...' : 'Stil lernen'}
          </button>
          <button
            onClick={() => void handleRecycleContent()}
            disabled={recycling || !content}
            className={`${appleButtonStyle.secondary} flex items-center gap-2`}
          >
            <ArrowPathRoundedSquareIcon className="h-4 w-4" />
            {recycling ? 'Recyceln...' : 'Content Recycler'}
          </button>
          <button
            onClick={() => void handleGenerateImage()}
            disabled={generatingImage}
            className={`${appleButtonStyle.secondary} flex items-center gap-2`}
          >
            <PhotoIcon className="h-4 w-4" />
            {generatingImage ? 'Generiere Bild...' : 'KI-Bild erstellen'}
          </button>
          <button
            onClick={() => void handleAiGenerate()}
            disabled={generating}
            className={`${appleButtonStyle.secondary} flex items-center gap-2`}
          >
            <SparklesIcon className="h-4 w-4" />
            {generating ? 'Generiere...' : 'Mit AI generieren'}
          </button>
        </div>
      </div>

      {/* Main Editor Card */}
      <div className={`${appleCardStyle} p-8 space-y-8`}>
        {/* Channel Selection */}
        <div>
          <label className="block text-sm font-semibold text-[var(--ak-color-text-primary)] mb-4">
            Kanäle auswählen *
          </label>
          <div className="flex flex-wrap gap-3">
            {CHANNELS.map((channel) => (
              <button
                key={channel.id}
                type="button"
                onClick={() => handleChannelToggle(channel.id)}
                className={`px-5 py-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
                  selectedChannels.includes(channel.id)
                    ? `border-transparent ${channel.bgColor} text-[var(--ak-color-text-primary)] shadow-sm ring-1`
                    : 'border-[var(--ak-color-border-subtle)] bg-[var(--ak-surface-1)] text-[var(--ak-color-text-secondary)] hover:border-[var(--ak-color-border-strong)]'
                }`}
                style={selectedChannels.includes(channel.id) ? { color: channel.color, borderColor: channel.color, '--tw-ring-color': channel.color } as React.CSSProperties : {}}
              >
                <span className="text-xl">{channel.icon}</span>
                <span className="font-medium">{channel.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title (Optional) */}
        <div>
          <label className="block text-sm font-semibold text-[var(--ak-color-text-primary)] mb-2">
            Titel (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. Produkt-Launch Ankündigung"
            className={appleInputStyle}
          />
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-semibold text-[var(--ak-color-text-primary)] mb-2">
            Content *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder="Was möchtest du teilen?"
            className={`${appleInputStyle} resize-none`}
          />
          <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--ak-color-text-muted)]">
              <PhotoIcon className="h-4 w-4" />
              <span>Medien-Upload kommt bald</span>
            </div>
            <span
              className={`text-sm font-medium transition-colors ${
                isOverLimit
                  ? 'text-[var(--ak-semantic-danger)]'
                  : characterCount > maxLength * 0.9
                  ? 'text-[var(--ak-semantic-warning)]'
                  : 'text-[var(--ak-color-text-muted)]'
              }`}
            >
              {characterCount} / {maxLength}
            </span>
          </div>
          {isOverLimit && (
            <p className="text-xs text-[var(--ak-semantic-danger)] mt-2 font-medium">
              Content ist zu lang für {selectedChannels.map(ch => CHANNELS.find(c => c.id === ch)?.label).join(', ')}
            </p>
          )}
        </div>

        {/* Scheduling */}
        <div>
          <label className="block text-sm font-semibold text-[var(--ak-color-text-primary)] mb-3">
            Veröffentlichung
          </label>
          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="publish-type"
                checked={status === 'draft'}
                onChange={() => {
                  setStatus('draft');
                  setScheduledAt('');
                }}
                className="w-5 h-5 text-[var(--ak-color-accent)] focus:ring-[var(--ak-color-accent)]"
              />
              <span className="text-sm font-medium text-[var(--ak-color-text-primary)] group-hover:text-[var(--ak-color-accent)] transition-colors">Als Draft speichern</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="publish-type"
                checked={status === 'scheduled'}
                onChange={() => setStatus('scheduled')}
                className="w-5 h-5 text-[var(--ak-color-accent)] focus:ring-[var(--ak-color-accent)]"
              />
              <span className="text-sm font-medium text-[var(--ak-color-text-primary)] group-hover:text-[var(--ak-color-accent)] transition-colors">Planen</span>
            </label>
          </div>
          {status === 'scheduled' && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-200">
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={toLocalDateTimeInputValue(new Date())}
                className={`${appleInputStyle} max-w-md`}
            />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-[var(--ak-color-border-fine)]">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving || !content.trim() || isOverLimit}
            className={appleButtonStyle.ghost}
          >
            Als Draft speichern
          </button>
          <button
            onClick={() => handleSave(status)}
            disabled={saving || !content.trim() || selectedChannels.length === 0 || isOverLimit}
            className={`${appleButtonStyle.primary} flex items-center gap-2`}
          >
            {status === 'scheduled' ? (
              <CalendarIcon className="h-5 w-5" />
              ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
            {saving ? 'Speichere...' : status === 'scheduled' ? 'Planen' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}

