import { useQuery } from '@tanstack/react-query';
import { useTelephonyStats } from '@/lib/telephony/useTelephonyStats';
import { useReviewStats } from '@/lib/reviews/useReviewStats';
import { UniversalInboxItem } from '@/lib/inbox/types';
import { Customer } from '@/features/customers/types';
import { authedFetch } from '@/lib/api/authedFetch';

export function useServiceHubData() {
    // 1. Customers
    const customersQuery = useQuery({
        queryKey: ['customers', 'all'],
        queryFn: async () => {
            const res = await authedFetch('/api/customers');
            if (!res.ok) throw new Error('Failed to fetch customers');
            const json = await res.json();
            return json.customers as Customer[];
        },
        staleTime: 60000,
    });

    // 2. Support Tickets
    const ticketsQuery = useQuery({
        queryKey: ['inbox', 'support'],
        queryFn: async () => {
            const res = await authedFetch('/api/inbox?channel=support');
            if (!res.ok) {
                const errorText = await res.text().catch(() => 'Unknown error');
                throw new Error(`Failed to fetch support tickets: ${errorText}`);
            }
            const json = await res.json();
            return json.items as UniversalInboxItem[];
        },
        staleTime: 30000,
    });

    // 3. Stats Hooks
    const phone = useTelephonyStats(30000);
    const reviews = useReviewStats(30000);

    const customers = customersQuery.data || [];
    const tickets = ticketsQuery.data || [];
    const phoneStats = phone.stats;
    const reviewStats = reviews.stats;

    return {
        customers,
        tickets,
        phoneStats,
        reviewStats,
        isLoading: customersQuery.isLoading || ticketsQuery.isLoading || phone.loading || reviews.loading,
        isError: customersQuery.isError || ticketsQuery.isError || !!phone.error || !!reviews.error,
        error: customersQuery.error || ticketsQuery.error || phone.error || reviews.error,
        ticketsLoading: ticketsQuery.isLoading,
        phoneLoading: phone.loading,
        reviewLoading: reviews.loading,
        refetch: () => {
            void customersQuery.refetch();
            void ticketsQuery.refetch();
            void phone.refetch();
            void reviews.refetch();
        }
    };
}

