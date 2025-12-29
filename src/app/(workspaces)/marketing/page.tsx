'use client';

import { Suspense } from 'react';
import { MarketingDashboard } from '@/components/marketing-v2/MarketingDashboard';

export default function MarketingPage() {
  // MarketingDashboard nutzt useSearchParams intern, daher muss es in Suspense gewrappt werden
  return (
    <Suspense fallback={null}>
      <MarketingDashboard />
    </Suspense>
  );
}
