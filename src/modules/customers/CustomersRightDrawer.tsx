'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { Customer, CustomerTabId } from './types';
import { CustomersDrawerTabs } from './CustomersDrawerTabs';
import { CustomerContextPanel } from './panels/CustomerContextPanel';
import { CustomerActionsPanel } from './panels/CustomerActionsPanel';
import { CustomerActivityPanel, ActivityEntry } from './panels/CustomerActivityPanel';
import { 
  EllipsisHorizontalIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { 
  DrawerHeader, 
  StatusChip 
} from '@/components/ui/drawer-kit';
import { AkIconButton } from '@/components/ui/AkIconButton';
import { AkDrawerScaffold } from '@/components/ui/AkDrawerScaffold';
import type { ActionRunResult } from '@/lib/actions/types';

interface CustomersRightDrawerProps {
  customer: Customer | null;
  onApplyAction: (result: ActionRunResult) => void;
  activities: ActivityEntry[];
  isOpen: boolean;
  onClose: () => void;
}

export const CustomersRightDrawer: React.FC<CustomersRightDrawerProps> = ({
  customer,
  onApplyAction,
  activities,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<CustomerTabId>('context');

  if (!isOpen) return null;

  if (!customer) {
    return (
      <div className={clsx(
        "fixed inset-y-0 right-0 lg:relative lg:inset-auto h-full flex flex-col border-l border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] transition-all duration-300 ease-in-out z-20",
        isOpen ? "w-[360px] translate-x-0 opacity-100" : "w-0 translate-x-full opacity-0 pointer-events-none"
      )}>
        <AkDrawerScaffold
          header={<DrawerHeader title="Kunden-KI" subtitle="Keine Auswahl" onClose={onClose} />}
        >
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 h-full">
            <div className="h-20 w-20 rounded-[var(--ak-radius-2xl)] bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center shadow-sm">
              <QuestionMarkCircleIcon className="w-10 h-10 text-[var(--ak-color-text-muted)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--ak-color-text-primary)]">Kein Kunde ausgewählt</p>
            <p className="text-xs text-[var(--ak-color-text-muted)] font-medium leading-relaxed">
              Wähle einen Kunden aus der Liste links aus, um KI-Einsichten und Aktionen zu sehen.
            </p>
          </div>
        </AkDrawerScaffold>
      </div>
    );
  }

  return (
    <div className={clsx(
      "fixed inset-y-0 right-0 lg:relative lg:inset-auto h-full flex flex-col border-l border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] transition-all duration-300 ease-in-out z-20",
      isOpen ? "w-[360px] translate-x-0 opacity-100" : "w-0 translate-x-full opacity-0 pointer-events-none"
    )}>
      <AkDrawerScaffold
        header={
          <DrawerHeader
            title="Kunden-KI"
            subtitle={customer.name}
            onClose={onClose}
            trailing={
              <div className="flex items-center gap-1">
                <StatusChip label="Synchron" variant="success" size="xs" />
                <AkIconButton size="sm" variant="ghost" title="Shortcuts">
                  <QuestionMarkCircleIcon className="w-4 h-4" />
                </AkIconButton>
                <AkIconButton size="sm" variant="ghost" title="Mehr">
                  <EllipsisHorizontalIcon className="w-4 h-4" />
                </AkIconButton>
              </div>
            }
          />
        }
        bodyClassName="flex flex-col h-full overflow-hidden"
      >
        <div className="px-2 py-2 border-b border-[var(--ak-color-border-hairline)] bg-[var(--ak-color-bg-surface-muted)]/50 backdrop-blur-md">
          <CustomersDrawerTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="flex-1 overflow-y-auto ak-scrollbar p-5 space-y-5 bg-[var(--ak-color-bg-app)]">
          {activeTab === 'context' && (
            <CustomerContextPanel 
              customer={customer} 
              onEdit={() => console.log('Edit customer')} 
            />
          )}
          {activeTab === 'actions' && (
            <CustomerActionsPanel 
              customer={customer} 
              onApplyAction={onApplyAction} 
            />
          )}
          {activeTab === 'activity' && (
            <CustomerActivityPanel 
              activities={activities} 
            />
          )}
        </div>
      </AkDrawerScaffold>
    </div>
  );
};

