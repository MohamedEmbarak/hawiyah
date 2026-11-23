---
source:
  summary: e4f00bc4d331
  example: 8ad91bc05078
  variants-and-states: 36f75603ad50
  api: a727ea1d55fb
  accessibility: 4e9943d97bfb
  rtl-and-localisation: caed5e81f0a2
  platforms-code-reference: 965f58dabf88
---
# مساحة مرنة

المساحة المرنة عنصر تخطيط أساسي يأخذ المساحة الحرة في حاوية مرنة، ويمكن أن يحجز لنفسه حدًّا أدنى من المسافة. وليس لها محتوى ولا سلوك، وهي زخرفية.

## مثال

تضمّ ترويسة الطلب عنوانًا وإجراءً. وتأخذ المساحة المرنة المساحة الحرة في الصف بينهما، فيقع الإجراء في نهاية الصف.

```html live example=basic differences=spacer-vue-layout-attributes
<div class="hw-inline">
  <strong>الطلب 2041</strong>
  <div class="hw-spacer" aria-hidden="true"></div>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">سحب الطلب</button>
</div>
```

```tsx live example=basic
<Inline>
  <strong>الطلب 2041</strong>
  <Spacer aria-hidden="true" />
  <Button variant="secondary">سحب الطلب</Button>
</Inline>
```

```vue live example=basic
<Inline>
  <strong>الطلب 2041</strong>
  <Spacer aria-hidden="true" />
  <Button variant="secondary">سحب الطلب</Button>
</Inline>
```

```ts live example=basic framework=angular
template: `<hw-inline>
  <strong>الطلب 2041</strong>
  <hw-spacer />
  <button hwButton variant="secondary">سحب الطلب</button>
</hw-inline>`
```

## الأشكال والحالات

### الحد الأدنى للمسافة

تضبط الخاصية `gap` أصغر مسافة تحتفظ بها المساحة المرنة أفقيًا وعموديًا. ودونها يكون الحد الأدنى صفرًا. وفي العمود لا تجد المساحة المرنة مساحة حرة تأخذها، فيصبح الحد الأدنى مسافة عمودية بين كتلتين. وتقع فجوة العمود على جانبي المساحة المرنة، فتكون المسافة بين الكتلتين هي الحد الأدنى مضافًا إليه فجوتان. والرقم 8 هو رمز المسافات 8. وتكتب محوّلات React وVue وAngular القيمة خاصيةَ CSS مخصّصة على عنصر المساحة المرنة، ويكتب ترميز كتلة JavaScript خاصية CSS المخصّصة نفسها في الخاصية `style`.

```html live example=minimum differences=spacer-vue-layout-attributes
<div class="hw-stack">
  <p>استُلم طلبك.</p>
  <div class="hw-spacer" aria-hidden="true" style="--hw-layout-gap: var(--hw-space-8, 2rem)"></div>
  <p>تُضاف المستندات التي ترفقها لاحقًا إلى الطلب نفسه.</p>
</div>
```

```tsx live example=minimum
<Stack>
  <p>استُلم طلبك.</p>
  <Spacer aria-hidden="true" gap={8} />
  <p>تُضاف المستندات التي ترفقها لاحقًا إلى الطلب نفسه.</p>
</Stack>
```

```vue live example=minimum
<Stack>
  <p>استُلم طلبك.</p>
  <Spacer aria-hidden="true" :gap="8" />
  <p>تُضاف المستندات التي ترفقها لاحقًا إلى الطلب نفسه.</p>
</Stack>
```

```ts live example=minimum framework=angular
template: `<hw-stack>
  <p>استُلم طلبك.</p>
  <hw-spacer [gap]="8" />
  <p>تُضاف المستندات التي ترفقها لاحقًا إلى الطلب نفسه.</p>
</hw-stack>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-spacer

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-spacer'` | `true` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس للمساحة المرنة متحكم في JavaScript، فالترميز هو واجهتها البرمجية: اكتب عنصر `div` فارغًا بالصنف `hw-spacer` ابنًا لعنصر بالصنف `hw-inline` أو لحاوية مرنة أخرى، واكتب عليه الخاصية `aria-hidden="true"`. وتجعله ورقة الأنماط يتمدّد في المساحة الحرة للحاوية، وتضبط حجمه الأدنى على صفر، وتعطّل أحداث المؤشر عليه. وللاحتفاظ بحد أدنى من المسافة، اكتب خاصية CSS المخصّصة `--hw-layout-gap` في الخاصية `style` للمساحة المرنة، كما في مثال «الحد الأدنى للمسافة». وتقرأ ورقة الأنماط هذه الخاصية على المساحة المرنة؛ أما الخاصية `--hw-gap` التي يصفها README الحزمة `@hawiyah/styles` للصنفين `hw-stack` و`hw-cluster`، فلا أثر لها في المساحة المرنة.

### React

جدول: خصائص Spacer

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

يعرض Spacer دائمًا عنصر `div`، ويقبل خصائص التخطيط المشتركة مع خصائص عنصر `div`. وتأخذ الخاصية `gap` رمز مسافات من 0 إلى 16 أو طولًا في CSS، وتضبط الحد الأدنى للمسافة التي تحجزها المساحة المرنة؛ وتقبل كائنًا متجاوبًا بالدرجات `base` و`sm` و`md` و`lg` و`xl`. ولا تقرأ ورقة الأنماط للمساحة المرنة إلا `gap` و`padding`، ولا تقرأ أيًّا من الخصائص الأخرى، فهي تخصّ عناصر تخطيط أساسية أخرى. ودون قيمة يكون الحد الأدنى للمسافة صفرًا، وهي قيمة ورقة الأنماط؛ ويعرض الجدول شرطة طويلة لكل قيمة افتراضية، لأن مكوّن React لا يعرّف قيمة افتراضية لأي خاصية تخطيط. ولا يضيف React الخاصية `aria-hidden`، فاكتب `aria-hidden="true"` على المساحة المرنة.

