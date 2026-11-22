---
source:
  summary: fd7687a25cfa
  example: 76c8d3edfbc5
  variants-and-states: fbe4f39d0237
  api: 695f033ea0e0
  accessibility: a119b35db975
  rtl-and-localisation: 73181ff498ef
  platforms-code-reference: 4522a1524c17
---
# إدخال نصي

الإدخال النصي حقل لإدخال سطر واحد من النص، يعرض عنصر إدخال أصليًا بأنماط هوية، ومعه تسمية ظاهرة ونص إرشادي ورسالة خطأ عندما يوفّرها التطبيق. وتبقى القيمة سلسلة نصية، وتبقى لعنصر الإدخال دلالاته الأصلية وتحققه الأصلي من صحة القيمة.

## مثال

للحقل تسمية ظاهرة تبيّن المعلومة المطلوبة. ويذكر النص الإرشادي الصيغة أو الغرض، ويرتبط بعنصر الإدخال.

```html live example=basic differences=text-field-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="basic-name" id="basic-name-label">الاسم الكامل</label>
  <input class="hw-input" id="basic-name" name="full-name" autocomplete="name" aria-describedby="basic-name-hint">
  <p class="hw-hint" id="basic-name-hint">اكتب الاسم كما هو مدوَّن في وثيقة إثبات الهوية.</p>
</div>
```

```tsx live example=basic
<TextField label="الاسم الكامل" name="full-name" autoComplete="name" hint="اكتب الاسم كما هو مدوَّن في وثيقة إثبات الهوية." />
```

```vue live example=basic
<TextField label="الاسم الكامل" name="full-name" autocomplete="name" hint="اكتب الاسم كما هو مدوَّن في وثيقة إثبات الهوية." />
```

```ts live example=basic framework=angular
template: `<hw-text-field label="الاسم الكامل" name="full-name" autocomplete="name" hint="اكتب الاسم كما هو مدوَّن في وثيقة إثبات الهوية." />`
```

## الأشكال والحالات

### حقل مطلوب

يعرض الحقل المطلوب علامة واحدة بعد تسميته، ويحتفظ بالخاصية الأصلية `required`، فيطبّق المتصفح تحققه الخاص من قيود الإدخال عند الإرسال.

```html live example=required differences=text-field-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="required-mobile" id="required-mobile-label">رقم الجوال<span class="hw-required-marker" aria-hidden="true"> *</span></label>
  <input class="hw-input" id="required-mobile" name="mobile" type="tel" autocomplete="tel" required>
</div>
```

```tsx live example=required
<TextField label="رقم الجوال" name="mobile" type="tel" autoComplete="tel" required />
```

```vue live example=required
<TextField label="رقم الجوال" name="mobile" type="tel" autocomplete="tel" required />
```

```ts live example=required framework=angular
template: `<hw-text-field label="رقم الجوال" name="mobile" type="tel" autocomplete="tel" [required]="true" />`
```

### حقل فيه خطأ

يظهر الخطأ في فقرة بعد عنصر الإدخال، ويحمل عنصر الإدخال الخاصية `aria-invalid="true"`، وتصفه الرسالة. وتذكر الرسالة ما الخطأ وكيف يُصحَّح.

```html live example=error differences=text-field-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="error-email" id="error-email-label">البريد الإلكتروني</label>
  <input class="hw-input" id="error-email" name="email" type="email" autocomplete="email" value="applicant.example.com" aria-invalid="true" aria-describedby="error-email-error">
  <p class="hw-error" id="error-email-error">أدخل البريد الإلكتروني بالصيغة name@example.com.</p>
</div>
```

```tsx live example=error
<TextField label="البريد الإلكتروني" name="email" type="email" autoComplete="email" defaultValue="applicant.example.com" error="أدخل البريد الإلكتروني بالصيغة name@example.com." />
```

```vue live example=error
<TextField label="البريد الإلكتروني" name="email" type="email" autocomplete="email" default-value="applicant.example.com" error="أدخل البريد الإلكتروني بالصيغة name@example.com." />
```

```ts live example=error framework=angular
template: `<hw-text-field label="البريد الإلكتروني" name="email" type="email" autocomplete="email" value="applicant.example.com" error="أدخل البريد الإلكتروني بالصيغة name@example.com." />`
```

### حقل معطَّل

يستخدم الحقل المعطَّل الخاصية الأصلية `disabled`.

