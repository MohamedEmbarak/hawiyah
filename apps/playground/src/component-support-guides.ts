import type { GuideInput } from './component-guide-types';

// CopyButton and SideNavigation: the reference pages and the shared authored markup of their examples.
type Text = (en: string, ar: string) => string;
const text = (locale: string): Text => (en, ar) => locale === 'ar' ? ar : en;

export const copyCommand = 'pnpm add @hawiyah/styles';
/** Authored vanilla markup: the value stays visible beside the button that copies it. */
export function copyButtonMarkup(id: string, locale: string) {
  const t = text(locale);
  return `<p><code class="hw-code" id="${id}-value">${copyCommand}</code>
  <span class="hw-copy" data-hw="copy-button" data-hw-target="${id}-value" data-hw-copied-message="${t('Command copied', 'تم نسخ الأمر')}" data-hw-failed-message="${t('Copying failed. Select the command and copy it manually.', 'تعذّر النسخ. حدّد الأمر وانسخه يدويًا.')}">
    <button type="button" class="hw-button hw-icon-button" data-variant="ghost" data-size="md" aria-label="${t('Copy the install command', 'نسخ أمر التثبيت')}"><span class="hw-icon" data-icon="copy-01" aria-hidden="true"></span></button>
    <span class="hw-copy-message" role="status" aria-live="polite" aria-atomic="true"></span>
  </span></p>`;
}

export function sideNavigationItems(locale: string) {
  const t = text(locale);
  return [
    { id: 'start', label: t('Getting started', 'البدء'), href: '#start', icon: 'home-01' },
    { id: 'components', label: t('Components', 'المكونات'), children: [
      { id: 'copy-button', label: t('Copy button', 'زر النسخ'), href: '#copy-button', current: true },
      { id: 'side-navigation', label: t('Side navigation', 'التنقل الجانبي'), href: '#side-navigation' },
    ] },
    { id: 'patterns', label: t('Patterns', 'الأنماط'), children: [{ id: 'forms', label: t('Forms', 'النماذج'), href: '#forms' }] },
    { id: 'soon', label: t('Coming soon', 'قريبًا'), href: '#soon', disabled: true },
  ];
}
/** Authored vanilla markup of the same items. The controller opens the group that holds the current page. */
export function sideNavigationMarkup(locale: string) {
  const t = text(locale);
  const [start, components, patterns, soon] = sideNavigationItems(locale);
  const link = (item: { label: string; href?: string; current?: boolean }) => `<li><a class="hw-navigation-drawer-row" href="${item.href}"${item.current ? ' aria-current="page"' : ''}><span class="hw-navigation-drawer-label">${item.label}</span></a></li>`;
  const group = (item: { label: string; children?: { label: string; href?: string; current?: boolean }[] }) => `<li><details class="hw-navigation-drawer-group"><summary class="hw-navigation-drawer-row"><span class="hw-navigation-drawer-label">${item.label}</span></summary><ul>
      ${item.children!.map(link).join('\n      ')}
    </ul></details></li>`;
  return `<nav class="hw-side-navigation hw-navigation-drawer-nav" data-hw="side-navigation" aria-label="${t('Guide sections', 'أقسام الدليل')}">
  <ul>
    <li><a class="hw-navigation-drawer-row" href="${start!.href}"><span class="hw-icon" data-icon="home-01" aria-hidden="true"></span><span class="hw-navigation-drawer-label">${start!.label}</span></a></li>
    ${group(components!)}
    ${group(patterns!)}
    <li><span class="hw-navigation-drawer-row" aria-disabled="true"><span class="hw-navigation-drawer-label">${soon!.label}</span></span></li>
  </ul>
</nav>`;
}

