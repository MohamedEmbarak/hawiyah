---
source:
  summary: 7f8314e14a15
  example: 79c165841491
  variants-and-states: b931422c278f
  api: eefc27f4fb9c
  accessibility: 470e66f69ca4
  rtl-and-localisation: 79eac9dd8643
  platforms-code-reference: c1db6efc6ebf
---
# خيار واحد

الخيار الواحد زر اختيار أصلي يقع داخل تسمية قابلة للنقر، ويُستخدم لخيار واحد من مجموعة خيارات متنافية. وتشترك أزرار الاختيار المترابطة في اسم واحد، وتقع داخل مجموعة حقول يذكر عنوانها السؤال.

## مثال

يذكر عنوان المجموعة السؤال، وتذكر كل تسمية إجابة واحدة. وتشترك أزرار الاختيار في اسم واحد، فيلغي تحديد أحدها تحديد الأزرار الأخرى، وتنقل مفاتيح الأسهم بينها.

```html live example=basic differences=radio-adapter-markup
<fieldset class="hw-field">
  <legend class="hw-label">كيف تفضّل استلام القرار؟</legend>
  <label class="hw-choice" for="basic-delivery-post"><input class="hw-radio" id="basic-delivery-post" name="delivery" type="radio" value="post" checked>عبر البريد</label>
  <label class="hw-choice" for="basic-delivery-email"><input class="hw-radio" id="basic-delivery-email" name="delivery" type="radio" value="email">عبر البريد الإلكتروني</label>
  <label class="hw-choice" for="basic-delivery-office"><input class="hw-radio" id="basic-delivery-office" name="delivery" type="radio" value="office">الاستلام حضوريًا</label>
</fieldset>
```

```tsx live example=basic
<fieldset className="hw-field">
  <legend className="hw-label">كيف تفضّل استلام القرار؟</legend>
  <Radio label="عبر البريد" name="delivery" value="post" defaultChecked />
  <Radio label="عبر البريد الإلكتروني" name="delivery" value="email" />
  <Radio label="الاستلام حضوريًا" name="delivery" value="office" />
</fieldset>
```

```vue live example=basic
<fieldset class="hw-field">
  <legend class="hw-label">كيف تفضّل استلام القرار؟</legend>
  <Radio label="عبر البريد" name="delivery" value="post" default-value="post" />
  <Radio label="عبر البريد الإلكتروني" name="delivery" value="email" default-value="post" />
  <Radio label="الاستلام حضوريًا" name="delivery" value="office" default-value="post" />
</fieldset>
```

```ts live example=basic framework=angular
template: `<hw-radio-group label="كيف تفضّل استلام القرار؟" name="delivery" value="post" [options]="[
  { value: 'post', label: 'عبر البريد' },
  { value: 'email', label: 'عبر البريد الإلكتروني' },
  { value: 'office', label: 'الاستلام حضوريًا' },
]" />`
```

## الأشكال والحالات

### خيار معطَّل

يستخدم زر الاختيار المعطَّل الخاصية الأصلية `disabled`: فيخرج من ترتيب التنقل بالمفتاح Tab، ولا يمكن تحديده، وتبقى الخيارات الأخرى في المجموعة متاحة.

```html live example=disabled differences=radio-adapter-markup
<fieldset class="hw-field">
  <legend class="hw-label">ما المكتب الذي يتولى معالجة الطلب؟</legend>
  <label class="hw-choice" for="disabled-office-north"><input class="hw-radio" id="disabled-office-north" name="office" type="radio" value="north">مكتب الشمال</label>
  <label class="hw-choice" for="disabled-office-south"><input class="hw-radio" id="disabled-office-south" name="office" type="radio" value="south" disabled>مكتب الجنوب</label>
</fieldset>
```

```tsx live example=disabled
<fieldset className="hw-field">
  <legend className="hw-label">ما المكتب الذي يتولى معالجة الطلب؟</legend>
  <Radio label="مكتب الشمال" name="office" value="north" />
  <Radio label="مكتب الجنوب" name="office" value="south" disabled />
</fieldset>
```

```vue live example=disabled
<fieldset class="hw-field">
  <legend class="hw-label">ما المكتب الذي يتولى معالجة الطلب؟</legend>
  <Radio label="مكتب الشمال" name="office" value="north" />
  <Radio label="مكتب الجنوب" name="office" value="south" disabled />
