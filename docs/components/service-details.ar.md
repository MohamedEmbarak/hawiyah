---
source:
  summary: b45654b7f495
  example: 19b5f3c26c4b
  variants-and-states: 9f977e42c3a9
  api: 2b5457cf1303
  accessibility: a93ee59f8896
  rtl-and-localisation: 1cd5305b9da2
  platforms-code-reference: 8a03aa579e41
---
# تفاصيل الخدمة

تعرض تفاصيل الخدمة خدمةً واحدة كاملة في عنصر `article`: عنوانًا مع وصف، وقائمة معلومات، وقائمة متطلبات، ومحتوى إضافيًا، وإجراءً واحدًا. ويتولّى التطبيق المتطلبات والإجراء.

## مثال

يسمّي العنوانُ الخدمة، وتذكر المعلومات والمتطلبات ما يحتاج إليه القارئ قبل البدء. ويقع الإجراء في الآخر، في التذييل.

```html live example=basic
<article class="hw-service-details">
  <header><h2>نسخة من مستند</h2><p>اطلب نسخة طبق الأصل من مستند محفوظ في سجلك.</p></header>
  <dl class="hw-description-list"><div><dt>المدة</dt><dd>3 أيام</dd></div><div><dt>الرسوم</dt><dd>مجانًا</dd></div></dl>
  <section><h3>المتطلبات</h3><ul><li>وثيقة إثبات الهوية</li><li>الرقم المرجعي للمستند</li></ul></section>
  <footer><button class="hw-button" type="button" data-variant="primary" data-size="md">طلب نسخة</button></footer>
</article>
```

```tsx live example=basic
<ServiceDetails
  title="نسخة من مستند"
  description="اطلب نسخة طبق الأصل من مستند محفوظ في سجلك."
  metadata={[
    { term: 'المدة', description: '3 أيام' },
    { term: 'الرسوم', description: 'مجانًا' },
  ]}
  requirementsLabel="المتطلبات"
  requirements={['وثيقة إثبات الهوية', 'الرقم المرجعي للمستند']}
  action={<Button>طلب نسخة</Button>}
/>
```

```vue live example=basic
<ServiceDetails
  title="نسخة من مستند"
  description="اطلب نسخة طبق الأصل من مستند محفوظ في سجلك."
  :metadata="[
    { term: 'المدة', description: '3 أيام' },
    { term: 'الرسوم', description: 'مجانًا' },
  ]"
  requirements-label="المتطلبات"
  :requirements="['وثيقة إثبات الهوية', 'الرقم المرجعي للمستند']"
>
  <template #action><Button>طلب نسخة</Button></template>
</ServiceDetails>
```

```ts live example=basic framework=angular
template: `<hw-service-details
  title="نسخة من مستند"
  description="اطلب نسخة طبق الأصل من مستند محفوظ في سجلك."
  [metadata]="[
    { term: 'المدة', description: '3 أيام' },
    { term: 'الرسوم', description: 'مجانًا' },
  ]"
  requirementsLabel="المتطلبات"
  [requirements]="['وثيقة إثبات الهوية', 'الرقم المرجعي للمستند']"
>
  <button hwButton hwServiceAction>طلب نسخة</button>
</hw-service-details>`
```

## الأشكال والحالات

### محتوى إضافي

يُعرض المحتوى الذي يضعه التطبيق داخل المكوّن بعد المتطلبات وقبل التذييل. استخدمه لملاحظة أو لنص لا تشمله الأجزاء الأخرى.

```html live example=content
<article class="hw-service-details">
  <header><h2>تحديث الملف الشخصي</h2><p>حدّث بيانات التواصل في ملفك الشخصي.</p></header>
  <p>تسري التغييرات بعد تأكيدها.</p>
  <footer><button class="hw-button" type="button" data-variant="primary" data-size="md">بدء التحديث</button></footer>
</article>
```

