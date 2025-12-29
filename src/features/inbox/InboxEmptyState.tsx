'use client';

import { useState, useEffect } from 'react';
import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  GlobeAltIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { AkEmptyState } from '@/components/ui/AkEmptyState';
import { AkButton } from '@/components/ui/AkButton';
import { AkBadge } from '@/components/ui/AkBadge';
import { useRouter } from 'next/navigation';
import { ensureDemoInbox } from '@/lib/api/demoApi';

interface InboxEmptyStateProps {
  onRefresh?: () => void;
  tenantId?: string;
}


export function InboxEmptyState({ onRefresh, tenantId }: InboxEmptyStateProps) {
  const router = useRouter();
  const [demoSeeding, setDemoSeeding] = useState(false);
  const [demoSeeded, setDemoSeeded] = useState(false);

  // Auto-seed demo inbox on mount if tenantId is available
  useEffect(() => {
    if (!tenantId || demoSeeding || demoSeeded) return;

    const seedDemo = async () => {
      setDemoSeeding(true);
      try {
        const result = await ensureDemoInbox(tenantId);
        if (result.ok && result.items_created > 0) {
          setDemoSeeded(true);
          // Trigger refresh to show demo items
          if (onRefresh) {
            setTimeout(() => onRefresh(), 500);
          }
        }
      } catch (error) {
        console.error('Failed to seed demo inbox:', error);
      } finally {
        setDemoSeeding(false);
      }
    };

    seedDemo();
  }, [tenantId, demoSeeding, demoSeeded, onRefresh]);

  // Map button IDs to integration IDs
  const mapToIntegrationId = (id: string): string => {
    const mapping: Record<string, string> = {
      email: 'email',
      telegram: 'telegram',
      reviews: 'reviews',
      website: 'website_bot',
      phone: 'phone_bot',
    };
    return mapping[id] || id;
  };

  const connectButtons = [
    { id: 'email', label: 'E-Mail verbinden', icon: EnvelopeIcon },
    { id: 'telegram', label: 'Telegram verbinden', icon: ChatBubbleLeftRightIcon },
    { id: 'reviews', label: 'Reviews verbinden', icon: StarIcon },
    { id: 'website', label: 'Website verbinden', icon: GlobeAltIcon },
    { id: 'phone', label: 'Telefon verbinden', icon: PhoneIcon },
  ];

  const handleConnect = (id: string) => {
    const integrationId = mapToIntegrationId(id);
    router.push(`/actions?cat=setup&integration=${integrationId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-6 py-12">
      <div className="max-w-2xl w-full space-y-6">
        <AkEmptyState
          icon={<EnvelopeIcon />}
          title="Verbinde eine Quelle, damit AKLOW dir Arbeit abnimmt"
          description={
            demoSeeding
              ? 'Demo-Einträge werden geladen...'
              : demoSeeded
              ? 'Demo-Einträge wurden hinzugefügt! Aktualisiere die Liste.'
              : 'Verbinde E-Mails, Telegram, Reviews, Website oder Telefon, um alle Anfragen an einem Ort zu sehen.'
          }
          action={onRefresh ? {
            label: demoSeeded ? 'Jetzt aktualisieren' : 'Aktualisieren',
            onClick: onRefresh,
          } : undefined}
          className="mb-6"
        />

        <div className="grid grid-cols-2 gap-2">
          {connectButtons.map((button) => {
            const Icon = button.icon;
            return (
              <AkButton
                key={button.id}
                variant="secondary"
                size="sm"
                onClick={() => handleConnect(button.id)}
                leftIcon={<Icon className="w-4 h-4" />}
                className="justify-start"
              >
                {button.label}
              </AkButton>
            );
          })}
        </div>

        {demoSeeding && (
          <div className="mt-8 pt-6 border-t border-[var(--ak-color-border-fine)]">
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4 text-sm text-[var(--ak-color-text-secondary)]">
                Demo-Einträge werden geladen...
              </p>
            </div>
          </div>
        )}

        {demoSeeded && !demoSeeding && (
          <div className="mt-8 pt-6 border-t border-[var(--ak-color-border-fine)]">
            <div className="text-center py-8">
              <div className="mb-4 text-4xl">✅</div>
              <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)] mb-2">
                Demo-Einträge hinzugefügt!
              </h3>
              <p className="text-xs text-[var(--ak-color-text-secondary)] mb-4">
                15 Beispiel-Nachrichten wurden zu deiner Inbox hinzugefügt.
              </p>
              <AkButton
                variant="primary"
                size="sm"
                onClick={onRefresh}
                className="w-full max-w-xs"
              >
                Jetzt anzeigen
              </AkButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

