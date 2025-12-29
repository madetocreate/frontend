'use client'

import { AkBadge, AkBadgeTone } from '@/components/ui/AkBadge'
import { BotStatus } from './BotConsoleLayout'

interface BotStatusChipProps {
  status: BotStatus
  label?: string
}

const STATUS_CONFIG: Record<BotStatus, { tone: AkBadgeTone; defaultLabel: string }> = {
  connected: { tone: 'success', defaultLabel: 'Verbunden' },
  needs_setup: { tone: 'warning', defaultLabel: 'Setup erforderlich' },
  error: { tone: 'error', defaultLabel: 'Fehler' },
  disabled: { tone: 'muted', defaultLabel: 'Deaktiviert' },
}

export function BotStatusChip({ status, label }: BotStatusChipProps) {
  const config = STATUS_CONFIG[status]
  return (
    <AkBadge tone={config.tone} size="sm">
      {label || config.defaultLabel}
    </AkBadge>
  )
}

