---
source:
  summary: 3d0ed8eb66b7
  example: d90cf1d9aa4b
  variants-and-states: 9b693dfea695
  api: c68a7eea9a78
  accessibility: 66358ca822c7
  rtl-and-localisation: e499c7e85396
  platforms-code-reference: 414161a516eb
---
# حقل بحث

حقل البحث عنصر إدخال للبحث بنص حرّ له تسمية، وفيه إجراء داخلي يمسح عبارة البحث، ومعه اقتراحات محلية اختيارية وزر بحث اختياري. ويُجري التطبيق البحث؛ فلا يفعل الحقل إلا الاحتفاظ بعبارة البحث والإبلاغ عنها.

## مثال

للحقل تسمية ظاهرة. وعندما لا تكون عبارة البحث فارغة، يظهر زر المسح في نهاية عنصر الإدخال؛ واسمه هو `clearLabel` الذي يوفّره التطبيق. ويُفرغ المسحُ عبارة البحث، ويعيد التركيز إلى عنصر الإدخال، ولا يُرسل النموذج.

```html live example=basic static differences=search-field-adapter-markup
<div class="hw-field hw-search-field" data-hw="search-field">
  <label class="hw-label" for="basic-query">البحث في الخدمات</label>
  <div class="hw-input-group">
    <div class="hw-search-control">
      <input class="hw-input" id="basic-query" name="query" type="search" value="تصريح الإقامة" data-hw-search-input>
      <button class="hw-button hw-search-clear" type="button" data-variant="ghost" data-size="md" aria-label="مسح البحث" data-hw-search-clear></button>
    </div>
  </div>
</div>
```

```tsx live example=basic
<SearchField label="البحث في الخدمات" name="query" defaultValue="تصريح الإقامة" clearLabel="مسح البحث" />
```

```vue live example=basic
<SearchField label="البحث في الخدمات" name="query" default-value="تصريح الإقامة" clear-label="مسح البحث" />
```

```ts live example=basic framework=angular
template: `<hw-search-field label="البحث في الخدمات" name="query" value="تصريح الإقامة" clearLabel="مسح البحث" />`
```

## الأشكال والحالات

### الاقتراحات

عند تمرير قائمة اقتراحات، يقدّم الحقل إكمالًا تلقائيًا محليًا. والاقتراحات سلاسل نصية يوفّرها التطبيق؛ فلا يُرسَل أي طلب، وتبقى القيمة المُرسلة نصًّا حرًّا. وتتلقّى الدالة `getResultsMessage` عدد النتائج المطابقة، وتُرجع النص الكامل للإعلان غير المقاطِع.

```html live example=suggestions static differences=search-field-adapter-markup
<div class="hw-field hw-search-field" data-hw="search-field" data-hw-suggestions='["تصريح الإقامة","تجديد الإقامة","ترخيص القيادة","تسجيل المركبة"]' data-hw-results-message="{count} من الاقتراحات">
  <label class="hw-label" for="suggest-query">البحث في الخدمات</label>
  <div class="hw-input-group">
    <div class="hw-search-control">
      <input class="hw-input" id="suggest-query" name="query" type="search" data-hw-search-input>
      <button class="hw-button hw-search-clear" type="button" data-variant="ghost" data-size="md" aria-label="مسح البحث" data-hw-search-clear></button>
    </div>
  </div>
</div>
```

```tsx live example=suggestions
<SearchField
  label="البحث في الخدمات"
  name="query"
  clearLabel="مسح البحث"
  suggestions={['تصريح الإقامة', 'تجديد الإقامة', 'ترخيص القيادة', 'تسجيل المركبة']}
  getResultsMessage={(count) => count + ' من الاقتراحات'}
/>
```

```vue live example=suggestions
<SearchField
  label="البحث في الخدمات"
  name="query"
  clear-label="مسح البحث"
  :suggestions="['تصريح الإقامة', 'تجديد الإقامة', 'ترخيص القيادة', 'تسجيل المركبة']"
  :get-results-message="(count) => count + ' من الاقتراحات'"
/>
```

