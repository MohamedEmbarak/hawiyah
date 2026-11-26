---
source:
  summary: 4d377e7e00c8
  example: 2483583abc5f
  variants-and-states: 9391b30e3cc9
  api: 5edfaedb2d7e
  accessibility: 22e7637f28ae
  rtl-and-localisation: d0598517e3bc
  platforms-code-reference: 6fbfb0c888e6
---
# مجموعة تبديل

مجموعة التبديل مجموعة من الخيارات تُعرض أجزاءً متصلة. وتحدّد المجموعة افتراضيًا خيارًا واحدًا بأزرار اختيار أصلية، ومع `multiple` تعرض أزرارًا تكون مضغوطة أو غير مضغوطة، وتُرسل كل قيمة مضغوطة.

## مثال

للمجموعة عنوان ظاهر يسمّي الاختيار المطلوب. وفي وضع التحديد الفردي الافتراضي يكون كل خيار زر اختيار أصليًا داخل تسمية، فلا يُحدَّد أكثر من خيار واحد، وتُرسل المجموعة قيمة ذلك الخيار باسمها.

```html live example=basic static differences=toggle-group-adapter-markup
<fieldset class="hw-toggle-group" data-hw="toggle-group" aria-describedby="basic-contact-hint">
  <legend class="hw-label">وسيلة التواصل المفضّلة</legend>
  <label><input type="radio" name="basic-contact" value="email" checked>البريد الإلكتروني</label>
  <label><input type="radio" name="basic-contact" value="phone">الهاتف</label>
  <label><input type="radio" name="basic-contact" value="post">البريد العادي</label>
  <p class="hw-hint" id="basic-contact-hint">اختر الطريقة التي يردّ بها المكتب على الطلب.</p>
</fieldset>
```

```tsx live example=basic
<ToggleGroup label="وسيلة التواصل المفضّلة" name="basic-contact" defaultValue="email" options={[{ value: 'email', label: 'البريد الإلكتروني' }, { value: 'phone', label: 'الهاتف' }, { value: 'post', label: 'البريد العادي' }]} hint="اختر الطريقة التي يردّ بها المكتب على الطلب." />
```

```vue live example=basic
<ToggleGroup label="وسيلة التواصل المفضّلة" name="basic-contact" default-value="email" :options="[{ value: 'email', label: 'البريد الإلكتروني' }, { value: 'phone', label: 'الهاتف' }, { value: 'post', label: 'البريد العادي' }]" hint="اختر الطريقة التي يردّ بها المكتب على الطلب." />
```

```ts live example=basic framework=angular
template: `<hw-toggle-group label="وسيلة التواصل المفضّلة" name="basic-contact" value="email" [options]="[{ value: 'email', label: 'البريد الإلكتروني' }, { value: 'phone', label: 'الهاتف' }, { value: 'post', label: 'البريد العادي' }]" hint="اختر الطريقة التي يردّ بها المكتب على الطلب." />`
```

## الأشكال والحالات

### التحديد المتعدد

مع `multiple` يكون كل خيار زرًا يحمل `aria-pressed`، والقيمة مصفوفة بقيم الخيارات المضغوطة. ويتلقى النموذج إدخالًا واحدًا لكل قيمة مضغوطة باسم المجموعة.

```html live example=multiple static differences=toggle-group-adapter-markup
<fieldset class="hw-toggle-group" data-hw="toggle-group" data-hw-multiple="true" data-hw-name="notices">
  <legend class="hw-label">الإشعارات</legend>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-value="status" aria-pressed="true">تغييرات الحالة</button>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-value="documents" aria-pressed="false">طلبات المستندات</button>
  <button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-value="reminders" aria-pressed="false">التذكيرات</button>
</fieldset>
```

```tsx live example=multiple
<ToggleGroup label="الإشعارات" name="notices" multiple defaultValue={['status']} options={[{ value: 'status', label: 'تغييرات الحالة' }, { value: 'documents', label: 'طلبات المستندات' }, { value: 'reminders', label: 'التذكيرات' }]} />
```

