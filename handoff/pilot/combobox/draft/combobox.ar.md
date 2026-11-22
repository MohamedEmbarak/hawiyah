---
source:
  summary: e3b0c44298fc
  example: 47c855a16f8f
  variants-and-states: f2a25c066b6e
  api: 1e9d7e3992d2
  accessibility: f09a92fab5e5
  rtl-and-localisation: 0e8b776b325f
  platforms-code-reference: c7a8237a2966
---
# اختيار قابل للبحث

## مثال

```html live example=service check=combobox-keyboard
<div class="hw-field">
  <label class="hw-label" id="service-type-label" for="service-type">نوع الخدمة</label>
  <div class="hw-combobox" data-hw="combobox" data-hw-results-message="الخيارات المطابقة: {count}">
    <input id="service-type" class="hw-input" type="text" data-hw-combobox-input aria-labelledby="service-type-label" aria-describedby="service-type-hint">
    <input type="hidden" name="service" data-hw-combobox-value>
    <ul class="hw-listbox" id="service-type-listbox" data-hw-combobox-list hidden>
      <li class="hw-option" data-hw-value="building-permit">تصريح بناء</li>
      <li class="hw-option" data-hw-value="business-licence">ترخيص نشاط تجاري</li>
      <li class="hw-option" data-hw-value="commercial-registration">سجل تجاري</li>
      <li class="hw-option" data-hw-value="residence-renewal">تجديد الإقامة</li>
    </ul>
    <span class="hw-sr-only" id="service-type-status" data-hw-combobox-status role="status"></span>
  </div>
  <p class="hw-hint" id="service-type-hint">ابدأ بكتابة اسم الخدمة.</p>
</div>
```

```tsx live example=service
<Combobox
  id="service-type"
  label="نوع الخدمة"
  hint="ابدأ بكتابة اسم الخدمة."
  name="service"
  emptyMessage="لا توجد خدمة تطابق النص."
  getResultsMessage={(count) => `الخيارات المطابقة: ${count}`}
  options={[
    { value: 'building-permit', label: 'تصريح بناء' },
    { value: 'business-licence', label: 'ترخيص نشاط تجاري' },
    { value: 'commercial-registration', label: 'سجل تجاري' },
    { value: 'residence-renewal', label: 'تجديد الإقامة' },
  ]}
/>
```

```vue live example=service
<Combobox
  id="service-type"
  label="نوع الخدمة"
  hint="ابدأ بكتابة اسم الخدمة."
  name="service"
  empty-message="لا توجد خدمة تطابق النص."
  :get-results-message="(count: number) => `الخيارات المطابقة: ${count}`"
  :options="[
    { value: 'building-permit', label: 'تصريح بناء' },
    { value: 'business-licence', label: 'ترخيص نشاط تجاري' },
    { value: 'commercial-registration', label: 'سجل تجاري' },
    { value: 'residence-renewal', label: 'تجديد الإقامة' },
  ]"
/>
```

```ts live example=service framework=angular
import { Component } from '@angular/core';
import { HwComboboxComponent } from '@hawiyah/angular';

@Component({
  imports: [HwComboboxComponent],
  template: `<hw-combobox
    controlId="service-type"
    label="نوع الخدمة"
    hint="ابدأ بكتابة اسم الخدمة."
    name="service"
    emptyMessage="لا توجد خدمة تطابق النص."
    [getResultsMessage]="resultsMessage"
    [options]="options"
  />`,
})
export class ServiceTypeExample {
  readonly resultsMessage = (count: number) => `الخيارات المطابقة: ${count}`;
  readonly options = [
    { value: 'building-permit', label: 'تصريح بناء' },
    { value: 'business-licence', label: 'ترخيص نشاط تجاري' },
    { value: 'commercial-registration', label: 'سجل تجاري' },
    { value: 'residence-renewal', label: 'تجديد الإقامة' },
  ];
}
```

## الأشكال والحالات

### التصفية بالنص المكتوب

