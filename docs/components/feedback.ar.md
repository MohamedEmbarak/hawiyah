---
source:
  summary: 62b212dfb46d
  example: f85ae3194ebc
  variants-and-states: 310d39b9c7b0
  api: 495abc438d8a
  accessibility: 2aaecd3d436c
  rtl-and-localisation: d6c623976aaf
  platforms-code-reference: 7349273cd621
---
# تقييم الصفحة

يسأل تقييم الصفحة عمّا إذا كانت الصفحة مفيدة بخيارَي إجابة، ثم يفتح خطوة للتعليق مع زر إرسال، ويعرض رسالة تأكيد بعد أن يرسل القارئ. ويُبلغ التطبيقَ بالإجابة قيمةً فيها العلامة المنطقية `helpful` والتعليق `comment`؛ ولا يُرسَل شيء إلى أي جهة.

## مثال

يسمّي السؤالُ الظاهر المجموعةَ. وخيارا الإجابة زرّان يحملان حالة الضغط، وعندما يختار القارئ أحدهما يلي الخيارين حقلُ تعليق وزرُّ إرسال في ترتيب التنقل بالمفتاح Tab. وتظهر رسالة التأكيد في فقرة حالة بعد أن يرسل القارئ.

```html live example=basic static differences=feedback-adapter-markup
<div class="hw-feedback" data-hw="feedback" role="group" aria-labelledby="basic-question" data-hw-success-message="شكرًا لك على ملاحظاتك.">
  <p id="basic-question">هل كانت هذه الصفحة مفيدة؟</p>
  <div class="hw-feedback-actions">
    <button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="yes" aria-pressed="false"><span class="hw-icon hw-feedback-icon" data-icon="thumbs-up" aria-hidden="true"></span><span class="hw-feedback-label">نعم</span></button>
    <button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="no" aria-pressed="false"><span class="hw-icon hw-feedback-icon" data-icon="thumbs-down" aria-hidden="true"></span><span class="hw-feedback-label">لا</span></button>
  </div>
  <div data-hw-feedback-comment hidden>
    <div class="hw-field"><label class="hw-label" for="basic-comment">التعليق</label><textarea class="hw-textarea" id="basic-comment"></textarea></div>
    <button type="button" class="hw-button" data-variant="primary" data-size="md" data-hw-feedback-submit>إرسال</button>
  </div>
  <p role="status" data-hw-feedback-status></p>
</div>
```

```tsx live example=basic
<Feedback
  label="هل كانت هذه الصفحة مفيدة؟"
  yesLabel="نعم"
  noLabel="لا"
  commentLabel="التعليق"
  submitLabel="إرسال"
  successMessage="شكرًا لك على ملاحظاتك."
/>
```

```vue live example=basic
<Feedback
  label="هل كانت هذه الصفحة مفيدة؟"
  yes-label="نعم"
  no-label="لا"
  comment-label="التعليق"
  submit-label="إرسال"
  success-message="شكرًا لك على ملاحظاتك."
/>
```

```ts live example=basic framework=angular
template: `<hw-feedback
  label="هل كانت هذه الصفحة مفيدة؟"
  yesLabel="نعم"
  noLabel="لا"
  commentLabel="التعليق"
  submitLabel="إرسال"
  successMessage="شكرًا لك على ملاحظاتك."
/>`
```

## الأشكال والحالات

### الأيقونة والنص

يضبط `choiceVariant` طريقة عرض خيارَي الإجابة: تعرض القيمة `text` الكلمات، وتعرض القيمة `icon` الأيقونتين، وتعرض القيمة `icon-text` كلتيهما. وتبقى التسميات في ترميز كل خيار، فيحتفظ الخياران باسميهما في كل شكل.

