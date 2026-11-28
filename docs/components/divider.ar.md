---
source:
  summary: 3eac17be0a1b
  example: 4225ecbb052c
  variants-and-states: c36b332b1333
  api: dd367294b8c7
  accessibility: 30e6d96c4bac
  rtl-and-localisation: 4c62d935e0db
  platforms-code-reference: 5c673454f818
---
# فاصل

الفاصل خط رفيع يفصل بين مجموعتين من المحتوى. ويعرض عنصر خط فاصل أفقيًا أصليًا، مع درجات لونية للإبراز، وتوجّه عمودي للعناصر التي تقف في صف.

## مثال

يفصل الفاصل بين جزأين من الصفحة يختلفان في الموضوع، مثل تفاصيل طلب وسجله. ويأخذ العرض الكامل لحاويته، وليس له نص خاص به.

```html live example=basic
<div class="hw-stack">
  <p>قُدِّم الطلب 2041 في 4 مارس 2026.</p>
  <hr class="hw-divider">
  <p>الطلب بانتظار مستند من مقدّم الطلب.</p>
</div>
```

```tsx live example=basic
<div className="hw-stack">
  <p>قُدِّم الطلب 2041 في 4 مارس 2026.</p>
  <Divider />
  <p>الطلب بانتظار مستند من مقدّم الطلب.</p>
</div>
```

```vue live example=basic
<div class="hw-stack">
  <p>قُدِّم الطلب 2041 في 4 مارس 2026.</p>
  <Divider />
  <p>الطلب بانتظار مستند من مقدّم الطلب.</p>
</div>
```

```ts live example=basic framework=angular
template: `<div class="hw-stack">
  <p>قُدِّم الطلب 2041 في 4 مارس 2026.</p>
  <hw-divider />
  <p>الطلب بانتظار مستند من مقدّم الطلب.</p>
</div>`
```

## الأشكال والحالات

### الدرجات اللونية

يضبط `tone` لون الخط. ودون درجة لونية يأخذ الخط لون الحدود في السمة. وتستخدم الدرجات `primary` و`gold` و`tertiary` الألوان التي تحمل الأسماء نفسها، ولا تضبط الدرجة `neutral` لونًا خاصًا بها: فيحتفظ الخط بلون الحدود، ويبدو كخط بلا درجة لونية. وفي وضع الألوان القسرية يأخذ الخط ذو أي درجة لونية، ومنها `neutral`، لون النص في النظام.

```html live example=tones
<div class="hw-stack">
  <hr class="hw-divider" data-tone="primary">
  <hr class="hw-divider" data-tone="gold">
  <hr class="hw-divider" data-tone="tertiary">
</div>
```

```tsx live example=tones
<div className="hw-stack">
  <Divider tone="primary" />
  <Divider tone="gold" />
  <Divider tone="tertiary" />
</div>
```

```vue live example=tones
<div class="hw-stack">
  <Divider tone="primary" />
  <Divider tone="gold" />
  <Divider tone="tertiary" />
</div>
```

```ts live example=tones framework=angular
template: `<div class="hw-stack">
  <hw-divider tone="primary" />
  <hw-divider tone="gold" />
  <hw-divider tone="tertiary" />
</div>`
```

### الفاصل العمودي

التوجّه `horizontal` هو خط المثال الأول، ويفصل التوجّه `vertical` بين العناصر في صف. ويمتد الخط العمودي إلى ارتفاع الصف عندما تكون حاويته حاوية مرنة (flex)، مثل عنصر `hw-inline`، وله هامش على المحور السطري من الجهتين. وفي vanilla يكون التوجّه هو الخاصية `aria-orientation="vertical"`، وتستهدفها ورقة الأنماط.

```html live example=vertical
<div class="hw-inline">
  <span>الطلب 2041</span>
  <hr class="hw-divider" aria-orientation="vertical">
  <span>بانتظار مستند</span>
</div>
```

```tsx live example=vertical
<div className="hw-inline">
  <span>الطلب 2041</span>
  <Divider orientation="vertical" />
  <span>بانتظار مستند</span>
</div>
```

```vue live example=vertical
<div class="hw-inline">
  <span>الطلب 2041</span>
  <Divider orientation="vertical" />
  <span>بانتظار مستند</span>
</div>
```

```ts live example=vertical framework=angular
template: `<div class="hw-inline">
  <span>الطلب 2041</span>
  <hw-divider orientation="vertical" />
  <span>بانتظار مستند</span>
</div>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-divider

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-divider'` | `true` | — |
| `aria-orientation` | `'vertical'` | `false` | — |
| `data-tone` | `'gold' \| 'primary' \| 'tertiary'` | `false` | — |

