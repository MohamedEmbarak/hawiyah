---
source:
  summary: 04a3baa4a8f3
  example: 205c6a69c4a3
  variants-and-states: 67d2f6d1c892
  api: 521635f246f0
  accessibility: 65f79d4a71bc
  rtl-and-localisation: a9e40524c65f
  platforms-code-reference: 3fcf3bdb2c91
---
# رابط

الرابط عنصر رابط أصلي بأنماط الروابط في هوية. ويقود إلى وجهة، ويحتفظ بكل خصائص عنصر الرابط الأصلية، ويوفّر أشكالًا للموضع المحايد والموضع المستقل، وعلامة للصفحة الحالية، وصيغة للرابط الخارجي، وصيغة للرابط المعطَّل.

## مثال

يسمّي نص الرابط وجهته، فيستطيع من يقرأ قائمة الروابط التمييز بينها دون الجملة المحيطة بها. والرابط الافتراضي مسطَّر، فلا يكون اللون وحده ما يدل على أنه رابط.

```html live example=basic
<p>يمكنك <a class="hw-link" href="/requests/status">الاستعلام عن حالة طلبك</a> في أي وقت.</p>
```

```tsx live example=basic
<p>يمكنك <Link href="/requests/status">الاستعلام عن حالة طلبك</Link> في أي وقت.</p>
```

```vue live example=basic
<p>يمكنك <Link href="/requests/status">الاستعلام عن حالة طلبك</Link> في أي وقت.</p>
```

```ts live example=basic framework=angular
template: `<p>يمكنك <a hwLink href="/requests/status">الاستعلام عن حالة طلبك</a> في أي وقت.</p>`
```

## الأشكال والحالات

### المحايد والمستقل

يستخدم الشكل `neutral` ألوان الروابط المحايدة، ويزيل التسطير في الحالة العادية، للرابط الذي يقع بين نصوص أخرى، مثل قائمة الصفحات ذات الصلة. ويزيل الشكل `standalone` التسطير للرابط الذي يقف وحده في سطره، عندما يدل موضعه على أنه رابط. وللشكل `subtle` الألوان المحايدة نفسها، ولا تسطير له في الحالة العادية، غير أن الرابط `subtle` يأخذ لون النص الأساسي عند المرور بالمؤشر، بينما يأخذ الرابط `neutral` لون المرور بالمؤشر المحايد. والشكل `default` هو الرابط المسطَّر في المثال الأول.

```html live example=variants
<div class="hw-stack">
  <a class="hw-link" data-variant="neutral" href="/requests/history">سجل الطلبات</a>
  <a class="hw-link" data-variant="standalone" href="/requests/new">تقديم طلب جديد</a>
</div>
```

```tsx live example=variants
<div className="hw-stack">
  <Link variant="neutral" href="/requests/history">سجل الطلبات</Link>
  <Link variant="standalone" href="/requests/new">تقديم طلب جديد</Link>
</div>
```

```vue live example=variants
<div class="hw-stack">
  <Link variant="neutral" href="/requests/history">سجل الطلبات</Link>
  <Link variant="standalone" href="/requests/new">تقديم طلب جديد</Link>
</div>
```

```ts live example=variants framework=angular
template: `<div class="hw-stack">
  <a hwLink variant="neutral" href="/requests/history">سجل الطلبات</a>
  <a hwLink variant="standalone" href="/requests/new">تقديم طلب جديد</a>
</div>`
```

### الصفحة الحالية

يحمل الرابط إلى الصفحة التي يقرؤها القارئ الخاصية `aria-current="page"`، وتعرضه ورقة الأنماط بخط أثقل. وفي vanilla وReact تُكتب الخاصية الأصلية؛ وفي Vue تُمرَّر خاصيةَ HTML، ويكتبها التوجيه في Angular من المُدخل `current`.

```html live example=current
<a class="hw-link" href="/requests" aria-current="page">طلباتي</a>
```

```tsx live example=current
<Link href="/requests" aria-current="page">طلباتي</Link>
```

```vue live example=current
<Link href="/requests" aria-current="page">طلباتي</Link>
```