### Vue

جدول: خصائص Spacer وأحداثه ومنافذه

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

تضبط الخاصية `as` العنصر الذي يعرضه Spacer، وهو `div` ما لم يُكتب وسم آخر. وللخاصيتين `gap` و`padding` المعنى الذي لهما في React، وتُقبل خصائص التخطيط الأخرى من أجل العقد المشترك لخصائص التخطيط، لكن أنماط المساحة المرنة لا تقرؤها. ويكتب Spacer دائمًا الخاصيتين `data-side` و`data-collapse-at` على عنصره، بالقيمتين الافتراضيتين للخاصيتين `side` و`collapseAt`، ولا تقرؤهما ورقة الأنماط. ولا يضيف Vue الخاصية `aria-hidden`، فاكتب `aria-hidden="true"` على المساحة المرنة. والمساحة المرنة مُعدّة لتبقى فارغة؛ ويُقبل المنفذ `default`، ويُعرض محتواه داخل المساحة المرنة. وليس للخاصية `wrap` قيمة افتراضية، وتغيب ما لم تُضبط.

### Angular

جدول: مُدخلات hw-spacer ومخرجاته ومحتواه

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

يُطبَّق `HwSpacerComponent` على `hw-spacer` وحده، وليس له محدِّد خاصية لعنصر أصلي. والعنصر المضيف هو الصندوق نفسه: يحمل الصنف `hw-spacer`، وخصائص CSS المخصّصة للتخطيط، والخاصية `aria-hidden="true"`، وقالبه فارغ، فيكون العنصر ابنًا مباشرًا للحاوية المرنة. وللمُدخلين `gap` و`padding` المعنى الذي لهما في React، ويقبلان الكائن المتجاوب نفسه؛ والمُدخلات الأخرى موجودة من أجل العقد المشترك، ولا تقرؤها أنماط المساحة المرنة.

## إمكانية الوصول

المساحة المرنة عنصر تخطيط فارغ ليس له دور ولا اسم ولا عنصر قابل للتركيز، وتعطّل ورقة الأنماط أحداث المؤشر عليه. ولا تضيف إلى الصفحة شيئًا للتقنيات المساعدة؛ فأثرها مرئي فقط.

- يكتب عنصر Angular `hw-spacer` الخاصية `aria-hidden="true"` بنفسه. ولا يكتبها مكوّنا React وVue ولا ترميز vanilla، فاكتب `aria-hidden="true"` على المساحة المرنة فيها.
- ليس للمساحة المرنة تفاعل خاص بها من لوحة المفاتيح، ولا تدخل في ترتيب التنقل بالمفتاح Tab.
- لا تستخدم المساحة المرنة لحمل نص أو عنصر تحكم. فالمحتوى الموضوع فيها ليس جزءًا من عقد التخطيط، وعنصر التحكم داخل عنصر يحمل `aria-hidden="true"` يُخفى عن التقنيات المساعدة مع بقائه قابلًا للتركيز.

> [!NOTE]
> تغيّر المساحة المرنة موضع العناصر الشقيقة لها، لا ترتيبها. فاكتب العناصر الشقيقة بالترتيب الذي تُقرأ به ويُنقل إليها التركيز.

## الاتجاه والتوطين

ليس في المساحة المرنة نص مدمج، وليست لها لغة. وتأخذ المساحة الحرة على المحور الرئيسي لحاويتها، ويتبع الصف اتجاه الصفحة، فيقع إجراء المثال في الطرف الأيسر في صفحة من اليمين إلى اليسار، وفي الطرف الأيمن في صفحة من اليسار إلى اليمين.

- يُطبَّق الحد الأدنى للمسافة في `gap` على العرض وعلى الارتفاع، فيكون نفسه في العربية وفي الإنجليزية.
- لا يغيّر أي محوّل التخطيط بحسب اللغة؛ فترتيب العناصر الشقيقة في الشيفرة المصدرية هو الذي يقرّر ترتيبها على الشاشة في اتجاهَي القراءة كليهما.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط المساحة المرنة بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- المساحة المرنة عنصر تخطيط أساسي في هوية. ولا تسرد [ملاحظات التخطيط](../layout.md) إلا أبعاد الحاوية وأبعاد قوالب الخدمات الواردة في ملفات كود المنصات المزوَّدة، ولا تسمّي أي مكوّن تقابله المساحة المرنة، فلا تذكر الصفحة أي ربط للمكوّن نفسه.
- تصف [ملاحظات التخطيط](../layout.md) المساحة المرنة بأنها مساحة مرنة داخل حاوية مرنة لغرض العرض المرئي فقط، وتذكر أن التخطيط يقوم على CSS ولا يقيس نافذة العرض في JavaScript، وتوصي بإخفاء المساحة المرنة عن التقنيات المساعدة إذا لم يكن فيها محتوى؛ ولهذا تطلب الصفحة `aria-hidden="true"` عندما لا يكتبها المحوّل.
