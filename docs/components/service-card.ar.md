---
source:
  summary: c9c66c04bf57
  example: 2d6df14653fd
  variants-and-states: 4b004446f138
  api: 8245bb05c02e
  accessibility: 9c5a870455db
  rtl-and-localisation: 9137995da2a3
  platforms-code-reference: 351b5723c743
---
# بطاقة خدمة

تلخّص بطاقة الخدمة خدمةً واحدة في عنصر `article` يضمّ عنوانًا مع تصنيف اختياري، ووصفًا، وقائمة معلومات، وإجراءً واحدًا. ويتولّى التطبيق الوجهة والإجراء، ولا تبدأ البطاقة الخدمة بنفسها.

## مثال

يسمّي العنوانُ الخدمة. ويساعد التصنيف والوصف والمعلومات القارئَ على المقارنة بين الخدمات في قائمة، ويحمل رابط الإجراء اسمًا يذكر الخدمة.

```html live example=basic differences=service-card-angular-variant-icon
<article class="hw-card hw-service-card">
  <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">المستندات</span><h3>نسخة من مستند</h3></div></header>
  <div class="hw-card-body">
    <p>اطلب نسخة طبق الأصل من مستند محفوظ في سجلك.</p>
    <dl class="hw-description-list"><div><dt>المدة</dt><dd>3 أيام</dd></div><div><dt>الرسوم</dt><dd>مجانًا</dd></div></dl>
  </div>
  <footer class="hw-card-footer"><a class="hw-link" href="/services/document-copy">طلب نسخة من مستند</a></footer>
</article>
```

```tsx live example=basic
<ServiceCard
  title="نسخة من مستند"
  category="المستندات"
  description="اطلب نسخة طبق الأصل من مستند محفوظ في سجلك."
  metadata={[
    { term: 'المدة', description: '3 أيام' },
    { term: 'الرسوم', description: 'مجانًا' },
  ]}
  href="/services/document-copy"
  actionLabel="طلب نسخة من مستند"
/>
```

```vue live example=basic
<ServiceCard
  title="نسخة من مستند"
  category="المستندات"
  description="اطلب نسخة طبق الأصل من مستند محفوظ في سجلك."
  :metadata="[
    { term: 'المدة', description: '3 أيام' },
    { term: 'الرسوم', description: 'مجانًا' },
  ]"
  href="/services/document-copy"
  action-label="طلب نسخة من مستند"
/>
```

```ts live example=basic framework=angular
template: `<hw-service-card
  title="نسخة من مستند"
  category="المستندات"
  description="اطلب نسخة طبق الأصل من مستند محفوظ في سجلك."
  [metadata]="[
    { term: 'المدة', description: '3 أيام' },
    { term: 'الرسوم', description: 'مجانًا' },
  ]"
  href="/services/document-copy"
  actionLabel="طلب نسخة من مستند"
/>`
```

## الأشكال والحالات

### الأيقونة

تبيّن أيقونة في الترويسة نوع الخدمة. وتخفيها البطاقة عن التقنيات المساعدة، فلا تحمل معنى بذاتها: العنوان والتصنيف هما اللذان يسمّيان الخدمة.

```html live example=icon differences=service-card-angular-variant-icon
<article class="hw-card hw-service-card">
  <header class="hw-card-header"><div class="hw-service-card-icon" aria-hidden="true"><span class="hw-icon" data-icon="file-01"></span></div><div><span class="hw-badge" data-tone="neutral">المستندات</span><h3>حالة المستند</h3></div></header>
  <div class="hw-card-body">
    <p>استعلم عن حالة طلب مستند.</p>
  </div>
  <footer class="hw-card-footer"><a class="hw-link" href="/services/document-status">الاستعلام عن حالة طلب مستند</a></footer>
</article>
```

```tsx live example=icon
<ServiceCard
  title="حالة المستند"
  category="المستندات"
  description="استعلم عن حالة طلب مستند."
  icon={<span className="hw-icon" data-icon="file-01" />}
  href="/services/document-status"
  actionLabel="الاستعلام عن حالة طلب مستند"
/>
```

```vue live example=icon
<ServiceCard
  title="حالة المستند"
  category="المستندات"
  description="استعلم عن حالة طلب مستند."
  href="/services/document-status"
  action-label="الاستعلام عن حالة طلب مستند"
>
  <template #icon><span class="hw-icon" data-icon="file-01"></span></template>
</ServiceCard>
```

