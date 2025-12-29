export type NotificationType = 'inbox' | 'customer' | 'document' | 'review' | 'growth';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  subline: string;
  timestamp: string;
  unread: boolean;
  done: boolean;
  targetId?: string;
}

export type NotificationTabId = 'new' | 'done' | 'all' | 'activity';

