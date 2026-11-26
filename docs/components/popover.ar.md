---
source:
  summary: fe6117601f60
  example: 759f203a32c2
  variants-and-states: 41940cb3ea27
  api: d5c5b209498d
  accessibility: c8c47246fe9c
  rtl-and-localisation: 8d3755c54575
  platforms-code-reference: 13a39b77b579
---
# نافذة منبثقة

تعرض النافذة المنبثقة لوحة من محتوى إضافي بجوار الزر الذي يفتحها. واللوحة منطقة ذات اسم يفتحها القارئ ويغلقها؛ وليست مربع حوار مشروطًا، ولا تحبس التركيز.

## مثال

المشغِّل زر يسمّي نصُّه ما يكشفه. وللوحة اسم ميسّر يوفّره التطبيق، ومحتواها محتوى عادي من الصفحة يُوصل إليه بترتيب التنقل المعتاد بالمفتاح Tab.

```html live example=basic static differences=popover-adapter-markup
<div class="hw-popover" data-hw="popover">
  <button class="hw-button" type="button" data-variant="secondary" data-size="md" data-hw-trigger>تفاصيل الطلب</button>
  <div class="hw-popover-panel" role="region" aria-label="تفاصيل الطلب" data-hw-panel hidden>
    <p>قُدِّم الطلب، وهو بانتظار الدراسة.</p>
  </div>
</div>
```

```tsx live example=basic
<Popover label="تفاصيل الطلب" trigger={<Button variant="secondary">تفاصيل الطلب</Button>}>
  <p>قُدِّم الطلب، وهو بانتظار الدراسة.</p>
</Popover>
```

```vue live example=basic
<Popover label="تفاصيل الطلب" trigger-label="تفاصيل الطلب">
  <p>قُدِّم الطلب، وهو بانتظار الدراسة.</p>
</Popover>
```

```ts live example=basic framework=angular
template: `<hw-popover label="تفاصيل الطلب" triggerLabel="تفاصيل الطلب">
  <p>قُدِّم الطلب، وهو بانتظار الدراسة.</p>
</hw-popover>`
```

## الأشكال والحالات

### مفتوحة عند العرض الأول

تبدأ النافذة المنبثقة مفتوحة عندما يطلب التطبيق ذلك. ففي React وVue تُكتب الخاصية `defaultOpen` للوحة غير متحكَّم فيها، وفي Angular يُكتب المُدخل `open`، وتكون القيمة المكتوبة مرة واحدة هي الحالة الأولية. ويستطيع القارئ إغلاقها بالمشغِّل، أو بالمفتاح <kbd>Escape</kbd> عندما يكون التركيز داخل النافذة المنبثقة؛ ولا تأخذ النافذة المنبثقة المفتوحة عند العرض الأول التركيز. وفي ترميز vanilla لا تحمل اللوحة الخاصية `hidden`، وهذه هي حالة الفتح، ويكتب المتحكم `aria-expanded` على المشغِّل بنفسه؛ ويكتب المثال أيضًا `aria-expanded="true"`، فيكون الترميز صحيحًا قبل أن يعمل المتحكم.

```html live example=open static differences=popover-adapter-markup
<div class="hw-popover" data-hw="popover">
  <button class="hw-button" type="button" data-variant="outline" data-size="md" data-hw-trigger aria-expanded="true">مدة المعالجة</button>
  <div class="hw-popover-panel" role="region" aria-label="مدة المعالجة" data-hw-panel>
    <p>تستغرق دراسة الطلب عادةً خمسة أيام عمل.</p>
  </div>
</div>
```

```tsx live example=open
<Popover label="مدة المعالجة" defaultOpen trigger={<Button variant="outline">مدة المعالجة</Button>}>
  <p>تستغرق دراسة الطلب عادةً خمسة أيام عمل.</p>
</Popover>
```

```vue live example=open
<Popover label="مدة المعالجة" trigger-label="مدة المعالجة" trigger-variant="outline" default-open>
  <p>تستغرق دراسة الطلب عادةً خمسة أيام عمل.</p>
</Popover>
```

```ts live example=open framework=angular
template: `<hw-popover label="مدة المعالجة" triggerLabel="مدة المعالجة" triggerVariant="outline" [open]="true">
  <p>تستغرق دراسة الطلب عادةً خمسة أيام عمل.</p>
