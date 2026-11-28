---
source:
  summary: 4949377cce05
  example: ed9b99477fac
  variants-and-states: a2dbb5f30f77
  api: 96da018eca6c
  accessibility: 05fced9260a7
  rtl-and-localisation: 8e63b3ef867f
  platforms-code-reference: f61e8426b9a2
---
# اختيار متعدد

الاختيار المتعدد مجموعة ذات تسمية من مربعات الاختيار الأصلية مع حقل تصفية، لاختيار عدة قيم من قائمة. وتُخفي التصفية الخيارات دون أن تزيل القيم المحدَّدة من قبل، وتُرسَل كل قيمة محدَّدة مع النموذج.

## مثال

للمجموعة تسمية ظاهرة تبيّن المعلومة المطلوبة، ولحقل التصفية تسمية ظاهرة خاصة به. ويصفّي القارئ القائمة بالكتابة، ويحدّد الخيارات التي تنطبق عليه؛ وليس في المكوّن نص خاص به، فيوفّر التطبيق تسمية حقل التصفية ورسالة النتائج، وتقبل محوّلات React وVue وAngular أيضًا الرسالة التي تعرضها القائمة عندما لا يطابق أي خيار.

```html live example=basic static differences=multi-select-adapter-markup
<fieldset class="hw-field hw-multi-select" data-hw="multi-select" data-hw-results-message="{count} نتيجة">
  <legend class="hw-label">المستندات المراد إرفاقها</legend>
  <label class="hw-label" for="basic-search">تصفية المستندات</label>
  <input class="hw-input" id="basic-search" type="search" data-hw-multiselect-search>
  <div class="hw-multi-select-options">
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="birth">وثيقة الميلاد</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="residence">وثيقة الإقامة</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="employment">خطاب تعريف بالعمل</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="tax" disabled>الكشف الضريبي</label>
  </div>
  <span class="hw-sr-only" data-hw-status></span>
</fieldset>
```

```tsx live example=basic
<MultiSelect
  label="المستندات المراد إرفاقها"
  name="documents"
  searchLabel="تصفية المستندات"
  emptyMessage="لا يوجد مستند مطابق."
  options={[{ value: 'birth', label: 'وثيقة الميلاد' }, { value: 'residence', label: 'وثيقة الإقامة' }, { value: 'employment', label: 'خطاب تعريف بالعمل' }, { value: 'tax', label: 'الكشف الضريبي', disabled: true }]}
  getResultsMessage={(count) => count + ' نتيجة'}
/>
```

```vue live example=basic
<MultiSelect
  label="المستندات المراد إرفاقها"
  name="documents"
  search-label="تصفية المستندات"
  empty-message="لا يوجد مستند مطابق."
  :options="[{ value: 'birth', label: 'وثيقة الميلاد' }, { value: 'residence', label: 'وثيقة الإقامة' }, { value: 'employment', label: 'خطاب تعريف بالعمل' }, { value: 'tax', label: 'الكشف الضريبي', disabled: true }]"
  :get-results-message="(count) => count + ' نتيجة'"
/>
```

```ts live example=basic framework=angular
import { Component } from '@angular/core';
import { HwMultiSelectComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwMultiSelectComponent],
  template: `
    <hw-multi-select
      label="المستندات المراد إرفاقها"
      name="documents"
      searchLabel="تصفية المستندات"
      emptyMessage="لا يوجد مستند مطابق."
      [options]="options"
      [getResultsMessage]="resultsMessage"
    />
  `,
})
export class ExampleComponent {
  readonly options = [
    { value: 'birth', label: 'وثيقة الميلاد' },
    { value: 'residence', label: 'وثيقة الإقامة' },
    { value: 'employment', label: 'خطاب تعريف بالعمل' },
    { value: 'tax', label: 'الكشف الضريبي', disabled: true },
  ];
  readonly resultsMessage = (count: number) => count + ' نتيجة';
}
```

## الأشكال والحالات

### القيم المحدَّدة والنص الإرشادي

