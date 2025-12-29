'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import {
  BookOpenIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  StarIcon,
  MagnifyingGlassIcon,
  TagIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  GlobeAltIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { AkButton } from '@/components/ui/AkButton'
import { AkBadge } from '@/components/ui/AkBadge'
import { kmuClient, type KBArticle } from '@/lib/kmuClient'

const CATEGORIES = [
  { id: 'general', label: 'Allgemein', icon: '📋' },
  { id: 'getting-started', label: 'Erste Schritte', icon: '🚀' },
  { id: 'billing', label: 'Abrechnung', icon: '💳' },
  { id: 'technical', label: 'Technisch', icon: '⚙️' },
  { id: 'policies', label: 'Richtlinien', icon: '📜' },
]

interface ArticleFormData {
  slug: string
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  is_published: boolean
  is_featured: boolean
}

const emptyFormData: ArticleFormData = {
  slug: '',
  title: '',
  content: '',
  excerpt: '',
  category: 'general',
  tags: [],
  is_published: false,
  is_featured: false,
}

export function KnowledgeBase() {
  const [articles, setArticles] = useState<KBArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDrafts, setShowDrafts] = useState(true)
  
  // Editor state
  const [isEditing, setIsEditing] = useState(false)
  const [editingArticle, setEditingArticle] = useState<KBArticle | null>(null)
  const [formData, setFormData] = useState<ArticleFormData>(emptyFormData)
  const [newTag, setNewTag] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Preview state
  const [viewingArticle, setViewingArticle] = useState<KBArticle | null>(null)

  const fetchArticles = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await kmuClient.getKBArticles({
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        published_only: !showDrafts,
      })
      setArticles(data.articles || [])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Laden')
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategory, searchQuery, showDrafts])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const handleCreate = () => {
    setEditingArticle(null)
    setFormData(emptyFormData)
    setIsEditing(true)
  }

  const handleEdit = async (article: KBArticle) => {
    try {
      const { article: full } = await kmuClient.getKBArticle(article.slug)
      setEditingArticle(full)
      setFormData({
        slug: full.slug,
        title: full.title,
        content: full.content || '',
        excerpt: full.excerpt || '',
        category: full.category,
        tags: full.tags || [],
        is_published: full.is_published,
        is_featured: full.is_featured,
      })
      setIsEditing(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Laden')
    }
  }

  const handleView = async (article: KBArticle) => {
    try {
      const { article: full } = await kmuClient.getKBArticle(article.slug)
      setViewingArticle(full)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Laden')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Artikel wirklich löschen?')) return
    try {
      await kmuClient.deleteKBArticle(id)
      fetchArticles()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Löschen')
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      if (editingArticle) {
        await kmuClient.updateKBArticle(editingArticle.id, formData)
      } else {
        await kmuClient.createKBArticle(formData)
      }
      setIsEditing(false)
      fetchArticles()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFeedback = async (slug: string, helpful: boolean) => {
    try {
      await kmuClient.submitKBFeedback(slug, helpful)
      // Update local state
      if (viewingArticle?.slug === slug) {
        setViewingArticle({
          ...viewingArticle,
          helpful_count: helpful ? viewingArticle.helpful_count + 1 : viewingArticle.helpful_count,
          not_helpful_count: !helpful ? viewingArticle.not_helpful_count + 1 : viewingArticle.not_helpful_count,
        })
      }
    } catch (e) {
      console.error('Feedback error:', e)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] })
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[äöüß]/g, c => ({ 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' }[c] || c))
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--ak-color-border-subtle)]">
        <div>
          <h2 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
            Knowledge Base
          </h2>
          <p className="text-sm text-[var(--ak-color-text-secondary)]">
            Öffentliches Help Center & FAQ
          </p>
        </div>
        <AkButton onClick={handleCreate} variant="primary" size="sm">
          <PlusIcon className="w-4 h-4 mr-1" />
          Neuer Artikel
        </AkButton>
      </div>

      {/* Filters */}
      <div className="p-4 space-y-3 border-b border-[var(--ak-color-border-subtle)]">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ak-color-text-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Artikel suchen..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)] placeholder-[var(--ak-color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--ak-color-accent)]"
          />
        </div>
        
        {/* Category Pills + Draft Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap flex-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-medium transition-all',
                !selectedCategory
                  ? 'bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)]'
                  : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)]'
              )}
            >
              Alle
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={clsx(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all',
                  selectedCategory === cat.id
                    ? 'bg-[var(--ak-color-accent)] text-[var(--ak-color-text-inverted)]'
                    : 'bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] hover:bg-[var(--ak-color-bg-hover)]'
                )}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-[var(--ak-color-text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={showDrafts}
              onChange={(e) => setShowDrafts(e.target.checked)}
              className="rounded"
            />
            Entwürfe zeigen
          </label>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ak-color-accent)]" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-[var(--ak-semantic-danger)]">{error}</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="w-12 h-12 mx-auto text-[var(--ak-color-text-tertiary)] mb-3" />
            <p className="text-[var(--ak-color-text-secondary)]">Noch keine Artikel</p>
            <AkButton onClick={handleCreate} variant="ghost" size="sm" className="mt-2">
              Ersten Artikel erstellen
            </AkButton>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {articles.map(article => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx(
                  'p-4 rounded-xl border transition-all group cursor-pointer',
                  article.is_featured
                    ? 'bg-[var(--ak-semantic-warning-soft)] border-[var(--ak-semantic-warning-soft)]'
                    : 'bg-[var(--ak-color-bg-surface)] border-[var(--ak-color-border-subtle)] hover:border-[var(--ak-color-border-default)]'
                )}
                onClick={() => handleView(article)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {article.is_featured && (
                        <StarSolidIcon className="w-4 h-4 text-[var(--ak-semantic-warning)]" />
                      )}
                      <span className="font-medium text-[var(--ak-color-text-primary)]">{article.title}</span>
                    </div>
                    {article.excerpt && (
                      <p className="text-sm text-[var(--ak-color-text-secondary)] line-clamp-2 mb-2">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-[var(--ak-color-text-tertiary)]">
                      <span className="flex items-center gap-1">
                        <EyeIcon className="w-3.5 h-3.5" />
                        {article.view_count}
                      </span>
                      {!article.is_published && (
                        <AkBadge tone="warning" size="xs">Entwurf</AkBadge>
                      )}
                      {article.is_published && (
                        <AkBadge tone="success" size="xs">
                          <GlobeAltIcon className="w-3 h-3 mr-0.5" />
                          Live
                        </AkBadge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(article); }}
                      className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)]"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(article.id); }}
                      className="p-2 rounded-lg hover:bg-[var(--ak-semantic-danger-soft)] text-[var(--ak-semantic-danger)] transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {article.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {article.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-tertiary)] text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                    {article.tags.length > 3 && (
                      <span className="text-xs text-[var(--ak-color-text-tertiary)]">
                        +{article.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--ak-color-bg-elevated)] rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-[var(--ak-color-border-subtle)] flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
                  {editingArticle ? 'Artikel bearbeiten' : 'Neuer Artikel'}
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)]"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-1">Titel</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          title: e.target.value,
                          slug: formData.slug || generateSlug(e.target.value)
                        })
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)]"
                      placeholder="Wie kann ich mein Passwort zurücksetzen?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-1">URL-Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)]"
                      placeholder="passwort-zuruecksetzen"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-1">Kategorie</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)]"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-1">Tags</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-1 px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)]"
                        placeholder="Tag hinzufügen..."
                      />
                      <AkButton variant="ghost" onClick={addTag}>+</AkButton>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-[var(--ak-color-bg-surface-muted)] text-xs flex items-center gap-1"
                          >
                            #{tag}
                            <button onClick={() => removeTag(tag)} className="hover:text-[var(--ak-semantic-danger)]">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-1">Kurzbeschreibung</label>
                  <input
                    type="text"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)]"
                    placeholder="Eine kurze Zusammenfassung für die Übersicht..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--ak-color-text-secondary)] mb-1">Inhalt (Markdown)</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={12}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--ak-color-bg-surface)] border border-[var(--ak-color-border-subtle)] text-[var(--ak-color-text-primary)] resize-none font-mono text-sm"
                    placeholder="# So setzen Sie Ihr Passwort zurück

1. Gehen Sie zur Login-Seite
2. Klicken Sie auf 'Passwort vergessen'
3. Geben Sie Ihre E-Mail-Adresse ein
4. Folgen Sie dem Link in der E-Mail

## Häufige Probleme

- **E-Mail kommt nicht an**: Prüfen Sie Ihren Spam-Ordner
- **Link abgelaufen**: Fordern Sie einen neuen Link an"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-[var(--ak-color-text-secondary)]">Veröffentlichen</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-[var(--ak-color-text-secondary)]">Als Feature markieren</span>
                  </label>
                </div>
              </div>

              <div className="p-4 border-t border-[var(--ak-color-border-subtle)] flex justify-end gap-2">
                <AkButton variant="ghost" onClick={() => setIsEditing(false)}>
                  Abbrechen
                </AkButton>
                <AkButton variant="primary" onClick={handleSave} disabled={isSaving || !formData.title || !formData.content}>
                  {isSaving ? 'Speichern...' : editingArticle ? 'Aktualisieren' : 'Erstellen'}
                </AkButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {viewingArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setViewingArticle(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--ak-color-bg-elevated)] rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-[var(--ak-color-border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {viewingArticle.is_featured && <StarSolidIcon className="w-5 h-5 text-[var(--ak-semantic-warning)]" />}
                  <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">
                    {viewingArticle.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {viewingArticle.is_published && (
                    <a
                      href={`/help/${viewingArticle.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)] text-[var(--ak-color-text-secondary)]"
                      title="Öffentliche Seite öffnen"
                    >
                      <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                    </a>
                  )}
                  <button
                    onClick={() => setViewingArticle(null)}
                    className="p-2 rounded-lg hover:bg-[var(--ak-color-bg-hover)]"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="prose prose-sm max-w-none text-[var(--ak-color-text-primary)]">
                  {/* Simple markdown rendering - in production use a proper markdown renderer */}
                  <div className="whitespace-pre-wrap">
                    {viewingArticle.content}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[var(--ak-color-border-subtle)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-[var(--ak-color-text-secondary)]">
                    <span className="flex items-center gap-1">
                      <EyeIcon className="w-4 h-4" />
                      {viewingArticle.view_count} Aufrufe
                    </span>
                    <span className="flex items-center gap-1 text-[var(--ak-semantic-success)]">
                      <HandThumbUpIcon className="w-4 h-4" />
                      {viewingArticle.helpful_count}
                    </span>
                    <span className="flex items-center gap-1 text-[var(--ak-semantic-danger)]">
                      <HandThumbDownIcon className="w-4 h-4" />
                      {viewingArticle.not_helpful_count}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--ak-color-text-secondary)]">War dieser Artikel hilfreich?</span>
                    <button
                      onClick={() => handleFeedback(viewingArticle.slug, true)}
                      className="p-2 rounded-lg hover:bg-[var(--ak-semantic-success-soft)] text-[var(--ak-semantic-success)] transition-colors"
                    >
                      <HandThumbUpIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleFeedback(viewingArticle.slug, false)}
                      className="p-2 rounded-lg hover:bg-[var(--ak-semantic-danger-soft)] text-[var(--ak-semantic-danger)] transition-colors"
                    >
                      <HandThumbDownIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
