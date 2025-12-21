/**
 * Settings Test Utilities - Smoke Tests für Settings-Funktionalität
 */

import { loadSettings, saveSettings, getOnboardingProgress, trackOnboardingStep, getIntegrationStatus } from './settingsClient'

export interface SmokeTestResult {
  name: string
  success: boolean
  error?: string
  duration: number
}

/**
 * Führe alle Settings Smoke Tests durch
 */
export async function runSettingsSmokeTests(): Promise<SmokeTestResult[]> {
  const results: SmokeTestResult[] = []
  
  // Test 1: Load Settings
  const loadStart = Date.now()
  try {
    const _settings = await loadSettings() // eslint-disable-line @typescript-eslint/no-unused-vars
    results.push({
      name: 'Load Settings',
      success: true,
      duration: Date.now() - loadStart,
    })
  } catch (error) {
    results.push({
      name: 'Load Settings',
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - loadStart,
    })
  }
  
  // Test 2: Save Settings
  const saveStart = Date.now()
  try {
    const success = await saveSettings({
      appearance: {
        theme: 'system',
        language: 'de',
        timezone: 'Europe/Berlin',
      },
      notifications: {
        enabled: true,
        email: true,
        push: true,
      },
    })
    results.push({
      name: 'Save Settings',
      success,
      duration: Date.now() - saveStart,
    })
  } catch (error) {
    results.push({
      name: 'Save Settings',
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - saveStart,
    })
  }
  
  // Test 3: Get Onboarding Progress
  const progressStart = Date.now()
  try {
    const progress = await getOnboardingProgress()
    results.push({
      name: 'Get Onboarding Progress',
      success: progress !== null,
      duration: Date.now() - progressStart,
    })
  } catch (error) {
    results.push({
      name: 'Get Onboarding Progress',
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - progressStart,
    })
  }
  
  // Test 4: Track Onboarding Step
  const trackStart = Date.now()
  try {
    const success = await trackOnboardingStep({
      step_id: 'test-step',
      step_name: 'Test Schritt',
      completed: true,
    })
    results.push({
      name: 'Track Onboarding Step',
      success,
      duration: Date.now() - trackStart,
    })
  } catch (error) {
    results.push({
      name: 'Track Onboarding Step',
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - trackStart,
    })
  }
  
  // Test 5: Get Integration Status
  const integrationStart = Date.now()
  try {
    const status = await getIntegrationStatus()
    results.push({
      name: 'Get Integration Status',
      success: status !== null,
      duration: Date.now() - integrationStart,
    })
  } catch (error) {
    results.push({
      name: 'Get Integration Status',
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - integrationStart,
    })
  }
  
  return results
}

/**
 * Zeige Smoke Test Ergebnisse in der Konsole
 */
export function logSmokeTestResults(results: SmokeTestResult[]): void {
  console.group('🔍 Settings Smoke Tests')
  results.forEach((result) => {
    if (result.success) {
      console.log(`✅ ${result.name} (${result.duration}ms)`)
    } else {
      console.error(`❌ ${result.name} (${result.duration}ms)`, result.error)
    }
  })
  const successCount = results.filter(r => r.success).length
  const totalCount = results.length
  console.log(`\n📊 Ergebnis: ${successCount}/${totalCount} Tests erfolgreich`)
  console.groupEnd()
}

