---
source:
  summary: 9b35560205af
  example: 3e6d83683eee
  variants-and-states: c9d3a17a0373
  api: 67725b93e2b9
  accessibility: 73b09af8acda
  rtl-and-localisation: e19cd79782f3
  platforms-code-reference: 140f499484e1
---
# تقييم

التقييم مجموعة من أزرار الاختيار الأصلية لها تسمية، لاختيار عدد صحيح من النجوم، ويعرض RatingDisplay درجة قد تكون كسرية دون أي عنصر إدخال. ويوفّر التطبيق التسمية ونص كل نجمة.

## مثال

للمجموعة عنوان ظاهر في العنصر `legend`. وكل نجمة زر اختيار أصلي له اسم ميسّر مثل «3 من 5»، ورمز النجمة زخرفي. ويملأ اختيار نجمة كل النجوم حتى تلك النجمة، ولا يُحدَّد ولا يُرسَل إلا زر الاختيار المختار.

```html live example=basic static differences=rating-adapter-markup,rating-angular-radio-names
<fieldset class="hw-field hw-rating" data-hw="rating">
  <legend class="hw-label">قيّم هذه الخدمة</legend>
  <label><input type="radio" name="service-rating" value="1" aria-label="1 من 5"><span aria-hidden="true">★</span></label>
  <label><input type="radio" name="service-rating" value="2" aria-label="2 من 5"><span aria-hidden="true">★</span></label>
  <label><input type="radio" name="service-rating" value="3" aria-label="3 من 5" checked><span aria-hidden="true">★</span></label>
  <label><input type="radio" name="service-rating" value="4" aria-label="4 من 5"><span aria-hidden="true">★</span></label>
  <label><input type="radio" name="service-rating" value="5" aria-label="5 من 5"><span aria-hidden="true">★</span></label>
</fieldset>
```

```tsx live example=basic
<Rating label="قيّم هذه الخدمة" name="service-rating" defaultValue={3} getRatingLabel={(value, max) => value + ' من ' + max} />
```

```vue live example=basic
<Rating label="قيّم هذه الخدمة" name="service-rating" :default-value="3" :get-rating-label="(value, max) => value + ' من ' + max" />
```

```ts live example=basic framework=angular
template: `<hw-rating label="قيّم هذه الخدمة" name="service-rating" [value]="3" [getRatingLabel]="(value, max) => value + ' من ' + max" />`
```

## الأشكال والحالات

### عرض الدرجة

يعرض RatingDisplay درجة إجمالية صورةً واحدة لها بديل نصي واحد، تُرجعه `getValueLabel`. وليس فيه أزرار اختيار ولا موضع تركيز ولا قيمة في النموذج. ويملأ الكسرُ جزءًا من نجمة، وتُخفى الدرجة الظاهرة الاختيارية عن التقنيات المساعدة لتجنّب تكرار البديل النصي.

```html live example=display static
<div class="hw-rating-display" role="img" aria-label="التقييم 3.5 من 5">
  <span class="hw-rating-stars" aria-hidden="true">
    <span class="hw-rating-star">★<span class="hw-rating-fill" style="--hw-rating-fill: 100%"></span></span>
    <span class="hw-rating-star">★<span class="hw-rating-fill" style="--hw-rating-fill: 100%"></span></span>
    <span class="hw-rating-star">★<span class="hw-rating-fill" style="--hw-rating-fill: 100%"></span></span>
    <span class="hw-rating-star">★<span class="hw-rating-fill" style="--hw-rating-fill: 50%"></span></span>
    <span class="hw-rating-star">★<span class="hw-rating-fill" style="--hw-rating-fill: 0%"></span></span>
  </span>
  <span class="hw-rating-score" aria-hidden="true">3.5/5</span>
</div>
```

```tsx live example=display
<RatingDisplay value={3.5} getValueLabel={(value, max) => 'التقييم ' + value + ' من ' + max} />
```

```vue live example=display
<RatingDisplay :value="3.5" :get-value-label="(value, max) => 'التقييم ' + value + ' من ' + max" />
```

```ts live example=display framework=angular
template: `<hw-rating-display [value]="3.5" [getValueLabel]="(value, max) => 'التقييم ' + value + ' من ' + max" />`
```

### تقييم مطلوب فيه خطأ

