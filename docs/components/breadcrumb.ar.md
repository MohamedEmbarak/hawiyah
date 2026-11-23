---
source:
  summary: 99c6b17008e1
  example: 3ea001535550
  variants-and-states: 6becb072e31a
  api: 74f1b9a2736e
  accessibility: 5b34db104aa6
  rtl-and-localisation: 76ce56060aa0
  platforms-code-reference: 01db454c9aba
---
# مسار التنقل

مسار التنقل معلَم تنقل يسرد الصفحات الواقعة بين بداية بوابة الخدمات والصفحة التي يقف عليها القارئ. والصفحة التي يقف عليها القارئ نص يحمل الخاصية `aria-current="page"`، والبنود التي تعلوها في المسار روابط.

## مثال

للمعلَم اسم، والبند الأخير هو الصفحة الحالية. وتؤدي البنود السابقة إلى الصفحات التي تعلوها في المسار.

```html live example=basic
<nav class="hw-breadcrumb" aria-label="مسار التنقل">
  <ol>
    <li><a href="/">الرئيسية</a></li>
    <li><a href="/requests">الطلبات</a></li>
    <li><span aria-current="page">الطلب 2041</span></li>
  </ol>
</nav>
```

```tsx live example=basic
<Breadcrumb
  label="مسار التنقل"
  items={[
    { label: 'الرئيسية', href: '/' },
    { label: 'الطلبات', href: '/requests' },
    { label: 'الطلب 2041' },
  ]}
/>
```

```vue live example=basic
<Breadcrumb
  label="مسار التنقل"
  :items="[
    { label: 'الرئيسية', href: '/' },
    { label: 'الطلبات', href: '/requests' },
    { label: 'الطلب 2041' },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-breadcrumb
  label="مسار التنقل"
  [items]="[
    { label: 'الرئيسية', href: '/' },
    { label: 'الطلبات', href: '/requests' },
    { label: 'الطلب 2041' },
  ]"
/>`
```

## الأشكال والحالات

### بند حالي مختار

يختار الحقل `current` بالقيمة `true` في أحد البنود الصفحةَ الحالية. ودونه يكون البند الأخير هو البند الحالي. والبند الذي يلي البند الحالي نص لا رابط، لأنه لا يحمل `href`.

```html live example=current
<nav class="hw-breadcrumb" aria-label="مسار التنقل">
  <ol>
    <li><a href="/">الرئيسية</a></li>
    <li><span aria-current="page">الطلبات</span></li>
    <li><span>الطلب 2041</span></li>
  </ol>
</nav>
```

```tsx live example=current
<Breadcrumb
  label="مسار التنقل"
  items={[
    { label: 'الرئيسية', href: '/' },
    { label: 'الطلبات', href: '/requests', current: true },
    { label: 'الطلب 2041' },
  ]}
/>
```

```vue live example=current
<Breadcrumb
  label="مسار التنقل"
  :items="[
    { label: 'الرئيسية', href: '/' },
    { label: 'الطلبات', href: '/requests', current: true },
    { label: 'الطلب 2041' },
  ]"
/>
```

```ts live example=current framework=angular
template: `<hw-breadcrumb
  label="مسار التنقل"
  [items]="[
    { label: 'الرئيسية', href: '/' },
    { label: 'الطلبات', href: '/requests', current: true },
    { label: 'الطلب 2041' },
  ]"
/>`
```

### بند معطَّل

ليس للبند المعطَّل وجهة. ويُعرض نصًا بالدور `link` مع الخاصية `aria-disabled="true"`، ولا يدخل في ترتيب التنقل بالمفتاح Tab.

```html live example=disabled
<nav class="hw-breadcrumb" aria-label="مسار التنقل">
  <ol>
    <li><a href="/">الرئيسية</a></li>
    <li><span role="link" aria-disabled="true">الأرشيف</span></li>
    <li><span aria-current="page">الطلب 2041</span></li>
  </ol>
</nav>
```

```tsx live example=disabled
<Breadcrumb
  label="مسار التنقل"
  items={[
    { label: 'الرئيسية', href: '/' },
    { label: 'الأرشيف', href: '/archive', disabled: true },
    { label: 'الطلب 2041' },
  ]}
/>
```

```vue live example=disabled
<Breadcrumb
  label="مسار التنقل"
  :items="[
    { label: 'الرئيسية', href: '/' },
    { label: 'الأرشيف', href: '/archive', disabled: true },
    { label: 'الطلب 2041' },
  ]"
/>
```

```ts live example=disabled framework=angular
template: `<hw-breadcrumb
  label="مسار التنقل"
  [items]="[
    { label: 'الرئيسية', href: '/' },
    { label: 'الأرشيف', href: '/archive', disabled: true },
    { label: 'الطلب 2041' },
  ]"
/>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-breadcrumb

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-breadcrumb'` | `true` | — |
| `aria-current` | `'page'` | `false` | — |

ليس لمسار التنقل متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر `nav` بالصنف `hw-breadcrumb` له اسم من الخاصية `aria-label` أو `aria-labelledby`، وداخله عنصر `ol` فيه عنصر `li` لكل بند. والبند السابق عنصر `a` يحمل `href`؛ والبند الحالي عنصر `span` يحمل `aria-current="page"`، وليس رابطًا. وترسم ورقة الأنماط الفاصل بين البنود، فلا تكتب أي فاصل.

### React

