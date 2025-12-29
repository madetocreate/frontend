/**
 * WorkLog Demo Data
 */

import { WorkLogEntry } from './types';
import { createWorkLogEntry } from './helpers';
import { loadWorkLog, saveWorkLog } from './storage';

/**
 * Seed work log with demo entries if empty
 */
export function seedWorkLogIfEmpty(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const existing = loadWorkLog();
  if (existing.length > 0) {
    return; // Already has entries
  }

  const now = new Date();
  const entries: WorkLogEntry[] = [
    // Today
    createWorkLogEntry({
      type: 'executed',
      channel: 'email',
      title: 'E-Mail beantwortet',
      detail: 'Kundenanfrage zu Produktdetails',
      ref: { kind: 'inbox', id: 'demo-1', href: '/inbox?id=demo-1' },
    }),
    createWorkLogEntry({
      type: 'suggestion',
      channel: 'telegram',
      title: 'Antwortentwurf erstellt',
      detail: 'Telegram-Nachricht von Kunde',
      ref: { kind: 'inbox', id: 'demo-2', href: '/inbox?id=demo-2' },
    }),
    createWorkLogEntry({
      type: 'setup',
      channel: 'telegram',
      title: 'Integration verbunden: Telegram',
      ref: { kind: 'integration', id: 'telegram', href: '/actions?cat=setup&integration=telegram' },
    }),
    createWorkLogEntry({
      type: 'executed',
      channel: 'chat',
      title: 'Kampagne starten gestartet',
      ref: { kind: 'action', href: '/actions?cat=marketing' },
    }),
    // Yesterday (simulated)
    createWorkLogEntry({
      type: 'executed',
      channel: 'reviews',
      title: 'Review beantwortet',
      detail: 'Google Bewertung',
      ref: { kind: 'inbox', id: 'demo-3', href: '/inbox?id=demo-3' },
    }),
    createWorkLogEntry({
      type: 'suggestion',
      channel: 'email',
      title: 'Next Steps vorgeschlagen',
      detail: 'Follow-up für Kundenanfrage',
      ref: { kind: 'inbox', id: 'demo-4', href: '/inbox?id=demo-4' },
    }),
    createWorkLogEntry({
      type: 'executed',
      channel: 'docs',
      title: 'Dokument zugeordnet',
      detail: 'Rechnung zu Kunde',
      ref: { kind: 'doc', id: 'demo-doc-1', href: '/docs?id=demo-doc-1' },
    }),
    // Older (simulated)
    createWorkLogEntry({
      type: 'setup',
      channel: 'email',
      title: 'Integration verbunden: E-Mail',
      ref: { kind: 'integration', id: 'email', href: '/actions?cat=setup&integration=email' },
    }),
    createWorkLogEntry({
      type: 'executed',
      channel: 'website',
      title: 'Lead zugeordnet',
      detail: 'Website-Formular',
      ref: { kind: 'customer', id: 'demo-customer-1', href: '/customers?id=demo-customer-1' },
    }),
    createWorkLogEntry({
      type: 'ingress',
      channel: 'phone',
      title: 'Anruf eingegangen',
      detail: 'Kundenanfrage',
      ref: { kind: 'inbox', id: 'demo-5', href: '/inbox?id=demo-5' },
    }),
  ];

  // Adjust timestamps to simulate different dates
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const older = new Date(now);
  older.setDate(older.getDate() - 3);

  entries[4].ts = yesterday.toISOString();
  entries[5].ts = yesterday.toISOString();
  entries[6].ts = yesterday.toISOString();
  entries[7].ts = older.toISOString();
  entries[8].ts = older.toISOString();
  entries[9].ts = older.toISOString();

  // Save all entries
  saveWorkLog(entries);
}

