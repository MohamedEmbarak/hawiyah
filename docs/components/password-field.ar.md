---
source:
  summary: 9421ca827070
  example: 77a55a237f6b
  variants-and-states: 4e745606e264
  api: ca92c4e54f61
  accessibility: 080604af65d0
  rtl-and-localisation: fb4cc01f7207
  platforms-code-reference: fdedb54fe9b6
---
# كلمة المرور

حقل كلمة المرور عنصر إدخال لكلمة المرور له تسمية، ومعه زر يُظهر النص المُدخل أو يخفيه. ويوفّر التطبيق التسمية والنص الإرشادي والخطأ واسمَي الزر؛ فليس للمكوّن نص خاص به.

## مثال

للحقل تسمية ظاهرة، وزر الإظهار والإخفاء زر يسمّيه التطبيق: اسمه `showLabel` ما دامت كلمة المرور مخفية، و`hideLabel` ما دامت ظاهرة. ويغيّر إظهار كلمة المرور نوع عنصر الإدخال، ويحتفظ بقيمته.

```html live example=basic static differences=password-field-adapter-markup
<div class="hw-field hw-password-field" data-hw="password-field">
  <label class="hw-label" for="basic-password">كلمة المرور</label>
  <div class="hw-password-control">
    <input class="hw-input" id="basic-password" name="password" type="password" autocomplete="current-password" data-hw-password-input>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="إظهار كلمة المرور" data-hw-password-toggle data-hw-hide-label="إخفاء كلمة المرور"></button>
  </div>
</div>
```

```tsx live example=basic
<PasswordField label="كلمة المرور" name="password" autoComplete="current-password" showLabel="إظهار كلمة المرور" hideLabel="إخفاء كلمة المرور" />
```

```vue live example=basic
<PasswordField label="كلمة المرور" name="password" autocomplete="current-password" show-label="إظهار كلمة المرور" hide-label="إخفاء كلمة المرور" />
```

```ts live example=basic framework=angular
template: `<hw-password-field label="كلمة المرور" name="password" showLabel="إظهار كلمة المرور" hideLabel="إخفاء كلمة المرور" />`
```

## الأشكال والحالات

### زر نصي للإظهار والإخفاء

عندما تكون قيمة `toggleVariant` هي `text`، يعرض زر الإظهار والإخفاء اسمه نصًّا ظاهرًا بدلًا من الأيقونة. ويبقى الاسم هو الاسم الميسّر للزر في الشكلين كليهما.

```html live example=text-toggle static differences=password-field-adapter-markup
<div class="hw-field hw-password-field" data-hw="password-field" data-hw-toggle-variant="text">
  <label class="hw-label" for="text-password">كلمة المرور الجديدة</label>
  <div class="hw-password-control">
    <input class="hw-input" id="text-password" name="new-password" type="password" autocomplete="new-password" data-hw-password-input>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="إظهار" data-hw-password-toggle data-hw-hide-label="إخفاء"></button>
  </div>
</div>
```

```tsx live example=text-toggle
<PasswordField label="كلمة المرور الجديدة" name="new-password" autoComplete="new-password" toggleVariant="text" showLabel="إظهار" hideLabel="إخفاء" />
```

```vue live example=text-toggle
<PasswordField label="كلمة المرور الجديدة" name="new-password" autocomplete="new-password" toggle-variant="text" show-label="إظهار" hide-label="إخفاء" />
```

```ts live example=text-toggle framework=angular
template: `<hw-password-field label="كلمة المرور الجديدة" name="new-password" autocomplete="new-password" toggleVariant="text" showLabel="إظهار" hideLabel="إخفاء" />`
```

### النص الإرشادي والخطأ

يذكر النص الإرشادي القاعدة التي يجب أن تستوفيها كلمة المرور. ويظهر الخطأ بعد عنصر التحكم، ويصف ما الخطأ وكيف يُصحَّح.

```html live example=error static differences=password-field-adapter-markup
<div class="hw-field hw-password-field" data-hw="password-field">
  <label class="hw-label" for="error-password">كلمة المرور الجديدة</label>
  <div class="hw-password-control">
    <input class="hw-input" id="error-password" name="new-password" type="password" autocomplete="new-password" aria-invalid="true" aria-describedby="error-password-hint error-password-error" data-hw-password-input>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="إظهار كلمة المرور" data-hw-password-toggle data-hw-hide-label="إخفاء كلمة المرور"></button>
  </div>
  <p class="hw-hint" id="error-password-hint">استخدم 12 خانة على الأقل.</p>
  <p class="hw-error" id="error-password-error">كلمة المرور أقصر من 12 خانة. أدخل كلمة مرور أطول.</p>
</div>
```

