'use client';

import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import { MOCK_CUSTOMERS } from './mockCustomers';
import { Customer, CustomerStatus } from './types';
import { 
  UserGroupIcon, 
  PlusIcon
} from '@heroicons/react/24/outline';
import { 
  ShortcutChip,
  DrawerSectionTitle
} from '@/components/ui/drawer-kit';
import { AkSearchField } from '@/components/ui/AkSearchField';
import { AkButton } from '@/components/ui/AkButton';
import { AkBadge } from '@/components/ui/AkBadge';

interface CustomersLeftDrawerProps {
  selectedCustomerId: string | null;
  onSelectCustomer: (customer: Customer) => void;
  isOpen: boolean;
}

export const CustomersLeftDrawer: React.FC<CustomersLeftDrawerProps> = ({
  selectedCustomerId,
  onSelectCustomer,
  isOpen
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<CustomerStatus>('all');

  const filteredCustomers = useMemo(() => {
    return MOCK_CUSTOMERS.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone?.includes(searchQuery);
      
      const matchesFilter = 
        activeFilter === 'all' ||
        (activeFilter === 'open' && c.openCases > 0) ||
        (activeFilter === 'new' && c.tags.includes('Neukunde')) ||
        (activeFilter === 'important' && c.important);
      
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter]);

  return (
    <div className={clsx(
      "fixed inset-y-0 left-0 lg:relative lg:inset-auto h-full flex flex-col border-r border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-sidebar)] transition-all duration-300 ease-in-out z-20",
      isOpen ? "w-[320px] translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0 pointer-events-none"
    )}>
      {/* Header / Search */}
      <div className="p-5 space-y-4">
        <div className="space-y-4">
          <AkSearchField
            placeholder="Kunden suchen..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="shadow-sm"
          />
          <div className="flex items-center justify-between px-1 text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-widest opacity-60">
            <div className="flex items-center gap-2">
              <ShortcutChip label="⌘K" />
              <span>Aktionen</span>
            </div>
            <div className="flex items-center gap-2">
              <ShortcutChip label="?" />
              <span>Hilfe</span>
            </div>
          </div>
        </div>

        <AkButton 
          size="sm" 
          variant="secondary" 
          className="w-full justify-start text-xs font-semibold !rounded-xl bg-[var(--ak-color-accent-soft)]/50 border-[var(--ak-color-border-subtle)] text-[var(--ak-color-accent-strong)] hover:bg-[var(--ak-color-bg-hover)]"
          leftIcon={<PlusIcon className="h-4 w-4" />}
        >
          Neuer Kunde
        </AkButton>

        {/* Segmented Filter */}
        <div className="flex p-1 bg-[var(--ak-color-bg-surface-muted)]/50 rounded-[var(--ak-radius-xl)] border border-[var(--ak-color-border-subtle)] shadow-inner">
          {(['all', 'open', 'new', 'important'] as CustomerStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={clsx(
                "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-[var(--ak-radius-lg)] transition-all",
                activeFilter === f 
                  ? "bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] shadow-md ring-1 ring-[var(--ak-color-border-subtle)]"
                  : "text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)]"
              )}
            >
              {f === 'all' && 'Alle'}
              {f === 'open' && 'Offen'}
              {f === 'new' && 'Neu'}
              {f === 'important' && 'Wichtig'}
            </button>
          ))}
        </div>
      </div>

      {/* Customer List */}
      <div className="flex-1 overflow-y-auto px-3 pb-6 ak-scrollbar">
        <DrawerSectionTitle className="px-3 mb-3 opacity-60">Kundenliste</DrawerSectionTitle>
        <div className="space-y-1">
          {filteredCustomers.length === 0 ? (
            <div className="py-20 text-center space-y-4 px-6">
              <div className="h-16 w-16 rounded-[var(--ak-radius-2xl)] bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center mx-auto shadow-sm">
                <UserGroupIcon className="w-8 h-8 text-[var(--ak-color-text-muted)]" />
              </div>
              <p className="text-xs font-semibold text-[var(--ak-color-text-primary)]">Keine Kunden gefunden</p>
              <p className="text-[10px] text-[var(--ak-color-text-muted)] leading-relaxed font-medium">
                Reinkommende Anfragen erscheinen hier automatisch.
              </p>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => onSelectCustomer(customer)}
                className={clsx(
                  "w-full text-left p-4 rounded-[var(--ak-radius-xl)] transition-all duration-220 group border border-transparent relative",
                  selectedCustomerId === customer.id
                    ? "bg-[var(--ak-color-bg-surface)] border-[var(--ak-color-border-subtle)] ak-shadow-elev-1"
                    : "hover:bg-[var(--ak-color-bg-hover)]"
                )}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className={clsx(
                    "text-sm truncate pr-2",
                    selectedCustomerId === customer.id ? "font-bold text-[var(--ak-color-text-primary)]" : "font-semibold text-[var(--ak-color-text-secondary)]"
                  )}>
                    {customer.name}
                  </span>
                  <div className={clsx(
                    "w-2 h-2 rounded-full mt-1.5 shadow-sm",
                    customer.status === 'active' ? "bg-[var(--ak-semantic-success)]" : "bg-[var(--ak-color-text-muted)]"
                  )} />
                </div>
                <p className="text-[11px] text-[var(--ak-color-text-muted)] line-clamp-1 mb-3 font-medium">
                  {customer.contextLine}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {customer.tags.map(tag => (
                    <AkBadge key={tag} tone="muted" size="sm" className="uppercase tracking-widest !text-[9px] !font-bold">
                      {tag}
                    </AkBadge>
                  ))}
                </div>

                {/* Selection Indicator */}
                {selectedCustomerId === customer.id && (
                  <div className="absolute left-0 top-4 bottom-4 w-1.5 bg-[var(--ak-color-accent)] rounded-r-full ak-shadow-colored" />
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="px-5 py-4 border-t border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-sidebar)]">
        <div className="flex items-center gap-2.5 text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-widest opacity-80">
          <div className="h-2 w-2 rounded-full bg-[var(--ak-semantic-success)] animate-pulse ak-shadow-colored" />
          <span>CRM Synchronisiert</span>
        </div>
      </div>
    </div>
  );
};

