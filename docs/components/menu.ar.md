---
source:
  summary: 99eb38dd10ef
  example: d2fa3955d48b
  variants-and-states: 750a0c8e3a15
  api: 1a672354d1ea
  accessibility: e38b176c1a2c
  rtl-and-localisation: e2f237a45f83
  platforms-code-reference: ba5405d30bd0
---
# قائمة إجراءات

قائمة الإجراءات زر يفتح قائمة من الإجراءات أو الروابط. وتتبع القائمة سلوك لوحة المفاتيح الخاص بالقوائم: ينتقل التركيز بين البنود بمفاتيح الأسهم، ويُغلق تفعيلُ بندٍ القائمةَ ويعيد التركيز إلى الزر.

## مثال

يسمّي المشغِّل مجموعة الإجراءات، وللقائمة اسمها الميسّر الخاص. وكل بند إجراء واحد يستطيع القارئ بدءه من هذه الصفحة.

```html live example=basic static differences=menu-adapter-markup
<div class="hw-menu" data-hw="menu">
  <button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-trigger>إجراءات الطلب</button>
  <div class="hw-menu-content" role="menu" aria-label="إجراءات الطلب" data-hw-panel hidden>
    <button class="hw-menu-item" type="button" role="menuitem" data-hw-value="edit">تعديل الطلب</button>
    <button class="hw-menu-item" type="button" role="menuitem" data-hw-value="print">طباعة إشعار التأكيد</button>
    <button class="hw-menu-item" type="button" role="menuitem" data-hw-value="withdraw">سحب الطلب</button>
  </div>
</div>
```

```tsx live example=basic
<Menu
  label="إجراءات الطلب"
  trigger={<Button variant="secondary">إجراءات الطلب</Button>}
  items={[
    { value: 'edit', label: 'تعديل الطلب' },
    { value: 'print', label: 'طباعة إشعار التأكيد' },
    { value: 'withdraw', label: 'سحب الطلب' },
  ]}
/>
```

```vue live example=basic
<Menu
  label="إجراءات الطلب"
  trigger-label="إجراءات الطلب"
  :items="[
    { value: 'edit', label: 'تعديل الطلب' },
    { value: 'print', label: 'طباعة إشعار التأكيد' },
    { value: 'withdraw', label: 'سحب الطلب' },
  ]"
/>
```

```ts live example=basic framework=angular
template: `<hw-menu
  label="إجراءات الطلب"
  triggerLabel="إجراءات الطلب"
  [items]="[
    { value: 'edit', label: 'تعديل الطلب' },
    { value: 'print', label: 'طباعة إشعار التأكيد' },
    { value: 'withdraw', label: 'سحب الطلب' },
  ]"
/>`
```

## الأشكال والحالات

### البنود المعطَّلة والروابط

يبقى البند الذي يحمل `disabled` في القائمة، لكن لا يمكن تفعيله، وتتجاوزه مفاتيح الأسهم. ويُعرض البند الذي يحمل `href` رابطًا، فيؤدي تفعيله إلى الانتقال. وتعرض المحوّلات بند الرابط المعطَّل دون `href` ومع `aria-disabled="true"`؛ ويعرض المثال بند زر معطَّلًا وبند رابط متاحًا.

```html live example=items static differences=menu-adapter-markup
<div class="hw-menu" data-hw="menu">
  <button class="hw-button" type="button" data-variant="outline" data-size="md" data-hw-trigger>إجراءات المستند</button>
  <div class="hw-menu-content" role="menu" aria-label="إجراءات المستند" data-hw-panel hidden>
    <button class="hw-menu-item" type="button" role="menuitem" data-hw-value="download">تنزيل المستند</button>
    <button class="hw-menu-item" type="button" role="menuitem" data-hw-value="replace" disabled>استبدال المستند</button>
    <a class="hw-menu-item" role="menuitem" href="/documents/history" data-hw-value="history">عرض السجل</a>
  </div>
</div>
```

