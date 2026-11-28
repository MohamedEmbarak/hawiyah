---
source:
  summary: 1280dc19020b
  example: cc0bbbf2aaff
  variants-and-states: 29d82c49d170
  api: 393f31bae849
  accessibility: c0cfae1f6b2e
  rtl-and-localisation: da7f46c57062
  platforms-code-reference: 83d82324a711
---
# جدول بيانات

جدول البيانات جدول أصلي تستطيع ترويسات أعمدته فرز الصفوف: يحتفظ بعنوان الجدول والترويسات ذات النطاق وغلاف التمرير من المكوّن Table، ويضبط `aria-sort` على الترويسات القابلة للفرز، ويفرز بحسب الإعدادات المحلية التي يوفّرها التطبيق. وليس فيه ترقيم صفحات ولا تحرير ولا بيانات تُجلب من خادم.

## مثال

يسرد الجدول طلبات الخدمات لمقدّم طلب. وعمودا الرقم المرجعي والخدمة قابلان للفرز، ويُسمّى كل زر فرز بتسمية عموده. ويفرز التفعيل الأول للترويسة الصفوفَ تصاعديًا، ويفرزها التفعيل التالي تنازليًا.

```html live example=basic static differences=data-table-adapter-markup,data-table-sort-indicator
<div class="hw-table-wrap hw-data-table" tabindex="0" role="region" aria-labelledby="basic-caption" data-hw="data-table" data-hw-locale="ar">
  <table class="hw-table">
    <caption id="basic-caption">طلبات الخدمات</caption>
    <thead>
      <tr>
        <th scope="col" data-hw-key="reference"><button class="hw-button" type="button" data-variant="ghost" data-size="md" data-hw-sort="reference">الرقم المرجعي<span class="hw-table-sort-icon" aria-hidden="true"></span></button></th>
        <th scope="col" data-hw-key="service"><button class="hw-button" type="button" data-variant="ghost" data-size="md" data-hw-sort="service">الخدمة<span class="hw-table-sort-icon" aria-hidden="true"></span></button></th>
        <th scope="col">الحالة</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>طلب-1042</td><td>نسخة من مستند</td><td>قيد المراجعة</td></tr>
      <tr><td>طلب-1043</td><td>تغيير العنوان</td><td>مكتمل</td></tr>
      <tr><td>طلب-1044</td><td>تحديث الملف الشخصي</td><td>بانتظار المستندات</td></tr>
    </tbody>
  </table>
</div>
```

```tsx live example=basic
<DataTable
  caption="طلبات الخدمات"
  emptyMessage="لا توجد طلبات خدمات."
  locale="ar"
  columns={[
    { key: 'reference', label: 'الرقم المرجعي', sortable: true },
    { key: 'service', label: 'الخدمة', sortable: true },
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
<DataTable
  caption="طلبات الخدمات"
  empty-message="لا توجد طلبات خدمات."
  locale="ar"
  :columns="[
    { key: 'reference', label: 'الرقم المرجعي', sortable: true },
    { key: 'service', label: 'الخدمة', sortable: true },
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
template: `<hw-data-table
  caption="طلبات الخدمات"
  emptyMessage="لا توجد طلبات خدمات."
  locale="ar"
  [columns]="[
    { key: 'reference', label: 'الرقم المرجعي', sortable: true },
    { key: 'service', label: 'الخدمة', sortable: true },
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

يظلّل الشكل `variant="striped"` كل صف ثانٍ في متن الجدول. ويخفّض الحجم `sm` ارتفاع الخلايا؛ ودون `size` لا تُكتب `data-size`، وتحتفظ الخلايا بالحد الأدنى الافتراضي للارتفاع. ويرسم الشكل `variant="bordered"` حدود الخلايا؛ ولا تعرضه أمثلة هذه الصفحة.

```html live example=striped static differences=data-table-adapter-markup,data-table-sort-indicator
<div class="hw-table-wrap hw-data-table" tabindex="0" role="region" aria-labelledby="striped-caption" data-hw="data-table" data-hw-locale="ar">
  <table class="hw-table" data-variant="striped" data-size="sm">
    <caption id="striped-caption">المدفوعات الأخيرة</caption>
    <thead>
      <tr>
        <th scope="col" data-hw-key="receipt"><button class="hw-button" type="button" data-variant="ghost" data-size="md" data-hw-sort="receipt">الإيصال<span class="hw-table-sort-icon" aria-hidden="true"></span></button></th>
        <th scope="col">الوصف</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>إيصال-201</td><td>رسوم نسخة من مستند</td></tr>
      <tr><td>إيصال-202</td><td>رسوم تغيير العنوان</td></tr>
      <tr><td>إيصال-203</td><td>رسوم تحديث الملف الشخصي</td></tr>
    </tbody>
  </table>
</div>
```

