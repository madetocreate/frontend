'use client';

import { useQuery } from '@tanstack/react-query';
import { authedFetch } from '@/lib/api/authedFetch';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatBubbleLeftRightIcon, ClockIcon, UserIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import clsx from 'clsx';
import { AkEmptyState } from '@/components/ui/AkEmptyState';

// Types
interface Conversation {
  session_id: string;
  title: string | null;
  created_at: string;
  message_count: number;
  last_message_at: string | null;
  summary: string | null;
  metadata: any;
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOutgoing: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

interface ChatThreadData {
  id: string;
  contactName: string;
  contactAvatar?: string;
  platform: string;
  messages: Message[];
  lastActivity?: string;
}

export function WebsiteConversationViewer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedThreadId = searchParams.get('threadId');

  // --- LIST QUERY ---
  const { data: conversationsData, isLoading: listLoading } = useQuery({
    queryKey: ['website-conversations-list'],
    queryFn: async () => {
      const res = await authedFetch('/api/website/conversations?limit=50');
      if (!res.ok) throw new Error('Failed to fetch conversations');
      return res.json();
    }
  });

  const conversations = conversationsData?.items || [];

  // --- DETAIL QUERY ---
  const { data: threadData, isLoading: detailLoading } = useQuery({
    queryKey: ['website-messages', selectedThreadId],
    queryFn: async () => {
      if (!selectedThreadId) return null;
      const res = await authedFetch(`/api/messages/${selectedThreadId}?platform=chat`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json() as Promise<ChatThreadData>;
    },
    enabled: !!selectedThreadId
  });

  const messages = threadData?.messages || [];

  const handleSelect = (threadId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('threadId', threadId);
    router.push(`/website?${params.toString()}`);
  };

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[500px] border border-[var(--ak-color-border-subtle)] rounded-lg overflow-hidden bg-[var(--ak-color-bg-surface)]">
      {/* LEFT LIST */}
      <div className="w-1/3 border-r border-[var(--ak-color-border-subtle)] flex flex-col bg-[var(--ak-color-bg-surface)]">
        <div className="p-3 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] text-xs font-medium text-[var(--ak-color-text-secondary)] uppercase tracking-wider">
          Konversationen
        </div>
        <div className="flex-1 overflow-y-auto">
          {listLoading ? (
            <div className="p-4 text-center text-sm text-[var(--ak-color-text-muted)]">Lade Chats...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-[var(--ak-color-text-muted)]">Keine Chats gefunden</div>
          ) : (
            <ul className="divide-y divide-[var(--ak-color-border-subtle)]">
              {conversations.map((conv: Conversation) => {
                const isActive = selectedThreadId === conv.session_id;
                return (
                  <li 
                    key={conv.session_id}
                    onClick={() => handleSelect(conv.session_id)}
                    className={clsx(
                      'p-4 cursor-pointer hover:bg-[var(--ak-color-bg-hover)] transition-colors',
                      isActive ? 'bg-[var(--ak-color-bg-selected)]' : ''
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-[var(--ak-color-text-primary)] truncate max-w-[70%]">
                        {conv.title || 'Besucher ' + conv.session_id.substring(0, 4)}
                      </span>
                      <span className="text-xs text-[var(--ak-color-text-muted)]">
                        {conv.message_count} Msgs
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--ak-color-text-secondary)]">
                      <ClockIcon className="w-3 h-3" />
                      {conv.last_message_at ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true, locale: de }) : 'Neu'}
                    </div>
                    {conv.summary && (
                        <div className="mt-1 text-xs text-[var(--ak-color-text-muted)] line-clamp-1">
                            {conv.summary}
                        </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* RIGHT DETAIL */}
      <div className="w-2/3 flex flex-col bg-[var(--ak-color-bg-app)]">
        {!selectedThreadId ? (
          <AkEmptyState
            icon={<ChatBubbleLeftRightIcon />}
            title="Kein Chat ausgewählt"
            description="Wählen Sie eine Konversation aus der Liste."
          />
        ) : detailLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <ArrowPathIcon className="w-6 h-6 animate-spin text-[var(--ak-color-text-muted)]" />
          </div>
        ) : messages ? (
          <div className="flex-1 flex flex-col h-full">
             <div className="p-4 border-b border-[var(--ak-color-border-subtle)] ak-bg-surface-1 flex justify-between items-center">
                <h3 className="font-medium text-[var(--ak-color-text-primary)]">Chat Verlauf</h3>
                <span className="text-xs text-[var(--ak-color-text-muted)]">Session: {selectedThreadId}</span>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-sm ak-text-secondary py-10">Keine Nachrichten.</div>
                ) : (
                    messages.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={clsx(
                                "flex flex-col max-w-[80%]",
                                msg.isOutgoing ? "self-end items-end" : "self-start items-start"
                            )}
                        >
                            <div className={clsx(
                                "p-3 rounded-lg text-sm",
                                msg.isOutgoing 
                                    ? "bg-[var(--ak-color-accent)] ak-text-primary" 
                                    : "ak-bg-surface-1 border border-[var(--ak-color-border-subtle)] ak-text-primary"
                            )}>
                                {msg.content}
                            </div>
                            <div className="text-[10px] ak-text-muted mt-1 px-1">
                                {msg.timestamp}
                            </div>
                        </div>
                    ))
                )}
             </div>
          </div>
        ) : (
           <AkEmptyState
            icon={<ChatBubbleLeftRightIcon />}
            title="Chat nicht gefunden"
            description="Konnte Nachrichten nicht laden."
          />
        )}
      </div>
    </div>
  );
}

