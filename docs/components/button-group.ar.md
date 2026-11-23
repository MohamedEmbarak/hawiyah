---
source:
  summary: 61e14fd36fb0
  example: 8e6aab71de02
  variants-and-states: a75bce0443fc
  api: 06672f43b7a6
  accessibility: 9beceb842ab6
  rtl-and-localisation: a1f9dd59aa15
  platforms-code-reference: 57029daabf51
---
# مجموعة أزرار

تضع مجموعة الأزرار الإجراءات المترابطة في مجموعة واحدة لها اسم، وتمنحها تخطيطًا مشتركًا. ويبقى كل إجراء زرًا عاديًا له سلوكه الخاص وموضعه الخاص في ترتيب التنقل بالمفتاح Tab.

## مثال

تضمّ المجموعة إجراءات يجمعها موضوع واحد، مثل إجراءات طلب واحد. وللمجموعة اسم، فيسمع مستخدم التقنيات المساعدة ما تتعلق به الأزرار عندما ينتقل التركيز إلى المجموعة.

```html live example=basic
<div class="hw-button-group" role="group" aria-label="إجراءات الطلب">
  <button class="hw-button" type="button" data-variant="primary" data-size="md">تقديم الطلب</button>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">حفظ المسودة</button>
  <button class="hw-button" type="button" data-variant="ghost" data-size="md">إلغاء</button>
</div>
```

```tsx live example=basic
<ButtonGroup label="إجراءات الطلب">
  <Button variant="primary">تقديم الطلب</Button>
  <Button variant="secondary">حفظ المسودة</Button>
  <Button variant="ghost">إلغاء</Button>
</ButtonGroup>
```

```vue live example=basic
<ButtonGroup label="إجراءات الطلب">
  <Button variant="primary">تقديم الطلب</Button>
  <Button variant="secondary">حفظ المسودة</Button>
  <Button variant="ghost">إلغاء</Button>
</ButtonGroup>
```

```ts live example=basic framework=angular
template: `<hw-button-group label="إجراءات الطلب">
  <button hwButton variant="primary">تقديم الطلب</button>
  <button hwButton variant="secondary">حفظ المسودة</button>
  <button hwButton variant="ghost">إلغاء</button>
</hw-button-group>`
```

## الأشكال والحالات

### الأزرار المتصلة

يفصل الشكل `default` بين الأزرار بمسافة. ويصل الشكل `attached` الأزرار في كتلة واحدة: فتُزال المسافة، وتتداخل الحدود بمقدار بكسل واحد، ولا تبقى مستديرة إلا الزوايا الخارجية للكتلة. استخدمه لإجراءات متساوية الأهمية تُقرأ مجموعةً واحدة، مثل طباعة مستند وتنزيله ومشاركته. وتبقى الإجراءات مستقلة؛ فالمجموعة ليست عنصر تحكم للاختيار. ولاختيار قيمة واحدة استخدم `ToggleGroup`.

```html live example=attached
<div class="hw-button-group" role="group" aria-label="إجراءات المستند" data-variant="attached">
  <button class="hw-button" type="button" data-variant="outline" data-size="md">طباعة</button>
  <button class="hw-button" type="button" data-variant="outline" data-size="md">تنزيل</button>
  <button class="hw-button" type="button" data-variant="outline" data-size="md">مشاركة</button>
</div>
```

```tsx live example=attached
<ButtonGroup label="إجراءات المستند" variant="attached">
  <Button variant="outline">طباعة</Button>
  <Button variant="outline">تنزيل</Button>
  <Button variant="outline">مشاركة</Button>
</ButtonGroup>
```

```vue live example=attached
<ButtonGroup label="إجراءات المستند" variant="attached">
  <Button variant="outline">طباعة</Button>
  <Button variant="outline">تنزيل</Button>
  <Button variant="outline">مشاركة</Button>
</ButtonGroup>
```

```ts live example=attached framework=angular
template: `<hw-button-group label="إجراءات المستند" variant="attached">
  <button hwButton variant="outline">طباعة</button>
  <button hwButton variant="outline">تنزيل</button>
  <button hwButton variant="outline">مشاركة</button>
</hw-button-group>`
```

### المجموعة العمودية

