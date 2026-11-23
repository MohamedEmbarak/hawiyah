---
source:
  summary: e0088f979ede
  example: a6049865f87d
  variants-and-states: 9eda1c27edaf
  api: aa8aff435824
  accessibility: a96f422a4848
  rtl-and-localisation: 447c71ea58ec
  platforms-code-reference: 9a94cddac291
---
# مفتاح تبديل

مفتاح التبديل عنصر إدخال أصلي من نوع مربع الاختيار يحمل الدور switch، ويقع داخل تسمية قابلة للنقر، ويُستخدم لإعداد يكون مفعَّلًا أو غير مفعَّل. وقيمته منطقية.

## مثال

تذكر التسمية اسم الإعداد، وتبقى صياغتها نفسها سواء أكان المفتاح مفعَّلًا أم غير مفعَّل، فيعبّر عنصر التحكم عن الحالة لا النص.

```html live example=basic differences=switch-adapter-attributes
<div class="hw-field">
  <label class="hw-choice" for="basic-notify">
    <input class="hw-switch" id="basic-notify" name="notify" type="checkbox" role="switch">إرسال بريد إلكتروني عند تغيّر حالة طلبي
  </label>
</div>
```

```tsx live example=basic
<Switch label="إرسال بريد إلكتروني عند تغيّر حالة طلبي" name="notify" />
```

```vue live example=basic
<Switch label="إرسال بريد إلكتروني عند تغيّر حالة طلبي" name="notify" />
```

```ts live example=basic framework=angular
template: `<hw-switch label="إرسال بريد إلكتروني عند تغيّر حالة طلبي" name="notify" />`
```

## الأشكال والحالات

### النص الإرشادي

يُعرض النص الإرشادي فقرةً بعد عنصر التحكم، ويرتبط به وصفًا له. واستخدمه لذكر أثر لا تذكره التسمية.

```html live example=hint differences=switch-adapter-attributes
<div class="hw-field">
  <label class="hw-choice" for="hint-reminders">
    <input class="hw-switch" id="hint-reminders" name="reminders" type="checkbox" role="switch" aria-describedby="hint-reminders-hint">تذكيري قبل انتهاء صلاحية أي مستند
  </label>
  <p class="hw-hint" id="hint-reminders-hint">يُرسَل التذكير قبل تاريخ انتهاء الصلاحية بثلاثين يومًا.</p>
</div>
```

```tsx live example=hint
<Switch label="تذكيري قبل انتهاء صلاحية أي مستند" name="reminders" hint="يُرسَل التذكير قبل تاريخ انتهاء الصلاحية بثلاثين يومًا." />
```

```vue live example=hint
<Switch label="تذكيري قبل انتهاء صلاحية أي مستند" name="reminders" hint="يُرسَل التذكير قبل تاريخ انتهاء الصلاحية بثلاثين يومًا." />
```

```ts live example=hint framework=angular
template: `<hw-switch label="تذكيري قبل انتهاء صلاحية أي مستند" name="reminders" hint="يُرسَل التذكير قبل تاريخ انتهاء الصلاحية بثلاثين يومًا." />`
```

### الحالة المعطَّلة

يستخدم المفتاح المعطَّل الخاصية الأصلية `disabled`: فيخرج من ترتيب التنقل بالمفتاح Tab، ولا يمكن تغييره.

```html live example=disabled differences=switch-adapter-attributes
<div class="hw-field">
  <label class="hw-choice" for="disabled-paperless">
    <input class="hw-switch" id="disabled-paperless" name="paperless" type="checkbox" role="switch" checked disabled>استلام المراسلات عبر البريد الإلكتروني فقط
  </label>
</div>
```

```tsx live example=disabled
<Switch label="استلام المراسلات عبر البريد الإلكتروني فقط" name="paperless" defaultChecked disabled />
```

```vue live example=disabled
<Switch label="استلام المراسلات عبر البريد الإلكتروني فقط" name="paperless" :default-value="true" disabled />
```

```ts live example=disabled framework=angular
template: `<hw-switch label="استلام المراسلات عبر البريد الإلكتروني فقط" name="paperless" [value]="true" [disabled]="true" />`
```

### للقراءة فقط

يبقى المفتاح المخصّص للقراءة فقط في ترتيب التنقل بالمفتاح Tab، وتُرسَل قيمته مع النموذج، ولا يغيّر النقر أو المفتاح <kbd>Space</kbd> قيمته.

```html live example=readonly differences=switch-adapter-attributes
<div class="hw-field">
  <label class="hw-choice" for="readonly-copy">
    <input class="hw-switch" id="readonly-copy" name="copy" type="checkbox" role="switch" checked readonly aria-disabled="true">الاحتفاظ بنسخة من الطلبات المقدَّمة
  </label>
</div>
```

```tsx live example=readonly
<Switch label="الاحتفاظ بنسخة من الطلبات المقدَّمة" name="copy" defaultChecked readOnly />
```