```tsx live example=items
<Menu
  label="إجراءات المستند"
  trigger={<Button variant="outline">إجراءات المستند</Button>}
  items={[
    { value: 'download', label: 'تنزيل المستند' },
    { value: 'replace', label: 'استبدال المستند', disabled: true },
    { value: 'history', label: 'عرض السجل', href: '/documents/history' },
  ]}
/>
```

```vue live example=items
<Menu
  label="إجراءات المستند"
  trigger-label="إجراءات المستند"
  trigger-variant="outline"
  :items="[
    { value: 'download', label: 'تنزيل المستند' },
    { value: 'replace', label: 'استبدال المستند', disabled: true },
    { value: 'history', label: 'عرض السجل', href: '/documents/history' },
  ]"
/>
```

```ts live example=items framework=angular
template: `<hw-menu
  label="إجراءات المستند"
  triggerLabel="إجراءات المستند"
  triggerVariant="outline"
  [items]="[
    { value: 'download', label: 'تنزيل المستند' },
    { value: 'replace', label: 'استبدال المستند', disabled: true },
    { value: 'history', label: 'عرض السجل', href: '/documents/history' },
  ]"
/>`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createMenu

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `onAction` | `(value: string) => void` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |

تهيّئ الدالة `createMenu(root, options)` ترميزًا موجودًا، وتفعل الدالة `enhance()` الشيء نفسه لعنصر يحمل `data-hw="menu"`. ويحتوي الجذر على مشغِّل يحمل `data-hw-trigger` وعلى لوحة تحمل `data-hw-panel`، والبنود هي عناصر اللوحة التي تحمل `role="menuitem"`. ويضبط المتحكم `aria-haspopup` على المشغِّل والدور menu على اللوحة، ويمنح كل بند الخاصية `tabindex` بالقيمة -1، وينقل موضع التوقف في ترتيب التنقل إلى البند الذي عليه التركيز. اكتب `data-hw-value` على البند ليحمل قيمته؛ وإلا فقيمته نصه بعد حذف المسافات من طرفيه. وسمِّ اللوحة بالخاصية `aria-label` أو `aria-labelledby`. ويؤدي تفعيل بند متاح إلى نقل التركيز إلى المشغِّل، وإرسال الحدث `hw:change` مع `{ value }`، واستدعاء `onAction(value)`، ثم إغلاق القائمة واستدعاء `onOpenChange` بالقيمة `false`. ولذلك يعيد مربع الحوار الذي يفتحه الإجراء التركيز إلى المشغِّل عند إغلاقه، ويُبقي الإجراء الذي ينقل التركيز إلى موضع آخر التركيز هناك. ويُبقي الضغط على المفتاح Escape القائمة مفتوحة إذا ألغاه التطبيق أو عنصر تحكم داخل اللوحة. ويُرجع المتحكم `open` و`show()` و`close(restore)` و`destroy()`.

### React

جدول: خصائص Menu

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `items` | `readonly MenuItem[]` | `true` | — |
| `trigger` | `ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>` | `true` | — |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | `false` |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `onAction` | `(value: string) => void` | `false` | — |
| `disabled` | `boolean` | `false` | `false` |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |

تسرد الخاصية `items` البنود. ولكل `MenuItem` قيمة `value`، و`label` قابل للعرض، ويمكن أن يحمل أيضًا `disabled` و`href` و`onSelect`؛ ويُعرض البند الذي يحمل `href` رابطًا. والخاصية `trigger` عنصر الزر الخاص بالتطبيق، ويضيف Menu إليه `aria-haspopup` و`aria-expanded` و`aria-controls`، ويضيف خاصية HTML `disabled` ما دامت الخاصية `disabled` مضبوطة، فيجب أن يمرّر المكوّنُ المخصّص المستخدَم مشغِّلًا خصائصَ الزر الأصلي وأحداثه. وتسمّي `label` أو `aria-label` أو `aria-labelledby` القائمة، ولا يُعرض الاسم على المشغِّل. وتتلقّى `onAction` قيمة البند المفعَّل. استخدم `open` مع `onOpenChange` لقائمة متحكَّم فيها، أو `defaultOpen` لقائمة غير متحكَّم فيها.

### Vue

جدول: خصائص Menu وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `false` | — |
| `triggerLabel` | prop | `string` | `false` | — |
| `triggerVariant` | prop | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'secondary'` |
| `items` | prop | `readonly MenuItem[]` | `true` | — |
| `open` | prop | `boolean` | `false` | — |
| `defaultOpen` | prop | `boolean` | `false` | `false` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `update:open` | event | `(value: boolean) => void` | `false` | — |
| `action` | event | `(value: string) => void` | `false` | — |
| `trigger` | slot | — | `false` | — |

