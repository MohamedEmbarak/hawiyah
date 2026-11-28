---
source:
  summary: 5acdb07f284d
  example: 40e715a42256
  variants-and-states: 275437d4f8d3
  api: aeac2b890b14
  accessibility: a1db46340c14
  rtl-and-localisation: 7e40feb1f8e7
  platforms-code-reference: fa0a87867f03
---
# شريط تمرير

يتيح شريط التمرير اختيار رقم واحد من نطاق محدود بعنصر إدخال نطاق أصلي وتسمية ظاهرة، ومعهما نص إرشادي ورسالة خطأ والقيمة الحالية نصًّا عندما يوفّرها التطبيق. والقيمة رقم، وتبقى لعنصر إدخال النطاق دلالاته الأصلية وسلوكه الأصلي مع لوحة المفاتيح.

## مثال

لشريط التمرير تسمية ظاهرة تبيّن الكمية المطلوبة. ويذكر النص الإرشادي النطاق، وتعرض الخاصية `showValue` القيمة الحالية نصًّا بعد عنصر الإدخال.

```html live example=basic differences=slider-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="basic-copies" id="basic-copies-label">عدد النسخ</label>
  <input class="hw-slider" id="basic-copies" name="copies" type="range" min="1" max="10" step="1" value="5" aria-describedby="basic-copies-hint">
  <output class="hw-slider-value" for="basic-copies">5</output>
  <p class="hw-hint" id="basic-copies-hint">اختر من 1 إلى 10 نسخ.</p>
</div>
```

```tsx live example=basic
<Slider label="عدد النسخ" name="copies" min={1} max={10} step={1} defaultValue={5} hint="اختر من 1 إلى 10 نسخ." showValue />
```

```vue live example=basic
<Slider label="عدد النسخ" name="copies" :min="1" :max="10" :step="1" :default-value="5" hint="اختر من 1 إلى 10 نسخ." show-value />
```

```ts live example=basic framework=angular
template: `<hw-slider label="عدد النسخ" name="copies" [min]="1" [max]="10" [step]="1" [value]="5" hint="اختر من 1 إلى 10 نسخ." [showValue]="true" />`
```

## الأشكال والحالات

### القيمة المنسَّقة

تُرجع الدالة `formatValue` نص القيمة. ويُعرض هذا النص في عنصر `output`، ويُكتب في `aria-valuetext`، فتعلن التقنيات المساعدة النص نفسه الذي تعرضه الشاشة.

```html live example=format differences=slider-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="format-days" id="format-days-label">مدة المعالجة</label>
  <input class="hw-slider" id="format-days" name="days" type="range" min="1" max="30" step="1" value="7" aria-valuetext="7 أيام">
  <output class="hw-slider-value" for="format-days">7 أيام</output>
</div>
```

```tsx live example=format
<Slider label="مدة المعالجة" name="days" min={1} max={30} step={1} defaultValue={7} showValue formatValue={value => `${value} أيام`} />
```

```vue live example=format
<Slider label="مدة المعالجة" name="days" :min="1" :max="30" :step="1" :default-value="7" show-value :format-value="(value: number) => `${value} أيام`" />
```

```ts live example=format framework=angular
import { Component } from '@angular/core';
import { HwSliderComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-format-example',
  imports: [HwSliderComponent],
  template: `<hw-slider label="مدة المعالجة" name="days" [min]="1" [max]="30" [step]="1" [value]="7" [showValue]="true" [formatValue]="formatDays" />`,
})
export class FormatExample {
  formatDays = (value: number) => `${value} أيام`;
}
```

### شريط تمرير مطلوب

يعرض شريط التمرير المطلوب علامة واحدة بعد تسميته. ولعنصر إدخال النطاق قيمة دائمًا، فلا تُكتب الخاصية `required` على عنصر الإدخال. والعلامة مخفية عن التقنيات المساعدة، فيذكر النص الإرشادي بالكلمات أيضًا أن الحقل مطلوب.

