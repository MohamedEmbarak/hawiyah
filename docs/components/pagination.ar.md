---
source:
  summary: 2f0d558dc7da
  example: 583974c16cc3
  variants-and-states: 32d85dbe95e5
  api: 7dd153045d85
  accessibility: 9030fd24a5d0
  rtl-and-localisation: 3eb4798a72a5
  platforms-code-reference: 3ed5a8a565d7
---
# ترقيم الصفحات

ترقيم الصفحات معلم تنقل فيه سهما الصفحة السابقة والتالية، وأزرار صفحات مرقّمة، وعناصر إظهار وإخفاء للصفحات التي يحذفها نطاق الصفحات المعروضة. ويُبلغ المكوّن عن الصفحة المحدَّدة، ويحمّل التطبيق السجلات المقابلة لها.

## مثال

للمعلم اسم، ولكل زر صفحة اسم يتضمّن رقمها، وتحمل الصفحة الحالية `aria-current="page"`. وفي الصفحة الأولى يحمل سهم الصفحة السابقة `aria-disabled`، ويبقى قابلًا للتركيز، ويتجاهل التفعيل.

```html live example=basic static differences=pagination-adapter-markup,pagination-vue-gap-text
<nav class="hw-pagination" data-hw="pagination" aria-label="صفحات الطلبات" data-hw-total="10" data-hw-current="1" data-hw-page-label="الصفحة {page}" data-hw-gap-label="الصفحات من {start} إلى {end}" data-hw-jump-label="رقم الصفحة" data-hw-go-label="انتقال">
  <button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-page="previous" data-hw-previous type="button" aria-label="الصفحة السابقة"></button>
  <span class="hw-pagination-items" data-hw-pagination-items></span>
  <button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-page="next" data-hw-next type="button" aria-label="الصفحة التالية"></button>
</nav>
```

```tsx live example=basic
<Pagination
  label="صفحات الطلبات"
  totalPages={10}
  defaultPage={1}
  previousLabel="الصفحة السابقة"
  nextLabel="الصفحة التالية"
  getPageLabel={page => `الصفحة ${page}`}
  getGapLabel={(start, end) => `الصفحات من ${start} إلى ${end}`}
  jumpLabel="رقم الصفحة"
  goLabel="انتقال"
/>
```

```vue live example=basic
<Pagination
  label="صفحات الطلبات"
  :total-pages="10"
  :default-value="1"
  previous-label="الصفحة السابقة"
  next-label="الصفحة التالية"
  :get-page-label="(page: number) => `الصفحة ${page}`"
  :get-gap-label="(start: number, end: number) => `الصفحات من ${start} إلى ${end}`"
  jump-label="رقم الصفحة"
  go-label="انتقال"
/>
```

```ts live example=basic framework=angular
import { Component } from '@angular/core';
import { HwPaginationComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-basic-example',
  imports: [HwPaginationComponent],
  template: `<hw-pagination
    label="صفحات الطلبات"
    [totalPages]="10"
    [page]="1"
    previousLabel="الصفحة السابقة"
    nextLabel="الصفحة التالية"
    [getPageLabel]="pageLabel"
    [getGapLabel]="gapLabel"
    jumpLabel="رقم الصفحة"
    goLabel="انتقال"
  />`,
})
export class BasicExample {
  pageLabel = (page: number) => `الصفحة ${page}`;
  gapLabel = (start: number, end: number) => `الصفحات من ${start} إلى ${end}`;
}
```

## الأشكال والحالات

### الفجوات بين الصفحات

يعرض النطاق الصفحة الأولى والصفحة الأخيرة والصفحة الحالية والصفحات المجاورة لها. وكل نطاق محذوف عنصر إظهار وإخفاء بعلامة الحذف، يذكر اسمه نطاق الصفحات التي يضمّها، والصفحات داخله أزرار.

```html live example=middle static differences=pagination-adapter-markup,pagination-vue-gap-text
<nav class="hw-pagination" data-hw="pagination" aria-label="صفحات الطلبات" data-hw-total="20" data-hw-current="6" data-hw-page-label="الصفحة {page}" data-hw-gap-label="الصفحات من {start} إلى {end}" data-hw-jump-label="رقم الصفحة" data-hw-go-label="انتقال">
  <button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-page="previous" data-hw-previous type="button" aria-label="الصفحة السابقة"></button>
  <span class="hw-pagination-items" data-hw-pagination-items></span>
  <button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-page="next" data-hw-next type="button" aria-label="الصفحة التالية"></button>
</nav>
```

