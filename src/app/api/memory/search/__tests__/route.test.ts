/**
 * Tests for /api/memory/search route filter mapping
 * 
 * Verifies that the proxy correctly maps UI keys (memoryKind, sourceType) 
 * and legacy keys (types) to canonical keys (memory_kind, source_type)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST } from '../route'
import jwt from 'jsonwebtoken'

// Mock getTenantIdFromRequest
vi.mock('@/lib/server/tenant', () => ({
  getTenantIdFromRequest: vi.fn(),
}))

// Mock fetch
global.fetch = vi.fn()

const originalEnv = process.env

function createMockRequest(body: any): any {
  return {
    json: async () => body,
    headers: {
      get: (name: string) => null,
    },
    cookies: {
      get: (name: string) => undefined,
    },
  }
}

describe('/api/memory/search filter mapping', () => {
  let getTenantIdFromRequest: any

  beforeEach(async () => {
    vi.resetModules()
    // Restore original env but allow modifications
    Object.keys(process.env).forEach(key => {
      if (!(key in originalEnv)) {
        delete (process.env as any)[key]
      }
    })
    Object.assign(process.env, originalEnv)
    process.env.AGENT_BACKEND_URL = 'http://localhost:8000'
    // NODE_ENV is read-only, skip assignment
    vi.clearAllMocks()
    ;(global.fetch as any).mockClear()
    
    const tenantModule = await import('@/lib/server/tenant')
    getTenantIdFromRequest = tenantModule.getTenantIdFromRequest
    ;(getTenantIdFromRequest as any).mockReturnValue('test-tenant-123')
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should map memoryKind to memory_kind in backend request', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ items: [] }),
    })

    const request = createMockRequest({
      query: 'test query',
      limit: 20,
      filters: {
        memoryKind: ['fact', 'preference'],
      },
    })

    await POST(request)

    expect(global.fetch).toHaveBeenCalled()
    const fetchCall = (global.fetch as any).mock.calls[0]
    const payload = JSON.parse(fetchCall[1].body)

    expect(payload.filters).toBeDefined()
    expect(payload.filters.memory_kind).toEqual(['fact', 'preference'])
    expect(payload.filters.source_type).toBeUndefined()
  })

  it('should map sourceType to source_type in backend request', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ items: [] }),
    })

    const request = createMockRequest({
      query: 'test query',
      limit: 20,
      filters: {
        sourceType: ['inbox', 'chat'],
      },
    })

    await POST(request)

    expect(global.fetch).toHaveBeenCalled()
    const fetchCall = (global.fetch as any).mock.calls[0]
    const payload = JSON.parse(fetchCall[1].body)

    expect(payload.filters).toBeDefined()
    expect(payload.filters.source_type).toEqual(['inbox', 'chat'])
    expect(payload.filters.memory_kind).toBeUndefined()
  })

  it('should map both memoryKind and sourceType to canonical keys', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ items: [] }),
    })

    const request = createMockRequest({
      query: 'test query',
      limit: 20,
      filters: {
        memoryKind: ['fact'],
        sourceType: ['inbox'],
      },
    })

    await POST(request)

    expect(global.fetch).toHaveBeenCalled()
    const fetchCall = (global.fetch as any).mock.calls[0]
    const payload = JSON.parse(fetchCall[1].body)

    expect(payload.filters).toBeDefined()
    expect(payload.filters.memory_kind).toEqual(['fact'])
    expect(payload.filters.source_type).toEqual(['inbox'])
  })

  it('should accept canonical keys (memory_kind, source_type) directly', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ items: [] }),
    })

    const request = createMockRequest({
      query: 'test query',
      limit: 20,
      filters: {
        memory_kind: ['preference'],
        source_type: ['chat'],
      },
    })

    await POST(request)

    expect(global.fetch).toHaveBeenCalled()
    const fetchCall = (global.fetch as any).mock.calls[0]
    const payload = JSON.parse(fetchCall[1].body)

    expect(payload.filters).toBeDefined()
    expect(payload.filters.memory_kind).toEqual(['preference'])
    expect(payload.filters.source_type).toEqual(['chat'])
  })

  it('should accept legacy types key and map to memory_kind', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ items: [] }),
    })

    const request = createMockRequest({
      query: 'test query',
      limit: 20,
      filters: {
        types: ['fact', 'instruction'],
      },
    })

    await POST(request)

    expect(global.fetch).toHaveBeenCalled()
    const fetchCall = (global.fetch as any).mock.calls[0]
    const payload = JSON.parse(fetchCall[1].body)

    expect(payload.filters).toBeDefined()
    expect(payload.filters.memory_kind).toEqual(['fact', 'instruction'])
  })

  it('should prioritize memory_kind over memoryKind over types', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ items: [] }),
    })

    const request = createMockRequest({
      query: 'test query',
      limit: 20,
      filters: {
        memory_kind: ['preference'], // Should win
        memoryKind: ['fact'], // Should be ignored
        types: ['instruction'], // Should be ignored
      },
    })

    await POST(request)

    expect(global.fetch).toHaveBeenCalled()
    const fetchCall = (global.fetch as any).mock.calls[0]
    const payload = JSON.parse(fetchCall[1].body)

    expect(payload.filters.memory_kind).toEqual(['preference'])
  })

  it('should prioritize source_type over sourceType', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ items: [] }),
    })

    const request = createMockRequest({
      query: 'test query',
      limit: 20,
      filters: {
        source_type: ['inbox'], // Should win
        sourceType: ['chat'], // Should be ignored
      },
    })

    await POST(request)

    expect(global.fetch).toHaveBeenCalled()
    const fetchCall = (global.fetch as any).mock.calls[0]
    const payload = JSON.parse(fetchCall[1].body)

    expect(payload.filters.source_type).toEqual(['inbox'])
  })

  it('should not include filters object if no filters are provided', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ items: [] }),
    })

    const request = createMockRequest({
      query: 'test query',
      limit: 20,
    })

    await POST(request)

    expect(global.fetch).toHaveBeenCalled()
    const fetchCall = (global.fetch as any).mock.calls[0]
    const payload = JSON.parse(fetchCall[1].body)

    expect(payload.filters).toBeUndefined()
  })

  it('should pass through query, limit, and tenant_id correctly', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ items: [] }),
    })

    const request = createMockRequest({
      query: 'semantic search query',
      limit: 50,
      filters: {
        memoryKind: ['fact'],
      },
    })

    await POST(request)

    expect(global.fetch).toHaveBeenCalled()
    const fetchCall = (global.fetch as any).mock.calls[0]
    const payload = JSON.parse(fetchCall[1].body)

    expect(payload.query).toBe('semantic search query')
    expect(payload.limit).toBe(50)
    expect(payload.tenant_id).toBe('test-tenant-123')
  })

  it('should set x-internal-api-key header and NOT forward User-Auth headers', async () => {
    process.env.INTERNAL_API_KEY = 'test-internal-key-123'
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ items: [] }),
    })

    const request = createMockRequest({
      query: 'test',
      limit: 20,
    })
    // Simulate incoming request with User-Auth header
    request.headers.get = (name: string) => {
      if (name === 'authorization') {
        return 'Bearer user-token-should-not-be-forwarded'
      }
      return null
    }

    await POST(request)

    expect(global.fetch).toHaveBeenCalled()
    const fetchCall = (global.fetch as any).mock.calls[0]
    const headers = fetchCall[1].headers

    // Should set x-internal-api-key
    expect(headers['x-internal-api-key']).toBe('test-internal-key-123')
    
    // Should NOT forward User-Auth header
    expect(headers['authorization']).toBeUndefined()
    expect(headers['Authorization']).toBeUndefined()
    
    // Should set Content-Type
    expect(headers['Content-Type']).toBe('application/json')
    
    delete process.env.INTERNAL_API_KEY
  })

  it('should use MEMORY_API_SECRET as legacy fallback if INTERNAL_API_KEY not set', async () => {
    delete process.env.INTERNAL_API_KEY
    process.env.MEMORY_API_SECRET = 'test-memory-secret-456'
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ items: [] }),
    })

    const request = createMockRequest({
      query: 'test',
      limit: 20,
    })

    await POST(request)

    expect(global.fetch).toHaveBeenCalled()
    const fetchCall = (global.fetch as any).mock.calls[0]
    const headers = fetchCall[1].headers

    // Should use MEMORY_API_SECRET as fallback
    expect(headers['Authorization']).toBe('Bearer test-memory-secret-456')
    
    // Should NOT have x-internal-api-key
    expect(headers['x-internal-api-key']).toBeUndefined()
    
    delete process.env.MEMORY_API_SECRET
  })
})