```tsx live example=striped
<DataTable
  caption="المدفوعات الأخيرة"
  emptyMessage="لا توجد مدفوعات."
  locale="ar"
  variant="striped"
  size="sm"
  columns={[
    { key: 'receipt', label: 'الإيصال', sortable: true },
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
<DataTable
  caption="المدفوعات الأخيرة"
  empty-message="لا توجد مدفوعات."
  locale="ar"
  variant="striped"
  size="sm"
  :columns="[
    { key: 'receipt', label: 'الإيصال', sortable: true },
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
template: `<hw-data-table
  caption="المدفوعات الأخيرة"
  emptyMessage="لا توجد مدفوعات."
  locale="ar"
  variant="striped"
  size="sm"
  [columns]="[
    { key: 'receipt', label: 'الإيصال', sortable: true },
    { key: 'description', label: 'الوصف' },
  ]"
  [rows]="[
    { receipt: 'إيصال-201', description: 'رسوم نسخة من مستند' },
    { receipt: 'إيصال-202', description: 'رسوم تغيير العنوان' },
    { receipt: 'إيصال-203', description: 'رسوم تحديث الملف الشخصي' },
  ]"
/>`
```

### جدول فارغ

عندما تكون `rows` فارغة، يحتفظ الجدول بترويسته ويعرض `emptyMessage` في خلية واحدة تمتد على كل الأعمدة. وتخبر الرسالة القارئ بسبب خلوّ الجدول مما يُعرض.

```html live example=empty static differences=data-table-adapter-markup,data-table-sort-indicator
<div class="hw-table-wrap hw-data-table" tabindex="0" role="region" aria-labelledby="empty-caption" data-hw="data-table" data-hw-locale="ar">
  <table class="hw-table">
    <caption id="empty-caption">طلبات الخدمات المفتوحة</caption>
    <thead>
      <tr>
        <th scope="col" data-hw-key="reference"><button class="hw-button" type="button" data-variant="ghost" data-size="md" data-hw-sort="reference">الرقم المرجعي<span class="hw-table-sort-icon" aria-hidden="true"></span></button></th>
        <th scope="col">الخدمة</th>
      </tr>
    </thead>
    <tbody><tr><td colspan="2">ليس لديك طلبات خدمات مفتوحة.</td></tr></tbody>
  </table>
</div>
```

```tsx live example=empty
<DataTable
  caption="طلبات الخدمات المفتوحة"
  emptyMessage="ليس لديك طلبات خدمات مفتوحة."
  locale="ar"
  columns={[
    { key: 'reference', label: 'الرقم المرجعي', sortable: true },
    { key: 'service', label: 'الخدمة' },
  ]}
  rows={[]}
/>
```

```vue live example=empty
<DataTable
  caption="طلبات الخدمات المفتوحة"
  empty-message="ليس لديك طلبات خدمات مفتوحة."
  locale="ar"
  :columns="[
    { key: 'reference', label: 'الرقم المرجعي', sortable: true },
    { key: 'service', label: 'الخدمة' },
  ]"
  :rows="[]"
/>
```

```ts live example=empty framework=angular
template: `<hw-data-table
  caption="طلبات الخدمات المفتوحة"
  emptyMessage="ليس لديك طلبات خدمات مفتوحة."
  locale="ar"
  [columns]="[
    { key: 'reference', label: 'الرقم المرجعي', sortable: true },
    { key: 'service', label: 'الخدمة' },
  ]"
  [rows]="[]"
