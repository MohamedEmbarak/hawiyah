---
source:
  summary: f0075f69c524
  example: 8445f88fdcf7
  variants-and-states: 795fa2be0074
  api: 698ba186ef89
  accessibility: 87c065f978d0
  rtl-and-localisation: fa4325aa21c3
  platforms-code-reference: 20a031aa1b71
---
# شارة

الشارة تسمية ثابتة صغيرة تذكر حالة أو تصنيفًا قصيرًا بجانب محتوى آخر. ويحمل نصها معناها؛ ويضيف اللون الدلالي إبرازًا، ولا يحلّ أبدًا محلّ الكلمات.

## مثال

يعرض المثال شارة واحدة منفردة؛ وفي الصفحة تقع الشارة بجانب البند الذي تصفه. ويذكر نصها الحالة بالكلمات، فتصل الرسالة إلى القارئ الذي لا يستطيع تمييز اللون.

```html live example=basic static
<span class="hw-badge" data-tone="success">مكتمل</span>
```

```tsx live example=basic
<Badge tone="success">مكتمل</Badge>
```

```vue live example=basic
<Badge tone="success">مكتمل</Badge>
```

```ts live example=basic framework=angular
template: `<hw-badge tone="success">مكتمل</hw-badge>`
```

## الأشكال والحالات

### الألوان الدلالية

تقبل الخاصية `tone` القيمة `neutral` أو `success` أو `warning` أو `danger` أو `info`. اختر اللون الدلالي بحسب نوع الحالة، واجعل النص محدَّدًا: فعبارة «مطلوب إجراء» تقول أكثر من «تحذير». وتقع مجموعة الشارات في عنصر بالصنف `hw-badges`، ينقل الشارات إلى سطر جديد عند الحاجة ويوزّع المسافات بينها بالتساوي.

```html live example=tones static
<div class="hw-badges">
  <span class="hw-badge" data-tone="neutral">مسودة</span>
  <span class="hw-badge" data-tone="info">قيد المراجعة</span>
  <span class="hw-badge" data-tone="success">مكتمل</span>
  <span class="hw-badge" data-tone="warning">مطلوب إجراء</span>
  <span class="hw-badge" data-tone="danger">مرفوض</span>
</div>
```

```tsx live example=tones
<div className="hw-badges">
  <Badge tone="neutral">مسودة</Badge>
  <Badge tone="info">قيد المراجعة</Badge>
  <Badge tone="success">مكتمل</Badge>
  <Badge tone="warning">مطلوب إجراء</Badge>
  <Badge tone="danger">مرفوض</Badge>
</div>
```

```vue live example=tones
<div class="hw-badges">
  <Badge tone="neutral">مسودة</Badge>
  <Badge tone="info">قيد المراجعة</Badge>
  <Badge tone="success">مكتمل</Badge>
  <Badge tone="warning">مطلوب إجراء</Badge>
  <Badge tone="danger">مرفوض</Badge>
</div>
```

```ts live example=tones framework=angular
template: `<div class="hw-badges">
  <hw-badge tone="neutral">مسودة</hw-badge>
  <hw-badge tone="info">قيد المراجعة</hw-badge>
  <hw-badge tone="success">مكتمل</hw-badge>
  <hw-badge tone="warning">مطلوب إجراء</hw-badge>
  <hw-badge tone="danger">مرفوض</hw-badge>
</div>`
```

### الإطار والنقطة

تغيّر الخاصية `variant` مظهر الشارة. والشكل `soft` هو المظهر الافتراضي: تقبله React وVue وAngular باسمه، ولا يكتب له ترميز vanilla أي خاصية. وللشكل `outline` خلفية شفافة وإطار باللون الحالي. ويضيف الشكل `dot` نقطة صغيرة قبل النص، وهي زخرفية: فالنص هو الذي يحمل الحالة.

```html live example=variants static
<div class="hw-badges">
  <span class="hw-badge" data-tone="info" data-variant="outline">قيد المراجعة</span>
  <span class="hw-badge" data-tone="success" data-variant="dot">مكتمل</span>
</div>
```

```tsx live example=variants
<div className="hw-badges">
  <Badge tone="info" variant="outline">قيد المراجعة</Badge>
  <Badge tone="success" variant="dot">مكتمل</Badge>
</div>
```

```vue live example=variants
<div class="hw-badges">
  <Badge tone="info" variant="outline">قيد المراجعة</Badge>
  <Badge tone="success" variant="dot">مكتمل</Badge>
</div>
```

```ts live example=variants framework=angular
template: `<div class="hw-badges">
  <hw-badge tone="info" variant="outline">قيد المراجعة</hw-badge>
  <hw-badge tone="success" variant="dot">مكتمل</hw-badge>
</div>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-badge

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-badge'` | `true` | — |
| `data-tone` | `'success' \| 'warning' \| 'danger' \| 'info'` | `false` | — |
| `data-variant` | `'outline' \| 'dot'` | `false` | — |

