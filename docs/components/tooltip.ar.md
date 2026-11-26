---
source:
  summary: 5294306438b7
  example: 6f7a3e312f0d
  variants-and-states: 0d54e377e45e
  api: 20a037b842fa
  accessibility: f301c8d756cf
  rtl-and-localisation: a380bb00ffe0
  platforms-code-reference: c68dd5cb5af6
---
# تلميح

يعرض التلميح وصفًا قصيرًا لعنصر تحكم عندما يمرّ القارئ فوقه بالمؤشر أو ينقل التركيز إليه. والنص وصفي فقط، ويجب ألا يحتوي على عنصر تحكم، ولا أن يكون النسخة الوحيدة من تعليمات ما.

## مثال

يُكمل التلميح اسم عنصر التحكم ولا يحلّ محلّه. والمشغِّل عنصر قابل للتركيز له اسمه الميسّر الخاص، ويضيف نص التلميح شرحًا قصيرًا له. ويضع هذا المثال التلميح تحت المشغِّل ويوسّطه؛ ودون `placement` و`align` تضع مكوّنات React وVue وAngular التلميح فوق المشغِّل، محاذيًا لجهة بدايته.

```html live example=basic static differences=tooltip-adapter-markup
<span data-hw="tooltip">
  <button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-tooltip-trigger>الرقم المرجعي</button>
  <span class="hw-tooltip" role="tooltip" id="basic-tooltip" data-placement="bottom" data-align="center" hidden>الرقم المدوَّن في إشعار تأكيد طلبك.</span>
</span>
```

```tsx live example=basic
<Tooltip content="الرقم المدوَّن في إشعار تأكيد طلبك." placement="bottom" align="center">
  <Button variant="secondary">الرقم المرجعي</Button>
</Tooltip>
```

```vue live example=basic
<Tooltip content="الرقم المدوَّن في إشعار تأكيد طلبك." placement="bottom" align="center">
  <Button variant="secondary">الرقم المرجعي</Button>
</Tooltip>
```

```ts live example=basic framework=angular
template: `<hw-tooltip text="الرقم المدوَّن في إشعار تأكيد طلبك." placement="bottom" align="center">
  <button hwButton hwTooltipTrigger variant="secondary">الرقم المرجعي</button>
</hw-tooltip>`
```

## الأشكال والحالات

### الموضع والمحاذاة

تضبط `placement` جهة المشغِّل التي يظهر فيها التلميح، وتضبط `align` محاذاته على امتداد تلك الجهة. وتأخذ كلتاهما قيمًا منطقية، فتتبع القيمتان `start` و`end` اتجاه القراءة. ولا يُغيَّر موضع التلميح عندما لا يتسع له المكان، فاختر جهة فيها مساحة كافية.

```html live example=placement static differences=tooltip-adapter-markup
<span data-hw="tooltip">
  <button class="hw-button" type="button" data-variant="outline" data-size="md" data-hw-tooltip-trigger>تاريخ التقديم</button>
  <span class="hw-tooltip" role="tooltip" id="placement-tooltip" data-placement="end" data-align="center" hidden>التاريخ الذي استُلم فيه الطلب.</span>
</span>
```

```tsx live example=placement
<Tooltip content="التاريخ الذي استُلم فيه الطلب." placement="end" align="center">
  <Button variant="outline">تاريخ التقديم</Button>
</Tooltip>
```

```vue live example=placement
<Tooltip content="التاريخ الذي استُلم فيه الطلب." placement="end" align="center">
  <Button variant="outline">تاريخ التقديم</Button>
</Tooltip>
```

```ts live example=placement framework=angular
template: `<hw-tooltip text="التاريخ الذي استُلم فيه الطلب." placement="end" align="center">
  <button hwButton hwTooltipTrigger variant="outline">تاريخ التقديم</button>