يضع التوجّه `horizontal` الأزرار في صف، وهو التخطيط الذي تأخذه المجموعة دون أي خاصية. ويضع التوجّه `vertical` الأزرار في عمود، يأخذ فيه كل زر العرض الكامل للمجموعة. ويجتمع مع الشكل `attached`، فيصل الشكل حينئذٍ الأزرار على محور الكتلة.

```html live example=vertical
<div class="hw-button-group" role="group" aria-label="إجراءات الملف الشخصي" data-orientation="vertical">
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">تعديل الملف الشخصي</button>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">تغيير كلمة المرور</button>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">تنزيل البيانات</button>
</div>
```

```tsx live example=vertical
<ButtonGroup label="إجراءات الملف الشخصي" orientation="vertical">
  <Button variant="secondary">تعديل الملف الشخصي</Button>
  <Button variant="secondary">تغيير كلمة المرور</Button>
  <Button variant="secondary">تنزيل البيانات</Button>
</ButtonGroup>
```

```vue live example=vertical
<ButtonGroup label="إجراءات الملف الشخصي" orientation="vertical">
  <Button variant="secondary">تعديل الملف الشخصي</Button>
  <Button variant="secondary">تغيير كلمة المرور</Button>
  <Button variant="secondary">تنزيل البيانات</Button>
</ButtonGroup>
```

```ts live example=vertical framework=angular
template: `<hw-button-group label="إجراءات الملف الشخصي" orientation="vertical">
  <button hwButton variant="secondary">تعديل الملف الشخصي</button>
  <button hwButton variant="secondary">تغيير كلمة المرور</button>
  <button hwButton variant="secondary">تنزيل البيانات</button>
</hw-button-group>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-button-group

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-button-group'` | `true` | — |
| `data-orientation` | `'vertical'` | `false` | — |
| `data-variant` | `'attached'` | `false` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس لمجموعة الأزرار متحكم في JavaScript، فالترميز هو واجهتها البرمجية: اكتب عنصرًا بالصنف `hw-button-group` مع الخاصية `role="group"`، وسمِّه بالخاصية `aria-label` أو `aria-labelledby`، وضع داخله أزرارًا أصلية بالصنف `hw-button`. وتصل الخاصية `data-variant="attached"` الأزرار، وتضعها الخاصية `data-orientation="vertical"` في عمود؛ ودونهما تقف الأزرار في صف تفصل بينها مسافة، وينتقل الصف إلى سطر جديد عندما تضيق الحاوية. وتستهدف قواعد ورقة الأنماط للشكل المتصل العناصر الأبناء المباشرة التي تحمل الصنف `hw-button`، فاكتب الأزرار عناصرَ أبناءً مباشرة للمجموعة.

### React

جدول: خصائص ButtonGroup

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `variant` | `'default' \| 'attached'` | `false` | — |
| `orientation` | `'horizontal' \| 'vertical'` | `false` | — |
| `data-variant` | `string` | `false` | — |
| `data-orientation` | `string` | `false` | — |
| `label` | `string` | `false` | — |

يعرض ButtonGroup عنصر `div` مع الخاصية `role="group"`. ويأخذ اسم المجموعة من الخاصية `label`، أو من `aria-label` أو `aria-labelledby`، وتتقدّمان على `label` عند كتابتهما. ودون أي من الثلاث لا يكون للمجموعة اسم. وتكتب الخاصيتان `variant` و`orientation` الخاصيتين `data-variant` و`data-orientation`؛ ودونهما لا تُكتب أي منهما. وتبقى الخاصيتان `data-variant` و`data-orientation` مقبولتين، وتتقدّم `variant` و`orientation` عند كتابة الاثنتين معًا. والعناصر الأبناء أزرار، مثل `Button` أو `IconButton`.

### Vue

جدول: خصائص ButtonGroup وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `false` | — |
| `variant` | prop | `'default' \| 'attached'` | `false` | — |
| `orientation` | prop | `'horizontal' \| 'vertical'` | `false` | — |
| `default` | slot | — | `false` | — |

يعرض ButtonGroup عنصرًا مع الخاصية `role="group"`. ويأخذ اسم المجموعة من الخاصية `label`، أو من خاصية HTML `aria-label` أو `aria-labelledby`، وتتقدّم على `label`؛ ودون أي منها لا يكون للمجموعة اسم. وتكتب الخاصيتان `variant` و`orientation` الخاصيتين `data-variant` و`data-orientation`. ويحمل المنفذ الافتراضي الأزرار. ويسرد الجدول المنفذ الافتراضي لأن الإصدار المنشور يقرؤه؛ ولا يعرّف التصريح نوع أي منفذ.

