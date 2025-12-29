/**
 * Recent Commands Storage
 * Stores the last 5 executed commands in localStorage
 */

export interface RecentCommand {
  id: string;
  title: string;
  ts: number;
}

const STORAGE_KEY = 'aklow.v2.cmdk.recent';
const MAX_RECENT = 5;

export function loadRecentCommands(): RecentCommand[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as RecentCommand[];
  } catch (error) {
    console.warn('Failed to load recent commands:', error);
    return [];
  }
}

export function saveRecentCommands(commands: RecentCommand[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Keep only the last MAX_RECENT commands
    const recent = commands.slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
  } catch (error) {
    console.warn('Failed to save recent commands:', error);
  }
}

export function addRecentCommand(id: string, title: string): void {
  const recent = loadRecentCommands();
  
  // Remove if already exists (to avoid duplicates)
  const filtered = recent.filter((cmd) => cmd.id !== id);
  
  // Add to beginning
  const updated: RecentCommand[] = [
    { id, title, ts: Date.now() },
    ...filtered,
  ];
  
  saveRecentCommands(updated);
}

