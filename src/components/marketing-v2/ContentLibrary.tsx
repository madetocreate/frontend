'use client';

import { useState } from 'react';
import { AkButton } from '@/components/ui/AkButton';
import { AkBadge } from '@/components/ui/AkBadge';
import {
  MagnifyingGlassIcon,
  TrashIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { useContentLibrary } from '@/hooks/useContentLibrary';

const CHANNEL_ICONS: Record<string, string> = {
  linkedin: '💼',
  twitter: '🐦',
  instagram: '📷',
  facebook: '👥',
};

const STATUS_CONFIG: Record<string, { label: string; tone: 'muted' | 'accent' | 'success' | 'warning' }> = {
  draft: { label: 'Draft', tone: 'muted' },
  scheduled: { label: 'Geplant', tone: 'accent' },
  published: { label: 'Veröffentlicht', tone: 'success' },
  archived: { label: 'Archiviert', tone: 'muted' },
};

export function ContentLibrary() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterChannel, setFilterChannel] = useState<string>('');

  const { data: content, isLoading: loading, deleteContent, duplicateContent } = useContentLibrary({
    status: filterStatus || undefined,
    channel: filterChannel || undefined,
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Möchtest du diesen Post wirklich löschen?')) return;
    try {
      await deleteContent.mutateAsync(id);
    } catch (error) {
      // Error is handled in hook
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateContent.mutateAsync(id);
    } catch (error) {
      // Error is handled in hook
    }
  };

  const filteredContent = (content || []).filter((item) =>
    item.content.toLowerCase().includes(search.toLowerCase()) ||
    (item.title && item.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 max-w-md relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--ak-color-text-muted)]" />
          <input
            type="text"
            placeholder="Content durchsuchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
          >
            <option value="">Alle Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Geplant</option>
            <option value="published">Veröffentlicht</option>
            <option value="archived">Archiviert</option>
          </select>

          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="px-4 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
          >
            <option value="">Alle Kanäle</option>
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">Twitter</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
          </select>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ak-color-accent)]"></div>
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[var(--ak-color-text-secondary)] mb-4">
            {search ? 'Keine Posts gefunden' : 'Noch keine Posts erstellt'}
          </p>
          <AkButton variant="primary" size="sm">
            Ersten Post erstellen
          </AkButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContent.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-color-accent)] transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{CHANNEL_ICONS[item.channel] || '📄'}</span>
                  <AkBadge tone={STATUS_CONFIG[item.status]?.tone || 'muted'} size="sm">
                    {STATUS_CONFIG[item.status]?.label || item.status}
                  </AkBadge>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDuplicate(item.id)}
                    className="p-1.5 rounded-lg hover:bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]"
                    title="Duplizieren"
                    disabled={duplicateContent.isPending}
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg hover:bg-[var(--ak-semantic-danger-soft)] text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-semantic-danger)]"
                    title="Löschen"
                    disabled={deleteContent.isPending}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Title */}
              {item.title && (
                <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)] mb-2 line-clamp-1">
                  {item.title}
                </h3>
              )}

              {/* Content Preview */}
              <p className="text-sm text-[var(--ak-color-text-secondary)] line-clamp-3 mb-3">
                {item.content}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-[var(--ak-color-text-muted)]">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>
                    {item.scheduled_at
                      ? new Date(item.scheduled_at).toLocaleDateString('de-DE')
                      : new Date(item.created_at).toLocaleDateString('de-DE')}
                  </span>
                </div>
                <span>{item.content.length} Zeichen</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