تأخذ المجموعة المطلوبة علامة واحدة بعد عنوانها. ويظهر الخطأ بعد النجوم، ويصف ما ينبغي أن يفعله القارئ.

```html live example=error static differences=rating-adapter-markup,rating-angular-radio-names,rating-react-error-height
<fieldset class="hw-field hw-rating" data-hw="rating" aria-describedby="error-rating-error" aria-invalid="true">
  <legend class="hw-label">قيّم هذه الخدمة<span class="hw-required-marker" aria-hidden="true"> *</span></legend>
  <label><input type="radio" name="error-rating" value="1" aria-label="1 من 5" required><span aria-hidden="true">★</span></label>
  <label><input type="radio" name="error-rating" value="2" aria-label="2 من 5" required><span aria-hidden="true">★</span></label>
  <label><input type="radio" name="error-rating" value="3" aria-label="3 من 5" required><span aria-hidden="true">★</span></label>
  <label><input type="radio" name="error-rating" value="4" aria-label="4 من 5" required><span aria-hidden="true">★</span></label>
  <label><input type="radio" name="error-rating" value="5" aria-label="5 من 5" required><span aria-hidden="true">★</span></label>
  <p class="hw-error" id="error-rating-error">اختر تقييمًا قبل إرسال النموذج.</p>
</fieldset>
```

```tsx live example=error
<Rating label="قيّم هذه الخدمة" name="error-rating" required getRatingLabel={(value, max) => value + ' من ' + max} error="اختر تقييمًا قبل إرسال النموذج." />
```

```vue live example=error
<Rating label="قيّم هذه الخدمة" name="error-rating" required :get-rating-label="(value, max) => value + ' من ' + max" error="اختر تقييمًا قبل إرسال النموذج." />
```

```ts live example=error framework=angular
template: `<hw-rating label="قيّم هذه الخدمة" name="error-rating" [required]="true" [getRatingLabel]="(value, max) => value + ' من ' + max" error="اختر تقييمًا قبل إرسال النموذج." />`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createRating

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `onValueChange` | `(value: number) => void` | `false` | — |

تهيّئ الدالة `createRating` عنصر `fieldset` بالصنف `hw-rating` يحتوي على أزرار اختيار أصلية قيمها أعداد صحيحة بترتيب تصاعدي، كلٌّ منها في عنصر `label` مع نجمة زخرفية؛ وتجري التهيئة نفسها للعنصر الذي يحمل `data-hw="rating"` عبر الدالة `enhance()`. ويعمل التقييم القابل للتعديل دون برنامج نصي، لأن أزرار الاختيار تتولّى القيمة والتحقق الذي تفرضه `required` وإعادة التعيين. ويضيف المتحكم سلوك القراءة فقط، الذي لا تملكه أزرار الاختيار في HTML: فمع الخاصية `data-hw-readonly="true"` يمنع التغيير، ويُبقي التركيز وإرسال القيمة المحدَّدة. ويُرجع `value`، وهو الرقم المحدَّد، و`destroy()`، ويتلقّى `onValueChange` القيمة الجديدة. وتُبلغ إعادة التعيين بالقيمة مرة واحدة إذا غيّرتها. وليس لخيار vanilla قيمة افتراضية منشورة. اكتب اسم كل زر اختيار في الخاصية `aria-label`، وأبقِ عناصر `label` متجاورة دون عكس ترتيبها للنص المكتوب من اليمين إلى اليسار. والدرجة التي ليست عنصر إدخال هي ترميز `hw-rating-display` في المثال الثاني، مع `hw-rating-stars` و`hw-rating-star` و`hw-rating-fill` و`hw-rating-score`، ولا تحتاج إلى متحكم.

### React

جدول: خصائص Rating وRatingDisplay

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `value` | `number` | `false` | — |
| `defaultValue` | `number` | `false` | `0` |
| `onValueChange` | `(value: number) => void` | `false` | — |
| `max` | `number` | `false` | `5` |
| `name` | `string` | `false` | — |
| `form` | `string` | `false` | — |
| `required` | `boolean` | `false` | — |
| `readOnly` | `boolean` | `false` | — |
| `getRatingLabel` | `(value: number, max: number) => string` | `true` | — |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |
| `RatingDisplay value` | `number` | `false` | `0` |
| `RatingDisplay max` | `number` | `false` | `5` |
| `RatingDisplay showValue` | `boolean` | `false` | `true` |
| `RatingDisplay getValueLabel` | `(value: number, max: number) => string` | `true` | — |

يقبل Rating خصائص عنصر `fieldset` الأصلي إلى جانب الخصائص الواردة في الجدول. مرّر `value` مع `onValueChange` لتقييم متحكَّم فيه، أو `defaultValue` لتقييم غير متحكَّم فيه؛ والقيمة عدد صحيح، ويُقرَّب الكسر إلى العدد الصحيح الأدنى. والخاصية `getRatingLabel` مطلوبة، وتُرجع الاسم الميسّر الكامل لكل زر اختيار من قيمته ومن `max`. وتُبقي الخاصية `readOnly` أزرار الاختيار قابلة للتركيز، وتضبط عليها `aria-disabled`، وتمنع المؤشر ومفاتيح التحديد. و`RatingDisplay` مكوّن مستقل: الخاصية `getValueLabel` فيه مطلوبة وتُرجع البديل النصي الكامل، وتُخفي الخاصية `showValue` بالقيمة `false` الدرجة الظاهرة وحدها، وليس له `label`.

### Vue

جدول: خصائص Rating وRatingDisplay وأحداثهما ومنافذهما

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `defaultValue` | prop | `number` | `false` | `0` |
| `max` | prop | `number` | `false` | `5` |
| `getRatingLabel` | prop | `(value: number, max: number) => string` | `true` | — |
| `modelValue` | prop | `number` | `false` | — |
| `min` | prop | `number` | `false` | `0` |
| `step` | prop | `number` | `false` | `1` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: number) => void` | `false` | — |
| `RatingDisplay value` | prop | `number` | `false` | `0` |
| `RatingDisplay max` | prop | `number` | `false` | `5` |
| `RatingDisplay showValue` | prop | `boolean` | `false` | `true` |
| `RatingDisplay getValueLabel` | prop | `(value: number, max: number) => string` | `false` | — |

