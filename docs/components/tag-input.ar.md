---
source:
  summary: 99688716b75b
  example: 3800282c5e42
  variants-and-states: 513da0bf7d41
  api: 04e99637bece
  accessibility: dd41b7e55fb7
  rtl-and-localisation: 5ea5d4cd1b16
  platforms-code-reference: c4f3ad3a4275
---
# إدخال الوسوم

إدخال الوسوم حقل نصي يُدخل فيه القارئ عدة قيم قصيرة، تُثبَّت كل منها وسمًا قابلًا للإزالة. ويُرسَل كل وسم مثبَّت قيمةً مستقلة لحقل النموذج، ولا يُرسَل النص الذي لم يُثبَّت.

## مثال

لإدخال الوسوم تسمية ظاهرة تبيّن المعلومة المطلوبة، ونص إرشادي يبيّن للقارئ كيف يُثبَّت الوسم. ويكتب القارئ قيمة ثم يثبّتها؛ وتظهر كل قيمة مثبَّتة وسمًا معه زر يزيله. ويوفّر التطبيق `getRemoveLabel`، التي تمنح كل زر إزالة اسمه الميسّر، لأن المكوّن لا يحتوي على نص خاص به.

```html live example=basic static differences=tag-input-adapter-markup
<div class="hw-field">
  <label class="hw-label" for="basic" id="basic-label">الكلمات المفتاحية للطلب</label>
  <div class="hw-tag-input" data-hw="tag-input" data-hw-remove-label="إزالة {tag}">
    <ul data-hw-tags></ul>
    <input class="hw-input" id="basic" type="text" name="keywords" data-hw-tag-input aria-describedby="basic-hint">
  </div>
  <p class="hw-hint" id="basic-hint">اكتب كلمة مفتاحية واضغط Enter لإضافتها.</p>
</div>
```

```tsx live example=basic
<TagInput
  label="الكلمات المفتاحية للطلب"
  name="keywords"
  getRemoveLabel={(tag) => 'إزالة ' + tag}
  hint="اكتب كلمة مفتاحية واضغط Enter لإضافتها."
/>
```

```vue live example=basic
<TagInput
  label="الكلمات المفتاحية للطلب"
  name="keywords"
  :get-remove-label="(tag) => 'إزالة ' + tag"
  hint="اكتب كلمة مفتاحية واضغط Enter لإضافتها."
/>
```

```ts live example=basic framework=angular
import { Component } from '@angular/core';
import { HwTagInputComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwTagInputComponent],
  template: `
    <hw-tag-input
      label="الكلمات المفتاحية للطلب"
      name="keywords"
      controlId="basic"
      [getRemoveLabel]="removeLabel"
      hint="اكتب كلمة مفتاحية واضغط Enter لإضافتها."
    />
  `,
})
export class ExampleComponent {
  readonly removeLabel = (tag: string) => 'إزالة ' + tag;
}
```

## الأشكال والحالات

### وسوم موجودة

تضبط `defaultValue` الوسوم الأولية لحقل غير متحكَّم فيه في React وVue، وتضبطها `value` في Angular؛ ويقرؤها ترميز vanilla من الخيار `value` أو من الخاصية `data-hw-value` مصفوفةَ JSON من السلاسل النصية.

```html live example=tags static differences=tag-input-adapter-markup
<div class="hw-field">
  <label class="hw-label" for="tags" id="tags-label">الكلمات المفتاحية للطلب</label>
  <div class="hw-tag-input" data-hw="tag-input" data-hw-remove-label="إزالة {tag}" data-hw-value='["تجديد","عاجل"]'>
    <ul data-hw-tags></ul>
    <input class="hw-input" id="tags" type="text" name="keywords" data-hw-tag-input aria-describedby="tags-hint">
  </div>
  <p class="hw-hint" id="tags-hint">اكتب كلمة مفتاحية واضغط Enter لإضافتها.</p>
</div>
```