</hw-popover>`
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createPopover

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `focusOnOpen` | `boolean` | `false` | — |

تهيّئ الدالة `createPopover(root, options)` ترميزًا موجودًا، وتفعل الدالة `enhance()` الشيء نفسه لعنصر يحمل `data-hw="popover"`. ويحتوي الجذر على مشغِّل يحمل `data-hw-trigger` وعلى لوحة تحمل `data-hw-panel`؛ ويُطلق المتحكم خطأً إذا غاب أيٌّ منهما. ويضبط المتحكم `aria-controls` و`aria-expanded` على المشغِّل، ويمنح اللوحة `role="region"` إذا لم يكن لها دور، ويُظهر اللوحة أو يخفيها بالخاصية `hidden`، وتمثّل هذه الخاصية في الترميز حالتها الأولية. اكتب `aria-label` أو `aria-labelledby` على اللوحة لتسميتها. ويُغلق العنصر الذي يحمل `data-hw-close` داخل الجذر النافذة المنبثقة، ويعيد التركيز إلى المشغِّل. وينقل الخيار `focusOnOpen` التركيز إلى داخل اللوحة عند فتحها، إلى أول عنصر قابل للتركيز أو إلى اللوحة نفسها؛ ولا تفعل الشيفرة المنشورة ذلك دون هذا الخيار. وتتلقّى `onOpenChange` الحالة الجديدة، ويُرسل المتحكم التغيير نفسه في الحدث `hw:change` على الجذر مع `{ open }`. ويُرجع المتحكم `open` و`show()` و`close(restore)` و`destroy()`. وتعيد `close(true)` التركيز إلى المشغِّل، وتعيده `destroy()` إليه عندما يكون التركيز داخل اللوحة.

### React

جدول: خصائص Popover

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `trigger` | `ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>` | `true` | — |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | `false` |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `disabled` | `boolean` | `false` | `false` |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |

الخاصية `trigger` عنصر الزر الخاص بالتطبيق؛ ويضيف Popover إليه `aria-expanded` و`aria-controls`، ويضيف خاصية HTML `disabled` ما دامت الخاصية `disabled` مضبوطة، فيجب أن يمرّر المكوّنُ المخصّص المستخدَم مشغِّلًا خصائصَ الزر الأصلي وأحداثه. وتسمّي `label` أو `aria-label` أو `aria-labelledby` اللوحة؛ ولا تعرض `label` أي نص، ويُكتب العنوان الظاهر في المحتوى ويُشار إليه عبر `aria-labelledby`. استخدم `open` مع `onOpenChange` لنافذة منبثقة متحكَّم فيها، أو `defaultOpen` لنافذة غير متحكَّم فيها؛ ويُغلق المحتوى الذي داخل اللوحة النافذة المنبثقة عبر `open` المتحكَّم فيها. وتعطّل `disabled` المشغِّل وتغلق اللوحة.

### Vue

جدول: خصائص Popover وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `label` | prop | `string` | `false` | — |
| `triggerLabel` | prop | `string` | `false` | — |
| `triggerVariant` | prop | `'primary' \| 'default' \| 'secondary' \| 'outline' \| 'outline-white' \| 'light' \| 'danger' \| 'ghost' \| 'soft' \| 'link'` | `false` | `'secondary'` |
| `open` | prop | `boolean` | `false` | — |
| `defaultOpen` | prop | `boolean` | `false` | `false` |
| `disabled` | prop | `boolean` | `false` | `false` |
| `update:open` | event | `(value: boolean) => void` | `false` | — |
| `trigger` | slot | — | `false` | — |
| `default` | slot | — | `false` | — |

تسمّي الخاصية `label` اللوحة ولا تعرض أي نص؛ وتُنقل `aria-label` و`aria-labelledby` المكتوبتان على المكوّن إلى اللوحة. والخاصية `triggerLabel` هي نص زر المشغِّل، وهو عنصر `button` أصلي بالصنف `hw-button` وبالشكل الذي تضبطه `triggerVariant`، وليس المكوّن Button؛ وهي مطلوبة ما لم يوفّر المنفذ `trigger` محتوى ذلك الزر. ويوفّر المنفذ محتوى المشغِّل لا المشغِّل نفسه، فالزر المكتوب فيه يصبح متداخلًا داخل الزر المضمّن في الحزمة. استخدم `open` مع `update:open` لنافذة منبثقة متحكَّم فيها، أو `defaultOpen` لنافذة غير متحكَّم فيها؛ ويُرسَل الحدث `update:open` عندما تتغيّر الحالة. وتعطّل `disabled` المشغِّل وتغلق اللوحة المفتوحة. ويحتوي المنفذ الافتراضي على محتوى اللوحة، ويتلقّى `close`. ويسرد الجدول المنفذين لأن الإصدار المنشور يقرؤهما؛ ولا يعرّف التصريح نوع أي منهما.

### Angular

جدول: مُدخلات hw-popover ومخرجاته ومحتواه

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
| `openChange` | output | `boolean` | `false` | — |
| `*` | content | — | `false` | — |

يعرض `HwPopoverComponent` (`hw-popover`) زر المشغِّل الخاص به، ويسمّيه المُدخل المطلوب `triggerLabel`، ويضبط شكلَه المُدخل `triggerVariant`. والمشغِّل نص فقط في الإصدار 0.3.0: فلا يمكن إسقاط عنصر خاص بالتطبيق مشغِّلًا. ويسمّي المُدخل `label` اللوحة ولا يعرض أي نص؛ وهو مطلوب ما لم تُكتب الخاصية `aria-label` أو `aria-labelledby` على `hw-popover`. ويُكتب العنوان الظاهر في المحتوى ويُشار إليه عبر `aria-labelledby`. ويضبط المُدخل `panelId` معرّف اللوحة؛ ودونه يُولَّد معرّف، ولا يبقى أي معرّف على الغلاف. اربط `[(open)]` ربطًا ثنائي الاتجاه بالحالة؛ وتكون القيمة المكتوبة مرة واحدة هي الحالة الأولية. ويوضع المحتوى المُسقَط في اللوحة، ويُغلق عنصر التحكم الذي فيه النافذة المنبثقة عبر مرجع قالب: فعند كتابة `#p` على `hw-popover` يستدعي عنصر التحكم `p.close(true)`، فيعود التركيز إلى المشغِّل.