```ts live example=icon framework=angular
template: `<hw-service-card
  title="حالة المستند"
  category="المستندات"
  description="استعلم عن حالة طلب مستند."
  href="/services/document-status"
  actionLabel="الاستعلام عن حالة طلب مستند"
>
  <span hwServiceIcon class="hw-icon" data-icon="file-01"></span>
</hw-service-card>`
```

### إجراء مخصّص

تحمل البطاقة إجراءً واحدًا. وعندما يكون الإجراء أمرًا لا وجهة، يوفّره التطبيق بدلًا من `href`: عنصر `footer` بالصنف `hw-card-footer` يحتوي على العنصر في ترميز vanilla، وخاصية المكوّن `action` في React، والمنفذ `action` في Vue، والمحتوى الذي يحمل `hwServiceAction` في Angular. استخدم رابطًا للوجهة وزرًا للأمر.

```html live example=action differences=service-card-angular-variant-icon
<article class="hw-card hw-service-card">
  <header class="hw-card-header"><div><h3>تحديث الملف الشخصي</h3></div></header>
  <div class="hw-card-body">
    <p>حدّث بيانات التواصل في ملفك الشخصي.</p>
  </div>
  <footer class="hw-card-footer"><button class="hw-button" type="button" data-variant="secondary" data-size="md">بدء التحديث</button></footer>
</article>
```

```tsx live example=action
<ServiceCard
  title="تحديث الملف الشخصي"
  description="حدّث بيانات التواصل في ملفك الشخصي."
  action={<Button variant="secondary">بدء التحديث</Button>}
/>
```

```vue live example=action
<ServiceCard title="تحديث الملف الشخصي" description="حدّث بيانات التواصل في ملفك الشخصي.">
  <template #action><Button variant="secondary">بدء التحديث</Button></template>
</ServiceCard>
```

```ts live example=action framework=angular
template: `<hw-service-card title="تحديث الملف الشخصي" description="حدّث بيانات التواصل في ملفك الشخصي.">
  <button hwButton hwServiceAction variant="secondary">بدء التحديث</button>
</hw-service-card>`
```

### دون إجراء

ليس للبطاقة التي لا تحمل `href` ولا إجراءً محتوى في التذييل. فلا يعرض ترميز vanilla ومكوّنا React وVue تذييلًا، ويعرض مكوّن Angular تذييلًا فارغًا تخفيه ورقة الأنماط. استخدم البطاقة على هذا النحو عندما يقتصر دورها على عرض المعلومات.

```html live example=informational differences=service-card-angular-variant-icon
<article class="hw-card hw-service-card">
  <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">الطلبات</span><h3>متابعة الطلبات</h3></div></header>
  <div class="hw-card-body">
    <p>لكل طلب رقم مرجعي يميّزه في كل رسالة.</p>
  </div>
</article>
```

```tsx live example=informational
<ServiceCard
  title="متابعة الطلبات"
  category="الطلبات"
  description="لكل طلب رقم مرجعي يميّزه في كل رسالة."
/>
```

```vue live example=informational
<ServiceCard
  title="متابعة الطلبات"
  category="الطلبات"
  description="لكل طلب رقم مرجعي يميّزه في كل رسالة."
/>
```

```ts live example=informational framework=angular
template: `<hw-service-card
  title="متابعة الطلبات"
  category="الطلبات"
  description="لكل طلب رقم مرجعي يميّزه في كل رسالة."
/>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-service-card

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-service-card'` | `true` | — |
| `data-variant` | `'compact' \| 'featured'` | `false` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس لبطاقة الخدمة متحكم في JavaScript، فالترميز هو واجهتها البرمجية: اكتب عنصر `article` بالصنفين `hw-card` و`hw-service-card`، وعنصر `header` بالصنف `hw-card-header`، وعنصر `div` بالصنف `hw-card-body`، وللإجراء عنصر `footer` بالصنف `hw-card-footer`. والتصنيف عنصر `span` بالصنف `hw-badge` يسبق عنصر العنوان من المستوى الثالث داخل الترويسة، والعنوان ليس رابطًا. والمعلومات عنصر قائمة وصفية بالصنف `hw-description-list`، والأيقونة عنصر `div` بالصنف `hw-service-card-icon` يحتوي على أيقونة من أيقونات الحزم، ويكتب المطوّر عليه الخاصية `aria-hidden="true"` بنفسه. والخاصية `data-variant` اختيارية: تقلّل القيمة `compact` المسافات، وتميّز القيمة `featured` البطاقة باللون الأساسي. ودون هذه الخاصية يكون للبطاقة المظهر الافتراضي.

