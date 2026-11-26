---
source:
  summary: 629bb8a7a6cf
  example: ecd29b6485d5
  variants-and-states: 834b3866b461
  api: 949fda357b77
  accessibility: 094c429aa844
  rtl-and-localisation: 243f1ea5cb41
  platforms-code-reference: 989140b18fa8
---
# زر النسخ

زر النسخ زرّ ينسخ إلى الحافظة قيمة تعرضها الصفحة، ويُبلغ عن النتيجة في عنصر حالة بجانبه يُعلَن دون مقاطعة القارئ. ولا يكتب في الحافظة إلا عندما يفعّله القارئ، ولا يقرأ منها أبدًا.

## مثال

يقع الزر بجانب القيمة التي ينسخها، فيرى القارئ ما يُنسخ. واسمه الميسّر واحد في كل الحالات؛ وتُعلَن النتيجة عبر عنصر الحالة، لا عبر تغيير الاسم.

```html live example=basic static differences=copy-button-adapter-markup
<div class="hw-inline">
  <code class="hw-code">طلب-2041-7783</code>
  <span class="hw-copy" data-hw="copy-button" data-hw-text="طلب-2041-7783" data-hw-copied-message="نُسخ الرقم المرجعي" data-hw-failed-message="تعذّر النسخ. حدّد الرقم المرجعي وانسخه يدويًا.">
    <button type="button" class="hw-button hw-icon-button" data-variant="ghost" data-size="md" aria-label="نسخ الرقم المرجعي للطلب"><span class="hw-icon" data-icon="copy-01" aria-hidden="true"></span></button>
    <span class="hw-copy-message" role="status" aria-live="polite" aria-atomic="true"></span>
  </span>
</div>
```

```tsx live example=basic
<div className="hw-inline">
  <code className="hw-code">طلب-2041-7783</code>
  <CopyButton
    text="طلب-2041-7783"
    label="نسخ الرقم المرجعي للطلب"
    copiedMessage="نُسخ الرقم المرجعي"
    failedMessage="تعذّر النسخ. حدّد الرقم المرجعي وانسخه يدويًا."
  />
</div>
```

```vue live example=basic
<div class="hw-inline">
  <code class="hw-code">طلب-2041-7783</code>
  <CopyButton
    text="طلب-2041-7783"
    label="نسخ الرقم المرجعي للطلب"
    copied-message="نُسخ الرقم المرجعي"
    failed-message="تعذّر النسخ. حدّد الرقم المرجعي وانسخه يدويًا."
  />
</div>
```

```ts live example=basic framework=angular
template: `<div class="hw-inline">
  <code class="hw-code">طلب-2041-7783</code>
  <hw-copy-button
    text="طلب-2041-7783"
    label="نسخ الرقم المرجعي للطلب"
    copiedMessage="نُسخ الرقم المرجعي"
    failedMessage="تعذّر النسخ. حدّد الرقم المرجعي وانسخه يدويًا."
  />
</div>`
```

## الأشكال والحالات

### العرض النصي

ضبط `display` على القيمة `text` يعرض الأيقونة ثم التسمية، وتكون التسمية النص الظاهر للزر.

```html live example=text static differences=copy-button-adapter-markup
<div class="hw-inline">
  <code class="hw-code">طلب-2041-7783</code>
  <span class="hw-copy" data-hw="copy-button" data-hw-text="طلب-2041-7783" data-hw-copied-message="نُسخ الرقم المرجعي" data-hw-failed-message="تعذّر النسخ. حدّد الرقم المرجعي وانسخه يدويًا.">
    <button type="button" class="hw-button" data-variant="ghost" data-size="md"><span class="hw-icon" data-icon="copy-01" aria-hidden="true"></span>نسخ الرقم المرجعي</button>
    <span class="hw-copy-message" role="status" aria-live="polite" aria-atomic="true"></span>
  </span>
</div>
```

```tsx live example=text
<div className="hw-inline">
  <code className="hw-code">طلب-2041-7783</code>
  <CopyButton
    text="طلب-2041-7783"
    label="نسخ الرقم المرجعي"
    copiedMessage="نُسخ الرقم المرجعي"
    failedMessage="تعذّر النسخ. حدّد الرقم المرجعي وانسخه يدويًا."
    display="text"
  />
</div>
```

```vue live example=text
<div class="hw-inline">
  <code class="hw-code">طلب-2041-7783</code>
  <CopyButton
    text="طلب-2041-7783"
    label="نسخ الرقم المرجعي"
    copied-message="نُسخ الرقم المرجعي"
    failed-message="تعذّر النسخ. حدّد الرقم المرجعي وانسخه يدويًا."
    display="text"
  />
</div>
```

