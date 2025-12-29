'use client';

import { useState, useEffect, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { SystemNotification, loadNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/notifications/system';
import { AkPopover } from '@/components/ui/AkPopover';
import { useAklowEscape } from '@/hooks/useAklowEscape';

interface NotificationsDropdownProps {
  className?: string;
}

export function NotificationsDropdown({ className }: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // Load notifications
  useEffect(() => {
    const load = () => setNotifications(loadNotifications());
    load();
    
    // Listen for notification updates
    const handleUpdate = () => load();
    window.addEventListener('aklow-notification-added', handleUpdate);
    window.addEventListener('aklow-notifications-updated', handleUpdate);
    
    return () => {
      window.removeEventListener('aklow-notification-added', handleUpdate);
      window.removeEventListener('aklow-notifications-updated', handleUpdate);
    };
  }, []);

  // AkPopover handles outside click automatically

  // ESC: zentralisiertes Escape-Handling
  useAklowEscape({ enabled: isOpen, onEscape: () => setIsOpen(false) });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    setNotifications(loadNotifications());
  };

  const handleNotificationClick = (notification: SystemNotification) => {
    // Mark as read if not already read
    if (!notification.read) {
      markNotificationRead(notification.id);
      setNotifications(loadNotifications());
    }
    
    // Navigate if actionLink present
    if (notification.actionLink) {
      setIsOpen(false);
      router.push(notification.actionLink);
    }
  };

  const formatTime = (ts: string): string => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `Vor ${diffMins} Min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Vor ${diffHours} Std`;
    return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  };

  return (
    <div className={clsx('relative flex items-center', className)}>
      <button
        ref={anchorRef}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ak-icon-interactive ak-focus-ring",
          isOpen 
            ? "bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-accent)] shadow-sm" 
            : "text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]"
        )}
        aria-label="Benachrichtigungen"
      >
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--ak-color-accent)] border-2 border-[var(--ak-color-bg-surface)] ring-1 ring-[var(--ak-color-accent-soft)]" />
        )}
      </button>

      <AkPopover
        open={isOpen}
        anchorRef={anchorRef}
        onClose={() => setIsOpen(false)}
        className="w-80 max-h-[480px] flex flex-col"
        align="right"
        side="bottom"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface-muted)]/30">
          <h3 className="text-sm font-semibold text-[var(--ak-color-text-primary)]">
            Benachrichtigungen
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-medium text-[var(--ak-color-accent)] hover:text-[var(--ak-color-accent-strong)] transition-colors ak-focus-ring rounded-md px-2 py-1 hover:bg-[var(--ak-color-accent-soft)]/20"
            >
              Alle als gelesen
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto ak-scrollbar">
          {notifications.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center mx-auto mb-3">
                <BellIcon className="w-6 h-6 text-[var(--ak-color-text-muted)] opacity-50" />
              </div>
              <p className="text-sm text-[var(--ak-color-text-muted)]">
                Keine Benachrichtigungen
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--ak-color-border-fine)]">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={clsx(
                    'w-full px-4 py-3 text-left hover:bg-[var(--ak-color-bg-hover)] transition-all duration-200 ak-focus-ring group',
                    !notification.read && 'bg-[var(--ak-color-accent-soft)]/10',
                    notification.actionLink && 'cursor-pointer'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={clsx(
                        'w-2 h-2 rounded-full mt-1.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-125',
                        !notification.read
                          ? 'bg-[var(--ak-color-accent)] ak-shadow-colored'
                          : 'bg-transparent'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={clsx(
                          'text-sm leading-tight',
                          !notification.read
                            ? 'font-semibold text-[var(--ak-color-text-primary)]'
                            : 'text-[var(--ak-color-text-secondary)]'
                        )}
                      >
                        {notification.title}
                      </p>
                      {notification.body && (
                        <p className="text-[13px] text-[var(--ak-color-text-muted)] mt-1 line-clamp-2">
                          {notification.body}
                        </p>
                      )}
                      <p className="text-[11px] text-[var(--ak-color-text-muted)] mt-1.5 font-medium opacity-70">
                        {formatTime(notification.ts)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface-muted)]/10">
          <button
            onClick={() => {
              setIsOpen(false);
              router.push('/notifications');
            }}
            className="w-full text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-accent)] transition-colors py-1.5"
          >
            Alle Benachrichtigungen anzeigen
          </button>
        </div>
      </AkPopover>
    </div>
  );
}

