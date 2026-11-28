---
source:
  summary: 976f363b7ef1
  example: 4b1034457cfb
  variants-and-states: 27f4521b8490
  api: 5c8001522842
  accessibility: 98fd8653be5d
  rtl-and-localisation: bc7bfb9a0713
  platforms-code-reference: b2f53046dce2
---
# اختيار تاريخ

اختيار التاريخ حقل للتاريخ وحده: عنصر إدخال نصي لتاريخ ميلادي بصيغة ISO، وزر مشغِّل يفتح تقويمًا مسمّى في مربع حوار أصلي مشروط. والقيمة دائمًا تاريخ بصيغة ISO على الشكل YYYY-MM-DD، أيًّا كان التقويم الذي يعرضه مربع الحوار.

## مثال

لحقل التاريخ تسمية ظاهرة ونص إرشادي يذكر الصيغة. ويوفّر التطبيق اسم كل عنصر تحكم وكل رسالة، والخاصية `locale` مطلوبة لأن أسماء الأشهر وأيام الأسبوع تأتي من Intl لتلك الإعدادات المحلية. ويحمل المثال قيمة ثابتة كي لا يعتمد على تاريخ اليوم.

```html live example=basic static differences=date-picker-adapter-markup,date-picker-value-order,date-picker-adapter-height
<div class="hw-date-picker" data-hw="date-picker" data-hw-locale="ar" data-hw-previous-label="الشهر السابق" data-hw-next-label="الشهر التالي" data-hw-calendar-system-label="نظام التقويم" data-hw-gregorian-label="ميلادي" data-hw-hijri-label="هجري (أم القرى)" data-hw-range-label="النطاق المدعوم" data-hw-invalid-message="أدخل التاريخ بالصيغة YYYY-MM-DD." data-hw-unsupported-message="يقع هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى.">
  <label class="hw-label" for="basic">تاريخ الموعد</label>
  <div class="hw-date-picker-control"><input class="hw-input" id="basic" type="text" placeholder="سنة-شهر-يوم" data-hw-date-input name="basic" value="2026-03-12" aria-describedby="basic-hint">
  <button type="button" data-hw-date-trigger aria-label="فتح التقويم">التقويم</button></div>
  <p class="hw-hint" id="basic-hint">استخدم الصيغة YYYY-MM-DD.</p>
  <dialog class="hw-dialog" data-hw-date-dialog aria-label="اختر تاريخ الموعد">
    <header class="hw-dialog-header"><h2>اختر تاريخ الموعد</h2><button class="hw-button" data-variant="ghost" type="button" data-hw-date-close>إغلاق</button></header>
    <div class="hw-dialog-body"><div class="hw-calendar" data-hw-date-calendar></div></div>
  </dialog>
</div>
```

```tsx live example=basic
<DatePicker locale="ar" label="تاريخ الموعد" hint="استخدم الصيغة YYYY-MM-DD." placeholder="سنة-شهر-يوم" calendarLabel="اختر تاريخ الموعد" openLabel="فتح التقويم" closeLabel="إغلاق" previousLabel="الشهر السابق" nextLabel="الشهر التالي" calendarSystemLabel="نظام التقويم" gregorianLabel="ميلادي" hijriLabel="هجري (أم القرى)" rangeLabel="النطاق المدعوم" invalidMessage="أدخل التاريخ بالصيغة YYYY-MM-DD." unsupportedMessage="يقع هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى." defaultValue="2026-03-12" />
```

```vue live example=basic
<DatePicker locale="ar" label="تاريخ الموعد" hint="استخدم الصيغة YYYY-MM-DD." placeholder="سنة-شهر-يوم" calendar-label="اختر تاريخ الموعد" open-label="فتح التقويم" close-label="إغلاق" previous-label="الشهر السابق" next-label="الشهر التالي" calendar-system-label="نظام التقويم" gregorian-label="ميلادي" hijri-label="هجري (أم القرى)" range-label="النطاق المدعوم" invalid-message="أدخل التاريخ بالصيغة YYYY-MM-DD." unsupported-message="يقع هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى." default-value="2026-03-12" />
```

