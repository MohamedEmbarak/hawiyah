import type { Locator, Page } from '@playwright/test';
import { hydrated } from '../support/fixtures';

export type Lang = 'ar' | 'en';

/**
 * Waits for hydration and for the end of event replay; the shared hydrated() waits
 * until the jsaction attributes are gone (see the tabs suite).
 */
export async function ready(page: Page): Promise<void> {
  await hydrated(page);
}

/** The radio option of a toggle group, chosen by clicking its label. */
export async function choose(group: Locator, option: string): Promise<void> {
  await group.locator('label').filter({ hasText: new RegExp(`^\\s*${option.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`) }).click();
}

export const TEXT = {
  en: {
    title: 'Hawiyah',
    statement: 'Hawiyah is a UI component library built to comply with the DGA Platforms Code.',
    otherStatement: 'هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية.',
    headings: ['The same composition in two containers', 'Install', 'Seven packages', 'Compliance'],
    terminal: 'Terminal',
    framework: 'Framework',
    manager: 'Package manager',
    target: 'Container',
    language: 'Language',
    direction: 'Direction',
    mode: 'Colour mode',
    density: 'Density',
    containerA: 'Container A',
    containerB: 'Container B',
    reset: 'Reset both containers',
    resetDone: 'Both containers are back to their starting attributes.',
    copy: 'Copy code',
    installLink: 'Installation steps for each framework',
    toComponents: 'Component pages',
    intro: 'All seven packages share one version, currently 0.3.0, a pre-1.0 release. The catalogue lists 85 components across four adapters.',
    statementCompliance: 'Hawiyah is a UI component library built to comply with the DGA Platforms Code. It is not an official DGA product and holds no certification.',
    npm: 'Packages on npm',
    result: 'Result',
    resultButton: 'Continue',
    leadFramework: 'Framework of the install command',
    pause: 'Pause the rotation of the install commands',
    resume: 'Resume the rotation of the install commands',
    allCommands: 'Install command for each framework',
  },
  ar: {
    title: 'هوية',
    statement: 'هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية.',
    otherStatement: 'Hawiyah is a UI component library built to comply with the DGA Platforms Code.',
    headings: ['التكوين نفسه في حاويتين', 'التثبيت', 'سبع حزم', 'الامتثال'],
    terminal: 'الطرفية',
    framework: 'إطار العمل',
    manager: 'مدير الحزم',
    target: 'الحاوية',
    language: 'اللغة',
    direction: 'الاتجاه',
    mode: 'وضع الألوان',
    density: 'الكثافة',
    containerA: 'الحاوية أ',
    containerB: 'الحاوية ب',
    reset: 'إعادة ضبط الحاويتين',
    resetDone: 'عادت الحاويتان إلى خصائصهما الأولى.',
    copy: 'نسخ الشيفرة',
    installLink: 'خطوات التثبيت لكل إطار عمل',
    toComponents: 'صفحات المكوّنات',
    intro: 'تشترك الحزم السبع في رقم إصدار واحد، وهو حاليًا 0.3.0، وهو إصدار سابق للإصدار 1.0. ويضم الفهرس 85 مكوّنًا في أربعة محوّلات.',
    statementCompliance: 'هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد.',
    npm: 'الحزم على npm',
    result: 'النتيجة',
    resultButton: 'متابعة',
    leadFramework: 'إطار العمل لأمر التثبيت',
    pause: 'إيقاف مؤقت لتبديل أوامر التثبيت',
    resume: 'استئناف تبديل أوامر التثبيت',
    allCommands: 'أمر التثبيت لكل إطار عمل',
  },
} as const;

export const FRAMEWORKS = [
  { id: 'vanilla', label: 'JavaScript', adapter: '@hawiyah/vanilla', styleFile: 'src/main.js', primary: 'index.html' },
  { id: 'react', label: 'React', adapter: '@hawiyah/react', styleFile: 'src/main.tsx', primary: 'Example.tsx' },
  { id: 'vue', label: 'Vue', adapter: '@hawiyah/vue', styleFile: 'src/main.ts', primary: 'Example.vue' },
  { id: 'angular', label: 'Angular', adapter: '@hawiyah/angular', styleFile: 'src/styles.css', primary: 'example.component.ts' },
] as const;

export const MANAGERS = [
  { id: 'npm', verb: 'npm install' },
  { id: 'pnpm', verb: 'pnpm add' },
  { id: 'yarn', verb: 'yarn add' },
] as const;
