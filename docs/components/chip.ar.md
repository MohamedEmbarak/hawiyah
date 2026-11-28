---
source:
  summary: 8dde247fa546
  example: 8efc858751cd
  variants-and-states: 9c77077cdd5d
  api: b535d6a19844
  accessibility: 476ec508b674
  rtl-and-localisation: 85daae3ee5f0
  platforms-code-reference: 5a7a0e4767e5
---
# وسم

يعرض الوسم محتوى قصيرًا ذا تسمية، مثل حالة أو عامل تصفية مطبَّق، في عنصر صغير مستدير الحواف. ويمكن أن يحمل زر إزالة، ويقرّر التطبيق ما يترتب على إزالة الوسم.

## مثال

يعرض الوسم ذو زر الإزالة عامل تصفية مطبَّقًا، في قائمة طلبات خدمات مثلًا. ولزر الإزالة اسم ميسّر خاص به يذكر عامل التصفية الذي يزيله. ولا يزيل الوسم نفسه: يتولّى التطبيق طلب الإزالة ويحدّث قائمته. ومعالج الإزالة في الأمثلة معالج شكلي لا يفعل شيئًا؛ ويكتب التطبيق المعالج الذي يزيل الوسم.

```html live example=basic differences=chip-adapter-tone
<span class="hw-chip">الحالة: مفتوح<button type="button" aria-label="إزالة عامل التصفية (الحالة: مفتوح)"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button></span>
```

```tsx live example=basic
<Chip removeLabel="إزالة عامل التصفية (الحالة: مفتوح)" onRemove={() => undefined}>الحالة: مفتوح</Chip>
```

```vue live example=basic
<Chip label="الحالة: مفتوح" remove-label="إزالة عامل التصفية (الحالة: مفتوح)" @remove="() => undefined" />
```

```ts live example=basic framework=angular
template: `<hw-chip removeLabel="إزالة عامل التصفية (الحالة: مفتوح)" (removed)="null">الحالة: مفتوح</hw-chip>`
```

## الأشكال والحالات

### اللون الدلالي

تضبط الخاصية `tone` عائلة ألوان الوسم: `neutral` أو `success` أو `warning` أو `danger` أو `info`. وليس اللون الدلالي الوسيلةَ الوحيدة لنقل المعنى، فيذكر نص الوسم الحالة أيضًا.

```html live example=tone
<span class="hw-chip" data-tone="warning">بانتظار المستندات</span>
```

```tsx live example=tone
<Chip tone="warning">بانتظار المستندات</Chip>
```

```vue live example=tone
<Chip tone="warning" label="بانتظار المستندات" />
```

```ts live example=tone framework=angular
template: `<hw-chip tone="warning">بانتظار المستندات</hw-chip>`
```

### الشكل والحجم

يرسم الشكل `variant="outline"` الوسم بإطار بلون عائلته اللونية ودون تعبئة. وتأخذ الخاصية `size` القيمة `sm` أو `lg`؛ ودونها يكون للوسم الحجم الافتراضي. وتقبل React وVue وAngular أيضًا `variant="soft"`، ولا تستهدفه ورقة الأنماط، فيبدو الوسم ذو الشكل `soft` مثل وسم بلا شكل.

```html live example=sizes
<span class="hw-chip" data-tone="info" data-variant="outline" data-size="lg">مُقدَّم</span>
```

```tsx live example=sizes
<Chip tone="info" variant="outline" size="lg">مُقدَّم</Chip>
```

```vue live example=sizes
<Chip tone="info" variant="outline" size="lg" label="مُقدَّم" />
```

```ts live example=sizes framework=angular
template: `<hw-chip tone="info" variant="outline" size="lg">مُقدَّم</hw-chip>`
```

### التعطيل

تعطّل الخاصية `disabled` زر الإزالة في الوسم الذي يحمله. ويبقى نص الوسم مقروءًا.

```html live example=disabled differences=chip-adapter-tone
<span class="hw-chip">التصنيف: المستندات<button type="button" disabled aria-label="إزالة عامل التصفية (التصنيف: المستندات)"><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button></span>
```

```tsx live example=disabled
<Chip disabled removeLabel="إزالة عامل التصفية (التصنيف: المستندات)" onRemove={() => undefined}>التصنيف: المستندات</Chip>
```

```vue live example=disabled
<Chip disabled label="التصنيف: المستندات" remove-label="إزالة عامل التصفية (التصنيف: المستندات)" @remove="() => undefined" />
```

