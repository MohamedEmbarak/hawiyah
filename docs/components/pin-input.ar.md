---
source:
  summary: 5c5fef4e2ed2
  example: a3bea9944321
  variants-and-states: e00f37139831
  api: 81d92dcfbe49
  accessibility: 98c6c6ae1bab
  rtl-and-localisation: bf8b42c04bad
  platforms-code-reference: 799f2a960e90
---
# رمز التحقق

حقل رمز التحقق عنصر إدخال نصي واحد له تسمية، مخصّص لرمز رقمي قصير، مثل رمز لمرة واحدة يُرسَل إلى القارئ. ويوحّد الأرقام الملصقة والمكتوبة، ويُبقي موضع تركيز واحدًا؛ ويتحقق التطبيق من الرمز.

## مثال

للحقل تسمية ظاهرة، ويذكر النص الإرشادي مصدر الرمز. ويُبقي المكوّن عنصر إدخال واحدًا: يُكتب الرمز فيه أو يُلصق، وتتحوّل الأرقام الهندية العربية إلى أرقام لاتينية، ويُحذف كل محرف آخر قبل تطبيق الطول.

```html live example=basic static differences=pin-input-adapter-markup
<div class="hw-field hw-pin-input" data-hw="pin-input">
  <label class="hw-label" for="basic-code">رمز التحقق</label>
  <input class="hw-input" id="basic-code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" aria-describedby="basic-code-hint" data-hw-pin-input>
  <p class="hw-hint" id="basic-code-hint">أدخل الرمز المكوّن من 6 أرقام الوارد في الرسالة المرسلة إلى رقم جوالك.</p>
</div>
```

```tsx live example=basic
<PinInput label="رمز التحقق" name="code" hint="أدخل الرمز المكوّن من 6 أرقام الوارد في الرسالة المرسلة إلى رقم جوالك." />
```

```vue live example=basic
<PinInput label="رمز التحقق" name="code" hint="أدخل الرمز المكوّن من 6 أرقام الوارد في الرسالة المرسلة إلى رقم جوالك." />
```

```ts live example=basic framework=angular
template: `<hw-pin-input label="رمز التحقق" name="code" hint="أدخل الرمز المكوّن من 6 أرقام الوارد في الرسالة المرسلة إلى رقم جوالك." />`
```

## الأشكال والحالات

### الطول

يضبط `length` عدد الأرقام، وقيمته الافتراضية 6 في React وVue وAngular. وفي ترميز vanilla تضبطه الخاصية `maxlength` التي يكتبها المطوّر.

```html live example=length static differences=pin-input-adapter-markup
<div class="hw-field hw-pin-input" data-hw="pin-input">
  <label class="hw-label" for="length-code">رمز التأكيد</label>
  <input class="hw-input" id="length-code" name="confirmation" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="4" data-hw-pin-input>
</div>
```

```tsx live example=length
<PinInput label="رمز التأكيد" name="confirmation" length={4} />
```

```vue live example=length
<PinInput label="رمز التأكيد" name="confirmation" :length="4" />
```

```ts live example=length framework=angular
template: `<hw-pin-input label="رمز التأكيد" name="confirmation" [length]="4" />`
```

### حقل فيه خطأ

يظهر الخطأ بعد عنصر التحكم، ويصف ما الخطأ وكيف يُصحَّح. ويُعلَّم عنصر الإدخال بأنه غير صالح، وتصفه الرسالة.

```html live example=error static differences=pin-input-adapter-markup
<div class="hw-field hw-pin-input" data-hw="pin-input">
  <label class="hw-label" for="error-code">رمز التحقق</label>
  <input class="hw-input" id="error-code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" value="1234" aria-invalid="true" aria-describedby="error-code-error" data-hw-pin-input>
  <p class="hw-error" id="error-code-error">يتكوّن الرمز من 6 أرقام. أدخل الأرقام المتبقية.</p>
</div>
```

```tsx live example=error
<PinInput label="رمز التحقق" name="code" defaultValue="1234" error="يتكوّن الرمز من 6 أرقام. أدخل الأرقام المتبقية." />
```

```vue live example=error
<PinInput label="رمز التحقق" name="code" default-value="1234" error="يتكوّن الرمز من 6 أرقام. أدخل الأرقام المتبقية." />
```

