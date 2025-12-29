/**
 * Inbox Types
 */

export type InboxSource = 'email' | 'telegram' | 'reviews' | 'website' | 'phone' | 'marketing';
export type InboxStatus = 'needs_action' | 'open' | 'archived';
export type InboxItemType = 'message' | 'review' | 'lead' | 'call';

export interface InboxAttachment {
  id: string;
  filename: string;
  contentType: string;
  url: string;
  size?: number;
}

export interface InboxItem {
  id: string;
  source: InboxSource;
  type: InboxItemType;
  status: InboxStatus;
  title: string;
  preview: string;
  timestamp: Date;
  
  // Content Details
  body?: string; // Plain text content
  html?: string; // HTML content (safe)
  attachments?: InboxAttachment[];
  
  // Threading / Context
  threadId?: string;
  messageId?: string;
  replyTo?: string; // Message-ID for replies
  recipients?: {
    to: string[];
    cc?: string[];
    bcc?: string[];
  };
  
  // Customer Info
  customerName?: string;
  customerEmail?: string;
  
  // Meta & Actions
  meta?: Record<string, unknown>;
  suggestedActions?: Array<{
    id: string;
    label: string;
    icon?: string;
    actionId?: string; // Für Fast Actions
  }>;
  
  // Demo Flag
  isDemo?: boolean; // Marks demo/example items (from backend: is_demo)
}

export interface InboxFilters {
  src?: InboxSource[];
  status?: InboxStatus;
  range?: 'today' | '7d' | '30d' | 'all';
}
