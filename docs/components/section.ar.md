---
source:
  summary: bc2f44732d68
  example: 1f22946d9020
  variants-and-states: 7d2e5be8ec3a
  api: cf199382b4c8
  accessibility: f569b8ec38e7
  rtl-and-localisation: 72aa604f5705
  platforms-code-reference: dc9d7d4d96b6
---
# قسم

يجمع مكوّن القسم محتوى مترابطًا في كتلة ذات حشوة متّسقة ودرجة لونية اختيارية. ويعرض عنصر `section` دلاليًا عندما يسمح المحوّل بذلك، ويسمّيه التطبيق بالخاصية `aria-labelledby` التي تشير إلى عنصر عنوان، أو بالخاصية `aria-label`.

## مثال

يحمل القسم موضوعًا واحدًا من الصفحة. ويسمّيه عنصر عنوانه، وتربط الخاصية `aria-labelledby` بينهما، فتصل التقنيات المساعدة إلى القسم منطقةً مسمّاة. وتمنحه ورقة الأنماط حشوة بمقدار رمز المسافات 6.

```html live example=basic static differences=section-vue-layout-attributes
<section class="hw-section" aria-labelledby="request-summary-title">
  <h2 id="request-summary-title">ملخّص الطلب</h2>
  <p>قُدّم الطلب 2041 في 4 مارس، وهو قيد المراجعة.</p>
</section>
```

```tsx live example=basic
<Section aria-labelledby="request-summary-title">
  <h2 id="request-summary-title">ملخّص الطلب</h2>
  <p>قُدّم الطلب 2041 في 4 مارس، وهو قيد المراجعة.</p>
</Section>
```

```vue live example=basic
<Section aria-labelledby="request-summary-title">
  <h2 id="request-summary-title">ملخّص الطلب</h2>
  <p>قُدّم الطلب 2041 في 4 مارس، وهو قيد المراجعة.</p>
</Section>
```

```ts live example=basic framework=angular
template: `<section hwSection aria-labelledby="request-summary-title">
  <h2 id="request-summary-title">ملخّص الطلب</h2>
  <p>قُدّم الطلب 2041 في 4 مارس، وهو قيد المراجعة.</p>
</section>`
```

## الأشكال والحالات

### التسمية

عندما لا يكون للقسم عنصر عنوان خاص به، يمنحه التطبيق اسمًا يتعرّف عليه من يقرأ قائمة المناطق. وتكتب صيغ vanilla وReact وVue الخاصية `aria-label` على العنصر. وتأخذ صيغة Angular المُدخل `label`، الذي يكتبه المكوّن في `aria-label`.

```html live example=label static differences=section-vue-layout-attributes
<section class="hw-section" aria-label="بيانات التواصل">
  <p>الهاتف: 0000 0000</p>
  <p>البريد الإلكتروني: services@example.org</p>
</section>
```

```tsx live example=label
<Section aria-label="بيانات التواصل">
  <p>الهاتف: 0000 0000</p>
  <p>البريد الإلكتروني: services@example.org</p>
</Section>
```

```vue live example=label
<Section aria-label="بيانات التواصل">
  <p>الهاتف: 0000 0000</p>
  <p>البريد الإلكتروني: services@example.org</p>
</Section>
```

```ts live example=label framework=angular
template: `<section hwSection label="بيانات التواصل">
  <p>الهاتف: 0000 0000</p>
  <p>البريد الإلكتروني: services@example.org</p>
</section>`
```

### الدرجة اللونية الخافتة

تمنح الخاصية `data-tone` بالقيمة `muted` القسمَ لونَ السطح الخافت في السمة، فيفصل المحتوى المساند عن المحتوى الرئيسي للصفحة. وتكتب محوّلات React وVue وAngular الخاصية على العنصر كأي خاصية أخرى.

```html live example=muted static differences=section-vue-layout-attributes
<section class="hw-section" data-tone="muted" aria-labelledby="muted-title">
  <h2 id="muted-title">قبل أن تبدأ</h2>
  <p>احتفظ بالرقم المرجعي للطلب في متناول يدك.</p>
</section>
```

```tsx live example=muted
<Section data-tone="muted" aria-labelledby="muted-title">
  <h2 id="muted-title">قبل أن تبدأ</h2>
  <p>احتفظ بالرقم المرجعي للطلب في متناول يدك.</p>
</Section>
```

```vue live example=muted
<Section data-tone="muted" aria-labelledby="muted-title">
  <h2 id="muted-title">قبل أن تبدأ</h2>
  <p>احتفظ بالرقم المرجعي للطلب في متناول يدك.</p>
</Section>
```

```ts live example=muted framework=angular
template: `<section hwSection data-tone="muted" aria-labelledby="muted-title">
  <h2 id="muted-title">قبل أن تبدأ</h2>
  <p>احتفظ بالرقم المرجعي للطلب في متناول يدك.</p>
</section>`
```

### الدرجة اللونية للعلامة

تمنح القيمة `brand` القسمَ اللونَ الأساسي الهادئ في السمة ولونَ النص المناسب له. استخدمها لكتلة واحدة تريد الصفحة إبرازها، لا للصفحة كلها.

