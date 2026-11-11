/*
 * Text inputs of each component, as named by the built type declarations of the
 * seven packages. The packages hold no wording and choose no locale: the
 * application supplies every text below, under the same name in vanilla, React,
 * Vue and Angular. Each entry is [name, type, requirement in English, in Arabic].
 */
export type TextInput = readonly [name: string, type: string, en: string, ar: string];

const always = ['Required', 'مطلوب دائمًا'] as const;
const optional = ['Optional; nothing is rendered and nothing warns without it', 'اختياري؛ لا يُعرض شيء ولا يظهر تحذير عند غيابه'] as const;
const when = (en: string, ar: string) => [`Required when ${en}`, `مطلوب عندما ${ar}`] as const;
const input = (name: string, type: string, [en, ar]: readonly [string, string]): TextInput => [name, type, en, ar];

const text = 'string';
const count = '(count: number) => string';
const locale = (en: string, ar: string) => input('locale', 'string (BCP 47)', [en, ar]);

const calendarSwitch = (en: string, ar: string) => [
  input('calendarSystemLabel', text, when(en, ar)),
  input('gregorianLabel', text, when(en, ar)),
  input('hijriLabel', text, when(en, ar)),
  input('rangeLabel', text, when(en, ar)),
  input('unsupportedMessage', text, when(en, ar)),
];
const portalHeader = [
  input('menuLabel', text, ['Required (vanilla: when the menu toggle has no text or aria-label)', 'مطلوب دائمًا (في Vanilla: عندما لا يحمل زر القائمة نصًا أو aria-label)']),
  input('navigationLabel', text, ['Required (vanilla: when the navigation has no aria-label)', 'مطلوب دائمًا (في Vanilla: عندما لا يحمل التنقل aria-label)']),
  input('brandLabel', text, ['Optional; needed when the brand is artwork without text or alternative text, otherwise a development warning names it', 'اختياري؛ يلزم عندما تكون العلامة رسمًا دون نص أو نص بديل، وإلا ظهر تحذير في وضع التطوير يذكره']),
];

