---
source:
  summary: 03477a67db00
  example: 9333da3b8e2e
  variants-and-states: 8bf9b93586c3
  api: ccc60f9540f8
  accessibility: 26536fefd08d
  rtl-and-localisation: 14dc154c5a09
  platforms-code-reference: c38574c795ad
---
# هيكل البوابة

هيكل البوابة هو هيكل الصفحة في البوابة: ترويسة فيها رابط التخطي والتنقل الرئيسي، وتنقل ثانوي ومسار تنقل اختياريان، وحاوية رئيسية قابلة للتركيز لمحتوى الصفحة، وتذييل. ويوفّر التطبيق كل نص وكل وجهة ومحتوى الصفحة.

## مثال

يقود رابط التخطي إلى الحاوية الرئيسية، فيصل القارئ الذي يستخدم لوحة المفاتيح إلى محتوى الصفحة دون المرور بالتنقل. وتُمرَّر العلامة والتنقل وروابط التذييل بياناتٍ، ويوضع محتوى الصفحة داخل الهيكل.

```html live example=basic differences=portal-layout-adapter-markup,portal-layout-footer-brand-tree frame
<div class="hw-portal-layout">
  <header class="hw-portal-header" data-hw="portal-header">
    <a class="hw-skip-link" href="#main-content">الانتقال إلى المحتوى الرئيسي</a>
    <a class="hw-link hw-portal-brand" href="/">بوابة المثال</a>
    <button class="hw-button hw-portal-menu-toggle" type="button" data-hw-portal-toggle><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>القائمة</button>
    <nav aria-label="التنقل الرئيسي" data-hw-portal-navigation>
      <ul><li><a class="hw-link" href="/requests" aria-current="page">الطلبات</a></li><li><a class="hw-link" href="/documents">المستندات</a></li></ul>
    </nav>
  </header>
  <main class="hw-portal-layout-main hw-container" id="main-content" tabindex="-1">
    <h1>الطلبات</h1>
    <p>تظهر هنا الطلبات التي قدّمتها وحالة كل منها.</p>
  </main>
  <footer class="hw-portal-footer">
    <div class="hw-portal-footer-main">
      <div class="hw-portal-footer-brand"><div class="hw-portal-footer-brand-marks">بوابة المثال</div></div>
      <nav class="hw-portal-footer-group" aria-label="روابط التذييل"><h2>روابط التذييل</h2><ul class="hw-portal-footer-links"><li><a class="hw-link" href="/privacy">سياسة الخصوصية</a></li><li><a class="hw-link" href="/terms">شروط الاستخدام</a></li></ul></nav>
    </div>
  </footer>
</div>
```

```tsx live example=basic
<PortalLayout
  brand="بوابة المثال"
  mainId="main-content"
  skipLabel="الانتقال إلى المحتوى الرئيسي"
  menuLabel="القائمة"
  navigationLabel="التنقل الرئيسي"
  headerProps={{
    links: [
      { label: 'الطلبات', href: '/requests', current: true },
      { label: 'المستندات', href: '/documents' },
    ],
  }}
  footerLabel="روابط التذييل"
  footerProps={{
    externalLabel: 'يُفتح في نافذة جديدة',
    links: [
      { label: 'سياسة الخصوصية', href: '/privacy' },
      { label: 'شروط الاستخدام', href: '/terms' },
    ],
  }}
>
  <h1>الطلبات</h1>
  <p>تظهر هنا الطلبات التي قدّمتها وحالة كل منها.</p>
</PortalLayout>
```

```vue live example=basic
<PortalLayout
  brand="بوابة المثال"
  main-id="main-content"
  skip-label="الانتقال إلى المحتوى الرئيسي"
  menu-label="القائمة"
  navigation-label="التنقل الرئيسي"
  :links="[
    { label: 'الطلبات', href: '/requests', current: true },
    { label: 'المستندات', href: '/documents' },
  ]"
  footer-label="روابط التذييل"
  :footer-links="[
    { label: 'سياسة الخصوصية', href: '/privacy' },
    { label: 'شروط الاستخدام', href: '/terms' },
  ]"
  :footer-props="{ externalLabel: 'يُفتح في نافذة جديدة' }"
>
  <h1>الطلبات</h1>
  <p>تظهر هنا الطلبات التي قدّمتها وحالة كل منها.</p>
</PortalLayout>
```

