/**
 * Phase 5: Reason Code Messages - Human-readable messages for reason codes.
 * 
 * Provides user-friendly messages for each reason code without exposing internal details.
 */
export type ReasonCode =
  | 'ok_automate'
  | 'missing_context'
  | 'confidence_low'
  | 'integration_disconnected'
  | 'policy_blocked'
  | 'quota_exceeded'
  | 'validation_failed'
  | 'upstream_timeout'
  | 'multiple_tools_selected'
  | 'no_tool_selected'

export interface ReasonCodeMessage {
  title: string
  message: string
  severity: 'info' | 'warning' | 'error'
}

const REASON_CODE_MESSAGES: Record<ReasonCode, ReasonCodeMessage> = {
  ok_automate: {
    title: 'Aktion wird ausgeführt',
    message: 'Die Aktion wurde erfolgreich gestartet.',
    severity: 'info',
  },
  missing_context: {
    title: 'Informationen fehlen',
    message: 'Es fehlen erforderliche Informationen, um die Aktion auszuführen.',
    severity: 'warning',
  },
  confidence_low: {
    title: 'Unsichere Auswahl',
    message: 'Die Aktion wurde nicht automatisch ausgeführt, da die Sicherheit nicht ausreichend war.',
    severity: 'warning',
  },
  integration_disconnected: {
    title: 'Integration nicht verbunden',
    message: 'Die erforderliche Integration ist nicht verbunden. Bitte verbinden Sie die Integration zuerst.',
    severity: 'error',
  },
  policy_blocked: {
    title: 'Aktion blockiert',
    message: 'Diese Aktion wurde durch eine Policy blockiert.',
    severity: 'error',
  },
  quota_exceeded: {
    title: 'Limit überschritten',
    message: 'Das Kontingent wurde überschritten. Bitte upgraden Sie Ihren Plan.',
    severity: 'error',
  },
  validation_failed: {
    title: 'Validierung fehlgeschlagen',
    message: 'Die Aktion konnte nicht ausgeführt werden, da erforderliche Felder fehlen.',
    severity: 'warning',
  },
  upstream_timeout: {
    title: 'Zeitüberschreitung',
    message: 'Die Aktion konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.',
    severity: 'error',
  },
  multiple_tools_selected: {
    title: 'Mehrere Aktionen erkannt',
    message: 'Es wurden mehrere Aktionen erkannt. Bitte wählen Sie eine aus.',
    severity: 'warning',
  },
  no_tool_selected: {
    title: 'Keine Aktion erkannt',
    message: 'Es wurde keine passende Aktion erkannt.',
    severity: 'info',
  },
}

export function getReasonCodeMessage(reasonCode: string | undefined | null): ReasonCodeMessage | null {
  if (!reasonCode) {
    return null
  }
  
  return REASON_CODE_MESSAGES[reasonCode as ReasonCode] || {
    title: 'Unbekannter Status',
    message: 'Ein unerwarteter Fehler ist aufgetreten.',
    severity: 'error',
  }
}

export function formatReasonCodeMessage(reasonCode: string | undefined | null): string {
  const message = getReasonCodeMessage(reasonCode)
  return message?.message || 'Unbekannter Fehler'
}

