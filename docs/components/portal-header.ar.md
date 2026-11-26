---
source:
  summary: a5bd05385e2e
  example: 6aa1fb5d3834
  variants-and-states: e7c6a58c0bba
  api: b5f00d8c4bcd
  accessibility: 41d28ab55b39
  rtl-and-localisation: ede6cb4a508f
  platforms-code-reference: 8f0b8e867cdd
---
# ترويسة المنصة

ترويسة المنصة هي ترويسة بوابة الخدمات: العلامة التي تعرّف بالمنتج، والتنقل الرئيسي، ورابط تخطٍّ وإشعار اختياريان، وإجراءات التطبيق. وعندما يقلّ العرض عن 48rem ينطوي التنقل خلف زر القائمة.

## مثال

العلامة تعرّف بالمنتج، وهي رابط إلى الصفحة الرئيسية. وللتنقل اسم، ويحمل رابط الصفحة الحالية `aria-current="page"`. ويوفّر التطبيق كل النصوص، ومنها اسم زر القائمة الذي يظهر عندما يقلّ العرض عن 48rem. وتقع الإجراءات بعد التنقل.

```html live example=basic static differences=portal-header-adapter-markup frame
<header class="hw-portal-header" data-hw="portal-header">
  <a class="hw-portal-brand" href="/">بوابة المثال</a>
  <button class="hw-button hw-portal-menu-toggle" type="button" aria-expanded="false" aria-controls="basic-navigation" data-hw-portal-toggle><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>القائمة</button>
  <nav id="basic-navigation" aria-label="التنقل الرئيسي" data-hw-portal-navigation>
    <ul>
      <li><a class="hw-link" href="/services">الخدمات</a></li>
      <li><a class="hw-link" href="/requests" aria-current="page">الطلبات</a></li>
      <li><a class="hw-link" href="/help">المساعدة</a></li>
    </ul>
  </nav>
  <div class="hw-portal-header-actions"><button class="hw-button" type="button" data-variant="secondary" data-size="md">تسجيل الدخول</button></div>
</header>
```

```tsx live example=basic
<PortalHeader
  brand="بوابة المثال"
  navigationLabel="التنقل الرئيسي"
  menuLabel="القائمة"
  links={[
    { label: 'الخدمات', href: '/services' },
    { label: 'الطلبات', href: '/requests', current: true },
    { label: 'المساعدة', href: '/help' },
  ]}
  actions={<Button variant="secondary">تسجيل الدخول</Button>}
/>
```

```vue live example=basic
<PortalHeader
  brand="بوابة المثال"
  navigation-label="التنقل الرئيسي"
  menu-label="القائمة"
  :links="[
    { label: 'الخدمات', href: '/services' },
    { label: 'الطلبات', href: '/requests', current: true },
    { label: 'المساعدة', href: '/help' },
  ]"
>
  <template #actions><Button variant="secondary">تسجيل الدخول</Button></template>
</PortalHeader>
```

```ts live example=basic framework=angular
template: `<hw-portal-header
  brand="بوابة المثال"
  navigationLabel="التنقل الرئيسي"
  menuLabel="القائمة"
  [links]="[
    { label: 'الخدمات', href: '/services' },
    { label: 'الطلبات', href: '/requests', current: true },
    { label: 'المساعدة', href: '/help' },
  ]"
>
  <button hwButton variant="secondary">تسجيل الدخول</button>
</hw-portal-header>`
```

## الأشكال والحالات

### التنقل المجمّع

يمكن أن يفتح البند مجموعة من الروابط. والمجموعة عنصر `details` أصلي، وتبدأ لوحتها برابط صفحة المجموعة، ثم قوائم روابط تحت عناوين ظاهرة.

```html live example=grouped static differences=portal-header-adapter-markup frame
<header class="hw-portal-header" data-hw="portal-header">
  <a class="hw-portal-brand" href="/">بوابة المثال</a>
  <button class="hw-button hw-portal-menu-toggle" type="button" aria-expanded="false" aria-controls="grouped-navigation" data-hw-portal-toggle><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>القائمة</button>
  <nav id="grouped-navigation" aria-label="التنقل الرئيسي" data-hw-portal-navigation>
    <ul>
      <li>
        <details class="hw-portal-branch" data-hw-portal-branch data-current="true">
          <summary>الخدمات</summary>
          <div class="hw-portal-branch-panel">
            <a class="hw-link hw-portal-branch-overview" href="/services">الخدمات</a>
            <section class="hw-portal-branch-group">
              <h2>المستندات</h2>
              <ul>
                <li><a class="hw-link" href="/services/document-copy" aria-current="page">نسخة من مستند</a></li>
                <li><a class="hw-link" href="/services/document-status">حالة المستند</a></li>
              </ul>
            </section>
          </div>
        </details>
      </li>
      <li><a class="hw-link" href="/help">المساعدة</a></li>
    </ul>
  </nav>
</header>
```

