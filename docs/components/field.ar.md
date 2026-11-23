---
source:
  summary: c14da6d11379
  example: 2f5dff4a66cc
  variants-and-states: d3b0863b7c70
  api: 5fee194d61e5
  accessibility: 852a9e22609d
  rtl-and-localisation: 11557329857f
  platforms-code-reference: 5b0a796cf2ab
---
# حقل

يجمع الحقل تسمية ظاهرة ونصًا إرشاديًا اختياريًا ورسالة خطأ اختيارية حول عنصر تحكم واحد في النموذج. ويعرض العنصر الحاوي والتسمية والفقرتين، ويمنح مكوّن التحكم بالقيمة من هوية الموجود داخله اسمه ووصفه؛ أما عنصر التحكم الأصلي فيربطه التطبيق بنفسه.

## مثال

يسمّي الحقل المعلومة المطلوبة بتسمية ظاهرة، ويذكر غرضها في نص إرشادي. ويأخذ مكوّن التحكم بالقيمة من هوية المصرَّح به داخل الحقل معرّفَ الحقل، واسمَه الميسّر من التسمية، ووصفَه من النص الإرشادي، فلا يحتاج إلى `label` خاص به. وفي ترميز vanilla يكتب التطبيق الخصائص `for` و`id` و`aria-describedby` نفسها بنفسه.

```html live example=basic differences=field-adapter-markup
<div class="hw-field">
  <label class="hw-label" for="basic-title" id="basic-title-label">عنوان الطلب</label>
  <input class="hw-input" id="basic-title" name="title" aria-describedby="basic-title-hint">
  <p class="hw-hint" id="basic-title-hint">اكتب عنوانًا قصيرًا يميّز الطلب.</p>
</div>
```

```tsx live example=basic
<Field controlId="basic-title" label="عنوان الطلب" hint="اكتب عنوانًا قصيرًا يميّز الطلب.">
  <TextField name="title" />
</Field>
```

```vue live example=basic
<Field control-id="basic-title" label="عنوان الطلب" hint="اكتب عنوانًا قصيرًا يميّز الطلب.">
  <TextField name="title" />
</Field>
```

```ts live example=basic framework=angular
template: `<hw-field controlId="basic-title" label="عنوان الطلب" hint="اكتب عنوانًا قصيرًا يميّز الطلب."><hw-text-field name="title" /></hw-field>`
```

## الأشكال والحالات

### حقل مطلوب

يعرض الحقل المطلوب علامة واحدة بعد تسميته. والعلامة مخفية عن التقنيات المساعدة، فيعبّر عنصر التحكم الأصلي عن أن الحقل مطلوب بخاصيته `required`، ويكتبها التطبيق.

```html live example=required differences=field-adapter-markup
<div class="hw-field">
  <label class="hw-label" for="required-title" id="required-title-label">عنوان الطلب<span class="hw-required-marker" aria-hidden="true"> *</span></label>
  <input class="hw-input" id="required-title" name="title" required>
</div>
```

```tsx live example=required
<Field controlId="required-title" label="عنوان الطلب" required>
  <input className="hw-input" id="required-title" name="title" required />
</Field>
```

```vue live example=required
<Field control-id="required-title" label="عنوان الطلب" required v-slot="field">
  <input class="hw-input" :id="field.id" name="title" :required="field.required" />
</Field>
```

```ts live example=required framework=angular
template: `<hw-field #f controlId="required-title" label="عنوان الطلب" [required]="true"><input class="hw-input" [id]="f.controlId" name="title" [required]="f.required"></hw-field>`
```

### حقل فيه خطأ

يظهر الخطأ في فقرة بعد عنصر التحكم. ويكتب التطبيق الخاصية `aria-invalid="true"` على عنصر التحكم الأصلي، وتصفه الرسالة، وتذكر الرسالة ما الخطأ وكيف يُصحَّح.

```html live example=error differences=field-adapter-markup
<div class="hw-field">
  <label class="hw-label" for="error-title" id="error-title-label">عنوان الطلب</label>
  <input class="hw-input" id="error-title" name="title" aria-invalid="true" aria-describedby="error-title-error">
  <p class="hw-error" id="error-title-error">أدخل عنوانًا للطلب.</p>
</div>
```

```tsx live example=error
<Field controlId="error-title" label="عنوان الطلب" error="أدخل عنوانًا للطلب.">
  <input className="hw-input" id="error-title" name="title" aria-invalid="true" aria-describedby="error-title-error" />