```tsx live example=content
<ServiceDetails title="تحديث الملف الشخصي" description="حدّث بيانات التواصل في ملفك الشخصي." action={<Button>بدء التحديث</Button>}>
  <p>تسري التغييرات بعد تأكيدها.</p>
</ServiceDetails>
```

```vue live example=content
<ServiceDetails title="تحديث الملف الشخصي" description="حدّث بيانات التواصل في ملفك الشخصي.">
  <p>تسري التغييرات بعد تأكيدها.</p>
  <template #action><Button>بدء التحديث</Button></template>
</ServiceDetails>
```

```ts live example=content framework=angular
template: `<hw-service-details title="تحديث الملف الشخصي" description="حدّث بيانات التواصل في ملفك الشخصي.">
  <p>تسري التغييرات بعد تأكيدها.</p>
  <button hwButton hwServiceAction>بدء التحديث</button>
</hw-service-details>`
```

### متطلبات بعرض مخصّص

تتيح المحوّلات للتطبيق أن يعرض كل متطلب بنفسه، فيمكن أن يحتوي البند على رابط. فيأخذ React عُقدًا قابلة للعرض في `requirements`؛ ويأخذ Vue وAngular سلاسل نصية في `requirements`، ويعرض Vue كلًّا منها عبر المنفذ `requirement`، ويعرضها Angular عبر قالب في `requirementTemplate`. ويختار مثالا Vue وAngular الوجهة بحسب الموضع لأن فيهما بندين؛ أما في التطبيق فاقرأ الوجهة من بيانات كل بند.

```html live example=rich
<article class="hw-service-details">
  <header><h2>حالة المستند</h2><p>استعلم عن حالة طلب مستند.</p></header>
  <section><h3>قبل البدء</h3><ul><li><a class="hw-link" href="/guidance/reference-number">معرفة الرقم المرجعي</a></li><li><a class="hw-link" href="/guidance/identity">تجهيز وثيقة إثبات الهوية</a></li></ul></section>
  <footer><button class="hw-button" type="button" data-variant="primary" data-size="md">الاستعلام عن الحالة</button></footer>
</article>
```

```tsx live example=rich
<ServiceDetails
  title="حالة المستند"
  description="استعلم عن حالة طلب مستند."
  requirementsLabel="قبل البدء"
  requirements={[
    <a className="hw-link" href="/guidance/reference-number">معرفة الرقم المرجعي</a>,
    <a className="hw-link" href="/guidance/identity">تجهيز وثيقة إثبات الهوية</a>,
  ]}
  action={<Button>الاستعلام عن الحالة</Button>}
/>
```

```vue live example=rich
<ServiceDetails
  title="حالة المستند"
  description="استعلم عن حالة طلب مستند."
  requirements-label="قبل البدء"
  :requirements="['معرفة الرقم المرجعي', 'تجهيز وثيقة إثبات الهوية']"
>
  <template #requirement="{ item, index }">
    <a class="hw-link" :href="index === 0 ? '/guidance/reference-number' : '/guidance/identity'">{{ item }}</a>
  </template>
  <template #action><Button>الاستعلام عن الحالة</Button></template>
</ServiceDetails>
```

```ts live example=rich framework=angular
template: `<hw-service-details
  title="حالة المستند"
  description="استعلم عن حالة طلب مستند."
  requirementsLabel="قبل البدء"
  [requirements]="['معرفة الرقم المرجعي', 'تجهيز وثيقة إثبات الهوية']"
  [requirementTemplate]="requirement"
>
  <button hwButton hwServiceAction>الاستعلام عن الحالة</button>
</hw-service-details>
<ng-template #requirement let-item let-index="index">
  <a class="hw-link" [attr.href]="index === 0 ? '/guidance/reference-number' : '/guidance/identity'">{{ item }}</a>
