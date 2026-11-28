---
source:
  summary: d7889a557d21
  example: 88d476e7bc43
  variants-and-states: 16ca66021197
  api: 2e882eb6cfcb
  accessibility: 6271ff34154c
  rtl-and-localisation: 25962cbe927b
  platforms-code-reference: f44c1f7a086a
---
# توسيط

يضع مكوّن التوسيط عناصره الأبناء في عمود واحد، ويوسّطها على المحورين، مع نص موسَّط. وهو عنصر تخطيط أساسي ليس له سلوك خاص به، وهو العنصر الذي يأخذ الصنف `hw-center`.

## مثال

تعرض الصفحة التي ليس فيها بعدُ ما تسرده رسالةً واحدة موسَّطة مع إجرائها. ويقع كل عنصر ابن في منتصف العرض المتاح، ويكون النص موسَّطًا.

```html live example=basic differences=center-vue-layout-attributes
<div class="hw-center">
  <p>ليس لديك طلبات مفتوحة.</p>
  <button class="hw-button" type="button" data-variant="primary" data-size="md">تقديم طلب جديد</button>
</div>
```

```tsx live example=basic
<Center>
  <p>ليس لديك طلبات مفتوحة.</p>
  <Button variant="primary">تقديم طلب جديد</Button>
</Center>
```

```vue live example=basic
<Center>
  <p>ليس لديك طلبات مفتوحة.</p>
  <Button variant="primary">تقديم طلب جديد</Button>
</Center>
```

```ts live example=basic framework=angular
template: `<hw-center>
  <p>ليس لديك طلبات مفتوحة.</p>
  <button hwButton variant="primary">تقديم طلب جديد</button>
</hw-center>`
```

## الأشكال والحالات

### الحشوة

تضيف الخاصية `padding` مسافة داخل الصندوق، حول المحتوى الموسَّط. والرقم 6 هو رمز المسافات 6. وتكتب محوّلات React وVue وAngular القيمة خاصيةَ CSS مخصّصة على عنصر الصندوق، ويكتب ترميز كتلة JavaScript خاصية CSS المخصّصة نفسها في الخاصية `style`.

```html live example=padding differences=center-vue-layout-attributes
<div class="hw-center" style="--hw-layout-padding: var(--hw-space-6, 1.5rem)">
  <p>لم يُضَف أي مستند إلى هذا الطلب.</p>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">إضافة مستند</button>
</div>
```

```tsx live example=padding
<Center padding={6}>
  <p>لم يُضَف أي مستند إلى هذا الطلب.</p>
  <Button variant="secondary">إضافة مستند</Button>
</Center>
```

```vue live example=padding
<Center :padding="6">
  <p>لم يُضَف أي مستند إلى هذا الطلب.</p>
  <Button variant="secondary">إضافة مستند</Button>
</Center>
```

```ts live example=padding framework=angular
template: `<hw-center [padding]="6">
  <p>لم يُضَف أي مستند إلى هذا الطلب.</p>
  <button hwButton variant="secondary">إضافة مستند</button>
</hw-center>`
```

### المحاذاة

تضبط الخاصية `align` محاذاة العناصر الأبناء على المحور المتقاطع، وتضبط الخاصية `justify` توزيعها على المحور الرئيسي. وعند كتابة `align="start"` تصطف العناصر الأبناء عند جهة بدء القراءة بدلًا من المنتصف؛ ويبقى النص موسَّطًا.

```html live example=align differences=center-vue-layout-attributes
<div class="hw-center" style="--hw-layout-align: start">
  <p>لم يُضَف أي مستند إلى هذا الطلب.</p>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">إضافة مستند</button>
</div>
```

```tsx live example=align
<Center align="start">
  <p>لم يُضَف أي مستند إلى هذا الطلب.</p>
  <Button variant="secondary">إضافة مستند</Button>
</Center>
```

```vue live example=align
<Center align="start">
  <p>لم يُضَف أي مستند إلى هذا الطلب.</p>
  <Button variant="secondary">إضافة مستند</Button>
</Center>
```

