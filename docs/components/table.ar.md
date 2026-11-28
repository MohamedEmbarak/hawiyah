---
source:
  summary: 268f6f56b2db
  example: 16a1c17211b2
  variants-and-states: 9f29dc7cdfaf
  api: abb8a98ebd54
  accessibility: 650a235adb7c
  rtl-and-localisation: 5473be811afc
  platforms-code-reference: 9c8d4f4e05f3
---
# جدول

يعرض الجدول البيانات في صفوف وأعمدة بدلالات الجدول الأصلية: عنوان يسمّيه، وترويسات أعمدة محدَّدة النطاق، وترويسة صف اختيارية، داخل غلاف يقبل التركيز ويُمرَّر أفقيًا عندما يكون الجدول أعرض من حاويته. وتبقى التصفية والفرز وتقسيم الصفحات وجلب البيانات من سلوك التطبيق.

## مثال

يسرد الجدول طلبات الخدمات لمقدّم طلب. ويسمّي عنوانُ الجدول الجدولَ ويسمّي أيضًا غلاف التمرير، والعمود الأول هو ترويسة الصف في كل صف، وفي المكوّنات يمرّر التطبيق الأعمدة والصفوف بيانات.

```html live example=basic
<div class="hw-table-wrap" tabindex="0" role="region" aria-labelledby="basic-caption">
  <table class="hw-table">
    <caption id="basic-caption">طلبات الخدمات</caption>
    <thead><tr><th scope="col">الرقم المرجعي</th><th scope="col">الخدمة</th><th scope="col">الحالة</th></tr></thead>
    <tbody>
      <tr><th scope="row">طلب-1042</th><td>نسخة من مستند</td><td>قيد المراجعة</td></tr>
      <tr><th scope="row">طلب-1043</th><td>تغيير العنوان</td><td>مكتمل</td></tr>
      <tr><th scope="row">طلب-1044</th><td>تحديث الملف الشخصي</td><td>بانتظار المستندات</td></tr>
    </tbody>
  </table>
</div>
```

```tsx live example=basic
<Table
  caption="طلبات الخدمات"
  emptyMessage="لا توجد طلبات خدمات."
  columns={[
    { key: 'reference', label: 'الرقم المرجعي', rowHeader: true },
    { key: 'service', label: 'الخدمة' },
    { key: 'status', label: 'الحالة' },
  ]}
  rows={[
    { reference: 'طلب-1042', service: 'نسخة من مستند', status: 'قيد المراجعة' },
    { reference: 'طلب-1043', service: 'تغيير العنوان', status: 'مكتمل' },
    { reference: 'طلب-1044', service: 'تحديث الملف الشخصي', status: 'بانتظار المستندات' },
  ]}
/>
```

```vue live example=basic
<Table
  caption="طلبات الخدمات"
  empty-message="لا توجد طلبات خدمات."
  :columns="[
    { key: 'reference', label: 'الرقم المرجعي', rowHeader: true },
    { key: 'service', label: 'الخدمة' },
    { key: 'status', label: 'الحالة' },
  ]"
  :rows="[
    { reference: 'طلب-1042', service: 'نسخة من مستند', status: 'قيد المراجعة' },
    { reference: 'طلب-1043', service: 'تغيير العنوان', status: 'مكتمل' },
    { reference: 'طلب-1044', service: 'تحديث الملف الشخصي', status: 'بانتظار المستندات' },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-table
  caption="طلبات الخدمات"
  emptyMessage="لا توجد طلبات خدمات."
  [columns]="[
    { key: 'reference', label: 'الرقم المرجعي', rowHeader: true },
    { key: 'service', label: 'الخدمة' },
    { key: 'status', label: 'الحالة' },
  ]"
  [rows]="[
    { reference: 'طلب-1042', service: 'نسخة من مستند', status: 'قيد المراجعة' },
    { reference: 'طلب-1043', service: 'تغيير العنوان', status: 'مكتمل' },
    { reference: 'طلب-1044', service: 'تحديث الملف الشخصي', status: 'بانتظار المستندات' },
  ]"
/>`
```

## الأشكال والحالات

### التظليل المتناوب

يظلّل الشكل `variant="striped"` كل صف ثانٍ في متن الجدول. ويضبط الحجم `sm` الحد الأدنى لارتفاع الخلية على 40 px ويصغّر خط الخلايا؛ والحد الأدنى الافتراضي 48 px.

```html live example=striped
<div class="hw-table-wrap" tabindex="0" role="region" aria-labelledby="striped-caption">
  <table class="hw-table" data-variant="striped" data-size="sm">
    <caption id="striped-caption">المدفوعات الأخيرة</caption>
    <thead><tr><th scope="col">الإيصال</th><th scope="col">الوصف</th></tr></thead>
    <tbody>
      <tr><th scope="row">إيصال-201</th><td>رسوم نسخة من مستند</td></tr>
      <tr><th scope="row">إيصال-202</th><td>رسوم تغيير العنوان</td></tr>
      <tr><th scope="row">إيصال-203</th><td>رسوم تحديث الملف الشخصي</td></tr>
    </tbody>
  </table>
