'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkLogEntry } from '@/lib/worklog/types';
import { loadWorkLog } from '@/lib/worklog/storage';
import { applyWorkLogFilters } from '@/features/worklog/filtering';
import { WorkLogRow } from './WorkLogRow';
import { AkEmptyState } from '@/components/ui/AkEmptyState';
import { ClockIcon } from '@heroicons/react/24/outline';
import { authedFetch } from '@/lib/api/authedFetch';

function groupByDate(entries: WorkLogEntry[]): {
  today: WorkLogEntry[];
  yesterday: WorkLogEntry[];
  older: WorkLogEntry[];
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups = {
    today: [] as WorkLogEntry[],
    yesterday: [] as WorkLogEntry[],
    older: [] as WorkLogEntry[],
  };

  entries.forEach((entry) => {
    const entryDate = new Date(entry.ts);
    if (entryDate >= today) {
      groups.today.push(entry);
    } else if (entryDate >= yesterday) {
      groups.yesterday.push(entry);
    } else {
      groups.older.push(entry);
    }
  });

  return groups;
}

export function WorkLogView() {
  const searchParams = useSearchParams();
  const [entries, setEntries] = useState<WorkLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Parse filters from URL
  const filters = useMemo(() => {
    const w_type = searchParams.get('w_type');
    const w_ch = searchParams.get('w_ch');
    const w_range = searchParams.get('w_range') || '7d';

    return {
      type: w_type ? (w_type.split(',') as WorkLogEntry['type'][]) : ['executed'], // Default: executed only
      channel: w_ch ? (w_ch.split(',') as WorkLogEntry['channel'][]) : undefined,
      range: w_range as 'today' | '7d' | '30d' | 'all',
    };
  }, [searchParams]);

  // Load remote entries from API
  useEffect(() => {
    const loadRemoteEntries = async () => {
      setLoading(true);
      try {
        // Build query params
        const params = new URLSearchParams({
          range: filters.range || '7d',
          limit: '200',
        });
        
        // Add types filter (default: executed only)
        if (filters.type && filters.type.length > 0) {
          params.set('types', filters.type.join(','));
        }

        const response = await authedFetch(`/api/worklog?${params.toString()}`);
        
        if (!response.ok) {
          console.error('Failed to load worklog:', response.status);
          setEntries([]);
          return;
        }

        const data = await response.json();
        const remoteEntries = (data.entries || []) as WorkLogEntry[];

        // Optional: Merge with localStorage entries (setup type only)
        const localEntries = loadWorkLog();
        const localSetupEntries = localEntries.filter(e => e.type === 'setup');
        
        // Dedupe by id (remote entries take precedence)
        const remoteIds = new Set(remoteEntries.map(e => e.id));
        const mergedEntries = [
          ...remoteEntries,
          ...localSetupEntries.filter(e => !remoteIds.has(e.id)),
        ];

        // Sort by timestamp descending
        mergedEntries.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

        setEntries(mergedEntries);
      } catch (error) {
        console.error('Error loading worklog:', error);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    loadRemoteEntries();
  }, [filters.range, filters.type?.join(',')]);

  // Apply client-side filters (channel)
  const filteredEntries = useMemo(() => {
    let filtered = entries;
    
    // Apply channel filter client-side (if provided)
    if (filters.channel && filters.channel.length > 0) {
      const channelSet = new Set(filters.channel);
      filtered = filtered.filter(e => channelSet.has(e.channel));
    }
    
    return filtered;
  }, [entries, filters.channel]);

  // Group by date
  const grouped = useMemo(() => {
    return groupByDate(filteredEntries);
  }, [filteredEntries]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-medium text-[var(--ak-color-text-primary)] mb-1">
            Aktivität
          </h1>
          <p className="text-sm text-[var(--ak-color-text-muted)]">
            Timeline aller Aktionen und Ereignisse
          </p>
        </div>
        <div className="text-center py-8 text-[var(--ak-color-text-muted)]">
          Lade Aktivitäten...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-medium text-[var(--ak-color-text-primary)] mb-1">
          Aktivität
        </h1>
        <p className="text-sm text-[var(--ak-color-text-muted)]">
          Timeline aller Aktionen und Ereignisse
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {/* Heute */}
        {grouped.today.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-3">
              Heute
            </h2>
            <div className="space-y-1">
              {grouped.today.map((entry) => (
                <WorkLogRow key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )}

        {/* Gestern */}
        {grouped.yesterday.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-3">
              Gestern
            </h2>
            <div className="space-y-1">
              {grouped.yesterday.map((entry) => (
                <WorkLogRow key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )}

        {/* Älter */}
        {grouped.older.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-3">
              Älter
            </h2>
            <div className="space-y-1">
              {grouped.older.map((entry) => (
                <WorkLogRow key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredEntries.length === 0 && entries.length > 0 && (
          <AkEmptyState
            icon={<ClockIcon />}
            title="Keine Einträge gefunden"
            description="Keine Einträge für die gewählten Filter."
          />
        )}
      </div>
    </div>
  );
}