```html live example=brand static differences=section-vue-layout-attributes
<section class="hw-section" data-tone="brand" aria-labelledby="brand-title">
  <h2 id="brand-title">تابع طلبك</h2>
  <p>لكل طلب رقم مرجعي يميّزه في كل رسالة.</p>
</section>
```

```tsx live example=brand
<Section data-tone="brand" aria-labelledby="brand-title">
  <h2 id="brand-title">تابع طلبك</h2>
  <p>لكل طلب رقم مرجعي يميّزه في كل رسالة.</p>
</Section>
```

```vue live example=brand
<Section data-tone="brand" aria-labelledby="brand-title">
  <h2 id="brand-title">تابع طلبك</h2>
  <p>لكل طلب رقم مرجعي يميّزه في كل رسالة.</p>
</Section>
```

```ts live example=brand framework=angular
template: `<section hwSection data-tone="brand" aria-labelledby="brand-title">
  <h2 id="brand-title">تابع طلبك</h2>
  <p>لكل طلب رقم مرجعي يميّزه في كل رسالة.</p>
</section>`
```

### الحشوة

تضبط الخاصية `padding` حشوة القسم رمزَ مسافات. والرقم 2 هو رمز المسافات 2، وهو أصغر من الرمز الافتراضي 6. وتكتب محوّلات React وVue وAngular القيمة خاصيةَ CSS مخصّصة على العنصر، ويكتب ترميز كتلة JavaScript خاصية CSS المخصّصة نفسها في الخاصية `style`.

```html live example=padding static differences=section-vue-layout-attributes
<section class="hw-section" data-tone="muted" style="--hw-layout-padding: var(--hw-space-2, 0.5rem)" aria-label="مدة المعالجة">
  <p>يُتوقّع صدور القرار خلال خمسة أيام عمل.</p>
</section>
```

```tsx live example=padding
<Section data-tone="muted" padding={2} aria-label="مدة المعالجة">
  <p>يُتوقّع صدور القرار خلال خمسة أيام عمل.</p>
</Section>
```

```vue live example=padding
<Section data-tone="muted" :padding="2" aria-label="مدة المعالجة">
  <p>يُتوقّع صدور القرار خلال خمسة أيام عمل.</p>
</Section>
```

```ts live example=padding framework=angular
template: `<section hwSection data-tone="muted" [padding]="2" label="مدة المعالجة">
  <p>يُتوقّع صدور القرار خلال خمسة أيام عمل.</p>
</section>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-section

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-section'` | `true` | — |
| `data-tone` | `'brand' \| 'muted'` | `false` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس لمكوّن القسم متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر `section` بالصنف `hw-section` وضع المحتوى داخله مباشرة. وتجعله ورقة الأنماط كتلة بحشوة بمقدار رمز المسافات 6، وتغيّرها خاصية CSS المخصّصة `--hw-layout-padding` على قسم واحد. وتأخذ الخاصية `data-tone` إحدى القيمتين `muted` و`brand`؛ ودونها ليس للقسم خلفية خاصة به. ولا تكتب ورقة الأنماط قيمة افتراضية لأيٍّ من الخاصيتين، فكل قيمة افتراضية شرطة طويلة.

### React

جدول: خصائص Section

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

يعرض Section دائمًا عنصر `section`؛ وليس له خاصية تختار عنصرًا آخر. ويقبل خصائص التخطيط المشتركة بين عناصر التخطيط الأساسية مع خصائص عنصر `section`، فيُكتب الاسم بخاصية HTML أصلية مثل `aria-label` أو `aria-labelledby`، والخاصية `data-tone` إحدى هذه الخصائص. وتأخذ الخاصية `padding` رمز مسافات من 0 إلى 16 أو طولًا في CSS، وتقبل كائنًا متجاوبًا بالدرجات `base` و`sm` و`md` و`lg` و`xl`؛ ودونها تطبّق ورقة الأنماط رمز المسافات 6، ويعرض الجدول شرطة طويلة. وتأخذ الخاصية `gap` الصيغ نفسها، لكن القسم كتلة وليس حاوية مرنة أو شبكية، فلا أثر للخاصية `gap` فيه، ولا يغيّر الصندوقَ إلا `padding`. ولا تقرأ أنماط مكوّن القسم أيًّا من خصائص التخطيط الأخرى، فهي تخصّ عناصر تخطيط أساسية أخرى.

### Vue

جدول: خصائص Section وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `as` | prop | `string` | `false` | `'section'` |
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

يحمل المنفذ الافتراضي المحتوى. وتضبط الخاصية `as` العنصر الذي يعرضه Section؛ ودونها يعرض Section عنصر `section`. وللخاصية `padding` المعنى الذي لها في React، ويُكتب الاسم بخاصية HTML أصلية مثل `aria-label` أو `aria-labelledby`. ويكتب Section دائمًا الخاصيتين `data-side` و`data-collapse-at` على عنصره، بالقيمتين الافتراضيتين للخاصيتين `side` و`collapseAt`، ولا تقرؤهما ورقة الأنماط لهذا المكوّن. وتصل خصائص HTML التي لا يعرّفها Section، مثل `data-tone`، إلى العنصر المعروض. وليس للخاصية `wrap` قيمة افتراضية، وتغيب ما لم تُضبط.

