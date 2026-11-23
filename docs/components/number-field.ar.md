---
source:
  summary: 6b92f10f9a8e
  example: 937fc57b09c4
  variants-and-states: 05f5562c6102
  api: d553e92fcef5
  accessibility: 712507e006ee
  rtl-and-localisation: ab7b8a64558f
  platforms-code-reference: eed38220bea1
---
# حقل رقمي

الحقل الرقمي حقل لإدخال رقم، يعرض عنصر إدخال أرقام أصليًا بأنماط هوية، ومعه تسمية ظاهرة ونص إرشادي ورسالة خطأ عندما يوفّرها التطبيق. ويحتفظ بالقيود الأصلية `min` و`max` و`step`، ويبقى عنصر الإدخال الفارغ فارغًا ولا يصير صفرًا.

## مثال

للحقل تسمية ظاهرة تبيّن الكمية المطلوبة. ويذكر النص الإرشادي النطاق المسموح به، ويحصر القيدان الأصليان `min` و`max` الزيادة والإنقاص بالخطوة في هذا النطاق، ويمنعان الإرسال بقيمة خارجه.

```html live example=basic differences=number-field-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="basic-copies" id="basic-copies-label">عدد النسخ</label>
  <input class="hw-input hw-number-field" id="basic-copies" name="copies" type="number" min="1" max="10" aria-describedby="basic-copies-hint">
  <p class="hw-hint" id="basic-copies-hint">أدخل رقمًا من 1 إلى 10.</p>
</div>
```

```tsx live example=basic
<NumberField label="عدد النسخ" name="copies" min={1} max={10} hint="أدخل رقمًا من 1 إلى 10." />
```

```vue live example=basic
<NumberField label="عدد النسخ" name="copies" :min="1" :max="10" hint="أدخل رقمًا من 1 إلى 10." />
```

```ts live example=basic framework=angular
template: `<hw-number-field label="عدد النسخ" name="copies" [min]="1" [max]="10" hint="أدخل رقمًا من 1 إلى 10." />`
```

## الأشكال والحالات

### حقل مطلوب

يعرض الحقل المطلوب علامة واحدة بعد تسميته، ويحتفظ بالخاصية الأصلية `required`، فيطبّق المتصفح تحققه الخاص من قيود الإدخال عند الإرسال.

```html live example=required differences=number-field-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="required-copies" id="required-copies-label">عدد النسخ<span class="hw-required-marker" aria-hidden="true"> *</span></label>
  <input class="hw-input hw-number-field" id="required-copies" name="copies" type="number" required>
</div>
```

```tsx live example=required
<NumberField label="عدد النسخ" name="copies" required />
```

```vue live example=required
<NumberField label="عدد النسخ" name="copies" required />
```

```ts live example=required framework=angular
template: `<hw-number-field label="عدد النسخ" name="copies" [required]="true" />`
```

### حقل فيه خطأ

يظهر الخطأ في فقرة بعد عنصر التحكم، ويحمل عنصر الإدخال الخاصية `aria-invalid="true"`، وتصفه الرسالة. وتذكر الرسالة ما الخطأ وكيف يُصحَّح.

```html live example=error differences=number-field-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="error-copies" id="error-copies-label">عدد النسخ</label>
  <input class="hw-input hw-number-field" id="error-copies" name="copies" type="number" min="1" max="10" value="12" aria-invalid="true" aria-describedby="error-copies-error">
  <p class="hw-error" id="error-copies-error">أدخل رقمًا من 1 إلى 10.</p>
</div>
```

```tsx live example=error
<NumberField label="عدد النسخ" name="copies" min={1} max={10} defaultValue={12} error="أدخل رقمًا من 1 إلى 10." />
```

```vue live example=error
<NumberField label="عدد النسخ" name="copies" :min="1" :max="10" :default-value="12" error="أدخل رقمًا من 1 إلى 10." />
```

```ts live example=error framework=angular
template: `<hw-number-field label="عدد النسخ" name="copies" [min]="1" [max]="10" [value]="12" error="أدخل رقمًا من 1 إلى 10." />`
```

### للقراءة فقط

يحمل الحقل المخصّص للقراءة فقط الخاصية الأصلية `readonly`: فيحتفظ بقيمته في النموذج، ويبقى في ترتيب التنقل بالمفتاح Tab، فيستطيع القارئ نقل التركيز إليه وتحديد القيمة، ولا يستطيع تغييرها.

```html live example=readonly differences=number-field-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="readonly-copies" id="readonly-copies-label">عدد النسخ الصادرة</label>
  <input class="hw-input hw-number-field" id="readonly-copies" name="copies" type="number" value="2" readonly>
</div>
```

```tsx live example=readonly
<NumberField label="عدد النسخ الصادرة" name="copies" defaultValue={2} readOnly />
```

