---
source:
  summary: c1bd48b5b35a
  example: 878da61f23b2
  variants-and-states: e5c1df9f3788
  api: 2a6ac6323c36
  accessibility: 8235e37211a4
  rtl-and-localisation: fe6c504f8b8c
  platforms-code-reference: 22e4f4d14f2e
---
# زر أيقونة

زر الأيقونة زر أصلي يعرض أيقونة دون نص ظاهر. ويحتاج إلى اسم ميسّر صريح، لأن الأيقونة وحدها لا تسمّي الإجراء.

## مثال

يُستخدم زر الأيقونة عندما يكون الإجراء مألوفًا والمساحة صغيرة، مثل إجراء التنزيل في صف من قائمة. ويذكر الاسم الإجراء، ويذكر موضوعه أيضًا عندما يتكرر الإجراء في عدة صفوف.

```html live example=basic differences=icon-button-adapter-markup
<button class="hw-button hw-icon-button" type="button" data-variant="ghost" data-size="md" aria-label="تنزيل الإيصال"><span class="hw-icon" data-icon="download-01" aria-hidden="true"></span></button>
```

```tsx live example=basic
<IconButton label="تنزيل الإيصال"><span className="hw-icon" data-icon="download-01" /></IconButton>
```

```vue live example=basic
<IconButton label="تنزيل الإيصال"><span class="hw-icon" data-icon="download-01"></span></IconButton>
```

```ts live example=basic framework=angular
template: `<hw-icon-button label="تنزيل الإيصال"><span class="hw-icon" data-icon="download-01"></span></hw-icon-button>`
```

## الأشكال والحالات

### الأشكال والهيئة

يضبط `variant` الطراز المرئي للزر، كما يضبطه في المكوّن Button: `primary` و`default` و`secondary` و`outline` و`outline-white` و`light` و`danger` و`ghost` و`soft` و`link`. ودون شكل يكون الزر `ghost`، أي إجراءً قليل البروز. والهيئة `shape` إما `square` وإما `circle`. والحجم `size` إما `sm` وإما `md` وإما `lg`.

```html live example=variants differences=icon-button-adapter-markup
<div class="hw-inline">
  <button class="hw-button hw-icon-button" type="button" data-variant="secondary" data-size="md" aria-label="نسخ الرقم المرجعي"><span class="hw-icon" data-icon="copy-01" aria-hidden="true"></span></button>
  <button class="hw-button hw-icon-button" type="button" data-variant="outline" data-size="lg" data-shape="circle" aria-label="فتح المستند"><span class="hw-icon" data-icon="file-01" aria-hidden="true"></span></button>
  <button class="hw-button hw-icon-button" type="button" data-variant="ghost" data-size="sm" aria-label="إعادة تحميل القائمة"><span class="hw-icon" data-icon="reload" aria-hidden="true"></span></button>
</div>
```

```tsx live example=variants
<div className="hw-inline">
  <IconButton label="نسخ الرقم المرجعي" variant="secondary"><span className="hw-icon" data-icon="copy-01" /></IconButton>
  <IconButton label="فتح المستند" variant="outline" size="lg" shape="circle"><span className="hw-icon" data-icon="file-01" /></IconButton>
  <IconButton label="إعادة تحميل القائمة" size="sm"><span className="hw-icon" data-icon="reload" /></IconButton>
</div>
```

```vue live example=variants
<div class="hw-inline">
  <IconButton label="نسخ الرقم المرجعي" variant="secondary"><span class="hw-icon" data-icon="copy-01"></span></IconButton>
  <IconButton label="فتح المستند" variant="outline" size="lg" shape="circle"><span class="hw-icon" data-icon="file-01"></span></IconButton>
  <IconButton label="إعادة تحميل القائمة" size="sm"><span class="hw-icon" data-icon="reload"></span></IconButton>
</div>
```

```ts live example=variants framework=angular
template: `<div class="hw-inline">
  <hw-icon-button label="نسخ الرقم المرجعي" variant="secondary"><span class="hw-icon" data-icon="copy-01"></span></hw-icon-button>
  <hw-icon-button label="فتح المستند" variant="outline" size="lg" shape="circle"><span class="hw-icon" data-icon="file-01"></span></hw-icon-button>
  <hw-icon-button label="إعادة تحميل القائمة" size="sm"><span class="hw-icon" data-icon="reload"></span></hw-icon-button>