```tsx live example=tags
<TagInput
  label="الكلمات المفتاحية للطلب"
  name="keywords"
  getRemoveLabel={(tag) => 'إزالة ' + tag}
  hint="اكتب كلمة مفتاحية واضغط Enter لإضافتها."
  defaultValue={['تجديد', 'عاجل']}
/>
```

```vue live example=tags
<TagInput
  label="الكلمات المفتاحية للطلب"
  name="keywords"
  :get-remove-label="(tag) => 'إزالة ' + tag"
  hint="اكتب كلمة مفتاحية واضغط Enter لإضافتها."
  :default-value="['تجديد', 'عاجل']"
/>
```

```ts live example=tags framework=angular
import { Component } from '@angular/core';
import { HwTagInputComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwTagInputComponent],
  template: `
    <hw-tag-input
      label="الكلمات المفتاحية للطلب"
      name="keywords"
      controlId="tags"
      [getRemoveLabel]="removeLabel"
      hint="اكتب كلمة مفتاحية واضغط Enter لإضافتها."
      [value]="['تجديد', 'عاجل']"
    />
  `,
})
export class ExampleComponent {
  readonly removeLabel = (tag: string) => 'إزالة ' + tag;
}
```

### الخطأ

يظهر الخطأ في فقرة بعد الحقل، ويحمل عنصر الإدخال النصي الخاصية `aria-invalid="true"`، وتصفه الرسالة. وتذكر الرسالة ما الخطأ وكيف يُصحَّح.

```html live example=error static differences=tag-input-adapter-markup
<div class="hw-field">
  <label class="hw-label" for="error" id="error-label">الكلمات المفتاحية للطلب</label>
  <div class="hw-tag-input" data-hw="tag-input" data-hw-remove-label="إزالة {tag}">
    <ul data-hw-tags></ul>
    <input class="hw-input" id="error" type="text" name="keywords" data-hw-tag-input aria-describedby="error-error" aria-invalid="true">
  </div>
  <p class="hw-error" id="error-error">أضف كلمة مفتاحية واحدة على الأقل.</p>
</div>
```

```tsx live example=error
<TagInput
  label="الكلمات المفتاحية للطلب"
  name="keywords"
  getRemoveLabel={(tag) => 'إزالة ' + tag}
  error="أضف كلمة مفتاحية واحدة على الأقل."
/>
```

```vue live example=error
<TagInput
  label="الكلمات المفتاحية للطلب"
  name="keywords"
  :get-remove-label="(tag) => 'إزالة ' + tag"
  error="أضف كلمة مفتاحية واحدة على الأقل."
/>
```

```ts live example=error framework=angular
import { Component } from '@angular/core';
import { HwTagInputComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwTagInputComponent],
  template: `
    <hw-tag-input
      label="الكلمات المفتاحية للطلب"
      name="keywords"
      controlId="error"
      [getRemoveLabel]="removeLabel"
      error="أضف كلمة مفتاحية واحدة على الأقل."
    />
  `,
})
export class ExampleComponent {
  readonly removeLabel = (tag: string) => 'إزالة ' + tag;
}
```

### للقراءة فقط

يحتفظ الحقل المخصّص للقراءة فقط بوسومه في النموذج، ويبقى قابلًا للتركيز، لكن القارئ لا يستطيع إضافة وسم ولا إزالته: فأزرار الإزالة معطَّلة.

```html live example=readonly static differences=tag-input-adapter-markup
<div class="hw-field">
  <label class="hw-label" for="readonly" id="readonly-label">الكلمات المفتاحية للطلب</label>
  <div class="hw-tag-input" data-hw="tag-input" data-hw-remove-label="إزالة {tag}" data-hw-value='["تجديد","عاجل"]'>
    <ul data-hw-tags></ul>
    <input class="hw-input" id="readonly" type="text" name="keywords" data-hw-tag-input readonly>
  </div>
</div>
```

```tsx live example=readonly
<TagInput
  label="الكلمات المفتاحية للطلب"
  name="keywords"
  getRemoveLabel={(tag) => 'إزالة ' + tag}
  defaultValue={['تجديد', 'عاجل']}
  readOnly
/>
```

