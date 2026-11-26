---
source:
  summary: f14f81fc3c44
  example: 2772c73459d0
  variants-and-states: 8abfa8d281e7
  api: 1b3628564601
  accessibility: 850e18eb042f
  rtl-and-localisation: 4cca3331732c
  platforms-code-reference: 4b9ed1b741b9
---
# إفلات الملفات

مكوّن إفلات الملفات حقل لاختيار ملفات محلية بنافذة اختيار الملفات الأصلية أو بإفلاتها على الحقل. ويُبلغ عن الملفات المحدَّدة، ويرفض الدفعة التي لا تستوفي قيود النوع أو الحجم أو العدد، ولا يرفع أي ملف.

## مثال

لمنطقة الإفلات تسمية ظاهرة تسمّي الحقل، وتعليمات ظاهرة تبيّن للقارئ ما يختاره أو يُفلته. فالتسمية تسمّي عنصر إدخال الملفات، والتعليمات تصفه. ويذكر النص الإرشادي الملفات التي يتوقعها التطبيق.

```html live example=basic static differences=file-dropzone-adapter-markup
<div class="hw-field hw-file-dropzone" data-hw="file-dropzone">
  <label class="hw-label" for="basic-input">المستندات الداعمة</label>
  <p id="basic-instruction">اختر الملفات أو أفلتها هنا.</p>
  <input class="hw-input" type="file" id="basic-input" data-hw-file-input name="basic" multiple aria-describedby="basic-instruction basic-hint">
  <p class="hw-hint" id="basic-hint">أرفق المستندات التي تدعم الطلب.</p>
</div>
```

```tsx live example=basic
<FileDropzone label="المستندات الداعمة" dropLabel="اختر الملفات أو أفلتها هنا." name="basic" multiple hint="أرفق المستندات التي تدعم الطلب." />
```

```vue live example=basic
<FileDropzone label="المستندات الداعمة" drop-label="اختر الملفات أو أفلتها هنا." name="basic" multiple hint="أرفق المستندات التي تدعم الطلب." />
```

```ts live example=basic framework=angular
template: `<hw-file-dropzone label="المستندات الداعمة" dropLabel="اختر الملفات أو أفلتها هنا." name="basic" [multiple]="true" hint="أرفق المستندات التي تدعم الطلب." />`
```

## الأشكال والحالات

### الخطأ

يظهر خطأ التطبيق في آخر فقرة داخل الحقل، بعد النص الإرشادي، ويصف عنصر الإدخال، الذي يحمل الخاصية `aria-invalid`.

```html live example=error static differences=file-dropzone-adapter-markup
<div class="hw-field hw-file-dropzone" data-hw="file-dropzone" data-state="error">
  <label class="hw-label" for="error-input">المستندات الداعمة</label>
  <p id="error-instruction">اختر الملفات أو أفلتها هنا.</p>
  <input class="hw-input" type="file" id="error-input" data-hw-file-input name="error" multiple aria-invalid="true" aria-describedby="error-instruction error-hint error-error">
  <p class="hw-hint" id="error-hint">أرفق المستندات التي تدعم الطلب.</p>
  <p class="hw-error" id="error-error">أرفق مستندًا واحدًا على الأقل.</p>
</div>
```

```tsx live example=error
<FileDropzone label="المستندات الداعمة" dropLabel="اختر الملفات أو أفلتها هنا." name="error" multiple hint="أرفق المستندات التي تدعم الطلب." error="أرفق مستندًا واحدًا على الأقل." />
```

```vue live example=error
<FileDropzone label="المستندات الداعمة" drop-label="اختر الملفات أو أفلتها هنا." name="error" multiple hint="أرفق المستندات التي تدعم الطلب." error="أرفق مستندًا واحدًا على الأقل." />
```

```ts live example=error framework=angular
template: `<hw-file-dropzone label="المستندات الداعمة" dropLabel="اختر الملفات أو أفلتها هنا." name="error" [multiple]="true" hint="أرفق المستندات التي تدعم الطلب." error="أرفق مستندًا واحدًا على الأقل." />`
```

### ملف واحد

دون `multiple` يقبل عنصر الإدخال ملفًا واحدًا، وتُرفض الدفعة التي فيها أكثر من ملف رفضًا كاملًا.