```ts live example=suggestions framework=angular
template: `<hw-search-field
  label="البحث في الخدمات"
  name="query"
  clearLabel="مسح البحث"
  [suggestions]="['تصريح الإقامة', 'تجديد الإقامة', 'ترخيص القيادة', 'تسجيل المركبة']"
  [getResultsMessage]="(count) => count + ' من الاقتراحات'"
/>`
```

### زر البحث

يضيف `showSearchButton` زرًّا يبدأ البحث، و`searchLabel` هو اسمه الميسّر. وفي React وVue وAngular يستدعي الزر دالة البحث. أما في vanilla فلا يقرأ المتحكم الزر، ولا يستدعي `onSearch` إلا عند الضغط على المفتاح Enter، فيكتب التطبيق الزر ويعالج النقر عليه بنفسه. ودون هذا الخيار ليس في الحقل زر، ويُرسل الضغط على Enter في عنصر الإدخال النموذجَ كما يفعل عنصر إدخال البحث الأصلي.

```html live example=button static differences=search-field-adapter-markup
<div class="hw-field hw-search-field" data-hw="search-field">
  <label class="hw-label" for="button-query">البحث في المستندات</label>
  <div class="hw-input-group">
    <div class="hw-search-control">
      <input class="hw-input" id="button-query" name="query" type="search" data-hw-search-input>
      <button class="hw-button hw-search-clear" type="button" data-variant="ghost" data-size="md" aria-label="مسح البحث" data-hw-search-clear></button>
    </div>
    <button class="hw-button hw-search-submit" type="button" data-variant="primary" data-size="md" aria-label="بحث"><span class="hw-search-submit-icon" aria-hidden="true"></span></button>
  </div>
</div>
```

```tsx live example=button
<SearchField label="البحث في المستندات" name="query" clearLabel="مسح البحث" showSearchButton searchLabel="بحث" />
```

```vue live example=button
<SearchField label="البحث في المستندات" name="query" clear-label="مسح البحث" show-search-button search-label="بحث" />
```

```ts live example=button framework=angular
template: `<hw-search-field label="البحث في المستندات" name="query" clearLabel="مسح البحث" [showSearchButton]="true" searchLabel="بحث" />`
```

### النص الإرشادي والخطأ

يصف النص الإرشادي ما يبحث فيه الحقل، ويظهر الخطأ بعد عنصر التحكم، ويُعلَّم عنصر الإدخال بأنه غير صالح.

```html live example=error static differences=search-field-adapter-markup
<div class="hw-field hw-search-field" data-hw="search-field">
  <label class="hw-label" for="error-query">البحث في الطلبات</label>
  <div class="hw-input-group">
    <div class="hw-search-control">
      <input class="hw-input" id="error-query" name="query" type="search" value="12" aria-invalid="true" aria-describedby="error-query-hint error-query-error" data-hw-search-input>
      <button class="hw-button hw-search-clear" type="button" data-variant="ghost" data-size="md" aria-label="مسح البحث" data-hw-search-clear></button>
    </div>
  </div>
  <p class="hw-hint" id="error-query-hint">ابحث برقم الطلب أو بعنوانه.</p>
  <p class="hw-error" id="error-query-error">أدخل ثلاث خانات على الأقل.</p>
</div>
```

```tsx live example=error
<SearchField label="البحث في الطلبات" name="query" defaultValue="12" clearLabel="مسح البحث" hint="ابحث برقم الطلب أو بعنوانه." error="أدخل ثلاث خانات على الأقل." />
```

```vue live example=error
<SearchField label="البحث في الطلبات" name="query" default-value="12" clear-label="مسح البحث" hint="ابحث برقم الطلب أو بعنوانه." error="أدخل ثلاث خانات على الأقل." />
```