```ts live example=text framework=angular
template: `<div class="hw-inline">
  <code class="hw-code">طلب-2041-7783</code>
  <hw-copy-button
    text="طلب-2041-7783"
    label="نسخ الرقم المرجعي"
    copiedMessage="نُسخ الرقم المرجعي"
    failedMessage="تعذّر النسخ. حدّد الرقم المرجعي وانسخه يدويًا."
    display="text"
  />
</div>`
```

### معطَّل

يستخدم الزر المعطَّل الخاصية الأصلية `disabled`، ولا ينسخ.

```html live example=disabled static differences=copy-button-adapter-markup
<div class="hw-inline">
  <code class="hw-code">طلب-2041-7783</code>
  <span class="hw-copy" data-hw="copy-button" data-hw-text="طلب-2041-7783" data-hw-copied-message="نُسخ الرقم المرجعي" data-hw-failed-message="تعذّر النسخ. حدّد الرقم المرجعي وانسخه يدويًا.">
    <button type="button" class="hw-button hw-icon-button" data-variant="ghost" data-size="md" aria-label="نسخ الرقم المرجعي للطلب" disabled><span class="hw-icon" data-icon="copy-01" aria-hidden="true"></span></button>
    <span class="hw-copy-message" role="status" aria-live="polite" aria-atomic="true"></span>
  </span>
</div>
```

```tsx live example=disabled
<div className="hw-inline">
  <code className="hw-code">طلب-2041-7783</code>
  <CopyButton
    text="طلب-2041-7783"
    label="نسخ الرقم المرجعي للطلب"
    copiedMessage="نُسخ الرقم المرجعي"
    failedMessage="تعذّر النسخ. حدّد الرقم المرجعي وانسخه يدويًا."
    disabled
  />
</div>
```

```vue live example=disabled
<div class="hw-inline">
  <code class="hw-code">طلب-2041-7783</code>
  <CopyButton
    text="طلب-2041-7783"
    label="نسخ الرقم المرجعي للطلب"
    copied-message="نُسخ الرقم المرجعي"
    failed-message="تعذّر النسخ. حدّد الرقم المرجعي وانسخه يدويًا."
    disabled
  />
</div>
```

```ts live example=disabled framework=angular
template: `<div class="hw-inline">
  <code class="hw-code">طلب-2041-7783</code>
  <hw-copy-button
    text="طلب-2041-7783"
    label="نسخ الرقم المرجعي للطلب"
    copiedMessage="نُسخ الرقم المرجعي"
    failedMessage="تعذّر النسخ. حدّد الرقم المرجعي وانسخه يدويًا."
    [disabled]="true"
  />
</div>`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createCopyButton

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `text` | `string \| (() => string)` | `false` | — |
| `label` | `string` | `false` | — |
| `copiedMessage` | `string` | `false` | — |
| `failedMessage` | `string` | `false` | — |
| `feedbackDuration` | `number` | `false` | — |
| `onCopyResult` | `(result: CopyResult) => void` | `false` | — |

ليس لزر النسخ شكل يقتصر على ورقة الأنماط: فالمتحكم يحتاج إلى ترميز الجذر. اكتب عنصر `span` بالصنف `hw-copy` والخاصية `data-hw="copy-button"`، وعنصر `button` أصليًا يحمل `type="button"`، وعنصر `span` بالصنف `hw-copy-message` يحمل `role="status"` والخاصيتين `aria-live` و`aria-atomic` بالقيمتين polite وtrue. وشكل الأيقونة هو الزر بالصنف `hw-icon-button` مع `aria-label`؛ والشكل النصي هو الزر وفيه التسمية نصًّا بعد الأيقونة. والشكل والحجم و`disabled` وشكل العرض ترميز يكتبه المطوّر. وتُقرأ القيمة عندما يفعّل القارئ الزر، ولا تُقرأ قبل ذلك أبدًا: يتقدّم الخيار `text`، سلسلةً نصية أو دالة، على `data-hw-text`، ويتقدّم `data-hw-text` على `data-hw-target`، وهو معرّف عنصر يُقرأ نصه. والقيمة المفقودة أو المكوّنة من مسافات بيضاء فقط نتيجتها الحالة الفارغة. والخياران `copiedMessage` و`failedMessage` مطلوبان، وكذلك `label` للزر الذي ليس له `aria-label` ولا نص؛ وتتبع أسماء الخصائص على الجذر أسماء الخيارات، بالبادئة `data-hw-` وبالشرطات، ولا تُكتب التسمية على الزر إلا إذا لم يكن له `aria-label` ولا نص. والخيار `feedbackDuration` هو المدة بالمللي ثانية التي تدوم فيها حالة النسخ الناجح، والقيمة التي ليست عددًا منتهيًا أكبر من الصفر تعني 3000، وكذلك في خاصية الجذر `data-hw-feedback-duration`. ولا تنشر الخيارات قيمة افتراضية في الإصدار 0.3.0. ويتلقى `onCopyResult` النتيجة مرة واحدة لكل تفعيل ما زال معتدًّا به، ويُرسل المتحكم الحدث `hw:change` مع تفاصيل تضمّ الحالة و`text`. ويكتب المتحكم `data-state` على الجذر، وقيمتها idle أو copied أو failed، ويغيّر الأيقونة بحسب الحالة. وللمتحكم المُرجَع الأعضاء `state`، و`copy()` الذي يُحَلّ وعده بالنتيجة، أو بالقيمة undefined عندما يتجاوزه تفعيل لاحق أو يُزال المتحكم، و`destroy()` الذي يعيد الخصائص التي كتبها المطوّر ونص الحالة.

### React

جدول: خصائص CopyButton

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `text` | `string \| (() => string)` | `true` | — |
| `label` | `string` | `true` | — |
| `copiedMessage` | `string` | `true` | — |
| `failedMessage` | `string` | `true` | — |
| `display` | `'icon' \| 'text'` | `false` | `'icon'` |
| `variant` | `'link' \| 'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft'` | `false` | `'ghost'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `feedbackDuration` | `number` | `false` | `3000` |
| `onCopyResult` | `(result: CopyResult) => void` | `false` | — |

