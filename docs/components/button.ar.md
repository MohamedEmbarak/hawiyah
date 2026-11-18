---
source:
  summary: 421b7d9c72f6
  example: 9b7f6a99ca77
  variants-and-states: cc1cc8030691
  api: b7d77b3d1bc4
  accessibility: 3b2127b62ebd
  rtl-and-localisation: f0b6d337f83f
  platforms-code-reference: 0b4ce0fca1ec
---
# زر

يبدأ الزر إجراءً في الصفحة الحالية، مثل إرسال نموذج أو فتح نافذة حوار. ويعرض عنصر زر أصليًا بالأشكال المرئية لهوية وبثلاثة أحجام وحالة تحميل.

## مثال

تحتوي الصفحة على زر رئيسي واحد لإجرائها الرئيسي. ويسمّي النص الإجراء بفعل.

```html live example=primary
<button class="hw-button" type="button" data-variant="primary" data-size="md">متابعة</button>
```

```tsx live example=primary
<Button variant="primary">متابعة</Button>
```

```vue live example=primary
<Button variant="primary">متابعة</Button>
```

```ts live example=primary framework=angular
template: `<button hwButton variant="primary">متابعة</button>`
```

## الأشكال والحالات

### الأشكال

يحدّد الشكل الفئة المرئية للزر. يميّز الشكل الرئيسي الإجراء الرئيسي، ويميّز الشكلان الثانوي والمحدَّد الإجراءات المساندة، ويميّز الشكل الشفاف إجراءً منخفض الأهمية، ويميّز شكل الخطر إجراءً يحذف البيانات أو يتجاهلها.

```html live example=variants
<div class="hw-inline">
  <button class="hw-button" type="button" data-variant="primary" data-size="md">متابعة</button>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md">حفظ المسودة</button>
  <button class="hw-button" type="button" data-variant="outline" data-size="md">معاينة</button>
  <button class="hw-button" type="button" data-variant="ghost" data-size="md">إلغاء</button>
  <button class="hw-button" type="button" data-variant="danger" data-size="md">حذف</button>
</div>
```

```tsx live example=variants
<div className="hw-inline">
  <Button variant="primary">متابعة</Button>
  <Button variant="secondary">حفظ المسودة</Button>
  <Button variant="outline">معاينة</Button>
  <Button variant="ghost">إلغاء</Button>
  <Button variant="danger">حذف</Button>
</div>
```

```vue live example=variants
<div class="hw-inline">
  <Button variant="primary">متابعة</Button>
  <Button variant="secondary">حفظ المسودة</Button>
  <Button variant="outline">معاينة</Button>
  <Button variant="ghost">إلغاء</Button>
  <Button variant="danger">حذف</Button>
</div>
```

```ts live example=variants framework=angular
template: `<div class="hw-inline">
  <button hwButton variant="primary">متابعة</button>
  <button hwButton variant="secondary">حفظ المسودة</button>
  <button hwButton variant="outline">معاينة</button>
  <button hwButton variant="ghost">إلغاء</button>
  <button hwButton variant="danger">حذف</button>
</div>`
```

توفّر الحزم أيضًا الأشكال default وlight وoutline-white وsoft وlink. والشكلان light وoutline-white مخصّصان لسطح داكن.

### الأحجام

يحدّد الحجم ارتفاع الزر وحشوته. والحجم المتوسط هو الحجم الافتراضي.

```html live example=sizes
<div class="hw-inline">
  <button class="hw-button" type="button" data-variant="primary" data-size="sm">صغير</button>
  <button class="hw-button" type="button" data-variant="primary" data-size="md">متوسط</button>
  <button class="hw-button" type="button" data-variant="primary" data-size="lg">كبير</button>
</div>
```

```tsx live example=sizes
<div className="hw-inline">
  <Button size="sm">صغير</Button>
  <Button size="md">متوسط</Button>
  <Button size="lg">كبير</Button>
</div>
```

