'use client';

import { PhotoIcon, CloudArrowUpIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { AkButton } from '@/components/ui/AkButton';
import { AkCard } from '@/components/ui/AkCard';
import { AkBadge } from '@/components/ui/AkBadge';

const DEMO_MEDIA = [
  { id: 1, name: 'Campaign_Header.jpg', type: 'image', size: '2.4 MB', date: '2 Std.', url: 'https://placehold.co/600x400/007AFF/ffffff?text=Header' },
  { id: 2, name: 'Product_Shot_V2.png', type: 'image', size: '1.1 MB', date: '1 Tag', url: 'https://placehold.co/400x400/FF2D55/ffffff?text=Product' },
  { id: 3, name: 'Team_Event.jpg', type: 'image', size: '4.8 MB', date: '3 Tage', url: 'https://placehold.co/600x400/5856D6/ffffff?text=Team' },
  { id: 4, name: 'Logo_Pack.zip', type: 'archive', size: '12 MB', date: '1 Woche', url: null },
];

export function LibraryPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--ak-color-text-primary)]">Mediathek</h2>
          <p className="text-[var(--ak-color-text-secondary)] text-[13px]">
            Alle deine Bilder, Videos und Dokumente.
          </p>
        </div>
        <AkButton 
          variant="primary" 
          accent="marketing"
          leftIcon={<CloudArrowUpIcon className="h-4 w-4" />}
        >
          Hochladen
        </AkButton>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {DEMO_MEDIA.map((item) => (
          <AkCard 
            key={item.id} 
            className="group overflow-hidden cursor-pointer hover:ring-2 hover:ring-[var(--ak-color-accent)] transition-all p-0"
          >
            {/* Preview */}
            <div className="aspect-square bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center relative">
              {item.url ? (
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <PhotoIcon className="h-12 w-12 text-[var(--ak-color-text-muted)] opacity-30" />
                  <AkBadge tone="neutral" size="sm">{item.type.toUpperCase()}</AkBadge>
                </div>
              )}
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-[var(--ak-color-bg-app)]/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                 <button className="p-2.5 bg-[var(--ak-color-bg-surface)] hover:bg-[var(--ak-color-bg-hover)] rounded-full text-[var(--ak-color-text-primary)] shadow-sm border border-[var(--ak-color-border-fine)] transition-transform hover:scale-110">
                   <ArrowDownTrayIcon className="h-5 w-5" />
                 </button>
                 <button className="p-2.5 bg-[var(--ak-color-danger-soft)]/20 hover:bg-[var(--ak-color-danger)] rounded-full text-[var(--ak-color-danger)] hover:text-[var(--ak-color-text-inverted)] shadow-sm border border-[var(--ak-color-danger-soft)]/30 transition-transform hover:scale-110">
                   <TrashIcon className="h-5 w-5" />
                 </button>
              </div>
            </div>
            {/* Meta */}
            <div className="p-3.5 border-t border-[var(--ak-color-border-fine)]">
              <h4 className="text-[13px] font-semibold text-[var(--ak-color-text-primary)] truncate mb-1" title={item.name}>
                {item.name}
              </h4>
              <div className="flex items-center justify-between text-[11px] font-medium text-[var(--ak-color-text-muted)] opacity-70">
                <span>{item.size}</span>
                <span>vor {item.date}</span>
              </div>
            </div>
          </AkCard>
        ))}
        
        {/* Dropzone Placeholder */}
        <div className="border-2 border-dashed border-[var(--ak-color-border-fine)] rounded-2xl flex flex-col items-center justify-center p-6 bg-[var(--ak-color-bg-surface-muted)]/30 hover:bg-[var(--ak-color-bg-surface-muted)]/60 hover:border-[var(--ak-color-accent-soft)] transition-all cursor-pointer min-h-[200px] group">
          <div className="w-12 h-12 rounded-full bg-[var(--ak-color-bg-surface)] flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
            <CloudArrowUpIcon className="h-6 w-6 text-[var(--ak-color-accent)]" />
          </div>
          <span className="text-sm font-semibold text-[var(--ak-color-text-secondary)]">Dateien hier ablegen</span>
          <span className="text-[11px] text-[var(--ak-color-text-muted)] mt-1">oder klicken zum Auswählen</span>
        </div>
      </div>
    </div>
  );
}