ليس للفاصل متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر `hr` أصليًا بالصنف `hw-divider`. ودون خصائص أخرى يكون الخط أفقيًا، ويأخذ الامتداد الكامل لحاويته على المحور السطري، وله هامش على محور الكتلة فوقه وتحته. وتختار الخاصية `aria-orientation="vertical"` الخط العمودي، ولا هامش له على محور الكتلة. وتأخذ الخاصية `data-tone` القيمة `primary` أو `gold` أو `tertiary`؛ ودونها يأخذ الخط لون الحدود.

### React

جدول: خصائص Divider

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `tone` | `'neutral' \| 'primary' \| 'gold' \| 'tertiary'` | `false` | — |
| `orientation` | `'horizontal' \| 'vertical'` | `false` | — |

يعرض Divider عنصر `hr` أصليًا، ويمرّر إليه خصائصه الأخرى. وتُكتب الخاصية `tone` في `data-tone`، والخاصية `orientation` في `aria-orientation`؛ ودون قيمة لا تُكتب أي من الخاصيتين، فيكون الخط أفقيًا. ويكتب التوجّه `horizontal` خاصيةً لا تستهدفها ورقة الأنماط، فيبدو الخط كالخط الافتراضي. وتكتب الدرجة `neutral` الخاصية `data-tone`، وتستهدفها ورقة الأنماط، ويحتفظ الخط بلون الحدود.

### Vue

جدول: خصائص Divider وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `tone` | prop | `'neutral' \| 'primary' \| 'gold' \| 'tertiary'` | `false` | — |
| `orientation` | prop | `'horizontal' \| 'vertical'` | `false` | — |

يعرض Divider عنصر `hr` أصليًا، وتصل إليه خصائص HTML التي ليست خصائص للمكوّن. وتُكتب الخاصية `tone` في `data-tone`، والخاصية `orientation` في `aria-orientation`. وليس للمكوّن منفذ ولا حدث.

### Angular

جدول: مُدخلات hw-divider ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `tone` | input | `'neutral' \| 'primary' \| 'gold' \| 'tertiary'` | `false` | — |
| `orientation` | input | `'horizontal' \| 'vertical'` | `false` | — |

يُطبَّق `HwDividerComponent` على `hw-divider`، ويعرض داخل العنصر المضيف عنصر `hr` بالصنف `hw-divider`. ويُكتب المُدخل `tone` في `data-tone`، والمُدخل `orientation` في `aria-orientation`. ولا يأخذ العنصر المضيف صندوقًا خاصًا به ما دام يحتوي على خط عمودي، فيُرتَّب الخط كأنه عنصر ابن للحاوية.

## إمكانية الوصول

يعرض الفاصل عنصر `hr` أصليًا، ويعرضه المتصفح للتقنيات المساعدة فاصلًا. وليس للخط نص، ولا يقبل التركيز، ولا تفاعل له من لوحة المفاتيح.

- استخدم الفاصل عندما يختلف المحتوى على جانبيه في الموضوع. ولا يحلّ الفاصل محلّ العنوان: فمستخدم التقنيات المساعدة يتنقل في الصفحة بعناوينها، فسمِّ كل جزء بعنوان.
- تبيّن الخاصية `aria-orientation` توجّه الفاصل للتقنيات المساعدة، وتختار أيضًا الخط العمودي في ورقة الأنماط.
- الخط ذو الدرجة اللونية إبراز مرئي فقط. فاذكر أي اختلاف في المعنى بالنص، ولا تعتمد على لون الخط.

## الاتجاه والتوطين

ليس في الفاصل نص. وللخط العمودي هامش على المحور السطري من الجهتين، مكتوب بخصائص CSS المنطقية، فتكون المسافة واحدة في اتجاهَي القراءة كليهما. ويأخذ الخط الأفقي الامتداد الكامل لحاويته على المحور السطري في اتجاهَي القراءة كليهما.

- يفصل الفاصل في الصف بين العناصر بترتيب القراءة: فيظهر العنصر الأول في الترميز في جهة بدء القراءة في العربية وفي الإنجليزية.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط الفاصل بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- يُدرج الفاصل بين مكوّنات العرض الأولية في نطاق المكوّنات في [ملاحظات التغطية](../coverage.md).
- تسجّل [ملاحظات الأسس](../nic-foundations.md) أن الفاصل في ورقة أنماط كود المنصات المزوَّدة خط بسماكة 1px بلون محايد أو أساسي أو ذهبي أو خزامي، وأن الدرجات اللونية الأربع للفاصل تتبع قيمه في الوضع الفاتح.