```ts live example=current framework=angular
template: `<a hwLink href="/requests" [current]="true">طلباتي</a>`
```

### الرابط الخارجي

يُفتح الرابط الخارجي في علامة تبويب جديدة بالخاصية الأصلية target بالقيمة _blank. ويكتب React وVue والتوجيه في Angular هذه الخاصية، ويضيفون noopener وnoreferrer إلى الخاصية rel للرابط عند ضبط `external`؛ وفي vanilla يكتب المطوّر الخاصيتين بنفسه. وتضيف ورقة الأنماط سهمًا بعد هذا الرابط، وتزيله الخاصية `data-hw-external-icon="none"`. ويذكر نص الرابط أنه يُفتح في علامة تبويب جديدة، لأن السهم الذي تضيفه ورقة الأنماط ليس نصًا.

```html live example=external
<a class="hw-link" href="https://example.com/guidance" target="_blank" rel="noopener noreferrer">قراءة الإرشادات (تُفتح في علامة تبويب جديدة)</a>
```

```tsx live example=external
<Link href="https://example.com/guidance" external>قراءة الإرشادات (تُفتح في علامة تبويب جديدة)</Link>
```

```vue live example=external
<Link href="https://example.com/guidance" external>قراءة الإرشادات (تُفتح في علامة تبويب جديدة)</Link>
```

```ts live example=external framework=angular
template: `<a hwLink href="https://example.com/guidance" [external]="true">قراءة الإرشادات (تُفتح في علامة تبويب جديدة)</a>`
```

### الرابط المعطَّل

يمثّل الرابط المعطَّل وجهة غير متاحة الآن. وليس له `href`، ويحمل الخاصيتين `role="link"` و`aria-disabled="true"`، ويخرج من ترتيب التنقل بالمفتاح Tab بالخاصية tabindex بالقيمة -1. وفي React وVue وAngular يكتب `disabled` هذه الخصائص، ويلغي النقر والنقر المساعد قبل أن يصلا إلى معالج في التطبيق؛ وفي vanilla يكتبها المطوّر بنفسه، ولا يضيف وجهة ولا معالجًا.

```html live example=disabled
<a class="hw-link" role="link" aria-disabled="true" tabindex="-1">تنزيل الإيصال (متاح بعد الموافقة)</a>
```

```tsx live example=disabled
<Link href="/requests/receipt" disabled>تنزيل الإيصال (متاح بعد الموافقة)</Link>
```

```vue live example=disabled
<Link href="/requests/receipt" disabled>تنزيل الإيصال (متاح بعد الموافقة)</Link>
```

```ts live example=disabled framework=angular
template: `<a hwLink href="/requests/receipt" [disabled]="true">تنزيل الإيصال (متاح بعد الموافقة)</a>`
```

## الواجهة البرمجية

### JavaScript

جدول: خصائص العنصر hw-link

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `class` | `'hw-link'` | `true` | — |
| `aria-current` | `boolean` | `false` | — |
| `data-variant` | `'neutral' \| 'standalone' \| 'subtle'` | `false` | — |
| `aria-disabled` | `'true'` | `false` | — |
| `target` | `'_blank'` | `false` | — |
| `data-hw-external-icon` | `'none'` | `false` | — |

> [!NOTE]
> تُقرأ هذه الأصناف والخصائص من ورقة الأنماط المنشورة، وهي خارج الواجهة المستقرة للإصدار 0.3.0.

ليس للرابط متحكم في JavaScript، فالترميز هو واجهته البرمجية: اكتب عنصر `a` أصليًا بالصنف `hw-link` مع الخاصية `href`؛ وتبقى كل الخصائص الأصلية الأخرى على عنصر الرابط. والخاصية `data-variant` اختيارية، ودونها يكون الرابط هو الرابط الافتراضي المسطَّر. وتدل الخاصية `aria-current` على الرابط إلى الصفحة الحالية. وتمنح الخاصية `aria-disabled="true"` الرابط مظهر التعطيل، ولا توقف تفاعله، فاكتب صيغة الرابط المعطَّل كما سبق وصفها، دون `href`. وتُظهر الخاصية `target` بالقيمة `_blank` السهم الذي تضيفه ورقة الأنماط، وتزيله الخاصية `data-hw-external-icon="none"`؛ واكتب الخاصية rel بالقيمتين noopener وnoreferrer بنفسك. وتعرض ورقة الأنماط الرابط الذي يحتوي على أيقونة من أيقونات الحزم في صف ضمن السطر.

