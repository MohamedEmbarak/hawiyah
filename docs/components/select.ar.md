---
source:
  summary: 9b25df1324b5
  example: 1b13d16f3346
  variants-and-states: 75a9a99c5377
  api: 1f2fd031a97f
  accessibility: 1ff39410381f
  rtl-and-localisation: b257d37bd91b
  platforms-code-reference: f633755c0df5
---
# قائمة اختيار

قائمة الاختيار عنصر `select` أصلي بأنماط هوية، ومعه تسمية ظاهرة ونص إرشادي ورسالة خطأ وخيار أول فارغ يدعو القارئ إلى الاختيار، عندما يوفّرها التطبيق. وتبقى القيمة سلسلة نصية، ويبقى للنظام الأساسي عرض القائمة المنسدلة والتحديد بلوحة المفاتيح والإرسال مع النموذج.

## مثال

لقائمة الاختيار تسمية ظاهرة تبيّن المعلومة المطلوبة. وتُعرض الخاصية `placeholder` خيارًا أول فارغًا، فيختار القارئ قيمة بدلًا من أن يُرسل الخيار الأول دون قصد.

```html live example=basic differences=select-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="basic-type" id="basic-type-label">نوع الطلب</label>
  <select class="hw-select" id="basic-type" name="type">
    <option value="">اختر النوع</option>
    <option value="new">طلب جديد</option>
    <option value="renewal">تجديد</option>
    <option value="replacement">استبدال</option>
  </select>
</div>
```

```tsx live example=basic
<Select
  label="نوع الطلب"
  name="type"
  placeholder="اختر النوع"
  options={[
    { value: 'new', label: 'طلب جديد' },
    { value: 'renewal', label: 'تجديد' },
    { value: 'replacement', label: 'استبدال' },
  ]}
/>
```

```vue live example=basic
<Select
  label="نوع الطلب"
  name="type"
  placeholder="اختر النوع"
  :options="[
    { value: 'new', label: 'طلب جديد' },
    { value: 'renewal', label: 'تجديد' },
    { value: 'replacement', label: 'استبدال' },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-select
  label="نوع الطلب"
  name="type"
  placeholder="اختر النوع"
  [options]="[
    { value: 'new', label: 'طلب جديد' },
    { value: 'renewal', label: 'تجديد' },
    { value: 'replacement', label: 'استبدال' },
  ]"
/>`
```

## الأشكال والحالات

### القيمة المحدَّدة

تبدأ قائمة الاختيار غير المتحكَّم فيها على الخيار الذي تساوي قيمته القيمة الأولية في المحوّل: `defaultValue` في React وVue، و`value` في Angular.

```html live example=selected differences=select-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="selected-channel" id="selected-channel-label">وسيلة التواصل المفضّلة</label>
  <select class="hw-select" id="selected-channel" name="channel">
    <option value="email" selected>البريد الإلكتروني</option>
    <option value="phone">الهاتف</option>
    <option value="post">البريد</option>
  </select>
</div>
```

```tsx live example=selected
<Select
  label="وسيلة التواصل المفضّلة"
  name="channel"
  defaultValue="email"
  options={[
    { value: 'email', label: 'البريد الإلكتروني' },
    { value: 'phone', label: 'الهاتف' },
    { value: 'post', label: 'البريد' },
  ]}
/>
```

```vue live example=selected
<Select
  label="وسيلة التواصل المفضّلة"
  name="channel"
  default-value="email"
  :options="[
    { value: 'email', label: 'البريد الإلكتروني' },
    { value: 'phone', label: 'الهاتف' },
    { value: 'post', label: 'البريد' },
  ]"
/>
```

```ts live example=selected framework=angular
template: `<hw-select
  label="وسيلة التواصل المفضّلة"
  name="channel"
  value="email"
  [options]="[
    { value: 'email', label: 'البريد الإلكتروني' },
    { value: 'phone', label: 'الهاتف' },
    { value: 'post', label: 'البريد' },
  ]"
/>`
```

### النص الإرشادي

يُعرض النص الإرشادي فقرةً بعد عنصر التحكم، ويرتبط به وصفًا له.

```html live example=hint differences=select-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="hint-language" id="hint-language-label">لغة الرد</label>
  <select class="hw-select" id="hint-language" name="language" aria-describedby="hint-language-hint">
    <option value="ar">العربية</option>
    <option value="en">الإنجليزية</option>
  </select>
  <p class="hw-hint" id="hint-language-hint">يُكتب الرد باللغة التي تختارها.</p>