```vue live example=sizes
<div class="hw-inline">
  <Button size="sm">صغير</Button>
  <Button size="md">متوسط</Button>
  <Button size="lg">كبير</Button>
</div>
```

```ts live example=sizes framework=angular
template: `<div class="hw-inline">
  <button hwButton size="sm">صغير</button>
  <button hwButton size="md">متوسط</button>
  <button hwButton size="lg">كبير</button>
</div>`
```

### التحميل

يكون الزر في حالة التحميل معطّلًا تعطيلًا أصليًا ويحمل `aria-busy="true"`. ويحتفظ بنصه طوال تنفيذ العملية.

```html live example=loading
<button class="hw-button" type="button" data-variant="primary" data-size="md" disabled aria-busy="true">إرسال الطلب</button>
```

```tsx live example=loading
<Button loading>إرسال الطلب</Button>
```

```vue live example=loading
<Button loading>إرسال الطلب</Button>
```

```ts live example=loading framework=angular
template: `<button hwButton loading>إرسال الطلب</button>`
```

### التعطيل

يخرج الزر المعطّل من ترتيب التنقل بمفتاح Tab ولا يستجيب للتفعيل. اذكر سبب عدم إتاحة الإجراء في نص الصفحة.

```html live example=disabled
<button class="hw-button" type="button" data-variant="primary" data-size="md" disabled>متابعة</button>
```

```tsx live example=disabled
<Button disabled>متابعة</Button>
```

```vue live example=disabled
<Button disabled>متابعة</Button>
```

```ts live example=disabled framework=angular
template: `<button hwButton disabled>متابعة</button>`
```

## الواجهة البرمجية

### JavaScript

جدول: سمات عنصر hw-button

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-button'` | `true` | — |
| `type` | `'button' \| 'submit' \| 'reset'` | `true` | — |
| `data-variant` | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'primary'` |
| `data-size` | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `data-icon-only` | `boolean` | `false` | `false` |
| `disabled` | `boolean` | `false` | `false` |
| `aria-busy` | `'true'` | `false` | — |

ليس للزر وحدة تحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر زر أصليًا بالصنف `hw-button`، واكتب دائمًا سمة `type` له، لأن النوع الافتراضي للزر داخل النموذج في المتصفح هو `submit`. ولحالة التحميل اكتب `disabled` و`aria-busy="true"` معًا، واحذفهما عند انتهاء العملية. وتُدرج السمة `data-icon-only` مع `hw-button` و`data-variant` و`data-size` في صف الإجراءات من جدول واجهة الأصناف والحالات الثابتة في `@hawiyah/styles`، وتُكتب بلا قيمة.

### React

جدول: خصائص Button

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'primary'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `loading` | `boolean` | `false` | — |

يقبل Button أيضًا خصائص عنصر الزر الأصلي، ومنها `type` و`disabled` و`onClick` و`ref`. ويكون النوع `button` ما لم يُحدَّد نوع آخر. وتعطّل حالة التحميل الزر وتضبط `aria-busy`.

### Vue

جدول: خصائص Button وأحداثه ومنافذه

| الاسم | الصنف | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `variant` | prop | `ButtonVariant` | `false` | `'primary'` |
| `size` | prop | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `loading` | prop | `boolean` | `false` | `false` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `type` | prop | `'button' \| 'submit' \| 'reset'` | `false` | `'button'` |

يحمل المنفذ الافتراضي نص الزر. وتصل السمات والمستمعات الأخرى، مثل `@click`، إلى عنصر الزر الأصلي. ويتيح المكوّن `element` و`focus()` عبر مرجع القالب.

### Angular

جدول: مدخلات button[hwButton] ومخرجاته ومحتواه

| الاسم | الصنف | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `variant` | input | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'primary'` |
| `size` | input | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `loading` | input | `boolean` | `false` | `false` |
| `disabled` | input | `boolean` | `false` | `false` |
| `type` | input | `string \| null` | `false` | `null` |

