'use client';

import { useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { LeadsList } from '@/features/leads/LeadsList';
import { LeadDetail } from '@/features/leads/LeadDetail';
import { Lead } from '@/features/leads/types';
import { parseFilterParams, buildFilterParams } from '@/lib/filters/query';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function LeadsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse filters from URL
  const filterParams = parseFilterParams(searchParams);

  // Fetch leads from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['leads', filterParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterParams.status) {
        params.set('status', filterParams.status as string);
      }
      const res = await fetch(`/api/leads?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch leads');
      }
      const json = await res.json();
      return json.leads as Lead[];
    },
    staleTime: 30000, // 30s - leads change frequently
  });

  const allLeads = useMemo(() => data ?? [], [data]);

  // Get selected lead
  const selectedLeadId = filterParams.id as string | undefined;
  const { data: selectedLeadData } = useQuery({
    queryKey: ['lead', selectedLeadId],
    queryFn: async () => {
      if (!selectedLeadId) return null;
      const res = await fetch(`/api/leads/${selectedLeadId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch lead');
      }
      const json = await res.json();
      return json.lead as Lead;
    },
    enabled: !!selectedLeadId,
    staleTime: 10000,
  });

  const selectedLead = selectedLeadData || (selectedLeadId ? allLeads.find((l) => l.id === selectedLeadId) : null);

  const handleSelectLead = (lead: { id: string }) => {
    const params = buildFilterParams({ ...filterParams, id: lead.id });
    router.replace(`/leads?${params.toString()}`);
  };

  const handleBack = () => {
    const params = buildFilterParams(filterParams);
    params.delete('id');
    router.replace(`/leads?${params.toString()}`);
  };

  // Loading state
  if (isLoading) {
    return <div className="p-8 text-center text-[var(--ak-color-text-muted)]">Lade Leads…</div>;
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center text-[var(--ak-color-status-danger-text)]">
        Fehler beim Laden der Leads: {(error as Error).message}
      </div>
    );
  }

  // Detail View
  if (selectedLead) {
    return <LeadDetail lead={selectedLead} onBack={handleBack} />;
  }

  // List View
  return <LeadsList leads={allLeads} onSelectLead={handleSelectLead} />;
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="p-4 text-[var(--ak-color-text-muted)]">Lade Leads…</div>}>
      <LeadsPageContent />
    </Suspense>
  );
}

