/**
 * Documents Types
 */

export interface Document {
  id: string;
  tenant_id: string;
  filename: string;
  mime_type?: string;
  classification?: {
    type?: string;
    [key: string]: unknown;
  };
  metadata?: Record<string, unknown>;
  created_at: string;
  is_demo?: boolean;
  deleted_at?: string | null;
  demo_source?: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  chunk_order: number;
  section_title?: string | null;
  text_content: string;
}

export interface DocumentQARequest {
  document_id: string;
  question: string;
  plan?: string;
}

export interface DocumentQAResponse {
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