### React

جدول: خصائص ServiceCard

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `title` | `ReactNode` | `true` | — |
| `description` | `ReactNode` | `false` | — |
| `category` | `ReactNode` | `false` | — |
| `metadata` | `readonly DescriptionItem[]` | `false` | — |
| `icon` | `ReactNode` | `false` | — |
| `variant` | `'default' \| 'flat' \| 'elevated' \| 'outlined' \| 'ghost'` | `false` | — |
| `href` | `string` | `false` | — |
| `target` | `string` | `false` | — |
| `rel` | `string` | `false` | — |
| `disabled` | `boolean` | `false` | — |
| `action` | `ReactNode` | `false` | — |
| `actionLabel` | `string` | `false` | — |

الخاصية `title` مطلوبة، ويُعرض عنوان البطاقة في عنصر عنوان من المستوى الثالث. ولكل بند من `metadata` الحقلان `term` و`description`، ولا تعرض البطاقة قائمة وصفية إلا عندما تحتوي المصفوفة على بنود. وعند كتابة `href` تعرض البطاقة في التذييل رابطًا نصُّه الكامل واسمه الميسّر هما قيمة `actionLabel`، وهذه الخاصية مطلوبة في هذه الحالة؛ ولا تضيف البطاقة إلى النص شيئًا، فاذكر فيه اسم الخدمة عندما تجتمع عدة بطاقات في صفحة واحدة. وتحلّ الخاصية `action` محلّ هذا الرابط وتتقدّم عليه. وتُعرض العناصر الأبناء في المتن بعد الوصف والمعلومات. وتقبل الخاصية `variant` المظاهر `'default'` و`'flat'` و`'elevated'` و`'outlined'` و`'ghost'`، وتقبل البطاقة أيضًا الخصائص الأخرى للمكوّن Card، مثل `className` و`target` و`rel` و`disabled`. ولأن البطاقة تأخذ `href` لرابط الإجراء، فإنها تعرض عنصر `article`: فتُكتب `target` و`rel` على عنصر `article` ولا تصلان إلى رابط الإجراء، وتكتب `disabled` الخاصية `data-disabled="true"` على عنصر `article`.

### Vue

جدول: خصائص ServiceCard وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `title` | prop | `string` | `true` | — |
| `description` | prop | `string` | `false` | — |
| `href` | prop | `string` | `false` | — |
| `actionLabel` | prop | `string` | `false` | — |
| `category` | prop | `string` | `false` | — |
| `metadata` | prop | `readonly DescriptionItem[]` | `false` | — |
| `icon` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |
| `action` | slot | — | `false` | — |

تعرض الخاصية `category` شارة محايدة قبل العنوان، وتعرض الخاصية `metadata` في المتن قائمة وصفية متراصّة، يقع فيها كل وصف تحت مصطلحه، ولا تعرضها إلا عندما تحتوي على بنود؛ ولكل بند الحقلان `term` و`description`. وعند كتابة `href` دون المنفذ `action` تعرض البطاقة رابطًا في التذييل، والخاصية `actionLabel` مطلوبة في هذه الحالة. ويملأ المنفذ `icon` منطقة الأيقونة في الترويسة، ويضيف المنفذ الافتراضي محتوى إلى المتن، ويحلّ المنفذ `action` محلّ الرابط. ولا تعرض البطاقة تذييلًا إذا غاب `href` والمنفذ `action` معًا.

### Angular

جدول: مُدخلات hw-service-card ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `title` | input | `string` | `true` | — |
| `href` | input | `string` | `false` | `''` |
| `description` | input | `string` | `false` | `''` |
| `category` | input | `string` | `false` | `''` |
| `metadata` | input | `readonly HwDescription[]` | `false` | `[]` |
| `actionLabel` | input | `string` | `false` | `''` |
| `variant` | input | `string` | `false` | `'default'` |
| `[hwServiceIcon]` | content | — | `false` | — |
| `*` | content | — | `false` | — |
| `[hwServiceAction]` | content | — | `false` | — |

