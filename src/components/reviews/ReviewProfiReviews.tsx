'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { Virtuoso } from 'react-virtuoso'
import { useReviewCounts, useReviewInbox, useReviewDetail, useReviewActions, ReviewItem, ReviewCounts } from '@/hooks/useReviewHubData'
import { AkErrorState } from '@/components/ui/AkErrorState'
import { AkEmptyState } from '@/components/ui/AkEmptyState'

type StatusFilter = 'all' | 'new' | 'drafted' | 'posted' | 'failed' | 'ignored'

export function ReviewProfiReviews() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null)
  
  // Hooks
  const { data: countsData, isLoading: countsLoading, error: countsError } = useReviewCounts()
  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError } = useReviewInbox({ 
    limit: 100, 
    status: statusFilter 
  })
  
  const { data: selectedReviewDetail } = useReviewDetail(selectedReviewId)
  
  const { generateDraft, saveDraft, postReply, ignoreReview } = useReviewActions()

  const reviews = reviewsData || []
  const counts = countsData || { new: 0, drafted: 0, failed: 0, total: 0 }
  const loading = countsLoading || reviewsLoading
  const error = (countsError as Error)?.message || (reviewsError as Error)?.message || null

  // Use selectedReviewDetail or find in list if needed, but detail hook is safer for fresh data
  const selectedReview = selectedReviewDetail || reviews.find(r => r.id === selectedReviewId) || null

  // Local state for draft text
  const [draftText, setDraftText] = useState('')
  
  // Effect to update draft text when review changes
  useEffect(() => {
    if (selectedReview) {
      setDraftText(selectedReview.draft_reply || '')
    }
  }, [selectedReview?.id, selectedReview?.draft_reply])

  const filteredReviews = useMemo(() => {
    if (!searchQuery) return reviews
    const query = searchQuery.toLowerCase()
    return reviews.filter(review => {
      const author = review.author_name?.toLowerCase() || ''
      const comment = review.comment?.toLowerCase() || ''
      return author.includes(query) || comment.includes(query)
    })
  }, [reviews, searchQuery])

  const getStatusBadge = (status: string) => {
    const badges = {
      new: { label: 'Neu', color: 'ak-badge-info', icon: ClockIcon },
      drafted: { label: 'Entwurf', color: 'ak-badge-warning', icon: SparklesIcon },
      posted: { label: 'Gepostet', color: 'ak-badge-success', icon: CheckCircleIcon },
      failed: { label: 'Fehler', color: 'ak-badge-danger', icon: XCircleIcon },
      ignored: { label: 'Ignoriert', color: 'ak-badge-muted', icon: XMarkIcon },
    }
    return badges[status as keyof typeof badges] || badges.new
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

  const handleGenerateDraft = async () => {
    if (!selectedReview) return
    try {
      await generateDraft.mutateAsync(selectedReview.id)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate draft')
    }
  }

  const handleSaveDraft = async () => {
    if (!selectedReview || !draftText.trim()) return
    try {
      await saveDraft.mutateAsync({ reviewId: selectedReview.id, draftText: draftText })
      alert('Draft gespeichert')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save draft')
    }
  }

  const handlePostReply = async () => {
    if (!selectedReview) return
    try {
      await postReply.mutateAsync({ reviewId: selectedReview.id, draftText: draftText || undefined })
      setSelectedReviewId(null)
      alert('Antwort erfolgreich gepostet')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to post reply')
    }
  }

  const handleIgnore = async () => {
    if (!selectedReview) return
    try {
      await ignoreReview.mutateAsync(selectedReview.id)
      setSelectedReviewId(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to ignore review')
    }
  }

  // Combined loading state for actions
  const isActionLoading = 
    generateDraft.isPending || 
    saveDraft.isPending || 
    postReply.isPending || 
    ignoreReview.isPending

  // Specific action loading state helper
  const actionLoadingType = generateDraft.isPending ? 'generate' : 
                            saveDraft.isPending ? 'save' : 
                            postReply.isPending ? 'post' : 
                            ignoreReview.isPending ? 'ignore' : null

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold ak-text-primary">Bewertungen</h2>
          <p className="ak-text-secondary mt-1">Verwalten und beantworten Sie alle Bewertungen</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ak-text-muted" />
          <input
            type="text"
            placeholder="Bewertungen durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border ak-border-default bg-[var(--ak-color-bg-surface)] text-sm ak-text-primary placeholder:ak-text-muted focus-visible:outline-none focus-visible:ring ak-focus-ring transition-all ak-bg-glass"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'new', 'drafted', 'posted', 'failed', 'ignored'] as StatusFilter[]).map((status) => {
            const badge = status === 'all' ? null : getStatusBadge(status)
            const count = status === 'all' ? counts.total : counts[status as keyof ReviewCounts] || 0
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  statusFilter === status
                    ? 'ak-btn-primary ak-btn-gradient shadow-lg'
                    : 'ak-bg-glass ak-border-default ak-text-secondary hover:ak-bg-hover'
                }`}
              >
                {status === 'all' ? 'Alle' : badge?.label} {count > 0 && `(${count})`}
              </button>
            )
          })}
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="ak-card-glass rounded-3xl border ak-border-default shadow-lg p-12 text-center">
          <ArrowPathIcon className="h-16 w-16 ak-text-muted mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold ak-text-primary mb-2">Lade Bewertungen...</h3>
        </div>
      )}

      {error && !loading && (
        <AkErrorState
          error={error}
          onRetry={() => {
            setStatusFilter('all')
            setSearchQuery('')
          }}
        />
      )}

      {/* Reviews List */}
      {!loading && !error && filteredReviews.length === 0 && (
        <AkEmptyState
          icon={<ChatBubbleLeftRightIcon />}
          title="Keine Bewertungen gefunden"
          description="Versuchen Sie andere Filterkriterien oder verbinden Sie neue Quellen."
        />
      )}

      {!loading && !error && filteredReviews.length > 0 && (
        <div className="h-[600px] -mx-2">
          <Virtuoso
            data={filteredReviews}
            useWindowScroll={false}
            itemContent={(index, review) => {
              const badge = getStatusBadge(review.status)
              const BadgeIcon = badge.icon
              return (
                <div className="px-2 pb-4">
                  <div
                    key={review.id}
                    className="group p-5 ak-card-glass rounded-2xl border ak-border-default hover:border-[var(--ak-accent-inbox)]/60 hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedReviewId(review.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold ak-text-primary">{review.author_name || 'Anonym'}</span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${badge.color}`}>
                              <BadgeIcon className="h-3 w-3" />
                              {badge.label}
                            </span>
                          </div>
                          <div className="text-sm ak-text-secondary">{formatDate(review.created_at_platform)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIconSolid
                            key={star}
                            className={`h-5 w-5 ${
                              star <= review.rating ? 'text-[var(--ak-semantic-warning)]' : 'ak-text-muted'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="ak-text-secondary mb-3 leading-relaxed line-clamp-2">
                      {review.comment || '(Kein Kommentar)'}
                    </p>
                    {review.error && (
                      <div className="mt-2 px-3 py-2 ak-bg-danger-soft rounded-lg">
                        <p className="text-sm ak-text-danger">{review.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            }}
          />
        </div>
      )}

      {/* Review Detail Modal */}
      {selectedReview && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedReviewId(null)}
        >
          <div 
            className="ak-card-glass rounded-3xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold ak-text-primary">Bewertung-Details</h3>
              <button
                onClick={() => setSelectedReviewId(null)}
                className="p-2 ak-bg-surface-hover rounded-xl transition-colors"
              >
                <XMarkIcon className="h-5 w-5 ak-text-secondary" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Original Review */}
              <div className="p-5 ak-card-glass rounded-2xl border ak-border-default">
                <div className="flex items-center gap-4 mb-3">
                  <div>
                    <div className="text-sm ak-text-secondary">Autor</div>
                    <div className="text-xl font-bold ak-text-primary">{selectedReview.author_name || 'Anonym'}</div>
                  </div>
                  <div className="ml-auto">
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIconSolid
                          key={star}
                          className={`h-6 w-6 ${star <= selectedReview.rating ? 'text-[var(--ak-semantic-warning)]' : 'ak-text-muted'}`}
                        />
                      ))}
                    </div>
                    <div className="text-sm ak-text-secondary">{formatDate(selectedReview.created_at_platform)}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium ak-text-secondary mb-2 block">Bewertung</label>
                  <div className="p-4 ak-card-glass rounded-xl border ak-border-default">
                    <p className="ak-text-primary leading-relaxed">{selectedReview.comment || '(Kein Kommentar)'}</p>
                  </div>
                </div>
                {selectedReview.error && (
                  <div className="mt-4 px-4 py-3 ak-bg-danger-soft rounded-xl border ak-border-danger">
                    <p className="text-sm ak-text-danger font-medium">Fehler: {selectedReview.error}</p>
                  </div>
                )}
              </div>

              {/* Draft Editor */}
              {selectedReview.status === 'posted' && selectedReview.posted_reply ? (
                <div>
                  <label className="text-sm font-medium ak-text-secondary mb-2 block">Ihre Antwort</label>
                  <div className="p-4 ak-card-glass rounded-xl border ak-border-success ak-bg-success-soft">
                    <p className="ak-text-primary">{selectedReview.posted_reply}</p>
                    {selectedReview.posted_at && (
                      <p className="text-xs ak-text-secondary mt-2">Gepostet: {formatDate(selectedReview.posted_at)}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium ak-text-secondary mb-2 block">Antwort verfassen</label>
                  <textarea
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border ak-border-default bg-[var(--ak-color-bg-surface)] ak-text-primary placeholder:ak-text-muted focus-visible:outline-none focus-visible:ring ak-focus-ring min-h-[120px]"
                    placeholder="Schreiben Sie eine professionelle Antwort..."
                    disabled={isActionLoading}
                  />
                </div>
              )}

              {/* Actions */}
              {selectedReview.status !== 'ignored' && (
                <div className="pt-4 border-t border ak-border-default flex gap-3 flex-wrap">
                  {selectedReview.status !== 'posted' && (
                    <>
                      {!selectedReview.draft_reply && (
                        <button
                          onClick={handleGenerateDraft}
                          disabled={isActionLoading}
                          className="px-4 py-3 rounded-xl border ak-border-default ak-bg-glass ak-text-secondary hover:ak-bg-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoadingType === 'generate' ? (
                            <ArrowPathIcon className="h-5 w-5 animate-spin" />
                          ) : (
                            'Draft erzeugen'
                          )}
                        </button>
                      )}
                      {selectedReview.draft_reply && (
                        <button
                          onClick={handleSaveDraft}
                          disabled={isActionLoading || !draftText.trim()}
                          className="px-4 py-3 rounded-xl border ak-border-default ak-bg-glass ak-text-secondary hover:ak-bg-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoadingType === 'save' ? (
                            <ArrowPathIcon className="h-5 w-5 animate-spin" />
                          ) : (
                            'Draft speichern'
                          )}
                        </button>
                      )}
                      <button
                        onClick={handlePostReply}
                        disabled={isActionLoading || (!draftText.trim() && !selectedReview.draft_reply)}
                        className="flex-1 ak-btn-primary ak-btn-gradient shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoadingType === 'post' ? (
                          <ArrowPathIcon className="h-5 w-5 animate-spin mx-auto" />
                        ) : (
                          'Antwort posten'
                        )}
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleIgnore}
                    disabled={isActionLoading}
                    className="px-4 py-3 rounded-xl border ak-border-default ak-bg-glass ak-text-secondary hover:ak-bg-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoadingType === 'ignore' ? (
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    ) : (
                      'Ignorieren'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