```tsx live example=middle
<Pagination
  label="صفحات الطلبات"
  totalPages={20}
  defaultPage={6}
  previousLabel="الصفحة السابقة"
  nextLabel="الصفحة التالية"
  getPageLabel={page => `الصفحة ${page}`}
  getGapLabel={(start, end) => `الصفحات من ${start} إلى ${end}`}
  jumpLabel="رقم الصفحة"
  goLabel="انتقال"
/>
```

```vue live example=middle
<Pagination
  label="صفحات الطلبات"
  :total-pages="20"
  :default-value="6"
  previous-label="الصفحة السابقة"
  next-label="الصفحة التالية"
  :get-page-label="(page: number) => `الصفحة ${page}`"
  :get-gap-label="(start: number, end: number) => `الصفحات من ${start} إلى ${end}`"
  jump-label="رقم الصفحة"
  go-label="انتقال"
/>
```

```ts live example=middle framework=angular
import { Component } from '@angular/core';
import { HwPaginationComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-middle-example',
  imports: [HwPaginationComponent],
  template: `<hw-pagination
    label="صفحات الطلبات"
    [totalPages]="20"
    [page]="6"
    previousLabel="الصفحة السابقة"
    nextLabel="الصفحة التالية"
    [getPageLabel]="pageLabel"
    [getGapLabel]="gapLabel"
    jumpLabel="رقم الصفحة"
    goLabel="انتقال"
  />`,
})
export class MiddleExample {
  pageLabel = (page: number) => `الصفحة ${page}`;
  gapLabel = (start: number, end: number) => `الصفحات من ${start} إلى ${end}`;
}
```

### ترقيم صفحات معطَّل

يُبقي ترقيم الصفحات المعطَّل أزرار صفحاته في التخطيط، ويمنع التحديد، ويعرض علامات الحذف نصًا عاديًا مخفيًا عن التقنيات المساعدة.

```html live example=disabled static differences=pagination-adapter-markup
<nav class="hw-pagination" data-hw="pagination" aria-label="صفحات الطلبات" data-hw-total="10" data-hw-current="3" aria-disabled="true" data-hw-page-label="الصفحة {page}" data-hw-gap-label="الصفحات من {start} إلى {end}" data-hw-jump-label="رقم الصفحة" data-hw-go-label="انتقال">
  <button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-page="previous" data-hw-previous type="button" aria-label="الصفحة السابقة"></button>
  <span class="hw-pagination-items" data-hw-pagination-items></span>
  <button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-page="next" data-hw-next type="button" aria-label="الصفحة التالية"></button>
</nav>
```

```tsx live example=disabled
<Pagination
  label="صفحات الطلبات"
  totalPages={10}
  defaultPage={3}
  disabled
  previousLabel="الصفحة السابقة"
  nextLabel="الصفحة التالية"
  getPageLabel={page => `الصفحة ${page}`}
  getGapLabel={(start, end) => `الصفحات من ${start} إلى ${end}`}
  jumpLabel="رقم الصفحة"
  goLabel="انتقال"
/>
```

```vue live example=disabled
<Pagination
  label="صفحات الطلبات"
  :total-pages="10"
  :default-value="3"
  disabled
  previous-label="الصفحة السابقة"
  next-label="الصفحة التالية"
  :get-page-label="(page: number) => `الصفحة ${page}`"
  :get-gap-label="(start: number, end: number) => `الصفحات من ${start} إلى ${end}`"
  jump-label="رقم الصفحة"
  go-label="انتقال"
/>
```

```ts live example=disabled framework=angular
import { Component } from '@angular/core';
import { HwPaginationComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-disabled-example',
  imports: [HwPaginationComponent],
  template: `<hw-pagination
    label="صفحات الطلبات"
    [totalPages]="10"
    [page]="3"
    [disabled]="true"
    previousLabel="الصفحة السابقة"
    nextLabel="الصفحة التالية"
    [getPageLabel]="pageLabel"
    [getGapLabel]="gapLabel"
    jumpLabel="رقم الصفحة"
    goLabel="انتقال"
  />`,
})
export class DisabledExample {
  pageLabel = (page: number) => `الصفحة ${page}`;
  gapLabel = (start: number, end: number) => `الصفحات من ${start} إلى ${end}`;
}
```

