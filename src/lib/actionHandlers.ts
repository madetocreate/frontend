/**
 * Central Action Handlers for Frontend Wiring
 * All buttons, actions, and interactions are wired through this system
 */

export type ActionType = 
  | 'quick-action'
  | 'ai-action'
  | 'navigation'
  | 'form-submit'
  | 'api-call'
  | 'modal'
  | 'drawer'

export interface ActionPayload {
  type: ActionType
  actionId: string
  context?: string
  data?: Record<string, unknown>
}

/**
 * Central action dispatcher
 */
export function dispatchAction(payload: ActionPayload) {
  if (typeof window === 'undefined') return

  // Log action for debugging
  console.log('[Action]', payload)

  // Dispatch custom event for global handling
  window.dispatchEvent(
    new CustomEvent('aklow-action', { detail: payload })
  )

  // Route to specific handlers
  switch (payload.type) {
    case 'quick-action':
      handleQuickAction(payload)
      break
    case 'ai-action':
      handleAIAction(payload)
      break
    case 'navigation':
      handleNavigation(payload)
      break
    case 'form-submit':
      handleFormSubmit(payload)
      break
    case 'api-call':
      handleAPICall(payload)
      break
    case 'modal':
      handleModal(payload)
      break
    case 'drawer':
      handleDrawer(payload)
      break
  }
}

/**
 * Quick Actions Handlers
 */
function handleQuickAction(payload: ActionPayload) {
  const { actionId, context, data } = payload

  switch (actionId) {
    // Inbox Actions
    case 'quick-reply':
      window.dispatchEvent(new CustomEvent('aklow-open-module', { detail: { module: 'inbox' } }))
      // Focus on reply input
      setTimeout(() => {
        const replyInput = document.querySelector('textarea[placeholder*="Antwort"], input[placeholder*="Antwort"]') as HTMLTextAreaElement
        replyInput?.focus()
      }, 100)
      break

    case 'quick-archive':
      if (data?.itemId) {
        // Archive item
        console.log('Archive item:', data.itemId)
        // TODO: API call
      }
      break

    case 'quick-forward':
      if (data?.itemId) {
        // Forward item
        console.log('Forward item:', data.itemId)
        // TODO: API call
      }
      break

    // Customer Actions
    case 'quick-call':
      if (data?.phoneNumber) {
        window.location.href = `tel:${data.phoneNumber}`
      }
      break

    case 'quick-email':
      if (data?.email) {
        window.location.href = `mailto:${data.email}`
      }
      break

    case 'quick-meeting':
      window.dispatchEvent(new CustomEvent('aklow-open-module', { detail: { module: 'calendar' } }))
      break

    // Document Actions
    case 'quick-download':
      if (data?.documentId) {
        window.location.href = `/api/documents/${data.documentId}/download`
      }
      break

    case 'quick-share':
      if (data?.documentId) {
        // Open share modal
        dispatchAction({
          type: 'modal',
          actionId: 'share-document',
          data: { documentId: data.documentId }
        })
      }
      break

    case 'quick-edit':
      if (data?.documentId) {
        // Navigate to edit
        window.location.href = `/documents/${data.documentId}/edit`
      }
      break

    // Telephony Actions
    case 'quick-transcribe':
      if (data?.callId) {
        dispatchAction({
          type: 'api-call',
          actionId: 'transcribe-call',
          data: { callId: data.callId }
        })
      }
      break

    case 'quick-summary':
      if (data?.callId) {
        dispatchAction({
          type: 'ai-action',
          actionId: 'summarize-call',
          context: 'telephony',
          data: { callId: data.callId }
        })
      }
      break

    // Growth Actions
    case 'quick-campaign':
      window.dispatchEvent(new CustomEvent('aklow-open-module', { detail: { module: 'new1' } }))
      // TODO: Open campaign creation
      break

    case 'quick-analytics':
      window.dispatchEvent(new CustomEvent('aklow-open-module', { detail: { module: 'new1' } }))
      break

    // Calendar Actions
    case 'quick-event':
      window.dispatchEvent(new CustomEvent('aklow-open-module', { detail: { module: 'calendar' } }))
      // TODO: Open event creation
      break

    // Practice Actions
    case 'quick-appointment':
      if (context === 'practice') {
        window.dispatchEvent(new CustomEvent('aklow-open-module', { detail: { module: 'practice' } }))
        // TODO: Open appointment creation
      }
      break

    // Real Estate Actions
    case 'quick-expose':
      if (data?.propertyId) {
        window.location.href = `/real-estate/expose-editor/${data.propertyId}`
      }
      break

    case 'quick-viewing':
      if (data?.propertyId) {
        window.location.href = `/real-estate/calendar?property=${data.propertyId}`
      }
      break

    // Hotel Actions
    case 'quick-booking':
      if (context === 'hotel') {
        window.dispatchEvent(new CustomEvent('aklow-open-module', { detail: { module: 'hotel' } }))
        // TODO: Open booking creation
      }
      break

    case 'quick-checkin':
      if (data?.bookingId) {
        // TODO: Open check-in modal
        dispatchAction({
          type: 'modal',
          actionId: 'checkin-guest',
          data: { bookingId: data.bookingId }
        })
      }
      break

    default:
      console.warn('[Action] Unknown quick action:', actionId)
  }
}

