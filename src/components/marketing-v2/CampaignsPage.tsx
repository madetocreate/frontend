'use client';

import { CampaignManager } from './CampaignManager';
import { appleSectionTitle, appleAnimationFadeInUp } from '@/lib/appleDesign';

export function CampaignsPage() {
  return (
    <div className={`space-y-6 ${appleAnimationFadeInUp}`}>
      <div>
        <h2 className={appleSectionTitle}>Kampagnen</h2>
        <p className="text-[var(--ak-color-text-secondary)]">
          Organisiere und optimiere deine Marketing-Kampagnen.
        </p>
      </div>
      
      <CampaignManager />
    </div>
  );
}

