---
source:
  summary: 8970067891e7
  example: feef9bf56861
  variants-and-states: 4a0492a3a18c
  api: 85df56477f68
  accessibility: 938ed2d40630
  rtl-and-localisation: d1d65b48567b
  platforms-code-reference: 000de27159db
---
# اختيار قابل للبحث

الاختيار القابل للبحث عنصر تحكم قابل للتحرير لاختيار قيمة واحدة: يكتب القارئ نصًّا يصفّي به قائمة من الخيارات ثم يثبّت أحدها، ويتلقى النموذج قيمة الخيار المثبَّت لا النص المكتوب. ويوفّر التطبيق الخيارات، وتبقى محفوظة محليًا.

## مثال

للاختيار القابل للبحث تسمية ظاهرة تبيّن المعلومة المطلوبة. ويكتب القارئ نصًّا يصفّي به الخيارات، ويتنقل بينها بمفاتيح الأسهم، ويثبّت أحدها بالمفتاح <kbd>Enter</kbd>؛ والنص المكتوب الذي لا يطابق أي خيار ليس قيمة. وليس في المكوّن نص خاص به: يوفّر التطبيق رسالة النتائج التي يعلنها المكوّن، وتقبل محوّلات React وVue وAngular أيضًا الرسالة التي تعرضها القائمة عندما لا يطابق أي خيار.

```html live example=basic static differences=combobox-adapter-markup
<div class="hw-field">
  <label class="hw-label" for="basic" id="basic-label">نوع المستند</label>
  <div class="hw-combobox" data-hw="combobox" data-hw-results-message="{count} نتيجة">
    <input class="hw-input" id="basic" type="text" data-hw-combobox-input autocomplete="off">
    <input type="hidden" name="document-type" value="" data-hw-combobox-value>
    <ul class="hw-listbox" data-hw-combobox-list aria-labelledby="basic-label" hidden>
      <li class="hw-option" id="basic-option-0" role="option" aria-selected="false" data-hw-value="birth">وثيقة الميلاد</li>
      <li class="hw-option" id="basic-option-1" role="option" aria-selected="false" data-hw-value="residence">وثيقة الإقامة</li>
      <li class="hw-option" id="basic-option-2" role="option" aria-selected="false" data-hw-value="employment">خطاب تعريف بالعمل</li>
      <li class="hw-option" id="basic-option-3" role="option" aria-selected="false" aria-disabled="true" data-hw-value="tax">الكشف الضريبي</li>
    </ul>
    <span class="hw-sr-only" data-hw-combobox-status role="status"></span>
  </div>
</div>
```

```tsx live example=basic
<Combobox
  label="نوع المستند"
  name="document-type"
  options={[{ value: 'birth', label: 'وثيقة الميلاد' }, { value: 'residence', label: 'وثيقة الإقامة' }, { value: 'employment', label: 'خطاب تعريف بالعمل' }, { value: 'tax', label: 'الكشف الضريبي', disabled: true }]}
  emptyMessage="لا يوجد نوع مستند مطابق."
  getResultsMessage={(count) => count + ' نتيجة'}
/>
```

```vue live example=basic
<Combobox
  label="نوع المستند"
  name="document-type"
  :options="[{ value: 'birth', label: 'وثيقة الميلاد' }, { value: 'residence', label: 'وثيقة الإقامة' }, { value: 'employment', label: 'خطاب تعريف بالعمل' }, { value: 'tax', label: 'الكشف الضريبي', disabled: true }]"
  empty-message="لا يوجد نوع مستند مطابق."
  :get-results-message="(count) => count + ' نتيجة'"
/>
```

```ts live example=basic framework=angular
import { Component } from '@angular/core';
import { HwComboboxComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwComboboxComponent],
  template: `
    <hw-combobox
      label="نوع المستند"
      name="document-type"
      controlId="basic"
      [options]="options"
      emptyMessage="لا يوجد نوع مستند مطابق."
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

