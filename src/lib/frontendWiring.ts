/**
 * Frontend Wiring System
 * Centralized action handler for all frontend interactions
 */

export type ActionType = 
  | 'navigate'
  | 'api_call'
  | 'modal_open'
  | 'drawer_open'
  | 'toast'
  | 'workflow_trigger'
  | 'ai_action'
  | 'quick_action'

export interface ActionConfig {
  type: ActionType
  payload?: Record<string, unknown>
  handler?: () => void | Promise<void>
}

/**
 * Kanonisches Event-Format für aklow-action Events
 */
export type AkLowActionEventDetail = {
  actionId: string
  payload?: Record<string, unknown>
  meta?: { source?: string; type?: string }
}

export class FrontendWiring {
  private static instance: FrontendWiring
  private actionHandlers: Map<string, ActionConfig> = new Map()
  private eventListeners: Map<string, Set<(data: unknown) => void>> = new Map()

  private constructor() {
    // Setup global event listeners
    // REMOVED: No longer listening for aklow-action to prevent double execution.
    // Use direct executeAction calls or dispatchActionStart.
  }

  static getInstance(): FrontendWiring {
    if (!FrontendWiring.instance) {
      FrontendWiring.instance = new FrontendWiring()
    }
    return FrontendWiring.instance
  }

  /**
   * Register an action handler
   */
  registerAction(actionId: string, config: ActionConfig): void {
    this.actionHandlers.set(actionId, config)
  }

  /**
   * Execute an action
   * Returns true if the action was found and handled, false otherwise.
   */
  async executeAction(actionId: string, additionalPayload?: Record<string, unknown>): Promise<boolean> {
    const config = this.actionHandlers.get(actionId)
    if (!config) {
      return false
    }

    const payload = { ...config.payload, ...additionalPayload }

    try {
      switch (config.type) {
        case 'navigate':
          await this.handleNavigate(payload)
          break
        case 'api_call':
          await this.handleApiCall(payload)
          break
        case 'modal_open':
          await this.handleModalOpen(payload)
          break
        case 'drawer_open':
          await this.handleDrawerOpen(payload)
          break
        case 'toast':
          await this.handleToast(payload)
          break
        case 'workflow_trigger':
          await this.handleWorkflowTrigger(payload)
          break
        case 'ai_action':
          await this.handleAIAction(payload)
          break
        case 'quick_action':
          await this.handleQuickAction(payload)
          break
      }

      // Call custom handler if provided
      if (config.handler) {
        await config.handler()
      }

      // Emit event
      this.emit('action-executed', { actionId, payload })
      return true
    } catch (error) {
      console.error(`Error executing action ${actionId}:`, error)
      this.emit('action-error', { actionId, error })
      throw error
    }
  }