</div>
```

```tsx live example=striped
<Table
  caption="المدفوعات الأخيرة"
  emptyMessage="لا توجد مدفوعات."
  variant="striped"
  size="sm"
  columns={[
    { key: 'receipt', label: 'الإيصال', rowHeader: true },
    { key: 'description', label: 'الوصف' },
  ]}
  rows={[
    { receipt: 'إيصال-201', description: 'رسوم نسخة من مستند' },
    { receipt: 'إيصال-202', description: 'رسوم تغيير العنوان' },
    { receipt: 'إيصال-203', description: 'رسوم تحديث الملف الشخصي' },
  ]}
/>
```

```vue live example=striped
<Table
  caption="المدفوعات الأخيرة"
  empty-message="لا توجد مدفوعات."
  variant="striped"
  size="sm"
  :columns="[
    { key: 'receipt', label: 'الإيصال', rowHeader: true },
    { key: 'description', label: 'الوصف' },
  ]"
  :rows="[
    { receipt: 'إيصال-201', description: 'رسوم نسخة من مستند' },
    { receipt: 'إيصال-202', description: 'رسوم تغيير العنوان' },
    { receipt: 'إيصال-203', description: 'رسوم تحديث الملف الشخصي' },
  ]"
/>
```

```ts live example=striped framework=angular
template: `<hw-table
  caption="المدفوعات الأخيرة"
  emptyMessage="لا توجد مدفوعات."
  variant="striped"
  size="sm"
  [columns]="[
    { key: 'receipt', label: 'الإيصال', rowHeader: true },
    { key: 'description', label: 'الوصف' },
  ]"
  [rows]="[
    { receipt: 'إيصال-201', description: 'رسوم نسخة من مستند' },
    { receipt: 'إيصال-202', description: 'رسوم تغيير العنوان' },
    { receipt: 'إيصال-203', description: 'رسوم تحديث الملف الشخصي' },
  ]"
/>`
```

### الحدود بين الأعمدة

يرسم الشكل `variant="bordered"` حدًّا بين الأعمدة. ويضبط الحجم `lg` الحد الأدنى لارتفاع الخلية على 56 px، وحشوة الخلايا على خطوة أكبر.

```html live example=bordered
<div class="hw-table-wrap" tabindex="0" role="region" aria-labelledby="bordered-caption">
  <table class="hw-table" data-variant="bordered" data-size="lg">
    <caption id="bordered-caption">المستندات المسجّلة</caption>
    <thead><tr><th scope="col">المستند</th><th scope="col">تاريخ الإصدار</th></tr></thead>
    <tbody>
      <tr><th scope="row">سجل الميلاد</th><td>12 مارس 2019</td></tr>
      <tr><th scope="row">سجل الإقامة</th><td>4 يونيو 2023</td></tr>
    </tbody>
  </table>
</div>
```

```tsx live example=bordered
<Table
  caption="المستندات المسجّلة"
  emptyMessage="لا توجد مستندات مسجّلة."
  variant="bordered"
  size="lg"
  columns={[
    { key: 'document', label: 'المستند', rowHeader: true },
    { key: 'issued', label: 'تاريخ الإصدار' },
  ]}
  rows={[
    { document: 'سجل الميلاد', issued: '12 مارس 2019' },
    { document: 'سجل الإقامة', issued: '4 يونيو 2023' },
  ]}
/>
```

```vue live example=bordered
<Table
  caption="المستندات المسجّلة"
  empty-message="لا توجد مستندات مسجّلة."
  variant="bordered"
  size="lg"
  :columns="[
    { key: 'document', label: 'المستند', rowHeader: true },
    { key: 'issued', label: 'تاريخ الإصدار' },
  ]"
  :rows="[
    { document: 'سجل الميلاد', issued: '12 مارس 2019' },
    { document: 'سجل الإقامة', issued: '4 يونيو 2023' },
  ]"
