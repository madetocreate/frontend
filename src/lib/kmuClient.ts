/**
 * KMU Features API Client
 * 
 * Handles all API calls for:
 * 1. Quick Templates
 * 2. Internal Notes
 * 3. Knowledge Base
 * 4. Weekly Summary
 * 5. Auto-Reply Rules
 */

// ============================================================================
// Types
// ============================================================================

export interface TemplateVariable {
  name: string
  default_value?: string
  description?: string
}

export interface ResponseTemplate {
  id: string
  name: string
  shortcut?: string
  category: string
  subject_template?: string
  body_template: string
  variables: TemplateVariable[]
  use_count: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface InternalNote {
  id: string
  author_id: string
  author_name: string
  content: string
  mentions: string[]
  is_pinned: boolean
  created_at?: string
}

export interface KBArticle {
  id: string
  slug: string
  title: string
  content?: string
  excerpt?: string
  category: string
  tags: string[]
  is_published: boolean
  is_featured: boolean
  view_count: number
  helpful_count: number
  not_helpful_count: number
  published_at?: string
  created_at?: string
}

export interface WeeklySummarySettings {
  is_enabled: boolean
  recipients: string[]
  send_day: string
  send_hour: number
  timezone: string
  include_kpis: string[]
  include_top_topics: boolean
  include_team_stats: boolean
}

export interface WeeklySummary {
  period: { start: string; end: string }
  kpis: {
    conversations: { total: number; resolved: number; resolution_rate: number }
    response_time: { avg_minutes: number }
    automation: { executions: number; successful: number; time_saved_minutes: number }
  }
  top_topics: Array<{ topic: string; count: number }>
}

export interface AutoReplyCondition {
  field: string
  operator: string
  value: string
  case_sensitive?: boolean
}

export interface AutoReplyAction {
  type: string
  template_id?: string
  content?: string
  assign_to?: string
}

export interface AutoReplyRule {
  id: string
  name: string
  description?: string
  is_enabled: boolean
  trigger_type: string
  trigger_source?: string
  condition: AutoReplyCondition
  action: AutoReplyAction
  requires_approval: boolean
  stats: { executions: number; matches: number }
}

export interface AutoReplyPreset {
  name: string
  description: string
  trigger_type: string
  condition_field: string
  condition_operator: string
  condition_value: string
  action_type: string
  action_content: string
}

// ============================================================================
// API Client
// ============================================================================

import { authedFetch } from './api/authedFetch'

class KmuClient {
  private baseUrl = '/api/kmu'

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await authedFetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    // Phase 3.1: Capture request ID for debugging
    const requestId = res.headers.get('x-request-id')
    if (requestId && typeof window !== 'undefined') {
      (window as any)._lastRequestId = requestId
    }
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Unknown error' }))
      const message = error.detail || error.error || `Request failed: ${res.status}`
      
      // If we have an error and a request ID, we might want to attach it to the error
      const err = new Error(message) as any
      if (requestId) err.requestId = requestId
      throw err
    }
    