```ts live example=basic framework=angular
template: `<hw-date-picker locale="ar" label="تاريخ الموعد" hint="استخدم الصيغة YYYY-MM-DD." placeholder="سنة-شهر-يوم" calendarLabel="اختر تاريخ الموعد" openLabel="فتح التقويم" closeLabel="إغلاق" previousLabel="الشهر السابق" nextLabel="الشهر التالي" calendarSystemLabel="نظام التقويم" gregorianLabel="ميلادي" hijriLabel="هجري (أم القرى)" rangeLabel="النطاق المدعوم" invalidMessage="أدخل التاريخ بالصيغة YYYY-MM-DD." unsupportedMessage="يقع هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى." value="2026-03-12" />`
```

## الأشكال والحالات

### أم القرى

عند ضبط `calendar` على `islamic-umalqura` يعرض مربع الحوار أشهر تقويم أم القرى وأيامه، وتحدّد أداة التبديل فيه الخيار الهجري. وتبقى القيمة المُرسَلة التاريخ الميلادي بصيغة ISO.

```html live example=umalqura static differences=date-picker-adapter-markup,date-picker-value-order,date-picker-adapter-height
<div class="hw-date-picker" data-hw="date-picker" data-hw-locale="ar" data-hw-previous-label="الشهر السابق" data-hw-next-label="الشهر التالي" data-hw-calendar-system-label="نظام التقويم" data-hw-gregorian-label="ميلادي" data-hw-hijri-label="هجري (أم القرى)" data-hw-range-label="النطاق المدعوم" data-hw-invalid-message="أدخل التاريخ بالصيغة YYYY-MM-DD." data-hw-unsupported-message="يقع هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى." data-hw-calendar="islamic-umalqura">
  <label class="hw-label" for="umalqura">تاريخ الاستلام</label>
  <div class="hw-date-picker-control"><input class="hw-input" id="umalqura" type="text" placeholder="سنة-شهر-يوم" data-hw-date-input name="umalqura" value="2026-03-12" aria-describedby="umalqura-hint">
  <button type="button" data-hw-date-trigger aria-label="فتح التقويم">التقويم</button></div>
  <p class="hw-hint" id="umalqura-hint">استخدم الصيغة YYYY-MM-DD.</p>
  <dialog class="hw-dialog" data-hw-date-dialog aria-label="اختر تاريخ الموعد">
    <header class="hw-dialog-header"><h2>اختر تاريخ الموعد</h2><button class="hw-button" data-variant="ghost" type="button" data-hw-date-close>إغلاق</button></header>
    <div class="hw-dialog-body"><div class="hw-calendar" data-hw-date-calendar></div></div>
  </dialog>
</div>
```

```tsx live example=umalqura
<DatePicker locale="ar" label="تاريخ الاستلام" hint="استخدم الصيغة YYYY-MM-DD." placeholder="سنة-شهر-يوم" calendarLabel="اختر تاريخ الموعد" openLabel="فتح التقويم" closeLabel="إغلاق" previousLabel="الشهر السابق" nextLabel="الشهر التالي" calendarSystemLabel="نظام التقويم" gregorianLabel="ميلادي" hijriLabel="هجري (أم القرى)" rangeLabel="النطاق المدعوم" invalidMessage="أدخل التاريخ بالصيغة YYYY-MM-DD." unsupportedMessage="يقع هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى." defaultValue="2026-03-12" calendar="islamic-umalqura" />
```

```vue live example=umalqura
<DatePicker locale="ar" label="تاريخ الاستلام" hint="استخدم الصيغة YYYY-MM-DD." placeholder="سنة-شهر-يوم" calendar-label="اختر تاريخ الموعد" open-label="فتح التقويم" close-label="إغلاق" previous-label="الشهر السابق" next-label="الشهر التالي" calendar-system-label="نظام التقويم" gregorian-label="ميلادي" hijri-label="هجري (أم القرى)" range-label="النطاق المدعوم" invalid-message="أدخل التاريخ بالصيغة YYYY-MM-DD." unsupported-message="يقع هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى." default-value="2026-03-12" calendar="islamic-umalqura" />
```

