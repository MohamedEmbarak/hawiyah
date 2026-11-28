---
source:
  summary: f4e80ef79eb0
  example: 4cca9330f099
  variants-and-states: ce7dceb0d8e3
  api: c4989e30c61f
  accessibility: b28c94dd4671
  rtl-and-localisation: 5de3015dba73
  platforms-code-reference: 3c040b126973
---
# لوحة جانبية

اللوحة الجانبية لوحة مشروطة مبنية على العنصر الأصلي `dialog`، تُفتح عند نهاية الصفحة أو بدايتها أو أسفلها. ويفتحها التطبيق ويغلقها صراحةً.

## مثال

تحمل اللوحة الجانبية محتوى مساندًا يخصّ الصفحة الحالية، مثل تفاصيل بند واحد، دون مغادرة الصفحة. ويفتحها زر الفتح، ويسمّي العنوانُ المحتوى، ولزر الإغلاق اسم ميسّر يكتبه التطبيق. ودون جهة محدّدة تُفتح اللوحة الجانبية عند نهاية الصفحة: عند الحافة اليمنى في صفحة اتجاهها من اليسار إلى اليمين، وعند الحافة اليسرى في صفحة اتجاهها من اليمين إلى اليسار.

```html live example=basic static differences=drawer-adapter-markup
<button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-dialog-open="basic-drawer">تفاصيل الطلب</button>
<dialog class="hw-dialog hw-drawer" id="basic-drawer" data-hw="drawer" data-side="end" aria-labelledby="basic-drawer-title">
  <header class="hw-dialog-header">
    <h2 id="basic-drawer-title">تفاصيل الطلب</h2>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="إغلاق" data-hw-dialog-close><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
  </header>
  <div class="hw-dialog-body">
    <p>استُلم طلبك، وهو بانتظار المراجعة.</p>
  </div>
  <footer class="hw-dialog-footer">
    <button class="hw-button" type="button" data-variant="primary" data-size="md" data-hw-dialog-close>تم</button>
  </footer>
</dialog>
```

```tsx live example=basic
<Drawer
  title="تفاصيل الطلب"
  closeLabel="إغلاق"
  trigger={<Button variant="secondary">تفاصيل الطلب</Button>}
  footer={({ close }) => <Button variant="primary" onClick={close}>تم</Button>}
>
  <p>استُلم طلبك، وهو بانتظار المراجعة.</p>
</Drawer>
```

```vue live example=basic
<Drawer title="تفاصيل الطلب" close-label="إغلاق">
  <template #trigger="{ open }"><Button variant="secondary" @click="open">تفاصيل الطلب</Button></template>
  <p>استُلم طلبك، وهو بانتظار المراجعة.</p>
  <template #footer="{ close }"><Button variant="primary" @click="close">تم</Button></template>
</Drawer>
```

```ts live example=basic framework=angular
template: `<button hwButton variant="secondary" (click)="details.show()">تفاصيل الطلب</button>
<hw-drawer #details title="تفاصيل الطلب" closeLabel="إغلاق">
  <p>استُلم طلبك، وهو بانتظار المراجعة.</p>
  <button hwButton hwDrawerFooter variant="primary" (click)="details.close()">تم</button>
</hw-drawer>`
```

## الأشكال والحالات

### جهة البداية

تفتح القيمة `side="start"` اللوحة الجانبية عند بداية الصفحة، وهي الحافة اليسرى في صفحة اتجاهها من اليسار إلى اليمين، والحافة اليمنى في صفحة اتجاهها من اليمين إلى اليسار. استخدمها لمحتوى يتعامل معه القارئ قائمةً أو عاملَ تصفية للصفحة.

```html live example=start static differences=drawer-adapter-markup
<button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-dialog-open="start-drawer">تصفية الطلبات</button>
<dialog class="hw-dialog hw-drawer" id="start-drawer" data-hw="drawer" data-side="start" aria-labelledby="start-drawer-title">
  <header class="hw-dialog-header">
    <h2 id="start-drawer-title">تصفية الطلبات</h2>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="إغلاق" data-hw-dialog-close><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
  </header>
  <div class="hw-dialog-body">
    <p>اختر حالة الطلبات التي تريد عرضها.</p>
  </div>
</dialog>
```

```tsx live example=start
<Drawer
  side="start"
  title="تصفية الطلبات"
  closeLabel="إغلاق"
  trigger={<Button variant="secondary">تصفية الطلبات</Button>}
>
  <p>اختر حالة الطلبات التي تريد عرضها.</p>
</Drawer>
```

