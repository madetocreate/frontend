'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Notification, NotificationTabId, NotificationType } from './types';
import { MOCK_NOTIFICATIONS } from './mockNotifications';

// Only import MOCK_NOTIFICATIONS for dev fallback
import { NotificationTabs } from './NotificationTabs';
import { NotificationItem } from './NotificationItem';
import { NotificationActivityTab } from './NotificationActivityTab';
import { DrawerHeader } from '@/components/ui/drawer-kit';
import { AkDrawerScaffold } from '@/components/ui/AkDrawerScaffold';
import { XMarkIcon, BellIcon, InboxIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { authedFetch } from '@/lib/api/authedFetch';

interface NotificationCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (type: NotificationType, id?: string) => void;
  tenantId?: string;
}

function normalizeNotification(raw: any): Notification {
  const id = raw.id || raw.notification_id || raw._id || Math.random().toString(36).slice(2, 10);
  const type = (raw.type || raw.category || 'inbox') as NotificationType;
  const title = raw.title || raw.subject || raw.summary || 'Benachrichtigung';
  const subline = raw.subline || raw.message || raw.body || '';
  
  // Timestamp handling
  let timestamp = 'Gerade eben';
  if (raw.timestamp || raw.created_at || raw.createdAt) {
    const date = new Date(raw.timestamp || raw.created_at || raw.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) timestamp = 'Gerade eben';
    else if (diffMins < 60) timestamp = `vor ${diffMins} Min.`;
    else if (diffHours < 24) timestamp = `vor ${diffHours} Std.`;
    else if (diffDays === 1) timestamp = 'Gestern';
    else timestamp = `vor ${diffDays} Tagen`;
  }
  
  const unread = raw.unread ?? (!raw.read && !raw.read_at);
  const done = raw.done ?? raw.muted ?? raw.archived ?? false;
  const targetId = raw.target_id || raw.targetId;
  
  return { id, type, title, subline, timestamp, unread, done, targetId };
}

