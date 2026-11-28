---
source:
  summary: 996c745d2601
  example: e9743328d562
  variants-and-states: 2fead0e8ebb9
  api: bc8650b84ab9
  accessibility: 29a2b8db0457
  rtl-and-localisation: 2dfed415af47
  platforms-code-reference: f6b987f72935
---
# مؤشر تحميل

مؤشر التحميل عنصر صغير يدل على تحميل غير محدَّد، لإجراء أو منطقة لا تُعرف مدتها. وهو عنصر واحد يحمل `role="status"` ويضمّ اسمه المخفي بصريًا.

## مثال

الخاصية `label` نص مخفي بصريًا داخل عنصر الحالة، فيعلن قارئ الشاشة ما يجري تحميله. واكتبها بحسب السياق، مثل الطلب الذي يجري تحميله.

```html live example=basic static
<span class="hw-spinner" role="status"><span class="hw-sr-only">جارٍ تحميل طلبك</span></span>
```

```tsx live example=basic
<Spinner label="جارٍ تحميل طلبك" />
```

```vue live example=basic
<Spinner label="جارٍ تحميل طلبك" />
```

```ts live example=basic framework=angular
template: `<hw-spinner label="جارٍ تحميل طلبك" />`
```

## الأشكال والحالات

### الحجم

تقبل الخاصية `size` القيمة `sm` أو `lg`. ودونها يكون لمؤشر التحميل الحجم الافتراضي 1.25rem.

```html live example=sizes static
<div class="hw-inline">
  <span class="hw-spinner" role="status" data-size="sm"><span class="hw-sr-only">جارٍ تحميل قائمة المستندات</span></span>
  <span class="hw-spinner" role="status" data-size="lg"><span class="hw-sr-only">جارٍ تحميل تفاصيل الطلب</span></span>
</div>
```

```tsx live example=sizes
<div className="hw-inline">
  <Spinner size="sm" label="جارٍ تحميل قائمة المستندات" />
  <Spinner size="lg" label="جارٍ تحميل تفاصيل الطلب" />
</div>
```

```vue live example=sizes
<div class="hw-inline">
  <Spinner size="sm" label="جارٍ تحميل قائمة المستندات" />
  <Spinner size="lg" label="جارٍ تحميل تفاصيل الطلب" />
</div>
```

```ts live example=sizes framework=angular
template: `<div class="hw-inline">
  <hw-spinner size="sm" label="جارٍ تحميل قائمة المستندات" />
  <hw-spinner size="lg" label="جارٍ تحميل تفاصيل الطلب" />
</div>`
```

### بجانب نص ظاهر

عندما يذكر النص المجاور لمؤشر التحميل ما يجري، اكتب على مؤشر التحميل الخاصية `aria-hidden="true"`. فلا يحتاج عندئذ إلى اسم، ويكون النص الظاهر الرسالة الوحيدة.

```html live example=decorative static
<div class="hw-inline">
  <span class="hw-spinner" role="status" aria-hidden="true"></span>
  <span>جارٍ حفظ التغييرات</span>
</div>
```

```tsx live example=decorative
<div className="hw-inline">
  <Spinner aria-hidden="true" />
  <span>جارٍ حفظ التغييرات</span>
</div>
```

```vue live example=decorative
<div class="hw-inline">
  <Spinner aria-hidden="true" />
  <span>جارٍ حفظ التغييرات</span>
</div>
```

```ts live example=decorative framework=angular
template: `<div class="hw-inline">
  <hw-spinner aria-hidden="true" />
  <span>جارٍ حفظ التغييرات</span>
</div>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-spinner

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-spinner'` | `true` | — |
| `data-size` | `'lg' \| 'sm'` | `false` | — |

ليس لمؤشر التحميل متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر `span` بالصنف `hw-spinner` والخاصية `role="status"`، يضمّ عنصر `span` بالصنف `hw-sr-only` فيه نص التحميل. والخاصية `data-size` اختيارية: تغيّر القيمتان `sm` و`lg` الحجم، ودونها يكون لمؤشر التحميل الحجم الافتراضي. ولمؤشر تحميل زخرفي بجانب نص ظاهر، اكتب على العنصر الخاصية `aria-hidden="true"` واحذف النص المخفي.

### React

جدول: خصائص Spinner

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `aria-hidden` | `true \| 'true'` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `size` | `'sm' \| 'lg'` | `false` | — |
| `label` | `string` | `false` | — |