export const componentTextInputs: Partial<Record<string, readonly TextInput[]>> = {
  alert: [input('closeLabel', text, when('the alert renders its own dismiss button (Angular); vanilla authors the button', 'يعرض التنبيه زر الإغلاق بنفسه (Angular)؛ وفي Vanilla يكتب التطبيق الزر'))],
  'app-shell': [input('skipLabel', text, always)],
  'avatar-group': [input('label', text, always), input('getOverflowLabel', count, always)],
  breadcrumb: [input('label', text, ['Required, or aria-label / aria-labelledby on the navigation', 'مطلوب دائمًا، أو aria-label / aria-labelledby على التنقل'])],
  calendar: [
    input('label', text, ['Required, or aria-label / aria-labelledby on the calendar', 'مطلوب دائمًا، أو aria-label / aria-labelledby على التقويم']),
    locale('Required; month and weekday names come from Intl in this locale', 'مطلوب دائمًا؛ تأتي أسماء الأشهر والأيام من Intl بهذه اللغة'),
    input('previousLabel', text, always),
    input('nextLabel', text, always),
    ...calendarSwitch("calendar is 'islamic-umalqura' (React, Vue, Angular); always in vanilla, which renders the calendar-system switch", "يكون calendar هو 'islamic-umalqura' (React وVue وAngular)؛ ومطلوب دائمًا في Vanilla لأنه يعرض مبدّل نظام التقويم"),
    input('getDayLabel', '(value: string) => string', optional),
  ],
  carousel: [
    input('label', text, always),
    input('previousLabel', text, always),
    input('nextLabel', text, always),
    input('indicatorsLabel', text, when('indicators are shown', 'تُعرض مؤشرات الشرائح')),
    input('getSlideLabel', '(position: number, total: number) => string', ['Required; position is one-based (vanilla: data-hw-slide-label="{position} / {total}")', 'مطلوب دائمًا؛ يبدأ الموضع من 1 (في Vanilla: data-hw-slide-label="{position} / {total}")']),
    input('emptyLabel', text, always),
    input('carouselDescription', text, optional),
    input('slideDescription', text, optional),
  ],
  chip: [input('removeLabel', text, when('the chip is removable', 'تكون الشريحة قابلة للإزالة'))],
  combobox: [
    input('getResultsMessage', count, ['Required (vanilla: data-hw-results-message="{count} …")', 'مطلوب دائمًا (في Vanilla: data-hw-results-message="{count} …")']),
    input('emptyMessage', text, ['Required where the adapter renders the empty row (React, Vue, Angular)', 'مطلوب دائمًا حيث يعرض المحوّل صف «لا نتائج» (React وVue وAngular)']),
    input('requiredMessage', text, when('the input is required', 'يكون الحقل مطلوبًا')),
  ],
  'content-navigation': [input('label', text, ['Required, or aria-label / aria-labelledby on the navigation; it is also the text of the heading', 'مطلوب دائمًا، أو aria-label / aria-labelledby على التنقل؛ وهو نص العنوان كذلك'])],
  'cookie-consent': [
    input('title', text, always),
    input('acceptLabel', text, always),
    input('rejectLabel', text, always),
    input('preferencesLabel', text, when('a preferences handler is bound', 'يُربط معالج للتفضيلات')),
    input('policyLabel', text, when('policyHref is set', 'يُضبط policyHref')),
  ],
  table: [input('emptyMessage', text, when('columns are given and the component renders the rows', 'تُمرَّر columns ويعرض المكوّن الصفوف بنفسه'))],
  'data-table': [
    input('emptyMessage', text, always),
    locale('Required for sorting (vanilla: when a column has a [data-hw-sort] button); without it rows stay in source order', 'مطلوب للفرز (في Vanilla: عندما يحتوي عمود على زر [data-hw-sort])؛ وبدونه تبقى الصفوف بترتيبها الأصلي'),
    input('getSortLabel', "(column, direction: 'ascending' | 'descending') => string", optional),
  ],
  'date-picker': [
    input('label', text, ['Required (vanilla: the authored label)', 'مطلوب دائمًا (في Vanilla: التسمية المكتوبة في البنية)']),
    locale('Required; formatted dates come from Intl in this locale', 'مطلوب دائمًا؛ تأتي التواريخ المنسّقة من Intl بهذه اللغة'),
    input('calendarLabel', text, always),
    input('openLabel', text, always),
    input('closeLabel', text, always),
    input('previousLabel', text, always),
    input('nextLabel', text, always),
    input('calendarSystemLabel', text, always),
    input('gregorianLabel', text, always),
    input('hijriLabel', text, always),
    input('rangeLabel', text, always),
    input('invalidMessage', text, always),
    input('unsupportedMessage', text, always),
    input('unavailableMessage', text, when('isDateDisabled is given', 'تُمرَّر الدالة isDateDisabled')),
    input('placeholder', text, optional),
  ],
  dialog: [input('closeLabel', text, ['Required where the adapter renders the close button; vanilla authors the button', 'مطلوب دائمًا حيث يعرض المحوّل زر الإغلاق؛ وفي Vanilla يكتب التطبيق الزر'])],
  drawer: [input('closeLabel', text, ['Required where the adapter renders the close button; vanilla authors the button', 'مطلوب دائمًا حيث يعرض المحوّل زر الإغلاق؛ وفي Vanilla يكتب التطبيق الزر'])],
  feedback: [
    input('label', text, always),
    input('yesLabel', text, always),
    input('noLabel', text, always),
    input('successMessage', text, always),
    input('commentLabel', text, ['Required in React and Vue; the comment field appears once the reader answers', 'مطلوب دائمًا في React وVue؛ يظهر حقل التعليق بعد أن يجيب القارئ']),
    input('submitLabel', text, ['Required in React and Vue; the button appears with the comment field', 'مطلوب دائمًا في React وVue؛ يظهر الزر مع حقل التعليق']),
    input('getStatusMessage', '(value: string) => string', ['Optional, vanilla only; replaces successMessage for one answer', 'اختياري، في Vanilla فقط؛ يحل محل successMessage لإجابة بعينها']),
  ],
  'file-dropzone': [
    input('label', text, ['Required, or aria-label / aria-labelledby / a parent field label', 'مطلوب دائمًا، أو aria-label / aria-labelledby / تسمية الحقل الأب']),
    input('dropLabel', text, ['Required; the visible instruction (vanilla: authored text)', 'مطلوب دائمًا؛ وهو الإرشاد الظاهر (في Vanilla: النص المكتوب في البنية)']),
    input('getSelectedMessage', '(files: readonly File[]) => string', ['Optional in React, Vue and Angular, where it turns on the selection status; vanilla: required when [data-hw-file-status] exists (data-hw-selected-message="{count} …")', 'اختياري في React وVue وAngular ويفعّل حالة الاختيار؛ وفي Vanilla مطلوب عند وجود [data-hw-file-status] (data-hw-selected-message="{count} …")']),
    input('getRejectedMessage', '(rejected: readonly File[]) => string', when('accept is set (React); vanilla: when [data-hw-file-status] exists and accept or a maximum size is set', 'يُضبط accept (React)؛ وفي Vanilla: عند وجود [data-hw-file-status] مع accept أو حد أقصى للحجم')),
    input('unsupportedDropMessage', text, when('[data-hw-file-status] exists (vanilla only)', 'يوجد [data-hw-file-status] (في Vanilla فقط)')),
  ],
  upload: [input('labels', 'FileUploadLabels { selected, uploading, complete, error, remove, getProgressLabel(name), getRemoveLabel(name) }', ['Required for the file upload list', 'مطلوب دائمًا لقائمة رفع الملفات'])],
  menu: [input('triggerLabel', text, when('the adapter renders the trigger itself (Vue, Angular)', 'يعرض المحوّل زر الفتح بنفسه (Vue وAngular)'))],
  popover: [input('triggerLabel', text, when('the adapter renders the trigger itself (Vue, Angular)', 'يعرض المحوّل زر الفتح بنفسه (Vue وAngular)'))],
  'mobile-top-bar': [input('backLabel', text, when('a back destination or back action is given', 'تُمرَّر وجهة رجوع أو إجراء رجوع'))],
  'multi-select': [
    input('searchLabel', text, ['Required (vanilla: the authored search label)', 'مطلوب دائمًا (في Vanilla: تسمية حقل البحث المكتوبة)']),
    input('emptyMessage', text, ['Required (vanilla: authored markup)', 'مطلوب دائمًا (في Vanilla: البنية المكتوبة)']),
    input('requiredMessage', text, when('required is set', 'يُضبط required')),
    input('getResultsMessage', count, when('[data-hw-status] exists (vanilla only)', 'يوجد [data-hw-status] (في Vanilla فقط)')),
    input('getSelectedMessage', count, when('the adapter renders the selected count (Angular)', 'يعرض المحوّل عدد العناصر المختارة (Angular)')),
  ],
  'navigation-drawer': [
    input('navigationLabel', text, ['Required (vanilla: when the navigation has no aria-label)', 'مطلوب دائمًا (في Vanilla: عندما لا يحمل التنقل aria-label)']),
    input('closeLabel', text, ['Required (vanilla: the authored close button)', 'مطلوب دائمًا (في Vanilla: زر الإغلاق المكتوب)']),
  ],
  'notification-list': [
    input('label', text, always),
    input('emptyMessage', text, always),
    input('unreadLabel', text, always),
    input('getMarkReadLabel', '(item) => string', when('a mark-read handler is bound', 'يُربط معالج «تمت القراءة»')),
    input('getDismissLabel', '(item) => string', when('a dismiss handler is bound', 'يُربط معالج الإخفاء')),
  ],
  pagination: [
    input('label', text, ['Required, or aria-label on the navigation', 'مطلوب دائمًا، أو aria-label على التنقل']),
    input('previousLabel', text, always),
    input('nextLabel', text, always),
    input('getPageLabel', '(page: number) => string', ['Required (vanilla: with an items container, data-hw-page-label="… {page}")', 'مطلوب دائمًا (في Vanilla: مع حاوية العناصر، data-hw-page-label="… {page}")']),
    input('getGapLabel', '(start: number, end: number) => string', ['Required (vanilla: with an items container, data-hw-gap-label="… {start} … {end}")', 'مطلوب دائمًا (في Vanilla: مع حاوية العناصر، data-hw-gap-label="… {start} … {end}")']),
    input('jumpLabel', text, ['Required (vanilla: with an items container)', 'مطلوب دائمًا (في Vanilla: مع حاوية العناصر)']),
    input('goLabel', text, ['Required (vanilla: with an items container)', 'مطلوب دائمًا (في Vanilla: مع حاوية العناصر)']),
  ],
  'password-field': [input('showLabel', text, always), input('hideLabel', text, always)],
  'portal-header': [input('skipLabel', text, when('mainId is set', 'يُضبط mainId')), ...portalHeader],
  'portal-footer': [
    input('externalLabel', text, ['Required for links that open in a new window', 'مطلوب دائمًا للروابط التي تفتح في نافذة جديدة']),
    input('navigationLabel', text, when('links are given', 'تُمرَّر روابط')),
    input('legalLinksLabel', text, when('legal links are given', 'تُمرَّر روابط قانونية')),
    input('supportLabel', text, when('support content is given', 'يُمرَّر محتوى الدعم')),
    input('brandLabel', text, optional),
  ],
  'portal-layout': [
    input('skipLabel', text, always),
    ...portalHeader,
    input('secondaryLabel', text, when('secondary navigation items are given', 'تُمرَّر عناصر تنقل ثانوي')),
    input('breadcrumbLabel', text, when('breadcrumbs are given', 'يُمرَّر مسار تنقل')),
    input('footerLabel', text, when('footer links are given', 'تُمرَّر روابط التذييل')),
  ],
  'secondary-nav': [input('label', text, always)],
  'range-slider': [
    input('lowerLabel', text, ['Required (vanilla: the authored label of the lower input)', 'مطلوب دائمًا (في Vanilla: تسمية الحقل الأدنى المكتوبة)']),
    input('upperLabel', text, ['Required (vanilla: the authored label of the upper input)', 'مطلوب دائمًا (في Vanilla: تسمية الحقل الأعلى المكتوبة)']),
    locale('Required in vanilla when [data-hw-range-output] exists; without it the output stays empty', 'مطلوب في Vanilla عند وجود [data-hw-range-output]؛ وبدونه يبقى الناتج فارغًا'),
  ],
  rating: [
    input('getRatingLabel', '(value: number, max: number) => string', always),
    input('getValueLabel', '(value: number, max: number) => string', ['Required for the rating display; the whole text alternative', 'مطلوب دائمًا لعرض التقييم؛ وهو النص البديل كاملًا']),
  ],
  'search-field': [
    input('label', text, ['Required, or aria-label / aria-labelledby on the input (Vue: or a parent Field; vanilla: a label in markup)', 'مطلوب دائمًا، أو aria-label / aria-labelledby على الحقل (في Vue: أو مكوّن Field يحيط به؛ في Vanilla: تسمية في البنية)']),
    input('clearLabel', text, ['Required (vanilla: when the clear button has no aria-label or text)', 'مطلوب دائمًا (في Vanilla: عندما لا يحمل زر المسح aria-label أو نصًا)']),
    input('searchLabel', text, when('showSearchButton is on', 'يُفعَّل showSearchButton')),
    input('getResultsMessage', count, when('suggestions are given', 'تُمرَّر اقتراحات')),
  ],
  select: [input('placeholder', text, optional)],
  'service-card': [input('actionLabel', text, when('the card renders its own action link', 'تعرض البطاقة رابط الإجراء بنفسها'))],
  'service-details': [input('requirementsLabel', text, when('requirements are given', 'تُمرَّر المتطلبات'))],
  'site-verification': [
    input('label', text, always),
    input('detailsLabel', text, always),
    input('domainLabel', text, always),
    input('domainDescription', text, always),
    input('httpsLabel', text, always),
    input('httpsDescription', text, always),
    input('registrationLabel', text, when('registrationHref is set', 'يُضبط registrationHref')),
    input('externalLabel', text, when('registrationHref is set and the link opens in a new window', 'يُضبط registrationHref ويفتح الرابط في نافذة جديدة')),
  ],
  spinner: [input('label', text, ['Required, unless the spinner is decorative (aria-hidden="true")', 'مطلوب دائمًا ما لم يكن المؤشر زخرفيًا (aria-hidden="true")'])],
  stepper: [input('label', text, ['Required, or aria-label / aria-labelledby on the list', 'مطلوب دائمًا، أو aria-label / aria-labelledby على القائمة'])],
  tabs: [input('label', text, always), input('overflowLabel', text, when("overflow is 'menu', the default", "يكون overflow هو 'menu'، وهو الافتراضي"))],
  'tag-input': [
    input('getRemoveLabel', '(tag: string) => string', ['Required (vanilla: data-hw-remove-label="… {tag}")', 'مطلوب دائمًا (في Vanilla: data-hw-remove-label="… {tag}")']),
    input('requiredMessage', text, when('required is set', 'يُضبط required')),
    input('addLabel', text, when('the adapter renders an add button (Angular)', 'يعرض المحوّل زر الإضافة (Angular)')),
  ],
  timeline: [input('label', text, always)],
  'toast-region': [
    input('label', text, ['Required, or aria-label on the region', 'مطلوب دائمًا، أو aria-label على المنطقة']),
    input('getDismissLabel', '(toast) => string', when('a message can be dismissed (vanilla: data-hw-dismiss-label="… {title}", unless the button is named)', 'يمكن إغلاق الرسالة (في Vanilla: data-hw-dismiss-label="… {title}" ما لم يُسمَّ الزر)')),
  ],
  'toggle-group': [input('label', text, always)],
  'tree-view': [
    input('label', text, ['Required, or aria-label / aria-labelledby on the tree in Vue', 'مطلوب دائمًا، أو aria-label / aria-labelledby على الشجرة في Vue']),
    input('getExpandLabel', '(node) => string', when('the toggle is exposed as a control (React, Vue)', 'يُعرض زر التوسيع عنصر تحكم (React وVue)')),
    input('getCollapseLabel', '(node) => string', when('the toggle is exposed as a control (React, Vue)', 'يُعرض زر التوسيع عنصر تحكم (React وVue)')),
  ],
};

