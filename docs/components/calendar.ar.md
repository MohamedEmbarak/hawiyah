---
source:
  summary: 98d2af258879
  example: d4421bd66d8d
  variants-and-states: 874a785479d3
  api: 33a8f9649456
  accessibility: 3d3f17af64e2
  rtl-and-localisation: 8a4c932e18cc
  platforms-code-reference: 522fca55d237
---
# تقويم

التقويم شبكة تواريخ يُتنقَّل فيها بلوحة المفاتيح لاختيار يوم واحد من الشهر. ويحمل تاريخًا ميلاديًا بصيغة ISO، ويعرضه بالتقويم الميلادي أو بتقويم أم القرى المستند إلى جدول مرجعي.

## مثال

للتقويم اسم يبيّن التاريخ الذي يختاره القارئ، وأسماء لزرّي الشهر السابق والشهر التالي. والإعدادات المحلية `locale` مطلوبة: فأسماء الأشهر وأيام الأسبوع مأخوذة من Intl بحسب هذه الإعدادات المحلية، ولا يوفّر المكوّن أي نص من عنده. ويكتب ترميز vanilla أيضًا تسمية النطاق، لأن `createCalendar` تتطلّب `rangeLabel` في كل تقويم، بينما لا تحتاج إليها مكوّنات React وVue وAngular إلا مع `calendar="islamic-umalqura"`. ويُفتح المثال على شهر ثابت، فلا يعتمد على تاريخ اليوم.

```html live example=basic static differences=calendar-adapter-markup,calendar-adapter-tree,calendar-vanilla-height
<div class="hw-calendar" data-hw="calendar" data-hw-locale="ar" aria-label="تاريخ الموعد" data-hw-previous-label="الشهر السابق" data-hw-next-label="الشهر التالي" data-hw-range-label="النطاق المدعوم" data-hw-value="2026-03-12"></div>
```

```tsx live example=basic
<Calendar locale="ar" label="تاريخ الموعد" previousLabel="الشهر السابق" nextLabel="الشهر التالي" defaultValue="2026-03-12" />
```

```vue live example=basic
<Calendar locale="ar" label="تاريخ الموعد" previous-label="الشهر السابق" next-label="الشهر التالي" default-value="2026-03-12" />
```

```ts live example=basic framework=angular
template: `<hw-calendar locale="ar" label="تاريخ الموعد" previousLabel="الشهر السابق" nextLabel="الشهر التالي" value="2026-03-12" />`
```

## الأشكال والحالات

### الحدود

قيمتا `min` و`max` تاريخان ميلاديان بصيغة ISO. ولا يمكن تحديد يوم خارجهما ولا نقل التركيز إليه، ولا يُعطَّل زر الشهر إلا عندما يقع الشهر المجاور كله خارج الحدود.

```html live example=bounds static differences=calendar-adapter-markup,calendar-adapter-tree,calendar-vanilla-height
<div class="hw-calendar" data-hw="calendar" data-hw-locale="ar" aria-label="تاريخ الاستلام" data-hw-previous-label="الشهر السابق" data-hw-next-label="الشهر التالي" data-hw-range-label="النطاق المدعوم" data-hw-value="2026-03-12" data-hw-min="2026-03-05" data-hw-max="2026-03-25"></div>
```

```tsx live example=bounds
<Calendar locale="ar" label="تاريخ الاستلام" previousLabel="الشهر السابق" nextLabel="الشهر التالي" defaultValue="2026-03-12" min="2026-03-05" max="2026-03-25" />
```

```vue live example=bounds
<Calendar locale="ar" label="تاريخ الاستلام" previous-label="الشهر السابق" next-label="الشهر التالي" default-value="2026-03-12" min="2026-03-05" max="2026-03-25" />
```

```ts live example=bounds framework=angular
template: `<hw-calendar locale="ar" label="تاريخ الاستلام" previousLabel="الشهر السابق" nextLabel="الشهر التالي" value="2026-03-12" min="2026-03-05" max="2026-03-25" />`
```

### بداية الأسبوع

