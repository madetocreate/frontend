'use client';

import { memo, useMemo } from 'react';
import { InboxItem } from './types';
import clsx from 'clsx';
import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  GlobeAltIcon,
  PhoneIcon,
  SparklesIcon,
  LanguageIcon,
  ArchiveBoxIcon,
  ArrowRightIcon,
  UserPlusIcon,
  UserIcon,
  ChartBarIcon,
  TruckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { AkListRow } from '@/components/ui/AkListRow';
import { AkBadge } from '@/components/ui/AkBadge';
import { AkButton } from '@/components/ui/AkButton';

interface InboxItemCardProps {
  item: InboxItem;
  onClick: () => void;
}

const sourceIcons = {
  email: EnvelopeIcon,
  telegram: ChatBubbleLeftRightIcon,
  reviews: StarIcon,
  website: GlobeAltIcon,
  phone: PhoneIcon,
  marketing: EnvelopeIcon,
};

const ACTION_ICONS: Record<string, any> = {
  Sparkles: SparklesIcon,
  Language: LanguageIcon,
  Archive: ArchiveBoxIcon,
  ArrowRight: ArrowRightIcon,
  UserPlus: UserPlusIcon,
  User: UserIcon,
  ChartBar: ChartBarIcon,
  Truck: TruckIcon,
  UserGroup: UserGroupIcon,
  Reply: ChatBubbleLeftRightIcon,
};

