---
source:
  summary: 45f627ddf8df
  example: 002c76954029
  variants-and-states: ade55116787b
  api: 25b52fa916fa
  accessibility: f1f29d9265a3
  rtl-and-localisation: 4bb51c3d2aa9
  platforms-code-reference: 79f90e25a833
---
# نطاق رقمي

النطاق الرقمي مجموعة من عنصرَي إدخال نطاق أصليين لكل منهما تسمية، يحدّدان رقمًا أدنى ورقمًا أعلى. ولا تتجاوز القيمة الدنيا القيمة العليا أبدًا، وتُرسَل القيمتان مع النموذج.

## مثال

للنطاق الرقمي تسمية مجموعة ظاهرة تبيّن المعلومة المطلوبة، ولكل مقبض تسمية ظاهرة.

```html live example=basic static differences=range-slider-adapter-markup
<fieldset class="hw-field hw-range-slider" data-hw="range-slider">
  <legend class="hw-label">مدة المعالجة</legend>
  <label class="hw-label">أقصر مدة<input class="hw-slider" id="basic-lower" type="range" name="processing-days" min="1" max="30" value="5" data-hw-lower></label>
  <label class="hw-label">أطول مدة<input class="hw-slider" id="basic-upper" type="range" name="processing-days" min="1" max="30" value="20" data-hw-upper></label>
</fieldset>
```

```tsx live example=basic
<RangeSlider
  label="مدة المعالجة"
  lowerLabel="أقصر مدة"
  upperLabel="أطول مدة"
  name="processing-days"
  min={1}
  max={30}
  defaultValue={[5, 20]}
/>
```

```vue live example=basic
<RangeSlider
  label="مدة المعالجة"
  lower-label="أقصر مدة"
  upper-label="أطول مدة"
  name="processing-days"
  :min="1"
  :max="30"
  :default-value="[5, 20]"
/>
```

```ts live example=basic framework=angular
import { Component } from '@angular/core';
import { HwRangeSliderComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwRangeSliderComponent],
  template: `
    <hw-range-slider
      label="مدة المعالجة"
      lowerLabel="أقصر مدة"
      upperLabel="أطول مدة"
      lowerName="processing-days"
      upperName="processing-days"
      [min]="1"
      [max]="30"
      [value]="[5, 20]"
    />
  `,
})
export class ExampleComponent {
}
```

## الأشكال والحالات

### الخطوة والنص الإرشادي

تضبط `step` مقدار الزيادة للمقبضين كليهما، ويشرح النص الإرشادي الغرض من النطاق. وتلتزم القيمتان بالخطوة، وتبقى القيمة الدنيا مساوية للقيمة العليا أو أقل منها.

```html live example=step static differences=range-slider-adapter-markup
<fieldset class="hw-field hw-range-slider" data-hw="range-slider" aria-describedby="step-hint">
  <legend class="hw-label">مدة المعالجة</legend>
  <label class="hw-label">أقصر مدة<input class="hw-slider" id="step-lower" type="range" name="processing-days" min="0" max="30" step="5" value="5" data-hw-lower></label>
  <label class="hw-label">أطول مدة<input class="hw-slider" id="step-upper" type="range" name="processing-days" min="0" max="30" step="5" value="20" data-hw-upper></label>
  <p class="hw-hint" id="step-hint">اختر أقصر مدة وأطول مدة تقبلهما.</p>
</fieldset>
```

```tsx live example=step
<RangeSlider
  label="مدة المعالجة"
  lowerLabel="أقصر مدة"
  upperLabel="أطول مدة"
  name="processing-days"
  min={0}
  max={30}
  defaultValue={[5, 20]}
  step={5}
  hint="اختر أقصر مدة وأطول مدة تقبلهما."
/>
```

```vue live example=step
<RangeSlider
  label="مدة المعالجة"
  lower-label="أقصر مدة"
  upper-label="أطول مدة"
  name="processing-days"
  :min="0"
  :max="30"
  :default-value="[5, 20]"
  :step="5"
  hint="اختر أقصر مدة وأطول مدة تقبلهما."
/>
```

```ts live example=step framework=angular
import { Component } from '@angular/core';
import { HwRangeSliderComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwRangeSliderComponent],
  template: `
    <hw-range-slider
      label="مدة المعالجة"
      lowerLabel="أقصر مدة"
      upperLabel="أطول مدة"
      lowerName="processing-days"
      upperName="processing-days"
      [min]="0"
      [max]="30"
      [value]="[5, 20]"
      [step]="5"
      hint="اختر أقصر مدة وأطول مدة تقبلهما."
    />
  `,
})
export class ExampleComponent {
}
```