</Field>
```

```vue live example=error
<Field control-id="error-title" label="عنوان الطلب" error="أدخل عنوانًا للطلب." v-slot="field">
  <input class="hw-input" :id="field.id" name="title" :aria-invalid="field.invalid ? 'true' : undefined" :aria-describedby="field.describedby" />
</Field>
```

```ts live example=error framework=angular
template: `<hw-field #f controlId="error-title" label="عنوان الطلب" error="أدخل عنوانًا للطلب."><input class="hw-input" [id]="f.controlId" name="title" [attr.aria-invalid]="f.invalid ? 'true' : null" [attr.aria-describedby]="f.descriptionIds"></hw-field>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العناصر hw-field وhw-label وhw-hint وhw-error

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-field' \| 'hw-label' \| 'hw-hint' \| 'hw-error'` | `true` | — |
| `role` | `'status'` | `false` | — |

ليس للحقل متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصرًا بالصنف `hw-field` يضمّ عنصر `label` بالصنف `hw-label` تشير خاصيته `for` إلى عنصر التحكم، ثم عنصر التحكم، ثم عند الحاجة فقرةً بالصنف `hw-hint` أو `hw-error` بعده. وامنح فقرتي النص الإرشادي والخطأ الخاصية `id`، واكتب الخاصية `aria-describedby` على عنصر التحكم بنفسك؛ فلا يكتبها أي برنامج نصي. والخاصية `id` على التسمية في الأمثلة تماثل المعرّف الذي تعرضه المحوّلات، ولا يشير إليها شيء. ولعنصر التحكم غير الصالح اكتب الخاصية `aria-invalid="true"` مع فقرة `hw-error` الظاهرة.

### React

جدول: خصائص Field

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `controlId` | `string` | `false` | — |
| `required` | `boolean` | `false` | — |
| `errorRole` | `'alert'` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

الخصائص `label` و`hint` و`error` محتوى React قابل للعرض؛ ويُعرض النص الإرشادي والخطأ فقرتين بعد عنصر التحكم. وتعرض الخاصية `required` علامة واحدة بعد التسمية، ويرثها مكوّن التحكم بالقيمة من هوية الموجود داخل الحقل. وتضبط الخاصية `controlId` المعرّف الذي تشترك فيه التسمية وعنصر التحكم؛ ودونها يُولَّد معرّف. ويأخذ مكوّن التحكم بالقيمة من هوية المعرّفَ والوصفَ وحالةَ عدم الصلاحية من الحقل؛ أما عنصر التحكم الأصلي فلا يصله إلا `for` الخاص بالتسمية، فاكتب القيمة نفسها في `id` الخاص به، واكتب `aria-describedby` و`aria-invalid` الخاصتين به بنفسك. وتضبط الخاصية `errorRole` بالقيمة `alert` هذا الدور على فقرة الخطأ. ويقبل Field خصائص HTML الأصلية لعنصر `div` الخاص به، مثل `className`، ويربط عنصر تحكم واحدًا.

### Vue

جدول: خصائص Field وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `controlId` | prop | `string` | `false` | — |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `default` | slot | — | `false` | — |

الخصائص `label` و`hint` و`error` سلاسل نصية؛ ويُعرض النص الإرشادي والخطأ فقرتين بعد عنصر التحكم. وتعرض الخاصية `required` علامة واحدة بعد التسمية، ويرثها مكوّن التحكم بالقيمة من هوية الموجود داخل الحقل. وتضبط الخاصية `controlId` المعرّف الذي تشترك فيه التسمية وعنصر التحكم؛ ودونها يُولَّد معرّف. ويضمّ المنفذ `default` عنصر التحكم، ويتلقّى معرّفات الحقل نطاقًا له، لاستخدامها مع عنصر تحكم أصلي. ولا يعرّف التصريح المنشور نوع أي منفذ.

### Angular

جدول: مُدخلات hw-field ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `controlId` | input | `string` | `false` | — |
| `label` | input | `string` | `false` | `''` |
| `hint` | input | `string` | `false` | `''` |
| `error` | input | `string` | `false` | `''` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `required` | input | `boolean` | `false` | `false` |
| `*` | content | — | `false` | — |

