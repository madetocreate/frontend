'use client';

import { Fragment, useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, SparklesIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { ChatShell } from '@/components/ChatShell';
import { createChatThread, setActiveThreadId } from '@/lib/chatThreadsStore';
import { useRouter } from 'next/navigation';
import { AkButton } from '@/components/ui/AkButton';

interface HubCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  context: 'service' | 'marketing';
  initialData?: Record<string, any>;
}

export function HubCopilot({ isOpen, onClose, context, initialData }: HubCopilotProps) {
  const [threadId, setThreadId] = useState<string | null>(null);
  const initializedRef = useRef(false);

  // Initialize a special thread for this context
  useEffect(() => {
    if (isOpen && !threadId) {
      createChatThread().then((newThread) => {
        setThreadId(newThread.id);
        setActiveThreadId(newThread.id);
      });
      
      // Optional: Send initial context to the thread
      // For now, we rely on the user asking questions, but we could preload stats here
      // via a hidden mechanism or by pre-filling the message input.
    }
  }, [isOpen, threadId]);

  // When data changes, we could potentially update the context
  // This is where "Part 2" (Reverse Direction) comes in - 
  // ensuring the AI knows the stats.
  useEffect(() => {
    if (isOpen && threadId && initialData && !initializedRef.current) {
      // Small hack: We can't easily inject hidden messages into ChatShell without modifying it.
      // But we can just rely on the user seeing "Connected to Service Hub" visual cues.
      // The "Reverse Direction" (Chat -> Stats) is best handled by Backend Tools in a real app.
      // For this demo/prototype, we will focus on the UI integration.
      initializedRef.current = true;
    }
  }, [isOpen, threadId, initialData]);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-[var(--ak-color-bg-surface)] shadow-2xl border-l border-[var(--ak-color-border-subtle)]">
                    
                    {/* Header */}
                    <div className="px-4 py-6 sm:px-6 bg-[var(--ak-color-bg-surface-muted)] border-b border-[var(--ak-color-border-subtle)]">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-base font-semibold leading-6 text-[var(--ak-color-text-primary)] flex items-center gap-2">
                          <div 
                            className="p-1.5 rounded-lg ak-accent-bg-soft ak-accent-icon"
                            style={context === 'service' 
                              ? { '--ak-color-accent': 'var(--ak-accent-inbox)', '--ak-color-accent-soft': 'var(--ak-accent-inbox-soft)' } as React.CSSProperties
                              : { '--ak-color-accent': 'var(--ak-accent-customers)', '--ak-color-accent-soft': 'var(--ak-accent-customers-soft)' } as React.CSSProperties
                            }
                          >
                            <SparklesIcon className="w-5 h-5" />
                          </div>
                          {context === 'service' ? 'Service Copilot' : 'Marketing Copilot'}
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative rounded-md text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] focus:outline-none"
                            onClick={onClose}
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-[var(--ak-color-text-secondary)]">
                        {context === 'service' 
                          ? 'Ich helfe dir bei Kundenanfragen und Analysen.' 
                          : 'Lass uns Kampagnen planen und Content erstellen.'}
                      </p>
                      
                      {/* Context Data Preview (Visual only for now) */}
                      {initialData && (
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                           {Object.entries(initialData).map(([key, value]) => (
                             <span key={key} className="inline-flex items-center rounded-md bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] px-2 py-1 text-xs font-medium text-[var(--ak-color-text-secondary)] whitespace-nowrap">
                               {key}: {value}
                             </span>
                           ))}
                        </div>
                      )}
                    </div>

                    {/* Chat Area */}
                    <div className="relative flex-1 px-4 sm:px-6 py-4 overflow-hidden">
                       {/* We wrap ChatShell to constrain it */}
                       <div className="h-full w-full rounded-xl border border-[var(--ak-color-border-subtle)] overflow-hidden bg-[var(--ak-color-bg-app)]">
                         {/* 
                            Note: In a real implementation, we would pass 'threadId' to ChatShell 
                            if it accepted props, or ensure the global store is synced. 
                            Since ChatShell uses the global store, setting activeThreadId above works.
                         */}
                         <ChatShell />
                       </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

