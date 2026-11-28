---
source:
  summary: 14aef62e5aae
  example: 9faaf5d59c78
  variants-and-states: a39d47d94bb4
  api: bb1b7e101b3a
  accessibility: b311602ad848
  rtl-and-localisation: 8c6fb56de9ef
  platforms-code-reference: 90f824ba0bc5
---
# قسم قابل للطي

القسم القابل للطي عنصر إظهار وإخفاء واحد يُظهر منطقة من المحتوى أو يخفيها تحت تسمية ظاهرة. ويعرض عنصر `details` أصليًا فيه عنصر `summary`، فيوفّر المتصفح حالة الفتح والتبديل بين الفتح والإغلاق.

## مثال

تسمّي التسمية المحتوى الذي يُفتح. اكتبها عبارةً قصيرة تخبر القارئ بما تحتويه المنطقة.

```html live example=basic differences=collapsible-adapter-markup
<details class="hw-collapsible">
  <summary>المستندات المطلوبة لهذا الطلب</summary>
  <div><p>أرفق نسخة من وثيقة إثبات الهوية وما يثبت العنوان.</p></div>
</details>
```

```tsx live example=basic
<Collapsible label="المستندات المطلوبة لهذا الطلب">
  <p>أرفق نسخة من وثيقة إثبات الهوية وما يثبت العنوان.</p>
</Collapsible>
```

```vue live example=basic
<Collapsible label="المستندات المطلوبة لهذا الطلب">
  <p>أرفق نسخة من وثيقة إثبات الهوية وما يثبت العنوان.</p>
</Collapsible>
```

```ts live example=basic framework=angular
template: `<hw-collapsible label="المستندات المطلوبة لهذا الطلب">
  <p>أرفق نسخة من وثيقة إثبات الهوية وما يثبت العنوان.</p>
</hw-collapsible>`
```

## الأشكال والحالات

### مفتوح

يبدأ القسم القابل للطي مغلقًا. ولبدئه مفتوحًا اضبط الحالة الأولية: الخاصية الأصلية `open` في ترميز vanilla، والخاصية `defaultOpen` في React، والخاصية `defaultValue` في Vue، والمُدخل `open` في Angular.

```html live example=open differences=collapsible-adapter-markup
<details class="hw-collapsible" open>
  <summary>مدة المعالجة</summary>
  <div><p>يُراجَع الطلب خلال خمسة أيام عمل من تقديمه.</p></div>
</details>
```

```tsx live example=open
<Collapsible label="مدة المعالجة" defaultOpen>
  <p>يُراجَع الطلب خلال خمسة أيام عمل من تقديمه.</p>
</Collapsible>
```

```vue live example=open
<Collapsible label="مدة المعالجة" default-value>
  <p>يُراجَع الطلب خلال خمسة أيام عمل من تقديمه.</p>
</Collapsible>
```

```ts live example=open framework=angular
template: `<hw-collapsible label="مدة المعالجة" [open]="true">
  <p>يُراجَع الطلب خلال خمسة أيام عمل من تقديمه.</p>
</hw-collapsible>`
```

### معطَّل

يحتفظ القسم القابل للطي المعطَّل بتسميته وبمكانه في ترتيب التنقل بالمفتاح Tab. وفي React وVue وAngular لا يغيّر النقر على عنصر `summary` شيئًا، ولا يغيّر <kbd>Enter</kbd> أو <kbd>Space</kbd> عليه شيئًا. ويحمل عنصر `summary` الخاصية `aria-disabled="true"`، وتعرض ورقة الأنماط لون التعطيل. وليس في ترميز vanilla برنامج نصي يوقف التبديل، فلا تتساوى النتائج الأربع إلا في حالة السكون: فما زال مقطع `html` يُفتح عند التفعيل.

```html live example=disabled differences=collapsible-adapter-markup
<details class="hw-collapsible">
  <summary aria-disabled="true">تفاصيل الدفع</summary>
  <div><p>تتاح تفاصيل الدفع بعد تقديم الطلب.</p></div>
</details>
```

```tsx live example=disabled
<Collapsible label="تفاصيل الدفع" disabled>
  <p>تتاح تفاصيل الدفع بعد تقديم الطلب.</p>
</Collapsible>
```

```vue live example=disabled
<Collapsible label="تفاصيل الدفع" disabled>
  <p>تتاح تفاصيل الدفع بعد تقديم الطلب.</p>
</Collapsible>
```

```ts live example=disabled framework=angular
template: `<hw-collapsible label="تفاصيل الدفع" [disabled]="true">
  <p>تتاح تفاصيل الدفع بعد تقديم الطلب.</p>
</hw-collapsible>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-collapsible

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-collapsible'` | `true` | — |
| `open` | `boolean` | `false` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس للقسم القابل للطي متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر `details` أصليًا بالصنف `hw-collapsible`، وفيه عنصر `summary` ابنًا أول يحمل التسمية، وبعده عنصر `div` واحد فيه المحتوى. والخاصية `open` هي الخاصية المنطقية الأصلية التي تُظهر المحتوى؛ ودونها يكون المحتوى مخفيًا. وترسم ورقة الأنماط علامة الزائد أو الناقص في عنصر `summary`، وحدًّا بين عنصر `summary` والمحتوى. ولمظهر التعطيل اكتب الخاصية `aria-disabled="true"` على عنصر `summary`؛ ولا يوقف عندئذ أي برنامج نصي التبديل، فما زال القسم القابل للطي المعطَّل المكتوب يدويًا يُفتح عند التفعيل.

### React

جدول: خصائص Collapsible

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `label` | `ReactNode` | `true` | — |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | `false` |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `disabled` | `boolean` | `false` | — |

