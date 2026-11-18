import { Texts } from '../../i18n/text';

export interface CatalogueTexts {
  readonly title: string;
  readonly summary: string;
  readonly empty: string;
  readonly documentTitle: string;
}

export const catalogueTexts: Texts<CatalogueTexts> = {
  en: {
    title: 'Components',
    summary: 'Components of Hawiyah that have a page in this guide, with their usage, examples and reference.',
    empty: 'No component page has been published in this guide yet.',
    documentTitle: 'Components · Hawiyah',
  },
  ar: {
    title: 'المكوّنات',
    summary: 'مكوّنات هوية التي لها صفحة في هذا الدليل، مع طريقة استخدامها وأمثلتها ومرجعها.',
    empty: 'لم تُنشر بعد أي صفحة مكوّن في هذا الدليل.',
    documentTitle: 'المكوّنات · هوية',
  },
};
