---
source:
  summary: 99bf5828fac9
  example: d0168f1adf3c
  composition: 0de69d369291
  platforms-code-reference: 4f5d8a82e5a0
---
# الصفحة الرئيسية

يضع قالب الصفحة الرئيسية لبوابة خدمات عنوانَ الصفحة وحقلَ بحث وشبكةً من بطاقات الخدمات بين الترويسة بما فيها من تنقل، والتذييل. ويوفّر التطبيق كل النصوص والوجهات والخدمات.

## مثال

يسمّي عنوانُ الصفحة الصفحةَ، ويذكر ما يستطيع القارئ أن يفعله فيها. ويقع حقل البحث تحته، وتليه بطاقات الخدمات في شبكة ذات عمود واحد في منفذ العرض الضيق، وذات ثلاثة أعمدة ابتداءً من الدرجة `md` في [الشبكة](../components/grid.md). وتأتي الترويسة والتذييل من [هيكل البوابة](../components/portal-layout.md)، الذي يوفّر أيضًا رابط التخطي والحاوية الرئيسية التي تضمّ محتوى الصفحة.

### الحالة الافتراضية

لحقل البحث تسمية ظاهرة وزر بحث، وكل بطاقة تمثّل خدمةً لها تصنيف ووصف ورابط إجراء واحد يذكر اسمُه الخدمة.

```html live example=default differences=portal-layout-adapter-markup,portal-layout-footer-brand-tree,search-field-adapter-markup,grid-vue-layout-attributes,stack-vue-layout-attributes frame
<div class="hw-portal-layout">
  <header class="hw-portal-header" data-hw="portal-header">
    <a class="hw-skip-link" href="#home-content">الانتقال إلى المحتوى الرئيسي</a>
    <a class="hw-portal-brand" href="/">بوابة المثال</a>
    <button class="hw-button hw-portal-menu-toggle" type="button" data-hw-portal-toggle><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>القائمة</button>
    <nav aria-label="التنقل الرئيسي" data-hw-portal-navigation>
      <ul><li><a class="hw-link" href="/services" aria-current="page">الخدمات</a></li><li><a class="hw-link" href="/requests">الطلبات</a></li><li><a class="hw-link" href="/documents">المستندات</a></li></ul>
    </nav>
  </header>
  <main class="hw-portal-layout-main hw-container" id="home-content" tabindex="-1">
    <div class="hw-stack">
      <header class="hw-page-header">
        <div class="hw-page-header-main">
          <div><h1>الخدمات</h1><p>ابحث عن خدمة، وابدأ طلبًا.</p></div>
        </div>
      </header>
      <div class="hw-field hw-search-field" data-hw="search-field">
        <label class="hw-label" for="home-query">البحث في الخدمات</label>
        <div class="hw-input-group">
          <div class="hw-search-control">
            <input class="hw-input" id="home-query" name="query" type="search" data-hw-search-input>
            <button class="hw-button hw-search-clear" type="button" data-variant="ghost" data-size="md" aria-label="مسح البحث" data-hw-search-clear></button>
          </div>
          <button class="hw-button hw-search-submit" type="button" data-variant="primary" data-size="md" aria-label="بحث"><span class="hw-search-submit-icon" aria-hidden="true"></span></button>
        </div>
      </div>
      <h2>الخدمات المتاحة</h2>
      <div class="hw-grid" style="--hw-layout-columns: 1; --hw-layout-columns-md: 3">
        <article class="hw-card hw-service-card">
          <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">المستندات</span><h3>نسخة من مستند</h3></div></header>
          <div class="hw-card-body">
            <p>اطلب نسخة طبق الأصل من مستند محفوظ في سجلك.</p>
          </div>
          <footer class="hw-card-footer"><a class="hw-link" href="/services/document-copy">طلب نسخة من مستند</a></footer>
        </article>
        <article class="hw-card hw-service-card">
          <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">الإقامة</span><h3>تجديد تصريح الإقامة</h3></div></header>
          <div class="hw-card-body">
            <p>جدّد تصريح الإقامة قبل انتهاء صلاحيته.</p>
          </div>
          <footer class="hw-card-footer"><a class="hw-link" href="/services/residence-renewal">طلب تجديد تصريح الإقامة</a></footer>
        </article>
        <article class="hw-card hw-service-card">
          <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">النقل</span><h3>تسجيل المركبة</h3></div></header>
          <div class="hw-card-body">
            <p>سجّل مركبة، أو جدّد تسجيلها.</p>
          </div>
          <footer class="hw-card-footer"><a class="hw-link" href="/services/vehicle-registration">تسجيل مركبة</a></footer>
        </article>
      </div>
    </div>
  </main>
  <footer class="hw-portal-footer">
    <div class="hw-portal-footer-main">
      <div class="hw-portal-footer-brand"><div class="hw-portal-footer-brand-marks">بوابة المثال</div></div>
      <nav class="hw-portal-footer-group" aria-label="روابط التذييل"><h2>روابط التذييل</h2><ul class="hw-portal-footer-links"><li><a class="hw-link" href="/privacy">سياسة الخصوصية</a></li><li><a class="hw-link" href="/terms">شروط الاستخدام</a></li></ul></nav>
    </div>
  </footer>
</div>
```

