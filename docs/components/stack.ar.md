---
source:
  summary: f0fe19d86153
  example: 1b7985a15481
  variants-and-states: 34d6f57d601b
  api: 55eb318f01ed
  accessibility: 4257f1a0ef27
  rtl-and-localisation: 89f3252532ee
  platforms-code-reference: 636046a2f665
---
# ترتيب عمودي

يرتّب مكوّن الترتيب العمودي عناصره الأبناء في عمود واحد بمسافات ومحاذاة مشتركة. وهو عنصر تخطيط أساسي ليس له سلوك خاص به، وعنصره المضيف هو العنصر الذي يأخذ الصنف `hw-stack`.

## مثال

يُبقي الترتيب العمودي الكتل المترابطة في الصفحة في تسلسل عمودي واحد. ويلي كل عنصر ابن العنصر الذي يسبقه في ترتيب الشيفرة المصدرية، مع المسافة نفسها بين كل عنصرين متتاليين.

```html live example=basic static differences=stack-vue-layout-attributes
<div class="hw-stack">
  <p>قُدِّم الطلب 2041 في 4 مارس.</p>
  <p>الطلب قيد المراجعة.</p>
  <p>يُتوقَّع صدور القرار خلال خمسة أيام عمل.</p>
</div>
```

```tsx live example=basic
<Stack>
  <p>قُدِّم الطلب 2041 في 4 مارس.</p>
  <p>الطلب قيد المراجعة.</p>
  <p>يُتوقَّع صدور القرار خلال خمسة أيام عمل.</p>
</Stack>
```

```vue live example=basic
<Stack>
  <p>قُدِّم الطلب 2041 في 4 مارس.</p>
  <p>الطلب قيد المراجعة.</p>
  <p>يُتوقَّع صدور القرار خلال خمسة أيام عمل.</p>
</Stack>
```

```ts live example=basic framework=angular
template: `<hw-stack>
  <p>قُدِّم الطلب 2041 في 4 مارس.</p>
  <p>الطلب قيد المراجعة.</p>
  <p>يُتوقَّع صدور القرار خلال خمسة أيام عمل.</p>
</hw-stack>`
```

## الأشكال والحالات

### الفجوة

تضبط الخاصية `gap` المسافة بين العناصر الأبناء. والرقم 2 هو رمز المسافات 2، وهو مسافة أصغر من الرمز الافتراضي 4. وتكتب محوّلات React وVue وAngular القيمة خاصيةَ CSS مخصّصة على عنصر الترتيب العمودي، ويكتب ترميز كتلة JavaScript خاصية CSS المخصّصة نفسها في الخاصية `style`.

```html live example=gap static differences=stack-vue-layout-attributes
<div class="hw-stack" style="--hw-layout-gap: var(--hw-space-2, 0.5rem)">
  <p>قُدِّم الطلب 2041 في 4 مارس.</p>
  <p>الطلب قيد المراجعة.</p>
  <p>يُتوقَّع صدور القرار خلال خمسة أيام عمل.</p>
</div>
```

```tsx live example=gap
<Stack gap={2}>
  <p>قُدِّم الطلب 2041 في 4 مارس.</p>
  <p>الطلب قيد المراجعة.</p>
  <p>يُتوقَّع صدور القرار خلال خمسة أيام عمل.</p>
</Stack>
```

```vue live example=gap
<Stack :gap="2">
  <p>قُدِّم الطلب 2041 في 4 مارس.</p>
  <p>الطلب قيد المراجعة.</p>
  <p>يُتوقَّع صدور القرار خلال خمسة أيام عمل.</p>
</Stack>
```

```ts live example=gap framework=angular
template: `<hw-stack [gap]="2">
  <p>قُدِّم الطلب 2041 في 4 مارس.</p>
  <p>الطلب قيد المراجعة.</p>
  <p>يُتوقَّع صدور القرار خلال خمسة أيام عمل.</p>
</hw-stack>`
```

### المحاذاة

تضبط الخاصية `align` محاذاة العناصر الأبناء في عرض العمود. وبالقيمة `center` يحتفظ كل عنصر ابن بعرض محتواه، ويقع في منتصف الترتيب العمودي؛ ودون قيمة تتمدّد العناصر الأبناء إلى عرض الترتيب العمودي.

```html live example=alignment static differences=stack-vue-layout-attributes
<div class="hw-stack" style="--hw-layout-align: center">
  <button class="hw-button" type="button" data-variant="primary" data-size="md">تقديم الطلب</button>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">حفظ مسودة</button>
</div>
```