/**
 * AI Actions Handlers
 */
function handleAIAction(payload: ActionPayload) {
  // AI Actions already trigger the wizard via CustomEvent
  // This is handled in ChatWorkspaceShell
  const { actionId, context } = payload
  
  // Some AI actions might need immediate handling
  switch (actionId) {
    case 'translate':
      if (payload.data?.text) {
        // TODO: Call translation API
        console.log('Translate:', payload.data.text)
      }
      break

    default:
      // Most AI actions go through the wizard
      break
  }
}

/**
 * Navigation Handlers
 */
function handleNavigation(payload: ActionPayload) {
  const { actionId, data } = payload

  switch (actionId) {
    case 'open-module':
      if (data?.module) {
        window.dispatchEvent(
          new CustomEvent('aklow-open-module', { detail: { module: data.module } })
        )
      }
      break

    case 'open-view':
      if (data?.module && data?.view) {
        window.dispatchEvent(
          new CustomEvent('aklow-open-view', { detail: { module: data.module, view: data.view } })
        )
      }
      break

    case 'open-page':
      if (data?.path) {
        window.location.href = data.path as string
      }
      break

    case 'open-detail':
      if (data?.module && data?.id) {
        // Open detail drawer
        window.dispatchEvent(
          new CustomEvent('aklow-open-detail', { detail: { module: data.module, id: data.id } })
        )
      }
      break

    default:
      console.warn('[Action] Unknown navigation action:', actionId)
  }
}

/**
 * Form Submit Handlers
 */
function handleFormSubmit(payload: ActionPayload) {
  const { actionId, data } = payload

  switch (actionId) {
    case 'save-settings':
      // TODO: API call to save settings
      console.log('Save settings:', data)
      break

    case 'create-item':
      // TODO: API call to create item
      console.log('Create item:', data)
      break

    case 'update-item':
      // TODO: API call to update item
      console.log('Update item:', data)
      break

    case 'delete-item':
      if (data?.id && confirm('Wirklich löschen?')) {
        // TODO: API call to delete
        console.log('Delete item:', data.id)
      }
      break

    default:
      console.warn('[Action] Unknown form action:', actionId)
  }
}

/**
 * API Call Handlers
 */
async function handleAPICall(payload: ActionPayload) {
  const { actionId, data } = payload

  try {
    switch (actionId) {
      case 'transcribe-call':
        if (data?.callId) {
          const response = await fetch(`/api/audio/transcribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callId: data.callId })
          })
          const result = await response.json()
          console.log('Transcription:', result)
          // Show notification
          window.dispatchEvent(
            new CustomEvent('aklow-notification', {
              detail: { type: 'success', message: 'Transkription abgeschlossen' }
            })
          )
        }
        break

      case 'archive-item':
        if (data?.itemId) {
          await fetch(`/api/inbox/${data.itemId}/archive`, { method: 'POST' })
          window.dispatchEvent(
            new CustomEvent('aklow-notification', {
              detail: { type: 'success', message: 'Archiviert' }
            })
          )
        }
        break

      case 'mark-read':
        if (data?.itemId) {
          await fetch(`/api/inbox/${data.itemId}/read`, { method: 'POST' })
        }
        break

      default:
        console.warn('[Action] Unknown API action:', actionId)
    }
  } catch (error) {
    console.error('[Action] API call failed:', error)
    window.dispatchEvent(
      new CustomEvent('aklow-notification', {
        detail: { type: 'error', message: 'Fehler beim Ausführen der Aktion' }
      })
    )
  }
}

/**
 * Modal Handlers
 */
function handleModal(payload: ActionPayload) {
  const { actionId, data } = payload

  switch (actionId) {
    case 'share-document':
      // TODO: Open share modal
      console.log('Share document:', data)
      break

    case 'checkin-guest':
      // TODO: Open check-in modal
      console.log('Check-in guest:', data)
      break

    default:
      console.warn('[Action] Unknown modal action:', actionId)
  }
}

/**
 * Drawer Handlers
 */
function handleDrawer(payload: ActionPayload) {
  const { actionId, data } = payload

  switch (actionId) {
    case 'open-detail':
      if (data?.module && data?.id) {
        window.dispatchEvent(
          new CustomEvent('aklow-open-detail', { detail: { module: data.module, id: data.id } })
        )
      }
      break

    case 'close-detail':
      window.dispatchEvent(new CustomEvent('aklow-close-detail'))
      break

    default:
      console.warn('[Action] Unknown drawer action:', actionId)
  }
}

/**
 * Helper: Create action handler
 */
export function createActionHandler(
  type: ActionType,
  actionId: string,
  context?: string,
  data?: Record<string, unknown>
) {
  return () => {
    dispatchAction({ type, actionId, context, data })
  }
}

