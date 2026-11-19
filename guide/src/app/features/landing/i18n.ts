import compliance from '../../i18n/compliance.json';
import { Texts } from '../../i18n/text';

/** The seven package names without scope, in the order of the packages section. */
export type PackageKey = 'tokens' | 'styles' | 'core' | 'vanilla' | 'react' | 'vue' | 'angular';

/** Landing strings (landing.textKeys). Pane texts follow the pane's language, all others the page language. */
export interface LandingTexts {
  readonly documentTitle: string;
  readonly lead: {
    readonly statement: string;
    readonly body: string;
    readonly commandLabel: string;
    readonly version: (v: string) => string;
    readonly renderedBy: string;
    readonly installLink: string;
    /** Group label of the framework selector of the lead. */
    readonly frameworkLabel: string;
    /** Visible text and accessible name of the button while the commands rotate. */
    readonly pause: string;
    readonly pauseLabel: string;
    /** Visible text and accessible name of the button while the rotation is paused. */
    readonly resume: string;
    readonly resumeLabel: string;
    /** Title of the list of all commands shown without JavaScript. */
    readonly allCommands: string;
  };
  readonly code: { readonly terminal: string };
  readonly duo: {
    readonly heading: string;
    readonly controlsHeading: string;
    readonly controlsHint: string;
    readonly target: string;
    readonly containerA: string;
    readonly containerB: string;
    readonly language: string;
    readonly direction: string;
    readonly rtl: string;
    readonly ltr: string;
    readonly mode: string;
    readonly light: string;
    readonly dark: string;
    readonly density: string;
    readonly comfortable: string;
    readonly compact: string;
    readonly reset: string;
    readonly resetDone: string;
    readonly announce: (c: string, l: string, d: string, m: string, n: string) => string;
  };
  readonly pane: {
    readonly tabsLabel: string;
    readonly details: string;
    readonly summary: string;
    readonly name: string;
    readonly sampleName: string;
    readonly date: string;
    readonly otherGregorian: (date: string) => string;
    readonly otherHijri: (date: string) => string;
    readonly noDate: string;
    readonly continue: string;
    readonly edit: string;
    readonly calendarLabel: string;
    readonly openLabel: string;
    readonly closeLabel: string;
    readonly previousLabel: string;
    readonly nextLabel: string;
    readonly calendarSystemLabel: string;
    readonly gregorianLabel: string;
    readonly hijriLabel: string;
    readonly rangeLabel: string;
    readonly invalidMessage: string;
    readonly unsupportedMessage: string;
  };
  readonly install: {
    readonly heading: string;
    readonly framework: string;
    readonly manager: string;
    readonly step1: string;
    readonly step2: string;
    /** The sentence around the attribute name data-hw-theme (shown as code, never at the end of the sentence). */
    readonly themeNote: { readonly before: string; readonly after: string };
    readonly bundlerNote: string;
    readonly step3: string;
    readonly resultTitle: string;
    readonly renderedBy: string;
    readonly step4: string;
    readonly toComponents: string;
    readonly toEditor: string;
  };
  readonly packages: {
    readonly heading: string;
    readonly intro: (v: string, n: number) => string;
    readonly npmLink: string;
    readonly descriptions: Readonly<Record<PackageKey, string>>;
  };
  readonly compliance: {
    readonly heading: string;
    readonly statement: string;
    readonly evidence: string;
    readonly alignment: string;
    readonly coverage: string;
    readonly validation: string;
    readonly dga: string;
  };
}

