/**
 * Integration Status Storage (localStorage)
 */

import { IntegrationId, IntegrationStatus } from './types';
import { INTEGRATIONS_CATALOG } from './catalog';

const STORAGE_KEY = 'aklow.v2.integrations';

/**
 * Load all integration statuses from localStorage
 * Returns default status (all connected=false) if not found
 */
export function loadIntegrationStatuses(): Record<IntegrationId, IntegrationStatus> {
  if (typeof window === 'undefined') {
    // SSR: return defaults
    return getDefaultStatuses();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultStatuses();
    }

    const parsed = JSON.parse(stored) as Record<string, Partial<IntegrationStatus>>;
    
    // Merge with defaults to ensure all integrations are present
    const defaults = getDefaultStatuses();
    const result: Record<IntegrationId, IntegrationStatus> = { ...defaults };

    for (const id of INTEGRATIONS_CATALOG.map((item) => item.id)) {
      if (parsed[id]) {
        result[id] = {
          ...defaults[id],
          ...parsed[id],
        };
      }
    }

    return result;
  } catch (error) {
    console.warn('Failed to load integration statuses from localStorage:', error);
    return getDefaultStatuses();
  }
}

/**
 * Save integration statuses to localStorage
 */
export function saveIntegrationStatuses(
  statuses: Record<IntegrationId, IntegrationStatus>
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
  } catch (error) {
    console.error('Failed to save integration statuses to localStorage:', error);
  }
}

/**
 * Set connection status for a specific integration
 */
export function setConnected(
  id: IntegrationId,
  connected: boolean,
  meta?: {
    connectedAt?: string;
    lastEventAt?: string;
    summary?: string;
  }
): void {
  const statuses = loadIntegrationStatuses();
  statuses[id] = {
    ...statuses[id],
    connected,
    ...(connected && meta?.connectedAt && { connectedAt: meta.connectedAt }),
    ...(meta?.lastEventAt && { lastEventAt: meta.lastEventAt }),
    ...(meta?.summary && { summary: meta.summary }),
  };
  saveIntegrationStatuses(statuses);
}

/**
 * Get default statuses (all disconnected)
 */
function getDefaultStatuses(): Record<IntegrationId, IntegrationStatus> {
  const result: Record<IntegrationId, IntegrationStatus> = {} as Record<
    IntegrationId,
    IntegrationStatus
  >;

  for (const item of INTEGRATIONS_CATALOG) {
    result[item.id] = {
      id: item.id,
      connected: false,
    };
  }

  return result;
}

