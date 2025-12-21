'use client';

import React, { useState, useMemo } from 'react';
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
      "fixed inset-y-0 left-0 lg:relative lg:inset-auto h-full flex flex-col border-r border-[var(--ak-color-border-subtle)] bg-[var(--ak-glass-bg)] backdrop-blur-xl transition-all duration-300 ease-in-out z-20",
      isOpen ? "w-[320px] translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0 pointer-events-none"
    )}>
      {/* Header / Search */}
      <div className="p-4 space-y-4">
        <div className="space-y-3">
          <AkSearchField
            placeholder="Kunden durchsuchen..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <div className="flex items-center justify-between px-1 text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <ShortcutChip label="⌘K" />
              <span>Aktionen</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShortcutChip label="?" />
              <span>Hilfe</span>
            </div>
          </div>
        </div>

        <AkButton 
          size="sm" 
          variant="secondary" 
          className="w-full justify-start text-xs font-semibold !rounded-xl bg-blue-50/50 border-blue-100/50 text-blue-700 hover:bg-blue-50"
          leftIcon={<PlusIcon className="h-3.5 w-3.5" />}
        >
          Neuer Kunde
        </AkButton>

        {/* Segmented Filter */}
        <div className="flex p-1 bg-[var(--ak-color-bg-surface-muted)]/50 rounded-xl border border-[var(--ak-color-border-subtle)]">
          {(['all', 'open', 'new', 'important'] as CustomerStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={clsx(
                "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                activeFilter === f 
                  ? "bg-[var(--ak-color-bg-elevated)] text-[var(--ak-color-text-primary)] shadow-sm ring-1 ring-[var(--ak-color-border-subtle)]"
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
      <div className="flex-1 overflow-y-auto px-2 pb-4 ak-scrollbar">
        <DrawerSectionTitle className="px-3 mb-2">Ergebnisse</DrawerSectionTitle>
        <div className="space-y-0.5">
          {filteredCustomers.length === 0 ? (
            <div className="p-8 text-center space-y-2 opacity-50">
              <UserGroupIcon className="w-8 h-8 text-[var(--ak-color-text-muted)] mx-auto" />
              <p className="text-xs font-medium text-[var(--ak-color-text-muted)] leading-relaxed">
                Noch keine Kunden gefunden. Reinkommende Anfragen erscheinen hier automatisch.
              </p>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => onSelectCustomer(customer)}
                className={clsx(
                  "w-full text-left p-3 rounded-2xl transition-all duration-200 group border border-transparent relative",
                  selectedCustomerId === customer.id
                    ? "bg-[var(--ak-color-bg-elevated)] border-[var(--ak-color-border-subtle)] shadow-sm"
                    : "hover:bg-white/60"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={clsx(
                    "text-xs font-bold truncate pr-2",
                    selectedCustomerId === customer.id ? "text-[var(--ak-color-text-primary)]" : "text-[var(--ak-color-text-secondary)]"
                  )}>
                    {customer.name}
                  </span>
                  <div className={clsx(
                    "w-1.5 h-1.5 rounded-full mt-1",
                    customer.status === 'active' ? "bg-green-500" : "bg-[var(--ak-color-text-muted)]"
                  )} />
                </div>
                <p className="text-[10px] text-[var(--ak-color-text-muted)] line-clamp-1 mb-2 font-medium">
                  {customer.contextLine}
                </p>
                <div className="flex flex-wrap gap-1">
                  {customer.tags.map(tag => (
                    <AkBadge key={tag} tone="muted" size="sm" className="uppercase tracking-widest !text-[8px]">
                      {tag}
                    </AkBadge>
                  ))}
                </div>

                {/* Selection Indicator */}
                {selectedCustomerId === customer.id && (
                  <div className="absolute left-0 top-4 bottom-4 w-1 bg-[var(--ak-color-accent)] rounded-r-full" />
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="px-4 py-3 border-t border-[var(--ak-color-border-subtle)] bg-[var(--ak-glass-bg)]/50">
        <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span>CRM Synchronisiert</span>
        </div>
      </div>
    </div>
  );
};