## إمكانية الوصول

اللوحة عنصر بالدور region، يأتي اسمه الميسّر من `label` أو `aria-label` أو `aria-labelledby`، ويحمل المشغِّل `aria-expanded` و`aria-controls`. والنافذة المنبثقة عنصر إظهار وإخفاء، ولا تحبس التركيز: يُوصل إلى محتواها بترتيب التنقل المعتاد، وتبقى الصفحة التي خلفها متاحة. استخدم مكوّن قائمة الإجراءات لقائمة إجراءات تتبع سلوك لوحة المفاتيح الخاص بالقوائم، واستخدم مربع حوار أصليًا للمحتوى الذي يجب أن يحتفظ بالتركيز.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: نافذة منبثقة

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | يفتح اللوحة أو يغلقها من المشغِّل، وهو زر أصلي. |
| <kbd>Tab</kbd> | ينقل التركيز بين عناصر التحكم في اللوحة المفتوحة بالترتيب المعتاد، ويغلق اللوحة عندما ينتقل التركيز إلى عنصر خارجها. |
| <kbd>Escape</kbd> | يغلق اللوحة ويعيد التركيز إلى المشغِّل. |

- لا يُغلق الضغط على المفتاح Escape النافذة المنبثقة إذا استخدمه عنصر تحكم داخل اللوحة لنفسه وألغاه.
- يُغلق الضغط خارج النافذة المنبثقة النافذةَ، ويُبقي التركيز في الموضع الذي وضعه فيه القارئ. وانتقال التركيز إلى عنصر خارج النافذة المنبثقة يغلقها، ويبقى التركيز على ذلك العنصر.
- تُخفى اللوحة بالخاصية `hidden` ما دامت مغلقة، فلا يمكن الوصول إلى محتواها.

## الاتجاه والتوطين

لا تعرض النافذة المنبثقة أي نص خاص بها: يكتب التطبيق نص المشغِّل واسم اللوحة والمحتوى بلغة الصفحة. وتضع الأنماط المضمّنة في الحزم اللوحة تحت المشغِّل، وتحاذي حافتها مع جهة البداية السطرية للمشغِّل، فتتبع اتجاه القراءة في صفحة من اليسار إلى اليمين وفي صفحة من اليمين إلى اليسار.

- لا يُعرض اسم اللوحة. والصفحة التي تعرض عنوانًا ظاهرًا في اللوحة تكتب العنوان في المحتوى، وتشير إليه عبر `aria-labelledby`.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط النافذة المنبثقة بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تُدرج [ملاحظات التغطية](../coverage.md) النافذة المنبثقة في مجموعة مكوّنات التفاعل الإضافية من الفهرس، وتذكر أنه لم تُزوَّد مكتبة مكوّنات ويب مستقلة، وأن مكوّنات القوالب المضمّنة لا تثبت تغطية كاملة.