```tsx live example=default
<PortalLayout
  brand="بوابة المثال"
  mainId="home-content"
  skipLabel="الانتقال إلى المحتوى الرئيسي"
  menuLabel="القائمة"
  navigationLabel="التنقل الرئيسي"
  headerProps={{
    links: [
      { label: 'الخدمات', href: '/services', current: true },
      { label: 'الطلبات', href: '/requests' },
      { label: 'المستندات', href: '/documents' },
    ],
  }}
  footerLabel="روابط التذييل"
  footerProps={{
    externalLabel: 'يُفتح في نافذة جديدة',
    links: [
      { label: 'سياسة الخصوصية', href: '/privacy' },
      { label: 'شروط الاستخدام', href: '/terms' },
    ],
  }}
>
  <Stack>
    <PageHeader title="الخدمات" description="ابحث عن خدمة، وابدأ طلبًا." />
    <SearchField label="البحث في الخدمات" name="query" clearLabel="مسح البحث" showSearchButton searchLabel="بحث" />
    <h2>الخدمات المتاحة</h2>
    <Grid columns={{ base: 1, md: 3 }}>
      <ServiceCard
        title="نسخة من مستند"
        category="المستندات"
        description="اطلب نسخة طبق الأصل من مستند محفوظ في سجلك."
        href="/services/document-copy"
        actionLabel="طلب نسخة من مستند"
      />
      <ServiceCard
        title="تجديد تصريح الإقامة"
        category="الإقامة"
        description="جدّد تصريح الإقامة قبل انتهاء صلاحيته."
        href="/services/residence-renewal"
        actionLabel="طلب تجديد تصريح الإقامة"
      />
      <ServiceCard
        title="تسجيل المركبة"
        category="النقل"
        description="سجّل مركبة، أو جدّد تسجيلها."
        href="/services/vehicle-registration"
        actionLabel="تسجيل مركبة"
      />
    </Grid>
  </Stack>
</PortalLayout>
```

```vue live example=default
<PortalLayout
  brand="بوابة المثال"
  main-id="home-content"
  skip-label="الانتقال إلى المحتوى الرئيسي"
  menu-label="القائمة"
  navigation-label="التنقل الرئيسي"
  :links="[
    { label: 'الخدمات', href: '/services', current: true },
    { label: 'الطلبات', href: '/requests' },
    { label: 'المستندات', href: '/documents' },
  ]"
  footer-label="روابط التذييل"
  :footer-links="[
    { label: 'سياسة الخصوصية', href: '/privacy' },
    { label: 'شروط الاستخدام', href: '/terms' },
  ]"
  :footer-props="{ externalLabel: 'يُفتح في نافذة جديدة' }"
>
  <Stack>
    <PageHeader title="الخدمات" description="ابحث عن خدمة، وابدأ طلبًا." />
    <SearchField label="البحث في الخدمات" name="query" clear-label="مسح البحث" show-search-button search-label="بحث" />
    <h2>الخدمات المتاحة</h2>
    <Grid :columns="{ base: 1, md: 3 }">
      <ServiceCard
        title="نسخة من مستند"
        category="المستندات"
        description="اطلب نسخة طبق الأصل من مستند محفوظ في سجلك."
        href="/services/document-copy"
        action-label="طلب نسخة من مستند"
      />
      <ServiceCard
        title="تجديد تصريح الإقامة"
        category="الإقامة"
        description="جدّد تصريح الإقامة قبل انتهاء صلاحيته."
        href="/services/residence-renewal"
        action-label="طلب تجديد تصريح الإقامة"
      />
      <ServiceCard
        title="تسجيل المركبة"
        category="النقل"
        description="سجّل مركبة، أو جدّد تسجيلها."
        href="/services/vehicle-registration"
        action-label="تسجيل مركبة"
      />
    </Grid>
  </Stack>
</PortalLayout>
```

