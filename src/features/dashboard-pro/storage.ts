import { DashboardProConfig } from './types'

const STORAGE_KEY = 'dashboard_pro_config'

export function loadConfig(): DashboardProConfig | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load dashboard config', e)
    return null
  }
}

export function saveConfig(config: DashboardProConfig) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (e) {
    console.error('Failed to save dashboard config', e)
  }
}