```vue live example=start
<Drawer side="start" title="تصفية الطلبات" close-label="إغلاق">
  <template #trigger="{ open }"><Button variant="secondary" @click="open">تصفية الطلبات</Button></template>
  <p>اختر حالة الطلبات التي تريد عرضها.</p>
</Drawer>
```

```ts live example=start framework=angular
template: `<button hwButton variant="secondary" (click)="filter.show()">تصفية الطلبات</button>
<hw-drawer #filter side="start" title="تصفية الطلبات" closeLabel="إغلاق">
  <p>اختر حالة الطلبات التي تريد عرضها.</p>
</hw-drawer>`
```

### الجهة السفلية

تفتح القيمة `side="bottom"` اللوحة الجانبية على امتداد الحافة السفلية، وبعرض الصفحة كاملًا. استخدمها في الشاشة الضيقة، عندما تترك اللوحة التي على الجانب مساحة قليلة جدًا للصفحة.

```html live example=bottom static differences=drawer-adapter-markup
<button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-dialog-open="bottom-drawer">سجل الطلب</button>
<dialog class="hw-dialog hw-drawer" id="bottom-drawer" data-hw="drawer" data-side="bottom" aria-labelledby="bottom-drawer-title">
  <header class="hw-dialog-header">
    <h2 id="bottom-drawer-title">سجل الطلب</h2>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="إغلاق" data-hw-dialog-close><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
  </header>
  <div class="hw-dialog-body">
    <p>يسرد السجل كل تغيير على طلبك بترتيب حدوثه.</p>
  </div>
</dialog>
```

```tsx live example=bottom
<Drawer
  side="bottom"
  title="سجل الطلب"
  closeLabel="إغلاق"
  trigger={<Button variant="secondary">سجل الطلب</Button>}
>
  <p>يسرد السجل كل تغيير على طلبك بترتيب حدوثه.</p>
</Drawer>
```

```vue live example=bottom
<Drawer side="bottom" title="سجل الطلب" close-label="إغلاق">
  <template #trigger="{ open }"><Button variant="secondary" @click="open">سجل الطلب</Button></template>
  <p>يسرد السجل كل تغيير على طلبك بترتيب حدوثه.</p>
</Drawer>
```

```ts live example=bottom framework=angular
template: `<button hwButton variant="secondary" (click)="history.show()">سجل الطلب</button>
<hw-drawer #history side="bottom" title="سجل الطلب" closeLabel="إغلاق">
  <p>يسرد السجل كل تغيير على طلبك بترتيب حدوثه.</p>