```ts live example=umalqura framework=angular
template: `<hw-date-picker locale="ar" label="تاريخ الاستلام" hint="استخدم الصيغة YYYY-MM-DD." placeholder="سنة-شهر-يوم" calendarLabel="اختر تاريخ الموعد" openLabel="فتح التقويم" closeLabel="إغلاق" previousLabel="الشهر السابق" nextLabel="الشهر التالي" calendarSystemLabel="نظام التقويم" gregorianLabel="ميلادي" hijriLabel="هجري (أم القرى)" rangeLabel="النطاق المدعوم" invalidMessage="أدخل التاريخ بالصيغة YYYY-MM-DD." unsupportedMessage="يقع هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى." value="2026-03-12" calendar="islamic-umalqura" />`
```

### الحدود

`min` و`max` تاريخان ميلاديان بصيغة ISO. ويُبلَّغ عن التاريخ المكتوب خارجهما برسالة التاريخ غير الصالح، ولا يسمح التقويم بتحديده. وفي vanilla تقرأ `createDatePicker` الحدين من عنصر الإدخال الأصلي، فتكتب شيفرة vanilla الخاصيتين `min` و`max` على عنصر الإدخال.

```html live example=bounds static differences=date-picker-adapter-markup,date-picker-value-order,date-picker-adapter-height
<div class="hw-date-picker" data-hw="date-picker" data-hw-locale="ar" data-hw-previous-label="الشهر السابق" data-hw-next-label="الشهر التالي" data-hw-calendar-system-label="نظام التقويم" data-hw-gregorian-label="ميلادي" data-hw-hijri-label="هجري (أم القرى)" data-hw-range-label="النطاق المدعوم" data-hw-invalid-message="أدخل التاريخ بالصيغة YYYY-MM-DD." data-hw-unsupported-message="يقع هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى.">
  <label class="hw-label" for="bounds">تاريخ الزيارة</label>
  <div class="hw-date-picker-control"><input class="hw-input" id="bounds" type="text" placeholder="سنة-شهر-يوم" data-hw-date-input name="bounds" min="2026-03-05" max="2026-03-25" value="2026-03-12" aria-describedby="bounds-hint">
  <button type="button" data-hw-date-trigger aria-label="فتح التقويم">التقويم</button></div>
  <p class="hw-hint" id="bounds-hint">استخدم الصيغة YYYY-MM-DD.</p>
  <dialog class="hw-dialog" data-hw-date-dialog aria-label="اختر تاريخ الموعد">
    <header class="hw-dialog-header"><h2>اختر تاريخ الموعد</h2><button class="hw-button" data-variant="ghost" type="button" data-hw-date-close>إغلاق</button></header>
    <div class="hw-dialog-body"><div class="hw-calendar" data-hw-date-calendar></div></div>
  </dialog>
</div>
```

```tsx live example=bounds
<DatePicker locale="ar" label="تاريخ الزيارة" hint="استخدم الصيغة YYYY-MM-DD." placeholder="سنة-شهر-يوم" calendarLabel="اختر تاريخ الموعد" openLabel="فتح التقويم" closeLabel="إغلاق" previousLabel="الشهر السابق" nextLabel="الشهر التالي" calendarSystemLabel="نظام التقويم" gregorianLabel="ميلادي" hijriLabel="هجري (أم القرى)" rangeLabel="النطاق المدعوم" invalidMessage="أدخل التاريخ بالصيغة YYYY-MM-DD." unsupportedMessage="يقع هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى." defaultValue="2026-03-12" min="2026-03-05" max="2026-03-25" />
```