### النطاقات الطويلة

لا تسرد الفجوة التي تزيد على 100 صفحة كل صفحاتها. فيضمّ عنصر الإظهار والإخفاء حقلًا رقميًا بتسمية ظاهرة وزرًا، ولا تتغيّر الصفحة إلا إذا وقع الرقم المُدخل داخل الفجوة.

```html live example=long-range static differences=pagination-adapter-markup,pagination-vue-gap-text
<nav class="hw-pagination" data-hw="pagination" aria-label="صفحات الطلبات" data-hw-total="250" data-hw-current="1" data-hw-page-label="الصفحة {page}" data-hw-gap-label="الصفحات من {start} إلى {end}" data-hw-jump-label="رقم الصفحة" data-hw-go-label="انتقال">
  <button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-page="previous" data-hw-previous type="button" aria-label="الصفحة السابقة"></button>
  <span class="hw-pagination-items" data-hw-pagination-items></span>
  <button class="hw-button hw-pagination-arrow" data-variant="ghost" data-hw-page="next" data-hw-next type="button" aria-label="الصفحة التالية"></button>
</nav>
```

```tsx live example=long-range
<Pagination
  label="صفحات الطلبات"
  totalPages={250}
  defaultPage={1}
  previousLabel="الصفحة السابقة"
  nextLabel="الصفحة التالية"
  getPageLabel={page => `الصفحة ${page}`}
  getGapLabel={(start, end) => `الصفحات من ${start} إلى ${end}`}
  jumpLabel="رقم الصفحة"
  goLabel="انتقال"
/>
```

```vue live example=long-range
<Pagination
  label="صفحات الطلبات"
  :total-pages="250"
  :default-value="1"
  previous-label="الصفحة السابقة"
  next-label="الصفحة التالية"
  :get-page-label="(page: number) => `الصفحة ${page}`"
  :get-gap-label="(start: number, end: number) => `الصفحات من ${start} إلى ${end}`"
  jump-label="رقم الصفحة"
  go-label="انتقال"
/>
```

