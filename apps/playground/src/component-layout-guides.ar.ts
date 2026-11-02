import type { GuideInput } from './component-guide-types';
import { layoutPlatformGuides } from './component-layout-guides';

type ArabicGuide = Omit<GuideInput, 'api' | 'source' | 'related'> & { apiDescriptions: string[] };
const apiTypes: Record<string, string> = {
  'HTML elements': 'عناصر HTML',
  'heading and descriptive content': 'عنوان ومحتوى وصفي',
  content: 'محتوى',
  'description-item arrays': 'مصفوفات من أزواج المصطلح والوصف',
  'React node / Vue slot / Angular projected content': 'عقدة React / فتحة Vue / محتوى مسقط في Angular',
  'content / URL': 'محتوى / رابط',
  'CSS variant': 'تنويع CSS',
  'localized string': 'نص مترجم',
  'vanilla controller': 'متحكّم Vanilla',
  'optional string': 'string اختياري',
  'notification array with stable IDs': 'مصفوفة إشعارات بمعرّفات ثابتة',
  'localized text': 'نص مترجم',
  'CSS state': 'حالة CSS',
  'callback or event carrying item ID': 'دالة استدعاء أو حدث يحمل معرّف العنصر',
  'CSS length': 'طول CSS',
  'Responsive<0..16 | CSS length>': 'Responsive<0..16 | طول CSS>',
  'Responsive<positive integer>': 'Responsive<عدد صحيح موجب>',
  'LayoutAlign / LayoutJustify': 'LayoutAlign / LayoutJustify',
  'native CSS length': 'طول CSS عادي',
  'CSS default: 1 1 0%': 'القيمة الافتراضية في CSS: ‏1 1 0%',
  'Responsive spacing': 'تباعد متجاوب',
  'positive finite number': 'عدد موجب محدود',
  'contain (default behavior is cover)': 'contain؛ السلوك الافتراضي cover',
  'semantic HTML': 'HTML دلالي',
  'landmarks or nq-app-shell-* classes': 'معالم الصفحة أو أصناف nq-app-shell-*',
  'React node / Vue slot / Angular [nqBreadcrumb]': 'عقدة React / فتحة Vue / ‏[nqBreadcrumb] في Angular',
  'React node / Vue slot / Angular default content': 'عقدة React / فتحة Vue / المحتوى الافتراضي في Angular',
};
function localize(id: string, text: ArabicGuide): GuideInput {
  const original = layoutPlatformGuides[id];
  if (!original || text.apiDescriptions.length !== original.api.length) throw new Error(`Arabic guide API mismatch: ${id}`);
  const { apiDescriptions, ...content } = text;
  return {
    ...original,
    ...content,
    api: original.api.map((item, index) => ({
      name: item.name,
      type: apiTypes[item.type] ?? item.type,
      description: apiDescriptions[index]!,
    })),
  };
}
const noLayoutController = 'لا يحتاج التخطيط إلى enhance() أو اشتراك في أحداث أو دورة destroy(). تنفّذ CSS التخطيط من دون مراقبة عرض الشاشة بجافاسكربت.';
const layoutFrameworks = 'يوفّر React وVue المكوّن باسم التخطيط، ويستخدم Angular محدّد nq-* المطابق. تُحوّل خصائص التخطيط المشتركة عبر layoutStyles من @nasaq/core. تقبل تخطيطات Vue الأساسية الخاصية as؛ ويستخدم React عنصر div باستثناء Section الذي يستخدم section. اضبط كل تخطيط متداخل على حدة لأن متغيّراته تبدأ بقيمه الخاصة. تضبط مدخلات Angular غلافًا داخليًا؛ ولا تنتقل سمات العنصر المضيف إلى هذا الغلاف تلقائيًا.';