```ts live example=error framework=angular
template: `<hw-pin-input label="رمز التحقق" name="code" value="1234" error="يتكوّن الرمز من 6 أرقام. أدخل الأرقام المتبقية." />`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createPinInput

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `length` | `number` | `false` | — |
| `onValueChange` | `(value: string) => void` | `false` | — |

تهيّئ الدالة `createPinInput` عنصرًا بالصنف `hw-pin-input` يحتوي على عنصر إدخال أصلي يحمل الخاصية `data-hw-pin-input`؛ وتجري التهيئة نفسها للعنصر الذي يحمل `data-hw="pin-input"` عبر الدالة `enhance()`. والطول هو قيمة `length`، وإلا فقيمة الخاصية `maxlength` التي يكتبها المطوّر، وإلا فهو 6. وما دام المتحكم نشطًا فإنه يزيل الخاصية `maxlength`، ليُوحَّد الرمز الملصق، مثل `123 456`، قبل تطبيق الطول، وتعيدها `destroy()`. ويضبط المتحكم أيضًا نوع الإدخال على النص، ووضع الإدخال على الأرقام، وقيمة الإكمال التلقائي الخاصة بالرمز لمرة واحدة، وقيدًا في الخاصية `pattern` لا يقبل إلا أرقامًا بعدد الطول، فيستبدل القيم التي كتبها المطوّر إلى أن تعيدها `destroy()`، ويترك `required` كما كتبه المطوّر. ويُرجع المتحكم `value` و`destroy()`. ويتلقّى `onValueChange` الرمز بعد توحيده. ويُعلَّم الرمز غير المكتمل بالخاصية `aria-invalid="true"` بعد مغادرة التركيز عنصر الإدخال، إلى أن يصبح عنصر الإدخال فارغًا أو مكتملًا.

### React

جدول: خصائص PinInput

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `value` | `string` | `false` | — |
| `defaultValue` | `string` | `false` | `''` |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `length` | `number` | `false` | `6` |
| `showSlots` | `boolean` | `false` | `false` |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

يقبل PinInput أيضًا خصائص عنصر الإدخال الأصلي، مثل `name` و`required` و`disabled` و`readOnly` و`ref`. مرّر `value` مع `onValueChange` لحقل متحكَّم فيه، أو `defaultValue` لحقل غير متحكَّم فيه؛ والقيمة سلسلة نصية من الأرقام. ولا يكتب المكوّن الخاصية `maxlength`. وتضيف الخاصية `showSlots` خانات زخرفية مخفية عن التقنيات المساعدة تعرض المحارف المُدخلة؛ ويبقى عنصر الإدخال عنصر تحكم واحدًا.

### Vue

جدول: خصائص PinInput وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `length` | prop | `number` | `false` | `6` |
| `modelValue` | prop | `string` | `false` | — |
| `defaultValue` | prop | `string` | `false` | `''` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: string) => void` | `false` | — |
| `complete` | event | `(value: string) => void` | `false` | — |

يربط `v-model` القيمة النصية، وتضبط الخاصية `defaultValue` القيمة الأولية لحقل غير متحكَّم فيه. ويُبلغ الحدث `complete` بالرمز عندما يبلغ عدد أرقامه `length`. وتصل خصائص HTML الأخرى، مثل `name`، إلى عنصر الإدخال الأصلي. ولا يعرّف التصريح المنشور نوع أي منفذ، ولا يقرأ الإصدار المنشور أي منفذ.

### Angular

جدول: مُدخلات hw-pin-input ومخرجاته ومحتواه

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
| `readOnly` | input | `boolean` | `false` | `false` |
| `length` | input | `number` | `false` | `6` |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |

يعرض `HwPinInputComponent` (`hw-pin-input`) الحقل والتسمية وعنصر الإدخال والنص الإرشادي والخطأ. اربط `[(value)]` ربطًا ثنائي الاتجاه بالقيمة النصية؛ ويعمل المكوّن أيضًا عنصرَ تحكم في النموذج. ويضبط `length` عدد الأرقام. ويحتاج الحقل إلى `label`، أو إلى `aria-label` أو `aria-labelledby` مكتوبة على `hw-pin-input`. ويضبط `controlId` معرّف عنصر الإدخال.

## إمكانية الوصول

الرمز عنصر إدخال نصي أصلي واحد تسمّيه تسميته، فيصادف القارئ موضع تركيز واحدًا، ويوفّر المتصفح تحرير النص فيه. ويضبط المكوّن وضع الإدخال على الأرقام، فتعرض الأجهزة اللمسية لوحة مفاتيح رقمية، ويضبط قيمة الإكمال التلقائي الخاصة بالرمز لمرة واحدة، فيستطيع المتصفح أن يقترح رمزًا وصل إلى القارئ.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: رمز التحقق

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز إلى عنصر الإدخال ومنه إلى خارجه؛ وللرمز موضع تركيز واحد. |

- يُعرَض الرمز غير المكتمل بأنه غير صالح بعد مغادرة التركيز عنصر الإدخال، إلى أن يصبح فارغًا أو مكتملًا.
- يُعلِّم الإرسالُ الذي يفشل بسبب عنصر الإدخال العنصرَ بأنه غير صالح، إلى أن يُدخَل رمز صالح أو يُعاد تعيين النموذج.
- يُتجاهَل المحرف الذي يُكتب بعد اكتمال الرمز.
- تعيد إعادة تعيين النموذج القيمة الافتراضية، وتزيل حالة عدم الصلاحية.

## الاتجاه والتوطين

ليس في حقل رمز التحقق نص مدمج: يكتب التطبيق التسمية والنص الإرشادي والخطأ بلغة الصفحة. ويقبل عنصر الإدخال الأرقام الهندية العربية والأرقام العربية الشرقية، ويخزّنها أرقامًا لاتينية، فيعطي الرمز المكتوب أو الملصق بأيٍّ من نظامَي الأرقام القيمةَ نفسها.

- تحتفظ القيمة الملصقة، مثل `٤٥٦-١٢٣`، بأرقامها الستة، لأن كل محرف ليس رقمًا يُحذف قبل تطبيق الطول.
- القيمة دائمًا سلسلة نصية من الأرقام اللاتينية؛ ويقرّر التطبيق طريقة عرض الرمز في الرسالة التي تحمله.
- التحقق من الرمز ومن انتهاء صلاحيته وعدد المحاولات والمصادقة من مسؤولية التطبيق وخادمه.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط حقل رمز التحقق بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تُدرج وصفة الرمز لمرة واحدة ضمن وصفات إدخال بيانات الخدمات السعودية في [ملاحظات التغطية](../coverage.md)، التي تصف هذه الوصفات بأنها حلول قابلة للضبط في التطبيق: عنصر إدخال واحد له تسمية، ودعم اللصق، وموضع تركيز واحد، وخانات زخرفية اختيارية.
- تذكر ملاحظات التغطية أن توحيد الأرقام معالجةٌ للنص، وأن المصادقة وانتهاء الصلاحية والمحاولات ومعالجة إعادة الاستخدام من مسؤولية الخادم.
