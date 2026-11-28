---
source:
  summary: 4fc60d15ceb6
  example: 5136c2693280
  variants-and-states: 5e79a473374f
  api: 72669185d5fb
  accessibility: 274257dd5cd1
  rtl-and-localisation: 660f9902b0f6
  platforms-code-reference: aaea23f2ee50
---
# قائمة وصفية

تعرض القائمة الوصفية مصطلحات وأوصافها معلوماتٍ منظّمة في عنصر قائمة وصفية أصلي. وتناسب بيانات سجلّ ما، مثل تفاصيل طلب خدمة.

## مثال

يضمّ كل بند مصطلحًا ووصفًا.

```html live example=basic
<dl class="hw-description-list">
  <div><dt>الرقم المرجعي</dt><dd>ط-2041</dd></div>
  <div><dt>الخدمة</dt><dd>نسخة من مستند</dd></div>
  <div><dt>الحالة</dt><dd>قيد المراجعة</dd></div>
</dl>
```

```tsx live example=basic
<DescriptionList
  items={[
    { term: 'الرقم المرجعي', description: 'ط-2041' },
    { term: 'الخدمة', description: 'نسخة من مستند' },
    { term: 'الحالة', description: 'قيد المراجعة' },
  ]}
/>
```

```vue live example=basic
<DescriptionList
  :items="[
    { term: 'الرقم المرجعي', description: 'ط-2041' },
    { term: 'الخدمة', description: 'نسخة من مستند' },
    { term: 'الحالة', description: 'قيد المراجعة' },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-description-list
  [items]="[
    { term: 'الرقم المرجعي', description: 'ط-2041' },
    { term: 'الخدمة', description: 'نسخة من مستند' },
    { term: 'الحالة', description: 'قيد المراجعة' },
  ]"
/>`
```

## الأشكال والحالات

### الشكل الأفقي

يضع الشكل الأفقي كل مصطلح ووصفه جنبًا إلى جنب. استخدمه للمصطلحات القصيرة في حاوية عريضة؛ وعندما يقلّ عرض نافذة العرض عن 40rem تعيد ورقة الأنماط الوصف تحت المصطلح.

```html live example=horizontal
<dl class="hw-description-list" data-variant="horizontal">
  <div><dt>الرقم المرجعي</dt><dd>ط-2041</dd></div>
  <div><dt>الخدمة</dt><dd>نسخة من مستند</dd></div>
  <div><dt>الحالة</dt><dd>قيد المراجعة</dd></div>
</dl>
```

```tsx live example=horizontal
<DescriptionList
  variant="horizontal"
  items={[
    { term: 'الرقم المرجعي', description: 'ط-2041' },
    { term: 'الخدمة', description: 'نسخة من مستند' },
    { term: 'الحالة', description: 'قيد المراجعة' },
  ]}
/>
```

```vue live example=horizontal
<DescriptionList
  variant="horizontal"
  :items="[
    { term: 'الرقم المرجعي', description: 'ط-2041' },
    { term: 'الخدمة', description: 'نسخة من مستند' },
    { term: 'الحالة', description: 'قيد المراجعة' },
  ]"
/>
```

```ts live example=horizontal framework=angular
template: `<hw-description-list
  variant="horizontal"
  [items]="[
    { term: 'الرقم المرجعي', description: 'ط-2041' },
    { term: 'الخدمة', description: 'نسخة من مستند' },
    { term: 'الحالة', description: 'قيد المراجعة' },
  ]"
/>`
```

### الشكل المتقارب

يقلّل الشكل المتقارب المسافات الرأسية في كل مجموعة. استخدمه عندما تقع القائمة داخل بطاقة أو لوحة جانبية.

```html live example=compact
<dl class="hw-description-list" data-variant="compact">
  <div><dt>الرقم المرجعي</dt><dd>ط-2041</dd></div>
  <div><dt>الخدمة</dt><dd>نسخة من مستند</dd></div>
  <div><dt>الحالة</dt><dd>قيد المراجعة</dd></div>
</dl>
```

```tsx live example=compact
<DescriptionList
  variant="compact"
  items={[
    { term: 'الرقم المرجعي', description: 'ط-2041' },
    { term: 'الخدمة', description: 'نسخة من مستند' },
    { term: 'الحالة', description: 'قيد المراجعة' },
  ]}
/>
```

```vue live example=compact
<DescriptionList
  variant="compact"
  :items="[
    { term: 'الرقم المرجعي', description: 'ط-2041' },
    { term: 'الخدمة', description: 'نسخة من مستند' },
    { term: 'الحالة', description: 'قيد المراجعة' },
  ]"
