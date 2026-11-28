---
source:
  summary: ea08fd33e2b9
  example: e2597af8506b
  variants-and-states: 200a712af4a2
  api: c0eb882e083c
  accessibility: a234e56cc862
  rtl-and-localisation: b30e6801be81
  platforms-code-reference: c474cd7bba2b
---
# هيكل التطبيق

ينظّم هيكل التطبيق مناطق صفحة التطبيق: رابط التخطي، والترويسة، والشريط الجانبي، والمنطقة الرئيسية، والتذييل. ويوفّر التطبيق محتوى كل منطقة ونص رابط التخطي، ويوفّر الهيكل الشبكة ووجهة رابط التخطي.

## مثال

يضع الهيكل الترويسة في أعلى الصفحة، والشريط الجانبي في جهة بدء القراءة، والتذييل في أسفلها. والعنصر الأول في الهيكل هو رابط التخطي، وهو مخفي بصريًا حتى يتلقّى التركيز، وينقل التركيز إلى المنطقة الرئيسية. وتمنح الصفحة المنطقة الرئيسية معرّفها عبر `mainId`، ويشير رابط التخطي إليها.

```html live example=basic static differences=app-shell-adapter-side frame
<div class="hw-app-shell">
  <a class="hw-skip-link" data-hw="skip-link" href="#requests-content">الانتقال إلى المحتوى الرئيسي</a>
  <div class="hw-app-shell-header"><header><strong>بوابة الخدمات</strong></header></div>
  <aside class="hw-app-shell-sidebar">
    <nav aria-label="الحساب"><ul><li><a class="hw-link" href="/requests">الطلبات</a></li><li><a class="hw-link" href="/documents">المستندات</a></li><li><a class="hw-link" href="/profile">الملف الشخصي</a></li></ul></nav>
  </aside>
  <main class="hw-app-shell-main" id="requests-content" tabindex="-1">
    <h1>طلبات الخدمة</h1>
    <p>راجع الطلبات التي قدّمتها، أو ابدأ طلبًا جديدًا.</p>
  </main>
  <div class="hw-app-shell-footer"><footer><p>المساعدة وبيانات التواصل</p></footer></div>
</div>
```

```tsx live example=basic
<AppShell
  mainId="requests-content"
  skipLabel="الانتقال إلى المحتوى الرئيسي"
  header={<header><strong>بوابة الخدمات</strong></header>}
  sidebar={
    <nav aria-label="الحساب">
      <ul>
        <li><a className="hw-link" href="/requests">الطلبات</a></li>
        <li><a className="hw-link" href="/documents">المستندات</a></li>
        <li><a className="hw-link" href="/profile">الملف الشخصي</a></li>
      </ul>
    </nav>
  }
  footer={<footer><p>المساعدة وبيانات التواصل</p></footer>}
>
  <h1>طلبات الخدمة</h1>
  <p>راجع الطلبات التي قدّمتها، أو ابدأ طلبًا جديدًا.</p>
</AppShell>
```

```vue live example=basic
<AppShell main-id="requests-content" skip-label="الانتقال إلى المحتوى الرئيسي">
  <template #header><header><strong>بوابة الخدمات</strong></header></template>
  <template #sidebar>
    <nav aria-label="الحساب">
      <ul>
        <li><a class="hw-link" href="/requests">الطلبات</a></li>
        <li><a class="hw-link" href="/documents">المستندات</a></li>
        <li><a class="hw-link" href="/profile">الملف الشخصي</a></li>
      </ul>
    </nav>
  </template>
  <h1>طلبات الخدمة</h1>
  <p>راجع الطلبات التي قدّمتها، أو ابدأ طلبًا جديدًا.</p>
  <template #footer><footer><p>المساعدة وبيانات التواصل</p></footer></template>
</AppShell>
```

```ts live example=basic framework=angular
template: `<hw-app-shell mainId="requests-content" skipLabel="الانتقال إلى المحتوى الرئيسي">
  <header hwShellHeader><strong>بوابة الخدمات</strong></header>
  <nav hwShellSidebar aria-label="الحساب">
    <ul>
      <li><a class="hw-link" href="/requests">الطلبات</a></li>
      <li><a class="hw-link" href="/documents">المستندات</a></li>
      <li><a class="hw-link" href="/profile">الملف الشخصي</a></li>
    </ul>
  </nav>
  <h1>طلبات الخدمة</h1>
  <p>راجع الطلبات التي قدّمتها، أو ابدأ طلبًا جديدًا.</p>
  <footer hwShellFooter><p>المساعدة وبيانات التواصل</p></footer>
</hw-app-shell>`
```

## الأشكال والحالات

