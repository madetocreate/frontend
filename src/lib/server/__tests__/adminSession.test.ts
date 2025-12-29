/**
 * Tests für Admin-Session-Verifikation
 * 
 * Prüft:
 * - Invalid cookie → false
 * - Expired cookie → false
 * - Valid signed cookie (mit known secret) → true
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { isValidAdminSession } from '../adminGate'

// Mock crypto module
vi.mock('crypto', () => {
  const actual = vi.importActual('crypto')
  return {
    ...actual,
    createHmac: vi.fn((algorithm: string, secret: string) => {
      return {
        update: vi.fn((data: string) => {
          return {
            digest: vi.fn((encoding: string) => {
              // Simple mock: return base64url of "sig" for known secret
              if (secret === 'test-secret') {
                return 'dGVzdC1zaWc' // base64url of "test-sig"
              }
              return 'invalid-sig'
            }),
          }
        }),
      }
    }),
    timingSafeEqual: vi.fn((a: Buffer, b: Buffer) => {
      return a.toString() === b.toString()
    }),
  }
})

describe('isValidAdminSession', () => {
  beforeEach(() => {
    // Set test secret
    process.env.ADMIN_GATE_SECRET = 'test-secret'
  })

  it('should return false for missing cookie', () => {
    const request = new NextRequest('http://localhost:3000')
    expect(isValidAdminSession(request)).toBe(false)
  })

  it('should return false for invalid cookie format', () => {
    const request = new NextRequest('http://localhost:3000', {
      headers: {
        cookie: 'ak_admin_session=invalid-format',
      },
    })
    expect(isValidAdminSession(request)).toBe(false)
  })

  it('should return false for expired cookie', () => {
    // Cookie mit Timestamp vor 9 Stunden (TTL ist 8h)
    const oldTimestamp = Math.floor(Date.now() / 1000) - (9 * 60 * 60)
    const request = new NextRequest('http://localhost:3000', {
      headers: {
        cookie: `ak_admin_session=${oldTimestamp}.dGVzdC1zaWc`,
      },
    })
    expect(isValidAdminSession(request)).toBe(false)
  })

  it('should return false for invalid signature', () => {
    const now = Math.floor(Date.now() / 1000)
    const request = new NextRequest('http://localhost:3000', {
      headers: {
        cookie: `ak_admin_session=${now}.invalid-sig`,
      },
    })
    expect(isValidAdminSession(request)).toBe(false)
  })

  it('should return true for valid signed cookie', () => {
    const now = Math.floor(Date.now() / 1000)
    // Mock: timingSafeEqual returns true for matching signatures
    const crypto = require('crypto')
    vi.spyOn(crypto, 'timingSafeEqual').mockReturnValue(true)
    
    const request = new NextRequest('http://localhost:3000', {
      headers: {
        cookie: `ak_admin_session=${now}.dGVzdC1zaWc`,
      },
    })
    expect(isValidAdminSession(request)).toBe(true)
  })

  it('should return false when ADMIN_GATE_SECRET is missing', () => {
    delete process.env.ADMIN_GATE_SECRET
    const now = Math.floor(Date.now() / 1000)
    const request = new NextRequest('http://localhost:3000', {
      headers: {
        cookie: `ak_admin_session=${now}.dGVzdC1zaWc`,
      },
    })
    expect(isValidAdminSession(request)).toBe(false)
  })
})

