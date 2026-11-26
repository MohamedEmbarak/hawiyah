---
source:
  summary: e34aa33e33e0
  example: 94dca4968474
  variants-and-states: d7fab239639b
  api: 557bf0ec3a61
  accessibility: f3ff541005a0
  rtl-and-localisation: d2c1c4ab520e
  platforms-code-reference: a159cf520254
---
# أقسام قابلة للطي

يجمع مكوّن الأقسام القابلة للطي أقسامًا من محتوى مترابط، ولكل قسم مشغِّل يُظهره أو يخفيه. ويُبنى المكوّن على العنصرين الأصليين `details` و`summary`، فيُفتح القسم ويُغلق دون برنامج نصي.

## مثال

لكل قسم عنوان قصير يسمّي محتواه. ويمكن أن تكون عدة أقسام مفتوحة في الوقت نفسه.

```html live example=basic static
<div class="hw-accordion" data-hw="accordion">
  <details class="hw-accordion-item" data-hw-value="who">
    <summary class="hw-accordion-trigger">من يحق له تقديم الطلب</summary>
    <div class="hw-accordion-content">يحق تقديم الطلب لمقدّم الطلب نفسه، أو لمن ينوب عنه بموجب تفويض موقَّع.</div>
  </details>
  <details class="hw-accordion-item" data-hw-value="documents">
    <summary class="hw-accordion-trigger">المستندات المطلوبة</summary>
    <div class="hw-accordion-content">أرفق نسخة من وثيقة إثبات الهوية ومستندًا واحدًا يثبت العنوان.</div>
  </details>
  <details class="hw-accordion-item" data-hw-value="duration">
    <summary class="hw-accordion-trigger">مدة دراسة الطلب</summary>
    <div class="hw-accordion-content">تستغرق دراسة الطلب عادةً خمسة أيام عمل من تاريخ تقديمه.</div>
  </details>
</div>
```

```tsx live example=basic
<Accordion
  items={[
    { value: 'who', title: 'من يحق له تقديم الطلب', content: 'يحق تقديم الطلب لمقدّم الطلب نفسه، أو لمن ينوب عنه بموجب تفويض موقَّع.' },
    { value: 'documents', title: 'المستندات المطلوبة', content: 'أرفق نسخة من وثيقة إثبات الهوية ومستندًا واحدًا يثبت العنوان.' },
    { value: 'duration', title: 'مدة دراسة الطلب', content: 'تستغرق دراسة الطلب عادةً خمسة أيام عمل من تاريخ تقديمه.' },
  ]}
/>
```

```vue live example=basic
<Accordion
  :items="[
    { value: 'who', title: 'من يحق له تقديم الطلب', content: 'يحق تقديم الطلب لمقدّم الطلب نفسه، أو لمن ينوب عنه بموجب تفويض موقَّع.' },
    { value: 'documents', title: 'المستندات المطلوبة', content: 'أرفق نسخة من وثيقة إثبات الهوية ومستندًا واحدًا يثبت العنوان.' },
    { value: 'duration', title: 'مدة دراسة الطلب', content: 'تستغرق دراسة الطلب عادةً خمسة أيام عمل من تاريخ تقديمه.' },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-accordion
  [items]="[
    { value: 'who', title: 'من يحق له تقديم الطلب', content: 'يحق تقديم الطلب لمقدّم الطلب نفسه، أو لمن ينوب عنه بموجب تفويض موقَّع.' },
    { value: 'documents', title: 'المستندات المطلوبة', content: 'أرفق نسخة من وثيقة إثبات الهوية ومستندًا واحدًا يثبت العنوان.' },
    { value: 'duration', title: 'مدة دراسة الطلب', content: 'تستغرق دراسة الطلب عادةً خمسة أيام عمل من تاريخ تقديمه.' },
  ]"
/>`
```

## الأشكال والحالات

### قسم مفتوح

يكون القسم مفتوحًا من البداية عندما يطلب التطبيق ذلك. ففي React يُكتب الحقل `defaultOpen` في البند لقسم غير متحكَّم فيه، وفي Vue وAngular يُكتب الحقل `open` في البند حالةً أولية؛ ويبقى بإمكان القارئ فتح القسم وإغلاقه. وفي ترميز HTML المجرّد تؤدي الخاصية الأصلية `open` على عنصر `details` الغرض نفسه.

```html live example=open static
<div class="hw-accordion" data-hw="accordion">
  <details class="hw-accordion-item" open>
    <summary class="hw-accordion-trigger">حالة الطلب</summary>
    <div class="hw-accordion-content">قُدِّم الطلب، وهو بانتظار الدراسة.</div>
  </details>
  <details class="hw-accordion-item">
    <summary class="hw-accordion-trigger">المستندات المرفقة</summary>
    <div class="hw-accordion-content">أُرفق بالطلب مستندان.</div>
  </details>
