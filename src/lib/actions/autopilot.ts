/**
 * Autopilot Preferences Storage
 * V1: localStorage-based prefs per action_id
 */

export type AutopilotLevel = 1 | 2 | 3;

export interface AutopilotPrefs {
  [actionId: string]: AutopilotLevel;
}

const STORAGE_KEY = 'aklow.v2.autopilotPrefs';

/**
 * Load autopilot preferences
 */
export function loadAutopilotPrefs(): AutopilotPrefs {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {};
    }
    return JSON.parse(stored) as AutopilotPrefs;
  } catch (error) {
    console.warn('Failed to load autopilot prefs from localStorage:', error);
    return {};
  }
}

/**
 * Save autopilot preferences
 */
export function saveAutopilotPrefs(prefs: AutopilotPrefs): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error('Failed to save autopilot prefs to localStorage:', error);
  }
}

/**
 * Get autopilot level for an action
 */
export function getAutopilotLevel(actionId: string): AutopilotLevel {
  const prefs = loadAutopilotPrefs();
  return prefs[actionId] || 1; // Default: Level 1 (Vorschlagen)
}

/**
 * Set autopilot level for an action
 */
export function setAutopilotLevel(actionId: string, level: AutopilotLevel): void {
  const prefs = loadAutopilotPrefs();
  prefs[actionId] = level;
  saveAutopilotPrefs(prefs);
}

/**
 * Get autopilot level label
 */
export function getAutopilotLevelLabel(level: AutopilotLevel): string {
  switch (level) {
    case 1:
      return 'Vorschlagen';
    case 2:
      return 'Vorbereiten';
    case 3:
      return 'Ausführen';
    default:
      return 'Vorschlagen';
  }
}

