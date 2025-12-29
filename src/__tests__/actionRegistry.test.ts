/**
 * Tests für Action Registry System
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ACTION_REGISTRY } from '@/lib/actions/registry'
import { validateActionRegistry } from '@/lib/actions/validate'
import { getActionsForUI, getPrimaryActions, getSecondaryActions } from '@/lib/actions/selectors'
import { getActionIcon } from '@/lib/actions/icons'
import { validateContext } from '@/lib/actions/contextValidators'
import type { ActionContext } from '@/lib/actions/types'

describe('Action Registry', () => {
  describe('Registry Structure', () => {
    it('should have all required fields for each action', () => {
      const validation = validateActionRegistry()
      expect(validation.valid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should have unique action IDs', () => {
      const ids = Object.keys(ACTION_REGISTRY)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })

    it('should have valid uiPlacement values', () => {
      const validPlacements = ['primary', 'secondary', 'menu', 'hidden']
      for (const action of Object.values(ACTION_REGISTRY)) {
        expect(validPlacements).toContain(action.uiPlacement)
      }
    })

    it('should have uiOrder set for all actions', () => {
      for (const action of Object.values(ACTION_REGISTRY)) {
        expect(action.uiOrder).toBeDefined()
        expect(typeof action.uiOrder).toBe('number')
      }
    })
  })

  describe('getActionsForUI', () => {
    it('should filter actions by module', () => {
      const inboxActions = getActionsForUI({ module: 'inbox' })
      expect(inboxActions.length).toBeGreaterThan(0)
      expect(inboxActions.every(a => a.supportedModules.includes('inbox'))).toBe(true)
    })

    it('should filter by placement', () => {
      const primaryActions = getActionsForUI({
        module: 'inbox',
        placement: ['primary'],
      })
      expect(primaryActions.every(a => a.uiPlacement === 'primary')).toBe(true)
    })

    it('should respect whitelist', () => {
      const actions = getActionsForUI({
        module: 'inbox',
        whitelist: ['inbox.summarize', 'inbox.draft_reply'],
      })
      expect(actions.length).toBeLessThanOrEqual(2)
      expect(actions.every(a => ['inbox.summarize', 'inbox.draft_reply'].includes(a.id))).toBe(true)
    })

    it('should respect blacklist', () => {
      const allActions = getActionsForUI({ module: 'inbox' })
      const filteredActions = getActionsForUI({
        module: 'inbox',
        blacklist: ['inbox.summarize'],
      })
      expect(filteredActions.length).toBeLessThan(allActions.length)
      expect(filteredActions.every(a => a.id !== 'inbox.summarize')).toBe(true)
    })

    it('should sort by uiOrder then label', () => {
      const actions = getActionsForUI({ module: 'inbox' })
      for (let i = 1; i < actions.length; i++) {
        const prev = actions[i - 1]
        const curr = actions[i]
        const orderPrev = prev.uiOrder ?? 1000
        const orderCurr = curr.uiOrder ?? 1000
        
        if (orderPrev === orderCurr) {
          expect(prev.label.localeCompare(curr.label, 'de')).toBeLessThanOrEqual(0)
        } else {
          expect(orderPrev).toBeLessThanOrEqual(orderCurr)
        }
      }
    })
  })

  describe('getPrimaryActions / getSecondaryActions', () => {
    it('should return only primary actions', () => {
      const primary = getPrimaryActions('inbox')
      expect(primary.every(a => a.uiPlacement === 'primary')).toBe(true)
    })

    it('should return only secondary actions', () => {
      const secondary = getSecondaryActions('inbox')
      expect(secondary.every(a => a.uiPlacement === 'secondary')).toBe(true)
    })
  })

  describe('getActionIcon', () => {
    it('should return icon component for valid icon name', () => {
      const Icon = getActionIcon('SparklesIcon')
      expect(Icon).toBeDefined()
    })

    it('should return default icon for unknown icon name', () => {
      const Icon = getActionIcon('UnknownIcon')
      expect(Icon).toBeDefined() // Should return default (SparklesIcon)
    })

    it('should return default icon for undefined', () => {
      const Icon = getActionIcon(undefined)
      expect(Icon).toBeDefined()
    })
  })

  describe('validateContext', () => {
    it('should validate inbox context with itemId', () => {
      const context: ActionContext = {
        module: 'inbox',
        moduleContext: {
          inbox: {
            itemId: 'test-item-123',
            threadId: 'test-thread-123',
            channel: 'email',
          },
        },
      }
      const result = validateContext('inbox', context)
      expect(result.ok).toBe(true)
    })

    it('should reject inbox context without itemId', () => {
      const context: ActionContext = {
        module: 'inbox',
        moduleContext: {},
      }
      const result = validateContext('inbox', context)
      expect(result.ok).toBe(false)
      expect(result.reason).toContain('itemId')
    })

    it('should validate documents context with documentId', () => {
      const context: ActionContext = {
        module: 'documents',
        moduleContext: {
          documents: {
            documentId: 'doc-123',
          },
        },
      }
      const result = validateContext('documents', context)
      expect(result.ok).toBe(true)
    })

    it('should validate crm context with customerId', () => {
      const context: ActionContext = {
        module: 'crm',
        moduleContext: {
          crm: {
            customerId: 'customer-123',
          },
        },
      }
      const result = validateContext('crm', context)
      expect(result.ok).toBe(true)
    })
  })
})