</div>
```

```tsx live example=open
<Accordion
  items={[
    { value: 'status', title: 'حالة الطلب', content: 'قُدِّم الطلب، وهو بانتظار الدراسة.', defaultOpen: true },
    { value: 'documents', title: 'المستندات المرفقة', content: 'أُرفق بالطلب مستندان.' },
  ]}
/>
```

```vue live example=open
<Accordion
  :items="[
    { value: 'status', title: 'حالة الطلب', content: 'قُدِّم الطلب، وهو بانتظار الدراسة.', open: true },
    { value: 'documents', title: 'المستندات المرفقة', content: 'أُرفق بالطلب مستندان.' },
  ]"
/>
```

```ts live example=open framework=angular
template: `<hw-accordion
  [items]="[
    { value: 'status', title: 'حالة الطلب', content: 'قُدِّم الطلب، وهو بانتظار الدراسة.', open: true },
    { value: 'documents', title: 'المستندات المرفقة', content: 'أُرفق بالطلب مستندان.' },
  ]"
/>`
```

### أقسام حصرية

عند كتابة `exclusive` يُغلق فتحُ قسمٍ القسمَ المفتوح. وتمنح المحوّلات الأقسام قيمة `name` أصلية واحدة؛ وفي ترميز HTML المجرّد اكتب الخاصية `name` نفسها على كل عنصر `details`.

```html live example=exclusive static
<div class="hw-accordion" data-hw="accordion">
  <details class="hw-accordion-item" name="request-steps">
    <summary class="hw-accordion-trigger">الخطوة 1: بيانات مقدّم الطلب</summary>
    <div class="hw-accordion-content">أدخل الاسم الكامل لمقدّم الطلب ورقم هويته.</div>
  </details>
  <details class="hw-accordion-item" name="request-steps">
    <summary class="hw-accordion-trigger">الخطوة 2: إرفاق المستندات</summary>
    <div class="hw-accordion-content">أرفق المستندات المؤيدة للطلب.</div>
  </details>
</div>
```

```tsx live example=exclusive
<Accordion
  exclusive
  items={[
    { value: 'applicant', title: 'الخطوة 1: بيانات مقدّم الطلب', content: 'أدخل الاسم الكامل لمقدّم الطلب ورقم هويته.' },
    { value: 'documents', title: 'الخطوة 2: إرفاق المستندات', content: 'أرفق المستندات المؤيدة للطلب.' },
  ]}
/>
```

```vue live example=exclusive
<Accordion
  exclusive
  :items="[
    { value: 'applicant', title: 'الخطوة 1: بيانات مقدّم الطلب', content: 'أدخل الاسم الكامل لمقدّم الطلب ورقم هويته.' },
    { value: 'documents', title: 'الخطوة 2: إرفاق المستندات', content: 'أرفق المستندات المؤيدة للطلب.' },
  ]"
/>
```

```ts live example=exclusive framework=angular
template: `<hw-accordion
  [exclusive]="true"
  [items]="[
    { value: 'applicant', title: 'الخطوة 1: بيانات مقدّم الطلب', content: 'أدخل الاسم الكامل لمقدّم الطلب ورقم هويته.' },
    { value: 'documents', title: 'الخطوة 2: إرفاق المستندات', content: 'أرفق المستندات المؤيدة للطلب.' },
  ]"
/>`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createAccordion

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `onOpenChange` | `(value: string, open: boolean) => void` | `false` | — |

