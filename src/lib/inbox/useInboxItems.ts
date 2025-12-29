import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UniversalInboxItem } from './types';
import { normalizeInboxItem, isUniversalInboxItem } from './guards';
import { authedFetch } from '@/lib/api/authedFetch';

interface UseInboxItemsResult {
  items: UniversalInboxItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => Promise<void>;
  markRead: (id: string) => void;
  addLocalItem: (item: UniversalInboxItem) => void;
}

const REFRESH_INTERVAL = 20000; // 20 Sekunden

export function useInboxItems(filters: { q?: string; type?: string; channel?: string[] } = {}): UseInboxItemsResult {
  const queryClient = useQueryClient();
  
  const filtersKey = `${filters.q || ''}|${filters.type || ''}|${filters.channel?.join(',') || ''}`;

  const { data, isLoading, isRefetching: isRefreshing, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['inbox', 'items', filters],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.type && filters.type !== 'all') params.set('type', filters.type);
      if (filters.channel?.length) params.set('channel', filters.channel.join(','));

      const response = await authedFetch(`/api/inbox?${params.toString()}`, { signal } as any);
      
      if (!response.ok) {
        throw new Error(`Fehler beim Laden: ${response.statusText}`);
      }
      
      const json = await response.json();
      const rawItems = Array.isArray(json.items) ? json.items : [];
      
      return rawItems
        .map(normalizeInboxItem)
        .filter(isUniversalInboxItem)
        .sort((a: UniversalInboxItem, b: UniversalInboxItem) => {
          if (a.unread !== b.unread) return a.unread ? -1 : 1;
          return b.time.localeCompare(a.time);
        });
    },
    staleTime: 30000,
    refetchInterval: (query) => {
      // Nur pollen wenn Tab im Fokus
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return false;
      return REFRESH_INTERVAL;
    }
  });

  const items = data || [];

  const markRead = useCallback((id: string) => {
    // Optimistic Update in Cache
    queryClient.setQueryData(['inbox', 'items', filters], (old: UniversalInboxItem[] | undefined) => {
      if (!old) return old;
      return old.map(item => item.id === id ? { ...item, unread: false } : item);
    });
  }, [queryClient, filters]);

  const addLocalItem = useCallback((item: UniversalInboxItem) => {
    queryClient.setQueryData(['inbox', 'items', filters], (old: UniversalInboxItem[] | undefined) => {
      if (!old) return [item];
      return [item, ...old];
    });
  }, [queryClient, filters]);

  return {
    items,
    isLoading,
    isRefreshing,
    error: error instanceof Error ? error.message : null,
    lastUpdated: dataUpdatedAt,
    refresh: async () => { await refetch(); },
    markRead,
    addLocalItem
  };
}