```vue live example=readonly
<NumberField label="عدد النسخ الصادرة" name="copies" :default-value="2" readonly />
```

```ts live example=readonly framework=angular
template: `<hw-number-field label="عدد النسخ الصادرة" name="copies" [value]="2" [readOnly]="true" />`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-number-field

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-number-field'` | `true` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس للحقل الرقمي متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر إدخال أصليًا بالخاصية `type="number"` وبالصنفين `hw-input` و`hw-number-field` داخل عنصر بالصنف `hw-field`، وعنصر `label` بالصنف `hw-label` تشير خاصيته `for` إلى عنصر الإدخال، وعند الحاجة فقرةً بالصنف `hw-hint` أو `hw-error` بعده. ويمنح الصنف `hw-number-field` أرقام عنصر الإدخال عرضًا جدوليًا موحّدًا. واربط الفقرة بعنصر الإدخال عبر الخاصية `aria-describedby`؛ فلا يربطهما أي برنامج نصي. واكتب على عنصر الإدخال الخصائص الأصلية `min` و`max` و`step` و`required` و`readonly`، واكتب الخاصية `aria-invalid="true"` مع رسالة `hw-error` الظاهرة للقيمة غير الصالحة.

### React

جدول: خصائص NumberField

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

يعرض NumberField المكوّن TextField مع `type="number"` والصنف `hw-number-field`، فيقبل خصائص عنصر الإدخال الأصلي، ومنها `name` و`value` و`defaultValue` و`onChange` و`min` و`max` و`step` و`required` و`disabled` و`readOnly` و`ref`، وتصل إلى عنصر الإدخال. والتسمية والنص الإرشادي والخطأ محتوى React قابل للعرض. ويُعرض النص الإرشادي والخطأ فقرتين بعد عنصر الإدخال ويرتبطان به، وتضبط الخاصية `error` غير الفارغة `aria-invalid`. ويعرض الحقل المطلوب ذو التسمية الظاهرة علامة واحدة؛ فلا تكتب نجمة في `label`. ويبقى عنصر الإدخال الفارغ فارغًا، ولا يُحوَّل إلى صفر. ويُرجع عنصر إدخال الأرقام الأصلي قيمته سلسلةً نصية في `onChange`، فحوّلها إلى رقم عندما يستخدمها التطبيق.

### Vue

