---
source:
  summary: cfb87035d7d4
  example: 631c67fb0d7d
  api: c297fe6d16bf
  accessibility: 7ba0c55afde8
  rtl-and-localisation: 89c7f25070f5
  platforms-code-reference: 591c9a31bc95
---
# عرض شجري

العرض الشجري شجرة من البنود المتداخلة يُحدَّد فيها بند واحد، مثل مجلدات ملف المعاملة ومستنداته، يتنقّل فيها القارئ بلوحة المفاتيح ويوسّعها أو يطويها مستوًى بعد مستوى. والشجرة قائمة واحدة مسطّحة من بنود الشجرة في كل المحوّلات، ويسمّي التطبيق زر التبديل في كل فرع.

## مثال

للشجرة اسم يذكر ما تسرده. ويوفّر التطبيق أسماء زرَّي التوسيع والطيّ، فيُعلن قارئ الشاشة الفرع الذي يفتحه كل زر. ويبدأ المثال والفرعان موسَّعان وبند واحد محدَّد.

```html live example=basic static differences=tree-view-adapter-markup
<ul class="hw-tree-view" data-hw="tree-view" aria-label="مجلدات ملف المعاملة" data-hw-expand-label="توسيع {label}" data-hw-collapse-label="طيّ {label}">
  <li class="hw-tree-item" role="treeitem" aria-level="1" aria-expanded="true" data-hw-value="documents"><button class="hw-tree-toggle" type="button" data-hw-tree-toggle><span class="hw-icon" data-size="sm" aria-hidden="true" data-icon="minus-sign"></span></button><span data-hw-tree-label>المستندات</span></li>
  <li class="hw-tree-item" role="treeitem" aria-level="2" aria-selected="true" data-hw-value="application-form"><span data-hw-tree-label>نموذج الطلب</span></li>
  <li class="hw-tree-item" role="treeitem" aria-level="2" data-hw-value="supporting-letter"><span data-hw-tree-label>خطاب داعم</span></li>
  <li class="hw-tree-item" role="treeitem" aria-level="1" aria-expanded="true" data-hw-value="messages"><button class="hw-tree-toggle" type="button" data-hw-tree-toggle><span class="hw-icon" data-size="sm" aria-hidden="true" data-icon="minus-sign"></span></button><span data-hw-tree-label>الرسائل</span></li>
  <li class="hw-tree-item" role="treeitem" aria-level="2" data-hw-value="decision-notice"><span data-hw-tree-label>إشعار القرار</span></li>
</ul>
```

```tsx live example=basic
<TreeView
  label="مجلدات ملف المعاملة"
  items={[
    { id: 'documents', label: 'المستندات', children: [
      { id: 'application-form', label: 'نموذج الطلب' },
      { id: 'supporting-letter', label: 'خطاب داعم' },
    ] },
    { id: 'messages', label: 'الرسائل', children: [
      { id: 'decision-notice', label: 'إشعار القرار' },
    ] },
  ]}
  defaultExpanded={['documents', 'messages']}
  defaultValue="application-form"
  getExpandLabel={(node) => `توسيع ${node.label}`}
  getCollapseLabel={(node) => `طيّ ${node.label}`}
/>
```

```vue live example=basic
<TreeView
  label="مجلدات ملف المعاملة"
  :items="[
    { id: 'documents', label: 'المستندات', children: [
      { id: 'application-form', label: 'نموذج الطلب' },
      { id: 'supporting-letter', label: 'خطاب داعم' },
    ] },
    { id: 'messages', label: 'الرسائل', children: [
      { id: 'decision-notice', label: 'إشعار القرار' },
    ] },
  ]"
  :default-expanded="['documents', 'messages']"
  default-value="application-form"
  :get-expand-label="(node) => `توسيع ${node.label}`"
  :get-collapse-label="(node) => `طيّ ${node.label}`"
/>
```

