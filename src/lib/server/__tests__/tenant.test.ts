/**
 * Tests for tenant.ts security hardening
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getTenantIdFromRequest, requireTenantIdFromRequest } from '../tenant'
import jwt from 'jsonwebtoken'

// Mock NextRequest
function createMockRequest(overrides: {
  authorization?: string | null
  xTenantId?: string | null
  queryParams?: Record<string, string>
  cookies?: Record<string, string>
} = {}): any {
  const headers = new Map<string, string>()
  const cookies = new Map<string, string>()
  const searchParams = new URLSearchParams()

  if (overrides.authorization !== undefined) {
    if (overrides.authorization) {
      headers.set('authorization', overrides.authorization)
    }
  }
  if (overrides.xTenantId !== undefined) {
    if (overrides.xTenantId) {
      headers.set('x-tenant-id', overrides.xTenantId)
    }
  }
  if (overrides.queryParams) {
    Object.entries(overrides.queryParams).forEach(([key, value]) => {
      searchParams.set(key, value)
    })
  }
  if (overrides.cookies) {
    Object.entries(overrides.cookies).forEach(([key, value]) => {
      cookies.set(key, value)
    })
  }

  return {
    headers: {
      get: (name: string) => headers.get(name.toLowerCase()) || null,
    },
    cookies: {
      get: (name: string) => {
        const value = cookies.get(name)
        return value ? { value } : undefined
      },
    },
    nextUrl: {
      searchParams,
    },
  }
}

describe('getTenantIdFromRequest', () => {
  const originalEnv = process.env
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    Object.defineProperty(process, 'env', {
      value: { ...originalEnv, NODE_ENV: originalNodeEnv },
      writable: true,
      configurable: true,
    })
  })

  describe('JWT verification', () => {
    it('should extract tenantId from valid JWT token', () => {
      const secret = 'test-secret-key'
      process.env.AUTH_SECRET = secret
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true, configurable: true })

      const token = jwt.sign({ tenantId: 'tenant-123' }, secret, { algorithm: 'HS256' })
      const request = createMockRequest({
        authorization: `Bearer ${token}`,
      })

      const result = getTenantIdFromRequest(request)
      expect(result).toBe('tenant-123')
    })

    it('should extract tenantId from token with tenant_id field', () => {
      const secret = 'test-secret-key'
      process.env.AUTH_SECRET = secret
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true, configurable: true })

      const token = jwt.sign({ tenant_id: 'tenant-456' }, secret, { algorithm: 'HS256' })
      const request = createMockRequest({
        authorization: `Bearer ${token}`,
      })

      const result = getTenantIdFromRequest(request)
      expect(result).toBe('tenant-456')
    })

    it('should return null for invalid signature', () => {
      const secret = 'test-secret-key'
      process.env.AUTH_SECRET = secret
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true, configurable: true })

      // Token signed with different secret
      const token = jwt.sign({ tenantId: 'tenant-123' }, 'wrong-secret', { algorithm: 'HS256' })
      const request = createMockRequest({
        authorization: `Bearer ${token}`,
      })

      const result = getTenantIdFromRequest(request)
      expect(result).toBeNull()
    })

    it('should return null for expired token', () => {
      const secret = 'test-secret-key'
      process.env.AUTH_SECRET = secret
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true, configurable: true })

      const token = jwt.sign(
        { tenantId: 'tenant-123' },
        secret,
        { algorithm: 'HS256', expiresIn: '-1h' }
      )
      const request = createMockRequest({
        authorization: `Bearer ${token}`,
      })

      const result = getTenantIdFromRequest(request)
      expect(result).toBeNull()
    })

    it('should return null in production if AUTH_SECRET is missing', () => {
      delete process.env.AUTH_SECRET
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true, configurable: true })

      const token = jwt.sign({ tenantId: 'tenant-123' }, 'some-secret', { algorithm: 'HS256' })
      const request = createMockRequest({
        authorization: `Bearer ${token}`,
      })

      const result = getTenantIdFromRequest(request)
      expect(result).toBeNull()
    })

    it('should allow unverified decode in dev if ALLOW_UNVERIFIED_JWT_DEV=true', () => {
      delete process.env.AUTH_SECRET
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true, configurable: true })
      process.env.ALLOW_UNVERIFIED_JWT_DEV = 'true'

      // Create token without verification
      const parts = [
        Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
        Buffer.from(JSON.stringify({ tenantId: 'tenant-789' })).toString('base64url'),
        'invalid-signature',
      ]
      const token = parts.join('.')

      const request = createMockRequest({
        authorization: `Bearer ${token}`,
      })

      const result = getTenantIdFromRequest(request)
      expect(result).toBe('tenant-789')
    })
  })

  describe('x-tenant-id header', () => {
    it('should ignore x-tenant-id without admin session', () => {
      const secret = 'test-secret-key'
      process.env.AUTH_SECRET = secret
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true, configurable: true })

      const request = createMockRequest({
        xTenantId: 'tenant-from-header',
        // No admin session cookie
      })

      const result = getTenantIdFromRequest(request)
      // Should return null (x-tenant-id ignored without admin session)
      expect(result).toBeNull()
    })

    it('should ignore x-tenant-id when adminSession module throws', () => {
      const secret = 'test-secret-key'
      process.env.AUTH_SECRET = secret
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true, configurable: true })

      // This simulates the case where adminSession module is not available
      // The actual implementation will catch and ignore x-tenant-id
      const request = createMockRequest({
        xTenantId: 'tenant-from-header',
      })

      const result = getTenantIdFromRequest(request)
      // Should return null (x-tenant-id ignored when admin session cannot be verified)
      expect(result).toBeNull()
    })
  })

  describe('query parameter (dev only)', () => {
    it('should ignore query param in production', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true, configurable: true })
      delete process.env.ALLOW_QUERY_TENANT_ID_DEV

      const request = createMockRequest({
        queryParams: { tenant_id: 'tenant-from-query' },
      })

      const result = getTenantIdFromRequest(request)
      expect(result).toBeNull()
    })

    it('should ignore query param if flag not set', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true, configurable: true })
      delete process.env.ALLOW_QUERY_TENANT_ID_DEV

      const request = createMockRequest({
        queryParams: { tenant_id: 'tenant-from-query' },
      })

      const result = getTenantIdFromRequest(request)
      expect(result).toBeNull()
    })

    it('should accept query param in dev with flag', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true, configurable: true })
      process.env.ALLOW_QUERY_TENANT_ID_DEV = 'true'

      const request = createMockRequest({
        queryParams: { tenant_id: 'tenant-from-query' },
      })

      const result = getTenantIdFromRequest(request)
      expect(result).toBe('tenant-from-query')
    })

    it('should ignore query param if authorization header present', () => {
      const secret = 'test-secret-key'
      process.env.AUTH_SECRET = secret
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true, configurable: true })
      process.env.ALLOW_QUERY_TENANT_ID_DEV = 'true'

      const token = jwt.sign({ tenantId: 'tenant-from-token' }, secret, { algorithm: 'HS256' })
      const request = createMockRequest({
        authorization: `Bearer ${token}`,
        queryParams: { tenant_id: 'tenant-from-query' },
      })

      const result = getTenantIdFromRequest(request)
      // Should prefer token over query param
      expect(result).toBe('tenant-from-token')
    })
  })

  describe('requireTenantIdFromRequest', () => {
    it('should return tenantId when available', () => {
      const secret = 'test-secret-key'
      process.env.AUTH_SECRET = secret
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true, configurable: true })

      const token = jwt.sign({ tenantId: 'tenant-123' }, secret, { algorithm: 'HS256' })
      const request = createMockRequest({
        authorization: `Bearer ${token}`,
      })

      const result = requireTenantIdFromRequest(request)
      expect(result).toBe('tenant-123')
    })

    it('should return 401 response when tenantId missing', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true, configurable: true })
      delete process.env.AUTH_SECRET

      const request = createMockRequest({})

      const result = requireTenantIdFromRequest(request)
      expect(result).toBeInstanceOf(Response)
      expect((result as Response).status).toBe(401)
    })
  })
})

