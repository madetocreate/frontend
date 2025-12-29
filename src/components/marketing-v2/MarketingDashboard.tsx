/**
 * BETA: Marketing Dashboard
 * 
 * Marketing is currently in BETA and disabled by default.
 * Gated by:
 * - NEXT_PUBLIC_MARKETING_BETA=true (environment variable)
 * - marketing entitlement OR developer mode
 * 
 * See docs/BETA_FEATURES.md for details.
 */
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MarketingOverview } from './MarketingOverview';
import { ContentPage } from './ContentPage';
import { ContentCalendar } from './ContentCalendar';
import { LibraryPage } from './LibraryPage';
import { CampaignsPage } from './CampaignsPage';
import { AnalyticsPage } from './AnalyticsPage';
import { AutomationOverlay } from '@/components/automation/AutomationOverlay';
import { SparklesIcon, BoltIcon, GlobeAltIcon, ChatBubbleBottomCenterTextIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { AkButton } from '@/components/ui/AkButton';
import { HubCopilot } from '@/components/chat/HubCopilot';
import { AkEmptyState } from '@/components/ui/AkEmptyState';

// Placeholder Components for new features
function SocialMediaPage() { 
  return (
    <AkEmptyState
      icon={<ChatBubbleBottomCenterTextIcon />}
      title="Social Media Manager"
      description="Hier kannst du deine Social Media Posts planen und verwalten. Diese Funktion wird bald freigeschaltet."
    />
  );
}

function WebsiteBotPage() { 
  return (
    <AkEmptyState
      icon={<GlobeAltIcon />}
      title="Website Bot Konfiguration"
      description="Hier konfigurierst du deinen Website-Assistenten für Lead-Generierung und Support."
    />
  );
}

function ToolsPage() { 
  return (
    <AkEmptyState
      icon={<BoltIcon />}
      title="Marketing Tools & Actions"
      description="Hier findest du Tools zur Content-Generierung, Analyse und mehr."
    />
  );
}

export type MarketingView = 'overview' | 'content' | 'calendar' | 'library' | 'campaigns' | 'analytics' | 'social' | 'website' | 'tools';

export function MarketingDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get('view') as MarketingView || 'overview';
  
  const [isAutomationOpen, setIsAutomationOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  useEffect(() => {
    const openCopilot = () => setIsCopilotOpen(true);
    const openAutomation = () => setIsAutomationOpen(true);

    window.addEventListener('aklow-marketing-open-copilot', openCopilot);
    window.addEventListener('aklow-marketing-open-automation', openAutomation);

    return () => {
      window.removeEventListener('aklow-marketing-open-copilot', openCopilot);
      window.removeEventListener('aklow-marketing-open-automation', openAutomation);
    };
  }, []);

  const handleNavigate = (newView: MarketingView) => {
    router.push(`/marketing?view=${newView}`);
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--ak-color-bg-app)] relative">
      <main className="w-full h-full px-6 py-6">
        {view === 'overview' && <MarketingOverview onNavigate={handleNavigate} />}
        {view === 'content' && <ContentPage />}
        {view === 'calendar' && <ContentCalendar />}
        {view === 'library' && <LibraryPage />}
        {view === 'campaigns' && <CampaignsPage />}
        {view === 'analytics' && <AnalyticsPage />}
        {view === 'social' && <SocialMediaPage />}
        {view === 'website' && <WebsiteBotPage />}
        {view === 'tools' && <ToolsPage />}
      </main>

      <AutomationOverlay
        isOpen={isAutomationOpen}
        onClose={() => setIsAutomationOpen(false)}
        context="marketing"
      />

      <HubCopilot 
        isOpen={isCopilotOpen} 
        onClose={() => setIsCopilotOpen(false)} 
        context="marketing"
        initialData={{
          view,
          campaigns: 2,
          scheduled_posts: 3,
          drafts: 5
        }}
      />
    </div>
  );
}