```html live example=disabled differences=text-field-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="disabled-email" id="disabled-email-label">البريد الإلكتروني</label>
  <input class="hw-input" id="disabled-email" name="email" type="email" autocomplete="email" value="applicant@example.com" disabled>
</div>
```

```tsx live example=disabled
<TextField label="البريد الإلكتروني" name="email" type="email" autoComplete="email" defaultValue="applicant@example.com" disabled />
```

```vue live example=disabled
<TextField label="البريد الإلكتروني" name="email" type="email" autocomplete="email" default-value="applicant@example.com" disabled />
```

```ts live example=disabled framework=angular
template: `<hw-text-field label="البريد الإلكتروني" name="email" type="email" autocomplete="email" value="applicant@example.com" [disabled]="true" />`
```

### حقل مخصّص للقراءة فقط

يحتفظ الحقل المخصّص للقراءة فقط بقيمته في النموذج، ويبقى في ترتيب التنقل بالمفتاح Tab، فيستطيع القارئ نقل التركيز إليه وتحديد نصه، ولا يستطيع تغييره.

```html live example=readonly differences=text-field-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="readonly-organisation" id="readonly-organisation-label">الجهة</label>
  <input class="hw-input" id="readonly-organisation" name="organisation" autocomplete="organization" value="شركة المثال التجارية" readonly>
</div>
```

```tsx live example=readonly
<TextField label="الجهة" name="organisation" autoComplete="organization" defaultValue="شركة المثال التجارية" readOnly />
```

```vue live example=readonly
<TextField label="الجهة" name="organisation" autocomplete="organization" default-value="شركة المثال التجارية" readonly />
```

```ts live example=readonly framework=angular
template: `<hw-text-field label="الجهة" name="organisation" autocomplete="organization" value="شركة المثال التجارية" [readOnly]="true" />`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-input

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-input'` | `true` | — |
| `aria-invalid` | `'true'` | `false` | — |
| `readonly` | `boolean` | `false` | — |
| `type` | `'number' \| 'search'` | `false` | — |
| `data-size` | `'lg' \| 'sm'` | `false` | — |
| `data-variant` | `'filled'` | `false` | — |
| `data-hw-filled` | `'true'` | `false` | — |

ليس للإدخال النصي متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر إدخال أصليًا بالصنف `hw-input` داخل عنصر بالصنف `hw-field`، وعنصر `label` بالصنف `hw-label` تشير خاصيته `for` إلى عنصر الإدخال، وعند الحاجة فقرةً بالصنف `hw-hint` أو `hw-error` بعد عنصر الإدخال. واربط الفقرة بعنصر الإدخال عبر الخاصية `aria-describedby`؛ فلا يربطهما أي برنامج نصي. وللحقل غير الصالح اكتب الخاصية `aria-invalid="true"` على عنصر الإدخال مع رسالة `hw-error` الظاهرة. وتغيّر الخاصية `data-size` ارتفاع الحقل بإحدى القيمتين `sm` و`lg`، وتضبط الخاصية `data-variant="filled"` المظهر المملوء؛ ودونهما يكون الحقل بالمظهر ذي الإطار وبالحجم المتوسط. والخاصية `readonly` هي الخاصية الأصلية. وتستهدف ورقة الأنماط `type="number"` و`type="search"` بمظهر خاص بكل منهما؛ ولا تحتاج الأنواع الأصلية الأخرى إلى أي خاصية من ورقة الأنماط. والخاصية `data-hw-filled` خاصية حالة تضبطها الدالة `enhance()` من حزمة vanilla على `true` أو `false` في الحقل المكتوب يدويًا، بحسب احتواء عنصر الإدخال على قيمة؛ فلا تكتب لها قيمة بنفسك.

### React

جدول: خصائص TextField

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

