---
source:
  summary: 19203031ece8
  example: eb66e2378967
  variants-and-states: fecec46d3423
  api: 2d738c75ae6f
  accessibility: 99b5c9d72387
  rtl-and-localisation: f6a1f01b0a54
  platforms-code-reference: 98629843943a
---
# رفع ملف

يعرض مكوّن رفع الملف عنصر إدخال ملف أصليًا داخل حقل، مع تسمية ظاهرة، ومع نص إرشادي ورسالة خطأ عندما يوفّرهما التطبيق. ولا يتيح إلا اختيار ملفات محلية؛ فالنقل والتحقق في الخادم والتقدّم من مسؤولية التطبيق، ويعرض FileUploadList حالة كل ملف كما يبلّغ عنها التطبيق.

## مثال

للحقل تسمية ظاهرة تبيّن المستند المطلوب. ويذكر النص الإرشادي الأنواع المقبولة والحد الأقصى للحجم، ويرتبط بعنصر الإدخال. واختيار الملف لا يرسله.

```html live example=basic static differences=file-upload-adapter-labelledby
<div class="hw-field hw-upload">
  <label class="hw-label" for="basic-document" id="basic-document-label">المستند الداعم</label>
  <input class="hw-input" id="basic-document" name="document" type="file" accept=".pdf,.jpg,.png" aria-describedby="basic-document-hint">
  <p class="hw-hint" id="basic-document-hint">أرفق ملفًا بصيغة PDF أو JPG أو PNG لا يزيد حجمه على 2 ميغابايت.</p>
</div>
```

```tsx live example=basic
<FileUpload label="المستند الداعم" name="document" accept=".pdf,.jpg,.png" hint="أرفق ملفًا بصيغة PDF أو JPG أو PNG لا يزيد حجمه على 2 ميغابايت." />
```

```vue live example=basic
<FileUpload label="المستند الداعم" name="document" accept=".pdf,.jpg,.png" hint="أرفق ملفًا بصيغة PDF أو JPG أو PNG لا يزيد حجمه على 2 ميغابايت." />
```

```ts live example=basic framework=angular
template: `<hw-file-upload label="المستند الداعم" name="document" accept=".pdf,.jpg,.png" hint="أرفق ملفًا بصيغة PDF أو JPG أو PNG لا يزيد حجمه على 2 ميغابايت." />`
```

## الأشكال والحالات

### حقل مطلوب

يعرض الحقل المطلوب علامة واحدة بعد تسميته، ويحتفظ بالخاصية الأصلية `required`، فيطبّق المتصفح تحققه الخاص من قيود الإدخال عند الإرسال.

```html live example=required static differences=file-upload-adapter-labelledby
<div class="hw-field hw-upload">
  <label class="hw-label" for="required-document" id="required-document-label">وثيقة إثبات الهوية<span class="hw-required-marker" aria-hidden="true"> *</span></label>
  <input class="hw-input" id="required-document" name="identity" type="file" required>
</div>
```

```tsx live example=required
<FileUpload label="وثيقة إثبات الهوية" name="identity" required />
```

```vue live example=required
<FileUpload label="وثيقة إثبات الهوية" name="identity" required />
```

```ts live example=required framework=angular
template: `<hw-file-upload label="وثيقة إثبات الهوية" name="identity" [required]="true" />`
```

### حقل فيه خطأ

يظهر الخطأ في فقرة بعد عنصر الإدخال، ويحمل عنصر الإدخال الخاصية `aria-invalid="true"`، وتصفه الرسالة. وتذكر الرسالة ما الخطأ وكيف يُصحَّح.

```html live example=error static differences=file-upload-adapter-labelledby
<div class="hw-field hw-upload">
  <label class="hw-label" for="error-document" id="error-document-label">المستند الداعم</label>
  <input class="hw-input" id="error-document" name="document" type="file" aria-invalid="true" aria-describedby="error-document-error">
  <p class="hw-error" id="error-document-error">أرفق المستند الداعم قبل تقديم الطلب.</p>
</div>
```

```tsx live example=error
<FileUpload label="المستند الداعم" name="document" error="أرفق المستند الداعم قبل تقديم الطلب." />
```

```vue live example=error
<FileUpload label="المستند الداعم" name="document" error="أرفق المستند الداعم قبل تقديم الطلب." />
```

