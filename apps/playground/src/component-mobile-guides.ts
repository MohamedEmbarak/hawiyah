import type { GuideInput } from './component-guide-types';

export const mobileGuides: Record<string, GuideInput> = {
  'mobile-top-bar': {
    summary: 'A compact page header with a title, optional subtitle, logical back link and application-owned actions.',
    usage: `<header class="hw-mobile-top-bar" data-variant="internal">
  <div class="hw-mobile-top-bar-leading"><a class="hw-mobile-top-bar-back" href="#components" aria-label="Back"><span class="hw-icon" data-icon="arrow-left-01" data-directional="true" aria-hidden="true"></span></a></div>
  <div class="hw-mobile-top-bar-copy"><h2 class="hw-mobile-top-bar-title">My requests</h2><p class="hw-mobile-top-bar-subtitle">Track your applications</p></div>
  <div class="hw-mobile-top-bar-actions"><a class="hw-button" data-variant="ghost" href="#templates/search" aria-label="Search"><span class="hw-icon" data-icon="search-01" aria-hidden="true"></span></a></div>
</header>`,
    lifecycle: ['Render the current route title and actions. Choose a heading level appropriate to the surrounding page.', 'Use backHref for an explicit destination, or provide a leading button wired to your router. No history.back behavior is assumed.', 'CSS wraps long titles/actions and accounts for safe areas. No controller or viewport listener is needed.'],
    api: [
      {name:'title / subtitle',type:'content',description:'Required title, optional subtitle.'},
      {name:'variant / headingLevel',type:'main | internal / 1 | 2 | 3',description:'Internal is the default. Main uses a larger title; heading level defaults to 1.'},
      {name:'backHref / backLabel',type:'string',description:'Explicit back destination and accessible name. Default back label is Arabic.'},
      {name:'leading / actions',type:'content slots',description:'React nodes; Vue named slots; Angular [hwTopBarLeading] / [hwTopBarActions]. Leading content replaces the built-in back link.'},
    ],
    accessibility: ['Use descriptive names for icon-only actions.', 'Actions have a 44px minimum target and visible keyboard focus.', 'The back icon mirrors in RTL; ordinary links preserve Tab/Enter behavior.'],
    variants:['Internal title and subtitle','Main page title','Custom leading action'], related:['drawer','portal-header','secondary-nav'],
    frameworkNotes:'MobileTopBar is native React/Vue; Angular uses hw-mobile-top-bar. Vanilla uses semantic HTML/CSS. The header stays in normal flow; sticky positioning and route focus belong to the application.',
    limitations:['Source OS status bars and device chrome are excluded. Intrinsic height and larger action targets are explicit accessibility adaptations, not pixel parity.'], source:'docs/mobile-top-bar.md',
  },
};

