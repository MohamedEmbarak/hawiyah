---
source:
  summary: 94fe594a6a47
  example: b47f1122c435
  variants-and-states: 1d959612615c
  api: 82280676bb33
  accessibility: 1197b15f3053
  rtl-and-localisation: 603ec602a3d9
  platforms-code-reference: a375eed9866d
---
# مربع اختيار

مربع الاختيار عنصر إدخال أصلي من نوع مربع الاختيار يقع داخل تسمية قابلة للنقر، ويُستخدم لاختيار واحد مستقل بنعم أو لا. وقيمته منطقية، ويُرسل المربع المحدَّد قيمته الأصلية مع النموذج.

## مثال

تذكر التسمية الاختيار بكلمات يتّضح معناها عندما يكون المربع محدَّدًا. ويشكّل عنصر التحكم ونصه هدفًا واحدًا للنقر.

```html live example=basic differences=checkbox-adapter-attributes
<div class="hw-field">
  <label class="hw-choice" for="basic-confirm">
    <input class="hw-checkbox" id="basic-confirm" name="confirm" type="checkbox">أُقرّ بصحة البيانات الواردة في هذا الطلب
  </label>
</div>
```

```tsx live example=basic
<Checkbox label="أُقرّ بصحة البيانات الواردة في هذا الطلب" name="confirm" />
```

```vue live example=basic
<Checkbox label="أُقرّ بصحة البيانات الواردة في هذا الطلب" name="confirm" />
```

```ts live example=basic framework=angular
template: `<hw-checkbox label="أُقرّ بصحة البيانات الواردة في هذا الطلب" name="confirm" />`
```

## الأشكال والحالات

### الحالة المحدَّدة

يبدأ مربع الاختيار غير المتحكَّم فيه محدَّدًا عبر القيمة الأولية في المحوّل: الخاصية `checked` في vanilla، و`defaultChecked` في React، و`defaultValue` في Vue، و`value` في Angular.

```html live example=checked differences=checkbox-adapter-attributes
<div class="hw-field">
  <label class="hw-choice" for="checked-copy">
    <input class="hw-checkbox" id="checked-copy" name="copy" type="checkbox" checked>إرسال نسخة من هذا الطلب إليّ عبر البريد الإلكتروني
  </label>
</div>
```

```tsx live example=checked
<Checkbox label="إرسال نسخة من هذا الطلب إليّ عبر البريد الإلكتروني" name="copy" defaultChecked />
```

```vue live example=checked
<Checkbox label="إرسال نسخة من هذا الطلب إليّ عبر البريد الإلكتروني" name="copy" :default-value="true" />
```

```ts live example=checked framework=angular
template: `<hw-checkbox label="إرسال نسخة من هذا الطلب إليّ عبر البريد الإلكتروني" name="copy" [value]="true" />`
```

### النص الإرشادي

يُعرض النص الإرشادي فقرةً بعد عنصر التحكم، ويرتبط به وصفًا له. واستخدمه لمعلومة لا تحملها التسمية.

```html live example=hint differences=checkbox-adapter-attributes
<div class="hw-field">
  <label class="hw-choice" for="hint-updates">
    <input class="hw-checkbox" id="hint-updates" name="updates" type="checkbox" aria-describedby="hint-updates-hint">إشعاري عند تغيّر حالة طلبي
  </label>
  <p class="hw-hint" id="hint-updates-hint">تُرسَل الإشعارات إلى البريد الإلكتروني المسجَّل في ملفك الشخصي.</p>
</div>
```

```tsx live example=hint
<Checkbox label="إشعاري عند تغيّر حالة طلبي" name="updates" hint="تُرسَل الإشعارات إلى البريد الإلكتروني المسجَّل في ملفك الشخصي." />
```

```vue live example=hint
<Checkbox label="إشعاري عند تغيّر حالة طلبي" name="updates" hint="تُرسَل الإشعارات إلى البريد الإلكتروني المسجَّل في ملفك الشخصي." />
```

```ts live example=hint framework=angular
template: `<hw-checkbox label="إشعاري عند تغيّر حالة طلبي" name="updates" hint="تُرسَل الإشعارات إلى البريد الإلكتروني المسجَّل في ملفك الشخصي." />`
```