```ts live example=error framework=angular
template: `<hw-file-upload label="المستند الداعم" name="document" error="أرفق المستند الداعم قبل تقديم الطلب." />`
```

### حقل معطَّل

يستخدم الحقل المعطَّل الخاصية الأصلية `disabled`.

```html live example=disabled static differences=file-upload-adapter-labelledby
<div class="hw-field hw-upload">
  <label class="hw-label" for="disabled-document" id="disabled-document-label">المستند الداعم</label>
  <input class="hw-input" id="disabled-document" name="document" type="file" disabled>
</div>
```

```tsx live example=disabled
<FileUpload label="المستند الداعم" name="document" disabled />
```

```vue live example=disabled
<FileUpload label="المستند الداعم" name="document" disabled />
```

```ts live example=disabled framework=angular
template: `<hw-file-upload label="المستند الداعم" name="document" [disabled]="true" />`
```

### قائمة الملفات

يعرض FileUploadList صفًّا واحدًا لكل بند يمرّره التطبيق: الاسم والحالة. ويُخفى بصريًا نص الحالة في الصف المحدَّد أو المكتمل الذي ليس له `message`، ويعرض الصف المكتمل علامة صح بدلًا منه؛ ويبقى ذلك النص متاحًا للتقنيات المساعدة. وتبقى `message` ونص الحالة في صف الخطأ وتقدّم الملف الجاري رفعه ظاهرةً تحت الاسم. وللصف الذي حالته الرفع الجاري شريط تقدّم أيضًا، له اسم ميسّر خاص به. وتوضع القائمة بعد عنصر الإدخال داخل الحقل. ولا ترفع القائمة الملفات ولا تزيلها. ويتولّى التطبيق البنود، ويحدّث حالتها، ويزيل البند عندما تطلب القائمة ذلك؛ ويحدّث أيضًا الملفات المحدَّدة لديه وقائمة الملفات الأصلية في عنصر الإدخال عندما تدخل تلك الملفات في إرسال النموذج، لأن إزالة الصف لا تزيل الملف من عنصر الإدخال.

تتبع أزرار الإزالة إحدى قاعدتين. ففي React وفي متحكم vanilla يكون للصف زر إزالة ما دام التطبيق يمرّر `onRemove`. وفي Vue وAngular يكون للصف زر إزالة عند ضبط `removable`، سواء رُبط معالج أم لم يُربط، ويحمل الحدث `remove` معرّف البند؛ وتربط أمثلة Vue وAngular أدناه معالجًا له. ولا تفعل معالجات الأمثلة شيئًا: يكتب التطبيق المعالج الذي يزيل البند.

للبند الحقول `id` و`name` و`status`، وقيمة `status` هي `selected` أو `uploading` أو `complete` أو `error`، وله اختياريًا الحقل `message` الذي يحلّ محلّ نص الحالة، والحقل `progress`، وهو رقم من 0 إلى 100 للملف الجاري رفعه، والحقل `removable`، وتُكتب قيمته false لترك صف واحد دون زر إزالة. ويأتي نص كل حالة، والنص `remove`، والدالتان `getProgressLabel` و`getRemoveLabel`، اللتان تُرجعان الاسمين الميسّرين لشريط التقدّم ولزر الإزالة لملف واحد، من `labels`، وهي مطلوبة. وترسم ورقة الأنماط زر الإزالة أيقونةَ إلغاء، وتخفي النص `remove`، فيُسمّى الزر بما تُرجعه `getRemoveLabel`. وليس في المكوّن نص مدمج.

```html live example=list static differences=file-upload-adapter-labelledby
<div class="hw-field hw-upload">
  <label class="hw-label" for="list-documents" id="list-documents-label">المستندات الداعمة</label>
  <input class="hw-input" id="list-documents" name="documents" type="file" multiple>
  <ul class="hw-upload-list">
    <li class="hw-upload-item" data-status="complete"><span class="hw-upload-name">بطاقة الهوية.pdf</span><span class="hw-upload-status" role="status">تم الإرسال</span><button type="button" class="hw-button" data-variant="subtle" aria-label="إزالة بطاقة الهوية.pdf">إزالة</button></li>
    <li class="hw-upload-item" data-status="selected"><span class="hw-upload-name">إثبات العنوان.pdf</span><span class="hw-upload-status" role="status">جاهز للإرسال</span><button type="button" class="hw-button" data-variant="subtle" aria-label="إزالة إثبات العنوان.pdf">إزالة</button></li>
    <li class="hw-upload-item" data-status="error" data-message="true"><span class="hw-upload-name">الصورة الشخصية.jpg</span><span class="hw-upload-status" role="status">حجم الملف أكبر من 2 ميغابايت.</span><button type="button" class="hw-button" data-variant="subtle" aria-label="إزالة الصورة الشخصية.jpg">إزالة</button></li>
  </ul>
</div>
```

