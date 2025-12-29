import { NextRequest, NextResponse } from "next/server";
import { requireUserTenant, buildServiceToServiceHeaders, validateTenantMatch } from "@/lib/server/securityGuards";

import { BackendUrls } from '@/app/api/_utils/proxyAuth'

export const runtime = "nodejs";

function normalizeBaseUrl(url: string | undefined | null): string {
  if (!url) return "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // SECURITY: Enforce user authentication & extract tenant from JWT
  const tenantId = requireUserTenant(req);
  if (tenantId instanceof NextResponse) {
    return tenantId; // 401 if no auth
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body must be an object" }, { status: 400 });
  }

  // Extract other fields from body (tenantId is ignored, comes from auth)
  const { query, limit, filters, projectId } = body as Record<string, unknown>;
  // Query kann leer sein (für "alle Items" Suche)
  const searchQuery = typeof query === "string" ? query.trim() : "";

  // Normalisiere Filter: Akzeptiere sowohl UI-Keys (memoryKind, sourceType) als auch kanonische Keys (memory_kind, source_type, types)
  // und mappe intern auf kanonisch: memory_kind (Array), source_type (Array)
  const filtersObj = filters && typeof filters === "object" ? filters as Record<string, unknown> : {};
  
  // Extrahiere memory_kind aus verschiedenen Quellen (Priorität: memory_kind > memoryKind > types)
  let memoryKind: string[] | undefined = undefined;
  if (Array.isArray(filtersObj.memory_kind) && filtersObj.memory_kind.length > 0) {
    memoryKind = filtersObj.memory_kind as string[];
  } else if (Array.isArray(filtersObj.memoryKind) && filtersObj.memoryKind.length > 0) {
    memoryKind = filtersObj.memoryKind as string[];
  } else if (Array.isArray(filtersObj.types) && filtersObj.types.length > 0) {
    memoryKind = filtersObj.types as string[];
  }
  
  // Extrahiere source_type aus verschiedenen Quellen (Priorität: source_type > sourceType)
  let sourceType: string[] | undefined = undefined;
  if (Array.isArray(filtersObj.source_type) && filtersObj.source_type.length > 0) {
    sourceType = filtersObj.source_type as string[];
  } else if (Array.isArray(filtersObj.sourceType) && filtersObj.sourceType.length > 0) {
    sourceType = filtersObj.sourceType as string[];
  }

  const payload: Record<string, unknown> = {
    tenant_id: tenantId,
    query: searchQuery,
    limit: typeof limit === "number" && Number.isFinite(limit) ? limit : 20,
  };

  // Füge projectId hinzu, falls vorhanden (für Project-only Memory)
  if (typeof projectId === "string" && projectId.trim()) {
    payload.project_id = projectId.trim();
  }

  // Baue Filters nur, wenn tatsächlich Filter vorhanden sind
  const filtersPayload: Record<string, unknown> = {};
  if (memoryKind) {
    filtersPayload.memory_kind = memoryKind;
  }
  if (sourceType) {
    filtersPayload.source_type = sourceType;
  }
  
  // Canonical: projectId auch in filters.entity_refs setzen
  if (typeof projectId === "string" && projectId.trim()) {
    if (!filtersPayload.entity_refs) {
      filtersPayload.entity_refs = {};
    }
    (filtersPayload.entity_refs as Record<string, unknown>).project_id = projectId.trim();
  }
  
  // Nur mitsenden, wenn etwas drin ist
  if (Object.keys(filtersPayload).length > 0) {
    payload.filters = filtersPayload;
  }

  const targetUrl = `${normalizeBaseUrl(BackendUrls.agent())}/memory/search`;
  
  // Build secure service-to-service headers
  const headers = buildServiceToServiceHeaders({ 
    tenantId, 
    includeInternalKey: true 
  });
  
  // Optional legacy fallback: MEMORY_API_SECRET (only if INTERNAL_API_KEY not set)
  if (!process.env.INTERNAL_API_KEY && process.env.MEMORY_API_SECRET) {
    headers["Authorization"] = `Bearer ${process.env.MEMORY_API_SECRET}`;
  }

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let result: unknown = null;

    if (text) {
      try {
        result = JSON.parse(text);
      } catch {
        result = { raw: text };
      }
    }

    // Wenn der Response nicht OK ist, gib mehr Details zurück
    if (!response.ok) {
      console.error("Memory search API error:", {
        status: response.status,
        statusText: response.statusText,
        url: targetUrl,
        payload,
        result
      });
      return NextResponse.json(
        { 
          error: `Memory search failed: ${response.status} ${response.statusText}`,
          details: result,
          url: targetUrl
        },
        { status: response.status }
      );
    }

    return NextResponse.json(result ?? {}, { status: response.status });
  } catch (error) {
    console.error("Memory search fetch error:", error);
    return NextResponse.json(
      { 
        error: "Failed to call memory search API",
        message: error instanceof Error ? error.message : String(error),
        url: targetUrl
      },
      { status: 500 }
    );
  }
}
