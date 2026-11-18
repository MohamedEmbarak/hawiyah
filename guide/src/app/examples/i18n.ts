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
  /** Status of a rendered result: [before, package and version (shown left to right), after]. */
  readonly renderedWith: (pkg: string, pin: string) => readonly [string, string, string];
  readonly loading: (framework: string) => string;
  readonly failed: (framework: string, firstLine: string) => string;
  /** Appended to the status when a frame runs on the bundled runtime. */
  readonly bundledRuntime: string;
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
    renderedWith: (pkg, pin) => ['Rendered with ', `${pkg} ${pin}`, ' from npm'],
    loading: (framework) => `Loading the ${framework} result`,
    failed: (framework, firstLine) => `The ${framework} result could not be loaded: ${firstLine}`,
    bundledRuntime: ' Bundled runtime.',
  },
  ar: {
    result: 'النتيجة',
    frameworks: 'إطار العمل',
    download: 'تنزيل',
    openInEditor: 'فتح في المحرر',
    frameworkNames: FRAMEWORK_NAMES,
    renderedWith: (pkg, pin) => ['معروض باستخدام ', `${pkg} ${pin}`, ' من npm'],
    loading: (framework) => `جارٍ تحميل نتيجة ${framework}`,
    failed: (framework, firstLine) => `تعذّر تحميل نتيجة ${framework}: ${firstLine}`,
    bundledRuntime: ' بالحزمة المجمّعة.',
  },
};

/** The npm package that renders each framework's result. */
export const FRAMEWORK_PACKAGES: Readonly<Record<ExampleFramework, string>> = {
  vanilla: '@hawiyah/vanilla',
  react: '@hawiyah/react',
  vue: '@hawiyah/vue',
  angular: '@hawiyah/angular',
};
