'use client';

import { useQuery } from '@tanstack/react-query';
import { authedFetch } from '@/lib/api/authedFetch';
import { useRouter, useSearchParams } from 'next/navigation';
import { PhoneIcon, ClockIcon, UserIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import clsx from 'clsx';
import { AkEmptyState } from '@/components/ui/AkEmptyState';

// Types matches backend response
interface TelephonyCall {
  id: string;
  call_id: string;
  phone_number: string;
  from_number: string | null;
  to_number: string | null;
  mode: string | null;
  status: string | null;
  call_duration_seconds: number | null;
  created_at: string;
  transcription?: string;
  summary?: string;
}

export function TelephonyLogViewer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCallId = searchParams.get('callId');

  // --- LIST QUERY ---
  const { data: calls, isLoading: listLoading } = useQuery({
    queryKey: ['telephony-calls-list'],
    queryFn: async () => {
      const res = await authedFetch('/api/telephony/calls?limit=50');
      if (!res.ok) throw new Error('Failed to fetch calls');
      return res.json() as Promise<{ calls: TelephonyCall[] } | TelephonyCall[]>; // Handle both formats
    }
  });

  const callsList = Array.isArray(calls) ? calls : (calls?.calls || []);

  // --- DETAIL QUERY ---
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['telephony-call-detail', selectedCallId],
    queryFn: async () => {
      if (!selectedCallId) return null;
      const res = await authedFetch(`/api/telephony/calls/${selectedCallId}`);
      if (!res.ok) throw new Error('Failed to fetch detail');
      return res.json() as Promise<TelephonyCall>;
    },
    enabled: !!selectedCallId
  });

  const handleSelect = (callId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('callId', callId);
    router.push(`/telephony?${params.toString()}`);
  };

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[500px] border border-[var(--ak-color-border-subtle)] rounded-lg overflow-hidden bg-[var(--ak-color-bg-surface)]">
      {/* LEFT LIST */}
      <div className="w-1/3 border-r border-[var(--ak-color-border-subtle)] flex flex-col bg-[var(--ak-color-bg-surface)]">
        <div className="p-3 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] text-xs font-medium text-[var(--ak-color-text-secondary)] uppercase tracking-wider">
          Anrufliste
        </div>
        <div className="flex-1 overflow-y-auto">
          {listLoading ? (
            <div className="p-4 text-center text-sm text-[var(--ak-color-text-muted)]">Lade Anrufe...</div>
          ) : callsList.length === 0 ? (
            <div className="p-4 text-center text-sm text-[var(--ak-color-text-muted)]">Keine Anrufe gefunden</div>
          ) : (
            <ul className="divide-y divide-[var(--ak-color-border-subtle)]">
              {callsList.map((call) => {
                const isActive = selectedCallId === call.call_id || selectedCallId === call.id;
                return (
                  <li 
                    key={call.id}
                    onClick={() => handleSelect(call.call_id || call.id)}
                    className={clsx(
                      'p-4 cursor-pointer hover:bg-[var(--ak-color-bg-hover)] transition-colors',
                      isActive ? 'bg-[var(--ak-color-bg-selected)]' : ''
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-[var(--ak-color-text-primary)]">
                        {call.from_number || 'Unbekannt'}
                      </span>
                      <span className={clsx(
                        'text-xs px-1.5 py-0.5 rounded',
                        call.status === 'ended' ? 'ak-badge-success' : 
                        call.status === 'missed' ? 'ak-badge-danger' : 'ak-badge-info'
                      )}>
                        {call.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--ak-color-text-secondary)]">
                      <ClockIcon className="w-3 h-3" />
                      {call.created_at ? formatDistanceToNow(new Date(call.created_at), { addSuffix: true, locale: de }) : '-'}
                      {call.call_duration_seconds && (
                         <span>• {Math.round(call.call_duration_seconds)}s</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* RIGHT DETAIL */}
      <div className="w-2/3 flex flex-col bg-[var(--ak-color-bg-app)]">
        {!selectedCallId ? (
          <AkEmptyState
            icon={<PhoneIcon />}
            title="Kein Anruf ausgewählt"
            description="Wählen Sie einen Anruf aus der Liste, um Details zu sehen."
          />
        ) : detailLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <ArrowPathIcon className="w-6 h-6 animate-spin text-[var(--ak-color-text-muted)]" />
          </div>
        ) : detail ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-start justify-between">
               <div>
                 <h2 className="text-xl font-bold text-[var(--ak-color-text-primary)] mb-1">
                    {detail.from_number || 'Unbekannte Nummer'}
                 </h2>
                 <p className="text-sm text-[var(--ak-color-text-secondary)]">
                    Anruf ID: {detail.call_id}
                 </p>
               </div>
               <div className="text-right">
                  <div className="text-sm font-medium text-[var(--ak-color-text-primary)]">
                    {new Date(detail.created_at).toLocaleString()}
                  </div>
                  <div className="text-sm text-[var(--ak-color-text-secondary)]">
                    Modus: {detail.mode}
                  </div>
               </div>
            </div>

            {/* Summary Card */}
            {detail.summary && (
              <div className="ak-bg-surface-1 p-4 rounded-lg border border-[var(--ak-color-border-subtle)] shadow-sm">
                <h3 className="text-sm font-medium text-[var(--ak-color-text-primary)] mb-2 uppercase tracking-wider">
                    Zusammenfassung
                </h3>
                <p className="text-sm text-[var(--ak-color-text-secondary)] leading-relaxed">
                    {detail.summary}
                </p>
              </div>
            )}

            {/* Transcript Card */}
            <div className="ak-bg-surface-1 p-4 rounded-lg border border-[var(--ak-color-border-subtle)] shadow-sm">
                <h3 className="text-sm font-medium text-[var(--ak-color-text-primary)] mb-2 uppercase tracking-wider">
                    Transkript
                </h3>
                {detail.transcription ? (
                    <p className="text-sm text-[var(--ak-color-text-secondary)] whitespace-pre-wrap leading-relaxed font-mono ak-bg-surface-2 p-3 rounded">
                        {detail.transcription}
                    </p>
                ) : (
                    <p className="text-sm text-[var(--ak-color-text-muted)] italic">
                        Kein Transkript verfügbar.
                    </p>
                )}
            </div>
            
             {/* Tech Details */}
             <div className="grid grid-cols-3 gap-4">
                <div className="p-3 ak-bg-surface-2 rounded border ak-border-default">
                    <div className="text-xs ak-text-muted">Dauer</div>
                    <div className="font-medium">{detail.call_duration_seconds || 0}s</div>
                </div>
                <div className="p-3 ak-bg-surface-2 rounded border ak-border-default">
                    <div className="text-xs ak-text-muted">Status</div>
                    <div className="font-medium capitalize">{detail.status}</div>
                </div>
                <div className="p-3 ak-bg-surface-2 rounded border ak-border-default">
                    <div className="text-xs ak-text-muted">To Number</div>
                    <div className="font-medium">{detail.to_number}</div>
                </div>
             </div>
          </div>
        ) : (
           <AkEmptyState
            icon={<PhoneIcon />}
            title="Anruf nicht gefunden"
            description="Die Details konnten nicht geladen werden."
          />
        )}
      </div>
    </div>
  );
}

