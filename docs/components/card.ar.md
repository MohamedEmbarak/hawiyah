---
source:
  summary: 95b4d845a6b9
  example: c6b24d845e6a
  variants-and-states: 74a74bbe1e1c
  api: 58989f3b4c21
  accessibility: e332faf7ed70
  rtl-and-localisation: 46239da64f01
  platforms-code-reference: 5d5994b48921
---
# بطاقة

تجمع البطاقة محتوى مترابطًا في عنصر `article` ثابت مع ترويسة وتذييل اختياريين، أو في رابط أصلي واحد عند كتابة الخاصية أو المُدخل `href`. ويكتب التطبيق المحتوى والإجراءات؛ ولا تضيف البطاقة سلوكًا إلا مع `disabled`، الذي يمنع النقر على البطاقة.

## مثال

تضمّ الترويسة عنوان البطاقة، ويضمّ المتن الوصف، ويضمّ التذييل إجراءً ظاهرًا. والإجراء رابط حقيقي داخل بطاقة ثابتة، فالبطاقة نفسها ليست عنصرًا تفاعليًا.

```html live example=basic
<article class="hw-card">
  <header class="hw-card-header"><h3 class="hw-card-title">طلب الخدمة ط-2041</h3></header>
  <div class="hw-card-body">
    <p class="hw-card-description">طلبك للحصول على نسخة من مستند قيد المراجعة.</p>
  </div>
  <footer class="hw-card-footer"><a class="hw-button" href="/requests/sr-2041">عرض تفاصيل الطلب</a></footer>
</article>
```

```tsx live example=basic
<Card
  header={<h3 className="hw-card-title">طلب الخدمة ط-2041</h3>}
  footer={<a className="hw-button" href="/requests/sr-2041">عرض تفاصيل الطلب</a>}
>
  <p className="hw-card-description">طلبك للحصول على نسخة من مستند قيد المراجعة.</p>
</Card>
```

```vue live example=basic
<Card>
  <template #header><h3 class="hw-card-title">طلب الخدمة ط-2041</h3></template>
  <p class="hw-card-description">طلبك للحصول على نسخة من مستند قيد المراجعة.</p>
  <template #footer><a class="hw-button" href="/requests/sr-2041">عرض تفاصيل الطلب</a></template>
</Card>
```

```ts live example=basic framework=angular
template: `<hw-card>
  <h3 hwCardHeader class="hw-card-title">طلب الخدمة ط-2041</h3>
  <p class="hw-card-description">طلبك للحصول على نسخة من مستند قيد المراجعة.</p>
  <a hwCardFooter class="hw-button" href="/requests/sr-2041">عرض تفاصيل الطلب</a>
</hw-card>`
```

## الأشكال والحالات

### المظهر ذو الإطار

يرسم المظهر ذو الإطار حدًّا بدلًا من الظل. والمظاهر الأخرى هي `default` و`flat` و`elevated` و`ghost`؛ وليس للمظهر المسطّح ظل.

```html live example=outlined
<article class="hw-card" data-variant="outlined">
  <header class="hw-card-header"><h3 class="hw-card-title">الملف الشخصي</h3></header>
  <div class="hw-card-body">
    <p class="hw-card-description">بيانات التواصل في ملفك الشخصي محدَّثة.</p>
  </div>
</article>
```

```tsx live example=outlined
<Card variant="outlined" header={<h3 className="hw-card-title">الملف الشخصي</h3>}>
  <p className="hw-card-description">بيانات التواصل في ملفك الشخصي محدَّثة.</p>
</Card>
```

```vue live example=outlined
<Card variant="outlined">
  <template #header><h3 class="hw-card-title">الملف الشخصي</h3></template>
  <p class="hw-card-description">بيانات التواصل في ملفك الشخصي محدَّثة.</p>
</Card>
```

```ts live example=outlined framework=angular
template: `<hw-card variant="outlined">
  <h3 hwCardHeader class="hw-card-title">الملف الشخصي</h3>
  <p class="hw-card-description">بيانات التواصل في ملفك الشخصي محدَّثة.</p>
</hw-card>`
```

### البطاقة رابطًا كاملًا

عند كتابة `href` تصبح البطاقة كلها رابطًا أصليًا واحدًا. ومحتواها، وهو هنا العنوان والوصف، هو اسم الرابط، فاكتب محتوى يصلح اسمًا للرابط، ولا تضع داخلها رابطًا ولا زرًّا.

```html live example=link
<a class="hw-card hw-card-action" href="/requests/sr-2041">
  <div class="hw-card-body">
    <h3 class="hw-card-title">طلب الخدمة ط-2041</h3>
    <p class="hw-card-description">طلبك للحصول على نسخة من مستند قيد المراجعة.</p>
  </div>
</a>
```

```tsx live example=link
<Card href="/requests/sr-2041">
  <h3 className="hw-card-title">طلب الخدمة ط-2041</h3>
  <p className="hw-card-description">طلبك للحصول على نسخة من مستند قيد المراجعة.</p>
</Card>
```

