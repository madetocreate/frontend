/**
 * Telephony Card Service
 * Erstellt Detailkarten für Telefon-Anrufe
 */

import type { EntityCardPayload } from '@/components/chat/cards/types'
import { dispatchCardToChat } from './dashboardCardService'

export interface TelephonyCall {
  id: string
  from: string
  time: string
  duration: string
  mode: 'reservation' | 'support' | 'appointment' | 'delivery'
  status: 'completed' | 'missed'
  recording?: boolean
}

/**
 * Erstellt eine Entity-Card für einen Telefon-Anruf
 */
export function createTelephonyCallCard(call: TelephonyCall): EntityCardPayload {
  return {
    type: 'entity',
    id: `telephony-call-${call.id}`,
    title: `Anruf von ${call.from}`,
    subtitle: call.time,
    status: call.status === 'completed' ? 'active' : 'error',
    createdAt: Date.now(),
    source: {
      moduleToken: 'phone',
      entityType: 'telephony_call',
      entityId: call.id,
    },
    data: {
      'Von': call.from,
      'Zeit': call.time,
      'Dauer': call.duration,
      'Modus': call.mode,
      'Status': call.status === 'completed' ? 'Erfolgreich' : 'Verpasst',
      'Aufnahme': call.recording ? 'Verfügbar' : 'Nicht verfügbar',
    },
    actions: [
      {
        id: 'summarize_call',
        label: 'Zusammenfassen',
        variant: 'primary',
      },
      {
        id: 'extract_customer',
        label: 'Kunde extrahieren',
        variant: 'secondary',
      },
      {
        id: 'assign_customer',
        label: 'Als Kunde zuordnen',
        variant: 'secondary',
      },
    ],
    explanation: `Anruf-Details: ${call.mode} Anruf von ${call.from} am ${call.time} mit einer Dauer von ${call.duration}.`,
  }
}

/**
 * Dispatched eine Telefon-Anruf-Card in den Chat
 */
export function dispatchTelephonyCallCard(call: TelephonyCall) {
  const card = createTelephonyCallCard(call)
  dispatchCardToChat(card)
}

