---
source:
  summary: 0e79be5346c2
  example: a1a15a6c8bc5
  variants-and-states: 63ac34f8b867
  api: d7930cc22681
  accessibility: 4cb6a15e0b29
  rtl-and-localisation: 5b853e44017a
  platforms-code-reference: 80c34726c5f7
---
# ترتيب أفقي

يرتّب مكوّن الترتيب الأفقي أبناءه في صف واحد بمسافة ومحاذاة مشتركتين، ويلفّهم إلى صفوف أخرى عندما يمتلئ الصف. وهو مكوّن تخطيط أساسي ليس له سلوك خاص به، وعنصره المضيف هو العنصر الذي يحمل الصنف `hw-inline`.

## مثال

يضمّ الترتيب الأفقي عناصر تحكم مترابطة أو بنودًا قصيرة تُقرأ مجموعةً واحدة، مثل إجراءات نموذج. ويتتابع الأبناء على امتداد الصف بترتيب الترميز، بالمسافة نفسها بين كل اثنين متجاورين، ويقعون في الوسط على المحور المتعامد.

```html live example=basic static differences=inline-vue-layout-attributes
<div class="hw-inline">
  <button class="hw-button" type="button" data-variant="primary" data-size="md">تقديم الطلب</button>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">حفظ كمسودة</button>
</div>
```

```tsx live example=basic
<Inline>
  <Button variant="primary">تقديم الطلب</Button>
  <Button variant="secondary">حفظ كمسودة</Button>
</Inline>
```

```vue live example=basic
<Inline>
  <Button variant="primary">تقديم الطلب</Button>
  <Button variant="secondary">حفظ كمسودة</Button>
</Inline>
```

```ts live example=basic framework=angular
template: `<hw-inline>
  <button hwButton variant="primary">تقديم الطلب</button>
  <button hwButton variant="secondary">حفظ كمسودة</button>
</hw-inline>`
```

## الأشكال والحالات

### المسافة بين الأبناء

تضبط الخاصية `gap` المسافة بين الأبناء. والرقم 6 هو رمز المسافة 6، وهو مسافة أكبر من الرمز الافتراضي 4. وتكتب محوّلات React وVue وAngular القيمة خاصيةَ CSS مخصّصة على عنصر الترتيب الأفقي، ويكتب ترميز كتلة JavaScript خاصية CSS المخصّصة نفسها في الخاصية `style`.

```html live example=gap static differences=inline-vue-layout-attributes
<div class="hw-inline" style="--hw-layout-gap: var(--hw-space-6, 1.5rem)">
  <button class="hw-button" type="button" data-variant="primary" data-size="md">تقديم الطلب</button>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">حفظ كمسودة</button>
</div>
```

```tsx live example=gap
<Inline gap={6}>
  <Button variant="primary">تقديم الطلب</Button>
  <Button variant="secondary">حفظ كمسودة</Button>
</Inline>
```

```vue live example=gap
<Inline :gap="6">
  <Button variant="primary">تقديم الطلب</Button>
  <Button variant="secondary">حفظ كمسودة</Button>
</Inline>
```

```ts live example=gap framework=angular
template: `<hw-inline [gap]="6">
  <button hwButton variant="primary">تقديم الطلب</button>
  <button hwButton variant="secondary">حفظ كمسودة</button>
</hw-inline>`
```

### التوزيع

توزّع الخاصية `justify` الأبناء على امتداد الصف. فبالقيمة `between` يقع الابن الأول في بداية الصف والأخير في نهايته، وتكون المساحة الحرة بينهما؛ ودون قيمة يجتمع الأبناء في البداية.

```html live example=justify static differences=inline-vue-layout-attributes
<div class="hw-inline" style="--hw-layout-justify: space-between">
  <span>الطلب رقم 2041</span>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">عرض التفاصيل</button>
</div>
```

```tsx live example=justify
<Inline justify="between">
  <span>الطلب رقم 2041</span>
  <Button variant="secondary">عرض التفاصيل</Button>
</Inline>
```

```vue live example=justify
<Inline justify="between">
  <span>الطلب رقم 2041</span>
  <Button variant="secondary">عرض التفاصيل</Button>
</Inline>
```

```ts live example=justify framework=angular
template: `<hw-inline justify="between">
  <span>الطلب رقم 2041</span>
  <button hwButton variant="secondary">عرض التفاصيل</button>
</hw-inline>`
```

### دون التفاف

يلفّ الترتيب الأفقي أبناءه افتراضيًا إلى صفوف أخرى. وعند ضبط `wrap` على `false` يبقى الأبناء في صف واحد ولا ينكسر الصف، فلا تستخدمه إلا لبنود قليلة قصيرة تتسع لها الصفحة في أضيق عرض لها.

```html live example=nowrap static differences=inline-vue-layout-attributes
<div class="hw-inline" style="--hw-layout-wrap: nowrap">
  <button class="hw-button" type="button" data-variant="primary" data-size="md">تقديم</button>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">حفظ</button>
</div>
```

