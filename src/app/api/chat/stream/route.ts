import { NextRequest, NextResponse } from 'next/server'
import { requireUserTenant, buildServiceToServiceHeaders, buildUserForwardHeaders } from '@/lib/server/securityGuards'

/**
 * Next.js Route Handler Proxy für Chat Stream-Endpoint (SSE)
 * 
 * SECURITY HARDENED:
 * - Tenant ID ONLY from authenticated JWT (no client input, no hardcoded fallbacks)
 * - Internal API key ONLY from process.env (never from request)
 * - Fails closed in production if authentication missing
 * 
 * Proxied zu Node Gateway (Port 4000) -> Python Backend (Port 8000)
 * Same-origin für Frontend, keine CORS-Probleme
 */
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Enforce user authentication & extract tenant from JWT
    const tenantId = requireUserTenant(request)
    if (tenantId instanceof NextResponse) {
      // Debug logging (dev only)
      if (process.env.NODE_ENV === 'development') {
        console.warn('[ChatStream] Authentication failed:', {
          hasAuthHeader: !!request.headers.get('authorization'),
          allowEnvFallback: process.env.ALLOW_ENV_TENANT_FALLBACK_DEV === 'true',
        });
      }
      return tenantId // 401 if no auth
    }
    
    const body = await request.json()
    
    // Backend URL - direkt auf Python Backend (Port 8000) statt Gateway (Port 4000)
    const backendUrl = process.env.AGENT_BACKEND_URL || process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || 'http://localhost:8000'
    
    // Build secure headers for service-to-service call
    const serviceHeaders = buildServiceToServiceHeaders({ 
      tenantId, 
      includeInternalKey: true 
    })
    
    // Forward user authentication context
    const forwardHeaders = buildUserForwardHeaders(request)
    
    // Debug logging (dev only)
    if (process.env.NODE_ENV === 'development') {
      console.debug('[ChatStream] Request details:', {
        tenantId,
        backendUrl,
        hasInternalKey: !!serviceHeaders['x-internal-api-key'],
        hasAuthHeader: !!forwardHeaders['authorization'],
      });
    }
    
    let response: Response
    try {
      response = await fetch(`${backendUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          accept: 'text/event-stream',
          ...serviceHeaders,
          ...forwardHeaders,
        },
        body: JSON.stringify(body),
      })
    } catch (fetchError) {
      // Connection error (ECONNREFUSED, network error, etc.)
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown connection error'
      console.error('[ChatStream] Connection error:', errorMessage, { backendUrl, tenantId })
      
      const errorResponse = {
        error: 'connection_error', 
        message: `Cannot connect to backend at ${backendUrl}. Is the Python Backend running on port 8000?`,
        details: { 
          backendUrl,
          originalError: errorMessage,
          ...(process.env.NODE_ENV !== 'production' && {
            hint: 'Make sure the Python Backend is running: cd backend-agents && ./start.sh',
            tenantId,
            hasInternalKey: !!serviceHeaders['x-internal-api-key'],
          })
        }
      }
      
      return new NextResponse(
        JSON.stringify(errorResponse),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      let errorData: unknown = { detail: errorText }
      try {
        errorData = JSON.parse(errorText)
      } catch {
        // Use text as detail
      }
      
      // Debug logging (dev only)
      if (process.env.NODE_ENV === 'development') {
        console.error('[ChatStream] Backend error:', {
          status: response.status,
          statusText: response.statusText,
          backendUrl,
          tenantId,
          errorData,
        });
      }
      
      const isAuthError = response.status === 401 || response.status === 403;
      const errorMessage = isAuthError 
        ? 'Authentication failed. Please check INTERNAL_API_KEY and backend configuration.'
        : 'Backend service returned an error';
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'backend_error', 
          message: errorMessage,
          details: {
            ...errorData,
            ...(process.env.NODE_ENV !== 'production' && isAuthError && {
              hint: 'Check INTERNAL_API_KEY matches between Next.js and Python backend',
            }),
          },
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    
    if (!response.body) {
      return new NextResponse(
        JSON.stringify({ error: 'stream_failed', message: 'No response body from backend' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    
    // Stream response (SSE) - pass through from Gateway
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    console.error('Chat stream proxy error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'proxy_error', message: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

