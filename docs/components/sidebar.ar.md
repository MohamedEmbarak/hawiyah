---
source:
  summary: bbc6333ca341
  example: 7b13ae18c0b3
  variants-and-states: 854f8547b3e3
  api: 950611b10033
  accessibility: 4b35e48f9c5d
  rtl-and-localisation: 42e118c3e492
  platforms-code-reference: 2a56751f1fb5
---
# تخطيط جانبي

يضع مكوّن التخطيط الجانبي عمودًا ثانويًا للتنقل أو للسياق بجانب المحتوى الرئيسي للصفحة. وهو عنصر تخطيط أساسي ليس له سلوك خاص به، ويضع المنطقتين إحداهما فوق الأخرى في عمود واحد في العروض الأصغر من نقطة تحوّل تعرّفها ورقة الأنماط.

## مثال

يحمل مكوّن التخطيط الجانبي عنصرين ابنين بالضبط: المنطقة الثانوية أولًا ثم المحتوى الرئيسي. والمنطقة الثانوية هنا معلم تنقل له اسمه الخاص، ويليها المحتوى الرئيسي في ترتيب الشيفرة المصدرية وفي ترتيب القراءة.

```html live example=basic static differences=sidebar-adapter-layout-attributes
<div class="hw-sidebar">
  <nav aria-label="أقسام الطلب">
    <ul>
      <li><a href="/requests/2041/details">التفاصيل</a></li>
      <li><a href="/requests/2041/documents">المستندات</a></li>
      <li><a href="/requests/2041/history">السجل</a></li>
    </ul>
  </nav>
  <div>
    <h2>الطلب 2041</h2>
    <p>الطلب قيد المراجعة. ويُتوقّع صدور القرار خلال خمسة أيام عمل.</p>
  </div>
</div>
```

```tsx live example=basic
<Sidebar>
  <nav aria-label="أقسام الطلب">
    <ul>
      <li><a href="/requests/2041/details">التفاصيل</a></li>
      <li><a href="/requests/2041/documents">المستندات</a></li>
      <li><a href="/requests/2041/history">السجل</a></li>
    </ul>
  </nav>
  <div>
    <h2>الطلب 2041</h2>
    <p>الطلب قيد المراجعة. ويُتوقّع صدور القرار خلال خمسة أيام عمل.</p>
  </div>
</Sidebar>
```

```vue live example=basic
<Sidebar>
  <nav aria-label="أقسام الطلب">
    <ul>
      <li><a href="/requests/2041/details">التفاصيل</a></li>
      <li><a href="/requests/2041/documents">المستندات</a></li>
      <li><a href="/requests/2041/history">السجل</a></li>
    </ul>
  </nav>
  <div>
    <h2>الطلب 2041</h2>
    <p>الطلب قيد المراجعة. ويُتوقّع صدور القرار خلال خمسة أيام عمل.</p>
  </div>
</Sidebar>
```

```ts live example=basic framework=angular
template: `<hw-sidebar>
  <nav hwSidebar aria-label="أقسام الطلب">
    <ul>
      <li><a href="/requests/2041/details">التفاصيل</a></li>
      <li><a href="/requests/2041/documents">المستندات</a></li>
      <li><a href="/requests/2041/history">السجل</a></li>
    </ul>
  </nav>
  <div>
    <h2>الطلب 2041</h2>
    <p>الطلب قيد المراجعة. ويُتوقّع صدور القرار خلال خمسة أيام عمل.</p>
  </div>
</hw-sidebar>`
```

## الأشكال والحالات

### الجانب

تنقل الخاصية `side` بالقيمة `end` المنطقة الثانوية، ابتداءً من نقطة التحوّل، إلى نهاية الصف: إلى الحافة اليمنى في صفحة من اليسار إلى اليمين، وإلى الحافة اليسرى في صفحة من اليمين إلى اليسار. ولا يتغيّر ترتيب الشيفرة المصدرية، فتبقى المنطقة الثانوية أول ما يُقرأ وأول ما يصل إليه التركيز.

