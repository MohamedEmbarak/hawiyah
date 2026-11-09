import type { Locale } from './data';

/** Both demos use the same copyable recipe, including in the isolated editor. */
export function loaderDemo(locale: Locale): string {
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  const base = import.meta.env.BASE_URL;
  const picture = (suffix: string, mode: string) => `<span class="hw-brand-loader-${mode}">
      <img class="hw-brand-loader-motion" src="${base}brand/assets/hawiyah-loader${suffix}.gif" alt="" width="64" height="64">
      <img class="hw-brand-loader-static" src="${base}brand/assets/hawiyah-symbol${suffix}.svg" alt="" width="64" height="64">
    </span>`;
  return `<div class="hw-inline" style="--hw-layout-gap:2rem;flex-wrap:wrap">
  <div class="hw-stack"><span>${t('CSS spinner', 'مؤشر التحميل')}</span>
    <span class="hw-spinner" role="status"><span class="hw-sr-only">${t('Loading request details', 'جارٍ تحميل تفاصيل الطلب')}</span></span>
  </div>
  <div class="hw-stack"><span>${t('Animated Hawiyah identity', 'علامة هوية المتحركة')}</span>
    <span class="hw-brand-loader brand-loader" role="status">
      ${picture('', 'light')}${picture('-white', 'dark')}
      <span class="hw-sr-only">${t('Loading request details', 'جارٍ تحميل تفاصيل الطلب')}</span>
    </span>
  </div>
</div>`;
}
