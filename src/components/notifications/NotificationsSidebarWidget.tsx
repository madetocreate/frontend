'use client'

import clsx from 'clsx'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { AkListRow } from '@/components/ui/AkListRow'
import { WidgetCard } from '@/components/ui/WidgetCard'

export type NotificationsView = 'all' | 'unread' | 'mentions'

const NOTIFICATIONS = [
    { id: '1', title: 'System Update', subtitle: 'Wartungsarbeiten am Sonntag', type: 'info', time: '2h', unread: true },
    { id: '2', title: 'Lead Qualified', subtitle: 'Max Mustermann hat Score 85 erreicht', type: 'success', time: '4h', unread: false },
    { id: '3', title: 'Payment Failed', subtitle: 'Kreditkarte abgelaufen', type: 'error', time: '1d', unread: true },
    { id: '4', title: 'New Document', subtitle: 'Vertrag_Final.pdf hochgeladen', type: 'info', time: '1d', unread: false },
]

type NotificationsSidebarWidgetProps = {
  activeView?: NotificationsView
  onViewSelect?: (view: NotificationsView) => void
  onInfoClick?: () => void
}

export function NotificationsSidebarWidget({ activeView = 'all', onViewSelect, onInfoClick }: NotificationsSidebarWidgetProps) {
  return (
    <WidgetCard
      className="h-full border-none shadow-none bg-transparent"
      padding="sm"
      actions={
          <button onClick={onInfoClick} className="text-gray-400 hover:text-gray-600 transition-colors">
              <InformationCircleIcon className="h-5 w-5" />
          </button>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Filter Tabs */}
        <div className="flex p-1 bg-[var(--ak-color-bg-surface)] rounded-lg border border-[var(--ak-color-border-subtle)]">
            {['all', 'unread', 'mentions'].map((view) => (
                <button
                    key={view}
                    onClick={() => onViewSelect?.(view as NotificationsView)}
                    className={clsx(
                        "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                        activeView === view 
                            ? "bg-white text-[var(--ak-color-text-primary)] shadow-sm"
                            : "text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)]"
                    )}
                >
                    {view === 'all' && 'Alle'}
                    {view === 'unread' && 'Ungelesen'}
                    {view === 'mentions' && 'Erwähnungen'}
                </button>
            ))}
        </div>

        <div className="flex flex-col gap-1">
            <h3 className="px-3 text-xs font-medium text-[var(--ak-color-text-secondary)] uppercase tracking-wider mb-1">
              Heute
            </h3>
            <ul className="flex flex-col gap-1">
                {NOTIFICATIONS.map((notif) => {
                    let Icon = InformationCircleIcon
                    let colorClass = 'text-blue-500'
                    let bgClass = 'bg-blue-50'
                    if (notif.type === 'success') { Icon = CheckCircleIcon; colorClass = 'text-green-500'; bgClass='bg-green-50' }
                    if (notif.type === 'error') { Icon = ExclamationTriangleIcon; colorClass = 'text-red-500'; bgClass='bg-red-50' }

                    return (
                    <li key={notif.id}>
                        <AkListRow
                        title={notif.title}
                        subtitle={notif.subtitle}
                        leading={
                            <div className={clsx("h-8 w-8 rounded-full flex items-center justify-center", bgClass)}>
                                <Icon className={clsx('h-4 w-4', colorClass)} />
                            </div>
                        }
                        trailing={
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] text-gray-400">{notif.time}</span>
                                {notif.unread && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
                            </div>
                        }
                        />
                    </li>
                    )
                })}
            </ul>
        </div>
      </div>
    </WidgetCard>
  )
}