</ng-template>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-service-details

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-service-details'` | `true` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس لتفاصيل الخدمة متحكم في JavaScript، فالترميز هو واجهتها البرمجية: اكتب عنصر `article` بالصنف `hw-service-details` يضمّ بهذا الترتيب: عنصر `header` فيه عنصر عنوان من المستوى الثاني وفقرة، وعنصر قائمة وصفية بالصنف `hw-description-list` للمعلومات، وعنصر `section` فيه عنصر عنوان من المستوى الثالث وعنصر `ul` للمتطلبات، ثم المحتوى الإضافي، وعنصر `footer` فيه الإجراء. والإجراء هو العنصر الذي يوفّره التطبيق، مثل عنصر `button` بالصنف `hw-button` للأمر، أو رابط للوجهة. ويُحذف الجزء الذي لا تحتاج إليه الخدمة.

### React

جدول: خصائص ServiceDetails

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `title` | `ReactNode` | `true` | — |
| `description` | `ReactNode` | `false` | — |
| `metadata` | `readonly DescriptionItem[]` | `false` | — |
| `action` | `ReactNode` | `false` | — |
| `requirements` | `readonly ReactNode[]` | `false` | — |
| `requirementsLabel` | `string` | `false` | — |

الخاصية `title` مطلوبة، وتُعرض في عنصر عنوان من المستوى الثاني. وتُعرض `description` في فقرة بعده. ولكل بند من `metadata` الحقلان `term` و`description`، ولا تُعرض القائمة الوصفية إلا عندما تحتوي المصفوفة على بنود. والخاصية `requirements` قائمة من العُقد القابلة للعرض، تُعرض قائمةً داخل عنصر `section`، ولا تُعرض إلا عندما تحتوي على بنود، والخاصية `requirementsLabel` هي عنوان ذلك القسم؛ وهي مطلوبة عند تمرير `requirements`. وتُعرض العناصر الأبناء بعد المتطلبات. وتُعرض `action` في عنصر `footer` هو الابن الأخير لعنصر `article`، ولا يُعرض إلا عند تمرير `action`. وتصل الخصائص الأخرى إلى عنصر `article`.

### Vue

جدول: خصائص ServiceDetails وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `title` | prop | `string` | `true` | — |
| `description` | prop | `string` | `false` | — |
| `metadata` | prop | `readonly DescriptionItem[]` | `false` | — |
| `requirements` | prop | `readonly string[]` | `false` | — |
| `requirementsLabel` | prop | `string` | `false` | — |
| `requirement` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |
| `action` | slot | — | `false` | — |

الخاصية `title` مطلوبة، وتُعرض في عنصر عنوان من المستوى الثاني، وتُعرض `description` في فقرة بعده. ولكل بند من `metadata` الحقلان `term` و`description`، ولا تُعرض قائمة وصفية متراصّة، يقع فيها كل وصف تحت مصطلحه، إلا عندما تحتوي الخاصية على بنود. والخاصية `requirements` قائمة من السلاسل النصية، تُعرض قائمةً داخل عنصر `section` عندما تحتوي على بنود فقط، والخاصية `requirementsLabel` هي عنوان ذلك القسم؛ وهي مطلوبة عند تمرير `requirements`. ويتلقّى المنفذ `requirement` كل سلسلة نصية بوصفها البند، وموضعها بوصفه الفهرس، ويحلّ محلّ النص العادي للبند. ويضيف المنفذ الافتراضي محتوى بعد المتطلبات، ويُعرض المنفذ `action` في عنصر `footer` هو الابن الأخير لعنصر `article`، ولا يُعرض إلا عند توفيره. وتصل خصائص HTML الأخرى إلى عنصر `article`. ويسرد الجدول المنافذ الثلاثة لأن الإصدار المنشور يقرؤها؛ ولا يعرّف التصريح نوع أي منها.

### Angular

جدول: مُدخلات hw-service-details ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `title` | input | `string` | `true` | — |
| `description` | input | `string` | `false` | `''` |
| `metadata` | input | `readonly HwDescription[]` | `false` | `[]` |
| `requirements` | input | `readonly string[]` | `false` | `[]` |
| `requirementTemplate` | input | `TemplateRef<{ $implicit: string; index: number }>` | `false` | — |
| `requirementsLabel` | input | `string` | `false` | `''` |
| `*` | content | — | `false` | — |
| `[hwServiceAction]` | content | — | `false` | — |

