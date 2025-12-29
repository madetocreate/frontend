import { useState, useEffect } from 'react';
import { authedFetch } from '@/lib/api/authedFetch';

export interface TelephonyCall {
  id: string;
  call_id: string;
  from_number: string | null;
  created_at: Date;
  call_duration_seconds: number | null;
  status: string | null;
  mode: string | null;
}

export function useTelephonyLogs() {
  const [calls, setCalls] = useState<TelephonyCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const response = await authedFetch('/api/telephony/calls');
      const data = await response.json();
      setCalls(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch calls:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  return { calls, loading, error, refetch: fetchCalls };
}

