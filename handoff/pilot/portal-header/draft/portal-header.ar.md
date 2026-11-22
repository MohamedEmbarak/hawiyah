---
source:
  summary: e3b0c44298fc
  example: d87324e09346
  variants-and-states: b8d75bc34768
  api: 2a93fd41baf8
  accessibility: 846ec77721f0
  rtl-and-localisation: 0e8b776b325f
  platforms-code-reference: c7a8237a2966
---
# ترويسة المنصة

## مثال

```html live example=basic check=portal-header-tab-order frame width=390
<header class="hw-portal-header" data-hw="portal-header">
  <a class="hw-skip-link" href="#main-content">انتقل إلى المحتوى الرئيسي</a>
  <a class="hw-portal-brand" href="/"><span>بوابة الخدمات</span></a>
  <button class="hw-button hw-portal-menu-toggle" type="button" data-hw-portal-toggle><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>القائمة</button>
  <nav id="primary-navigation" aria-label="التنقل الرئيسي" data-hw-portal-navigation>
    <ul>
      <li><a class="hw-link" href="/requests" aria-current="page">الطلبات</a></li>
      <li>
        <details class="hw-portal-branch" data-hw-portal-branch>
          <summary>الخدمات</summary>
          <div class="hw-portal-branch-panel">
            <a class="hw-link hw-portal-branch-overview" href="/services">الخدمات</a>
            <section class="hw-portal-branch-group">
              <h2>السجلات</h2>
              <ul>
                <li><a class="hw-link" href="/services/records/new">طلب سجل</a></li>
                <li><a class="hw-link" href="/services/records/track">متابعة طلب</a></li>
              </ul>
            </section>
          </div>
        </details>
      </li>
      <li><a class="hw-link" href="/documents">المستندات</a></li>
      <li><a class="hw-link" href="/help">المساعدة</a></li>
    </ul>
  </nav>
  <div class="hw-portal-header-actions"><button class="hw-button" type="button" data-variant="secondary" data-size="md">تسجيل الدخول</button></div>
</header>
<main class="hw-container" id="main-content">
  <h1>طلبات الخدمة</h1>
  <p>قدّم طلبًا جديدًا أو تابع طلبًا قائمًا.</p>
</main>
```

```tsx live example=basic
<>
  <PortalHeader
    brand={<span>بوابة الخدمات</span>}
    mainId="main-content"
    skipLabel="انتقل إلى المحتوى الرئيسي"
    menuLabel="القائمة"
    navigationLabel="التنقل الرئيسي"
    navigationId="primary-navigation"
    links={[
      { label: 'الطلبات', href: '/requests', current: true },
      {
        label: 'الخدمات',
        href: '/services',
        groups: [
          {
            label: 'السجلات',
            links: [
              { label: 'طلب سجل', href: '/services/records/new' },
              { label: 'متابعة طلب', href: '/services/records/track' },
            ],
          },
        ],
      },
      { label: 'المستندات', href: '/documents' },
      { label: 'المساعدة', href: '/help' },
    ]}
    actions={<Button variant="secondary">تسجيل الدخول</Button>}
  />
  <main className="hw-container" id="main-content">
    <h1>طلبات الخدمة</h1>
    <p>قدّم طلبًا جديدًا أو تابع طلبًا قائمًا.</p>
  </main>
</>
```

```vue live example=basic
<PortalHeader
  brand="بوابة الخدمات"
  main-id="main-content"
  skip-label="انتقل إلى المحتوى الرئيسي"
  menu-label="القائمة"
  navigation-label="التنقل الرئيسي"
  navigation-id="primary-navigation"
  :links="[
    { label: 'الطلبات', href: '/requests', current: true },
    {
      label: 'الخدمات',
      href: '/services',
      groups: [
        {
          label: 'السجلات',
          links: [
            { label: 'طلب سجل', href: '/services/records/new' },
            { label: 'متابعة طلب', href: '/services/records/track' },
          ],
        },
      ],
    },
    { label: 'المستندات', href: '/documents' },
    { label: 'المساعدة', href: '/help' },
  ]"
>
  <template #actions><Button variant="secondary">تسجيل الدخول</Button></template>
</PortalHeader>
<main class="hw-container" id="main-content">
  <h1>طلبات الخدمة</h1>
  <p>قدّم طلبًا جديدًا أو تابع طلبًا قائمًا.</p>
</main>
```

```ts live example=basic framework=angular
template: `<hw-portal-header
  brand="بوابة الخدمات"
  mainId="main-content"
  skipLabel="انتقل إلى المحتوى الرئيسي"
  menuLabel="القائمة"
  navigationLabel="التنقل الرئيسي"
  navigationId="primary-navigation"
  [links]="[
    { label: 'الطلبات', href: '/requests', current: true },
    {
      label: 'الخدمات',
      href: '/services',
      groups: [
        {
          label: 'السجلات',
          links: [
            { label: 'طلب سجل', href: '/services/records/new' },
            { label: 'متابعة طلب', href: '/services/records/track' },
          ],
        },
      ],
    },
    { label: 'المستندات', href: '/documents' },
    { label: 'المساعدة', href: '/help' },
  ]"
