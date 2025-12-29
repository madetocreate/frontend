'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UsersIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const STORAGE_KEY = 'aklow.v2.settings.org';

interface OrganizationSettingsData {
  name: string;
  timezone: string;
  language: string;
}

export function OrganizationSettings() {
  const [settings, setSettings] = useState<OrganizationSettingsData>({
    name: '',
    timezone: 'Europe/Madrid',
    language: 'de',
  });
  const [saved, setSaved] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      // Ignore parse errors
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      // Ignore storage errors
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium text-[var(--ak-color-text-primary)] mb-1">
          Organisation
        </h2>
        <p className="text-sm text-[var(--ak-color-text-muted)]">
          Grundeinstellungen für Ihre Organisation
        </p>
      </div>

      {/* Quick Access: Teams */}
      <Link 
        href="/settings?tab=teams"
        className="bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-fine)] rounded-2xl p-5 transition-all group hover:bg-[var(--ak-color-bg-hover)] hover:shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--ak-color-accent-soft)]/20 flex items-center justify-center text-[var(--ak-color-accent)] group-hover:scale-110 transition-transform">
              <UsersIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--ak-color-text-primary)] text-sm mb-0.5">
                Teams verwalten
              </h3>
              <p className="text-xs text-[var(--ak-color-text-muted)] font-medium">
                Organisiere deine Mitarbeiter in Teams
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[var(--ak-color-text-muted)] group-hover:text-[var(--ak-color-accent)] transition-all">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Verwalten</span>
            <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>

      {/* Settings Card */}
      <div className="bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-fine)] rounded-[var(--ak-radius-lg)] p-6 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-2">
            Organisationsname
          </label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-fine)] rounded-[var(--ak-radius-md)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent-soft)] focus:border-[var(--ak-color-accent)] transition-colors"
            placeholder="Meine Organisation"
          />
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-2">
            Zeitzone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-fine)] rounded-[var(--ak-radius-md)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent-soft)] focus:border-[var(--ak-color-accent)] transition-colors"
          >
            <option value="Europe/Madrid">Europe/Madrid (UTC+1/+2)</option>
            <option value="Europe/Berlin">Europe/Berlin (UTC+1/+2)</option>
            <option value="Europe/London">Europe/London (UTC+0/+1)</option>
            <option value="America/New_York">America/New_York (UTC-5/-4)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (UTC-8/-7)</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-2">
            Sprache
          </label>
          <select
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-fine)] rounded-[var(--ak-radius-md)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent-soft)] focus:border-[var(--ak-color-accent)] transition-colors"
          >
            <option value="de">Deutsch</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-[var(--ak-color-border-fine)]">
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-[var(--ak-color-text-inverted)] bg-[var(--ak-color-accent)] hover:bg-[var(--ak-color-accent-strong)] rounded-[var(--ak-radius-md)] transition-colors ak-button-interactive"
          >
            {saved ? 'Gespeichert' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}

