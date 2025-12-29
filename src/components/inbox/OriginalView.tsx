'use client';

import React from 'react';
import { InboxItem } from '@/components/InboxDrawerWidget';
import { 
  StarIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

interface OriginalViewProps {
  item: InboxItem;
}

export const OriginalView: React.FC<OriginalViewProps> = ({ item }) => {
  switch (item.channel) {
    case 'email':
      return <EmailOriginalView item={item} />;
      case 'messenger':
      return <ChatOriginalView item={item} />;
    case 'reviews':
      return <ReviewOriginalView item={item} />;
    default:
      return <div className="p-6 text-[var(--ak-color-text-secondary)]">{item.snippet}</div>;
  }
};

const EmailOriginalView: React.FC<{ item: InboxItem }> = ({ item }) => (
  <div className="flex flex-col h-full ak-surface-1 rounded-[var(--ak-radius-lg)] border ak-border-default overflow-hidden ak-elev-1 animate-in fade-in duration-500">
    <div className="px-6 py-4 ak-bg-surface-muted border-b ak-border-hairline space-y-2">
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-bold ak-text-primary leading-tight">{item.title}</h2>
        <span className="text-xs ak-text-muted font-medium tabular-nums">{item.time} Uhr</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-[var(--ak-accent-inbox-soft)] flex items-center justify-center">
          <UserCircleIcon className="w-4 h-4 text-[var(--ak-accent-inbox)]" />
        </div>
        <span className="text-sm font-semibold ak-text-secondary">{item.sender}</span>
        <span className="text-xs ak-text-muted">&lt;customer@example.com&gt;</span>
      </div>
    </div>
    <div className="flex-1 p-6 text-[var(--ak-color-text-secondary)] leading-relaxed prose prose-sm max-w-none">
      <p>Sehr geehrte Damen und Herren,</p>
      <p>{item.snippet}</p>
      <p>Ich würde mich über eine zeitnahe Rückmeldung freuen.</p>
      <p>Mit freundlichen Grüßen,<br/>{item.sender}</p>
    </div>
  </div>
);

const ChatOriginalView: React.FC<{ item: InboxItem }> = ({ item }) => (
  <div className="space-y-4 p-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="flex justify-center">
      <span className="px-3 py-1 rounded-full ak-bg-surface-muted text-[10px] font-bold ak-text-muted uppercase tracking-widest">Heute</span>
    </div>
    <div className="flex flex-col gap-3">
      {/* Received */}
      <div className="flex justify-start max-w-[85%]">
        <div className="px-4 py-2.5 ak-bg-surface-0 rounded-2xl rounded-tl-sm border ak-border-default ak-shadow-1 text-sm ak-text-primary leading-relaxed">
          {item.snippet}
        </div>
      </div>
      {/* System info */}
      <div className="flex justify-center py-2">
        <span className="text-[10px] ak-text-muted italic">Chat gestartet über WhatsApp Business</span>
      </div>
    </div>
  </div>
);

const ReviewOriginalView: React.FC<{ item: InboxItem }> = ({ item }) => (
  <div className="p-6 ak-bg-surface-0 rounded-2xl border border-[var(--ak-semantic-warning)]/25 ak-shadow-1 space-y-4 animate-in zoom-in-95 duration-500">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--ak-semantic-warning-soft)] flex items-center justify-center">
          <StarIcon className="w-6 h-6 text-[var(--ak-semantic-warning)] fill-[var(--ak-semantic-warning)]" />
        </div>
        <div>
          <p className="text-sm font-bold ak-text-primary">{item.sender}</p>
          <p className="text-[11px] ak-text-muted">Gepostet auf Google Maps</p>
        </div>
      </div>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <StarIcon key={i} className="w-3.5 h-3.5 text-[var(--ak-semantic-warning)] fill-[var(--ak-semantic-warning)]" />
        ))}
      </div>
    </div>
    <div className="p-4 bg-[var(--ak-semantic-warning-soft)]/30 rounded-xl border border-[var(--ak-semantic-warning)]/25 italic text-sm ak-text-secondary leading-relaxed">
      &quot;{item.snippet}&quot;
    </div>
  </div>
);

