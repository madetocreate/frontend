'use client';

// Force dynamic rendering (views use localStorage)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ActionsOverview } from '@/features/actions/ActionsOverview';
import { TemplateFlowStub } from '@/features/actions/TemplateFlowStub';
import { SetupIntegrationsOverview } from '@/features/actions/setup/SetupIntegrationsOverview';
import { IntegrationSetupFlowStub } from '@/features/actions/setup/IntegrationSetupFlowStub';
// Views use localStorage - will be dynamically imported if needed
// For now, keep static imports but ensure they're client-only components
import { AssistantsHub } from '@/features/actions/assistants/AssistantsHub';
import { OpenLoopsView } from '@/features/actions/ops/OpenLoopsView';
import { ImpactView } from '@/features/actions/ops/ImpactView';
import { PacksView } from '@/features/actions/packs/PacksView';
import { applyActionsFilters } from '@/features/actions/filtering';
import { parseFilterParams, buildFilterParams } from '@/lib/filters/query';
import { getTemplateById } from '@/features/actions/catalog';
import { ActionCategoryId, ActionType, ActionView } from '@/features/actions/types';
import { IntegrationId } from '@/lib/integrations/types';

function ActionsPageContent() {
  // useSearchParams must be inside Suspense boundary
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse filters from URL
  const filterParams = parseFilterParams(searchParams);
  const actionsFilters = useMemo(() => {
    return {
      cat: filterParams.cat as ActionCategoryId[] | undefined,
      type: filterParams.type as ActionType | undefined,
      view: (filterParams.view || 'all') as ActionView,
    };
  }, [filterParams]);

  // Get integration param
  const integrationId = searchParams.get('integration') as IntegrationId | null;

  // Apply filters
  const { categories, templates } = useMemo(() => {
    return applyActionsFilters(actionsFilters);
  }, [actionsFilters]);

  // Get selected template
  const selectedTemplate = useMemo(() => {
    if (!filterParams.id) return null;
    return getTemplateById(filterParams.id);
  }, [filterParams.id]);

  const handleTemplateClick = (templateId: string) => {
    const params = buildFilterParams({ ...filterParams, id: templateId });
    router.replace(`/actions?${params.toString()}`);
  };

  const handleBack = () => {
    const params = buildFilterParams(filterParams);
    // Remove id from params
    params.delete('id');
    // If coming from integration flow, go back to setup overview
    if (integrationId) {
      params.set('cat', 'setup');
      params.delete('integration');
    }
    router.replace(`/actions?${params.toString()}`);
  };

  // Priority 1: Assistants Hub (cat=assistants)
  if (filterParams.cat?.includes('assistants')) {
    return <AssistantsHub />;
  }

  // Priority 1.5: Ops Views (cat=ops&view=open_loops|impact)
  if (filterParams.cat?.includes('ops')) {
    if (filterParams.view === 'open_loops') {
      return <OpenLoopsView />;
    }
    if (filterParams.view === 'impact') {
      return <ImpactView />;
    }
  }

  // Priority 1.6: Packs View (cat=packs)
  if (filterParams.cat?.includes('packs')) {
    return <PacksView />;
  }

  // Priority 2: Integration Setup Flow (cat=setup & integration param)
  if (filterParams.cat?.includes('setup') && integrationId) {
    return <IntegrationSetupFlowStub integrationId={integrationId} onBack={handleBack} />;
  }

  // Priority 3: Setup Integrations Overview (cat=setup)
  if (filterParams.cat?.includes('setup')) {
    return <SetupIntegrationsOverview />;
  }

  // Priority 4: Template Flow View
  if (selectedTemplate) {
    return <TemplateFlowStub template={selectedTemplate} onBack={handleBack} />;
  }

  // Default: Overview
  return (
    <ActionsOverview
      categories={categories}
      templates={templates}
      onTemplateClick={(template) => handleTemplateClick(template.id)}
    />
  );
}

export default function ActionsPage() {
  return (
    <Suspense fallback={<div className="p-4 text-[var(--ak-color-text-muted)]">Lade Actions…</div>}>
      <ActionsPageContent />
    </Suspense>
  );
}