يقبل TextField أيضًا خصائص عنصر الإدخال الأصلي، ومنها `name` و`type` و`value` و`defaultValue` و`onChange` و`required` و`disabled` و`readOnly` و`autoComplete` و`ref`، وتصل إلى عنصر الإدخال؛ فالمرجع يصل إلى عنصر الإدخال لا إلى تسميته. مرّر `value` مع `onChange` لحقل متحكَّم فيه، أو `defaultValue` لحقل غير متحكَّم فيه. والتسمية والنص الإرشادي والخطأ محتوى React قابل للعرض. ويُعرض النص الإرشادي والخطأ فقرتين بعد عنصر الإدخال ويرتبطان به، وتضبط الخاصية `error` غير الفارغة `aria-invalid`. ويعرض الحقل المطلوب ذو التسمية الظاهرة علامة واحدة؛ فلا تكتب نجمة في `label`. وعندما لا تُمرَّر أي من `label` و`hint` و`error`، يعرض TextField عنصر الإدخال وحده، ويحتاج إلى اسم ميسّر من `aria-label` أو `aria-labelledby`، أو من مكوّن `Field` يحيط به. والقيمة سلسلة نصية في كل أنواع الإدخال؛ فعنصر إدخال الأرقام الأصلي يُرجع سلسلة نصية أيضًا، فحوّلها إلى رقم عندما يستخدمها التطبيق، أو استخدم `NumberField` لقيمة رقمية. وليس لـTextField خاصية مكوّن للحجم أو للشكل: اكتب `data-size` أو `data-variant` خاصيةَ HTML أصلية، فتصل إلى عنصر الإدخال.

### Vue