```html live example=side static differences=sidebar-adapter-layout-attributes
<div class="hw-sidebar" data-side="end">
  <aside aria-label="ملخّص الطلب">
    <p>الرقم المرجعي: 2041</p>
    <p>الحالة: قيد المراجعة</p>
  </aside>
  <div>
    <h2>المستندات الداعمة</h2>
    <p>أُرفق بالطلب مستندان.</p>
  </div>
</div>
```

```tsx live example=side
<Sidebar side="end">
  <aside aria-label="ملخّص الطلب">
    <p>الرقم المرجعي: 2041</p>
    <p>الحالة: قيد المراجعة</p>
  </aside>
  <div>
    <h2>المستندات الداعمة</h2>
    <p>أُرفق بالطلب مستندان.</p>
  </div>
</Sidebar>
```

```vue live example=side
<Sidebar side="end">
  <aside aria-label="ملخّص الطلب">
    <p>الرقم المرجعي: 2041</p>
    <p>الحالة: قيد المراجعة</p>
  </aside>
  <div>
    <h2>المستندات الداعمة</h2>
    <p>أُرفق بالطلب مستندان.</p>
  </div>
</Sidebar>
```

```ts live example=side framework=angular
template: `<hw-sidebar side="end">
  <aside hwSidebar aria-label="ملخّص الطلب">
    <p>الرقم المرجعي: 2041</p>
    <p>الحالة: قيد المراجعة</p>
  </aside>
  <div>
    <h2>المستندات الداعمة</h2>
    <p>أُرفق بالطلب مستندان.</p>
  </div>
</hw-sidebar>`
```

### العرض والفجوة

تضبط الخاصية `sidebarWidth` عرض المنطقة الثانوية طولًا في CSS، وتضبط الخاصية `gap` المسافة بين المنطقتين رمزَ مسافات. وابتداءً من نقطة التحوّل لا تأخذ المنطقة أبدًا أكثر من 40% من عرض مكوّن التخطيط الجانبي. وتكتب محوّلات React وVue وAngular القيمتين خاصيتَي CSS مخصّصتين على العنصر، ويكتب ترميز كتلة JavaScript خاصيتَي CSS المخصّصتين نفسيهما في الخاصية `style`.

```html live example=width static differences=sidebar-adapter-layout-attributes
<div class="hw-sidebar" style="--hw-layout-sidebar-width: 14rem; --hw-layout-gap: var(--hw-space-8, 2rem)">
  <nav aria-label="تصنيفات الخدمات">
    <ul>
      <li><a href="/services/documents">المستندات</a></li>
      <li><a href="/services/payments">المدفوعات</a></li>
      <li><a href="/services/profile">الملف الشخصي</a></li>
    </ul>
  </nav>
  <div>
    <h2>المستندات</h2>
    <p>اطلب مستندًا أو جدّده أو استبدله.</p>
  </div>
</div>
```

```tsx live example=width
<Sidebar sidebarWidth="14rem" gap={8}>
  <nav aria-label="تصنيفات الخدمات">
    <ul>
      <li><a href="/services/documents">المستندات</a></li>
      <li><a href="/services/payments">المدفوعات</a></li>
      <li><a href="/services/profile">الملف الشخصي</a></li>
    </ul>
  </nav>
  <div>
    <h2>المستندات</h2>
    <p>اطلب مستندًا أو جدّده أو استبدله.</p>
  </div>
</Sidebar>
```

```vue live example=width
<Sidebar sidebar-width="14rem" :gap="8">
  <nav aria-label="تصنيفات الخدمات">
    <ul>
      <li><a href="/services/documents">المستندات</a></li>
      <li><a href="/services/payments">المدفوعات</a></li>
      <li><a href="/services/profile">الملف الشخصي</a></li>
    </ul>
  </nav>
  <div>
    <h2>المستندات</h2>
    <p>اطلب مستندًا أو جدّده أو استبدله.</p>
  </div>
</Sidebar>
```

```ts live example=width framework=angular
template: `<hw-sidebar sidebarWidth="14rem" [gap]="8">
  <nav hwSidebar aria-label="تصنيفات الخدمات">
    <ul>
      <li><a href="/services/documents">المستندات</a></li>
      <li><a href="/services/payments">المدفوعات</a></li>
      <li><a href="/services/profile">الملف الشخصي</a></li>
    </ul>
  </nav>
  <div>
    <h2>المستندات</h2>
    <p>اطلب مستندًا أو جدّده أو استبدله.</p>
  </div>
