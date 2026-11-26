import type { DocumentKind } from '../content/kinds';
import { Texts } from '../i18n/text';

/** Texts of the guides and templates pages: the index of each kind and the shared page texts. */
export interface DocumentKindTexts {
  /** The h1 and the navigation label of the index. */
  readonly title: string;
  /** The one paragraph under the h1 of the index; also its description. */
  readonly intro: string;
  /** The index without a built page. */
  readonly empty: string;
  readonly documentTitle: string;
  /** The document title of a page of the kind. */
  readonly pageTitle: (title: string) => string;
  /** The name of the list of the index. */
  readonly listLabel: string;
}

export interface DocumentTexts {
  readonly onThisPage: string;
  readonly kinds: Readonly<Record<DocumentKind, DocumentKindTexts>>;
}

export const documentTexts: Texts<DocumentTexts> = {
  en: {
    onThisPage: 'On this page',
    kinds: {
      guide: {
        title: 'Guides',
        intro: 'Guides explain how to use Hawiyah in an application, from installation to the use of several components together.',
        empty: 'No guide has been published in this guide yet.',
        documentTitle: 'Guides · Hawiyah',
        pageTitle: (title) => `${title} · Guides · Hawiyah`,
        listLabel: 'Published guides',
      },
      template: {
        title: 'Templates',
        intro: 'Templates show whole pages composed of Hawiyah components, each page in its states and with the components it uses.',
        empty: 'No template has been published in this guide yet.',
        documentTitle: 'Templates · Hawiyah',
        pageTitle: (title) => `${title} · Templates · Hawiyah`,
        listLabel: 'Published templates',
      },
    },
  },
  ar: {
    onThisPage: 'في هذه الصفحة',
    kinds: {
      guide: {
        title: 'الأدلة',
        intro: 'تشرح الأدلة طريقة استخدام هوية في التطبيق، من التثبيت إلى استخدام عدة مكوّنات معًا.',
        empty: 'لم يُنشر بعد أي دليل في هذا الموقع.',
        documentTitle: 'الأدلة · هوية',
        pageTitle: (title) => `${title} · الأدلة · هوية`,
        listLabel: 'الأدلة المنشورة',
      },
      template: {
        title: 'القوالب',
        intro: 'تعرض القوالب صفحات كاملة مركّبة من مكوّنات هوية، كل صفحة في حالاتها ومع المكوّنات التي تستخدمها.',
        empty: 'لم يُنشر بعد أي قالب في هذا الموقع.',
        documentTitle: 'القوالب · هوية',
        pageTitle: (title) => `${title} · القوالب · هوية`,
        listLabel: 'القوالب المنشورة',
      },
    },
  },
};