### الخطأ

يظهر الخطأ في فقرة في آخر المجموعة، داخل عنصر `fieldset`، ويحمل عنصر `fieldset` الخاصية `aria-invalid="true"`، وتصفه الرسالة. وتذكر الرسالة ما الخطأ وكيف يُصحَّح.

```html live example=error static differences=range-slider-adapter-markup
<fieldset class="hw-field hw-range-slider" data-hw="range-slider" aria-invalid="true" aria-describedby="error-error">
  <legend class="hw-label">مدة المعالجة</legend>
  <label class="hw-label">أقصر مدة<input class="hw-slider" id="error-lower" type="range" name="processing-days" min="1" max="30" value="5" data-hw-lower></label>
  <label class="hw-label">أطول مدة<input class="hw-slider" id="error-upper" type="range" name="processing-days" min="1" max="30" value="20" data-hw-upper></label>
  <p class="hw-error" id="error-error">اختر أطول مدة تزيد على أقصر مدة.</p>
</fieldset>
```

```tsx live example=error
<RangeSlider
  label="مدة المعالجة"
  lowerLabel="أقصر مدة"
  upperLabel="أطول مدة"
  name="processing-days"
  min={1}
  max={30}
  defaultValue={[5, 20]}
  error="اختر أطول مدة تزيد على أقصر مدة."
/>
```

```vue live example=error
<RangeSlider
  label="مدة المعالجة"
  lower-label="أقصر مدة"
  upper-label="أطول مدة"
  name="processing-days"
  :min="1"
  :max="30"
  :default-value="[5, 20]"
  error="اختر أطول مدة تزيد على أقصر مدة."
/>
```

```ts live example=error framework=angular
import { Component } from '@angular/core';
import { HwRangeSliderComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwRangeSliderComponent],
  template: `
    <hw-range-slider
      label="مدة المعالجة"
      lowerLabel="أقصر مدة"
      upperLabel="أطول مدة"
      lowerName="processing-days"
      upperName="processing-days"
      [min]="1"
      [max]="30"
      [value]="[5, 20]"
      error="اختر أطول مدة تزيد على أقصر مدة."
    />
  `,
})
export class ExampleComponent {
}
```

### للقراءة فقط

في المجموعة المخصّصة للقراءة فقط تبقى القيمتان ظاهرتين وتُرسَلان، ويبقى المقبضان قابلين للتركيز ويحملان `aria-readonly="true"`، ولا تستطيع المفاتيح ولا المؤشر تغييرهما.

```html live example=readonly static differences=range-slider-adapter-markup
<fieldset class="hw-field hw-range-slider" data-hw="range-slider" data-hw-readonly="true">
  <legend class="hw-label">مدة المعالجة</legend>
  <label class="hw-label">أقصر مدة<input class="hw-slider" id="readonly-lower" type="range" name="processing-days" min="1" max="30" value="5" data-hw-lower></label>
  <label class="hw-label">أطول مدة<input class="hw-slider" id="readonly-upper" type="range" name="processing-days" min="1" max="30" value="20" data-hw-upper></label>
</fieldset>
```

```tsx live example=readonly
<RangeSlider
  label="مدة المعالجة"
  lowerLabel="أقصر مدة"
  upperLabel="أطول مدة"
  name="processing-days"
  min={1}
  max={30}
  defaultValue={[5, 20]}
  readOnly
/>
```

```vue live example=readonly
<RangeSlider
  label="مدة المعالجة"
  lower-label="أقصر مدة"
  upper-label="أطول مدة"
  name="processing-days"
  :min="1"
  :max="30"
  :default-value="[5, 20]"
  readonly
/>
```