```ts live example=disabled framework=angular
template: `<hw-chip [disabled]="true" removeLabel="إزالة عامل التصفية (التصنيف: المستندات)" (removed)="null">التصنيف: المستندات</hw-chip>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-chip

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-chip'` | `true` | — |
| `data-tone` | `'danger' \| 'info' \| 'success' \| 'warning'` | `false` | — |
| `data-variant` | `'outline'` | `false` | — |
| `data-size` | `'lg' \| 'sm'` | `false` | — |

ليس للوسم متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر `span` بالصنف `hw-chip` ونصه. وتضبط الخاصية `data-tone` اللون الدلالي، واللون الدلالي المحايد هو الذي يُكتب دونها: فلا تستهدف ورقة الأنماط `data-tone` إلا بالقيم `success` و`warning` و`danger` و`info`. وتكتب React وVue وAngular الخاصية `data-tone` دائمًا (وقيمتها الافتراضية `neutral`)، فيحمل ناتجها خاصية لا يكتبها ترميز هذه الصفحة. وتضبط الخاصية `data-variant="outline"` المظهر ذا الإطار، وتأخذ الخاصية `data-size` القيمة `sm` أو `lg`. وعنصر الإزالة زر `button` عادي يحمل `type="button"` و`aria-label`، ويحتوي على عنصر `span` بالصنف `hw-icon` والخاصية `data-icon="cancel-01"`، ويوضع داخل الوسم؛ ولا يأخذ الصنف `hw-button`. ويزيل التطبيق الوسم بنفسه. وقبل أن يزيل وسمًا يقع التركيز على زره، يستدعي الدالة `prepareRemovalFocus` من `@hawiyah/core` بأربع وسائط: حاوية الوسوم، وزر الإزالة الذي فُعِّل، وكائن خيارات يضمّ محدِّد الوسم ومحدِّد زر الإزالة فيه، ويضمّ اختياريًا عنصرًا يتلقّى التركيز عندما لا يبقى وسم آخر له زر متاح، وبهذا العنصر ينقل الاستدعاء نفسه التركيز بعد الوسم الأخير. ويشغّل التطبيق الدالة التي يُرجعها الاستدعاء بعد الإزالة. فينتقل التركيز عندئذ إلى زر الإزالة في الوسم التالي، وإلا ففي الوسم السابق. ودون ذلك العنصر يضع التطبيق التركيز بنفسه عند إزالة الوسم الأخير.

### React

جدول: خصائص Chip

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | — |
| `tone` | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `false` | `'neutral'` |
| `variant` | `'soft' \| 'outline'` | `false` | — |
| `size` | `'sm' \| 'lg'` | `false` | — |
| `onRemove` | `() => void` | `false` | — |
| `removeLabel` | `string` | `false` | — |

العناصر الأبناء لـChip هي محتواه، وتصل الخصائص الأخرى إلى عنصر `span`. وتعرض الخاصية `onRemove` زر الإزالة؛ ودونها لا يكون للوسم زر إزالة. وما دامت `onRemove` مُمرَّرة تكون الخاصية `removeLabel` مطلوبة، وهي تسمّي زر الإزالة. ولا يزيل الوسم نفسه: تطلب `onRemove` من التطبيق إزالته. وتعطّل الخاصية `disabled` زر الإزالة. وعندما يُزال وسم وزره عليه التركيز، ينقل Chip التركيز إلى زر الإزالة في الوسم التالي، وإلا ففي الوسم السابق، فيجب أن تكون الوسوم عناصر شقيقة داخل عنصر أب واحد. وعندما يُزال الوسم الأخير، يضع التطبيق التركيز. وقيمة الخاصية `tone` هي `neutral` ما لم تُمرَّر، ولا تكتب الخاصيتان `variant` و`size` شيئًا ما لم تُمرَّرا.

### Vue

جدول: خصائص Chip وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `false` | — |
| `disabled` | prop | `boolean` | `false` | `false` |
| `removeLabel` | prop | `string` | `false` | — |
| `tone` | prop | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `false` | `'neutral'` |
| `variant` | prop | `'soft' \| 'outline'` | `false` | — |
| `size` | prop | `'sm' \| 'lg'` | `false` | — |
| `onRemove` | prop | `(() => void) \| (() => void)[]` | `false` | — |
| `default` | slot | — | `false` | — |