تهيّئ الدالة `createAccordion(root, options)` ترميزًا موجودًا، وتفعل الدالة `enhance()` الشيء نفسه لعنصر يحمل `data-hw="accordion"`. ويُكتب كل ابن مباشر للجذر يحمل الصنف `hw-accordion-item` عنصرَ `details` يحتوي على عنصر `summary` وعلى غلاف محتوى واحد بالضبط؛ ويُطلق المتحكم خطأً إذا لم يكن في البند عنصر `summary`، أو لم يكن فيه ابن آخر واحد بالضبط، أو إذا تكررت قيمتان. اكتب `data-hw-value` على كل عنصر `details` ليحمل قيمة ثابتة، وإلا فقيمته رقم ترتيبه بدءًا من الصفر، واجعل القيم فريدة. ويُرجع المتحكم `setOpen(value, open)` و`destroy()`. وتتلقّى `onOpenChange` القيمة والحالة المنطقية، ويُرسل المتحكم التغيير نفسه في الحدث `hw:change` على الجذر مع `{ value, open }`. ولا يبدّل النقر على رابط أو زر أو عنصر تحكم في نموذج داخل عنصر `summary` حالة القسم. ويعمل الترميز الأصلي دون المتحكم كما هو؛ ويضيف المتحكم تحريك الارتفاع.

### React

جدول: خصائص Accordion

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `items` | `readonly AccordionItem[]` | `true` | — |
| `exclusive` | `boolean` | `false` | — |

تسرد الخاصية `items` الأقسام. ولكل `AccordionItem` قيمة `value` تميّزه، و`title` و`content`، وكلاهما محتوى React قابل للعرض، ويمكن أن يحمل أيضًا `open` و`defaultOpen` و`onOpenChange`. استخدم `open` مع `onOpenChange` لقسم متحكَّم فيه، أو `defaultOpen` لقسم غير متحكَّم فيه. وعندما يكون أحد البنود متحكَّمًا فيه في مجموعة حصرية، يقبل التطبيق طلب إغلاق البند السابق عندما يقبل فتح بند آخر. وتجعل الخاصية `exclusive` الأقسام مجموعة واحدة: يكتب المكوّن عليها قيمة `name` أصلية واحدة، وبعد تهيئة القسم تزيل الأداة المساعدة هذا الاسم، وتُبقي قسمًا واحدًا مفتوحًا بأن تطلب من القسم المفتوح الآخر أن يُغلق. وتصل الخصائص الأخرى إلى العنصر الجذر.

### Vue