```html live example=required differences=slider-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="required-pages" id="required-pages-label">عدد الصفحات<span class="hw-required-marker" aria-hidden="true"> *</span></label>
  <input class="hw-slider" id="required-pages" name="pages" type="range" min="1" max="50" step="1" value="25" aria-describedby="required-pages-hint">
  <p class="hw-hint" id="required-pages-hint">اختر من 1 إلى 50 صفحة. هذا الحقل مطلوب.</p>
</div>
```

```tsx live example=required
<Slider label="عدد الصفحات" name="pages" min={1} max={50} step={1} defaultValue={25} hint="اختر من 1 إلى 50 صفحة. هذا الحقل مطلوب." required />
```

```vue live example=required
<Slider label="عدد الصفحات" name="pages" :min="1" :max="50" :step="1" :default-value="25" hint="اختر من 1 إلى 50 صفحة. هذا الحقل مطلوب." required />
```

```ts live example=required framework=angular
template: `<hw-slider label="عدد الصفحات" name="pages" [min]="1" [max]="50" [step]="1" [value]="25" hint="اختر من 1 إلى 50 صفحة. هذا الحقل مطلوب." [required]="true" />`
```

### شريط تمرير فيه خطأ

يظهر الخطأ في فقرة بعد عنصر الإدخال، ويحمل عنصر الإدخال الخاصية `aria-invalid="true"`، وتصفه الرسالة. وتذكر الرسالة ما الخطأ وكيف يُصحَّح.

```html live example=error differences=slider-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="error-copies" id="error-copies-label">عدد النسخ</label>
  <input class="hw-slider" id="error-copies" name="copies" type="range" min="1" max="10" step="1" value="1" aria-invalid="true" aria-describedby="error-copies-error">
  <p class="hw-error" id="error-copies-error">اختر نسختين على الأقل للطلب المشترك.</p>
</div>
```

```tsx live example=error
<Slider label="عدد النسخ" name="copies" min={1} max={10} step={1} defaultValue={1} error="اختر نسختين على الأقل للطلب المشترك." />
```

```vue live example=error
<Slider label="عدد النسخ" name="copies" :min="1" :max="10" :step="1" :default-value="1" error="اختر نسختين على الأقل للطلب المشترك." />
```

```ts live example=error framework=angular
template: `<hw-slider label="عدد النسخ" name="copies" [min]="1" [max]="10" [step]="1" [value]="1" error="اختر نسختين على الأقل للطلب المشترك." />`
```

### شريط تمرير معطَّل

يستخدم شريط التمرير المعطَّل الخاصية الأصلية `disabled`. ولا يقبل التركيز، ولا تُرسَل قيمته.

```html live example=disabled differences=slider-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="disabled-copies" id="disabled-copies-label">عدد النسخ</label>
  <input class="hw-slider" id="disabled-copies" name="copies" type="range" min="1" max="10" step="1" value="5" disabled>
</div>
```

```tsx live example=disabled
<Slider label="عدد النسخ" name="copies" min={1} max={10} step={1} defaultValue={5} disabled />
```

```vue live example=disabled
<Slider label="عدد النسخ" name="copies" :min="1" :max="10" :step="1" :default-value="5" disabled />
```

```ts live example=disabled framework=angular
template: `<hw-slider label="عدد النسخ" name="copies" [min]="1" [max]="10" [step]="1" [value]="5" [disabled]="true" />`
```

### شريط تمرير مخصّص للقراءة فقط

يحتفظ شريط التمرير المخصّص للقراءة فقط بقيمته في النموذج، ويبقى في ترتيب التنقل بالمفتاح Tab، فيستطيع القارئ نقل التركيز إليه. ويضبط الخاصية `aria-readonly="true"`. وفي React وVue وAngular يتجاهل المكوّن أيضًا إيماءات المؤشر والمفاتيح التي تغيّر القيمة. وليس لعنصر إدخال النطاق الأصلي سلوك للقراءة فقط، فلا يزيد ترميز vanilla على التعبير عن الحالة: يلغي التطبيق تغيير القيمة بنفسه، ويمكن تغيير قيمة مثال vanilla في هذه الصفحة.

