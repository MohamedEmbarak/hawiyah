---
source:
  summary: a48e3f6317bd
  example: e50f7ea09221
  variants-and-states: 1988f9ea1570
  api: c8fcad7e5fda
  accessibility: a3734807eb6c
  rtl-and-localisation: 9937b7564a17
  platforms-code-reference: a4d0b1f05936
---
# الترويسة العلوية للجوال

الترويسة العلوية للجوال هي ترويسة الصفحة على الشاشة الضيقة: عنوان، وعنوان فرعي اختياري، ورابط رجوع، وإجراءات الصفحة. ويبقى الشريط في التدفق العادي للصفحة، ويتولّى التطبيق كل وجهة وكل إجراء.

## مثال

تعرض الصفحة الداخلية رابط رجوع إلى الصفحة الأعلى منها، وعنوان الصفحة، وعنوانًا فرعيًا يوضّح السياق، وإجراءً واحدًا. ويأخذ رابط الرجوع اسمه من `backLabel`، لأن سهمه لا يحمل اسمًا.

```html live example=basic differences=mobile-top-bar-adapter-variant frame width=390
<header class="hw-mobile-top-bar">
  <div class="hw-mobile-top-bar-leading"><a class="hw-mobile-top-bar-back" href="/requests" aria-label="العودة إلى الطلبات"><span class="hw-icon" data-icon="arrow-left-01" data-directional="true" aria-hidden="true"></span></a></div>
  <div class="hw-mobile-top-bar-copy"><h1 class="hw-mobile-top-bar-title">الطلب SR-2041</h1><p class="hw-mobile-top-bar-subtitle">قُدّم في 4 مارس</p></div>
  <div class="hw-mobile-top-bar-actions"><button class="hw-button" type="button" data-variant="secondary" data-size="md">تعديل</button></div>
</header>
```

```tsx live example=basic
<MobileTopBar
  title="الطلب SR-2041"
  subtitle="قُدّم في 4 مارس"
  backHref="/requests"
  backLabel="العودة إلى الطلبات"
  actions={<Button variant="secondary">تعديل</Button>}
/>
```

```vue live example=basic
<MobileTopBar title="الطلب SR-2041" subtitle="قُدّم في 4 مارس" back-href="/requests" back-label="العودة إلى الطلبات">
  <template #actions><Button variant="secondary">تعديل</Button></template>
</MobileTopBar>
```

```ts live example=basic framework=angular
template: `<hw-mobile-top-bar title="الطلب SR-2041" subtitle="قُدّم في 4 مارس" backHref="/requests" backLabel="العودة إلى الطلبات">
  <button hwTopBarActions hwButton variant="secondary">تعديل</button>
</hw-mobile-top-bar>`
```

## الأشكال والحالات

### الصفحة الرئيسية

الشكل `main` هو المستوى الأعلى في التطبيق. وعنوانه أكبر، ويوفّر التطبيق فيه عنصر التحكم في منطقة البداية بدلًا من رابط الرجوع: وهو هنا زر للتنقل له اسم ميسّر، لأنه لا يحتوي إلا على أيقونة. ويربط التطبيق الزر بقائمة التنقل الخاصة به؛ ولا تعرض الأمثلة إلا الترميز.

```html live example=main frame width=390
<header class="hw-mobile-top-bar" data-variant="main">
  <div class="hw-mobile-top-bar-leading"><button class="hw-button" type="button" data-variant="secondary" data-size="md" aria-label="فتح قائمة التنقل"><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span></button></div>
  <div class="hw-mobile-top-bar-copy"><h1 class="hw-mobile-top-bar-title">الخدمات</h1></div>
  <div class="hw-mobile-top-bar-actions"><button class="hw-button" type="button" data-variant="secondary" data-size="md" aria-label="البحث في الخدمات"><span class="hw-icon" data-icon="search-01" aria-hidden="true"></span></button></div>
</header>
```

```tsx live example=main
<MobileTopBar
  variant="main"
  title="الخدمات"
  leading={
    <Button variant="secondary" aria-label="فتح قائمة التنقل">
      <span className="hw-icon" data-icon="menu-01" aria-hidden="true" />
    </Button>
  }
  actions={
    <Button variant="secondary" aria-label="البحث في الخدمات">
      <span className="hw-icon" data-icon="search-01" aria-hidden="true" />
    </Button>
  }
/>
```

