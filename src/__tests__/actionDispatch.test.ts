/**
 * Tests for Action Dispatch system
 * 
 * FAIL-CLOSED: Tests prüfen, dass nur executable Actions dispatcht werden
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { dispatchActionStart } from '@/lib/actions/dispatch'
import { normalizeExecutableActionId, isExecutableActionId } from '@/lib/actions/registry'

describe('Action Dispatch', () => {
  let dispatchedEvents: CustomEvent[] = []

  beforeEach(() => {
    dispatchedEvents = []
    // Mock window.dispatchEvent
    if (typeof window !== 'undefined') {
      window.dispatchEvent = vi.fn((event: Event) => {
        dispatchedEvents.push(event as CustomEvent)
        return true
      }) as typeof window.dispatchEvent
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('dispatchActionStart', () => {
    it('should dispatch aklow-action-start event with correct structure for executable action', () => {
      const actionId = 'inbox.summarize'
      const context = { module: 'inbox', target: { type: 'inbox' } }
      const source = 'test'

      dispatchActionStart(actionId, context, undefined, source)

      expect(window.dispatchEvent).toHaveBeenCalledTimes(1)
      const event = dispatchedEvents[0] as CustomEvent
      expect(event.type).toBe('aklow-action-start')
      expect(event.detail).toEqual({
        actionId: 'inbox.summarize', // Normalized
        context,
        config: {},
        source,
      })
    })

    it('should normalize legacy alias to canonical action ID', () => {
      const actionId = 'inbox.draftReply' // Legacy alias
      dispatchActionStart(actionId)

      const event = dispatchedEvents[0] as CustomEvent
      expect(event.detail.actionId).toBe('inbox.draft_reply') // Normalized
    })

    it('should NOT dispatch for non-executable action', () => {
      const actionId = 'unknown.action'
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      dispatchActionStart(actionId)

      expect(window.dispatchEvent).not.toHaveBeenCalled()
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('ist nicht executable'),
        expect.any(Object)
      )

      consoleWarnSpy.mockRestore()
    })

    it('should include default source if not provided', () => {
      dispatchActionStart('inbox.summarize')

      const event = dispatchedEvents[0] as CustomEvent
      expect(event.detail.source).toBe('dispatchActionStart')
    })

    it('should handle undefined context and config', () => {
      dispatchActionStart('inbox.summarize', undefined, undefined, 'test')

      const event = dispatchedEvents[0] as CustomEvent
      expect(event.detail.context).toEqual({})
      expect(event.detail.config).toEqual({})
    })
  })

  describe('normalizeExecutableActionId', () => {
    it('should return executable action ID for valid action', () => {
      const result = normalizeExecutableActionId('inbox.summarize')
      expect(result).toBe('inbox.summarize')
      expect(isExecutableActionId(result!)).toBe(true)
    })

    it('should normalize legacy alias to canonical', () => {
      const result = normalizeExecutableActionId('inbox.draftReply')
      expect(result).toBe('inbox.draft_reply')
    })

    it('should return null for non-executable action', () => {
      const result = normalizeExecutableActionId('unknown.action')
      expect(result).toBeNull()
    })
  })
})