export const arabicMobileGuides: Record<string, GuideInput> = {
  'mobile-top-bar': {
    ...mobileGuides['mobile-top-bar']!,
    summary:'ترويسة صفحة مدمجة بعنوان ووصف اختياري ورابط رجوع منطقي وإجراءات يديرها التطبيق.',
    usage: mobileGuides['mobile-top-bar']!.usage.replace('aria-label="Back"','aria-label="رجوع"').replace('My requests','طلباتي').replace('Track your applications','تابع طلباتك').replace('aria-label="Search"','aria-label="بحث"'),
    lifecycle:['اعرض عنوان المسار الحالي وإجراءاته، واختر مستوى العنوان المناسب للصفحة.', 'استخدم backHref لوجهة رجوع واضحة، أو وفّر زرًا مرتبطًا بموجّه التطبيق. لا يُفترض الرجوع التلقائي في سجل المتصفح.', 'يلتف المحتوى الطويل وتُراعى المساحات الآمنة دون متحكّم أو مستمع لتغيّر العرض.'],
    api:[
      {name:'title / subtitle',type:'محتوى',description:'عنوان مطلوب ووصف اختياري.'},
      {name:'variant / headingLevel',type:'main | internal / 1 | 2 | 3',description:'التنويع الافتراضي internal؛ يعرض main عنوانًا أكبر. مستوى العنوان الافتراضي 1.'},
      {name:'backHref / backLabel',type:'string',description:'وجهة الرجوع وتسميته الميسّرة؛ التسمية الافتراضية عربية.'},
      {name:'leading / actions',type:'فتحات محتوى',description:'عقد React أو فتحات Vue أو [hwTopBarLeading] و[hwTopBarActions] في Angular. يحل المحتوى الأمامي محل رابط الرجوع المدمج.'},
    ],
    accessibility:['سمّ الإجراءات ذات الأيقونات بأسماء واضحة.', 'تبلغ مساحة الإجراء 44 بكسل على الأقل ويظل تركيز لوحة المفاتيح ظاهرًا.', 'تنعكس أيقونة الرجوع في RTL وتبقى الروابط أصلية قابلة للاستخدام بـ Tab وEnter.'],
    variants:['عنوان داخلي ووصف','عنوان صفحة رئيسي','إجراء أمامي مخصص'],
    frameworkNotes:'يتوفر MobileTopBar أصليًا في React وVue، ويستخدم Angular المكوّن hw-mobile-top-bar. تستخدم النسخة المباشرة HTML وCSS. تبقى الترويسة في تدفق الصفحة؛ يدير التطبيق التثبيت وتركيز المسارات.',
    limitations:['لا يُعرض شريط حالة الجهاز. الارتفاع المرن ومساحات الإجراءات الأكبر تكييفات للإتاحة وليست ادعاءً بالتطابق البصري.'],
  },
};

