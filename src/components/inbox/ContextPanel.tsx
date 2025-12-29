'use client';

import React from 'react';
import { InboxItem } from '@/components/InboxDrawerWidget';
import { 
  EnvelopeIcon, 
  ChatBubbleLeftEllipsisIcon, 
  StarIcon, 
  QuestionMarkCircleIcon,
  UserCircleIcon,
  CalendarIcon,
  TagIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { DrawerCard } from '@/components/ui/drawer-kit';
import { AISuggestionGrid } from '@/components/ui/AISuggestionGrid';
import { AkBadge } from '@/components/ui/AkBadge';

interface ContextPanelProps {
  item: InboxItem;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({ item }) => {
  const getChannelIcon = () => {
    switch (item.channel) {
      case 'email': return <EnvelopeIcon className="w-3.5 h-3.5 mr-1" />;
      case 'messenger': return <ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5 mr-1" />;
      case 'reviews': return <StarIcon className="w-3.5 h-3.5 mr-1" />;
      default: return <QuestionMarkCircleIcon className="w-3.5 h-3.5 mr-1" />;
    }
  };

  const getChannelTone = () => {
    switch (item.channel) {
      case 'email': return 'info';
      case 'messenger': return 'success';
      case 'reviews': return 'warning';
      default: return 'muted';
    }
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-300">
      {/* Thread Info Card */}
      <DrawerCard>
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)] leading-tight">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <AkBadge tone={getChannelTone()} className="uppercase tracking-wider">
                {getChannelIcon()}
                {item.channel}
              </AkBadge>
            </div>
          </div>
        </div>
      </DrawerCard>

      {/* Contact Info Card */}
      <DrawerCard title="Kontakt">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--ak-color-bg-surface-muted)] to-[var(--ak-color-bg-hover)] flex items-center justify-center border border-[var(--ak-surface-1)] shadow-sm">
              <UserCircleIcon className="w-6 h-6 text-[var(--ak-color-text-muted)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--ak-color-text-primary)] truncate">
                {item.sender}
              </p>
              <p className="text-[11px] text-[var(--ak-color-text-muted)] truncate">
                ID: {item.id.padStart(6, '0')}
              </p>
            </div>
          </div>
          <button className="w-full py-1.5 px-3 rounded-lg bg-[var(--ak-color-bg-surface)] text-[11px] font-medium text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] transition-colors border border-[var(--ak-color-border-subtle)] flex items-center justify-center gap-1.5 shadow-sm">
            <UserCircleIcon className="w-3.5 h-3.5" />
            Profil im CRM öffnen
          </button>
        </div>
      </DrawerCard>

      {/* Details Card */}
      <DrawerCard title="Details">
        <div className="space-y-2">
          <DetailRow icon={<CalendarIcon className="w-3.5 h-3.5" />} label="Datum" value={item.time} />
          <DetailRow icon={<TagIcon className="w-3.5 h-3.5" />} label="Status" value={item.status || 'Offen'} />
          <DetailRow icon={<TagIcon className="w-3.5 h-3.5" />} label="Labels" value={item.important ? 'Wichtig, VIP' : 'Normal'} />
        </div>
      </DrawerCard>

      {/* Sources Card */}
      <DrawerCard title="Quellen">
        <div className="flex flex-wrap gap-2">
          <a href="#" className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--ak-color-bg-surface-muted)] text-[10px] text-[var(--ak-color-accent-strong)] hover:bg-[var(--ak-color-bg-hover)] transition-colors border border-[var(--ak-color-border-subtle)] shadow-sm">
            <LinkIcon className="w-3 h-3" />
            Dokument #42
          </a>
          <a href="#" className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--ak-color-bg-surface-muted)] text-[10px] text-[var(--ak-color-accent-strong)] hover:bg-[var(--ak-color-bg-hover)] transition-colors border border-[var(--ak-color-border-subtle)] shadow-sm">
            <LinkIcon className="w-3 h-3" />
            Bestellung #1042
          </a>
        </div>
      </DrawerCard>

      {/* AI Suggestions Block - restored under context */}
      <AISuggestionGrid
        context="inbox"
        summary={item.title}
        text={item.snippet || "Analysiere Inhalt..."}
        channel={item.channel}
        target={{
          id: item.id,
          type: item.channel === 'email' ? 'email' : item.channel === 'messenger' ? 'message' : 'thread',
          title: item.title,
        }}
        itemSummary={{
          text: item.snippet,
          title: item.title,
        }}
      />
    </div>
  );
};

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--ak-color-border-hairline)] last:border-0">
    <div className="flex items-center gap-2 text-[var(--ak-color-text-muted)]">
      {icon}
      <span>{label}</span>
    </div>
    <span className="font-medium text-[var(--ak-color-text-primary)]">{value}</span>
  </div>
);
