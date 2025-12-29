'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { workspaces } from './workspaces';
import { Settings } from 'lucide-react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { isMarketingVisible } from '@/lib/featureFlags';

interface WorkspaceRailV2Props {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function WorkspaceRailV2({ onToggleSidebar }: WorkspaceRailV2Props) {
  const pathname = usePathname();
  const { features, isDeveloper } = useFeatureAccess();

  // Handle workspace icon click
  const handleWorkspaceClick = (e: React.MouseEvent, workspace: typeof workspaces[0]) => {
    const isActive = pathname.startsWith(workspace.href);
    
    if (isActive) {
      // Re-click on active icon: toggle sidebar
      e.preventDefault();
      onToggleSidebar();
    } else {
      // Click on different icon: navigate (sidebar state remains)
      // Let Link handle navigation
    }
  };

  // BETA: Filter marketing workspace from rail if not visible
  const visibleWorkspaces = workspaces.filter((w) => {
    if (w.id === 'settings' || w.showInRail === false) {
      return false;
    }
    // BETA: Hide marketing workspace if not enabled
    if (w.id === 'marketing') {
      return isMarketingVisible(features, isDeveloper);
    }
    return true;
  });

  return (
    <div className="fixed left-0 top-0 bottom-0 w-[var(--ak-rail-width)] flex flex-col items-center py-4 z-40 bg-[var(--ak-color-bg-sidebar)] border-r border-[var(--ak-color-border-hairline)] backdrop-blur-xl">
      {/* Workspace Icons - verbesserter Spacing */}
      <div className="flex-1 flex flex-col items-center gap-y-2 w-full px-2">
        {visibleWorkspaces.map((workspace) => {
          const isActive = pathname.startsWith(workspace.href);
          const Icon = workspace.icon;

          return (
            <Link
              key={workspace.id}
              href={workspace.href}
              onClick={(e) => handleWorkspaceClick(e, workspace)}
              className={`
                relative w-12 h-12 rounded-[var(--ak-radius-lg)] flex items-center justify-center
                transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] ak-icon-interactive ak-focus-ring group
                ${isActive
                  ? 'bg-[var(--ak-color-rail-active-bg)] text-[var(--ak-color-rail-active-icon)] ak-shadow-sm'
                  : 'text-[var(--ak-color-text-muted)]/50 hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]'
                }
              `}
              aria-label={workspace.label}
              title={workspace.label}
            >
              <Icon className={`w-5.5 h-5.5 transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] ${isActive ? 'stroke-[1.75px]' : 'stroke-[1.25px]'}`} />
            </Link>
          );
        })}
      </div>

      {/* Settings Discoverability: dezentes Gear im Rail-Bottom */}
      <div className="flex flex-col items-center pb-4 w-full px-2 gap-y-2">
        <Link
          href="/settings"
          className={`
            relative w-12 h-12 rounded-[var(--ak-radius-lg)] flex items-center justify-center
            transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] ak-icon-interactive ak-focus-ring group
            ${pathname.startsWith('/settings')
              ? 'bg-[var(--ak-color-rail-active-bg)] text-[var(--ak-color-rail-active-icon)] ak-shadow-sm'
              : 'text-[var(--ak-color-text-muted)]/50 hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]'
            }
          `}
          aria-label="Einstellungen"
          title="Einstellungen"
        >
          <Settings className={`w-5.5 h-5.5 transition-all duration-[var(--ak-motion-duration)] ease-[var(--ak-motion-ease)] ${pathname.startsWith('/settings') ? 'stroke-[1.75px]' : 'stroke-[1.25px]'}`} />
        </Link>
      </div>
    </div>
  );
}
