---
source:
  summary: 31f82a718a64
  example: 6e4d0000540a
  api: 40756ed3b03c
  accessibility: fbbea369c1c8
  rtl-and-localisation: 0e50276f2182
  platforms-code-reference: eb6491e527ee
---
# درج التنقل

درج التنقل لوحة جانبية مشروطة تضمّ تنقل صفحات التطبيق: روابط صفحات أصلية، ومجموعات أصلية للإظهار والإخفاء، مع تمييز الصفحة الحالية. ويتألف من اللوحة الجانبية المشروطة في المكتبة، فيتبع المفتاح Escape وحصر التركيز نافذة الحوار الأصلية، ويأتي الإغلاق بالنقر على الخلفية من اللوحة الجانبية.

## مثال

يوفّر التطبيق عنوان الدرج، واسم معلَم التنقل، واسم زر الإغلاق، وقائمة البنود، وعنصر تحكم يفتح الدرج. ويكون الدرج مغلقًا في البداية. وعندما يفتحه القارئ تكون المجموعة التي تضمّ الصفحة الحالية مفتوحة.

```html live example=basic static differences=navigation-drawer-adapter-markup
<button class="hw-button" type="button" data-variant="primary" data-size="md" aria-haspopup="dialog" data-hw-dialog-open="service-menu">القائمة</button>
<dialog class="hw-dialog hw-drawer hw-navigation-drawer" id="service-menu" data-hw="navigation-drawer" data-side="start" aria-labelledby="service-menu-title">
  <header class="hw-dialog-header"><h2 id="service-menu-title">قائمة الخدمة</h2><button class="hw-button" type="button" data-variant="ghost" data-size="md" aria-label="إغلاق القائمة" data-hw-dialog-close><span class="hw-icon" data-icon="cancel-01" data-size="md" aria-hidden="true"></span></button></header>
  <div class="hw-dialog-body">
    <nav class="hw-navigation-drawer-nav" aria-label="أقسام الخدمة">
      <ul>
        <li data-hw-value="overview"><a class="hw-navigation-drawer-row" href="/service/overview"><span class="hw-navigation-drawer-label">نظرة عامة</span></a></li>
        <li data-hw-value="requests"><details class="hw-navigation-drawer-group"><summary class="hw-navigation-drawer-row"><span class="hw-navigation-drawer-label">الطلبات</span></summary><ul>
          <li data-hw-value="open-requests"><a class="hw-navigation-drawer-row" href="/service/requests/open" aria-current="page"><span class="hw-navigation-drawer-label">الطلبات المفتوحة</span></a></li>
          <li data-hw-value="closed-requests"><a class="hw-navigation-drawer-row" href="/service/requests/closed"><span class="hw-navigation-drawer-label">الطلبات المغلقة</span></a></li>
        </ul></details></li>
        <li data-hw-value="profile"><a class="hw-navigation-drawer-row" href="/service/profile"><span class="hw-navigation-drawer-label">الملف الشخصي</span></a></li>
      </ul>
    </nav>
  </div>
</dialog>
```

```tsx live example=basic
<NavigationDrawer
  title="قائمة الخدمة"
  navigationLabel="أقسام الخدمة"
  closeLabel="إغلاق القائمة"
  trigger={<Button variant="primary">القائمة</Button>}
  items={[
    { id: 'overview', label: 'نظرة عامة', href: '/service/overview' },
    { id: 'requests', label: 'الطلبات', children: [
      { id: 'open-requests', label: 'الطلبات المفتوحة', href: '/service/requests/open', current: true },
      { id: 'closed-requests', label: 'الطلبات المغلقة', href: '/service/requests/closed' },
    ] },
    { id: 'profile', label: 'الملف الشخصي', href: '/service/profile' },
  ]}
/>
```

```vue live example=basic
<NavigationDrawer
  title="قائمة الخدمة"
  navigation-label="أقسام الخدمة"
  close-label="إغلاق القائمة"
  :items="[
    { id: 'overview', label: 'نظرة عامة', href: '/service/overview' },
    { id: 'requests', label: 'الطلبات', children: [
      { id: 'open-requests', label: 'الطلبات المفتوحة', href: '/service/requests/open', current: true },
      { id: 'closed-requests', label: 'الطلبات المغلقة', href: '/service/requests/closed' },
    ] },
    { id: 'profile', label: 'الملف الشخصي', href: '/service/profile' },
  ]"
>
  <template #trigger="{ open }"><Button variant="primary" aria-haspopup="dialog" @click="open">القائمة</Button></template>
</NavigationDrawer>
```

