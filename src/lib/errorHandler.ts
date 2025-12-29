/**
 * Central Error Handling for Frontend
 * Provides consistent error handling and user-friendly error messages
 */

export interface ApiError {
  error: string
  message: string
  details?: unknown
  statusCode?: number
  requestId?: string
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): ApiError {
  if (error instanceof AppError) {
    return {
      error: 'app_error',
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    return {
      error: 'unknown_error',
      message: error.message || 'Ein unbekannter Fehler ist aufgetreten',
    }
  }

  return {
    error: 'unknown_error',
    message: 'Ein unbekannter Fehler ist aufgetreten',
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: ApiError): string {
  const { error: errorType, message, statusCode, details, requestId } = error

  // Network errors
  if (errorType === 'network_error' || message.includes('fetch')) {
    return 'Verbindungsfehler. Bitte überprüfe deine Internetverbindung.'
  }

  // Authentication errors
  if (statusCode === 401 || errorType === 'unauthorized') {
    return 'Du bist nicht angemeldet. Bitte melde dich erneut an.'
  }

  // Permission errors
  if (statusCode === 403 || errorType === 'forbidden') {
    return 'Du hast keine Berechtigung für diese Aktion.'
  }

  // Not found errors
  if (statusCode === 404 || errorType === 'not_found') {
    return 'Die angeforderte Ressource wurde nicht gefunden.'
  }

  // Rate Limit errors
  if (statusCode === 429) {
    const retryAfter = (details as any)?.retryAfter
    if (retryAfter) {
      return `Zu viele Anfragen. Bitte versuche es in ${retryAfter} Sekunden erneut.`
    }
    return 'Zu viele Anfragen. Bitte warte einen Moment und versuche es dann erneut.'
  }

  // Server errors
  if (statusCode && statusCode >= 500) {
    let msg = 'Ein Serverfehler ist aufgetreten. Bitte versuche es später erneut.'
    if (requestId) {
      msg += ` (ID: ${requestId})`
    }
    return msg
  }

  // Validation errors
  if (statusCode === 400 || errorType === 'validation_error') {
    return message || 'Ungültige Eingabe. Bitte überprüfe deine Daten.'
  }

  // Default: return the message or a generic one
  let finalMessage = message || 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.'
  if (requestId && statusCode && statusCode >= 400) {
    finalMessage += ` [Ref: ${requestId}]`
  }
  return finalMessage
}

/**
 * Safe fetch wrapper with error handling
 */
export async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ data: T | null; error: ApiError | null }> {
  try {
    const response = await fetch(url, options)
    const requestId = response.headers.get('x-request-id') || undefined

    if (!response.ok) {
      let errorData: unknown
      try {
        errorData = await response.json()
      } catch {
        errorData = await response.text()
      }

      // Handle Rate Limit specific info
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after')
        if (retryAfter) {
          errorData = typeof errorData === 'object' && errorData !== null 
            ? { ...errorData, retryAfter }
            : { message: errorData, retryAfter }
        }
      }

      const message =
        typeof errorData === 'string'
          ? errorData
          : (typeof errorData === 'object' && errorData !== null && 'message' in errorData && typeof (errorData as { message: unknown }).message === 'string'
              ? (errorData as { message: string }).message
              : 'Request failed')

      const error: ApiError = {
        error: 'api_error',
        message,
        details: errorData,
        statusCode: response.status,
        requestId,
      }

      return { data: null, error }
    }

    const data = await response.json()
    return { data, error: null }
  } catch (error) {
    const apiError = handleApiError(error)
    return { data: null, error: apiError }
  }
}

/**
 * Show error notification to user
 */
export function showErrorNotification(error: ApiError) {
  const message = getUserFriendlyErrorMessage(error)
  
  // Dispatch custom event for notification system
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('aklow-error', {
        detail: {
          message,
          error,
        },
      })
    )
  }

  // Also log to console for debugging
  console.error('[Error]', error)
}

