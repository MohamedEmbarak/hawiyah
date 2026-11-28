---
source:
  summary: c9a8ff7d8b1b
  example: 80792da88d39
  variants-and-states: 509db2ecf481
  api: 5f85767013f8
  accessibility: 224a90fb3e05
  rtl-and-localisation: b3a9905a67b0
  platforms-code-reference: 1116bf30ccf9
---
# نسبة العرض

يحجز مكوّن نسبة العرض صندوقًا بنسبة ثابتة بين العرض والارتفاع لوسائط مثل صورة أو مقطع فيديو أو إطار مضمّن. وهو عنصر تخطيط أساسي ليس له سلوك خاص به، ويحافظ الصندوق على تناسبه عندما يتغيّر عرضه.

## مثال

يأخذ الصندوق العرض الكامل لحاويته، ويأخذ ارتفاعًا من النسبة، وهي 16 إلى 9 ما لم تُمرَّر نسبة أخرى. ويحجز الصندوق مساحته بنسبته، فلا تتزحزح الصفحة عند ظهور الصورة. والصورة هنا مربع أزرق فيه دائرة بيضاء وزاوية برتقالية، ليظهر ما يقتطعه الصندوق منها.

```html live example=basic static differences=aspect-ratio-adapter-attributes
<div class="hw-aspect-ratio">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="مربع أزرق في وسطه دائرة بيضاء، وفي زاويته العلوية اليسرى مربع برتقالي">
</div>
```

```tsx live example=basic
<AspectRatio>
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="مربع أزرق في وسطه دائرة بيضاء، وفي زاويته العلوية اليسرى مربع برتقالي" />
</AspectRatio>
```

```vue live example=basic
<AspectRatio>
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="مربع أزرق في وسطه دائرة بيضاء، وفي زاويته العلوية اليسرى مربع برتقالي" />
</AspectRatio>
```

```ts live example=basic framework=angular
template: `<hw-aspect-ratio>
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="مربع أزرق في وسطه دائرة بيضاء، وفي زاويته العلوية اليسرى مربع برتقالي" />
</hw-aspect-ratio>`
```

## الأشكال والحالات

### النسبة

الخاصية `ratio` هي العرض مقسومًا على الارتفاع، فالقيمة 1.5 تحجز صندوقًا عرضه 3 وحدات مقابل كل وحدتين من الارتفاع. وتكتب محوّلات React وVue وAngular الرقم خاصيةَ CSS مخصّصة على العنصر، ويكتب ترميز كتلة JavaScript خاصية CSS المخصّصة نفسها في الخاصية `style`.

```html live example=ratio static differences=aspect-ratio-adapter-attributes
<div class="hw-aspect-ratio" style="--hw-layout-ratio: 1.5">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="مربع أزرق في وسطه دائرة بيضاء، وفي زاويته العلوية اليسرى مربع برتقالي">
</div>
```

```tsx live example=ratio
<AspectRatio ratio={1.5}>
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="مربع أزرق في وسطه دائرة بيضاء، وفي زاويته العلوية اليسرى مربع برتقالي" />
</AspectRatio>
```

```vue live example=ratio
<AspectRatio :ratio="1.5">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="مربع أزرق في وسطه دائرة بيضاء، وفي زاويته العلوية اليسرى مربع برتقالي" />
</AspectRatio>
```

```ts live example=ratio framework=angular
template: `<hw-aspect-ratio [ratio]="1.5">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="مربع أزرق في وسطه دائرة بيضاء، وفي زاويته العلوية اليسرى مربع برتقالي" />
</hw-aspect-ratio>`
```

### الملاءمة

تملأ الصورة أو مقطع الفيديو الصندوق ويُقتطع منهما ما يتجاوزه، لأن ورقة الأنماط تضبط ملاءمة هذين العنصرين على التغطية. وتعرض الخاصية `data-fit` بالقيمة `contain` الصورة أو مقطع الفيديو كاملًا داخل الصندوق بدلًا من ذلك، مع مساحة فارغة عندما يختلف التناسب. فتظهر الصورة المربعة في هذا المثال كاملة داخل الصندوق، مع مساحة فارغة على الجانبين، بينما يقتطعها المثال الأساسي بحسب الصندوق. وتنطبق الخاصية على العناصر الأبناء من نوع `img` و`video`، وتكتبها محوّلات React وVue وAngular على العنصر كأي خاصية أخرى.

```html live example=fit static differences=aspect-ratio-adapter-attributes
<div class="hw-aspect-ratio" data-fit="contain">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="مربع أزرق في وسطه دائرة بيضاء، وفي زاويته العلوية اليسرى مربع برتقالي">
</div>
```

