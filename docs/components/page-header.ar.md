---
source:
  summary: 65aced75bc6c
  example: f1f5d373ec49
  variants-and-states: d14c78f8c219
  api: 750bef56db7d
  accessibility: dfbeb3118d05
  rtl-and-localisation: b6b486790979
  platforms-code-reference: 204668c7649c
---
# عنوان الصفحة

يفتتح مكوّن عنوان الصفحة صفحةً أو قسمًا بعنوانه، مع وصف اختياري ومسار تنقل اختياري ومجموعة إجراءات اختيارية. والعنوان عنصر عنوان يختار التطبيق مستواه، ويتولّى التطبيق كل النصوص وكل الإجراءات.

## مثال

يسمّي العنوانُ الصفحة، ويذكر الوصف ما يستطيع القارئ فعله فيها. ويقع الإجراء الوحيد في نهاية صف العنوان، وينتقل إلى سطر تحته عندما يضيق الصف.

```html live example=basic frame
<header class="hw-page-header">
  <div class="hw-page-header-main">
    <div><h1>طلبات الخدمات</h1><p>راجع الطلبات التي قدّمتها، وابدأ طلبًا جديدًا.</p></div>
    <div class="hw-page-header-actions"><button class="hw-button" type="button" data-variant="primary" data-size="md">طلب جديد</button></div>
  </div>
</header>
```

```tsx live example=basic
<PageHeader
  title="طلبات الخدمات"
  description="راجع الطلبات التي قدّمتها، وابدأ طلبًا جديدًا."
  actions={<Button variant="primary">طلب جديد</Button>}
/>
```

```vue live example=basic
<PageHeader title="طلبات الخدمات" description="راجع الطلبات التي قدّمتها، وابدأ طلبًا جديدًا.">
  <template #actions><Button variant="primary">طلب جديد</Button></template>
</PageHeader>
```

```ts live example=basic framework=angular
template: `<hw-page-header title="طلبات الخدمات" description="راجع الطلبات التي قدّمتها، وابدأ طلبًا جديدًا.">
  <button hwButton variant="primary">طلب جديد</button>
</hw-page-header>`
```

## الأشكال والحالات

### مسار التنقل

يقع مسار التنقل فوق صف العنوان ويشغل العرض كله. ويوفّره التطبيق بالمكوّن Breadcrumb، الذي يسمّي معلَمه ويميّز الصفحة الحالية.

```html live example=breadcrumb frame
<header class="hw-page-header">
  <nav class="hw-breadcrumb" aria-label="مسار التنقل"><ol><li><a href="/services">الخدمات</a></li><li><a href="/services/requests">الطلبات</a></li><li><span aria-current="page">الطلب SR-2041</span></li></ol></nav>
  <div class="hw-page-header-main">
    <div><h1>الطلب SR-2041</h1><p>قُدّم في 4 مارس. والطلب قيد المراجعة.</p></div>
    <div class="hw-page-header-actions"><button class="hw-button" type="button" data-variant="secondary" data-size="md">تنزيل الملخص</button></div>
  </div>
</header>
```

```tsx live example=breadcrumb
<PageHeader
  title="الطلب SR-2041"
  description="قُدّم في 4 مارس. والطلب قيد المراجعة."
  breadcrumb={
    <Breadcrumb
      label="مسار التنقل"
      items={[
        { label: 'الخدمات', href: '/services' },
        { label: 'الطلبات', href: '/services/requests' },
        { label: 'الطلب SR-2041' },
      ]}
    />
  }
  actions={<Button variant="secondary">تنزيل الملخص</Button>}
/>
```

```vue live example=breadcrumb
<PageHeader title="الطلب SR-2041" description="قُدّم في 4 مارس. والطلب قيد المراجعة.">
  <template #breadcrumb>
    <Breadcrumb
      label="مسار التنقل"
      :items="[
        { label: 'الخدمات', href: '/services' },
        { label: 'الطلبات', href: '/services/requests' },
        { label: 'الطلب SR-2041' },
      ]"
    />
  </template>
  <template #actions><Button variant="secondary">تنزيل الملخص</Button></template>
</PageHeader>
```

