'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'aklow.v2.settings.profile';

interface ProfileSettingsData {
  name: string;
  email: string;
}

export function ProfileSettings() {
  const [settings, setSettings] = useState<ProfileSettingsData>({
    name: '',
    email: 'user@example.com', // Read-only placeholder
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
          Profil
        </h2>
        <p className="text-sm text-[var(--ak-color-text-muted)]">
          Ihre persönlichen Einstellungen
        </p>
      </div>

      {/* Settings Card */}
      <div className="bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-fine)] rounded-[var(--ak-radius-lg)] p-6 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-2">
            Name
          </label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-fine)] rounded-[var(--ak-radius-md)] text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent-soft)] focus:border-[var(--ak-color-accent)] transition-colors"
            placeholder="Ihr Name"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-[var(--ak-color-text-primary)] mb-2">
            E-Mail
          </label>
          <input
            type="email"
            value={settings.email}
            disabled
            className="w-full px-3 py-2 text-sm bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-fine)] rounded-[var(--ak-radius-md)] text-[var(--ak-color-text-muted)] cursor-not-allowed opacity-60"
            placeholder="user@example.com"
          />
          <p className="mt-1 text-xs text-[var(--ak-color-text-muted)]">
            E-Mail-Adresse kann hier nicht geändert werden
          </p>
        </div>

        {/* Password */}
        <div className="pt-4 border-t border-[var(--ak-color-border-fine)]">
          <Link
            href="/auth/reset-password"
            className="px-4 py-2 inline-block text-sm font-medium text-[var(--ak-color-text-primary)] bg-[var(--ak-color-bg-surface-muted)] hover:bg-[var(--ak-color-bg-hover)] border border-[var(--ak-color-border-fine)] rounded-[var(--ak-radius-md)] transition-colors"
          >
            Passwort ändern
          </Link>
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

