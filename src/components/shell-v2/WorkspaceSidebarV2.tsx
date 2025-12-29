'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { getWorkspaceByPath } from './workspaces';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { SidebarFilterRow } from '@/components/filters/SidebarFilterRow';
import { SidebarFilterOverlay } from '@/components/filters/SidebarFilterOverlay';
import { InboxFiltersPanel, type InboxFiltersPanelRef } from '@/features/inbox/InboxFiltersPanel';
import { ActionsFiltersPanel } from '@/features/actions/ActionsFiltersPanel';
import { CustomersFiltersPanel } from '@/features/customers/CustomersFiltersPanel';
import { WorkLogFiltersPanel } from '@/features/worklog/WorkLogFiltersPanel';
import { DocsFiltersPanel } from '@/features/docs/DocsFiltersPanel';
import { parseFilterParams, countActiveFilters } from '@/lib/filters/query';
import { ChatSidebarV2 } from '@/features/chat/ChatSidebarV2';
import { AkButton } from '@/components/ui/AkButton';
import { InboxSource, InboxStatus } from '@/features/inbox/types';
import { ActionCategoryId, ActionType, ActionView } from '@/features/actions/types';
import { CustomerType, CustomerTag, Channel } from '@/features/customers/types';
import { WorkLogType, WorkLogChannel } from '@/lib/worklog/types';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import { SidebarBottomBar } from '@/components/ui/navigation/SidebarBottomBar';
import { SidebarHeader } from '@/components/ui/SidebarHeader';

import { AkPopover } from '@/components/ui/AkPopover';

interface WorkspaceSidebarV2Props {
  isOpen: boolean;
}

const SIDEBAR_ITEM_CLASSES = {
  base: "w-full text-left px-3 py-1.5 rounded-md text-[13px] transition-all duration-200 ak-button-interactive ak-focus-ring flex items-center gap-2.5 group font-medium",
  active: "bg-[var(--ak-color-bg-surface-muted)] ak-text-primary shadow-sm ring-1 ring-[var(--ak-color-border-hairline)]",
  inactive: "ak-text-secondary hover:bg-[var(--ak-color-bg-hover)] hover:ak-text-primary",
  icon: "w-4 h-4 transition-transform duration-200",
  iconActive: "text-[var(--ak-color-accent)]",
  iconInactive: "ak-text-muted group-hover:ak-text-secondary"
};