```vue live example=multiple
<ToggleGroup label="الإشعارات" name="notices" multiple :default-value="['status']" :options="[{ value: 'status', label: 'تغييرات الحالة' }, { value: 'documents', label: 'طلبات المستندات' }, { value: 'reminders', label: 'التذكيرات' }]" />
```

```ts live example=multiple framework=angular
template: `<hw-toggle-group label="الإشعارات" name="notices" [multiple]="true" [value]="['status']" [options]="[{ value: 'status', label: 'تغييرات الحالة' }, { value: 'documents', label: 'طلبات المستندات' }, { value: 'reminders', label: 'التذكيرات' }]" />`
```

### المظهر ذو الإطار

دون شكل تعرض المجموعة خياراتها أجزاءً متصلة. ويضبط `variant="outline"` المظهر ذا الإطار، وتفعل الخاصية `data-variant="outline"` على الجذر الشيء نفسه في الترميز.

```html live example=outline static differences=toggle-group-adapter-markup
<fieldset class="hw-toggle-group" data-hw="toggle-group" data-variant="outline">
  <legend class="hw-label">وسيلة التواصل المفضّلة</legend>
  <label><input type="radio" name="outline-contact" value="email">البريد الإلكتروني</label>
  <label><input type="radio" name="outline-contact" value="phone" checked>الهاتف</label>
  <label><input type="radio" name="outline-contact" value="post">البريد العادي</label>
</fieldset>
```

```tsx live example=outline
<ToggleGroup label="وسيلة التواصل المفضّلة" name="outline-contact" defaultValue="phone" options={[{ value: 'email', label: 'البريد الإلكتروني' }, { value: 'phone', label: 'الهاتف' }, { value: 'post', label: 'البريد العادي' }]} variant="outline" />
```

```vue live example=outline
<ToggleGroup label="وسيلة التواصل المفضّلة" name="outline-contact" default-value="phone" :options="[{ value: 'email', label: 'البريد الإلكتروني' }, { value: 'phone', label: 'الهاتف' }, { value: 'post', label: 'البريد العادي' }]" variant="outline" />
```

```ts live example=outline framework=angular
template: `<hw-toggle-group label="وسيلة التواصل المفضّلة" name="outline-contact" value="phone" [options]="[{ value: 'email', label: 'البريد الإلكتروني' }, { value: 'phone', label: 'الهاتف' }, { value: 'post', label: 'البريد العادي' }]" variant="outline" />`
```

### للقراءة فقط

تُبقي المجموعة المخصّصة للقراءة فقط خياراتها قابلة للتركيز وقيمتها المحدَّدة في النموذج، لكن القارئ لا يستطيع تغيير التحديد.

```html live example=readonly static differences=toggle-group-adapter-markup
<fieldset class="hw-toggle-group" data-hw="toggle-group" data-hw-readonly="true">
  <legend class="hw-label">وسيلة التواصل المفضّلة</legend>
  <label><input type="radio" name="readonly-contact" value="email">البريد الإلكتروني</label>
  <label><input type="radio" name="readonly-contact" value="phone">الهاتف</label>
  <label><input type="radio" name="readonly-contact" value="post" checked>البريد العادي</label>
</fieldset>
```

```tsx live example=readonly
<ToggleGroup label="وسيلة التواصل المفضّلة" name="readonly-contact" defaultValue="post" options={[{ value: 'email', label: 'البريد الإلكتروني' }, { value: 'phone', label: 'الهاتف' }, { value: 'post', label: 'البريد العادي' }]} readOnly />
```

```vue live example=readonly
<ToggleGroup label="وسيلة التواصل المفضّلة" name="readonly-contact" default-value="post" :options="[{ value: 'email', label: 'البريد الإلكتروني' }, { value: 'phone', label: 'الهاتف' }, { value: 'post', label: 'البريد العادي' }]" readonly />
```

