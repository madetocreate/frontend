'use client';

import { useState, useEffect } from 'react';
import { AkBadge } from '@/components/ui/AkBadge';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { 
  appleCardStyle, 
  appleSectionTitle, 
  appleSubTitle, 
  appleAnimationFadeInUp,
  appleAnimationHoverFloat
} from '@/lib/appleDesign';

interface ChannelMetrics {
  channel: string;
  posts: number;
  impressions: number;
  engagement_rate: number;
  clicks: number;
  trend: 'up' | 'down' | 'stable';
}

const CHANNEL_ICONS: Record<string, string> = {
  linkedin: '💼',
  twitter: '🐦',
  instagram: '📷',
  facebook: '👥',
  email: '✉️',
};

export function MarketingAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const res = await fetch(`/api/marketing/analytics/stats?days=${days}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalStats = stats ? {
    posts: stats.total_sends || 0,
    impressions: stats.total_delivered || 0,
    clicks: stats.total_clicks || 0,
    avgEngagement: stats.avg_open_rate || 0,
  } : {
    posts: 0,
    impressions: 0,
    clicks: 0,
    avgEngagement: 0,
  };

  return (
    <div className={`max-w-7xl mx-auto space-y-8 ${appleAnimationFadeInUp}`}>
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={appleSectionTitle}>
            Performance Analytics
          </h2>
          <p className={appleSubTitle}>
            Übersicht über deine Marketing-Performance
          </p>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 rounded-xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)]/50 backdrop-blur-sm text-[var(--ak-color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)] cursor-pointer hover:bg-[var(--ak-color-bg-hover)] transition-all"
        >
          <option value="7d">Letzte 7 Tage</option>
          <option value="30d">Letzte 30 Tage</option>
          <option value="90d">Letzte 90 Tage</option>
          <option value="1y">Letztes Jahr</option>
        </select>
      </div>

      {/* Overall Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--ak-color-accent)] border-t-transparent"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`${appleCardStyle} p-6 ${appleAnimationHoverFloat}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-[var(--ak-semantic-info-soft)] text-[var(--ak-semantic-info)]">
                  <ChartBarIcon className="h-6 w-6" />
                </div>
              </div>
              <div className="text-3xl font-bold text-[var(--ak-color-text-primary)] mb-1 tracking-tight">
                {totalStats.posts}
              </div>
              <div className="text-sm font-medium text-[var(--ak-color-text-secondary)]">
                Gesamt Gesendet
              </div>
            </div>

            <div className={`${appleCardStyle} p-6 ${appleAnimationHoverFloat}`} style={{ animationDelay: '0.05s' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-[var(--ak-color-accent-documents-soft)] text-[var(--ak-color-accent-documents)]">
                  <EyeIcon className="h-6 w-6" />
                </div>
              </div>
              <div className="text-3xl font-bold text-[var(--ak-color-text-primary)] mb-1 tracking-tight">
                {totalStats.impressions.toLocaleString('de-DE')}
              </div>
              <div className="text-sm font-medium text-[var(--ak-color-text-secondary)]">
                Zugestellt
              </div>
            </div>

            <div className={`${appleCardStyle} p-6 ${appleAnimationHoverFloat}`} style={{ animationDelay: '0.1s' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)]">
                  <ShareIcon className="h-6 w-6" />
                </div>
              </div>
              <div className="text-3xl font-bold text-[var(--ak-color-text-primary)] mb-1 tracking-tight">
                {totalStats.clicks.toLocaleString('de-DE')}
              </div>
              <div className="text-sm font-medium text-[var(--ak-color-text-secondary)]">Klicks</div>
            </div>

            <div className={`${appleCardStyle} p-6 ${appleAnimationHoverFloat}`} style={{ animationDelay: '0.15s' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning)]">
                  <HeartIcon className="h-6 w-6" />
                </div>
              </div>
              <div className="text-3xl font-bold text-[var(--ak-color-text-primary)] mb-1 tracking-tight">
                {totalStats.avgEngagement.toFixed(1)}%
              </div>
              <div className="text-sm font-medium text-[var(--ak-color-text-secondary)]">
                Ø Öffnungsrate
              </div>
            </div>
          </div>

          {/* Campaign Stats Placeholder */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)] px-1">
              Kampagnen Performance
            </h3>
            <div className={`${appleCardStyle} p-8 text-center bg-[var(--ak-surface-1)]/40`}>
              <p className="text-sm text-[var(--ak-color-text-secondary)]">
                Detaillierte Kampagnen-Analyse wird geladen...
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