```html live example=single static differences=file-dropzone-adapter-markup
<div class="hw-field hw-file-dropzone" data-hw="file-dropzone">
  <label class="hw-label" for="single-input">وثيقة إثبات الهوية</label>
  <p id="single-instruction">اختر ملفًا واحدًا أو أفلته هنا.</p>
  <input class="hw-input" type="file" id="single-input" data-hw-file-input name="single" aria-describedby="single-instruction single-hint">
  <p class="hw-hint" id="single-hint">أرفق مستندًا واحدًا.</p>
</div>
```

```tsx live example=single
<FileDropzone label="وثيقة إثبات الهوية" dropLabel="اختر ملفًا واحدًا أو أفلته هنا." name="single" hint="أرفق مستندًا واحدًا." />
```

```vue live example=single
<FileDropzone label="وثيقة إثبات الهوية" drop-label="اختر ملفًا واحدًا أو أفلته هنا." name="single" hint="أرفق مستندًا واحدًا." />
```

```ts live example=single framework=angular
template: `<hw-file-dropzone label="وثيقة إثبات الهوية" dropLabel="اختر ملفًا واحدًا أو أفلته هنا." name="single" hint="أرفق مستندًا واحدًا." />`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createFileDropzone

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `maxSize` | `number` | `false` | — |
| `onValueChange` | `(files: File[]) => void` | `false` | — |
| `onReject` | `(files: File[]) => void` | `false` | — |
| `getSelectedMessage` | `(files: readonly File[]) => string` | `false` | — |
| `getRejectedMessage` | `(rejected: readonly File[]) => string` | `false` | — |
| `unsupportedDropMessage` | `string` | `false` | — |

تنشئ `createFileDropzone(root, options)` متحكمًا لجذر بالصنفين `hw-field` و`hw-file-dropzone` يحتوي على عنصر إدخال ملفات أصلي يحمل الخاصية `data-hw-file-input`. ويتألف الترميز من عنصر `label` تشير خاصيته `for` إلى عنصر الإدخال، وفقرة تعليمات تصفه، وعنصر الإدخال، وفقرة حالة اختيارية تحمل الخاصية `data-hw-file-status`، ثم النص الإرشادي والخطأ بعدها. وتبقى `accept` و`multiple` و`disabled` خصائص أصلية لعنصر الإدخال، ويُرجع المتحكم `value`، وهي كائنات File المحدَّدة، و`destroy`. ولا تنشر الخيارات قيمًا افتراضية في الإصدار 0.3.0. ويمكن أيضًا كتابة `maxSize`، بالبايت، في الخاصية `data-hw-max-size` على الجذر. وتُرفض رفضًا كاملًا الدفعةُ التي فيها ملف من نوع آخر، أو ملف يتجاوز حدّ الحجم، أو أكثر من ملف في عنصر إدخال دون `multiple`: فيُفرَّغ عنصر الإدخال، وتُستدعى `onReject` مرة واحدة مع الملفات، ويُكتب الرفض في فقرة خطأ تحمل الخاصية `role="alert"`. وتوفّر `getRejectedMessage` هذا النص، وهي لازمة عند ضبط `accept` أو `maxSize`؛ وتحمله خاصية القالب `data-hw-rejected-message`. وتُكتب `getSelectedMessage` و`unsupportedDropMessage` في العنصر الذي يحمل `data-hw-file-status` عندما يكون موجودًا. ولا تُستدعى `onValueChange` إلا عندما تتغيّر الملفات المحفوظة.

### React

جدول: خصائص FileDropzone

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `onFilesChange` | `(files: File[]) => void` | `false` | — |
| `onReject` | `(files: File[]) => void` | `false` | — |
| `dropLabel` | `ReactNode` | `true` | — |
| `getSelectedMessage` | `(files: readonly File[]) => string` | `false` | — |
| `children` | `ReactNode` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `accept` | `string` | `false` | — |
| `maxSize` | `number` | `false` | — |
| `getRejectedMessage` | `(rejected: readonly File[]) => string` | `false` | — |

لا تُستدعى `onFilesChange` إلا عندما تتغيّر قائمة الملفات، وتُستدعى `onReject` مرة واحدة للدفعة المرفوضة. وتسمّي الخاصية `label` عنصر الإدخال، والخاصية المطلوبة `dropLabel` هي التعليمات الظاهرة التي تصفه ولا تسمّيه أبدًا. ويقبل FileDropzone خصائص عنصر الإدخال الأصلي، وتصل `name` و`multiple` و`disabled` إلى عنصر الإدخال؛ ولا تصل `readOnly` إليه خاصيةَ HTML، لكنها تُبقي عنصر الإدخال متاحًا وقابلًا للتركيز، وتضع عليه `aria-disabled="true"`، وتمنع فتح نافذة الاختيار والإفلات؛ وتضبط `accept` و`maxSize` (بالبايت) القيود، والخاصية `getRejectedMessage` مطلوبة عند ضبط أيٍّ منهما. وعند تمرير `getSelectedMessage` تُعرض فقرة حالة ظاهرة بعد عنصر الإدخال. وتُعرض `children` بعد فقرة الحالة، مثل `FileUploadList`، لأن منطقة الإفلات لا تعرض قائمة ملفات. وتحلّ `error` محلّ رسالة الرفض، وليس لها دور. وتستبدل كل دفعة التحديد السابق، وليس للمكوّن قيم افتراضية لخصائصه.

### Vue

جدول: خصائص FileDropzone وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `accept` | prop | `string` | `false` | — |
| `multiple` | prop | `boolean` | `false` | `false` |
| `maxSize` | prop | `number` | `false` | — |
| `dropLabel` | prop | `string` | `true` | — |
| `getSelectedMessage` | prop | `(files: readonly File[]) => string` | `false` | — |
| `getRejectedMessage` | prop | `(rejected: readonly File[]) => string` | `false` | — |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:files` | event | `(files: File[]) => void` | `false` | — |
| `reject` | event | `(files: File[]) => void` | `false` | — |
| `default` | slot | — | `false` | — |

