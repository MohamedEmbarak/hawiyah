---
source:
  summary: f7fa430a36dd
  example: 716ef98b6c2e
  variants-and-states: 9cbab55e50f6
  api: 90427386b9c6
  accessibility: 0f41444ab5bd
  rtl-and-localisation: a4edeb850084
  platforms-code-reference: 86e798c6aaf3
---
# التنقل داخل الصفحة

التنقل داخل الصفحة معلَم تنقل يضمّ روابط إلى أقسام الصفحة الحالية، مع بنود متداخلة وعلامة على القسم الذي بلغه القارئ. وينتقل بالتمرير إلى القسم المختار ويُبلغ عن القسم الحالي، وتبقى الأقسام ومعرّفاتها للتطبيق.

## مثال

يذكر كل بند المعرّف `id` لقسم من أقسام الصفحة، ويشير الرابط إليه. وتقع العلامة على القسم الحالي، ويحمل رابط ذلك القسم الخاصية `aria-current="location"`. ولا تضبط الأمثلة التالية `scrollRoot`، فيتتبّع المتحكم تمرير النافذة؛ ولا تتحرّك نتائجها بالتمرير، ويعرض كل منها القسم الأول قسمًا حاليًا.

```html live example=basic static
<nav class="hw-content-nav" data-hw="content-navigation" aria-label="في هذه الصفحة">
  <h2 class="hw-content-nav-heading">في هذه الصفحة</h2>
  <ul class="hw-content-nav-list"><li><a class="hw-content-nav-link" href="#cn-basic-overview" data-hw-section="cn-basic-overview"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">نظرة عامة</span></a></li><li><a class="hw-content-nav-link" href="#cn-basic-documents" data-hw-section="cn-basic-documents"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">المستندات المطلوبة</span></a></li><li><a class="hw-content-nav-link" href="#cn-basic-fees" data-hw-section="cn-basic-fees"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">الرسوم والدفع</span></a></li></ul>
</nav>
<section id="cn-basic-overview"><h3>نظرة عامة</h3><p>يُراجَع الطلب بعد تقديمه.</p></section>
<section id="cn-basic-documents"><h3>المستندات المطلوبة</h3><p>أرفق كل مستند بصيغة PDF.</p></section>
<section id="cn-basic-fees"><h3>الرسوم والدفع</h3><p>تُعرض الرسوم قبل تقديم الطلب.</p></section>
```

```tsx live example=basic
<>
  <ContentNavigation
    label="في هذه الصفحة"
    items={[
    { id: 'cn-basic-overview', label: 'نظرة عامة' },
    { id: 'cn-basic-documents', label: 'المستندات المطلوبة' },
    { id: 'cn-basic-fees', label: 'الرسوم والدفع' },
  ]}
  />
  <section id="cn-basic-overview"><h3>نظرة عامة</h3><p>يُراجَع الطلب بعد تقديمه.</p></section>
  <section id="cn-basic-documents"><h3>المستندات المطلوبة</h3><p>أرفق كل مستند بصيغة PDF.</p></section>
  <section id="cn-basic-fees"><h3>الرسوم والدفع</h3><p>تُعرض الرسوم قبل تقديم الطلب.</p></section>
</>
```

```vue live example=basic
<ContentNavigation
  label="في هذه الصفحة"
  :items="[
    { id: 'cn-basic-overview', label: 'نظرة عامة' },
    { id: 'cn-basic-documents', label: 'المستندات المطلوبة' },
    { id: 'cn-basic-fees', label: 'الرسوم والدفع' },
  ]"
/>
<section id="cn-basic-overview"><h3>نظرة عامة</h3><p>يُراجَع الطلب بعد تقديمه.</p></section>
<section id="cn-basic-documents"><h3>المستندات المطلوبة</h3><p>أرفق كل مستند بصيغة PDF.</p></section>
<section id="cn-basic-fees"><h3>الرسوم والدفع</h3><p>تُعرض الرسوم قبل تقديم الطلب.</p></section>
```

```ts live example=basic framework=angular
template: `<hw-content-navigation
  label="في هذه الصفحة"
  [items]="[
    { id: 'cn-basic-overview', label: 'نظرة عامة' },
    { id: 'cn-basic-documents', label: 'المستندات المطلوبة' },
    { id: 'cn-basic-fees', label: 'الرسوم والدفع' },
  ]"