```ts live example=basic framework=angular
import { Component } from '@angular/core';
import { HwButtonDirective, HwNavigationDrawerComponent, type HwNavigationDrawerItem } from '@hawiyah/angular';

@Component({
  selector: 'app-basic-example',
  imports: [HwButtonDirective, HwNavigationDrawerComponent],
  template: `<button hwButton variant="primary" aria-haspopup="dialog" (click)="menuOpen = true">القائمة</button>
<hw-navigation-drawer
  title="قائمة الخدمة"
  navigationLabel="أقسام الخدمة"
  closeLabel="إغلاق القائمة"
  [items]="pages"
  [(open)]="menuOpen"
/>`,
})
export class BasicExample {
  menuOpen = false;
  pages: HwNavigationDrawerItem[] = [
    { id: 'overview', label: 'نظرة عامة', href: '/service/overview' },
    { id: 'requests', label: 'الطلبات', children: [
      { id: 'open-requests', label: 'الطلبات المفتوحة', href: '/service/requests/open', current: true },
      { id: 'closed-requests', label: 'الطلبات المغلقة', href: '/service/requests/closed' },
    ] },
    { id: 'profile', label: 'الملف الشخصي', href: '/service/profile' },
  ];
}
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createNavigationDrawer

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `navigationLabel` | `string` | `false` | — |
| `closeOnBackdrop` | `boolean` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |

تهيّئ الدالة `createNavigationDrawer(dialog, options)` عنصر `dialog` أصليًا يحمل `data-hw="navigation-drawer"`، وتهيّئ الدالة `enhance()` كل عنصر من هذا النوع. وتعمل الدالة على ترميز يملكه التطبيق، ولا تعرض مصفوفة من البنود. ويحتاج عنصر الحوار إلى اسم ميسّر وإلى عنصر `nav` خاص به بالصنف `hw-navigation-drawer-nav`، يضمّ قوائم وروابط أصلية ومجموعات `details` اختيارية. استخدم الصنف `hw-navigation-drawer-row` للصفوف، والصنف `hw-navigation-drawer-group` لعناصر الإظهار والإخفاء. ويضيف المتحكم الأصناف `hw-dialog` و`hw-drawer` و`hw-navigation-drawer` والخاصية `data-side="start"` عندما تغيب. ويسمّي الخيار `navigationLabel` عنصر `nav`؛ وعندما يغيب الخيار يبقى الاسم المكتوب في الترميز. والخياران `closeOnBackdrop` و`onOpenChange` خياران للوحة الجانبية التي يوسّعها المتحكم. ويتيح المتحكم المُرجَع `open` و`show(trigger)` و`close(returnValue)` و`refresh()` و`destroy()`. ويفتح عنصر التحكم الذي يحمل `data-hw-dialog-open` عنصر الحوار الذي يساوي `id` الخاص به قيمةَ هذه الخاصية، فيحتاج عنصر الحوار إلى `id`؛ ويغلقه عنصر التحكم الذي يحمل `data-hw-dialog-close` داخله. وفي كل مرة يُعرض فيها الدرج تُفتح المجموعة التي تضمّ `a[aria-current="page"]`، وتعيد `refresh()` حساب المجموعات ما دام الدرج مفتوحًا. والبند المعطَّل عنصر `span` يحمل `aria-disabled="true"`؛ ويزيل المتحكم `href` وموضع التوقف بالمفتاح Tab من البند ومن عناصر التحكم داخله، ويجعل عناصر التحكم الداخلية هذه خاملة، وتعيد `destroy()` الخصائص الأصلية. ويغلق النقر على رابط الدرجَ، إلا إذا مُنع النقر أو صاحبه مفتاح تعديل، أو كان الرابط يفتح سياق تصفح آخر أو يُنزّل ملفًا.

### React

جدول: خصائص NavigationDrawer

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `items` | `readonly NavigationDrawerItem[]` | `true` | — |
| `navigationLabel` | `string` | `true` | — |
| `userContent` | `ReactNode` | `false` | — |
| `side` | `'start' \| 'end'` | `false` | `'start'` |
| `footer` | `ReactNode \| ((context: { close: () => void }) => ReactNode)` | `false` | — |
| `title` | `ReactNode` | `true` | — |
| `open` | `boolean` | `false` | — |
| `defaultOpen` | `boolean` | `false` | — |
| `onOpenChange` | `(open: boolean) => void` | `false` | — |
| `description` | `ReactNode` | `false` | — |
| `trigger` | `ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>` | `false` | — |
| `closeOnBackdrop` | `boolean` | `false` | — |
| `closeLabel` | `string` | `true` | — |

الخاصية `items` هي القائمة: لكل `NavigationDrawerItem` الحقلان `id` و`label`، والحقول الاختيارية `href` و`icon` و`current` و`disabled` و`expanded` و`children`. والبند الذي يحمل `href` رابط، والبند الذي يحمل `children` مجموعة، والبند المعطَّل نص. وتُعرض المجموعة مفتوحة عندما تضمّ الصفحة الحالية أو عندما تكون قيمة `expanded` فيها `true`، ويبقى ما يفتحه القارئ أو يغلقه من المجموعات على حاله إلى أن تتغيّر هذه القيمة. وتسمّي الخاصية `navigationLabel` معلَم التنقل، وتسمّي الخاصية `closeLabel` زر الإغلاق؛ وكلتاهما مطلوبة، والخاصية `title` مطلوبة أيضًا. استخدم `open` مع `onOpenChange` لدرج متحكَّم فيه، و`defaultOpen` لدرج غير متحكَّم فيه. والخاصية `trigger` عنصر يفتح الدرج، ويتلقّى الخاصية `aria-haspopup`. ويُعرض `userContent` قبل القائمة، ويُعرض `footer` بعدها، إما محتوى وإما دالة تتلقّى كائن سياق فيه دالة تغلق الدرج. ويقع الدرج في جهة البداية المنطقية ما لم تكن قيمة `side` هي `'end'`. وتغلق الخاصية `closeOnBackdrop` الدرج عند النقر خارجه.

### Vue

جدول: خصائص NavigationDrawer وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `title` | prop | `string` | `true` | — |
| `items` | prop | `readonly NavigationDrawerItem[]` | `true` | — |
| `navigationLabel` | prop | `string` | `true` | — |
| `closeLabel` | prop | `string` | `true` | — |
| `open` | prop | `boolean` | `false` | — |
| `defaultOpen` | prop | `boolean` | `false` | `false` |
| `closeOnBackdrop` | prop | `boolean` | `false` | `true` |
| `side` | prop | `'start' \| 'end'` | `false` | `'start'` |
| `description` | prop | `string` | `false` | — |
| `update:open` | event | `(value: boolean) => void` | `false` | — |
| `trigger` | slot | — | `false` | — |
| `footer` | slot | — | `false` | — |
| `user` | slot | — | `false` | — |

تربط الخاصية `open` مع الحدث `update:open` حالة الدرج، وتضبط الخاصية `defaultOpen` الحالة الأولية لدرج غير متحكَّم فيه. والخصائص `title` و`items` و`navigationLabel` و`closeLabel` مطلوبة. ويحمل المنفذ `trigger` العنصر الذي يفتح الدرج، ويتلقّى `{ open }`: فلا يفتح العنصر الدرج إلا عندما يستدعي `open`، لأن المنفذ لا يضيف أي معالج، ويكتب التطبيق عليه `aria-haspopup` كما يفعل في vanilla وفي Angular. ويُعرض المنفذ `user` قبل القائمة، ويُعرض المنفذ `footer` بعدها. ويغلق النقر على رابط الدرجَ، إلا إذا مُنع النقر، أو إذا سلّمته الدالة `bindLinkNavigation` من `@hawiyah/core` إلى الموجّه. وتغلق الخاصية `closeOnBackdrop` الدرج عند النقر خارجه. ويتيح المكوّن `show()` و`close()` وعنصر الحوار `element`. ويسرد الجدول المنافذ الثلاثة لأن الإصدار المنشور يقرؤها؛ ولا يعرّف التصريح نوع أي منها.

### Angular

جدول: مُدخلات hw-navigation-drawer ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `title` | input | `string` | `true` | — |
| `items` | input | `readonly HwNavigationDrawerItem[]` | `false` | `[]` |
| `titleId` | input | `string` | `false` | — |
| `navigationLabel` | input | `string` | `true` | — |
| `closeLabel` | input | `string` | `true` | — |
| `side` | input | `'start' \| 'end'` | `false` | `'start'` |
| `open` | input | `boolean` | `false` | `false` |
| `closeOnBackdrop` | input | `boolean` | `false` | `true` |
| `openChange` | output | `boolean` | `false` | — |
| `[hwNavigationDrawerUser]` | content | — | `false` | — |
| `[hwNavigationDrawerFooter]` | content | — | `false` | — |

يتألف `HwNavigationDrawerComponent` (`hw-navigation-drawer`) من اللوحة الجانبية في المكتبة، ويملك Angular ترميزه. والمُدخلات `title` و`navigationLabel` و`closeLabel` مطلوبة. اربط `[(open)]` ربطًا ثنائي الاتجاه بالحالة، واستخدم `openChange` للتغييرات؛ وليس للمكوّن عنصر فتح خاص به، فيوفّر التطبيق عنصر تحكم يضبط `open`، ويتيح المكوّن `show()` و`close()`. ويضبط `titleId` معرّف العنوان الذي يسمّي عنصر الحوار، وقيمته الافتراضية مولَّدة، فيعرض الجدول شرطة طويلة في عمود القيمة الافتراضية. ويأخذ المُدخل `items` بنودًا من النوع `HwNavigationDrawerItem`، وتكون المجموعة مفتوحة عندما تضمّ الصفحة الحالية أو عندما تكون قيمة `expanded` فيها `true`. ويُعرض المحتوى الذي يحمل `hwNavigationDrawerUser` قبل القائمة، ويُعرض المحتوى الذي يحمل `hwNavigationDrawerFooter` بعدها. ويغلق المُدخل `closeOnBackdrop` الدرج عند النقر خارجه.

## إمكانية الوصول

الدرج عنصر `dialog` أصلي مشروط يسمّيه عنوانه، وفيه زر إغلاق تسمّيه `closeLabel`. وداخله تكون القائمة معلَم `nav` تسمّيه `navigationLabel`. والبنود روابط أصلية ومجموعات `details` أصلية؛ فلا أدوار لقائمة أوامر أو شجرة أو قائمة تبويبات، ولا تركيز متنقل، ولا معالجة مخصّصة لمفاتيح الأسهم. ويحمل رابط الصفحة الحالية `aria-current="page"`. والبند المعطَّل نص يحمل `aria-disabled="true"`، ولا يقبل التركيز.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: درج التنقل

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز إلى عنصر التحكم التالي في الدرج، ويُبقي التركيز داخل الدرج. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | ينقل التركيز إلى عنصر التحكم السابق في الدرج. |
| <kbd>Enter</kbd> | ينتقل إلى وجهة الرابط الذي عليه التركيز، أو يفتح مجموعة العنصر `summary` الذي عليه التركيز أو يغلقها. |
| <kbd>Space</kbd> | يفتح مجموعة العنصر `summary` الذي عليه التركيز أو يغلقها. |
| <kbd>Escape</kbd> | يغلق الدرج ويعيد التركيز إلى عنصر التحكم الذي فتحه. |

يغلق النقر على رابط الدرجَ بعد أن يُتاح للتطبيق منعه، فيمكن التحقق من تغيير المسار أولًا. والتركيز بعد الانتقال شأن المتصفح أو موجّه التطبيق. ويبقى الدرج مفتوحًا عند النقر مع مفتاح تعديل، وعند التنزيل، وعند النقر على رابط يفتح سياق تصفح آخر.

## الاتجاه والتوطين

ليس في درج التنقل نص خاص به. يكتب التطبيق العنوان واسم المعلَم واسم زر الإغلاق وتسميات البنود بلغة الصفحة، وتبقى اللغة والاتجاه مستقلين. ويقع الدرج افتراضيًا في جهة البداية المنطقية، فتتبع جهته اتجاه الصفحة؛ وتضعه القيمة `'end'` للخاصية `side` في الجهة الأخرى. وتستخدم الصفوف خصائص CSS المنطقية لحشوتها ولمؤشر الصفحة الحالية.

- يتبع عنصر الإظهار والإخفاء في المجموعة والصفوف المتداخلة اتجاه القراءة.
- اكتب التسميات بلغة الصفحة؛ فالمكوّن لا يترجمها ولا يعيد ترتيبها.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط درج التنقل بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- تربط [ملاحظات درج التنقل](../navigation-drawer.md) درج التنقل في تصدير Mobile Components المزوَّد، وعرضه، وارتفاع صفوفه، والصفوف المتداخلة، وحالتي التحديد والتركيز، وتسجّل المواضع التي تكيّفها فيها هوية.
- يُدرج درج التنقل في الصف Platform patterns من نطاق المكوّنات في [ملاحظات التغطية](../coverage.md).
