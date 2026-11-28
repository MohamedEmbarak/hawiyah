---
source:
  summary: 7126d751ad3e
  example: c5fbb07dc106
  api: 1c2b02b6f285
  accessibility: c528620b340b
  rtl-and-localisation: 79ca6d9b5ca1
  platforms-code-reference: 5e3a161c4cd9
---
# التنقل الجانبي

التنقل الجانبي هو قائمة صفحات درج التنقل معروضةً في الصفحة نفسها، روابطَ ومجموعاتِ إظهار وإخفاء أصلية داخل معلَم تنقل. ولا يضيف سلوكًا خاصًا به للوحة المفاتيح، ويمكن أن تغذّي مصفوفة بنود واحدة هذه القائمة ودرجًا معًا.

## مثال

يسرد التنقل أقسام خدمة. وكل بند رابط، أو مجموعة روابط، أو نص عندما لا يكون القسم متاحًا. ويميّز التطبيق الصفحة الحالية، وتُفتح المجموعة التي تحتوي عليها.

```html live example=basic static differences=side-navigation-adapter-markup
<nav class="hw-side-navigation hw-navigation-drawer-nav" data-hw="side-navigation" aria-label="أقسام الخدمة">
  <ul>
    <li data-hw-value="overview"><a class="hw-navigation-drawer-row" href="/service/overview"><span class="hw-navigation-drawer-label">نظرة عامة</span></a></li>
    <li data-hw-value="requests"><details class="hw-navigation-drawer-group"><summary class="hw-navigation-drawer-row"><span class="hw-navigation-drawer-label">الطلبات</span></summary><ul>
      <li data-hw-value="open-requests"><a class="hw-navigation-drawer-row" href="/service/requests/open" aria-current="page"><span class="hw-navigation-drawer-label">الطلبات المفتوحة</span></a></li>
      <li data-hw-value="closed-requests"><a class="hw-navigation-drawer-row" href="/service/requests/closed"><span class="hw-navigation-drawer-label">الطلبات المغلقة</span></a></li>
    </ul></details></li>
    <li data-hw-value="profile"><a class="hw-navigation-drawer-row" href="/service/profile"><span class="hw-navigation-drawer-label">الملف الشخصي</span></a></li>
    <li data-hw-value="payments"><span class="hw-navigation-drawer-row" aria-disabled="true"><span class="hw-navigation-drawer-label">المدفوعات</span></span></li>
  </ul>
</nav>
```

```tsx live example=basic
<SideNavigation
  label="أقسام الخدمة"
  items={[
    { id: 'overview', label: 'نظرة عامة', href: '/service/overview' },
    { id: 'requests', label: 'الطلبات', children: [
      { id: 'open-requests', label: 'الطلبات المفتوحة', href: '/service/requests/open', current: true },
      { id: 'closed-requests', label: 'الطلبات المغلقة', href: '/service/requests/closed' },
    ] },
    { id: 'profile', label: 'الملف الشخصي', href: '/service/profile' },
    { id: 'payments', label: 'المدفوعات', disabled: true },
  ]}
/>
```

```vue live example=basic
<SideNavigation
  label="أقسام الخدمة"
  :items="[
    { id: 'overview', label: 'نظرة عامة', href: '/service/overview' },
    { id: 'requests', label: 'الطلبات', children: [
      { id: 'open-requests', label: 'الطلبات المفتوحة', href: '/service/requests/open', current: true },
      { id: 'closed-requests', label: 'الطلبات المغلقة', href: '/service/requests/closed' },
    ] },
    { id: 'profile', label: 'الملف الشخصي', href: '/service/profile' },
    { id: 'payments', label: 'المدفوعات', disabled: true },
  ]"
/>
```

```ts live example=basic framework=angular
import { Component } from '@angular/core';
import { HwSideNavigationComponent, type HwNavigationDrawerItem } from '@hawiyah/angular';

@Component({
  selector: 'app-basic-example',
  imports: [HwSideNavigationComponent],
  template: `<nav hwSideNavigation label="أقسام الخدمة" [items]="pages"></nav>`,
})
export class BasicExample {
  pages: HwNavigationDrawerItem[] = [
    { id: 'overview', label: 'نظرة عامة', href: '/service/overview' },
    { id: 'requests', label: 'الطلبات', children: [
      { id: 'open-requests', label: 'الطلبات المفتوحة', href: '/service/requests/open', current: true },
      { id: 'closed-requests', label: 'الطلبات المغلقة', href: '/service/requests/closed' },
    ] },
    { id: 'profile', label: 'الملف الشخصي', href: '/service/profile' },
    { id: 'payments', label: 'المدفوعات', disabled: true },
  ];
}
```

## الواجهة البرمجية

### JavaScript

جدول: خيارات createSideNavigation

| الخيار | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `label` | `string` | `false` | — |