```tsx live example=error
<PasswordField label="كلمة المرور الجديدة" name="new-password" autoComplete="new-password" showLabel="إظهار كلمة المرور" hideLabel="إخفاء كلمة المرور" hint="استخدم 12 خانة على الأقل." error="كلمة المرور أقصر من 12 خانة. أدخل كلمة مرور أطول." />
```

```vue live example=error
<PasswordField label="كلمة المرور الجديدة" name="new-password" autocomplete="new-password" show-label="إظهار كلمة المرور" hide-label="إخفاء كلمة المرور" hint="استخدم 12 خانة على الأقل." error="كلمة المرور أقصر من 12 خانة. أدخل كلمة مرور أطول." />
```

```ts live example=error framework=angular
template: `<hw-password-field label="كلمة المرور الجديدة" name="new-password" autocomplete="new-password" showLabel="إظهار كلمة المرور" hideLabel="إخفاء كلمة المرور" hint="استخدم 12 خانة على الأقل." error="كلمة المرور أقصر من 12 خانة. أدخل كلمة مرور أطول." />`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createPasswordField

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `showLabel` | `string` | `false` | — |
| `hideLabel` | `string` | `false` | — |
| `toggleVariant` | `'icon' \| 'text'` | `false` | — |
| `onVisibleChange` | `(visible: boolean) => void` | `false` | — |

تهيّئ الدالة `createPasswordField` عنصرًا بالصنف `hw-password-field` يحتوي على عنصر إدخال أصلي يحمل الخاصية `data-hw-password-input`، وزر يحمل الخاصية `data-hw-password-toggle`؛ وتجري التهيئة نفسها للعنصر الذي يحمل `data-hw="password-field"` عبر الدالة `enhance()`. اكتب عنصر `label` قبل العنصر `hw-password-control`، الذي لا يحتوي إلا على عنصر الإدخال والزر، ليقع زر الإظهار والإخفاء في نهاية عنصر الإدخال. ويُرجع المتحكم `visible` و`toggle()` و`destroy()`. والاسمان مطلوبان. مرّر `showLabel` و`hideLabel`؛ أو اكتب اسم الإظهار في الخاصية `aria-label` التي يكتبها المطوّر على الزر أو في نص الزر، أو في الخاصية `data-hw-show-label`، واكتب اسم الإخفاء في الخاصية `data-hw-hide-label`، كلًّا منهما على الزر أو على الجذر. ويتقدّم الخيار على الخاصية. ويُقرأ `toggleVariant` أيضًا من الخاصية `data-hw-toggle-variant`؛ وإذا غاب كلاهما استخدم المتحكم القيمة `icon`، ويُدرج الأيقونة ما لم يكن الشكل `text`. ويتلقّى `onVisibleChange` الحالة الجديدة، ويحمل الحدث `hw:change` القيمة `{ visible }`. وتُخفي إعادة تعيين النموذج القيمة، وتُبلغ بالقيمة `false` مرة واحدة إذا كانت القيمة ظاهرة.

### React

جدول: خصائص PasswordField

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `visible` | `boolean` | `false` | — |
| `defaultVisible` | `boolean` | `false` | `false` |
| `onVisibleChange` | `(visible: boolean) => void` | `false` | — |
| `showLabel` | `string` | `true` | — |
| `hideLabel` | `string` | `true` | — |
| `toggleVariant` | `'icon' \| 'text'` | `false` | `'icon'` |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

يقبل PasswordField خصائص TextField عدا `type`، مثل `name` و`value` و`defaultValue` و`onChange` و`required` و`disabled` و`readOnly` و`autoComplete`، وتصل إلى عنصر الإدخال. مرّر `visible` مع `onVisibleChange` للتحكم في ظهور كلمة المرور، أو `defaultVisible` لحقل غير متحكَّم فيه. والخاصيتان `showLabel` و`hideLabel` مطلوبتان، وهما الاسمان الميسّران لزر الإظهار والإخفاء. ويُعرض النص الإرشادي والخطأ فقرتين بعد عنصر التحكم.

### Vue

جدول: خصائص PasswordField وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `showLabel` | prop | `string` | `true` | — |
| `hideLabel` | prop | `string` | `true` | — |
| `toggleVariant` | prop | `'icon' \| 'text'` | `false` | `'icon'` |
| `visible` | prop | `boolean` | `false` | — |
| `defaultVisible` | prop | `boolean` | `false` | `false` |
| `modelValue` | prop | `string` | `false` | — |
| `defaultValue` | prop | `string` | `false` | `''` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: string) => void` | `false` | — |
| `update:visible` | event | `(visible: boolean) => void` | `false` | — |

