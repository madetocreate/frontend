import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authedFetch } from '@/lib/api/authedFetch';

export interface ReviewCounts {
  new: number;
  drafted: number;
  failed: number;
  total: number;
}

export interface ReviewItem {
  id: string;
  rating: number;
  author_name: string | null;
  comment: string | null;
  created_at_platform: string;
  status: 'new' | 'drafted' | 'posted' | 'failed' | 'ignored';
  draft_reply: string | null;
  posted_reply: string | null;
  posted_at: string | null;
  location_id: string;
  review_id: string;
  error?: string | null;
}

interface InboxParams {
  limit?: number;
  offset?: number;
  status?: string;
}

export function useReviewCounts() {
  return useQuery({
    queryKey: ['review-counts'],
    queryFn: async () => {
      const res = await authedFetch('/api/reviews/inbox/counts');
      if (!res.ok) throw new Error('Failed to load counts');
      return res.json() as Promise<ReviewCounts>;
    },
    refetchInterval: 30000,
  });
}

export function useReviewInbox(params: InboxParams = {}) {
  const { limit = 100, offset = 0, status } = params;
  
  return useQuery({
    queryKey: ['review-inbox', { limit, offset, status }],
    queryFn: async () => {
      const statusParam = status && status !== 'all' ? `status=${status}&` : '';
      const res = await authedFetch(`/api/reviews/inbox?${statusParam}limit=${limit}&offset=${offset}`);
      if (!res.ok) throw new Error('Failed to load reviews');
      const data = await res.json();
      return (data.items || []) as ReviewItem[];
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useReviewSync() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const res = await authedFetch('/api/reviews/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Sync failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-counts'] });
      queryClient.invalidateQueries({ queryKey: ['review-inbox'] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
    },
  });
}

export function useReviewActions() {
  const queryClient = useQueryClient();

  const generateDraft = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await authedFetch(`/api/reviews/${reviewId}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Failed to generate draft');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-inbox'] });
    },
  });

  const saveDraft = useMutation({
    mutationFn: async ({ reviewId, draftText }: { reviewId: string; draftText: string }) => {
      const res = await authedFetch(`/api/reviews/${reviewId}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftReply: draftText }),
      });
      if (!res.ok) throw new Error('Failed to save draft');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-inbox'] });
    },
  });

  const postReply = useMutation({
    mutationFn: async ({ reviewId, draftText }: { reviewId: string; draftText?: string }) => {
      const res = await authedFetch(`/api/reviews/${reviewId}/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText: draftText }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to post reply');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-inbox'] });
      queryClient.invalidateQueries({ queryKey: ['review-counts'] });
    },
  });

  const ignoreReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await authedFetch(`/api/reviews/${reviewId}/ignore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Failed to ignore review');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-inbox'] });
      queryClient.invalidateQueries({ queryKey: ['review-counts'] });
    },
  });

  return {
    generateDraft,
    saveDraft,
    postReply,
    ignoreReview,
  };
}

export function useReviewDetail(reviewId: string | null) {
  return useQuery({
    queryKey: ['review-detail', reviewId],
    queryFn: async () => {
      if (!reviewId) return null;
      const res = await authedFetch(`/api/reviews/${reviewId}`);
      if (!res.ok) throw new Error('Failed to load review detail');
      return res.json() as Promise<ReviewItem>;
    },
    enabled: !!reviewId,
  });
}

