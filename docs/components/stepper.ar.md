---
source:
  summary: b837ccb61381
  example: 8c6e3958663e
  variants-and-states: 34496df77273
  api: c159b9abf888
  accessibility: 9b96df9c0ce8
  rtl-and-localisation: a066a5fe3daa
  platforms-code-reference: 1d01deb5b2ae
---
# خطوات

مكوّن الخطوات قائمة مرتّبة تبيّن مراحل العملية المكتملة، والمرحلة الحالية، والمراحل القادمة. وهو مؤشر ثابت للتقدّم، وليس وسيلة تنقل؛ ويتولّى التطبيق التقدّم.

## مثال

للقائمة اسم، وتحمل الخطوة الحالية الخاصية `aria-current="step"`. وتحمل الخطوات المكتملة والقادمة نص حالة مخفيًا بصريًا، فلا تعتمد الحالة على اللون ولا على العلامة.

```html live example=basic static differences=stepper-adapter-markup
<ol class="hw-stepper" data-hw="stepper" aria-label="مراحل الطلب" data-active-index="1" data-hw-complete-label="مكتملة" data-hw-upcoming-label="لم تبدأ">
  <li class="hw-step"><span>بيانات مقدّم الطلب</span></li>
  <li class="hw-step"><span>المستندات</span></li>
  <li class="hw-step"><span>المراجعة</span></li>
  <li class="hw-step"><span>التقديم</span></li>
</ol>
```

```tsx live example=basic
<Stepper
  label="مراحل الطلب"
  activeIndex={1}
  completeLabel="مكتملة"
  upcomingLabel="لم تبدأ"
  items={[
    { value: 'details', label: 'بيانات مقدّم الطلب' },
    { value: 'documents', label: 'المستندات' },
    { value: 'review', label: 'المراجعة' },
    { value: 'submission', label: 'التقديم' },
  ]}
/>
```

```vue live example=basic
<Stepper
  label="مراحل الطلب"
  :active-index="1"
  complete-label="مكتملة"
  upcoming-label="لم تبدأ"
  :items="[
    { value: 'details', label: 'بيانات مقدّم الطلب' },
    { value: 'documents', label: 'المستندات' },
    { value: 'review', label: 'المراجعة' },
    { value: 'submission', label: 'التقديم' },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-stepper
  label="مراحل الطلب"
  [activeIndex]="1"
  completeLabel="مكتملة"
  upcomingLabel="لم تبدأ"
  [items]="[
    { value: 'details', label: 'بيانات مقدّم الطلب' },
    { value: 'documents', label: 'المستندات' },
    { value: 'review', label: 'المراجعة' },
    { value: 'submission', label: 'التقديم' },
  ]"
/>`
```

## الأشكال والحالات

عندما تكون قيمة `activeIndex` هي -1 فإن العملية لم تبدأ، فتكون كل الخطوات قادمة.

### الأوصاف

يمكن أن يحمل البند وصفًا، يُعرض تحت تسميته نصًّا إرشاديًا.

```html live example=description static differences=stepper-adapter-markup
<ol class="hw-stepper" data-hw="stepper" aria-label="مراحل الطلب" data-active-index="0" data-hw-complete-label="مكتملة" data-hw-upcoming-label="لم تبدأ">
  <li class="hw-step"><span>بيانات مقدّم الطلب</span><p class="hw-hint">الاسم وبيانات التواصل.</p></li>
  <li class="hw-step"><span>المستندات</span><p class="hw-hint">المستندات الداعمة للطلب.</p></li>
  <li class="hw-step"><span>المراجعة</span><p class="hw-hint">راجع الإجابات قبل الإرسال.</p></li>
</ol>
```

```tsx live example=description
<Stepper
  label="مراحل الطلب"
  current="details"
  completeLabel="مكتملة"
  upcomingLabel="لم تبدأ"
  items={[
    { value: 'details', label: 'بيانات مقدّم الطلب', description: 'الاسم وبيانات التواصل.' },
    { value: 'documents', label: 'المستندات', description: 'المستندات الداعمة للطلب.' },
    { value: 'review', label: 'المراجعة', description: 'راجع الإجابات قبل الإرسال.' },
  ]}
