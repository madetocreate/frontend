/**
 * Demo API Client
 * 
 * API Calls für Demo Mode (Inbox + Documents)
 */

import { authedFetch } from './authedFetch';

// ============================================================================
// TYPES
// ============================================================================

export interface EnsureDemoInboxResponse {
  ok: boolean;
  tenant_id: string;
  items_created: number;
  message: string;
}

export interface EnsureDemoDocsResponse {
  ok: boolean;
  tenant_id: string;
  docs_created: number;
  chunks_created: number;
  message: string;
}

export interface DemoDocQARequest {
  tenant_id: string;
  document_id: string;
  question: string;
  plan?: string;
}

export interface DemoDocQAResponse {
  ok: boolean;
  answer: string;
  citations: Array<{
    section_title: string | null;
    chunk_order: number;
  }>;
  model_used: string;
  cached: boolean;
  quota_remaining: number;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Ensure demo inbox items are seeded for the tenant.
 * Idempotent - only seeds if conditions are met.
 */
export async function ensureDemoInbox(tenantId: string): Promise<EnsureDemoInboxResponse> {
  const response = await authedFetch('/api/v1/demo/ensure-inbox', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tenant_id: tenantId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to ensure demo inbox: ${error}`);
  }

  return response.json();
}

/**
 * Ensure demo documents are seeded for the tenant.
 * Idempotent - only seeds if conditions are met.
 */
export async function ensureDemoDocs(tenantId: string): Promise<EnsureDemoDocsResponse> {
  const response = await authedFetch('/api/v1/demo/ensure-docs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tenant_id: tenantId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to ensure demo docs: ${error}`);
  }

  return response.json();
}

/**
 * Ask a question about a demo document.
 * 
 * Rate limited: 10 questions per day per tenant.
 * Cached: Same question returns cached answer.
 */
export async function askDemoDocQuestion(
  tenantId: string,
  documentId: string,
  question: string,
  plan?: string
): Promise<DemoDocQAResponse> {
  const response = await authedFetch('/api/v1/demo/docs/qa', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tenant_id: tenantId,
      document_id: documentId,
      question,
      plan: plan || 'free',
    } as DemoDocQARequest),
  });

  if (!response.ok) {
    const error = await response.text();
    
    // Special handling for rate limit
    if (response.status === 429) {
      throw new Error('Tageslimit erreicht. Maximal 10 Fragen pro Tag möglich.');
    }
    
    throw new Error(`Failed to ask demo doc question: ${error}`);
  }

  return response.json();
}