تضبط `defaultValue` التحديد الأولي لمجموعة غير متحكَّم فيها في React وVue، وتضبطه `value` في Angular. ويذكر النص الإرشادي الاختيار الذي يجريه القارئ، وتعرض الدالة الاختيارية `getSelectedMessage` عدد الخيارات المحدَّدة في فقرة بعد القائمة.

```html live example=selected static differences=multi-select-adapter-markup
<fieldset class="hw-field hw-multi-select" data-hw="multi-select" data-hw-results-message="{count} نتيجة" data-hw-selected-message="{count} محدَّد" aria-describedby="selected-hint">
  <legend class="hw-label">المستندات المراد إرفاقها</legend>
  <label class="hw-label" for="selected-search">تصفية المستندات</label>
  <input class="hw-input" id="selected-search" type="search" data-hw-multiselect-search aria-describedby="selected-hint">
  <div class="hw-multi-select-options">
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="birth" checked>وثيقة الميلاد</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="residence">وثيقة الإقامة</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="employment" checked>خطاب تعريف بالعمل</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="tax" disabled>الكشف الضريبي</label>
  </div>
  <span class="hw-sr-only" data-hw-status></span>
  <p role="status" data-hw-selected-status></p>
  <p class="hw-hint" id="selected-hint">اختر كل مستند سترفقه بالطلب.</p>
</fieldset>
```

```tsx live example=selected
<MultiSelect
  label="المستندات المراد إرفاقها"
  name="documents"
  searchLabel="تصفية المستندات"
  emptyMessage="لا يوجد مستند مطابق."
  options={[{ value: 'birth', label: 'وثيقة الميلاد' }, { value: 'residence', label: 'وثيقة الإقامة' }, { value: 'employment', label: 'خطاب تعريف بالعمل' }, { value: 'tax', label: 'الكشف الضريبي', disabled: true }]}
  getResultsMessage={(count) => count + ' نتيجة'}
  hint="اختر كل مستند سترفقه بالطلب."
  defaultValue={['birth', 'employment']}
  getSelectedMessage={(count) => count + ' محدَّد'}
/>
```

```vue live example=selected
<MultiSelect
  label="المستندات المراد إرفاقها"
  name="documents"
  search-label="تصفية المستندات"
  empty-message="لا يوجد مستند مطابق."
  :options="[{ value: 'birth', label: 'وثيقة الميلاد' }, { value: 'residence', label: 'وثيقة الإقامة' }, { value: 'employment', label: 'خطاب تعريف بالعمل' }, { value: 'tax', label: 'الكشف الضريبي', disabled: true }]"
  :get-results-message="(count) => count + ' نتيجة'"
  hint="اختر كل مستند سترفقه بالطلب."
  :default-value="['birth', 'employment']"
  :get-selected-message="(count) => count + ' محدَّد'"
/>
```

```ts live example=selected framework=angular
import { Component } from '@angular/core';
import { HwMultiSelectComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwMultiSelectComponent],
  template: `
    <hw-multi-select
      label="المستندات المراد إرفاقها"
      name="documents"
      searchLabel="تصفية المستندات"
      emptyMessage="لا يوجد مستند مطابق."
      [options]="options"
      [getResultsMessage]="resultsMessage"
      hint="اختر كل مستند سترفقه بالطلب."
      [value]="['birth', 'employment']"
      [getSelectedMessage]="selectedMessage"
    />
  `,
})
export class ExampleComponent {
  readonly options = [
    { value: 'birth', label: 'وثيقة الميلاد' },
    { value: 'residence', label: 'وثيقة الإقامة' },
    { value: 'employment', label: 'خطاب تعريف بالعمل' },
    { value: 'tax', label: 'الكشف الضريبي', disabled: true },
  ];
  readonly resultsMessage = (count: number) => count + ' نتيجة';
  readonly selectedMessage = (count: number) => count + ' محدَّد';
}
```

### الخطأ

