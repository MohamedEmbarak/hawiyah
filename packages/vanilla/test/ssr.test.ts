// @vitest-environment node
import { expect, it } from 'vitest';
import { formatNumber } from '@hawiyah/core';
import { createCombobox, createDialog, createTabs, enhance } from '../src/index.js';

it('imports core and vanilla with no browser globals and makes default enhancement inert', () => {
  expect(typeof document).toBe('undefined');
  expect(formatNumber(123, { locale: 'en-US' })).toBe('123');
  expect(typeof createCombobox).toBe('function');
  expect(typeof createDialog).toBe('function');
  expect(typeof createTabs).toBe('function');
  const destroy = enhance();
  expect(() => { destroy(); destroy(); }).not.toThrow();
});