الخصائص `text` و`label` و`copiedMessage` و`failedMessage` مطلوبة. والخاصية `text` سلسلة نصية أو دالة يستدعيها المكوّن عند التفعيل، ولا يستدعيها قبل ذلك أبدًا؛ وتُكتب قيمتها كما هي، دون حذف المسافات البيضاء من طرفيها. والخاصية `label` هي الاسم الميسّر في عرض الأيقونة والنص الظاهر في العرض النصي، ولا تتغيّر بتغيّر الحالة. والقيمة الافتراضية لـ`display` هي `icon`، ولـ`variant` هي `ghost`، ولـ`size` هي `md`، ولـ`feedbackDuration` هي 3000؛ والقيمة التي ليست عددًا منتهيًا أكبر من الصفر تعني 3000. ويتلقى `onCopyResult` كائنًا من النوع `CopyResult` يضمّ حالةً قيمتها copied أو failed أو denied أو unavailable أو empty، والنص المنسوخ `text`، مرة واحدة لكل تفعيل ما زال معتدًّا به. وتصل الخاصيتان `className` و`style` إلى الجذر، وتصل كل الخصائص الأخرى والمرجع إلى الزر، فالخاصية `disabled` هي الخاصية الأصلية.

### Vue

جدول: خصائص CopyButton وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `text` | prop | `string \| (() => string)` | `true` | — |
| `label` | prop | `string` | `true` | — |
| `copiedMessage` | prop | `string` | `true` | — |
| `failedMessage` | prop | `string` | `true` | — |
| `display` | prop | `'icon' \| 'text'` | `false` | `'icon'` |
| `variant` | prop | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'ghost'` |
| `size` | prop | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `feedbackDuration` | prop | `number` | `false` | `3000` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `copyResult` | event | `(result: CopyResult) => void` | `false` | — |

الخصائص `text` و`label` و`copiedMessage` و`failedMessage` مطلوبة، وللخصائص `display` و`variant` و`size` و`feedbackDuration` القيم الافتراضية نفسها في React. والخاصية `disabled` منطقية، وقيمتها الافتراضية false. ويحمل الحدث `copyResult` كائنًا من النوع `CopyResult`؛ ويستخدم المستمع في القالب صيغة هذا الاسم بالشرطة. ولا يسرد الجدول أي منفذ، لأن الإصدار المنشور لا يقرأ أي منفذ.

### Angular

جدول: مُدخلات hw-copy-button ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `text` | input | `string \| (() => string)` | `true` | — |
| `label` | input | `string` | `true` | — |
| `copiedMessage` | input | `string` | `true` | — |
| `failedMessage` | input | `string` | `true` | — |
| `display` | input | `'icon' \| 'text'` | `false` | `'icon'` |
| `variant` | input | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'ghost'` |
| `size` | input | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `feedbackDuration` | input | `number` | `false` | `3000` |
| `disabled` | input | `boolean` | `false` | `false` |
| `copyResult` | output | `CopyResult` | `false` | — |