### Angular

جدول: مُدخلات hw-button-group ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `label` | input | `string` | `false` | `''` |
| `variant` | input | `'default' \| 'attached'` | `false` | — |
| `orientation` | input | `'horizontal' \| 'vertical'` | `false` | — |
| `*` | content | — | `false` | — |

يُطبَّق `HwButtonGroupComponent` على `hw-button-group`؛ والعنصر المضيف هو المجموعة، بالصنف `hw-button-group` والخاصية `role="group"`. ويُكتب المُدخل `label` في الخاصية `aria-label` للعنصر المضيف ما دام مكتوبًا، ويتقدّم على `aria-label` التي يكتبها التطبيق، فتعود هذه إلى العمل عند إزالة `label`؛ فاكتب الاسم من مصدر واحد. وتسمّي الخاصية `aria-labelledby` على العنصر المضيف المجموعةَ أيضًا. ولا يكتب المُدخلان `variant` و`orientation` الخاصيتين `data-variant` و`data-orientation` إلا عند كتابتهما. والمحتوى المُسقَط أزرار أصلية أو عناصر `hw-icon-button`.

## إمكانية الوصول

مجموعة الأزرار تجميع مسمّى لأزرار أصلية. وتضيف دور المجموعة واسمًا، ولا تضيف أي سلوك: فيحتفظ كل زر بتفعيله الخاص بالمفتاحين <kbd>Enter</kbd> و<kbd>Space</kbd>، وبموضعه الخاص في التنقل بالمفتاح Tab، وبحالته الخاصة.

- يبيّن دور المجموعة واسمها لمستخدم التقنيات المساعدة الإجراءات التي يجمعها موضوع واحد. فاكتب اسمًا يذكر موضوع الإجراءات، مثل «إجراءات الطلب»، ولا تكرّر كلمة «مجموعة»، لأن الدور يعلنها.
- لا تضيف المجموعة دور شريط الأدوات ولا التركيز المتنقل: فينقل المفتاح <kbd>Tab</kbd> التركيز إلى كل زر متاح بالترتيب.
- لا يغيّر الشكل المتصل إلا المظهر. ويُرفع مؤشر التركيز للزر في المجموعة فوق الأزرار المجاورة، فلا يخفيه تداخل الحدود أبدًا.
- المجموعة ليست عنصر تحكم للاختيار. فاختيار قيمة واحدة من عدة قيم يكون بالمكوّن `ToggleGroup`، الذي يحمل حالة التحديد.

## الاتجاه والتوطين

ليس في مجموعة الأزرار نص مدمج: يكتب التطبيق اسم المجموعة ونصوص الأزرار بلغة الصفحة. وترتّب المجموعة أزرارها بترتيب القراءة عبر خصائص CSS المنطقية، فيبدأ الصف من جهة بدء القراءة في العربية وفي الإنجليزية، ويجعل الشكل المتصل الزوايا الخارجية مستديرة في جهتَي بدء القراءة ونهايتها من الكتلة، ويداخل الحدود على المحور السطري.

- اجعل ترتيب الإجراءات واحدًا في اللغتين، ليبقى الإجراء الأساسي في الموضع نفسه من ترتيب القراءة. وتتبع الأزرار ترتيب الترميز، ويعكسه اتجاه القراءة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط مجموعة الأزرار بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تُدرج مجموعة الأزرار بين مكوّنات المحتوى الإضافية في نطاق المكوّنات في [ملاحظات التغطية](../coverage.md).
- تربط ملاحظات عنصر التحكم المقسَّم أبعاد عنصر التحكم المقسَّم وفواصله وحالاته، الواردة في ورقة أنماط كود المنصات المزوَّدة، بالمكوّن `ToggleGroup`. ولا تسجّل مجموعة الأزرار المتصلة إلا تركيبًا من هوية للإجراءات المستقلة، لا متطلبًا من المصدر؛ انظر [ملاحظات عنصر التحكم المقسَّم](../nic-segmented.md).
