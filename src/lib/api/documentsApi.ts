/**
 * Documents API Client
 */

import { authedFetch } from './authedFetch';
import type { Document, DocumentQARequest, DocumentQAResponse } from '@/features/documents/types';

/**
 * Get all documents for tenant (including demo docs if includeDemo=true)
 */
export async function getDocuments(tenantId: string, includeDemo: boolean = true): Promise<Document[]> {
  const params = new URLSearchParams();
  if (includeDemo) {
    params.set('include_demo', 'true');
  }

  const response = await authedFetch(`/api/documents?${params.toString()}`);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch documents: ${error}`);
  }

  const data = await response.json();
  return Array.isArray(data.documents) ? data.documents : [];
}

/**
 * Get single document by ID
 */
export async function getDocument(documentId: string): Promise<Document> {
  const response = await authedFetch(`/api/documents/${documentId}`);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch document: ${error}`);
  }

  return response.json();
}

/**
 * Ask a question about a demo document
 */
export async function askDocumentQuestion(
  tenantId: string,
  request: DocumentQARequest
): Promise<DocumentQAResponse> {
  const response = await authedFetch('/api/v1/demo/docs/qa', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tenant_id: tenantId,
      document_id: request.document_id,
      question: request.question,
      plan: request.plan || 'free',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    
    if (response.status === 429) {
      throw new Error('Tageslimit erreicht. Maximal 10 Fragen pro Tag möglich.');
    }
    
    throw new Error(`Failed to ask question: ${error}`);
  }

  return response.json();
}
