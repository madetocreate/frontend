import { NextRequest, NextResponse } from 'next/server';
import { buildForwardAuthHeaders, getGatewayUrl, getAgentBackendUrl } from '@/app/api/_utils/proxyAuth';

interface SendMessageRequest {
  channel: 'email' | 'messenger' | 'review' | 'support';
  connectionId?: string; // ID der Integration/Connection
  identity?: {
    provider: string;
    from?: string;
  };
  to?: string;
  subject?: string;
  body: string;
  threadId?: string;
  inboxItemId?: string;
  reviewId?: string;
  metadata?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendMessageRequest = await request.json();
    const { channel, to, body: messageBody, subject, connectionId, identity, reviewId } = body;

    // Validierung
    if (!messageBody) {
      return NextResponse.json({ ok: false, error: 'Message body is required' }, { status: 400 });
    }

    if (channel === 'email' && (!to || !subject)) {
      return NextResponse.json({ ok: false, error: 'Email requires recipient and subject' }, { status: 400 });
    }

    // Backend URLs aus Environment (via helpers)
    const orchestratorUrl = getGatewayUrl(); // Node backend (port 4000)
    const agentUrl = getAgentBackendUrl(); // Python backend (port 8000)
    
    // Fallback Mock Mode wenn explizit Mock
    const isMock = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

    if (isMock) {
      console.log('[Mock Send] would send:', body);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      return NextResponse.json({ 
        ok: true, 
        messageId: `mock-${Date.now()}`,
        mock: true 
      });
    }

    let endpoint = '';
    let payload: any = {};
    const authHeaders = buildForwardAuthHeaders(request);

    // Routing Logic basierend auf Channel
    switch (channel) {
      case 'email':
        // Gmail via Orchestrator, other email via Agent
        if (identity?.provider === 'gmail') {
          endpoint = `${orchestratorUrl}/integrations/gmail/send`;
        } else {
          // Default Email Endpoint via Python Agent
          endpoint = `${agentUrl}/api/v1/communications/send`;
        }
        
        payload = {
          channel: 'email',
          recipient: to,
          subject,
          message: messageBody,
          connection_id: connectionId,
          ...body.metadata
        };
        break;

      case 'messenger':
        endpoint = `${orchestratorUrl}/integrations/telegram/send`;
        payload = {
          chat_id: to,
          text: messageBody,
          connection_id: connectionId
        };
        break;

      case 'review':
        if (!reviewId) {
          return NextResponse.json({ ok: false, error: 'Review ID required for review replies' }, { status: 400 });
        }
        // Reviews via Agent
        endpoint = `${agentUrl}/api/reviews/${reviewId}/post`;
        payload = {
          content: messageBody,
          ...body.metadata
        };
        break;
        
      default:
        // Generic Fallback via Agent
        endpoint = `${agentUrl}/api/v1/communications/send`;
        payload = {
          channel,
          recipient: to,
          message: messageBody,
          ...body.metadata
        };
    }

    console.log(`[Proxy] Sending to ${endpoint}`, payload);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Proxy] Upstream error:', response.status, errorText);
        return NextResponse.json({ 
          ok: false, 
          error: { code: 'UPSTREAM_ERROR', message: `Upstream failed: ${response.status}`, details: errorText } 
        }, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json({ ok: true, providerResponse: data });

    } catch (fetchError: any) {
      console.error('[Proxy] Network error:', fetchError);
      // Fallback für Development wenn Backend nicht läuft -> Mock Success
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Proxy] Dev fallback: Assuming success despite error');
        await new Promise(resolve => setTimeout(resolve, 800));
        return NextResponse.json({ ok: true, messageId: 'dev-fallback-id', warning: 'Dev fallback used' });
      }
      return NextResponse.json({ ok: false, error: { code: 'NETWORK_ERROR', message: fetchError.message } }, { status: 502 });
    }

  } catch (error: any) {
    console.error('Error in send route:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