```ts live example=align framework=angular
template: `<hw-center align="start">
  <p>لم يُضَف أي مستند إلى هذا الطلب.</p>
  <button hwButton variant="secondary">إضافة مستند</button>
</hw-center>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-center

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-center'` | `true` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس لمكوّن التوسيط متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصرًا بالصنف `hw-center`، وضع العناصر الأبناء داخله مباشرة. وتجعله ورقة الأنماط عمودًا مرنًا محاذاته على المحور المتقاطع وتوزيعه على المحور الرئيسي كلاهما `center`، وتوسّط النص. والمسافة الافتراضية بين العناصر الأبناء هي رمز المسافات 4 من `@hawiyah/tokens`. وتضبط خاصيتا CSS المخصّصتان `--hw-layout-gap` و`--hw-layout-padding` فجوة أخرى أو حشوة أخرى على عنصر واحد، كما يكتب مثال «الحشوة» الثانية منهما. ويحتاج التوسيط العمودي إلى حاوية أطول من محتواها، مثل حاوية لها حد أدنى لحجمها في اتجاه الكتل يضبطه التطبيق.

### React

جدول: خصائص Center

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

يعرض Center دائمًا عنصر `div`؛ وليس له خاصية تختار عنصرًا آخر. ويقبل خصائص التخطيط المشتركة بين عناصر التخطيط الأساسية مع خصائص عنصر `div`. وتأخذ الخاصيتان `gap` و`padding` رمز مسافات من 0 إلى 16 أو طولًا في CSS، وتقبل كلتاهما كائنًا متجاوبًا بالدرجات `base` و`sm` و`md` و`lg` و`xl`. وتحلّ الخاصيتان `align` و`justify` محلّ التوسيط على المحور المتقاطع وعلى المحور الرئيسي. وتثبّت ورقة الأنماط Center عمودًا دون التفاف، ولا تقرأ أيًّا من `wrap` و`columns` و`minItemWidth` و`side` و`sidebarWidth` و`collapseAt` و`maxWidth` و`ratio`، فهي تخصّ عناصر تخطيط أساسية أخرى. ودون قيمة تمنح ورقة الأنماط فجوة بمقدار رمز المسافات 4، ولا حشوة، والقيمة `center` للخاصيتين `align` و`justify`؛ ويعرض الجدول شرطة طويلة لكل خاصية، لأن مكوّن React لا يعرّف قيمة افتراضية لأي خاصية تخطيط.

### Vue

جدول: خصائص Center وأحداثه ومنافذه

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

يحمل المنفذ الافتراضي العناصر الأبناء. وتضبط الخاصية `as` العنصر الذي يعرضه Center، وهو `div` ما لم يُكتب وسم آخر. وللخصائص `gap` و`padding` و`align` و`justify` المعنى الذي لها في React، وتُقبل خصائص التخطيط الأخرى من أجل العقد المشترك لخصائص التخطيط، لكن أنماط مكوّن التوسيط لا تقرؤها. ويكتب Center دائمًا الخاصيتين `data-side` و`data-collapse-at` على عنصره، بالقيمتين الافتراضيتين للخاصيتين `side` و`collapseAt`، ولا تقرؤهما ورقة الأنماط. وتصل خصائص HTML والمستمعات التي لا يعرّفها Center إلى العنصر المعروض. وليس للخاصية `wrap` قيمة افتراضية، وتغيب ما لم تُضبط.

### Angular

جدول: مُدخلات hw-center ومخرجاته ومحتواه

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

يُطبَّق `HwCenterComponent` على `hw-center`. والعنصر المضيف هو الصندوق نفسه: يحمل الصنف `hw-center` وخصائص CSS المخصّصة للتخطيط، وقالبه هو المحتوى المُسقَط وحده، والعناصر المُسقَطة أبناؤه المباشرون. ولذلك تقع خصائص class وid وARIA وdata المكتوبة على `hw-center` على العنصر الذي تنسّقه ورقة الأنماط. ويطبّق محدِّد الخاصية `[hwCenter]` للمكوّن نفسه الصندوقَ نفسه على عنصر أصلي، فيحتفظ العنصر بوسمه. وللمُدخلات `gap` و`padding` و`align` و`justify` المعنى الذي لها في React؛ والمُدخلات الأخرى موجودة من أجل العقد المشترك، ولا تقرؤها أنماط مكوّن التوسيط. ويقبل المُدخلان `gap` و`padding` الكائن المتجاوب الذي يقبله React.

