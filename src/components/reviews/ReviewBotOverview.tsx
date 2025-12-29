'use client'

import { useState, useEffect } from 'react'
import {
  StarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { 
  appleCardStyle, 
  appleSectionTitle, 
  appleSubTitle, 
  appleGroupedList, 
  appleListItem,
  appleButtonStyle,
  appleAnimationFadeInUp,
  appleAnimationHoverFloat
} from '@/lib/appleDesign'

interface ReviewStats {
  totalReviews: number
  newReviews24h: number
  avgRating: number
  responded: number
  pending: number
  responseRate: number
}

export function ReviewBotOverview() {
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    newReviews24h: 0,
    avgRating: 0,
    responded: 0,
    pending: 0,
    responseRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
      const response = await fetch(`${backendUrl}/integrations/reviews/analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || stats)
      } else {
        // Mock data
        setStats({
          totalReviews: 127,
          newReviews24h: 8,
          avgRating: 4.6,
          responded: 95,
          pending: 12,
          responseRate: 88.8,
        })
      }
    } catch (error) {
      console.error('Failed to load review stats:', error)
      // Mock data
      setStats({
        totalReviews: 127,
        newReviews24h: 8,
        avgRating: 4.6,
        responded: 95,
        pending: 12,
        responseRate: 88.8,
      })
    }
    setLoading(false)
  }

  const statCards = [
    {
      label: 'Neue Reviews (24h)',
      value: loading ? '-' : stats.newReviews24h.toString(),
      icon: StarIcon,
      color: 'text-[var(--ak-semantic-warning)]',
      bgColor: 'bg-[var(--ak-semantic-warning-soft)]',
    },
    {
      label: 'Durchschnittsbewertung',
      value: loading ? '-' : `${stats.avgRating.toFixed(1)} ⭐`,
      icon: ChartBarIcon,
      color: 'text-[var(--ak-semantic-warning)]',
      bgColor: 'bg-[var(--ak-semantic-warning-soft)]',
    },
    {
      label: 'Beantwortet',
      value: loading ? '-' : stats.responded.toString(),
      icon: CheckCircleIcon,
      color: 'text-[var(--ak-semantic-success)]',
      bgColor: 'bg-[var(--ak-semantic-success-soft)]',
    },
    {
      label: 'Ausstehend',
      value: loading ? '-' : stats.pending.toString(),
      icon: ClockIcon,
      color: 'text-[var(--ak-semantic-info)]',
      bgColor: 'bg-[var(--ak-semantic-info-soft)]',
    },
    {
      label: 'Gesamt Reviews',
      value: loading ? '-' : stats.totalReviews.toString(),
      icon: ChatBubbleLeftRightIcon,
      color: 'text-[var(--ak-color-accent-documents)]',
      bgColor: 'bg-[var(--ak-color-accent-documents-soft)]',
    },
    {
      label: 'Antwortrate',
      value: loading ? '-' : `${stats.responseRate}%`,
      icon: ChartBarIcon,
      color: 'text-[var(--ak-color-accent)]',
      bgColor: 'bg-[var(--ak-color-accent-soft)]',
    },
  ]

  return (
    <div className={`space-y-8 ${appleAnimationFadeInUp}`}>
      {/* Header */}
      <div>
        <h2 className={appleSectionTitle}>
          Review-Bot Übersicht
        </h2>
        <p className={`${appleSubTitle} mt-1`}>
          Aktivität und Statistiken Ihrer Google Reviews
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => (
          <div
            key={stat.label}
            className={`${appleCardStyle} p-6 ${appleAnimationHoverFloat}`}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--ak-color-text-secondary)] mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-[var(--ak-color-text-primary)] tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
            Schnellaktionen
          </h3>
          <div className={`${appleCardStyle} p-6 space-y-3`}>
            <button
              className={`w-full ${appleButtonStyle.primary} flex items-center justify-center gap-2`}
              onClick={() => {/* Navigate to reviews */}}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              Reviews beantworten
            </button>
            <button
              className={`w-full ${appleButtonStyle.secondary} flex items-center justify-center gap-2`}
              onClick={() => void loadStats()}
            >
              <ChartBarIcon className="h-5 w-5" />
              Statistiken aktualisieren
            </button>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
            Letzte Reviews
          </h3>
          <div className={appleGroupedList}>
            <div className={appleListItem}>
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-[var(--ak-semantic-warning-soft)]">
                  <StarIcon className="h-5 w-5 text-[var(--ak-semantic-warning)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--ak-color-text-primary)]">
                    ⭐⭐⭐⭐⭐ Exzellenter Service!
                  </p>
                  <p className="text-xs text-[var(--ak-color-text-secondary)]">
                    Vor 2 Stunden - Max Mustermann
                  </p>
                </div>
              </div>
              <CheckCircleIcon className="h-5 w-5 text-[var(--ak-semantic-success)]" />
            </div>
            
            <div className={appleListItem}>
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-[var(--ak-semantic-warning-soft)]">
                  <StarIcon className="h-5 w-5 text-[var(--ak-semantic-warning)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--ak-color-text-primary)]">
                    ⭐⭐⭐⭐ Sehr gut, kleine Verbesserungen möglich
                  </p>
                  <p className="text-xs text-[var(--ak-color-text-secondary)]">
                    Vor 5 Stunden - Anna Schmidt
                  </p>
                </div>
              </div>
              <ClockIcon className="h-5 w-5 text-[var(--ak-semantic-warning)]" />
            </div>
            
            <div className={appleListItem}>
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-[var(--ak-semantic-warning-soft)]">
                  <StarIcon className="h-5 w-5 text-[var(--ak-semantic-warning)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--ak-color-text-primary)]">
                    ⭐⭐⭐⭐⭐ Absolut empfehlenswert!
                  </p>
                  <p className="text-xs text-[var(--ak-color-text-secondary)]">
                    Vor 8 Stunden - Peter Wagner
                  </p>
                </div>
              </div>
              <CheckCircleIcon className="h-5 w-5 text-[var(--ak-semantic-success)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