```tsx live example=grouped
<PortalHeader
  brand="بوابة المثال"
  navigationLabel="التنقل الرئيسي"
  menuLabel="القائمة"
  links={[
    { label: 'الخدمات', href: '/services', groups: [
      { label: 'المستندات', links: [
        { label: 'نسخة من مستند', href: '/services/document-copy', current: true },
        { label: 'حالة المستند', href: '/services/document-status' },
      ] },
    ] },
    { label: 'المساعدة', href: '/help' },
  ]}
/>
```

```vue live example=grouped
<PortalHeader
  brand="بوابة المثال"
  navigation-label="التنقل الرئيسي"
  menu-label="القائمة"
  :links="[
    { label: 'الخدمات', href: '/services', groups: [
      { label: 'المستندات', links: [
        { label: 'نسخة من مستند', href: '/services/document-copy', current: true },
        { label: 'حالة المستند', href: '/services/document-status' },
      ] },
    ] },
    { label: 'المساعدة', href: '/help' },
  ]"
/>
```

```ts live example=grouped framework=angular
template: `<hw-portal-header
  brand="بوابة المثال"
  navigationLabel="التنقل الرئيسي"
  menuLabel="القائمة"
  [links]="[
    { label: 'الخدمات', href: '/services', groups: [
      { label: 'المستندات', links: [
        { label: 'نسخة من مستند', href: '/services/document-copy', current: true },
        { label: 'حالة المستند', href: '/services/document-status' },
      ] },
    ] },
    { label: 'المساعدة', href: '/help' },
  ]"