</hw-sidebar>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-sidebar

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-sidebar'` | `true` | — |
| `data-collapse-at` | `'lg' \| 'md' \| 'sm'` | `false` | — |
| `data-side` | `'end'` | `false` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس لمكوّن التخطيط الجانبي متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصرًا بالصنف `hw-sidebar` له عنصران ابنان بالضبط، المنطقة الثانوية أولًا ثم المحتوى الرئيسي. وتأخذ الخاصية `data-side` القيمة `end` لنقل المنطقة الثانوية إلى نهاية الصف؛ ودونها تقع المنطقة في البداية. وتأخذ الخاصية `data-collapse-at` إحدى القيم `sm` و`md` و`lg`، وتسمّي عرض نافذة العرض الذي تقع ابتداءً منه المنطقتان جنبًا إلى جنب: 40rem و48rem و64rem. وفي العروض الأصغر من هذا العرض تضع ورقة الأنماط المنطقتين إحداهما فوق الأخرى في عمود واحد، ودون الخاصية تكون نقطة التحوّل `md`. وعرض المنطقة الثانوية هو الأصغر من 40% من عرض مكوّن التخطيط الجانبي ومن خاصية CSS المخصّصة لعرضها، `--hw-layout-sidebar-width`، وقيمتها 18rem ما لم تُضبط على العنصر؛ وتضبط `--hw-layout-gap` و`--hw-layout-padding` المسافة بين المنطقتين والحشوة. ولا تنشر خيارات vanilla قيمة افتراضية في الإصدار 0.3.0، فكل قيمة افتراضية في الجدول شرطة طويلة، مع أن ورقة الأنماط تطبّق `md` عند غياب `data-collapse-at` وجهة البداية عند غياب `data-side`.

### React

جدول: خصائص Sidebar

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `gap` | `Responsive<LayoutSpacing>` | `false` | — |
| `padding` | `Responsive<LayoutSpacing>` | `false` | — |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | `false` | — |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | `false` | — |
| `wrap` | `boolean` | `false` | — |
| `columns` | `Responsive<number>` | `false` | — |
| `minItemWidth` | `string` | `false` | — |
| `side` | `'start' \| 'end'` | `false` | — |
| `sidebarWidth` | `string` | `false` | — |
| `collapseAt` | `'sm' \| 'md' \| 'lg'` | `false` | — |
| `maxWidth` | `string` | `false` | — |
| `ratio` | `number` | `false` | — |

يعرض Sidebar دائمًا عنصر `div`؛ وليس له خاصية تختار عنصرًا آخر. ويقبل خصائص التخطيط المشتركة بين عناصر التخطيط الأساسية مع خصائص عنصر `div`، والعنصر الابن الأول هو المنطقة الثانوية والعنصر الابن الثاني هو المحتوى الرئيسي. ولا تُكتب الخاصيتان `side` و`collapseAt` في `data-side` و`data-collapse-at` إلا عند تمريرهما، فدونهما تقع المنطقة في البداية وتكون نقطة التحوّل `md`، وهذا ما تطبّقه ورقة الأنماط. وتأخذ الخاصية `sidebarWidth` طولًا في CSS. وتأخذ الخاصيتان `gap` و`padding` رمز مسافات من 0 إلى 16 أو طولًا في CSS، وتقبل كلتاهما كائنًا متجاوبًا بالدرجات `base` و`sm` و`md` و`lg` و`xl`. وتضبط الخاصية `align` محاذاة المنطقتين على المحور المتقاطع للصف. ولا تقرأ أنماط مكوّن التخطيط الجانبي أيًّا من `justify` و`wrap` و`columns` و`minItemWidth` و`maxWidth` و`ratio`، فهي تخصّ عناصر تخطيط أساسية أخرى.

### Vue