```html live example=icon-text static differences=feedback-adapter-markup
<div class="hw-feedback" data-hw="feedback" role="group" aria-labelledby="icon-text-question" data-choice-variant="icon-text" data-hw-success-message="شكرًا لك على ملاحظاتك.">
  <p id="icon-text-question">هل كانت هذه الإرشادات واضحة؟</p>
  <div class="hw-feedback-actions">
    <button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="yes" aria-pressed="false"><span class="hw-icon hw-feedback-icon" data-icon="thumbs-up" aria-hidden="true"></span><span class="hw-feedback-label">نعم</span></button>
    <button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="no" aria-pressed="false"><span class="hw-icon hw-feedback-icon" data-icon="thumbs-down" aria-hidden="true"></span><span class="hw-feedback-label">لا</span></button>
  </div>
  <div data-hw-feedback-comment hidden>
    <div class="hw-field"><label class="hw-label" for="icon-text-comment">التعليق</label><textarea class="hw-textarea" id="icon-text-comment"></textarea></div>
    <button type="button" class="hw-button" data-variant="primary" data-size="md" data-hw-feedback-submit>إرسال</button>
  </div>
  <p role="status" data-hw-feedback-status></p>
</div>
```

```tsx live example=icon-text
<Feedback
  label="هل كانت هذه الإرشادات واضحة؟"
  choiceVariant="icon-text"
  yesLabel="نعم"
  noLabel="لا"
  commentLabel="التعليق"
  submitLabel="إرسال"
  successMessage="شكرًا لك على ملاحظاتك."
/>
```

```vue live example=icon-text
<Feedback
  label="هل كانت هذه الإرشادات واضحة؟"
  choice-variant="icon-text"
  yes-label="نعم"
  no-label="لا"
  comment-label="التعليق"
  submit-label="إرسال"
  success-message="شكرًا لك على ملاحظاتك."
/>
```

```ts live example=icon-text framework=angular
template: `<hw-feedback
  label="هل كانت هذه الإرشادات واضحة؟"
  choiceVariant="icon-text"
  yesLabel="نعم"
  noLabel="لا"
  commentLabel="التعليق"
  submitLabel="إرسال"
  successMessage="شكرًا لك على ملاحظاتك."
/>`
```

### مجموعة معطَّلة

تعطّل مجموعة التقييم المعطَّلة خيارَي الإجابة، وحقل التعليق وزر الإرسال عندما يظهران. استخدمها ما دام التطبيق لا يستطيع قبول إجابة. وتكتب كتلة vanilla أدناه الخاصية `disabled` على كل عنصر تحكم يدويًا؛ ويعطّل المتحكم أيضًا كل عناصر التحكم عندما يحمل الجذر `disabled` أو `aria-disabled="true"` أو `data-hw-disabled`.

```html live example=disabled static differences=feedback-adapter-markup
<div class="hw-feedback" data-hw="feedback" role="group" aria-labelledby="disabled-question" data-hw-success-message="شكرًا لك على ملاحظاتك.">
  <p id="disabled-question">هل كانت هذه الصفحة مفيدة؟</p>
  <div class="hw-feedback-actions">
    <button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="yes" aria-pressed="false" disabled><span class="hw-icon hw-feedback-icon" data-icon="thumbs-up" aria-hidden="true"></span><span class="hw-feedback-label">نعم</span></button>
    <button type="button" class="hw-button" data-variant="secondary" data-size="md" data-hw-value="no" aria-pressed="false" disabled><span class="hw-icon hw-feedback-icon" data-icon="thumbs-down" aria-hidden="true"></span><span class="hw-feedback-label">لا</span></button>
  </div>
  <div data-hw-feedback-comment hidden>
    <div class="hw-field"><label class="hw-label" for="disabled-comment">التعليق</label><textarea class="hw-textarea" id="disabled-comment" disabled></textarea></div>
    <button type="button" class="hw-button" data-variant="primary" data-size="md" data-hw-feedback-submit disabled>إرسال</button>
  </div>
  <p role="status" data-hw-feedback-status></p>
</div>
```

```tsx live example=disabled
<Feedback
  label="هل كانت هذه الصفحة مفيدة؟"
  disabled
  yesLabel="نعم"
  noLabel="لا"
  commentLabel="التعليق"
  submitLabel="إرسال"
  successMessage="شكرًا لك على ملاحظاتك."
/>
```