يظهر الخطأ في فقرة في آخر المجموعة، داخل عنصر `fieldset`، ويحمل عنصر `fieldset` وعنصر إدخال التصفية الخاصية `aria-invalid="true"`. وتذكر الرسالة ما الخطأ وكيف يُصحَّح.

```html live example=error static differences=multi-select-adapter-markup
<fieldset class="hw-field hw-multi-select" data-hw="multi-select" data-hw-results-message="{count} نتيجة" aria-invalid="true" aria-describedby="error-error">
  <legend class="hw-label">المستندات المراد إرفاقها</legend>
  <label class="hw-label" for="error-search">تصفية المستندات</label>
  <input class="hw-input" id="error-search" type="search" data-hw-multiselect-search aria-describedby="error-error" aria-invalid="true">
  <div class="hw-multi-select-options">
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="birth">وثيقة الميلاد</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="residence">وثيقة الإقامة</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="employment">خطاب تعريف بالعمل</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="tax" disabled>الكشف الضريبي</label>
  </div>
  <span class="hw-sr-only" data-hw-status></span>
  <p class="hw-error" id="error-error">اختر مستندًا واحدًا على الأقل.</p>
</fieldset>
```

```tsx live example=error
<MultiSelect
  label="المستندات المراد إرفاقها"
  name="documents"
  searchLabel="تصفية المستندات"
  emptyMessage="لا يوجد مستند مطابق."
  options={[{ value: 'birth', label: 'وثيقة الميلاد' }, { value: 'residence', label: 'وثيقة الإقامة' }, { value: 'employment', label: 'خطاب تعريف بالعمل' }, { value: 'tax', label: 'الكشف الضريبي', disabled: true }]}
  getResultsMessage={(count) => count + ' نتيجة'}
  error="اختر مستندًا واحدًا على الأقل."
/>
```

```vue live example=error
<MultiSelect
  label="المستندات المراد إرفاقها"
  name="documents"
  search-label="تصفية المستندات"
  empty-message="لا يوجد مستند مطابق."
  :options="[{ value: 'birth', label: 'وثيقة الميلاد' }, { value: 'residence', label: 'وثيقة الإقامة' }, { value: 'employment', label: 'خطاب تعريف بالعمل' }, { value: 'tax', label: 'الكشف الضريبي', disabled: true }]"
  :get-results-message="(count) => count + ' نتيجة'"
  error="اختر مستندًا واحدًا على الأقل."
/>
```

```ts live example=error framework=angular
import { Component } from '@angular/core';
import { HwMultiSelectComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwMultiSelectComponent],
  template: `
    <hw-multi-select
      label="المستندات المراد إرفاقها"
      name="documents"
      searchLabel="تصفية المستندات"
      emptyMessage="لا يوجد مستند مطابق."
      [options]="options"
      [getResultsMessage]="resultsMessage"
      error="اختر مستندًا واحدًا على الأقل."
    />
  `,
})
export class ExampleComponent {
  readonly options = [
    { value: 'birth', label: 'وثيقة الميلاد' },
    { value: 'residence', label: 'وثيقة الإقامة' },
    { value: 'employment', label: 'خطاب تعريف بالعمل' },
    { value: 'tax', label: 'الكشف الضريبي', disabled: true },
  ];
  readonly resultsMessage = (count: number) => count + ' نتيجة';
}
```

### للقراءة فقط

في المجموعة المخصّصة للقراءة فقط تبقى مربعات الاختيار متاحة وقابلة للتركيز، وتحمل `aria-disabled="true"`، وتتجاهل التفعيل بالمؤشر وبلوحة المفاتيح. ويُرسَل التحديد الحالي، وتبقى التصفية تعمل.

