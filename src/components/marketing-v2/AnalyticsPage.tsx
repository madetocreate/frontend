'use client';

import { 
  ArrowTrendingUpIcon, 
  UserGroupIcon, 
  CursorArrowRaysIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { appleCardStyle, appleSectionTitle, appleAnimationFadeInUp } from '@/lib/appleDesign';
import { AkButton } from '@/components/ui/AkButton';

export function AnalyticsPage() {
  const stats = [
    { label: 'Reichweite', value: '124.5k', change: '+12%', icon: UserGroupIcon, color: 'text-[var(--ak-semantic-info)]', bg: 'bg-[var(--ak-semantic-info-soft)]' },
    { label: 'Engagement', value: '8.2%', change: '+5.4%', icon: CursorArrowRaysIcon, color: 'text-[var(--ak-accent-documents)]', bg: 'bg-[var(--ak-color-accent-documents-soft)]' },
    { label: 'Klicks', value: '4,392', change: '-2.1%', icon: ArrowTrendingUpIcon, color: 'text-[var(--ak-semantic-success)]', bg: 'bg-[var(--ak-semantic-success-soft)]' },
  ];

  return (
    <div className={`space-y-6 ${appleAnimationFadeInUp}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className={appleSectionTitle}>Analytics</h2>
          <p className="text-[var(--ak-color-text-secondary)]">
            Detaillierte Einblicke in deine Performance.
          </p>
        </div>
        <div className="flex gap-2">
          <AkButton variant="ghost" size="sm">Letzte 7 Tage</AkButton>
          <AkButton variant="secondary" size="sm">Letzte 30 Tage</AkButton>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className={appleCardStyle + " p-6 flex items-center justify-between"}>
            <div>
              <p className="text-sm font-medium text-[var(--ak-color-text-secondary)]">{stat.label}</p>
              <h3 className="text-3xl font-bold text-[var(--ak-color-text-primary)] mt-1">{stat.value}</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-2 inline-block ${stat.change.startsWith('+') ? 'text-[var(--ak-semantic-success)] bg-[var(--ak-semantic-success-soft)]' : 'text-[var(--ak-semantic-danger)] bg-[var(--ak-semantic-danger-soft)]'}`}>
                {stat.change} vs. Vormonat
              </span>
            </div>
            <div className={`p-4 rounded-2xl ${stat.bg}`}>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className={`${appleCardStyle} p-8 min-h-[400px] flex flex-col items-center justify-center text-center`}>
        <div className="bg-[var(--ak-color-bg-surface-muted)] p-6 rounded-full mb-4">
          <ChartBarIcon className="h-12 w-12 text-[var(--ak-color-text-muted)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">Performance Verlauf</h3>
        <p className="text-[var(--ak-color-text-secondary)] max-w-md mt-2">
          Hier würde ein interaktiver Chart stehen (z.B. Recharts), der die Entwicklung von Reichweite und Engagement über die Zeit visualisiert.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${appleCardStyle} p-6`}>
           <h3 className="text-base font-semibold mb-4">Top Performing Posts</h3>
           <div className="space-y-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="flex items-center gap-4 p-3 hover:bg-[var(--ak-color-bg-surface-muted)] rounded-lg transition-colors cursor-pointer">
                <div className="h-10 w-10 bg-[var(--ak-color-bg-surface-muted)] rounded object-cover flex-shrink-0" />
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-medium truncate">Big Announcement: Product V2 is live! 🚀</p>
                   <p className="text-xs text-[var(--ak-color-text-muted)]">Vor 2 Tagen • LinkedIn</p>
                 </div>
                 <div className="text-right">
                   <p className="text-sm font-bold">2.4k</p>
                   <p className="text-xs text-[var(--ak-color-text-muted)]">Views</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
        
        <div className={`${appleCardStyle} p-6`}>
           <h3 className="text-base font-semibold mb-4">Audience Demographics</h3>
           <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Founders & CEO</span>
                  <span className="font-medium">42%</span>
                </div>
                  <div className="h-2 bg-[var(--ak-color-bg-surface-muted)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--ak-semantic-info)] w-[42%]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Marketing Managers</span>
                  <span className="font-medium">28%</span>
                </div>
                  <div className="h-2 bg-[var(--ak-color-bg-surface-muted)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--ak-color-accent-documents)] w-[28%]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Developers</span>
                  <span className="font-medium">15%</span>
                </div>
                  <div className="h-2 bg-[var(--ak-color-bg-surface-muted)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--ak-semantic-success)] w-[15%]" />
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