/>
<section id="cn-basic-overview"><h3>نظرة عامة</h3><p>يُراجَع الطلب بعد تقديمه.</p></section>
<section id="cn-basic-documents"><h3>المستندات المطلوبة</h3><p>أرفق كل مستند بصيغة PDF.</p></section>
<section id="cn-basic-fees"><h3>الرسوم والدفع</h3><p>تُعرض الرسوم قبل تقديم الطلب.</p></section>
`
```

## الأشكال والحالات

### البنود المتداخلة والمعطَّلة

يمكن أن يحتوي البند على `children`، فتُعرض قائمةً متداخلة. والبند الذي يحمل `disabled` بند نصي يحمل `aria-disabled="true"`، ولا ينتقل بالتمرير إلى قسمه.

```html live example=nested static
<nav class="hw-content-nav" data-hw="content-navigation" aria-label="أقسام الطلب">
  <h2 class="hw-content-nav-heading">أقسام الطلب</h2>
  <ul class="hw-content-nav-list"><li><a class="hw-content-nav-link" href="#cn-nested-request" data-hw-section="cn-nested-request"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">الطلب</span></a><ul class="hw-content-nav-sublist"><li><a class="hw-content-nav-link" href="#cn-nested-applicant" data-hw-section="cn-nested-applicant"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">مقدّم الطلب</span></a></li><li><a class="hw-content-nav-link" href="#cn-nested-documents" data-hw-section="cn-nested-documents"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">المستندات</span></a></li></ul></li><li><span class="hw-content-nav-link" role="link" aria-disabled="true" data-hw-section="cn-nested-payment"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">الدفع</span></span></li></ul>
</nav>
<section id="cn-nested-request"><h3>الطلب</h3><p>صِف الطلب.</p></section>
<section id="cn-nested-applicant"><h3>مقدّم الطلب</h3><p>أدخل بيانات مقدّم الطلب.</p></section>
<section id="cn-nested-documents"><h3>المستندات</h3><p>أرفق المستندات الداعمة.</p></section>
<section id="cn-nested-payment"><h3>الدفع</h3><p>يُتاح الدفع بعد المراجعة.</p></section>
```

```tsx live example=nested
<>
  <ContentNavigation
    label="أقسام الطلب"
    items={[
    {
      id: 'cn-nested-request',
      label: 'الطلب',
      children: [
        { id: 'cn-nested-applicant', label: 'مقدّم الطلب' },
        { id: 'cn-nested-documents', label: 'المستندات' },
      ],
    },
    { id: 'cn-nested-payment', label: 'الدفع', disabled: true },
  ]}
  />
  <section id="cn-nested-request"><h3>الطلب</h3><p>صِف الطلب.</p></section>
  <section id="cn-nested-applicant"><h3>مقدّم الطلب</h3><p>أدخل بيانات مقدّم الطلب.</p></section>
  <section id="cn-nested-documents"><h3>المستندات</h3><p>أرفق المستندات الداعمة.</p></section>
  <section id="cn-nested-payment"><h3>الدفع</h3><p>يُتاح الدفع بعد المراجعة.</p></section>
</>
```

```vue live example=nested
<ContentNavigation
  label="أقسام الطلب"
  :items="[
    {
      id: 'cn-nested-request',
      label: 'الطلب',
      children: [
        { id: 'cn-nested-applicant', label: 'مقدّم الطلب' },
        { id: 'cn-nested-documents', label: 'المستندات' },
      ],
    },
    { id: 'cn-nested-payment', label: 'الدفع', disabled: true },
  ]"
/>
<section id="cn-nested-request"><h3>الطلب</h3><p>صِف الطلب.</p></section>
<section id="cn-nested-applicant"><h3>مقدّم الطلب</h3><p>أدخل بيانات مقدّم الطلب.</p></section>
<section id="cn-nested-documents"><h3>المستندات</h3><p>أرفق المستندات الداعمة.</p></section>
<section id="cn-nested-payment"><h3>الدفع</h3><p>يُتاح الدفع بعد المراجعة.</p></section>
```