تُحسّن الدالة `createSideNavigation(nav, options)` عنصر `nav` يحمل `data-hw="side-navigation"`، وتفعل `enhance()` ذلك لكل عنصر من هذا النوع، وتُرجع متحكمًا له العضوان `refresh()` و`destroy()`. والترميز هو قائمة درج التنقل خارج الدرج: الرابط عنصر `a.hw-navigation-drawer-row`، ويحمل رابط الصفحة الحالية `aria-current="page"`؛ والمجموعة عنصر `details.hw-navigation-drawer-group` فيه صف `summary`؛ والبند المعطَّل عنصر `span` يحمل `aria-disabled="true"` وليس له أبناء؛ والنص الآخر عنصر `span` عادي. ويسمّي الخيار `label` المعلَم عندما لا يحمل عنصر `nav` الخاصية `aria-label` ولا `aria-labelledby`؛ ويُحتفظ بالاسم الذي يكتبه المطوّر، وعند غياب أي اسم لا يكتب المتحكم اسمًا، ويعرض تحذيرًا في أثناء التطوير. وتجعل الخاصية `data-sticky="true"` التنقل مثبَّتًا ابتداءً من العرض 64rem، ويوثّق ملف README للحزمة خصائص CSS المخصّصة التي تضبط موضعه. ويفتح المتحكم كل مجموعة تحتوي على `a[aria-current="page"]`، ويعدّ الخاصية `open` التي يكتبها المطوّر حالةَ الفتح التي اختارها التطبيق للمجموعة، ويزيل `href` وموضع التنقل بالمفتاح Tab من الصفوف المعطَّلة. ولا يضيف أي مستمع، ولا يُرسل أي حدث. وبعد أن ينقل التطبيق `aria-current`، يفتح `refresh()` المجموعة التي صارت تحتوي على الصفحة الحالية، ويعيد المجموعة التي لم تعد تحتوي عليها إلى حالتها التي كتبها المطوّر. ويعيد `destroy()` الخصائص التي كتبها المطوّر.

### React

جدول: خصائص SideNavigation

| الخاصية | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- |
| `items` | `readonly NavigationDrawerItem[]` | `true` | — |
| `sticky` | `boolean` | `false` | `false` |
| `aria-label` | `string` | `false` | — |
| `aria-labelledby` | `string` | `false` | — |
| `label` | `string` | `false` | — |

الخاصية `items` مطلوبة. ولكل `NavigationDrawerItem` الحقلان `id` و`label`، والحقول الاختيارية `href` و`icon` و`current` و`disabled` و`expanded` و`children`؛ و`SideNavigationItem` هو النوع نفسه. والبند الذي يحمل `href` رابط، والبند الذي يحمل `children` مجموعة، والبند المعطَّل نص، والمجموعة التي لها `href` خاص بها تكرّره رابطًا أول داخلها. ويميّز التطبيق الصفحة الحالية عبر `current` عند كل تغيير في المسار. وتُعرض المجموعة مفتوحة عندما تكون قيمة `expanded` هي true أو عندما تحتوي على الرابط الحالي؛ ولا تُكتب `open` من جديد إلا عندما تتغيّر هذه القيمة، فيبقى ما فتحه القارئ من المجموعات أو أغلقه على حاله. وتسمّي الخاصية `label` المعلَم، وتسمّيه `aria-label` أو `aria-labelledby` بدلًا منها. وتكتب الخاصية `sticky` القيمة `data-sticky="true"`.

### Vue

جدول: خصائص SideNavigation وأحداثه ومنافذه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `items` | prop | `readonly NavigationDrawerItem[]` | `true` | — |
| `label` | prop | `string` | `false` | — |
| `sticky` | prop | `boolean` | `false` | `false` |

الخاصية `items` مطلوبة، ولها نموذج البنود في درج التنقل؛ وميّز الصفحة الحالية عبر `current` عند كل تغيير في المسار. والبند المعطَّل نص يحمل `aria-disabled="true"`، ولا يُعرض أبناؤه، والبند الذي له أبناء مجموعة، والمجموعة التي لها `href` خاص بها تكرّر نفسها رابطًا أول داخلها. وتكون المجموعة مفتوحة عندما تحتوي على الصفحة الحالية أو عندما تكون قيمة حقلها `expanded` هي true، ويبقى ما فتحه القارئ من المجموعات أو أغلقه على حاله حتى تتغيّر هذه القيمة. وتسمّي الخاصية `label` المعلَم، أو تسمّيه `aria-label` أو `aria-labelledby`. وتكتب الخاصية `sticky` القيمة `data-sticky="true"`. ولا يصرّح المكوّن بأي حدث ولا بأي منفذ.

### Angular

جدول: مُدخلات hw-side-navigation ومخرجاته ومحتواه

| الاسم | الفئة | النوع | مطلوب | القيمة الافتراضية |
| --- | --- | --- | --- | --- |
| `items` | input | `readonly HwNavigationDrawerItem[]` | `true` | — |
| `label` | input | `string` | `false` | `''` |
| `sticky` | input | `boolean` | `false` | `false` |

