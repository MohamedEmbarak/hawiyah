import type { Locale } from './data';

/** Both demos use the same copyable recipe, including in the isolated editor. */
export function loaderDemo(locale: Locale): string {
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  const base = import.meta.env.BASE_URL;
  const picture = (suffix: string, mode: string) => `<span class="nq-brand-loader-${mode}">
      <img class="nq-brand-loader-motion" src="${base}brand/assets/nasaq-loader${suffix}.gif" alt="" width="64" height="64">
      <img class="nq-brand-loader-static" src="${base}brand/assets/nasaq-symbol${suffix}.svg" alt="" width="64" height="64">
    </span>`;
  return `<div class="nq-inline" style="--nq-layout-gap:2rem;flex-wrap:wrap">
  <div class="nq-stack"><span>${t('CSS spinner', 'مؤشر التحميل')}</span>
    <span class="nq-spinner" role="status"><span class="nq-sr-only">${t('Loading request details', 'جارٍ تحميل تفاصيل الطلب')}</span></span>
  </div>
  <div class="nq-stack"><span>${t('Animated Nasaq identity', 'هوية نسق المتحركة')}</span>
    <span class="nq-brand-loader brand-loader" role="status">
      ${picture('', 'light')}${picture('-white', 'dark')}
      <span class="nq-sr-only">${t('Loading request details', 'جارٍ تحميل تفاصيل الطلب')}</span>
    </span>
  </div>
</div>`;
}
