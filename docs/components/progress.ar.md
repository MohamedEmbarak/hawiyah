---
source:
  summary: 8ea178620a0e
  example: 1a572f91fad1
  variants-and-states: 24ee8deeb9f4
  api: 141f4b79f8d5
  accessibility: 2ba5802b9d7f
  rtl-and-localisation: 8c5b49c2d68d
  platforms-code-reference: 7622758c061c
---
# تقدم

شريط التقدم عنصر `progress` أصلي بأنماط هوية. يبيّن مقدار ما أُنجز من مهمة، أو أن مهمة غير معروفة المدة قيد التنفيذ، ويتيح قيمته للتقنيات المساعدة عبر العنصر الأصلي.

## مثال

ليس للعنصر تسمية ظاهرة خاصة به، فيمنحه التطبيق اسمًا ميسّرًا عبر `aria-labelledby`، التي تشير إلى النص المقابل الظاهر بجانبه. وتُكتب القيمة والحد الأقصى كما يُعطيان، ويعلن المتصفح القيمة نسبةً من الحد الأقصى.

```html live example=basic static
<div class="hw-stack">
  <p id="basic-text">جارٍ رفع مستنداتك: 60 من 100 ملف</p>
  <progress class="hw-progress" aria-labelledby="basic-text" value="60" max="100"></progress>
</div>
```

```tsx live example=basic
<div className="hw-stack">
  <p id="basic-text">جارٍ رفع مستنداتك: 60 من 100 ملف</p>
  <Progress aria-labelledby="basic-text" value={60} max={100} />
</div>
```

```vue live example=basic
<div class="hw-stack">
  <p id="basic-text">جارٍ رفع مستنداتك: 60 من 100 ملف</p>
  <Progress aria-labelledby="basic-text" :value="60" :max="100" />
</div>
```

```ts live example=basic framework=angular
template: `<div class="hw-stack">
  <p id="basic-text">جارٍ رفع مستنداتك: 60 من 100 ملف</p>
  <hw-progress aria-labelledby="basic-text" [value]="60" [max]="100" />
</div>`
```

## الأشكال والحالات

### غير محدَّد

شريط التقدم الذي ليس له قيمة غير محدَّد: يعرض جزءًا يتحرّك على المحور السطري ما دامت مدة المهمة غير معروفة. وامنحه اسمًا يذكر ما يجري تنفيذه.

```html live example=indeterminate static differences=progress-adapter-max
<progress class="hw-progress" aria-label="جارٍ التحقق من طلبك"></progress>
```

```tsx live example=indeterminate
<Progress label="جارٍ التحقق من طلبك" />
```

```vue live example=indeterminate
<Progress label="جارٍ التحقق من طلبك" />
```

```ts live example=indeterminate framework=angular
template: `<hw-progress label="جارٍ التحقق من طلبك" />`
```

### الحجم

تقبل الخاصية `size` القيمة `sm` أو `lg`. ودونها يكون للشريط الارتفاع الافتراضي.

```html live example=sizes static
<div class="hw-stack">
  <progress class="hw-progress" aria-label="اكتمال الملف الشخصي" value="40" max="100" data-size="sm"></progress>
  <progress class="hw-progress" aria-label="تقدّم الطلب" value="75" max="100" data-size="lg"></progress>
</div>
```

```tsx live example=sizes
<div className="hw-stack">
  <Progress label="اكتمال الملف الشخصي" value={40} size="sm" />
  <Progress label="تقدّم الطلب" value={75} size="lg" />
</div>
```

```vue live example=sizes
<div class="hw-stack">
  <Progress label="اكتمال الملف الشخصي" :value="40" size="sm" />
  <Progress label="تقدّم الطلب" :value="75" size="lg" />
</div>
```

```ts live example=sizes framework=angular
template: `<div class="hw-stack">
  <hw-progress label="اكتمال الملف الشخصي" [value]="40" size="sm" />
  <hw-progress label="تقدّم الطلب" [value]="75" size="lg" />
</div>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-progress

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-progress'` | `true` | — |
| `data-size` | `'lg' \| 'sm'` | `false` | — |

ليس لشريط التقدم متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر `progress` أصليًا بالصنف `hw-progress`، وسمِّه بالخاصية `aria-label` أو `aria-labelledby`، لأن العنصر ليس له تسمية ظاهرة خاصة به. والخاصيتان `value` و`max` خاصيتان أصليتان: اكتبهما معًا لشريط محدَّد، واحذف `value` لشريط غير محدَّد. وتبقى القيمة التي تتجاوز `max` كما كُتبت، ويعرض المتصفح شريطًا ممتلئًا. والخاصية `data-size` اختيارية: تغيّر القيمتان `sm` و`lg` الارتفاع، ودونها يكون للشريط الارتفاع الافتراضي.

### React

جدول: خصائص Progress

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `size` | `'sm' \| 'lg'` | `false` | — |
| `label` | `string` | `false` | — |

يعرض Progress عنصر `progress` أصليًا واحدًا بالصنف `hw-progress`، ويقبل أيضًا خصائص عنصر `progress` الأصلي، ومنها `value` و`max`، وتُكتبان كما تُعطيان. وتُكتب `max` بالقيمة 100 عندما لا تُمرَّر. واحذف `value` لشريط غير محدَّد. والخاصية `label` هي الاسم الميسّر، وتُكتب في `aria-label`؛ ومرّر بدلًا منها `aria-label` أو `aria-labelledby` عندما يسمّي التطبيق الشريط بطريقة أخرى. ودون أي من الثلاث يُصدر المكوّن تحذيرًا في إصدارات التطوير. ولا تُعرض أي تسمية ظاهرة. وتقبل الخاصية `size` القيمة `sm` أو `lg`.

### Vue

جدول: خصائص Progress وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `false` | — |
| `value` | prop | `number` | `false` | — |
| `max` | prop | `number` | `false` | `100` |
| `size` | prop | `'sm' \| 'lg'` | `false` | — |

يعرض Progress عنصر `progress` أصليًا واحدًا بالصنف `hw-progress`. وتُكتب `value` و`max` كما تُعطيان، وقيمة `max` هي 100 عندما لا تُمرَّر. واحذف `value` لشريط غير محدَّد. والخاصية `label` هي الاسم الميسّر، وتُكتب في `aria-label`؛ ومرّر بدلًا منها `aria-label` أو `aria-labelledby` عندما يسمّي التطبيق الشريط بطريقة أخرى. ودون أي من الثلاث يُصدر المكوّن تحذيرًا في إصدارات التطوير. ولا تُعرض أي تسمية ظاهرة. وتقبل الخاصية `size` القيمة `sm` أو `lg`. ولا يعرّف التصريح المنشور نوع أي منفذ، ولا يقرأ الإصدار المنشور أي منفذ.

### Angular

جدول: مُدخلات hw-progress ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `value` | input | `number \| null` | `false` | `null` |
| `max` | input | `number` | `false` | `100` |
| `size` | input | `'sm' \| 'lg'` | `false` | — |

يُطبَّق `HwProgressComponent` على `hw-progress`، ويعرض داخله عنصر `progress` أصليًا واحدًا بالصنف `hw-progress`. ويُكتب المُدخلان `value` و`max` كما يُعطيان، وقيمة `max` هي 100 عندما لا تُضبط، وعندما تكون قيمة `value` هي `null` لا تُكتب أي قيمة، فيكون الشريط غير محدَّد. ويُسمّى المكوّن بالمُدخل `aria-label`، أو بالمُدخل `aria-labelledby` مع نص العنصر الذي يشير إليه، أو بالمُدخل `label`؛ ويُكتب `aria-describedby` على العنصر الأصلي. ودون اسم يُصدر المكوّن تحذيرًا في إصدارات التطوير. ولا تُعرض أي تسمية ظاهرة. ويقبل المُدخل `size` القيمة `sm` أو `lg`.

## إمكانية الوصول

شريط التقدم عنصر `progress` أصلي، فيوفّر المتصفح دوره، ويتيح القيمة الحالية والحد الأقصى للتقنيات المساعدة. وليس للعنصر تسمية ظاهرة، فيوفّر التطبيق اسمه، ويوفّر النص الظاهر عندما يحتاج القارئ إلى الرقم.

- سمِّ كل شريط: استخدم `aria-label`، أو `aria-labelledby` التي تشير إلى نص ظاهر يذكر ما يتقدّم. وفي React وVue وAngular تكتب `label` الاسم الميسّر.
- اذكر القيمة نصًا بجانب الشريط عندما يكون للرقم أهمية، كما يفعل المثال. فالشريط وحده يبيّن نسبة، لا كمية.
- تُكتب القيمة كما يعطيها التطبيق؛ فلا يحصرها المكوّن بين حدَّين ولا يقرّبها.
- ليس للشريط غير المحدَّد قيمة. وتحرّك ورقة الأنماط جزأه على المحور السطري، وتعرض خطوطًا ثابتة عندما يطلب القارئ تقليل الحركة.
- في وضع الألوان القسرية تُرسم القيمة بلون التمييز في النظام.
- لا يعلن شريط التقدم التغييرات. وللمهمة التي تهمّ نتيجتها، وفّر رسالة حالة منفصلة تذكر النتيجة.

## الاتجاه والتوطين

ليس في شريط التقدم نص مدمج: يكتب التطبيق الاسم والنص الذي بجانب الشريط بلغة الصفحة. ويمتلئ الشريط من جهة بدء القراءة، ويتحرّك الجزء المتحرّك في الشريط غير المحدَّد على المحور السطري، فيتبع كلاهما اتجاه الصفحة.

- اكتب الأعداد التي بجانب الشريط بنظام الأرقام الذي تستخدمه الصفحة؛ فالعنصر يكتب القيمة في خاصية رقمية، ولا ينسّقها.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط شريط التقدم بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- يُدرج شريط التقدم بين مكوّنات العرض الأولى في نطاق المكوّنات في [ملاحظات التغطية](../coverage.md). ولا تسجّل الملاحظات ربطه بأي مصدر مزوَّد من كود المنصات.
- التكييف الوحيد المسجّل لشريط التقدم يخص الوضع الداكن: تمنح لوحة الألوان الداكنة في كود المنصات السطحَ والسطحَ الخافت قيمة واحدة، فتستخدم مسارات أشرطة التقدم درجة أفتح من السطح. ويذكر README الحزمة `@hawiyah/styles` هذا التكييف؛ وتُستخلص السمة الداكنة نفسها من الأوضاع الدلالية المزوَّدة، كما تصف [ملاحظات مرجع هيئة الحكومة الرقمية](../dga-reference.md).
