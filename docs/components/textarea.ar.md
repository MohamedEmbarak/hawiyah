---
source:
  summary: 9ba698b2d9d9
  example: 834953611ae7
  variants-and-states: 7eecbc6a777f
  api: eb4e1ebd1751
  accessibility: 671f2b44335c
  rtl-and-localisation: 3ce24edb4082
  platforms-code-reference: b1101f90a692
---
# مساحة نصية

المساحة النصية حقل لإدخال نص من عدة أسطر، يعرض عنصر مساحة نصية أصليًا بأنماط هوية، ومعه تسمية ظاهرة ونص إرشادي ورسالة خطأ عندما يوفّرها التطبيق. وتبقى القيمة سلسلة نصية، وتبقى لعنصر المساحة النصية دلالاته الأصلية وتحققه الأصلي من صحة القيمة.

## مثال

للحقل تسمية ظاهرة تبيّن المعلومة المطلوبة. ويذكر النص الإرشادي ما يُكتب، ويرتبط بعنصر المساحة النصية.

```html live example=basic differences=textarea-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="basic-details" id="basic-details-label">تفاصيل الطلب</label>
  <textarea class="hw-textarea" id="basic-details" name="details" aria-describedby="basic-details-hint"></textarea>
  <p class="hw-hint" id="basic-details-hint">صِف الطلب في بضع جمل.</p>
</div>
```

```tsx live example=basic
<Textarea label="تفاصيل الطلب" name="details" hint="صِف الطلب في بضع جمل." />
```

```vue live example=basic
<Textarea label="تفاصيل الطلب" name="details" hint="صِف الطلب في بضع جمل." />
```

```ts live example=basic framework=angular
template: `<hw-textarea label="تفاصيل الطلب" name="details" hint="صِف الطلب في بضع جمل." />`
```

## الأشكال والحالات

### حقل مطلوب

يعرض الحقل المطلوب علامة واحدة بعد تسميته، ويحتفظ بالخاصية الأصلية `required`، فيطبّق المتصفح تحققه الخاص من قيود الإدخال عند الإرسال.

```html live example=required differences=textarea-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="required-reason" id="required-reason-label">سبب الطلب<span class="hw-required-marker" aria-hidden="true"> *</span></label>
  <textarea class="hw-textarea" id="required-reason" name="reason" required></textarea>
</div>
```

```tsx live example=required
<Textarea label="سبب الطلب" name="reason" required />
```

```vue live example=required
<Textarea label="سبب الطلب" name="reason" required />
```

```ts live example=required framework=angular
template: `<hw-textarea label="سبب الطلب" name="reason" [required]="true" />`
```

### حقل فيه خطأ

يظهر الخطأ في فقرة بعد عنصر التحكم، ويحمل عنصر المساحة النصية الخاصية `aria-invalid="true"`، وتصفه الرسالة. وتذكر الرسالة ما الخطأ وكيف يُصحَّح.

```html live example=error differences=textarea-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="error-details" id="error-details-label">تفاصيل الطلب</label>
  <textarea class="hw-textarea" id="error-details" name="details" aria-invalid="true" aria-describedby="error-details-error"></textarea>
  <p class="hw-error" id="error-details-error">أدخل تفاصيل الطلب.</p>
</div>
```

```tsx live example=error
<Textarea label="تفاصيل الطلب" name="details" error="أدخل تفاصيل الطلب." />
```

```vue live example=error
<Textarea label="تفاصيل الطلب" name="details" error="أدخل تفاصيل الطلب." />
```

```ts live example=error framework=angular
template: `<hw-textarea label="تفاصيل الطلب" name="details" error="أدخل تفاصيل الطلب." />`
```

### للقراءة فقط

يحمل الحقل المخصّص للقراءة فقط الخاصية الأصلية `readonly`: فيحتفظ بقيمته في النموذج، ويبقى في ترتيب التنقل بالمفتاح Tab، فيستطيع القارئ نقل التركيز إليه وتحديد نصه، ولا يستطيع تغييره.

```html live example=readonly differences=textarea-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="readonly-note" id="readonly-note-label">ملاحظة المعالجة</label>
  <textarea class="hw-textarea" id="readonly-note" name="note" readonly>استُلم الطلب، وهو في انتظار المراجعة.</textarea>
</div>
```

```tsx live example=readonly
<Textarea label="ملاحظة المعالجة" name="note" defaultValue="استُلم الطلب، وهو في انتظار المراجعة." readOnly />
```

```vue live example=readonly
<Textarea label="ملاحظة المعالجة" name="note" default-value="استُلم الطلب، وهو في انتظار المراجعة." readonly />
```