الخاصية `label` هي محتوى عنصر `summary`، وهي مطلوبة. استخدم `open` مع `onOpenChange` لقسم متحكَّم فيه، أو `defaultOpen` لقسم غير متحكَّم فيه، وقيمتها `false` ما لم تُضبط. وتتلقّى `onOpenChange` الحالة الجديدة بعد أن يبدّل القارئ حالة عنصر `summary`. وما دامت `disabled` مضبوطة يحمل عنصر `summary` الخاصية `aria-disabled="true"` ويبقى قابلًا للتركيز، ولا يفعل النقر شيئًا، ولا تُستدعى `onOpenChange`؛ وتبقى `open` تابعة للتطبيق. وتُعرض العناصر الأبناء في عنصر `div` بعد عنصر `summary`. وتصل الخصائص الأخرى إلى عنصر `details`.

### Vue

جدول: خصائص Collapsible وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `true` | — |
| `modelValue` | prop | `boolean` | `false` | — |
| `defaultValue` | prop | `boolean` | `false` | `false` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `update:modelValue` | event | `(value: boolean) => void` | `false` | — |
| `default` | slot | — | `false` | — |

الخاصية `label` هي نص عنصر `summary`، وهي مطلوبة. استخدم `v-model` لحالة منطقية متحكَّم فيها، أو `defaultValue` لحالة غير متحكَّم فيها، وقيمتها `false` ما لم تُضبط؛ ويحمل الحدث `update:modelValue` الحالة الجديدة بعد أن يبدّل القارئ حالة عنصر `summary`. وما دامت `disabled` مضبوطة يحمل عنصر `summary` الخاصية `aria-disabled="true"` ويبقى قابلًا للتركيز، ولا يفعل النقر شيئًا، ويبقى بإمكان التطبيق تغيير القيمة. ويملأ المنفذ الافتراضي عنصر `div` بعد عنصر `summary`. وتصل خصائص HTML الأخرى إلى عنصر `details`. ويسرد الجدول المنفذ `default` لأن الإصدار المنشور يقرؤه؛ ولا يعرّف التصريح نوع أي منفذ.

### Angular

جدول: مُدخلات hw-collapsible ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `label` | input | `string` | `true` | — |
| `open` | input | `boolean` | `false` | `false` |
| `disabled` | input | `boolean` | `false` | `false` |
| `openChange` | output | `boolean` | `false` | — |
| `*` | content | — | `false` | — |

يُطبَّق `HwCollapsibleComponent` على `hw-collapsible`. والمُدخل `label` هو نص عنصر `summary`، وهو مطلوب. اربط `[(open)]` ربطًا ثنائي الاتجاه بالحالة: يكتب المكوّن `open` ويُرسل الحدث `openChange` بالحالة الجديدة عندما يبدّل القارئ حالة عنصر `summary`. وقيمة `open` هي `false` ما لم يُضبط. وما دام `disabled` مضبوطًا يحمل عنصر `summary` الخاصية `aria-disabled="true"` ويبقى قابلًا للتركيز، ويُلغى التفعيل، ولا يُرسَل الحدث `openChange`، ويبقى `open` تابعًا للتطبيق. ويملأ المحتوى المُسقَط عنصر `div` بعد عنصر `summary`.

## إمكانية الوصول

القسم القابل للطي عنصر `details` أصلي فيه عنصر `summary`، فيوفّر المتصفح دور عنصر الإظهار والإخفاء، والتركيز على عنصر `summary`، والتبديل بين الفتح والإغلاق، وتكون التسمية هي الاسم الميسّر لعنصر `summary`. ضع القسم القابل للطي في موضع تكون فيه تسميته مفهومة دون المحتوى؛ فالقارئ الذي لا يفتحه ينبغي أن يعرف ما يحتويه.

- يفتح المفتاحان <kbd>Enter</kbd> و<kbd>Space</kbd> على عنصر `summary` الذي عليه التركيز المحتوى أو يغلقانه، كما في أي عنصر `summary` أصلي.
- في React وVue وAngular يُبقي القسم القابل للطي المعطَّل عنصر `summary` في ترتيب التنقل بالمفتاح Tab، ويحتفظ باسمه. ويحمل الخاصية `aria-disabled="true"`، ولا يغيّر النقر و<kbd>Enter</kbd> و<kbd>Space</kbd> شيئًا، ولا يُصدر أيٌّ منها إشعارًا. وليس في ترميز vanilla برنامج نصي: فما زال عنصر `summary` الذي يحمل `aria-disabled="true"` يُفتح عند التفعيل.
- في React يحمل عنصر `summary` الخاصية `aria-controls` التي تشير إلى عنصر المحتوى.
- ترسم ورقة الأنماط العلامة قناعًا على عنصر `summary`، وتحلّ محلّ العلامة الأصلية؛ ولا نص في العلامة، فالتسمية وحدها تسمّي عنصر التحكم.

## الاتجاه والتوطين

ليس في القسم القابل للطي نص مدمج: يكتب التطبيق التسمية والمحتوى بلغة الصفحة. ويرث العنصر لغة الصفحة واتجاهها، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية: فتُحاذى التسمية إلى جهة بدء القراءة، وتقع العلامة في جهة نهايتها، في العربية وفي الإنجليزية.

- اكتب التسمية والمحتوى باللغة نفسها وبالاتجاه نفسه؛ وميّز المقطع المكتوب بلغة أخرى بالخاصية `lang` الخاصة به.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط القسم القابل للطي بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- يُدرج القسم القابل للطي بين المكوّنات الأصلية وبين مكوّنات التفاعل الإضافية في [ملاحظات التغطية](../coverage.md): يوفّر المتصفح الإظهار والإخفاء، وتضيف المكتبة الأنماط والمحوّلات.