```ts live example=default framework=angular
template: `<hw-portal-layout
  brand="بوابة المثال"
  mainId="home-content"
  skipLabel="الانتقال إلى المحتوى الرئيسي"
  menuLabel="القائمة"
  navigationLabel="التنقل الرئيسي"
  [links]="[
    { label: 'الخدمات', href: '/services', current: true },
    { label: 'الطلبات', href: '/requests' },
    { label: 'المستندات', href: '/documents' },
  ]"
  footerLabel="روابط التذييل"
  [footerLinks]="[
    { label: 'سياسة الخصوصية', href: '/privacy' },
    { label: 'شروط الاستخدام', href: '/terms' },
  ]"
  externalLabel="يُفتح في نافذة جديدة"
>
  <hw-stack>
    <hw-page-header title="الخدمات" description="ابحث عن خدمة، وابدأ طلبًا." />
    <hw-search-field label="البحث في الخدمات" name="query" clearLabel="مسح البحث" [showSearchButton]="true" searchLabel="بحث" />
    <h2>الخدمات المتاحة</h2>
    <hw-grid [columns]="{ base: 1, md: 3 }">
      <hw-service-card
        title="نسخة من مستند"
        category="المستندات"
        description="اطلب نسخة طبق الأصل من مستند محفوظ في سجلك."
        href="/services/document-copy"
        actionLabel="طلب نسخة من مستند"
      />
      <hw-service-card
        title="تجديد تصريح الإقامة"
        category="الإقامة"
        description="جدّد تصريح الإقامة قبل انتهاء صلاحيته."
        href="/services/residence-renewal"
        actionLabel="طلب تجديد تصريح الإقامة"
      />
      <hw-service-card
        title="تسجيل المركبة"
        category="النقل"
        description="سجّل مركبة، أو جدّد تسجيلها."
        href="/services/vehicle-registration"
        actionLabel="تسجيل مركبة"
      />
    </hw-grid>
  </hw-stack>
</hw-portal-layout>`
```

### البحث مع الاقتراحات

عند تمرير قائمة `suggestions`، يقدّم [حقل البحث](../components/search-field.md) إكمالًا تلقائيًا محليًا في أثناء كتابة القارئ. والاقتراحات سلاسل نصية يوفّرها التطبيق، ولا يُرسَل أي طلب. وتعرض الصفحة الحقل في حالة السكون. ولا تتضمن هذه الحالة زر بحث، وتضم شبكتها بطاقتين.

```html live example=suggestions differences=portal-layout-adapter-markup,portal-layout-footer-brand-tree,search-field-adapter-markup,grid-vue-layout-attributes,stack-vue-layout-attributes frame
<div class="hw-portal-layout">
  <header class="hw-portal-header" data-hw="portal-header">
    <a class="hw-skip-link" href="#suggest-content">الانتقال إلى المحتوى الرئيسي</a>
    <a class="hw-portal-brand" href="/">بوابة المثال</a>
    <button class="hw-button hw-portal-menu-toggle" type="button" data-hw-portal-toggle><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>القائمة</button>
    <nav aria-label="التنقل الرئيسي" data-hw-portal-navigation>
      <ul><li><a class="hw-link" href="/services" aria-current="page">الخدمات</a></li><li><a class="hw-link" href="/requests">الطلبات</a></li><li><a class="hw-link" href="/documents">المستندات</a></li></ul>
    </nav>
  </header>
  <main class="hw-portal-layout-main hw-container" id="suggest-content" tabindex="-1">
    <div class="hw-stack">
      <header class="hw-page-header">
        <div class="hw-page-header-main">
          <div><h1>الخدمات</h1><p>ابحث عن خدمة، وابدأ طلبًا.</p></div>
        </div>
      </header>
      <div class="hw-field hw-search-field" data-hw="search-field" data-hw-suggestions='["تصريح الإقامة","تجديد الإقامة","تسجيل المركبة"]' data-hw-results-message="{count} من الاقتراحات">
        <label class="hw-label" for="suggest-query">البحث في الخدمات</label>
        <div class="hw-input-group">
          <div class="hw-search-control">
            <input class="hw-input" id="suggest-query" name="query" type="search" data-hw-search-input>
            <button class="hw-button hw-search-clear" type="button" data-variant="ghost" data-size="md" aria-label="مسح البحث" data-hw-search-clear></button>
          </div>
        </div>
      </div>
      <h2>الخدمات المتاحة</h2>
      <div class="hw-grid" style="--hw-layout-columns: 1; --hw-layout-columns-md: 3">
        <article class="hw-card hw-service-card">
          <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">الإقامة</span><h3>تجديد تصريح الإقامة</h3></div></header>
          <div class="hw-card-body">
            <p>جدّد تصريح الإقامة قبل انتهاء صلاحيته.</p>
          </div>
          <footer class="hw-card-footer"><a class="hw-link" href="/services/residence-renewal">طلب تجديد تصريح الإقامة</a></footer>
        </article>
        <article class="hw-card hw-service-card">
          <header class="hw-card-header"><div><span class="hw-badge" data-tone="neutral">النقل</span><h3>تسجيل المركبة</h3></div></header>
          <div class="hw-card-body">
            <p>سجّل مركبة، أو جدّد تسجيلها.</p>
          </div>
          <footer class="hw-card-footer"><a class="hw-link" href="/services/vehicle-registration">تسجيل مركبة</a></footer>
        </article>
      </div>
    </div>
  </main>
  <footer class="hw-portal-footer">
    <div class="hw-portal-footer-main">
      <div class="hw-portal-footer-brand"><div class="hw-portal-footer-brand-marks">بوابة المثال</div></div>
      <nav class="hw-portal-footer-group" aria-label="روابط التذييل"><h2>روابط التذييل</h2><ul class="hw-portal-footer-links"><li><a class="hw-link" href="/privacy">سياسة الخصوصية</a></li><li><a class="hw-link" href="/terms">شروط الاستخدام</a></li></ul></nav>
    </div>
  </footer>
</div>
```

