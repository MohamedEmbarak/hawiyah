import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTypeahead, isTypeaheadKey } from '../src/index.js';

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });
const labels = ['Archive', 'Edit', 'Export', 'Help', 'Earlier'];

describe('createTypeahead', () => {
  it('[TYPE-01] returns the first match after the current entry and wraps', () => {
    const typeahead = createTypeahead();
    expect(typeahead.next('h', labels, 0)).toBe(3);
    typeahead.reset();
    expect(typeahead.next('a', labels, 3)).toBe(0);
    typeahead.reset();
    expect(typeahead.next('a', labels, -1)).toBe(0);
    typeahead.reset();
    expect(typeahead.next('z', labels, 0)).toBe(-1);
  });
  it('[TYPE-02] skips disabled entries', () => {
    const typeahead = createTypeahead();
    expect(typeahead.next('e', labels, 0, index => index === 1)).toBe(2);
    typeahead.reset();
    expect(typeahead.next('h', labels, 0, index => index === 3)).toBe(-1);
  });
  it('[TYPE-03] matches a prefix of two letters typed within the timeout', () => {
    const typeahead = createTypeahead();
    expect(typeahead.next('e', labels, 0)).toBe(1);
    vi.advanceTimersByTime(300);
    expect(typeahead.next('x', labels, 1)).toBe(2);
    typeahead.reset();
    expect(typeahead.next('e', labels, 0)).toBe(1);
    expect(typeahead.next('a', labels, 1)).toBe(4);
  });
  it('[TYPE-04] cycles through the entries that start with a repeated letter', () => {
    const typeahead = createTypeahead();
    expect(typeahead.next('e', labels, 0)).toBe(1);
    expect(typeahead.next('e', labels, 1)).toBe(2);
    expect(typeahead.next('e', labels, 2)).toBe(4);
    expect(typeahead.next('e', labels, 4)).toBe(1);
  });
  it('[TYPE-05] forgets the typed text after the timeout and on reset, and leaves no timer behind', () => {
    const typeahead = createTypeahead();
    expect(vi.getTimerCount()).toBe(0);
    expect(typeahead.next('e', labels, 0)).toBe(1);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(500);
    expect(vi.getTimerCount()).toBe(0);
    expect(typeahead.next('h', labels, 1)).toBe(3);
    typeahead.reset();
    expect(vi.getTimerCount()).toBe(0);
    expect(typeahead.next('a', labels, 3)).toBe(0);
    const quick = createTypeahead({ timeout: 100 });
    expect(quick.next('e', labels, 0)).toBe(1);
    vi.advanceTimersByTime(100);
    expect(quick.next('h', labels, 1)).toBe(3);
    quick.reset();
  });
  it('[TYPE-06] accepts one character without Ctrl, Meta or Alt and rejects space and named keys', () => {
    expect(isTypeaheadKey({ key: 'a' })).toBe(true); expect(isTypeaheadKey({ key: 'ب' })).toBe(true);
    expect(isTypeaheadKey({ key: '😀' })).toBe(true); expect(isTypeaheadKey({ key: 'A', ctrlKey: false, metaKey: false, altKey: false })).toBe(true);
    expect(isTypeaheadKey({ key: ' ' })).toBe(false); expect(isTypeaheadKey({ key: 'Enter' })).toBe(false);
    expect(isTypeaheadKey({ key: 'ArrowDown' })).toBe(false); expect(isTypeaheadKey({ key: 'a', ctrlKey: true })).toBe(false);
    expect(isTypeaheadKey({ key: 'a', metaKey: true })).toBe(false); expect(isTypeaheadKey({ key: 'a', altKey: true })).toBe(false);
    const typeahead = createTypeahead();
    expect(typeahead.next(' ', labels, 0)).toBe(-1);
    expect(typeahead.next('h', labels, 0)).toBe(3);
    typeahead.reset();
  });
  it('[TYPE-07] folds Arabic and Latin labels through normalizeSearch', () => {
    const typeahead = createTypeahead();
    const arabic = ['الخدمات', 'أَحكام', 'إعدادات', 'Élan'];
    expect(typeahead.next('ا', arabic, 0)).toBe(1);
    expect(typeahead.next('ا', arabic, 1)).toBe(2);
    typeahead.reset();
    expect(typeahead.next('E', arabic, 0)).toBe(3);
    typeahead.reset();
  });
});
