'use client';

import React, { useState } from 'react';
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
        "fixed inset-y-0 right-0 lg:relative lg:inset-auto h-full flex flex-col border-l border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)]/80 backdrop-blur-xl transition-all duration-300 ease-in-out z-20",
        isOpen ? "w-[360px] translate-x-0 opacity-100" : "w-0 translate-x-full opacity-0 pointer-events-none"
      )}>
        <DrawerHeader title="Kunden-KI" subtitle="Keine Auswahl" onClose={onClose} />
        <div className="flex-1 flex items-center justify-center p-8 text-center opacity-40">
          <p className="text-xs font-medium">Wähle einen Kunden aus der Liste.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      "fixed inset-y-0 right-0 lg:relative lg:inset-auto h-full flex flex-col border-l border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)]/80 backdrop-blur-xl transition-all duration-300 ease-in-out z-20",
      isOpen ? "w-[360px] translate-x-0 opacity-100" : "w-0 translate-x-full opacity-0 pointer-events-none"
    )}>
      <AkDrawerScaffold
        title={
          <DrawerHeader
            title="Kunden-KI"
            subtitle={customer.name}
            onClose={onClose}
            trailing={
              <>
                <StatusChip label="Synchronisiert" variant="success" size="xs" />
                <AkIconButton size="sm" variant="ghost" title="Shortcuts">
                  <QuestionMarkCircleIcon className="w-4 h-4" />
                </AkIconButton>
                <AkIconButton size="sm" variant="ghost" title="Mehr">
                  <EllipsisHorizontalIcon className="w-4 h-4" />
                </AkIconButton>
              </>
            }
          />
        }
        headerClassName="!p-0"
        bodyClassName="flex flex-col h-full overflow-hidden"
      >
        <div className="px-2 py-2 border-b border-[var(--ak-color-border-hairline)] bg-[var(--ak-color-bg-surface-muted)]/30">
          <CustomersDrawerTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="flex-1 overflow-y-auto ak-scrollbar p-4 space-y-4 bg-[var(--ak-color-bg-app)]">
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