```tsx live example=alignment
<Stack align="center">
  <Button variant="primary">تقديم الطلب</Button>
  <Button variant="secondary">حفظ مسودة</Button>
</Stack>
```

```vue live example=alignment
<Stack align="center">
  <Button variant="primary">تقديم الطلب</Button>
  <Button variant="secondary">حفظ مسودة</Button>
</Stack>
```

```ts live example=alignment framework=angular
template: `<hw-stack align="center">
  <button hwButton variant="primary">تقديم الطلب</button>
  <button hwButton variant="secondary">حفظ مسودة</button>
</hw-stack>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-stack

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-stack'` | `true` | — |

ليس لمكوّن الترتيب العمودي متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصرًا بالصنف `hw-stack`، وضع العناصر الأبناء داخله مباشرة. والمسافة الافتراضية بين العناصر الأبناء هي رمز المسافات 4 من `@hawiyah/tokens`. وتضبط خاصية CSS المخصّصة للفجوة في ورقة الأنماط، وهي محصورة في نطاق العنصر وتُكتب بشرطتين ثم hw ثم شرطة ثم gap، فجوةً أخرى على ترتيب عمودي واحد؛ ويصفها README الحزمة `@hawiyah/styles` بأنها وسيلة لتخصيص التخطيط، لا رمز تصميم عامّ. ويسرد عقد ورقة الأنماط الصنف `hw-stack` في الصف Layout.

### React

جدول: خصائص Stack

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

يعرض Stack دائمًا عنصر `div`؛ وليس له خاصية تختار عنصرًا آخر. ويقبل خصائص التخطيط المشتركة بين عناصر التخطيط الأساسية مع خصائص عنصر `div`. وتأخذ الخاصيتان `gap` و`padding` رمز مسافات من 0 إلى 16 أو طولًا في CSS، وتقبل كلتاهما كائنًا متجاوبًا بالدرجات `base` و`sm` و`md` و`lg` و`xl`. وتضبط الخاصية `align` المحاذاة على المحور المتقاطع، وتوزّع الخاصية `justify` العناصر الأبناء على طول العمود. وتثبّت ورقة الأنماط Stack عمودًا دون التفاف، ولا تقرأ أيًّا من `wrap` و`columns` و`minItemWidth` و`side` و`sidebarWidth` و`collapseAt` و`maxWidth` و`ratio`، فهي تخصّ عناصر تخطيط أساسية أخرى. ودون قيمة تأتي كل قيمة افتراضية من ورقة الأنماط: فجوة بمقدار رمز المسافات 4، ولا حشوة، والقيمة `stretch` للخاصية `align`، والقيمة `start` للخاصية `justify`؛ ولذلك يعرض الجدول شرطة طويلة لكل منها.

### Vue

جدول: خصائص Stack وأحداثه ومنافذه

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

يحمل المنفذ الافتراضي العناصر الأبناء. وتضبط الخاصية `as` العنصر الذي يعرضه Stack، وهو `div` ما لم يُكتب وسم آخر، فيمكن أن تكون قائمة البنود المترابطة عنصر `ul` أبناؤه عناصر `li`. وللخصائص `gap` و`padding` و`align` و`justify` المعنى الذي لها في React، وتُقبل خصائص التخطيط الأخرى من أجل العقد المشترك لخصائص التخطيط، لكن أنماط الترتيب العمودي لا تقرؤها. ويكتب Stack دائمًا الخاصيتين `data-side` و`data-collapse-at` على عنصره، بالقيمتين الافتراضيتين للخاصيتين `side` و`collapseAt`، ولا تقرؤهما ورقة الأنماط. وتصل خصائص HTML والمستمعات التي لا يعرّفها Stack إلى العنصر المعروض. وليس للخاصية `wrap` قيمة افتراضية، وتغيب ما لم تُضبط.

### Angular

جدول: مُدخلات hw-stack ومخرجاته ومحتواه

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