```vue live example=link
<Card href="/requests/sr-2041">
  <h3 class="hw-card-title">طلب الخدمة ط-2041</h3>
  <p class="hw-card-description">طلبك للحصول على نسخة من مستند قيد المراجعة.</p>
</Card>
```

```ts live example=link framework=angular
template: `<hw-card href="/requests/sr-2041">
  <h3 class="hw-card-title">طلب الخدمة ط-2041</h3>
  <p class="hw-card-description">طلبك للحصول على نسخة من مستند قيد المراجعة.</p>
</hw-card>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العناصر hw-card وhw-card-header وhw-card-body وhw-card-footer

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-card' \| 'hw-card-header' \| 'hw-card-body' \| 'hw-card-footer'` | `true` | — |
| `data-variant` | `'elevated' \| 'flat' \| 'ghost' \| 'outlined'` | `false` | — |
| `data-disabled` | `'true'` | `false` | — |
| `aria-disabled` | `'true'` | `false` | — |

ليس للبطاقة متحكم في JavaScript، فالترميز هو واجهتها البرمجية: اكتب عنصر `article` بالصنف `hw-card`، وعند الحاجة عنصر `header` بالصنف `hw-card-header`، وعنصر `div` بالصنف `hw-card-body`، وعند الحاجة عنصر `footer` بالصنف `hw-card-footer`. وتنسّق الأصناف `hw-card-title` و`hw-card-description` و`hw-card-image` المحتوى. والبطاقة التي تكون رابطًا كاملًا عنصر `a` بالصنفين `hw-card` و`hw-card-action`. وتقبل الخاصية `data-variant` القيم `elevated` و`flat` و`ghost` و`outlined`، ودونها يكون للبطاقة المظهر الافتراضي. والبطاقة المعطَّلة التي تكون رابطًا كاملًا لا تحمل `href`، وتحمل الخصائص `role="link"` و`aria-disabled="true"` و`data-disabled="true"`، والخاصية `tabindex` بالقيمة -1، وتعرضها ورقة الأنماط معطَّلة عبر `data-disabled` و`aria-disabled`؛ ويجب أن تراعي معالجات الأحداث في التطبيق الحالة المعطَّلة أيضًا.

### React

جدول: خصائص Card

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `header` | `ReactNode` | `false` | — |
| `footer` | `ReactNode` | `false` | — |
| `variant` | `'default' \| 'flat' \| 'elevated' \| 'outlined' \| 'ghost'` | `false` | — |
| `href` | `string` | `false` | — |
| `target` | `string` | `false` | — |
| `rel` | `string` | `false` | — |
| `disabled` | `boolean` | `false` | — |

تعرض البطاقة عنصر `article` أصليًا. وتملأ الخاصيتان `header` و`footer` الترويسة والتذييل، وتملأ العناصر الأبناء المتن. وعند كتابة `href` تعرض البطاقة بدلًا من ذلك رابطًا أصليًا واحدًا، وتُكتب عليه `target` و`rel`. وتكتب الخاصية `disabled` الخاصية `data-disabled="true"`، التي تعرض بها ورقة الأنماط البطاقة معطَّلة، وتمنع معالج النقر في البطاقة، مع `href` ودونها. وفي البطاقة التي تحمل `href` تزيل أيضًا الوجهة، وتكتب `role="link"` و`aria-disabled="true"`، والخاصية `tabindex` بالقيمة -1. ودون `href` تُمرَّر `target` و`rel` إلى عنصر `article` كأي خاصية أخرى.

### Vue

جدول: خصائص Card وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `variant` | prop | `'default' \| 'flat' \| 'elevated' \| 'outlined' \| 'ghost'` | `false` | — |
| `href` | prop | `string` | `false` | — |
| `disabled` | prop | `boolean` | `false` | `false` |
| `header` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |
| `footer` | slot | — | `false` | — |

تعرض البطاقة عنصر `article` أصليًا، وعند كتابة `href` رابطًا أصليًا واحدًا. ويملأ المنفذ `header` الترويسة، ويملأ المنفذ الافتراضي المتن، ويملأ المنفذ `footer` التذييل. وتكتب الخاصية `disabled` الخاصية `data-disabled="true"`، التي تعرض بها ورقة الأنماط البطاقة معطَّلة، وتمنع معالجات النقر في البطاقة، مع `href` ودونها. وفي البطاقة التي تحمل `href` تزيل أيضًا الوجهة، وتكتب `role="link"` و`aria-disabled="true"`، والخاصية `tabindex` بالقيمة -1.

### Angular