export function WorkspaceSidebarV2({ isOpen }: WorkspaceSidebarV2Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const workspace = getWorkspaceByPath(pathname);
  const { features, isDeveloper } = useFeatureAccess();
  const [isFilterOverlayOpen, setIsFilterOverlayOpen] = useState(false);
  const [isAddonsCollapsed, setIsAddonsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inboxFiltersPanelRef = useRef<InboxFiltersPanelRef>(null);
  const filterButtonRef = useRef<HTMLDivElement>(null);
  const [isInboxFiltersDirty, setIsInboxFiltersDirty] = useState(false);
  const filterParams = useMemo(() => parseFilterParams(searchParams), [searchParams]);
  const view = searchParams.get('view');
  const isWorkLogView = (workspace?.id as any) === 'inbox' && view === 'activity';
  
  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    if (isWorkLogView) {
      // WorkLog filters: w_type, w_ch, w_range
      let count = 0;
      if (searchParams.get('w_type')) count++;
      if (searchParams.get('w_ch')) count++;
      const w_range = searchParams.get('w_range');
      if (w_range && w_range !== 'all') count++;
      return count;
    }
    return countActiveFilters(filterParams);
  }, [isWorkLogView, searchParams, filterParams]);
  
  const supportsFilters =
    (workspace?.id as any) === 'inbox' || (workspace?.id as any) === 'actions' || (workspace?.id as any) === 'customers' || workspace?.id === 'docs';
  
  // Settings doesn't need filters
  const isSettings = workspace?.id === 'settings';

  // Determine active sidebar item from URL params
  const activeItem = useMemo(() => {
    if ((workspace?.id as any) === 'actions') {
      if (filterParams.cat && filterParams.cat.length === 1) {
        return filterParams.cat[0];
      }
      if (filterParams.view === 'archived') {
        return 'archive';
      }
      return 'all';
    } else if ((workspace?.id as any) === 'customers') {
      if (filterParams.type === 'company') {
        return 'companies';
      }
      if (filterParams.type === 'contact') {
        return 'contacts';
      }
      if (filterParams.tag?.includes('archived')) {
        return 'archive';
      }
      return 'all';
    } else if ((workspace?.id as any) === 'inbox') {
      const view = searchParams.get('view');
      if (view === 'activity') {
        return 'activity';
      }
      // Default to first item (inbox)
      return workspace?.sidebarItems[0]?.key || null;
    } else if (workspace?.id === 'docs') {
      const tab = searchParams.get('tab');
      if (tab && ['uploads', 'recent'].includes(tab)) {
        return tab;
      }
      return 'all'; // Default
    } else     if (workspace?.id === 'settings') {
      const view = searchParams.get('view');
      const tab = searchParams.get('tab');
      const activeView = view || (tab && ['profile', 'organization', 'teams', 'integrations', 'ai', 'security', 'memory', 'modules'].includes(tab) ? tab : null);
      
      // Map view back to sidebar key if needed
      if (activeView === 'account') return 'profile';
      if (activeView === 'general') return 'organization';
      if (activeView === 'collaboration') return 'teams';
      
      return activeView || 'integrations'; // Default tab
    } else if (workspace?.id === 'marketing') {
      const view = searchParams.get('view');
      return view || 'overview';
    } else if (workspace?.id === 'serviceHub') {
      const area = searchParams.get('area');
      return area || 'inbox';
    }
    // For other workspaces, use first item as default
    return workspace?.sidebarItems[0]?.key || null;
  }, [workspace, filterParams, searchParams]);

  // Docs filters state
  const [docsDraftFilters, setDocsDraftFilters] = useState<{
    range?: 'today' | '7d' | '30d' | 'all';
    q?: string;
  }>({
    range: (filterParams.range || 'all') as 'today' | '7d' | '30d' | 'all',
    q: filterParams.q,
  });

  // Inbox filters state
  const [inboxDraftFilters, setInboxDraftFilters] = useState<{
    src?: InboxSource[];
    status?: InboxStatus;
    range?: 'today' | '7d' | '30d' | 'all';
  }>({
    src: filterParams.src as InboxSource[] | undefined,
    status: filterParams.status as InboxStatus | undefined,
    range: (filterParams.range || 'all') as 'today' | '7d' | '30d' | 'all',
  });

  // Actions filters state
  const [actionsDraftFilters, setActionsDraftFilters] = useState<{
    cat?: ActionCategoryId[];
    type?: ActionType;
    view?: ActionView;
  }>({
    cat: filterParams.cat as ActionCategoryId[] | undefined,
    type: filterParams.type as ActionType | undefined,
    view: (filterParams.view || 'all') as ActionView,
  });

  // Customers filters state
  const [customersDraftFilters, setCustomersDraftFilters] = useState<{
    type?: CustomerType;
    tag?: CustomerTag[];
    range?: 'today' | '7d' | '30d' | 'all';
    ch?: Channel[];
  }>({
    type: filterParams.type as CustomerType | undefined,
    tag: filterParams.tag as CustomerTag[] | undefined,
    range: (filterParams.range || 'all') as 'today' | '7d' | '30d' | 'all',
    ch: filterParams.ch as Channel[] | undefined,
  });

  // WorkLog filters state
  const [workLogDraftFilters, setWorkLogDraftFilters] = useState<{
    type?: WorkLogType[];
    channel?: WorkLogChannel[];
    range?: 'today' | '7d' | '30d' | 'all';
  }>({
    type: searchParams.get('w_type')?.split(',') as WorkLogType[] | undefined,
    channel: searchParams.get('w_ch')?.split(',') as WorkLogChannel[] | undefined,
    range: (searchParams.get('w_range') || 'all') as 'today' | '7d' | '30d' | 'all',
  });

  // Memoize search params string to avoid infinite loops
  // This ensures the effect only runs when the actual URL params change
  const searchParamsString = useMemo(() => searchParams.toString(), [searchParams]);
  
  useEffect(() => {
    // Re-parse filter params inside effect to ensure we have fresh values
    // We use searchParamsString as dependency to avoid infinite loops
    // searchParams is stable in Next.js and only changes when URL changes
    const currentFilterParams = parseFilterParams(searchParams);
    
    if ((workspace?.id as any) === 'inbox') {
      if (isWorkLogView) {
        setWorkLogDraftFilters({
          type: searchParams.get('w_type')?.split(',') as WorkLogType[] | undefined,
          channel: searchParams.get('w_ch')?.split(',') as WorkLogChannel[] | undefined,
          range: (searchParams.get('w_range') || 'all') as 'today' | '7d' | '30d' | 'all',
        });
      } else {
        setInboxDraftFilters({
          src: currentFilterParams.src as InboxSource[] | undefined,
          status: currentFilterParams.status as InboxStatus | undefined,
          range: (currentFilterParams.range || 'all') as 'today' | '7d' | '30d' | 'all',
        });
      }
    } else if ((workspace?.id as any) === 'actions') {
      setActionsDraftFilters({
        cat: currentFilterParams.cat as ActionCategoryId[] | undefined,
        type: currentFilterParams.type as ActionType | undefined,
        view: (currentFilterParams.view || 'all') as ActionView,
      });
    } else if ((workspace?.id as any) === 'customers') {
      setCustomersDraftFilters({
        type: currentFilterParams.type as CustomerType | undefined,
        tag: currentFilterParams.tag as CustomerTag[] | undefined,
        range: (currentFilterParams.range || 'all') as 'today' | '7d' | '30d' | 'all',
        ch: currentFilterParams.ch as Channel[] | undefined,
      });
    } else if (workspace?.id === 'docs') {
      setDocsDraftFilters({
        range: (currentFilterParams.range || 'all') as 'today' | '7d' | '30d' | 'all',
        q: currentFilterParams.q,
      });
    }
    // searchParams is stable in Next.js, so we can safely use it inside the effect
    // without including it in dependencies to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace?.id, isWorkLogView, searchParamsString]);

  // Filter sidebar items based on search query
  const filteredSidebarItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return workspace?.sidebarItems || [];
    }
    const query = searchQuery.toLowerCase();
    return (workspace?.sidebarItems || []).filter(item => 
      item.label.toLowerCase().includes(query) || 
      item.key.toLowerCase().includes(query)
    );
  }, [workspace?.sidebarItems, searchQuery]);

  // Early returns must come AFTER all hooks
  if (!workspace) {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  const handleFilterClear = () => {
    const params = new URLSearchParams();
    
    if (isWorkLogView) {
      // Keep view=activity, remove filter params
      params.set('view', 'activity');
    } else if (workspace?.id === 'docs') {
      // Keep tab param if present
      const tab = searchParams.get('tab');
      if (tab) {
        params.set('tab', tab);
      }
    } else {
      // Keep id param if present
      if (filterParams.id) {
        params.set('id', filterParams.id);
      }
    }
    
    const queryString = params.toString();
    router.replace(pathname + (queryString ? `?${queryString}` : ''));
    setIsFilterOverlayOpen(false);
  };

  const handleSidebarItemClick = (itemKey: string) => {
    // Handle Docs sidebar items
    if (workspace?.id === 'docs') {
      if (itemKey === 'all') {
        router.replace('/docs');
      } else if (itemKey === 'uploads') {
        router.replace('/docs?tab=uploads');
      } else if (itemKey === 'recent') {
        router.replace('/docs?tab=recent');
      }
      return;
    }

    // Handle Settings sidebar items
    if (workspace?.id === 'settings') {
      const viewMap: Record<string, string> = {
        profile: 'account',
        organization: 'general',
        teams: 'collaboration'
      };
      const view = viewMap[itemKey] || itemKey;
      router.replace(`/settings?view=${view}`);
      return;
    }

    // Handle Marketing sidebar items
    if (workspace?.id === 'marketing') {
      router.replace(`/marketing?view=${itemKey}`);
      return;
    }

    // Handle Service Hub sidebar items
    if (workspace?.id === 'serviceHub') {
      // Map serviceHub sidebar items to direct routes
      const routeMap: Record<string, string> = {
        'inbox': '/inbox',
        'docs': '/docs',
        'customers': '/customers',
        'website': '/website',
        'reviews': '/reviews',
        'telephony': '/telephony',
        'telegram': '/telegram',
      };
      const targetRoute = routeMap[itemKey] || '/inbox';
      router.replace(targetRoute);
      return;
    }

    // Handle Telegram sidebar items
    if (workspace?.id === 'telegram') {
      const view = itemKey === 'broadcast' ? 'broadcasts' : itemKey;
      router.replace(`/telegram?view=${view}`);
      return;
    }

    // Handle Telephony sidebar items
    if ((workspace?.id as any) === 'telephony') {
      router.replace(`/telephony?view=${itemKey}`);
      return;
    }

    // Handle Inbox sidebar items
    if ((workspace?.id as any) === 'inbox') {
      const params = new URLSearchParams();
      
      // Preserve existing filters by default
      if (filterParams.src) params.set('src', Array.isArray(filterParams.src) ? filterParams.src.join(',') : filterParams.src);
      if (filterParams.status) params.set('status', filterParams.status);
      if (filterParams.range) params.set('range', filterParams.range);
      if (filterParams.id) params.set('id', filterParams.id);

      if (itemKey === 'activity') {
        router.replace('/inbox?view=activity');
      } else if (itemKey === 'today') {
        params.set('range', 'today');
        params.delete('status'); // Clear status to see all for today
        router.replace(`/inbox?${params.toString()}`);
      } else if (itemKey === 'open') {
        params.set('status', 'open');
        params.delete('range');
        router.replace(`/inbox?${params.toString()}`);
      } else if (itemKey === 'archive') {
        params.set('status', 'archived');
        params.delete('range');
        router.replace(`/inbox?${params.toString()}`);
      } else if (itemKey === 'inbox') {
        // Reset to default
        router.replace('/inbox');
      } else {
        // Fallback for custom or unknown keys
        router.replace(`/inbox?${params.toString()}`);
      }
      return;
    }

    // Handle Actions sidebar items
    if ((workspace?.id as any) === 'actions') {
      const params = new URLSearchParams();
      
      // Map sidebar keys to category filters
      if (itemKey === 'all') {
        // Remove cat param
      } else if (itemKey === 'communication') {
        params.set('cat', 'communication');
      } else if (itemKey === 'marketing') {
        params.set('cat', 'marketing');
      } else if (itemKey === 'setup') {
        params.set('cat', 'setup');
      } else if (itemKey === 'archive') {
        params.set('view', 'archived');
      }

      // Keep other params
      if (filterParams.type) {
        params.set('type', filterParams.type);
      }
      if (filterParams.id) {
        params.set('id', filterParams.id);
      }

      router.replace(`/actions?${params.toString()}`);
    } else if ((workspace?.id as any) === 'customers') {
      const params = new URLSearchParams();
      
      // Map sidebar keys to type filters
      if (itemKey === 'all') {
        // Remove type param
      } else if (itemKey === 'companies') {
        params.set('type', 'company');
      } else if (itemKey === 'contacts') {
        params.set('type', 'contact');
      } else if (itemKey === 'archive') {
        params.set('tag', 'archived');
      }

      // Keep other params
      if (filterParams.tag && filterParams.tag.length > 0 && itemKey !== 'archive') {
        params.set('tag', filterParams.tag.join(','));
      }
      if (filterParams.range) {
        params.set('range', filterParams.range);
      }
      if (filterParams.ch && filterParams.ch.length > 0) {
        params.set('ch', filterParams.ch.join(','));
      }
      if (filterParams.id) {
        params.set('id', filterParams.id);
      }

      router.replace(`/customers?${params.toString()}`);
    }
  };

  const handleDocsFilterChange = (filters: {
    range?: 'today' | '7d' | '30d' | 'all';
    q?: string;
  }) => {
    setDocsDraftFilters(filters);
  };

  const handleInboxFilterChange = (filters: {
    src?: InboxSource[];
    status?: InboxStatus;
    range?: 'today' | '7d' | '30d' | 'all';
  }) => {
    setInboxDraftFilters(filters);
  };

  const handleActionsFilterChange = (filters: {
    cat?: ActionCategoryId[];
    type?: ActionType;
    view?: ActionView;
  }) => {
    setActionsDraftFilters(filters);
  };

  const handleCustomersFilterChange = (filters: {
    type?: CustomerType;
    tag?: CustomerTag[];
    range?: 'today' | '7d' | '30d' | 'all';
    ch?: Channel[];
  }) => {
    setCustomersDraftFilters(filters);
  };

  const handleWorkLogFilterChange = (filters: {
    type?: WorkLogType[];
    channel?: WorkLogChannel[];
    range?: 'today' | '7d' | '30d' | 'all';
  }) => {
    setWorkLogDraftFilters(filters);
  };

  const handleFilterApply = () => {
    const newParams = new URLSearchParams();

    if ((workspace?.id as any) === 'inbox') {
      if (isWorkLogView) {
        // WorkLog filters
        newParams.set('view', 'activity');
        if (workLogDraftFilters.type && workLogDraftFilters.type.length > 0) {
          newParams.set('w_type', workLogDraftFilters.type.join(','));
        }
        if (workLogDraftFilters.channel && workLogDraftFilters.channel.length > 0) {
          newParams.set('w_ch', workLogDraftFilters.channel.join(','));
        }
        if (workLogDraftFilters.range && workLogDraftFilters.range !== 'all') {
          newParams.set('w_range', workLogDraftFilters.range);
        }
      } else {
        // Inbox filters - get current draft from panel ref
        const draft = inboxFiltersPanelRef.current?.getDraft();
        if (draft) {
          if (draft.src && draft.src.length > 0) {
            newParams.set('src', draft.src.join(','));
          }
          if (draft.status) {
            newParams.set('status', draft.status);
          }
          if (draft.range && draft.range !== 'all') {
            newParams.set('range', draft.range);
          }
        }
      }
    } else if ((workspace?.id as any) === 'actions') {
      if (actionsDraftFilters.cat && actionsDraftFilters.cat.length > 0) {
        newParams.set('cat', actionsDraftFilters.cat.join(','));
      }
      if (actionsDraftFilters.type && actionsDraftFilters.type !== 'template') {
        newParams.set('type', actionsDraftFilters.type);
      }
      if (actionsDraftFilters.view && actionsDraftFilters.view !== 'all') {
        newParams.set('view', actionsDraftFilters.view);
      }
    } else if ((workspace?.id as any) === 'customers') {
      if (customersDraftFilters.type) {
        newParams.set('type', customersDraftFilters.type);
      }
      if (customersDraftFilters.tag && customersDraftFilters.tag.length > 0) {
        newParams.set('tag', customersDraftFilters.tag.join(','));
      }
      if (customersDraftFilters.range && customersDraftFilters.range !== 'all') {
        newParams.set('range', customersDraftFilters.range);
      }
      if (customersDraftFilters.ch && customersDraftFilters.ch.length > 0) {
        newParams.set('ch', customersDraftFilters.ch.join(','));
      }
    } else if (workspace?.id === 'docs') {
      if (docsDraftFilters.range && docsDraftFilters.range !== 'all') {
        newParams.set('range', docsDraftFilters.range);
      }
      if (docsDraftFilters.q) {
        newParams.set('q', docsDraftFilters.q);
      }
      // Keep tab param
      const tab = searchParams.get('tab');
      if (tab) {
        newParams.set('tab', tab);
      }
    }

    // Keep id param if present
    if (filterParams.id) {
      newParams.set('id', filterParams.id);
    }

    router.replace(`${pathname}?${newParams.toString()}`);
    setIsFilterOverlayOpen(false);
  };

  // Special case: Chat workspace gets its own sidebar
  if (workspace?.id === 'chat') {
    return (
      <aside className="relative w-[var(--ak-sidebar-width)] bg-[var(--ak-color-bg-sidebar)] border-r border-[var(--ak-color-border-hairline)] overflow-hidden flex flex-col">
        <ChatSidebarV2 />
      </aside>
    );
  }

  return (
    <aside className="relative w-[var(--ak-sidebar-width)] bg-[var(--ak-color-bg-sidebar)] border-r border-[var(--ak-color-border-hairline)] overflow-hidden flex flex-col">
      {/* Header with Title + Search */}
      <SidebarHeader 
        onSearch={setSearchQuery}
        placeholder="Suchen..."
      />

      {/* Views Section */}
      <div className="flex-1 overflow-y-auto ak-scrollbar flex flex-col py-3">
        <nav className="px-3">
          <div className="space-y-4">
            {Object.entries(
              filteredSidebarItems.reduce((acc, item) => {
                // Keep Add-ons visible in Service Hub even if not purchased, for "Buy" CTA via navigation
                // Logic updated based on user request: "Add-ons" group toggleable
                
                const group = item.group || '';
                if (!acc[group]) acc[group] = [];
                acc[group].push(item);
                return acc;
              }, {} as Record<string, typeof workspace.sidebarItems>)
            ).map(([groupName, items]) => {
              if (workspace.id === 'serviceHub' && groupName === 'Add-ons') {
                  return (
                    <div key={groupName} className="space-y-1">
                         <button 
                            onClick={() => setIsAddonsCollapsed(!isAddonsCollapsed)}
                            className="flex items-center gap-1 w-full px-3 py-1 text-[var(--ak-color-text-muted)] text-[11px] font-semibold opacity-80 hover:opacity-100 transition-opacity"
                         >
                            {isAddonsCollapsed ? <ChevronRightIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
                            {groupName}
                         </button>
                         
                         {!isAddonsCollapsed && (
                            <ul className="space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                                {items.map((item) => {
                                    const isActive = activeItem === item.key;
                                    const Icon = item.icon;

                                    return (
                                    <li key={item.key}>
                                        <button
                                        onClick={() => handleSidebarItemClick(item.key)}
                                        className={clsx(
                                            SIDEBAR_ITEM_CLASSES.base,
                                            isActive ? SIDEBAR_ITEM_CLASSES.active : SIDEBAR_ITEM_CLASSES.inactive
                                        )}
                                        >
                                        {Icon && (
                                            <Icon className={clsx(
                                                SIDEBAR_ITEM_CLASSES.icon,
                                                isActive ? SIDEBAR_ITEM_CLASSES.iconActive : SIDEBAR_ITEM_CLASSES.iconInactive
                                            )} />
                                        )}
                                        <span>{item.label}</span>
                                        </button>
                                    </li>
                                    );
                                })}
                            </ul>
                         )}
                    </div>
                  );
              }

              return (
              <div key={groupName || 'none'} className="space-y-1">
                {groupName && (
                  <div className="px-3 py-1">
                    <h3 className="text-[var(--ak-color-text-muted)] text-[11px] font-semibold opacity-80">
                      {groupName}
                    </h3>
                  </div>
                )}
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const isActive = activeItem === item.key;
                    const Icon = item.icon;

                    return (
                      <li key={item.key}>
                        <button
                          onClick={() => handleSidebarItemClick(item.key)}
                          className={clsx(
                            SIDEBAR_ITEM_CLASSES.base,
                            isActive ? SIDEBAR_ITEM_CLASSES.active : SIDEBAR_ITEM_CLASSES.inactive
                          )}
                        >
                          {Icon && (
                            <Icon className={clsx(
                              SIDEBAR_ITEM_CLASSES.icon,
                              isActive ? SIDEBAR_ITEM_CLASSES.iconActive : SIDEBAR_ITEM_CLASSES.iconInactive
                            )} />
                          )}
                          <span>{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )})}
          </div>
        </nav>

        {/* Filter Section */}
        {supportsFilters && !isSettings && (
          <div className="mt-6 flex flex-col">
            <div className="border-t border-[var(--ak-color-border-hairline)] mx-6 mb-5 opacity-40" />
            
            <div className="px-6 py-2 flex items-center justify-between group/filter">
              <div className="flex items-center gap-2">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ak-color-text-muted)] opacity-60">
                  Filter
                </h2>
                {activeFilterCount > 0 && (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--ak-color-accent)] text-[10px] font-bold text-[var(--ak-color-text-inverted)] shadow-sm">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              
              {activeFilterCount > 0 && (
                <button
                  onClick={handleFilterClear}
                  className="text-[10px] font-bold text-[var(--ak-color-accent)] hover:text-[var(--ak-color-accent-strong)] transition-colors uppercase tracking-wider"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="px-3 mt-1" ref={filterButtonRef}>
              <SidebarFilterRow
                activeCount={activeFilterCount}
                onClick={() => setIsFilterOverlayOpen(true)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Divider before Footer */}
      <div className="h-px bg-[var(--ak-color-border-subtle)] opacity-60 mx-3" />

      {/* Footer */}
      <SidebarBottomBar onAction={() => {
        // Context-specific actions
        if (workspace.id === 'inbox') {
          router.push('/inbox?compose=new')
        } else if (workspace.id === 'serviceHub' || workspace.id === 'customers') {
          router.push('/customers?new=true')
        } else if (workspace.id === 'docs') {
          router.push('/docs?upload=true')
        } else if (workspace.id === 'actions') {
          router.push('/actions?new=true')
        }
      }} />

      {/* Filter Overlay */}
      {supportsFilters && (workspace.id as any) === 'inbox' && !isWorkLogView ? (
        <AkPopover
          open={isFilterOverlayOpen}
          anchorRef={filterButtonRef}
          onClose={() => setIsFilterOverlayOpen(false)}
          align="left"
          side="bottom"
          className="w-[280px] p-0 rounded-xl overflow-hidden shadow-2xl border border-[var(--ak-color-border-subtle)]"
        >
          <div className="flex flex-col max-h-[400px]">
            <div className="flex-1 overflow-y-auto ak-scrollbar p-2">
              <InboxFiltersPanel
                ref={inboxFiltersPanelRef}
                initialFilters={inboxDraftFilters}
                onDirtyChange={setIsInboxFiltersDirty}
              />
            </div>
            <div className="p-2 border-t border-[var(--ak-color-border-hairline)] bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-between">
               <button
                  onClick={handleFilterClear}
                  className="text-xs font-medium text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)] px-2 py-1"
               >
                 Zurücksetzen
               </button>
               <AkButton
                  variant="primary"
                  accent="graphite"
                  size="sm"
                  onClick={handleFilterApply}
                  disabled={!isInboxFiltersDirty}
               >
                 Anwenden
               </AkButton>
            </div>
          </div>
        </AkPopover>
      ) : supportsFilters && (
        <SidebarFilterOverlay
          isOpen={isFilterOverlayOpen}
          onClose={() => setIsFilterOverlayOpen(false)}
          onApply={handleFilterApply}
          isApplyDisabled={false}
        >
           {(workspace.id as any) === 'actions' ? (
            <ActionsFiltersPanel
              initialFilters={actionsDraftFilters}
              onChange={handleActionsFilterChange}
            />
          ) : (workspace.id as any) === 'customers' ? (
            <CustomersFiltersPanel
              initialFilters={customersDraftFilters}
              onChange={handleCustomersFilterChange}
            />
          ) : workspace.id === 'docs' ? (
            <DocsFiltersPanel
              initialFilters={docsDraftFilters}
              onChange={handleDocsFilterChange}
            />
          ) : (workspace.id as any) === 'inbox' && isWorkLogView ? (
            <WorkLogFiltersPanel
              initialFilters={workLogDraftFilters}
              onChange={handleWorkLogFilterChange}
            />
          ) : null}
        </SidebarFilterOverlay>
      )}
    </aside>
  );
}