/>
```

```vue live example=description
<Stepper
  label="مراحل الطلب"
  current="details"
  complete-label="مكتملة"
  upcoming-label="لم تبدأ"
  :items="[
    { value: 'details', label: 'بيانات مقدّم الطلب', description: 'الاسم وبيانات التواصل.' },
    { value: 'documents', label: 'المستندات', description: 'المستندات الداعمة للطلب.' },
    { value: 'review', label: 'المراجعة', description: 'راجع الإجابات قبل الإرسال.' },
  ]"
/>
```

```ts live example=description framework=angular
template: `<hw-stepper
  label="مراحل الطلب"
  current="details"
  completeLabel="مكتملة"
  upcomingLabel="لم تبدأ"
  [items]="[
    { value: 'details', label: 'بيانات مقدّم الطلب', description: 'الاسم وبيانات التواصل.' },
    { value: 'documents', label: 'المستندات', description: 'المستندات الداعمة للطلب.' },
    { value: 'review', label: 'المراجعة', description: 'راجع الإجابات قبل الإرسال.' },
  ]"
/>`
```

### اكتمال كل الخطوات

عندما تساوي قيمة `activeIndex` عدد البنود تكون كل الخطوات مكتملة، ولا تكون أي خطوة حالية.

```html live example=complete static differences=stepper-adapter-markup
<ol class="hw-stepper" data-hw="stepper" aria-label="مراحل الطلب" data-active-index="3" data-hw-complete-label="مكتملة" data-hw-upcoming-label="لم تبدأ">
  <li class="hw-step"><span>بيانات مقدّم الطلب</span></li>
  <li class="hw-step"><span>المستندات</span></li>
  <li class="hw-step"><span>التقديم</span></li>
</ol>
```

```tsx live example=complete
<Stepper
  label="مراحل الطلب"
  activeIndex={3}
  completeLabel="مكتملة"
  upcomingLabel="لم تبدأ"
  items={[
    { value: 'details', label: 'بيانات مقدّم الطلب' },
    { value: 'documents', label: 'المستندات' },
    { value: 'submission', label: 'التقديم' },
  ]}
/>
```

```vue live example=complete
<Stepper
  label="مراحل الطلب"
  :active-index="3"
  complete-label="مكتملة"
  upcoming-label="لم تبدأ"
  :items="[
    { value: 'details', label: 'بيانات مقدّم الطلب' },
    { value: 'documents', label: 'المستندات' },
    { value: 'submission', label: 'التقديم' },
  ]"
/>
```

```ts live example=complete framework=angular
template: `<hw-stepper
  label="مراحل الطلب"
  [activeIndex]="3"
  completeLabel="مكتملة"
  upcomingLabel="لم تبدأ"
  [items]="[
    { value: 'details', label: 'بيانات مقدّم الطلب' },
    { value: 'documents', label: 'المستندات' },
    { value: 'submission', label: 'التقديم' },
  ]"
/>`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createStepper

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `activeIndex` | `number` | `false` | — |
| `label` | `string` | `false` | — |
| `completeLabel` | `string` | `false` | — |
| `upcomingLabel` | `string` | `false` | — |

