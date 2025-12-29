import { useQuery } from '@tanstack/react-query';
import { authedFetch } from '@/lib/api/authedFetch';

interface MarketingStats {
  by_status: {
    draft: number;
    scheduled: number;
    published: number;
  };
  last_week: number;
}

export function useMarketingHubData() {
  const { data: stats, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['marketing-hub-stats'],
    queryFn: async () => {
      const res = await authedFetch('/api/marketing/content/stats');
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        throw new Error(`Failed to fetch marketing stats: ${errorText}`);
      }
      
      const data = await res.json();
      
      // Robust Normalization
      const normalizedStats: MarketingStats = {
        by_status: {
          draft: data.by_status?.draft ?? 0,
          scheduled: data.by_status?.scheduled ?? 0,
          published: data.by_status?.published ?? 0,
        },
        last_week: data.last_week ?? 0,
      };
      
      return normalizedStats;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { 
    stats: stats ?? null, 
    loading, 
    error: error instanceof Error ? error.message : null, 
    refetch 
  };
}

