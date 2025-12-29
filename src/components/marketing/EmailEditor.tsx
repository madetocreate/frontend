'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, Reorder } from 'framer-motion'
import {
  Type,
  Image,
  Square,
  Columns,
  Minus,
  ArrowUp,
  MousePointer,
  Trash2,
  Copy,
  Settings,
  Palette,
  Eye,
  Code,
  Smartphone,
  Monitor,
  Save,
  Undo,
  Redo,
  Plus,
  GripVertical,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Link,
  Signal,
  Wifi,
  Battery,
} from 'lucide-react'

// Types
interface EmailBlock {
  id: string
  type: 'header' | 'hero' | 'text' | 'image' | 'button' | 'columns' | 'divider' | 'spacer' | 'footer'
  content: Record<string, unknown>
}

interface EmailTheme {
  primaryColor: string
  secondaryColor: string
  textColor: string
  backgroundColor: string
  contentBackground: string
  fontFamily: string
  borderRadius: string
}

interface EmailEditorProps {
  initialBlocks?: EmailBlock[]
  initialTheme?: Partial<EmailTheme>
  onSave?: (blocks: EmailBlock[], theme: EmailTheme) => void
  onPreview?: (html: string) => void
}

const DEFAULT_THEME: EmailTheme = {
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  textColor: '#333333',
  backgroundColor: '#f5f5f5',
  contentBackground: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  borderRadius: '8px',
}

const BLOCK_TYPES = [
  { type: 'header', icon: Type, label: 'Header' },
  { type: 'hero', icon: Square, label: 'Hero' },
  { type: 'text', icon: Type, label: 'Text' },
  { type: 'image', icon: Image, label: 'Bild' },
  { type: 'button', icon: MousePointer, label: 'Button' },
  { type: 'columns', icon: Columns, label: 'Spalten' },
  { type: 'divider', icon: Minus, label: 'Trenner' },
  { type: 'spacer', icon: ArrowUp, label: 'Abstand' },
  { type: 'footer', icon: Type, label: 'Footer' },
]

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function createDefaultBlock(type: EmailBlock['type']): EmailBlock {
  const defaults: Record<string, Record<string, unknown>> = {
    header: {
      logoUrl: '',
      backgroundColor: '#6366f1',
    },
    hero: {
      headline: 'Willkommen',
      subheadline: 'Ihre Nachricht hier',
      ctaText: 'Jetzt starten',
      ctaUrl: '#',
      backgroundColor: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    },
    text: {
      heading: '',
      content: 'Ihr Text hier...',
      padding: '32px 24px',
    },
    image: {
      src: 'https://placehold.co/600x300/6366f1/white?text=Bild',
      alt: 'Bild',
      width: '100%',
      link: '',
    },
    button: {
      text: 'Klick hier',
      url: '#',
      backgroundColor: '#6366f1',
      textColor: '#ffffff',
      align: 'center',
    },
    columns: {
      columns: [
        { heading: 'Spalte 1', content: 'Inhalt 1' },
        { heading: 'Spalte 2', content: 'Inhalt 2' },
      ],
    },
    divider: {
      color: '#e5e7eb',
    },
    spacer: {
      height: '24px',
    },
    footer: {
      companyName: 'Ihr Unternehmen',
      address: 'Musterstraße 1, 12345 Musterstadt',
      unsubscribeUrl: '#',
      preferencesUrl: '',
    },
  }

  return {
    id: generateId(),
    type,
    content: defaults[type] || {},
  }
}

const EMAIL_TEMPLATES = [
  {
    name: 'Newsletter',
    blocks: [createDefaultBlock('header'), createDefaultBlock('hero'), createDefaultBlock('text'), createDefaultBlock('footer')]
  },
  {
    name: 'Produktankündigung',
    blocks: [createDefaultBlock('header'), createDefaultBlock('image'), createDefaultBlock('text'), createDefaultBlock('button'), createDefaultBlock('footer')]
  },
]

