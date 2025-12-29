'use client'

import { useEffect, useMemo, useState, useCallback, useRef, memo, forwardRef } from 'react'
import clsx from 'clsx'
import { 
  ChevronRightIcon, 
  PaperAirplaneIcon, 
  FunnelIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  StarIcon,
  DocumentIcon,
  ShoppingBagIcon,
  GlobeAltIcon,
  BellIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InboxIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Virtuoso } from 'react-virtuoso'

import { PaneTopbar } from '@/components/ui/PaneTopbar'
import { PaneRow } from '@/components/ui/PaneRow'
import { AkButton } from '@/components/ui/AkButton'
import { AkAlert } from '@/components/ui/AkAlert'
import { AkPopoverMenu, type PopoverMenuItem } from '@/components/ui/AkPopoverMenu'
import { AkEmptyState } from '@/components/ui/AkEmptyState'
import { UniversalInboxItem } from '@/lib/inbox/types'
import { useInboxItems } from '@/lib/inbox/useInboxItems'

export type InboxItem = UniversalInboxItem

interface InboxDrawerWidgetProps {
  onItemClick?: (item: InboxItem) => void
  activeThreadId?: string | null
  onToggleCommandPalette?: () => void
  externalFilters?: { type?: string; channel?: string[] }
  onFilterChange?: (filter: { type?: string; channel?: string[] }) => void
  onClose?: () => void
}

const CHANNEL_ICONS: Record<string, any> = {
  email: EnvelopeIcon,
  messenger: ChatBubbleLeftRightIcon,
  phone: PhoneIcon,
  reviews: StarIcon,
  website: GlobeAltIcon,
  documents: DocumentIcon,
  shopify: ShoppingBagIcon,
  notifications: BellIcon,
  support: ExclamationTriangleIcon,
}

const InboxListItem = memo(({ item, isActive, onClick, onMarkRead }: { 
  item: InboxItem, 
  isActive: boolean, 
  onClick: (item: InboxItem) => void,
  onKeyDown?: (e: React.KeyboardEvent, item: InboxItem) => void,
  onMarkRead?: (id: string) => void
}) => {
  const Icon = CHANNEL_ICONS[item.channel] || InboxIcon

  return (
    <div className="px-2 pt-1">
      <PaneRow
        selected={isActive}
        onClick={() => onClick(item)}
        unread={item.unread}
        accent="inbox"
        title={item.sender}
        subtitle={item.title}
        className="hover:bg-[var(--ak-surface-1)]"
        leading={
          <div className={clsx(
            "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
            isActive 
              ? "bg-[var(--ak-surface-1)] ring-1 ring-[var(--ak-accent-inbox)]/50 text-[var(--ak-text-primary)]" 
              : "bg-[var(--ak-surface-2)] text-[var(--ak-text-secondary)]"
          )}>
            <Icon className="w-4 h-4" />
          </div>
        }
        trailing={
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] text-[var(--ak-text-muted)] whitespace-nowrap tabular-nums">
              {item.time}
            </span>
          </div>
        }
      />
    </div>
  )
})

InboxListItem.displayName = 'InboxListItem'

