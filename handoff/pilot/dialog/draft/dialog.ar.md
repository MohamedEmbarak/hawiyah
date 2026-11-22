---
source:
  summary: e3b0c44298fc
  example: f86cb8cc8a5c
  variants-and-states: 2b79122cbec8
  api: eef13aa58034
  accessibility: a0b55f6bc24f
  rtl-and-localisation: 0e8b776b325f
  platforms-code-reference: c7a8237a2966
---
# حوار

## مثال

```html live example=basic check=dialog-keyboard,dialog-close-button
<button class="hw-button" type="button" data-variant="primary" data-size="md" aria-haspopup="dialog" data-hw-dialog-open="review-dialog">مراجعة الطلب</button>
<dialog class="hw-dialog" id="review-dialog" data-hw="dialog" aria-labelledby="review-title" aria-describedby="review-description">
  <header class="hw-dialog-header">
    <h2 id="review-title">مراجعة طلب الخدمة</h2>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="إغلاق" data-hw-dialog-close><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
  </header>
  <div class="hw-dialog-body">
    <p id="review-description">تحقّق من تفاصيل الطلب قبل تقديمه.</p>
  </div>
  <footer class="hw-dialog-footer">
    <button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-dialog-close>إلغاء</button>
    <button class="hw-button" type="button" data-variant="primary" data-size="md" data-hw-dialog-close>تقديم الطلب</button>
  </footer>
</dialog>
```

```tsx live example=basic
<Dialog
  title="مراجعة طلب الخدمة"
  description="تحقّق من تفاصيل الطلب قبل تقديمه."
  closeLabel="إغلاق"
  trigger={<Button>مراجعة الطلب</Button>}
  footer={({ close }) => (
    <>
      <Button variant="secondary" onClick={close}>إلغاء</Button>
      <Button onClick={close}>تقديم الطلب</Button>
    </>
  )}
/>
```

```vue live example=basic
<Dialog
  title="مراجعة طلب الخدمة"
  description="تحقّق من تفاصيل الطلب قبل تقديمه."
  close-label="إغلاق"
>
  <template #trigger="{ open }">
    <Button aria-haspopup="dialog" @click="open">مراجعة الطلب</Button>
  </template>
  <template #footer="{ close }">
    <Button variant="secondary" @click="close">إلغاء</Button>
    <Button @click="close">تقديم الطلب</Button>
  </template>
</Dialog>
```

```ts live example=basic framework=angular
template: `<button hwButton aria-haspopup="dialog" (click)="review.show()">مراجعة الطلب</button>
<hw-dialog #review title="مراجعة طلب الخدمة" closeLabel="إغلاق" aria-describedby="review-description">
  <p id="review-description">تحقّق من تفاصيل الطلب قبل تقديمه.</p>
  <button hwButton hwDialogFooter variant="secondary" (click)="review.close()">إلغاء</button>
  <button hwButton hwDialogFooter (click)="review.close()">تقديم الطلب</button>
</hw-dialog>`
```

## الأشكال والحالات

### التركيز الأولي

```html live example=initial-focus check=dialog-initial-focus
<button class="hw-button" type="button" data-variant="secondary" data-size="md" aria-haspopup="dialog" data-hw-dialog-open="withdraw-dialog">سحب الطلب</button>
<dialog class="hw-dialog" id="withdraw-dialog" data-hw="dialog" aria-labelledby="withdraw-title" aria-describedby="withdraw-description">
  <header class="hw-dialog-header">
    <h2 id="withdraw-title">سحب طلب الخدمة</h2>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="إغلاق" data-hw-dialog-close><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
  </header>
  <div class="hw-dialog-body">
    <p id="withdraw-description">لا يمكن تقديم الطلب المسحوب مرة أخرى.</p>
  </div>
  <footer class="hw-dialog-footer">
    <button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-dialog-close autofocus>الإبقاء على الطلب</button>
    <button class="hw-button" type="button" data-variant="danger" data-size="md" data-hw-dialog-close>سحب</button>
  </footer>
</dialog>
```

