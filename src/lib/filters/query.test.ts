import { describe, test, expect } from 'vitest';
import { countActiveFilters, FilterParams } from './query';

describe('countActiveFilters', () => {
  test('counts simple filters correctly', () => {
    const params: FilterParams = {
      src: ['email'],
      status: 'open',
      range: '7d'
    };
    expect(countActiveFilters(params)).toBe(3);
  });

  test('does not count default range "all"', () => {
    const params: FilterParams = {
      range: 'all'
    };
    expect(countActiveFilters(params)).toBe(0);
  });

  test('counts type filter correctly (not double)', () => {
    const params: FilterParams = {
      type: 'contact'
    };
    expect(countActiveFilters(params)).toBe(1);
  });

  test('does not count type "template" (default for actions)', () => {
    const params: FilterParams = {
      type: 'template'
    };
    expect(countActiveFilters(params)).toBe(0);
  });

  test('counts range filter only once', () => {
    const params: FilterParams = {
      range: 'today'
    };
    expect(countActiveFilters(params)).toBe(1);
  });

  test('counts multiple complex filters correctly', () => {
    const params: FilterParams = {
      src: ['email', 'chat'],
      status: 'needs_action',
      cat: ['marketing'],
      tag: ['vip'],
      ch: ['whatsapp']
    };
    expect(countActiveFilters(params)).toBe(5);
  });
});