يُطبَّق `HwServiceCardComponent` على `hw-service-card`. ويُعرض عنوان البطاقة في عنصر عنوان من المستوى الثالث، وهو نص لا رابط. وعند كتابة `href` غير فارغ ودون محتوى مُسقَط يحمل `[hwServiceAction]`، تعرض البطاقة رابطًا نصُّه الكامل واسمه الميسّر هما قيمة `actionLabel`، وهذا المُدخل مطلوب في هذه الحالة وحدها؛ واذكر فيه اسم الخدمة عندما تجتمع عدة بطاقات في صفحة واحدة. ويملأ المحتوى الذي يحمل `hwServiceIcon` منطقة الأيقونة، ويُضاف المحتوى الآخر إلى المتن، ويحلّ المحتوى الذي يحمل `hwServiceAction` محلّ الرابط؛ وللإبقاء على مظهر الزر لوجهة ما، أسقِط عنصر رابط يحمل `hwServiceAction` ويأخذ مظهر الزر في المكتبة، مع `href` الخاص به، وأسقِط عنصر `button` يحمل `hwServiceAction` للأمر. ودون `href` ودون محتوى إجراء مُسقَط يكون التذييل فارغًا، وتخفيه ورقة الأنماط. ويُكتب المُدخل `variant` في الخاصية `data-variant` لعنصر `article`.

## إمكانية الوصول

تعرض بطاقة الخدمة عنصر `article` تضمّ ترويسته عنوان البطاقة في عنصر عنوان من المستوى الثالث. وليست البطاقة بكاملها عنصرًا تفاعليًا: فالإجراء الوحيد في التذييل رابط أصلي أو العنصر الذي يوفّره التطبيق، فيكون استخدام لوحة المفاتيح والتفعيل بحسب ذلك العنصر.

- العنوان ليس رابطًا. ولا يقبل التركيز افتراضيًا إلا الإجراء. وقيمة `actionLabel` هي الاسم الميسّر للرابط الذي تعرضه البطاقة؛ وللإجراء الذي يوفّره التطبيق اسمه الخاص، ويمكن أن يضيف المحتوى الذي يضعه التطبيق في المتن عناصر قابلة للتركيز خاصة به.
- اكتب اسم رابط يذكر الخدمة، مثل «طلب نسخة من مستند»، لأن البطاقة لا تضيف إليه شيئًا. فالبطاقات المتعددة التي يكون نص رابط كل منها «تقديم الطلب» لا تتيح لمن يتصفّح قائمة الروابط أي وسيلة للتمييز بينها.
- منطقة الأيقونة مخفية عن التقنيات المساعدة. فلا تعتمد على الأيقونة لنقل تصنيف الخدمة أو حالتها.
- المعلومات عنصر قائمة وصفية: يقع كل مصطلح مع وصفه في مجموعة واحدة من القائمة.
- للبطاقة إجراء واحد. ضع الإجراءات الأخرى في الصفحة، أو افتح صفحة تفاصيل الخدمة من الإجراء.
- عنوان البطاقة عنصر عنوان من المستوى الثالث، فضع البطاقات تحت عنوان من المستوى الثاني في الصفحة للحفاظ على ترتيب العناوين.

> [!NOTE]
> شارة التصنيف محايدة. اذكر حالة الخدمة بالكلمات في الوصف أو في المعلومات، مثل عدم إتاحتها أو إيقافها.

## الاتجاه والتوطين

ليس في بطاقة الخدمة نص مدمج: يكتب التطبيق العنوان والتصنيف والوصف والمعلومات ونص الإجراء كلها بلغة الصفحة. وتتبع البطاقة اتجاه الصفحة عبر خصائص CSS المنطقية، فتبدأ الترويسة والأيقونة وإجراء التذييل من جهة بدء القراءة، في العربية وفي الإنجليزية.

- اكتب مصطلحات المعلومات وأوصافها بلغة البطاقة؛ فالبطاقة لا تترجمها ولا تعيد ترتيبها.
- تبقى القيمة، مثل الرسوم أو المدة، في نص `description` الخاص بها، فيتحكم التطبيق في أرقامها ووحداتها.
- في شبكة من البطاقات، اجعل المعلومات بالترتيب نفسه في كل بطاقة ليتمكّن القارئ من المقارنة بينها.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط بطاقة الخدمة بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تُدرج بطاقة الخدمة في الصف Platform patterns من نطاق المكوّنات في [ملاحظات التغطية](../coverage.md). وتتألف من البطاقة والشارة والقائمة الوصفية والرابط في المكتبة.
- تستند أجزاء المكوّن إلى بنية البطاقة الواردة في [ملاحظات البطاقات](../nic-cards.md): ترويسة، ومتن، وتذييل فيه إجراء ظاهر في البطاقة التي تحمل إجراءً. وتصف الملاحظات المكوّن Card، ولا تسجّل بطاقة الخدمة أدلة تحقق خاصة بها.