ليس لمكوّن الخطوات صيغة تعتمد على ورقة الأنماط وحدها وتتابع الحالة: اكتب عنصر `ol` بالصنف `hw-stepper` والخاصية `data-hw="stepper"`، وعنصر `li` بالصنف `hw-step` لكل خطوة، يحتوي على عنصر `span` فيه التسمية، وعند الحاجة عنصر `p` بالصنف `hw-hint` للوصف. وتضبط `createStepper` حالة كل خطوة في `data-state`: من قيمة `data-status` صريحة على الخطوة، هي complete أو current أو upcoming، وتتقدّم هذه القيمة على الموضع، وإلا فمن الموضع، فتكون الخطوة مكتملة أو حالية أو قادمة؛ وتضبط `aria-current="step"` على الخطوة الحالية، وتكتب الموضع الذي تستخدمه في `data-active-index` على القائمة. ويبدأ عدّ `activeIndex` من الصفر؛ وتعني القيمة -1 أن العملية لم تبدأ، ويعني الرقم المساوي لعدد الخطوات أنها كلها مكتملة. وتُعامَل القيمة التي ليست عددًا صحيحًا في هذا المدى معاملة -1. ودون `activeIndex` يقرأ المتحكم `data-active-index` من القائمة، ثم الخطوة التي تحمل `aria-current="step"` أو قيمة `data-state` هي `current` أو `active`. والخياران `completeLabel` و`upcomingLabel` نصان مطلوبان للخطوات التي تحتاج إليهما؛ ويُكتبان خيارين، أو خاصيتين على القائمة لتسمية الخطوة المكتملة وتسمية الخطوة القادمة، ويكتبهما المتحكم في عنصر `span` مخفي بصريًا يحمل الخاصية `data-hw-step-status` بعد تسمية كل خطوة مكتملة وكل خطوة قادمة، ولا يكتبهما أبدًا على الخطوة الحالية. ويسمّي الخيار `label` القائمة. ولا تنشر الخيارات قيمة افتراضية في الإصدار 0.3.0. وللمتحكم المُرجَع `activeIndex` و`setActiveIndex(index)` و`refresh()` و`destroy()`.

### React

جدول: خصائص Stepper

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `items` | `readonly StepItem[]` | `true` | — |
| `current` | `string` | `false` | — |
| `activeIndex` | `number` | `false` | — |
| `completeLabel` | `string` | `true` | — |
| `upcomingLabel` | `string` | `true` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |

الخاصية `items` هي قائمة الخطوات؛ ولكل `StepItem` الحقلان `value` و`label`، والحقل الاختياري `description`، والحقل الاختياري `status` الذي تكون قيمته current أو complete أو upcoming. والخاصية `current` هي قيمة `value` للخطوة الحالية. وتتقدّم `activeIndex` على `current`: فالخطوات التي قبلها مكتملة، والخطوة التي في موضعها حالية، والخطوات التي بعدها قادمة. وتتقدّم قيمة `status` الصريحة للبند عليهما كلتيهما. وإذا غابت `current` و`activeIndex` معًا لم تكن أي خطوة حالية. والخاصيتان `completeLabel` و`upcomingLabel` مطلوبتان، وتحتاج القائمة إلى اسم من `label` أو `aria-label` أو `aria-labelledby`. وتصل خصائص عنصر `ol` الأصلي الأخرى إلى القائمة.

### Vue