لا يُرسل المكوّن الحدث `update:files` إلا عندما تتغيّر قائمة الملفات، ويتلقّى الحدث `reject` الملفات المرفوضة. وتسمّي الخاصية `label` عنصر الإدخال، والخاصية المطلوبة `dropLabel` هي التعليمات الظاهرة التي تصفه ولا تسمّيه أبدًا؛ ولا تُعرض فقرة التعليمات دونها. وتصل خاصيتا HTML `name` و`form` إلى عنصر الإدخال الأصلي، وتضبط `accept` و`multiple` و`disabled` و`required` الخصائص المقابلة لها في عنصر الإدخال؛ والقيمة الافتراضية لـ`multiple` هي `false`. ولا تصل `readonly` إلى عنصر الإدخال في صورة `readonly`: فهي تضع `aria-disabled="true"` على عنصر الإدخال و`data-hw-readonly` على الجذر، وتمنع النقر والمفتاحين Enter وSpace. والقيمة `maxSize` بالبايت، والخاصية `getRejectedMessage` مطلوبة عند ضبط `accept` أو `maxSize`. وتعرض `getSelectedMessage` فقرة حالة بعد عنصر الإدخال. ويُعرض المنفذ الافتراضي بعد فقرة الحالة؛ فضع فيه `FileUploadList`. وتحلّ `error` محلّ رسالة الرفض، وليس لها دور. ولا يُرسل المكوّن عند إعادة التعيين الحدث `update:files` بقائمة فارغة إلا إذا كانت هناك ملفات محدَّدة.

### Angular

جدول: مُدخلات hw-file-dropzone ومخرجاته ومحتواه

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
| `value` | input | `File[]` | `false` | `[]` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `accept` | input | `string` | `false` | `''` |
| `multiple` | input | `boolean` | `false` | `false` |
| `dropLabel` | input | `string` | `true` | — |
| `getSelectedMessage` | input | `(files: readonly File[]) => string` | `false` | — |
| `maxSize` | input | `number` | `false` | — |
| `capture` | input | `'user' \| 'environment' \| ''` | `false` | `''` |
| `getRejectedMessage` | input | `(rejected: readonly File[]) => string` | `false` | — |
| `valueChange` | output | `File[]` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `rejected` | output | `readonly File[]` | `false` | — |
| `*` | content | — | `false` | — |