يُطبَّق `HwStackComponent` على `hw-stack`. والعنصر المضيف هو الصندوق نفسه: يحمل الصنف `hw-stack` وخصائص CSS المخصّصة للتخطيط، وقالبه هو المحتوى المُسقَط وحده، والعناصر المُسقَطة أبناؤه المباشرون. ولذلك تقع خصائص class وid وARIA وdata المكتوبة على `hw-stack` على العنصر الذي تنسّقه ورقة الأنماط. ويطبّق محدِّد الخاصية `[hwStack]` للمكوّن نفسه الصندوقَ نفسه على عنصر أصلي، فيحتفظ العنصر بوسمه، مثل عنصر `ul`. وللمُدخلات `gap` و`padding` و`align` و`justify` المعنى الذي لها في React؛ والمُدخلات الأخرى موجودة من أجل العقد المشترك، ولا تقرؤها أنماط الترتيب العمودي. ويقبل المُدخلان `gap` و`padding` الكائن المتجاوب الذي يقبله React.

## إمكانية الوصول

مكوّن الترتيب العمودي حاوية تخطيط. فمكوّن React يعرض عنصر `div`؛ ومكوّن Vue يعرض عنصر `div` أو العنصر الذي تسمّيه الخاصية `as`؛ وعنصر Angular `hw-stack` يعرض نفسه، وتحتفظ الصيغة `[hwStack]` بالعنصر الأصلي المكتوبة عليه. ولا يضيف مكوّن الترتيب العمودي في أي صيغة دورًا ولا اسمًا ولا عنصرًا قابلًا للتركيز، فتأتي دلالات الصفحة من عناصره الأبناء.

- الترتيب المرئي هو ترتيب الشيفرة المصدرية. وتضبط ورقة الأنماط عمودًا دون عكسه أو إعادة ترتيبه، فاكتب العناصر الأبناء بالترتيب الذي تُقرأ به ويُنقل إليها التركيز.
- ليس لمكوّن الترتيب العمودي تفاعل خاص به من لوحة المفاتيح، وينقل <kbd>Tab</kbd> التركيز بين العناصر الأبناء القابلة للتركيز كما يفعل خارج الترتيب العمودي.
- لا يمنح مكوّن الترتيب العمودي اسمًا ميسّرًا. ويحتاج الترتيب العمودي الذي يجمع محتوى للتقنيات المساعدة إلى عنصر أصلي له اسمه الخاص، مثل عنصر `section` له عنصر عنوان أو الخاصية `aria-label`.
- قائمة البنود عنصر `ul` أو `ol` أصلي. ففي Vue تعرض الخاصية `as` الترتيب العمودي بهذا العنصر، وفي Angular تفعل الصيغة `[hwStack]` الشيء نفسه؛ أما في React وفي ترميز vanilla فضع القائمة داخل الترتيب العمودي، أو امنح عنصر القائمة الصنف `hw-stack`.

> [!NOTE]
> يغيّر مكوّن الترتيب العمودي التخطيط، لا المعنى. فتسلسل الكتل الذي يكون قائمة أو نموذجًا أو مجموعة خطوات يحتفظ بترميزه الأصلي، إما عنصرًا للترتيب العمودي عندما يسمح المحوّل بذلك، وإما داخل الترتيب العمودي.

## الاتجاه والتوطين

ليس في مكوّن الترتيب العمودي نص مدمج. ويكتب التطبيق كل عنصر ابن بلغة الصفحة. ويرث الترتيب العمودي لغة الصفحة واتجاهها، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية.

- يمتد العمود من الأعلى إلى الأسفل في اتجاهَي القراءة كليهما؛ ولا يعكسه اتجاه الصفحة.
- تتبع القيمتان `start` و`end` للخاصية `align` اتجاه الصفحة، فعند كتابة `align="start"` تصطف العناصر الأبناء عند الحافة اليمنى في صفحة من اليمين إلى اليسار، وعند الحافة اليسرى في صفحة من اليسار إلى اليمين.
- الفجوة والحشوة نفسهما في العربية وفي الإنجليزية؛ ولا يغيّر أي محوّل التخطيط بحسب اللغة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط الترتيب العمودي بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- مكوّن الترتيب العمودي عنصر تخطيط أساسي في هوية. ولا تسرد [ملاحظات التخطيط](../layout.md) إلا أبعاد الحاوية وأبعاد قوالب الخدمات الواردة في ملفات كود المنصات المزوَّدة، ولا تسمّي أي مكوّن يقابله الترتيب العمودي، فلا تذكر الصفحة أي ربط للمكوّن نفسه.
- تأتي الفجوة الافتراضية ورموز المسافات من الرموز الدلالية التي تستخدمها المكوّنات الأخرى، كما تصف [ملاحظات التخطيط](../layout.md)؛ وتذكر ملاحظات التخطيط أيضًا أن التخطيط يقوم على CSS ولا يقيس نافذة العرض في JavaScript.
