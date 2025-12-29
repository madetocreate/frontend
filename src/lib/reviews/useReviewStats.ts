import { useEffect, useState } from 'react'
import { authedFetch } from '@/lib/api/authedFetch'

export interface ReviewStats {
  reviews_today: number
  avg_rating: number
  response_rate: number
  status_counts: Record<string, number>
  rating_distribution: Record<number, number>
  recent_reviews: Array<{
    id: string
    rating: number
    author: string | null
    comment: string | null
    time: Date
    status: string
    platform: string
  }>
  // Normalized camelCase fields for UI
  totalReviews: number
  avgRating: number
  reviewsToday: number
  responseRate: number
}

export function useReviewStats(refreshInterval: number = 30000) {
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      const response = await authedFetch('/api/reviews/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      
      // Calculate total reviews from distribution if not provided
      const totalFromDist = data.rating_distribution 
        ? Object.values(data.rating_distribution as Record<string, number>).reduce((sum, val) => sum + val, 0)
        : 0;

      // Normalizer/Adapter for consistent keys
      const normalizedStats: ReviewStats = {
        ...data,
        avgRating: data.avg_rating ?? 0,
        totalReviews: data.total_reviews ?? totalFromDist,
        reviewsToday: data.reviews_today ?? 0,
        responseRate: data.response_rate ?? 0,
      }

      setStats(normalizedStats)
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

// Helper to format rating
export function formatRating(rating: number): string {
  return `${rating.toFixed(1)}`
}

// Helper to get star display
export function getStarDisplay(rating: number): string {
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 >= 0.5
  return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(5 - Math.ceil(rating))
}