ليس للشارة متحكم في JavaScript، فالترميز هو واجهتها البرمجية: اكتب عنصر `span` بالصنف `hw-badge` يحتوي على النص. والخاصية `data-tone` اختيارية، وتقبل القيمة `success` أو `warning` أو `danger` أو `info`؛ ودونها يكون للشارة المظهر المحايد، وتنصّ عليه الخاصية `data-tone="neutral"` صراحة. والخاصية `data-variant` اختيارية: تغيّر القيمتان `outline` و`dot` المظهر، ودونها يكون للشارة المظهر الافتراضي الخفيف. وأحِط الشارات المتعددة بعنصر بالصنف `hw-badges`.

### React

جدول: خصائص Badge

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `tone` | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `false` | `'neutral'` |
| `variant` | `'soft' \| 'outline' \| 'dot'` | `false` | — |

يعرض Badge عنصر `span` بالصنف `hw-badge`، والعناصر الأبناء هي النص. والقيمة الافتراضية للخاصية `tone` هي `neutral`، وتُكتب في خاصية HTML `data-tone`. وتقبل الخاصية `variant` القيمة `soft` أو `outline` أو `dot`، وتُكتب في خاصية HTML `data-variant`؛ ودونها لا تُكتب أي خاصية، ويكون للشارة المظهر الخفيف. وتصل الخصائص الأخرى، مثل `className`، إلى عنصر `span`.

### Vue

جدول: خصائص Badge وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `tone` | prop | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `false` | `'neutral'` |
| `variant` | prop | `'soft' \| 'outline' \| 'dot'` | `false` | — |
| `default` | slot | — | `false` | — |

يعرض Badge عنصر `span` بالصنف `hw-badge`، والمنفذ الافتراضي هو النص. والقيمة الافتراضية للخاصية `tone` هي `neutral`، وتقبل الخاصية `variant` القيمة `soft` أو `outline` أو `dot`؛ ودون شكل يكون للشارة المظهر الخفيف. وتصل الخصائص الأخرى، مثل `class`، إلى عنصر `span`. ولا يعرّف التصريح المنشور نوع أي منفذ، ويقرأ الإصدار المنشور المنفذ الافتراضي.

### Angular

جدول: مُدخلات hw-badge ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `variant` | input | `'soft' \| 'outline' \| 'dot'` | `false` | — |
| `tone` | input | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `false` | `'neutral'` |
| `*` | content | — | `false` | — |

يُطبَّق `HwBadgeComponent` على `hw-badge`، والعنصر المضيف هو الشارة نفسها: فالصنف `hw-badge`، وأي خاصية `class` أو `id` أو خاصية ARIA تُكتب عليه، تقع على العنصر الذي تنسّقه الأنماط. والقيمة الافتراضية للمُدخل `tone` هي `neutral`، ويقبل المُدخل `variant` القيمة `soft` أو `outline` أو `dot`. والمحتوى المُسقَط هو نص الشارة.

## إمكانية الوصول

الشارة محتوى ثابت. فلا تضيف دورًا، ولا موضع توقف للوحة المفاتيح، ولا منطقة حيّة، ولا أثرًا عند المرور بالمؤشر أو النقر، فتعرضها التقنيات المساعدة نصًا عاديًا.

- لا يحمل اللون وحده الحالة: اكتب الحالة في نص الشارة، واستخدم اللون الدلالي والنقطة للإبراز فقط.
- نقطة الشكل `dot` زخرفية، ولا تُقرأ.
- لا تعلن الشارة أي تغيير. وعندما تتغيّر الحالة في أثناء وجود القارئ في الصفحة، وفّر منطقة حيّة منفصلة تذكر الحالة الجديدة.
- الشارة للعرض فقط. فهي ليست زرًا، وليس لها هدف لمس خاص بها؛ استخدم زرًا أو رابطًا للإجراء.
- ينتقل النص الطويل إلى سطر جديد داخل الحاوية الضيقة، ويزداد ارتفاع الشارة.

## الاتجاه والتوطين

ليس في الشارة نص مدمج: يكتب التطبيق النص بلغة الصفحة، وتتبع الشارة اتجاه الصفحة، فتقع النقطة عند بداية القراءة في العربية وفي الإنجليزية.

- اكتب كلمات الحالة بلغة الصفحة؛ فاللون الدلالي لا يترجمها.
- تنتقل مجموعة الشارات إلى سطر جديد عند الحاجة، وتحتفظ بالمسافة نفسها في اتجاهَي القراءة كليهما.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط الشارة بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات الشارات](../nic-badges.md) أبعاد الشارة، ولوحات الألوان الخمس للألوان الدلالية، وتسمية الحالة ذات النقطة، الواردة في ورقة أنماط كود المنصات المزوَّدة، وتذكر درجة الثقة في كل ربط.
- الشكل ذو الإطار إضافة من هوية، ولوحة ألوان الوضع الداكن تكييف تصفه [ملاحظات الشارات](../nic-badges.md) بأنه مختبَر التباين.