export const arabicLayoutPlatformGuides: Record<string, GuideInput> = {
  'description-list': localize('description-list', {
    summary: 'اعرض أزواج المصطلح والقيمة، مثل مرجع الطلب والرسوم ووقت المعالجة، باستخدام الدلالة الأصلية لقائمة الوصف.',
    usage: `<dl class="nq-description-list" data-variant="horizontal" lang="ar" dir="rtl">
  <div><dt>المرجع</dt><dd dir="ltr">NQ-1043</dd></div>
  <div><dt>رسوم الخدمة</dt><dd><bdi>200 <span class="nq-riyal" aria-hidden="true">⃁</span><span class="nq-sr-only">ريال سعودي</span></bdi></dd></div>
  <div><dt>وقت المعالجة المتوقع</dt><dd>3 أيام عمل</dd></div>
</dl>`,
    apiDescriptions: [
      'يجمع كل عنصر div مباشر مصطلحه ووصفه. ويمكن أن تتضمن القيمة رابطًا أو محتوى دلاليًا آخر.',
      'يضع horizontal المصطلح بجانب القيمة ثم يرتّبهما رأسيًا في الشاشات الضيقة؛ ويقلّل compact الحشو داخل الصفوف.',
      'تقبل term وdescription محتوى ReactNode؛ ويعرّف key الصف عند تحديث القائمة.',
    ],
    lifecycle: ['اعرض القائمة من السجل الحالي؛ فهي لا تملك حالة اختيار ولا تحتاج إلى تهيئة بجافاسكربت.', 'حدّث أزواج المصطلح والقيمة عند تغيّر السجل. حافظ على مفاتيح ثابتة للصفوف التي تتضمن عناصر تفاعلية.', 'لا تتطلب إزالة القائمة أي إجراء تنظيف خاص بالمكوّن.'],
    accessibility: ['استخدم dl وdt وdd بدل فقرات متباعدة بصريًا حتى تبقى العلاقة مفهومة عند تغيير التنسيق.', 'ضع dir="ltr" على المرجع أو رقم الآيبان وحده داخل المحتوى العربي، واترك اتجاه تسميته طبيعيًا.'],
    variants: ['مصطلحات وقيم مرتبة رأسيًا', 'عرض أفقي', 'عرض مختصر'],
    frameworkNotes: 'يقبل React وVue مصفوفة items. ويقبل nq-description-list في Angular الخاصيتين items وvariant؛ وتستخدم عناصره الحقلين term وdescription.',
  }),
  'service-card': localize('service-card', {
    summary: 'لخّص خدمة واحدة بتصنيفها وغرضها وأهم معلوماتها، مع رابط واضح إلى التفاصيل أو رحلة التقديم.',
    usage: `<article class="nq-service-card" data-variant="featured" lang="ar" dir="rtl">
  <span class="nq-badge" data-tone="info">الأعمال</span>
  <h3>تجديد رخصة تجارية</h3>
  <p>اطّلع على المتطلبات وجدّد الرخصة الحالية.</p>
  <div class="nq-service-card-meta"><span><bdi>150 <span class="nq-riyal" aria-hidden="true">⃁</span><span class="nq-sr-only">ريال سعودي</span></bdi></span><span>يوم عمل واحد</span></div>
  <a class="nq-button" href="./services/license">عرض خدمة تجديد الرخصة</a>
</article>`,
    apiDescriptions: [
      'صف خدمة واحدة. تعرض خصائص title في الأطر عنوان h3؛ ويمكن في HTML المباشر اختيار مستوى العنوان المناسب.',
      'وجهة الرابط ونص الإجراء المترجم. يتولى التطبيق التنقل وتحميل المسار.',
      'يضيف featured إبرازًا بصريًا؛ ويقلّل compact التباعد. استخدم سمة data في الأطر التي تمرّر السمات ولا توفّر خاصية مخصّصة لهذا التنويع.',
      'يستخدم React أزواج term وdescription. وتكون metadata في Vue مصفوفة نصوص؛ بينما يوفّر Angular النصين duration وfee.',
    ],
    lifecycle: ['اعرض بطاقة لكل خدمة معروفة، واستخدم معرّف خدمة ثابتًا عند عرض مجموعة بطاقات.', 'تتنقل الروابط بصورة عادية. تغيّر التوفر أو الرسوم أو المدة التقديرية هو تحديث لبيانات التطبيق.', 'لا توجد وحدة لجلب البيانات أو إرسال الطلبات تحتاج إلى تهيئة أو إنهاء.'],
    accessibility: ['امنح رابط الإجراء اسمًا مميزًا عندما تكرر عدة بطاقات عبارة «عرض الخدمة».', 'أبقِ الروابط والأزرار منفصلة؛ ولا تغلف البطاقة كلها برابط إن كانت تتضمن عناصر تفاعلية أخرى.', 'أضف aria-hidden="true" إلى أيقونات الخدمة الزخرفية فقط.'],
    variants: ['افتراضية', 'مميّزة', 'مختصرة'],
    frameworkNotes: 'يستخدم React الخصائص title وdescription وcategory وmetadata وicon وaction. ويستخدم Vue الخصائص title وdescription وbadge وmetadata مع فتحتي icon وaction. يتطلب nq-service-card في Angular الخاصيتين title وhref، ويوفّر category وduration وfee وvariant.',
    limitations: ['تعرض البطاقة المعلومات التي يقدّمها التطبيق؛ ولا تتحقق من الأهلية ولا تضمن مدة إنجاز الخدمة.'],
  }),
  'service-details': localize('service-details', {
    summary: 'اشرح الخدمة قبل البدء: الأهلية والمستندات والرسوم والمدة والإجراء التالي، ضمن مقال أو قسم سهل القراءة.',
    usage: `<article class="nq-service-details" aria-labelledby="license-details-title" lang="ar" dir="rtl">
  <header><h2 id="license-details-title">تجديد الرخصة</h2><p>جهّز هذه المعلومات قبل البدء.</p></header>
  <dl class="nq-description-list"><div><dt>الأهلية</dt><dd>المنشآت التي لديها رخصة سارية</dd></div></dl>
  <section aria-labelledby="license-requirements"><h3 id="license-requirements">المتطلبات</h3><ul><li>مرجع الرخصة الحالية</li><li>عنوان وطني محدّث</li></ul></section>
  <footer><a class="nq-button" href="./apply/license">بدء التجديد</a></footer>
</article>`,
    apiDescriptions: [
      'عنوان الخدمة ومقدمة موجزة. ترجم كليهما مع تسميات قسم المتطلبات.',
      'معلومات الخدمة في أزواج، مع قائمة متطلبات اختيارية. القيمة الافتراضية لـ requirementsLabel بالإنجليزية، لذا مرّر ترجمتها.',
      'تختلف أسماء خصائص معلومات الخدمة بين الأطر. يقبل Angular أيضًا requirements وrequirementsLabel.',
      'ضع إجراء بدء الرحلة بعد المعلومات التي يحتاجها المستخدم لاتخاذ القرار.',
    ],
    lifecycle: ['اعرض سجل الخدمة ومتطلباتها قبل جمع بيانات الطلب.', 'استبدل المحتوى عند تغيير المسار أو الخدمة، وحافظ على تسلسل واضح للعناوين، وانقل التركيز إلى عنوان الصفحة الجديدة عبر الموجّه.', 'لا يسجّل هذا التركيب أي مراقبين أو متحكّمات لعناصر الصفحة.'],
    accessibility: ['استخدم قوائم حقيقية للمتطلبات وقوائم وصفية للمعلومات ذات التسميات.', 'اجعل روابط المساعدة واضحة، واذكر المستندات المطلوبة نصيًا بدل الاعتماد على الأيقونات أو اللون وحدهما.'],
    variants: ['معلومات في قائمة وصفية', 'متطلبات مع إجراء', 'أقسام إضافية يملكها التطبيق'],
    frameworkNotes: 'يعرض React عنصر article باستخدام metadata وrequirements وaction. ويعرض Vue عنصر section باستخدام items وفتحة action. يقبل nq-service-details في Angular الخصائص details وrequirements؛ ومرّر الإجراءات المخصّصة ضمن محتواه.',
    limitations: ['يجب أن تأتي ضوابط الأهلية والسياسة الحالية وبيانات الخدمة المعتمدة من الجهة المالكة للخدمة.'],
  }),
  'portal-header': localize('portal-header', {
    summary: 'وفّر هوية المنصة والتنقل الرئيسي وإجراءات الحساب أو اللغة، مع إبقاء التنقل واضحًا في الشاشات الصغيرة.',
    usage: `<header class="nq-portal-header" lang="ar" dir="rtl" data-nq="portal-header">
  <a class="nq-skip-link" href="#main-content">انتقل إلى المحتوى</a>
  <a class="nq-portal-brand" href="./">نسق</a>
  <button class="nq-button nq-portal-menu-toggle" type="button" data-nq-portal-toggle>القائمة</button>
  <nav aria-label="التنقل الرئيسي" data-nq-portal-navigation><ul>
    <li><a href="./services" aria-current="page">الخدمات</a></li>
    <li><a href="./requests">طلباتي</a></li>
  </ul></nav>
  <div class="nq-portal-header-actions"><button class="nq-button" type="button">تغيير اللغة</button></div>
</header>`,
    apiDescriptions: [
      'استخدم رابطًا للصفحة الرئيسية له اسم ميسّر. يسمّي React الرابط brandHref؛ ويستخدم Vue وAngular الاسم homeHref.',
      'يسمّي React مجموعة الروابط navigation؛ ويستخدم Vue وAngular الاسم links. يحصل الرابط الحالي على aria-current="page".',
      'يثبّت الترويسة عند بداية الصفحة. تأكد من أنها لا تحجب العناصر المركّز عليها أو الوجهات الداخلية للروابط.',
      'تدعم الأطر الأربعة هذه الخصائص. يُنشأ معرّف التنقل تلقائيًا، ويربط mainId رابط التجاوز بهدف محتوى قابل للتركيز. التسميات الافتراضية عربية.',
      'الخيارات: onOpenChange(open). يعيد المتحكّم open وshow() وclose(restoreFocus?) وdestroy(). يكتشف enhance() ترويسة data-nq="portal-header" وعلامتي data-nq-portal-toggle وdata-nq-portal-navigation.',
    ],
    lifecycle: ['اعرض التنقل من حالة المسار وحدّث aria-current. يملك كل إطار عناصره وحالة إظهار التنقل.', 'في Vanilla استدعِ enhance() أو createPortalHeader() بعد التركيب. لا تُخفِ التنقل في HTML الأولي كي تبقى الروابط متاحة دون JavaScript.', 'يغلق Escape التنقل ويعيد التركيز إلى الزر. يغلقه أيضًا اختيار رابط أو الضغط خارج الترويسة أو مغادرة التركيز. يبقى Tab طبيعيًا.', 'قبل استبدال HTML حرّر enhance() أو استدعِ destroy() لإزالة المستمعين واستعادة السمات الأصلية. تنهي الأطر مستمعيها تلقائيًا.'],
    accessibility: ['سمِّ التنقل ووفّر رابط تجاوز إلى هدف محتوى يحمل tabindex="-1".', 'يحتاج رابط الهوية إلى اسم حتى عندما يحتوي على صورة شعار مرسومة بالمسارات فقط.', 'يحدّث الزر aria-expanded وaria-controls. تبقى العناصر روابط تنقل عادية دون أدوار menu أو حجز التركيز.'],
    variants: ['تنقل قابل للطي تحت 48rem', 'تنقل سطح المكتب', 'ترويسة ثابتة عبر data-variant'],
    frameworkNotes: 'يستخدم React الخصائص brand وbrandHref وnavigation وnavigationLabel وactions وnotice. يستخدم Vue الخصائص brand وhomeHref وlinks وnavLabel مع فتحتي logo وactions. يستخدم Angular الخصائص brand وhomeHref وlinks وnavigationLabel مع إسقاط [nqBrand] والإجراءات. تدعم الأطر menuLabel وnavigationId وmainId وskipLabel. وفّر معرّفات ثابتة صريحة لجذور Angular المسلسلة بصورة مستقلة.',
    limitations: ['حد 48rem قرار تكييف في نسق وليس حدًا مؤكدًا من Figma.', 'لا تنفّذ الترويسة المصادقة أو تغيير مسارات اللغة أو إدارة حالة الحساب.'],
  }),
  'secondary-nav': localize('secondary-nav', {
    summary: 'اعرض مستوى ثانيًا من روابط الصفحات مع حالة واضحة للصفحة الحالية وتركيز مرئي بلوحة المفاتيح.',
    usage: `<nav class="nq-secondary-nav" aria-label="تنقل الخدمات"><ul>
  <li><a href="./services" aria-current="page">الخدمات</a></li>
  <li><a href="./requests">طلباتي</a></li>
</ul></nav>`,
    apiDescriptions: [
      'يقبل SecondaryNav في React وVue وnq-secondary-nav في Angular الخاصية items. يقبل عنوان React عقدة ReactNode، وتكون العناوين في Vue وAngular نصوصًا.',
      'يسمّي معلم التنقل وتكون قيمته الافتراضية عربية. ميّزه عن التنقل الرئيسي وروابط التذييل.',
      'اختر variant=mobile لروابط متساوية العرض بأيقونة فوق النص وخط علوي للصفحة الحالية وانتقال لوني 300 مللي ثانية. مرّر اسم الأيقونة الزخرفية في icon؛ تبقى الروابط عادية.',
      'تستخدم Vanilla عنصر nav وقائمة روابط. تحدد aria-current="page" الوجهة الحالية، ولا يلزم متحكّم JavaScript.',
    ],
    lifecycle: ['اعرض الروابط بحسب تسلسل الصفحات الحالي.', 'حدّث current عند تغيّر المسار؛ يبقى التنقل وتحميل البيانات من مسؤوليات التطبيق.', 'لا يلزم تحسين أو اشتراك أو إنهاء خاص.'],
    accessibility: ['استخدم الروابط الأصلية وترتيب Tab؛ لا تضف أدوار tablist أو menu.', 'تعرض الحالة الحالية خطًا ووزنًا مختلفًا إلى جانب اللون. يبقى التركيز مرئيًا في الألوان الإجبارية.', 'ترجم تسمية المعلم مستقلة عن اتجاه النص.'],
    variants: ['روابط قابلة للالتفاف', 'رابط الصفحة الحالية', 'شريط أيقونات الجوال (variant=mobile)'],
    frameworkNotes: 'استورد SecondaryNav من @nasaq/react أو @nasaq/vue، أو NqSecondaryNavComponent من @nasaq/angular بمحدّد nq-secondary-nav. تستخدم جميعها items وlabel. يمرّر React وVue سمات nav الأصلية، وتضبط مدخلات Angular عنصر nav الداخلي.',
    limitations: ['هذا تنقل بين الصفحات، وليس محرّك توجيه أو متحكّم تبويبات محتوى.'],
  }),
  'portal-layout': localize('portal-layout', {
    summary: 'ابدأ بوابة خدمات بترويسة متجاوبة وتنقل ثانوي ومسار تنقل وحاوية محتوى رئيسي وتذييل مركّبة معًا.',
    usage: layoutPlatformGuides['portal-layout']!.usage,
    apiDescriptions: [
      'الهوية مطلوبة. القيمة الافتراضية للغة ar وللاتجاه rtl بصورة مستقلة. يربط mainId رابط التجاوز بالمحتوى القابل للتركيز؛ يجب أن تكون المعرّفات الصريحة فريدة.',
      'تضبط headerProps التنقل وbrandHref والإجراءات والإشعار وتسميات التنقل والقائمة. تضبط footerProps الروابط وlinksLabel وlegal وخصائص التذييل الأخرى. تسمّي skipLabel رابط التجاوز.',
      'يعرض هذان الإطاران homeHref وlinks وfooterLinks وcopyright وskipLabel وmenuLabel وnavigationLabel وfooterLabel مباشرة. فتحات Vue: ‏logo/actions/footer/default. إسقاط Angular: ‏[nqBrand]/[nqPortalActions]/[nqPortalFooter]/default.',
      'مجموعتان اختياريتان للتنقل ومسار الصفحة. تتجاوز secondaryLabel وbreadcrumbLabel التسميات العربية. تستخدم عناصر المسار label وhref؛ ويقبل React وVue أيضًا current.',
      'ركّب الأصناف المشتركة مع معلم main واحد، وحسّن الترويسة المحددة فقط. يستبدل المعرض المضمّن main بعنصر section لتجنب تداخل معالم الصفحات.',
    ],
    lifecycle: ['اعرض هيكلًا واحدًا حول محتوى التطبيق؛ يوفّر التطبيق عنوان الصفحة والمسارات والبيانات.', 'حسّن ترويسة Vanilla بعد التركيب وحرّرها قبل الاستبدال. يملك كل إطار عناصره وتنظيف أحداثه.', 'حدّث الروابط الحالية ومسار الصفحة والعنوان مع تغيّر المسار. يبقى تركيز الموجّه وdocument.title من مسؤوليات التطبيق.'],
    accessibility: ['هدف تجاوز التنقل قابل للتركيز برمجيًا. احتفظ بمعلم main واحد في المستند.', 'سمِّ التنقل الرئيسي والثانوي ومسار الصفحة والتذييل بأسماء متميزة.', 'للإنجليزية اضبط lang="en" وdir="ltr" وترجم المحتوى والتسميات الميسّرة كلها. يمكن ضبط الاتجاه مستقلًا عن اللغة.'],
    variants: ['ترويسة وتذييل', 'تنقل ثانوي ومسار صفحة', 'عربي RTL أو إنجليزي LTR'],
    frameworkNotes: 'يصدّر React وVue المكوّن PortalLayout. يصدّر Angular المكوّن NqPortalLayoutComponent بمحدّد nq-portal-layout. راجع PORTAL.md في الحزمة وشغّل المثال الأصلي مع ?preview=portal. وفّر mainId ومعرّفات التنقل الصريحة عند تسلسل جذور Angular بصورة مستقلة؛ لا يُدّعى تحقق SSR أو hydration في Angular.',
    limitations: ['حد طي التنقل عند 48rem قرار في نسق. يستخدم الهيكل رموز السمة الدلالية ولا يضيف حركة.', 'لا يتضمن محرّك توجيه أو مصادقة أو حقوقًا لأصول حكومية أو شهادة اعتماد من الهيئة.'],
  }),
  'portal-footer': localize('portal-footer', {
    summary: 'اختم صفحة الخدمة بمعلومات المنصة وروابط مساندة وتفاصيل قانونية أو وسائل تواصل.',
    usage: `<footer class="nq-portal-footer" lang="ar" dir="rtl">
  <strong>نسق</strong><p>وصول واضح إلى خدماتنا الرقمية.</p>
  <nav aria-label="روابط التذييل"><ul><li><a class="nq-link" href="./privacy">الخصوصية</a></li><li><a class="nq-link" href="./accessibility">إمكانية الوصول</a></li></ul></nav>
  <small>تواصل مع الجهة المالكة للخدمة للحصول على دعم الطلبات.</small>
</footer>`,
    apiDescriptions: [
      'هوية وسياق اختياريان؛ تجنّب تكرار قائمة تنقل طويلة أو نموذج الطلب داخل التذييل.',
      'روابط مساندة عادية. استخدم وجهات فعلية بدل روابط سياسات مؤقتة في المنتج المنشور.',
      'تسمّي منطقة التنقل الخصائص linksLabel في React، وnavLabel في Vue، وnavigationLabel في Angular.',
      'يوفّر React الخاصية legal؛ ويوفّر Vue وAngular الخاصية copyright. أضف المحتوى القانوني الآخر عبر المحتوى العادي أو الإسقاط.',
    ],
    lifecycle: ['اعرض التذييل بعد محتوى الصفحة. تستخدم روابطه تنقل المتصفح أو الموجّه المعتاد.', 'حدّث روابط السياسات والدعم من إعدادات المنصة؛ فلا يملك المكوّن حالة اختيار.', 'لا يحتاج محتوى التذييل الثابت إلى تحسين بجافاسكربت أو تنظيف.'],
    accessibility: ['استخدم footer ومنطقة nav مسمّاة، واجعل تسميتها مختلفة عن التنقل الرئيسي.', 'اختر نصوص روابط تصف السياسة أو الوجهة وتظل واضحة في وضع التباين العالي.'],
    variants: ['هوية وروابط', 'معلومات قانونية أو دعم إضافية'],
    frameworkNotes: 'يقبل PortalFooter في React الخصائص brand وdescription وlinks وlinksLabel وlegal. ويقبل Vue الخصائص brand وcopyright وlinks وnavLabel مع محتوى الفتحة الافتراضية. يوفّر nq-portal-footer في Angular الخصائص brand وlinks وnavigationLabel وcopyright.',
  }),
  feedback: localize('feedback', {
    summary: 'اجمع اختيارًا صريحًا حول فائدة الصفحة، واربطه بمسار الملاحظات الذي يديره التطبيق.',
    usage: `<div class="nq-feedback" data-nq="feedback" role="group" aria-label="هل كانت هذه الصفحة مفيدة؟" lang="ar" dir="rtl">
  <p>هل كانت هذه الصفحة مفيدة؟</p>
  <div class="nq-inline"><button class="nq-button" type="button" data-nq-value="yes" aria-pressed="false">نعم</button><button class="nq-button" type="button" data-nq-value="no" aria-pressed="false">لا</button></div>
  <input type="hidden" data-nq-feedback-value name="helpful">
  <span data-nq-feedback-status role="status"></span>
</div>`,
    apiDescriptions: [
      'الخيارات: value وonValueChange(value) وgetStatusMessage(value). يوفّر المتحكّم الناتج value وselect(value) وdestroy().',
      'قيم ثابتة للأزرار، وعادةً yes وno. يحصل الزر المحدّد على aria-pressed="true" وتنتقل قيمته إلى الحقل المخفي الاختياري.',
      'حدث يتصاعد عند تغيّر الاختيار. لا يصدر اختيار القيمة نفسها مرة أخرى حدثًا جديدًا لتغيير القيمة.',
      'يمنع تغيير الاختيار؛ ويُحترم أيضًا disabled الأصلي في كل زر.',
    ],
    lifecycle: ['استدعِ enhance() بعد تركيب HTML الخاص بوصفة Vanilla، أو أنشئ متحكّم createFeedback() تديره مباشرة.', 'يحدّث الاختيار حالة الأزرار والحقل المخفي ورسالة الحالة الهادئة. وتعيد إعادة ضبط النموذج الاختيار الأولي.', 'قبل استبدال العناصر، حرّر enhance() أو استدعِ controller.destroy()؛ فتُستعاد السمات الأصلية وقيمة الحقل ورسالة الحالة.', 'أرسل الملاحظات إلى خادم التطبيق في دالة الاستدعاء. ظهور الشكر وحده لا يعني أن الخادم حفظ البيانات.'],
    accessibility: ['ضع سؤالًا مرئيًا واسمًا ميسّرًا لمجموعة الاختيارات، واستخدم أزرارًا حقيقية أو عناصر اختيار مفرد أصلية.', 'اعرض رسالة التأكيد في منطقة حالة هادئة وترجم نصها.'],
    variants: ['اختيار نعم أو لا في Vanilla', 'اختيار وتعليق في React أو Vue', 'اختيار منطقي في Angular'],
    frameworkNotes: 'تختلف الواجهات: قيمة Feedback في React هي {helpful:"yes"|"no"|"",comment:string} مع onValueChange وonFeedback. قيمة v-model في Vue نص، ويصدر submit كائنًا {value,comment}. أما [(value)] في Angular فهي boolean|null، ويصدر valueChange؛ ولا يتضمن المكوّن الأساسي حقل تعليق.',
    limitations: ['لا يتضمن المكوّن إرسالًا شبكيًا أو تحليلات أو مراجعة للمحتوى. تأكيد الإرسال في React وVue حالة محلية للواجهة.'],
  }),
  'cookie-consent': localize('cookie-consent', {
    summary: 'اعرض قبولًا أو رفضًا صريحًا لملفات الارتباط الاختيارية، ومرّر القرار إلى آلية الخصوصية التي يديرها التطبيق.',
    usage: `<section class="nq-cookie-consent" data-nq="cookie-consent" aria-labelledby="cookie-title" lang="ar" dir="rtl">
  <h2 id="cookie-title">تفضيلات ملفات الارتباط</h2><p>اختر السماح بالتحليلات الاختيارية أو رفضها.</p>
  <a class="nq-link" href="./privacy">قراءة سياسة ملفات الارتباط</a>
  <div class="nq-button-group"><button class="nq-button" type="button" data-nq-consent="accepted">قبول الملفات الاختيارية</button><button class="nq-button" type="button" data-nq-consent="rejected">رفض الملفات الاختيارية</button></div>
</section>`,
    apiDescriptions: [
      'الخيارات: storageKey الاختياري وonValueChange(choice). يوفّر المتحكّم value وchoose(choice) وdestroy().',
      'يخفي الاختيار الصحيح اللوحة ويصدر الحدث المتصاعد nq:change مع {value: choice}.',
      'خيار في متحكّم Vanilla المباشر لتفعيل الحفظ في localStorage. بدونه لا يُحفظ الاختيار، ولا يمنع تعذّر التخزين المستخدم من الاختيار.',
      'يثبّت اللوحة أسفل مساحة العرض. تحقّق من أنها لا تغطي الإجراءات المهمة أو العناصر المركّز عليها.',
    ],
    lifecycle: ['اعرض اللوحة قبل بدء التتبع الاختياري. يبدأ تحسين Vanilla من دون حفظ؛ ويمكن تفعيل storageKey عند إنشاء المتحكّم مباشرة.', 'يبلّغ القبول أو الرفض بالقرار ويخفي الواجهة. اربط الحدث بتحميل السكربتات وحفظ التفضيلات اللذين يديرهما التطبيق.', 'وفّر إجراءً دائمًا باسم «تفضيلات ملفات الارتباط» للعودة إلى القرار؛ فالمتحكّم الأساسي لا يوفّر مركز تفضيلات كاملًا.', 'تزيل destroy() المستمعين وتستعيد سمة hidden الأولية. ولا تمحو موافقة التطبيق المحفوظة.'],
    accessibility: ['اجعل كلا الخيارين واضحًا ومسمّى وقابلًا للوصول بلوحة المفاتيح.', 'استخدم قسمًا أو منطقة مسمّاة. اللوحة غير حوارية ولا تحصر التركيز داخلها.'],
    variants: ['لوحة ضمن الصفحة', 'شريط ثابت'],
    frameworkNotes: 'يستخدم React القيمة accepted|rejected|null مع onValueChange. يتحكم Vue في open عبر v-model:open ويصدر accept وreject وpreferences. يتحكم Angular في visible وvisibleChange ويصدر consent وpreferences. لا تحفظ مكوّنات الأطر التفضيلات تلقائيًا.',
    limitations: ['هذه واجهة لاختيار التفضيلات، وليست منصة لإدارة الموافقات أو ضمانًا للامتثال القانوني. يظل حجب السكربتات وتسجيل إصدارات السياسة وسحب الموافقة من مسؤوليات التطبيق.'],
  }),
  'notification-list': localize('notification-list', {
    summary: 'اعرض إشعارات التطبيق مع تمييز حالة عدم القراءة والوجهات والإجراءات الاختيارية.',
    usage: `<section class="nq-notification-list" aria-labelledby="notifications-title" lang="ar" dir="rtl">
  <h2 id="notifications-title">الإشعارات</h2><ul>
    <li data-state="unread"><h3><a class="nq-link" href="./requests/NQ-1043">رخصتك جاهزة</a></h3><span class="nq-badge" data-tone="info">غير مقروء</span><p>اطّلع على المستند الصادر ونزّله.</p><time datetime="2026-10-28T09:00:00+03:00">28 أكتوبر، 09:00</time></li>
    <li data-state="read"><h3>تم استلام المستند</h3><p>أُضيف المستند المرفق إلى طلبك.</p></li>
  </ul>
</section>`,
    apiDescriptions: [
      'يستخدم React وVue الحقل read؛ ويستخدم Angular الحقل unread. وفّر عنوانًا ووصفًا اختياريًا ووجهة فعلية عندما يكون التنقل متاحًا.',
      'سمِّ المجموعة واشرح حالتها الفارغة من دون الإيحاء بحدوث خطأ في التحميل.',
      'يقبل تنسيق Vanilla أيضًا data-unread="true" أو data-read="false". أضف نصًا يدل على أن الإشعار غير مقروء.',
      'يحدّث التطبيق مجموعة العناصر بعد الإجراء. لا تزامن القائمة نفسها مع خدمة إشعارات.',
    ],
    lifecycle: ['اعرض مجموعة الإشعارات مستخدمًا معرّفات ثابتة عبر التحديثات.', 'اجلب البيانات أو اشترك في مصدرها خارج المكوّن، وطبّق القراءة أو الحذف على حالة التطبيق.', 'حافظ على التركيز عند إزالة عنصر. ألغِ الاستقصاء الدوري أو اتصالات المقابس التي أنشأها التطبيق عند إنهاء العرض؛ فلا تملك هذه القائمة الثابتة متحكّم تحسين في Vanilla.'],
    accessibility: ['وضّح عدم القراءة بالنص إلى جانب لون الخلفية.', 'استخدم time مع datetime قابل للمعالجة عند معرفة الوقت الفعلي، وترجم النص الظاهر للمستخدم.', 'تجنّب جعل صندوق إشعارات يتغيّر باستمرار منطقة إعلان عاجلة؛ وأعلن وصول الإشعارات المهمة بصورة منفصلة.'],
    variants: ['عناصر مقروءة وغير مقروءة', 'حالة فارغة', 'إجراءات يملكها التطبيق'],
    frameworkNotes: 'تستخدم عناصر React الحقول dateTime وdateLabel وread مع onMarkRead(id). ويستخدم Vue الحقول date وdateLabel وread مع الحدثين read(id) وdismiss(id). وتستخدم عناصر Angular الحقلين time وunread؛ ويطلب الحدث dismissed من المكوّن الأب إزالة العنصر.',
    limitations: ['لا يوفّر المكوّن خدمة دفع إشعارات أو حفظ عدد غير المقروء أو اشتراكًا في الخلفية.'],
  }),
  container: localize('container', {
    summary: 'وسّط محتوى الصفحة ضمن عرض أقصى مريح للقراءة، مع هوامش جانبية منتظمة.',
    usage: `<div class="nq-container" lang="ar" dir="rtl" style="--nq-layout-max-width:72rem; --nq-layout-padding:var(--nq-space-4)">
  <h2>دليل الخدمات</h2><p>يبقى المحتوى في المنتصف عند اتساع الشاشة.</p>
</div>`,
    apiDescriptions: ['القيمة الافتراضية هي رمز الحد الأقصى للمحتوى، أي 78rem. يترك العرض الافتراضي أيضًا هامشًا مقداره 1.5rem على كل جانب.', 'التباعد الداخلي. تبدأ الدرجات المتجاوبة عند 40rem و48rem و64rem و80rem؛ وترث الدرجة غير المحددة أقرب قيمة أصغر.', 'يستخدم كامل العرض المتاح من دون الهوامش الخارجية الافتراضية.'],
    lifecycle: ['تحسب CSS العرض المتمركز عند التركيب وعند تغيّر المساحة المتاحة.', 'حدّث maxWidth أو padding عبر خصائص الإطار أو متغيّرات CSS؛ فلا حاجة إلى قياس تغيير الحجم.', noLayoutController],
    accessibility: ['لا تمنح الحاوية دور معلم للصفحة. ضع داخلها عناصر header وmain وsection والعناوين المناسبة.', 'اختبر التكبير والمحتوى العربي الطويل؛ فالحد الأقصى للعرض لا يعالج تجاوز المحتوى داخل عنصر فرعي.'],
    variants: ['عرض مقيّد', 'عرض ممتد'], frameworkNotes: layoutFrameworks,
  }),
  stack: localize('stack', {
    summary: 'رتّب الحقول أو البطاقات أو المحتوى رأسيًا، بمسافات منتظمة بين العناصر المباشرة.',
    usage: `<div class="nq-stack" lang="ar" dir="rtl" style="--nq-layout-gap:var(--nq-space-3); --nq-layout-gap-md:var(--nq-space-5)">
  <h2>مراجعة الطلب</h2><p>تحقّق من المعلومات قبل الإرسال.</p><button class="nq-button" type="button">متابعة</button>
</div>`,
    apiDescriptions: ['المسافة بين العناصر؛ تستخدم القيم الرقمية رموز تباعد بخطوة ربع rem. أضف اللاحقة -sm أو -md أو -lg أو -xl إلى متغيّر CSS للتجاوب.', 'التباعد الداخلي. تبدأ الدرجات المتجاوبة عند 40rem و48rem و64rem و80rem؛ وترث الدرجة غير المحددة أقرب قيمة أصغر.', 'المحاذاة على المحور العرضي؛ والقيمة الافتراضية stretch. التخطيط عمود مرن لا تلتف عناصره.', 'يوزّع العناصر رأسيًا عند وجود ارتفاع إضافي. يحوّل المساعد between وaround وevenly إلى قيم CSS من عائلة space-*.'],
    lifecycle: ['تشكّل العناصر المباشرة عمودًا مرنًا حسب ترتيبها في المستند.', 'تعيد إضافة العناصر أو إزالتها حساب الفجوات تلقائيًا؛ تجنّب هوامش العناصر التي تضاعف التباعد المقصود.', noLayoutController],
    accessibility: ['اجعل ترتيب المستند مطابقًا لترتيب القراءة والتركيز بلوحة المفاتيح.', 'استخدم ol أو ul مع الصنف عندما يكون المحتوى قائمة؛ أما مكوّن Stack في React نفسه فيعرض div.'],
    variants: ['محاذاة للبداية أو الوسط أو النهاية أو التمدد', 'فجوة وحشو متجاوبان'], frameworkNotes: layoutFrameworks,
  }),
  inline: localize('inline', {
    summary: 'اجمع الإجراءات أو المعلومات القصيرة في صف مرن يلتف طبيعيًا عندما تضيق المساحة.',
    usage: `<div class="nq-inline" lang="ar" dir="rtl" style="--nq-layout-gap:var(--nq-space-3); --nq-layout-justify:space-between">
  <span>حُفظت المسودة</span><div class="nq-inline"><button class="nq-button" type="button">رجوع</button><button class="nq-button" type="button">متابعة</button></div>
</div>`,
    apiDescriptions: ['المسافة بين العناصر؛ تستخدم القيم الرقمية رموز تباعد بخطوة ربع rem. أضف -sm أو -md أو -lg أو -xl إلى متغيّر CSS للتجاوب.', 'يلتف الصف افتراضيًا. استخدم nowrap فقط عندما تتسع المساحة لكل المحتوى أو عند وجود معالجة مقصودة لتجاوزه.', 'القيمة الافتراضية لـ align هي center، ولـ justify هي start. يبدأ الصف من اليمين المنطقي في وضع RTL.'],
    lifecycle: ['يضع التخطيط المرن العناصر بحسب ترتيب المستند، ويلفّها عند تغيّر العرض المتاح.', 'غيّر المحاذاة أو التباعد عبر الخصائص أو المتغيّرات. لكل Inline متداخل قيمه الافتراضية الخاصة.', noLayoutController],
    accessibility: ['لا تعكس ترتيب الإجراءات المهمة بصريًا بما يخالف ترتيب لوحة المفاتيح.', 'استخدم ButtonGroup عندما تحتاج مجموعة الأزرار إلى اسم ميسّر؛ فلا يضيف Inline وحده دورًا أو اسمًا.'],
    variants: ['التفاف افتراضي', 'دون التفاف', 'توزيع المساحة بين العناصر'], frameworkNotes: layoutFrameworks,
  }),
  grid: localize('grid', {
    summary: 'رتّب بطاقات أو حقولًا متساوية العرض في أعمدة متجاوبة، باستخدام نقاط توقف صريحة أو حد أدنى متكيّف لعرض العنصر.',
    usage: `<div class="nq-grid" lang="ar" dir="rtl" style="--nq-layout-columns:1; --nq-layout-columns-sm:2; --nq-layout-columns-lg:3; --nq-layout-gap:var(--nq-space-4)">
  <article class="nq-card"><div class="nq-card-body">الخدمة الأولى</div></article>
  <article class="nq-card"><div class="nq-card-body">الخدمة الثانية</div></article>
  <article class="nq-card"><div class="nq-card-body">الخدمة الثالثة</div></article>
</div>`,
    apiDescriptions: ['القيمة الافتراضية عمود واحد. مثال الخصائص: {base:1, sm:2, lg:3}؛ وتبدأ sm وmd وlg وxl عند 40 و48 و64 و80rem.', 'يضبط المساعد الأعمدة أيضًا على auto-fit. في CSS المباشر اضبط المتغيّرين --nq-layout-columns:auto-fit و--nq-layout-min-item:16rem.', 'المسافة بين العناصر؛ تستخدم القيم الرقمية رموز تباعد بخطوة ربع rem، وتدعم المتغيّرات لواحق نقاط التوقف.', 'التباعد الداخلي. تبدأ الدرجات المتجاوبة عند 40rem و48rem و64rem و80rem؛ وترث الدرجة غير المحددة أقرب قيمة أصغر.'],
    lifecycle: ['تحسب CSS Grid الأعمدة وعروض العناصر من دون قراءة عرض الشاشة بجافاسكربت.', 'تتبع الأعمدة الصريحة نقاط توقف مساحة العرض. ويتجاوب minItemWidth مع العرض المتاح فعليًا داخل الحاوية.', 'عند تحديث ناتج layoutStyles() يدويًا، أزل المتغيّرات السابقة قبل تطبيق الكائن الجديد حتى لا تبقى الخيارات المحذوفة.', noLayoutController],
    accessibility: ['الشبكة البصرية لا تستدعي role="grid". استخدم دلالات المستند أو القائمة العادية للبطاقات.', 'حافظ على ترتيب منطقي للعناصر، واختبر المساحات الضيقة والتكبير والمحتوى الطويل غير القابل للكسر.'],
    variants: ['عدد أعمدة متجاوب', 'أعمدة متكيّفة عبر auto-fit'], frameworkNotes: layoutFrameworks,
    limitations: ['تأخذ minItemWidth الأولوية على columns؛ اختر أسلوبًا واحدًا. خصائص نقاط التوقف تعتمد مساحة العرض، وليست استعلامات حاويات.'],
  }),
  columns: localize('columns', {
    summary: 'استخدم عقد CSS Grid المتجاوب نفسه لبنية تعبّر عن المحتوى بوضوح بوصفه أعمدة.',
    usage: `<div class="nq-columns" lang="ar" dir="rtl" style="--nq-layout-columns:1; --nq-layout-columns-md:2; --nq-layout-gap:var(--nq-space-6)">
  <section aria-labelledby="contact-title"><h2 id="contact-title">بيانات التواصل</h2><p>ضع معلومات التواصل هنا.</p></section>
  <section aria-labelledby="address-title"><h2 id="address-title">العنوان</h2><p>ضع معلومات العنوان هنا.</p></section>
</div>`,
    apiDescriptions: ['حدّد عدد الأعمدة المتساوية العرض. ترث درجة التجاوب غير المحددة أقرب عدد محدد عند عرض أصغر.', 'يفعّل auto-fit المتكيّف بدل عدد الأعمدة الصريح، وهو متاح كما في Grid.', 'المسافة بين العناصر؛ تستخدم القيم الرقمية رموز تباعد بخطوة ربع rem، وتدعم المتغيّرات لواحق نقاط التوقف.', 'التباعد الداخلي. تبدأ الدرجات المتجاوبة عند 40rem و48rem و64rem و80rem؛ وترث الدرجة غير المحددة أقرب قيمة أصغر.'],
    lifecycle: ['تبقى الأقسام بترتيبها الأصلي بينما تغيّر CSS عدد أعمدتها.', 'حدّث columns أو gap عبر عقد التنسيق في الإطار؛ وتبقى العناصر نفسها في العرض الخادمي وعرض المتصفح.', noLayoutController],
    accessibility: ['اجمع الحقول أو المحتوى المرتبط دلاليًا؛ فترتيب الأعمدة مجرد مظهر بصري.', 'تأكد من منطقية ترتيب المحتوى المكدّس على الهاتف قبل اختيار مواضعه المكتبية.'],
    variants: ['أعمدة متساوية ومتجاوبة', 'أعمدة متكيّفة'], frameworkNotes: layoutFrameworks,
    limitations: ['لا توجد واجهة مستقلة لتعريف مسارات أعمدة بكسور متفاوتة. استخدم Sidebar لعمود سياقي ضيق، أو CSS Grid يملكه التطبيق لقالب أعمدة مخصّص.'],
  }),
  sidebar: localize('sidebar', {
    summary: 'ضع تنقلًا سياقيًا أو إرشادات بجانب المحتوى الرئيسي، مع ترتيب رأسي واضح عند صغر العرض.',
    usage: `<div class="nq-sidebar" data-side="end" data-collapse-at="lg" lang="ar" dir="rtl" style="--nq-layout-sidebar-width:20rem; --nq-layout-gap:var(--nq-space-6)">
  <aside aria-label="إرشادات الطلب"><h2>قبل أن تبدأ</h2><p>جهّز مرجع الرخصة.</p></aside>
  <section aria-labelledby="application-title"><h2 id="application-title">طلبك</h2><p>ضع المحتوى الرئيسي هنا.</p></section>
</div>`,
    apiDescriptions: ['موضع العنصر الأول المنطقي عند العرض الواسع؛ ويغيّر RTL الجانب الفعلي الذي تقابله البداية أو النهاية.', 'القيمة الافتراضية 18rem، وبحد أقصى 40٪ من العرض المتاح.', 'يبدأ التخطيط بعمودين عند 40rem أو 48rem افتراضيًا أو 64rem. وتترتب العناصر رأسيًا دون ذلك.', 'المسافة بين العناصر؛ تستخدم القيم الرقمية رموز تباعد بخطوة ربع rem، وتدعم المتغيّرات لواحق نقاط التوقف.'],
    lifecycle: ['وفّر عنصرين مباشرين بالضبط: الشريط الجانبي أولًا، ثم المحتوى الرئيسي.', 'تنقل CSS العنصر الأول إلى النهاية المنطقية عند طلب ذلك. ودون collapseAt يعود العنصران إلى ترتيب المستند الأصلي.', 'الترتيب الرأسي لا يخفي التنقل ولا يحوّله إلى درج؛ أضف عنصر إظهار وإخفاء صريحًا إذا احتجت هذا السلوك.', noLayoutController],
    accessibility: ['سمِّ aside أو منطقة التنقل عند الحاجة، واختر ترتيبًا منطقيًا للمصدر قبل إعادة الترتيب البصري.', 'يتبع التركيز بلوحة المفاتيح ترتيب المستند حتى عندما يغيّر side=end الموضع على الحاسوب.'],
    variants: ['عند البداية أو النهاية', 'طيّ عند sm أو md أو lg'],
    frameworkNotes: 'يستخدم Sidebar في React وVue عنصرين مباشرين. ويسقط nq-sidebar في Angular العنصر السياقي عبر [nqSidebar]، ثم يعرض المحتوى المتبقي بجانبه. تشترك الأطر في side وcollapseAt وsidebarWidth.',
  }),
  center: localize('center', {
    summary: 'وسّط محتوى موجزًا داخل المساحة المتاحة، باستخدام عمود مرن ونص محاذى إلى الوسط.',
    usage: `<div class="nq-center" lang="ar" dir="rtl" style="min-block-size:16rem; --nq-layout-gap:var(--nq-space-3)">
  <h2>لا توجد طلبات بعد</h2><p>ستظهر الطلبات المقدّمة هنا.</p><a class="nq-button" href="./services">استكشف الخدمات</a>
</div>`,
    apiDescriptions: ['المسافة بين العناصر؛ تستخدم القيم الرقمية رموز تباعد بخطوة ربع rem، وتدعم المتغيّرات لواحق نقاط التوقف.', 'التباعد الداخلي. تبدأ الدرجات المتجاوبة عند 40rem و48rem و64rem و80rem؛ وترث الدرجة غير المحددة أقرب قيمة أصغر.', 'القيمة الافتراضية لكليهما center. لا يظهر أثر التوسيط الرأسي إلا عندما يكون للحاوية ارتفاع إضافي.', 'يحدّد التطبيق الارتفاع المتاح؛ ولا يفرض Center حاوية بارتفاع الشاشة.'],
    lifecycle: ['تحاذي CSS المحتوى عند تركيبه وتعيد الحساب عندما تتغيّر أبعاده.', 'اسمح للحاوية بالنمو مع الترجمات وتكبير النص، وتجنّب الارتفاع الثابت الذي يقص المحتوى.', noLayoutController],
    accessibility: ['أبقِ عنوانًا واضحًا وإجراءً حقيقيًا داخل حالات الفراغ أو النجاح المتمركزة.', 'حاذِ الفقرات الطويلة إلى البداية عندما تصبح قراءتها صعبة وهي متمركزة.'],
    variants: ['توسيط على المحورين', 'ارتفاع أدنى يحدّده التطبيق'], frameworkNotes: layoutFrameworks,
  }),
  spacer: localize('spacer', {
    summary: 'اشغل المساحة المتبقية داخل صف أو عمود مرن لفصل المجموعات، من دون إضافة محتوى مرئي أو دلالي.',
    usage: `<div class="nq-inline" lang="ar" dir="rtl">
  <span>مسودة الطلب</span><div class="nq-spacer" aria-hidden="true"></div><button class="nq-button" type="button">حفظ المسودة</button>
</div>`,
    apiDescriptions: ['يتمدّد الفاصل في المساحة المتبقية داخل التخطيط المرن. يفيد داخل Inline أو Stack ولا يحل محل أعمدة الشبكة.', 'حد أدنى اختياري للعرض والارتفاع المنطقيين. قيمته الافتراضية صفر في Spacer.', 'أخفِ العنصر الزخرفي الفارغ عن التقنيات المساعدة؛ ويضيف Angular هذه السمة تلقائيًا.'],
    lifecycle: ['يوزّع الأب المرن المساحة المتبقية على الفاصل.', 'يمكن أن ينكمش الفاصل عندما تنفد المساحة؛ استخدم الحد الأدنى الاختياري فقط عندما لا يسبب تجاوزًا.', noLayoutController],
    accessibility: ['اترك Spacer فارغًا وغير قابل للتركيز.', 'لا تستخدم معلمًا فارغًا ذا تسمية أو مسافات نصية متكررة لتحقيق التأثير نفسه.'],
    variants: ['مساحة مرنة فقط', 'حد أدنى للتباعد'], frameworkNotes: layoutFrameworks,
  }),
  'aspect-ratio': localize('aspect-ratio', {
    summary: 'احجز مساحة متوقعة للوسائط قبل تحميلها، وحدّد عرض الصورة أو الفيديو كاملًا أو قصّهما لملء المساحة.',
    usage: `<figure lang="ar" dir="rtl"><div class="nq-aspect-ratio" data-fit="contain" style="--nq-layout-ratio:1.333333333">
  <img src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20600%22%3E%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23e1f2ed%22%2F%3E%3Cpath%20d%3D%22M0%20450L800%20150M200%200L600%20600%22%20stroke%3D%22%23b3d7cc%22%20stroke-width%3D%2250%22%2F%3E%3Cpath%20d%3D%22M200%20400L400%20300L600%20200%22%20fill%3D%22none%22%20stroke%3D%22%23006c67%22%20stroke-width%3D%228%22%20stroke-dasharray%3D%2212%2012%22%2F%3E%3Cg%20fill%3D%22%23006c67%22%20stroke%3D%22white%22%20stroke-width%3D%228%22%3E%3Ccircle%20cx%3D%22200%22%20cy%3D%22400%22%20r%3D%2224%22%2F%3E%3Ccircle%20cx%3D%22400%22%20cy%3D%22300%22%20r%3D%2224%22%2F%3E%3Ccircle%20cx%3D%22600%22%20cy%3D%22200%22%20r%3D%2224%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E" alt="رسم توضيحي لمواقع ثلاثة مراكز خدمة" width="800" height="600">
</div><figcaption>خريطة توضيحية لمراكز الخدمة</figcaption></figure>`,
    apiDescriptions: ['القيمة الافتراضية 16/9. استخدم 1 للمربع أو 4/3 للمستطيل؛ ويرفض المساعد الصفر والقيم السالبة وغير المحدودة.', 'يحافظ contain على كامل الصورة أو الفيديو. ويملأ cover المساحة المحجوزة وقد يقص الأطراف.', 'تملأ هذه العناصر الغلاف؛ ووفّر لها أسماءها الميسّرة وعناصر التحكم المطلوبة.'],
    lifecycle: ['تحجز نسبة الأبعاد في CSS الارتفاع فورًا بناءً على العرض المتاح.', 'يبقى تحميل الوسائط وتشغيلها من سلوك المتصفح الأصلي؛ ولا ينفّذ التخطيط تحميلًا مسبقًا أو إيقافًا مؤقتًا أو إنهاءً للوسائط.', 'عند إزالة الوسائط، أوقف بصورة منفصلة التشغيل أو البث أو أعمال canvas التي أنشأها التطبيق.'],
    accessibility: ['اكتب نصًا بديلًا مفيدًا للصورة ووفّر تسميات توضيحية للفيديو؛ فلا يوفّر غلاف نسبة الأبعاد أيًا منهما.', 'امنح iframe عنوانًا وصفيًا، وتجنّب قص نص أو أدوات تحكم مهمة.'],
    variants: ['نسبة 16:9 افتراضية', 'مربع أو نسبة مخصّصة', 'ملء مع قصّ أو احتواء كامل'], frameworkNotes: layoutFrameworks,
    limitations: ['يستخدم المثال رسمًا توضيحيًا مضمّنًا. استبدله بصورة يستضيفها تطبيقك عند دمجه.'],
  }),
  section: localize('section', {
    summary: 'أنشئ قسمًا ذا معنى في المستند، بحشو داخلي منتظم ولون سطح اختياري.',
    usage: `<section class="nq-section" data-tone="muted" aria-labelledby="requirements-title" lang="ar" dir="rtl" style="--nq-layout-padding:var(--nq-space-4); --nq-layout-padding-lg:var(--nq-space-8)">
  <h2 id="requirements-title">المتطلبات</h2><p>جهّز مستنداتك قبل البدء.</p>
</section>`,
    apiDescriptions: ['التباعد الداخلي. تبدأ الدرجات المتجاوبة عند 40rem و48rem و64rem و80rem؛ وترث الدرجة غير المحددة أقرب قيمة أصغر.', 'يستخدم muted السطح الهادئ؛ ويستخدم brand سطح اللون الأساسي الخفيف مع لون النص المتوافق معه.', 'وفّر عنوانًا ذا معنى؛ واستخدم aria-labelledby إذا كان القسم يحتاج إلى معلم مسمّى.'],
    lifecycle: ['اعرض قسمًا دلاليًا؛ وحشوه الافتراضي يساوي رمز التباعد 6.', 'حدّث اللون أو الحشو المتجاوب من دون تغيير بنية المستند.', noLayoutController],
    accessibility: ['اختر مستوى العنوان بحسب تسلسل المستند، وليس حجمه البصري.', 'لا تنشئ مناطق مسمّاة كثيرة من دون حاجة؛ واستخدم div للتجميع الزخرفي فقط.'],
    variants: ['سطح افتراضي', 'سطح هادئ', 'لون الهوية'],
    frameworkNotes: 'يعرض Section في React عنصر section ويقبل سماته الأصلية مع خصائص التخطيط. يمكن تغيير وسم Section في Vue عبر as. ويوفّر nq-section في Angular المدخل label لضبط aria-label إلى جانب مدخلات التخطيط.',
  }),
  'app-shell': localize('app-shell', {
    summary: 'ركّب الإطار المستمر للصفحة حول محتواها الرئيسي: ترويسة وشريطًا جانبيًا سياقيًا اختياريًا وتذييلًا.',
    usage: `<a class="nq-skip-link" href="#main-content">انتقل إلى المحتوى</a>
<div class="nq-app-shell" lang="ar" dir="rtl">
  <header class="nq-app-shell-header"><a href="./">نسق</a></header>
  <aside class="nq-app-shell-sidebar" aria-label="تنقل مساحة العمل"><nav aria-label="مساحة العمل"><a href="./requests">الطلبات</a></nav></aside>
  <main class="nq-app-shell-main" id="main-content" tabindex="-1"><h1>طلباتي</h1><p>محتوى مساحة العمل.</p></main>
  <footer class="nq-app-shell-footer">دعم الخدمات</footer>
</div>`,
    apiDescriptions: ['تُربط المعالم المباشرة بمناطق CSS Grid. ويمكن استخدام غلاف .nq-app-shell-body أيضًا.', 'القيمة الافتراضية 18rem. يحدّه تخطيط الحاسوب بنسبة 30٪ ويعرض العمود الجانبي بدءًا من 64rem.', 'يضع الشريط الجانبي عند حافة منطقية في التخطيط المكتبي.', 'يربط رابط التجاوز الداخلي بعنصر main. يوفّر Angular المدخل mainId؛ وأضف رابط التجاوز على مستوى التطبيق عند استخدام Vue أو Angular.'],
    lifecycle: ['ركّب الإطار المستمر مرة واحدة حول محتوى المسارات؛ وتوفّر CSS ارتفاعًا منطقيًا أدنى يساوي 100dvh.', 'تترتب الترويسة والشريط الجانبي والمحتوى والتذييل رأسيًا عند ضيق العرض. يظهر العمود الجانبي في العرض المكتبي، ويملأ المحتوى العرض عند غيابه في البنى التي تدعم حذفه.', 'حدّث محتوى main وأدر التركيز عبر الموجّه عند تغيير المسار، من دون استبدال التنقل المستمر بلا داعٍ.', noLayoutController],
    accessibility: ['اعرض معلم main واحدًا في المستند واربط به رابطًا يعمل لتجاوز التنقل.', 'لا تضع هيكل التطبيق داخل main موجود؛ فهو ينشئ واحدًا بالفعل.', 'حافظ على تسميات واضحة للتنقل وترتيب منطقي للمصدر في اتجاهَي RTL وLTR.'],
    variants: ['مع شريط جانبي سياقي', 'دون شريط جانبي في React أو Vue أو HTML الاختياري', 'شريط جانبي عند النهاية المنطقية'],
    frameworkNotes: 'يستخدم AppShell في React عقد header وsidebar وfooter ويعرض رابط تجاوز وعنصر main. يستخدم Vue فتحات header وsidebar وfooter والفتحة الافتراضية. ويستخدم Angular الإسقاط [nqShellHeader] و[nqShellSidebar] و[nqShellFooter] وينشئ مناطق المعالم الأربع، بما فيها الشريط الجانبي حتى عندما يكون فارغًا.',
    limitations: ['لا ينفّذ AppShell التوجيه أو درج التنقل على الهاتف. نقطة توقف الشريط الجانبي ثابتة عند 64rem؛ استخدم Sidebar عندما تحتاج إلى ضبط حد الطيّ بصورة مستقلة.'],
  }),
  'page-header': localize('page-header', {
    summary: 'امنح الصفحة عنوانًا واضحًا ووصفًا موجزًا ومسار تنقل سياقيًا ومجموعة إجراءات قابلة للالتفاف.',
    usage: `<header class="nq-page-header" lang="ar" dir="rtl">
  <nav class="nq-breadcrumb" aria-label="مسار التنقل"><a href="./">الرئيسية</a><span aria-current="page">الطلبات</span></nav>
  <div class="nq-page-header-main"><div class="nq-page-header-content"><h1>طلباتي</h1><p>راجع الطلبات المقدمة وأكمل المسودات المحفوظة.</p></div>
    <div class="nq-page-header-actions"><a class="nq-button" href="./services">بدء طلب</a></div>
  </div>
</header>`,
    apiDescriptions: ['عنوان مطلوب ووصف اختياري. يعرض React وAngular عنوان h1؛ ويتيح Vue اختيار مستوى من 1 إلى 6 عبر level.', 'سياق اختياري بعرض الصف الكامل. وفّر تنقلًا دلاليًا لمسار الصفحة.', 'مجموعة ملتفة من إجراءات الصفحة؛ وتجنّب العروض الثابتة عند ترجمة التسميات.', 'المسافة بين العناصر؛ تستخدم القيم الرقمية رموز تباعد بخطوة ربع rem، وتدعم المتغيّرات لواحق نقاط التوقف.'],
    lifecycle: ['اعرض العنوان وإتاحة الإجراءات من المسار الحالي.', 'حدّث العنوان والإجراءات معًا بعد التنقل. يبقى تركيز الموجّه وdocument.title من مسؤوليات التطبيق.', 'تلتف الإجراءات عند تغيّر العرض، ولا يملك التخطيط مستمعين للأحداث أو خطوة إنهاء.'],
    accessibility: ['يفضّل وجود h1 واحد على مستوى الصفحة. استخدم عنوانًا أدنى داخل تركيب مضمّن عندما يدعمه الإطار، أو اكتب HTML مباشرة.', 'اجعل الإجراء الأساسي خاصًا بالصفحة واحتفظ بتسميته المرئية.', 'إذا وُجدت ترويسة ثابتة، امنح العناوين المستهدفة بالروابط أو التركيز هامش تمرير كافيًا.'],
    variants: ['عنوان فقط', 'وصف وإجراءات', 'صف لمسار التنقل'],
    frameworkNotes: 'يقبل PageHeader في React عقد title وdescription وbreadcrumb وactions. يقبل Vue الخصائص title وdescription وlevel مع فتحتي breadcrumb وactions. ويقبل nq-page-header في Angular الخاصيتين title وdescription، مع إسقاط [nqBreadcrumb] والمحتوى الافتراضي للإجراءات. يوفّر React حاليًا سمات header الأصلية بدل واجهة LayoutProps الكاملة؛ واضبط تباعده بمتغيّرات CSS عبر style.',
  }),
};
