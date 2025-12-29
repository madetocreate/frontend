'use client';

import { SetupIntegrationsOverview } from '@/features/actions/setup/SetupIntegrationsOverview';

export function IntegrationsSettings() {
  return (
    <div className="space-y-6">
      <SetupIntegrationsOverview />
    </div>
  );
}

