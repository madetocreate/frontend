import { getTenantId } from '@/lib/tenant';
import { getToken } from '@/lib/auth';

function getAuthToken(): string | null {
  return getToken();
}

export interface FetchOptions extends RequestInit {
  tenantId?: string;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function fetchJson<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { tenantId: optionTenantId, ...init } = options;
  // Get tenantId from option, token, or throw error (no hardcoded fallback)
  const tenantId = optionTenantId ?? getTenantId();
  if (!tenantId) {
    throw new Error('Tenant ID is required. User must be authenticated.');
  }
  const token = getAuthToken();

  const headers = new Headers(init.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  headers.set('x-tenant-id', tenantId);
  
  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }

    if (response.status === 401) {
      // Optional: Clear tokens and redirect
      if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_AUTH_BYPASS) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }

    throw new ApiError(
      `API request failed: ${response.statusText}`,
      response.status,
      errorData
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

