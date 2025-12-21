'use client';

import React, { useState, useMemo } from 'react';
import { Notification, NotificationTabId, NotificationType } from './types';
import { MOCK_NOTIFICATIONS } from './mockNotifications';
import { NotificationTabs } from './NotificationTabs';
import { NotificationItem } from './NotificationItem';
import { XMarkIcon, BellIcon, InboxIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface NotificationCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (type: NotificationType, id?: string) => void;
}

export const NotificationCenterDrawer: React.FC<NotificationCenterDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<NotificationTabId>('new');
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'new':
        return notifications.filter(n => !n.done);
      case 'done':
        return notifications.filter(n => n.done);
      case 'all':
        return notifications;
      default:
        return notifications;
    }
  }, [activeTab, notifications]);

  const handleMarkDone = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, done: true, unread: false } : n
    ));
  };

  const handleOpenNotification = (n: Notification) => {
    // Mark as read
    setNotifications(prev => prev.map(item => 
      item.id === n.id ? { ...item, unread: false } : item
    ));
    
    // Navigate to target
    onNavigate(n.type, n.targetId);
  };

  const handleMarkAllDone = () => {
    setNotifications(prev => prev.map(n => ({ ...n, done: true, unread: false })));
  };

  // Close on ESC
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop for mobile / outside click */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[55] bg-black/5 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}
      <div className={clsx(
      "fixed inset-y-0 right-0 z-[60] flex flex-col w-full max-w-[400px] border-l border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-elevated)]/80 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-in-out sm:w-[400px]",
      isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
    )}>
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-[var(--ak-color-border-hairline)] bg-[var(--ak-glass-bg)]/50">
        <div className="flex items-center gap-2">
          <BellIcon className="w-5 h-5 text-gray-400" />
          <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-gray-600">
            Benachrichtigungen
          </h2>
        </div>
        <div className="flex items-center gap-1">
          {activeTab === 'new' && filteredNotifications.length > 0 && (
            <button 
              onClick={handleMarkAllDone}
              className="text-[10px] font-bold text-green-600 hover:text-green-700 px-2 py-1 rounded-lg transition-colors uppercase tracking-wider"
            >
              Alle erledigt
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors group"
            aria-label="Schließen"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>
      </div>

      <NotificationTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 overflow-y-auto ak-scrollbar p-2 space-y-1">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center p-8 opacity-40">
            {activeTab === 'done' ? (
              <ArchiveBoxIcon className="w-12 h-12 text-gray-300 mb-3" />
            ) : (
              <InboxIcon className="w-12 h-12 text-gray-300 mb-3" />
            )}
            <p className="text-sm font-medium text-gray-500">
              {activeTab === 'done' ? 'Keine erledigten Nachrichten.' : 'Alles erledigt! Keine neuen Benachrichtigungen.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <NotificationItem 
              key={n.id} 
              notification={n} 
              onOpen={handleOpenNotification}
              onMarkDone={handleMarkDone}
            />
          ))
        )}
      </div>

      {/* Footer / Context Hint */}
      <div className="px-4 py-3 bg-[var(--ak-glass-bg)]/30 border-t border-[var(--ak-color-border-hairline)] text-center">
        <p className="text-[10px] text-gray-400">
          Klicke auf eine Nachricht, um zum Kontext zu navigieren.
        </p>
      </div>
    </div>
    </>
  );
};

