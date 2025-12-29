'use client';

import React from 'react';
import { Customer } from '../types';
import { User, Mail, Phone, Info, Tag, ExternalLink, Pencil } from 'lucide-react';

interface CustomerContextPanelProps {
  customer: Customer;
  onEdit?: () => void;
}

export const CustomerContextPanel: React.FC<CustomerContextPanelProps> = ({
  customer,
  onEdit
}) => {
  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-300">
      {/* Profile Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center border border-[var(--ak-color-border-subtle)] shadow-sm shrink-0">
            <User className="w-6 h-6 text-[var(--ak-color-text-muted)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--ak-color-text-primary)] leading-tight">
              {customer.name}
            </h3>
            <p className="text-[11px] text-[var(--ak-color-text-muted)]">
              {customer.company || 'Privatkunde'}
            </p>
          </div>
        </div>
        <button 
          onClick={onEdit}
          className="p-2 hover:bg-[var(--ak-color-bg-hover)] rounded-full transition-colors group"
        >
          <Pencil className="w-3.5 h-3.5 text-[var(--ak-color-text-muted)] group-hover:text-[var(--ak-color-accent)]" />
        </button>
      </div>

      {/* Core Details */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)]">Kerndaten</h4>
        <div className="space-y-2">
          {customer.email && <DetailRow icon={<Mail className="w-3.5 h-3.5" />} label="E-Mail" value={customer.email} />}
          {customer.phone && <DetailRow icon={<Phone className="w-3.5 h-3.5" />} label="Telefon" value={customer.phone} />}
          <DetailRow 
            icon={<Info className="w-3.5 h-3.5" />} 
            label="Wichtig" 
            value={customer.important ? "Hohe Priorität" : "Standard Support"} 
          />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)]">Tags</h4>
        <div className="flex flex-wrap gap-2">
          {customer.tags.map(tag => (
            <span key={tag} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[11px] font-medium text-[var(--ak-color-text-secondary)] shadow-sm">
              <Tag className="w-3 h-3 text-[var(--ak-color-text-muted)]" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Open Cases */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)]">Offene Vorgänge ({customer.openCases})</h4>
        {customer.openCases > 0 ? (
          <div className="space-y-2">
            {[1, 2].slice(0, customer.openCases).map(i => (
              <div key={i} className="p-3 bg-[var(--ak-color-bg-surface)]/50 border border-[var(--ak-color-border-subtle)] rounded-xl flex items-center justify-between group hover:border-[var(--ak-color-accent)]/30 transition-colors cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[var(--ak-color-text-primary)]">Anfrage #{456 + i}</span>
                  <span className="text-[10px] text-[var(--ak-color-text-muted)]">Zuletzt aktualisiert vor {i * 2} Std.</span>
                </div>
                <ExternalLink className="w-3 h-3 text-[var(--ak-color-text-muted)] group-hover:text-[var(--ak-color-accent)] transition-colors" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--ak-color-text-muted)] italic">Keine offenen Vorgänge.</p>
        )}
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between text-xs py-1 border-b border-[var(--ak-color-border-subtle)] last:border-0">
    <div className="flex items-center gap-2 text-[var(--ak-color-text-muted)]">
      {icon}
      <span>{label}</span>
    </div>
    <span className="font-medium text-[var(--ak-color-text-primary)] truncate max-w-[160px]">{value}</span>
  </div>
);