>
  <button hwButton variant="secondary">تسجيل الدخول</button>
</hw-portal-header>
<main class="hw-container" id="main-content">
  <h1>طلبات الخدمة</h1>
  <p>قدّم طلبًا جديدًا أو تابع طلبًا قائمًا.</p>
</main>`
```

## الأشكال والحالات

### التنقل بمجموعات الروابط

```html live example=grouped check=portal-header-branch,portal-header-escape,portal-header-panel-tab frame width=390
<header class="hw-portal-header" data-hw="portal-header">
  <a class="hw-portal-brand" href="/"><span>بوابة الخدمات</span></a>
  <button class="hw-button hw-portal-menu-toggle" type="button" data-hw-portal-toggle><span class="hw-icon" data-icon="menu-01" aria-hidden="true"></span>القائمة</button>
  <nav id="grouped-navigation" aria-label="التنقل الرئيسي" data-hw-portal-navigation>
    <ul>
      <li>
        <details class="hw-portal-branch" data-hw-portal-branch>
          <summary>الخدمات</summary>
          <div class="hw-portal-branch-panel">
            <a class="hw-link hw-portal-branch-overview" href="/services">الخدمات</a>
            <section class="hw-portal-branch-group">
              <h2>السجلات</h2>
              <ul>
                <li><a class="hw-link" href="/services/records/new">طلب سجل</a></li>
                <li><a class="hw-link" href="/services/records/track">متابعة طلب</a></li>
              </ul>
            </section>
            <section class="hw-portal-branch-group">
              <h2>التصاريح</h2>
              <ul>
                <li><a class="hw-link" href="/services/permits/new">التقدم بطلب تصريح</a></li>
                <li><a class="hw-link" href="/services/permits/renew">تجديد تصريح</a></li>
              </ul>
            </section>
          </div>
        </details>
      </li>
      <li>
        <details class="hw-portal-branch" data-hw-portal-branch>
          <summary>المستندات</summary>
          <div class="hw-portal-branch-panel">
            <a class="hw-link hw-portal-branch-overview" href="/documents">المستندات</a>
            <section class="hw-portal-branch-group">
              <h2>مستنداتي</h2>
              <ul>
                <li><a class="hw-link" href="/documents/uploaded">المستندات المرفوعة</a></li>
                <li><a class="hw-link" href="/documents/issued">المستندات الصادرة</a></li>
              </ul>
            </section>
          </div>
        </details>
      </li>
      <li><a class="hw-link" href="/help">المساعدة</a></li>
    </ul>
  </nav>
  <div class="hw-portal-header-actions"><button class="hw-button" type="button" data-variant="secondary" data-size="md">تسجيل الدخول</button></div>
</header>
```

```tsx live example=grouped
<PortalHeader
  brand={<span>بوابة الخدمات</span>}
  menuLabel="القائمة"
  navigationLabel="التنقل الرئيسي"
  navigationId="grouped-navigation"
  links={[
    {
      label: 'الخدمات',
      href: '/services',
      groups: [
        {
          label: 'السجلات',
          links: [
            { label: 'طلب سجل', href: '/services/records/new' },
            { label: 'متابعة طلب', href: '/services/records/track' },
          ],
        },
        {
          label: 'التصاريح',
          links: [
            { label: 'التقدم بطلب تصريح', href: '/services/permits/new' },
            { label: 'تجديد تصريح', href: '/services/permits/renew' },
          ],
        },
      ],
    },
    {
      label: 'المستندات',
      href: '/documents',
      groups: [
        {
          label: 'مستنداتي',
          links: [
            { label: 'المستندات المرفوعة', href: '/documents/uploaded' },
            { label: 'المستندات الصادرة', href: '/documents/issued' },
          ],
        },
      ],
    },
    { label: 'المساعدة', href: '/help' },
  ]}
  actions={<Button variant="secondary">تسجيل الدخول</Button>}
/>
```

```vue live example=grouped
<PortalHeader
  brand="بوابة الخدمات"
  menu-label="القائمة"
  navigation-label="التنقل الرئيسي"
  navigation-id="grouped-navigation"
  :links="[
    {
      label: 'الخدمات',
      href: '/services',
      groups: [
        {
          label: 'السجلات',
          links: [
            { label: 'طلب سجل', href: '/services/records/new' },
            { label: 'متابعة طلب', href: '/services/records/track' },
          ],
        },
        {
          label: 'التصاريح',
          links: [
            { label: 'التقدم بطلب تصريح', href: '/services/permits/new' },
            { label: 'تجديد تصريح', href: '/services/permits/renew' },
          ],
        },
      ],
    },
    {
      label: 'المستندات',
      href: '/documents',
      groups: [
        {
          label: 'مستنداتي',
          links: [
            { label: 'المستندات المرفوعة', href: '/documents/uploaded' },
            { label: 'المستندات الصادرة', href: '/documents/issued' },
          ],
        },
      ],
    },
    { label: 'المساعدة', href: '/help' },
  ]"
>
  <template #actions><Button variant="secondary">تسجيل الدخول</Button></template>
</PortalHeader>
```

