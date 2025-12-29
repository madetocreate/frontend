import { InboxItem } from './types';
import { authedFetch } from '@/lib/api/authedFetch';

// API Response Types
export interface SendMessageResponse {
  ok: boolean;
  messageId?: string;
  error?: string | { code: string; message: string };
}

export interface IntegrationIdentity {
  id: string;
  provider: string;
  label: string;
  fromAddress?: string;
  connected: boolean;
  type?: 'primary' | 'system' | 'user';
}

export interface IntegrationsStatus {
  email: IntegrationIdentity[];
  messenger: IntegrationIdentity[];
  review: IntegrationIdentity[];
  support: IntegrationIdentity[];
}

// API Functions
export async function sendInboxMessage(payload: {
  channel: string;
  to?: string;
  subject?: string;
  body: string;
  connectionId?: string;
  identity?: { provider: string; from?: string };
  threadId?: string;
  inboxItemId?: string;
  reviewId?: string;
}): Promise<SendMessageResponse> {
  const response = await authedFetch('/api/communications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  // Parse JSON manually to handle non-ok responses with JSON bodies
  const data = await response.json();
  if (!response.ok) {
      throw new Error(data.error?.message || data.error || 'Failed to send message');
  }
  return data;
}

export async function getIntegrationsStatus(): Promise<IntegrationsStatus> {
  const response = await authedFetch('/api/integrations/status');
  if (!response.ok) {
    throw new Error('Failed to fetch integrations status');
  }
  return response.json();
}

export async function markInboxItemRead(itemId: string): Promise<void> {
  const response = await authedFetch(`/api/inbox/${itemId}/read`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to mark as read');
}

export async function archiveInboxItem(itemId: string): Promise<void> {
  const response = await authedFetch(`/api/inbox/${itemId}/archive`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to archive');
}