</div>`
```

### التحميل والتعطيل

يُعطَّل الزر في حالة التحميل ما دام إجراؤه قيد التنفيذ، ويضبط `aria-busy`، فلا يستطيع بدء الإجراء مرتين. ويستخدم الزر المعطَّل الخاصية الأصلية `disabled`، ويخرج من ترتيب التنقل بالمفتاح Tab. ولا يتغيّر اسم الزر في أي من الحالتين؛ فاذكر التقدّم أو السبب في نص قريب من الزر.

```html live example=states differences=icon-button-adapter-markup
<div class="hw-inline">
  <button class="hw-button hw-icon-button" type="button" data-variant="secondary" data-size="md" aria-label="تحديث الحالة" aria-busy="true" disabled><span class="hw-icon" data-icon="reload" aria-hidden="true"></span></button>
  <button class="hw-button hw-icon-button" type="button" data-variant="secondary" data-size="md" aria-label="تنزيل الإيصال" disabled><span class="hw-icon" data-icon="download-01" aria-hidden="true"></span></button>
</div>
```

```tsx live example=states
<div className="hw-inline">
  <IconButton label="تحديث الحالة" variant="secondary" loading><span className="hw-icon" data-icon="reload" /></IconButton>
  <IconButton label="تنزيل الإيصال" variant="secondary" disabled><span className="hw-icon" data-icon="download-01" /></IconButton>
</div>
```

```vue live example=states
<div class="hw-inline">
  <IconButton label="تحديث الحالة" variant="secondary" loading><span class="hw-icon" data-icon="reload"></span></IconButton>
  <IconButton label="تنزيل الإيصال" variant="secondary" disabled><span class="hw-icon" data-icon="download-01"></span></IconButton>
</div>
```

```ts live example=states framework=angular
template: `<div class="hw-inline">
  <hw-icon-button label="تحديث الحالة" variant="secondary" [loading]="true"><span class="hw-icon" data-icon="reload"></span></hw-icon-button>
  <hw-icon-button label="تنزيل الإيصال" variant="secondary" [disabled]="true"><span class="hw-icon" data-icon="download-01"></span></hw-icon-button>
</div>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العناصر hw-icon-button وhw-icon-background

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-icon-button' \| 'hw-icon-background'` | `true` | — |
| `data-shape` | `'square' \| 'circle'` | `false` | — |
| `data-size` | `'xs' \| 'xl' \| 'lg' \| 'sm'` | `false` | — |
| `aria-pressed` | `'true'` | `false` | — |
| `data-icon-only` | `boolean` | `false` | — |
| `aria-disabled` | `'true'` | `false` | — |
| `data-variant` | `'featured'` | `false` | — |
| `data-tone` | `'error' \| 'info' \| 'neutral' \| 'success' \| 'warning'` | `false` | — |
| `data-style` | `'dark' \| 'outline'` | `false` | — |

ليس لزر الأيقونة متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر `button` أصليًا بالصنفين `hw-button` و`hw-icon-button`، مع الخاصية `type`، والخاصية `aria-label` التي تسمّي الإجراء، وداخله أيقونة من أيقونات الحزم في عنصر `span` بالصنف `hw-icon` مع الخاصية `aria-hidden="true"`. وتعمل الخاصيتان `data-variant` و`data-size` على الزر نفسه كما تعملان في المكوّن Button، وتقرأ ورقة الأنماط الخاصية `data-shape` على الصنفين. ويسرد الجدول الخصائص التي تستهدفها ورقة الأنماط على الصنفين: تأخذ `data-shape` القيمة `square` أو `circle`، وتدل `aria-pressed="true"` على زر تبديل في حالة الضغط، وتمنح `aria-disabled="true"` مظهر التعطيل دون أن تعطّل العنصر، فاكتب الخاصية الأصلية `disabled` للزر المعطَّل. وتدل الخاصية `data-icon-only` على زر لا يحتوي إلا على أيقونة. والصنف `hw-icon-background` مستقل وغير تفاعلي، وهو لأيقونة على خلفية دائرية أو مربعة؛ ويسرد الجدول `data-size` و`data-variant="featured"` و`data-tone` و`data-style` بالقيم التي تستهدفها ورقة الأنماط على الصنفين.

