'use client'

import { useState, useMemo } from 'react'
import { 
  StarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface Review {
  id: string
  platform: 'trustpilot' | 'tripadvisor' | 'google' | 'yelp' | 'facebook'
  author: string
  rating: number
  text: string
  date: string
  responded: boolean
  response?: string
  sentiment: 'positive' | 'neutral' | 'negative'
}

export function ReviewProfiReviews() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative' | 'unanswered'>('all')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  // TODO: Load from backend
  const reviews = useMemo<Review[]>(() => [
    {
      id: '1',
      platform: 'trustpilot',
      author: 'Maria Schmidt',
      rating: 5,
      text: 'Ausgezeichneter Service! Sehr zufrieden mit dem Aufenthalt. Das Personal war freundlich und hilfsbereit.',
      date: '2024-01-20T10:30:00Z',
      responded: true,
      response: 'Vielen Dank für Ihr positives Feedback!',
      sentiment: 'positive'
    },
    {
      id: '2',
      platform: 'tripadvisor',
      author: 'Thomas Müller',
      rating: 4,
      text: 'Gute Erfahrung insgesamt. Das Zimmer war sauber, aber das Frühstück könnte verbessert werden.',
      date: '2024-01-19T14:20:00Z',
      responded: false,
      sentiment: 'neutral'
    },
    {
      id: '3',
      platform: 'google',
      author: 'Anna Weber',
      rating: 5,
      text: 'Fantastisch! Wir kommen definitiv wieder. Die Lage ist perfekt und der Service erstklassig.',
      date: '2024-01-19T09:15:00Z',
      responded: true,
      response: 'Danke für die tolle Bewertung!',
      sentiment: 'positive'
    },
    {
      id: '4',
      platform: 'yelp',
      author: 'Peter Fischer',
      rating: 2,
      text: 'Nicht zufrieden. Das Essen war kalt und der Service langsam. Würde nicht empfehlen.',
      date: '2024-01-18T16:45:00Z',
      responded: false,
      sentiment: 'negative'
    },
    {
      id: '5',
      platform: 'facebook',
      author: 'Lisa Becker',
      rating: 5,
      text: 'Wunderbar! Sehr empfehlenswert. Alles war perfekt organisiert.',
      date: '2024-01-18T11:30:00Z',
      responded: true,
      response: 'Vielen Dank!',
      sentiment: 'positive'
    },
  ], [])

  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const matchesSearch = review.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           review.author.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesFilter = 
        filter === 'all' ||
        (filter === 'positive' && review.sentiment === 'positive') ||
        (filter === 'neutral' && review.sentiment === 'neutral') ||
        (filter === 'negative' && review.sentiment === 'negative') ||
        (filter === 'unanswered' && !review.responded)
      
      const matchesPlatform = selectedPlatform === 'all' || review.platform === selectedPlatform
      
      return matchesSearch && matchesFilter && matchesPlatform
    })
  }, [reviews, searchQuery, filter, selectedPlatform])

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

  const getSentimentColor = (sentiment: string) => {
    const colors: Record<string, string> = {
      positive: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      neutral: 'bg-amber-100 text-amber-700 border-amber-200',
      negative: 'bg-red-100 text-red-700 border-red-200',
    }
    return colors[sentiment] || 'bg-gray-100 text-gray-700'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
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
          <h2 className="text-2xl font-bold text-gray-900">Bewertungen</h2>
          <p className="text-gray-600 mt-1">Verwalten und beantworten Sie alle Bewertungen</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Bewertungen durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/80 backdrop-blur-xl"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-xl"
          >
            <option value="all">Alle Plattformen</option>
            <option value="trustpilot">Trustpilot</option>
            <option value="tripadvisor">Tripadvisor</option>
            <option value="google">Google</option>
            <option value="yelp">Yelp</option>
            <option value="facebook">Facebook</option>
          </select>
          {(['all', 'positive', 'neutral', 'negative', 'unanswered'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/60 backdrop-blur-xl border border-gray-200/50 text-gray-700 hover:bg-gray-50/80'
              }`}
            >
              {f === 'all' ? 'Alle' : f === 'positive' ? 'Positiv' : f === 'neutral' ? 'Neutral' : f === 'negative' ? 'Negativ' : 'Unbeantwortet'}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-gray-200/50 shadow-lg p-12 text-center">
          <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Bewertungen gefunden</h3>
          <p className="text-gray-600">Versuchen Sie andere Filterkriterien</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="group p-5 bg-white/60 backdrop-blur-2xl rounded-2xl border border-gray-200/50 hover:border-blue-300/50 hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedReview(review)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{getPlatformIcon(review.platform)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{review.author}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getPlatformColor(review.platform)}`}>
                        {review.platform}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getSentimentColor(review.sentiment)}`}>
                        {review.sentiment === 'positive' ? 'Positiv' : review.sentiment === 'neutral' ? 'Neutral' : 'Negativ'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{formatDate(review.date)}</div>
                  </div>
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
              <div className="flex items-center gap-2">
                {review.responded ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                    <CheckCircleIcon className="h-4 w-4" />
                    Beantwortet
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium">
                    <ClockIcon className="h-4 w-4" />
                    Ausstehend
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Detail Modal */}
      {selectedReview && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedReview(null)}
        >
          <div 
            className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Bewertung-Details</h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <XCircleIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-3xl">{getPlatformIcon(selectedReview.platform)}</span>
                  <div>
                    <div className="text-sm text-gray-600">Plattform</div>
                    <div className="text-xl font-bold text-gray-900 capitalize">{selectedReview.platform}</div>
                  </div>
                  <div className="ml-auto">
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIconSolid
                          key={star}
                          className={`h-6 w-6 ${
                            star <= selectedReview.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">{formatDate(selectedReview.date)}</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Autor</label>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-lg font-semibold text-gray-900">{selectedReview.author}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Bewertung</label>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-900 leading-relaxed">{selectedReview.text}</p>
                </div>
              </div>

              {selectedReview.responded && selectedReview.response ? (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Ihre Antwort</label>
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-gray-900">{selectedReview.response}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Antwort verfassen</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                    placeholder="Schreiben Sie eine professionelle Antwort..."
                  />
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 flex gap-3">
                {!selectedReview.responded && (
                  <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-500/30">
                    Antwort senden
                  </button>
                )}
                <button className="px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  {selectedReview.responded ? 'Antwort bearbeiten' : 'Als Vorlage speichern'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