```ts live example=breadcrumb framework=angular
template: `<hw-page-header title="الطلب SR-2041" description="قُدّم في 4 مارس. والطلب قيد المراجعة.">
  <hw-breadcrumb
    hwBreadcrumb
    label="مسار التنقل"
    [items]="[
      { label: 'الخدمات', href: '/services' },
      { label: 'الطلبات', href: '/services/requests' },
      { label: 'الطلب SR-2041' },
    ]"
  />
  <button hwButton variant="secondary">تنزيل الملخص</button>
</hw-page-header>`
```

### مستوى العنوان

العنوان عنصر `h1` افتراضيًا. ويأخذ مكوّن عنوان الصفحة الموضوع في صفحة لها عنصر `h1` مستوى أدنى، ليبقى في الصفحة عنوان واحد من المستوى الأول وترتيب للعناوين بلا فجوات. ولا يغيّر المستوى إلا العنصر، ويحتفظ العنوان بحجمه.

```html live example=level
<header class="hw-page-header">
  <div class="hw-page-header-main">
    <div><h2>المستندات المقدّمة</h2><p>المستندات المرفقة بهذا الطلب.</p></div>
    <div class="hw-page-header-actions"><button class="hw-button" type="button" data-variant="secondary" data-size="md">إضافة مستند</button></div>
  </div>
</header>
```

```tsx live example=level
<PageHeader
  level={2}
  title="المستندات المقدّمة"
  description="المستندات المرفقة بهذا الطلب."
  actions={<Button variant="secondary">إضافة مستند</Button>}
/>
```

```vue live example=level
<PageHeader :level="2" title="المستندات المقدّمة" description="المستندات المرفقة بهذا الطلب.">
  <template #actions><Button variant="secondary">إضافة مستند</Button></template>
</PageHeader>
```

```ts live example=level framework=angular
template: `<hw-page-header [level]="2" title="المستندات المقدّمة" description="المستندات المرفقة بهذا الطلب.">
  <button hwButton variant="secondary">إضافة مستند</button>
</hw-page-header>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-page-header

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-page-header'` | `true` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس لمكوّن عنوان الصفحة متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر `header` بالصنف `hw-page-header`. ومسار التنقل، إن وُجد، هو أول أبنائه. وصف العنوان عنصر `div` بالصنف `hw-page-header-main` يحتوي على عنصر `div` فيه عنصر العنوان وفقرة الوصف، وعلى عنصر `div` بالصنف `hw-page-header-actions` للإجراءات. ويمكن أن يحمل عنصر `div` الذي فيه العنوان الصنف `hw-page-header-content`، وتمنحه ورقة الأنماط القاعدة نفسها التي تمنحها لعنصر `div` الأول دونه. ويختار المطوّر عنصر العنوان، من `h1` إلى `h6`؛ وتمنح ورقة الأنماط العنوان الحجم نفسه في كل مستوى.

### React

جدول: خصائص PageHeader

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `title` | `ReactNode` | `true` | — |
| `description` | `ReactNode` | `false` | — |
| `breadcrumb` | `ReactNode` | `false` | — |
| `actions` | `ReactNode` | `false` | — |
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `false` | `1` |

الخاصية `title` مطلوبة، ويُعرض العنوان في عنصر العنوان الذي تحدّده الخاصية `level`. وتأخذ `level` قيمة من 1 إلى 6، وقيمتها الافتراضية `1`؛ وتُقتطع القيمة الخارجة عن هذا النطاق إلى عدد صحيح وتُحصر فيه. ويُعرض الوصف فقرةً تحت العنوان. وتُعرض الخاصية `breadcrumb` قبل صف العنوان، وتُعرض الخاصية `actions` في عنصر `div` بالصنف `hw-page-header-actions` لا يوجد إلا عند تمرير `actions`. وتُعرض العناصر الأبناء داخل كتلة العنوان، بعد الوصف. ويعرض المكوّن عنصر `header` ويمرّر إليه خصائص المكوّن الأخرى.

