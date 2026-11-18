import { Texts } from '../../i18n/text';

export interface ComponentPageTexts {
  /** Name of the content navigation of a reference view. */
  readonly onThisPage: string;
  /** Link from a brief view to its reference view. */
  readonly fullReference: string;
  /** Name of the side navigation, title of the navigation drawer and text of its button. */
  readonly sideNavLabel: string;
  /** Name of the drawer's close button. */
  readonly close: string;
  /** Document title of a brief view. */
  readonly briefTitle: (name: string) => string;
  /** Document title of a reference view. */
  readonly referenceTitle: (name: string) => string;
}

export const componentPageTexts: Texts<ComponentPageTexts> = {
  en: {
    onThisPage: 'On this page',
    fullReference: 'Full reference',
    sideNavLabel: 'Component pages',
    close: 'Close',
    briefTitle: (name) => `${name} · Hawiyah`,
    referenceTitle: (name) => `${name} reference · Hawiyah`,
  },
  ar: {
    onThisPage: 'في هذه الصفحة',
    fullReference: 'المرجع الكامل',
    sideNavLabel: 'صفحات المكوّنات',
    close: 'إغلاق',
    briefTitle: (name) => `${name} · هوية`,
    referenceTitle: (name) => `مرجع ${name} · هوية`,
  },
};