جدول: خصائص Sidebar وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `as` | prop | `string` | `false` | `'div'` |
| `gap` | prop | `LayoutProps['gap']` | `false` | — |
| `padding` | prop | `LayoutProps['padding']` | `false` | — |
| `align` | prop | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | `false` | — |
| `justify` | prop | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | `false` | — |
| `wrap` | prop | `boolean` | `false` | — |
| `columns` | prop | `LayoutProps['columns']` | `false` | — |
| `minItemWidth` | prop | `string` | `false` | — |
| `side` | prop | `'start' \| 'end'` | `false` | `'start'` |
| `sidebarWidth` | prop | `string` | `false` | — |
| `collapseAt` | prop | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `maxWidth` | prop | `string` | `false` | — |
| `ratio` | prop | `number` | `false` | — |
| `default` | slot | — | `false` | — |

يحمل المنفذ الافتراضي المنطقتين: العنصر الابن الأول هو المنطقة الثانوية والعنصر الابن الثاني هو المحتوى الرئيسي. وتضبط الخاصية `as` العنصر الذي يعرضه Sidebar، وهو `div` ما لم يُكتب وسم آخر. وللخصائص `side` و`collapseAt` و`sidebarWidth` و`gap` و`padding` و`align` المعنى الذي لها في React. ويكتب Sidebar دائمًا الخاصيتين `data-side` و`data-collapse-at` على عنصره، بالقيمتين الافتراضيتين للخاصيتين `side` و`collapseAt`. وتصل خصائص HTML والمستمعات التي لا يعرّفها Sidebar إلى العنصر المعروض. وليس للخاصية `wrap` قيمة افتراضية، وتغيب ما لم تُضبط.

### Angular

جدول: مُدخلات hw-sidebar ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `gap` | input | `Responsive<LayoutSpacing>` | `false` | — |
| `padding` | input | `Responsive<LayoutSpacing>` | `false` | — |
| `align` | input | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | `false` | — |
| `justify` | input | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | `false` | — |
| `wrap` | input | `boolean` | `false` | — |
| `columns` | input | `Responsive<number>` | `false` | — |
| `minItemWidth` | input | `string` | `false` | — |
| `maxWidth` | input | `string` | `false` | — |
| `sidebarWidth` | input | `string` | `false` | — |
| `ratio` | input | `number` | `false` | — |
| `side` | input | `'start' \| 'end'` | `false` | `'start'` |
| `collapseAt` | input | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `[hwSidebar]` | content | — | `false` | — |
| `*` | content | — | `false` | — |

يُطبَّق `HwSidebarComponent` على `hw-sidebar`، بمحدِّد العنصر وحده. والعنصر المضيف هو الصندوق نفسه: يحمل الصنف `hw-sidebar` وخصائص CSS المخصّصة للتخطيط، وقالبه هو المحتوى المُسقَط وحده، ولا يُضاف عنصر `aside` ولا `div`. أسقِط عنصرًا واحدًا يحمل `[hwSidebar]` ليكون المنطقة الثانوية، وعنصرًا آخر ليكون المحتوى الرئيسي. وتوضع المنطقة الثانوية أولًا أيًّا كان ترتيب الشيفرة المصدرية. ولا يُضاف حولها عنصر `aside` ولا `div`، فاختر العنصر الذي يناسبها، مثل `nav` أو `aside`. وللمُدخلات `side` و`collapseAt` و`sidebarWidth` و`gap` و`padding` و`align` المعنى الذي لها في React، ويكتب العنصر المضيف دائمًا `data-side` و`data-collapse-at` بالقيمتين الافتراضيتين للمُدخلين `side` و`collapseAt`. والمُدخلات التي لا تقرؤها أنماط مكوّن التخطيط الجانبي مدرجة مع خصائص التخطيط المشتركة بين عناصر التخطيط الأساسية.

## إمكانية الوصول

مكوّن التخطيط الجانبي حاوية تخطيط. فمكوّن React يعرض عنصر `div`؛ ومكوّن Vue يعرض عنصر `div` أو العنصر الذي تسمّيه الخاصية `as`؛ وعنصر Angular `hw-sidebar` يعرض نفسه. ولا يضيف مكوّن التخطيط الجانبي في أي صيغة دورًا ولا اسمًا ولا عنصرًا قابلًا للتركيز، فتأتي دلالات الصفحة من المنطقتين اللتين يكتبهما التطبيق.