### React

جدول: خصائص IconButton

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `label` | `string` | `true` | — |
| `shape` | `'square' \| 'circle'` | `false` | — |
| `data-shape` | `string` | `false` | — |
| `variant` | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'ghost'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `false` | — |
| `loading` | `boolean` | `false` | — |

يقبل IconButton خصائص Button، ومعها الخاصية المطلوبة `label`، وهي الاسم الميسّر. وتسمّي الخاصية `aria-label` أو `aria-labelledby` الزرَ بدلًا من `label`؛ ودون أي منها يبقى الزر بلا اسم، ويُبلغ عن ذلك تحذير في بيئة التطوير. وتكتب الخاصية `shape` الخاصية `data-shape`، وتبقى الخاصية `data-shape` مقبولة. والعناصر الأبناء هي الأيقونة: تُعرض داخل عنصر يحمل `aria-hidden="true"`، فاكتب أيقونة زخرفية ولا تكتب نصًا. وتعطّل الخاصية `loading` الزر وتضبط `aria-busy`.

### Vue

جدول: خصائص IconButton وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `false` | — |
| `variant` | prop | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'ghost'` |
| `size` | prop | `'sm' \| 'md' \| 'lg'` | `false` | `'md'` |
| `shape` | prop | `'square' \| 'circle'` | `false` | — |
| `disabled` | prop | `boolean` | `false` | `false` |
| `loading` | prop | `boolean` | `false` | `false` |
| `default` | slot | — | `false` | — |

الخاصية `label` هي الاسم الميسّر. وهي اختيارية في النوع لأن خاصية HTML `aria-label` أو `aria-labelledby` تسمّي الزر بدلًا منها؛ ودون أي منها يبقى الزر بلا اسم، ويُبلغ عن ذلك تحذير في بيئة التطوير. ويحمل المنفذ الافتراضي الأيقونة، ويُعرض داخل عنصر يحمل `aria-hidden="true"`، فاكتب أيقونة زخرفية ولا تكتب نصًا. وتعطّل الخاصية `loading` الزر وتضبط `aria-busy`. ويتيح المكوّن `focus()` عبر مرجع القالب. ويسرد الجدول المنفذ الافتراضي لأن الإصدار المنشور يقرؤه؛ ولا يعرّف التصريح نوع أي منفذ.

### Angular

جدول: مُدخلات hw-icon-button ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `type` | input | `'button' \| 'submit' \| 'reset'` | `false` | `'button'` |
| `disabled` | input | `boolean` | `false` | `false` |
| `loading` | input | `boolean` | `false` | `false` |
| `pressed` | input | `boolean \| null` | `false` | `null` |
| `variant` | input | `string` | `false` | `'ghost'` |
| `size` | input | `string` | `false` | `'md'` |
| `shape` | input | `'square' \| 'circle'` | `false` | `'square'` |
| `form` | input | `string \| null` | `false` | — |
| `name` | input | `string` | `false` | `''` |
| `value` | input | `string` | `false` | `''` |
| `controls` | input | `string` | `false` | `''` |
| `expanded` | input | `boolean \| null` | `false` | `null` |
| `hasPopup` | input | `'true' \| 'false' \| 'menu' \| 'listbox' \| 'tree' \| 'grid' \| 'dialog' \| null` | `false` | `null` |
| `activated` | output | `MouseEvent` | `false` | — |
| `*` | content | — | `false` | — |

يُطبَّق `HwIconButtonComponent` على `hw-icon-button`، ويعرض داخل العنصر المضيف عنصر `button` الأصلي بالصنفين `hw-button` و`hw-icon-button`. والمُدخل `label` هو الاسم الميسّر، وهو مطلوب ما لم تُكتب `aria-label` أو `aria-labelledby` على العنصر المضيف؛ ولا يحتفظ العنصر المضيف بأي من `aria-label` و`aria-labelledby` و`aria-describedby`، لأنها تُمرَّر إلى الزر. وتكتب المُدخلات `pressed` و`expanded` و`controls` و`hasPopup` الخصائص `aria-pressed` و`aria-expanded` و`aria-controls` و`aria-haspopup`، ويعطّل المُدخل `loading` الزر ويضبط `aria-busy`. ويُرسل المُخرج `activated` حدث النقر. والمحتوى المُسقَط هو الأيقونة، وتُعرض داخل عنصر يحمل `aria-hidden="true"`؛ وللمكوّن أيضًا دالة عامة `focus()`. وليس للمُدخل `form` قيمة افتراضية: فلا يكتب الزر الخاصية `form` حتى تُعطى قيمة، ولا يُكتب `name` و`controls` إلا إذا لم يكونا فارغين.

## إمكانية الوصول

زر الأيقونة زر أصلي، فيوفّر المتصفح دوره، وموضعه في ترتيب التنقل بالمفتاح Tab، وتفعيله بالمفتاحين <kbd>Enter</kbd> و<kbd>Space</kbd>.

- يأتي الاسم الميسّر من `label` أو `aria-label` أو `aria-labelledby`، ولا يأتي أبدًا من الأيقونة. فسمِّ الإجراء، مثل «تنزيل الإيصال»، لا الصورة، مثل «سهم».
- الأيقونة مخفية عن التقنيات المساعدة. ففي ترميز vanilla اكتب `aria-hidden="true"` على عنصر `span` الخاص بالأيقونة؛ ويعرض React وVue وAngular الأيقونة داخل عنصر يحمل هذه الخاصية.
- عندما تتكرر عدة أزرار أيقونات في قائمة، اذكر الموضوع في الاسم، ليتمكّن من يتصفّح قائمة عناصر التحكم من التمييز بينها.
- يستخدم زر التبديل `aria-pressed`: المُدخل `pressed` في Angular، والخاصية الأصلية في المحوّلات الأخرى. ويبقى الاسم نفسه في الحالتين.
- الزر في حالة التحميل معطَّل ويحمل `aria-busy`، فلا يتكرر التفعيل ما دام الإجراء قيد التنفيذ.
- رسم الأيقونة بحجم 20 px، وبحجم 16 px في الحجم الصغير. وحجم الهدف للأحجام الثلاثة 32 و40 و40 px في الكثافة المريحة؛ وتستخدم الكثافة المدمجة 24 و32 و40 px، وكثافة الجوّال 32 و40 و44 px.

## الاتجاه والتوطين

ليس في زر الأيقونة نص مدمج: يكتب التطبيق اسم الإجراء بلغة الصفحة، وكذلك أي نص قريب من الزر يذكر حالة أو سببًا. ولا تُعكس الأيقونات افتراضيًا. ويُفعَّل العكس عند الحاجة بالخاصية `data-directional="true"` على الأيقونة، والأيقونات التي تسمح به في الحزمة هي الأسهم الأفقية والسهم المائل arrow-up-right-01.

- اختر أيقونة لا يتوقف معناها على اتجاه القراءة، أو اعكس الأيقونة الاتجاهية، مثل سهم يشير إلى الأمام.
- تحتفظ أيقونة إجراء التنزيل أو النسخ أو إعادة التحميل باتجاهها في العربية وفي الإنجليزية.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط زر الأيقونة بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات الأيقونات](../nic-icons.md) الحجم والهيئة وأبعاد رسم الأيقونة، الواردة في ورقة أنماط كود المنصات المزوَّدة، وتذكر درجة الثقة في كل ربط، والتكييفات المقصودة في الكثافة والهيئة.
- تُبقي هوية أهداف الحجم الصغير مربعة مع أن الزر الصغير في المصدر ليس مربعًا، ويرث رسم الأيقونة لونه من الزر، وتتقدّم حالتا التعطيل والتحميل على حالة التحديد؛ وهذه التكييفات موثّقة في ملاحظات الأيقونات.