```html live example=readonly differences=slider-adapter-attributes
<div class="hw-field">
  <label class="hw-label" for="readonly-copies" id="readonly-copies-label">عدد النسخ</label>
  <input class="hw-slider" id="readonly-copies" name="copies" type="range" min="1" max="10" step="1" value="5" aria-readonly="true">
</div>
```

```tsx live example=readonly
<Slider label="عدد النسخ" name="copies" min={1} max={10} step={1} defaultValue={5} readOnly />
```

```vue live example=readonly
<Slider label="عدد النسخ" name="copies" :min="1" :max="10" :step="1" :default-value="5" readonly />
```

```ts live example=readonly framework=angular
template: `<hw-slider label="عدد النسخ" name="copies" [min]="1" [max]="10" [step]="1" [value]="5" [readOnly]="true" />`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-slider

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-slider'` | `true` | — |

ليس لشريط التمرير متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر `input` أصليًا يحمل `type="range"` والصنف `hw-slider` داخل عنصر بالصنف `hw-field`، وعنصر `label` بالصنف `hw-label` تشير خاصيته `for` إلى عنصر الإدخال، وعند الحاجة فقرةً بالصنف `hw-hint` أو `hw-error` وعنصر `output` بالصنف `hw-slider-value`. وتضبط الخصائص الأصلية `min` و`max` و`step` و`value` و`name` و`disabled` و`aria-valuetext` النطاق والنص الذي تعلنه التقنيات المساعدة. ويكتب التطبيق عنصر `output` ويُبقي نصه مطابقًا للقيمة، لأن أي برنامج نصي لا يحدّثه. ولعنصر إدخال النطاق قيمة دائمًا، فلا تسمح HTML بالخاصية `required` عليه؛ ويُعبَّر عن الحقل المطلوب تعبيرًا ظاهرًا بعلامة الحقل المطلوب داخل التسمية. ويُكتب شريط التمرير المخصّص للقراءة فقط بالخاصية `aria-readonly="true"`، ويلغي التطبيق تغيير القيمة بنفسه.

### React

جدول: خصائص Slider

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `value` | `number` | `false` | — |
| `defaultValue` | `number` | `false` | — |
| `onValueChange` | `(value: number) => void` | `false` | — |
| `showValue` | `boolean` | `false` | `false` |
| `formatValue` | `(value: number) => string` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

يقبل Slider أيضًا خصائص عنصر الإدخال الأصلي، ومنها `name` و`min` و`max` و`step` و`disabled` و`readOnly` و`ref`، وتصل إلى عنصر إدخال النطاق. والخاصيتان `min` و`max` خاصيتان أصليتان، وليستا من صفوف الجدول، ويضبط المكوّن قيمتيهما الافتراضيتين: قيمة `min` هي 0 وقيمة `max` هي 100 ما لم تُمرَّرا. مرّر `value` مع `onValueChange` لشريط تمرير متحكَّم فيه، أو `defaultValue` لشريط تمرير غير متحكَّم فيه؛ وعندما لا تُمرَّر أي منهما، يبدأ شريط التمرير من منتصف المسافة بين `min` و`max`، فليس في الجدول قيمة افتراضية. وتتلقّى `onValueChange` القيمة رقمًا. وتعرض الخاصية `showValue` بعد عنصر الإدخال عنصر `output` يحمل القيمة سلسلةً نصية، أو النص الذي تُرجعه `formatValue`؛ وتضبط `formatValue` أيضًا `aria-valuetext`، التي لا تُكتب دونها. والخصائص `label` و`hint` و`error` محتوى React قابل للعرض؛ ويُعرض النص الإرشادي والخطأ فقرتين بعد عنصر الإدخال ويرتبطان به، وتضبط الخاصية `error` غير الفارغة `aria-invalid`. وتعرض الخاصية `required` العلامة بعد التسمية، ولا تُكتب على عنصر إدخال النطاق. ويحتفظ شريط التمرير المخصّص للقراءة فقط بقيمته، ويتجاهل إيماءات المؤشر ومفاتيح الأسهم والمفاتيح Home وEnd وPage Up وPage Down، ويضبط `aria-readonly`.

