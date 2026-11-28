---
source:
  summary: d3c0cd0cfa19
  example: 92aa5742b5f1
  variants-and-states: ba62953b416d
  api: 7bb79cf9908c
  accessibility: db002d0b6681
  rtl-and-localisation: 335b08ded5b3
  platforms-code-reference: a633eb89f2bd
---
# خط زمني

يسرد الخط الزمني أحداثًا أو مراحل بترتيبها في قائمة مرتّبة. ولكل بند عنوان، وتاريخ ووصف اختياريان، وحالة اختيارية من complete أو current أو upcoming.

## مثال

تسمّي التسمية القائمة. ولكل بند عنوان، ويُميَّز البند الحالي للتقنيات المساعدة. ويُعرض التاريخ مع قيمته المخصّصة للمعالجة الآلية.

```html live example=basic
<ol class="hw-timeline" aria-label="مراحل طلبك">
  <li class="hw-timeline-item" data-state="complete"><h3>تقديم الطلب</h3><time datetime="2026-03-02">2 مارس 2026</time><p>استُلم الطلب.</p></li>
  <li class="hw-timeline-item" data-state="current" aria-current="step"><h3>قيد المراجعة</h3><time datetime="2026-03-04">4 مارس 2026</time><p>يجري التحقق من المستندات.</p></li>
  <li class="hw-timeline-item"><h3>القرار</h3></li>
</ol>
```

```tsx live example=basic
<Timeline
  label="مراحل طلبك"
  items={[
    { id: 'submitted', title: 'تقديم الطلب', dateTime: '2026-03-02', dateLabel: '2 مارس 2026', description: 'استُلم الطلب.', status: 'complete' },
    { id: 'review', title: 'قيد المراجعة', dateTime: '2026-03-04', dateLabel: '4 مارس 2026', description: 'يجري التحقق من المستندات.', status: 'current' },
    { id: 'decision', title: 'القرار' },
  ]}
/>
```

```vue live example=basic
<Timeline
  label="مراحل طلبك"
  :items="[
    { id: 'submitted', title: 'تقديم الطلب', dateTime: '2026-03-02', dateLabel: '2 مارس 2026', description: 'استُلم الطلب.', status: 'complete' },
    { id: 'review', title: 'قيد المراجعة', dateTime: '2026-03-04', dateLabel: '4 مارس 2026', description: 'يجري التحقق من المستندات.', status: 'current' },
    { id: 'decision', title: 'القرار' },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-timeline
  label="مراحل طلبك"
  [items]="[
    { id: 'submitted', title: 'تقديم الطلب', dateTime: '2026-03-02', dateLabel: '2 مارس 2026', description: 'استُلم الطلب.', status: 'complete' },
    { id: 'review', title: 'قيد المراجعة', dateTime: '2026-03-04', dateLabel: '4 مارس 2026', description: 'يجري التحقق من المستندات.', status: 'current' },
    { id: 'decision', title: 'القرار' },
  ]"
/>`
```

## الأشكال والحالات

### مراحل دون تواريخ

لا يحتاج البند إلى تاريخ أو وصف. ولا يكون أي بند هنا حاليًا، فلا يبيّن اكتمالَ خطوتين إلا العلامة، ولا تصل العلامة إلا إلى القارئ المبصر. وتقرأ التقنيات المساعدة العناوين بترتيبها؛ فعندما يحتاج القارئ إلى معرفة الخطوات المكتملة، اذكر ذلك في العنوان أو الوصف، أو ميّز البند الحالي.

```html live example=stages
<ol class="hw-timeline" aria-label="خطوات تقديم الطلب">
  <li class="hw-timeline-item" data-state="complete"><h3>تعبئة النموذج</h3></li>
  <li class="hw-timeline-item" data-state="complete"><h3>إرفاق المستندات</h3></li>
  <li class="hw-timeline-item"><h3>التأكيد والتقديم</h3></li>
</ol>
```

```tsx live example=stages
<Timeline
  label="خطوات تقديم الطلب"
  items={[
    { id: 'form', title: 'تعبئة النموذج', status: 'complete' },
    { id: 'documents', title: 'إرفاق المستندات', status: 'complete' },
    { id: 'confirm', title: 'التأكيد والتقديم' },
  ]}
/>
```

```vue live example=stages
<Timeline
  label="خطوات تقديم الطلب"
  :items="[
    { id: 'form', title: 'تعبئة النموذج', status: 'complete' },
    { id: 'documents', title: 'إرفاق المستندات', status: 'complete' },
    { id: 'confirm', title: 'التأكيد والتقديم' },
  ]"
/>
```

```ts live example=stages framework=angular
template: `<hw-timeline
  label="خطوات تقديم الطلب"
  [items]="[
    { id: 'form', title: 'تعبئة النموذج', status: 'complete' },
    { id: 'documents', title: 'إرفاق المستندات', status: 'complete' },
    { id: 'confirm', title: 'التأكيد والتقديم' },
  ]"
/>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-timeline

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-timeline'` | `true` | — |

ليس للخط الزمني متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر `ol` بالصنف `hw-timeline`، وعنصر `li` بالصنف `hw-timeline-item` لكل بند. ويضمّ البند عنصر عنوان من المستوى الثالث فيه العنوان، وعنصر `time` اختياريًا تكون خاصيته datetime هي التاريخ المخصّص للمعالجة الآلية ونصه هو التاريخ الظاهر، وفقرة اختيارية فيها الوصف. وتأخذ الخاصية `data-state` إحدى القيم complete وcurrent وupcoming، ويحمل البند الحالي أيضًا الخاصية `aria-current="step"`. وسمِّ القائمة بالخاصية `aria-label` أو `aria-labelledby` على عنصر `ol`؛ وتطبّق ورقة الأنماط أنماطها على بنود القائمة المباشرة.