export const supportGuides: Record<string, GuideInput> = {
  'copy-button': {
    summary: 'A button that copies a value the page already shows and reports the outcome in a polite status beside it.',
    usage: copyButtonMarkup('copy-example', 'en'),
    lifecycle: ['Place the button beside the visible value it copies. The value is read when the reader activates the button and never before.', 'In vanilla, enhance() or createCopyButton(root, options) binds the authored button; destroy() restores the authored attributes. React, Vue and Angular render the same markup.', 'The copied state returns to idle after feedbackDuration (3000 ms by default). The failed state stays until the next activation, and only the latest activation counts.'],
    api: [
      { name: 'text', type: 'string | () => string', description: 'Required. The value to copy; vanilla reads data-hw-text or the element named by data-hw-target.' },
      { name: 'label / copiedMessage / failedMessage', type: 'string', description: 'Required texts: the constant accessible name of the button and the two status messages.' },
      { name: 'display / variant / size', type: 'icon | text / Button variants / sm | md | lg', description: 'Icon button by default, with the ghost variant and the md size.' },
      { name: 'feedbackDuration / disabled', type: 'number / boolean', description: 'Milliseconds the copied state lasts, and the native disabled attribute.' },
      { name: 'onCopyResult / copyResult / hw:change', type: '{ status, text }', description: 'Once per activation that still counts. status is copied, denied, unavailable, failed or empty.' },
    ],
    accessibility: ['The accessible name does not change with the state; the outcome is announced by a role="status" region that is emptied before each activation.', 'A failure message is visible text, so the reader can copy the value manually. Focus stays on the button.', 'The clipboard is written only on activation and is never read. Without the asynchronous Clipboard API the result is unavailable; there is no execCommand fallback.'],
    variants: ['Icon button', 'Text button'], related: ['icon-button', 'button', 'toast-region'],
    frameworkNotes: 'React and Vue export CopyButton; Angular uses hw-copy-button, whose host element is the root; vanilla exports createCopyButton and supports data-hw="copy-button". Core copyText and createCopyFeedback hold the behaviour shared by the four.',
    limitations: ['A result that settles at once empties and fills the status inside one task; that an identical message is then repeated has not been verified with a screen reader.'], source: 'packages/core/src/copy.ts',
  },
  'side-navigation': {
    summary: 'The page list of NavigationDrawer outside a drawer: links and native group disclosures in a navigation landmark.',
    usage: sideNavigationMarkup('en'),
    lifecycle: ['Supply the same items as NavigationDrawer and mark the current page on each route change. The group that holds the current page is open.', 'In vanilla, enhance() or createSideNavigation(nav, options) applies the group and disabled-row rules to authored markup; call refresh() after moving aria-current, and destroy() to restore the authored attributes.', 'With sticky, the navigation sticks from 64rem and scrolls in its own box; place it with --hw-side-navigation-top and --hw-side-navigation-bottom-reserve.'],
    api: [
      { name: 'items', type: 'NavigationItem[]', description: 'Required. id, label, optional href, icon, current, disabled, expanded and children.' },
      { name: 'label', type: 'string', description: 'Required. The accessible name of the navigation landmark.' },
      { name: 'sticky', type: 'boolean', description: 'Writes data-sticky="true". Off by default.' },
      { name: '.hw-side-navigation', type: 'class', description: 'The nav element, together with .hw-navigation-drawer-nav; rows and groups use the NavigationDrawer classes.' },
    ],
    accessibility: ['A nav landmark with a name, native links and native details/summary groups: no tree role, no roving focus and no custom arrow keys.', 'The current page carries aria-current="page"; its label keeps the text colour and a marker shows the primary colour.', 'Disabled entries are text without a tab stop. The current link is scrolled into the navigation\'s own box without moving focus or the page.'],
    variants: ['In flow', 'Sticky from 64rem'], related: ['navigation-drawer', 'content-navigation', 'sidebar'],
    frameworkNotes: 'React and Vue export SideNavigation; Angular uses hw-side-navigation or nav[hwSideNavigation]; vanilla exports createSideNavigation and supports data-hw="side-navigation". The list markup is the same as in NavigationDrawer for the same items.',
    limitations: ['A persistent side navigation for pages is not covered by the references in this repository; its placement is a Hawiyah design choice.'], source: 'docs/navigation-drawer.md',
  },
};

