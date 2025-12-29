'use client'

import { useState } from 'react'
import { 
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { useReviewStats } from '@/lib/reviews/useReviewStats'
import { EnhancedStatCard } from '@/components/ui/EnhancedStatCard'
import { AnimatedNumber, ProgressRing } from '@/components/ui/AnimatedNumber'
import { useReviewCounts, useReviewInbox, useReviewSync } from '@/hooks/useReviewHubData'

export function ReviewProfiOverview() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [syncResult, setSyncResult] = useState<{ success: boolean; message?: string } | null>(null)
  
  // ✨ NEU: Echte Dashboard Stats
  const { stats: dashboardStats, loading: statsLoading } = useReviewStats(30000)
  
  // Data Hooks
  const { data: countsData, isLoading: countsLoading } = useReviewCounts()
  const { data: recentReviewsData, isLoading: reviewsLoading } = useReviewInbox({ limit: 5 })
  const { mutate: syncReviews, isPending: isSyncing } = useReviewSync()

  const counts = countsData || { new: 0, drafted: 0, failed: 0, total: 0 }
  const recentReviews = recentReviewsData || []
  const loading = countsLoading || reviewsLoading

  const handleSync = async () => {
    setSyncResult(null)
    syncReviews(undefined, {
      onSuccess: (data) => {
        setSyncResult({
          success: true,
          message: `${data.created_count || 0} neue Reviews, ${data.drafted_count || 0} Drafts erstellt`,
        })
      },
      onError: (error) => {
        setSyncResult({
          success: false,
          message: error instanceof Error ? error.message : 'Sync fehlgeschlagen',
        })
      }
    })
  }

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      trustpilot: '⭐',
      tripadvisor: '🦉',
      google: '🔵',
      yelp: '💬',
      facebook: '📘',
    }
    return icons[platform] || '⭐'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Use dashboard stats if available, else calculate from local data
  const avgRating = dashboardStats?.avg_rating || (recentReviews.length > 0
    ? recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length
    : 0)

  // Use dashboard stats if available, else calculate from local data
  const responseRate = dashboardStats?.response_rate || (counts.total > 0
    ? ((counts.total - counts.new - counts.drafted - counts.failed) / counts.total) * 100
    : 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold ak-text-primary">Review Profi</h2>
          <p className="ak-text-secondary mt-1">Professionelles Review-Management</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-4 py-2 rounded-xl ak-btn-primary ak-btn-gradient shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSyncing ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                Synchronisiere...
              </>
            ) : (
              <>
                <ArrowPathIcon className="h-5 w-5" />
                Jetzt synchronisieren
              </>
            )}
          </button>
          {(['7d', '30d', '90d', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                selectedPeriod === period
                  ? 'ak-btn-primary ak-btn-gradient shadow-lg'
                  : 'ak-bg-glass ak-border-default ak-text-secondary hover:ak-bg-surface-hover'
              }`}
            >
              {period === '7d' ? '7 Tage' : period === '30d' ? '30 Tage' : period === '90d' ? '90 Tage' : 'Alle'}
            </button>
          ))}
        </div>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div className={`ak-card-glass rounded-2xl border p-4 ${
          syncResult.success ? 'ak-border-success ak-bg-success-soft' : 'ak-border-danger ak-bg-danger-soft'
        }`}>
          <div className="flex items-center gap-3">
            {syncResult.success ? (
              <CheckCircleIcon className="h-5 w-5 ak-text-success" />
            ) : (
              <ClockIcon className="h-5 w-5 ak-text-danger" />
            )}
            <p className={syncResult.success ? 'ak-text-success' : 'ak-text-danger'}>
              {syncResult.message}
            </p>
            <button
              onClick={() => setSyncResult(null)}
              className="ml-auto text-sm ak-text-secondary hover:ak-text-primary"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Rating with Stars */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--ak-semantic-warning-soft)] via-[var(--ak-semantic-warning-soft)]/80 to-[var(--ak-semantic-danger-soft)] rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-[var(--ak-color-bg-surface)]/80 backdrop-blur-xl rounded-2xl border border-[var(--ak-color-border-subtle)]/50 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--ak-semantic-warning)] to-[var(--ak-semantic-warning-strong)] rounded-2xl blur-md opacity-50" />
                <div className="relative h-14 w-14 bg-gradient-to-br from-[var(--ak-semantic-warning)] to-[var(--ak-semantic-warning-strong)] rounded-2xl flex items-center justify-center shadow-lg">
                  <StarIconSolid className="h-7 w-7 text-[var(--ak-color-text-inverted)]" />
                </div>
              </div>
              {avgRating >= 4 && (
                <span className="px-3 py-1 rounded-full bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)] text-xs font-semibold">
                  Hervorragend
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                {statsLoading || loading ? (
                  <div className="h-10 w-24 bg-[var(--ak-color-bg-surface-muted)] rounded animate-pulse" />
                ) : (
                  <AnimatedNumber 
                    value={avgRating} 
                    decimals={1}
                    className="text-4xl font-bold bg-gradient-to-r from-[var(--ak-semantic-warning)] to-[var(--ak-semantic-warning-strong)] bg-clip-text text-transparent"
                  />
                )}
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <StarIconSolid key={i} className={`h-4 w-4 ${i < Math.floor(avgRating) ? 'text-[var(--ak-semantic-warning)]' : 'text-[var(--ak-color-border-subtle)]'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-[var(--ak-color-text-secondary)] font-medium">Durchschnittsbewertung</p>
              <p className="text-xs text-[var(--ak-semantic-success)] font-semibold">
                {dashboardStats?.reviews_today || recentReviews.length} Reviews heute
              </p>
            </div>
          </div>
        </div>

        <EnhancedStatCard
          icon={<ChatBubbleLeftRightIcon className="h-7 w-7" />}
          value={counts.total}
          label="Gesamt Bewertungen"
          badge={{ text: `+${counts.new} neue`, tone: 'success' }}
          gradient={{ from: 'blue', to: 'indigo' }}
          sparklineData={[85, 92, 88, 95, 90, 98, counts.total]}
          loading={loading}
        />

        {/* Response Rate with Progress Ring */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--ak-semantic-success-soft)] to-[var(--ak-semantic-success-soft)]/80 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-[var(--ak-color-bg-surface)]/80 backdrop-blur-xl rounded-2xl border border-[var(--ak-color-border-subtle)]/50 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--ak-semantic-success)] to-[var(--ak-semantic-success-strong)] rounded-2xl blur-md opacity-50" />
                <div className="relative h-14 w-14 bg-gradient-to-br from-[var(--ak-semantic-success)] to-[var(--ak-semantic-success-strong)] rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircleIcon className="h-7 w-7 text-[var(--ak-color-text-inverted)]" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <ProgressRing value={responseRate} size={70} strokeWidth={6} color="#10b981" />
              <div>
                {loading ? (
                  <div className="h-10 w-20 bg-[var(--ak-color-bg-surface-muted)] rounded animate-pulse" />
                ) : (
                  <AnimatedNumber 
                    value={responseRate} 
                    decimals={1}
                    suffix="%"
                    className="text-3xl font-bold bg-gradient-to-r from-[var(--ak-semantic-success)] to-[var(--ak-semantic-success-strong)] bg-clip-text text-transparent"
                  />
                )}
                <p className="text-sm text-[var(--ak-color-text-secondary)] font-medium mt-1">Antwortrate</p>
              </div>
            </div>
                <p className="text-xs text-[var(--ak-semantic-success)] font-semibold">
                  {counts.total - counts.new - counts.drafted - counts.failed} von {counts.total} beantwortet
                </p>
          </div>
        </div>

        <EnhancedStatCard
          icon={<GlobeAltIcon className="h-7 w-7" />}
          value={1}
          label="Aktive Plattformen"
          badge={{ text: 'Google', tone: 'info' }}
          gradient={{ from: 'purple', to: 'pink' }}
          loading={false}
        />
      </div>

      {/* Recent Reviews */}
      <div className="bg-[var(--ak-color-bg-surface)]/60 backdrop-blur-2xl rounded-3xl border border-[var(--ak-color-border-subtle)] shadow-lg p-6">
        <h3 className="text-lg font-bold text-[var(--ak-color-text-primary)] mb-6 flex items-center gap-2">
          <ClockIcon className="h-6 w-6 text-[var(--ak-semantic-info)]" />
          Neueste Bewertungen
        </h3>
        {loading ? (
          <div className="text-center py-8">
            <ArrowPathIcon className="h-8 w-8 ak-text-muted mx-auto mb-2 animate-spin" />
            <p className="ak-text-secondary">Lade Bewertungen...</p>
          </div>
        ) : recentReviews.length === 0 ? (
          <div className="text-center py-8">
            <ChatBubbleLeftRightIcon className="h-12 w-12 ak-text-muted mx-auto mb-2" />
            <p className="ak-text-secondary">Noch keine Bewertungen vorhanden</p>
            <button
              onClick={handleSync}
              className="mt-4 px-4 py-2 ak-btn-primary rounded-xl"
            >
              Jetzt synchronisieren
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <div
                key={review.id}
                className="p-5 bg-[var(--ak-color-bg-surface-muted)]/80 rounded-2xl border border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-color-accent)]/50 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getPlatformIcon('google')}</span>
                    <div>
                      <div className="font-semibold text-[var(--ak-color-text-primary)]">{review.author_name || 'Anonym'}</div>
                      <div className="text-sm text-[var(--ak-color-text-secondary)]">{formatDate(review.created_at_platform)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIconSolid
                        key={star}
                        className={`h-5 w-5 ${
                          star <= review.rating ? 'text-[var(--ak-semantic-warning)]' : 'text-[var(--ak-color-text-muted)]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[var(--ak-color-text-primary)] mb-3 leading-relaxed">
                  {review.comment || '(Kein Kommentar)'}
                </p>
                {review.status === 'posted' && (
                  <div className="mt-3 p-3 bg-[var(--ak-color-accent-soft)]/80 border border-[var(--ak-color-accent-soft)]/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircleIcon className="h-4 w-4 text-[var(--ak-color-accent)]" />
                      <span className="text-xs font-semibold text-[var(--ak-color-accent)]">Beantwortet</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