### الخطأ

تُعرض قيمة `error` غير الفارغة فقرةً بعد عنصر التحكم، ويحمل عنصر الإدخال الخاصية `aria-invalid="true"`، وتصفه الرسالة. وتذكر الرسالة ما يلزم فعله.

```html live example=error differences=checkbox-adapter-attributes
<div class="hw-field">
  <label class="hw-choice" for="error-declaration">
    <input class="hw-checkbox" id="error-declaration" name="declaration" type="checkbox" aria-invalid="true" aria-describedby="error-declaration-error">اطّلعت على شروط هذه الخدمة
  </label>
  <p class="hw-error" id="error-declaration-error">حدّد هذا المربع لتقديم الطلب.</p>
</div>
```

```tsx live example=error
<Checkbox label="اطّلعت على شروط هذه الخدمة" name="declaration" error="حدّد هذا المربع لتقديم الطلب." />
```

```vue live example=error
<Checkbox label="اطّلعت على شروط هذه الخدمة" name="declaration" error="حدّد هذا المربع لتقديم الطلب." />
```

```ts live example=error framework=angular
template: `<hw-checkbox label="اطّلعت على شروط هذه الخدمة" name="declaration" error="حدّد هذا المربع لتقديم الطلب." />`
```

### الحالة المعطَّلة

يستخدم مربع الاختيار المعطَّل الخاصية الأصلية `disabled`: فيخرج من ترتيب التنقل بالمفتاح Tab، ولا يمكن تغييره.

```html live example=disabled differences=checkbox-adapter-attributes
<div class="hw-field">
  <label class="hw-choice" for="disabled-terms">
    <input class="hw-checkbox" id="disabled-terms" name="terms" type="checkbox" disabled>إرفاق القرار السابق بهذا الطلب
  </label>
</div>
```

```tsx live example=disabled
<Checkbox label="إرفاق القرار السابق بهذا الطلب" name="terms" disabled />
```

```vue live example=disabled
<Checkbox label="إرفاق القرار السابق بهذا الطلب" name="terms" disabled />
```

```ts live example=disabled framework=angular
template: `<hw-checkbox label="إرفاق القرار السابق بهذا الطلب" name="terms" [disabled]="true" />`
```

### للقراءة فقط

يبقى مربع الاختيار المخصّص للقراءة فقط في ترتيب التنقل بالمفتاح Tab، وتُرسَل قيمته مع النموذج، ولا يغيّر النقر أو المفتاح <kbd>Space</kbd> قيمته.

```html live example=readonly differences=checkbox-adapter-attributes
<div class="hw-field">
  <label class="hw-choice" for="readonly-record">
    <input class="hw-checkbox" id="readonly-record" name="record" type="checkbox" checked readonly aria-disabled="true">الاحتفاظ بهذا الطلب في سجلي
  </label>
</div>
```

```tsx live example=readonly
<Checkbox label="الاحتفاظ بهذا الطلب في سجلي" name="record" defaultChecked readOnly />
```

```vue live example=readonly
<Checkbox label="الاحتفاظ بهذا الطلب في سجلي" name="record" :default-value="true" readonly />
```

```ts live example=readonly framework=angular
template: `<hw-checkbox label="الاحتفاظ بهذا الطلب في سجلي" name="record" [value]="true" [readOnly]="true" />`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-checkbox

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-checkbox'` | `true` | — |
| `readonly` | `boolean` | `false` | — |
| `aria-disabled` | `'true'` | `false` | — |

ليس لمربع الاختيار متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصرًا بالصنف `hw-field` يضمّ عنصر `label` بالصنف `hw-choice`، وداخل التسمية عنصر إدخال أصليًا يحمل `type="checkbox"` والصنف `hw-checkbox`، ثم نص التسمية. وأضف فقرةً بالصنف `hw-hint` أو `hw-error` بعد التسمية، واربطها بعنصر الإدخال عبر الخاصية `aria-describedby`؛ فلا يربطهما أي برنامج نصي. وللاختيار غير الصالح اكتب الخاصية `aria-invalid="true"` على عنصر الإدخال مع رسالة `hw-error` الظاهرة. والخصائص `checked` و`disabled` و`required` خصائص أصلية. ولمربع الاختيار المخصّص للقراءة فقط اكتب الخاصيتين `readonly` و`aria-disabled="true"` على عنصر الإدخال؛ وتثبّت الدالة `enhance()` من حزمة vanilla آلية المنع التي تُبقي القيمة دون تغيير.