</div>
```

```tsx live example=hint
<Select
  label="لغة الرد"
  name="language"
  hint="يُكتب الرد باللغة التي تختارها."
  options={[
    { value: 'ar', label: 'العربية' },
    { value: 'en', label: 'الإنجليزية' },
  ]}
/>
```

```vue live example=hint
<Select
  label="لغة الرد"
  name="language"
  hint="يُكتب الرد باللغة التي تختارها."
  :options="[
    { value: 'ar', label: 'العربية' },
    { value: 'en', label: 'الإنجليزية' },
  ]"
/>
```

```ts live example=hint framework=angular
template: `<hw-select
  label="لغة الرد"
  name="language"
  hint="يُكتب الرد باللغة التي تختارها."
  [options]="[
    { value: 'ar', label: 'العربية' },
    { value: 'en', label: 'الإنجليزية' },
  ]"
/>`
```

### حقل مطلوب

تعرض قائمة الاختيار المطلوبة علامة واحدة بعد تسميتها، وتحتفظ بالخاصية الأصلية `required`. وعند كتابة `placeholder` يكون الخيار الأول الفارغ هو القيمة التي يرفضها المتصفح عند الإرسال.

```html live example=required differences=select-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="required-category" id="required-category-label">تصنيف المستند<span class="hw-required-marker" aria-hidden="true"> *</span></label>
  <select class="hw-select" id="required-category" name="category" required>
    <option value="">اختر التصنيف</option>
    <option value="identity">وثيقة إثبات الهوية</option>
    <option value="certificate">إفادة</option>
  </select>
</div>
```

```tsx live example=required
<Select
  label="تصنيف المستند"
  name="category"
  placeholder="اختر التصنيف"
  required
  options={[
    { value: 'identity', label: 'وثيقة إثبات الهوية' },
    { value: 'certificate', label: 'إفادة' },
  ]}
/>
```

```vue live example=required
<Select
  label="تصنيف المستند"
  name="category"
  placeholder="اختر التصنيف"
  required
  :options="[
    { value: 'identity', label: 'وثيقة إثبات الهوية' },
    { value: 'certificate', label: 'إفادة' },
  ]"
/>
```

```ts live example=required framework=angular
template: `<hw-select
  label="تصنيف المستند"
  name="category"
  placeholder="اختر التصنيف"
  [required]="true"
  [options]="[
    { value: 'identity', label: 'وثيقة إثبات الهوية' },
    { value: 'certificate', label: 'إفادة' },
  ]"
/>`
```

### حقل فيه خطأ

يظهر الخطأ في فقرة بعد عنصر التحكم، ويحمل عنصر `select` الخاصية `aria-invalid="true"`، وتصفه الرسالة. وتذكر الرسالة ما الخطأ وكيف يُصحَّح.

```html live example=error differences=select-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="error-type" id="error-type-label">نوع الطلب</label>
  <select class="hw-select" id="error-type" name="type" aria-invalid="true" aria-describedby="error-type-error">
    <option value="">اختر النوع</option>
    <option value="new">طلب جديد</option>
    <option value="renewal">تجديد</option>
  </select>
  <p class="hw-error" id="error-type-error">اختر نوع الطلب.</p>
</div>
```

```tsx live example=error
<Select
  label="نوع الطلب"
  name="type"
  placeholder="اختر النوع"
  error="اختر نوع الطلب."
  options={[
    { value: 'new', label: 'طلب جديد' },
    { value: 'renewal', label: 'تجديد' },
  ]}
/>
```

```vue live example=error
<Select
  label="نوع الطلب"
  name="type"
  placeholder="اختر النوع"
  error="اختر نوع الطلب."
  :options="[
    { value: 'new', label: 'طلب جديد' },
    { value: 'renewal', label: 'تجديد' },
  ]"