يربط `v-model` العدد الصحيح، وتضبط الخاصية `defaultValue` القيمة الأولية لتقييم غير متحكَّم فيه. ويطبّق الإصدار المنشور من Rating القيمة `0` على `defaultValue` والقيمة `5` على `max`؛ والخاصيتان `min` و`step` مصرَّح بهما، ولكن الإصدار لا يقرؤهما. والخاصية `getRatingLabel` مطلوبة، وتُرجع الاسم الميسّر الكامل لكل زر اختيار. وتُبقي الخاصية `readonly` أزرار الاختيار قابلة للتركيز، وتضبط عليها `aria-disabled`، وتمنع المؤشر ومفاتيح التحديد؛ وتعطّل الخاصية `disabled` المجموعة. وتُكتب خصائص HTML الأخرى، مثل `name` و`form`، على عنصر `fieldset`. و`RatingDisplay` مكوّن مستقل: تُقرأ خاصيته `getValueLabel` عندما لا يحمل العنصر `aria-label` ولا `aria-labelledby`، وتُخفي الخاصية `showValue` بالقيمة `false` الدرجة الظاهرة وحدها. ولا يعرّف التصريح المنشور نوع أي منفذ، ولا يقرأ الإصدار المنشور أي منفذ.

### Angular

جدول: مُدخلات hw-rating وhw-rating-display ومخرجاتهما ومحتواهما

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
| `value` | input | `number` | `false` | `0` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `max` | input | `number` | `false` | `5` |
| `getRatingLabel` | input | `(value: number, max: number) => string` | `true` | — |
| `valueChange` | output | `number` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `hw-rating-display value` | input | `number` | `false` | `0` |
| `hw-rating-display max` | input | `number` | `false` | `5` |
| `hw-rating-display showValue` | input | `boolean` | `false` | `true` |
| `hw-rating-display getValueLabel` | input | `(value: number, max: number) => string` | `true` | — |

يعرض `HwRatingComponent` (`hw-rating`) مجموعة أزرار الاختيار وعنوانها والنص الإرشادي والخطأ. اربط `[(value)]` ربطًا ثنائي الاتجاه بالعدد الصحيح؛ ويعمل المكوّن أيضًا عنصرَ تحكم في النموذج عبر موصّل القيمة الخاص به. والمُدخل `getRatingLabel` مطلوب، ويُرجع الاسم الميسّر الكامل لكل زر اختيار. ويُبقي المُدخل `readOnly` أزرار الاختيار قابلة للتركيز ويمنع التغيير، دون تعطيل المجموعة. و`HwRatingDisplayComponent` (`hw-rating-display`) مكوّن مستقل: المُدخل `getValueLabel` فيه مطلوب ويُرجع البديل النصي الكامل، ويُخفي المُدخل `showValue` بالقيمة `false` الدرجة الظاهرة وحدها.

