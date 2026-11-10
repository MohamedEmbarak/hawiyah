import type {Locale} from './data';

/** The one button group demo shared by the preview, the code tab and every live editor framework. */
export function buttonGroupDemo(locale: Locale) {
  const t = (en: string, arabic: string) => (locale === 'ar' ? arabic : en);
  return (['horizontal', 'vertical'] as const).map(orientation => ({
    orientation,
    label: orientation === 'horizontal' ? t('Horizontal actions', 'إجراءات أفقية') : t('Vertical actions', 'إجراءات عمودية'),
    search: t('Search', 'بحث'), preview: t('Preview', 'معاينة'), remove: t('Delete', 'حذف'),
  }));
}

/** HTML for both groups. `values` adds data-value hooks for the live editor script; `pretty` indents for reading. */
export function buttonGroupMarkup(locale: Locale, {values = false, pretty = false} = {}) {
  const value = (name: string) => values ? ` data-value="${name}"` : '';
  const nl = pretty ? '\n' : '', i1 = pretty ? '  ' : '', i2 = pretty ? '    ' : '';
  const groups = buttonGroupDemo(locale).map(g => [
    `${i1}<div class="hw-button-group" role="group" aria-label="${g.label}" data-variant="attached" data-orientation="${g.orientation}">`,
    `${i2}<button type="button" class="hw-button hw-icon-button" data-variant="secondary" aria-label="${g.search}"${value('search')}><span class="hw-icon" data-icon="search-01" aria-hidden="true"></span></button>`,
    `${i2}<button type="button" class="hw-button" data-variant="secondary"${value('preview')}>${g.preview}</button>`,
    `${i2}<button type="button" class="hw-button" data-variant="secondary" disabled>${g.remove}</button>`,
    `${i1}</div>`,
  ].join(nl)).join(nl);
  return `<div class="hw-stack">${nl}${groups}${nl}${values ? `${i1}<output data-button-group-value></output>${nl}` : ''}</div>`;
}