```html live example=filter check=combobox-filter
<div class="hw-field">
  <label class="hw-label" id="document-type-label" for="document-type">نوع المستند</label>
  <div class="hw-combobox" data-hw="combobox" data-hw-results-message="الخيارات المطابقة: {count}">
    <input id="document-type" class="hw-input" type="text" data-hw-combobox-input aria-labelledby="document-type-label" aria-describedby="document-type-hint">
    <input type="hidden" name="document" data-hw-combobox-value>
    <ul class="hw-listbox" id="document-type-listbox" data-hw-combobox-list hidden>
      <li class="hw-option" data-hw-value="passport">جواز السفر</li>
      <li class="hw-option" data-hw-value="proof-of-address">إثبات العنوان</li>
      <li class="hw-option" data-hw-value="proof-of-income">إثبات الدخل</li>
      <li class="hw-option" data-hw-value="lease-contract">عقد الإيجار</li>
    </ul>
    <span class="hw-sr-only" id="document-type-status" data-hw-combobox-status role="status"></span>
  </div>
  <p class="hw-hint" id="document-type-hint">اكتب جزءًا من اسم المستند لتصفية القائمة.</p>
</div>
```

```tsx live example=filter
<Combobox
  id="document-type"
  label="نوع المستند"
  hint="اكتب جزءًا من اسم المستند لتصفية القائمة."
  name="document"
  emptyMessage="لا يوجد مستند يطابق النص."
  getResultsMessage={(count) => `الخيارات المطابقة: ${count}`}
  options={[
    { value: 'passport', label: 'جواز السفر' },
    { value: 'proof-of-address', label: 'إثبات العنوان' },
    { value: 'proof-of-income', label: 'إثبات الدخل' },
    { value: 'lease-contract', label: 'عقد الإيجار' },
  ]}
/>
```

```vue live example=filter
<Combobox
  id="document-type"
  label="نوع المستند"
  hint="اكتب جزءًا من اسم المستند لتصفية القائمة."
  name="document"
  empty-message="لا يوجد مستند يطابق النص."
  :get-results-message="(count: number) => `الخيارات المطابقة: ${count}`"
  :options="[
    { value: 'passport', label: 'جواز السفر' },
    { value: 'proof-of-address', label: 'إثبات العنوان' },
    { value: 'proof-of-income', label: 'إثبات الدخل' },
    { value: 'lease-contract', label: 'عقد الإيجار' },
  ]"
/>
```

```ts live example=filter framework=angular
import { Component } from '@angular/core';
import { HwComboboxComponent } from '@hawiyah/angular';

@Component({
  imports: [HwComboboxComponent],
  template: `<hw-combobox
    controlId="document-type"
    label="نوع المستند"
    hint="اكتب جزءًا من اسم المستند لتصفية القائمة."
    name="document"
    emptyMessage="لا يوجد مستند يطابق النص."
    [getResultsMessage]="resultsMessage"
    [options]="options"
  />`,
})
export class DocumentTypeExample {
  readonly resultsMessage = (count: number) => `الخيارات المطابقة: ${count}`;
  readonly options = [
    { value: 'passport', label: 'جواز السفر' },
    { value: 'proof-of-address', label: 'إثبات العنوان' },
    { value: 'proof-of-income', label: 'إثبات الدخل' },
    { value: 'lease-contract', label: 'عقد الإيجار' },
  ];
}
```

### خيار غير متاح

```html live example=unavailable check=combobox-unavailable
<div class="hw-field">
  <label class="hw-label" id="delivery-method-label" for="delivery-method">طريقة التسليم</label>
  <div class="hw-combobox" data-hw="combobox" data-hw-results-message="الخيارات المطابقة: {count}">
    <input id="delivery-method" class="hw-input" type="text" data-hw-combobox-input aria-labelledby="delivery-method-label" aria-describedby="delivery-method-hint">
    <input type="hidden" name="delivery" data-hw-combobox-value>
    <ul class="hw-listbox" id="delivery-method-listbox" data-hw-combobox-list hidden>
      <li class="hw-option" data-hw-value="branch">الاستلام من الفرع</li>
      <li class="hw-option" data-hw-value="post" aria-disabled="true">التسليم بالبريد</li>
      <li class="hw-option" data-hw-value="courier">التسليم عبر شركة الشحن</li>
      <li class="hw-option" data-hw-value="email">البريد الإلكتروني</li>
    </ul>
    <span class="hw-sr-only" id="delivery-method-status" data-hw-combobox-status role="status"></span>
  </div>
  <p class="hw-hint" id="delivery-method-hint">التسليم بالبريد غير متاح لهذا المستند.</p>
</div>
```