```vue live example=readonly
<Switch label="الاحتفاظ بنسخة من الطلبات المقدَّمة" name="copy" :default-value="true" readonly />
```

```ts live example=readonly framework=angular
template: `<hw-switch label="الاحتفاظ بنسخة من الطلبات المقدَّمة" name="copy" [value]="true" [readOnly]="true" />`
```

### الخطأ

تُعرض قيمة `error` غير الفارغة فقرةً بعد عنصر التحكم، ويحمل عنصر الإدخال الخاصية `aria-invalid="true"`.

```html live example=error differences=switch-adapter-attributes
<div class="hw-field">
  <label class="hw-choice" for="error-terms">
    <input class="hw-switch" id="error-terms" name="terms" type="checkbox" role="switch" aria-invalid="true" aria-describedby="error-terms-error">السماح باستخدام بيانات التواصل الخاصة بي في هذا الطلب
  </label>
  <p class="hw-error" id="error-terms-error">فعّل هذا الإعداد لتقديم الطلب.</p>
</div>
```

```tsx live example=error
<Switch label="السماح باستخدام بيانات التواصل الخاصة بي في هذا الطلب" name="terms" error="فعّل هذا الإعداد لتقديم الطلب." />
```

```vue live example=error
<Switch label="السماح باستخدام بيانات التواصل الخاصة بي في هذا الطلب" name="terms" error="فعّل هذا الإعداد لتقديم الطلب." />
```

```ts live example=error framework=angular
template: `<hw-switch label="السماح باستخدام بيانات التواصل الخاصة بي في هذا الطلب" name="terms" error="فعّل هذا الإعداد لتقديم الطلب." />`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-switch

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-switch'` | `true` | — |

ليس لمفتاح التبديل متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصرًا بالصنف `hw-field` يضمّ عنصر `label` بالصنف `hw-choice`، وداخل التسمية عنصر إدخال أصليًا يحمل `type="checkbox"` و`role="switch"` والصنف `hw-switch`، ثم نص التسمية. وأضف فقرةً بالصنف `hw-hint` أو `hw-error` بعد التسمية، واربطها بعنصر الإدخال عبر الخاصية `aria-describedby`؛ فلا يربطهما أي برنامج نصي. وللإعداد غير الصالح اكتب الخاصية `aria-invalid="true"` على عنصر الإدخال مع رسالة `hw-error` الظاهرة. والخصائص `checked` و`disabled` و`required` خصائص أصلية، ويُرسل النموذج القيمة الأصلية `value` لعنصر الإدخال المحدَّد، وهي `on` افتراضيًا؛ فاكتب الخاصية `value` على عنصر الإدخال لضبط قيمة أخرى. وللمفتاح المخصّص للقراءة فقط اكتب الخاصيتين `readonly` و`aria-disabled="true"` على عنصر الإدخال؛ وتثبّت الدالة `enhance()` من حزمة vanilla آلية المنع التي تُبقي القيمة دون تغيير، ولا تمنح ورقة الأنماط المفتاح المخصّص للقراءة فقط مظهرًا خاصًا به.

### React

جدول: خصائص Switch

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

يقبل Switch أيضًا خصائص عنصر الإدخال الأصلي، ومنها `name` و`checked` و`defaultChecked` و`onChange` و`required` و`disabled` و`readOnly` و`ref`، وتصل إلى عنصر الإدخال؛ فالمرجع يصل إلى عنصر الإدخال لا إلى تسميته. مرّر `checked` مع `onChange` لمفتاح متحكَّم فيه، أو `defaultChecked` لمفتاح غير متحكَّم فيه. والتسمية والنص الإرشادي والخطأ محتوى React قابل للعرض. ويُعرض النص الإرشادي والخطأ فقرتين بعد التسمية ويرتبطان بعنصر الإدخال، وتضبط الخاصية `error` غير الفارغة `aria-invalid`. ولا يعرض Switch علامة الحقل المطلوب، فاذكر أن الإعداد مطلوب في نص `label`.

### Vue

جدول: خصائص Switch وأحداثه ومنافذه

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

يربط `v-model` القيمة المنطقية، وتضبط الخاصية `defaultValue` القيمة الأولية لمفتاح غير متحكَّم فيه. والخصائص `label` و`hint` و`error` سلاسل نصية؛ ويُعرض النص الإرشادي والخطأ فقرتين بعد التسمية ويرتبطان بعنصر الإدخال، وتضبط الخاصية `error` غير الفارغة `aria-invalid`. والخاصية `value` هي القيمة الأصلية التي يُرسلها المفتاح المفعَّل. وتصل خصائص HTML الأخرى، مثل `name` و`disabled`، والمستمعات إلى عنصر الإدخال الأصلي؛ وتُبقي الخاصية `readonly` القيمة دون تغيير، ويبقى المفتاح قابلًا للتركيز. ويسرد الجدول الخاصية `indeterminate` لأن التصريح المنشور لـSwitch يشترك مع Checkbox في الدالة المُنشئة؛ وليس للمفتاح حالة مختلطة، ولا أثر لهذه الخاصية فيه، فلا تضبطها. ويقرأ الإصدار المنشور المنفذ `default`، ولا يعرّف التصريح نوع أي منفذ؛ ويحمل المنفذ محتوى التسمية عندما لا تُمرَّر `label`.