نص الوسم هو الخاصية `label` أو المنفذ `default`. ويعرض المستمع المربوط بـ`onRemove` (ويُكتب @remove في القالب) زرَّ الإزالة، ولا يحمل هذا الزر الصنف `hw-button`، وتسمّيه الخاصية `removeLabel` (وتُكتب remove-label في القالب)؛ والتسمية مطلوبة ما دام معالج مربوطًا. ولا يزيل الوسم نفسه: يطلب المعالج من التطبيق إزالته. وتعطّل الخاصية `disabled` زر الإزالة. وعندما يزيل التطبيق وسمًا كان التركيز على زره، ينتقل التركيز إلى زر الإزالة في الوسم التالي، وإلا ففي الوسم السابق؛ وعندما يُزال الوسم الأخير، يضع التطبيق التركيز. ويعرّف تصريح الحزمة `onRemove` خاصيةً للمكوّن. ويسرد الجدول المنفذ `default` لأن الإصدار المنشور يقرؤه؛ ولا يعرّف التصريح نوع أي منفذ.

### Angular

جدول: مُدخلات hw-chip ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `tone` | input | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `false` | `'neutral'` |
| `variant` | input | `'soft' \| 'outline'` | `false` | — |
| `size` | input | `'sm' \| 'lg'` | `false` | — |
| `disabled` | input | `boolean` | `false` | `false` |
| `removeLabel` | input | `string` | `false` | `''` |
| `removed` | output | `void` | `false` | — |
| `*` | content | — | `false` | — |

`HwChipComponent` (`hw-chip`) هو الوسم نفسه: يحمل عنصره المضيف الصنف `hw-chip`، ومحتوى العنصر هو نص الوسم. وما دام مستمع `(removed)` مربوطًا، ينتهي الوسم بزر إزالة عادي يحتوي على أيقونة الإلغاء من أيقونات الحزم، ويسمّيه المُدخل `removeLabel`، وهو مطلوب عندئذ فقط. ويعطّل المُدخل `disabled` زر الإزالة. وليس للمُخرج `(removed)` حمولة، وهو يطلب من التطبيق إزالة الوسم. والوسم الذي يُزال وزره عليه التركيز يسلّم التركيز إلى زر الإزالة في الوسم التالي المجاور له، وإلا ففي الوسم السابق؛ وعندما يُزال الوسم الأخير، يضع التطبيق التركيز، على عنصر التحكم الذي يضيف الوسوم مثلًا.

## إمكانية الوصول

الوسم نص في عنصر `span` (وفي Angular العنصر `hw-chip`): ليس له دور خاص به، ولا يقبل التركيز. وزر الإزالة عنصر `button` أصلي يحمل `type="button"`، فيصل إليه التركيز بالمفتاح <kbd>Tab</kbd>، ويُفعَّل بالمفتاح <kbd>Enter</kbd> أو <kbd>Space</kbd>، واسمه الميسّر هو قيمة `aria-label` التي تكتبها `removeLabel`.

- اكتب اسمًا يذكر ما يُزال، مثل «إزالة عامل التصفية (الحالة: مفتوح)». فالاسم «إزالة» وحده لا يبيّن لقارئ يستخدم التقنيات المساعدة الوسمَ الذي يتبعه الزر.
- الأيقونة داخل زر الإزالة مخفية عن التقنيات المساعدة، ويُسمّى الزر بتسميته وحدها.
- لا يغيّر اللون الدلالي إلا اللون. فاكتب المعنى في النص، ليصل أيضًا إلى القارئ الذي لا يدرك اللون.
- تنقل إزالةُ وسم عليه التركيز التركيزَ إلى زر الإزالة في الوسم المجاور، فلا يفقد مستخدم لوحة المفاتيح موضعه. وتفعل React وVue وAngular ذلك للوسوم الشقيقة داخل عنصر أب واحد؛ ومع ترميز vanilla يستدعي التطبيق `prepareRemovalFocus`. وعندما لا يبقى أي وسم، يضع التطبيق التركيز على عنصر تحكم يختاره.
- زر الإزالة المعطَّل لا يقبل التركيز ولا يُفعَّل.

## الاتجاه والتوطين

ليس في الوسم نص مدمج. يكتب التطبيق محتوى الوسم وتسمية زر الإزالة بلغة الصفحة، ويحتاج الوسم ذو زر الإزالة إلى قيمة `removeLabel` مترجمة أيضًا. ويرث الوسم لغة الصفحة واتجاهها، ويتبع زر الإزالة النص بترتيب الترميز، فيقع في نهاية النص، أي على اليسار في صفحة اتجاهها من اليمين إلى اليسار.

- ينتقل الوسم الموضوع في سطر من الوسوم إلى السطر التالي مع المحتوى السطري الآخر، ويتبع اتجاه القراءة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط الوسم بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تُدرج [ملاحظات التغطية](../coverage.md) الوسم ضمن مكوّنات المحتوى الإضافية.