### القيمة المحدَّدة والنص الإرشادي

تظهر القيمة المثبَّتة نصًّا في عنصر الإدخال، ويذكر النص الإرشادي ما يختاره القارئ. وتضبط `defaultValue` التحديد الأولي لاختيار غير متحكَّم فيه في React وVue، وتضبطه `value` في Angular.

```html live example=selected static differences=combobox-adapter-markup
<div class="hw-field">
  <label class="hw-label" for="selected" id="selected-label">نوع المستند</label>
  <div class="hw-combobox" data-hw="combobox" data-hw-results-message="{count} نتيجة">
    <input class="hw-input" id="selected" type="text" data-hw-combobox-input autocomplete="off" value="وثيقة الإقامة" aria-describedby="selected-hint">
    <input type="hidden" name="document-type" value="residence" data-hw-combobox-value>
    <ul class="hw-listbox" data-hw-combobox-list aria-labelledby="selected-label" hidden>
      <li class="hw-option" id="selected-option-0" role="option" aria-selected="false" data-hw-value="birth">وثيقة الميلاد</li>
      <li class="hw-option" id="selected-option-1" role="option" aria-selected="true" data-hw-value="residence">وثيقة الإقامة</li>
      <li class="hw-option" id="selected-option-2" role="option" aria-selected="false" data-hw-value="employment">خطاب تعريف بالعمل</li>
      <li class="hw-option" id="selected-option-3" role="option" aria-selected="false" aria-disabled="true" data-hw-value="tax">الكشف الضريبي</li>
    </ul>
    <span class="hw-sr-only" data-hw-combobox-status role="status"></span>
  </div>
  <p class="hw-hint" id="selected-hint">اختر المستند الذي يتعلق به الطلب.</p>
</div>
```

```tsx live example=selected
<Combobox
  label="نوع المستند"
  name="document-type"
  options={[{ value: 'birth', label: 'وثيقة الميلاد' }, { value: 'residence', label: 'وثيقة الإقامة' }, { value: 'employment', label: 'خطاب تعريف بالعمل' }, { value: 'tax', label: 'الكشف الضريبي', disabled: true }]}
  emptyMessage="لا يوجد نوع مستند مطابق."
  getResultsMessage={(count) => count + ' نتيجة'}
  hint="اختر المستند الذي يتعلق به الطلب."
  defaultValue="residence"
/>
```

```vue live example=selected
<Combobox
  label="نوع المستند"
  name="document-type"
  :options="[{ value: 'birth', label: 'وثيقة الميلاد' }, { value: 'residence', label: 'وثيقة الإقامة' }, { value: 'employment', label: 'خطاب تعريف بالعمل' }, { value: 'tax', label: 'الكشف الضريبي', disabled: true }]"
  empty-message="لا يوجد نوع مستند مطابق."
  :get-results-message="(count) => count + ' نتيجة'"
  hint="اختر المستند الذي يتعلق به الطلب."
  default-value="residence"
/>
```

```ts live example=selected framework=angular
import { Component } from '@angular/core';
import { HwComboboxComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwComboboxComponent],
  template: `
    <hw-combobox
      label="نوع المستند"
      name="document-type"
      controlId="selected"
      [options]="options"
      emptyMessage="لا يوجد نوع مستند مطابق."
      [getResultsMessage]="resultsMessage"
      hint="اختر المستند الذي يتعلق به الطلب."
      value="residence"
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

### الخطأ

يظهر الخطأ في فقرة بعد عنصر التحكم، ويحمل عنصر الإدخال الخاصية `aria-invalid="true"`، وتصفه الرسالة. وتذكر الرسالة ما الخطأ وكيف يُصحَّح.