```tsx live example=list
<FileUpload label="المستندات الداعمة" name="documents" multiple>
  <FileUploadList
    items={[
      { id: 'a', name: 'بطاقة الهوية.pdf', status: 'complete' },
      { id: 'b', name: 'إثبات العنوان.pdf', status: 'selected' },
      { id: 'c', name: 'الصورة الشخصية.jpg', status: 'error', message: 'حجم الملف أكبر من 2 ميغابايت.' },
    ]}
    labels={{
      selected: 'جاهز للإرسال',
      uploading: 'جارٍ الإرسال',
      complete: 'تم الإرسال',
      error: 'لم يُرسَل',
      remove: 'إزالة',
      getProgressLabel: name => `تقدّم رفع ${name}`,
      getRemoveLabel: name => `إزالة ${name}`,
    }}
    onRemove={() => undefined}
  />
</FileUpload>
```

```vue live example=list
<FileUpload label="المستندات الداعمة" name="documents" multiple>
  <FileUploadList
    :items="[
      { id: 'a', name: 'بطاقة الهوية.pdf', status: 'complete' },
      { id: 'b', name: 'إثبات العنوان.pdf', status: 'selected' },
      { id: 'c', name: 'الصورة الشخصية.jpg', status: 'error', message: 'حجم الملف أكبر من 2 ميغابايت.' },
    ]"
    :labels="{
      selected: 'جاهز للإرسال',
      uploading: 'جارٍ الإرسال',
      complete: 'تم الإرسال',
      error: 'لم يُرسَل',
      remove: 'إزالة',
      getProgressLabel: (name: string) => `تقدّم رفع ${name}`,
      getRemoveLabel: (name: string) => `إزالة ${name}`,
    }"
    removable
    @remove="() => undefined"
  />
</FileUpload>
```

```ts live example=list framework=angular
import { Component } from '@angular/core';
import { HwFileUploadComponent, HwFileUploadListComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-list-example',
  imports: [HwFileUploadComponent, HwFileUploadListComponent],
  template: `<hw-file-upload label="المستندات الداعمة" name="documents" [multiple]="true">
    <hw-file-upload-list [items]="items" [labels]="labels" [removable]="true" (remove)="null" />
  </hw-file-upload>`,
})
export class ListExample {
  items = [
    { id: 'a', name: 'بطاقة الهوية.pdf', status: 'complete' as const },
    { id: 'b', name: 'إثبات العنوان.pdf', status: 'selected' as const },
    { id: 'c', name: 'الصورة الشخصية.jpg', status: 'error' as const, message: 'حجم الملف أكبر من 2 ميغابايت.' },
  ];
  labels = {
    selected: 'جاهز للإرسال',
    uploading: 'جارٍ الإرسال',
    complete: 'تم الإرسال',
    error: 'لم يُرسَل',
    remove: 'إزالة',
    getProgressLabel: (name: string) => `تقدّم رفع ${name}`,
    getRemoveLabel: (name: string) => `إزالة ${name}`,
  };
}
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-upload وخيارات createFileUploadList

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-upload'` | `true` | — |
| `data-state` | `'dragging' \| 'error'` | `false` | — |
| `createFileUploadList items` | `readonly FileUploadItem[]` | `true` | — |
| `createFileUploadList labels` | `FileUploadLabels` | `true` | — |
| `createFileUploadList disabled` | `boolean` | `false` | — |
| `createFileUploadList onRemove` | `(id: string) => void` | `false` | — |