## إمكانية الوصول

التقييم مجموعة أزرار اختيار أصلية داخل عنصر `fieldset`: يسمّي العنوانُ المجموعة، ولكل زر اختيار اسمه الخاص من `getRatingLabel`، ويوفّر المتصفح ترتيب التركيز والتحديد وقيمة النموذج. وتُخفى رموز النجوم عن التقنيات المساعدة، فتكون أسماء أزرار الاختيار هي النص الوحيد الذي يسمعه مستخدم قارئ الشاشة عن النجوم؛ وتكتب Angular كل اسم نصًّا مخفيًا بصريًا داخل عنصر `label` بدلًا من `aria-label`.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: تقييم

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز إلى المجموعة على النجمة المحدَّدة، أو على النجمة الأولى إذا لم تُحدَّد أي نجمة، وينقله إلى خارج المجموعة. |
| <kbd>السهم الأيسر</kbd>، <kbd>السهم الأيمن</kbd>، <kbd>السهم السفلي</kbd>، <kbd>السهم العلوي</kbd> | ينقل التركيز والتحديد إلى النجمة التالية أو السابقة في ترتيب القراءة، ويعود من أحد الطرفين إلى الطرف الآخر، كما في مجموعة أزرار الاختيار الأصلية. |
| <kbd>Space</kbd> | يحدّد النجمة التي عليها التركيز إذا لم تكن محدَّدة. |

- يُبقي التقييم المخصّص للقراءة فقط أزرار اختياره قابلة للتركيز، ويمنع مفاتيح الأسهم والمفتاح Space؛ ويبقى سلوك Tab وShift مع Tab أصليًا.
- يعرض المرور بالمؤشر على نجمة، في جهاز يدعم المرور بالمؤشر، معاينةً للنجوم حتى تلك النجمة؛ ولا تغيّر المعاينة بيانات النموذج، ولا تُرسل حدث تغيير.
- RatingDisplay صورة واحدة لها بديل نصي واحد. وتُخفى نجومه ودرجته الظاهرة عن التقنيات المساعدة، ولا يضيف موضع تركيز.
- تعيد إعادة تعيين النموذج القيمة الافتراضية.

## الاتجاه والتوطين

ليس في Rating وRatingDisplay نص مدمج: يكتب التطبيق العنوان والنص الإرشادي والخطأ ونص كل نجمة بلغة الصفحة. وتمتلئ النجوم من بداية السطر، أيًّا كانت اللغة، فيبقى ترتيب أزرار الاختيار في الترميز واحدًا في اتجاهَي القراءة كليهما.

- لا تعكس ترتيب العناصر للنص المكتوب من اليمين إلى اليسار؛ فالاتجاه الموروث هو الذي يضعها في مواضعها.
- قيم أزرار الاختيار أرقام لاتينية؛ واكتب أرقام الأسماء الميسّرة بنظام الأرقام المستخدم في الصفحة.
- تُرجع `getRatingLabel` و`getValueLabel` النص كاملًا، فيتحكم التطبيق في ترتيب القيمة والحد الأقصى في كل لغة.
- يأخذ Rating حدًّا أقصى من 1 إلى 20، وتُحصر القيمة بين 0 والحد الأقصى؛ وتصبح القيمة غير المنتهية 0.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط التقييم بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات التقييم](../nic-rating.md) حجم النجمة، والمسافة بين النجوم، ولونَي النجمة الفارغة والممتلئة، والانتقالات، الواردة في ورقة أنماط كود المنصات المزوَّدة، وتذكر درجة الثقة في كل ربط؛ وتسجّل الملاحظات أن البرنامج النصي المزوَّد لا يتضمّن تنفيذًا للتقييم.
- تذكر ملاحظات التقييم أيضًا أن الملفات المزوَّدة لا تحدّد خطوات الاختيار ولا تجميع الدرجات في الخادم ولا الإرسال، فيبقى Rating مجموعة أزرار اختيار أصلية، ويبقى RatingDisplay غير تفاعلي.