### Angular

جدول: مُدخلات hw-switch ومخرجاته ومحتواه

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
| `submitValue` | input | `string \| null` | `false` | `null` |
| `valueChange` | output | `boolean` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `*` | content | — | `false` | — |

يعرض `HwSwitchComponent` (`hw-switch`) الحقل والتسمية وعنصر الإدخال الأصلي والنص الإرشادي والخطأ. اربط `[(value)]` ربطًا ثنائي الاتجاه بالقيمة المنطقية؛ ويعمل المكوّن أيضًا عنصرَ تحكم في النموذج عبر موصّل القيمة الخاص به. والمُدخلان `readOnly` و`disabled` منطقيان، والمُدخل `submitValue` هو القيمة الأصلية التي يُرسلها المفتاح المفعَّل؛ ودونه يُرسل المتصفح `on`. ويحتاج المفتاح إلى `label`، أو إلى محتوى تسمية مُسقَط، أو إلى `aria-label` أو `aria-labelledby` مكتوبة على `hw-switch`؛ وتُمرَّر هذه الخصائص إلى عنصر الإدخال وتُزال من العنصر المضيف. ويضبط `controlId` معرّف عنصر الإدخال؛ ويتقدّم معرّف التطبيق، ثم معرّف `hw-field` المحيط، ثم معرّف مولَّد.

## إمكانية الوصول

مفتاح التبديل عنصر إدخال أصلي من نوع مربع الاختيار يحمل `role="switch"`، فيوفّر المتصفح التركيز وحالة التحديد والإرسال مع النموذج، وتعلن التقنيات المساعدة أنه مفتاح تبديل مفعَّل أو غير مفعَّل. والتسمية عنصر `label` أصلي بالصنف `hw-choice` يضمّ عنصر الإدخال والنص، فيكون نص التسمية هو الاسم الميسّر، ويبدّل النقر عليها حالة المفتاح.

- يبدّل المفتاح <kbd>Space</kbd> حالة المفتاح كما في مربع الاختيار الأصلي؛ وينقل المفتاح <kbd>Tab</kbd> التركيز إليه ومنه.
- أبقِ التسمية نفسها عند تغيّر الحالة. فالتسمية مثل «الإشعارات مفعَّلة» التي تتحوّل إلى «الإشعارات متوقفة» تناقض الحالة المعلنة.
- لا يعرض مفتاح التبديل علامة الحقل المطلوب. فاذكر أن الإعداد مطلوب في التسمية، واكتب الخاصية `required` على عنصر الإدخال عندما يلزم أن يفرض المتصفح ذلك.
- يرتبط النص الإرشادي والخطأ بعنصر الإدخال عبر الخاصية `aria-describedby`، وتضبط الخاصية `error` غير الفارغة `aria-invalid`.
- يبقى المفتاح المخصّص للقراءة فقط قابلًا للتركيز، وتُرسَل قيمته مع النموذج، ولا يغيّر التفعيل بالمؤشر أو بلوحة المفاتيح قيمته. والمفتاح المعطَّل حالة أصلية مستقلة.
- تلغي ورقة الأنماط الانتقال المتحرّك لعنصر التحكم عندما يطلب القارئ تقليل الحركة.

## الاتجاه والتوطين

ليس في مفتاح التبديل نص مدمج: يكتب التطبيق التسمية والنص الإرشادي والخطأ بلغة الصفحة. ويتبع عنصر التحكم ونصه اتجاه القراءة في الصفحة، ففي النص المكتوب من اليمين إلى اليسار يقع عنصر التحكم في بداية التسمية، على اليمين، ويتحرّك المقبض في الاتجاه المنطقي للسطر لأن الأنماط المضمّنة في الحزم تستخدم خصائص CSS المنطقية.

- القيمة منطقية بالنسبة إلى التطبيق.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط مفتاح التبديل بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات عناصر الاختيار](../nic-choices.md) حالات مربعات الاختيار وأزرار الاختيار الأصلية الواردة في ورقة أنماط كود المنصات المزوَّدة. ولا تتناول مفتاح التبديل إلا في عبارتين: أن ذلك العمل لم يغيّر أبعاد المفتاح، وأن آلية المنع المشتركة لحالة القراءة فقط متاحة لمفتاح التبديل كما هي متاحة لمربع الاختيار وللخيار الواحد.
- معالجة حالة القراءة فقط تكييف: فخاصية HTML وحدها لا توقف مربع الاختيار الأصلي، لذا تُبقي آلية منع مشتركة القيمة دون تغيير، ويبقى عنصر التحكم قابلًا للتركيز؛ وتصف ذلك [ملاحظات عناصر الاختيار](../nic-choices.md).
