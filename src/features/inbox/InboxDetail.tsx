'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { InboxItem } from './types';
import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  GlobeAltIcon,
  PhoneIcon,
  ArrowLeftIcon,
  SparklesIcon,
  UserPlusIcon,
  LanguageIcon,
  ArchiveBoxIcon,
  ArrowUturnLeftIcon,
  ForwardIcon,
  TagIcon,
  ClipboardDocumentIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
// WorkLog entries now come from backend (action_audit_log) - no local logging needed
// Fast Actions removed - use Suggestion System instead (see Phase 3)
import { startActionWithStream, type ActionEvent } from '@/lib/actions/client';
import { ActionRunningCard } from '@/components/actions/ActionRunningCard';
import { ActionResultCardRenderer } from '@/components/actions/ActionResultCardRenderer';
import { toast } from 'sonner';
import { markInboxItemRead, archiveInboxItem } from './api';
import DOMPurify from 'isomorphic-dompurify';
import { ComposeCard, ComposeContext } from '@/components/inbox/ComposeCard';

interface InboxDetailProps {
  item: InboxItem;
  onBack: () => void;
  onMarkDone?: () => void;
}

const sourceIcons: Record<string, any> = {
  email: EnvelopeIcon,
  telegram: ChatBubbleLeftRightIcon,
  reviews: StarIcon,
  website: GlobeAltIcon,
  phone: PhoneIcon,
  marketing: EnvelopeIcon,
};

const sourceLabels: Record<string, string> = {
  email: 'E-Mail',
  telegram: 'Telegram',
  reviews: 'Bewertung',
  website: 'Website',
  phone: 'Anruf',
  marketing: 'Marketing',
};