```vue live example=main
<MobileTopBar variant="main" title="الخدمات">
  <template #leading>
    <Button variant="secondary" aria-label="فتح قائمة التنقل">
      <span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>
    </Button>
  </template>
  <template #actions>
    <Button variant="secondary" aria-label="البحث في الخدمات">
      <span class="hw-icon" data-icon="search-01" aria-hidden="true"></span>
    </Button>
  </template>
</MobileTopBar>
```

```ts live example=main framework=angular
template: `<hw-mobile-top-bar variant="main" title="الخدمات">
  <button hwTopBarLeading hwButton variant="secondary" aria-label="فتح قائمة التنقل">
    <span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>
  </button>
  <button hwTopBarActions hwButton variant="secondary" aria-label="البحث في الخدمات">
    <span class="hw-icon" data-icon="search-01" aria-hidden="true"></span>
  </button>
</hw-mobile-top-bar>`
```

### مستوى العنوان

العنوان عنصر `h1` افتراضيًا. ويأخذ الشريط المضمَّن في صفحة لها عنصر `h1`، مثل معاينة داخل صفحة توثيق، القيمة 2 أو 3 في `headingLevel`. ولا يغيّر المستوى إلا العنصر.

```html live example=level differences=mobile-top-bar-adapter-variant
<header class="hw-mobile-top-bar">
  <div class="hw-mobile-top-bar-leading"><a class="hw-mobile-top-bar-back" href="/requests" aria-label="العودة إلى الطلبات"><span class="hw-icon" data-icon="arrow-left-01" data-directional="true" aria-hidden="true"></span></a></div>
  <div class="hw-mobile-top-bar-copy"><h2 class="hw-mobile-top-bar-title">المستندات المقدّمة</h2></div>
  <div class="hw-mobile-top-bar-actions"><button class="hw-button" type="button" data-variant="secondary" data-size="md">إضافة</button></div>
</header>
```

```tsx live example=level
<MobileTopBar
  headingLevel={2}
  title="المستندات المقدّمة"
  backHref="/requests"
  backLabel="العودة إلى الطلبات"
  actions={<Button variant="secondary">إضافة</Button>}
/>
```

```vue live example=level
<MobileTopBar :heading-level="2" title="المستندات المقدّمة" back-href="/requests" back-label="العودة إلى الطلبات">
  <template #actions><Button variant="secondary">إضافة</Button></template>
</MobileTopBar>
```

```ts live example=level framework=angular
template: `<hw-mobile-top-bar [headingLevel]="2" title="المستندات المقدّمة" backHref="/requests" backLabel="العودة إلى الطلبات">
  <button hwTopBarActions hwButton variant="secondary">إضافة</button>
</hw-mobile-top-bar>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-mobile-top-bar

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-mobile-top-bar'` | `true` | — |
| `data-variant` | `'main'` | `false` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس للترويسة العلوية للجوال متحكم في JavaScript، ولا تحتاج إلى استدعاء `enhance()`. فالترميز هو واجهتها البرمجية: اكتب عنصر `header` بالصنف `hw-mobile-top-bar`. ومنطقة البداية الاختيارية عنصر `div` بالصنف `hw-mobile-top-bar-leading`، يحتوي على رابط الرجوع (عنصر `a` بالصنف `hw-mobile-top-bar-back`) أو على عنصر تحكم من التطبيق. ويحتوي عنصر `div` بالصنف `hw-mobile-top-bar-copy` على العنوان، وهو عنصر عنوان بالصنف `hw-mobile-top-bar-title`، وعلى العنوان الفرعي، وهو فقرة بالصنف `hw-mobile-top-bar-subtitle`. ويحتوي عنصر `div` الاختياري بالصنف `hw-mobile-top-bar-actions` على الإجراءات. وليس لرابط الرجوع نص، فيكتب المطوّر الخاصية `aria-label` الخاصة به، وأيقونةً من أيقونات الحزم تحمل `data-directional="true"`، فتعكسها ورقة الأنماط في الصفحات المكتوبة من اليمين إلى اليسار. وتكبّر الخاصية `data-variant="main"` العنوان؛ ودونها يكون للشريط مظهر الصفحة الداخلية.

