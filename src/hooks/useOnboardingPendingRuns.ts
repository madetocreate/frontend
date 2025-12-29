'use client'

import { useState, useEffect, useCallback } from 'react'
import type { WebsiteScanResult, DocumentScanResult } from '@/components/onboarding/OnboardingResultCard'

interface PendingRunResult {
  type: 'website' | 'document'
  runId: string
  status: 'completed' | 'failed'
  result?: WebsiteScanResult | DocumentScanResult
  summary?: string
}

interface UseOnboardingPendingRunsReturn {
  pendingResults: PendingRunResult[]
  dismissResult: (runId: string) => void
  isLoading: boolean
}

/**
 * Hook to check for pending onboarding runs and notify user when complete.
 * 
 * This is used when user continued without waiting for scans to complete.
 * When scans finish, a notification card appears.
 */
export function useOnboardingPendingRuns(): UseOnboardingPendingRunsReturn {
  const [pendingResults, setPendingResults] = useState<PendingRunResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [checkedRuns, setCheckedRuns] = useState<Set<string>>(new Set())

  const checkPendingRuns = useCallback(async () => {
    try {
      const { authedFetch } = await import('@/lib/api/authedFetch')
      
      // Get user settings to find pending runs
      const settingsRes = await authedFetch('/api/settings/user')
      if (!settingsRes.ok) {
        setIsLoading(false)
        return
      }
      
      const settings = await settingsRes.json()
      const pendingRuns = settings?.onboarding?.pendingRuns || {}
      
      // Check each pending run
      const newResults: PendingRunResult[] = []
      
      for (const [type, runId] of Object.entries(pendingRuns)) {
        if (!runId || checkedRuns.has(runId as string)) continue
        
        try {
          const runRes = await authedFetch(`/api/actions/runs/${runId}`)
          if (!runRes.ok) continue
          
          const runData = await runRes.json()
          
          if (runData.status === 'completed') {
            const outputData = runData.output_data || {}
            
            let result: WebsiteScanResult | DocumentScanResult | undefined
            let summary = ''
            
            if (type === 'website') {
              result = {
                fields: outputData.fields || {},
                highlights: outputData.highlights || [],
              }
              summary = `Branche: ${outputData.fields?.industry || 'Erkannt'}, ${outputData.highlights?.length || 0} Highlights`
            } else {
              result = {
                documents: [],
                tags: outputData.tags || [],
                entities: outputData.entities || [],
              }
              summary = `${outputData.tags?.length || 0} Begriffe, ${outputData.entities?.length || 0} Entitäten extrahiert`
            }
            
            newResults.push({
              type: type as 'website' | 'document',
              runId: runId as string,
              status: 'completed',
              result,
              summary,
            })
            
            // Update settings to remove from pending and save result
            await saveScanResult(type as 'website' | 'document', result, runId as string)
          } else if (runData.status === 'failed') {
            newResults.push({
              type: type as 'website' | 'document',
              runId: runId as string,
              status: 'failed',
              summary: 'Scan fehlgeschlagen',
            })
          }
          
          setCheckedRuns(prev => new Set([...prev, runId as string]))
        } catch (error) {
          console.error(`Failed to check run ${runId}:`, error)
        }
      }
      
      if (newResults.length > 0) {
        setPendingResults(prev => [...prev, ...newResults])
      }
    } catch (error) {
      console.error('Failed to check pending runs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [checkedRuns])

  const saveScanResult = async (
    type: 'website' | 'document',
    result: WebsiteScanResult | DocumentScanResult,
    runId: string
  ) => {
    try {
      const { authedFetch } = await import('@/lib/api/authedFetch')
      
      const patch: Record<string, unknown> = {
        onboarding: {
          pendingRuns: {
            [type]: null, // Remove from pending
          },
        },
      }
      
      if (type === 'website') {
        const websiteResult = result as WebsiteScanResult
        patch.websiteProfile = {
          ...websiteResult.fields,
          highlights: websiteResult.highlights,
          fetched_at: new Date().toISOString(),
        }
        patch.onboarding = {
          ...patch.onboarding as object,
          websiteScan: {
            status: 'suggested',
            updatedAt: new Date().toISOString(),
            source: 'background_scan',
          },
        }
      } else {
        const docResult = result as DocumentScanResult
        patch.onboarding = {
          ...patch.onboarding as object,
          documentScan: {
            status: 'suggested',
            updatedAt: new Date().toISOString(),
            topTags: docResult.tags?.slice(0, 10) || [],
            topEntities: docResult.entities?.slice(0, 10) || [],
          },
        }
      }
      
      await authedFetch('/api/settings/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patch }),
      })
    } catch (error) {
      console.error('Failed to save scan result:', error)
    }
  }

  const dismissResult = useCallback((runId: string) => {
    setPendingResults(prev => prev.filter(r => r.runId !== runId))
  }, [])

  // Check on mount and periodically
  useEffect(() => {
    checkPendingRuns()
    
    // Poll every 30 seconds for any pending runs
    const interval = setInterval(checkPendingRuns, 30000)
    
    return () => clearInterval(interval)
  }, [checkPendingRuns])

  return {
    pendingResults,
    dismissResult,
    isLoading,
  }
}