```ts live example=basic framework=angular
import { Component } from '@angular/core';
import { HwTreeViewComponent, type HwTreeNode } from '@hawiyah/angular';

@Component({
  selector: 'app-basic-example',
  imports: [HwTreeViewComponent],
  template: `<hw-tree-view
    label="مجلدات ملف المعاملة"
    [items]="items"
    [expanded]="['documents', 'messages']"
    value="application-form"
    [getExpandLabel]="expandLabel"
    [getCollapseLabel]="collapseLabel"
  />`,
})
export class BasicExample {
  items: HwTreeNode[] = [
    { id: 'documents', label: 'المستندات', children: [
      { id: 'application-form', label: 'نموذج الطلب' },
      { id: 'supporting-letter', label: 'خطاب داعم' },
    ] },
    { id: 'messages', label: 'الرسائل', children: [
      { id: 'decision-notice', label: 'إشعار القرار' },
    ] },
  ];
  expandLabel = (node: HwTreeNode) => `توسيع ${node.label}`;
  collapseLabel = (node: HwTreeNode) => `طيّ ${node.label}`;
}
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createTreeView

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `value` | `string` | `false` | — |
| `expanded` | `readonly string[]` | `false` | — |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `onExpandedChange` | `(expanded: string[]) => void` | `false` | — |
| `getExpandLabel` | `(node: TreeViewNode) => string` | `false` | — |
| `getCollapseLabel` | `(node: TreeViewNode) => string` | `false` | — |

تُحسّن الدالة `createTreeView(root, options)` عنصرًا يحمل `data-hw="tree-view"`، وتفعل `enhance()` ذلك لكل عنصر من هذا النوع، وتُرجع متحكمًا له الأعضاء `value` و`expanded` و`select(value)` و`toggle(value)` و`focus(value)` و`destroy()`. والترميز قائمة واحدة مسطّحة: كل بند عنصر `li` يحمل `role="treeitem"` والصنف `hw-tree-item` وقيمة فريدة لـ`data-hw-value` والخاصية `aria-level`، ويُكتب البند الأب قبل أبنائه؛ ولا يحتوي البند أبدًا على بنوده الأبناء، ويُطلق المتحكم استثناءً إذا احتوى عليها. ويضمّ الفرع عنصر `button` بالصنف `hw-tree-toggle` والخاصية `data-hw-tree-toggle`، ثم التسمية في عنصر يحمل `data-hw-tree-label`، وهي التي تسمّي البند. ويضبط المتحكم `aria-level` و`aria-posinset` و`aria-setsize` و`aria-selected` و`--hw-tree-depth` والخاصية `hidden` لصفوف الفرع المطويّ، ويُخرج زر التبديل من ترتيب التنقل بالمفتاح Tab. سمِّ الشجرة بالخاصية `aria-label` على الجذر. وسمِّ كل زر تبديل بالدالتين `getExpandLabel` و`getCollapseLabel`، أو بالخاصيتين `data-hw-expand-label` و`data-hw-collapse-label` على الجذر، ويحلّ فيهما `{label}` محلّ تسمية البند. ويضبط الخياران `value` و`expanded` التحديد الأولي والفروع الموسَّعة في البداية؛ ودونهما يقرأ المتحكم `data-hw-value` على الجذر، وإلا فالبند الذي يحمل `aria-selected="true"`، ويقرأ `aria-expanded="true"` على الفروع. ويتلقى `onValueChange` و`onExpandedChange` كل تغيير، ويُبلغ الجذر عنه أيضًا بالحدث `hw:change`.

### React

جدول: خصائص TreeView

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `items` | `readonly TreeNode[]` | `true` | — |
| `value` | `string` | `false` | — |
| `defaultValue` | `string` | `false` | `''` |
| `onValueChange` | `(value: string) => void` | `false` | — |
| `expanded` | `readonly string[]` | `false` | — |
| `defaultExpanded` | `readonly string[]` | `false` | `[]` |
| `onExpandedChange` | `(expanded: string[]) => void` | `false` | — |
| `disabled` | `boolean` | `false` | — |
| `getExpandLabel` | `(node: TreeNode) => string` | `true` | — |
| `getCollapseLabel` | `(node: TreeNode) => string` | `true` | — |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |

الخاصية `items` هي الشجرة؛ ولكل `TreeNode` الحقل `id`، والحقل `label` وهو محتوى قابل للعرض، والحقل الاختياري `disabled`، والحقل الاختياري `children`. استخدم `value` مع `onValueChange` لتحديد متحكَّم فيه، و`defaultValue` لتحديد غير متحكَّم فيه، و`expanded` مع `onExpandedChange` لفروع متحكَّم فيها، و`defaultExpanded` لفروع غير متحكَّم فيها. والتحديد هو `id` بند واحد، والسلسلة النصية الفارغة لا تحدّد شيئًا. والخاصيتان `getExpandLabel` و`getCollapseLabel` مطلوبتان، وتسمّيان زر التبديل في كل فرع. وتحتاج الشجرة إلى اسم من `label` أو `aria-label` أو `aria-labelledby`. وتعطّل الخاصية `disabled` كل البنود. ولا ترسل الشجرة قيمة مع نموذج أصلي.

### Vue

جدول: خصائص TreeView وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly TreeNode[]` | `true` | — |
| `label` | prop | `string` | `false` | — |
| `modelValue` | prop | `string` | `false` | — |
| `defaultValue` | prop | `string` | `false` | `''` |
| `expanded` | prop | `readonly string[]` | `false` | — |
| `defaultExpanded` | prop | `readonly string[]` | `false` | — |
| `disabled` | prop | `boolean` | `false` | `false` |
| `getExpandLabel` | prop | `(node: TreeNode) => string` | `true` | — |
| `getCollapseLabel` | prop | `(node: TreeNode) => string` | `true` | — |
| `update:modelValue` | event | `(value: string) => void` | `false` | — |
| `update:expanded` | event | `(value: readonly string[]) => void` | `false` | — |

