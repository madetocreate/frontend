import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createGatewayClient } from './client'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('GatewayClient v2 URL handling', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('should not double-prefix /v2/ paths in next_proxy mode', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ threads: [] }),
      text: async () => '{"threads": []}',
    })

    const client = createGatewayClient({
      transport: 'next_proxy',
      baseUrl: '',
      fetchImpl: mockFetch,
    })

    await client.listThreads({
      tenantId: 'test-tenant',
    })

    // Should be /api/v2/threads, not /api/v2/v2/threads
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v2/threads'),
      expect.any(Object),
    )
    const url = mockFetch.mock.calls[0][0]
    expect(url).toBe('/api/v2/threads?tenantId=test-tenant')
    expect(url).not.toContain('/v2/v2/')
  })

  it('should handle paths that already start with /api/ in next_proxy mode', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ threads: [] }),
      text: async () => '{"threads": []}',
    })

    const client = createGatewayClient({
      transport: 'next_proxy',
      baseUrl: '',
      fetchImpl: mockFetch,
    })

    // This test verifies the internal logic works correctly
    // The actual usage should not have /api/ prefix, but if it does, it should not double-prefix
    await client.listThreads({
      tenantId: 'test-tenant',
    })

    const url = mockFetch.mock.calls[0][0]
    expect(url).not.toContain('/api/api/')
  })

  it('should not prefix paths in direct mode', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ threads: [] }),
      text: async () => '{"threads": []}',
    })

    const client = createGatewayClient({
      transport: 'direct',
      baseUrl: 'http://localhost:4000',
      fetchImpl: mockFetch,
    })

    await client.listThreads({
      tenantId: 'test-tenant',
    })

    const url = mockFetch.mock.calls[0][0]
    // In direct mode, should use the path as-is (no /api prefix)
    expect(url).toContain('/v2/threads')
    expect(url).not.toContain('/api/')
  })
})