```vue live example=bounds
<DatePicker locale="ar" label="تاريخ الزيارة" hint="استخدم الصيغة YYYY-MM-DD." placeholder="سنة-شهر-يوم" calendar-label="اختر تاريخ الموعد" open-label="فتح التقويم" close-label="إغلاق" previous-label="الشهر السابق" next-label="الشهر التالي" calendar-system-label="نظام التقويم" gregorian-label="ميلادي" hijri-label="هجري (أم القرى)" range-label="النطاق المدعوم" invalid-message="أدخل التاريخ بالصيغة YYYY-MM-DD." unsupported-message="يقع هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى." default-value="2026-03-12" min="2026-03-05" max="2026-03-25" />
```

```ts live example=bounds framework=angular
template: `<hw-date-picker locale="ar" label="تاريخ الزيارة" hint="استخدم الصيغة YYYY-MM-DD." placeholder="سنة-شهر-يوم" calendarLabel="اختر تاريخ الموعد" openLabel="فتح التقويم" closeLabel="إغلاق" previousLabel="الشهر السابق" nextLabel="الشهر التالي" calendarSystemLabel="نظام التقويم" gregorianLabel="ميلادي" hijriLabel="هجري (أم القرى)" rangeLabel="النطاق المدعوم" invalidMessage="أدخل التاريخ بالصيغة YYYY-MM-DD." unsupportedMessage="يقع هذا التاريخ خارج النطاق المدعوم لتقويم أم القرى." value="2026-03-12" min="2026-03-05" max="2026-03-25" />`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createDatePicker

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `calendar` | `'gregory' \| 'islamic-umalqura'` | `false` | — |
| `locale` | `string` | `false` | — |
| `getDayLabel` | `(value: string) => string` | `false` | — |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `onCalendarChange` | `(calendar: 'gregory' \| 'islamic-umalqura') => void` | `false` | — |
| `isDateDisabled` | `(value: string) => boolean` | `false` | — |
| `calendarSystemLabel` | `string` | `false` | — |
| `gregorianLabel` | `string` | `false` | — |
| `hijriLabel` | `string` | `false` | — |
| `calendarLabel` | `string` | `false` | — |
| `openLabel` | `string` | `false` | — |
| `invalidMessage` | `string` | `false` | — |
| `unavailableMessage` | `string` | `false` | — |
| `previousLabel` | `string` | `false` | — |
| `nextLabel` | `string` | `false` | — |
| `unsupportedMessage` | `string` | `false` | — |
| `rangeLabel` | `string` | `false` | — |

تجمع الدالة `createDatePicker(root, options)` عنصر إدخال نصيًا أصليًا يحمل `data-hw-date-input`، وزرًا مشغِّلًا يحمل `data-hw-date-trigger`، وعنصر `dialog` أصليًا يحمل `data-hw-date-dialog` ويضمّ عنصرًا فارغًا يحمل `data-hw-date-calendar`؛ ويملأ المتحكم ذلك العنصر بتقويم، ويكتب قبله مباشرة أداة التبديل بين التقويمين الميلادي والهجري. ويُغلق زرُّ الإغلاق الذي يحمل `data-hw-date-close` مربعَ الحوار. ويجب ألا يحمل العنصر المتداخل نفسه `data-hw="calendar"`. ويقرأ المتحكم من الجذر `calendar` و`locale` وخيارات النص على صورة `data-hw-<name>` بأحرف صغيرة تفصل بينها شرطات، كما يفعل المثال، ويتقدّم الخيار الممرَّر إلى الدالة المُنشئة؛ وتُقرأ `getDayLabel` و`isDateDisabled` و`onValueChange` و`onCalendarChange` من الخيارات وحدها، ويأتي الحدان من `min` و`max` في عنصر الإدخال الأصلي. ويتقدّم الاسم المكتوب في الترميز على خاصية الجذر: فلا تُقرأ `openLabel` إلا إذا لم يكن للزر المشغِّل `aria-label` ولا نص، ولا تُقرأ `calendarLabel` إلا إذا لم يكن لمربع الحوار اسم، ولذلك تسمّي الشيفرة الزر المشغِّل ومربع الحوار مباشرة. وزر الإغلاق هو عنصر `data-hw-date-close` المكتوب في الترميز بنصه الخاص، ولا تأخذ `createDatePicker` خيار نص له. ولا تنشر الخيارات قيمًا افتراضية في الإصدار 0.3.0: فدون `calendar` يكون العرض ميلاديًا. والخيار `locale` مطلوب، وكل خيار نص (`calendarLabel` و`openLabel` و`previousLabel` و`nextLabel` و`calendarSystemLabel` و`gregorianLabel` و`hijriLabel` و`rangeLabel` و`invalidMessage` و`unsupportedMessage`) نص يكتبه التطبيق وليس له قيمة افتراضية؛ ويلزم `unavailableMessage` عند تمرير `isDateDisabled`. ويُرجع المتحكم `show` و`close` و`value` و`calendar` و`select` و`setValue` و`setMonth` و`setCalendar` و`destroy`. وتُبلغ `onValueChange` و`onCalendarChange` عن القيمة الجديدة وتقويم العرض الجديد.

### React

جدول: خصائص DatePicker

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `value` | `string` | `false` | — |
| `defaultValue` | `string` | `false` | `''` |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `min` | `string` | `false` | — |
| `max` | `string` | `false` | — |
| `locale` | `string` | `true` | — |
| `calendar` | `'gregory' \| 'islamic-umalqura'` | `false` | — |
| `defaultCalendar` | `'gregory' \| 'islamic-umalqura'` | `false` | `'gregory'` |
| `onCalendarChange` | `(calendar: 'gregory' \| 'islamic-umalqura') => void` | `false` | — |
| `calendarSystemLabel` | `string` | `true` | — |
| `gregorianLabel` | `string` | `true` | — |
| `hijriLabel` | `string` | `true` | — |
| `rangeLabel` | `string` | `true` | — |
| `weekStartsOn` | `number` | `false` | — |
| `calendarLabel` | `string` | `true` | — |
| `openLabel` | `string` | `true` | — |
| `previousLabel` | `string` | `true` | — |
| `nextLabel` | `string` | `true` | — |
| `closeLabel` | `string` | `true` | — |
| `unsupportedMessage` | `string` | `true` | — |
| `invalidMessage` | `string` | `true` | — |
| `getDayLabel` | `(value: string) => string` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `isDateDisabled` | `(value: string) => boolean` | `false` | — |
| `unavailableMessage` | `string` | `false` | — |

يحمل اختيار التاريخ سلسلة نصية لتاريخ ميلادي بصيغة ISO. مرّر `value` مع `onValueChange` لاختيار تاريخ متحكَّم فيه، أو `defaultValue` لاختيار غير متحكَّم فيه يبدأ بالسلسلة النصية الفارغة. ويتحكم `calendar` مع `onCalendarChange` في تقويم العرض، وتضبط `defaultCalendar` (القيمة الافتراضية `'gregory'`) التقويم الأولي لتقويم عرض غير متحكَّم فيه. والخصائص `locale` و`calendarSystemLabel` و`gregorianLabel` و`hijriLabel` و`rangeLabel` و`calendarLabel` و`openLabel` و`previousLabel` و`nextLabel` و`closeLabel` و`unsupportedMessage` و`invalidMessage` نصوص مطلوبة. والخصائص `label` و`hint` و`error` محتوى قابل للعرض، وتسمّي `aria-label` أو `aria-labelledby` عنصر الإدخال عندما لا تُمرَّر `label`. وتحلّ `error` غير الفارغة محلّ رسالة التاريخ المكتوب. وترفض `isDateDisabled` تاريخًا، وتحتاج إلى `unavailableMessage`، وهي رسالة التحقق الخاصة بذلك التاريخ؛ وتستبدل `getDayLabel` اسم اليوم الذي تنتجه Intl. وتُمرَّر `weekStartsOn` دون تغيير إلى التقويم المتداخل، الذي يجعل قيمتها الافتراضية `0`، أي الأحد.

### Vue

جدول: خصائص DatePicker وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `calendar` | prop | `'gregory' \| 'islamic-umalqura'` | `false` | — |
| `calendarSwitchable` | prop | `boolean` | `false` | `true` |
| `label` | prop | `string` | `false` | — |
| `unsupportedMessage` | prop | `string` | `true` | — |
| `rangeLabel` | prop | `string` | `true` | — |
| `calendarSystemLabel` | prop | `string` | `true` | — |
| `gregorianLabel` | prop | `string` | `true` | — |
| `hijriLabel` | prop | `string` | `true` | — |
| `calendarLabel` | prop | `string` | `true` | — |
| `openLabel` | prop | `string` | `true` | — |
| `closeLabel` | prop | `string` | `true` | — |
| `invalidMessage` | prop | `string` | `true` | — |
| `unavailableMessage` | prop | `string` | `false` | — |
| `placeholder` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `modelValue` | prop | `string` | `false` | — |
| `defaultValue` | prop | `string` | `false` | `''` |
| `month` | prop | `string` | `false` | — |
| `min` | prop | `string` | `false` | — |
| `max` | prop | `string` | `false` | — |
| `locale` | prop | `string` | `true` | — |
| `weekStartsOn` | prop | `number` | `false` | `0` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `previousLabel` | prop | `string` | `true` | — |
| `nextLabel` | prop | `string` | `true` | — |
| `getDayLabel` | prop | `(value: string) => string` | `false` | — |
| `isDateDisabled` | prop | `(value: string) => boolean` | `false` | — |
| `update:modelValue` | event | `(value: string) => void` | `false` | — |
| `update:calendar` | event | `(value: 'gregory' \| 'islamic-umalqura') => void` | `false` | — |

يربط `v-model` سلسلة ISO النصية، وتضبط `defaultValue` القيمة الأولية لاختيار تاريخ غير متحكَّم فيه. وتُربط `calendar` مع الحدث `update:calendar`، وليس لها قيمة افتراضية مصرَّح بها: فدونها يبدأ مربع الحوار بالتقويم الميلادي. وتتحكم `calendarSwitchable` (القيمة الافتراضية `true`) في عرض أداة التبديل في مربع الحوار. والخصائص `locale` و`calendarSystemLabel` و`gregorianLabel` و`hijriLabel` و`rangeLabel` و`calendarLabel` و`openLabel` و`closeLabel` و`previousLabel` و`nextLabel` و`unsupportedMessage` و`invalidMessage` نصوص مطلوبة؛ و`unavailableMessage` مطلوبة عند تمرير `isDateDisabled`. والخصائص `label` و`hint` و`error` و`placeholder` سلاسل نصية، وليس لـ`placeholder` قيمة افتراضية. وتضبط `required` خاصية HTML الأصلية، وتعرض علامة الحقل المطلوب بعد التسمية. والقيمة الافتراضية لـ`disabled` و`readonly` هي `false`. وتعيد إعادة تعيين النموذج القيمة إلى `defaultValue`، وتُغلق مربع الحوار، وتمحو المسودة والرسالة. ولا يسرد الجدول أي منفذ لأن الإصدار المنشور لا يقرأ أي منفذ.

### Angular

جدول: مُدخلات hw-date-picker ومخرجاته ومحتواه

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
| `min` | input | `string` | `false` | `''` |
| `max` | input | `string` | `false` | `''` |
| `calendar` | input | `'gregory' \| 'islamic-umalqura'` | `false` | `'gregory'` |
| `weekStartsOn` | input | `number` | `false` | `0` |
| `direction` | input | `'ltr' \| 'rtl'` | `false` | — |
| `locale` | input | `string` | `true` | — |
| `calendarLabel` | input | `string` | `true` | — |
| `openLabel` | input | `string` | `true` | — |
| `closeLabel` | input | `string` | `true` | — |
| `previousLabel` | input | `string` | `true` | — |
| `nextLabel` | input | `string` | `true` | — |
| `calendarSystemLabel` | input | `string` | `true` | — |
| `gregorianLabel` | input | `string` | `true` | — |
| `hijriLabel` | input | `string` | `true` | — |
| `rangeLabel` | input | `string` | `true` | — |
| `invalidMessage` | input | `string` | `true` | — |
| `unsupportedMessage` | input | `string` | `true` | — |
| `isDateDisabled` | input | `(value: string) => boolean` | `false` | — |
| `unavailableMessage` | input | `string` | `false` | `''` |
| `getDayLabel` | input | `(value: string) => string` | `false` | — |
| `placeholder` | input | `string` | `false` | `''` |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `calendarChange` | output | `'gregory' \| 'islamic-umalqura'` | `false` | — |

يعرض `HwDatePickerComponent` (`hw-date-picker`) التسمية وعنصر الإدخال النصي والزر المشغِّل والنص الإرشادي والخطأ ومربع الحوار. اربط `[(value)]` ربطًا ثنائي الاتجاه بسلسلة ISO النصية، و`[(calendar)]` بتقويم العرض عبر `calendarChange`؛ ويعمل المكوّن أيضًا عنصرَ تحكم في النموذج. والمُدخل `label` مطلوب ما لم تسمِّ `aria-label` أو `aria-labelledby` أو عنصر `hw-field` محيط عنصرَ الإدخال. والمُدخلات `locale` و`calendarLabel` (عنوان مربع الحوار واسم التقويم) و`openLabel` و`closeLabel` و`previousLabel` و`nextLabel` و`calendarSystemLabel` و`gregorianLabel` و`hijriLabel` و`rangeLabel` و`invalidMessage` و`unsupportedMessage` مطلوبة، و`unavailableMessage` مطلوب مع `isDateDisabled`. ولا يُمرَّر `direction` إلا إلى التقويم المتداخل: فيكتبه التقويم في الخاصية `dir` على جذره، ويستخدمه لمفاتيح الأسهم، ولا يتلقاه مربع الحوار ولا ترويسته ولا أداة التبديل. ونص رسالة التاريخ المكتوب هو نفسه رسالة التحقق المخصّصة لعنصر الإدخال، والرسالة الغائبة تمنع الإرسال أيضًا. وما دام `locale` فارغًا يُعرض تاريخ ISO المكتوب كما كُتب، ولا يُعلَن أي تاريخ منسَّق، ويكون التقويم في مربع الحوار فارغًا. والقيمة الافتراضية لـ`calendar` هي `'gregory'`، ولـ`weekStartsOn` هي `0`.

## إمكانية الوصول

عنصر الإدخال عنصر إدخال نصي تسمّيه التسمية الظاهرة، ويرتبط به النص الإرشادي عبر `aria-describedby`. واسم الزر المشغِّل هو `openLabel`. ومربع الحوار مربع حوار أصلي مشروط تسمّيه `calendarLabel`؛ وفتحه ينقل التركيز إلى اليوم المحدَّد، أو إلى تاريخ اليوم، ويُغلقه المفتاح Escape. ويعيد الإغلاق التركيز إلى عنصر التحكم الذي فتح مربع الحوار: الزر المشغِّل، أو عنصر الإدخال إذا فتحه السهم السفلي. ويُعلَن التاريخ المحدَّد أيضًا كاملًا، مع اسم يوم الأسبوع، في عنصر `output` بعد عنصر الإدخال، وكذلك حين يكون مربع الحوار مغلقًا.

رسالةُ التاريخ المكتوب الذي صيغته غير صحيحة، أو يقع خارج نطاق التقويم، أو خارج `min` و`max`، أو ترفضه `isDateDisabled`، فقرةٌ واحدة بعد النص الإرشادي تحمل `role="alert"`، ويحمل عنصر الإدخال `aria-invalid` وتكون الرسالة في وصفه إلى أن يصبح التاريخ صالحًا من جديد أو يُعاد تعيين النموذج. ويحلّ الخطأ `error` الذي يمرّره التطبيق محلّ تلك الرسالة، وليس له دور.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: اختيار تاريخ

| المفتاح | الإجراء |
| --- | --- |
| <kbd>السهم السفلي</kbd> | في عنصر الإدخال النصي، يفتح التقويم وينقل التركيز إلى اليوم المحدَّد، أو إلى تاريخ اليوم. |
| <kbd>السهم الأيسر</kbd>، <kbd>السهم الأيمن</kbd> | في التقويم، ينقل التركيز إلى اليوم التالي أو السابق بحسب اتجاه الصفحة. |
| <kbd>السهم السفلي</kbd>، <kbd>السهم العلوي</kbd> | في التقويم، ينقل التركيز إلى يوم الأسبوع نفسه في الأسبوع التالي أو السابق. |
| <kbd>Home</kbd>، <kbd>End</kbd> | في التقويم، ينقل التركيز إلى أول يوم في الأسبوع أو آخر يوم فيه. |
| <kbd>Page Down</kbd>، <kbd>Page Up</kbd> | في التقويم، ينقل التركيز إلى الشهر التالي أو السابق. |
| <kbd>Shift</kbd> + <kbd>Page Down</kbd>، <kbd>Shift</kbd> + <kbd>Page Up</kbd> | في التقويم، ينقل التركيز إلى السنة التالية أو السابقة. |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | يحدّد اليوم الذي عليه التركيز، ويكتب تاريخه في عنصر الإدخال، ويُغلق مربع الحوار، ويعيد التركيز إلى عنصر التحكم الذي فتحه. |
| <kbd>Escape</kbd> | يُغلق مربع الحوار، ويعيد التركيز إلى عنصر التحكم الذي فتحه. |

يتوقف التنقل في التقويم عند حدود `min` و`max` وجدول أم القرى، ومعلومات النطاق المدعوم عنصر واحد قابل للتركيز تسمّيه `rangeLabel`.

## الاتجاه والتوطين

القيمة المكتوبة و`min` و`max` تواريخ ميلادية بصيغة ISO في كل لغة وفي كل تقويم، فيكتب القارئ النص نفسه أيًّا كان التقويم الذي يعرضه مربع الحوار. وتقويم العرض والإعدادات المحلية والاتجاه مستقلة بعضها عن بعض: فلا تضبط `locale` إلا طريقة كتابة Intl للأسماء، ويأخذ التقويم اتجاهه من أقرب خاصية `dir`، أو من `direction` في Angular. وتُعزل تواريخ ISO داخل الرسالة باتجاه من اليسار إلى اليمين كي تبقى مقروءة في النص المكتوب من اليمين إلى اليسار. وليس في المكوّن نص مدمج، فتُكتب كل تسمية وكل رسالة بلغة الصفحة.

يحافظ تبديل تقويم العرض على تاريخ ISO المحدَّد، ويُبقي مربع الحوار مفتوحًا. ويغطي جدول أم القرى المدة من 1924-08-01 إلى 2077-11-16 (من 1343 إلى 1500 هـ)؛ ويبقى التاريخ الميلادي الواقع خارجها في عنصر الإدخال، ويُعلَّم بأنه غير صالح ما دام التقويم الهجري هو المختار، وتشرحه `unsupportedMessage`. ويعرض الحقل في حالة السكون التاريخ منسَّقًا بالتقويم النشط، ويعرض عند التركيز نص ISO للتحرير.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط اختيار التاريخ بكود المنصات. وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- الحقل المصغَّر ومربع الحوار المشروط وأداة التبديل ومعلومات النطاق قرارات من هوية، تصفها [ملاحظة عرض اختيار التاريخ](../date-picker-ui.md)، وتذكر أنها ليست أبعادًا مستخرجة من كود المنصات.
- تصف [ملاحظة موثوقية التقاويم](../date-calendars.md) مرجع أم القرى المثبَّت، ونطاقه المدعوم، وحدود مصادره.