جدول: مُدخلات hw-card ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `variant` | input | `'default' \| 'flat' \| 'elevated' \| 'outlined' \| 'ghost'` | `false` | — |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `href` | input | `string \| undefined` | `false` | — |
| `target` | input | `string \| undefined` | `false` | — |
| `rel` | input | `string \| undefined` | `false` | — |
| `disabled` | input | `boolean` | `false` | `false` |
| `[hwCardHeader]` | content | — | `false` | — |
| `*` | content | — | `false` | — |
| `[hwCardFooter]` | content | — | `false` | — |

يُطبَّق `HwCardComponent` على `hw-card`، وهو عنصر يحيط بالبطاقة: يُعرض عنصر `article` أو الرابط داخله، وتبقى `id` و`class` و`style` على العنصر المضيف. وتُعرض الترويسة والتذييل دائمًا. ويملأ المحتوى الذي يحمل `hwCardHeader` الترويسة، ويملأ المحتوى الآخر المتن، ويملأ المحتوى الذي يحمل `hwCardFooter` التذييل. وعند كتابة `href` تكون البطاقة رابطًا أصليًا واحدًا بالصنفين `hw-card` و`hw-card-action`؛ ودونها تكون البطاقة عنصر `article`. وتصل المُدخلات `aria-label` و`aria-labelledby` و`aria-describedby` المكتوبة على `hw-card` إلى عنصر `article` أو إلى الرابط. ولا يكتب المُدخل `variant` الخاصية `data-variant` إلا عند تمريره. وللمُدخل `disabled` الأثر الموصوف في React.

## إمكانية الوصول

البطاقة عنصر `article` ثابت، أو رابط أصلي عندما تحمل `href`. ولا تضيف دورًا ولا سلوكًا خاصًا بها، إلا في البطاقة المعطَّلة الموصوفة أدناه، فيكون استخدام لوحة المفاتيح بحسب العناصر التي داخلها.

- البطاقة الثابتة لا تقبل التركيز. أما الروابط والأزرار التي يضعها التطبيق فيها، في الترويسة أو المتن أو التذييل، فتقبل التركيز وتتبع ترتيبها في الترميز.
- اجعل للبطاقة التي تحمل إجراءً إجراءً ظاهرًا في تذييلها، مثل رابط بمظهر الزر، كي لا يتوقف الإجراء على اكتشاف القارئ أن البطاقة كلها رابط. وللأمر، ضع عنصر `button` حقيقيًا داخل بطاقة ثابتة: فالأصناف لا تجعل عنصر `article` زرًّا.
- تأخذ البطاقة التي تكون رابطًا كاملًا اسمها الميسّر من محتواها. فلا تضع داخلها رابطًا ولا زرًّا، لأن عنصر التحكم لا يجوز أن يقع داخل رابط. وعندما تجتمع عدة بطاقات في صفحة واحدة، اجعل محتوى كل بطاقة يسمّي وجهتها.
- اعرض عنوان البطاقة في عنصر عنوان، واختر مستواه بحسب ترتيب العناوين في الصفحة؛ وتستخدم الأمثلة عنصر عنوان من المستوى الثالث تحت عنوان من المستوى الثاني.
- ليس للبطاقة المعطَّلة التي تحمل `href` وجهة، وتخرج من ترتيب التنقل بالمفتاح Tab. وتكتب محوّلات React وVue وAngular عليها `role="link"` و`aria-disabled="true"`، والخاصية `tabindex` بالقيمة -1، وتمنع النقر عليها.

## الاتجاه والتوطين

ليس في البطاقة نص مدمج: يكتب التطبيق العنوان والوصف ونصوص الإجراءات بلغة الصفحة. وتتبع البطاقة اتجاه الصفحة عبر خصائص CSS المنطقية، فيبدأ المحتوى من جهة بدء القراءة في العربية وفي الإنجليزية.

- اكتب العنوان والوصف والإجراء بلغة البطاقة؛ فالبطاقة لا تترجمها.
- تستخدم الصورة في البطاقة الصنف `hw-card-image`. وإذا كان في الصورة نص أو دلالة على اتجاه، مثل سهم، فوفّر نسخة منها لكل اتجاه من اتجاهَي الصفحة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط البطاقة بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات البطاقات](../nic-cards.md) المسافات، ونصف قطر الزوايا، والظل، وخطوط العنوان والوصف، الواردة في قسم البطاقات من ملفات كود المنصات المزوَّدة، ومعها الأشكال وتكييفات حالتَي المرور بالمؤشر والتركيز في الوضع الداكن.
- تسجّل [ملاحظات البطاقات](../nic-cards.md) أن البطاقة التي تحمل إجراءً تحتاج إلى إجراء ظاهر، وأن البطاقة التي تكون رابطًا كاملًا يجب ألا تضمّ روابط أو أزرارًا. ويبقى شكل البطاقة الذي يجعلها رابطًا كاملًا عبر `href` متاحًا، وتصفه الملاحظات سلوكًا قائمًا.
- تُدرج البطاقة ضمن مكوّنات العرض الأولية في نطاق المكوّنات في [ملاحظات التغطية](../coverage.md).
