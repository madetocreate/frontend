/**
 * DEPRECATED: Use buildServiceToServiceHeaders from @/lib/server/securityGuards instead
 * 
 * This utility is kept for backwards compatibility during migration but should not be used in new code.
 * The default tenantId parameter is a SECURITY RISK.
 * 
 * ⚠️ DO NOT USE: This function will throw an error to prevent security regressions.
 */

import { BackendUrls } from '@/app/api/_utils/proxyAuth'

// Use centralized BackendUrls helper
const BACKEND_URL = BackendUrls.agent()

/**
 * @deprecated Use buildServiceToServiceHeaders from @/lib/server/securityGuards
 * 
 * SECURITY WARNING: This function has been disabled to prevent security regressions.
 * Use requireUserTenant() + buildServiceToServiceHeaders() instead.
 * 
 * @throws Error Always throws to prevent usage
 */
export function getBackendHeaders(tenantId: string) {
  throw new Error(
    '[SECURITY] getBackendHeaders is deprecated and disabled. ' +
    'Use requireUserTenant(request) + buildServiceToServiceHeaders({ tenantId, includeInternalKey: true }) instead. ' +
    'See: frontend/src/lib/server/securityGuards.ts'
  )
}

export { BACKEND_URL }