```ts live example=basic framework=angular
template: `<hw-portal-layout
  brand="بوابة المثال"
  mainId="main-content"
  skipLabel="الانتقال إلى المحتوى الرئيسي"
  menuLabel="القائمة"
  navigationLabel="التنقل الرئيسي"
  [links]="[
    { label: 'الطلبات', href: '/requests', current: true },
    { label: 'المستندات', href: '/documents' },
  ]"
  footerLabel="روابط التذييل"
  [footerLinks]="[
    { label: 'سياسة الخصوصية', href: '/privacy' },
    { label: 'شروط الاستخدام', href: '/terms' },
  ]"
  externalLabel="يُفتح في نافذة جديدة"
>
  <h1>الطلبات</h1>
  <p>تظهر هنا الطلبات التي قدّمتها وحالة كل منها.</p>
</hw-portal-layout>`
```

## الأشكال والحالات

### التنقل الثانوي ومسار التنقل

يقع التنقل الثانوي بين الترويسة والحاوية الرئيسية، ويقع مسار التنقل في بداية الحاوية الرئيسية. ويحتاج كل منهما إلى تسمية خاصة به، `secondaryLabel` و`breadcrumbLabel`، لأن كلًّا منهما منطقة تنقل. والبند الأخير من مسار التنقل هو الصفحة الحالية، وليس له `href`.

```html live example=secondary differences=portal-layout-adapter-markup,portal-layout-footer-brand-tree,portal-layout-footer-brand-weight frame
<div class="hw-portal-layout">
  <header class="hw-portal-header" data-hw="portal-header">
    <a class="hw-skip-link" href="#secondary-content">الانتقال إلى المحتوى الرئيسي</a>
    <a class="hw-link hw-portal-brand" href="/">بوابة المثال</a>
    <button class="hw-button hw-portal-menu-toggle" type="button" data-hw-portal-toggle><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>القائمة</button>
    <nav aria-label="التنقل الرئيسي" data-hw-portal-navigation>
      <ul><li><a class="hw-link" href="/requests" aria-current="page">الطلبات</a></li><li><a class="hw-link" href="/documents">المستندات</a></li></ul>
    </nav>
  </header>
  <nav class="hw-secondary-nav" aria-label="أقسام الطلبات" data-variant="default"><ul><li><a href="/requests" aria-current="page"><span>جميع الطلبات</span></a></li><li><a href="/requests/drafts"><span>المسودات</span></a></li></ul></nav>
  <main class="hw-portal-layout-main hw-container" id="secondary-content" tabindex="-1">
    <nav class="hw-breadcrumb" aria-label="مسار التنقل"><ol><li><a href="/">الرئيسية</a></li><li><span aria-current="page">الطلبات</span></li></ol></nav>
    <h1>الطلبات</h1>
    <p>تظهر هنا الطلبات التي قدّمتها وحالة كل منها.</p>
  </main>
  <footer class="hw-portal-footer">
    <div class="hw-portal-footer-main">
      <div class="hw-portal-footer-brand"><div class="hw-portal-footer-brand-marks">بوابة المثال</div></div>
    </div>
  </footer>
</div>
```

```tsx live example=secondary
<PortalLayout
  brand="بوابة المثال"
  mainId="secondary-content"
  skipLabel="الانتقال إلى المحتوى الرئيسي"
  menuLabel="القائمة"
  navigationLabel="التنقل الرئيسي"
  headerProps={{
    links: [
      { label: 'الطلبات', href: '/requests', current: true },
      { label: 'المستندات', href: '/documents' },
    ],
  }}
  secondaryNavigation={[
    { label: 'جميع الطلبات', href: '/requests', current: true },
    { label: 'المسودات', href: '/requests/drafts' },
  ]}
  secondaryLabel="أقسام الطلبات"
  breadcrumbs={[
    { label: 'الرئيسية', href: '/' },
    { label: 'الطلبات', current: true },
  ]}
  breadcrumbLabel="مسار التنقل"
  footerProps={{ externalLabel: 'يُفتح في نافذة جديدة' }}
>
  <h1>الطلبات</h1>
  <p>تظهر هنا الطلبات التي قدّمتها وحالة كل منها.</p>
</PortalLayout>
```