/>
```

```ts live example=compact framework=angular
template: `<hw-description-list
  variant="compact"
  [items]="[
    { term: 'الرقم المرجعي', description: 'ط-2041' },
    { term: 'الخدمة', description: 'نسخة من مستند' },
    { term: 'الحالة', description: 'قيد المراجعة' },
  ]"
/>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-description-list

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-description-list'` | `true` | — |
| `data-variant` | `'compact' \| 'horizontal'` | `false` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس للقائمة الوصفية متحكم في JavaScript، فالترميز هو واجهتها البرمجية: اكتب عنصر `dl` بالصنف `hw-description-list`، ولكل زوج عنصر `div` يحتوي على عنصر `dt` واحد وعنصر `dd` واحد. والخاصية `data-variant` اختيارية: تضع القيمة `horizontal` المصطلح والوصف جنبًا إلى جنب، وتقلّل القيمة `compact` المسافات. ولا يكتب ملف README لحزمة vanilla الخاصية `data-variant="horizontal"` إلا لهذا التخطيط؛ ودون الخاصية تكون القائمة متراصّة، يقع فيها كل وصف تحت مصطلحه.

### React

جدول: خصائص DescriptionList

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `items` | `readonly DescriptionItem[]` | `true` | — |
| `variant` | `'stacked' \| 'horizontal' \| 'compact'` | `false` | — |

الخاصية `items` مطلوبة. ولكل بند من النوع `DescriptionItem` الحقلان `term` و`description`، وكلاهما محتوى React قابل للعرض، والحقل الاختياري `key`. وتكتب الخاصية `variant` الخاصية `data-variant` عند تمريرها، ولا تنسّق ورقة الأنماط إلا القيمتين `horizontal` و`compact`، فالقيمة `stacked` هي تخطيط القائمة التي لا تحمل الخاصية.

### Vue

جدول: خصائص DescriptionList وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly DescriptionItem[]` | `true` | — |
| `variant` | prop | `'stacked' \| 'horizontal' \| 'compact'` | `false` | — |
| `item:<index>` | slot | — | `false` | — |

الخاصية `items` مطلوبة. ولكل بند الحقل `term` سلسلةً نصية، والحقل `description` الذي يقبل أي محتوى قابل للعرض. وتكتب الخاصية `variant` الخاصية `data-variant` عند تمريرها، ولا تنسّق ورقة الأنماط إلا القيمتين `horizontal` و`compact`، فالقيمة `stacked` هي تخطيط القائمة التي لا تحمل الخاصية. ويحلّ المنفذ `item:<index>` محلّ وصف البند في ذلك الموضع، ويتلقّى ذلك البند.

### Angular

جدول: مُدخلات hw-description-list ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `items` | input | `readonly HwDescription[]` | `false` | `[]` |
| `variant` | input | `'stacked' \| 'horizontal' \| 'compact'` | `false` | — |
| `*` | content | — | `false` | — |

يُطبَّق `HwDescriptionListComponent` على `hw-description-list`، الذي يحيط بعنصر `dl` ويُعرض كتلةً. ولكل بند من النوع `HwDescription` الحقلان `term` و`description`، وكلاهما سلسلة نصية. ويكتب المُدخل `variant` الخاصية `data-variant` عند تمريره، ولا تنسّق ورقة الأنماط إلا القيمتين `horizontal` و`compact`، فالقيمة `stacked` هي تخطيط القائمة التي لا تحمل الخاصية. ويوضع المحتوى الذي يُسقطه التطبيق بعد البنود، ويقترحه ملف README لحزمة Angular لعناصر `dt` و`dd` أصلية ذات محتوى أغنى.

## إمكانية الوصول

تعرض القائمة الوصفية عنصر `dl` أصليًا، تقدّم التقنيات المساعدة عناصر `dt` و`dd` فيه قائمةً من المصطلحات والأوصاف، فلا يُضاف إليه دور ولا تسمية.

- يقع كل زوج في عنصر `div` واحد داخل عنصر `dl`.
- اكتب المصطلح عبارة اسمية قصيرة، وضع القيمة في الوصف. فمن يتنقّل في القائمة يسمع كل مصطلح قبل قيمته.
- القائمة ليست تفاعلية، وليس فيها عنصر يقبل التركيز. ويحتفظ المحتوى الذي يضعه التطبيق في وصف، مثل الرابط، بسلوك لوحة المفاتيح الخاص به.
- لا تستخدم القائمة الوصفية للتخطيط أو لجدول من صفوف وأعمدة؛ واستخدم جدولًا للبيانات التي لكل صف فيها عدة قيم.

## الاتجاه والتوطين

ليس في القائمة الوصفية نص مدمج: يكتب التطبيق المصطلحات والأوصاف بلغة الصفحة. وتتبع القائمة اتجاه الصفحة، فيبدأ المصطلح من جهة بدء القراءة في العربية وفي الإنجليزية.

- في الشكل الأفقي يقع عمود المصطلحات في جهة بدء القراءة، ويليه عمود الأوصاف، في اتجاهَي القراءة كليهما.
- اكتب الأرقام والتواريخ والمبالغ في الوصف بالصيغة التي يستخدمها التطبيق لإعداداته المحلية؛ فالقائمة لا تنسّقها ولا تعيد ترتيبها.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط القائمة الوصفية بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تُدرج القائمة الوصفية ضمن مكوّنات المحتوى الإضافية في نطاق المكوّنات في [ملاحظات التغطية](../coverage.md). ولا تسجّل الملاحظات ملاحظة مستقلة لها.
