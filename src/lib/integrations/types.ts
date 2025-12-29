/**
 * Integration Types
 */

export type IntegrationId = 'email' | 'telegram' | 'reviews' | 'website_bot' | 'phone_bot';

export interface IntegrationStatus {
  id: IntegrationId;
  connected: boolean;
  connectedAt?: string;
  lastEventAt?: string;
  summary?: string;
}