</fieldset>
```

```ts live example=disabled framework=angular
template: `<hw-radio-group label="ما المكتب الذي يتولى معالجة الطلب؟" name="office" [options]="[
  { value: 'north', label: 'مكتب الشمال' },
  { value: 'south', label: 'مكتب الجنوب', disabled: true },
]" />`
```

### للقراءة فقط

تبقى المجموعة المخصّصة للقراءة فقط في ترتيب التنقل بالمفتاح Tab، وتُرسَل قيمتها مع النموذج، ولا يغيّر النقر أو مفتاح السهم القيمة ولا أزرار الاختيار الأخرى في المجموعة.

```html live example=readonly differences=radio-adapter-markup
<fieldset class="hw-field">
  <legend class="hw-label">لغة المراسلات المفضّلة</legend>
  <label class="hw-choice" for="readonly-language-ar"><input class="hw-radio" id="readonly-language-ar" name="language" type="radio" value="ar" checked readonly aria-disabled="true">العربية</label>
  <label class="hw-choice" for="readonly-language-en"><input class="hw-radio" id="readonly-language-en" name="language" type="radio" value="en" readonly aria-disabled="true">الإنجليزية</label>
</fieldset>
```

```tsx live example=readonly
<fieldset className="hw-field">
  <legend className="hw-label">لغة المراسلات المفضّلة</legend>
  <Radio label="العربية" name="language" value="ar" defaultChecked readOnly />
  <Radio label="الإنجليزية" name="language" value="en" readOnly />
</fieldset>
```

```vue live example=readonly
<fieldset class="hw-field">
  <legend class="hw-label">لغة المراسلات المفضّلة</legend>
  <Radio label="العربية" name="language" value="ar" default-value="ar" readonly />
  <Radio label="الإنجليزية" name="language" value="en" default-value="ar" readonly />
</fieldset>
```

```ts live example=readonly framework=angular
template: `<hw-radio-group label="لغة المراسلات المفضّلة" name="language" value="ar" [readOnly]="true" [options]="[
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'الإنجليزية' },
]" />`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-radio

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-radio'` | `true` | — |
| `readonly` | `boolean` | `false` | — |
| `aria-disabled` | `'true'` | `false` | — |

ليس للخيار الواحد متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر `fieldset` بالصنف `hw-field` وعنصر `legend` بالصنف `hw-label`، ولكل خيار عنصر `label` بالصنف `hw-choice` يضمّ عنصر إدخال أصليًا يحمل `type="radio"` والصنف `hw-radio`، ثم نص التسمية. وامنح أزرار الاختيار في المجموعة الخاصية `name` نفسها. وأضف فقرةً بالصنف `hw-hint` أو `hw-error`، واربطها بعناصر الإدخال عبر الخاصية `aria-describedby`؛ فلا يربطها أي برنامج نصي. والخصائص `checked` و`disabled` و`required` خصائص أصلية. وللمجموعة المخصّصة للقراءة فقط اكتب الخاصيتين `readonly` و`aria-disabled="true"` على كل زر اختيار؛ وتثبّت الدالة `enhance()` من حزمة vanilla آلية المنع التي تُبقي القيمة وأزرار الاختيار الأخرى في المجموعة دون تغيير.

### React

جدول: خصائص Radio

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

يعرض Radio خيارًا واحدًا، ويقبل خصائص عنصر الإدخال الأصلي، ومنها `name` و`value` و`checked` و`defaultChecked` و`onChange` و`required` و`disabled` و`readOnly` و`ref`، وتصل إلى عنصر الإدخال؛ فالمرجع يصل إلى عنصر الإدخال لا إلى تسميته. وامنح أزرار الاختيار في المجموعة الخاصية `name` نفسها، وكوّن المجموعة بعنصري `fieldset` و`legend` الأصليين. مرّر `checked` مع `onChange` لخيار متحكَّم فيه، أو `defaultChecked` لخيار غير متحكَّم فيه. والتسمية والنص الإرشادي والخطأ محتوى React قابل للعرض. ويُعرض النص الإرشادي والخطأ فقرتين بعد التسمية ويرتبطان بعنصر الإدخال، وتضبط الخاصية `error` غير الفارغة `aria-invalid`. ولا يعرض Radio علامة الحقل المطلوب، فاذكر أن الاختيار مطلوب في عنوان المجموعة أو في نص `label`.

