import { Texts } from '../../i18n/text';

/** Level of a log entry; it selects the badge tone and the level word. */
export type LogLevel = 'info' | 'warning' | 'danger';

export interface EditorTexts {
  /** Page title (hw-page-header) and the first part of the document title. */
  readonly editorTitle: string;
  readonly documentTitle: string;
  /** Meta description of the editor documents. */
  readonly summary: string;
  /** Page header description: the component and the section of the example. */
  readonly description: (component: string, section: string) => string;
  /** Link from the page header back to the component page. */
  readonly backToComponent: (component: string) => string;
  /** Unknown query values: the defaults were used. */
  readonly queryFallback: string;
  /** Name of the toolbar group. */
  readonly controls: string;
  readonly framework: string;
  readonly language: string;
  readonly javascript: string;
  readonly typescript: string;
  readonly reset: string;
  readonly copyFile: string;
  readonly copied: string;
  readonly copyFailed: string;
  readonly download: string;
  readonly run: string;
  /** Name of the file tab list. */
  readonly files: string;
  /** Accessible name of the code area of a file. */
  readonly codeLabel: (file: string) => string;
  readonly leaveHint: string;
  /** Name of the result area. */
  readonly result: string;
  /** Shown in the result area while nothing has run. */
  readonly resultEmpty: string;
  readonly notRun: string;
  readonly running: string;
  /** The run finished: duration in milliseconds and whether the reader's edited code ran. */
  readonly ready: (ms: number, edited: boolean) => string;
  readonly failed: (firstLine: string) => string;
  /** Appended to a status when the run used the bundled runtime. */
  readonly bundledRuntime: string;
  /** Source of the packages in the status bar: npm, or the local tarball of a preview build. */
  readonly sourceNpm: string;
  readonly sourceLocal: string;
  readonly copyIntegrity: string;
  /** Name of the package line of the status bar. */
  readonly packageLine: string;
  readonly log: string;
  readonly clearLog: string;
  readonly logEmpty: string;
  readonly level: Readonly<Record<LogLevel, string>>;
  /** First log item when older entries were dropped. */
  readonly dropped: (count: number) => string;
  readonly draftRestored: string;
  readonly discardDraft: string;
  /** Thrown inside the frame by the loop guard; also states what the guard covers. */
  readonly loopStopped: string;
  /** Log texts of frame events. */
  readonly navigationBlocked: (href: string) => string;
  readonly submitBlocked: string;
  readonly messagesDropped: (count: number) => string;
  readonly fallbackUsed: string;
  readonly compileError: (location: string, message: string) => string;
  readonly loadingCompilers: string;
  readonly compilersFailed: (message: string) => string;
  /** The precompiled payload of the example could not be loaded. */
  readonly payloadFailed: string;
  /** Converting the files to JavaScript failed. */
  readonly convertFailed: (message: string) => string;
}