export const arabicSupportGuides: Record<string, GuideInput> = {
  'copy-button': {
    ...supportGuides['copy-button']!,
    summary: 'زر ينسخ قيمة تعرضها الصفحة ويعلن النتيجة في منطقة حالة مهذبة بجواره.',
    usage: copyButtonMarkup('copy-example', 'ar'),
    lifecycle: ['ضع الزر بجوار القيمة الظاهرة التي ينسخها. تُقرأ القيمة عند تفعيل الزر فقط.', 'في النسخة المباشرة يربط enhance() أو createCopyButton(root, options) الزر المكتوب، ويعيد destroy() السمات الأصلية. تعرض React وVue وAngular البنية نفسها.', 'تعود حالة «تم النسخ» إلى الوضع الأصلي بعد feedbackDuration (3000 مللي ثانية افتراضيًا). تبقى حالة الإخفاق حتى التفعيل التالي، ولا يُعتد إلا بآخر تفعيل.'],
    api: [
      { name: 'text', type: 'string | () => string', description: 'مطلوب. القيمة المراد نسخها؛ تقرأ النسخة المباشرة data-hw-text أو العنصر المحدد في data-hw-target.' },
      { name: 'label / copiedMessage / failedMessage', type: 'string', description: 'نصوص مطلوبة: الاسم الميسّر الثابت للزر ورسالتا الحالة.' },
      { name: 'display / variant / size', type: 'icon | text / أنماط Button / sm | md | lg', description: 'زر أيقونة افتراضيًا بالنمط ghost والحجم md.' },
      { name: 'feedbackDuration / disabled', type: 'number / boolean', description: 'مدة بقاء حالة «تم النسخ» بالمللي ثانية، وسمة disabled الأصلية.' },
      { name: 'onCopyResult / copyResult / hw:change', type: '{ status, text }', description: 'مرة واحدة لكل تفعيل يُعتد به. قيمة status هي copied أو denied أو unavailable أو failed أو empty.' },
    ],
    accessibility: ['لا يتغير الاسم الميسّر بتغير الحالة؛ تُعلن النتيجة في منطقة role="status" تُفرَّغ قبل كل تفعيل.', 'رسالة الإخفاق نص ظاهر، فيستطيع القارئ نسخ القيمة يدويًا. يبقى التركيز على الزر.', 'تُكتب الحافظة عند التفعيل فقط ولا تُقرأ أبدًا. عند غياب واجهة الحافظة غير المتزامنة تكون النتيجة unavailable، ولا يُستخدم execCommand.'],
    variants: ['زر أيقونة', 'زر نصي'],
    frameworkNotes: 'تصدّر React وVue المكوّن CopyButton، ويستخدم Angular المكوّن hw-copy-button وعنصره المضيف هو الجذر، وتصدّر النسخة المباشرة createCopyButton وتدعم data-hw="copy-button". يحمل copyText وcreateCopyFeedback في core السلوك المشترك بين الأربعة.',
    limitations: ['النتيجة الفورية تفرّغ منطقة الحالة وتملؤها في مهمة واحدة؛ ولم يُتحقق بقارئ شاشة من تكرار إعلان الرسالة المطابقة حينئذ.'],
  },
  'side-navigation': {
    ...supportGuides['side-navigation']!,
    summary: 'قائمة صفحات NavigationDrawer خارج الدرج: روابط ومجموعات طيّ أصلية داخل معلم تنقل.',
    usage: sideNavigationMarkup('ar'),
    lifecycle: ['قدّم العناصر نفسها المستخدمة في NavigationDrawer وحدّد الصفحة الحالية عند كل تغيير للمسار. تُفتح المجموعة التي تحتوي الصفحة الحالية.', 'في النسخة المباشرة يطبق enhance() أو createSideNavigation(nav, options) قواعد المجموعات والصفوف المعطلة على البنية المكتوبة؛ استدعِ refresh() بعد نقل aria-current، وdestroy() لإعادة السمات الأصلية.', 'مع sticky يثبت التنقل ابتداءً من 64rem ويُمرَّر داخل صندوقه؛ حدّد موضعه بالمتغيرين --hw-side-navigation-top و--hw-side-navigation-bottom-reserve.'],
    api: [
      { name: 'items', type: 'NavigationItem[]', description: 'مطلوب. id وlabel، مع href وicon وcurrent وdisabled وexpanded وchildren اختيارية.' },
      { name: 'label', type: 'string', description: 'مطلوب. الاسم الميسّر لمعلم التنقل.' },
      { name: 'sticky', type: 'boolean', description: 'يكتب data-sticky="true". معطل افتراضيًا.' },
      { name: '.hw-side-navigation', type: 'صنف', description: 'عنصر nav مع الصنف .hw-navigation-drawer-nav؛ تستخدم الصفوف والمجموعات أصناف NavigationDrawer.' },
    ],
    accessibility: ['معلم nav مسمّى وروابط أصلية ومجموعات details/summary أصلية: لا دور tree ولا تركيز متنقل ولا مفاتيح أسهم مخصصة.', 'تحمل الصفحة الحالية aria-current="page"؛ يحتفظ نصها بلون النص ويظهر المؤشر باللون الأساسي.', 'العناصر المعطلة نص بلا موضع تبويب. يُمرَّر الرابط الحالي داخل صندوق التنقل دون نقل التركيز أو تمرير الصفحة.'],
    variants: ['ضمن تدفق الصفحة', 'ثابت ابتداءً من 64rem'],
    frameworkNotes: 'تصدّر React وVue المكوّن SideNavigation، ويستخدم Angular المكوّن hw-side-navigation أو nav[hwSideNavigation]، وتصدّر النسخة المباشرة createSideNavigation وتدعم data-hw="side-navigation". بنية القائمة مطابقة لبنية NavigationDrawer للعناصر نفسها.',
    limitations: ['لا تغطي المراجع المتوفرة في هذا المستودع تنقلًا جانبيًا دائمًا للصفحات؛ وموضعه اختيار تصميمي في هوية.'],
  },
};