```vue live example=secondary
<PortalLayout
  brand="بوابة المثال"
  main-id="secondary-content"
  skip-label="الانتقال إلى المحتوى الرئيسي"
  menu-label="القائمة"
  navigation-label="التنقل الرئيسي"
  :links="[
    { label: 'الطلبات', href: '/requests', current: true },
    { label: 'المستندات', href: '/documents' },
  ]"
  :secondary-navigation="[
    { label: 'جميع الطلبات', href: '/requests', current: true },
    { label: 'المسودات', href: '/requests/drafts' },
  ]"
  secondary-label="أقسام الطلبات"
  :breadcrumbs="[
    { label: 'الرئيسية', href: '/' },
    { label: 'الطلبات', current: true },
  ]"
  breadcrumb-label="مسار التنقل"
  :footer-props="{ externalLabel: 'يُفتح في نافذة جديدة' }"
>
  <h1>الطلبات</h1>
  <p>تظهر هنا الطلبات التي قدّمتها وحالة كل منها.</p>
</PortalLayout>
```

```ts live example=secondary framework=angular
template: `<hw-portal-layout
  brand="بوابة المثال"
  mainId="secondary-content"
  skipLabel="الانتقال إلى المحتوى الرئيسي"
  menuLabel="القائمة"
  navigationLabel="التنقل الرئيسي"
  [links]="[
    { label: 'الطلبات', href: '/requests', current: true },
    { label: 'المستندات', href: '/documents' },
  ]"
  [secondaryNavigation]="[
    { label: 'جميع الطلبات', href: '/requests', current: true },
    { label: 'المسودات', href: '/requests/drafts' },
  ]"
  secondaryLabel="أقسام الطلبات"
  [breadcrumbs]="[
    { label: 'الرئيسية', href: '/' },
    { label: 'الطلبات', current: true },
  ]"
  breadcrumbLabel="مسار التنقل"
  externalLabel="يُفتح في نافذة جديدة"
>
  <h1>الطلبات</h1>
  <p>تظهر هنا الطلبات التي قدّمتها وحالة كل منها.</p>
</hw-portal-layout>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العناصر hw-portal-layout وhw-portal-layout-main

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-portal-layout' \| 'hw-portal-layout-main'` | `true` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس لهيكل البوابة متحكم خاص به في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر `div` بالصنف `hw-portal-layout` يحتوي بهذا الترتيب على عنصر `header` بالصنف `hw-portal-header`، وعنصر `nav` اختياري بالصنف `hw-secondary-nav`، وعنصر `main` بالصنفين `hw-portal-layout-main` و`hw-container`، وعنصر `footer` بالصنف `hw-portal-footer`. ويحمل عنصر `main` قيمة `id` التي يذكرها رابط التخطي، والخاصية `tabindex` بالقيمة -1، ليتمكّن رابط التخطي من نقل التركيز إليه. ويقع مسار التنقل الاختياري، وهو عنصر `nav` بالصنف `hw-breadcrumb`، أولًا داخل عنصر `main`. واكتب على الترويسة الخاصية `data-hw="portal-header"` لتربط الدالة `enhance()` من `@hawiyah/vanilla` قائمة الأجهزة المحمولة؛ ويحمل زر القائمة `data-hw-portal-toggle`، ويحمل التنقل `data-hw-portal-navigation`. وتحتوي الترويسة، بترتيب القراءة، على رابط التخطي بالصنف `hw-skip-link`، ورابط العلامة بالصنف `hw-portal-brand`، وزر القائمة بالصنفين `hw-button` و`hw-portal-menu-toggle`، والتنقل. ويبقى التنقل ظاهرًا حتى تعمل الدالة `enhance()`، فلا تكتب `hidden` ولا `data-open="false"` في الترميز الأولي. ويتبع التذييل ترميز صفحة [تذييل المنصة](portal-footer.md).

### React

جدول: خصائص PortalLayout

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `brand` | `ReactNode` | `true` | — |
| `brandLabel` | `string` | `false` | — |
| `headerProps` | `Omit<PortalHeaderBaseProps, 'brand' \| 'brandLabel' \| 'navigationLabel' \| 'menuLabel'>` | `false` | — |
| `mainId` | `string` | `false` | — |
| `skipLabel` | `string` | `true` | — |
| `menuLabel` | `string` | `true` | — |
| `navigationLabel` | `string` | `true` | — |
| `footerProps` | `PortalFooterContentProps & { links?: undefined } \| PortalFooterContentProps` | `true` | — |
| `footerLabel` | `string` | `false` | — |
| `secondaryNavigation` | `readonly PortalNavItem[]` | `false` | — |
| `secondaryLabel` | `string` | `false` | — |
| `breadcrumbs` | `readonly BreadcrumbItem[]` | `false` | — |
| `breadcrumbLabel` | `string` | `false` | — |

