'use client';

import { useState, useEffect } from 'react';
import { loadNotifications, markAllNotificationsRead, SystemNotification, markNotificationRead } from '@/lib/notifications/system';
import { AkButton } from '@/components/ui/AkButton';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<SystemNotification[]>(loadNotifications);
  const router = useRouter();

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    setNotifications(loadNotifications());
  };

  const handleClick = (n: SystemNotification) => {
    if (!n.read) {
      markNotificationRead(n.id);
      setNotifications(loadNotifications());
    }
    if (n.actionLink) {
      router.push(n.actionLink);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ak-color-text-primary)]">Benachrichtigungen</h1>
          <p className="text-[var(--ak-color-text-secondary)]">Alle Updates und Hinweise</p>
        </div>
        {notifications.some(n => !n.read) && (
          <AkButton variant="secondary" onClick={handleMarkAllRead} leftIcon={<CheckCircleIcon className="w-4 h-4" />}>
            Alle als gelesen markieren
          </AkButton>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-[var(--ak-color-bg-surface)] rounded-xl border border-[var(--ak-color-border-subtle)]">
            <BellIcon className="w-12 h-12 text-[var(--ak-color-text-muted)] mx-auto mb-3" />
            <p className="text-[var(--ak-color-text-secondary)]">Keine Benachrichtigungen vorhanden</p>
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id}
              onClick={() => handleClick(n)}
              className={clsx(
                "p-4 rounded-xl border transition-all cursor-pointer flex gap-4 items-start",
                n.read 
                  ? "bg-[var(--ak-color-bg-surface)] border-[var(--ak-color-border-subtle)]" 
                  : "bg-[var(--ak-color-bg-surface-elevated)] border-[var(--ak-color-accent-subtle)] shadow-sm"
              )}
            >
               <div className={clsx(
                 "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                 n.read ? "bg-transparent" : "bg-[var(--ak-color-accent)]"
               )} />
               <div className="flex-1">
                 <div className="flex justify-between items-start">
                   <h3 className={clsx("font-medium", n.read ? "text-[var(--ak-color-text-secondary)]" : "text-[var(--ak-color-text-primary)]")}>
                     {n.title}
                   </h3>
                   <span className="text-xs text-[var(--ak-color-text-muted)] whitespace-nowrap ml-2">
                     {new Date(n.ts).toLocaleString()}
                   </span>
                 </div>
                 {n.body && <p className="text-sm text-[var(--ak-color-text-secondary)] mt-1">{n.body}</p>}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