### Vue

جدول: خصائص Radio وأحداثه ومنافذه

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
| `update:modelValue` | event | `(value: string) => void` | `false` | — |
| `default` | slot | — | `false` | — |

يعرض Radio خيارًا واحدًا. وتشكّل أزرار الاختيار التي تشترك في `name` واحد مجموعة، ويكتب التطبيق عنصري `fieldset` و`legend`. ويربط `v-model` القيمة النصية للمجموعة، ويكون كل زر اختيار محدَّدًا عندما تساوي تلك القيمة قيمة خاصيته `value`؛ وتذكر الخاصية `defaultValue` على أزرار الاختيار في المجموعة الخيار المحدَّد في البداية وبعد إعادة الضبط الأصلية للنموذج. والخصائص `label` و`hint` و`error` سلاسل نصية؛ ويُعرض النص الإرشادي والخطأ فقرتين بعد التسمية ويرتبطان بعنصر الإدخال، وتضبط الخاصية `error` غير الفارغة `aria-invalid`. وتصل خصائص HTML الأخرى، مثل `name` و`disabled`، والمستمعات إلى عنصر الإدخال الأصلي؛ وتُبقي الخاصية `readonly` القيمة وأزرار الاختيار الأخرى في المجموعة دون تغيير، ويبقى زر الاختيار قابلًا للتركيز. ويسرد الجدول الخاصية `indeterminate` لأن التصريح المنشور لـRadio يشترك مع Checkbox في الدالة المُنشئة؛ وليس لزر الاختيار حالة مختلطة، ولا أثر لهذه الخاصية فيه، فلا تضبطها. ويقرأ الإصدار المنشور المنفذ `default`، ولا يعرّف التصريح نوع أي منفذ؛ ويحمل المنفذ محتوى التسمية عندما لا تُمرَّر `label`.

### Angular

جدول: مُدخلات hw-radio-group ومخرجاته ومحتواه

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
| `options` | input | `readonly Option[]` | `false` | `[]` |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |

يعرض `HwRadioGroupComponent` (`hw-radio-group`) مجموعة أزرار اختيار أصلية: مجموعة حقول، وعنوانًا للمجموعة من `label`، وزر اختيار أصليًا لكل بند من بنود `options`، والنص الإرشادي والخطأ. وليس لزر الاختيار المنفرد مكوّن في Angular في الإصدار 0.3.0؛ فاكتب عنصر إدخال أصليًا بالصنف `hw-radio`. اربط `[(value)]` ربطًا ثنائي الاتجاه بالقيمة النصية؛ ويعمل المكوّن أيضًا عنصرَ تحكم في النموذج عبر موصّل القيمة الخاص به. ولكل بند من بنود `options` الحقول `value` و`label` و`disabled` الاختياري. والمُدخلان `readOnly` و`disabled` منطقيان. وتحتاج المجموعة إلى `label`، أو إلى `aria-label` أو `aria-labelledby` مكتوبة على `hw-radio-group`؛ وتُمرَّر هذه الخصائص إلى مجموعة الحقول وتُزال من العنصر المضيف. والمُدخل `name` هو الاسم المشترك لأزرار الاختيار. والمُدخل `controlId` هو بادئة معرّف كل زر اختيار (`controlId` ثم شَرطة ثم ترتيب الخيار)، وبادئة الخاصية `for` في تسميته، وبادئة معرّفَي النص الإرشادي والخطأ، والقيمة البديلة لـ`name`؛ ويتقدّم معرّف التطبيق، ثم معرّف `hw-field` المحيط، ثم معرّف مولَّد. ولا تحمل مجموعة الحقول أي معرّف.

## إمكانية الوصول

الخيار الواحد عنصر إدخال أصلي يحمل `type="radio"`، فيوفّر المتصفح دوره وحالة التحديد والتركيز المتنقل بين الأزرار والإرسال مع النموذج. وكل تسمية عنصر `label` أصلي بالصنف `hw-choice` يضمّ عنصر الإدخال والنص، فيكون نص التسمية هو الاسم الميسّر للخيار، ويحدّد النقر عليها الخيار. وعنوان مجموعة الحقول هو اسم المجموعة.