### دون شريط جانبي

يمنح الهيكل الذي ليس فيه محتوى للشريط الجانبي المنطقةَ الرئيسية العرض الكامل. استخدم هذا الشكل لصفحة لا تحتاج إلى تنقل بجانب محتواها، مثل نموذج يملأ الصفحة.

```html live example=nosidebar static differences=app-shell-adapter-side frame
<div class="hw-app-shell">
  <a class="hw-skip-link" data-hw="skip-link" href="#form-content">الانتقال إلى المحتوى الرئيسي</a>
  <div class="hw-app-shell-header"><header><strong>بوابة الخدمات</strong></header></div>
  <main class="hw-app-shell-main" id="form-content" tabindex="-1">
    <h1>طلب جديد</h1>
    <p>صِف الخدمة التي تحتاج إليها. ويمكنك مراجعة الطلب قبل تقديمه.</p>
  </main>
  <div class="hw-app-shell-footer"><footer><p>المساعدة وبيانات التواصل</p></footer></div>
</div>
```

```tsx live example=nosidebar
<AppShell
  mainId="form-content"
  skipLabel="الانتقال إلى المحتوى الرئيسي"
  header={<header><strong>بوابة الخدمات</strong></header>}
  footer={<footer><p>المساعدة وبيانات التواصل</p></footer>}
>
  <h1>طلب جديد</h1>
  <p>صِف الخدمة التي تحتاج إليها. ويمكنك مراجعة الطلب قبل تقديمه.</p>
</AppShell>
```

```vue live example=nosidebar
<AppShell main-id="form-content" skip-label="الانتقال إلى المحتوى الرئيسي">
  <template #header><header><strong>بوابة الخدمات</strong></header></template>
  <h1>طلب جديد</h1>
  <p>صِف الخدمة التي تحتاج إليها. ويمكنك مراجعة الطلب قبل تقديمه.</p>
  <template #footer><footer><p>المساعدة وبيانات التواصل</p></footer></template>
</AppShell>
```

```ts live example=nosidebar framework=angular
template: `<hw-app-shell mainId="form-content" skipLabel="الانتقال إلى المحتوى الرئيسي">
  <header hwShellHeader><strong>بوابة الخدمات</strong></header>
  <h1>طلب جديد</h1>
  <p>صِف الخدمة التي تحتاج إليها. ويمكنك مراجعة الطلب قبل تقديمه.</p>
  <footer hwShellFooter><p>المساعدة وبيانات التواصل</p></footer>
</hw-app-shell>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-app-shell وخيارات createSkipLink

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-app-shell'` | `true` | — |
| `data-side` | `'end'` | `false` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

الهيكل ترميز معه متحكم صغير لرابط التخطي. اكتب عنصر `div` بالصنف `hw-app-shell` تكون عناصره الأبناء بهذا الترتيب: رابط التخطي، وعنصر `div` اختياري بالصنف `hw-app-shell-header`، وعنصر `aside` اختياري بالصنف `hw-app-shell-sidebar`، وعنصر `main` بالصنف `hw-app-shell-main`، وعنصر `div` اختياري بالصنف `hw-app-shell-footer`. وامنح عنصر `main` الخاصية `id` والخاصية `tabindex` بالقيمة سالب واحد ليتمكّن من تلقّي التركيز، واجعل رابط التخطي يشير إلى قيمة `id` هذه. ورابط التخطي عنصر `a` بالصنف `hw-skip-link` وبالخاصية `data-hw="skip-link"`، وتربطه الدالة `enhance()`. وتربط الدالة `createSkipLink(link)` رابطًا واحدًا مباشرة: فهي تأخذ عنصر `a`، وليس لها خيارات، وتُرجع `activate()` و`destroy()`. وتُطلق خطأً إذا لم يكن العنصر عنصر `a`؛ وتربط عنصر `a` الذي ليس له نص ولا `aria-label`، ويُكتب عندئذ تحذير مرة واحدة في بيئة التطوير. والترويسة والتذييل عنصرا `div`، فيأتي معلَم الترويسة العامة (banner) ومعلَم معلومات المحتوى (contentinfo) من العناصر التي يضعها التطبيق فيهما. وتنقل الخاصية `data-side="end"` الشريط الجانبي إلى جهة نهاية القراءة، ودونها يقع الشريط الجانبي في جهة بدء القراءة.

### React

جدول: خصائص AppShell

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `header` | `ReactNode` | `false` | — |
| `sidebar` | `ReactNode` | `false` | — |
| `footer` | `ReactNode` | `false` | — |
| `mainId` | `string` | `false` | — |
| `skipLabel` | `string` | `true` | — |

