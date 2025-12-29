/**
 * WorkLog Helpers
 */

import { WorkLogEntry, WorkLogType, WorkLogChannel, WorkLogRef } from './types';

/**
 * Create a work log entry
 */
export function createWorkLogEntry({
  type,
  channel,
  title,
  detail,
  ref,
}: {
  type: WorkLogType;
  channel: WorkLogChannel;
  title: string;
  detail?: string;
  ref?: WorkLogRef;
}): WorkLogEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ts: new Date().toISOString(),
    type,
    channel,
    title,
    detail,
    ref,
  };
}