يُطبَّق `HwServiceDetailsComponent` على `hw-service-details`. والمُدخل `title` مطلوب، ويُعرض في عنصر عنوان من المستوى الثاني، ويُعرض `description` في فقرة بعده. ولكل بند من `metadata` الحقلان `term` و`description`، ولا تُعرض القائمة الوصفية إلا عندما يحتوي المُدخل على بنود. والمُدخل `requirements` قائمة من السلاسل النصية، تُعرض قائمةً داخل عنصر `section` عندما تحتوي على بنود فقط، والمُدخل `requirementsLabel` هو عنوان ذلك القسم؛ وهو مطلوب عند تمرير `requirements`. ويأخذ `requirementTemplate` مرجع قالب يتلقّى كل سلسلة نصية بوصفها القيمة الضمنية، وموضعها بوصفه الفهرس، ويحلّ محلّ النص العادي للبند. ويُضاف المحتوى المُسقَط الآخر بعد المتطلبات، ويُعرض المحتوى الذي يحمل `hwServiceAction` في عنصر `footer`. ويُعرض عنصر `footer` دائمًا، وتخفيه ورقة الأنماط ما دام لا إجراء مُسقَطًا. ولعرض المعلومات في صف واحد، أسقِط عنصر `hw-description-list` من المكوّن [DescriptionList](description-list.md) بشكله الأفقي محتوًى افتراضيًا؛ فيُعرض بعد المتطلبات، لا بدلًا من قائمة المُدخل `metadata`.

## إمكانية الوصول

تعرض تفاصيل الخدمة عنصر `article`. ويُعرض عنوانها في عنصر عنوان من المستوى الثاني، وعنوان المتطلبات في عنصر عنوان من المستوى الثالث، فيبقى ترتيب عناوين الصفحة سليمًا عندما يقع عنصر `article` تحت عنوان من المستوى الأول. وليس المكوّن بكامله عنصرًا تفاعليًا: فالإجراء في التذييل هو العنصر الذي يوفّره التطبيق، فيكون استخدام لوحة المفاتيح معه والتركيز عليه واسمه بحسب ذلك العنصر.

- المعلومات عنصر قائمة وصفية: يقع كل مصطلح مع وصفه في مجموعة واحدة من القائمة.
- المتطلبات قائمة تحت عنوان خاص بها، فتعلن التقنيات المساعدة عدد بنودها. اكتب `requirementsLabel` عبارةً تسمّي القائمة، مثل «المتطلبات».
- اكتب اسم الإجراء متضمّنًا اسم الخدمة عندما تجتمع عدة خدمات في صفحة واحدة؛ فالمكوّن لا يضيف إليه شيئًا.
- يحتفظ البند الذي يعرضه التطبيق بنفسه، مثل الرابط، باسمه وبسلوك التركيز الخاص به.
- ليس في المكوّن منطقة حيّة، ولا يعلن التغييرات في محتواه.

## الاتجاه والتوطين

ليس في تفاصيل الخدمة نص مدمج: يكتب التطبيق العنوان والوصف ومصطلحات المعلومات وأوصافها وعنوان المتطلبات والمتطلبات والإجراء كلها بلغة الصفحة. ويتبع عنصر `article` اتجاه الصفحة عبر خصائص CSS المنطقية، فتبدأ أجزاؤه من جهة بدء القراءة في العربية وفي الإنجليزية.

- اكتب مصطلحات المعلومات وأوصافها بلغة عنصر `article`؛ فالمكوّن لا يترجمها ولا يعيد ترتيبها.
- تبقى القيمة، مثل الرسوم أو المدة، في نص `description` الخاص بها، فيتحكم التطبيق في أرقامها ووحداتها.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط تفاصيل الخدمة بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تُدرج تفاصيل الخدمة في الصف Platform patterns من نطاق المكوّنات في [ملاحظات التغطية](../coverage.md).