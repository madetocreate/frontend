'use client'

import { useState, useMemo } from 'react'
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

export function ReviewProfiAnalytics() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  // TODO: Load from backend endpoint /api/reviews/analytics
  // For now, using mock data
  const analytics = useMemo(() => ({
    ratingDistribution: {
      5: 856,
      4: 234,
      3: 98,
      2: 34,
      1: 25,
    },
    platformPerformance: [
      { platform: 'Trustpilot', avgRating: 4.7, count: 456, change: 0.2 },
      { platform: 'Tripadvisor', avgRating: 4.5, count: 312, change: 0.1 },
      { platform: 'Google', avgRating: 4.8, count: 289, change: 0.3 },
      { platform: 'Yelp', avgRating: 4.4, count: 145, change: -0.1 },
      { platform: 'Facebook', avgRating: 4.6, count: 45, change: 0.1 },
    ],
    trends: [
      { date: '2024-01-01', rating: 4.5, count: 28 },
      { date: '2024-01-08', rating: 4.6, count: 32 },
      { date: '2024-01-15', rating: 4.7, count: 35 },
      { date: '2024-01-22', rating: 4.6, count: 31 },
    ],
    responseTime: {
      average: 2.5,
      target: 24,
      improvement: -15.2,
    },
    sentiment: {
      positive: 68.6,
      neutral: 23.4,
      negative: 8.0,
    }
  }), [])

  const totalReviews = Object.values(analytics.ratingDistribution).reduce((a, b) => a + b, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold ak-text-primary">Analytics & Insights</h2>
          <p className="ak-text-secondary mt-1">Detaillierte Analyse Ihrer Bewertungen</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                period === p
                  ? 'ak-btn-primary ak-btn-gradient shadow-lg'
                  : 'ak-bg-glass ak-border-default ak-text-secondary hover:ak-bg-hover'
              }`}
            >
              {p === '7d' ? '7 Tage' : p === '30d' ? '30 Tage' : p === '90d' ? '90 Tage' : 'Alle'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="ak-card-glass rounded-3xl border ak-border-default shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 ak-bg-success-soft rounded-2xl shadow-lg">
              <StarIconSolid className="h-6 w-6 text-[var(--ak-color-text-inverted)]" />
            </div>
            <ArrowTrendingUpIcon className="h-5 w-5 text-[var(--ak-semantic-success)]" />
          </div>
          <div className="text-3xl font-bold ak-text-primary mb-1">4.6</div>
          <div className="text-sm font-medium ak-text-secondary mb-2">Durchschnittsbewertung</div>
          <div className="text-xs font-semibold text-[var(--ak-semantic-success)]">+0.3 vs. Vorperiode</div>
        </div>

        <div className="ak-card-glass rounded-3xl border ak-border-default shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 ak-bg-glass rounded-2xl shadow-lg">
                <ChartBarIcon className="h-6 w-6 text-[var(--ak-color-text-inverted)]" />
              </div>
              <ArrowTrendingUpIcon className="h-5 w-5 text-[var(--ak-semantic-success)]" />
            </div>
          <div className="text-3xl font-bold ak-text-primary mb-1">{totalReviews}</div>
          <div className="text-sm font-medium ak-text-secondary mb-2">Gesamt Bewertungen</div>
          <div className="text-xs font-semibold text-[var(--ak-semantic-success)]">+12% vs. Vorperiode</div>
        </div>

        <div className="ak-card-glass rounded-3xl border ak-border-default shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 ak-bg-success-soft rounded-2xl shadow-lg">
                <GlobeAltIcon className="h-6 w-6 text-[var(--ak-color-text-inverted)]" />
              </div>
              <ArrowTrendingDownIcon className="h-5 w-5 text-[var(--ak-semantic-success)]" />
            </div>
          <div className="text-3xl font-bold ak-text-primary mb-1">{analytics.responseTime.average}h</div>
          <div className="text-sm font-medium ak-text-secondary mb-2">Ø Antwortzeit</div>
          <div className="text-xs font-semibold text-[var(--ak-semantic-success)]">{analytics.responseTime.improvement}% Verbesserung</div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="ak-card-glass rounded-3xl border ak-border-default shadow-lg p-6">
        <h3 className="text-lg font-bold ak-text-primary mb-6">Bewertungsverteilung</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = analytics.ratingDistribution[rating as keyof typeof analytics.ratingDistribution]
            const percentage = (count / totalReviews) * 100
            return (
              <div key={rating} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium ak-text-secondary">{rating} Sterne</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIconSolid
                          key={star}
                          className={`h-4 w-4 ${
                            star <= rating ? 'text-[var(--ak-semantic-warning)]' : 'ak-text-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm ak-text-secondary">{count}</span>
                    <span className="text-sm font-semibold ak-text-primary">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="w-full h-3 ak-bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className="h-full ak-bg-warning-soft rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Platform Performance */}
      <div className="ak-card-glass rounded-3xl border ak-border-default shadow-lg p-6">
        <h3 className="text-lg font-bold ak-text-primary mb-6">Plattform-Performance</h3>
        <div className="space-y-4">
          {analytics.platformPerformance.map((platform) => (
            <div key={platform.platform} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-semibold ak-text-primary">{platform.platform}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                    <StarIconSolid
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(platform.avgRating) ? 'text-[var(--ak-semantic-warning)]' : 'ak-text-muted'
                      }`}
                    />
                    ))}
                    <span className="ml-2 text-sm font-semibold ak-text-primary">{platform.avgRating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm ak-text-secondary">{platform.count} Bewertungen</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                    platform.change > 0 ? 'ak-badge-success' : 'ak-badge-danger'
                  }`}>
                    {platform.change > 0 ? '+' : ''}{platform.change}
                  </span>
                </div>
              </div>
              <div className="w-full h-2 ak-bg-surface-muted rounded-full overflow-hidden">
                <div
                  className="h-full ak-bg-accent-inbox rounded-full transition-all duration-500"
                  style={{ width: `${(platform.avgRating / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="ak-card-glass rounded-3xl border ak-border-default shadow-lg p-6">
          <div className="text-3xl font-bold text-[var(--ak-semantic-success)] mb-2">{analytics.sentiment.positive}%</div>
          <div className="text-sm font-medium text-[var(--ak-semantic-success)] mb-1">Positiv</div>
          <div className="w-full h-2 ak-bg-success-soft rounded-full overflow-hidden mt-3">
            <div
              className="h-full ak-bg-success rounded-full"
              style={{ width: `${analytics.sentiment.positive}%` }}
            />
          </div>
        </div>
        <div className="ak-card-glass rounded-3xl border ak-border-default shadow-lg p-6">
          <div className="text-3xl font-bold text-[var(--ak-semantic-warning)] mb-2">{analytics.sentiment.neutral}%</div>
          <div className="text-sm font-medium text-[var(--ak-semantic-warning)] mb-1">Neutral</div>
          <div className="w-full h-2 ak-bg-warning-soft rounded-full overflow-hidden mt-3">
            <div
              className="h-full ak-bg-warning rounded-full"
              style={{ width: `${analytics.sentiment.neutral}%` }}
            />
          </div>
        </div>
        <div className="ak-card-glass rounded-3xl border ak-border-default shadow-lg p-6">
          <div className="text-3xl font-bold text-[var(--ak-semantic-danger)] mb-2">{analytics.sentiment.negative}%</div>
          <div className="text-sm font-medium text-[var(--ak-semantic-danger)] mb-1">Negativ</div>
          <div className="w-full h-2 ak-bg-danger-soft rounded-full overflow-hidden mt-3">
            <div
              className="h-full ak-bg-danger rounded-full"
              style={{ width: `${analytics.sentiment.negative}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