جدول: خصائص NumberField وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `modelValue` | prop | `number \| ''` | `false` | — |
| `defaultValue` | prop | `number \| ''` | `false` | `''` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: number \| '') => void` | `false` | — |

يربط `v-model` القيمة، وهي رقم أو السلسلة النصية الفارغة `''`؛ ويُرسل المكوّن عند مسح عنصر الإدخال القيمة `''`، ولا يفترض صفرًا. وتضبط الخاصية `defaultValue` القيمة الأولية لحقل غير متحكَّم فيه. والخصائص `label` و`hint` و`error` سلاسل نصية؛ ويُعرض النص الإرشادي والخطأ فقرتين بعد عنصر الإدخال ويرتبطان به، وتضبط الخاصية `error` غير الفارغة `aria-invalid`. وتعرض الخاصية `required` علامة واحدة بعد التسمية، وتضبط خاصية HTML الأصلية. والخاصيتان `disabled` و`readonly` منطقيتان. وتصل خصائص HTML الأخرى، مثل `name` و`min` و`max` و`step`، والمستمعات إلى عنصر الإدخال الأصلي. ويتيح المكوّن `element` و`focus()` عبر مرجع القالب. ولا يعرّف التصريح المنشور نوع أي منفذ، ولا يقرأ NumberField أي منفذ.

### Angular

جدول: مُدخلات hw-number-field ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `controlId` | input | `string \| null \| undefined` | `false` | — |
| `label` | input | `string` | `false` | `''` |
| `name` | input | `string` | `false` | `''` |
| `hint` | input | `string` | `false` | `''` |
| `error` | input | `string` | `false` | `''` |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `aria-invalid` | input | `boolean` | `false` | `false` |
| `form` | input | `string \| null` | `false` | `null` |
| `required` | input | `boolean` | `false` | — |
| `disabled` | input | `boolean` | `false` | `false` |
| `value` | input | `number \| null` | `false` | `null` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `min` | input | `number \| null` | `false` | `null` |
| `max` | input | `number \| null` | `false` | `null` |
| `step` | input | `number \| 'any'` | `false` | `1` |
| `valueChange` | output | `null \| number` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |

يعرض `HwNumberFieldComponent` (`hw-number-field`) الحقل والتسمية وعنصر إدخال الأرقام الأصلي والنص الإرشادي والخطأ. اربط `[(value)]` ربطًا ثنائي الاتجاه بقيمة من النوع `number | null`؛ ويعمل المكوّن أيضًا عنصرَ تحكم في النموذج عبر موصّل القيمة الخاص به. ويُقابَل عنصر الإدخال الأصلي الفارغ أو غير الصالح بالقيمة `null`، والنص الذي لم يصر رقمًا بعد يُرسل `null` ويبقى في عنصر الإدخال. والمُدخلان `min` و`max` رقمان أو `null`، والمُدخل `step` رقم أو `'any'`؛ ويبقى التحقق الأصلي فعّالًا. والمُدخلات `required` و`disabled` و`readOnly` منطقية، فيُضبط المُدخل نفسه بكتابة `[required]="true"` أو بكتابة الخاصية `required` دون قيمة. ويحتاج الحقل إلى `label`، أو إلى `aria-label` أو `aria-labelledby` مكتوبة على `hw-number-field`، أو إلى تسمية عنصر `hw-field` يحيط به؛ وتُمرَّر هذه الخصائص إلى عنصر الإدخال وتُزال من العنصر المضيف. ويضبط `controlId` معرّف عنصر الإدخال؛ ويتقدّم معرّف التطبيق، ثم معرّف `hw-field` المحيط، ثم معرّف مولَّد.

## إمكانية الوصول

الحقل الرقمي عنصر إدخال أرقام أصلي، فيوفّر المتصفح دوره وسلوك التركيز عليه وتحرير النص فيه والتعامل مع لوحة المفاتيح، ومن ذلك الزيادة والإنقاص بالخطوة الأصلية بمفاتيح الأسهم إذا كان المتصفح يتيحها. والتسمية عنصر `label` أصلي تشير خاصيته `for` إلى عنصر الإدخال، فيكون نص التسمية هو الاسم الميسّر، وينقل النقر عليها التركيز إلى الحقل. ويرتبط النص الإرشادي والخطأ بعنصر الإدخال وصفًا له.

- تُضبط الخاصية `aria-invalid="true"` عندما يمرّر التطبيق قيمة غير فارغة لـ`error` أو يمرّر `aria-invalid`، أو عندما يكون في `Field` أو `hw-field` المحيط خطأ. ولا يضبط الحقل الرقمي هذه الخاصية من تلقاء نفسه بعد إرسال فاشل.
- عندما يمنع المتصفح الإرسال لأن حقلًا مطلوبًا فارغ، أو لأن قيمة تخرج عن `min` أو `max` أو `step`، ينقل المتصفح التركيز إلى الحقل ويعرض رسالته الخاصة.
- تُخفى علامة الحقل المطلوب عن التقنيات المساعدة؛ وتعبّر الخاصية الأصلية `required` عن أن الحقل مطلوب.
- تُرسَل قيمة الحقل المخصّص للقراءة فقط مع النموذج ما دامت HTML تسمح بذلك، ويبقى الحقل في ترتيب التنقل بالمفتاح Tab.
- استخدم عنصر إدخال نصيًا، لا الحقل الرقمي، للمعرّفات وأرقام الحسابات المصرفية الدولية (IBAN) والقيم الأخرى التي يجب أن تُحفظ سلسلتها النصية كما هي تمامًا.

## الاتجاه والتوطين

ليس في الحقل الرقمي نص مدمج: يكتب التطبيق التسمية والنص الإرشادي والخطأ بلغة الصفحة. ويرث العنصر لغة الصفحة واتجاهها، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية، فتتبع التسمية والفقرات التي بعد عنصر الإدخال اتجاه القراءة.

- قيمة عنصر إدخال الأرقام الأصلي قيمة مخصّصة للمعالجة الآلية، بأرقام لاتينية وبنقطة فاصلةً عشرية؛ ويتبع عرض الأرقام والفاصلة في عنصر الإدخال المتصفحَ وإعداداته المحلية. ويحمل ترميز vanilla، و`value` و`defaultValue` اللتان يكتبهما تطبيق React، والقيمة المربوطة في Vue، و`value` في Angular (من النوع `number | null`) الرقمَ نفسه، لا سلسلة نصية منسّقة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط الحقل الرقمي بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات حقول الإدخال](../nic-inputs.md) لعناصر التحكم في النماذج حجم التسمية ووزن خطها، وحشوة عنصر الإدخال، وحالات المرور بالمؤشر والضغط والتركيز، والخط السفلي، الواردة في ورقة أنماط كود المنصات المزوَّدة، وتذكر درجة الثقة في كل ربط.
- ألوان التحقق في الحقل تكييف للمصدر، وهذا التكييف موثّق في ملاحظات حقول الإدخال؛ وتُدرج [ملاحظات التغطية](../coverage.md) الحقل الرقمي ضمن عناصر التحكم الإضافية، وتذكر نوع الإدخال الرقمي الخاص به.
