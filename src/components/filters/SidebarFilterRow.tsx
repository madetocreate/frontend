'use client';

import { FunnelIcon } from '@heroicons/react/24/outline';

interface SidebarFilterRowProps {
  activeCount?: number;
  onClick: () => void;
}

export function SidebarFilterRow({ activeCount = 0, onClick }: SidebarFilterRowProps) {
  return (
    <div className="">
      <button
        onClick={onClick}
        className="w-full px-3 py-2 rounded-lg flex items-center gap-2.5 text-[13px] font-medium text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] transition-all duration-200 ak-button-interactive ak-focus-ring group"
      >
        <FunnelIcon className="w-4 h-4 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
        <span className="flex-1 text-left">Filter konfigurieren</span>
        {activeCount > 0 && (
          <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[var(--ak-color-accent-soft)] text-[10px] font-bold text-[var(--ak-color-accent)] ring-1 ring-[var(--ak-color-accent-soft)]">
            {activeCount}
          </span>
        )}
      </button>
    </div>
  );
}