تسمّي الخاصية `label` القائمة، ولا يُعرض الاسم على المشغِّل؛ ويمكن أن تسمّيها `aria-label` أو `aria-labelledby` بدلًا منها. والخاصية `triggerLabel` هي نص زر المشغِّل، وهو عنصر `button` أصلي بالصنف `hw-button` وبالشكل الذي تضبطه `triggerVariant`، وليس المكوّن Button؛ وهي مطلوبة ما لم يوفّر المنفذ `trigger` محتوى ذلك الزر. ويوفّر المنفذ محتوى المشغِّل لا المشغِّل نفسه، فالزر المكتوب فيه يصبح متداخلًا داخل الزر المضمّن في الحزمة. وتسرد الخاصية `items` البنود؛ ولكل `MenuItem` قيمة `value`، و`label` من نوع السلسلة النصية، ويمكن أن يحمل أيضًا `disabled` و`href`. ويُرسَل الحدث `action` مرة واحدة لكل تفعيل مع قيمة البند، ثم تُغلق القائمة وتنقل التركيز إلى المشغِّل؛ ثم يؤدي بند الرابط إلى الانتقال. استخدم `open` مع `update:open` لقائمة متحكَّم فيها، أو `defaultOpen` لقائمة غير متحكَّم فيها. ويسرد الجدول المنفذ `trigger` لأن الإصدار المنشور يقرؤه؛ ولا يعرّف التصريح نوع أي منفذ.

### Angular

جدول: مُدخلات hw-menu ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `label` | input | `string` | `false` | `''` |
| `panelId` | input | `string` | `false` | — |
| `triggerLabel` | input | `string` | `true` | — |
| `triggerVariant` | input | `'link' \| 'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft'` | `false` | `'secondary'` |
| `disabled` | input | `boolean` | `false` | `false` |
| `open` | input | `boolean` | `false` | `false` |
| `items` | input | `readonly HwMenuItem[]` | `false` | `[]` |
| `openChange` | output | `boolean` | `false` | — |
| `action` | output | `string` | `false` | — |

يعرض `HwMenuComponent` (`hw-menu`) زر المشغِّل الخاص به، ويسمّيه المُدخل المطلوب `triggerLabel`، ويضبط شكلَه المُدخل `triggerVariant`؛ والمشغِّل نص فقط في الإصدار 0.3.0. ويسرد المُدخل `items` البنود؛ ولكل `HwMenuItem` قيمة `value`، و`label` من نوع السلسلة النصية، ويمكن أن يحمل أيضًا `disabled` و`href`. ويسمّي المُدخل `label` القائمة، ولا يُعرض الاسم على المشغِّل؛ ويمكن أن تحلّ محلّه الخاصية `aria-label` أو `aria-labelledby` المكتوبة على `hw-menu`. ويُرسل المُخرج `action` قيمة البند المفعَّل مرة واحدة. ويضبط المُدخل `panelId` معرّف اللوحة؛ ودونه يُولَّد معرّف. اربط `open` و`openChange` للحالة. وعندما يضبط التطبيق `open` يصبح أول بند متاح موضعَ التوقف في ترتيب التنقل، ويأخذ التركيز بعد العرض.

