/**
 * System Notifications Helper
 * Exports functions to create system notifications
 */

export interface SystemNotification {
  id: string;
  title: string;
  body?: string;
  ts: string;
  read: boolean;
  level?: 'info' | 'success' | 'warning' | 'error';
  source?: string;
  actionLink?: string;
}

const STORAGE_KEY = 'aklow.v2.notifications';

export function loadNotifications(): SystemNotification[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Seed demo notifications if empty (only on first load)
      const demo: SystemNotification[] = [
        {
          id: '1',
          title: 'Sync erfolgreich',
          body: 'Alle Daten wurden synchronisiert',
          ts: new Date().toISOString(),
          read: false,
          level: 'success',
        },
        {
          id: '2',
          title: 'Action fertig',
          body: 'inbox.draft_reply wurde erfolgreich ausgeführt',
          ts: new Date(Date.now() - 60000).toISOString(),
          read: false,
          level: 'info',
        },
        {
          id: '3',
          title: 'Neue Integration verfügbar',
          body: 'Google Calendar kann jetzt verbunden werden',
          ts: new Date(Date.now() - 3600000).toISOString(),
          read: true,
          level: 'info',
        },
      ];
      saveNotifications(demo);
      return demo;
    }
    return JSON.parse(stored) as SystemNotification[];
  } catch (error) {
    console.warn('Failed to load notifications:', error);
    return [];
  }
}

export function saveNotifications(notifications: SystemNotification[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.warn('Failed to save notifications:', error);
  }
}

/**
 * Add a system notification
 */
export function addSystemNotification(notification: Omit<SystemNotification, 'id' | 'ts' | 'read'>): void {
  const notifications = loadNotifications();
  
  const newNotification: SystemNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ts: new Date().toISOString(),
    read: false,
  };
  
  // Add to beginning (newest first)
  notifications.unshift(newNotification);
  
  // Keep only last 50 notifications
  const trimmed = notifications.slice(0, 50);
  
  saveNotifications(trimmed);
  
  // Dispatch event to update UI
  window.dispatchEvent(new CustomEvent('aklow-notification-added', { detail: newNotification }));
}

/**
 * Mark notification as read
 */
export function markNotificationRead(id: string): void {
  const notifications = loadNotifications();
  const updated = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  saveNotifications(updated);
  window.dispatchEvent(new CustomEvent('aklow-notifications-updated'));
}

/**
 * Mark all notifications as read
 */
export function markAllNotificationsRead(): void {
  const notifications = loadNotifications();
  const updated = notifications.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
  window.dispatchEvent(new CustomEvent('aklow-notifications-updated'));
}

/**
 * Create notification for action completed
 */
export function notifyActionCompleted(actionId: string, targetTitle?: string, actionLink?: string): void {
  const actionLabel = actionId.replace(/^[^.]+\./, '').replace(/_/g, ' ');
  
  addSystemNotification({
    title: 'Action abgeschlossen',
    body: targetTitle 
      ? `${actionLabel} für "${targetTitle}"`
      : actionLabel,
    level: 'success',
    source: 'action',
    actionLink,
  });
}

/**
 * Create notification for action failed
 */
export function notifyActionFailed(actionId: string, errorMessage: string, targetTitle?: string, actionLink?: string): void {
  const actionLabel = actionId.replace(/^[^.]+\./, '').replace(/_/g, ' ');
  
  addSystemNotification({
    title: 'Action fehlgeschlagen',
    body: targetTitle
      ? `${actionLabel} für "${targetTitle}": ${errorMessage}`
      : `${actionLabel}: ${errorMessage}`,
    level: 'error',
    source: 'action',
    actionLink,
  });
}

