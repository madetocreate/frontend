'use client'

import { ReactNode, useCallback, useState } from 'react'
import { useKeyboardShortcuts, KeyboardShortcut, formatShortcut } from '../hooks/useKeyboardShortcuts'
import {
  XMarkIcon,
  CommandLineIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  DocumentIcon,
  UserGroupIcon,
  MegaphoneIcon,
  Cog6ToothIcon,
  PlusIcon,
  BookmarkIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  MicrophoneIcon,
  PhoneIcon,
  SpeakerWaveIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  ArrowPathIcon,
  SparklesIcon,
  ArchiveBoxIcon,
  TrashIcon,
  Bars3Icon,
  RectangleStackIcon,
  ArrowsPointingOutIcon,
  InboxIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ClipboardDocumentCheckIcon,
  UserPlusIcon,
  DocumentPlusIcon,
  FunnelIcon,
  BellIcon,
} from '@heroicons/react/24/outline'
import { CommandPalette, Command } from './CommandPalette'

type KeyboardShortcutsProviderProps = {
  children: ReactNode
}

// Globale Shortcuts Definition
const GLOBAL_SHORTCUTS: Omit<KeyboardShortcut, 'action'>[] = [
  {
    key: 'k',
    ctrlOrCmd: true,
    description: 'Command Palette öffnen',
  },
  {
    key: 'n',
    ctrlOrCmd: true,
    description: 'Neue Nachricht',
  },
  {
    key: 's',
    ctrlOrCmd: true,
    description: 'Speichern',
  },
  {
    key: '/',
    description: 'Fokus auf Suche',
  },
  {
    key: 'Escape',
    description: 'Schließen / Abbrechen',
  },
  {
    key: 'ArrowUp',
    description: 'Vorherige Nachricht',
  },
  {
    key: 'ArrowDown',
    description: 'Nächste Nachricht',
  },
]