/>
```

```ts live example=error framework=angular
template: `<hw-select
  label="نوع الطلب"
  name="type"
  placeholder="اختر النوع"
  error="اختر نوع الطلب."
  [options]="[
    { value: 'new', label: 'طلب جديد' },
    { value: 'renewal', label: 'تجديد' },
  ]"
/>`
```

### حقل معطَّل

تستخدم قائمة الاختيار المعطَّلة الخاصية الأصلية `disabled`.

```html live example=disabled differences=select-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="disabled-type" id="disabled-type-label">نوع الطلب</label>
  <select class="hw-select" id="disabled-type" name="type" disabled>
    <option value="renewal" selected>تجديد</option>
    <option value="new">طلب جديد</option>
  </select>
</div>
```

```tsx live example=disabled
<Select
  label="نوع الطلب"
  name="type"
  defaultValue="renewal"
  disabled
  options={[
    { value: 'renewal', label: 'تجديد' },
    { value: 'new', label: 'طلب جديد' },
  ]}
/>
```

```vue live example=disabled
<Select
  label="نوع الطلب"
  name="type"
  default-value="renewal"
  disabled
  :options="[
    { value: 'renewal', label: 'تجديد' },
    { value: 'new', label: 'طلب جديد' },
  ]"
/>
```

```ts live example=disabled framework=angular
template: `<hw-select
  label="نوع الطلب"
  name="type"
  value="renewal"
  [disabled]="true"
  [options]="[
    { value: 'renewal', label: 'تجديد' },
    { value: 'new', label: 'طلب جديد' },
  ]"
/>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-select

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-select'` | `true` | — |
| `aria-invalid` | `'true'` | `false` | — |
| `readonly` | `boolean` | `false` | — |
| `data-size` | `'lg' \| 'sm'` | `false` | — |
| `data-variant` | `'filled'` | `false` | — |
| `data-hw-filled` | `'true'` | `false` | — |
| `multiple` | `boolean` | `false` | — |
| `size` | `'0' \| '1'` | `false` | — |

ليس لقائمة الاختيار متحكم في JavaScript، فالترميز هو واجهتها البرمجية: اكتب عنصر `select` أصليًا بالصنف `hw-select` داخل عنصر بالصنف `hw-field`، وعنصر `label` بالصنف `hw-label` تشير خاصيته `for` إلى عنصر `select`، وعند الحاجة فقرةً بالصنف `hw-hint` أو `hw-error` بعد عنصر `select`. واربط الفقرة بعنصر `select` عبر الخاصية `aria-describedby`؛ فلا يربطهما أي برنامج نصي. وللحقل غير الصالح اكتب الخاصية `aria-invalid="true"` على عنصر `select` مع رسالة `hw-error` الظاهرة. وتغيّر الخاصية `data-size` ارتفاع الحقل بإحدى القيمتين `sm` و`lg`، وتضبط الخاصية `data-variant="filled"` المظهر المملوء؛ ودونهما يكون الحقل بالمظهر ذي الإطار وبالحجم المتوسط. وتعرض الخاصية `multiple`، أو الخاصية `size` بقيمة أكبر من `1`، مربع القائمة الأصلي؛ ودون `multiple` يبقى رمز السهم المنسدل عندما تغيب `size` أو تكون قيمتها `0` أو `1`. والخاصية `readonly` حالة في ورقة الأنماط فقط: فهي تزيل خط المرور بالمؤشر والتركيز والضغط، ولا تمنح HTML عنصر `select` حالة القراءة فقط، فتبقى القيمة قابلة للتغيير. والخاصية `data-hw-filled` خاصية حالة تضبطها الدالة `enhance()` من حزمة vanilla على `true` أو `false` في الحقل المكتوب يدويًا، بحسب احتواء عنصر `select` على قيمة؛ فلا تكتب لها قيمة بنفسك.

### React

جدول: خصائص Select

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `options` | `readonly Option[]` | `false` | — |
| `placeholder` | `string` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

