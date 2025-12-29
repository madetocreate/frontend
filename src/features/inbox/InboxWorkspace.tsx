'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AkEmptyState } from '@/components/ui/AkEmptyState';
import { AkErrorState } from '@/components/ui/AkErrorState';
import { InboxList } from '@/features/inbox/InboxList';
import { InboxDetail } from '@/features/inbox/InboxDetail';
import { WorkLogView } from '@/features/worklog/WorkLogView';
import { applyInboxFilters } from '@/features/inbox/filtering';
import { parseFilterParams, buildFilterParams } from '@/lib/filters/query';
import { InboxItem, InboxSource, InboxStatus, InboxItemType } from '@/features/inbox/types';
import { UniversalInboxItem } from '@/lib/inbox/types';
import { FirstRunHintCard } from '@/components/onboarding/FirstRunHintCard';
import { ConnectInboxBanner } from '@/components/onboarding/ConnectInboxBanner';
import { loadIntegrationStatuses } from '@/lib/integrations/storage';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { ComposeCard, type ComposeContext } from '@/components/inbox/ComposeCard';
import { AkModal } from '@/components/ui/AkModal';
import { toast } from 'sonner';

/**
 * Konvertiert UniversalInboxItem zu InboxItem
 */
function convertToInboxItem(item: UniversalInboxItem): InboxItem {
  // Channel zu Source mappen
  const channelToSource: Record<string, InboxSource> = {
    email: 'email',
    messenger: 'telegram',
    phone: 'phone',
    reviews: 'reviews',
    website: 'website',
    documents: 'website',
    support: 'email',
    shopify: 'website',
    notifications: 'email',
  };

  // Channel/Kind zu Type mappen
  const channelToType: Record<string, InboxItemType> = {
    email: 'message',
    messenger: 'message',
    phone: 'call',
    reviews: 'review',
    website: 'lead',
    documents: 'message',
    support: 'message',
    shopify: 'message',
    notifications: 'message',
  };

  const source = channelToSource[item.channel] || 'email';
  const type = channelToType[item.channel] || 'message';
  
  // Status normalisieren
  let status: InboxStatus = 'open';
  if (item.status === 'needs_action' || item.status === 'new') {
    status = 'needs_action';
  } else if (item.status === 'archived') {
    status = 'archived';
  } else {
    status = 'open';
  }

  // Zeit parsen
  let timestamp = new Date();
  try {
    // Versuche die Zeit aus dem time-String zu parsen
    // time ist normalerweise im Format "HH:MM"
    const now = new Date();
    const [hours, minutes] = item.time.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      timestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    }
  } catch {
    // Fallback zu jetzt
    timestamp = new Date();
  }

  return {
    id: item.id,
    source,
    type,
    status,
    title: item.title,
    preview: item.snippet,
    timestamp,
    customerName: item.sender,
    customerEmail: item.meta?.email as string | undefined,
    meta: item.meta,
    suggestedActions: item.suggestedActions,
    body: item.body, // Added mapping if available
    html: item.html, // Added mapping if available
    isDemo: item.isDemo, // Map isDemo from backend
  };
}