```ts live example=error framework=angular
template: `<hw-search-field label="البحث في الطلبات" name="query" value="12" clearLabel="مسح البحث" hint="ابحث برقم الطلب أو بعنوانه." error="أدخل ثلاث خانات على الأقل." />`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createSearchField

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `clearLabel` | `string` | `false` | — |
| `suggestions` | `readonly string[]` | `false` | — |
| `maxSuggestions` | `number` | `false` | — |
| `getResultsMessage` | `(count: number) => string` | `false` | — |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `onSearch` | `(query: string) => void` | `false` | — |

تهيّئ الدالة `createSearchField` عنصرًا بالصنف `hw-search-field` يحتوي داخل العنصر `hw-search-control` على عنصر إدخال أصلي من النوع `search` يحمل الخاصية `data-hw-search-input`، وزر مسح يحمل الخاصية `data-hw-search-clear`؛ وتجري التهيئة نفسها للعنصر الذي يحمل `data-hw="search-field"` عبر الدالة `enhance()`. ويأخذ زر المسح اسمه من `clearLabel`، أو من خاصيته `aria-label` أو من نصه قبل أن تحلّ الأيقونة محلّ النص. ويُرجع المتحكم `value` و`clear()` و`setValue(value)` و`setSuggestions(items)` و`destroy()`. وتُرسل `clear()` حدثَي الإدخال والتغيير الأصليين، وحدثًا واحدًا `hw:change` يحمل `{ value }`؛ وتُزامن `setValue` الحقل دون إرسال أحداث. وتأتي الاقتراحات من الخيار `suggestions`، أو في الترميز من مصفوفة JSON من السلاسل النصية في الخاصية `data-hw-suggestions` على الجذر؛ وتضبط الخاصية `data-hw-max-suggestions` الحد الأقصى، وهو 8 إذا لم تُكتب هي ولا الخيار، وتعطي الخاصية `data-hw-results-message` نص الإعلان، مع موضع لعدد النتائج المطابقة. وعند وجود الاقتراحات تكون رسالة النتائج مطلوبة. ويتلقّى `onSearch` عبارة البحث بعد حذف المسافات من طرفيها عند الضغط على Enter إذا لم يكن هناك اقتراح نشط. وإرسال البحث من مسؤولية نموذج التطبيق: استخدم معالج الإرسال أو `onSearch` للبحث الواحد، لا كليهما.

### React

جدول: خصائص SearchField

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `value` | `string` | `false` | — |
| `defaultValue` | `string` | `false` | `''` |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `clearLabel` | `string` | `true` | — |
| `maxSuggestions` | `number` | `false` | `8` |
| `onSearch` | `(query: string) => void` | `false` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `hint` | `ReactNode` | `false` | — |
| `error` | `ReactNode` | `false` | — |
| `label` | `ReactNode` | `false` | — |
| `showSearchButton` | `boolean` | `false` | `false` |
| `searchLabel` | `string` | `false` | — |
| `suggestions` | `readonly string[]` | `false` | — |
| `getResultsMessage` | `(count: number) => string` | `false` | — |

يقبل SearchField أيضًا خصائص عنصر الإدخال الأصلي، مثل `name` و`required` و`disabled` و`readOnly`. مرّر `value` مع `onValueChange` لحقل متحكَّم فيه، أو `defaultValue` لحقل غير متحكَّم فيه. والخاصية `clearLabel` مطلوبة؛ وتلزم `searchLabel` عند ضبط `showSearchButton`، وتلزم `getResultsMessage` عند تمرير `suggestions`. ويتلقّى `onSearch` عبارة البحث بعد حذف المسافات من طرفيها عند الضغط على Enter إذا لم يكن هناك اقتراح نشط، ويبقى إرسال النموذج الأصلي متاحًا. ويحتاج الحقل إلى `label` أو `aria-label` أو `aria-labelledby`.

### Vue

جدول: خصائص SearchField وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `modelValue` | prop | `string` | `false` | — |
| `defaultValue` | prop | `string` | `false` | `''` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `readonly` | prop | `boolean` | `false` | `false` |
| `clearLabel` | prop | `string` | `true` | — |
| `suggestions` | prop | `readonly string[]` | `false` | — |
| `maxSuggestions` | prop | `number` | `false` | `8` |
| `getResultsMessage` | prop | `(count: number) => string` | `false` | — |
| `showSearchButton` | prop | `boolean` | `false` | `false` |
| `searchLabel` | prop | `string` | `false` | — |
| `label` | prop | `string` | `false` | — |
| `hint` | prop | `string` | `false` | — |
| `error` | prop | `string` | `false` | — |
| `required` | prop | `boolean` | `false` | — |
| `update:modelValue` | event | `(value: string) => void` | `false` | — |
| `search` | event | `(value: string) => void` | `false` | — |

يربط `v-model` القيمة النصية، وتضبط الخاصية `defaultValue` عبارة البحث الأولية لحقل غير متحكَّم فيه. ويُبلغ الحدث `search` بعبارة البحث عند الضغط على Enter إذا لم يكن هناك اقتراح نشط؛ ويتجاهل الضغط في أثناء تركيب النص، والضغط مع Ctrl أو Alt أو Meta أو Shift. والخاصية `clearLabel` مطلوبة، وتصل خصائص HTML الأخرى، مثل `name`، إلى عنصر الإدخال الأصلي. ولا يعرّف التصريح المنشور نوع أي منفذ، ولا يقرأ الإصدار المنشور أي منفذ.

### Angular

جدول: مُدخلات hw-search-field ومخرجاته ومحتواه

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
| `placeholder` | input | `string` | `false` | `''` |
| `autocomplete` | input | `string` | `false` | `'off'` |
| `autofocus` | input | `boolean` | `false` | `false` |
| `clearLabel` | input | `string` | `true` | — |
| `searchLabel` | input | `string` | `false` | `''` |
| `suggestions` | input | `readonly string[]` | `false` | — |
| `maxSuggestions` | input | `number` | `false` | `8` |
| `getResultsMessage` | input | `(count: number) => string` | `false` | — |
| `showSearchButton` | input | `boolean` | `false` | `false` |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `searched` | output | `string` | `false` | — |

يعرض `HwSearchFieldComponent` (`hw-search-field`) الحقل والتسمية وعنصر إدخال البحث وزر المسح والنص الإرشادي والخطأ. اربط `[(value)]` ربطًا ثنائي الاتجاه بالقيمة النصية؛ ويعمل المكوّن أيضًا عنصرَ تحكم في النموذج. ويُبلغ المُخرج `searched` بعبارة البحث عند الضغط على Enter إذا لم يكن هناك اقتراح نشط، ويتجاهل الضغط في أثناء تركيب النص، والضغط مع Ctrl أو Alt أو Meta أو Shift. والمُدخل `clearLabel` مطلوب؛ ويلزم `searchLabel` عند ضبط `showSearchButton`، ويلزم `getResultsMessage` عند تمرير `suggestions`. ويحتاج الحقل إلى `label`، أو إلى `aria-label` أو `aria-labelledby` مكتوبة على `hw-search-field`؛ وتُمرَّر هذه الخصائص إلى عنصر الإدخال. ويضبط `controlId` معرّف عنصر الإدخال. ودون المُدخل `autocomplete` يكتب الحقل `autocomplete="off"`.

## إمكانية الوصول

عنصر الإدخال عنصر أصلي من النوع `search` تسمّيه تسميته، فيوفّر المتصفح دوره وتحرير النص فيه والتعامل مع لوحة المفاتيح. وزر المسح زر أصلي يسمّيه `clearLabel`؛ ويُخفى ما دامت عبارة البحث فارغة أو كان الحقل مخصّصًا للقراءة فقط، ولا يفعل شيئًا في الحقل المعطَّل.

عند وجود الاقتراحات، يأخذ ذلك الحقل وحده أدوار المربع المركّب (combobox) وحالتَي التوسّع والعنصر النشط. وعندئذٍ فقط تعطّل vanilla وReact وVue أيضًا الإكمال التلقائي الأصلي في المتصفح؛ أما Angular فتعطّله في كل حقل، كما تذكر فقرة Angular أعلاه. والقائمة مربع قائمة (listbox) تسمّيه تسمية الحقل، ويبقى التركيز على عنصر الإدخال، وتعلن منطقة حالة منفصلة غير مقاطِعة عدد النتائج المطابقة عبر `getResultsMessage`. ولا تفتح عبارة البحث الفارغة أو العبارة التي لا تطابق أي اقتراح قائمةً فارغة أبدًا.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: حقل بحث

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز من عنصر الإدخال إلى زر المسح عندما يكون ظاهرًا، ثم إلى عنصر التحكم التالي. |
| <kbd>السهم السفلي</kbd>، <kbd>السهم العلوي</kbd> | ينقل الاقتراح النشط إلى الاقتراح التالي أو السابق، ويعود من أحد الطرفين إلى الطرف الآخر، ويبقى التركيز على عنصر الإدخال. |
| <kbd>Enter</kbd> | يحدّد الاقتراح النشط فيضعه في عنصر الإدخال دون إرسال النموذج؛ وإذا لم يكن هناك اقتراح نشط، يترك إرسال النموذج الأصلي على حاله ويُبلغ بالبحث. |
| <kbd>Escape</kbd> | يغلق قائمة الاقتراحات المفتوحة؛ وإذا كانت القائمة مغلقة، يطلب إغلاق أقرب مربع حوار مشروط ويحتفظ بعبارة البحث. |

- يُرسل تحديد الاقتراح إشعارات الإدخال والتغيير المعتادة، ويبقى نص الحقل نصًّا حرًّا.
- يُبقي التحديد بالمؤشر وباللمس التركيزَ على عنصر الإدخال، ويُعتمد الاختيار عند النقر.
- تُغلق القائمة عند مغادرة التركيز، وعند التفاعل خارجها، وعند المسح، وعند استدعاء `setValue` الذي لا يُرسل أحداثًا، وعند إعادة تعيين النموذج.
- يستطيع الحقل المخصّص للقراءة فقط أن يُبلغ ببحث عن قيمته الحالية، ولا يستطيع المسح ولا تحديد الاقتراحات ولا قبول التعديل.

## الاتجاه والتوطين

ليس في حقل البحث نص مدمج: يكتب التطبيق التسمية والنص الإرشادي والخطأ واسم المسح واسم البحث ورسالة النتائج بلغة الصفحة. ويقع إجراءا المسح والبحث في النهاية المنطقية لعنصر الإدخال، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية، فيتبع الحقل اتجاه القراءة.

- تُطابَق الاقتراحات مع تجاهل الحركات العربية وتوحيد أشكال الألف، ويُبرَز الجزء المطابق في مواضعه الأصلية من النص.
- تبقى عبارة البحث المكوّنة من أرقام كما يكتبها القارئ، ويختار التطبيق الأرقام التي تُكتب بها رسالة النتائج.
- الإرسال والطلب وترتيب النتائج وعرضها من مسؤولية التطبيق.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط حقل البحث بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات البحث](../nic-search.md) حجم الحقل، وإجراء المسح الواقع داخل عنصر الإدخال، وقائمة الاقتراحات، وقواعد المطابقة، والتعامل مع لوحة المفاتيح، الواردة في ملفات كود المنصات المزوَّدة، وتذكر درجة الثقة في كل ربط.
- تصف [ملاحظات حقل البحث](../search-field.md) إجراء المسح واسمَيه وسلوك إعادة التعيين؛ وتذكر أن هذا التركيب لا يدّعي تماثلًا دقيقًا على مستوى البكسل مع قالب بحث رسمي.