</hw-tooltip>`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createTooltip

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `hideDelay` | `number` | `false` | — |
| `placement` | `'top' \| 'bottom' \| 'start' \| 'end'` | `false` | — |
| `align` | `'start' \| 'center' \| 'end'` | `false` | — |

تهيّئ الدالة `createTooltip(root, options)` ترميزًا موجودًا، وتفعل الدالة `enhance()` الشيء نفسه لعنصر يحمل `data-hw="tooltip"`. ويحتوي الجذر على عنصر يحمل الخاصية `data-hw-tooltip-trigger`، وينبغي أن يكون قابلًا للتركيز، وعلى عنصر دوره tooltip؛ ويُطلق المتحكم خطأً إذا غاب أيٌّ منهما. اكتب الصنف `hw-tooltip` على عنصر التلميح، لأن الأنماط تستهدفه. ويضيف المتحكم معرّف التلميح إلى الخاصية `aria-describedby` للمشغِّل، ويُبقي المعرّفات الموجودة فيها، ويخفي التلميح. وتُكتب قيمتا `placement` و`align` في الخاصيتين `data-placement` و`data-align` لعنصر التلميح، ويمكن أن يحملهما العنصر في الترميز أيضًا. والخيار `hideDelay` هو الوقت بالملّي ثانية بين مغادرة المؤشر المشغِّلَ أو التلميح وبين إخفاء التلميح؛ ودونه تنتظر الشيفرة المنشورة 80 ملّي ثانية. ويُرجع المتحكم `show()` و`hide()` و`destroy()`، وتعيد `destroy()` الخصائص التي غيّرها المتحكم إلى حالها. ولا تفعل `show()` شيئًا ما دام المشغِّل معطَّلًا.

### React

جدول: خصائص Tooltip

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `children` | `ReactElement<HTMLAttributes<HTMLElement>>` | `true` | — |
| `content` | `string` | `true` | — |
| `placement` | `'top' \| 'bottom' \| 'start' \| 'end'` | `false` | `'top'` |
| `align` | `'start' \| 'center' \| 'end'` | `false` | `'start'` |

الخاصية `children` عنصر React واحد قابل للتركيز، هو المشغِّل؛ ويدمج Tooltip معرّف التلميح في الخاصية `aria-describedby` لهذا العنصر، فيجب أن يمرّر المكوّنُ المخصّص المستخدَم مشغِّلًا الخاصيةَ `aria-describedby`. والخاصية `content` نص عادي. ويعرض Tooltip عنصرًا غلافًا حول المشغِّل والتلميح، وتصل الخصائص الأخرى إلى الغلاف.

### Vue

جدول: خصائص Tooltip وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `content` | prop | `string` | `true` | — |
| `placement` | prop | `'top' \| 'bottom' \| 'start' \| 'end'` | `false` | `'top'` |
| `align` | prop | `'start' \| 'center' \| 'end'` | `false` | `'start'` |
| `default` | slot | — | `false` | — |

الخاصية `content` نص عادي. ويحتوي المنفذ الافتراضي على مشغِّل واحد قابل للتركيز، ويُدمج معرّف التلميح مع معرّفات الوصف الخاصة بالمشغِّل. ويسرد الجدول المنفذ `default` لأن الإصدار المنشور يقرؤه؛ ولا يعرّف التصريح نوع أي منفذ.

### Angular

جدول: مُدخلات hw-tooltip و[hwTooltipTrigger] ومخرجاتهما ومحتواهما

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `placement` | input | `'top' \| 'bottom' \| 'start' \| 'end'` | `false` | `'top'` |
| `align` | input | `'start' \| 'center' \| 'end'` | `false` | `'start'` |
| `text` | input | `string` | `true` | — |
| `tooltipId` | input | `string` | `false` | — |
| `*` | content | — | `false` | — |
| `[hwTooltipTrigger] aria-describedby` | input | `string \| null` | `false` | `null` |

يأخذ `HwTooltipComponent` (`hw-tooltip`) المُدخل المطلوب `text`. والعنصر المضيف هو الغلاف الذي يُحدَّد موضع التلميح بالنسبة إليه، ولا يعرض عنصرًا قابلًا للتركيز خاصًا به. ويحيط بعنصر واحد فقط قابل للتركيز يحمل `hwTooltipTrigger`: زر، أو رابط، أو نص يقبل التركيز عبر الخاصية `tabindex`. ودون مشغِّل يحمل هذه العلامة لا يوصف أي عنصر، ولا يدعم الإصدار 0.3.0 كتابة `hwTooltipTrigger` على مكوّن غلاف من مكوّنات هوية، مثل `hw-text-field`؛ فاكتبه على عنصر أصلي. ويأخذ المشغِّل الصنف `hw-tooltip-trigger` وخاصية `aria-describedby` تسرد معرّفاته الخاصة أولًا ثم معرّف التلميح. ويضبط المُدخل `tooltipId` معرّف عنصر التلميح؛ ودونه يُولَّد معرّف، ولا يبقى أي معرّف على الغلاف. ويأخذ التوجيه `HwTooltipTriggerDirective` (`[hwTooltipTrigger]`) المُدخل `aria-describedby` للمعرّفات التي يشير إليها المشغِّل من قبل.

## إمكانية الوصول

يحتفظ المشغِّل بدوره واسمه الميسّر، والتلميح عنصر بالدور tooltip يشير إليه المشغِّل عبر `aria-describedby`، فتقرأ التقنيات المساعدة النص وصفًا. اجعل النص قصيرًا ووصفيًا. ويجب ألا يحتوي التلميح على رابط أو زر أو أي عنصر تحكم آخر، ويجب ألا يحمل معلومات يحتاج إليها القارئ لإكمال مهمة: فمكان التعليمات الأساسية تسمية ظاهرة أو نص إرشادي.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: تلميح

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز إلى المشغِّل ويُظهر التلميح، ويخفيه عندما يغادر التركيز المشغِّل. |
| <kbd>Escape</kbd> | يخفي التلميح ويُبقي التركيز على المشغِّل. |

- يُفتح التلميح عند التركيز كما يُفتح عند المرور بالمؤشر، فيتلقّى القارئ الذي يستخدم لوحة المفاتيح الوصف نفسه الذي يتلقّاه القارئ الذي يستخدم المؤشر.
- يبقى التلميح مفتوحًا في أثناء انتقال المؤشر من المشغِّل إلى التلميح، ويُخفى بعد أن يغادر المؤشر كليهما.
- ضع التلميح داخل مربع حوار أصلي عندما يكون مشغِّله داخله، ليبقى في الطبقة العليا لمربع الحوار.

## الاتجاه والتوطين

ليس في التلميح نص مدمج: يكتب التطبيق نص التلميح بلغة الصفحة. وتأخذ `placement` و`align` قيمًا منطقية، فتتبع القيمتان `start` و`end` اتجاه القراءة لأقرب عنصر له اتجاه، وتبقى الجهة المنطقية نفسها في صفحة من اليسار إلى اليمين وفي صفحة من اليمين إلى اليسار، بينما تتغيّر الجهة الفعلية مع الاتجاه.

- عند كتابة `top` أو `bottom` تتبع `align` المحور السطري؛ وعند كتابة `start` أو `end` تتبع محور الكتلة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط التلميح بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- ترد خيارات الموضع والمحاذاة، وخصائص السطح المستخلصة من مكوّنات الجوال المزوَّدة، وحدود المقارنة، في [ملاحظات التلميح](../tooltip-placement.md)؛ وتذكر الملاحظات أن تغيير الموضع تلقائيًا غير منفَّذ، وأن المقارنة لا تشمل كل أشكال التلميح.