export const editorTexts: Texts<EditorTexts> = {
  en: {
    editorTitle: 'Editor',
    documentTitle: 'Editor · Hawiyah',
    summary: 'Edit a Hawiyah example in JavaScript, React, Vue or Angular and run it with the published packages in a sandboxed frame.',
    description: (component, section) => `${component}: ${section}`,
    backToComponent: (component) => `${component} page`,
    queryFallback: 'Part of the address named an example, framework, language or runtime that the editor does not have; the default is shown instead.',
    controls: 'Editor controls',
    framework: 'Framework',
    language: 'Language',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    reset: 'Reset to the original example',
    copyFile: 'Copy the current file',
    copied: 'Copied',
    copyFailed: 'Copying failed. Select the code and copy it manually.',
    download: 'Download the current file',
    run: 'Run',
    files: 'Files',
    codeLabel: (file) => `Code of ${file}`,
    leaveHint: 'Press Escape, then Tab, to leave the code.',
    result: 'Result',
    resultEmpty: 'Press Run to show the result.',
    notRun: 'Not run yet.',
    running: 'Running…',
    ready: (ms, edited) => `${edited ? 'Your code ran' : 'The original example ran'} in ${ms} ms.`,
    failed: (firstLine) => `The run failed: ${firstLine}`,
    bundledRuntime: ' Bundled runtime.',
    sourceNpm: 'npm',
    sourceLocal: 'local tarball',
    copyIntegrity: 'Copy the package integrity',
    packageLine: 'Package',
    log: 'Log',
    clearLog: 'Clear the log',
    logEmpty: 'No entries.',
    level: { info: 'Information', warning: 'Warning', danger: 'Error' },
    dropped: (count) => `${count} older ${count === 1 ? 'entry was' : 'entries were'} removed.`,
    draftRestored: 'Your earlier edits of this example were restored. They run when you press Run.',
    discardDraft: 'Discard the edits',
    loopStopped:
      'A loop ran for more than 2 seconds and was stopped; the result was removed. The check covers for, while and do-while loops of the edited code, not recursion or library code.',
    navigationBlocked: (href) => `The example link to ${href} does not open from the preview.`,
    submitBlocked: 'The example form was submitted inside the preview; nothing was sent.',
    messagesDropped: (count) => `${count} messages from the result were ignored after the limit of 500.`,
    fallbackUsed: 'The modules of the result could not be loaded; the run was repeated with the bundled runtime.',
    compileError: (location, message) => `${location}: ${message}`,
    loadingCompilers: 'Loading the compilers for the edited code.',
    compilersFailed: (message) => `The compilers could not be loaded: ${message}`,
    payloadFailed: 'The example could not be loaded.',
    convertFailed: (message) => `The files could not be converted to JavaScript: ${message}`,
  },
  ar: {
    editorTitle: 'المحرر',
    documentTitle: 'المحرر · هوية',
    summary: 'حرّر مثالًا من أمثلة هوية بلغة JavaScript أو بإطار React أو Vue أو Angular، وشغّله بالحزم المنشورة داخل إطار معزول.',
    description: (component, section) => `${component}: ${section}`,
    backToComponent: (component) => `صفحة ${component}`,
    queryFallback: 'ذكر جزء من العنوان مثالًا أو إطار عمل أو لغة أو بيئة تشغيل غير متاحة في المحرر، فعُرضت القيمة الافتراضية بدلًا منها.',
    controls: 'أدوات المحرر',
    framework: 'إطار العمل',
    language: 'اللغة',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    reset: 'الإعادة إلى المثال الأصلي',
    copyFile: 'نسخ الملف الحالي',
    copied: 'تم النسخ',
    copyFailed: 'تعذّر النسخ. حدّد الشيفرة وانسخها يدويًا.',
    download: 'تنزيل الملف الحالي',
    run: 'تشغيل',
    files: 'الملفات',
    codeLabel: (file) => `شيفرة ${file}`,
    leaveHint: 'اضغط Escape ثم Tab لمغادرة الشيفرة.',
    result: 'النتيجة',
    resultEmpty: 'اضغط «تشغيل» لعرض النتيجة.',
    notRun: 'لم يُشغَّل بعد.',
    running: 'جارٍ التشغيل…',
    ready: (ms, edited) => `${edited ? 'شُغِّلت شيفرتك' : 'شُغِّل المثال الأصلي'} في ${ms} ملّي ثانية.`,
    failed: (firstLine) => `تعذّر التشغيل: ${firstLine}`,
    bundledRuntime: ' بالحزمة المجمّعة.',
    sourceNpm: 'npm',
    sourceLocal: 'أرشيف حزمة محلي',
    copyIntegrity: 'نسخ بصمة سلامة الحزمة',
    packageLine: 'الحزمة',
    log: 'السجل',
    clearLog: 'مسح السجل',
    logEmpty: 'لا توجد إدخالات.',
    level: { info: 'معلومة', warning: 'تنبيه', danger: 'خطأ' },
    dropped: (count) => `حُذف ${count} من الإدخالات الأقدم.`,
    draftRestored: 'استُعيدت تعديلاتك السابقة على هذا المثال، وتُشغَّل عند الضغط على «تشغيل».',
    discardDraft: 'تجاهل التعديلات',
    loopStopped:
      'استمرت حلقة تكرار أكثر من ثانيتين فأُوقفت، وأُزيلت النتيجة. يشمل هذا الفحص حلقات for وwhile وdo-while في الشيفرة المحرَّرة، ولا يشمل الاستدعاء الذاتي ولا شيفرة المكتبات.',
    navigationBlocked: (href) => `لا يُفتح رابط المثال إلى ${href} من المعاينة.`,
    submitBlocked: 'أُرسل نموذج المثال داخل المعاينة، ولم يُرسَل أي شيء خارجها.',
    messagesDropped: (count) => `تُجوهلت ${count} من رسائل النتيجة بعد بلوغ الحد الأقصى وهو 500 رسالة.`,
    fallbackUsed: 'تعذّر تحميل وحدات النتيجة، فأُعيد التشغيل بالحزمة المجمّعة.',
    compileError: (location, message) => `${location}: ${message}`,
    loadingCompilers: 'جارٍ تحميل المصرّفات للشيفرة المحرَّرة.',
    compilersFailed: (message) => `تعذّر تحميل المصرّفات: ${message}`,
    payloadFailed: 'تعذّر تحميل المثال.',
    convertFailed: (message) => `تعذّر تحويل الملفات إلى JavaScript: ${message}`,
  },
};