يعرض Spinner عنصر `span` واحدًا بالصنف `hw-spinner` والخاصية `role="status"`. والخاصية `label` هي النص المخفي بصريًا داخله، وهي الاسم الميسّر. ويحتاج مؤشر التحميل إلى اسم: مرّر `label` أو `aria-label` أو `aria-labelledby`، أو مرّر `aria-hidden` بالقيمة `true` لمؤشر تحميل زخرفي لا يحتاج إلى اسم؛ ودون أي منها يُصدر المكوّن تحذيرًا في إصدارات التطوير. وتقبل الخاصية `size` القيمة `sm` أو `lg`. وتصل الخصائص الأخرى، مثل `className`، إلى عنصر `span`.

### Vue

جدول: خصائص Spinner وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `false` | — |
| `size` | prop | `'sm' \| 'lg'` | `false` | — |

يعرض Spinner عنصر `span` واحدًا بالصنف `hw-spinner` والخاصية `role="status"`. والخاصية `label` هي النص المخفي بصريًا داخله، وهي الاسم الميسّر؛ ودونها لا يعرض المكوّن نصًا مخفيًا. ويحتاج مؤشر التحميل إلى اسم: مرّر `label` أو `aria-label` أو `aria-labelledby`، أو اكتب `aria-hidden="true"` لمؤشر تحميل زخرفي لا يحتاج إلى اسم؛ ودون أي منها يُصدر المكوّن تحذيرًا في إصدارات التطوير. وتقبل الخاصية `size` القيمة `sm` أو `lg`. وتصل الخصائص الأخرى، مثل `class`، إلى عنصر `span`. ولا يعرّف التصريح المنشور نوع أي منفذ، ولا يقرأ الإصدار المنشور أي منفذ.

### Angular

جدول: مُدخلات hw-spinner ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `label` | input | `string` | `false` | `''` |
| `size` | input | `'sm' \| 'lg'` | `false` | — |

يُطبَّق `HwSpinnerComponent` على `hw-spinner`، والعنصر المضيف هو مؤشر التحميل نفسه: فالصنف `hw-spinner` والخاصية `role="status"` على العنصر المضيف. والمُدخل `label` هو النص المخفي بصريًا داخل العنصر المضيف، وهو الاسم الميسّر. ويمكن بدلًا منه كتابة `aria-label` أو `aria-labelledby` على العنصر، أو `aria-hidden="true"` لمؤشر تحميل زخرفي؛ ودون أي منها ودون `label` يُصدر المكوّن تحذيرًا في إصدارات التطوير. ويقبل المُدخل `size` القيمة `sm` أو `lg`.

## إمكانية الوصول

مؤشر التحميل عنصر واحد يحمل `role="status"` ويضمّ اسمه المخفي بصريًا. والاسم هو النص الذي يوفّره التطبيق؛ فليس لمؤشر التحميل نص خاص به.

- سمِّ مؤشر التحميل بالنص المخفي في `label`، أو بالخاصية `aria-label` أو `aria-labelledby`، بصيغة تخبر القارئ بما يجري تحميله.
- يحمل مؤشر التحميل الزخرفي بجانب نص ظاهر الخاصية `aria-hidden="true"`، فلا يُعلَن النص مرتين.
- تلغي ورقة الأنماط الدوران عندما يطلب القارئ تقليل الحركة، ويُرسم مؤشر التحميل بألوان النظام في وضع الألوان القسرية.
- لا يقبل مؤشر التحميل التركيز، ولا يدخل في ترتيب التنقل بالمفتاح Tab.

## الاتجاه والتوطين

ليس في مؤشر التحميل نص مدمج: يكتب التطبيق الاسم بلغة الصفحة. والحلقة مفتوحة من جهة النهاية، وهي فجوة تضبطها ورقة الأنماط بخاصية CSS منطقية، فتتبع الفجوة اتجاه القراءة.

- بجانب نص ظاهر، ضع مؤشر التحميل والنص في تخطيط سطري، ليقع مؤشر التحميل عند بداية القراءة في اتجاهَي القراءة كليهما.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط مؤشر التحميل بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- يُدرج مؤشر التحميل بين مكوّنات العرض الأولى في نطاق المكوّنات في [ملاحظات التغطية](../coverage.md). ولا تسجّل الملاحظات ربطه بأي مصدر مزوَّد من كود المنصات.
- يُربط مؤشر التحميل الوارد في ملفات كود المنصات المزوَّدة على أنه أربعة أرباع دورة بحركة خطية. ويدير الأساس الافتراضي لكود المنصات في `@hawiyah/styles` مؤشرَ التحميل في 1000 ملّي ثانية، وتحتفظ هوية بمدة افتراضية قدرها 700 ملّي ثانية، ولا يثبت الربط تطابقًا بصريًا؛ وتسجّل ذلك [ملاحظات مرجع هيئة الحكومة الرقمية](../dga-reference.md).
