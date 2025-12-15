'use client'

import { useState, useEffect } from 'react'
import { 
  XMarkIcon, 
  ArchiveBoxIcon, 
  ClockIcon, 
  TrashIcon, 
  ChartBarIcon, 
  ChatBubbleBottomCenterTextIcon 
} from '@heroicons/react/24/outline'

type ChatInfoDrawerProps = {
  open: boolean
  onClose: () => void
}

type ArchivedChat = {
  id: string
  title: string
  date: string
  preview: string
}

export function ChatInfoDrawer({ open, onClose }: ChatInfoDrawerProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Dummy Data for Archive
  const [archivedChats] = useState<ArchivedChat[]>([
    { id: '1', title: 'Marketing Strategie 2024', date: 'Gestern', preview: 'Lass uns die KPIs für Q1 besprechen...' },
    { id: '2', title: 'React Performance', date: 'Vorgestern', preview: 'Wie optimiere ich useEffect Hooks?' },
    { id: '3', title: 'Kunden E-Mail Entwurf', date: '12.12.2024', preview: 'Antwort auf Anfrage von Müller GmbH...' },
  ])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true)
    } else {
      timer = setTimeout(() => setIsVisible(false), 300)
    }
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [open])

  if (!isVisible && !open) return null

  return (
    <div className={`fixed inset-0 z-[9999] overflow-hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div 
        className={`absolute inset-0 bg-black/20 backdrop-blur-md transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose}
      />
      
      <div className={`fixed inset-y-0 right-0 flex max-w-full pl-10 transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="w-screen max-w-md">
          <div className="flex h-full flex-col overflow-y-scroll bg-[var(--ak-color-bg-surface)] shadow-2xl">
            
            {/* Header */}
            <div className="px-6 py-6 border-b border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)]/50 backdrop-blur-xl sticky top-0 z-10">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-bold text-[var(--ak-color-text-primary)] tracking-tight">
                  Chat Info & Archiv
                </h2>
                <div className="ml-3 flex h-7 items-center">
                  <button
                    type="button"
                    className="rounded-full bg-transparent text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] hover:bg-[var(--ak-color-bg-hover)] p-1 transition-colors focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close panel</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className="mt-1 text-sm text-[var(--ak-color-text-secondary)]">
                Verwalte deine Chat-Historie und sehe Statistiken.
              </p>
            </div>

            {/* Content */}
            <div className="relative mt-6 flex-1 px-4 sm:px-6 space-y-8 pb-10">
              
              {/* Stats Widget */}
              <section>
                <h3 className="text-xs font-semibold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-4 px-2">Aktuelle Session</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 apple-card-enhanced rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)]/30">
                    <div className="flex items-center gap-2 mb-2">
                      <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-medium text-[var(--ak-color-text-secondary)]">Nachrichten</span>
                    </div>
                    <span className="text-2xl font-bold text-[var(--ak-color-text-primary)]">24</span>
                  </div>
                  <div className="p-4 apple-card-enhanced rounded-2xl border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)]/30">
                    <div className="flex items-center gap-2 mb-2">
                      <ChartBarIcon className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-medium text-[var(--ak-color-text-secondary)]">Token</span>
                    </div>
                    <span className="text-2xl font-bold text-[var(--ak-color-text-primary)]">~4k</span>
                  </div>
                </div>
              </section>

              {/* Archived Chats */}
              <section>
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-xs font-semibold text-[var(--ak-color-text-muted)] uppercase tracking-wider">Archivierte Chats</h3>
                  <button className="text-xs font-medium text-[var(--ak-color-accent)] hover:underline">Alle anzeigen</button>
                </div>
                <div className="space-y-3">
                  {archivedChats.map((chat) => (
                    <div key={chat.id} className="group p-4 rounded-xl border border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-color-accent)]/50 bg-[var(--ak-color-bg-surface)] hover:bg-[var(--ak-color-bg-hover)] transition-all cursor-pointer shadow-sm hover:shadow-md">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-[var(--ak-color-text-primary)] text-sm">{chat.title}</h4>
                        <span className="text-[10px] text-[var(--ak-color-text-muted)] flex items-center gap-1 bg-[var(--ak-color-bg-surface-muted)] px-1.5 py-0.5 rounded-full">
                          <ClockIcon className="w-3 h-3" /> {chat.date}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--ak-color-text-secondary)] line-clamp-2 leading-relaxed">
                        {chat.preview}
                      </p>
                      <div className="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors">
                          <TrashIcon className="w-3 h-3" /> Löschen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              
              {/* Quick Actions */}
              <section>
                 <h3 className="text-xs font-semibold text-[var(--ak-color-text-muted)] uppercase tracking-wider mb-4 px-2">Aktionen</h3>
                 <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-secondary)] hover:border-[var(--ak-color-accent)] hover:text-[var(--ak-color-accent)] hover:bg-[var(--ak-color-bg-hover)] transition-all text-sm font-medium">
                   <ArchiveBoxIcon className="w-4 h-4" />
                   Diesen Chat archivieren
                 </button>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