export function navigationDrawerMarkup(id: string, locale: string) {
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  return `<button class="hw-button" type="button" data-hw-dialog-open="${id}">${t('Open navigation','فتح التنقل')}</button>
<dialog id="${id}" class="hw-dialog hw-drawer hw-navigation-drawer" data-hw="navigation-drawer" data-side="start" aria-labelledby="${id}-title">
  <header class="hw-dialog-header"><h2 id="${id}-title">${t('Navigation','التنقل')}</h2><button type="button" class="hw-button" data-variant="ghost" data-hw-dialog-close aria-label="${t('Close navigation','إغلاق القائمة')}"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button></header>
  <div class="hw-dialog-body"><div class="hw-navigation-drawer-user"><p>${t('Welcome to Hawiyah','مرحبًا بك في هوية')}</p></div>
    <nav class="hw-navigation-drawer-nav" aria-label="${t('Main navigation','التنقل الرئيسي')}"><ul>
      <li><a class="hw-navigation-drawer-row" href="#components" aria-current="page"><span class="hw-icon" data-icon="home-01" aria-hidden="true"></span><span>${t('Components','المكونات')}</span></a></li>
      <li><details class="hw-navigation-drawer-group"><summary class="hw-navigation-drawer-row">${t('Services','الخدمات')}</summary><ul><li><a class="hw-navigation-drawer-row" href="#templates/search">${t('Search services','البحث عن الخدمات')}</a></li><li><a class="hw-navigation-drawer-row" href="#templates/service">${t('Service details','تفاصيل الخدمة')}</a></li></ul></details></li>
      <li><span class="hw-navigation-drawer-row" aria-disabled="true">${t('Coming soon','قريبًا')}</span></li>
    </ul></nav>
  </div>
</dialog>`;
}
mobileGuides['navigation-drawer'] = {
  summary:'Modal page navigation with native links, nested disclosure groups and a current-page indicator.',
  usage:navigationDrawerMarkup('navigation-example','en'),
  lifecycle:['Render a titled drawer and a labelled navigation region. Initialize vanilla markup with enhance().', 'Open from an explicit button. Escape and deliberate backdrop dismissal return focus. Route links close the drawer; destination focus belongs to the browser/router.', 'Native summary elements expand groups. Modified link clicks and prevented router events keep the drawer open. Destroy enhancement before removing vanilla markup.'],
  api:[{name:'items',type:'NavigationDrawerItem[]',description:'Stable id, label, optional href/icon/current/disabled/children. A group href renders a separate page link inside its disclosure.'},{name:'open / onOpenChange',type:'state',description:'React controlled or defaultOpen; Vue v-model:open/defaultOpen; Angular open/openChange or show(trigger)/close().'},{name:'navigationLabel / closeLabel / side',type:'string / start | end',description:'Arabic labels and logical start side are defaults. Supply localized labels.'},{name:'user / footer',type:'slots',description:'React userContent/footer; Vue user/footer slots; Angular [hwNavigationDrawerUser]/[hwNavigationDrawerFooter].'}],
  accessibility:['Use page-link navigation, not menu or tree roles.', 'Native modal focus containment and visible keyboard focus remain; disabled groups expose no active descendants.', 'Links and summaries have 44px minimum rows. Current pages have aria-current and a leading indicator.'],
  variants:['Logical start or end','Nested groups','Optional user and footer content'],related:['mobile-top-bar','drawer','secondary-nav'],
  frameworkNotes:'NavigationDrawer composes the existing native Drawer in React/Vue; Angular uses hw-navigation-drawer. Vanilla exports createNavigationDrawer or data-hw="navigation-drawer" enhancement. Application routers own destination focus and current-route updates.',
  limitations:['327px preferred width is constrained by the viewport; example 840px device height is not copied. Existing Drawer motion remains; no source entrance timing was established.'],source:'docs/navigation-drawer.md',
};
arabicMobileGuides['navigation-drawer'] = {
  ...mobileGuides['navigation-drawer'],summary:'درج تنقل بحوار أصلي وروابط صفحات ومجموعات قابلة للطي ومؤشر للصفحة الحالية.',usage:navigationDrawerMarkup('navigation-example','ar'),
  lifecycle:['اعرض درجًا بعنوان ومنطقة تنقل مسماة، وهيّئ HTML المباشر باستخدام enhance().','يفتحه زر واضح. يعيد Escape أو إغلاق الخلفية التركيز إلى زر الفتح؛ تغلق روابط الصفحات الدرج ويملك المتصفح أو الموجّه تركيز الوجهة.','توسّع summary المجموعات. تبقى نقرات الروابط المعدلة وأحداث الموجّه الممنوعة دون إغلاق. أنه المتحكّم قبل إزالة HTML.'],
  api:[{name:'items',type:'NavigationDrawerItem[]',description:'معرّف ثابت وتسمية، مع href/icon/current/disabled/children اختيارية. يظهر رابط المجموعة داخلها منفصلًا عن زر التوسيع.'},{name:'open / onOpenChange',type:'حالة',description:'React: حالة مضبوطة أو defaultOpen؛ Vue: v-model:open/defaultOpen؛ Angular: open/openChange أو show(trigger)/close().'},{name:'navigationLabel / closeLabel / side',type:'string / start | end',description:'التسميات الافتراضية عربية والموضع الافتراضي البداية المنطقية. وفّر تسميات اللغة المختارة.'},{name:'user / footer',type:'فتحات محتوى',description:'React: userContent/footer؛ Vue: user/footer؛ Angular: [hwNavigationDrawerUser]/[hwNavigationDrawerFooter].'}],
  accessibility:['استخدم روابط صفحات دون أدوار menu أو tree.','يحصر الحوار الأصلي التركيز داخله ويبقى التركيز ظاهرًا؛ لا تحتوي المجموعات المعطلة إجراءات نشطة.','ارتفاع الصف 44 بكسل على الأقل، وتحدد aria-current الصفحة الحالية مع مؤشر في البداية المنطقية.'],
  variants:['البداية أو النهاية المنطقية','مجموعات متداخلة','محتوى مستخدم وتذييل اختياري'],
  frameworkNotes:'يركب NavigationDrawer فوق Drawer الأصلي في React وVue، ويستخدم Angular المكوّن hw-navigation-drawer. تستخدم النسخة المباشرة createNavigationDrawer أو data-hw="navigation-drawer". يملك التطبيق التركيز بعد التوجيه وحالة المسار الحالي.',
  limitations:['العرض المفضّل 327 بكسل مقيد بعرض الشاشة؛ لا يُنسخ ارتفاع إطار الجهاز. تبقى حركة Drawer الحالية دون استنتاج توقيت دخول من المصدر.'],
};