```ts live example=readonly framework=angular
import { Component } from '@angular/core';
import { HwRangeSliderComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwRangeSliderComponent],
  template: `
    <hw-range-slider
      label="مدة المعالجة"
      lowerLabel="أقصر مدة"
      upperLabel="أطول مدة"
      lowerName="processing-days"
      upperName="processing-days"
      [min]="1"
      [max]="30"
      [value]="[5, 20]"
      [readOnly]="true"
    />
  `,
})
export class ExampleComponent {
}
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createRangeSlider

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `min` | `number` | `false` | — |
| `max` | `number` | `false` | — |
| `onValueChange` | `(value: [number, number]) => void` | `false` | — |
| `locale` | `string` | `false` | — |
| `formatValue` | `(value: number) => string` | `false` | — |
| `getRangeLabel` | `(lower: number, upper: number) => string` | `false` | — |

تهيّئ الدالة `createRangeSlider(root, options)` عنصر `fieldset` بالصنف `hw-range-slider`، وتفعل الدالة `enhance()` ذلك للعنصر الذي يحمل `data-hw="range-slider"`. والترميز هو الواجهة البرمجية: اكتب عنصرَي إدخال نطاق أصليين بالصنف `hw-slider`، يحمل الأول `data-hw-lower` ويحمل الثاني `data-hw-upper`، وكل منهما داخل عنصر `label` بالصنف `hw-label` يحمل نصه الظاهر، تحت عنصر `legend`. وتُقرأ `min` و`max` من عنصرَي الإدخال ما لم تُمرَّرا خيارين. ويُبقي المتحكم القيمة الدنيا مساوية للقيمة العليا أو أقل منها، ويكتب حدّ كل مقبض في `max` أو `min` للمقبض الآخر، ويحصر القيمتين في النطاق. ويتلقى العنصر الذي يحمل `data-hw-range-output` نص النطاق، الذي تُنتجه `getRangeLabel` أو توفّره الخاصية `data-hw-range-label`، ويحلّ فيه الرمزان النائبان {lower} و{upper} محل الرقمين؛ والنص مطلوب عندما يوجد ذلك العنصر. وتمنح `formatValue` كل مقبض قيمة `aria-valuetext` الخاصة به، وتنسّق أرقام نص النطاق، وتنسّق `locale` تلك الأرقام عندما لا تُمرَّر `formatValue`؛ وتضبطها الخاصية `data-hw-locale` أيضًا. وتجعل `data-hw-readonly="true"` على الجذر، أو `aria-readonly="true"`، المجموعة مخصّصة للقراءة فقط. وتتلقى `onValueChange` زوج القيمتين، ويُرسَل الحدث `hw:change` على الجذر بالتغيير نفسه. ويحتوي الكائن المُرجَع على `value` و`destroy`.

### React

جدول: خصائص RangeSlider

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `value` | `readonly [number, number]` | `false` | — |
| `defaultValue` | `readonly [number, number]` | `false` | — |
| `onValueChange` | `(value: [number, number]) => void` | `false` | — |
| `min` | `number` | `false` | `0` |
| `max` | `number` | `false` | `100` |
| `step` | `number` | `false` | — |
| `lowerLabel` | `string` | `true` | — |
| `upperLabel` | `string` | `true` | — |
| `name` | `string` | `false` | — |
| `lowerName` | `string` | `false` | — |
| `upperName` | `string` | `false` | — |
| `form` | `string` | `false` | — |
| `readOnly` | `boolean` | `false` | — |
| `required` | `boolean` | `false` | — |
| `formatValue` | `(value: number) => string` | `false` | — |
| `getRangeLabel` | `(lower: number, upper: number) => string` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |

الخاصيتان `lowerLabel` و`upperLabel` مطلوبتان، وهما التسميتان الظاهرتان للمقبضين؛ والخاصية الاختيارية `label` هي عنصر `legend` للمجموعة. وتجعل `value` مع `onValueChange` المجموعة متحكَّمًا فيها، وتتركها `defaultValue` غير متحكَّم فيها؛ وكلتاهما زوج من الأرقام، ودون أي منهما يكون الزوج أدنى قيمة وأعلى قيمة. وتحدّ `min` و`max` المقبضين كليهما، ولا يتجاوز أحد المقبضين الآخر. وتُرسل `name` القيمتين باسم واحد، بترتيب الدنيا ثم العليا، بينما تمنح `lowerName` و`upperName` كل قيمة اسمها الخاص؛ وتربط `form` عنصرَي الإدخال بنموذج في موضع آخر. وتعرض `required` العلامة في عنصر `legend` فقط، لأن HTML لا تسمح بالخاصية `required` على عنصر إدخال النطاق. وتمنح `formatValue` كل مقبض قيمة `aria-valuetext` الخاصة به، ودونها لا تكون لأي مقبض قيمة منها. وتعرض `getRangeLabel` عنصر `output` يحمل النص الظاهر الكامل للنطاق؛ ولا يُكتب أي فاصل. وتُبقي `readOnly` المقبضين قابلين للتركيز ومُرسَلين.

### Vue

جدول: خصائص RangeSlider وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `modelValue` | prop | `readonly [number, number]` | `false` | — |
| `defaultValue` | prop | `readonly [number, number]` | `false` | — |
| `lowerLabel` | prop | `string` | `true` | — |
| `upperLabel` | prop | `string` | `true` | — |
| `getRangeLabel` | prop | `(lower: number, upper: number) => string` | `false` | — |
| `name` | prop | `string` | `false` | — |
| `lowerName` | prop | `string` | `false` | — |
| `upperName` | prop | `string` | `false` | — |
| `form` | prop | `string` | `false` | — |
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
| `update:modelValue` | event | `(value: readonly [number, number]) => void` | `false` | — |

يربط `v-model` زوج القيمتين، وليس للخاصية `defaultValue` قيمة افتراضية: ودونها يكون الزوج أدنى قيمة وأعلى قيمة. والخاصيتان `lowerLabel` و`upperLabel` تسميتان ظاهرتان مطلوبتان، و`label` هي عنصر `legend` للمجموعة. وتُرسل `name` القيمتين، وتتجاوزها `lowerName` و`upperName` لمقبض واحد؛ وتصل `form` إلى عنصرَي الإدخال. وتمنح `formatValue` كل مقبض قيمة `aria-valuetext` الخاصة به، وتعرض `getRangeLabel` عنصر `output` بعد التسميتين؛ ولا يوجد عنصر `output` دونها، ولا يُكتب أي فاصل. والخاصيتان `disabled` و`readonly` منطقيتان. وتعرض `required` العلامة في عنصر `legend` فقط. ولا يسرد الجدول أي منفذ لأن الإصدار المنشور لا يقرأ أي منفذ.

### Angular

جدول: مُدخلات hw-range-slider ومخرجاته ومحتواه

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
| `value` | input | `[number, number]` | `false` | `[0, 100]` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `min` | input | `number` | `false` | `0` |
| `max` | input | `number` | `false` | `100` |
| `step` | input | `number` | `false` | `1` |
| `lowerLabel` | input | `string` | `true` | — |
| `upperLabel` | input | `string` | `true` | — |
| `lowerName` | input | `string` | `false` | `''` |
| `upperName` | input | `string` | `false` | `''` |
| `formatValue` | input | `(value: number) => string` | `false` | — |
| `getRangeLabel` | input | `(lower: number, upper: number) => string` | `false` | — |
| `valueChange` | output | `[number, number]` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |

يعرض `HwRangeSliderComponent` (`hw-range-slider`) عنصر `fieldset` وعنصر `legend` وعنصرَي إدخال النطاق مع تسميتيهما وعنصر `output` الاختياري والنص الإرشادي والخطأ، ويعمل عنصرَ تحكم في النموذج عبر موصّل القيمة الخاص به، وقيمته زوج من الأرقام؛ والقيمة null المكتوبة تعيد أدنى قيمة وأعلى قيمة. والمُدخلان `lowerLabel` و`upperLabel` تسميتان ظاهرتان مطلوبتان. ويمنح `lowerName` و`upperName` كل مقبض اسمه الخاص؛ ودونهما يُرسل `name` القيمتين بترتيب الدنيا ثم العليا. والمُدخلان `formatValue` و`getRangeLabel` مُدخلا دالتين، ويُربطان بمتغيّرين عضوين في مكوّن التطبيق؛ ويعرض `getRangeLabel` عنصر `output` بنص النطاق الكامل، ودونه لا يُعرض أي عنصر `output`. ويُرسل `valueChange` الزوج الجديد. ويُرسَل `focused` و`blurred` عندما يدخل التركيز عنصر `fieldset` وعندما يغادره؛ ولا يُرسَل شيء عند الانتقال بين المقبضين. ويتوقف المقبض الذي يحاول تجاوز الآخر عند قيمة المقبض الآخر.

## إمكانية الوصول

النطاق الرقمي عنصر `fieldset` أصلي يسمّي عنصر `legend` فيه المجموعة، وفيه عنصرا إدخال نطاق أصليان، فيوفّر المتصفح دور كل مقبض وسلوك التركيز عليه والتعامل معه من لوحة المفاتيح. ويسمّي كل مقبضٍ تسميتُه الظاهرة الخاصة به، وتمنحه `formatValue` قيمة منطوقة في `aria-valuetext`؛ ودون `formatValue` لا توجد هذه القيمة.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: نطاق رقمي

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd>، <kbd>Shift</kbd> + <kbd>Tab</kbd> | ينقل التركيز إلى المقبض التالي أو السابق، وإلى خارج المجموعة. |
| <kbd>السهم الأيسر</kbd>، <kbd>السهم الأيمن</kbd>، <kbd>السهم السفلي</kbd>، <kbd>السهم العلوي</kbd> | يغيّر قيمة المقبض الذي عليه التركيز بخطوة واحدة، كما يفعل عنصر إدخال النطاق الأصلي، إلا إذا كانت المجموعة مخصّصة للقراءة فقط. |
| <kbd>Page Up</kbd>، <kbd>Page Down</kbd> | يغيّر قيمة المقبض الذي عليه التركيز بخطوة أكبر، كما يفعل عنصر إدخال النطاق الأصلي، إلا إذا كانت المجموعة مخصّصة للقراءة فقط. |
| <kbd>Home</kbd>، <kbd>End</kbd> | ينقل المقبض الذي عليه التركيز إلى أدنى قيمة أو أعلى قيمة يمكن أن يأخذها، إلا إذا كانت المجموعة مخصّصة للقراءة فقط. |

- لا يتجاوز أحد المقبضين الآخر: يتوقف المقبض الأدنى عند القيمة العليا، ويتوقف المقبض الأعلى عند القيمة الدنيا.
- تضبط المجموعة المخصّصة للقراءة فقط `aria-readonly="true"` على المقبضين كليهما. ولا يستطيع المؤشر ولا مفاتيح الأسهم ولا المفاتيح <kbd>Home</kbd> و<kbd>End</kbd> و<kbd>Page Up</kbd> و<kbd>Page Down</kbd> تغيير القيمتين، بينما يحتفظ المفتاحان <kbd>Tab</kbd> و<kbd>Escape</kbd> والمفاتيح الأخرى بسلوكها المعتاد، فلا تحبس المجموعة التنقل بلوحة المفاتيح. وتبقى القيمتان في النموذج.
- لا تغيّر المجموعة المعطَّلة قيمتيها ولا ترسلهما.
- عنصر `output` الذي يحمل نص النطاق قراءة ظاهرة للقيمتين؛ وتوفّر `getRangeLabel` النص كاملًا.
- تعيد إعادة تعيين النموذج الزوج الأولي، وتُرسل إشعارًا واحدًا عندما تتغيّر القيمتان.
- ليس لعنصر إدخال النطاق العادي سلوك أصلي للقراءة فقط، فاستخدم المتحكم أو أحد المحوّلات عندما تحتاج إلى نطاق مخصّص للقراءة فقط.

## الاتجاه والتوطين

ليس في النطاق الرقمي نص مدمج: يكتب التطبيق عنصر `legend` وتسميتَي المقبضين و`getRangeLabel` والنص الإرشادي بلغة الصفحة. وتتبع المجموعة اتجاه الصفحة، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية.

- ليس في المكوّن تنسيق مدمج للأرقام ولا فاصل مدمج: تحدّد `formatValue` و`getRangeLabel` طريقة كتابة الرقم والنطاق، بأرقام لغة الصفحة وترتيبها. ويستطيع متحكم vanilla تنسيق أرقام نص النطاق بحسب `locale` عندما لا تُمرَّر `formatValue`.
- القيمتان المُرسَلتان رقمان مجرّدان، مستقلان عن طريقة العرض.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط النطاق الرقمي بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- يُدرج النطاق الرقمي ضمن عناصر التحكم الإضافية في نطاق المكوّنات في [ملاحظات التغطية](../coverage.md)، التي تُدرج أيضًا نوع الإدخال range الأصلي اختيارًا رقميًا ضمن نطاق محدود، يمدّه النطاق الرقمي إلى حدّين.
- يُسجَّل سلوك القراءة فقط، مع `aria-readonly` والإيماءات والمفاتيح الممنوعة والقيمتين اللتين تبقيان مُرسَلتين، في [ملاحظات عناصر التحكم المخصّصة للقراءة فقط](../readonly-inputs.md).
- تسجّل [ملاحظة متابعة التدقيق](../dga-audit-followup.md) التصحيح الذي جعل النطاق الرقمي المخصّص للقراءة فقط لا يحبس التنقل بلوحة المفاتيح؛ وتسجّل العيب وإصلاحه، لا متطلبًا من مصدر التصميم المزوَّد.