```tsx live example=suggestions
<PortalLayout
  brand="بوابة المثال"
  mainId="suggest-content"
  skipLabel="الانتقال إلى المحتوى الرئيسي"
  menuLabel="القائمة"
  navigationLabel="التنقل الرئيسي"
  headerProps={{
    links: [
      { label: 'الخدمات', href: '/services', current: true },
      { label: 'الطلبات', href: '/requests' },
      { label: 'المستندات', href: '/documents' },
    ],
  }}
  footerLabel="روابط التذييل"
  footerProps={{
    externalLabel: 'يُفتح في نافذة جديدة',
    links: [
      { label: 'سياسة الخصوصية', href: '/privacy' },
      { label: 'شروط الاستخدام', href: '/terms' },
    ],
  }}
>
  <Stack>
    <PageHeader title="الخدمات" description="ابحث عن خدمة، وابدأ طلبًا." />
    <SearchField
      label="البحث في الخدمات"
      name="query"
      clearLabel="مسح البحث"
      suggestions={['تصريح الإقامة', 'تجديد الإقامة', 'تسجيل المركبة']}
      getResultsMessage={(count) => count + ' من الاقتراحات'}
    />
    <h2>الخدمات المتاحة</h2>
    <Grid columns={{ base: 1, md: 3 }}>
      <ServiceCard
        title="تجديد تصريح الإقامة"
        category="الإقامة"
        description="جدّد تصريح الإقامة قبل انتهاء صلاحيته."
        href="/services/residence-renewal"
        actionLabel="طلب تجديد تصريح الإقامة"
      />
      <ServiceCard
        title="تسجيل المركبة"
        category="النقل"
        description="سجّل مركبة، أو جدّد تسجيلها."
        href="/services/vehicle-registration"
        actionLabel="تسجيل مركبة"
      />
    </Grid>
  </Stack>
</PortalLayout>
```

```vue live example=suggestions
<PortalLayout
  brand="بوابة المثال"
  main-id="suggest-content"
  skip-label="الانتقال إلى المحتوى الرئيسي"
  menu-label="القائمة"
  navigation-label="التنقل الرئيسي"
  :links="[
    { label: 'الخدمات', href: '/services', current: true },
    { label: 'الطلبات', href: '/requests' },
    { label: 'المستندات', href: '/documents' },
  ]"
  footer-label="روابط التذييل"
  :footer-links="[
    { label: 'سياسة الخصوصية', href: '/privacy' },
    { label: 'شروط الاستخدام', href: '/terms' },
  ]"
  :footer-props="{ externalLabel: 'يُفتح في نافذة جديدة' }"
>
  <Stack>
    <PageHeader title="الخدمات" description="ابحث عن خدمة، وابدأ طلبًا." />
    <SearchField
      label="البحث في الخدمات"
      name="query"
      clear-label="مسح البحث"
      :suggestions="['تصريح الإقامة', 'تجديد الإقامة', 'تسجيل المركبة']"
      :get-results-message="(count) => count + ' من الاقتراحات'"
    />
    <h2>الخدمات المتاحة</h2>
    <Grid :columns="{ base: 1, md: 3 }">
      <ServiceCard
        title="تجديد تصريح الإقامة"
        category="الإقامة"
        description="جدّد تصريح الإقامة قبل انتهاء صلاحيته."
        href="/services/residence-renewal"
        action-label="طلب تجديد تصريح الإقامة"
      />
      <ServiceCard
        title="تسجيل المركبة"
        category="النقل"
        description="سجّل مركبة، أو جدّد تسجيلها."
        href="/services/vehicle-registration"
        action-label="تسجيل مركبة"
      />
    </Grid>
  </Stack>
</PortalLayout>
```