```vue live example=readonly
<TagInput
  label="الكلمات المفتاحية للطلب"
  name="keywords"
  :get-remove-label="(tag) => 'إزالة ' + tag"
  :default-value="['تجديد', 'عاجل']"
  readonly
/>
```

```ts live example=readonly framework=angular
import { Component } from '@angular/core';
import { HwTagInputComponent } from '@hawiyah/angular';

@Component({
  selector: 'app-example',
  imports: [HwTagInputComponent],
  template: `
    <hw-tag-input
      label="الكلمات المفتاحية للطلب"
      name="keywords"
      controlId="readonly"
      [getRemoveLabel]="removeLabel"
      [value]="['تجديد', 'عاجل']"
      [readOnly]="true"
    />
  `,
})
export class ExampleComponent {
  readonly removeLabel = (tag: string) => 'إزالة ' + tag;
}
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createTagInput

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `value` | `readonly string[]` | `false` | — |
| `name` | `string` | `false` | — |
| `onValueChange` | `(values: string[]) => void` | `false` | — |
| `getRemoveLabel` | `(tag: string) => string` | `false` | — |
| `requiredMessage` | `string` | `false` | — |

تهيّئ الدالة `createTagInput(root, options)` عنصرًا بالصنف `hw-tag-input`، وتفعل الدالة `enhance()` ذلك للعنصر الذي يحمل `data-hw="tag-input"`. والترميز هو الواجهة البرمجية: اكتب داخل الجذر عنصر `ul` يحمل `data-hw-tags`، ويملؤه المتحكم بالوسوم، وعنصر إدخال نصي أصليًا يحمل `data-hw-tag-input`؛ وتبقى التسمية والنص الإرشادي خارج الجذر، في العنصر الذي يحمل الصنف `hw-field`. و`getRemoveLabel` نص مطلوب، يُمرَّر خيارًا أو في الخاصية `data-hw-remove-label`، ويحلّ فيه الرمز النائب {tag} محل الوسم. وتضبط `value` الوسوم الأولية، وإلا يقرأ الجذر `data-hw-value` مصفوفةَ JSON من السلاسل النصية؛ و`name` اسم حقل النموذج، وإلا يقرأ الجذر `data-hw-name`، وإلا `name` عنصر الإدخال، فيزيله المتحكم حينئذٍ من عنصر الإدخال ويكتبه على عنصر إدخال مخفي لكل وسم. و`requiredMessage` مطلوب عندما يحمل عنصر الإدخال `required`: فيزيل المتحكم الخاصية الأصلية، ويضبط `aria-required`، ويطبّق القيد تحققًا مخصّصًا من الصلاحية. وتتلقى `onValueChange` مصفوفة الوسوم، ويُرسَل الحدث `hw:change` على الجذر بالتغيير نفسه. ويحمل الكائن المُرجَع الوسوم الحالية في `value`، ويوفّر دالة لإضافة وسم، ودالة لإزالة وسم، ودالة لإزالة التهيئة.

### React

جدول: خصائص TagInput

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `value` | `readonly string[]` | `false` | — |
| `defaultValue` | `readonly string[]` | `false` | `[]` |
| `onValueChange` | `(value: string[]) => void` | `false` | — |
| `getRemoveLabel` | `(tag: string) => string` | `true` | — |
| `label` | `ReactNode` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |
| `required` | `boolean` | `false` | — |
| `requiredMessage` | `string` | `false` | — |

الخاصية `getRemoveLabel` مطلوبة، لأن المكوّن لا يحتوي على كلمات خاصة به؛ وتُرجع الاسم الميسّر لزر إزالة الوسم. وتجعل `value` مع `onValueChange` الحقل متحكَّمًا فيه، وتتركه `defaultValue` غير متحكَّم فيه؛ وكلتاهما مصفوفة من السلاسل النصية. والخصائص `label` و`hint` و`error` محتوى React قابل للعرض. وتُكتب `name` على عنصر إدخال مخفي لكل وسم مثبَّت، وتربطها `form` بنموذج في موضع آخر. وتحتاج `required` إلى `requiredMessage`، ويُشرح الشرط في النص الإرشادي، ولا تفي به إلا الوسوم المثبَّتة: فلا تُكتب الخاصية الأصلية على عنصر الإدخال النصي، الذي يحمل `aria-required` بدلًا منها. وتصل خصائص عنصر الإدخال الأصلي الأخرى، ومنها `placeholder` و`disabled` و`readOnly` و`ref`، إلى عنصر الإدخال النصي، فيصل المرجع إلى عنصر الإدخال لا إلى الوسوم.

### Vue

جدول: خصائص TagInput وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `requiredMessage` | prop | `string` | `false` | — |
| `getRemoveLabel` | prop | `(tag: string) => string` | `true` | — |
| `modelValue` | prop | `readonly string[]` | `false` | — |
| `defaultValue` | prop | `readonly string[]` | `false` | — |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: readonly string[]) => void` | `false` | — |

