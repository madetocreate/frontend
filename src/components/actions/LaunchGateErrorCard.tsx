'use client'

import { LinkIcon, ArrowUpIcon } from '@heroicons/react/24/outline'
import { AkButton } from '@/components/ui/AkButton'
import { AkAlert } from '@/components/ui/AkAlert'
import { useRouter } from 'next/navigation'

interface LaunchGateErrorCardProps {
  errorCode: 'integration_not_connected' | 'quota_exceeded' | 'plan_not_allowed' | 'tenant_not_found'
  message?: string
  details?: {
    provider?: string
    limit?: number
    usage?: number
    remaining?: number
    plan_id?: string
  }
  onFix?: () => void
}

export function LaunchGateErrorCard({
  errorCode,
  message,
  details,
  onFix,
}: LaunchGateErrorCardProps) {
  const router = useRouter()

  const handleFix = () => {
    if (onFix) {
      onFix()
      return
    }

    // Default fix actions
    switch (errorCode) {
      case 'integration_not_connected':
        // Navigate to integrations page
        router.push('/integrations')
        break
      case 'quota_exceeded':
      case 'plan_not_allowed':
        // Navigate to settings/billing
        router.push('/dashboard?tab=billing')
        break
      default:
        break
    }
  }

  const getErrorConfig = () => {
    switch (errorCode) {
      case 'integration_not_connected':
        return {
          title: 'Integration nicht verbunden',
          description: details?.provider
            ? `Die Integration "${details.provider}" ist nicht verbunden. Bitte verbinden Sie die Integration, um fortzufahren.`
            : 'Die erforderliche Integration ist nicht verbunden.',
          buttonText: 'Integration verbinden',
          buttonIcon: LinkIcon,
        }
      case 'quota_exceeded':
        return {
          title: 'Quota überschritten',
          description: details?.limit && details?.usage
            ? `Sie haben Ihr Monatslimit von ${details.limit} erreicht (${details.usage} verwendet). Bitte upgraden Sie Ihren Plan oder warten Sie bis zum nächsten Monat.`
            : 'Sie haben Ihr Monatslimit erreicht.',
          buttonText: 'Plan upgraden',
          buttonIcon: ArrowUpIcon,
        }
      case 'plan_not_allowed':
        return {
          title: 'Plan nicht erlaubt',
          description: details?.plan_id
            ? `Ihr aktueller Plan "${details.plan_id}" erlaubt diese Aktion nicht. Bitte upgraden Sie Ihren Plan.`
            : 'Ihr aktueller Plan erlaubt diese Aktion nicht.',
          buttonText: 'Plan upgraden',
          buttonIcon: ArrowUpIcon,
        }
      case 'tenant_not_found':
        return {
          title: 'Tenant nicht gefunden',
          description: 'Ihr Tenant-Account wurde nicht gefunden. Bitte kontaktieren Sie den Support.',
          buttonText: 'Support kontaktieren',
          buttonIcon: LinkIcon,
        }
      default:
        return {
          title: 'Fehler',
          description: message || 'Ein Fehler ist aufgetreten.',
          buttonText: 'Zurück',
          buttonIcon: LinkIcon,
        }
    }
  }

  const config = getErrorConfig()

  return (
    <AkAlert
      tone="danger"
      title={config.title}
      description={
        <>
          {config.description}
          {details && (
            <div className="mt-2 space-y-1 text-xs opacity-90">
              {details.limit !== undefined && (
                <div>Limit: {details.limit}</div>
              )}
              {details.usage !== undefined && (
                <div>Verwendet: {details.usage}</div>
              )}
              {details.remaining !== undefined && (
                <div>Verbleibend: {details.remaining}</div>
              )}
            </div>
          )}
        </>
      }
      actions={
        <AkButton
          variant="primary"
          size="sm"
          onClick={handleFix}
          leftIcon={<config.buttonIcon className="w-4 h-4" />}
        >
          {config.buttonText}
        </AkButton>
      }
    />
  )
}

/**
 * Parse error response to extract Launch Gate error information
 */
export function parseLaunchGateError(error: unknown): LaunchGateErrorCardProps | null {
  if (!error || typeof error !== 'object') {
    return null
  }

  const errorObj = error as Record<string, unknown>

  // Check if it's a Launch Gate error
  const errorCode = errorObj.error as string
  if (
    !errorCode ||
    !['integration_not_connected', 'quota_exceeded', 'plan_not_allowed', 'tenant_not_found'].includes(
      errorCode
    )
  ) {
    return null
  }

  return {
    errorCode: errorCode as LaunchGateErrorCardProps['errorCode'],
    message: errorObj.message as string | undefined,
    details: errorObj.details as LaunchGateErrorCardProps['details'],
  }
}