```ts live example=long-range framework=angular
import { Component } from '@angular/core';
import { HwPaginationComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-long-range-example',
  imports: [HwPaginationComponent],
  template: `<hw-pagination
    label="صفحات الطلبات"
    [totalPages]="250"
    [page]="1"
    previousLabel="الصفحة السابقة"
    nextLabel="الصفحة التالية"
    [getPageLabel]="pageLabel"
    [getGapLabel]="gapLabel"
    jumpLabel="رقم الصفحة"
    goLabel="انتقال"
  />`,
})
export class LongRangeExample {
  pageLabel = (page: number) => `الصفحة ${page}`;
  gapLabel = (start: number, end: number) => `الصفحات من ${start} إلى ${end}`;
}
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createPagination

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `page` | `number` | `false` | — |
| `totalPages` | `number` | `false` | — |
| `siblingCount` | `number` | `false` | — |
| `disabled` | `boolean` | `false` | — |
| `hideOnSinglePage` | `boolean` | `false` | — |
| `label` | `string` | `false` | — |
| `getPageLabel` | `(page: number) => string` | `false` | — |
| `formatPage` | `(page: number) => string` | `false` | — |
| `getGapLabel` | `(start: number, end: number) => string` | `false` | — |
| `jumpLabel` | `string` | `false` | — |
| `goLabel` | `string` | `false` | — |
| `onPageChange` | `(page: number) => void` | `false` | — |

ليس لترقيم الصفحات شكل يقتصر على ورقة الأنماط: فالترميز تولّده `createPagination` أو يُكتب يدويًا. اكتب عنصر `nav` بالصنف `hw-pagination` مع `data-hw="pagination"`، ثم إمّا عناصر تحكم مكتوبة في الترميز تحمل الخاصية `data-hw-page`، وقيمتها previous أو next أو رقم صفحة (ويحمل السهمان أيضًا `data-hw-previous` أو `data-hw-next`، وتعكس ورقة الأنماط اتجاه سهم الصفحة السابقة عبر `data-hw-previous`)، وإمّا عنصرًا يحمل `data-hw-pagination-items` بين السهمين، يملؤه المتحكم بأزرار الصفحات وعناصر الإظهار والإخفاء بعلامة الحذف. ويقرأ المتحكم من الجذر `data-hw-total` و`data-hw-current` و`data-hw-siblings` و`data-hw-hide-single`؛ وتحمل `data-hw-page-label` و`data-hw-gap-label`، والخاصيتان المقابلتان لتسمية حقل الانتقال وتسمية زر الانتقال، الأسماءَ، مع {page} و{start} و{end} مواضعَ للقيم. ولا تنشر الخيارات قيمة افتراضية في الإصدار 0.3.0؛ ويأخذ الإصدار المنشور الصفحة 1 صفحةً حالية عندما لا تُمرَّر أي صفحة، ويأخذ `siblingCount` بالقيمة 1. ويجب أن تكون `totalPages` عددًا صحيحًا موجبًا آمنًا، وإلا طرح المتحكم خطأً. ومع حاوية البنود تكون `getPageLabel` و`getGapLabel` و`jumpLabel` و`goLabel` مطلوبة، خياراتٍ أو خصائص على الجذر. وتتلقى `onPageChange` الصفحة الجديدة. وللمتحكم الذي تُرجعه الدالة `page` و`select(page)` و`destroy()`؛ وتتجاهل `select` الصفحة التي ليست عددًا صحيحًا داخل النطاق، والصفحة الحالية، وترقيم الصفحات المعطَّل، وتعيد `destroy` العناصر الأبناء والخصائص الأصلية.

يمنع التحديدَ الخيارُ `disabled`، والخاصية `aria-disabled="true"` على الجذر، وعنصر `fieldset` معطَّل يحيط بالمكوّن. ويُخفي الخيار `hideOnSinglePage`، والخاصية `data-hw-hide-single` بالقيمة `true`، ترقيمَ الصفحات ذا الصفحة الواحدة؛ ولا أثر للخاصية بأي قيمة أخرى.

### React

جدول: خصائص Pagination

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `page` | `number` | `false` | — |
| `defaultPage` | `number` | `false` | `1` |
| `totalPages` | `number` | `true` | — |
| `onPageChange` | `(page: number) => void` | `false` | — |
| `previousLabel` | `string` | `true` | — |
| `nextLabel` | `string` | `true` | — |
| `getPageLabel` | `(page: number) => string` | `true` | — |
| `formatPage` | `(page: number) => ReactNode` | `false` | — |
| `siblingCount` | `number` | `false` | `1` |
| `disabled` | `boolean` | `false` | `false` |
| `hideOnSinglePage` | `boolean` | `false` | `false` |
| `getGapLabel` | `(start: number, end: number) => string` | `true` | — |
| `jumpLabel` | `string` | `true` | — |
| `goLabel` | `string` | `true` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |

تجعل `page` مع `onPageChange` الصفحة متحكَّمًا فيها، وتضبط `defaultPage` صفحة البداية لترقيم صفحات غير متحكَّم فيه. وتُقيَّد الصفحة بنطاق `totalPages`. والخصائص `previousLabel` و`nextLabel` و`getPageLabel` و`getGapLabel` و`jumpLabel` و`goLabel` نصوص مطلوبة يوفّرها التطبيق، ويحتاج ترقيم الصفحات إلى اسم من `label` أو `aria-label` أو `aria-labelledby`. والقيمة الافتراضية لـ`formatPage` هي الدالة String، ويمكن أن تُرجع محتوى React. وتضبط `siblingCount` عدد أزرار الصفحات على كل جانب من الصفحة الحالية. وتمنع `disabled` التحديد، وتُخفي `hideOnSinglePage` المعلم عندما تكون قيمة `totalPages` هي 1. وتصل خصائص عنصر `nav` الأصلي الأخرى إلى المعلم، ويصل المرجع إلى العنصر نفسه.

### Vue

جدول: خصائص Pagination وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `modelValue` | prop | `number` | `false` | — |
| `defaultValue` | prop | `number` | `false` | `1` |
| `totalPages` | prop | `number` | `true` | — |
| `label` | prop | `string` | `false` | — |
| `previousLabel` | prop | `string` | `true` | — |
| `nextLabel` | prop | `string` | `true` | — |
| `getPageLabel` | prop | `(page: number) => string` | `true` | — |
| `formatPage` | prop | `(page: number) => string` | `false` | — |
| `siblingCount` | prop | `number` | `false` | `1` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `hideOnSinglePage` | prop | `boolean` | `false` | `false` |
| `getGapLabel` | prop | `(start: number, end: number) => string` | `true` | — |
| `jumpLabel` | prop | `string` | `true` | — |
| `goLabel` | prop | `string` | `true` | — |
| `update:modelValue` | event | `(value: number) => void` | `false` | — |

يربط `v-model` الصفحة، وتضبط `defaultValue` صفحة البداية لترقيم صفحات غير متحكَّم فيه؛ ويحمل الحدث `update:modelValue` الصفحة الجديدة. وتسمّي `label` المعلم، والتسميات والدالتان `getPageLabel` و`getGapLabel` مطلوبة. والقيمة الافتراضية لـ`formatPage` هي الدالة String، وتُرجع سلسلة نصية. وتسلك `siblingCount` و`disabled` و`hideOnSinglePage` السلوك نفسه كما في React. ولا يقرأ الإصدار المنشور أي منفذ.

### Angular

جدول: مُدخلات hw-pagination ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `page` | input | `number` | `false` | `1` |
| `totalPages` | input | `number` | `false` | `1` |
| `previousLabel` | input | `string` | `true` | — |
| `nextLabel` | input | `string` | `true` | — |
| `getPageLabel` | input | `(page: number) => string` | `true` | — |
| `formatPage` | input | `(page: number) => string` | `false` | — |
| `siblingCount` | input | `number` | `false` | `1` |
| `disabled` | input | `boolean` | `false` | `false` |
| `hideOnSinglePage` | input | `boolean` | `false` | `false` |
| `getGapLabel` | input | `(start: number, end: number) => string` | `true` | — |
| `jumpLabel` | input | `string` | `true` | — |
| `goLabel` | input | `string` | `true` | — |
| `pageChange` | output | `number` | `false` | — |

يعرض `HwPaginationComponent` (`hw-pagination`) العنصر `nav`. اربط `[(page)]` ربطًا ثنائي الاتجاه بالصفحة الحالية؛ ويُرسل المُخرج `pageChange` الصفحة الجديدة. والقيمة الافتراضية لـ`totalPages` هي 1. ويُربط مُدخل الدالة، مثل `getPageLabel`، بخاصية في مكوّن التطبيق الذي يضمّ ترقيم الصفحات، لأن القالب لا يستطيع تعريف دالة سهمية. ويحتاج ترقيم الصفحات إلى `label`، أو إلى `aria-label` أو `aria-labelledby` مكتوبة على `hw-pagination`. والقيمة الافتراضية لـ`formatPage` هي الدالة String. وتسلك `siblingCount` و`disabled` و`hideOnSinglePage` السلوك نفسه كما في React.

## إمكانية الوصول

ترقيم الصفحات عنصر `nav` تسمّيه `label` أو `aria-label` أو `aria-labelledby`. وأزرار الصفحات والأسهم المولَّدة، وأزرار React وVue وAngular وأسهمها، عناصر `button` أصلية تحمل `type="button"`؛ ويمكن أن تكون عناصر التحكم بالصفحات المكتوبة في ترميز vanilla روابط. ولكل منها اسم ميسّر يكتبه التطبيق: ففي React وVue وAngular يأتي من `previousLabel` و`nextLabel` و`getPageLabel`، وفي vanilla من الخاصية `aria-label` المكتوبة على كل سهم، ومن `getPageLabel` لكل زر صفحة مولَّد. وتحمل الصفحة الحالية `aria-current="page"`.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: ترقيم الصفحات

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز إلى السهم أو زر الصفحة أو عنصر الإظهار والإخفاء بعلامة الحذف التالي، وإلى وجهات عنصر الإظهار والإخفاء المفتوح. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | ينقل التركيز إلى عنصر التحكم السابق بالترتيب نفسه. |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | يفعّل السهم أو زر الصفحة الذي عليه التركيز، ويفتح عنصر الإظهار والإخفاء بعلامة الحذف الذي عليه التركيز أو يغلقه. |
| <kbd>Escape</kbd> | يُغلق عنصر الإظهار والإخفاء بعلامة الحذف المفتوح، ويعيد التركيز إلى عنصر `summary` الخاص به. |

- في الصفحة الأولى يحمل سهم الصفحة السابقة، وفي الصفحة الأخيرة يحمل سهم الصفحة التالية، الخاصية `aria-disabled="true"`، ويحتفظ بالتركيز وباسمه، ويتجاهل التفعيل. ولا تُستخدم الخاصية الأصلية `disabled` إلا ما دام ترقيم الصفحات كله معطَّلًا، وفي vanilla على عنصر تحكم كُتب معطَّلًا في الترميز.
- يُغلق تحديدُ صفحة داخل عنصر الإظهار والإخفاء بعلامة الحذف ذلك العنصر. ثم ينتقل التركيز إلى زر الصفحة الحالية بعد أن يحدّث إطار العمل الذي يملك المكوّن الصفحة.
- الحقل الرقمي للفجوة الطويلة عنصر `input` أصلي يحمل `type="number"` داخل عنصر `label`. ويتحقق من الرقم المفتاح Enter في الحقل والزرُّ الذي تسمّيه `goLabel`؛ ويضبط الرقم غير الصالح `aria-invalid="true"` على الحقل، ولا يغيّر الصفحة.
- يُغلق فتحُ عنصر إظهار وإخفاء ثانٍ بعلامة الحذف العنصرَ الأول، ويُغلق النقرُ خارج ترقيم الصفحات العنصرَ المفتوح.
- لا يمرّر ترقيم الصفحات الصفحة بعد التغيير، ولا يغيّر عنوان URL للصفحة؛ ولا ينقل التركيز إلا كما سبق وصفه، بعد تحديد صفحة داخل عنصر الإظهار والإخفاء بعلامة الحذف. ويمكن أن يكون زر الصفحة في ترميز vanilla المكتوب يدويًا رابطًا يحمل `href`؛ ويترك متحكم vanilla تنقّله الأصلي للمتصفح، ومنه التنقل مع مفاتيح التعديل.
- تلغي ورقة الأنماط الانتقالات المتحرّكة لعناصر التحكم عندما يطلب القارئ تقليل الحركة، وتُبقي إشارات التركيز والصفحة الحالية ظاهرة في وضع الألوان القسرية.

## الاتجاه والتوطين

ليس في ترقيم الصفحات نص مدمج: يكتب التطبيق اسم المعلم واسمَي السهمين وأسماء أزرار الصفحات والفجوات وحقل الانتقال بلغة الصفحة. وتنسّق `formatPage` الرقم الظاهر على زر الصفحة، فيمكن أن يعرض التطبيق الأرقام العربية المشرقية؛ ودونها تكون الأرقام لاتينية.

- يتبع اتجاه السهمين أقرب حدّ لاتجاه HTML، فيشير سهم الصفحة السابقة نحو بداية اتجاه القراءة. وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية.
- تتلقى `getPageLabel` و`getGapLabel` أرقامًا وتُرجعان الاسم كاملًا، فيتحكم التطبيق في ترتيب الكلمات في كل لغة.
- حقل الانتقال عنصر إدخال أرقام أصلي، فيقرّر المتصفح طريقة عرض الرقم المكتوب وقراءته.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط ترقيم الصفحات بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات ترقيم الصفحات](../nic-pagination.md) نطاقات الصفحات المعروضة، وهندسة عناصر التحكم، والخط السفلي للصفحة الحالية، وعناصر الإظهار والإخفاء، ومظهر الأجهزة المحمولة، الواردة في ورقة أنماط كود المنصات المزوَّدة وبرنامجه النصي، وتذكر درجة الثقة في بعض عمليات الربط.
- تسجّل [ملاحظات ترقيم الصفحات](../nic-pagination.md) قرار الإصدار 0.3.0 بأن يحمل السهم عند الحدّ `aria-disabled` ويحتفظ بالتركيز، وبأن تحتفظ هوية بـ`siblingCount` بينما تتبع الدالة المساعدة المشتركة نطاقات الصفحات الافتراضية في المصدر.
- لا يُنقل تحميل البيانات وتصفيتها والتمرير من المصدر، كما تذكر [ملاحظات ترقيم الصفحات](../nic-pagination.md)؛ فهي تبقى من مسؤولية التطبيق.