### React

جدول: خصائص Link

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `external` | `boolean` | `false` | — |
| `disabled` | `boolean` | `false` | `false` |
| `variant` | `'default' \| 'subtle' \| 'neutral' \| 'standalone'` | `false` | — |
| `data-variant` | `string` | `false` | — |

يعرض Link عنصر `a` أصليًا، ويقبل خصائصه الأصلية، ومنها `href` و`target` و`rel` و`onClick` و`className`. وتكتب الخاصية `external` الخاصية target بالقيمة _blank، وتضيف noopener وnoreferrer إلى قيمة rel التي يمرّرها التطبيق. وتزيل الخاصية `disabled`، أو `aria-disabled` بالقيمة `true`، الخاصية `href`، وتكتب `role="link"` والخاصية tabindex بالقيمة -1، وتلغي النقر والنقر المساعد قبل تشغيل `onClick` و`onAuxClick`؛ ويحتفظ الرابط المتاح بمعالجاته. وتكتب الخاصية `variant` الخاصية `data-variant`؛ وتبقى `data-variant` مقبولة لقيمة يعرّفها التطبيق، وتتقدّم `variant` عند كتابة الاثنتين. وليس للرابط خاصية للصفحة الحالية: اكتب `aria-current="page"`.

### Vue

جدول: خصائص Link وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `href` | prop | `string` | `false` | — |
| `disabled` | prop | `boolean` | `false` | `false` |
| `external` | prop | `boolean` | `false` | `false` |
| `variant` | prop | `'default' \| 'subtle' \| 'neutral' \| 'standalone'` | `false` | — |
| `default` | slot | — | `false` | — |

يعرض Link عنصر `a` أصليًا، وتصل إليه خصائص HTML والمستمعات التي ليست خصائص للمكوّن. ويحمل المنفذ الافتراضي نص الرابط. وتكتب الخاصية `external` الخاصية target بالقيمة _blank، وتضيف noopener وnoreferrer إلى الخاصية rel التي يكتبها التطبيق. وتزيل الخاصية `disabled`، أو خاصية HTML `aria-disabled` بالقيمة `true`، الخاصية `href`، وتكتب `role="link"` والخاصية tabindex بالقيمة -1، وتلغي التفعيل قبل مستمعات التطبيق. ويسرد الجدول المنفذ الافتراضي لأن الإصدار المنشور يقرؤه؛ ولا يعرّف التصريح نوع أي منفذ. واكتب `aria-current="page"` للصفحة الحالية.

### Angular

جدول: مُدخلات a[hwLink] ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `variant` | input | `'default' \| 'subtle' \| 'neutral' \| 'standalone'` | `false` | — |
| `current` | input | `boolean` | `false` | `false` |
| `disabled` | input | `boolean` | `false` | `false` |
| `external` | input | `boolean` | `false` | `false` |

يُطبَّق `HwLinkDirective` على `a[hwLink]`: فهو توجيه على عنصر الرابط الذي يكتبه التطبيق، فتبقى `href` وتوجيه المسارات وكل الخصائص والأحداث الأصلية على العنصر الحقيقي، ويأخذ هذا العنصر الصنف `hw-link`. ويكتب المُدخل `current` الخاصية `aria-current="page"`. ويكتب المُدخل `external` الخاصية target بالقيمة _blank، ويضيف noopener وnoreferrer إلى قيمة rel التي كُتب بها عنصر الرابط. ويزيل المُدخل `disabled` الخاصية `href`، ويكتب `role="link"` و`aria-disabled="true"` والخاصية tabindex بالقيمة -1، ويلغي النقر والنقر المساعد قبل أن يصلا إلى المتصفح أو إلى توجيه المسارات أو إلى مستمع في التطبيق، ويعيد آخر قيمة كُتبت لـ`href` عند انتهاء `disabled`. ودون هذه المُدخلات لا يكتب التوجيه أيًّا من هذه الخصائص، فتبقى الخصائص aria-current وtarget وrel التي يكتبها التطبيق. ويكتب المُدخل `variant` الخاصية `data-variant`، ودونه لا تُكتب أي خاصية.