يربط `v-model` مصفوفة الوسوم، وتضبط الخاصية `defaultValue` الوسوم الأولية لحقل غير متحكَّم فيه. والخاصية `getRemoveLabel` مطلوبة، وتُرجع الاسم الميسّر لزر إزالة الوسم. وتحتاج `required` إلى `requiredMessage`؛ ولا تفي بالقيد إلا الوسوم المثبَّتة، فاشرحه في `hint`. والخاصيتان `disabled` و`readonly` منطقيتان، وتكون أزرار الإزالة معطَّلة ما دامت إحداهما مضبوطة. وتصل الخصائص الأخرى، مثل `name` و`placeholder`، إلى المكوّن؛ وتُكتب `name` على عنصر إدخال مخفي لكل وسم. ولا يسرد الجدول أي منفذ لأن الإصدار المنشور لا يقرأ أي منفذ.

### Angular

جدول: مُدخلات hw-tag-input ومخرجاته ومحتواه

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
| `value` | input | `string[]` | `false` | `[]` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `placeholder` | input | `string` | `false` | `''` |
| `getRemoveLabel` | input | `(tag: string) => string` | `true` | — |
| `requiredMessage` | input | `string` | `false` | `''` |
| `valueChange` | output | `string[]` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |

يعرض `HwTagInputComponent` (`hw-tag-input`) الحقل والتسمية وقائمة الوسوم وعنصر الإدخال النصي والنص الإرشادي والخطأ، ويعمل عنصرَ تحكم في النموذج عبر موصّل القيمة الخاص به، وقيمته من النوع `string[]`. والمُدخل `getRemoveLabel` مطلوب، ويُربط بمتغيّر عضو في مكوّن التطبيق. و`requiredMessage` مطلوب مع `required`. ويُرسل `valueChange` مصفوفة الوسوم الجديدة. ويُرسَل `focused` و`blurred` عند التركيز الأصلي على عنصر الإدخال النصي وعند فقدانه. وتسمّي `aria-label` و`aria-labelledby` عنصر الإدخال عندما لا يُمرَّر `label`. وتُكتب `name` على عنصر إدخال مخفي لكل وسم، ويقع في بند القائمة الخاص بالوسم.

## إمكانية الوصول

عنصر الإدخال النصي عنصر إدخال أصلي، فيوفّر المتصفح دوره وتحرير النص فيه. والوسوم بنود في قائمة، وكل زر إزالة عنصر `button` أصلي تسمّيه `getRemoveLabel`. والتسمية عنصر `label` أصلي تشير خاصيته `for` إلى عنصر الإدخال، ويصفه النص الإرشادي والخطأ.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: إدخال الوسوم

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Enter</kbd> | يثبّت نص عنصر الإدخال وسمًا بعد حذف المسافات من طرفيه، إذا لم يكن فارغًا ولم يكن وسمًا موجودًا؛ وعلى زر إزالة عليه التركيز، يزيل ذلك الوسم. |
| <kbd>Backspace</kbd> | عندما يكون عنصر الإدخال النصي فارغًا، يزيل آخر وسم ويُبقي التركيز في عنصر الإدخال. |
| <kbd>Space</kbd> | على زر إزالة عليه التركيز، يزيل ذلك الوسم. |
| <kbd>Tab</kbd>، <kbd>Shift</kbd> + <kbd>Tab</kbd> | ينقل التركيز بين أزرار الإزالة وعنصر الإدخال النصي بترتيب القراءة. |