export function InboxWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [emailConnected, setEmailConnected] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeContext, setComposeContext] = useState<ComposeContext | undefined>(undefined);

  useEffect(() => {
    // Check connection status on mount
    const statuses = loadIntegrationStatuses();
    setEmailConnected(!!statuses['email']?.connected);
    setCheckingAuth(false);
  }, []);

  // Parse filters from URL
  const filterParams = parseFilterParams(searchParams);

  // Auto-seed demo inbox if needed
  useEffect(() => {
    const ensureDemoInbox = async () => {
      if (checkingAuth) return;
      
      try {
        const { authedFetch } = await import('@/lib/api/authedFetch');
        // Try to seed demo inbox (idempotent, safe to call multiple times)
        await authedFetch('/api/demo/ensure-inbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }).catch(() => {
          // Ignore errors - seeding is optional
        });
      } catch (error) {
        // Ignore errors
        console.debug('[InboxWorkspace] Demo seed check failed:', error);
      }
    };

    // Only try once on mount
    if (!checkingAuth) {
      ensureDemoInbox();
    }
  }, [checkingAuth]);

  // Fetch real data from API
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['inbox', filterParams],
    queryFn: async () => {
      const params = new URLSearchParams(searchParams.toString());
      const res = await fetch(`/api/inbox?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch inbox');
      }
      const json = await res.json() as { items: UniversalInboxItem[] };
      // Konvertiere UniversalInboxItem zu InboxItem
      return {
        items: json.items.map(convertToInboxItem),
      };
    },
    staleTime: 30000, // 30 seconds
  });

  // Check if we should show banner (no email integration connected, even if items exist)
  const showConnectBanner = useMemo(() => {
    if (checkingAuth) return false;
    return !emailConnected;
  }, [emailConnected, checkingAuth]);

  const items = useMemo(() => {
    return data?.items ?? [];
  }, [data]);

  // Handle compose=new and share target params (title/text/url)
  useEffect(() => {
    const composeParam = searchParams.get('compose');
    const shareTitle = searchParams.get('title');
    const shareText = searchParams.get('text');
    const shareUrl = searchParams.get('url');
    
    const hasShareParams = shareTitle || shareText || shareUrl;
    
    if (composeParam === 'new' || hasShareParams) {
      setComposeOpen(true);
      
      // Build compose context from share params
      if (hasShareParams) {
        let bodyText = shareText || '';
        if (shareUrl) {
          bodyText = bodyText ? `${bodyText}\n\n${shareUrl}` : shareUrl;
        }
        
        const context: ComposeContext = {
          channel: 'email',
          subject: shareTitle || undefined,
          body: bodyText || undefined,
        };
        setComposeContext(context);
      } else {
        setComposeContext(undefined);
      }
      
      // Clean up URL: remove compose and share params
      const params = new URLSearchParams(searchParams.toString());
      params.delete('compose');
      params.delete('title');
      params.delete('text');
      params.delete('url');
      router.replace(`${window.location.pathname}?${params.toString()}`);
    }
  }, [searchParams, router]);

  const inboxFilters = useMemo(() => {
    return {
      src: filterParams.src as InboxSource[] | undefined,
      status: filterParams.status as InboxStatus | undefined,
      range: (filterParams.range || 'all') as 'today' | '7d' | '30d' | 'all',
    };
  }, [filterParams]);

  // Apply local filters (in addition to server filtering if needed)
  const filteredItems = useMemo(() => {
    return applyInboxFilters(items, inboxFilters);
  }, [items, inboxFilters]);

  // Get selected item
  const selectedItem = useMemo(() => {
    if (filterParams.id) {
      return filteredItems.find((item) => item.id === filterParams.id) || null;
    }
    
    // Fallback: try to find by threadId if provided in URL
    const threadId = searchParams.get('threadId') || searchParams.get('chatId');
    if (threadId) {
      return filteredItems.find((item) => item.meta?.sessionId === threadId || item.meta?.chatId === threadId) || null;
    }
    
    return null;
  }, [filterParams.id, filteredItems, searchParams]);

  const handleSelectItem = (item: InboxItem) => {
    const params = buildFilterParams({ ...filterParams, id: item.id });
    router.replace(`/inbox?${params.toString()}`);
  };

  const handleBack = () => {
    const params = buildFilterParams(filterParams);
    // Remove id from params
    params.delete('id');
    router.replace(`/inbox?${params.toString()}`);
  };

  const handleStartTriage = () => {
    const firstNeedsAction = filteredItems.find((item) => item.status === 'needs_action');
    if (firstNeedsAction) {
      handleSelectItem(firstNeedsAction);
    }
  };

  const handleMarkDone = async () => {
    if (!selectedItem) return;
    // For V1: We just go back and refetch
    handleBack();
    queryClient.invalidateQueries({ queryKey: ['inbox'] });
  };

  // Check for activity view
  const view = searchParams.get('view');
  if (view === 'activity') {
    return <WorkLogView />;
  }

  return (
    <div className="relative h-full flex flex-col">
      {/* Global Compose Overlay */}
      <AkModal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        position="bottom"
        showCloseButton={false}
      >
        <ComposeCard 
          initialContext={composeContext || {}} 
          onClose={() => {
            setComposeOpen(false);
            setComposeContext(undefined);
          }}
          onSuccess={() => {
            toast.success('Nachricht gesendet');
            setComposeContext(undefined);
          }}
        />
      </AkModal>

      {/* Loading state */}
      {isLoading ? (
        <div className="p-8 text-center text-[var(--ak-color-text-muted)]">Lade Inbox…</div>
      ) : error ? (
        <AkErrorState
          error={error}
          onRetry={() => refetch()}
        />
      ) : selectedItem ? (
        <InboxDetail item={selectedItem} onBack={handleBack} onMarkDone={handleMarkDone} />
      ) : (
        <div className="h-full min-h-0 flex flex-col gap-4 p-4 overflow-hidden">
          <div className="max-w-5xl mx-auto w-full flex flex-col h-full min-h-0">
            {showConnectBanner && <ConnectInboxBanner />}
            <FirstRunHintCard />
            {items.length === 0 ? (
              <AkEmptyState
                title="Inbox ist leer"
                description="Alle Anfragen wurden bearbeitet. Zeit für eine Kaffeepause!"
                action={{
                  label: 'Aktualisieren',
                  onClick: () => refetch(),
                }}
              />
            ) : (
              <div className="flex-1 min-h-0">
                <InboxList
                  items={filteredItems}
                  onSelectItem={handleSelectItem}
                  onStartTriage={handleStartTriage}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
