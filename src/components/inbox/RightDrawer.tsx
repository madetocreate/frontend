'use client';

import React, { useState } from 'react';
import { InboxItem } from '@/components/InboxDrawerWidget';
import { ContextPanel } from './ContextPanel';
import { ActionsPanel } from './ActionsPanel';
import { ActivityPanel, ActivityEntry } from './ActivityPanel';
import { DrawerEmptyState } from '@/components/ui/drawer-kit';
import { AkDrawerScaffold } from '@/components/ui/AkDrawerScaffold';
import { InspectorHeader } from '@/components/ui/drawer-kit/InspectorHeader';
import { DrawerTabItem } from '@/components/ui/drawer-kit/DrawerTabs';
import { 
  InboxIcon, 
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import type { ActionRunResult } from '@/lib/actions/types';

export type RightDrawerTabId = 'context' | 'actions' | 'activity';

interface RightDrawerProps {
  item: InboxItem | null;
  onApplyAction: (result: ActionRunResult) => void;
  activities: ActivityEntry[];
  onClose?: () => void;
  isOpen: boolean;
}

export const RightDrawer: React.FC<RightDrawerProps> = ({ 
  item, 
  onApplyAction, 
  activities,
  onClose,
  isOpen
}) => {
  const [activeTab, setActiveTab] = useState<RightDrawerTabId>('context');

  const tabs: DrawerTabItem[] = [
    { id: 'context', label: 'Kontext' },
    { id: 'actions', label: 'Aktionen' },
    { id: 'activity', label: 'Verlauf' },
  ];

  const content = item ? (
    <div className="flex-1 overflow-y-auto ak-scrollbar p-1">
      {activeTab === 'context' && <ContextPanel item={item} />}
      {activeTab === 'actions' && <ActionsPanel item={item} onApplyAction={onApplyAction} />}
      {activeTab === 'activity' && <ActivityPanel activities={activities} />}
    </div>
  ) : (
    <div className="flex flex-col h-full items-center justify-center">
      <DrawerEmptyState
        icon={<InboxIcon className="h-10 w-10" />}
        title="Posteingang"
        description="Wähle eine Nachricht aus, um Kontextinfos und KI-Aktionen zu sehen."
        primaryAction={{
          label: "Zusammenfassung",
          shortcut: "S",
          onClick: () => console.log('Summary')
        }}
        secondaryActions={[
          { label: "Posteingang filtern", shortcut: "F", onClick: () => console.log('Filter') },
          { label: "Neue Nachricht", shortcut: "N", onClick: () => console.log('New') }
        ]}
      />
    </div>
  );

  return (
    <div className={clsx(
      "fixed inset-y-0 right-0 lg:relative lg:inset-auto h-full flex flex-col border-l border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] dark:bg-[var(--ak-color-graphite-surface)] transition-all duration-300 ease-in-out z-20",
      isOpen ? "w-[360px] opacity-100" : "w-0 translate-x-full opacity-0 pointer-events-none"
    )}>
      <AkDrawerScaffold
        header={
          <InspectorHeader
            icon={InboxIcon}
            title={item ? "Kontext & Aktionen" : "Übersicht"}
            subtitle={item ? item.title : "Smart Inbox"}
            onClose={onClose!}
            tabs={item ? tabs : undefined}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as RightDrawerTabId)}
          />
        }
        title={null}
        headerClassName="!p-0"
        bodyClassName="flex flex-col h-full overflow-hidden"
      >
        {content}
      </AkDrawerScaffold>
    </div>
  );
};