```ts live example=readonly framework=angular
template: `<hw-textarea label="ملاحظة المعالجة" name="note" value="استُلم الطلب، وهو في انتظار المراجعة." [readOnly]="true" />`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-textarea

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-textarea'` | `true` | — |
| `aria-invalid` | `'true'` | `false` | — |
| `readonly` | `boolean` | `false` | — |
| `data-size` | `'lg' \| 'sm'` | `false` | — |
| `data-variant` | `'filled'` | `false` | — |
| `data-hw-filled` | `'true'` | `false` | — |

ليس للمساحة النصية متحكم في JavaScript، فالترميز هو واجهتها البرمجية: اكتب عنصر `textarea` أصليًا بالصنف `hw-textarea` داخل عنصر بالصنف `hw-field`، وعنصر `label` بالصنف `hw-label` تشير خاصيته `for` إلى عنصر المساحة النصية، وعند الحاجة فقرةً بالصنف `hw-hint` أو `hw-error` بعده. واربط الفقرة بعنصر المساحة النصية عبر الخاصية `aria-describedby`؛ فلا يربطهما أي برنامج نصي. وللحقل غير الصالح اكتب الخاصية `aria-invalid="true"` على عنصر المساحة النصية مع رسالة `hw-error` الظاهرة. وتغيّر الخاصية `data-size` ارتفاع الحقل بإحدى القيمتين `sm` و`lg`، وتضبط الخاصية `data-variant="filled"` المظهر المملوء؛ ودونهما يكون الحقل بالمظهر ذي الإطار وبالحجم المتوسط. والخاصية `readonly` هي الخاصية الأصلية. والخاصية `data-hw-filled` خاصية حالة تضبطها الدالة `enhance()` من حزمة vanilla على `true` أو `false` في الحقل المكتوب يدويًا، بحسب احتواء عنصر المساحة النصية على قيمة؛ فلا تكتب لها قيمة بنفسك.

### React

جدول: خصائص Textarea

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

يقبل Textarea أيضًا خصائص عنصر المساحة النصية الأصلي، ومنها `name` و`value` و`defaultValue` و`onChange` و`required` و`disabled` و`readOnly` و`rows` و`ref`، وتصل إلى عنصر المساحة النصية؛ فالمرجع يصل إلى عنصر المساحة النصية لا إلى تسميته. مرّر `value` مع `onChange` لحقل متحكَّم فيه، أو `defaultValue` لحقل غير متحكَّم فيه. والتسمية والنص الإرشادي والخطأ محتوى React قابل للعرض. ويُعرض النص الإرشادي والخطأ فقرتين بعد عنصر المساحة النصية ويرتبطان به، وتضبط الخاصية `error` غير الفارغة `aria-invalid`. ويعرض الحقل المطلوب ذو التسمية الظاهرة علامة واحدة؛ فلا تكتب نجمة في `label`. وعندما لا تُمرَّر أي من `label` و`hint` و`error`، يعرض Textarea عنصر المساحة النصية وحده، ويحتاج إلى اسم ميسّر من `aria-label` أو `aria-labelledby`، أو من مكوّن `Field` يحيط به. وليس لـTextarea خاصية مكوّن للحجم أو للشكل: اكتب `data-size` أو `data-variant` خاصيةَ HTML أصلية، فتصل إلى عنصر المساحة النصية.

### Vue

جدول: خصائص Textarea وأحداثه ومنافذه

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

يربط `v-model` القيمة النصية، وتضبط الخاصية `defaultValue` القيمة الأولية لحقل غير متحكَّم فيه. والخصائص `label` و`hint` و`error` سلاسل نصية؛ ويُعرض النص الإرشادي والخطأ فقرتين بعد عنصر المساحة النصية ويرتبطان به، وتضبط الخاصية `error` غير الفارغة `aria-invalid`. وتعرض الخاصية `required` علامة واحدة بعد التسمية، وتضبط خاصية HTML الأصلية. وتصل خصائص HTML الأخرى، مثل `name` و`disabled` و`readonly`، والمستمعات إلى عنصر المساحة النصية الأصلي. ويتيح المكوّن `element` و`focus()` عبر مرجع القالب. وليس لـTextarea خاصية مكوّن للحجم أو للشكل: اكتب `data-size` أو `data-variant` خاصيةَ HTML أصلية، فتصل إلى عنصر المساحة النصية. ويسرد الجدول الخاصية `options` لأن التصريح المنشور لـTextarea يتضمّنها، والمنفذ `default` لأن الإصدار المنشور يقرؤه؛ ولا يعرّف التصريح نوع أي منفذ. ولا يُقرأ أيٌّ منهما إلا لقائمة اختيار تشترك مع المكوّن في الدالة المُنشئة نفسها، فلا تستخدم المساحة النصية أيًّا منهما.

### Angular

