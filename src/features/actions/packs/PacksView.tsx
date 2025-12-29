'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FolderIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { AkListRow } from '@/components/ui/AkListRow';
import { AkEmptyState } from '@/components/ui/AkEmptyState';
import { ActionTemplate } from '../types';

// V1: Demo-first Packs aus actions_manifest metadata ableiten
// Später: Nutze /api/actions/manifest für echte Daten
interface Pack {
  id: string;
  label: string;
  description: string;
  templates: ActionTemplate[];
}

const DEMO_PACKS: Pack[] = [
  {
    id: 'request-reply',
    label: 'Anfrage → Antwort',
    description: 'Schnelle Antworten auf Kundenanfragen',
    templates: [
      { id: 'email-reply', categoryId: 'communication', title: 'E-Mail Antwort', description: 'Antworte auf eine E-Mail' },
      { id: 'telegram-message', categoryId: 'communication', title: 'Telegram Nachricht', description: 'Sende eine Nachricht' },
    ],
  },
  {
    id: 'reviews',
    label: 'Reviews',
    description: 'Review-Management und Antworten',
    templates: [
      { id: 'review-reply', categoryId: 'marketing', title: 'Review Antwort', description: 'Antworte auf eine Bewertung' },
    ],
  },
  {
    id: 'appointments',
    label: 'Termine',
    description: 'Terminplanung und Meetings',
    templates: [
      { id: 'schedule-meeting', categoryId: 'ops', title: 'Termin planen', description: 'Plane einen Termin' },
    ],
  },
  {
    id: 'organization',
    label: 'Organisation',
    description: 'Aufgaben und To-Dos',
    templates: [
      { id: 'todo-list', categoryId: 'ops', title: 'To-Do Liste', description: 'Erstelle eine To-Do Liste' },
      { id: 'task-assignment', categoryId: 'ops', title: 'Aufgabe zuordnen', description: 'Weise eine Aufgabe zu' },
    ],
  },
];

export function PacksView() {
  const router = useRouter();

  const handlePackClick = (pack: Pack) => {
    // Navigate to first template or pack overview
    if (pack.templates.length > 0) {
      router.push(`/actions?cat=packs&pack=${pack.id}&id=${pack.templates[0].id}`);
    } else {
      router.push(`/actions?cat=packs&pack=${pack.id}`);
    }
  };

  return (
    <div className="h-full overflow-y-auto ak-scrollbar">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ak-color-text-primary)] mb-1">
            Packs
          </h1>
          <p className="text-sm text-[var(--ak-color-text-muted)]">
            Job-to-be-done Bibliothek: Vorgefertigte Workflows für häufige Aufgaben
          </p>
        </div>

        {/* Packs Grid */}
        {DEMO_PACKS.length === 0 ? (
          <AkEmptyState
            icon={<FolderIcon />}
            title="Keine Packs verfügbar"
            description="Packs werden aus dem Actions Manifest geladen"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEMO_PACKS.map((pack) => (
              <AkListRow
                key={pack.id}
                accent="graphite"
                onClick={() => handlePackClick(pack)}
                leading={
                  <div className="w-12 h-12 rounded-lg bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center">
                    <FolderIcon className="w-6 h-6 text-[var(--ak-color-text-secondary)]" />
                  </div>
                }
                title={
                  <div>
                    <div className="text-sm font-medium text-[var(--ak-color-text-primary)]">
                      {pack.label}
                    </div>
                    <div className="text-xs text-[var(--ak-color-text-muted)] mt-0.5">
                      {pack.description}
                    </div>
                  </div>
                }
                trailing={
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--ak-color-text-muted)]">
                      {pack.templates.length} Templates
                    </span>
                    <SparklesIcon className="w-4 h-4 text-[var(--ak-color-text-muted)]" />
                  </div>
                }
                className="py-4"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

