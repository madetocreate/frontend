'use client'

import { useState, useMemo, useCallback } from 'react'
import { MegaphoneIcon, StarIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface Review {
  id: string
  platform: 'tripadvisor' | 'google' | 'booking.com'
  rating: number
  comment: string
  guest: string
  date: string
  responded: boolean
}

export function HotelMarketing() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // TODO: Load from backend
  const mockReviews = useMemo<Review[]>(() => [
    {
      id: '1',
      platform: 'tripadvisor',
      rating: 5,
      comment: 'Fantastisches Hotel! Sehr empfehlenswert.',
      guest: 'Max M.',
      date: '2024-01-15',
      responded: true
    },
    {
      id: '2',
      platform: 'google',
      rating: 4,
      comment: 'Gute Lage, freundliches Personal.',
      guest: 'Anna S.',
      date: '2024-01-10',
      responded: false
    }
  ], [])

  const stats = useMemo(() => ({
    averageRating: 4.8,
    totalReviews: mockReviews.length,
    responded: mockReviews.filter(r => r.responded).length,
    newsletterSubscribers: 1234
  }), [mockReviews])

  const handleRespond = useCallback(async (reviewId: string) => {
    setLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('Respond to review:', reviewId)
    } catch (err) {
      setError('Antwort konnte nicht gesendet werden.')
      console.error('Respond error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Marketing & CRM</h2>
          <p className="text-gray-600 mt-1">Kampagnen, Reviews und Gästekommunikation</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
          aria-label="Neue Kampagne erstellen"
        >
          <MegaphoneIcon className="h-5 w-5" />
          Neue Kampagne
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800 shadow-sm" role="alert">
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
            aria-label="Fehler schließen"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all duration-200">
          <div className="text-2xl font-bold text-gray-900">{stats.averageRating}</div>
          <div className="text-sm text-gray-600">Durchschnitts-Bewertung</div>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" aria-hidden="true" />
            ))}
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all duration-200">
          <div className="text-2xl font-bold text-blue-600">{stats.totalReviews}</div>
          <div className="text-sm text-gray-600">Reviews (30 Tage)</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all duration-200">
          <div className="text-2xl font-bold text-green-600">{stats.responded}</div>
          <div className="text-sm text-gray-600">Beantwortet</div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all duration-200">
          <div className="text-2xl font-bold text-purple-600">
            {new Intl.NumberFormat('de-DE').format(stats.newsletterSubscribers)}
          </div>
          <div className="text-sm text-gray-600">Newsletter Abonnenten</div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Neueste Reviews</h3>
        {mockReviews.length === 0 ? (
          <div className="text-center py-12">
            <StarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Reviews vorhanden</h3>
            <p className="text-gray-600">Reviews werden hier angezeigt, sobald sie eintreffen.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mockReviews.map((review) => (
              <div key={review.id} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50/50 transition-all duration-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">{review.guest}</div>
                    <div className="text-sm text-gray-600">{review.platform} • {review.date}</div>
                  </div>
                  <div className="flex items-center gap-1" role="img" aria-label={`${review.rating} von 5 Sternen`}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <StarIcon
                        key={i}
                        className={`h-5 w-5 ${
                          i <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{review.comment}</p>
                {!review.responded && (
                  <button 
                    className="text-sm text-blue-600 hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                    onClick={() => handleRespond(review.id)}
                  >
                    {loading ? 'Wird gesendet...' : 'Antworten'}
                  </button>
                )}
                {review.responded && (
                  <span className="text-sm text-green-600">✓ Beantwortet</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campaigns */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktive Kampagnen</h3>
        <div className="space-y-3">
          <div className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50/50 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Frühbucher-Rabatt 2024</div>
                <div className="text-sm text-gray-600">E-Mail-Kampagne • {new Intl.NumberFormat('de-DE').format(stats.newsletterSubscribers)} Empfänger</div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-lg font-medium">Aktiv</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