`HwCopyButtonComponent` (`hw-copy-button`) هو الجذر: يحمل الصنف `hw-copy` والخاصية `data-state`، ويحتوي على الزر الأصلي وعنصر الحالة. والمُدخلات `text` و`label` و`copiedMessage` و`failedMessage` مطلوبة، وللمُدخلات `display` و`variant` و`size` و`feedbackDuration` و`disabled` القيم الافتراضية الواردة في الجدول. ويُرسل المُخرج `copyResult` كائنًا من النوع `CopyResult` مرة واحدة لكل تفعيل ما زال معتدًّا به، ولا يُرسل شيئًا بعد إزالة المكوّن. ولا تُمرَّر أي خاصية إلى الزر.

## إمكانية الوصول

زر النسخ عنصر `button` أصلي يحمل `type="button"`، فيوفّر المتصفح دوره والتركيز عليه وتفعيله. والاسم الميسّر هو `label`، ويُكتب في الخاصية `aria-label` في عرض الأيقونة، ونصًّا ظاهرًا في العرض النصي، ويبقى نفسه في حالة الانتظار وحالة النسخ الناجح وحالة الإخفاق. ويبقى التركيز على الزر بعد التفعيل.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: زر النسخ

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز إلى الزر، ثم إلى عنصر التحكم التالي في الصفحة. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | ينقل التركيز إلى عنصر التحكم السابق في الصفحة. |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | يفعّل الزر الذي عليه التركيز، فينسخ القيمة. |

- تُعلَن النتيجة في عنصر يحمل `role="status"`، قيمة `aria-live` فيه polite وقيمة `aria-atomic` فيه true. ويكون فارغًا عندما يكون الزر في حالة الانتظار. وبعد نسخ ناجح يحتوي على `copiedMessage` مخفيةً بصريًا، طوال المدة `feedbackDuration`؛ وبعد الإخفاق يحتوي على `failedMessage` نصًّا ظاهرًا حتى التفعيل التالي.
- يُفرغ كل تفعيل عنصر الحالة أولًا، لتُعلَن الرسالة المكرّرة مرة أخرى. وعندما تتحدّد النتيجة فورًا، كما في القيمة الفارغة أو عند غياب واجهة Clipboard API، يُفرغ عنصر الحالة ويُملأ في مهمة واحدة؛ ولم يُتحقَّق بقارئ شاشة من إعلان الرسالة المطابقة المكرّرة في هذه الحالة.
- لا يُكتب في الحافظة إلا عبر واجهة Clipboard API غير المتزامنة، دون بديل احتياطي، ولا يُقرأ منها أبدًا. والنتيجة إحدى الحالات copied أو denied أو unavailable أو failed أو empty؛ ولأي حالة غير copied يمكن أن يتيح التطبيق النسخ اليدوي، مثل تحديد القيمة.
- لا يُعتدّ إلا بآخر تفعيل، فيتجاوز التفعيلُ اللاحق تفعيلًا سابقًا لم تتحدّد نتيجته بعد.
- لا يقبل الزر المعطَّل التركيز، ولا ينسخ.

## الاتجاه والتوطين

ليس في زر النسخ نص مدمج: يكتب التطبيق التسمية ورسالة النسخ الناجح ورسالة الإخفاق بلغة الصفحة. ويرث العنصر لغة الصفحة واتجاهها، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية، فيتبع الزر وعنصر حالته اتجاه القراءة. والقيمة المنسوخة بيانات تحتفظ بنظام كتابتها؛ ولا يغيّرها المكوّن.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط زر النسخ بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تصف [ملاحظات إجراء النسخ](../nic-copy-action.md) سلوك البرنامج النصي المزوَّد من كود المنصات الذي يربط أيقونة نسخ بقيمة ظاهرة، والوصفة الواردة في دليل الزر التي تستخدم بدلًا منه زرًّا أصليًا ذا تسمية صريحة. وتحذف تلك الوصفة المسافات البيضاء من طرفي النص الظاهر، وتفضّل عنوان البريد الإلكتروني، وتعرض النص في عنصر إدخال مخصّص للقراءة فقط بعد الإخفاق؛ أما زر النسخ فيكتب نصه كما هو، وليس فيه أيٌّ من ذلك، ويحتفظ بالزر الأصلي مع اسم يكتبه التطبيق وبرسائل الحالة للنتائج.
- تذكر [ملاحظات إجراء النسخ](../nic-copy-action.md) أن المحدِّد العام في المصدر وخط الأيقونات وترجمات الموقع والإشعار المؤقّت خاصة بالتطبيق؛ فلا تُنقل.