## إمكانية الوصول

للوحة الدور menu واسم ميسّر، ويحمل المشغِّل `aria-haspopup` و`aria-expanded` و`aria-controls`، ولكل بند الدور menuitem. استخدم قائمة الإجراءات للأوامر والتنقل؛ وللوحات المحتوى العادي التي تضمّ عناصر تفاعلية استخدم [النافذة المنبثقة](popover.md). وقائمة الإجراءات ذات مستوى واحد: ليس فيها قوائم متداخلة.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: قائمة إجراءات

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | على المشغِّل يفتح القائمة وينقل التركيز إلى أول بند متاح، وعلى بند يفعّله ويغلق القائمة ويعيد التركيز إلى المشغِّل، وعلى بند رابط لا يفعّله المفتاح <kbd>Space</kbd> إلا في vanilla وAngular، لأن بنود React وVue تترك المفتاح للرابط الأصلي الذي يتجاهله. |
| <kbd>السهم السفلي</kbd>، <kbd>السهم العلوي</kbd> | على المشغِّل يفتح القائمة على أول بند متاح أو آخره، وفي القائمة ينقل التركيز إلى البند المتاح التالي أو السابق. |
| <kbd>Home</kbd>، <kbd>End</kbd> | ينقل التركيز إلى أول بند متاح أو آخره. |
| <kbd>Escape</kbd> | يغلق القائمة ويعيد التركيز إلى المشغِّل. |
| <kbd>Tab</kbd> | يغلق القائمة دون إعادة التركيز إلى المشغِّل، وينتقل التركيز إلى العنصر التالي في ترتيب التنقل المعتاد. |

- تنقل كتابة حرف التركيز إلى البند المتاح التالي الذي يبدأ نصه بهذا الحرف. وتكوّن الحروف المكتوبة خلال 500 ملّي ثانية بادئة واحدة، ويتنقّل تكرار الحرف نفسه بين البنود التي تبدأ به. ويحتفظ المفتاح الذي لا يطابق أي بند بإجرائه الافتراضي.
- يُغلق الضغط خارج القائمة القائمةَ دون نقل التركيز، وكذلك انتقال التركيز إلى عنصر خارجها.
- تتجاوز مفاتيحُ الأسهم والمفتاحان Home وEnd والحروفُ المكتوبة البندَ المعطَّل.
- في vanilla وAngular يكون التركيز على المشغِّل عند تنفيذ الإجراء، فيعيد مربع الحوار الذي يفتحه الإجراء التركيز إلى المشغِّل. وفي React وVue يبقى التركيز على البند المفعَّل عند تنفيذ الإجراء، وتعيد القائمة التركيز إلى المشغِّل بعده.

## الاتجاه والتوطين

لا تعرض قائمة الإجراءات أي نص خاص بها: يكتب التطبيق نص المشغِّل واسم القائمة ونصوص البنود بلغة الصفحة. وتُوضع اللوحة بخصائص CSS المنطقية، وتتبع بنودها اتجاه القراءة. وتتحرك مفاتيح الأسهم في القائمة على محور الكتلة، فيحتفظ السهم السفلي والسهم العلوي بمعناهما في صفحة من اليسار إلى اليمين وفي صفحة من اليمين إلى اليسار.

- يقارن البحث بالكتابة الحروف المكتوبة بنصوص البنود، فيتبع لغة هذه النصوص.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط قائمة الإجراءات بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تُدرج [ملاحظات التغطية](../coverage.md) قائمة الإجراءات في مجموعة مكوّنات التفاعل الإضافية من الفهرس، وتصنّفها مكوّنًا تفاعليًا تنفّذ له هوية حالة إضافية أو سلوكًا للوحة المفاتيح أو دورة حياة، بينما يترك المكوّن الأصلي التفاعل الرئيس للمتصفح.
