import { describe, it, expect } from 'vitest';
import { normalizeInboxItem, isUniversalInboxItem } from '../guards';

describe('Inbox Guards', () => {
  describe('normalizeInboxItem', () => {
    it('should normalize a minimal item with defaults', () => {
      const raw = { id: '123' };
      const normalized = normalizeInboxItem(raw);
      
      expect(normalized.id).toBe('123');
      expect(normalized.channel).toBe('notifications');
      expect(normalized.sender).toBe('Unbekannter Absender');
      expect(normalized.title).toBe('Kein Titel');
      expect(normalized.snippet).toBe('');
      expect(typeof normalized.time).toBe('string');
    });

    it('should coerce channel to a valid value', () => {
      const raw = { id: '123', channel: 'INVALID' };
      const normalized = normalizeInboxItem(raw);
      expect(normalized.channel).toBe('notifications');
      
      const emailItem = normalizeInboxItem({ id: '1', channel: 'email' });
      expect(emailItem.channel).toBe('email');
    });

    it('should set threadId from id if missing', () => {
      const raw = { id: '123' };
      const normalized = normalizeInboxItem(raw);
      expect(normalized.threadId).toBe('123');
    });

    it('should handle complex metadata and nextAction', () => {
      const raw = {
        id: '123',
        nextAction: { label: 'Reply', tone: 'urgent' },
        meta: { some: 'data' }
      };
      const normalized = normalizeInboxItem(raw);
      expect(normalized.nextAction?.label).toBe('Reply');
      expect(normalized.nextAction?.tone).toBe('urgent');
      expect(normalized.meta).toEqual({ some: 'data' });
    });
  });

  describe('isUniversalInboxItem', () => {
    it('should return true for valid items', () => {
      const valid = {
        id: '1',
        channel: 'email',
        title: 'Title',
        sender: 'Sender',
        snippet: 'Snippet',
        time: '12:00'
      };
      expect(isUniversalInboxItem(valid)).toBe(true);
    });

    it('should return false for incomplete items', () => {
      expect(isUniversalInboxItem({ id: '1' })).toBe(false);
      expect(isUniversalInboxItem(null)).toBe(false);
      expect(isUniversalInboxItem('string')).toBe(false);
    });
  });
});