export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)

  const handleCommandPalette = useCallback(() => {
    setShowCommandPalette((prev) => !prev)
  }, [])

  const handleNewMessage = useCallback(() => {
    // Fokus auf Input-Feld setzen
    const input = document.querySelector('input[type="text"], textarea') as HTMLInputElement | HTMLTextAreaElement
    if (input) {
      input.focus()
    }
  }, [])

  const handleSave = useCallback(() => {
    // TODO: Speichern-Funktion
    console.log('Speichern')
  }, [])

  const handleFocusSearch = useCallback(() => {
    const searchInput = document.querySelector('input[placeholder*="Suchen"], input[placeholder*="suchen"]') as HTMLInputElement
    if (searchInput) {
      searchInput.focus()
    }
  }, [])

  const handleEscape = useCallback(() => {
    // Schließe offene Modals/Menüs
    const event = new CustomEvent('ak-escape-pressed')
    window.dispatchEvent(event)
    // Schließe auch die Shortcuts-Modal, falls offen
    setShowShortcuts(false)
  }, [])

  const handleShowShortcuts = useCallback(() => {
    setShowShortcuts((prev) => !prev)
  }, [])

  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'k',
        ctrlOrCmd: true,
        description: 'Command Palette öffnen',
        action: handleCommandPalette,
        preventDefault: true,
        stopPropagation: true,
      },
      {
        key: 'n',
        ctrlOrCmd: true,
        description: 'Neue Nachricht',
        action: handleNewMessage,
      },
      {
        key: 's',
        ctrlOrCmd: true,
        description: 'Speichern',
        action: handleSave,
      },
      {
        key: '/',
        description: 'Fokus auf Suche',
        action: handleFocusSearch,
      },
      {
        key: 'Escape',
        description: 'Schließen / Abbrechen',
        action: handleEscape,
      },
      {
        key: '?',
        ctrlOrCmd: true,
        description: 'Shortcuts anzeigen',
        action: handleShowShortcuts,
      },
    ],
  })

  // Helper functions for commands
  const triggerEvent = useCallback((eventName: string, detail?: Record<string, unknown>) => {
    window.dispatchEvent(new CustomEvent(eventName, { detail }))
  }, [])

  // Build commands list dynamically
  const commands: Command[] = [
    // Navigation (6)
    {
      id: 'nav-chat',
      label: 'Chat öffnen',
      description: 'Zum Chat-Modul wechseln',
      category: 'navigation',
      icon: ChatBubbleLeftRightIcon,
      keywords: ['chat', 'nachricht', 'message'],
      action: () => {
        triggerEvent('aklow-open-module', { module: 'chat' })
        setShowCommandPalette(false)
      },
    },
    {
      id: 'nav-inbox',
      label: 'Posteingang öffnen',
      description: 'Zum Posteingang wechseln',
      category: 'navigation',
      icon: PaperAirplaneIcon,
      keywords: ['posteingang', 'inbox', 'email', 'nachrichten'],
      action: () => {
        triggerEvent('aklow-open-module', { module: 'inbox' })
        setShowCommandPalette(false)
      },
    },
    {
      id: 'nav-documents',
      label: 'Dokumente öffnen',
      description: 'Zum Dokumente-Modul wechseln',
      category: 'navigation',
      icon: DocumentIcon,
      keywords: ['dokumente', 'documents', 'files'],
      action: () => {
        triggerEvent('aklow-open-module', { module: 'new2' })
        setShowCommandPalette(false)
      },
    },
    {
      id: 'nav-customers',
      label: 'Kunden öffnen',
      description: 'Zum Kunden-Modul wechseln',
      category: 'navigation',
      icon: UserGroupIcon,
      keywords: ['kunden', 'customers', 'kontakte'],
      action: () => {
        triggerEvent('aklow-open-module', { module: 'automation' })
        setShowCommandPalette(false)
      },
    },
    {
      id: 'nav-growth',
      label: 'Wachstum öffnen',
      description: 'Zum Wachstum-Modul wechseln',
      category: 'navigation',
      icon: MegaphoneIcon,
      keywords: ['wachstum', 'growth', 'analytics'],
      action: () => {
        triggerEvent('aklow-open-module', { module: 'new1' })
        setShowCommandPalette(false)
      },
    },
    {
      id: 'nav-settings',
      label: 'Einstellungen öffnen',
      description: 'Zu den Einstellungen wechseln',
      category: 'navigation',
      icon: Cog6ToothIcon,
      keywords: ['einstellungen', 'settings', 'config'],
      action: () => {
        triggerEvent('aklow-open-module', { module: 'settings' })
        setShowCommandPalette(false)
      },
    },
    // Voice & Audio (3)
    {
      id: 'voice-dictation',
      label: 'Diktat starten/stoppen',
      description: 'Diktat-Modus ein- oder ausschalten',
      category: 'action',
      icon: MicrophoneIcon,
      keywords: ['diktat', 'dictation', 'sprache', 'voice', 'mikrofon'],
      action: () => {
        triggerEvent('aklow-toggle-dictation')
        setShowCommandPalette(false)
      },
    },
    {
      id: 'voice-realtime',
      label: 'Real-time Modus starten/stoppen',
      description: 'Live-Conversation ein- oder ausschalten',
      category: 'action',
      icon: PhoneIcon,
      keywords: ['realtime', 'live', 'gespräch', 'conversation'],
      action: () => {
        triggerEvent('aklow-toggle-realtime')
        setShowCommandPalette(false)
      },
    },
    {
      id: 'voice-stop-tts',
      label: 'Vorlesen stoppen',
      description: 'Stoppt aktuelles Text-to-Speech',
      category: 'action',
      icon: SpeakerWaveIcon,
      keywords: ['vorlesen', 'stop', 'tts', 'audio', 'stoppen'],
      action: () => {
        triggerEvent('aklow-stop-tts')
        setShowCommandPalette(false)
      },
    },
    // Message Actions (6)
    {
      id: 'message-copy',
      label: 'Nachricht kopieren',
      description: 'Kopiert letzte Assistant-Nachricht',
      category: 'action',
      icon: DocumentDuplicateIcon,
      keywords: ['kopieren', 'copy', 'clipboard', 'nachricht'],
      shortcut: '⌘C',
      action: () => {
        triggerEvent('aklow-copy-message')
        setShowCommandPalette(false)
      },
    },
    {
      id: 'message-edit',
      label: 'Nachricht bearbeiten',
      description: 'Bearbeitet letzte User-Nachricht',
      category: 'action',
      icon: PencilIcon,
      keywords: ['bearbeiten', 'edit', 'ändern', 'nachricht'],
      action: () => {
        triggerEvent('aklow-edit-message')
        setShowCommandPalette(false)
      },
    },
    {
      id: 'message-save',
      label: 'Nachricht speichern',
      description: 'Speichert Assistant-Nachricht ins Memory',
      category: 'action',
      icon: BookmarkIcon,
      keywords: ['speichern', 'save', 'memory', 'nachricht'],
      action: () => {
        triggerEvent('aklow-save-message')
        setShowCommandPalette(false)
      },
    },
    {
      id: 'message-update',
      label: 'Nachricht aktualisieren',
      description: 'Regeneriert Assistant-Antwort',
      category: 'action',
      icon: ArrowPathIcon,
      keywords: ['aktualisieren', 'update', 'regenerieren', 'neu'],
      action: () => {
        triggerEvent('aklow-update-message')
        setShowCommandPalette(false)
      },
    },
    {
      id: 'message-read',
      label: 'Nachricht vorlesen',
      description: 'Startet Text-to-Speech für Assistant-Nachricht',
      category: 'action',
      icon: SpeakerWaveIcon,
      keywords: ['vorlesen', 'read', 'tts', 'audio'],
      action: () => {
        triggerEvent('aklow-read-message')
        setShowCommandPalette(false)
      },
    },
    {
      id: 'message-quick-actions',
      label: 'Schnellaktionen öffnen',
      description: 'Öffnet Quick Actions Menu',
      category: 'action',
      icon: SparklesIcon,
      keywords: ['schnellaktionen', 'quick', 'actions', 'sparkles'],
      action: () => {
        triggerEvent('aklow-open-quick-actions')
        setShowCommandPalette(false)
      },
    },
    // Thread Management (4)
    {
      id: 'thread-archive',
      label: 'Thread archivieren',
      description: 'Archiviert aktuellen Chat-Thread',
      category: 'action',
      icon: ArchiveBoxIcon,
      keywords: ['archivieren', 'archive', 'verstecken', 'thread'],
      action: () => {
        triggerEvent('aklow-archive-thread')
        setShowCommandPalette(false)
      },
    },
    {
      id: 'thread-delete',
      label: 'Thread löschen',
      description: 'Löscht aktuellen Chat-Thread',
      category: 'action',
      icon: TrashIcon,
      keywords: ['löschen', 'delete', 'entfernen', 'thread'],
      action: () => {
        triggerEvent('aklow-delete-thread')
        setShowCommandPalette(false)
      },
    },
    {
      id: 'thread-rename',
      label: 'Thread umbenennen',
      description: 'Benennt aktuellen Thread um',
      category: 'action',
      icon: PencilIcon,
      keywords: ['umbenennen', 'rename', 'name', 'thread'],
      action: () => {
        triggerEvent('aklow-rename-thread')
        setShowCommandPalette(false)
      },
    },
    {
      id: 'thread-search',
      label: 'Thread durchsuchen',
      description: 'Fokus auf Thread-Suche',
      category: 'action',
      icon: MagnifyingGlassIcon,
      keywords: ['thread', 'suche', 'search', 'finden'],
      action: () => {
        triggerEvent('aklow-focus-thread-search')
        setShowCommandPalette(false)
      },
    },
    // UI Controls (3)
    {
      id: 'ui-toggle-sidebar',
      label: 'Sidebar ein/ausblenden',
      description: 'Blendet linke Sidebar ein oder aus',
      category: 'action',
      icon: Bars3Icon,
      keywords: ['sidebar', 'panel', 'einblenden', 'ausblenden'],
      action: () => {
        triggerEvent('aklow-toggle-sidebar')
        setShowCommandPalette(false)
      },
    },
    {
      id: 'ui-toggle-drawer',
      label: 'Drawer ein/ausblenden',
      description: 'Blendet rechten Drawer ein oder aus',
      category: 'action',
      icon: RectangleStackIcon,
      keywords: ['drawer', 'details', 'panel'],
      action: () => {
        triggerEvent('aklow-toggle-drawer')
        setShowCommandPalette(false)
      },
    },
    {
      id: 'ui-fullscreen',
      label: 'Vollbild-Modus',
      description: 'Wechselt in Vollbild-Modus',
      category: 'action',
      icon: ArrowsPointingOutIcon,
      keywords: ['vollbild', 'fullscreen', 'maximieren'],
      action: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen()
        } else {
          document.exitFullscreen()
        }
        setShowCommandPalette(false)
      },
    },
    // Quick Actions (8)
    {
      id: 'quick-inbox-summary',
      label: 'Posteingang zusammenfassen',
      description: 'Erhalte eine Übersicht über E-Mails, Nachrichten und Bewertungen',
      category: 'action',
      icon: InboxIcon,
      keywords: ['posteingang', 'inbox', 'zusammenfassen', 'summary'],
      action: () => {
        triggerEvent('aklow-send-quick-action', { actionId: 'inbox_summary' })
        setShowCommandPalette(false)
      },
    },
    {
      id: 'quick-reply-suggestion',
      label: 'Antwort vorschlagen',
      description: 'Lass dir eine Antwort auf eine E-Mail oder Nachricht vorschlagen',
      category: 'action',
      icon: ChatBubbleLeftRightIcon,
      keywords: ['antwort', 'reply', 'vorschlag', 'suggestion'],
      action: () => {
        triggerEvent('aklow-send-quick-action', { actionId: 'reply_suggestion' })
        setShowCommandPalette(false)
      },
    },
    {
      id: 'quick-deep-research',
      label: 'Deep Research starten',
      description: 'Starte eine tiefe Recherche zu einer komplexen Frage oder einem Thema',
      category: 'action',
      icon: SparklesIcon,
      keywords: ['research', 'recherche', 'deep', 'tief'],
      action: () => {
        triggerEvent('aklow-send-quick-action', { actionId: 'deep_research' })
        setShowCommandPalette(false)
      },
    },
    {
      id: 'quick-document-analysis',
      label: 'Dokument analysieren',
      description: 'Lass dir lange Dokumente, PDFs oder Notizen kurz und verständlich zusammenfassen',
      category: 'action',
      icon: DocumentTextIcon,
      keywords: ['dokument', 'analyse', 'pdf', 'zusammenfassen'],
      action: () => {
        triggerEvent('aklow-send-quick-action', { actionId: 'document_analysis' })
        setShowCommandPalette(false)
      },
    },
    {
      id: 'quick-call-summary',
      label: 'Call zusammenfassen',
      description: 'Fasse Telefonate oder Meetings aus deinen Notizen oder Transkripten zusammen',
      category: 'action',
      icon: PhoneIcon,
      keywords: ['call', 'gespräch', 'meeting', 'zusammenfassen'],
      action: () => {
        triggerEvent('aklow-send-quick-action', { actionId: 'call_summary' })
        setShowCommandPalette(false)
      },
    },
    {
      id: 'quick-crm-preparation',
      label: 'CRM-Eintrag vorbereiten',
      description: 'Strukturiere Informationen aus Chats oder E-Mails zu einem sauberen CRM-Eintrag',
      category: 'action',
      icon: UserCircleIcon,
      keywords: ['crm', 'eintrag', 'kunde', 'vorbereiten'],
      action: () => {
        triggerEvent('aklow-send-quick-action', { actionId: 'crm_preparation' })
        setShowCommandPalette(false)
      },
    },
    {
      id: 'quick-task-extraction',
      label: 'To-dos extrahieren',
      description: 'Erkenne Aufgaben, Deadlines und Verantwortliche aus langen Texten oder Threads',
      category: 'action',
      icon: ClipboardDocumentCheckIcon,
      keywords: ['todo', 'aufgabe', 'extrahieren', 'tasks'],
      action: () => {
        triggerEvent('aklow-send-quick-action', { actionId: 'task_extraction' })
        setShowCommandPalette(false)
      },
    },
    {
      id: 'quick-automation-suggestion',
      label: 'Automatisierung vorschlagen',
      description: 'Lass dir Automatisierungen basierend auf deinen Workflows vorschlagen',
      category: 'action',
      icon: Cog6ToothIcon,
      keywords: ['automatisierung', 'automation', 'workflow'],
      action: () => {
        triggerEvent('aklow-send-quick-action', { actionId: 'automation_suggestion' })
        setShowCommandPalette(false)
      },
    },
    // Module-specific Actions (5)
    {
      id: 'module-new-customer',
      label: 'Neuen Kunden erstellen',
      description: 'Erstellt einen neuen Kunden im CRM',
      category: 'action',
      icon: UserPlusIcon,
      keywords: ['kunde', 'customer', 'neu', 'erstellen', 'crm'],
      action: () => {
        triggerEvent('aklow-open-module', { module: 'automation' })
        triggerEvent('aklow-create-customer')
        setShowCommandPalette(false)
      },
    },
    {
      id: 'module-new-document',
      label: 'Neues Dokument erstellen',
      description: 'Erstellt ein neues Dokument',
      category: 'action',
      icon: DocumentPlusIcon,
      keywords: ['dokument', 'document', 'neu', 'erstellen'],
      action: () => {
        triggerEvent('aklow-open-module', { module: 'new2' })
        triggerEvent('aklow-create-document')
        setShowCommandPalette(false)
      },
    },
    {
      id: 'module-new-campaign',
      label: 'Neue Kampagne starten',
      description: 'Startet eine neue Marketing-Kampagne',
      category: 'action',
      icon: MegaphoneIcon,
      keywords: ['kampagne', 'campaign', 'neu', 'starten', 'marketing'],
      action: () => {
        triggerEvent('aklow-open-module', { module: 'new1' })
        triggerEvent('aklow-create-campaign')
        setShowCommandPalette(false)
      },
    },
    {
      id: 'module-filter-inbox',
      label: 'Filter anwenden',
      description: 'Öffnet Filter-Menü im Posteingang',
      category: 'action',
      icon: FunnelIcon,
      keywords: ['filter', 'filtern', 'suchen', 'posteingang'],
      action: () => {
        triggerEvent('aklow-open-module', { module: 'inbox' })
        triggerEvent('aklow-open-filter')
        setShowCommandPalette(false)
      },
    },
    {
      id: 'module-notifications',
      label: 'Benachrichtigungen anzeigen',
      description: 'Öffnet Benachrichtigungen',
      category: 'action',
      icon: BellIcon,
      keywords: ['benachrichtigungen', 'notifications', 'alerts'],
      action: () => {
        triggerEvent('aklow-open-module', { module: 'inbox' })
        triggerEvent('aklow-show-notifications')
        setShowCommandPalette(false)
      },
    },
    // Basic Actions (existing)
    {
      id: 'action-new-message',
      label: 'Neue Nachricht',
      description: 'Neue Chat-Nachricht erstellen',
      category: 'action',
      icon: PlusIcon,
      keywords: ['neu', 'new', 'nachricht', 'message'],
      shortcut: '⌘N',
      action: () => {
        handleNewMessage()
        setShowCommandPalette(false)
      },
    },
    {
      id: 'action-save',
      label: 'Speichern',
      description: 'Aktuellen Inhalt speichern',
      category: 'action',
      icon: BookmarkIcon,
      keywords: ['speichern', 'save', 'speichern'],
      shortcut: '⌘S',
      action: () => {
        handleSave()
        setShowCommandPalette(false)
      },
    },
    {
      id: 'action-focus-search',
      label: 'Suche fokussieren',
      description: 'Fokus auf Suchfeld setzen',
      category: 'action',
      icon: MagnifyingGlassIcon,
      keywords: ['suche', 'search', 'finden'],
      shortcut: '/',
      action: () => {
        handleFocusSearch()
        setShowCommandPalette(false)
      },
    },
    {
      id: 'action-new-chat',
      label: 'Neuer Chat',
      description: 'Neuen Chat-Thread erstellen',
      category: 'action',
      icon: ChatBubbleLeftRightIcon,
      keywords: ['chat', 'thread', 'neu'],
      action: () => {
        triggerEvent('aklow-new-chat')
        setShowCommandPalette(false)
      },
    },
    // Settings
    {
      id: 'action-show-shortcuts',
      label: 'Tastenkombinationen anzeigen',
      description: 'Liste aller verfügbaren Shortcuts',
      category: 'settings',
      icon: QuestionMarkCircleIcon,
      keywords: ['shortcuts', 'tastenkombinationen', 'keyboard'],
      shortcut: '⌘?',
      action: () => {
        setShowShortcuts(true)
        setShowCommandPalette(false)
      },
    },
  ]

  return (
    <>
      {children}
      {showShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        commands={commands}
      />
    </>
  )
}