يُطبَّق `HwButtonDirective` على `button[hwButton]` و`a[hwButton]`. ويكون الزر الأصلي من النوع `type="button"` ما لم يُكتب نوع آخر. وتُكتب المدخلات `type` و`disabled` و`loading` قيمًا ثابتة أو مربوطة، مثل `[loading]="saving"`؛ ولا يُدعم ربط `[attr.type]` أو `[attr.disabled]` أو `[attr.aria-busy]` على العنصر. وعلى الرابط لا يكتب التوجيه نوعًا ولا سمة تعطيل.

## إمكانية الوصول

الزر عنصر زر أصلي، فيوفّر المتصفح دوره وسلوك التركيز عليه وتفعيله من لوحة المفاتيح. واسمه الميسّر هو نصه الظاهر.

جدول: التفاعل مع الزر من لوحة المفاتيح

| المفتاح | الإجراء |
| --- | --- |
| Tab | ينقل التركيز إلى الزر، ما لم يكن معطّلًا أو في حالة تحميل. |
| Enter | يفعّل الزر. |
| Space | يفعّل الزر. |

- يظهر مؤشر التركيز عند التركيز بلوحة المفاتيح، ويبقى ظاهرًا أثناء الضغط على مفتاح المسافة.
- يخرج الزر المعطّل أو الذي في حالة تحميل من ترتيب التنقل. وبعد انتهاء حالة التحميل أعد التركيز إلى الزر أو إلى نتيجة العملية.
- يحتاج الزر الذي يعرض أيقونة فقط إلى اسم ميسّر؛ استخدم زر الأيقونة لهذه الحالة.
- استخدم رابطًا، لا زرًا، للانتقال إلى صفحة أخرى.

> [!NOTE]
> لا يبلغ الشكلان light وoutline-white تباينًا مقروءًا إلا على سطح داكن، ولا يحلّان محلّ الشكل الرئيسي في صفحة فاتحة.

## الاتجاه والتوطين

ليس في الزر نص مدمج: يكتب التطبيق كل نص بلغة الصفحة. ويرث العنصر لغة الصفحة واتجاهها، وتستخدم الأنماط المضمّنة في الحزم الخصائص المنطقية، فيتبع النص وأي أيقونة اتجاه القراءة.

- اجعل كل نص قصيرًا؛ فالزر يتّسع مع نصه وينتقل إلى سطر جديد داخل الحاوية الضيقة.
- يستخدم النص العربي والإنجليزي الشكل والحجم نفسيهما، ولا يغيّر أي محوّل مظهر الزر بحسب اللغة.

## مرجع كود المنصات

بُنيت هوية لتتوافق مع كود المنصات الصادر عن هيئة الحكومة الرقمية. وهي ليست منتجًا رسميًا للهيئة ولا تحمل أي شهادة. يسرد هذا القسم الأدلة المسجّلة للزر والبنود التي ما زالت مفتوحة.

### الأدلة

- رُبطت الفئات المرئية السبع في ورقة أنماط كود المنصات المزوّدة بالأشكال `primary` و`default` و`secondary` و`outline` و`outline-white` و`light` و`danger`، كما هو مسجّل في [ملاحظات الأزرار](../nic-buttons.md).
- الزر مبني في محوّلات vanilla وReact وVue وAngular، كما هو مدرج في [components.json](../../components.json).
- يغطي اختبار سلوك لمحوّل React تفعيل الزر وإعادة التركيز إليه، وقد نجح في 2026-10-28.

### البنود المفتوحة

- محوّل React وحده مسجّل بوصفه متحقَّقًا منه في `components.json`، وليس لمحوّلات vanilla وVue وAngular أي تحقق مسجّل.
- لا يُدّعى أن الارتفاعات المعروضة للحجمين الصغير والكبير تطابق أحجام المصدر تمامًا.
- يستخدم شكل الخطر نصًا أبيض بدلًا من النص الأحمر في المصدر لتحقيق تباين مقروء، وهذا التكييف موثّق في ملاحظات الأزرار.