```html live example=error static differences=combobox-adapter-markup
<div class="hw-field">
  <label class="hw-label" for="error" id="error-label">نوع المستند</label>
  <div class="hw-combobox" data-hw="combobox" data-hw-results-message="{count} نتيجة">
    <input class="hw-input" id="error" type="text" data-hw-combobox-input autocomplete="off" aria-describedby="error-error" aria-invalid="true">
    <input type="hidden" name="document-type" value="" data-hw-combobox-value>
    <ul class="hw-listbox" data-hw-combobox-list aria-labelledby="error-label" hidden>
      <li class="hw-option" id="error-option-0" role="option" aria-selected="false" data-hw-value="birth">وثيقة الميلاد</li>
      <li class="hw-option" id="error-option-1" role="option" aria-selected="false" data-hw-value="residence">وثيقة الإقامة</li>
      <li class="hw-option" id="error-option-2" role="option" aria-selected="false" data-hw-value="employment">خطاب تعريف بالعمل</li>
      <li class="hw-option" id="error-option-3" role="option" aria-selected="false" aria-disabled="true" data-hw-value="tax">الكشف الضريبي</li>
    </ul>
    <span class="hw-sr-only" data-hw-combobox-status role="status"></span>
  </div>
  <p class="hw-error" id="error-error">اختر نوع المستند من القائمة.</p>
</div>
```

```tsx live example=error
<Combobox
  label="نوع المستند"
  name="document-type"
  options={[{ value: 'birth', label: 'وثيقة الميلاد' }, { value: 'residence', label: 'وثيقة الإقامة' }, { value: 'employment', label: 'خطاب تعريف بالعمل' }, { value: 'tax', label: 'الكشف الضريبي', disabled: true }]}
  emptyMessage="لا يوجد نوع مستند مطابق."
  getResultsMessage={(count) => count + ' نتيجة'}
  error="اختر نوع المستند من القائمة."
/>
```

```vue live example=error
<Combobox
  label="نوع المستند"
  name="document-type"
  :options="[{ value: 'birth', label: 'وثيقة الميلاد' }, { value: 'residence', label: 'وثيقة الإقامة' }, { value: 'employment', label: 'خطاب تعريف بالعمل' }, { value: 'tax', label: 'الكشف الضريبي', disabled: true }]"
  empty-message="لا يوجد نوع مستند مطابق."
  :get-results-message="(count) => count + ' نتيجة'"
  error="اختر نوع المستند من القائمة."
/>
```

```ts live example=error framework=angular
import { Component } from '@angular/core';
import { HwComboboxComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwComboboxComponent],
  template: `
    <hw-combobox
      label="نوع المستند"
      name="document-type"
      controlId="error"
      [options]="options"
      emptyMessage="لا يوجد نوع مستند مطابق."
      [getResultsMessage]="resultsMessage"
      error="اختر نوع المستند من القائمة."
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

يحتفظ الاختيار المخصّص للقراءة فقط بتحديده في النموذج، ويبقى قابلًا للتركيز، لكنه لا يفتح قائمته أبدًا ولا يتغيّر.

```html live example=readonly static differences=combobox-adapter-markup
<div class="hw-field">
  <label class="hw-label" for="readonly" id="readonly-label">نوع المستند</label>
  <div class="hw-combobox" data-hw="combobox" data-hw-results-message="{count} نتيجة">
    <input class="hw-input" id="readonly" type="text" data-hw-combobox-input autocomplete="off" value="وثيقة الميلاد" readonly>
    <input type="hidden" name="document-type" value="birth" data-hw-combobox-value>
    <ul class="hw-listbox" data-hw-combobox-list aria-labelledby="readonly-label" hidden>
      <li class="hw-option" id="readonly-option-0" role="option" aria-selected="true" data-hw-value="birth">وثيقة الميلاد</li>
      <li class="hw-option" id="readonly-option-1" role="option" aria-selected="false" data-hw-value="residence">وثيقة الإقامة</li>
      <li class="hw-option" id="readonly-option-2" role="option" aria-selected="false" data-hw-value="employment">خطاب تعريف بالعمل</li>
      <li class="hw-option" id="readonly-option-3" role="option" aria-selected="false" aria-disabled="true" data-hw-value="tax">الكشف الضريبي</li>
    </ul>
    <span class="hw-sr-only" data-hw-combobox-status role="status"></span>
  </div>
</div>
```

