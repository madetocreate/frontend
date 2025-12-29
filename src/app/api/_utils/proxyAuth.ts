import { NextRequest } from 'next/server'

/**
 * Builds authentication headers to forward to the gateway.
 * 
 * Rules:
 * - In production: Always forward Authorization header (no cookie fallback)
 * - In dev: Forward Authorization header, but dev_token cookie can override it
 * 
 * @param request - Next.js request object
 * @returns Headers object with authorization
 */
export function buildForwardAuthHeaders(request: NextRequest): Record<string, string> {
  const authHeader: Record<string, string> = {}
  const headerToken = request.headers.get('authorization')
  const cookieHeader = request.headers.get('cookie')
  
  // In dev: check for dev_token cookie first (overrides header)
  if (process.env.NODE_ENV !== 'production') {
    const cookieToken = request.cookies.get('dev_token')?.value
    if (cookieToken) {
      authHeader['authorization'] = cookieToken.startsWith('Bearer ') ? cookieToken : `Bearer ${cookieToken}`
    } else if (headerToken) {
      authHeader['authorization'] = headerToken
    }
  } else {
    // In production: only forward Authorization header (no cookie fallback)
    if (headerToken) {
      authHeader['authorization'] = headerToken
    }
  }

  // Always forward cookies for session-based auth (same-origin)
  if (cookieHeader) {
    authHeader['cookie'] = cookieHeader
  }
  
  return authHeader
}

/**
 * Gets the gateway URL from environment variables.
 * 
 * @returns Gateway URL (defaults to http://localhost:4000)
 */
export function getGatewayUrl(): string {
  return process.env.ORCHESTRATOR_API_URL || process.env.NEXT_PUBLIC_ORCHESTRATOR_API_URL || 'http://localhost:4000'
}

/**
 * Gets the agent backend URL from environment variables.
 * Used for Python backend routes (port 8000).
 * 
 * @returns Agent Backend URL (defaults to http://localhost:8000)
 */
export function getAgentBackendUrl(): string {
  return process.env.AGENT_BACKEND_URL || process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || 'http://localhost:8000'
}

/**
 * URL-Drift Fix: Centralized backend URL getters
 * 
 * P0-Blocker B: Eliminate BACKEND_URL drift
 * - Node Backend (Orchestrator): Use ORCHESTRATOR_API_URL (Port 4000)
 * - Python Backend (Agents): Use AGENT_BACKEND_URL (Port 8000)
 * 
 * NEVER use BACKEND_URL - it's ambiguous and causes production issues
 */
export const BackendUrls = {
  /**
   * Node Backend (Orchestrator/Gateway) - Port 4000
   * For: Inbox, Integrationen, Telephony, Website-Bot, Entitlements, Status-Checks
   */
  orchestrator: (): string => {
    return process.env.ORCHESTRATOR_API_URL || process.env.NEXT_PUBLIC_ORCHESTRATOR_API_URL || 'http://localhost:4000'
  },
  
  /**
   * Python Backend (Agents) - Port 8000
   * For: agentische Funktionen (z.B. Review-Bot Settings/Automationen)
   */
  agent: (): string => {
    return process.env.AGENT_BACKEND_URL || process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || 'http://localhost:8000'
  },
} as const