  /**
   * Subscribe to events
   */
  on(event: string, callback: (data: unknown) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.eventListeners.get(event)?.delete(callback)
    }
  }

  /**
   * Emit event
   */
  private emit(event: string, data: unknown): void {
    this.eventListeners.get(event)?.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error)
      }
    })
  }

  /**
   * Handle global action events
   * Akzeptiert beide Event-Formate:
   * - Format A (kanonisch): { actionId, payload }
   * - Format B (legacy von actionHandlers): { type, actionId, context, data }
   */
  private handleGlobalAction(event: Event): void {
    const customEvent = event as CustomEvent
    const detail = customEvent.detail as AkLowActionEventDetail | {
      type?: string
      actionId?: string
      context?: string
      data?: Record<string, unknown>
    }

    // Format A (kanonisch): { actionId, payload }
    if ('actionId' in detail && detail.actionId && 'payload' in detail) {
      this.executeAction(detail.actionId, detail.payload)
      return
    }

    // Format B (legacy): { type, actionId, context, data }
    if ('actionId' in detail && detail.actionId) {
      const legacyDetail = detail as { data?: Record<string, unknown>; context?: unknown; type?: string }
      const legacyPayload = {
        ...(legacyDetail.data || {}),
        context: legacyDetail.context,
        actionType: legacyDetail.type,
      }
      this.executeAction(detail.actionId, legacyPayload)
      return
    }

    // Fallback: Versuche actionId direkt zu extrahieren
    const actionId = (detail as { actionId?: string }).actionId
    if (actionId) {
      console.warn('[FrontendWiring] Event format not recognized, attempting direct execution:', detail)
      this.executeAction(actionId, detail as Record<string, unknown>)
    } else {
      console.warn('[FrontendWiring] Event missing actionId:', detail)
    }
  }

  // Action handlers
  private async handleNavigate(payload: Record<string, unknown>): Promise<void> {
    const path = payload.path as string
    if (!path) return

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aklow-navigate', { detail: { path } }))
    }
  }

  private async handleApiCall(payload: Record<string, unknown>): Promise<void> {
    let endpoint = payload.endpoint as string
    const method = (payload.method as string) || 'GET'
    const body = payload.body as Record<string, unknown>

    if (!endpoint) {
      console.warn('[FrontendWiring] API call missing endpoint')
      return
    }

    // Resolve endpoint template (z.B. {itemId} wird durch payload.itemId ersetzt)
    endpoint = this.resolveEndpoint(endpoint, payload)

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        let errorMsg = `API call failed: ${response.status} ${response.statusText}`
        try {
          const errorText = await response.text()
          if (errorText) errorMsg += ` - ${errorText}`
        } catch (_) {
          // ignore
        }
        throw new Error(errorMsg)
      }

      let data = null
      if (response.status !== 204) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          try {
            data = await response.json()
          } catch (e) {
            console.warn('[FrontendWiring] Failed to parse JSON response', e)
          }
        } else {
          try {
            data = await response.text()
          } catch (e) {
            // ignore
          }
        }
      }

      this.emit('api-success', { endpoint, data })
      
      // Emit toast for success
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('aklow-notification', {
            detail: { type: 'success', message: 'Aktion erfolgreich ausgeführt' }
          })
        )
      }
    } catch (error) {
      this.emit('api-error', { endpoint, error })
      
      // Emit toast for error
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('aklow-notification', {
            detail: { type: 'error', message: error instanceof Error ? error.message : 'Fehler beim Ausführen der Aktion' }
          })
        )
      }
      throw error
    }
  }

  /**
   * Helper: Resolve endpoint template with payload values
   * Example: "/api/inbox/{itemId}/archive" + { itemId: "123" } => "/api/inbox/123/archive"
   */
  private resolveEndpoint(template: string, payload: Record<string, unknown>): string {
    let resolved = template
    for (const [key, value] of Object.entries(payload)) {
      resolved = resolved.replace(`{${key}}`, String(value))
    }
    return resolved
  }

  private async handleModalOpen(payload: Record<string, unknown>): Promise<void> {
    this.emit('modal-open', payload)
  }

  private async handleDrawerOpen(payload: Record<string, unknown>): Promise<void> {
    this.emit('drawer-open', payload)
  }

  private async handleToast(payload: Record<string, unknown>): Promise<void> {
    this.emit('toast', payload)
  }

  private async handleWorkflowTrigger(payload: Record<string, unknown>): Promise<void> {
    const workflowId = payload.workflowId as string
    const actionId = payload.actionId as string
    if (!workflowId && !actionId) return

    // If actionId is provided, use actions API
    if (actionId) {
      if (typeof window !== 'undefined') {
        // FAIL-CLOSED: dispatchActionStart normalisiert und validiert automatisch
        const { dispatchActionStart } = await import('@/lib/actions/dispatch')
        dispatchActionStart(
          actionId,
          payload.context || {},
          payload.config as { model?: string; tone?: string; priority?: string; dry_run?: boolean; output_kind?: string } | undefined,
          'workflowTrigger'
        )
      }
      return
    }

    // Trigger workflow via unified POST /api/automation/workflows endpoint
    await this.handleApiCall({
      endpoint: `/api/automation/workflows`,
      method: 'POST',
      body: {
        action: 'trigger',
        workflow_id: workflowId,
        inputs: payload.inputs as Record<string, unknown> || {},
      },
    })
  }

  private async handleAIAction(payload: Record<string, unknown>): Promise<void> {
    // Start action run instead of wizard
    if (typeof window !== 'undefined') {
      const actionId = (payload.actionId || payload.action) as string | undefined;
      if (actionId && typeof actionId === 'string') {
        // FAIL-CLOSED: dispatchActionStart normalisiert und validiert automatisch
        const { dispatchActionStart } = await import('@/lib/actions/dispatch')
        const context = payload.context && typeof payload.context === 'object' ? payload.context : {};
        dispatchActionStart(
          actionId,
          context as any,
          payload.config as { model?: string; tone?: string; priority?: string; dry_run?: boolean; output_kind?: string } | undefined,
          (payload.source || 'frontendWiring') as string
        )
      }
    }
  }

  private async handleQuickAction(payload: Record<string, unknown>): Promise<void> {
    const actionId = (payload.actionId as string) || (payload.action as string)
    if (!actionId) {
      // Legacy: emit event for backward compatibility
      this.emit('quick-action', payload)
      return
    }

    // Wenn actionId existiert, route zu executeAction
    // Dies ermöglicht, dass QuickActions auch über frontendWiring laufen
    const config = this.actionHandlers.get(actionId)
    if (config) {
      await this.executeAction(actionId, payload)
      return
    }

    // Fallback: emit event für Legacy-Handler
    this.emit('quick-action', payload)
  }
}