```tsx live example=nowrap
<Inline wrap={false}>
  <Button variant="primary">تقديم</Button>
  <Button variant="secondary">حفظ</Button>
</Inline>
```

```vue live example=nowrap
<Inline :wrap="false">
  <Button variant="primary">تقديم</Button>
  <Button variant="secondary">حفظ</Button>
</Inline>
```

```ts live example=nowrap framework=angular
template: `<hw-inline [wrap]="false">
  <button hwButton variant="primary">تقديم</button>
  <button hwButton variant="secondary">حفظ</button>
</hw-inline>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-inline

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-inline'` | `true` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس للترتيب الأفقي متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصرًا بالصنف `hw-inline` وضع الأبناء داخله مباشرة. والمسافة الافتراضية بين الأبناء هي رمز المسافة 4 من `@hawiyah/tokens`. وتضبط خصائص CSS المخصّصة محصورة النطاق في ورقة الأنماط، التي تكتبها المحوّلات، مسافة أخرى أو توزيعًا آخر أو التفاف ترتيب أفقي واحد؛ وهي خصائص تخطيط محصورة النطاق، وليست رموز تصميم عامة. والصنف `hw-inline` خارج عقد ورقة الأنماط في الإصدار 0.3.0، فيُقرأ جدوله من ورقة الأنماط المنشورة.

### React

جدول: خصائص Inline

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

يعرض الترتيب الأفقي دائمًا عنصر `div`، وليس له خاصية تختار عنصرًا آخر. ويقبل خصائص التخطيط المشتركة بين مكوّنات التخطيط الأساسية مع خصائص عنصر `div`. وتأخذ الخاصيتان `gap` و`padding` رمز مسافة من 0 إلى 16 أو طولًا من أطوال CSS، وتقبل كلتاهما كائنًا متجاوبًا بالدرجات `base` و`sm` و`md` و`lg` و`xl`. وتضبط الخاصية `align` المحاذاة على المحور المتعامد، وتوزّع الخاصية `justify` الأبناء على امتداد الصف. وتُبقي الخاصية `wrap` المضبوطة على `false` الأبناء في صف واحد، ودونها يلتفّ الصف. ولا تقرأ ورقة الأنماط أيًّا من `columns` و`minItemWidth` و`side` و`sidebarWidth` و`collapseAt` و`maxWidth` و`ratio`، فهي تخصّ مكوّنات أساسية أخرى. وعندما لا تُعطى قيمة، تأتي كل قيمة افتراضية من ورقة الأنماط: مسافة بقدر رمز المسافة 4، ولا حشوة، و`align` بالقيمة `center`، و`justify` بالقيمة `start`، والتفاف الصف، فيعرض الجدول شرطة طويلة لكل منها.

### Vue

جدول: خصائص Inline وأحداثه ومنافذه

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

يحتوي المنفذ الافتراضي على الأبناء. وتضبط الخاصية `as` العنصر الذي يعرضه الترتيب الأفقي، وهو `div` ما لم يُعطَ وسم آخر، فيمكن أن يكون صف البنود المترابطة عنصر `ul` أبناؤه عناصر `li`. وللخصائص `gap` و`padding` و`align` و`justify` و`wrap` المعنى نفسه الذي لها في React، وتُقبل خصائص التخطيط الأخرى من أجل الواجهة المشتركة، لكن أنماط الترتيب الأفقي لا تقرؤها. ويكتب الترتيب الأفقي دائمًا `data-side` و`data-collapse-at` على عنصره، بالقيمتين الافتراضيتين للخاصيتين `side` و`collapseAt`، ولا تقرؤهما ورقة الأنماط. وتصل خصائص HTML والمستمعات التي لا يصرّح بها الترتيب الأفقي إلى العنصر المعروض. وليس للخاصية `wrap` قيمة افتراضية، فهي غائبة ما لم تُضبط، ودونها يلتفّ الصف.

### Angular

جدول: مُدخلات hw-inline ومخرجاته ومحتواه

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
| `*` | content | — | `false` | — |

يُطبَّق `HwInlineComponent` على `hw-inline`. والعنصر المضيف هو الصندوق: يحمل الصنف `hw-inline` وخصائص CSS المخصّصة للتخطيط، وقالبه هو المحتوى المُسقَط وحده، والعناصر المُسقَطة أبناؤه المباشرون. لذلك تقع الخاصيتان `class` و`id` وخصائص ARIA وخصائص البيانات المكتوبة على `hw-inline` على العنصر الذي تنسّقه ورقة الأنماط. ويطبّق محدّد الخاصية `[hwInline]` في المكوّن نفسه الصندوقَ نفسه على عنصر أصلي يحتفظ بوسمه، مثل `ul`. وللمُدخلات `gap` و`padding` و`align` و`justify` و`wrap` المعنى نفسه الذي لها في React؛ أما المُدخلات الأخرى فموجودة من أجل الواجهة المشتركة، ولا تقرؤها أنماط الترتيب الأفقي. والمُدخل `wrap` منطقي، وكتابة الخاصية دون قيمة تضبطه على `true`، ولا يكتب المُدخل غير المضبوط شيئًا.