```ts live example=suggestions framework=angular
template: `<hw-portal-layout
  brand="بوابة المثال"
  mainId="suggest-content"
  skipLabel="الانتقال إلى المحتوى الرئيسي"
  menuLabel="القائمة"
  navigationLabel="التنقل الرئيسي"
  [links]="[
    { label: 'الخدمات', href: '/services', current: true },
    { label: 'الطلبات', href: '/requests' },
    { label: 'المستندات', href: '/documents' },
  ]"
  footerLabel="روابط التذييل"
  [footerLinks]="[
    { label: 'سياسة الخصوصية', href: '/privacy' },
    { label: 'شروط الاستخدام', href: '/terms' },
  ]"
  externalLabel="يُفتح في نافذة جديدة"
>
  <hw-stack>
    <hw-page-header title="الخدمات" description="ابحث عن خدمة، وابدأ طلبًا." />
    <hw-search-field
      label="البحث في الخدمات"
      name="query"
      clearLabel="مسح البحث"
      [suggestions]="['تصريح الإقامة', 'تجديد الإقامة', 'تسجيل المركبة']"
      [getResultsMessage]="(count) => count + ' من الاقتراحات'"
    />
    <h2>الخدمات المتاحة</h2>
    <hw-grid [columns]="{ base: 1, md: 3 }">
      <hw-service-card
        title="تجديد تصريح الإقامة"
        category="الإقامة"
        description="جدّد تصريح الإقامة قبل انتهاء صلاحيته."
        href="/services/residence-renewal"
        actionLabel="طلب تجديد تصريح الإقامة"
      />
      <hw-service-card
        title="تسجيل المركبة"
        category="النقل"
        description="سجّل مركبة، أو جدّد تسجيلها."
        href="/services/vehicle-registration"
        actionLabel="تسجيل مركبة"
      />
    </hw-grid>
  </hw-stack>
</hw-portal-layout>`
```

## المكوّنات المستخدمة

- [هيكل البوابة](../components/portal-layout.md) يعرض الترويسة مع رابط التخطي والتنقل الرئيسي، والحاوية الرئيسية القابلة للتركيز، والتذييل. ويوضع محتوى الصفحة داخله.
- [عنوان الصفحة](../components/page-header.md) يفتتح الحاوية الرئيسية بعنوان الصفحة، في عنصر `h1`، وبوصفها.
- [حقل البحث](../components/search-field.md) يحتفظ بعبارة بحث القارئ. ويُجري التطبيق البحث، ويكتب زر البحث في ترميز HTML المجرّد.
- [الشبكة](../components/grid.md) ترتّب البطاقات في عمود واحد، وفي ثلاثة أعمدة ابتداءً من الدرجة `md`.
- [بطاقة الخدمة](../components/service-card.md) تلخّص خدمة واحدة بتصنيف ووصف وإجراء واحد. وعنوانها عنوان من المستوى الثالث، لذا يسمّي عنوانٌ من المستوى الثاني شبكة البطاقات، فيحفظ ترتيب العناوين في الصفحة.
- [الترتيب العمودي](../components/stack.md) يضع عنوان الصفحة وحقل البحث والشبكة في عمود واحد بمسافات متساوية بينها.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط قالب الصفحة الرئيسية بكود المنصات؛ وأدلة كل مكوّن في صفحته.

### المصادر

- تُدرج [ملاحظات التغطية](../coverage.md) هيكل البوابة وبطاقة الخدمة في الصف Platform patterns من نطاق المكوّنات، وحقل البحث في الصف Additional controls، والترتيب العمودي والشبكة وعنوان الصفحة في الصف Layout. وربط مصادر كل مكوّن في صفحته.
- تتبع الترويسة والتذييل [ملاحظات تنقل البوابة](../nic-portal-navigation.md) و[ملاحظات التذييل](../nic-footer.md)، وتتبع بطاقات الخدمات [ملاحظات البطاقات](../nic-cards.md).
- يتبع حقل البحث [ملاحظات البحث](../nic-search.md).
