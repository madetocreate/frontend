'use client'

import { useState, useEffect } from 'react'
import {
  StarIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

interface Review {
  id: string
  author: string
  rating: number
  text: string
  createdAt: string
  responded: boolean
  responseText?: string
  source: 'google' | 'facebook' | 'trustpilot'
}

export function ReviewBotReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'responded'>('all')

  useEffect(() => {
    void loadReviews()
  }, [])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
      const response = await fetch(`${backendUrl}/integrations/reviews/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      } else {
        // Mock data
        setReviews([
          {
            id: '1',
            author: 'Max Mustermann',
            rating: 5,
            text: 'Exzellenter Service! Das Team war sehr professionell und hilfsbereit.',
            createdAt: '2025-12-25T10:00:00Z',
            responded: true,
            responseText: 'Vielen Dank für Ihr positives Feedback!',
            source: 'google',
          },
          {
            id: '2',
            author: 'Anna Schmidt',
            rating: 4,
            text: 'Sehr gut, aber es gibt noch Raum für Verbesserungen bei der Lieferzeit.',
            createdAt: '2025-12-24T15:30:00Z',
            responded: false,
            source: 'google',
          },
          {
            id: '3',
            author: 'Peter Wagner',
            rating: 5,
            text: 'Absolut empfehlenswert! Werde definitiv wiederkommen.',
            createdAt: '2025-12-23T12:20:00Z',
            responded: true,
            responseText: 'Herzlichen Dank für Ihre Empfehlung!',
            source: 'google',
          },
        ])
      }
    } catch (error) {
      console.error('Failed to load reviews:', error)
    }
    setLoading(false)
  }

  const filteredReviews = reviews.filter(review => {
    // Filter by response status
    if (filter === 'pending' && review.responded) return false
    if (filter === 'responded' && !review.responded) return false
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        review.author.toLowerCase().includes(searchLower) ||
        review.text.toLowerCase().includes(searchLower)
      )
    }
    
    return true
  })

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `Vor ${diffMins}m`
    if (diffHours < 24) return `Vor ${diffHours}h`
    if (diffDays < 7) return `Vor ${diffDays}d`
    return date.toLocaleDateString('de-DE')
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-[var(--ak-semantic-warning)] fill-[var(--ak-semantic-warning)]' : 'text-[var(--ak-color-text-muted)]'}`}
      />
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-[var(--ak-color-text-primary)]">
          Reviews verwalten
        </h2>
        <p className="text-sm text-[var(--ak-color-text-secondary)] mt-1">
          Alle Kundenbewertungen an einem Ort
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--ak-color-text-muted)]" />
            <input
              type="text"
              placeholder="Suche nach Autor oder Text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] rounded-lg text-[var(--ak-color-text-primary)] placeholder:text-[var(--ak-color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)]'
                : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)]'
            }`}
          >
            Alle
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)]'
                : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)]'
            }`}
          >
            Ausstehend
          </button>
          <button
            onClick={() => setFilter('responded')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'responded'
                ? 'bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)]'
                : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)]'
            }`}
          >
            Beantwortet
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-[var(--ak-color-text-secondary)] ak-surface-1 rounded-[var(--ak-radius-lg)] border ak-border-default">
            Lade Reviews...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-8 text-center text-[var(--ak-color-text-secondary)] ak-surface-1 rounded-[var(--ak-radius-lg)] border ak-border-default">
            Keine Reviews gefunden
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="ak-surface-1 rounded-[var(--ak-radius-lg)] border ak-border-default ak-elev-1 p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-[var(--ak-color-text-primary)]">
                      {review.author}
                    </span>
                    <span className="text-xs text-[var(--ak-color-text-muted)] uppercase">
                      {review.source}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-xs text-[var(--ak-color-text-muted)]">
                      {formatTime(review.createdAt)}
                    </span>
                  </div>
                </div>
                <div>
                  {review.responded ? (
                    <CheckCircleIcon className="h-6 w-6 text-[var(--ak-semantic-success)]" />
                  ) : (
                    <ClockIcon className="h-6 w-6 text-[var(--ak-semantic-warning)]" />
                  )}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <p className="text-[var(--ak-color-text-primary)]">
                  {review.text}
                </p>
              </div>

              {/* Response */}
              {review.responded && review.responseText ? (
                <div className="bg-[var(--ak-color-bg-surface)] rounded-lg p-4 border-l-4 border-[var(--ak-color-accent)]">
                  <p className="text-sm font-medium text-[var(--ak-color-text-primary)] mb-1">
                    Ihre Antwort:
                  </p>
                  <p className="text-sm text-[var(--ak-color-text-secondary)]">
                    {review.responseText}
                  </p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    className="flex-1 px-4 py-2 bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] rounded-lg font-medium hover:opacity-90 transition-opacity"
                    onClick={() => {
                      alert('AI-Antwort wird generiert... (Feature kommt bald)')
                    }}
                  >
                    AI-Antwort generieren
                  </button>
                  <button
                    className="px-4 py-2 bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-primary)] rounded-lg font-medium hover:bg-[var(--ak-color-bg-hover)] transition-colors"
                    onClick={() => {
                      alert('Manuelle Antwort-Editor öffnet... (Feature kommt bald)')
                    }}
                  >
                    Manual beantworten
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Stats Footer */}
      <div className="text-center text-sm text-[var(--ak-color-text-secondary)]">
        {filteredReviews.length} von {reviews.length} Reviews angezeigt
      </div>
    </div>
  )
}