الخاصية `brand` مطلوبة، وتُمرَّر إلى الترويسة وإلى التذييل كليهما؛ وهي نص أو صورة أو كلاهما، والخاصية `brandLabel` هي الاسم الميسّر للعلامة التي لا تحتوي إلا على صورة. والخصائص `skipLabel` و`menuLabel` و`navigationLabel` مطلوبة في كل استخدام. والخاصية `mainId` هي معرّف الحاوية الرئيسية، الذي يذكره رابط التخطي؛ ودونها يولّد الهيكل معرّفًا. وتحمل الخاصية `headerProps` بقية خصائص `PortalHeader` التي لا يضبطها الهيكل بنفسه، مثل روابطها، وعنوان رابط العلامة، وإجراءاتها، وإشعارها، وحالة فتح قائمتها. وتحمل الخاصية `footerProps` محتوى التذييل بأسماء خصائص [تذييل المنصة](portal-footer.md)؛ والحقل `externalLabel` فيها مطلوب، والخاصية `footerLabel` مطلوبة مع `footerProps.links`، وتُمرَّر إلى التذييل تسميةً لمنطقة التنقل فيه. وتعرض الخاصية `secondaryNavigation` تنقلًا ثانويًا وتحتاج إلى `secondaryLabel`، وتعرض الخاصية `breadcrumbs` مسار تنقل وتحتاج إلى `breadcrumbLabel`. وتُعرض العناصر الأبناء في الحاوية الرئيسية بعد مسار التنقل. ولا يضبط الهيكل `lang` ولا `dir`: مرّرهما خاصيتَي HTML على الهيكل، كما في أي عنصر، أو اضبطهما على عنصر سلف. وتصل خصائص HTML الأخرى إلى عنصر `div` الجذر.

### Vue

جدول: خصائص PortalLayout وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `brand` | prop | `string` | `false` | — |
| `brandLabel` | prop | `string` | `false` | — |
| `homeHref` | prop | `string` | `false` | `'/'` |
| `links` | prop | `readonly PortalLink[]` | `false` | — |
| `secondaryNavigation` | prop | `readonly PortalLink[]` | `false` | — |
| `footerLinks` | prop | `readonly PortalLink[]` | `false` | — |
| `breadcrumbs` | prop | `readonly BreadcrumbItem[]` | `false` | — |
| `copyright` | prop | `string` | `false` | — |
| `mainId` | prop | `string` | `false` | — |
| `dir` | prop | `'rtl' \| 'ltr' \| 'auto'` | `false` | — |
| `skipLabel` | prop | `string` | `true` | — |
| `menuLabel` | prop | `string` | `true` | — |
| `navigationLabel` | prop | `string` | `true` | — |
| `secondaryLabel` | prop | `string` | `false` | — |
| `breadcrumbLabel` | prop | `string` | `false` | — |
| `footerLabel` | prop | `string` | `false` | — |
| `footerProps` | prop | `Record<string, unknown> & { externalLabel?: string; legalLinksLabel?: string; supportLabel?: string }` | `false` | — |
| `brand` | slot | — | `false` | — |
| `notice` | slot | — | `false` | — |
| `actions` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |
| `footer` | slot | — | `false` | — |

