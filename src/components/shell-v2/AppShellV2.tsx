'use client';

import { useState, useEffect, ReactNode, CSSProperties, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { WorkspaceRailV2 } from './WorkspaceRailV2';
import { WorkspaceHeaderV2 } from './WorkspaceHeaderV2';
import { WorkspaceSidebarV2 } from './WorkspaceSidebarV2';
import { getWorkspaceByPath } from './workspaces';
import { GlobalCreateFab } from '@/components/ui/GlobalCreateFab';

interface AppShellV2Props {
  children: ReactNode;
}

const SIDEBAR_STORAGE_PREFIX = 'aklow.v2.sidebar.open.';
const SIDEBAR_WIDTH_STORAGE_KEY = 'aklow.sidebarWidth';
const LAST_WORKSPACE_STORAGE_KEY = 'aklow.v2.lastWorkspace';
const MOBILE_BREAKPOINT = 768; // px

export function AppShellV2({ children }: AppShellV2Props) {
  const pathname = usePathname();
  const workspace = pathname ? getWorkspaceByPath(pathname) : undefined;
  const workspaceId = workspace?.id || 'default';
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const isChat = pathname?.startsWith('/chat');

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      // Auto-close sidebar on mobile
      if (mobile && isSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isSidebarOpen]);

  // Load sidebar state for current workspace when workspace changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !isMobile) {
      const stored = localStorage.getItem(`${SIDEBAR_STORAGE_PREFIX}${workspaceId}`);
      if (stored !== null) {
        setIsSidebarOpen(stored === 'true');
      } else {
        // Default values for workspaces if no state is stored
        if (workspaceId === 'chat') {
          setIsSidebarOpen(true);
        } else {
          setIsSidebarOpen(true);
        }
      }
    }
  }, [workspaceId, isMobile]);

  // Load width once
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedWidth = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
      if (storedWidth) {
        setSidebarWidth(parseInt(storedWidth, 10));
      }
    }
  }, []);

  // Helper: Read CSS variable as pixel value
  const readCssPxVar = useCallback((varName: string, fallbackPx: number): number => {
    if (typeof window === 'undefined') return fallbackPx;
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallbackPx : parsed;
  }, []);

  // Handle resizing
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Sidebar starts after the rail (read from CSS variable)
      const railWidth = readCssPxVar('--ak-rail-width', 72);
      const newWidth = e.clientX - railWidth;
      const maxWidth = window.innerWidth - railWidth;
      const minWidth = 220;
      const clampedWidth = Math.min(Math.max(newWidth, minWidth), Math.min(maxWidth, 480));
      setSidebarWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(sidebarWidth));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, sidebarWidth, readCssPxVar]);

  // Save sidebar state for current workspace
  const handleToggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsMobileSidebarOpen((prev) => !prev);
    } else {
      setIsSidebarOpen((prev) => {
        const next = !prev;
        localStorage.setItem(`${SIDEBAR_STORAGE_PREFIX}${workspaceId}`, String(next));
        return next;
      });
    }
  }, [isMobile, workspaceId]);

  // Persist last workspace based on pathname
  useEffect(() => {
    if (pathname) {
      // Extract workspace from pathname (e.g., /inbox -> inbox, /chat -> chat)
      const workspaceMatch = pathname.match(/^\/([^/]+)/);
      if (workspaceMatch && workspaceMatch[1] !== '') {
        const workspaceId = workspaceMatch[1];
        localStorage.setItem(LAST_WORKSPACE_STORAGE_KEY, workspaceId);
      }
    }
  }, [pathname]);

  const closeMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  // Listen for keyboard shortcut to toggle sidebar
  useEffect(() => {
    const handleToggleEvent = () => {
      handleToggleSidebar();
    };
    window.addEventListener('aklow-toggle-sidebar', handleToggleEvent);
    return () => window.removeEventListener('aklow-toggle-sidebar', handleToggleEvent);
  }, [handleToggleSidebar]);

  // Close mobile sidebar on navigation
  useEffect(() => {
    if (isMobile) {
      closeMobileSidebar();
    }
  }, [pathname, isMobile, closeMobileSidebar]);

  // Determine effective sidebar open state
  const effectiveSidebarOpen = isMobile ? isMobileSidebarOpen : isSidebarOpen;

  return (
    <div 
      className="h-screen h-[100dvh] overflow-hidden flex bg-[var(--ak-color-bg-app)] text-[var(--ak-color-text-primary)]"
      style={{ '--ak-sidebar-width': effectiveSidebarOpen ? `${sidebarWidth}px` : '0px' } as CSSProperties}
      data-ak-workspace={workspace?.id ?? 'unknown'}
      data-ak-accent={workspace?.accent ?? 'default'}
      data-ak-mobile={isMobile ? 'true' : 'false'}
    >
      {/* Rail - hidden on mobile */}
      <div className={clsx(isMobile && "hidden")}>
        <WorkspaceRailV2 onToggleSidebar={handleToggleSidebar} isSidebarOpen={effectiveSidebarOpen} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={closeMobileSidebar}
          />
          
          {/* Sidebar Drawer */}
          <div className="fixed left-0 top-0 bottom-0 w-[85vw] max-w-[320px] z-50 bg-[var(--ak-color-bg-sidebar)] shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            {/* Mobile Sidebar Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--ak-color-border-subtle)]">
              <h2 className="font-semibold text-[var(--ak-color-text-primary)]">Menü</h2>
              <button
                onClick={closeMobileSidebar}
                className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)] transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-[var(--ak-color-text-muted)]" />
              </button>
            </div>
            
            {/* Sidebar Content */}
            <div className="flex-1 overflow-hidden">
              <WorkspaceSidebarV2 isOpen={true} />
            </div>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className={clsx(
        "flex-1 flex min-h-0",
        !isMobile && "ml-[var(--ak-rail-width)]"
      )}>
        {/* Sidebar - hidden on mobile (shown as overlay) */}
        {!isMobile && (
          <WorkspaceSidebarV2 isOpen={isSidebarOpen} />
        )}

        {/* Resize Handle - only on desktop */}
        {!isMobile && isSidebarOpen && (
          <div
            onMouseDown={() => setIsResizing(true)}
            className={clsx(
              "absolute top-0 bottom-0 z-50 w-1 cursor-col-resize hover:bg-[var(--ak-color-accent)]/30 transition-colors",
              isResizing ? "bg-[var(--ak-color-accent)]/50" : "bg-transparent"
            )}
            style={{ left: `calc(var(--ak-rail-width) + ${sidebarWidth}px)` }}
          />
        )}

        {/* Content Area with Header */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Header - only over content, not sidebar */}
          <WorkspaceHeaderV2 />

          {/* Main Content */}
          <main
            className={clsx(
              'flex-1 min-h-0 min-w-0 bg-[var(--ak-color-bg-surface)]',
              isChat ? 'p-0 overflow-hidden' : 'p-6 md:p-6 overflow-auto',
              isMobile && !isChat && 'p-4',
              'transition-opacity duration-[200ms] ease-out'
            )}
            style={{ 
              animation: 'fadeIn 200ms ease-out',
            }}
          >
            {children}
          </main>
        </div>
      </div>
      
      {/* Mobile Menu Button (FAB) */}
      {isMobile && !isMobileSidebarOpen && (
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="fixed z-30 w-12 h-12 rounded-full bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] shadow-lg flex items-center justify-center hover:brightness-110 transition-all active:scale-95"
          style={{
            left: 'calc(1rem + env(safe-area-inset-left, 0px))',
            bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
          }}
          aria-label="Menü öffnen"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Global Quick Actions FAB - Hidden in Chat to avoid confusion with Chat Composer FAB */}
      {!isChat && <GlobalCreateFab />}
    </div>
  );
}

