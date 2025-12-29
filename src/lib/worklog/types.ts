/**
 * WorkLog Types
 */

export type WorkLogType = 'ingress' | 'suggestion' | 'executed' | 'setup';

export type WorkLogChannel =
  | 'email'
  | 'telegram'
  | 'reviews'
  | 'website'
  | 'phone'
  | 'docs'
  | 'chat';

export interface WorkLogRef {
  kind: 'inbox' | 'customer' | 'doc' | 'action' | 'integration';
  id?: string;
  href?: string;
}

export interface WorkLogEntry {
  id: string;
  ts: string; // ISO timestamp
  type: WorkLogType;
  channel: WorkLogChannel;
  title: string;
  detail?: string;
  ref?: WorkLogRef;
}

export interface WorkLogFilters {
  type?: WorkLogType[];
  channel?: WorkLogChannel[];
  range?: 'today' | '7d' | '30d' | 'all';
}