type KeyboardShortcutsModalProps = {
  onClose: () => void
}

function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  const shortcuts = GLOBAL_SHORTCUTS

  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'Escape',
        action: onClose,
      },
      {
        key: '?',
        ctrlOrCmd: true,
        action: onClose,
      },
    ],
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-lg border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--ak-color-border-subtle)] px-6 py-4">
          <div className="flex items-center gap-3">
            <CommandLineIcon className="h-5 w-5 text-[var(--ak-color-text-primary)]" />
            <h2 className="ak-heading text-lg">Tastenkombinationen</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded text-[var(--ak-color-text-secondary)] transition-colors hover:bg-[var(--ak-color-bg-hover)] hover:text-[var(--ak-color-text-primary)]"
            aria-label="Schließen"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-[var(--ak-color-border-subtle)] pb-3 last:border-0"
              >
                <span className="ak-body text-sm text-[var(--ak-color-text-primary)]">
                  {shortcut.description}
                </span>
                <kbd className="inline-flex items-center gap-1 rounded border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-2.5 py-1 text-xs font-mono text-[var(--ak-color-text-primary)]">
                  {formatShortcut(shortcut)}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--ak-color-border-subtle)] px-6 py-3">
          <p className="ak-caption text-center text-[var(--ak-color-text-secondary)]">
            Drücke <kbd className="rounded border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-1.5 py-0.5 text-[10px] font-mono">{formatShortcut({ key: '?', ctrlOrCmd: true })}</kbd> oder <kbd className="rounded border border-[var(--ak-color-border-subtle)] bg-[var(--ak-color-bg-surface-muted)] px-1.5 py-0.5 text-[10px] font-mono">Esc</kbd> zum Schließen
          </p>
        </div>
      </div>
    </div>
  )
}

