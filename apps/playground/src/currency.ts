import { normalizeDigits } from '@hawiyah/core';
import { escape as e, type Locale } from './data';

/** Keep visible text as U+20C1; assistive technology gets the currency's name. */
function symbol(locale: Locale): string {
  return `<span class="hw-riyal" aria-hidden="true">⃁</span><span class="hw-sr-only">${locale === 'ar' ? 'ريال سعودي' : 'Saudi riyals'}</span>`;
}

/** Wrap an already formatted amount using Latin digits while preserving precision. */
export function riyalAmount(amount: string, locale: Locale, position: 'before' | 'after' = 'after'): string {
  amount = normalizeDigits(amount).replace(/\u066b/gu, '.').replace(/\u066c/gu, ',');
  return `<bdi>${position === 'before' ? `${symbol(locale)} ${e(amount)}` : `${e(amount)} ${symbol(locale)}`}</bdi>`;
}

/** Retain Intl's numeric formatting and SAR machine code; replace only its currency part. */
export function formatRiyal(amount: number, locale: Locale): string {
  const parts = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en', {
    style: 'currency', currency: 'SAR', maximumFractionDigits: 0, numberingSystem: 'latn',
  }).formatToParts(amount);
  return `<bdi>${parts.map(part => part.type === 'currency' ? symbol(locale) : e(part.value)).join('')}</bdi>`;
}