```tsx live example=fit
<AspectRatio data-fit="contain">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="مربع أزرق في وسطه دائرة بيضاء، وفي زاويته العلوية اليسرى مربع برتقالي" />
</AspectRatio>
```

```vue live example=fit
<AspectRatio data-fit="contain">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="مربع أزرق في وسطه دائرة بيضاء، وفي زاويته العلوية اليسرى مربع برتقالي" />
</AspectRatio>
```

```ts live example=fit framework=angular
template: `<hw-aspect-ratio data-fit="contain">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='steelblue'/%3E%3Ccircle cx='50' cy='50' r='30' fill='white'/%3E%3Crect width='20' height='20' fill='orange'/%3E%3C/svg%3E" alt="مربع أزرق في وسطه دائرة بيضاء، وفي زاويته العلوية اليسرى مربع برتقالي" />
</hw-aspect-ratio>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-aspect-ratio

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-aspect-ratio'` | `true` | — |
| `data-fit` | `'contain'` | `false` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس لمكوّن نسبة العرض متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصرًا بالصنف `hw-aspect-ratio` وضع الوسائط داخله مباشرة. ويأخذ الصندوق الحجم الكامل لحاويته على المحور السطري، ويُستمدّ ارتفاعه من خاصية CSS المخصّصة `--hw-layout-ratio`، وقيمتها 16 إلى 9 ما لم تُضبط على العنصر، وتقصّ ورقة الأنماط كل ما يتجاوز الصندوق. ويملأ الصندوقَ كلُّ عنصر ابن مباشر من نوع `img` أو `video` أو `iframe` أو `canvas`. وتأخذ الخاصية `data-fit` القيمة `contain`، وتنطبق على العناصر الأبناء من نوع `img` و`video`؛ ودونها يُقتطع منها ما يتجاوز الصندوق. ولا تكتب ورقة الأنماط قيمة افتراضية لأيٍّ من الخاصيتين، فكل قيمة افتراضية شرطة طويلة.

### React

جدول: خصائص AspectRatio

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

يعرض AspectRatio دائمًا عنصر `div`؛ وليس له خاصية تختار عنصرًا آخر. ويقبل خصائص التخطيط المشتركة بين عناصر التخطيط الأساسية مع خصائص عنصر `div`، والخاصية `data-fit` إحدى هذه الخصائص. والخاصية `ratio` هي العرض مقسومًا على الارتفاع. ويجب أن تكون رقمًا موجبًا منتهيًا، ويُطلق المكوّن خطأً لأي قيمة أخرى، فالقيمة `ratio={16 / 9}` صالحة والقيمة `ratio={0}` غير صالحة. ودون `ratio` تطبّق ورقة الأنماط النسبة 16 إلى 9، ويعرض الجدول شرطة طويلة. وتأخذ الخاصية `padding` رمز مسافات من 0 إلى 16 أو طولًا في CSS، وتقبل كائنًا متجاوبًا بالدرجات `base` و`sm` و`md` و`lg` و`xl`. وتأخذ الخاصية `gap` الصيغ نفسها، لكن الصندوق كتلة وليس حاوية مرنة أو شبكية، فلا أثر للخاصية `gap` فيه. ولا تقرأ أنماط مكوّن نسبة العرض أيًّا من خصائص التخطيط الأخرى، فهي تخصّ عناصر تخطيط أساسية أخرى.

### Vue

جدول: خصائص AspectRatio وأحداثه ومنافذه

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

يحمل المنفذ الافتراضي الوسائط. وتضبط الخاصية `as` العنصر الذي يعرضه AspectRatio، وهو `div` ما لم يُكتب وسم آخر. وللخاصية `ratio` المعنى والقيد اللذان لها في React، ودونها تطبّق ورقة الأنماط النسبة 16 إلى 9. ويكتب AspectRatio دائمًا الخاصيتين `data-side` و`data-collapse-at` على عنصره، بالقيمتين الافتراضيتين للخاصيتين `side` و`collapseAt`، ولا تقرؤهما ورقة الأنماط لهذا المكوّن. وتصل خصائص HTML التي لا يعرّفها AspectRatio، مثل `data-fit`، إلى العنصر المعروض. وليس للخاصية `wrap` قيمة افتراضية، وتغيب ما لم تُضبط.

### Angular

جدول: مُدخلات hw-aspect-ratio ومخرجاته ومحتواه

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