/** The rule every component follows, in both guide languages. */
export const textRule = {
  en: 'Hawiyah contains no built-in text and chooses no locale. Your application supplies every text in its active language, under the same name in vanilla, React, Vue and Angular. A missing required text renders nothing in its place, and in development a warning that begins with “Hawiyah:” names it. In vanilla, a text comes from authored markup, then from data-hw-<kebab-name> on the controller root, then from the controller option of the same name; a function input becomes a template attribute named without “get” whose {placeholders} are filled (getPageLabel → data-hw-page-label="Page {page}").',
  ar: 'لا تحتوي هوية على أي نص مدمج ولا تختار لغة. يقدّم تطبيقك كل نص بلغته الحالية، وبالاسم نفسه في Vanilla وReact وVue وAngular. إذا غاب نص مطلوب لا يُعرض شيء مكانه، ويظهر في وضع التطوير تحذير يبدأ بـ «Hawiyah:» ويذكر اسمه. في Vanilla يُؤخذ النص من البنية المكتوبة أولًا، ثم من السمة data-hw-<kebab-name> على جذر المتحكّم، ثم من خيار المتحكّم بالاسم نفسه؛ وتصبح المدخلات الدالّية سمة قالب باسمها دون «get» تُملأ فيها {placeholders} (getPageLabel ← data-hw-page-label="الصفحة {page}").',
  none: {
    en: 'This component places no text of its own: its visible content and accessible names come from your markup, children, slots or projected content.',
    ar: 'لا يضع هذا المكوّن أي نص من عنده: يأتي محتواه الظاهر وأسماؤه الميسّرة من بنيتك أو العناصر الأبناء أو الفتحات أو المحتوى المُسقط.',
  },
} as const;
