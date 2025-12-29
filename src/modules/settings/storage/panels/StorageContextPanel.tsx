'use client';

import React from 'react';
import { StorageTab, MemoryItem, ChatSource, FileItem } from '../types';
import { Brain, MessageSquare, FileText, Link, Tag, Calendar, ShieldCheck, Eye } from 'lucide-react';

interface StorageContextPanelProps {
  item: MemoryItem | ChatSource | FileItem;
  tab: StorageTab;
}

export const StorageContextPanel: React.FC<StorageContextPanelProps> = ({
  item,
  tab
}) => {
  if (tab === 'memories') {
    const memory = item as MemoryItem;
    return (
      <div className="p-4 space-y-6 animate-in fade-in duration-300">
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--ak-color-text-primary)]">{memory.title}</h3>
          <p className="text-xs text-[var(--ak-color-text-secondary)] leading-relaxed bg-[var(--ak-color-bg-surface-elevated)] p-3 rounded-[var(--ak-radius-xl)] border border-[var(--ak-color-border-fine)]">
            {memory.fullText}
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)]">Metadaten</h4>
          <div className="space-y-2">
            <DetailRow icon={<Tag className="w-3 h-3" />} label="Tags" value={memory.tags.join(', ')} />
            <DetailRow icon={<Brain className="w-3 h-3" />} label="Konfidenz" value={memory.confidence} />
            <DetailRow icon={<Calendar className="w-3 h-3" />} label="Erstellt" value={memory.timestamp} />
          </div>
        </div>

        <div className="pt-2">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-fine)] hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)] text-xs font-medium rounded-[var(--ak-radius-xl)] transition-colors">
            <Link className="w-3.5 h-3.5" />
            Quelle öffnen ({memory.source})
          </button>
        </div>
      </div>
    );
  }

  if (tab === 'chats') {
    const chat = item as ChatSource;
    return (
      <div className="p-4 space-y-6 animate-in fade-in duration-300">
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--ak-color-text-primary)]">{chat.title}</h3>
          <div className="bg-[var(--ak-color-bg-surface-elevated)] p-3 rounded-[var(--ak-radius-xl)] border border-[var(--ak-color-border-fine)] space-y-2">
            <p className="text-[10px] font-bold text-[var(--ak-color-accent-strong)] uppercase tracking-widest">KI-Zusammenfassung</p>
            <p className="text-xs text-[var(--ak-color-text-secondary)] leading-relaxed">
              {chat.summary || 'Keine Zusammenfassung vorhanden.'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)]">Kanal-Details</h4>
          <div className="space-y-2">
            <DetailRow icon={<MessageSquare className="w-3 h-3" />} label="Kanal" value={chat.channel} />
            <DetailRow icon={<Calendar className="w-3 h-3" />} label="Datum" value={chat.date} />
          </div>
        </div>

        <div className="pt-2">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--ak-color-accent-soft)] border border-[var(--ak-color-border-fine)] hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-primary)] text-xs font-medium rounded-[var(--ak-radius-xl)] transition-colors">
            <Eye className="w-3.5 h-3.5" />
            Original-Chat anzeigen
          </button>
        </div>
      </div>
    );
  }

  const file = item as FileItem;
  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-300">
      <div className="space-y-4">
        {/* File Placeholder Preview */}
        <div className="aspect-[4/3] bg-[var(--ak-color-bg-surface-muted)] rounded-[var(--ak-radius-2xl)] border border-[var(--ak-color-border-fine)] flex flex-col items-center justify-center gap-2 opacity-60">
          <FileText className="w-10 h-10 text-[var(--ak-color-text-muted)]" />
          <span className="text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-widest">{file.type} Vorschau</span>
        </div>

        <div className="space-y-2">
        <h3 className="text-sm font-bold text-[var(--ak-color-text-primary)]">{file.filename}</h3>
        <p className="text-xs text-[var(--ak-color-text-secondary)] leading-relaxed">
            {file.summary || 'Inhalt wird analysiert...'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)]">Datei-Info</h4>
        <div className="space-y-2">
          <DetailRow icon={<FileText className="w-3 h-3" />} label="Typ" value={file.type.toUpperCase()} />
          <DetailRow icon={<ShieldCheck className="w-3 h-3" />} label="Größe" value={file.size} />
          <DetailRow icon={<Calendar className="w-3 h-3" />} label="Upload" value={file.date} />
        </div>
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between text-xs py-1 border-b border-[var(--ak-color-border-fine)] last:border-0">
    <div className="flex items-center gap-2 text-[var(--ak-color-text-muted)]">
      {icon}
      <span className="text-[var(--ak-color-text-secondary)]">{label}</span>
    </div>
    <span className="font-medium text-[var(--ak-color-text-primary)] truncate max-w-[160px]">{value}</span>
  </div>
);

