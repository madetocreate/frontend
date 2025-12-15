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

export class FrontendWiring {
  private static instance: FrontendWiring
  private actionHandlers: Map<string, ActionConfig> = new Map()
  private eventListeners: Map<string, Set<(data: unknown) => void>> = new Map()

  private constructor() {
    // Setup global event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('aklow-action', this.handleGlobalAction.bind(this))
    }
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
   */
  async executeAction(actionId: string, additionalPayload?: Record<string, unknown>): Promise<void> {
    const config = this.actionHandlers.get(actionId)
    if (!config) {
      console.warn(`Action ${actionId} not found`)
      return
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
    } catch (error) {
      console.error(`Error executing action ${actionId}:`, error)
      this.emit('action-error', { actionId, error })
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
   */
  private handleGlobalAction(event: Event): void {
    const customEvent = event as CustomEvent
    const { actionId, payload } = customEvent.detail
    if (actionId) {
      this.executeAction(actionId, payload)
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
    const endpoint = payload.endpoint as string
    const method = (payload.method as string) || 'GET'
    const body = payload.body as Record<string, unknown>

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`)
      }

      const data = await response.json()
      this.emit('api-success', { endpoint, data })
    } catch (error) {
      this.emit('api-error', { endpoint, error })
      throw error
    }
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
    if (!workflowId) return

    // Trigger workflow via API
    await this.handleApiCall({
      endpoint: `/api/v1/workflows/${workflowId}/trigger`,
      method: 'POST',
      body: payload.inputs as Record<string, unknown>,
    })
  }

  private async handleAIAction(payload: Record<string, unknown>): Promise<void> {
    // Trigger AI Action Wizard
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('aklow-ai-action-wizard', {
          detail: payload,
        })
      )
    }
  }

  private async handleQuickAction(payload: Record<string, unknown>): Promise<void> {
    const action = payload.action as string
    if (!action) return

    // Handle quick actions
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
    payload: { context: 'inbox', action: 'generate-email' },
  })

  frontendWiring.registerAction('ai-summarize', {
    type: 'ai_action',
    payload: { context: 'document', action: 'summarize' },
  })

  // Quick Actions
  frontendWiring.registerAction('quick-archive', {
    type: 'quick_action',
    payload: { action: 'archive' },
  })

  frontendWiring.registerAction('quick-delete', {
    type: 'quick_action',
    payload: { action: 'delete' },
  })
}

// Initialize common actions
if (typeof window !== 'undefined') {
  registerCommonActions()
}