    return res.json()
  }

  // ============================================================================
  // Templates
  // ============================================================================

  async getTemplates(category?: string): Promise<{ templates: ResponseTemplate[]; count: number }> {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    return this.request(`/templates?${params}`)
  }

  async getTemplate(id: string): Promise<{ template: ResponseTemplate }> {
    return this.request(`/templates/${id}`)
  }

  async createTemplate(data: Partial<ResponseTemplate>): Promise<{ id: string; message: string }> {
    return this.request('/templates', { method: 'POST', body: JSON.stringify(data) })
  }

  async updateTemplate(id: string, data: Partial<ResponseTemplate>): Promise<{ message: string }> {
    return this.request(`/templates/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
  }

  async deleteTemplate(id: string): Promise<{ message: string }> {
    return this.request(`/templates/${id}`, { method: 'DELETE' })
  }

  async applyTemplate(id: string, variables: Record<string, string> = {}): Promise<{ rendered_body: string; rendered_subject: string }> {
    return this.request(`/templates/${id}/apply`, { method: 'POST', body: JSON.stringify({ variables }) })
  }

  // ============================================================================
  // Internal Notes
  // ============================================================================

  async getNotes(inboxItemId?: string, threadId?: string): Promise<{ notes: InternalNote[]; count: number }> {
    const params = new URLSearchParams()
    if (inboxItemId) params.set('inbox_item_id', inboxItemId)
    if (threadId) params.set('thread_id', threadId)
    return this.request(`/notes?${params}`)
  }

  async createNote(data: { inbox_item_id?: string; thread_id?: string; content: string; mentions?: string[]; is_pinned?: boolean }): Promise<{ id: string; message: string }> {
    return this.request('/notes', { method: 'POST', body: JSON.stringify(data) })
  }

  async updateNote(id: string, data: { content?: string; mentions?: string[]; is_pinned?: boolean }): Promise<{ message: string }> {
    return this.request(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
  }

  async deleteNote(id: string): Promise<{ message: string }> {
    return this.request(`/notes/${id}`, { method: 'DELETE' })
  }

  // ============================================================================
  // Knowledge Base
  // ============================================================================

  async getKBArticles(params?: { category?: string; published_only?: boolean; search?: string; limit?: number; offset?: number }): Promise<{ articles: KBArticle[]; total: number }> {
    const urlParams = new URLSearchParams()
    if (params?.category) urlParams.set('category', params.category)
    if (params?.published_only) urlParams.set('published_only', 'true')
    if (params?.search) urlParams.set('search', params.search)
    if (params?.limit) urlParams.set('limit', String(params.limit))
    if (params?.offset) urlParams.set('offset', String(params.offset))
    return this.request(`/kb/articles?${urlParams}`)
  }

  async getKBArticle(slug: string): Promise<{ article: KBArticle }> {
    return this.request(`/kb/articles/${slug}`)
  }

  async createKBArticle(data: Partial<KBArticle>): Promise<{ id: string; slug: string; message: string }> {
    return this.request('/kb/articles', { method: 'POST', body: JSON.stringify(data) })
  }

  async updateKBArticle(id: string, data: Partial<KBArticle>): Promise<{ message: string }> {
    return this.request(`/kb/articles/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
  }

  async deleteKBArticle(id: string): Promise<{ message: string }> {
    return this.request(`/kb/articles/${id}`, { method: 'DELETE' })
  }

  async submitKBFeedback(slug: string, helpful: boolean): Promise<{ message: string }> {
    return this.request(`/kb/articles/${slug}/feedback?helpful=${helpful}`, { method: 'POST' })
  }

  // ============================================================================
  // Weekly Summary
  // ============================================================================

  async getWeeklySummarySettings(): Promise<{ settings: WeeklySummarySettings; last_sent_at?: string }> {
    return this.request('/weekly-summary')
  }

  async updateWeeklySummarySettings(data: WeeklySummarySettings): Promise<{ message: string }> {
    return this.request('/weekly-summary', { method: 'PUT', body: JSON.stringify(data) })
  }

  async previewWeeklySummary(): Promise<{ summary: WeeklySummary; week_start: string; week_end: string }> {
    return this.request('/weekly-summary/preview', { method: 'POST' })
  }

  // ============================================================================
  // Auto-Reply Rules
  // ============================================================================

  async getAutoReplyRules(enabledOnly?: boolean): Promise<{ rules: AutoReplyRule[]; count: number }> {
    const params = new URLSearchParams()
    if (enabledOnly) params.set('enabled_only', 'true')
    return this.request(`/auto-reply/rules?${params}`)
  }

  async getAutoReplyRule(id: string): Promise<{ rule: AutoReplyRule }> {
    return this.request(`/auto-reply/rules/${id}`)
  }

  async createAutoReplyRule(data: Partial<AutoReplyRule> & {
    condition_field?: string
    condition_operator?: string
    condition_value?: string
    action_type?: string
    action_content?: string
    action_template_id?: string
  }): Promise<{ id: string; message: string }> {
    return this.request('/auto-reply/rules', { method: 'POST', body: JSON.stringify(data) })
  }

  async updateAutoReplyRule(id: string, data: Partial<AutoReplyRule>): Promise<{ message: string }> {
    return this.request(`/auto-reply/rules/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
  }

  async deleteAutoReplyRule(id: string): Promise<{ message: string }> {
    return this.request(`/auto-reply/rules/${id}`, { method: 'DELETE' })
  }

  async toggleAutoReplyRule(id: string, enabled: boolean): Promise<{ enabled: boolean }> {
    return this.request(`/auto-reply/rules/${id}/toggle?enabled=${enabled}`, { method: 'PATCH' })
  }

  async getAutoReplyPresets(): Promise<{ presets: AutoReplyPreset[] }> {
    return this.request('/auto-reply/presets')
  }

  async activateAutoReplyPreset(index: number): Promise<{ id: string; message: string }> {
    return this.request(`/auto-reply/presets/${index}/activate`, { method: 'POST' })
  }
}

export const kmuClient = new KmuClient()
export default kmuClient