جدول: مُدخلات hw-textarea ومخرجاته ومحتواه

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
| `rows` | input | `number \| null` | `false` | `null` |
| `placeholder` | input | `string` | `false` | `''` |
| `maxLength` | input | `number \| null` | `false` | `null` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |

يعرض `HwTextareaComponent` (`hw-textarea`) الحقل والتسمية وعنصر المساحة النصية الأصلي والنص الإرشادي والخطأ. اربط `[(value)]` ربطًا ثنائي الاتجاه بالقيمة النصية؛ ويعمل المكوّن أيضًا عنصرَ تحكم في النموذج عبر موصّل القيمة الخاص به. ويضبط المُدخلان `size` و`visualVariant` مظهر عنصر المساحة النصية الأصلي. والمُدخلات `required` و`disabled` و`readOnly` منطقية، فيُضبط المُدخل نفسه بكتابة `[required]="true"` أو بكتابة الخاصية `required` دون قيمة. والمُدخل `rows` اختياري، وقيمته الافتراضية `null`، فلا يكتب أي خاصية، ويأتي الارتفاع من ورقة الأنماط؛ واكتب `[rows]="4"` لعدد ثابت من الأسطر. ويمرّر المُدخل `maxLength` القيد الأصلي. ويحتاج الحقل إلى `label`، أو إلى `aria-label` أو `aria-labelledby` مكتوبة على `hw-textarea`، أو إلى تسمية عنصر `hw-field` يحيط به؛ وتُمرَّر هذه الخصائص إلى عنصر المساحة النصية وتُزال من العنصر المضيف. ويضبط `controlId` معرّف عنصر المساحة النصية؛ ويتقدّم معرّف التطبيق، ثم معرّف `hw-field` المحيط، ثم معرّف مولَّد.

## إمكانية الوصول

المساحة النصية عنصر مساحة نصية أصلي، فيوفّر المتصفح دوره وسلوك التركيز عليه وتحرير النص فيه والتعامل مع لوحة المفاتيح. والتسمية عنصر `label` أصلي تشير خاصيته `for` إلى عنصر المساحة النصية، فيكون نص التسمية هو الاسم الميسّر، وينقل النقر عليها التركيز إلى الحقل. ويرتبط النص الإرشادي والخطأ بعنصر المساحة النصية وصفًا له.

- تُضبط الخاصية `aria-invalid="true"` عندما يمرّر التطبيق قيمة غير فارغة لـ`error` أو يمرّر `aria-invalid`، أو عندما يكون في `Field` أو `hw-field` المحيط خطأ. ولا تضبط المساحة النصية هذه الخاصية من تلقاء نفسها بعد إرسال فاشل.
- عندما يمنع المتصفح الإرسال لأن حقلًا مطلوبًا فارغ، ينقل المتصفح التركيز إلى الحقل ويعرض رسالته الخاصة.
- تُخفى علامة الحقل المطلوب عن التقنيات المساعدة؛ وتعبّر الخاصية الأصلية `required` عن أن الحقل مطلوب.
- تُرسَل قيمة الحقل المخصّص للقراءة فقط مع النموذج ما دامت HTML تسمح بذلك، ويبقى الحقل في ترتيب التنقل بالمفتاح Tab.
- تمنح ورقة الأنماط عنصر المساحة النصية ارتفاعًا أدنى قدره 7.5 rem ومقبضًا لتغيير الحجم عموديًا، فيستطيع القارئ تكبير الحقل؛ ويبقى الحقل متعدد الأسطر.

## الاتجاه والتوطين

ليس في المساحة النصية نص مدمج: يكتب التطبيق التسمية والنص الإرشادي والخطأ والنص النائب بلغة الصفحة. ويرث العنصر لغة الصفحة واتجاهها، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية، فتتبع التسمية والنص والفقرات التي بعد عنصر المساحة النصية اتجاه القراءة.

- يأخذ النص المكتوب في عنصر المساحة النصية اتجاه الصفحة؛ فاضبط الخاصية `dir` على العنصر عندما يكون محتوى الحقل باتجاه مختلف.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط المساحة النصية بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات حقول الإدخال](../nic-inputs.md) لعناصر التحكم في النماذج حجم التسمية ووزن خطها، وحشوة عنصر الإدخال، وحالات المرور بالمؤشر والضغط والتركيز، والخط السفلي، الواردة في ورقة أنماط كود المنصات المزوَّدة، وتذكر درجة الثقة في كل ربط.
- ألوان التحقق في الحقل تكييف للمصدر، وهذا التكييف موثّق في ملاحظات حقول الإدخال؛ وتُدرج [ملاحظات التغطية](../coverage.md) عنصر التحكم هذا ضمن عناصر التحكم الأولى.