### Vue

جدول: خصائص PageHeader وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `title` | prop | `string` | `false` | — |
| `description` | prop | `string` | `false` | — |
| `level` | prop | `number` | `false` | `1` |
| `as` | prop | `string` | `false` | `'div'` |
| `gap` | prop | `LayoutProps['gap']` | `false` | — |
| `padding` | prop | `LayoutProps['padding']` | `false` | — |
| `align` | prop | `'center' \| 'start' \| 'end' \| 'stretch' \| 'baseline'` | `false` | — |
| `justify` | prop | `'center' \| 'start' \| 'end' \| 'between' \| 'around' \| 'evenly'` | `false` | — |
| `wrap` | prop | `boolean` | `false` | — |
| `columns` | prop | `LayoutProps['columns']` | `false` | — |
| `minItemWidth` | prop | `string` | `false` | — |
| `side` | prop | `'start' \| 'end'` | `false` | `'start'` |
| `sidebarWidth` | prop | `string` | `false` | — |
| `collapseAt` | prop | `'md' \| 'sm' \| 'lg'` | `false` | `'md'` |
| `maxWidth` | prop | `string` | `false` | — |
| `ratio` | prop | `number` | `false` | — |
| `breadcrumb` | slot | — | `false` | — |
| `title` | slot | — | `false` | — |
| `actions` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |

الخاصية `title` مطلوبة، إلا إذا وفّر المنفذ `title` محتوى العنوان؛ فالمنفذ يحلّ محلّ الخاصية. وتعرض الخاصية `level` العنوان في عنصر العنوان المطابق لها، من 1 إلى 6، وتُقتطع القيمة الكسرية أو الخارجة عن النطاق إلى عدد صحيح وتُحصر فيه. ويُعرض المنفذ `breadcrumb` قبل صف العنوان، ويُعرض المنفذ `actions` في عنصر `div` بالصنف `hw-page-header-actions` لا يوجد إلا عند توفير المنفذ. ويُعرض المنفذ الافتراضي بعد صف العنوان، ابنًا مباشرًا للترويسة. وتُكتب خصائص التخطيط خصائصَ CSS مخصّصة للتخطيط على الترويسة، ولا تقرأ ورقة الأنماط منها في الترويسة إلا `gap` و`align` و`justify` و`wrap`؛ فلا أثر فيها لـ`padding` و`columns` و`minItemWidth` و`sidebarWidth` و`maxWidth` و`ratio`. ولا تُكتب `side` و`collapseAt` أصلًا، وتُتجاهل `as`: فالعنصر الخارجي دائمًا عنصر `header`.

### Angular

جدول: مُدخلات hw-page-header ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `gap` | input | `Responsive<LayoutSpacing>` | `false` | — |
| `padding` | input | `Responsive<LayoutSpacing>` | `false` | — |
| `align` | input | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | `false` | — |
| `justify` | input | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | `false` | — |
| `wrap` | input | `boolean` | `false` | — |
| `columns` | input | `Responsive<number>` | `false` | — |
| `minItemWidth` | input | `string` | `false` | — |
| `maxWidth` | input | `string` | `false` | — |
| `sidebarWidth` | input | `string` | `false` | — |
| `ratio` | input | `number` | `false` | — |
| `title` | input | `string` | `true` | — |
| `description` | input | `string` | `false` | `''` |
| `level` | input | `number` | `false` | `1` |
| `[hwBreadcrumb]` | content | — | `false` | — |
| `*` | content | — | `false` | — |