```html live example=readonly static differences=multi-select-adapter-markup
<fieldset class="hw-field hw-multi-select" data-hw="multi-select" data-hw-results-message="{count} نتيجة" data-hw-readonly="true">
  <legend class="hw-label">المستندات المراد إرفاقها</legend>
  <label class="hw-label" for="readonly-search">تصفية المستندات</label>
  <input class="hw-input" id="readonly-search" type="search" data-hw-multiselect-search>
  <div class="hw-multi-select-options">
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="birth" aria-disabled="true">وثيقة الميلاد</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="residence" checked aria-disabled="true">وثيقة الإقامة</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="employment" aria-disabled="true">خطاب تعريف بالعمل</label>
    <label class="hw-choice" data-hw-option><input class="hw-checkbox" type="checkbox" name="documents" value="tax" disabled aria-disabled="true">الكشف الضريبي</label>
  </div>
  <span class="hw-sr-only" data-hw-status></span>
</fieldset>
```

```tsx live example=readonly
<MultiSelect
  label="المستندات المراد إرفاقها"
  name="documents"
  searchLabel="تصفية المستندات"
  emptyMessage="لا يوجد مستند مطابق."
  options={[{ value: 'birth', label: 'وثيقة الميلاد' }, { value: 'residence', label: 'وثيقة الإقامة' }, { value: 'employment', label: 'خطاب تعريف بالعمل' }, { value: 'tax', label: 'الكشف الضريبي', disabled: true }]}
  getResultsMessage={(count) => count + ' نتيجة'}
  defaultValue={['residence']}
  readOnly
/>
```

```vue live example=readonly
<MultiSelect
  label="المستندات المراد إرفاقها"
  name="documents"
  search-label="تصفية المستندات"
  empty-message="لا يوجد مستند مطابق."
  :options="[{ value: 'birth', label: 'وثيقة الميلاد' }, { value: 'residence', label: 'وثيقة الإقامة' }, { value: 'employment', label: 'خطاب تعريف بالعمل' }, { value: 'tax', label: 'الكشف الضريبي', disabled: true }]"
  :get-results-message="(count) => count + ' نتيجة'"
  :default-value="['residence']"
  readonly
/>
```