جدول: خصائص Stepper وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly StepItem[]` | `true` | — |
| `current` | prop | `string` | `false` | — |
| `activeIndex` | prop | `number` | `false` | — |
| `label` | prop | `string` | `false` | — |
| `completeLabel` | prop | `string` | `true` | — |
| `upcomingLabel` | prop | `string` | `true` | — |

تعمل `items` و`current` و`activeIndex` كما تعمل في React؛ والحقل `label` للبند سلسلة نصية. وتسمّي الخاصية `label` القائمة، والخاصيتان `completeLabel` و`upcomingLabel` مطلوبتان. ولا يسرد الجدول أي منفذ ولا أي حدث، لأن الإصدار المنشور لا يقرأ أيًّا منهما.

### Angular

جدول: مُدخلات hw-stepper ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `items` | input | `readonly HwStep[]` | `false` | `[]` |
| `current` | input | `string` | `false` | — |
| `activeIndex` | input | `number` | `false` | — |
| `completeLabel` | input | `string` | `true` | — |
| `upcomingLabel` | input | `string` | `true` | — |

يعرض `HwStepperComponent` (`hw-stepper`) العنصر `ol`. وتعمل `items` و`current` و`activeIndex` كما تعمل في React، والقيمة الافتراضية لـ`items` مصفوفة فارغة. وتحتاج القائمة إلى `label`، أو إلى `aria-label` أو `aria-labelledby` مكتوبة على `hw-stepper`؛ والمُدخلان `completeLabel` و`upcomingLabel` مطلوبان. وليس للمكوّن مُخرج، لأن مكوّن الخطوات غير تفاعلي.

## إمكانية الوصول

مكوّن الخطوات قائمة مرتّبة أصلية تسمّيها `label` أو `aria-label` أو `aria-labelledby`؛ وليس للمكوّن اسم افتراضي. وتحمل الخطوة الحالية الخاصية `aria-current="step"`. وتحمل الخطوة المكتملة والخطوة القادمة نص الحالة المطلوب، في عنصر مخفي بصريًا بعد تسمية الخطوة، فلا تعتمد الحالة على العلامة ولا على اللون. وليس للخطوة الحالية نص حالة، لأن `aria-current="step"` تعبّر عن حالتها. ولا تكتب الحالة في تسمية الخطوة.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: خطوات

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز متجاوزًا القائمة إلى عنصر التحكم التالي في الصفحة، لأن الخطوات غير تفاعلية. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | ينقل التركيز متجاوزًا القائمة إلى عنصر التحكم السابق في الصفحة. |

- لا يضيف مكوّن الخطوات أزرارًا ولا مواضع في ترتيب التنقل بالمفتاح Tab ولا تنقلًا بين الخطوات. ويقرّر التطبيق متى تكتمل الخطوة، ويحدّث تغييرُ `current` أو `activeIndex` حالتَي الخطوة السابقة والخطوة الحالية، تقدّمًا أو رجوعًا؛ ولا تتقدّم أي خطوة من تلقاء نفسها.
- يعبّر النص عن الحالتين «مكتملة» و«قادمة»، وتعبّر `aria-current` عن الحالة الحالية. واجعل الحالات الصريحة متّسقة، بخطوة حالية واحدة على الأكثر.
- تحتاج الحلقة الزخرفية والملخّص على الأجهزة المحمولة، اللذان توفّرهما ورقة الأنماط بالصنفين `hw-stepper-responsive` و`hw-stepper-ring`، إلى تسمية ميسّرة تذكر الخطوة الحالية والعدد الكلي للخطوات، ويكتبها التطبيق.

## الاتجاه والتوطين

ليس في مكوّن الخطوات نص مدمج: يكتب التطبيق اسم القائمة وتسميات الخطوات والأوصاف ونصَّي الحالة بلغة الصفحة. وترث القائمة لغة الصفحة واتجاهها، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية، فتتبع الخطوات اتجاه القراءة. والقيم في `value` معرّفات، ولا تُعرض.

- نصّا الحالة سلسلتان نصيتان منفصلتان للحالتين، لتصوغهما كل لغة بحسب حاجتها؛ ولا يضيفهما التطبيق إلى التسمية.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط مكوّن الخطوات بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- يُدرج مكوّن الخطوات بين مكوّنات التفاعل والتنقل الأولى في [ملاحظات التغطية](../coverage.md). و[ملاحظات مكوّن الخطوات](../stepper-states.md) ملاحظة عن الواجهة البرمجية والأنماط، وليست ربطًا لملفات كود المنصات المزوَّدة؛ وتصف القائمة المرتّبة التي تحمل `aria-current="step"`، ونص الحالة المخفي بصريًا، وقيم الحالة الثلاث، وترتيب الأولوية بين `activeIndex` و`current` والحالة الصريحة.
- تذكر [ملاحظات مكوّن الخطوات](../stepper-states.md) أن المكوّن لا يضيف أزرارًا ولا مواضع في ترتيب التنقل بالمفتاح Tab ولا تنقلًا بين الخطوات، وأن التطبيق يتولّى التقدّم. وليس التنقل بين مراحل الرحلة والتحقق من صحة البيانات جزءًا من المكوّن؛ فهما من مسؤولية التطبيق.