/>`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createDataTable

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `locale` | `string` | `false` | — |
| `onSortKeyChange` | `(key: string) => void` | `false` | — |
| `onSortDirectionChange` | `(direction: 'ascending' \| 'descending') => void` | `false` | — |

تأخذ الدالة `createDataTable(root, options)` غلافًا أو عنصر `table` أصليًا له متن. وتحمل الترويسة القابلة للفرز `data-hw-key` بمفتاح عمودها، وتضمّ زرًا يحمل `data-hw-sort` بالمفتاح نفسه؛ ويضبط المتحكم نطاق الترويسة، ويضع عليها `aria-sort` لا تذكر أي ترتيب. والخيار `locale` مطلوب عندما يكون أحد الأعمدة قابلًا للفرز، ويُكتب وسمًا بمعيار BCP 47، ويمكن أيضًا كتابته في الخاصية `data-hw-locale` على الجذر؛ ودونه تبقى الصفوف بترتيب المصدر. والعمود الذي يحوي أرقامًا تحمل ترويسته `data-hw-type` بالقيمة `number`، ويمكن أن تذكر الخلية قيمة فرزها في `data-hw-sort-value`. ويُرجع المتحكم `sortKey` و`sortDirection` و`sort(key, direction)` و`destroy()`. ويفرز تفعيلُ زر الفرز تصاعديًا، ويعكس تفعيلُ الزر نفسه مرة أخرى اتجاه الفرز. ويُعاد ترتيب الصفوف بنقل عُقد الصفوف المكتوبة في الترميز، فيُحفظ ترميز الصف ومستمعاته، والفرز مستقر. وتُستدعى `onSortKeyChange` عندما يتغيّر المفتاح، و`onSortDirectionChange` عندما يتغيّر اتجاه الفرز. ويُرسل المتحكم أيضًا الحدث `hw:change` وفي تفاصيله `sortKey` و`sortDirection`. وأنهِ المتحكم لاستعادة الترتيب الأصلي للصفوف.

### React

جدول: خصائص DataTable

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `variant` | `'default' \| 'striped' \| 'bordered'` | `false` | — |
| `size` | `'sm' \| 'md' \| 'lg'` | `false` | — |
| `data-variant` | `string` | `false` | — |
| `data-size` | `string` | `false` | — |
| `wrapperProps` | `HTMLAttributes<HTMLDivElement>` | `false` | — |
| `columns` | `readonly DataTableColumn<Row>[]` | `true` | — |
| `rows` | `readonly Row[]` | `true` | — |
| `caption` | `ReactNode` | `true` | — |
| `rowKey` | `(row: Row, index: number) => Key` | `false` | — |
| `sortKey` | `string` | `false` | — |
| `defaultSortKey` | `string` | `false` | — |
| `onSortKeyChange` | `(key: string) => void` | `false` | — |
| `sortDirection` | `'ascending' \| 'descending'` | `false` | — |
| `defaultSortDirection` | `'ascending' \| 'descending'` | `false` | — |
| `onSortDirectionChange` | `(direction: 'ascending' \| 'descending') => void` | `false` | — |
| `locale` | `string` | `true` | — |
| `emptyMessage` | `ReactNode` | `true` | — |
| `getSortLabel` | `(column: DataTableColumn<Row>, direction: 'ascending' \| 'descending') => string` | `false` | — |

الخصائص `caption` و`columns` و`rows` و`locale` و`emptyMessage` مطلوبة. وللعمود `key` و`label`، ويمكن أن يحمل `sortable` و`rowHeader` ودالة `cell` تتلقى الصف وموضعه؛ ودون `cell` تُطبع القيمة نصًا. وللفرز جزءان يُبلَّغ عن كل منهما على حدة: مرّر `sortKey` مع `onSortKeyChange` و`sortDirection` مع `onSortDirectionChange` لجدول متحكَّم فيه، أو `defaultSortKey` و`defaultSortDirection` لجدول غير متحكَّم فيه. والسلسلة النصية الفارغة مفتاحًا تعني عدم الفرز، واتجاه الفرز المطبَّق افتراضيًا هو `'ascending'`. ولا تُستدعى أي دالة استدعاء إلا عندما تتغيّر قيمتها هي. وتُفرز الصفوف في نسخة، فلا تتغيّر مصفوفة التطبيق. وليس لـ`locale` قيمة افتراضية: فدونها تبقى الصفوف بترتيب المصدر، ويُسجَّل تحذير في بيئة التطوير. وتسمّي `getSortLabel` زر الفرز، وتتلقى اتجاه الفرز الذي سيطبّقه الزر؛ ودونها تسمّي تسميةُ العمود الزرَّ. وتُرجع `rowKey` مفتاح الصف؛ ودونها يكون فهرس الصف هو المفتاح. وتكتب `variant` و`size` الخاصيتين `data-variant` و`data-size` على الجدول، وتصل الخصائص الأخرى إلى الجدول الأصلي؛ وتصل `wrapperProps` إلى الغلاف.

### Vue

جدول: خصائص DataTable وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `variant` | prop | `'default' \| 'striped' \| 'bordered'` | `false` | — |
| `size` | prop | `'sm' \| 'md' \| 'lg'` | `false` | — |
| `wrapperProps` | prop | `Record<string, unknown>` | `false` | — |
| `emptyMessage` | prop | `string` | `true` | — |
| `columns` | prop | `readonly DataColumn[]` | `true` | — |
| `rows` | prop | `readonly Record<string, unknown>[]` | `true` | — |
| `caption` | prop | `string` | `true` | — |
| `sortKey` | prop | `string` | `false` | — |
| `defaultSortKey` | prop | `string` | `false` | `''` |
| `sortDirection` | prop | `'ascending' \| 'descending'` | `false` | — |
| `defaultSortDirection` | prop | `'ascending' \| 'descending'` | `false` | `'ascending'` |
| `locale` | prop | `string` | `true` | — |
| `rowKey` | prop | `(row: Record<string, unknown>, index: number) => string \| number` | `false` | — |
| `getSortLabel` | prop | `(column: DataColumn, direction: 'ascending' \| 'descending') => string` | `false` | — |
| `update:sortKey` | event | `(value: string) => void` | `false` | — |
| `update:sortDirection` | event | `(value: 'ascending' \| 'descending') => void` | `false` | — |
| `cell-<key>` | slot | — | `false` | — |

اربط مفتاح الفرز واتجاه الفرز عبر `v-model` لجدول متحكَّم فيه، بربط لكل منهما؛ وتضبط `defaultSortKey` و`defaultSortDirection` الحالة الأولية، ولا يُرسل المكوّن أي حدث تحديث إلا عندما تتغيّر قيمته. والخصائص `caption` و`columns` و`rows` و`locale` و`emptyMessage` مطلوبة. وللعمود `key` و`label`، ويمكن أن يحمل `sortable` و`rowHeader` ودالة `cell` تتلقى الصف وموضعه. ويتلقى المنفذ ذو النطاق (scoped slot) المسمّى `cell-<key>` الصف وموضعه والعمود، ويتقدّم على `cell`. والفرز مستقر، ويستخدم `locale` التي يوفّرها التطبيق، ولا يغيّر المصفوفة `rows`؛ ودون `locale` تحتفظ الصفوف بترتيب المصدر. وتسمّي `getSortLabel` زر الفرز، وتتلقى اتجاه الفرز الذي سيطبّقه الزر؛ ودونها تسمّي تسميةُ العمود الزرَّ، وتحمل `aria-sort` الحالة. وتُرجع `rowKey` مفتاح الصف.

### Angular

جدول: مُدخلات hw-data-table ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `rowKey` | input | `(row: Row, index: number) => string \| number` | `false` | — |
| `caption` | input | `string` | `true` | — |
| `columns` | input | `readonly HwDataColumn<Row>[]` | `false` | `[]` |
| `rows` | input | `readonly Row[]` | `false` | `[]` |
| `locale` | input | `string` | `true` | — |
| `emptyMessage` | input | `string` | `true` | — |
| `sortKey` | input | `string` | `false` | `''` |
| `sortDirection` | input | `'ascending' \| 'descending'` | `false` | `'ascending'` |
| `variant` | input | `'default' \| 'striped' \| 'bordered'` | `false` | — |
| `size` | input | `'sm' \| 'md' \| 'lg'` | `false` | — |
| `getSortLabel` | input | `(column: HwDataColumn<Row>, direction: 'ascending' \| 'descending') => string` | `false` | — |
| `sortKeyChange` | output | `string` | `false` | — |
| `sortDirectionChange` | output | `'ascending' \| 'descending'` | `false` | — |

يُطبَّق `HwDataTableComponent` على `hw-data-table`. اربط `[(sortKey)]` و`[(sortDirection)]` ربطًا ثنائي الاتجاه؛ والقيم المكتوبة مرة واحدة هي الحالة الأولية. ويُرسل تفعيلُ ترويسة قابلة للفرز المُخرج `sortKeyChange` عندما يتغيّر المفتاح، ثم `sortDirectionChange` عندما يتغيّر اتجاه الفرز. وللعمود `key` و`label`، ويمكن أن يحمل `sortable` و`rowHeader` و`cell`، وهو قالب يضمّ سياقه الصفَّ قيمةً ضمنية، وموضعه، والعمود؛ ويُعرض القالب داخل `td`، أو داخل `th` لترويسة الصف، ودونه تكون القيمة نصًا. والمُدخل `locale` مطلوب وليس له قيمة افتراضية، لأن الصفوف تُفرز بأداة مقارنة نصية (collator). وتسمّي `getSortLabel` زر الفرز، وتتلقى اتجاه الفرز الذي سيطبّقه الزر. وتصل `aria-label` و`aria-labelledby` و`aria-describedby` المكتوبة على `hw-data-table` إلى الجدول.

## إمكانية الوصول

جدول البيانات عنصر `table` أصلي، فيوفّر المتصفح أدواره والتنقل فيه للتقنيات المساعدة. وعنوان الجدول `caption` هو الاسم الظاهر للجدول، وهو أيضًا، عبر `aria-labelledby`، اسم الغلاف، وهو منطقة قابلة للتركيز.

- الترويسة القابلة للفرز عنصر `th` نطاقه col، تذكر الخاصية `aria-sort` فيه ترتيب العمود أو أنه غير مفروز، وزر الفرز عنصر `button` أصلي داخله. وتلوّن الأنماط المضمّنة في الحزم الترويسة التي قيمة `aria-sort` فيها `ascending` أو `descending`. وفي React وVue وAngular يضمّ زر الفرز عنصر `hw-icon` يختار المحوّل قيمة `data-icon` فيه بحسب حالة الفرز؛ وفي ترميز متحكم JavaScript يرسم عنصر `span` بالصنف `hw-table-sort-icon` داخل الزر السهمَ بحسب `aria-sort`. والسهم مخفي عن التقنيات المساعدة، فتحمل `aria-sort` المعنى.
- دون `getSortLabel` يكون الاسم الميسّر لزر الفرز هو تسمية العمود. وعند تمريرها يذكر الاسم الترتيب الذي سيطبّقه التفعيل.
- الصف الفارغ خلية واحدة تمتد على كل الأعمدة، فتُقرأ الرسالة في موضع البيانات.
- لا ينقل الفرز التركيز، فيبقى التركيز على الزر الذي فُعِّل.
- لا يغيّر الفرز إلا ترتيب الصفوف؛ فلا يضيف تحديدًا ولا تحريرًا، ويبقى التحميل وترقيم الصفحات والتصفية من سلوك التطبيق.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: جدول بيانات

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز إلى العنصر التالي القابل للتركيز بترتيب الصفحة: غلاف الجدول، ثم كل زر فرز. |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | يفعّل زر الفرز الذي عليه التركيز، فيفرز الصفوف بحسب عموده. |

لا يعرّف جدول البيانات أي مفاتيح أخرى. وأزرار الفرز أزرار أصلية، فتتبع المفاتيح سلوك المتصفح.

## الاتجاه والتوطين

ليس في جدول البيانات نص مدمج: يكتب التطبيق عنوان الجدول وتسميات الأعمدة وقيم الخلايا و`emptyMessage` وتسميات الفرز بلغة الصفحة. ويرث الجدول لغة الصفحة واتجاهها، ويضع الجدول الأصلي العمود الأول في بداية القراءة، ففي صفحة اتجاهها من اليمين إلى اليسار يكون العمود الأول على اليمين. وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية للحشوة والحدود والمحاذاة.

- `locale` وسم لغة بمعيار BCP 47 يوفّره التطبيق، وتُفرز الصفوف بأداة مقارنة نصية لهذا الوسم. وليس له قيمة افتراضية: فترتيب النص العربي يتوقف على الوسم الذي يمرّره التطبيق، مثل ar أو ar-SA.
- يفرز متحكم vanilla نص الخلية، أو قيمة `data-hw-sort-value` فيها، ويفرز الأرقام في عمود ترويسته معلَّمة بأنها رقمية بعد أن يقرأ الأرقام العربية المشرقية أرقامًا. وتفرز محوّلات أطر العمل قيمة الصف للمفتاح.
- ينسّق التطبيق التواريخ والعملات والأرقام في الخلية بحسب الإعدادات المحلية للصفحة؛ ولا ينسّق المكوّن أي قيمة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط جدول البيانات بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات الجداول](../nic-tables.md) الحدود ونصف قطر الزوايا والترويسة وتباعد الخلايا، الواردة في ورقة أنماط كود المنصات المزوَّدة، وتشمل الملاحظات جدول البيانات أيضًا.
- سلوك الفرز وسهم الفرز امتدادان من هوية؛ وتسجّلهما [ملاحظات الجداول](../nic-tables.md) بهذه الصفة.