```ts live example=nested framework=angular
template: `<hw-content-navigation
  label="أقسام الطلب"
  [items]="[
    {
      id: 'cn-nested-request',
      label: 'الطلب',
      children: [
        { id: 'cn-nested-applicant', label: 'مقدّم الطلب' },
        { id: 'cn-nested-documents', label: 'المستندات' },
      ],
    },
    { id: 'cn-nested-payment', label: 'الدفع', disabled: true },
  ]"
/>
<section id="cn-nested-request"><h3>الطلب</h3><p>صِف الطلب.</p></section>
<section id="cn-nested-applicant"><h3>مقدّم الطلب</h3><p>أدخل بيانات مقدّم الطلب.</p></section>
<section id="cn-nested-documents"><h3>المستندات</h3><p>أرفق المستندات الداعمة.</p></section>
<section id="cn-nested-payment"><h3>الدفع</h3><p>يُتاح الدفع بعد المراجعة.</p></section>
`
```

### دون عنوان ظاهر

ضبط `showHeading` على القيمة false يخفي العنوان، وتبقى `label` تسمّي المعلَم.

```html live example=hidden static
<nav class="hw-content-nav" data-hw="content-navigation" aria-label="أقسام الطلب">
  <ul class="hw-content-nav-list"><li><a class="hw-content-nav-link" href="#cn-hidden-summary" data-hw-section="cn-hidden-summary"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">الملخص</span></a></li><li><a class="hw-content-nav-link" href="#cn-hidden-history" data-hw-section="cn-hidden-history"><span class="hw-content-nav-marker" aria-hidden="true"></span><span class="hw-content-nav-label">السجل</span></a></li></ul>
</nav>
<section id="cn-hidden-summary"><h3>الملخص</h3><p>ملخص موجز للطلب.</p></section>
<section id="cn-hidden-history"><h3>السجل</h3><p>الخطوات السابقة للطلب.</p></section>
```

```tsx live example=hidden
<>
  <ContentNavigation
    label="أقسام الطلب"
    showHeading={false}
    items={[
    { id: 'cn-hidden-summary', label: 'الملخص' },
    { id: 'cn-hidden-history', label: 'السجل' },
  ]}
  />
  <section id="cn-hidden-summary"><h3>الملخص</h3><p>ملخص موجز للطلب.</p></section>
  <section id="cn-hidden-history"><h3>السجل</h3><p>الخطوات السابقة للطلب.</p></section>
</>
```

```vue live example=hidden
<ContentNavigation
  label="أقسام الطلب"
  :show-heading="false"
  :items="[
    { id: 'cn-hidden-summary', label: 'الملخص' },
    { id: 'cn-hidden-history', label: 'السجل' },
  ]"
/>
<section id="cn-hidden-summary"><h3>الملخص</h3><p>ملخص موجز للطلب.</p></section>
<section id="cn-hidden-history"><h3>السجل</h3><p>الخطوات السابقة للطلب.</p></section>
```

```ts live example=hidden framework=angular
template: `<hw-content-navigation
  label="أقسام الطلب"
  [showHeading]="false"
  [items]="[
    { id: 'cn-hidden-summary', label: 'الملخص' },
    { id: 'cn-hidden-history', label: 'السجل' },
  ]"