```ts live example=readonly framework=angular
import { Component } from '@angular/core';
import { HwMultiSelectComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwMultiSelectComponent],
  template: `
    <hw-multi-select
      label="المستندات المراد إرفاقها"
      name="documents"
      searchLabel="تصفية المستندات"
      emptyMessage="لا يوجد مستند مطابق."
      [options]="options"
      [getResultsMessage]="resultsMessage"
      [value]="['residence']"
      [readOnly]="true"
    />
  `,
})
export class ExampleComponent {
  readonly options = [
    { value: 'birth', label: 'وثيقة الميلاد' },
    { value: 'residence', label: 'وثيقة الإقامة' },
    { value: 'employment', label: 'خطاب تعريف بالعمل' },
    { value: 'tax', label: 'الكشف الضريبي', disabled: true },
  ];
  readonly resultsMessage = (count: number) => count + ' نتيجة';
}
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createMultiSelect

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `required` | `boolean` | `false` | — |
| `onValueChange` | `(values: string[]) => void` | `false` | — |
| `requiredMessage` | `string` | `false` | — |
| `getResultsMessage` | `(count: number) => string` | `false` | — |
| `getSelectedMessage` | `(count: number) => string` | `false` | — |

تهيّئ الدالة `createMultiSelect(root, options)` عنصر `fieldset` بالصنف `hw-multi-select`، وتفعل الدالة `enhance()` ذلك للعنصر الذي يحمل `data-hw="multi-select"`. والترميز هو الواجهة البرمجية: اكتب عنصر إدخال للبحث يحمل `data-hw-multiselect-search`، واكتب داخل عنصر `div` بالصنف `hw-multi-select-options` عنصر `label` بالصنف `hw-choice` يحمل `data-hw-option` لكل خيار، وفيه مربع اختيار أصلي بالصنف `hw-checkbox` مع `name` و`value` الخاصين به. ويسمّي عنصر `legend` المجموعة، ولعنصر إدخال التصفية عنصر `label` ظاهر خاص به. و`getResultsMessage` نص مطلوب، يُمرَّر خيارًا أو في الخاصية `data-hw-results-message`، ويحلّ فيه الرمز النائب {count} محل عدد الخيارات المعروضة؛ وينشئ المتحكم منطقة الحالة غير المقاطِعة إذا لم تُكتب، ولا يكتب العدد إلا بعد أن يصفّي القارئ. و`getSelectedMessage` اختيارية، وتملأ العنصر الذي يحمل `data-hw-selected-status`، انطلاقًا من الخاصية `data-hw-selected-message`. ويمكن تمرير `required` و`requiredMessage` خيارين؛ ويقرأ الجذر أيضًا `data-hw-required` و`data-hw-readonly`. وتتلقى `onValueChange` مصفوفة القيم المحدَّدة، ويُرسَل الحدث `hw:change` على الجذر بالتغيير نفسه. ويحتوي الكائن المُرجَع على `value` و`destroy`. وليس لترميز vanilla في الإصدار 0.3.0 رسالة للقائمة الفارغة، وتحمل مربعات الاختيار نفسها `name` حقل النموذج.

### React

جدول: خصائص MultiSelect

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `options` | `readonly Option[]` | `true` | — |
| `value` | `readonly string[]` | `false` | — |
| `defaultValue` | `readonly string[]` | `false` | `[]` |
| `onValueChange` | `(value: string[]) => void` | `false` | — |
| `name` | `string` | `false` | — |
| `form` | `string` | `false` | — |
| `readOnly` | `boolean` | `false` | — |
| `searchLabel` | `string` | `true` | — |
| `placeholder` | `string` | `false` | — |
| `emptyMessage` | `string` | `true` | — |
| `getResultsMessage` | `(count: number) => string` | `true` | — |
| `getSelectedMessage` | `(count: number) => string` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `required` | `boolean` | `false` | — |
| `requiredMessage` | `string` | `false` | — |

الخصائص `options` و`searchLabel` و`emptyMessage` و`getResultsMessage` مطلوبة، لأن المكوّن لا يحتوي على كلمات خاصة به. والخاصية `searchLabel` هي التسمية الظاهرة لعنصر إدخال التصفية، وليست نصًّا نائبًا، وتملأ `getResultsMessage` منطقة حالة غير مقاطِعة تبقى فارغة حتى يصفّي القارئ. وتجعل `value` مع `onValueChange` المجموعة متحكَّمًا فيها، وتتركها `defaultValue` غير متحكَّم فيها؛ وكلتاهما مصفوفة من السلاسل النصية، وتُتجاهل القيمة غير المعروفة أو المعطَّلة في العرض والإرسال دون إعادة كتابة حالة التطبيق. وتُعرض `label` عنصرَ `legend`؛ ودونها سمِّ المجموعة بالخاصية `aria-label` أو `aria-labelledby`. وتُكتب `name` على عنصر إدخال مخفي لكل قيمة محدَّدة، فتُرسَل التحديدات التي أخفتها التصفية أيضًا؛ وتربطها `form` بنموذج في موضع آخر. وتُبقي `readOnly` مربعات الاختيار قابلة للتركيز ومُرسَلة. وتحتاج `required` إلى `requiredMessage`، وإلى نص إرشادي يشرح الحد الأدنى للتحديد، لأن هذا القيد غير ظاهر. وتعرض `getSelectedMessage` فقرة حالة ظاهرة.

### Vue

جدول: خصائص MultiSelect وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `options` | prop | `readonly Option[]` | `true` | — |
| `searchLabel` | prop | `string` | `true` | — |
| `emptyMessage` | prop | `string` | `true` | — |
| `getResultsMessage` | prop | `(count: number) => string` | `true` | — |
| `getSelectedMessage` | prop | `(count: number) => string` | `false` | — |
| `requiredMessage` | prop | `string` | `false` | — |
| `modelValue` | prop | `readonly string[]` | `false` | — |
| `defaultValue` | prop | `readonly string[]` | `false` | — |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: readonly string[]) => void` | `false` | — |