## إمكانية الوصول

الترتيب الأفقي حاوية تخطيط. يعرض مكوّن React عنصر `div`، ويعرض مكوّن Vue عنصر `div` أو العنصر الذي تسمّيه `as`، ويعرض عنصر Angular `hw-inline` نفسه، ويحتفظ الشكل `[hwInline]` بالعنصر الأصلي المكتوب عليه. ولا يضيف الترتيب الأفقي في أيٍّ من هذه الأشكال دورًا ولا اسمًا ولا عنصرًا قابلًا للتركيز، فتأتي دلالات الصفحة من أبنائه.

- الترتيب المرئي هو ترتيب الترميز. فورقة الأنماط تضبط صفًا دون أن تعكسه أو تعيد ترتيبه، والابن الذي يلتفّ إلى الصف التالي يتبع الابن الذي قبله، فاكتب الأبناء بالترتيب الذي يُقرؤون به ويُنقل إليهم التركيز.
- ليس للترتيب الأفقي تفاعل خاص به من لوحة المفاتيح، وينقل المفتاح <kbd>Tab</kbd> التركيز بين الأبناء القابلين للتركيز كما يفعل خارج الترتيب الأفقي.
- لا يمنح الترتيب الأفقي اسمًا ميسّرًا. ومجموعة عناصر التحكم التي يجب أن تعلنها التقنيات المساعدة مجموعةً تحتاج إلى عنصر أصلي له اسمه الخاص، مثل `fieldset` مع `legend`، أو عنصر يحمل `role="group"` و`aria-label`.
- قائمة البنود عنصر `ul` أو `ol` أصلي. ففي Vue تعرض الخاصية `as` الترتيب الأفقي بهذا العنصر، وفي Angular يفعل الشكل `[hwInline]` الشيء نفسه؛ وفي React وفي ترميز vanilla امنح عنصر القائمة الصنف `hw-inline`. والقائمة الموضوعة داخل ترتيب أفقي ابن واحد له، فلا تُرتَّب بنودها في الصف.

> [!NOTE]
> يغيّر الترتيب الأفقي التخطيط لا المعنى. ومجموعة الإجراءات التي هي شريط أدوات أو قائمة أو مجموعة خيارات تحتفظ بترميزها الأصلي. وعندما تكوّن البنود نفسها الصف، يحمل عنصرُها الترتيبَ الأفقي (الخاصية `as` أو الشكل `[hwInline]` أو الصنف `hw-inline`)؛ أما شريط الأدوات أو المجموعة التي هي بند بين بنود أخرى فتقع داخل الترتيب الأفقي.

## الاتجاه والتوطين

ليس في الترتيب الأفقي نص مدمج: يكتب التطبيق كل عنصر ابن بلغة الصفحة. ويرث الترتيب الأفقي لغة الصفحة واتجاهها، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية.

- يبدأ الصف من جهة بدء القراءة، فيقع الابن الأول عند الحافة اليمنى في صفحة اتجاهها من اليمين إلى اليسار، وعند الحافة اليسرى في صفحة اتجاهها من اليسار إلى اليمين. اكتب الأبناء بترتيب القراءة، فيتبع الصف الاتجاه.
- تتبع القيمتان `start` و`end` للخاصية `justify` اتجاه الصفحة، وكذلك التوزيع `between` الذي يُبقي الابن الأول عند جهة بدء القراءة.
- المسافة بين الأبناء والحشوة متماثلتان في العربية وفي الإنجليزية، ولا يغيّر أي محوّل التخطيط بحسب اللغة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط الترتيب الأفقي بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- الترتيب الأفقي مكوّن تخطيط أساسي في هوية، ويُدرج بين مكوّنات التخطيط الأساسية، في الصف Layout من نطاق المكوّنات، في [ملاحظات التغطية](../coverage.md). ولا تسرد [ملاحظات التخطيط](../layout.md) من ملفات كود المنصات المزوَّدة إلا أبعاد الحاوية وأبعاد قالب الخدمة، ولا تسمّي مكوّنًا يقابله الترتيب الأفقي، فلا تدّعي الصفحة ربط المكوّن نفسه بكود المنصات.
- يصف جدول المكوّنات الأساسية في [ملاحظات التخطيط](../layout.md) الترتيب الأفقي بأنه المكوّن الأساسي للإجراءات والبيانات الوصفية وعناصر التحكم الملتفّة، صفًا من نوع flex بمحاذاة في الوسط والتفاف؛ وهذا توجيه من المكتبة، وليس ربطًا بكود المنصات. وتأتي المسافة الافتراضية بين الأبناء ورموز المسافات من الرموز الدلالية التي تستخدمها المكوّنات الأخرى، كما تصف [ملاحظات التخطيط](../layout.md)؛ وتذكر ملاحظات التخطيط أيضًا أن التخطيط تقوده CSS، ولا يقيس إطار العرض في JavaScript.
