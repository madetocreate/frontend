'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MarketingView } from './MarketingDashboard';
import { AkButton } from '@/components/ui/AkButton';
import {
  PlusIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentIcon,
  PhotoIcon,
  MegaphoneIcon,
  SparklesIcon,
  GlobeAltIcon,
  EyeIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { dispatchActionStart } from '@/lib/actions/dispatch';
import { EnhancedStatCard } from '@/components/ui/EnhancedStatCard';
import { appleSectionTitle, appleSubTitle } from '@/lib/appleDesign';
import { SmartInsightCard } from '@/components/ui/SmartInsightCard';
import { useMarketingHubData } from '@/hooks/useMarketingHubData';

interface MarketingOverviewProps {
  onNavigate: (view: MarketingView) => void;
}

export function MarketingOverview({ onNavigate }: MarketingOverviewProps) {
  const router = useRouter();
  const { stats, loading } = useMarketingHubData();
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);

  // AI Insights Logic
  const dynamicInsights = [
    {
      id: 'campaign-performance',
      type: 'success' as const,
      message: 'Deine "Sommer-Sale" Kampagne hat 15% mehr Klicks als erwartet. Soll ich das Budget leicht erhöhen?',
      action: { label: 'Kampagne ansehen', onClick: () => onNavigate('campaigns') }
    },
    {
      id: 'content-gap',
      type: 'info' as const,
      message: 'Für nächsten Dienstag ist noch kein Post geplant. Ich könnte einen Vorschlag für dich generieren.',
      action: { label: 'Vorschlag erstellen', onClick: () => onNavigate('content') }
    }
  ].filter(i => !dismissedInsights.includes(i.id));

  // Fallback Setup Insights
  const onboardingInsights = [
    {
      id: 'setup-autopilot',
      type: 'info' as const,
      message: 'Lass die KI deine Social-Media-Kanäle analysieren, um erste Content-Vorschläge zu erhalten.',
      action: { label: 'Autopilot starten', onClick: () => onNavigate('overview') }
    },
    {
      id: 'connect-channels',
      type: 'warning' as const,
      message: 'Verbinde deine Kanäle (Instagram, LinkedIn), damit die KI deine Performance tracken kann.',
      action: { label: 'Kanäle verbinden', onClick: () => onNavigate('tools') }
    }
  ].filter(i => !dismissedInsights.includes(i.id));

  const insights = dynamicInsights.length > 0 ? dynamicInsights : onboardingInsights;

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      
      {/* Header Section */}
      <div className="mb-8">
        <h1 className={appleSectionTitle}>Marketing Übersicht</h1>
        <p className={appleSubTitle}>
          Steuere deine Kampagnen, plane Content und analysiere deine Reichweite.
        </p>

        {/* Smart Insights */}
        <div className="mt-6 max-w-3xl">
            <SmartInsightCard 
                insights={insights} 
                onDismiss={(id) => setDismissedInsights(prev => [...prev, id])}
            />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => onNavigate('content')} className="cursor-pointer transition-transform hover:scale-[1.01]">
          <EnhancedStatCard
            icon={<DocumentIcon className="w-6 h-6 text-[var(--ak-color-text-inverted)]" />}
            value={stats?.by_status?.draft || 0}
            label="Entwürfe"
            gradient={{ from: 'blue', to: 'indigo' }}
            loading={loading}
            trend={{ value: 'In Arbeit', direction: 'stable' }}
          />
        </div>
        
        <div onClick={() => onNavigate('calendar')} className="cursor-pointer transition-transform hover:scale-[1.01]">
          <EnhancedStatCard
            icon={<CalendarIcon className="w-6 h-6 text-[var(--ak-color-text-inverted)]" />}
            value={stats?.by_status?.scheduled || 0}
            label="Geplant"
            gradient={{ from: 'purple', to: 'fuchsia' }}
            loading={loading}
            trend={{ value: 'Nächste 7 Tage', direction: 'up' }}
          />
        </div>

        <div onClick={() => onNavigate('analytics')} className="cursor-pointer transition-transform hover:scale-[1.01]">
          <EnhancedStatCard
            icon={<ChartBarIcon className="w-6 h-6 text-[var(--ak-color-text-inverted)]" />}
            value={stats?.by_status?.published || 0}
            label="Veröffentlicht"
            gradient={{ from: 'green', to: 'emerald' }}
            loading={loading}
            trend={{ value: 'Gesamt', direction: 'up' }}
          />
        </div>

        <div onClick={() => onNavigate('analytics')} className="cursor-pointer transition-transform hover:scale-[1.01]">
          <EnhancedStatCard
            icon={<MegaphoneIcon className="w-6 h-6 text-[var(--ak-color-text-inverted)]" />}
            value={stats?.last_week || 0}
            label="Posts diese Woche"
            gradient={{ from: 'orange', to: 'amber' }}
            loading={loading}
            trend={{ value: '+12% vs VW', direction: 'up' }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)] mb-4">Schnellzugriff & Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Create Post */}
          <button 
            onClick={() => onNavigate('content')}
            className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:bg-[var(--ak-color-bg-hover)] transition-colors text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent)] group-hover:bg-[var(--ak-color-accent)] group-hover:text-[var(--ak-color-text-inverted)] transition-colors">
                <PlusIcon className="w-5 h-5" />
              </div>
              <span className="font-medium">Neuen Post erstellen</span>
            </div>
            <p className="text-sm text-[var(--ak-color-text-secondary)]">Erstelle Content für Social Media oder Blog.</p>
          </button>

          {/* AI Autopilot */}
          <button 
            onClick={() => {
              dispatchActionStart(
                'marketing.autopilot_run',
                { module: 'marketing', moduleContext: { domain: 'all' } },
                {},
                'marketing-overview'
              );
            }}
            className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:bg-[var(--ak-color-bg-hover)] transition-colors text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning)] group-hover:bg-[var(--ak-semantic-warning)] group-hover:text-[var(--ak-color-text-inverted)] transition-colors">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <span className="font-medium">KI Autopilot starten</span>
            </div>
            <p className="text-sm text-[var(--ak-color-text-secondary)]">Lass die KI Content-Pläne für dich erstellen.</p>
          </button>

          {/* Trend Scout */}
          <button 
             onClick={() => {
              dispatchActionStart(
                'marketing.trend_scout',
                { module: 'marketing', moduleContext: { industry: 'general' } },
                {},
                'marketing-overview'
              );
            }}
            className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:bg-[var(--ak-color-bg-hover)] transition-colors text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[var(--ak-accent-documents-soft)] text-[var(--ak-accent-documents)] group-hover:bg-[var(--ak-accent-documents)] group-hover:text-[var(--ak-color-text-inverted)] transition-colors">
                <GlobeAltIcon className="w-5 h-5" />
              </div>
              <span className="font-medium">Trend Scout</span>
            </div>
            <p className="text-sm text-[var(--ak-color-text-secondary)]">Finde virale Themen in deiner Branche.</p>
          </button>

          {/* Competitor Watchdog */}
           <button 
             onClick={() => {
              dispatchActionStart(
                'marketing.competitor_watchdog',
                { module: 'marketing', moduleContext: { competitors: ['Competitor A'] } },
                {},
                'marketing-overview'
              );
            }}
            className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:bg-[var(--ak-color-bg-hover)] transition-colors text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[var(--ak-semantic-info-soft)] text-[var(--ak-semantic-info)] group-hover:bg-[var(--ak-semantic-info)] group-hover:text-[var(--ak-color-text-inverted)] transition-colors">
                <EyeIcon className="w-5 h-5" />
              </div>
              <span className="font-medium">Markt Watchdog</span>
            </div>
            <p className="text-sm text-[var(--ak-color-text-secondary)]">Analysiere die Strategien deiner Konkurrenz.</p>
          </button>

           {/* Media Library */}
           <button 
            onClick={() => onNavigate('library')}
            className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:bg-[var(--ak-color-bg-hover)] transition-colors text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent-documents)] group-hover:bg-[var(--ak-color-accent-documents)] group-hover:text-[var(--ak-color-text-inverted)] transition-colors">
                <PhotoIcon className="w-5 h-5" />
              </div>
              <span className="font-medium">Mediathek</span>
            </div>
            <p className="text-sm text-[var(--ak-color-text-secondary)]">Verwalte Bilder und Videos für Kampagnen.</p>
          </button>

           {/* Analytics Link */}
           <button 
            onClick={() => onNavigate('analytics')}
            className="p-4 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:bg-[var(--ak-color-bg-hover)] transition-colors text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)] group-hover:bg-[var(--ak-semantic-success)] group-hover:text-[var(--ak-color-text-inverted)] transition-colors">
                <ChartBarIcon className="w-5 h-5" />
              </div>
              <span className="font-medium">Analytics Report</span>
            </div>
            <p className="text-sm text-[var(--ak-color-text-secondary)]">Detaillierte Auswertung deiner Performance.</p>
          </button>

        </div>
      </div>

    </div>
  );
}