### Angular

جدول: مُدخلات hw-section ومخرجاته ومحتواه

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
| `label` | input | `string` | `false` | `''` |
| `*` | content | — | `false` | — |

يُطبَّق `HwSectionComponent` على `hw-section` وعلى محدِّد الخاصية `[hwSection]`. والعنصر المضيف هو الصندوق نفسه: يحمل الصنف `hw-section` وخصائص CSS المخصّصة للتخطيط، وقالبه هو المحتوى المُسقَط وحده. ولذلك ليس `hw-section` عنصر `section`؛ فاكتب `<section hwSection>` عندما يلزم عنصر `section`. ويُكتب المُدخل `label` في `aria-label` ما دام مضبوطًا. وعلى `hw-section` أو على عنصر مضيف آخر غير أصلي، يكتب المُدخل `label` المضبوط أيضًا دور المنطقة، ولا يكتب أي دور على عنصر `section` أصلي. وتبقى الخاصية `aria-label` أو الدور الذي يكتبه التطبيق أو يربطه على العنصر، ولا يحلّ المُدخل `label` محلّهما إلا ما دام مضبوطًا. وللمُدخل `padding` المعنى الذي له في React، ولا أثر للمُدخل `gap` في الصندوق، لأن القسم كتلة. ولا تقرأ أنماط مكوّن القسم أيًّا من المُدخلات الأخرى.

## إمكانية الوصول

مكوّن القسم حاوية تخطيط بعنصر دلالي. فمكوّن React يعرض عنصر `section`؛ ومكوّن Vue يعرض عنصر `section` أو العنصر الذي تسمّيه الخاصية `as`؛ وتحتفظ صيغة Angular `[hwSection]` بالعنصر الأصلي المكتوبة عليه، والعنصر `hw-section` عنصر مضيف عام. ولا يضيف مكوّن القسم عنصرًا قابلًا للتركيز ولا تفاعلًا من لوحة المفاتيح، وينقل <kbd>Tab</kbd> التركيز بين العناصر الأبناء القابلة للتركيز كما يفعل خارج القسم.

- يُعيَّن لعنصر `section` الأصلي الذي لا اسم له الدورُ العام، فلا يُنشئ القسم المرئي بندًا في قائمة المعالم. فامنحه عنصر عنوان واربط بينهما بالخاصية `aria-labelledby`، أو امنحه الخاصية `aria-label`، ليصل إليه القارئ منطقةً مسمّاة.
- لا تسمِّ إلا الأقسام التي يحتاج القارئ إلى الوصول إليها معالمَ. فالمناطق المتعددة التي تحمل الاسم نفسه في صفحة واحدة لا تساعد القارئ الذي يتنقل بالمعالم.
- في Angular، يكتب المُدخل `label` على `hw-section` التسمية ودور المنطقة، ويكتب على عنصر `section` الأصلي التسمية وحدها، لأن العنصر معلم بالفعل.
- لا تغيّر الدرجة اللونية إلا لون السطح ولون النص. فلا تعتمد على الدرجة اللونية وحدها لنقل حالة أو أهمية؛ واذكرها في النص.

> [!NOTE]
> يغيّر مكوّن القسم التخطيط ولا يضيف عنصر عنوان. واختر مستوى عنصر العنوان الذي يحمل عنوان القسم بحسب موضع القسم في الصفحة، لا بحسب مظهره.

## الاتجاه والتوطين

ليس في مكوّن القسم نص مدمج. ويكتب التطبيق العنوان والتسمية والمحتوى بلغة الصفحة.

- الحشوة متساوية على كل الجوانب، فيبدو القسم بالمظهر نفسه في صفحة من اليمين إلى اليسار وفي صفحة من اليسار إلى اليمين.
- يتبع النص داخل القسم اتجاه الصفحة، ويُكتب المُدخل `label` أو الخاصية `aria-label` بلغة الصفحة.
- ألوان الدرجات اللونية رموز تصميم دلالية في السمة، ولا تعتمد على اللغة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط مكوّن القسم بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- مكوّن القسم عنصر تخطيط أساسي في هوية. وتذكر [ملاحظات التخطيط](../layout.md) حشوته الافتراضية بمقدار رمز المسافات 6، وتنصح بعنصر عنوان للقسم المرئي، ولا تسمّي أي مكوّن في ملفات كود المنصات المزوَّدة يقابله مكوّن القسم، فلا تذكر الصفحة أي ربط للمكوّن نفسه.
- يُدرج مكوّن القسم مع عناصر التخطيط الأساسية في نطاق المكوّنات في [ملاحظات التغطية](../coverage.md). وتُضبط الدرجتان اللونيتان في ورقة الأنماط من رمزَي الألوان الدلاليين `--hw-color-surface-muted` و`--hw-color-primary-subtle`.
