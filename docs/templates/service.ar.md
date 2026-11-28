---
source:
  summary: 3d7d32e2c944
  example: 74df7ce8a3f0
  composition: 2a1d19f7c5e3
  platforms-code-reference: dc70e33f91cd
---
# الخدمة

قالب الخدمة هو صفحة خدمة واحدة: عنوان صفحة فيه اسم الخدمة ومسار التنقل، ثم معلومات الخدمة، والمستندات التي تتطلبها، وخطواتها، والإجراء الذي يبدؤها.

## مثال

يسمّي عنوانُ الصفحة الخدمةَ، ويضمّ مسار التنقل. وتذكر تفاصيل الخدمة المدة والرسوم والقناة، وتليها المستندات المطلوبة في قائمة. وتأتي خطوات الخدمة بعد المستندات، ويأتي الإجراء الذي يبدأ الخدمة أخيرًا، في تذييل تفاصيل الخدمة.

```html live example=page static frame width=390
<header class="hw-page-header">
  <nav class="hw-breadcrumb" aria-label="مسار التنقل"><ol><li><a href="/">الرئيسية</a></li><li><a href="/services">الخدمات</a></li><li><span aria-current="page">نسخة من مستند</span></li></ol></nav>
  <div class="hw-page-header-main">
    <div><h1>نسخة من مستند</h1><p>اطلب نسخة طبق الأصل من مستند محفوظ في سجلك.</p></div>
  </div>
</header>
<article class="hw-service-details">
  <header><h2>تفاصيل الخدمة</h2><p>تصدر النسخة في صيغة إلكترونية بعد الموافقة على الطلب.</p></header>
  <dl class="hw-description-list"><div><dt>المدة</dt><dd>3 أيام</dd></div><div><dt>الرسوم</dt><dd>مجانًا</dd></div><div><dt>القناة</dt><dd>إلكترونيًا</dd></div></dl>
  <section><h3>المستندات المطلوبة</h3><ul><li>وثيقة إثبات الهوية</li><li>الرقم المرجعي للمستند</li><li>خطاب تفويض، عند تقديم الطلب عن شخص آخر</li></ul></section>
  <p>للخدمة ثلاث خطوات.</p>
  <ol class="hw-timeline" aria-label="خطوات الخدمة">
    <li class="hw-timeline-item"><h3>إدخال الرقم المرجعي</h3><p>اذكر المستند الذي تطلب نسخة منه.</p></li>
    <li class="hw-timeline-item"><h3>إرفاق المستندات</h3><p>أرفق كل مستند من القائمة أعلاه.</p></li>
    <li class="hw-timeline-item"><h3>التأكيد والإرسال</h3><p>راجع الإجابات، ثم أرسل الطلب.</p></li>
  </ol>
  <footer><button class="hw-button" type="button" data-variant="primary" data-size="md">بدء الخدمة</button></footer>
</article>
```

```tsx live example=page
<>
  <PageHeader
    title="نسخة من مستند"
    description="اطلب نسخة طبق الأصل من مستند محفوظ في سجلك."
    breadcrumb={
      <Breadcrumb
        label="مسار التنقل"
        items={[
          { label: 'الرئيسية', href: '/' },
          { label: 'الخدمات', href: '/services' },
          { label: 'نسخة من مستند' },
        ]}
      />
    }
  />
  <ServiceDetails
    title="تفاصيل الخدمة"
    description="تصدر النسخة في صيغة إلكترونية بعد الموافقة على الطلب."
    metadata={[
      { term: 'المدة', description: '3 أيام' },
      { term: 'الرسوم', description: 'مجانًا' },
      { term: 'القناة', description: 'إلكترونيًا' },
    ]}
    requirementsLabel="المستندات المطلوبة"
    requirements={[
      'وثيقة إثبات الهوية',
      'الرقم المرجعي للمستند',
      'خطاب تفويض، عند تقديم الطلب عن شخص آخر',
    ]}
    action={<Button variant="primary">بدء الخدمة</Button>}
  >
    <p>للخدمة ثلاث خطوات.</p>
    <Timeline
      label="خطوات الخدمة"
      items={[
        { id: 'reference', title: 'إدخال الرقم المرجعي', description: 'اذكر المستند الذي تطلب نسخة منه.' },
        { id: 'documents', title: 'إرفاق المستندات', description: 'أرفق كل مستند من القائمة أعلاه.' },
        { id: 'submit', title: 'التأكيد والإرسال', description: 'راجع الإجابات، ثم أرسل الطلب.' },
      ]}
    />
  </ServiceDetails>
</>
```

