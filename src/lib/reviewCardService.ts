/**
 * Review Card Service
 * Erstellt Detailkarten für Reviews/Bewertungen
 */

import type { EntityCardPayload } from '@/components/chat/cards/types'
import { dispatchCardToChat } from './dashboardCardService'

export interface Review {
  id: string
  review_id: string
  rating: number
  author_name: string | null
  comment: string | null
  status: string
  created_at_platform: string
  platform?: string
}

/**
 * Erstellt eine Entity-Card für eine Review/Bewertung
 */
export function createReviewCard(review: Review): EntityCardPayload {
  return {
    type: 'entity',
    id: `review-${review.id}`,
    title: `Bewertung von ${review.author_name || 'Anonym'}`,
    subtitle: `${review.rating} Sterne${review.platform ? ` • ${review.platform}` : ''}`,
    status: review.status === 'posted' ? 'active' : review.status === 'new' || review.status === 'drafted' ? 'pending' : 'error',
    createdAt: Date.now(),
    source: {
      moduleToken: 'review',
      entityType: 'review',
      entityId: review.id,
    },
    data: {
      'Autor': review.author_name || 'Anonym',
      'Bewertung': `${review.rating}/5`,
      'Status': review.status === 'posted' ? 'Beantwortet' : review.status === 'drafted' ? 'Entwurf' : 'Unbeantwortet',
      'Plattform': review.platform || 'Unbekannt',
      'Datum': new Date(review.created_at_platform).toLocaleDateString('de-DE'),
    },
    actions: [
      {
        id: 'draft_reply',
        label: 'Antwort erstellen',
        variant: 'primary',
      },
      {
        id: 'post_reply',
        label: 'Antwort veröffentlichen',
        variant: 'secondary',
      },
      {
        id: 'extract_feedback',
        label: 'Feedback extrahieren',
        variant: 'secondary',
      },
    ],
    explanation: review.comment || `Bewertung mit ${review.rating} Sternen von ${review.author_name || 'einem anonymen Benutzer'}.`,
  }
}

/**
 * Dispatched eine Review-Card in den Chat
 */
export function dispatchReviewCard(review: Review) {
  const card = createReviewCard(review)
  dispatchCardToChat(card)
}