## إمكانية الوصول

مكوّن التوسيط حاوية تخطيط. فمكوّن React يعرض عنصر `div`؛ ومكوّن Vue يعرض عنصر `div` أو العنصر الذي تسمّيه الخاصية `as`؛ وعنصر Angular `hw-center` يعرض نفسه، وتحتفظ الصيغة `[hwCenter]` بالعنصر الأصلي المكتوبة عليه. ولا يضيف مكوّن التوسيط في أي صيغة دورًا ولا اسمًا ولا عنصرًا قابلًا للتركيز، فتأتي دلالات الصفحة من عناصره الأبناء.

- الترتيب المرئي هو ترتيب الشيفرة المصدرية. وتضبط ورقة الأنماط عمودًا دون عكسه أو إعادة ترتيبه، فاكتب العناصر الأبناء بالترتيب الذي تُقرأ به ويُنقل إليها التركيز.
- ليس لمكوّن التوسيط تفاعل خاص به من لوحة المفاتيح، وينقل <kbd>Tab</kbd> التركيز بين العناصر الأبناء القابلة للتركيز كما يفعل خارج الصندوق الموسَّط.
- لا يمنح مكوّن التوسيط اسمًا ميسّرًا. ويحتاج الصندوق الذي يجمع محتوى للتقنيات المساعدة إلى عنصر أصلي له اسمه الخاص، مثل عنصر `section` له عنصر عنوان أو الخاصية `aria-label`.
- يوسّط مكوّن التوسيط نصه. فاستخدمه لرسالة قصيرة أو لمجموعة قصيرة من عناصر التحكم، واكتب النص الطويل في حاوية تتبع جهة بدء القراءة.

> [!NOTE]
> يغيّر مكوّن التوسيط موضع عناصره الأبناء، لا معناها. فالرسالة التي تُبلغ عن حالة، مثل قائمة فارغة أو طلب فاشل، تحتفظ داخل الصندوق بترميزها الأصلي أو بترميز مكوّن للحالة.

## الاتجاه والتوطين

ليس في مكوّن التوسيط نص مدمج. ويكتب التطبيق كل عنصر ابن بلغة الصفحة. ويرث الصندوق لغة الصفحة واتجاهها، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية.

- لا يعتمد التوسيط على الاتجاه: فتقع العناصر الأبناء في منتصف الصندوق، في العربية وفي الإنجليزية.
- تتبع القيمتان `start` و`end` للخاصية `align` اتجاه الصفحة، فعند كتابة `align="start"` تصطف العناصر الأبناء عند الحافة اليمنى في صفحة من اليمين إلى اليسار، وعند الحافة اليسرى في صفحة من اليسار إلى اليمين. وتبقى ورقة الأنماط موسِّطة للنص، فاضبط محاذاة نص العناصر الأبناء عندما تكون مهمة.
- الفجوة والحشوة نفسهما في العربية وفي الإنجليزية؛ ولا يغيّر أي محوّل التخطيط بحسب اللغة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط مكوّن التوسيط بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- مكوّن التوسيط عنصر تخطيط أساسي في هوية. ولا تسرد [ملاحظات التخطيط](../layout.md) إلا أبعاد الحاوية وأبعاد قوالب الخدمات الواردة في ملفات كود المنصات المزوَّدة، ولا تسمّي أي مكوّن يقابله مكوّن التوسيط، فلا تذكر الصفحة أي ربط للمكوّن نفسه.
- تصف [ملاحظات التخطيط](../layout.md) مكوّن التوسيط بأنه محتوى موسَّط داخل المساحة المتاحة له، وتذكر أن التخطيط يقوم على CSS ولا يقيس نافذة العرض في JavaScript.