```tsx live example=readonly
<Combobox
  label="نوع المستند"
  name="document-type"
  options={[{ value: 'birth', label: 'وثيقة الميلاد' }, { value: 'residence', label: 'وثيقة الإقامة' }, { value: 'employment', label: 'خطاب تعريف بالعمل' }, { value: 'tax', label: 'الكشف الضريبي', disabled: true }]}
  emptyMessage="لا يوجد نوع مستند مطابق."
  getResultsMessage={(count) => count + ' نتيجة'}
  defaultValue="birth"
  readOnly
/>
```

```vue live example=readonly
<Combobox
  label="نوع المستند"
  name="document-type"
  :options="[{ value: 'birth', label: 'وثيقة الميلاد' }, { value: 'residence', label: 'وثيقة الإقامة' }, { value: 'employment', label: 'خطاب تعريف بالعمل' }, { value: 'tax', label: 'الكشف الضريبي', disabled: true }]"
  empty-message="لا يوجد نوع مستند مطابق."
  :get-results-message="(count) => count + ' نتيجة'"
  default-value="birth"
  readonly
/>
```

```ts live example=readonly framework=angular
import { Component } from '@angular/core';
import { HwComboboxComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwComboboxComponent],
  template: `
    <hw-combobox
      label="نوع المستند"
      name="document-type"
      controlId="readonly"
      [options]="options"
      emptyMessage="لا يوجد نوع مستند مطابق."
      [getResultsMessage]="resultsMessage"
      value="birth"
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

جدول: خيارات createCombobox

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `value` | `string` | `false` | — |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `getResultsMessage` | `(count: number) => string` | `false` | — |
| `requiredMessage` | `string` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `onQueryChange` | `(query: string) => void` | `false` | — |

تهيّئ الدالة `createCombobox(root, options)` عنصرًا بالصنف `hw-combobox`، وتفعل الدالة `enhance()` ذلك للعنصر الذي يحمل `data-hw="combobox"`. والترميز هو الواجهة البرمجية: اكتب داخل الجذر عنصر إدخال أصليًا يحمل `data-hw-combobox-input`، وعنصر إدخال مخفيًا يحمل `data-hw-combobox-value` ويحمل `name` حقل النموذج، وعنصر `ul` يحمل `data-hw-combobox-list` ويحمل كل بند فيه قيمة `data-hw-value` فريدة غير فارغة (ولا يمكن تثبيت البند الذي يحمل `aria-disabled="true"`)، وعند الحاجة عنصر حالة يحمل `data-hw-combobox-status`. واكتب تسمية `hw-field` ونصه الإرشادي وخطأه حول الجذر لا داخله، لتُفتح القائمة مباشرة تحت عنصر الإدخال. و`getResultsMessage` نص مطلوب، يُمرَّر خيارًا أو في الخاصية `data-hw-results-message`، ويحلّ فيه الرمز النائب {count} محل عدد النتائج؛ و`requiredMessage` مطلوب عندما يحمل عنصر الإدخال `required`. وتضبط `value` التحديد الأولي. وتُستدعى `onValueChange` و`onOpenChange` و`onQueryChange` عند إجراءات القارئ، ويُرسَل الحدث `hw:change` على الجذر بالتغييرات نفسها، وفي تفاصيله القيمة الجديدة مع تسميتها، أو حالة الفتح، أو نص البحث؛ فتحقّق من احتواء التفاصيل على قيمة قبل قراءتها. وليس للمتحكم في الإصدار 0.3.0 خيار لرسالة القائمة الفارغة. ويحتوي الكائن المُرجَع على `value` و`open` و`select` و`show` و`close` و`destroy`.

### React