### React

جدول: خصائص Timeline

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `items` | `readonly TimelineItem[]` | `true` | — |
| `label` | `string` | `false` | — |

الخاصية `items` مطلوبة. ولكل `TimelineItem` الحقلان المطلوبان `id` و`title`، والحقول الاختيارية `description` و`dateTime` و`dateLabel` و`status`. وقيمة `status` هي complete أو current أو upcoming؛ وتُكتب هذه القيمة في الخاصية `data-state` على البند، ويحمل البند الحالي أيضًا الخاصية `aria-current="step"`. والحقل `dateLabel` هو التاريخ الظاهر، والحقل `dateTime` قيمته المخصّصة للمعالجة الآلية؛ ولا يعرض البند الذي فيه `dateTime` دون `dateLabel` أي تاريخ. ويُعرض `description` في فقرة، فيجب أن يكون محتوى نصيًا ضمن السطر (phrasing content). وتسمّي الخاصية `label` القائمة؛ ودونها اكتب `aria-label` أو `aria-labelledby`. ويُستخدم `id` مفتاحًا للبنود.

### Vue

جدول: خصائص Timeline وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly TimelineItem[]` | `true` | — |
| `label` | prop | `string` | `false` | — |
| `<id>` | slot | — | `false` | — |

الخاصية `items` مطلوبة، وتسمّي الخاصية `label` القائمة. ولكل `TimelineItem` الحقلان المطلوبان `id` و`title`، والحقول الاختيارية `description` و`dateTime` و`dateLabel` و`status`، وقيمة الأخير complete أو current أو upcoming؛ ويُكتب الحقل `status` في الخاصية `data-state`، ويحمل البند الحالي الخاصية `aria-current="step"`. ولا يعرض البند الذي فيه `dateTime` دون `dateLabel` أي تاريخ. ويضيف المنفذ المسمّى بقيمة `id` لأحد البنود محتواه في آخر ذلك البند، بعد الوصف؛ ويتلقّى المنفذ البند في خاصيته item. وتصل خصائص HTML الأخرى إلى عنصر `ol`. ويسرد الجدول المنفذ بالصيغة `<id>` لأن اسمه يُحسب من البنود؛ ولا يعرّف التصريح نوع أي منفذ.

### Angular

جدول: مُدخلات hw-timeline ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `items` | input | `readonly HwTimelineItem[]` | `false` | `[]` |

يُطبَّق `HwTimelineComponent` على `hw-timeline`. والمُدخل `items` قائمة من `HwTimelineItem` لكل منها الحقلان المطلوبان `id` و`title`، والحقول الاختيارية `description` و`dateTime` و`dateLabel` و`status`؛ ويُستخدم `id` مفتاحًا للبنود. ويُكتب الحقل `status` في الخاصية `data-state`، ويحمل البند الحالي الخاصية `aria-current="step"`. ولا يعرض البند الذي فيه `dateTime` دون `dateLabel` أي تاريخ. وتُسمّى القائمة بالمُدخل `label`، أو بالخاصية `aria-label` أو `aria-labelledby` مكتوبةً على `hw-timeline`؛ وتُمرَّر `aria-describedby` إلى القائمة أيضًا.

## إمكانية الوصول

يعرض الخط الزمني عنصر قائمة مرتّبة، فتعلن التقنيات المساعدة عدد البنود وموضع كل منها. وعنوان كل بند عنصر عنوان من المستوى الثالث، فضع الخط الزمني تحت عنوان من المستوى الثاني في الصفحة للحفاظ على ترتيب العناوين.

- تحتاج القائمة إلى اسم: `label` أو `aria-label` أو `aria-labelledby`. ويذكر الاسم الميسّر ما يصفه التسلسل، مثل مراحل طلب.
- يحمل البند الحالي الخاصية `aria-current="step"`. وتُكتب الحالتان complete وupcoming في الخاصية `data-state`، وليس لهما نص أو خاصية ARIA خاصة بهما، فاذكر المرحلة بالكلمات في العنوان أو الوصف، ولا تعتمد على العلامة وحدها.
- ترسم ورقة الأنماط علامة كل بند، ولا نص فيها. ولا يبيّن لونها وحجمها الحالة إلا للقارئ المبصر.
- التاريخ عنصر `time` أصلي يحمل الخاصية datetime، ولا يُعرض إلا عند تمرير `dateLabel`.
- الخط الزمني غير تفاعلي: ليس فيه عنصر قابل للتركيز، وليس له سلوك خاص به مع لوحة المفاتيح.

## الاتجاه والتوطين

ليس في الخط الزمني نص مدمج: يكتب التطبيق التسمية والعناوين والأوصاف والتواريخ الظاهرة بلغة الصفحة. وتتبع القائمة اتجاه الصفحة عبر خصائص CSS المنطقية: فتقع العلامة والخط الواصل في جهة بدء القراءة، في العربية وفي الإنجليزية.

- الحقل `dateLabel` نص يكتبه التطبيق، فيتحكم التطبيق في لغة التاريخ الظاهر وتقويمه وأرقامه؛ ويبقى `dateTime` قيمة مخصّصة للمعالجة الآلية بصيغ HTML.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط الخط الزمني بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- يُدرج الخط الزمني بين مكوّنات المحتوى الإضافية من نطاق المكوّنات في [ملاحظات التغطية](../coverage.md).