### React

جدول: خصائص MobileTopBar

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `title` | `ReactNode` | `true` | — |
| `subtitle` | `ReactNode` | `false` | — |
| `variant` | `'main' \| 'internal'` | `false` | `'internal'` |
| `headingLevel` | `1 \| 2 \| 3` | `false` | `1` |
| `leading` | `ReactNode` | `false` | — |
| `actions` | `ReactNode` | `false` | — |
| `backHref` | `string` | `false` | — |
| `backLabel` | `string` | `false` | — |

يُعرض العنوان في عنصر العنوان الذي تحدّده الخاصية `headingLevel`، وتُعرض الخاصية `subtitle` تحته. وعند كتابة `backHref` يعرض الشريط رابط رجوع، وتكون الخاصية `backLabel`، المطلوبة في هذه الحالة، اسمه الميسّر. وتحلّ الخاصية `leading` محلّ رابط الرجوع. ولا تُعرض منطقة البداية إلا عند تمرير `leading` أو `backHref`، ولا تُعرض منطقة الإجراءات إلا عند تمرير `actions`. وتُعرض العناصر الأبناء الأخرى بعد الإجراءات. وتُكتب الخاصية `variant` في `data-variant` على الترويسة في كل حالة، ومنها القيمة الافتراضية `'internal'`. ولا يفترض الشريط أي سجل تصفّح: فالتطبيق يتولّى وجهة رابط الرجوع.

### Vue

جدول: خصائص MobileTopBar وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `title` | prop | `string` | `true` | — |
| `subtitle` | prop | `string` | `false` | — |
| `variant` | prop | `'main' \| 'internal'` | `false` | `'internal'` |
| `headingLevel` | prop | `1 \| 2 \| 3` | `false` | `1` |
| `backHref` | prop | `string` | `false` | — |
| `backLabel` | prop | `string` | `false` | — |
| `leading` | slot | — | `false` | — |
| `title` | slot | — | `false` | — |
| `subtitle` | slot | — | `false` | — |
| `actions` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |

يحلّ المنفذان `title` و`subtitle` محلّ الخاصيتين اللتين تحملان الاسمين نفسيهما. وعند كتابة `backHref` يعرض الشريط رابط رجوع، والخاصية `backLabel` مطلوبة في هذه الحالة؛ ويحلّ المنفذ `leading` محلّ الرابط. ولا تُعرض منطقة البداية إلا عند توفير المنفذ `leading` أو `backHref`، ولا تُعرض منطقة الإجراءات إلا عند توفير المنفذ `actions`. ويُعرض المنفذ الافتراضي بعد الإجراءات، ابنًا مباشرًا للترويسة. وتُكتب الخاصية `variant` في `data-variant` على الترويسة في كل حالة، ومنها القيمة الافتراضية `'internal'`.

### Angular

جدول: مُدخلات hw-mobile-top-bar ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `title` | input | `string` | `true` | — |
| `subtitle` | input | `string` | `false` | `''` |
| `variant` | input | `'main' \| 'internal'` | `false` | `'internal'` |
| `headingLevel` | input | `1 \| 2 \| 3` | `false` | `1` |
| `backHref` | input | `string` | `false` | `''` |
| `backLabel` | input | `string` | `false` | `''` |
| `[hwTopBarLeading]` | content | — | `false` | — |
| `[hwTopBarActions]` | content | — | `false` | — |

يُطبَّق `HwMobileTopBarComponent` على `hw-mobile-top-bar`، ويعرض عنصر `header` بالصنف `hw-mobile-top-bar`. وعند كتابة `backHref` غير فارغ يعرض الشريط رابط رجوع، والمُدخل `backLabel` مطلوب في هذه الحالة؛ ويحلّ المحتوى الذي يحمل `hwTopBarLeading` محلّ الرابط. ويملأ المحتوى الذي يحمل `hwTopBarActions` منطقة الإجراءات. وتُعرض منطقتا البداية والإجراءات دائمًا، وتكونان فارغتين عندما لا يملؤهما شيء؛ وتخفي ورقة الأنماط المنطقة الفارغة. ويُكتب المُدخل `variant` في `data-variant` على الترويسة في كل حالة، ومنها القيمة الافتراضية `'internal'`.