جدول: خصائص Combobox

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `options` | `readonly Option[]` | `true` | — |
| `value` | `string` | `false` | — |
| `defaultValue` | `string` | `false` | — |
| `onValueChange` | `(value: string, option?: Option) => void` | `false` | — |
| `onQueryChange` | `(query: string) => void` | `false` | — |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `emptyMessage` | `string` | `true` | — |
| `getResultsMessage` | `(count: number) => string` | `true` | — |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |
| `required` | `boolean` | `false` | — |
| `requiredMessage` | `string` | `false` | — |

الخاصية `options` والنصان `emptyMessage` و`getResultsMessage` مطلوبة، لأن المكوّن لا يحتوي على كلمات خاصة به. ولكل خيار `value` و`label`، و`disabled` عند الحاجة. وتجعل `value` مع `onValueChange` الاختيار متحكَّمًا فيه: طبّق القيمة التي تُبلغ عنها `onValueChange`، بما فيها السلسلة النصية الفارغة عندما يعدّل القارئ التحديد؛ وتتركه `defaultValue` غير متحكَّم فيه. وتتلقى `onQueryChange` النص المكتوب فقط، ولا تتلقى أبدًا تحديدًا ولا إعادة تعيين ولا قيمة يكتبها التطبيق. وتتحكم `open` و`defaultOpen` و`onOpenChange` في القائمة، ولا تُبلغ `onOpenChange` إلا عن إجراءات القارئ. والخصائص `label` و`hint` و`error` محتوى React قابل للعرض، وتوضع في حقل محيط؛ وتحتاج `required` إلى `requiredMessage`. وتخص `name` عنصر إدخال مخفيًا يحمل القيمة المحدَّدة. وتصل خصائص عنصر الإدخال الأصلي الأخرى، ومنها `form` و`disabled` و`readOnly` و`ref`، إلى عنصر الإدخال النصي. ودون `label` امنح عنصر الإدخال اسمًا ميسّرًا بالخاصية `aria-label` أو `aria-labelledby`.

### Vue