يربط `v-model` مصفوفة القيم المحدَّدة، وتضبط الخاصية `defaultValue` التحديد الأولي لمجموعة غير متحكَّم فيها. والخصائص `options` و`searchLabel` و`emptyMessage` و`getResultsMessage` مطلوبة. وتُعرض `emptyMessage` نصًّا إرشاديًا بين الخيارات عندما لا يطابق أي خيار، وتملأ `getResultsMessage` منطقة حالة غير مقاطِعة تبقى فارغة حتى يصفّي القارئ. وتعرض `getSelectedMessage` فقرة الحالة الظاهرة. والخاصيتان `disabled` و`readonly` منطقيتان: تبقى مربعات الاختيار المخصّصة للقراءة فقط قابلة للتركيز، وتحمل `aria-disabled="true"`. وتحتاج `required` إلى `requiredMessage`؛ واشرح الحد الأدنى للتحديد في `hint`. وتصل الخصائص الأخرى، مثل `name`، إلى المكوّن، وتُكتب `name` على عناصر إدخال مخفية متكرّرة للقيم المحدَّدة. ولا يسرد الجدول أي منفذ لأن الإصدار المنشور لا يقرأ أي منفذ.

### Angular

جدول: مُدخلات hw-multi-select ومخرجاته ومحتواه

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
| `value` | input | `string[]` | `false` | `[]` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `options` | input | `readonly Option[]` | `false` | `[]` |
| `searchLabel` | input | `string` | `true` | — |
| `placeholder` | input | `string` | `false` | `''` |
| `emptyMessage` | input | `string` | `true` | — |
| `getSelectedMessage` | input | `(count: number) => string` | `false` | — |
| `getResultsMessage` | input | `(count: number) => string` | `true` | — |
| `requiredMessage` | input | `string` | `false` | `''` |
| `valueChange` | output | `string[]` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |

يعرض `HwMultiSelectComponent` (`hw-multi-select`) عنصر `fieldset` وعنصر `legend` وحقل التصفية ومربعات الاختيار والحالة وعناصر الإدخال المخفية والنص الإرشادي والخطأ، ويعمل عنصرَ تحكم في النموذج عبر موصّل القيمة الخاص به، وقيمته من النوع `string[]`. والمُدخلات `searchLabel` و`emptyMessage` و`getResultsMessage` مطلوبة؛ وتوجد الحالة فارغةً منذ العرض الأول. و`getSelectedMessage` اختياري، ولا تُعرض الفقرة التي فيها عدد المحدَّد إلا معه. و`requiredMessage` مطلوب مع `required`. ويُربط مُدخل الدالة بمتغيّر عضو في مكوّن التطبيق. ويُرسل `valueChange` المصفوفة الجديدة. ويُرسَل `focused` و`blurred` عندما يدخل التركيز عنصر `fieldset` وعندما يغادره؛ ولا يُرسَل شيء عند الانتقال بين خيارين. وتسمّي `aria-label` و`aria-labelledby` المجموعة عندما لا يُمرَّر `label`. وتبقى القيم المحدَّدة في بيانات النموذج عندما تُخفي التصفية مربعات اختيارها.

## إمكانية الوصول

الاختيار المتعدد عنصر `fieldset` أصلي يسمّي عنصر `legend` فيه المجموعة، وفيه مربعات اختيار أصلية، فيوفّر المتصفح أدوار عناصر التحكم فيه وسلوك التركيز عليها والتعامل معها من لوحة المفاتيح. وليس اختيارًا قابلًا للبحث، ولا يفتح نافذة منبثقة. ولعنصر إدخال التصفية عنصر `label` ظاهر خاص به، ومناطق الحالة مناطق حية غير مقاطِعة.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: اختيار متعدد

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd>، <kbd>Shift</kbd> + <kbd>Tab</kbd> | ينقل التركيز إلى عنصر التحكم التالي أو السابق في المجموعة: عنصر إدخال التصفية، ثم كل مربع اختيار ظاهر متاح. |
| <kbd>Space</kbd> | يبدّل حالة مربع الاختيار الذي عليه التركيز، إلا إذا كانت المجموعة مخصّصة للقراءة فقط. |