</hw-drawer>`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createDrawer

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `closeOnBackdrop` | `boolean` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |

تأخذ الدالة `createDrawer(dialog, options)` الخيارات نفسها التي تأخذها الدالة `createDialog` في [صفحة المكوّن: حوار](dialog.md)، وتُرجع المتحكم نفسه: `open` و`show(trigger?)` و`close(returnValue?)` و`destroy()`. وتتطلّب عنصر `dialog` أصليًا. والترميز هو الواجهة البرمجية: عنصر `dialog` بالصنفين `hw-dialog` و`hw-drawer`، وعنصر `header` بالصنف `hw-dialog-header` يحتوي على عنصر العنوان وزر الإغلاق، وعنصر `div` بالصنف `hw-dialog-body`، وعند الحاجة عنصر `footer` بالصنف `hw-dialog-footer`. وتنشئ الدالة `enhance()` المتحكم لكل عنصر يحمل `data-hw="drawer"`. ويفتح اللوحةَ زرٌّ يحمل الخاصية `data-hw-dialog-open` وقيمتها `id` اللوحة، ويغلقها عنصر داخلها يحمل الخاصية `data-hw-dialog-close`. وقيمة الخاصية `data-side` على اللوحة هي `start` أو `end` أو `bottom`؛ وتمنح ورقة الأنماط القيمتين `start` و`bottom` موضعًا خاصًا بكل منهما، ودونهما تقع اللوحة عند النهاية. والإغلاق بالنقر على الخلفية المعتمة مفعَّل ما لم تكن قيمة `closeOnBackdrop` هي `false`. وتتلقّى `onOpenChange` الحالة الجديدة، ويُرسَل الحدث `hw:change` بالحالة نفسها، وفي تفاصيله `{ open }`.

### React

جدول: خصائص Drawer

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `side` | `'start' \| 'end' \| 'bottom'` | `false` | `'end'` |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `title` | `ReactNode` | `true` | — |
| `description` | `ReactNode` | `false` | — |
| `trigger` | `ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>` | `false` | — |
| `children` | `ReactNode \| ((context: { close: () => void }) => ReactNode)` | `false` | — |
| `footer` | `ReactNode \| ((context: { close: () => void }) => ReactNode)` | `false` | — |
| `closeOnBackdrop` | `boolean` | `false` | — |
| `closeLabel` | `string` | `true` | — |

يأخذ `Drawer` خصائص `Dialog`، ويضيف الخاصية `side` التي تكتب خاصية HTML `data-side` للوحة. والخاصيتان `title` و`closeLabel` مطلوبتان: العنوان هو عنصر العنوان الذي يسمّي اللوحة، و`closeLabel` هي الاسم الميسّر لزر الإغلاق. والخاصية `trigger` عنصر واحد يشبه الزر ويفتح اللوحة. استخدم `open` مع `onOpenChange` للوحة متحكَّم فيها. وتأخذ `children` و`footer` محتوى، أو دالة تتلقّى كائن سياق فيه دالة إغلاق تُغلق اللوحة. وليس للصفين `closeOnBackdrop` و`defaultOpen` قيمة افتراضية في هذا الجدول، لأن `Drawer` يمرّرهما إلى `Dialog`؛ وتذكر [صفحة المكوّن: حوار](dialog.md) سلوكهما.

### Vue

جدول: خصائص Drawer وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `open` | prop | `boolean` | `false` | — |
| `defaultOpen` | prop | `boolean` | `false` | `false` |
| `title` | prop | `string` | `true` | — |
| `description` | prop | `string` | `false` | — |
| `closeLabel` | prop | `string` | `true` | — |
| `side` | prop | `'start' \| 'end' \| 'bottom'` | `false` | `'end'` |
| `closeOnBackdrop` | prop | `boolean` | `false` | `true` |
| `update:open` | event | `(value: boolean) => void` | `false` | — |
| `trigger` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |
| `footer` | slot | — | `false` | — |

تنطبق خصائص `Dialog`، مع إضافة الخاصية `side`. اربط حالة الفتح بالتوجيه v-model على `open`، وتجعل الخاصية `defaultOpen` اللوحة غير المتحكَّم فيها تبدأ مفتوحة. والخاصيتان `title` و`closeLabel` سلسلتان نصيتان مطلوبتان. ويتلقّى المنفذ `trigger` الكائن `{ open }`، وفيه دالة تفتح اللوحة؛ فاكتب الزر واستدعِ الدالة من معالج النقر. ويتلقّى المنفذ الافتراضي والمنفذ `footer` الكائن `{ close }`، ولا تُعرض منطقة التذييل إلا عند توفير المنفذ `footer`. ويسرد الجدول المنافذ التي يقرؤها الإصدار المنشور؛ ولا يعرّف التصريح نوع أي منها.

### Angular

جدول: مُدخلات hw-drawer ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `title` | input | `string` | `true` | — |
| `aria-label` | input | `string \| null` | `false` | `null` |
| `aria-labelledby` | input | `string \| null` | `false` | `null` |
| `aria-describedby` | input | `string \| null` | `false` | `null` |
| `titleId` | input | `string` | `false` | — |
| `open` | input | `boolean` | `false` | `false` |
| `closeLabel` | input | `string` | `true` | — |
| `closeOnBackdrop` | input | `boolean` | `false` | `true` |
| `side` | input | `'start' \| 'end' \| 'bottom'` | `false` | `'end'` |
| `openChange` | output | `boolean` | `false` | — |
| `cancelled` | output | `void` | `false` | — |
| `returnValue` | output | `string` | `false` | — |
| `*` | content | — | `false` | — |
| `[hwDrawerFooter]` | content | — | `false` | — |

يُطبَّق `HwDrawerComponent` على `hw-drawer`، ويأخذ مُدخلات `hw-dialog` ومخرجاته وطرائقه، مع إضافة المُدخل `side`. والمُدخلان `title` و`closeLabel` مطلوبان. اربط `[(open)]` ربطًا ثنائي الاتجاه بحالة الفتح، أو استدعِ طريقتَي الفتح والإغلاق في المكوّن عبر متغير مرجع القالب، كما يفعل المثال. والخصائص `aria-label` و`aria-labelledby` و`aria-describedby` المكتوبة على `hw-drawer` مُدخلات يمرّرها المكوّن إلى عنصر `dialog` الأصلي؛ وتحلّ `aria-labelledby` محلّ العنوان في الاسم. ويذهب المحتوى الذي يحمل `hwDrawerFooter` إلى التذييل، والمحتوى الآخر إلى المتن. وتُعرض منطقة التذييل دائمًا، وتخفيها ورقة الأنماط ما دام لا يُسقَط فيها شيء.

## إمكانية الوصول

تعرض اللوحة الجانبية عنصر `dialog` أصليًا وتفتحه نافذةً مشروطة، ولها سلوك الحوار الأصلي المشروط وسلوكه في التركيز: يبقى التركيز داخل اللوحة ما دامت مفتوحة، وتكون الصفحة خلفها خاملة. وتأخذ اللوحة اسمها الميسّر من عنصر العنوان. وفي React وVue وAngular تحمل اللوحة دائمًا الخاصية `aria-labelledby`، وهي تتقدّم على `aria-label`، فلا يحلّ محلّ العنوان في الاسم إلا `aria-labelledby` يكتبها التطبيق.

- يعيد إغلاق اللوحة الجانبية التركيزَ إلى العنصر الذي فتحها، إذا كان ذلك العنصر ما زال متصلًا بالصفحة.
- يحمل زر الإغلاق أيقونة دون نص، فيأتي اسمه الميسّر من التطبيق: `closeLabel` في React وVue وAngular، والخاصية `aria-label` في ترميز vanilla.
- يكون التركيز الأولي على عنصر مناسب داخل اللوحة؛ فاكتب عليه الخاصية الأصلية autofocus. وتنقل لوحات vanilla وVue وAngular التركيز إلى العنصر المعلَّم؛ وفي React لا تعرض الخاصية `autoFocus` على عنصر ابن خاصيةَ autofocus، فيقع التركيز على زر الإغلاق.
- تلغي ورقة الأنماط الحركة التي تُفتح بها اللوحة عندما يطلب القارئ تقليل الحركة.
- اللوحة الجانبية مشروطة. استخدمها لمحتوى يحتاج إليه القارئ بينما تنتظر الصفحة، ولا تستخدمها لقائمة تنقل تبقى مفتوحة بجانب الصفحة؛ فالتخطيط الجانبي في المكتبة مكوّن مستقل.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: لوحة جانبية

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd>، <kbd>Shift</kbd> + <kbd>Tab</kbd> | ينقل التركيز إلى العنصر التالي أو السابق القابل للتركيز داخل اللوحة المفتوحة، ويبقيه داخلها. |
| <kbd>Escape</kbd> | يطلب إغلاق اللوحة، ويعود التركيز إلى العنصر الذي فتحها. |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | يفعّل الزر الأصلي الذي عليه التركيز، مثل زر الفتح أو زر الإغلاق. |

## الاتجاه والتوطين

ليس في اللوحة الجانبية نص مدمج. يكتب التطبيق العنوان والوصف وإجراءات التذييل والاسم الميسّر لزر الإغلاق بلغة الصفحة. والجهات منطقية: تتبع `start` و`end` اتجاه الصفحة، فتُفتح اللوحة التي تحمل `side="end"` عند الحافة اليمنى لصفحة اتجاهها من اليسار إلى اليمين، وعند الحافة اليسرى لصفحة اتجاهها من اليمين إلى اليسار، ولا تتغيّر `bottom` بتغيّر الاتجاه.

- اكتب `closeLabel` بلغة اللوحة؛ فهو الاسم الوحيد الذي يسمعه مستخدم التقنيات المساعدة لزر الإغلاق.
- اختر الجهة بحسب معناها لا بحسب الحافة المادية، لتقع اللوحة في الجهة نفسها من ترتيب القراءة في اللغتين.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط اللوحة الجانبية بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تُدرج اللوحة الجانبية في الصف Additional interaction من نطاق المكوّنات في [ملاحظات التغطية](../coverage.md). وهي مبنية على العنصر الأصلي `dialog`.
- تسجّل [متابعة التفاعل المشروط](../dga-audit-followup.md) القاعدة التي تشترط أن تبدأ إيماءة الخلفية المعتمة في اللوحة الجانبية أو في الحوار وتنتهي خارج اللوحة نفسها.