/>
<section id="cn-hidden-summary"><h3>الملخص</h3><p>ملخص موجز للطلب.</p></section>
<section id="cn-hidden-history"><h3>السجل</h3><p>الخطوات السابقة للطلب.</p></section>
`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createContentNavigation

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `scrollRoot` | `HTMLElement \| null` | `false` | — |
| `offset` | `number` | `false` | — |
| `onCurrentChange` | `(id: string) => void` | `false` | — |
| `label` | `string` | `false` | — |
| `updateHash` | `boolean` | `false` | — |

ليس للتنقل داخل الصفحة شكل يقتصر على ورقة الأنماط ويتتبّع القسم الحالي: اكتب عنصر `nav` بالصنف `hw-content-nav` والخاصية `data-hw="content-navigation"`، وسمِّه بالخاصية `aria-label`، ثم قوائم بالصنفين `hw-content-nav-list` و`hw-content-nav-sublist`، ولكل بند رابطًا بالصنف `hw-content-nav-link`، وعلامةً بالصنف `hw-content-nav-marker`، وتسميةً بالصنف `hw-content-nav-label`. وللعنوان الاختياري الصنف `hw-content-nav-heading`. ويسمّي الرابط قسمه بخاصية href تحمل معرّف المقطع الخاص بقسمه، أو بالخاصية `data-hw-section`. ويضبط المتحكم `aria-current="location"` على رابط القسم الحالي. ويُقرأ من الجذر كلٌّ من `data-hw-scroll-root`، وقيمتها معرّف العنصر الذي يُمرَّر، و`data-hw-offset` و`data-hw-update-hash`. ولا تنشر الخيارات قيمة افتراضية في الإصدار 0.3.0؛ ويستخدم الإصدار المنشور القيمة 80 للإزاحة، والنافذةَ جذرًا للتمرير. والخيار `scrollRoot` هو العنصر الذي يُمرَّر، وإذا لم يُعثر على الجذر المضبوط فلا يعود المتحكم إلى تمرير الصفحة. والخيار `offset` هو المسافة من أعلى جذر التمرير التي تُعدّ بداية القسم. ويكتب الخيار `updateHash` عنوان URL المحسوب عبر history.replaceState. ويتلقى `onCurrentChange` معرّف القسم الحالي. وللمتحكم المُرجَع الأعضاء `current` و`refresh()` و`navigate(id, options)` و`destroy()`؛ ويُرجع `navigate` ما إذا وجد قسمًا ينتقل إليه بالتمرير، وينقل الخيار `focus` في خياراته التركيز إلى القسم. ويُرسل المتحكم أيضًا الحدث `hw:change` مع `detail.current`.

### React

جدول: خصائص ContentNavigation

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `items` | `readonly ContentNavigationItem[]` | `true` | — |
| `showHeading` | `boolean` | `false` | `true` |
| `sticky` | `boolean` | `false` | `false` |
| `scrollRoot` | `HTMLElement \| null` | `false` | `null` |
| `offset` | `number` | `false` | `80` |
| `updateHash` | `boolean` | `false` | `false` |
| `onCurrentChange` | `(id: string) => void` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |

الخاصية `items` هي قائمة البنود؛ ولكل `ContentNavigationItem` الحقلان `id` و`label`، والحقل الاختياري `disabled`، والحقل الاختياري `children` بالشكل نفسه. وتسمّي الخاصية `label` المعلَم وتُعرض عنوانًا له، إلا إذا كانت قيمة `showHeading` هي false؛ وتسمّي `aria-label` أو `aria-labelledby` المعلَم بدلًا منها، ولا يُعرض عنوان دون `label`. والقيمة الافتراضية لـ`showHeading` هي true، ولـ`sticky` هي false، ولـ`scrollRoot` هي null، وتعني النافذة، ولـ`offset` هي 80، ولـ`updateHash` هي false. وتثبّت الخاصية `sticky` المعلَم على الشاشات العريضة، ويتلقى `onCurrentChange` معرّف القسم الحالي. ويصل المرجع إلى عنصر `nav`.

### Vue

جدول: خصائص ContentNavigation وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly ContentNavigationItem[]` | `true` | — |
| `label` | prop | `string` | `false` | — |
| `showHeading` | prop | `boolean` | `false` | `true` |
| `sticky` | prop | `boolean` | `false` | `false` |
| `updateHash` | prop | `boolean` | `false` | `false` |
| `scrollRoot` | prop | `HTMLElement \| null` | `false` | `null` |
| `offset` | prop | `number` | `false` | `80` |
| `currentChange` | event | `(id: string) => void` | `false` | — |

تعمل الخصائص `items` و`label` و`showHeading` و`sticky` و`scrollRoot` و`offset` و`updateHash` كما في React، بالقيم الافتراضية نفسها. والحدث `currentChange` يحمل معرّف القسم الحالي. ولا يسرد الجدول أي منفذ، لأن الإصدار المنشور لا يقرأ أي منفذ.

### Angular

جدول: مُدخلات hw-content-navigation ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `items` | input | `readonly ContentNavigationItem[]` | `true` | — |
| `updateHash` | input | `boolean` | `false` | `false` |
| `showHeading` | input | `boolean` | `false` | `true` |
| `sticky` | input | `boolean` | `false` | `false` |
| `scrollRoot` | input | `HTMLElement \| null` | `false` | `null` |
| `offset` | input | `number` | `false` | `80` |
| `currentChange` | output | `string` | `false` | — |