قيمة `weekStartsOn` رقم يبدأ من 0 ليوم الأحد؛ ويبدأ الأسبوع في المثال الآتي بيوم السبت.

```html live example=week-start static differences=calendar-adapter-markup,calendar-adapter-tree,calendar-vanilla-height
<div class="hw-calendar" data-hw="calendar" data-hw-locale="ar" aria-label="تاريخ الزيارة" data-hw-previous-label="الشهر السابق" data-hw-next-label="الشهر التالي" data-hw-range-label="النطاق المدعوم" data-hw-value="2026-03-12" data-hw-week-starts-on="6"></div>
```

```tsx live example=week-start
<Calendar locale="ar" label="تاريخ الزيارة" previousLabel="الشهر السابق" nextLabel="الشهر التالي" defaultValue="2026-03-12" weekStartsOn={6} />
```

```vue live example=week-start
<Calendar locale="ar" label="تاريخ الزيارة" previous-label="الشهر السابق" next-label="الشهر التالي" default-value="2026-03-12" :week-starts-on="6" />
```

```ts live example=week-start framework=angular
template: `<hw-calendar locale="ar" label="تاريخ الزيارة" previousLabel="الشهر السابق" nextLabel="الشهر التالي" value="2026-03-12" [weekStartsOn]="6" />`
```

### أم القرى

عند ضبط `calendar` على `islamic-umalqura` تعرض الشبكة أشهر تقويم أم القرى وأيامه، وتبقى القيمة تاريخًا ميلاديًا بصيغة ISO. وتسمّي `rangeLabel` المعلومات الخاصة بالنطاق المدعوم، وتُعلَن `unsupportedMessage` عندما تقع القيمة خارج هذا النطاق.

```html live example=umalqura static differences=calendar-adapter-markup,calendar-adapter-tree,calendar-vanilla-height
<div class="hw-calendar" data-hw="calendar" data-hw-locale="ar" data-hw-calendar="islamic-umalqura" aria-label="تاريخ الموعد" data-hw-previous-label="الشهر السابق" data-hw-next-label="الشهر التالي" data-hw-range-label="النطاق المدعوم" data-hw-unsupported-message="هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى." data-hw-value="2026-03-12"></div>
```

```tsx live example=umalqura
<Calendar locale="ar" calendar="islamic-umalqura" label="تاريخ الموعد" previousLabel="الشهر السابق" nextLabel="الشهر التالي" rangeLabel="النطاق المدعوم" unsupportedMessage="هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى." defaultValue="2026-03-12" />
```

```vue live example=umalqura
<Calendar locale="ar" calendar="islamic-umalqura" label="تاريخ الموعد" previous-label="الشهر السابق" next-label="الشهر التالي" range-label="النطاق المدعوم" unsupported-message="هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى." default-value="2026-03-12" />
```

```ts live example=umalqura framework=angular
template: `<hw-calendar locale="ar" calendar="islamic-umalqura" label="تاريخ الموعد" previousLabel="الشهر السابق" nextLabel="الشهر التالي" rangeLabel="النطاق المدعوم" unsupportedMessage="هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى." value="2026-03-12" />`
```

### للقراءة فقط

يتيح التقويم المخصّص للقراءة فقط التنقل بين الأشهر، ولا يغيّر القيمة المحدَّدة.

```html live example=readonly static differences=calendar-adapter-markup,calendar-adapter-tree,calendar-vanilla-height
<div class="hw-calendar" data-hw="calendar" data-hw-locale="ar" aria-label="تاريخ التقديم" data-hw-previous-label="الشهر السابق" data-hw-next-label="الشهر التالي" data-hw-range-label="النطاق المدعوم" data-hw-value="2026-03-12" data-hw-readonly="true"></div>
```

```tsx live example=readonly
<Calendar locale="ar" label="تاريخ التقديم" previousLabel="الشهر السابق" nextLabel="الشهر التالي" defaultValue="2026-03-12" readOnly />
```