- تُخفي التصفية الخيارات غير المطابقة، وتعلن عدد الخيارات المعروضة بالدالة `getResultsMessage`؛ ويبقى الإعلان فارغًا حتى يصفّي القارئ. ويتجاهل البحث حالة الأحرف وعلامات التشكيل العربية وصور الألف.
- يبقى الخيار المحدَّد الذي تُخفيه التصفية محدَّدًا، ويُرسَل مع النموذج.
- يحتاج التحديد المطلوب إلى خيار محدَّد واحد على الأقل، معروف ومتاح، ولا يكفي له نص البحث. والتحقق المخصّص من الصلاحية لعنصر إدخال التصفية، الذي يعرض `aria-required`؛ ولا تحمل مربعات الاختيار الخاصية الأصلية `required`. ويعرض عنصر `legend` علامة واحدة للمجموعة المطلوبة، والعلامة مخفية عن التقنيات المساعدة، فاشرح الحد الأدنى في النص الإرشادي الظاهر.
- بعد إرسال فاشل يحمل عنصر إدخال التصفية والمجموعة الخاصية `aria-invalid="true"` حتى يُجرى تحديد صالح أو يُعاد تعيين النموذج.
- لا يحدّد القارئ الخيارات المعطَّلة، ولا تفي أبدًا بالتحديد المطلوب، ولا تُرسَل.
- تُبقي المجموعة المخصّصة للقراءة فقط مربعات اختيارها متاحة وقابلة للتركيز مع `aria-disabled="true"`؛ ولا يغيّر التفعيل بالمؤشر وبالمفتاح <kbd>Space</kbd> شيئًا، وتبقى التصفية تعمل، ويُرسَل التحديد الحالي.
- تعيد إعادة تعيين النموذج التحديد الأولي، وتُفرغ حقل التصفية والحالة، وتُرسل إشعارًا واحدًا عندما يتغيّر التحديد.

## الاتجاه والتوطين

ليس في الاختيار المتعدد نص مدمج: يكتب التطبيق عنصر `legend` وتسمية حقل التصفية والنص النائب و`emptyMessage` و`getResultsMessage` و`getSelectedMessage` و`requiredMessage` بلغة الصفحة. وتتبع المجموعة اتجاه الصفحة، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية.

- يتجاهل البحث حالة الأحرف وعلامات التشكيل العربية وصور الألف، فيطابق الاستعلام المكتوب دونها؛ ولا تتغيّر التسميات ولا القيم المُرسَلة.
- قيمة الخيار `value` قيمة مخصّصة للمعالجة الآلية ولا تُترجم، أما `label` فهو النص الذي يراه القارئ ويبحث فيه.
- اكتب رسائل العدد بلغة الصفحة، وضع العدد في الموضع الذي تقتضيه قواعد اللغة، ومن ذلك الرمز النائب {count} في خصائص vanilla.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط الاختيار المتعدد بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- يُدرج الاختيار المتعدد ضمن عناصر التحكم الإضافية في نطاق المكوّنات في [ملاحظات التغطية](../coverage.md).
- قواعد التحديد والتحقق، والتحديد المطلوب الذي لا يكفي له نص البحث، والقيم التي تبقى في أثناء التصفية، وسلوك القراءة فقط، هي واجهة النماذج الخاصة بهوية الواردة في [ملاحظة التحديد](../multiselect-validation.md). وتذكر الملاحظة أن أدلة الأنماط المزوَّدة من كود المنصات لا تثبت سلوك التحقق الأصلي.
- تستخدم صفوف مربعات الاختيار عنصر `label` بالصنف `hw-choice` الذي تصفه [ملاحظات عناصر الاختيار](../nic-choices.md)، مع سلوك مربع الاختيار المخصّص للقراءة فقط المسجَّل فيها: يبقى عنصر الاختيار المخصّص للقراءة فقط قابلًا للتركيز ويُرسل قيمته، وتوقف آلية حماية تفعيله.