جدول: خصائص Breadcrumb

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `items` | `readonly BreadcrumbItem[]` | `true` | — |
| `label` | `string` | `false` | — |

لكل بند من `items` الحقل `label`، والحقول الاختيارية `href` و`current` و`disabled`. والبند الحالي هو أول بند يحمل `current`، وإلا فالبند الأخير؛ ويُعرض عنصرَ `span` يحمل `aria-current="page"`، ولا يُعرض رابطًا أبدًا، حتى عندما يحمل `href`. ويُعرض البند الذي يحمل `href` رابطًا إذا لم يكن حاليًا ولا معطَّلًا، ويُعرض أي بند آخر نصًا. ويُعرض البند المعطَّل عنصرَ `span` بالدور `link` مع `aria-disabled`، دون `href`. ويُسمّى المعلَم بالخاصية `label`، أو بالخاصية `aria-label` أو `aria-labelledby`.

### Vue

جدول: خصائص Breadcrumb وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly BreadcrumbItem[]` | `true` | — |
| `label` | prop | `string` | `false` | — |

لبنود الخاصية `items` الحقول نفسها التي لها في React، والحقل `label` فيها سلسلة نصية. والبند الحالي هو أول بند قيمة `current` فيه `true`، وإلا فالبند الأخير، ويُعرض نصًا يحمل `aria-current="page"`. ويُعرض البند المعطَّل عنصرَ `span` بالدور `link` مع `aria-disabled`. ويُسمّى المعلَم بالخاصية `label`، أو بالخاصية `aria-label` أو `aria-labelledby` المكتوبة على المكوّن. ولا يعرّف المكوّن أي منفذ.

### Angular

جدول: مُدخلات hw-breadcrumb ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `items` | input | `readonly HwBreadcrumbItem[]` | `false` | `[]` |

يُطبَّق `HwBreadcrumbComponent` على `hw-breadcrumb`. ويأخذ المُدخل `items` كائنات فيها الحقل `label`، والحقول الاختيارية `href` و`current` و`disabled`. والبند الحالي هو أول بند قيمة `current` فيه `true`، وإلا فالبند الأخير، ويُعرض عنصرَ `span` يحمل `aria-current="page"`. والمُدخل `label` مطلوب ما لم تُكتب الخاصية `aria-label` أو `aria-labelledby` على `hw-breadcrumb`؛ وتُمرَّر هاتان الخاصيتان إلى عنصر `nav`، ولا تبقيان على العنصر المضيف. وتُمرَّر الخاصية `aria-describedby` إلى عنصر `nav` بالطريقة نفسها.

## إمكانية الوصول

يعرض مسار التنقل عنصر `nav`، فيوفّر المتصفح معلَم تنقل، والقائمة داخله قائمة مرتّبة بترتيب القراءة. ويحتاج المعلَم إلى اسم يميّزه من معالم التنقل الأخرى في الصفحة.

- البند الحالي نص يحمل `aria-current="page"` في كل المحوّلات. وليس رابطًا ولا يدخل في ترتيب التنقل بالمفتاح Tab، فينتقل التركيز من لوحة المفاتيح بين البنود الأخرى التي تحمل `href` وليست حالية ولا معطَّلة.
- ليس للبند المعطَّل `href`، ولا يقبل التركيز. ويحتفظ بالدور `link` مع `aria-disabled="true"`، لتُبلغ التقنيات المساعدة عن وجهة غير متاحة.
- ترسم ورقة الأنماط الفاصل محتوى مولَّدًا. وهو في السمة الافتراضية وفي سمة كود المنصات شكل سهم زاوي فارغ لا نص فيه؛ وعند ضبط `data-hw-theme="hawiyah"` يكون الحرف `/`، الذي تولّده ورقة الأنماط ويمكن أن تقرأه التقنيات المساعدة.
- تلغي ورقة الأنماط الانتقال اللوني للروابط عندما يطلب القارئ تقليل الحركة.
- اكتب نص رابط يسمّي الصفحة، مثل «الطلبات»، لأن من يتصفّح قائمة الروابط يصادف البنود دون المسار المحيط بها.

## الاتجاه والتوطين

ليس في مسار التنقل نص مدمج. يكتب التطبيق اسم المعلَم وتسمية كل بند بلغة الصفحة، وترتيب `items` هو ترتيب القراءة، من بداية البوابة إلى الصفحة الحالية.

- تتبع القائمة اتجاه الصفحة: يقع البند الأول في جهة بدء القراءة، فيمتد المسار في العربية من اليمين إلى اليسار.
- الفاصل بين البنود سهم زاوي ينقلب مع اتجاه الصفحة. ولا ترسم ورقة الأنماط شرطة مائلة بدلًا منه إلا عند ضبط `data-hw-theme="hawiyah"`، وهي لوحة الألوان الأصلية.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط مسار التنقل بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات الروابط ومسار التنقل](../nic-links.md) حجم مسار التنقل، والمسافة بين بنوده، والانتقال اللوني، والحالات المحايدة، والفاصل، الواردة في ورقة أنماط كود المنصات المزوَّدة، وتذكر درجة الثقة في كل ربط.
- الفاصل شكل مرسوم بخصائص CSS لا رمز من خط أيقونات، لأن الرموز الخاصة بالمصدر غير مضمّنة في الحزم؛ وهذا التكييف والألوان البديلة لتحقيق التباين موثّقة في [ملاحظات الروابط ومسار التنقل](../nic-links.md).
