/**
 * WorkLog Storage (localStorage)
 */

import { WorkLogEntry } from './types';

const STORAGE_KEY = 'aklow.v2.worklog';

/**
 * Load all work log entries from localStorage
 */
export function loadWorkLog(): WorkLogEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as WorkLogEntry[];
    // Sort by timestamp (newest first)
    return parsed.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  } catch (error) {
    console.warn('Failed to load work log from localStorage:', error);
    return [];
  }
}

/**
 * Save work log entries to localStorage
 */
export function saveWorkLog(entries: WorkLogEntry[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Failed to save work log to localStorage:', error);
  }
}

/**
 * Append a new entry to the work log
 */
export function appendWorkLog(entry: WorkLogEntry): void {
  const entries = loadWorkLog();
  entries.unshift(entry); // Add to beginning (newest first)
  saveWorkLog(entries);
}

/**
 * Clear all work log entries
 */
export function clearWorkLog(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear work log from localStorage:', error);
  }
}