const sourceLabels = {
  email: 'E-Mail',
  telegram: 'Telegram',
  reviews: 'Bewertung',
  website: 'Website',
  phone: 'Anruf',
  marketing: 'Marketing',
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Gerade eben';
  if (diffMins < 60) return `vor ${diffMins} Min`;
  if (diffHours < 24) return `vor ${diffHours} Std`;
  if (diffDays === 1) return 'Gestern';
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

export const InboxItemCard = memo(function InboxItemCard({ item, onClick }: InboxItemCardProps) {
  const SourceIcon = sourceIcons[item.source];
  const sourceLabel = sourceLabels[item.source];
  const isImportant = item.status === 'needs_action';

  const handleAction = async (e: React.MouseEvent, action: { label: string; actionId?: string }) => {
    e.stopPropagation();
    
    // Wenn eine actionId vorhanden ist, starte die echte Aktion
    if (action.actionId) {
      try {
        const { dispatchActionStart } = await import('@/lib/actions/dispatch');
        dispatchActionStart(
          action.actionId,
          {
            module: 'inbox',
            target: {
              id: item.id,
              type: 'inbox',
              title: item.title,
            },
            moduleContext: {
              inbox: {
                itemId: item.id,
                threadId: item.id,
                channel: item.source === 'email' ? 'email' : 
                         item.source === 'telegram' ? 'telegram' : 
                         item.source === 'phone' ? 'phone' : 'email',
              },
              item: item,
            },
          },
          {},
          'InboxItemCard-handleAction'
        );
      } catch (error) {
        console.error('[InboxItemCard] Fehler beim Starten der Aktion:', error);
        // Fallback: Öffne Detail-Ansicht
        onClick();
      }
    } else {
      // Fallback: Öffne Detail-Ansicht wenn keine actionId vorhanden
      onClick();
    }
  };

  // Smart Actions berechnen
  const smartActions = useMemo(() => {
    // 1. Aktionen vom Backend
    const backendActions = item.suggestedActions?.map(a => ({
      id: a.id,
      label: a.label,
      icon: a.icon ? ACTION_ICONS[a.icon] : SparklesIcon,
      actionId: a.actionId,
    })) || [];

    // 2. Falls keine Aktionen da sind, Standard-Aktionen generieren
    if (backendActions.length === 0) {
      const fallbacks = [];
      
      // Antwortentwurf für Nachrichten
      if (['email', 'telegram', 'marketing'].includes(item.source)) {
        fallbacks.push({
          id: 'reply',
          label: 'Antworten',
          icon: SparklesIcon,
          actionId: 'inbox.draft_reply'
        });
      }

      // Nächste Schritte
      fallbacks.push({
        id: 'next_steps',
        label: 'Nächste Schritte',
        icon: ArrowRightIcon,
        actionId: 'inbox.next_steps'
      });

      // Kunde erstellen wenn kein Name da ist
      if (!item.customerName && item.source === 'email') {
        fallbacks.push({
          id: 'create_customer',
          label: 'Kunde+',
          icon: UserPlusIcon,
          actionId: 'customers.create'
        });
      }

      return fallbacks.slice(0, 3);
    }

    return backendActions;
  }, [item]);

  return (
    <div
      className={clsx(
        'group relative rounded-2xl border transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] isolate',
        'backdrop-blur-xl',
        isImportant
          ? 'bg-[var(--ak-color-bg-surface)]/80 border-[var(--ak-color-accent)]/40 shadow-[var(--ak-elev-3)] -translate-y-0.5 z-10 hover:bg-[var(--ak-color-bg-surface)] hover:shadow-[var(--ak-elev-4)] hover:-translate-y-1 hover:scale-[1.01]'
          : 'bg-[var(--ak-color-bg-surface-muted)]/60 border-[var(--ak-color-border-fine)]/40 shadow-[var(--ak-elev-1)] hover:bg-[var(--ak-color-bg-surface)]/90 hover:shadow-[var(--ak-elev-4)] hover:border-[var(--ak-color-border-subtle)] hover:-translate-y-1 hover:scale-[1.01]'
      )}
    >
      {/* Feiner Glow-Effekt für wichtige Items */}
      {isImportant && (
        <div className="absolute inset-0 rounded-2xl bg-[var(--ak-color-accent)]/5 pointer-events-none" />
      )}

      {/* Hover Glow für alle Items */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/0 to-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay" />

      {/* Linker Rand Indikator für wichtige Nachrichten */}
      {isImportant && (
        <div className="absolute left-0 top-4 bottom-4 w-1.5 rounded-r-full bg-[var(--ak-color-accent)] z-20 shadow-[var(--ak-shadow-accent-glow)]" />
      )}

      <AkListRow
        accent="inbox"
        onClick={onClick}
        className={clsx(
          '!bg-transparent hover:!bg-transparent rounded-2xl relative z-10 p-4',
          isImportant ? 'pl-6' : '' 
        )}
        leading={
          <div className={clsx(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-sm border border-[var(--ak-color-border-hairline)]",
            isImportant 
              ? "bg-[var(--ak-color-accent)]/10 text-[var(--ak-color-accent)] scale-105 shadow-md" 
              : "bg-[var(--ak-color-bg-surface)]/50 text-[var(--ak-color-text-secondary)] group-hover:bg-[var(--ak-color-bg-surface)] group-hover:text-[var(--ak-color-text-primary)] group-hover:scale-105 group-hover:shadow-md"
          )}>
            <SourceIcon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
          </div>
        }
        title={
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={clsx(
                "text-[10px] font-bold uppercase tracking-wider transition-colors duration-300",
                isImportant ? "text-[var(--ak-color-accent)]" : "text-[var(--ak-color-text-muted)]"
              )}>
                {sourceLabel}
              </span>
              {item.isDemo && (
                <AkBadge tone="neutral" size="xs">
                  Demo
                </AkBadge>
              )}
              {isImportant && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--ak-color-accent)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--ak-color-accent)]"></span>
                </span>
              )}
            </div>
            <h3 className={clsx(
              "text-base font-bold line-clamp-1 transition-colors duration-300",
              isImportant ? "text-[var(--ak-color-text-primary)]" : "text-[var(--ak-color-text-primary)]"
            )}>
              {item.title}
            </h3>
          </div>
        }
        subtitle={
          <div className="space-y-3 mt-1.5">
            <p className="text-sm text-[var(--ak-color-text-secondary)] line-clamp-2 leading-relaxed opacity-90 font-medium">
              {item.preview}
            </p>
            {item.customerName && (
              <div className="flex items-center gap-2 text-xs text-[var(--ak-color-text-muted)] font-medium">
                <span className="bg-[var(--ak-color-bg-surface)]/50 border border-[var(--ak-color-border-hairline)] px-2 py-0.5 rounded-full">{item.customerName}</span>
                {item.customerEmail && <span className="opacity-60 font-normal">{item.customerEmail}</span>}
              </div>
            )}
            
            {/* Smart Actions - Subtiler gestaltet */}
            <div className="flex flex-wrap items-center gap-2 pt-1 -ml-1">
              {smartActions.map((action, index) => {
                const Icon = action.icon;
                
                return (
                  <button
                    key={action.id || index}
                    onClick={(e) => handleAction(e, action)}
                    className={clsx(
                      "group/btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border cursor-pointer select-none shadow-sm backdrop-blur-sm",
                      "bg-[var(--ak-color-bg-surface)]/40 border-[var(--ak-color-border-fine)]/50 text-[var(--ak-color-text-secondary)]",
                      "hover:bg-[var(--ak-color-bg-surface)] hover:text-[var(--ak-color-text-primary)] hover:border-[var(--ak-color-border-subtle)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
                    )}
                  >
                    {Icon && (
                      <Icon className="w-3.5 h-3.5 opacity-70 group-hover/btn:opacity-100 transition-opacity" />
                    )}
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>
        }
        trailing={
          <span className="text-[10px] font-bold text-[var(--ak-color-text-muted)] flex-shrink-0 bg-[var(--ak-color-bg-surface)]/50 border border-[var(--ak-color-border-hairline)] px-2 py-1 rounded-lg backdrop-blur-sm">
            {formatTimeAgo(item.timestamp)}
          </span>
        }
      />
    </div>
  );
});

