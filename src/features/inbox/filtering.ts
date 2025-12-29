import { InboxItem, InboxFilters } from './types';

/**
 * Apply filters to inbox items
 */
export function applyInboxFilters(
  items: InboxItem[],
  filters: InboxFilters
): InboxItem[] {
  let filtered = [...items];

  // Filter by sources
  if (filters.src && filters.src.length > 0) {
    filtered = filtered.filter((item) => filters.src!.includes(item.source));
  }

  // Filter by status
  if (filters.status) {
    filtered = filtered.filter((item) => item.status === filters.status);
  }

  // Filter by time range
  if (filters.range && filters.range !== 'all') {
    const now = new Date();
    const cutoff = new Date();

    switch (filters.range) {
      case 'today':
        cutoff.setHours(0, 0, 0, 0);
        break;
      case '7d':
        cutoff.setDate(cutoff.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(cutoff.getDate() - 30);
        break;
    }

    filtered = filtered.filter((item) => item.timestamp >= cutoff);
  }

  return filtered;
}

/**
 * Get summary stats from items
 */
export function getInboxSummary(items: InboxItem[]): {
  total: number;
  needsAction: number;
  open: number;
  archived: number;
} {
  return {
    total: items.length,
    needsAction: items.filter((item) => item.status === 'needs_action').length,
    open: items.filter((item) => item.status === 'open').length,
    archived: items.filter((item) => item.status === 'archived').length,
  };
}