### Vue

جدول: خصائص Slider وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `showValue` | prop | `boolean` | `false` | `false` |
| `modelValue` | prop | `number` | `false` | — |
| `defaultValue` | prop | `number` | `false` | — |
| `min` | prop | `number` | `false` | `0` |
| `max` | prop | `number` | `false` | `100` |
| `step` | prop | `number` | `false` | `1` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `formatValue` | prop | `(value: number) => string` | `false` | — |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: number) => void` | `false` | — |

يربط `v-model` الرقم، وتضبط الخاصية `defaultValue` القيمة الأولية لشريط تمرير غير متحكَّم فيه؛ ودون أي منهما يبدأ شريط التمرير من منتصف المسافة بين `min` و`max`، فليس لـ`defaultValue` قيمة افتراضية في الجدول. وتعرض الخاصية `showValue` بعد عنصر الإدخال عنصر `output` يحمل القيمة سلسلةً نصية، أو النص الذي تُرجعه `formatValue`؛ وتضبط `formatValue` أيضًا `aria-valuetext`، التي لا تُكتب دونها. والخصائص `label` و`hint` و`error` سلاسل نصية؛ ويُعرض النص الإرشادي والخطأ فقرتين بعد عنصر الإدخال، وتضبط الخاصية `error` غير الفارغة `aria-invalid`. وتعرض الخاصية `required` العلامة، ولا تُكتب على عنصر إدخال النطاق. ويحتفظ شريط التمرير المخصّص للقراءة فقط بقيمته، ويضبط `aria-readonly`. وتصل خصائص HTML الأخرى، مثل `name` و`form`، إلى عنصر الإدخال الأصلي. ولا يعرّف تصريح الحزمة نوع أي منفذ، ولا يقرأ الإصدار المنشور أي منفذ.

### Angular

جدول: مُدخلات hw-slider ومخرجاته ومحتواه

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
| `value` | input | `number` | `false` | `0` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `min` | input | `number` | `false` | `0` |
| `max` | input | `number` | `false` | `100` |
| `step` | input | `number` | `false` | `1` |
| `showValue` | input | `boolean` | `false` | `false` |
| `formatValue` | input | `(value: number) => string` | `false` | — |
| `valueChange` | output | `number` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |

يعرض `HwSliderComponent` (`hw-slider`) الحقل والتسمية وعنصر إدخال النطاق الأصلي وعنصر `output` والنص الإرشادي والخطأ. اربط `[(value)]` ربطًا ثنائي الاتجاه بالقيمة الرقمية؛ ويعمل المكوّن أيضًا عنصرَ تحكم في النموذج عبر موصّل القيمة الخاص به، والقيمة null المكتوبة عبر عنصر تحكم في النموذج تعيد القيمة إلى `min`. والمُدخل `value` هو القيمة الأولية، وقيمته 0 ما لم يُمرَّر، فاكتب قيمة `value` بين `min` و`max` عندما لا يكون 0 قيمة بداية صالحة. ويعرض المُدخل `showValue` بعد عنصر الإدخال عنصر `output` بالصنف `hw-slider-value` يحمل القيمة كما هي، أو النص الذي تُرجعه `formatValue`؛ وتضبط `formatValue` أيضًا `aria-valuetext`، التي لا تُكتب دونها. ويعرض المُدخل `required` العلامة، ولا يُكتب على عنصر إدخال النطاق. ويحتفظ المُدخل `readOnly` بالقيمة ويضبط `aria-readonly`. ويحتاج شريط التمرير إلى `label`، أو إلى `aria-label` أو `aria-labelledby` مكتوبة على `hw-slider`، أو إلى تسمية عنصر `hw-field` يحيط به؛ ويضبط `controlId` معرّف عنصر الإدخال. ويُرسل المُخرج `valueChange` الرقم، ويُرسل المُخرجان `focused` و`blurred` أحداث التركيز الأصلية لعنصر الإدخال.

## إمكانية الوصول

شريط التمرير عنصر إدخال نطاق أصلي، فيوفّر المتصفح دوره وسلوك التركيز عليه والتعامل مع لوحة المفاتيح: تغيّر المفاتيح <kbd>السهم الأيسر</kbd> و<kbd>السهم الأيمن</kbd> و<kbd>السهم العلوي</kbd> و<kbd>السهم السفلي</kbd> القيمة بمقدار `step`، وينقل المفتاحان <kbd>Home</kbd> و<kbd>End</kbd> القيمة إلى `min` و`max`، ويغيّرها المفتاحان <kbd>Page Up</kbd> و<kbd>Page Down</kbd> بخطوة أكبر. والتسمية عنصر `label` أصلي تشير خاصيته `for` إلى عنصر الإدخال، فيكون نص التسمية هو الاسم الميسّر. ويرتبط النص الإرشادي والخطأ بعنصر الإدخال وصفًا له.

- لا تُكتب الخاصية `aria-valuetext` إلا عند تمرير `formatValue`. ودونها تعلن التقنيات المساعدة الرقم. فاكتب قيمة منسَّقة عندما لا يحمل الرقم وحده وحدته.
- يكرّر عنصر `output` الذي تعرضه `showValue` القيمة نصًّا للقارئ الذي لا يعتمد على موضع المقبض؛ وهو ليس الاسم الميسّر.
- تُضبط الخاصية `aria-invalid="true"` عندما يمرّر التطبيق قيمة غير فارغة لـ`error`.
- يضبط شريط التمرير المخصّص للقراءة فقط الخاصية `aria-readonly="true"`، ويبقى في ترتيب التنقل بالمفتاح Tab. وفي React وVue وAngular يتجاهل أيضًا إيماءات المؤشر ومفاتيح الأسهم والمفاتيح Home وEnd وPage Up وPage Down؛ وليس في ترميز vanilla هذه الحماية، فيلغي التطبيق التغيير. ولا يقبل شريط التمرير المعطَّل التركيز ولا التغيير.
- علامة الحقل المطلوب مخفية عن التقنيات المساعدة. ولعنصر إدخال النطاق قيمة دائمًا، فيُذكر أيضًا في النص الإرشادي أن الحقل مطلوب عندما يكون لذلك أهمية.
- تمنح ورقة الأنماط عنصر إدخال النطاق مؤشر تركيز، وتُبقي عنصر التحكم الأصلي في وضع الألوان القسرية.

## الاتجاه والتوطين

ليس في شريط التمرير نص مدمج: يكتب التطبيق التسمية والنص الإرشادي والخطأ والنص الذي تُرجعه `formatValue` بلغة الصفحة. ويرث العنصر لغة الصفحة واتجاهها، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية، فيملأ عنصر إدخال النطاق حقله في اتجاه السطر، وتتبع التسمية والفقرات اتجاه القراءة.

- في الدالة `formatValue` ينسّق التطبيق الرقم بحسب إعداداته المحلية: الأرقام والوحدة وترتيب الكلمات. ودونها يعرض عنصر `output` الرقم سلسلةً نصية.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط شريط التمرير بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تُدرج [ملاحظات التغطية](../coverage.md) شريط التمرير ضمن عناصر التحكم الإضافية، وضمن نوع التنفيذ الأصلي، وتُدرج نوع الإدخال range اختيارًا رقميًا ضمن نطاق محدود.
- تتبع التسمية الربط الوارد في [ملاحظات حقول الإدخال](../nic-inputs.md)، التي تحيل في خصائص خط النص الإرشادي والخطأ إلى [مقارنة أوصاف قائمة الاختيار والحقل](../nic-select.md)؛ ويُوصف سلوك القراءة فقط في [ملاحظات عناصر التحكم المخصّصة للقراءة فقط](../readonly-inputs.md).