```vue live example=readonly
<Calendar locale="ar" label="تاريخ التقديم" previous-label="الشهر السابق" next-label="الشهر التالي" default-value="2026-03-12" readonly />
```

```ts live example=readonly framework=angular
template: `<hw-calendar locale="ar" label="تاريخ التقديم" previousLabel="الشهر السابق" nextLabel="الشهر التالي" value="2026-03-12" [readOnly]="true" />`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createCalendar

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `getDayLabel` | `(value: string) => string` | `false` | — |
| `value` | `string` | `false` | — |
| `month` | `string` | `false` | — |
| `min` | `string` | `false` | — |
| `max` | `string` | `false` | — |
| `locale` | `string` | `false` | — |
| `calendar` | `'gregory' \| 'islamic-umalqura'` | `false` | — |
| `weekStartsOn` | `number` | `false` | — |
| `disabled` | `boolean` | `false` | — |
| `readOnly` | `boolean` | `false` | — |
| `name` | `string` | `false` | — |
| `isDateDisabled` | `(value: string) => boolean` | `false` | — |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `onSelect` | `(value: string) => void` | `false` | — |
| `onCalendarChange` | `(calendar: 'gregory' \| 'islamic-umalqura') => void` | `false` | — |
| `label` | `string` | `false` | — |
| `previousLabel` | `string` | `false` | — |
| `nextLabel` | `string` | `false` | — |
| `unsupportedMessage` | `string` | `false` | — |
| `rangeLabel` | `string` | `false` | — |

تملأ `createCalendar(root, options)` العنصر `root` بشريط أدوات وصفّ لأيام الأسبوع وشبكة للأيام، وتُرجع متحكمًا فيه `value` و`calendar` و`select` و`setValue` و`setMonth` و`setCalendar` و`destroy`. ويقرأ الجذر أيضًا هذه الخيارات خصائصَ: `locale` و`value` و`month` و`min` و`max` و`calendar` و`weekStartsOn` و`name` و`disabled`، والنصوص الخمسة `label` و`previousLabel` و`nextLabel` و`rangeLabel` و`unsupportedMessage`، كلٌّ منها بالصيغة `data-hw-<name>` بأحرف صغيرة تفصل بين كلماتها شرطات، كما تفعل الأمثلة؛ وتُكتب `readOnly` بالصيغة `data-hw-readonly="true"`. ولا تُقرأ `getDayLabel` و`isDateDisabled` و`onValueChange` و`onSelect` و`onCalendarChange` إلا من الخيارات. وتتيح الخاصية `data-hw="calendar"` للدالة `enhance()` من حزمة vanilla إنشاء المتحكم؛ ويتقدّم الخيار الممرَّر إلى الدالة المُنشئة على الخاصية. ولا تنشر الخيارات قيمًا افتراضية في الإصدار 0.3.0: فدون `calendar` يكون العرض ميلاديًا، ودون `weekStartsOn` يبدأ الأسبوع بيوم الأحد. والخيار `locale` مطلوب لأي عرض، لأن المتحكم لا يعرض شيئًا مما ينتجه Intl ما دام فارغًا، والخيارات `label` و`previousLabel` و`nextLabel` نصوص يكتبها التطبيق وليست لها قيمة افتراضية؛ والخيار `rangeLabel` مطلوب في كل تقويم، والخيار `unsupportedMessage` لازم ما دامت قيمة `calendar` هي `islamic-umalqura`. وتُستدعى `onValueChange` عندما تتغيّر القيمة، و`onSelect` عندما يحدّد القارئ يومًا، و`onCalendarChange` عندما تغيّر `setCalendar` تقويم العرض. وترفض `isDateDisabled` يومًا، واليوم المرفوض زر معطَّل. وليس في التقويم المستقل عنصر للتبديل بين التقويمين، فاستدعِ `setCalendar` من عنصر تحكم في تطبيقك. وعند ضبط `name` يُرسَل التاريخ المحدَّد عبر عنصر إدخال مخفي، وتعيد إعادة التعيين الأصلية للنموذج القيمةَ التي كتبها المطوّر.

### React

جدول: خصائص Calendar

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `value` | `string` | `false` | — |
| `defaultValue` | `string` | `false` | `''` |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `month` | `string` | `false` | — |
| `defaultMonth` | `string` | `false` | — |
| `onMonthChange` | `(month: string) => void` | `false` | — |
| `min` | `string` | `false` | — |
| `max` | `string` | `false` | — |
| `locale` | `string` | `true` | — |
| `weekStartsOn` | `number` | `false` | `0` |
| `isDateDisabled` | `(value: string) => boolean` | `false` | — |
| `disabled` | `boolean` | `false` | — |
| `readOnly` | `boolean` | `false` | — |
| `previousLabel` | `string` | `true` | — |
| `nextLabel` | `string` | `true` | — |
| `getDayLabel` | `(value: string) => string` | `false` | — |
| `name` | `string` | `false` | — |
| `form` | `string` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |
| `calendar` | `'gregory' \| 'islamic-umalqura'` | `false` | `'gregory'` |
| `rangeLabel` | `string` | `false` | — |
| `unsupportedMessage` | `string` | `false` | — |

يحمل Calendar تاريخًا ميلاديًا في سلسلة نصية بصيغة ISO. مرّر `value` مع `onValueChange` لتقويم متحكَّم فيه، أو `defaultValue` لتقويم غير متحكَّم فيه، تبدأ قيمته بسلسلة نصية فارغة؛ وتؤدي `month` مع `onMonthChange`، و`defaultMonth`، الدور نفسه للشهر المعروض. والخصائص `locale` و`previousLabel` و`nextLabel` مطلوبة، وتسمّي `label` أو `aria-label` أو `aria-labelledby` العنصر الجذر، وهو منطقة `section`؛ ويسمّي عنوانُ الشهر الشبكةَ. والخاصيتان `rangeLabel` و`unsupportedMessage` لازمتان عندما تكون قيمة `calendar` هي `islamic-umalqura`؛ وتُعلَن `unsupportedMessage` في فقرة حالة بعد الشبكة ما دام عرض القيمة غير ممكن. والقيمة الافتراضية لـ`weekStartsOn` هي `0`، ولـ`calendar` هي `'gregory'`. وتتلقّى `isDateDisabled` و`getDayLabel` تاريخًا بصيغة ISO؛ فترفض الأولى يومًا، وتستبدل الثانية اسم اليوم الذي ينتجه Intl. وترسل `name` و`form` التاريخ المحدَّد عبر عنصر إدخال مخفي. وليس لـ`disabled` و`readOnly` قيمة افتراضية، وهما غير مفعّلتين عند غيابهما.

### Vue

جدول: خصائص Calendar وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `modelValue` | prop | `string` | `false` | — |
| `defaultValue` | prop | `string` | `false` | `''` |
| `month` | prop | `string` | `false` | — |
| `min` | prop | `string` | `false` | — |
| `max` | prop | `string` | `false` | — |
| `locale` | prop | `string` | `true` | — |
| `calendar` | prop | `'gregory' \| 'islamic-umalqura'` | `false` | `'gregory'` |
| `weekStartsOn` | prop | `number` | `false` | `0` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `label` | prop | `string` | `false` | — |
| `previousLabel` | prop | `string` | `true` | — |
| `nextLabel` | prop | `string` | `true` | — |
| `unsupportedMessage` | prop | `string` | `false` | — |
| `rangeLabel` | prop | `string` | `false` | — |
| `getDayLabel` | prop | `(value: string) => string` | `false` | — |
| `isDateDisabled` | prop | `(value: string) => boolean` | `false` | — |
| `update:modelValue` | event | `(value: string) => void` | `false` | — |
| `update:month` | event | `(value: string) => void` | `false` | — |

يربط `v-model` السلسلة النصية بصيغة ISO، وتضبط الخاصية `defaultValue` القيمة الأولية لتقويم غير متحكَّم فيه؛ ويُرسل المكوّن الحدث `update:month` عندما ينتقل القارئ إلى شهر آخر، وتضبط الخاصية `month` الشهر المعروض. والخصائص `locale` و`previousLabel` و`nextLabel` مطلوبة؛ وتسمّي الخاصية `label` الشبكة، أو اكتب `aria-label` أو `aria-labelledby`. والخاصيتان `rangeLabel` و`unsupportedMessage` لازمتان عندما تكون قيمة `calendar` هي `islamic-umalqura`. والقيمة الافتراضية لـ`calendar` هي `'gregory'`، ولـ`weekStartsOn` هي `0`، ولـ`disabled` و`readonly` هي `false`. وتأخذ `isDateDisabled` و`getDayLabel` تاريخًا بصيغة ISO: فاليوم المرفوض زر معطَّل، واسم اليوم يحلّ محلّ الاسم الذي ينتجه Intl. ولا يسرد الجدول أي منفذ، لأن الإصدار المنشور لا يقرأ أي منفذ.

### Angular

جدول: مُدخلات hw-calendar ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `controlId` | input | `string \| null \| undefined` | `false` | — |
| `label` | input | `string` | `false` | `''` |
| `name` | input | `string` | `false` | `''` |
| `hint` | input | `string` | `false` | `''` |
| `error` | input | `string` | `false` | `''` |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `aria-invalid` | input | `boolean` | `false` | `false` |
| `form` | input | `string \| null` | `false` | `null` |
| `required` | input | `boolean` | `false` | — |
| `disabled` | input | `boolean` | `false` | `false` |
| `value` | input | `string` | `false` | `''` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `locale` | input | `string` | `true` | — |
| `previousLabel` | input | `string` | `true` | — |
| `nextLabel` | input | `string` | `true` | — |
| `rangeLabel` | input | `string` | `false` | `''` |
| `rangeTooltipId` | input | `string` | `false` | `''` |
| `getDayLabel` | input | `(value: string) => string` | `false` | — |
| `isDateDisabled` | input | `(value: string) => boolean` | `false` | — |
| `unsupportedMessage` | input | `string` | `false` | `''` |
| `month` | input | `string` | `false` | `''` |
| `min` | input | `string` | `false` | `''` |
| `max` | input | `string` | `false` | `''` |
| `calendar` | input | `'gregory' \| 'islamic-umalqura'` | `false` | `'gregory'` |
| `weekStartsOn` | input | `number` | `false` | `0` |
| `direction` | input | `'ltr' \| 'rtl'` | `false` | — |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `monthChange` | output | `string` | `false` | — |

يربط `HwCalendarComponent` (`hw-calendar`) القيمة `[(value)]` ربطًا ثنائي الاتجاه بالسلسلة النصية بصيغة ISO، ويُرسل المُخرج `monthChange` عندما ينتقل القارئ بين الأشهر. ويعمل المكوّن أيضًا عنصرَ تحكم في النموذج عبر موصّل القيمة الخاص به. والمُدخلات `locale` و`previousLabel` و`nextLabel` مطلوبة، ويسمّي المُدخل `label` الشبكة ما لم تسمّها `aria-label` أو `aria-labelledby` أو عنصر `hw-field` يحيط بالتقويم؛ وتُمرَّر هذه الخصائص إلى الشبكة. وما دام `locale` فارغًا لا يُعرض شريط الأدوات ولا الشبكة. والمُدخلان `rangeLabel` و`unsupportedMessage` مطلوبان مع `calendar="islamic-umalqura"`؛ ويضبط `rangeTooltipId` معرّف التلميح الذي يصف معلومات النطاق. ويضبط `direction` اتجاه التقويم كله، ويكتبه في الخاصية `dir` على الجذر، ويتقدّم على اتجاه الصفحة، في مفاتيح الأسهم أيضًا. وتُستدعى `isDateDisabled` في أثناء العرض، فيجب أن تكون دالة خالصة. والقيمة الافتراضية لـ`calendar` هي `'gregory'`، ولـ`weekStartsOn` هي `0`.

## إمكانية الوصول

الشبكة عنصر `table` أصلي بالدور grid، وكل يوم زر أصلي، فيحدّده المفتاحان Enter وSpace. ويستقر التركيز على يوم واحد من الشبكة في كل مرة (التركيز المتنقل: موضع واحد في ترتيب التنقل بالمفتاح Tab)، والأيام التي ترفضها `isDateDisabled`، والأيام الواقعة خارج `min` و`max`، أزرار معطَّلة تتخطاها مفاتيح الأسهم. وفي التقويم الفارغ يكون هذا الموضع على تاريخ اليوم عندما يكون معروضًا ومتاحًا. ويتيح التقويم المخصّص للقراءة فقط التنقل، ولا يغيّر القيمة. وتسمّي Vue وAngular الشبكة بقيمة `label`؛ وتسمّيها vanilla وReact بعنوان الشهر، وتضعان `label` على جذر التقويم.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: تقويم

| المفتاح | الإجراء |
| --- | --- |
| <kbd>السهم الأيسر</kbd>، <kbd>السهم الأيمن</kbd> | ينقل التركيز إلى اليوم المجاور في جهة السهم، ففي صفحة من اليمين إلى اليسار ينقل السهم الأيمن التركيز إلى اليوم السابق. |
| <kbd>السهم السفلي</kbd>، <kbd>السهم العلوي</kbd> | ينقل التركيز إلى اليوم نفسه من الأسبوع التالي أو السابق. |
| <kbd>Home</kbd>، <kbd>End</kbd> | ينقل التركيز إلى أول يوم في الأسبوع أو آخر يوم فيه. |
| <kbd>Page Down</kbd>، <kbd>Page Up</kbd> | ينقل التركيز إلى الشهر التالي أو السابق. |
| <kbd>Shift</kbd> + <kbd>Page Down</kbd>، <kbd>Shift</kbd> + <kbd>Page Up</kbd> | ينقل التركيز إلى السنة التالية أو السابقة. |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | يحدّد اليوم الذي عليه التركيز. |

عندما لا يستطيع تقويم أم القرى عرض القيمة، تحمل فقرة الحالة التي بعد الشبكة قيمة `unsupportedMessage`. ومعلومات النطاق المدعوم عنصر واحد قابل للتركيز تسمّيه `rangeLabel`. ويتوقف التنقل عند حدود `min` و`max` وجدول أم القرى.

## الاتجاه والتوطين

القيم والحدود تواريخ ميلادية بصيغة ISO في كل لغة وفي كل تقويم. وتقويم العرض والإعدادات المحلية والاتجاه مستقلة بعضها عن بعض: فلا تضبط `locale` إلا طريقة كتابة Intl لأسماء الأشهر وأيام الأسبوع والأيام، ولا تختار الاتجاه، الذي يأخذه التقويم من الصفحة، أو من `direction` في Angular. وفي صفحة من اليمين إلى اليسار تتبع مفاتيح الأسهم الأفقية وزرّا الشهر الاتجاه المرئي. وليس في المكوّن نص مدمج، فتُكتب التسمية واسما زرّي الشهر وتسمية النطاق ورسالة التاريخ غير المدعوم بلغة الصفحة.

تأتي حسابات تقويم أم القرى والتسميات الرقمية للأيام من جدول مرجعي مثبَّت، لا من التحويل الذي يجريه المتصفح، وتغطي المدة من 1924-08-01 إلى 2077-11-16 (من 1343 إلى 1500 هـ). ويبقى التاريخ الميلادي الواقع خارج هذا النطاق قيمةً للتقويم، ويُعلن التقويم `unsupportedMessage`؛ ولا يلجأ التقويم إلى أي بديل يغيّر معنى التاريخ.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط التقويم بكود المنصات. وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تصف [ملاحظة موثوقية التقويم](../date-calendars.md) قيمة التاريخ، والنطاق المدعوم لجدول أم القرى، وحدود البيانات المرجعية.
- يصف القسم الخاص بالتقاويم وقيم التواريخ في [ملاحظات التغطية](../coverage.md) التقاويم وقيم التواريخ التي تدعمها هوية.
