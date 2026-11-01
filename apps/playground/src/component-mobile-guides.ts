import type { GuideInput } from './component-guide-types';

export const mobileGuides: Record<string, GuideInput> = {
  'mobile-top-bar': {
    summary: 'A compact page header with a title, optional subtitle, logical back link and application-owned actions.',
    usage: `<header class="nq-mobile-top-bar" data-variant="internal">
  <div class="nq-mobile-top-bar-leading"><a class="nq-mobile-top-bar-back" href="#components" aria-label="Back"><span class="nq-icon" data-icon="arrow-left-01" data-directional="true" aria-hidden="true"></span></a></div>
  <div class="nq-mobile-top-bar-copy"><h2 class="nq-mobile-top-bar-title">My requests</h2><p class="nq-mobile-top-bar-subtitle">Track your applications</p></div>
  <div class="nq-mobile-top-bar-actions"><a class="nq-button" data-variant="ghost" href="#templates/search" aria-label="Search"><span class="nq-icon" data-icon="search-01" aria-hidden="true"></span></a></div>
</header>`,
    lifecycle: ['Render the current route title and actions. Choose a heading level appropriate to the surrounding page.', 'Use backHref for an explicit destination, or provide a leading button wired to your router. No history.back behavior is assumed.', 'CSS wraps long titles/actions and accounts for safe areas. No controller or viewport listener is needed.'],
    api: [
      {name:'title / subtitle',type:'content',description:'Required title, optional subtitle.'},
      {name:'variant / headingLevel',type:'main | internal / 1 | 2 | 3',description:'Internal is the default. Main uses a larger title; heading level defaults to 1.'},
      {name:'backHref / backLabel',type:'string',description:'Explicit back destination and accessible name. Default back label is Arabic.'},
      {name:'leading / actions',type:'content slots',description:'React nodes; Vue named slots; Angular [nqTopBarLeading] / [nqTopBarActions]. Leading content replaces the built-in back link.'},
    ],
    accessibility: ['Use descriptive names for icon-only actions.', 'Actions have a 44px minimum target and visible keyboard focus.', 'The back icon mirrors in RTL; ordinary links preserve Tab/Enter behavior.'],
    variants:['Internal title and subtitle','Main page title','Custom leading action'], related:['drawer','portal-header','secondary-nav'],
    frameworkNotes:'MobileTopBar is native React/Vue; Angular uses nq-mobile-top-bar. Vanilla uses semantic HTML/CSS. The header stays in normal flow; sticky positioning and route focus belong to the application.',
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
      {name:'leading / actions',type:'فتحات محتوى',description:'عقد React أو فتحات Vue أو [nqTopBarLeading] و[nqTopBarActions] في Angular. يحل المحتوى الأمامي محل رابط الرجوع المدمج.'},
    ],
    accessibility:['سمّ الإجراءات ذات الأيقونات بأسماء واضحة.', 'تبلغ مساحة الإجراء 44 بكسل على الأقل ويظل تركيز لوحة المفاتيح ظاهرًا.', 'تنعكس أيقونة الرجوع في RTL وتبقى الروابط أصلية قابلة للاستخدام بـ Tab وEnter.'],
    variants:['عنوان داخلي ووصف','عنوان صفحة رئيسي','إجراء أمامي مخصص'],
    frameworkNotes:'يتوفر MobileTopBar أصليًا في React وVue، ويستخدم Angular المكوّن nq-mobile-top-bar. تستخدم النسخة المباشرة HTML وCSS. تبقى الترويسة في تدفق الصفحة؛ يدير التطبيق التثبيت وتركيز المسارات.',
    limitations:['لا يُعرض شريط حالة الجهاز. الارتفاع المرن ومساحات الإجراءات الأكبر تكييفات للإتاحة وليست ادعاءً بالتطابق البصري.'],
  },
};