function formatTimestamp(date: Date): string {
  return date.toLocaleString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface RunningAction {
  run_id: string;
  action_id: string;
  status: 'running' | 'reconnecting' | 'failed' | 'done';
  stepLabel?: string;
  error?: string;
  resultCard?: Record<string, unknown>;
  startTime: number;
}

export function InboxDetail({ item, onBack, onMarkDone }: InboxDetailProps) {
  const SourceIcon = sourceIcons[item.source];
  const sourceLabel = sourceLabels[item.source];

  // Compose State
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeContext, setComposeContext] = useState<ComposeContext | undefined>(undefined);

  const channelMap: Record<InboxItem['source'], 'email' | 'telegram' | 'reviews' | 'website' | 'phone'> = {
    email: 'email',
    telegram: 'telegram',
    reviews: 'reviews',
    website: 'website',
    phone: 'phone',
    marketing: 'email',
  };
  const channel = channelMap[item.source] || 'email';

  // Mark as Read on Mount
  useEffect(() => {
    if (item.status === 'needs_action' || item.status === 'open') {
      markInboxItemRead(item.id).catch(err => {
        console.error('Failed to mark as read:', err);
      });
    }
  }, [item.id, item.status]);

  // Running Actions State
  const [runningActions, setRunningActions] = useState<Map<string, RunningAction>>(new Map());

  // Handle Action Click (for retry functionality)
  const handleActionClick = useCallback(async (actionId: string) => {
    if (!actionId) {
      console.warn('No action_id provided');
      return;
    }

    try {
      // Optimistisch: Running Card anzeigen
      const tempRunId = `temp-${Date.now()}`;
      setRunningActions(prev => {
        const next = new Map(prev);
        next.set(tempRunId, {
          run_id: tempRunId,
          action_id: actionId,
          status: 'running',
          startTime: Date.now(),
        });
        return next;
      });

      // Start Action with Streaming
      const { startActionWithStream } = await import('@/lib/actions/client');
      const { run_id: runId, unsubscribe } = await startActionWithStream(
        {
          actionId,
          context: {
            module: 'inbox',
            target: {
              id: item.id,
              type: 'inbox',
              title: item.title,
            },
            moduleContext: {
              inbox: {
                itemId: item.id,
                threadId: item.threadId || item.id,
                channel,
              },
              item: item, // Für Rückwärtskompatibilität
            },
          },
        },
        (event: ActionEvent) => {
          // Update running action with real run_id
          if (event.type === 'run_started' && event.run_id !== tempRunId) {
            setRunningActions(prev => {
              const next = new Map(prev);
              const temp = next.get(tempRunId);
              if (temp) {
                next.delete(tempRunId);
                next.set(event.run_id, {
                  ...temp,
                  run_id: event.run_id,
                  action_id: event.action_id,
                });
              }
              return next;
            });
          }

          // Update with events
          // For run_started, use event.run_id; for others, find by tempRunId or use the first run_id we have
          let currentRunId = tempRunId;
          if (event.type === 'run_started') {
            currentRunId = event.run_id;
          } else {
            // Find the run_id from existing state
            const existing = runningActions.get(tempRunId);
            if (existing?.run_id) {
              currentRunId = existing.run_id;
            }
          }
          
          setRunningActions(prev => {
            const next = new Map(prev);
            const current = next.get(currentRunId) || next.get(tempRunId);
            if (!current) return next;

            switch (event.type) {
              case 'step_started':
                next.set(currentRunId, {
                  ...current,
                  stepLabel: event.label || `Step: ${event.step_id}`,
                });
                break;

              case 'step_progress':
                next.set(currentRunId, {
                  ...current,
                  stepLabel: event.message || current.stepLabel,
                });
                break;

              case 'card_render':
                next.set(currentRunId, {
                  ...current,
                  resultCard: event.card,
                });
                break;

              case 'run_completed': {
                const duration = Date.now() - current.startTime;
                // WorkLog entries are now written server-side (action_audit_log) - no local logging needed
                // System Notification
                import('@/lib/notifications/system').then(({ notifyActionCompleted }) => {
                  notifyActionCompleted(actionId, item.title, `/inbox?id=${item.id}`);
                });
                next.set(currentRunId, {
                  ...current,
                  status: 'done',
                });
                break;
              }

              case 'run_failed': {
                const duration = Date.now() - current.startTime;
                // WorkLog entries are now written server-side (action_audit_log) - no local logging needed
                // System Notification
                import('@/lib/notifications/system').then(({ notifyActionFailed }) => {
                  notifyActionFailed(actionId, event.message, item.title, `/inbox?id=${item.id}`);
                });
                next.set(currentRunId, {
                  ...current,
                  status: 'failed',
                  error: event.message,
                });
                break;
              }
            }

            return next;
          });
        }
      );

      // WorkLog entries are now written server-side (action_audit_log) - no local logging needed

      // Update with real run_id
      if (runId && runId !== tempRunId) {
        setRunningActions(prev => {
          const next = new Map(prev);
          const temp = next.get(tempRunId);
          if (temp) {
            next.delete(tempRunId);
            next.set(runId, {
              ...temp,
              run_id: runId,
            });
          }
          return next;
        });
      }

      // Cleanup on unmount
      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error('Failed to start action:', error);
      // WorkLog entries are now written server-side (action_audit_log) - no local logging needed
    }
  }, [item, channel]);

  const handleRetry = useCallback((runId: string) => {
    const action = runningActions.get(runId);
    if (!action) return;

    // Remove old run
    setRunningActions(prev => {
      const next = new Map(prev);
      next.delete(runId);
      return next;
    });

    // Retry with same action_id
    handleActionClick(action.action_id);
  }, [runningActions, handleActionClick]);

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Inhalt kopiert!', {
        icon: <ClipboardDocumentIcon className="w-4 h-4" />,
        duration: 2000,
      });
    } catch (err) {
      toast.error('Konnte nicht kopiert werden');
    }
  };

  const handleArchive = async () => {
    try {
      await archiveInboxItem(item.id);
      toast.success('Archiviert');
      onBack();
    } catch (error) {
      toast.error('Fehler beim Archivieren');
    }
  };

  const openReply = () => {
    let replyContext: ComposeContext = {
      channel: channel as any,
      threadId: item.threadId || item.id,
      inboxItemId: item.id,
    };

    if (item.source === 'email') {
      replyContext = {
        ...replyContext,
        recipient: item.customerEmail || item.recipients?.to?.[0] || '', // Fallback
        subject: item.title.startsWith('Re:') ? item.title : `Re: ${item.title}`,
      };
    } else if (item.source === 'messenger') {
      replyContext = {
        ...replyContext,
        recipient: item.customerName || '',
      };
    } else if (item.source === 'reviews') {
        replyContext = {
            ...replyContext,
            reviewId: item.id, // Assuming ID is review ID or we have meta
            channel: 'review'
        }
    }

    setComposeContext(replyContext);
    setComposeOpen(true);
  };

  const handleAction = async (actionLabel: string, actionId?: string) => {
    // Wenn eine actionId vorhanden ist, starte die echte Aktion
    if (actionId) {
        
        // Handle Inbox Native Actions
        if (actionId === 'inbox.draft_reply') {
            openReply();
            return;
        }
        if (actionId === 'inbox.archive') {
            handleArchive();
            return;
        }

      // Special Handling for Demo Items (Magic Draft)
      if (item.id.startsWith('demo-')) {
          const promise = new Promise((resolve) => setTimeout(resolve, 2000));
          toast.promise(promise, {
            loading: 'KI generiert Entwurf...',
            success: 'Entwurf erstellt! (Demo)',
            error: 'Fehler',
          });
          
          // Simulate running card for Magic Draft
          const tempRunId = `demo-run-${Date.now()}`;
          setRunningActions(prev => {
            const next = new Map(prev);
            next.set(tempRunId, {
              run_id: tempRunId,
              action_id: actionId,
              status: 'running',
              stepLabel: 'Analysiere Anfrage...',
              startTime: Date.now(),
            });
            return next;
          });

          // Simulate Steps
          setTimeout(() => {
             setRunningActions(prev => {
                const next = new Map(prev);
                const current = next.get(tempRunId);
                if(current) next.set(tempRunId, { ...current, stepLabel: 'Schreibe Antwort...' });
                return next;
             });
          }, 1000);

          setTimeout(() => {
             setRunningActions(prev => {
                const next = new Map(prev);
                const current = next.get(tempRunId);
                if(current) {
                    next.set(tempRunId, { 
                        ...current, 
                        status: 'done',
                        resultCard: {
                            type: 'draft_reply',
                            title: 'Entwurf erstellt',
                            content: 'Hallo Max,\n\ndanke für deine Anfrage. Gerne können wir uns nächste Woche zusammensetzen.\n\nWie wäre es am Dienstag um 14:00 Uhr?\n\nBeste Grüße,\n[Dein Name]',
                            actions: [
                                { label: 'Senden (Login erforderlich)', actionId: 'connect_email', variant: 'primary' }
                            ]
                        }
                    });
                }
                return next;
             });
             toast('Entwurf bereit!', {
                 description: 'Verbinde Gmail, um ihn zu senden.',
                 action: {
                     label: 'Verbinden',
                     onClick: () => window.location.href = '/actions?cat=setup&integration=email'
                 }
             });
          }, 2500);
          
          return;
      }

      try {
        const { dispatchActionStart } = await import('@/lib/actions/dispatch');
        dispatchActionStart(
          actionId,
          {
            module: 'inbox',
            target: {
              id: item.id,
              type: 'inbox',
              title: item.title,
            },
            moduleContext: {
              inbox: {
                itemId: item.id,
                threadId: item.threadId || item.id,
                channel,
              },
              item: item,
            },
          },
          {},
          'InboxDetail-handleAction'
        );
        return;
      } catch (error) {
        console.error('[InboxDetail] Fehler beim Starten der Aktion:', error);
      }
    }

    // Legacy/Demo Fallback
    console.log(`(Demo) ${actionLabel} startet später`);
    
    // WorkLog entries are now written server-side (action_audit_log) - no local logging needed
  };

  // Smart Actions Definition
  // Zuerst die vom Backend vorgeschlagenen Aktionen nutzen
  const backendActions = item.suggestedActions?.map(action => ({
    id: action.id,
    label: action.label,
    icon: SparklesIcon, // Default Icon für KI Aktionen
    actionId: action.actionId,
    isAi: true,
    onClick: () => handleAction(action.label, action.actionId)
  })) || [];

  const smartActions = [
    ...backendActions,
    // Nur ergänzen, was noch nicht da ist
    {
      id: 'reply',
      label: 'Antwort',
      icon: ArrowUturnLeftIcon,
      condition: ['email', 'telegram', 'phone', 'reviews', 'marketing'].includes(item.source) && !backendActions.some(a => a.id === 'reply'),
      isAi: true,
      onClick: () => openReply(),
    },
    {
      id: 'next_steps',
      label: 'Next Steps',
      icon: ForwardIcon,
      condition: !backendActions.some(a => a.id === 'next_steps'),
      isAi: true,
      onClick: () => handleAction('Next steps', 'inbox.next_steps'),
    },
    {
      id: 'translate',
      label: 'Übersetzen',
      icon: LanguageIcon,
      // Show if language is detected and not German
      condition: (item.meta as any)?.language && (item.meta as any)?.language !== 'de' && !backendActions.some(a => a.id === 'translate'),
      isAi: true,
      onClick: () => handleAction('Übersetzen', 'inbox.translate'),
    },
    {
      id: 'create_customer',
      label: 'Kunde erstellen',
      icon: UserPlusIcon,
      condition: !item.customerName && !backendActions.some(a => a.id === 'create_customer'),
      isAi: true,
      onClick: () => handleAction('Kunde erstellen', 'crm.create_customer'),
    },
    {
      id: 'assign',
      label: 'Zuordnen',
      icon: TagIcon,
      condition: !!item.customerName && !backendActions.some(a => a.id === 'assign'),
      isAi: false,
      onClick: () => handleAction('Zuordnen', 'inbox.assign'),
    },
    {
      id: 'archive',
      label: 'Archiv',
      icon: ArchiveBoxIcon,
      condition: !backendActions.some(a => a.id === 'archive'),
      isAi: false,
      onClick: () => handleArchive(),
    },
  ].filter(action => (action as any).condition !== false);

  const cleanHtml = useMemo(() => {
    if (!item.html) return null;
    return DOMPurify.sanitize(item.html);
  }, [item.html]);

  return (
    <div className="space-y-6 relative">
      {/* Compose Overlay */}
      {composeOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl">
                <ComposeCard 
                    initialContext={composeContext} 
                    onClose={() => setComposeOpen(false)}
                    onSuccess={() => {
                        // Optional: Refresh list or mark as replied
                        toast.success('Antwort gesendet');
                    }}
                />
            </div>
         </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] transition-colors ak-icon-interactive"
          aria-label="Zur Inbox"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-medium text-[var(--ak-color-text-primary)]">
          Zur Inbox
        </h1>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Item Header / Reading Pane */}
        <div className="rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] overflow-hidden shadow-sm">
          {/* Header Section */}
          <div className="p-5 border-b border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface-muted)]/30">
             <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] flex items-center justify-center shadow-sm">
                        <SourceIcon className="w-5 h-5 text-[var(--ak-color-text-secondary)]" />
                     </div>
                     <div>
                        <h2 className="text-lg font-semibold text-[var(--ak-color-text-primary)] leading-snug">
                            {item.title}
                        </h2>
                        <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1 text-sm text-[var(--ak-color-text-muted)]">
                            <span className="font-medium text-[var(--ak-color-text-secondary)]">
                                {item.customerName || item.customerEmail || 'Unbekannt'}
                            </span>
                            {item.customerEmail && item.customerEmail !== item.customerName && (
                                <span className="text-[var(--ak-color-text-muted)]">&lt;{item.customerEmail}&gt;</span>
                            )}
                            <span>an</span>
                            <span className="text-[var(--ak-color-text-primary)]">mich</span>
                            <span>•</span>
                            <span>{formatTimestamp(item.timestamp)}</span>
                        </div>
                     </div>
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={() => openReply()}
                        className="px-3 py-1.5 rounded-md bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-sm font-medium text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] hover:border-[var(--ak-color-border-default)] transition-all shadow-sm flex items-center gap-2"
                    >
                        <ArrowUturnLeftIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Antworten</span>
                    </button>
                    <button 
                        onClick={handleArchive}
                        className="p-1.5 rounded-md text-[var(--ak-color-text-muted)] hover:bg-[var(--ak-color-bg-hover)] transition-colors"
                        title="Archivieren"
                    >
                        <ArchiveBoxIcon className="w-5 h-5" />
                    </button>
                </div>
             </div>
             
             {/* Tags / Meta if available */}
             {item.status === 'needs_action' && (
                  <div className="mt-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ak-semantic-warning-soft ak-semantic-warning border border-[var(--ak-semantic-warning)]/20">
                        Needs Action
                      </span>
                  </div>
             )}
          </div>

          {/* Body Section */}
          <div className="p-6 text-[var(--ak-color-text-primary)]">
            {cleanHtml ? (
                <div 
                    className="prose prose-sm max-w-none dark:prose-invert prose-p:text-[var(--ak-color-text-primary)] prose-headings:text-[var(--ak-color-text-primary)] prose-a:text-[var(--ak-color-accent)]"
                    dangerouslySetInnerHTML={{ __html: cleanHtml }}
                />
            ) : (
                <p className="whitespace-pre-wrap leading-relaxed">
                    {item.body || item.preview}
                </p>
            )}
          </div>
          
          {/* Attachments (Mock/Simple List) */}
          {item.attachments && item.attachments.length > 0 && (
             <div className="px-6 py-4 border-t border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface-muted)]/10">
                <h4 className="text-xs font-semibold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-2">
                    Anhänge ({item.attachments.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                    {item.attachments.map(att => (
                        <a 
                            key={att.id} 
                            href={att.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] hover:bg-[var(--ak-color-bg-surface-hover)] transition-colors text-sm text-[var(--ak-color-text-primary)]"
                        >
                            <PaperClipIcon className="w-4 h-4 text-[var(--ak-color-text-secondary)]" />
                            <span className="truncate max-w-[150px]">{att.filename}</span>
                        </a>
                    ))}
                </div>
             </div>
          )}
        </div>

        {/* Lead Link */}
        {item.meta && (item.meta as any).leadId && (
          <div className="p-4 rounded-lg border border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)] flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-[var(--ak-color-accent-soft)]/20 text-[var(--ak-color-accent)]">
                    <UserPlusIcon className="w-5 h-5" />
                </div>
                <div>
                     <h3 className="text-sm font-medium text-[var(--ak-color-text-primary)]">
                      Lead verknüpft
                    </h3>
                    <p className="text-xs text-[var(--ak-color-text-muted)]">
                        Diese Konversation gehört zu einem Lead.
                    </p>
                </div>
            </div>
            <button
              onClick={() => {
                window.location.href = `/leads?id=${(item.meta as any).leadId}`;
              }}
              className="px-4 py-2 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-secondary)] text-sm font-medium hover:text-[var(--ak-color-text-primary)] hover:border-[var(--ak-color-border-default)] transition-colors"
            >
              Lead öffnen
            </button>
          </div>
        )}

        {/* Running Actions */}
        {runningActions.size > 0 && (
          <div className="space-y-3">
            {Array.from(runningActions.values()).map((action) => (
              <div key={action.run_id} className="space-y-3">
                <ActionRunningCard
                  actionId={action.action_id}
                  status={action.status}
                  stepLabel={action.stepLabel}
                  error={action.error}
                  onRetry={action.status === 'failed' ? () => handleRetry(action.run_id) : undefined}
                />
                {action.resultCard && action.status === 'done' && (
                  <ActionResultCardRenderer
                    card={action.resultCard}
                    actionId={action.action_id}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Smart Context Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-[var(--ak-color-border-fine)]">
          {smartActions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`
                group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                border shadow-sm
                ${
                  action.isAi
                    ? 'border-[var(--ak-color-accent)]/30 text-[var(--ak-color-accent-strong)] hover:border-[var(--ak-color-accent)] hover:bg-[var(--ak-color-accent)]/5'
                    : 'border-[var(--ak-color-border-fine)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)] hover:border-[var(--ak-color-border-default)]'
                }
              `}
            >
              {action.isAi ? (
                <SparklesIcon className="w-4 h-4" />
              ) : (
                action.icon && <action.icon className="w-4 h-4" />
              )}
              {action.label}
            </button>
          ))}

          {item.status === 'needs_action' && onMarkDone && (
            <button
              onClick={onMarkDone}
              className="ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] hover:bg-[var(--ak-color-accent-strong)] transition-all ak-button-interactive shadow-sm hover:shadow"
            >
              Als erledigt markieren
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