يقبل Select أيضًا خصائص عنصر `select` الأصلي، ومنها `name` و`value` و`defaultValue` و`onChange` و`required` و`disabled` و`multiple` و`ref`، وتصل إلى عنصر `select`؛ فالمرجع يصل إلى عنصر `select` لا إلى تسميته. مرّر `value` مع `onChange` لقائمة اختيار متحكَّم فيها، أو `defaultValue` لقائمة اختيار غير متحكَّم فيها. والخاصية `options` قائمة بنود لكل منها `value` و`label` و`disabled` اختياري؛ ويمكن أيضًا كتابة عنصري `option` و`optgroup` الأصليين عناصرَ فرعية، فتأتي بعد البنود. وتعرض الخاصية `placeholder` خيارًا أول فارغًا؛ ولا يُعرض هذا الخيار دون `placeholder`، أو إذا كان أحد العناصر الفرعية أو أحد بنود `options` خيارًا فارغًا، أو مع `multiple`. والتسمية والنص الإرشادي والخطأ محتوى React قابل للعرض. ويُعرض النص الإرشادي والخطأ فقرتين بعد عنصر `select` ويرتبطان به، وتضبط الخاصية `error` غير الفارغة `aria-invalid`. وتعرض قائمة الاختيار المطلوبة ذات التسمية الظاهرة علامة واحدة؛ فلا تكتب نجمة في `label`. وليس لـSelect خاصية مكوّن للحجم أو للشكل: اكتب `data-size` أو `data-variant` خاصيةَ HTML أصلية، فتصل إلى عنصر `select`.

### Vue

جدول: خصائص Select وأحداثه ومنافذه

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

يربط `v-model` القيمة النصية، وتضبط الخاصية `defaultValue` القيمة الأولية لقائمة اختيار غير متحكَّم فيها؛ فاضبط القيمة الأولية بالخاصية `defaultValue`، لا بخاصية selected على خيار في المنفذ. والخاصية `options` قائمة بنود لكل منها `value` و`label` و`disabled` اختياري؛ وتأتي عناصر `option` و`optgroup` الأصلية في المنفذ `default` بعدها. وتعرض الخاصية `placeholder` خيارًا أول فارغًا؛ ولا يُعرض هذا الخيار إذا كان أحد البنود أو أحد الخيارات في المنفذ فارغًا، أو مع `multiple`. والخصائص `label` و`hint` و`error` سلاسل نصية؛ ويُعرض النص الإرشادي والخطأ فقرتين بعد عنصر `select` ويرتبطان به، وتضبط الخاصية `error` غير الفارغة `aria-invalid`. وتعرض الخاصية `required` علامة واحدة بعد التسمية، وتضبط خاصية HTML الأصلية. وتصل خصائص HTML الأخرى، مثل `name` و`disabled`، والمستمعات إلى عنصر `select` الأصلي. ويقرأ الإصدار المنشور المنفذ `default`، ولا يعرّف التصريح نوع أي منفذ. وليس لـSelect خاصية مكوّن للحجم أو للشكل: اكتب `data-size` أو `data-variant` خاصيةَ HTML أصلية، فتصل إلى عنصر `select`.

### Angular

جدول: مُدخلات hw-select ومخرجاته ومحتواه

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
| `options` | input | `readonly Option[]` | `false` | `[]` |
| `placeholder` | input | `string` | `false` | `''` |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `*` | content | — | `false` | — |

يعرض `HwSelectComponent` (`hw-select`) الحقل والتسمية وعنصر `select` الأصلي والنص الإرشادي والخطأ. اربط `[(value)]` ربطًا ثنائي الاتجاه بالقيمة النصية؛ ويعمل المكوّن أيضًا عنصرَ تحكم في النموذج عبر موصّل القيمة الخاص به. والمُدخل `options` قائمة بنود لكل منها `value` و`label` و`disabled` اختياري؛ وتأتي عناصر `option` و`optgroup` المُسقَطة بعدها، وتحدّد القيمة المربوطة الخيار المُسقَط حتى إذا عُرض لاحقًا. ويعرض المُدخل `placeholder` خيارًا أول فارغًا؛ ودونه لا يُعرض أي خيار فارغ، فإذا أسقطت خيارًا فارغًا فلا تضبط `placeholder`. ويضبط المُدخلان `size` و`visualVariant` مظهر عنصر `select` الأصلي. والمُدخلان `required` و`disabled` منطقيان، فيُضبط المُدخل نفسه بكتابة `[required]="true"` أو بكتابة الخاصية `required` دون قيمة. وتحتاج قائمة الاختيار إلى `label`، أو إلى `aria-label` أو `aria-labelledby` مكتوبة على `hw-select`، أو إلى تسمية عنصر `hw-field` يحيط بها؛ وتُمرَّر هذه الخصائص إلى عنصر `select` وتُزال من العنصر المضيف. ولا يدعم المكوّن `multiple`؛ فاستخدم `hw-multi-select`، أو عنصر `select` أصليًا بالصنف `hw-select`. ويضبط `controlId` معرّف عنصر `select`؛ ويتقدّم معرّف التطبيق، ثم معرّف `hw-field` المحيط، ثم معرّف مولَّد.