يُطبَّق `HwAspectRatioComponent` على `hw-aspect-ratio`. والعنصر المضيف هو الصندوق نفسه: يحمل الصنف `hw-aspect-ratio` وخصائص CSS المخصّصة للتخطيط، وقالبه هو المحتوى المُسقَط وحده، والوسائط المُسقَطة أبناؤه المباشرون. ولذلك تقع خصائص class وid وdata المكتوبة على `hw-aspect-ratio`، مثل `data-fit`، على العنصر الذي تنسّقه ورقة الأنماط. ويطبّق محدِّد الخاصية `[hwAspectRatio]` للمكوّن نفسه الصندوقَ نفسه على عنصر أصلي، فيحتفظ العنصر بوسمه. وللمُدخل `ratio` المعنى الذي له في React، وقيمته الافتراضية هي التعبير 16 مقسومًا على 9، الذي يحسبه المكوّن في تعريفه، فيعرض الجدول شرطة طويلة. ويغيّر المُدخل `padding` الصندوق كما في React، ولا أثر للمُدخل `gap` فيه لأن الصندوق كتلة. ولا تقرأ أنماط مكوّن نسبة العرض أيًّا من المُدخلات الأخرى.

## إمكانية الوصول

مكوّن نسبة العرض حاوية تخطيط. فمكوّن React يعرض عنصر `div`؛ ومكوّن Vue يعرض عنصر `div` أو العنصر الذي تسمّيه الخاصية `as`؛ وعنصر Angular `hw-aspect-ratio` يعرض نفسه، وتحتفظ الصيغة `[hwAspectRatio]` بالعنصر الأصلي المكتوبة عليه. ولا يضيف مكوّن نسبة العرض في أي صيغة دورًا ولا اسمًا ولا عنصرًا قابلًا للتركيز، فإمكانية الوصول إلى الصندوق هي إمكانية الوصول إلى الوسائط التي فيه.

- امنح كل صورة نصًا بديلًا يصف محتواها، أو نصًا بديلًا فارغًا عندما تكون الصورة زخرفية. ويحتاج الإطار المضمّن إلى `title`، ويحتاج مقطع الفيديو إلى عناصر التحكم والترجمة النصية التي يتطلّبها محتواه. ولا يسمّي الصندوق أيًّا منها.
- تقصّ ورقة الأنماط كل ما يتجاوز الصندوق. فلا تضع في مكوّن نسبة العرض نصًا أو عناصر تحكم تحتاج إلى أن تكبر مع حجم النص أو مع تكبير القارئ للصفحة، لأن الصندوق يحافظ على تناسبه ويخفي ما يتجاوزه.
- ليس لمكوّن نسبة العرض تفاعل خاص به من لوحة المفاتيح، ويصل <kbd>Tab</kbd> إلى العناصر القابلة للتركيز داخل الصندوق كما يفعل خارجه.
- يمكن أن يقع محرّك مضمّن، مثل خريطة أو عارض مستندات، في مكوّن نسبة العرض باسمه الميسّر الخاص وبحالات التحميل والخطأ الخاصة به، كما يصف ملف README لحزمة `@hawiyah/react`.

> [!NOTE]
> يحجز مكوّن نسبة العرض المساحة، ولا يحمّل الوسائط ولا يصفها. اكتب أبعاد الوسائط نسبةً، واكتب نصها البديل في عنصر الوسائط.

## الاتجاه والتوطين

ليس في مكوّن نسبة العرض نص مدمج. ويكتب التطبيق النص البديل للصورة وعنوان الإطار المضمّن بلغة الصفحة.

- لا تعتمد النسبة والملاءمة على اتجاه الصفحة: فللصندوق العرض والارتفاع نفسهما في العربية وفي الإنجليزية، ولا تعكس ملاءمتا التغطية والاحتواء الوسائط.
- لا يترجم الصندوق الوسائط التي تحتوي على نص، مثل مستند ممسوح ضوئيًا، ولا يعكسها. فوفّر النسخة المكتوبة بلغة الصفحة، مع نص بديل بتلك اللغة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط مكوّن نسبة العرض بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- مكوّن نسبة العرض عنصر تخطيط أساسي في هوية. وتذكر [ملاحظات التخطيط](../layout.md) نسبته الافتراضية 16 إلى 9 وسلوك التغطية الذي يطبّقه على الصور ومقاطع الفيديو، ولا تسمّي أي مكوّن في ملفات كود المنصات المزوَّدة يقابله مكوّن نسبة العرض، فلا تذكر الصفحة أي ربط للمكوّن نفسه.
- يُدرج مكوّن نسبة العرض مع عناصر التخطيط الأساسية في نطاق المكوّنات في [ملاحظات التغطية](../coverage.md). وتذكر [ملاحظات التخطيط](../layout.md) أن التخطيط يقوم على CSS ولا يقيس نافذة العرض في JavaScript.
