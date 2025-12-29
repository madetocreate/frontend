'use client';

import React, { useState, useMemo } from 'react';
import { GrowthMode } from './types';
import { 
  RectangleStackIcon, 
  MegaphoneIcon, 
  MagnifyingGlassIcon, 
  StarIcon, 
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { 
  DrawerSectionTitle, 
  DrawerListRow, 
  ShortcutChip 
} from '@/components/ui/drawer-kit';
import { AkSearchField } from '@/components/ui/AkSearchField';
import { AkButton } from '@/components/ui/AkButton';
import clsx from 'clsx';

interface GrowthLeftDrawerProps {
  activeMode: GrowthMode;
  onModeChange: (mode: GrowthMode) => void;
  isOpen: boolean;
}

export const GrowthLeftDrawer: React.FC<GrowthLeftDrawerProps> = ({
  activeMode,
  onModeChange,
  isOpen
}) => {
  const [search, setSearch] = useState('');

  const modes = useMemo<Array<{ id: GrowthMode; label: string; icon: React.ComponentType<{ className?: string }> }>>(() => [
    { id: 'content' as GrowthMode, label: 'Content', icon: RectangleStackIcon },
    { id: 'campaigns' as GrowthMode, label: 'Kampagnen', icon: MegaphoneIcon },
    { id: 'seo' as GrowthMode, label: 'SEO', icon: MagnifyingGlassIcon },
    { id: 'reviews' as GrowthMode, label: 'Bewertungen', icon: StarIcon },
    { id: 'reports' as GrowthMode, label: 'Reports', icon: ChartBarIcon },
  ], []);

  const filteredModes = useMemo(() => {
    if (!search) return modes;
    return modes.filter(m => m.label.toLowerCase().includes(search.toLowerCase()));
  }, [search, modes]);

  return (
    <div className={clsx(
      "fixed inset-y-0 left-0 lg:relative lg:inset-auto h-full flex flex-col border-r border-[var(--ak-color-border-subtle)] bg-[var(--ak-glass-bg)] backdrop-blur-xl transition-all duration-300 ease-in-out z-20",
      isOpen ? "w-[280px] translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0 pointer-events-none"
    )}>
      {/* Top Section */}
      <div className="px-4 pt-4 pb-2 space-y-4">
        <div className="space-y-3">
          <AkSearchField
            placeholder="Wachstum durchsuchen..."
            value={search}
            onValueChange={setSearch}
          />
          <div className="flex items-center justify-between px-1 text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <ShortcutChip label="⌘K" />
              <span>Aktionen</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShortcutChip label="?" />
              <span>Hilfe</span>
            </div>
          </div>
        </div>

        <AkButton 
          size="sm" 
          variant="secondary" 
          className="w-full justify-start text-xs font-semibold !rounded-xl bg-[var(--ak-semantic-warning-soft)] border-[var(--ak-semantic-warning-soft)] text-[var(--ak-semantic-warning)] hover:bg-[var(--ak-semantic-warning-soft)]"
          leftIcon={<SparklesIcon className="h-3.5 w-3.5" />}
        >
          KI-Optimierung
        </AkButton>
      </div>

      <div className="flex-1 overflow-y-auto ak-scrollbar px-2 pb-4 mt-2">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-0.5">
            <DrawerSectionTitle className="px-3">Modus</DrawerSectionTitle>
            <ul className="flex flex-col gap-0.5">
              {filteredModes.map((mode) => (
                <li key={mode.id}>
                  <DrawerListRow
                    accent="growth"
                    selected={activeMode === mode.id}
                    title={mode.label}
                    leading={<mode.icon className="h-4 w-4" />}
                    onClick={() => onModeChange(mode.id)}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-0.5 px-3">
            <DrawerSectionTitle>Zuletzt</DrawerSectionTitle>
            <p className="text-[11px] text-[var(--ak-color-text-muted)] italic px-1 font-medium">Keine kürzlichen Items.</p>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="px-4 py-3 border-t border-[var(--ak-color-border-subtle)] bg-[var(--ak-glass-bg)]/50">
        <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--ak-color-text-muted)] uppercase tracking-wider">
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--ak-semantic-success)]" />
          <span>Growth Engine Aktiv</span>
        </div>
      </div>
    </div>
  );
};