## إمكانية الوصول

قائمة الاختيار عنصر `select` أصلي، فيوفّر المتصفح دوره وسلوك التركيز عليه وقائمته المنسدلة والتحديد بلوحة المفاتيح والإرسال مع النموذج. والتسمية عنصر `label` أصلي تشير خاصيته `for` إلى عنصر `select`، فيكون نص التسمية هو الاسم الميسّر، وينقل النقر عليها التركيز إلى عنصر التحكم. ويرتبط النص الإرشادي والخطأ بعنصر `select` وصفًا له.

- يفتح المفتاح <kbd>Space</kbd> أو <kbd>Enter</kbd> القائمة المنسدلة الأصلية في معظم الأنظمة الأساسية، وتغيّر مفاتيح الأسهم الاختيار. وهذه المفاتيح من تعريف النظام الأساسي، لا من تعريف هوية.
- تُضبط الخاصية `aria-invalid="true"` عندما يمرّر التطبيق قيمة غير فارغة لـ`error` أو يمرّر `aria-invalid`، أو عندما يكون في `Field` أو `hw-field` المحيط خطأ.
- تُعرض الخاصية `placeholder` خيارًا أول فارغًا فحسب. وتبقى قائمة الاختيار المطلوبة التي تحمل `placeholder` غير صالحة حتى يختار القارئ خيارًا آخر، لأن المتصفح يعدّ القيمة الفارغة قيمة مفقودة.
- تُخفى علامة الحقل المطلوب عن التقنيات المساعدة؛ وتعبّر الخاصية الأصلية `required` عن أن الحقل مطلوب.
- ترسم ورقة الأنماط رمز سهم يدور عندما يكون التركيز على عنصر التحكم، وتستخدم مظهر النظام الأساسي لمربع القائمة، ومع `multiple`، وفي وضع الألوان القسرية.
- استخدم المكوّن Combobox عندما يحتاج القارئ إلى الكتابة للبحث؛ فقائمة الاختيار لا تقدّم إلا قائمة أصلية.

## الاتجاه والتوطين

ليس في قائمة الاختيار نص مدمج: يكتب التطبيق التسمية والنص الإرشادي والخطأ والنص النائب ونص كل خيار بلغة الصفحة. ويرث العنصر لغة الصفحة واتجاهها، وتبدّل الأنماط المضمّنة في الحزم موضع رمز السهم والحشوة في نهاية السطر بحسب الاتجاه، فيقع كلاهما في نهاية السطر في اتجاهَي القراءة كليهما.

- قيمة الخيار سلسلة نصية يعرّفها التطبيق؛ وتُترجَم التسمية الظاهرة ولا تُترجَم القيمة.
- يرسم المتصفح ونظام التشغيل القائمة المنبثقة، وتتبع قواعد الاتجاه الخاصة بهما.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط قائمة الاختيار بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات قائمة الاختيار](../nic-select.md) أبعاد قائمة الاختيار المغلقة، ورمز السهم الذي ينعكس عند التركيز، والحشوة في نهاية السطر التي تتبع اتجاه الكتابة، وأحجام النص الإرشادي ونص الخطأ، وتذكر درجة الثقة في كل ربط.
- حجم النص الإرشادي تكييف: تستخدم هوية 12px، وهي أصغر درجة في مقياس الخطوط لديها، بدلًا من 10px في المصدر؛ وتصف ذلك [ملاحظات قائمة الاختيار](../nic-select.md)، مع رسم رمز السهم الذي حلّ محل الرسم الأول.