يُطبَّق `HwPageHeaderComponent` على `hw-page-header`، ويحيط عنصره المضيف بعنصر `header` بالصنف `hw-page-header`، لأن العنصر المضيف لا يمكن أن يكون عنصر `header`. والمُدخل `title` مطلوب، ويُعرض في عنصر العنوان الذي يختاره المُدخل `level`، الذي يأخذ قيمة من 1 إلى 6، وقيمته الافتراضية `1`، وتُقتطع قيمته إلى عدد صحيح وتُحصر في هذا النطاق. ويُعرض `description` فقرةً عندما لا يكون فارغًا. ويُعرض المحتوى الذي يحمل `hwBreadcrumb` قبل صف العنوان، ويُعرض كل محتوى مُسقَط آخر إجراءاتٍ، في عنصر `div` بالصنف `hw-page-header-actions` موجود دائمًا: فيكون فارغًا عندما لا يُسقَط أي إجراء. وتُكتب مُدخلات التخطيط خصائصَ CSS مخصّصة للتخطيط على الترويسة، ولا تقرأ ورقة الأنماط منها في الترويسة إلا `gap` و`align` و`justify` و`wrap`؛ فلا أثر فيها لمُدخلات التخطيط الأخرى.

## إمكانية الوصول

يعرض مكوّن عنوان الصفحة عنصر `header` أصليًا فيه العنوان في عنصر عنوان، تليه فقرة الوصف ثم الإجراءات. ولا شيء فيه تفاعلي: فمسار التنقل أو الرابط أو الزر الذي يضعه التطبيق فيه يحتفظ بسلوكه الخاص مع لوحة المفاتيح وباسمه الميسّر.

- استخدم عنصر `h1` واحدًا في كل صفحة. ويُبقي أولُ مكوّن عنوان صفحة فيها `level` على `1`، ويأخذ المكوّن الذي يقدّم قسمًا تحته `2` أو مستوى أدنى، فلا تكون في ترتيب العناوين فجوة.
- يأتي مسار التنقل أولًا في ترتيب الترميز، وتأتي الإجراءات أخيرًا، فيتبع ترتيبُ التركيز ترتيبَ القراءة. وينقل التخطيط الإجراءات إلى سطر تحت العنوان، ولا يغيّر ترتيبها أبدًا.
- سمِّ مسار التنقل عبر `label` في المكوّن Breadcrumb: فمسار التنقل معلَم `nav`، وبنده الحالي نص يحمل الخاصية `aria-current="page"`.
- امنح الإجراء الذي يقتصر على أيقونة اسمًا ميسّرًا خاصًا به، فمكوّن عنوان الصفحة لا يضيف أي اسم.
- الوصف فقرة، وليس جزءًا من عنصر العنوان. اجعل العنوان قصيرًا بقدر ما يكفي لتسمية الصفحة، وضع التفاصيل في الوصف.

> [!NOTE]
> لا يكون عنصر `header` معلَم الترويسة العامة (banner) إلا إذا لم يقع داخل عنصر `article` أو `aside` أو `main` أو `nav` أو `section`. ومعلَم الترويسة العامة في البوابة يعود إلى ترويسة المنصة، لا إلى مكوّن عنوان الصفحة.

## الاتجاه والتوطين

ليس في مكوّن عنوان الصفحة نص مدمج: يكتب التطبيق العنوان والوصف ونص الإجراءات بلغة الصفحة.

- تقع كتلة العنوان في جهة بدء القراءة والإجراءات في جهة نهايتها، بحسب اتجاه الصفحة، فينعكس الصف في الصفحات المكتوبة من اليمين إلى اليسار دون أي إعداد.
- يقتصر عرض الوصف على طول سطر مريح للقراءة، ويلتفّ نصه. وتنقل نصوص الإجراءات العربية الطويلة الإجراءات إلى سطر تحت العنوان بدلًا من أن تتجاوز حدود الصف، فلا تمنح أي إجراء عرضًا ثابتًا.
- يأخذ مسار التنقل، عند توفيره، اتجاه الصفحة مثل بقية الترويسة؛ ويكتب التطبيق تسميات بنوده بلغة الصفحة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط مكوّن عنوان الصفحة بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- يُدرج مكوّن عنوان الصفحة في الصف Layout من نطاق المكوّنات في [ملاحظات التغطية](../coverage.md)، لا في الصف Platform patterns.
- تصف [ملاحظات التخطيط](../layout.md) بنية الترويسة، بصفّها الرئيسي ومحتواها وإجراءاتها، وسلوك الإجراءات في العروض الضيقة.
