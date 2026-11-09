import { expect, it } from 'vitest';
import { formatRiyal, riyalAmount } from '../apps/playground/src/currency';

it('normalizes supplied digits and preserves precision while exposing a currency name', () => {
  const host = document.createElement('div'); host.innerHTML = riyalAmount('١٢٣٫٤٥', 'ar');
  expect(host.querySelector('.hw-riyal')?.textContent).toBe('⃁');
  expect(host.querySelector('.hw-riyal')?.getAttribute('aria-hidden')).toBe('true');
  expect(host.querySelector('.hw-sr-only')?.textContent).toBe('ريال سعودي');
  expect(host.querySelector('bdi')?.firstChild?.textContent).toBe('123.45 ');
  host.innerHTML = riyalAmount('<script>', 'en'); expect(host.querySelector('script')).toBeNull();
});

it('uses Latin Intl SAR numeric parts and the riyal symbol', () => {
  for (const locale of ['ar', 'en'] as const) {
    const parts = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en', { numberingSystem: 'latn', style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).formatToParts(1234.6);
    const host = document.createElement('div'); host.innerHTML = formatRiyal(1234.6, locale);
    host.querySelector('.hw-sr-only')!.remove();
    expect(host.textContent).toBe(parts.map(part => part.type === 'currency' ? '⃁' : part.value).join(''));
  }
});
