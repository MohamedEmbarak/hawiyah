---
source:
  summary: aeade12cdf4c
  example: 1a5afb10b509
  variants-and-states: a1a0942c746a
  api: 1671bd321132
  accessibility: e00ab3999692
  rtl-and-localisation: c5dc1735c22d
  platforms-code-reference: f3f7ea58263d
---
# حوار

الحوار نافذة مشروطة مبنية على العنصر الأصلي `dialog`، تعرض عنوانًا ومتنًا وتذييلًا اختياريًا فوق الصفحة. ويفتحها التطبيق ويغلقها صراحةً.

## مثال

يطلب الحوار من القارئ مراجعة أمر واحد أو تأكيده قبل المتابعة. ويفتحه زر الفتح، ويسمّي العنوانُ المهمة، ولزر الإغلاق اسم ميسّر يكتبه التطبيق. اختر عنوانًا قصيرًا، واقصر المتن على المعلومات التي يحتاج إليها القرار.

```html live example=basic static differences=dialog-adapter-markup
<button class="hw-button" type="button" data-variant="primary" data-size="md" data-hw-dialog-open="basic-dialog">مراجعة الطلب</button>
<dialog class="hw-dialog" id="basic-dialog" data-hw="dialog" aria-labelledby="basic-dialog-title">
  <header class="hw-dialog-header">
    <h2 id="basic-dialog-title">مراجعة الطلب</h2>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="إغلاق" data-hw-dialog-close><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
  </header>
  <div class="hw-dialog-body">
    <p>راجع تفاصيل طلبك قبل تقديمه.</p>
  </div>
  <footer class="hw-dialog-footer">
    <button class="hw-button" type="button" data-variant="primary" data-size="md" data-hw-dialog-close>تقديم الطلب</button>
  </footer>
</dialog>
```

```tsx live example=basic
<Dialog
  title="مراجعة الطلب"
  closeLabel="إغلاق"
  trigger={<Button variant="primary">مراجعة الطلب</Button>}
  footer={({ close }) => <Button variant="primary" onClick={close}>تقديم الطلب</Button>}
>
  <p>راجع تفاصيل طلبك قبل تقديمه.</p>
</Dialog>
```

```vue live example=basic
<Dialog title="مراجعة الطلب" close-label="إغلاق">
  <template #trigger="{ open }"><Button variant="primary" @click="open">مراجعة الطلب</Button></template>
  <p>راجع تفاصيل طلبك قبل تقديمه.</p>
  <template #footer="{ close }"><Button variant="primary" @click="close">تقديم الطلب</Button></template>
</Dialog>
```

```ts live example=basic framework=angular
template: `<button hwButton variant="primary" (click)="review.show()">مراجعة الطلب</button>
<hw-dialog #review title="مراجعة الطلب" closeLabel="إغلاق">
  <p>راجع تفاصيل طلبك قبل تقديمه.</p>
  <button hwButton hwDialogFooter variant="primary" (click)="review.close()">تقديم الطلب</button>
</hw-dialog>`
```

## الأشكال والحالات

### الوصف

يضيف الوصف جملة تحت العنوان، ويشير إليها الحوار وصفًا له. ويأخذه React وVue في الخاصية `description`. وفي vanilla وAngular يكتب التطبيق الفقرة ولها `id`، ويوجّه إليها `aria-describedby`.

```html live example=description static differences=dialog-adapter-markup
<button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-dialog-open="description-dialog">سحب الطلب</button>
<dialog class="hw-dialog" id="description-dialog" data-hw="dialog" aria-labelledby="description-dialog-title" aria-describedby="description-dialog-text">
  <header class="hw-dialog-header">
    <h2 id="description-dialog-title">سحب الطلب</h2>
    <button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="إغلاق" data-hw-dialog-close><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button>
  </header>
  <div class="hw-dialog-body">
    <p id="description-dialog-text">لا يمكن إعادة فتح الطلب المسحوب. ويمكنك تقديم طلب جديد في أي وقت.</p>
  </div>
</dialog>
```

```tsx live example=description
<Dialog
  title="سحب الطلب"
  closeLabel="إغلاق"
  description="لا يمكن إعادة فتح الطلب المسحوب. ويمكنك تقديم طلب جديد في أي وقت."
  trigger={<Button variant="secondary">سحب الطلب</Button>}
/>
```