export function EmailEditor({
  initialBlocks = [],
  initialTheme,
  onSave,
  onPreview,
}: EmailEditorProps) {
  const [blocks, setBlocks] = useState<EmailBlock[]>(
    initialBlocks.length > 0
      ? initialBlocks
      : [createDefaultBlock('hero'), createDefaultBlock('text'), createDefaultBlock('button')]
  )
  // Undo/Redo Stack
  const [history, setHistory] = useState<EmailBlock[][]>([initialBlocks.length > 0 ? initialBlocks : [createDefaultBlock('hero'), createDefaultBlock('text'), createDefaultBlock('button')]])
  const [historyIndex, setHistoryIndex] = useState(0)

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [theme, setTheme] = useState<EmailTheme>({ ...DEFAULT_THEME, ...initialTheme })
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [sidebarTab, setSidebarTab] = useState<'blocks' | 'theme' | 'templates'>('blocks')

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId)

  // Helper to update state with history
  const updateBlocksWithHistory = (newBlocks: EmailBlock[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newBlocks)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    setBlocks(newBlocks)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setBlocks(history[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setBlocks(history[historyIndex + 1])
    }
  }

  // Keyboard Shortcuts
  useState(() => {
    if (typeof window !== 'undefined') {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case 's':
              e.preventDefault()
              handleSave()
              break
            case 'z':
              e.preventDefault()
              if (e.shiftKey) redo()
              else undo()
              break
          }
        }
      }
      window.addEventListener('keydown', handleKeyPress)
      return () => window.removeEventListener('keydown', handleKeyPress)
    }
  })

  const addBlock = useCallback((type: EmailBlock['type']) => {
    const newBlock = createDefaultBlock(type)
    const newBlocks = [...blocks, newBlock]
    updateBlocksWithHistory(newBlocks)
    setSelectedBlockId(newBlock.id)
  }, [blocks, history, historyIndex])

  const updateBlock = useCallback((id: string, content: Record<string, unknown>) => {
    const newBlocks = blocks.map((b) => (b.id === id ? { ...b, content: { ...b.content, ...content } } : b))
    updateBlocksWithHistory(newBlocks)
  }, [blocks, history, historyIndex])

  const deleteBlock = useCallback((id: string) => {
    const newBlocks = blocks.filter((b) => b.id !== id)
    updateBlocksWithHistory(newBlocks)
    setSelectedBlockId(null)
  }, [blocks, history, historyIndex])

  const duplicateBlock = useCallback((id: string) => {
    const index = blocks.findIndex((b) => b.id === id)
    if (index === -1) return
    const block = blocks[index]
    const newBlock = { ...block, id: generateId() }
    const newBlocks = [...blocks]
    newBlocks.splice(index + 1, 0, newBlock)
    updateBlocksWithHistory(newBlocks)
  }, [blocks, history, historyIndex])

  const applyTemplate = (templateBlocks: EmailBlock[]) => {
    // Generate new IDs for template blocks
    const newBlocks = templateBlocks.map(b => ({
      ...b,
      id: generateId()
    }))
    updateBlocksWithHistory(newBlocks)
  }

  const handleSave = () => {
    if (onSave) {
      onSave(blocks, theme)
    }
  }

  const renderBlockPreview = (block: EmailBlock) => {
    const content = block.content as Record<string, string>

    switch (block.type) {
      case 'header':
        return (
          <div
            className="p-6 text-center"
            style={{ backgroundColor: content.backgroundColor || theme.primaryColor }}
          >
            {content.logoUrl ? (
              <img src={content.logoUrl} alt="Logo" className="h-12 mx-auto" />
            ) : (
              <div className="text-[var(--ak-color-text-inverted)] font-bold">LOGO</div>
            )}
          </div>
        )

      case 'hero':
        return (
          <div
            className="p-12 text-center text-[var(--ak-color-text-inverted)]"
            style={{ background: content.backgroundColor }}
          >
            <h1 className="text-3xl font-bold mb-2">{content.headline}</h1>
            <p className="text-lg opacity-90 mb-6">{content.subheadline}</p>
            {content.ctaText && (
              <button className="px-6 py-3 bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-primary)] rounded-lg font-semibold border border-[var(--ak-color-border-subtle)]">
                {content.ctaText}
              </button>
            )}
          </div>
        )

      case 'text':
        return (
          <div className="p-6" style={{ padding: content.padding }}>
            {content.heading && (
              <h2 className="text-xl font-semibold mb-4">{content.heading}</h2>
            )}
            <p className="text-[var(--ak-color-text-secondary)]">{content.content}</p>
          </div>
        )

      case 'image':
        return (
          <div className="text-center">
            <img
              src={content.src}
              alt={content.alt}
              className="max-w-full"
              style={{ width: content.width }}
            />
          </div>
        )

      case 'button':
        return (
          <div className="p-6" style={{ textAlign: content.align as 'left' | 'center' | 'right' }}>
            <button
              className="px-6 py-3 rounded-lg font-semibold"
              style={{
                backgroundColor: content.backgroundColor,
                color: content.textColor,
              }}
            >
              {content.text}
            </button>
          </div>
        )

      case 'columns':
        const cols = (content.columns as any as Array<{ heading: string; content: string }>) || []
        return (
          <div className="p-6 grid gap-4" style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}>
            {cols.map((col, i) => (
              <div key={i} className="text-center">
                <h3 className="font-semibold mb-2">{col.heading}</h3>
                <p className="text-sm text-[var(--ak-color-text-secondary)]">{col.content}</p>
              </div>
            ))}
          </div>
        )

      case 'divider':
        return (
          <div className="px-6 py-4">
            <hr style={{ borderColor: content.color }} />
          </div>
        )

      case 'spacer':
        return <div style={{ height: content.height }} />

      case 'footer':
        return (
        <div className="p-6 text-center text-[var(--ak-color-text-secondary)] text-sm bg-[var(--ak-color-bg-surface)]/90 border-t border-[var(--ak-color-border-fine)]">
            <p className="mb-2">© 2024 {content.companyName}</p>
            <p className="text-xs">{content.address}</p>
            <p className="mt-2">
              <a href="#" className="text-[var(--ak-color-text-secondary)] underline">
                Abmelden
              </a>
            </p>
        </div>
        )

      default:
        return <div className="p-4 bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)]">Block: {block.type}</div>
    }
  }

  const renderBlockEditor = () => {
    if (!selectedBlock) {
      return (
    <div className="p-6 text-center text-[var(--ak-color-text-secondary)]">
          Wähle einen Block aus, um ihn zu bearbeiten
        </div>
      )
    }

    const content = selectedBlock.content as Record<string, string>

    switch (selectedBlock.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Überschrift</label>
              <input
                type="text"
                value={content.headline || ''}
                onChange={(e) => updateBlock(selectedBlock.id, { headline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/70 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Unterzeile</label>
              <input
                type="text"
                value={content.subheadline || ''}
                onChange={(e) => updateBlock(selectedBlock.id, { subheadline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/70 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Button Text</label>
              <input
                type="text"
                value={content.ctaText || ''}
                onChange={(e) => updateBlock(selectedBlock.id, { ctaText: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)]/70 border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Button URL</label>
              <input
                type="text"
                value={content.ctaUrl || ''}
                onChange={(e) => updateBlock(selectedBlock.id, { ctaUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--ak-color-text-inverted)]"
              />
            </div>
          </div>
        )

      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Überschrift (optional)</label>
              <input
                type="text"
                value={content.heading || ''}
                onChange={(e) => updateBlock(selectedBlock.id, { heading: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--ak-color-text-inverted)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Text</label>
              <textarea
                value={content.content || ''}
                onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--ak-color-text-inverted)] resize-none"
              />
            </div>
          </div>
        )

      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Button Text</label>
              <input
                type="text"
                value={content.text || ''}
                onChange={(e) => updateBlock(selectedBlock.id, { text: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--ak-color-text-inverted)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">URL</label>
              <input
                type="text"
                value={content.url || ''}
                onChange={(e) => updateBlock(selectedBlock.id, { url: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--ak-color-text-inverted)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Hintergrundfarbe</label>
              <input
                type="color"
                value={content.backgroundColor || '#6366f1'}
                onChange={(e) =>
                  updateBlock(selectedBlock.id, { backgroundColor: e.target.value })
                }
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Ausrichtung</label>
              <div className="flex gap-2">
                {['left', 'center', 'right'].map((align) => (
                  <button
                    key={align}
                    onClick={() => updateBlock(selectedBlock.id, { align })}
                    className={`
                      flex-1 px-3 py-2 rounded-lg border transition-colors
                      ${
                        content.align === align
                          ? 'border-[var(--ak-color-accent)] bg-[var(--ak-color-accent-soft)] text-[var(--ak-color-accent-strong)]'
                          : 'border-[var(--ak-color-border-fine)] text-[var(--ak-color-text-muted)] hover:border-[var(--ak-color-border-subtle)]'
                      }
                    `}
                  >
                    {align === 'left' && <AlignLeft className="w-4 h-4 mx-auto" />}
                    {align === 'center' && <AlignCenter className="w-4 h-4 mx-auto" />}
                    {align === 'right' && <AlignRight className="w-4 h-4 mx-auto" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Bild URL</label>
              <input
                type="text"
                value={content.src || ''}
                onChange={(e) => updateBlock(selectedBlock.id, { src: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--ak-color-text-inverted)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Alt-Text</label>
              <input
                type="text"
                value={content.alt || ''}
                onChange={(e) => updateBlock(selectedBlock.id, { alt: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--ak-color-text-inverted)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Link (optional)</label>
              <input
                type="text"
                value={content.link || ''}
                onChange={(e) => updateBlock(selectedBlock.id, { link: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--ak-color-text-inverted)]"
              />
            </div>
          </div>
        )

      case 'spacer':
        return (
          <div>
            <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Höhe</label>
            <select
              value={content.height || '24px'}
              onChange={(e) => updateBlock(selectedBlock.id, { height: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--ak-color-text-inverted)]"
            >
              <option value="16px">Klein (16px)</option>
              <option value="24px">Mittel (24px)</option>
              <option value="48px">Groß (48px)</option>
              <option value="64px">Sehr groß (64px)</option>
            </select>
          </div>
        )

      case 'footer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Firmenname</label>
              <input
                type="text"
                value={content.companyName || ''}
                onChange={(e) => updateBlock(selectedBlock.id, { companyName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--ak-color-text-inverted)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Adresse</label>
              <input
                type="text"
                value={content.address || ''}
                onChange={(e) => updateBlock(selectedBlock.id, { address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--ak-color-text-inverted)]"
              />
            </div>
          </div>
        )

      default:
        return (
        <div className="p-4 text-[var(--ak-color-text-secondary)]">
            Keine Bearbeitungsoptionen für diesen Blocktyp
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-[var(--ak-color-bg-app)]">
      {/* Sidebar */}
      <div className="w-80 bg-[var(--ak-color-bg-sidebar)] border-r border-[var(--ak-color-border-fine)] flex flex-col">
        {/* Sidebar Tabs */}
        <div className="flex border-b border-[var(--ak-color-border-fine)]">
          <button
            onClick={() => setSidebarTab('blocks')}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors
              ${sidebarTab === 'blocks' ? 'text-[var(--ak-color-text-primary)] border-b-2 border-[var(--ak-color-accent)]' : 'text-[var(--ak-color-text-muted)]'}
            `}
          >
            Blöcke
          </button>
          <button
            onClick={() => setSidebarTab('theme')}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors
              ${sidebarTab === 'theme' ? 'text-[var(--ak-color-text-primary)] border-b-2 border-[var(--ak-color-accent)]' : 'text-[var(--ak-color-text-muted)]'}
            `}
          >
            Design
          </button>
          <button
            onClick={() => setSidebarTab('templates')}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors
              ${sidebarTab === 'templates' ? 'text-[var(--ak-color-text-primary)] border-b-2 border-[var(--ak-color-accent)]' : 'text-[var(--ak-color-text-muted)]'}
            `}
          >
            Vorlagen
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {sidebarTab === 'blocks' ? (
            <>
              {/* Block Library */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-[var(--ak-color-text-muted)] mb-3">Blöcke hinzufügen</h3>
                <div className="grid grid-cols-3 gap-2">
                  {BLOCK_TYPES.map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      onClick={() => addBlock(type as EmailBlock['type'])}
                      className="
                        flex flex-col items-center gap-1 p-3 rounded-[var(--ak-radius-lg)]
                        bg-[var(--ak-color-bg-surface-muted)] border border-[var(--ak-color-border-fine)]
                        hover:bg-[var(--ak-color-bg-hover)] hover:border-[var(--ak-color-border-subtle)]
                        text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)]
                        transition-colors
                      "
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Block Editor */}
              {selectedBlock && (
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-[var(--ak-color-text-inverted)]">
                      {BLOCK_TYPES.find((b) => b.type === selectedBlock.type)?.label || 'Block'}
                    </h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => duplicateBlock(selectedBlock.id)}
                        className="p-1.5 rounded hover:bg-[var(--ak-color-bg-surface)]/70 text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteBlock(selectedBlock.id)}
                        className="p-1.5 rounded hover:bg-[var(--ak-semantic-danger-soft)] text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-semantic-danger)] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {renderBlockEditor()}
                </div>
              )}
            </>
          ) : sidebarTab === 'templates' ? (
            /* Template Library */
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[var(--ak-color-text-secondary)]">Vorlagen auswählen</h3>
              <div className="grid gap-3">
                {EMAIL_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    onClick={() => applyTemplate(tpl.blocks)}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-left transition-colors"
                  >
                    <div className="font-medium text-[var(--ak-color-text-inverted)] mb-1">{tpl.name}</div>
                    <div className="text-xs text-[var(--ak-color-text-muted)]">{tpl.blocks.length} Blöcke</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Theme Editor */
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Primärfarbe</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--ak-color-text-inverted)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Sekundärfarbe</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.secondaryColor}
                    onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.secondaryColor}
                    onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--ak-color-text-inverted)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Hintergrund</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.backgroundColor}
                    onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--ak-color-text-inverted)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Schriftart</label>
                <select
                  value={theme.fontFamily}
                  onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--ak-color-text-inverted)]"
                >
                  <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
                    System
                  </option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Courier New', monospace">Courier</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--ak-color-text-secondary)] mb-1">Eckenradius</label>
                <select
                  value={theme.borderRadius}
                  onChange={(e) => setTheme({ ...theme, borderRadius: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[var(--ak-color-text-inverted)]"
                >
                  <option value="0">Keine</option>
                  <option value="4px">Klein</option>
                  <option value="8px">Mittel</option>
                  <option value="16px">Groß</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--ak-color-border-fine)] bg-[var(--ak-color-bg-surface)]/50">
          <div className="flex items-center gap-2">
            <button 
              onClick={undo}
              disabled={historyIndex === 0}
              className="p-2 rounded hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)] disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button 
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              className="p-2 rounded hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)] disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('desktop')}
              className={`
                p-2 rounded transition-colors
                ${viewMode === 'desktop' ? 'bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-primary)]' : 'text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)]'}
              `}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`
                p-2 rounded transition-colors
                ${viewMode === 'mobile' ? 'bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-primary)]' : 'text-[var(--ak-color-text-muted)] hover:text-[var(--ak-color-text-primary)]'}
              `}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--ak-radius-md)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)]">
              <Eye className="w-4 h-4" />
              Vorschau
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--ak-radius-md)] bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)]">
              <Code className="w-4 h-4" />
              HTML
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-1.5 rounded-[var(--ak-radius-md)] bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)] hover:opacity-90 shadow-sm"
            >
              <Save className="w-4 h-4" />
              Speichern
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div
          className="flex-1 overflow-y-auto p-8"
          style={{ backgroundColor: theme.backgroundColor }}
        >
              <div
                className={`
                  mx-auto transition-all bg-[var(--ak-color-bg-surface)] relative
                  ${viewMode === 'mobile' ? 'max-w-[375px] shadow-[var(--ak-shadow-strong)] my-8 border-8 border-[var(--ak-color-border-subtle)] rounded-[var(--ak-radius-3xl)]' : 'max-w-[600px] my-8'}
                `}
            style={{
              backgroundColor: theme.contentBackground,
              borderRadius: viewMode === 'mobile' ? '2.5rem' : theme.borderRadius,
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            {viewMode === 'mobile' && (
              <div className="bg-[var(--ak-color-bg-surface)]/80 px-6 py-3 flex items-center justify-between absolute top-0 left-0 right-0 z-10 rounded-t-[2rem]">
                <div className="flex items-center gap-2">
                  <div className="w-12 text-xs text-[var(--ak-color-text-inverted)] font-medium">9:41</div>
                </div>
                <div className="w-20 h-5 bg-[var(--ak-color-bg-surface)]/80 rounded-b-xl absolute left-1/2 -translate-x-1/2 top-0"></div>
                <div className="flex items-center gap-1.5">
                  <Signal className="w-3.5 h-3.5 text-[var(--ak-color-text-inverted)]" />
                  <Wifi className="w-3.5 h-3.5 text-[var(--ak-color-text-inverted)]" />
                  <Battery className="w-4 h-4 text-[var(--ak-color-text-inverted)]" />
                </div>
              </div>
            )}

            <div className={`${viewMode === 'mobile' ? 'pt-12 pb-8 h-[750px] overflow-y-auto no-scrollbar' : ''}`}>
              <Reorder.Group
                axis="y"
                values={blocks}
                onReorder={(newBlocks) => updateBlocksWithHistory(newBlocks)}
                className="divide-y divide-gray-100"
              >
                {blocks.map((block) => (
                  <Reorder.Item
                    key={block.id}
                    value={block}
                    className={`
                      relative group
                      ${selectedBlockId === block.id ? 'ring-2 ring-[var(--ak-color-accent)] ring-inset z-10' : ''}
                    `}
                    onClick={() => setSelectedBlockId(block.id)}
                  >
                    {/* Drag Handle - Always visible on left */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 flex gap-1">
                      <div className="p-2 rounded bg-[var(--ak-color-bg-surface)] text-[var(--ak-color-text-secondary)] cursor-grab active:cursor-grabbing hover:text-[var(--ak-color-text-primary)] shadow-lg">
                        <GripVertical className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Block Content */}
                    {renderBlockPreview(block)}

                    {/* Hover Overlay with Action Hint */}
                    <div className="absolute inset-0 bg-[var(--ak-semantic-warning-soft)]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="bg-[var(--ak-color-bg-surface)]/80 text-[var(--ak-color-text-primary)] px-3 py-1 rounded-full text-xs transform scale-90 group-hover:scale-100 transition-transform">
                        Klicken zum Bearbeiten
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              {/* Add Block Button */}
              <div className="p-4 text-center border-t border-dashed border-[var(--ak-color-border-fine)]">
                <button
                  onClick={() => addBlock('text')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-[var(--ak-color-text-secondary)] hover:text-[var(--ak-color-text-primary)] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Block hinzufügen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailEditor

