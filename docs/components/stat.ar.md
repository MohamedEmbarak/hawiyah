---
source:
  summary: 5d3a60f924ed
  example: f78f28a2bc3f
  variants-and-states: 5478936cc78d
  api: df08c12c1e99
  accessibility: 0b6f76aa52ec
  rtl-and-localisation: 49716743ddf4
  platforms-code-reference: 2d7cca9ba3bb
---
# إحصائية

تعرض الإحصائية قيمة واحدة لها تسمية، ومعها سياق داعم اختياري: وصف وتغيّر. وتناسب رقمًا يطالعه القارئ سريعًا، مثل عدد الطلبات في فترة ما.

## مثال

تسمّي التسميةُ الرقم، والقيمةُ هي الرقم نفسه، ويذكر الوصفُ فترته، ويبيّن التغيّرُ ما طرأ عليه. ويعرض المكوّن القيمة كما تُمرَّر إليه، ولا ينسّقها.

```html live example=basic
<div class="hw-stat">
  <span class="hw-stat-label">الطلبات المكتملة</span>
  <strong class="hw-stat-value">128</strong>
  <p class="hw-stat-description">هذا الشهر</p>
  <span class="hw-stat-trend" data-tone="success">بزيادة 12% عن الشهر الماضي</span>
</div>
```

```tsx live example=basic
<Stat
  label="الطلبات المكتملة"
  value="128"
  description="هذا الشهر"
  trend="بزيادة 12% عن الشهر الماضي"
  trendTone="success"
/>
```

```vue live example=basic
<Stat
  label="الطلبات المكتملة"
  value="128"
  description="هذا الشهر"
  trend="بزيادة 12% عن الشهر الماضي"
  trend-tone="success"
/>
```

```ts live example=basic framework=angular
template: `<hw-stat
  label="الطلبات المكتملة"
  value="128"
  description="هذا الشهر"
  trend="بزيادة 12% عن الشهر الماضي"
  trendTone="success"
/>`
```

## الأشكال والحالات

### اللون الدلالي

يضبط اللون الدلالي لون القيمة: `success` أو `danger`، وتُبقي القيمة `neutral` اللون الافتراضي. ويُضبط لون التغيّر على حدة، باللون الدلالي للتغيّر. استخدم `danger` لرقم يحتاج إلى انتباه، واذكر السبب في التسمية أو في الوصف، لأن اللون وحده لا يبيّنه.

```html live example=tone
<div class="hw-stat" data-tone="danger">
  <span class="hw-stat-label">الطلبات المتأخرة</span>
  <strong class="hw-stat-value">7</strong>
  <p class="hw-stat-description">بانتظار الرد منذ أكثر من 5 أيام</p>
  <span class="hw-stat-trend" data-tone="danger">بزيادة 2 عن الأسبوع الماضي</span>
</div>
```

```tsx live example=tone
<Stat
  label="الطلبات المتأخرة"
  value="7"
  description="بانتظار الرد منذ أكثر من 5 أيام"
  trend="بزيادة 2 عن الأسبوع الماضي"
  tone="danger"
  trendTone="danger"
/>
```

```vue live example=tone
<Stat
  label="الطلبات المتأخرة"
  value="7"
  description="بانتظار الرد منذ أكثر من 5 أيام"
  trend="بزيادة 2 عن الأسبوع الماضي"
  tone="danger"
  trend-tone="danger"
/>
```

```ts live example=tone framework=angular
template: `<hw-stat
  label="الطلبات المتأخرة"
  value="7"
  description="بانتظار الرد منذ أكثر من 5 أيام"
  trend="بزيادة 2 عن الأسبوع الماضي"
  tone="danger"
  trendTone="danger"
/>`
```

### الشكل البسيط

يزيل الشكل البسيط حدود الإحصائية وحشوتها، فيمكن وضعها داخل بطاقة أو حاوية أخرى تحيط بها. وليس لهذه الإحصائية تغيّر.

```html live example=plain
<div class="hw-stat" data-variant="plain">
  <span class="hw-stat-label">الطلبات المفتوحة</span>
  <strong class="hw-stat-value">24</strong>
  <p class="hw-stat-description">في جميع الخدمات</p>
</div>
```

```tsx live example=plain
<Stat
  label="الطلبات المفتوحة"
  value="24"
  description="في جميع الخدمات"
  variant="plain"
/>
```

```vue live example=plain
<Stat
  label="الطلبات المفتوحة"
  value="24"
  description="في جميع الخدمات"
  variant="plain"
/>
```

```ts live example=plain framework=angular
template: `<hw-stat
  label="الطلبات المفتوحة"
  value="24"
  description="في جميع الخدمات"
  variant="plain"
/>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-stat

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-stat'` | `true` | — |
| `data-tone` | `'danger' \| 'success'` | `false` | — |
| `data-variant` | `'plain'` | `false` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس للإحصائية متحكم في JavaScript، فالترميز هو واجهتها البرمجية: اكتب عنصرًا بالصنف `hw-stat`، وفيه بهذا الترتيب عنصر `span` بالصنف `hw-stat-label`، وعنصر `strong` بالصنف `hw-stat-value`، وعند الحاجة عنصر `p` بالصنف `hw-stat-description`، وعند الحاجة عنصر `span` بالصنف `hw-stat-trend`. ولا يُستخدم عنصر `dl`، الذي استخدمه ترميز سابق للإحصائية. وقيمة الخاصية `data-tone` على الجذر هي `success` أو `danger`، ويضيف ملف README لحزمة vanilla القيمة `neutral` للجذر؛ وقيمتها على التغيّر هي `success` أو `danger`. وتقبل الخاصية `data-variant` القيمة `plain`.

### React

جدول: خصائص Stat

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `label` | `ReactNode` | `true` | — |
| `value` | `ReactNode` | `true` | — |
| `description` | `ReactNode` | `false` | — |
| `trend` | `ReactNode` | `false` | — |
| `tone` | `'neutral' \| 'success' \| 'danger'` | `false` | — |
| `variant` | `'plain'` | `false` | — |
| `trendTone` | `'success' \| 'danger'` | `false` | — |

الخاصيتان `label` و`value` مطلوبتان. وتقبل خصائص المحتوى الأربع محتوى React قابلًا للعرض، فيمكن أن تحمل القيمة والتغيّر محتوى غنيًا، مثل مبلغ مع اسم عملته المخفي. ويتولّى المستدعي تنسيق القيم: فالمكوّن يعرضها كما تُمرَّر إليه. وتضبط الخاصية `trendTone` اللون الدلالي للتغيّر، وتضبط الخاصية `tone` لون القيمة.

### Vue

جدول: خصائص Stat وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `true` | — |
| `value` | prop | `string \| number` | `false` | — |
| `description` | prop | `string` | `false` | — |
| `trend` | prop | `string` | `false` | — |
| `tone` | prop | `'neutral' \| 'success' \| 'danger'` | `false` | — |
| `variant` | prop | `'plain'` | `false` | — |
| `trendTone` | prop | `'success' \| 'danger'` | `false` | — |
| `value` | slot | — | `false` | — |
| `trend` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |

الخاصية `label` مطلوبة، وتعرض الخاصية `value` سلسلة نصية أو رقمًا كما يُمرَّر إليها؛ فالمكوّن لا ينسّق الأرقام، وليس له خيار للإعدادات المحلية، فنسّق الرقم في التطبيق. ويقبل المنفذان `value` و`trend` محتوى غنيًا، ويتقدّمان على الخاصيتين اللتين تحملان الاسمين نفسيهما. وتُكتب الخاصية `trendTone` على التغيّر، والخاصية `tone` على الإحصائية.

### Angular

