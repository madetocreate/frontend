'use client'

import { useState, useMemo } from 'react'
import { 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  SparklesIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingChange: number
  newReviews: number
  respondedReviews: number
  responseRate: number
  platforms: {
    trustpilot: { count: number; avgRating: number }
    tripadvisor: { count: number; avgRating: number }
    google: { count: number; avgRating: number }
    yelp: { count: number; avgRating: number }
    facebook: { count: number; avgRating: number }
  }
}

interface RecentReview {
  id: string
  platform: 'trustpilot' | 'tripadvisor' | 'google' | 'yelp' | 'facebook'
  author: string
  rating: number
  text: string
  date: string
  responded: boolean
  response?: string
}

export function ReviewProfiOverview() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  // TODO: Load from backend
  const stats = useMemo<ReviewStats>(() => ({
    totalReviews: 1247,
    averageRating: 4.6,
    ratingChange: 0.3,
    newReviews: 23,
    respondedReviews: 1189,
    responseRate: 95.3,
    platforms: {
      trustpilot: { count: 456, avgRating: 4.7 },
      tripadvisor: { count: 312, avgRating: 4.5 },
      google: { count: 289, avgRating: 4.8 },
      yelp: { count: 145, avgRating: 4.4 },
      facebook: { count: 45, avgRating: 4.6 },
    }
  }), [])

  const recentReviews = useMemo<RecentReview[]>(() => [
    {
      id: '1',
      platform: 'trustpilot',
      author: 'Maria Schmidt',
      rating: 5,
      text: 'Ausgezeichneter Service! Sehr zufrieden mit dem Aufenthalt. Das Personal war freundlich und hilfsbereit.',
      date: '2024-01-20T10:30:00Z',
      responded: true,
      response: 'Vielen Dank für Ihr positives Feedback! Wir freuen uns, dass Sie zufrieden waren.'
    },
    {
      id: '2',
      platform: 'tripadvisor',
      author: 'Thomas Müller',
      rating: 4,
      text: 'Gute Erfahrung insgesamt. Das Zimmer war sauber, aber das Frühstück könnte verbessert werden.',
      date: '2024-01-19T14:20:00Z',
      responded: false
    },
    {
      id: '3',
      platform: 'google',
      author: 'Anna Weber',
      rating: 5,
      text: 'Fantastisch! Wir kommen definitiv wieder. Die Lage ist perfekt und der Service erstklassig.',
      date: '2024-01-19T09:15:00Z',
      responded: true,
      response: 'Danke für die tolle Bewertung! Wir freuen uns auf Ihren nächsten Besuch.'
    },
    {
      id: '4',
      platform: 'yelp',
      author: 'Peter Fischer',
      rating: 3,
      text: 'Okay, aber nicht besonders. Das Essen war durchschnittlich.',
      date: '2024-01-18T16:45:00Z',
      responded: false
    },
    {
      id: '5',
      platform: 'facebook',
      author: 'Lisa Becker',
      rating: 5,
      text: 'Wunderbar! Sehr empfehlenswert. Alles war perfekt organisiert.',
      date: '2024-01-18T11:30:00Z',
      responded: true,
      response: 'Vielen Dank für Ihre Empfehlung!'
    },
  ], [])

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

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      trustpilot: 'bg-green-100 text-green-700 border-green-200',
      tripadvisor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      google: 'bg-blue-100 text-blue-700 border-blue-200',
      yelp: 'bg-red-100 text-red-700 border-red-200',
      facebook: 'bg-blue-100 text-blue-700 border-blue-200',
    }
    return colors[platform] || 'bg-gray-100 text-gray-700'
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Review Profi</h2>
          <p className="text-gray-600 mt-1">Professionelles Review-Management</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/60 backdrop-blur-xl border border-gray-200/50 text-gray-700 hover:bg-gray-50/80'
              }`}
            >
              {period === '7d' ? '7 Tage' : period === '30d' ? '30 Tage' : period === '90d' ? '90 Tage' : 'Alle'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group relative bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-sm p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg">
              <StarIconSolid className="h-6 w-6 text-white" />
            </div>
            {stats.ratingChange > 0 ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
            ) : (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="text-sm font-medium text-gray-600 mb-2">Durchschnittsbewertung</div>
          <div className={`text-xs font-semibold ${stats.ratingChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {stats.ratingChange > 0 ? '+' : ''}{stats.ratingChange} vs. Vorperiode
          </div>
        </div>

        <div className="group relative bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-sm p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
            </div>
            <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {new Intl.NumberFormat('de-DE').format(stats.totalReviews)}
          </div>
          <div className="text-sm font-medium text-gray-600 mb-2">Gesamt Bewertungen</div>
          <div className="text-xs font-semibold text-emerald-600">
            +{stats.newReviews} neue diese Woche
          </div>
        </div>

        <div className="group relative bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-sm p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
            <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.responseRate.toFixed(1)}%
          </div>
          <div className="text-sm font-medium text-gray-600 mb-2">Antwortrate</div>
          <div className="text-xs font-semibold text-emerald-600">
            {stats.respondedReviews} von {stats.totalReviews} beantwortet
          </div>
        </div>

        <div className="group relative bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-sm p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
              <GlobeAltIcon className="h-6 w-6 text-white" />
            </div>
            <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">5</div>
          <div className="text-sm font-medium text-gray-600 mb-2">Aktive Plattformen</div>
          <div className="text-xs font-semibold text-emerald-600">
            Alle verbunden
          </div>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <SparklesIcon className="h-6 w-6 text-blue-600" />
          Plattform-Übersicht
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(stats.platforms).map(([platform, data]) => (
            <div
              key={platform}
              className="p-4 bg-gradient-to-br from-gray-50/80 to-white/80 rounded-2xl border border-gray-200/50 hover:border-blue-300/50 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{getPlatformIcon(platform)}</span>
                <span className="font-semibold text-gray-900 capitalize">{platform}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{data.count}</div>
              <div className="text-sm text-gray-600 mb-2">Bewertungen</div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIconSolid
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(data.avgRating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm font-semibold text-gray-700">
                  {data.avgRating.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ClockIcon className="h-6 w-6 text-blue-600" />
          Neueste Bewertungen
        </h3>
        <div className="space-y-4">
          {recentReviews.map((review) => (
            <div
              key={review.id}
              className="p-5 bg-gradient-to-r from-gray-50/80 to-white/80 rounded-2xl border border-gray-200/50 hover:border-blue-300/50 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getPlatformIcon(review.platform)}</span>
                  <div>
                    <div className="font-semibold text-gray-900">{review.author}</div>
                    <div className="text-sm text-gray-600">{formatDate(review.date)}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getPlatformColor(review.platform)}`}>
                    {review.platform}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIconSolid
                      key={star}
                      className={`h-5 w-5 ${
                        star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-3 leading-relaxed">{review.text}</p>
              {review.responded && review.response ? (
                <div className="mt-3 p-3 bg-blue-50/80 border border-blue-200/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700">Ihre Antwort:</span>
                  </div>
                  <p className="text-sm text-gray-700">{review.response}</p>
                </div>
              ) : (
                <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium">
                  Antworten
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