الخاصية `skipLabel` مطلوبة، وهي نص رابط التخطي. ووجهة رابط التخطي هي المنطقة الرئيسية، وقيمة `id` لها هي `mainId`؛ ودون `mainId` يولّد المكوّن معرّفًا. وتُعرض الخصائص `header` و`sidebar` و`footer` في عنصر `div` بالصنف `hw-app-shell-header`، وعنصر `aside` بالصنف `hw-app-shell-sidebar`، وعنصر `div` بالصنف `hw-app-shell-footer`، ولا يُعرض كل منها إلا عند تمرير الخاصية. وتُعرض العناصر الأبناء في عنصر `main`. وليس للمكوّن خاصية للجهة، ويمرّر الخصائص الأخرى إلى العنصر الجذر، فتصل إليه خاصية HTML `data-side="end"` المكتوبة على `AppShell`.

### Vue

جدول: خصائص AppShell وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `mainId` | prop | `string` | `false` | — |
| `skipLabel` | prop | `string` | `true` | — |
| `as` | prop | `string` | `false` | `'div'` |
| `gap` | prop | `LayoutProps['gap']` | `false` | — |
| `padding` | prop | `LayoutProps['padding']` | `false` | — |
| `align` | prop | `'center' \| 'start' \| 'end' \| 'stretch' \| 'baseline'` | `false` | — |
| `justify` | prop | `'center' \| 'start' \| 'end' \| 'between' \| 'around' \| 'evenly'` | `false` | — |
| `wrap` | prop | `boolean` | `false` | — |
| `columns` | prop | `LayoutProps['columns']` | `false` | — |
| `minItemWidth` | prop | `string` | `false` | — |
| `side` | prop | `'start' \| 'end'` | `false` | `'start'` |
| `sidebarWidth` | prop | `string` | `false` | — |
| `collapseAt` | prop | `'md' \| 'sm' \| 'lg'` | `false` | `'md'` |
| `maxWidth` | prop | `string` | `false` | — |
| `ratio` | prop | `number` | `false` | — |
| `header` | slot | — | `false` | — |
| `sidebar` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |
| `footer` | slot | — | `false` | — |

الخاصية `skipLabel` مطلوبة، وهي نص رابط التخطي، والخاصية `mainId` هي قيمة `id` للمنطقة الرئيسية التي يشير إليها؛ ودون `mainId` يولّد المكوّن معرّفًا. وتُعرض المنافذ `header` و`sidebar` و`footer` في عنصر `div` بالصنف `hw-app-shell-header`، وعنصر `aside` بالصنف `hw-app-shell-sidebar`، وعنصر `div` بالصنف `hw-app-shell-footer`، ولا يُعرض كل منها إلا عند توفير المنفذ؛ ويُعرض المنفذ الافتراضي في عنصر `main`. وتُكتب الخاصية `side` في `data-side` على العنصر الجذر، وتضبط الخاصية `as` وسم هذا العنصر، وهو `div` افتراضيًا. وتُكتب خصائص التخطيط خصائصَ CSS مخصّصة للتخطيط على العنصر الجذر، لكن ورقة أنماط الهيكل لا تقرأ منها إلا `sidebarWidth`؛ فلا أثر فيه لـ`gap` و`columns` و`minItemWidth` و`maxWidth` و`ratio`. وتُكتب الخاصية `collapseAt` في `data-collapse-at`، ولا تقرؤها أي قاعدة من قواعد الهيكل: فيصبح الشريط الجانبي عمودًا عند العرض الثابت 64rem.

### Angular

جدول: مُدخلات hw-app-shell ومخرجاته ومحتواه

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
| `mainId` | input | `string` | `false` | `'main-content'` |
| `skipLabel` | input | `string` | `true` | — |
| `side` | input | `'start' \| 'end'` | `false` | `'start'` |
| `[hwShellHeader]` | content | — | `false` | — |
| `[hwShellSidebar]` | content | — | `false` | — |
| `*` | content | — | `false` | — |
| `[hwShellFooter]` | content | — | `false` | — |

يُطبَّق `HwAppShellComponent` على `hw-app-shell`، ويحمل عنصره المضيف الصنف `hw-app-shell`. والمُدخل `skipLabel` مطلوب، وهو نص رابط التخطي، والمُدخل `mainId` هو قيمة `id` للمنطقة الرئيسية التي يشير إليها، وقيمته الافتراضية `'main-content'`. ويملأ المحتوى الذي يحمل `hwShellHeader` و`hwShellSidebar` و`hwShellFooter` الترويسة والشريط الجانبي والتذييل، ويملأ كل محتوى آخر عنصر `main`. وتُعرض المناطق الثلاث دائمًا، لأن Angular لا يستطيع أن يعرف هل أُسقِط فيها محتوى؛ وتخفي ورقة الأنماط المنطقة الفارغة، فإذا حُذفت إحداها بقيت المنطقة الرئيسية بالعرض الكامل. ويُكتب المُدخل `side` في `data-side` على العنصر المضيف، وتُكتب `sidebarWidth` ومُدخلات التخطيط الأخرى خصائصَ CSS مخصّصة للتخطيط عليه.