### React

جدول: خصائص Checkbox

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `indeterminate` | `boolean` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

يقبل Checkbox أيضًا خصائص عنصر الإدخال الأصلي، ومنها `name` و`checked` و`defaultChecked` و`onChange` و`required` و`disabled` و`readOnly` و`ref`، وتصل إلى عنصر الإدخال؛ فالمرجع يصل إلى عنصر الإدخال لا إلى تسميته. مرّر `checked` مع `onChange` لمربع اختيار متحكَّم فيه، أو `defaultChecked` لمربع اختيار غير متحكَّم فيه. وتضبط الخاصية `indeterminate` الحالة المختلطة لعنصر الإدخال الأصلي. والتسمية والنص الإرشادي والخطأ محتوى React قابل للعرض. ويُعرض النص الإرشادي والخطأ فقرتين بعد التسمية ويرتبطان بعنصر الإدخال، وتضبط الخاصية `error` غير الفارغة `aria-invalid`. ولا يعرض Checkbox علامة الحقل المطلوب، فاذكر أن الاختيار مطلوب في نص `label`.

### Vue

جدول: خصائص Checkbox وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `modelValue` | prop | `boolean \| string` | `false` | — |
| `defaultValue` | prop | `boolean \| string` | `false` | `false` |
| `value` | prop | `string` | `false` | `'on'` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `indeterminate` | prop | `boolean` | `false` | `false` |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: boolean) => void` | `false` | — |
| `default` | slot | — | `false` | — |

يربط `v-model` القيمة المنطقية، وتضبط الخاصية `defaultValue` القيمة الأولية لمربع اختيار غير متحكَّم فيه. وتضبط الخاصية `indeterminate` الحالة المختلطة لعنصر الإدخال الأصلي. والخصائص `label` و`hint` و`error` سلاسل نصية؛ ويُعرض النص الإرشادي والخطأ فقرتين بعد التسمية ويرتبطان بعنصر الإدخال، وتضبط الخاصية `error` غير الفارغة `aria-invalid`. والخاصية `value` هي القيمة الأصلية التي يُرسلها المربع المحدَّد. وتصل خصائص HTML الأخرى، مثل `name` و`disabled`، والمستمعات إلى عنصر الإدخال الأصلي؛ وتُبقي الخاصية `readonly` القيمة دون تغيير، ويبقى مربع الاختيار قابلًا للتركيز. ويقرأ الإصدار المنشور المنفذ `default`، ولا يعرّف التصريح نوع أي منفذ؛ ويحمل المنفذ محتوى التسمية عندما لا تُمرَّر `label`.

### Angular

جدول: مُدخلات hw-checkbox ومخرجاته ومحتواه

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
| `value` | input | `boolean` | `false` | `false` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `indeterminate` | input | `boolean` | `false` | `false` |
| `submitValue` | input | `string \| null` | `false` | `null` |
| `valueChange` | output | `boolean` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `*` | content | — | `false` | — |

يعرض `HwCheckboxComponent` (`hw-checkbox`) الحقل والتسمية وعنصر الإدخال الأصلي والنص الإرشادي والخطأ. اربط `[(value)]` ربطًا ثنائي الاتجاه بالقيمة المنطقية؛ ويعمل المكوّن أيضًا عنصرَ تحكم في النموذج عبر موصّل القيمة الخاص به. والمُدخلات `indeterminate` و`readOnly` و`disabled` منطقية، والمُدخل `submitValue` هو القيمة الأصلية التي يُرسلها المربع المحدَّد؛ ودونه يُرسل المتصفح `on`. والتسمية هي `label`، وإلا فالمحتوى المُسقَط، ويمكن أن يتضمّن رابطًا. ويحتاج مربع الاختيار إلى تسمية، أو إلى `aria-label` أو `aria-labelledby` مكتوبة على `hw-checkbox`؛ وتُمرَّر هذه الخصائص إلى عنصر الإدخال وتُزال من العنصر المضيف. ويضبط `controlId` معرّف عنصر الإدخال؛ ويتقدّم معرّف التطبيق، ثم معرّف `hw-field` المحيط، ثم معرّف مولَّد.

## إمكانية الوصول

مربع الاختيار عنصر إدخال أصلي يحمل `type="checkbox"`، فيوفّر المتصفح دوره وسلوك التركيز عليه وحالة التحديد والإرسال مع النموذج. والتسمية عنصر `label` أصلي بالصنف `hw-choice` يضمّ عنصر الإدخال والنص، فيكون نص التسمية هو الاسم الميسّر، ويبدّل النقر عليها حالة المربع.

- يبدّل المفتاح <kbd>Space</kbd> حالة مربع الاختيار كما في مربع الاختيار الأصلي؛ وينقل المفتاح <kbd>Tab</kbd> التركيز إليه ومنه.
- مربع الاختيار مستقل. ويجمع التطبيق مربعات الاختيار المترابطة داخل عنصر `fieldset` أصلي فيه عنصر `legend` يذكر اسم المجموعة؛ وليس لمربع الاختيار مكوّن للمجموعة.
- لا يعرض مربع الاختيار علامة الحقل المطلوب. فاذكر أن الاختيار مطلوب في التسمية، واكتب الخاصية `required` على عنصر الإدخال عندما يلزم أن يفرض المتصفح ذلك.
- يرتبط النص الإرشادي والخطأ بعنصر الإدخال عبر الخاصية `aria-describedby`، وتضبط الخاصية `error` غير الفارغة `aria-invalid`.
- يبقى مربع الاختيار المخصّص للقراءة فقط قابلًا للتركيز، وتُرسَل قيمته مع النموذج، ولا يغيّر التفعيل بالمؤشر أو بلوحة المفاتيح قيمته. ومربع الاختيار المعطَّل حالة أصلية مستقلة.
- تُضبط الحالة المختلطة على عنصر الإدخال الأصلي عبر خاصيته البرمجية `indeterminate`. وهي ليست خاصية HTML، لذا تتيحها المحوّلات باسم `indeterminate`، ويلزم في HTML المجرّد ضبطها ببرنامج نصي.
- تلغي ورقة الأنماط الانتقال المتحرّك للهالة التي تظهر عند المرور بالمؤشر عندما يطلب القارئ تقليل الحركة.

## الاتجاه والتوطين

ليس في مربع الاختيار نص مدمج: يكتب التطبيق التسمية والنص الإرشادي والخطأ بلغة الصفحة. ويتبع عنصر التحكم ونصه اتجاه القراءة في الصفحة، ففي النص المكتوب من اليمين إلى اليسار يقع المربع في بداية التسمية، على اليمين، لأن المربع يأتي أولًا في التسمية والتسمية تتبع اتجاه القراءة.

- القيمة منطقية بالنسبة إلى التطبيق. ويُرسل النموذج القيمة الأصلية لعنصر الإدخال المحدَّد، وهي `on` افتراضيًا؛ وتضبط الخاصية `value` في Vue والمُدخل `submitValue` في Angular قيمة أخرى.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط مربع الاختيار بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات عناصر الاختيار](../nic-choices.md) عنصر التحكم بقياس 20px، والهالة التي تظهر عند المرور بالمؤشر، وعلامتي التحديد والحالة المختلطة، ومظهري الحالة المعطَّلة وحالة القراءة فقط، ومعالجة التركيز، الواردة في ورقة أنماط كود المنصات المزوَّدة، وتذكر درجة الثقة في كل ربط.
- معالجة حالة القراءة فقط تكييف: فخاصية HTML وحدها لا توقف مربع الاختيار الأصلي، لذا تُبقي آلية منع مشتركة القيمة دون تغيير، ويبقى عنصر التحكم قابلًا للتركيز؛ وتصف ذلك [ملاحظات عناصر الاختيار](../nic-choices.md).
