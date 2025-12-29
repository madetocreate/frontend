/**
 * Security Guards Test Suite
 * 
 * Tests for tenant isolation and internal API key protection
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import {
  requireUserTenant,
  requireInternalApiKey,
  buildServiceToServiceHeaders,
  buildUserForwardHeaders,
  validateTenantMatch,
} from '../securityGuards'

// Mock environment variables
const originalEnv = process.env

beforeEach(() => {
  vi.resetModules()
  process.env = { ...originalEnv }
  // Clear any mocked modules
  vi.clearAllMocks()
})

describe('requireUserTenant', () => {
  describe('production mode', () => {
    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true, configurable: true })
      process.env.AUTH_SECRET = 'test-secret-key-32-characters-long'
    })

    it('should return 401 when no authorization header present', () => {
      const request = new NextRequest('http://localhost:3000/api/test')
      const result = requireUserTenant(request)
      
      expect(result).toBeInstanceOf(NextResponse)
      if (result instanceof NextResponse) {
        expect(result.status).toBe(401)
      }
    })

    it('should return 401 when JWT is invalid', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { authorization: 'Bearer invalid.jwt.token' }
      })
      const result = requireUserTenant(request)
      
      expect(result).toBeInstanceOf(NextResponse)
      if (result instanceof NextResponse) {
        expect(result.status).toBe(401)
      }
    })

    it('should NOT use env fallback in production', () => {
      process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID = 'fallback-tenant'
      process.env.ALLOW_ENV_TENANT_FALLBACK_DEV = 'true'
      
      const request = new NextRequest('http://localhost:3000/api/test')
      const result = requireUserTenant(request)
      
      expect(result).toBeInstanceOf(NextResponse)
      if (result instanceof NextResponse) {
        expect(result.status).toBe(401)
      }
    })
  })

  describe('development mode', () => {
    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true, configurable: true })
    })

    it('should return 401 when no auth and no fallback enabled', () => {
      const request = new NextRequest('http://localhost:3000/api/test')
      const result = requireUserTenant(request)
      
      expect(result).toBeInstanceOf(NextResponse)
      if (result instanceof NextResponse) {
        expect(result.status).toBe(401)
      }
    })

    it('should use env fallback when explicitly enabled', () => {
      process.env.ALLOW_ENV_TENANT_FALLBACK_DEV = 'true'
      process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID = 'dev-tenant'
      
      const request = new NextRequest('http://localhost:3000/api/test')
      const result = requireUserTenant(request)
      
      expect(result).toBe('dev-tenant')
    })

    it('should prefer JWT over env fallback', () => {
      process.env.ALLOW_ENV_TENANT_FALLBACK_DEV = 'true'
      process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID = 'dev-tenant'
      process.env.AUTH_SECRET = 'test-secret-key-32-characters-long'
      
      // Create valid JWT with tenantId
      const jwt = require('jsonwebtoken')
      const token = jwt.sign({ tenantId: 'jwt-tenant' }, process.env.AUTH_SECRET)
      
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: { authorization: `Bearer ${token}` }
      })
      const result = requireUserTenant(request)
      
      expect(result).toBe('jwt-tenant')
    })
  })
})

describe('requireInternalApiKey', () => {
  it('should throw in production when key missing and required', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true, configurable: true })
    delete process.env.INTERNAL_API_KEY
    
    expect(() => requireInternalApiKey({ required: true })).toThrow(/INTERNAL_API_KEY not configured/)
  })

  it('should return null in production when key missing and not required', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true, configurable: true })
    delete process.env.INTERNAL_API_KEY
    
    const result = requireInternalApiKey({ required: false })
    expect(result).toBeNull()
  })

  it('should return key when present', () => {
    process.env.INTERNAL_API_KEY = 'test-internal-key'
    
    const result = requireInternalApiKey()
    expect(result).toBe('test-internal-key')
  })

  it('should warn but not throw in dev when key missing', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true, configurable: true })
    delete process.env.INTERNAL_API_KEY
    
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = requireInternalApiKey()
    
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('INTERNAL_API_KEY not configured'))
    
    consoleSpy.mockRestore()
  })
})

describe('buildServiceToServiceHeaders', () => {
  it('should include tenant-id and internal-api-key', () => {
    process.env.INTERNAL_API_KEY = 'test-key'
    
    const headers = buildServiceToServiceHeaders({ 
      tenantId: 'test-tenant',
      includeInternalKey: true 
    })
    
    expect(headers['x-tenant-id']).toBe('test-tenant')
    expect(headers['x-internal-api-key']).toBe('test-key')
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('should exclude internal-api-key when includeInternalKey=false', () => {
    process.env.INTERNAL_API_KEY = 'test-key'
    
    const headers = buildServiceToServiceHeaders({ 
      tenantId: 'test-tenant',
      includeInternalKey: false 
    })
    
    expect(headers['x-tenant-id']).toBe('test-tenant')
    expect(headers['x-internal-api-key']).toBeUndefined()
  })

  it('should handle missing internal key gracefully', () => {
    delete process.env.INTERNAL_API_KEY
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true, configurable: true })
    
    const headers = buildServiceToServiceHeaders({ 
      tenantId: 'test-tenant',
      includeInternalKey: true 
    })
    
    expect(headers['x-tenant-id']).toBe('test-tenant')
    expect(headers['x-internal-api-key']).toBeUndefined()
  })
})

describe('buildUserForwardHeaders', () => {
  it('should forward authorization header', () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: { authorization: 'Bearer user-token' }
    })
    
    const headers = buildUserForwardHeaders(request)
    
    expect(headers['authorization']).toBe('Bearer user-token')
  })

  it('should generate request-id if not present', () => {
    const request = new NextRequest('http://localhost:3000/api/test')
    
    const headers = buildUserForwardHeaders(request)
    
    expect(headers['x-request-id']).toBeDefined()
    expect(headers['x-correlation-id']).toBeDefined()
    expect(headers['x-request-id']).toBe(headers['x-correlation-id'])
  })

  it('should propagate existing request-id and correlation-id', () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        'x-request-id': 'req-123',
        'x-correlation-id': 'corr-456'
      }
    })
    
    const headers = buildUserForwardHeaders(request)
    
    expect(headers['x-request-id']).toBe('req-123')
    expect(headers['x-correlation-id']).toBe('corr-456')
  })

  it('should NOT forward x-tenant-id from client', () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: { 
        'x-tenant-id': 'malicious-tenant',
        'authorization': 'Bearer token'
      }
    })
    
    const headers = buildUserForwardHeaders(request)
    
    expect(headers['x-tenant-id']).toBeUndefined()
  })

  it('should NOT forward cookies by default', () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: { 
        'cookie': 'session=abc123',
        'authorization': 'Bearer token'
      }
    })
    
    const headers = buildUserForwardHeaders(request)
    
    expect(headers['cookie']).toBeUndefined()
  })

  it('should forward cookies when explicitly enabled', () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: { 
        'cookie': 'session=abc123',
        'authorization': 'Bearer token'
      }
    })
    
    const headers = buildUserForwardHeaders(request, { includeCookies: true })
    
    expect(headers['cookie']).toBe('session=abc123')
  })
})

describe('validateTenantMatch', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-secret-key-32-characters-long'
  })

  it('should return null when no client tenant provided', () => {
    const request = new NextRequest('http://localhost:3000/api/test')
    const result = validateTenantMatch(request, undefined)
    
    expect(result).toBeNull()
  })

  it('should return 403 when client tenant does not match JWT', () => {
    const jwt = require('jsonwebtoken')
    const token = jwt.sign({ tenantId: 'real-tenant' }, process.env.AUTH_SECRET)
    
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: { authorization: `Bearer ${token}` }
    })
    
    const result = validateTenantMatch(request, 'fake-tenant')
    
    expect(result).toBeInstanceOf(NextResponse)
    if (result instanceof NextResponse) {
      expect(result.status).toBe(403)
    }
  })

  it('should return null when client tenant matches JWT', () => {
    const jwt = require('jsonwebtoken')
    const token = jwt.sign({ tenantId: 'matching-tenant' }, process.env.AUTH_SECRET)
    
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: { authorization: `Bearer ${token}` }
    })
    
    const result = validateTenantMatch(request, 'matching-tenant')
    
    expect(result).toBeNull()
  })
})

describe('anti-regression: no default tenants', () => {
  it('requireUserTenant should never return hardcoded defaults', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true, configurable: true })
    const request = new NextRequest('http://localhost:3000/api/test')
    const result = requireUserTenant(request)
    
    // Should be 401 response, NOT a string like 'aklow-main' or 'demo-tenant'
    expect(result).toBeInstanceOf(NextResponse)
    expect(result).not.toBe('aklow-main')
    expect(result).not.toBe('demo-tenant')
    expect(result).not.toBe('default')
  })
})