/>
```

```ts live example=bordered framework=angular
template: `<hw-table
  caption="المستندات المسجّلة"
  emptyMessage="لا توجد مستندات مسجّلة."
  variant="bordered"
  size="lg"
  [columns]="[
    { key: 'document', label: 'المستند', rowHeader: true },
    { key: 'issued', label: 'تاريخ الإصدار' },
  ]"
  [rows]="[
    { document: 'سجل الميلاد', issued: '12 مارس 2019' },
    { document: 'سجل الإقامة', issued: '4 يونيو 2023' },
  ]"
/>`
```

### جدول فارغ

عندما تكون `rows` فارغة، يحتفظ الجدول بترويسته ويعرض `emptyMessage` في خلية واحدة تمتد على كل الأعمدة. وتبيّن الرسالة للقارئ سبب عدم وجود ما يُعرض.

```html live example=empty
<div class="hw-table-wrap" tabindex="0" role="region" aria-labelledby="empty-caption">
  <table class="hw-table">
    <caption id="empty-caption">طلبات الخدمات المفتوحة</caption>
    <thead><tr><th scope="col">الرقم المرجعي</th><th scope="col">الخدمة</th></tr></thead>
    <tbody><tr><td colspan="2">ليس لديك طلبات خدمات مفتوحة.</td></tr></tbody>
  </table>
</div>
```

```tsx live example=empty
<Table
  caption="طلبات الخدمات المفتوحة"
  emptyMessage="ليس لديك طلبات خدمات مفتوحة."
  columns={[
    { key: 'reference', label: 'الرقم المرجعي' },
    { key: 'service', label: 'الخدمة' },
  ]}
  rows={[]}
/>
```

```vue live example=empty
<Table
  caption="طلبات الخدمات المفتوحة"
  empty-message="ليس لديك طلبات خدمات مفتوحة."
  :columns="[
    { key: 'reference', label: 'الرقم المرجعي' },
    { key: 'service', label: 'الخدمة' },
  ]"
  :rows="[]"
/>
```

```ts live example=empty framework=angular
template: `<hw-table
  caption="طلبات الخدمات المفتوحة"
  emptyMessage="ليس لديك طلبات خدمات مفتوحة."
  [columns]="[
    { key: 'reference', label: 'الرقم المرجعي' },
    { key: 'service', label: 'الخدمة' },
  ]"
  [rows]="[]"
/>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العناصر hw-table-wrap وhw-table

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-table-wrap' \| 'hw-table'` | `true` | — |
| `data-numeric` | `boolean` | `false` | — |
| `data-variant` | `'bordered' \| 'striped'` | `false` | — |
| `data-size` | `'lg' \| 'sm'` | `false` | — |

ليس للجدول متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر `table` أصليًا بالصنف `hw-table` داخل عنصر `div` بالصنف `hw-table-wrap`. ويحتاج الغلاف إلى الخاصية `tabindex` بالقيمة صفر ليتمكّن مستخدم لوحة المفاتيح من تمريره، وإلى `role="region"`، وإلى `aria-labelledby` تشير إلى `id` عنصر `caption`، وهو الاسم الظاهر للجدول. وأعطِ كل ترويسة عمود النطاق col، وخلية ترويسة الصف النطاق row. وتضبط الخاصية `data-variant` مظهر التظليل المتناوب أو مظهر الحدود بين الأعمدة، وتأخذ الخاصية `data-size` القيمة `sm` أو `lg`؛ وتُكتب كلتاهما على عنصر `table`، ودونهما يكون الجدول بسيطًا وبالحجم المتوسط. والخاصية `data-numeric` خاصية يكفي وجودها، تُكتب على خلية تحتوي على رقم؛ فتحاذي الخلية إلى النهاية وتستخدم أرقامًا متساوية العرض. ويكتب التطبيق الترويسة القابلة للفرز بنفسه: ضع عنصر `span` بالصنف `hw-table-sort-icon` والخاصية `aria-hidden="true"` داخل زر الترويسة، واكتب `aria-sort` على عنصر `th`، وتتبعها الأيقونة.

### React

جدول: خصائص Table

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `variant` | `'default' \| 'striped' \| 'bordered'` | `false` | — |
| `size` | `'sm' \| 'md' \| 'lg'` | `false` | — |
| `data-variant` | `string` | `false` | — |
| `data-size` | `string` | `false` | — |
| `rows` | `readonly Row[]` | `false` | `[]` |
| `rowKey` | `(row: Row, index: number) => Key` | `false` | — |
| `caption` | `ReactNode` | `false` | — |
| `children` | `ReactNode` | `false` | — |
| `wrapperProps` | `HTMLAttributes<HTMLDivElement>` | `false` | — |
| `columns` | `readonly TableColumn<Row>[]` | `false` | — |
| `emptyMessage` | `ReactNode` | `false` | — |