// Export singleton instance
export const frontendWiring = FrontendWiring.getInstance()

// Helper function to register common actions
export function registerCommonActions(): void {
  // Navigation actions
  frontendWiring.registerAction('navigate-dashboard', {
    type: 'navigate',
    payload: { path: '/dashboard' },
  })

  frontendWiring.registerAction('navigate-settings', {
    type: 'navigate',
    payload: { path: '/settings' },
  })

  // AI Actions
  frontendWiring.registerAction('ai-generate-email', {
    type: 'ai_action',
    payload: { actionId: 'inbox.draft_reply', context: { module: 'inbox' } },
  })

  frontendWiring.registerAction('ai-summarize', {
    type: 'ai_action',
    payload: { actionId: 'inbox.summarize', context: { module: 'inbox' } },
  })

  // Quick Actions - Standard-Registrierung für Kern-QuickActions
  frontendWiring.registerAction('quick-archive', {
    type: 'api_call',
    payload: {
      // Endpoint wird dynamisch aus payload.itemId/itemId aufgelöst
      endpoint: '/api/inbox/{itemId}/archive',
      method: 'POST',
    },
  })

  frontendWiring.registerAction('mark-read', {
    type: 'api_call',
    payload: {
      endpoint: '/api/inbox/{itemId}/read',
      method: 'POST',
    },
  })
}

// Initialize common actions
if (typeof window !== 'undefined') {
  registerCommonActions()
  
  // Listen for aklow-ai-action-wizard events and translate to action-start
  // (for backward compatibility, but should be removed eventually)
  window.addEventListener('aklow-ai-action-wizard', (async (e: CustomEvent) => {
    const detail = e.detail || {}
    const actionId = detail.actionId || detail.action as string
    
    if (actionId) {
      // FAIL-CLOSED: dispatchActionStart normalisiert und validiert automatisch
      const { dispatchActionStart } = await import('@/lib/actions/dispatch')
      dispatchActionStart(
        actionId,
        {
          module: detail.context || 'none',
          ...(detail.item ? { moduleContext: { item: detail.item } } : {}),
          ...(detail.id ? { target: { id: detail.id } } : {}),
        },
        detail.config,
        'aiActionWizard'
      )
    }
  }) as unknown as EventListener)
}

