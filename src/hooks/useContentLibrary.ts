import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ContentItem {
  id: string;
  title?: string;
  content: string;
  channel: string;
  status: string;
  scheduled_at?: string;
  created_at: string;
}

interface ContentFilters {
  status?: string;
  channel?: string;
}

export function useContentLibrary(filters: ContentFilters = {}) {
  const { status, channel } = filters;
  const queryClient = useQueryClient();

  // Fetch Content
  const query = useQuery({
    queryKey: ['content-library', { status, channel }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (channel) params.set('channel', channel);

      const res = await fetch(`/api/marketing/content?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch content');
      
      const data = await res.json();
      return (data.items || []) as ContentItem[];
    },
  });

  // Actions
  const deleteContent = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/marketing/content/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete content');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-library'] });
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'success', message: 'Post gelöscht' },
        })
      );
    },
    onError: (error) => {
      console.error('Failed to delete:', error);
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'error', message: 'Fehler beim Löschen' },
        })
      );
    },
  });

  const duplicateContent = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/marketing/content/${id}/duplicate`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to duplicate content');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-library'] });
      window.dispatchEvent(
        new CustomEvent('aklow-notification', {
          detail: { type: 'success', message: 'Post dupliziert' },
        })
      );
    },
    onError: (error) => {
      console.error('Failed to duplicate:', error);
    },
  });

  return {
    ...query,
    deleteContent,
    duplicateContent,
  };
}