الحقل ترميز: اكتب عنصرًا بالصنفين `hw-field` و`hw-upload` يضمّ عنصر `label` بالصنف `hw-label` تشير خاصيته `for` إلى عنصر الإدخال، وعنصر `input` أصليًا يحمل `type="file"`، وعند الحاجة فقرةً بالصنف `hw-hint` أو `hw-error` بعد عنصر الإدخال. واربط الفقرة بعنصر الإدخال عبر الخاصية `aria-describedby`؛ فلا يربطهما أي برنامج نصي. وتهيّئ الخصائص الأصلية `accept` و`multiple` و`name` و`form` و`required` و`disabled` عنصر الإدخال. وتأخذ الخاصية `data-state` القيمة `dragging` أو `error`: ترسم القيمة `dragging` إطارًا باللون الأساسي وخلفية، وترسم القيمة `error` إطارًا بلون الخطر فقط. وللحقل غير الصالح اكتب الخاصية `aria-invalid="true"` على عنصر الإدخال مع رسالة `hw-error` الظاهرة.

تعرض الدالة `createFileUploadList` القائمة. وتأخذ في `root` العنصر الذي سيحتويها، وهو عنصر خاص بها يلي عنصر الإدخال، لا الحقل نفسه، لأنها تضع عنصر `ul` بالصنف `hw-upload-list` مكان كل أبناء الجذر، وتُرجع `update` و`setDisabled` و`destroy`. فتعرض `update(items)` مصفوفة جديدة من البنود، وتعطّل `setDisabled` أزرار الإزالة، وتعيد `destroy` الأبناء الأصليين للجذر. ويعرض مثال html لقائمة الملفات القائمة بعد عرضها، مكتوبة يدويًا داخل الحقل للمقارنة؛ ولا تفعل أزرار الإزالة فيه شيئًا، لأن المثال لا يحتوي على برنامج نصي. والخيار `labels` مطلوب، ويضمّ كل نص القائمة، كما يصفه القسم «قائمة الملفات» تحت «الأشكال والحالات». ولا يُعرض زر إزالة لبند إلا عند تمرير `onRemove`؛ ويستدعي الزر `onRemove` بمعرّف البند ولا يزيل الصف، فيحدّث التطبيق القائمة.

### React

جدول: خصائص FileUpload وFileUploadList

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `onFilesChange` | `(files: File[]) => void` | `false` | — |
| `children` | `ReactNode` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |
| `FileUploadList items` | `readonly FileUploadItem[]` | `true` | — |
| `FileUploadList labels` | `FileUploadLabels` | `true` | — |
| `FileUploadList disabled` | `boolean` | `false` | — |
| `FileUploadList onRemove` | `(id: string) => void` | `false` | — |

يقبل FileUpload أيضًا خصائص عنصر الإدخال الأصلي، ومنها `name` و`accept` و`multiple` و`required` و`disabled` و`onChange` و`ref`، وتصل إلى عنصر إدخال الملف. وتتلقّى `onFilesChange` الملفات المحدَّدة مصفوفةً في كل مرة يتغيّر فيها التحديد، وتبلّغ إعادة الضبط الأصلية للنموذج عن مصفوفة فارغة مرة واحدة إذا كان المكوّن يحتفظ بملفات. وتُعرض `children` بعد عنصر الإدخال وقبل النص الإرشادي؛ فمرّر فيها `FileUploadList` لسرد الملفات. والتسمية والنص الإرشادي والخطأ محتوى React قابل للعرض؛ ويُعرض النص الإرشادي والخطأ فقرتين بعد عنصر الإدخال ويرتبطان به، وتضبط الخاصية `error` غير الفارغة `aria-invalid`. ويعرض الحقل المطلوب ذو التسمية الظاهرة علامة واحدة.

يأخذ FileUploadList الخاصيتين `items` و`labels`، وكلتاهما مطلوبة، والخاصية `disabled`. ولا يعرض زر إزالة لبند إلا ما دامت `onRemove` مُمرَّرة، وتتلقّى `onRemove` معرّف البند؛ ويزيل التطبيق البند بنفسه. ولزر الإزالة الصنف `hw-button`، وليس للبند الذي قيمة `removable` فيه false زر إزالة.

### Vue

