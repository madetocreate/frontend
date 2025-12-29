/**
 * Tests for QuickAction to Action ID mapping
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mapUIActionToActionId, QUICK_ACTION_TO_ACTION_ID, UI_ACTION_TO_ACTION_ID } from '@/lib/quickActionToActionMapping'

describe('QuickAction Mapping', () => {
  describe('mapUIActionToActionId', () => {
    it('should map inbox_summary to inbox.summarize', () => {
      const result = mapUIActionToActionId('inbox_summary')
      expect(result).toBe('inbox.summarize')
    })

    it('should map reply_suggestion to inbox.draft_reply', () => {
      const result = mapUIActionToActionId('reply_suggestion')
      expect(result).toBe('inbox.draft_reply')
    })

    it('should map document_analysis to documents.extract_key_fields', () => {
      const result = mapUIActionToActionId('document_analysis')
      expect(result).toBe('documents.extract_key_fields')
    })

    it('should map task_extraction to inbox.next_steps', () => {
      const result = mapUIActionToActionId('task_extraction')
      expect(result).toBe('inbox.next_steps')
    })

    it('should map UI action "reply" to inbox.draft_reply', () => {
      const result = mapUIActionToActionId('reply')
      expect(result).toBe('inbox.draft_reply')
    })

    it('should map UI action "summarize" to inbox.summarize', () => {
      const result = mapUIActionToActionId('summarize')
      expect(result).toBe('inbox.summarize')
    })

    it('should return null for unknown action IDs', () => {
      const result = mapUIActionToActionId('unknown_action')
      expect(result).toBeNull()
    })
  })

  describe('QUICK_ACTION_TO_ACTION_ID', () => {
    it('should contain all expected quick action mappings', () => {
      expect(QUICK_ACTION_TO_ACTION_ID).toHaveProperty('inbox_summary', 'inbox.summarize')
      expect(QUICK_ACTION_TO_ACTION_ID).toHaveProperty('reply_suggestion', 'inbox.draft_reply')
      expect(QUICK_ACTION_TO_ACTION_ID).toHaveProperty('document_analysis', 'documents.extract_key_fields')
      expect(QUICK_ACTION_TO_ACTION_ID).toHaveProperty('task_extraction', 'inbox.next_steps')
    })
  })

  describe('UI_ACTION_TO_ACTION_ID', () => {
    it('should contain inbox action mappings', () => {
      expect(UI_ACTION_TO_ACTION_ID).toHaveProperty('reply', 'inbox.draft_reply')
      expect(UI_ACTION_TO_ACTION_ID).toHaveProperty('summarize', 'inbox.summarize')
      expect(UI_ACTION_TO_ACTION_ID).toHaveProperty('extract-tasks', 'inbox.next_steps')
    })

    it('should contain document action mappings', () => {
      expect(UI_ACTION_TO_ACTION_ID).toHaveProperty('extract-keypoints', 'documents.extract_key_fields')
    })
  })
})

