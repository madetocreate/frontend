import { useEffect, useState } from 'react'
import { authedFetch } from '@/lib/api/authedFetch'

export interface WebsiteStats {
  conversations_today: number
  active_visitors: number
  leads_generated: number
  handoff_rate: number
  avg_messages_per_conversation: number
  recent_conversations: Array<{
    id: string
    title: string
    time: Date
    message_count: number
    last_message_at: Date | null
    metadata: any
  }>
  top_topics: Array<{
    topic: string
    count: number
  }>
}

export function useWebsiteStats(refreshInterval: number = 30000) {
  const [stats, setStats] = useState<WebsiteStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      const response = await authedFetch('/api/website/stats')
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