## إمكانية الوصول

تعرض الترويسة العلوية للجوال عنصر `header` أصليًا، عنوانه عنصر عنوان وعنوانه الفرعي فقرة. وليس الشريط بكامله عنصرًا تفاعليًا: فرابط الرجوع وعنصر التحكم في منطقة البداية والإجراءات روابط وأزرار أصلية، فيكون استخدام لوحة المفاتيح والتفعيل بحسب تلك العناصر. وترتيب الترميز هو ترتيب التركيز: عنصر التحكم في منطقة البداية، ثم الإجراءات.

- رابط الرجوع عنصر `a` لا يحتوي إلا على أيقونة مخفية عن التقنيات المساعدة، فتكون `backLabel` اسمه الميسّر. اكتب اسمًا يذكر وجهته، مثل «العودة إلى الطلبات»، لا «رجوع».
- امنح الإجراء أو عنصر التحكم في منطقة البداية الذي يقتصر على أيقونة اسمًا ميسّرًا خاصًا به، كما تفعل الأمثلة بالخاصية `aria-label`. فالشريط لا يضيف أي اسم.
- العنوان عنصر `h1` ما لم تحدّد `headingLevel` غير ذلك. اختر المستوى بحسب الصفحة التي تحيط بالشريط، ليبقى في الصفحة عنوان واحد من المستوى الأول.
- لا يقلّ حجم هدف كل إجراء عن 44 px، ويحتفظ الرابط أو الزر الذي عليه التركيز بإطار ظاهر، وكذلك في وضع الألوان القسرية.
- لا يضيف الشريط أي حركة ولا أي سلوك يتعلق بسجل التصفّح: فهو لا يستدعي سجل التصفّح في المتصفح أبدًا، ورابط الرجوع رابط عادي.

> [!NOTE]
> لا يكون عنصر `header` معلَم الترويسة العامة (banner) إلا إذا لم يقع داخل عنصر `article` أو `aside` أو `main` أو `nav` أو `section`. ضع الشريط ليكون الترويسة العامة للصفحة أو كتلة العنوان لمحتواها، بحسب ما تتطلبه بنية التطبيق.

## الاتجاه والتوطين

ليس في الترويسة العلوية للجوال نص مدمج: يكتب التطبيق العنوان والعنوان الفرعي واسم رابط الرجوع ونص الإجراءات بلغة الصفحة.

- تقع منطقة البداية في جهة بدء القراءة والإجراءات في جهة نهايتها، بحسب اتجاه الصفحة، فينعكس الشريط في الصفحات المكتوبة من اليمين إلى اليسار دون أي إعداد.
- يشير سهم رابط الرجوع إلى جهة الانتقال: فورقة الأنماط تعكس الأيقونة التي تحمل `data-directional` في الصفحات المكتوبة من اليمين إلى اليسار.
- تلتفّ العناوين والعناوين الفرعية الطويلة بدلًا من أن تُقتطع، وتنتقل الإجراءات إلى سطر تحت العنوان عندما يضيق العرض.
- اكتب قيمة `backLabel` بلغة الصفحة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط الترويسة العلوية للجوال بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تُدرج الترويسة العلوية للجوال في الصف Platform patterns من نطاق المكوّنات في [ملاحظات التغطية](../coverage.md).
- تكتب [ملاحظات الترويسة العلوية للجوال](../mobile-top-bar.md) ربط أدوار العنوان في مجموعة الترويسة العلوية للجوال، والحد الأدنى الذاتي للارتفاع البالغ 60 px، والأهداف بحجم 44 px، والحشوة الخاصة بالمنطقة الآمنة، مع التكييفات التي تُحدثها هذه الخيارات. وتذكر الملاحظات أن هذا الربط لا يدّعي تطابق العرض مع المصدر.