يعرض `HwContentNavigationComponent` (`hw-content-navigation`) عنصر `nav`. وتعمل المُدخلات `items` و`showHeading` و`sticky` و`scrollRoot` و`offset` و`updateHash` كما في React، بالقيم الافتراضية نفسها. ويُرسل المُخرج `currentChange` معرّف القسم الحالي. ويحتاج المعلَم إلى `label`، أو إلى `aria-label` أو `aria-labelledby` مكتوبة على `hw-content-navigation`.

## إمكانية الوصول

التنقل داخل الصفحة عنصر `nav` يسمّيه `label` أو `aria-label` أو `aria-labelledby`، ويضمّ قوائم متداخلة من الروابط. ويحمل رابط القسم الحالي `aria-current="location"`، فلا تعتمد الحالة على العلامة وحدها. ويبقى البند المعطَّل في النص عنصرًا يحمل `role="link"` و`aria-disabled="true"`، ولا يُفعَّل.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: التنقل داخل الصفحة

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز إلى الرابط المتاح التالي في التنقل، ثم إلى عنصر التحكم التالي في الصفحة. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | ينقل التركيز إلى الرابط المتاح السابق في التنقل، ثم إلى عنصر التحكم السابق في الصفحة. |
| <kbd>Enter</kbd> | يفعّل الرابط الذي عليه التركيز، فينتقل بالتمرير إلى قسمه وينقل التركيز إلى القسم. |

- ينتقل التفعيل العادي بالمؤشر إلى القسم بالتمرير دون تغيير عنوان URL للصفحة؛ وعند ضبط `updateHash` يُكتب عنوان URL المحسوب عبر history.replaceState.
- ينقل التفعيل من لوحة المفاتيح التركيز إلى القسم أيضًا. ويأخذ القسم غير القابل للتركيز الخاصية tabindex بالقيمة -1 مدة التركيز، وتعود الخاصية إلى حالتها السابقة عندما يغادره التركيز.
- لا ينقل التتبّع التلقائي للقسم الحالي التركيز إلى أي قسم، ولا يمرّر المحتوى أبدًا.
- تُتجاهل الأقسام المفقودة والمعطَّلة والمخفية والخاملة والمحجوبة، وكذلك الأقسام داخل عنصر `details` مغلق، باستثناء عنصر الملخص الأول فيه.
- عندما يطلب القارئ تقليل الحركة، يكون الانتقال إلى القسم بالتمرير فوريًا.
- يُبلغ التفعيل عن تغيير واحد للقسم الحالي؛ فتنتقل العلامة إلى القسم المختار، ولا تمرّ بالأقسام التي يعبرها التمرير السلس.

## الاتجاه والتوطين

ليس في التنقل داخل الصفحة نص مدمج: يكتب التطبيق اسم المعلَم والعنوان وتسميات البنود بلغة الصفحة. ويرث العنصر لغة الصفحة واتجاهها، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية، فتقع العلامة والمسافة البادئة للبنود المتداخلة في جهة بدء القراءة، في اتجاهَي القراءة كليهما.

- معرّفات الأقسام قيم يضعها التطبيق، ولا تُعرض للقارئ.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط التنقل داخل الصفحة بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات التنقل داخل الصفحة](../nic-content-navigation.md) التخطيطَ المثبَّت، والشريط المتداخل ومؤشره، وحالات المرور بالمؤشر والتركيز، وتمرير الأقسام، الواردة في ورقة أنماط كود المنصات المزوَّدة وبرنامجها النصي.
- تسجّل [ملاحظات التنقل داخل الصفحة](../nic-content-navigation.md) التكييفات المقصودة، ومنها تتبّع القسم الحالي بالحساب الهندسي للمواضع بدلًا من مراقب التقاطع، وإطار التركيز الظاهر الذي يزيله المصدر، وحذف قاعدة الأقسام العامة، والحشوة المنطقية بدلًا من الحشوة الفيزيائية.
- لا تدخل عناصر الأقسام ومعرّفاتها والتوجيه في ربط المصدر، كما تذكر [ملاحظات التنقل داخل الصفحة](../nic-content-navigation.md)؛ فهي تبقى للتطبيق.