export const NotificationCenterDrawer: React.FC<NotificationCenterDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  tenantId
}) => {
  const [activeTab, setActiveTab] = useState<NotificationTabId>('new');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications when drawer opens
  useEffect(() => {
    if (!isOpen || !tenantId) return;
    
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await authedFetch(
          `/api/notifications?tenant_id=${tenantId}&filter=all&unread_only=false`,
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch notifications: ${response.statusText}`);
        }
        
        const data = await response.json();
        // Handle both array and { items: [...] } formats
        const items = Array.isArray(data) ? data : (data.items || []);
        const normalized = items.map(normalizeNotification);
        setNotifications(normalized);
      } catch (err) {
        console.error('[NotificationCenterDrawer] Failed to fetch notifications:', err);
        setError(err instanceof Error ? err.message : 'Fehler beim Laden der Benachrichtigungen');
        // Fallback to mock in dev
        if (process.env.NODE_ENV !== 'production') {
          setNotifications(MOCK_NOTIFICATIONS);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [isOpen, tenantId]);

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

  const handleMarkDone = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, done: true, unread: false } : n
    ));
    
    // API call
    if (tenantId) {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const { authedFetch } = await import('@/lib/api/authedFetch')
        await authedFetch('/api/notifications', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            action: 'mute',
            notification_id: id,
            tenant_id: tenantId,
          }),
        });
      } catch (err) {
        console.error('[NotificationCenterDrawer] Failed to mute notification:', err);
        // Revert optimistic update on error
        setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, done: false } : n
        ));
      }
    }
  };

  const handleOpenNotification = async (n: Notification) => {
    // Optimistic update: Mark as read
    setNotifications(prev => prev.map(item => 
      item.id === n.id ? { ...item, unread: false } : item
    ));
    
    // API call
    if (tenantId) {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const { authedFetch } = await import('@/lib/api/authedFetch')
        await authedFetch('/api/notifications', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            action: 'mark-read',
            notification_id: n.id,
            tenant_id: tenantId,
          }),
        });
      } catch (err) {
        console.error('[NotificationCenterDrawer] Failed to mark notification as read:', err);
        // Revert optimistic update on error
        setNotifications(prev => prev.map(item => 
          item.id === n.id ? { ...item, unread: true } : item
        ));
      }
    }
    
    // Navigate to target
    onNavigate(n.type, n.targetId);
  };

  const handleMarkAllDone = async () => {
    const toMark = filteredNotifications.filter(n => !n.done);
    if (toMark.length === 0 || !tenantId) return;
    
    // Optimistic update
    setNotifications(prev => prev.map(n => 
      toMark.some(t => t.id === n.id) ? { ...n, done: true, unread: false } : n
    ));
    
    // API calls with concurrency limit (4 parallel)
    const BATCH_SIZE = 4;
    for (let i = 0; i < toMark.length; i += BATCH_SIZE) {
      const batch = toMark.slice(i, i + BATCH_SIZE);
      
      await Promise.allSettled(
        batch.map(async (n) => {
          try {
            await authedFetch('/api/notifications', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'mute',
                notification_id: n.id,
                tenant_id: tenantId,
              }),
            });
          } catch (err) {
            console.error(`[NotificationCenterDrawer] Failed to mute notification ${n.id}:`, err);
          }
        })
      );
    }
  };

  // Close on ESC via centralized event
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = () => onClose();
    window.addEventListener('ak-escape-pressed', handler);
    return () => window.removeEventListener('ak-escape-pressed', handler);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop for mobile / outside click */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[55] bg-[var(--ak-color-bg-app)]/15 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}
      <div 
        className={clsx(
          "fixed inset-y-0 right-0 z-[60] flex flex-col w-full max-w-[400px] border-l border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-elevated)]/80 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-in-out sm:w-[400px]",
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Benachrichtigungen"
      >
        <AkDrawerScaffold
          header={
            <DrawerHeader
              title="Benachrichtigungen"
              leading={<BellIcon className="w-4 h-4" />}
              trailing={
                <>
                  {activeTab === 'new' && filteredNotifications.length > 0 && (
                    <button 
                      onClick={handleMarkAllDone}
                      className="text-[11px] font-medium text-[var(--ak-semantic-success)] hover:text-[var(--ak-semantic-success-strong)] px-2 py-1 rounded-lg transition-colors"
                    >
                      Alle erledigt
                    </button>
                  )}
                </>
              }
              onClose={onClose}
              showHelp={false}
            />
          }
          footer={
            <div className="px-4 py-3 bg-[var(--ak-glass-bg)]/30 text-center">
              <p className="text-[10px] ak-text-muted">
                Klicke auf eine Nachricht, um zum Kontext zu navigieren.
              </p>
            </div>
          }
          bodyClassName="flex flex-col h-full overflow-hidden"
        >
          <NotificationTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          {activeTab === 'activity' ? (
            <NotificationActivityTab />
          ) : (
            <div className="flex-1 overflow-y-auto ak-scrollbar p-2 space-y-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ak-color-accent)] mb-3" />
                  <p className="text-sm font-medium ak-text-secondary">
                    Lade Benachrichtigungen…
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-center p-8 opacity-40">
                  <InboxIcon className="w-12 h-12 ak-text-muted mb-3" />
                  <p className="text-sm font-medium ak-text-secondary">
                    {error}
                  </p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-center p-8 opacity-40">
                  {activeTab === 'done' ? (
                    <ArchiveBoxIcon className="w-12 h-12 ak-text-muted mb-3" />
                  ) : (
                    <InboxIcon className="w-12 h-12 ak-text-muted mb-3" />
                  )}
                  <p className="text-sm font-medium ak-text-secondary">
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
          )}
        </AkDrawerScaffold>
      </div>
    </>
  );
};