```tsx live example=initial-focus
<Dialog
  title="سحب طلب الخدمة"
  description="لا يمكن تقديم الطلب المسحوب مرة أخرى."
  closeLabel="إغلاق"
  trigger={<Button variant="secondary">سحب الطلب</Button>}
  footer={({ close }) => (
    <>
      <Button variant="secondary" autoFocus onClick={close}>الإبقاء على الطلب</Button>
      <Button variant="danger" onClick={close}>سحب</Button>
    </>
  )}
/>
```

```vue live example=initial-focus
<Dialog
  title="سحب طلب الخدمة"
  description="لا يمكن تقديم الطلب المسحوب مرة أخرى."
  close-label="إغلاق"
>
  <template #trigger="{ open }">
    <Button variant="secondary" aria-haspopup="dialog" @click="open">سحب الطلب</Button>
  </template>
  <template #footer="{ close }">
    <Button variant="secondary" autofocus @click="close">الإبقاء على الطلب</Button>
    <Button variant="danger" @click="close">سحب</Button>
  </template>
</Dialog>
```

```ts live example=initial-focus framework=angular
template: `<button hwButton variant="secondary" aria-haspopup="dialog" (click)="withdraw.show()">سحب الطلب</button>
<hw-dialog #withdraw title="سحب طلب الخدمة" closeLabel="إغلاق" aria-describedby="withdraw-description">
  <p id="withdraw-description">لا يمكن تقديم الطلب المسحوب مرة أخرى.</p>
  <button hwButton hwDialogFooter variant="secondary" autofocus (click)="withdraw.close()">الإبقاء على الطلب</button>
  <button hwButton hwDialogFooter variant="danger" (click)="withdraw.close()">سحب</button>
</hw-dialog>`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createDialog

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `closeOnBackdrop` | `boolean` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |

### React

جدول: خصائص Dialog

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | `false` |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `title` | `ReactNode` | `true` | — |
| `description` | `ReactNode` | `false` | — |
| `trigger` | `ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>` | `false` | — |
| `children` | `ReactNode \| ((context: { close: () => void }) => ReactNode)` | `false` | — |
| `footer` | `ReactNode \| ((context: { close: () => void }) => ReactNode)` | `false` | — |
| `closeOnBackdrop` | `boolean` | `false` | `true` |
| `closeLabel` | `string` | `true` | — |

### Vue

جدول: خصائص Dialog وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `open` | prop | `boolean` | `false` | — |
| `defaultOpen` | prop | `boolean` | `false` | `false` |
| `title` | prop | `string` | `true` | — |
| `description` | prop | `string` | `false` | — |
| `closeLabel` | prop | `string` | `true` | — |
| `closeOnBackdrop` | prop | `boolean` | `false` | `true` |
| `update:open` | event | `(open: boolean) => void` | `false` | — |
| `trigger` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |
| `footer` | slot | — | `false` | — |

### Angular

جدول: مُدخلات hw-dialog ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `title` | input | `string` | `true` | — |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `titleId` | input | `string` | `false` | — |
| `open` | input | `boolean` | `false` | `false` |
| `closeLabel` | input | `string` | `true` | — |
| `closeOnBackdrop` | input | `boolean` | `false` | `true` |
| `openChange` | output | `boolean` | `false` | — |
| `cancelled` | output | `void` | `false` | — |
| `returnValue` | output | `string` | `false` | — |
| `*` | content | — | `false` | — |
| `[hwDialogFooter]` | content | — | `false` | — |

## إمكانية الوصول

جدول: التفاعل من لوحة المفاتيح مع المكوّن: حوار

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | على زر الفتح يفتح الحوار وينقل التركيز إلى داخله، وعلى زر الإغلاق يغلق الحوار ويعيد التركيز إلى زر الفتح. |
| <kbd>Tab</kbd> | ينقل التركيز إلى العنصر التالي في الحوار، ولا يصل التركيز إلى الصفحة خلفه. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | ينقل التركيز إلى العنصر السابق في الحوار، ولا يصل التركيز إلى الصفحة خلفه. |
| <kbd>Escape</kbd> | يغلق الحوار ويعيد التركيز إلى زر الفتح الذي فتحه. |

## الاتجاه والتوطين

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد.