يعمل Table بإحدى طريقتين. فمع `columns` و`rows` يعرض الترويسة والمتن والصف الفارغ بنفسه؛ ودون `columns` يعرض `children`، فاكتب داخله عنصرَي `thead` و`tbody` أصليين. ولـ`TableColumn` الحقل `key`، الذي يسمّي حقل الصف، والحقل `label`، والحقل `rowHeader`، الذي يجعل خلية ذلك العمود ترويسة صف، والحقل `cell`، وهو دالة اختيارية تتلقّى الصف وفهرسه، بهذا الترتيب، وتُرجع المحتوى؛ ودون `cell` تُطبع قيمة الحقل نصًّا. وتُرجع `rowKey` مفتاح React للصف، والمفتاح هو فهرس الصف ما لم تُمرَّر. وما دامت `columns` مُمرَّرة تكون `emptyMessage` مطلوبة، وتُعرض في خلية واحدة تمتد على الأعمدة عندما تكون `rows` فارغة. والخاصية `caption` هي الاسم الظاهر: لا يكون الغلاف منطقة يسمّيها عنوان الجدول إلا ما دام العنوان مُمرَّرًا، ويقبل الغلاف التركيز في الحالتين. وتصل `wrapperProps` إلى عنصر `div` الغلاف، وتصل الخصائص الأخرى إلى عنصر `table`. وتكتب الخاصيتان `variant` و`size` الخاصيتين `data-variant` و`data-size`؛ وتُقبل `data-variant` و`data-size` نفساهما خاصيتين أصليتين.

### Vue

جدول: خصائص Table وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `columns` | prop | `readonly TableColumn[]` | `false` | — |
| `rows` | prop | `readonly Record<string, unknown>[]` | `false` | — |
| `caption` | prop | `string` | `false` | — |
| `variant` | prop | `'default' \| 'striped' \| 'bordered'` | `false` | — |
| `size` | prop | `'sm' \| 'md' \| 'lg'` | `false` | — |
| `emptyMessage` | prop | `string` | `false` | — |
| `wrapperProps` | prop | `Record<string, unknown>` | `false` | — |
| `rowKey` | prop | `(row: Record<string, unknown>, index: number) => string \| number` | `false` | — |
| `default` | slot | — | `false` | — |
| `cell-<key>` | slot | — | `false` | — |

مع `columns` يعرض المكوّن الترويسة والمتن والصف الفارغ؛ ودون `columns` يعرض المنفذ `default`، فاكتب فيه عنصرَي `thead` و`tbody` أصليين. ولـ`TableColumn` الحقول `key` و`label` و`rowHeader`، والحقل الاختياري `cell`، وهو دالة تتلقّى الصف وفهرسه. ويطبع العمود الذي ليس له `cell` ولا منفذ القيمةَ نصًّا، ولا يطبع شيئًا للقيمة `null` أو `undefined`. ويتلقّى المنفذ ذو النطاق `cell-<key>`، ويمثّل فيه `<key>` مفتاح العمود، الصفَّ وفهرسه والعمود، ويتقدّم على `cell`. وقيمة `rows` مصفوفة فارغة، وقيمة `rowKey` فهرس الصف، ما لم تُمرَّرا، وليس لأي منهما قيمة افتراضية حرفية في الجدول. وتكون `emptyMessage` مطلوبة ما دامت `columns` مُمرَّرة. ولا يكون الغلاف منطقة يسمّيها عنوان الجدول إلا ما دامت `caption` مُمرَّرة. وتصل `wrapperProps` إلى عنصر `div` الغلاف. ويسرد الجدول المنافذ لأن الإصدار المنشور يقرؤها؛ ولا يعرّف التصريح نوع أي منها.

### Angular

جدول: مُدخلات hw-table ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `caption` | input | `string` | `false` | `''` |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `columns` | input | `readonly HwTableColumn<Row>[]` | `false` | `[]` |
| `rows` | input | `readonly Row[]` | `false` | `[]` |
| `rowKey` | input | `(row: Row, index: number) => string \| number` | `false` | — |
| `variant` | input | `'default' \| 'striped' \| 'bordered'` | `false` | — |
| `size` | input | `'sm' \| 'md' \| 'lg'` | `false` | — |
| `emptyMessage` | input | `string` | `true` | — |