## إمكانية الوصول

الرابط عنصر رابط أصلي، فيوفّر المتصفح دوره، وموضعه في ترتيب التنقل بالمفتاح Tab، وتفعيله بالمفتاح <kbd>Enter</kbd>، وقائمة السياق الخاصة بالروابط. ونص الرابط هو اسمه الميسّر؛ فاكتب نصًا يسمّي الوجهة، وتجنّب «انقر هنا» وتكرار «اقرأ المزيد» في القائمة الواحدة.

- الرابط الافتراضي مسطَّر، فلا يكون اللون وحده ما يدل عليه. ويزيل الشكلان المحايد والمستقل التسطير في حالتهما العادية، فاستخدمهما عندما يدل الموضع أو السياق المحيط على الرابط.
- لكل رابط مؤشر تركيز ظاهر بسماكة 2px، ومنه الرابط الذي يحتوي على أيقونة.
- الرابط المعطَّل ليس عنصر تحكم معطَّلًا أصليًا. وليس لصيغة الرابط المعطَّل `href`، فلا يتوقف عندها التنقل بالمفتاح Tab، وتحتفظ بالخاصيتين `role="link"` و`aria-disabled="true"` لتعلن التقنيات المساعدة أنه غير متاح. واذكر في النص سبب عدم إتاحته عندما يفيد ذلك القارئ.
- تدل الخاصية `aria-current="page"` على الرابط إلى الصفحة الحالية. فلا تضبطها على أكثر من رابط واحد في مجموعة الروابط.
- تمنح ورقة الأنماط الرابط الافتراضي الذي سبقت زيارته لونًا خاصًا به. ويحتفظ الرابط `neutral` أو `subtle` الذي سبقت زيارته بلونه في الحالة العادية، فلا تعتمد على لون الزيارة لتبيّن للقارئ أي هذه الروابط فتحها. وفي وضع الألوان القسرية تستخدم ورقة الأنماط ألوان الروابط في النظام.

## الاتجاه والتوطين

ليس في الرابط نص مدمج: يكتب التطبيق نص الرابط، وأي نص يخبر القارئ بأن الرابط يُفتح في علامة تبويب جديدة، بلغة الصفحة. ويرث عنصر الرابط لغة الصفحة واتجاهها، وتعرض ورقة الأنماط الرابط الذي يحتوي على أيقونة في صف ضمن السطر بترتيب الترميز، فتقع الأيقونة المكتوبة بعد النص في جهة نهاية القراءة في اتجاهَي القراءة كليهما. ويقع السهم الذي تضيفه ورقة الأنماط إلى الرابط الخارجي في جهة نهاية القراءة أيضًا.

- اضبط الخاصية hreflang على عنصر الرابط للوجهة المكتوبة بلغة غير لغة الصفحة؛ فهي خاصية أصلية وتبقى على العنصر.
- يتبع الرابط داخل الجملة اتجاه تلك الجملة. وعندما يجمع نص الرابط بين الحروف العربية واللاتينية، يرتّب المتصفح مقاطع النص بقواعده الخاصة بالنصوص المختلطة الاتجاه، فتحقّق من عرض هذا الرابط في اتجاهَي القراءة كليهما.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط الرابط بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات الروابط](../nic-links.md) ألوان الروابط، وحالات المرور بالمؤشر والضغط والزيارة والتعطيل، ومؤشر التركيز، والشكلين المحايد والمستقل، الواردة في ورقة أنماط كود المنصات المزوَّدة، وتذكر درجة الثقة في كل ربط.
- تستبدل هوية ألوان الروابط عندما يكون تباين ألوان المصدر غير كافٍ على الخلفية البيضاء أو على السطح الخافت، وتُبقي التسطير على الرابط الافتراضي داخل النص؛ وهذه التكييفات موثّقة في ملاحظات الروابط.