- تثبّت الفاصلة أيضًا نص عنصر الإدخال. وليس في المكوّن زر للإضافة.
- لا يعمل التثبيت ولا المفتاح <kbd>Backspace</kbd> ما دام المفتاح Control أو Alt أو Meta مضغوطًا، أو في أثناء تركيب النص بمحرّر أسلوب الإدخال، أو عندما يكون التطبيق قد منع حدث المفتاح. ويُترك المفتاح <kbd>Enter</kbd> في عنصر إدخال فارغ للنموذج الذي يملك الحقل.
- ينقل تفعيل زر الإزالة التركيز إلى زر إزالة الوسم التالي، وإلا فإلى زر إزالة الوسم السابق، وإلا فإلى عنصر الإدخال النصي.
- لا تفي بالحقل المطلوب إلا الوسوم المثبَّتة، ولا يُرسَل غيرها؛ فالنص الذي لم يُثبَّت لا يفي به. والتحقق المخصّص من الصلاحية لعنصر الإدخال النصي، الذي يعرض `aria-required`.
- بعد إرسال فاشل يحمل عنصر الإدخال النصي الخاصية `aria-invalid="true"` حتى يصل الحقل إلى حالة صالحة أو يُعاد تعيين النموذج.
- يعرض الحقل المخصّص للقراءة فقط والحقل المعطَّل أزرار الإزالة معطَّلة، ولا يضيف أي منهما وسمًا ولا يزيله، ومن ذلك الحقل الموجود داخل عنصر `fieldset` معطَّل.
- تعيد إعادة تعيين النموذج الوسوم الأولية، وتُفرغ النص الذي لم يُثبَّت، وتُرسل إشعارًا واحدًا عندما تتغيّر الوسوم.

## الاتجاه والتوطين

ليس في إدخال الوسوم نص مدمج: يكتب التطبيق التسمية والنص الإرشادي والخطأ والنص النائب و`getRemoveLabel` و`requiredMessage` بلغة الصفحة. ويتبع الحقل اتجاه الصفحة، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية.

- الوسم هو النص الذي كتبه القارئ؛ فلا يترجمه المكوّن، ولا يغيّر حالة أحرفه، ولا يعيد ترتيبه، والقيمة المُرسَلة هي النص بعد حذف المسافات من طرفيه.
- اكتب `getRemoveLabel` بحيث يذكر الاسم الميسّر الإجراء والوسم بلغة الصفحة، مع وضع الوسم في الموضع الذي تقتضيه قواعد اللغة، ومن ذلك الرمز النائب {tag} في خاصية vanilla.
- لا ترتبط المفاتيح التي تثبّت الوسم وتزيل آخر وسم باتجاه القراءة.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط إدخال الوسوم بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- يُدرج إدخال الوسوم ضمن عناصر التحكم الإضافية في نطاق المكوّنات في [ملاحظات التغطية](../coverage.md).
- مفاتيح التثبيت، وإزالة آخر وسم، والتركيز الذي يلي الإزالة، وقاعدة الحقل المطلوب للوسوم المثبَّتة، وسلوك إعادة التعيين، هي سلوك هوية المسجَّل في [ملاحظة التفاعل](../tag-input-interaction.md). وتذكر الملاحظة أن هذه واجهات متصفح وإدخال جرى التحقق منها، وليست متطلبات مستنتجة من مصدر التصميم.