```tsx live example=unavailable
<Combobox
  id="delivery-method"
  label="طريقة التسليم"
  hint="التسليم بالبريد غير متاح لهذا المستند."
  name="delivery"
  emptyMessage="لا توجد طريقة تسليم تطابق النص."
  getResultsMessage={(count) => `الخيارات المطابقة: ${count}`}
  options={[
    { value: 'branch', label: 'الاستلام من الفرع' },
    { value: 'post', label: 'التسليم بالبريد', disabled: true },
    { value: 'courier', label: 'التسليم عبر شركة الشحن' },
    { value: 'email', label: 'البريد الإلكتروني' },
  ]}
/>
```

```vue live example=unavailable
<Combobox
  id="delivery-method"
  label="طريقة التسليم"
  hint="التسليم بالبريد غير متاح لهذا المستند."
  name="delivery"
  empty-message="لا توجد طريقة تسليم تطابق النص."
  :get-results-message="(count: number) => `الخيارات المطابقة: ${count}`"
  :options="[
    { value: 'branch', label: 'الاستلام من الفرع' },
    { value: 'post', label: 'التسليم بالبريد', disabled: true },
    { value: 'courier', label: 'التسليم عبر شركة الشحن' },
    { value: 'email', label: 'البريد الإلكتروني' },
  ]"
/>
```

```ts live example=unavailable framework=angular
import { Component } from '@angular/core';
import { HwComboboxComponent } from '@hawiyah/angular';

@Component({
  imports: [HwComboboxComponent],
  template: `<hw-combobox
    controlId="delivery-method"
    label="طريقة التسليم"
    hint="التسليم بالبريد غير متاح لهذا المستند."
    name="delivery"
    emptyMessage="لا توجد طريقة تسليم تطابق النص."
    [getResultsMessage]="resultsMessage"
    [options]="options"
  />`,
})
export class DeliveryMethodExample {
  readonly resultsMessage = (count: number) => `الخيارات المطابقة: ${count}`;
  readonly options = [
    { value: 'branch', label: 'الاستلام من الفرع' },
    { value: 'post', label: 'التسليم بالبريد', disabled: true },
    { value: 'courier', label: 'التسليم عبر شركة الشحن' },
    { value: 'email', label: 'البريد الإلكتروني' },
  ];
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

## إمكانية الوصول

جدول: التفاعل من لوحة المفاتيح مع المكوّن: اختيار قابل للبحث

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز إلى الحقل ويفتح القائمة، ومن الحقل ينقل التركيز إلى العنصر التالي ويغلق القائمة دون اعتماد أي خيار. |
| <kbd>السهم السفلي</kbd>، <kbd>السهم العلوي</kbd> | يفتح القائمة ويجعل الخيار المتاح التالي أو السابق نشطًا، ويعود من الطرف إلى الطرف الآخر، ويبقى التركيز في الحقل. |
| <kbd>Home</kbd>، <kbd>End</kbd> | يجعل أول خيار متاح أو آخره نشطًا. |
| <kbd>Enter</kbd> | يعتمد الخيار النشط ويعرض تسميته في الحقل ويغلق القائمة. |
| <kbd>Escape</kbd> | يغلق القائمة دون اعتماد أي خيار ويُبقي النص في الحقل. |
| <kbd>Backspace</kbd> | يحذف الحرف الذي يسبق المؤشر ويلغي الخيار المحدد ويصفّي القائمة بالنص المتبقي. |

## الاتجاه والتوطين

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد.
