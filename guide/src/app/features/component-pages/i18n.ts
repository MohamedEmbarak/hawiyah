import headings from '../../i18n/evidence-headings.json';
import { Texts } from '../../i18n/text';

/** Texts of the evidence panel (5a.11). The evidence itself is English text of components.json and CHANGELOG.md. */
export interface EvidenceTexts {
  /** The two headings; also read by build step 20 (src/app/i18n/evidence-headings.json). */
  readonly evidence: string;
  readonly open: string;
  /** Adapter names, as the framework tabs name them. */
  readonly adapters: Readonly<Record<string, string>>;
  readonly list: (items: readonly string[]) => string;
  readonly built: (adapters: string) => string;
  readonly verified: (adapters: string) => string;
  readonly noneVerified: string;
  readonly entriesIntro: string;
  readonly noEvidence: (name: string) => string;
  readonly tests: string;
  readonly result: string;
  readonly command: string;
  readonly source: string;
  readonly notesIntro: string;
  readonly openIntro: (version: string) => string;
  readonly noOpen: (name: string, version: string) => string;
  readonly defect: (version: string) => string;
  readonly difference: string;
}

const ADAPTERS = { vanilla: 'JavaScript', react: 'React', vue: 'Vue', angular: 'Angular' };

export const evidenceTexts: Texts<EvidenceTexts> = {
  en: {
    ...headings.en,
    adapters: ADAPTERS,
    list: (items) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`),
    built: (adapters) => `Built in ${adapters}.`,
    verified: (adapters) => `Recorded as verified in components.json: ${adapters}.`,
    noneVerified: 'No adapter is recorded as verified in components.json.',
    entriesIntro: 'The tests that components.json records, with their scope, result and date:',
    noEvidence: (name) => `No verification evidence is recorded for ${name} in components.json.`,
    tests: 'Tests',
    result: 'Result',
    command: 'command',
    source: 'source',
    notesIntro: 'Notes recorded in components.json:',
    openIntro: (version) => `Each entry of Known defects in ${version} in CHANGELOG.md that names this component, and each documented difference of the equivalence check:`,
    noOpen: (name, version) => `No entry of Known defects in ${version} in CHANGELOG.md and no documented difference of the equivalence check names ${name}.`,
    defect: (version) => `CHANGELOG.md, Known defects in ${version}`,
    difference: 'documented difference',
  },
  ar: {
    ...headings.ar,
    adapters: ADAPTERS,
    list: (items) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join('، ')} و${items.at(-1)}`),
    built: (adapters) => `المكوّن مبني في المحوّلات: ${adapters}.`,
    verified: (adapters) => `المحوّلات المسجّلة بوصفها متحقَّقًا منها في components.json: ${adapters}.`,
    noneVerified: 'لا يسجّل components.json أي محوّل بوصفه متحقَّقًا منه.',
    entriesIntro: 'الاختبارات التي يسجّلها components.json، مع نطاقها ونتيجتها وتاريخها:',
    noEvidence: (name) => `لا يسجّل components.json أي دليل تحقق للمكوّن: ${name}.`,
    tests: 'الاختبارات',
    result: 'النتيجة',
    command: 'الأمر',
    source: 'المصدر',
    notesIntro: 'الملاحظات المسجّلة في components.json:',
    openIntro: (version) => `كل بند من العيوب المعروفة في الإصدار ${version} في CHANGELOG.md يذكر هذا المكوّن، وكل اختلاف موثّق في فحص التكافؤ:`,
    noOpen: (name, version) => `لا بند مفتوحًا للمكوّن: ${name}، فلا يذكره أي بند من العيوب المعروفة في الإصدار ${version} في CHANGELOG.md، ولا أي اختلاف موثّق في فحص التكافؤ.`,
    defect: (version) => `CHANGELOG.md، العيوب المعروفة في الإصدار ${version}`,
    difference: 'اختلاف موثّق',
  },
};

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
    referenceTitle: (name) => `مرجع المكوّن: ${name} · هوية`,
  },
};
