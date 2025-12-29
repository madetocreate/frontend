/**
 * WorkLog Filtering
 */

import { WorkLogEntry, WorkLogFilters } from '@/lib/worklog/types';

/**
 * Apply filters to work log entries
 */
export function applyWorkLogFilters(
  entries: WorkLogEntry[],
  filters: WorkLogFilters
): WorkLogEntry[] {
  let filtered = [...entries];

  // Filter by type
  if (filters.type && filters.type.length > 0) {
    filtered = filtered.filter((entry) => filters.type!.includes(entry.type));
  }

  // Filter by channel
  if (filters.channel && filters.channel.length > 0) {
    filtered = filtered.filter((entry) => filters.channel!.includes(entry.channel));
  }

  // Filter by range
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

    filtered = filtered.filter((entry) => {
      const entryDate = new Date(entry.ts);
      return entryDate >= cutoff;
    });
  }

  return filtered;
}

