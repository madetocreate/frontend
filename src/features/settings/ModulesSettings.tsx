'use client';

import { useEntitlements } from '@/lib/entitlements';
import { AkButton } from '@/components/ui/AkButton';
import { LockClosedIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

export function ModulesSettings() {
  const entitlements = useEntitlements();
  
  const addons = [
    { key: 'hasMarketing', label: 'Wachstum', description: 'Kampagnen, Content-Planung, Social Media. (Ab Plan Pro)' },
    { key: 'hasWebsiteBot', label: 'Website Bot', description: 'Lead-Generierung und Support auf deiner Website.' },
    { key: 'hasReviewBot', label: 'Review Bot', description: 'Automatische Antworten auf Google Reviews.' },
    { key: 'hasTelephony', label: 'Telefonie', description: 'Integration deiner Telefonanlage.' },
  ] as const;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2 text-[var(--ak-color-text-primary)]">Module & Plan</h2>
        <p className="text-[var(--ak-color-text-secondary)]">Verwalte deine gebuchten Zusatz-Module.</p>
      </div>

      <div className="grid gap-4">
            {addons.map(addon => {
              const isActive = entitlements[addon.key];
              return (
                <div key={addon.key} className="p-6 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-[var(--ak-color-text-primary)]">{addon.label}</h3>
                      {isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)]">
                          Aktiv
                        </span>
                      ) : (
                         <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)]">
                          Gesperrt
                        </span>
                      )}
                    </div>
                    <p className="text-[var(--ak-color-text-secondary)]">{addon.description}</p>
                  </div>
                  
                  <div>
                    {isActive ? (
                      <div className="flex items-center text-[var(--ak-semantic-success)] gap-1 text-sm font-medium">
                        <CheckBadgeIcon className="w-5 h-5" />
                        Gebucht
                      </div>
                    ) : (
                      <AkButton variant="primary">
                        Jetzt freischalten
                      </AkButton>
                    )}
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}