الخصائص `skipLabel` و`menuLabel` و`navigationLabel` مطلوبة. والخاصية `brand` نص تعرضه الترويسة والتذييل كلاهما، ويُعرض محتوى المنفذ `brand` قبل هذا النص في كليهما؛ وتسمّي الخاصية `brandLabel` العلامة التي لا تحتوي إلا على صورة. والخاصية `homeHref` هي عنوان رابط العلامة، وقيمتها الافتراضية `'/'`. والخاصية `links` هي التنقل الرئيسي، وتحتاج `secondaryNavigation` إلى `secondaryLabel`، وتحتاج `breadcrumbs` إلى `breadcrumbLabel`، وتحتاج `footerLinks` إلى `footerLabel`؛ والقيمة الافتراضية لكل من هذه المصفوفات مصفوفة فارغة. والخاصية `copyright` هي سطر النص في التذييل. وتحمل الخاصية `footerProps` خصائص التذييل الأخرى، والنص الذي يضيفه التذييل إلى روابطه الخارجية مطلوب فيها. والخاصية `mainId` هي معرّف الحاوية الرئيسية، ودونها يولّد الهيكل معرّفًا. وتُكتب الخاصية `dir` في خاصية HTML `dir` على العنصر الجذر؛ أما `lang` فليست خاصية للمكوّن، وتصل إلى العنصر الجذر مع خصائص HTML الأخرى. ويُعرض المنفذ `notice` فوق العلامة، والمنفذ `actions` بعد التنقل. والمنفذ الافتراضي هو محتوى الصفحة، ويضيف المنفذ `footer` محتوى إلى التذييل. ويسرد الجدول المنافذ الخمسة لأن الإصدار المنشور يقرؤها؛ ولا يعرّف التصريح نوع أي منها.

### Angular

جدول: مُدخلات hw-portal-layout ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `brand` | input | `string` | `false` | `''` |
| `brandLabel` | input | `string` | `false` | `''` |
| `homeHref` | input | `string` | `false` | `'/'` |
| `dir` | input | `'rtl' \| 'ltr'` | `false` | — |
| `mainId` | input | `string` | `false` | — |
| `links` | input | `readonly HwPortalNavItem[]` | `false` | `[]` |
| `navigationId` | input | `string` | `false` | — |
| `secondaryNavigation` | input | `readonly HwLinkItem[]` | `false` | `[]` |
| `footerLinks` | input | `readonly HwPortalFooterLink[]` | `false` | `[]` |
| `breadcrumbs` | input | `readonly HwBreadcrumbItem[]` | `false` | `[]` |
| `copyright` | input | `string` | `false` | `''` |
| `skipLabel` | input | `string` | `true` | — |
| `menuLabel` | input | `string` | `true` | — |
| `navigationLabel` | input | `string` | `true` | — |
| `secondaryLabel` | input | `string` | `false` | `''` |
| `breadcrumbLabel` | input | `string` | `false` | `''` |
| `footerLabel` | input | `string` | `false` | `''` |
| `externalLabel` | input | `string` | `true` | — |
| `[hwPortalNotice]` | content | — | `false` | — |
| `[hwBrand]` | content | — | `false` | — |
| `[hwPortalActions]` | content | — | `false` | — |
| `*` | content | — | `false` | — |
| `[hwFooterBrand]` | content | — | `false` | — |
| `[hwPortalFooter]` | content | — | `false` | — |

يُطبَّق `HwPortalLayoutComponent` على `hw-portal-layout`، ويعرض عنصر `div` الخاص بالهيكل داخل العنصر المضيف. والمُدخلات `skipLabel` و`menuLabel` و`navigationLabel` و`externalLabel` نصوص مطلوبة، والمُدخل `externalLabel` هو النص الذي يضيفه التذييل إلى روابطه الخارجية. والمُدخل `brand` نص تعرضه الترويسة والتذييل كلاهما؛ ويُعرض المحتوى الذي يحمل `hwBrand` قبله في الترويسة، والمحتوى الذي يحمل `hwFooterBrand` قبله في التذييل، ويسمّي المُدخل `brandLabel` العلامة التي لا تحتوي إلا على صورة. والمُدخل `links` هو التنقل الرئيسي، ويحتاج `secondaryNavigation` إلى `secondaryLabel`، ويحتاج `breadcrumbs` إلى `breadcrumbLabel`، ويحتاج `footerLinks` إلى `footerLabel`. والمُدخل `copyright` هو سطر النص في التذييل. والمُدخل `homeHref` هو عنوان رابط العلامة. ويُكتب المُدخل `dir` في الخاصية `dir` للهيكل. ويُولَّد `mainId` و`navigationId` من مصدر واحد للمعرّفات في كل تطبيق؛ فمرّر معرّفات صريحة وثابتة عندما تُسلسَل جذور Angular كلٌّ على حدة. ويُعرض المحتوى الذي يحمل `hwPortalNotice` فوق العلامة، والمحتوى الذي يحمل `hwPortalActions` بعد التنقل. والمحتوى الآخر هو محتوى الصفحة في الحاوية الرئيسية، ويُضاف المحتوى الذي يحمل `hwPortalFooter` إلى التذييل.

