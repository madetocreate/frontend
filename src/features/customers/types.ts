/**
 * Customers Types
 */

export type CustomerType = 'company' | 'contact';
export type CustomerTag = 'lead' | 'stammkunde' | 'vip';
export type Channel = 'email' | 'telegram' | 'reviews' | 'website' | 'phone' | 'docs';
export type CustomerEventType = 'message' | 'review' | 'lead' | 'call' | 'doc' | 'note';

export interface Customer {
  id: string;
  type: CustomerType;
  displayName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  tags: CustomerTag[];
  lastActivityAt: string; // ISO string
  lastActivitySummary: string;
  counters?: {
    openItems?: number;
  };
}

export interface CustomerEvent {
  id: string;
  customerId: string;
  channel: Channel;
  type: CustomerEventType;
  title: string;
  preview: string;
  timestamp: string; // ISO string
  meta?: Record<string, unknown>;
}

export interface CustomersFilters {
  type?: CustomerType;
  tag?: CustomerTag[];
  range?: 'today' | '7d' | '30d' | 'all';
  ch?: Channel[];
}