- ترتيب الشيفرة المصدرية هو ترتيب القراءة وترتيب التركيز. وتأتي المنطقة الثانوية أولًا في كل محوّل، ولا تغيّر الخاصية `side` بالقيمة `end` إلا موضع رسمها، فيصل مستخدم لوحة المفاتيح إلى المنطقة الثانوية قبل المحتوى الرئيسي حتى عندما تقع في نهاية الصف.
- لا يمنح مكوّن التخطيط الجانبي اسمًا ميسّرًا. فالمنطقة الثانوية التي تكون تنقلًا عنصر `nav` أصلي مع `aria-label`، والمنطقة التكميلية عنصر `aside` مع `aria-label` أو مع `aria-labelledby` يشير إلى عنصر عنوان، لتتمكّن التقنيات المساعدة من التمييز بين المعالم.
- ليس لمكوّن التخطيط الجانبي تفاعل خاص به من لوحة المفاتيح، وينقل <kbd>Tab</kbd> التركيز بين العناصر القابلة للتركيز في المنطقتين كما يفعل خارج مكوّن التخطيط الجانبي.
- في العروض الأصغر من نقطة التحوّل تقع المنطقتان إحداهما فوق الأخرى في عمود واحد، والمنطقة الثانوية أولًا، دون تغيير في ترتيب الشيفرة المصدرية. واختر قيمة `collapseAt` بحسب مقدار المحتوى في المنطقة الثانوية: فقائمة التنقل الطويلة فوق المحتوى الرئيسي تدفعه إلى الأسفل على الشاشة الضيقة.

> [!NOTE]
> يغيّر مكوّن التخطيط الجانبي التخطيط، لا المعنى. فيبقى المعلم الرئيسي للصفحة خارجه أو محيطًا به؛ ولا يعرض مكوّن التخطيط الجانبي معلمًا رئيسيًا.

## الاتجاه والتوطين

ليس في مكوّن التخطيط الجانبي نص مدمج. ويكتب التطبيق أسماء المعالم وكل نص آخر بلغة الصفحة.

- تتبع القيمتان `start` و`end` اتجاه الصفحة. فبالقيمة الافتراضية `start` تقع المنطقة الثانوية عند الحافة اليمنى في صفحة من اليمين إلى اليسار، وعند الحافة اليسرى في صفحة من اليسار إلى اليمين، وتعكس القيمة `end` ذلك.
- تضع ورقة الأنماط المنطقتين في أعمدة شبكة، فيتبع موضعهما اتجاه الصفحة دون قاعدة ثانية للعربية.
- العرض والفجوة نفسهما في العربية وفي الإنجليزية. ويختلف طول التسميات بين اللغتين، فاضبط `sidebarWidth` بحسب أطول تسمية في الصفحة بأي من اللغتين.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط مكوّن التخطيط الجانبي بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- مكوّن التخطيط الجانبي عنصر تخطيط أساسي في هوية. وتسرد [ملاحظات التخطيط](../layout.md) العرض الافتراضي للعمود الجانبي ونقطة التحوّل لهذا العنصر الأساسي. وتسجّل أيضًا عمودَي المحتوى الرئيسي ومعلومات الخدمة في قالب الخدمة في اللقطة المزوَّدة (832px و416px، مع فجوة 32px)، وتذكر أن هذه الأبعاد المرجعية لا تعني أن كل تركيب لمكوّن التخطيط الجانبي ينبغي أن يستخدمها. ولا تسمّي أي مكوّن في ملفات كود المنصات المزوَّدة يقابله مكوّن التخطيط الجانبي، فلا تذكر الصفحة أي ربط للمكوّن نفسه.
- يُدرج مكوّن التخطيط الجانبي مع عناصر التخطيط الأساسية في نطاق المكوّنات في [ملاحظات التغطية](../coverage.md). وتذكر [ملاحظات التخطيط](../layout.md) أن التخطيط يقوم على CSS ولا يقيس نافذة العرض في JavaScript، وهذا أساس سلوك وضع المنطقتين في عمود واحد الذي تصفه هذه الصفحة.