يربط `v-model` القيمة النصية، ويربط `v-model` مع الوسيط `visible` ظهور كلمة المرور؛ وتضبط الخاصيتان `defaultValue` و`defaultVisible` الحالة الأولية لحقل غير متحكَّم فيه. والخاصيتان `showLabel` و`hideLabel` مطلوبتان. وتصل خصائص HTML الأخرى، مثل `name` و`autocomplete`، إلى عنصر الإدخال الأصلي. ولا يعرّف التصريح المنشور نوع أي منفذ، ولا يقرأ الإصدار المنشور أي منفذ.

### Angular

جدول: مُدخلات hw-password-field ومخرجاته ومحتواه

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
| `autocomplete` | input | `string` | `false` | `'current-password'` |
| `placeholder` | input | `string` | `false` | `''` |
| `toggleVariant` | input | `'icon' \| 'text'` | `false` | `'icon'` |
| `showLabel` | input | `string` | `true` | — |
| `hideLabel` | input | `string` | `true` | — |
| `visible` | input | `boolean` | `false` | `false` |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `visibleChange` | output | `boolean` | `false` | — |

يعرض `HwPasswordFieldComponent` (`hw-password-field`) الحقل والتسمية وعنصر الإدخال وزر الإظهار والإخفاء والنص الإرشادي والخطأ. اربط `[(value)]` ربطًا ثنائي الاتجاه بالقيمة النصية، و`[(visible)]` بظهور كلمة المرور؛ ولا تغيّر القيمة التي تكتبها نماذج Angular ظهور كلمة المرور. والمُدخلان `showLabel` و`hideLabel` مطلوبان. ودون المُدخل `autocomplete` يكتب الحقل `autocomplete="current-password"`، فاكتب القيمة القياسية لكلمة المرور الجديدة عندما يختار القارئ كلمة مرور. ويضبط `controlId` معرّف عنصر الإدخال.

## إمكانية الوصول

عنصر الإدخال عنصر أصلي، فيوفّر المتصفح دوره وتحرير النص فيه والتعامل مع لوحة المفاتيح، وتسمّيه التسمية. وزر الإظهار والإخفاء زر يسمّيه `showLabel` أو `hideLabel`، ويحمل الخاصيتين `aria-pressed` و`aria-controls`؛ والأيقونة في الشكل `icon` زخرفية.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: كلمة المرور

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز بين عنصر الإدخال وزر الإظهار والإخفاء بترتيب المستند. |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | يفعّل زر الإظهار والإخفاء الذي عليه التركيز، فيُظهر كلمة المرور أو يخفيها. |

- يحتفظ إظهار كلمة المرور أو إخفاؤها بعنصر الإدخال وقيمته، ويُبقي التركيز على زر الإظهار والإخفاء.
- يمكن إظهار كلمة المرور المخصّصة للقراءة فقط، لأن تغيير ظهورها لا يعدّل القيمة. ولا يمكن تبديل ظهور كلمة المرور في عنصر إدخال معطَّل.
- يعمل اللصق وبرامج إدارة كلمات المرور كما تعمل في عنصر إدخال كلمة المرور الأصلي.
- تُخفي إعادة تعيين النموذج القيمة.

## الاتجاه والتوطين

ليس في حقل كلمة المرور نص مدمج: يكتب التطبيق التسمية والنص الإرشادي والخطأ واسمَي زر الإظهار والإخفاء بلغة الصفحة. ويقع الزر في النهاية المنطقية لعنصر الإدخال، ولا تنعكس أيقونته في النص المكتوب من اليمين إلى اليسار.

- يُدخَل نص كلمة المرور ويُعرض كما يكتبه القارئ؛ ولا يغيّر المكوّن اتجاهه ولا نظام كتابته.
- في الشكل `text` قد ينتقل الاسم الظاهر لزر الإظهار والإخفاء إلى سطر جديد في الحقل الضيّق، فاجعله قصيرًا.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط حقل كلمة المرور بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- زر الإظهار والإخفاء الواقع داخل عنصر الإدخال في نهايته المنطقية هو الإجراء المدمج في هوية، الذي يحجز مساحة لعنصر التحكم الخاص به كما تربط [ملاحظات حقول الإدخال](../nic-inputs.md) الحشوة الأفقية لعنصر الإدخال؛ وتذكر [ملاحظات إظهار كلمة المرور](../password-field.md) أن الأيقونات لا تدّعي أنها قورنت بعُقد هيئة الحكومة الرقمية، ولا أنها تماثلها مرئيًا.
- تصف [ملاحظات إظهار كلمة المرور](../password-field.md) زر الإظهار والإخفاء واسمَيه وسلوك إعادة التعيين الذي تعيد هذه الصفحة ذكره للقارئ.