```vue live example=description
<Dialog
  title="سحب الطلب"
  close-label="إغلاق"
  description="لا يمكن إعادة فتح الطلب المسحوب. ويمكنك تقديم طلب جديد في أي وقت."
>
  <template #trigger="{ open }"><Button variant="secondary" @click="open">سحب الطلب</Button></template>
</Dialog>
```

```ts live example=description framework=angular
template: `<button hwButton variant="secondary" (click)="withdraw.show()">سحب الطلب</button>
<hw-dialog #withdraw title="سحب الطلب" closeLabel="إغلاق" aria-describedby="withdraw-text">
  <p id="withdraw-text">لا يمكن إعادة فتح الطلب المسحوب. ويمكنك تقديم طلب جديد في أي وقت.</p>
</hw-dialog>`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createDialog

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `closeOnBackdrop` | `boolean` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |

تأخذ الدالة `createDialog(dialog, options)` عنصر `dialog` أصليًا، وتطرح خطأً لأي عنصر آخر. والترميز هو الواجهة البرمجية: عنصر `dialog` بالصنف `hw-dialog`، وعنصر `header` بالصنف `hw-dialog-header` يحتوي على عنصر العنوان وزر الإغلاق، وعنصر `div` بالصنف `hw-dialog-body`، وعند الحاجة عنصر `footer` بالصنف `hw-dialog-footer`. واكتب الاسم الميسّر بنفسك، مثلًا بالخاصية `aria-labelledby` التي تشير إلى عنصر العنوان. وتنشئ الدالة `enhance()` المتحكم لكل عنصر يحمل `data-hw="dialog"`. ويُرجع المتحكم `open` و`show(trigger?)` و`close(returnValue?)` و`destroy()`. وتفتح `show()` الحوار نافذةً مشروطة عبر عنصر الحوار الأصلي، وتطرح خطأً إذا لم يوفّر المتصفح هذه الطريقة؛ ويسمّي الوسيط الاختياري العنصرَ الذي يعود إليه التركيز عند إغلاق الحوار، ودونه يُستخدم العنصر الذي عليه التركيز وقت الاستدعاء. ويفتح الحوارَ زرٌّ يحمل الخاصية `data-hw-dialog-open` وقيمتها `id` الحوار، ويغلقه عنصر داخل الحوار يحمل الخاصية `data-hw-dialog-close`؛ وتُمرَّر قيمة هذه الخاصية إلى `close()` قيمةً مُرجَعة. ويحتاج الحوار إلى `id` ليعثر عليه زر الفتح. والإغلاق بالنقر على الخلفية المعتمة مفعَّل ما لم تكن قيمة `closeOnBackdrop` هي `false`؛ ولا تُغلق الإيماءة الحوار إلا إذا بدأت على الخلفية المعتمة وانتهت عليها. وتتلقّى `onOpenChange` الحالة الجديدة، ويُرسَل الحدث `hw:change` بالحالة نفسها، وفي تفاصيله `{ open }`. وتُغلق `destroy()` الحوار الذي فتحه المتحكم، وتزيل المستمعات.

### React

جدول: خصائص Dialog

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | `false` |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `title` | `ReactNode` | `true` | — |
| `description` | `ReactNode` | `false` | — |
| `trigger` | `ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>` | `false` | — |
| `children` | `ReactNode \| ((context: { close: () => void }) => ReactNode)` | `false` | — |
| `footer` | `ReactNode \| ((context: { close: () => void }) => ReactNode)` | `false` | — |
| `closeOnBackdrop` | `boolean` | `false` | `true` |
| `closeLabel` | `string` | `true` | — |

تُعرض الخاصية `title` في عنصر عنوان من المستوى الثاني يسمّي الحوار، والخاصية `closeLabel` هي الاسم الميسّر لزر الإغلاق؛ وكلتاهما مطلوبة. وتعرض الخاصية `description` فقرة في بداية المتن، ويشير إليها `aria-describedby`. والخاصية `trigger` عنصر واحد يشبه الزر؛ ويمرّر Dialog معالج `onClick` الخاص به، فيشغّل المعالج الأصلي أولًا، ولا يفتح الحوار إذا منع ذلك المعالج السلوك الافتراضي. ويضبط أيضًا الخاصية `aria-haspopup` لزر الفتح على القيمة dialog. استخدم `open` مع `onOpenChange` لحوار متحكَّم فيه، أو `defaultOpen` لحوار غير متحكَّم فيه يبدأ مفتوحًا. وتأخذ `children` و`footer` محتوى، أو دالة تتلقّى كائن سياق فيه دالة إغلاق تُغلق الحوار. وقيمة `closeOnBackdrop` هي `true` ما لم تُضبط على `false`. ويقبل Dialog أيضًا خصائص عنصر `dialog` الأصلي، ومنها `onCancel`؛ فاستدعِ فيها preventDefault على الحدث لإبقاء الحوار مفتوحًا عندما يضغط القارئ المفتاح <kbd>Escape</kbd>. وفي React لا تعرض الخاصية `autoFocus` على عنصر ابن خاصيةَ autofocus، فيُفتح الحوار والتركيز على زر الإغلاق بدلًا من العنصر المعلَّم.

### Vue

جدول: خصائص Dialog وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `open` | prop | `boolean` | `false` | — |
| `defaultOpen` | prop | `boolean` | `false` | `false` |
| `title` | prop | `string` | `true` | — |
| `description` | prop | `string` | `false` | — |
| `closeLabel` | prop | `string` | `true` | — |
| `closeOnBackdrop` | prop | `boolean` | `false` | `true` |
| `update:open` | event | `(open: boolean) => void` | `false` | — |
| `trigger` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |
| `footer` | slot | — | `false` | — |

اربط حالة الفتح بالتوجيه v-model على `open`، وتجعل الخاصية `defaultOpen` الحوار غير المتحكَّم فيه يبدأ مفتوحًا. والخاصيتان `title` و`closeLabel` سلسلتان نصيتان مطلوبتان. وتعرض الخاصية `description` فقرة في بداية المتن، ويشير إليها `aria-describedby`. ويتلقّى المنفذ `trigger` الكائن `{ open }`، وفيه دالة تفتح الحوار؛ فاكتب الزر واستدعِ الدالة من معالج النقر. ويتلقّى المنفذ الافتراضي والمنفذ `footer` الكائن `{ close }`، ولا تُعرض منطقة التذييل إلا عند توفير المنفذ `footer`. ويتيح المكوّن `element` و`show()` و`close()` عبر مرجع القالب. ويسرد الجدول المنافذ التي يقرؤها الإصدار المنشور؛ ولا يعرّف التصريح نوع أي منها.

### Angular

جدول: مُدخلات hw-dialog ومخرجاته ومحتواه

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
| `openChange` | output | `boolean` | `false` | — |
| `cancelled` | output | `void` | `false` | — |
| `returnValue` | output | `string` | `false` | — |
| `*` | content | — | `false` | — |
| `[hwDialogFooter]` | content | — | `false` | — |

يُطبَّق `HwDialogComponent` على `hw-dialog`. والمُدخل `title` هو العنوان الظاهر والاسم الميسّر الافتراضي، والمُدخل `closeLabel` يسمّي زر الإغلاق؛ وكلاهما مطلوب. اربط `[(open)]` ربطًا ثنائي الاتجاه بحالة الفتح، أو استدعِ طريقتَي الفتح والإغلاق في المكوّن عبر متغير مرجع القالب، كما يفعل المثال. والخصائص `aria-label` و`aria-labelledby` و`aria-describedby` المكتوبة على `hw-dialog` مُدخلات يمرّرها المكوّن إلى عنصر `dialog` الأصلي، ويزيلها من العنصر المضيف؛ وتحلّ `aria-labelledby` محلّ العنوان في الاسم. ولوصف الحوار، أسقِط فقرة لها `id` ووجّه إليها `aria-describedby`. ويضبط `titleId` معرّف عنصر العنوان؛ وتتقدّم قيمة التطبيق على المعرّف المولَّد. ويُرسَل المُخرج `cancelled` عندما يُغلَق الحوار بالمفتاح <kbd>Escape</kbd>، ويُرسل المُخرج `returnValue` القيمة المُرجَعة للحوار الأصلي عند إغلاقه. ويذهب المحتوى الذي يحمل `hwDialogFooter` إلى التذييل، والمحتوى الآخر إلى المتن. وتُعرض منطقة التذييل دائمًا، وتخفيها ورقة الأنماط ما دام لا يُسقَط فيها شيء؛ ولعرض التذييل بحسب شرط، ضع العنصر المعلَّم داخل ذلك الشرط.

## إمكانية الوصول

يعرض الحوار عنصر `dialog` أصليًا ويفتحه نافذةً مشروطة، فيوفّر المتصفح سلوكه المشروط: يبقى التركيز داخل الحوار ما دام مفتوحًا، وتكون الصفحة خلفه خاملة، وتعرضه الطبقة العليا فوق المحتوى الآخر. ويأخذ الحوار اسمه الميسّر من عنصر العنوان. وفي React وVue وAngular يحمل الحوار دائمًا الخاصية `aria-labelledby`، وهي تتقدّم على `aria-label`، فلا يحلّ محلّ العنوان في الاسم إلا `aria-labelledby` يكتبها التطبيق. ولا تضيف هوية حصرًا للتركيز خاصًا بها.

- يعيد إغلاق الحوار التركيزَ إلى العنصر الذي فتحه، إذا كان ذلك العنصر ما زال متصلًا بالصفحة.
- يحمل زر الإغلاق أيقونة دون نص، فيأتي اسمه الميسّر من التطبيق: `closeLabel` في React وVue وAngular، والخاصية `aria-label` في ترميز vanilla.
- يكون التركيز الأولي على عنصر مناسب داخل الحوار؛ فاكتب عليه الخاصية الأصلية autofocus. وتنقل حوارات vanilla وVue وAngular التركيز إلى العنصر المعلَّم؛ وفي React لا تعرض الخاصية `autoFocus` على عنصر ابن خاصيةَ autofocus، فيقع التركيز على زر الإغلاق.
- يجب أن تبقى النافذة المنبثقة التي تُفتح داخل الحوار، مثل قائمة أو تلميح، عنصرًا متفرّعًا من الحوار لتظهر فوقه. ويُغلق المفتاح <kbd>Escape</kbd> القائمة المفتوحة قبل أن يصل إلى الحوار.
- تلغي ورقة الأنماط الحركة التي يُفتح بها الحوار عندما يطلب القارئ تقليل الحركة.
- يقطع الحوار سير المهمة. استخدمه لتأكيد أو لمراجعة قصيرة أو لرسالة مهمة، واستخدم صفحة لإدخال البيانات المفصّلة.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: حوار

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd>، <kbd>Shift</kbd> + <kbd>Tab</kbd> | ينقل التركيز إلى العنصر التالي أو السابق القابل للتركيز داخل الحوار المفتوح، ويبقيه داخل الحوار. |
| <kbd>Escape</kbd> | يطلب إغلاق الحوار، ويعود التركيز إلى العنصر الذي فتحه. |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | يفعّل الزر الأصلي الذي عليه التركيز، مثل زر الفتح أو زر الإغلاق. |

## الاتجاه والتوطين

ليس في الحوار نص مدمج. يكتب التطبيق العنوان والوصف وإجراءات التذييل والاسم الميسّر لزر الإغلاق بلغة الصفحة. ويتبع الحوار اتجاه الصفحة، وتستخدم الأنماط المضمّنة في الحزم خصائص CSS المنطقية، فيبدأ العنوان من جهة بدء القراءة، ويقع زر الإغلاق في جهة نهايتها، في العربية وفي الإنجليزية.

- اكتب `closeLabel` بلغة الحوار؛ فهو الاسم الوحيد الذي يسمعه مستخدم التقنيات المساعدة لزر الإغلاق.
- اجعل العنوان والوصف والإجراءات بلغة واحدة، ليكون ترتيب القراءة في الحوار هو ترتيب قراءة نصه.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط الحوار بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- يُدرج الحوار في الصف Initial interaction/navigation من نطاق المكوّنات في [ملاحظات التغطية](../coverage.md). وهو مبني على العنصر الأصلي `dialog`.
- تربط [ملاحظات الإشعارات](../nic-notifications.md) حوار الإشعار المتوسّط في الصفحة (بعرض 500px، وبزوايا نصف قطرها 12px، وبشريط باللون الدلالي)، الذي يختاره الحوار الأصلي في هوية بالخاصيتين `data-variant="notification"` و`data-tone`. وتسجّل [متابعة التفاعل المشروط](../dga-audit-followup.md) القاعدة التي تشترط أن تبدأ إيماءة الخلفية المعتمة وتنتهي خارج اللوحة.