جدول: خصائص Combobox وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `options` | prop | `readonly Option[]` | `true` | — |
| `modelValue` | prop | `string` | `false` | — |
| `defaultValue` | prop | `string` | `false` | `''` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `open` | prop | `boolean` | `false` | — |
| `defaultOpen` | prop | `boolean` | `false` | `false` |
| `emptyMessage` | prop | `string` | `true` | — |
| `getResultsMessage` | prop | `(count: number) => string` | `true` | — |
| `requiredMessage` | prop | `string` | `false` | — |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: string) => void` | `false` | — |
| `update:open` | event | `(open: boolean) => void` | `false` | — |
| `update:query` | event | `(query: string) => void` | `false` | — |

يربط `v-model` القيمة المحدَّدة سلسلةً نصية، وتضبط الخاصية `defaultValue` القيمة الأولية لاختيار غير متحكَّم فيه. والخصائص `options` و`emptyMessage` و`getResultsMessage` مطلوبة، وتلزم `requiredMessage` عند ضبط `required`. والخاصيتان `disabled` و`readonly` منطقيتان، ولا يفتح الاختيار المخصّص للقراءة فقط أو المعطَّل قائمته أبدًا. ويربط `v-model` مع الوسيط `open` حالة القائمة (`update:open`)، وتكون `open` متحكَّمًا فيها ما دامت قيمتها ليست `undefined`؛ وتضبط `defaultOpen` الحالة الأولية. ويُرسَل الحدث `update:query` للنص المكتوب فقط. ويتيح المكوّن `show()` و`close()` عبر مرجع القالب. ولا يسرد الجدول أي منفذ لأن الإصدار المنشور لا يقرأ أي منفذ. وتُكتب `name` على عنصر إدخال مخفي يحمل القيمة المحدَّدة، وتصل الخصائص الأخرى، مثل `placeholder`، إلى عنصر الإدخال الأصلي.

### Angular

جدول: مُدخلات hw-combobox ومخرجاته ومحتواه

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
| `placeholder` | input | `string` | `false` | `''` |
| `emptyMessage` | input | `string` | `true` | — |
| `requiredMessage` | input | `string` | `false` | `''` |
| `getResultsMessage` | input | `(count: number) => string` | `true` | — |
| `open` | input | `boolean` | `false` | `false` |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `openChange` | output | `boolean` | `false` | — |
| `queryChange` | output | `string` | `false` | — |

يعرض `HwComboboxComponent` (`hw-combobox`) الحقل والتسمية وعنصر الإدخال الأصلي وعنصر الإدخال المخفي والقائمة والحالة والنص الإرشادي والخطأ، ويعمل عنصرَ تحكم في النموذج عبر موصّل القيمة الخاص به. والمُدخلان `emptyMessage` و`getResultsMessage` مطلوبان، و`requiredMessage` مطلوب مع `required`. ويُربط مُدخل الدالة، مثل `getResultsMessage`، بمتغيّر عضو في مكوّن التطبيق. ويربط `[(open)]` حالة القائمة: القيمة المكتوبة مرة واحدة هي الحالة الأولية، ويُرسَل المُخرج `openChange` عند إجراءات القارئ وعند إعادة تعيين أغلقت القائمة، ولا يُرسَل أبدًا عندما يغيّر التطبيق `open`. ويُرسل `queryChange` نص كل حدث إدخال مقبول؛ ولا يُرسله التحديد ولا إعادة التعيين ولا كتابة التطبيق، ولا يُرسَل `valueChange` إلا عندما تتغيّر القيمة المحدَّدة. وتسمّي `aria-label` و`aria-labelledby` عنصر الإدخال والقائمة. ويضبط `controlId` معرّف عنصر الإدخال، وتأخذ القائمة هذا المعرّف متبوعًا باللاحقة -listbox. ويبقى النص الإرشادي والخطأ خارج العنصر الذي يحمل الصنف `hw-combobox`، لأن موضع القائمة يُحسب بالنسبة إليه.

## إمكانية الوصول

لعنصر الإدخال الدور combobox، ويعلن قائمة اقتراحات بالخاصية `aria-autocomplete`، ويشير إلى القائمة بالخاصية `aria-controls` وإلى الخيار النشط بالخاصية `aria-activedescendant`، فيبقى التركيز في عنصر الإدخال في أثناء التنقل بين الخيارات. وتبيّن `aria-expanded` ما إذا كانت القائمة مفتوحة. والتسمية عنصر `label` أصلي تشير خاصيته `for` إلى عنصر الإدخال، وتأخذ القائمة اسمها من التسمية، أو من `aria-label` أو `aria-labelledby`. ويصف النص الإرشادي والخطأ عنصر الإدخال.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: اختيار قابل للبحث

| المفتاح | الإجراء |
| --- | --- |
| <kbd>السهم السفلي</kbd>، <kbd>السهم العلوي</kbd> | يفتح القائمة المغلقة، ثم ينقل الخيار النشط إلى الخيار المتاح التالي أو السابق؛ ويعمل المفتاحان بالطريقة نفسها في اتجاهَي القراءة كليهما. |
| <kbd>Home</kbd>، <kbd>End</kbd> | في القائمة المفتوحة، ينقل الخيار النشط إلى أول خيار متاح أو إلى آخر خيار متاح. |
| <kbd>Enter</kbd> | يثبّت الخيار النشط المتاح ويغلق القائمة. |
| <kbd>Escape</kbd> | يغلق القائمة المفتوحة دون تثبيت ودون مغادرة عنصر الإدخال. |
| <kbd>Tab</kbd> | يغلق القائمة دون تحديد، وينقل التركيز إلى العنصر التالي. |

- تفتح الكتابة القائمة، وتصفّي الخيارات، وتمحو التحديد المثبَّت؛ ولا يتلقى النموذج أي قيمة حتى يُثبَّت خيار من جديد. ولا يصبح النص الحر أبدًا قيمة مُرسَلة.
- يثبّت النقر بالمؤشر على خيار ذلك الخيار، ويعيد التركيز إلى عنصر الإدخال. ويفتح التركيز على عنصر الإدخال والنقر عليه القائمة.
- تتخطى مفاتيح الأسهم الخيارات المعطَّلة، ولا يمكن تثبيتها.
- تعلن منطقة حية عدد النتائج بالدالة `getResultsMessage` ما دامت القائمة مفتوحة. وفي React وVue وAngular تعرض القائمة `emptyMessage` عندما لا يطابق أي خيار؛ وليس لمتحكم vanilla هذا النص، فيترك القائمة فارغة.
- يحتفظ الاختيار بالنص المكتوب عند فقدان التركيز، ولا يحدّد خيارًا ضمنيًا. ويفشل الاختيار المطلوب الذي فيه نص غير مطابق في التحقق الأصلي من قيود الإدخال، وتكون `requiredMessage` رسالته.
- بعد إرسال فاشل يحمل عنصر الإدخال الخاصية `aria-invalid="true"` حتى يُثبَّت خيار صالح أو يُعاد تعيين النموذج.
- يحافظ كل محوّل على تركيب النص بمحرّر أسلوب الإدخال، ويحافظ متحكم vanilla وAngular على اختصارات التحرير المقترنة بمفاتيح التعديل. ويستهلك الاختيار الموجود داخل مربع حوار أصلي المفتاح <kbd>Escape</kbd> قبل أن يُغلَق مربع الحوار.
- يضبط الاختيار المخصّص للقراءة فقط الخاصية `aria-readonly="true"`، ولا يفتح قائمته أبدًا، ويحتفظ بقيمته المُرسَلة؛ ويُستبعد الاختيار المعطَّل من النموذج.

## الاتجاه والتوطين

ليس في الاختيار القابل للبحث نص مدمج: يكتب التطبيق التسمية والنص الإرشادي والخطأ والنص النائب و`emptyMessage` و`getResultsMessage` و`requiredMessage` بلغة الصفحة. ويتبع العنصر اتجاه الصفحة، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية.

- يتجاهل البحث حالة الأحرف وعلامات التشكيل العربية وصور الألف، فيطابق الاستعلام المكتوب دونها؛ ولا تتغيّر التسميات ولا القيم المخزَّنة.
- قيمة الخيار `value` قيمة مخصّصة للمعالجة الآلية ولا تُترجم، أما `label` فهو النص الذي يراه القارئ ويبحث فيه.
- مفاتيح الأسهم رأسية، وتعمل بالطريقة نفسها في صفحة اتجاهها من اليمين إلى اليسار.
- اكتب رسالة النتائج بلغة الصفحة مستخدمًا العدد، ومن ذلك الرمز النائب {count} في خاصية vanilla.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط الاختيار القابل للبحث بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- يُدرج الاختيار القابل للبحث ضمن عناصر التحكم الأولية في نطاق المكوّنات في [ملاحظات التغطية](../coverage.md)، مكوّنًا تفاعليًا تنفّذ هوية بنفسها سلوكه مع لوحة المفاتيح ودورة حياته.
- يستند التركيز عبر الخيار النشط (active descendant) والتحديد اليدوي في الاختيار القابل للبحث إلى نمط Combobox في ممارسات التأليف الخاصة بـWAI-ARIA، كما يذكر ملف README لحزمة vanilla.
- تربط [ملاحظات حقول الإدخال](../nic-inputs.md) مظهر عنصر الإدخال في ورقة أنماط كود المنصات المزوَّدة؛ أما القائمة والخيارات فتركيب خاص بهوية، وليس لها مقابل في تلك الملاحظات.
- يُسجَّل سلوك القراءة فقط والتعطيل في [ملاحظة القراءة فقط](../combobox-readonly.md).
