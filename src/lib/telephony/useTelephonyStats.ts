import { useEffect, useState } from 'react'
import { authedFetch } from '@/lib/api/authedFetch'

export interface TelephonyStats {
  calls_today: number
  avg_duration_seconds: number
  success_rate: number
  active_calls: number
  appointments_created: number
  recent_activity: Array<{
    id: string
    from: string
    time: Date
    duration: number
    status: string
    mode: string
  }>
}

export function useTelephonyStats(refreshInterval: number = 30000) {
  const [stats, setStats] = useState<TelephonyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      const response = await authedFetch('/api/telephony/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  return { stats, loading, error, refetch: fetchStats }
}

// Helper to format duration
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

