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
          <h3 className="text-sm font-bold text-gray-900">{memory.title}</h3>
          <p className="text-xs text-gray-500 leading-relaxed bg-white/50 p-3 rounded-xl border border-gray-100">
            {memory.fullText}
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Metadaten</h4>
          <div className="space-y-2">
            <DetailRow icon={<Tag className="w-3 h-3" />} label="Tags" value={memory.tags.join(', ')} />
            <DetailRow icon={<Brain className="w-3 h-3" />} label="Konfidenz" value={memory.confidence} />
            <DetailRow icon={<Calendar className="w-3 h-3" />} label="Erstellt" value={memory.timestamp} />
          </div>
        </div>

        <div className="pt-2">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-xl transition-colors">
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
          <h3 className="text-sm font-bold text-gray-900">{chat.title}</h3>
          <div className="bg-white/50 p-3 rounded-xl border border-gray-100 space-y-2">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">KI-Zusammenfassung</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              {chat.summary || 'Keine Zusammenfassung vorhanden.'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Kanal-Details</h4>
          <div className="space-y-2">
            <DetailRow icon={<MessageSquare className="w-3 h-3" />} label="Kanal" value={chat.channel} />
            <DetailRow icon={<Calendar className="w-3 h-3" />} label="Datum" value={chat.date} />
          </div>
        </div>

        <div className="pt-2">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium rounded-xl transition-colors">
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
        <div className="aspect-[4/3] bg-gray-100 rounded-2xl border border-gray-200 flex flex-col items-center justify-center gap-2 opacity-60">
          <FileText className="w-10 h-10 text-gray-400" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{file.type} Vorschau</span>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-gray-900">{file.filename}</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            {file.summary || 'Inhalt wird analysiert...'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Datei-Info</h4>
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
  <div className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-2 text-gray-400">
      {icon}
      <span>{label}</span>
    </div>
    <span className="font-medium text-gray-700 truncate max-w-[160px]">{value}</span>
  </div>
);