/>`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createPortalHeader

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `menuLabel` | `string` | `false` | — |
| `navigationLabel` | `string` | `false` | — |
| `brandLabel` | `string` | `false` | — |

تهيّئ الدالة `createPortalHeader(header, options)` عنصر `header` يحمل `data-hw="portal-header"`، وتهيّئ الدالة `enhance()` كل عنصر من هذا النوع، وتُرجع الدالة متحكمًا يتيح `open` و`show()` و`close(restoreFocus)` و`destroy()`. وترتيب القراءة وترتيب التنقل بالمفتاح Tab في الترويسة هو: رابط التخطي، ثم الإشعار، ثم العلامة، ثم زر تبديل القائمة، ثم التنقل، ثم الإجراءات. ميّز زر تبديل القائمة بالخاصية `data-hw-portal-toggle`، والتنقل بالخاصية `data-hw-portal-navigation`، وكل مجموعة بالخاصية `data-hw-portal-branch` على عنصر `details` أصلي. ولا تكتب `hidden` أو `data-open="false"` في الترميز الأولي. ولا تكتب الترويسة أي نص خاص بها. ويُؤخذ الاسم من الترميز أولًا، ثم من خاصية على الترويسة، ويتقدّم عليهما الخيار الذي يحمل الاسم نفسه. ويسمّي الخيار `menuLabel` زر التبديل عندما لا يكون فيه نص ولا `aria-label`، ويسمّي الخيار `navigationLabel` التنقل عندما لا يحمل `aria-label` ولا `aria-labelledby`، والخيار `brandLabel` هو قيمة `aria-label` للعلامة عندما تكون العلامة رسمًا فقط؛ ويكتب المتحكم حينئذٍ أيضًا `role="img"` على العلامة التي ليست رابطًا. ولا يُكتب الاسم الغائب، ويُصدر المتحكم تحذيرًا واحدًا في بيئة التطوير. ويتلقّى الخيار `onOpenChange` كل تغيير في حالة إظهار التنقل وإخفائه. ويُربط رابط التخطي الذي يحمل الصنف `hw-skip-link` داخل الترويسة بوصفه رابطًا إلى جزء من الصفحة، كما تربط الحزم هذه الروابط.

### React

جدول: خصائص PortalHeader

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `brand` | `ReactNode` | `true` | — |
| `homeHref` | `string` | `false` | `'/'` |
| `brandLabel` | `string` | `false` | — |
| `links` | `readonly PortalNavItem[]` | `false` | — |
| `navigationLabel` | `string` | `true` | — |
| `menuLabel` | `string` | `true` | — |
| `navigationId` | `string` | `false` | — |
| `actions` | `ReactNode` | `false` | — |
| `notice` | `ReactNode` | `false` | — |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | `false` |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `mainId` | `string` | `false` | — |
| `skipLabel` | `string` | `false` | — |

الخاصية `brand` مطلوبة، ويمكن أن تكون نصًا أو رسمًا أو كليهما. وتجعل الخاصية `homeHref` العلامة رابطًا؛ وتعرض السلسلة النصية الفارغة العلامة عنصر `div`، مع `role="img"` عند كتابة `brandLabel`، والخاصية `brandLabel` هي الاسم الميسّر للعلامة التي هي رسم فقط. ولكل `PortalNavItem` الحقلان `label` و`href`، والحقلان الاختياريان `current` و`groups`؛ ولكل مجموعة الحقل الاختياري `label` وروابطها في `links`. والخاصيتان `navigationLabel` و`menuLabel` مطلوبتان، وتسمّيان التنقل وزر القائمة؛ ولا يُعرض زر القائمة والتنقل إلا عندما تحتوي `links` على بنود. استخدم `open` مع `onOpenChange` لحالة إظهار متحكَّم فيها، و`defaultOpen` لحالة غير متحكَّم فيها؛ وأغلق التنقل بالخاصية `open` بعد تغيير المسار في جهة العميل. وتُعرض `notice` في حاوية قبل العلامة، وتُعرض `actions` في حاوية بعد التنقل؛ ولا توجد كل حاوية إلا عند كتابة خاصيتها. وتضيف الخاصية `mainId` رابط تخطٍّ إلى العنصر الذي يحمل هذا المعرّف، وتتطلب `skipLabel`. وتضبط الخاصية `navigationId` معرّف التنقل، وقيمتها الافتراضية مولَّدة، فيعرض الجدول شرطة طويلة في عمود القيمة الافتراضية.

### Vue

جدول: خصائص PortalHeader وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `brand` | prop | `string` | `false` | — |
| `brandLabel` | prop | `string` | `false` | — |
| `homeHref` | prop | `string` | `false` | `'/'` |
| `links` | prop | `readonly PortalLink[]` | `false` | — |
| `navigationLabel` | prop | `string` | `true` | — |
| `menuLabel` | prop | `string` | `true` | — |
| `navigationId` | prop | `string` | `false` | — |
| `mainId` | prop | `string` | `false` | — |
| `skipLabel` | prop | `string` | `false` | — |
| `open` | prop | `boolean` | `false` | — |
| `defaultOpen` | prop | `boolean` | `false` | `false` |
| `update:open` | event | `(value: boolean) => void` | `false` | — |
| `notice` | slot | — | `false` | — |
| `brand` | slot | — | `false` | — |
| `actions` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |

الخاصية `brand` نص، ويحمل المنفذ `brand` الرسم؛ وتسمّي الخاصية `brandLabel` العلامة التي هي رسم فقط، وتعرض القيمة الفارغة للخاصية `homeHref` العلامة عنصر `div`. ولكل `PortalLink` الحقلان `label` و`href`، والحقلان الاختياريان `current` و`groups`. والخاصيتان `navigationLabel` و`menuLabel` مطلوبتان. وتربط الخاصية `open` مع الحدث `update:open` حالة إظهار التنقل عندما يقلّ العرض عن 48rem، وتضبط الخاصية `defaultOpen` الحالة الأولية؛ ويُبلغ كلٌّ من زر التبديل، والمفتاح Escape، والضغط خارج الترويسة، وخروج التركيز منها، وتفعيل رابط، عن التغيير مرة واحدة. ويُعرض المنفذ `notice` بين رابط التخطي والعلامة، ويُعرض المنفذ `actions` بعد التنقل؛ ولا توجد كل حاوية إلا عند كتابة منفذها. وتضيف الخاصية `mainId` رابط تخطٍّ، وتتطلب `skipLabel`. ويسرد الجدول المنافذ الأربعة لأن الإصدار المنشور يقرؤها؛ ولا يعرّف التصريح نوع أي منها.

### Angular

جدول: مُدخلات hw-portal-header ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `brand` | input | `string` | `false` | `''` |
| `brandLabel` | input | `string` | `false` | `''` |
| `homeHref` | input | `string` | `false` | `'/'` |
| `mainId` | input | `string` | `false` | `''` |
| `skipLabel` | input | `string` | `false` | `''` |
| `menuLabel` | input | `string` | `true` | — |
| `navigationLabel` | input | `string` | `true` | — |
| `navigationId` | input | `string` | `false` | — |
| `links` | input | `readonly HwPortalNavItem[]` | `false` | `[]` |
| `open` | input | `boolean` | `false` | `false` |
| `openChange` | output | `boolean` | `false` | — |
| `[hwPortalNotice]` | content | — | `false` | — |
| `[hwBrand]` | content | — | `false` | — |
| `*` | content | — | `false` | — |

يأخذ `HwPortalHeaderComponent` (`hw-portal-header`) العلامة نصًا في المُدخل `brand`، أو رسمًا مُسقَطًا يحمل `hwBrand`؛ ولا يُكتب نص للعلامة إلا عند كتابة `brand`، ويسمّي المُدخل `brandLabel` الرسم عبر `aria-label`. وتعرض القيمة الفارغة للمُدخل `homeHref` العلامة عنصر `div`، مع `role="img"` ما دام `brandLabel` مكتوبًا. والمُدخلان `menuLabel` و`navigationLabel` مطلوبان. ويأخذ المُدخل `links` بنودًا من النوع `HwPortalNavItem`، لكل منها الحقلان `label` و`href`، والحقلان الاختياريان `current` و`groups`. والربط `[(open)]` هو حالة إظهار التنقل عندما يقلّ العرض عن 48rem: يُرسَل المُخرج `openChange` مرة واحدة لكل تغيير يُحدثه القارئ، ولا يُرسَل عندما يغيّر التطبيق `open`، ويغلق `close()` التنقل والمجموعة المفتوحة. ويُعرض المحتوى الذي يحمل `hwPortalNotice` إشعارًا، ويُعرض المحتوى المُسقَط الآخر إجراءاتٍ بعد التنقل. ولا يُعرض رابط التخطي إلا عند ضبط `mainId`، ويحتاج حينئذٍ إلى `skipLabel`. واكتب قيمة فريدة للمُدخل `navigationId` عندما تضمّ الصفحة عدة ترويسات.

## إمكانية الوصول

الترويسة عنصر `header` يضمّ تنقلًا له اسم. ويظهر زر القائمة عندما يقلّ العرض عن 48rem، ويأخذ اسمه من `menuLabel`، ويحمل `aria-expanded` و`aria-controls` للتنقل. ويحمل رابط الصفحة الحالية `aria-current="page"`. وعند ضبط `mainId` يأتي رابط التخطي أولًا في ترتيب القراءة وترتيب التنقل بالمفتاح Tab، وينقل التركيز إلى الحاوية الرئيسية.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: ترويسة المنصة

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز إلى الرابط أو الزر أو عنوان المجموعة التالي في الترويسة، بترتيب المستند. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | ينقل التركيز إلى الرابط أو الزر أو عنوان المجموعة السابق. |
| <kbd>Enter</kbd> | ينتقل إلى وجهة الرابط الذي عليه التركيز، أو يفعّل الزر أو عنوان المجموعة الذي عليه التركيز. |
| <kbd>Space</kbd> | يفعّل الزر أو عنوان المجموعة الذي عليه التركيز. |
| <kbd>Escape</kbd> | يغلق المجموعة المفتوحة ويعيد التركيز إلى عنوانها، وإلا فيغلق التنقل المفتوح عندما يقلّ العرض عن 48rem ويعيد التركيز إلى زر القائمة. |

وعندما يقلّ العرض عن 48rem يُغلق التنقل إذا اختار القارئ رابطًا، أو ضغط خارج الترويسة، أو نقل التركيز خارجها، ويحتفظ المفتاح Tab بسلوكه الأصلي. وفي العرض الواسع تبقى الروابط ظاهرة.

## الاتجاه والتوطين

لا تكتب ترويسة المنصة أي نص خاص بها. يكتب التطبيق العلامة، واسمَي زر القائمة والتنقل، ورابط التخطي، والإشعار، والإجراءات بلغة الصفحة. وتتبع الترويسة اتجاه الصفحة عبر خصائص CSS المنطقية، فتقع العلامة في بداية السطر والإجراءات في نهايته في اتجاهَي القراءة كليهما.

- اكتب كل اسم بلغة الصفحة؛ فقارئ الشاشة يقرأ `brandLabel` بدلًا من الرسم، فاكتبه بهذه اللغة أيضًا.
- يقع الإجراء الذي يبدّل لغة الصفحة في `actions`، ويُكتب بالخاصية `lang` للغة الهدف.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط ترويسة المنصة بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تُدرج ترويسة المنصة في الصف Platform patterns من نطاق المكوّنات في [ملاحظات التغطية](../coverage.md)، التي تصف إظهار التنقل وإخفاءه في الجوال في كل محوّل.
- تصف [ملاحظات التنقل في البوابة](../nic-portal-navigation.md) لوحة التنقل المجمّع، وتربط أسطر المرجع التي تعالج زر التبديل في الجوال.
- تتبع الترويسة والتنقل وزر التبديل في الجوال [مرجع الويب NIC](../nic-web-reference.md)، الذي يسجّل مصدره. ونقطة التحوّل 48rem لإظهار التنقل وإخفائه تكييف من هوية، كما تذكر [ملاحظات التغطية](../coverage.md).