يعرض `HwFileDropzoneComponent` (`hw-file-dropzone`) جذرًا واحدًا فيه التسمية والتعليمات وعنصر الإدخال الأصلي وفقرة الحالة والمحتوى المُسقَط والنص الإرشادي والخطأ. اربط `[(value)]` ربطًا ثنائي الاتجاه بمصفوفة من كائنات File، ويُرسلها المُخرج `valueChange`؛ ويُرسل المُخرج `rejected` الملفات المرفوضة مرة واحدة. والمُدخل `label` مطلوب ما لم تسمِّ `aria-label` أو `aria-labelledby` أو عنصر `hw-field` محيط عنصرَ الإدخال، والمُدخل `dropLabel` مطلوب. والقيمة الافتراضية لـ`accept` سلسلة نصية فارغة، ولـ`multiple` هي `false`، ولـ`capture` سلسلة نصية فارغة، ولـ`readOnly` و`disabled` هي `false`. والقيمة `maxSize` بالبايت، والمُدخل `getRejectedMessage` مطلوب عند ضبط `accept` أو `maxSize`. وعند ربط `getSelectedMessage` تُعرض فقرة حالة ظاهرة واحدة بعد عنصر الإدخال؛ ودونه لا يُعرض أي عنصر حالة. ويُعرض المحتوى المُسقَط في `*` بعد فقرة الحالة، مثل `hw-file-upload-list`. وتُفرّغ إعادة التعيين الأصلية التحديد وتزيل الرفض.

## إمكانية الوصول

عنصر الإدخال عنصر إدخال ملفات أصلي، فيوفّر المتصفح دوره وسلوك التركيز عليه ونافذة الاختيار؛ ويفتح المفتاح Enter أو Space نافذة الاختيار عندما يكون التركيز على عنصر الإدخال. وتسمّي التسمية عنصر الإدخال، وتصفه التعليمات عبر `aria-describedby`، مع النص الإرشادي والخطأ. ويُكتب الرفض في فقرة خطأ واحدة تحمل الخاصية `role="alert"`، ويحمل عنصر الإدخال `aria-invalid` إلى أن تُقبل دفعة تالية أو يُعاد التعيين. ولا يضبط الرفض صلاحية مخصّصة لعنصر الإدخال، ولا يمنع الإرسال، فيبقى الخادم مسؤولًا عن التحقق.

لا تُلغى إلا عمليات السحب التي تحمل ملفات؛ وفوق منطقة إفلات معطَّلة أو مخصّصة للقراءة فقط لا يسمح تأثير الإفلات بأي عملية، ولا يغيّر الإفلات شيئًا. وتحمل منطقة الإفلات التي يجري السحب فوقها الخاصية `data-state="dragging"`. وتُبقي منطقة الإفلات المخصّصة للقراءة فقط عنصر الإدخال متاحًا وقابلًا للتركيز، وتضع عليه `aria-disabled="true"`، وتمنع فتح نافذة الاختيار والإفلات، وتُبقي الملفات المختارة في النموذج؛ واستخدم `disabled` لاستبعاد الملفات.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: إفلات الملفات

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز إلى عنصر إدخال الملفات، ثم إلى عنصر التحكم التالي. |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | يفتح نافذة اختيار الملفات الأصلية من عنصر الإدخال الذي عليه التركيز. |

## الاتجاه والتوطين

ليس في المكوّن نص مدمج: يكتب التطبيق التسمية والتعليمات والنص الإرشادي والخطأ ورسائل التحديد والرفض بلغة الصفحة. وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية، فيتبع الحقل اتجاه القراءة. ويعرض المتصفح أسماء الملفات المختارة بلغته وصيغته.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط مكوّن إفلات الملفات بكود المنصات. وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تصف [ملاحظة حالات رفع الملفات](../file-upload-states.md) قائمة رفع الملفات التي تُركَّب مع منطقة الإفلات، وحالات بنودها، وأن التطبيق هو الذي ينفّذ عمليات النقل.
- يُدرج نوع إدخال الملفات بين أنواع الإدخال الأصلية في [ملاحظات التغطية](../coverage.md).
