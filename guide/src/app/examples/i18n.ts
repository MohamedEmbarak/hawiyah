import { Texts } from '../i18n/text';
import type { ExampleFramework } from './payload';

export interface ExampleTexts {
  /** Name of the result area. */
  readonly result: string;
  /** Name of the framework tab list. */
  readonly frameworks: string;
  readonly download: string;
  readonly openInEditor: string;
  /** Tab labels; framework names stay in Latin script. */
  readonly frameworkNames: Readonly<Record<ExampleFramework, string>>;
  /**
   * Status of a rendered result: [before, package and version (shown left to right), after].
   * A preview build renders from the local package tarballs instead of npm (previewWorkflow.notice).
   */
  readonly renderedWith: (pkg: string, pin: string, preview: boolean) => readonly [string, string, string];
  readonly loading: (framework: string) => string;
  readonly failed: (framework: string, firstLine: string) => string;
  /** Appended to the status when a frame runs on the bundled runtime. */
  readonly bundledRuntime: string;
  /** Shown without script in place of the result of a framed group (5a.9). */
  readonly framedNoScript: string;
}

const FRAMEWORK_NAMES: Readonly<Record<ExampleFramework, string>> = {
  vanilla: 'JavaScript',
  react: 'React',
  vue: 'Vue',
  angular: 'Angular',
};

export const exampleTexts: Texts<ExampleTexts> = {
  en: {
    result: 'Result',
    frameworks: 'Framework',
    download: 'Download',
    openInEditor: 'Open in the editor',
    frameworkNames: FRAMEWORK_NAMES,
    renderedWith: (pkg, pin, preview) => ['Rendered with ', `${pkg} ${pin}`, preview ? ' from a local tarball' : ' from npm'],
    loading: (framework) => `Loading the ${framework} result`,
    failed: (framework, firstLine) => `The ${framework} result could not be loaded: ${firstLine}`,
    bundledRuntime: ' (bundled runtime)',
    framedNoScript: 'This example renders a landmark or a main heading of its own, so its result is shown in a frame, which needs JavaScript. The Angular listing below shows its code.',
  },
  ar: {
    result: 'النتيجة',
    frameworks: 'إطار العمل',
    download: 'تنزيل',
    openInEditor: 'فتح في المحرر',
    frameworkNames: FRAMEWORK_NAMES,
    renderedWith: (pkg, pin, preview) => ['معروض باستخدام ', `${pkg} ${pin}`, preview ? ' من أرشيف حزمة محلي' : ' من npm'],
    loading: (framework) => `جارٍ تحميل نتيجة ${framework}`,
    failed: (framework, firstLine) => `تعذّر تحميل نتيجة ${framework}: ${firstLine}`,
    bundledRuntime: ' (ببيئة التشغيل المجمّعة)',
    framedNoScript: 'يعرض هذا المثال معلَمًا أو عنوانًا رئيسيًا خاصًا به، فتظهر نتيجته في إطار يحتاج إلى JavaScript، وتظهر أدناه شيفرته في Angular.',
  },
};

/** The npm package that renders each framework's result. */
export const FRAMEWORK_PACKAGES: Readonly<Record<ExampleFramework, string>> = {
  vanilla: '@hawiyah/vanilla',
  react: '@hawiyah/react',
  vue: '@hawiyah/vue',
  angular: '@hawiyah/angular',
};