```vue live example=disabled
<Feedback
  label="هل كانت هذه الصفحة مفيدة؟"
  disabled
  yes-label="نعم"
  no-label="لا"
  comment-label="التعليق"
  submit-label="إرسال"
  success-message="شكرًا لك على ملاحظاتك."
/>
```

```ts live example=disabled framework=angular
template: `<hw-feedback
  label="هل كانت هذه الصفحة مفيدة؟"
  [disabled]="true"
  yesLabel="نعم"
  noLabel="لا"
  commentLabel="التعليق"
  submitLabel="إرسال"
  successMessage="شكرًا لك على ملاحظاتك."
/>`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createFeedback

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `value` | `FeedbackValue` | `false` | — |
| `onValueChange` | `(value: FeedbackValue) => void` | `false` | — |
| `onFeedback` | `(value: FeedbackValue) => void` | `false` | — |
| `successMessage` | `string` | `false` | — |

تهيّئ الدالة `createFeedback(root, options)` الترميز المكتوب: مجموعة فيها زرّان يحملان `data-hw-value` بقيمتَي الإجابتين نعم ولا، وخطوة تعليق اختيارية تحمل `data-hw-feedback-comment` وتضمّ عنصر `textarea` وزرًا يحمل `data-hw-feedback-submit`، وعنصر إدخال مخفي اختياري يحمل `data-hw-feedback-value`، وعنصر حالة يحمل `data-hw-feedback-status`. والسؤال وخيارا الإجابة وتسمية التعليق ونص الإرسال ترميز مكتوب، فلا يكون خيارًا نصيًا إلا `successMessage`؛ وهو مطلوب، ويمكن كتابته خاصيةً على الجذر. والخيار `value` من النوع `FeedbackValue`، وهو كائن فيه `helpful` (`true` أو `false` أو `null`) و`comment` (سلسلة نصية)؛ ودونه يقرأ المتحكم الحالة المكتوبة في الترميز. ويُرجع المتحكم `value` و`select(helpful)` و`setComment(comment)` و`submit()` و`destroy()`. ويتلقّى `onValueChange` القيمة كلما تغيّرت الإجابة أو التعليق، ويتلقّاها `onFeedback` عندما يرسل القارئ. وتبقى خطوة التعليق مخفية إلى أن توجد إجابة، ويعرض عنصر الحالة `successMessage` بعد الإرسال. وعندما لا تكون في الترميز خطوة تعليق، يُبلغ خيار الإجابة عن الإجابة فورًا. ويُرسل المتحكم الحدث `hw:change` على الجذر، وفي تفاصيله `value` عند التغيير، والقيمة المرسَلة تحت المفتاح feedback عند الإرسال. وفي الترميز تضبط الخاصية `data-choice-variant` على الجذر شكل خيارَي الإجابة الذي تعرفه ورقة الأنماط: `icon` أو `icon-text`.

### React

جدول: خصائص Feedback

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `value` | `FeedbackValue` | `false` | — |
| `defaultValue` | `FeedbackValue` | `false` | — |
| `onValueChange` | `(value: FeedbackValue) => void` | `false` | — |
| `onFeedback` | `(value: FeedbackValue) => void` | `false` | — |
| `yesLabel` | `string` | `true` | — |
| `noLabel` | `string` | `true` | — |
| `commentLabel` | `string` | `true` | — |
| `submitLabel` | `string` | `true` | — |
| `successMessage` | `ReactNode` | `true` | — |
| `disabled` | `boolean` | `false` | — |
| `choiceVariant` | `'text' \| 'icon' \| 'icon-text'` | `false` | `'text'` |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `ReactNode` | `false` | — |

استخدم `value` مع `onValueChange` لمجموعة متحكَّم فيها، أو `defaultValue` لمجموعة غير متحكَّم فيها؛ والقيمة الافتراضية قيمة فيها `helpful` بالقيمة `null` وتعليق فارغ، ولا يستطيع الجدول عرضها قيمةً حرفية. وتُستدعى `onValueChange` عندما تتغيّر الإجابة أو التعليق، ولا تُستدعى أبدًا للإجابة المضغوطة من قبل، وتُستدعى `onFeedback` مع القيمة عندما يضغط القارئ زر الإرسال. والخصائص `yesLabel` و`noLabel` و`commentLabel` و`submitLabel` و`successMessage` مطلوبة. والخاصية `label` هي السؤال الظاهر، وتسمّي المجموعة؛ وعند كتابة `aria-label` أو `aria-labelledby` تحلّ هذه الأسماء محلّ الإشارة إلى السؤال. وتعطّل الخاصية `disabled` خيارَي الإجابة وحقل التعليق وزر الإرسال. ولا يشارك المكوّن في إرسال النموذج، ولا يحمل اسم حقل.

### Vue

جدول: خصائص Feedback وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `choiceVariant` | prop | `'text' \| 'icon' \| 'icon-text'` | `false` | `'text'` |
| `label` | prop | `string` | `false` | — |
| `modelValue` | prop | `FeedbackValue` | `false` | — |
| `defaultValue` | prop | `FeedbackValue` | `false` | — |
| `yesLabel` | prop | `string` | `true` | — |
| `noLabel` | prop | `string` | `true` | — |
| `commentLabel` | prop | `string` | `true` | — |
| `submitLabel` | prop | `string` | `true` | — |
| `successMessage` | prop | `string` | `true` | — |
| `disabled` | prop | `boolean` | `false` | `false` |
| `update:modelValue` | event | `(value: FeedbackValue) => void` | `false` | — |
| `feedback` | event | `(value: FeedbackValue) => void` | `false` | — |
| `default` | slot | — | `false` | — |

يربط `v-model` قيمة من النوع `FeedbackValue`، وهي كائن فيه `helpful` و`comment`. وتضبط الخاصية `defaultValue` القيمة الأولية لمجموعة غير متحكَّم فيها، وقيمتها الافتراضية قيمة فيها `helpful` بالقيمة `null` وتعليق فارغ. ويحمل الحدث `feedback` القيمة عندما يرسل القارئ؛ ويُفرغ أي تغيير لاحق في الإجابة أو التعليق رسالة التأكيد. والخاصية `label` هي السؤال الظاهر، وهو فقرة تسمّي المجموعة. والخصائص `yesLabel` و`noLabel` و`commentLabel` و`submitLabel` و`successMessage` مطلوبة. ويضيف المنفذ الافتراضي محتوى بعد عنصر الحالة. وتعطّل الخاصية `disabled` كل عناصر التحكم.

### Angular

جدول: مُدخلات hw-feedback ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `choiceVariant` | input | `'text' \| 'icon' \| 'icon-text'` | `false` | `'text'` |
| `yesLabel` | input | `string` | `true` | — |
| `noLabel` | input | `string` | `true` | — |
| `commentLabel` | input | `string` | `true` | — |
| `submitLabel` | input | `string` | `true` | — |
| `successMessage` | input | `string` | `true` | — |
| `value` | input | `HwFeedbackValue` | `false` | `{ helpful: null, comment: '' }` |
| `disabled` | input | `boolean` | `false` | `false` |
| `valueChange` | output | `FeedbackValue` | `false` | — |
| `feedback` | output | `FeedbackValue` | `false` | — |
| `*` | content | — | `false` | — |

يُطبَّق `HwFeedbackComponent` على `hw-feedback`. اربط `[(value)]` ربطًا ثنائي الاتجاه بقيمة من النوع `HwFeedbackValue`، وهي كائن فيه `helpful` و`comment`؛ ويُرسَل المُخرج `valueChange` مرة واحدة لكل تغيير في الإجابة أو التعليق، ولا يُرسَل مرة أخرى للإجابة المضغوطة من قبل. ويُرسل المُخرج `feedback` القيمة عندما يرسل القارئ، ويعرض عنصر الحالة `successMessage` إلى أن تتغيّر الإجابة أو التعليق. وتحتاج المجموعة إلى `label`، أو إلى `aria-label` أو `aria-labelledby` مكتوبة على `hw-feedback`، وتحلّ هذه الأسماء حينئذٍ محلّ الإشارة إلى السؤال. والمُدخلات `yesLabel` و`noLabel` و`commentLabel` و`submitLabel` و`successMessage` مطلوبة. ويوضع المحتوى المُسقَط بعد عنصر الحالة. والمُدخل `disabled` منطقي، فيضبطه `[disabled]="true"` وتضبطه كتابة الخاصية `disabled` دون قيمة.

## إمكانية الوصول

يعرض تقييم الصفحة عنصر `div` يحمل `role="group"` ويسمّيه السؤال الظاهر، فيُقرأ السؤال عندما يدخل التركيز المجموعة. ويتلقّى التطبيق القيمة، ويقرّر ما يحفظه.

- كل خيار إجابة زر أصلي يحمل `aria-pressed`، بالقيمة `true` على الإجابة المختارة وبالقيمة `false` على الأخرى. والأيقونة في خيار الإجابة مخفية عن التقنيات المساعدة، والتسمية تمنحه اسمه.
- تُضاف خطوة التعليق أو تُظهَر بعد الإجابة الأولى. ولا ينتقل التركيز: فعناصر التحكم الجديدة تلي الإجابتين في ترتيب التنقل بالمفتاح Tab، فيصل القارئ إلى حقل التعليق وزر الإرسال بالضغط التالي على <kbd>Tab</kbd>.
- حقل التعليق عنصر `textarea` أصلي له تسمية ظاهرة، فنص التسمية هو اسمه الميسّر.
- تُكتب رسالة التأكيد في فقرة تحمل `role="status"`، تعلنها التقنيات المساعدة دون مقاطعة القارئ. وتبقى الفقرة فارغة إلى أن يرسل القارئ، ويُفرغها أي تغيير لاحق.
- يُتاح زر الإرسال ما إن توجد إجابة؛ والتعليق اختياري.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: تقييم الصفحة

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز إلى عنصر التحكم التالي بترتيب الصفحة: خيارا الإجابة، ثم حقل التعليق وزر الإرسال بعد وجود إجابة. |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | يفعّل خيار الإجابة الذي عليه التركيز أو زر الإرسال. |

لا يعرّف تقييم الصفحة مفاتيح أخرى. فخيارا الإجابة وزر الإرسال أزرار أصلية، وحقل التعليق عنصر `textarea` أصلي، فتتبع المفاتيح سلوك المتصفح؛ وداخل حقل التعليق يُدرج المفتاح <kbd>Enter</kbd> سطرًا جديدًا.

## الاتجاه والتوطين

ليس في تقييم الصفحة نص مدمج. يكتب التطبيق السؤال، وتسميتَي خيارَي الإجابة، وتسمية التعليق، ونص الإرسال، ورسالة التأكيد بلغة الصفحة، ولا يضيف المكوّن إليها شيئًا.

- ترث المجموعة اتجاه الصفحة، ويقع خيارا الإجابة في تخطيط مرن يلتفّ، فيبدآن من جهة بدء القراءة، وتليهما خطوة التعليق، في اتجاهَي القراءة كليهما.
- أيقونتا الإبهام من أيقونات الحزم، ولا اتجاه لهما، فلا تُعكسان.
- التعليق نص حر يكتبه القارئ؛ وتحتفظ به القيمة كما كُتب، بأي نظام كتابة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط تقييم الصفحة بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- يُدرج تقييم الصفحة في المجموعة Platform patterns في [ملاحظات التغطية](../coverage.md). ويتألف من الأزرار والمساحة النصية والحقل في المكتبة.
- يسجّل المكوّن واجهة واحدة في كل محوّل، ولا يرسل شيئًا إلى أي جهة، فيبقى حفظ الإجابة عملًا من أعمال تكامل التطبيق.
