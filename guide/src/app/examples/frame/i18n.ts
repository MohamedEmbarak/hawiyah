import { Texts } from '../../i18n/text';
import type { ExampleFramework } from '../payload';

export interface FrameTexts {
  /** Accessible name of the iframe of a run. */
  readonly frameTitle: (framework: string) => string;
  readonly loading: (framework: string) => string;
  readonly failed: (framework: string, firstLine: string) => string;
  /** Appended to a status when the run uses the bundled runtime. */
  readonly bundledRuntime: string;
  /** The run did not report ready in time. */
  readonly timeout: string;
  /** The payload of the example could not be loaded. */
  readonly payloadFailed: string;
  /** A link in the example was activated; the frame does not navigate. */
  readonly navigationBlocked: (href: string) => string;
  /** A form in the example was submitted; nothing leaves the frame. */
  readonly submitBlocked: string;
  /** Code in the example tried to navigate the frame itself; the request was refused. */
  readonly leaveBlocked: string;
}

/** Framework names stay in Latin script in both languages. */
export const FRAME_FRAMEWORK_NAMES: Readonly<Record<ExampleFramework, string>> = {
  vanilla: 'JavaScript',
  react: 'React',
  vue: 'Vue',
  angular: 'Angular',
};

export const frameTexts: Texts<FrameTexts> = {
  en: {
    frameTitle: (framework) => `Result in ${framework}`,
    loading: (framework) => `Loading the ${framework} result`,
    failed: (framework, firstLine) => `The ${framework} result could not be loaded: ${firstLine}`,
    bundledRuntime: ' Bundled runtime.',
    timeout: 'The result did not finish loading within 20 seconds.',
    payloadFailed: 'The compiled example could not be loaded.',
    navigationBlocked: (href) => `The example link to ${href} does not open from the preview.`,
    submitBlocked: 'The example form was submitted inside the preview; nothing was sent.',
    leaveBlocked: 'The code tried to open another address in the preview. The request was not sent, and the run was stopped.',
  },
  ar: {
    frameTitle: (framework) => `النتيجة في ${framework}`,
    loading: (framework) => `جارٍ تحميل نتيجة ${framework}`,
    failed: (framework, firstLine) => `تعذّر تحميل نتيجة ${framework}: ${firstLine}`,
    bundledRuntime: ' بالحزمة المجمّعة.',
    timeout: 'لم يكتمل تحميل النتيجة خلال 20 ثانية.',
    payloadFailed: 'تعذّر تحميل المثال المُصرَّف.',
    navigationBlocked: (href) => `لا يُفتح رابط المثال إلى ${href} من المعاينة.`,
    submitBlocked: 'أُرسل نموذج المثال داخل المعاينة، ولم يُرسَل أي شيء خارجها.',
    leaveBlocked: 'حاولت الشيفرة فتح عنوان آخر داخل المعاينة، فلم يُرسَل الطلب وأُوقف التشغيل.',
  },
};