## إمكانية الوصول

يعرض هيكل التطبيق رابط التخطي والمنطقة الرئيسية، ويعرض منطقة الترويسة ومنطقة الشريط الجانبي ومنطقة التذييل عند توفيرها؛ ويعرض Angular المناطق الثلاث دائمًا. والهيكل تخطيط لا عنصر تفاعلي: فليست له حالة، وتحتفظ العناصر التي يضعها التطبيق فيه بسلوكها الخاص مع لوحة المفاتيح وبأسمائها.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: هيكل التطبيق

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز، عند الضغط عليه من بداية الصفحة، إلى رابط التخطي، وهو العنصر الأول في الهيكل، ويبقى مخفيًا بصريًا حتى يتلقّى التركيز. |
| <kbd>Enter</kbd> | يفعّل رابط التخطي الذي عليه التركيز، فيمرّر الصفحة إلى المنطقة الرئيسية وينقل التركيز إليها دون أن يكتب المعرّف الجزئي في عنوان الصفحة. |

- رابط التخطي رابط أصلي. ونصه قيمة `skipLabel` التي يكتبها التطبيق بلغة الصفحة، ووجهته عنصر `main`، الذي يتلقّى التركيز لأنه يحمل الخاصية `tabindex` بالقيمة سالب واحد.
- يعرض الهيكل الترويسة والتذييل عنصرَي `div`، لا عنصرَي `header` و`footer`. ويأتي معلَم الترويسة العامة (banner) ومعلَم معلومات المحتوى (contentinfo) من العناصر التي يُسقطها التطبيق فيهما، مثل ترويسة المنصة أو عنصرَي `header` و`footer` الخاصين به؛ فأسقِطهما مرة واحدة في كل صفحة.
- الشريط الجانبي عنصر `aside`. سمِّ التنقل الذي يحتويه بالخاصية `aria-label`، كما تفعل الأمثلة، ليتمكّن من يتصفّح قائمة المعالم من التمييز بينه وبين مناطق التنقل الأخرى في الصفحة.
- اجعل قيمة `mainId` فريدة في المستند عندما يمكن أن يوجد فيه أكثر من هيكل واحد، ليصل رابط التخطي إلى المنطقة الصحيحة.
- ترتيب الشيفرة المصدرية هو ترتيب القراءة وترتيب التنقل بالمفتاح Tab: رابط التخطي، ثم الترويسة، ثم الشريط الجانبي، ثم المنطقة الرئيسية، ثم التذييل. ولا تغيّر الشبكة إلا الموضع المرئي للمناطق في العروض الواسعة.

## الاتجاه والتوطين

ليس في هيكل التطبيق نص مدمج: يكتب التطبيق نص رابط التخطي ومحتوى كل منطقة بلغة الصفحة.

- يقع الشريط الجانبي في جهة بدء القراءة، فيكون على اليمين في صفحة اتجاهها من اليمين إلى اليسار، وعلى اليسار في صفحة اتجاهها من اليسار إلى اليمين، وينتقل إلى الجهة المقابلة بالخاصية `side` في Vue، وبالمُدخل `side` في Angular، وبخاصية HTML `data-side="end"` في React وفي الترميز. ويقع حدّ الشريط الجانبي على الجهة المواجهة للمنطقة الرئيسية.
- يظهر رابط التخطي في جهة بدء القراءة من الصفحة عندما يتلقّى التركيز.
- يصبح الشريط الجانبي عمودًا ثانيًا ابتداءً من العرض 64rem، ويقع في العروض الأصغر فوق المنطقة الرئيسية، بالترتيب نفسه في اتجاهَي القراءة كليهما.
- اكتب نص رابط التخطي بلغة الصفحة، وباللغة نفسها التي تُكتب بها المعالم التي يُسقطها التطبيق.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط هيكل التطبيق بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- يُدرج هيكل التطبيق في الصف Layout من نطاق المكوّنات في [ملاحظات التغطية](../coverage.md)، لا في الصف Platform patterns.
- تصف [ملاحظات التخطيط](../layout.md) بنية المناطق والعرض الذي يصبح عنده الشريط الجانبي عمودًا.