يعرض `HwFieldComponent` (`hw-field`) العنصر الحاوي والتسمية وعنصر التحكم المُسقَط والنص الإرشادي والخطأ. والمُدخلات `label` و`hint` و`error` سلاسل نصية، والمُدخل `required` منطقي، فيُضبط بكتابة `[required]="true"` أو بكتابة الخاصية `required` دون قيمة. ويضبط المُدخل `controlId` المعرّف الذي تشترك فيه التسمية وعنصر التحكم؛ ودونه يُولَّد معرّف، ولذلك تكون قيمته الافتراضية شرطة طويلة. ويضيف المُدخل `aria-describedby` معرّفات التطبيق إلى معرّفي النص الإرشادي والخطأ. وتُزال من العنصر المضيف الخصائص `aria-label` و`aria-labelledby` و`aria-describedby` و`aria-invalid` المكتوبة على `hw-field`. والمحتوى المُسقَط هو عنصر التحكم، مثل `hw-text-field`.

## إمكانية الوصول

ليس للحقل دور خاص به. والتسمية عنصر `label` أصلي تشير خاصيته `for` إلى عنصر التحكم، فيكون نصها هو الاسم الميسّر لعنصر التحكم، وينقل النقر عليها التركيز إلى عنصر التحكم. ويرتبط النص الإرشادي والخطأ بعنصر التحكم وصفًا له.

- يأخذ مكوّن التحكم بالقيمة من هوية المصرَّح به داخل `Field` في React أو Vue، أو داخل `hw-field` في Angular، معرّفَ الحقل وتسميته ووصفه، ولا يحتاج إلى `label` خاص به. ويأخذها عنصر التحكم الأصلي من المعرّفات التي يسلّمها الحقل، كما تبيّن الأمثلة: المنفذ ذو النطاق في Vue، ومرجع القالب في Angular، وتُقرأ فيهما `descriptionIds` و`invalid` و`required` من الحقل. وفي React لا يصل عنصرَ التحكم الأصلي إلا `for` الخاص بالتسمية: فيكرّر قيمة `controlId` في `id` الخاص به، ويحمل `aria-describedby` و`aria-invalid` الخاصتين به.
- تضبط قيمة `error` غير الفارغة الخاصية `aria-invalid="true"` على مكوّن التحكم بالقيمة من هوية الموجود داخل الحقل. ولا يضبطها الحقل على عنصر التحكم الأصلي: فاكتب `aria-invalid` عليه بنفسك، واقرأ `invalid` من نطاق المنفذ في Vue ومن مرجع القالب في Angular. ولا يضبط الحقل حالة عدم الصلاحية على عنصر التحكم بعد إرسال فاشل.
- تُخفى علامة الحقل المطلوب عن التقنيات المساعدة؛ وتعبّر الخاصية الأصلية `required` لعنصر التحكم عن أن الحقل مطلوب.
- في React لا يكون لفقرة الخطأ دور إلا إذا كانت قيمة `errorRole` هي `alert`، فتمنحها الخاصية `role="alert"` لتُعلَن الرسالة التي تظهر بعد الإرسال.
- يسمّي الحقل عنصر تحكم واحدًا. واجمع عناصر التحكم المترابطة بعنصرَي `fieldset` و`legend` الأصليين، لا بعدة حقول.

## الاتجاه والتوطين

ليس في الحقل نص مدمج: يكتب التطبيق التسمية والنص الإرشادي والخطأ بلغة الصفحة. ويرث العنصر لغة الصفحة واتجاهها، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية، فتتبع التسمية وعنصر التحكم والفقرتان اتجاه القراءة.

- قد تختلف لغة التسمية أو النص الإرشادي أو الخطأ عن لغة الصفحة؛ فاضبط الخاصيتين `lang` و`dir` على الحقل أو على الفقرة المختلفة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط الحقل بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات حقول الإدخال](../nic-inputs.md) حجم التسمية ووزن خطها، وتذكر درجة الثقة في هذا الربط؛ وتصف الملاحظات نفسها ألوان التحقق تكييفًا مقصودًا دون درجة ثقة.
- تربط [ملاحظات قوائم الاختيار والحقول](../nic-select.md) الخصائص الطباعية للنص الإرشادي والخطأ، وتذكر درجة الثقة في كل ربط.
- تُدرج [ملاحظات التغطية](../coverage.md) الحقل ضمن عناصر التحكم الأولى، وتذكر الجمع بين الحقل وعنصر إدخال أصلي لأنواع الإدخال التي ليس لها عنصر تحكم خاص بها في هوية.