export function InboxDrawerWidget({ 
  activeThreadId, 
  onItemClick, 
  onToggleCommandPalette,
  externalFilters,
  onFilterChange,
  onClose
}: InboxDrawerWidgetProps) {
  const [internalFilters, setInternalFilters] = useState<{ q?: string; type?: string; channel?: string[] }>({ type: 'all' })
  const filters = useMemo(() => {
    return { ...internalFilters, ...externalFilters }
  }, [internalFilters, externalFilters])

  const { items, isLoading, isRefreshing, error, refresh, markRead } = useInboxItems(filters)
  const [isDragging, setIsDragging] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const filterButtonRef = useRef<HTMLButtonElement>(null)

  const handleItemClick = useCallback((item: InboxItem) => {
    onItemClick?.(item)
    if (item.unread) {
      markRead(item.id)
    }
  }, [onItemClick, markRead])

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
      setIsDragging(true)
    }

  const handleDragLeave = () => {
      setIsDragging(false)
    }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // Handle file drop logic here if needed
  }

  const hasUnread = useMemo(() => items.some(i => i.unread), [items])

  const demoItems: InboxItem[] = useMemo(() => ([
    { id: 'demo-1', threadId: 'demo-1', channel: 'email', sender: 'Anna Weber', title: 'Rückfrage zur Rechnung #1842', snippet: 'Könnt ihr bitte die Zahlungsfrist anpassen? Danke!', time: '09:12', unread: true, source: 'Gmail' },
    { id: 'demo-2', threadId: 'demo-2', channel: 'messenger', sender: 'Tom (WhatsApp)', title: 'Termin verschieben', snippet: 'Geht es auch morgen 14:30 statt heute?', time: '08:47', unread: true, source: 'WhatsApp' },
    { id: 'demo-3', threadId: 'demo-3', channel: 'reviews', sender: 'Google Review', title: '★★★★★ „Super Service“', snippet: 'Schnell, freundlich, ich komme wieder.', time: 'Gestern', unread: false, source: 'Google' },
    { id: 'demo-4', threadId: 'demo-4', channel: 'phone', sender: '+49 151 23456789', title: 'Anrufnotiz', snippet: 'Kunde möchte Rückruf wegen Angebot.', time: 'Gestern', unread: true, source: 'Telefon' },
    { id: 'demo-5', threadId: 'demo-5', channel: 'website', sender: 'Kontaktformular', title: 'Neue Anfrage: Preise', snippet: 'Hallo, was kostet das Paket für 10 Nutzer?', time: 'Mo', unread: false, source: 'Website' },
    { id: 'demo-6', threadId: 'demo-6', channel: 'documents', sender: 'Dokumente', title: 'PDF hochgeladen: Vertrag.pdf', snippet: 'Bitte prüfen und Zusammenfassung erstellen.', time: 'Mo', unread: true, source: 'Upload' },
    { id: 'demo-7', threadId: 'demo-7', channel: 'shopify', sender: 'Shopify', title: 'Neue Bestellung #9021', snippet: '1× Produkt A, 2× Produkt B – Versand heute?', time: 'So', unread: false, source: 'Shopify' },
    { id: 'demo-8', threadId: 'demo-8', channel: 'support', sender: 'Support', title: 'Ticket: Login funktioniert nicht', snippet: 'Nutzer bekommt „invalid token“ nach Reset.', time: 'So', unread: true, source: 'Support' },
    { id: 'demo-9', threadId: 'demo-9', channel: 'notifications', sender: 'System', title: 'Hinweis: Integration getrennt', snippet: 'Google Kalender wurde getrennt – bitte verbinden.', time: 'Sa', unread: false, source: 'System' },
    { id: 'demo-10', threadId: 'demo-10', channel: 'email', sender: 'Miriam Klein', title: 'Angebot anpassen', snippet: 'Bitte Position 3 entfernen und neu kalkulieren.', time: 'Sa', unread: true, source: 'Outlook' },
  ]), [])

  const displayItems = useMemo(() => {
    const isProd = process.env.NODE_ENV === 'production'
    if (!isProd && !isLoading && !error && items.length === 0) {
      return demoItems
    }
    return items
  }, [demoItems, error, isLoading, items])

  return (
    <div 
      className="relative h-full flex flex-col overflow-hidden bg-[var(--ak-surface-0)]"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <PaneTopbar
        rightActions={
          <>
            <button
              ref={filterButtonRef}
              className={clsx(
                "p-1.5 rounded-md transition-colors",
                isFilterOpen 
                  ? "bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-primary)]" 
                  : "hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)]"
              )}
              title="Filter"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
            
            <AkPopoverMenu
              open={isFilterOpen}
              anchorRef={filterButtonRef}
              items={[
                { label: 'Alle', onClick: () => onFilterChange?.({ type: 'all' }) },
                { label: 'Ungelesen', onClick: () => onFilterChange?.({ type: 'unread' }) },
                { label: 'E-Mail', onClick: () => onFilterChange?.({ type: 'inbox', channel: ['email'] }) },
                { label: 'Messenger', onClick: () => onFilterChange?.({ type: 'inbox', channel: ['messenger'] }) },
                { label: 'Telefon', onClick: () => onFilterChange?.({ type: 'inbox', channel: ['phone'] }) },
                { label: 'Bewertungen', onClick: () => onFilterChange?.({ type: 'inbox', channel: ['reviews'] }) },
              ]}
              onClose={() => setIsFilterOpen(false)}
              className="w-48"
            />
          </>
        }
      />

      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[9999] bg-[var(--ak-accent-inbox)]/10 backdrop-blur-sm border-2 border-[var(--ak-accent-inbox)] border-dashed m-4 rounded-3xl flex items-center justify-center pointer-events-none"
          >
            <div className="bg-[var(--ak-color-bg-surface)] p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
              <div className="h-16 w-16 bg-[var(--ak-accent-inbox-soft)] rounded-full flex items-center justify-center text-[var(--ak-accent-inbox)]">
                <CloudArrowUpIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">In Posteingang ablegen</h3>
              <p className="text-sm text-[var(--ak-color-text-secondary)]">Dokumente werden automatisch verarbeitet</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex-1 overflow-hidden relative">
        {isLoading ? (
          <div className="space-y-2 px-3 pt-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 w-full rounded-lg bg-[var(--ak-color-bg-surface-muted)] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="m-3">
            <AkAlert
              tone="danger"
              description={error}
              actions={
                <button onClick={() => refresh()} className="text-xs font-bold underline">
                  Retry
                </button>
              }
            />
          </div>
        ) : displayItems.length === 0 ? (
          <AkEmptyState
            title="Alles erledigt"
            icon={<InboxIcon className="h-6 w-6" />}
          />
        ) : (
          <Virtuoso
            style={{ height: '100%' }}
            data={displayItems}
            itemContent={(index, item) => (
              <InboxListItem 
                key={item.id} 
                item={item} 
                isActive={activeThreadId === item.id}
                onClick={handleItemClick}
              />
            )}
            className="ak-scrollbar"
          />
        )}
      </div>

      <div className="shrink-0 p-3 bg-[var(--ak-surface-1)]/50 rounded-t-xl flex gap-2">
         <AkButton
            variant="secondary" 
            onClick={() => refresh()}
            className="flex-1 justify-center text-xs"
            leftIcon={<ArrowPathIcon className={clsx("h-4 w-4", isRefreshing && "animate-spin")} />}
          >
            Refresh
          </AkButton>
          <AkButton
            variant="primary"
            accent="graphite"
            className="flex-1 justify-center text-xs"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('aklow-open-compose', { detail: { channel: 'email' } }))
            }}
            leftIcon={<PaperAirplaneIcon className="h-4 w-4" />}
          >
            Neu
          </AkButton>
      </div>
    </div>
  )
}