جدول: مُدخلات hw-stat ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `label` | input | `string` | `true` | — |
| `value` | input | `string \| number` | `false` | `''` |
| `description` | input | `string` | `false` | `''` |
| `trend` | input | `string` | `false` | `''` |
| `trendTone` | input | `'success' \| 'danger'` | `false` | — |
| `tone` | input | `'neutral' \| 'success' \| 'danger'` | `false` | — |
| `variant` | input | `'plain'` | `false` | — |
| `[hwStatValue]` | content | — | `false` | — |
| `[hwStatTrend]` | content | — | `false` | — |
| `*` | content | — | `false` | — |

يُطبَّق `HwStatComponent` على `hw-stat`، والعنصر المضيف هو الإحصائية نفسها. والمُدخل `label` مطلوب. ويُسقَط المحتوى الغني بالمحدِّد `[hwStatValue]` في القيمة، وبالمحدِّد `[hwStatTrend]` في التغيّر؛ ويُعرض بعد المُدخل النصي، فمرّر أحدهما فقط لكل منطقة. وتُعرض منطقتا القيمة والتغيّر دائمًا، وتخفي ورقة الأنماط التغيّر الفارغ. ويُضاف المحتوى الآخر بعد التغيّر.

## إمكانية الوصول

تعرض الإحصائية التسمية والقيمة والوصف والتغيّر عناصرَ عادية: عنصر `span`، وعنصر `strong`، وعنصر `p`، وعنصر `span`. ولا تضيف دورًا ولا منطقة حيّة، وليست تفاعلية.

- تأتي التسمية أولًا في الترميز، فيسمع مستخدم التقنيات المساعدة التسمية قبل القيمة. واكتب تسمية تسمّي الرقم وحدها، مثل «الطلبات المكتملة».
- اللون الدلالي للقيمة واللون الدلالي للتغيّر لونٌ فقط. فاذكر المعنى بالكلمات، في التسمية أو الوصف أو التغيّر، كما في «بزيادة 2 عن الأسبوع الماضي»، ولا تعتمد على اللون.
- عندما تتغيّر القيمة بعد تحميل الصفحة، لا تُعلن الإحصائية عن التغيير. فأعلنه برسالة حالة من التطبيق عندما يحتاج القارئ إلى معرفته.
- تحتاج القيمة التي فيها رمز عملة إلى اسم نصي للرمز. فضع الرمز في عنصر يحمل الخاصية `aria-hidden="true"`، وبجانبه اسم العملة مخفيًا عن العرض، كما تبيّن ملفات README للحزم: في الخاصية `value` في React، وفي المنفذ `value` في Vue، وفي المحتوى المُسقَط بالمحدِّد `[hwStatValue]` في Angular، ومباشرة في الترميز في JavaScript.

## الاتجاه والتوطين

ليس في الإحصائية نص مدمج، ولا تنسّق الأرقام: يكتب التطبيق التسمية والقيمة والوصف والتغيّر بلغة الصفحة. وتتبع الإحصائية اتجاه الصفحة عبر خصائص CSS المنطقية.

- نسّق القيمة في التطبيق بحسب إعداداته المحلية، ومن ذلك الأرقام وتجميع الخانات والوحدات، لأن الإحصائية تعرض القيمة كما تُمرَّر إليها. وتوفّر حزمة core الدالة `formatNumber` لهذا الغرض.
- ضع القيمة التي يجب أن تبقى بخط كتابة واحد، مثل المبلغ، داخل عنصر `bdi`، كما تفعل ملفات README للحزم مع المبلغ.
- اكتب التغيّر عبارة كاملة بلغة الصفحة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط الإحصائية بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تُدرج الإحصائية ضمن مكوّنات المحتوى الإضافية في نطاق المكوّنات في [ملاحظات التغطية](../coverage.md). ولا تسجّل الملاحظات ملاحظة مستقلة لها.
- تصف [ملاحظات الريال السعودي](../saudi-riyal.md) عرض المبلغ مع رمز الريال، وهو محتوى غني تقبله الإحصائية.