يُطبَّق `HwSideNavigationComponent` على `hw-side-navigation` وعلى `nav[hwSideNavigation]`. والمُدخل `items` مطلوب؛ و`HwSideNavigationItem` هو النوع نفسه `HwNavigationDrawerItem`، فيمكن أن تغذّي مصفوفة واحدة التنقل الجانبي والدرج. ويميّز التطبيق الصفحة الحالية عبر `current` عند كل تغيير في المسار، وتكون المجموعة مفتوحة عندما تكون قيمة `expanded` هي true أو عندما يكون رابط داخلها هو الصفحة الحالية. والمُدخل `label` هو الاسم الميسّر للمعلَم؛ ويمكن أن يحمل العنصر `aria-label` أو `aria-labelledby` بدلًا منه. ويحمل العنصر المضيف الصنفين `hw-side-navigation` و`hw-navigation-drawer-nav`، ليكون المربع المثبَّت ابنًا لعمود التطبيق، ويأخذ `hw-side-navigation` الخاصية `role="navigation"`، ولا يحتاج إليها `nav[hwSideNavigation]`. ويكتب المُدخل `sticky` القيمة `data-sticky="true"`. وليس للمكوّن مُخرج، لأن البنود روابط.

## إمكانية الوصول

القائمة معلَم `nav` يضمّ روابط أصلية ومجموعات `details` أصلية. ويحتاج المعلَم إلى اسم، لأن الصفحة يمكن أن تضمّ أكثر من تنقل. ويحمل رابط الصفحة الحالية `aria-current="page"`، وتكون المجموعة التي تحتوي عليه مفتوحة. والبند المعطَّل نص يحمل `aria-disabled="true"`، وليس رابطًا، وليس له موضع في ترتيب التنقل بالمفتاح Tab.

ليس في التنقل الجانبي دور شجرة، ولا تركيز متنقل، ولا تعامل مع مفاتيح الأسهم، فالمفاتيح هي مفاتيح العناصر الأصلية.

جدول: التفاعل من لوحة المفاتيح مع المكوّن: التنقل الجانبي

| المفتاح | الإجراء |
| --- | --- |
| <kbd>Tab</kbd> | ينقل التركيز إلى عنصر الملخص أو الرابط التالي، بترتيب المستند. |
| <kbd>Shift</kbd> + <kbd>Tab</kbd> | ينقل التركيز إلى عنصر الملخص أو الرابط السابق. |
| <kbd>Enter</kbd> | يتبع الرابط الذي عليه التركيز، أو يفتح مجموعة عنصر الملخص الذي عليه التركيز أو يغلقها. |
| <kbd>Space</kbd> | يفتح مجموعة عنصر الملخص الذي عليه التركيز أو يغلقها. |

يميّز التطبيق الصفحة الحالية عند كل تغيير في المسار. وبعد أن ينقل برنامج نصي `aria-current` في ترميز vanilla، يفتح استدعاء `refresh()` المجموعة التي تحتوي على الصفحة الحالية الجديدة، ويمرّر الرابط الحالي الجديد حتى يظهر؛ وتعود المجموعة التي لم تعد تحتوي على الصفحة الحالية إلى حالتها التي كتبها المطوّر، وتبقى كل مجموعة أخرى كما تركها القارئ. ولا يمرّر متحكم vanilla إلا عند إنشائه وفي `refresh()`. وفي كل المحوّلات يُمرَّر الرابط الحالي حتى يظهر داخل منطقة التمرير في التنقل؛ ولا تُمرَّر الصفحة، ولا ينتقل التركيز.

## الاتجاه والتوطين

ليس في التنقل الجانبي نص مدمج. يكتب التطبيق بلغة الصفحة اسم المعلَم وتسميات البنود وأيقونات الحزم التي يسمّيها البند عبر `icon`. ويتبع التنقل اتجاه الصفحة، وتستخدم صفوفه ومسافته البادئة وعلامات الإظهار والإخفاء فيه خصائص CSS المنطقية.

- اكتب التسميات بلغة الصفحة؛ فالمكوّن لا يترجمها ولا يعيد ترتيبها.
- أبقِ ترتيب البنود نفسه في اتجاهَي القراءة كليهما؛ فالقائمة تُقرأ من بداية السطر.

## مرجع كود المنصات

هوية مكتبة مكوّنات واجهات مبنية للامتثال لكود المنصات الصادر عن هيئة الحكومة الرقمية، وليست منتجًا رسميًا للهيئة، ولا تحمل أي شهادة اعتماد. يذكر هذا القسم مصادر ربط التنقل الجانبي بكود المنصات؛ وتسرد لوحة الأدلة بعده أدلة التحقق التي يسجّلها components.json والبنود التي ما زالت مفتوحة.

### المصادر

- يُدرج التنقل الجانبي في الصف Platform patterns من نطاق المكوّنات في [ملاحظات التغطية](../coverage.md)، وتذكر الملاحظات أنه يعرض قائمة درج التنقل خارج الدرج من البنود نفسها.
- تصف [ملاحظات درج التنقل](../navigation-drawer.md) نموذج البنود والمجموعات الأصلية وقاعدة المجموعة المفتوحة، ويعرض التنقل الجانبي القائمة نفسها.