جدول: خصائص TextField وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `options` | prop | `readonly Option[]` | `false` | — |
| `modelValue` | prop | `string` | `false` | — |
| `defaultValue` | prop | `string` | `false` | — |
| `placeholder` | prop | `string` | `false` | — |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: string) => void` | `false` | — |
| `default` | slot | — | `false` | — |

يربط `v-model` القيمة النصية، وتضبط الخاصية `defaultValue` القيمة الأولية لحقل غير متحكَّم فيه. والقيمة سلسلة نصية في كل أنواع الإدخال. والخصائص `label` و`hint` و`error` سلاسل نصية؛ ويُعرض النص الإرشادي والخطأ فقرتين بعد عنصر الإدخال ويرتبطان به، وتضبط الخاصية `error` غير الفارغة `aria-invalid`. وتعرض الخاصية `required` علامة واحدة بعد التسمية، وتضبط خاصية HTML الأصلية. وتصل خصائص HTML الأخرى، مثل `name` و`type` و`disabled` و`readonly` و`autocomplete`، والمستمعات إلى عنصر الإدخال الأصلي. ويتيح المكوّن `element` و`focus()` عبر مرجع القالب. وليس لـTextField خاصية مكوّن للحجم أو للشكل: اكتب `data-size` أو `data-variant` خاصيةَ HTML أصلية، فتصل إلى عنصر الإدخال. ويسرد الجدول الخاصية `options` لأن التصريح المنشور لـTextField يتضمّنها، والمنفذ `default` لأن الإصدار المنشور يقرؤه؛ ولا يعرّف التصريح نوع أي منفذ. ولا يُقرأ أيٌّ منهما إلا لقائمة اختيار تشترك مع المكوّن في الدالة المُنشئة نفسها، فلا يستخدم عنصر الإدخال النصي أيًّا منهما.

### Angular

جدول: مُدخلات hw-text-field ومخرجاته ومحتواه

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
| `value` | input | `string` | `false` | `''` |
| `size` | input | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `visualVariant` | input | `'outline' \| 'filled'` | `false` | `'outline'` |
| `type` | input | `'text' \| 'email' \| 'password' \| 'tel' \| 'url' \| 'search' \| 'date' \| 'datetime-local' \| 'month' \| 'week' \| 'time' \| 'number' \| 'color' \| 'range'` | `false` | `'text'` |
| `placeholder` | input | `string` | `false` | `''` |
| `autocomplete` | input | `string` | `false` | `'off'` |
| `inputmode` | input | `string` | `false` | `''` |
| `min` | input | `string \| number \| null` | `false` | `null` |
| `max` | input | `string \| number \| null` | `false` | `null` |
| `step` | input | `string \| number \| null` | `false` | `null` |
| `minLength` | input | `number \| null` | `false` | `null` |
| `maxLength` | input | `number \| null` | `false` | `null` |
| `pattern` | input | `string \| null` | `false` | `null` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |

يعرض `HwTextFieldComponent` (`hw-text-field`) الحقل والتسمية وعنصر الإدخال الأصلي والنص الإرشادي والخطأ. اربط `[(value)]` ربطًا ثنائي الاتجاه بالقيمة النصية؛ ويعمل المكوّن أيضًا عنصرَ تحكم في النموذج عبر موصّل القيمة الخاص به. ولا يكتب المكوّن قيمة في عنصر الإدخال الأصلي إلا إذا تغيّرت القيمة المربوطة من خارجه ولم يكن عنصر الإدخال يعرضها، فلا يُستبدل أبدًا نصٌّ في أثناء كتابته. ويضبط المُدخلان `size` و`visualVariant` مظهر عنصر الإدخال الأصلي. والمُدخلات `required` و`disabled` و`readOnly` منطقية، فيُضبط المُدخل نفسه بكتابة `[required]="true"` أو بكتابة الخاصية `required` دون قيمة. وتمرّر المُدخلات `min` و`max` و`step` و`minLength` و`maxLength` و`pattern` القيود الأصلية إذا كان نوع الإدخال يدعمها. ويحتاج الحقل إلى `label`، أو إلى `aria-label` أو `aria-labelledby` مكتوبة على `hw-text-field`، أو إلى تسمية عنصر `hw-field` يحيط به؛ وتُمرَّر هذه الخصائص إلى عنصر الإدخال وتُزال من العنصر المضيف. ويضبط `controlId` معرّف عنصر الإدخال؛ ويتقدّم معرّف التطبيق، ثم معرّف `hw-field` المحيط، ثم معرّف مولَّد. ودون المُدخل `autocomplete` يكتب الحقل `autocomplete="off"`، فاكتب قيمة قياسية، مثل `name` أو `email`، عندما يطلب الحقل معلومات القارئ نفسه.

## إمكانية الوصول

الإدخال النصي عنصر إدخال أصلي، فيوفّر المتصفح دوره وسلوك التركيز عليه وتحرير النص فيه والتعامل مع لوحة المفاتيح. والتسمية عنصر `label` أصلي تشير خاصيته `for` إلى عنصر الإدخال، فيكون نص التسمية هو الاسم الميسّر، وينقل النقر عليها التركيز إلى الحقل. ويرتبط النص الإرشادي والخطأ بعنصر الإدخال وصفًا له.

- تُضبط الخاصية `aria-invalid="true"` عندما يمرّر التطبيق قيمة غير فارغة لـ`error` أو يمرّر `aria-invalid`، أو عندما يكون في `Field` أو `hw-field` المحيط خطأ. ولا يضبط الإدخال النصي هذه الخاصية من تلقاء نفسه بعد إرسال فاشل.
- تطبّق ورقة الأنماط على الحقل انتقالًا متحرّكًا، وتلغيه عندما يطلب القارئ تقليل الحركة.
- عندما يمنع المتصفح الإرسال لأن حقلًا مطلوبًا فارغ، ينقل المتصفح التركيز إلى الحقل ويعرض رسالته الخاصة.
- تُخفى علامة الحقل المطلوب عن التقنيات المساعدة؛ وتعبّر الخاصية الأصلية `required` عن أن الحقل مطلوب.
- تُرسَل قيمة الحقل المخصّص للقراءة فقط مع النموذج ما دامت HTML تسمح بذلك، وتمنحه ورقة الأنماط مؤشر تركيز.

## الاتجاه والتوطين

ليس في الإدخال النصي نص مدمج: يكتب التطبيق التسمية والنص الإرشادي والخطأ والنص النائب بلغة الصفحة. ويرث العنصر لغة الصفحة واتجاهها، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية، فتتبع التسمية والنص والفقرات التي بعد عنصر الإدخال اتجاه القراءة.

- قيم أنواع إدخال التاريخ والوقت قيم مخصّصة للمعالجة الآلية بصيغ HTML، مستقلة عن طريقة عرض المتصفح لها؛ ويخزّن عنصر إدخال التاريخ تاريخًا ميلاديًا بصيغة ISO.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط الإدخال النصي بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات حقول الإدخال](../nic-inputs.md) حجم التسمية ووزن خطها، وحشوة عنصر الإدخال، وحالات المرور بالمؤشر والضغط والتركيز، والخط السفلي، الواردة في ورقة أنماط كود المنصات المزوَّدة، وتذكر درجة الثقة في كل ربط.
- الخط السفلي في المصدر محايد. وتحتفظ هوية بألوان التحقق الخاصة بها: حقل اختياري فارغ بلون محايد، وحقل غير فارغ صالح باللون الأخضر ما دام عليه التركيز، وحقل باللون الأحمر سبق التفاعل معه وقيمته غير صالحة أو فيه خطأ صريح من التطبيق؛ وهذا التكييف موثّق في ملاحظات حقول الإدخال.