جدول: خصائص Accordion وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly AccordionItem[]` | `true` | — |
| `exclusive` | prop | `boolean` | `false` | `false` |
| `toggle` | event | `(value: string, open: boolean) => void` | `false` | — |
| `content` | slot | — | `false` | — |
| `title` | slot | — | `false` | — |

تسرد الخاصية `items` الأقسام. ولكل `AccordionItem` قيمة `value`، و`title` من نوع السلسلة النصية، و`content` اختياري، و`open` اختياري يضبط الحالة الأولية ويحدّث القسم عندما يتغيّر. ويُرسَل الحدث `toggle` مرة واحدة لكل تغيير منطقي يُحدثه القارئ أو تُحدثه مجموعة حصرية، مع القيمة والحالة الجديدة؛ وتُفتح الأقسام وتُغلق دون مستمع. ويتلقّى المنفذان ذوا النطاق `title` و`content` البند ورقم ترتيبه، ويعرضان محتوى غنيًا؛ ويجب أن يحتوي منفذ العنوان على نص، لأنه يسمّي عنصر `summary`. ويسرد الجدول المنفذين لأن الإصدار المنشور يقرؤهما؛ ولا يعرّف التصريح نوع أي منهما.

### Angular

جدول: مُدخلات hw-accordion وdetails[hwAccordionOpen] ومخرجاتهما ومحتواهما

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `items` | input | `readonly HwAccordionItem[]` | `false` | `[]` |
| `titleTemplate` | input | `TemplateRef<{ $implicit: HwAccordionItem; index: number }>` | `false` | — |
| `contentTemplate` | input | `TemplateRef<{ $implicit: HwAccordionItem; index: number }>` | `false` | — |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `exclusive` | input | `boolean` | `false` | `false` |
| `groupName` | input | `string` | `false` | — |
| `toggled` | output | `{ value: string; open: boolean }` | `false` | — |
| `*` | content | — | `false` | — |
| `details[hwAccordionOpen] hwAccordionOpen` | input | `boolean \| undefined` | `false` | — |
| `details[hwAccordionOpen] hwAccordionGroup` | input | `string \| undefined` | `false` | — |
| `details[hwAccordionOpen] hwAccordionChange` | output | `boolean` | `false` | — |

يأخذ `HwAccordionComponent` (`hw-accordion`) المُدخل `items`، ولكل `HwAccordionItem` قيمة `value`، و`title` من النص العادي، و`content` اختياري من نوع السلسلة النصية، و`open` اختياري للحالة الأولية. ويُرسل المُخرج `toggled` القيمة والحالة الجديدة مرة واحدة لكل تغيير منطقي. ويعرض `titleTemplate` و`contentTemplate` محتوى غنيًا داخل عنصر `summary` وغلاف المحتوى؛ ويجب أن يعرض قالب العنوان نصًا، لأنه يسمّي عنصر `summary`. وعندما تُكتب الخاصية `aria-label` أو `aria-labelledby` على `hw-accordion` تصل إلى العنصر الجذر، فيحمل عندئذ `role="group"`؛ وتصل الخاصية `aria-describedby` إلى العنصر الجذر أيضًا، لكنها لا تمنحه دورًا. والمُدخل `groupName` هو قيمة `name` الأصلية لمجموعة حصرية؛ ودونه يُستخدم معرّف مولَّد. ويحرّك التوجيه `HwAccordionMotionDirective` (`details[hwAccordionOpen]`) عنصر `details` يكتبه التطبيق بنفسه، ويحتاج هذا العنصر إلى عنصر `summary` وإلى ابن مباشر بالصنف `hw-accordion-content`، مع `hwAccordionOpen` لحالته، و`hwAccordionGroup` لمجموعة حصرية، و`hwAccordionChange` للتغيير المنطقي. والصف `*` هو المحتوى المُسقَط في المكوّن.

## إمكانية الوصول

كل قسم عنصر `details` أصلي، ومشغِّله عنصر `summary` أصلي، فيوفّر المتصفح الدور وحالة التوسيع وسلوك التركيز؛ وبعد تهيئة القسم تكتب الأداة المساعدة الخاصية `aria-expanded` على عنصر `summary` بنفسها، كما يصف البند الأول أدناه. وعنوان القسم هو اسمه الميسّر.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: أقسام قابلة للطي

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | كما في أي صفحة HTML، ينقل التركيز إلى المشغِّل التالي، أو إلى العنصر القابل للتركيز التالي داخل قسم مفتوح. |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | يفتح عنصر `summary` الأصلي قسمَ المشغِّل الذي عليه التركيز أو يغلقه. |

- في أثناء إغلاق القسم يعرض عنصر `summary` الخاصية `aria-expanded="false"` من قبل انتهاء الإغلاق، ويصبح المحتوى غير قابل للتفاعل ومخفيًا عن التقنيات المساعدة؛ وتبقى الخاصية `open` حتى ينتهي تحريك الارتفاع. ويعود التركيز الموجود داخل المحتوى الذي يُغلق إلى عنصر `summary`.
- يكتمل تحريك الارتفاع فورًا عندما يطلب القارئ تقليل الحركة، ولا حركة في السمة الأصلية لهوية.
- يحتاج كل عنصر `summary` إلى نص، ومنه العنصر المبني من منفذ العنوان أو من قالب العنوان، لأن النص هو الاسم الميسّر للقسم.

## الاتجاه والتوطين

ليس في مكوّن الأقسام القابلة للطي نص مدمج: يكتب التطبيق العناوين والمحتويات بلغة الصفحة. ويرث العنصر لغة الصفحة واتجاهها، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية، فيتبع نص المشغِّل ومحتوى القسم وموضع العلامة اتجاه القراءة. ولا يحتاج عنصر `details` الأصلي إلى ضبط اتجاه خاص به.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط الأقسام القابلة للطي بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- رُبطت مسافات الترويسة والمتن، وأسطح المرور بالمؤشر والتركيز، والعلامة، وتوقيتات الانتقال، الواردة في ورقة أنماط كود المنصات المزوَّدة، بترميز الإظهار والإخفاء الأصلي في [ملاحظات الأقسام القابلة للطي](../nic-accordion.md)، مع درجة الثقة في كل ربط؛ وتذكر الملاحظات أن ربط المصدر يثبت متطلبات الأنماط، ولا يثبت تطابقًا مرئيًا مع المظهر الرسمي.
- تصف [ملاحظات الحركة](../accordion-motion.md) تحريك الارتفاع، وسلوك تقليل الحركة، والمجموعات الحصرية في المحوّلات؛ وتذكر الملاحظات أن أدلتها تثبت سلوكًا مستندًا إلى المصدر، ولا تثبت تطابقًا مرئيًا.