يعرض `HwTableComponent` (`hw-table`) الجدول من `columns` و`rows`. ويحتاج إلى `caption`، أو إلى `aria-label` أو `aria-labelledby` مكتوبة على `hw-table`؛ وتصل كلتاهما إلى الجدول. وعند وجود العنوان يكون الغلاف منطقة يسمّيها هذا العنوان، ودونه لا يحمل الغلاف الدور ولا الخاصية. وللعمود الحقول `key` و`label` و`rowHeader`، والحقل الاختياري `cell`، وهو مرجع قالب يُعرض داخل الخلية، وسياقه الصف وفهرسه والعمود. ويطبع العمود الذي ليس له `cell` القيمةَ نصًّا. ويتتبّع المُدخل `rowKey` الصفوف، وقيمته فهرس الصف ما لم يُمرَّر. والمُدخل `emptyMessage` مطلوب. ويتجاهل `hw-table` عنصر `thead` أو `tbody` المُسقَط: فالجدول الذي تُكتب صفوفه يدويًا جدول أصلي بالصنفين `hw-table-wrap` و`hw-table`. ويجب أن يكون نوع الصف قابلًا للإسناد إلى سجل من قيم unknown، فعرّفه اسمًا مستعارًا للنوع (type alias) لا واجهة (interface).

## إمكانية الوصول

الجدول عنصر `table` أصلي، فيوفّر المتصفح أدواره والتنقل فيه للتقنيات المساعدة. وعنصر `caption` هو الاسم الظاهر للجدول. وترويسات الأعمدة عناصر `th` نطاقها col، وينتج العمود الذي يحمل `rowHeader` عنصر `th` نطاقه row في كل صف، فتُعلن الخلية مع ترويساتها.

- غلاف التمرير منطقة يسمّيها عنوان الجدول عبر `aria-labelledby`، ويقبل التركيز عبر `tabindex`، فيستطيع مستخدم لوحة المفاتيح تمرير الجدول الأعرض من حاويته بمفاتيح الأسهم في المتصفح. وترسم ورقة الأنماط مؤشر تركيز على الغلاف.
- دون عنوان لا يكون غلاف المكوّنات منطقة، ولا يكون له اسم. فاكتب عنوانًا، أو اكتب في Angular الخاصية `aria-label` أو `aria-labelledby` على `hw-table`.
- الصف الفارغ خلية واحدة تمتد على كل الأعمدة، فتُقرأ الرسالة في موضع البيانات.
- اللون والتظليل، كما في شكل التظليل المتناوب وشكل الحدود بين الأعمدة، زخرفة: لا تعتمد بنية الجدول عليهما.
- تُبرز ورقة الأنماط الصفوف عند المرور بالمؤشر، ولا يضيف الجدول تحديدًا ولا فرزًا. ويكتب التطبيق الجدول الذي له هذا السلوك، مع `aria-sort` على الترويسة القابلة للفرز؛ وللفرز توفّر الحزم أيضًا DataTable. ولا تدعم WAI-ARIA الخاصية `aria-selected` على الصف إلا في الشبكة أو الشبكة الشجرية، لا في الجدول الأصلي، فيحتاج الجدول القابل للتحديد إلى تلك البنية.

## الاتجاه والتوطين

ليس في الجدول نص مدمج: يكتب التطبيق عنوان الجدول وتسميات الأعمدة وقيم الخلايا و`emptyMessage` بلغة الصفحة. ويرث الجدول لغة الصفحة واتجاهها، ويرتّب الجدول الأصلي أعمدته من بداية السطر، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية لتحاذي الخلايا إلى البداية. وفي صفحة اتجاهها من اليمين إلى اليسار يكون العمود الأول على اليمين، ويبدأ التمرير من الحافة اليمنى.

- تحاذي الخلية الرقمية التي تحمل `data-numeric` إلى النهاية وتستخدم أرقامًا متساوية العرض، فتصطف الأرقام في اتجاهَي القراءة كليهما.
- ينسّق التطبيق التواريخ والعملات والأرقام في الخلية بحسب الإعدادات المحلية للصفحة؛ ولا ينسّق المكوّن أي قيمة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط الجدول بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات الجداول](../nic-tables.md) الحدود ونصف قطر الزوايا والترويسة وتباعد الخلايا، الواردة في ورقة أنماط كود المنصات المزوَّدة، وتذكر درجة الثقة في كل ربط والتكييفات التي تجريها هوية.
- شكل التظليل المتناوب وشكل الحدود بين الأعمدة والأحجام وأيقونة الفرز امتدادات من هوية؛ وتسجّلها [ملاحظات الجداول](../nic-tables.md) بهذه الصفة.