يربط `v-model` معرّف البند المحدَّد، وتربط الخاصية `expanded` مع الحدث `update:expanded` معرّفات الفروع الموسَّعة؛ وتضبط الخاصيتان `defaultValue` و`defaultExpanded` الحالة الأولية لشجرة غير متحكَّم فيها. والقيمة الافتراضية لـ`defaultExpanded` مصفوفة فارغة ينشئها الإصدار المنشور لكل مكوّن، فخانة القيمة الافتراضية لها في الجدول شرطة طويلة. ولكل `TreeNode` الحقل `id`، والحقل `label` وهو سلسلة نصية، والحقل الاختياري `disabled`، والحقل الاختياري `children`. والخاصيتان `getExpandLabel` و`getCollapseLabel` مطلوبتان، وتسمّيان أزرار التبديل. وتحتاج الشجرة إلى اسم من `label`، أو من `aria-label` أو `aria-labelledby`، وتصل هاتان الخاصيتان إلى الشجرة. وتعطّل الخاصية `disabled` كل البنود. ولا يصرّح المكوّن بأي منفذ.

### Angular

جدول: مُدخلات hw-tree-view ومخرجاته ومحتواه

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
| `getExpandLabel` | input | `(node: HwTreeNode) => string` | `true` | — |
| `getCollapseLabel` | input | `(node: HwTreeNode) => string` | `true` | — |
| `items` | input | `readonly HwTreeNode[]` | `false` | `[]` |
| `expanded` | input | `readonly string[]` | `false` | `[]` |
| `direction` | input | `'ltr' \| 'rtl'` | `false` | — |
| `valueChange` | output | `string` | `false` | — |
| `focused` | output | `FocusEvent` | `false` | — |
| `blurred` | output | `FocusEvent` | `false` | — |
| `expandedChange` | output | `readonly string[]` | `false` | — |

يأخذ `HwTreeViewComponent` (`hw-tree-view`) المُدخل `items`، وكل بند فيه من النوع `HwTreeNode` له الحقلان `id` و`label`، والحقل الاختياري `disabled`، والحقل الاختياري `children`. ويربط `[(value)]` معرّف البند المحدَّد، ويربط `[(expanded)]` معرّفات الفروع الموسَّعة؛ والقيمة المكتوبة مرة واحدة هي الحالة الأولية. والمُدخلان `getExpandLabel` و`getCollapseLabel` مطلوبان، ويسمّيان أزرار التبديل. وتحتاج الشجرة إلى `label`، أو إلى `aria-label` أو `aria-labelledby` مكتوبة على `hw-tree-view`، أو إلى تسمية عنصر `hw-field` يحيط بها. ويضبط المُدخل `direction` اتجاه الشجرة المعروضة، ويُكتب في الخاصية `dir` على القائمة، ويضبط معه اتجاه القراءة لمفاتيح الأسهم. ويُبقي `readOnly` الشجرة قابلة للتركيز ولا يغيّر تحديدها، وتبقى أزرار التبديل تعمل. والمُدخلات `name` و`form` و`readOnly` و`hint` و`error` موجودة في Angular وحده في الإصدار 0.3.0.

## إمكانية الوصول

تحمل الشجرة `role="tree"`، ويحمل كل بند `role="treeitem"` مع مستواه وموضعه وعدد البنود في مجموعته، فيُعلن قارئ الشاشة موقع البند. ويُسمّى كل بند بتسميته وحدها، وليس زر التبديل جزءًا من هذا الاسم. وزر التبديل في الفرع عنصر `button` أصلي يسمّيه `getExpandLabel` أو `getCollapseLabel`. وهو خارج ترتيب التنقل بالمفتاح Tab، ويُستخدم للتفعيل بالمؤشر وبقارئ الشاشة: يوسّع الفرع أو يطويه دون تحديد البند، ويبقى التركيز على بند الشجرة.