- ينقل المفتاح <kbd>Tab</kbd> التركيز إلى المجموعة، إلى زر الاختيار المحدَّد، أو إلى الزر الأول (<kbd>Tab</kbd>) أو الأخير (<kbd>Shift</kbd> + <kbd>Tab</kbd>) إذا لم يكن أي زر محدَّدًا، وينقله خارجها؛ ويحدّد المفتاح <kbd>Space</kbd> زر الاختيار الذي عليه التركيز إذا لم يكن أي زر محدَّدًا.
- ينقل <kbd>السهم السفلي</kbd> و<kbd>السهم الأيمن</kbd> والسهمان المقابلان لهما التركيز إلى زر الاختيار التالي أو السابق في المجموعة ويحدّدانه. وهذا سلوك أصلي لأزرار الاختيار، يطبّقه المتصفح على عناصر الإدخال التي تحمل `name` نفسه. وفي النص المكتوب من اليمين إلى اليسار يعدّ المتصفح <kbd>السهم الأيسر</kbd> انتقالًا إلى زر الاختيار التالي، و<kbd>السهم الأيمن</kbd> انتقالًا إلى السابق.
- يلزم أن تشترك أزرار الاختيار المترابطة في `name` واحد. وفي React وVue يكتب التطبيق عنصري `fieldset` و`legend`؛ فالمكوّن Radio خيار واحد. وفي Angular يعرض `hw-radio-group` مجموعة الحقول وعنوانها والخيارات.
- لا يعرض زر الاختيار علامة الحقل المطلوب، وتبقى الخاصية `required` أصلية على كل زر اختيار في المجموعة. ويحمل عنوان المجموعة في `hw-radio-group` علامة الحقل المطلوب عندما تكون المجموعة مطلوبة.
- يرتبط النص الإرشادي والخطأ بعنصر الإدخال عبر الخاصية `aria-describedby`، وتضبط الخاصية `error` غير الفارغة `aria-invalid`؛ وفي `hw-radio-group` يقع الوصف وحالة عدم الصلاحية على مجموعة الحقول.
- تبقى المجموعة المخصّصة للقراءة فقط قابلة للتركيز، وتُرسَل قيمتها مع النموذج، ولا يغيّر التفعيل بالمؤشر أو بلوحة المفاتيح القيمة ولا أزرار الاختيار الأخرى في المجموعة. وزر الاختيار المعطَّل حالة أصلية مستقلة.
- تلغي ورقة الأنماط الانتقال المتحرّك للهالة التي تظهر عند المرور بالمؤشر عندما يطلب القارئ تقليل الحركة.

## الاتجاه والتوطين

ليس في الخيار الواحد نص مدمج: يكتب التطبيق عنوان المجموعة والتسميات والنصوص الإرشادية والأخطاء بلغة الصفحة. ويتبع عنصر التحكم ونصه اتجاه القراءة في الصفحة، ففي النص المكتوب من اليمين إلى اليسار تقع الدائرة في بداية التسمية، على اليمين، لأن الدائرة تأتي أولًا في التسمية والتسمية تتبع اتجاه القراءة.

- قيمة زر الاختيار سلسلة نصية يعرّفها التطبيق؛ وتُترجَم التسمية الظاهرة ولا تُترجَم القيمة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط الخيار الواحد بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات عناصر الاختيار](../nic-choices.md) عنصر التحكم بقياس 20px، والهالة التي تظهر عند المرور بالمؤشر، والنقطة في المركز، ومظهري الحالة المعطَّلة وحالة القراءة فقط، ومعالجة التركيز، الواردة في ورقة أنماط كود المنصات المزوَّدة، وتذكر درجة الثقة في كل ربط.
- يُكيَّف مربع التركيز الوارد في المصدر لزر الاختيار إلى إطار حول عنصر التحكم الأصلي، ومعالجة حالة القراءة فقط تكييف يحافظ على أزرار الاختيار الأخرى في المجموعة؛ وتصف [ملاحظات عناصر الاختيار](../nic-choices.md) كليهما.