```ts live example=grouped framework=angular
template: `<hw-portal-header
  brand="بوابة الخدمات"
  menuLabel="القائمة"
  navigationLabel="التنقل الرئيسي"
  navigationId="grouped-navigation"
  [links]="[
    {
      label: 'الخدمات',
      href: '/services',
      groups: [
        {
          label: 'السجلات',
          links: [
            { label: 'طلب سجل', href: '/services/records/new' },
            { label: 'متابعة طلب', href: '/services/records/track' },
          ],
        },
        {
          label: 'التصاريح',
          links: [
            { label: 'التقدم بطلب تصريح', href: '/services/permits/new' },
            { label: 'تجديد تصريح', href: '/services/permits/renew' },
          ],
        },
      ],
    },
    {
      label: 'المستندات',
      href: '/documents',
      groups: [
        {
          label: 'مستنداتي',
          links: [
            { label: 'المستندات المرفوعة', href: '/documents/uploaded' },
            { label: 'المستندات الصادرة', href: '/documents/issued' },
          ],
        },
      ],
    },
    { label: 'المساعدة', href: '/help' },
  ]"
>
  <button hwButton variant="secondary">تسجيل الدخول</button>
</hw-portal-header>`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createPortalHeader

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `menuLabel` | `string` | `false` | — |
| `navigationLabel` | `string` | `false` | — |
| `brandLabel` | `string` | `false` | — |

### React

جدول: خصائص PortalHeader

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `brand` | `ReactNode` | `true` | — |
| `homeHref` | `string` | `false` | `'/'` |
| `brandLabel` | `string` | `false` | — |
| `links` | `readonly PortalNavItem[]` | `false` | — |
| `navigationLabel` | `string` | `true` | — |
| `menuLabel` | `string` | `true` | — |
| `navigationId` | `string` | `false` | — |
| `actions` | `ReactNode` | `false` | — |
| `notice` | `ReactNode` | `false` | — |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | `false` |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `mainId` | `string` | `false` | — |
| `skipLabel` | `string` | `false` | — |

### Vue

جدول: خصائص PortalHeader وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `brand` | prop | `string` | `false` | — |
| `brandLabel` | prop | `string` | `false` | — |
| `homeHref` | prop | `string` | `false` | `'/'` |
| `links` | prop | `readonly PortalLink[]` | `false` | — |
| `navigationLabel` | prop | `string` | `true` | — |
| `menuLabel` | prop | `string` | `true` | — |
| `navigationId` | prop | `string` | `false` | — |
| `mainId` | prop | `string` | `false` | — |
| `skipLabel` | prop | `string` | `false` | — |
| `open` | prop | `boolean` | `false` | — |
| `defaultOpen` | prop | `boolean` | `false` | `false` |
| `update:open` | event | `(value: boolean) => void` | `false` | — |
| `notice` | slot | — | `false` | — |
| `brand` | slot | — | `false` | — |
| `actions` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |

### Angular

جدول: مُدخلات hw-portal-header ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `brand` | input | `string` | `false` | `''` |
| `brandLabel` | input | `string` | `false` | `''` |
| `homeHref` | input | `string` | `false` | `'/'` |
| `mainId` | input | `string` | `false` | `''` |
| `skipLabel` | input | `string` | `false` | `''` |
| `menuLabel` | input | `string` | `true` | — |
| `navigationLabel` | input | `string` | `true` | — |
| `navigationId` | input | `string` | `false` | — |
| `links` | input | `readonly HwPortalNavItem[]` | `false` | `[]` |
| `open` | input | `boolean` | `false` | `false` |
| `openChange` | output | `boolean` | `false` | — |
| `[hwPortalNotice]` | content | — | `false` | — |
| `[hwBrand]` | content | — | `false` | — |
| `*` | content | — | `false` | — |

## إمكانية الوصول

جدول: التفاعل من لوحة المفاتيح مع المكوّن: ترويسة المنصة

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز عبر رابط التخطي والعلامة وزر القائمة دون 48rem وعناصر التنقل وروابط الفرع الموسّع والإجراءات بترتيب المستند، ويطوي الفرع أو التنقل الذي يغادره التركيز. |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | يوسّع فرع الملخص الذي عليه التركيز أو يطويه، أو يوسّع التنقل أو يطويه دون 48rem حين يكون التركيز على زر القائمة، ويبقي التركيز على ذلك العنصر. |
| <kbd>Escape</kbd> | يطوي الفرع الموسّع وينقل التركيز إلى ملخصه، أو يطوي التنقل دون 48rem إذا لم يكن أي فرع موسّعًا وينقل التركيز إلى زر القائمة. |

## الاتجاه والتوطين

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد.