```vue live example=page
<PageHeader title="نسخة من مستند" description="اطلب نسخة طبق الأصل من مستند محفوظ في سجلك.">
  <template #breadcrumb>
    <Breadcrumb
      label="مسار التنقل"
      :items="[
        { label: 'الرئيسية', href: '/' },
        { label: 'الخدمات', href: '/services' },
        { label: 'نسخة من مستند' },
      ]"
    />
  </template>
</PageHeader>
<ServiceDetails
  title="تفاصيل الخدمة"
  description="تصدر النسخة في صيغة إلكترونية بعد الموافقة على الطلب."
  :metadata="[
    { term: 'المدة', description: '3 أيام' },
    { term: 'الرسوم', description: 'مجانًا' },
    { term: 'القناة', description: 'إلكترونيًا' },
  ]"
  requirements-label="المستندات المطلوبة"
  :requirements="[
    'وثيقة إثبات الهوية',
    'الرقم المرجعي للمستند',
    'خطاب تفويض، عند تقديم الطلب عن شخص آخر',
  ]"
>
  <p>للخدمة ثلاث خطوات.</p>
  <Timeline
    label="خطوات الخدمة"
    :items="[
      { id: 'reference', title: 'إدخال الرقم المرجعي', description: 'اذكر المستند الذي تطلب نسخة منه.' },
      { id: 'documents', title: 'إرفاق المستندات', description: 'أرفق كل مستند من القائمة أعلاه.' },
      { id: 'submit', title: 'التأكيد والإرسال', description: 'راجع الإجابات، ثم أرسل الطلب.' },
    ]"
  />
  <template #action><Button variant="primary">بدء الخدمة</Button></template>
</ServiceDetails>
```

```ts live example=page framework=angular
template: `<hw-page-header title="نسخة من مستند" description="اطلب نسخة طبق الأصل من مستند محفوظ في سجلك.">
  <hw-breadcrumb
    hwBreadcrumb
    label="مسار التنقل"
    [items]="[
      { label: 'الرئيسية', href: '/' },
      { label: 'الخدمات', href: '/services' },
      { label: 'نسخة من مستند' },
    ]"
  />
</hw-page-header>
<hw-service-details
  title="تفاصيل الخدمة"
  description="تصدر النسخة في صيغة إلكترونية بعد الموافقة على الطلب."
  [metadata]="[
    { term: 'المدة', description: '3 أيام' },
    { term: 'الرسوم', description: 'مجانًا' },
    { term: 'القناة', description: 'إلكترونيًا' },
  ]"
  requirementsLabel="المستندات المطلوبة"
  [requirements]="[
    'وثيقة إثبات الهوية',
    'الرقم المرجعي للمستند',
    'خطاب تفويض، عند تقديم الطلب عن شخص آخر',
  ]"
>
  <p>للخدمة ثلاث خطوات.</p>
  <hw-timeline
    label="خطوات الخدمة"
    [items]="[
      { id: 'reference', title: 'إدخال الرقم المرجعي', description: 'اذكر المستند الذي تطلب نسخة منه.' },
      { id: 'documents', title: 'إرفاق المستندات', description: 'أرفق كل مستند من القائمة أعلاه.' },
      { id: 'submit', title: 'التأكيد والإرسال', description: 'راجع الإجابات، ثم أرسل الطلب.' },
    ]"
  />
  <button hwButton hwServiceAction variant="primary">بدء الخدمة</button>
</hw-service-details>`
```

الصفحة حالة ثابتة. والإجراء زر لأنه يبدأ طلبًا في التطبيق؛ وعندما تكون الخدمة على عنوان آخر، يكون الإجراء رابطًا يكتبه التطبيق بدلًا من الزر.

## المكوّنات المستخدمة

- [مسار التنقل](../components/breadcrumb.md) يسمّي الصفحات التي تعلو الخدمة، ويميّز الخدمة بأنها الصفحة الحالية.
- [عنوان الصفحة](../components/page-header.md) يضمّ عنصر العنوان من المستوى الأول الذي فيه اسم الخدمة، ووصفها، ومسار التنقل.
- [تفاصيل الخدمة](../components/service-details.md) تعرض معلومات الخدمة، والمستندات المطلوبة بوصفها قائمة متطلباتها، والخطوات بوصفها محتوى إضافيًا، والإجراء في تذييلها. وعنوان قائمة المستندات هو قيمة `requirementsLabel` في [تفاصيل الخدمة](../components/service-details.md).
- [الخط الزمني](../components/timeline.md) يسرد خطوات الخدمة بترتيبها، ولكل خطوة عنوان ووصف. ولا تحمل أي خطوة حالة، لأن القارئ لم يبدأ الخدمة بعد. وعناوين بنوده عناصر عنوان من المستوى الثالث، فيقع الخط الزمني تحت عنصر العنوان من المستوى الثاني في تفاصيل الخدمة.
- [الزر](../components/button.md) هو الإجراء الذي يبدأ الخدمة.

لا يتضمن الإصدار 0.3.0 جزءًا من تفاصيل الخدمة مخصّصًا للخطوات، فالخطوات محتوى يضعه التطبيق داخلها، والمكوّن هو الذي يثبّت ترتيب الأجزاء: المعلومات، ثم المستندات، ثم الخطوات، ثم الإجراء. ويُختار الخط الزمني بدلًا من [الخطوات](../components/stepper.md) لأن مكوّن الخطوات يعرض حالة كل مرحلة من تقدّم القارئ نفسه، وهي حالة لا تملكها قائمة خطوات تُعرض قبل البدء. ولا تضع الصفحة [القائمة الوصفية](../components/description-list.md)، لأن تفاصيل الخدمة تكتب المعلومات في قائمتها الوصفية الخاصة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر قالب الخدمة؛ وأدلة كل مكوّن في صفحته.

- تُدرج [ملاحظات التغطية](../coverage.md) تفاصيل الخدمة في الصف Platform patterns، ومسار التنقل في الصف Initial interaction/navigation، والزر في الصف Initial controls، والخط الزمني في الصف Additional content، وعنوان الصفحة في الصف Layout. وتذكر الملاحظات أن لسلوك القوالب بوابة أدلة مستقلة في سجل المرجع وفي خارطة الطريق.