```ts live example=readonly framework=angular
template: `<hw-toggle-group label="وسيلة التواصل المفضّلة" name="readonly-contact" value="post" [options]="[{ value: 'email', label: 'البريد الإلكتروني' }, { value: 'phone', label: 'الهاتف' }, { value: 'post', label: 'البريد العادي' }]" [readOnly]="true" />`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createToggleGroup

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `multiple` | `boolean` | `false` | — |
| `name` | `string` | `false` | — |
| `value` | `string \| readonly string[]` | `false` | — |
| `onValueChange` | `(value: string \| string[]) => void` | `false` | — |

الدالة `createToggleGroup(root, options)` متحكم لعنصر `fieldset` بالصنف `hw-toggle-group`. وفي وضع التحديد الفردي يكون كل خيار عنصر `label` يضمّ زر اختيار أصليًا يليه نصه، دون خاصية `class` ودون عنصر `span`؛ والقيمة الفارغة هي السلسلة النصية الفارغة. وعند تمرير `multiple` يكون كل خيار زرًا بالصنف `hw-button` يحمل `data-variant="secondary"` و`data-size="md"` و`data-hw-value` و`aria-pressed`؛ والقيمة الفارغة مصفوفة فارغة، وتُرسَل كل قيمة مضغوطة في عنصر إدخال مخفي باسم `name` أو `data-hw-name`. ولا يُفرض `required` في وضع التحديد المتعدد. وتحمل المجموعة المخصّصة للقراءة فقط الخاصية `data-hw-readonly="true"`. ويُرجع المتحكم `select` و`value` و`destroy`، وتتلقى `onValueChange` السلسلة النصية، أو المصفوفة في وضع التحديد المتعدد. ولا تنشر الخيارات قيمًا افتراضية في الإصدار 0.3.0: فيكون `multiple` غير مفعَّل عند غيابه، وتفعّله في الترميز الخاصية `data-hw-multiple="true"` على الجذر. وتعيد إعادة تعيين النموذج الأصلية المجموعةَ إلى التحديد المكتوب في الترميز، وتستدعي `onValueChange` مرة واحدة عندما يتغيّر التحديد.

### React

جدول: خصائص ToggleGroup

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `form` | `string` | `false` | — |
| `name` | `string` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `options` | `readonly Option[]` | `true` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |
| `required` | `boolean` | `false` | — |
| `readOnly` | `boolean` | `false` | — |
| `variant` | `'segmented' \| 'outline'` | `false` | `'segmented'` |
| `labelHidden` | `boolean` | `false` | `false` |
| `multiple` | `boolean` | `false` | — |
| `value` | `string \| readonly string[]` | `false` | — |
| `defaultValue` | `string \| readonly string[]` | `false` | — |
| `onValueChange` | `((value: string) => void) \| ((value: string[]) => void)` | `false` | — |

الخاصية `options` مطلوبة، وتضمّ كائنات فيها `value` و`label` والحقل الاختياري `disabled`. والخاصية `label` هي عنوان المجموعة وتسمّيها؛ ودونها لا يُعرض عنوان ويصدر تحذير، ما لم تسمِّ `aria-label` أو `aria-labelledby` المجموعة. مرّر `value` مع `onValueChange` لمجموعة متحكَّم فيها، أو `defaultValue` لمجموعة غير متحكَّم فيها؛ والقيمة سلسلة نصية، أو مصفوفة سلاسل نصية مع `multiple`، وتتلقى `onValueChange` النوع نفسه. والقيمة الافتراضية لـ`variant` هي `'segmented'`، ولـ`labelHidden` هي `false`؛ وتُخفي `labelHidden` العنوان بصريًا ويبقى هو الاسم الميسّر، فلا تستخدمها إلا عندما تُظهر نصوص الخيارات الغرض من المجموعة. ويُعرض `hint` و`error` فقرتين بعد الخيارات ويصفان المجموعة، وتضبط الخاصية `error` غير الفارغة `aria-invalid` على المجموعة. وتنطبق `required` على التحديد الفردي: تحمل أزرار الاختيار `required`، ويعرض العنوان علامة الحقل المطلوب. وتصل `name` و`form` إلى عناصر الإدخال، وتصل `readOnly` إلى الخيارات.

### Vue

جدول: خصائص ToggleGroup وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `options` | prop | `readonly Option[]` | `true` | — |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | `false` |
| `name` | prop | `string` | `false` | — |
| `form` | prop | `string` | `false` | — |
| `modelValue` | prop | `string \| readonly string[]` | `false` | — |
| `defaultValue` | prop | `string \| readonly string[]` | `false` | — |
| `multiple` | prop | `boolean` | `false` | `false` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `labelHidden` | prop | `boolean` | `false` | `false` |
| `variant` | prop | `'segmented' \| 'outline'` | `false` | `'segmented'` |
| `update:modelValue` | event | `(value: string \| readonly string[]) => void` | `false` | — |

الخاصية `options` مطلوبة، وتضمّ كائنات فيها `value` و`label` والحقل الاختياري `disabled`. ويربط `v-model` القيمة، وهي سلسلة نصية، أو مصفوفة سلاسل نصية مع `multiple`، ويُرسل المكوّن الحدث `update:modelValue` بالقيمة الجديدة. وليس لـ`defaultValue` قيمة افتراضية: فالقيمة الفارغة هي السلسلة النصية الفارغة، أو مصفوفة فارغة في وضع التحديد المتعدد. والخاصية `label` هي عنوان المجموعة وتسمّيها ما لم تسمِّها `aria-label` أو `aria-labelledby`؛ وتُخفي `labelHidden` العنوان بصريًا ويبقى هو الاسم الميسّر. والقيمة الافتراضية لـ`variant` هي `'segmented'`. وتنطبق `required` على التحديد الفردي، والقيمة الافتراضية لكل من `multiple` و`disabled` و`readonly` هي `false`؛ وتحمل الخيارات المخصّصة للقراءة فقط `aria-disabled`، ويحمل عنصر `fieldset` الخاصية `data-hw-readonly`. وتصل `name` و`form` إلى أزرار الاختيار وعناصر الإدخال المخفية، ولا تصلان أبدًا إلى عنصر `fieldset`. ويأتي `hint` و`error` بعد الخيارات. وتعيد إعادة تعيين النموذج القيمة إلى `defaultValue`، ويُرسل المكوّن الحدث `update:modelValue` مرة واحدة، وفقط عندما تغيّر إعادة التعيين القيمة.

### Angular

جدول: مُدخلات hw-toggle-group ومخرجاته ومحتواه

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
| `value` | input | `string \| string[]` | `false` | `''` |
| `readOnly` | input | `boolean` | `false` | `false` |
| `labelHidden` | input | `boolean` | `false` | `false` |
| `options` | input | `readonly Option[]` | `true` | — |
| `multiple` | input | `boolean` | `false` | `false` |
| `variant` | input | `'segmented' \| 'outline'` | `false` | `'segmented'` |
| `valueChange` | output | `string \| string[]` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |

يعرض `HwToggleGroupComponent` (`hw-toggle-group`) عنصر `fieldset` مع عنصر `legend`. ويربط `[(value)]` ربطًا ثنائي الاتجاه سلسلةً نصية، أو مصفوفة سلاسل نصية مع `multiple`، ويُرسلها المُخرج `valueChange`؛ ويعمل المكوّن أيضًا عنصرَ تحكم في النموذج. والمُدخل `label` مطلوب ما لم تسمِّ `aria-label` أو `aria-labelledby` المجموعة؛ ودون اسم لا يُعرض عنوان ويُبلَّغ عن تحذير. والقيمة الافتراضية لـ`labelHidden` هي `false`، ولـ`variant` هي `'segmented'`، ولكل من `multiple` و`disabled` و`readOnly` هي `false`. وينطبق `required` على التحديد الفردي: تحمل أزرار الاختيار `required`، ويعرض العنوان علامة الحقل المطلوب، ويضبط الإرسال الفاشل `aria-invalid` على عنصر `fieldset` إلى أن يُختار خيار أو يُعاد تعيين النموذج. ولا يُفرض `required` في وضع التحديد المتعدد، فاستخدم `error` أو نصًا إرشاديًا لذكر الحد الأدنى. ولا يُنشئ العنصر المضيف صندوقًا في التخطيط، فيكون عنصر `fieldset` هو عنصر التخطيط. وتُرسل إعادة التعيين التحديد الأولي مرة واحدة عندما يتغيّر.

## إمكانية الوصول

المجموعة عنصر `fieldset` أصلي، وعنوانها هو الاسم الميسّر للمجموعة. وفي وضع التحديد الفردي تكون الخيارات أزرار اختيار أصلية، فيوفّر المتصفح أدوارها وتحديدها والتعامل مع لوحة المفاتيح. وفي وضع التحديد المتعدد يكون كل خيار زرًا أصليًا يحمل `aria-pressed`، ويحتفظ كل زر بموضعه الخاص في ترتيب التنقل بالمفتاح Tab. وتبقى المجموعة المخصّصة للقراءة فقط قابلة للتركيز وتُرسَل قيمتها المحدَّدة، لكن التحديد بالنقر أو بالمفاتيح ممنوع؛ ولا تُرسل المجموعة المعطَّلة شيئًا.

يُرسم مؤشر تركيز ظاهر داخل الجزء، وكذلك على الخيار المخصّص للقراءة فقط، وتُبقي ورقة الأنماط حالات التحديد والتعطيل والتركيز متمايزة في وضع الألوان القسرية، وتلغي الانتقالات المتحرّكة للخيارات عندما يطلب القارئ تقليل الحركة. ويصف `hint` و`error` المجموعة، والعنوان هو الاسم الوحيد للمجموعة، فاكتبه في صيغة السؤال الذي تجيب عنه الخيارات.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: مجموعة تبديل

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | في وضع التحديد الفردي، ينقل التركيز إلى المجموعة على الخيار المحدَّد، أو على الخيار الأول إذا لم يكن أي خيار محدَّدًا، ثم إلى عنصر التحكم التالي. |
| <kbd>السهم الأيسر</kbd>، <kbd>السهم الأيمن</kbd>، <kbd>السهم السفلي</kbd>، <kbd>السهم العلوي</kbd> | في وضع التحديد الفردي، ينقل التركيز إلى خيار آخر ويحدّده، كما تفعل أزرار الاختيار الأصلية. |
| <kbd>Space</kbd> | يحدّد زر الاختيار الذي عليه التركيز في وضع التحديد الفردي، ويضغط الزر الذي عليه التركيز أو يلغي ضغطه في وضع التحديد المتعدد. |
| <kbd>Enter</kbd> | يضغط الزر الذي عليه التركيز أو يلغي ضغطه في وضع التحديد المتعدد. |

## الاتجاه والتوطين

ليس في المكوّن نص مدمج: يُكتب عنوان المجموعة وتسميات الخيارات والنص الإرشادي والخطأ بلغة الصفحة. وتستخدم الأجزاء وفواصلها وزواياها الخارجية خصائص CSS المنطقية، فتتبع المجموعة اتجاه القراءة في الصفحة، ويقع الخيار الأول في بداية السطر. وتبقى قيم الخيارات كما كُتبت، مستقلة عن اللغة والاتجاه.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط مجموعة التبديل بكود المنصات. وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات عناصر التحكم المجزّأة](../nic-segmented.md) هندسة الأجزاء، وحالات التحديد والمرور بالمؤشر والتركيز، والمقاسات على الأجهزة المحمولة، والتصحيحات التي أُجريت لحالتي التعطيل والتركيز، وتذكر درجة الثقة في كل ربط.
- يُدرج زر الاختيار الأصلي الذي يستخدمه التحديد الفردي ضمن أنواع الإدخال الأصلية في [ملاحظات التغطية](../coverage.md).