لا يكون في ترتيب التنقل بالمفتاح Tab إلا بند واحد في كل مرة، وتنقل مفاتيح الأسهم التركيز بين البنود الظاهرة. وبنود الفرع المطويّ غير ظاهرة، فتُتخطّى. وتتخطّى مفاتيح الأسهم و<kbd>Home</kbd> و<kbd>End</kbd> البنود المعطَّلة. ويختلف سلوك <kbd>السهم السفلي</kbd> عند آخر بند وسلوك <kbd>السهم العلوي</kbd> عند أول بند: ففي vanilla وVue وAngular ينتقل التركيز إلى الطرف الآخر، وفي React يبقى على البند.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: عرض شجري

| المفتاح | الإجراء |
| --- | --- |
| <kbd>السهم السفلي</kbd> | ينقل التركيز إلى البند الظاهر المتاح التالي. |
| <kbd>السهم العلوي</kbd> | ينقل التركيز إلى البند الظاهر المتاح السابق. |
| <kbd>Home</kbd>، <kbd>End</kbd> | ينقل التركيز إلى أول بند ظاهر متاح أو إلى آخر بند ظاهر متاح. |
| <kbd>السهم الأيمن</kbd> | في النص المكتوب من اليسار إلى اليمين، يوسّع الفرع المطويّ، وينقل التركيز من الفرع الموسَّع إلى أول بند ابن متاح فيه، ولا يفعل شيئًا على بند ليس له أبناء. |
| <kbd>السهم الأيسر</kbd> | في النص المكتوب من اليسار إلى اليمين، يطوي الفرع الموسَّع، وفي غير ذلك ينقل التركيز إلى البند الأب. |
| <kbd>Enter</kbd>، <kbd>Space</kbd> | يحدّد البند الذي عليه التركيز. |

في النص المكتوب من اليمين إلى اليسار يتبادل مفتاحا السهمين الأفقيين إجراءيهما: يوسّع <kbd>السهم الأيسر</kbd> الفرع وينتقل إلى داخله، ويطويه <kbd>السهم الأيمن</kbd> أو ينتقل إلى البند الأب. وينقل الحرف القابل للطباعة التركيز إلى البند الظاهر التالي الذي تبدأ تسميته بهذا الحرف، كما في المكوّن Menu. ويتجاهل البحث بالكتابة المفتاح المضغوط مع <kbd>Ctrl</kbd> أو <kbd>Alt</kbd> أو المفتاح Meta في كل المحوّلات. أما المفاتيح الأخرى فتختلف فيها المحوّلات في الإصدار 0.3.0: يترك vanilla وAngular للمتصفح كل اختصار فيه مفتاح تعديل، ويستجيب React وVue أيضًا إلى <kbd>Ctrl</kbd> مع مفتاح سهم أو <kbd>Home</kbd> أو <kbd>End</kbd> أو <kbd>Enter</kbd> أو <kbd>Space</kbd>، ويمنعان السلوك الافتراضي للمتصفح.

### التحديد

يضبط تحديد البند `aria-selected` عليه، ويُبلغ عن `id` الخاص به. والنقر على البند يحدّده؛ والنقر على زر التبديل يقتصر على توسيع الفرع أو طيّه. وتحدّد الشجرة بندًا واحدًا في كل مرة.

## الاتجاه والتوطين

ليس في العرض الشجري نص مدمج. يكتب التطبيق تسمية الشجرة وتسميات البنود وأسماء أزرار التبديل بلغة الصفحة. وأسماء أزرار التبديل دوال تأخذ العقدة، فيمكن أن يتضمّن كل منها تسمية بنده بلغة القارئ.

- تتبع الشجرة اتجاه الصفحة، أو اتجاه الجزء من الصفحة الذي يضبط `dir`، وتستخدم المسافة البادئة وزر التبديل خصائص CSS المنطقية.
- يتبع مفتاحا السهمين الأفقيين الاتجاه: في النص المكتوب من اليمين إلى اليسار يوسّع الفرعَ السهمُ الذي يشير إلى نهاية السطر، ويطويه السهم الذي يشير إلى بدايته.
- يقارن البحث بالكتابة الحرف المكتوب ببداية كل تسمية ظاهرة، فيلزم أن يكون النص المكتوب والتسميات بنظام الكتابة نفسه.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط العرض الشجري بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- يُدرج العرض الشجري في [ملاحظات التغطية](../coverage.md) ضمن مجموعة مكوّنات التفاعل الإضافية، وبين المكوّنات التفاعلية، وهي المكوّنات التي تطبّق لها هوية حالةً أو سلوكًا للوحة المفاتيح أو دورة حياة خاصة بها.