جدول: خصائص FileUpload وFileUploadList وأحداثهما ومنافذهما

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:files` | event | `(files: File[]) => void` | `false` | — |
| `default` | slot | — | `false` | — |
| `FileUploadList items` | prop | `readonly FileUploadItem[]` | `true` | — |
| `FileUploadList labels` | prop | `FileUploadLabels` | `true` | — |
| `FileUploadList disabled` | prop | `boolean` | `false` | `false` |
| `FileUploadList removable` | prop | `boolean` | `false` | `false` |
| `FileUploadList remove` | event | `(id: string) => void` | `false` | — |

يُرسل FileUpload الحدث `update:files` مع الملفات المحدَّدة في كل مرة يتغيّر فيها التحديد، ولا تبلّغ إعادة الضبط الأصلية عن مصفوفة فارغة إلا إذا كانت هناك ملفات محدَّدة. وتصل خصائص HTML الأخرى، مثل `name` و`accept` و`multiple` و`disabled`، إلى عنصر إدخال الملف الأصلي. ويُعرض المنفذ `default` بعد عنصر الإدخال وقبل النص الإرشادي؛ فضع فيه `FileUploadList`. والخصائص `label` و`hint` و`error` سلاسل نصية؛ ويُعرض النص الإرشادي والخطأ فقرتين بعد عنصر الإدخال ويرتبطان به، وتضبط الخاصية `error` غير الفارغة `aria-invalid`. ويسرد الجدول المنفذ `default` لأن الإصدار المنشور يقرؤه؛ ولا يعرّف التصريح نوع أي منفذ.

يأخذ FileUploadList الخاصيتين `items` و`labels`، وكلتاهما مطلوبة. وتعرض الخاصية `removable` زر إزالة في كل بند ليست قيمة `removable` فيه false، ويحمل الحدث `remove` معرّف البند؛ ويزيل التطبيق البند بنفسه. وتعطّل الخاصية `disabled` أزرار الإزالة.

### Angular

جدول: مُدخلات hw-file-upload وhw-file-upload-list ومخرجاتهما ومحتواهما

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
| `value` | input | `readonly File[]` | `false` | `[]` |
| `accept` | input | `string` | `false` | `''` |
| `multiple` | input | `boolean` | `false` | `false` |
| `capture` | input | `'user' \| 'environment' \| ''` | `false` | `''` |
| `valueChange` | output | `readonly File[]` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `*` | content | — | `false` | — |
| `hw-file-upload-list items` | input | `readonly FileUploadItem[]` | `false` | `[]` |
| `hw-file-upload-list labels` | input | `FileUploadLabels` | `true` | — |
| `hw-file-upload-list disabled` | input | `boolean` | `false` | `false` |
| `hw-file-upload-list removable` | input | `boolean` | `false` | `false` |
| `hw-file-upload-list remove` | output | `string` | `false` | — |

يعرض `HwFileUploadComponent` (`hw-file-upload`) الحقل والتسمية وعنصر إدخال الملف الأصلي والمحتوى المُسقَط والنص الإرشادي والخطأ. ويُرسل المُخرج `valueChange` الملفات المحدَّدة مصفوفةً للقراءة فقط، ويعمل المكوّن أيضًا عنصرَ تحكم في النموذج عبر موصّل القيمة الخاص به. ولا تسمح المتصفحات لبرنامج نصي بملء عنصر إدخال الملف، فيستطيع النموذج مسح التحديد ولا يستطيع ملأه، وتُفرغ إعادة الضبط الأصلية التحديد وتُرسل مصفوفة فارغة مرة واحدة إذا كان المكوّن يحتفظ بملفات. ولا تُكتب الخاصية `accept` على عنصر الإدخال دون قيمة. ويُسقَط محتوى العنصر بعد عنصر الإدخال؛ فضع فيه `hw-file-upload-list`. ويحتاج الحقل إلى `label`، أو إلى `aria-label` أو `aria-labelledby` مكتوبة على `hw-file-upload`، أو إلى تسمية عنصر `hw-field` يحيط به؛ وتُمرَّر هذه الخصائص إلى عنصر الإدخال وتُزال من العنصر المضيف. ويضبط `controlId` معرّف عنصر الإدخال.

يأخذ `HwFileUploadListComponent` (`hw-file-upload-list`) المُدخل `items` والمُدخل المطلوب `labels` والمُدخل `disabled`. وعند ضبط `removable` يكون لكل بند ليست قيمة `removable` فيه false زر إزالة، ويُرسل المُخرج `remove` معرّف البند ليطلب من التطبيق إزالته؛ ولا يزيل المُخرج شيئًا بنفسه.

## إمكانية الوصول

عنصر إدخال الملف عنصر أصلي، فيوفّر المتصفح دوره وسلوك التركيز عليه ونافذة اختيار الملفات واسم الملف المختار. والتسمية عنصر `label` أصلي تشير خاصيته `for` إلى عنصر الإدخال، فيكون نص التسمية هو الاسم الميسّر، ويفتح النقر عليها نافذة الاختيار. ويرتبط النص الإرشادي والخطأ بعنصر الإدخال وصفًا له.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: رفع ملف

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز إلى عنصر إدخال الملف، ثم إلى زر الإزالة التالي في القائمة أو إلى عنصر التحكم التالي في الصفحة. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | ينقل التركيز إلى زر الإزالة السابق أو إلى عنصر التحكم السابق في الصفحة. |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | يفتح نافذة اختيار الملفات في المتصفح عندما يكون التركيز على عنصر إدخال الملف، ويفعّل زر الإزالة عندما يكون التركيز عليه. |

- لا يزيد اختيار الملف على تحديده. ويوفّر التطبيق نص حالة كل ملف في القائمة، ويقع كل نص حالة في عنصر يحمل `role="status"`. ويعيد متحكم vanilla بناء كل الصفوف عند استدعاء `update`، فتصل الحالة المتغيّرة فيه عنصرًا جديدًا؛ وتحتفظ React وVue وAngular بالصفوف بحسب المعرّف.
- شريط التقدّم للملف الجاري رفعه عنصر `progress` أصلي تسمّيه `getProgressLabel`، وتسمّي `getRemoveLabel` زر الإزالة، فيذكر كل منهما ملفه.
- زر الإزالة في الصف عنصر `button` أصلي يحمل `type="button"`. ويحدّث التطبيق القائمة بعد الإزالة، ويضع التركيز بنفسه.
- تُضبط الخاصية `aria-invalid="true"` عندما يمرّر التطبيق قيمة غير فارغة لـ`error`. ولا يفحص مكوّن رفع الملف نوع الملف ولا حجمه؛ فالخاصية `accept` توجيه لنافذة اختيار الملفات في المتصفح، ويتحقق التطبيق من الملف.
- تُخفى علامة الحقل المطلوب عن التقنيات المساعدة؛ وتعبّر الخاصية الأصلية `required` عن أن الحقل مطلوب.
- عنصر الإدخال المعطَّل لا يقبل التركيز ولا يفتح نافذة الاختيار. ولا تصل `disabled` الخاصة بـFileUpload إلى القائمة: تتبع أزرار الإزالة `disabled` الخاصة بـFileUploadList، أو `setDisabled` في متحكم vanilla.

## الاتجاه والتوطين

ليس في مكوّن رفع الملف نص مدمج: يكتب التطبيق التسمية والنص الإرشادي والخطأ وكلمات الحالة ونص الإزالة واسمَي شريط التقدّم وزر الإزالة بلغة الصفحة. أما نص زر الاختيار والنص الذي يعرضه المتصفح عندما لا يُختار أي ملف أو تُختار عدة ملفات فهما من المتصفح نفسه، ويتبعان لغة المتصفح؛ واسم الملف المختار هو اسم ملف المستخدم. ويرث العنصر لغة الصفحة واتجاهها، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية، فتتبع التسمية والفقرات وكل صف من القائمة اتجاه القراءة.

- اسم الملف بيانات، ويحتفظ بنظام كتابته. وتقع الحالة في سطر مستقل تحت الاسم. ولا يعزل أي محوّل اتجاه الاسم، فيأخذ الاسم المكتوب بنظام الكتابة الآخر اتجاه الصفحة، وقد تعيد خوارزمية الاتجاه الثنائي للنص ترتيب علامات الترقيم فيه.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط مكوّن رفع الملف بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تُدرج [ملاحظات التغطية](../coverage.md) مكوّن رفع الملف ضمن عناصر التحكم الأولى، وتُدرج نوع الإدخال file اختيارًا لملفات محلية، عبر FileUpload أو FileDropzone.
- تصف [ملاحظات حالات رفع الملفات](../file-upload-states.md) حالة كل ملف في القائمة وتقدّمه وإزالته، وتذكر أن هذا العرض لا يغيّر نافذة الاختيار الأصلية.