## إمكانية الوصول

يعرض هيكل البوابة معالم الصفحة: عنصر `header`، ومناطق التنقل، وعنصر `main` واحدًا، وعنصر `footer`. استخدم هيكلًا واحدًا في كل صفحة، ولا تضع داخله عنصر `main` ثانيًا.

- رابط التخطي هو أول عنصر قابل للتركيز في الترويسة. ويقود إلى الحاوية الرئيسية، التي تحمل الخاصية `tabindex` بالقيمة -1، ليتمكّن المتصفح من نقل التركيز إليها. ونص الرابط هو قيمة `skipLabel`.
- لكل منطقة تنقل اسم ميسّر خاص بها: `navigationLabel` للتنقل الرئيسي، و`secondaryLabel` للتنقل الثانوي، و`breadcrumbLabel` لمسار التنقل، و`footerLabel` لروابط التذييل. امنح كلًّا منها نصًا مختلفًا، ليتمكّن القارئ الذي يتنقّل بين المعالم من التمييز بينها.
- يحمل رابط الصفحة الحالية الخاصية `aria-current="page"`.
- عندما تحتوي الترويسة على روابط، تعرض زر القائمة الذي يحمل `aria-expanded` و`aria-controls`، وتبقى الروابط ظاهرة في عروض أجهزة سطح المكتب. وفي العروض الأصغر من 48rem يفتح الزر التنقل ويغلقه. ويغلق <kbd>Escape</kbd> التنقل المفتوح ويعيد التركيز إلى الزر، ولا يُحتجز <kbd>Tab</kbd>.
- دون عمل الدالة `enhance()` يبقى تنقل vanilla ظاهرًا، لأن الترميز الأولي لا يحمل الخاصية `hidden`.
- يعرض رابط الترويسة الذي له مجموعات عنصر إظهار وإخفاء يدور سهمه بانتقال متحرّك، وتغيّر روابط مسار التنقل لونها بانتقال مدته 0ms ما لم يضبط التطبيق مدة. وتلغي ورقة الأنماط الانتقالين كليهما عندما يطلب القارئ تقليل الحركة.

## الاتجاه والتوطين

ليس في هيكل البوابة نص مدمج، ولا يضبط `lang` ولا `dir` من تلقاء نفسه. ويكتب التطبيق كل تسمية والمحتوى بلغة الصفحة، ويضبط `lang` و`dir` على الهيكل أو على عنصر سلف، ويمكنه أن يضبط كلًّا منهما مستقلًا عن الآخر.

- في React وفي الترميز، مرّر `lang` و`dir` خاصيتَي HTML على الهيكل. وفي Vue تكون `dir` خاصية للمكوّن، وفي Angular تكون مُدخلًا؛ وتبقى `lang` خاصية HTML في كليهما.
- يتبع الهيكل الاتجاه المعمول به عبر خصائص CSS المنطقية، فتبدأ الترويسة والتنقل ومسار التنقل والتذييل من جهة بدء القراءة، في العربية وفي الإنجليزية.
- اكتب بنود التنقل بترتيب القراءة في كل لغة؛ فالهيكل لا يعيد ترتيبها.
- يوفّر التطبيق صور العلامة. فوفّر الصورة لكل لغة عندما تختلف، وسمِّها بالخاصية `brandLabel` عندما لا يكون فيها نص.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط هيكل البوابة بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- يُدرج هيكل البوابة في الصف Platform patterns من نطاق المكوّنات في [ملاحظات التغطية](../coverage.md). وتصفه الملاحظات بأنه تركيب من الترويسة والتنقل الثانوي ومسار التنقل وحاوية رئيسية قابلة للتركيز والتذييل، وتذكر أن نقطة التحوّل 48rem لإظهار التنقل وإخفائه تكييف من هوية.
- تتبع مجموعات التنقل في الترويسة [ملاحظات تنقل البوابة](../nic-portal-navigation.md)، ويتبع التذييل [ملاحظات التذييل](../nic-footer.md). وتسجّل ملاحظات التذييل ربطًا بالمصدر ولا تدّعي التطابق المرئي الكامل، وتسجّل ملاحظات تنقل البوابة أن مسافات اللوحة ومستوى ارتفاعها وأعمدتها في الترويسة خيارات تصميم من هوية.