export const landingTexts: Texts<LandingTexts> = {
  en: {
    documentTitle: 'Hawiyah',
    lead: {
      statement: 'Hawiyah is a UI component library built to comply with the DGA Platforms Code.',
      body: 'Language, direction, colour mode and density are four independent attributes. Arabic and English use the same components, tokens and styles.',
      commandLabel: 'Install command for the selected framework and package manager',
      version: (v) => `Version ${v}, Apache License 2.0.`,
      renderedBy: 'This page is rendered with',
      installLink: 'Installation steps for each framework',
      frameworkLabel: 'Framework of the install command',
      pause: 'Pause',
      pauseLabel: 'Pause the rotation of the install commands',
      resume: 'Resume',
      resumeLabel: 'Resume the rotation of the install commands',
      allCommands: 'Install command for each framework',
    },
    code: { terminal: 'Terminal' },
    duo: {
      heading: 'The same composition in two containers',
      controlsHeading: 'Change one container',
      controlsHint: 'Each container carries its own attributes.',
      target: 'Container',
      containerA: 'Container A',
      containerB: 'Container B',
      language: 'Language',
      direction: 'Direction',
      rtl: 'Right to left',
      ltr: 'Left to right',
      mode: 'Colour mode',
      light: 'Light',
      dark: 'Dark',
      density: 'Density',
      comfortable: 'Comfortable',
      compact: 'Compact',
      reset: 'Reset both containers',
      resetDone: 'Both containers are back to their starting attributes.',
      announce: (c, l, d, m, n) => `${c}: ${l}, ${d}, ${m}, ${n}`,
    },
    pane: {
      tabsLabel: 'Appointment request',
      details: 'Details',
      summary: 'Summary',
      name: 'Full name',
      sampleName: 'Sara Ahmed',
      date: 'Appointment date',
      otherGregorian: (date) => `Gregorian: ${date}`,
      otherHijri: (date) => `Umm al-Qura: ${date}`,
      noDate: 'No date selected',
      continue: 'Continue',
      edit: 'Edit',
      calendarLabel: 'Choose a date',
      openLabel: 'Open the calendar',
      closeLabel: 'Close the calendar',
      previousLabel: 'Previous month',
      nextLabel: 'Next month',
      calendarSystemLabel: 'Calendar system',
      gregorianLabel: 'Gregorian',
      hijriLabel: 'Umm al-Qura',
      rangeLabel: 'Supported range',
      invalidMessage: 'Enter a valid date.',
      unsupportedMessage: 'This date is outside the supported range.',
    },
    install: {
      heading: 'Install',
      framework: 'Framework',
      manager: 'Package manager',
      step1: 'Install the styles package and one adapter.',
      step2: 'Load the stylesheet once.',
      themeNote: { before: 'The attribute', after: 'applies the theme to the element that carries it and to everything inside it.' },
      bundlerNote: 'The JavaScript path assumes a bundler, such as Vite, that resolves package imports.',
      step3: 'Render a first component.',
      resultTitle: 'Result',
      renderedBy: 'Rendered on this page by',
      step4: 'Continue with the component pages and the editor.',
      toComponents: 'Component pages',
      toEditor: 'Open this example in the editor',
    },
    packages: {
      heading: 'Seven packages',
      intro: (v, n) =>
        `All seven packages share one version, currently ${v}, a pre-1.0 release. The catalogue lists ${n} components across four adapters.`,
      npmLink: 'Packages on npm',
      descriptions: {
        tokens: 'Design values and semantic theme variables',
        styles: 'Component styles, layout helpers and an optional reset',
        core: 'Framework-independent behaviour and formatting helpers',
        vanilla: 'Controllers that add behaviour to semantic HTML, with cleanup',
        react: 'React components',
        vue: 'Vue components',
        angular: 'Angular components',
      },
    },
    compliance: {
      heading: 'Compliance',
      statement: compliance.en,
      evidence: 'Compliance is documented requirement by requirement, with test evidence and open items.',
      alignment: 'Alignment with the Platforms Code',
      coverage: 'Coverage',
      validation: 'Validation and test evidence',
      dga: 'The DGA Platforms Code',
    },
  },
  ar: {
    documentTitle: 'هوية',
    lead: {
      statement: 'هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية.',
      body: 'اللغة والاتجاه ووضع الألوان والكثافة أربع خصائص مستقلة، وتستخدم العربية والإنجليزية المكوّنات ورموز التصميم والأنماط نفسها.',
      commandLabel: 'أمر التثبيت لإطار العمل ومدير الحزم المحدَّدَين',
      version: (v) => `الإصدار ${v}، بموجب رخصة Apache 2.0.`,
      renderedBy: 'هذه الصفحة معروضة باستخدام',
      installLink: 'خطوات التثبيت لكل إطار عمل',
      frameworkLabel: 'إطار العمل لأمر التثبيت',
      pause: 'إيقاف مؤقت',
      pauseLabel: 'إيقاف مؤقت لتبديل أوامر التثبيت',
      resume: 'استئناف',
      resumeLabel: 'استئناف تبديل أوامر التثبيت',
      allCommands: 'أمر التثبيت لكل إطار عمل',
    },
    code: { terminal: 'الطرفية' },
    duo: {
      heading: 'التكوين نفسه في حاويتين',
      controlsHeading: 'تعديل إحدى الحاويتين',
      controlsHint: 'تحمل كل حاوية خصائصها الخاصة.',
      target: 'الحاوية',
      containerA: 'الحاوية أ',
      containerB: 'الحاوية ب',
      language: 'اللغة',
      direction: 'الاتجاه',
      rtl: 'من اليمين إلى اليسار',
      ltr: 'من اليسار إلى اليمين',
      mode: 'وضع الألوان',
      light: 'فاتح',
      dark: 'داكن',
      density: 'الكثافة',
      comfortable: 'مريحة',
      compact: 'مضغوطة',
      reset: 'إعادة ضبط الحاويتين',
      resetDone: 'عادت الحاويتان إلى خصائصهما الأولى.',
      announce: (c, l, d, m, n) => `${c}: ${l}، ${d}، ${m}، ${n}`,
    },
    pane: {
      tabsLabel: 'طلب موعد',
      details: 'البيانات',
      summary: 'الملخص',
      name: 'الاسم الكامل',
      sampleName: 'سارة أحمد',
      date: 'تاريخ الموعد',
      otherGregorian: (date) => `بالتقويم الميلادي: ${date}`,
      otherHijri: (date) => `بتقويم أم القرى: ${date}`,
      noDate: 'لم يُحدَّد تاريخ',
      continue: 'متابعة',
      edit: 'تعديل',
      calendarLabel: 'اختيار تاريخ',
      openLabel: 'فتح التقويم',
      closeLabel: 'إغلاق التقويم',
      previousLabel: 'الشهر السابق',
      nextLabel: 'الشهر التالي',
      calendarSystemLabel: 'نظام التقويم',
      gregorianLabel: 'ميلادي',
      hijriLabel: 'أم القرى',
      rangeLabel: 'النطاق المدعوم',
      invalidMessage: 'أدخل تاريخًا صحيحًا.',
      unsupportedMessage: 'هذا التاريخ خارج النطاق المدعوم.',
    },
    install: {
      heading: 'التثبيت',
      framework: 'إطار العمل',
      manager: 'مدير الحزم',
      step1: 'ثبّت حزمة الأنماط وحزمة محوّل واحد.',
      step2: 'حمّل ملف الأنماط مرة واحدة.',
      themeNote: { before: 'تُطبِّق الخاصية', after: 'السمةَ على العنصر الذي يحملها وعلى كل ما بداخله.' },
      bundlerNote: 'يفترض مسار JavaScript استخدام أداة تجميع، مثل Vite، تحلّ استيراد الحزم.',
      step3: 'اعرض أول مكوّن.',
      resultTitle: 'النتيجة',
      renderedBy: 'معروض في هذه الصفحة باستخدام',
      step4: 'تابع إلى صفحات المكوّنات والمحرر.',
      toComponents: 'صفحات المكوّنات',
      toEditor: 'فتح هذا المثال في المحرر',
    },
    packages: {
      heading: 'سبع حزم',
      intro: (v, n) =>
        `تشترك الحزم السبع في رقم إصدار واحد، وهو حاليًا ${v}، وهو إصدار سابق للإصدار 1.0. ويضم الفهرس ${n} مكوّنًا في أربعة محوّلات.`,
      npmLink: 'الحزم على npm',
      descriptions: {
        tokens: 'قيم التصميم والمتغيرات الدلالية للسمة',
        styles: 'أنماط المكوّنات وأدوات التخطيط وملف إعادة ضبط اختياري',
        core: 'سلوك مشترك مستقل عن الأطر وأدوات للتنسيق',
        vanilla: 'متحكمات تضيف السلوك إلى HTML الدلالي مع إمكانية الإزالة',
        react: 'مكوّنات React',
        vue: 'مكوّنات Vue',
        angular: 'مكوّنات Angular',
      },
    },
    compliance: {
      heading: 'الامتثال',
      statement: compliance.ar,
      evidence: 'يُوثَّق الامتثال لكل متطلب على حدة، مع أدلة الاختبار والبنود المفتوحة.',
      alignment: 'المواءمة مع كود المنصات',
      coverage: 'التغطية',
      validation: 'التحقق وأدلة الاختبار',
      dga: 'كود المنصات لدى هيئة الحكومة الرقمية',
    },
  },
};
